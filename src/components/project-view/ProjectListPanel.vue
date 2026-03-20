<template>
  <div class="pv-list-view">
    <div class="pv-toolbar-card">
      <div class="pv-toolbar-left">
        <div class="pv-toolbar-item">
          <span class="pv-toolbar-label">项目：</span>
          <el-select
            v-model="projectModel"
            placeholder="请选择"
            clearable
            class="pv-select">
            <el-option
              v-for="item in projectOptions"
              :key="item"
              :label="item"
              :value="item" />
          </el-select>
        </div>

        <div class="pv-toolbar-item">
          <span class="pv-toolbar-label">状态：</span>
          <el-select
            v-model="statusModel"
            placeholder="进行中"
            clearable
            class="pv-status-select">
            <el-option
              v-for="item in statusOptions"
              :key="item"
              :label="item"
              :value="item" />
          </el-select>
        </div>

        <el-button
          type="primary"
          class="pv-query-btn">
          查询
        </el-button>
      </div>

      <el-button
        class="pv-switch-btn"
        @click="emit('switch-analysis')">
        切换到辅助分析
      </el-button>
    </div>

    <div class="pv-project-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @detail="emit('detail', $event)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ProjectCard from '../ProjectCard.vue';

const props = defineProps({
  projectFilter: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
  projectOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  filteredProjects: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:projectFilter', 'update:statusFilter', 'switch-analysis', 'detail']);

const projectModel = computed({
  get: () => props.projectFilter,
  set: (value) => emit('update:projectFilter', value),
});

const statusModel = computed({
  get: () => props.statusFilter,
  set: (value) => emit('update:statusFilter', value),
});
</script>

<style scoped lang="scss">
.pv {
  &-list-view {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &-toolbar {
    &-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 9px 12px;
      border-radius: 10px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid #e6edf7;
      box-shadow: 0 8px 18px rgba(93, 135, 255, 0.06);

      :deep(.el-select__wrapper) {
        min-height: 36px;
        padding: 0 12px;
        border-radius: 8px;
        box-shadow: 0 0 0 1px #e4ebf5 inset;
        background: #fff;
        font-size: 12px;
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;

        &.is-focused {
          box-shadow:
            0 0 0 1px rgba(93, 135, 255, 0.34) inset,
            0 8px 18px rgba(93, 135, 255, 0.12);
          transform: translateY(-1px);
        }
      }
    }

    &-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    &-label {
      font-size: 12px;
      font-weight: 700;
      color: #2f3747;
    }
  }

  &-select {
    width: 260px;
  }

  &-status-select {
    width: 120px;
  }

  &-query-btn,
  &-switch-btn {
    height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
  }

  &-query-btn {
    box-shadow: 0 8px 18px rgba(93, 135, 255, 0.14);
  }

  &-switch-btn {
    color: #fff;
    background: linear-gradient(90deg, #5d87ff, #49beff);
    border: none;
    box-shadow: 0 8px 16px rgba(93, 135, 255, 0.18);
  }

  &-project-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    max-height: calc(100vh - 188px);
    overflow-y: auto;
    padding-right: 6px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: rgba(201, 208, 218, 0.9);
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}

@media (max-width: 1400px) {
  .pv-project-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .pv-toolbar-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .pv-project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .pv-select,
  .pv-status-select,
  .pv-toolbar-item,
  .pv-toolbar-left {
    width: 100%;
  }

  .pv-project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
