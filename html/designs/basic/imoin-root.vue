<template>
<div>
  <template v-if="paneldata.message || paneldata.hosts">
  <p class="tc"><button type="button" v-on:click="refresh">↺ Refresh</button></p>
  <error-message v-if="paneldata.message" :message="paneldata.message"></error-message>
  <summary-display :paneldata="paneldata"></summary-display>
  <main-display :paneldata="paneldata"></main-display>
  </template>
  <template v-else>
    <p class="tc">
    Waiting for data to display.
    </p>
  </template>
</div>
</template>

<script>
import ErrorMessage from './error.vue';
import MainDisplay from './main.vue';
import SummaryDisplay from './summary.vue';

export default {
  methods: {
    refresh(e) {
      triggerRefresh(e);
    }
  },
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
  components: {
    ErrorMessage,
    MainDisplay,
    SummaryDisplay
  }
};
</script>
