<template>
  <div class="overview-page">
    <section class="overview-main-grid">
      <div class="overview-left-column">
        <div class="overview-panel map-panel">
          <div class="panel-body panel-body--tight">
            <div class="map-heading">
              <div class="map-heading__eyebrow">区域概览</div>
              <div class="map-heading__title">中国网络分布图</div>
            </div>
            <div class="map-legend">
              <span v-for="item in legendItems" :key="item.label" class="legend-item">
                <i class="legend-dot" :style="{ background: item.color }"></i>
                {{ item.label }}
              </span>
            </div>

            <div class="china-board">
              <div ref="mapChartRef" class="china-map" aria-label="全国站点地图"></div>
            </div>
          </div>
        </div>

        <section class="overview-panel metrics-panel">
          <div class="panel-body metrics-body">
            <div class="summary-card">
              <div class="summary-card__head">
                <div>
                  <div class="summary-card__caption">本周标注进度</div>
                  <div class="summary-card__title">标注进度</div>
                </div>
                <div class="summary-card__meta is-positive">+12%</div>
              </div>
              <svg viewBox="0 0 320 170" class="chart-svg chart-svg--summary" aria-hidden="true">
                <g>
                  <rect v-for="bar in weeklyBars" :key="bar.label" :x="bar.x" :y="bar.y" width="20" :height="bar.height" rx="3" class="mini-bar-chart mini-bar-chart--soft" />
                </g>
              </svg>
            </div>

            <div class="summary-card">
              <div class="summary-card__head">
                <div>
                  <div class="summary-card__caption">月度采集情况</div>
                  <div class="summary-card__title">月度采集</div>
                </div>
                <div class="summary-card__meta is-primary">1,240 Total</div>
              </div>
              <svg viewBox="0 0 320 170" class="chart-svg chart-svg--summary" aria-hidden="true">
                <polyline :points="collectionTrend" class="mini-line-chart" />
                <line x1="84" y1="142" x2="240" y2="142" class="mini-line-chart__base" />
              </svg>
            </div>

            <div class="summary-card">
              <div class="summary-card__head">
                <div>
                  <div class="summary-card__caption">项目达标情况</div>
                  <div class="summary-card__title">项目达标</div>
                </div>
                <div class="summary-card__meta is-positive">92%</div>
              </div>
              <svg viewBox="0 0 320 170" class="chart-svg chart-svg--summary" aria-hidden="true">
                <g>
                  <rect v-for="bar in projectBars" :key="bar.label" :x="bar.x" :y="bar.y" width="8" :height="bar.height" rx="3" class="project-mini-bar" />
                </g>
              </svg>
            </div>
          </div>
        </section>
      </div>

      <div class="overview-right-column">
        <div class="overview-panel side-panel">
          <div class="panel-title">
            <span class="panel-title__icon">
              <el-icon><Document /></el-icon>
            </span>
            <span>训练任务</span>
          </div>
          <div class="panel-body task-panel-body">
            <div class="simple-table">
              <div class="simple-table__head">
                <span>站点名称</span>
                <span>算法名称</span>
                <span>管线块</span>
                <span>耗时</span>
              </div>
              <div class="task-empty-state">
                <div class="task-empty-state__icon"></div>
                <div class="task-empty-state__text">暂无数据</div>
              </div>
            </div>
          </div>
        </div>

        <div class="overview-panel side-panel">
          <div class="panel-title">
            <span class="panel-title__icon">
              <el-icon><DocumentCopy /></el-icon>
            </span>
            <span>站点提升情况</span>
            <a class="panel-title__link">查看全部</a>
          </div>
          <div class="panel-body station-panel-body">
            <div class="station-list">
              <article v-for="station in stationStatus" :key="station.id" class="station-card">
                <div class="station-card__main">
                  <div class="station-meta">
                    <div class="station-name">{{ station.name }}</div>
                    <div class="station-code">{{ station.code }}</div>
                    <span class="station-tag" :class="`is-${station.tagTone}`">{{ station.tag }}</span>
                  </div>
                  <div class="station-trend">
                    <div class="station-trend__chart" :ref="(el) => setStationChartRef(el, station.id)" aria-hidden="true"></div>
                    <div class="station-rate">{{ station.rate }} Eff.</div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Document, DocumentCopy } from '@element-plus/icons-vue';
import * as echarts from 'echarts';

const legendItems = [
  { label: '采集', color: '#4f7cf7' },
  { label: '下发', color: '#74c8ff' },
  { label: '已交付站点', color: '#18b26c' },
  { label: '交付中站点', color: '#f2a423' },
  { label: '数据中心', color: '#16233b' },
];

