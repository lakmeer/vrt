
# Require

{ id, log, pi, sin, cos, lerp, rand, floor, map } = require \std
{ Ease } = require \std

THREE = require \three-js-vr-extensions # puts THREE in global scope

{ Palette }                    = require \./palette
{ SceneManager }               = require \./scene-manager
{ DebugCameraPositioner }      = require \./debug-camera

{ Arena, Table, Lighting, BrickPreview, NixieDisplay } = require \./components
{ Topside, Underside } = require \./components

{ TrackballControls } = require \../../lib/trackball-controls.js


#
# Three.js Renderer with VR support
#

export class ThreeJsRenderer
  (@opts, {{ width, height }:arena }: gs) ->
    log "Renderer::new"

    # Setup three.js WebGL renderer with MozVR extensions
    @scene = new SceneManager @opts

    @opts.scene = @scene

    # State
    @state =
      frames-since-rows-removed: 0
      last-seen-state: \no-game

    # Jitter offset object - absorbs jitter movements so they don't disturb camera position
    @scene.add @jitter = new THREE.Object3D

    # Build scene
    @parts =
      table       : new Table        @opts, gs
      lighting    : new Lighting     @opts, gs
      topside     : new Topside      @opts, gs
      underside   : new Underside    @opts, gs


    for name, part of @parts => part.add-to @jitter

    # Controls
    @add-trackball!
    @scene.controls.reset-sensor!

    # Position camera based on user's setting
    #
    # We do this by moving the scene away instead of positioning the camera,
    # because if the VR mode kicks in, VRControls will set the camera position
    # based on the HMD's tracking data, relative to 0,0,0, not to your new pos.
    @scene.registration.position.set 0, -@opts.camera-elevation, -@opts.camera-distance-from-edge * 4

    # Helpers
    @scene.show-helpers!


  set-menu-facing: ->

  set-game-facing: ->

  add-trackball: ->
    trackball-target = new THREE.Object3D
    trackball-target.position.z = -@opts.camera-distance-from-edge
    @scene.add trackball-target
    @trackball = new THREE.TrackballControls @scene.camera, trackball-target
    @trackball.pan-speed = 1

  append-to: (host) ->
    host.append-child @scene.dom-element

  render: (gs) ->
    @trackball.update!
    @scene.update!

    #@scene.registration.position.y = -0.5 + -0.5 * sin gs.elapsed-time / 1000

    # Show/hide different components when metagamestate changes
    if gs.metagame-state isnt @state.last-seen-state
      @parts.topside.toggle-start-menu off
      #@parts.arena.visible      = no
      #@parts.pause-menu.visible = no
      #@parts.fail-screen.visible  = no

      switch gs.metagame-state
      | \remove-lines => fallthrough
      | \game         => @parts.arena.visible       = yes
      | \start-menu   => @parts.topside.toggle-start-menu on
      #| \pause-menu   => @parts.pause-menu.visible  = yes
      #| \failure      => @parts.fail-screen.visible = yes
      | otherwise     => void

    # Update scene based on current metagamestate.
    # Functions which take the scene registration position will change it
    switch gs.metagame-state
    | \no-game =>
      log \no-game

    | \remove-lines =>
      rows = gs.core.rows-to-remove.length
      p = gs.arena.zap-animation.progress
      gs.slowdown = 1 + Ease.exp-in p, 2, 0
      @parts.underside.arena.zap-lines gs, @jitter.position
      @parts.underside.next-brick.update-wiggle gs
      @parts.underside.score.run-to-number gs.arena.zap-animation.progress, gs.score.points
      @parts.underside.score.pulse gs.elapsed-time / 1000

    | \game =>
      gs.slowdown = 1
      @parts.underside.arena.update gs, @jitter.position
      @parts.underside.next-brick.display-shape gs.brick.next
      @parts.underside.next-brick.update-wiggle gs
      @parts.underside.score.set-number gs.score.points
      @parts.underside.score.pulse gs.elapsed-time / 1000

    | \start-menu =>
      @parts.underside.next-brick.display-nothing!
      @parts.topside.update-start-menu gs

    | \pause-menu =>
      @parts.underside.next-brick.display-nothing!
      @parts.pause-menu.update gs

    | \failure =>
      @parts.underside.next-brick.display-nothing!
      @parts.topside.update-fail-screen gs

    | otherwise =>
      log "ThreeJsRenderer::render - Unknown metagamestate:", gs.metagame-state

    # Update particles all the time, cos they're physically simulated
    @parts.underside.arena.update-particles gs

    # Update private state
    @state.last-seen-state = gs.metagame-state

    # Finally, render the scene
    @scene.render!

    # Lighting test
    #@parts.lighting.test gs.elapsed-time

