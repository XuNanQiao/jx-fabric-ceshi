<template>
	<el-card
		class="search-card"
		shadow="never">
		<el-form
			:inline="true"
			:model="filters"
			class="filter-form">
			<el-form-item label="用户名称:">
				<el-input
					v-model="filters.username"
					placeholder="请输入用户名"
					clearable
					style="width: 210px" />
			</el-form-item>
			<el-form-item label="用户角色">
				<el-select
					v-model="filters.role"
					placeholder="请选择"
					clearable
					style="width: 180px">
					<el-option
						label="admin"
						value="admin" />
					<el-option
						label="标注"
						value="标注" />
					<el-option
						label="算法研发"
						value="算法研发" />
					<el-option
						label="实习标注"
						value="实习标注" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button
					type="primary"
					@click="handleSearch">
					<el-icon><Search /></el-icon>搜索
				</el-button>
				<el-button @click="handleReset">重置</el-button>
			</el-form-item>
		</el-form>
	</el-card>

	<el-card
		class="table-card"
		shadow="never">
		<template #header>
			<div class="table-title-row">
				<el-icon class="table-title-icon"><CopyDocument /></el-icon>
				<div class="table-title">用户列表</div>
			</div>
		</template>

		<div class="table-tools">
			<el-button
				type="danger"
				plain>
				<el-icon><Delete /></el-icon>批量删除
			</el-button>
			<el-button type="primary">新增用户</el-button>
			<el-button
				text
				circle
				class="tool-icon-btn"
				><el-icon><Refresh /></el-icon
			></el-button>
			<el-button
				text
				circle
				class="tool-icon-btn"
				><el-icon><Sort /></el-icon
			></el-button>
			<el-button
				text
				circle
				class="tool-icon-btn"
				><el-icon><Operation /></el-icon
			></el-button>
			<el-button
				text
				circle
				class="tool-icon-btn"
				><el-icon><FullScreen /></el-icon
			></el-button>
		</div>

		<el-table-v2
			:columns="columns"
			:data="tableData"
			:width="1200"
			:height="600"
			:row-height="47"
			fixed>
			<template #row="props">
				<Row v-bind="props" />
			</template>
		</el-table-v2>
	</el-card>
</template>

<script setup>
import { ref, reactive, h } from 'vue';
import { Search, CopyDocument, Delete, Refresh, Sort, Operation, FullScreen, EditPen } from '@element-plus/icons-vue';
import { ElButton, ElIcon } from 'element-plus';
import { cloneVNode } from 'vue';

const filters = reactive({
	username: '',
	role: '',
});

