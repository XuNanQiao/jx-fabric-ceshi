<template>
	<div class="ad-container">
		<div class="ad-top-cards">
			<StatCard
				title="总计采集"
				value="37,847,054"
				unit="张"
				:icon="RefreshLeft">
				<template #visual>
					<div class="ad-trend-chart">
						<svg
							viewBox="0 0 400 40"
							preserveAspectRatio="none"
							class="mini-chart">
							<defs>
								<linearGradient
									id="lineGrad"
									x1="0"
									y1="0"
									x2="0"
									y2="1">
									<stop offset="0%" stop-color="#5d87ff" stop-opacity="0.24" />
									<stop offset="100%" stop-color="#5d87ff" stop-opacity="0" />
								</linearGradient>
							</defs>
							<path
								d="M0,35 L50,30 L100,38 L150,15 L200,20 L250,5 L300,15 L350,2 L400,10 L400,40 L0,40 Z"
								fill="url(#lineGrad)"></path>
							<path
								d="M0,35 L50,30 L100,38 L150,15 L200,20 L250,5 L300,15 L350,2 L400,10"
								fill="none"
								stroke="#5d87ff"
								stroke-width="2"
								stroke-linecap="round"></path>
						</svg>
						<div class="ad-chart-meta">
							<span>今日采集峰值 5,240</span>
							<strong>+12.6%</strong>
						</div>
					</div>
				</template>
			</StatCard>

			<StatCard
				title="总体处理进度"
				value="68"
				unit="%"
				:icon="DataAnalysis">
				<template #visual>
					<div class="ad-stat-progress-bar">
						<div class="ad-progress-row">
							<span>已完成 26 个阶段</span>
							<strong>稳定交付中</strong>
						</div>
						<el-progress
							:percentage="68"
							:stroke-width="8"
							:color="customColors"
							:show-text="false"
							striped
							striped-flow />
					</div>
				</template>
			</StatCard>
		</div>

		<div class="ad-list-head">
			<div class="list-title-box">
				<div class="ad-list-title-wrap">
					<div class="ad-list-title">项目交付概览</div>
					<span class="ad-online-chip">{{ filteredDeliveryCards.length }} 个项目在线</span>
				</div>
				<div class="ad-list-subtitle">实时监控各区域数据集标注及下发状态，提升跟踪效率与操作反馈</div>
			</div>
			<div class="ad-list-actions">
				<el-input
					v-model="searchQuery"
					placeholder="搜索项目 / 编号 / 场景"
					:prefix-icon="Search"
					class="ad-search-input" />
				<el-button
					type="primary"
					:icon="Plus"
					class="glass-btn"
					>新建交付项目</el-button
				>
			</div>
		</div>

		<div class="ad-toolbar-meta">
			<div class="ad-toolbar-stat">
				<span class="label">当日新增交付</span>
				<strong>{{ totalDaily }}</strong>
			</div>
			<div class="ad-toolbar-stat">
				<span class="label">平均进度</span>
				<strong>{{ averageProgress }}%</strong>
			</div>
			<div class="ad-toolbar-stat is-highlight">
				<span class="label">高优先级项目</span>
				<strong>{{ highPriorityCount }}</strong>
			</div>
		</div>

		<div class="ad-grid">
			<AlgoCard
				v-for="item in filteredDeliveryCards"
				:key="item.code"
				:title="item.title"
				:code="item.code"
				:footer-text="`更新时间: ${item.time || '2024-03-20'}`"
				show-accent
				:accent-tone="deliveryTone(item.percent)"
				:accent-width="deliveryBarWidth(item.percent)"
				class="hover-float-card">
				<template #actions>
					<el-dropdown trigger="click">
						<el-button size="small" :icon="MoreFilled" circle plain />
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item :icon="Edit">编辑项目</el-dropdown-item>
								<el-dropdown-item :icon="Share">导出数据</el-dropdown-item>
								<el-dropdown-item :icon="Delete" divided style="color: #f56c6c">删除</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>

				<div class="ad-ring-content">
					<div class="ad-ring-wrap">
						<div class="ad-ring" :style="deliveryProgressStyle(item.percent)">
							<div class="ad-ring-inner">
								<div class="ad-ring-percent">{{ item.percent }}%</div>
								<div class="ad-ring-sub">标注进度</div>
							</div>
						</div>
						<div class="ring-pulse" :class="`is-${deliveryTone(item.percent)}`"></div>
					</div>

					<div class="ad-card-summary">
						<div class="ad-summary-item">
							<span class="label">采集总量</span>
							<strong>{{ item.total }}</strong>
						</div>
						<div class="ad-summary-item">
							<span class="label">日增量</span>
							<strong class="is-positive">+{{ item.daily }}</strong>
						</div>
					</div>

					<div class="ad-card-meta-row">
						<span class="ad-meta-chip">{{ item.scene }}</span>
						<span class="ad-meta-chip is-soft">{{ item.members }}人协同</span>
						<span class="ad-meta-status" :class="`is-${deliveryTone(item.percent)}`">{{ item.status }}</span>
					</div>

					<div class="ad-card-actions-row">
						<el-button plain :icon="Download">采集</el-button>
						<el-button type="primary" plain :icon="CircleCheck">标注</el-button>
					</div>
				</div>
			</AlgoCard>
		</div>
	</div>