const weeklyBars = [
  { label: '1', x: 34, y: 106, height: 40 },
  { label: '2', x: 66, y: 78, height: 68 },
  { label: '3', x: 98, y: 114, height: 32 },
  { label: '4', x: 130, y: 56, height: 90 },
  { label: '5', x: 162, y: 46, height: 100 },
  { label: '6', x: 194, y: 66, height: 80 },
  { label: '7', x: 226, y: 38, height: 108 },
];

const collectionTrend = '120,140 138,140 156,140 174,140 192,140 210,140';

const mapChartRef = ref(null);
let mapChart = null;
const stationChartRefs = new Map();
const stationCharts = new Map();
const chinaGeoJsonUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

const geoCenter = [121.4737, 31.2304];

const stationNodes = [
  { name: '上海', coords: [121.4737, 31.2304], type: '数据中心', size: 16, color: '#fa8b58' },
  { name: '北京', coords: [116.4074, 39.9042], type: '已交付站点', size: 10, color: '#7ad8f5' },
  { name: '天津', coords: [117.2008, 39.0842], type: '交付中站点', size: 9, color: '#f1d15b' },
  { name: '石家庄', coords: [114.5149, 38.0428], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '济南', coords: [117.1201, 36.6512], type: '交付中站点', size: 9, color: '#f1d15b' },
  { name: '太原', coords: [112.5492, 37.857], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '沈阳', coords: [123.4315, 41.8057], type: '已交付站点', size: 8, color: '#7ad8f5' },
  { name: '哈尔滨', coords: [126.6425, 45.7567], type: '已交付站点', size: 8, color: '#7ad8f5' },
  { name: '郑州', coords: [113.6254, 34.7466], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '西安', coords: [108.9398, 34.3416], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '武汉', coords: [114.3055, 30.5928], type: '交付中站点', size: 9, color: '#f1d15b' },
  { name: '南京', coords: [118.7969, 32.0603], type: '已交付站点', size: 8, color: '#7ad8f5' },
  { name: '杭州', coords: [120.1551, 30.2741], type: '已交付站点', size: 8, color: '#7ad8f5' },
  { name: '福州', coords: [119.2965, 26.0745], type: '采集', size: 8, color: '#f1a236' },
  { name: '南昌', coords: [115.8579, 28.682], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '长沙', coords: [112.9388, 28.2282], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '广州', coords: [113.2644, 23.1291], type: '交付中站点', size: 9, color: '#f1d15b' },
  { name: '海口', coords: [110.1983, 20.044], type: '下发', size: 8, color: '#28c76f' },
  { name: '成都', coords: [104.0665, 30.5728], type: '下发', size: 8, color: '#28c76f' },
  { name: '重庆', coords: [106.5516, 29.563], type: '下发', size: 8, color: '#28c76f' },
  { name: '贵阳', coords: [106.6302, 26.647], type: '采集', size: 8, color: '#f1a236' },
  { name: '昆明', coords: [102.8329, 24.8801], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '兰州', coords: [103.8343, 36.0611], type: '交付中站点', size: 8, color: '#f1d15b' },
  { name: '南宁', coords: [108.3669, 22.817], type: '采集', size: 8, color: '#f1a236' },
];

const mapLineGroups = {
  采集: ['福州', '贵阳', '南宁', '武汉'],
  下发: ['南京', '杭州', '成都', '重庆', '海口'],
};

const mapRegions = [];

const buildScatterData = (type) => {
  return stationNodes
    .filter((item) => item.type === type)
    .map((item) => ({
      name: item.name,
      value: [...item.coords, item.size],
      symbolSize: item.size,
      itemStyle: {
        color: item.color,
      },
    }));
};

const buildLineData = (type) => {
  return mapLineGroups[type].map((name) => {
    const target = stationNodes.find((item) => item.name === name);
    return {
      coords: [geoCenter, target.coords],
    };
  });
};

const createMapOption = () => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: '#d9e2f1',
    textStyle: {
      color: '#445268',
    },
    formatter: (params) => params.name || '站点',
  },
  geo: {
    map: 'china-overview',
    roam: false,
    zoom: 1.08,
    aspectScale: 0.86,
    top: 10,
    bottom: 10,
    silent: true,
    label: {
      show: false,
    },
    itemStyle: {
      areaColor: '#edf6f8',
      borderColor: '#93b7c0',
      borderWidth: 1.1,
      shadowColor: 'rgba(0, 0, 0, 0.02)',
      shadowBlur: 2,
    },
    emphasis: {
      itemStyle: {
        areaColor: '#edf6f8',
        borderColor: '#93b7c0',
      },
    },
    select: {
      disabled: true,
    },
    regions: mapRegions,
  },
  series: [
    {
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 1,
      symbolSize: 0,
      data: [],
    },
  ],
});

