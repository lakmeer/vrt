
# Require

{ id, log, pi, rand, floor } = require \std

{ Base } = require \./base

Materials = require \../mats


#
# Arena Cells
#

export class ArenaCells extends Base

  ({ block-size, grid-size }:opts, gs) ->

    super ...

    width  = grid-size * gs.arena.width
    height = grid-size * gs.arena.height
    margin = (grid-size - block-size) / 2

    box-geo = new THREE.BoxGeometry block-size, block-size, block-size

    @offset = new THREE.Object3D
    @registration.add @offset

    # Flip and position correctly
    @registration.position <<< x: width/-2 + 0.5 * grid-size, y: height - 0.5 * grid-size
    @registration.rotation.x = pi

    @cells =
      for row, y in gs.arena.cells
        for cell, x in row
          cube = new THREE.Mesh box-geo, Materials.normal
          cube.position.set x * grid-size, y * grid-size, 0
          cube.visible = false
          @offset.add cube
          cube

  toggle-row-of-cells: (row-ix, state) ->
    for box in @cells[row-ix]
      box.material = Materials.zap
      box.visible = state

  show-zap-effect: ({ arena, core }:gs) ->
    on-off = arena.zap-animation.progress < 0.4 and !!((floor arena.zap-animation.current-time * 10) % 2)
    on-off = !((floor arena.zap-animation.current-time) % 2)
    for row-ix in core.rows-to-remove
      @toggle-row-of-cells row-ix, on-off

  fake-zap-line: (row-ix, fade-progress) ->
    max = @opts.game-options.arena-height
    opacity = (1 - row-ix/max) / fade-progress - (1 - row-ix/max)
    opacity *= opacity
    if opacity >= 1 then opacity = 0 else opacity
    if opacity <= 0 then opacity = 0 else opacity
    fade-mat = new THREE.MeshPhongMaterial color: 0xffffff, emissive: 0xffffff, transparent: yes, opacity: opacity

    for box, i in @cells[row-ix]
      box.material = fade-mat
      box.visible = yes
      #box.scale.x = box.scale.y = box.scale.z = 1 + fade-progress /2

  update-cells: (cells) ->
    for row, y in cells
      for cell, x in row
        @cells[y][x].visible = !!cell
        @cells[y][x].material = Materials.blocks[cell]

