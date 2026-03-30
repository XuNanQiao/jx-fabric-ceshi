<template>
	<div class="annotation-canvas-wrapper">
		<div
			class="canvas-container"
			ref="canvasContainer">
			<canvas ref="canvas"></canvas>
			<div
				v-if="drawingHint"
				class="drawing-hint"
				:style="{ left: hintPos.x + 'px', top: hintPos.y + 'px' }">
				{{ drawingHint }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as fabric from 'fabric';

const props = defineProps({
	videoUrl: {
		type: String,
		default: '',
	},
	currentFrame: {
		type: Number,
		default: 0,
	},
	activeTool: {
		type: String,
		default: 'select', // select, pan, rectangle, circle, point, line
	},
	annotations: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(['annotation-created', 'annotation-updated', 'annotation-deleted', 'annotation-selected']);

const canvas = ref(null);
const canvasContainer = ref(null);
const drawingHint = ref('');
const hintPos = ref({ x: 0, y: 0 });
let fabricCanvas = null;
let isDrawing = false;
let currentShape = null;
let startPoint = null;
let backgroundImage = null;
let polygonPoints = [];
let polygonLines = [];
let polygonDots = [];
let previewLine = null;
let previewPolygon = null;
let isPolygonDrawing = false;
let lastClickTime = 0;
let isPanning = false;
let lastPanPoint = null;
let labelText = null;

onMounted(() => {
	initCanvas();
	loadVideo();
});

onBeforeUnmount(() => {
	window.removeEventListener('keydown', handleKeyDown);
	if (canvas.value) {
		canvas.value.removeEventListener('contextmenu', handleContextMenu);
	}
	if (fabricCanvas) {
		fabricCanvas.dispose();
	}
});

const initCanvas = () => {
	const containerWidth = canvasContainer.value.clientWidth;
	const containerHeight = canvasContainer.value.clientHeight;

	fabricCanvas = new fabric.Canvas(canvas.value, {
		width: containerWidth || 1600,
		height: containerHeight || 700,
		backgroundColor: '#000',
		// 是否开启互动
		interactive: true,
		// 是否显示框选区域
		selection: true,
		// 背景色
		selectionColor: 'rgba(255, 255, 255, 0.7)',
		// 只选择完全包含在框选区域中的形状
		selectionFullyContained: true,
	});

	fabricCanvas.on('mouse:down', handleMouseDown);
	fabricCanvas.on('mouse:move', handleMouseMove);
	fabricCanvas.on('mouse:up', handleMouseUp);
	fabricCanvas.on('mouse:dblclick', handleMouseDblClick);
	fabricCanvas.on('mouse:wheel', handleMouseWheel);
	fabricCanvas.on('mouse:out', handleMouseOut);
	fabricCanvas.on('mouse:over', handleObjectMouseOver);
	fabricCanvas.on('selection:created', handleSelectionCreated);
	fabricCanvas.on('selection:updated', handleSelectionUpdated);
	fabricCanvas.on('selection:cleared', handleSelectionCleared);
	fabricCanvas.on('object:modified', handleObjectModified);
	fabricCanvas.on('object:moving', handleObjectMoving);
	fabricCanvas.on('object:scaling', handleObjectMoving);
	fabricCanvas.on('object:rotating', handleObjectMoving);

	// 添加键盘事件监听
	window.addEventListener('keydown', handleKeyDown);
	// 添加右键菜单监听
	canvas.value.addEventListener('contextmenu', handleContextMenu);
};

const loadVideo = async () => {
	if (!props.videoUrl) return;

	try {
		const img = await fabric.FabricImage.fromURL(props.videoUrl, { crossOrigin: 'anonymous' });
		const canvasWidth = fabricCanvas.width;
		const canvasHeight = fabricCanvas.height;

		const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);

		img.set({
			left: canvasWidth / 2,
			top: canvasHeight / 2,
			originX: 'center',
			originY: 'center',
			scaleX: scale,
			scaleY: scale,
			selectable: false,
			evented: false,
		});

		backgroundImage = img;
		fabricCanvas.add(img);
		fabricCanvas.sendObjectToBack(img);
		fabricCanvas.requestRenderAll();
	} catch (error) {
		console.error('Failed to load image:', error);
	}
};

const handleMouseDown = (options) => {
	const pointer = fabricCanvas.getScenePoint(options.e);

	// 检查是否是右键点击
	if (options.e.button === 2) {
		// 右键点击完成多边形绘制
		if (props.activeTool === 'polygon' && isPolygonDrawing && polygonPoints.length >= 3) {
			options.e.preventDefault();
			finishPolygon();
			return;
		}
	}

	if (props.activeTool === 'pan') {
		isPanning = true;
		lastPanPoint = { x: options.e.clientX, y: options.e.clientY };
		fabricCanvas.selection = false;
		return;
	}

	if (props.activeTool === 'select') return;

	if (props.activeTool === 'polygon') {
		// 防止双击时添加额外的点（双击间隔通常 < 300ms）
		const now = Date.now();
		if (now - lastClickTime < 300) {
			return;
		}
		lastClickTime = now;

		// 检查是否点击在起点附近（闭合多边形）
		if (polygonPoints.length >= 3) {
			const firstPoint = polygonPoints[0];
			const distance = Math.sqrt(Math.pow(pointer.x - firstPoint.x, 2) + Math.pow(pointer.y - firstPoint.y, 2));
			if (distance < 10) {
				finishPolygon();
				return;
			}
		}

		// 添加新点
		const dot = new fabric.Circle({
			left: pointer.x - 4,
			top: pointer.y - 4,
			radius: 4,
			fill: '#ff00ff',
			stroke: '#ffffff',
			strokeWidth: 1,
			selectable: false,
			evented: false,
			hasControls: false,
		});
		fabricCanvas.add(dot);
		polygonDots.push(dot);
		polygonPoints.push({ x: pointer.x, y: pointer.y });
		isPolygonDrawing = true;

		// 绘制连线
		if (polygonPoints.length > 1) {
			const prevPoint = polygonPoints[polygonPoints.length - 2];
			const line = new fabric.Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
				stroke: '#ff00ff',
				strokeWidth: 2,
				selectable: false,
				evented: false,
				strokeDashArray: [5, 5],
				opacity: 1,
			});
			fabricCanvas.add(line);
			polygonLines.push(line);
		}

		// 更新预览多边形
		updatePreviewPolygon();
		fabricCanvas.requestRenderAll();

		// 更新提示
		if (polygonPoints.length === 1) {
			drawingHint.value = '继续点击添加点';
		} else if (polygonPoints.length >= 3) {
			drawingHint.value = '右键、双击或按 Enter 完成，按 ESC 撤销';
		}
		return;
	}

	isDrawing = true;
	startPoint = { x: pointer.x, y: pointer.y };

	if (props.activeTool === 'rectangle') {
		drawingHint.value = '抬起完成绘制';
		currentShape = new fabric.Rect({
			left: pointer.x,
			top: pointer.y,
			width: 0,
			height: 0,
			fill: 'transparent',
			stroke: '#ff4444',
			strokeWidth: 2,
			selectable: false,
		});
		fabricCanvas.add(currentShape);
	} else if (props.activeTool === 'circle') {
		drawingHint.value = '抬起完成绘制';
		currentShape = new fabric.Circle({
			left: pointer.x,
			top: pointer.y,
			radius: 0,
			fill: 'transparent',
			stroke: '#44ff44',
			strokeWidth: 2,
			selectable: false,
			originX: 'center',
			originY: 'center',
		});
		fabricCanvas.add(currentShape);
	} else if (props.activeTool === 'point') {
		const point = new fabric.Circle({
			left: pointer.x - 5,
			top: pointer.y - 5,
			radius: 5,
			fill: '#4444ff',
			stroke: '#ffffff',
			strokeWidth: 2,
			selectable: true,
		});
		point.label = 'point';
		fabricCanvas.add(point);

		const annotation = {
			id: Date.now(),
			type: 'point',
			label: 'point',
			frame: props.currentFrame,
			shape: point.toJSON(),
		};
		point.annotationId = annotation.id;
		emit('annotation-created', annotation);

		isDrawing = false;
		currentShape = null;
		return;
	} else if (props.activeTool === 'line') {
		currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
			stroke: '#ffff44',
			strokeWidth: 2,
			selectable: false,
		});
		fabricCanvas.add(currentShape);
	}
};

