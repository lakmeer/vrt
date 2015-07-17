
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
    @jitter.add @pivot = new THREE.Object3D

    # Build scene
    @parts =
      table     : new Table     @opts, gs
      lighting  : new Lighting  @opts, gs
      topside   : new Topside   @opts, gs
      underside : new Underside @opts, gs

    @parts.table.add-to     @pivot
    @parts.topside.add-to   @pivot
    @parts.underside.add-to @pivot
    @parts.lighting.add-to  @scene.registration

    # Set pivot position
    @pivot.position.set 0, @opts.desk-size.2/2, @opts.desk-size.1/2

    # Controls
    @add-trackball!
    @scene.controls.reset-sensor!

    # Position camera based on user's setting
    #
    # We do this by moving the scene away instead of positioning the camera,
    # because if the VR mode kicks in, VRControls will set the camera position
    # based on the HMD's tracking data, relative to 0,0,0, not to your new pos.
    @scene.registration.position.set 0, -@opts.camera-elevation, -@opts.camera-distance-from-edge * 4 - @opts.desk-size.1/2

    # Helpers
    @scene.show-helpers!

  add-trackball: ->
    trackball-target = new THREE.Object3D
    trackball-target.position.z = -@opts.camera-distance-from-edge
    @scene.add trackball-target
    @trackball = new THREE.TrackballControls @scene.camera, trackball-target
    @trackball.pan-speed = 1

  append-to: (host) ->
    host.append-child @scene.dom-element

  set-table-flip: (state) ->
    if state
      @scene.registration.rotation.set 0, 0, 0
    else
      @scene.registration.rotation.set pi, 0, 0

  render: (gs) ->
    @trackball.update!
    @scene.update!

    # Show/hide different components when metagamestate changes
    if gs.metagame-state isnt @state.last-seen-state
      @parts.topside.toggle-start-menu off

      switch gs.metagame-state
      | \remove-lines => fallthrough
      | \game         => @parts.underside.show-falling-brick!
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
      if gs.start-menu.flip-animation.progress
        @jitter.rotation.x = Ease.elastic-out that, 0, -pi

    | \start-menu =>
      @parts.underside.next-brick.display-nothing!
      @parts.topside.update-start-menu gs
      if gs.start-menu.flip-animation.progress
        @jitter.rotation.x = Ease.elastic-out that, pi, 0

    | \pause-menu =>
      @parts.underside.next-brick.display-nothing!
      @parts.pause-menu.update gs

    | \failure =>
      @parts.topside.update-fail-screen gs
      @parts.underside.next-brick.display-nothing!
      @parts.underside.show-teardown-effect gs.game-over.teardown-animation
      @parts.underside.hide-falling-brick!
      @jitter.rotation.x = Ease.elastic-out 1, 0, -pi

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

