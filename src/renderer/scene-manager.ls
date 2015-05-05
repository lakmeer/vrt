
# Require

{ id, log } = require \std

THREE     = require \three-js-vr-extensions # puts THREE in global scope
Materials = require \./mats


#
# Scene Manager
#
# Handles three.js scene, camera, and vr management, exposes only relevant bits
#

export class SceneManager

  helper-marker-size = 0.02m
  helper-marker-opacity = 0.3
  helper-marker-geo = new THREE.CubeGeometry helper-marker-size, helper-marker-size, helper-marker-size

  (@opts) ->

    aspect = window.inner-width / window.inner-height

    # Create a three.js scene
    @renderer = new THREE.WebGLRenderer antialias: true
    @scene    = new THREE.Scene!
    @camera   = new THREE.PerspectiveCamera 75, aspect, 0.001, 1000
    @controls = new THREE.VRControls @camera

    @root         = new THREE.Object3D
    @registration = new THREE.Object3D

    # Apply VR stereo rendering to renderer
    @effect = new THREE.VREffect @renderer
    @effect.setSize window.innerWidth - 1, window.innerHeight - 1

    # Bind listeners
    window.addEventListener \keydown, @zero-sensor, true
    window.addEventListener \resize, @resize, false
    document.body.addEventListener \dblclick, @go-fullscreen

    # State
    @state = vr-mode: navigator.getVRDevices?

    # Heirarchy
    @scene.add @root
    @root.add @registration


  add-registration-helper: ->
    @root.add         new THREE.Mesh helper-marker-geo, Materials.helper-a
    @registration.add new THREE.Mesh helper-marker-geo, Materials.helper-b

  show-helpers: ->
    grid      = new THREE.GridHelper 10, 0.1
    axis      = new THREE.AxisHelper 1
    root-axis = new THREE.AxisHelper 0.5
    axis.position.z = @registration.position.z
    root-axis.position.z = @root.position.z
    #@registration.add axis, root-axis

  enable-shadow-casting: ->
    @renderer.shadow-map-soft     = yes
    @renderer.shadow-map-enabled  = yes
    @renderer.shadow-camera-far   = 1000
    @renderer.shadow-camera-fov   = 50
    @renderer.shadow-camera-near  = 3
    @renderer.shadow-map-bias     = 0.0039
    @renderer.shadow-map-width    = 1024
    @renderer.shadow-map-height   = 1024
    @renderer.shadow-map-darkness = 0.5

  go-fullscreen: ~>
    log 'Starting fullscreen...'
    @effect.set-full-screen yes

  zero-sensor: ({ key-code }:event) ~>
    event.prevent-default!
    if key-code is 86 then @controls.reset-sensor!

  resize: ~>
    @camera.aspect = window.innerWidth / window.innerHeight
    @camera.updateProjectionMatrix!
    @effect.setSize window.innerWidth, window.innerHeight

  update: ->
    @controls.update!

  render: ->
    @effect.render @scene, @camera

  dom-element:~
    -> @renderer.dom-element

  add: ->
    for obj in arguments
      log 'SceneManager::add -', obj
      @registration.add if obj.root? then that else obj

