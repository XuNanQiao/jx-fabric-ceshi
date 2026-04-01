<template>
  <div class="annotation-page">
    <!-- 工具栏 -->
    <AnnotationToolbar
      :active-tool="activeTool"
      @tool-changed="handleToolChanged"
      @delete-selected="handleDeleteSelected"
      @undo="handleUndo"
      @redo="handleRedo"
      @get-vertices="handleGetVertices"
      @clear-selection="handleClearSelection" />

    <!-- 添加默认标注按钮 -->
    <div class="quick-actions">
      <el-button type="primary" size="small" @click="handleAddDefaultAnnotation">
        添加默认标注
      </el-button>
      <el-button type="success" size="small" @click="handleDownloadJson">
        下载JSON数据
      </el-button>
      <el-divider direction="vertical" />
      <el-button type="info" size="small" @click="handleLoadFromApi">
        从API加载当前帧
      </el-button>
      <el-button type="warning" size="small" @click="handleViewAllData">
        查看所有数据
      </el-button>
      <el-button type="danger" size="small" @click="handleClearStorage">
        清空存储
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { VideoPlay, VideoPause } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AnnotationToolbar from '../components/annotation/AnnotationToolbar.vue';
import AnnotationCanvas from '../components/annotation/AnnotationCanvas.vue';
import AnnotationObjectList from '../components/annotation/AnnotationObjectList.vue';
import {
  savePolygonAnnotations,
  getPolygonsByFrame,
  getAllPolygonAnnotations,
  clearAllAnnotations,
} from '../api/mockApi.js';

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

const handleGetVertices = () => {
  if (canvasRef.value) {
    const result = canvasRef.value.getPolygonAbsoluteVertices();
    if (result.success) {
      console.log('多边形顶点绝对坐标:', result.vertices);
      ElMessage({
        message: `已获取 ${result.count} 个顶点坐标，请查看控制台`,
        type: 'success',
        duration: 3000
      });

      // 格式化输出到控制台
      console.table(result.vertices);

      // 也可以弹窗显示
      const verticesText = result.vertices.map((v, i) =>
        `顶点 ${i + 1}: (${v.x.toFixed(2)}, ${v.y.toFixed(2)})`
      ).join('\n');

      // 可选：显示详细对话框
      // ElMessageBox.alert(verticesText, '多边形顶点坐标', { confirmButtonText: '确定' });
    } else {
      ElMessage.warning(result.message);
    }
  }
};

