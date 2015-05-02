
# Require

{ id, log, pi } = require \std

{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Class
#

export class Brick extends Base

  pretty-offset =
    square : [0 0]
    zig    : [0.5 0]
    zag    : [0.5 0]
    left   : [0.5 0]
    right  : [0.5 0]
    tee    : [0.5 0]
    tetris : [0 -0.5]


  (@opts, gs) ->
    super ...

    size = @opts.block-size
    grid = @opts.grid-size

    width  = grid * gs.arena.width
    height = grid * gs.arena.height

    @geom.brick-box = new THREE.BoxGeometry size, size, size

    @registration.rotation.x = pi
    @registration.position.set width/-2 + 0.5 * grid, height - 0.5 * grid, 0

    @brick = new THREE.Object3D
    @registration.add @brick

    @add-registration-helper!

    @cells =
      for i from 0 to 3
        cube = new THREE.Mesh @geom.brick-box, @mats.normal
        @brick.add cube
        cube.cast-shadow = yes
        cube

  display-shape: ({ shape }, ix = 0) ->
    grid   = @opts.grid-size
    margin = (@opts.grid-size - @opts.block-size) / 2

    for row, y in shape
      for cell, x in row when cell
        @cells[ix]
          ..material = mesh-materials[cell]
          ..position.set x * grid + margin, y * grid + margin, 0
        ix += 1

  update-pos: ([ x, y ]) ->
    grid = @opts.grid-size
    @brick.position.set grid * x, grid * y, 0

