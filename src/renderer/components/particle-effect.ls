
# Require

{ id, log, pi, sin, cos, floor } = require \std
{ Base } = require \./base
{ mesh-materials } = require \../palette


size     = 0.006
speed    = 6
lifespan = 2000


export class ParticleBurst extends Base

  (@opts, {{ width, height }:arena }:gs) ->

    super ...

    @last-p = 10

    particles  = 400
    geometry   = new THREE.BufferGeometry!
    color      = new THREE.Color!

    @positions  = new Float32Array particles * 3
    @velocities = new Float32Array particles * 3
    @colors     = new Float32Array particles * 3
    @lifespans  = new Float32Array particles
    @maxlifes   = new Float32Array particles

    @pos-attr = new THREE.BufferAttribute @positions, 3
    @col-attr = new THREE.BufferAttribute @colors, 3

    @reset!

    geometry.add-attribute \position, @pos-attr
    geometry.add-attribute \color,    @col-attr
    geometry.compute-bounding-sphere!

    material = new THREE.PointCloudMaterial size: size, vertex-colors: THREE.VertexColors
    system   = new THREE.PointCloud geometry, material
    @root.add system

  reset: ->
    for i from 0 til @positions.length by 3
      n = 10
      x = 4.5 - Math.random! * 9
      z = 0.5 - Math.random!
      @positions[ i + 0 ] = x
      @positions[ i + 1 ] = 0
      @positions[ i + 2 ] = z
      @velocities[ i + 0 ] = x / 9 * 10
      @velocities[ i + 1 ] = Math.random! * 2
      @velocities[ i + 2 ] = z * 10
      @colors[ i + 0 ] = 1
      @colors[ i + 1 ] = 1
      @colors[ i + 2 ] = 1
      @lifespans[i/3] = 0  # Start dead until I say otherwise

  accelerate-particle: (i, t, p) ->

    # Die
    if @lifespans[i/3] <= 0
      @positions[i + 1] = -1000
      return

    # If not dead, fall
    t = t/(1000/speed)
    acc = -0.98

    px = @positions[i + 0]
    py = @positions[i + 1]
    pz = @positions[i + 2]
    vx = @velocities[i + 0]
    vy = @velocities[i + 1]
    vz = @velocities[i + 2]
    px1 = px + 0.5 *  0  * t * t + vx * t
    py1 = py + 0.5 * acc * t * t + vy * t  # Apply gravity only in y direction
    pz1 = pz + 0.5 *  0  * t * t + vz * t
    vx1 = 0 * t + vx
    vy1 = acc * t + vy  # Apply gravity only in y direction
    vz1 = 0 * t + vz

    # Bounce
    if py1 < size/2
      py1 = size/2
      vx1 *= 0.7
      vy1 *= -0.6
      vz1 *= 0.7

    @positions[i + 0] =  px1
    @positions[i + 1] =  py1
    @positions[i + 2] =  pz1
    @velocities[i + 0] = vx1
    @velocities[i + 1] = vy1
    @velocities[i + 2] = vz1

    l = @lifespans[i/3]/@maxlifes[i/3]

    @colors[ i + 0 ] = l
    @colors[ i + 1 ] = l*l
    @colors[ i + 2 ] = l*l*l*l

  set-height: (y) ->
    @reset!
    for i from 0 til @positions.length by 3
      @lifespans[i/3] = lifespan/2 + Math.random! * lifespan/2
      @maxlifes[i/3] = @lifespans[i/3]
      @positions[i + 1] = y + Math.random! - 0.5

  update: (p, Δt) ->
    #if p < @last-p then @reset!
    #@last-p = p

    for i from 0 til @positions.length by 3
      @accelerate-particle i, Δt, 1
      @lifespans[i/3] -= Δt

    @pos-attr.needs-update = true
    @col-attr.needs-update = true


#
# Particle Effect
#

export class ParticleEffect extends Base

  (@opts, {{ width, height }:arena }:gs) ->

    super ...

    @z = @opts.z
    @h = height

    @rows = [
      new ParticleBurst ...
      new ParticleBurst ...
      new ParticleBurst ...
      new ParticleBurst ...
    ]

    for row in @rows
      row.add-to @root

  prepare: (rows) ->
    for row-ix, i in rows
      @rows[i].set-height (@h - 1) - row-ix

  reset: ->
    for system in @rows
      system.reset!

  update: (p, fsrr, Δt) ->
    for system, ix in @rows # when ix <= fsrr
      system.update p, Δt

