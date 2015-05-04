
# Require

{ id, log, pi, rand, floor } = require \std

{ Base } = require \./base

{ mesh-materials } = require \../palette


#
# Arena Cells
#

export class ArenaCells extends Base

  ({ block-size, grid-size }:opts, gs) ->

    super ...

    width  = grid-size * gs.arena.width
    height = grid-size * gs.arena.height

    @geom.box = new THREE.BoxGeometry block-size, block-size, block-size
    @mats.zap = new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff

    @offset = new THREE.Object3D
    @registration.add @offset

    # Flip and position correctly
    @registration.position <<< x: width/-2 + 0.5 * grid-size, y: height - 0.5 * grid-size
    @registration.rotation.x = pi

    @cells =
      for row, y in gs.arena.cells
        for cell, x in row
          cube = new THREE.Mesh @geom.box, @mats.normal
          cube.position.set x * grid-size, y * grid-size, 0
          cube.visible = false
          @offset.add cube
          cube

  toggle-row-of-cells: (row-ix, state) ->
    for box in @cells[row-ix]
      box.material = @mats.zap
      box.visible = state

  show-zap-effect: ({ arena, rows-to-remove, timers }:gs) ->
    on-off = timers.removal-animation.progress < 0.4 and !!((floor timers.removal-animation.current-time * 10) % 2)
    on-off = !((floor timers.removal-animation.current-time) % 2)
    for row-ix in rows-to-remove
      @toggle-row-of-cells row-ix, on-off

  update-cells: (cells) ->
    for row, y in cells
      for cell, x in row
        @cells[y][x].visible = !!cell
        @cells[y][x].material = mesh-materials[cell]

