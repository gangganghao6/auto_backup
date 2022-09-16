const fs = require('fs')

const argv = process.argv[2]
const command = fs.readFileSync('./command.txt', {encoding: 'utf8'})
let toWrite;
if (argv === command) {
    toWrite = command + ' '
} else if (argv === 'show') {
    toWrite = 'show'
} else if (argv === 'hide') {
    toWrite = 'hide'
} else if(argv === 'quit'){
    toWrite = 'quit'
}else {
    process.exit(0)
}
fs.writeFileSync('./command.txt', toWrite, {encoding: 'utf8'})

