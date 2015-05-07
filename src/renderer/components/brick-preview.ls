
# Require

{ id, log, sin, min } = require \std

{ Base } = require \./base
{ Brick } = require \./brick
{ Ease } = require \std

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

    @s = @opts.preview-scale-factor
    @color = 0xffffff

    tube-radius = @opts.preview-dome-radius
    tube-height = @opts.preview-dome-height

    @brick = new Brick @opts, gs
    @brick.root.scale.set @s, @s, @s
    @brick.root.position.y = @opts.grid-size * 2
    @brick.root.position.x = 0

    @dome = new THREE.Mesh (new THREE.CapsuleGeometry tube-radius, 16, tube-height, 0), glass-mat
    @dome.position.y = tube-height

    @base = void

    @light = new THREE.PointLight \orange, 1, 0.5
    @light.position.y = tube-height/2

    @registration.add @dome
    @registration.add @light
    @registration.add @brick.root

  display-nothing: ->
    @brick.visible = no
    @light.intensity = 0

  display-shape: (brick) ->
    @brick.visible = yes
    @brick.pretty-display-shape brick
    #@light.color.set-hex @color = Palette.spec-colors[brick.color]

  update-wiggle: ({ elapsed-time, timers }:gs) ->
    @root.rotation.y = 0.2 * sin elapsed-time / 500
    t = min 1, timers.preview-reveal-timer.progress
    p = Ease.cubic-in t, 0, @s
    @brick.root.scale.set p, p, p

    if t is 0
      @light.intensity = 3
      @light.color.set-hex 0xffffff
    else
      @light.intensity = t
      @light.color.set-hex 0xffbb22

