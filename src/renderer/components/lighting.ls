
# Require

{ id, log, pi, sin, cos } = require \std

{ Base } = require \./base


#
# Class
#

export class Lighting extends Base

  main-light-distance = 2m

  (@opts, gs) ->
    super ...

    @light = new THREE.PointLight 0xffffff, 1, main-light-distance
    @light.position.set 0, 1.4, 1
    @registration.add @light

    @spotlight = new THREE.SpotLight 0xffffff, 1, 50, 1
    @spotlight.position.set 0, 3, -1
    @spotlight.target.position.set 0, 0, -1
    @registration.add @spotlight

    @ambient = new THREE.AmbientLight 0x666666
    @registration.add @ambient

    # Shadows
    @spotlight.cast-shadow = yes

    #@spotlight.shadow-darkness = 0.5
    @spotlight.shadow.bias = 0.0001
    @spotlight.shadow.map-size.width = 1024
    @spotlight.shadow.map-size.height = 1024

    #@spotlight.shadow-camera-visible = yes
    @spotlight.shadow.camera.near = 10
    @spotlight.shadow.camera.far = 2500
    @spotlight.shadow.camera.fov = 50

  show-helpers: ->
    @registration.add new THREE.PointLightHelper @light, main-light-distance
    @registration.add new THREE.SpotLightHelper @spotlight

  test: (time) ->
    @registration.position.x = 1.0 * sin time / 500
    @registration.position.y = 0.5 * cos time / 500

