<template>
  <div>
    {{paneldata.instanceLabel}} ({{paneldata.updatetime}}) - 
  Host Status - 
  <span class="status-UP" v-if="paneldata.hostup > '0'">UP:{{paneldata.hostup}}</span>
  <span class="status-DOWN" v-if="paneldata.hostdown > '0'">DOWN:{{paneldata.hostdown}}</span> 
  <span class="status-UNREACHABLE" v-if="paneldata.hostunreachable > '0'">UNREACHABLE:{{paneldata.hostunreachable}}</span>  
  
  Service Status - 
  <span class="status-OK" v-if="paneldata.serviceok > '0'">OK:{{paneldata.serviceok}}</span>
  <span class="status-WARNING" v-if="paneldata.servicewarning > '0'">WARNING:{{paneldata.servicewarning}}</span> 
  <span class="status-CRITICAL" v-if="paneldata.servicecritical > '0'">CRITICAL:{{paneldata.servicecritical}}</span>
  <div class="servicetable">
    <div class="oneitem">
    <host-item
      v-for="host in paneldata.hosts"
      :key="host.name"
      :host="host">
    </host-item>
    </div>
    <problem-services-item
      v-for="host in paneldata.hosts"
      :key="host.name"
      :host="host">
    </problem-services-item>
  </div>
  </div>
</template>

<script>
import HostItem from "./host-item.vue";
import ProblemServicesItem from './problem-services.vue';

export default {
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
  components: {
    HostItem,
    ProblemServicesItem,
  }
};
</script>
