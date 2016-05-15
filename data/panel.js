var panelcontentstatus = {
  needs_processing: 0,
  error: 1,
  data: 2,
  empty: 3,
  template_rendered: 4
}

var panelcontent = panelcontentstatus.processing

// store the incoming data object for later processing
var statusdata = null;

// store a rendered template for later display
var rendered_template = document.createTextNode("");

var filtered_lists_templates = {};

var isShowing = false;

self.port.on("hide", function () {
  isShowing = false;
});

self.port.on("show", function () {
  //    console.log("panel show: " + panelcontent);
  isShowing = true;
  showAndUpdatePanelContent();
});

function showAndUpdatePanelContent() {
  switch (panelcontent) {
    case panelcontentstatus.needs_processing:
      rendered_template = renderMainTemplate();
      break;

    case panelcontentstatus.empty:
      rendered_template = renderTemplateError({ message: "No data yet" });
      break;

    case panelcontentstatus.error:
      rendered_template = renderTemplateError(statusdata);
      break;
  }

  if (panelcontent == panelcontentstatus.template_rendered) {
    while (document.body.childNodes.length > 0) {
      document.body.removeChild(document.body.childNodes[document.body.childNodes.length - 1]);
    }
    if (rendered_template.length > 0) {
      for (var i in rendered_template) {
        document.body.appendChild(rendered_template[i]);
      }
    } else {
      document.body.appendChild(rendered_template);
    }
    registerMainEventHandlers();
  }
}

function renderTemplateError(statusdata) {
  var r = document.createElement("div");
  r.setAttribute("style", "text-align:center");
  var img = document.createElement("img");
  img.setAttribute("src", "icon-64.png");
  img.setAttribute("alt", "Icinga logo");
  r.appendChild(img);
  r.appendChild(document.createElement("br"));
  var p = document.createElement("p");
  p.setAttribute("class", "errormessag");
  r.appendChild(p);
  p.appendChild(document.createTextNode(statusdata.message));

  var a = document.createElement("a");
  a.setAttribute("class", "refresh");
  a.setAttribute("href", "javascript:void(0);");
  a.appendChild(document.createTextNode("↺ Refresh"));
  p = document.createElement("p");
  p.appendChild(a);
  r.appendChild(p);

  panelcontent = panelcontentstatus.template_rendered;
  return r;
}

function renderHostTemplate(hostdata) {
  var div2, span;
  var r = document.createElement("div");
  r.setAttribute("class", "host");

  r.appendChild(div2 = document.createElement("div"));
  div2.appendChild(span = document.createElement("span"));
  span.setAttribute("class", "hostname");
  span.setAttribute("data-url", hostdata.hostlink);
  span.appendChild(document.createTextNode(hostdata.hostname));

  div2.appendChild(span = document.createElement("span"));
  span.setAttribute("class", "status " + hostdata.status);
  span.appendChild(document.createTextNode(hostdata.status));

  div2.appendChild(span = document.createElement("span"));
  span.setAttribute("class", "actions");
  span.setAttribute("data-hostname", hostdata.hostname);
  span.appendChild(ackimg.cloneNode(true));
  span.appendChild(document.createTextNode(" "));
  span.appendChild(chkimg.cloneNode(true));

  div2.appendChild(span = document.createElement("span"));
  span.setAttribute("class", "hostcheckinfo");
  span.appendChild(document.createTextNode(hostdata.information));

  r.appendChild(div2 = document.createElement("div"));
  div2.setAttribute("class", "services");

  for (var i in hostdata.servicesdata) {
    div2.appendChild(hostdata.servicesdata[i]);
  }

  return r;
}

function renderServiceTemplate(servicedata) {
  var r = document.createElement("div");
  r.setAttribute("class", "service");
  var span;

  span = document.createElement("span");
  span.setAttribute("class", "servicename");
  span.setAttribute("data-url", servicedata.servicelink);
  span.appendChild(document.createTextNode(servicedata.service_description));
  r.appendChild(span);

  span = document.createElement("span");
  span.setAttribute("class", "status " + servicedata.status);
  span.appendChild(document.createTextNode(servicedata.status));
  r.appendChild(span);

  span = document.createElement("span");
  span.setAttribute("class", "actions");
  span.setAttribute("data-hostname", servicedata.host_name);
  span.setAttribute("data-servicename", servicedata.service_description);
  span.appendChild(ackimg.cloneNode(true));
  span.appendChild(document.createTextNode(" "));
  span.appendChild(chkimg.cloneNode(true));
  r.appendChild(span);

  var divc = document.createElement("div");
  divc.setAttribute("class", "info");
  divc.appendChild(document.createTextNode(servicedata.status_information));
  r.appendChild(divc);

  return r;
}

