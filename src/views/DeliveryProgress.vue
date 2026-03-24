<template>
	<div class="dp-container">
		<!-- 顶部统计卡片 -->
		<div class="dp-top-cards">
			<StatCard
				title="项目数"
				:value="stats.projectCount"
				unit="个"
				:icon="Grid">
				<template #visual>
					<div class="dp-stat-visual">
						<span class="dp-stat-label">总计项目</span>
					</div>
				</template>
			</StatCard>

			<StatCard
				title="达标率"
				:value="stats.complianceRate"
				unit="%"
				:icon="TrendCharts">
				<template #visual>
					<div class="dp-stat-visual">
						<span class="dp-stat-label">整体达标情况</span>
					</div>
				</template>
			</StatCard>
		</div>

		<!-- 整体指标部分 -->
		<div class="dp-section-card">
			<div class="dp-section-header">
				<div class="dp-section-title">整体指标部分</div>
			</div>
			<div class="dp-toolbar-meta">
				<div class="dp-toolbar-stat">
					<span class="label">当日新增交付</span>
					<strong>{{ totalDaily }}</strong>
				</div>
				<div class="dp-toolbar-stat">
					<span class="label">平均进度</span>
					<strong>{{ averageProgress }}%</strong>
				</div>
				<div class="dp-toolbar-stat is-highlight">
					<span class="label">高优先级项目</span>
					<strong>{{ highPriorityCount }}</strong>
				</div>
			</div>
		</div>

		<!-- 项目达标情况 -->
		<Transition name="fullscreen-fade">
			<div v-if="isFullscreen" class="dp-fullscreen-backdrop" @click="isFullscreen = false"></div>
		</Transition>
		<div class="dp-section-card" :class="{ 'is-fullscreen': isFullscreen }">
			<div class="dp-section-header">
				<div class="dp-section-title">项目达标情况</div>
				<el-button
					:icon="isFullscreen ? 'Close' : 'FullScreen'"
					circle
					size="small"
					:title="isFullscreen ? '退出全屏 (ESC)' : '全屏显示'"
					@click="toggleFullscreen">
				</el-button>
			</div>
			<div class="dp-progress-list">
				<div
					v-for="(project, index) in projectProgress"
					:key="index"
					class="dp-progress-item">
					<div class="dp-progress-label">{{ project.name }}</div>
					<div class="dp-progress-bar-wrap">
						<el-progress
							:percentage="project.rate"
							:color="getProgressColor(project.rate).color"
							:stroke-width="isFullscreen ? 24 : 20"
							:show-text="false" />
						<span class="dp-progress-percent">{{ project.rate }}%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 详情部分 -->
		<div class="dp-section-card">
			<div class="dp-section-header">
				<div class="dp-section-title">详情部分</div>
			</div>

			<!-- 筛选按钮组 -->
			<div class="dp-filter-bar">
				<el-button
					v-for="filter in filterOptions"
					:key="filter.value"
					:type="activeFilter === filter.value ? 'primary' : ''"
					:plain="activeFilter !== filter.value"
					size="small"
					@click="activeFilter = filter.value">
					{{ filter.label }}
				</el-button>
			</div>

			<!-- 数据表格 -->
			<el-table
				:data="paginatedData"
				:span-method="arraySpanMethod"
				border
				height="500"
				style="width: 100%">
				<el-table-column type="expand">
					<template #default="props">
						<div class="dp-expand-content">
							<p><strong>详细信息：</strong></p>
							<p>项目名称：{{ props.row.projectName }}</p>
							<p>算法状态：{{ props.row.algoStatus }}</p>
							<p>达标率：{{ props.row.complianceRate }}%</p>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="businessLine" label="业务线" width="100" sortable />
				<el-table-column prop="projectName" label="项目名称" width="200" show-overflow-tooltip sortable />
				<el-table-column prop="engineeringGroup" label="工程组" width="120" sortable />
				<el-table-column prop="station" label="站点" width="120" sortable />
				<el-table-column prop="serviceQualification" label="服务资质" width="100" />
				<el-table-column prop="algoStatus" label="算法状态" width="100" sortable>
					<template #default="scope">
						<el-tag :type="getStatusType(scope.row.algoStatus)" size="small">
							{{ scope.row.algoStatus }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="complianceRate" label="达标率" width="100" sortable>
					<template #default="scope">
						<span :style="{ color: getProgressColor(scope.row.complianceRate).color }">
							{{ scope.row.complianceRate }}%
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="algoSubcategory" label="算法小类" width="150" show-overflow-tooltip />
				<el-table-column prop="taskDate" label="任务日期" width="120" sortable />
				<el-table-column prop="pointData" label="点位数据" width="100" sortable />
				<el-table-column prop="accurateData" label="准确数据" width="100" sortable />
				<el-table-column prop="marketFollowupData" label="市场后续数据" width="120" sortable />
				<el-table-column prop="shootingFollowupData" label="拍摄后续数据" width="120" sortable />
				<el-table-column prop="accuracy" label="准确率" width="100" sortable>
					<template #default="scope">
						{{ scope.row.accuracy }}%
					</template>
				</el-table-column>
				<el-table-column prop="postAlgoAccuracy" label="算法后准确率" width="120" sortable>
					<template #default="scope">
						{{ scope.row.postAlgoAccuracy }}%
					</template>
				</el-table-column>
				<el-table-column prop="segmentRate" label="这段率" width="100" sortable>
					<template #default="scope">
						{{ scope.row.segmentRate }}%
					</template>
				</el-table-column>
				<el-table-column prop="verificationRate" label="话核" width="100" sortable>
					<template #default="scope">
						{{ scope.row.verificationRate }}%
					</template>
				</el-table-column>
				<el-table-column label="操作" width="120" fixed="right">
					<template #default>
						<el-button type="primary" link size="small">查看</el-button>
						<el-button type="primary" link size="small">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页 -->
			<div class="dp-pagination">
				<el-pagination
					v-model:current-page="pagination.page"
					v-model:page-size="pagination.pageSize"
					:page-sizes="[10, 20, 50, 100]"
					:total="filteredData.length"
					background
					layout="total, sizes, prev, pager, next, jumper" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { Grid, TrendCharts } from '@element-plus/icons-vue';
import StatCard from '../components/StatCard.vue';

// 全屏状态
const isFullscreen = ref(false);

// 切换全屏
const toggleFullscreen = () => {
	isFullscreen.value = !isFullscreen.value;
};

// 监听 ESC 键退出全屏
const handleKeydown = (e) => {
	if (e.key === 'Escape' && isFullscreen.value) {
		isFullscreen.value = false;
	}
};

// 监听全屏状态变化，控制页面滚动
watch(isFullscreen, (newVal) => {
	if (newVal) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
});

onMounted(() => {
	window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeydown);
	document.body.style.overflow = '';
});

