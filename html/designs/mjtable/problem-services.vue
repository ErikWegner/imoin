<template>
  <div class="oneitem">
  <service-item
    v-for="service in host.services"
    :key="service.name"
    :host="host"
    :service="service"
  ></service-item>
  </div>
</template>

<script>
import ServiceItem from './service-item.vue';

export default {
  props: {
    host: {
      type: Object
    }
  },
  components: {
    ServiceItem
  }
}
</script>

<style scoped>
.oneitem{
  display:table-row-group;
}
</style>
