<template>
  <div class="ar-summary-row">
    <StatCard
      v-for="item in algoSummary"
      :key="item.title"
      :title="item.title"
      :value="item.value"
      :unit="item.unit"
      :icon="item.icon"
    />
  </div>

  <div class="ar-grid">
    <AlgoCard
      v-for="item in algoCards"
      :key="item.title"
      :title="item.title"
      :footer-text="item.desc"
    >
      <template #actions>
        <el-button size="small">验证</el-button>
        <el-button size="small">下发</el-button>
        <el-button size="small">详情</el-button>
      </template>

      <div class="ar-item-body">
        <span class="scene-tag">{{ item.scene }}</span>
      </div>
    </AlgoCard>
  </div>
</template>

<script setup>
import { Box, PieChart, Ticket } from "@element-plus/icons-vue"
import StatCard from "../components/StatCard.vue"
import AlgoCard from "../components/AlgoCard.vue"

const algoSummary = [
  { title: "算法总数", value: "124", unit: "个", icon: Box },
  { title: "运行中", value: "12", unit: "个", icon: PieChart },
  { title: "已暂停", value: "3", unit: "个", icon: Ticket }
]

const algoCards = [
  { title: "安全帽检测", scene: "通用场景", desc: "用于检测监控画面中人员是否佩戴安全帽。" },
  { title: "反光衣识别", scene: "通用场景", desc: "用于检测监控画面中人员是否穿着反光背心。" },
  { title: "入侵检测", scene: "安防场景", desc: "对指定区域进行全时段的人员入侵检测。" },
  { title: "烟火识别", scene: "通用场景", desc: "对监控范围内的火苗和烟雾进行识别及预警。" }
]
</script>

<style scoped lang="scss">
.ar {
  &-summary-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 12px;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  &-item-body {
    height: 78px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.scene-tag {
  background: #ecf2ff;
  color: #5d87ff;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .ar-summary-row,
  .ar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .ar-summary-row,
  .ar-grid {
    grid-template-columns: 1fr;
  }
}
</style>