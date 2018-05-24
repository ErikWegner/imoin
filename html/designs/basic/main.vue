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

<style scoped>
/*
  Hide radio button (the round disc)
  we will use just the label to create pushbutton effect
*/
input[type=radio] {
    display: none;
    margin: 10px;
}

/*
  Change the look'n'feel of labels (which are adjacent to radiobuttons).
  Add some margin, padding to label
*/
input[type=radio] + label {
    display: table-cell;
    margin: -2px;
    padding: 1ex 2em;
    background-color: #e7e7e7;
    border-color: #ddd;
    cursor: pointer;
}

/*
 Change background color for label next to checked radio button
 to make it look like highlighted button
*/
input[type=radio]:checked + label {
    background-image: none;
    background-color: #a0a0a0;
}
/*
.filterselection:before, .filterselection:after {
    content: " ";
    display: table;
}

.filterselection:after {
    clear: both;
}

.filterselection {
    *zoom: 1;
    display: table;
    
}

.filterselection label {
text-align: center;
}*/
</style>
