import * as esbuild from 'esbuild'
import stylexPlugin from '@stylexjs/esbuild-plugin'

const isWatch = process.argv.includes('--watch')

const extension = {
  entryPoints: ['src/extension/index.ts'],
  bundle: true,
  sourcemap: true,
  external: ['vscode'],
  platform: 'node',
  outfile: 'out/extension.js',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}

const webview = {
  entryPoints: ['src/webview/index.tsx'],
  bundle: true,
  sourcemap: true,
  outfile: 'out/webview.js',
  plugins: [
    stylexPlugin({
      useCSSLayers: true,
      generatedCSSFileName: 'out/webview.css',
      stylexImports: ['@stylexjs/stylex'],
    }),
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}

if (isWatch) {
  console.log('Build watch start...')
  await Promise.all([
    esbuild.context(extension).then(c => c.watch()),
    esbuild.context(webview).then(c => c.watch()),
  ])
} else {
  console.log('Build start...')
  await Promise.all([
    esbuild.build(extension),
    esbuild.build(webview)
  ])
  console.log('Build success.')
}