// 生成1000条模拟数据，包含rowSpan字段用于合并单元格
const generateMockData = () => {
	const roles = ['admin', '标注', '算法研发', '实习标注'];
	const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
	const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平'];

	const data = [];
	for (let i = 1; i <= 1000; i++) {
		const surname = surnames[Math.floor(Math.random() * surnames.length)];
		const name = names[Math.floor(Math.random() * names.length)];
		const username = i === 1 ? 'admin' : `${surname}${name}${i}`;
		const role = i === 1 ? 'admin' : roles[Math.floor(Math.random() * roles.length)];
		const phone = `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
		const email = `${username}@autoedge.com`;

		const createDate = new Date(
			2023,
			Math.floor(Math.random() * 12),
			Math.floor(Math.random() * 28) + 1,
			Math.floor(Math.random() * 24),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 60),
		);
		const lastLoginDate = new Date(
			2024,
			Math.floor(Math.random() * 3),
			Math.floor(Math.random() * 28) + 1,
			Math.floor(Math.random() * 24),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 60),
		);

		// 每隔3-5行设置一个合并单元格示例
		const shouldMerge = i % 17 === 1 && i < 995;
		const rowSpan = shouldMerge ? Math.floor(Math.random() * 3) + 12 : undefined;

		data.push({
			id: i,
			username,
			email,
			phone,
			role,
			lastLoginTime: lastLoginDate.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
			createTime: createDate.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
			rowSpan: rowSpan, // 用于合并单元格
		});
	}
	return data;
};

const allData = ref(generateMockData());
const tableData = ref([...allData.value]);

// 定义虚拟表格列，支持根据rowSpan动态合并单元格
const columns = [
	{
		key: 'username',
		dataKey: 'username',
		title: '用户名',
		width: 150,
	},
	{
		key: 'column-n-1',
		width: 50,
		title: 'Row No.',
		cellRenderer: ({ rowIndex }) => `${rowIndex + 1}`,
		align: 'center',
	},
	{ key: 'email', dataKey: 'email', title: '邮箱', width: 200 },
	{ key: 'phone', dataKey: 'phone', title: '手机号', width: 140 },
	{ key: 'role', dataKey: 'role', title: '用户角色', width: 120 },
	{ key: 'lastLoginTime', dataKey: 'lastLoginTime', title: '上次登录时间', width: 180 },
	{ key: 'createTime', dataKey: 'createTime', title: '创建时间', width: 180 },
	{
		key: 'operations',
		title: '操作',
		width: 150,
		cellRenderer: () => {
			return h('div', { style: 'display: flex; gap: 8px;' }, [
				h(ElButton, { type: 'primary', link: true, size: 'small' }, () => [h(ElIcon, null, () => h(EditPen)), '修改']),
				h(ElButton, { type: 'danger', link: true, size: 'small' }, () => [h(ElIcon, null, () => h(Delete)), '删除']),
			]);
		},
	},
];
const rowSpanIndex = 0;
const ROW_HEIGHT = 47;
const Row = ({ rowData, rowIndex, cells }) => {
	const data = tableData.value;
	const rowSpan = rowData.rowSpan;

	if (rowSpan && rowSpan > 1) {
		// 主行：扩展高度并应用样式
		const cell = cells[rowSpanIndex];
		const style = {
			...cell.props.style,
			backgroundColor: 'var(--el-color-primary-light-3)',
			height: `${rowSpan * ROW_HEIGHT - 1}px`,
			alignSelf: 'flex-start',
			zIndex: 1,
		};
		cells[rowSpanIndex] = cloneVNode(cell, { style });
	} else {
		// 检查当前行是否被前面的行覆盖
		let isCovered = false;
		const maxLookback = Math.min(rowIndex, 20);

		for (let offset = 1; offset <= maxLookback; offset++) {
			const prevIndex = rowIndex - offset;
			const prevRow = data[prevIndex];

			// 如果前面的行有 rowSpan，并且当前行在其覆盖范围内
			if (prevRow?.rowSpan && prevRow.rowSpan > 1) {
				// prevIndex 是主行的索引，主行覆盖范围是 [prevIndex, prevIndex + rowSpan)
				// 当前行 rowIndex 如果在这个范围内（且不是主行本身），就应该被隐藏
				if (rowIndex < prevIndex + prevRow.rowSpan) {
					isCovered = true;
					break;
				}
			}
		}

		if (isCovered) {
			cells[rowSpanIndex] = cloneVNode(cells[rowSpanIndex], {
				style: {
					...cells[rowSpanIndex].props.style,
					visibility: 'hidden',
					height: '0px',
				},
			});
		}
	}
	return cells;
};
const handleSearch = () => {
	console.log('Searching...', filters);
	tableData.value = allData.value.filter((item) => {
		const matchUsername = !filters.username || item.username.includes(filters.username);
		const matchRole = !filters.role || item.role === filters.role;
		return matchUsername && matchRole;
	});
};

const handleReset = () => {
	filters.username = '';
	filters.role = '';
	tableData.value = [...allData.value];
};
</script>

<style scoped lang="scss">
.search-card {
	margin-bottom: 8px;
}

.table {
	&-card {
		min-height: 400px;

		:deep(.el-card__header) {
			padding: 12px 14px 8px;
		}

		:deep(.el-card__body) {
			padding: 0 14px 12px;
		}

		:deep(.el-table th) {
			padding: 8px 0;
		}

		:deep(.el-table td) {
			padding: 7px 0;
		}
	}

	&-title {
		&-row {
			display: flex;
			align-items: center;
		}

		&-icon {
			margin-right: 8px;
			font-size: 17px;
			color: #5d87ff;
		}

		&-title {
			font-weight: 700;
			font-size: 14px;
			color: #2a3547;
		}
	}

	&-tools {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
		flex-wrap: wrap;
	}
}

.tool-icon-btn {
	font-size: 17px;
	color: #2a3547;
}

.pager-wrap {
	margin-top: 8px;
	display: flex;
	justify-content: flex-end;
}

.filter-form {
	:deep(.el-form-item) {
		margin-bottom: 6px;
		margin-right: 12px;
	}

	:deep(.el-form-item__label) {
		font-size: 12px;
		font-weight: 600;
		color: #606266;
	}

	:deep(.el-input__wrapper),
	:deep(.el-select__wrapper) {
		min-height: 34px;
		border-radius: 8px;
		box-shadow: 0 0 0 1px #e4ebf5 inset;
	}
}
</style>
