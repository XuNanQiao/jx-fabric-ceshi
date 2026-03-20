<template>
  <div class="algo-instance-page">
    <div class="algo-instance-header-card">
      <div class="algo-instance-header-main">
        <div class="algo-instance-title-wrap">
          <div class="algo-instance-name">{{ instanceInfo.name }}</div>
          <div class="algo-instance-meta">
            <span>算法ID：{{ instanceInfo.algoId }}</span>
            <span>最近更新时间：{{ instanceInfo.lastUpdate }}</span>
          </div>
        </div>
        <div class="algo-instance-header-actions">
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </div>

    <div class="instance-summary-grid">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="instance-summary-card">
        <div class="instance-summary-label">{{ card.label }}</div>
        <div class="instance-summary-value">
          {{ card.value }}
          <span v-if="card.unit" class="instance-summary-unit">{{ card.unit }}</span>
        </div>
      </div>
    </div>

    <div class="instance-panel-grid">
      <div class="instance-panel-card">
        <div class="instance-panel-title">模型信息</div>
        <div class="instance-info-list">
          <div class="instance-info-item">
            <span class="instance-info-label">模型ID:</span>
            <span class="instance-info-value">{{ instanceInfo.modelId }}</span>
          </div>
          <div class="instance-info-item">
            <span class="instance-info-label">代码版本:</span>
            <span class="instance-info-value">{{ instanceInfo.codeVersion }}</span>
          </div>
          <div class="instance-info-item">
            <span class="instance-info-label">参数配置:</span>
            <span class="instance-info-value">{{ instanceInfo.paramConfig }}</span>
          </div>
        </div>
      </div>

      <div class="instance-panel-card">
        <div class="instance-panel-title">性能指标</div>
        <div class="instance-metrics">
          <div class="metric-item">
            <div class="metric-label">准确率</div>
            <div class="metric-value">{{ instanceInfo.accuracy }}<span class="metric-unit">%</span></div>
          </div>
          <div class="metric-item">
            <div class="metric-label">召回率</div>
            <div class="metric-value">{{ instanceInfo.recall }}<span class="metric-unit">%</span></div>
          </div>
          <div class="metric-item">
            <div class="metric-label">推理速度</div>
            <div class="metric-value">{{ instanceInfo.inferenceSpeed }}<span class="metric-unit">ms</span></div>
          </div>
        </div>
      </div>

      <div class="instance-panel-card">
        <div class="instance-panel-title">运行日志</div>
        <div v-if="instanceInfo.logs.length" class="instance-log-list">
          <div
            v-for="log in instanceInfo.logs"
            :key="log"
            class="instance-log-item">
            {{ log }}
          </div>
        </div>
        <el-empty v-else description="暂无数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  routeInfo: {
    type: Object,
    default: () => ({}),
  },
});

const instanceInfo = computed(() => {
  const algoId = props.routeInfo.algoId || '1';
  const name = props.routeInfo.name || 'pb-det-wcgzagm';

  return {
    algoId,
    name,
    modelId: 'E2024070281.E2024070281-003.at-det-wcgzagm.m-yolov8det-wcgzagm',
    codeVersion: 'yolov8_det_wcgzagm',
    paramConfig: '默认配置',
    lastUpdate: '2026-03-12 14:30:25',
    accuracy: 94.5,
    recall: 92.3,
    inferenceSpeed: 15.6,
    logs: [
      '2026-03-12 10:20:15 模型部署成功',
      '2026-03-12 11:45:30 开始推理任务',
      '2026-03-12 14:30:25 完成100次推理',
    ],
  };
});

const summaryCards = computed(() => [
  { label: '模型版本', value: 'v1.0.3', unit: '' },
  { label: '部署状态', value: '运行中', unit: '' },
  { label: '推理次数', value: '1,240', unit: '次' },
  { label: 'GPU使用率', value: '45', unit: '%' },
]);

const goBack = () => {
  window.history.back();
};
</script>

<style scoped lang="scss">
.algo-instance-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 6px 10px;
}

.algo-instance-header-card {
  border-radius: 14px;
  border: 1px solid #e6edf7;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  padding: 16px 18px;
}

.algo-instance-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.algo-instance-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.algo-instance-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #64748b;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.instance-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.instance-summary-card {
  position: relative;
  padding: 13px 15px 11px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 11px;
  border: 1px solid #e8eef7;
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.05);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, #5d87ff, #49beff);
  }
}

.instance-summary-label {
  font-size: 11px;
  color: #7c8fac;
  margin-bottom: 5px;
  font-weight: 600;
}

.instance-summary-value {
  font-size: 21px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.instance-summary-unit {
  font-size: 12px;
  margin-left: 4px;
  color: #7c8fac;
}

.instance-panel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.instance-panel-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04);
  padding: 16px;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(93, 135, 255, 0.18), rgba(255, 255, 255, 0.9));
  }
}

.instance-panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf1f6;
}

.instance-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instance-info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
}

.instance-info-label {
  color: #64748b;
  font-weight: 600;
  min-width: 80px;
  flex-shrink: 0;
}

.instance-info-value {
  color: #334155;
  font-weight: 500;
  word-break: break-all;
  flex: 1;
}

.instance-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 11px;
  color: #7c8fac;
  margin-bottom: 8px;
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.metric-unit {
  font-size: 12px;
  margin-left: 4px;
  color: #7c8fac;
}

.instance-log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.instance-log-item {
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 12px;
  color: #475569;
  border-left: 3px solid #5d87ff;
}

@media (max-width: 1280px) {
  .instance-panel-grid {
    grid-template-columns: 1fr;
  }

  .instance-metrics {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .algo-instance-header-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .instance-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .instance-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
