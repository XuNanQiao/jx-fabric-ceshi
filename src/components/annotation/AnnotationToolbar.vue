<template>
  <div class="annotation-toolbar">
    <div class="toolbar-section">
      <el-tooltip content="选择" placement="bottom">
        <el-button
          :type="activeTool === 'select' ? 'primary' : ''"
          @click="selectTool('select')"
          circle>
          <el-icon><Pointer /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="矩形框" placement="bottom">
        <el-button
          :type="activeTool === 'rectangle' ? 'primary' : ''"
          @click="selectTool('rectangle')"
          circle>
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="多边形" placement="bottom">
        <el-button
          :type="activeTool === 'polygon' ? 'primary' : ''"
          @click="selectTool('polygon')"
          circle>
          <el-icon><Connection /></el-icon>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" />

      <el-tooltip content="删除" placement="bottom">
        <el-button @click="deleteSelected" circle>
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="撤销" placement="bottom">
        <el-button @click="undo" circle>
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="重做" placement="bottom">
        <el-button @click="redo" circle>
          <el-icon><RefreshRight /></el-icon>
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
import { Pointer, Grid, Connection, Delete, RefreshLeft, RefreshRight } from '@element-plus/icons-vue';

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

const emit = defineEmits(['tool-changed', 'delete-selected', 'undo', 'redo', 'label-changed']);

const currentLabel = ref('person');

const selectTool = (tool) => {
  emit('tool-changed', tool);
};

const deleteSelected = () => {
  emit('delete-selected');
};

const undo = () => {
  emit('undo');
};

const redo = () => {
  emit('redo');
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
</style>
