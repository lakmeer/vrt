
# Require

{ id, log, div, pi } = require \std

{ Base } = require \./base

Materials = require \../mats


#
# Class
#

export class Brick extends Base

  pretty-offset =
    square : [-2 -2]
    zig    : [-1.5 -2]
    zag    : [-1.5 -2]
    left   : [-1.5 -2]
    right  : [-1.5 -2]
    tee    : [-1.5 -2]
    tetris : [-2 -2.5]

  (@opts, gs) ->
    super ...

    size = @opts.block-size
    grid = @opts.grid-size

    @brick = new THREE.Object3D
    @frame = new THREE.Mesh (new THREE.BoxGeometry 4 * grid, 4 * grid, grid), Materials.debug-wireframe

    block-geo = new THREE.BoxGeometry size, size, size

    @cells =
      for i from 0 to 3
        cube = new THREE.Mesh block-geo, Materials.normal
        cube.visible = no
        @brick.add cube
        cube

    @registration.position.set 0 * grid, -0.5 * grid, 0
    @registration.rotation.x = pi

    @registration.add @brick
    #@registration.add @frame

  pretty-display-shape: (brick) ->
    @display-shape brick, yes

  display-shape: ({ shape, type }, pretty = false) ->
    ix     = 0
    grid   = @opts.grid-size
    margin = (@opts.grid-size - @opts.block-size) / 2
    offset = if pretty then pretty-offset[type] else [-2,-2]

    for row, y in shape
      for cell, x in row when cell
        @cells[ix++]
          ..position.x = (offset.0 + 0.5 + x) * grid + margin
          ..position.y = (offset.1 + 0.5 + y) * grid + margin
          ..material = Materials.blocks[cell]
          ..visible = yes

