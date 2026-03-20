<template>
  <div class="pv-detail-page">
    <ProjectDetailHero
      :selected-project="selectedProject"
      :current-detail="currentDetail"
      :detail-owner-initial="detailOwnerInitial"
      :project-status-tone="projectStatusTone"
      @back="emit('back')"
      @switch-analysis="emit('switch-analysis')" />

    <div class="pv-detail-summary-grid">
      <div
        v-for="item in detailMetricCards"
        :key="item.label"
        class="pv-summary-card"
        :class="`is-${item.tone}`">
        <div class="pv-summary-head">
          <span class="pv-summary-label">{{ item.label }}</span>
          <div class="pv-summary-icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
        </div>
        <div class="pv-summary-value">
          {{ item.value }}
          <span v-if="item.unit" class="pv-summary-unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>

    <div class="pv-detail-dashboard">
      <div class="pv-dashboard-card pv-progress-card">
        <div class="pv-dashboard-head">
          <div class="pv-dashboard-title">
            <el-icon><RefreshRight /></el-icon>
            <span>项目交付进度</span>
          </div>
          <span class="pv-dashboard-link">{{ lastUpdateDate }} 更新</span>
        </div>

        <div class="pv-progress-card-body">
          <div class="pv-progress-ring" :style="progressRingStyle(currentDetail.progress)">
            <div class="pv-progress-ring-inner">
              <strong>{{ currentDetail.progress }}%</strong>
              <span>IN PROGRESS</span>
            </div>
          </div>

          <div class="pv-progress-meta">
            <span>最近更新时间</span>
            <strong>{{ currentDetail.lastUpdate }}</strong>
          </div>
        </div>
      </div>

      <div class="pv-dashboard-card">
        <div class="pv-dashboard-head">
          <div class="pv-dashboard-title is-warning">
            <el-icon><Warning /></el-icon>
            <span>项目异常概览</span>
          </div>
          <!-- <span class="pv-dashboard-link">查看全部</span> -->
        </div>

        <div class="pv-dashboard-card-body is-column">
          <template v-if="currentDetail.issues.length">
            <div
              v-for="issue in currentDetail.issues"
              :key="issue"
              class="pv-detail-tag is-warning">
              {{ issue }}
            </div>
          </template>
          <div v-else class="pv-dashboard-empty">
            <el-icon><Warning /></el-icon>
            <span>暂无数据内容</span>
          </div>
        </div>
      </div>

      <div class="pv-dashboard-card">
        <div class="pv-dashboard-head">
          <div class="pv-dashboard-title">
            <el-icon><Document /></el-icon>
            <span>更新日志</span>
          </div>
          <span class="pv-dashboard-link">日志详情</span>
        </div>

        <div class="pv-dashboard-card-body is-column">
          <template v-if="currentDetail.logs.length">
            <div
              v-for="log in currentDetail.logs"
              :key="log"
              class="pv-detail-log-item">
              {{ log }}
            </div>
          </template>
          <div v-else class="pv-dashboard-empty">
            <el-icon><Document /></el-icon>
            <span>暂无数据内容</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pv-detail-site-panel modern-site-panel">
      <div class="pv-modern-site-head">
        <div class="pv-modern-site-title-row">
          <div class="pv-detail-site-head">站点列表</div>
          <div class="pv-site-filter-tabs">
            <span class="pv-site-filter-chip is-active">全部 ({{ siteSummary.total }})</span>
            <span class="pv-site-filter-chip">运行中 ({{ siteSummary.running }})</span>
            <span class="pv-site-filter-chip">故障 ({{ siteSummary.fault }})</span>
          </div>
        </div>
        <el-button text circle class="pv-site-filter-btn">
          <el-icon><MoreFilled /></el-icon>
        </el-button>
      </div>

      <div class="pv-detail-site-body modern-site-body">
        <template v-if="normalizedSites.length">
          <div class="pv-site-table-head">
            <span>站点名称</span>
            <span>精度 (ACCURACY)</span>
            <span>状态指标</span>
            <span>部署时间</span>
            <span>操作</span>
          </div>

          <div class="pv-modern-site-list">
            <div
              v-for="site in normalizedSites"
              :key="site.name"
              class="pv-modern-site-row"
              @click="openSiteDetail(site)">
              <div class="pv-modern-site-name-cell">
                <div class="pv-modern-site-icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="pv-modern-site-name-block">
                  <div class="pv-modern-site-name">{{ site.name }}</div>
                </div>
              </div>

              <div class="pv-modern-site-accuracy">
                <strong>{{ site.accuracy }}%</strong>
                <div class="pv-modern-inline-progress">
                  <span :style="{ width: `${Math.max(site.accuracy, 4)}%` }"></span>
                </div>
              </div>

              <div class="pv-modern-site-status">
                <span class="pv-status-chip" :class="`is-${site.tone}`">
                  {{ site.statusLabel }}
                </span>
              </div>

              <div class="pv-modern-site-time">{{ site.updatedAt }}</div>

              <div class="pv-modern-site-actions">
                <el-button text circle @click.stop="openSiteDetail(site)">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无站点数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  CircleCheck,
  Connection,
  Cpu,
  Document,
  Download,
  Location,
  MoreFilled,
  RefreshRight,
  Warning,
} from '@element-plus/icons-vue';
import ProjectDetailHero from './ProjectDetailHero.vue';

