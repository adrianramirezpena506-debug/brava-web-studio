import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, 'public', 'assets')
await mkdir(assetsDir, { recursive: true })

const svg = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#030303"/><stop offset="1" stop-color="#0c0715"/></linearGradient>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c084fc"/><stop offset=".55" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#7c3aed" stop-opacity=".42"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="1070" cy="120" r="330" fill="url(#glow)"/>
    <circle cx="100" cy="670" r="320" fill="url(#glow)" opacity=".45"/>
    <g opacity=".1" stroke="#fff"><path d="M0 90h1200M0 180h1200M0 270h1200M0 360h1200M0 450h1200M0 540h1200"/><path d="M100 0v630M200 0v630M300 0v630M400 0v630M500 0v630M600 0v630M700 0v630M800 0v630M900 0v630M1000 0v630M1100 0v630"/></g>
    <g transform="translate(76 72)"><path fill="url(#brand)" d="M38 0 72 20v40L38 80 4 60V20L38 0Zm0 14L16 27v26l22 13 22-13V27L38 14Z"/><path fill="url(#brand)" d="m22 34 16-9 16 9-16 9-16-9Zm0 14 16-9 16 9-16 9-16-9Z" opacity=".7"/></g>
    <text x="176" y="106" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="7">BRAVA</text>
    <text x="177" y="135" fill="#71717a" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" letter-spacing="5">WEB STUDIO</text>
    <text x="76" y="305" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700" letter-spacing="-4">Páginas que convierten</text>
    <text x="76" y="385" fill="url(#brand)" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700" letter-spacing="-4">visitas en clientes.</text>
    <text x="80" y="472" fill="#a1a1aa" font-family="Inter, Arial, sans-serif" font-size="25">Diseño y desarrollo web para negocios en Costa Rica.</text>
    <rect x="78" y="533" width="274" height="4" rx="2" fill="url(#brand)"/>
  </svg>`)

await sharp(svg).webp({ quality: 88, effort: 6 }).toFile(path.join(assetsDir, 'brava-og.webp'))
console.log('CREATED brava-og.webp')
