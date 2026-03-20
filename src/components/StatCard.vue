<template>
  <div class="stat-card dashboard-stat-card">
    <div class="stat-title">{{ title }}</div>
    <div class="stat-value">
      {{ value }}<span v-if="unit" class="stat-unit">{{ unit }}</span>
    </div>
    <slot name="visual"></slot>
    <el-icon v-if="icon" class="stat-icon"><component :is="icon" /></el-icon>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  unit: String,
  icon: Object
})
</script>

<style scoped lang="scss">
.stat {
  &-card {
    position: relative;
    padding: 13px 15px 11px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 11px;
    border: 1px solid #e8eef7;
    box-shadow: 0 3px 12px rgba(31, 41, 55, 0.05);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0 0 auto 0;
      height: 3px;
      background: linear-gradient(90deg, #5d87ff, #49beff);
    }
  }

  &-title {
    font-size: 11px;
    color: #7c8fac;
    margin-bottom: 5px;
    font-weight: 600;
  }

  &-value {
    font-size: 21px;
    font-weight: 800;
    color: #1f2937;
    letter-spacing: -0.02em;
  }

  &-unit {
    font-size: 12px;
    margin-left: 4px;
    color: #7c8fac;
  }

  &-icon {
    position: absolute;
    top: 11px;
    right: 11px;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    font-size: 14px;
    color: #5d87ff;
    opacity: 1;
    background: linear-gradient(135deg, rgba(93, 135, 255, 0.12), rgba(73, 190, 255, 0.18));
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
