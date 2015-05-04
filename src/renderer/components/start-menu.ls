
{ id, log, sin, cos } = require \std

{ Base }  = require \./base
{ Title } = require \./title

#
# Start Menu
#
# Show list of options and their selection state
#

canvas-texture = do ->

  texture-size = 1024
  fidelity-factor = 100

  text-cnv = document.create-element \canvas
  img-cnv  = document.create-element \canvas
  text-ctx = text-cnv.get-context \2d
  img-ctx  = img-cnv.get-context \2d

  img-cnv.width = img-cnv.height = texture-size

  ({ width, height, text, text-size = 10 }) ->
    text-cnv.width  = width  * fidelity-factor
    text-cnv.height = height * fidelity-factor

    text-ctx.text-align    = \center
    text-ctx.text-baseline = \middle
    text-ctx.fill-style    = \white
    text-ctx.font          = "#{text-size * fidelity-factor}px monospace"

    text-ctx.fill-text text, width * fidelity-factor/2, height * fidelity-factor/2, width * fidelity-factor
    img-ctx.clear-rect 0, 0, texture-size, texture-size
    img-ctx.fill-rect 0, 0, texture-size, texture-size
    img-ctx.draw-image text-cnv, 0, 0, texture-size, texture-size
    return img-cnv.to-data-URL!


export class StartMenu extends Base

  (@opts, gs) ->
    super ...

    @options = []

    # Create menu options
    for option, ix in gs.start-menu-state.menu-data
      quad = @create-option-quad option, ix
      quad.position.y = 0.5 - ix * 0.2
      @options.push quad
      @registration.add quad

    # Add title subcomponent
    @title = new Title @opts, gs
    @title.add-to @registration

    # Move into position on table
    @registration.position.z = -1 * (@opts.camera-distance-from-edge + @opts.arena-distance-from-edge + @opts.block-size/2)

  create-option-quad: (option, ix) ->
    image = canvas-texture text: option.text, width: 60, height: 10
    tex   = THREE.ImageUtils.load-texture image
    geom  = new THREE.PlaneBufferGeometry 1, 0.2
    mat   = new THREE.MeshPhongMaterial map: tex, alpha-map: tex, transparent: yes
    quad  = new THREE.Mesh geom, mat

  update: ({{ title-reveal-timer }:timers }:gs) ->
    @title.reveal title-reveal-timer.progress
    @update-selection gs.start-menu-state, gs.elapsed-time

  update-selection: (state, time) ->
    for quad, ix in @options when ix is state.current-index
      quad.scale.x = 1 + 0.05 *  sin time / 300
      quad.scale.y = 1 + 0.05 * -sin time / 300

