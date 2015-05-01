
# Require

{ id, log, floor } = require \std

{ Base } = require \./base

{ line-materials } = require \../palette


# Helpers

rows-to-cols = (rows) ->
  cols = []
  for y from 0 til rows.0.length
    for x from 0 til rows.length
      cols[][y][x] = rows[x][y]
  return cols


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
      line = new THREE.Line mesh, line-materials[i]
      line.position <<< x: i * grid-size, y: 0
      @lines.push line
      @registration.add line

    @registration.position.x = width / -2 + 0.5 * grid-size

    @add-registration-helper!

  show-beam: (brick) ->
    for line in @lines
      line.material = line-materials[0]

    for row, y in brick.shape
      for cell, x in row
        if cell
          @lines[brick.pos.0 + x].material = line-materials[cell]

  dance: (time) ->
    for line, i in @lines
      line.material = line-materials[(i + floor time / 100) % 8]

