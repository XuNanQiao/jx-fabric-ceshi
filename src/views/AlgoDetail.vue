<template>
  <div class="algo-detail-page">
    <div class="algo-header-card">
      <div class="algo-header-main">
        <div class="algo-title-wrap">
          <div class="algo-name">{{ algoInfo.name }}</div>
        </div>
        <div class="algo-header-actions">
          <el-button @click="goBack">返回</el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">采集数量</div>
        <div class="stat-value">-<span class="stat-unit">个</span></div>
      </div>

      <div class="stat-card">
        <div class="stat-title">标注数量</div>
        <div class="stat-value">-<span class="stat-unit">个</span></div>
      </div>

      <div class="stat-card">
        <div class="stat-title">平均准确率</div>
        <div class="stat-value">-<span class="stat-unit">%</span></div>
      </div>
    </div>

    <!-- 状态标签 -->
    <div class="status-badges">
      <span class="status-badge status-badge--incomplete">未完成</span>
      <span class="status-badge status-badge--unpublished">未发布全局</span>
    </div>

    <div class="algo-content">
      <div class="algo-lists-grid">
        <!-- 下发列表 -->
        <div class="algo-section">
          <div class="section-header" @click="toggleOffline">
            <el-icon class="section-icon">
              <ArrowRight :class="{ rotated: offlineExpanded }" />
            </el-icon>
            <span class="section-title">下发列表</span>
          </div>

          <el-collapse-transition>
            <div v-show="offlineExpanded" class="section-content">
              <el-table
                :data="offlineList"
                class="algo-table">
                <el-table-column prop="releaseTime" label="下发时间" min-width="180" />
                <el-table-column prop="updateStatus" label="更新状态" min-width="180" />
                <el-table-column prop="releaseProgress" label="更新进度" min-width="160" />
                <el-table-column prop="releaseResult" label="下发结果" min-width="140" />
                <el-table-column prop="updateLog" label="更新日志" min-width="180" />
              </el-table>

              <div v-if="!offlineList.length" class="empty-content">
                暂无数据
              </div>
            </div>
          </el-collapse-transition>
        </div>

        <!-- 在线以列表 -->
        <div class="algo-section">
          <div class="section-header" @click="toggleOnline">
            <el-icon class="section-icon">
              <ArrowRight :class="{ rotated: onlineExpanded }" />
            </el-icon>
            <span class="section-title">在线以列表</span>
          </div>

          <el-collapse-transition>
            <div v-show="onlineExpanded" class="section-content">
              <div
                v-for="item in onlineList"
                :key="item.id"
                class="online-item"
                @click="handleOnlineItemClick(item)">
                <div class="online-header">
                  <span class="online-title">{{ item.name }}</span>
                  <el-icon class="arrow-icon">
                    <ArrowRight />
                  </el-icon>
                </div>
              </div>

              <div v-if="!onlineList.length" class="empty-content">
                暂无数据
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

const props = defineProps({
  routeInfo: {
    type: Object,
    default: () => ({}),
  },
});

const offlineExpanded = ref(true);
const onlineExpanded = ref(true);

const algoInfo = computed(() => {
  const algoId = props.routeInfo.algoId || '4c4de546-3d1d-4eca-bfec-80b4a29f1e0f';
  const name = props.routeInfo.name || 'pb-det-wcgzagm';

  return {
    algoId,
    name,
  };
});

const offlineList = ref([]);

const onlineList = ref([
  {
    id: 1,
    name: 'pb-det-wcgzagm',
    modelId: 'E2024070281.E2024070281-003.at-det-wcgzagm.m-yolov8det-wcgzagm',
    codeVersion: 'yolov8_det_wcgzagm',
    paramConfig: '-',
  },
]);

const toggleOffline = () => {
  offlineExpanded.value = !offlineExpanded.value;
};

const toggleOnline = () => {
  onlineExpanded.value = !onlineExpanded.value;
};

const handleOnlineItemClick = (item) => {
  // 生成算法实例详情页的 URL
  const algoId = item.id || 'default-id';
  const name = encodeURIComponent(item.name);
  window.location.hash = `#/project-manage/algo-instance/${algoId}?name=${name}`;
};

const goBack = () => {
  window.history.back();
};
</script>

<style scoped lang="scss">
.algo-detail-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 6px 10px;
}

.algo-header-card {
  border-radius: 14px;
  border: 1px solid #e6edf7;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  padding: 16px 18px;
}

.algo-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.algo-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
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

.stat-title {
  font-size: 11px;
  color: #7c8fac;
  margin-bottom: 5px;
  font-weight: 600;
}

.stat-value {
  font-size: 21px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.stat-unit {
  font-size: 12px;
  margin-left: 4px;
  color: #7c8fac;
}

.status-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;

  &--incomplete {
    background: rgba(242, 164, 35, 0.12);
    color: #c77d0e;
  }

  &--unpublished {
    background: rgba(93, 135, 255, 0.12);
    color: #5d87ff;
  }
}

.algo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.algo-lists-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-items: start;
}

.algo-section {
  position: relative;
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(93, 135, 255, 0.18), rgba(255, 255, 255, 0.9));
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  background: #ffffff;
  transition: background 0.2s;
  position: relative;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.2px;

  &::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 0;
    height: 1px;
    background: #edf1f6;
  }

  &:hover {
    background: #f8fafc;
  }
}

.section-icon {
  font-size: 16px;
  color: #64748b;
  transition: transform 0.3s;

  &.rotated {
    transform: rotate(90deg);
  }
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.section-content {
  padding: 0;
}

.algo-table {
  width: 100%;

  :deep(.el-table__header-wrapper) {
    .el-table__header {
      th {
        background: #fafbfe;
        color: #506079;
        font-weight: 600;
        font-size: 12px;
        border-bottom: 1px solid #edf1f6;
      }
    }
  }

  :deep(.el-table__body-wrapper) {
    .el-table__body {
      font-size: 13px;
      color: #53657d;
    }
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}

.empty-content {
  padding: 60px 20px;
  text-align: center;
  color: #9aa7ba;
  font-size: 13px;
  font-weight: 500;
  background: white;
}

.online-item {
  border-bottom: 1px solid #edf1f6;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
}

.online-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  user-select: none;
}

.online-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.arrow-icon {
  font-size: 14px;
  color: #94a3b8;
  transition: transform 0.2s, color 0.2s;

  .online-item:hover & {
    color: #64748b;
    transform: translateX(2px);
  }
}

@media (max-width: 768px) {
  .algo-header-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .algo-lists-grid {
    grid-template-columns: 1fr;
  }
}
</style>
