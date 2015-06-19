
# Require

{ id, log, rand, random-from } = require \std

Core      = require \./game-core
Arena     = require \./arena
Brick     = require \./brick
Score     = require \./score
StartMenu = require \./start-menu
GameOver  = require \./game-over

Timer     = require \../utils/timer


#
# Tetris Game
#
# Presents the unified interface to the various components of the game
#

export class TetrisGame

  (game-state, game-options) ->
    Core.prime-game-state      game-state, game-options
    Arena.prime-game-state     game-state, game-options
    Brick.prime-game-state     game-state, game-options
    Score.prime-game-state     game-state, game-options
    StartMenu.prime-game-state game-state, game-options
    GameOver.prime-game-state  game-state, game-options

  begin-new-game: (gs) ->
    gs.metagame-state = \game
    Arena.clear-arena gs.arena
    Score.reset-score gs.score
    Brick.reset-state gs.brick
    return gs

  reveal-start-menu: (gs) ->
    gs.metagame-state = \start-menu
    StartMenu.begin-reveal gs

  reveal-game-over: (gs) ->
    gs.metagame-state = \failure
    Timer.reset gs.game-over.reveal-animation

  handle-key-input: ({ brick, arena, input }:gs) ->
    while input.length
      { key, action } = input.shift!

      if action is \down
        switch key

        | \left =>
          if Arena.can-move brick.current, [-1, 0 ], arena
            brick.current.pos.0 -= 1

        | \right =>
          if Arena.can-move brick.current, [ 1, 0 ], arena
            brick.current.pos.0 += 1

        | \down =>
          gs.core.soft-drop-mode = on

        | \up, \cw =>
          if Arena.can-rotate brick.current, 1, arena
            Brick.rotate-brick brick.current, 1

        | \ccw =>
          if Arena.can-rotate brick.current, -1, arena
            Brick.rotate-brick brick.current, -1

        | \hard-drop =>
          gs.core.hard-drop-distance = 0
          while Arena.can-drop brick.current, arena
            gs.core.hard-drop-distance += 1
            brick.current.pos.1 += 1
          gs.input = []
          Timer.reset gs.core.hard-drop-animation, gs.core.hard-drop-distance * 10 + 1 # Don't divide by zero
          Timer.set-time-to-expiry gs.core.drop-timer, -1

        | \debug-1, \debug-2, \debug-3, \debug-4 =>
          amt = parse-int key.replace /\D/g, ''
          log "DEBUG: Destroying rows:", amt
          gs.core.rows-to-remove = for i from gs.arena.height - amt to gs.arena.height - 1 => i
          gs.metagame-state = \remove-lines
          gs.core.rows-removed-this-frame = yes
          Timer.reset gs.arena.zap-animation, Core.animation-time-for-rows gs.core.rows-to-remove
          Score.update-score gs, gs.core.rows-to-remove

        | \debug-5 =>  # Sets up tetris scenario
          pos = gs.brick.current.pos
          gs.brick.current = Brick.new-brick 6
          gs.brick.current.pos <<< pos
          for y from (arena.height - 1) to (arena.height - 4) by -1
            for x from 0 to arena.width - 2
              arena.cells[y][x] = 1

        | \debug-6 =>
          gs.core.rows-to-remove = [ 10, 12, 14 ]
          gs.metagame-state = \remove-lines
          gs.core.rows-removed-this-frame = yes
          Timer.reset gs.arena.zap-animation, Core.animation-time-for-rows gs.core.rows-to-remove

      else if action is \up
        switch key
        | \down =>
          gs.core.soft-drop-mode = off

  clear-one-frame-flags: (gs) ->
    gs.core.rows-removed-this-frame = no

  zap-tick: (gs) ->
    if gs.arena.zap-animation.expired
      Arena.remove-rows gs.arena, gs.core.rows-to-remove
      gs.core.rows-to-remove = []
      gs.metagame-state = \game

  game-tick: ({ brick, arena, input }:gs) ->

    # Check for completed lines.
    complete-rows = [ ix for row, ix in arena.cells when Arena.row-is-complete row ]

    # If found, flag them for removal and set the animation going
    if complete-rows.length

      # Wait for animation
      gs.metagame-state = \remove-lines
      gs.core.rows-removed-this-frame = true
      gs.core.rows-to-remove = complete-rows
      Timer.reset gs.arena.zap-animation, Core.animation-time-for-rows gs.core.rows-to-remove

      # Add any dropped lines to score
      Score.update-score gs, gs.core.rows-to-remove
      return

    # Check if top has been reached. If so, change game mode to fail
    if Arena.top-is-reached arena
      @reveal-game-over gs
      return

    # If the game is in force-down mode, drop the brick every frame
    if gs.core.soft-drop-mode
      Timer.set-time-to-expiry gs.core.drop-timer, 0

    # If the drop-timer has expired, drop current brick.
    if gs.core.drop-timer.expired
      Timer.reset-with-remainder gs.core.drop-timer

      # If it hits, save it to the arena and make a new one
      if Arena.can-drop brick.current, arena
        brick.current.pos.1 += 1
      else
        Arena.copy-brick-to-arena brick.current, arena
        Brick.spawn-new-brick gs
        Timer.reset gs.core.preview-reveal-animation
        gs.core.soft-drop-mode = off

    # If nothing else going on this frame, THEN handle user input
    @handle-key-input gs

  game-over-tick: ({ input, game-over }:gs, Δt) ->
    while input.length
      { key, action } = input.shift!
      if action is \down
        switch key
        | \up =>
          GameOver.select-prev-item game-over
        | \down =>
          GameOver.select-next-item game-over
        | \action-a, \confirm =>
          if game-over.current-state.state is \restart
            @begin-new-game gs
          else if game-over.current-state.state is \go-back
            @reveal-start-menu gs
        | \action-a, \confirm =>

          @begin-new-game gs

  start-menu-tick: ({ input, start-menu }:gs) ->
    while input.length
      { key, action } = input.shift!

      if action is \down
        switch key
        | \up =>
          StartMenu.select-prev-item start-menu
        | \down =>
          StartMenu.select-next-item start-menu
        | \action-a, \confirm =>
          if start-menu.current-state.state is \start-game
            @begin-new-game gs

  update: (gs, { Δt, time, frame, fps, input }) ->
    gs.fps            = fps
    gs.Δt             = Δt
    gs.elapsed-time   = time
    gs.elapsed-frames = frame
    gs.input          = input

    if not gs.core.paused
      Timer.update-all-in gs, Δt

    @clear-one-frame-flags gs

    switch gs.metagame-state
    | \no-game      => @reveal-start-menu ...
    | \game         => @game-tick ...
    | \failure      => @game-over-tick ...
    | \start-menu   => @start-menu-tick ...
    | \remove-lines => @zap-tick ...
    | otherwise => console.debug 'Unknown metagame-state:', gs.metagame-state

    return gs

