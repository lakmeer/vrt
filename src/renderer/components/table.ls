
# Require

{ id, log } = require \std

{ Base } = require \./base
{ mesh-materials } = require \../palette


#
# Table
#

export class Table extends Base

  repeat = 2      # Texture repeating

  (@opts, gs) ->
    super ...

    [ width, depth ] = @opts.desk-size
    thickness = 0.03

    # Load color map
    map = THREE.ImageUtils.load-texture 'assets/wood.diff.jpg'
    map.wrap-t = map.wrap-s = THREE.RepeatWrapping
    map.repeat.set repeat, repeat

    # Load normal map
    nrm = THREE.ImageUtils.load-texture 'assets/wood.nrm.jpg'
    nrm.wrap-t = nrm.wrap-s = THREE.RepeatWrapping
    nrm.repeat.set repeat, repeat

    # Material
    table-mat = new THREE.MeshPhongMaterial do
      map: map
      normal-map: nrm
      normal-scale: new THREE.Vector2 0.1, 0.0

    # Shape
    table-geo = new THREE.BoxGeometry width, thickness, depth

    # Mesh
    @table = new THREE.Mesh table-geo, table-mat
    @table.receive-shadow = yes

    # Positioning
    @registration.add @table
    @registration.position.y = thickness/-2
    @registration.position.z = depth/-2
