const net = require('net')
const socket = net.createConnection({port: 3302})
socket.on('error', function (err) {
    console.log(err.toString())
})
const argvs = process.argv[2];
socket.write(argvs)
socket.end()

