const {fork, execSync} = require('child_process');
const windowHide = require('node-hide-console-window');
const fs = require('fs');
const path = require('path');
const {logFn} = require('./util2')
let {logDir: logPath} = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const statePath = path.join(logPath, 'state.txt')
const commandPath = path.join(logPath, 'command.txt')
if (!fs.existsSync(commandPath)) fs.writeFileSync(commandPath, '')
if (!fs.existsSync(statePath)) fs.writeFileSync(statePath, '')
let heartBeats = 1
let mainProcess
let childPid

const state = fs.readFileSync(statePath, {encoding: 'utf8'})
if (state !== '') {
    let result
    try {
        result = execSync(`tasklist |findstr ${state}`).toString()
        if(!result.includes('node')){
            throw new Error()
        }
        execSync('node command.js show')
        process.exit(0)
    } catch{
    }
}

function main() {
    mainProcess = fork('./index.js')
    mainProcess.on('message', (msg) => {
        if (msg === 'heartbeat') {
            heartBeats = heartBeats + 1;
        } else if (msg.includes('allDone')) {
            childPid = msg.split(':')[1]
            logFn('All done,childPid : ' + childPid)
            fs.writeFileSync(statePath, childPid, {encoding: 'utf8'})
            windowHide.hideConsole()
        }
    })
}

main()

setInterval(() => {
    heartBeats = heartBeats - 1;
    if (heartBeats < -5) {
        windowHide.showConsole()
        logFn('Program not responding,rebooting...');
        try {
            execSync(`taskkill /pid ${childPid} /f`, {
                stdio: 'ignore'
            });
        } catch (e) {
            logFn(e.toString())
        }
        main();
        logFn('Program reboot successful');
        heartBeats = 1;
    }
}, 1000)

fs.watch(commandPath, () => {
    const command = fs.readFileSync(commandPath, {encoding: 'utf8'}).trimEnd()
    if (command === 'show') {
        windowHide.showConsole()
    } else if (command === 'hide') {
        windowHide.hideConsole()
    } else if (command === 'quit') {
        process.exit(0);
    }
})

