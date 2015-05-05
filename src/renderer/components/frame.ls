
# Require

{ id, log } = require \std

{ Base } = require \./base


#
# Class
#

export class Frame extends Base
  (@opts, gs) ->
    super ...

