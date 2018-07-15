class SoundFileSelectorControl {
  static get noFileSetText() { return 'No sound file set'; }
  constructor(id) {
    this.id = id;
    this.filename = '';
    this.data = null;
    this.filenameTextNode = null;
  }
  get hasAudioData() {
    return this.data !== null;
  }
  get filedata() {
    return this.data;
  }
  set filedata(value) {
    this.data = value;
  }
  setUIFilename(textNode) {
    this.filenameTextNode = textNode;
  }
  updateUI() {
    if (this.filenameTextNode) {
      this.filenameTextNode.textContent = this.filename ? this.filename : SoundFileSelectorControl.noFileSetText;
    }
  }
  deleteFile() {
    this.filename = '';
    this.data = null;
    this.updateUI();
  }
  setFilename(filename) {
    this.filename = filename;
    this.updateUI();
  }
  restore(o) {
    this.setFilename(o.filename);
    this.data = o.data;
  }
  toObject() {
    return {
      id: this.id,
      filename: this.filename,
      data: this.data
    }
  }
}

(function (global) {
  const audio = new Audio();
  audio.soundid = '';
  const controls = {};

  function init() {
    Object.keys(controls).forEach(function(key) { delete controls[key]; });
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
    const soundid = element.getAttribute('data-soundevent');
    const control = new SoundFileSelectorControl(soundid);
    controls[soundid] = control;

    // A container for the currently selected file
    const filenamecontainer = document.createElement('div');
    element.appendChild(filenamecontainer);

    // A button to delete the current file
    const deleteAction = document.createElement('button');
    deleteAction.setAttribute('type', 'button');
    deleteAction.setAttribute('class', 'b red ma1');
    deleteAction.setAttribute('title', 'Remove file');
    deleteAction.appendChild(document.createTextNode('X'));
    filenamecontainer.appendChild(deleteAction);

    // Text for the play/pause button
    const playActionText = document.createTextNode('▶')

    // A button to play the current file
    const playAction = document.createElement('button');
    playAction.setAttribute('type', 'button');
    playAction.setAttribute('class', 'near-black ma1');
    playAction.setAttribute('title', 'Play file');
    playAction.appendChild(playActionText);
    filenamecontainer.appendChild(playAction);

    // A label for the selected filename
    const filename = document.createTextNode('');
    filenamecontainer.appendChild(filename);
    control.setUIFilename(filename);

    // A file selector
    const fileinput = document.createElement('input');
    fileinput.setAttribute('type', 'file');
    fileinput.setAttribute('class', 'ma1');
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
        if (start && control.hasAudioData) {
          audio.soundid = soundid;
          audio.src = control.filedata;
          audio.play();
        }
      }, 1);
    });

    // Delete button
    deleteAction.addEventListener('click', function () {
      if (!audio.paused) {
        audio.pause();
      }
      control.deleteFile();
      feedbacktext.textContent = '';
    });

    // A file is selected
    fileinput.addEventListener('change', function (ev) {
      feedbacktext.textContent = 'File selected';
      show(spinner);
      const file = fileinput.files[0];
      var reader = new FileReader();
      reader.addEventListener('load', function () {
        control.filedata = reader.result;
        control.setFilename(file.name);
        feedbacktext.textContent = 'File uploaded';
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


  global["SoundFileSelectors"] = {
    setFiles: function (filedata) {
      for (let key in filedata) {
        if (key in controls) {
          controls[key].restore(filedata[key]);
        }
      }
    },
    getFiles: function () {
      const r = {};
      Object.keys(controls).forEach(key => r[key] = controls[key].toObject());
      return r;
    },
    init: function () {
      init();
    }
  };

})(window);