const initMapChart = async () => {
  if (!mapChartRef.value) return;

  const response = await fetch(chinaGeoJsonUrl);
  const chinaJson = await response.json();

  echarts.registerMap('china-overview', chinaJson);
  mapChart?.dispose();
  mapChart = echarts.init(mapChartRef.value);
  mapChart.setOption(createMapOption());
};

const handleResize = () => {
  mapChart?.resize();
  stationCharts.forEach((chart) => chart.resize());
};

const setStationChartRef = (element, stationId) => {
  if (element) {
    stationChartRefs.set(stationId, element);
    return;
  }
  stationChartRefs.delete(stationId);
};

const getStationTrendColor = (trendTone) => (trendTone === 'red' ? '#ee707c' : '#2ecf84');

const createStationTrendOption = (station) => {
  const values = station.trendData;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return {
    animation: false,
    grid: {
      left: 0,
      right: 0,
      top: 2,
      bottom: 2,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      show: false,
      data: values.map((_, index) => index + 1),
    },
    yAxis: {
      type: 'value',
      show: false,
      min: minValue,
      max: maxValue,
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: values,
        lineStyle: {
          color: getStationTrendColor(station.trendTone),
          width: 2.5,
        },
        areaStyle: {
          color: 'rgba(93, 135, 255, 0.08)',
        },
      },
    ],
  };
};

const initStationCharts = () => {
  stationCharts.forEach((chart) => chart.dispose());
  stationCharts.clear();

  stationStatus.forEach((station) => {
    const chartElement = stationChartRefs.get(station.id);
    if (!chartElement) return;
    const chart = echarts.init(chartElement);
    chart.setOption(createStationTrendOption(station));
    stationCharts.set(station.id, chart);
  });
};

const stationStatus = [
  { id: 1, name: '北京北站', code: 'ID: BN-STA-1092', rate: '98.4%', tag: '提升中', tagTone: 'green', trendData: [72, 75, 73, 79, 82, 86, 91, 95, 98], trendTone: 'green' },
  { id: 2, name: '上海枢纽 02', code: 'ID: SH-HUB-4421', rate: '72.1%', tag: '低平', tagTone: 'red', trendData: [84, 81, 79, 76, 74, 73, 72, 72, 72], trendTone: 'red' },
  { id: 3, name: '成都物流', code: 'ID: CD-LOG-9812', rate: '91.0%', tag: '稳定', tagTone: 'green', trendData: [86, 87, 88, 89, 89, 90, 90, 91, 91], trendTone: 'green' },
  { id: 4, name: '广州站', code: 'ID: GZ-STA-5523', rate: '88.2%', tag: '提升中', tagTone: 'green', trendData: [70, 73, 76, 79, 81, 83, 85, 87, 88], trendTone: 'green' },
];

const collectionBars = [
  { label: 'a', x: 46, y: 56, height: 84 },
  { label: 'b', x: 64, y: 44, height: 96 },
  { label: 'c', x: 82, y: 74, height: 66 },
  { label: 'd', x: 100, y: 32, height: 108 },
  { label: 'e', x: 118, y: 88, height: 52 },
  { label: 'f', x: 136, y: 40, height: 100 },
  { label: 'g', x: 154, y: 28, height: 112 },
  { label: 'h', x: 172, y: 70, height: 70 },
  { label: 'i', x: 190, y: 54, height: 86 },
  { label: 'j', x: 208, y: 34, height: 106 },
  { label: 'k', x: 226, y: 60, height: 80 },
  { label: 'l', x: 244, y: 46, height: 94 },
];

const projectBars = [
  { label: '1', x: 42, y: 76, height: 66 },
  { label: '2', x: 54, y: 50, height: 92 },
  { label: '3', x: 66, y: 84, height: 58 },
  { label: '4', x: 78, y: 36, height: 106 },
  { label: '5', x: 90, y: 58, height: 84 },
  { label: '6', x: 102, y: 72, height: 70 },
  { label: '7', x: 114, y: 32, height: 110 },
  { label: '8', x: 126, y: 46, height: 96 },
  { label: '9', x: 138, y: 88, height: 54 },
  { label: '10', x: 150, y: 40, height: 102 },
  { label: '11', x: 162, y: 64, height: 78 },
  { label: '12', x: 174, y: 48, height: 94 },
  { label: '13', x: 186, y: 74, height: 68 },
  { label: '14', x: 198, y: 42, height: 100 },
  { label: '15', x: 210, y: 56, height: 86 },
  { label: '16', x: 222, y: 66, height: 76 },
  { label: '17', x: 234, y: 46, height: 96 },
  { label: '18', x: 246, y: 78, height: 64 },
  { label: '19', x: 258, y: 54, height: 88 },
];