const props = defineProps({
  selectedProject: {
    type: Object,
    required: true,
  },
  currentDetail: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back', 'switch-analysis']);

const detailOwnerInitial = computed(() => props.selectedProject?.owner?.slice(0, 1) || 'A');

const lastUpdateDate = computed(() => props.currentDetail?.lastUpdate?.split(' ')?.[0] || '-');

const metricValueByLabel = (label, fallback = '0') => {
  return props.currentDetail.metrics.find((item) => item.label === label)?.value ?? fallback;
};

const detailMetricCards = computed(() => {
  return [
    { label: '站点总数', value: metricValueByLabel('站点数量'), unit: '', icon: Location, tone: 'blue' },
    { label: '关联算法', value: metricValueByLabel('关键算法'), unit: '', icon: Connection, tone: 'violet' },
    { label: '关联设备', value: metricValueByLabel('关键设备'), unit: '', icon: Cpu, tone: 'orange' },
    { label: '采集量', value: metricValueByLabel('采集数量'), unit: '', icon: Download, tone: 'slate' },
    { label: '标注量', value: metricValueByLabel('标注数量'), unit: '', icon: Document, tone: 'slate' },
    { label: '合规率', value: props.currentDetail.progress, unit: '%', icon: CircleCheck, tone: 'green' },
  ];
});

const projectStatusTone = (status) => {
  if (!status) return 'blue';
  if (status.includes('完成')) return 'green';
  if (status.includes('故障') || status.includes('异常')) return 'danger';
  if (status.includes('未开始')) return 'slate';
  return 'blue';
};

const siteStatusTone = (status) => {
  if (!status) return 'blue';
  if (status.includes('运行')) return 'blue';
  if (status.includes('完成')) return 'green';
  if (status.includes('故障') || status.includes('异常')) return 'danger';
  if (status.includes('部署') || status.includes('配置')) return 'warning';
  return 'blue';
};

const siteAccuracyPercent = (site) => {
  const value = Number(site?.accuracy ?? 0);
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(value), 0), 100);
};

const normalizedSites = computed(() => {
  return props.currentDetail.sites.map((site, index) => ({
    ...site,
    stationSn: site.stationSn || `${props.selectedProject.code}-${String(index + 1).padStart(3, '0')}`,
    accuracy: siteAccuracyPercent(site),
    statusLabel: site.status || '初始部署',
    tone: siteStatusTone(site.status),
    updatedAt: site.updatedAt || props.currentDetail.lastUpdate || '-',
  }));
});

