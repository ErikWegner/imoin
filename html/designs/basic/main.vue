<template>
  <div>
    <div class="flex filterselection">
      <input type="radio" class="cb" value="r1" name="filter" id="filter0" checked/>
      <label for="filter0" v-on:click="activeList = 'r1'" class="w-50 pa3 tc dim">Errors/Warnings</label>
      <input type="radio" class="cb" value="r2" name="filter" id="filter1"/>
      <label for="filter1" v-on:click="activeList = 'r2'" class="w-50 pa3 tc dim">All Hosts</label>
      <input type="radio" class="cb" value="r3" name="filter" id="filter2"/>
      <label for="filter2" v-on:click="activeList = 'r3'" class="w-50 pa3 tc dim">All Services</label>
      <input type="radio" class="cb" value="i" name="filter" id="instances"/>
      <label for="instances" v-on:click="activeList = 'i'" class="w-50 pa3 tc dim" v-if="hasInstances">Instances</label>
    </div>
    <host-list :paneldata="paneldata" :listtype="'shortlist'" v-show="activeList == 'r1'"></host-list>
    <host-list :paneldata="paneldata" :listtype="'hosts'" v-show="activeList == 'r2'"></host-list>
    <host-list :paneldata="paneldata" :listtype="'services'" v-show="activeList == 'r3'"></host-list>
    <instances-list :paneldata="paneldata" v-show="activeList == 'i'"></instances-list>
  </div>
</template>

<script>
import HostList from './hostlist.vue';
import InstancesList from './instances.vue';

export default {
  data() {
    return {
      activeList: 'r1'
    }
  },
  props: {
    paneldata: {
      type: Object,
      required: true
    }
  },
  components: {
    HostList,
    InstancesList,
  },
  computed: {
    hasInstances: function() {
      return (
        this.paneldata && 
        this.paneldata.instances && 
        Object.keys(this.paneldata.instances).length > 1);
    }
  }
};
</script>
