
# Require

{ id, log, unlines } = require \std


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

  normal: -> """
    score - #{template.score.apply @score}
    lines - #{@lines}

     meta - #{@metagame-state}
     time - #{@elapsed-time}
    frame - #{@elapsed-frames}
     keys - #{template.keys.apply @input-state}
     drop - #{if @force-down-mode then \soft else \auto}
  """

  menu-items: -> """
    #{ unlines ( for item, ix in @menu-data => template.menu-item.call item, ix, @current-index ) }
  """

  start-menu: -> """
    START MENU
    #{ template.menu-items.apply this }
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

    #{ template.menu-items.apply this.fail-menu-state }
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
    | \start-menu   => @dbo.innerHTML = template.start-menu.apply state.start-menu-state
    | \remove-lines => @dbo.innerHTML = template.normal.apply state
    | otherwise     => @dbo.innerHTML = "Unknown metagame state: " + state.metagame-state
