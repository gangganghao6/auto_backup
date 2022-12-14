const fs = require('fs');
const path = require('path');

let {logDir: logPath, log} = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
if (!fs.existsSync(logPath)) fs.mkdirSync(logPath)
const date = new Date()
logPath = path.join(logPath, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.backup_log`)

function diffBaseFiles(basePath, targetPath, ignoreDirs, ignoreFiles) {
    if (!fs.existsSync(basePath)) {
        try {
            fs.rmSync(targetPath, {
                force: false,
                recursive: true
            })
            logFn(`Delete: ${targetPath}`)
        } catch {
        }
    } else if (fs.lstatSync(basePath).isDirectory() && !isIgnoredDir(basePath, ignoreDirs)) {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath)
            logFn(`Create dir: ${targetPath}`);
        }
        const dirs = fs.readdirSync(basePath)
        for (const dir of dirs) {
            diffBaseFiles(`${basePath}\\${dir}`, `${targetPath}\\${dir}`, ignoreDirs, ignoreFiles, log)
        }
    } else if (fs.lstatSync(basePath).isFile() && !isIgnoredFile(basePath, ignoreFiles) && !isIgnoredDir(basePath, ignoreDirs)) {
        if (!fs.existsSync(targetPath) || Math.abs(+fs.lstatSync(basePath).mtime - +fs.lstatSync(targetPath).mtime) > 2000) {
            fs.cpSync(basePath, targetPath)
            logFn(`Copy file: ${targetPath}`);
        }
    }
}

function diffTargetFiles(basePath, targetPath, ignoreDirs, ignoreFiles, log) {
    if (!fs.existsSync(basePath)) {
        try {
            fs.rmSync(targetPath, {
                recursive: true
            });
            logFn(`Delete: ${targetPath}`);
        } catch {
        }
    } else if (fs.lstatSync(targetPath).isDirectory() && !isIgnoredDir(basePath, ignoreDirs)) {
        const dirs = fs.readdirSync(targetPath)
        for (const dir of dirs) {
            diffTargetFiles(`${basePath}\\${dir}`, `${targetPath}\\${dir}`, ignoreDirs, ignoreFiles, log)
        }
    }
}

function isIgnoredFile(path, ignores) {
    return ignores.some((ignore) => new RegExp(`\\\\.*?${ignore}$`).test(path))
}

function isIgnoredDir(path, ignores) {
    return ignores.some((ignore) => new RegExp(`\\\\${ignore}$|\\\\${ignore}\\\\`).test(path))
}

function logFn(msg) {
    const currentDate = new Date();
    console.log(`${currentDate.toLocaleString()} : ${msg}`)
    if (log) {
        fs.appendFileSync(logPath, `${date.toLocaleString()} : ${msg}\n`, {encoding: 'utf8'})
    }
}

module.exports = {
    logFn,
    diffBaseFiles,
    diffTargetFiles
}