const fs = require('fs')
const path = require('path')
let {logDir: logPath} = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const argv = process.argv[2]
const command = fs.readFileSync(path.join(logPath, 'command.txt'), {encoding: 'utf8'})
let toWrite;
if (argv === command) {
    toWrite = command + ' '
} else if (argv === 'show') {
    toWrite = 'show'
} else if (argv === 'hide') {
    toWrite = 'hide'
} else if (argv === 'quit') {
    toWrite = 'quit'
} else {
    process.exit(0)
}
fs.writeFileSync(path.join(logPath, 'command.txt'), toWrite, {encoding: 'utf8'})

