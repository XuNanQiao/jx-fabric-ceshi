<template>
  <div class="sd-masonry">
    <div
      v-for="group in groups"
      :key="group.title"
      class="sd-scene-card">
      <div class="sd-scene-head" @click="handleSceneTitleClick(group)">
        <div class="sd-scene-icon">
          <el-icon><Connection /></el-icon>
        </div>
        <div class="sd-scene-title">{{ group.title }}</div>
      </div>

      <div class="sd-scene-list">
        <div
          v-for="item in group.items"
          :key="`${group.title}-${item.name}`"
          class="sd-scene-item">
          <div class="sd-scene-row">
            <span class="sd-scene-name">{{ item.name }}</span>
            <span class="sd-scene-value" :class="`is-${item.tone || 'green'}`">
              {{ item.value }}
            </span>
          </div>

          <div class="sd-scene-bar">
            <span :class="`is-${item.tone || 'green'}`" :style="{ width: item.width || item.value }"></span>
          </div>

          <div v-if="item.note" class="sd-scene-note">
            <span class="sd-scene-note-dot"></span>
            {{ item.note }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Connection } from '@element-plus/icons-vue';

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
});

const handleSceneTitleClick = (group) => {
  // Generate a unique ID for the algorithm (could be based on title or a real ID from data)
  const algoId = group.id || generateAlgoId(group.title);
  window.location.hash = `#/project-manage/algo/${algoId}`;
};

const generateAlgoId = (title) => {
  // Create a simple UUID-like string based on the title
  // In a real application, this would come from the backend data
  return `${title.split('').map(c => c.charCodeAt(0).toString(16)).join('')}-${Date.now()}`;
};
</script>

<style scoped lang="scss">
.sd-masonry {
  column-count: 3;
  column-gap: 16px;
}

.sd-scene-card {
  break-inside: avoid;
  margin-bottom: 16px;
  padding: 22px 22px 18px;
  border-radius: 24px;
  border: 1px solid #d8e1ee;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.sd-scene-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
}

.sd-scene-icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #2f6deb;
  background: linear-gradient(180deg, #edf4ff 0%, #e8f0ff 100%);
}

.sd-scene-title {
  font-size: 18px;
  font-weight: 800;
  color: #1f2937;
}

.sd-scene-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.sd-scene-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sd-scene-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sd-scene-name {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.sd-scene-value {
  font-size: 14px;
  font-weight: 800;

  &.is-green {
    color: #2dbf7b;
  }

  &.is-orange {
    color: #f59e0b;
  }

  &.is-slate {
    color: #94a3b8;
  }
}

.sd-scene-bar {
  height: 10px;
  border-radius: 999px;
  background: #e9eef5;
  overflow: hidden;

  span {
    display: block;
    height: 100%;
    border-radius: inherit;

    &.is-green {
      background: linear-gradient(90deg, #35c783, #37b978);
    }

    &.is-orange {
      background: linear-gradient(90deg, #ffb11b, #f59e0b);
    }

    &.is-slate {
      background: linear-gradient(90deg, #cbd5e1, #b8c4d3);
    }
  }
}

.sd-scene-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.sd-scene-note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 1400px) {
  .sd-masonry {
    column-count: 2;
  }
}

@media (max-width: 768px) {
  .sd-masonry {
    column-count: 1;
  }
}
</style>
