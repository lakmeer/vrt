
# Require

{ id, log } = require \std

{ Base } = require \./base
{ mesh-materials } = require \../palette


#
# Table
#

export class Table extends Base

  (@opts, gs) ->
    super ...

    [ width, depth, thickness ] = @opts.desk-size

    # Materials
    table-mats =
      top: new THREE.MeshPhongMaterial do
        map: THREE.ImageUtils.load-texture 'assets/board.col.png'
        specular: 0xffffff
        specular-map: THREE.ImageUtils.load-texture 'assets/board.spec.png'
        shininess: 100
        #normal-map: nrm
        #normal-scale: new THREE.Vector2 0.1, 0.0

      front: new THREE.MeshPhongMaterial do
        map: THREE.ImageUtils.load-texture 'assets/board-f.col.png'
        #normal-map: nrm
        #normal-scale: new THREE.Vector2 0.1, 0.0

    # Shape
    table-geo = new THREE.BoxGeometry width, thickness, depth

    # Mesh
    @table = new THREE.Mesh table-geo, new THREE.MeshFaceMaterial [
      table-mats.front
      table-mats.front
      table-mats.top
      table-mats.front
      table-mats.front
      table-mats.front
    ]

    # Lighting
    @table.receive-shadow = yes

    # Positioning
    @registration.add @table
    @registration.position.y = thickness/-2
    @registration.position.z = depth/-2

