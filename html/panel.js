'use strict';
const log = (...args) => {
  console.log(...args);
};

let postPanelMessagePort = null;
const postPanelMessage = (data) => {
  if (postPanelMessagePort) {
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
  })
  return host;
};

const outputParent = document.querySelector('#panel');
const outputTemplate = (template) => {
  // remove existing content
  outputParent.innerHTML = '';
  outputParent.appendChild(template);
};

const renderUnconfiguredInstances = () => {
  const template = document.querySelector('#unconfigured-template');
  const renderedTemplate = template.content.cloneNode(true);
  outputTemplate(renderedTemplate);
  outputParent
    .querySelector('button')
    .addEventListener('click', openConfiguration);
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
    });
  });
};

const openConfiguration = () => {
  log('opening configuration');
  postPanelMessage({ command: 'open_configuration' });
};

const host = initEnvironment();
fullUpdatePanelContent();
