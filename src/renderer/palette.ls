
# Require

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ log, map } = require \std

pluck = (p, o) --> o[p]


# Techinicolor colors

export neutral = [ 0xffffff 0xcccccc 0x888888 0x212121 ]
export red     = [ 0xFF4444 0xFF7777 0xdd4444 0x551111 ]
export orange  = [ 0xFFBB33 0xFFCC88 0xCC8800 0x553300 ]
export green   = [ 0x44ff66 0x88ffaa 0x22bb33 0x115511 ]
export magenta = [ 0xff33ff 0xffaaff 0xbb22bb 0x551155 ]
export blue    = [ 0x66bbff 0xaaddff 0x5588ee 0x111155 ]
export brown   = [ 0xffbb33 0xffcc88 0xbb9900 0x555511 ]
export yellow  = [ 0xeeee11 0xffffaa 0xccbb00 0x555511 ]
export cyan    = [ 0x44ddff 0xaae3ff 0x00aacc 0x006699 ]

color-order = [ neutral, red, orange, yellow, green, cyan, blue, magenta ]


# Export color sequences

export tile-colors = map pluck(2), color-order
export spec-colors = map pluck(0), color-order


# Generate tile mats

tile-normal-map = THREE.ImageUtils.load-texture \/assets/tile.nrm.png
tile-normal-adjust = new THREE.Vector2 1, 1

export mesh-materials = for color, i in tile-colors
  new THREE.MeshPhongMaterial do
    metal: true
    color: color
    specular: spec-colors[i]
    shininess: 100
    normal-map: tile-normal-map
    normal-scale: tile-normal-adjust

export transparent-tile-materials = for color, i in tile-colors
  new THREE.MeshPhongMaterial do
    metal: true
    color: color
    transparent: true
    opacity: 0.5
    specular: spec-colors[i]
    shininess: 100
    normal-map: tile-normal-map
    normal-scale: tile-normal-adjust


# Generate line mats

export line-materials = for color in tile-colors
  new THREE.LineBasicMaterial do
    color: color


# Unified Namespace

export Palette =
  {
    neutral, red, orange, yellow, green, cyan, blue, magenta,
    tile-colors, mesh-materials, line-materials
  }

