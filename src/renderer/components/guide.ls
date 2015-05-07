
# Require

{ id, log, floor } = require \std

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

  position-beam: (beam, beam-shape) ->
    w = 1 + beam-shape.max - beam-shape.min
    g = @opts.grid-size
    beam.scale.set w, 1, 1   # Scales around center, so incorporate offset
    beam.position.x = g * (beam-shape.pos + w/2 + beam-shape.min + 0.5)

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

    @position-beam @beam, beam-shape
    @state.this-shape = beam-shape

  show-flare: (p, dropped) ->
    if p is 0
      g = @opts.grid-size
      @state.last-shape = beam-shape = @state.this-shape
      @flare.material.materials.map (.emissive?.set-hex beam-shape.color)
      @position-beam @flare, beam-shape
      @flare.scale.y = g * (1 + dropped)/@height
      @flare.position.y = @height - g * (beam-shape.height) - g * dropped

    @flare.material.materials.map (.opacity = 1 - p)

