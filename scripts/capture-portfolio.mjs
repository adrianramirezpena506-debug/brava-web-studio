import { spawn } from 'node:child_process'
import { access, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = path.join(root, 'public', 'assets', 'portfolio')
const tempDir = path.join(root, '.screenshots-temp')

const projects = [
  { slug: 'pura-frutika', name: 'Pura Frutika', url: 'https://purafrutika-web-4cjp.vercel.app/' },
  { slug: 'electricista-ya', name: 'Electricista YA', url: 'https://electricista-ya.vercel.app/' },
  { slug: 'cerkos-cr', name: 'Cerkos CR', url: 'https://cerkos-cr.vercel.app/' },
  { slug: 'cocos-tours', name: 'Coco’s Tours', url: 'https://cocos-tours-gilt.vercel.app/es' },
  { slug: 'multiservicios-romac', name: 'Multiservicios Romac', url: 'https://multiservicios-romac-4e8q.vercel.app/' },
  { slug: 'urban10', name: 'Urban 10', url: 'https://urban10-web.vercel.app/' },
]

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
]

const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

async function findBrowser() {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Continue with the next installed browser candidate.
    }
  }
  throw new Error('No se encontró Chrome o Edge para crear las capturas.')
}

function runBrowser(browserPath, args, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const child = spawn(browserPath, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('La captura superó el tiempo de espera.'))
    }, timeout)

    child.stderr.on('data', (chunk) => { stderr += chunk.toString() })
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('exit', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `El navegador terminó con código ${code}.`))
    })
  })
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[character])
}

async function createPlaceholder(project, viewport, targetPath) {
  const safeName = escapeXml(project.name)
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${viewport.width}" height="${viewport.height}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b0b10"/><stop offset="1" stop-color="#171027"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="80%" cy="25%" r="180" fill="#7c3aed" opacity=".15"/>
      <text x="50%" y="47%" fill="#fff" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle">${safeName}</text>
      <text x="50%" y="54%" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">Captura temporalmente no disponible</text>
    </svg>`)
  await sharp(svg).webp({ quality: 82, effort: 5 }).toFile(targetPath)
}

async function capture(browserPath, project, viewport) {
  const baseName = `${project.slug}-${viewport.label}`
  const pngPath = path.join(tempDir, `${baseName}.png`)
  const targetPath = path.join(outputDir, `${baseName}.webp`)
  const profilePath = path.join(tempDir, `profile-${baseName}`)

  try {
    await runBrowser(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--ignore-certificate-errors',
      '--force-device-scale-factor=1',
      '--run-all-compositor-stages-before-draw',
      '--disable-background-networking',
      '--disable-component-update',
      `--user-data-dir=${profilePath}`,
      `--window-size=${viewport.width},${viewport.height}`,
      `--screenshot=${pngPath}`,
      '--virtual-time-budget=7000',
      project.url,
    ], 40000)

    await access(pngPath)
    await sharp(pngPath)
      .resize(viewport.width, viewport.height, { fit: 'cover', position: 'top' })
      .webp({ quality: 80, effort: 5 })
      .toFile(targetPath)
    console.log(`CAPTURED ${baseName}.webp`)
  } catch (error) {
    await createPlaceholder(project, viewport, targetPath)
    console.warn(`PLACEHOLDER ${baseName}.webp: ${error.message}`)
  } finally {
    await rm(profilePath, { recursive: true, force: true })
  }
}

await mkdir(outputDir, { recursive: true })
await rm(tempDir, { recursive: true, force: true })
await mkdir(tempDir, { recursive: true })

const browserPath = await findBrowser()

for (const project of projects) {
  for (const viewport of viewports) {
    await capture(browserPath, project, viewport)
  }
}

await rm(tempDir, { recursive: true, force: true })
