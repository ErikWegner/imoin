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

  function setCurrentChoice(result) {
    document.querySelector('#instancelabel').value = result.label || 'Default';
    document.querySelector('#timerPeriod').value = result.timerPeriod || '5';
    document.querySelector('#icingaversion').value = result.icingaversion || 'cgi';
    document.querySelector('#url').value = result.url || '';
    document.querySelector('#username').value = result.username || '';
    document.querySelector('#password').value = result.password || '';
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  if (!host.storage) {
    return;
  }

  /* Change the array of keys to match the firefox.ts */
  if (hosttype == 'browser') {
    var getting = host.storage.local.get(
      ['timerPeriod', 'icingaversion', 'url', 'username', 'password']);
    getting.then(setCurrentChoice, onError);
  } else if (hosttype == 'chrome') {
    host.storage.local.get(['timerPeriod', 'icingaversion', 'url', 'username', 'password'], setCurrentChoice);
  }
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
  updateDOM();
}

/*    ---- Browser functions ---- */

function updateDOM() {

}

function addClickHandler(selector, handler) {
  element = document.querySelector(selector);
  if (!element || !element.addEventListener) {
    return
  }

  element.addEventListener('click', handler);
}

function getFormTextValue(selector, defaultValue) {
  document.querySelector('#instancelabel').value || defaultValue;
}

function saveOptions() {
  host.storage.local.set({
    instances: instances
  });
  var myPort = host.runtime.connect({name:'port-from-options'});
  myPort.postMessage({command: 'SettingsChanged'});
  myPort.disconnect();
}

/*    ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', restoreOptions);
addClickHandler('#addInstance', addInstance);
addClickHandler('#updateInstance', updateInstance);
addClickHandler('#removeInstance', removeInstance);