onMounted(() => {
  initMapChart();
  nextTick(() => {
    initStationCharts();
  });
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  stationCharts.forEach((chart) => chart.dispose());
  stationCharts.clear();
  stationChartRefs.clear();
  mapChart?.dispose();
  mapChart = null;
});
</script>

<style scoped>
.overview-page {
  padding: 10px 12px 14px;
  height: calc(100vh - 68px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  position: relative;
  background: #f5f7fb;
}

.overview-page::before,
.overview-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  pointer-events: none;
  z-index: -1;
}

.overview-page::before {
  width: 360px;
  height: 360px;
  top: 110px;
  left: 28%;
  background: rgba(167, 223, 239, 0.14);
}

.overview-page::after {
  width: 320px;
  height: 320px;
  right: 12%;
  bottom: 16%;
  background: rgba(180, 213, 243, 0.12);
}

.overview-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.5fr) minmax(300px, 0.95fr);
  gap: 10px;
  flex: 1 1 auto;
  min-height: 0;
}

.overview-left-column,
.overview-right-column {
  display: grid;
  gap: 10px;
  min-height: 0;
}

.overview-left-column {
  grid-template-rows: minmax(0, 1fr) 114px;
}

.overview-right-column {
  grid-template-rows: 276px minmax(0, 1fr);
}

.overview-panel {
  position: relative;
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(30, 41, 59, 0.04);
  backdrop-filter: none;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.overview-panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(93, 135, 255, 0.18), rgba(255, 255, 255, 0.9));
}

.overview-panel::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 17px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.overview-panel:hover {
  transform: translateY(-1px);
  border-color: #dce4f1;
  box-shadow: 0 10px 20px rgba(174, 192, 214, 0.12);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  position: relative;
  letter-spacing: 0.2px;
  background: #ffffff;
}

.panel-title::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: #edf1f6;
}

.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-radius: 999px;
  background: transparent;
}

.panel-title__icon {
  display: none;
}

.panel-title__link {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #5d87ff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.panel-title__link:hover {
  color: #5d87ff;
}

.map-panel {
  overflow: visible;
}

.panel-body {
  padding: 0 16px 16px;
}

.panel-body--tight {
  padding: 14px 16px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 4px;
  margin-bottom: 14px;
}

.map-heading__eyebrow {
  font-size: 12px;
  font-weight: 500;
  color: #9fbfbe;
  letter-spacing: 0;
}

.map-heading__title {
  font-size: 18px;
  line-height: 1.1;
  font-weight: 700;
  color: #111827;
}

.map-legend {
  position: absolute;
  right: 20px;
  bottom: 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 0;
  font-size: 11px;
  color: #334155;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0;
  border-radius: 0;
  color: #334155;
  background: transparent;
  border: none;
  box-shadow: none;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: none;
}

.china-board {
  position: relative;
  min-height: 0;
  flex: 1;
  border-radius: 18px;
  border: none;
  background: linear-gradient(180deg, #7c9ea6 0%, #799ba4 100%);
  box-shadow: none;
}

.china-board::after {
  display: none;
  pointer-events: none;
}

.china-board::before {
  display: none;
}

.china-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.task-panel-body {
  padding-top: 0;
  min-height: 0;
  height: 100%;
}

.simple-table {
  border: 1px solid #edf1f6;
  border-radius: 16px;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(252, 253, 255, 0.96) 0%, rgba(247, 250, 255, 0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.simple-table__head {
  display: grid;
  grid-template-columns: 1.3fr 1.2fr 0.9fr 0.7fr;
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #506079;
  border-bottom: 1px solid #edf1f6;
  background: #fafbfe;
}

.task-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #9aa7ba;
}

.task-empty-state__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid #9eb0c9;
  background: transparent;
  position: relative;
  box-sizing: border-box;
}

.task-empty-state__icon::before,
.task-empty-state__icon::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #9eb0c9;
}

.task-empty-state__icon::before {
  top: 9px;
  width: 16px;
  height: 12px;
  border-radius: 2px;
}

.task-empty-state__icon::after {
  bottom: 8px;
  width: 20px;
  height: 3px;
  border-radius: 999px;
}

.task-empty-state__text {
  font-size: 13px;
  font-weight: 500;
}

