<template>
  <div class="annotation-page">
    <!-- 工具栏 -->
    <AnnotationToolbar
      :active-tool="activeTool"
      @tool-changed="handleToolChanged"
      @delete-selected="handleDeleteSelected"
      @undo="handleUndo"
      @redo="handleRedo" />

    <!-- 添加默认标注按钮 -->
    <div class="quick-actions">
      <el-button type="primary" size="small" @click="handleAddDefaultAnnotation">
        添加默认标注
      </el-button>
    </div>

    <!-- 主内容区 -->
    <div class="annotation-main">
      <!-- 左侧画布 -->
      <div class="canvas-area">
        <AnnotationCanvas
          ref="canvasRef"
          :video-url="videoUrl"
          :current-frame="currentFrame"
          :active-tool="activeTool"
          :annotations="annotations"
          @annotation-created="handleAnnotationCreated"
          @annotation-updated="handleAnnotationUpdated"
          @annotation-deleted="handleAnnotationDeleted"
          @annotation-selected="handleAnnotationSelected" />

        <!-- 视频控制条 -->
        <div class="video-controls">
          <div class="controls-left">
            <el-button @click="togglePlay" circle size="small">
              <el-icon>
                <VideoPlay v-if="!isPlaying" />
                <VideoPause v-else />
              </el-icon>
            </el-button>
            <el-button @click="handlePrevFrame" :disabled="currentFrame <= 0" size="small">
              上一张
            </el-button>
            <el-button @click="handleNextFrame" :disabled="currentFrame >= totalFrames" size="small">
              下一张
            </el-button>
            <span class="frame-info">{{ currentFrame }} / {{ totalFrames }}</span>
          </div>

          <div class="controls-center">
            <el-slider
              v-model="currentFrame"
              :max="totalFrames"
              :show-tooltip="false"
              @change="handleFrameChange" />
          </div>

          <div class="controls-right">
            <span class="time-info">{{ formatTime(currentTime) }} / {{ formatTime(totalTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧对象列表 -->
      <div class="sidebar-area">
        <AnnotationObjectList
          :annotations="currentFrameAnnotations"
          :selected-id="selectedAnnotationId"
          @select="handleSelectAnnotation"
          @delete="handleDeleteAnnotation"
          @toggle-visibility="handleToggleVisibility"
          @toggle-all-visibility="handleToggleAllVisibility"
          @clear-all="handleClearAll" />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="annotation-footer">
      <el-button @click="handleCancel">取消</el-button>
      <div class="footer-actions">
        <el-button @click="handleSave">保存</el-button>
        <el-button type="primary" @click="handleComplete">完成</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { VideoPlay, VideoPause } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import AnnotationToolbar from '../components/annotation/AnnotationToolbar.vue';
import AnnotationCanvas from '../components/annotation/AnnotationCanvas.vue';
import AnnotationObjectList from '../components/annotation/AnnotationObjectList.vue';

const props = defineProps({
  routeInfo: {
    type: Object,
    default: () => ({}),
  },
});

const canvasRef = ref(null);
const activeTool = ref('select');
const annotations = ref([]);
const selectedAnnotationId = ref(null);
const currentFrame = ref(0);
const totalFrames = ref(293);
const isPlaying = ref(false);
const currentTime = ref(0);
const totalTime = ref(293);

// 模拟视频URL，实际应从路由参数或API获取
const videoUrl = ref('/src/assets/img.jpg');

const currentFrameAnnotations = computed(() => {
  return annotations.value.filter(a => a.frame === currentFrame.value);
});

const handleToolChanged = (tool) => {
  activeTool.value = tool;
};

const handleAnnotationCreated = (annotation) => {
  // 确保新创建的标注默认可见
  annotation.visible = true;
  annotations.value.push(annotation);
  ElMessage.success('标注已创建');
};

const handleAnnotationUpdated = (annotation) => {
  console.log('111', annotation);

  // 如果是多边形，获取顶点
  if (annotation.type === 'polygon') {
    // Fabric.js 序列化后的多边形顶点在 points 数组中
    if (annotation.points) {
      console.log('多边形顶点:', annotation.points);
    }
  }

  const index = annotations.value.findIndex(a => a.id === annotation.id);
  if (index !== -1) {
    annotations.value[index] = annotation;
  }
};

const handleAnnotationDeleted = (annotation) => {
  const index = annotations.value.findIndex(a => a.id === annotation.id);
  if (index !== -1) {
    annotations.value.splice(index, 1);
  }
};

const handleAnnotationSelected = (data) => {
  // data 现在是 { annotationId: xxx } 格式
  selectedAnnotationId.value = data.annotationId;
};

const handleDeleteSelected = () => {
  if (canvasRef.value) {
    canvasRef.value.deleteSelected();
  }
};

const handleUndo = () => {
  // 实现撤销逻辑
  ElMessage.info('撤销功能开发中');
};

const handleRedo = () => {
  // 实现重做逻辑
  ElMessage.info('重做功能开发中');
};

const handleSelectAnnotation = (annotation) => {
  selectedAnnotationId.value = annotation.id;
  // 在画布上选中对应的标注
  if (canvasRef.value) {
    canvasRef.value.selectAnnotationById(annotation.id);
  }
};

const handleAddDefaultAnnotation = () => {
  if (canvasRef.value) {
    canvasRef.value.addDefaultAnnotation();
  }
};

const handleDeleteAnnotation = (annotation) => {
  const index = annotations.value.findIndex(a => a.id === annotation.id);
  if (index !== -1) {
    annotations.value.splice(index, 1);
    // 从画布中删除对应的标注
    if (canvasRef.value) {
      canvasRef.value.removeAnnotationById(annotation.id);
    }
    ElMessage.success('已删除标注');
  }
};

const handleToggleVisibility = (annotation) => {
  const index = annotations.value.findIndex(a => a.id === annotation.id);
  if (index !== -1) {
    annotations.value[index].visible = !annotations.value[index].visible;
    // 在画布上切换标注的可见性
    if (canvasRef.value) {
      canvasRef.value.toggleAnnotationVisibility(annotation.id, annotations.value[index].visible);
    }
  }
};

const handleToggleAllVisibility = (visible) => {
  // 更新当前帧所有标注的可见性
  annotations.value.forEach(annotation => {
    if (annotation.frame === currentFrame.value) {
      annotation.visible = visible;
    }
  });
  // 在画布上切换全部标注的可见性
  if (canvasRef.value) {
    canvasRef.value.toggleAllAnnotationsVisibility(visible);
  }
};

const handleClearAll = () => {
  annotations.value = annotations.value.filter(a => a.frame !== currentFrame.value);
  // 清空画布中的所有标注
  if (canvasRef.value) {
    canvasRef.value.removeAllAnnotations();
  }
  ElMessage.success('已清空当前帧标注');
};

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  // 实现播放逻辑
};

const handleFrameChange = (frame) => {
  currentFrame.value = frame;
  currentTime.value = frame;
};

const handlePrevFrame = () => {
  if (currentFrame.value > 0) {
    currentFrame.value--;
    currentTime.value = currentFrame.value;
  }
};

const handleNextFrame = () => {
  if (currentFrame.value < totalFrames.value) {
    currentFrame.value++;
    currentTime.value = currentFrame.value;
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const handleCancel = () => {
  window.history.back();
};

const handleSave = () => {
  // 保存标注数据到后端
  console.log('保存标注:', annotations.value);
  ElMessage.success('标注已保存');
};

const handleComplete = () => {
  // 完成标注并返回
  handleSave();
  setTimeout(() => {
    window.history.back();
  }, 500);
};
</script>

<style scoped lang="scss">
.annotation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.annotation-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  position: relative;
}

.video-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.controls-center {
  flex: 1;
}

.frame-info,
.time-info {
  font-size: 13px;
  color: #e5e7eb;
  font-weight: 500;
}

.sidebar-area {
  width: 320px;
  background: #ffffff;
}

.annotation-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-actions {
  display: flex;
  gap: 12px;
}

:deep(.el-slider) {
  .el-slider__runway {
    background: #4a4a4a;
  }

  .el-slider__bar {
    background: #3b82f6;
  }

  .el-slider__button {
    border-color: #3b82f6;
  }
}
</style>
