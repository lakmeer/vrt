
# Require

{ id, log, rand } = require \std
{ random-from } = require \std

Core      = require \./game-core
StartMenu = require \./start-menu
FailMenu  = require \./fail-menu


# Pure Helpers

#
# Tetris Game
#
# Presents the unified interface to the various components of the game
#

export class TetrisGame

  (game-state) ->
    log "TetrisGame::new"

    # Each module should prime it's own chunk of the state
    StartMenu.prime-game-state game-state
    FailMenu.prime-game-state game-state
    # ... and so on, when I get around to it

  begin-new-game: (game-state) ->
    let this = game-state
      Core.clear-arena @arena
      @brick.next        = Core.new-brick!
      @brick.next.pos    = [3 -1]
      @brick.current     = Core.new-brick!
      @brick.current.pos = [3 -1]
      Core.reset-score @score
      @metagame-state    = \game
      @timers.drop-timer.reset!
      @timers.key-repeat-timer.reset!
    return game-state

  advance-removal-animation: ({ timers, animation-state }:gs) ->
    if timers.removal-animation.expired
      Core.remove-rows gs.rows-to-remove, gs.arena
      gs.rows-to-remove = []
      gs.metagame-state = \game

  handle-key-input: ({ brick, arena, input-state }:gs) ->
    while input-state.length
      { key, action } = input-state.shift!
      if action is \down
        switch key
        | \left =>
          if Core.can-move brick.current, [-1, 0 ], arena
            brick.current.pos.0 -= 1
        | \right =>
          if Core.can-move brick.current, [ 1, 0 ], arena
            brick.current.pos.0 += 1
        | \down =>
          #gs.timers.drop-timer.time-to-expiry = 0
          gs.force-down-mode = on
        | \up, \cw =>
          if Core.can-rotate brick.current, 1, arena
            Core.rotate-brick brick.current, 1
        | \ccw =>
          if Core.can-rotate brick.current, -1, arena
            Core.rotate-brick brick.current, -1
        | \hard-drop =>
          gs.hard-drop-distance = 0
          while Core.can-drop brick.current, arena
            gs.hard-drop-distance += 1
            brick.current.pos.1 += 1
          gs.input-state = []
          gs.timers.hard-drop-effect.reset gs.hard-drop-distance * 10
          gs.timers.drop-timer.time-to-expiry = -1
        | \debug-1, \debug-2, \debug-3, \debug-4 =>
          amt = parse-int key.replace /\D/g, ''
          log "DEBUG: Destroying rows:", amt
          gs.rows-to-remove = for i from gs.arena.height - amt to gs.arena.height - 1 => i
          gs.metagame-state = \remove-lines
          gs.flags.rows-removed-this-frame = yes
          gs.timers.removal-animation.reset gs.rows-to-remove.length * 50
        | \debug-5 =>  # Sets up tetris scenario
          pos = gs.brick.current.pos
          gs.brick.current = Core.new-brick 6
          gs.brick.current.pos <<< pos
          for y from (arena.height - 1) to (arena.height - 4) by -1
            for x from 0 to arena.width - 2
              arena.cells[y][x] = 1

      else if action is \up
        switch key
        | \down =>
          gs.force-down-mode = off

  clear-one-frame-flags: (gs) ->
    gs.flags.rows-removed-this-frame = no

  advance-game: ({ brick, arena, input-state }:gs) ->

    # Reset one-frame-only state flags
    #gs.hard-drop-distance = 0

    # Check for completed lines.
    complete-rows = [ ix for row, ix in arena.cells when Core.is-complete row ]

    # If found, flag them for removal and set the animation going
    if complete-rows.length

      # Wait for animation
      gs.metagame-state = \remove-lines
      gs.flags.rows-removed-this-frame = true
      gs.timers.removal-animation.reset complete-rows.length * 100
      gs.rows-to-remove = complete-rows

      # Add any dropped lines to score
      Core.compute-score gs.score, gs.rows-to-remove
      return

    # Check if top has been reached. If so, change game mode to fail
    if Core.top-is-reached arena
      @reveal-fail-screen gs
      return

    # If the game is in force-down mode, drop the brick every frame
    if gs.force-down-mode #and gs.timers.force-drop-wait-timer.expired
      gs.timers.drop-timer.time-to-expiry = 0

    # If the drop-timer has expired, drop current brick.
    if gs.timers.drop-timer.expired
      gs.timers.drop-timer.reset-with-remainder!

      # If it hits, save it to the arena and make a new one
      if Core.can-drop brick.current, arena
        brick.current.pos.1 += 1
      else
        Core.copy-brick-to-arena brick.current, arena
        Core.spawn-new-brick gs
        gs.force-down-mode = off

    #
    # If nothing else going on this frame, THEN handle user input
    #

    @handle-key-input gs

      #if Core.can-drop brick.current, arena
      #  brick.current.pos.1 += 1
      #else
      #  Core.copy-brick-to-arena brick.current, arena
      #  gs.force-down-mode = off
      #  gs.timers.force-drop-wait-timer.reset!
      #  gs.timers.drop-timer.time-to-expiry = gs.timers.force-drop-wait-timer.target-time

  show-start-screen: ({ input-state, start-menu-state }:gs) ->

    # Handle user input
    while input-state.length
      { key, action } = input-state.shift!
      if action is \down
        switch key
        | \up =>
          StartMenu.select-prev-item start-menu-state
        | \down =>
          StartMenu.select-next-item start-menu-state
        | \action-a, \confirm =>
          if start-menu-state.current-state.state is \start-game
            @begin-new-game gs

      else if action is \up
        switch key
        | \down =>
          gs.force-down-mode = off

  reveal-start-screen: ({ timers }:gs) ->
    timers.title-reveal-timer.reset!
    gs.metagame-state = \start-menu

  show-fail-screen: ({ input-state, fail-menu-state }:gs, Δt) ->
    while input-state.length
      { key, action } = input-state.shift!
      if action is \down
        switch key
        | \up =>
          FailMenu.select-prev-item fail-menu-state
        | \down =>
          FailMenu.select-next-item fail-menu-state
        | \action-a, \confirm =>
          log fail-menu-state.current-state.state
          if fail-menu-state.current-state.state is \restart
            @begin-new-game gs
          else if fail-menu-state.current-state.state is \go-back
            @reveal-start-screen gs
        | \action-a, \confirm =>

          @begin-new-game gs

  reveal-fail-screen: (gs) ->
    gs.timers.failure-reveal-timer.reset!
    gs.metagame-state = \failure

  run-frame: ({ metagame-state }:game-state, Δt) ->
    @clear-one-frame-flags game-state
    switch metagame-state
    | \failure     => @show-fail-screen ...
    | \game        => @advance-game ...
    | \no-game     => @reveal-start-screen ...
    | \start-menu  => @show-start-screen ...
    | \remove-lines => @advance-removal-animation ...
    | otherwise => console.debug 'Unknown metagame-state:', metagame-state
    return game-state


# Export

module.exports = { TetrisGame }

