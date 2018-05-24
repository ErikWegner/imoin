<template>
<div>
  <error-message v-if="paneldata.message" :message="paneldata.message"></error-message>
  <main-display :paneldata="paneldata"></main-display>
</div>
</template>

<script>
import ErrorMessage from './error.vue';
import MainDisplay from './main.vue';

export default {
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
  components: {
    ErrorMessage,
    MainDisplay
  }
};
</script>
