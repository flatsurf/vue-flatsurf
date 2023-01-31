<template>
  <g class="SaddleConnection">
    <path-component :path="[connection]" :svg="svg" :layout="layout" :animated="animated" />
  </g>
</template>
<script lang="ts">
import Layout from '@/layout/Layout';
import SaddleConnectionData from "@/flatsurf/SaddleConnection";
import CoordinateSystem from "@/geometry/CoordinateSystem";
import PathComponent from "@/components/flatsurf/Path.vue";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  components: {
    PathComponent,
  },

  name: "SaddleConnection",

  props: {
    connection: {
      type: Object as PropType<SaddleConnectionData>,
      required: true
    },

    layout: {
      type: Object as PropType<Layout>,
      required: true
    },

    svg: {
      type: Object as PropType<CoordinateSystem>,
      required: true
    },

    animated: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    }
  }
});
</script>
<style>
.SaddleConnection {
  stroke: #d95f02;
  stroke-width: 4px;
}
</style>
