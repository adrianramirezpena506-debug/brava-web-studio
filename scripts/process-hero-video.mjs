import { spawn } from 'node:child_process'
import { access, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = process.argv[2]
const outputDir = path.join(root, 'public', 'assets', 'hero')

if (!inputPath) {
  throw new Error('Indique la ruta del video original como argumento.')
}

await access(inputPath)
await mkdir(outputDir, { recursive: true })

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, ['-hide_banner', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg terminó con código ${code}.`))
    })
  })
}

const videoFilter = 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24'

await runFfmpeg([
  '-ss', '0', '-i', inputPath, '-t', '12', '-an', '-vf', videoFilter,
  '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1',
  '-deadline', 'good', '-cpu-used', '4', '-g', '96',
  path.join(outputDir, 'brava-hero.webm'),
])

await runFfmpeg([
  '-ss', '0', '-i', inputPath, '-t', '12', '-an', '-vf', videoFilter,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', '-g', '96',
  path.join(outputDir, 'brava-hero.mp4'),
])

await runFfmpeg([
  '-ss', '1', '-i', inputPath, '-frames:v', '1',
  '-vf', 'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720',
  '-c:v', 'libwebp', '-quality', '82',
  path.join(outputDir, 'brava-hero-poster.webp'),
])

for (const filename of ['brava-hero.webm', 'brava-hero.mp4', 'brava-hero-poster.webp']) {
  const metadata = await stat(path.join(outputDir, filename))
  console.log(`${filename}: ${Math.round(metadata.size / 1024)} KB`)
}
