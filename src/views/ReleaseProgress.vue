<template>
	<div class="rp-container">
		<div class="rp-top-cards">
			<StatCard
				title="总计下发"
				value="1,805"
				unit="次"
				:icon="RefreshRight">
				<template #visual>
					<div class="rp-trend-chart">
						<svg
							viewBox="0 0 400 40"
							preserveAspectRatio="none"
							class="mini-chart">
							<defs>
								<linearGradient
									id="releaseLineGrad"
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
								d="M0,34 C22,18 42,16 60,26 C78,36 100,32 120,18 C138,8 164,8 184,14 C198,18 208,34 220,35 C236,36 246,22 262,22 C276,22 286,38 300,36 C322,32 340,12 360,10 C382,8 394,18 400,34 L400,40 L0,40 Z"
								fill="url(#releaseLineGrad)"></path>
							<path
								d="M0,34 C22,18 42,16 60,26 C78,36 100,32 120,18 C138,8 164,8 184,14 C198,18 208,34 220,35 C236,36 246,22 262,22 C276,22 286,38 300,36 C322,32 340,12 360,10 C382,8 394,18 400,34"
								fill="none"
								stroke="#4aa8f0"
								stroke-width="2"
								stroke-linecap="round"></path>
						</svg>
						<div class="rp-card-meta">
							<span>今日下发峰值 5,240</span>
							<strong>+12.8%</strong>
						</div>
					</div>
				</template>
			</StatCard>

			<StatCard
				title="待更新站点"
				value="2,500"
				unit="个"
				:icon="Connection">
				<template #visual>
					<div class="rp-trend-chart">
						<svg
							viewBox="0 0 400 40"
							preserveAspectRatio="none"
							class="mini-chart">
							<defs>
								<linearGradient
									id="releaseLineGradTwo"
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
								d="M0,10 C30,14 48,20 70,26 C88,32 104,4 124,12 C140,18 152,36 170,34 C188,32 194,8 214,10 C234,12 250,18 268,28 C286,38 302,26 316,16 C330,6 346,10 360,34 C374,38 392,28 400,20 L400,40 L0,40 Z"
								fill="url(#releaseLineGradTwo)"></path>
							<path
								d="M0,10 C30,14 48,20 70,26 C88,32 104,4 124,12 C140,18 152,36 170,34 C188,32 194,8 214,10 C234,12 250,18 268,28 C286,38 302,26 316,16 C330,6 346,10 360,34 C374,38 392,28 400,20"
								fill="none"
								stroke="#4aa8f0"
								stroke-width="2"
								stroke-linecap="round"></path>
						</svg>
						<div class="rp-card-meta">
							<span>待更新站点 5,240</span>
							<strong>+12.8%</strong>
						</div>
					</div>
				</template>
			</StatCard>
		</div>

		<div class="rp-grid">
			<div
				v-for="item in releaseProjects"
				:key="item.id"
				class="rp-project-card">
				<div class="rp-project-head">
					<div>
						<div class="rp-project-code">{{ item.code }}</div>
						<div class="rp-project-title">{{ item.title }}</div>
					</div>
					<el-button
						size="small"
						class="rp-refresh-btn"
						>一键更新</el-button
					>
				</div>

				<div class="rp-server-tabs">
					<span
						v-for="(tab, index) in item.tabs"
						:key="tab"
						class="rp-server-tab"
						:class="{ 'is-active': index === 0 }"
						>{{ tab }}</span
					>
				</div>

				<div class="rp-server-meta">{{ item.device }}</div>

				<div
					v-if="item.records.length"
					class="rp-record-list">
					<div
						v-for="(record, index) in item.records"
						:key="`${item.id}-${record.name}`"
						class="rp-record-row"
						:class="[`is-${record.state}`]">
						<div class="rp-record-main">
							<div class="rp-record-name">{{ record.name }}</div>
							<div class="rp-record-version">{{ record.version }}</div>
						</div>
						<div class="rp-record-side">
							<span class="rp-record-status">{{ record.status }}</span>
							<div class="rp-record-actions">
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
									>{{ record.action }}</el-button
								>
							</div>
						</div>
					</div>
				</div>

				<div
					v-else
					class="rp-empty">
					暂无数据
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Connection, RefreshRight } from '@element-plus/icons-vue';
import StatCard from '../components/StatCard.vue';

