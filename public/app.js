(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, Timer, GameState, DebugOutput, TetrisGame, ThreeJsRenderer;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./utils/frame-driver').FrameDriver;
InputHandler = require('./utils/input-handler').InputHandler;
Timer = require('./utils/timer').Timer;
GameState = require('./utils/game-state').GameState;
DebugOutput = require('./utils/debug-output').DebugOutput;
TetrisGame = require('./game').TetrisGame;
ThreeJsRenderer = require('./renderer').ThreeJsRenderer;
document.addEventListener('DOMContentLoaded', function(){
  var gameOpts, renderOpts, inputHandler, gameState, tetrisGame, renderer, debugOutput, testEasing, frameDriver;
  gameOpts = {
    tileWidth: 10,
    tileHeight: 20,
    timeFactor: 1
  };
  renderOpts = {
    unitsPerMeter: 1,
    gridSize: 0.07,
    blockSize: 0.069,
    deskSize: [1.6, 0.8],
    arenaDistanceFromEdge: 0.5,
    previewDistanceFromEdge: 0.2,
    previewScaleFactor: 0.5,
    cameraDistanceFromEdge: 0.2,
    cameraElevation: 0.5,
    hardDropJoltAmount: 0.03,
    zapParticleSize: 0.008,
    scoreDistanceFromEdge: 0.15
  };
  inputHandler = new InputHandler;
  gameState = new GameState(gameOpts);
  tetrisGame = new TetrisGame(gameState);
  renderer = new ThreeJsRenderer(renderOpts, gameState);
  renderer.appendTo(document.body);
  debugOutput = new DebugOutput;
  InputHandler.on(192, function(){
    if (frameDriver.state.running) {
      return frameDriver.stop();
    } else {
      return frameDriver.start();
    }
  });
  testEasing = function(){
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
  frameDriver = new FrameDriver(function(Δt, time, frame){
    gameState.Δt = Δt / gameOpts.timeFactor / gameState.slowdown;
    gameState.elapsedTime = time / gameOpts.timeFactor;
    gameState.elapsedFrames = frame;
    gameState.inputState = inputHandler.changesSinceLastFrame();
    Timer.updateAll(gameState.Δt);
    gameState = tetrisGame.runFrame(gameState, gameState.Δt);
    renderer.render(gameState, renderOpts);
    if (debugOutput) {
      return debugOutput.render(gameState);
    }
  });
  frameDriver.start();
  return tetrisGame.beginNewGame(gameState);
});
},{"./game":9,"./renderer":28,"./utils/debug-output":33,"./utils/frame-driver":34,"./utils/game-state":35,"./utils/input-handler":36,"./utils/timer":37,"std":32}],2:[function(require,module,exports){
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

	//

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
},{}],7:[function(require,module,exports){
var ref$, id, log, wrap, menuData, limiter, primeGameState, chooseOption, selectPrevItem, selectNextItem, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, wrap = ref$.wrap;
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
out$.primeGameState = primeGameState = function(gamestate){
  return gamestate.failMenuState = {
    currentIndex: 0,
    currentState: menuData[0],
    menuData: menuData
  };
};
out$.chooseOption = chooseOption = function(fms, index){
  fms.currentIndex = limiter(index);
  return fms.currentState = menuData[fms.currentIndex];
};
out$.selectPrevItem = selectPrevItem = function(fms){
  var currentIndex;
  currentIndex = fms.currentIndex;
  return chooseOption(fms, currentIndex - 1);
};
out$.selectNextItem = selectNextItem = function(fms){
  var currentIndex;
  currentIndex = fms.currentIndex;
  return chooseOption(fms, currentIndex + 1);
};
},{"std":32}],8:[function(require,module,exports){
var ref$, id, log, addV2, randInt, wrap, randomFrom, BrickShapes, canDrop, canMove, canRotate, collides, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, removeRows, clearArena, getShapeOfRotation, normaliseRotation, rotateBrick, computeScore, resetScore, animationTimeForRows, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
BrickShapes = require('./data/brick-shapes');
out$.canDrop = canDrop = function(brick, arena){
  return canMove(brick, [0, 1], arena);
};
out$.canMove = canMove = function(brick, move, arena){
  var newPos;
  newPos = addV2(brick.pos, move);
  return collides(newPos, brick.shape, arena);
};
out$.canRotate = canRotate = function(brick, dir, arena){
  var newShape;
  newShape = getShapeOfRotation(brick, brick.rotation + dir);
  return collides(brick.pos, newShape, arena);
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
out$.topIsReached = topIsReached = function(arg$){
  var cells, i$, ref$, len$, cell;
  cells = arg$.cells;
  for (i$ = 0, len$ = (ref$ = cells[0]).length; i$ < len$; ++i$) {
    cell = ref$[i$];
    if (cell) {
      return true;
    }
  }
  return false;
};
out$.isComplete = isComplete = function(row){
  var i$, len$, cell;
  for (i$ = 0, len$ = row.length; i$ < len$; ++i$) {
    cell = row[i$];
    if (!cell) {
      return false;
    }
  }
  return true;
};
out$.newBrick = newBrick = function(ix){
  ix == null && (ix = randInt(0, BrickShapes.all.length));
  return {
    rotation: 0,
    shape: BrickShapes.all[ix].shapes[0],
    type: BrickShapes.all[ix].type,
    pos: [0, 0]
  };
};
out$.spawnNewBrick = spawnNewBrick = function(gs){
  gs.brick.current = gs.brick.next;
  gs.brick.current.pos = [4, -1];
  return gs.brick.next = newBrick();
};
out$.dropArenaRow = dropArenaRow = function(arg$, rowIx){
  var cells;
  cells = arg$.cells;
  cells.splice(rowIx, 1);
  return cells.unshift(repeatArray$([0], cells[0].length));
};
out$.removeRows = removeRows = function(rows, arena){
  var i$, len$, rowIx, results$ = [];
  for (i$ = 0, len$ = rows.length; i$ < len$; ++i$) {
    rowIx = rows[i$];
    results$.push(dropArenaRow(arena, rowIx));
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
out$.getShapeOfRotation = getShapeOfRotation = function(brick, rotation){
  rotation = normaliseRotation(brick, rotation);
  return BrickShapes[brick.type][rotation];
};
out$.normaliseRotation = normaliseRotation = function(arg$, rotation){
  var type;
  type = arg$.type;
  return wrap(0, BrickShapes[type].length - 1, rotation);
};
out$.rotateBrick = rotateBrick = function(brick, dir){
  var rotation, type;
  rotation = brick.rotation, type = brick.type;
  brick.rotation = normaliseRotation(brick, brick.rotation + dir);
  return brick.shape = getShapeOfRotation(brick, brick.rotation);
};
out$.computeScore = computeScore = function(score, rows, lvl){
  lvl == null && (lvl = 0);
  switch (rows.length) {
  case 1:
    score.singles += 1;
    score.points += 40 * (lvl + 1);
    break;
  case 2:
    score.doubles += 1;
    score.points += 100 * (lvl + 1);
    break;
  case 3:
    score.triples += 1;
    score.points += 300 * (lvl + 1);
    break;
  case 4:
    score.tetris += 1;
    score.points += 1200 * (lvl + 1);
  }
  return score.lines += rows.length;
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
out$.animationTimeForRows = animationTimeForRows = function(rows){
  return 10 + Math.pow(3, rows.length);
};
function repeatArray$(arr, n){
  for (var r = []; n > 0; (n >>= 1) && (arr = arr.concat(arr)))
    if (n & 1) r.push.apply(r, arr);
  return r;
}
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./data/brick-shapes":6,"std":32}],9:[function(require,module,exports){
var ref$, id, log, rand, randomFrom, Core, StartMenu, FailMenu, TetrisGame, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
randomFrom = require('std').randomFrom;
Core = require('./game-core');
StartMenu = require('./start-menu');
FailMenu = require('./fail-menu');
out$.TetrisGame = TetrisGame = (function(){
  TetrisGame.displayName = 'TetrisGame';
  var prototype = TetrisGame.prototype, constructor = TetrisGame;
  function TetrisGame(gameState){
    log("TetrisGame::new");
    StartMenu.primeGameState(gameState);
    FailMenu.primeGameState(gameState);
  }
  prototype.beginNewGame = function(gameState){
    (function(){
      Core.clearArena(this.arena);
      this.brick.next = Core.newBrick();
      this.brick.next.pos = [3, -1];
      this.brick.current = Core.newBrick();
      this.brick.current.pos = [3, -1];
      Core.resetScore(this.score);
      this.metagameState = 'game';
      this.timers.dropTimer.reset();
      this.timers.keyRepeatTimer.reset();
    }.call(gameState));
    return gameState;
  };
  prototype.advanceRemovalAnimation = function(gs){
    var timers, animationState;
    timers = gs.timers, animationState = gs.animationState;
    if (timers.removalAnimation.expired) {
      Core.removeRows(gs.rowsToRemove, gs.arena);
      gs.rowsToRemove = [];
      return gs.metagameState = 'game';
    }
  };
  prototype.handleKeyInput = function(gs){
    var brick, arena, inputState, lresult$, ref$, key, action, amt, res$, i$, to$, i, pos, y, lresult1$, j$, to1$, x, results$ = [];
    brick = gs.brick, arena = gs.arena, inputState = gs.inputState;
    while (inputState.length) {
      lresult$ = [];
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'left':
          if (Core.canMove(brick.current, [-1, 0], arena)) {
            lresult$.push(brick.current.pos[0] -= 1);
          }
          break;
        case 'right':
          if (Core.canMove(brick.current, [1, 0], arena)) {
            lresult$.push(brick.current.pos[0] += 1);
          }
          break;
        case 'down':
          lresult$.push(gs.forceDownMode = true);
          break;
        case 'up':
        case 'cw':
          if (Core.canRotate(brick.current, 1, arena)) {
            lresult$.push(Core.rotateBrick(brick.current, 1));
          }
          break;
        case 'ccw':
          if (Core.canRotate(brick.current, -1, arena)) {
            lresult$.push(Core.rotateBrick(brick.current, -1));
          }
          break;
        case 'hard-drop':
          gs.hardDropDistance = 0;
          while (Core.canDrop(brick.current, arena)) {
            gs.hardDropDistance += 1;
            brick.current.pos[1] += 1;
          }
          gs.inputState = [];
          gs.timers.hardDropEffect.reset(1 + gs.hardDropDistance * 10);
          lresult$.push(gs.timers.dropTimer.timeToExpiry = -1);
          break;
        case 'debug-1':
        case 'debug-2':
        case 'debug-3':
        case 'debug-4':
          amt = parseInt(key.replace(/\D/g, ''));
          log("DEBUG: Destroying rows:", amt);
          res$ = [];
          for (i$ = gs.arena.height - amt, to$ = gs.arena.height - 1; i$ <= to$; ++i$) {
            i = i$;
            res$.push(i);
          }
          gs.rowsToRemove = res$;
          gs.metagameState = 'remove-lines';
          gs.flags.rowsRemovedThisFrame = true;
          lresult$.push(gs.timers.removalAnimation.reset(Core.animationTimeForRows(gs.rowsToRemove)));
          break;
        case 'debug-5':
          pos = gs.brick.current.pos;
          gs.brick.current = Core.newBrick(6);
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
          gs.rowsToRemove = [10, 12, 14];
          gs.metagameState = 'remove-lines';
          gs.flags.rowsRemovedThisFrame = true;
          lresult$.push(gs.timers.removalAnimation.reset(Core.animationTimeForRows(gs.rowsToRemove)));
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          lresult$.push(gs.forceDownMode = false);
        }
      }
      results$.push(lresult$);
    }
    return results$;
  };
  prototype.clearOneFrameFlags = function(gs){
    return gs.flags.rowsRemovedThisFrame = false;
  };
  prototype.advanceGame = function(gs){
    var brick, arena, inputState, completeRows, res$, i$, ref$, len$, ix, row;
    brick = gs.brick, arena = gs.arena, inputState = gs.inputState;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = arena.cells).length; i$ < len$; ++i$) {
      ix = i$;
      row = ref$[i$];
      if (Core.isComplete(row)) {
        res$.push(ix);
      }
    }
    completeRows = res$;
    if (completeRows.length) {
      gs.metagameState = 'remove-lines';
      gs.flags.rowsRemovedThisFrame = true;
      gs.rowsToRemove = completeRows;
      gs.timers.removalAnimation.reset(10 + Math.pow(3, gs.rowsToRemove.length));
      Core.computeScore(gs.score, gs.rowsToRemove);
      return;
    }
    if (Core.topIsReached(arena)) {
      this.revealFailScreen(gs);
      return;
    }
    if (gs.forceDownMode) {
      gs.timers.dropTimer.timeToExpiry = 0;
    }
    if (gs.timers.dropTimer.expired) {
      gs.timers.dropTimer.resetWithRemainder();
      if (Core.canDrop(brick.current, arena)) {
        brick.current.pos[1] += 1;
      } else {
        Core.copyBrickToArena(brick.current, arena);
        Core.spawnNewBrick(gs);
        gs.forceDownMode = false;
      }
    }
    return this.handleKeyInput(gs);
  };
  prototype.showStartScreen = function(gs){
    var inputState, startMenuState, ref$, key, action, results$ = [];
    inputState = gs.inputState, startMenuState = gs.startMenuState;
    while (inputState.length) {
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'up':
          results$.push(StartMenu.selectPrevItem(startMenuState));
          break;
        case 'down':
          results$.push(StartMenu.selectNextItem(startMenuState));
          break;
        case 'action-a':
        case 'confirm':
          if (startMenuState.currentState.state === 'start-game') {
            results$.push(this.beginNewGame(gs));
          }
        }
      } else if (action === 'up') {
        switch (key) {
        case 'down':
          results$.push(gs.forceDownMode = false);
        }
      }
    }
    return results$;
  };
  prototype.revealStartScreen = function(gs){
    var timers;
    timers = gs.timers;
    timers.titleRevealTimer.reset();
    return gs.metagameState = 'start-menu';
  };
  prototype.showFailScreen = function(gs, Δt){
    var inputState, failMenuState, ref$, key, action, results$ = [];
    inputState = gs.inputState, failMenuState = gs.failMenuState;
    while (inputState.length) {
      ref$ = inputState.shift(), key = ref$.key, action = ref$.action;
      if (action === 'down') {
        switch (key) {
        case 'up':
          results$.push(FailMenu.selectPrevItem(failMenuState));
          break;
        case 'down':
          results$.push(FailMenu.selectNextItem(failMenuState));
          break;
        case 'action-a':
        case 'confirm':
          log(failMenuState.currentState.state);
          if (failMenuState.currentState.state === 'restart') {
            results$.push(this.beginNewGame(gs));
          } else if (failMenuState.currentState.state === 'go-back') {
            results$.push(this.revealStartScreen(gs));
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
  prototype.revealFailScreen = function(gs){
    gs.timers.failureRevealTimer.reset();
    return gs.metagameState = 'failure';
  };
  prototype.runFrame = function(gameState, Δt){
    var metagameState;
    metagameState = gameState.metagameState;
    this.clearOneFrameFlags(gameState);
    switch (metagameState) {
    case 'failure':
      this.showFailScreen.apply(this, arguments);
      break;
    case 'game':
      this.advanceGame.apply(this, arguments);
      break;
    case 'no-game':
      this.revealStartScreen.apply(this, arguments);
      break;
    case 'start-menu':
      this.showStartScreen.apply(this, arguments);
      break;
    case 'remove-lines':
      this.advanceRemovalAnimation.apply(this, arguments);
      break;
    default:
      console.debug('Unknown metagame-state:', metagameState);
    }
    return gameState;
  };
  return TetrisGame;
}());
module.exports = {
  TetrisGame: TetrisGame
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./fail-menu":7,"./game-core":8,"./start-menu":10,"std":32}],10:[function(require,module,exports){
var ref$, id, log, wrap, menuData, limiter, primeGameState, chooseOption, selectPrevItem, selectNextItem, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, wrap = ref$.wrap;
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
out$.primeGameState = primeGameState = function(gamestate){
  return gamestate.startMenuState = {
    currentIndex: 0,
    currentState: menuData[0],
    menuData: menuData
  };
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
},{"std":32}],11:[function(require,module,exports){
var ref$, id, log, pi, rand, floor, Base, meshMaterials, ArenaCells, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, rand = ref$.rand, floor = ref$.floor;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.ArenaCells = ArenaCells = (function(superclass){
  var prototype = extend$((import$(ArenaCells, superclass).displayName = 'ArenaCells', ArenaCells), superclass).prototype, constructor = ArenaCells;
  function ArenaCells(opts, gs){
    var blockSize, gridSize, width, height, ref$, res$, i$, len$, y, row, lresult$, j$, len1$, x, cell, cube;
    blockSize = opts.blockSize, gridSize = opts.gridSize;
    ArenaCells.superclass.apply(this, arguments);
    width = gridSize * gs.arena.width;
    height = gridSize * gs.arena.height;
    this.geom.box = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    this.mats.zap = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff
    });
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
        cube = new THREE.Mesh(this.geom.box, this.mats.normal);
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
      box.material = this.mats.zap;
      results$.push(box.visible = state);
    }
    return results$;
  };
  prototype.showZapEffect = function(gs){
    var arena, rowsToRemove, timers, onOff, i$, len$, rowIx, results$ = [];
    arena = gs.arena, rowsToRemove = gs.rowsToRemove, timers = gs.timers;
    onOff = timers.removalAnimation.progress < 0.4 && !!(floor(timers.removalAnimation.currentTime * 10) % 2);
    onOff = !(floor(timers.removalAnimation.currentTime) % 2);
    for (i$ = 0, len$ = rowsToRemove.length; i$ < len$; ++i$) {
      rowIx = rowsToRemove[i$];
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
        lresult$.push(this.cells[y][x].material = meshMaterials[cell]);
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
},{"../palette":29,"./base":13,"std":32}],12:[function(require,module,exports){
var ref$, id, log, max, rand, Base, Frame, Brick, GuideLines, ArenaCells, ParticleEffect, Arena, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, max = ref$.max, rand = ref$.rand;
Base = require('./base').Base;
Frame = require('./frame').Frame;
Brick = require('./brick').Brick;
GuideLines = require('./guide-lines').GuideLines;
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
      guideLines: new GuideLines(this.opts, gs),
      arenaCells: new ArenaCells(this.opts, gs),
      thisBrick: new Brick(this.opts, gs),
      particles: new ParticleEffect(this.opts, gs)
    };
    for (name in ref$ = this.parts) {
      part = ref$[name];
      part.addTo(this.registration);
    }
  }
  prototype.jolt = function(gs){
    var rowsToRemove, timers, p, zz, jolt;
    rowsToRemove = gs.rowsToRemove, timers = gs.timers;
    p = max(0, 1 - timers.hardDropEffect.progress);
    zz = rowsToRemove.length;
    return jolt = -1 * p * (1 + zz) * this.opts.hardDropJoltAmount;
  };
  prototype.jitter = function(gs){
    var rowsToRemove, p, zz, jitter;
    rowsToRemove = gs.rowsToRemove;
    p = 1 - gs.timers.removalAnimation.progress;
    zz = rowsToRemove.length * this.opts.gridSize / 40;
    return jitter = [p * rand(-zz, zz), p * rand(-zz, zz)];
  };
  prototype.zapLines = function(gs, positionReceivingJolt){
    var arena, rowsToRemove, timers, jolt, jitter;
    arena = gs.arena, rowsToRemove = gs.rowsToRemove, timers = gs.timers;
    this.parts.arenaCells.showZapEffect(gs);
    if (gs.flags.rowsRemovedThisFrame) {
      this.parts.particles.reset();
      this.parts.particles.prepare(rowsToRemove);
      this.state.framesSinceRowsRemoved = 0;
    }
    jolt = this.jolt(gs);
    jitter = this.jitter(gs);
    positionReceivingJolt.x = jitter[0];
    positionReceivingJolt.y = jitter[1] + jolt / 10;
    return this.parts.guideLines.dance(gs.elapsedTime);
  };
  prototype.updateParticles = function(gs){
    var timers;
    timers = gs.timers;
    return this.parts.particles.update(timers.removalAnimation.progress, this.state.framesSinceRowsRemoved, gs.Δt);
  };
  prototype.update = function(gs, positionReceivingJolt){
    var arena, brick, grid, height;
    arena = gs.arena, brick = gs.brick;
    this.parts.arenaCells.updateCells(arena.cells);
    this.parts.thisBrick.displayShape(brick.current);
    grid = this.opts.gridSize;
    height = grid * gs.arena.height;
    this.parts.thisBrick.root.position.set(grid * brick.current.pos[0], height - grid * brick.current.pos[1], 0);
    this.parts.guideLines.showBeam(brick.current);
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
},{"./arena-cells":11,"./base":13,"./brick":15,"./frame":17,"./guide-lines":18,"./particle-effect":22,"std":32}],13:[function(require,module,exports){
var ref$, id, log, Base, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
out$.Base = Base = (function(){
  Base.displayName = 'Base';
  var helperMarkerSize, helperMarkerOpacity, helperMarkerGeo, redHelperMat, blueHelperMat, prototype = Base.prototype, constructor = Base;
  helperMarkerSize = 0.02;
  helperMarkerOpacity = 0.5;
  helperMarkerGeo = new THREE.CubeGeometry(helperMarkerSize, helperMarkerSize, helperMarkerSize);
  redHelperMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: helperMarkerOpacity
  });
  blueHelperMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: helperMarkerOpacity
  });
  function Base(opts, gs){
    this.opts = opts;
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.root.add(this.registration);
    this.geom = {};
    this.mats = {
      normal: new THREE.MeshNormalMaterial()
    };
  }
  prototype.addRegistrationHelper = function(){
    var start, end, dir, arrow;
    this.root.add(new THREE.Mesh(helperMarkerGeo, redHelperMat));
    this.registration.add(new THREE.Mesh(helperMarkerGeo, blueHelperMat));
    start = new THREE.Vector3(0, 0, 0);
    end = this.registration.position;
    dir = new THREE.Vector3().subVectors(end, start).normalize();
    arrow = new THREE.ArrowHelper(dir, start, start.distanceTo(end, 0x0000ff));
    this.root.add(arrow);
    this.registration.addEventListener('changed', function(){
      return console.debug('CHANGE', this, arguments);
    });
    return log('Registration helper for:', this);
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
},{"std":32}],14:[function(require,module,exports){
var ref$, id, log, sin, Base, Brick, BrickPreview, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin;
Base = require('./base').Base;
Brick = require('./brick').Brick;
out$.BrickPreview = BrickPreview = (function(superclass){
  var prettyOffset, prototype = extend$((import$(BrickPreview, superclass).displayName = 'BrickPreview', BrickPreview), superclass).prototype, constructor = BrickPreview;
  prettyOffset = {
    square: [0, 0],
    zig: [0.5, 0],
    zag: [0.5, 0],
    left: [0.5, 0],
    right: [0.5, 0],
    tee: [0.5, 0],
    tetris: [0, 0.5]
  };
  function BrickPreview(opts, gs){
    var previewScaleFactor, s;
    previewScaleFactor = opts.previewScaleFactor;
    BrickPreview.superclass.apply(this, arguments);
    s = previewScaleFactor;
    this.brick = new Brick(this.opts, gs);
    this.brick.root.scale.set(s, s, s);
    this.registration.add(this.brick.root);
  }
  prototype.displayShape = function(brick){
    var grid, ref$, x, y;
    this.brick.displayShape(brick);
    grid = this.opts.gridSize;
    ref$ = prettyOffset[brick.type], x = ref$[0], y = ref$[1];
    this.registration.position.x = (-1.5 + x) * grid;
    return this.registration.position.y = (-1.5 + y + 5) * grid;
  };
  prototype.updateWiggle = function(brick, elapsedTime){
    return this.root.rotation.y = 0.2 * sin(elapsedTime / 500);
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
},{"./base":13,"./brick":15,"std":32}],15:[function(require,module,exports){
var ref$, id, log, pi, Base, meshMaterials, Brick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.Brick = Brick = (function(superclass){
  var prettyOffset, prototype = extend$((import$(Brick, superclass).displayName = 'Brick', Brick), superclass).prototype, constructor = Brick;
  prettyOffset = {
    square: [0, 0],
    zig: [0.5, 0],
    zag: [0.5, 0],
    left: [0.5, 0],
    right: [0.5, 0],
    tee: [0.5, 0],
    tetris: [0, -0.5]
  };
  function Brick(opts, gs){
    var size, grid, width, height, res$, i$, i, cube;
    this.opts = opts;
    Brick.superclass.apply(this, arguments);
    size = this.opts.blockSize;
    grid = this.opts.gridSize;
    width = grid * gs.arena.width;
    height = grid * gs.arena.height;
    this.geom.brickBox = new THREE.BoxGeometry(size, size, size);
    this.registration.rotation.x = pi;
    this.registration.position.set(width / -2 + 0.5 * grid, -0.5 * grid, 0);
    this.brick = new THREE.Object3D;
    this.registration.add(this.brick);
    res$ = [];
    for (i$ = 0; i$ <= 3; ++i$) {
      i = i$;
      cube = new THREE.Mesh(this.geom.brickBox, this.mats.normal);
      this.brick.add(cube);
      cube.castShadow = true;
      res$.push(cube);
    }
    this.cells = res$;
  }
  prototype.displayShape = function(arg$, ix){
    var shape, grid, margin, i$, len$, y, row, lresult$, j$, len1$, x, cell, x$, results$ = [];
    shape = arg$.shape;
    ix == null && (ix = 0);
    grid = this.opts.gridSize;
    margin = (this.opts.gridSize - this.opts.blockSize) / 2;
    for (i$ = 0, len$ = shape.length; i$ < len$; ++i$) {
      y = i$;
      row = shape[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          x$ = this.cells[ix];
          x$.material = meshMaterials[cell];
          x$.position.set(x * grid + margin, y * grid + margin, 0);
          lresult$.push(ix += 1);
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
},{"../palette":29,"./base":13,"std":32}],16:[function(require,module,exports){
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
},{"./base":13,"std":32}],17:[function(require,module,exports){
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
},{"./base":13,"std":32}],18:[function(require,module,exports){
var ref$, id, log, floor, Base, lineMaterials, rowsToCols, GuideLines, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
Base = require('./base').Base;
lineMaterials = require('../palette').lineMaterials;
rowsToCols = function(rows){
  var cols, i$, to$, y, j$, to1$, x;
  cols = [];
  for (i$ = 0, to$ = rows[0].length; i$ < to$; ++i$) {
    y = i$;
    for (j$ = 0, to1$ = rows.length; j$ < to1$; ++j$) {
      x = j$;
      (cols[y] || (cols[y] = []))[x] = rows[x][y];
    }
  }
  return cols;
};
out$.GuideLines = GuideLines = (function(superclass){
  var prototype = extend$((import$(GuideLines, superclass).displayName = 'GuideLines', GuideLines), superclass).prototype, constructor = GuideLines;
  function GuideLines(opts, gs){
    var gridSize, width, height, mesh, i$, i, line, ref$;
    gridSize = opts.gridSize;
    GuideLines.superclass.apply(this, arguments);
    width = gridSize * gs.arena.width;
    height = gridSize * gs.arena.height;
    this.lines = [];
    mesh = new THREE.Geometry();
    mesh.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, height, 0));
    for (i$ = 0; i$ <= 9; ++i$) {
      i = i$;
      line = new THREE.Line(mesh, lineMaterials[i]);
      ref$ = line.position;
      ref$.x = i * gridSize;
      ref$.y = 0;
      this.lines.push(line);
      this.registration.add(line);
    }
    this.registration.position.x = width / -2 + 0.5 * gridSize;
  }
  prototype.showBeam = function(brick){
    var i$, ref$, len$, line, y, row, lresult$, j$, len1$, x, cell, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.lines).length; i$ < len$; ++i$) {
      line = ref$[i$];
      line.material = lineMaterials[0];
    }
    for (i$ = 0, len$ = (ref$ = brick.shape).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          lresult$.push(this.lines[brick.pos[0] + x].material = lineMaterials[cell]);
        }
      }
      results$.push(lresult$);
    }
    return results$;
  };
  prototype.dance = function(time){
    var i$, ref$, len$, i, line, results$ = [];
    for (i$ = 0, len$ = (ref$ = this.lines).length; i$ < len$; ++i$) {
      i = i$;
      line = ref$[i$];
      results$.push(line.material = lineMaterials[(i + floor(time / 100)) % 8]);
    }
    return results$;
  };
  return GuideLines;
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
},{"../palette":29,"./base":13,"std":32}],19:[function(require,module,exports){
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
},{"./arena":12,"./brick-preview":14,"./fail-screen":16,"./lighting":20,"./nixie":21,"./start-menu":23,"./table":24,"./title":25}],20:[function(require,module,exports){
var ref$, id, log, pi, Base, Lighting, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi;
Base = require('./base').Base;
out$.Lighting = Lighting = (function(superclass){
  var mainLightDistance, prototype = extend$((import$(Lighting, superclass).displayName = 'Lighting', Lighting), superclass).prototype, constructor = Lighting;
  mainLightDistance = 2;
  function Lighting(opts, gs){
    this.opts = opts;
    Lighting.superclass.apply(this, arguments);
    this.light = new THREE.PointLight(0xffffff, 1, mainLightDistance);
    this.light.position.set(0, 1, 0);
    this.root.add(this.light);
    this.spotlight = new THREE.SpotLight(0xffffff, 1, 50, 1);
    this.spotlight.position.set(0, 3, -1);
    this.spotlight.target.position.set(0, 0, -1);
    this.root.add(this.spotlight);
    this.ambient = new THREE.AmbientLight(0x333333);
    this.root.add(this.ambient);
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
    this.root.add(new THREE.PointLightHelper(this.light, mainLightDistance));
    return this.root.add(new THREE.SpotLightHelper(this.spotlight));
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
},{"./base":13,"std":32}],21:[function(require,module,exports){
var ref$, id, lerp, log, floor, map, split, pi, tau, Base, canvasTexture, digitTextures, res$, i$, i, NixieTube, NixieDisplay, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
ref$ = require('std'), id = ref$.id, lerp = ref$.lerp, log = ref$.log, floor = ref$.floor, map = ref$.map, split = ref$.split, pi = ref$.pi, tau = ref$.tau;
Base = require('./base').Base;
require('../geometry/capsule');
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
res$ = [];
for (i$ = 0; i$ <= 9; ++i$) {
  i = i$;
  res$.push(canvasTexture({
    text: String(i),
    width: 50,
    height: 100,
    textSize: 100
  }));
}
digitTextures = res$;
NixieTube = (function(superclass){
  var tubeRadius, tubeHeight, baseHeight, prototype = extend$((import$(NixieTube, superclass).displayName = 'NixieTube', NixieTube), superclass).prototype, constructor = NixieTube;
  tubeRadius = 0.0125;
  tubeHeight = 0.05;
  baseHeight = 0.01;
  function NixieTube(opts, gs){
    var glassMat, baseGeo, baseMat, res$, i$, ref$, len$, ix, i, quad;
    this.opts = opts;
    NixieTube.superclass.apply(this, arguments);
    glassMat = new THREE.MeshPhongMaterial({
      color: 0x222222,
      transparent: true,
      specular: 0xffffff,
      shininess: 100,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    baseGeo = new THREE.CylinderGeometry(tubeRadius * 1.1, tubeRadius * 1.1, baseHeight, 32, 0);
    baseMat = new THREE.MeshPhongMaterial({
      color: 0x444444,
      specular: 0x999999,
      shininess: 0
    });
    this.glass = new THREE.Mesh(new THREE.CapsuleGeometry(tubeRadius, 16, tubeHeight, 0), glassMat);
    this.base = new THREE.Mesh(baseGeo, baseMat);
    this.glass.position.y = tubeHeight;
    this.registration.add(this.glass);
    this.registration.add(this.base);
    res$ = [];
    for (i$ = 0, len$ = (ref$ = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).length; i$ < len$; ++i$) {
      ix = i$;
      i = ref$[i$];
      quad = this.createDigitQuad(i, ix);
      quad.position.y = tubeHeight / 2;
      quad.visible = false;
      quad.digit = i;
      quad.renderOrder = 0;
      this.registration.add(quad);
      res$.push(quad);
    }
    this.digits = res$;
  }
  prototype.showDigit = function(digit){
    return this.digits.map(function(it){
      return it.visible = it.digit === digit;
    });
  };
  prototype.createDigitQuad = function(digit, ix){
    var image, tex, geom, mat, quad;
    image = digitTextures[digit];
    tex = THREE.ImageUtils.loadTexture(image);
    geom = new THREE.PlaneBufferGeometry(0.025, 0.05);
    mat = new THREE.MeshPhongMaterial({
      map: tex,
      alphaMap: tex,
      transparent: true,
      emissive: 0xff9944
    });
    return quad = new THREE.Mesh(geom, mat);
  };
  return NixieTube;
}(Base));
out$.NixieDisplay = NixieDisplay = (function(superclass){
  var prototype = extend$((import$(NixieDisplay, superclass).displayName = 'NixieDisplay', NixieDisplay), superclass).prototype, constructor = NixieDisplay;
  function NixieDisplay(opts, gs){
    var res$, i$, to$, i, tube;
    this.opts = opts;
    NixieDisplay.superclass.apply(this, arguments);
    this.count = 5;
    this.state = {
      lastSeenNumber: 0
    };
    res$ = [];
    for (i$ = 0, to$ = this.count; i$ < to$; ++i$) {
      i = i$;
      tube = new NixieTube(this.opts, gs);
      tube.position.x = i * this.opts.blockSize;
      this.registration.add(tube.root);
      res$.push(tube);
    }
    this.tubes = res$;
    this.registration.position.z = -this.opts.scoreDistanceFromEdge;
  }
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
},{"../geometry/capsule":27,"./base":13,"std":32}],22:[function(require,module,exports){
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
},{"../palette":29,"./base":13,"std":32}],23:[function(require,module,exports){
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
    for (i$ = 0, len$ = (ref$ = gs.startMenuState.menuData).length; i$ < len$; ++i$) {
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
    var timers, titleRevealTimer;
    timers = gs.timers, titleRevealTimer = timers.titleRevealTimer;
    this.title.reveal(titleRevealTimer.progress);
    return this.updateSelection(gs.startMenuState, gs.elapsedTime);
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
},{"./base":13,"./title":25,"std":32}],24:[function(require,module,exports){
var ref$, id, log, Base, meshMaterials, Table, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.Table = Table = (function(superclass){
  var repeat, prototype = extend$((import$(Table, superclass).displayName = 'Table', Table), superclass).prototype, constructor = Table;
  repeat = 2;
  function Table(opts, gs){
    var ref$, width, depth, thickness, map, nrm, tableMat, tableGeo;
    this.opts = opts;
    Table.superclass.apply(this, arguments);
    ref$ = this.opts.deskSize, width = ref$[0], depth = ref$[1];
    thickness = 0.03;
    map = THREE.ImageUtils.loadTexture('assets/wood.diff.jpg');
    map.wrapT = map.wrapS = THREE.RepeatWrapping;
    map.repeat.set(repeat, repeat);
    nrm = THREE.ImageUtils.loadTexture('assets/wood.nrm.jpg');
    nrm.wrapT = nrm.wrapS = THREE.RepeatWrapping;
    nrm.repeat.set(repeat, repeat);
    tableMat = new THREE.MeshPhongMaterial({
      map: map,
      normalMap: nrm,
      normalScale: new THREE.Vector2(0.1, 0.0)
    });
    tableGeo = new THREE.BoxGeometry(width, thickness, depth);
    this.table = new THREE.Mesh(tableGeo, tableMat);
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
},{"../palette":29,"./base":13,"std":32}],25:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, min, max, Ease, Base, meshMaterials, Title, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, min = ref$.min, max = ref$.max;
Ease = require('std').Ease;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.Title = Title = (function(superclass){
  var blockText, prototype = extend$((import$(Title, superclass).displayName = 'Title', Title), superclass).prototype, constructor = Title;
  blockText = {
    tetris: [[1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 0, 5, 6, 6, 6], [0, 1, 0, 2, 0, 0, 0, 3, 0, 4, 0, 4, 5, 6, 0, 0], [0, 1, 0, 2, 2, 0, 0, 3, 0, 4, 4, 0, 5, 6, 6, 6], [0, 1, 0, 2, 0, 0, 0, 3, 0, 4, 0, 4, 5, 0, 0, 6], [0, 1, 0, 2, 2, 2, 0, 3, 0, 4, 0, 4, 5, 6, 6, 6]],
    vrt: [[1, 0, 1, 4, 4, 6, 6, 6], [1, 0, 1, 4, 0, 4, 6, 0], [1, 0, 1, 4, 4, 0, 6, 0], [1, 0, 1, 4, 0, 4, 6, 0], [0, 1, 0, 4, 0, 4, 6, 0]],
    ghost: [[1, 1, 1, 2, 0, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5], [1, 0, 0, 2, 0, 2, 3, 0, 3, 4, 0, 0, 0, 5, 0], [1, 0, 0, 2, 2, 2, 3, 0, 3, 4, 4, 4, 0, 5, 0], [1, 0, 1, 2, 0, 2, 3, 0, 3, 0, 0, 4, 0, 5, 0], [1, 1, 1, 2, 0, 2, 3, 3, 3, 4, 4, 4, 0, 5, 0]]
  };
  function Title(opts, gs){
    var blockSize, gridSize, text, margin, height, i$, len$, y, row, j$, len1$, x, cell, box, bbox;
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
    this.geom.box = new THREE.BoxGeometry(blockSize * 0.9, blockSize * 0.9, blockSize * 0.9);
    for (i$ = 0, len$ = text.length; i$ < len$; ++i$) {
      y = i$;
      row = text[i$];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          box = new THREE.Mesh(this.geom.box, meshMaterials[cell]);
          box.position.set(gridSize * x + margin, gridSize * (text.length / 2 - y) + margin, gridSize / -2);
          this.word.add(box);
        }
      }
    }
    bbox = new THREE.BoundingBoxHelper(this.word, 0xff0000);
    bbox.update();
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
},{"../palette":29,"./base":13,"std":32}],26:[function(require,module,exports){
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
},{"std":32}],27:[function(require,module,exports){
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
  THREE.GeometryUtils.merge(halfSphere, tube);
  return halfSphere;
};
},{"std":32}],28:[function(require,module,exports){
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
    var arena, width, height, name, ref$, part, trackballTarget, geo, mat;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    log("Renderer::new");
    this.scene = new SceneManager(this.opts);
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
    this.parts.nextBrick.root.position.set(-this.opts.deskSize[1] / 2, 0, -this.opts.previewDistanceFromEdge);
    this.parts.arena.root.position.set(0, 0, -this.opts.arenaDistanceFromEdge);
    trackballTarget = new THREE.Object3D;
    this.scene.add(trackballTarget);
    trackballTarget.position.z = -this.opts.cameraDistanceFromEdge;
    this.trackball = new THREE.TrackballControls(this.scene.camera, trackballTarget);
    this.scene.controls.resetSensor();
    this.scene.registration.position.set(0, -this.opts.cameraElevation, -this.opts.cameraDistanceFromEdge);
    this.scene.showHelpers();
    return;
    geo = new THREE.CapsuleGeometry(0.1, 16, 0.2, 0);
    mat = new THREE.MeshPhongMaterial({
      color: 0x222222,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    this.scene.add(this.ball = new THREE.Mesh(geo, mat));
    this.ball.position.y = 0.5;
    this.ball.position.z = -0.5;
  }
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
      rows = gs.rowsToRemove.length;
      p = gs.timers.removalAnimation.progress;
      gs.slowdown = 1 + Ease.expIn(p, 10, 0);
      this.parts.arena.zapLines(gs, this.jitter.position);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
      this.parts.score.runToNumber(gs.timers.removalAnimation.progress, gs.score.points);
      break;
    case 'game':
      gs.slowdown = 1;
      this.parts.arena.update(gs, this.jitter.position);
      this.parts.nextBrick.displayShape(gs.brick.next);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
      this.parts.score.setNumber(gs.score.points);
      break;
    case 'start-menu':
      this.parts.startMenu.update(gs);
      break;
    case 'pause-menu':
      this.parts.pauseMenu.update(gs);
      break;
    case 'failure':
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
},{"../../lib/trackball-controls.js":5,"./components":19,"./debug-camera":26,"./palette":29,"./scene-manager":30,"std":32,"three-js-vr-extensions":4}],29:[function(require,module,exports){
var THREE, ref$, log, map, pluck, neutral, red, orange, green, magenta, blue, brown, yellow, cyan, colorOrder, tileColors, specColors, tileNormalMap, tileNormalAdjust, meshMaterials, i, color, transparentTileMaterials, lineMaterials, Palette, out$ = typeof exports != 'undefined' && exports || this;
THREE = require('three-js-vr-extensions');
ref$ = require('std'), log = ref$.log, map = ref$.map;
pluck = curry$(function(p, o){
  return o[p];
});
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
tileNormalMap = THREE.ImageUtils.loadTexture('/assets/tile.nrm.png');
tileNormalAdjust = new THREE.Vector2(1, 1);
out$.meshMaterials = meshMaterials = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = tileColors).length; i$ < len$; ++i$) {
    i = i$;
    color = ref$[i$];
    results$.push(new THREE.MeshPhongMaterial({
      metal: true,
      color: color,
      specular: specColors[i],
      shininess: 100,
      normalMap: tileNormalMap,
      normalScale: tileNormalAdjust
    }));
  }
  return results$;
}());
out$.transparentTileMaterials = transparentTileMaterials = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = tileColors).length; i$ < len$; ++i$) {
    i = i$;
    color = ref$[i$];
    results$.push(new THREE.MeshPhongMaterial({
      metal: true,
      color: color,
      transparent: true,
      opacity: 0.5,
      specular: specColors[i],
      shininess: 100,
      normalMap: tileNormalMap,
      normalScale: tileNormalAdjust
    }));
  }
  return results$;
}());
out$.lineMaterials = lineMaterials = (function(){
  var i$, ref$, len$, results$ = [];
  for (i$ = 0, len$ = (ref$ = tileColors).length; i$ < len$; ++i$) {
    color = ref$[i$];
    results$.push(new THREE.LineBasicMaterial({
      color: color
    }));
  }
  return results$;
}());
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
  meshMaterials: meshMaterials,
  lineMaterials: lineMaterials
};
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
},{"std":32,"three-js-vr-extensions":4}],30:[function(require,module,exports){
var ref$, id, log, THREE, SceneManager, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
THREE = require('three-js-vr-extensions');
out$.SceneManager = SceneManager = (function(){
  SceneManager.displayName = 'SceneManager';
  var helperMarkerSize, helperMarkerOpacity, helperMarkerGeo, redHelperMat, blueHelperMat, prototype = SceneManager.prototype, constructor = SceneManager;
  helperMarkerSize = 0.02;
  helperMarkerOpacity = 0.3;
  helperMarkerGeo = new THREE.CubeGeometry(helperMarkerSize, helperMarkerSize, helperMarkerSize);
  redHelperMat = new THREE.MeshBasicMaterial({
    color: 0xff00ff,
    transparent: true,
    opacity: helperMarkerOpacity
  });
  blueHelperMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: helperMarkerOpacity
  });
  function SceneManager(opts){
    var aspect;
    this.opts = opts;
    this.resize = bind$(this, 'resize', prototype);
    this.zeroSensor = bind$(this, 'zeroSensor', prototype);
    this.goFullscreen = bind$(this, 'goFullscreen', prototype);
    this.detectVR = bind$(this, 'detectVR', prototype);
    aspect = window.innerWidth / window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.001, 1000);
    this.controls = new THREE.VRControls(this.camera, this.detectVR);
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(window.innerWidth - 1, window.innerHeight - 1);
    window.addEventListener('keydown', this.zeroSensor, true);
    window.addEventListener('resize', this.resize, false);
    document.body.addEventListener('dblclick', this.goFullscreen);
    this.state = {
      vrMode: true
    };
    this.scene.add(this.root);
    this.root.add(this.registration);
  }
  prototype.detectVR = function(){
    log(this);
    return this.state.vrMode = false;
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
    return this.effect.setFullScreen(true);
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
    return this.effect.setSize(window.innerWidth, window.innerHeight);
  };
  prototype.update = function(){
    return this.controls.update();
  };
  prototype.render = function(){
    return this.effect.render(this.scene, this.camera);
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
},{"std":32,"three-js-vr-extensions":4}],31:[function(require,module,exports){
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
},{"std":32}],32:[function(require,module,exports){
var id, log, flip, delay, floor, random, rand, randInt, randomFrom, addV2, filter, pi, tau, pow, sin, cos, min, max, lerp, map, split, join, unlines, wrap, limit, raf, that, Ease, out$ = typeof exports != 'undefined' && exports || this;
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
},{"./easing":31}],33:[function(require,module,exports){
var ref$, id, log, unlines, template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, unlines = ref$.unlines;
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
    return "score - " + template.score.apply(this.score) + "\nlines - " + this.lines + "\n\n meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n keys - " + template.keys.apply(this.inputState) + "\n drop - " + (this.forceDownMode ? 'soft' : 'auto');
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
    return "   GAME OVER\n\n     Score\n\n  Single - " + this.score.singles + "\n  Double - " + this.score.doubles + "\n  Triple - " + this.score.triples + "\n  Tetris - " + this.score.tetris + "\n\nTotal Lines: " + this.score.lines + "\n\n" + template.menuItems.apply(this.failMenuState);
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
      return this.dbo.innerHTML = template.startMenu.apply(state.startMenuState);
    case 'remove-lines':
      return this.dbo.innerHTML = template.normal.apply(state);
    default:
      return this.dbo.innerHTML = "Unknown metagame state: " + state.metagameState;
    }
  };
  return DebugOutput;
}());
},{"std":32}],34:[function(require,module,exports){
var ref$, id, log, raf, FrameDriver, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, raf = ref$.raf;
out$.FrameDriver = FrameDriver = (function(){
  FrameDriver.displayName = 'FrameDriver';
  var prototype = FrameDriver.prototype, constructor = FrameDriver;
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
  }
  prototype.frame = function(){
    var now, Δt;
    if (this.state.running) {
      raf(this.frame);
    }
    now = Date.now() - this.state.zero;
    Δt = now - this.state.time;
    this.state.time = now;
    this.state.frame = this.state.frame + 1;
    this.state.Δt = Δt;
    return this.onFrame(Δt, this.state.time, this.state.frame);
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
  return FrameDriver;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
},{"std":32}],35:[function(require,module,exports){
var ref$, id, log, rand, Timer, GameState, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, rand = ref$.rand;
Timer = require('./timer').Timer;
out$.GameState = GameState = (function(){
  GameState.displayName = 'GameState';
  var defaults, prototype = GameState.prototype, constructor = GameState;
  defaults = {
    metagameState: 'no-game',
    inputState: [],
    forceDownMode: false,
    elapsedTime: 0,
    elapsedFrames: 0,
    rowsToRemove: [],
    slowdown: 1,
    flags: {
      rowsRemovedThisFrame: false
    },
    score: {
      points: 0,
      lines: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      tetris: 0
    },
    brick: {
      next: void 8,
      current: void 8
    },
    timers: {
      dropTimer: null,
      forceDropWaitTiemr: null,
      keyRepeatTimer: null,
      removalAnimation: null,
      titleRevealTimer: null,
      failureRevealTimer: null
    },
    options: {
      tileWidth: 10,
      tileHeight: 18,
      tileSize: 20,
      hardDropJoltAmount: 0.35,
      dropSpeed: 300,
      forceDropWaitTime: 100,
      removalAnimationTime: 500,
      hardDropEffectTime: 100,
      keyRepeatTime: 100,
      titleRevealTime: 4000
    },
    arena: {
      cells: [[]],
      width: 0,
      height: 0
    }
  };
  function GameState(options){
    import$(this, defaults);
    import$(this.options, options);
    this.timers.dropTimer = new Timer(this.options.dropSpeed);
    this.timers.forceDropWaitTimer = new Timer(this.options.forceDropWaitTime);
    this.timers.keyRepeatTimer = new Timer(this.options.keyRepeatTime);
    this.timers.removalAnimation = new Timer(this.options.removalAnimationTime);
    this.timers.hardDropEffect = new Timer(this.options.hardDropEffectTime);
    this.timers.titleRevealTimer = new Timer(this.options.titleRevealTime);
    this.timers.failureRevealTimer = new Timer(this.options.titleRevealTime);
    this.arena = constructor.newArena(this.options.tileWidth, this.options.tileHeight);
    this.timers.hardDropEffect.expire();
  }
  GameState.newArena = function(width, height){
    var row, cell;
    return {
      cells: (function(){
        var i$, to$, lresult$, j$, to1$, results$ = [];
        for (i$ = 0, to$ = height; i$ < to$; ++i$) {
          row = i$;
          lresult$ = [];
          for (j$ = 0, to1$ = width; j$ < to1$; ++j$) {
            cell = j$;
            lresult$.push(0);
          }
          results$.push(lresult$);
        }
        return results$;
      }()),
      width: width,
      height: height
    };
  };
  return GameState;
}());
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./timer":37,"std":32}],36:[function(require,module,exports){
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
},{"./timer":37,"std":32}],37:[function(require,module,exports){
var ref$, id, log, floor, asciiProgressBar, Timer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
asciiProgressBar = curry$(function(len, val, max){
  var valueChars, emptyChars;
  val = val > max ? max : val;
  valueChars = floor(len * val / max);
  emptyChars = len - valueChars;
  return repeatString$("▒", valueChars) + repeatString$("-", emptyChars);
});
out$.Timer = Timer = (function(){
  Timer.displayName = 'Timer';
  var allTimers, progbar, ref$, TIMER_ACTIVE, TIMER_EXPIRED, prototype = Timer.prototype, constructor = Timer;
  allTimers = [];
  progbar = asciiProgressBar(21);
  ref$ = [0, 1], TIMER_ACTIVE = ref$[0], TIMER_EXPIRED = ref$[1];
  function Timer(targetTime, begin){
    this.targetTime = targetTime != null ? targetTime : 1000;
    begin == null && (begin = false);
    if (this.targetTime === 0) {
      throw "Timer::reset - target time must be non-zero";
    }
    this.currentTime = 0;
    this.state = begin ? TIMER_ACTIVE : TIMER_EXPIRED;
    this.active = begin;
    this.expired = !begin;
    allTimers.push(this);
  }
  Object.defineProperty(prototype, 'active', {
    get: function(){
      return this.state === TIMER_ACTIVE;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'expired', {
    get: function(){
      return this.state === TIMER_EXPIRED;
    },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(prototype, 'progress', {
    get: function(){
      return this.currentTime / this.targetTime;
    },
    configurable: true,
    enumerable: true
  });
  prototype.expire = function(){
    this.currentTime = this.targetTime;
    return this.state = TIMER_EXPIRED;
  };
  Object.defineProperty(prototype, 'timeToExpiry', {
    get: function(){
      return this.targetTime - this.currentTime;
    },
    set: function(expTime){
      this.currentTime = this.targetTime - expTime;
    },
    configurable: true,
    enumerable: true
  });
  prototype.update = function(Δt){
    if (this.active) {
      this.currentTime += Δt;
      if (this.currentTime >= this.targetTime) {
        return this.state = TIMER_EXPIRED;
      }
    }
  };
  prototype.reset = function(time){
    time == null && (time = this.targetTime);
    if (time === 0) {
      throw "Timer::reset - target time must be non-zero";
    }
    this.currentTime = 0;
    this.targetTime = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.resetWithRemainder = function(time){
    time == null && (time = this.targetTime);
    if (time === 0) {
      throw "Timer::reset - target time must be non-zero";
    }
    this.currentTime = this.currentTime - time;
    this.targetTime = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.stop = function(){
    this.currentTime = 0;
    return this.state = TIMER_EXPIRED;
  };
  prototype.destroy = function(){
    return allTimers.splice(allTimers.indexOf(this), 1);
  };
  prototype.runFor = function(time){
    this.timeToExpiry = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.toString = function(){
    return "TIMER: " + this.targetTime + "\nSTATE: " + this.state + " (" + this.active + "|" + this.expired + ")\n" + progbar(this.currentTime, this.targetTime);
  };
  Timer.updateAll = function(Δt){
    return allTimers.map(function(it){
      return it.update(Δt);
    });
  };
  return Timer;
}());
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
},{"std":32}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJDb250cm9scy5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJFZmZlY3QuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi90cmFja2JhbGwtY29udHJvbHMuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZmFpbC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9zdGFydC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2Jhc2UubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9icmljay5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWlsLXNjcmVlbi5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mcmFtZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9ndWlkZS1saW5lcy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9saWdodGluZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9uaXhpZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9wYXJ0aWNsZS1lZmZlY3QubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvc3RhcnQtbWVudS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90aXRsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvZGVidWctY2FtZXJhLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9nZW9tZXRyeS9jYXBzdWxlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvcGFsZXR0ZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvc2NlbmUtbWFuYWdlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2Vhc2luZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9kZWJ1Zy1vdXRwdXQubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3V0aWxzL2ZyYW1lLWRyaXZlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvZ2FtZS1zdGF0ZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvaW5wdXQtaGFuZGxlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGltZXIsIEdhbWVTdGF0ZSwgRGVidWdPdXRwdXQsIFRldHJpc0dhbWUsIFRocmVlSnNSZW5kZXJlcjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIGRlbGF5ID0gcmVmJC5kZWxheTtcbkZyYW1lRHJpdmVyID0gcmVxdWlyZSgnLi91dGlscy9mcmFtZS1kcml2ZXInKS5GcmFtZURyaXZlcjtcbklucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vdXRpbHMvaW5wdXQtaGFuZGxlcicpLklucHV0SGFuZGxlcjtcblRpbWVyID0gcmVxdWlyZSgnLi91dGlscy90aW1lcicpLlRpbWVyO1xuR2FtZVN0YXRlID0gcmVxdWlyZSgnLi91dGlscy9nYW1lLXN0YXRlJykuR2FtZVN0YXRlO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL3V0aWxzL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLlRldHJpc0dhbWU7XG5UaHJlZUpzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuVGhyZWVKc1JlbmRlcmVyO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBnYW1lT3B0cywgcmVuZGVyT3B0cywgaW5wdXRIYW5kbGVyLCBnYW1lU3RhdGUsIHRldHJpc0dhbWUsIHJlbmRlcmVyLCBkZWJ1Z091dHB1dCwgdGVzdEVhc2luZywgZnJhbWVEcml2ZXI7XG4gIGdhbWVPcHRzID0ge1xuICAgIHRpbGVXaWR0aDogMTAsXG4gICAgdGlsZUhlaWdodDogMjAsXG4gICAgdGltZUZhY3RvcjogMVxuICB9O1xuICByZW5kZXJPcHRzID0ge1xuICAgIHVuaXRzUGVyTWV0ZXI6IDEsXG4gICAgZ3JpZFNpemU6IDAuMDcsXG4gICAgYmxvY2tTaXplOiAwLjA2OSxcbiAgICBkZXNrU2l6ZTogWzEuNiwgMC44XSxcbiAgICBhcmVuYURpc3RhbmNlRnJvbUVkZ2U6IDAuNSxcbiAgICBwcmV2aWV3RGlzdGFuY2VGcm9tRWRnZTogMC4yLFxuICAgIHByZXZpZXdTY2FsZUZhY3RvcjogMC41LFxuICAgIGNhbWVyYURpc3RhbmNlRnJvbUVkZ2U6IDAuMixcbiAgICBjYW1lcmFFbGV2YXRpb246IDAuNSxcbiAgICBoYXJkRHJvcEpvbHRBbW91bnQ6IDAuMDMsXG4gICAgemFwUGFydGljbGVTaXplOiAwLjAwOCxcbiAgICBzY29yZURpc3RhbmNlRnJvbUVkZ2U6IDAuMTVcbiAgfTtcbiAgaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbiAgZ2FtZVN0YXRlID0gbmV3IEdhbWVTdGF0ZShnYW1lT3B0cyk7XG4gIHRldHJpc0dhbWUgPSBuZXcgVGV0cmlzR2FtZShnYW1lU3RhdGUpO1xuICByZW5kZXJlciA9IG5ldyBUaHJlZUpzUmVuZGVyZXIocmVuZGVyT3B0cywgZ2FtZVN0YXRlKTtcbiAgcmVuZGVyZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gIGRlYnVnT3V0cHV0ID0gbmV3IERlYnVnT3V0cHV0O1xuICBJbnB1dEhhbmRsZXIub24oMTkyLCBmdW5jdGlvbigpe1xuICAgIGlmIChmcmFtZURyaXZlci5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RhcnQoKTtcbiAgICB9XG4gIH0pO1xuICB0ZXN0RWFzaW5nID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgRWFzZSwgaSQsIHJlZiQsIGxlbiQsIGVsLCBlYXNlTmFtZSwgZWFzZSwgbHJlc3VsdCQsIGNudiwgY3R4LCBpLCBwLCByZXN1bHRzJCA9IFtdO1xuICAgIEVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjYW52YXMnKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGVsID0gcmVmJFtpJF07XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cbiAgICBmb3IgKGVhc2VOYW1lIGluIEVhc2UpIHtcbiAgICAgIGVhc2UgPSBFYXNlW2Vhc2VOYW1lXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBjbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNudi53aWR0aCA9IDIwMDtcbiAgICAgIGNudi5oZWlnaHQgPSAyMDA7XG4gICAgICBjbnYuc3R5bGUuYmFja2dyb3VuZCA9ICd3aGl0ZSc7XG4gICAgICBjbnYuc3R5bGUuYm9yZGVyTGVmdCA9IFwiM3B4IHNvbGlkIGJsYWNrXCI7XG4gICAgICBjdHggPSBjbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY252KTtcbiAgICAgIGN0eC5mb250ID0gXCIxNHB4IG1vbm9zcGFjZVwiO1xuICAgICAgY3R4LmZpbGxUZXh0KGVhc2VOYW1lLCAyLCAxNiwgMjAwKTtcbiAgICAgIGZvciAoaSQgPSAwOyBpJCA8PSAxMDA7ICsraSQpIHtcbiAgICAgICAgaSA9IGkkO1xuICAgICAgICBwID0gaSAvIDEwMDtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdHguZmlsbFJlY3QoMiAqIGksIDIwMCAtIGVhc2UocCwgMCwgMjAwKSwgMiwgMikpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgZnJhbWVEcml2ZXIgPSBuZXcgRnJhbWVEcml2ZXIoZnVuY3Rpb24ozpR0LCB0aW1lLCBmcmFtZSl7XG4gICAgZ2FtZVN0YXRlLs6UdCA9IM6UdCAvIGdhbWVPcHRzLnRpbWVGYWN0b3IgLyBnYW1lU3RhdGUuc2xvd2Rvd247XG4gICAgZ2FtZVN0YXRlLmVsYXBzZWRUaW1lID0gdGltZSAvIGdhbWVPcHRzLnRpbWVGYWN0b3I7XG4gICAgZ2FtZVN0YXRlLmVsYXBzZWRGcmFtZXMgPSBmcmFtZTtcbiAgICBnYW1lU3RhdGUuaW5wdXRTdGF0ZSA9IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKTtcbiAgICBUaW1lci51cGRhdGVBbGwoZ2FtZVN0YXRlLs6UdCk7XG4gICAgZ2FtZVN0YXRlID0gdGV0cmlzR2FtZS5ydW5GcmFtZShnYW1lU3RhdGUsIGdhbWVTdGF0ZS7OlHQpO1xuICAgIHJlbmRlcmVyLnJlbmRlcihnYW1lU3RhdGUsIHJlbmRlck9wdHMpO1xuICAgIGlmIChkZWJ1Z091dHB1dCkge1xuICAgICAgcmV0dXJuIGRlYnVnT3V0cHV0LnJlbmRlcihnYW1lU3RhdGUpO1xuICAgIH1cbiAgfSk7XG4gIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gIHJldHVybiB0ZXRyaXNHYW1lLmJlZ2luTmV3R2FtZShnYW1lU3RhdGUpO1xufSk7IiwiLyoqXG4gKiBAYXV0aG9yIGRtYXJjb3MgLyBodHRwczovL2dpdGh1Yi5jb20vZG1hcmNvc1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICovXG5cblRIUkVFLlZSQ29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgb25FcnJvciApIHtcblxuXHR2YXIgc2NvcGUgPSB0aGlzO1xuXHR2YXIgdnJJbnB1dHMgPSBbXTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJJbnZhbGlkRGV2aWNlcyggZGV2aWNlcyApIHtcblxuXHRcdC8vIEV4Y2x1ZGUgQ2FyZGJvYXJkIHBvc2l0aW9uIHNlbnNvciBpZiBPY3VsdXMgZXhpc3RzLlxuXHRcdHZhciBvY3VsdXNEZXZpY2VzID0gZGV2aWNlcy5maWx0ZXIoIGZ1bmN0aW9uICggZGV2aWNlICkge1xuXHRcdFx0cmV0dXJuIGRldmljZS5kZXZpY2VOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignb2N1bHVzJykgIT09IC0xO1xuXHRcdH0gKTtcblxuXHRcdGlmICggb2N1bHVzRGV2aWNlcy5sZW5ndGggPj0gMSApIHtcblx0XHRcdHJldHVybiBkZXZpY2VzLmZpbHRlciggZnVuY3Rpb24gKCBkZXZpY2UgKSB7XG5cdFx0XHRcdHJldHVybiBkZXZpY2UuZGV2aWNlTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2NhcmRib2FyZCcpID09PSAtMTtcblx0XHRcdH0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGRldmljZXM7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ290VlJEZXZpY2VzKCBkZXZpY2VzICkge1xuXHRcdGRldmljZXMgPSBmaWx0ZXJJbnZhbGlkRGV2aWNlcyggZGV2aWNlcyApO1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0aWYgKCBkZXZpY2VzWyBpIF0gaW5zdGFuY2VvZiBQb3NpdGlvblNlbnNvclZSRGV2aWNlICkge1xuXHRcdFx0XHR2cklucHV0cy5wdXNoKCBkZXZpY2VzWyBpIF0gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCAnSE1EIG5vdCBhdmFpbGFibGUnICk7XG5cdH1cblxuXHRpZiAoIG5hdmlnYXRvci5nZXRWUkRldmljZXMgKSB7XG5cdFx0bmF2aWdhdG9yLmdldFZSRGV2aWNlcygpLnRoZW4oIGdvdFZSRGV2aWNlcyApO1xuXHR9XG5cblx0Ly8gdGhlIFJpZnQgU0RLIHJldHVybnMgdGhlIHBvc2l0aW9uIGluIG1ldGVyc1xuXHQvLyB0aGlzIHNjYWxlIGZhY3RvciBhbGxvd3MgdGhlIHVzZXIgdG8gZGVmaW5lIGhvdyBtZXRlcnNcblx0Ly8gYXJlIGNvbnZlcnRlZCB0byBzY2VuZSB1bml0cy5cblxuXHR0aGlzLnNjYWxlID0gMTtcblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdnJJbnB1dHMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0dmFyIHZySW5wdXQgPSB2cklucHV0c1sgaSBdO1xuXHRcdFx0dmFyIHN0YXRlID0gdnJJbnB1dC5nZXRTdGF0ZSgpO1xuXG5cdFx0XHRpZiAoIHN0YXRlLm9yaWVudGF0aW9uICE9PSBudWxsICkge1xuXHRcdFx0XHRvYmplY3QucXVhdGVybmlvbi5jb3B5KCBzdGF0ZS5vcmllbnRhdGlvbiApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHN0YXRlLnBvc2l0aW9uICE9PSBudWxsICkge1xuXHRcdFx0XHRvYmplY3QucG9zaXRpb24uY29weSggc3RhdGUucG9zaXRpb24gKS5tdWx0aXBseVNjYWxhciggc2NvcGUuc2NhbGUgKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dGhpcy5yZXNldFNlbnNvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2cklucHV0cy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHR2YXIgdnJJbnB1dCA9IHZySW5wdXRzWyBpIF07XG5cblx0XHRcdGlmICggdnJJbnB1dC5yZXNldFNlbnNvciAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR2cklucHV0LnJlc2V0U2Vuc29yKCk7XG5cdFx0XHR9IGVsc2UgaWYgKCB2cklucHV0Lnplcm9TZW5zb3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dnJJbnB1dC56ZXJvU2Vuc29yKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuemVyb1NlbnNvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRUSFJFRS53YXJuKCAnVEhSRUUuVlJDb250cm9sczogLnplcm9TZW5zb3IoKSBpcyBub3cgLnJlc2V0U2Vuc29yKCkuJyApO1xuXHRcdHRoaXMucmVzZXRTZW5zb3IoKTtcblx0fTtcblxufTtcblxuIiwiXG4vKipcbiAqIEBhdXRob3IgZG1hcmNvcyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9kbWFyY29zXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKlxuICogV2ViVlIgU3BlYzogaHR0cDovL21venZyLmdpdGh1Yi5pby93ZWJ2ci1zcGVjL3dlYnZyLmh0bWxcbiAqXG4gKiBGaXJlZm94OiBodHRwOi8vbW96dnIuY29tL2Rvd25sb2Fkcy9cbiAqIENocm9taXVtOiBodHRwczovL2RyaXZlLmdvb2dsZS5jb20vZm9sZGVydmlldz9pZD0wQnp1ZEx0MjJCcUdSYlc5V1RITXRPV016TmpRJnVzcD1zaGFyaW5nI2xpc3RcbiAqXG4gKi9cblxuVEhSRUUuVlJFZmZlY3QgPSBmdW5jdGlvbiAoIHJlbmRlcmVyLCBvbkVycm9yICkge1xuXG5cdHZhciB2ckhNRDtcblx0dmFyIGV5ZVRyYW5zbGF0aW9uTCwgZXllRk9WTDtcblx0dmFyIGV5ZVRyYW5zbGF0aW9uUiwgZXllRk9WUjtcblxuXHRmdW5jdGlvbiBnb3RWUkRldmljZXMoIGRldmljZXMgKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZGV2aWNlcy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHRpZiAoIGRldmljZXNbIGkgXSBpbnN0YW5jZW9mIEhNRFZSRGV2aWNlICkge1xuXHRcdFx0XHR2ckhNRCA9IGRldmljZXNbIGkgXTtcblxuXHRcdFx0XHRpZiAoIHZySE1ELmdldEV5ZVBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHR2YXIgZXllUGFyYW1zTCA9IHZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdsZWZ0JyApO1xuXHRcdFx0XHRcdHZhciBleWVQYXJhbXNSID0gdnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ3JpZ2h0JyApO1xuXG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25MID0gZXllUGFyYW1zTC5leWVUcmFuc2xhdGlvbjtcblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvblIgPSBleWVQYXJhbXNSLmV5ZVRyYW5zbGF0aW9uO1xuXHRcdFx0XHRcdGV5ZUZPVkwgPSBleWVQYXJhbXNMLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG5cdFx0XHRcdFx0ZXllRk9WUiA9IGV5ZVBhcmFtc1IucmVjb21tZW5kZWRGaWVsZE9mVmlldztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBUaGlzIGlzIGFuIG9sZGVyIGNvZGUgcGF0aCBhbmQgbm90IHNwZWMgY29tcGxpYW50LlxuXHRcdFx0XHRcdC8vIEl0IHNob3VsZCBiZSByZW1vdmVkIGF0IHNvbWUgcG9pbnQgaW4gdGhlIG5lYXIgZnV0dXJlLlxuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uTCA9IHZySE1ELmdldEV5ZVRyYW5zbGF0aW9uKCAnbGVmdCcgKTtcblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvblIgPSB2ckhNRC5nZXRFeWVUcmFuc2xhdGlvbiggJ3JpZ2h0JyApO1xuXHRcdFx0XHRcdGV5ZUZPVkwgPSB2ckhNRC5nZXRSZWNvbW1lbmRlZEV5ZUZpZWxkT2ZWaWV3KCAnbGVmdCcgKTtcblx0XHRcdFx0XHRleWVGT1ZSID0gdnJITUQuZ2V0UmVjb21tZW5kZWRFeWVGaWVsZE9mVmlldyggJ3JpZ2h0JyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrOyAvLyBXZSBrZWVwIHRoZSBmaXJzdCB3ZSBlbmNvdW50ZXJcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHZySE1EID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCAnSE1EIG5vdCBhdmFpbGFibGUnICk7XG5cdFx0fVxuXG5cdH1cblxuXHRpZiAoIG5hdmlnYXRvci5nZXRWUkRldmljZXMgKSB7XG5cdFx0bmF2aWdhdG9yLmdldFZSRGV2aWNlcygpLnRoZW4oIGdvdFZSRGV2aWNlcyApO1xuXHR9XG5cblx0Ly9cblxuXHR0aGlzLnNjYWxlID0gMTtcblx0dGhpcy5zZXRTaXplID0gZnVuY3Rpb24oIHdpZHRoLCBoZWlnaHQgKSB7XG5cdFx0cmVuZGVyZXIuc2V0U2l6ZSggd2lkdGgsIGhlaWdodCApO1xuXHR9O1xuXG5cdC8vIGZ1bGxzY3JlZW5cblxuXHR2YXIgaXNGdWxsc2NyZWVuID0gZmFsc2U7XG5cdHZhciBjYW52YXMgPSByZW5kZXJlci5kb21FbGVtZW50O1xuXHR2YXIgZnVsbHNjcmVlbmNoYW5nZSA9IGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiA/ICdtb3pmdWxsc2NyZWVuY2hhbmdlJyA6ICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJztcblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBmdWxsc2NyZWVuY2hhbmdlLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGlzRnVsbHNjcmVlbiA9IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50O1xuXHR9LCBmYWxzZSApO1xuXG5cdHRoaXMuc2V0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uICggYm9vbGVhbiApIHtcblx0XHRpZiAoIHZySE1EID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cdFx0aWYgKCBpc0Z1bGxzY3JlZW4gPT09IGJvb2xlYW4gKSByZXR1cm47XG5cdFx0aWYgKCBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4oIHsgdnJEaXNwbGF5OiB2ckhNRCB9ICk7XG5cdFx0fSBlbHNlIGlmICggY2FudmFzLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuICkge1xuXHRcdFx0Y2FudmFzLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCB7IHZyRGlzcGxheTogdnJITUQgfSApO1xuXHRcdH1cblx0fTtcblxuXHQvLyByZW5kZXJcblx0dmFyIGNhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblx0dmFyIGNhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblxuXHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblx0XHRpZiAoIHZySE1EICkge1xuXHRcdFx0dmFyIHNjZW5lTCwgc2NlbmVSO1xuXG5cdFx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cdFx0XHRcdHNjZW5lTCA9IHNjZW5lWyAwIF07XG5cdFx0XHRcdHNjZW5lUiA9IHNjZW5lWyAxIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzY2VuZUwgPSBzY2VuZTtcblx0XHRcdFx0c2NlbmVSID0gc2NlbmU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzaXplID0gcmVuZGVyZXIuZ2V0U2l6ZSgpO1xuXHRcdFx0c2l6ZS53aWR0aCAvPSAyO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggdHJ1ZSApO1xuXHRcdFx0cmVuZGVyZXIuY2xlYXIoKTtcblxuXHRcdFx0aWYgKCBjYW1lcmEucGFyZW50ID09PSB1bmRlZmluZWQgKSBjYW1lcmEudXBkYXRlTWF0cml4V29ybGQoKTtcblxuXHRcdFx0Y2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZMLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXHRcdFx0Y2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZSLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXG5cdFx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFMLnBvc2l0aW9uLCBjYW1lcmFMLnF1YXRlcm5pb24sIGNhbWVyYUwuc2NhbGUgKTtcblx0XHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYVIucG9zaXRpb24sIGNhbWVyYVIucXVhdGVybmlvbiwgY2FtZXJhUi5zY2FsZSApO1xuXG5cdFx0XHRjYW1lcmFMLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uTC54ICogdGhpcy5zY2FsZSApO1xuXHRcdFx0Y2FtZXJhUi50cmFuc2xhdGVYKCBleWVUcmFuc2xhdGlvblIueCAqIHRoaXMuc2NhbGUgKTtcblxuXHRcdFx0Ly8gcmVuZGVyIGxlZnQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lTCwgY2FtZXJhTCApO1xuXG5cdFx0XHQvLyByZW5kZXIgcmlnaHQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggc2l6ZS53aWR0aCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIHNpemUud2lkdGgsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lUiwgY2FtZXJhUiApO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggZmFsc2UgKTtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Ly8gUmVndWxhciByZW5kZXIgbW9kZSBpZiBub3QgSE1EXG5cblx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSBzY2VuZSA9IHNjZW5lWyAwIF07XG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBjYW1lcmEgKTtcblxuXHR9O1xuXG5cdC8vXG5cblx0ZnVuY3Rpb24gZm92VG9ORENTY2FsZU9mZnNldCggZm92ICkge1xuXG5cdFx0dmFyIHB4c2NhbGUgPSAyLjAgLyAoZm92LmxlZnRUYW4gKyBmb3YucmlnaHRUYW4pO1xuXHRcdHZhciBweG9mZnNldCA9IChmb3YubGVmdFRhbiAtIGZvdi5yaWdodFRhbikgKiBweHNjYWxlICogMC41O1xuXHRcdHZhciBweXNjYWxlID0gMi4wIC8gKGZvdi51cFRhbiArIGZvdi5kb3duVGFuKTtcblx0XHR2YXIgcHlvZmZzZXQgPSAoZm92LnVwVGFuIC0gZm92LmRvd25UYW4pICogcHlzY2FsZSAqIDAuNTtcblx0XHRyZXR1cm4geyBzY2FsZTogWyBweHNjYWxlLCBweXNjYWxlIF0sIG9mZnNldDogWyBweG9mZnNldCwgcHlvZmZzZXQgXSB9O1xuXG5cdH1cblxuXHRmdW5jdGlvbiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3YsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApIHtcblxuXHRcdHJpZ2h0SGFuZGVkID0gcmlnaHRIYW5kZWQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiByaWdodEhhbmRlZDtcblx0XHR6TmVhciA9IHpOZWFyID09PSB1bmRlZmluZWQgPyAwLjAxIDogek5lYXI7XG5cdFx0ekZhciA9IHpGYXIgPT09IHVuZGVmaW5lZCA/IDEwMDAwLjAgOiB6RmFyO1xuXG5cdFx0dmFyIGhhbmRlZG5lc3NTY2FsZSA9IHJpZ2h0SGFuZGVkID8gLTEuMCA6IDEuMDtcblxuXHRcdC8vIHN0YXJ0IHdpdGggYW4gaWRlbnRpdHkgbWF0cml4XG5cdFx0dmFyIG1vYmogPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdHZhciBtID0gbW9iai5lbGVtZW50cztcblxuXHRcdC8vIGFuZCB3aXRoIHNjYWxlL29mZnNldCBpbmZvIGZvciBub3JtYWxpemVkIGRldmljZSBjb29yZHNcblx0XHR2YXIgc2NhbGVBbmRPZmZzZXQgPSBmb3ZUb05EQ1NjYWxlT2Zmc2V0KGZvdik7XG5cblx0XHQvLyBYIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuXHRcdG1bMCAqIDQgKyAwXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzBdO1xuXHRcdG1bMCAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzAgKiA0ICsgMl0gPSBzY2FsZUFuZE9mZnNldC5vZmZzZXRbMF0gKiBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVswICogNCArIDNdID0gMC4wO1xuXG5cdFx0Ly8gWSByZXN1bHQsIG1hcCBjbGlwIGVkZ2VzIHRvIFstdywrd11cblx0XHQvLyBZIG9mZnNldCBpcyBuZWdhdGVkIGJlY2F1c2UgdGhpcyBwcm9qIG1hdHJpeCB0cmFuc2Zvcm1zIGZyb20gd29ybGQgY29vcmRzIHdpdGggWT11cCxcblx0XHQvLyBidXQgdGhlIE5EQyBzY2FsaW5nIGhhcyBZPWRvd24gKHRoYW5rcyBEM0Q/KVxuXHRcdG1bMSAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzEgKiA0ICsgMV0gPSBzY2FsZUFuZE9mZnNldC5zY2FsZVsxXTtcblx0XHRtWzEgKiA0ICsgMl0gPSAtc2NhbGVBbmRPZmZzZXQub2Zmc2V0WzFdICogaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMSAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdC8vIFogcmVzdWx0ICh1cCB0byB0aGUgYXBwKVxuXHRcdG1bMiAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzIgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVsyICogNCArIDJdID0gekZhciAvICh6TmVhciAtIHpGYXIpICogLWhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzIgKiA0ICsgM10gPSAoekZhciAqIHpOZWFyKSAvICh6TmVhciAtIHpGYXIpO1xuXG5cdFx0Ly8gVyByZXN1bHQgKD0gWiBpbilcblx0XHRtWzMgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVszICogNCArIDFdID0gMC4wO1xuXHRcdG1bMyAqIDQgKyAyXSA9IGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzMgKiA0ICsgM10gPSAwLjA7XG5cblx0XHRtb2JqLnRyYW5zcG9zZSgpO1xuXG5cdFx0cmV0dXJuIG1vYmo7XG5cdH1cblxuXHRmdW5jdGlvbiBmb3ZUb1Byb2plY3Rpb24oIGZvdiwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICkge1xuXG5cdFx0dmFyIERFRzJSQUQgPSBNYXRoLlBJIC8gMTgwLjA7XG5cblx0XHR2YXIgZm92UG9ydCA9IHtcblx0XHRcdHVwVGFuOiBNYXRoLnRhbiggZm92LnVwRGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdGRvd25UYW46IE1hdGgudGFuKCBmb3YuZG93bkRlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRsZWZ0VGFuOiBNYXRoLnRhbiggZm92LmxlZnREZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0cmlnaHRUYW46IE1hdGgudGFuKCBmb3YucmlnaHREZWdyZWVzICogREVHMlJBRCApXG5cdFx0fTtcblxuXHRcdHJldHVybiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3ZQb3J0LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKTtcblxuXHR9XG5cbn07XG4iLCJcbi8qXG4gKiBNb3pWUiBFeHRlbnNpb25zIHRvIHRocmVlLmpzXG4gKlxuICogQSBicm93c2VyaWZ5IHdyYXBwZXIgZm9yIHRoZSBWUiBoZWxwZXJzIGZyb20gTW96VlIncyBnaXRodWIgcmVwby5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Nb3pWUi92ci13ZWItZXhhbXBsZXMvdHJlZS9tYXN0ZXIvdGhyZWVqcy12ci1ib2lsZXJwbGF0ZVxuICpcbiAqIFRoZSBleHRlbnNpb24gZmlsZXMgYXJlIG5vdCBtb2R1bGUgY29tcGF0aWJsZSBhbmQgd29yayBieSBhcHBlbmRpbmcgdG8gdGhlXG4gKiBUSFJFRSBvYmplY3QuIERvIHVzZSB0aGVtLCB3ZSBtYWtlIHRoZSBUSFJFRSBvYmplY3QgZ2xvYmFsLCBhbmQgdGhlbiBtYWtlXG4gKiBpdCB0aGUgZXhwb3J0IHZhbHVlIG9mIHRoaXMgbW9kdWxlLlxuICpcbiAqL1xuXG5jb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdMb2FkaW5nIE1velZSIEV4dGVuc2lvbnMuLi4nKTtcbi8vcmVxdWlyZSgnLi9TdGVyZW9FZmZlY3QuanMnKTtcbi8vY29uc29sZS5sb2coJ1N0ZXJlb0VmZmVjdCAtIE9LJyk7XG5cbnJlcXVpcmUoJy4vVlJDb250cm9scy5qcycpO1xuY29uc29sZS5sb2coJ1ZSQ29udHJvbHMgLSBPSycpO1xuXG5yZXF1aXJlKCcuL1ZSRWZmZWN0LmpzJyk7XG5jb25zb2xlLmxvZygnVlJFZmZlY3QgLSBPSycpO1xuXG5jb25zb2xlLmdyb3VwRW5kKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUU7XG5cbiIsIi8qKlxuICogQGF1dGhvciBFYmVyaGFyZCBHcmFldGhlciAvIGh0dHA6Ly9lZ3JhZXRoZXIuY29tL1xuICogQGF1dGhvciBNYXJrIEx1bmRpbiBcdC8gaHR0cDovL21hcmstbHVuZGluLmNvbVxuICogQGF1dGhvciBTaW1vbmUgTWFuaW5pIC8gaHR0cDovL2Rhcm9uMTMzNy5naXRodWIuaW9cbiAqIEBhdXRob3IgTHVjYSBBbnRpZ2EgXHQvIGh0dHA6Ly9sYW50aWdhLmdpdGh1Yi5pb1xuICovXG5cblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIHRhcmdldCwgZG9tRWxlbWVudCApIHtcblxuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR2YXIgU1RBVEUgPSB7IE5PTkU6IC0xLCBST1RBVEU6IDAsIFpPT006IDEsIFBBTjogMiwgVE9VQ0hfUk9UQVRFOiAzLCBUT1VDSF9aT09NX1BBTjogNCB9O1xuXG5cdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHR0aGlzLmRvbUVsZW1lbnQgPSAoIGRvbUVsZW1lbnQgIT09IHVuZGVmaW5lZCApID8gZG9tRWxlbWVudCA6IGRvY3VtZW50O1xuXG5cdC8vIEFQSVxuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0dGhpcy5zY3JlZW4gPSB7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG5cdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cdHRoaXMuem9vbVNwZWVkID0gMS4yO1xuXHR0aGlzLnBhblNwZWVkID0gMC4zO1xuXG5cdHRoaXMubm9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5ub1pvb20gPSBmYWxzZTtcblx0dGhpcy5ub1BhbiA9IGZhbHNlO1xuXG5cdHRoaXMuc3RhdGljTW92aW5nID0gZmFsc2U7XG5cdHRoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgPSAwLjI7XG5cblx0dGhpcy5taW5EaXN0YW5jZSA9IDA7XG5cdHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuXHR0aGlzLmtleXMgPSBbIDY1IC8qQSovLCA4MyAvKlMqLywgNjggLypEKi8gXTtcblxuXHQvLyBpbnRlcm5hbHNcblxuXHR0aGlzLnRhcmdldCA9IHRhcmdldCA/IHRhcmdldC5wb3NpdGlvbiA6IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciBsYXN0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBfc3RhdGUgPSBTVEFURS5OT05FLFxuXHRfcHJldlN0YXRlID0gU1RBVEUuTk9ORSxcblxuXHRfZXllID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblxuXHRfbW92ZVByZXYgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfbW92ZUN1cnIgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXG5cdF9sYXN0QXhpcyA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdF9sYXN0QW5nbGUgPSAwLFxuXG5cdF96b29tU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfem9vbUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cblx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSAwLFxuXHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSAwLFxuXG5cdF9wYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF9wYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdC8vIGZvciByZXNldFxuXG5cdHRoaXMudGFyZ2V0MCA9IHRoaXMudGFyZ2V0LmNsb25lKCk7XG5cdHRoaXMucG9zaXRpb24wID0gdGhpcy5vYmplY3QucG9zaXRpb24uY2xvbmUoKTtcblx0dGhpcy51cDAgPSB0aGlzLm9iamVjdC51cC5jbG9uZSgpO1xuXG5cdC8vIGV2ZW50c1xuXG5cdHZhciBjaGFuZ2VFdmVudCA9IHsgdHlwZTogJ2NoYW5nZScgfTtcblx0dmFyIHN0YXJ0RXZlbnQgPSB7IHR5cGU6ICdzdGFydCcgfTtcblx0dmFyIGVuZEV2ZW50ID0geyB0eXBlOiAnZW5kJyB9O1xuXG5cblx0Ly8gbWV0aG9kc1xuXG5cdHRoaXMuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCB0aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ICkge1xuXG5cdFx0XHR0aGlzLnNjcmVlbi5sZWZ0ID0gMDtcblx0XHRcdHRoaXMuc2NyZWVuLnRvcCA9IDA7XG5cdFx0XHR0aGlzLnNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdFx0dGhpcy5zY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dmFyIGJveCA9IHRoaXMuZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdC8vIGFkanVzdG1lbnRzIGNvbWUgZnJvbSBzaW1pbGFyIGNvZGUgaW4gdGhlIGpxdWVyeSBvZmZzZXQoKSBmdW5jdGlvblxuXHRcdFx0dmFyIGQgPSB0aGlzLmRvbUVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cdFx0XHR0aGlzLnNjcmVlbi5sZWZ0ID0gYm94LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSBkLmNsaWVudExlZnQ7XG5cdFx0XHR0aGlzLnNjcmVlbi50b3AgPSBib3gudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0IC0gZC5jbGllbnRUb3A7XG5cdFx0XHR0aGlzLnNjcmVlbi53aWR0aCA9IGJveC53aWR0aDtcblx0XHRcdHRoaXMuc2NyZWVuLmhlaWdodCA9IGJveC5oZWlnaHQ7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKCBldmVudCApIHtcblxuXHRcdGlmICggdHlwZW9mIHRoaXNbIGV2ZW50LnR5cGUgXSA9PSAnZnVuY3Rpb24nICkge1xuXG5cdFx0XHR0aGlzWyBldmVudC50eXBlIF0oIGV2ZW50ICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR2YXIgZ2V0TW91c2VPblNjcmVlbiA9ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBwYWdlWCwgcGFnZVkgKSB7XG5cblx0XHRcdHZlY3Rvci5zZXQoXG5cdFx0XHRcdCggcGFnZVggLSBfdGhpcy5zY3JlZW4ubGVmdCApIC8gX3RoaXMuc2NyZWVuLndpZHRoLFxuXHRcdFx0XHQoIHBhZ2VZIC0gX3RoaXMuc2NyZWVuLnRvcCApIC8gX3RoaXMuc2NyZWVuLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHZlY3RvcjtcblxuXHRcdH07XG5cblx0fSgpICk7XG5cblx0dmFyIGdldE1vdXNlT25DaXJjbGUgPSAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggcGFnZVgsIHBhZ2VZICkge1xuXG5cdFx0XHR2ZWN0b3Iuc2V0KFxuXHRcdFx0XHQoICggcGFnZVggLSBfdGhpcy5zY3JlZW4ud2lkdGggKiAwLjUgLSBfdGhpcy5zY3JlZW4ubGVmdCApIC8gKCBfdGhpcy5zY3JlZW4ud2lkdGggKiAwLjUgKSApLFxuXHRcdFx0XHQoICggX3RoaXMuc2NyZWVuLmhlaWdodCArIDIgKiAoIF90aGlzLnNjcmVlbi50b3AgLSBwYWdlWSApICkgLyBfdGhpcy5zY3JlZW4ud2lkdGggKSAvLyBzY3JlZW4ud2lkdGggaW50ZW50aW9uYWxcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiB2ZWN0b3I7XG5cdFx0fTtcblxuXHR9KCkgKTtcblxuXHR0aGlzLnJvdGF0ZUNhbWVyYSA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBheGlzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdHF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLFxuXHRcdFx0ZXllRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG9iamVjdFVwRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0YW5nbGU7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRtb3ZlRGlyZWN0aW9uLnNldCggX21vdmVDdXJyLnggLSBfbW92ZVByZXYueCwgX21vdmVDdXJyLnkgLSBfbW92ZVByZXYueSwgMCApO1xuXHRcdFx0YW5nbGUgPSBtb3ZlRGlyZWN0aW9uLmxlbmd0aCgpO1xuXG5cdFx0XHRpZiAoIGFuZ2xlICkge1xuXG5cdFx0XHRcdF9leWUuY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkuc3ViKCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdFx0XHRleWVEaXJlY3Rpb24uY29weSggX2V5ZSApLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmplY3RVcERpcmVjdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QudXAgKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24uY3Jvc3NWZWN0b3JzKCBvYmplY3RVcERpcmVjdGlvbiwgZXllRGlyZWN0aW9uICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24uc2V0TGVuZ3RoKCBfbW92ZUN1cnIueSAtIF9tb3ZlUHJldi55ICk7XG5cdFx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uLnNldExlbmd0aCggX21vdmVDdXJyLnggLSBfbW92ZVByZXYueCApO1xuXG5cdFx0XHRcdG1vdmVEaXJlY3Rpb24uY29weSggb2JqZWN0VXBEaXJlY3Rpb24uYWRkKCBvYmplY3RTaWRld2F5c0RpcmVjdGlvbiApICk7XG5cblx0XHRcdFx0YXhpcy5jcm9zc1ZlY3RvcnMoIG1vdmVEaXJlY3Rpb24sIF9leWUgKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRhbmdsZSAqPSBfdGhpcy5yb3RhdGVTcGVlZDtcblx0XHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApO1xuXG5cdFx0XHRcdF9leWUuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cdFx0XHRcdF90aGlzLm9iamVjdC51cC5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblxuXHRcdFx0XHRfbGFzdEF4aXMuY29weSggYXhpcyApO1xuXHRcdFx0XHRfbGFzdEFuZ2xlID0gYW5nbGU7XG5cblx0XHRcdH1cblxuXHRcdFx0ZWxzZSBpZiAoICFfdGhpcy5zdGF0aWNNb3ZpbmcgJiYgX2xhc3RBbmdsZSApIHtcblxuXHRcdFx0XHRfbGFzdEFuZ2xlICo9IE1hdGguc3FydCggMS4wIC0gX3RoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgKTtcblx0XHRcdFx0X2V5ZS5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKS5zdWIoIF90aGlzLnRhcmdldCApO1xuXHRcdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIF9sYXN0QXhpcywgX2xhc3RBbmdsZSApO1xuXHRcdFx0XHRfZXllLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXHRcdFx0XHRfdGhpcy5vYmplY3QudXAuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cblx0XHRcdH1cblxuXHRcdFx0X21vdmVQcmV2LmNvcHkoIF9tb3ZlQ3VyciApO1xuXG5cdFx0fTtcblxuXHR9KCkpO1xuXG5cblx0dGhpcy56b29tQ2FtZXJhID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGZhY3RvcjtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5UT1VDSF9aT09NX1BBTiApIHtcblxuXHRcdFx0ZmFjdG9yID0gX3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgLyBfdG91Y2hab29tRGlzdGFuY2VFbmQ7XG5cdFx0XHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IF90b3VjaFpvb21EaXN0YW5jZUVuZDtcblx0XHRcdF9leWUubXVsdGlwbHlTY2FsYXIoIGZhY3RvciApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0ZmFjdG9yID0gMS4wICsgKCBfem9vbUVuZC55IC0gX3pvb21TdGFydC55ICkgKiBfdGhpcy56b29tU3BlZWQ7XG5cblx0XHRcdGlmICggZmFjdG9yICE9PSAxLjAgJiYgZmFjdG9yID4gMC4wICkge1xuXG5cdFx0XHRcdF9leWUubXVsdGlwbHlTY2FsYXIoIGZhY3RvciApO1xuXG5cdFx0XHRcdGlmICggX3RoaXMuc3RhdGljTW92aW5nICkge1xuXG5cdFx0XHRcdFx0X3pvb21TdGFydC5jb3B5KCBfem9vbUVuZCApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfem9vbVN0YXJ0LnkgKz0gKCBfem9vbUVuZC55IC0gX3pvb21TdGFydC55ICkgKiB0aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5wYW5DYW1lcmEgPSAoZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbW91c2VDaGFuZ2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRcdFx0b2JqZWN0VXAgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0cGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdG1vdXNlQ2hhbmdlLmNvcHkoIF9wYW5FbmQgKS5zdWIoIF9wYW5TdGFydCApO1xuXG5cdFx0XHRpZiAoIG1vdXNlQ2hhbmdlLmxlbmd0aFNxKCkgKSB7XG5cblx0XHRcdFx0bW91c2VDaGFuZ2UubXVsdGlwbHlTY2FsYXIoIF9leWUubGVuZ3RoKCkgKiBfdGhpcy5wYW5TcGVlZCApO1xuXG5cdFx0XHRcdHBhbi5jb3B5KCBfZXllICkuY3Jvc3MoIF90aGlzLm9iamVjdC51cCApLnNldExlbmd0aCggbW91c2VDaGFuZ2UueCApO1xuXHRcdFx0XHRwYW4uYWRkKCBvYmplY3RVcC5jb3B5KCBfdGhpcy5vYmplY3QudXAgKS5zZXRMZW5ndGgoIG1vdXNlQ2hhbmdlLnkgKSApO1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGQoIHBhbiApO1xuXHRcdFx0XHRfdGhpcy50YXJnZXQuYWRkKCBwYW4gKTtcblxuXHRcdFx0XHRpZiAoIF90aGlzLnN0YXRpY01vdmluZyApIHtcblxuXHRcdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBfcGFuRW5kICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF9wYW5TdGFydC5hZGQoIG1vdXNlQ2hhbmdlLnN1YlZlY3RvcnMoIF9wYW5FbmQsIF9wYW5TdGFydCApLm11bHRpcGx5U2NhbGFyKCBfdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciApICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fTtcblxuXHR9KCkpO1xuXG5cdHRoaXMuY2hlY2tEaXN0YW5jZXMgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoICFfdGhpcy5ub1pvb20gfHwgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRpZiAoIF9leWUubGVuZ3RoU3EoKSA+IF90aGlzLm1heERpc3RhbmNlICogX3RoaXMubWF4RGlzdGFuY2UgKSB7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZS5zZXRMZW5ndGgoIF90aGlzLm1heERpc3RhbmNlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIF9leWUubGVuZ3RoU3EoKSA8IF90aGlzLm1pbkRpc3RhbmNlICogX3RoaXMubWluRGlzdGFuY2UgKSB7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZS5zZXRMZW5ndGgoIF90aGlzLm1pbkRpc3RhbmNlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRfZXllLnN1YlZlY3RvcnMoIF90aGlzLm9iamVjdC5wb3NpdGlvbiwgX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRpZiAoICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X3RoaXMucm90YXRlQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRpZiAoICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF90aGlzLnpvb21DYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdGlmICggIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfdGhpcy5wYW5DYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUgKTtcblxuXHRcdF90aGlzLmNoZWNrRGlzdGFuY2VzKCk7XG5cblx0XHRfdGhpcy5vYmplY3QubG9va0F0KCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKCBfdGhpcy5vYmplY3QucG9zaXRpb24gKSA+IEVQUyApIHtcblxuXHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdFx0bGFzdFBvc2l0aW9uLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cdFx0X3ByZXZTdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRfdGhpcy50YXJnZXQuY29weSggX3RoaXMudGFyZ2V0MCApO1xuXHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5jb3B5KCBfdGhpcy5wb3NpdGlvbjAgKTtcblx0XHRfdGhpcy5vYmplY3QudXAuY29weSggX3RoaXMudXAwICk7XG5cblx0XHRfZXllLnN1YlZlY3RvcnMoIF90aGlzLm9iamVjdC5wb3NpdGlvbiwgX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRfdGhpcy5vYmplY3QubG9va0F0KCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRsYXN0UG9zaXRpb24uY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0fTtcblxuXHQvLyBsaXN0ZW5lcnNcblxuXHRmdW5jdGlvbiBrZXlkb3duKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duICk7XG5cblx0XHRfcHJldlN0YXRlID0gX3N0YXRlO1xuXG5cdFx0aWYgKCBfc3RhdGUgIT09IFNUQVRFLk5PTkUgKSB7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlJPVEFURSBdICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuWk9PTSBdICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlpPT007XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5QQU4gXSAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24ga2V5dXAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdF9zdGF0ZSA9IF9wcmV2U3RhdGU7XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duLCBmYWxzZSApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZWRvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuTk9ORSApIHtcblxuXHRcdFx0X3N0YXRlID0gZXZlbnQuYnV0dG9uO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlJPVEFURSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuWk9PTSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfem9vbVN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfem9vbUVuZC5jb3B5KF96b29tU3RhcnQpO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5QQU4gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfcGFuU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF9wYW5FbmQuY29weShfcGFuU3RhcnQpO1xuXG5cdFx0fVxuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlbW92ZSwgZmFsc2UgKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNldXAsIGZhbHNlICk7XG5cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNlbW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5ST1RBVEUgJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlpPT00gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3pvb21FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUEFOICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZXVwKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZW1vdmUgKTtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNldXAgKTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZXdoZWVsKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmICggZXZlbnQud2hlZWxEZWx0YSApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG5cblx0XHRcdGRlbHRhID0gZXZlbnQud2hlZWxEZWx0YSAvIDQwO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICkgeyAvLyBGaXJlZm94XG5cblx0XHRcdGRlbHRhID0gLSBldmVudC5kZXRhaWwgLyAzO1xuXG5cdFx0fVxuXG5cdFx0X3pvb21TdGFydC55ICs9IGRlbHRhICogMC4wMTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hzdGFydCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuVE9VQ0hfUk9UQVRFO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5UT1VDSF9aT09NX1BBTjtcblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBfcGFuU3RhcnQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNobW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCAgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaGVuZCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoICBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gX3RvdWNoWm9vbURpc3RhbmNlRW5kID0gMDtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRfcGFuU3RhcnQuY29weSggX3BhbkVuZCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdH1cblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtb3VzZWRvd24sIGZhbHNlICk7XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXdoZWVsJywgbW91c2V3aGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG1vdXNld2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24sIGZhbHNlICk7XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBrZXl1cCwgZmFsc2UgKTtcblxuXHR0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuXG5cdC8vIGZvcmNlIGFuIHVwZGF0ZSBhdCBzdGFydFxuXHR0aGlzLnVwZGF0ZSgpO1xuXG59O1xuXG5USFJFRS5UcmFja2JhbGxDb250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUSFJFRS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlICk7XG5USFJFRS5UcmFja2JhbGxDb250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUSFJFRS5UcmFja2JhbGxDb250cm9scztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzO1xuXG4iLCJ2YXIgc3F1YXJlLCB6aWcsIHphZywgbGVmdCwgcmlnaHQsIHRlZSwgdGV0cmlzLCBhbGwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLnNxdWFyZSA9IHNxdWFyZSA9IFtbWzAsIDAsIDBdLCBbMCwgMSwgMV0sIFswLCAxLCAxXV1dO1xub3V0JC56aWcgPSB6aWcgPSBbW1swLCAwLCAwXSwgWzIsIDIsIDBdLCBbMCwgMiwgMl1dLCBbWzAsIDIsIDBdLCBbMiwgMiwgMF0sIFsyLCAwLCAwXV1dO1xub3V0JC56YWcgPSB6YWcgPSBbW1swLCAwLCAwXSwgWzAsIDMsIDNdLCBbMywgMywgMF1dLCBbWzMsIDAsIDBdLCBbMywgMywgMF0sIFswLCAzLCAwXV1dO1xub3V0JC5sZWZ0ID0gbGVmdCA9IFtbWzAsIDAsIDBdLCBbNCwgNCwgNF0sIFs0LCAwLCAwXV0sIFtbNCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDBdXSwgW1swLCAwLCA0XSwgWzQsIDQsIDRdLCBbMCwgMCwgMF1dLCBbWzAsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCA0XV1dO1xub3V0JC5yaWdodCA9IHJpZ2h0ID0gW1tbMCwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDVdXSwgW1swLCA1LCAwXSwgWzAsIDUsIDBdLCBbNSwgNSwgMF1dLCBbWzUsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCAwXV0sIFtbMCwgNSwgNV0sIFswLCA1LCAwXSwgWzAsIDUsIDBdXV07XG5vdXQkLnRlZSA9IHRlZSA9IFtbWzAsIDAsIDBdLCBbNiwgNiwgNl0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCAwXSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDZdLCBbMCwgMCwgMF1dLCBbWzAsIDYsIDBdLCBbMCwgNiwgNl0sIFswLCA2LCAwXV1dO1xub3V0JC50ZXRyaXMgPSB0ZXRyaXMgPSBbW1swLCAwLCAwLCAwXSwgWzAsIDAsIDAsIDBdLCBbNywgNywgNywgN11dLCBbWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdXV07XG5vdXQkLmFsbCA9IGFsbCA9IFtcbiAge1xuICAgIHR5cGU6ICdzcXVhcmUnLFxuICAgIHNoYXBlczogc3F1YXJlXG4gIH0sIHtcbiAgICB0eXBlOiAnemlnJyxcbiAgICBzaGFwZXM6IHppZ1xuICB9LCB7XG4gICAgdHlwZTogJ3phZycsXG4gICAgc2hhcGVzOiB6YWdcbiAgfSwge1xuICAgIHR5cGU6ICdsZWZ0JyxcbiAgICBzaGFwZXM6IGxlZnRcbiAgfSwge1xuICAgIHR5cGU6ICdyaWdodCcsXG4gICAgc2hhcGVzOiByaWdodFxuICB9LCB7XG4gICAgdHlwZTogJ3RlZScsXG4gICAgc2hhcGVzOiB0ZWVcbiAgfSwge1xuICAgIHR5cGU6ICd0ZXRyaXMnLFxuICAgIHNoYXBlczogdGV0cmlzXG4gIH1cbl07IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIG1lbnVEYXRhLCBsaW1pdGVyLCBwcmltZUdhbWVTdGF0ZSwgY2hvb3NlT3B0aW9uLCBzZWxlY3RQcmV2SXRlbSwgc2VsZWN0TmV4dEl0ZW0sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHdyYXAgPSByZWYkLndyYXA7XG5tZW51RGF0YSA9IFtcbiAge1xuICAgIHN0YXRlOiAncmVzdGFydCcsXG4gICAgdGV4dDogXCJSZXN0YXJ0XCJcbiAgfSwge1xuICAgIHN0YXRlOiAnZ28tYmFjaycsXG4gICAgdGV4dDogXCJCYWNrIHRvIE1haW5cIlxuICB9XG5dO1xubGltaXRlciA9IHdyYXAoMCwgbWVudURhdGEubGVuZ3RoIC0gMSk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihnYW1lc3RhdGUpe1xuICByZXR1cm4gZ2FtZXN0YXRlLmZhaWxNZW51U3RhdGUgPSB7XG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGN1cnJlbnRTdGF0ZTogbWVudURhdGFbMF0sXG4gICAgbWVudURhdGE6IG1lbnVEYXRhXG4gIH07XG59O1xub3V0JC5jaG9vc2VPcHRpb24gPSBjaG9vc2VPcHRpb24gPSBmdW5jdGlvbihmbXMsIGluZGV4KXtcbiAgZm1zLmN1cnJlbnRJbmRleCA9IGxpbWl0ZXIoaW5kZXgpO1xuICByZXR1cm4gZm1zLmN1cnJlbnRTdGF0ZSA9IG1lbnVEYXRhW2Ztcy5jdXJyZW50SW5kZXhdO1xufTtcbm91dCQuc2VsZWN0UHJldkl0ZW0gPSBzZWxlY3RQcmV2SXRlbSA9IGZ1bmN0aW9uKGZtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IGZtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oZm1zLCBjdXJyZW50SW5kZXggLSAxKTtcbn07XG5vdXQkLnNlbGVjdE5leHRJdGVtID0gc2VsZWN0TmV4dEl0ZW0gPSBmdW5jdGlvbihmbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBmbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKGZtcywgY3VycmVudEluZGV4ICsgMSk7XG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBhZGRWMiwgcmFuZEludCwgd3JhcCwgcmFuZG9tRnJvbSwgQnJpY2tTaGFwZXMsIGNhbkRyb3AsIGNhbk1vdmUsIGNhblJvdGF0ZSwgY29sbGlkZXMsIGNvcHlCcmlja1RvQXJlbmEsIHRvcElzUmVhY2hlZCwgaXNDb21wbGV0ZSwgbmV3QnJpY2ssIHNwYXduTmV3QnJpY2ssIGRyb3BBcmVuYVJvdywgcmVtb3ZlUm93cywgY2xlYXJBcmVuYSwgZ2V0U2hhcGVPZlJvdGF0aW9uLCBub3JtYWxpc2VSb3RhdGlvbiwgcm90YXRlQnJpY2ssIGNvbXB1dGVTY29yZSwgcmVzZXRTY29yZSwgYW5pbWF0aW9uVGltZUZvclJvd3MsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcbkJyaWNrU2hhcGVzID0gcmVxdWlyZSgnLi9kYXRhL2JyaWNrLXNoYXBlcycpO1xub3V0JC5jYW5Ecm9wID0gY2FuRHJvcCA9IGZ1bmN0aW9uKGJyaWNrLCBhcmVuYSl7XG4gIHJldHVybiBjYW5Nb3ZlKGJyaWNrLCBbMCwgMV0sIGFyZW5hKTtcbn07XG5vdXQkLmNhbk1vdmUgPSBjYW5Nb3ZlID0gZnVuY3Rpb24oYnJpY2ssIG1vdmUsIGFyZW5hKXtcbiAgdmFyIG5ld1BvcztcbiAgbmV3UG9zID0gYWRkVjIoYnJpY2sucG9zLCBtb3ZlKTtcbiAgcmV0dXJuIGNvbGxpZGVzKG5ld1BvcywgYnJpY2suc2hhcGUsIGFyZW5hKTtcbn07XG5vdXQkLmNhblJvdGF0ZSA9IGNhblJvdGF0ZSA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIsIGFyZW5hKXtcbiAgdmFyIG5ld1NoYXBlO1xuICBuZXdTaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24gKyBkaXIpO1xuICByZXR1cm4gY29sbGlkZXMoYnJpY2sucG9zLCBuZXdTaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY29sbGlkZXMgPSBjb2xsaWRlcyA9IGZ1bmN0aW9uKHBvcywgc2hhcGUsIGFyZyQpe1xuICB2YXIgY2VsbHMsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1O1xuICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSA+IDApIHtcbiAgICAgICAgaWYgKHYgPj0gMCkge1xuICAgICAgICAgIGlmICh2ID49IGhlaWdodCB8fCB1ID49IHdpZHRoIHx8IHUgPCAwIHx8IGNlbGxzW3ZdW3VdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5jb3B5QnJpY2tUb0FyZW5hID0gY29weUJyaWNrVG9BcmVuYSA9IGZ1bmN0aW9uKGFyZyQsIGFyZzEkKXtcbiAgdmFyIHBvcywgc2hhcGUsIGNlbGxzLCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgbHJlc3VsdCQsIGokLCByZWYxJCwgbGVuMSQsIHgsIHUsIHJlc3VsdHMkID0gW107XG4gIHBvcyA9IGFyZyQucG9zLCBzaGFwZSA9IGFyZyQuc2hhcGU7XG4gIGNlbGxzID0gYXJnMSQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdICYmIHYgPj0gMCkge1xuICAgICAgICBscmVzdWx0JC5wdXNoKGNlbGxzW3ZdW3VdID0gc2hhcGVbeV1beF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLnRvcElzUmVhY2hlZCA9IHRvcElzUmVhY2hlZCA9IGZ1bmN0aW9uKGFyZyQpe1xuICB2YXIgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCBjZWxsO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBjZWxsc1swXSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcmVmJFtpJF07XG4gICAgaWYgKGNlbGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xub3V0JC5pc0NvbXBsZXRlID0gaXNDb21wbGV0ZSA9IGZ1bmN0aW9uKHJvdyl7XG4gIHZhciBpJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcm93W2kkXTtcbiAgICBpZiAoIWNlbGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xub3V0JC5uZXdCcmljayA9IG5ld0JyaWNrID0gZnVuY3Rpb24oaXgpe1xuICBpeCA9PSBudWxsICYmIChpeCA9IHJhbmRJbnQoMCwgQnJpY2tTaGFwZXMuYWxsLmxlbmd0aCkpO1xuICByZXR1cm4ge1xuICAgIHJvdGF0aW9uOiAwLFxuICAgIHNoYXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnNoYXBlc1swXSxcbiAgICB0eXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnR5cGUsXG4gICAgcG9zOiBbMCwgMF1cbiAgfTtcbn07XG5vdXQkLnNwYXduTmV3QnJpY2sgPSBzcGF3bk5ld0JyaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICBncy5icmljay5jdXJyZW50ID0gZ3MuYnJpY2submV4dDtcbiAgZ3MuYnJpY2suY3VycmVudC5wb3MgPSBbNCwgLTFdO1xuICByZXR1cm4gZ3MuYnJpY2submV4dCA9IG5ld0JyaWNrKCk7XG59O1xub3V0JC5kcm9wQXJlbmFSb3cgPSBkcm9wQXJlbmFSb3cgPSBmdW5jdGlvbihhcmckLCByb3dJeCl7XG4gIHZhciBjZWxscztcbiAgY2VsbHMgPSBhcmckLmNlbGxzO1xuICBjZWxscy5zcGxpY2Uocm93SXgsIDEpO1xuICByZXR1cm4gY2VsbHMudW5zaGlmdChyZXBlYXRBcnJheSQoWzBdLCBjZWxsc1swXS5sZW5ndGgpKTtcbn07XG5vdXQkLnJlbW92ZVJvd3MgPSByZW1vdmVSb3dzID0gZnVuY3Rpb24ocm93cywgYXJlbmEpe1xuICB2YXIgaSQsIGxlbiQsIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3dJeCA9IHJvd3NbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2goZHJvcEFyZW5hUm93KGFyZW5hLCByb3dJeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmNsZWFyQXJlbmEgPSBjbGVhckFyZW5hID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgaSwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgaSA9IGokO1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKHJvd1tpXSA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5nZXRTaGFwZU9mUm90YXRpb24gPSBnZXRTaGFwZU9mUm90YXRpb24gPSBmdW5jdGlvbihicmljaywgcm90YXRpb24pe1xuICByb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCByb3RhdGlvbik7XG4gIHJldHVybiBCcmlja1NoYXBlc1ticmljay50eXBlXVtyb3RhdGlvbl07XG59O1xub3V0JC5ub3JtYWxpc2VSb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uID0gZnVuY3Rpb24oYXJnJCwgcm90YXRpb24pe1xuICB2YXIgdHlwZTtcbiAgdHlwZSA9IGFyZyQudHlwZTtcbiAgcmV0dXJuIHdyYXAoMCwgQnJpY2tTaGFwZXNbdHlwZV0ubGVuZ3RoIC0gMSwgcm90YXRpb24pO1xufTtcbm91dCQucm90YXRlQnJpY2sgPSByb3RhdGVCcmljayA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIpe1xuICB2YXIgcm90YXRpb24sIHR5cGU7XG4gIHJvdGF0aW9uID0gYnJpY2sucm90YXRpb24sIHR5cGUgPSBicmljay50eXBlO1xuICBicmljay5yb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBicmljay5zaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24pO1xufTtcbm91dCQuY29tcHV0ZVNjb3JlID0gY29tcHV0ZVNjb3JlID0gZnVuY3Rpb24oc2NvcmUsIHJvd3MsIGx2bCl7XG4gIGx2bCA9PSBudWxsICYmIChsdmwgPSAwKTtcbiAgc3dpdGNoIChyb3dzLmxlbmd0aCkge1xuICBjYXNlIDE6XG4gICAgc2NvcmUuc2luZ2xlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSA0MCAqIChsdmwgKyAxKTtcbiAgICBicmVhaztcbiAgY2FzZSAyOlxuICAgIHNjb3JlLmRvdWJsZXMgKz0gMTtcbiAgICBzY29yZS5wb2ludHMgKz0gMTAwICogKGx2bCArIDEpO1xuICAgIGJyZWFrO1xuICBjYXNlIDM6XG4gICAgc2NvcmUudHJpcGxlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAzMDAgKiAobHZsICsgMSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgNDpcbiAgICBzY29yZS50ZXRyaXMgKz0gMTtcbiAgICBzY29yZS5wb2ludHMgKz0gMTIwMCAqIChsdmwgKyAxKTtcbiAgfVxuICByZXR1cm4gc2NvcmUubGluZXMgKz0gcm93cy5sZW5ndGg7XG59O1xub3V0JC5yZXNldFNjb3JlID0gcmVzZXRTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcbiAgcmV0dXJuIGltcG9ydCQoc2NvcmUsIHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwXG4gIH0pO1xufTtcbm91dCQuYW5pbWF0aW9uVGltZUZvclJvd3MgPSBhbmltYXRpb25UaW1lRm9yUm93cyA9IGZ1bmN0aW9uKHJvd3Mpe1xuICByZXR1cm4gMTAgKyBNYXRoLnBvdygzLCByb3dzLmxlbmd0aCk7XG59O1xuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIENvcmUsIFN0YXJ0TWVudSwgRmFpbE1lbnUsIFRldHJpc0dhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5yYW5kb21Gcm9tID0gcmVxdWlyZSgnc3RkJykucmFuZG9tRnJvbTtcbkNvcmUgPSByZXF1aXJlKCcuL2dhbWUtY29yZScpO1xuU3RhcnRNZW51ID0gcmVxdWlyZSgnLi9zdGFydC1tZW51Jyk7XG5GYWlsTWVudSA9IHJlcXVpcmUoJy4vZmFpbC1tZW51Jyk7XG5vdXQkLlRldHJpc0dhbWUgPSBUZXRyaXNHYW1lID0gKGZ1bmN0aW9uKCl7XG4gIFRldHJpc0dhbWUuZGlzcGxheU5hbWUgPSAnVGV0cmlzR2FtZSc7XG4gIHZhciBwcm90b3R5cGUgPSBUZXRyaXNHYW1lLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUZXRyaXNHYW1lO1xuICBmdW5jdGlvbiBUZXRyaXNHYW1lKGdhbWVTdGF0ZSl7XG4gICAgbG9nKFwiVGV0cmlzR2FtZTo6bmV3XCIpO1xuICAgIFN0YXJ0TWVudS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUpO1xuICAgIEZhaWxNZW51LnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSk7XG4gIH1cbiAgcHJvdG90eXBlLmJlZ2luTmV3R2FtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSl7XG4gICAgKGZ1bmN0aW9uKCl7XG4gICAgICBDb3JlLmNsZWFyQXJlbmEodGhpcy5hcmVuYSk7XG4gICAgICB0aGlzLmJyaWNrLm5leHQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLm5leHQucG9zID0gWzMsIC0xXTtcbiAgICAgIHRoaXMuYnJpY2suY3VycmVudCA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuYnJpY2suY3VycmVudC5wb3MgPSBbMywgLTFdO1xuICAgICAgQ29yZS5yZXNldFNjb3JlKHRoaXMuc2NvcmUpO1xuICAgICAgdGhpcy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0KCk7XG4gICAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lci5yZXNldCgpO1xuICAgIH0uY2FsbChnYW1lU3RhdGUpKTtcbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZVJlbW92YWxBbmltYXRpb24gPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHRpbWVycywgYW5pbWF0aW9uU3RhdGU7XG4gICAgdGltZXJzID0gZ3MudGltZXJzLCBhbmltYXRpb25TdGF0ZSA9IGdzLmFuaW1hdGlvblN0YXRlO1xuICAgIGlmICh0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5leHBpcmVkKSB7XG4gICAgICBDb3JlLnJlbW92ZVJvd3MoZ3Mucm93c1RvUmVtb3ZlLCBncy5hcmVuYSk7XG4gICAgICBncy5yb3dzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLmhhbmRsZUtleUlucHV0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0U3RhdGUsIGxyZXN1bHQkLCByZWYkLCBrZXksIGFjdGlvbiwgYW10LCByZXMkLCBpJCwgdG8kLCBpLCBwb3MsIHksIGxyZXN1bHQxJCwgaiQsIHRvMSQsIHgsIHJlc3VsdHMkID0gW107XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgIGlmIChDb3JlLmNhbk1vdmUoYnJpY2suY3VycmVudCwgWy0xLCAwXSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgIGlmIChDb3JlLmNhbk1vdmUoYnJpY2suY3VycmVudCwgWzEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLmZvcmNlRG93bk1vZGUgPSB0cnVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICBjYXNlICdjdyc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChDb3JlLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIDEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Njdyc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIC0xLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaGFyZC1kcm9wJzpcbiAgICAgICAgICBncy5oYXJkRHJvcERpc3RhbmNlID0gMDtcbiAgICAgICAgICB3aGlsZSAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICAgICAgZ3MuaGFyZERyb3BEaXN0YW5jZSArPSAxO1xuICAgICAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ3MuaW5wdXRTdGF0ZSA9IFtdO1xuICAgICAgICAgIGdzLnRpbWVycy5oYXJkRHJvcEVmZmVjdC5yZXNldCgxICsgZ3MuaGFyZERyb3BEaXN0YW5jZSAqIDEwKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gLTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy0xJzpcbiAgICAgICAgY2FzZSAnZGVidWctMic6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTMnOlxuICAgICAgICBjYXNlICdkZWJ1Zy00JzpcbiAgICAgICAgICBhbXQgPSBwYXJzZUludChrZXkucmVwbGFjZSgvXFxEL2csICcnKSk7XG4gICAgICAgICAgbG9nKFwiREVCVUc6IERlc3Ryb3lpbmcgcm93czpcIiwgYW10KTtcbiAgICAgICAgICByZXMkID0gW107XG4gICAgICAgICAgZm9yIChpJCA9IGdzLmFyZW5hLmhlaWdodCAtIGFtdCwgdG8kID0gZ3MuYXJlbmEuaGVpZ2h0IC0gMTsgaSQgPD0gdG8kOyArK2kkKSB7XG4gICAgICAgICAgICBpID0gaSQ7XG4gICAgICAgICAgICByZXMkLnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IHJlcyQ7XG4gICAgICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgICAgIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3Mucm93c1RvUmVtb3ZlKSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy01JzpcbiAgICAgICAgICBwb3MgPSBncy5icmljay5jdXJyZW50LnBvcztcbiAgICAgICAgICBncy5icmljay5jdXJyZW50ID0gQ29yZS5uZXdCcmljayg2KTtcbiAgICAgICAgICBpbXBvcnQkKGdzLmJyaWNrLmN1cnJlbnQucG9zLCBwb3MpO1xuICAgICAgICAgIGZvciAoaSQgPSBhcmVuYS5oZWlnaHQgLSAxLCB0byQgPSBhcmVuYS5oZWlnaHQgLSA0OyBpJCA+PSB0byQ7IC0taSQpIHtcbiAgICAgICAgICAgIHkgPSBpJDtcbiAgICAgICAgICAgIGxyZXN1bHQxJCA9IFtdO1xuICAgICAgICAgICAgZm9yIChqJCA9IDAsIHRvMSQgPSBhcmVuYS53aWR0aCAtIDI7IGokIDw9IHRvMSQ7ICsraiQpIHtcbiAgICAgICAgICAgICAgeCA9IGokO1xuICAgICAgICAgICAgICBscmVzdWx0MSQucHVzaChhcmVuYS5jZWxsc1t5XVt4XSA9IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChscmVzdWx0MSQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctNic6XG4gICAgICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gWzEwLCAxMiwgMTRdO1xuICAgICAgICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAncmVtb3ZlLWxpbmVzJztcbiAgICAgICAgICBncy5mbGFncy5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5yZXNldChDb3JlLmFuaW1hdGlvblRpbWVGb3JSb3dzKGdzLnJvd3NUb1JlbW92ZSkpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChncy5mb3JjZURvd25Nb2RlID0gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuY2xlYXJPbmVGcmFtZUZsYWdzID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHJldHVybiBncy5mbGFncy5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IGZhbHNlO1xuICB9O1xuICBwcm90b3R5cGUuYWR2YW5jZUdhbWUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgY29tcGxldGVSb3dzLCByZXMkLCBpJCwgcmVmJCwgbGVuJCwgaXgsIHJvdztcbiAgICBicmljayA9IGdzLmJyaWNrLCBhcmVuYSA9IGdzLmFyZW5hLCBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgaWYgKENvcmUuaXNDb21wbGV0ZShyb3cpKSB7XG4gICAgICAgIHJlcyQucHVzaChpeCk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbXBsZXRlUm93cyA9IHJlcyQ7XG4gICAgaWYgKGNvbXBsZXRlUm93cy5sZW5ndGgpIHtcbiAgICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAncmVtb3ZlLWxpbmVzJztcbiAgICAgIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IGNvbXBsZXRlUm93cztcbiAgICAgIGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KDEwICsgTWF0aC5wb3coMywgZ3Mucm93c1RvUmVtb3ZlLmxlbmd0aCkpO1xuICAgICAgQ29yZS5jb21wdXRlU2NvcmUoZ3Muc2NvcmUsIGdzLnJvd3NUb1JlbW92ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChDb3JlLnRvcElzUmVhY2hlZChhcmVuYSkpIHtcbiAgICAgIHRoaXMucmV2ZWFsRmFpbFNjcmVlbihncyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChncy5mb3JjZURvd25Nb2RlKSB7XG4gICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnRpbWVUb0V4cGlyeSA9IDA7XG4gICAgfVxuICAgIGlmIChncy50aW1lcnMuZHJvcFRpbWVyLmV4cGlyZWQpIHtcbiAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIucmVzZXRXaXRoUmVtYWluZGVyKCk7XG4gICAgICBpZiAoQ29yZS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQ29yZS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgQ29yZS5zcGF3bk5ld0JyaWNrKGdzKTtcbiAgICAgICAgZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVLZXlJbnB1dChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93U3RhcnRTY3JlZW4gPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGlucHV0U3RhdGUsIHN0YXJ0TWVudVN0YXRlLCByZWYkLCBrZXksIGFjdGlvbiwgcmVzdWx0cyQgPSBbXTtcbiAgICBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZSwgc3RhcnRNZW51U3RhdGUgPSBncy5zdGFydE1lbnVTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dFN0YXRlLnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChTdGFydE1lbnUuc2VsZWN0UHJldkl0ZW0oc3RhcnRNZW51U3RhdGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChTdGFydE1lbnUuc2VsZWN0TmV4dEl0ZW0oc3RhcnRNZW51U3RhdGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICBpZiAoc3RhcnRNZW51U3RhdGUuY3VycmVudFN0YXRlLnN0YXRlID09PSAnc3RhcnQtZ2FtZScpIHtcbiAgICAgICAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5iZWdpbk5ld0dhbWUoZ3MpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5yZXZlYWxTdGFydFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgdGltZXJzO1xuICAgIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICB0aW1lcnMudGl0bGVSZXZlYWxUaW1lci5yZXNldCgpO1xuICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ3N0YXJ0LW1lbnUnO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0ZhaWxTY3JlZW4gPSBmdW5jdGlvbihncywgzpR0KXtcbiAgICB2YXIgaW5wdXRTdGF0ZSwgZmFpbE1lbnVTdGF0ZSwgcmVmJCwga2V5LCBhY3Rpb24sIHJlc3VsdHMkID0gW107XG4gICAgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGUsIGZhaWxNZW51U3RhdGUgPSBncy5mYWlsTWVudVN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKEZhaWxNZW51LnNlbGVjdFByZXZJdGVtKGZhaWxNZW51U3RhdGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChGYWlsTWVudS5zZWxlY3ROZXh0SXRlbShmYWlsTWVudVN0YXRlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgbG9nKGZhaWxNZW51U3RhdGUuY3VycmVudFN0YXRlLnN0YXRlKTtcbiAgICAgICAgICBpZiAoZmFpbE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdyZXN0YXJ0Jykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZmFpbE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdnby1iYWNrJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJldmVhbFN0YXJ0U2NyZWVuKGdzKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5iZWdpbk5ld0dhbWUoZ3MpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5yZXZlYWxGYWlsU2NyZWVuID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGdzLnRpbWVycy5mYWlsdXJlUmV2ZWFsVGltZXIucmVzZXQoKTtcbiAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdmYWlsdXJlJztcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZyYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlLCDOlHQpe1xuICAgIHZhciBtZXRhZ2FtZVN0YXRlO1xuICAgIG1ldGFnYW1lU3RhdGUgPSBnYW1lU3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB0aGlzLmNsZWFyT25lRnJhbWVGbGFncyhnYW1lU3RhdGUpO1xuICAgIHN3aXRjaCAobWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgdGhpcy5zaG93RmFpbFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLmFkdmFuY2VHYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIHRoaXMucmV2ZWFsU3RhcnRTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgdGhpcy5zaG93U3RhcnRTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICB0aGlzLmFkdmFuY2VSZW1vdmFsQW5pbWF0aW9uLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5kZWJ1ZygnVW5rbm93biBtZXRhZ2FtZS1zdGF0ZTonLCBtZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRldHJpc0dhbWU6IFRldHJpc0dhbWVcbn07XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCB3cmFwLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3N0YXJ0LWdhbWUnLFxuICAgIHRleHQ6IFwiU3RhcnQgR2FtZVwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ25vdGhpbmcnLFxuICAgIHRleHQ6IFwiRG9uJ3QgU3RhcnQgR2FtZVwiXG4gIH1cbl07XG5saW1pdGVyID0gd3JhcCgwLCBtZW51RGF0YS5sZW5ndGggLSAxKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdhbWVzdGF0ZSl7XG4gIHJldHVybiBnYW1lc3RhdGUuc3RhcnRNZW51U3RhdGUgPSB7XG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGN1cnJlbnRTdGF0ZTogbWVudURhdGFbMF0sXG4gICAgbWVudURhdGE6IG1lbnVEYXRhXG4gIH07XG59O1xub3V0JC5jaG9vc2VPcHRpb24gPSBjaG9vc2VPcHRpb24gPSBmdW5jdGlvbihzbXMsIGluZGV4KXtcbiAgc21zLmN1cnJlbnRJbmRleCA9IGxpbWl0ZXIoaW5kZXgpO1xuICByZXR1cm4gc21zLmN1cnJlbnRTdGF0ZSA9IG1lbnVEYXRhW3Ntcy5jdXJyZW50SW5kZXhdO1xufTtcbm91dCQuc2VsZWN0UHJldkl0ZW0gPSBzZWxlY3RQcmV2SXRlbSA9IGZ1bmN0aW9uKHNtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IHNtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oc21zLCBjdXJyZW50SW5kZXggLSAxKTtcbn07XG5vdXQkLnNlbGVjdE5leHRJdGVtID0gc2VsZWN0TmV4dEl0ZW0gPSBmdW5jdGlvbihzbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBzbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKHNtcywgY3VycmVudEluZGV4ICsgMSk7XG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgcmFuZCwgZmxvb3IsIEJhc2UsIG1lc2hNYXRlcmlhbHMsIEFyZW5hQ2VsbHMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5tZXNoTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vcGFsZXR0ZScpLm1lc2hNYXRlcmlhbHM7XG5vdXQkLkFyZW5hQ2VsbHMgPSBBcmVuYUNlbGxzID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYUNlbGxzLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdBcmVuYUNlbGxzJywgQXJlbmFDZWxscyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYUNlbGxzO1xuICBmdW5jdGlvbiBBcmVuYUNlbGxzKG9wdHMsIGdzKXtcbiAgICB2YXIgYmxvY2tTaXplLCBncmlkU2l6ZSwgd2lkdGgsIGhlaWdodCwgcmVmJCwgcmVzJCwgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgY3ViZTtcbiAgICBibG9ja1NpemUgPSBvcHRzLmJsb2NrU2l6ZSwgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIEFyZW5hQ2VsbHMuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmdlb20uYm94ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJsb2NrU2l6ZSwgYmxvY2tTaXplLCBibG9ja1NpemUpO1xuICAgIHRoaXMubWF0cy56YXAgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IDB4ZmZmZmZmLFxuICAgICAgZW1pc3NpdmU6IDB4ZmZmZmZmXG4gICAgfSk7XG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMub2Zmc2V0KTtcbiAgICByZWYkID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb247XG4gICAgcmVmJC54ID0gd2lkdGggLyAtMiArIDAuNSAqIGdyaWRTaXplO1xuICAgIHJlZiQueSA9IGhlaWdodCAtIDAuNSAqIGdyaWRTaXplO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBwaTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGdzLmFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tLmJveCwgdGhpcy5tYXRzLm5vcm1hbCk7XG4gICAgICAgIGN1YmUucG9zaXRpb24uc2V0KHggKiBncmlkU2l6ZSwgeSAqIGdyaWRTaXplLCAwKTtcbiAgICAgICAgY3ViZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub2Zmc2V0LmFkZChjdWJlKTtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdWJlKTtcbiAgICAgIH1cbiAgICAgIHJlcyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHRoaXMuY2VsbHMgPSByZXMkO1xuICB9XG4gIHByb3RvdHlwZS50b2dnbGVSb3dPZkNlbGxzID0gZnVuY3Rpb24ocm93SXgsIHN0YXRlKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGJveCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5jZWxsc1tyb3dJeF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBib3ggPSByZWYkW2kkXTtcbiAgICAgIGJveC5tYXRlcmlhbCA9IHRoaXMubWF0cy56YXA7XG4gICAgICByZXN1bHRzJC5wdXNoKGJveC52aXNpYmxlID0gc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93WmFwRWZmZWN0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBhcmVuYSwgcm93c1RvUmVtb3ZlLCB0aW1lcnMsIG9uT2ZmLCBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlLCB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgb25PZmYgPSB0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcyA8IDAuNCAmJiAhIShmbG9vcih0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5jdXJyZW50VGltZSAqIDEwKSAlIDIpO1xuICAgIG9uT2ZmID0gIShmbG9vcih0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5jdXJyZW50VGltZSkgJSAyKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93SXggPSByb3dzVG9SZW1vdmVbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnRvZ2dsZVJvd09mQ2VsbHMocm93SXgsIG9uT2ZmKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZUNlbGxzID0gZnVuY3Rpb24oY2VsbHMpe1xuICAgIHZhciBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIHRoaXMuY2VsbHNbeV1beF0udmlzaWJsZSA9ICEhY2VsbDtcbiAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmNlbGxzW3ldW3hdLm1hdGVyaWFsID0gbWVzaE1hdGVyaWFsc1tjZWxsXSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gQXJlbmFDZWxscztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgcmFuZCwgQmFzZSwgRnJhbWUsIEJyaWNrLCBHdWlkZUxpbmVzLCBBcmVuYUNlbGxzLCBQYXJ0aWNsZUVmZmVjdCwgQXJlbmEsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIG1heCA9IHJlZiQubWF4LCByYW5kID0gcmVmJC5yYW5kO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5GcmFtZSA9IHJlcXVpcmUoJy4vZnJhbWUnKS5GcmFtZTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrO1xuR3VpZGVMaW5lcyA9IHJlcXVpcmUoJy4vZ3VpZGUtbGluZXMnKS5HdWlkZUxpbmVzO1xuQXJlbmFDZWxscyA9IHJlcXVpcmUoJy4vYXJlbmEtY2VsbHMnKS5BcmVuYUNlbGxzO1xuUGFydGljbGVFZmZlY3QgPSByZXF1aXJlKCcuL3BhcnRpY2xlLWVmZmVjdCcpLlBhcnRpY2xlRWZmZWN0O1xub3V0JC5BcmVuYSA9IEFyZW5hID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmEnLCBBcmVuYSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYTtcbiAgZnVuY3Rpb24gQXJlbmEob3B0cywgZ3Mpe1xuICAgIHZhciBuYW1lLCByZWYkLCBwYXJ0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQXJlbmEuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGxvZygnUmVuZGVyZXI6OkFyZW5hOjpuZXcnKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMFxuICAgIH07XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIGZyYW1lOiBuZXcgRnJhbWUodGhpcy5vcHRzLCBncyksXG4gICAgICBndWlkZUxpbmVzOiBuZXcgR3VpZGVMaW5lcyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hQ2VsbHM6IG5ldyBBcmVuYUNlbGxzKHRoaXMub3B0cywgZ3MpLFxuICAgICAgdGhpc0JyaWNrOiBuZXcgQnJpY2sodGhpcy5vcHRzLCBncyksXG4gICAgICBwYXJ0aWNsZXM6IG5ldyBQYXJ0aWNsZUVmZmVjdCh0aGlzLm9wdHMsIGdzKVxuICAgIH07XG4gICAgZm9yIChuYW1lIGluIHJlZiQgPSB0aGlzLnBhcnRzKSB7XG4gICAgICBwYXJ0ID0gcmVmJFtuYW1lXTtcbiAgICAgIHBhcnQuYWRkVG8odGhpcy5yZWdpc3RyYXRpb24pO1xuICAgIH1cbiAgfVxuICBwcm90b3R5cGUuam9sdCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcm93c1RvUmVtb3ZlLCB0aW1lcnMsIHAsIHp6LCBqb2x0O1xuICAgIHJvd3NUb1JlbW92ZSA9IGdzLnJvd3NUb1JlbW92ZSwgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHAgPSBtYXgoMCwgMSAtIHRpbWVycy5oYXJkRHJvcEVmZmVjdC5wcm9ncmVzcyk7XG4gICAgenogPSByb3dzVG9SZW1vdmUubGVuZ3RoO1xuICAgIHJldHVybiBqb2x0ID0gLTEgKiBwICogKDEgKyB6eikgKiB0aGlzLm9wdHMuaGFyZERyb3BKb2x0QW1vdW50O1xuICB9O1xuICBwcm90b3R5cGUuaml0dGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzVG9SZW1vdmUsIHAsIHp6LCBqaXR0ZXI7XG4gICAgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlO1xuICAgIHAgPSAxIC0gZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3M7XG4gICAgenogPSByb3dzVG9SZW1vdmUubGVuZ3RoICogdGhpcy5vcHRzLmdyaWRTaXplIC8gNDA7XG4gICAgcmV0dXJuIGppdHRlciA9IFtwICogcmFuZCgtenosIHp6KSwgcCAqIHJhbmQoLXp6LCB6eildO1xuICB9O1xuICBwcm90b3R5cGUuemFwTGluZXMgPSBmdW5jdGlvbihncywgcG9zaXRpb25SZWNlaXZpbmdKb2x0KXtcbiAgICB2YXIgYXJlbmEsIHJvd3NUb1JlbW92ZSwgdGltZXJzLCBqb2x0LCBqaXR0ZXI7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlLCB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgdGhpcy5wYXJ0cy5hcmVuYUNlbGxzLnNob3daYXBFZmZlY3QoZ3MpO1xuICAgIGlmIChncy5mbGFncy5yb3dzUmVtb3ZlZFRoaXNGcmFtZSkge1xuICAgICAgdGhpcy5wYXJ0cy5wYXJ0aWNsZXMucmVzZXQoKTtcbiAgICAgIHRoaXMucGFydHMucGFydGljbGVzLnByZXBhcmUocm93c1RvUmVtb3ZlKTtcbiAgICAgIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCA9IDA7XG4gICAgfVxuICAgIGpvbHQgPSB0aGlzLmpvbHQoZ3MpO1xuICAgIGppdHRlciA9IHRoaXMuaml0dGVyKGdzKTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueCA9IGppdHRlclswXTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IGppdHRlclsxXSArIGpvbHQgLyAxMDtcbiAgICByZXR1cm4gdGhpcy5wYXJ0cy5ndWlkZUxpbmVzLmRhbmNlKGdzLmVsYXBzZWRUaW1lKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgdGltZXJzO1xuICAgIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICByZXR1cm4gdGhpcy5wYXJ0cy5wYXJ0aWNsZXMudXBkYXRlKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzLCB0aGlzLnN0YXRlLmZyYW1lc1NpbmNlUm93c1JlbW92ZWQsIGdzLs6UdCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncywgcG9zaXRpb25SZWNlaXZpbmdKb2x0KXtcbiAgICB2YXIgYXJlbmEsIGJyaWNrLCBncmlkLCBoZWlnaHQ7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgYnJpY2sgPSBncy5icmljaztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMudXBkYXRlQ2VsbHMoYXJlbmEuY2VsbHMpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLmRpc3BsYXlTaGFwZShicmljay5jdXJyZW50KTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIGhlaWdodCA9IGdyaWQgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5wYXJ0cy50aGlzQnJpY2sucm9vdC5wb3NpdGlvbi5zZXQoZ3JpZCAqIGJyaWNrLmN1cnJlbnQucG9zWzBdLCBoZWlnaHQgLSBncmlkICogYnJpY2suY3VycmVudC5wb3NbMV0sIDApO1xuICAgIHRoaXMucGFydHMuZ3VpZGVMaW5lcy5zaG93QmVhbShicmljay5jdXJyZW50KTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IHRoaXMuam9sdChncyk7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCArPSAxO1xuICB9O1xuICByZXR1cm4gQXJlbmE7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5CYXNlID0gQmFzZSA9IChmdW5jdGlvbigpe1xuICBCYXNlLmRpc3BsYXlOYW1lID0gJ0Jhc2UnO1xuICB2YXIgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyT3BhY2l0eSwgaGVscGVyTWFya2VyR2VvLCByZWRIZWxwZXJNYXQsIGJsdWVIZWxwZXJNYXQsIHByb3RvdHlwZSA9IEJhc2UucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJhc2U7XG4gIGhlbHBlck1hcmtlclNpemUgPSAwLjAyO1xuICBoZWxwZXJNYXJrZXJPcGFjaXR5ID0gMC41O1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUpO1xuICByZWRIZWxwZXJNYXQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweGZmMDAwMCxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiBoZWxwZXJNYXJrZXJPcGFjaXR5XG4gIH0pO1xuICBibHVlSGVscGVyTWF0ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgwMGZmMDAsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogaGVscGVyTWFya2VyT3BhY2l0eVxuICB9KTtcbiAgZnVuY3Rpb24gQmFzZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yb290LmFkZCh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgdGhpcy5nZW9tID0ge307XG4gICAgdGhpcy5tYXRzID0ge1xuICAgICAgbm9ybWFsOiBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5hZGRSZWdpc3RyYXRpb25IZWxwZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzdGFydCwgZW5kLCBkaXIsIGFycm93O1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCByZWRIZWxwZXJNYXQpKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBibHVlSGVscGVyTWF0KSk7XG4gICAgc3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcbiAgICBlbmQgPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbjtcbiAgICBkaXIgPSBuZXcgVEhSRUUuVmVjdG9yMygpLnN1YlZlY3RvcnMoZW5kLCBzdGFydCkubm9ybWFsaXplKCk7XG4gICAgYXJyb3cgPSBuZXcgVEhSRUUuQXJyb3dIZWxwZXIoZGlyLCBzdGFydCwgc3RhcnQuZGlzdGFuY2VUbyhlbmQsIDB4MDAwMGZmKSk7XG4gICAgdGhpcy5yb290LmFkZChhcnJvdyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29uc29sZS5kZWJ1ZygnQ0hBTkdFJywgdGhpcywgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbG9nKCdSZWdpc3RyYXRpb24gaGVscGVyIGZvcjonLCB0aGlzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZEJveEhlbHBlciA9IGZ1bmN0aW9uKHRoaW5nKXtcbiAgICB2YXIgYmJveDtcbiAgICBiYm94ID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaW5nLCAweDU1NTVmZik7XG4gICAgYmJveC51cGRhdGUoKTtcbiAgICByZXR1cm4gdGhpcy5yb290LmFkZChiYm94KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVJlZ2lzdHJhdGlvbkhlbHBlciA9IGZ1bmN0aW9uKCl7fTtcbiAgcHJvdG90eXBlLnNob3dCb3VuZHMgPSBmdW5jdGlvbihzY2VuZSl7XG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpcy5yb290LCAweDU1NTU1NSk7XG4gICAgdGhpcy5ib3VuZHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIHNjZW5lLmFkZCh0aGlzLmJvdW5kcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hZGRUbyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIG9iai5hZGQodGhpcy5yb290KTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Bvc2l0aW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJvb3QucG9zaXRpb247XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Zpc2libGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC52aXNpYmxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihzdGF0ZSl7XG4gICAgICB0aGlzLnJvb3QudmlzaWJsZSA9IHN0YXRlO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBCYXNlO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBCYXNlLCBCcmljaywgQnJpY2tQcmV2aWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2s7XG5vdXQkLkJyaWNrUHJldmlldyA9IEJyaWNrUHJldmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByZXR0eU9mZnNldCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmlja1ByZXZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrUHJldmlldycsIEJyaWNrUHJldmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmlja1ByZXZpZXc7XG4gIHByZXR0eU9mZnNldCA9IHtcbiAgICBzcXVhcmU6IFswLCAwXSxcbiAgICB6aWc6IFswLjUsIDBdLFxuICAgIHphZzogWzAuNSwgMF0sXG4gICAgbGVmdDogWzAuNSwgMF0sXG4gICAgcmlnaHQ6IFswLjUsIDBdLFxuICAgIHRlZTogWzAuNSwgMF0sXG4gICAgdGV0cmlzOiBbMCwgMC41XVxuICB9O1xuICBmdW5jdGlvbiBCcmlja1ByZXZpZXcob3B0cywgZ3Mpe1xuICAgIHZhciBwcmV2aWV3U2NhbGVGYWN0b3IsIHM7XG4gICAgcHJldmlld1NjYWxlRmFjdG9yID0gb3B0cy5wcmV2aWV3U2NhbGVGYWN0b3I7XG4gICAgQnJpY2tQcmV2aWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBzID0gcHJldmlld1NjYWxlRmFjdG9yO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2sodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5icmljay5yb290LnNjYWxlLnNldChzLCBzLCBzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljay5yb290KTtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBncmlkLCByZWYkLCB4LCB5O1xuICAgIHRoaXMuYnJpY2suZGlzcGxheVNoYXBlKGJyaWNrKTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIHJlZiQgPSBwcmV0dHlPZmZzZXRbYnJpY2sudHlwZV0sIHggPSByZWYkWzBdLCB5ID0gcmVmJFsxXTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gKC0xLjUgKyB4KSAqIGdyaWQ7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSAoLTEuNSArIHkgKyA1KSAqIGdyaWQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVXaWdnbGUgPSBmdW5jdGlvbihicmljaywgZWxhcHNlZFRpbWUpe1xuICAgIHJldHVybiB0aGlzLnJvb3Qucm90YXRpb24ueSA9IDAuMiAqIHNpbihlbGFwc2VkVGltZSAvIDUwMCk7XG4gIH07XG4gIHJldHVybiBCcmlja1ByZXZpZXc7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgQmFzZSwgbWVzaE1hdGVyaWFscywgQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5CcmljayA9IEJyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJldHR5T2Zmc2V0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmljaycsIEJyaWNrKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrO1xuICBwcmV0dHlPZmZzZXQgPSB7XG4gICAgc3F1YXJlOiBbMCwgMF0sXG4gICAgemlnOiBbMC41LCAwXSxcbiAgICB6YWc6IFswLjUsIDBdLFxuICAgIGxlZnQ6IFswLjUsIDBdLFxuICAgIHJpZ2h0OiBbMC41LCAwXSxcbiAgICB0ZWU6IFswLjUsIDBdLFxuICAgIHRldHJpczogWzAsIC0wLjVdXG4gIH07XG4gIGZ1bmN0aW9uIEJyaWNrKG9wdHMsIGdzKXtcbiAgICB2YXIgc2l6ZSwgZ3JpZCwgd2lkdGgsIGhlaWdodCwgcmVzJCwgaSQsIGksIGN1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmljay5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgc2l6ZSA9IHRoaXMub3B0cy5ibG9ja1NpemU7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICB3aWR0aCA9IGdyaWQgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuZ2VvbS5icmlja0JveCA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkLCAtMC41ICogZ3JpZCwgMCk7XG4gICAgdGhpcy5icmljayA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljayk7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAzOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tLmJyaWNrQm94LCB0aGlzLm1hdHMubm9ybWFsKTtcbiAgICAgIHRoaXMuYnJpY2suYWRkKGN1YmUpO1xuICAgICAgY3ViZS5jYXN0U2hhZG93ID0gdHJ1ZTtcbiAgICAgIHJlcyQucHVzaChjdWJlKTtcbiAgICB9XG4gICAgdGhpcy5jZWxscyA9IHJlcyQ7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGFyZyQsIGl4KXtcbiAgICB2YXIgc2hhcGUsIGdyaWQsIG1hcmdpbiwgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgeCQsIHJlc3VsdHMkID0gW107XG4gICAgc2hhcGUgPSBhcmckLnNoYXBlO1xuICAgIGl4ID09IG51bGwgJiYgKGl4ID0gMCk7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBtYXJnaW4gPSAodGhpcy5vcHRzLmdyaWRTaXplIC0gdGhpcy5vcHRzLmJsb2NrU2l6ZSkgLyAyO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gc2hhcGUubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHNoYXBlW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgeCQgPSB0aGlzLmNlbGxzW2l4XTtcbiAgICAgICAgICB4JC5tYXRlcmlhbCA9IG1lc2hNYXRlcmlhbHNbY2VsbF07XG4gICAgICAgICAgeCQucG9zaXRpb24uc2V0KHggKiBncmlkICsgbWFyZ2luLCB5ICogZ3JpZCArIG1hcmdpbiwgMCk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChpeCArPSAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIEJyaWNrO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgbWF4LCBCYXNlLCBGYWlsU2NyZWVuLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBtYXggPSByZWYkLm1heDtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5GYWlsU2NyZWVuID0gRmFpbFNjcmVlbiA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoRmFpbFNjcmVlbiwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRmFpbFNjcmVlbicsIEZhaWxTY3JlZW4pLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRmFpbFNjcmVlbjtcbiAgZnVuY3Rpb24gRmFpbFNjcmVlbihvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGYWlsU2NyZWVuLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBsb2coXCJGYWlsU2NyZWVuOjpuZXdcIik7XG4gIH1cbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXt9O1xuICByZXR1cm4gRmFpbFNjcmVlbjtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIEZyYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkZyYW1lID0gRnJhbWUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZyYW1lLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGcmFtZScsIEZyYW1lKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lO1xuICBmdW5jdGlvbiBGcmFtZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGcmFtZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgcmV0dXJuIEZyYW1lO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIEJhc2UsIGxpbmVNYXRlcmlhbHMsIHJvd3NUb0NvbHMsIEd1aWRlTGluZXMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubGluZU1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5saW5lTWF0ZXJpYWxzO1xucm93c1RvQ29scyA9IGZ1bmN0aW9uKHJvd3Mpe1xuICB2YXIgY29scywgaSQsIHRvJCwgeSwgaiQsIHRvMSQsIHg7XG4gIGNvbHMgPSBbXTtcbiAgZm9yIChpJCA9IDAsIHRvJCA9IHJvd3NbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICBmb3IgKGokID0gMCwgdG8xJCA9IHJvd3MubGVuZ3RoOyBqJCA8IHRvMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIChjb2xzW3ldIHx8IChjb2xzW3ldID0gW10pKVt4XSA9IHJvd3NbeF1beV07XG4gICAgfVxuICB9XG4gIHJldHVybiBjb2xzO1xufTtcbm91dCQuR3VpZGVMaW5lcyA9IEd1aWRlTGluZXMgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEd1aWRlTGluZXMsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0d1aWRlTGluZXMnLCBHdWlkZUxpbmVzKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEd1aWRlTGluZXM7XG4gIGZ1bmN0aW9uIEd1aWRlTGluZXMob3B0cywgZ3Mpe1xuICAgIHZhciBncmlkU2l6ZSwgd2lkdGgsIGhlaWdodCwgbWVzaCwgaSQsIGksIGxpbmUsIHJlZiQ7XG4gICAgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIEd1aWRlTGluZXMuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgbWVzaCA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgIG1lc2gudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSwgbmV3IFRIUkVFLlZlY3RvcjMoMCwgaGVpZ2h0LCAwKSk7XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIGxpbmUgPSBuZXcgVEhSRUUuTGluZShtZXNoLCBsaW5lTWF0ZXJpYWxzW2ldKTtcbiAgICAgIHJlZiQgPSBsaW5lLnBvc2l0aW9uO1xuICAgICAgcmVmJC54ID0gaSAqIGdyaWRTaXplO1xuICAgICAgcmVmJC55ID0gMDtcbiAgICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChsaW5lKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkU2l6ZTtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0JlYW0gPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBsaW5lLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubGluZXMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBsaW5lID0gcmVmJFtpJF07XG4gICAgICBsaW5lLm1hdGVyaWFsID0gbGluZU1hdGVyaWFsc1swXTtcbiAgICB9XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGJyaWNrLnNoYXBlKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5saW5lc1ticmljay5wb3NbMF0gKyB4XS5tYXRlcmlhbCA9IGxpbmVNYXRlcmlhbHNbY2VsbF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuZGFuY2UgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGksIGxpbmUsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubGluZXMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBsaW5lID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKGxpbmUubWF0ZXJpYWwgPSBsaW5lTWF0ZXJpYWxzWyhpICsgZmxvb3IodGltZSAvIDEwMCkpICUgOF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBHdWlkZUxpbmVzO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgQXJlbmEsIFRpdGxlLCBUYWJsZSwgQnJpY2tQcmV2aWV3LCBMaWdodGluZywgTml4aWVEaXNwbGF5LCBTdGFydE1lbnUsIEZhaWxTY3JlZW4sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9hcmVuYScpLCBBcmVuYSA9IHJlZiQuQXJlbmEsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3RpdGxlJyksIFRpdGxlID0gcmVmJC5UaXRsZSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGFibGUnKSwgVGFibGUgPSByZWYkLlRhYmxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9icmljay1wcmV2aWV3JyksIEJyaWNrUHJldmlldyA9IHJlZiQuQnJpY2tQcmV2aWV3LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9saWdodGluZycpLCBMaWdodGluZyA9IHJlZiQuTGlnaHRpbmcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL25peGllJyksIE5peGllRGlzcGxheSA9IHJlZiQuTml4aWVEaXNwbGF5LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9zdGFydC1tZW51JyksIFN0YXJ0TWVudSA9IHJlZiQuU3RhcnRNZW51LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9mYWlsLXNjcmVlbicpLCBGYWlsU2NyZWVuID0gcmVmJC5GYWlsU2NyZWVuLCByZWYkKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgQmFzZSwgTGlnaHRpbmcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5MaWdodGluZyA9IExpZ2h0aW5nID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgbWFpbkxpZ2h0RGlzdGFuY2UsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTGlnaHRpbmcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xpZ2h0aW5nJywgTGlnaHRpbmcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTGlnaHRpbmc7XG4gIG1haW5MaWdodERpc3RhbmNlID0gMjtcbiAgZnVuY3Rpb24gTGlnaHRpbmcob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTGlnaHRpbmcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgbWFpbkxpZ2h0RGlzdGFuY2UpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDApO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5saWdodCk7XG4gICAgdGhpcy5zcG90bGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KDB4ZmZmZmZmLCAxLCA1MCwgMSk7XG4gICAgdGhpcy5zcG90bGlnaHQucG9zaXRpb24uc2V0KDAsIDMsIC0xKTtcbiAgICB0aGlzLnNwb3RsaWdodC50YXJnZXQucG9zaXRpb24uc2V0KDAsIDAsIC0xKTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMuc3BvdGxpZ2h0KTtcbiAgICB0aGlzLmFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KDB4MzMzMzMzKTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMuYW1iaWVudCk7XG4gICAgdGhpcy5zcG90bGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93RGFya25lc3MgPSAwLjU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93QmlhcyA9IDAuMDAwMTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFOZWFyID0gMTA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRmFyID0gMjUwMDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFGb3YgPSA1MDtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLlBvaW50TGlnaHRIZWxwZXIodGhpcy5saWdodCwgbWFpbkxpZ2h0RGlzdGFuY2UpKTtcbiAgICByZXR1cm4gdGhpcy5yb290LmFkZChuZXcgVEhSRUUuU3BvdExpZ2h0SGVscGVyKHRoaXMuc3BvdGxpZ2h0KSk7XG4gIH07XG4gIHJldHVybiBMaWdodGluZztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsZXJwLCBsb2csIGZsb29yLCBtYXAsIHNwbGl0LCBwaSwgdGF1LCBCYXNlLCBjYW52YXNUZXh0dXJlLCBkaWdpdFRleHR1cmVzLCByZXMkLCBpJCwgaSwgTml4aWVUdWJlLCBOaXhpZURpc3BsYXksIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXMsIHNsaWNlJCA9IFtdLnNsaWNlO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxlcnAgPSByZWYkLmxlcnAsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwLCBzcGxpdCA9IHJlZiQuc3BsaXQsIHBpID0gcmVmJC5waSwgdGF1ID0gcmVmJC50YXU7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbnJlcXVpcmUoJy4uL2dlb21ldHJ5L2NhcHN1bGUnKTtcbmNhbnZhc1RleHR1cmUgPSBmdW5jdGlvbigpe1xuICB2YXIgdGV4dHVyZVNpemUsIGZpZGVsaXR5RmFjdG9yLCB0ZXh0Q252LCBpbWdDbnYsIHRleHRDdHgsIGltZ0N0eDtcbiAgdGV4dHVyZVNpemUgPSAxMDI0O1xuICBmaWRlbGl0eUZhY3RvciA9IDEwMDtcbiAgdGV4dENudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBpbWdDbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGV4dEN0eCA9IHRleHRDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ3R4ID0gaW1nQ252LmdldENvbnRleHQoJzJkJyk7XG4gIGltZ0Nudi53aWR0aCA9IGltZ0Nudi5oZWlnaHQgPSB0ZXh0dXJlU2l6ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB0ZXh0U2l6ZSwgcmVmJDtcbiAgICB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0LCB0ZXh0ID0gYXJnJC50ZXh0LCB0ZXh0U2l6ZSA9IChyZWYkID0gYXJnJC50ZXh0U2l6ZSkgIT0gbnVsbCA/IHJlZiQgOiAxMDtcbiAgICB0ZXh0Q252LndpZHRoID0gd2lkdGggKiBmaWRlbGl0eUZhY3RvcjtcbiAgICB0ZXh0Q252LmhlaWdodCA9IGhlaWdodCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgdGV4dEN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICB0ZXh0Q3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgdGV4dEN0eC5mb250ID0gdGV4dFNpemUgKiBmaWRlbGl0eUZhY3RvciArIFwicHggbW9ub3NwYWNlXCI7XG4gICAgdGV4dEN0eC5maWxsVGV4dCh0ZXh0LCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yIC8gMiwgaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3IgLyAyLCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yKTtcbiAgICBpbWdDdHguY2xlYXJSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmZpbGxSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmRyYXdJbWFnZSh0ZXh0Q252LCAwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIHJldHVybiBpbWdDbnYudG9EYXRhVVJMKCk7XG4gIH07XG59KCk7XG5yZXMkID0gW107XG5mb3IgKGkkID0gMDsgaSQgPD0gOTsgKytpJCkge1xuICBpID0gaSQ7XG4gIHJlcyQucHVzaChjYW52YXNUZXh0dXJlKHtcbiAgICB0ZXh0OiBTdHJpbmcoaSksXG4gICAgd2lkdGg6IDUwLFxuICAgIGhlaWdodDogMTAwLFxuICAgIHRleHRTaXplOiAxMDBcbiAgfSkpO1xufVxuZGlnaXRUZXh0dXJlcyA9IHJlcyQ7XG5OaXhpZVR1YmUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciB0dWJlUmFkaXVzLCB0dWJlSGVpZ2h0LCBiYXNlSGVpZ2h0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5peGllVHViZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTml4aWVUdWJlJywgTml4aWVUdWJlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5peGllVHViZTtcbiAgdHViZVJhZGl1cyA9IDAuMDEyNTtcbiAgdHViZUhlaWdodCA9IDAuMDU7XG4gIGJhc2VIZWlnaHQgPSAwLjAxO1xuICBmdW5jdGlvbiBOaXhpZVR1YmUob3B0cywgZ3Mpe1xuICAgIHZhciBnbGFzc01hdCwgYmFzZUdlbywgYmFzZU1hdCwgcmVzJCwgaSQsIHJlZiQsIGxlbiQsIGl4LCBpLCBxdWFkO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTml4aWVUdWJlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBnbGFzc01hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogMHgyMjIyMjIsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgICAgIHNoaW5pbmVzczogMTAwLFxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICBkZXB0aFdyaXRlOiBmYWxzZVxuICAgIH0pO1xuICAgIGJhc2VHZW8gPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSh0dWJlUmFkaXVzICogMS4xLCB0dWJlUmFkaXVzICogMS4xLCBiYXNlSGVpZ2h0LCAzMiwgMCk7XG4gICAgYmFzZU1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogMHg0NDQ0NDQsXG4gICAgICBzcGVjdWxhcjogMHg5OTk5OTksXG4gICAgICBzaGluaW5lc3M6IDBcbiAgICB9KTtcbiAgICB0aGlzLmdsYXNzID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSh0dWJlUmFkaXVzLCAxNiwgdHViZUhlaWdodCwgMCksIGdsYXNzTWF0KTtcbiAgICB0aGlzLmJhc2UgPSBuZXcgVEhSRUUuTWVzaChiYXNlR2VvLCBiYXNlTWF0KTtcbiAgICB0aGlzLmdsYXNzLnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmdsYXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iYXNlKTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBpID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVEaWdpdFF1YWQoaSwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gdHViZUhlaWdodCAvIDI7XG4gICAgICBxdWFkLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHF1YWQuZGlnaXQgPSBpO1xuICAgICAgcXVhZC5yZW5kZXJPcmRlciA9IDA7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQocXVhZCk7XG4gICAgICByZXMkLnB1c2gocXVhZCk7XG4gICAgfVxuICAgIHRoaXMuZGlnaXRzID0gcmVzJDtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0RpZ2l0ID0gZnVuY3Rpb24oZGlnaXQpe1xuICAgIHJldHVybiB0aGlzLmRpZ2l0cy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnZpc2libGUgPSBpdC5kaWdpdCA9PT0gZGlnaXQ7XG4gICAgfSk7XG4gIH07XG4gIHByb3RvdHlwZS5jcmVhdGVEaWdpdFF1YWQgPSBmdW5jdGlvbihkaWdpdCwgaXgpe1xuICAgIHZhciBpbWFnZSwgdGV4LCBnZW9tLCBtYXQsIHF1YWQ7XG4gICAgaW1hZ2UgPSBkaWdpdFRleHR1cmVzW2RpZ2l0XTtcbiAgICB0ZXggPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGltYWdlKTtcbiAgICBnZW9tID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMC4wMjUsIDAuMDUpO1xuICAgIG1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleCxcbiAgICAgIGFscGhhTWFwOiB0ZXgsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGVtaXNzaXZlOiAweGZmOTk0NFxuICAgIH0pO1xuICAgIHJldHVybiBxdWFkID0gbmV3IFRIUkVFLk1lc2goZ2VvbSwgbWF0KTtcbiAgfTtcbiAgcmV0dXJuIE5peGllVHViZTtcbn0oQmFzZSkpO1xub3V0JC5OaXhpZURpc3BsYXkgPSBOaXhpZURpc3BsYXkgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5peGllRGlzcGxheSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTml4aWVEaXNwbGF5JywgTml4aWVEaXNwbGF5KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5peGllRGlzcGxheTtcbiAgZnVuY3Rpb24gTml4aWVEaXNwbGF5KG9wdHMsIGdzKXtcbiAgICB2YXIgcmVzJCwgaSQsIHRvJCwgaSwgdHViZTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllRGlzcGxheS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5jb3VudCA9IDU7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxhc3RTZWVuTnVtYmVyOiAwXG4gICAgfTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMuY291bnQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0dWJlID0gbmV3IE5peGllVHViZSh0aGlzLm9wdHMsIGdzKTtcbiAgICAgIHR1YmUucG9zaXRpb24ueCA9IGkgKiB0aGlzLm9wdHMuYmxvY2tTaXplO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHR1YmUucm9vdCk7XG4gICAgICByZXMkLnB1c2godHViZSk7XG4gICAgfVxuICAgIHRoaXMudHViZXMgPSByZXMkO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLnNjb3JlRGlzdGFuY2VGcm9tRWRnZTtcbiAgfVxuICBwcm90b3R5cGUucnVuVG9OdW1iZXIgPSBmdW5jdGlvbihwLCBudW0pe1xuICAgIHZhciBuZXh0TnVtYmVyO1xuICAgIG5leHROdW1iZXIgPSBmbG9vcihsZXJwKHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIsIG51bSwgcCkpO1xuICAgIHJldHVybiB0aGlzLnNob3dOdW1iZXIobmV4dE51bWJlcik7XG4gIH07XG4gIHByb3RvdHlwZS5zZXROdW1iZXIgPSBmdW5jdGlvbihudW0pe1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIgPSBudW07XG4gICAgcmV0dXJuIHRoaXMuc2hvd051bWJlcihudW0pO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd051bWJlciA9IGZ1bmN0aW9uKG51bSl7XG4gICAgdmFyIGRpZ2l0cywgaSQsIGksIHR1YmUsIGRpZ2l0LCByZXN1bHRzJCA9IFtdO1xuICAgIG51bSA9PSBudWxsICYmIChudW0gPSAwKTtcbiAgICBkaWdpdHMgPSBtYXAocGFydGlhbGl6ZSQuYXBwbHkodGhpcywgW3BhcnNlSW50LCBbdm9pZCA4LCAxMF0sIFswXV0pKShcbiAgICBzcGxpdCgnJykoXG4gICAgZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnRvU3RyaW5nKCk7XG4gICAgfShcbiAgICBudW0pKSk7XG4gICAgZm9yIChpJCA9IHRoaXMuY291bnQgLSAxOyBpJCA+PSAwOyAtLWkkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0dWJlID0gdGhpcy50dWJlc1tpXTtcbiAgICAgIGRpZ2l0ID0gZGlnaXRzLnBvcCgpO1xuICAgICAgcmVzdWx0cyQucHVzaCh0dWJlLnNob3dEaWdpdChkaWdpdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBOaXhpZURpc3BsYXk7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gcGFydGlhbGl6ZSQoZiwgYXJncywgd2hlcmUpe1xuICB2YXIgY29udGV4dCA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBwYXJhbXMgPSBzbGljZSQuY2FsbChhcmd1bWVudHMpLCBpLFxuICAgICAgICBsZW4gPSBwYXJhbXMubGVuZ3RoLCB3bGVuID0gd2hlcmUubGVuZ3RoLFxuICAgICAgICB0YSA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW10sIHR3ID0gd2hlcmUgPyB3aGVyZS5jb25jYXQoKSA6IFtdO1xuICAgIGZvcihpID0gMDsgaSA8IGxlbjsgKytpKSB7IHRhW3R3WzBdXSA9IHBhcmFtc1tpXTsgdHcuc2hpZnQoKTsgfVxuICAgIHJldHVybiBsZW4gPCB3bGVuICYmIGxlbiA/XG4gICAgICBwYXJ0aWFsaXplJC5hcHBseShjb250ZXh0LCBbZiwgdGEsIHR3XSkgOiBmLmFwcGx5KGNvbnRleHQsIHRhKTtcbiAgfTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCByYW5kLCBmbG9vciwgQmFzZSwgbWVzaE1hdGVyaWFscywgUGFydGljbGVCdXJzdCwgUGFydGljbGVFZmZlY3QsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm1lc2hNYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9wYWxldHRlJykubWVzaE1hdGVyaWFscztcbm91dCQuUGFydGljbGVCdXJzdCA9IFBhcnRpY2xlQnVyc3QgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBzcGVlZCwgbGlmZXNwYW4sIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVCdXJzdCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnUGFydGljbGVCdXJzdCcsIFBhcnRpY2xlQnVyc3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVCdXJzdDtcbiAgc3BlZWQgPSAyO1xuICBsaWZlc3BhbiA9IDE1MDA7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlQnVyc3Qob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgcGFydGljbGVzLCBnZW9tZXRyeSwgY29sb3IsIG1hdGVyaWFsO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIFBhcnRpY2xlQnVyc3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuc2l6ZSA9IHRoaXMub3B0cy56YXBQYXJ0aWNsZVNpemU7XG4gICAgcGFydGljbGVzID0gMTUwMDtcbiAgICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMudmVsb2NpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMubGlmZXNwYW5zID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMuYWxwaGFzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMubWF4bGlmZXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5wb3NBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLnBvc2l0aW9ucywgMyk7XG4gICAgdGhpcy5jb2xBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLmNvbG9ycywgMyk7XG4gICAgdGhpcy5hbHBoYUF0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMuYWxwaGFzLCAxKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIHRoaXMucG9zQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjb2xvcicsIHRoaXMuY29sQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdvcGFjaXR5JywgdGhpcy5hbHBoYUF0dHIpO1xuICAgIGdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICAgIG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50Q2xvdWRNYXRlcmlhbCh7XG4gICAgICBzaXplOiB0aGlzLnNpemUsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgdmVydGV4Q29sb3JzOiBUSFJFRS5WZXJ0ZXhDb2xvcnNcbiAgICB9KTtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5Qb2ludENsb3VkKGdlb21ldHJ5LCBtYXRlcmlhbCkpO1xuICB9XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHgsIHosIHJlc3VsdHMkID0gW107XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgeCA9IDQuNSAtIE1hdGgucmFuZG9tKCkgKiA5O1xuICAgICAgeiA9IDAuNSAtIE1hdGgucmFuZG9tKCk7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMF0gPSB4ICogZ3JpZDtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IDA7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSB6ICogZ3JpZDtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB4IC8gMTA7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gcmFuZCgtMiAqIGdyaWQsIDEwICogZ3JpZCk7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gejtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMV0gPSAxO1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDJdID0gMTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5saWZlc3BhbnNbaSAvIDNdID0gMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmFjY2VsZXJhdGVQYXJ0aWNsZSA9IGZ1bmN0aW9uKGksIHQsIHAsIGJieCwgYmJ6KXtcbiAgICB2YXIgYWNjLCBweCwgcHksIHB6LCB2eCwgdnksIHZ6LCBweDEsIHB5MSwgcHoxLCB2eDEsIHZ5MSwgdnoxLCBsO1xuICAgIGlmICh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPD0gMCkge1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gLTEwMDA7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHQgPSB0IC8gKDEwMDAgLyBzcGVlZCk7XG4gICAgYWNjID0gLTAuOTg7XG4gICAgcHggPSB0aGlzLnBvc2l0aW9uc1tpICsgMF07XG4gICAgcHkgPSB0aGlzLnBvc2l0aW9uc1tpICsgMV07XG4gICAgcHogPSB0aGlzLnBvc2l0aW9uc1tpICsgMl07XG4gICAgdnggPSB0aGlzLnZlbG9jaXRpZXNbaSArIDBdO1xuICAgIHZ5ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAxXTtcbiAgICB2eiA9IHRoaXMudmVsb2NpdGllc1tpICsgMl07XG4gICAgcHgxID0gcHggKyAwLjUgKiAwICogdCAqIHQgKyB2eCAqIHQ7XG4gICAgcHkxID0gcHkgKyAwLjUgKiBhY2MgKiB0ICogdCArIHZ5ICogdDtcbiAgICBwejEgPSBweiArIDAuNSAqIDAgKiB0ICogdCArIHZ6ICogdDtcbiAgICB2eDEgPSAwICogdCArIHZ4O1xuICAgIHZ5MSA9IGFjYyAqIHQgKyB2eTtcbiAgICB2ejEgPSAwICogdCArIHZ6O1xuICAgIGlmIChweTEgPCB0aGlzLnNpemUgLyAyICYmICgtYmJ4IDwgcHgxICYmIHB4MSA8IGJieCkgJiYgKC1iYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUgPCBwejEgJiYgcHoxIDwgYmJ6ICsgMS45ICogdGhpcy5vcHRzLmdyaWRTaXplKSkge1xuICAgICAgcHkxID0gdGhpcy5zaXplIC8gMjtcbiAgICAgIHZ4MSAqPSAwLjc7XG4gICAgICB2eTEgKj0gLTAuNjtcbiAgICAgIHZ6MSAqPSAwLjc7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb25zW2kgKyAwXSA9IHB4MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSBweTE7XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDJdID0gcHoxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB2eDE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAxXSA9IHZ5MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gdnoxO1xuICAgIGwgPSB0aGlzLmxpZmVzcGFuc1tpIC8gM10gLyB0aGlzLm1heGxpZmVzW2kgLyAzXTtcbiAgICBsID0gbCAqIGwgKiBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDFdID0gbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSBsO1xuICAgIHJldHVybiB0aGlzLmFscGhhc1tpIC8gM10gPSBsO1xuICB9O1xuICBwcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oeSl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHRoaXMubGlmZXNwYW5zW2kgLyAzXSA9IGxpZmVzcGFuIC8gMiArIE1hdGgucmFuZG9tKCkgKiBsaWZlc3BhbiAvIDI7XG4gICAgICB0aGlzLm1heGxpZmVzW2kgLyAzXSA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5wb3NpdGlvbnNbaSArIDFdID0gKHkgKyBNYXRoLnJhbmRvbSgpKSAqIGdyaWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCDOlHQpe1xuICAgIHZhciBib3VuY2VCb3VuZHNYLCBib3VuY2VCb3VuZHNaLCBpJCwgdG8kLCBpO1xuICAgIGJvdW5jZUJvdW5kc1ggPSB0aGlzLm9wdHMuZGVza1NpemVbMF0gLyAyO1xuICAgIGJvdW5jZUJvdW5kc1ogPSB0aGlzLm9wdHMuZGVza1NpemVbMV0gLyAyO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0aGlzLmFjY2VsZXJhdGVQYXJ0aWNsZShpLCDOlHQsIDEsIGJvdW5jZUJvdW5kc1gsIGJvdW5jZUJvdW5kc1opO1xuICAgICAgdGhpcy5saWZlc3BhbnNbaSAvIDNdIC09IM6UdDtcbiAgICB9XG4gICAgdGhpcy5wb3NBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jb2xBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfTtcbiAgcmV0dXJuIFBhcnRpY2xlQnVyc3Q7XG59KEJhc2UpKTtcbm91dCQuUGFydGljbGVFZmZlY3QgPSBQYXJ0aWNsZUVmZmVjdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVFZmZlY3QsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1BhcnRpY2xlRWZmZWN0JywgUGFydGljbGVFZmZlY3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVFZmZlY3Q7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlRWZmZWN0KG9wdHMsIGdzKXtcbiAgICB2YXIgYXJlbmEsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCByb3c7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVFZmZlY3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMueiA9IHRoaXMub3B0cy56O1xuICAgIHRoaXMuaCA9IGhlaWdodDtcbiAgICB0aGlzLnJvd3MgPSBbXG4gICAgICAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KVxuICAgIF07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgcm93LmFkZFRvKHRoaXMucm9vdCk7XG4gICAgfVxuICB9XG4gIHByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24ocm93cyl7XG4gICAgdmFyIGkkLCBsZW4kLCBpLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucm93c1tpXS5zZXRIZWlnaHQoKHRoaXMuaCAtIDEpIC0gcm93SXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgc3lzdGVtLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBzeXN0ZW0gPSByZWYkW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2goc3lzdGVtLnJlc2V0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCBmc3JyLCDOlHQpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIHN5c3RlbSwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHN5c3RlbSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChzeXN0ZW0udXBkYXRlKHAsIM6UdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBQYXJ0aWNsZUVmZmVjdDtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgY29zLCBCYXNlLCBUaXRsZSwgY2FudmFzVGV4dHVyZSwgU3RhcnRNZW51LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3M7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcblRpdGxlID0gcmVxdWlyZSgnLi90aXRsZScpLlRpdGxlO1xuY2FudmFzVGV4dHVyZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0ZXh0dXJlU2l6ZSwgZmlkZWxpdHlGYWN0b3IsIHRleHRDbnYsIGltZ0NudiwgdGV4dEN0eCwgaW1nQ3R4O1xuICB0ZXh0dXJlU2l6ZSA9IDEwMjQ7XG4gIGZpZGVsaXR5RmFjdG9yID0gMTAwO1xuICB0ZXh0Q252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGltZ0NudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB0ZXh0Q3R4ID0gdGV4dENudi5nZXRDb250ZXh0KCcyZCcpO1xuICBpbWdDdHggPSBpbWdDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ252LndpZHRoID0gaW1nQ252LmhlaWdodCA9IHRleHR1cmVTaXplO1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdpZHRoLCBoZWlnaHQsIHRleHQsIHRleHRTaXplLCByZWYkO1xuICAgIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQsIHRleHQgPSBhcmckLnRleHQsIHRleHRTaXplID0gKHJlZiQgPSBhcmckLnRleHRTaXplKSAhPSBudWxsID8gcmVmJCA6IDEwO1xuICAgIHRleHRDbnYud2lkdGggPSB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDbnYuaGVpZ2h0ID0gaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3I7XG4gICAgdGV4dEN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICB0ZXh0Q3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgIHRleHRDdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICB0ZXh0Q3R4LmZvbnQgPSB0ZXh0U2l6ZSAqIGZpZGVsaXR5RmFjdG9yICsgXCJweCBtb25vc3BhY2VcIjtcbiAgICB0ZXh0Q3R4LmZpbGxUZXh0KHRleHQsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IgLyAyLCBoZWlnaHQgKiBmaWRlbGl0eUZhY3RvciAvIDIsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IpO1xuICAgIGltZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZmlsbFJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZHJhd0ltYWdlKHRleHRDbnYsIDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgcmV0dXJuIGltZ0Nudi50b0RhdGFVUkwoKTtcbiAgfTtcbn0oKTtcbm91dCQuU3RhcnRNZW51ID0gU3RhcnRNZW51ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChTdGFydE1lbnUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1N0YXJ0TWVudScsIFN0YXJ0TWVudSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTdGFydE1lbnU7XG4gIGZ1bmN0aW9uIFN0YXJ0TWVudShvcHRzLCBncyl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgb3B0aW9uLCBxdWFkO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgU3RhcnRNZW51LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZ3Muc3RhcnRNZW51U3RhdGUubWVudURhdGEpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgb3B0aW9uID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVPcHRpb25RdWFkKG9wdGlvbiwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gMC41IC0gaXggKiAwLjI7XG4gICAgICB0aGlzLm9wdGlvbnMucHVzaChxdWFkKTtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy50aXRsZSA9IG5ldyBUaXRsZSh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLnRpdGxlLmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gLTEgKiAodGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmJsb2NrU2l6ZSAvIDIpO1xuICB9XG4gIHByb3RvdHlwZS5jcmVhdGVPcHRpb25RdWFkID0gZnVuY3Rpb24ob3B0aW9uLCBpeCl7XG4gICAgdmFyIGltYWdlLCB0ZXgsIGdlb20sIG1hdCwgcXVhZDtcbiAgICBpbWFnZSA9IGNhbnZhc1RleHR1cmUoe1xuICAgICAgdGV4dDogb3B0aW9uLnRleHQsXG4gICAgICB3aWR0aDogNjAsXG4gICAgICBoZWlnaHQ6IDEwXG4gICAgfSk7XG4gICAgdGV4ID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShpbWFnZSk7XG4gICAgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDEsIDAuMik7XG4gICAgbWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4LFxuICAgICAgYWxwaGFNYXA6IHRleCxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIHF1YWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tLCBtYXQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnMsIHRpdGxlUmV2ZWFsVGltZXI7XG4gICAgdGltZXJzID0gZ3MudGltZXJzLCB0aXRsZVJldmVhbFRpbWVyID0gdGltZXJzLnRpdGxlUmV2ZWFsVGltZXI7XG4gICAgdGhpcy50aXRsZS5yZXZlYWwodGl0bGVSZXZlYWxUaW1lci5wcm9ncmVzcyk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlU2VsZWN0aW9uKGdzLnN0YXJ0TWVudVN0YXRlLCBncy5lbGFwc2VkVGltZSk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVTZWxlY3Rpb24gPSBmdW5jdGlvbihzdGF0ZSwgdGltZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgcXVhZCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5vcHRpb25zKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHF1YWQgPSByZWYkW2kkXTtcbiAgICAgIGlmIChpeCA9PT0gc3RhdGUuY3VycmVudEluZGV4KSB7XG4gICAgICAgIHF1YWQuc2NhbGUueCA9IDEgKyAwLjA1ICogc2luKHRpbWUgLyAzMDApO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHF1YWQuc2NhbGUueSA9IDEgKyAwLjA1ICogLXNpbih0aW1lIC8gMzAwKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFN0YXJ0TWVudTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIG1lc2hNYXRlcmlhbHMsIFRhYmxlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5tZXNoTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vcGFsZXR0ZScpLm1lc2hNYXRlcmlhbHM7XG5vdXQkLlRhYmxlID0gVGFibGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciByZXBlYXQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoVGFibGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1RhYmxlJywgVGFibGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGFibGU7XG4gIHJlcGVhdCA9IDI7XG4gIGZ1bmN0aW9uIFRhYmxlKG9wdHMsIGdzKXtcbiAgICB2YXIgcmVmJCwgd2lkdGgsIGRlcHRoLCB0aGlja25lc3MsIG1hcCwgbnJtLCB0YWJsZU1hdCwgdGFibGVHZW87XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBUYWJsZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmVmJCA9IHRoaXMub3B0cy5kZXNrU2l6ZSwgd2lkdGggPSByZWYkWzBdLCBkZXB0aCA9IHJlZiRbMV07XG4gICAgdGhpY2tuZXNzID0gMC4wMztcbiAgICBtYXAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdhc3NldHMvd29vZC5kaWZmLmpwZycpO1xuICAgIG1hcC53cmFwVCA9IG1hcC53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICAgIG1hcC5yZXBlYXQuc2V0KHJlcGVhdCwgcmVwZWF0KTtcbiAgICBucm0gPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdhc3NldHMvd29vZC5ucm0uanBnJyk7XG4gICAgbnJtLndyYXBUID0gbnJtLndyYXBTID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgbnJtLnJlcGVhdC5zZXQocmVwZWF0LCByZXBlYXQpO1xuICAgIHRhYmxlTWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogbWFwLFxuICAgICAgbm9ybWFsTWFwOiBucm0sXG4gICAgICBub3JtYWxTY2FsZTogbmV3IFRIUkVFLlZlY3RvcjIoMC4xLCAwLjApXG4gICAgfSk7XG4gICAgdGFibGVHZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkod2lkdGgsIHRoaWNrbmVzcywgZGVwdGgpO1xuICAgIHRoaXMudGFibGUgPSBuZXcgVEhSRUUuTWVzaCh0YWJsZUdlbywgdGFibGVNYXQpO1xuICAgIHRoaXMudGFibGUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMudGFibGUpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSB0aGlja25lc3MgLyAtMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gZGVwdGggLyAtMjtcbiAgfVxuICByZXR1cm4gVGFibGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIG1pbiwgbWF4LCBFYXNlLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBUaXRsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIG1pbiA9IHJlZiQubWluLCBtYXggPSByZWYkLm1heDtcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5tZXNoTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vcGFsZXR0ZScpLm1lc2hNYXRlcmlhbHM7XG5vdXQkLlRpdGxlID0gVGl0bGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBibG9ja1RleHQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoVGl0bGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1RpdGxlJywgVGl0bGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGl0bGU7XG4gIGJsb2NrVGV4dCA9IHtcbiAgICB0ZXRyaXM6IFtbMSwgMSwgMSwgMiwgMiwgMiwgMywgMywgMywgNCwgNCwgMCwgNSwgNiwgNiwgNl0sIFswLCAxLCAwLCAyLCAwLCAwLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCAwLCAwXSwgWzAsIDEsIDAsIDIsIDIsIDAsIDAsIDMsIDAsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgMCwgMCwgNl0sIFswLCAxLCAwLCAyLCAyLCAyLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCA2LCA2XV0sXG4gICAgdnJ0OiBbWzEsIDAsIDEsIDQsIDQsIDYsIDYsIDZdLCBbMSwgMCwgMSwgNCwgMCwgNCwgNiwgMF0sIFsxLCAwLCAxLCA0LCA0LCAwLCA2LCAwXSwgWzEsIDAsIDEsIDQsIDAsIDQsIDYsIDBdLCBbMCwgMSwgMCwgNCwgMCwgNCwgNiwgMF1dLFxuICAgIGdob3N0OiBbWzEsIDEsIDEsIDIsIDAsIDIsIDMsIDMsIDMsIDQsIDQsIDQsIDUsIDUsIDVdLCBbMSwgMCwgMCwgMiwgMCwgMiwgMywgMCwgMywgNCwgMCwgMCwgMCwgNSwgMF0sIFsxLCAwLCAwLCAyLCAyLCAyLCAzLCAwLCAzLCA0LCA0LCA0LCAwLCA1LCAwXSwgWzEsIDAsIDEsIDIsIDAsIDIsIDMsIDAsIDMsIDAsIDAsIDQsIDAsIDUsIDBdLCBbMSwgMSwgMSwgMiwgMCwgMiwgMywgMywgMywgNCwgNCwgNCwgMCwgNSwgMF1dXG4gIH07XG4gIGZ1bmN0aW9uIFRpdGxlKG9wdHMsIGdzKXtcbiAgICB2YXIgYmxvY2tTaXplLCBncmlkU2l6ZSwgdGV4dCwgbWFyZ2luLCBoZWlnaHQsIGkkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbCwgYm94LCBiYm94O1xuICAgIGJsb2NrU2l6ZSA9IG9wdHMuYmxvY2tTaXplLCBncmlkU2l6ZSA9IG9wdHMuZ3JpZFNpemU7XG4gICAgVGl0bGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRleHQgPSBibG9ja1RleHQudnJ0O1xuICAgIG1hcmdpbiA9IChncmlkU2l6ZSAtIGJsb2NrU2l6ZSkgLyAyO1xuICAgIGhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLndvcmQgPSBuZXcgVEhSRUUuT2JqZWN0M0QpO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi54ID0gKHRleHRbMF0ubGVuZ3RoIC0gMSkgKiBncmlkU2l6ZSAvIC0yO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi55ID0gaGVpZ2h0IC8gLTIgLSAodGV4dC5sZW5ndGggLSAxKSAqIGdyaWRTaXplIC8gLTI7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnogPSBncmlkU2l6ZSAvIDI7XG4gICAgdGhpcy5nZW9tLmJveCA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUgKiAwLjksIGJsb2NrU2l6ZSAqIDAuOSwgYmxvY2tTaXplICogMC45KTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRleHQubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHRleHRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIGJveCA9IG5ldyBUSFJFRS5NZXNoKHRoaXMuZ2VvbS5ib3gsIG1lc2hNYXRlcmlhbHNbY2VsbF0pO1xuICAgICAgICAgIGJveC5wb3NpdGlvbi5zZXQoZ3JpZFNpemUgKiB4ICsgbWFyZ2luLCBncmlkU2l6ZSAqICh0ZXh0Lmxlbmd0aCAvIDIgLSB5KSArIG1hcmdpbiwgZ3JpZFNpemUgLyAtMik7XG4gICAgICAgICAgdGhpcy53b3JkLmFkZChib3gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGJib3ggPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpcy53b3JkLCAweGZmMDAwMCk7XG4gICAgYmJveC51cGRhdGUoKTtcbiAgfVxuICBwcm90b3R5cGUucmV2ZWFsID0gZnVuY3Rpb24ocHJvZ3Jlc3Mpe1xuICAgIHZhciBwO1xuICAgIHAgPSBtaW4oMSwgcHJvZ3Jlc3MpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSBFYXNlLnF1aW50T3V0KHAsIHRoaXMuaGVpZ2h0ICogMiwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnkgPSBFYXNlLmV4cE91dChwLCAzMCwgMCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBFYXNlLmV4cE91dChwLCAtcGkgLyAxMCwgMCk7XG4gIH07XG4gIHByb3RvdHlwZS5kYW5jZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnkgPSAtcGkgLyAyICsgdGltZSAvIDEwMDA7XG4gICAgcmV0dXJuIHRoaXMud29yZC5vcGFjaXR5ID0gMC41ICsgMC41ICogc2luICsgdGltZSAvIDEwMDA7XG4gIH07XG4gIHJldHVybiBUaXRsZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgcGksIERlYnVnQ2FtZXJhUG9zaXRpb25lciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIHBpID0gcmVmJC5waTtcbm91dCQuRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnQ2FtZXJhUG9zaXRpb25lci5kaXNwbGF5TmFtZSA9ICdEZWJ1Z0NhbWVyYVBvc2l0aW9uZXInO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXI7XG4gIGZ1bmN0aW9uIERlYnVnQ2FtZXJhUG9zaXRpb25lcihjYW1lcmEsIHRhcmdldCl7XG4gICAgdGhpcy5jYW1lcmEgPSBjYW1lcmE7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgdGFyZ2V0OiBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZW5hYmxlZCA9IHRydWU7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7XG4gICAgaWYgKHRoaXMuc3RhdGUuZW5hYmxlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuYXV0b1JvdGF0ZShncy5lbGFwc2VkVGltZSk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihwaGFzZSwgdnBoYXNlKXtcbiAgICB2YXIgdGhhdDtcbiAgICB2cGhhc2UgPT0gbnVsbCAmJiAodnBoYXNlID0gMCk7XG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IHRoaXMuciAqIHNpbihwaGFzZSk7XG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueSA9IHRoaXMueSArIHRoaXMuciAqIC1zaW4odnBoYXNlKTtcbiAgICByZXR1cm4gdGhpcy5jYW1lcmEubG9va0F0KCh0aGF0ID0gdGhpcy50YXJnZXQucG9zaXRpb24pICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiB0aGlzLnRhcmdldCk7XG4gIH07XG4gIHByb3RvdHlwZS5hdXRvUm90YXRlID0gZnVuY3Rpb24odGltZSl7XG4gICAgcmV0dXJuIHRoaXMuc2V0UG9zaXRpb24ocGkgLyAxMCAqIHNpbih0aW1lIC8gMTAwMCkpO1xuICB9O1xuICByZXR1cm4gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xufSgpKTsiLCJ2YXIgcGk7XG5waSA9IHJlcXVpcmUoJ3N0ZCcpLnBpO1xuVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5ID0gZnVuY3Rpb24ocmFkaXVzLCByYWRpYWxTZWdtZW50cywgaGVpZ2h0LCBsZW5ndGh3aXNlU2VnbWVudHMpe1xuICB2YXIgaGFsZlNwaGVyZSwgdHViZTtcbiAgaGFsZlNwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeShyYWRpdXMsIHJhZGlhbFNlZ21lbnRzLCByYWRpYWxTZWdtZW50cywgMCwgcGkpO1xuICBoYWxmU3BoZXJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKDAsIDAsIDApKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VSb3RhdGlvblgoLXBpIC8gMikpO1xuICBoYWxmU3BoZXJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVNjYWxlKDEsIDAuNSwgMSkpO1xuICB0dWJlID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkocmFkaXVzLCByYWRpdXMsIGhlaWdodCwgcmFkaWFsU2VnbWVudHMgKiAyLCBsZW5ndGh3aXNlU2VnbWVudHMsIHRydWUpO1xuICB0dWJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVRyYW5zbGF0aW9uKDAsIC1oZWlnaHQgLyAyLCAwKSk7XG4gIFRIUkVFLkdlb21ldHJ5VXRpbHMubWVyZ2UoaGFsZlNwaGVyZSwgdHViZSk7XG4gIHJldHVybiBoYWxmU3BoZXJlO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBsZXJwLCByYW5kLCBmbG9vciwgbWFwLCBFYXNlLCBUSFJFRSwgUGFsZXR0ZSwgU2NlbmVNYW5hZ2VyLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIEFyZW5hLCBUYWJsZSwgU3RhcnRNZW51LCBGYWlsU2NyZWVuLCBMaWdodGluZywgQnJpY2tQcmV2aWV3LCBOaXhpZURpc3BsYXksIFRyYWNrYmFsbENvbnRyb2xzLCBUaHJlZUpzUmVuZGVyZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCBsZXJwID0gcmVmJC5sZXJwLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwO1xuRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuU2NlbmVNYW5hZ2VyID0gcmVxdWlyZSgnLi9zY2VuZS1tYW5hZ2VyJykuU2NlbmVNYW5hZ2VyO1xuRGVidWdDYW1lcmFQb3NpdGlvbmVyID0gcmVxdWlyZSgnLi9kZWJ1Zy1jYW1lcmEnKS5EZWJ1Z0NhbWVyYVBvc2l0aW9uZXI7XG5yZWYkID0gcmVxdWlyZSgnLi9jb21wb25lbnRzJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgVGFibGUgPSByZWYkLlRhYmxlLCBTdGFydE1lbnUgPSByZWYkLlN0YXJ0TWVudSwgRmFpbFNjcmVlbiA9IHJlZiQuRmFpbFNjcmVlbiwgTGlnaHRpbmcgPSByZWYkLkxpZ2h0aW5nLCBCcmlja1ByZXZpZXcgPSByZWYkLkJyaWNrUHJldmlldywgTml4aWVEaXNwbGF5ID0gcmVmJC5OaXhpZURpc3BsYXk7XG5UcmFja2JhbGxDb250cm9scyA9IHJlcXVpcmUoJy4uLy4uL2xpYi90cmFja2JhbGwtY29udHJvbHMuanMnKS5UcmFja2JhbGxDb250cm9scztcbm91dCQuVGhyZWVKc1JlbmRlcmVyID0gVGhyZWVKc1JlbmRlcmVyID0gKGZ1bmN0aW9uKCl7XG4gIFRocmVlSnNSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdUaHJlZUpzUmVuZGVyZXInO1xuICB2YXIgcHJvdG90eXBlID0gVGhyZWVKc1JlbmRlcmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaHJlZUpzUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIFRocmVlSnNSZW5kZXJlcihvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBuYW1lLCByZWYkLCBwYXJ0LCB0cmFja2JhbGxUYXJnZXQsIGdlbywgbWF0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIGxvZyhcIlJlbmRlcmVyOjpuZXdcIik7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZU1hbmFnZXIodGhpcy5vcHRzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMCxcbiAgICAgIGxhc3RTZWVuU3RhdGU6ICduby1nYW1lJ1xuICAgIH07XG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5qaXR0ZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QpO1xuICAgIHRoaXMucGFydHMgPSB7XG4gICAgICB0YWJsZTogbmV3IFRhYmxlKHRoaXMub3B0cywgZ3MpLFxuICAgICAgbGlnaHRpbmc6IG5ldyBMaWdodGluZyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hOiBuZXcgQXJlbmEodGhpcy5vcHRzLCBncyksXG4gICAgICBzdGFydE1lbnU6IG5ldyBTdGFydE1lbnUodGhpcy5vcHRzLCBncyksXG4gICAgICBmYWlsU2NyZWVuOiBuZXcgRmFpbFNjcmVlbih0aGlzLm9wdHMsIGdzKSxcbiAgICAgIG5leHRCcmljazogbmV3IEJyaWNrUHJldmlldyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHNjb3JlOiBuZXcgTml4aWVEaXNwbGF5KHRoaXMub3B0cywgZ3MpXG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmJCA9IHRoaXMucGFydHMpIHtcbiAgICAgIHBhcnQgPSByZWYkW25hbWVdO1xuICAgICAgcGFydC5hZGRUbyh0aGlzLmppdHRlcik7XG4gICAgfVxuICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnJvb3QucG9zaXRpb24uc2V0KC10aGlzLm9wdHMuZGVza1NpemVbMV0gLyAyLCAwLCAtdGhpcy5vcHRzLnByZXZpZXdEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0aGlzLnBhcnRzLmFyZW5hLnJvb3QucG9zaXRpb24uc2V0KDAsIDAsIC10aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0cmFja2JhbGxUYXJnZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5zY2VuZS5hZGQodHJhY2tiYWxsVGFyZ2V0KTtcbiAgICB0cmFja2JhbGxUYXJnZXQucG9zaXRpb24ueiA9IC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTtcbiAgICB0aGlzLnRyYWNrYmFsbCA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyh0aGlzLnNjZW5lLmNhbWVyYSwgdHJhY2tiYWxsVGFyZ2V0KTtcbiAgICB0aGlzLnNjZW5lLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgdGhpcy5zY2VuZS5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KDAsIC10aGlzLm9wdHMuY2FtZXJhRWxldmF0aW9uLCAtdGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UpO1xuICAgIHRoaXMuc2NlbmUuc2hvd0hlbHBlcnMoKTtcbiAgICByZXR1cm47XG4gICAgZ2VvID0gbmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSgwLjEsIDE2LCAwLjIsIDApO1xuICAgIG1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBjb2xvcjogMHgyMjIyMjIsXG4gICAgICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gICAgICBzaGluaW5lc3M6IDEwMCxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmdcbiAgICB9KTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmJhbGwgPSBuZXcgVEhSRUUuTWVzaChnZW8sIG1hdCkpO1xuICAgIHRoaXMuYmFsbC5wb3NpdGlvbi55ID0gMC41O1xuICAgIHRoaXMuYmFsbC5wb3NpdGlvbi56ID0gLTAuNTtcbiAgfVxuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLnNjZW5lLmRvbUVsZW1lbnQpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzLCBwO1xuICAgIHRoaXMudHJhY2tiYWxsLnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUudXBkYXRlKCk7XG4gICAgaWYgKGdzLm1ldGFnYW1lU3RhdGUgIT09IHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSkge1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICBjYXNlICdnYW1lJzpcbiAgICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIGxvZygnbm8tZ2FtZScpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHJvd3MgPSBncy5yb3dzVG9SZW1vdmUubGVuZ3RoO1xuICAgICAgcCA9IGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgICAgZ3Muc2xvd2Rvd24gPSAxICsgRWFzZS5leHBJbihwLCAxMCwgMCk7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnphcExpbmVzKGdzLCB0aGlzLmppdHRlci5wb3NpdGlvbik7XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay51cGRhdGVXaWdnbGUoZ3MsIGdzLmVsYXBzZWRUaW1lKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucnVuVG9OdW1iZXIoZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3MsIGdzLnNjb3JlLnBvaW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIGdzLnNsb3dkb3duID0gMTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEudXBkYXRlKGdzLCB0aGlzLmppdHRlci5wb3NpdGlvbik7XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5U2hhcGUoZ3MuYnJpY2submV4dCk7XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay51cGRhdGVXaWdnbGUoZ3MsIGdzLmVsYXBzZWRUaW1lKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUuc2V0TnVtYmVyKGdzLnNjb3JlLnBvaW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMucGFydHMuc3RhcnRNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXVzZS1tZW51JzpcbiAgICAgIHRoaXMucGFydHMucGF1c2VNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMucGFydHMuZmFpbFNjcmVlbi51cGRhdGUoZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZyhcIlRocmVlSnNSZW5kZXJlcjo6cmVuZGVyIC0gVW5rbm93biBtZXRhZ2FtZXN0YXRlOlwiLCBncy5tZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGVQYXJ0aWNsZXMoZ3MpO1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSA9IGdzLm1ldGFnYW1lU3RhdGU7XG4gICAgcmV0dXJuIHRoaXMuc2NlbmUucmVuZGVyKCk7XG4gIH07XG4gIHJldHVybiBUaHJlZUpzUmVuZGVyZXI7XG59KCkpOyIsInZhciBUSFJFRSwgcmVmJCwgbG9nLCBtYXAsIHBsdWNrLCBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIGNvbG9yT3JkZXIsIHRpbGVDb2xvcnMsIHNwZWNDb2xvcnMsIHRpbGVOb3JtYWxNYXAsIHRpbGVOb3JtYWxBZGp1c3QsIG1lc2hNYXRlcmlhbHMsIGksIGNvbG9yLCB0cmFuc3BhcmVudFRpbGVNYXRlcmlhbHMsIGxpbmVNYXRlcmlhbHMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIG1hcCA9IHJlZiQubWFwO1xucGx1Y2sgPSBjdXJyeSQoZnVuY3Rpb24ocCwgbyl7XG4gIHJldHVybiBvW3BdO1xufSk7XG5vdXQkLm5ldXRyYWwgPSBuZXV0cmFsID0gWzB4ZmZmZmZmLCAweGNjY2NjYywgMHg4ODg4ODgsIDB4MjEyMTIxXTtcbm91dCQucmVkID0gcmVkID0gWzB4RkY0NDQ0LCAweEZGNzc3NywgMHhkZDQ0NDQsIDB4NTUxMTExXTtcbm91dCQub3JhbmdlID0gb3JhbmdlID0gWzB4RkZCQjMzLCAweEZGQ0M4OCwgMHhDQzg4MDAsIDB4NTUzMzAwXTtcbm91dCQuZ3JlZW4gPSBncmVlbiA9IFsweDQ0ZmY2NiwgMHg4OGZmYWEsIDB4MjJiYjMzLCAweDExNTUxMV07XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWzB4ZmYzM2ZmLCAweGZmYWFmZiwgMHhiYjIyYmIsIDB4NTUxMTU1XTtcbm91dCQuYmx1ZSA9IGJsdWUgPSBbMHg2NmJiZmYsIDB4YWFkZGZmLCAweDU1ODhlZSwgMHgxMTExNTVdO1xub3V0JC5icm93biA9IGJyb3duID0gWzB4ZmZiYjMzLCAweGZmY2M4OCwgMHhiYjk5MDAsIDB4NTU1NTExXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWzB4ZWVlZTExLCAweGZmZmZhYSwgMHhjY2JiMDAsIDB4NTU1NTExXTtcbm91dCQuY3lhbiA9IGN5YW4gPSBbMHg0NGRkZmYsIDB4YWFlM2ZmLCAweDAwYWFjYywgMHgwMDY2OTldO1xuY29sb3JPcmRlciA9IFtuZXV0cmFsLCByZWQsIG9yYW5nZSwgeWVsbG93LCBncmVlbiwgY3lhbiwgYmx1ZSwgbWFnZW50YV07XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gbWFwKHBsdWNrKDIpLCBjb2xvck9yZGVyKTtcbm91dCQuc3BlY0NvbG9ycyA9IHNwZWNDb2xvcnMgPSBtYXAocGx1Y2soMCksIGNvbG9yT3JkZXIpO1xudGlsZU5vcm1hbE1hcCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy9hc3NldHMvdGlsZS5ucm0ucG5nJyk7XG50aWxlTm9ybWFsQWRqdXN0ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMSk7XG5vdXQkLm1lc2hNYXRlcmlhbHMgPSBtZXNoTWF0ZXJpYWxzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICBzcGVjdWxhcjogc3BlY0NvbG9yc1tpXSxcbiAgICAgIHNoaW5pbmVzczogMTAwLFxuICAgICAgbm9ybWFsTWFwOiB0aWxlTm9ybWFsTWFwLFxuICAgICAgbm9ybWFsU2NhbGU6IHRpbGVOb3JtYWxBZGp1c3RcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSgpKTtcbm91dCQudHJhbnNwYXJlbnRUaWxlTWF0ZXJpYWxzID0gdHJhbnNwYXJlbnRUaWxlTWF0ZXJpYWxzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIHNwZWN1bGFyOiBzcGVjQ29sb3JzW2ldLFxuICAgICAgc2hpbmluZXNzOiAxMDAsXG4gICAgICBub3JtYWxNYXA6IHRpbGVOb3JtYWxNYXAsXG4gICAgICBub3JtYWxTY2FsZTogdGlsZU5vcm1hbEFkanVzdFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5saW5lTWF0ZXJpYWxzID0gbGluZU1hdGVyaWFscyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLlBhbGV0dGUgPSBQYWxldHRlID0ge1xuICBuZXV0cmFsOiBuZXV0cmFsLFxuICByZWQ6IHJlZCxcbiAgb3JhbmdlOiBvcmFuZ2UsXG4gIHllbGxvdzogeWVsbG93LFxuICBncmVlbjogZ3JlZW4sXG4gIGN5YW46IGN5YW4sXG4gIGJsdWU6IGJsdWUsXG4gIG1hZ2VudGE6IG1hZ2VudGEsXG4gIHRpbGVDb2xvcnM6IHRpbGVDb2xvcnMsXG4gIG1lc2hNYXRlcmlhbHM6IG1lc2hNYXRlcmlhbHMsXG4gIGxpbmVNYXRlcmlhbHM6IGxpbmVNYXRlcmlhbHNcbn07XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgVEhSRUUsIFNjZW5lTWFuYWdlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xub3V0JC5TY2VuZU1hbmFnZXIgPSBTY2VuZU1hbmFnZXIgPSAoZnVuY3Rpb24oKXtcbiAgU2NlbmVNYW5hZ2VyLmRpc3BsYXlOYW1lID0gJ1NjZW5lTWFuYWdlcic7XG4gIHZhciBoZWxwZXJNYXJrZXJTaXplLCBoZWxwZXJNYXJrZXJPcGFjaXR5LCBoZWxwZXJNYXJrZXJHZW8sIHJlZEhlbHBlck1hdCwgYmx1ZUhlbHBlck1hdCwgcHJvdG90eXBlID0gU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTY2VuZU1hbmFnZXI7XG4gIGhlbHBlck1hcmtlclNpemUgPSAwLjAyO1xuICBoZWxwZXJNYXJrZXJPcGFjaXR5ID0gMC4zO1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUpO1xuICByZWRIZWxwZXJNYXQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweGZmMDBmZixcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiBoZWxwZXJNYXJrZXJPcGFjaXR5XG4gIH0pO1xuICBibHVlSGVscGVyTWF0ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgwMGZmZmYsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogaGVscGVyTWFya2VyT3BhY2l0eVxuICB9KTtcbiAgZnVuY3Rpb24gU2NlbmVNYW5hZ2VyKG9wdHMpe1xuICAgIHZhciBhc3BlY3Q7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJlc2l6ZSA9IGJpbmQkKHRoaXMsICdyZXNpemUnLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuemVyb1NlbnNvciA9IGJpbmQkKHRoaXMsICd6ZXJvU2Vuc29yJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLmdvRnVsbHNjcmVlbiA9IGJpbmQkKHRoaXMsICdnb0Z1bGxzY3JlZW4nLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuZGV0ZWN0VlIgPSBiaW5kJCh0aGlzLCAnZGV0ZWN0VlInLCBwcm90b3R5cGUpO1xuICAgIGFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgICBhbnRpYWxpYXM6IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIGFzcGVjdCwgMC4wMDEsIDEwMDApO1xuICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyh0aGlzLmNhbWVyYSwgdGhpcy5kZXRlY3RWUik7XG4gICAgdGhpcy5yb290ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMuZWZmZWN0ID0gbmV3IFRIUkVFLlZSRWZmZWN0KHRoaXMucmVuZGVyZXIpO1xuICAgIHRoaXMuZWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGggLSAxLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuemVyb1NlbnNvciwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRoaXMuZ29GdWxsc2NyZWVuKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdnJNb2RlOiB0cnVlXG4gICAgfTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnJvb3QpO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5yZWdpc3RyYXRpb24pO1xuICB9XG4gIHByb3RvdHlwZS5kZXRlY3RWUiA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZyTW9kZSA9IGZhbHNlO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHZhciBncmlkLCBheGlzLCByb290QXhpcztcbiAgICBncmlkID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoMTAsIDAuMSk7XG4gICAgYXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDEpO1xuICAgIHJvb3RBeGlzID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoMC41KTtcbiAgICBheGlzLnBvc2l0aW9uLnogPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56O1xuICAgIHJldHVybiByb290QXhpcy5wb3NpdGlvbi56ID0gdGhpcy5yb290LnBvc2l0aW9uLno7XG4gIH07XG4gIHByb3RvdHlwZS5lbmFibGVTaGFkb3dDYXN0aW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcFNvZnQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFGYXIgPSAxMDAwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRm92ID0gNTA7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFOZWFyID0gMztcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEJpYXMgPSAwLjAwMzk7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBIZWlnaHQgPSAxMDI0O1xuICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcERhcmtuZXNzID0gMC41O1xuICB9O1xuICBwcm90b3R5cGUuZ29GdWxsc2NyZWVuID0gZnVuY3Rpb24oKXtcbiAgICBsb2coJ1N0YXJ0aW5nIGZ1bGxzY3JlZW4uLi4nKTtcbiAgICByZXR1cm4gdGhpcy5lZmZlY3Quc2V0RnVsbFNjcmVlbih0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLnplcm9TZW5zb3IgPSBmdW5jdGlvbihldmVudCl7XG4gICAgdmFyIGtleUNvZGU7XG4gICAga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gODYpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgcmV0dXJuIHRoaXMuZWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5lZmZlY3QucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2RvbUVsZW1lbnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBwcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIG9iaiwgdGhhdCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgb2JqID0gYXJndW1lbnRzW2kkXTtcbiAgICAgIGxvZygnU2NlbmVNYW5hZ2VyOjphZGQgLScsIG9iaik7XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmVnaXN0cmF0aW9uLmFkZCgodGhhdCA9IG9iai5yb290KSAhPSBudWxsID8gdGhhdCA6IG9iaikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTY2VuZU1hbmFnZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHBvdywgcXVhZEluLCBxdWFkT3V0LCBjdWJpY0luLCBjdWJpY091dCwgcXVhcnRJbiwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50T3V0LCBleHBJbiwgZXhwT3V0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucG93ID0gcmVxdWlyZSgnc3RkJykucG93O1xub3V0JC5xdWFkSW4gPSBxdWFkSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHQgKiB0ICsgYjtcbn07XG5vdXQkLnF1YWRPdXQgPSBxdWFkT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogdCAqICh0IC0gMikgKyBiO1xufTtcbm91dCQuY3ViaWNJbiA9IGN1YmljSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDMpICsgYjtcbn07XG5vdXQkLmN1YmljT3V0ID0gY3ViaWNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgMykgKyAxKSArIGI7XG59O1xub3V0JC5xdWFydEluID0gcXVhcnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNCkgKyBiO1xufTtcbm91dCQucXVhcnRPdXQgPSBxdWFydE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIChNYXRoLnBvdyh0IC0gMSwgNCkgLSAxKSArIGI7XG59O1xub3V0JC5xdWludEluID0gcXVpbnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNSkgKyBiO1xufTtcbm91dCQucXVpbnRPdXQgPSBxdWludE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKE1hdGgucG93KHQgLSAxLCA1KSArIDEpICsgYjtcbn07XG5vdXQkLmV4cEluID0gZXhwSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHBvdygyLCAxMCAqICh0IC0gMSkpICsgYjtcbn07XG5vdXQkLmV4cE91dCA9IGV4cE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKCgtcG93KDIsIC0xMCAqIHQpKSArIDEpICsgYjtcbn07IiwidmFyIGlkLCBsb2csIGZsaXAsIGRlbGF5LCBmbG9vciwgcmFuZG9tLCByYW5kLCByYW5kSW50LCByYW5kb21Gcm9tLCBhZGRWMiwgZmlsdGVyLCBwaSwgdGF1LCBwb3csIHNpbiwgY29zLCBtaW4sIG1heCwgbGVycCwgbWFwLCBzcGxpdCwgam9pbiwgdW5saW5lcywgd3JhcCwgbGltaXQsIHJhZiwgdGhhdCwgRWFzZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyByYW5kb20oKSAqIChtYXggLSBtaW4pO1xufTtcbm91dCQucmFuZEludCA9IHJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLmZpbHRlciA9IGZpbHRlciA9IGN1cnJ5JChmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIGlmICjOuyh4KSkge1xuICAgICAgcmVzdWx0cyQucHVzaCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLnBpID0gcGkgPSBNYXRoLlBJO1xub3V0JC50YXUgPSB0YXUgPSBwaSAqIDI7XG5vdXQkLnBvdyA9IHBvdyA9IE1hdGgucG93O1xub3V0JC5zaW4gPSBzaW4gPSBNYXRoLnNpbjtcbm91dCQuY29zID0gY29zID0gTWF0aC5jb3M7XG5vdXQkLm1pbiA9IG1pbiA9IE1hdGgubWluO1xub3V0JC5tYXggPSBtYXggPSBNYXRoLm1heDtcbm91dCQubGVycCA9IGxlcnAgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIHApe1xuICByZXR1cm4gbWluICsgcCAqIChtYXggLSBtaW4pO1xufSk7XG5vdXQkLm1hcCA9IG1hcCA9IGN1cnJ5JChmdW5jdGlvbijOuywgbCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gozrsoeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC5zcGxpdCA9IHNwbGl0ID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoY2hhcik7XG59KTtcbm91dCQuam9pbiA9IGpvaW4gPSBjdXJyeSQoZnVuY3Rpb24oY2hhciwgc3RyKXtcbiAgcmV0dXJuIHN0ci5qb2luKGNoYXIpO1xufSk7XG5vdXQkLnVubGluZXMgPSB1bmxpbmVzID0gam9pbihcIlxcblwiKTtcbm91dCQud3JhcCA9IHdyYXAgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIG4pe1xuICBpZiAobiA+IG1heCkge1xuICAgIHJldHVybiBtaW47XG4gIH0gZWxzZSBpZiAobiA8IG1pbikge1xuICAgIHJldHVybiBtYXg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cbn0pO1xub3V0JC5saW1pdCA9IGxpbWl0ID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQucmFmID0gcmFmID0gKHRoYXQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gID8gdGhhdFxuICA6ICh0aGF0ID0gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgID8gdGhhdFxuICAgIDogKHRoYXQgPSB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogZnVuY3Rpb24ozrspe1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dCjOuywgMTAwMCAvIDYwKTtcbiAgICAgIH07XG5vdXQkLkVhc2UgPSBFYXNlID0gcmVxdWlyZSgnLi9lYXNpbmcnKTtcbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCB1bmxpbmVzLCB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHVubGluZXMgPSByZWYkLnVubGluZXM7XG50ZW1wbGF0ZSA9IHtcbiAgY2VsbDogZnVuY3Rpb24oaXQpe1xuICAgIGlmIChpdCkge1xuICAgICAgcmV0dXJuIFwi4paS4paSXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIiAgXCI7XG4gICAgfVxuICB9LFxuICBzY29yZTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcywgbnVsbCwgMik7XG4gIH0sXG4gIGJyaWNrOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQubWFwKHRlbXBsYXRlLmNlbGwpLmpvaW4oJyAnKTtcbiAgICB9KS5qb2luKFwiXFxuICAgICAgICBcIik7XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBrZXlTdW1tYXJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0aGlzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGtleVN1bW1hcnkgPSB0aGlzW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChrZXlTdW1tYXJ5LmtleSArICctJyArIGtleVN1bW1hcnkuYWN0aW9uICsgXCJ8XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIobm8gY2hhbmdlKVwiO1xuICAgIH1cbiAgfSxcbiAgbm9ybWFsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcInNjb3JlIC0gXCIgKyB0ZW1wbGF0ZS5zY29yZS5hcHBseSh0aGlzLnNjb3JlKSArIFwiXFxubGluZXMgLSBcIiArIHRoaXMubGluZXMgKyBcIlxcblxcbiBtZXRhIC0gXCIgKyB0aGlzLm1ldGFnYW1lU3RhdGUgKyBcIlxcbiB0aW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRUaW1lICsgXCJcXG5mcmFtZSAtIFwiICsgdGhpcy5lbGFwc2VkRnJhbWVzICsgXCJcXG4ga2V5cyAtIFwiICsgdGVtcGxhdGUua2V5cy5hcHBseSh0aGlzLmlucHV0U3RhdGUpICsgXCJcXG4gZHJvcCAtIFwiICsgKHRoaXMuZm9yY2VEb3duTW9kZSA/ICdzb2Z0JyA6ICdhdXRvJyk7XG4gIH0sXG4gIG1lbnVJdGVtczogZnVuY3Rpb24oKXtcbiAgICB2YXIgaXgsIGl0ZW07XG4gICAgcmV0dXJuIFwiXCIgKyB1bmxpbmVzKChmdW5jdGlvbigpe1xuICAgICAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubWVudURhdGEpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGl4ID0gaSQ7XG4gICAgICAgIGl0ZW0gPSByZWYkW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaCh0ZW1wbGF0ZS5tZW51SXRlbS5jYWxsKGl0ZW0sIGl4LCB0aGlzLmN1cnJlbnRJbmRleCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0uY2FsbCh0aGlzKSkpO1xuICB9LFxuICBzdGFydE1lbnU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiU1RBUlQgTUVOVVxcblwiICsgdGVtcGxhdGUubWVudUl0ZW1zLmFwcGx5KHRoaXMpO1xuICB9LFxuICBtZW51SXRlbTogZnVuY3Rpb24oaW5kZXgsIGN1cnJlbnRJbmRleCl7XG4gICAgcmV0dXJuIFwiXCIgKyAoaW5kZXggPT09IGN1cnJlbnRJbmRleCA/IFwiPlwiIDogXCIgXCIpICsgXCIgXCIgKyB0aGlzLnRleHQ7XG4gIH0sXG4gIGZhaWx1cmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiICAgR0FNRSBPVkVSXFxuXFxuICAgICBTY29yZVxcblxcbiAgU2luZ2xlIC0gXCIgKyB0aGlzLnNjb3JlLnNpbmdsZXMgKyBcIlxcbiAgRG91YmxlIC0gXCIgKyB0aGlzLnNjb3JlLmRvdWJsZXMgKyBcIlxcbiAgVHJpcGxlIC0gXCIgKyB0aGlzLnNjb3JlLnRyaXBsZXMgKyBcIlxcbiAgVGV0cmlzIC0gXCIgKyB0aGlzLnNjb3JlLnRldHJpcyArIFwiXFxuXFxuVG90YWwgTGluZXM6IFwiICsgdGhpcy5zY29yZS5saW5lcyArIFwiXFxuXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcy5mYWlsTWVudVN0YXRlKTtcbiAgfVxufTtcbm91dCQuRGVidWdPdXRwdXQgPSBEZWJ1Z091dHB1dCA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z091dHB1dC5kaXNwbGF5TmFtZSA9ICdEZWJ1Z091dHB1dCc7XG4gIHZhciBwcm90b3R5cGUgPSBEZWJ1Z091dHB1dC5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdPdXRwdXQ7XG4gIGZ1bmN0aW9uIERlYnVnT3V0cHV0KCl7XG4gICAgdmFyIHJlZiQ7XG4gICAgdGhpcy5kYm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZGJvKTtcbiAgICByZWYkID0gdGhpcy5kYm8uc3R5bGU7XG4gICAgcmVmJC5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgcmVmJC50b3AgPSAwO1xuICAgIHJlZiQubGVmdCA9IDA7XG4gIH1cbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICBzd2l0Y2ggKHN0YXRlLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5ub3JtYWwuYXBwbHkoc3RhdGUpO1xuICAgIGNhc2UgJ2ZhaWx1cmUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLmZhaWx1cmUuYXBwbHkoc3RhdGUpO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLnN0YXJ0TWVudS5hcHBseShzdGF0ZS5zdGFydE1lbnVTdGF0ZSk7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5ub3JtYWwuYXBwbHkoc3RhdGUpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gXCJVbmtub3duIG1ldGFnYW1lIHN0YXRlOiBcIiArIHN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgfVxuICB9O1xuICByZXR1cm4gRGVidWdPdXRwdXQ7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCByYWYsIEZyYW1lRHJpdmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYWYgPSByZWYkLnJhZjtcbm91dCQuRnJhbWVEcml2ZXIgPSBGcmFtZURyaXZlciA9IChmdW5jdGlvbigpe1xuICBGcmFtZURyaXZlci5kaXNwbGF5TmFtZSA9ICdGcmFtZURyaXZlcic7XG4gIHZhciBwcm90b3R5cGUgPSBGcmFtZURyaXZlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWVEcml2ZXI7XG4gIGZ1bmN0aW9uIEZyYW1lRHJpdmVyKG9uRnJhbWUpe1xuICAgIHRoaXMub25GcmFtZSA9IG9uRnJhbWU7XG4gICAgdGhpcy5mcmFtZSA9IGJpbmQkKHRoaXMsICdmcmFtZScsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6Om5ld1wiKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgemVybzogMCxcbiAgICAgIHRpbWU6IDAsXG4gICAgICBmcmFtZTogMCxcbiAgICAgIHJ1bm5pbmc6IGZhbHNlXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IG5vdztcbiAgICB0aGlzLnN0YXRlLmZyYW1lID0gdGhpcy5zdGF0ZS5mcmFtZSArIDE7XG4gICAgdGhpcy5zdGF0ZS7OlHQgPSDOlHQ7XG4gICAgcmV0dXJuIHRoaXMub25GcmFtZSjOlHQsIHRoaXMuc3RhdGUudGltZSwgdGhpcy5zdGF0ZS5mcmFtZSk7XG4gIH07XG4gIHByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RhcnQgLSBzdGFydGluZ1wiKTtcbiAgICB0aGlzLnN0YXRlLnplcm8gPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IDA7XG4gICAgdGhpcy5zdGF0ZS5ydW5uaW5nID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5mcmFtZSgpO1xuICB9O1xuICBwcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0b3AgLSBzdG9wcGluZ1wiKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5ydW5uaW5nID0gZmFsc2U7XG4gIH07XG4gIHJldHVybiBGcmFtZURyaXZlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgVGltZXIsIEdhbWVTdGF0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xub3V0JC5HYW1lU3RhdGUgPSBHYW1lU3RhdGUgPSAoZnVuY3Rpb24oKXtcbiAgR2FtZVN0YXRlLmRpc3BsYXlOYW1lID0gJ0dhbWVTdGF0ZSc7XG4gIHZhciBkZWZhdWx0cywgcHJvdG90eXBlID0gR2FtZVN0YXRlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHYW1lU3RhdGU7XG4gIGRlZmF1bHRzID0ge1xuICAgIG1ldGFnYW1lU3RhdGU6ICduby1nYW1lJyxcbiAgICBpbnB1dFN0YXRlOiBbXSxcbiAgICBmb3JjZURvd25Nb2RlOiBmYWxzZSxcbiAgICBlbGFwc2VkVGltZTogMCxcbiAgICBlbGFwc2VkRnJhbWVzOiAwLFxuICAgIHJvd3NUb1JlbW92ZTogW10sXG4gICAgc2xvd2Rvd246IDEsXG4gICAgZmxhZ3M6IHtcbiAgICAgIHJvd3NSZW1vdmVkVGhpc0ZyYW1lOiBmYWxzZVxuICAgIH0sXG4gICAgc2NvcmU6IHtcbiAgICAgIHBvaW50czogMCxcbiAgICAgIGxpbmVzOiAwLFxuICAgICAgc2luZ2xlczogMCxcbiAgICAgIGRvdWJsZXM6IDAsXG4gICAgICB0cmlwbGVzOiAwLFxuICAgICAgdGV0cmlzOiAwXG4gICAgfSxcbiAgICBicmljazoge1xuICAgICAgbmV4dDogdm9pZCA4LFxuICAgICAgY3VycmVudDogdm9pZCA4XG4gICAgfSxcbiAgICB0aW1lcnM6IHtcbiAgICAgIGRyb3BUaW1lcjogbnVsbCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaWVtcjogbnVsbCxcbiAgICAgIGtleVJlcGVhdFRpbWVyOiBudWxsLFxuICAgICAgcmVtb3ZhbEFuaW1hdGlvbjogbnVsbCxcbiAgICAgIHRpdGxlUmV2ZWFsVGltZXI6IG51bGwsXG4gICAgICBmYWlsdXJlUmV2ZWFsVGltZXI6IG51bGxcbiAgICB9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIHRpbGVXaWR0aDogMTAsXG4gICAgICB0aWxlSGVpZ2h0OiAxOCxcbiAgICAgIHRpbGVTaXplOiAyMCxcbiAgICAgIGhhcmREcm9wSm9sdEFtb3VudDogMC4zNSxcbiAgICAgIGRyb3BTcGVlZDogMzAwLFxuICAgICAgZm9yY2VEcm9wV2FpdFRpbWU6IDEwMCxcbiAgICAgIHJlbW92YWxBbmltYXRpb25UaW1lOiA1MDAsXG4gICAgICBoYXJkRHJvcEVmZmVjdFRpbWU6IDEwMCxcbiAgICAgIGtleVJlcGVhdFRpbWU6IDEwMCxcbiAgICAgIHRpdGxlUmV2ZWFsVGltZTogNDAwMFxuICAgIH0sXG4gICAgYXJlbmE6IHtcbiAgICAgIGNlbGxzOiBbW11dLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIEdhbWVTdGF0ZShvcHRpb25zKXtcbiAgICBpbXBvcnQkKHRoaXMsIGRlZmF1bHRzKTtcbiAgICBpbXBvcnQkKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgdGhpcy50aW1lcnMuZHJvcFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5kcm9wU3BlZWQpO1xuICAgIHRoaXMudGltZXJzLmZvcmNlRHJvcFdhaXRUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZm9yY2VEcm9wV2FpdFRpbWUpO1xuICAgIHRoaXMudGltZXJzLmtleVJlcGVhdFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5rZXlSZXBlYXRUaW1lKTtcbiAgICB0aGlzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5yZW1vdmFsQW5pbWF0aW9uVGltZSk7XG4gICAgdGhpcy50aW1lcnMuaGFyZERyb3BFZmZlY3QgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmhhcmREcm9wRWZmZWN0VGltZSk7XG4gICAgdGhpcy50aW1lcnMudGl0bGVSZXZlYWxUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMudGl0bGVSZXZlYWxUaW1lKTtcbiAgICB0aGlzLnRpbWVycy5mYWlsdXJlUmV2ZWFsVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLnRpdGxlUmV2ZWFsVGltZSk7XG4gICAgdGhpcy5hcmVuYSA9IGNvbnN0cnVjdG9yLm5ld0FyZW5hKHRoaXMub3B0aW9ucy50aWxlV2lkdGgsIHRoaXMub3B0aW9ucy50aWxlSGVpZ2h0KTtcbiAgICB0aGlzLnRpbWVycy5oYXJkRHJvcEVmZmVjdC5leHBpcmUoKTtcbiAgfVxuICBHYW1lU3RhdGUubmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgICB2YXIgcm93LCBjZWxsO1xuICAgIHJldHVybiB7XG4gICAgICBjZWxsczogKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBpJCwgdG8kLCBscmVzdWx0JCwgaiQsIHRvMSQsIHJlc3VsdHMkID0gW107XG4gICAgICAgIGZvciAoaSQgPSAwLCB0byQgPSBoZWlnaHQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICAgICAgcm93ID0gaSQ7XG4gICAgICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IHdpZHRoOyBqJCA8IHRvMSQ7ICsraiQpIHtcbiAgICAgICAgICAgIGNlbGwgPSBqJDtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICAgIH0oKSksXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH07XG4gIH07XG4gIHJldHVybiBHYW1lU3RhdGU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmlsdGVyLCBUaW1lciwga2V5UmVwZWF0VGltZSwgS0VZLCBBQ1RJT05fTkFNRSwgZXZlbnRTdW1tYXJ5LCBuZXdCbGFua0tleXN0YXRlLCBJbnB1dEhhbmRsZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZpbHRlciA9IHJlZiQuZmlsdGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5rZXlSZXBlYXRUaW1lID0gMTUwO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDAsXG4gIFo6IDkwLFxuICBYOiA4OCxcbiAgT05FOiA0OSxcbiAgVFdPOiA1MCxcbiAgVEhSRUU6IDUxLFxuICBGT1VSOiA1MixcbiAgRklWRTogNTMsXG4gIFNJWDogNTQsXG4gIFNFVkVOOiA1NSxcbiAgRUlHSFQ6IDU2LFxuICBOSU5FOiA1NyxcbiAgWkVSTzogNDhcbn07XG5BQ1RJT05fTkFNRSA9IChyZWYkID0ge30sIHJlZiRbS0VZLlJFVFVSTiArIFwiXCJdID0gJ2NvbmZpcm0nLCByZWYkW0tFWS5FU0NBUEUgKyBcIlwiXSA9ICdjYW5jZWwnLCByZWYkW0tFWS5TUEFDRSArIFwiXCJdID0gJ2hhcmQtZHJvcCcsIHJlZiRbS0VZLlggKyBcIlwiXSA9ICdjdycsIHJlZiRbS0VZLlogKyBcIlwiXSA9ICdjY3cnLCByZWYkW0tFWS5VUCArIFwiXCJdID0gJ3VwJywgcmVmJFtLRVkuTEVGVCArIFwiXCJdID0gJ2xlZnQnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkW0tFWS5PTkUgKyBcIlwiXSA9ICdkZWJ1Zy0xJywgcmVmJFtLRVkuVFdPICsgXCJcIl0gPSAnZGVidWctMicsIHJlZiRbS0VZLlRIUkVFICsgXCJcIl0gPSAnZGVidWctMycsIHJlZiRbS0VZLkZPVVIgKyBcIlwiXSA9ICdkZWJ1Zy00JywgcmVmJFtLRVkuRklWRSArIFwiXCJdID0gJ2RlYnVnLTUnLCByZWYkW0tFWS5TSVggKyBcIlwiXSA9ICdkZWJ1Zy02JywgcmVmJFtLRVkuU0VWRU4gKyBcIlwiXSA9ICdkZWJ1Zy03JywgcmVmJFtLRVkuRUlHSFQgKyBcIlwiXSA9ICdkZWJ1Zy04JywgcmVmJFtLRVkuTklORSArIFwiXCJdID0gJ2RlYnVnLTknLCByZWYkW0tFWS5aRVJPICsgXCJcIl0gPSAnZGVidWctMCcsIHJlZiQpO1xuZXZlbnRTdW1tYXJ5ID0gZnVuY3Rpb24oa2V5LCBzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgYWN0aW9uOiBzdGF0ZSA/ICdkb3duJyA6ICd1cCdcbiAgfTtcbn07XG5uZXdCbGFua0tleXN0YXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICB1cDogZmFsc2UsXG4gICAgZG93bjogZmFsc2UsXG4gICAgbGVmdDogZmFsc2UsXG4gICAgcmlnaHQ6IGZhbHNlLFxuICAgIGFjdGlvbkE6IGZhbHNlLFxuICAgIGFjdGlvbkI6IGZhbHNlLFxuICAgIGNvbmZpcm06IGZhbHNlLFxuICAgIGNhbmNlbDogZmFsc2VcbiAgfTtcbn07XG5vdXQkLklucHV0SGFuZGxlciA9IElucHV0SGFuZGxlciA9IChmdW5jdGlvbigpe1xuICBJbnB1dEhhbmRsZXIuZGlzcGxheU5hbWUgPSAnSW5wdXRIYW5kbGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IElucHV0SGFuZGxlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gSW5wdXRIYW5kbGVyO1xuICBmdW5jdGlvbiBJbnB1dEhhbmRsZXIoKXtcbiAgICB0aGlzLnN0YXRlU2V0dGVyID0gYmluZCQodGhpcywgJ3N0YXRlU2V0dGVyJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ld1wiKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zdGF0ZVNldHRlcih0cnVlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN0YXRlU2V0dGVyKGZhbHNlKSk7XG4gICAgdGhpcy5jdXJyS2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gICAgdGhpcy5sYXN0S2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gIH1cbiAgcHJvdG90eXBlLnN0YXRlU2V0dGVyID0gY3VycnkkKChmdW5jdGlvbihzdGF0ZSwgYXJnJCl7XG4gICAgdmFyIHdoaWNoLCBrZXk7XG4gICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgIGlmIChrZXkgPSBBQ1RJT05fTkFNRVt3aGljaF0pIHtcbiAgICAgIHRoaXMuY3VycktleXN0YXRlW2tleV0gPSBzdGF0ZTtcbiAgICAgIGlmIChzdGF0ZSA9PT0gdHJ1ZSAmJiB0aGlzLmxhc3RIZWxkS2V5ICE9PSBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdEhlbGRLZXkgPSBrZXk7XG4gICAgICB9XG4gICAgfVxuICB9KSwgdHJ1ZSk7XG4gIHByb3RvdHlwZS5jaGFuZ2VzU2luY2VMYXN0RnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBrZXksIHN0YXRlLCB3YXNEaWZmZXJlbnQ7XG4gICAgcmV0dXJuIGZpbHRlcihpZCwgKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcmVmJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIHJlZiQgPSB0aGlzLmN1cnJLZXlzdGF0ZSkge1xuICAgICAgICBzdGF0ZSA9IHJlZiRba2V5XTtcbiAgICAgICAgd2FzRGlmZmVyZW50ID0gc3RhdGUgIT09IHRoaXMubGFzdEtleXN0YXRlW2tleV07XG4gICAgICAgIHRoaXMubGFzdEtleXN0YXRlW2tleV0gPSBzdGF0ZTtcbiAgICAgICAgaWYgKHdhc0RpZmZlcmVudCkge1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goZXZlbnRTdW1tYXJ5KGtleSwgc3RhdGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0uY2FsbCh0aGlzKSkpO1xuICB9O1xuICBJbnB1dEhhbmRsZXIuZGVidWdNb2RlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgcmV0dXJuIGxvZyhcIklucHV0SGFuZGxlcjo6ZGVidWdNb2RlIC1cIiwgd2hpY2gsIEFDVElPTl9OQU1FW3doaWNoXSB8fCAnW3VuYm91bmRdJyk7XG4gICAgfSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5vbiA9IGZ1bmN0aW9uKGNvZGUsIM67KXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgaWYgKHdoaWNoID09PSBjb2RlKSB7XG4gICAgICAgIHJldHVybiDOuygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gSW5wdXRIYW5kbGVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZsb29yLCBhc2NpaVByb2dyZXNzQmFyLCBUaW1lciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuYXNjaWlQcm9ncmVzc0JhciA9IGN1cnJ5JChmdW5jdGlvbihsZW4sIHZhbCwgbWF4KXtcbiAgdmFyIHZhbHVlQ2hhcnMsIGVtcHR5Q2hhcnM7XG4gIHZhbCA9IHZhbCA+IG1heCA/IG1heCA6IHZhbDtcbiAgdmFsdWVDaGFycyA9IGZsb29yKGxlbiAqIHZhbCAvIG1heCk7XG4gIGVtcHR5Q2hhcnMgPSBsZW4gLSB2YWx1ZUNoYXJzO1xuICByZXR1cm4gcmVwZWF0U3RyaW5nJChcIuKWklwiLCB2YWx1ZUNoYXJzKSArIHJlcGVhdFN0cmluZyQoXCItXCIsIGVtcHR5Q2hhcnMpO1xufSk7XG5vdXQkLlRpbWVyID0gVGltZXIgPSAoZnVuY3Rpb24oKXtcbiAgVGltZXIuZGlzcGxheU5hbWUgPSAnVGltZXInO1xuICB2YXIgYWxsVGltZXJzLCBwcm9nYmFyLCByZWYkLCBUSU1FUl9BQ1RJVkUsIFRJTUVSX0VYUElSRUQsIHByb3RvdHlwZSA9IFRpbWVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaW1lcjtcbiAgYWxsVGltZXJzID0gW107XG4gIHByb2diYXIgPSBhc2NpaVByb2dyZXNzQmFyKDIxKTtcbiAgcmVmJCA9IFswLCAxXSwgVElNRVJfQUNUSVZFID0gcmVmJFswXSwgVElNRVJfRVhQSVJFRCA9IHJlZiRbMV07XG4gIGZ1bmN0aW9uIFRpbWVyKHRhcmdldFRpbWUsIGJlZ2luKXtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0YXJnZXRUaW1lICE9IG51bGwgPyB0YXJnZXRUaW1lIDogMTAwMDtcbiAgICBiZWdpbiA9PSBudWxsICYmIChiZWdpbiA9IGZhbHNlKTtcbiAgICBpZiAodGhpcy50YXJnZXRUaW1lID09PSAwKSB7XG4gICAgICB0aHJvdyBcIlRpbWVyOjpyZXNldCAtIHRhcmdldCB0aW1lIG11c3QgYmUgbm9uLXplcm9cIjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy5zdGF0ZSA9IGJlZ2luID8gVElNRVJfQUNUSVZFIDogVElNRVJfRVhQSVJFRDtcbiAgICB0aGlzLmFjdGl2ZSA9IGJlZ2luO1xuICAgIHRoaXMuZXhwaXJlZCA9ICFiZWdpbjtcbiAgICBhbGxUaW1lcnMucHVzaCh0aGlzKTtcbiAgfVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAnYWN0aXZlJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9BQ1RJVkU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2V4cGlyZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFRJTUVSX0VYUElSRUQ7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Byb2dyZXNzJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lIC8gdGhpcy50YXJnZXRUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHByb3RvdHlwZS5leHBpcmUgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRhcmdldFRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndGltZVRvRXhwaXJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFRpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihleHBUaW1lKXtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRhcmdldFRpbWUgLSBleHBUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbijOlHQpe1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5jdXJyZW50VGltZSArPSDOlHQ7XG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLnRhcmdldFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICBpZiAodGltZSA9PT0gMCkge1xuICAgICAgdGhyb3cgXCJUaW1lcjo6cmVzZXQgLSB0YXJnZXQgdGltZSBtdXN0IGJlIG5vbi16ZXJvXCI7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldFdpdGhSZW1haW5kZXIgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIGlmICh0aW1lID09PSAwKSB7XG4gICAgICB0aHJvdyBcIlRpbWVyOjpyZXNldCAtIHRhcmdldCB0aW1lIG11c3QgYmUgbm9uLXplcm9cIjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMuY3VycmVudFRpbWUgLSB0aW1lO1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gIH07XG4gIHByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gYWxsVGltZXJzLnNwbGljZShhbGxUaW1lcnMuaW5kZXhPZih0aGlzKSwgMSk7XG4gIH07XG4gIHByb3RvdHlwZS5ydW5Gb3IgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnRpbWVUb0V4cGlyeSA9IHRpbWU7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9BQ1RJVkU7XG4gIH07XG4gIHByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiVElNRVI6IFwiICsgdGhpcy50YXJnZXRUaW1lICsgXCJcXG5TVEFURTogXCIgKyB0aGlzLnN0YXRlICsgXCIgKFwiICsgdGhpcy5hY3RpdmUgKyBcInxcIiArIHRoaXMuZXhwaXJlZCArIFwiKVxcblwiICsgcHJvZ2Jhcih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLnRhcmdldFRpbWUpO1xuICB9O1xuICBUaW1lci51cGRhdGVBbGwgPSBmdW5jdGlvbijOlHQpe1xuICAgIHJldHVybiBhbGxUaW1lcnMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC51cGRhdGUozpR0KTtcbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIFRpbWVyO1xufSgpKTtcbmZ1bmN0aW9uIHJlcGVhdFN0cmluZyQoc3RyLCBuKXtcbiAgZm9yICh2YXIgciA9ICcnOyBuID4gMDsgKG4gPj49IDEpICYmIChzdHIgKz0gc3RyKSkgaWYgKG4gJiAxKSByICs9IHN0cjtcbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iXX0=
