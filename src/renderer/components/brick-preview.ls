
# Require

{ id, log, sin } = require \std

{ Base } = require \./base
{ Brick } = require \./brick


#
# Class
#

export class BrickPreview extends Brick

  pretty-offset =
    square : [0 0]
    zig    : [0.5 0]
    zag    : [0.5 0]
    left   : [0.5 0]
    right  : [0.5 0]
    tee    : [0.5 0]
    tetris : [0 0.5]

  (@opts, gs) ->
    super ...
    s = @opts.preview-scale-factor
    @root.scale.set s, s, s

  display-shape: (brick) ->
    super ...
    grid = @opts.grid-size
    [ x, y ] = pretty-offset[ brick.type ]
    @registration.position.x = (-1.5 + x) * grid
    @registration.position.y = (-1.5 + y + 5) * grid

  update-wiggle: (brick, elapsed-time) ->
    @root.rotation.y = 0.2 * sin elapsed-time / 500

