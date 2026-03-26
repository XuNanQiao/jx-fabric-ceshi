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
let lastPolygonClickTime = 0;
let isPanning = false;
let lastPanPoint = null;
let labelText = null;

onMounted(() => {
	initCanvas();
	loadVideo();
});

onBeforeUnmount(() => {
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

	if (props.activeTool === 'pan') {
		isPanning = true;
		lastPanPoint = { x: options.e.clientX, y: options.e.clientY };
		fabricCanvas.selection = false;
		return;
	}

	if (props.activeTool === 'select') return;

	if (props.activeTool === 'polygon') {
		// 用时间戳检测双击的第二次 mousedown（间隔 < 300ms），跳过不添加点
		const now = Date.now();
		const timeSinceLast = now - lastPolygonClickTime;
		lastPolygonClickTime = now;
		if (timeSinceLast < 300) return;

		// 多边形绘制：点击添加点
		const point = new fabric.Circle({
			left: pointer.x - 3,
			top: pointer.y - 3,
			radius: 3,
			fill: '#ff00ff',
			selectable: false,
			evented: false,
		});
		fabricCanvas.add(point);
		polygonPoints.push({ x: pointer.x, y: pointer.y });

		// 如果有前一个点，绘制连线
		if (polygonPoints.length > 1) {
			const prevPoint = polygonPoints[polygonPoints.length - 2];
			const line = new fabric.Line([prevPoint.x, prevPoint.y, pointer.x, pointer.y], {
				stroke: '#ff00ff',
				strokeWidth: 2,
				selectable: false,
				evented: false,
			});
			fabricCanvas.add(line);
			polygonLines.push(line);
		}
		fabricCanvas.requestRenderAll();
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
		currentShape = new fabric.Circle({
			left: pointer.x,
			top: pointer.y,
			radius: 0,
			fill: 'transparent',
			stroke: '#44ff44',
			strokeWidth: 2,
			selectable: false,
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
		// 双击触发两次 mousedown：第一次添加了点需要 pop 掉，第二次已被时间戳拦截
		polygonPoints.pop();
		const lastLine = polygonLines.pop();
		if (lastLine) fabricCanvas.remove(lastLine);

		// 移除临时的点标记和辅助线
		const objects = fabricCanvas.getObjects();
		polygonLines.forEach((line) => fabricCanvas.remove(line));
		objects.forEach((obj) => {
			if (obj.radius === 3 && obj.fill === '#ff00ff') {
				fabricCanvas.remove(obj);
			}
		});

		// 创建闭合多边形
		const polygon = new fabric.Polygon(polygonPoints, {
			fill: 'transparent',
			stroke: '#ff00ff',
			strokeWidth: 2,
			selectable: true,
		});
		polygon.label = 'polygon';
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

		// 重置
		polygonPoints = [];
		polygonLines = [];
		fabricCanvas.requestRenderAll();
	}
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
	currentShape.set({ selectable: true });
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
		highlightObject(selected);
		showLabel(selected);
		emit('annotation-selected', selected);
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
	fabricCanvas.bringToFront(labelText);
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
	const modified = options.target;
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
	highlightObject(obj);
	showLabel(obj);
	fabricCanvas.renderAll();
	emit('annotation-selected', obj);
};

watch(
	() => props.activeTool,
	(newTool) => {
		if (!fabricCanvas) return;

		// 切换工具时清理多边形绘制状态
		if (newTool !== 'polygon' && polygonPoints.length > 0) {
			const objects = fabricCanvas.getObjects();
			polygonLines.forEach((line) => fabricCanvas.remove(line));
			objects.forEach((obj) => {
				if (obj.radius === 3 && obj.fill === '#ff00ff') {
					fabricCanvas.remove(obj);
				}
			});
			polygonPoints = [];
			polygonLines = [];
		}

		// 平移模式下禁用选择框，其他模式下根据工具类型设置
		fabricCanvas.selection = newTool === 'select';

		// 切换工具时更新操作提示
		drawingHint.value = newTool === 'rectangle' ? '按下确定起点' : '';

		// 设置对象的可选择性
		fabricCanvas.getObjects().forEach((obj) => {
			if (obj !== backgroundImage) {
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
			});
		}
		if (shape) {
			shape.annotationId = annotation.id;
			shape.label = annotation.label || annotation.type;
			fabricCanvas.add(shape);
		}
	});
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
