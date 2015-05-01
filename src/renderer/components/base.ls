
# Require

{ id, log } = require \std


#
# Class
#

export class Base

  helper-marker-size = 0.05m
  helper-marker-opacity = 0.5

  helper-marker-geo = new THREE.CubeGeometry helper-marker-size, helper-marker-size, helper-marker-size
  red-helper-mat    = new THREE.MeshBasicMaterial color: 0xff0000, transparent: yes, opacity: helper-marker-opacity
  blue-helper-mat   = new THREE.MeshBasicMaterial color: 0x00ff00, transparent: yes, opacity: helper-marker-opacity


  (@opts, gs) ->

    # Base can configure it's own offset relative to it's canonical position
    @root = new THREE.Object3D
    @registration = new THREE.Object3D
    @root.add @registration

    # Define geometry available
    @geom = {}

    # Define materials available
    @mats =
      normal: new THREE.MeshNormalMaterial!

  add-registration-helper: ->
    @root.add         new THREE.Mesh helper-marker-geo, red-helper-mat
    @registration.add new THREE.Mesh helper-marker-geo, blue-helper-mat

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

