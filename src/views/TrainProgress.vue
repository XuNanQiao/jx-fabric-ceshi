<template>
	<div class="tp-container">
		<div class="tp-top-cards">
			<StatCard
				title="总计训练"
				value="6389"
				unit="次"
				:icon="RefreshRight">
				<template #visual>
					<div class="tp-trend-chart">
						<svg
							viewBox="0 0 400 40"
							preserveAspectRatio="none"
							class="mini-chart">
							<defs>
								<linearGradient
									id="trainLineGrad"
									x1="0"
									y1="0"
									x2="0"
									y2="1">
									<stop
										offset="0%"
										stop-color="#5d87ff"
										stop-opacity="0.24" />
									<stop
										offset="100%"
										stop-color="#5d87ff"
										stop-opacity="0" />
								</linearGradient>
							</defs>
							<path
								d="M0,34 L44,32 L88,35 L132,18 L176,22 L220,14 L264,20 L308,8 L352,12 L400,6 L400,40 L0,40 Z"
								fill="url(#trainLineGrad)"></path>
							<path
								d="M0,34 L44,32 L88,35 L132,18 L176,22 L220,14 L264,20 L308,8 L352,12 L400,6"
								fill="none"
								stroke="#5d87ff"
								stroke-width="2"
								stroke-linecap="round"></path>
						</svg>
						<div class="tp-card-meta">
							<span>今日触发训练 286 次</span>
							<strong>+18.4%</strong>
						</div>
					</div>
				</template>
			</StatCard>

			<StatCard
				title="总体训练进度"
				value="0"
				unit="%"
				:icon="Clock">
				<template #visual>
					<div class="tp-stat-progress-bar">
						<div class="tp-progress-row">
							<span>已完成 0 个训练阶段</span>
							<strong class="is-warning">异常待处理</strong>
						</div>
						<el-progress
							:percentage="0"
							:stroke-width="8"
							:color="customColors"
							:show-text="false"
							striped
							striped-flow />
					</div>
				</template>
			</StatCard>
		</div>

		<div class="tp-filter-bar">
			<div class="tp-filter-left">
				<span class="tp-filter-label">项目筛选:</span>
				<el-select
					v-model="selectedProject"
					placeholder="请选择"
					clearable
					class="tp-filter-select">
					<el-option
						v-for="item in projectOptions"
						:key="item"
						:label="item"
						:value="item" />
				</el-select>
			</div>
			<div class="tp-filter-actions">
				<el-button
					type="primary"
					class="tp-query-btn"
					>查询</el-button
				>
				<el-button
					class="tp-reset-btn"
					@click="resetFilters"
					>重置</el-button
				>
			</div>
		</div>

		<div class="tp-grid">
			<div
				v-for="project in visibleProjects"
				:key="project.id"
				class="tp-project-card"
				:class="`is-${projectTheme(project)}`">
				<div class="tp-project-head">
					<div class="tp-project-head-main">
						<div class="tp-project-code">{{ project.code }}</div>
						<div class="tp-project-title">{{ project.title }}</div>
					</div>
				</div>

				<div class="tp-task-list">
					<div
						v-for="task in project.tasks"
						:key="`${project.code}-${task.name}`"
						class="tp-task-row"
						:class="`is-${task.state}`">
						<div class="tp-task-main">
							<div class="tp-task-name">{{ task.name }}</div>
							<div class="tp-task-status">{{ task.status }}</div>
						</div>
						<div class="tp-task-actions">
							<el-button
								size="small"
								text
								bg
								>日志</el-button
							>
							<el-button
								size="small"
								text
								bg
								>{{ task.action }}</el-button
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Clock, RefreshRight } from '@element-plus/icons-vue';
import StatCard from '../components/StatCard.vue';

const selectedProject = ref('');

const customColors = [
	{ color: '#f56c6c', percentage: 20 },
	{ color: '#e6a23c', percentage: 40 },
	{ color: '#5d87ff', percentage: 60 },
	{ color: '#13deb9', percentage: 80 },
	{ color: '#10b981', percentage: 100 },
];