const siteSummary = computed(() => {
  const sites = normalizedSites.value;
  return {
    total: sites.length,
    running: sites.filter((site) => site.tone === 'blue' || site.tone === 'green').length,
    fault: sites.filter((site) => site.tone === 'danger').length,
  };
});

const progressRingStyle = (percent) => {
  const value = Math.min(Math.max(Number(percent) || 0, 0), 100);
  return {
    background: `conic-gradient(#2468e5 ${value * 3.6}deg, #e9eef8 0deg)`,
  };
};

const openSiteDetail = (site) => {
  const projectCode = encodeURIComponent(props.selectedProject?.code || 'unknown');
  const stationSn = encodeURIComponent(site.stationSn || site.name);
  const siteName = encodeURIComponent(site.name || '站点详情');
  window.location.hash = `#/project-manage/station/${projectCode}?station_sn=${stationSn}&site_name=${siteName}`;
};
</script>

<style scoped lang="scss">
.pv {
  &-detail {
    &-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 2px 0 4px;
    }

    &-summary-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 14px;
    }

    &-dashboard {
      display: grid;
      grid-template-columns: 1.1fr 1fr 1fr;
      gap: 16px;
    }

    &-tag {
      padding: 5px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      color: #c26a06;
      background: #fff7ed;
      border: 1px solid rgba(245, 158, 11, 0.12);
    }

    &-log-item {
      width: 100%;
      padding: 8px 10px;
      border-radius: 8px;
      text-align: left;
      color: #4b5563;
      background: #f8fbff;
      border: 1px solid #eef3f8;
    }

    &-site-head {
      padding: 0;
      border: none;
      background: transparent;
      font-size: 28px;
      line-height: 1;
      font-weight: 700;
      color: #2f3747;
    }
  }

  &-summary {
    &-card {
      position: relative;
      padding: 16px 16px 18px;
      border-radius: 18px;
      border: 1px solid #d9e2f0;
      background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 3px;
        background: linear-gradient(90deg, #2468e5, #4fb7ff);
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      &:hover::after {
        opacity: 1;
      }

      &.is-blue .pv-summary-icon {
        background: #eaf2ff;
        color: #2468e5;
      }

      &.is-violet .pv-summary-icon {
        background: #f1e8ff;
        color: #8b5cf6;
      }

      &.is-orange .pv-summary-icon {
        background: #fff1e8;
        color: #f97316;
      }

      &.is-slate .pv-summary-icon {
        background: #f3f6fb;
        color: #94a3b8;
      }

      &.is-green {
        .pv-summary-icon {
          background: #e8faf3;
          color: #059669;
        }

        &::after {
          opacity: 1;
          background: linear-gradient(90deg, #2468e5, #2468e5);
        }
      }
    }

    &-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 18px;
    }

    &-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
    }

    &-icon {
      width: 36px;
      height: 36px;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    &-value {
      font-size: 40px;
      line-height: 1;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.04em;
    }

    &-unit {
      margin-left: 4px;
      font-size: 14px;
      color: #64748b;
      font-weight: 700;
    }
  }

  &-dashboard {
    &-card {
      border-radius: 22px;
      border: 1px solid #d9e2f0;
      background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
      padding: 18px 18px 20px;

      &-body {
        min-height: 166px;

        &.is-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      }
    }

    &-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    &-title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 800;
      color: #1f2937;

      :deep(.el-icon) {
        color: #2468e5;
      }

      &.is-warning :deep(.el-icon) {
        color: #f97316;
      }
    }

    &-link {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
    }

    &-empty {
      min-height: 166px;
      border-radius: 16px;
      border: 1px dashed #dbe4f2;
      background: linear-gradient(180deg, #fbfdff 0%, #f8fbff 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #94a3b8;

      :deep(.el-icon) {
        font-size: 34px;
      }
    }
  }

  &-progress {
    &-card-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
    }

    &-ring {
      width: 132px;
      height: 132px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &-inner {
        width: 104px;
        height: 104px;
        border-radius: 50%;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 0 0 1px rgba(217, 226, 240, 0.8);

        strong {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        span {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #94a3b8;
        }
      }
    }

    &-meta {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-top: 4px;
      font-size: 12px;
      color: #64748b;

      strong {
        color: #334155;
        font-weight: 700;
      }
    }
  }

  &-modern {
    &-site {
      &-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 18px 20px;
        border-bottom: 1px solid #e9edf5;
        background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      }

      &-title-row {
        display: flex;
        align-items: center;
        gap: 18px;
        flex-wrap: wrap;
      }

      &-list {
        display: flex;
        flex-direction: column;
      }

      &-row {
        display: grid;
        grid-template-columns: 2.2fr 1.2fr 1.2fr 1fr 80px;
        gap: 18px;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #edf2f8;
        transition: background 0.2s ease;
        cursor: pointer;

        &:hover {
          background: #fbfdff;
        }

        &:last-child {
          border-bottom: none;
        }
      }

      &-name-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      &-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #eaf2ff 0%, #edf5ff 100%);
        color: #2468e5;
        flex-shrink: 0;
      }

      &-name {
        font-size: 14px;
        font-weight: 700;
        color: #1f2937;
        line-height: 1.5;
        word-break: break-all;
      }

      &-accuracy {
        display: flex;
        flex-direction: column;
        gap: 8px;

        strong {
          font-size: 13px;
          color: #334155;
        }
      }

      &-inline-progress {
        position: relative;
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        background: #e9eef6;

        span {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #2468e5, #57b8ff);
        }
      }

      &-time {
        font-size: 13px;
        color: #64748b;
      }

      &-actions {
        display: flex;
        justify-content: center;
      }
    }
  }

  &-site {
    &-filter-tabs {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    &-filter-chip {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      border-radius: 999px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;

      &.is-active {
        color: #0f172a;
        background: #eef5ff;
      }
    }

    &-filter-btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      color: #64748b;
      background: #f8fbff;
      border: 1px solid #e6edf7;
    }

    &-table-head {
      display: grid;
      grid-template-columns: 2.2fr 1.2fr 1.2fr 1fr 80px;
      gap: 18px;
      align-items: center;
      padding: 16px 20px 14px;
      background: #f8fbff;
      border-bottom: 1px solid #e9edf5;
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  }

  &-status-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;

    &.is-blue {
      color: #2468e5;
      background: #eaf2ff;
    }

    &.is-warning {
      color: #d97706;
      background: #fff7ed;
    }

    &.is-green {
      color: #059669;
      background: #e8faf3;
    }

    &.is-danger {
      color: #dc2626;
      background: #fef2f2;
    }
  }
}

