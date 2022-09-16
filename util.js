const fs = require('fs');
const path = require('path');

function diffBaseFiles(basePath, targetPath, ignoreDirs, ignoreFiles, log, logPath) {
    if (!isIgnored(basePath, ignoreDirs) && fs.statSync(basePath).isDirectory()) {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
            logFn(`Create dir: ${targetPath}`, log, logPath)
        }
        const files = fs.readdirSync(basePath)
        for (const file of files) {
            diffBaseFiles(`${basePath}\\${file}`, `${targetPath}\\${file}`, ignoreDirs, ignoreFiles, log, logPath)
        }
    } else if (!isIgnored(basePath, ignoreFiles) && fs.statSync(basePath).isFile()) {
        if (fs.existsSync(targetPath)) {
            if (Math.abs(+fs.lstatSync(basePath).mtime - +fs.lstatSync(targetPath).mtime) > 2000) {
                logFn(`Delete and copy file: ${targetPath}`, log, logPath);
                fs.unlinkSync(targetPath)
                fs.copyFileSync(basePath, targetPath)
            }
        } else {
            fs.copyFileSync(basePath, targetPath)
            logFn(`Copy file: ${targetPath}`, log, logPath);
        }
    }
}

function diffTargetFiles(basePath, targetPath, ignoreDirs, ignoreFiles, log, logPath) {
    if (!isIgnored(targetPath, ignoreDirs) && fs.statSync(targetPath).isDirectory()) {
        if (!fs.existsSync(basePath)) {
            fs.rmSync(targetPath, {
                recursive: true
            });
            logFn(`Delete dir: ${targetPath}`, log, logPath);
        } else {
            const files = fs.readdirSync(targetPath)
            for (const file of files) {
                diffTargetFiles(`${basePath}\\${file}`, `${targetPath}\\${file}`, ignoreDirs, ignoreFiles, log, logPath)
            }
        }
    } else if (!isIgnored(targetPath, ignoreFiles) && fs.statSync(targetPath).isFile()) {
        if (!fs.existsSync(basePath)) {
            fs.unlinkSync(targetPath)
            logFn(`Delete file: ${targetPath}`, log, logPath);
        }
    }
}

function isIgnored(path, ignores) {
    return ignores.some((ignore) => path.includes(ignore))
}


function logFn(msg, log, logPath) {
    console.log(msg)
    if (log) {
        if (!fs.existsSync(logPath)) fs.mkdirSync(logPath)
        const date = new Date()
        logPath = path.join(logPath, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.txt`)
        fs.appendFileSync(logPath, `${date.toLocaleString()} : ${msg}\n`, {encoding: 'utf8'})
    }
}

module.exports = {
    diffBaseFiles,
    diffTargetFiles,
    logFn,
    isIgnored
}