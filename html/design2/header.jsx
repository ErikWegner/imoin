export function header(statusdata) {
  const instancesswitch = [];
  if (statusdata.instances && Object.keys(statusdata.instances).length > 1) {
    instancesswitch.push(<input type="radio" class="cb" value="instances" name="filter" id="i"/>);
    instancesswitch.push(<label for="i">Instances</label>);
  }
  return (
<div class="header" style="text-align:center">
  <p>
    <span class="refresh">↺ Refresh</span>
    <span class="options"><img style="width:auto;height:14px;" src="./gear.svg" title="Options"/></span>
  </p>
  <div>
    <table class="main" cellspacing="0" style="vertical-align:top; display: inline-block; margin-right: 1em">
      <tr>
        <th colspan="2">Service status</th>
      </tr>
      <tr class="OK">
        <td>Ok</td>
        <td class="num">{statusdata.filteredServiceok}/{statusdata.totalservices}</td>
      </tr>
      <tr class="WARN">
        <td>Warn</td>
        <td class="num">{statusdata.filteredServicewarnings}/{statusdata.totalservices}</td>
      </tr>
      <tr class="CRIT">
        <td>Crit</td>
        <td class="num">{statusdata.filteredServiceerrors}/{statusdata.totalservices}</td>
      </tr>
    </table>
    <table class="main" cellspacing="0" style="vertical-align:top; display: inline-block; margin-right: 1em">
      <tr>
        <th colspan="2">Host status</th>
      </tr>
      <tr class="UP">
        <td>Up</td>
        <td class="num">{statusdata.filteredHostup}/{statusdata.totalhosts}</td>
      </tr>
      <tr class="DOWN">
        <td>Down</td>
        <td class="num">{statusdata.filteredServicewarnings}/{statusdata.totalhosts}</td>
      </tr>
      <tr class="space">
        <td colspan="2"></td>
      </tr>
      <tr class="updatetime">
        <td colspan="2">{statusdata.updatetime}</td>
      </tr>
    </table>
  </div>
  <div>
    <input type="radio" class="cb" value="filter0" name="filter" id="r1" checked="checked"/>
    <label for="r1">Errors/Warnings</label>
    <input type="radio" class="cb" value="filter1" name="filter" id="r2"/>
    <label for="r2">All Hosts</label>
    <input type="radio" class="cb" value="filter2" name="filter" id="r3"/>
    <label for="r3">All Services</label>
    {instancesswitch}
  </div>
</div>
    );
}