</template>

<script setup>
import { RefreshLeft, Plus, Download, MoreFilled, Search, DataAnalysis, Edit, Share, Delete, CircleCheck } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import StatCard from '../components/StatCard.vue';
import AlgoCard from '../components/AlgoCard.vue';

const searchQuery = ref('');
const customColors = [
	{ color: '#f56c6c', percentage: 20 },
	{ color: '#e6a23c', percentage: 40 },
	{ color: '#5d87ff', percentage: 60 },
	{ color: '#13deb9', percentage: 80 },
	{ color: '#10b981', percentage: 100 },
];

const deliveryCards = [
	{ code: 'E2023020120', title: '国网重庆超高压公司500kV', percent: 32, total: '110,533', daily: 1860, time: '1小时前', scene: '输电巡检', members: 12, status: '资源校验中' },
	{ code: 'E2023030051', title: '水厂光伏系统智能巡检研究项目', percent: 88, total: '84,122', daily: 920, time: '3小时前', scene: '光伏巡检', members: 8, status: '待交付验收' },
	{ code: 'E2023060041', title: '国家电网公司临供电公司变电站', percent: 59, total: '56,845', daily: 1340, time: '昨天', scene: '变电检测', members: 10, status: '标注进行中' },
	{ code: 'E2023070111', title: '内蒙古阿拉善供电公司变电站检测', percent: 14, total: '169,069', daily: 2650, time: '2天前', scene: '站点复检', members: 16, status: '数据采集中' },
];

const filteredDeliveryCards = computed(() => {
	const keyword = searchQuery.value.trim().toLowerCase();
	if (!keyword) return deliveryCards;
	return deliveryCards.filter((item) => [item.code, item.title, item.scene, item.status].some((field) => field.toLowerCase().includes(keyword)));
});

const totalDaily = computed(() => filteredDeliveryCards.value.reduce((sum, item) => sum + item.daily, 0).toLocaleString());
const averageProgress = computed(() => filteredDeliveryCards.value.length ? Math.round(filteredDeliveryCards.value.reduce((sum, item) => sum + item.percent, 0) / filteredDeliveryCards.value.length) : 0);
const highPriorityCount = computed(() => filteredDeliveryCards.value.filter((item) => item.percent < 40).length);

const deliveryTone = (percent) => {
	if (percent < 20) return 'red';
	if (percent < 40) return 'amber';
	if (percent < 75) return 'blue';
	return 'green';
};

const deliveryBarWidth = (percent) => `${Math.max(percent, 5)}%`;

const deliveryProgressStyle = (percent) => {
	const color = percent < 20 ? '#ef4444' : percent < 40 ? '#f59e0b' : percent < 75 ? '#5d87ff' : '#13deb9';
	return {
		background: `conic-gradient(${color} ${percent * 3.6}deg, #edf2f8 0deg)`,
	};
};
</script>

<style scoped lang="scss">
.ad-container {
	padding: 4px 6px 0;
}

.ad-top-cards {
	display: grid;
	grid-template-columns: 320px 320px;
	gap: 12px;
	margin-bottom: 12px;
}

.ad-trend-chart {
	margin-top: 8px;
}

.mini-chart {
	width: 100%;
	height: 34px;
}

.ad-chart-meta,
.ad-progress-row {
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
}

.ad-list-head {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	gap: 12px;
	margin-bottom: 8px;
}

.ad-list-title-wrap {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 4px;
}

.ad-list-title {
	font-size: 18px;
	font-weight: 800;
	color: #1f2937;
	margin: 0;
}

.ad-online-chip {
	display: inline-flex;
	align-items: center;
	height: 24px;
	padding: 0 10px;
	border-radius: 999px;
	background: rgba(19, 222, 185, 0.12);
	color: #0f9f84;
	font-size: 12px;
	font-weight: 700;
}

.ad-list-subtitle {
	font-size: 12px;
	line-height: 1.5;
	color: #7c8fac;
}

.ad-list-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.ad-search-input {
	width: 240px;
}

.ad-list-actions {
	:deep(.el-input__wrapper) {
		height: 36px;
		padding: 0 14px;
		border-radius: 8px;
		box-shadow: 0 0 0 1px #e4ebf5 inset;
		transition: box-shadow 0.2s ease, transform 0.2s ease;

		&.is-focus {
			box-shadow: 0 0 0 1px rgba(93, 135, 255, 0.34) inset, 0 8px 18px rgba(93, 135, 255, 0.12);
			transform: translateY(-1px);
		}
	}
}

