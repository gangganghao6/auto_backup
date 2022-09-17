const fs = require('fs');
const ignores = ['node_modules', '.jpg', '.git']
const path = 'E:\\前端项目\\新博客-后端\\.pnpm\\@fastify+accept-negotiator@1.0.0\\.git'
const resultDir = ignores.some((ignore) => new RegExp(`\\\\${ignore}$`).test(path))
const resultFile = ignores.some((ignore) => new RegExp(`\\\\.+${ignore}$`).test(path))
console.log(resultDir, resultFile)
try {
    fs.rmSync('./noneexit.txt')
} catch (e) {
    console.log(e.message)
}