const trainingProjects = [
	{
		id: 'cvat-history',
		code: 'CVATDataset',
		title: 'CVAT历史数据项目',
		summary: '3 项异常',
		theme: 'amber',
		tasks: [
			{ name: '变电站外观识别', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '变电站外观识别', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '变电站外观识别', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '变电站外观识别', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '小动物识别', status: '完成', state: 'done', action: '迭代' },
			{ name: '小动物闯入', status: '完成', state: 'done', action: '迭代' },
		],
	},
	{
		id: 'e2023020120-board',
		code: 'E2023020120',
		title: '国网重庆超高压公司500kV板桥站智能巡视频系统建设',
		summary: '5 项异常',
		theme: 'amber',
		tasks: [
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向离散刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
		],
	},
	{
		id: 'e2023060041-grid',
		code: 'E2023060041',
		title: '国家电网公司临沂供电公司变电运维智慧管理',
		summary: '6 项异常',
		theme: 'amber',
		tasks: [
			{ name: '变电站异物检测', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '围栏倒伏', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '围栏倒伏', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '围栏倒伏', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '围栏倒伏', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '围栏倒伏', status: '训练异常', state: 'warning', action: '重启' },
		],
	},
	{
		id: 'e2023070111-a',
		code: 'E2023070111',
		title: '内蒙古阿拉善供电公司变电站智能辅助监控系统建设项目',
		summary: '1 项中止',
		theme: 'blue',
		tasks: [
			{ name: '变电站外观识别', status: '完成', state: 'done', action: '迭代' },
			{ name: '数字显示表（滚轮计数器）', status: '完成', state: 'done', action: '迭代' },
			{ name: '变电站外观识别', status: '训练中止', state: 'stopped', action: '重启' },
		],
	},
	{
		id: 'e2023070111-b',
		code: 'E2023070111',
		title: '内蒙古阿拉善供电公司变电站智能辅助监控系统建设工程',
		summary: '全部完成',
		theme: 'green',
		tasks: [
			{ name: '旋钮把手', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '其他型分合闸储能', status: '完成', state: 'done', action: '迭代' },
			{ name: '其他型分合闸储能', status: '完成', state: 'done', action: '迭代' },
		],
	},
	{
		id: 'e2023070111-c',
		code: 'E2023070111',
		title: '内蒙古阿拉善供电公司变电站智能辅助监控系统建设工程技术',
		summary: '1 项异常',
		theme: 'amber',
		tasks: [
			{ name: '指针表指向连续刻度（需标注）', status: '训练异常', state: 'warning', action: '重启' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '旋钮把手', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
		],
	},
	{
		id: 'e2023070111-d',
		code: 'E2023070111',
		title: '内蒙古阿拉善供电公司变电站智能辅助监控系统建设工程技术二期',
		summary: '全部完成',
		theme: 'green',
		tasks: [
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '隔离开关', status: '完成', state: 'done', action: '迭代' },
			{ name: '接地刀闸', status: '完成', state: 'done', action: '迭代' },
			{ name: '指针表指向连续刻度（需标注）', status: '完成', state: 'done', action: '迭代' },
			{ name: '隔离开关', status: '完成', state: 'done', action: '迭代' },
		],
	},
	{
		id: 'e2023070111-e',
		code: 'E2023070111',
		title: '内蒙古阿拉善供电公司变电站智能辅助监控系统建设工程三期',
		summary: '全部完成',
		theme: 'green',
		tasks: [
			{ name: '旋钮把手', status: '完成', state: 'done', action: '迭代' },
			{ name: '数字显示表（滚轮计数器）', status: '完成', state: 'done', action: '迭代' },
		],
	},
];

const projectOptions = [...new Set(trainingProjects.map((item) => item.code))];

const visibleProjects = computed(() => {
	if (!selectedProject.value) return trainingProjects;
	return trainingProjects.filter((item) => item.code === selectedProject.value);
});

const projectTheme = (project) => {
	if (project.tasks.some((task) => task.state === 'warning')) return 'amber';
	if (project.tasks.every((task) => task.state === 'done')) return 'green';
	return 'blue';
};

const resetFilters = () => {
	selectedProject.value = '';
};
</script>

<style scoped lang="scss">
.tp-container {
	padding: 4px 6px 0;
}

.tp-top-cards {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 10px;
	margin-bottom: 10px;
}

.tp-trend-chart {
	margin-top: 8px;
}

.mini-chart {
	width: 100%;
	height: 34px;
}

.tp-card-meta,
.tp-progress-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 6px;
	font-size: 12px;
	font-weight: 600;
	color: #7c8fac;

	strong {
		color: #13a38b;
	}

	.is-warning {
		color: #d97706;
	}
}

.tp-filter-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	padding: 8px 10px;
	margin-bottom: 8px;
	border-radius: 10px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
	border: 1px solid #e6edf7;
	box-shadow: 0 8px 18px rgba(93, 135, 255, 0.06);
}

.tp-filter-left,
.tp-filter-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.tp-filter-label {
	font-size: 13px;
	font-weight: 700;
	color: #2f3747;
}

.tp-filter-select {
	width: 240px;
}

.tp-filter-bar {
	:deep(.el-select__wrapper) {
		height: 36px;
		padding: 0 12px;
		border-radius: 8px;
		box-shadow: 0 0 0 1px #e4ebf5 inset;
		background: #fff;
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

	:deep(.el-select__placeholder) {
		color: #a8abb2;
	}
}

.tp-stat-progress-bar {
	margin-top: 8px;
}

.tp-query-btn,
.tp-reset-btn {
	height: 36px;
	padding: 0 12px;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 600;
}

.tp-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 9px;
	align-items: start;
	max-height: calc(100vh - 228px);
	overflow-y: auto;
	padding-right: 8px;
}

