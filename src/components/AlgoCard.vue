<template>
  <div class="algo-card dashboard-stat-card">
    <div class="algo-card-head">
      <div class="head-main">
        <div v-if="code" class="head-code">{{ code }}</div>
        <div class="head-title">{{ title }}</div>
      </div>
      <div class="head-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="algo-card-body">
      <slot></slot>
    </div>

    <div v-if="footerText" class="algo-card-footer">
      {{ footerText }}
    </div>

    <div v-if="showAccent" class="card-accent-bar">
      <div 
        class="accent-fill" 
        :class="`is-${accentTone}`"
        :style="{ width: accentWidth }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  code: String,
  footerText: String,
  showAccent: Boolean,
  accentTone: { type: String, default: 'blue' },
  accentWidth: { type: String, default: '100%' }
})
</script>

<style scoped lang="scss">
.algo-card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 11px;
  border: 1px solid #e8eef7;
  padding: 11px;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.05);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 22px rgba(31, 41, 55, 0.08);
    border-color: rgba(93, 135, 255, 0.22);
  }

  &-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  &-body {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &-footer {
    margin-top: auto;
    padding-top: 9px;
    font-size: 11px;
    color: #7c8fac;
    border-top: 1px solid #eef3f8;
  }
}

.head {
  &-code {
    font-size: 11px;
    color: #5d87ff;
    font-weight: 600;
    margin-bottom: 3px;
  }

  &-title {
    font-size: 12px;
    font-weight: 700;
    color: #2a3547;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.card-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f6f9fc;
}

.accent-fill {
  height: 100%;

  &.is-blue {
    background: #5d87ff;
  }

  &.is-green {
    background: #13deb9;
  }

  &.is-amber {
    background: #ffae1f;
  }

  &.is-red {
    background: #fa896b;
  }
}
</style>