.simple-table__body {
  display: flex;
  flex-direction: column;
  padding: 6px 10px 4px;
  gap: 6px;
}

.simple-table__row {
  display: grid;
  grid-template-columns: 1.3fr 1.2fr 0.9fr 0.7fr;
  align-items: center;
  min-height: 26px;
  color: #53657d;
  font-size: 10px;
}

.task-site {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.task-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #35d27d;
  box-shadow: 0 0 0 4px rgba(53, 210, 125, 0.08);
  flex-shrink: 0;
}

.task-duration {
  display: flex;
  justify-content: flex-end;
}

.task-duration-bar {
  display: inline-block;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, #90e9e6 0%, #7eb8dc 100%);
}

.station-panel-body {
  max-height: none;
  overflow: hidden;
  padding-top: 0;
  min-height: 0;
  height: 100%;
}

.station-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.station-card {
  border: 1px solid #edf1f6;
  border-radius: 14px;
  padding: 14px 14px 12px;
  background: #ffffff;
  box-shadow: none;
  min-height: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.station-card:hover {
  transform: none;
  box-shadow: none;
}

.station-card__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.station-name {
  color: #111827;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-code {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.station-tag {
  align-self: flex-start;
  margin-top: 8px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.station-tag.is-green {
  color: #19a765;
  background: rgba(40, 199, 111, 0.12);
}

.station-tag.is-red {
  color: #e05a67;
  background: rgba(240, 91, 101, 0.12);
}

.station-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.station-trend__chart {
  width: 88px;
  height: 30px;
}

.station-rate {
  color: #6b7280;
  font-size: 11px;
  font-weight: 700;
}

.metrics-panel {
  min-height: 0;
}

.metrics-panel .panel-body {
  padding-top: 0;
  height: 100%;
}

.metrics-body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  height: 100%;
}

.summary-card {
  position: relative;
  border: 1px solid #e7ebf3;
  border-radius: 18px;
  padding: 10px 14px 8px;
  background: #ffffff;
  box-shadow: none;
  min-height: 0;
  overflow: hidden;
}

.summary-card::before {
  display: none;
}

.summary-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 2px;
}

.summary-card__caption {
  font-size: 11px;
  color: #8a98ae;
}

.summary-card__title {
  margin-top: 4px;
  color: #111827;
  font-size: 14px;
  font-weight: 700;
}

.summary-card__meta {
  padding: 0;
  border-radius: 0;
  font-size: 13px;
  font-weight: 700;
  color: #5f708a;
  background: transparent;
}

.summary-card__meta.is-positive {
  color: #16a765;
}

.summary-card__meta.is-primary {
  color: #4c86ff;
}

.chart-svg {
  width: 100%;
  height: 58px;
}

.chart-svg--summary {
  height: 56px;
}

.mini-bar-chart {
  fill: #c9d7fb;
}

.mini-bar-chart--soft:nth-child(4),
.mini-bar-chart--soft:nth-child(5),
.mini-bar-chart--soft:nth-child(6) {
  fill: #5d87ff;
}

.mini-line-chart {
  fill: none;
  stroke: #b9cffb;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mini-line-chart__base {
  stroke: #d8e2f3;
  stroke-width: 4;
  stroke-linecap: round;
}

.project-mini-bar {
  fill: #5d87ff;
}

.chart-grid line {
  stroke: #e9eef7;
  stroke-width: 1;
}

.chart-axis-label {
  fill: #8b99af;
  font-size: 9px;
}

.chart-axis-label--bottom {
  font-size: 9px;
}

.chart-axis-label--tiny {
  font-size: 8px;
}

@media (max-width: 1480px) {
  .china-map {
    min-height: 360px;
  }

  .overview-left-column {
    grid-template-rows: minmax(0, 1fr) 122px;
  }
}

@media (max-width: 1280px) {
  .overview-main-grid {
    grid-template-columns: 1fr;
  }

  .overview-left-column,
  .overview-right-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }

  .map-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .overview-left-column {
    grid-template-rows: minmax(0, 1fr) 132px;
  }
}

@media (max-width: 960px) {
  .overview-page {
    height: auto;
    overflow: visible;
  }

  .metrics-body,
  .overview-left-column,
  .overview-right-column {
    grid-template-columns: 1fr;
  }

  .station-card__main {
    flex-direction: column;
    align-items: flex-start;
  }

  .station-trend {
    width: 100%;
    justify-content: space-between;
  }

  .metrics-panel .panel-body {
    height: auto;
  }

  .metrics-body {
    grid-template-columns: 1fr;
  }
}
</style>