const handleMouseWheel = (opt) => {
	const delta = opt.e.deltaY;
	let zoom = fabricCanvas.getZoom();
	zoom *= 0.999 ** delta;
	if (zoom > 20) zoom = 20;
	if (zoom < 0.1) zoom = 0.1;
	fabricCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
	opt.e.preventDefault();
	opt.e.stopPropagation();
};

const handleMouseOut = (options) => {
	if (drawingHint.value) {
		hintPos.value = { x: -9999, y: -9999 };
	}

	const obj = options?.target;
	if (!obj || obj === backgroundImage || obj === labelText) return;
	if (props.activeTool !== 'select') return;

	const activeObj = fabricCanvas.getActiveObject();
	if (activeObj !== obj) {
		unhighlightObject(obj);
	}
};

const handleMouseMove = (options) => {
	if (isPanning && lastPanPoint) {
		const e = options.e;
		const vpt = fabricCanvas.viewportTransform;
		vpt[4] += e.clientX - lastPanPoint.x;
		vpt[5] += e.clientY - lastPanPoint.y;
		fabricCanvas.requestRenderAll();
		lastPanPoint = { x: e.clientX, y: e.clientY };
		return;
	}

	// 更新提示位置（跟随鼠标，偏移到右下角避免遮挡光标）
	if (drawingHint.value) {
		hintPos.value = { x: options.e.offsetX + 14, y: options.e.offsetY + 14 };
	}

	// 多边形绘制时的预览线
	if (props.activeTool === 'polygon' && isPolygonDrawing && polygonPoints.length > 0) {
		const pointer = fabricCanvas.getScenePoint(options.e);

		// 移除旧的预览线（可能是数组）
		if (previewLine) {
			if (Array.isArray(previewLine)) {
				previewLine.forEach((line) => fabricCanvas.remove(line));
			} else {
				fabricCanvas.remove(previewLine);
			}
			previewLine = null;
		}

		const lastPoint = polygonPoints[polygonPoints.length - 1];
		const firstPoint = polygonPoints[0];

		// 绘制从最后一个点到鼠标位置的预览线
		const lineToMouse = new fabric.Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
			stroke: '#ff00ff',
			strokeWidth: 2,
			strokeDashArray: [5, 5],
			selectable: false,
			evented: false,
			opacity: 0.8,
		});
		fabricCanvas.add(lineToMouse);

		// 如果有2个以上的点，绘制从鼠标到起点的闭合预览线
		let lineToStart = null;
		if (polygonPoints.length >= 2) {
			lineToStart = new fabric.Line([pointer.x, pointer.y, firstPoint.x, firstPoint.y], {
				stroke: '#ff00ff',
				strokeWidth: 2,
				strokeDashArray: [5, 5],
				selectable: false,
				evented: false,
				opacity: 0.5,
			});
			fabricCanvas.add(lineToStart);
		}

		// previewLine 存储为数组，便于统一清理
		previewLine = lineToStart ? [lineToMouse, lineToStart] : [lineToMouse];

		fabricCanvas.requestRenderAll();
		return;
	}

	if (!isDrawing || !currentShape) return;

	const pointer = fabricCanvas.getScenePoint(options.e);

	if (props.activeTool === 'rectangle') {
		const left = Math.min(startPoint.x, pointer.x);
		const top = Math.min(startPoint.y, pointer.y);
		const width = Math.abs(pointer.x - startPoint.x);
		const height = Math.abs(pointer.y - startPoint.y);
		currentShape.set({ left, top, width, height });
		fabricCanvas.requestRenderAll();
	} else if (props.activeTool === 'circle') {
		const dx = pointer.x - startPoint.x;
		const dy = pointer.y - startPoint.y;
		const radius = Math.sqrt(dx * dx + dy * dy);
		currentShape.set({ radius });
		fabricCanvas.requestRenderAll();
	} else if (props.activeTool === 'line') {
		currentShape.set({ x2: pointer.x, y2: pointer.y });
		fabricCanvas.requestRenderAll();
	}
};

