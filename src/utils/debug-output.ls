
# Require

{ id, log, unlines } = require \std

Timer = require \../utils/timer

type-detect = (thing) ->
  if typeof thing isnt \object
    typeof thing
  else if thing.cells?
    \arena
  else if thing.pos?
    \brick
  else if thing.progress?
    \timer
  else
    \object


# Templates

template =

  cell: ->
    if it then "▒▒" else "  "

  score: ->
    JSON.stringify this, null, 2

  brick: ->
    @shape.map (.map template.cell .join ' ') .join "\n        "

  keys: ->
    if @length
      for key-summary in this
        key-summary.key + '-' + key-summary.action + "|"
    else
      "(no change)"

  fps: ->
    fps-color = if @fps >= 55 then \#0f0 else if @fps >= 30 then \#ff0 else \#f00
    """<span style="color:#{ fps-color }">#{@fps}</span>"""

  normal: ->
    """
     meta - #{@metagame-state}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
      fps - #{template.fps.apply this}
     keys - #{template.keys.apply @input-state}

      #{template.dump this, 2}
  """

  timer: ->
    Timer.to-string it

  dump: (obj, depth = 0) ->
    space = (" " * depth +)
    switch type-detect obj
    | \timer => space template.timer obj
    | \string => space obj
    | \number => space obj
    | \arena => void
    | \brick => void
    | otherwise =>
      unlines [ k + ":" + template.dump v, depth + 2 for k, v of obj ]

  menu-items: -> """
    #{ unlines ( for item, ix in @menu-data => template.menu-item.call item, ix, @current-index ) }
  """

  start-menu: -> """
    START MENU
    #{ template.menu-items.apply this }

    #{template.dump this, 2}
  """

  menu-item: (index, current-index) -> """
    #{ if index is current-index then ">" else " " } #{ @text }
  """

  failure: -> """
       GAME OVER

         Score

      Single - #{@score.singles}
      Double - #{@score.doubles}
      Triple - #{@score.triples}
      Tetris - #{@score.tetris}

    Total Lines: #{@score.lines}

    #{ template.menu-items.apply this.game-over }
  """

#
# Debug Output
#
# Shows visualisation of gamestate in some useful way.
# This class conflates it's view layer but meh, it's debug only.
#

export class DebugOutput

  ->
    @dbo = document.create-element \pre
    document.body.append-child @dbo
    @dbo.style <<< position: \absolute, top: 0, left: 0

  render: (state) ->
    switch state.metagame-state
    | \game         => @dbo.innerHTML = template.normal.apply state
    | \failure      => @dbo.innerHTML = template.failure.apply state
    | \start-menu   => @dbo.innerHTML = template.start-menu.apply state.start-menu
    | \remove-lines => @dbo.innerHTML = template.normal.apply state
    | otherwise     => @dbo.innerHTML = "Unknown metagame state: " + state.metagame-state