// 顶部统计数据
const stats = reactive({
	projectCount: 58,
	complianceRate: 74.4
});

// 项目达标情况数据
const projectProgress = [
	{ name: '内蒙古大唐国际再生能源有限公司乌拉特后旗光伏升压站智能巡检系统', rate: 0 },
	{ name: '华能陕西靖边光伏电站100万千瓦风电智能巡检系统', rate: 0 },
	{ name: '国网浙江新能源公司20kV海宁变智能巡检项目', rate: 0 },
	{ name: '国网陕西变电站项目', rate: 0 },
	{ name: '华润电力北京区域变电站100万千瓦风电智能巡检系统', rate: 0 },
	{ name: '华能陕西靖边光伏电站100万千瓦风电智能巡检系统', rate: 0 }
];

// 筛选选项
const filterOptions = [
	{ label: '一键开打', value: 'all' },
	{ label: '无进展过滤', value: 'no_progress' },
	{ label: '整体情况', value: 'overall' },
	{ label: '未达标', value: 'not_compliant' },
	{ label: '处理中', value: 'processing' },
	{ label: '更新延迟', value: 'delayed' },
	{ label: '数据不足', value: 'insufficient' }
];

const activeFilter = ref('all');

// 分页配置
const pagination = reactive({
	page: 1,
	pageSize: 10
});

