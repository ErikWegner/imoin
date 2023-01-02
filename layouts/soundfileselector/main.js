(function () {
  const noFileSetText = 'not set';
  const audio = new Audio();
  audio.soundid = '';
  const audioFiles = {};
  const audioPlayers = [];

  function init() {
    const elements = document.getElementsByClassName('soundfileselector');
    for (let i = 0; i < elements.length; i++) {
      const rootelement = elements.item(i);
      populateRootElement(rootelement);
    }
  }

  /** Show element by setting the style */
  function show(element) {
    element.setAttribute('style', 'visibility:visible');
  }

  /** Hide element by setting the style */
  function hide(element) {
    element.setAttribute('style', 'visibility:hidden');
  }

  /** Create child elements */
  function populateRootElement(element) {
    console.log('populate');

    const soundid = element.getAttribute('data-soundevent');

    // A container for the currently selected file
    const filenamecontainer = document.createElement('div');
    element.appendChild(filenamecontainer);

    // A button to delete the current file
    const deleteAction = document.createElement('button');
    deleteAction.setAttribute('type', 'button');
    deleteAction.setAttribute('class', 'action delete');
    deleteAction.appendChild(document.createTextNode('X'));
    filenamecontainer.appendChild(deleteAction);

    // Text for the play/pause button
    const playActionText = document.createTextNode('▶')

    // A button to play the current file
    const playAction = document.createElement('button');
    playAction.setAttribute('type', 'button');
    playAction.setAttribute('class', 'action play');
    playAction.appendChild(playActionText);
    filenamecontainer.appendChild(playAction);

    // A label for the selected filename
    const filename = document.createTextNode(noFileSetText);
    filenamecontainer.appendChild(filename);

    // A file selector
    const fileinput = document.createElement('input');
    fileinput.setAttribute('type', 'file');
    element.appendChild(fileinput);

    // An element to show upload feedback
    const feedbackcontainer = document.createElement('div');
    element.appendChild(feedbackcontainer);

    // The spinner is a rotating square
    const spinner = document.createElement('span');
    spinner.setAttribute('class', 'spinner');
    hide(spinner);
    feedbackcontainer.appendChild(spinner);

    // Feedback text output
    const feedbacktext = document.createTextNode('');
    feedbackcontainer.appendChild(feedbacktext);

    audio.addEventListener('playing', function () {
      if (audio.soundid == soundid) {
        playActionText.textContent = '||';
      }
    });

    audio.addEventListener('pause', function () {
      playActionText.textContent = '▶';
    });

    // Play button
    playAction.addEventListener('click', function () {
      const start = audio.soundid != soundid || (audio.soundid == soundid && audio.paused);
      if (!audio.paused) {
        audio.pause();
      }
      window.setTimeout(() => {
        if (start && audioFiles[soundid]) {
          audio.soundid = soundid;
          audio.src = audioFiles[soundid];
          audio.play();
        }
      }, 1);
    });

    // Delete button
    deleteAction.addEventListener('click', function () {
      if (!audio.paused) {
        audio.pause();
      }
      delete (audioFiles[soundid]);
      filename.textContent = noFileSetText;
    });

    // A file is selected
    fileinput.addEventListener('change', function (ev) {
      feedbacktext.textContent = 'File selected';
      show(spinner);
      const file = fileinput.files[0];
      var reader = new FileReader();
      reader.addEventListener('load', function () {
        audioFiles[soundid] = reader.result;
        feedbacktext.textContent = 'File uploaded';
        filename.textContent = file.name;
        hide(spinner);
      });

      if (file) {
        feedbacktext.textContent = 'Reading file';
        reader.readAsDataURL(file);
      } else {
        feedbacktext.textContent = '';
        hide(spinner);
      }
    });

  }

  init();
})();
