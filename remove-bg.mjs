import { Jimp } from 'jimp'

const img = await Jimp.read('public/logo.jpg')

const w = img.bitmap.width
const h = img.bitmap.height
const data = img.bitmap.data

// Sample background color from corners
const corners = [
  [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
  [Math.floor(w / 2), 2], [Math.floor(w / 2), h - 3],
]

function getPixel(x, y) {
  const idx = (y * w + x) * 4
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] }
}

function setAlpha(x, y, a) {
  const idx = (y * w + x) * 4
  data[idx + 3] = a
}

const samples = corners.map(([x, y]) => getPixel(x, y))
const bg = {
  r: Math.round(samples.reduce((s, c) => s + c.r, 0) / samples.length),
  g: Math.round(samples.reduce((s, c) => s + c.g, 0) / samples.length),
  b: Math.round(samples.reduce((s, c) => s + c.b, 0) / samples.length),
}
console.log('Background RGB:', bg)

function colorDist(p) {
  return Math.sqrt((p.r - bg.r) ** 2 + (p.g - bg.g) ** 2 + (p.b - bg.b) ** 2)
}

const THRESHOLD = 42
const visited = new Uint8Array(w * h)

// BFS flood-fill from all edge pixels
const queue = []

for (let x = 0; x < w; x++) {
  queue.push([x, 0])
  queue.push([x, h - 1])
}
for (let y = 1; y < h - 1; y++) {
  queue.push([0, y])
  queue.push([w - 1, y])
}

let qi = 0
while (qi < queue.length) {
  const [x, y] = queue[qi++]
  const vi = y * w + x
  if (visited[vi]) continue
  visited[vi] = 1

  const p = getPixel(x, y)
  if (colorDist(p) > THRESHOLD) continue

  setAlpha(x, y, 0)

  const neighbors = [
    [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
  ]
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx]) {
      queue.push([nx, ny])
    }
  }
}

await img.write('public/logo-clean.png')
console.log(`Done — processed ${w}x${h} image`)