const releaseProjects = [
	{
		id: 'r1',
		code: 'E2024102101ls',
		title: '大唐JTB新余二期智能供检AI分析平台',
		device: 'CPU:amd64 GPU:NVIDIA A30',
		tabs: ['算法服务器', '算法服务器', '算法服务器'],
		records: [
			{ name: '【代码：x86/tueno3_src_master_v0.0.5', version: '可更新', status: '可更新', action: '下发', state: 'warning' },
			{ name: '未安全带', version: '+20250303.12 pt 已是最新版', status: '', action: '', state: 'done' },
			{ name: '地面积污（积水）', version: '+20251022.69.pt 待更新 +20251204.77.pt', status: '', action: '下发通用', state: 'done' },
			{ name: '火焰', version: '待更新 +20241025.3.pt', status: '', action: '下发通用', state: 'warning' },
			{ name: '姿势', version: '待更新 +20250318.43.pt', status: '', action: '下发通用', state: 'warning' },
			{ name: '人员', version: '+20250415.15.pt 已是最新版', status: '', action: '', state: 'done' },
		],
	},
	{
		id: 'r2',
		code: 'E2024070010',
		title: '国网新疆2024年二次物资公开招标采购项目（民丰站、大麻扎站、水库站）',
		device: 'CPU:amd64 GPU:NVIDIA GeForce RTX 3060',
		tabs: ['算法服务器'],
		records: [
			{ name: '【代码：-', version: '可更新', status: '可更新', action: '下发', state: 'warning' },
			{ name: '其他型分合闸储能', version: '+20250527.6.pt 已是最新版', status: '', action: '', state: 'done' },
			{ name: '隔离开关', version: '+20250325.2.pt 已是最新版', status: '', action: '', state: 'done' },
			{ name: '接地刀闸', version: '+20250325.2.pt 已是最新版', status: '', action: '', state: 'done' },
			{ name: '变电站外观识别', version: '+20250725.4.pt 已是最新版', status: '', action: '', state: 'done' },
			{ name: '指针表指向连续刻度（无标定）', version: '-', status: '', action: '', state: 'warning' },
		],
	},
	{
		id: 'r3',
		code: 'E2024070010',
		title: '国网新疆2024年二次物资公开招标采购项目（民丰站、大麻扎站、水库站）',
		device: 'CPU:- GPU:-',
		tabs: ['算法服务器'],
		records: [],
	},
	{
		id: 'r4',
		code: 'E2024070010',
		title: '国网新疆2024年二次物资公开招标采购项目',
		device: 'CPU:- GPU:-',
		tabs: ['此站点暂无边界服务器'],
		records: [{ name: '【代码：-', version: '可更新', status: '可更新', action: '下发', state: 'warning' }],
	},
	{
		id: 'r5',
		code: 'E2024010050',
		title: '桂冠新能源升压站智能巡检系统建设项目',
		device: 'CPU:amd64 GPU:NVIDIA GeForce RTX 3060',
		tabs: ['算法服务器'],
		records: [
			{ name: '【代码：-', version: '可更新', status: '可更新', action: '下发', state: 'warning' },
			{ name: '其他型分合闸储能', version: '+20240913.10.pt 已是最新版', status: '', action: '', state: 'done' },
		],
	},
	{
		id: 'r6',
		code: 'E2024060101',
		title: '800kV帮果换流站辅助项目',
		device: 'CPU:amd64 GPU:NVIDIA GeForce RTX 3060',
		tabs: ['算法服务器'],
		records: [
			{ name: '【代码：-', version: '可更新', status: '可更新', action: '下发', state: 'warning' },
			{ name: '指针表指向连续刻度（无标定）', version: '+20250703.2.pt 已是最新版', status: '', action: '', state: 'done' },
		],
	},
];
</script>

<style scoped lang="scss">
.rp-container {
	padding: 4px 6px 0;
}

.rp-top-cards {
	display: grid;
	grid-template-columns: 320px 320px;
	gap: 10px;
	margin-bottom: 10px;
}

.rp-trend-chart {
	margin-top: 8px;
}

.mini-chart {
	width: 100%;
	height: 34px;
}

.rp-card-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 6px;
	font-size: 12px;
	font-weight: 600;
	color: #7c8fac;
}

.rp-card-meta {
	strong {
		color: #5d87ff;
	}
}

.rp-grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10px;
	align-items: start;
	max-height: calc(100vh - 198px);
	overflow-y: auto;
	padding-right: 6px;
}

.rp-project-card {
	padding: 9px 11px 11px;
	border-radius: 10px;
	background: #fff;
	border: 1px solid #e6edf7;
	box-shadow: 0 2px 10px rgba(47, 83, 151, 0.045);
	min-height: 258px;
}

.rp-project-head {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 10px;
	margin-bottom: 8px;
}

.rp-project-code {
	margin-bottom: 4px;
	font-size: 11px;
	font-weight: 700;
	color: #5d87ff;
}

.rp-project-title {
	font-size: 12px;
	line-height: 1.45;
	font-weight: 700;
	color: #2a3547;
}

.rp-refresh-btn {
	height: 22px;
	padding: 0 8px;
	border-radius: 999px;
	font-size: 10px;
	color: #606266;
}

