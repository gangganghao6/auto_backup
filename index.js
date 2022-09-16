const fs = require('node:fs');
const path = require('node:path')
const {diffBaseFiles, diffTargetFiles, logFn} = require('./util2.js')

setInterval(() => {
    process.send('heartbeat')
}, 1000)

const {missions} = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
for (const config of missions) {
    const {basePath, targetPath, ignoreDirs, ignoreFiles, delay, active} = config
    if (!active) continue;
    ignoreDirs.push('.backup_log')
    ignoreFiles.push('.backup_log')
    if (delay <= 0) {
        logFn(`Start diffing ${basePath} ${targetPath}...`)
        diffNow(basePath, targetPath, ignoreDirs, ignoreFiles)
        // logFn(`Done,continue watching ${basePath} ${targetPath}...`)
        fs.watch(basePath, {
            recursive: true,
            presistent: true,
            encoding: 'utf8',
        }, (type, filename) => {
            if (filename !== null) {
                const myBasePath = path.join(basePath, filename.toString('utf-8'))
                const myTargetPath = path.join(targetPath, filename.toString('utf-8'))
                try {
                    diffNow(myBasePath, myTargetPath, ignoreDirs, ignoreFiles)
                } catch {
                }
            }
        })
    } else {
        logFn(`Start diffing ${basePath} ${targetPath}...`)
        diffNow(basePath, targetPath, ignoreDirs, ignoreFiles)
        logFn('Done')
        setInterval(() => {
            logFn(`Start diffing ${basePath} ${targetPath}...`)
            diffNow(basePath, targetPath, ignoreDirs, ignoreFiles)
            logFn('Done')
        }, delay * 1000 * 60)
    }
}

process.send(`allDone:${process.pid}`)

function diffNow(basePath, targetPath, ignoreDirs, ignoreFiles) {
    diffBaseFiles(basePath, targetPath, ignoreDirs, ignoreFiles)
    diffTargetFiles(basePath, targetPath, ignoreDirs, ignoreFiles)
}