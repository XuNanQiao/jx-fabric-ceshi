<template>
	<div class="sd-page">
		<div class="sd-header-card">
			<div class="sd-header-main">
				<div class="sd-title-wrap">
					<div class="sd-site-name">{{ detail.siteName }}</div>
					<div class="sd-site-meta">
						<span>项目编号：{{ detail.projectCode }}</span>
						<span>站点编号：{{ detail.stationSn }}</span>
						<span>最近更新时间：{{ detail.lastUpdate }}</span>
					</div>
				</div>
				<div class="sd-header-actions">
					<el-button @click="goBack">返回项目视图</el-button>
				</div>
			</div>
		</div>

		<div class="sd-summary-grid">
			<div
				v-for="card in summaryCards"
				:key="card.label"
				class="sd-summary-card">
				<div class="sd-summary-label">{{ card.label }}</div>
				<div
					class="sd-summary-value"
					:class="{ 'is-status': card.isStatus }">
					<span
						v-if="card.isStatus"
						class="sd-status-badge"
						:class="`is-${card.tone}`">
						<span class="sd-status-dot"></span>
						{{ card.value }}
					</span>
					<template v-else>
						{{ card.value }}
						<span
							v-if="card.unit"
							class="sd-summary-unit"
							>{{ card.unit }}</span
						>
					</template>
				</div>
			</div>
		</div>

		<div class="sd-panel-grid">
			<div class="sd-panel-card sd-panel-card--progress">
				<div class="sd-panel-title">项目交付进度</div>
				<div class="sd-progress-wrap">
					<el-progress
						type="circle"
						:percentage="detail.progress"
						:stroke-width="10"
						:width="120" />
					<div class="sd-progress-meta">最近更新时间</div>
					<div class="sd-progress-time">{{ detail.lastUpdate }}</div>
				</div>
			</div>

			<div class="sd-panel-card">
				<div class="sd-panel-title is-warning">项目问题内容</div>
				<div
					v-if="detail.issues.length"
					class="sd-tag-list">
					<div
						v-for="issue in detail.issues"
						:key="issue"
						class="sd-tag-item">
						{{ issue }}
					</div>
				</div>
				<el-empty
					v-else
					description="暂无数据" />
			</div>

			<div class="sd-panel-card">
				<div class="sd-panel-title">更新日志</div>
				<div
					v-if="detail.logs.length"
					class="sd-log-list">
					<div
						v-for="log in detail.logs"
						:key="log"
						class="sd-log-item">
						{{ log }}
					</div>
				</div>
				<el-empty
					v-else
					description="暂无数据" />
			</div>
		</div>

		<StationAlgorithmMasonry :groups="detail.algorithms" />
	</div>
</template>

<script setup>
import { computed } from 'vue';
import StationAlgorithmMasonry from '../components/StationAlgorithmMasonry.vue';

const props = defineProps({
	routeInfo: {
		type: Object,
		default: () => ({}),
	},
});

const detail = computed(() => {
	const projectCode = props.routeInfo.projectCode || 'E2025110261';
	const stationSn = props.routeInfo.stationSn || `${projectCode}-001`;
	const siteName = props.routeInfo.siteName || '站点详情';

	return {
		projectCode,
		stationSn,
		siteName,
		lastUpdate: '2026-03-10 15:30:21',
		progress: 70,
		issues: ['高空异物模型已跑二次迭代，观察后续效果', '存在误报，收集基础训练，现场 arm 架构推理工具在测试'],
		logs: [],
		algorithms: [
			{
				title: '手机违规使用',
				items: [
					{ name: '手持通话识别', value: '99.2%', width: '99.2%', tone: 'green', note: '运行中 · 无延迟' },
					{ name: '低头玩手机', value: '94.5%', width: '94.5%', tone: 'orange', note: '需优化训练集' },
				],
			},
			{
				title: '烟火风险预警',
				items: [
					{ name: '明火识别', value: '97.4%', width: '97.4%', tone: 'green' },
					{ name: '烟雾检测', value: '96.8%', width: '96.8%', tone: 'green' },
					{ name: '明火识别', value: '97.4%', width: '97.4%', tone: 'green' },
					{ name: '烟雾检测', value: '96.8%', width: '96.8%', tone: 'green' },
					{ name: '明火识别', value: '97.4%', width: '97.4%', tone: 'green' },
					{ name: '烟雾检测', value: '96.8%', width: '96.8%', tone: 'green' },
					{ name: '区域入侵(烟火区)', value: '99.1%', width: '99.1%', tone: 'green' },
				],
			},
			{
				title: '环境卫生管理',
				items: [
					{ name: '地面油污识别', value: '91.0%', width: '91%', tone: 'orange', note: '数据收集中...' },
					{ name: '堆料违规占道', value: '96.5%', width: '96.5%', tone: 'green' },
				],
			},
			{
				title: '劳保穿戴检测',
				items: [
					{ name: '安全帽佩戴', value: '99.8%', width: '99.8%', tone: 'green' },
					{ name: '反光衣穿戴', value: '98.1%', width: '98.1%', tone: 'green' },
					{ name: '劳保鞋检测', value: '开发中', width: '30%', tone: 'slate', note: '预计 V2.5 发布' },
				],
			},
			{
				title: '设备状态监控',
				items: [
					{ name: '指针式仪表读取', value: '95.2%', width: '95.2%', tone: 'green' },
					{ name: '数字屏识别', value: '98.5%', width: '98.5%', tone: 'green' },
				],
			},
			{
				title: '车辆运输管控',
				items: [
					{ name: '车牌 OCR 识别', value: '99.9%', width: '99.9%', tone: 'green' },
					{ name: '超速行驶检测', value: '95.8%', width: '95.8%', tone: 'green' },
				],
			},
		],
	};
});

