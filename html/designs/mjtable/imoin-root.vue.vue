<template>
  <div>
    <p>mj table</p>
    <p>Label: {{paneldata.instanceLabel}}</p>
    <host-item 
    v-for="host in paneldata.hosts"
    :key="host.name"
    :host="host"
    
    ></host-item>
  </div>
</template>

<script>
import HostItem from "./host-item.vue";

export default {
  /*data () {
    return {
      paneldata: { hosts: [] }
    }
  },*/
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
  components: {
    HostItem
  }
};
</script>
