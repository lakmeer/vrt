
# Require

{ id, sin, log, floor } = require \std

{ Base } = require \./base

Materials = require \../mats
Palette = require \../palette


#
# Class
#

export class Guide extends Base

  pretty-offset =
    square : [ 3 ]
    zig    : [ 2, 2 ]
    zag    : [ 2, 2 ]
    left   : [ 2, 1, 2, 3 ]
    right  : [ 2, 3, 2, 1 ]
    tee    : [ 2, 2, 2, 2 ]
    tetris : [ 3, 4 ]


  ({ grid-size, block-size }:opts, gs) ->
    super ...

    width  = grid-size * gs.arena.width
    @height = grid-size * gs.arena.height

    @gs = gs

    @state =
      this-shape: null
      last-shape: null

    geo = new THREE.BoxGeometry block-size, @height, grid-size * 0.9
    geo.apply-matrix new THREE.Matrix4!make-translation 0, @height/2, 0

    beam-mat  = Materials.flare-faces
    flare-mat = Materials.flare-faces.clone!

    @beam  = new THREE.Mesh geo, beam-mat
    @flare = new THREE.Mesh geo, flare-mat

    @registration.add @beam
    @registration.add @flare
    @registration.position.x = width/-2 - grid-size/2

    @guide-light = new THREE.PointLight 0xffffff, 1, grid-size * 4
    @guide-light.position.y = 0.1
    @registration.add @guide-light

    @impact-light = new THREE.PointLight 0x00ff00, 10, grid-size * 6
    @impact-light.position.z = 0.1
    @impact-light.position.y = 0.2
    #@registration.add @impact-light

  position-beam: (beam, beam-shape) ->
    w = 1 + beam-shape.max - beam-shape.min
    g = @opts.grid-size
    x = g * (beam-shape.pos + w/2 + beam-shape.min + 0.5)
    beam.scale.set w, 1, 1   # Scales around center, so incorporate offset
    beam.position.x = x

  show-beam: (brick) ->
    beam-shape = {
      min: 4
      max: 0
      pos: brick.pos.0
      color: \magenta
      height: brick.pos.1 + pretty-offset[brick.type][brick.rotation]
    }

    for row, y in brick.shape
      for cell, x in row
        if cell
          beam-shape.color = Palette.spec-colors[cell]
          if beam-shape.min > x then beam-shape.min = x
          if beam-shape.max < x then beam-shape.max = x

    x = @position-beam @beam, beam-shape
    @guide-light.position.x = x
    @state.this-shape = beam-shape

  position-flare: (flare, brick-height, drop-distance) ->
    g = @opts.grid-size
    flare.scale.y    = g * (1 + drop-distance)/@height
    flare.position.y = @height - g * (brick-height) - g * drop-distance

  show-flare: (p, drop-distance) ->
    if true # p is 0
      @state.last-shape = beam-shape = @state.this-shape

      x = @position-beam  @flare, beam-shape
      y = @position-flare @flare, beam-shape.height, drop-distance

      @flare.material.materials.map (.emissive?.set-hex beam-shape.color)

      @show-impact-light x, beam-shape

    #@flare.material.materials.map (.opacity = 1 - p)
    @impact-light.intensity = 10 * ( 1 - p )
    #@impact-light.distance  = @opts.grid-size * 3 + @opts.grid-size * 3 * sin @gs.elapsed-time / 1000

  show-impact-light: (x, beam-shape) ->
    @impact-light.hex = beam-shape.color
    @impact-light.position.x = x
    @impact-light.position.y = @height - @opts.grid-size * beam-shape.height

