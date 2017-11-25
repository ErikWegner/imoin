var hosttype = chrome ? 'chrome' : browser ? 'browser' : 'na'
var host = chrome || browser;

function saveOptions() {
  host.storage.local.set({
    timerPeriod: parseInt(document.querySelector('#timerPeriod').value),
    icingaversion: document.querySelector('#icingaversion').value,
    url: document.querySelector('#url').value,
    username: document.querySelector('#username').value,
    password: document.querySelector('#password').value,
  });
  var myPort = host.runtime.connect({name:'port-from-options'});
  myPort.postMessage({command: 'SettingsChanged'});
  myPort.disconnect();
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
  const i = document.getElementById('instanceid');
  i.options[i.options.length] = new Option('Instance ' + i.options.length, i.options.length);
}

function updateInstance() {

}

function removeInstance() {

}

function addClickHandler(selector, handler) {
  element = document.querySelector(selector);
  if (!element || !element.addEventListener) {
    return
  }

  element.addEventListener('click', handler);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
addClickHandler('#addInstance', addInstance);
addClickHandler('#updateInstance', updateInstance);
addClickHandler('#removeInstance', removeInstance);
