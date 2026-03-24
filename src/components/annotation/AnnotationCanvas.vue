<template>
	<div class="annotation-canvas-wrapper">
		<div
			class="canvas-container"
			ref="canvasContainer">
			<canvas ref="canvas"></canvas>
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
		default: 'select', // select, rectangle, polygon
	},
	annotations: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(['annotation-created', 'annotation-updated', 'annotation-deleted', 'annotation-selected']);

const canvas = ref(null);
const canvasContainer = ref(null);
let fabricCanvas = null;
let isDrawing = false;
let currentShape = null;

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

/* 	fabricCanvas.on('mouse:down', handleMouseDown);
	fabricCanvas.on('mouse:move', handleMouseMove);
	fabricCanvas.on('mouse:up', handleMouseUp);
	fabricCanvas.on('selection:created', handleSelectionCreated);
	fabricCanvas.on('object:modified', handleObjectModified); */
};

const loadVideo = async () => {
	if (!props.videoUrl) return;

	try {
		const img = await fabric.FabricImage.fromURL(props.videoUrl, { crossOrigin: 'anonymous' });
		const canvasWidth = fabricCanvas.width;
		const canvasHeight = fabricCanvas.height;

		const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);

		img.set({
			left: 0,
			top: 0,
			originX: 'left',
			originY: 'top',
			scaleX: scale, // 调整缩放比例以展示完全
			scaleY: scale, // 调整缩放比例以展示完全
			crossOrigin: 'anonymous',
		});

		fabricCanvas.backgroundImage = img;
		fabricCanvas.requestRenderAll();
	} catch (error) {
		console.error('Failed to load image:', error);
	}
};

const handleMouseDown = (options) => {
	if (props.activeTool === 'select') return;

	const pointer = options.pointer;
	isDrawing = true;

	if (props.activeTool === 'rectangle') {
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
	}
};

const handleMouseMove = (options) => {
	if (!isDrawing || !currentShape) return;

	const pointer = options.pointer;

	if (props.activeTool === 'rectangle') {
		const left = currentShape.get('left') || 0;
		const top = currentShape.get('top') || 0;
		const width = pointer.x - left;
		const height = pointer.y - top;
		currentShape.set({ width, height });
		fabricCanvas.requestRenderAll();
	}
};

const handleMouseUp = () => {
	if (!isDrawing || !currentShape) return;

	isDrawing = false;
	currentShape.set({ selectable: true });

	const annotation = {
		id: Date.now(),
		type: props.activeTool,
		label: 'person',
		frame: props.currentFrame,
		shape: currentShape.toJSON(),
	};

	emit('annotation-created', annotation);
	currentShape = null;
};

const handleSelectionCreated = (options) => {
	const selected = options.selected[0];
	if (selected) {
		emit('annotation-selected', selected);
	}
};

const handleObjectModified = (options) => {
	const modified = options.target;
	if (modified) {
		emit('annotation-updated', modified.toJSON());
	}
};

watch(
	() => props.activeTool,
	(newTool) => {
		if (!fabricCanvas) return;
		fabricCanvas.selection = newTool === 'select';
		fabricCanvas.getObjects().forEach((obj) => {
			obj.selectable = newTool === 'select';
		});
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
		if (annotation.type === 'rectangle') {
			const rect = new fabric.Rect({
				...annotation.shape,
				stroke: '#ff4444',
				strokeWidth: 2,
				fill: 'transparent',
			});
			fabricCanvas.add(rect);
		}
	});
};

defineExpose({
	deleteSelected: () => {
		const activeObject = fabricCanvas.getActiveObject();
		if (activeObject) {
			fabricCanvas.remove(activeObject);
			emit('annotation-deleted', activeObject);
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
</style>
