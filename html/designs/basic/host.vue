<template>
  <div class="host">
    <div>
      <span class="hostname">{{ host.name }}</span>
      <span v-bind:class="['status', host.status]">{{ host.status }}</span>
      <span class="actions" 
        :data-hostname="host.name"
        :data-instanceindex="host.instanceindex"
        >
        <span title="Recheck" class="recheck" data-command="recheck"/>
      </span>
      <span class="hostcheckinfo">{{ host.checkresult }}</span>
      <div class="services">
        <service-item
          v-for="service in host.services"
          v-if="service.appearsInShortlist || listtype == 'services'"
          :key="service.name"
          :service="service" class="service"></service-item>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceItem from "./service.vue";

export default {
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

<style scoped>
.host {
  padding: 0.5ex;
}
.host:hover {
    background-color: #eef;
    border-radius: 1ex;
}
.hostname {
  font-size: 160%;
}
.status {
  float: right;
  width: 6em;
  text-align: center;
  margin-top: 0.5ex;
}

.status.UP {
  background-color: #3f3;
}
.status.DOWN {
  background-color: #f33;
}

.actions {
  float: right;
  width: 6em;
  text-align: right;
  margin-top: 0.5ex;
  padding-right: 1ex;
}

.recheck {
  width: 14px;
  height: 14px;
  display: inline-block;
  background: url("/icons/rck.png");
  cursor: pointer;
}

.hostcheckinfo {
  color: #888;
  padding-left: 1ex;
}

.services {
  padding-left: 2em;
}

.service {
  margin-bottom: 1ex;
  border-top: 1px dotted #ddd;
}

.service:last-child {
  border-bottom: 1px dotted #ddd;
}

.service:hover {
    background-color: #ffe;
    border-radius: 0.5ex;
}
</style>
