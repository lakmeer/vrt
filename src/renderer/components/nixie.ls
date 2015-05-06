
# Require

{ id, sin, lerp, log, floor, map, split, pi, tau } = require \std

Materials = require \../mats

{ Base } = require \./base
{ CapsuleGeometry } = require \../geometry/capsule
{ LED } = require \./led


# Nixie Tube subcomponent

class NixieTube extends Base


  (@opts, gs) ->

    super ...

    # Copy options
    tube-radius = @opts.score-tube-radius
    tube-height = @opts.score-tube-height
    base-radius = @opts.score-base-radius
    base-height = @opts.score-tube-height / 10
    lamp-offset = @opts.score-indicator-offset
    mesh-width  = tube-radius * 1.3
    mesh-height = tube-radius * 2.5

    @mesh-width  = mesh-width
    @mesh-height = mesh-height

    # Create geometry
    bg-geo   = new THREE.PlaneBufferGeometry mesh-width, mesh-height
    base-geo = new THREE.CylinderGeometry base-radius, base-radius, base-height, 6, 0
    base-geo.apply-matrix new THREE.Matrix4!make-rotation-y pi/6

    # State
    @intensity = 0

    # Create components
    @glass = new THREE.Mesh (new THREE.CapsuleGeometry tube-radius, 16, tube-height, 0), Materials.glass
    @base  = new THREE.Mesh base-geo, Materials.copper
    @bg    = new THREE.Mesh bg-geo, Materials.nixie-bg

    @led   = new LED @opts, gs
    @led.position.z = lamp-offset

    @glass.position.y = tube-height
    @bg.position.y = mesh-height/2 + base-height/2

    @digits =
      for i, ix in [ 0 to 9 ]
        quad = @create-digit-quad i, ix
        quad.position.y = mesh-height/2 + base-height/2
        quad.visible = no
        quad.digit = i
        quad.render-order = 0
        @registration.add quad
        quad

    # Lighting
    @light = new THREE.PointLight \orange, 0.3, 0.3
    @light.position.y = @opts.score-tube-height / 2

    @registration.add @glass
    @registration.add @base
    @registration.add @bg
    @registration.add @light
    @registration.add @led.root

  pulse: (t) ->
    if @intensity is 0
      @light.intensity = 0
    else
      @light.intensity = @intensity + 0.1 * sin t

  show-digit: (digit) ->
    @intensity = if digit? then 0.5 else 0
    @digits.map -> it.visible = it.digit is digit
    if digit? then @led.on! else @led.off!

  create-digit-quad: (digit, ix) ->
    geom  = new THREE.PlaneBufferGeometry @mesh-width, @mesh-height
    quad  = new THREE.Mesh geom, Materials.nixie-digits[digit]


# Nixie Display
#
# Consists of multiple nixie tubes

export class NixieDisplay extends Base

  (@opts, gs) ->

    super ...

    offset      = @opts.score-offset-from-centre + @opts.score-base-radius
    margin      = @opts.score-inter-tube-margin
    base-radius = @opts.score-base-radius

    @count = 5

    @state =
      last-seen-number: 0

    @tubes =
      for i from 0 til @count
        tube = new NixieTube @opts, gs
        tube.position.x = margin * i + offset + i * @opts.score-base-radius * 2
        @registration.add tube.root
        tube

    @registration.position.z = -@opts.score-distance-from-edge

  pulse: (t) ->
    @tubes.map (.pulse t)

  run-to-number: (p, num) ->
    next-number = floor lerp @state.last-seen-number, num, p
    @show-number next-number

  set-number: (num) ->
    @state.last-seen-number = num
    @show-number num

  show-number: (num = 0) ->
    # Split incoming numbers
    digits = num |> (.to-string!) |> split '' |> map parse-int _, 10

    # Assign backward till we run out, then show zeroes
    for i from @count - 1 to 0 by -1
      tube = @tubes[i]
      digit = digits.pop!
      tube.show-digit digit