.glass-btn {
	height: 36px;
	padding: 0 14px;
	border: none;
	border-radius: 8px;
	color: #fff;
	font-size: 13px;
	font-weight: 700;
	background: linear-gradient(135deg, #5d87ff 0%, #4663db 100%);
	box-shadow: 0 8px 16px rgba(93, 135, 255, 0.22);
}

.ad-toolbar-meta {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 8px;
	margin-bottom: 8px;
}

.ad-toolbar-stat {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 9px 11px;
	border-radius: 10px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
	border: 1px solid #e6edf7;
	box-shadow: 0 8px 18px rgba(93, 135, 255, 0.06);
}

.ad-toolbar-stat {
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

.ad-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 12px;
}

.hover-float-card {
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-float-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 24px rgba(15, 23, 42, 0.09) !important;
}

.ad-ring-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	padding: 2px 0 0;
}

.ad-ring-wrap {
	position: relative;
	margin-bottom: 8px;
}

.ad-ring {
	width: 88px;
	height: 88px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	z-index: 2;
	box-shadow: 0 8px 18px rgba(93, 135, 255, 0.1);
}

.ad-ring-inner {
	width: 68px;
	height: 68px;
	background: #fff;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 2px 10px rgba(15, 23, 42, 0.06);
	border: 1px solid #f1f5f9;
}

.ad-ring-percent {
	font-size: 17px;
	font-weight: 800;
	color: #1f2937;
}

.ad-ring-sub {
	font-size: 9px;
	font-weight: 600;
	color: #7c8fac;
}

.ring-pulse {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 88px;
	height: 88px;
	border-radius: 50%;
	z-index: 1;
	opacity: 0.14;
}

.ring-pulse {
	&.is-blue {
		background: #5d87ff;
		animation: pulse 2s infinite;
	}

	&.is-green {
		background: #13deb9;
		animation: pulse 2s infinite;
	}

	&.is-red {
		background: #ef4444;
		animation: pulse 2s infinite;
	}

	&.is-amber {
		background: #f59e0b;
		animation: pulse 2s infinite;
	}
}

@keyframes pulse {
	0% {
		transform: translate(-50%, -50%) scale(0.95);
		opacity: 0.2;
	}
	70% {
		transform: translate(-50%, -50%) scale(1.2);
		opacity: 0;
	}
	100% {
		transform: translate(-50%, -50%) scale(0.95);
		opacity: 0;
	}
}

.ad-card-summary {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	width: 100%;
	margin-bottom: 7px;
}

.ad-summary-item {
	padding: 7px 9px;
	border-radius: 8px;
	background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
	border: 1px solid #edf2f8;
}

.ad-summary-item {
	.label {
		display: block;
		margin-bottom: 4px;
		font-size: 10px;
		font-weight: 600;
		color: #7c8fac;
	}

	strong {
		font-size: 12px;
		font-weight: 800;
		color: #1f2937;
	}

	.is-positive {
		color: #10b981;
	}
}

.ad-card-meta-row {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 6px;
	width: 100%;
	margin-bottom: 7px;
}

.ad-meta-chip,
.ad-meta-status {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 28px;
	height: 24px;
	padding: 0 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 700;
	white-space: nowrap;
}

.ad-meta-chip {
	background: #eef4ff;
	color: #5d87ff;
}

.ad-meta-chip {
	&.is-soft {
		background: #f5f7fb;
		color: #64748b;
	}
}

.ad-meta-status {
	&.is-blue {
		background: rgba(93, 135, 255, 0.12);
		color: #3d6df2;
	}

	&.is-green {
		background: rgba(19, 222, 185, 0.12);
		color: #0f9f84;
	}

	&.is-amber {
		background: rgba(245, 158, 11, 0.12);
		color: #d97706;
	}

	&.is-red {
		background: rgba(239, 68, 68, 0.12);
		color: #dc2626;
	}
}

.ad-card-actions-row {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	width: 100%;
}

.ad-card-actions-row :deep(.el-button) {
	height: 26px;
	border-radius: 6px;
	font-size: 10px;
	font-weight: 700;
}

.ad-card-actions-row :deep(.el-button--primary.is-plain) {
	background: rgba(93, 135, 255, 0.08);
	border-color: rgba(93, 135, 255, 0.18);
	color: #4b6bfb;
}

@media (max-width: 1400px) {
	.ad-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 1024px) {
	.ad-top-cards,
	.ad-toolbar-meta,
	.ad-grid {
		grid-template-columns: 1fr;
	}

	.ad-list-head {
		flex-direction: column;
		align-items: flex-start;
	}

	.ad-list-actions {
		width: 100%;
		flex-wrap: wrap;
	}

	.ad-search-input {
		width: 100%;
	}
}

@media (max-width: 768px) {
	.ad-card-summary,
	.ad-card-actions-row,
	.ad-toolbar-meta {
		grid-template-columns: 1fr;
	}

	.ad-list-title-wrap {
		flex-wrap: wrap;
	}
}
</style>
