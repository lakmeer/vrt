
# Require

{ id, lerp, log, floor, map, split, pi, tau } = require \std

{ Base } = require \./base


# Temporary Dynamic Text Texturing

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


# Nixie Tube subcomponent

class NixieTube extends Base

  tube-radius = 0.0125
  tube-height = 0.05
  base-height = 0.01

  (@opts, gs) ->

    super ...

    @sphere = new THREE.Mesh (new THREE.SphereGeometry tube-radius, 32, 32, 0, pi), new THREE.MeshPhongMaterial do
      color: 0x222222
      transparent: true
      specular: 0xffffff
      shininess: 100
      opacity: 0.1
      #blending: THREE.AdditiveBlending
      side: THREE.DoubleSided
      depth-write: no

    base-geo = new THREE.CylinderGeometry tube-radius * 1.1, tube-radius * 1.1, base-height, 32, 0
    base-mat = new THREE.MeshPhongMaterial color: \grey, specular: \white, shininess: 30

    @base = new THREE.Mesh base-geo, base-mat
    @registration.add @base

    @sphere.render-order = 0
    @registration.add @sphere

    @digits =
      for i, ix in [ 0 to 9 ]
        quad = @create-digit-quad i, ix
        quad.position.y = tube-height/2
        quad.visible = no
        quad.digit = i
        quad.render-order = 0
        @registration.add quad
        quad

  show-digit: (digit) ->
    @digits.map -> it.visible = it.digit is digit

  create-digit-quad: (digit, ix) ->
    image = canvas-texture text: String(digit), width: 50, height: 100, text-size: 100
    tex   = THREE.ImageUtils.load-texture image
    geom  = new THREE.PlaneBufferGeometry 0.025, 0.05
    mat   = new THREE.MeshPhongMaterial map: tex, alpha-map: tex, transparent: yes, emissive: 0xff9944
    quad  = new THREE.Mesh geom, mat



# Nixie Display
#
# Consists of multiple nixie tubes

export class NixieDisplay extends Base

  (@opts, gs) ->

    super ...

    @count = 5
    @state =
      last-seen-number: 0

    @tubes =
      for i from 0 til @count
        tube = new NixieTube @opts, gs
        tube.position.x = i * @opts.block-size
        @registration.add tube.root
        tube

    @registration.position.z = -@opts.score-distance-from-edge

  run-to-number: (p, num) ->
    next-number = floor lerp @state.last-seen-number, num, p
    @show-number next-number
    if p is 1 then @state.last-seen-number = next-number

  show-number: (num = 0) ->
    # Split incoming numbers
    digits = num |> (.to-string!) |> split '' |> map parse-int _, 10

    # Assign backward till we run out, then show zeroes
    for i from @count - 1 to 0 by -1
      tube = @tubes[i]
      digit = digits.pop!
      tube.show-digit digit