const handleClearSelection = () => {
  if (canvasRef.value) {
    canvasRef.value.clearSelection();
    selectedAnnotationId.value = null;
    ElMessage.info('已清除选中');
  }
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

const handleSave = async () => {
  try {
    // 获取所有多边形数据（应用0.6的缩放比例）
    const polygonsData = canvasRef.value ? canvasRef.value.getAllPolygonsWithVertices(0.6) : [];

    // 构建保存的数据结构
    const saveData = {
      videoUrl: videoUrl.value,
      currentFrame: currentFrame.value,
      scale: 0.6, // 缩放比例
      timestamp: new Date().toISOString(),
      annotations: annotations.value,
      polygons: polygonsData, // 包含绝对坐标和缩放后的顶点数据
    };

    console.log('准备保存的数据:', saveData);
    console.log('多边形详细信息:', polygonsData);

    // 调用虚拟API保存数据
    const response = await savePolygonAnnotations(saveData);

    if (response.success) {
      ElMessage.success(
        `${response.message}（包含 ${polygonsData.length} 个多边形，缩放比例: 0.6）`
      );
      console.log('保存响应:', response.data);
    } else {
      throw new Error(response.message || '保存失败');
    }

  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存标注数据失败: ' + error.message);
  }
};

// 可选：下载为JSON文件的辅助函数
const downloadAsJson = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `annotation_frame_${currentFrame.value}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 下载JSON数据（用于测试）
const handleDownloadJson = () => {
  const polygonsData = canvasRef.value ? canvasRef.value.getAllPolygonsWithVertices(0.6) : [];

  const saveData = {
    videoUrl: videoUrl.value,
    currentFrame: currentFrame.value,
    scale: 0.6,
    timestamp: new Date().toISOString(),
    annotations: annotations.value,
    polygons: polygonsData,
  };

  downloadAsJson(saveData);
  ElMessage.success('JSON数据已下载');
};

// 从API加载当前帧的标注数据
const handleLoadFromApi = async () => {
  try {
    const response = await getPolygonsByFrame(currentFrame.value);

    if (response.success) {
      const { polygons, annotations: loadedAnnotations } = response.data;

      console.log('=== API返回的数据 ===');
      console.log('polygons:', polygons);
      console.log('annotations:', loadedAnnotations);

      if (polygons.length === 0 && (!loadedAnnotations || loadedAnnotations.length === 0)) {
        ElMessage.info(`第 ${currentFrame.value} 帧暂无保存的标注数据`);
        return;
      }

      // 加载标注数据到 annotations 数组
      if (loadedAnnotations && loadedAnnotations.length > 0) {
        // 清除当前帧的旧标注
        annotations.value = annotations.value.filter(a => a.frame !== currentFrame.value);

        // 添加加载的标注
        loadedAnnotations.forEach(ann => {
          console.log('加载标注:', {
            id: ann.id,
            type: ann.type,
            hasShape: !!ann.shape,
            shapePoints: ann.shape?.points?.length || 0
          });
        });

        annotations.value.push(...loadedAnnotations);

        console.log('annotations数组已更新:', annotations.value.length, '条');

        // 触发画布重新加载标注
        if (canvasRef.value) {
          console.log('触发画布重新加载');
          canvasRef.value.reloadAnnotations();
        }
      }

      ElMessage.success(
        `已加载第 ${currentFrame.value} 帧的标注数据（${polygons.length} 个多边形）`
      );
    }
  } catch (error) {
    console.error('加载失败:', error);
    ElMessage.error('加载标注数据失败: ' + error.message);
  }
};

// 查看所有保存的数据
const handleViewAllData = async () => {
  try {
    const response = await getAllPolygonAnnotations();

    if (response.success) {
      const { totalFrames, totalAnnotations, allData } = response.data;

      console.log('=== 所有标注数据 ===');
      console.log('总帧数:', totalFrames);
      console.log('总标注数:', totalAnnotations);
      console.log('详细数据:', allData);
      console.table(allData.map(item => ({
        帧号: item.currentFrame,
        多边形数量: item.polygons?.length || 0,
        缩放比例: item.scale,
        保存时间: new Date(item.savedAt).toLocaleString('zh-CN'),
      })));

      ElMessageBox.alert(
        `共有 ${totalFrames} 个帧包含标注数据，总计 ${totalAnnotations} 条标注记录。详情请查看控制台。`,
        '数据统计',
        { confirmButtonText: '确定' }
      );
    }
  } catch (error) {
    console.error('查看数据失败:', error);
    ElMessage.error('查看数据失败: ' + error.message);
  }
};

// 清空所有存储的数据
const handleClearStorage = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清空所有保存的标注数据，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await clearAllAnnotations();

    if (response.success) {
      ElMessage.success(response.message);
      console.log('存储已清空');
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消操作');
    } else {
      console.error('清空失败:', error);
      ElMessage.error('清空数据失败: ' + error.message);
    }
  }
};

const handleComplete = () => {
  // 完成标注并返回
  handleSave();
  setTimeout(() => {
    window.history.back();
  }, 500);
};

// 键盘事件处理
const handleKeyDown = (event) => {
  // Ctrl+S 保存
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    handleSave();
    return;
  }

  // 检查是否在输入框中,如果是则不处理
  const activeElement = document.activeElement;
  const isInputField = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );

  if (isInputField) {
    return;
  }

  // 有 Ctrl/Meta 修饰键时不处理单键逻辑，避免与复制粘贴等快捷键冲突
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  const key = event.key.toLowerCase();

  // 左方向键或D键 - 上一张
  if (key === 'arrowleft' || key === 'd') {
    event.preventDefault();
    handlePrevFrame();
  }
  // 右方向键或F键 - 下一张
  else if (key === 'arrowright' || key === 'f') {
    event.preventDefault();
    handleNextFrame();
  }
};

// 组件挂载时添加键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

// 组件卸载时移除键盘事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
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
