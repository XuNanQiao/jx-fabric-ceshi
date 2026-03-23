<template>
  <div class="annotation-object-list">
    <div class="list-header">
      <span class="list-title">对象列表 ({{ annotations.length }})</span>
      <el-button size="small" @click="clearAll" text>清空</el-button>
    </div>

    <div class="list-content">
      <div
        v-for="(annotation, index) in annotations"
        :key="annotation.id"
        class="object-item"
        :class="{ active: selectedId === annotation.id }"
        @click="selectAnnotation(annotation)">
        <div class="object-info">
          <span class="object-index">{{ index + 1 }}</span>
          <div class="object-details">
            <span class="object-label">{{ annotation.label }}</span>
            <span class="object-type">{{ getTypeLabel(annotation.type) }}</span>
          </div>
        </div>
        <div class="object-actions">
          <el-button
            size="small"
            @click.stop="toggleVisibility(annotation)"
            text
            circle>
            <el-icon>
              <View v-if="annotation.visible !== false" />
              <Hide v-else />
            </el-icon>
          </el-button>
          <el-button
            size="small"
            @click.stop="deleteAnnotation(annotation)"
            text
            circle>
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="!annotations.length" class="empty-list">
        暂无标注对象
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { View, Hide, Delete } from '@element-plus/icons-vue';

const props = defineProps({
  annotations: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(['select', 'delete', 'toggle-visibility', 'clear-all']);

const getTypeLabel = (type) => {
  const typeMap = {
    rectangle: '矩形',
    polygon: '多边形',
    point: '点',
  };
  return typeMap[type] || type;
};

const selectAnnotation = (annotation) => {
  emit('select', annotation);
};

const deleteAnnotation = (annotation) => {
  emit('delete', annotation);
};

const toggleVisibility = (annotation) => {
  emit('toggle-visibility', annotation);
};

const clearAll = () => {
  emit('clear-all');
};
</script>

<style scoped lang="scss">
.annotation-object-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.object-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &.active {
    background: #eff6ff;
    border-color: #3b82f6;
  }
}

.object-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.object-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.object-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.object-label {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.object-type {
  font-size: 11px;
  color: #6b7280;
}

.object-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-list {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
