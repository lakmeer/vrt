
# Require

{ id, log, sin } = require \std

{ Palette } = require \./palette


# Options

asset-path = ("assets/" +)


#
# Load required textures and so on
#

textures =
  nixie-digits-color:
    for i from 0 to 9
      new THREE.TextureLoader!load asset-path "digit-#i.col.png"

  nixie-bg-color:
    new THREE.TextureLoader!load asset-path "digit-bg.col.png"

  block-tile-normal:
    new THREE.TextureLoader!load asset-path "tile.nrm.png"

  table-top-color:
    new THREE.TextureLoader!.load asset-path "board.col.png"

  table-edge-color:
    new THREE.TextureLoader!load asset-path "board-f.col.png"

  table-top-specular:
    new THREE.TextureLoader!load asset-path "board.spec.png"

  flare-alpha:
    new THREE.TextureLoader!load asset-path "flare.alpha.png"



#
# Materials Library
#


# Debug Materials

export empty =
  new THREE.MeshBasicMaterial do
    visible: no
    color: 0x0
    opacity: 0

export normal =
  new THREE.MeshNormalMaterial

export debug-wireframe =
  new THREE.MeshBasicMaterial do
    color: \white
    wireframe: true

export helper-a =
  new THREE.MeshBasicMaterial do
    color: 0xff0000
    transparent: yes
    opacity: 0.5

export helper-b =
  new THREE.MeshBasicMaterial do
    color: 0x00ff00
    transparent: yes
    opacity: 0.5


# Generic Materials

export glass =
  new THREE.MeshPhongMaterial do
    color: 0x222222
    transparent: true
    specular: 0xffffff
    shininess: 100
    blending: THREE.AdditiveBlending
    depth-write: no

export copper =
  new THREE.MeshPhongMaterial do
    color: 0x965111
    specular: 0xcb6d51
    shininess: 30


# Nixie Tubes

export nixie-digits =
  for i from 0 to 9
    new THREE.MeshPhongMaterial do
      map: textures.nixie-digits-color[i]
      transparent: true
      color: 0xff3300
      emissive: 0xffbb00

export nixie-bg =
  new THREE.MeshPhongMaterial do
    map: textures.nixie-bg-color
    color: 0x000000
    transparent: true
    specular: 0xffffff
    shininess: 80


# Blocks

export blocks =
  for color, i in Palette.tile-colors
    new THREE.MeshStandardMaterial do
      metalness: 0.8
      color: color
      #specular: Palette.spec-colors[i]
      #shininess: 100
      normal-map: textures.block-tile-normal

export holo-blocks =
  for color, i in Palette.tile-colors
    new THREE.MeshStandardMaterial do
      metalness: 0.8
      color: color
      transparent: true
      emissive: 0xffffff
      opacity: 0.5
      #specular: Palette.spec-colors[i]
      #shininess: 100
      normal-map: textures.block-tile-normal

export zap =
  new THREE.MeshPhongMaterial do
    color: 0xffffff
    emissive: 0xffffff

export zap-fade = [
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.0
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.1
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.2
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.3
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.4
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.5
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.6
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.7
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.8
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 0.9
  new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: 1.0
]


# Table Faces

export table-top =
  new THREE.MeshPhongMaterial do
    map: textures.table-top-color
    specular: 0xffffff
    specular-map: textures.table-top-specular
    shininess: 100

export table-edge =
  new THREE.MeshPhongMaterial do
    map: textures.table-edge-color

export table-faces =
  [
    table-edge
    table-edge
    table-edge
    table-top
    table-edge
    table-edge
  ]


# Lines

export lines =
  for color in Palette.tile-colors
    new THREE.LineBasicMaterial do
      color: color


# Holograms

export flare =
  new THREE.MeshStandardMaterial do
    color: 0x0
    transparent: true
    emissive: \white
    opacity: 0.2
    depth-write: off
    blending: THREE.AdditiveBlending
    alpha-map: textures.flare-alpha

export flare-faces =
  [ flare, flare, empty, empty, flare, flare ]

