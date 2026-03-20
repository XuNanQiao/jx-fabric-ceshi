<template>
	<el-container class="layout-root">
		<el-aside
			class="sidebar"
			width="210px">
			<div class="brand">
				<div
					class="brand-icon"
					aria-hidden="true">
					<span class="brand-cube"></span>
				</div>
				<div class="brand-copy">
					<div class="brand-text">AutoEdge</div>
					<div class="brand-subtitle">边云训推一体平台</div>
				</div>
			</div>

			<el-menu
				class="side-menu"
				:default-openeds="['algo-delivery', 'sys']"
				:default-active="activeMenu"
				unique-opened
				@select="handleMenuSelect">
				<el-menu-item index="overview"
					><el-icon><DataAnalysis /></el-icon><span>总览</span></el-menu-item
				>
				<el-menu-item index="algo-repo"
					><el-icon><Collection /></el-icon><span>算法仓库</span></el-menu-item
				>
				<el-sub-menu index="algo-delivery">
					<template #title
						><el-icon><Van /></el-icon><span>算法交付</span></template
					>
					<el-menu-item index="delivery-progress">交付进度</el-menu-item>
					<el-menu-item index="data-progress">数据进度</el-menu-item>
					<el-menu-item index="train-progress">训练进度</el-menu-item>
					<el-menu-item index="release-progress">下发进度</el-menu-item>
					<el-menu-item index="quant-list">量化列表</el-menu-item>
				</el-sub-menu>
				<el-menu-item index="project-view"
					><el-icon><Grid /></el-icon><span>项目视图</span></el-menu-item
				>
				<el-menu-item index="algo-dev"
					><el-icon><Tools /></el-icon><span>算法开发</span></el-menu-item
				>
				<el-menu-item index="agent-data"
					><el-icon><Coin /></el-icon><span>智能体数据</span></el-menu-item
				>
				<el-menu-item index="agent-train"
					><el-icon><Cpu /></el-icon><span>智能体训练</span></el-menu-item
				>
				<el-sub-menu index="sys">
					<template #title
						><el-icon><Setting /></el-icon><span>系统管理</span></template
					>
					<el-menu-item index="user-management">用户</el-menu-item>
					<el-menu-item index="role">角色权限</el-menu-item>
					<el-menu-item index="menu">菜单管理</el-menu-item>
				</el-sub-menu>
			</el-menu>

			<div class="sidebar-user">
				<div class="user-avatar-wrapper">
					<div class="user-avatar-rect">
						<el-icon><User /></el-icon>
					</div>
				</div>
				<div class="user-info">
					<div class="user-name">admin</div>
					<div class="user-role">管理员</div>
				</div>
				<div class="user-logout">
					<el-icon><SwitchButton /></el-icon>
				</div>
			</div>
		</el-aside>

		<el-container>
			<el-header
				class="top-header"
				height="52px">
				<div class="header-left">
					<el-breadcrumb separator="/">
						<el-breadcrumb-item v-if="currentParentLabel">{{ currentParentLabel }}</el-breadcrumb-item>
						<el-breadcrumb-item>{{ currentPageLabel }}</el-breadcrumb-item>
					</el-breadcrumb>
					<span class="current-page">{{ currentPageLabel }}</span>
				</div>
				<div class="header-actions">
					<el-icon><Search /></el-icon>
					<el-icon><FullScreen /></el-icon>
					<span class="admin-user"
						><el-icon><User /></el-icon>admin</span
					>
				</div>
			</el-header>

			<el-main class="content-main">
				<Overview v-if="activeMenu === 'overview'" />
				<AlgoRepo v-else-if="activeMenu === 'algo-repo'" />
				<DeliveryProgress v-else-if="activeMenu === 'delivery-progress'" />
				<TrainProgress v-else-if="activeMenu === 'train-progress'" />
				<ReleaseProgress v-else-if="activeMenu === 'release-progress'" />
				<ProjectView v-else-if="activeMenu === 'project-view'" />
				<StationDetail
					v-else-if="activeMenu === 'station-detail'"
					:route-info="stationRouteInfo" />
				<AlgoDetail
					v-else-if="activeMenu === 'algo-detail'"
					:route-info="algoRouteInfo" />
				<AlgoInstanceDetail
					v-else-if="activeMenu === 'algo-instance-detail'"
					:route-info="algoInstanceRouteInfo" />
				<UserManagement v-else-if="activeMenu === 'user-management'" />
				<div v-else class="placeholder-view">
					正在开发中: {{ currentPageLabel }}
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
	Coin,
	Collection,
	Cpu,
	DataAnalysis,
	FullScreen,
	Grid,
	Search,
	Setting,
	SwitchButton,
	Tools,
	User,
	Van,
} from '@element-plus/icons-vue';

// 导入拆分后的页面组件
import AlgoRepo from './views/AlgoRepo.vue';
import AlgoDelivery from './views/AlgoDelivery.vue';
import AlgoDetail from './views/AlgoDetail.vue';
import AlgoInstanceDetail from './views/AlgoInstanceDetail.vue';
import Overview from './views/Overview.vue';
import ProjectView from './views/ProjectView.vue';
import StationDetail from './views/StationDetail.vue';
import TrainProgress from './views/TrainProgress.vue';
import ReleaseProgress from './views/ReleaseProgress.vue';
import UserManagement from './views/UserManagement.vue';
import DeliveryProgress from './views/DeliveryProgress.vue';

