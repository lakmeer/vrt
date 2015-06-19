
# Require

{ id, log, add-v2, rand-int, wrap, random-from } = require \std

Brick     = require \./brick
Timer = require \../utils/timer


#
# Arena
#
# Contains arena cells, row annihilation logic, and collision logic for unmerged
# brick objects. Game core will pass arena state and probably an unmerged brick
# and ask about collision or annihilation.
#

export prime-game-state = (gs, options) ->
  gs.arena =
    cells: new-arena options.arena-width, options.arena-height
    width: options.arena-width
    height: options.arena-height
    zap-animation: Timer.create "Zap Animation", options.zap-animation-time
    jolt-animation: Timer.create "Jolt Animation", options.jolt-animation-time


#
# Arena mutations
#

export new-arena = (width, height) ->
  for row til height => for cell til width => 0

export copy-brick-to-arena = ({ pos, shape }, { cells }) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      # Don't copy if brick's cell has landed out of bounds
      if shape[y][x] and v >= 0
        cells[v][u] = shape[y][x]

export drop-row = ({ cells }, row-ix) ->
  cells.splice row-ix, 1
  cells.unshift [ 0 ] * cells.0.length

export remove-rows = (arena, rows) ->
  for row-ix in rows
    drop-row arena, row-ix

export clear-arena = (arena) ->
  for row in arena.cells
    for cell, i in row
      row[i] = 0


#
# Arena state queries
#

export top-is-reached = (arena) ->
  for cell in arena.cells.0
    if cell
      return true
  return false

export row-is-complete = (row) ->
  for cell in row
    if not cell
      return false
  return true


#
# Brick collision queries
#

export collides = (pos, shape, { cells, width, height }) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      # We only collide with regard to shape-cells which are actually full
      if shape[y][x] > 0

        # Shooting off the top of the arena is allowed, plus we know it's
        # not gonna collide with anything. So if we have a shape with a
        # filled cell at y = -1, we can skip the check for this cell. There
        # won't be *NO* cells not inside the arena to check for other kinds
        # of collisions.

        # TODO: Nope, this is actually wrong. Poking off the top can allow
        # for errors with L-shaped block, if the leg corner is above the top
        # of the arena, it can be moved outside of the edge of the arena. On
        # next drop timer, it will fall into an illegal position. To fix.

        # Skip if y < 0
        if v >= 0

          # Check boundaries of arena
          if v >= height or
             u >= width or
             u < 0 or
             cells[v][u]
            return false

  return true

export can-move = (brick, move, arena) ->
  new-pos = add-v2 brick.pos, move
  collides new-pos, brick.shape, arena

export can-drop = (brick, arena) ->
  can-move brick, [0 1], arena

export can-rotate = (brick, rotation, arena) ->
  new-shape = Brick.get-shape-of-rotation brick, rotation
  collides brick.pos, new-shape, arena

