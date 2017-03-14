let path = require('path')

const {app, Menu, Tray} = require('electron')

let tray = null
const iconPath = path.join(__dirname, '..', 'icons', 'icon-64.png');

function init(app) {

    app.on('ready', function () {
        tray = new Tray(iconPath)
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Item1', type: 'radio' },
            { label: 'Item2', type: 'radio' },
            { label: 'Item3', type: 'radio', checked: true },
            { label: 'Item4', type: 'radio' }
        ])
        tray.setToolTip('This is my application.')
        tray.setContextMenu(contextMenu)
    })
}

exports.init = init
