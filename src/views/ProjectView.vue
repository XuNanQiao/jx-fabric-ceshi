<template>
  <div class="project-view-page">
    <template v-if="!analysisMode">
      <ProjectListPanel
        v-if="!selectedProject"
        :project-filter="filters.project"
        :status-filter="filters.status"
        :project-options="projectOptions"
        :status-options="statusOptions"
        :filtered-projects="filteredProjects"
        @update:project-filter="filters.project = $event"
        @update:status-filter="filters.status = $event"
        @switch-analysis="analysisMode = true"
        @detail="openProjectDetail" />

      <ProjectDetailPanel
        v-else
        :selected-project="selectedProject"
        :current-detail="currentDetail"
        @back="closeProjectDetail"
        @switch-analysis="analysisMode = true" />
    </template>

    <ProjectAnalysisPanel
      v-else
      :selected-report="selectedReport"
      :report-options="reportOptions"
      :issue-cards="issueCards"
      @update:selected-report="selectedReport = $event"
      @back="analysisMode = false" />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import ProjectAnalysisPanel from '../components/project-view/ProjectAnalysisPanel.vue';
import ProjectDetailPanel from '../components/project-view/ProjectDetailPanel.vue';
import ProjectListPanel from '../components/project-view/ProjectListPanel.vue';

const filters = reactive({
  project: '',
  status: '进行中',
});

const analysisMode = ref(false);
const selectedProject = ref(null);
const selectedReport = ref('2025-12-09 06:03:39');

const projectCards = [
  { id: 'p1', code: 'E2026030031', title: '信产京东慧眸公司站500KV变电站无人机巡检项目', owner: '赵伟', status: '进行中', deliveryDate: '-', siteCount: '-' },
  { id: 'p2', code: 'E2026020071', title: '内蒙古大唐国源呼和浩特托电有限责任公司呼和浩特热电厂光伏站项目', owner: '赵伟', status: '进行中', deliveryDate: '2026-06-30', siteCount: '1' },
  { id: 'p3', code: 'E2026020061', title: '华能新疆江新能股份公司大乙村储能电站智能巡检系统项目', owner: '赵伟', status: '进行中', deliveryDate: '2026-04-29', siteCount: '1' },
  { id: 'p4', code: 'E2026020051', title: '国网浙江省电力有限公司220kV浦南变智巡项目', owner: '赵伟', status: '进行中', deliveryDate: '2026-04-06', siteCount: '1' },
  { id: 'p5', code: 'E2026010200', title: '国能宿控牵引北寨项目', owner: '赵伟', status: '进行中', deliveryDate: '-', siteCount: '-' },
  { id: 'p6', code: 'E2026010161', title: '华润电力华北大区(漳河电厂)智慧安全管控系统采购', owner: '赵伟', status: '进行中', deliveryDate: '2026-04-30', siteCount: '1' },
  { id: 'p7', code: 'E2026010111', title: '华能滨东呼伦贝尔阿荣旗100万千瓦风电智慧场站', owner: '赵伟', status: '进行中', deliveryDate: '2026-07-30', siteCount: '5' },
  { id: 'p8', code: 'E2026010081', title: '大唐宝鸡热电厂脱硝炉火焰识别', owner: '赵伟', status: '进行中', deliveryDate: '2026-04-15', siteCount: '1' },
  { id: 'p9', code: 'E2026010031', title: '内蒙古电力乌海超高压基建项目（乌拉特500kV、恩格500kV）', owner: '赵伟', status: '进行中', deliveryDate: '2027-01-31', siteCount: '1' },
  { id: 'p10', code: 'E2025120681', title: '内蒙古智睿时代液压站无人机项目', owner: '赵伟', status: '进行中', deliveryDate: '2026-08-20', siteCount: '4' },
  { id: 'p11', code: 'E2025120611', title: '国网智能张家电网变电3站无人机巡检', owner: '赵伟', status: '进行中', deliveryDate: '2026-06-20', siteCount: '1' },
  { id: 'p12', code: 'E2025120501', title: '大唐宁夏银川调宁共享储能站智慧巡检平台', owner: '赵伟', status: '进行中', deliveryDate: '2026-02-10', siteCount: '1' },
  { id: 'p13', code: 'E2025120461', title: '国网展汶工委化中综东市巨五镇变农安站平台500kV变电站', owner: '赵伟', status: '进行中', deliveryDate: '2026-06-15', siteCount: '1' },
  { id: 'p14', code: 'E2025120371', title: '2025年内蒙古电力基建排控项目三站', owner: '赵伟', status: '进行中', deliveryDate: '2026-10-15', siteCount: '3' },
  { id: 'p15', code: 'E2025120201', title: '京能新能源北分红好子光伏无人值守', owner: '赵伟', status: '进行中', deliveryDate: '2026-03-31', siteCount: '1' },
  { id: 'p16', code: 'E2025120141', title: '华电四川小里河水电站公司智能视频分析改造离站平台建设', owner: '赵伟', status: '进行中', deliveryDate: '2026-06-20', siteCount: '1' },
];

