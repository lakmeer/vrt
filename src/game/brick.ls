
# Require

{ id, log, rand-int, wrap } = require \std

BrickShapes = require \./data/brick-shapes


#
# Brick
#
# Contains brick shapes, offsets, colors and rotation operations. Game core
# will pass a brick object and ask for it to be manipulated, or ask for a new
# brick object.
#

export prime-game-state = (gs, options) ->
  gs.brick =
    next: null
    current: null


#
# Creating new bricks
#

export new-brick = (ix = rand-int 0, BrickShapes.all.length) ->
  pos: [3 -1]
  color: ix
  rotation: 0
  type: BrickShapes.all[ix].type
  shape: BrickShapes.all[ix].shapes.0


#
# Game state mutations
#

export spawn-new-brick = (gs) ->
  gs.brick.current = gs.brick.next
  gs.brick.current.pos = [4 -1]
  gs.brick.next = new-brick!

export reset-state = (brick) ->
  brick.next    = new-brick!
  brick.current = new-brick!


#
# Rotation operations
#

export rotate-brick = (brick, rotation) ->
  brick.rotation = normalise-rotation brick, rotation
  brick.shape = BrickShapes[ brick.type ][ brick.rotation ]

export get-shape-of-rotation = (brick, rotation) ->
  rotation = normalise-rotation brick, rotation
  BrickShapes[ brick.type ][ rotation ]

export normalise-rotation = (brick, rotation) ->
  wrap 0, BrickShapes[ brick.type ].length - 1, brick.rotation + rotation


#
# Debug
#

draw-cell = ->
  if it then "▒▒" else "  "

export draw-brick = (shape) ->
  shape.map (.map draw-cell .join '') .join "\n"

