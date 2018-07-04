var hosttype = (typeof(chrome) !== "undefined" && chrome) ? 'chrome' : (typeof(browser) !== "undefined" && browser) ? 'browser' : 'na';
var host = (typeof(chrome) !== "undefined" && chrome) || (typeof(browser) !== "undefined" && browser);
// Edge browser
if (typeof browser !== "undefined" && browser.runtime !== null) {
  host = browser;
}

/*    ---- Global variables ---- */

let instances = [];
let selectedInstance = -1;
let fontsize = 100;
let paneldesign = 1;

const filterSettingsNames = [
  'filterOutAcknowledged',
  'filterOutSoftStates',
  'filterOutDisabledNotifications',
  'filterOutDisabledChecks',
  'filterServicesOnDownHosts',
];

/*    ---- Custom elements   ---- */

// Create a class for the element
class SoundFileSelector extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    var shadow = this.attachShadow({ mode: 'open' });

    // Create spans
    var wrapper = document.createElement('span');
    wrapper.setAttribute('class', 'wrapper');
    var icon = document.createElement('span');
    icon.setAttribute('class', 'icon');
    icon.setAttribute('tabindex', 0);
    var info = document.createElement('span');
    info.setAttribute('class', 'info');

    // Take attribute content and put it inside the info span
    var text = this.getAttribute('text');
    info.textContent = text;

    // Insert icon
    var imgUrl;
    if (this.hasAttribute('img')) {
      imgUrl = this.getAttribute('img');
    } else {
      imgUrl = 'img/default.png';
    }
    var img = document.createElement('img');
    img.src = imgUrl;
    icon.appendChild(img);

    // attach the created elements to the shadow dom

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(icon);
    wrapper.appendChild(info);
  }
}

/*    ---- Library functions ---- */

function createInstance(title) {
  return {
    instancelabel: title,
    timerPeriod: 5,
    icingaversion: 'cgi',
    url: '',
    username: '',
    password: '',
  }
}

function restoreOptions() {
  function onError(error) {
    console.log(`Error: ${error}`);
  }

  return loadOptions().then((storageData) => {
    if (!storageData) {
      storageData = {};
    }
    instances = JSON.parse(storageData.instances || '[]');
    if (instances.length === 0) {
      instances.push(createInstance('Default'));
    }
    selectedInstance = 0;
    fontsize = storageData.fontsize || fontsize;
    paneldesign = storageData.paneldesign || 1;
    updateDOMforInstances();
    updateDOMforPanelFieldset();
    updateDOMforFilters();
    SoundFileSelectors.setFiles(JSON.parse(storageData.sounds || '{}'));
  }, onError);
}

function addInstance() {
  const i = createInstance('Instance ' + instances.length);
  instances.push(i);
  selectedInstance = instances.length - 1;
  updateDOMforInstances();
}

function updateInstance() {
  const i = instances[selectedInstance];
  i.instancelabel = getFormTextValue('#instancelabel', 'Instance' + (selectedInstance + 1));
  i.timerPeriod = parseInt(getFormTextValue('#timerPeriod', '5'));
  i.icingaversion = getFormTextValue('#icingaversion', 'cgi');
  i.url = getFormTextValue('#url', '');
  i.username = getFormTextValue('#username', '');
  i.password = getFormTextValue('#password', '');
}

function updateSettings() {
  updateInstance();
  saveOptions();
  updateDOMforInstances();
}
function removeInstance() {
  if (instances.length < 2) {
    return;
  }

  instances.splice(selectedInstance, 1);
  if (selectedInstance >= instances.length) {
    selectedInstance = instances.length - 1;
  }
  updateDOMforInstances();
}

function selectionChanged(e) {
  updateInstance();
  const index = parseInt(e.target.value);
  if (index >= 0 && index < instances.length) {
    selectedInstance = index;
  }

  updateDOMforInstances();
}

/*    ---- Browser functions ---- */

function updateDOMforInstances() {
  if (selectedInstance >= instances.length) {
    return;
  }

  let instanceData = instances[selectedInstance];
  if (!instanceData) {
    instanceData = createInstance('Default');
  }

  document.querySelector('#instancelabel').value = instanceData.instancelabel || 'Default';
  document.querySelector('#timerPeriod').value = instanceData.timerPeriod || '5';
  document.querySelector('#icingaversion').value = instanceData.icingaversion || 'cgi';
  document.querySelector('#url').value = instanceData.url || '';
  document.querySelector('#username').value = instanceData.username || '';
  document.querySelector('#password').value = instanceData.password || '';

  const i = document.getElementById('instanceid');
  i.options.length = 0;
  instances
    .map((instance, index) => new Option(instance.instancelabel, index))
    .forEach((option) => i.options.add(option));
  i.options.selectedIndex = selectedInstance;
}

function updateDOMforPanelFieldset() {
  document.getElementById('fontsize').value = fontsize;
  document.getElementById('paneldesign' + paneldesign).checked = true
}

function updateDOMforFilters() {
  const filtersettings = (instances[0] || {}).filtersettings || {};
  filterSettingsNames.forEach((settingname) => {
    setCheckboxValue('#' + settingname, filtersettings[settingname]);
  });
}

function addClickHandler(selector, handler) {
  element = document.querySelector(selector);
  if (!element || !element.addEventListener) {
    return
  }

  element.addEventListener('click', handler);
}

function getFormTextValue(selector, defaultValue) {
  return document.querySelector(selector).value || defaultValue;
}

function setCheckboxValue(selector, checked) {
  const cb = document.querySelector(selector);
  if (cb) {
    cb.checked = checked;
  }
}

function getCheckboxValue(selector, defaultValue) {
  const cb = document.querySelector(selector);
  if (cb) {
    return cb.checked ? 1 : 0;
  }

  return defaultValue;
}

function collectFilterSettings() {
  const r = {};
  filterSettingsNames.forEach((settingname) => {
    r[settingname] = getCheckboxValue('#' + settingname, 0) === 1;
  });
  return r;
}

function saveOptions() {
  const filtersettings = collectFilterSettings();
  instances.forEach((instance) => instance.filtersettings = filtersettings);
  // storage does not save objects as values
  host.storage.local.set({
    instances: JSON.stringify(instances),
    fontsize: parseInt(document.getElementById('fontsize').value),
    paneldesign: document.querySelector('input[name = "paneldesign"]:checked').value,
    sounds: JSON.stringify(SoundFileSelectors.getFiles())
  });
  var myPort = host.runtime.connect({ name: 'port-from-options' });
  myPort.postMessage({ command: 'SettingsChanged' });
  myPort.disconnect();
}

function loadOptions() {
  const optionKeys = ['instances', 'fontsize', 'sounds', 'paneldesign'];
  return new Promise((resolve, reject) => {
    if (!host.storage) {
      resolve(null);
      return;
    }
    /* Change the array of keys to match the firefox.ts */
    if (hosttype == 'browser') {
      return host.storage.local.get(optionKeys);
    } else if (hosttype == 'chrome') {
      host.storage.local.get(optionKeys, resolve);
    }
  }
  );
}

function addDropdownEventHandler(callback) {
  const ddl = document.querySelector('#instanceid');
  if (!ddl) { return; }

  ddl.addEventListener('change', callback);
}

/*    ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', restoreOptions);
addClickHandler('#addInstance', addInstance);
addClickHandler('#updateSettings', updateSettings);
addClickHandler('#removeInstance', removeInstance);
addDropdownEventHandler(selectionChanged);
