<template>
	<div class="pv-project-card">
		<div class="pv-card-code">{{ project.code }}</div>
		<div class="pv-card-title">{{ project.title }}</div>

		<div class="pv-card-body">
			<div class="pv-info-row">
				<div class="pv-info-label">
					<el-icon><User /></el-icon>
					<span>负责人</span>
				</div>
				<div class="pv-info-value">{{ project.owner }}</div>
			</div>

			<div class="pv-info-row">
				<div class="pv-info-label">
					<el-icon><Opportunity /></el-icon>
					<span>状态</span>
				</div>
				<div class="pv-info-value is-status">{{ project.status }}</div>
			</div>

			<div class="pv-info-row">
				<div class="pv-info-label">
					<el-icon><Calendar /></el-icon>
					<span>交付日期</span>
				</div>
				<div class="pv-info-value">{{ project.deliveryDate }}</div>
			</div>

			<div class="pv-info-row">
				<div class="pv-info-label">
					<el-icon><Aim /></el-icon>
					<span>站点数量</span>
				</div>
				<div class="pv-info-value">{{ project.siteCount }}</div>
			</div>
		</div>

		<div class="pv-card-actions">
			<el-button
				type="primary"
				link
				class="pv-detail-btn"
				@click="emit('detail', project)">
				详情
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { Aim, Calendar, Opportunity, User } from '@element-plus/icons-vue';

defineProps({
	project: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(['detail']);
</script>

<style scoped lang="scss">
.pv {
	&-project-card {
		position: relative;
		padding: 9px 11px;
		border-radius: 12px;
		background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
		border: 1px solid #e8eef7;
		box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
		min-height: 118px;
		overflow: hidden;
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease,
			border-color 0.25s ease;

		&::before {
			content: '';
			position: absolute;
			inset: 0 0 auto 0;
			height: 3px;
			background: linear-gradient(90deg, #5d87ff, #49beff);
		}

		&:hover {
			transform: translateY(-3px);
			border-color: rgba(93, 135, 255, 0.22);
			box-shadow: 0 10px 22px rgba(31, 41, 55, 0.08);
		}
	}

	&-card {
		&-code {
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

			&::before {
				content: '';
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: currentColor;
				box-shadow: 0 0 0 3px rgba(93, 135, 255, 0.12);
			}
		}

		&-title {
			margin-bottom: 9px;
			font-size: 12px;
			line-height: 1.4;
			font-weight: 700;
			color: #2a3547;
			height: 30px;
			overflow: hidden;
			display: -webkit-box;
			line-clamp: 2;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		&-body {
			padding-top: 7px;
			border-top: 1px solid #edf1f6;
			display: flex;
			flex-direction: column;
			gap: 5px;
		}

		&-actions {
			display: flex;
			justify-content: flex-end;
			padding-top: 6px;
			margin-top: 4px;
			border-top: 1px dashed #edf1f6;
		}
	}

	&-detail-btn {
		font-size: 12px;
		font-weight: 700;
		color: #5d87ff;
	}

	&-info {
		&-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
			font-size: 11px;
			padding: 3px 0;
		}

		&-label {
			display: inline-flex;
			align-items: center;
			gap: 5px;
			color: #606266;
			flex-shrink: 0;

			:deep(.el-icon) {
				color: #7c8fac;
			}
		}

		&-value {
			color: #303133;
			font-weight: 500;
			text-align: right;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&.is-status {
				display: inline-flex;
				align-items: center;
				height: 18px;
				padding: 0 7px;
				border-radius: 999px;
				font-weight: 700;
				color: #0f9f84;
				background: rgba(19, 222, 185, 0.12);
				font-size: 10px;
			}
		}
	}
}
</style>
