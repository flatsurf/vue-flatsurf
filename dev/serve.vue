<script lang="ts">
import Vue from 'vue';
import { VueFlatsurfSample } from '@/entry';

export default Vue.extend({
  name: 'ServeDev',
  components: {
    VueFlatsurfSample,
  }
});
</script>

<template>
  <div id="app">
    <vue-flatsurf-sample />
  </div>
</template>
