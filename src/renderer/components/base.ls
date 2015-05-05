
# Require

{ id, log } = require \std

Materials = require \../mats


#
# Class
#

export class Base

  helper-marker-geo = new THREE.CubeGeometry 0.02, 0.02, 0.02

  (@opts, gs) ->
    @root = new THREE.Object3D
    @registration = new THREE.Object3D
    @root.add @registration

  add-registration-helper: ->
    @root.add         new THREE.Mesh helper-marker-geo, Materials.helper-a
    @registration.add new THREE.Mesh helper-marker-geo, Materials.helper-b

    # Registration offset arrow
    start    = new THREE.Vector3 0, 0, 0
    end      = @registration.position
    distance = start.distance-to end

    # Don't add arrow if length would be zero (apart from being useless, causes matrix determinant to be zero which generates warnings)
    if distance > 0
      dir   = new THREE.Vector3!sub-vectors(end, start).normalize!
      arrow = new THREE.ArrowHelper dir, start, distance, 0x0000ff
      @root.add arrow

    # Helps track down which components still have registration helpers
    log 'Registration helper at', this

  add-box-helper: (thing) ->
    bbox = new THREE.BoundingBoxHelper thing, 0x5555ff
    bbox.update!
    @root.add bbox

  update-registration-helper: ->

  show-bounds: (scene) ->
    @bounds = new THREE.BoundingBoxHelper @root, 0x555555
    @bounds.update!
    scene.add @bounds

  add-to: (obj) ->
    obj.add @root

  position:~
    -> @root.position

  visible:~
    -> @root.visible
    (state) -> @root.visible = state

