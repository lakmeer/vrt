
# Require

{ id, log, sin } = require \std

{ Base  } = require \./base
{ Brick } = require \./brick


#
# Class
#

export class FallingBrick extends Base

  (@opts, gs) ->
    super ...

    @grid   = opts.grid-size
    @height = @grid * gs.arena.height

    @brick = new Brick @opts, gs

    @registration.add @brick.root
    @registration.position.x = -3 * @grid
    @registration.position.y = -1.5 * @grid

  display-shape: (brick) ->
    @brick.display-shape brick

  update-position: ([x, y]:pos) ->
    @root.position.set @grid * x, @height - @grid * y, 0

