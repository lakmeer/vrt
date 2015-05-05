
# Require

{ id, log, pi, sin, cos, min, max } = require \std

{ Ease } = require \std
{ Base } = require \./base

Materials = require \../mats


#
# Text shapes
#


block-text =
  tetris:
    * [ 1 1 1 2 2 2 3 3 3 4 4 0 5 6 6 6 ]
    * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 6 0 0 ]
    * [ 0 1 0 2 2 0 0 3 0 4 4 0 5 6 6 6 ]
    * [ 0 1 0 2 0 0 0 3 0 4 0 4 5 0 0 6 ]
    * [ 0 1 0 2 2 2 0 3 0 4 0 4 5 6 6 6 ]
  vrt:
    * [ 1 0 1 4 4 6 6 6 ]
    * [ 1 0 1 4 0 4 6 0 ]
    * [ 1 0 1 4 4 0 6 0 ]
    * [ 1 0 1 4 0 4 6 0 ]
    * [ 0 1 0 4 0 4 6 0 ]
  ghost:
    * [ 1 1 1 2 0 2 3 3 3 4 4 4 5 5 5 ]
    * [ 1 0 0 2 0 2 3 0 3 4 0 0 0 5 0 ]
    * [ 1 0 0 2 2 2 3 0 3 4 4 4 0 5 0 ]
    * [ 1 0 1 2 0 2 3 0 3 0 0 4 0 5 0 ]
    * [ 1 1 1 2 0 2 3 3 3 4 4 4 0 5 0 ]


#
# Title
#

export class Title extends Base

  ({ block-size, grid-size }:opts, gs) ->
    super ...

    text   = block-text.vrt
    margin = (grid-size - block-size) / 2
    height = grid-size * gs.arena.height

    # State
    @height = height

    # Create object host for word blocks
    @registration.add @word = new THREE.Object3D
    @word.position.x = (text.0.length - 1) * grid-size/-2
    @word.position.y = height/-2 - (text.length - 1) * grid-size/-2
    @word.position.z = grid-size/2

    # Create blocks to spell words
    block-geo = new THREE.BoxGeometry block-size, block-size, block-size

    for row, y in text
      for cell, x in row
        if cell
          box = new THREE.Mesh block-geo, Materials.blocks[cell]
          box.position.set grid-size * x + margin, grid-size * (text.length/2 - y) + margin, grid-size/-2
          @word.add box

    # Bounding box visualiser
    bbox = new THREE.BoundingBoxHelper @word, 0xff0000
    bbox.update!
    #@registration.add bbox

  reveal: (progress) ->
    p = (min 1, progress)
    @registration.position.y = Ease.quint-out p, @height * 2, @height
    @registration.rotation.y = Ease.exp-out p, 30, 0
    @registration.rotation.x = Ease.exp-out p, -pi/10, 0

  dance: (time) ->
    @registration.rotation.y = -pi/2 + time / 1000
    @word.opacity = 0.5 + 0.5 * sin + time / 1000

