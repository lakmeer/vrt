
# Require

{ id, log, pi, rand, floor } = require \std

{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Arena Cells
#

export class ArenaCells extends Base

  (@opts, gs) ->

    super ...

    { width, height } = gs.arena

    @geom.box = new THREE.BoxGeometry 0.9, 0.9, 0.9
    @mats.zap = new THREE.MeshLambertMaterial color: 0xffffff, emissive: 0x999999

    @offset = new THREE.Object3D
    @registration.add @offset

    # Flip and position correctly
    @registration.position <<< x: width/-2 + 0.5, y: height - 0.5
    @registration.rotation.x = pi

    @cells =
      for row, y in gs.arena.cells
        for cell, x in row
          cube = new THREE.Mesh @geom.box, @mats.normal
          cube.position <<< { x, y }
          cube.visible = false
          @offset.add cube
          cube

  toggle-row-of-cells: (row-ix, state) ->
    for box in @cells[row-ix]
      box.material = @mats.zap
      box.visible = state

  show-zap-effect: (jolt, { arena, rows-to-remove, timers }:gs) ->
    on-off = !!((floor timers.removal-animation.current-time) % 2)
    for row-ix in rows-to-remove
      @toggle-row-of-cells row-ix, on-off

  update-cells: (cells) ->
    for row, y in cells
      for cell, x in row
        @cells[y][x].visible = !!cell
        @cells[y][x].material = mesh-materials[cell]

