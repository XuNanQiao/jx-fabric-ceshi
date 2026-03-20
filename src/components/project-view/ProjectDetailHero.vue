<template>
  <div class="pv-detail-hero">
    <div class="pv-detail-hero-main">
      <div class="pv-detail-avatar">{{ detailOwnerInitial }}</div>
      <div class="pv-detail-heading">
        <div class="pv-detail-code">{{ selectedProject.code }}</div>
        <div class="pv-detail-title">{{ selectedProject.title }}</div>
        <div class="pv-detail-hero-meta">
          <span class="pv-detail-meta-item">
            <el-icon><User /></el-icon>
            {{ selectedProject.owner }}
          </span>
          <span class="pv-detail-meta-item">
            <el-icon><Calendar /></el-icon>
            最近更新：{{ currentDetail.lastUpdate }}
          </span>
         <!--  <span class="pv-detail-status-pill" :class="`is-${projectStatusTone(selectedProject.status)}`">
            {{ selectedProject.status }}
          </span> -->
        </div>
      </div>
    </div>

    <div class="pv-detail-actions">
      <el-button class="pv-switch-btn" @click="emit('switch-analysis')">新增问题日志</el-button>
    </div>
  </div>
</template>

<script setup>
import { Calendar, User } from '@element-plus/icons-vue';

defineProps({
  selectedProject: {
    type: Object,
    required: true,
  },
  currentDetail: {
    type: Object,
    required: true,
  },
  detailOwnerInitial: {
    type: String,
    default: 'A',
  },
  projectStatusTone: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['back', 'switch-analysis']);
</script>

<style scoped lang="scss">
.pv {
  &-detail {
    &-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 20px 22px;
      border-radius: 22px;
      border: 1px solid #d9e2f0;
      background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);

      &-main {
        display: flex;
        align-items: center;
        gap: 18px;
        min-width: 0;
        flex: 1;
      }

      &-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
    }

    &-avatar {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #dbe9ff 0%, #edf5ff 100%);
      color: #2468e5;
      font-size: 28px;
      font-weight: 800;
      box-shadow:
        inset 0 0 0 1px rgba(36, 104, 229, 0.08),
        0 12px 24px rgba(36, 104, 229, 0.12);
    }

    &-heading {
      min-width: 0;
      flex: 1;

      &::after {
        content: '';
        display: block;
        width: 72px;
        height: 3px;
        margin-top: 10px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(93, 135, 255, 0.95), rgba(73, 190, 255, 0.65));
      }
    }

    &-meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #6b7280;

      :deep(.el-icon) {
        color: #94a3b8;
      }
    }

    &-status-pill {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;

      &.is-blue {
        color: #2468e5;
        background: #eaf2ff;
      }

      &.is-green {
        color: #059669;
        background: #e8faf3;
      }

      &.is-danger {
        color: #dc2626;
        background: #fef2f2;
      }

      &.is-slate {
        color: #64748b;
        background: #f1f5f9;
      }
    }

    &-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 24px;
      padding: 0 10px;
      margin-bottom: 6px;
      border-radius: 999px;
      border: 1px solid rgba(93, 135, 255, 0.18);
      font-size: 11px;
      font-weight: 700;
      color: #5d87ff;
      background: rgba(93, 135, 255, 0.1);
      box-shadow: inset 0 0 0 1px rgba(93, 135, 255, 0.04);

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.12);
      }
    }

    &-title {
      max-width: 860px;
      font-size: 18px;
      font-weight: 800;
      color: #2a3547;
      line-height: 1.45;
      letter-spacing: -0.01em;
    }

    &-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      :deep(.el-button) {
        min-width: 116px;
        height: 36px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;

        &:not(.pv-switch-btn) {
          border-color: #dbe4f2;
          background: linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
          color: #606266;
          box-shadow: none;
        }
      }
    }
  }

  &-switch-btn {
    color: #fff;
    background: linear-gradient(90deg, #5d87ff, #49beff);
    border: none;
    box-shadow: 0 8px 16px rgba(93, 135, 255, 0.18);
  }
}

@media (max-width: 1100px) {
  .pv-detail-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .pv-detail-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .pv-detail-hero-main {
    align-items: flex-start;
  }

  .pv-detail-avatar {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    font-size: 22px;
  }

  .pv-detail-actions {
    width: 100%;
    flex-wrap: wrap;

    :deep(.el-button) {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
