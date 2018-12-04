export function service(servicedata, chkimg) {
  const statusClass = "status " + servicedata.status;
  /* TODO:
    if (servicedata.servicelink) {
        span.setAttribute("data-url", servicedata.servicelink);
      }
  */
  return (
<div class="service">
  <span class="servicename" data-url={servicedata.servicelink}>servicedata.name</span>
  <span class={statusClass}>{servicedata.status}</span>
  <span 
    class="actions"
    data-hostname={servicedata.host.name}
    data-instanceindex={servicedata.host.instanceindex}
    data-servicename={servicedata.name}
  >{chkimg.cloneNode(true)}</span>
  <div class="info">servicedata.checkresult</div>
</div>
  );
}