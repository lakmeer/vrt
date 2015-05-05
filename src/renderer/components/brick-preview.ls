
# Require

{ id, log, sin } = require \std

{ Base } = require \./base
{ Brick } = require \./brick


#
# Class
#

export class BrickPreview extends Base

  glass-mat = new THREE.MeshPhongMaterial do
    color: 0x222222
    transparent: true
    specular: 0xffffff
    shininess: 100
    blending: THREE.AdditiveBlending
    depth-write: no

  (@opts, gs) ->

    super ...

    s = @opts.preview-scale-factor

    tube-radius = @opts.preview-dome-radius
    tube-height = @opts.preview-dome-height

    @brick = new Brick @opts, gs
    @brick.root.scale.set s, s, s
    @brick.root.position.y = @opts.grid-size * 2
    @brick.root.position.x = 0

    @dome = new THREE.Mesh (new THREE.CapsuleGeometry tube-radius, 16, tube-height, 0), glass-mat
    @dome.position.y = tube-height

    @base = void

    @registration.add @dome
    @registration.add @brick.root

  display-nothing: ->
    @brick.visible = no

  display-shape: (brick) ->
    @brick.visible = yes
    @brick.pretty-display-shape brick

  update-wiggle: (brick, elapsed-time) ->
    @root.rotation.y = 0.2 * sin elapsed-time / 500

