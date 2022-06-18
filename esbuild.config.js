const path = require('path')
const rails = require('esbuild-rails')
const watch = process.argv.includes('--watch')

const watchOptions = {
  onRebuild: (error, result) => {
    if (error) console.error('watch build failed:', error)
    else console.log('watch build succeeded:', result)
  }
}

require('esbuild')
  .build({
    entryPoints: ['application.js'],
    bundle: true,
    sourcemap: true,
    outdir: path.join(process.cwd(), 'app/assets/builds'),
    absWorkingDir: path.join(process.cwd(), 'app/javascript'),
    watch: watch && watchOptions,
    plugins: [rails()]
  })
  .catch(() => process.exit(1))

// David Colby web server version

// const path = require('path')
// const http = require('http')
// const rails = require('esbuild-rails')
// const watch = process.argv.includes('--watch')
// const clients = []

// const watchOptions = {
//   onRebuild: (error, result) => {
//     if (error) {
//       console.error('Build failed:', error)
//     } else {
//       console.log('Build succeeded')
//       clients.forEach(res => res.write('data: update\n\n'))
//       clients.length = 0
//     }
//   }
// }

// require('esbuild')
//   .build({
//     entryPoints: ['application.js'],
//     bundle: true,
//     outdir: path.join(process.cwd(), 'app/assets/builds'),
//     absWorkingDir: path.join(process.cwd(), 'app/javascript'),
//     watch: watch && watchOptions,
//     plugins: [rails()],
//     banner: {
//       js:
//         ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();'
//     }
//   })
//   .catch(() => process.exit(1))

// http
//   .createServer((req, res) => {
//     return clients.push(
//       res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Access-Control-Allow-Origin': '*',
//         Connection: 'keep-alive'
//       })
//     )
//   })
//   .listen(8082)

// David Colby chokidar version

// const path = require('path')
// const chokidar = require('chokidar')
// const http = require('http')
// const rails = require('esbuild-rails')

// const clients = []

// http
//   .createServer((req, res) => {
//     return clients.push(
//       res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Access-Control-Allow-Origin': '*',
//         Connection: 'keep-alive'
//       })
//     )
//   })
//   .listen(8082)

// async function builder () {
//   let result = await require('esbuild').build({
//     entryPoints: ['application.js'],
//     bundle: true,
//     outdir: path.join(process.cwd(), 'app/assets/builds'),
//     absWorkingDir: path.join(process.cwd(), 'app/javascript'),
//     incremental: true,
//     plugins: [rails()],
//     banner: {
//       js:
//         ' (() => new EventSource("http://localhost:8082").onmessage = () => location.reload())();'
//     }
//   })
//   chokidar
//     .watch([
//       './app/javascript/**/*.js',
//       './app/views/**/*.html.erb',
//       './app/assets/stylesheets/*.css'
//     ])
//     .on('all', (event, path) => {
//       if (path.includes('javascript')) {
//         result.rebuild()
//       }
//       clients.forEach(res => res.write('data: update\n\n'))
//       clients.length = 0
//     })
// }
// builder()
