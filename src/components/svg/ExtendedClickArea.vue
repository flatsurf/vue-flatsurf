<template>
  <g class="extended-click-area" @mousedown.prevent.stop="(e) => $emit('mousedown', e)" @click="(e) => $emit('click', e)" @mouseenter="(e) => $emit('mouseenter', e)" @mouseleave="(e) => $emit('mouseleave', e)" @mousemove="(e) => $emit('mousemove', e)" >
    <slot/>
    <g class="extension">
      <slot/>
    </g>
  </g>
</template>
<style lang="scss" scoped>
.extension * {
  visibility: hidden !important;
  stroke-width: 30px !important;
  stroke-linejoin: round !important;
  stroke-linecap: butt !important;
  stroke-dasharray: 0 !important;
  pointer-events: all !important;
  cursor: pointer;
}
.extension circle {
  stroke-width: inherit !important;
  transform-origin: center center;
  transform-box: fill-box;
  transform: scale(2);
}
</style>