.rp-server-tabs {
	display: flex;
	gap: 18px;
	padding-bottom: 7px;
	margin-bottom: 8px;
	border-bottom: 1px solid #e8edf5;
}

.rp-server-tab {
	position: relative;
	font-size: 11px;
	font-weight: 600;
	color: #606266;
	padding-bottom: 4px;
}

.rp-server-tab {
	&.is-active {
		color: #5d87ff;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: -9px;
			height: 2px;
			background: #5d87ff;
		}
	}
}

.rp-server-meta {
	margin-bottom: 7px;
	font-size: 11px;
	color: #606266;
}

.rp-record-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.rp-record-row.is-featured {
	position: relative;
	padding: 7px 8px 7px 10px;
	padding-right: 10px;
	border-radius: 10px;
	background: linear-gradient(135deg, #f7faff 0%, #edf4ff 52%, #f8fbff 100%);
	border: 1px solid #b9d1ff;
	box-shadow:
		0 10px 22px rgba(93, 135, 255, 0.16),
		0 0 0 1px rgba(93, 135, 255, 0.05) inset;
	transform: translateY(-2px) scale(1.01);
}

.rp-record-row.is-featured::before {
	width: 3px;
	background: linear-gradient(180deg, #5d87ff 0%, #49beff 100%);
}

.rp-record-row.is-featured::after {
	content: '重点';
	position: absolute;
	right: 8px;
	top: -7px;
	height: 18px;
	padding: 0 8px;
	line-height: 18px;
	border-radius: 999px;
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.4px;
	color: #fff;
	background: linear-gradient(90deg, #5d87ff 0%, #49beff 100%);
	box-shadow: 0 6px 14px rgba(93, 135, 255, 0.22);
}

.rp-record-row.is-featured .rp-record-name {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	font-weight: 700;
	color: #2a3547;
	text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.rp-record-row.is-featured .rp-record-name::after {
	content: '首条';
	padding: 0 6px;
	height: 16px;
	line-height: 16px;
	border-radius: 999px;
	font-size: 10px;
	font-weight: 700;
	color: #4c6fff;
	background: rgba(93, 135, 255, 0.12);
	border: 1px solid rgba(93, 135, 255, 0.18);
	flex-shrink: 0;
}

.rp-record-row.is-featured .rp-record-version {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	font-weight: 700;
	color: #5d87ff;
}

.rp-record-row.is-featured .rp-record-version::before {
	content: '';
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: currentColor;
	box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.14);
}

.rp-record-row.is-featured .rp-record-status {
	padding: 0 8px;
	height: 20px;
	line-height: 20px;
	border-radius: 999px;
	background: rgba(93, 135, 255, 0.14);
	border: 1px solid rgba(93, 135, 255, 0.18);
	color: #5d87ff;
}

.rp-record-row.is-featured .rp-record-actions :deep(.el-button) {
	border-color: rgba(93, 135, 255, 0.28);
	color: #4c6fff;
	background: rgba(255, 255, 255, 0.92);
	box-shadow: 0 2px 8px rgba(93, 135, 255, 0.08);
}

.rp-record-row {
	position: relative;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 6px;
	padding: 4px 6px 4px 8px;
	border-radius: 2px;
	border: 1px solid #ebeef5;
	min-height: 26px;
}

.rp-record-row::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 2px;
	background: #d1d5db;
}

.rp-record-row {
	&.is-warning {
		background: #fff1ea;
		border-color: #f3b08d;

		&::before {
			background: #f0b400;
		}
	}

	&.is-done {
		background: #e7f8fc;
		border-color: #9ad8ea;

		&::before {
			background: #37c2f1;
		}
	}
}

.rp-record-main {
	min-width: 0;
	flex: 1;
}

.rp-record-name {
	font-size: 11px;
	color: #606266;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.rp-record-version {
	font-size: 10px;
	color: #909399;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.rp-record-side {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.rp-record-status {
	font-size: 10px;
	font-weight: 600;
	color: #606266;
}

.rp-record-actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.rp-record-actions {
	:deep(.el-button) {
		height: 19px;
		padding: 0 5px;
		border-radius: 3px;
		font-size: 9px;
		color: #606266;
		background: #fff;
		border: 1px solid #dcdfe6;
	}
}

.rp-empty {
	height: 140px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 600;
	color: #909399;
}

.rp-grid::-webkit-scrollbar {
	width: 6px;
}

.rp-grid::-webkit-scrollbar-thumb {
	border-radius: 999px;
	background: rgba(201, 208, 218, 0.9);
}

.rp-grid::-webkit-scrollbar-track {
	background: transparent;
}

@media (max-width: 1400px) {
	.rp-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 1200px) {
	.rp-top-cards,
	.rp-grid {
		grid-template-columns: 1fr;
	}
}
</style>
