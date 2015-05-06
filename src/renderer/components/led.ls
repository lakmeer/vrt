
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
      off: new THREE.MeshPhongMaterial do
        color: 0x440000
        specular: \red
        shininess: 1

      on: new THREE.MeshPhongMaterial do
        color: \red
        specular: \black
        shininess: 100

    @bulb  = new THREE.Mesh half-sphere, @mats.off
    @light = new THREE.PointLight \red, 0, 0.1

    @registration.add @bulb
    @registration.add @light

  set-color: (color) ->
    @bulb.material.color = color
    @light.color = color

  on: ->
    @bulb.material = @mats.on
    @light.intensity = 1

  off: ->
    @bulb.material = @mats.off
    @light.intensity = 0

