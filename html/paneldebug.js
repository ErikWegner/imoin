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

window.chrome = window.chrome || {};
window.chrome.runtime = {};
window.chrome.runtime.connect = () => {
    return {
        onMessage: {
            addListener: () => {}
        },
        postMessage: (data) => logMessage(data, 'received'),
    }
};

// Simulate receiving messages from host
function simulateHostMessage(message) {
    logMessage(message, 'received');
    
    if (message.command === 'ProcessStatusUpdate' || message.command === 'UpdatePanelData') {
        showAndUpdatePanelContent(message.data || {});
    } else if (message.command === 'uisettings') {
        setupUISettings(message.data || {});
    }
}

// Test case infrastructure
const testCases = [
  {
    name: 'Single Host OK',
    data: {
      command: 'ProcessStatusUpdate',
      data: {
        message: 'OK host',
        hosts: [{
          name: 'host1',
          status: 'UP',
          checkresult: 'All good',
          services: [{ name: 'HTTP', status: 'OK', checkresult: 'OK' }]
        }],
        totalhosts: 1,
        filteredHostup: 1,
        filteredHosterrors: 0,
        totalservices: 1,
        filteredServiceok: 1,
        filteredServicewarnings: 0,
        filteredServiceerrors: 0,
        updatetime: '2023-01-01 12:00:00'
      }
    }
  },
  {
    name: 'Multiple Hosts Mixed',
    data: {
      command: 'UpdatePanelData',
      data: {
        message: 'Mixed hosts',
        hosts: [
          {
            name: 'hostA',
            status: 'DOWN',
            checkresult: 'Down',
            services: [{ name: 'SSH', status: 'CRIT', checkresult: 'Critical' }]
          },
          {
            name: 'hostB',
            status: 'UP',
            checkresult: 'Running',
            services: [{ name: 'HTTP', status: 'OK', checkresult: 'Good' }]
          }
        ],
        totalhosts: 2,
        filteredHostup: 1,
        filteredHosterrors: 1,
        totalservices: 2,
        filteredServiceok: 1,
        filteredServicewarnings: 0,
        filteredServiceerrors: 1,
        updatetime: '2023-01-01 12:05:00'
      }
    }
  },
  {
    name: 'UI Settings',
    data: {
      command: 'uisettings',
      data: { fontsize: 120, inlineresults: true }
    }
  }
];

function renderTestCases() {
    const ul = document.getElementById('test-cases');
    if (!ul) return;
    ul.innerHTML='';
    testCases.forEach((tc,i)=>{
        const li=document.createElement('li');
        li.textContent=tc.name+' ';
        const btn=document.createElement('button');
        btn.textContent='Run';
        btn.onclick=function(){simulateHostMessage(tc.data);};
        li.appendChild(btn);
        ul.appendChild(li);
    });
}

// Initialize with a test message and render cases

// Predefined test messages
function sendProcessStatusUpdate() {
    simulateHostMessage({
        command: 'ProcessStatusUpdate',
        data: {
            message: 'Test status update',
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
                            servicelink: 'http://example.com'
                        }
                    ]
                }
            ],
            totalhosts: 1,
            filteredHostup: 1,
            filteredHosterrors: 0,
            totalservices: 1,
            filteredServiceok: 1,
            filteredServicewarnings: 0,
            filteredServiceerrors: 0,
            updatetime: '2023-01-01 12:00:00'
        }
    });
}

function sendUpdatePanelData() {
    simulateHostMessage({
        command: 'UpdatePanelData',
        data: {
            message: 'Test update panel data',
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
                            servicelink: 'ssh://example.com'
                        }
                    ]
                }
            ],
            totalhosts: 1,
            filteredHostup: 0,
            filteredHosterrors: 1,
            totalservices: 1,
            filteredServiceok: 0,
            filteredServicewarnings: 0,
            filteredServiceerrors: 1,
            updatetime: '2023-01-01 12:05:00'
        }
    });
}

function sendUisettings() {
    simulateHostMessage({
        command: 'uisettings',
        data: {
            fontsize: 120,
            inlineresults: true
        }
    });
}

function sendCustomCommand() {
    const input = document.getElementById('command-input');
    try {
        const message = JSON.parse(input.value);
        simulateHostMessage(message);
        input.value = '';
    } catch (e) {
        logMessage({error: 'Invalid JSON', message: input.value}, 'error');
    }
}

function clearLog() {
    messageLog.innerHTML = '';
}

window.addEventListener('load', function(){
    logMessage({message:'Panel debug interface initialized'},'received');
    renderTestCases();
});
