
# Require

{ id, log, pi, sin, cos, lerp, rand, floor, map } = require \std
{ Ease } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ Palette }                    = require \./palette
{ SceneManager }               = require \./scene-manager
{ DebugCameraPositioner }      = require \./debug-camera

{ Arena, Table, StartMenu, FailScreen, Lighting, BrickPreview } = require \./components

{ TrackballControls } = require \../../lib/trackball-controls.js


#
# Three.js Renderer with VR support
#

export class ThreeJsRenderer
  (@opts, {{ width, height }:arena }: gs) ->
    log "Renderer::new"

    # Setup three.js WebGL renderer with MozVR extensions
    @scene = new SceneManager @opts

    # State
    @state =
      frames-since-rows-removed: 0
      last-seen-state: \no-game

    # Build scene
    @parts =
      table       : new Table        @opts, gs
      lighting    : new Lighting     @opts, gs
      arena       : new Arena        @opts, gs
      start-menu  : new StartMenu    @opts, gs
      fail-screen : new FailScreen   @opts, gs
      next-brick  : new BrickPreview @opts, gs

    for name, part of @parts => @scene.add part

    # Arrangement of scene components
    @parts.next-brick.root.position.set 0, 0, -@opts.camera-distance-from-edge

    # Trackball
    trackball-target = new THREE.Object3D
    @scene.add trackball-target
    trackball-target.position.z = -@opts.camera-distance-from-edge
    @trackball = new THREE.TrackballControls @scene.camera, trackball-target

    # Reset VR Controls
    @scene.controls.reset-sensor!

    # Position camera based on user's setting
    #
    # We do this by moving the scene away instead of positioning the camera,
    # because if the VR mode kicks in, VRControls will set the camera position
    # based on the HMD's tracking data, relative to 0,0,0, not to your new pos.
    @scene.root.position.set 0, -@opts.camera-elevation, -@opts.camera-distance-from-edge * 2

    # Helpers
    @scene.show-helpers!

    #@scene.camera.position.z = -0.7

    # Test

    return
    i = 0
    make-cube = (map, s = 0.2, color = 0x441122) ->
      geo = new THREE.CubeGeometry s, s, s
      mat = new THREE.MeshPhongMaterial do
        metal: no
        color: color
        specular: color
        shininess: 100 #50 + i * 50
        normal-map: THREE.ImageUtils.load-texture "../assets/#map"
        normal-scale: new THREE.Vector2 1, 1
      i += 1
      new THREE.Mesh geo, mat

    @scene.add @cube-a = make-cube \tile.nrm.png
    @scene.add @cube-b = make-cube \tile.nrm.png

    @cube-a.position.set -0.2, 0.5, -0.6
    @cube-b.position.set  0.2, 0.5, -0.6

  append-to: (host) ->
    host.append-child @scene.dom-element

  render: (gs) ->
    @trackball.update!
    @scene.update!

    #@scene.registration.position.z = -0.5 + -0.5 * sin gs.elapsed-time / 100

    # Show/hide different components when metagamestate changes
    if gs.metagame-state isnt @state.last-seen-state
      @parts.start-menu.visible = no
      @parts.arena.visible      = no
      #@parts.pause-menu.visible = no
      #@parts.fail-screen.visible  = no

      switch gs.metagame-state
      | \remove-lines => fallthrough
      | \game         => @parts.arena.visible       = yes
      | \start-menu   => @parts.start-menu.visible  = yes
      #| \pause-menu   => @parts.pause-menu.visible  = yes
      #| \failure      => @parts.fail-screen.visible = yes
      | otherwise     => void

    # Update scene based on current metagamestate.
    # Functions which take the scene registration position will change it
    switch gs.metagame-state
    | \no-game =>
      log \no-game

    | \remove-lines =>
      rows = gs.rows-to-remove.length
      p = gs.timers.removal-animation.progress
      gs.slowdown = 1 + Ease.quint-in p, 2 ** rows, 0
      @parts.arena.zap-lines gs, @scene.registration.position

    | \game =>
      gs.slowdown = 1
      @parts.arena.update    gs, @scene.registration.position
      @parts.next-brick.display-shape gs.brick.next
      @parts.next-brick.update-wiggle gs, gs.elapsed-time

    | \start-menu =>
      @parts.start-menu.update gs

    | \pause-menu =>
      @parts.pause-menu.update gs

    | \failure =>
      @parts.fail-screen.update gs

    | otherwise =>
      log "ThreeJsRenderer::render - Unknown metagamestate:", gs.metagame-state

    # Update particles all the time, cos they're physically simulated
    @parts.arena.update-particles gs

    # Update private state
    @state.last-seen-state = gs.metagame-state

    # Finally, render the scene
    @scene.render!

    # Test
    #@cube-a.rotation.y = gs.elapsed-time / 5000
    #@cube-a.rotation.x = gs.elapsed-time / 10000
    #@cube-b.rotation.y = gs.elapsed-time / 5000
    #@cube-b.rotation.x = gs.elapsed-time / 10000

    # Lighting test
    #@parts.lighting.root.position.x = 0.5 * sin gs.elapsed-time / 100
    #@parts.lighting.root.position.y = 0.5 * cos gs.elapsed-time / 100

