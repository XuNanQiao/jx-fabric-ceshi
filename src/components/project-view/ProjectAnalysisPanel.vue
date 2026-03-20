<template>
  <div class="pv-analysis-view">
    <div class="pv-analysis-head">
      <div class="pv-analysis-banner">
        <span class="pv-banner-accent"></span>
        <div class="pv-banner-track"></div>
        <div class="pv-banner-text">
          <strong>智能体状态：未运行</strong>
          <span>下次自动评估计划：-</span>
        </div>
      </div>

      <div class="pv-analysis-actions">
        <el-button type="primary" class="pv-run-btn">立即执行评估</el-button>
        <el-button class="pv-return-btn" @click="emit('back')">切换到项目视图</el-button>
      </div>
    </div>

    <div class="pv-analysis-panel">
      <div class="pv-analysis-filter">
        <span class="pv-analysis-label">请选择要查看的评估报告：</span>
        <el-select
          v-model="reportModel"
          placeholder="请选择"
          class="pv-analysis-select">
          <el-option
            v-for="item in reportOptions"
            :key="item"
            :label="item"
            :value="item" />
        </el-select>
      </div>

      <div class="pv-report-summary">
        <span class="pv-report-title">评估报告 {{ selectedReport }}</span>
        <span class="pv-report-item is-warning">发现问题 176</span>
        <span class="pv-report-item is-danger">紧急问题 16</span>
      </div>

      <div class="pv-analysis-grid">
        <div
          v-for="issue in issueCards"
          :key="issue.id"
          class="pv-issue-card"
          :class="`is-${issue.level}`">
          <div class="pv-issue-code">{{ issue.code }}</div>
          <div class="pv-issue-title">{{ issue.title }}</div>
          <div class="pv-issue-desc">{{ issue.issue }}</div>

          <div class="pv-issue-meta">
            <div class="pv-issue-row">
              <div class="pv-issue-label">
                <el-icon><Calendar /></el-icon>
                <span>交付日期</span>
              </div>
              <span>{{ issue.deliveryDate }}</span>
            </div>
            <div class="pv-issue-row">
              <div class="pv-issue-label">
                <el-icon><User /></el-icon>
                <span>现场负责人</span>
              </div>
              <span>{{ issue.owner }}</span>
            </div>
          </div>

          <div class="pv-issue-actions">
            <el-button>查看更多</el-button>
            <el-button type="primary">修复</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar, User } from '@element-plus/icons-vue';

const props = defineProps({
  selectedReport: {
    type: String,
    default: '',
  },
  reportOptions: {
    type: Array,
    default: () => [],
  },
  issueCards: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:selectedReport', 'back']);

const reportModel = computed({
  get: () => props.selectedReport,
  set: (value) => emit('update:selectedReport', value),
});
</script>

<style scoped lang="scss">
.pv {
  &-analysis {
    &-view {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    &-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    &-banner {
      position: relative;
      flex: 1;
      min-height: 52px;
      display: flex;
      align-items: center;
      padding: 0 16px 0 22px;
      border-radius: 10px;
      overflow: hidden;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid #e6edf7;
      box-shadow: 0 8px 18px rgba(93, 135, 255, 0.06);
    }

    &-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &-panel {
      border-radius: 12px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      border: 1px solid #e8eef7;
      box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
      overflow: hidden;

      :deep(.el-select__wrapper) {
        min-height: 34px;
        border-radius: 8px;
        box-shadow: 0 0 0 1px #e4ebf5 inset;
        background: #fff;

        &.is-focused {
          box-shadow:
            0 0 0 1px rgba(93, 135, 255, 0.34) inset,
            0 8px 18px rgba(93, 135, 255, 0.12);
          transform: translateY(-1px);
        }
      }
    }

    &-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px 10px;
      border-bottom: 1px solid #edf1f6;
    }

    &-label {
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
    }

    &-select {
      width: 160px;
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      max-height: calc(100vh - 270px);
      overflow-y: auto;
      padding: 16px;

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

  &-banner {
    &-accent {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #5d87ff 0%, #49beff 100%);
    }

    &-track {
      position: absolute;
      left: 14px;
      top: 10px;
      bottom: 10px;
      width: 8px;
      background: linear-gradient(180deg, rgba(93, 135, 255, 0.16) 0%, rgba(73, 190, 255, 0.08) 100%);
      border-radius: 999px;
    }

    &-text {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      color: #2a3547;
      font-size: 12px;
      margin-left: 10px;

      strong {
        font-size: 15px;
        font-weight: 700;
      }

      span {
        font-size: 12px;
        font-weight: 600;
        color: #7c8fac;
      }
    }
  }

  &-run-btn,
  &-return-btn {
    height: 36px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
  }

  &-run-btn {
    box-shadow: 0 8px 18px rgba(93, 135, 255, 0.14);
  }

  &-return-btn {
    color: #606266;
    border-color: #dbe4f2;
    background: linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
    box-shadow: none;
  }

  &-report {
    &-summary {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border-bottom: 1px solid #edf1f6;
      font-size: 12px;
    }

    &-title {
      font-size: 14px;
      font-weight: 800;
      color: #2a3547;
    }

    &-item {
      position: relative;
      padding: 0 10px 0 24px;
      height: 24px;
      line-height: 24px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      color: #374151;
      background: #fff7ed;

      &::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        transform: translateY(-50%);
        background: #f59e0b;
      }

      &.is-warning {
        color: #c26a06;
        background: #fff7ed;
      }

      &.is-danger {
        color: #c81e1e;
        background: #fef2f2;

        &::before {
          background: #ef4444;
        }
      }
    }
  }

  &-issue {
    &-card {
      position: relative;
      min-height: 168px;
      padding: 14px 14px 12px 16px;
      border-radius: 12px;
      background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
      border: 1px solid #e8eef7;
      box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;

      &:hover {
        transform: translateY(-3px);
        border-color: rgba(93, 135, 255, 0.22);
        box-shadow: 0 10px 22px rgba(31, 41, 55, 0.08);
      }

      &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: #f59e0b;
      }

      &.is-danger {
        &::before {
          background: #ff2b2b;
        }

        .pv-issue-code {
          color: #dc2626;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.18);

          &::before {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
          }
        }
      }
    }

    &-code,
    &-title,
    &-desc {
      margin-left: 0;
    }

    &-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      color: #d97706;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.22);

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
      }
    }

    &-title {
      min-height: 32px;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.35;
      color: #2f3747;
    }

    &-desc {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #2a3547;
      text-align: center;
    }

    &-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    &-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      color: #4b5563;
    }

    &-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #3f4655;

      :deep(.el-icon) {
        color: #626d83;
      }
    }

    &-actions {
      display: flex;
      justify-content: center;
      gap: 10px;

      :deep(.el-button) {
        height: 26px;
        min-width: 82px;
        padding: 0 10px;
        border-radius: 6px;
        font-size: 11px;
      }

      :deep(.el-button--default) {
        border-color: #dbe4f2;
        color: #606266;
        background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
      }

      :deep(.el-button--primary) {
        box-shadow: 0 8px 16px rgba(93, 135, 255, 0.14);
      }
    }
  }
}

@media (max-width: 1400px) {
  .pv-analysis-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .pv-analysis-head {
    flex-direction: column;
    align-items: stretch;
  }

  .pv-analysis-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .pv-analysis-filter,
  .pv-report-summary,
  .pv-banner-text,
  .pv-analysis-actions {
    flex-wrap: wrap;
  }

  .pv-analysis-grid {
    grid-template-columns: 1fr;
  }
}
</style>
