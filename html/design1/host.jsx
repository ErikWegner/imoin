export function hosttemplate(hostdata, chkimg) {
  const statusClass = "status " + hostdata.status;
  /* TODO:
    if (hostdata.hostlink) {
        span.setAttribute("data-url", hostdata.hostlink);
    }
  */
  return (
<div class="host">
  <div>
    <span class="hostname">{hostdata.name}</span>
    <span class={statusClass}>{hostdata.status}</span>
    <span 
      class="actions"
      data-hostname={hostdata.name}
      data-instanceindex={hostdata.instanceindex}
    >{chkimg.cloneNode(true)}</span>
    <div class="hostcheckinfo">hostdata.checkresult</div>
  </div>
  <div class="services">{hostdata.servicesdata}</div>
</div>
  );
}