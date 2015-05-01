
# Require

{ id, log, add-v2, rand-int, wrap, random-from } = require \std

BrickShapes = require \./data/brick-shapes


#
# Game Core
#
# Contains main logic for doing operations inside the tetris game itself. Other
# stuff like menus and things don't go in here.
#
# Ideally this should just be a collection of stateless processing functions.
#

export can-drop = (brick, arena) ->
  can-move brick, [0 1], arena

export can-move = (brick, move, arena) ->
  new-pos = add-v2 brick.pos, move
  collides new-pos, brick.shape, arena

export can-rotate = (brick, dir, arena) ->
  new-shape = get-shape-of-rotation brick, brick.rotation + dir
  collides brick.pos, new-shape, arena

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

        # Skip if y < 0
        if v >= 0

          # Check boundaries of arena
          if v >= height or
             u >= width or
             u < 0 or
             cells[v][u]
            return false

  return true

export copy-brick-to-arena = ({ pos, shape }, { cells }) ->
  for v, y in [ pos.1 til pos.1 + shape.length ]
    for u, x in [ pos.0 til pos.0 + shape.0.length ]
      # Don't copy if brick's cell has landed out of bounds
      if shape[y][x] and v >= 0
        cells[v][u] = shape[y][x]

export top-is-reached = ({ cells }) ->
  for cell in cells.0
    if cell
      return true
  return false

export is-complete = (row) ->
  for cell in row
    if not cell
      return false
  return true

export new-brick = (ix = rand-int 0, BrickShapes.all.length) ->
  rotation: 0
  shape: BrickShapes.all[ix].shapes.0
  type: BrickShapes.all[ix].type
  pos: [0 0]

export spawn-new-brick = (gs) ->
  gs.brick.current = gs.brick.next
  gs.brick.current.pos = [4 -1]
  gs.brick.next = new-brick!

export drop-arena-row = ({ cells }, row-ix) ->
  cells.splice row-ix, 1
  cells.unshift [ 0 ] * cells.0.length

export remove-rows = (rows, arena) ->
  for row-ix in rows
    drop-arena-row arena, row-ix

export clear-arena = (arena) ->
  for row in arena.cells
    for cell, i in row
      row[i] = 0

export get-shape-of-rotation = (brick, rotation) ->
  rotation = normalise-rotation brick, rotation
  BrickShapes[ brick.type ][ rotation ]

export normalise-rotation = ({ type }, rotation) ->
  # rotation % BrickShapes[ type ].length
  wrap 0, BrickShapes[ type ].length - 1, rotation

export rotate-brick = ({ rotation, type }:brick, dir) ->
  brick.rotation = normalise-rotation brick, brick.rotation + dir
  brick.shape = get-shape-of-rotation brick, brick.rotation

export compute-score = (score, rows, lvl = 0) ->
  # TODO: multiply by current level
  # TODO: soft-drop bonus
  # TODO: clear arena bonus
  switch rows.length
  | 1 =>
    score.singles += 1
    score.points  += 40 * (lvl + 1)
  | 2 =>
    score.doubles += 1
    score.points  += 100 * (lvl + 1)
  | 3 =>
    score.triples += 1
    score.points  += 300 * (lvl + 1)
  | 4 =>
    score.tetris  += 1
    score.points  += 1200 * (lvl + 1)

  score.lines += rows.length

export reset-score = (score) ->
  score <<< do
    points: 0
    lines: 0
    singles: 0
    doubles: 0
    triples: 0
    tetris: 0

