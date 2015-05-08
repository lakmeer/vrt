

# Require

{ id, log, add-v2, rand-int, wrap, random-from } = require \std

BrickShapes = require \./data/brick-shapes


#
# Score
#
# Contains scoring logic. Game core will tell us which lines were removed and
# the current game settings and this module will calculate and store the score.
#

export prime-game-state = (gs, options) ->
  gs.score =
    points: 0
    lines: 0
    singles: 0
    doubles: 0
    triples: 0
    tetris: 0


#
# Points computations
#

export compute-score = (rows, lvl = 0) ->

  # TODO: multiply by current level
  # TODO: soft-drop bonus
  # TODO: clear arena bonus

  switch rows.length
  | 1 => 40   * (lvl + 1)
  | 2 => 100  * (lvl + 1)
  | 3 => 300  * (lvl + 1)
  | 4 => 1200 * (lvl + 1)


#
# Score mutations
#

export update-score = ({ score }, row-length, points) ->
  score.points += points
  score.lines  += rows.length

  switch row-length
  | 1 => score.singles += 1
  | 2 => score.doubles += 1
  | 3 => score.triples += 1
  | 4 => score.tetris  += 1

export reset-score = (score) ->
  score <<< do
    points: 0
    lines: 0
    singles: 0
    doubles: 0
    triples: 0
    tetris: 0