.tp-project-card {
	position: relative;
	padding: 11px;
	border-radius: 12px;
	background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
	border: 1px solid #e8eef7;
	box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
	overflow: hidden;
	min-height: 238px;
	transition:
		transform 0.25s ease,
		box-shadow 0.25s ease,
		border-color 0.25s ease;
}

.tp-project-card {
	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 22px rgba(31, 41, 55, 0.08);
		border-color: rgba(93, 135, 255, 0.22);
	}

	&::before {
		content: '';
		position: absolute;
		inset: 0 0 auto 0;
		height: 3px;
		background: #dbe4f2;
	}

	&.is-amber::before {
		background: linear-gradient(90deg, #f59e0b, #fb923c);
	}

	&.is-green::before {
		background: linear-gradient(90deg, #13deb9, #10b981);
	}

	&.is-blue::before {
		background: linear-gradient(90deg, #5d87ff, #49beff);
	}
}

.tp-project-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 8px;
}

.tp-project-head-main {
	min-width: 0;
}

.tp-project-code {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 5px;
	padding: 3px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 700;
	line-height: 1;
	letter-spacing: 0.2px;
	color: #5d87ff;
	background: rgba(93, 135, 255, 0.1);
	border: 1px solid rgba(93, 135, 255, 0.18);
}

.tp-project-code {
	&::before {
		content: '';
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.12);
	}
}

.tp-project-card.is-amber .tp-project-code {
	color: #d97706;
	background: rgba(245, 158, 11, 0.12);
	border-color: rgba(245, 158, 11, 0.22);
}

.tp-project-card.is-amber .tp-project-code::before {
	box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);
}

.tp-project-card.is-green .tp-project-code {
	color: #059669;
	background: rgba(16, 185, 129, 0.12);
	border-color: rgba(16, 185, 129, 0.2);
}

.tp-project-card.is-green .tp-project-code::before {
	box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14);
}

.tp-project-card.is-blue .tp-project-code::before {
	box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.12);
}

.tp-project-title {
	font-size: 12px;
	line-height: 1.4;
	font-weight: 700;
	color: #2a3547;
	max-height: 34px;
	overflow: hidden;
	display: -webkit-box;
	line-clamp: 2;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.tp-project-badge {
	flex-shrink: 0;
	height: 20px;
	padding: 0 8px;
	border-radius: 3px;
	display: none;
}

.tp-task-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.tp-task-row {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 6px;
	padding: 4px 6px 4px 8px;
	border-radius: 8px;
	border: 1px solid #ebf1f6;
	background: #fff;
	min-height: 28px;
	transition:
		transform 0.2s ease,
		box-shadow 0.2s ease,
		border-color 0.2s ease;
}

.tp-task-row::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 2px;
	border-radius: 8px 0 0 8px;
	background: #d1d5db;
}

.tp-task-row {
	&:hover {
		transform: translateX(2px);
		box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
	}

	&.is-warning {
		background: #fff1ea;
		border-color: #f3b08d;

		&::before {
			background: #f97316;
		}
	}

	&.is-done {
		background: #e7f8fc;
		border-color: #9ad8ea;

		&::before {
			background: #38bdf8;
		}
	}

	&.is-stopped {
		background: #fff0f0;
		border-color: #f0b2b2;

		&::before {
			background: #ef4444;
		}
	}
}

.tp-task-main {
	min-width: 0;
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: center;
	gap: 6px;
	flex: 1;
}

.tp-task-name {
	font-size: 9px;
	color: #606266;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.tp-task-status {
	font-size: 10px;
	font-weight: 600;
	color: #303133;
}

.tp-task-actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.tp-task-actions {
	:deep(.el-button) {
		height: 20px;
		padding: 0 5px;
		border-radius: 4px;
		font-size: 9px;
		color: #606266;
		background: #fff;
		border: 1px solid #dcdfe6;
	}
}

.tp-grid::-webkit-scrollbar {
	width: 6px;
}

.tp-grid::-webkit-scrollbar-thumb {
	border-radius: 999px;
	background: rgba(201, 208, 218, 0.9);
}

.tp-grid::-webkit-scrollbar-track {
	background: transparent;
}

@media (max-width: 1500px) {
	.tp-top-cards {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.tp-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (max-width: 1200px) {
	.tp-top-cards,
	.tp-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.tp-filter-bar {
		flex-direction: column;
		align-items: flex-start;
	}

	.tp-filter-select {
		width: 260px;
	}

	.tp-filter-actions {
		width: 100%;
		flex-wrap: wrap;
		justify-content: flex-start;
	}
}

@media (max-width: 900px) {
	.tp-top-cards,
	.tp-grid {
		grid-template-columns: 1fr;
	}

	.tp-top-cards {
		grid-template-columns: 1fr;
	}

	.tp-filter-select {
		width: 100%;
	}
}
</style>
