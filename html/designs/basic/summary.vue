<template>
<div class="tc">
  <table class="main" style="vertical-align:top; display: inline-block; margin-right: 1em" cellspacing="0">
    <tr>
      <th colspan="2">Service status</th>
    </tr>
    <tr class="OK"><td>Ok</td><td class="num">{{ paneldata.filteredServiceok }}/{{ paneldata.totalservices }}</td></tr>
    <tr class="WARN"><td>Warn</td><td class="num">{{ paneldata.filteredServicewarnings }}/{{ paneldata.totalservices }}</td></tr>
    <tr class="CRIT"><td>Crit</td><td class="num">{{ paneldata.filteredServiceerrors }}/{{ paneldata.totalservices }}</td></tr>
  </table>
  <table class="main" style="display: inline-block" cellspacing="0">
    <tr><th colspan="2">Host status</th></tr>
    <tr class="UP"><td>Up</td><td class="num">{{ paneldata.filteredHostup }}/{{ paneldata.totalhosts }}</td></tr>
    <tr class="DOWN"><td>Down</td><td class="num">{{ paneldata.filteredHosterrors }}/{{ paneldata.totalhosts }}</td></tr>
    <tr class="space"><td colspan="2"></td></tr>
    <tr class="updatetime"><td colspan="2">{{ paneldata.updatetime }}</td></tr></table>
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
