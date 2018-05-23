import Vue from 'vue'
//import App from './App.vue'
import Basic from './designs/basic/imoin-root.vue'
import MJTable from './designs/mjtable/imoin-root.vue'

window.panelapp = new Vue({
  el: '#app',
  data: {
    paneldata: {},
    design: 2
  },
  render: function(createElement) {
    const target = this.$data.design == 1 ? Basic : MJTable
    return createElement(target, {props:{paneldata: this.$data.paneldata}});
  }
})
