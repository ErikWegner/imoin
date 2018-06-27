<template>
<div>
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

<style scoped>
div {
  text-align: center;
}
.main th {
    font-size: 110%;
}

.main td {
    font-size: 100%;
    color: black;
    text-shadow: white 1px 1px 1px;
}

.main th {
    color: black;
    background-color: #bbb;
    text-shadow: white 1px 1px 1px;
}

.main .OK, .main .UP {
    background-color: #3f3;
}

.main .CRIT, .main .DOWN {
    background-color: #f33;
}

.main .WARN {
    background-color: #ffa500;
}

.main .num {
    text-align: right;
}

.main .updatetime {
    font-size: 75%;
    text-align: center;
}

.main .space {
    height: 1ex;
}
</style>