const summaryCards = computed(() => [
	{ label: '算法数量', value: 8, unit: '个' },
	{ label: '关联设备', value: 2, unit: '个' },
	{ label: '关联数据集', value: '-', unit: '' },
	{ label: '设备状态', value: '离线', unit: '', isStatus: true, tone: 'offline' },
	{ label: '采集数量', value: 0, unit: '个' },
	{ label: '标注数量', value: 0, unit: '次' },
	{ label: '平均准确率', value: '%', unit: '' },
	{ label: '采集状态', value: '停止', unit: '', isStatus: true, tone: 'stopped' },
]);

const goBack = () => {
	window.location.hash = '#/project-view';
};
</script>

<style scoped lang="scss">
.sd-page {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 4px 6px 10px;
}

.sd-header-card,
.sd-panel-card,
.sd-algo-card,
.sd-summary-card {
	border-radius: 14px;
	border: 1px solid #e6edf7;
	background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
	box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.sd-header-card {
	padding: 16px 18px;
}

.sd-header-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.sd-site-name {
	font-size: 24px;
	font-weight: 800;
	color: #1f2937;
}

.sd-site-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 8px;
	color: #64748b;
	font-size: 12px;
}

.sd-summary-grid {
	display: grid;
	grid-template-columns: repeat(8, minmax(0, 1fr));
	gap: 12px;
}

.sd-summary-card {
	padding: 14px 16px;
	min-height: 92px;
}

.sd-summary-label {
	font-size: 12px;
	font-weight: 700;
	color: #64748b;
	margin-bottom: 14px;
}

.sd-summary-value {
	font-size: 24px;
	font-weight: 800;
	color: #0f172a;
	line-height: 1.1;

	&.is-status {
		display: flex;
		align-items: center;
	}
}

.sd-summary-unit {
	margin-left: 4px;
	font-size: 14px;
	color: #64748b;
}

.sd-status-badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 14px;
	border-radius: 999px;
	font-size: 18px;
	line-height: 1;
	font-weight: 800;

	&.is-online {
		color: #059669;
		background: #e8faf3;
	}

	&.is-offline {
		color: #dc2626;
		background: #fef2f2;
	}

	&.is-stopped {
		color: #d97706;
		background: #fff7ed;
	}
}

.sd-status-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: currentColor;
	box-shadow: 0 0 0 4px color-mix(in srgb, currentColor 18%, white);
}

.sd-panel-grid {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 12px;
}

.sd-panel-card {
	padding: 14px 16px;
	min-height: 220px;

	&--progress {
		display: flex;
		flex-direction: column;
	}
}

.sd-panel-title {
	font-size: 16px;
	font-weight: 800;
	color: #1f2937;
	margin-bottom: 16px;

	&.is-warning {
		color: #c26a06;
	}
}

.sd-progress-wrap {
	display: flex;
	flex: 1;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
}

.sd-progress-meta,
.sd-progress-time {
	font-size: 12px;
	color: #64748b;
}

.sd-progress-time {
	font-weight: 700;
	color: #334155;
}

.sd-tag-list,
.sd-log-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.sd-tag-item {
	padding: 10px 12px;
	border-radius: 999px;
	background: #fff7ed;
	color: #c26a06;
	border: 1px solid rgba(245, 158, 11, 0.16);
	font-size: 12px;
	font-weight: 700;
}

.sd-log-item {
	padding: 10px 12px;
	border-radius: 10px;
	background: #f8fbff;
	border: 1px solid #edf2f8;
	color: #4b5563;
	font-size: 12px;
}

@media (max-width: 1400px) {
	.sd-summary-grid {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.sd-panel-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.sd-header-main {
		flex-direction: column;
		align-items: flex-start;
	}

	.sd-summary-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
</style>
