<template>
  <div>
  <host-item
      v-for="host in paneldata.hosts"
      v-show="host.appearsInShortlist || listtype != 'shortlist'"
      :key="host.name"
      :host="host"
      :listtype="listtype"
      >
    </host-item>
  </div>
</template>

<script>
import HostItem from './host.vue';

export default {
  props: {
    paneldata: {
      type: Object,
      required: true
    },
    listtype: {
      type: String,
      required: false,
      default: 'shortlist'
    }
  },
  components: {
    HostItem
  }
}
</script>
