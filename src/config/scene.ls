
# DPI on desk surface
# For converting measurements made on textures to game units

p2m = (* 1.6/4096)


# Scene config
#
# For consistency, 'block' refers to exactly one cube. 'Brick' refers to an
# arrangement of four blocks recognisable as a Tetris piece


module.exports =

  # Renderer Options

  units-per-meter: 1                       # Global scaling factor for feel-correctness

  hard-drop-jolt-amount: 0.03              # Maximum excursion of 'jolt' effect when bricks land
  zap-particle-size: 0.008                 # Size in meters of zap particles


  # Scene composition

  grid-size:  0.07                         # Abutting size of grid cells containing blocks
  block-size: 0.066                        # Edge length of individual blocks (leaves a gap between adjacent blocks)

  desk-size: [ 1.6, 0.8, 0.1 ]             # Dimensions of play surface

  camera-distance-from-edge: 0.2           # Horizontal distance from player's eyes to front of desk
  camera-elevation: 0.5                    # Vertical distance from desktop to player's eyes

  arena-offset-from-centre: 0.085          # Adjust horizontal position of arena
  arena-distance-from-edge: 0.57           # Distance from front of desk to front of arena

  score-distance-from-edge: p2m(780)       # Nixie display distance from edge of table
  score-distance-from-centre: p2m(436)     # Nixie display left-edge distance from centre
  score-inter-tube-margin: p2m(5)          # Gap between tubes
  score-tube-radius: p2m(200/2)            # Nixie tube radius
  score-tube-height: p2m(270)              # Nixie tube height, not including round bit
  score-base-radius: p2m(275/2)            # Nixie tube radius
  score-indicator-offset: p2m(243)         # Distnace from centre of nixie tube to indicator bulb

  preview-dome-radius: p2m(208)            # Radius of glass dome containing next brick
  preview-dome-height: 0.20                # Height of preview dome, not including round bit
  preview-distance-from-edge: p2m(656)     # Position of next-brick-preview display
  preview-distance-from-center: p2m(1002)  # Position of next-brick-preview display from center
  preview-scale-factor: 0.5                # Show next-brick-preview at smaller scale

