
# Require

{ id, log } = require \std

{ Base } = require \./base
Materials = require \../mats


#
# Table
#

export class Table extends Base

  (@opts, gs) ->
    super ...

    [ width, depth, thickness ] = @opts.desk-size

    # Mesh
    @table = new THREE.Mesh (new THREE.BoxGeometry width, thickness, depth), Materials.table-faces

    # Lighting
    @table.receive-shadow = yes

    # Positioning
    @registration.add @table
    @registration.position.y = thickness/-2
    @registration.position.z = depth/-2

