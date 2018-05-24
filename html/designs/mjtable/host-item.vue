<template>
  <div class="hostrow" v-bind:class="'status-' + host.status" v-if="host.appearsInShortlist">
    <div class="hostcell">
        <span class="hostname">{{ host.name }}</span>
    </div>
    <div class="hostcell">
    </div>
    <div class="hostcell">
      {{ host.status }}
    </div>
    <div class="hostcell">
        <span class="description">{{ host.checkresult }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    host: {
      type: Object
    }
  }
}
</script>

<style scoped>
.hostrow {
  display: table-row;
}
.hostcell {
  padding-top: 1px;
  padding-right: 10px;
  padding-bottom: 0px;
  padding-left: 0px;
  display:table-cell;
}
.status-UP {
  background-color:lightgreen;
}
.status-DOWN {
  background-color:red;
}
</style>
