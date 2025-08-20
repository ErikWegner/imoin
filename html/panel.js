'use strict';
const log = (...args) => {
  console.log(...args);
};

const initEnvironment = () => {
  // Web extension in Chrome or Firefox
  const host = chrome || browser;
  // Edge browser
  if (typeof browser !== 'undefined' && browser.runtime !== null) {
    return browser;
  }

  return host;
};

const renderUnconfiguredInstances = () => {
  // TODO: Show link to configuration page
};

const fullUpdatePanelContent = () => {
  host.storage.sync.get({ instances: [] }, (syncData) => {
    const instances = syncData.instances;
    if (instances.length === 0) {
      renderUnconfiguredInstances();
      return;
    }

    chrome.storage.local.get({ nagiosData: {} }, (localData) => {
      // TODO: Implement logic to update panel content based on retrieved data from Nagios instances
    });
  });
};

const host = initEnvironment();
fullUpdatePanelContent();
