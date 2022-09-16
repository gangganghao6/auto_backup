const {fork, execSync} = require('child_process');
const windowHide = require('node-hide-console-window');
const fs = require('fs');
const {logFn} = require('./util2')

let heartBeats = 1
let mainProcess
let childPid

const state = fs.readFileSync('./state.txt', {encoding: 'utf8'})
if (state !== '') {
    let result
    try {
        result = execSync(`tasklist |findstr ${state}`, {
            stdio: 'ignore'
        })
        execSync('node command.js show')
        process.exit(0)
    } catch {
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
            fs.writeFileSync('./state.txt', childPid, {encoding: 'utf8'})
            windowHide.hideConsole()
        }
    })
}

main()

setInterval(() => {
    heartBeats = heartBeats - 1;
    if (heartBeats < 0) {
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

fs.watch('./command.txt', () => {
    const command = fs.readFileSync('./command.txt', {encoding: 'utf8'}).trimEnd()
    if (command === 'show') {
        windowHide.showConsole()
    } else if (command === 'hide') {
        windowHide.hideConsole()
    }else if (command === 'quit'){
        process.exit(0);
    }
})

