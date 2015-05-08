(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, DebugOutput, TetrisGame, ThreeJsRenderer;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./utils/frame-driver').FrameDriver;
InputHandler = require('./utils/input-handler').InputHandler;
DebugOutput = require('./utils/debug-output').DebugOutput;
TetrisGame = require('./game').TetrisGame;
ThreeJsRenderer = require('./renderer').ThreeJsRenderer;
document.addEventListener('DOMContentLoaded', function(){
  var gameState, gameOptions, renderOptions, inputHandler, tetrisGame, renderer, timeFactor, debugOutput, frameDriver, testEasing;
  gameState = {
    metagameState: 'no-game'
  };
  gameOptions = require('./config/game');
  renderOptions = require('./config/scene');
  inputHandler = new InputHandler;
  tetrisGame = new TetrisGame(gameState, gameOptions);
  renderer = new ThreeJsRenderer(renderOptions, gameState, gameOptions);
  timeFactor = 2;
  debugOutput = new DebugOutput;
  InputHandler.on(192, function(){
    if (frameDriver.state.running) {
      return frameDriver.stop();
    } else {
      return frameDriver.start();
    }
  });
  InputHandler.on(27, function(){
    gameState.core.paused = !gameState.core.paused;
    return log(gameState.core.paused ? "Game time paused" : "Game time unpaused");
  });
  frameDriver = new FrameDriver(function(Δt, time, frame, fps){
    gameState = tetrisGame.update(gameState, {
      input: inputHandler.changesSinceLastFrame(),
      Δt: Δt / timeFactor,
      time: time / timeFactor,
      frame: frame,
      fps: fps
    });
    renderer.render(gameState);
    return debugOutput != null ? debugOutput.render(gameState) : void 8;
  });
  renderer.appendTo(document.body);
  frameDriver.start();
  tetrisGame.beginNewGame(gameState);
  return testEasing = function(){
    var Ease, i$, ref$, len$, el, easeName, ease, lresult$, cnv, ctx, i, p, results$ = [];
    Ease = require('std').Ease;
    for (i$ = 0, len$ = (ref$ = document.querySelectorAll('canvas')).length; i$ < len$; ++i$) {
      el = ref$[i$];
      el.style.display = 'none';
    }
    for (easeName in Ease) {
      ease = Ease[easeName];
      lresult$ = [];
      cnv = document.createElement('canvas');
      cnv.width = 200;
      cnv.height = 200;
      cnv.style.background = 'white';
      cnv.style.borderLeft = "3px solid black";
      ctx = cnv.getContext('2d');
      document.body.appendChild(cnv);
      ctx.font = "14px monospace";
      ctx.fillText(easeName, 2, 16, 200);
      for (i$ = 0; i$ <= 100; ++i$) {
        i = i$;
        p = i / 100;
        lresult$.push(ctx.fillRect(2 * i, 200 - ease(p, 0, 200), 2, 2));
      }
      results$.push(lresult$);
    }
    return results$;
  };
});
},{"./config/game":6,"./config/scene":7,"./game":13,"./renderer":35,"./utils/debug-output":41,"./utils/frame-driver":42,"./utils/input-handler":43,"std":40}],2:[function(require,module,exports){
/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, onError ) {

	var scope = this;
	var vrInputs = [];

	function filterInvalidDevices( devices ) {

		// Exclude Cardboard position sensor if Oculus exists.
		var oculusDevices = devices.filter( function ( device ) {
			return device.deviceName.toLowerCase().indexOf('oculus') !== -1;
		} );

		if ( oculusDevices.length >= 1 ) {
			return devices.filter( function ( device ) {
				return device.deviceName.toLowerCase().indexOf('cardboard') === -1;
			} );
		} else {
			return devices;
		}
	}

	function gotVRDevices( devices ) {
		devices = filterInvalidDevices( devices );
		for ( var i = 0; i < devices.length; i ++ ) {
			if ( devices[ i ] instanceof PositionSensorVRDevice ) {
				vrInputs.push( devices[ i ] );
			}
		}

		if ( onError ) onError( 'HMD not available' );
	}

	if ( navigator.getVRDevices ) {
		navigator.getVRDevices().then( gotVRDevices );
	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;
	this.update = function () {
		for ( var i = 0; i < vrInputs.length; i ++ ) {
			var vrInput = vrInputs[ i ];
			var state = vrInput.getState();

			if ( state.orientation !== null ) {
				object.quaternion.copy( state.orientation );
			}

			if ( state.position !== null ) {
				object.position.copy( state.position ).multiplyScalar( scope.scale );
			}
		}
	};

	this.resetSensor = function () {
		for ( var i = 0; i < vrInputs.length; i ++ ) {
			var vrInput = vrInputs[ i ];

			if ( vrInput.resetSensor !== undefined ) {
				vrInput.resetSensor();
			} else if ( vrInput.zeroSensor !== undefined ) {
				vrInput.zeroSensor();
			}
		}
	};

	this.zeroSensor = function () {
		THREE.warn( 'THREE.VRControls: .zeroSensor() is now .resetSensor().' );
		this.resetSensor();
	};

};


},{}],3:[function(require,module,exports){

/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
 *
 */

THREE.VREffect = function ( renderer, onError ) {

	var vrHMD;
	var eyeTranslationL, eyeFOVL;
	var eyeTranslationR, eyeFOVR;

	function gotVRDevices( devices ) {
		for ( var i = 0; i < devices.length; i ++ ) {
			if ( devices[ i ] instanceof HMDVRDevice ) {
				vrHMD = devices[ i ];

				if ( vrHMD.getEyeParameters !== undefined ) {
					var eyeParamsL = vrHMD.getEyeParameters( 'left' );
					var eyeParamsR = vrHMD.getEyeParameters( 'right' );

					eyeTranslationL = eyeParamsL.eyeTranslation;
					eyeTranslationR = eyeParamsR.eyeTranslation;
					eyeFOVL = eyeParamsL.recommendedFieldOfView;
					eyeFOVR = eyeParamsR.recommendedFieldOfView;
				} else {
					// TODO: This is an older code path and not spec compliant.
					// It should be removed at some point in the near future.
					eyeTranslationL = vrHMD.getEyeTranslation( 'left' );
					eyeTranslationR = vrHMD.getEyeTranslation( 'right' );
					eyeFOVL = vrHMD.getRecommendedEyeFieldOfView( 'left' );
					eyeFOVR = vrHMD.getRecommendedEyeFieldOfView( 'right' );
				}
				break; // We keep the first we encounter
			}
		}

		if ( vrHMD === undefined ) {
			if ( onError ) onError( 'HMD not available' );
		}

	}

	if ( navigator.getVRDevices ) {
		navigator.getVRDevices().then( gotVRDevices );
	}

	//

	this.scale = 1;
	this.setSize = function( width, height ) {
		renderer.setSize( width, height );
	};

	// fullscreen

	var isFullscreen = false;
	var canvas = renderer.domElement;
	var fullscreenchange = canvas.mozRequestFullScreen ? 'mozfullscreenchange' : 'webkitfullscreenchange';

	document.addEventListener( fullscreenchange, function ( event ) {
		isFullscreen = document.mozFullScreenElement || document.webkitFullscreenElement;
	}, false );

	this.setFullScreen = function ( boolean ) {
		if ( vrHMD === undefined ) return;
		if ( isFullscreen === boolean ) return;
		if ( canvas.mozRequestFullScreen ) {
			canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );
		} else if ( canvas.webkitRequestFullscreen ) {
			canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );
		}
	};


  // Proxy for renderer
  this.getPixelRatio = function () {
    return renderer.getPixelRatio();
  };

  Object.defineProperty(this, 'context', {
    get: function () { return renderer.context; }
  });

	// render
	var cameraL = new THREE.PerspectiveCamera();
	var cameraR = new THREE.PerspectiveCamera();

	this.render = function ( scene, camera ) {
		if ( vrHMD ) {
			var sceneL, sceneR;

			if ( scene instanceof Array ) {
				sceneL = scene[ 0 ];
				sceneR = scene[ 1 ];
			} else {
				sceneL = scene;
				sceneR = scene;
			}

			var size = renderer.getSize();
			size.width /= 2;

			renderer.enableScissorTest( true );
			renderer.clear();

			if ( camera.parent === undefined ) camera.updateMatrixWorld();

			cameraL.projectionMatrix = fovToProjection( eyeFOVL, true, camera.near, camera.far );
			cameraR.projectionMatrix = fovToProjection( eyeFOVR, true, camera.near, camera.far );

			camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
			camera.matrixWorld.decompose( cameraR.position, cameraR.quaternion, cameraR.scale );

			cameraL.translateX( eyeTranslationL.x * this.scale );
			cameraR.translateX( eyeTranslationR.x * this.scale );

			// render left eye
			renderer.setViewport( 0, 0, size.width, size.height );
			renderer.setScissor( 0, 0, size.width, size.height );
			renderer.render( sceneL, cameraL );

			// render right eye
			renderer.setViewport( size.width, 0, size.width, size.height );
			renderer.setScissor( size.width, 0, size.width, size.height );
			renderer.render( sceneR, cameraR );

			renderer.enableScissorTest( false );

			return;

		}

		// Regular render mode if not HMD

		if ( scene instanceof Array ) scene = scene[ 0 ];

		renderer.render( scene, camera );

	};

	function fovToNDCScaleOffset( fov ) {

		var pxscale = 2.0 / (fov.leftTan + fov.rightTan);
		var pxoffset = (fov.leftTan - fov.rightTan) * pxscale * 0.5;
		var pyscale = 2.0 / (fov.upTan + fov.downTan);
		var pyoffset = (fov.upTan - fov.downTan) * pyscale * 0.5;
		return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

	}

	function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

		rightHanded = rightHanded === undefined ? true : rightHanded;
		zNear = zNear === undefined ? 0.01 : zNear;
		zFar = zFar === undefined ? 10000.0 : zFar;

		var handednessScale = rightHanded ? -1.0 : 1.0;

		// start with an identity matrix
		var mobj = new THREE.Matrix4();
		var m = mobj.elements;

		// and with scale/offset info for normalized device coords
		var scaleAndOffset = fovToNDCScaleOffset(fov);

		// X result, map clip edges to [-w,+w]
		m[0 * 4 + 0] = scaleAndOffset.scale[0];
		m[0 * 4 + 1] = 0.0;
		m[0 * 4 + 2] = scaleAndOffset.offset[0] * handednessScale;
		m[0 * 4 + 3] = 0.0;

		// Y result, map clip edges to [-w,+w]
		// Y offset is negated because this proj matrix transforms from world coords with Y=up,
		// but the NDC scaling has Y=down (thanks D3D?)
		m[1 * 4 + 0] = 0.0;
		m[1 * 4 + 1] = scaleAndOffset.scale[1];
		m[1 * 4 + 2] = -scaleAndOffset.offset[1] * handednessScale;
		m[1 * 4 + 3] = 0.0;

		// Z result (up to the app)
		m[2 * 4 + 0] = 0.0;
		m[2 * 4 + 1] = 0.0;
		m[2 * 4 + 2] = zFar / (zNear - zFar) * -handednessScale;
		m[2 * 4 + 3] = (zFar * zNear) / (zNear - zFar);

		// W result (= Z in)
		m[3 * 4 + 0] = 0.0;
		m[3 * 4 + 1] = 0.0;
		m[3 * 4 + 2] = handednessScale;
		m[3 * 4 + 3] = 0.0;

		mobj.transpose();

		return mobj;
	}

	function fovToProjection( fov, rightHanded, zNear, zFar ) {

		var DEG2RAD = Math.PI / 180.0;

		var fovPort = {
			upTan: Math.tan( fov.upDegrees * DEG2RAD ),
			downTan: Math.tan( fov.downDegrees * DEG2RAD ),
			leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
			rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
		};

		return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

	}

};

},{}],4:[function(require,module,exports){

/*
 * MozVR Extensions to three.js
 *
 * A browserify wrapper for the VR helpers from MozVR's github repo.
 * https://github.com/MozVR/vr-web-examples/tree/master/threejs-vr-boilerplate
 *
 * The extension files are not module compatible and work by appending to the
 * THREE object. Do use them, we make the THREE object global, and then make
 * it the export value of this module.
 *
 */

console.groupCollapsed('Loading MozVR Extensions...');
//require('./StereoEffect.js');
//console.log('StereoEffect - OK');

require('./VRControls.js');
console.log('VRControls - OK');

require('./VREffect.js');
console.log('VREffect - OK');

console.groupEnd();

module.exports = THREE;


},{"./VRControls.js":2,"./VREffect.js":3}],5:[function(require,module,exports){
/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 */

THREE.TrackballControls = function ( object, target, domElement ) {

	var _this = this;
	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { left: 0, top: 0, width: 0, height: 0 };

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 1.2;
	this.panSpeed = 0.3;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = target ? target.position : new THREE.Vector3();

	var EPS = 0.000001;

	var lastPosition = new THREE.Vector3();

	var _state = STATE.NONE,
	_prevState = STATE.NONE,

	_eye = new THREE.Vector3(),

	_movePrev = new THREE.Vector2(),
	_moveCurr = new THREE.Vector2(),

	_lastAxis = new THREE.Vector3(),
	_lastAngle = 0,

	_zoomStart = new THREE.Vector2(),
	_zoomEnd = new THREE.Vector2(),

	_touchZoomDistanceStart = 0,
	_touchZoomDistanceEnd = 0,

	_panStart = new THREE.Vector2(),
	_panEnd = new THREE.Vector2();

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.up0 = this.object.up.clone();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };


	// methods

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			var box = this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}

	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	var getMouseOnScreen = ( function () {

		var vector = new THREE.Vector2();

		return function ( pageX, pageY ) {

			vector.set(
				( pageX - _this.screen.left ) / _this.screen.width,
				( pageY - _this.screen.top ) / _this.screen.height
			);

			return vector;

		};

	}() );

	var getMouseOnCircle = ( function () {

		var vector = new THREE.Vector2();

		return function ( pageX, pageY ) {

			vector.set(
				( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
				( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
			);

			return vector;
		};

	}() );

	this.rotateCamera = (function() {

		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion(),
			eyeDirection = new THREE.Vector3(),
			objectUpDirection = new THREE.Vector3(),
			objectSidewaysDirection = new THREE.Vector3(),
			moveDirection = new THREE.Vector3(),
			angle;

		return function () {

			moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
			angle = moveDirection.length();

			if ( angle ) {

				_eye.copy( _this.object.position ).sub( _this.target );

				eyeDirection.copy( _eye ).normalize();
				objectUpDirection.copy( _this.object.up ).normalize();
				objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

				objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
				objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

				moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

				axis.crossVectors( moveDirection, _eye ).normalize();

				angle *= _this.rotateSpeed;
				quaternion.setFromAxisAngle( axis, angle );

				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

				_lastAxis.copy( axis );
				_lastAngle = angle;

			}

			else if ( !_this.staticMoving && _lastAngle ) {

				_lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactor );
				_eye.copy( _this.object.position ).sub( _this.target );
				quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

			}

			_movePrev.copy( _moveCurr );

		};

	}());


	this.zoomCamera = function () {

		var factor;

		if ( _state === STATE.TOUCH_ZOOM_PAN ) {

			factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			_touchZoomDistanceStart = _touchZoomDistanceEnd;
			_eye.multiplyScalar( factor );

		} else {

			factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {

				_eye.multiplyScalar( factor );

				if ( _this.staticMoving ) {

					_zoomStart.copy( _zoomEnd );

				} else {

					_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

				}

			}

		}

	};

	this.panCamera = (function() {

		var mouseChange = new THREE.Vector2(),
			objectUp = new THREE.Vector3(),
			pan = new THREE.Vector3();

		return function () {

			mouseChange.copy( _panEnd ).sub( _panStart );

			if ( mouseChange.lengthSq() ) {

				mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

				pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
				pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

				_this.object.position.add( pan );
				_this.target.add( pan );

				if ( _this.staticMoving ) {

					_panStart.copy( _panEnd );

				} else {

					_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

				}

			}
		};

	}());

	this.checkDistances = function () {

		if ( !_this.noZoom || !_this.noPan ) {

			if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

			}

		}

	};

	this.update = function () {

		_eye.subVectors( _this.object.position, _this.target );

		if ( !_this.noRotate ) {

			_this.rotateCamera();

		}

		if ( !_this.noZoom ) {

			_this.zoomCamera();

		}

		if ( !_this.noPan ) {

			_this.panCamera();

		}

		_this.object.position.addVectors( _this.target, _eye );

		_this.checkDistances();

		_this.object.lookAt( _this.target );

		if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

			_this.dispatchEvent( changeEvent );

			lastPosition.copy( _this.object.position );

		}

	};

	this.reset = function () {

		_state = STATE.NONE;
		_prevState = STATE.NONE;

		_this.target.copy( _this.target0 );
		_this.object.position.copy( _this.position0 );
		_this.object.up.copy( _this.up0 );

		_eye.subVectors( _this.object.position, _this.target );

		_this.object.lookAt( _this.target );

		_this.dispatchEvent( changeEvent );

		lastPosition.copy( _this.object.position );

	};

	// listeners

	function keydown( event ) {

		if ( _this.enabled === false ) return;

		window.removeEventListener( 'keydown', keydown );

		_prevState = _state;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && !_this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( event.keyCode === _this.keys[ STATE.PAN ] && !_this.noPan ) {

			_state = STATE.PAN;

		}

	}

	function keyup( event ) {

		if ( _this.enabled === false ) return;

		_state = _prevState;

		window.addEventListener( 'keydown', keydown, false );

	}

	function mousedown( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;

		}

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
			_movePrev.copy(_moveCurr);

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_zoomEnd.copy(_zoomStart);

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_panEnd.copy(_panStart);

		}

		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );

		_this.dispatchEvent( startEvent );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.ROTATE && !_this.noRotate ) {

			_movePrev.copy(_moveCurr);
			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

		} else if ( _state === STATE.ZOOM && !_this.noZoom ) {

			_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		} else if ( _state === STATE.PAN && !_this.noPan ) {

			_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		}

	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );
		_this.dispatchEvent( endEvent );

	}

	function mousewheel( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta / 40;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail / 3;

		}

		_zoomStart.y += delta * 0.01;
		_this.dispatchEvent( startEvent );
		_this.dispatchEvent( endEvent );

	}

	function touchstart( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_state = STATE.TOUCH_ROTATE;
				_moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				_movePrev.copy(_moveCurr);
				break;

			case 2:
				_state = STATE.TOUCH_ZOOM_PAN;
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panStart.copy( getMouseOnScreen( x, y ) );
				_panEnd.copy( _panStart );
				break;

			default:
				_state = STATE.NONE;

		}
		_this.dispatchEvent( startEvent );


	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1:
				_movePrev.copy(_moveCurr);
				_moveCurr.copy( getMouseOnCircle(  event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				break;

			case 2:
				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panEnd.copy( getMouseOnScreen( x, y ) );
				break;

			default:
				_state = STATE.NONE;

		}

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				_movePrev.copy(_moveCurr);
				_moveCurr.copy( getMouseOnCircle(  event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
				break;

			case 2:
				_touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

				var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
				var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
				_panEnd.copy( getMouseOnScreen( x, y ) );
				_panStart.copy( _panEnd );
				break;

		}

		_state = STATE.NONE;
		_this.dispatchEvent( endEvent );

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousedown', mousedown, false );

	this.domElement.addEventListener( 'mousewheel', mousewheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

	// force an update at start
	this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;


module.exports = THREE.TrackballControls;


},{}],6:[function(require,module,exports){
var arenaWidth, arenaHeight, timeFactor, startingDropSpeed, speedMultiplyPerLevel, keyRepeatTime, softDropWaitTime, animation, out$ = typeof exports != 'undefined' && exports || this;
out$.arenaWidth = arenaWidth = 10;
out$.arenaHeight = arenaHeight = 18;
out$.timeFactor = timeFactor = 1;
out$.startingDropSpeed = startingDropSpeed = 300;
out$.speedMultiplyPerLevel = speedMultiplyPerLevel = 0.95;
out$.keyRepeatTime = keyRepeatTime = 100;
out$.softDropWaitTime = softDropWaitTime = 100;
out$.animation = animation = {
  zapAnimationTime: 500,
  joltAnimationTime: 500,
  hardDropEffectTime: 100,
  previewRevealTime: 300,
  titleRevealTime: 4000,
  gameOverRevealTime: 4000
};
},{}],7:[function(require,module,exports){
var p2m;
p2m = (function(it){
  return it * 1.6 / 4096;
});
module.exports = {
  unitsPerMeter: 1,
  hardDropJoltAmount: 0.03,
  zapParticleSize: 0.008,
  gridSize: 0.07,
  blockSize: 0.066,
  deskSize: [1.6, 0.8, 0.1],
  cameraDistanceFromEdge: 0.2,
  cameraElevation: 0.5,
  arenaOffsetFromCentre: 0.085,
  arenaDistanceFromEdge: 0.57,
  scoreDistanceFromEdge: p2m(780),
  scoreDistanceFromCentre: p2m(436),
  scoreInterTubeMargin: p2m(5),
  scoreTubeRadius: p2m(200 / 2),
  scoreTubeHeight: p2m(270),
  scoreBaseRadius: p2m(275 / 2),
  scoreIndicatorOffset: p2m(243),
  previewDomeRadius: p2m(208),
  previewDomeHeight: 0.20,
  previewDistanceFromEdge: p2m(656),
  previewDistanceFromCenter: p2m(1002),
  previewScaleFactor: 0.5
};
},{}],8:[function(require,module,exports){
var ref$, id, log, addV2, randInt, wrap, randomFrom, Brick, Timer, primeGameState, newArena, copyBrickToArena, dropRow, removeRows, clearArena, topIsReached, rowIsComplete, collides, canMove, canDrop, canRotate, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
Brick = require('./brick');
Timer = require('../utils/timer');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.arena = {
    cells: newArena(options.arenaWidth, options.arenaHeight),
    width: options.arenaWidth,
    height: options.arenaHeight,
    zapAnimation: Timer.create("Zap Animation", options.zapAnimationTime),
    joltAnimation: Timer.create("Jolt Animation", options.joltAnimationTime)
  };
};
out$.newArena = newArena = function(width, height){
  var i$, row, lresult$, j$, cell, results$ = [];
  for (i$ = 0; i$ < height; ++i$) {
    row = i$;
    lresult$ = [];
    for (j$ = 0; j$ < width; ++j$) {
      cell = j$;
      lresult$.push(0);
    }
    results$.push(lresult$);
  }
  return results$;
};
out$.copyBrickToArena = copyBrickToArena = function(arg$, arg1$){
  var pos, shape, cells, i$, ref$, len$, y, v, lresult$, j$, ref1$, len1$, x, u, results$ = [];
  pos = arg$.pos, shape = arg$.shape;
  cells = arg1$.cells;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      if (shape[y][x] && v >= 0) {
        lresult$.push(cells[v][u] = shape[y][x]);
      }
    }
    results$.push(lresult$);
  }
  return results$;
  function fn$(){
    var i$, to$, results$ = [];
    for (i$ = pos[1], to$ = pos[1] + shape.length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
  function fn1$(){
    var i$, to$, results$ = [];
    for (i$ = pos[0], to$ = pos[0] + shape[0].length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
};
out$.dropRow = dropRow = function(arg$, rowIx){
  var cells;
  cells = arg$.cells;
  cells.splice(rowIx, 1);
  return cells.unshift(repeatArray$([0], cells[0].length));
};
out$.removeRows = removeRows = function(arena, rows){
  var i$, len$, rowIx, results$ = [];
  for (i$ = 0, len$ = rows.length; i$ < len$; ++i$) {
    rowIx = rows[i$];
    results$.push(dropRow(arena, rowIx));
  }
  return results$;
};
out$.clearArena = clearArena = function(arena){
  var i$, ref$, len$, row, lresult$, j$, len1$, i, cell, results$ = [];
  for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
    row = ref$[i$];
    lresult$ = [];
    for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
      i = j$;
      cell = row[j$];
      lresult$.push(row[i] = 0);
    }
    results$.push(lresult$);
  }
  return results$;
};
out$.topIsReached = topIsReached = function(arena){
  var i$, ref$, len$, cell;
  for (i$ = 0, len$ = (ref$ = arena.cells[0]).length; i$ < len$; ++i$) {
    cell = ref$[i$];
    if (cell) {
      return true;
    }
  }
  return false;
};
out$.rowIsComplete = rowIsComplete = function(row){
  var i$, len$, cell;
  for (i$ = 0, len$ = row.length; i$ < len$; ++i$) {
    cell = row[i$];
    if (!cell) {
      return false;
    }
  }
  return true;
};
out$.collides = collides = function(pos, shape, arg$){
  var cells, width, height, i$, ref$, len$, y, v, j$, ref1$, len1$, x, u;
  cells = arg$.cells, width = arg$.width, height = arg$.height;
  for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
    y = i$;
    v = ref$[i$];
    for (j$ = 0, len1$ = (ref1$ = (fn1$())).length; j$ < len1$; ++j$) {
      x = j$;
      u = ref1$[j$];
      if (shape[y][x] > 0) {
        if (v >= 0) {
          if (v >= height || u >= width || u < 0 || cells[v][u]) {
            return false;
          }
        }
      }
    }
  }
  return true;
  function fn$(){
    var i$, to$, results$ = [];
    for (i$ = pos[1], to$ = pos[1] + shape.length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
  function fn1$(){
    var i$, to$, results$ = [];
    for (i$ = pos[0], to$ = pos[0] + shape[0].length; i$ < to$; ++i$) {
      results$.push(i$);
    }
    return results$;
  }
};
out$.canMove = canMove = function(brick, move, arena){
  var newPos;
  newPos = addV2(brick.pos, move);
  return collides(newPos, brick.shape, arena);
};
out$.canDrop = canDrop = function(brick, arena){
  return canMove(brick, [0, 1], arena);
};
out$.canRotate = canRotate = function(brick, rotation, arena){
  var newShape;
  newShape = Brick.getShapeOfRotation(brick, rotation);
  return collides(brick.pos, newShape, arena);
};
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
},{"../utils/timer":44,"./brick":9,"std":40}],9:[function(require,module,exports){
var ref$, id, log, randInt, wrap, BrickShapes, primeGameState, newBrick, spawnNewBrick, resetState, rotateBrick, getShapeOfRotation, normaliseRotation, drawCell, drawBrick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, randInt = ref$.randInt, wrap = ref$.wrap;
BrickShapes = require('./data/brick-shapes');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.brick = {
    next: null,
    current: null
  };
};
out$.newBrick = newBrick = function(ix){
  ix == null && (ix = randInt(0, BrickShapes.all.length));
  return {
    pos: [3, -1],
    color: ix,
    rotation: 0,
    type: BrickShapes.all[ix].type,
    shape: BrickShapes.all[ix].shapes[0]
  };
};
out$.spawnNewBrick = spawnNewBrick = function(gs){
  gs.brick.current = gs.brick.next;
  gs.brick.current.pos = [4, -1];
  return gs.brick.next = newBrick();
};
out$.resetState = resetState = function(brick){
  brick.next = newBrick();
  return brick.current = newBrick();
};
out$.rotateBrick = rotateBrick = function(brick, rotation){
  brick.rotation = normaliseRotation(brick, rotation);
  return brick.shape = BrickShapes[brick.type][brick.rotation];
};
out$.getShapeOfRotation = getShapeOfRotation = function(brick, rotation){
  rotation = normaliseRotation(brick, rotation);
  return BrickShapes[brick.type][rotation];
};
out$.normaliseRotation = normaliseRotation = function(brick, rotation){
  return wrap(0, BrickShapes[brick.type].length - 1, brick.rotation + rotation);
};
drawCell = function(it){
  if (it) {
    return "▒▒";
  } else {
    return "  ";
  }
};
out$.drawBrick = drawBrick = function(shape){
  return shape.map(function(it){
    return it.map(drawCell).join('');
  }).join("\n");
};
},{"./data/brick-shapes":10,"std":40}],10:[function(require,module,exports){
var square, zig, zag, left, right, tee, tetris, all, out$ = typeof exports != 'undefined' && exports || this;
out$.square = square = [[[0, 0, 0], [0, 1, 1], [0, 1, 1]]];
out$.zig = zig = [[[0, 0, 0], [2, 2, 0], [0, 2, 2]], [[0, 2, 0], [2, 2, 0], [2, 0, 0]]];
out$.zag = zag = [[[0, 0, 0], [0, 3, 3], [3, 3, 0]], [[3, 0, 0], [3, 3, 0], [0, 3, 0]]];
out$.left = left = [[[0, 0, 0], [4, 4, 4], [4, 0, 0]], [[4, 4, 0], [0, 4, 0], [0, 4, 0]], [[0, 0, 4], [4, 4, 4], [0, 0, 0]], [[0, 4, 0], [0, 4, 0], [0, 4, 4]]];
out$.right = right = [[[0, 0, 0], [5, 5, 5], [0, 0, 5]], [[0, 5, 0], [0, 5, 0], [5, 5, 0]], [[5, 0, 0], [5, 5, 5], [0, 0, 0]], [[0, 5, 5], [0, 5, 0], [0, 5, 0]]];
out$.tee = tee = [[[0, 0, 0], [6, 6, 6], [0, 6, 0]], [[0, 6, 0], [6, 6, 0], [0, 6, 0]], [[0, 6, 0], [6, 6, 6], [0, 0, 0]], [[0, 6, 0], [0, 6, 6], [0, 6, 0]]];
out$.tetris = tetris = [[[0, 0, 0, 0], [0, 0, 0, 0], [7, 7, 7, 7]], [[0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0], [0, 7, 0, 0]]];
out$.all = all = [
  {
    type: 'square',
    shapes: square
  }, {
    type: 'zig',
    shapes: zig
  }, {
    type: 'zag',
    shapes: zag
  }, {
    type: 'left',
    shapes: left
  }, {
    type: 'right',
    shapes: right
  }, {
    type: 'tee',
    shapes: tee
  }, {
    type: 'tetris',
    shapes: tetris
  }
];
},{}],11:[function(require,module,exports){
var ref$, id, log, addV2, randInt, wrap, randomFrom, Timer, primeGameState, animationTimeForRows, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
Timer = require('../utils/timer');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.core = {
    paused: false,
    slowdown: 1,
    softDropMode: false,
    rowsToRemove: [],
    rowsRemovedThisFrame: false,
    dropTimer: Timer.create("Drop timer", options.startingDropSpeed, true),
    keyRepeatTimer: Timer.create("Key repeat", options.keyRepeatTime),
    softDropWaitTimer: Timer.create("Soft-drop wait time", options.softDropWaitTime),
    hardDropAnimation: Timer.create("Hard-drop animation", options.animation.hardDropEffectTime),
    previewRevealAnimation: Timer.create("Next brick animation", options.animation.previewRevealTime)
  };
};
out$.animationTimeForRows = animationTimeForRows = function(rows){
  return 10 + Math.pow(3, rows.length);
};
},{"../utils/timer":44,"std":40}],12:[function(require,module,exports){
var ref$, id, log, wrap, Timer, menuData, limiter, primeGameState, chooseOption, selectPrevItem, selectNextItem, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, wrap = ref$.wrap;
Timer = require('../utils/timer');
menuData = [
  {
    state: 'restart',
    text: "Restart"
  }, {
    state: 'go-back',
    text: "Back to Main"
  }
];
limiter = wrap(0, menuData.length - 1);
out$.primeGameState = primeGameState = function(gs, options){
  return gs.gameOver = {
    currentIndex: 0,
    currentState: menuData[0],
    menuData: menuData,
    revealAnimation: Timer.create("Game over reveal animation", options.animation.gameOverRevealTime)
  };
};
out$.chooseOption = chooseOption = function(ms, index){
  ms.currentIndex = limiter(index);
  return ms.currentState = menuData[ms.currentIndex];
};
out$.selectPrevItem = selectPrevItem = function(ms){
  return chooseOption(ms, ms.currentIndex - 1);
};
out$.selectNextItem = selectNextItem = function(ms){
  return chooseOption(ms, ms.currentIndex + 1);
};
},{"../utils/timer":44,"std":40}],13:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, Core, Arena, Brick, Score, StartMenu, GameOver, Timer, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand, randomFrom = ref$.randomFrom;
Core = require('./game-core');
Arena = require('./arena');
Brick = require('./brick');
Score = require('./score');
StartMenu = require('./start-menu');
GameOver = require('./game-over');
Timer = require('../utils/timer');
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(gameState, gameOptions){
    Core.primeGameState(gameState, gameOptions);
    Arena.primeGameState(gameState, gameOptions);
    Brick.primeGameState(gameState, gameOptions);
    Score.primeGameState(gameState, gameOptions);
    StartMenu.primeGameState(gameState, gameOptions);
    GameOver.primeGameState(gameState, gameOptions);
  }
  prototype.beginNewGame = function(gs){
    gs.metagameState = 'game';
    Arena.clearArena(gs.arena);
    Score.resetScore(gs.score);
    Brick.resetState(gs.brick);
    return gs;
  };
  prototype.revealStartMenu = function(gs){
    gs.metagameState = 'start-menu';
    return StartMenu.beginReveal(gs);
  };
  prototype.revealGameOver = function(gs){
    gs.metagameState = 'failure';
    return Timer.reset(gs.gameOver.revealAnimation);
  };
  prototype.handleKeyInput = function(gs){
    var brick, arena, input, lresult$, ref$, key, action, amt, i, pos, i$, to$, y, lresult1$, j$, to1$, x, results$ = [];
    brick = gs.brick, arena = gs.arena, input = gs.input;
    while (input.length) {
      lresult$ = [];
      ref$ = input.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'left':
          if (Arena.canMove(brick.current, [-1, 0], arena)) {
            lresult$.push(brick.current.pos[0] -= 1);
          }
          break;
        case 'right':
          if (Arena.canMove(brick.current, [1, 0], arena)) {
            lresult$.push(brick.current.pos[0] += 1);
          }
          break;
        case 'down':
          lresult$.push(gs.core.softDropMode = true);
          break;
        case 'up':
        case 'cw':
          if (Arena.canRotate(brick.current, 1, arena)) {
            lresult$.push(Brick.rotateBrick(brick.current, 1));
          }
          break;
        case 'ccw':
          if (Arena.canRotate(brick.current, -1, arena)) {
            lresult$.push(Brick.rotateBrick(brick.current, -1));
          }
          break;
        case 'hard-drop':
          gs.core.hardDropDistance = 0;
          while (Arena.canDrop(brick.current, arena)) {
            gs.core.hardDropDistance += 1;
            brick.current.pos[1] += 1;
          }
          gs.input = [];
          Timer.reset(gs.core.hardDropAnimation, gs.core.hardDropDistance * 10 + 1);
          lresult$.push(Timer.setTimeToExpiry(gs.core.dropTimer, -1));
          break;
        case 'debug-1':
        case 'debug-2':
        case 'debug-3':
        case 'debug-4':
          amt = parseInt(key.replace(/\D/g, ''));
          log("DEBUG: Destroying rows:", amt);
          gs.core.rowsToRemove = (fn$());
          gs.metagameState = 'remove-lines';
          gs.core.rowsRemovedThisFrame = true;
          Timer.reset(gs.arena.zapAnimation, Core.animationTimeForRows(gs.core.rowsToRemove));
          lresult$.push(Score.computeScore(gs.score, gs.core.rowsToRemove));
          break;
        case 'debug-5':
          pos = gs.brick.current.pos;
          gs.brick.current = Brick.newBrick(6);
          import$(gs.brick.current.pos, pos);
          for (i$ = arena.height - 1, to$ = arena.height - 4; i$ >= to$; --i$) {
            y = i$;
            lresult1$ = [];
            for (j$ = 0, to1$ = arena.width - 2; j$ <= to1$; ++j$) {
              x = j$;
              lresult1$.push(arena.cells[y][x] = 1);
            }
            lresult$.push(lresult1$);
          }
          break;
        case 'debug-6':
          gs.core.rowsToRemove = [10, 12, 14];
          gs.metagameState = 'remove-lines';
          gs.core.rowsRemovedThisFrame = true;
          lresult$.push(Timer.reset(gs.arena.zapAnimation, Core.animationTimeForRows(gs.core.rowsToRemove)));
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          lresult$.push(gs.core.softDropMode = false);
        }
      }
      results$.push(lresult$);
    }
    return results$;
    function fn$(){
      var i$, to$, results$ = [];
      for (i$ = gs.arena.height - amt, to$ = gs.arena.height - 1; i$ <= to$; ++i$) {
        i = i$;
        results$.push(i);
      }
      return results$;
    }
  };
  prototype.clearOneFrameFlags = function(gs){
    return gs.core.rowsRemovedThisFrame = false;
  };
  prototype.zapTick = function(gs){
    if (gs.arena.zapAnimation.expired) {
      Arena.removeRows(gs.arena, gs.core.rowsToRemove);
      gs.core.rowsToRemove = [];
      return gs.metagameState = 'game';
    }
  };
  prototype.gameTick = function(gs){
    var brick, arena, input, completeRows, res$, i$, ref$, len$, ix, row;
    brick = gs.brick, arena = gs.arena, input = gs.input;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
      ix = i$;
      row = ref$[i$];
      if (Arena.rowIsComplete(row)) {
        res$.push(ix);
      }
    }
    completeRows = res$;
    if (completeRows.length) {
      gs.metagameState = 'remove-lines';
      gs.core.rowsRemovedThisFrame = true;
      gs.core.rowsToRemove = completeRows;
      Timer.reset(gs.arena.zapAnimation, Core.animationTimeForRows(gs.core.rowsToRemove));
      Score.computeScore(gs.score, gs.core.rowsToRemove);
      return;
    }
    if (Arena.topIsReached(arena)) {
      this.revealGameOver(gs);
      return;
    }
    if (gs.core.softDropMode) {
      Timer.setTimeToExpiry(gs.core.dropTimer, 0);
    }
    if (gs.core.dropTimer.expired) {
      Timer.resetWithRemainder(gs.core.dropTimer);
      if (Arena.canDrop(brick.current, arena)) {
        brick.current.pos[1] += 1;
      } else {
        Arena.copyBrickToArena(brick.current, arena);
        Brick.spawnNewBrick(gs);
        Timer.reset(gs.core.previewRevealAnimation);
        gs.forceDropMode = false;
      }
    }
    return this.handleKeyInput(gs);
  };
  prototype.gameOverTick = function(gs, Δt){
    var input, gameOver, ref$, key, action, results$ = [];
    input = gs.input, gameOver = gs.gameOver;
    while (input.length) {
      ref$ = input.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'up':
          results$.push(GameOver.selectPrevItem(gameOver));
          break;
        case 'down':
          results$.push(GameOver.selectNextItem(gameOver));
          break;
        case 'action-a':
        case 'confirm':
          if (gameOver.currentState.state === 'restart') {
            results$.push(this.beginNewGame(gs));
          } else if (gameOver.currentState.state === 'go-back') {
            results$.push(this.revealStartMenu(gs));
          }
          break;
        case 'action-a':
        case 'confirm':
          results$.push(this.beginNewGame(gs));
        }
      }
    }
    return results$;
  };
  prototype.startMenuTick = function(gs){
    var input, startMenu, ref$, key, action, results$ = [];
    input = gs.input, startMenu = gs.startMenu;
    while (input.length) {
      ref$ = input.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'up':
          results$.push(StartMenu.selectPrevItem(startMenu));
          break;
        case 'down':
          results$.push(StartMenu.selectNextItem(startMenu));
          break;
        case 'action-a':
        case 'confirm':
          if (startMenu.currentState.state === 'start-game') {
            results$.push(this.beginNewGame(gs));
          }
        }
      }
    }
    return results$;
  };
  prototype.update = function(gs, arg$){
    var Δt, time, frame, fps, input;
    Δt = arg$.Δt, time = arg$.time, frame = arg$.frame, fps = arg$.fps, input = arg$.input;
    gs.fps = fps;
    gs.Δt = Δt;
    gs.elapsedTime = time;
    gs.elapsedFrames = frame;
    gs.input = input;
    if (!gs.core.paused) {
      Timer.updateAllIn(gs, Δt);
    }
    this.clearOneFrameFlags(gs);
    switch (gs.metagameState) {
    case 'no-game':
      this.revealStartMenu.apply(this, arguments);
      break;
    case 'game':
      this.gameTick.apply(this, arguments);
      break;
    case 'failure':
      this.gameOverTick.apply(this, arguments);
      break;
    case 'start-menu':
      this.startMenuTick.apply(this, arguments);
      break;
    case 'remove-lines':
      this.zapTick.apply(this, arguments);
      break;
    default:
      console.debug('Unknown metagame-state:', gs.metagameState);
    }
    return gs;
  };
  return TetrisGame;
}());
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../utils/timer":44,"./arena":8,"./brick":9,"./game-core":11,"./game-over":12,"./score":14,"./start-menu":15,"std":40}],14:[function(require,module,exports){
var ref$, id, log, addV2, randInt, wrap, randomFrom, BrickShapes, primeGameState, computeScore, updateScore, resetScore, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
BrickShapes = require('./data/brick-shapes');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.score = {
    points: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetris: 0
  };
};
out$.computeScore = computeScore = function(rows, lvl){
  lvl == null && (lvl = 0);
  switch (rows.length) {
  case 1:
    return 40 * (lvl + 1);
  case 2:
    return 100 * (lvl + 1);
  case 3:
    return 300 * (lvl + 1);
  case 4:
    return 1200 * (lvl + 1);
  }
};
out$.updateScore = updateScore = function(arg$, rowLength, points){
  var score;
  score = arg$.score;
  score.points += points;
  score.lines += rows.length;
  switch (rowLength) {
  case 1:
    return score.singles += 1;
  case 2:
    return score.doubles += 1;
  case 3:
    return score.triples += 1;
  case 4:
    return score.tetris += 1;
  }
};
out$.resetScore = resetScore = function(score){
  return import$(score, {
    points: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetris: 0
  });
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./data/brick-shapes":10,"std":40}],15:[function(require,module,exports){
var ref$, id, log, wrap, Timer, menuData, limiter, primeGameState, update, beginReveal, chooseOption, selectPrevItem, selectNextItem, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, wrap = ref$.wrap;
Timer = require('../utils/timer');
menuData = [
  {
    state: 'start-game',
    text: "Start Game"
  }, {
    state: 'nothing',
    text: "Don't Start Game"
  }
];
limiter = wrap(0, menuData.length - 1);
out$.primeGameState = primeGameState = function(gs, options){
  return gs.startMenu = {
    currentIndex: 0,
    currentState: menuData[0],
    menuData: menuData,
    titleRevealAnimation: Timer.create("Title reveal animation", options.animation.titleRevealTime)
  };
};
out$.update = update = function(gs){
  return handleInput(gs, gs.input);
};
out$.beginReveal = beginReveal = function(gs){
  return Timer.reset(gs.startMenu.titleRevealAnimation);
};
out$.chooseOption = chooseOption = function(sms, index){
  sms.currentIndex = limiter(index);
  return sms.currentState = menuData[sms.currentIndex];
};
out$.selectPrevItem = selectPrevItem = function(sms){
  var currentIndex;
  currentIndex = sms.currentIndex;
  return chooseOption(sms, currentIndex - 1);
};
out$.selectNextItem = selectNextItem = function(sms){
  var currentIndex;
  currentIndex = sms.currentIndex;
  return chooseOption(sms, currentIndex + 1);
};
},{"../utils/timer":44,"std":40}],16:[function(require,module,exports){
var ref$, id, log, pi, rand, floor, Base, Materials, ArenaCells, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, rand = ref$.rand, floor = ref$.floor;
Base = require('./base').Base;
Materials = require('../mats');
out$.ArenaCells = ArenaCells = (function(superclass){
  var prototype = extend$((import$(ArenaCells, superclass).displayName = 'ArenaCells', ArenaCells), superclass).prototype, constructor = ArenaCells;
  function ArenaCells(opts, gs){
    var blockSize, gridSize, width, height, margin, boxGeo, ref$, res$, i$, len$, y, row, lresult$, j$, len1$, x, cell, cube;
    blockSize = opts.blockSize, gridSize = opts.gridSize;
    ArenaCells.superclass.apply(this, arguments);
    width = gridSize * gs.arena.width;
    height = gridSize * gs.arena.height;
    margin = (gridSize - blockSize) / 2;
    boxGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    this.offset = new THREE.Object3D;
    this.registration.add(this.offset);
    ref$ = this.registration.position;
    ref$.x = width / -2 + 0.5 * gridSize;
    ref$.y = height - 0.5 * gridSize;
    this.registration.rotation.x = pi;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = gs.arena.cells).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        cube = new THREE.Mesh(boxGeo, Materials.normal);
        cube.position.set(x * gridSize, y * gridSize, 0);
        cube.visible = false;
        this.offset.add(cube);
        lresult$.push(cube);
      }
      res$.push(lresult$);
    }
    this.cells = res$;
  }
  prototype.toggleRowOfCells = function(rowIx, state){
    var i$, ref$, len$, box, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.cells[rowIx]).length; i$ < len$; ++i$) {
      box = ref$[i$];
      box.material = Materials.zap;
      results$.push(box.visible = state);
    }
    return results$;
  };
  prototype.showZapEffect = function(gs){
    var arena, core, onOff, i$, ref$, len$, rowIx, results$ = [];
    arena = gs.arena, core = gs.core;
    onOff = arena.zapAnimation.progress < 0.4 && !!(floor(arena.zapAnimation.currentTime * 10) % 2);
    onOff = !(floor(arena.zapAnimation.currentTime) % 2);
    for (i$ = 0, len$ = (ref$ = core.rowsToRemove).length; i$ < len$; ++i$) {
      rowIx = ref$[i$];
      results$.push(this.toggleRowOfCells(rowIx, onOff));
    }
    return results$;
  };
  prototype.updateCells = function(cells){
    var i$, len$, y, row, lresult$, j$, len1$, x, cell, results$ = [];
    for (i$ = 0, len$ = cells.length; i$ < len$; ++i$) {
      y = i$;
      row = cells[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        this.cells[y][x].visible = !!cell;
        lresult$.push(this.cells[y][x].material = Materials.blocks[cell]);
      }
      results$.push(lresult$);
    }
    return results$;
  };
  return ArenaCells;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"./base":18,"std":40}],17:[function(require,module,exports){
var ref$, id, log, max, rand, Base, Frame, FallingBrick, Guide, ArenaCells, ParticleEffect, Arena, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, max = ref$.max, rand = ref$.rand;
Base = require('./base').Base;
Frame = require('./frame').Frame;
FallingBrick = require('./falling-brick').FallingBrick;
Guide = require('./guide').Guide;
ArenaCells = require('./arena-cells').ArenaCells;
ParticleEffect = require('./particle-effect').ParticleEffect;
out$.Arena = Arena = (function(superclass){
  var prototype = extend$((import$(Arena, superclass).displayName = 'Arena', Arena), superclass).prototype, constructor = Arena;
  function Arena(opts, gs){
    var name, ref$, part;
    this.opts = opts;
    Arena.superclass.apply(this, arguments);
    log('Renderer::Arena::new');
    this.state = {
      framesSinceRowsRemoved: 0
    };
    this.parts = {
      frame: new Frame(this.opts, gs),
      guide: new Guide(this.opts, gs),
      arenaCells: new ArenaCells(this.opts, gs),
      thisBrick: new FallingBrick(this.opts, gs),
      particles: new ParticleEffect(this.opts, gs)
    };
    for (name in ref$ = this.parts) {
      part = ref$[name];
      part.addTo(this.registration);
    }
    this.registration.position.x = this.opts.arenaOffsetFromCentre;
  }
  prototype.jolt = function(gs){
    var p, zz, jolt;
    p = max(0, 1 - gs.arena.joltAnimation.progress);
    zz = gs.core.rowsToRemove.length;
    return jolt = -1 * p * (1 + zz) * this.opts.hardDropJoltAmount;
  };
  prototype.jitter = function(gs){
    var p, zz, jitter;
    p = 1 - gs.arena.zapAnimation.progress;
    zz = gs.core.rowsToRemove.length * this.opts.gridSize / 40;
    return jitter = [p * rand(-zz, zz), p * rand(-zz, zz)];
  };
  prototype.zapLines = function(gs, positionReceivingJolt){
    var jolt, jitter;
    this.parts.arenaCells.showZapEffect(gs);
    if (gs.core.rowsRemovedThisFrame) {
      this.parts.particles.reset();
      this.parts.particles.prepare(gs.core.rowsToRemove);
      this.state.framesSinceRowsRemoved = 0;
    }
    this.parts.guide.showFlare(gs.arena.joltAnimation.progress);
    jolt = this.jolt(gs);
    jitter = this.jitter(gs);
    positionReceivingJolt.x = jitter[0];
    return positionReceivingJolt.y = jitter[1] + jolt / 10;
  };
  prototype.updateParticles = function(gs){
    return this.parts.particles.update(gs.arena.zapAnimation.progress, this.state.framesSinceRowsRemoved, gs.Δt);
  };
  prototype.update = function(gs, positionReceivingJolt){
    var arena, brick;
    arena = gs.arena, brick = gs.brick;
    this.parts.arenaCells.updateCells(arena.cells);
    this.parts.thisBrick.displayShape(brick.current);
    this.parts.thisBrick.updatePosition(brick.current.pos);
    this.parts.guide.showBeam(brick.current);
    this.parts.guide.showFlare(arena.joltAnimation.progress, gs.hardDropDistance);
    positionReceivingJolt.y = this.jolt(gs);
    return this.state.framesSinceRowsRemoved += 1;
  };
  return Arena;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./arena-cells":16,"./base":18,"./falling-brick":22,"./frame":23,"./guide":24,"./particle-effect":29,"std":40}],18:[function(require,module,exports){
var ref$, id, log, Materials, Base, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Materials = require('../mats');
out$.Base = Base = (function(){
  Base.displayName = 'Base';
  var helperMarkerGeo, prototype = Base.prototype, constructor = Base;
  helperMarkerGeo = new THREE.CubeGeometry(0.02, 0.02, 0.02);
  function Base(opts, gs){
    this.opts = opts;
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.root.add(this.registration);
  }
  prototype.addRegistrationHelper = function(){
    var start, end, distance, dir, arrow;
    this.root.add(new THREE.Mesh(helperMarkerGeo, Materials.helperA));
    this.registration.add(new THREE.Mesh(helperMarkerGeo, Materials.helperB));
    start = new THREE.Vector3(0, 0, 0);
    end = this.registration.position;
    distance = start.distanceTo(end);
    if (distance > 0) {
      dir = new THREE.Vector3().subVectors(end, start).normalize();
      arrow = new THREE.ArrowHelper(dir, start, distance, 0x0000ff);
      this.root.add(arrow);
    }
    return log('Registration helper at', this);
  };
  prototype.addBoxHelper = function(thing){
    var bbox;
    bbox = new THREE.BoundingBoxHelper(thing, 0x5555ff);
    bbox.update();
    return this.root.add(bbox);
  };
  prototype.updateRegistrationHelper = function(){};
  prototype.showBounds = function(scene){
    this.bounds = new THREE.BoundingBoxHelper(this.root, 0x555555);
    this.bounds.update();
    return scene.add(this.bounds);
  };
  prototype.addTo = function(obj){
    return obj.add(this.root);
  };
  Object.defineProperty(prototype, 'position', {
    get: function(){
      return this.root.position;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'visible', {
    get: function(){
      return this.root.visible;
    },
    set: function(state){
      this.root.visible = state;
    },
    configurable: true,
    enumerable: true
  });
  return Base;
}());
},{"../mats":36,"std":40}],19:[function(require,module,exports){
var ref$, id, log, sin, min, Base, Brick, Ease, BrickPreview, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin, min = ref$.min;
Base = require('./base').Base;
Brick = require('./brick').Brick;
Ease = require('std').Ease;
out$.BrickPreview = BrickPreview = (function(superclass){
  var glassMat, prototype = extend$((import$(BrickPreview, superclass).displayName = 'BrickPreview', BrickPreview), superclass).prototype, constructor = BrickPreview;
  glassMat = new THREE.MeshPhongMaterial({
    color: 0x222222,
    transparent: true,
    specular: 0xffffff,
    shininess: 100,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  function BrickPreview(opts, gs){
    var tubeRadius, tubeHeight;
    this.opts = opts;
    BrickPreview.superclass.apply(this, arguments);
    this.s = this.opts.previewScaleFactor;
    this.color = 0xffffff;
    tubeRadius = this.opts.previewDomeRadius;
    tubeHeight = this.opts.previewDomeHeight;
    this.brick = new Brick(this.opts, gs);
    this.brick.root.scale.set(this.s, this.s, this.s);
    this.brick.root.position.y = this.opts.gridSize * 2;
    this.brick.root.position.x = 0;
    this.dome = new THREE.Mesh(new THREE.CapsuleGeometry(tubeRadius, 16, tubeHeight, 0), glassMat);
    this.dome.position.y = tubeHeight;
    this.base = void 8;
    this.light = new THREE.PointLight('orange', 1, 0.5);
    this.light.position.y = tubeHeight / 2;
    this.registration.add(this.dome);
    this.registration.add(this.light);
    this.registration.add(this.brick.root);
  }
  prototype.displayNothing = function(){
    this.brick.visible = false;
    return this.light.intensity = 0;
  };
  prototype.displayShape = function(brick){
    this.brick.visible = true;
    return this.brick.prettyDisplayShape(brick);
  };
  prototype.updateWiggle = function(gs){
    var elapsedTime, t, p;
    elapsedTime = gs.elapsedTime;
    this.root.rotation.y = 0.2 * sin(elapsedTime / 500);
    t = min(1, gs.core.previewRevealAnimation.progress);
    p = Ease.cubicIn(t, 0, this.s);
    this.brick.root.scale.set(p, p, p);
    if (t === 0) {
      this.light.intensity = 3;
      return this.light.color.setHex(0xffffff);
    } else {
      this.light.intensity = t;
      return this.light.color.setHex(0xffbb22);
    }
  };
  return BrickPreview;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"./brick":20,"std":40}],20:[function(require,module,exports){
var ref$, id, log, div, pi, Base, Materials, Brick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, div = ref$.div, pi = ref$.pi;
Base = require('./base').Base;
Materials = require('../mats');
out$.Brick = Brick = (function(superclass){
  var prettyOffset, prototype = extend$((import$(Brick, superclass).displayName = 'Brick', Brick), superclass).prototype, constructor = Brick;
  prettyOffset = {
    square: [-2, -2],
    zig: [-1.5, -2],
    zag: [-1.5, -2],
    left: [-1.5, -2],
    right: [-1.5, -2],
    tee: [-1.5, -2],
    tetris: [-2, -2.5]
  };
  function Brick(opts, gs){
    var size, grid, blockGeo, res$, i$, i, cube;
    this.opts = opts;
    Brick.superclass.apply(this, arguments);
    size = this.opts.blockSize;
    grid = this.opts.gridSize;
    this.brick = new THREE.Object3D;
    this.frame = new THREE.Mesh(new THREE.BoxGeometry(4 * grid, 4 * grid, grid), Materials.debugWireframe);
    blockGeo = new THREE.BoxGeometry(size, size, size);
    res$ = [];
    for (i$ = 0; i$ <= 3; ++i$) {
      i = i$;
      cube = new THREE.Mesh(blockGeo, Materials.normal);
      this.brick.add(cube);
      res$.push(cube);
    }
    this.cells = res$;
    this.registration.position.set(0 * grid, -0.5 * grid, 0);
    this.registration.rotation.x = pi;
    this.registration.add(this.brick);
  }
  prototype.prettyDisplayShape = function(brick){
    return this.displayShape(brick, true);
  };
  prototype.displayShape = function(arg$, pretty){
    var shape, type, ix, grid, margin, offset, i$, len$, y, row, lresult$, j$, len1$, x, cell, x$, results$ = [];
    shape = arg$.shape, type = arg$.type;
    pretty == null && (pretty = false);
    ix = 0;
    grid = this.opts.gridSize;
    margin = (this.opts.gridSize - this.opts.blockSize) / 2;
    offset = pretty
      ? prettyOffset[type]
      : [-2, -2];
    for (i$ = 0, len$ = shape.length; i$ < len$; ++i$) {
      y = i$;
      row = shape[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          x$ = this.cells[ix++];
          x$.position.x = (offset[0] + 0.5 + x) * grid + margin;
          x$.position.y = (offset[1] + 0.5 + y) * grid + margin;
          x$.material = Materials.blocks[cell];
          lresult$.push(x$);
        }
      }
      results$.push(lresult$);
    }
    return results$;
  };
  return Brick;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"./base":18,"std":40}],21:[function(require,module,exports){
var ref$, id, log, max, Base, FailScreen, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, max = ref$.max;
Base = require('./base').Base;
out$.FailScreen = FailScreen = (function(superclass){
  var prototype = extend$((import$(FailScreen, superclass).displayName = 'FailScreen', FailScreen), superclass).prototype, constructor = FailScreen;
  function FailScreen(opts, gs){
    this.opts = opts;
    FailScreen.superclass.apply(this, arguments);
    log("FailScreen::new");
  }
  prototype.update = function(gs){};
  return FailScreen;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"std":40}],22:[function(require,module,exports){
var ref$, id, log, sin, Base, Brick, FallingBrick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin;
Base = require('./base').Base;
Brick = require('./brick').Brick;
out$.FallingBrick = FallingBrick = (function(superclass){
  var prototype = extend$((import$(FallingBrick, superclass).displayName = 'FallingBrick', FallingBrick), superclass).prototype, constructor = FallingBrick;
  function FallingBrick(opts, gs){
    this.opts = opts;
    FallingBrick.superclass.apply(this, arguments);
    this.grid = opts.gridSize;
    this.height = this.grid * gs.arena.height;
    this.brick = new Brick(this.opts, gs);
    this.registration.add(this.brick.root);
    this.registration.position.x = -3 * this.grid;
    this.registration.position.y = -1.5 * this.grid;
  }
  prototype.displayShape = function(brick){
    return this.brick.displayShape(brick);
  };
  prototype.updatePosition = function(pos){
    var x, y;
    x = pos[0], y = pos[1];
    return this.root.position.set(this.grid * x, this.height - this.grid * y, 0);
  };
  return FallingBrick;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"./brick":20,"std":40}],23:[function(require,module,exports){
var ref$, id, log, Base, Frame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Base = require('./base').Base;
out$.Frame = Frame = (function(superclass){
  var prototype = extend$((import$(Frame, superclass).displayName = 'Frame', Frame), superclass).prototype, constructor = Frame;
  function Frame(opts, gs){
    this.opts = opts;
    Frame.superclass.apply(this, arguments);
  }
  return Frame;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"std":40}],24:[function(require,module,exports){
var ref$, id, sin, log, floor, Base, Materials, Palette, Guide, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, sin = ref$.sin, log = ref$.log, floor = ref$.floor;
Base = require('./base').Base;
Materials = require('../mats');
Palette = require('../palette');
out$.Guide = Guide = (function(superclass){
  var prettyOffset, prototype = extend$((import$(Guide, superclass).displayName = 'Guide', Guide), superclass).prototype, constructor = Guide;
  prettyOffset = {
    square: [3],
    zig: [2, 2],
    zag: [2, 2],
    left: [2, 1, 2, 3],
    right: [2, 3, 2, 1],
    tee: [2, 2, 2, 2],
    tetris: [3, 4]
  };
  function Guide(opts, gs){
    var gridSize, blockSize, width, geo, beamMat, flareMat;
    gridSize = opts.gridSize, blockSize = opts.blockSize;
    Guide.superclass.apply(this, arguments);
    width = gridSize * gs.arena.width;
    this.height = gridSize * gs.arena.height;
    this.gs = gs;
    this.state = {
      thisShape: null,
      lastShape: null
    };
    geo = new THREE.BoxGeometry(blockSize, this.height, gridSize * 0.9);
    geo.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.height / 2, 0));
    beamMat = Materials.flareFaces;
    flareMat = Materials.flareFaces.clone();
    this.beam = new THREE.Mesh(geo, beamMat);
    this.flare = new THREE.Mesh(geo, flareMat);
    this.registration.add(this.beam);
    this.registration.add(this.flare);
    this.registration.position.x = width / -2 - gridSize / 2;
    this.guideLight = new THREE.PointLight(0xffffff, 1, gridSize * 4);
    this.guideLight.position.y = 0.1;
    this.registration.add(this.guideLight);
    this.impactLight = new THREE.PointLight(0x00ff00, 10, gridSize * 6);
    this.impactLight.position.z = 0.1;
    this.impactLight.position.y = 0.2;
  }
  prototype.positionBeam = function(beam, beamShape){
    var w, g, x;
    w = 1 + beamShape.max - beamShape.min;
    g = this.opts.gridSize;
    x = g * (beamShape.pos + w / 2 + beamShape.min + 0.5);
    beam.scale.set(w, 1, 1);
    return beam.position.x = x;
  };
  prototype.showBeam = function(brick){
    var beamShape, i$, ref$, len$, y, row, j$, len1$, x, cell;
    beamShape = {
      min: 4,
      max: 0,
      pos: brick.pos[0],
      color: 'magenta',
      height: brick.pos[1] + prettyOffset[brick.type][brick.rotation]
    };
    for (i$ = 0, len$ = (ref$ = brick.shape).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          beamShape.color = Palette.specColors[cell];
          if (beamShape.min > x) {
            beamShape.min = x;
          }
          if (beamShape.max < x) {
            beamShape.max = x;
          }
        }
      }
    }
    x = this.positionBeam(this.beam, beamShape);
    this.guideLight.position.x = x;
    return this.state.thisShape = beamShape;
  };
  prototype.showFlare = function(p, dropped){
    var beamShape, g, x;
    if (p === 0) {
      log(this.state.lastShape = beamShape = this.state.thisShape);
      g = this.opts.gridSize;
      this.state.lastShape = beamShape = this.state.thisShape;
      this.flare.material.materials.map(function(it){
        var ref$;
        return (ref$ = it.emissive) != null ? ref$.setHex(beamShape.color) : void 8;
      });
      x = this.positionBeam(this.flare, beamShape);
      this.flare.scale.y = g * (1 + dropped) / this.height;
      this.flare.position.y = this.height - g * beamShape.height - g * dropped;
      this.impactLight.hex = beamShape.color;
      this.impactLight.position.x = x;
      this.impactLight.position.y = this.height - g * beamShape.height;
    }
    this.flare.material.materials.map(function(it){
      return it.opacity = 1 - p;
    });
    return this.impactLight.intensity = 10 * (1 - p);
  };
  return Guide;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"../palette":37,"./base":18,"std":40}],25:[function(require,module,exports){
var ref$, Arena, Title, Table, BrickPreview, Lighting, NixieDisplay, StartMenu, FailScreen, out$ = typeof exports != 'undefined' && exports || this;
import$(out$, (ref$ = require('./arena'), Arena = ref$.Arena, ref$));
import$(out$, (ref$ = require('./title'), Title = ref$.Title, ref$));
import$(out$, (ref$ = require('./table'), Table = ref$.Table, ref$));
import$(out$, (ref$ = require('./brick-preview'), BrickPreview = ref$.BrickPreview, ref$));
import$(out$, (ref$ = require('./lighting'), Lighting = ref$.Lighting, ref$));
import$(out$, (ref$ = require('./nixie'), NixieDisplay = ref$.NixieDisplay, ref$));
import$(out$, (ref$ = require('./start-menu'), StartMenu = ref$.StartMenu, ref$));
import$(out$, (ref$ = require('./fail-screen'), FailScreen = ref$.FailScreen, ref$));
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./arena":17,"./brick-preview":19,"./fail-screen":21,"./lighting":27,"./nixie":28,"./start-menu":30,"./table":31,"./title":32}],26:[function(require,module,exports){
var ref$, id, sin, lerp, log, floor, map, split, pi, tau, Base, Materials, LED, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, sin = ref$.sin, lerp = ref$.lerp, log = ref$.log, floor = ref$.floor, map = ref$.map, split = ref$.split, pi = ref$.pi, tau = ref$.tau;
Base = require('./base').Base;
Materials = require('../mats');
out$.LED = LED = (function(superclass){
  var halfSphere, prototype = extend$((import$(LED, superclass).displayName = 'LED', LED), superclass).prototype, constructor = LED;
  halfSphere = new THREE.SphereGeometry(0.01, 8, 8);
  function LED(opts, gs){
    this.opts = opts;
    LED.superclass.apply(this, arguments);
    this.mats = {
      off: Materials.glass,
      on: new THREE.MeshPhongMaterial({
        color: 0xfbb03b,
        blending: THREE.AdditiveBlending,
        emissive: 0xfbb0bb,
        specular: 'white',
        shininess: 100
      })
    };
    this.bulb = new THREE.Mesh(halfSphere, this.mats.off);
    this.light = new THREE.PointLight(0xfbb03b, 0, 0.1);
    this.light.position.y = 0.02;
    this.registration.add(this.bulb);
    this.registration.add(this.light);
  }
  prototype.setColor = function(color){
    this.bulb.material.color = color;
    return this.light.color = color;
  };
  prototype.on = function(){
    this.bulb.material = this.mats.on;
    return this.light.intensity = 0.3;
  };
  prototype.off = function(){
    this.bulb.material = this.mats.off;
    return this.light.intensity = 0;
  };
  return LED;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"./base":18,"std":40}],27:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, Base, Lighting, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos;
Base = require('./base').Base;
out$.Lighting = Lighting = (function(superclass){
  var mainLightDistance, prototype = extend$((import$(Lighting, superclass).displayName = 'Lighting', Lighting), superclass).prototype, constructor = Lighting;
  mainLightDistance = 2;
  function Lighting(opts, gs){
    this.opts = opts;
    Lighting.superclass.apply(this, arguments);
    this.light = new THREE.PointLight(0xffffff, 1, mainLightDistance);
    this.light.position.set(0, 1, 0);
    this.registration.add(this.light);
    this.spotlight = new THREE.SpotLight(0xffffff, 1, 50, 1);
    this.spotlight.position.set(0, 3, -1);
    this.spotlight.target.position.set(0, 0, -1);
    this.registration.add(this.spotlight);
    this.ambient = new THREE.AmbientLight(0x666666);
    this.registration.add(this.ambient);
    this.spotlight.castShadow = true;
    this.spotlight.shadowDarkness = 0.5;
    this.spotlight.shadowBias = 0.0001;
    this.spotlight.shadowMapWidth = 1024;
    this.spotlight.shadowMapHeight = 1024;
    this.spotlight.shadowCameraVisible = true;
    this.spotlight.shadowCameraNear = 10;
    this.spotlight.shadowCameraFar = 2500;
    this.spotlight.shadowCameraFov = 50;
  }
  prototype.showHelpers = function(){
    this.registration.add(new THREE.PointLightHelper(this.light, mainLightDistance));
    return this.registration.add(new THREE.SpotLightHelper(this.spotlight));
  };
  prototype.test = function(time){
    this.registration.position.x = 1.0 * sin(time / 500);
    return this.registration.position.y = 0.5 * cos(time / 500);
  };
  return Lighting;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"std":40}],28:[function(require,module,exports){
var ref$, id, sin, lerp, log, floor, map, split, pi, tau, Materials, Base, CapsuleGeometry, LED, NixieTube, NixieDisplay, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
ref$ = require('std'), id = ref$.id, sin = ref$.sin, lerp = ref$.lerp, log = ref$.log, floor = ref$.floor, map = ref$.map, split = ref$.split, pi = ref$.pi, tau = ref$.tau;
Materials = require('../mats');
Base = require('./base').Base;
CapsuleGeometry = require('../geometry/capsule').CapsuleGeometry;
LED = require('./led').LED;
NixieTube = (function(superclass){
  var prototype = extend$((import$(NixieTube, superclass).displayName = 'NixieTube', NixieTube), superclass).prototype, constructor = NixieTube;
  function NixieTube(opts, gs){
    var tubeRadius, tubeHeight, baseRadius, baseHeight, lampOffset, meshWidth, meshHeight, bgGeo, baseGeo, res$, i$, ref$, len$, ix, i, quad;
    this.opts = opts;
    NixieTube.superclass.apply(this, arguments);
    tubeRadius = this.opts.scoreTubeRadius;
    tubeHeight = this.opts.scoreTubeHeight;
    baseRadius = this.opts.scoreBaseRadius;
    baseHeight = this.opts.scoreTubeHeight / 10;
    lampOffset = this.opts.scoreIndicatorOffset;
    meshWidth = tubeRadius * 1.3;
    meshHeight = tubeRadius * 2.5;
    this.meshWidth = meshWidth;
    this.meshHeight = meshHeight;
    bgGeo = new THREE.PlaneBufferGeometry(meshWidth, meshHeight);
    baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 6, 0);
    baseGeo.applyMatrix(new THREE.Matrix4().makeRotationY(pi / 6));
    this.intensity = 0;
    this.glass = new THREE.Mesh(new THREE.CapsuleGeometry(tubeRadius, 16, tubeHeight, 0), Materials.glass);
    this.base = new THREE.Mesh(baseGeo, Materials.copper);
    this.bg = new THREE.Mesh(bgGeo, Materials.nixieBg);
    this.led = new LED(this.opts, gs);
    this.led.position.z = lampOffset;
    this.glass.position.y = tubeHeight;
    this.bg.position.y = meshHeight / 2 + baseHeight / 2;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).length; i$ < len$; ++i$) {
      ix = i$;
      i = ref$[i$];
      quad = this.createDigitQuad(i, ix);
      quad.position.y = meshHeight / 2 + baseHeight / 2;
      quad.visible = false;
      quad.digit = i;
      quad.renderOrder = 0;
      this.registration.add(quad);
      res$.push(quad);
    }
    this.digits = res$;
    this.light = new THREE.PointLight('orange', 0.3, 0.3);
    this.light.position.y = this.opts.scoreTubeHeight / 2;
    this.registration.add(this.glass);
    this.registration.add(this.base);
    this.registration.add(this.bg);
    this.registration.add(this.light);
    this.registration.add(this.led.root);
  }
  prototype.pulse = function(t){
    if (this.intensity === 0) {
      return this.light.intensity = 0;
    } else {
      return this.light.intensity = this.intensity + 0.1 * sin(t);
    }
  };
  prototype.showDigit = function(digit){
    this.intensity = digit != null ? 0.5 : 0;
    this.digits.map(function(it){
      return it.visible = it.digit === digit;
    });
    if (digit != null) {
      return this.led.on();
    } else {
      return this.led.off();
    }
  };
  prototype.createDigitQuad = function(digit, ix){
    var geom, quad;
    geom = new THREE.PlaneBufferGeometry(this.meshWidth, this.meshHeight);
    return quad = new THREE.Mesh(geom, Materials.nixieDigits[digit]);
  };
  return NixieTube;
}(Base));
out$.NixieDisplay = NixieDisplay = (function(superclass){
  var prototype = extend$((import$(NixieDisplay, superclass).displayName = 'NixieDisplay', NixieDisplay), superclass).prototype, constructor = NixieDisplay;
  function NixieDisplay(opts, gs){
    var offset, margin, baseRadius, res$, i$, to$, i, tube;
    this.opts = opts;
    NixieDisplay.superclass.apply(this, arguments);
    offset = this.opts.scoreDistanceFromCentre + this.opts.scoreBaseRadius;
    margin = this.opts.scoreInterTubeMargin;
    baseRadius = this.opts.scoreBaseRadius;
    this.count = 5;
    this.state = {
      lastSeenNumber: 0
    };
    res$ = [];
    for (i$ = 0, to$ = this.count; i$ < to$; ++i$) {
      i = i$;
      tube = new NixieTube(this.opts, gs);
      tube.position.x = margin * i + offset + i * this.opts.scoreBaseRadius * 2;
      this.registration.add(tube.root);
      res$.push(tube);
    }
    this.tubes = res$;
    this.registration.position.z = -this.opts.scoreDistanceFromEdge;
  }
  prototype.pulse = function(t){
    return this.tubes.map(function(it){
      return it.pulse(t);
    });
  };
  prototype.runToNumber = function(p, num){
    var nextNumber;
    nextNumber = floor(lerp(this.state.lastSeenNumber, num, p));
    return this.showNumber(nextNumber);
  };
  prototype.setNumber = function(num){
    this.state.lastSeenNumber = num;
    return this.showNumber(num);
  };
  prototype.showNumber = function(num){
    var digits, i$, i, tube, digit, results$ = [];
    num == null && (num = 0);
    digits = map(partialize$.apply(this, [parseInt, [void 8, 10], [0]]))(
    split('')(
    function(it){
      return it.toString();
    }(
    num)));
    for (i$ = this.count - 1; i$ >= 0; --i$) {
      i = i$;
      tube = this.tubes[i];
      digit = digits.pop();
      results$.push(tube.showDigit(digit));
    }
    return results$;
  };
  return NixieDisplay;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function partialize$(f, args, where){
  var context = this;
  return function(){
    var params = slice$.call(arguments), i,
        len = params.length, wlen = where.length,
        ta = args ? args.concat() : [], tw = where ? where.concat() : [];
    for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
    return len < wlen && len ?
      partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
  };
}
},{"../geometry/capsule":34,"../mats":36,"./base":18,"./led":26,"std":40}],29:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, rand, floor, Base, meshMaterials, ParticleBurst, ParticleEffect, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, rand = ref$.rand, floor = ref$.floor;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.ParticleBurst = ParticleBurst = (function(superclass){
  var speed, lifespan, prototype = extend$((import$(ParticleBurst, superclass).displayName = 'ParticleBurst', ParticleBurst), superclass).prototype, constructor = ParticleBurst;
  speed = 2;
  lifespan = 1500;
  function ParticleBurst(opts, gs){
    var arena, width, height, particles, geometry, color, material;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    ParticleBurst.superclass.apply(this, arguments);
    this.size = this.opts.zapParticleSize;
    particles = 1500;
    geometry = new THREE.BufferGeometry();
    color = new THREE.Color();
    this.positions = new Float32Array(particles * 3);
    this.velocities = new Float32Array(particles * 3);
    this.colors = new Float32Array(particles * 3);
    this.lifespans = new Float32Array(particles);
    this.alphas = new Float32Array(particles);
    this.maxlifes = new Float32Array(particles);
    this.posAttr = new THREE.BufferAttribute(this.positions, 3);
    this.colAttr = new THREE.BufferAttribute(this.colors, 3);
    this.alphaAttr = new THREE.BufferAttribute(this.alphas, 1);
    this.reset();
    geometry.addAttribute('position', this.posAttr);
    geometry.addAttribute('color', this.colAttr);
    geometry.addAttribute('opacity', this.alphaAttr);
    geometry.computeBoundingSphere();
    material = new THREE.PointCloudMaterial({
      size: this.size,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: THREE.VertexColors
    });
    this.root.add(new THREE.PointCloud(geometry, material));
  }
  prototype.reset = function(){
    var grid, i$, to$, i, x, z, results$ = [];
    grid = this.opts.gridSize;
    for (i$ = 0, to$ = this.positions.length; i$ < to$; i$ += 3) {
      i = i$;
      x = 4.5 - Math.random() * 9;
      z = 0.5 - Math.random();
      this.positions[i + 0] = x * grid;
      this.positions[i + 1] = 0;
      this.positions[i + 2] = z * grid;
      this.velocities[i + 0] = x / 10;
      this.velocities[i + 1] = rand(-2 * grid, 10 * grid);
      this.velocities[i + 2] = z;
      this.colors[i + 0] = 1;
      this.colors[i + 1] = 1;
      this.colors[i + 2] = 1;
      results$.push(this.lifespans[i / 3] = 0);
    }
    return results$;
  };
  prototype.accelerateParticle = function(i, t, p, bbx, bbz){
    var acc, px, py, pz, vx, vy, vz, px1, py1, pz1, vx1, vy1, vz1, l;
    if (this.lifespans[i / 3] <= 0) {
      this.positions[i + 1] = -1000;
      return;
    }
    t = t / (1000 / speed);
    acc = -0.98;
    px = this.positions[i + 0];
    py = this.positions[i + 1];
    pz = this.positions[i + 2];
    vx = this.velocities[i + 0];
    vy = this.velocities[i + 1];
    vz = this.velocities[i + 2];
    px1 = px + 0.5 * 0 * t * t + vx * t;
    py1 = py + 0.5 * acc * t * t + vy * t;
    pz1 = pz + 0.5 * 0 * t * t + vz * t;
    vx1 = 0 * t + vx;
    vy1 = acc * t + vy;
    vz1 = 0 * t + vz;
    if (py1 < this.size / 2 && (-bbx < px1 && px1 < bbx) && (-bbz + 1.9 * this.opts.gridSize < pz1 && pz1 < bbz + 1.9 * this.opts.gridSize)) {
      py1 = this.size / 2;
      vx1 *= 0.7;
      vy1 *= -0.6;
      vz1 *= 0.7;
    }
    this.positions[i + 0] = px1;
    this.positions[i + 1] = py1;
    this.positions[i + 2] = pz1;
    this.velocities[i + 0] = vx1;
    this.velocities[i + 1] = vy1;
    this.velocities[i + 2] = vz1;
    l = this.lifespans[i / 3] / this.maxlifes[i / 3];
    l = l * l * l;
    this.colors[i + 0] = l;
    this.colors[i + 1] = l;
    this.colors[i + 2] = l;
    return this.alphas[i / 3] = l;
  };
  prototype.setHeight = function(y){
    var grid, i$, to$, i, results$ = [];
    this.reset();
    grid = this.opts.gridSize;
    for (i$ = 0, to$ = this.positions.length; i$ < to$; i$ += 3) {
      i = i$;
      this.lifespans[i / 3] = lifespan / 2 + Math.random() * lifespan / 2;
      this.maxlifes[i / 3] = this.lifespans[i / 3];
      results$.push(this.positions[i + 1] = (y + Math.random()) * grid);
    }
    return results$;
  };
  prototype.update = function(p, Δt){
    var bounceBoundsX, bounceBoundsZ, i$, to$, i;
    bounceBoundsX = this.opts.deskSize[0] / 2;
    bounceBoundsZ = this.opts.deskSize[1] / 2;
    for (i$ = 0, to$ = this.positions.length; i$ < to$; i$ += 3) {
      i = i$;
      this.accelerateParticle(i, Δt, 1, bounceBoundsX, bounceBoundsZ);
      this.lifespans[i / 3] -= Δt;
    }
    this.posAttr.needsUpdate = true;
    return this.colAttr.needsUpdate = true;
  };
  return ParticleBurst;
}(Base));
out$.ParticleEffect = ParticleEffect = (function(superclass){
  var prototype = extend$((import$(ParticleEffect, superclass).displayName = 'ParticleEffect', ParticleEffect), superclass).prototype, constructor = ParticleEffect;
  function ParticleEffect(opts, gs){
    var arena, width, height, i$, ref$, len$, row;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    ParticleEffect.superclass.apply(this, arguments);
    this.z = this.opts.z;
    this.h = height;
    this.rows = [
      (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t;
        return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(ParticleBurst, arguments, function(){}), (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t;
        return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(ParticleBurst, arguments, function(){}), (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t;
        return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(ParticleBurst, arguments, function(){}), (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t;
        return (t = typeof result)  == "object" || t == "function" ? result || child : child;
  })(ParticleBurst, arguments, function(){})
    ];
    for (i$ = 0, len$ = (ref$ = this.rows).length; i$ < len$; ++i$) {
      row = ref$[i$];
      row.addTo(this.root);
    }
  }
  prototype.prepare = function(rows){
    var i$, len$, i, rowIx, results$ = [];
    for (i$ = 0, len$ = rows.length; i$ < len$; ++i$) {
      i = i$;
      rowIx = rows[i$];
      results$.push(this.rows[i].setHeight((this.h - 1) - rowIx));
    }
    return results$;
  };
  prototype.reset = function(){
    var i$, ref$, len$, system, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.rows).length; i$ < len$; ++i$) {
      system = ref$[i$];
      results$.push(system.reset());
    }
    return results$;
  };
  prototype.update = function(p, fsrr, Δt){
    var i$, ref$, len$, ix, system, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.rows).length; i$ < len$; ++i$) {
      ix = i$;
      system = ref$[i$];
      results$.push(system.update(p, Δt));
    }
    return results$;
  };
  return ParticleEffect;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../palette":37,"./base":18,"std":40}],30:[function(require,module,exports){
var ref$, id, log, sin, cos, Base, Title, canvasTexture, StartMenu, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin, cos = ref$.cos;
Base = require('./base').Base;
Title = require('./title').Title;
canvasTexture = function(){
  var textureSize, fidelityFactor, textCnv, imgCnv, textCtx, imgCtx;
  textureSize = 1024;
  fidelityFactor = 100;
  textCnv = document.createElement('canvas');
  imgCnv = document.createElement('canvas');
  textCtx = textCnv.getContext('2d');
  imgCtx = imgCnv.getContext('2d');
  imgCnv.width = imgCnv.height = textureSize;
  return function(arg$){
    var width, height, text, textSize, ref$;
    width = arg$.width, height = arg$.height, text = arg$.text, textSize = (ref$ = arg$.textSize) != null ? ref$ : 10;
    textCnv.width = width * fidelityFactor;
    textCnv.height = height * fidelityFactor;
    textCtx.textAlign = 'center';
    textCtx.textBaseline = 'middle';
    textCtx.fillStyle = 'white';
    textCtx.font = textSize * fidelityFactor + "px monospace";
    textCtx.fillText(text, width * fidelityFactor / 2, height * fidelityFactor / 2, width * fidelityFactor);
    imgCtx.clearRect(0, 0, textureSize, textureSize);
    imgCtx.fillRect(0, 0, textureSize, textureSize);
    imgCtx.drawImage(textCnv, 0, 0, textureSize, textureSize);
    return imgCnv.toDataURL();
  };
}();
out$.StartMenu = StartMenu = (function(superclass){
  var prototype = extend$((import$(StartMenu, superclass).displayName = 'StartMenu', StartMenu), superclass).prototype, constructor = StartMenu;
  function StartMenu(opts, gs){
    var i$, ref$, len$, ix, option, quad;
    this.opts = opts;
    StartMenu.superclass.apply(this, arguments);
    this.options = [];
    for (i$ = 0, len$ = (ref$ = gs.startMenu.menuData).length; i$ < len$; ++i$) {
      ix = i$;
      option = ref$[i$];
      quad = this.createOptionQuad(option, ix);
      quad.position.y = 0.5 - ix * 0.2;
      this.options.push(quad);
      this.registration.add(quad);
    }
    this.title = new Title(this.opts, gs);
    this.title.addTo(this.registration);
    this.registration.position.z = -1 * (this.opts.cameraDistanceFromEdge + this.opts.arenaDistanceFromEdge + this.opts.blockSize / 2);
  }
  prototype.createOptionQuad = function(option, ix){
    var image, tex, geom, mat, quad;
    image = canvasTexture({
      text: option.text,
      width: 60,
      height: 10
    });
    tex = THREE.ImageUtils.loadTexture(image);
    geom = new THREE.PlaneBufferGeometry(1, 0.2);
    mat = new THREE.MeshPhongMaterial({
      map: tex,
      alphaMap: tex,
      transparent: true
    });
    return quad = new THREE.Mesh(geom, mat);
  };
  prototype.update = function(gs){
    var startMenu;
    startMenu = gs.startMenu;
    this.title.reveal(startMenu.titleRevealAnimation.progress);
    return this.updateSelection(gs.startMenu, gs.elapsedTime);
  };
  prototype.updateSelection = function(state, time){
    var i$, ref$, len$, ix, quad, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.options).length; i$ < len$; ++i$) {
      ix = i$;
      quad = ref$[i$];
      if (ix === state.currentIndex) {
        quad.scale.x = 1 + 0.05 * sin(time / 300);
        results$.push(quad.scale.y = 1 + 0.05 * -sin(time / 300));
      }
    }
    return results$;
  };
  return StartMenu;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./base":18,"./title":32,"std":40}],31:[function(require,module,exports){
var ref$, id, log, Base, Materials, Table, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Base = require('./base').Base;
Materials = require('../mats');
out$.Table = Table = (function(superclass){
  var prototype = extend$((import$(Table, superclass).displayName = 'Table', Table), superclass).prototype, constructor = Table;
  function Table(opts, gs){
    var ref$, width, depth, thickness;
    this.opts = opts;
    Table.superclass.apply(this, arguments);
    ref$ = this.opts.deskSize, width = ref$[0], depth = ref$[1], thickness = ref$[2];
    this.table = new THREE.Mesh(new THREE.BoxGeometry(width, thickness, depth), Materials.tableFaces);
    this.table.receiveShadow = true;
    this.registration.add(this.table);
    this.registration.position.y = thickness / -2;
    this.registration.position.z = depth / -2;
  }
  return Table;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"./base":18,"std":40}],32:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, min, max, Ease, Base, Materials, blockText, Title, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, min = ref$.min, max = ref$.max;
Ease = require('std').Ease;
Base = require('./base').Base;
Materials = require('../mats');
blockText = {
  tetris: [[1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 0, 5, 6, 6, 6], [0, 1, 0, 2, 0, 0, 0, 3, 0, 4, 0, 4, 5, 6, 0, 0], [0, 1, 0, 2, 2, 0, 0, 3, 0, 4, 4, 0, 5, 6, 6, 6], [0, 1, 0, 2, 0, 0, 0, 3, 0, 4, 0, 4, 5, 0, 0, 6], [0, 1, 0, 2, 2, 2, 0, 3, 0, 4, 0, 4, 5, 6, 6, 6]],
  vrt: [[1, 0, 1, 4, 4, 6, 6, 6], [1, 0, 1, 4, 0, 4, 6, 0], [1, 0, 1, 4, 4, 0, 6, 0], [1, 0, 1, 4, 0, 4, 6, 0], [0, 1, 0, 4, 0, 4, 6, 0]],
  ghost: [[1, 1, 1, 2, 0, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5], [1, 0, 0, 2, 0, 2, 3, 0, 3, 4, 0, 0, 0, 5, 0], [1, 0, 0, 2, 2, 2, 3, 0, 3, 4, 4, 4, 0, 5, 0], [1, 0, 1, 2, 0, 2, 3, 0, 3, 0, 0, 4, 0, 5, 0], [1, 1, 1, 2, 0, 2, 3, 3, 3, 4, 4, 4, 0, 5, 0]]
};
out$.Title = Title = (function(superclass){
  var prototype = extend$((import$(Title, superclass).displayName = 'Title', Title), superclass).prototype, constructor = Title;
  function Title(opts, gs){
    var blockSize, gridSize, text, margin, height, blockGeo, i$, len$, y, row, j$, len1$, x, cell, box;
    blockSize = opts.blockSize, gridSize = opts.gridSize;
    Title.superclass.apply(this, arguments);
    text = blockText.vrt;
    margin = (gridSize - blockSize) / 2;
    height = gridSize * gs.arena.height;
    this.height = height;
    this.registration.add(this.word = new THREE.Object3D);
    this.word.position.x = (text[0].length - 1) * gridSize / -2;
    this.word.position.y = height / -2 - (text.length - 1) * gridSize / -2;
    this.word.position.z = gridSize / 2;
    blockGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    for (i$ = 0, len$ = text.length; i$ < len$; ++i$) {
      y = i$;
      row = text[i$];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          box = new THREE.Mesh(blockGeo, Materials.blocks[cell]);
          box.position.set(gridSize * x + margin, gridSize * (text.length - y) + margin, gridSize / -2);
          this.word.add(box);
        }
      }
    }
  }
  prototype.reveal = function(progress){
    var p;
    p = min(1, progress);
    this.registration.position.y = Ease.quintOut(p, this.height * 2, this.height);
    this.registration.rotation.y = Ease.expOut(p, 30, 0);
    return this.registration.rotation.x = Ease.expOut(p, -pi / 10, 0);
  };
  prototype.dance = function(time){
    this.registration.rotation.y = -pi / 2 + time / 1000;
    return this.word.opacity = 0.5 + 0.5 * sin + time / 1000;
  };
  return Title;
}(Base));
function extend$(sub, sup){
  function fun(){} fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended == 'function') sup.extended(sub);
  return sub;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"../mats":36,"./base":18,"std":40}],33:[function(require,module,exports){
var ref$, id, log, sin, pi, DebugCameraPositioner, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin, pi = ref$.pi;
out$.DebugCameraPositioner = DebugCameraPositioner = (function(){
  DebugCameraPositioner.displayName = 'DebugCameraPositioner';
  var prototype = DebugCameraPositioner.prototype, constructor = DebugCameraPositioner;
  function DebugCameraPositioner(camera, target){
    this.camera = camera;
    this.target = target;
    this.state = {
      enabled: false,
      target: new THREE.Vector3(0, 0, 0)
    };
  }
  prototype.enable = function(){
    return this.state.enabled = true;
  };
  prototype.update = function(gs){
    if (this.state.enabled) {
      return this.autoRotate(gs.elapsedTime);
    }
  };
  prototype.setPosition = function(phase, vphase){
    var that;
    vphase == null && (vphase = 0);
    this.camera.position.x = this.r * sin(phase);
    this.camera.position.y = this.y + this.r * -sin(vphase);
    return this.camera.lookAt((that = this.target.position) != null
      ? that
      : this.target);
  };
  prototype.autoRotate = function(time){
    return this.setPosition(pi / 10 * sin(time / 1000));
  };
  return DebugCameraPositioner;
}());
},{"std":40}],34:[function(require,module,exports){
var pi;
pi = require('std').pi;
THREE.CapsuleGeometry = function(radius, radialSegments, height, lengthwiseSegments){
  var halfSphere, tube;
  halfSphere = new THREE.SphereGeometry(radius, radialSegments, radialSegments, 0, pi);
  halfSphere.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 0));
  halfSphere.applyMatrix(new THREE.Matrix4().makeRotationX(-pi / 2));
  halfSphere.applyMatrix(new THREE.Matrix4().makeScale(1, 0.5, 1));
  tube = new THREE.CylinderGeometry(radius, radius, height, radialSegments * 2, lengthwiseSegments, true);
  tube.applyMatrix(new THREE.Matrix4().makeTranslation(0, -height / 2, 0));
  halfSphere.merge(tube);
  return halfSphere;
};
},{"std":40}],35:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, lerp, rand, floor, map, Ease, THREE, Palette, SceneManager, DebugCameraPositioner, Arena, Table, StartMenu, FailScreen, Lighting, BrickPreview, NixieDisplay, TrackballControls, ThreeJsRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, lerp = ref$.lerp, rand = ref$.rand, floor = ref$.floor, map = ref$.map;
Ease = require('std').Ease;
THREE = require('three-js-vr-extensions');
Palette = require('./palette').Palette;
SceneManager = require('./scene-manager').SceneManager;
DebugCameraPositioner = require('./debug-camera').DebugCameraPositioner;
ref$ = require('./components'), Arena = ref$.Arena, Table = ref$.Table, StartMenu = ref$.StartMenu, FailScreen = ref$.FailScreen, Lighting = ref$.Lighting, BrickPreview = ref$.BrickPreview, NixieDisplay = ref$.NixieDisplay;
TrackballControls = require('../../lib/trackball-controls.js').TrackballControls;
out$.ThreeJsRenderer = ThreeJsRenderer = (function(){
  ThreeJsRenderer.displayName = 'ThreeJsRenderer';
  var prototype = ThreeJsRenderer.prototype, constructor = ThreeJsRenderer;
  function ThreeJsRenderer(opts, gs){
    var arena, width, height, name, ref$, part;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    log("Renderer::new");
    this.scene = new SceneManager(this.opts);
    this.opts.scene = this.scene;
    this.state = {
      framesSinceRowsRemoved: 0,
      lastSeenState: 'no-game'
    };
    this.scene.add(this.jitter = new THREE.Object3D);
    this.parts = {
      table: new Table(this.opts, gs),
      lighting: new Lighting(this.opts, gs),
      arena: new Arena(this.opts, gs),
      startMenu: new StartMenu(this.opts, gs),
      failScreen: new FailScreen(this.opts, gs),
      nextBrick: new BrickPreview(this.opts, gs),
      score: new NixieDisplay(this.opts, gs)
    };
    for (name in ref$ = this.parts) {
      part = ref$[name];
      part.addTo(this.jitter);
    }
    this.parts.nextBrick.root.position.set(-this.opts.previewDistanceFromCenter, 0, -this.opts.previewDistanceFromEdge);
    this.parts.arena.root.position.set(0, 0, -this.opts.arenaDistanceFromEdge);
    this.addTrackball();
    this.scene.controls.resetSensor();
    this.scene.registration.position.set(0, -this.opts.cameraElevation, -this.opts.cameraDistanceFromEdge * 4);
    this.scene.showHelpers();
  }
  prototype.addTrackball = function(){
    var trackballTarget;
    trackballTarget = new THREE.Object3D;
    trackballTarget.position.z = -this.opts.cameraDistanceFromEdge;
    this.scene.add(trackballTarget);
    this.trackball = new THREE.TrackballControls(this.scene.camera, trackballTarget);
    return this.trackball.panSpeed = 1;
  };
  prototype.appendTo = function(host){
    return host.appendChild(this.scene.domElement);
  };
  prototype.render = function(gs){
    var rows, p;
    this.trackball.update();
    this.scene.update();
    if (gs.metagameState !== this.state.lastSeenState) {
      this.parts.startMenu.visible = false;
      this.parts.arena.visible = false;
      switch (gs.metagameState) {
      case 'remove-lines':
        // fallthrough
      case 'game':
        this.parts.arena.visible = true;
        break;
      case 'start-menu':
        this.parts.startMenu.visible = true;
        break;
      }
    }
    switch (gs.metagameState) {
    case 'no-game':
      log('no-game');
      break;
    case 'remove-lines':
      rows = gs.core.rowsToRemove.length;
      p = gs.arena.zapAnimation.progress;
      gs.slowdown = 1 + Ease.expIn(p, 2, 0);
      this.parts.arena.zapLines(gs, this.jitter.position);
      this.parts.nextBrick.updateWiggle(gs);
      this.parts.score.runToNumber(gs.arena.zapAnimation.progress, gs.score.points);
      this.parts.score.pulse(gs.elapsedTime / 1000);
      break;
    case 'game':
      gs.slowdown = 1;
      this.parts.arena.update(gs, this.jitter.position);
      this.parts.nextBrick.displayShape(gs.brick.next);
      this.parts.nextBrick.updateWiggle(gs);
      this.parts.score.setNumber(gs.score.points);
      this.parts.score.pulse(gs.elapsedTime / 1000);
      break;
    case 'start-menu':
      this.parts.nextBrick.displayNothing();
      this.parts.startMenu.update(gs);
      break;
    case 'pause-menu':
      this.parts.nextBrick.displayNothing();
      this.parts.pauseMenu.update(gs);
      break;
    case 'failure':
      this.parts.nextBrick.displayNothing();
      this.parts.failScreen.update(gs);
      break;
    default:
      log("ThreeJsRenderer::render - Unknown metagamestate:", gs.metagameState);
    }
    this.parts.arena.updateParticles(gs);
    this.state.lastSeenState = gs.metagameState;
    return this.scene.render();
  };
  return ThreeJsRenderer;
}());
},{"../../lib/trackball-controls.js":5,"./components":25,"./debug-camera":33,"./palette":37,"./scene-manager":38,"std":40,"three-js-vr-extensions":4}],36:[function(require,module,exports){
var ref$, id, log, sin, Palette, assetPath, textures, i, empty, normal, debugWireframe, helperA, helperB, glass, copper, nixieDigits, nixieBg, blocks, color, holoBlocks, zap, tableTop, tableEdge, tableFaces, lines, flare, flareFaces, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin;
Palette = require('./palette').Palette;
assetPath = (function(it){
  return "assets/" + it;
});
textures = {
  nixieDigitsColor: (function(){
    var i$, results$ = [];
    for (i$ = 0; i$ <= 9; ++i$) {
      i = i$;
      results$.push(THREE.ImageUtils.loadTexture(assetPath("digit-" + i + ".col.png")));
    }
    return results$;
  }()),
  nixieBgColor: THREE.ImageUtils.loadTexture(assetPath("digit-bg.col.png")),
  blockTileNormal: THREE.ImageUtils.loadTexture(assetPath("tile.nrm.png")),
  tableTopColor: THREE.ImageUtils.loadTexture(assetPath("board.col.png")),
  tableEdgeColor: THREE.ImageUtils.loadTexture(assetPath("board-f.col.png")),
  tableTopSpecular: THREE.ImageUtils.loadTexture(assetPath("board.spec.png")),
  flareAlpha: THREE.ImageUtils.loadTexture(assetPath("flare.alpha.png"))
};
out$.empty = empty = new THREE.MeshBasicMaterial({
  visible: false,
  color: 0x0,
  emissive: 0x0,
  opacity: 0
});
out$.normal = normal = new THREE.MeshNormalMaterial;
out$.debugWireframe = debugWireframe = new THREE.MeshBasicMaterial({
  color: 'white',
  wireframe: true
});
out$.helperA = helperA = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.5
});
out$.helperB = helperB = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0.5
});
out$.glass = glass = new THREE.MeshPhongMaterial({
  color: 0x222222,
  transparent: true,
  specular: 0xffffff,
  shininess: 100,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
out$.copper = copper = new THREE.MeshPhongMaterial({
  color: 0x965111,
  specular: 0xcb6d51,
  shininess: 30
});
out$.nixieDigits = nixieDigits = (function(){
  var i$, results$ = [];
  for (i$ = 0; i$ <= 9; ++i$) {
    i = i$;
    results$.push(new THREE.MeshPhongMaterial({
      map: textures.nixieDigitsColor[i],
      transparent: true,
      color: 0xff3300,
      emissive: 0xffbb00
    }));
  }
  return results$;
}());
out$.nixieBg = nixieBg = new THREE.MeshPhongMaterial({
  map: textures.nixieBgColor,
  color: 0x000000,
  transparent: true,
  specular: 0xffffff,
  shininess: 80
});
out$.blocks = blocks = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = Palette.tileColors).length; i$ < len$; ++i$) {
    i = i$;
    color = ref$[i$];
    results$.push(new THREE.MeshPhongMaterial({
      metal: true,
      color: color,
      specular: Palette.specColors[i],
      shininess: 100,
      normalMap: textures.blockTileNormal
    }));
  }
  return results$;
}());
out$.holoBlocks = holoBlocks = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = Palette.tileColors).length; i$ < len$; ++i$) {
    i = i$;
    color = ref$[i$];
    results$.push(new THREE.MeshPhongMaterial({
      metal: true,
      color: color,
      transparent: true,
      emissive: 0xffffff,
      opacity: 0.5,
      specular: Palette.specColors[i],
      shininess: 100,
      normalMap: textures.blockTileNormal
    }));
  }
  return results$;
}());
out$.zap = zap = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  emissive: 0xffffff
});
out$.tableTop = tableTop = new THREE.MeshPhongMaterial({
  map: textures.tableTopColor,
  specular: 0xffffff,
  specularMap: textures.tableTopSpecular,
  shininess: 100
});
out$.tableEdge = tableEdge = new THREE.MeshPhongMaterial({
  map: textures.tableEdgeColor
});
out$.tableFaces = tableFaces = new THREE.MeshFaceMaterial([tableEdge, tableEdge, tableTop, tableEdge, tableEdge, tableEdge]);
out$.lines = lines = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = Palette.tileColors).length; i$ < len$; ++i$) {
    color = ref$[i$];
    results$.push(new THREE.LineBasicMaterial({
      color: color
    }));
  }
  return results$;
}());
out$.flare = flare = new THREE.MeshPhongMaterial({
  color: 0x0,
  transparent: true,
  emissive: 'white',
  opacity: 0.2,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  alphaMap: textures.flareAlpha
});
out$.flareFaces = flareFaces = new THREE.MeshFaceMaterial([flare, flare, empty, empty, flare, flare]);
},{"./palette":37,"std":40}],37:[function(require,module,exports){
var THREE, ref$, log, map, pluck, neutral, red, orange, green, magenta, blue, brown, yellow, cyan, colorOrder, tileColors, specColors, Palette, out$ = typeof exports != 'undefined' && exports || this;
THREE = require('three-js-vr-extensions');
ref$ = require('std'), log = ref$.log, map = ref$.map, pluck = ref$.pluck;
out$.neutral = neutral = [0xffffff, 0xcccccc, 0x888888, 0x212121];
out$.red = red = [0xFF4444, 0xFF7777, 0xdd4444, 0x551111];
out$.orange = orange = [0xFFBB33, 0xFFCC88, 0xCC8800, 0x553300];
out$.green = green = [0x44ff66, 0x88ffaa, 0x22bb33, 0x115511];
out$.magenta = magenta = [0xff33ff, 0xffaaff, 0xbb22bb, 0x551155];
out$.blue = blue = [0x66bbff, 0xaaddff, 0x5588ee, 0x111155];
out$.brown = brown = [0xffbb33, 0xffcc88, 0xbb9900, 0x555511];
out$.yellow = yellow = [0xeeee11, 0xffffaa, 0xccbb00, 0x555511];
out$.cyan = cyan = [0x44ddff, 0xaae3ff, 0x00aacc, 0x006699];
colorOrder = [neutral, red, orange, yellow, green, cyan, blue, magenta];
out$.tileColors = tileColors = map(pluck(2), colorOrder);
out$.specColors = specColors = map(pluck(0), colorOrder);
out$.Palette = Palette = {
  neutral: neutral,
  red: red,
  orange: orange,
  yellow: yellow,
  green: green,
  cyan: cyan,
  blue: blue,
  magenta: magenta,
  tileColors: tileColors,
  specColors: specColors
};
},{"std":40,"three-js-vr-extensions":4}],38:[function(require,module,exports){
var ref$, id, log, THREE, Materials, SceneManager, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
THREE = require('three-js-vr-extensions');
Materials = require('./mats');
out$.SceneManager = SceneManager = (function(){
  SceneManager.displayName = 'SceneManager';
  var helperMarkerSize, helperMarkerOpacity, helperMarkerGeo, prototype = SceneManager.prototype, constructor = SceneManager;
  helperMarkerSize = 0.02;
  helperMarkerOpacity = 0.3;
  helperMarkerGeo = new THREE.CubeGeometry(helperMarkerSize, helperMarkerSize, helperMarkerSize);
  function SceneManager(opts){
    var aspect;
    this.opts = opts;
    this.resize = bind$(this, 'resize', prototype);
    this.zeroSensor = bind$(this, 'zeroSensor', prototype);
    this.goFullscreen = bind$(this, 'goFullscreen', prototype);
    aspect = window.innerWidth / window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.001, 1000);
    this.controls = new THREE.VRControls(this.camera);
    this.vrEffect = new THREE.VREffect(this.renderer);
    this.vrEffect.setSize(window.innerWidth - 1, window.innerHeight - 1);
    window.addEventListener('keydown', this.zeroSensor, true);
    window.addEventListener('resize', this.resize, false);
    document.body.addEventListener('dblclick', this.goFullscreen);
    this.state = {
      vrMode: navigator.getVRDevices != null
    };
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.scene.add(this.root);
    this.root.add(this.registration);
  }
  prototype.addRegistrationHelper = function(){
    this.root.add(new THREE.Mesh(helperMarkerGeo, Materials.helperA));
    return this.registration.add(new THREE.Mesh(helperMarkerGeo, Materials.helperB));
  };
  prototype.showHelpers = function(){
    var grid, axis, rootAxis;
    grid = new THREE.GridHelper(10, 0.1);
    axis = new THREE.AxisHelper(1);
    rootAxis = new THREE.AxisHelper(0.5);
    axis.position.z = this.registration.position.z;
    return rootAxis.position.z = this.root.position.z;
  };
  prototype.enableShadowCasting = function(){
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowCameraFar = 1000;
    this.renderer.shadowCameraFov = 50;
    this.renderer.shadowCameraNear = 3;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024;
    return this.renderer.shadowMapDarkness = 0.5;
  };
  prototype.goFullscreen = function(){
    log('Starting fullscreen...');
    return this.vrEffect.setFullScreen(true);
  };
  prototype.zeroSensor = function(event){
    var keyCode;
    keyCode = event.keyCode;
    event.preventDefault();
    if (keyCode === 86) {
      return this.controls.resetSensor();
    }
  };
  prototype.resize = function(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    return this.vrEffect.setSize(window.innerWidth, window.innerHeight);
  };
  prototype.update = function(){
    return this.controls.update();
  };
  prototype.render = function(){
    return this.vrEffect.render(this.scene, this.camera);
  };
  Object.defineProperty(prototype, 'domElement', {
    get: function(){
      return this.renderer.domElement;
    },
    configurable: true,
    enumerable: true
  });
  prototype.add = function(){
    var i$, len$, obj, that, results$ = [];
    for (i$ = 0, len$ = arguments.length; i$ < len$; ++i$) {
      obj = arguments[i$];
      log('SceneManager::add -', obj);
      results$.push(this.registration.add((that = obj.root) != null ? that : obj));
    }
    return results$;
  };
  return SceneManager;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"./mats":36,"std":40,"three-js-vr-extensions":4}],39:[function(require,module,exports){
var pow, quadIn, quadOut, cubicIn, cubicOut, quartIn, quartOut, quintIn, quintOut, expIn, expOut, out$ = typeof exports != 'undefined' && exports || this;
pow = require('std').pow;
out$.quadIn = quadIn = function(t, b, e, c){
  c == null && (c = e - b);
  return c * t * t + b;
};
out$.quadOut = quadOut = function(t, b, e, c){
  c == null && (c = e - b);
  return -c * t * (t - 2) + b;
};
out$.cubicIn = cubicIn = function(t, b, e, c){
  c == null && (c = e - b);
  return c * Math.pow(t, 3) + b;
};
out$.cubicOut = cubicOut = function(t, b, e, c){
  c == null && (c = e - b);
  return c * (Math.pow(t - 1, 3) + 1) + b;
};
out$.quartIn = quartIn = function(t, b, e, c){
  c == null && (c = e - b);
  return c * Math.pow(t, 4) + b;
};
out$.quartOut = quartOut = function(t, b, e, c){
  c == null && (c = e - b);
  return -c * (Math.pow(t - 1, 4) - 1) + b;
};
out$.quintIn = quintIn = function(t, b, e, c){
  c == null && (c = e - b);
  return c * Math.pow(t, 5) + b;
};
out$.quintOut = quintOut = function(t, b, e, c){
  c == null && (c = e - b);
  return c * (Math.pow(t - 1, 5) + 1) + b;
};
out$.expIn = expIn = function(t, b, e, c){
  c == null && (c = e - b);
  return c * pow(2, 10 * (t - 1)) + b;
};
out$.expOut = expOut = function(t, b, e, c){
  c == null && (c = e - b);
  return c * ((-pow(2, -10 * t)) + 1) + b;
};
},{"std":40}],40:[function(require,module,exports){
var id, log, flip, delay, floor, random, rand, randInt, randomFrom, addV2, filter, pluck, pi, tau, pow, sin, cos, min, max, lerp, map, split, join, unlines, div, wrap, limit, raf, that, Ease, out$ = typeof exports != 'undefined' && exports || this;
out$.id = id = function(it){
  return it;
};
out$.log = log = function(){
  console.log.apply(console, arguments);
  return arguments[0];
};
out$.flip = flip = function(λ){
  return function(a, b){
    return λ(b, a);
  };
};
out$.delay = delay = flip(setTimeout);
out$.floor = floor = Math.floor;
out$.random = random = Math.random;
out$.rand = rand = function(min, max){
  return min + random() * (max - min);
};
out$.randInt = randInt = function(min, max){
  return min + floor(random() * (max - min));
};
out$.randomFrom = randomFrom = function(list){
  return list[rand(0, list.length - 1)];
};
out$.addV2 = addV2 = function(a, b){
  return [a[0] + b[0], a[1] + b[1]];
};
out$.filter = filter = curry$(function(λ, list){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = list.length; i$ < len$; ++i$) {
    x = list[i$];
    if (λ(x)) {
      results$.push(x);
    }
  }
  return results$;
});
out$.pluck = pluck = curry$(function(p, o){
  return o[p];
});
out$.pi = pi = Math.PI;
out$.tau = tau = pi * 2;
out$.pow = pow = Math.pow;
out$.sin = sin = Math.sin;
out$.cos = cos = Math.cos;
out$.min = min = Math.min;
out$.max = max = Math.max;
out$.lerp = lerp = curry$(function(min, max, p){
  return min + p * (max - min);
});
out$.map = map = curry$(function(λ, l){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = l.length; i$ < len$; ++i$) {
    x = l[i$];
    results$.push(λ(x));
  }
  return results$;
});
out$.split = split = curry$(function(char, str){
  return str.split(char);
});
out$.join = join = curry$(function(char, str){
  return str.join(char);
});
out$.unlines = unlines = join("\n");
out$.div = div = curry$(function(a, b){
  return floor(a / b);
});
out$.wrap = wrap = curry$(function(min, max, n){
  if (n > max) {
    return min;
  } else if (n < min) {
    return max;
  } else {
    return n;
  }
});
out$.limit = limit = curry$(function(min, max, n){
  if (n > max) {
    return max;
  } else if (n < min) {
    return min;
  } else {
    return n;
  }
});
out$.raf = raf = (that = window.requestAnimationFrame) != null
  ? that
  : (that = window.webkitRequestAnimationFrame) != null
    ? that
    : (that = window.mozRequestAnimationFrame) != null
      ? that
      : function(λ){
        return setTimeout(λ, 1000 / 60);
      };
out$.Ease = Ease = require('./easing');
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{"./easing":39}],41:[function(require,module,exports){
var ref$, id, log, unlines, Timer, template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, unlines = ref$.unlines;
Timer = require('../utils/timer');
template = {
  cell: function(it){
    if (it) {
      return "▒▒";
    } else {
      return "  ";
    }
  },
  score: function(){
    return JSON.stringify(this, null, 2);
  },
  brick: function(){
    return this.shape.map(function(it){
      return it.map(template.cell).join(' ');
    }).join("\n        ");
  },
  keys: function(){
    var i$, len$, keySummary, results$ = [];
    if (this.length) {
      for (i$ = 0, len$ = this.length; i$ < len$; ++i$) {
        keySummary = this[i$];
        results$.push(keySummary.key + '-' + keySummary.action + "|");
      }
      return results$;
    } else {
      return "(no change)";
    }
  },
  normal: function(){
    var fpsColor;
    fpsColor = this.fps >= 55
      ? '#0f0'
      : this.fps >= 30 ? '#ff0' : '#f00';
    return "score - " + template.score.apply(this.score) + "\n\n meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n  fps - <span style=\"color:" + fpsColor + "\">" + this.fps + "</span>\n keys - " + template.keys.apply(this.inputState) + "\n\n drop - " + Timer.toString(this.core.dropTimer) + "\n  zap - " + Timer.toString(this.arena.zapAnimation);
  },
  menuItems: function(){
    var ix, item;
    return "" + unlines((function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.menuData).length; i$ < len$; ++i$) {
        ix = i$;
        item = ref$[i$];
        results$.push(template.menuItem.call(item, ix, this.currentIndex));
      }
      return results$;
    }.call(this)));
  },
  startMenu: function(){
    return "START MENU\n" + template.menuItems.apply(this);
  },
  menuItem: function(index, currentIndex){
    return "" + (index === currentIndex ? ">" : " ") + " " + this.text;
  },
  failure: function(){
    return "   GAME OVER\n\n     Score\n\n  Single - " + this.score.singles + "\n  Double - " + this.score.doubles + "\n  Triple - " + this.score.triples + "\n  Tetris - " + this.score.tetris + "\n\nTotal Lines: " + this.score.lines + "\n\n" + template.menuItems.apply(this.gameOver);
  }
};
out$.DebugOutput = DebugOutput = (function(){
  DebugOutput.displayName = 'DebugOutput';
  var prototype = DebugOutput.prototype, constructor = DebugOutput;
  function DebugOutput(){
    var ref$;
    this.dbo = document.createElement('pre');
    document.body.appendChild(this.dbo);
    ref$ = this.dbo.style;
    ref$.position = 'absolute';
    ref$.top = 0;
    ref$.left = 0;
  }
  prototype.render = function(state){
    switch (state.metagameState) {
    case 'game':
      return this.dbo.innerHTML = template.normal.apply(state);
    case 'failure':
      return this.dbo.innerHTML = template.failure.apply(state);
    case 'start-menu':
      return this.dbo.innerHTML = template.startMenu.apply(state.startMenu);
    case 'remove-lines':
      return this.dbo.innerHTML = template.normal.apply(state);
    default:
      return this.dbo.innerHTML = "Unknown metagame state: " + state.metagameState;
    }
  };
  return DebugOutput;
}());
},{"../utils/timer":44,"std":40}],42:[function(require,module,exports){
var ref$, id, log, raf, floor, FrameDriver, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, raf = ref$.raf, floor = ref$.floor;
out$.FrameDriver = FrameDriver = (function(){
  FrameDriver.displayName = 'FrameDriver';
  var fpsHistoryWindow, prototype = FrameDriver.prototype, constructor = FrameDriver;
  fpsHistoryWindow = 20;
  function FrameDriver(onFrame){
    this.onFrame = onFrame;
    this.frame = bind$(this, 'frame', prototype);
    log("FrameDriver::new");
    this.state = {
      zero: 0,
      time: 0,
      frame: 0,
      running: false
    };
    this.fps = 0;
    this.fpsHistory = repeatArray$([0], fpsHistoryWindow);
  }
  prototype.frame = function(){
    var now, Δt;
    if (this.state.running) {
      raf(this.frame);
    }
    now = Date.now() - this.state.zero;
    Δt = now - this.state.time;
    this.pushHistory(Δt);
    this.state.time = now;
    this.state.frame = this.state.frame + 1;
    this.state.Δt = Δt;
    return this.onFrame(Δt, this.state.time, this.state.frame, this.fps);
  };
  prototype.start = function(){
    if (this.state.running === true) {
      return;
    }
    log("FrameDriver::Start - starting");
    this.state.zero = Date.now();
    this.state.time = 0;
    this.state.running = true;
    return this.frame();
  };
  prototype.stop = function(){
    if (this.state.running === false) {
      return;
    }
    log("FrameDriver::Stop - stopping");
    return this.state.running = false;
  };
  prototype.pushHistory = function(Δt){
    this.fpsHistory.push(Δt);
    this.fpsHistory.shift();
    return this.fps = floor(1000 * fpsHistoryWindow / this.fpsHistory.reduce(curry$(function(x$, y$){
      return x$ + y$;
    }), 0));
  };
  return FrameDriver;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{"std":40}],43:[function(require,module,exports){
var ref$, id, log, filter, Timer, keyRepeatTime, KEY, ACTION_NAME, eventSummary, newBlankKeystate, InputHandler, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, filter = ref$.filter;
Timer = require('./timer').Timer;
keyRepeatTime = 150;
KEY = {
  RETURN: 13,
  ESCAPE: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  Z: 90,
  X: 88,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  ZERO: 48
};
ACTION_NAME = (ref$ = {}, ref$[KEY.RETURN + ""] = 'confirm', ref$[KEY.ESCAPE + ""] = 'cancel', ref$[KEY.SPACE + ""] = 'hard-drop', ref$[KEY.X + ""] = 'cw', ref$[KEY.Z + ""] = 'ccw', ref$[KEY.UP + ""] = 'up', ref$[KEY.LEFT + ""] = 'left', ref$[KEY.RIGHT + ""] = 'right', ref$[KEY.DOWN + ""] = 'down', ref$[KEY.ONE + ""] = 'debug-1', ref$[KEY.TWO + ""] = 'debug-2', ref$[KEY.THREE + ""] = 'debug-3', ref$[KEY.FOUR + ""] = 'debug-4', ref$[KEY.FIVE + ""] = 'debug-5', ref$[KEY.SIX + ""] = 'debug-6', ref$[KEY.SEVEN + ""] = 'debug-7', ref$[KEY.EIGHT + ""] = 'debug-8', ref$[KEY.NINE + ""] = 'debug-9', ref$[KEY.ZERO + ""] = 'debug-0', ref$);
eventSummary = function(key, state){
  return {
    key: key,
    action: state ? 'down' : 'up'
  };
};
newBlankKeystate = function(){
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    actionA: false,
    actionB: false,
    confirm: false,
    cancel: false
  };
};
out$.InputHandler = InputHandler = (function(){
  InputHandler.displayName = 'InputHandler';
  var prototype = InputHandler.prototype, constructor = InputHandler;
  function InputHandler(){
    this.stateSetter = bind$(this, 'stateSetter', prototype);
    log("InputHandler::new");
    document.addEventListener('keydown', this.stateSetter(true));
    document.addEventListener('keyup', this.stateSetter(false));
    this.currKeystate = newBlankKeystate();
    this.lastKeystate = newBlankKeystate();
  }
  prototype.stateSetter = curry$((function(state, arg$){
    var which, key;
    which = arg$.which;
    if (key = ACTION_NAME[which]) {
      this.currKeystate[key] = state;
      if (state === true && this.lastHeldKey !== key) {
        return this.lastHeldKey = key;
      }
    }
  }), true);
  prototype.changesSinceLastFrame = function(){
    var key, state, wasDifferent;
    return filter(id, (function(){
      var ref$, results$ = [];
      for (key in ref$ = this.currKeystate) {
        state = ref$[key];
        wasDifferent = state !== this.lastKeystate[key];
        this.lastKeystate[key] = state;
        if (wasDifferent) {
          results$.push(eventSummary(key, state));
        }
      }
      return results$;
    }.call(this)));
  };
  InputHandler.debugMode = function(){
    return document.addEventListener('keydown', function(arg$){
      var which;
      which = arg$.which;
      return log("InputHandler::debugMode -", which, ACTION_NAME[which] || '[unbound]');
    });
  };
  InputHandler.on = function(code, λ){
    return document.addEventListener('keydown', function(arg$){
      var which;
      which = arg$.which;
      if (which === code) {
        return λ();
      }
    });
  };
  return InputHandler;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{"./timer":44,"std":40}],44:[function(require,module,exports){
var ref$, id, log, floor, asciiProgressBar, TIMER_ACTIVE, TIMER_EXPIRED, create, update, reset, stop, runFor, progressOf, timeToExpiry, setTimeToExpiry, resetWithRemainder, toString, updateAllIn, setState, setTime, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
asciiProgressBar = curry$(function(len, val, max){
  var valueChars, emptyChars;
  val = val > max ? max : val;
  valueChars = floor(len * val / max);
  emptyChars = len - valueChars;
  return repeatString$("+", valueChars) + repeatString$("-", emptyChars);
});
ref$ = [0, 1], TIMER_ACTIVE = ref$[0], TIMER_EXPIRED = ref$[1];
out$.create = create = function(name, targetTime, begin){
  name == null && (name = "Unnamed Timer");
  targetTime == null && (targetTime = 1000);
  begin == null && (begin = false);
  log("New Timer:", name, targetTime);
  return {
    currentTime: 0,
    targetTime: targetTime,
    progress: 0,
    state: begin ? TIMER_ACTIVE : TIMER_EXPIRED,
    active: begin,
    expired: !begin,
    timeToExpiry: targetTime,
    name: name
  };
};
out$.update = update = function(timer, Δt){
  if (timer.active) {
    return setTime(timer, timer.currentTime + Δt);
  }
};
out$.reset = reset = function(timer, time){
  time == null && (time = timer.targetTime);
  log("Timer::reset -", timer.name, time);
  timer.targetTime = time;
  setTime(timer, 0);
  return setState(timer, TIMER_ACTIVE);
};
out$.stop = stop = function(timer){
  setTime(timer, 0);
  return setState(timer, TIMER_EXPIRED);
};
out$.runFor = runFor = function(timer, time){
  timer.timeToExpiry = time;
  return setState(timer, TIMER_ACTIVE);
};
out$.progressOf = progressOf = function(timer){
  return timer.currentTime / timer.targetTime;
};
out$.timeToExpiry = timeToExpiry = function(timer){
  return timer.targetTime - timer.currentTime;
};
out$.setTimeToExpiry = setTimeToExpiry = function(timer, expiryTime){
  return setTime(timer, timer.targetTime - expiryTime);
};
out$.resetWithRemainder = resetWithRemainder = function(timer, remainder){
  remainder == null && (remainder = timer.currentTime - timer.targetTime);
  setTime(timer, remainder);
  return setState(timer, TIMER_ACTIVE);
};
out$.toString = toString = function(){
  var progbar;
  progbar = asciiProgressBar(6);
  return function(timer){
    return "" + progbar(timer.currentTime, timer.targetTime) + " " + (timer.name + " " + timer.targetTime) + " (" + timer.active + "|" + timer.expired + ")";
  };
}();
out$.updateAllIn = updateAllIn = function(thing, Δt){
  var k, v, results$ = [];
  if (thing.targetTime != null) {
    return update(thing, Δt);
  } else if (typeof thing === 'object') {
    for (k in thing) {
      v = thing[k];
      if (v) {
        results$.push(updateAllIn(v, Δt));
      }
    }
    return results$;
  }
};
setState = function(timer, state){
  timer.state = state;
  timer.expired = state === TIMER_EXPIRED;
  return timer.active = state !== TIMER_EXPIRED;
};
setTime = function(timer, time){
  timer.currentTime = time;
  timer.progress = timer.currentTime / timer.targetTime;
  if (timer.currentTime >= timer.targetTime) {
    timer.progress = 1;
    return setState(timer, TIMER_EXPIRED);
  }
};
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
},{"std":40}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJDb250cm9scy5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJFZmZlY3QuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi90cmFja2JhbGwtY29udHJvbHMuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2NvbmZpZy9nYW1lLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9jb25maWcvc2NlbmUubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvYXJlbmEubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvYnJpY2subHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZ2FtZS1jb3JlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtb3Zlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9zY29yZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9zdGFydC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2Jhc2UubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9icmljay5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWlsLXNjcmVlbi5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWxsaW5nLWJyaWNrLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2ZyYW1lLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2d1aWRlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2xlZC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9saWdodGluZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9uaXhpZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9wYXJ0aWNsZS1lZmZlY3QubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvc3RhcnQtbWVudS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90aXRsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvZGVidWctY2FtZXJhLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9nZW9tZXRyeS9jYXBzdWxlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvbWF0cy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvcGFsZXR0ZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvc2NlbmUtbWFuYWdlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2Vhc2luZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9kZWJ1Zy1vdXRwdXQubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3V0aWxzL2ZyYW1lLWRyaXZlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvaW5wdXQtaGFuZGxlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ptQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBEZWJ1Z091dHB1dCwgVGV0cmlzR2FtZSwgVGhyZWVKc1JlbmRlcmVyO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5O1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi91dGlscy9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL3V0aWxzL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLlRldHJpc0dhbWU7XG5UaHJlZUpzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuVGhyZWVKc1JlbmRlcmVyO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBnYW1lU3RhdGUsIGdhbWVPcHRpb25zLCByZW5kZXJPcHRpb25zLCBpbnB1dEhhbmRsZXIsIHRldHJpc0dhbWUsIHJlbmRlcmVyLCB0aW1lRmFjdG9yLCBkZWJ1Z091dHB1dCwgZnJhbWVEcml2ZXIsIHRlc3RFYXNpbmc7XG4gIGdhbWVTdGF0ZSA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZSdcbiAgfTtcbiAgZ2FtZU9wdGlvbnMgPSByZXF1aXJlKCcuL2NvbmZpZy9nYW1lJyk7XG4gIHJlbmRlck9wdGlvbnMgPSByZXF1aXJlKCcuL2NvbmZpZy9zY2VuZScpO1xuICBpbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xuICB0ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gIHJlbmRlcmVyID0gbmV3IFRocmVlSnNSZW5kZXJlcihyZW5kZXJPcHRpb25zLCBnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgdGltZUZhY3RvciA9IDI7XG4gIGRlYnVnT3V0cHV0ID0gbmV3IERlYnVnT3V0cHV0O1xuICBJbnB1dEhhbmRsZXIub24oMTkyLCBmdW5jdGlvbigpe1xuICAgIGlmIChmcmFtZURyaXZlci5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RhcnQoKTtcbiAgICB9XG4gIH0pO1xuICBJbnB1dEhhbmRsZXIub24oMjcsIGZ1bmN0aW9uKCl7XG4gICAgZ2FtZVN0YXRlLmNvcmUucGF1c2VkID0gIWdhbWVTdGF0ZS5jb3JlLnBhdXNlZDtcbiAgICByZXR1cm4gbG9nKGdhbWVTdGF0ZS5jb3JlLnBhdXNlZCA/IFwiR2FtZSB0aW1lIHBhdXNlZFwiIDogXCJHYW1lIHRpbWUgdW5wYXVzZWRcIik7XG4gIH0pO1xuICBmcmFtZURyaXZlciA9IG5ldyBGcmFtZURyaXZlcihmdW5jdGlvbijOlHQsIHRpbWUsIGZyYW1lLCBmcHMpe1xuICAgIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUudXBkYXRlKGdhbWVTdGF0ZSwge1xuICAgICAgaW5wdXQ6IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKSxcbiAgICAgIM6UdDogzpR0IC8gdGltZUZhY3RvcixcbiAgICAgIHRpbWU6IHRpbWUgLyB0aW1lRmFjdG9yLFxuICAgICAgZnJhbWU6IGZyYW1lLFxuICAgICAgZnBzOiBmcHNcbiAgICB9KTtcbiAgICByZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlKTtcbiAgICByZXR1cm4gZGVidWdPdXRwdXQgIT0gbnVsbCA/IGRlYnVnT3V0cHV0LnJlbmRlcihnYW1lU3RhdGUpIDogdm9pZCA4O1xuICB9KTtcbiAgcmVuZGVyZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gIHRldHJpc0dhbWUuYmVnaW5OZXdHYW1lKGdhbWVTdGF0ZSk7XG4gIHJldHVybiB0ZXN0RWFzaW5nID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgRWFzZSwgaSQsIHJlZiQsIGxlbiQsIGVsLCBlYXNlTmFtZSwgZWFzZSwgbHJlc3VsdCQsIGNudiwgY3R4LCBpLCBwLCByZXN1bHRzJCA9IFtdO1xuICAgIEVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjYW52YXMnKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGVsID0gcmVmJFtpJF07XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBmb3IgKGVhc2VOYW1lIGluIEVhc2UpIHtcbiAgICAgIGVhc2UgPSBFYXNlW2Vhc2VOYW1lXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBjbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNudi53aWR0aCA9IDIwMDtcbiAgICAgIGNudi5oZWlnaHQgPSAyMDA7XG4gICAgICBjbnYuc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG4gICAgICBjbnYuc3R5bGUuYm9yZGVyTGVmdCA9IFwiM3B4IHNvbGlkIGJsYWNrXCI7XG4gICAgICBjdHggPSBjbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY252KTtcbiAgICAgIGN0eC5mb250ID0gXCIxNHB4IG1vbm9zcGFjZVwiO1xuICAgICAgY3R4LmZpbGxUZXh0KGVhc2VOYW1lLCAyLCAxNiwgMjAwKTtcbiAgICAgIGZvciAoaSQgPSAwOyBpJCA8PSAxMDA7ICsraSQpIHtcbiAgICAgICAgaSA9IGkkO1xuICAgICAgICBwID0gaSAvIDEwMDtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdHguZmlsbFJlY3QoMiAqIGksIDIwMCAtIGVhc2UocCwgMCwgMjAwKSwgMiwgMikpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbn0pOyIsIi8qKlxuICogQGF1dGhvciBkbWFyY29zIC8gaHR0cHM6Ly9naXRodWIuY29tL2RtYXJjb3NcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqL1xuXG5USFJFRS5WUkNvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIG9uRXJyb3IgKSB7XG5cblx0dmFyIHNjb3BlID0gdGhpcztcblx0dmFyIHZySW5wdXRzID0gW107XG5cblx0ZnVuY3Rpb24gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKSB7XG5cblx0XHQvLyBFeGNsdWRlIENhcmRib2FyZCBwb3NpdGlvbiBzZW5zb3IgaWYgT2N1bHVzIGV4aXN0cy5cblx0XHR2YXIgb2N1bHVzRGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKCBmdW5jdGlvbiAoIGRldmljZSApIHtcblx0XHRcdHJldHVybiBkZXZpY2UuZGV2aWNlTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ29jdWx1cycpICE9PSAtMTtcblx0XHR9ICk7XG5cblx0XHRpZiAoIG9jdWx1c0RldmljZXMubGVuZ3RoID49IDEgKSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlcy5maWx0ZXIoIGZ1bmN0aW9uICggZGV2aWNlICkge1xuXHRcdFx0XHRyZXR1cm4gZGV2aWNlLmRldmljZU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjYXJkYm9hcmQnKSA9PT0gLTE7XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkZXZpY2VzO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdvdFZSRGV2aWNlcyggZGV2aWNlcyApIHtcblx0XHRkZXZpY2VzID0gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKTtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdGlmICggZGV2aWNlc1sgaSBdIGluc3RhbmNlb2YgUG9zaXRpb25TZW5zb3JWUkRldmljZSApIHtcblx0XHRcdFx0dnJJbnB1dHMucHVzaCggZGV2aWNlc1sgaSBdICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vIHRoZSBSaWZ0IFNESyByZXR1cm5zIHRoZSBwb3NpdGlvbiBpbiBtZXRlcnNcblx0Ly8gdGhpcyBzY2FsZSBmYWN0b3IgYWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSBob3cgbWV0ZXJzXG5cdC8vIGFyZSBjb252ZXJ0ZWQgdG8gc2NlbmUgdW5pdHMuXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHZySW5wdXRzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdHZhciB2cklucHV0ID0gdnJJbnB1dHNbIGkgXTtcblx0XHRcdHZhciBzdGF0ZSA9IHZySW5wdXQuZ2V0U3RhdGUoKTtcblxuXHRcdFx0aWYgKCBzdGF0ZS5vcmllbnRhdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnF1YXRlcm5pb24uY29weSggc3RhdGUub3JpZW50YXRpb24gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzdGF0ZS5wb3NpdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnBvc2l0aW9uLmNvcHkoIHN0YXRlLnBvc2l0aW9uICkubXVsdGlwbHlTY2FsYXIoIHNjb3BlLnNjYWxlICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucmVzZXRTZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdnJJbnB1dHMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0dmFyIHZySW5wdXQgPSB2cklucHV0c1sgaSBdO1xuXG5cdFx0XHRpZiAoIHZySW5wdXQucmVzZXRTZW5zb3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dnJJbnB1dC5yZXNldFNlbnNvcigpO1xuXHRcdFx0fSBlbHNlIGlmICggdnJJbnB1dC56ZXJvU2Vuc29yICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHZySW5wdXQuemVyb1NlbnNvcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnplcm9TZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0VEhSRUUud2FybiggJ1RIUkVFLlZSQ29udHJvbHM6IC56ZXJvU2Vuc29yKCkgaXMgbm93IC5yZXNldFNlbnNvcigpLicgKTtcblx0XHR0aGlzLnJlc2V0U2Vuc29yKCk7XG5cdH07XG5cbn07XG5cbiIsIlxuLyoqXG4gKiBAYXV0aG9yIGRtYXJjb3MgLyBodHRwczovL2dpdGh1Yi5jb20vZG1hcmNvc1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICpcbiAqIFdlYlZSIFNwZWM6IGh0dHA6Ly9tb3p2ci5naXRodWIuaW8vd2VidnItc3BlYy93ZWJ2ci5odG1sXG4gKlxuICogRmlyZWZveDogaHR0cDovL21venZyLmNvbS9kb3dubG9hZHMvXG4gKiBDaHJvbWl1bTogaHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2ZvbGRlcnZpZXc/aWQ9MEJ6dWRMdDIyQnFHUmJXOVdUSE10T1dNek5qUSZ1c3A9c2hhcmluZyNsaXN0XG4gKlxuICovXG5cblRIUkVFLlZSRWZmZWN0ID0gZnVuY3Rpb24gKCByZW5kZXJlciwgb25FcnJvciApIHtcblxuXHR2YXIgdnJITUQ7XG5cdHZhciBleWVUcmFuc2xhdGlvbkwsIGV5ZUZPVkw7XG5cdHZhciBleWVUcmFuc2xhdGlvblIsIGV5ZUZPVlI7XG5cblx0ZnVuY3Rpb24gZ290VlJEZXZpY2VzKCBkZXZpY2VzICkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0aWYgKCBkZXZpY2VzWyBpIF0gaW5zdGFuY2VvZiBITURWUkRldmljZSApIHtcblx0XHRcdFx0dnJITUQgPSBkZXZpY2VzWyBpIF07XG5cblx0XHRcdFx0aWYgKCB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dmFyIGV5ZVBhcmFtc0wgPSB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAnbGVmdCcgKTtcblx0XHRcdFx0XHR2YXIgZXllUGFyYW1zUiA9IHZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdyaWdodCcgKTtcblxuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uTCA9IGV5ZVBhcmFtc0wuZXllVHJhbnNsYXRpb247XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gZXllUGFyYW1zUi5leWVUcmFuc2xhdGlvbjtcblx0XHRcdFx0XHRleWVGT1ZMID0gZXllUGFyYW1zTC5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuXHRcdFx0XHRcdGV5ZUZPVlIgPSBleWVQYXJhbXNSLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVE9ETzogVGhpcyBpcyBhbiBvbGRlciBjb2RlIHBhdGggYW5kIG5vdCBzcGVjIGNvbXBsaWFudC5cblx0XHRcdFx0XHQvLyBJdCBzaG91bGQgYmUgcmVtb3ZlZCBhdCBzb21lIHBvaW50IGluIHRoZSBuZWFyIGZ1dHVyZS5cblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvbkwgPSB2ckhNRC5nZXRFeWVUcmFuc2xhdGlvbiggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gdnJITUQuZ2V0RXllVHJhbnNsYXRpb24oICdyaWdodCcgKTtcblx0XHRcdFx0XHRleWVGT1ZMID0gdnJITUQuZ2V0UmVjb21tZW5kZWRFeWVGaWVsZE9mVmlldyggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllRk9WUiA9IHZySE1ELmdldFJlY29tbWVuZGVkRXllRmllbGRPZlZpZXcoICdyaWdodCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhazsgLy8gV2Uga2VlcCB0aGUgZmlyc3Qgd2UgZW5jb3VudGVyXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHRcdH1cblxuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMuc2V0U2l6ZSA9IGZ1bmN0aW9uKCB3aWR0aCwgaGVpZ2h0ICkge1xuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcblx0fTtcblxuXHQvLyBmdWxsc2NyZWVuXG5cblx0dmFyIGlzRnVsbHNjcmVlbiA9IGZhbHNlO1xuXHR2YXIgY2FudmFzID0gcmVuZGVyZXIuZG9tRWxlbWVudDtcblx0dmFyIGZ1bGxzY3JlZW5jaGFuZ2UgPSBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4gPyAnbW96ZnVsbHNjcmVlbmNoYW5nZScgOiAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggZnVsbHNjcmVlbmNoYW5nZSwgZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRpc0Z1bGxzY3JlZW4gPSBkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudDtcblx0fSwgZmFsc2UgKTtcblxuXHR0aGlzLnNldEZ1bGxTY3JlZW4gPSBmdW5jdGlvbiAoIGJvb2xlYW4gKSB7XG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXHRcdGlmICggaXNGdWxsc2NyZWVuID09PSBib29sZWFuICkgcmV0dXJuO1xuXHRcdGlmICggY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuICkge1xuXHRcdFx0Y2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuKCB7IHZyRGlzcGxheTogdnJITUQgfSApO1xuXHRcdH0gZWxzZSBpZiAoIGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiApIHtcblx0XHRcdGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiggeyB2ckRpc3BsYXk6IHZySE1EIH0gKTtcblx0XHR9XG5cdH07XG5cblxuICAvLyBQcm94eSBmb3IgcmVuZGVyZXJcbiAgdGhpcy5nZXRQaXhlbFJhdGlvID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZW5kZXJlci5nZXRQaXhlbFJhdGlvKCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb250ZXh0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVuZGVyZXIuY29udGV4dDsgfVxuICB9KTtcblxuXHQvLyByZW5kZXJcblx0dmFyIGNhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblx0dmFyIGNhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblxuXHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblx0XHRpZiAoIHZySE1EICkge1xuXHRcdFx0dmFyIHNjZW5lTCwgc2NlbmVSO1xuXG5cdFx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cdFx0XHRcdHNjZW5lTCA9IHNjZW5lWyAwIF07XG5cdFx0XHRcdHNjZW5lUiA9IHNjZW5lWyAxIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzY2VuZUwgPSBzY2VuZTtcblx0XHRcdFx0c2NlbmVSID0gc2NlbmU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzaXplID0gcmVuZGVyZXIuZ2V0U2l6ZSgpO1xuXHRcdFx0c2l6ZS53aWR0aCAvPSAyO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggdHJ1ZSApO1xuXHRcdFx0cmVuZGVyZXIuY2xlYXIoKTtcblxuXHRcdFx0aWYgKCBjYW1lcmEucGFyZW50ID09PSB1bmRlZmluZWQgKSBjYW1lcmEudXBkYXRlTWF0cml4V29ybGQoKTtcblxuXHRcdFx0Y2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZMLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXHRcdFx0Y2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZSLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXG5cdFx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFMLnBvc2l0aW9uLCBjYW1lcmFMLnF1YXRlcm5pb24sIGNhbWVyYUwuc2NhbGUgKTtcblx0XHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYVIucG9zaXRpb24sIGNhbWVyYVIucXVhdGVybmlvbiwgY2FtZXJhUi5zY2FsZSApO1xuXG5cdFx0XHRjYW1lcmFMLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uTC54ICogdGhpcy5zY2FsZSApO1xuXHRcdFx0Y2FtZXJhUi50cmFuc2xhdGVYKCBleWVUcmFuc2xhdGlvblIueCAqIHRoaXMuc2NhbGUgKTtcblxuXHRcdFx0Ly8gcmVuZGVyIGxlZnQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lTCwgY2FtZXJhTCApO1xuXG5cdFx0XHQvLyByZW5kZXIgcmlnaHQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggc2l6ZS53aWR0aCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIHNpemUud2lkdGgsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lUiwgY2FtZXJhUiApO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggZmFsc2UgKTtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Ly8gUmVndWxhciByZW5kZXIgbW9kZSBpZiBub3QgSE1EXG5cblx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSBzY2VuZSA9IHNjZW5lWyAwIF07XG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBjYW1lcmEgKTtcblxuXHR9O1xuXG5cdGZ1bmN0aW9uIGZvdlRvTkRDU2NhbGVPZmZzZXQoIGZvdiApIHtcblxuXHRcdHZhciBweHNjYWxlID0gMi4wIC8gKGZvdi5sZWZ0VGFuICsgZm92LnJpZ2h0VGFuKTtcblx0XHR2YXIgcHhvZmZzZXQgPSAoZm92LmxlZnRUYW4gLSBmb3YucmlnaHRUYW4pICogcHhzY2FsZSAqIDAuNTtcblx0XHR2YXIgcHlzY2FsZSA9IDIuMCAvIChmb3YudXBUYW4gKyBmb3YuZG93blRhbik7XG5cdFx0dmFyIHB5b2Zmc2V0ID0gKGZvdi51cFRhbiAtIGZvdi5kb3duVGFuKSAqIHB5c2NhbGUgKiAwLjU7XG5cdFx0cmV0dXJuIHsgc2NhbGU6IFsgcHhzY2FsZSwgcHlzY2FsZSBdLCBvZmZzZXQ6IFsgcHhvZmZzZXQsIHB5b2Zmc2V0IF0gfTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZm92UG9ydFRvUHJvamVjdGlvbiggZm92LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKSB7XG5cblx0XHRyaWdodEhhbmRlZCA9IHJpZ2h0SGFuZGVkID09PSB1bmRlZmluZWQgPyB0cnVlIDogcmlnaHRIYW5kZWQ7XG5cdFx0ek5lYXIgPSB6TmVhciA9PT0gdW5kZWZpbmVkID8gMC4wMSA6IHpOZWFyO1xuXHRcdHpGYXIgPSB6RmFyID09PSB1bmRlZmluZWQgPyAxMDAwMC4wIDogekZhcjtcblxuXHRcdHZhciBoYW5kZWRuZXNzU2NhbGUgPSByaWdodEhhbmRlZCA/IC0xLjAgOiAxLjA7XG5cblx0XHQvLyBzdGFydCB3aXRoIGFuIGlkZW50aXR5IG1hdHJpeFxuXHRcdHZhciBtb2JqID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgbSA9IG1vYmouZWxlbWVudHM7XG5cblx0XHQvLyBhbmQgd2l0aCBzY2FsZS9vZmZzZXQgaW5mbyBmb3Igbm9ybWFsaXplZCBkZXZpY2UgY29vcmRzXG5cdFx0dmFyIHNjYWxlQW5kT2Zmc2V0ID0gZm92VG9ORENTY2FsZU9mZnNldChmb3YpO1xuXG5cdFx0Ly8gWCByZXN1bHQsIG1hcCBjbGlwIGVkZ2VzIHRvIFstdywrd11cblx0XHRtWzAgKiA0ICsgMF0gPSBzY2FsZUFuZE9mZnNldC5zY2FsZVswXTtcblx0XHRtWzAgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVswICogNCArIDJdID0gc2NhbGVBbmRPZmZzZXQub2Zmc2V0WzBdICogaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMCAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdC8vIFkgcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG5cdFx0Ly8gWSBvZmZzZXQgaXMgbmVnYXRlZCBiZWNhdXNlIHRoaXMgcHJvaiBtYXRyaXggdHJhbnNmb3JtcyBmcm9tIHdvcmxkIGNvb3JkcyB3aXRoIFk9dXAsXG5cdFx0Ly8gYnV0IHRoZSBOREMgc2NhbGluZyBoYXMgWT1kb3duICh0aGFua3MgRDNEPylcblx0XHRtWzEgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVsxICogNCArIDFdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMV07XG5cdFx0bVsxICogNCArIDJdID0gLXNjYWxlQW5kT2Zmc2V0Lm9mZnNldFsxXSAqIGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzEgKiA0ICsgM10gPSAwLjA7XG5cblx0XHQvLyBaIHJlc3VsdCAodXAgdG8gdGhlIGFwcClcblx0XHRtWzIgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVsyICogNCArIDFdID0gMC4wO1xuXHRcdG1bMiAqIDQgKyAyXSA9IHpGYXIgLyAoek5lYXIgLSB6RmFyKSAqIC1oYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVsyICogNCArIDNdID0gKHpGYXIgKiB6TmVhcikgLyAoek5lYXIgLSB6RmFyKTtcblxuXHRcdC8vIFcgcmVzdWx0ICg9IFogaW4pXG5cdFx0bVszICogNCArIDBdID0gMC4wO1xuXHRcdG1bMyAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzMgKiA0ICsgMl0gPSBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVszICogNCArIDNdID0gMC4wO1xuXG5cdFx0bW9iai50cmFuc3Bvc2UoKTtcblxuXHRcdHJldHVybiBtb2JqO1xuXHR9XG5cblx0ZnVuY3Rpb24gZm92VG9Qcm9qZWN0aW9uKCBmb3YsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApIHtcblxuXHRcdHZhciBERUcyUkFEID0gTWF0aC5QSSAvIDE4MC4wO1xuXG5cdFx0dmFyIGZvdlBvcnQgPSB7XG5cdFx0XHR1cFRhbjogTWF0aC50YW4oIGZvdi51cERlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRkb3duVGFuOiBNYXRoLnRhbiggZm92LmRvd25EZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0bGVmdFRhbjogTWF0aC50YW4oIGZvdi5sZWZ0RGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdHJpZ2h0VGFuOiBNYXRoLnRhbiggZm92LnJpZ2h0RGVncmVlcyAqIERFRzJSQUQgKVxuXHRcdH07XG5cblx0XHRyZXR1cm4gZm92UG9ydFRvUHJvamVjdGlvbiggZm92UG9ydCwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICk7XG5cblx0fVxuXG59O1xuIiwiXG4vKlxuICogTW96VlIgRXh0ZW5zaW9ucyB0byB0aHJlZS5qc1xuICpcbiAqIEEgYnJvd3NlcmlmeSB3cmFwcGVyIGZvciB0aGUgVlIgaGVscGVycyBmcm9tIE1velZSJ3MgZ2l0aHViIHJlcG8uXG4gKiBodHRwczovL2dpdGh1Yi5jb20vTW96VlIvdnItd2ViLWV4YW1wbGVzL3RyZWUvbWFzdGVyL3RocmVlanMtdnItYm9pbGVycGxhdGVcbiAqXG4gKiBUaGUgZXh0ZW5zaW9uIGZpbGVzIGFyZSBub3QgbW9kdWxlIGNvbXBhdGlibGUgYW5kIHdvcmsgYnkgYXBwZW5kaW5nIHRvIHRoZVxuICogVEhSRUUgb2JqZWN0LiBEbyB1c2UgdGhlbSwgd2UgbWFrZSB0aGUgVEhSRUUgb2JqZWN0IGdsb2JhbCwgYW5kIHRoZW4gbWFrZVxuICogaXQgdGhlIGV4cG9ydCB2YWx1ZSBvZiB0aGlzIG1vZHVsZS5cbiAqXG4gKi9cblxuY29uc29sZS5ncm91cENvbGxhcHNlZCgnTG9hZGluZyBNb3pWUiBFeHRlbnNpb25zLi4uJyk7XG4vL3JlcXVpcmUoJy4vU3RlcmVvRWZmZWN0LmpzJyk7XG4vL2NvbnNvbGUubG9nKCdTdGVyZW9FZmZlY3QgLSBPSycpO1xuXG5yZXF1aXJlKCcuL1ZSQ29udHJvbHMuanMnKTtcbmNvbnNvbGUubG9nKCdWUkNvbnRyb2xzIC0gT0snKTtcblxucmVxdWlyZSgnLi9WUkVmZmVjdC5qcycpO1xuY29uc29sZS5sb2coJ1ZSRWZmZWN0IC0gT0snKTtcblxuY29uc29sZS5ncm91cEVuZCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFO1xuXG4iLCIvKipcbiAqIEBhdXRob3IgRWJlcmhhcmQgR3JhZXRoZXIgLyBodHRwOi8vZWdyYWV0aGVyLmNvbS9cbiAqIEBhdXRob3IgTWFyayBMdW5kaW4gXHQvIGh0dHA6Ly9tYXJrLWx1bmRpbi5jb21cbiAqIEBhdXRob3IgU2ltb25lIE1hbmluaSAvIGh0dHA6Ly9kYXJvbjEzMzcuZ2l0aHViLmlvXG4gKiBAYXV0aG9yIEx1Y2EgQW50aWdhIFx0LyBodHRwOi8vbGFudGlnYS5naXRodWIuaW9cbiAqL1xuXG5USFJFRS5UcmFja2JhbGxDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCB0YXJnZXQsIGRvbUVsZW1lbnQgKSB7XG5cblx0dmFyIF90aGlzID0gdGhpcztcblx0dmFyIFNUQVRFID0geyBOT05FOiAtMSwgUk9UQVRFOiAwLCBaT09NOiAxLCBQQU46IDIsIFRPVUNIX1JPVEFURTogMywgVE9VQ0hfWk9PTV9QQU46IDQgfTtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gKCBkb21FbGVtZW50ICE9PSB1bmRlZmluZWQgKSA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdHRoaXMuc2NyZWVuID0geyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuXHR0aGlzLnJvdGF0ZVNwZWVkID0gMS4wO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMjtcblx0dGhpcy5wYW5TcGVlZCA9IDAuMztcblxuXHR0aGlzLm5vUm90YXRlID0gZmFsc2U7XG5cdHRoaXMubm9ab29tID0gZmFsc2U7XG5cdHRoaXMubm9QYW4gPSBmYWxzZTtcblxuXHR0aGlzLnN0YXRpY01vdmluZyA9IGZhbHNlO1xuXHR0aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4yO1xuXG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0dGhpcy5rZXlzID0gWyA2NSAvKkEqLywgODMgLypTKi8sIDY4IC8qRCovIF07XG5cblx0Ly8gaW50ZXJuYWxzXG5cblx0dGhpcy50YXJnZXQgPSB0YXJnZXQgPyB0YXJnZXQucG9zaXRpb24gOiBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBFUFMgPSAwLjAwMDAwMTtcblxuXHR2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgX3N0YXRlID0gU1RBVEUuTk9ORSxcblx0X3ByZXZTdGF0ZSA9IFNUQVRFLk5PTkUsXG5cblx0X2V5ZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cblx0X21vdmVQcmV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X21vdmVDdXJyID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblxuXHRfbGFzdEF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRfbGFzdEFuZ2xlID0gMCxcblxuXHRfem9vbVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X3pvb21FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXG5cdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gMCxcblx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gMCxcblxuXHRfcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHQvLyBmb3IgcmVzZXRcblxuXHR0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuXHR0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cdHRoaXMudXAwID0gdGhpcy5vYmplY3QudXAuY2xvbmUoKTtcblxuXHQvLyBldmVudHNcblxuXHR2YXIgY2hhbmdlRXZlbnQgPSB7IHR5cGU6ICdjaGFuZ2UnIH07XG5cdHZhciBzdGFydEV2ZW50ID0geyB0eXBlOiAnc3RhcnQnIH07XG5cdHZhciBlbmRFdmVudCA9IHsgdHlwZTogJ2VuZCcgfTtcblxuXG5cdC8vIG1ldGhvZHNcblxuXHR0aGlzLmhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggdGhpcy5kb21FbGVtZW50ID09PSBkb2N1bWVudCApIHtcblxuXHRcdFx0dGhpcy5zY3JlZW4ubGVmdCA9IDA7XG5cdFx0XHR0aGlzLnNjcmVlbi50b3AgPSAwO1xuXHRcdFx0dGhpcy5zY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHRcdHRoaXMuc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHZhciBib3ggPSB0aGlzLmRvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHQvLyBhZGp1c3RtZW50cyBjb21lIGZyb20gc2ltaWxhciBjb2RlIGluIHRoZSBqcXVlcnkgb2Zmc2V0KCkgZnVuY3Rpb25cblx0XHRcdHZhciBkID0gdGhpcy5kb21FbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXHRcdFx0dGhpcy5zY3JlZW4ubGVmdCA9IGJveC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0IC0gZC5jbGllbnRMZWZ0O1xuXHRcdFx0dGhpcy5zY3JlZW4udG9wID0gYm94LnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldCAtIGQuY2xpZW50VG9wO1xuXHRcdFx0dGhpcy5zY3JlZW4ud2lkdGggPSBib3gud2lkdGg7XG5cdFx0XHR0aGlzLnNjcmVlbi5oZWlnaHQgPSBib3guaGVpZ2h0O1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzWyBldmVudC50eXBlIF0gPT0gJ2Z1bmN0aW9uJyApIHtcblxuXHRcdFx0dGhpc1sgZXZlbnQudHlwZSBdKCBldmVudCApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dmFyIGdldE1vdXNlT25TY3JlZW4gPSAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggcGFnZVgsIHBhZ2VZICkge1xuXG5cdFx0XHR2ZWN0b3Iuc2V0KFxuXHRcdFx0XHQoIHBhZ2VYIC0gX3RoaXMuc2NyZWVuLmxlZnQgKSAvIF90aGlzLnNjcmVlbi53aWR0aCxcblx0XHRcdFx0KCBwYWdlWSAtIF90aGlzLnNjcmVlbi50b3AgKSAvIF90aGlzLnNjcmVlbi5oZWlnaHRcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiB2ZWN0b3I7XG5cblx0XHR9O1xuXG5cdH0oKSApO1xuXG5cdHZhciBnZXRNb3VzZU9uQ2lyY2xlID0gKCBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBhZ2VYLCBwYWdlWSApIHtcblxuXHRcdFx0dmVjdG9yLnNldChcblx0XHRcdFx0KCAoIHBhZ2VYIC0gX3RoaXMuc2NyZWVuLndpZHRoICogMC41IC0gX3RoaXMuc2NyZWVuLmxlZnQgKSAvICggX3RoaXMuc2NyZWVuLndpZHRoICogMC41ICkgKSxcblx0XHRcdFx0KCAoIF90aGlzLnNjcmVlbi5oZWlnaHQgKyAyICogKCBfdGhpcy5zY3JlZW4udG9wIC0gcGFnZVkgKSApIC8gX3RoaXMuc2NyZWVuLndpZHRoICkgLy8gc2NyZWVuLndpZHRoIGludGVudGlvbmFsXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gdmVjdG9yO1xuXHRcdH07XG5cblx0fSgpICk7XG5cblx0dGhpcy5yb3RhdGVDYW1lcmEgPSAoZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgYXhpcyA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRxdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKSxcblx0XHRcdGV5ZURpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRvYmplY3RVcERpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRtb3ZlRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdGFuZ2xlO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0bW92ZURpcmVjdGlvbi5zZXQoIF9tb3ZlQ3Vyci54IC0gX21vdmVQcmV2LngsIF9tb3ZlQ3Vyci55IC0gX21vdmVQcmV2LnksIDAgKTtcblx0XHRcdGFuZ2xlID0gbW92ZURpcmVjdGlvbi5sZW5ndGgoKTtcblxuXHRcdFx0aWYgKCBhbmdsZSApIHtcblxuXHRcdFx0XHRfZXllLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApLnN1YiggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRcdFx0ZXllRGlyZWN0aW9uLmNvcHkoIF9leWUgKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24uY29weSggX3RoaXMub2JqZWN0LnVwICkubm9ybWFsaXplKCk7XG5cdFx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uLmNyb3NzVmVjdG9ycyggb2JqZWN0VXBEaXJlY3Rpb24sIGV5ZURpcmVjdGlvbiApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdG9iamVjdFVwRGlyZWN0aW9uLnNldExlbmd0aCggX21vdmVDdXJyLnkgLSBfbW92ZVByZXYueSApO1xuXHRcdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbi5zZXRMZW5ndGgoIF9tb3ZlQ3Vyci54IC0gX21vdmVQcmV2LnggKTtcblxuXHRcdFx0XHRtb3ZlRGlyZWN0aW9uLmNvcHkoIG9iamVjdFVwRGlyZWN0aW9uLmFkZCggb2JqZWN0U2lkZXdheXNEaXJlY3Rpb24gKSApO1xuXG5cdFx0XHRcdGF4aXMuY3Jvc3NWZWN0b3JzKCBtb3ZlRGlyZWN0aW9uLCBfZXllICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0YW5nbGUgKj0gX3RoaXMucm90YXRlU3BlZWQ7XG5cdFx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSggYXhpcywgYW5nbGUgKTtcblxuXHRcdFx0XHRfZXllLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXHRcdFx0XHRfdGhpcy5vYmplY3QudXAuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cblx0XHRcdFx0X2xhc3RBeGlzLmNvcHkoIGF4aXMgKTtcblx0XHRcdFx0X2xhc3RBbmdsZSA9IGFuZ2xlO1xuXG5cdFx0XHR9XG5cblx0XHRcdGVsc2UgaWYgKCAhX3RoaXMuc3RhdGljTW92aW5nICYmIF9sYXN0QW5nbGUgKSB7XG5cblx0XHRcdFx0X2xhc3RBbmdsZSAqPSBNYXRoLnNxcnQoIDEuMCAtIF90aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yICk7XG5cdFx0XHRcdF9leWUuY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkuc3ViKCBfdGhpcy50YXJnZXQgKTtcblx0XHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBfbGFzdEF4aXMsIF9sYXN0QW5nbGUgKTtcblx0XHRcdFx0X2V5ZS5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblx0XHRcdFx0X3RoaXMub2JqZWN0LnVwLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF9tb3ZlUHJldi5jb3B5KCBfbW92ZUN1cnIgKTtcblxuXHRcdH07XG5cblx0fSgpKTtcblxuXG5cdHRoaXMuem9vbUNhbWVyYSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBmYWN0b3I7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuVE9VQ0hfWk9PTV9QQU4gKSB7XG5cblx0XHRcdGZhY3RvciA9IF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0IC8gX3RvdWNoWm9vbURpc3RhbmNlRW5kO1xuXHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBfdG91Y2hab29tRGlzdGFuY2VFbmQ7XG5cdFx0XHRfZXllLm11bHRpcGx5U2NhbGFyKCBmYWN0b3IgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGZhY3RvciA9IDEuMCArICggX3pvb21FbmQueSAtIF96b29tU3RhcnQueSApICogX3RoaXMuem9vbVNwZWVkO1xuXG5cdFx0XHRpZiAoIGZhY3RvciAhPT0gMS4wICYmIGZhY3RvciA+IDAuMCApIHtcblxuXHRcdFx0XHRfZXllLm11bHRpcGx5U2NhbGFyKCBmYWN0b3IgKTtcblxuXHRcdFx0XHRpZiAoIF90aGlzLnN0YXRpY01vdmluZyApIHtcblxuXHRcdFx0XHRcdF96b29tU3RhcnQuY29weSggX3pvb21FbmQgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0X3pvb21TdGFydC55ICs9ICggX3pvb21FbmQueSAtIF96b29tU3RhcnQueSApICogdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvcjtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMucGFuQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG1vdXNlQ2hhbmdlID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XHRcdG9iamVjdFVwID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRtb3VzZUNoYW5nZS5jb3B5KCBfcGFuRW5kICkuc3ViKCBfcGFuU3RhcnQgKTtcblxuXHRcdFx0aWYgKCBtb3VzZUNoYW5nZS5sZW5ndGhTcSgpICkge1xuXG5cdFx0XHRcdG1vdXNlQ2hhbmdlLm11bHRpcGx5U2NhbGFyKCBfZXllLmxlbmd0aCgpICogX3RoaXMucGFuU3BlZWQgKTtcblxuXHRcdFx0XHRwYW4uY29weSggX2V5ZSApLmNyb3NzKCBfdGhpcy5vYmplY3QudXAgKS5zZXRMZW5ndGgoIG1vdXNlQ2hhbmdlLnggKTtcblx0XHRcdFx0cGFuLmFkZCggb2JqZWN0VXAuY29weSggX3RoaXMub2JqZWN0LnVwICkuc2V0TGVuZ3RoKCBtb3VzZUNoYW5nZS55ICkgKTtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkKCBwYW4gKTtcblx0XHRcdFx0X3RoaXMudGFyZ2V0LmFkZCggcGFuICk7XG5cblx0XHRcdFx0aWYgKCBfdGhpcy5zdGF0aWNNb3ZpbmcgKSB7XG5cblx0XHRcdFx0XHRfcGFuU3RhcnQuY29weSggX3BhbkVuZCApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfcGFuU3RhcnQuYWRkKCBtb3VzZUNoYW5nZS5zdWJWZWN0b3JzKCBfcGFuRW5kLCBfcGFuU3RhcnQgKS5tdWx0aXBseVNjYWxhciggX3RoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgKSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH07XG5cblx0fSgpKTtcblxuXHR0aGlzLmNoZWNrRGlzdGFuY2VzID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCAhX3RoaXMubm9ab29tIHx8ICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0aWYgKCBfZXllLmxlbmd0aFNxKCkgPiBfdGhpcy5tYXhEaXN0YW5jZSAqIF90aGlzLm1heERpc3RhbmNlICkge1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUuc2V0TGVuZ3RoKCBfdGhpcy5tYXhEaXN0YW5jZSApICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBfZXllLmxlbmd0aFNxKCkgPCBfdGhpcy5taW5EaXN0YW5jZSAqIF90aGlzLm1pbkRpc3RhbmNlICkge1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUuc2V0TGVuZ3RoKCBfdGhpcy5taW5EaXN0YW5jZSApICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X2V5ZS5zdWJWZWN0b3JzKCBfdGhpcy5vYmplY3QucG9zaXRpb24sIF90aGlzLnRhcmdldCApO1xuXG5cdFx0aWYgKCAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF90aGlzLnJvdGF0ZUNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfdGhpcy56b29tQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRpZiAoICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3RoaXMucGFuQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllICk7XG5cblx0XHRfdGhpcy5jaGVja0Rpc3RhbmNlcygpO1xuXG5cdFx0X3RoaXMub2JqZWN0Lmxvb2tBdCggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvU3F1YXJlZCggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkgPiBFUFMgKSB7XG5cblx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXHRcdF9wcmV2U3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0X3RoaXMudGFyZ2V0LmNvcHkoIF90aGlzLnRhcmdldDAgKTtcblx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uY29weSggX3RoaXMucG9zaXRpb24wICk7XG5cdFx0X3RoaXMub2JqZWN0LnVwLmNvcHkoIF90aGlzLnVwMCApO1xuXG5cdFx0X2V5ZS5zdWJWZWN0b3JzKCBfdGhpcy5vYmplY3QucG9zaXRpb24sIF90aGlzLnRhcmdldCApO1xuXG5cdFx0X3RoaXMub2JqZWN0Lmxvb2tBdCggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0bGFzdFBvc2l0aW9uLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdH07XG5cblx0Ly8gbGlzdGVuZXJzXG5cblx0ZnVuY3Rpb24ga2V5ZG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biApO1xuXG5cdFx0X3ByZXZTdGF0ZSA9IF9zdGF0ZTtcblxuXHRcdGlmICggX3N0YXRlICE9PSBTVEFURS5OT05FICkge1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5ST1RBVEUgXSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlpPT00gXSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5aT09NO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuUEFOIF0gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGtleXVwKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRfc3RhdGUgPSBfcHJldlN0YXRlO1xuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biwgZmFsc2UgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2Vkb3duKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLk5PTkUgKSB7XG5cblx0XHRcdF9zdGF0ZSA9IGV2ZW50LmJ1dHRvbjtcblxuXHRcdH1cblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5ST1RBVEUgJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlpPT00gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3pvb21TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X3pvb21FbmQuY29weShfem9vbVN0YXJ0KTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUEFOICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3BhblN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfcGFuRW5kLmNvcHkoX3BhblN0YXJ0KTtcblxuXHRcdH1cblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZW1vdmUsIGZhbHNlICk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZXVwLCBmYWxzZSApO1xuXG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZW1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5aT09NICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF96b29tRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlBBTiAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2V1cCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlICk7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZXVwICk7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2V3aGVlbCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBkZWx0YSA9IDA7XG5cblx0XHRpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7IC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGEgLyA0MDtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCApIHsgLy8gRmlyZWZveFxuXG5cdFx0XHRkZWx0YSA9IC0gZXZlbnQuZGV0YWlsIC8gMztcblxuXHRcdH1cblxuXHRcdF96b29tU3RhcnQueSArPSBkZWx0YSAqIDAuMDE7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoc3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLlRPVUNIX1JPVEFURTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuVE9VQ0hfWk9PTV9QQU47XG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSBfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggX3BhblN0YXJ0ICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaG1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hlbmQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCAgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IDA7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIF9wYW5FbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9LCBmYWxzZSApO1xuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgbW91c2Vkb3duLCBmYWxzZSApO1xuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG1vdXNld2hlZWwsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBtb3VzZXdoZWVsLCBmYWxzZSApOyAvLyBmaXJlZm94XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIHRvdWNoZW5kLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIHRvdWNobW92ZSwgZmFsc2UgKTtcblxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duLCBmYWxzZSApO1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywga2V5dXAsIGZhbHNlICk7XG5cblx0dGhpcy5oYW5kbGVSZXNpemUoKTtcblxuXHQvLyBmb3JjZSBhbiB1cGRhdGUgYXQgc3RhcnRcblx0dGhpcy51cGRhdGUoKTtcblxufTtcblxuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVEhSRUUuVHJhY2tiYWxsQ29udHJvbHM7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRS5UcmFja2JhbGxDb250cm9scztcblxuIiwidmFyIGFyZW5hV2lkdGgsIGFyZW5hSGVpZ2h0LCB0aW1lRmFjdG9yLCBzdGFydGluZ0Ryb3BTcGVlZCwgc3BlZWRNdWx0aXBseVBlckxldmVsLCBrZXlSZXBlYXRUaW1lLCBzb2Z0RHJvcFdhaXRUaW1lLCBhbmltYXRpb24sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmFyZW5hV2lkdGggPSBhcmVuYVdpZHRoID0gMTA7XG5vdXQkLmFyZW5hSGVpZ2h0ID0gYXJlbmFIZWlnaHQgPSAxODtcbm91dCQudGltZUZhY3RvciA9IHRpbWVGYWN0b3IgPSAxO1xub3V0JC5zdGFydGluZ0Ryb3BTcGVlZCA9IHN0YXJ0aW5nRHJvcFNwZWVkID0gMzAwO1xub3V0JC5zcGVlZE11bHRpcGx5UGVyTGV2ZWwgPSBzcGVlZE11bHRpcGx5UGVyTGV2ZWwgPSAwLjk1O1xub3V0JC5rZXlSZXBlYXRUaW1lID0ga2V5UmVwZWF0VGltZSA9IDEwMDtcbm91dCQuc29mdERyb3BXYWl0VGltZSA9IHNvZnREcm9wV2FpdFRpbWUgPSAxMDA7XG5vdXQkLmFuaW1hdGlvbiA9IGFuaW1hdGlvbiA9IHtcbiAgemFwQW5pbWF0aW9uVGltZTogNTAwLFxuICBqb2x0QW5pbWF0aW9uVGltZTogNTAwLFxuICBoYXJkRHJvcEVmZmVjdFRpbWU6IDEwMCxcbiAgcHJldmlld1JldmVhbFRpbWU6IDMwMCxcbiAgdGl0bGVSZXZlYWxUaW1lOiA0MDAwLFxuICBnYW1lT3ZlclJldmVhbFRpbWU6IDQwMDBcbn07IiwidmFyIHAybTtcbnAybSA9IChmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAqIDEuNiAvIDQwOTY7XG59KTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICB1bml0c1Blck1ldGVyOiAxLFxuICBoYXJkRHJvcEpvbHRBbW91bnQ6IDAuMDMsXG4gIHphcFBhcnRpY2xlU2l6ZTogMC4wMDgsXG4gIGdyaWRTaXplOiAwLjA3LFxuICBibG9ja1NpemU6IDAuMDY2LFxuICBkZXNrU2l6ZTogWzEuNiwgMC44LCAwLjFdLFxuICBjYW1lcmFEaXN0YW5jZUZyb21FZGdlOiAwLjIsXG4gIGNhbWVyYUVsZXZhdGlvbjogMC41LFxuICBhcmVuYU9mZnNldEZyb21DZW50cmU6IDAuMDg1LFxuICBhcmVuYURpc3RhbmNlRnJvbUVkZ2U6IDAuNTcsXG4gIHNjb3JlRGlzdGFuY2VGcm9tRWRnZTogcDJtKDc4MCksXG4gIHNjb3JlRGlzdGFuY2VGcm9tQ2VudHJlOiBwMm0oNDM2KSxcbiAgc2NvcmVJbnRlclR1YmVNYXJnaW46IHAybSg1KSxcbiAgc2NvcmVUdWJlUmFkaXVzOiBwMm0oMjAwIC8gMiksXG4gIHNjb3JlVHViZUhlaWdodDogcDJtKDI3MCksXG4gIHNjb3JlQmFzZVJhZGl1czogcDJtKDI3NSAvIDIpLFxuICBzY29yZUluZGljYXRvck9mZnNldDogcDJtKDI0MyksXG4gIHByZXZpZXdEb21lUmFkaXVzOiBwMm0oMjA4KSxcbiAgcHJldmlld0RvbWVIZWlnaHQ6IDAuMjAsXG4gIHByZXZpZXdEaXN0YW5jZUZyb21FZGdlOiBwMm0oNjU2KSxcbiAgcHJldmlld0Rpc3RhbmNlRnJvbUNlbnRlcjogcDJtKDEwMDIpLFxuICBwcmV2aWV3U2NhbGVGYWN0b3I6IDAuNVxufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrLCBUaW1lciwgcHJpbWVHYW1lU3RhdGUsIG5ld0FyZW5hLCBjb3B5QnJpY2tUb0FyZW5hLCBkcm9wUm93LCByZW1vdmVSb3dzLCBjbGVhckFyZW5hLCB0b3BJc1JlYWNoZWQsIHJvd0lzQ29tcGxldGUsIGNvbGxpZGVzLCBjYW5Nb3ZlLCBjYW5Ecm9wLCBjYW5Sb3RhdGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ3MsIG9wdGlvbnMpe1xuICByZXR1cm4gZ3MuYXJlbmEgPSB7XG4gICAgY2VsbHM6IG5ld0FyZW5hKG9wdGlvbnMuYXJlbmFXaWR0aCwgb3B0aW9ucy5hcmVuYUhlaWdodCksXG4gICAgd2lkdGg6IG9wdGlvbnMuYXJlbmFXaWR0aCxcbiAgICBoZWlnaHQ6IG9wdGlvbnMuYXJlbmFIZWlnaHQsXG4gICAgemFwQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJaYXAgQW5pbWF0aW9uXCIsIG9wdGlvbnMuemFwQW5pbWF0aW9uVGltZSksXG4gICAgam9sdEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiSm9sdCBBbmltYXRpb25cIiwgb3B0aW9ucy5qb2x0QW5pbWF0aW9uVGltZSlcbiAgfTtcbn07XG5vdXQkLm5ld0FyZW5hID0gbmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgdmFyIGkkLCByb3csIGxyZXN1bHQkLCBqJCwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDA7IGkkIDwgaGVpZ2h0OyArK2kkKSB7XG4gICAgcm93ID0gaSQ7XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMDsgaiQgPCB3aWR0aDsgKytqJCkge1xuICAgICAgY2VsbCA9IGokO1xuICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuY29weUJyaWNrVG9BcmVuYSA9IGNvcHlCcmlja1RvQXJlbmEgPSBmdW5jdGlvbihhcmckLCBhcmcxJCl7XG4gIHZhciBwb3MsIHNoYXBlLCBjZWxscywgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGxyZXN1bHQkLCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1LCByZXN1bHRzJCA9IFtdO1xuICBwb3MgPSBhcmckLnBvcywgc2hhcGUgPSBhcmckLnNoYXBlO1xuICBjZWxscyA9IGFyZzEkLmNlbGxzO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSAmJiB2ID49IDApIHtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjZWxsc1t2XVt1XSA9IHNoYXBlW3ldW3hdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5kcm9wUm93ID0gZHJvcFJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQucmVtb3ZlUm93cyA9IHJlbW92ZVJvd3MgPSBmdW5jdGlvbihhcmVuYSwgcm93cyl7XG4gIHZhciBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgcmVzdWx0cyQucHVzaChkcm9wUm93KGFyZW5hLCByb3dJeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmNsZWFyQXJlbmEgPSBjbGVhckFyZW5hID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgaSwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgaSA9IGokO1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKHJvd1tpXSA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC50b3BJc1JlYWNoZWQgPSB0b3BJc1JlYWNoZWQgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLnJvd0lzQ29tcGxldGUgPSByb3dJc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLmNvbGxpZGVzID0gY29sbGlkZXMgPSBmdW5jdGlvbihwb3MsIHNoYXBlLCBhcmckKXtcbiAgdmFyIGNlbGxzLCB3aWR0aCwgaGVpZ2h0LCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdTtcbiAgY2VsbHMgPSBhcmckLmNlbGxzLCB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0O1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gPiAwKSB7XG4gICAgICAgIGlmICh2ID49IDApIHtcbiAgICAgICAgICBpZiAodiA+PSBoZWlnaHQgfHwgdSA+PSB3aWR0aCB8fCB1IDwgMCB8fCBjZWxsc1t2XVt1XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuRHJvcCA9IGNhbkRyb3AgPSBmdW5jdGlvbihicmljaywgYXJlbmEpe1xuICByZXR1cm4gY2FuTW92ZShicmljaywgWzAsIDFdLCBhcmVuYSk7XG59O1xub3V0JC5jYW5Sb3RhdGUgPSBjYW5Sb3RhdGUgPSBmdW5jdGlvbihicmljaywgcm90YXRpb24sIGFyZW5hKXtcbiAgdmFyIG5ld1NoYXBlO1xuICBuZXdTaGFwZSA9IEJyaWNrLmdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gY29sbGlkZXMoYnJpY2sucG9zLCBuZXdTaGFwZSwgYXJlbmEpO1xufTtcbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmRJbnQsIHdyYXAsIEJyaWNrU2hhcGVzLCBwcmltZUdhbWVTdGF0ZSwgbmV3QnJpY2ssIHNwYXduTmV3QnJpY2ssIHJlc2V0U3RhdGUsIHJvdGF0ZUJyaWNrLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCBkcmF3Q2VsbCwgZHJhd0JyaWNrLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5icmljayA9IHtcbiAgICBuZXh0OiBudWxsLFxuICAgIGN1cnJlbnQ6IG51bGxcbiAgfTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZEludCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcG9zOiBbMywgLTFdLFxuICAgIGNvbG9yOiBpeCxcbiAgICByb3RhdGlvbjogMCxcbiAgICB0eXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnR5cGUsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdXG4gIH07XG59O1xub3V0JC5zcGF3bk5ld0JyaWNrID0gc3Bhd25OZXdCcmljayA9IGZ1bmN0aW9uKGdzKXtcbiAgZ3MuYnJpY2suY3VycmVudCA9IGdzLmJyaWNrLm5leHQ7XG4gIGdzLmJyaWNrLmN1cnJlbnQucG9zID0gWzQsIC0xXTtcbiAgcmV0dXJuIGdzLmJyaWNrLm5leHQgPSBuZXdCcmljaygpO1xufTtcbm91dCQucmVzZXRTdGF0ZSA9IHJlc2V0U3RhdGUgPSBmdW5jdGlvbihicmljayl7XG4gIGJyaWNrLm5leHQgPSBuZXdCcmljaygpO1xuICByZXR1cm4gYnJpY2suY3VycmVudCA9IG5ld0JyaWNrKCk7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgYnJpY2sucm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gYnJpY2suc2hhcGUgPSBCcmlja1NoYXBlc1ticmljay50eXBlXVticmljay5yb3RhdGlvbl07XG59O1xub3V0JC5nZXRTaGFwZU9mUm90YXRpb24gPSBnZXRTaGFwZU9mUm90YXRpb24gPSBmdW5jdGlvbihicmljaywgcm90YXRpb24pe1xuICByb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCByb3RhdGlvbik7XG4gIHJldHVybiBCcmlja1NoYXBlc1ticmljay50eXBlXVtyb3RhdGlvbl07XG59O1xub3V0JC5ub3JtYWxpc2VSb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgcmV0dXJuIHdyYXAoMCwgQnJpY2tTaGFwZXNbYnJpY2sudHlwZV0ubGVuZ3RoIC0gMSwgYnJpY2sucm90YXRpb24gKyByb3RhdGlvbik7XG59O1xuZHJhd0NlbGwgPSBmdW5jdGlvbihpdCl7XG4gIGlmIChpdCkge1xuICAgIHJldHVybiBcIuKWkuKWklwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIiAgXCI7XG4gIH1cbn07XG5vdXQkLmRyYXdCcmljayA9IGRyYXdCcmljayA9IGZ1bmN0aW9uKHNoYXBlKXtcbiAgcmV0dXJuIHNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0Lm1hcChkcmF3Q2VsbCkuam9pbignJyk7XG4gIH0pLmpvaW4oXCJcXG5cIik7XG59OyIsInZhciBzcXVhcmUsIHppZywgemFnLCBsZWZ0LCByaWdodCwgdGVlLCB0ZXRyaXMsIGFsbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuc3F1YXJlID0gc3F1YXJlID0gW1tbMCwgMCwgMF0sIFswLCAxLCAxXSwgWzAsIDEsIDFdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXV0sIFtbMCwgMiwgMF0sIFsyLCAyLCAwXSwgWzIsIDAsIDBdXV07XG5vdXQkLnphZyA9IHphZyA9IFtbWzAsIDAsIDBdLCBbMCwgMywgM10sIFszLCAzLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdXV07XG5vdXQkLmxlZnQgPSBsZWZ0ID0gW1tbMCwgMCwgMF0sIFs0LCA0LCA0XSwgWzQsIDAsIDBdXSwgW1s0LCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXV0sIFtbMCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDRdXV07XG5vdXQkLnJpZ2h0ID0gcmlnaHQgPSBbW1swLCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgNV1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXV0sIFtbNSwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDBdXSwgW1swLCA1LCA1XSwgWzAsIDUsIDBdLCBbMCwgNSwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDBdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgNl0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdXV07XG5vdXQkLnRldHJpcyA9IHRldHJpcyA9IFtbWzAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMF0sIFs3LCA3LCA3LCA3XV0sIFtbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF1dXTtcbm91dCQuYWxsID0gYWxsID0gW1xuICB7XG4gICAgdHlwZTogJ3NxdWFyZScsXG4gICAgc2hhcGVzOiBzcXVhcmVcbiAgfSwge1xuICAgIHR5cGU6ICd6aWcnLFxuICAgIHNoYXBlczogemlnXG4gIH0sIHtcbiAgICB0eXBlOiAnemFnJyxcbiAgICBzaGFwZXM6IHphZ1xuICB9LCB7XG4gICAgdHlwZTogJ2xlZnQnLFxuICAgIHNoYXBlczogbGVmdFxuICB9LCB7XG4gICAgdHlwZTogJ3JpZ2h0JyxcbiAgICBzaGFwZXM6IHJpZ2h0XG4gIH0sIHtcbiAgICB0eXBlOiAndGVlJyxcbiAgICBzaGFwZXM6IHRlZVxuICB9LCB7XG4gICAgdHlwZTogJ3RldHJpcycsXG4gICAgc2hhcGVzOiB0ZXRyaXNcbiAgfVxuXTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIFRpbWVyLCBwcmltZUdhbWVTdGF0ZSwgYW5pbWF0aW9uVGltZUZvclJvd3MsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdzLCBvcHRpb25zKXtcbiAgcmV0dXJuIGdzLmNvcmUgPSB7XG4gICAgcGF1c2VkOiBmYWxzZSxcbiAgICBzbG93ZG93bjogMSxcbiAgICBzb2Z0RHJvcE1vZGU6IGZhbHNlLFxuICAgIHJvd3NUb1JlbW92ZTogW10sXG4gICAgcm93c1JlbW92ZWRUaGlzRnJhbWU6IGZhbHNlLFxuICAgIGRyb3BUaW1lcjogVGltZXIuY3JlYXRlKFwiRHJvcCB0aW1lclwiLCBvcHRpb25zLnN0YXJ0aW5nRHJvcFNwZWVkLCB0cnVlKSxcbiAgICBrZXlSZXBlYXRUaW1lcjogVGltZXIuY3JlYXRlKFwiS2V5IHJlcGVhdFwiLCBvcHRpb25zLmtleVJlcGVhdFRpbWUpLFxuICAgIHNvZnREcm9wV2FpdFRpbWVyOiBUaW1lci5jcmVhdGUoXCJTb2Z0LWRyb3Agd2FpdCB0aW1lXCIsIG9wdGlvbnMuc29mdERyb3BXYWl0VGltZSksXG4gICAgaGFyZERyb3BBbmltYXRpb246IFRpbWVyLmNyZWF0ZShcIkhhcmQtZHJvcCBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24uaGFyZERyb3BFZmZlY3RUaW1lKSxcbiAgICBwcmV2aWV3UmV2ZWFsQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJOZXh0IGJyaWNrIGFuaW1hdGlvblwiLCBvcHRpb25zLmFuaW1hdGlvbi5wcmV2aWV3UmV2ZWFsVGltZSlcbiAgfTtcbn07XG5vdXQkLmFuaW1hdGlvblRpbWVGb3JSb3dzID0gYW5pbWF0aW9uVGltZUZvclJvd3MgPSBmdW5jdGlvbihyb3dzKXtcbiAgcmV0dXJuIDEwICsgTWF0aC5wb3coMywgcm93cy5sZW5ndGgpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgd3JhcCwgVGltZXIsIG1lbnVEYXRhLCBsaW1pdGVyLCBwcmltZUdhbWVTdGF0ZSwgY2hvb3NlT3B0aW9uLCBzZWxlY3RQcmV2SXRlbSwgc2VsZWN0TmV4dEl0ZW0sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHdyYXAgPSByZWYkLndyYXA7XG5UaW1lciA9IHJlcXVpcmUoJy4uL3V0aWxzL3RpbWVyJyk7XG5tZW51RGF0YSA9IFtcbiAge1xuICAgIHN0YXRlOiAncmVzdGFydCcsXG4gICAgdGV4dDogXCJSZXN0YXJ0XCJcbiAgfSwge1xuICAgIHN0YXRlOiAnZ28tYmFjaycsXG4gICAgdGV4dDogXCJCYWNrIHRvIE1haW5cIlxuICB9XG5dO1xubGltaXRlciA9IHdyYXAoMCwgbWVudURhdGEubGVuZ3RoIC0gMSk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5nYW1lT3ZlciA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGEsXG4gICAgcmV2ZWFsQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJHYW1lIG92ZXIgcmV2ZWFsIGFuaW1hdGlvblwiLCBvcHRpb25zLmFuaW1hdGlvbi5nYW1lT3ZlclJldmVhbFRpbWUpXG4gIH07XG59O1xub3V0JC5jaG9vc2VPcHRpb24gPSBjaG9vc2VPcHRpb24gPSBmdW5jdGlvbihtcywgaW5kZXgpe1xuICBtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIG1zLmN1cnJlbnRTdGF0ZSA9IG1lbnVEYXRhW21zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24obXMpe1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKG1zLCBtcy5jdXJyZW50SW5kZXggLSAxKTtcbn07XG5vdXQkLnNlbGVjdE5leHRJdGVtID0gc2VsZWN0TmV4dEl0ZW0gPSBmdW5jdGlvbihtcyl7XG4gIHJldHVybiBjaG9vc2VPcHRpb24obXMsIG1zLmN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgcmFuZG9tRnJvbSwgQ29yZSwgQXJlbmEsIEJyaWNrLCBTY29yZSwgU3RhcnRNZW51LCBHYW1lT3ZlciwgVGltZXIsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5Db3JlID0gcmVxdWlyZSgnLi9nYW1lLWNvcmUnKTtcbkFyZW5hID0gcmVxdWlyZSgnLi9hcmVuYScpO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJyk7XG5TY29yZSA9IHJlcXVpcmUoJy4vc2NvcmUnKTtcblN0YXJ0TWVudSA9IHJlcXVpcmUoJy4vc3RhcnQtbWVudScpO1xuR2FtZU92ZXIgPSByZXF1aXJlKCcuL2dhbWUtb3ZlcicpO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xub3V0JC5UZXRyaXNHYW1lID0gVGV0cmlzR2FtZSA9IChmdW5jdGlvbigpe1xuICBUZXRyaXNHYW1lLmRpc3BsYXlOYW1lID0gJ1RldHJpc0dhbWUnO1xuICB2YXIgcHJvdG90eXBlID0gVGV0cmlzR2FtZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGV0cmlzR2FtZTtcbiAgZnVuY3Rpb24gVGV0cmlzR2FtZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKXtcbiAgICBDb3JlLnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSwgZ2FtZU9wdGlvbnMpO1xuICAgIEFyZW5hLnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSwgZ2FtZU9wdGlvbnMpO1xuICAgIEJyaWNrLnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSwgZ2FtZU9wdGlvbnMpO1xuICAgIFNjb3JlLnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSwgZ2FtZU9wdGlvbnMpO1xuICAgIFN0YXJ0TWVudS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBHYW1lT3Zlci5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgfVxuICBwcm90b3R5cGUuYmVnaW5OZXdHYW1lID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgQXJlbmEuY2xlYXJBcmVuYShncy5hcmVuYSk7XG4gICAgU2NvcmUucmVzZXRTY29yZShncy5zY29yZSk7XG4gICAgQnJpY2sucmVzZXRTdGF0ZShncy5icmljayk7XG4gICAgcmV0dXJuIGdzO1xuICB9O1xuICBwcm90b3R5cGUucmV2ZWFsU3RhcnRNZW51ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAnc3RhcnQtbWVudSc7XG4gICAgcmV0dXJuIFN0YXJ0TWVudS5iZWdpblJldmVhbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5yZXZlYWxHYW1lT3ZlciA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiBUaW1lci5yZXNldChncy5nYW1lT3Zlci5yZXZlYWxBbmltYXRpb24pO1xuICB9O1xuICBwcm90b3R5cGUuaGFuZGxlS2V5SW5wdXQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXQsIGxyZXN1bHQkLCByZWYkLCBrZXksIGFjdGlvbiwgYW10LCBpLCBwb3MsIGkkLCB0byQsIHksIGxyZXN1bHQxJCwgaiQsIHRvMSQsIHgsIHJlc3VsdHMkID0gW107XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXQgPSBncy5pbnB1dDtcbiAgICB3aGlsZSAoaW5wdXQubGVuZ3RoKSB7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgcmVmJCA9IGlucHV0LnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICBpZiAoQXJlbmEuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gLT0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKEFyZW5hLmNhbk1vdmUoYnJpY2suY3VycmVudCwgWzEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLmNvcmUuc29mdERyb3BNb2RlID0gdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgY2FzZSAnY3cnOlxuICAgICAgICAgIGlmIChBcmVuYS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKEJyaWNrLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIDEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Njdyc6XG4gICAgICAgICAgaWYgKEFyZW5hLmNhblJvdGF0ZShicmljay5jdXJyZW50LCAtMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKEJyaWNrLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdoYXJkLWRyb3AnOlxuICAgICAgICAgIGdzLmNvcmUuaGFyZERyb3BEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgd2hpbGUgKEFyZW5hLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgICAgICBncy5jb3JlLmhhcmREcm9wRGlzdGFuY2UgKz0gMTtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdzLmlucHV0ID0gW107XG4gICAgICAgICAgVGltZXIucmVzZXQoZ3MuY29yZS5oYXJkRHJvcEFuaW1hdGlvbiwgZ3MuY29yZS5oYXJkRHJvcERpc3RhbmNlICogMTAgKyAxKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFRpbWVyLnNldFRpbWVUb0V4cGlyeShncy5jb3JlLmRyb3BUaW1lciwgLTEpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctMSc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTInOlxuICAgICAgICBjYXNlICdkZWJ1Zy0zJzpcbiAgICAgICAgY2FzZSAnZGVidWctNCc6XG4gICAgICAgICAgYW10ID0gcGFyc2VJbnQoa2V5LnJlcGxhY2UoL1xcRC9nLCAnJykpO1xuICAgICAgICAgIGxvZyhcIkRFQlVHOiBEZXN0cm95aW5nIHJvd3M6XCIsIGFtdCk7XG4gICAgICAgICAgZ3MuY29yZS5yb3dzVG9SZW1vdmUgPSAoZm4kKCkpO1xuICAgICAgICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAncmVtb3ZlLWxpbmVzJztcbiAgICAgICAgICBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBUaW1lci5yZXNldChncy5hcmVuYS56YXBBbmltYXRpb24sIENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3MuY29yZS5yb3dzVG9SZW1vdmUpKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFNjb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3MuY29yZS5yb3dzVG9SZW1vdmUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctNSc6XG4gICAgICAgICAgcG9zID0gZ3MuYnJpY2suY3VycmVudC5wb3M7XG4gICAgICAgICAgZ3MuYnJpY2suY3VycmVudCA9IEJyaWNrLm5ld0JyaWNrKDYpO1xuICAgICAgICAgIGltcG9ydCQoZ3MuYnJpY2suY3VycmVudC5wb3MsIHBvcyk7XG4gICAgICAgICAgZm9yIChpJCA9IGFyZW5hLmhlaWdodCAtIDEsIHRvJCA9IGFyZW5hLmhlaWdodCAtIDQ7IGkkID49IHRvJDsgLS1pJCkge1xuICAgICAgICAgICAgeSA9IGkkO1xuICAgICAgICAgICAgbHJlc3VsdDEkID0gW107XG4gICAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IGFyZW5hLndpZHRoIC0gMjsgaiQgPD0gdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgICB4ID0gaiQ7XG4gICAgICAgICAgICAgIGxyZXN1bHQxJC5wdXNoKGFyZW5hLmNlbGxzW3ldW3hdID0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGxyZXN1bHQxJCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy02JzpcbiAgICAgICAgICBncy5jb3JlLnJvd3NUb1JlbW92ZSA9IFsxMCwgMTIsIDE0XTtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChUaW1lci5yZXNldChncy5hcmVuYS56YXBBbmltYXRpb24sIENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3MuY29yZS5yb3dzVG9SZW1vdmUpKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MuY29yZS5zb2Z0RHJvcE1vZGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgZnVuY3Rpb24gZm4kKCl7XG4gICAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSBncy5hcmVuYS5oZWlnaHQgLSBhbXQsIHRvJCA9IGdzLmFyZW5hLmhlaWdodCAtIDE7IGkkIDw9IHRvJDsgKytpJCkge1xuICAgICAgICBpID0gaSQ7XG4gICAgICAgIHJlc3VsdHMkLnB1c2goaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuY2xlYXJPbmVGcmFtZUZsYWdzID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHJldHVybiBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS56YXBUaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmIChncy5hcmVuYS56YXBBbmltYXRpb24uZXhwaXJlZCkge1xuICAgICAgQXJlbmEucmVtb3ZlUm93cyhncy5hcmVuYSwgZ3MuY29yZS5yb3dzVG9SZW1vdmUpO1xuICAgICAgZ3MuY29yZS5yb3dzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLmdhbWVUaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0LCBjb21wbGV0ZVJvd3MsIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgcm93O1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0ID0gZ3MuaW5wdXQ7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGlmIChBcmVuYS5yb3dJc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgcmVzJC5wdXNoKGl4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29tcGxldGVSb3dzID0gcmVzJDtcbiAgICBpZiAoY29tcGxldGVSb3dzLmxlbmd0aCkge1xuICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICBncy5jb3JlLnJvd3NUb1JlbW92ZSA9IGNvbXBsZXRlUm93cztcbiAgICAgIFRpbWVyLnJlc2V0KGdzLmFyZW5hLnphcEFuaW1hdGlvbiwgQ29yZS5hbmltYXRpb25UaW1lRm9yUm93cyhncy5jb3JlLnJvd3NUb1JlbW92ZSkpO1xuICAgICAgU2NvcmUuY29tcHV0ZVNjb3JlKGdzLnNjb3JlLCBncy5jb3JlLnJvd3NUb1JlbW92ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChBcmVuYS50b3BJc1JlYWNoZWQoYXJlbmEpKSB7XG4gICAgICB0aGlzLnJldmVhbEdhbWVPdmVyKGdzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGdzLmNvcmUuc29mdERyb3BNb2RlKSB7XG4gICAgICBUaW1lci5zZXRUaW1lVG9FeHBpcnkoZ3MuY29yZS5kcm9wVGltZXIsIDApO1xuICAgIH1cbiAgICBpZiAoZ3MuY29yZS5kcm9wVGltZXIuZXhwaXJlZCkge1xuICAgICAgVGltZXIucmVzZXRXaXRoUmVtYWluZGVyKGdzLmNvcmUuZHJvcFRpbWVyKTtcbiAgICAgIGlmIChBcmVuYS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQXJlbmEuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIEJyaWNrLnNwYXduTmV3QnJpY2soZ3MpO1xuICAgICAgICBUaW1lci5yZXNldChncy5jb3JlLnByZXZpZXdSZXZlYWxBbmltYXRpb24pO1xuICAgICAgICBncy5mb3JjZURyb3BNb2RlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhhbmRsZUtleUlucHV0KGdzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmdhbWVPdmVyVGljayA9IGZ1bmN0aW9uKGdzLCDOlHQpe1xuICAgIHZhciBpbnB1dCwgZ2FtZU92ZXIsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0ID0gZ3MuaW5wdXQsIGdhbWVPdmVyID0gZ3MuZ2FtZU92ZXI7XG4gICAgd2hpbGUgKGlucHV0Lmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0LnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChHYW1lT3Zlci5zZWxlY3RQcmV2SXRlbShnYW1lT3ZlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKEdhbWVPdmVyLnNlbGVjdE5leHRJdGVtKGdhbWVPdmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgaWYgKGdhbWVPdmVyLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3Jlc3RhcnQnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChnYW1lT3Zlci5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdnby1iYWNrJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJldmVhbFN0YXJ0TWVudShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuc3RhcnRNZW51VGljayA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXQsIHN0YXJ0TWVudSwgcmVmJCwga2V5LCBhY3Rpb24sIHJlc3VsdHMkID0gW107XG4gICAgaW5wdXQgPSBncy5pbnB1dCwgc3RhcnRNZW51ID0gZ3Muc3RhcnRNZW51O1xuICAgIHdoaWxlIChpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dC5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goU3RhcnRNZW51LnNlbGVjdFByZXZJdGVtKHN0YXJ0TWVudSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICBpZiAoc3RhcnRNZW51LmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3N0YXJ0LWdhbWUnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzLCBhcmckKXtcbiAgICB2YXIgzpR0LCB0aW1lLCBmcmFtZSwgZnBzLCBpbnB1dDtcbiAgICDOlHQgPSBhcmckLs6UdCwgdGltZSA9IGFyZyQudGltZSwgZnJhbWUgPSBhcmckLmZyYW1lLCBmcHMgPSBhcmckLmZwcywgaW5wdXQgPSBhcmckLmlucHV0O1xuICAgIGdzLmZwcyA9IGZwcztcbiAgICBncy7OlHQgPSDOlHQ7XG4gICAgZ3MuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICAgIGdzLmVsYXBzZWRGcmFtZXMgPSBmcmFtZTtcbiAgICBncy5pbnB1dCA9IGlucHV0O1xuICAgIGlmICghZ3MuY29yZS5wYXVzZWQpIHtcbiAgICAgIFRpbWVyLnVwZGF0ZUFsbEluKGdzLCDOlHQpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFyT25lRnJhbWVGbGFncyhncyk7XG4gICAgc3dpdGNoIChncy5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLnJldmVhbFN0YXJ0TWVudS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLmdhbWVUaWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuZ2FtZU92ZXJUaWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMuc3RhcnRNZW51VGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHRoaXMuemFwVGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1Vua25vd24gbWV0YWdhbWUtc3RhdGU6JywgZ3MubWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBncztcbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrU2hhcGVzLCBwcmltZUdhbWVTdGF0ZSwgY29tcHV0ZVNjb3JlLCB1cGRhdGVTY29yZSwgcmVzZXRTY29yZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5zY29yZSA9IHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwXG4gIH07XG59O1xub3V0JC5jb21wdXRlU2NvcmUgPSBjb21wdXRlU2NvcmUgPSBmdW5jdGlvbihyb3dzLCBsdmwpe1xuICBsdmwgPT0gbnVsbCAmJiAobHZsID0gMCk7XG4gIHN3aXRjaCAocm93cy5sZW5ndGgpIHtcbiAgY2FzZSAxOlxuICAgIHJldHVybiA0MCAqIChsdmwgKyAxKTtcbiAgY2FzZSAyOlxuICAgIHJldHVybiAxMDAgKiAobHZsICsgMSk7XG4gIGNhc2UgMzpcbiAgICByZXR1cm4gMzAwICogKGx2bCArIDEpO1xuICBjYXNlIDQ6XG4gICAgcmV0dXJuIDEyMDAgKiAobHZsICsgMSk7XG4gIH1cbn07XG5vdXQkLnVwZGF0ZVNjb3JlID0gdXBkYXRlU2NvcmUgPSBmdW5jdGlvbihhcmckLCByb3dMZW5ndGgsIHBvaW50cyl7XG4gIHZhciBzY29yZTtcbiAgc2NvcmUgPSBhcmckLnNjb3JlO1xuICBzY29yZS5wb2ludHMgKz0gcG9pbnRzO1xuICBzY29yZS5saW5lcyArPSByb3dzLmxlbmd0aDtcbiAgc3dpdGNoIChyb3dMZW5ndGgpIHtcbiAgY2FzZSAxOlxuICAgIHJldHVybiBzY29yZS5zaW5nbGVzICs9IDE7XG4gIGNhc2UgMjpcbiAgICByZXR1cm4gc2NvcmUuZG91YmxlcyArPSAxO1xuICBjYXNlIDM6XG4gICAgcmV0dXJuIHNjb3JlLnRyaXBsZXMgKz0gMTtcbiAgY2FzZSA0OlxuICAgIHJldHVybiBzY29yZS50ZXRyaXMgKz0gMTtcbiAgfVxufTtcbm91dCQucmVzZXRTY29yZSA9IHJlc2V0U2NvcmUgPSBmdW5jdGlvbihzY29yZSl7XG4gIHJldHVybiBpbXBvcnQkKHNjb3JlLCB7XG4gICAgcG9pbnRzOiAwLFxuICAgIGxpbmVzOiAwLFxuICAgIHNpbmdsZXM6IDAsXG4gICAgZG91YmxlczogMCxcbiAgICB0cmlwbGVzOiAwLFxuICAgIHRldHJpczogMFxuICB9KTtcbn07XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCB3cmFwLCBUaW1lciwgbWVudURhdGEsIGxpbWl0ZXIsIHByaW1lR2FtZVN0YXRlLCB1cGRhdGUsIGJlZ2luUmV2ZWFsLCBjaG9vc2VPcHRpb24sIHNlbGVjdFByZXZJdGVtLCBzZWxlY3ROZXh0SXRlbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgd3JhcCA9IHJlZiQud3JhcDtcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbm1lbnVEYXRhID0gW1xuICB7XG4gICAgc3RhdGU6ICdzdGFydC1nYW1lJyxcbiAgICB0ZXh0OiBcIlN0YXJ0IEdhbWVcIlxuICB9LCB7XG4gICAgc3RhdGU6ICdub3RoaW5nJyxcbiAgICB0ZXh0OiBcIkRvbid0IFN0YXJ0IEdhbWVcIlxuICB9XG5dO1xubGltaXRlciA9IHdyYXAoMCwgbWVudURhdGEubGVuZ3RoIC0gMSk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5zdGFydE1lbnUgPSB7XG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGN1cnJlbnRTdGF0ZTogbWVudURhdGFbMF0sXG4gICAgbWVudURhdGE6IG1lbnVEYXRhLFxuICAgIHRpdGxlUmV2ZWFsQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJUaXRsZSByZXZlYWwgYW5pbWF0aW9uXCIsIG9wdGlvbnMuYW5pbWF0aW9uLnRpdGxlUmV2ZWFsVGltZSlcbiAgfTtcbn07XG5vdXQkLnVwZGF0ZSA9IHVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXtcbiAgcmV0dXJuIGhhbmRsZUlucHV0KGdzLCBncy5pbnB1dCk7XG59O1xub3V0JC5iZWdpblJldmVhbCA9IGJlZ2luUmV2ZWFsID0gZnVuY3Rpb24oZ3Mpe1xuICByZXR1cm4gVGltZXIucmVzZXQoZ3Muc3RhcnRNZW51LnRpdGxlUmV2ZWFsQW5pbWF0aW9uKTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKHNtcywgaW5kZXgpe1xuICBzbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBzbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbc21zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKHNtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IHNtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oc21zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCByYW5kLCBmbG9vciwgQmFzZSwgTWF0ZXJpYWxzLCBBcmVuYUNlbGxzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5BcmVuYUNlbGxzID0gQXJlbmFDZWxscyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmFDZWxscywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFDZWxscycsIEFyZW5hQ2VsbHMpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmFDZWxscztcbiAgZnVuY3Rpb24gQXJlbmFDZWxscyhvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIG1hcmdpbiwgYm94R2VvLCByZWYkLCByZXMkLCBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCBjdWJlO1xuICAgIGJsb2NrU2l6ZSA9IG9wdHMuYmxvY2tTaXplLCBncmlkU2l6ZSA9IG9wdHMuZ3JpZFNpemU7XG4gICAgQXJlbmFDZWxscy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgd2lkdGggPSBncmlkU2l6ZSAqIGdzLmFyZW5hLndpZHRoO1xuICAgIGhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIG1hcmdpbiA9IChncmlkU2l6ZSAtIGJsb2NrU2l6ZSkgLyAyO1xuICAgIGJveEdlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIGJsb2NrU2l6ZSwgYmxvY2tTaXplKTtcbiAgICB0aGlzLm9mZnNldCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5vZmZzZXQpO1xuICAgIHJlZiQgPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbjtcbiAgICByZWYkLnggPSB3aWR0aCAvIC0yICsgMC41ICogZ3JpZFNpemU7XG4gICAgcmVmJC55ID0gaGVpZ2h0IC0gMC41ICogZ3JpZFNpemU7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IHBpO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZ3MuYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChib3hHZW8sIE1hdGVyaWFscy5ub3JtYWwpO1xuICAgICAgICBjdWJlLnBvc2l0aW9uLnNldCh4ICogZ3JpZFNpemUsIHkgKiBncmlkU2l6ZSwgMCk7XG4gICAgICAgIGN1YmUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9mZnNldC5hZGQoY3ViZSk7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY3ViZSk7XG4gICAgICB9XG4gICAgICByZXMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICB0aGlzLmNlbGxzID0gcmVzJDtcbiAgfVxuICBwcm90b3R5cGUudG9nZ2xlUm93T2ZDZWxscyA9IGZ1bmN0aW9uKHJvd0l4LCBzdGF0ZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBib3gsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMuY2VsbHNbcm93SXhdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgYm94ID0gcmVmJFtpJF07XG4gICAgICBib3gubWF0ZXJpYWwgPSBNYXRlcmlhbHMuemFwO1xuICAgICAgcmVzdWx0cyQucHVzaChib3gudmlzaWJsZSA9IHN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd1phcEVmZmVjdCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYXJlbmEsIGNvcmUsIG9uT2ZmLCBpJCwgcmVmJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgY29yZSA9IGdzLmNvcmU7XG4gICAgb25PZmYgPSBhcmVuYS56YXBBbmltYXRpb24ucHJvZ3Jlc3MgPCAwLjQgJiYgISEoZmxvb3IoYXJlbmEuemFwQW5pbWF0aW9uLmN1cnJlbnRUaW1lICogMTApICUgMik7XG4gICAgb25PZmYgPSAhKGZsb29yKGFyZW5hLnphcEFuaW1hdGlvbi5jdXJyZW50VGltZSkgJSAyKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gY29yZS5yb3dzVG9SZW1vdmUpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb3dJeCA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnRvZ2dsZVJvd09mQ2VsbHMocm93SXgsIG9uT2ZmKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZUNlbGxzID0gZnVuY3Rpb24oY2VsbHMpe1xuICAgIHZhciBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIHRoaXMuY2VsbHNbeV1beF0udmlzaWJsZSA9ICEhY2VsbDtcbiAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmNlbGxzW3ldW3hdLm1hdGVyaWFsID0gTWF0ZXJpYWxzLmJsb2Nrc1tjZWxsXSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gQXJlbmFDZWxscztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgcmFuZCwgQmFzZSwgRnJhbWUsIEZhbGxpbmdCcmljaywgR3VpZGUsIEFyZW5hQ2VsbHMsIFBhcnRpY2xlRWZmZWN0LCBBcmVuYSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWF4ID0gcmVmJC5tYXgsIHJhbmQgPSByZWYkLnJhbmQ7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkZyYW1lID0gcmVxdWlyZSgnLi9mcmFtZScpLkZyYW1lO1xuRmFsbGluZ0JyaWNrID0gcmVxdWlyZSgnLi9mYWxsaW5nLWJyaWNrJykuRmFsbGluZ0JyaWNrO1xuR3VpZGUgPSByZXF1aXJlKCcuL2d1aWRlJykuR3VpZGU7XG5BcmVuYUNlbGxzID0gcmVxdWlyZSgnLi9hcmVuYS1jZWxscycpLkFyZW5hQ2VsbHM7XG5QYXJ0aWNsZUVmZmVjdCA9IHJlcXVpcmUoJy4vcGFydGljbGUtZWZmZWN0JykuUGFydGljbGVFZmZlY3Q7XG5vdXQkLkFyZW5hID0gQXJlbmEgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEFyZW5hLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdBcmVuYScsIEFyZW5hKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEFyZW5hO1xuICBmdW5jdGlvbiBBcmVuYShvcHRzLCBncyl7XG4gICAgdmFyIG5hbWUsIHJlZiQsIHBhcnQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBBcmVuYS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgbG9nKCdSZW5kZXJlcjo6QXJlbmE6Om5ldycpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmcmFtZXNTaW5jZVJvd3NSZW1vdmVkOiAwXG4gICAgfTtcbiAgICB0aGlzLnBhcnRzID0ge1xuICAgICAgZnJhbWU6IG5ldyBGcmFtZSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGd1aWRlOiBuZXcgR3VpZGUodGhpcy5vcHRzLCBncyksXG4gICAgICBhcmVuYUNlbGxzOiBuZXcgQXJlbmFDZWxscyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHRoaXNCcmljazogbmV3IEZhbGxpbmdCcmljayh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHBhcnRpY2xlczogbmV3IFBhcnRpY2xlRWZmZWN0KHRoaXMub3B0cywgZ3MpXG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmJCA9IHRoaXMucGFydHMpIHtcbiAgICAgIHBhcnQgPSByZWYkW25hbWVdO1xuICAgICAgcGFydC5hZGRUbyh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSB0aGlzLm9wdHMuYXJlbmFPZmZzZXRGcm9tQ2VudHJlO1xuICB9XG4gIHByb3RvdHlwZS5qb2x0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBwLCB6eiwgam9sdDtcbiAgICBwID0gbWF4KDAsIDEgLSBncy5hcmVuYS5qb2x0QW5pbWF0aW9uLnByb2dyZXNzKTtcbiAgICB6eiA9IGdzLmNvcmUucm93c1RvUmVtb3ZlLmxlbmd0aDtcbiAgICByZXR1cm4gam9sdCA9IC0xICogcCAqICgxICsgenopICogdGhpcy5vcHRzLmhhcmREcm9wSm9sdEFtb3VudDtcbiAgfTtcbiAgcHJvdG90eXBlLmppdHRlciA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcCwgenosIGppdHRlcjtcbiAgICBwID0gMSAtIGdzLmFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcztcbiAgICB6eiA9IGdzLmNvcmUucm93c1RvUmVtb3ZlLmxlbmd0aCAqIHRoaXMub3B0cy5ncmlkU2l6ZSAvIDQwO1xuICAgIHJldHVybiBqaXR0ZXIgPSBbcCAqIHJhbmQoLXp6LCB6eiksIHAgKiByYW5kKC16eiwgenopXTtcbiAgfTtcbiAgcHJvdG90eXBlLnphcExpbmVzID0gZnVuY3Rpb24oZ3MsIHBvc2l0aW9uUmVjZWl2aW5nSm9sdCl7XG4gICAgdmFyIGpvbHQsIGppdHRlcjtcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMuc2hvd1phcEVmZmVjdChncyk7XG4gICAgaWYgKGdzLmNvcmUucm93c1JlbW92ZWRUaGlzRnJhbWUpIHtcbiAgICAgIHRoaXMucGFydHMucGFydGljbGVzLnJlc2V0KCk7XG4gICAgICB0aGlzLnBhcnRzLnBhcnRpY2xlcy5wcmVwYXJlKGdzLmNvcmUucm93c1RvUmVtb3ZlKTtcbiAgICAgIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCA9IDA7XG4gICAgfVxuICAgIHRoaXMucGFydHMuZ3VpZGUuc2hvd0ZsYXJlKGdzLmFyZW5hLmpvbHRBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIGpvbHQgPSB0aGlzLmpvbHQoZ3MpO1xuICAgIGppdHRlciA9IHRoaXMuaml0dGVyKGdzKTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueCA9IGppdHRlclswXTtcbiAgICByZXR1cm4gcG9zaXRpb25SZWNlaXZpbmdKb2x0LnkgPSBqaXR0ZXJbMV0gKyBqb2x0IC8gMTA7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVQYXJ0aWNsZXMgPSBmdW5jdGlvbihncyl7XG4gICAgcmV0dXJuIHRoaXMucGFydHMucGFydGljbGVzLnVwZGF0ZShncy5hcmVuYS56YXBBbmltYXRpb24ucHJvZ3Jlc3MsIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCwgZ3MuzpR0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzLCBwb3NpdGlvblJlY2VpdmluZ0pvbHQpe1xuICAgIHZhciBhcmVuYSwgYnJpY2s7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgYnJpY2sgPSBncy5icmljaztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMudXBkYXRlQ2VsbHMoYXJlbmEuY2VsbHMpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLmRpc3BsYXlTaGFwZShicmljay5jdXJyZW50KTtcbiAgICB0aGlzLnBhcnRzLnRoaXNCcmljay51cGRhdGVQb3NpdGlvbihicmljay5jdXJyZW50LnBvcyk7XG4gICAgdGhpcy5wYXJ0cy5ndWlkZS5zaG93QmVhbShicmljay5jdXJyZW50KTtcbiAgICB0aGlzLnBhcnRzLmd1aWRlLnNob3dGbGFyZShhcmVuYS5qb2x0QW5pbWF0aW9uLnByb2dyZXNzLCBncy5oYXJkRHJvcERpc3RhbmNlKTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IHRoaXMuam9sdChncyk7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCArPSAxO1xuICB9O1xuICByZXR1cm4gQXJlbmE7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBNYXRlcmlhbHMsIEJhc2UsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkJhc2UgPSBCYXNlID0gKGZ1bmN0aW9uKCl7XG4gIEJhc2UuZGlzcGxheU5hbWUgPSAnQmFzZSc7XG4gIHZhciBoZWxwZXJNYXJrZXJHZW8sIHByb3RvdHlwZSA9IEJhc2UucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJhc2U7XG4gIGhlbHBlck1hcmtlckdlbyA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMC4wMiwgMC4wMiwgMC4wMik7XG4gIGZ1bmN0aW9uIEJhc2Uob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5yb290ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5yZWdpc3RyYXRpb24pO1xuICB9XG4gIHByb3RvdHlwZS5hZGRSZWdpc3RyYXRpb25IZWxwZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzdGFydCwgZW5kLCBkaXN0YW5jZSwgZGlyLCBhcnJvdztcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckEpKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBNYXRlcmlhbHMuaGVscGVyQikpO1xuICAgIHN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCk7XG4gICAgZW5kID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb247XG4gICAgZGlzdGFuY2UgPSBzdGFydC5kaXN0YW5jZVRvKGVuZCk7XG4gICAgaWYgKGRpc3RhbmNlID4gMCkge1xuICAgICAgZGlyID0gbmV3IFRIUkVFLlZlY3RvcjMoKS5zdWJWZWN0b3JzKGVuZCwgc3RhcnQpLm5vcm1hbGl6ZSgpO1xuICAgICAgYXJyb3cgPSBuZXcgVEhSRUUuQXJyb3dIZWxwZXIoZGlyLCBzdGFydCwgZGlzdGFuY2UsIDB4MDAwMGZmKTtcbiAgICAgIHRoaXMucm9vdC5hZGQoYXJyb3cpO1xuICAgIH1cbiAgICByZXR1cm4gbG9nKCdSZWdpc3RyYXRpb24gaGVscGVyIGF0JywgdGhpcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hZGRCb3hIZWxwZXIgPSBmdW5jdGlvbih0aGluZyl7XG4gICAgdmFyIGJib3g7XG4gICAgYmJveCA9IG5ldyBUSFJFRS5Cb3VuZGluZ0JveEhlbHBlcih0aGluZywgMHg1NTU1ZmYpO1xuICAgIGJib3gudXBkYXRlKCk7XG4gICAgcmV0dXJuIHRoaXMucm9vdC5hZGQoYmJveCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVSZWdpc3RyYXRpb25IZWxwZXIgPSBmdW5jdGlvbigpe307XG4gIHByb3RvdHlwZS5zaG93Qm91bmRzID0gZnVuY3Rpb24oc2NlbmUpe1xuICAgIHRoaXMuYm91bmRzID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaXMucm9vdCwgMHg1NTU1NTUpO1xuICAgIHRoaXMuYm91bmRzLnVwZGF0ZSgpO1xuICAgIHJldHVybiBzY2VuZS5hZGQodGhpcy5ib3VuZHMpO1xuICB9O1xuICBwcm90b3R5cGUuYWRkVG8gPSBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiBvYmouYWRkKHRoaXMucm9vdCk7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdwb3NpdGlvbicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5yb290LnBvc2l0aW9uO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd2aXNpYmxlJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJvb3QudmlzaWJsZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oc3RhdGUpe1xuICAgICAgdGhpcy5yb290LnZpc2libGUgPSBzdGF0ZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gQmFzZTtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgbWluLCBCYXNlLCBCcmljaywgRWFzZSwgQnJpY2tQcmV2aWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbiwgbWluID0gcmVmJC5taW47XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrO1xuRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG5vdXQkLkJyaWNrUHJldmlldyA9IEJyaWNrUHJldmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIGdsYXNzTWF0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrUHJldmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2tQcmV2aWV3JywgQnJpY2tQcmV2aWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrUHJldmlldztcbiAgZ2xhc3NNYXQgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweDIyMjIyMixcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gICAgc2hpbmluZXNzOiAxMDAsXG4gICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgZGVwdGhXcml0ZTogZmFsc2VcbiAgfSk7XG4gIGZ1bmN0aW9uIEJyaWNrUHJldmlldyhvcHRzLCBncyl7XG4gICAgdmFyIHR1YmVSYWRpdXMsIHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmlja1ByZXZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMucyA9IHRoaXMub3B0cy5wcmV2aWV3U2NhbGVGYWN0b3I7XG4gICAgdGhpcy5jb2xvciA9IDB4ZmZmZmZmO1xuICAgIHR1YmVSYWRpdXMgPSB0aGlzLm9wdHMucHJldmlld0RvbWVSYWRpdXM7XG4gICAgdHViZUhlaWdodCA9IHRoaXMub3B0cy5wcmV2aWV3RG9tZUhlaWdodDtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMuYnJpY2sucm9vdC5zY2FsZS5zZXQodGhpcy5zLCB0aGlzLnMsIHRoaXMucyk7XG4gICAgdGhpcy5icmljay5yb290LnBvc2l0aW9uLnkgPSB0aGlzLm9wdHMuZ3JpZFNpemUgKiAyO1xuICAgIHRoaXMuYnJpY2sucm9vdC5wb3NpdGlvbi54ID0gMDtcbiAgICB0aGlzLmRvbWUgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5KHR1YmVSYWRpdXMsIDE2LCB0dWJlSGVpZ2h0LCAwKSwgZ2xhc3NNYXQpO1xuICAgIHRoaXMuZG9tZS5wb3NpdGlvbi55ID0gdHViZUhlaWdodDtcbiAgICB0aGlzLmJhc2UgPSB2b2lkIDg7XG4gICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KCdvcmFuZ2UnLCAxLCAwLjUpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQgLyAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmRvbWUpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljay5yb290KTtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheU5vdGhpbmcgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuYnJpY2sudmlzaWJsZSA9IGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDA7XG4gIH07XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgdGhpcy5icmljay52aXNpYmxlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5icmljay5wcmV0dHlEaXNwbGF5U2hhcGUoYnJpY2spO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlV2lnZ2xlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBlbGFwc2VkVGltZSwgdCwgcDtcbiAgICBlbGFwc2VkVGltZSA9IGdzLmVsYXBzZWRUaW1lO1xuICAgIHRoaXMucm9vdC5yb3RhdGlvbi55ID0gMC4yICogc2luKGVsYXBzZWRUaW1lIC8gNTAwKTtcbiAgICB0ID0gbWluKDEsIGdzLmNvcmUucHJldmlld1JldmVhbEFuaW1hdGlvbi5wcm9ncmVzcyk7XG4gICAgcCA9IEVhc2UuY3ViaWNJbih0LCAwLCB0aGlzLnMpO1xuICAgIHRoaXMuYnJpY2sucm9vdC5zY2FsZS5zZXQocCwgcCwgcCk7XG4gICAgaWYgKHQgPT09IDApIHtcbiAgICAgIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMztcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmNvbG9yLnNldEhleCgweGZmZmZmZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gdDtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmNvbG9yLnNldEhleCgweGZmYmIyMik7XG4gICAgfVxuICB9O1xuICByZXR1cm4gQnJpY2tQcmV2aWV3O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZGl2LCBwaSwgQmFzZSwgTWF0ZXJpYWxzLCBCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZGl2ID0gcmVmJC5kaXYsIHBpID0gcmVmJC5waTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5CcmljayA9IEJyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJldHR5T2Zmc2V0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmljaycsIEJyaWNrKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrO1xuICBwcmV0dHlPZmZzZXQgPSB7XG4gICAgc3F1YXJlOiBbLTIsIC0yXSxcbiAgICB6aWc6IFstMS41LCAtMl0sXG4gICAgemFnOiBbLTEuNSwgLTJdLFxuICAgIGxlZnQ6IFstMS41LCAtMl0sXG4gICAgcmlnaHQ6IFstMS41LCAtMl0sXG4gICAgdGVlOiBbLTEuNSwgLTJdLFxuICAgIHRldHJpczogWy0yLCAtMi41XVxuICB9O1xuICBmdW5jdGlvbiBCcmljayhvcHRzLCBncyl7XG4gICAgdmFyIHNpemUsIGdyaWQsIGJsb2NrR2VvLCByZXMkLCBpJCwgaSwgY3ViZTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEJyaWNrLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBzaXplID0gdGhpcy5vcHRzLmJsb2NrU2l6ZTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5mcmFtZSA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSg0ICogZ3JpZCwgNCAqIGdyaWQsIGdyaWQpLCBNYXRlcmlhbHMuZGVidWdXaXJlZnJhbWUpO1xuICAgIGJsb2NrR2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KHNpemUsIHNpemUsIHNpemUpO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMzsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGJsb2NrR2VvLCBNYXRlcmlhbHMubm9ybWFsKTtcbiAgICAgIHRoaXMuYnJpY2suYWRkKGN1YmUpO1xuICAgICAgcmVzJC5wdXNoKGN1YmUpO1xuICAgIH1cbiAgICB0aGlzLmNlbGxzID0gcmVzJDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi5zZXQoMCAqIGdyaWQsIC0wLjUgKiBncmlkLCAwKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2spO1xuICB9XG4gIHByb3RvdHlwZS5wcmV0dHlEaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVNoYXBlKGJyaWNrLCB0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGFyZyQsIHByZXR0eSl7XG4gICAgdmFyIHNoYXBlLCB0eXBlLCBpeCwgZ3JpZCwgbWFyZ2luLCBvZmZzZXQsIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHgkLCByZXN1bHRzJCA9IFtdO1xuICAgIHNoYXBlID0gYXJnJC5zaGFwZSwgdHlwZSA9IGFyZyQudHlwZTtcbiAgICBwcmV0dHkgPT0gbnVsbCAmJiAocHJldHR5ID0gZmFsc2UpO1xuICAgIGl4ID0gMDtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIG1hcmdpbiA9ICh0aGlzLm9wdHMuZ3JpZFNpemUgLSB0aGlzLm9wdHMuYmxvY2tTaXplKSAvIDI7XG4gICAgb2Zmc2V0ID0gcHJldHR5XG4gICAgICA/IHByZXR0eU9mZnNldFt0eXBlXVxuICAgICAgOiBbLTIsIC0yXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHNoYXBlLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSBzaGFwZVtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHgkID0gdGhpcy5jZWxsc1tpeCsrXTtcbiAgICAgICAgICB4JC5wb3NpdGlvbi54ID0gKG9mZnNldFswXSArIDAuNSArIHgpICogZ3JpZCArIG1hcmdpbjtcbiAgICAgICAgICB4JC5wb3NpdGlvbi55ID0gKG9mZnNldFsxXSArIDAuNSArIHkpICogZ3JpZCArIG1hcmdpbjtcbiAgICAgICAgICB4JC5tYXRlcmlhbCA9IE1hdGVyaWFscy5ibG9ja3NbY2VsbF07XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh4JCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBCcmljaztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgQmFzZSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWF4ID0gcmVmJC5tYXg7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuRmFpbFNjcmVlbiA9IEZhaWxTY3JlZW4gPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZhaWxTY3JlZW4sIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZhaWxTY3JlZW4nLCBGYWlsU2NyZWVuKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZhaWxTY3JlZW47XG4gIGZ1bmN0aW9uIEZhaWxTY3JlZW4ob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRmFpbFNjcmVlbi5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgbG9nKFwiRmFpbFNjcmVlbjo6bmV3XCIpO1xuICB9XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7fTtcbiAgcmV0dXJuIEZhaWxTY3JlZW47XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIEJhc2UsIEJyaWNrLCBGYWxsaW5nQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKS5Ccmljaztcbm91dCQuRmFsbGluZ0JyaWNrID0gRmFsbGluZ0JyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGYWxsaW5nQnJpY2ssIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZhbGxpbmdCcmljaycsIEZhbGxpbmdCcmljayksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGYWxsaW5nQnJpY2s7XG4gIGZ1bmN0aW9uIEZhbGxpbmdCcmljayhvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGYWxsaW5nQnJpY2suc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZ3JpZCA9IG9wdHMuZ3JpZFNpemU7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmdyaWQgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmljayh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljay5yb290KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gLTMgKiB0aGlzLmdyaWQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IC0xLjUgKiB0aGlzLmdyaWQ7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICByZXR1cm4gdGhpcy5icmljay5kaXNwbGF5U2hhcGUoYnJpY2spO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbihwb3Mpe1xuICAgIHZhciB4LCB5O1xuICAgIHggPSBwb3NbMF0sIHkgPSBwb3NbMV07XG4gICAgcmV0dXJuIHRoaXMucm9vdC5wb3NpdGlvbi5zZXQodGhpcy5ncmlkICogeCwgdGhpcy5oZWlnaHQgLSB0aGlzLmdyaWQgKiB5LCAwKTtcbiAgfTtcbiAgcmV0dXJuIEZhbGxpbmdCcmljaztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIEZyYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkZyYW1lID0gRnJhbWUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZyYW1lLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGcmFtZScsIEZyYW1lKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lO1xuICBmdW5jdGlvbiBGcmFtZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGcmFtZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgcmV0dXJuIEZyYW1lO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIHNpbiwgbG9nLCBmbG9vciwgQmFzZSwgTWF0ZXJpYWxzLCBQYWxldHRlLCBHdWlkZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBzaW4gPSByZWYkLnNpbiwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKTtcbm91dCQuR3VpZGUgPSBHdWlkZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByZXR0eU9mZnNldCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChHdWlkZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnR3VpZGUnLCBHdWlkZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHdWlkZTtcbiAgcHJldHR5T2Zmc2V0ID0ge1xuICAgIHNxdWFyZTogWzNdLFxuICAgIHppZzogWzIsIDJdLFxuICAgIHphZzogWzIsIDJdLFxuICAgIGxlZnQ6IFsyLCAxLCAyLCAzXSxcbiAgICByaWdodDogWzIsIDMsIDIsIDFdLFxuICAgIHRlZTogWzIsIDIsIDIsIDJdLFxuICAgIHRldHJpczogWzMsIDRdXG4gIH07XG4gIGZ1bmN0aW9uIEd1aWRlKG9wdHMsIGdzKXtcbiAgICB2YXIgZ3JpZFNpemUsIGJsb2NrU2l6ZSwgd2lkdGgsIGdlbywgYmVhbU1hdCwgZmxhcmVNYXQ7XG4gICAgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplLCBibG9ja1NpemUgPSBvcHRzLmJsb2NrU2l6ZTtcbiAgICBHdWlkZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgd2lkdGggPSBncmlkU2l6ZSAqIGdzLmFyZW5hLndpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5ncyA9IGdzO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0aGlzU2hhcGU6IG51bGwsXG4gICAgICBsYXN0U2hhcGU6IG51bGxcbiAgICB9O1xuICAgIGdlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIHRoaXMuaGVpZ2h0LCBncmlkU2l6ZSAqIDAuOSk7XG4gICAgZ2VvLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKDAsIHRoaXMuaGVpZ2h0IC8gMiwgMCkpO1xuICAgIGJlYW1NYXQgPSBNYXRlcmlhbHMuZmxhcmVGYWNlcztcbiAgICBmbGFyZU1hdCA9IE1hdGVyaWFscy5mbGFyZUZhY2VzLmNsb25lKCk7XG4gICAgdGhpcy5iZWFtID0gbmV3IFRIUkVFLk1lc2goZ2VvLCBiZWFtTWF0KTtcbiAgICB0aGlzLmZsYXJlID0gbmV3IFRIUkVFLk1lc2goZ2VvLCBmbGFyZU1hdCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYmVhbSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuZmxhcmUpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSB3aWR0aCAvIC0yIC0gZ3JpZFNpemUgLyAyO1xuICAgIHRoaXMuZ3VpZGVMaWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmLCAxLCBncmlkU2l6ZSAqIDQpO1xuICAgIHRoaXMuZ3VpZGVMaWdodC5wb3NpdGlvbi55ID0gMC4xO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmd1aWRlTGlnaHQpO1xuICAgIHRoaXMuaW1wYWN0TGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweDAwZmYwMCwgMTAsIGdyaWRTaXplICogNik7XG4gICAgdGhpcy5pbXBhY3RMaWdodC5wb3NpdGlvbi56ID0gMC4xO1xuICAgIHRoaXMuaW1wYWN0TGlnaHQucG9zaXRpb24ueSA9IDAuMjtcbiAgfVxuICBwcm90b3R5cGUucG9zaXRpb25CZWFtID0gZnVuY3Rpb24oYmVhbSwgYmVhbVNoYXBlKXtcbiAgICB2YXIgdywgZywgeDtcbiAgICB3ID0gMSArIGJlYW1TaGFwZS5tYXggLSBiZWFtU2hhcGUubWluO1xuICAgIGcgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgeCA9IGcgKiAoYmVhbVNoYXBlLnBvcyArIHcgLyAyICsgYmVhbVNoYXBlLm1pbiArIDAuNSk7XG4gICAgYmVhbS5zY2FsZS5zZXQodywgMSwgMSk7XG4gICAgcmV0dXJuIGJlYW0ucG9zaXRpb24ueCA9IHg7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93QmVhbSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICB2YXIgYmVhbVNoYXBlLCBpJCwgcmVmJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGw7XG4gICAgYmVhbVNoYXBlID0ge1xuICAgICAgbWluOiA0LFxuICAgICAgbWF4OiAwLFxuICAgICAgcG9zOiBicmljay5wb3NbMF0sXG4gICAgICBjb2xvcjogJ21hZ2VudGEnLFxuICAgICAgaGVpZ2h0OiBicmljay5wb3NbMV0gKyBwcmV0dHlPZmZzZXRbYnJpY2sudHlwZV1bYnJpY2sucm90YXRpb25dXG4gICAgfTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYnJpY2suc2hhcGUpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBiZWFtU2hhcGUuY29sb3IgPSBQYWxldHRlLnNwZWNDb2xvcnNbY2VsbF07XG4gICAgICAgICAgaWYgKGJlYW1TaGFwZS5taW4gPiB4KSB7XG4gICAgICAgICAgICBiZWFtU2hhcGUubWluID0geDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJlYW1TaGFwZS5tYXggPCB4KSB7XG4gICAgICAgICAgICBiZWFtU2hhcGUubWF4ID0geDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgeCA9IHRoaXMucG9zaXRpb25CZWFtKHRoaXMuYmVhbSwgYmVhbVNoYXBlKTtcbiAgICB0aGlzLmd1aWRlTGlnaHQucG9zaXRpb24ueCA9IHg7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudGhpc1NoYXBlID0gYmVhbVNoYXBlO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0ZsYXJlID0gZnVuY3Rpb24ocCwgZHJvcHBlZCl7XG4gICAgdmFyIGJlYW1TaGFwZSwgZywgeDtcbiAgICBpZiAocCA9PT0gMCkge1xuICAgICAgbG9nKHRoaXMuc3RhdGUubGFzdFNoYXBlID0gYmVhbVNoYXBlID0gdGhpcy5zdGF0ZS50aGlzU2hhcGUpO1xuICAgICAgZyA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICAgIHRoaXMuc3RhdGUubGFzdFNoYXBlID0gYmVhbVNoYXBlID0gdGhpcy5zdGF0ZS50aGlzU2hhcGU7XG4gICAgICB0aGlzLmZsYXJlLm1hdGVyaWFsLm1hdGVyaWFscy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgICB2YXIgcmVmJDtcbiAgICAgICAgcmV0dXJuIChyZWYkID0gaXQuZW1pc3NpdmUpICE9IG51bGwgPyByZWYkLnNldEhleChiZWFtU2hhcGUuY29sb3IpIDogdm9pZCA4O1xuICAgICAgfSk7XG4gICAgICB4ID0gdGhpcy5wb3NpdGlvbkJlYW0odGhpcy5mbGFyZSwgYmVhbVNoYXBlKTtcbiAgICAgIHRoaXMuZmxhcmUuc2NhbGUueSA9IGcgKiAoMSArIGRyb3BwZWQpIC8gdGhpcy5oZWlnaHQ7XG4gICAgICB0aGlzLmZsYXJlLnBvc2l0aW9uLnkgPSB0aGlzLmhlaWdodCAtIGcgKiBiZWFtU2hhcGUuaGVpZ2h0IC0gZyAqIGRyb3BwZWQ7XG4gICAgICB0aGlzLmltcGFjdExpZ2h0LmhleCA9IGJlYW1TaGFwZS5jb2xvcjtcbiAgICAgIHRoaXMuaW1wYWN0TGlnaHQucG9zaXRpb24ueCA9IHg7XG4gICAgICB0aGlzLmltcGFjdExpZ2h0LnBvc2l0aW9uLnkgPSB0aGlzLmhlaWdodCAtIGcgKiBiZWFtU2hhcGUuaGVpZ2h0O1xuICAgIH1cbiAgICB0aGlzLmZsYXJlLm1hdGVyaWFsLm1hdGVyaWFscy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm9wYWNpdHkgPSAxIC0gcDtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5pbXBhY3RMaWdodC5pbnRlbnNpdHkgPSAxMCAqICgxIC0gcCk7XG4gIH07XG4gIHJldHVybiBHdWlkZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIEFyZW5hLCBUaXRsZSwgVGFibGUsIEJyaWNrUHJldmlldywgTGlnaHRpbmcsIE5peGllRGlzcGxheSwgU3RhcnRNZW51LCBGYWlsU2NyZWVuLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vYXJlbmEnKSwgQXJlbmEgPSByZWYkLkFyZW5hLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi90aXRsZScpLCBUaXRsZSA9IHJlZiQuVGl0bGUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3RhYmxlJyksIFRhYmxlID0gcmVmJC5UYWJsZSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vYnJpY2stcHJldmlldycpLCBCcmlja1ByZXZpZXcgPSByZWYkLkJyaWNrUHJldmlldywgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vbGlnaHRpbmcnKSwgTGlnaHRpbmcgPSByZWYkLkxpZ2h0aW5nLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9uaXhpZScpLCBOaXhpZURpc3BsYXkgPSByZWYkLk5peGllRGlzcGxheSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vc3RhcnQtbWVudScpLCBTdGFydE1lbnUgPSByZWYkLlN0YXJ0TWVudSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vZmFpbC1zY3JlZW4nKSwgRmFpbFNjcmVlbiA9IHJlZiQuRmFpbFNjcmVlbiwgcmVmJCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIHNpbiwgbGVycCwgbG9nLCBmbG9vciwgbWFwLCBzcGxpdCwgcGksIHRhdSwgQmFzZSwgTWF0ZXJpYWxzLCBMRUQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgc2luID0gcmVmJC5zaW4sIGxlcnAgPSByZWYkLmxlcnAsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwLCBzcGxpdCA9IHJlZiQuc3BsaXQsIHBpID0gcmVmJC5waSwgdGF1ID0gcmVmJC50YXU7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuTEVEID0gTEVEID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgaGFsZlNwaGVyZSwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMRUQsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xFRCcsIExFRCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMRUQ7XG4gIGhhbGZTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC4wMSwgOCwgOCk7XG4gIGZ1bmN0aW9uIExFRChvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBMRUQuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubWF0cyA9IHtcbiAgICAgIG9mZjogTWF0ZXJpYWxzLmdsYXNzLFxuICAgICAgb246IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICAgIGNvbG9yOiAweGZiYjAzYixcbiAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgIGVtaXNzaXZlOiAweGZiYjBiYixcbiAgICAgICAgc3BlY3VsYXI6ICd3aGl0ZScsXG4gICAgICAgIHNoaW5pbmVzczogMTAwXG4gICAgICB9KVxuICAgIH07XG4gICAgdGhpcy5idWxiID0gbmV3IFRIUkVFLk1lc2goaGFsZlNwaGVyZSwgdGhpcy5tYXRzLm9mZik7XG4gICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmJiMDNiLCAwLCAwLjEpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IDAuMDI7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnVsYik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGlnaHQpO1xuICB9XG4gIHByb3RvdHlwZS5zZXRDb2xvciA9IGZ1bmN0aW9uKGNvbG9yKXtcbiAgICB0aGlzLmJ1bGIubWF0ZXJpYWwuY29sb3IgPSBjb2xvcjtcbiAgICByZXR1cm4gdGhpcy5saWdodC5jb2xvciA9IGNvbG9yO1xuICB9O1xuICBwcm90b3R5cGUub24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuYnVsYi5tYXRlcmlhbCA9IHRoaXMubWF0cy5vbjtcbiAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSAwLjM7XG4gIH07XG4gIHByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuYnVsYi5tYXRlcmlhbCA9IHRoaXMubWF0cy5vZmY7XG4gICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMDtcbiAgfTtcbiAgcmV0dXJuIExFRDtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgQmFzZSwgTGlnaHRpbmcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkxpZ2h0aW5nID0gTGlnaHRpbmcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBtYWluTGlnaHREaXN0YW5jZSwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChMaWdodGluZywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTGlnaHRpbmcnLCBMaWdodGluZyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBMaWdodGluZztcbiAgbWFpbkxpZ2h0RGlzdGFuY2UgPSAyO1xuICBmdW5jdGlvbiBMaWdodGluZyhvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBMaWdodGluZy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmLCAxLCBtYWluTGlnaHREaXN0YW5jZSk7XG4gICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQoMCwgMSwgMCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGlnaHQpO1xuICAgIHRoaXMuc3BvdGxpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodCgweGZmZmZmZiwgMSwgNTAsIDEpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnBvc2l0aW9uLnNldCgwLCAzLCAtMSk7XG4gICAgdGhpcy5zcG90bGlnaHQudGFyZ2V0LnBvc2l0aW9uLnNldCgwLCAwLCAtMSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuc3BvdGxpZ2h0KTtcbiAgICB0aGlzLmFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4NjY2NjY2KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5hbWJpZW50KTtcbiAgICB0aGlzLnNwb3RsaWdodC5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dEYXJrbmVzcyA9IDAuNTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dCaWFzID0gMC4wMDAxO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd01hcFdpZHRoID0gMTAyNDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dNYXBIZWlnaHQgPSAxMDI0O1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0NhbWVyYVZpc2libGUgPSB0cnVlO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0NhbWVyYU5lYXIgPSAxMDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFGYXIgPSAyNTAwO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0NhbWVyYUZvdiA9IDUwO1xuICB9XG4gIHByb3RvdHlwZS5zaG93SGVscGVycyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5Qb2ludExpZ2h0SGVscGVyKHRoaXMubGlnaHQsIG1haW5MaWdodERpc3RhbmNlKSk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuU3BvdExpZ2h0SGVscGVyKHRoaXMuc3BvdGxpZ2h0KSk7XG4gIH07XG4gIHByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IDEuMCAqIHNpbih0aW1lIC8gNTAwKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IDAuNSAqIGNvcyh0aW1lIC8gNTAwKTtcbiAgfTtcbiAgcmV0dXJuIExpZ2h0aW5nO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIHNpbiwgbGVycCwgbG9nLCBmbG9vciwgbWFwLCBzcGxpdCwgcGksIHRhdSwgTWF0ZXJpYWxzLCBCYXNlLCBDYXBzdWxlR2VvbWV0cnksIExFRCwgTml4aWVUdWJlLCBOaXhpZURpc3BsYXksIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXMsIHNsaWNlJCA9IFtdLnNsaWNlO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIHNpbiA9IHJlZiQuc2luLCBsZXJwID0gcmVmJC5sZXJwLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcCwgc3BsaXQgPSByZWYkLnNwbGl0LCBwaSA9IHJlZiQucGksIHRhdSA9IHJlZiQudGF1O1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5DYXBzdWxlR2VvbWV0cnkgPSByZXF1aXJlKCcuLi9nZW9tZXRyeS9jYXBzdWxlJykuQ2Fwc3VsZUdlb21ldHJ5O1xuTEVEID0gcmVxdWlyZSgnLi9sZWQnKS5MRUQ7XG5OaXhpZVR1YmUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5peGllVHViZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTml4aWVUdWJlJywgTml4aWVUdWJlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5peGllVHViZTtcbiAgZnVuY3Rpb24gTml4aWVUdWJlKG9wdHMsIGdzKXtcbiAgICB2YXIgdHViZVJhZGl1cywgdHViZUhlaWdodCwgYmFzZVJhZGl1cywgYmFzZUhlaWdodCwgbGFtcE9mZnNldCwgbWVzaFdpZHRoLCBtZXNoSGVpZ2h0LCBiZ0dlbywgYmFzZUdlbywgcmVzJCwgaSQsIHJlZiQsIGxlbiQsIGl4LCBpLCBxdWFkO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTml4aWVUdWJlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0dWJlUmFkaXVzID0gdGhpcy5vcHRzLnNjb3JlVHViZVJhZGl1cztcbiAgICB0dWJlSGVpZ2h0ID0gdGhpcy5vcHRzLnNjb3JlVHViZUhlaWdodDtcbiAgICBiYXNlUmFkaXVzID0gdGhpcy5vcHRzLnNjb3JlQmFzZVJhZGl1cztcbiAgICBiYXNlSGVpZ2h0ID0gdGhpcy5vcHRzLnNjb3JlVHViZUhlaWdodCAvIDEwO1xuICAgIGxhbXBPZmZzZXQgPSB0aGlzLm9wdHMuc2NvcmVJbmRpY2F0b3JPZmZzZXQ7XG4gICAgbWVzaFdpZHRoID0gdHViZVJhZGl1cyAqIDEuMztcbiAgICBtZXNoSGVpZ2h0ID0gdHViZVJhZGl1cyAqIDIuNTtcbiAgICB0aGlzLm1lc2hXaWR0aCA9IG1lc2hXaWR0aDtcbiAgICB0aGlzLm1lc2hIZWlnaHQgPSBtZXNoSGVpZ2h0O1xuICAgIGJnR2VvID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkobWVzaFdpZHRoLCBtZXNoSGVpZ2h0KTtcbiAgICBiYXNlR2VvID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoYmFzZVJhZGl1cywgYmFzZVJhZGl1cywgYmFzZUhlaWdodCwgNiwgMCk7XG4gICAgYmFzZUdlby5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VSb3RhdGlvblkocGkgLyA2KSk7XG4gICAgdGhpcy5pbnRlbnNpdHkgPSAwO1xuICAgIHRoaXMuZ2xhc3MgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5KHR1YmVSYWRpdXMsIDE2LCB0dWJlSGVpZ2h0LCAwKSwgTWF0ZXJpYWxzLmdsYXNzKTtcbiAgICB0aGlzLmJhc2UgPSBuZXcgVEhSRUUuTWVzaChiYXNlR2VvLCBNYXRlcmlhbHMuY29wcGVyKTtcbiAgICB0aGlzLmJnID0gbmV3IFRIUkVFLk1lc2goYmdHZW8sIE1hdGVyaWFscy5uaXhpZUJnKTtcbiAgICB0aGlzLmxlZCA9IG5ldyBMRUQodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5sZWQucG9zaXRpb24ueiA9IGxhbXBPZmZzZXQ7XG4gICAgdGhpcy5nbGFzcy5wb3NpdGlvbi55ID0gdHViZUhlaWdodDtcbiAgICB0aGlzLmJnLnBvc2l0aW9uLnkgPSBtZXNoSGVpZ2h0IC8gMiArIGJhc2VIZWlnaHQgLyAyO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIGkgPSByZWYkW2kkXTtcbiAgICAgIHF1YWQgPSB0aGlzLmNyZWF0ZURpZ2l0UXVhZChpLCBpeCk7XG4gICAgICBxdWFkLnBvc2l0aW9uLnkgPSBtZXNoSGVpZ2h0IC8gMiArIGJhc2VIZWlnaHQgLyAyO1xuICAgICAgcXVhZC52aXNpYmxlID0gZmFsc2U7XG4gICAgICBxdWFkLmRpZ2l0ID0gaTtcbiAgICAgIHF1YWQucmVuZGVyT3JkZXIgPSAwO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHF1YWQpO1xuICAgICAgcmVzJC5wdXNoKHF1YWQpO1xuICAgIH1cbiAgICB0aGlzLmRpZ2l0cyA9IHJlcyQ7XG4gICAgdGhpcy5saWdodCA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KCdvcmFuZ2UnLCAwLjMsIDAuMyk7XG4gICAgdGhpcy5saWdodC5wb3NpdGlvbi55ID0gdGhpcy5vcHRzLnNjb3JlVHViZUhlaWdodCAvIDI7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuZ2xhc3MpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJhc2UpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJnKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5saWdodCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGVkLnJvb3QpO1xuICB9XG4gIHByb3RvdHlwZS5wdWxzZSA9IGZ1bmN0aW9uKHQpe1xuICAgIGlmICh0aGlzLmludGVuc2l0eSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gdGhpcy5pbnRlbnNpdHkgKyAwLjEgKiBzaW4odCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc2hvd0RpZ2l0ID0gZnVuY3Rpb24oZGlnaXQpe1xuICAgIHRoaXMuaW50ZW5zaXR5ID0gZGlnaXQgIT0gbnVsbCA/IDAuNSA6IDA7XG4gICAgdGhpcy5kaWdpdHMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC52aXNpYmxlID0gaXQuZGlnaXQgPT09IGRpZ2l0O1xuICAgIH0pO1xuICAgIGlmIChkaWdpdCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5sZWQub24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubGVkLm9mZigpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLmNyZWF0ZURpZ2l0UXVhZCA9IGZ1bmN0aW9uKGRpZ2l0LCBpeCl7XG4gICAgdmFyIGdlb20sIHF1YWQ7XG4gICAgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KHRoaXMubWVzaFdpZHRoLCB0aGlzLm1lc2hIZWlnaHQpO1xuICAgIHJldHVybiBxdWFkID0gbmV3IFRIUkVFLk1lc2goZ2VvbSwgTWF0ZXJpYWxzLm5peGllRGlnaXRzW2RpZ2l0XSk7XG4gIH07XG4gIHJldHVybiBOaXhpZVR1YmU7XG59KEJhc2UpKTtcbm91dCQuTml4aWVEaXNwbGF5ID0gTml4aWVEaXNwbGF5ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChOaXhpZURpc3BsYXksIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ05peGllRGlzcGxheScsIE5peGllRGlzcGxheSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBOaXhpZURpc3BsYXk7XG4gIGZ1bmN0aW9uIE5peGllRGlzcGxheShvcHRzLCBncyl7XG4gICAgdmFyIG9mZnNldCwgbWFyZ2luLCBiYXNlUmFkaXVzLCByZXMkLCBpJCwgdG8kLCBpLCB0dWJlO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTml4aWVEaXNwbGF5LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBvZmZzZXQgPSB0aGlzLm9wdHMuc2NvcmVEaXN0YW5jZUZyb21DZW50cmUgKyB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIG1hcmdpbiA9IHRoaXMub3B0cy5zY29yZUludGVyVHViZU1hcmdpbjtcbiAgICBiYXNlUmFkaXVzID0gdGhpcy5vcHRzLnNjb3JlQmFzZVJhZGl1cztcbiAgICB0aGlzLmNvdW50ID0gNTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbGFzdFNlZW5OdW1iZXI6IDBcbiAgICB9O1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5jb3VudDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHR1YmUgPSBuZXcgTml4aWVUdWJlKHRoaXMub3B0cywgZ3MpO1xuICAgICAgdHViZS5wb3NpdGlvbi54ID0gbWFyZ2luICogaSArIG9mZnNldCArIGkgKiB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzICogMjtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0dWJlLnJvb3QpO1xuICAgICAgcmVzJC5wdXNoKHR1YmUpO1xuICAgIH1cbiAgICB0aGlzLnR1YmVzID0gcmVzJDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gLXRoaXMub3B0cy5zY29yZURpc3RhbmNlRnJvbUVkZ2U7XG4gIH1cbiAgcHJvdG90eXBlLnB1bHNlID0gZnVuY3Rpb24odCl7XG4gICAgcmV0dXJuIHRoaXMudHViZXMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC5wdWxzZSh0KTtcbiAgICB9KTtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1blRvTnVtYmVyID0gZnVuY3Rpb24ocCwgbnVtKXtcbiAgICB2YXIgbmV4dE51bWJlcjtcbiAgICBuZXh0TnVtYmVyID0gZmxvb3IobGVycCh0aGlzLnN0YXRlLmxhc3RTZWVuTnVtYmVyLCBudW0sIHApKTtcbiAgICByZXR1cm4gdGhpcy5zaG93TnVtYmVyKG5leHROdW1iZXIpO1xuICB9O1xuICBwcm90b3R5cGUuc2V0TnVtYmVyID0gZnVuY3Rpb24obnVtKXtcbiAgICB0aGlzLnN0YXRlLmxhc3RTZWVuTnVtYmVyID0gbnVtO1xuICAgIHJldHVybiB0aGlzLnNob3dOdW1iZXIobnVtKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dOdW1iZXIgPSBmdW5jdGlvbihudW0pe1xuICAgIHZhciBkaWdpdHMsIGkkLCBpLCB0dWJlLCBkaWdpdCwgcmVzdWx0cyQgPSBbXTtcbiAgICBudW0gPT0gbnVsbCAmJiAobnVtID0gMCk7XG4gICAgZGlnaXRzID0gbWFwKHBhcnRpYWxpemUkLmFwcGx5KHRoaXMsIFtwYXJzZUludCwgW3ZvaWQgOCwgMTBdLCBbMF1dKSkoXG4gICAgc3BsaXQoJycpKFxuICAgIGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC50b1N0cmluZygpO1xuICAgIH0oXG4gICAgbnVtKSkpO1xuICAgIGZvciAoaSQgPSB0aGlzLmNvdW50IC0gMTsgaSQgPj0gMDsgLS1pJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgdHViZSA9IHRoaXMudHViZXNbaV07XG4gICAgICBkaWdpdCA9IGRpZ2l0cy5wb3AoKTtcbiAgICAgIHJlc3VsdHMkLnB1c2godHViZS5zaG93RGlnaXQoZGlnaXQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gTml4aWVEaXNwbGF5O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIHBhcnRpYWxpemUkKGYsIGFyZ3MsIHdoZXJlKXtcbiAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICB2YXIgcGFyYW1zID0gc2xpY2UkLmNhbGwoYXJndW1lbnRzKSwgaSxcbiAgICAgICAgbGVuID0gcGFyYW1zLmxlbmd0aCwgd2xlbiA9IHdoZXJlLmxlbmd0aCxcbiAgICAgICAgdGEgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdLCB0dyA9IHdoZXJlID8gd2hlcmUuY29uY2F0KCkgOiBbXTtcbiAgICBmb3IoaSA9IDA7IGkgPCBsZW47ICsraSkgeyB0YVt0d1swXV0gPSBwYXJhbXNbaV07IHR3LnNoaWZ0KCk7IH1cbiAgICByZXR1cm4gbGVuIDwgd2xlbiAmJiBsZW4gP1xuICAgICAgcGFydGlhbGl6ZSQuYXBwbHkoY29udGV4dCwgW2YsIHRhLCB0d10pIDogZi5hcHBseShjb250ZXh0LCB0YSk7XG4gIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgcmFuZCwgZmxvb3IsIEJhc2UsIG1lc2hNYXRlcmlhbHMsIFBhcnRpY2xlQnVyc3QsIFBhcnRpY2xlRWZmZWN0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5tZXNoTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vcGFsZXR0ZScpLm1lc2hNYXRlcmlhbHM7XG5vdXQkLlBhcnRpY2xlQnVyc3QgPSBQYXJ0aWNsZUJ1cnN0ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgc3BlZWQsIGxpZmVzcGFuLCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFBhcnRpY2xlQnVyc3QsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1BhcnRpY2xlQnVyc3QnLCBQYXJ0aWNsZUJ1cnN0KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBhcnRpY2xlQnVyc3Q7XG4gIHNwZWVkID0gMjtcbiAgbGlmZXNwYW4gPSAxNTAwO1xuICBmdW5jdGlvbiBQYXJ0aWNsZUJ1cnN0KG9wdHMsIGdzKXtcbiAgICB2YXIgYXJlbmEsIHdpZHRoLCBoZWlnaHQsIHBhcnRpY2xlcywgZ2VvbWV0cnksIGNvbG9yLCBtYXRlcmlhbDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodDtcbiAgICBQYXJ0aWNsZUJ1cnN0LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNpemUgPSB0aGlzLm9wdHMuemFwUGFydGljbGVTaXplO1xuICAgIHBhcnRpY2xlcyA9IDE1MDA7XG4gICAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgICBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuICAgIHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLnZlbG9jaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLmxpZmVzcGFucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLmFscGhhcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLm1heGxpZmVzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMucG9zQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5wb3NpdGlvbnMsIDMpO1xuICAgIHRoaXMuY29sQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5jb2xvcnMsIDMpO1xuICAgIHRoaXMuYWxwaGFBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLmFscGhhcywgMSk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCB0aGlzLnBvc0F0dHIpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY29sb3InLCB0aGlzLmNvbEF0dHIpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnb3BhY2l0eScsIHRoaXMuYWxwaGFBdHRyKTtcbiAgICBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgICBtYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludENsb3VkTWF0ZXJpYWwoe1xuICAgICAgc2l6ZTogdGhpcy5zaXplLFxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgIHZlcnRleENvbG9yczogVEhSRUUuVmVydGV4Q29sb3JzXG4gICAgfSk7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuUG9pbnRDbG91ZChnZW9tZXRyeSwgbWF0ZXJpYWwpKTtcbiAgfVxuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBncmlkLCBpJCwgdG8kLCBpLCB4LCB6LCByZXN1bHRzJCA9IFtdO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHggPSA0LjUgLSBNYXRoLnJhbmRvbSgpICogOTtcbiAgICAgIHogPSAwLjUgLSBNYXRoLnJhbmRvbSgpO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDBdID0geCAqIGdyaWQ7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAwO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDJdID0geiAqIGdyaWQ7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDBdID0geCAvIDEwO1xuICAgICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAxXSA9IHJhbmQoLTIgKiBncmlkLCAxMCAqIGdyaWQpO1xuICAgICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAyXSA9IHo7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMF0gPSAxO1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDFdID0gMTtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAyXSA9IDE7XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMubGlmZXNwYW5zW2kgLyAzXSA9IDApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5hY2NlbGVyYXRlUGFydGljbGUgPSBmdW5jdGlvbihpLCB0LCBwLCBiYngsIGJieil7XG4gICAgdmFyIGFjYywgcHgsIHB5LCBweiwgdngsIHZ5LCB2eiwgcHgxLCBweTEsIHB6MSwgdngxLCB2eTEsIHZ6MSwgbDtcbiAgICBpZiAodGhpcy5saWZlc3BhbnNbaSAvIDNdIDw9IDApIHtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IC0xMDAwO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0ID0gdCAvICgxMDAwIC8gc3BlZWQpO1xuICAgIGFjYyA9IC0wLjk4O1xuICAgIHB4ID0gdGhpcy5wb3NpdGlvbnNbaSArIDBdO1xuICAgIHB5ID0gdGhpcy5wb3NpdGlvbnNbaSArIDFdO1xuICAgIHB6ID0gdGhpcy5wb3NpdGlvbnNbaSArIDJdO1xuICAgIHZ4ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAwXTtcbiAgICB2eSA9IHRoaXMudmVsb2NpdGllc1tpICsgMV07XG4gICAgdnogPSB0aGlzLnZlbG9jaXRpZXNbaSArIDJdO1xuICAgIHB4MSA9IHB4ICsgMC41ICogMCAqIHQgKiB0ICsgdnggKiB0O1xuICAgIHB5MSA9IHB5ICsgMC41ICogYWNjICogdCAqIHQgKyB2eSAqIHQ7XG4gICAgcHoxID0gcHogKyAwLjUgKiAwICogdCAqIHQgKyB2eiAqIHQ7XG4gICAgdngxID0gMCAqIHQgKyB2eDtcbiAgICB2eTEgPSBhY2MgKiB0ICsgdnk7XG4gICAgdnoxID0gMCAqIHQgKyB2ejtcbiAgICBpZiAocHkxIDwgdGhpcy5zaXplIC8gMiAmJiAoLWJieCA8IHB4MSAmJiBweDEgPCBiYngpICYmICgtYmJ6ICsgMS45ICogdGhpcy5vcHRzLmdyaWRTaXplIDwgcHoxICYmIHB6MSA8IGJieiArIDEuOSAqIHRoaXMub3B0cy5ncmlkU2l6ZSkpIHtcbiAgICAgIHB5MSA9IHRoaXMuc2l6ZSAvIDI7XG4gICAgICB2eDEgKj0gMC43O1xuICAgICAgdnkxICo9IC0wLjY7XG4gICAgICB2ejEgKj0gMC43O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMF0gPSBweDE7XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gcHkxO1xuICAgIHRoaXMucG9zaXRpb25zW2kgKyAyXSA9IHB6MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDBdID0gdngxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMV0gPSB2eTE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAyXSA9IHZ6MTtcbiAgICBsID0gdGhpcy5saWZlc3BhbnNbaSAvIDNdIC8gdGhpcy5tYXhsaWZlc1tpIC8gM107XG4gICAgbCA9IGwgKiBsICogbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMF0gPSBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAxXSA9IGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDJdID0gbDtcbiAgICByZXR1cm4gdGhpcy5hbHBoYXNbaSAvIDNdID0gbDtcbiAgfTtcbiAgcHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKHkpe1xuICAgIHZhciBncmlkLCBpJCwgdG8kLCBpLCByZXN1bHRzJCA9IFtdO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0aGlzLmxpZmVzcGFuc1tpIC8gM10gPSBsaWZlc3BhbiAvIDIgKyBNYXRoLnJhbmRvbSgpICogbGlmZXNwYW4gLyAyO1xuICAgICAgdGhpcy5tYXhsaWZlc1tpIC8gM10gPSB0aGlzLmxpZmVzcGFuc1tpIC8gM107XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucG9zaXRpb25zW2kgKyAxXSA9ICh5ICsgTWF0aC5yYW5kb20oKSkgKiBncmlkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocCwgzpR0KXtcbiAgICB2YXIgYm91bmNlQm91bmRzWCwgYm91bmNlQm91bmRzWiwgaSQsIHRvJCwgaTtcbiAgICBib3VuY2VCb3VuZHNYID0gdGhpcy5vcHRzLmRlc2tTaXplWzBdIC8gMjtcbiAgICBib3VuY2VCb3VuZHNaID0gdGhpcy5vcHRzLmRlc2tTaXplWzFdIC8gMjtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgdGhpcy5hY2NlbGVyYXRlUGFydGljbGUoaSwgzpR0LCAxLCBib3VuY2VCb3VuZHNYLCBib3VuY2VCb3VuZHNaKTtcbiAgICAgIHRoaXMubGlmZXNwYW5zW2kgLyAzXSAtPSDOlHQ7XG4gICAgfVxuICAgIHRoaXMucG9zQXR0ci5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuY29sQXR0ci5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH07XG4gIHJldHVybiBQYXJ0aWNsZUJ1cnN0O1xufShCYXNlKSk7XG5vdXQkLlBhcnRpY2xlRWZmZWN0ID0gUGFydGljbGVFZmZlY3QgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFBhcnRpY2xlRWZmZWN0LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdQYXJ0aWNsZUVmZmVjdCcsIFBhcnRpY2xlRWZmZWN0KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBhcnRpY2xlRWZmZWN0O1xuICBmdW5jdGlvbiBQYXJ0aWNsZUVmZmVjdChvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBpJCwgcmVmJCwgbGVuJCwgcm93O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIFBhcnRpY2xlRWZmZWN0LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnogPSB0aGlzLm9wdHMuejtcbiAgICB0aGlzLmggPSBoZWlnaHQ7XG4gICAgdGhpcy5yb3dzID0gW1xuICAgICAgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSlcbiAgICBdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIHJvdy5hZGRUbyh0aGlzLnJvb3QpO1xuICAgIH1cbiAgfVxuICBwcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKHJvd3Mpe1xuICAgIHZhciBpJCwgbGVuJCwgaSwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3dzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICByb3dJeCA9IHJvd3NbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJvd3NbaV0uc2V0SGVpZ2h0KCh0aGlzLmggLSAxKSAtIHJvd0l4KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHN5c3RlbSwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgc3lzdGVtID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHN5c3RlbS5yZXNldCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocCwgZnNyciwgzpR0KXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBzeXN0ZW0sIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBzeXN0ZW0gPSByZWYkW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2goc3lzdGVtLnVwZGF0ZShwLCDOlHQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gUGFydGljbGVFZmZlY3Q7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIGNvcywgQmFzZSwgVGl0bGUsIGNhbnZhc1RleHR1cmUsIFN0YXJ0TWVudSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5UaXRsZSA9IHJlcXVpcmUoJy4vdGl0bGUnKS5UaXRsZTtcbmNhbnZhc1RleHR1cmUgPSBmdW5jdGlvbigpe1xuICB2YXIgdGV4dHVyZVNpemUsIGZpZGVsaXR5RmFjdG9yLCB0ZXh0Q252LCBpbWdDbnYsIHRleHRDdHgsIGltZ0N0eDtcbiAgdGV4dHVyZVNpemUgPSAxMDI0O1xuICBmaWRlbGl0eUZhY3RvciA9IDEwMDtcbiAgdGV4dENudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBpbWdDbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGV4dEN0eCA9IHRleHRDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ3R4ID0gaW1nQ252LmdldENvbnRleHQoJzJkJyk7XG4gIGltZ0Nudi53aWR0aCA9IGltZ0Nudi5oZWlnaHQgPSB0ZXh0dXJlU2l6ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB0ZXh0U2l6ZSwgcmVmJDtcbiAgICB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0LCB0ZXh0ID0gYXJnJC50ZXh0LCB0ZXh0U2l6ZSA9IChyZWYkID0gYXJnJC50ZXh0U2l6ZSkgIT0gbnVsbCA/IHJlZiQgOiAxMDtcbiAgICB0ZXh0Q252LndpZHRoID0gd2lkdGggKiBmaWRlbGl0eUZhY3RvcjtcbiAgICB0ZXh0Q252LmhlaWdodCA9IGhlaWdodCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgdGV4dEN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICB0ZXh0Q3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgdGV4dEN0eC5mb250ID0gdGV4dFNpemUgKiBmaWRlbGl0eUZhY3RvciArIFwicHggbW9ub3NwYWNlXCI7XG4gICAgdGV4dEN0eC5maWxsVGV4dCh0ZXh0LCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yIC8gMiwgaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3IgLyAyLCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yKTtcbiAgICBpbWdDdHguY2xlYXJSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmZpbGxSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmRyYXdJbWFnZSh0ZXh0Q252LCAwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIHJldHVybiBpbWdDbnYudG9EYXRhVVJMKCk7XG4gIH07XG59KCk7XG5vdXQkLlN0YXJ0TWVudSA9IFN0YXJ0TWVudSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoU3RhcnRNZW51LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdTdGFydE1lbnUnLCBTdGFydE1lbnUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gU3RhcnRNZW51O1xuICBmdW5jdGlvbiBTdGFydE1lbnUob3B0cywgZ3Mpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIG9wdGlvbiwgcXVhZDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIFN0YXJ0TWVudS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGdzLnN0YXJ0TWVudS5tZW51RGF0YSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBvcHRpb24gPSByZWYkW2kkXTtcbiAgICAgIHF1YWQgPSB0aGlzLmNyZWF0ZU9wdGlvblF1YWQob3B0aW9uLCBpeCk7XG4gICAgICBxdWFkLnBvc2l0aW9uLnkgPSAwLjUgLSBpeCAqIDAuMjtcbiAgICAgIHRoaXMub3B0aW9ucy5wdXNoKHF1YWQpO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHF1YWQpO1xuICAgIH1cbiAgICB0aGlzLnRpdGxlID0gbmV3IFRpdGxlKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMudGl0bGUuYWRkVG8odGhpcy5yZWdpc3RyYXRpb24pO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSAtMSAqICh0aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSArIHRoaXMub3B0cy5hcmVuYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYmxvY2tTaXplIC8gMik7XG4gIH1cbiAgcHJvdG90eXBlLmNyZWF0ZU9wdGlvblF1YWQgPSBmdW5jdGlvbihvcHRpb24sIGl4KXtcbiAgICB2YXIgaW1hZ2UsIHRleCwgZ2VvbSwgbWF0LCBxdWFkO1xuICAgIGltYWdlID0gY2FudmFzVGV4dHVyZSh7XG4gICAgICB0ZXh0OiBvcHRpb24udGV4dCxcbiAgICAgIHdpZHRoOiA2MCxcbiAgICAgIGhlaWdodDogMTBcbiAgICB9KTtcbiAgICB0ZXggPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGltYWdlKTtcbiAgICBnZW9tID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMSwgMC4yKTtcbiAgICBtYXQgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXgsXG4gICAgICBhbHBoYU1hcDogdGV4LFxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gcXVhZCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIG1hdCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHN0YXJ0TWVudTtcbiAgICBzdGFydE1lbnUgPSBncy5zdGFydE1lbnU7XG4gICAgdGhpcy50aXRsZS5yZXZlYWwoc3RhcnRNZW51LnRpdGxlUmV2ZWFsQW5pbWF0aW9uLnByb2dyZXNzKTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVTZWxlY3Rpb24oZ3Muc3RhcnRNZW51LCBncy5lbGFwc2VkVGltZSk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVTZWxlY3Rpb24gPSBmdW5jdGlvbihzdGF0ZSwgdGltZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgcXVhZCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5vcHRpb25zKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHF1YWQgPSByZWYkW2kkXTtcbiAgICAgIGlmIChpeCA9PT0gc3RhdGUuY3VycmVudEluZGV4KSB7XG4gICAgICAgIHF1YWQuc2NhbGUueCA9IDEgKyAwLjA1ICogc2luKHRpbWUgLyAzMDApO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHF1YWQuc2NhbGUueSA9IDEgKyAwLjA1ICogLXNpbih0aW1lIC8gMzAwKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFN0YXJ0TWVudTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIE1hdGVyaWFscywgVGFibGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuVGFibGUgPSBUYWJsZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoVGFibGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1RhYmxlJywgVGFibGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGFibGU7XG4gIGZ1bmN0aW9uIFRhYmxlKG9wdHMsIGdzKXtcbiAgICB2YXIgcmVmJCwgd2lkdGgsIGRlcHRoLCB0aGlja25lc3M7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBUYWJsZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmVmJCA9IHRoaXMub3B0cy5kZXNrU2l6ZSwgd2lkdGggPSByZWYkWzBdLCBkZXB0aCA9IHJlZiRbMV0sIHRoaWNrbmVzcyA9IHJlZiRbMl07XG4gICAgdGhpcy50YWJsZSA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSh3aWR0aCwgdGhpY2tuZXNzLCBkZXB0aCksIE1hdGVyaWFscy50YWJsZUZhY2VzKTtcbiAgICB0aGlzLnRhYmxlLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnRhYmxlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gdGhpY2tuZXNzIC8gLTI7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IGRlcHRoIC8gLTI7XG4gIH1cbiAgcmV0dXJuIFRhYmxlO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBtaW4sIG1heCwgRWFzZSwgQmFzZSwgTWF0ZXJpYWxzLCBibG9ja1RleHQsIFRpdGxlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgbWluID0gcmVmJC5taW4sIG1heCA9IHJlZiQubWF4O1xuRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbmJsb2NrVGV4dCA9IHtcbiAgdGV0cmlzOiBbWzEsIDEsIDEsIDIsIDIsIDIsIDMsIDMsIDMsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgMCwgMF0sIFswLCAxLCAwLCAyLCAyLCAwLCAwLCAzLCAwLCA0LCA0LCAwLCA1LCA2LCA2LCA2XSwgWzAsIDEsIDAsIDIsIDAsIDAsIDAsIDMsIDAsIDQsIDAsIDQsIDUsIDAsIDAsIDZdLCBbMCwgMSwgMCwgMiwgMiwgMiwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgNiwgNl1dLFxuICB2cnQ6IFtbMSwgMCwgMSwgNCwgNCwgNiwgNiwgNl0sIFsxLCAwLCAxLCA0LCAwLCA0LCA2LCAwXSwgWzEsIDAsIDEsIDQsIDQsIDAsIDYsIDBdLCBbMSwgMCwgMSwgNCwgMCwgNCwgNiwgMF0sIFswLCAxLCAwLCA0LCAwLCA0LCA2LCAwXV0sXG4gIGdob3N0OiBbWzEsIDEsIDEsIDIsIDAsIDIsIDMsIDMsIDMsIDQsIDQsIDQsIDUsIDUsIDVdLCBbMSwgMCwgMCwgMiwgMCwgMiwgMywgMCwgMywgNCwgMCwgMCwgMCwgNSwgMF0sIFsxLCAwLCAwLCAyLCAyLCAyLCAzLCAwLCAzLCA0LCA0LCA0LCAwLCA1LCAwXSwgWzEsIDAsIDEsIDIsIDAsIDIsIDMsIDAsIDMsIDAsIDAsIDQsIDAsIDUsIDBdLCBbMSwgMSwgMSwgMiwgMCwgMiwgMywgMywgMywgNCwgNCwgNCwgMCwgNSwgMF1dXG59O1xub3V0JC5UaXRsZSA9IFRpdGxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUaXRsZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVGl0bGUnLCBUaXRsZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaXRsZTtcbiAgZnVuY3Rpb24gVGl0bGUob3B0cywgZ3Mpe1xuICAgIHZhciBibG9ja1NpemUsIGdyaWRTaXplLCB0ZXh0LCBtYXJnaW4sIGhlaWdodCwgYmxvY2tHZW8sIGkkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbCwgYm94O1xuICAgIGJsb2NrU2l6ZSA9IG9wdHMuYmxvY2tTaXplLCBncmlkU2l6ZSA9IG9wdHMuZ3JpZFNpemU7XG4gICAgVGl0bGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRleHQgPSBibG9ja1RleHQudnJ0O1xuICAgIG1hcmdpbiA9IChncmlkU2l6ZSAtIGJsb2NrU2l6ZSkgLyAyO1xuICAgIGhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLndvcmQgPSBuZXcgVEhSRUUuT2JqZWN0M0QpO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi54ID0gKHRleHRbMF0ubGVuZ3RoIC0gMSkgKiBncmlkU2l6ZSAvIC0yO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi55ID0gaGVpZ2h0IC8gLTIgLSAodGV4dC5sZW5ndGggLSAxKSAqIGdyaWRTaXplIC8gLTI7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnogPSBncmlkU2l6ZSAvIDI7XG4gICAgYmxvY2tHZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplLCBibG9ja1NpemUsIGJsb2NrU2l6ZSk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0ZXh0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSB0ZXh0W2kkXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBib3ggPSBuZXcgVEhSRUUuTWVzaChibG9ja0dlbywgTWF0ZXJpYWxzLmJsb2Nrc1tjZWxsXSk7XG4gICAgICAgICAgYm94LnBvc2l0aW9uLnNldChncmlkU2l6ZSAqIHggKyBtYXJnaW4sIGdyaWRTaXplICogKHRleHQubGVuZ3RoIC0geSkgKyBtYXJnaW4sIGdyaWRTaXplIC8gLTIpO1xuICAgICAgICAgIHRoaXMud29yZC5hZGQoYm94KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBwcm90b3R5cGUucmV2ZWFsID0gZnVuY3Rpb24ocHJvZ3Jlc3Mpe1xuICAgIHZhciBwO1xuICAgIHAgPSBtaW4oMSwgcHJvZ3Jlc3MpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSBFYXNlLnF1aW50T3V0KHAsIHRoaXMuaGVpZ2h0ICogMiwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnkgPSBFYXNlLmV4cE91dChwLCAzMCwgMCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBFYXNlLmV4cE91dChwLCAtcGkgLyAxMCwgMCk7XG4gIH07XG4gIHByb3RvdHlwZS5kYW5jZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnkgPSAtcGkgLyAyICsgdGltZSAvIDEwMDA7XG4gICAgcmV0dXJuIHRoaXMud29yZC5vcGFjaXR5ID0gMC41ICsgMC41ICogc2luICsgdGltZSAvIDEwMDA7XG4gIH07XG4gIHJldHVybiBUaXRsZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgcGksIERlYnVnQ2FtZXJhUG9zaXRpb25lciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIHBpID0gcmVmJC5waTtcbm91dCQuRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnQ2FtZXJhUG9zaXRpb25lci5kaXNwbGF5TmFtZSA9ICdEZWJ1Z0NhbWVyYVBvc2l0aW9uZXInO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXI7XG4gIGZ1bmN0aW9uIERlYnVnQ2FtZXJhUG9zaXRpb25lcihjYW1lcmEsIHRhcmdldCl7XG4gICAgdGhpcy5jYW1lcmEgPSBjYW1lcmE7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgdGFyZ2V0OiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZW5hYmxlZCA9IHRydWU7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7XG4gICAgaWYgKHRoaXMuc3RhdGUuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXV0b1JvdGF0ZShncy5lbGFwc2VkVGltZSk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwaGFzZSwgdnBoYXNlKXtcbiAgICB2YXIgdGhhdDtcbiAgICB2cGhhc2UgPT0gbnVsbCAmJiAodnBoYXNlID0gMCk7XG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IHRoaXMuciAqIHNpbihwaGFzZSk7XG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueSA9IHRoaXMueSArIHRoaXMuciAqIC1zaW4odnBoYXNlKTtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmEubG9va0F0KCh0aGF0ID0gdGhpcy50YXJnZXQucG9zaXRpb24pICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiB0aGlzLnRhcmdldCk7XG4gIH07XG4gIHByb3RvdHlwZS5hdXRvUm90YXRlID0gZnVuY3Rpb24odGltZSl7XG4gICAgcmV0dXJuIHRoaXMuc2V0UG9zaXRpb24ocGkgLyAxMCAqIHNpbih0aW1lIC8gMTAwMCkpO1xuICB9O1xuICByZXR1cm4gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xufSgpKTsiLCJ2YXIgcGk7XG5waSA9IHJlcXVpcmUoJ3N0ZCcpLnBpO1xuVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5ID0gZnVuY3Rpb24ocmFkaXVzLCByYWRpYWxTZWdtZW50cywgaGVpZ2h0LCBsZW5ndGh3aXNlU2VnbWVudHMpe1xuICB2YXIgaGFsZlNwaGVyZSwgdHViZTtcbiAgaGFsZlNwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIHJhZGlhbFNlZ21lbnRzLCByYWRpYWxTZWdtZW50cywgMCwgcGkpO1xuICBoYWxmU3BoZXJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKDAsIDAsIDApKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VSb3RhdGlvblgoLXBpIC8gMikpO1xuICBoYWxmU3BoZXJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVNjYWxlKDEsIDAuNSwgMSkpO1xuICB0dWJlID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkocmFkaXVzLCByYWRpdXMsIGhlaWdodCwgcmFkaWFsU2VnbWVudHMgKiAyLCBsZW5ndGh3aXNlU2VnbWVudHMsIHRydWUpO1xuICB0dWJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKDAsIC1oZWlnaHQgLyAyLCAwKSk7XG4gIGhhbGZTcGhlcmUubWVyZ2UodHViZSk7XG4gIHJldHVybiBoYWxmU3BoZXJlO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBsZXJwLCByYW5kLCBmbG9vciwgbWFwLCBFYXNlLCBUSFJFRSwgUGFsZXR0ZSwgU2NlbmVNYW5hZ2VyLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIEFyZW5hLCBUYWJsZSwgU3RhcnRNZW51LCBGYWlsU2NyZWVuLCBMaWdodGluZywgQnJpY2tQcmV2aWV3LCBOaXhpZURpc3BsYXksIFRyYWNrYmFsbENvbnRyb2xzLCBUaHJlZUpzUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCBsZXJwID0gcmVmJC5sZXJwLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwO1xuRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuU2NlbmVNYW5hZ2VyID0gcmVxdWlyZSgnLi9zY2VuZS1tYW5hZ2VyJykuU2NlbmVNYW5hZ2VyO1xuRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gcmVxdWlyZSgnLi9kZWJ1Zy1jYW1lcmEnKS5EZWJ1Z0NhbWVyYVBvc2l0aW9uZXI7XG5yZWYkID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgVGFibGUgPSByZWYkLlRhYmxlLCBTdGFydE1lbnUgPSByZWYkLlN0YXJ0TWVudSwgRmFpbFNjcmVlbiA9IHJlZiQuRmFpbFNjcmVlbiwgTGlnaHRpbmcgPSByZWYkLkxpZ2h0aW5nLCBCcmlja1ByZXZpZXcgPSByZWYkLkJyaWNrUHJldmlldywgTml4aWVEaXNwbGF5ID0gcmVmJC5OaXhpZURpc3BsYXk7XG5UcmFja2JhbGxDb250cm9scyA9IHJlcXVpcmUoJy4uLy4uL2xpYi90cmFja2JhbGwtY29udHJvbHMuanMnKS5UcmFja2JhbGxDb250cm9scztcbm91dCQuVGhyZWVKc1JlbmRlcmVyID0gVGhyZWVKc1JlbmRlcmVyID0gKGZ1bmN0aW9uKCl7XG4gIFRocmVlSnNSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdUaHJlZUpzUmVuZGVyZXInO1xuICB2YXIgcHJvdG90eXBlID0gVGhyZWVKc1JlbmRlcmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaHJlZUpzUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIFRocmVlSnNSZW5kZXJlcihvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBuYW1lLCByZWYkLCBwYXJ0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIGxvZyhcIlJlbmRlcmVyOjpuZXdcIik7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZU1hbmFnZXIodGhpcy5vcHRzKTtcbiAgICB0aGlzLm9wdHMuc2NlbmUgPSB0aGlzLnNjZW5lO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmcmFtZXNTaW5jZVJvd3NSZW1vdmVkOiAwLFxuICAgICAgbGFzdFNlZW5TdGF0ZTogJ25vLWdhbWUnXG4gICAgfTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmppdHRlciA9IG5ldyBUSFJFRS5PYmplY3QzRCk7XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIHRhYmxlOiBuZXcgVGFibGUodGhpcy5vcHRzLCBncyksXG4gICAgICBsaWdodGluZzogbmV3IExpZ2h0aW5nKHRoaXMub3B0cywgZ3MpLFxuICAgICAgYXJlbmE6IG5ldyBBcmVuYSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHN0YXJ0TWVudTogbmV3IFN0YXJ0TWVudSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGZhaWxTY3JlZW46IG5ldyBGYWlsU2NyZWVuKHRoaXMub3B0cywgZ3MpLFxuICAgICAgbmV4dEJyaWNrOiBuZXcgQnJpY2tQcmV2aWV3KHRoaXMub3B0cywgZ3MpLFxuICAgICAgc2NvcmU6IG5ldyBOaXhpZURpc3BsYXkodGhpcy5vcHRzLCBncylcbiAgICB9O1xuICAgIGZvciAobmFtZSBpbiByZWYkID0gdGhpcy5wYXJ0cykge1xuICAgICAgcGFydCA9IHJlZiRbbmFtZV07XG4gICAgICBwYXJ0LmFkZFRvKHRoaXMuaml0dGVyKTtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sucm9vdC5wb3NpdGlvbi5zZXQoLXRoaXMub3B0cy5wcmV2aWV3RGlzdGFuY2VGcm9tQ2VudGVyLCAwLCAtdGhpcy5vcHRzLnByZXZpZXdEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0aGlzLnBhcnRzLmFyZW5hLnJvb3QucG9zaXRpb24uc2V0KDAsIDAsIC10aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0aGlzLmFkZFRyYWNrYmFsbCgpO1xuICAgIHRoaXMuc2NlbmUuY29udHJvbHMucmVzZXRTZW5zb3IoKTtcbiAgICB0aGlzLnNjZW5lLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi5zZXQoMCwgLXRoaXMub3B0cy5jYW1lcmFFbGV2YXRpb24sIC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSAqIDQpO1xuICAgIHRoaXMuc2NlbmUuc2hvd0hlbHBlcnMoKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkVHJhY2tiYWxsID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdHJhY2tiYWxsVGFyZ2V0O1xuICAgIHRyYWNrYmFsbFRhcmdldCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0cmFja2JhbGxUYXJnZXQucG9zaXRpb24ueiA9IC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0cmFja2JhbGxUYXJnZXQpO1xuICAgIHRoaXMudHJhY2tiYWxsID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKHRoaXMuc2NlbmUuY2FtZXJhLCB0cmFja2JhbGxUYXJnZXQpO1xuICAgIHJldHVybiB0aGlzLnRyYWNrYmFsbC5wYW5TcGVlZCA9IDE7XG4gIH07XG4gIHByb3RvdHlwZS5hcHBlbmRUbyA9IGZ1bmN0aW9uKGhvc3Qpe1xuICAgIHJldHVybiBob3N0LmFwcGVuZENoaWxkKHRoaXMuc2NlbmUuZG9tRWxlbWVudCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHJvd3MsIHA7XG4gICAgdGhpcy50cmFja2JhbGwudXBkYXRlKCk7XG4gICAgdGhpcy5zY2VuZS51cGRhdGUoKTtcbiAgICBpZiAoZ3MubWV0YWdhbWVTdGF0ZSAhPT0gdGhpcy5zdGF0ZS5sYXN0U2VlblN0YXRlKSB7XG4gICAgICB0aGlzLnBhcnRzLnN0YXJ0TWVudS52aXNpYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHN3aXRjaCAoZ3MubWV0YWdhbWVTdGF0ZSkge1xuICAgICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgICB0aGlzLnBhcnRzLmFyZW5hLnZpc2libGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgICB0aGlzLnBhcnRzLnN0YXJ0TWVudS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoZ3MubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgbG9nKCduby1nYW1lJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcm93cyA9IGdzLmNvcmUucm93c1RvUmVtb3ZlLmxlbmd0aDtcbiAgICAgIHAgPSBncy5hcmVuYS56YXBBbmltYXRpb24ucHJvZ3Jlc3M7XG4gICAgICBncy5zbG93ZG93biA9IDEgKyBFYXNlLmV4cEluKHAsIDIsIDApO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS56YXBMaW5lcyhncywgdGhpcy5qaXR0ZXIucG9zaXRpb24pO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sudXBkYXRlV2lnZ2xlKGdzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucnVuVG9OdW1iZXIoZ3MuYXJlbmEuemFwQW5pbWF0aW9uLnByb2dyZXNzLCBncy5zY29yZS5wb2ludHMpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5wdWxzZShncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICBncy5zbG93ZG93biA9IDE7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnVwZGF0ZShncywgdGhpcy5qaXR0ZXIucG9zaXRpb24pO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheVNoYXBlKGdzLmJyaWNrLm5leHQpO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sudXBkYXRlV2lnZ2xlKGdzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUuc2V0TnVtYmVyKGdzLnNjb3JlLnBvaW50cyk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnB1bHNlKGdzLmVsYXBzZWRUaW1lIC8gMTAwMCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlOb3RoaW5nKCk7XG4gICAgICB0aGlzLnBhcnRzLnN0YXJ0TWVudS51cGRhdGUoZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF1c2UtbWVudSc6XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5Tm90aGluZygpO1xuICAgICAgdGhpcy5wYXJ0cy5wYXVzZU1lbnUudXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheU5vdGhpbmcoKTtcbiAgICAgIHRoaXMucGFydHMuZmFpbFNjcmVlbi51cGRhdGUoZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZyhcIlRocmVlSnNSZW5kZXJlcjo6cmVuZGVyIC0gVW5rbm93biBtZXRhZ2FtZXN0YXRlOlwiLCBncy5tZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGVQYXJ0aWNsZXMoZ3MpO1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSA9IGdzLm1ldGFnYW1lU3RhdGU7XG4gICAgcmV0dXJuIHRoaXMuc2NlbmUucmVuZGVyKCk7XG4gIH07XG4gIHJldHVybiBUaHJlZUpzUmVuZGVyZXI7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIFBhbGV0dGUsIGFzc2V0UGF0aCwgdGV4dHVyZXMsIGksIGVtcHR5LCBub3JtYWwsIGRlYnVnV2lyZWZyYW1lLCBoZWxwZXJBLCBoZWxwZXJCLCBnbGFzcywgY29wcGVyLCBuaXhpZURpZ2l0cywgbml4aWVCZywgYmxvY2tzLCBjb2xvciwgaG9sb0Jsb2NrcywgemFwLCB0YWJsZVRvcCwgdGFibGVFZGdlLCB0YWJsZUZhY2VzLCBsaW5lcywgZmxhcmUsIGZsYXJlRmFjZXMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5hc3NldFBhdGggPSAoZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gXCJhc3NldHMvXCIgKyBpdDtcbn0pO1xudGV4dHVyZXMgPSB7XG4gIG5peGllRGlnaXRzQ29sb3I6IChmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gOTsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgcmVzdWx0cyQucHVzaChUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImRpZ2l0LVwiICsgaSArIFwiLmNvbC5wbmdcIikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9KCkpLFxuICBuaXhpZUJnQ29sb3I6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiZGlnaXQtYmcuY29sLnBuZ1wiKSksXG4gIGJsb2NrVGlsZU5vcm1hbDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJ0aWxlLm5ybS5wbmdcIikpLFxuICB0YWJsZVRvcENvbG9yOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImJvYXJkLmNvbC5wbmdcIikpLFxuICB0YWJsZUVkZ2VDb2xvcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC1mLmNvbC5wbmdcIikpLFxuICB0YWJsZVRvcFNwZWN1bGFyOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImJvYXJkLnNwZWMucG5nXCIpKSxcbiAgZmxhcmVBbHBoYTogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJmbGFyZS5hbHBoYS5wbmdcIikpXG59O1xub3V0JC5lbXB0eSA9IGVtcHR5ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgdmlzaWJsZTogZmFsc2UsXG4gIGNvbG9yOiAweDAsXG4gIGVtaXNzaXZlOiAweDAsXG4gIG9wYWNpdHk6IDBcbn0pO1xub3V0JC5ub3JtYWwgPSBub3JtYWwgPSBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsO1xub3V0JC5kZWJ1Z1dpcmVmcmFtZSA9IGRlYnVnV2lyZWZyYW1lID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6ICd3aGl0ZScsXG4gIHdpcmVmcmFtZTogdHJ1ZVxufSk7XG5vdXQkLmhlbHBlckEgPSBoZWxwZXJBID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6IDB4ZmYwMDAwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgb3BhY2l0eTogMC41XG59KTtcbm91dCQuaGVscGVyQiA9IGhlbHBlckIgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICBjb2xvcjogMHgwMGZmMDAsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBvcGFjaXR5OiAwLjVcbn0pO1xub3V0JC5nbGFzcyA9IGdsYXNzID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgY29sb3I6IDB4MjIyMjIyLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICBzaGluaW5lc3M6IDEwMCxcbiAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gIGRlcHRoV3JpdGU6IGZhbHNlXG59KTtcbm91dCQuY29wcGVyID0gY29wcGVyID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgY29sb3I6IDB4OTY1MTExLFxuICBzcGVjdWxhcjogMHhjYjZkNTEsXG4gIHNoaW5pbmVzczogMzBcbn0pO1xub3V0JC5uaXhpZURpZ2l0cyA9IG5peGllRGlnaXRzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICBpID0gaSQ7XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXh0dXJlcy5uaXhpZURpZ2l0c0NvbG9yW2ldLFxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICBjb2xvcjogMHhmZjMzMDAsXG4gICAgICBlbWlzc2l2ZTogMHhmZmJiMDBcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSgpKTtcbm91dCQubml4aWVCZyA9IG5peGllQmcgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBtYXA6IHRleHR1cmVzLm5peGllQmdDb2xvcixcbiAgY29sb3I6IDB4MDAwMDAwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICBzaGluaW5lc3M6IDgwXG59KTtcbm91dCQuYmxvY2tzID0gYmxvY2tzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFBhbGV0dGUudGlsZUNvbG9ycykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBpID0gaSQ7XG4gICAgY29sb3IgPSByZWYkW2kkXTtcbiAgICByZXN1bHRzJC5wdXNoKG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtZXRhbDogdHJ1ZSxcbiAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgIHNwZWN1bGFyOiBQYWxldHRlLnNwZWNDb2xvcnNbaV0sXG4gICAgICBzaGluaW5lc3M6IDEwMCxcbiAgICAgIG5vcm1hbE1hcDogdGV4dHVyZXMuYmxvY2tUaWxlTm9ybWFsXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLmhvbG9CbG9ja3MgPSBob2xvQmxvY2tzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFBhbGV0dGUudGlsZUNvbG9ycykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBpID0gaSQ7XG4gICAgY29sb3IgPSByZWYkW2kkXTtcbiAgICByZXN1bHRzJC5wdXNoKG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtZXRhbDogdHJ1ZSxcbiAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgZW1pc3NpdmU6IDB4ZmZmZmZmLFxuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgc3BlY3VsYXI6IFBhbGV0dGUuc3BlY0NvbG9yc1tpXSxcbiAgICAgIHNoaW5pbmVzczogMTAwLFxuICAgICAgbm9ybWFsTWFwOiB0ZXh0dXJlcy5ibG9ja1RpbGVOb3JtYWxcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSgpKTtcbm91dCQuemFwID0gemFwID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgY29sb3I6IDB4ZmZmZmZmLFxuICBlbWlzc2l2ZTogMHhmZmZmZmZcbn0pO1xub3V0JC50YWJsZVRvcCA9IHRhYmxlVG9wID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgbWFwOiB0ZXh0dXJlcy50YWJsZVRvcENvbG9yLFxuICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gIHNwZWN1bGFyTWFwOiB0ZXh0dXJlcy50YWJsZVRvcFNwZWN1bGFyLFxuICBzaGluaW5lc3M6IDEwMFxufSk7XG5vdXQkLnRhYmxlRWRnZSA9IHRhYmxlRWRnZSA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIG1hcDogdGV4dHVyZXMudGFibGVFZGdlQ29sb3Jcbn0pO1xub3V0JC50YWJsZUZhY2VzID0gdGFibGVGYWNlcyA9IG5ldyBUSFJFRS5NZXNoRmFjZU1hdGVyaWFsKFt0YWJsZUVkZ2UsIHRhYmxlRWRnZSwgdGFibGVUb3AsIHRhYmxlRWRnZSwgdGFibGVFZGdlLCB0YWJsZUVkZ2VdKTtcbm91dCQubGluZXMgPSBsaW5lcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgY29sb3IgPSByZWYkW2kkXTtcbiAgICByZXN1bHRzJC5wdXNoKG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogY29sb3JcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSgpKTtcbm91dCQuZmxhcmUgPSBmbGFyZSA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDAsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBlbWlzc2l2ZTogJ3doaXRlJyxcbiAgb3BhY2l0eTogMC4yLFxuICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gIGFscGhhTWFwOiB0ZXh0dXJlcy5mbGFyZUFscGhhXG59KTtcbm91dCQuZmxhcmVGYWNlcyA9IGZsYXJlRmFjZXMgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChbZmxhcmUsIGZsYXJlLCBlbXB0eSwgZW1wdHksIGZsYXJlLCBmbGFyZV0pOyIsInZhciBUSFJFRSwgcmVmJCwgbG9nLCBtYXAsIHBsdWNrLCBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIGNvbG9yT3JkZXIsIHRpbGVDb2xvcnMsIHNwZWNDb2xvcnMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIG1hcCA9IHJlZiQubWFwLCBwbHVjayA9IHJlZiQucGx1Y2s7XG5vdXQkLm5ldXRyYWwgPSBuZXV0cmFsID0gWzB4ZmZmZmZmLCAweGNjY2NjYywgMHg4ODg4ODgsIDB4MjEyMTIxXTtcbm91dCQucmVkID0gcmVkID0gWzB4RkY0NDQ0LCAweEZGNzc3NywgMHhkZDQ0NDQsIDB4NTUxMTExXTtcbm91dCQub3JhbmdlID0gb3JhbmdlID0gWzB4RkZCQjMzLCAweEZGQ0M4OCwgMHhDQzg4MDAsIDB4NTUzMzAwXTtcbm91dCQuZ3JlZW4gPSBncmVlbiA9IFsweDQ0ZmY2NiwgMHg4OGZmYWEsIDB4MjJiYjMzLCAweDExNTUxMV07XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWzB4ZmYzM2ZmLCAweGZmYWFmZiwgMHhiYjIyYmIsIDB4NTUxMTU1XTtcbm91dCQuYmx1ZSA9IGJsdWUgPSBbMHg2NmJiZmYsIDB4YWFkZGZmLCAweDU1ODhlZSwgMHgxMTExNTVdO1xub3V0JC5icm93biA9IGJyb3duID0gWzB4ZmZiYjMzLCAweGZmY2M4OCwgMHhiYjk5MDAsIDB4NTU1NTExXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWzB4ZWVlZTExLCAweGZmZmZhYSwgMHhjY2JiMDAsIDB4NTU1NTExXTtcbm91dCQuY3lhbiA9IGN5YW4gPSBbMHg0NGRkZmYsIDB4YWFlM2ZmLCAweDAwYWFjYywgMHgwMDY2OTldO1xuY29sb3JPcmRlciA9IFtuZXV0cmFsLCByZWQsIG9yYW5nZSwgeWVsbG93LCBncmVlbiwgY3lhbiwgYmx1ZSwgbWFnZW50YV07XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gbWFwKHBsdWNrKDIpLCBjb2xvck9yZGVyKTtcbm91dCQuc3BlY0NvbG9ycyA9IHNwZWNDb2xvcnMgPSBtYXAocGx1Y2soMCksIGNvbG9yT3JkZXIpO1xub3V0JC5QYWxldHRlID0gUGFsZXR0ZSA9IHtcbiAgbmV1dHJhbDogbmV1dHJhbCxcbiAgcmVkOiByZWQsXG4gIG9yYW5nZTogb3JhbmdlLFxuICB5ZWxsb3c6IHllbGxvdyxcbiAgZ3JlZW46IGdyZWVuLFxuICBjeWFuOiBjeWFuLFxuICBibHVlOiBibHVlLFxuICBtYWdlbnRhOiBtYWdlbnRhLFxuICB0aWxlQ29sb3JzOiB0aWxlQ29sb3JzLFxuICBzcGVjQ29sb3JzOiBzcGVjQ29sb3JzXG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBUSFJFRSwgTWF0ZXJpYWxzLCBTY2VuZU1hbmFnZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0cycpO1xub3V0JC5TY2VuZU1hbmFnZXIgPSBTY2VuZU1hbmFnZXIgPSAoZnVuY3Rpb24oKXtcbiAgU2NlbmVNYW5hZ2VyLmRpc3BsYXlOYW1lID0gJ1NjZW5lTWFuYWdlcic7XG4gIHZhciBoZWxwZXJNYXJrZXJTaXplLCBoZWxwZXJNYXJrZXJPcGFjaXR5LCBoZWxwZXJNYXJrZXJHZW8sIHByb3RvdHlwZSA9IFNjZW5lTWFuYWdlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gU2NlbmVNYW5hZ2VyO1xuICBoZWxwZXJNYXJrZXJTaXplID0gMC4wMjtcbiAgaGVscGVyTWFya2VyT3BhY2l0eSA9IDAuMztcbiAgaGVscGVyTWFya2VyR2VvID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeShoZWxwZXJNYXJrZXJTaXplLCBoZWxwZXJNYXJrZXJTaXplLCBoZWxwZXJNYXJrZXJTaXplKTtcbiAgZnVuY3Rpb24gU2NlbmVNYW5hZ2VyKG9wdHMpe1xuICAgIHZhciBhc3BlY3Q7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJlc2l6ZSA9IGJpbmQkKHRoaXMsICdyZXNpemUnLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuemVyb1NlbnNvciA9IGJpbmQkKHRoaXMsICd6ZXJvU2Vuc29yJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLmdvRnVsbHNjcmVlbiA9IGJpbmQkKHRoaXMsICdnb0Z1bGxzY3JlZW4nLCBwcm90b3R5cGUpO1xuICAgIGFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgICBhbnRpYWxpYXM6IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIGFzcGVjdCwgMC4wMDEsIDEwMDApO1xuICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyh0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy52ckVmZmVjdCA9IG5ldyBUSFJFRS5WUkVmZmVjdCh0aGlzLnJlbmRlcmVyKTtcbiAgICB0aGlzLnZyRWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGggLSAxLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuemVyb1NlbnNvciwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRoaXMuZ29GdWxsc2NyZWVuKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdnJNb2RlOiBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICE9IG51bGxcbiAgICB9O1xuICAgIHRoaXMucm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnJvb3QpO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5yZWdpc3RyYXRpb24pO1xuICB9XG4gIHByb3RvdHlwZS5hZGRSZWdpc3RyYXRpb25IZWxwZXIgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBNYXRlcmlhbHMuaGVscGVyQSkpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBNYXRlcmlhbHMuaGVscGVyQikpO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHZhciBncmlkLCBheGlzLCByb290QXhpcztcbiAgICBncmlkID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoMTAsIDAuMSk7XG4gICAgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDEpO1xuICAgIHJvb3RBeGlzID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoMC41KTtcbiAgICBheGlzLnBvc2l0aW9uLnogPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56O1xuICAgIHJldHVybiByb290QXhpcy5wb3NpdGlvbi56ID0gdGhpcy5yb290LnBvc2l0aW9uLno7XG4gIH07XG4gIHByb3RvdHlwZS5lbmFibGVTaGFkb3dDYXN0aW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcFNvZnQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFGYXIgPSAxMDAwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRm92ID0gNTA7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFOZWFyID0gMztcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEJpYXMgPSAwLjAwMzk7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBIZWlnaHQgPSAxMDI0O1xuICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcERhcmtuZXNzID0gMC41O1xuICB9O1xuICBwcm90b3R5cGUuZ29GdWxsc2NyZWVuID0gZnVuY3Rpb24oKXtcbiAgICBsb2coJ1N0YXJ0aW5nIGZ1bGxzY3JlZW4uLi4nKTtcbiAgICByZXR1cm4gdGhpcy52ckVmZmVjdC5zZXRGdWxsU2NyZWVuKHRydWUpO1xuICB9O1xuICBwcm90b3R5cGUuemVyb1NlbnNvciA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICB2YXIga2V5Q29kZTtcbiAgICBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmIChrZXlDb2RlID09PSA4Nikge1xuICAgICAgcmV0dXJuIHRoaXMuY29udHJvbHMucmVzZXRTZW5zb3IoKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgICByZXR1cm4gdGhpcy52ckVmZmVjdC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy51cGRhdGUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMudnJFZmZlY3QucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2RvbUVsZW1lbnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBwcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIG9iaiwgdGhhdCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgb2JqID0gYXJndW1lbnRzW2kkXTtcbiAgICAgIGxvZygnU2NlbmVNYW5hZ2VyOjphZGQgLScsIG9iaik7XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmVnaXN0cmF0aW9uLmFkZCgodGhhdCA9IG9iai5yb290KSAhPSBudWxsID8gdGhhdCA6IG9iaikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTY2VuZU1hbmFnZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHBvdywgcXVhZEluLCBxdWFkT3V0LCBjdWJpY0luLCBjdWJpY091dCwgcXVhcnRJbiwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50T3V0LCBleHBJbiwgZXhwT3V0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucG93ID0gcmVxdWlyZSgnc3RkJykucG93O1xub3V0JC5xdWFkSW4gPSBxdWFkSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHQgKiB0ICsgYjtcbn07XG5vdXQkLnF1YWRPdXQgPSBxdWFkT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogdCAqICh0IC0gMikgKyBiO1xufTtcbm91dCQuY3ViaWNJbiA9IGN1YmljSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDMpICsgYjtcbn07XG5vdXQkLmN1YmljT3V0ID0gY3ViaWNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgMykgKyAxKSArIGI7XG59O1xub3V0JC5xdWFydEluID0gcXVhcnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNCkgKyBiO1xufTtcbm91dCQucXVhcnRPdXQgPSBxdWFydE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIChNYXRoLnBvdyh0IC0gMSwgNCkgLSAxKSArIGI7XG59O1xub3V0JC5xdWludEluID0gcXVpbnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNSkgKyBiO1xufTtcbm91dCQucXVpbnRPdXQgPSBxdWludE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKE1hdGgucG93KHQgLSAxLCA1KSArIDEpICsgYjtcbn07XG5vdXQkLmV4cEluID0gZXhwSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHBvdygyLCAxMCAqICh0IC0gMSkpICsgYjtcbn07XG5vdXQkLmV4cE91dCA9IGV4cE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKCgtcG93KDIsIC0xMCAqIHQpKSArIDEpICsgYjtcbn07IiwidmFyIGlkLCBsb2csIGZsaXAsIGRlbGF5LCBmbG9vciwgcmFuZG9tLCByYW5kLCByYW5kSW50LCByYW5kb21Gcm9tLCBhZGRWMiwgZmlsdGVyLCBwbHVjaywgcGksIHRhdSwgcG93LCBzaW4sIGNvcywgbWluLCBtYXgsIGxlcnAsIG1hcCwgc3BsaXQsIGpvaW4sIHVubGluZXMsIGRpdiwgd3JhcCwgbGltaXQsIHJhZiwgdGhhdCwgRWFzZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyByYW5kb20oKSAqIChtYXggLSBtaW4pO1xufTtcbm91dCQucmFuZEludCA9IHJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLmZpbHRlciA9IGZpbHRlciA9IGN1cnJ5JChmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIGlmICjOuyh4KSkge1xuICAgICAgcmVzdWx0cyQucHVzaCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLnBsdWNrID0gcGx1Y2sgPSBjdXJyeSQoZnVuY3Rpb24ocCwgbyl7XG4gIHJldHVybiBvW3BdO1xufSk7XG5vdXQkLnBpID0gcGkgPSBNYXRoLlBJO1xub3V0JC50YXUgPSB0YXUgPSBwaSAqIDI7XG5vdXQkLnBvdyA9IHBvdyA9IE1hdGgucG93O1xub3V0JC5zaW4gPSBzaW4gPSBNYXRoLnNpbjtcbm91dCQuY29zID0gY29zID0gTWF0aC5jb3M7XG5vdXQkLm1pbiA9IG1pbiA9IE1hdGgubWluO1xub3V0JC5tYXggPSBtYXggPSBNYXRoLm1heDtcbm91dCQubGVycCA9IGxlcnAgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIHApe1xuICByZXR1cm4gbWluICsgcCAqIChtYXggLSBtaW4pO1xufSk7XG5vdXQkLm1hcCA9IG1hcCA9IGN1cnJ5JChmdW5jdGlvbijOuywgbCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gozrsoeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC5zcGxpdCA9IHNwbGl0ID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoY2hhcik7XG59KTtcbm91dCQuam9pbiA9IGpvaW4gPSBjdXJyeSQoZnVuY3Rpb24oY2hhciwgc3RyKXtcbiAgcmV0dXJuIHN0ci5qb2luKGNoYXIpO1xufSk7XG5vdXQkLnVubGluZXMgPSB1bmxpbmVzID0gam9pbihcIlxcblwiKTtcbm91dCQuZGl2ID0gZGl2ID0gY3VycnkkKGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gZmxvb3IoYSAvIGIpO1xufSk7XG5vdXQkLndyYXAgPSB3cmFwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQubGltaXQgPSBsaW1pdCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9O1xub3V0JC5FYXNlID0gRWFzZSA9IHJlcXVpcmUoJy4vZWFzaW5nJyk7XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgdW5saW5lcywgVGltZXIsIHRlbXBsYXRlLCBEZWJ1Z091dHB1dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgdW5saW5lcyA9IHJlZiQudW5saW5lcztcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIHNjb3JlOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCAyKTtcbiAgfSxcbiAgYnJpY2s6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc2hhcGUubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC5tYXAodGVtcGxhdGUuY2VsbCkuam9pbignICcpO1xuICAgIH0pLmpvaW4oXCJcXG4gICAgICAgIFwiKTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIGtleVN1bW1hcnksIHJlc3VsdHMkID0gW107XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRoaXMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAga2V5U3VtbWFyeSA9IHRoaXNbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKGtleVN1bW1hcnkua2V5ICsgJy0nICsga2V5U3VtbWFyeS5hY3Rpb24gKyBcInxcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIihubyBjaGFuZ2UpXCI7XG4gICAgfVxuICB9LFxuICBub3JtYWw6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZwc0NvbG9yO1xuICAgIGZwc0NvbG9yID0gdGhpcy5mcHMgPj0gNTVcbiAgICAgID8gJyMwZjAnXG4gICAgICA6IHRoaXMuZnBzID49IDMwID8gJyNmZjAnIDogJyNmMDAnO1xuICAgIHJldHVybiBcInNjb3JlIC0gXCIgKyB0ZW1wbGF0ZS5zY29yZS5hcHBseSh0aGlzLnNjb3JlKSArIFwiXFxuXFxuIG1ldGEgLSBcIiArIHRoaXMubWV0YWdhbWVTdGF0ZSArIFwiXFxuIHRpbWUgLSBcIiArIHRoaXMuZWxhcHNlZFRpbWUgKyBcIlxcbmZyYW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRGcmFtZXMgKyBcIlxcbiAgZnBzIC0gPHNwYW4gc3R5bGU9XFxcImNvbG9yOlwiICsgZnBzQ29sb3IgKyBcIlxcXCI+XCIgKyB0aGlzLmZwcyArIFwiPC9zcGFuPlxcbiBrZXlzIC0gXCIgKyB0ZW1wbGF0ZS5rZXlzLmFwcGx5KHRoaXMuaW5wdXRTdGF0ZSkgKyBcIlxcblxcbiBkcm9wIC0gXCIgKyBUaW1lci50b1N0cmluZyh0aGlzLmNvcmUuZHJvcFRpbWVyKSArIFwiXFxuICB6YXAgLSBcIiArIFRpbWVyLnRvU3RyaW5nKHRoaXMuYXJlbmEuemFwQW5pbWF0aW9uKTtcbiAgfSxcbiAgbWVudUl0ZW1zOiBmdW5jdGlvbigpe1xuICAgIHZhciBpeCwgaXRlbTtcbiAgICByZXR1cm4gXCJcIiArIHVubGluZXMoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5tZW51RGF0YSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgaXggPSBpJDtcbiAgICAgICAgaXRlbSA9IHJlZiRbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHRlbXBsYXRlLm1lbnVJdGVtLmNhbGwoaXRlbSwgaXgsIHRoaXMuY3VycmVudEluZGV4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH0sXG4gIHN0YXJ0TWVudTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJTVEFSVCBNRU5VXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcyk7XG4gIH0sXG4gIG1lbnVJdGVtOiBmdW5jdGlvbihpbmRleCwgY3VycmVudEluZGV4KXtcbiAgICByZXR1cm4gXCJcIiArIChpbmRleCA9PT0gY3VycmVudEluZGV4ID8gXCI+XCIgOiBcIiBcIikgKyBcIiBcIiArIHRoaXMudGV4dDtcbiAgfSxcbiAgZmFpbHVyZTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgICBHQU1FIE9WRVJcXG5cXG4gICAgIFNjb3JlXFxuXFxuICBTaW5nbGUgLSBcIiArIHRoaXMuc2NvcmUuc2luZ2xlcyArIFwiXFxuICBEb3VibGUgLSBcIiArIHRoaXMuc2NvcmUuZG91YmxlcyArIFwiXFxuICBUcmlwbGUgLSBcIiArIHRoaXMuc2NvcmUudHJpcGxlcyArIFwiXFxuICBUZXRyaXMgLSBcIiArIHRoaXMuc2NvcmUudGV0cmlzICsgXCJcXG5cXG5Ub3RhbCBMaW5lczogXCIgKyB0aGlzLnNjb3JlLmxpbmVzICsgXCJcXG5cXG5cIiArIHRlbXBsYXRlLm1lbnVJdGVtcy5hcHBseSh0aGlzLmdhbWVPdmVyKTtcbiAgfVxufTtcbm91dCQuRGVidWdPdXRwdXQgPSBEZWJ1Z091dHB1dCA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z091dHB1dC5kaXNwbGF5TmFtZSA9ICdEZWJ1Z091dHB1dCc7XG4gIHZhciBwcm90b3R5cGUgPSBEZWJ1Z091dHB1dC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdPdXRwdXQ7XG4gIGZ1bmN0aW9uIERlYnVnT3V0cHV0KCl7XG4gICAgdmFyIHJlZiQ7XG4gICAgdGhpcy5kYm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZGJvKTtcbiAgICByZWYkID0gdGhpcy5kYm8uc3R5bGU7XG4gICAgcmVmJC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgcmVmJC50b3AgPSAwO1xuICAgIHJlZiQubGVmdCA9IDA7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICBzd2l0Y2ggKHN0YXRlLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5ub3JtYWwuYXBwbHkoc3RhdGUpO1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLmZhaWx1cmUuYXBwbHkoc3RhdGUpO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLnN0YXJ0TWVudS5hcHBseShzdGF0ZS5zdGFydE1lbnUpO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IFwiVW5rbm93biBtZXRhZ2FtZSBzdGF0ZTogXCIgKyBzdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIERlYnVnT3V0cHV0O1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFmLCBmbG9vciwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5vdXQkLkZyYW1lRHJpdmVyID0gRnJhbWVEcml2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgRnJhbWVEcml2ZXIuZGlzcGxheU5hbWUgPSAnRnJhbWVEcml2ZXInO1xuICB2YXIgZnBzSGlzdG9yeVdpbmRvdywgcHJvdG90eXBlID0gRnJhbWVEcml2ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lRHJpdmVyO1xuICBmcHNIaXN0b3J5V2luZG93ID0gMjA7XG4gIGZ1bmN0aW9uIEZyYW1lRHJpdmVyKG9uRnJhbWUpe1xuICAgIHRoaXMub25GcmFtZSA9IG9uRnJhbWU7XG4gICAgdGhpcy5mcmFtZSA9IGJpbmQkKHRoaXMsICdmcmFtZScsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6Om5ld1wiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgemVybzogMCxcbiAgICAgIHRpbWU6IDAsXG4gICAgICBmcmFtZTogMCxcbiAgICAgIHJ1bm5pbmc6IGZhbHNlXG4gICAgfTtcbiAgICB0aGlzLmZwcyA9IDA7XG4gICAgdGhpcy5mcHNIaXN0b3J5ID0gcmVwZWF0QXJyYXkkKFswXSwgZnBzSGlzdG9yeVdpbmRvdyk7XG4gIH1cbiAgcHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbm93LCDOlHQ7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgcmFmKHRoaXMuZnJhbWUpO1xuICAgIH1cbiAgICBub3cgPSBEYXRlLm5vdygpIC0gdGhpcy5zdGF0ZS56ZXJvO1xuICAgIM6UdCA9IG5vdyAtIHRoaXMuc3RhdGUudGltZTtcbiAgICB0aGlzLnB1c2hIaXN0b3J5KM6UdCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gbm93O1xuICAgIHRoaXMuc3RhdGUuZnJhbWUgPSB0aGlzLnN0YXRlLmZyYW1lICsgMTtcbiAgICB0aGlzLnN0YXRlLs6UdCA9IM6UdDtcbiAgICByZXR1cm4gdGhpcy5vbkZyYW1lKM6UdCwgdGhpcy5zdGF0ZS50aW1lLCB0aGlzLnN0YXRlLmZyYW1lLCB0aGlzLmZwcyk7XG4gIH07XG4gIHByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RhcnQgLSBzdGFydGluZ1wiKTtcbiAgICB0aGlzLnN0YXRlLnplcm8gPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IDA7XG4gICAgdGhpcy5zdGF0ZS5ydW5uaW5nID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5mcmFtZSgpO1xuICB9O1xuICBwcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0b3AgLSBzdG9wcGluZ1wiKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5ydW5uaW5nID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS5wdXNoSGlzdG9yeSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgdGhpcy5mcHNIaXN0b3J5LnB1c2gozpR0KTtcbiAgICB0aGlzLmZwc0hpc3Rvcnkuc2hpZnQoKTtcbiAgICByZXR1cm4gdGhpcy5mcHMgPSBmbG9vcigxMDAwICogZnBzSGlzdG9yeVdpbmRvdyAvIHRoaXMuZnBzSGlzdG9yeS5yZWR1Y2UoY3VycnkkKGZ1bmN0aW9uKHgkLCB5JCl7XG4gICAgICByZXR1cm4geCQgKyB5JDtcbiAgICB9KSwgMCkpO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZpbHRlciwgVGltZXIsIGtleVJlcGVhdFRpbWUsIEtFWSwgQUNUSU9OX05BTUUsIGV2ZW50U3VtbWFyeSwgbmV3QmxhbmtLZXlzdGF0ZSwgSW5wdXRIYW5kbGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmaWx0ZXIgPSByZWYkLmZpbHRlcjtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xua2V5UmVwZWF0VGltZSA9IDE1MDtcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwLFxuICBaOiA5MCxcbiAgWDogODgsXG4gIE9ORTogNDksXG4gIFRXTzogNTAsXG4gIFRIUkVFOiA1MSxcbiAgRk9VUjogNTIsXG4gIEZJVkU6IDUzLFxuICBTSVg6IDU0LFxuICBTRVZFTjogNTUsXG4gIEVJR0hUOiA1NixcbiAgTklORTogNTcsXG4gIFpFUk86IDQ4XG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnY2FuY2VsJywgcmVmJFtLRVkuU1BBQ0UgKyBcIlwiXSA9ICdoYXJkLWRyb3AnLCByZWYkW0tFWS5YICsgXCJcIl0gPSAnY3cnLCByZWYkW0tFWS5aICsgXCJcIl0gPSAnY2N3JywgcmVmJFtLRVkuVVAgKyBcIlwiXSA9ICd1cCcsIHJlZiRbS0VZLkxFRlQgKyBcIlwiXSA9ICdsZWZ0JywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJFtLRVkuT05FICsgXCJcIl0gPSAnZGVidWctMScsIHJlZiRbS0VZLlRXTyArIFwiXCJdID0gJ2RlYnVnLTInLCByZWYkW0tFWS5USFJFRSArIFwiXCJdID0gJ2RlYnVnLTMnLCByZWYkW0tFWS5GT1VSICsgXCJcIl0gPSAnZGVidWctNCcsIHJlZiRbS0VZLkZJVkUgKyBcIlwiXSA9ICdkZWJ1Zy01JywgcmVmJFtLRVkuU0lYICsgXCJcIl0gPSAnZGVidWctNicsIHJlZiRbS0VZLlNFVkVOICsgXCJcIl0gPSAnZGVidWctNycsIHJlZiRbS0VZLkVJR0hUICsgXCJcIl0gPSAnZGVidWctOCcsIHJlZiRbS0VZLk5JTkUgKyBcIlwiXSA9ICdkZWJ1Zy05JywgcmVmJFtLRVkuWkVSTyArIFwiXCJdID0gJ2RlYnVnLTAnLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGtleSwgc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIGFjdGlvbjogc3RhdGUgPyAnZG93bicgOiAndXAnXG4gIH07XG59O1xubmV3QmxhbmtLZXlzdGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgdXA6IGZhbHNlLFxuICAgIGRvd246IGZhbHNlLFxuICAgIGxlZnQ6IGZhbHNlLFxuICAgIHJpZ2h0OiBmYWxzZSxcbiAgICBhY3Rpb25BOiBmYWxzZSxcbiAgICBhY3Rpb25COiBmYWxzZSxcbiAgICBjb25maXJtOiBmYWxzZSxcbiAgICBjYW5jZWw6IGZhbHNlXG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zdGF0ZVNldHRlciA9IGJpbmQkKHRoaXMsICdzdGF0ZVNldHRlcicsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiSW5wdXRIYW5kbGVyOjpuZXdcIik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc3RhdGVTZXR0ZXIodHJ1ZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5zdGF0ZVNldHRlcihmYWxzZSkpO1xuICAgIHRoaXMuY3VycktleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMubGFzdEtleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICB9XG4gIHByb3RvdHlwZS5zdGF0ZVNldHRlciA9IGN1cnJ5JCgoZnVuY3Rpb24oc3RhdGUsIGFyZyQpe1xuICAgIHZhciB3aGljaCwga2V5O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAoa2V5ID0gQUNUSU9OX05BTUVbd2hpY2hdKSB7XG4gICAgICB0aGlzLmN1cnJLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICBpZiAoc3RhdGUgPT09IHRydWUgJiYgdGhpcy5sYXN0SGVsZEtleSAhPT0ga2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RIZWxkS2V5ID0ga2V5O1xuICAgICAgfVxuICAgIH1cbiAgfSksIHRydWUpO1xuICBwcm90b3R5cGUuY2hhbmdlc1NpbmNlTGFzdEZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIga2V5LCBzdGF0ZSwgd2FzRGlmZmVyZW50O1xuICAgIHJldHVybiBmaWx0ZXIoaWQsIChmdW5jdGlvbigpe1xuICAgICAgdmFyIHJlZiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGtleSBpbiByZWYkID0gdGhpcy5jdXJyS2V5c3RhdGUpIHtcbiAgICAgICAgc3RhdGUgPSByZWYkW2tleV07XG4gICAgICAgIHdhc0RpZmZlcmVudCA9IHN0YXRlICE9PSB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldO1xuICAgICAgICB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICAgIGlmICh3YXNEaWZmZXJlbnQpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGV2ZW50U3VtbWFyeShrZXksIHN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9LmNhbGwodGhpcykpKTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIHJldHVybiBsb2coXCJJbnB1dEhhbmRsZXI6OmRlYnVnTW9kZSAtXCIsIHdoaWNoLCBBQ1RJT05fTkFNRVt3aGljaF0gfHwgJ1t1bmJvdW5kXScpO1xuICAgIH0pO1xuICB9O1xuICBJbnB1dEhhbmRsZXIub24gPSBmdW5jdGlvbihjb2RlLCDOuyl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIGlmICh3aGljaCA9PT0gY29kZSkge1xuICAgICAgICByZXR1cm4gzrsoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIElucHV0SGFuZGxlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmbG9vciwgYXNjaWlQcm9ncmVzc0JhciwgVElNRVJfQUNUSVZFLCBUSU1FUl9FWFBJUkVELCBjcmVhdGUsIHVwZGF0ZSwgcmVzZXQsIHN0b3AsIHJ1bkZvciwgcHJvZ3Jlc3NPZiwgdGltZVRvRXhwaXJ5LCBzZXRUaW1lVG9FeHBpcnksIHJlc2V0V2l0aFJlbWFpbmRlciwgdG9TdHJpbmcsIHVwZGF0ZUFsbEluLCBzZXRTdGF0ZSwgc2V0VGltZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuYXNjaWlQcm9ncmVzc0JhciA9IGN1cnJ5JChmdW5jdGlvbihsZW4sIHZhbCwgbWF4KXtcbiAgdmFyIHZhbHVlQ2hhcnMsIGVtcHR5Q2hhcnM7XG4gIHZhbCA9IHZhbCA+IG1heCA/IG1heCA6IHZhbDtcbiAgdmFsdWVDaGFycyA9IGZsb29yKGxlbiAqIHZhbCAvIG1heCk7XG4gIGVtcHR5Q2hhcnMgPSBsZW4gLSB2YWx1ZUNoYXJzO1xuICByZXR1cm4gcmVwZWF0U3RyaW5nJChcIitcIiwgdmFsdWVDaGFycykgKyByZXBlYXRTdHJpbmckKFwiLVwiLCBlbXB0eUNoYXJzKTtcbn0pO1xucmVmJCA9IFswLCAxXSwgVElNRVJfQUNUSVZFID0gcmVmJFswXSwgVElNRVJfRVhQSVJFRCA9IHJlZiRbMV07XG5vdXQkLmNyZWF0ZSA9IGNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHRhcmdldFRpbWUsIGJlZ2luKXtcbiAgbmFtZSA9PSBudWxsICYmIChuYW1lID0gXCJVbm5hbWVkIFRpbWVyXCIpO1xuICB0YXJnZXRUaW1lID09IG51bGwgJiYgKHRhcmdldFRpbWUgPSAxMDAwKTtcbiAgYmVnaW4gPT0gbnVsbCAmJiAoYmVnaW4gPSBmYWxzZSk7XG4gIGxvZyhcIk5ldyBUaW1lcjpcIiwgbmFtZSwgdGFyZ2V0VGltZSk7XG4gIHJldHVybiB7XG4gICAgY3VycmVudFRpbWU6IDAsXG4gICAgdGFyZ2V0VGltZTogdGFyZ2V0VGltZSxcbiAgICBwcm9ncmVzczogMCxcbiAgICBzdGF0ZTogYmVnaW4gPyBUSU1FUl9BQ1RJVkUgOiBUSU1FUl9FWFBJUkVELFxuICAgIGFjdGl2ZTogYmVnaW4sXG4gICAgZXhwaXJlZDogIWJlZ2luLFxuICAgIHRpbWVUb0V4cGlyeTogdGFyZ2V0VGltZSxcbiAgICBuYW1lOiBuYW1lXG4gIH07XG59O1xub3V0JC51cGRhdGUgPSB1cGRhdGUgPSBmdW5jdGlvbih0aW1lciwgzpR0KXtcbiAgaWYgKHRpbWVyLmFjdGl2ZSkge1xuICAgIHJldHVybiBzZXRUaW1lKHRpbWVyLCB0aW1lci5jdXJyZW50VGltZSArIM6UdCk7XG4gIH1cbn07XG5vdXQkLnJlc2V0ID0gcmVzZXQgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRpbWVyLnRhcmdldFRpbWUpO1xuICBsb2coXCJUaW1lcjo6cmVzZXQgLVwiLCB0aW1lci5uYW1lLCB0aW1lKTtcbiAgdGltZXIudGFyZ2V0VGltZSA9IHRpbWU7XG4gIHNldFRpbWUodGltZXIsIDApO1xuICByZXR1cm4gc2V0U3RhdGUodGltZXIsIFRJTUVSX0FDVElWRSk7XG59O1xub3V0JC5zdG9wID0gc3RvcCA9IGZ1bmN0aW9uKHRpbWVyKXtcbiAgc2V0VGltZSh0aW1lciwgMCk7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfRVhQSVJFRCk7XG59O1xub3V0JC5ydW5Gb3IgPSBydW5Gb3IgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWVyLnRpbWVUb0V4cGlyeSA9IHRpbWU7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfQUNUSVZFKTtcbn07XG5vdXQkLnByb2dyZXNzT2YgPSBwcm9ncmVzc09mID0gZnVuY3Rpb24odGltZXIpe1xuICByZXR1cm4gdGltZXIuY3VycmVudFRpbWUgLyB0aW1lci50YXJnZXRUaW1lO1xufTtcbm91dCQudGltZVRvRXhwaXJ5ID0gdGltZVRvRXhwaXJ5ID0gZnVuY3Rpb24odGltZXIpe1xuICByZXR1cm4gdGltZXIudGFyZ2V0VGltZSAtIHRpbWVyLmN1cnJlbnRUaW1lO1xufTtcbm91dCQuc2V0VGltZVRvRXhwaXJ5ID0gc2V0VGltZVRvRXhwaXJ5ID0gZnVuY3Rpb24odGltZXIsIGV4cGlyeVRpbWUpe1xuICByZXR1cm4gc2V0VGltZSh0aW1lciwgdGltZXIudGFyZ2V0VGltZSAtIGV4cGlyeVRpbWUpO1xufTtcbm91dCQucmVzZXRXaXRoUmVtYWluZGVyID0gcmVzZXRXaXRoUmVtYWluZGVyID0gZnVuY3Rpb24odGltZXIsIHJlbWFpbmRlcil7XG4gIHJlbWFpbmRlciA9PSBudWxsICYmIChyZW1haW5kZXIgPSB0aW1lci5jdXJyZW50VGltZSAtIHRpbWVyLnRhcmdldFRpbWUpO1xuICBzZXRUaW1lKHRpbWVyLCByZW1haW5kZXIpO1xuICByZXR1cm4gc2V0U3RhdGUodGltZXIsIFRJTUVSX0FDVElWRSk7XG59O1xub3V0JC50b1N0cmluZyA9IHRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgdmFyIHByb2diYXI7XG4gIHByb2diYXIgPSBhc2NpaVByb2dyZXNzQmFyKDYpO1xuICByZXR1cm4gZnVuY3Rpb24odGltZXIpe1xuICAgIHJldHVybiBcIlwiICsgcHJvZ2Jhcih0aW1lci5jdXJyZW50VGltZSwgdGltZXIudGFyZ2V0VGltZSkgKyBcIiBcIiArICh0aW1lci5uYW1lICsgXCIgXCIgKyB0aW1lci50YXJnZXRUaW1lKSArIFwiIChcIiArIHRpbWVyLmFjdGl2ZSArIFwifFwiICsgdGltZXIuZXhwaXJlZCArIFwiKVwiO1xuICB9O1xufSgpO1xub3V0JC51cGRhdGVBbGxJbiA9IHVwZGF0ZUFsbEluID0gZnVuY3Rpb24odGhpbmcsIM6UdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBpZiAodGhpbmcudGFyZ2V0VGltZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHVwZGF0ZSh0aGluZywgzpR0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdGhpbmcgPT09ICdvYmplY3QnKSB7XG4gICAgZm9yIChrIGluIHRoaW5nKSB7XG4gICAgICB2ID0gdGhpbmdba107XG4gICAgICBpZiAodikge1xuICAgICAgICByZXN1bHRzJC5wdXNoKHVwZGF0ZUFsbEluKHYsIM6UdCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5zZXRTdGF0ZSA9IGZ1bmN0aW9uKHRpbWVyLCBzdGF0ZSl7XG4gIHRpbWVyLnN0YXRlID0gc3RhdGU7XG4gIHRpbWVyLmV4cGlyZWQgPSBzdGF0ZSA9PT0gVElNRVJfRVhQSVJFRDtcbiAgcmV0dXJuIHRpbWVyLmFjdGl2ZSA9IHN0YXRlICE9PSBUSU1FUl9FWFBJUkVEO1xufTtcbnNldFRpbWUgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWVyLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgdGltZXIucHJvZ3Jlc3MgPSB0aW1lci5jdXJyZW50VGltZSAvIHRpbWVyLnRhcmdldFRpbWU7XG4gIGlmICh0aW1lci5jdXJyZW50VGltZSA+PSB0aW1lci50YXJnZXRUaW1lKSB7XG4gICAgdGltZXIucHJvZ3Jlc3MgPSAxO1xuICAgIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfRVhQSVJFRCk7XG4gIH1cbn07XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
