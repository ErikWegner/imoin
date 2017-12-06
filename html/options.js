var hosttype = chrome ? 'chrome' : browser ? 'browser' : 'na'
var host = chrome || browser;

/*    ---- Global variables ---- */

let instances = [];
let selectedInstance = -1;

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
    updateDOM();
  }, onError);
}

function addInstance() {
  const i = createInstance('Instance ' + instances.length);
  instances.push(i);
  selectedInstance = instances.length - 1;
  updateDOM();
}

function updateInstance() {
  const i = instances[selectedInstance];
  i.instancelabel = getFormTextValue('#instancelabel', 'Instance' + (selectedInstance + 1));
  i.timerPeriod = parseInt(getFormTextValue('#timerPeriod', '5'));
  i.icingaversion = getFormTextValue('#icingaversion', 'cgi');
  i.url = getFormTextValue('#url', '');
  i.username = getFormTextValue('#username', '');
  i.password = getFormTextValue('#password', '');
  saveOptions();
}

function removeInstance() {
  if (instances.length < 2) {
    return;
  }

  instances.splice(selectedInstance, 1);
  if (selectedInstance >= instances.length) {
    selectedInstance = instances.length - 1;
  }
  updateDOM();
}

/*    ---- Browser functions ---- */

function updateDOM() {
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
  while (i.options.length > instances.length) {
    i.options.remove(i.options.length - 1);
  }
  i.options = instances.map((instance, index) => {
    return new Option(instance.instancelabel, index)
  }).forEach((option, index) => {
    i.options[index] = option;
  })
  i.options.selectedIndex = selectedInstance;
}

function addClickHandler(selector, handler) {
  element = document.querySelector(selector);
  if (!element || !element.addEventListener) {
    return
  }

  element.addEventListener('click', handler);
}

function getFormTextValue(selector, defaultValue) {
  document.querySelector(selector).value || defaultValue;
}

function saveOptions() {
  // storage does not save objects
  host.storage.local.set({
    instances: JSON.stringify(instances)
  });
  var myPort = host.runtime.connect({ name: 'port-from-options' });
  myPort.postMessage({ command: 'SettingsChanged' });
  myPort.disconnect();
}

function loadOptions() {
  return new Promise((resolve, reject) => {
    if (!host.storage) {
      resolve(null);
      return;
    }
    /* Change the array of keys to match the firefox.ts */
    if (hosttype == 'browser') {
      return host.storage.local.get(['instances']);
    } else if (hosttype == 'chrome') {
      host.storage.local.get(['instances'], (instances) => { resolve(instances); });
    }
  }
  );
}

/*    ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', restoreOptions);
addClickHandler('#addInstance', addInstance);
addClickHandler('#updateInstance', updateInstance);
addClickHandler('#removeInstance', removeInstance);
