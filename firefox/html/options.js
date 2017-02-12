function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    url: document.querySelector("#url").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#url").value = result.url || "";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("color");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