.modern-site {
  &-panel {
    border-radius: 22px;
    border: 1px solid #e6edf7;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    box-shadow: 0 3px 12px rgba(31, 41, 55, 0.05);
    overflow: hidden;
  }

  &-body {
    padding: 0;
    min-height: 250px;
    background: #ffffff;

    :deep(.el-empty) {
      padding: 42px 0;
    }

    :deep(.el-empty__description) {
      color: #7c8fac;
    }
  }
}

@media (max-width: 1400px) {
  .pv-detail-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pv-detail-dashboard {
    grid-template-columns: 1fr 1fr;
  }

  .pv-progress-card {
    grid-column: span 2;
  }
}

@media (max-width: 1100px) {
  .pv-detail-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pv-detail-dashboard {
    grid-template-columns: 1fr;
  }

  .pv-progress-card {
    grid-column: auto;
  }

  .pv-modern-site-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .pv-site-table-head,
  .pv-modern-site-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 64px;
  }

}

@media (max-width: 768px) {
  .pv-detail-summary-grid {
    grid-template-columns: 1fr;
  }

  .pv-modern-site-title-row {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .pv-site-table-head {
    display: none;
  }

  .pv-modern-site-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .pv-modern-site-actions {
    justify-content: flex-start;
  }
}
</style>
