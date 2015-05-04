
# Reference

export square =
  [[[0 0 0]
    [0 1 1]
    [0 1 1]]]

export zig =
  * [0 0 0]
    [2 2 0]
    [0 2 2]
  * [0 2 0]
    [2 2 0]
    [2 0 0]

export zag =
  * [0 0 0]
    [0 3 3]
    [3 3 0]
  * [3 0 0]
    [3 3 0]
    [0 3 0]

export left =
  * [0 0 0]
    [4 4 4]
    [4 0 0]
  * [4 4 0]
    [0 4 0]
    [0 4 0]
  * [0 0 4]
    [4 4 4]
    [0 0 0]
  * [0 4 0]
    [0 4 0]
    [0 4 4]

export right =
  * [0 0 0]
    [5 5 5]
    [0 0 5]
  * [0 5 0]
    [0 5 0]
    [5 5 0]
  * [5 0 0]
    [5 5 5]
    [0 0 0]
  * [0 5 5]
    [0 5 0]
    [0 5 0]

export tee =
  * [0 0 0]
    [6 6 6]
    [0 6 0]
  * [0 6 0]
    [6 6 0]
    [0 6 0]
  * [0 6 0]
    [6 6 6]
    [0 0 0]
  * [0 6 0]
    [0 6 6]
    [0 6 0]

export tetris =
  * [0 0 0 0]
    [0 0 0 0]
    [7 7 7 7]
  * [0 7 0 0]
    [0 7 0 0]
    [0 7 0 0]
    [0 7 0 0]

export all =
  * type: \square,  shapes: square
  * type: \zig,     shapes: zig
  * type: \zag,     shapes: zag
  * type: \left,    shapes: left
  * type: \right,   shapes: right
  * type: \tee,     shapes: tee
  * type: \tetris,  shapes: tetris

