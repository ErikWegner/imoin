<template>
  <div>
    <div class="flex filterselection">
      <input type="radio" class="cb" value="r1" name="filter" id="filter0" checked/>
      <label for="filter0" v-on:click="switchlist('shortlist')" class="w-50 pa3 tc dim">Errors/Warnings</label>
      <input type="radio" class="cb" value="r2" name="filter" id="filter1"/>
      <label for="filter1" v-on:click="switchlist('hosts')" class="w-50 pa3 tc dim">All Hosts</label>
      <input type="radio" class="cb" value="r3" name="filter" id="filter2"/>
      <label for="filter2" v-on:click="switchlist('services')" class="w-50 pa3 tc dim">All Services</label>
      <input type="radio" class="cb" value="i" name="filter" id="instances"/>
      <label for="instances" v-on:click="switchlist('instances')" class="w-50 pa3 tc dim" v-if="hasInstances">Instances</label>
    </div>
    <host-list :paneldata="paneldata" :listtype="'shortlist'" class="classiclist" id="shortlist"></host-list>
    <host-list :paneldata="paneldata" :listtype="'hosts'" class="dn classiclist" id="hosts"></host-list>
    <host-list :paneldata="paneldata" :listtype="'services'" class="dn classiclist" id="services"></host-list>
    <instances-list :paneldata="paneldata" class="dn classiclist" id="instances"></instances-list>
  </div>
</template>

<script>
import HostList from './hostlist.vue';
import InstancesList from './instances.vue';

export default {
  data() {
    return {
      listtype: 'shortlist',
      activeList: ''
    }
  },
  methods: {
    switchlist: function(listtype) {
      const lists = document.getElementsByClassName("classiclist");
      Array.prototype.forEach.call(lists, (list) => {
        const id = list.getAttribute('id');
        list.setAttribute('class', 'classiclist' + (id === listtype ? '' : ' dn'))
      });
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