const activeMenu = ref('overview');
const currentHash = ref(window.location.hash || '');

const parseStationRoute = (hash) => {
	const match = hash.match(/^#\/project-manage\/station\/([^?]+)(?:\?(.*))?$/);
	if (!match) {
		return null;
	}

	const [, projectCode, queryString = ''] = match;
	const query = new URLSearchParams(queryString);

	return {
		projectCode: decodeURIComponent(projectCode),
		stationSn: decodeURIComponent(query.get('station_sn') || ''),
		siteName: decodeURIComponent(query.get('site_name') || ''),
	};
};

const parseAlgoRoute = (hash) => {
	const match = hash.match(/^#\/project-manage\/algo\/([^?]+)(?:\?(.*))?$/);
	if (!match) {
		return null;
	}

	const [, algoId, queryString = ''] = match;
	const query = new URLSearchParams(queryString);

	return {
		algoId: decodeURIComponent(algoId),
		name: decodeURIComponent(query.get('name') || ''),
	};
};

const parseAlgoInstanceRoute = (hash) => {
	const match = hash.match(/^#\/project-manage\/algo-instance\/([^?]+)(?:\?(.*))?$/);
	if (!match) {
		return null;
	}

	const [, algoId, queryString = ''] = match;
	const query = new URLSearchParams(queryString);

	return {
		algoId: decodeURIComponent(algoId),
		name: decodeURIComponent(query.get('name') || ''),
	};
};

const hashMenuMap = {
	'#/home': 'overview',
	'#/overview': 'overview',
	'#/algo-repo': 'algo-repo',
	'#/board/delivery-progress': 'delivery-progress',
	'#/board/data-progress': 'data-progress',
	'#/board/train-progress': 'train-progress',
	'#/board/release-progress': 'release-progress',
	'#/board/quant-list': 'quant-list',
	'#/project-view': 'project-view',
	'#/project-manage/station': 'station-detail',
	'#/algo-dev': 'algo-dev',
	'#/agent-data': 'agent-data',
	'#/agent-train': 'agent-train',
	'#/system/user-management': 'user-management',
	'#/system/role': 'role',
	'#/system/menu': 'menu',
};

const menuHashMap = {
	overview: '#/home',
	'algo-repo': '#/algo-repo',
	'delivery-progress': '#/board/delivery-progress',
	'data-progress': '#/board/data-progress',
	'train-progress': '#/board/train-progress',
	'release-progress': '#/board/release-progress',
	'quant-list': '#/board/quant-list',
	'project-view': '#/project-view',
	'station-detail': '#/project-manage/station',
	'algo-dev': '#/algo-dev',
	'agent-data': '#/agent-data',
	'agent-train': '#/agent-train',
	'user-management': '#/system/user-management',
	role: '#/system/role',
	menu: '#/system/menu',
};

const menuMap = {
	overview: { label: '总览' },
	'algo-repo': { label: '算法仓库' },
	'delivery-progress': { label: '交付进度', parent: '算法交付' },
	'data-progress': { label: '数据进度', parent: '算法交付' },
	'train-progress': { label: '训练进度', parent: '算法交付' },
	'release-progress': { label: '下发进度', parent: '算法交付' },
	'quant-list': { label: '量化列表', parent: '算法交付' },
	'project-view': { label: '项目视图' },
	'station-detail': { label: '站点详情', parent: '项目视图' },
	'algo-detail': { label: '算法详情', parent: '项目视图' },
	'algo-instance-detail': { label: '算法实例详情', parent: '项目视图' },
	'algo-dev': { label: '算法开发' },
	'agent-data': { label: '智能体数据' },
	'agent-train': { label: '智能体训练' },
	'user-management': { label: '用户', parent: '系统管理' },
	role: { label: '角色权限', parent: '系统管理' },
	menu: { label: '菜单管理', parent: '系统管理' },
};

const currentPageLabel = computed(() => menuMap[activeMenu.value]?.label || '算法交付');
const currentParentLabel = computed(() => menuMap[activeMenu.value]?.parent || '');
const stationRouteInfo = computed(() => parseStationRoute(currentHash.value) || {});
const algoRouteInfo = computed(() => parseAlgoRoute(currentHash.value) || {});
const algoInstanceRouteInfo = computed(() => parseAlgoInstanceRoute(currentHash.value) || {});

const syncMenuByHash = () => {
	currentHash.value = window.location.hash;
	if (parseAlgoInstanceRoute(window.location.hash)) {
		activeMenu.value = 'algo-instance-detail';
	} else if (parseAlgoRoute(window.location.hash)) {
		activeMenu.value = 'algo-detail';
	} else if (parseStationRoute(window.location.hash)) {
		activeMenu.value = 'station-detail';
	} else {
		activeMenu.value = hashMenuMap[window.location.hash] || 'overview';
	}
};

const handleMenuSelect = (index) => {
	activeMenu.value = index;
	window.location.hash = menuHashMap[index] || '#/home';
};

onMounted(() => {
	if (!window.location.hash) {
		window.location.hash = '#/home';
	}
	syncMenuByHash();
	window.addEventListener('hashchange', syncMenuByHash);
});

onBeforeUnmount(() => {
	window.removeEventListener('hashchange', syncMenuByHash);
});
</script>
