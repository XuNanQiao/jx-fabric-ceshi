<template>
  <div class="annotation-toolbar">
    <div class="toolbar-section">
      <el-popover
        v-model:visible="popoverVisible"
        placement="bottom"
        :width="200"
        trigger="click"
        :virtual-ref="buttonRef"
        virtual-triggering>
        <div class="popover-content">
          <div class="popover-title">{{ currentButtonLabel }}</div>
          <el-select v-model="selectOption" placeholder="请选择" style="width: 100%">
            <el-option label="选项 1" value="option1" />
            <el-option label="选项 2" value="option2" />
            <el-option label="选项 3" value="option3" />
          </el-select>
        </div>
      </el-popover>

      <el-tooltip content="选择" placement="bottom">
        <el-button
          ref="selectBtn"
          :type="activeTool === 'select' ? 'primary' : ''"
          @click="handleButtonClick($event, 'select', '选择')"
          circle>
          <el-icon><Pointer /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="平移" placement="bottom">
        <el-button
          :type="activeTool === 'pan' ? 'primary' : ''"
          @click="handleButtonClick($event, 'pan', '平移')"
          circle>
          <el-icon><Rank /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="矩形框" placement="bottom">
        <el-button
          :type="activeTool === 'rectangle' ? 'primary' : ''"
          @click="handleButtonClick($event, 'rectangle', '矩形框')"
          circle>
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="圆形" placement="bottom">
        <el-button
          :type="activeTool === 'circle' ? 'primary' : ''"
          @click="handleButtonClick($event, 'circle', '圆形')"
          circle>
          <el-icon><CirclePlus /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="点" placement="bottom">
        <el-button
          :type="activeTool === 'point' ? 'primary' : ''"
          @click="handleButtonClick($event, 'point', '点')"
          circle>
          <el-icon><Location /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="线段" placement="bottom">
        <el-button
          :type="activeTool === 'line' ? 'primary' : ''"
          @click="handleButtonClick($event, 'line', '线段')"
          circle>
          <el-icon><Connection /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="多边形" placement="bottom">
        <el-button
          :type="activeTool === 'polygon' ? 'primary' : ''"
          @click="handleButtonClick($event, 'polygon', '多边形')"
          circle>
          <el-icon><Histogram /></el-icon>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <el-tooltip content="删除" placement="bottom">
        <el-button @click="handleButtonClick($event, 'delete', '删除')" circle>
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="撤销" placement="bottom">
        <el-button @click="handleButtonClick($event, 'undo', '撤销')" circle>
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="重做" placement="bottom">
        <el-button @click="handleButtonClick($event, 'redo', '重做')" circle>
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <el-tooltip content="获取多边形顶点" placement="bottom">
        <el-button @click="handleButtonClick($event, 'getVertices', '获取顶点')" circle>
          <el-icon><DataLine /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <div class="toolbar-section">
      <el-select v-model="currentLabel" placeholder="选择标签" style="width: 150px">
        <el-option
          v-for="label in labels"
          :key="label"
          :label="label"
          :value="label" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Pointer, Rank, Grid, CirclePlus, Location, Connection, Histogram, Delete, RefreshLeft, RefreshRight, DataLine } from '@element-plus/icons-vue';

const props = defineProps({
  activeTool: {
    type: String,
    default: 'select',
  },
  labels: {
    type: Array,
    default: () => ['person', 'car', 'bus', 'truck', 'bicycle', 'motorcycle'],
  },
});

const emit = defineEmits(['tool-changed', 'delete-selected', 'undo', 'redo', 'label-changed', 'get-vertices']);

const currentLabel = ref('person');
const selectOption = ref('option1');
const popoverVisible = ref(false);
const currentButtonLabel = ref('');
const buttonRef = ref();

const handleButtonClick = (event, action, label) => {
  currentButtonLabel.value = label;
  buttonRef.value = event.currentTarget;
  popoverVisible.value = true;

  // 执行对应的操作
  if (action === 'delete') {
    emit('delete-selected');
  } else if (action === 'undo') {
    emit('undo');
  } else if (action === 'redo') {
    emit('redo');
  } else if (action === 'getVertices') {
    emit('get-vertices');
  } else {
    emit('tool-changed', action);
  }
};
</script>

<style scoped lang="scss">
.annotation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-divider--vertical {
  height: 24px;
  margin: 0 8px;
}

.popover-content {
  padding: 8px 0;
}

.popover-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 12px;
}
</style>