// 表格数据
const tableData = ref([
	{
		id: 1,
		row_num: 1,
		businessLine: '发电',
		projectName: '桂冠新能源升压站智能巡检系统',
		engineeringGroup: '工程一组',
		station: '马于风场',
		serviceQualification: '已认证',
		algoStatus: '运行中',
		complianceRate: 83,
		algoSubcategory: '变电站外观识别',
		taskDate: '2024-09-30',
		pointData: 398,
		accurateData: 185,
		marketFollowupData: 0,
		shootingFollowupData: 20,
		accuracy: 81,
		postAlgoAccuracy: 81,
		segmentRate: 0,
		verificationRate: 0
	},
	{
		id: 2,
		row_num: 2,
		businessLine: '电网',
		projectName: '800kV带电检测站智能项目',
		engineeringGroup: '工程四组',
		station: '带电站',
		serviceQualification: '已认证',
		algoStatus: '运行中',
		complianceRate: 100,
		algoSubcategory: '指针表识别',
		taskDate: '2025-06-30',
		pointData: 70,
		accurateData: 22,
		marketFollowupData: 0,
		shootingFollowupData: 44,
		accuracy: 80,
		postAlgoAccuracy: 80,
		segmentRate: 0,
		verificationRate: 0
	},
	{
		id: 3,
		row_num: 2,
		businessLine: '电网',
		projectName: '国网新疆2024年二次物资集中招标采购项目',
		engineeringGroup: '工程二组',
		station: '35kV火车站',
		serviceQualification: '已认证',
		algoStatus: '待处理',
		complianceRate: 80,
		algoSubcategory: '变电站外观识别',
		taskDate: '2025-03-07',
		pointData: 179,
		accurateData: 179,
		marketFollowupData: 0,
		shootingFollowupData: 6,
		accuracy: 81,
		postAlgoAccuracy: 81,
		segmentRate: 0,
		verificationRate: 0
	},
	{
		id: 4,
		row_num: 2,
		businessLine: '电网',
		projectName: '国网新疆2024年二次物资集中招标采购项目',
		engineeringGroup: '工程二组',
		station: '35kV南机站',
		serviceQualification: '已认证',
		algoStatus: '运行中',
		complianceRate: 80,
		algoSubcategory: '变电站外观识别',
		taskDate: '2025-03-31',
		pointData: 179,
		accurateData: 179,
		marketFollowupData: 0,
		shootingFollowupData: 0,
		accuracy: 81,
		postAlgoAccuracy: 81,
		segmentRate: 0,
		verificationRate: 0
	},
	{
		id: 5,
		row_num: 3,
		businessLine: '发电',
		projectName: '大唐工程金一期工程一组',
		engineeringGroup: '工程一组',
		station: '大唐新会',
		serviceQualification: '已认证',
		algoStatus: '运行中',
		complianceRate: 89,
		algoSubcategory: '变电站外观识别',
		taskDate: '2024-10-31',
		pointData: 17174,
		accurateData: 4082,
		marketFollowupData: 0,
		shootingFollowupData: 0,
		accuracy: 98,
		postAlgoAccuracy: 98,
		segmentRate: 0,
		verificationRate: 0
	},
	{
		id: 6,
		row_num: 3,
		businessLine: '发电',
		projectName: '国网重庆超高压公司500kV板桥站智能巡视频系统建设',
		engineeringGroup: '工程一组',
		station: '大唐新会',
		serviceQualification: '已认证',
		algoStatus: '运行中',
		complianceRate: 89,
		algoSubcategory: '变电站外观识别',
		taskDate: '2024-10-31',
		pointData: 17174,
		accurateData: 4082,
		marketFollowupData: 0,
		shootingFollowupData: 0,
		accuracy: 98,
		postAlgoAccuracy: 98,
		segmentRate: 0,
		verificationRate: 0
	}
]);

// 计算属性
const totalDaily = computed(() => {
	return tableData.value.reduce((sum, item) => sum + item.pointData, 0).toLocaleString();
});

const averageProgress = computed(() => {
	if (tableData.value.length === 0) return 0;
	const sum = tableData.value.reduce((acc, item) => acc + item.complianceRate, 0);
	return Math.round(sum / tableData.value.length);
});

const highPriorityCount = computed(() => {
	return tableData.value.filter(item => item.complianceRate < 60).length;
});

// 筛选数据
const filteredData = computed(() => {
	if (activeFilter.value === 'all') return tableData.value;
	if (activeFilter.value === 'not_compliant') return tableData.value.filter(item => item.complianceRate < 60);
	if (activeFilter.value === 'processing') return tableData.value.filter(item => item.algoStatus === '运行中');
	if (activeFilter.value === 'no_progress') return tableData.value.filter(item => item.complianceRate === 0);
	return tableData.value;
});

// 分页数据
const paginatedData = computed(() => {
	const start = (pagination.page - 1) * pagination.pageSize;
	const end = start + pagination.pageSize;
	return filteredData.value.slice(start, end);
});

// 颜色编码函数
const getProgressColor = (rate) => {
	if (rate >= 85) return { color: '#13deb9', label: 'green' };
	if (rate >= 75) return { color: '#5d87ff', label: 'blue' };
	if (rate >= 60) return { color: '#f59e0b', label: 'amber' };
	return { color: '#ef4444', label: 'red' };
};

// 状态类型
const getStatusType = (status) => {
	if (status === '运行中') return 'success';
	if (status === '待处理') return 'warning';
	if (status === '已完成') return 'info';
	return '';
};

