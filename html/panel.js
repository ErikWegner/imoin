'use strict';
const log = (...args) => {
  console.log(...args);
};

let postPanelMessagePort = null;
const postPanelMessage = (data) => {
  if (postPanelMessagePort) {
    log('postPanelMessage', data);
    postPanelMessagePort.postMessage(data);
  }
};

const initEnvironment = () => {
  // Web extension in Chrome or Firefox
  const host = chrome || browser;
  // Edge browser
  // if (typeof browser !== 'undefined' && browser.runtime !== null) {
  //   return browser;
  // }

  postPanelMessagePort = host.runtime.connect();
  postPanelMessagePort.onMessage.addListener((message) => {
    log('Received message from background script:', message);
    if (message.command === 'UpdatePanelData') {
      fullUpdatePanelContent();
    }
  });
  return host;
};

const outputParent = document.querySelector('#panel');
const outputTemplate = (template) => {
  // remove existing content
  outputParent.innerHTML = '';
  outputParent.appendChild(template);
};

/* render utility functions */
const AddCellToTr = (tr, text, tdclass) => {
  var td = document.createElement('td');
  td.appendChild(document.createTextNode(text));
  if (tdclass !== null && tdclass !== '') td.className = tdclass;
  tr.appendChild(td);
  return tr;
};

function AddInput(parent, value, id, labeltext) {
  var input = document.createElement('input');
  parent.appendChild(input);
  input.setAttribute('type', 'radio');
  input.setAttribute('class', 'cb');
  input.setAttribute('value', value);
  input.setAttribute('name', 'filter');
  input.setAttribute('id', id);

  var label = document.createElement('label');
  parent.appendChild(label);
  label.setAttribute('for', id);
  label.appendChild(document.createTextNode(labeltext));
  return input;
}

const registerMainEventHandlers = () => {
  // TODO: copy implementation
};

const showAndUpdatePanelContent = (data) => {
  const message = data.message;
  log('Rendering main template');
  let rendered_template = renderMainTemplate(data);
  if (message) {
    log('Message ' + message);
    rendered_template.unshift(renderTemplateError(message));
  }

  log('Render prep done');
  log('Removing');
  while (document.body.childNodes.length > 0) {
    document.body.removeChild(
      document.body.childNodes[document.body.childNodes.length - 1],
    );
  }
  log('Adding');
  if (rendered_template.length > 0) {
    for (let i in rendered_template) {
      document.body.appendChild(rendered_template[i]);
    }
  } else {
    document.body.appendChild(rendered_template);
  }
  log('Done');

  registerMainEventHandlers();
};

/* render login */
const renderUnconfiguredInstances = () => {
  const template = document.querySelector('#unconfigured-template');
  const renderedTemplate = template.content.cloneNode(true);
  outputTemplate(renderedTemplate);
  outputParent
    .querySelector('button')
    .addEventListener('click', openConfiguration);
};

const renderMainTemplate = (statusdata) => {
  // render three lists
  // list 1: show a host, if any of its services is not ok, show service if it is not ok
  // list 2: show all hosts, show service if it is not ok
  // list 3: show all hosts, show all services

  // top table and hosts list
  var r = document.createElement('div');
  r.setAttribute('class', 'header');
  r.setAttribute('style', 'text-align:center');

  var p, a, div1, table, tr, th, td, img;
  r.appendChild((p = document.createElement('p')));
  p.appendChild((a = document.createElement('span')));
  a.setAttribute('class', 'refresh');
  a.appendChild(document.createTextNode('↺ Refresh'));
  p.appendChild(document.createTextNode(' '));
  p.appendChild((a = document.createElement('span')));
  a.setAttribute('class', 'options');
  a.appendChild((img = document.createElement('img')));
  img.setAttribute('style', 'width: auto; height: 14px;');
  img.setAttribute('src', './gear.svg');
  img.setAttribute('title', 'Options');
  if (statusdata.hostgroupinfo !== null && statusdata.hostgroupinfo !== '')
    p.appendChild(document.createTextNode(' ' + statusdata.hostgroupinfo));

  r.appendChild((div1 = document.createElement('div')));

  div1.appendChild((table = document.createElement('table')));
  table.setAttribute('class', 'main');
  table.setAttribute('cellspacing', '0');
  table.setAttribute(
    'style',
    'vertical-align:top; display: inline-block; margin-right: 1em',
  );

  table.appendChild((tr = document.createElement('tr')));
  tr.appendChild((th = document.createElement('th')));
  th.appendChild(document.createTextNode('Service status'));
  th.setAttribute('colspan', '2');

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'OK';
  AddCellToTr(tr, 'Ok');
  AddCellToTr(
    tr,
    statusdata.filteredServiceok + '/' + statusdata.totalservices,
    'num',
  );

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'WARN';
  AddCellToTr(tr, 'Warn');
  AddCellToTr(
    tr,
    statusdata.filteredServicewarnings + '/' + statusdata.totalservices,
    'num',
  );

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'CRIT';
  AddCellToTr(tr, 'Crit');
  AddCellToTr(
    tr,
    statusdata.filteredServiceerrors + '/' + statusdata.totalservices,
    'num',
  );

  div1.appendChild((table = document.createElement('table')));
  table.setAttribute('class', 'main');
  table.setAttribute('cellspacing', '0');
  table.setAttribute('style', 'display: inline-block');

  table.appendChild((tr = document.createElement('tr')));
  tr.appendChild((th = document.createElement('th')));
  th.appendChild(document.createTextNode('Host status'));
  th.setAttribute('colspan', '2');

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'UP';
  AddCellToTr(tr, 'Up');
  AddCellToTr(
    tr,
    statusdata.filteredHostup + '/' + statusdata.totalhosts,
    'num',
  );

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'DOWN';
  AddCellToTr(tr, 'Down');
  AddCellToTr(
    tr,
    statusdata.filteredHosterrors + '/' + statusdata.totalhosts,
    'num',
  );

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'space';
  tr.appendChild((td = document.createElement('td')));
  td.setAttribute('colspan', '2');

  table.appendChild((tr = document.createElement('tr')));
  tr.className = 'updatetime';
  tr.appendChild((td = document.createElement('td')));
  td.setAttribute('colspan', '2');
  td.appendChild(document.createTextNode(statusdata.updatetime));

  // buttons to switch between lists
  r.appendChild((div1 = document.createElement('div')));
  AddInput(div1, 'filter0', 'r1', 'Errors/Warnings').setAttribute(
    'checked',
    'checked',
  );
  AddInput(div1, 'filter1', 'r2', 'All Hosts');
  AddInput(div1, 'filter2', 'r3', 'All Services');

  if (statusdata.instances && Object.keys(statusdata.instances).length > 1) {
    AddInput(div1, 'instances', 'i', 'Instances');
  }

  div1 = document.createElement('div');
  div1.setAttribute('class', 'content');
  div1.id = 'details';
  // div1.appendChild(html1); // TODO: reactivate when available

  return [r, div1];
};

const fullUpdatePanelContent = () => {
  host.storage.sync.get({ instances: [] }, (syncData) => {
    const instances = syncData.instances;
    if (instances.length === 0) {
      renderUnconfiguredInstances();
      return;
    }

    chrome.storage.local.get({ instancesData: {} }, (localData) => {
      // TODO: Implement logic to update panel content based on retrieved data from Nagios instances
      log('Updating panel content with data:', localData);
      showAndUpdatePanelContent(localData);
    });
  });
};

const openConfiguration = () => {
  log('opening configuration');
  postPanelMessage({ command: 'open_configuration' });
};

const host = initEnvironment();
fullUpdatePanelContent();
