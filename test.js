const ignores = ['node_modules', '.jpg', '.git']
const path = 'E:\\前端项目\\新博客-后端\\node_modules\\.pnpm\\@fastify+accept-negotiator@1.0.0\\hehe.git'
const resultDir = ignores.some((ignore) => new RegExp(`\\\\${ignore}$`).test(path))
const resultFile = ignores.some((ignore) => new RegExp(`\\\\.*?${ignore}$`).test(path))
console.log(resultDir, resultFile)
