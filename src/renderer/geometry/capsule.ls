
# Require

{ pi } = require \std


# Capsule Geometry

THREE.CapsuleGeometry = (radius, radial-segments, height, lengthwise-segments) ->

  # Cap
  half-sphere = new THREE.SphereGeometry radius, radial-segments, radial-segments, 0, pi
  half-sphere.apply-matrix new THREE.Matrix4!make-translation 0, 0, 0
  half-sphere.apply-matrix new THREE.Matrix4!make-rotation-x -pi/2
  half-sphere.apply-matrix new THREE.Matrix4!make-scale 1, 0.5, 1

  # Tube
  tube = new THREE.CylinderGeometry radius, radius, height, radial-segments * 2, lengthwise-segments, yes
  tube.apply-matrix new THREE.Matrix4!make-translation 0, -height/2, 0

  # Combine
  half-sphere.merge tube
  return half-sphere

