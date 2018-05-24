<template>
  <div class="servicerow" v-bind:class="'status-' + service.status" v-if="service.appearsInShortlist">
    <div class="servicecell">
        <span class="hostname">{{ service.host }}</span>
    </div>
    <div class="servicecell">
      <span class="servicename">{{ service.name }}</span>
    </div>
    <div class="servicecell">
      {{ service.status }}
    </div>
    <div class="servicecell">
        <span class="description">{{ service.checkresult }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    host: {
      type: Object
    },
    service: {
      tyoe: Object
    }
  }
};
</script>

<style scoped>
.hostname {
  color: black;
}

.servicename {
  color: blue;
}
.servicerow {
  display: table-row;
}
.servicecell {
  display:table-cell;
}
.status-OK {
  background-color:lightgreen;
}
.status-WARNING {
  background-color:yellow;
}
.status-UNKNOWN {
  background-color:orange;
}
.status-CRITICAL {
  background-color:red;
}
</style>
