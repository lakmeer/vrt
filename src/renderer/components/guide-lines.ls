
# Require

{ id, log, floor } = require \std

{ Base } = require \./base

Materials = require \../mats


#
# Class
#

export class GuideLines extends Base
  ({ grid-size }:opts, gs) ->
    super ...

    width  = grid-size * gs.arena.width
    height = grid-size * gs.arena.height

    @lines = []

    mesh = new THREE.Geometry!
    mesh.vertices.push( new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, height, 0))

    for i from 0 to 9
      line = new THREE.Line mesh, Materials.lines[i]
      line.position <<< x: i * grid-size, y: 0
      @lines.push line
      @registration.add line

    @registration.position.x = width / -2 + 0.5 * grid-size

  show-beam: (brick) ->
    for line in @lines
      line.material = Materials.lines[0]

    for row, y in brick.shape
      for cell, x in row
        if cell
          @lines[brick.pos.0 + x].material = Materials.lines[cell]

  dance: (time) ->
    for line, i in @lines
      line.material = Materials.lines[(i + floor time / 100) % 8]

