// paneldebug.js
// Debug channel implementation
const messageLog = document.getElementById('message-log');

function logMessage(message, type = 'received') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = type;
  logEntry.textContent = `[${timestamp}] ${type.toUpperCase()}: ${JSON.stringify(message, null, 2)}`;
  messageLog.appendChild(logEntry);
  messageLog.scrollTop = messageLog.scrollHeight;
}

const ProcessStatusUpdateCommand = {
  command: 'ProcessStatusUpdate',
};

const clients = new Set();

window.chrome = window.chrome || {};
window.chrome.runtime = {};
window.chrome.runtime.connect = () => {
  return {
    onMessage: {
      addListener: (port) => {
        clients.add({ postMessage: port });
      },
    },
    postMessage: (data) => logMessage(data, 'received'),
  };
};
window.chrome.storage = window.chrome.storage || {};
window.chrome.storage.local = {
  get: async (keys) => {
    const r = {};
    const arr = [];
    if (typeof keys === 'string') {
      arr.push(keys);
      r[keys] = JSON.parse(localStorage.getItem(keys));
      return;
    } else if (Array.isArray(keys)) {
      arr.push(...keys);
    } else if (typeof keys === 'object') {
      arr.push(...Object.keys(keys));
      Object.assign(r, JSON.parse(JSON.stringify(keys)));
    }

    arr.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        r[key] = JSON.parse(value);
      }
    });

    return r;
  },
  set: async (data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },
};

function simulateHostMessage(message) {}

function simulateEventToPanel(event) {
  logMessage(event, 'sent event');

  for (const client of clients) {
    client.postMessage(event);
  }
}

function savePanelData(instancesData) {
  if (instancesData) {
    return localStorage.setItem('instancesData', JSON.stringify(instancesData));
  } else {
    return Promise.resolve();
  }
}

// Test case infrastructure
const testCases = [
  {
    name: 'Single Host OK',
    data: {
      eventToPanel: {
        command: 'ProcessStatusUpdate',
      },
      data: {
        hosts: [
          {
            name: 'host1',
            status: 'UP',
            checkresult: 'All good',
            services: [{ name: 'HTTP', status: 'OK', checkresult: 'OK' }],
          },
        ],
        totalhosts: 1,
        filteredHostup: 1,
        filteredHosterrors: 0,
        totalservices: 1,
        filteredServiceok: 1,
        filteredServicewarnings: 0,
        filteredServiceerrors: 0,
        updatetime: '2023-01-01 12:00:00',
      },
    },
    tests: [
      {
        name: 'Panel contains host1',
        fn: () => !!document.querySelector('.host-name[data-host="host1"]'),
      },
    ],
  },
  {
    name: 'Multiple Hosts Mixed',
    data: {
      eventToPanel: {
        command: 'ProcessStatusUpdate',
      },
      data: {
        hosts: [
          {
            name: 'hostA',
            status: 'DOWN',
            checkresult: 'Down',
            services: [
              { name: 'SSH', status: 'CRIT', checkresult: 'Critical' },
            ],
          },
          {
            name: 'hostB',
            status: 'UP',
            checkresult: 'Running',
            services: [{ name: 'HTTP', status: 'OK', checkresult: 'Good' }],
          },
        ],
        instances: [
          {
            instancelabel: 'Instance 1',
            updatetime: '2023-01-01 12:00:00',
          },
          {
            instancelabel: 'Instance 2',
            updatetime: '2024-02-02 12:00:00',
          },
        ],
        totalhosts: 2,
        filteredHostup: 1,
        filteredHosterrors: 1,
        totalservices: 2,
        filteredServiceok: 1,
        filteredServicewarnings: 0,
        filteredServiceerrors: 1,
        updatetime: '2023-01-01 12:05:00',
      },
    },
    tests: [
      {
        name: 'Panel contains hostA',
        fn: () => !!document.querySelector('.host-name[data-host="hostA"]'),
      },
      {
        name: 'Panel contains hostB',
        fn: () => !!document.querySelector('.host-name[data-host="hostB"]'),
      },
    ],
  },
  {
    name: 'UI Settings',
    data: {
      command: 'uisettings',
      data: { fontsize: 120, inlineresults: true },
    },
  },
];

function runTests(tests, parentLi) {
  if (!tests || !tests.length) return;
  const resultsUl = document.createElement('ul');
  resultsUl.style.marginLeft = '20px';
  tests.forEach((test) => {
    const li = document.createElement('li');
    try {
      const passed = test.fn();
      li.textContent = `${test.name}: ${passed ? 'PASS' : 'FAIL'}`;
      li.style.color = passed ? 'green' : 'red';
    } catch (e) {
      li.textContent = `${test.name}: ERROR`;
      li.style.color = 'orange';
    }
    resultsUl.appendChild(li);
  });
  parentLi.appendChild(resultsUl);
}

function renderTestCases() {
  const ul = document.getElementById('test-cases');
  if (!ul) return;
  ul.innerHTML = '';
  testCases.forEach((tc, i) => {
    const li = document.createElement('li');
    li.textContent = tc.name + ' ';
    const btn = document.createElement('button');
    btn.textContent = 'Run';
    btn.onclick = async function () {
      await savePanelData(tc.data.data);
      simulateEventToPanel(tc.data.eventToPanel);
      runTests(tc.tests, li);
    };
    li.appendChild(btn);
    if (tc.tests && tc.tests.length) {
      // placeholder for tests results container
      const testsUl = document.createElement('ul');
      testsUl.style.marginLeft = '20px';
      li.appendChild(testsUl);
    }
    ul.appendChild(li);
  });
}

async function sendUpSet() {
  await savePanelData({
    hosts: [
      {
        name: 'test-host',
        status: 'UP',
        checkresult: 'Host is up and running',
        services: [
          {
            name: 'HTTP Service',
            status: 'OK',
            checkresult: 'HTTP service is OK',
            servicelink: 'http://example.com',
          },
        ],
      },
    ],
    totalhosts: 1,
    filteredHostup: 1,
    filteredHosterrors: 0,
    totalservices: 1,
    filteredServiceok: 1,
    filteredServicewarnings: 0,
    filteredServiceerrors: 0,
    updatetime: '2023-01-01 12:00:00',
  });
  simulateEventToPanel(ProcessStatusUpdateCommand);
}

async function sendErrorSet() {
  await savePanelData({
    hosts: [
      {
        name: 'test-host-2',
        status: 'DOWN',
        checkresult: 'Host is down',
        services: [
          {
            name: 'SSH Service',
            status: 'CRIT',
            checkresult: 'SSH service is critical',
            servicelink: 'ssh://example.com',
          },
        ],
      },
    ],
    totalhosts: 1,
    filteredHostup: 0,
    filteredHosterrors: 1,
    totalservices: 1,
    filteredServiceok: 0,
    filteredServicewarnings: 0,
    filteredServiceerrors: 1,
    updatetime: '2023-01-01 12:05:00',
  });
  simulateEventToPanel(ProcessStatusUpdateCommand);
}

function sendCustomCommand() {
  const input = document.getElementById('command-input');
  try {
    const message = JSON.parse(input.value);
    simulateHostMessage(message);
    input.value = '';
  } catch (e) {
    logMessage({ error: 'Invalid JSON', message: input.value }, 'error');
  }
}

function clearLog() {
  messageLog.innerHTML = '';
}

window.addEventListener('load', function () {
  logMessage({ message: 'Panel debug interface initialized' }, 'received');
  renderTestCases();
});
