
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

    { width, height } = gs.arena

    @geom.brick-box = new THREE.BoxGeometry 0.9, 0.9, 0.9

    @registration.rotation.x = pi
    @registration.position <<< x: width/-2 + 0.5, y: height - 0.5

    @brick = new THREE.Object3D
    @registration.add @brick

    @cells =
      for i from 0 to 3
        cube = new THREE.Mesh @geom.brick-box, @mats.normal
        @brick.add cube
        cube.cast-shadow = yes
        cube

  display-shape: ({ shape }, ix = 0) ->
    for row, y in shape
      for cell, x in row
        if cell
          @cells[ix]
            ..material = mesh-materials[cell]
            ..position <<< { x, y }
          ix += 1

  update-pos: ([ x, y ]) ->
    @brick.position <<< { x, y }