const projectOptions = [...new Set(projectCards.map((item) => item.code))];
const statusOptions = ['进行中', '已完成', '未开始'];
const reportOptions = ['2025-12-09 06:03:39', '2025-12-08 22:15:26', '2025-12-08 10:20:11'];

const issueCards = [
  { id: 'i1', code: 'E2024010050', title: '桂冠新能源升压站智能巡检系统建设项目', issue: '准确率未达标', deliveryDate: '2024-09-30', owner: '赵伟', level: 'danger' },
  { id: 'i2', code: 'E2024010050', title: '桂冠新能源升压站智能巡检系统建设项目', issue: '更新计划缺失', deliveryDate: '2024-09-30', owner: '赵伟', level: 'warning' },
  { id: 'i3', code: 'E2024010050', title: '桂冠新能源升压站智能巡检系统建设项目', issue: '准确率未上报', deliveryDate: '2024-09-30', owner: '赵伟', level: 'warning' },
  { id: 'i4', code: 'E2024010050', title: '桂冠新能源升压站智能巡检系统建设项目', issue: '算法清单未录入', deliveryDate: '2024-09-30', owner: '赵伟', level: 'warning' },
  { id: 'i5', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '准确率未达标', deliveryDate: '2024-10-31', owner: '赵伟', level: 'danger' },
  { id: 'i6', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '更新计划缺失', deliveryDate: '2024-10-31', owner: '赵伟', level: 'warning' },
  { id: 'i7', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '未配置数据集', deliveryDate: '2024-10-31', owner: '赵伟', level: 'warning' },
  { id: 'i8', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '未配置站点设备', deliveryDate: '2024-10-31', owner: '赵伟', level: 'warning' },
  { id: 'i9', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '边缘端版本过低', deliveryDate: '2024-11-02', owner: '赵伟', level: 'warning' },
  { id: 'i10', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '算法配置未同步', deliveryDate: '2024-11-02', owner: '赵伟', level: 'warning' },
  { id: 'i11', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '任务触发异常', deliveryDate: '2024-11-02', owner: '赵伟', level: 'danger' },
  { id: 'i12', code: 'E2024080021', title: '大唐陕西彬长烟囱光伏压站智能巡检', issue: '数据回传延迟', deliveryDate: '2024-11-02', owner: '赵伟', level: 'warning' },
];

const projectDetailMap = {
  E2026010200: {
    metrics: [
      { label: '项目负责人', value: '赵伟', unit: '' },
      { label: '站点数量', value: '0', unit: '个' },
      { label: '关键算法', value: '0', unit: '个' },
      { label: '关键设备', value: '1', unit: '个' },
      { label: '采集数量', value: '0', unit: '个' },
      { label: '标注数量', value: '0', unit: '个' },
      { label: '进度率', value: '70', unit: '%' },
    ],
    issues: [],
    logs: [],
    progress: 70,
    lastUpdate: '2026-03-03 00:20:14',
    sites: [],
  },
};

const getProjectDetail = (project) => {
  const preset = projectDetailMap[project.code];
  if (preset) {
    return preset;
  }

  return {
    metrics: [
      { label: '项目负责人', value: project.owner, unit: '' },
      { label: '站点数量', value: project.siteCount, unit: '个' },
      { label: '关键算法', value: String(Math.max(Number(project.siteCount) || 1, 1)), unit: '个' },
      { label: '关键设备', value: String((Number(project.siteCount) || 1) * 2), unit: '个' },
      { label: '采集数量', value: String((Number(project.siteCount) || 1) * 3), unit: '个' },
      { label: '标注数量', value: String((Number(project.siteCount) || 1) * 8), unit: '个' },
      { label: '进度率', value: '82', unit: '%' },
    ],
    issues: ['算法台账待完善', '站点巡检模板待同步'],
    logs: ['2026-03-08 完成项目初始化', '2026-03-09 同步设备台账'],
    progress: 82,
    lastUpdate: '2026-03-09 09:30:12',
    sites: [
      {
        name: `${project.code}-主站`,
        stationSn: `${project.code}-001`,
        accuracy: 80,
        status: '运行中',
        deviceCount: String((Number(project.siteCount) || 1) * 2),
        updatedAt: '2026-03-09 09:30:12',
      },
    ],
  };
};

const filteredProjects = computed(() => {
  return projectCards.filter((item) => {
    const matchProject = !filters.project || item.code === filters.project;
    const matchStatus = !filters.status || item.status === filters.status;
    return matchProject && matchStatus;
  });
});

const currentDetail = computed(() => {
  if (!selectedProject.value) {
    return {
      metrics: [],
      issues: [],
      logs: [],
      progress: 0,
      lastUpdate: '-',
      sites: [],
    };
  }

  return getProjectDetail(selectedProject.value);
});

const openProjectDetail = (project) => {
  selectedProject.value = project;
};

const closeProjectDetail = () => {
  selectedProject.value = null;
};
</script>

<style scoped lang="scss">
.project-view-page {
  padding: 4px 6px 10px;
}
</style>