var chkimg = document.createElement("img");
chkimg.setAttribute("src", "rck.png");
chkimg.setAttribute("style", "width:14px;height:14px");
chkimg.setAttribute("title", "Recheck");
chkimg.setAttribute("class", "recheck");
chkimg.setAttribute("data-command", "recheck");
chkimg.setAttribute("alt", "Recheck");

var ackimg = document.createElement("img");
ackimg.setAttribute("src", "ack.png");
ackimg.setAttribute("style", "width:14px;height:14px");
ackimg.setAttribute("title", "Acknowledge");
ackimg.setAttribute("class", "ack");
ackimg.setAttribute("data-command", "ack");
ackimg.setAttribute("alt", "Acknowledge");


// switch between the filtered details lists
function listswitch(e) {
  if (e == null || e.target == null) return;
  var filtervalue = e.target.getAttribute("value");
  var details_el = document.getElementById("details");
  if (details_el && filtervalue in filtered_lists_templates) {
    details_el.replaceChild(filtered_lists_templates[filtervalue], details_el.childNodes[0]);
    registerDetailsEventHandlers();
  }
}

function registerEventHanderForClass(handler, classname) {
  var elements = document.getElementsByClassName(classname);
  Array.prototype.forEach.call(elements, function (element) {
    element.addEventListener("click", handler);
  });
}

function registerMainEventHandlers() {
  var cbnames = ["r1", "r2", "r3"];
  for (var cbname_index in cbnames) {
    var el = document.getElementById(cbnames[cbname_index]);
    if (el) {
      el.addEventListener("click", listswitch);
    }
  }

  registerEventHanderForClass(triggerRefresh, 'refresh');
  registerDetailsEventHandlers();
}

function registerDetailsEventHandlers() {
  registerEventHanderForClass(triggerOpenPage, 'hostname');
  registerEventHanderForClass(triggerOpenPage, 'servicename');
  registerEventHanderForClass(triggerCmdExec, 'recheck');
  registerEventHanderForClass(triggerCmdExec, 'ack');
}