// 表格合并方法
const arraySpanMethod = ({ rowIndex, columnIndex }) => {
	// 只对第一列（业务线列，columnIndex为1，因为0是展开列）进行合并
	if (columnIndex === 1) {
		const currentRowNum = paginatedData.value[rowIndex].row_num;

		// 查找相同 row_num 的第一行
		const firstIndex = paginatedData.value.findIndex(item => item.row_num === currentRowNum);

		// 如果当前行是该 row_num 的第一行
		if (firstIndex === rowIndex) {
			// 计算相同 row_num 的行数
			const rowspan = paginatedData.value.filter(item => item.row_num === currentRowNum).length;
			return {
				rowspan: rowspan,
				colspan: 1
			};
		} else {
			// 不是第一行，则隐藏该单元格
			return {
				rowspan: 0,
				colspan: 0
			};
		}
	}

	// 其他列不合并
	return {
		rowspan: 1,
		colspan: 1
	};
};
</script>

<style scoped lang="scss">
.dp-container {
	padding: 4px 6px 0;
}

.dp-top-cards {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
	margin-bottom: 12px;
}

.dp-stat-visual {
	margin-top: 8px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.dp-stat-label {
	font-size: 12px;
	font-weight: 600;
	color: #7c8fac;
}

.dp-section-card {
	margin-bottom: 12px;
	padding: 14px;
	background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
	border-radius: 11px;
	border: 1px solid #e8eef7;
	box-shadow: 0 3px 12px rgba(31, 41, 55, 0.05);
	transition: all 0.3s ease;

	&.is-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
		margin: 0;
		border-radius: 0;
		z-index: 9999;
		overflow-y: auto;
		padding: 32px 48px;
		background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
		box-shadow: none;

		.dp-section-title {
			font-size: 24px;
		}

		.dp-progress-list {
			gap: 20px;
			max-width: 1400px;
			margin: 0 auto;
		}

		.dp-progress-item {
			padding: 16px;
			background: #ffffff;
			border-radius: 12px;
			box-shadow: 0 2px 8px rgba(31, 41, 55, 0.08);
		}

		.dp-progress-label {
			font-size: 15px;
			flex: 0 0 500px;
		}

		.dp-progress-percent {
			font-size: 16px;
			min-width: 55px;
		}
	}
}

.dp-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.dp-section-title {
	font-size: 16px;
	font-weight: 800;
	color: #1f2937;
}

.dp-toolbar-meta {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 8px;
}

.dp-toolbar-stat {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 9px 11px;
	border-radius: 10px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
	border: 1px solid #e6edf7;
	box-shadow: 0 8px 18px rgba(93, 135, 255, 0.06);

	.label {
		font-size: 11px;
		font-weight: 600;
		color: #7c8fac;
	}

	strong {
		font-size: 17px;
		font-weight: 800;
		color: #1f2937;
	}

	&.is-highlight {
		background: linear-gradient(135deg, rgba(93, 135, 255, 0.12), rgba(19, 222, 185, 0.12));
		border-color: rgba(93, 135, 255, 0.2);
	}
}

.dp-progress-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.dp-progress-item {
	display: flex;
	align-items: center;
	gap: 12px;
}

.dp-progress-label {
	flex: 0 0 400px;
	font-size: 12px;
	font-weight: 600;
	color: #2a3547;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.dp-progress-bar-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 12px;
}

.dp-progress-percent {
	flex-shrink: 0;
	font-size: 13px;
	font-weight: 700;
	color: #1f2937;
	min-width: 45px;
	text-align: right;
}

.dp-fullscreen-backdrop {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 9998;
	backdrop-filter: blur(4px);
}

.fullscreen-fade-enter-active,
.fullscreen-fade-leave-active {
	transition: opacity 0.3s ease;
}

.fullscreen-fade-enter-from,
.fullscreen-fade-leave-to {
	opacity: 0;
}

.dp-filter-bar {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 12px;
}

.dp-expand-content {
	padding: 12px 20px;
	background: #f8fbff;
	border-radius: 8px;

	p {
		margin: 6px 0;
		font-size: 13px;
		color: #2a3547;
	}

	strong {
		font-weight: 700;
		color: #1f2937;
	}
}

.dp-pagination {
	margin-top: 12px;
	display: flex;
	justify-content: flex-end;
}

@media (max-width: 1400px) {
	.dp-progress-label {
		flex: 0 0 300px;
	}
}

@media (max-width: 1200px) {
	.dp-top-cards,
	.dp-toolbar-meta {
		grid-template-columns: 1fr;
	}

	.dp-progress-item {
		flex-direction: column;
		align-items: flex-start;
	}

	.dp-progress-label {
		flex: 1;
		white-space: normal;
	}

	.dp-progress-bar-wrap {
		width: 100%;
	}
}

@media (max-width: 768px) {
	.dp-filter-bar {
		flex-direction: column;
	}
}
</style>
