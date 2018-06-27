<template>
  <div class="host">
    <div>
      <span class="hostname">{{ host.name }}</span>
      <span v-bind:class="['status', host.status]">{{ host.status }}</span>
      <span class="actions" 
        :data-hostname="host.name"
        :data-instanceindex="host.instanceindex"
        >
        <span title="Recheck" class="recheck" v-on:click="recheck" data-command="recheck"/>
      </span>
      <span class="hostcheckinfo">{{ host.checkresult }}</span>
      <div class="services">
        <service-item
          v-for="service in host.services"
          v-if="service.appearsInShortlist || listtype == 'services'"
          :key="service.name"
          :service="service" :host="host" class="service"></service-item>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceItem from "./service.vue";

export default {
  methods: {
    recheck(e) {
      triggerCmdExec(e);
    }
  },
  props: {
    host: {
      type: Object,
      required: true
    },
    listtype: {
      type: String,
      required: false,
      default: "shortlist"
    }
  },
  components: {
    ServiceItem
  }
};
</script>
