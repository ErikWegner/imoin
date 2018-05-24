<template>
  <div>
    <div v-for="(instance, instanceindex) in paneldata.instances"
      :key="instanceindex"
      class="instance"
      >
      <span class="instancename">{{instance.instancelabel}}</span>
      <span class="instanceupdatetime">{{instance.updatetime}}</span>
      <span class="actions" :data-instanceindex="instanceindex"><span class="refresh">↺</span></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
}
</script>

<style scoped>
.instance {
    padding: 0.5ex;
}
.instancename {
    font-size: 160%;
}
.instance:hover {
    background-color: #eef;
    border-radius: 1ex;
}
.instanceupdatetime {
    float: right;
    margin-top: 0.5ex;    
}
.actions {
    float: right;
    width: 6em;
    text-align: right;
    margin-top: 0.5ex;
    padding-right: 1ex;
}

.refresh {
    cursor: pointer;
}
</style>
