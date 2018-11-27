export function instanceslist(statusdata) {
  const rows = [];
  if (statusdata.instances) {
    Object.keys(statusdata.instances).forEach((key) => {
      const instance = statusdata.instances[key];
      rows.push(
      <div class="instance">
        <span class="instancename">{instance.instancelabel}</span>
        <span class="instanceupdatetime">{instance.updatetime}</span>
        <span class="actions" data-instanceindex={key}>
          <span class="refresh">↺</span>
        </span>
      </div>
      );
    });
  }
  return (
<div>
  <div>
{rows}
  </div>
</div>
  )
}