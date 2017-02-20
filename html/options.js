function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    timerPeriod: parseInt(document.querySelector("#timerPeriod").value),
    icingaversion: document.querySelector("#icingaversion").value,
    url: document.querySelector("#url").value,
    username: document.querySelector("#username").value,
    password: document.querySelector("#password").value,
  });
  var myPort = browser.runtime.connect({name:"port-from-options"});
  myPort.postMessage({command: "SettingsChanged"});
  myPort.disconnect();
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#timerPeriod").value = result.timerPeriod || "5";
    document.querySelector("#icingaversion").value = result.icingaversion || "cgi";
    document.querySelector("#url").value = result.url || "";
    document.querySelector("#username").value = result.username || "";
    document.querySelector("#password").value = result.password || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  /* Change the array of keys to match the firefox.ts */
  var getting = browser.storage.local.get(
    ["timerPeriod", "icingaversion", "url", "username", "password"]);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
