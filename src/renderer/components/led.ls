
# Require

{ id, sin, lerp, log, floor, map, split, pi, tau } = require \std

{ Base } = require \./base
Materials = require \../mats



# Nixie Tube subcomponent

export class LED extends Base

  half-sphere = new THREE.SphereGeometry 0.01, 8, 8

  (@opts, gs) ->
    super ...

    @mats =
      off: Materials.glass
      on: new THREE.MeshPhongMaterial do
        color: 0xfbb03b
        blending: THREE.AdditiveBlending
        emissive: 0xfbb0bb
        specular: \white
        shininess: 100

    @bulb  = new THREE.Mesh half-sphere, @mats.off
    @light = new THREE.PointLight 0xfbb03b, 0, 0.1

    @light.position.y = 0.02

    @registration.add @bulb
    @registration.add @light

  set-color: (color) ->
    @bulb.material.color = color
    @light.color = color

  on: ->
    @bulb.material = @mats.on
    @light.intensity = 0.3

  off: ->
    @bulb.material = @mats.off
    @light.intensity = 0

