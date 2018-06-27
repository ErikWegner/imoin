<template>
  <div>
    <span class="servicename">{{ service.name }}</span>
    <span v-bind:class="['status', service.status]">{{ service.status }}</span>
    <span class="actions" 
        :data-hostname="host.name"
        :data-instanceindex="host.instanceindex"
        :data-servicename="service.name"
        >
        <span title="Recheck" class="recheck" v-on:click="recheck" data-command="recheck"/>
      </span>
      <span class="info">{{ service.checkresult }}</span>
  </div>
</template>

<script>
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
    service: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.servicename {
    font-size: 120%;
}

.status {
    float: right;
    width: 6em;
    text-align: center;
    margin-top: 0.5ex;
}

.status.OK {
    background-color: #3f3;
}

.status.WARNING {
    background-color: #fffb00;
}

.status.CRITICAL {
    background-color: #f33;
}

.status.UNKNOWN {
    background-color: #d88b18;
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
    background: url('/icons/rck.png');
    cursor: pointer;
}

.service .info {
    color: #888;
    padding-left: 1ex;
}
</style>
