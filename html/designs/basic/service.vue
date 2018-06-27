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
