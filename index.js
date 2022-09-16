const fs = require('node:fs');
const path = require('node:path')
const windowHide = require('node-hide-console-window');
const {diffBaseFiles, diffTargetFiles, logFn} = require('./util2.js')

const net = require('net')
const socket = net.createServer((server) => {
    server.on('data', (data) => {
        data = data.toString('utf8')
        if (data === 'show') {
            windowHide.showConsole()
        } else if (data === 'hide') {
            windowHide.hideConsole()
        } else if (data === 'quit') {
            process.exit(0)
        }
    })
})
socket.listen(3302, () => {
    console.log(`listening on ${3302}...`)
    windowHide.hideConsole()
})
socket.on('error', () => {
    const mainServer = net.createConnection({port: 3302})
    mainServer.write('show')
    mainServer.end(() => {
        process.exit(0)
    })
})

const {missions} = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
for (const config of missions) {
    const {basePath, targetPath, ignoreDirs, ignoreFiles, delay, active, log} = config
    if (!active) continue;
    ignoreDirs.push('.backup_log')
    ignoreFiles.push('.backup_log')
    if (delay <= 0) {
        logFn(`Start diffing ${basePath} ${targetPath}...`, log)
        diffNow(basePath, targetPath, ignoreDirs, ignoreFiles, log)
        logFn(`Done,continue watching ${basePath} ${targetPath}...`, log)
        fs.watch(basePath, {
            recursive: true,
            presistent: true,
            encoding: 'utf8',
        }, (type, filename) => {
            if (filename !== null) {
                const myBasePath = path.join(basePath, filename.toString('utf-8'))
                const myTargetPath = path.join(targetPath, filename.toString('utf-8'))
                try {
                    diffNow(myBasePath, myTargetPath, ignoreDirs, ignoreFiles, log)
                } catch {
                }
            }
        })
    } else {
        logFn(`Start diffing ${basePath} ${targetPath}...`, log)
        diffNow(basePath, targetPath, ignoreDirs, ignoreFiles, log)
        logFn('Done', log)
        setInterval(() => {
            logFn(`Start diffing ${basePath} ${targetPath}...`, log)
            diffNow(basePath, targetPath, ignoreDirs, ignoreFiles, log)
            logFn('Done', log)
        }, delay * 1000 * 60)
    }
}

function diffNow(basePath, targetPath, ignoreDirs, ignoreFiles, log) {
    diffBaseFiles(basePath, targetPath, ignoreDirs, ignoreFiles, log)
    diffTargetFiles(basePath, targetPath, ignoreDirs, ignoreFiles, log)
}