const handleMouseDblClick = () => {
	if (props.activeTool === 'polygon' && polygonPoints.length >= 3) {
		finishPolygon();
	}
};

// 为多边形启用节点编辑功能
const enablePolygonEdit = (polygon) => {
	if (!polygon || polygon.type !== 'polygon') return;

	// 自定义控制点渲染函数
	const renderVertexControl = (ctx, left, top) => {
		const size = 8;
		ctx.save();
		ctx.fillStyle = '#ff00ff';
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(left, top, size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};

	// 获取多边形的顶点
	const points = polygon.points;

	// 为每个顶点创建控制点
	polygon.controls = {};

	points.forEach((point, index) => {
		polygon.controls[`p${index}`] = new fabric.Control({
			positionHandler: (_dim, _finalMatrix, fabricObject) => {
				console.log(fabricObject, '-----------fabricObject');

				// 计算顶点在画布上的位置
				const x = point.x - fabricObject.pathOffset.x;
				const y = point.y - fabricObject.pathOffset.y;
				const transformMatrix = fabric.util.multiplyTransformMatrices(fabricObject.canvas.viewportTransform, fabricObject.calcTransformMatrix());
				return new fabric.Point(x, y).transform(transformMatrix);
			},
			actionHandler: (_eventData, transform, x, y) => {
				const polygon = transform.target;
				const mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
				const polygonBaseSize = polygon._getNonTransformedDimensions();
				const size = polygon._getTransformedDimensions(0, 0);
				const finalPointPosition = {
					x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
					y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y,
				};

				polygon.points[index] = finalPointPosition;
				return true;
			},
			render: renderVertexControl,
			cornerSize: 16,
			touchCornerSize: 16,
		});
	});

	// 禁用默认的缩放、旋转控制点
	polygon.setControlsVisibility({
		mt: false,
		mb: false,
		ml: false,
		mr: false,
		bl: false,
		br: false,
		tl: false,
		tr: false,
		mtr: false,
	});

	polygon.hasBorders = true;
	polygon.hasControls = true;
	polygon.objectCaching = false;
};

const finishPolygon = () => {
	if (polygonPoints.length < 3) return;

	// 清理临时元素
	clearPolygonDrawing();

	// 创建闭合多边形
	const polygon = new fabric.Polygon(polygonPoints, {
		fill: 'rgba(255, 0, 255, 0.1)',
		stroke: '#ff00ff',
		strokeWidth: 2,
		selectable: true,
		objectCaching: false,
	});
	polygon.label = 'polygon';

	// 启用多边形节点编辑功能
	enablePolygonEdit(polygon);

	fabricCanvas.add(polygon);

	const annotation = {
		id: Date.now(),
		type: 'polygon',
		label: 'polygon',
		frame: props.currentFrame,
		shape: polygon.toJSON(),
	};
	polygon.annotationId = annotation.id;
	emit('annotation-created', annotation);

	// 重置状态
	polygonPoints = [];
	polygonLines = [];
	polygonDots = [];
	isPolygonDrawing = false;
	drawingHint.value = '';
	fabricCanvas.requestRenderAll();
};

const clearPolygonDrawing = () => {
	// 移除预览线（可能是数组）
	if (previewLine) {
		if (Array.isArray(previewLine)) {
			previewLine.forEach((line) => fabricCanvas.remove(line));
		} else {
			fabricCanvas.remove(previewLine);
		}
		previewLine = null;
	}

	// 移除预览多边形
	if (previewPolygon) {
		fabricCanvas.remove(previewPolygon);
		previewPolygon = null;
	}

	// 移除所有辅助线
	polygonLines.forEach((line) => fabricCanvas.remove(line));

	// 移除所有点标记
	polygonDots.forEach((dot) => fabricCanvas.remove(dot));
};

const updatePreviewPolygon = () => {
	// 移除旧的预览多边形
	if (previewPolygon) {
		fabricCanvas.remove(previewPolygon);
		previewPolygon = null;
	}

	// 至少需要3个点才能显示预览多边形
	if (polygonPoints.length >= 3) {
		previewPolygon = new fabric.Polygon(polygonPoints, {
			fill: 'rgba(255, 0, 255, 0.05)',
			stroke: 'transparent',
			selectable: false,
			evented: false,
			opacity: 0.5,
		});
		fabricCanvas.add(previewPolygon);
		fabricCanvas.sendObjectToBack(previewPolygon);
		if (backgroundImage) {
			fabricCanvas.sendObjectToBack(backgroundImage);
		}
	}
};

const handleKeyDown = (e) => {
	// ESC 键取消多边形绘制或撤销最后一个点
	if (e.key === 'Escape' && props.activeTool === 'polygon' && isPolygonDrawing) {
		if (polygonPoints.length === 1) {
			// 只有一个点，取消整个绘制
			clearPolygonDrawing();
			polygonPoints = [];
			polygonLines = [];
			polygonDots = [];
			isPolygonDrawing = false;
			drawingHint.value = '';
			fabricCanvas.requestRenderAll();
		} else if (polygonPoints.length > 1) {
			// 撤销最后一个点
			polygonPoints.pop();
			const lastDot = polygonDots.pop();
			const lastLine = polygonLines.pop();
			if (lastDot) fabricCanvas.remove(lastDot);
			if (lastLine) fabricCanvas.remove(lastLine);
			updatePreviewPolygon();
			fabricCanvas.requestRenderAll();
		}
		e.preventDefault();
	}

	// Enter 键完成多边形绘制
	if (e.key === 'Enter' && props.activeTool === 'polygon' && polygonPoints.length >= 3) {
		finishPolygon();
		e.preventDefault();
	}

	// Delete 键删除选中的标注
	if (e.key === 'Delete' || e.key === 'Backspace') {
		const activeObject = fabricCanvas.getActiveObject();
		if (activeObject && activeObject !== backgroundImage && activeObject !== labelText) {
			fabricCanvas.remove(activeObject);
			hideLabel();
			if (activeObject.annotationId) {
				emit('annotation-deleted', { id: activeObject.annotationId });
			}
			fabricCanvas.requestRenderAll();
			e.preventDefault();
		}
	}
};

const handleContextMenu = (e) => {
	// 右键点击完成多边形绘制
	if (props.activeTool === 'polygon' && isPolygonDrawing && polygonPoints.length >= 3) {
		e.preventDefault();
		e.stopPropagation();
		finishPolygon();
		return false;
	}

	// 其他情况也阻止默认右键菜单
	e.preventDefault();
};

const handleMouseUp = () => {
	if (isPanning) {
		isPanning = false;
		lastPanPoint = null;
		return;
	}

	if (!isDrawing || !currentShape) return;

	isDrawing = false;
	drawingHint.value = '';
	currentShape.set({
		selectable: true,
		evented: true,
		hasControls: true,
		hasBorders: true,
	});
	currentShape.label = props.activeTool;

	const annotation = {
		id: Date.now(),
		type: props.activeTool,
		label: props.activeTool,
		frame: props.currentFrame,
		shape: currentShape.toJSON(),
	};

	currentShape.annotationId = annotation.id;
	emit('annotation-created', annotation);
	currentShape = null;
};

const handleSelectionCreated = (options) => {
	const selected = options.selected[0];
	if (selected) {
		// 如果是多边形，确保编辑功能已启用
		if (selected.type === 'polygon') {
			enablePolygonEdit(selected);
		}
		highlightObject(selected);
		showLabel(selected);
		// 只传递 annotationId，避免循环引用
		emit('annotation-selected', { annotationId: selected.annotationId });
	}
};

const handleSelectionUpdated = (options) => {
	const selected = options.selected[0];
	if (selected) {
		// 先取消所有对象的高亮
		fabricCanvas.getObjects().forEach((obj) => {
			if (obj !== backgroundImage && obj !== labelText) {
				unhighlightObject(obj);
			}
		});
		// 如果是多边形，确保编辑功能已启用
		if (selected.type === 'polygon') {
			enablePolygonEdit(selected);
		}
		highlightObject(selected);
		showLabel(selected);
	} else {
		hideLabel();
	}
};

const handleSelectionCleared = () => {
	// 取消所有对象的高亮
	fabricCanvas.getObjects().forEach((obj) => {
		if (obj !== backgroundImage && obj !== labelText) {
			unhighlightObject(obj);
		}
	});
	hideLabel();
};

const highlightObject = (obj) => {
	if (obj === backgroundImage || obj === labelText) return;

	// 保存原始样式
	if (!obj.originalStrokeWidth) {
		obj.originalStrokeWidth = obj.strokeWidth || 2;
	}
	if (!obj.originalStroke) {
		obj.originalStroke = obj.stroke;
	}

	// 应用高亮样式：加粗描边
	obj.set({
		strokeWidth: obj.originalStrokeWidth * 2,
		stroke: obj.originalStroke,
		shadow: new fabric.Shadow({
			color: 'rgba(255, 255, 255, 0.5)',
			blur: 10,
		}),
	});
	fabricCanvas.requestRenderAll();
};

const unhighlightObject = (obj) => {
	if (obj === backgroundImage || obj === labelText) return;

	// 恢复原始样式
	if (obj.originalStrokeWidth) {
		obj.set({
			strokeWidth: obj.originalStrokeWidth,
			shadow: null,
		});
	}
	fabricCanvas.requestRenderAll();
};

const showLabel = (obj) => {
	if (obj === backgroundImage) return;

	// 移除旧标签
	hideLabel();

	// 获取对象边界
	const bounds = obj.getBoundingRect();
	const zoom = fabricCanvas.getZoom();

	// 计算标签位置（对象顶部上方）
	const labelX = bounds.left + bounds.width / 2;
	const labelY = bounds.top - 10;

	// 创建标签文本
	const label = obj.label || obj.type || 'annotation';
	labelText = new fabric.FabricText(label, {
		left: labelX,
		top: labelY,
		fontSize: 14 / zoom,
		fill: '#ffffff',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		padding: 4,
		originX: 'center',
		originY: 'bottom',
		selectable: false,
		evented: false,
	});

	fabricCanvas.add(labelText);
	// fabricCanvas.bringToFront(labelText);
	fabricCanvas.requestRenderAll();
};

const hideLabel = () => {
	if (labelText) {
		fabricCanvas.remove(labelText);
		labelText = null;
		fabricCanvas.requestRenderAll();
	}
};

const handleObjectMoving = (options) => {
	const obj = options.target;
	if (obj && labelText) {
		showLabel(obj);
	}
};

const handleObjectModified = (options) => {
	console.log(options, '---------options');

	const modified = options.target;
	const { left, top, width, height } = modified;
	console.log(left, top, width, height, '---------   ');

	if (modified) {
		emit('annotation-updated', modified.toJSON());
	}
};

const handleObjectMouseOver = (options) => {
	const obj = options.target;
	if (!obj || obj === backgroundImage || obj === labelText) return;
	if (props.activeTool !== 'select') return;

	// 取消之前激活对象的高亮
	const prevActive = fabricCanvas.getActiveObject();
	if (prevActive && prevActive !== obj) {
		unhighlightObject(prevActive);
	}

	fabricCanvas.setActiveObject(obj);
	// 如果是多边形，确保编辑功能已启用
	if (obj.type === 'polygon') {
		enablePolygonEdit(obj);
	}
	highlightObject(obj);
	showLabel(obj);
	fabricCanvas.renderAll();
	// 只传递 annotationId，避免循环引用
	emit('annotation-selected', { annotationId: obj.annotationId });
};

watch(
	() => props.activeTool,
	(newTool) => {
		if (!fabricCanvas) return;

		// 切换工具时清理多边形绘制状态
		if (newTool !== 'polygon' && isPolygonDrawing) {
			clearPolygonDrawing();
			polygonPoints = [];
			polygonLines = [];
			polygonDots = [];
			isPolygonDrawing = false;
		}

		// 平移模式下禁用选择框，其他模式下根据工具类型设置
		fabricCanvas.selection = newTool === 'select';

		// 切换工具时更新操作提示
		if (newTool === 'rectangle') {
			drawingHint.value = '按下确定起点';
		} else if (newTool === 'polygon') {
			drawingHint.value = '点击添加多边形顶点';
		} else {
			drawingHint.value = '';
		}

		// 设置对象的可选择性
		fabricCanvas.getObjects().forEach((obj) => {
			if (obj !== backgroundImage && obj !== labelText) {
				obj.selectable = newTool === 'select';
				obj.evented = newTool === 'select';
			}
		});

		// 背景图始终不可选择和交互
		if (backgroundImage) {
			backgroundImage.selectable = false;
			backgroundImage.evented = false;
		}

		fabricCanvas.requestRenderAll();
	},
);

watch(
	() => props.currentFrame,
	() => {
		loadAnnotationsForFrame();
	},
);

const loadAnnotationsForFrame = () => {
	fabricCanvas.clear();
	loadVideo();

	const frameAnnotations = props.annotations.filter((a) => a.frame === props.currentFrame);
	frameAnnotations.forEach((annotation) => {
		let shape;
		if (annotation.type === 'rectangle') {
			shape = new fabric.Rect({
				...annotation.shape,
				stroke: '#ff4444',
				strokeWidth: 2,
				fill: 'transparent',
			});
		} else if (annotation.type === 'circle') {
			shape = new fabric.Circle({
				...annotation.shape,
				stroke: '#44ff44',
				strokeWidth: 2,
				fill: 'transparent',
				originX: 'center',
				originY: 'center',
			});
		} else if (annotation.type === 'point') {
			shape = new fabric.Circle({
				...annotation.shape,
				fill: '#4444ff',
				stroke: '#ffffff',
				strokeWidth: 2,
			});
		} else if (annotation.type === 'line') {
			shape = new fabric.Line(annotation.shape.points || [0, 0, 0, 0], {
				...annotation.shape,
				stroke: '#ffff44',
				strokeWidth: 2,
			});
		} else if (annotation.type === 'polygon') {
			shape = new fabric.Polygon(annotation.shape.points || [], {
				...annotation.shape,
				stroke: '#ff00ff',
				strokeWidth: 2,
				fill: 'transparent',
				objectCaching: false,
			});
			// 为加载的多边形启用节点编辑
			enablePolygonEdit(shape);
		}
		if (shape) {
			shape.annotationId = annotation.id;
			shape.label = annotation.label || annotation.type;
			// 设置标注的可见性，默认为 true
			shape.visible = annotation.visible !== false;
			fabricCanvas.add(shape);
		}
	});
};

// 添加默认标注
const addDefaultAnnotation = () => {
	if (!fabricCanvas) return;

	// 获取画布中心位置
	const centerX = fabricCanvas.width / 2;
	const centerY = fabricCanvas.height / 2;
	const defaultWidth = 200;
	const defaultHeight = 150;

	// 创建默认矩形标注
	const rect = new fabric.Rect({
		left: centerX - defaultWidth / 2,
		top: centerY - defaultHeight / 2,
		width: defaultWidth,
		height: defaultHeight,
		fill: 'transparent',
		stroke: '#ff4444',
		strokeWidth: 2,
		selectable: true,
	});
	rect.label = '默认标注';
	fabricCanvas.add(rect);

	const annotation = {
		id: Date.now(),
		type: 'rectangle',
		label: '默认标注',
		frame: props.currentFrame,
		shape: rect.toJSON(),
	};
	rect.annotationId = annotation.id;
	emit('annotation-created', annotation);

	// 选中新创建的标注
	fabricCanvas.setActiveObject(rect);
	highlightObject(rect);
	showLabel(rect);
	fabricCanvas.requestRenderAll();
};

// 添加默认旋转的矩形
const addRotatedRectangle = () => {
	if (!fabricCanvas) return;

	const centerX = fabricCanvas.width / 2;
	const centerY = fabricCanvas.height / 2;
	const defaultWidth = 200;
	const defaultHeight = 150;

	const rect = new fabric.Rect({
		left: centerX,
		top: centerY,
		width: defaultWidth,
		height: defaultHeight,
		fill: 'transparent',
		stroke: '#ff4444',
		strokeWidth: 2,
		selectable: true,
		angle: 45,
		originX: 'center',
		originY: 'center',
	});
	rect.label = '旋转矩形';
	fabricCanvas.add(rect);

	const annotation = {
		id: Date.now(),
		type: 'rectangle',
		label: '旋转矩形',
		frame: props.currentFrame,
		shape: rect.toJSON(),
	};
	rect.annotationId = annotation.id;
	emit('annotation-created', annotation);

	fabricCanvas.setActiveObject(rect);
	highlightObject(rect);
	showLabel(rect);
	fabricCanvas.requestRenderAll();
};

// 根据 annotationId 选中标注
const selectAnnotationById = (annotationId) => {
	if (!fabricCanvas) return;

	const objects = fabricCanvas.getObjects();
	const targetObject = objects.find((obj) => obj.annotationId === annotationId);

	if (targetObject && targetObject !== backgroundImage && targetObject !== labelText) {
		fabricCanvas.setActiveObject(targetObject);
		// 如果是多边形，确保编辑功能已启用
		if (targetObject.type === 'polygon') {
			enablePolygonEdit(targetObject);
		}
		highlightObject(targetObject);
		showLabel(targetObject);
		fabricCanvas.requestRenderAll();
	}
};

// 根据 annotationId 切换标注的可见性
const toggleAnnotationVisibility = (annotationId, visible) => {
	if (!fabricCanvas) return;

	const objects = fabricCanvas.getObjects();
	const targetObject = objects.find((obj) => obj.annotationId === annotationId);

	if (targetObject && targetObject !== backgroundImage && targetObject !== labelText) {
		targetObject.set({ visible });
		fabricCanvas.requestRenderAll();
	}
};

// 根据 annotationId 从画布删除标注
const removeAnnotationById = (annotationId) => {
	if (!fabricCanvas) return;

	const objects = fabricCanvas.getObjects();
	const targetObject = objects.find((obj) => obj.annotationId === annotationId);

	if (targetObject && targetObject !== backgroundImage && targetObject !== labelText) {
		fabricCanvas.remove(targetObject);
		fabricCanvas.requestRenderAll();
	}
};

// 清空画布中全部标注（保留背景图）
const removeAllAnnotations = () => {
	if (!fabricCanvas) return;

	const toRemove = fabricCanvas.getObjects().filter((obj) => obj.annotationId && obj !== backgroundImage && obj !== labelText);
	toRemove.forEach((obj) => fabricCanvas.remove(obj));
	fabricCanvas.requestRenderAll();
};

// 切换全部标注的可见性
const toggleAllAnnotationsVisibility = (visible) => {
	if (!fabricCanvas) return;

	const objects = fabricCanvas.getObjects();
	objects.forEach((obj) => {
		if (obj.annotationId && obj !== backgroundImage && obj !== labelText) {
			obj.set({ visible });
		}
	});
	fabricCanvas.requestRenderAll();
};

defineExpose({
	deleteSelected: () => {
		const activeObject = fabricCanvas.getActiveObject();
		if (activeObject && activeObject !== backgroundImage) {
			fabricCanvas.remove(activeObject);
			if (activeObject.annotationId) {
				emit('annotation-deleted', { id: activeObject.annotationId });
			}
		}
	},
	addDefaultAnnotation,
	addRotatedRectangle,
	selectAnnotationById,
	toggleAnnotationVisibility,
	toggleAllAnnotationsVisibility,
	removeAnnotationById,
	removeAllAnnotations,
});
</script>

<style scoped lang="scss">
.annotation-canvas-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #1a1a1a;
}

.canvas-container {
	position: relative;
	width: 100%;
	height: 100%;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.drawing-hint {
	position: absolute;
	background: rgba(0, 0, 0, 0.65);
	color: #fff;
	font-size: 13px;
	padding: 5px 14px;
	border-radius: 4px;
	pointer-events: none;
	user-select: none;
	white-space: nowrap;
	transform: none;
}
</style>