function renderMainTemplate()  {
  // render three lists
  // list 1: show a host, if any of its services is not ok, show service if it is not ok
  // list 2: show all hosts, show service if it is not ok
  // list 3: show all hosts, show all services
    
  var html1 = document.createElement("div"), html2 = document.createElement("div"), html3 = document.createElement("div");
  var hostdetail;

  for (var hostindex in statusdata.details) {
    hostdetail = statusdata.details[hostindex];

    var show_host_in_list1 = hostdetail.status !== "UP";
    var all_serviceshtml = [];
    var not_ok_serviceshtml = [];
    var renderbuffer;
        
    // output the details for a host
    hostdetail.acknowledged = hostdetail.has_been_acknowledged === true ? "A" : "";

    for (var serviceindex in hostdetail.services) {
      var servicedetail = hostdetail.services[serviceindex];
      servicedetail.host = hostdetail;
      servicedetail.acknowledged = servicedetail.has_been_acknowledged === true ? "A" : "";

      renderbuffer = renderServiceTemplate(servicedetail);

      all_serviceshtml.push(renderbuffer.cloneNode(true));

      if (servicedetail.status !== "OK") {
        show_host_in_list1 = true;
        not_ok_serviceshtml.push(renderbuffer.cloneNode(true));
      }
    }

    hostdetail.servicesdata = not_ok_serviceshtml;
    renderbuffer = renderHostTemplate(hostdetail);
        
    // list 1
    if (show_host_in_list1) {
      html1.appendChild(renderbuffer.cloneNode(true));
    }
        
    // list 2
    html2.appendChild(renderbuffer);
        
    // list 3
    hostdetail.servicesdata = all_serviceshtml;
    html3.appendChild(renderHostTemplate(hostdetail));
  }

  panelcontent = panelcontentstatus.template_rendered;

  filtered_lists_templates = {
    filter0: html1,
    filter1: html2,
    filter2: html3
  };
    
  
  // top table and hosts list
  var r = document.createElement("div");
  r.setAttribute("class", "header");
  r.setAttribute("style", "text-align:center");

  var p, a, div1, table, tr, th, td;
  r.appendChild(p = document.createElement("p"));
  p.appendChild(a = document.createElement("a"));
  a.setAttribute("class", "refresh");
  a.setAttribute("href", "javascript:void(0);");
  a.appendChild(document.createTextNode("↺ Refresh"));
  if (statusdata.hostgroupinfo !== null && statusdata.hostgroupinfo !== "") p.appendChild(document.createTextNode(" " + statusdata.hostgroupinfo));

  r.appendChild(div1 = document.createElement("div"));

  div1.appendChild(table = document.createElement("table"));
  table.setAttribute("class", "main");
  table.setAttribute("cellspacing", "0");
  table.setAttribute("style", "vertical-align:top; display: inline-block; margin-right: 1em");

  table.appendChild(tr = document.createElement("tr"));
  tr.appendChild(th = document.createElement("th"));
  th.appendChild(document.createTextNode("Service status"))
  th.setAttribute("colspan", "2");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "OK";
  AddCellToTr(tr, "Ok");
  AddCellToTr(tr, statusdata.serviceok + "/" + statusdata.totalservices, "num");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "WARN";
  AddCellToTr(tr, "Warn");
  AddCellToTr(tr, statusdata.servicewarnings + "/" + statusdata.totalservices, "num");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "CRIT";
  AddCellToTr(tr, "Crit");
  AddCellToTr(tr, statusdata.serviceerrors + "/" + statusdata.totalservices, "num");

  div1.appendChild(table = document.createElement("table"));
  table.setAttribute("class", "main");
  table.setAttribute("cellspacing", "0");
  table.setAttribute("style", "display: inline-block");

  table.appendChild(tr = document.createElement("tr"));
  tr.appendChild(th = document.createElement("th"));
  th.appendChild(document.createTextNode("Host status"))
  th.setAttribute("colspan", "2");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "UP";
  AddCellToTr(tr, "Up");
  AddCellToTr(tr, statusdata.hostup + "/" + statusdata.totalhosts, "num");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "DOWN";
  AddCellToTr(tr, "Down");
  AddCellToTr(tr, statusdata.hosterrors + "/" + statusdata.totalhosts, "num");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "space";
  tr.appendChild(td = document.createElement("td"));
  td.setAttribute("colspan", "2");

  table.appendChild(tr = document.createElement("tr"));
  tr.className = "updatetime";
  tr.appendChild(td = document.createElement("td"));
  td.setAttribute("colspan", "2");
  td.appendChild(document.createTextNode(statusdata.updatetime));
  
  // buttons to switch between lists
  r.appendChild(div1 = document.createElement("div"));
  AddInput(div1, "filter0", "r1", "Errors/Warnings").setAttribute("checked", "checked");
  AddInput(div1, "filter1", "r2", "All Hosts");
  AddInput(div1, "filter2", "r3", "All Services");

  div1 = document.createElement("div");
  div1.setAttribute("class", "content");
  div1.id = "details";
  div1.appendChild(html1);

  return [r, div1];
}

function AddInput(parent, value, id, labeltext) {
  var input = document.createElement("input");
  parent.appendChild(input);
  input.setAttribute("type", "radio");
  input.setAttribute("class", "cb");
  input.setAttribute("value", value);
  input.setAttribute("name", "filter");
  input.setAttribute("id", id);

  var label = document.createElement("label");
  parent.appendChild(label);
  label.setAttribute("for", id);
  label.appendChild(document.createTextNode(labeltext));
  return input;
}

function AddCellToTr(tr, text, tdclass) {
  var td = document.createElement("td")
  td.appendChild(document.createTextNode(text));
  if (tdclass !== null && tdclass !== "") td.className = tdclass;
  tr.appendChild(td);
  return tr;
}

function renderTemplate(template, data) {
  var result = template;
  if ("object" === typeof (data)) {
    var keys = Object.keys(data);
    for (var key_index in keys) {
      var okey = keys[key_index];
      result = result.replace(new RegExp('{' + okey + '}', "g"), data[okey]);
    }
  }

  panelcontent = panelcontentstatus.template_rendered;
  return result;
}

self.port.on("ProcessStatusUpdate", function (p_status) {
  panelcontent = panelcontentstatus.needs_processing;
  statusdata = p_status;
  if (isShowing) {
    showAndUpdatePanelContent();
  }
});


self.port.on("GenericError", function (message) {
  statusdata = { message: message };
  panelcontent = panelcontentstatus.error;
});

var triggerRefresh = function () {
  self.port.emit("triggerRefresh");
}

var triggerCmdExec = function (e) {
  var el = e.target
  if (el == null) return;

  var command = el.getAttribute("data-command");

  el = el.parentElement;
  if (el == null) return;

  var hostname = el.getAttribute("data-hostname");
  var servicename = el.getAttribute("data-servicename") || "";

  self.port.emit("triggerCmdExec", { hostname: hostname, servicename: servicename, command: command });
}

var triggerOpenPage = function (e) {
  var url = e.target.getAttribute("data-url");
  self.port.emit("triggerOpenPage", url);
}
