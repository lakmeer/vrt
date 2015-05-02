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
    cameraDistanceFromEdge: 0.4,
    cameraElevation: 0.5,
    hardDropJoltAmount: 0.03,
    zapParticleSize: 0.01
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
},{"./game":9,"./renderer":26,"./utils/debug-output":31,"./utils/frame-driver":32,"./utils/game-state":33,"./utils/input-handler":34,"./utils/timer":35,"std":30}],2:[function(require,module,exports){
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
},{"std":30}],8:[function(require,module,exports){
var ref$, id, log, addV2, randInt, wrap, randomFrom, BrickShapes, canDrop, canMove, canRotate, collides, copyBrickToArena, topIsReached, isComplete, newBrick, spawnNewBrick, dropArenaRow, removeRows, clearArena, getShapeOfRotation, normaliseRotation, rotateBrick, computeScore, resetScore, out$ = typeof exports != 'undefined' && exports || this;
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
},{"./data/brick-shapes":6,"std":30}],9:[function(require,module,exports){
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
          gs.timers.hardDropEffect.reset(gs.hardDropDistance * 10);
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
          lresult$.push(gs.timers.removalAnimation.reset(10 + Math.pow(3, gs.rowsToRemove.length)));
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
      gs.timers.removalAnimation.reset(completeRows.length * 100);
      gs.rowsToRemove = completeRows;
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
},{"./fail-menu":7,"./game-core":8,"./start-menu":10,"std":30}],10:[function(require,module,exports){
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
},{"std":30}],11:[function(require,module,exports){
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
    this.mats.zap = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x999999
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
    onOff = !!(floor(timers.removalAnimation.currentTime) % 2);
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
},{"../palette":27,"./base":13,"std":30}],12:[function(require,module,exports){
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
    this.registration.position.z = -1 * (this.opts.cameraDistanceFromEdge + this.opts.arenaDistanceFromEdge + this.opts.blockSize / 2);
  }
  prototype.jolt = function(gs){
    var rowsToRemove, timers, p, zz, jolt;
    rowsToRemove = gs.rowsToRemove, timers = gs.timers;
    p = timers.removalAnimation.active
      ? 1 - timers.removalAnimation.progress
      : timers.hardDropEffect.progress ? max(1 - timers.hardDropEffect.progress) : 0;
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
    positionReceivingJolt.y = jitter[1];
    return this.parts.guideLines.dance(gs.elapsedTime);
  };
  prototype.updateParticles = function(gs){
    var timers;
    timers = gs.timers;
    return this.parts.particles.update(timers.removalAnimation.progress, this.state.framesSinceRowsRemoved, gs.Δt);
  };
  prototype.update = function(gs, positionReceivingJolt){
    var arena, brick;
    arena = gs.arena, brick = gs.brick;
    this.parts.arenaCells.updateCells(arena.cells);
    this.parts.thisBrick.displayShape(brick.current);
    this.parts.thisBrick.updatePos(brick.current.pos);
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
},{"./arena-cells":11,"./base":13,"./brick":15,"./frame":17,"./guide-lines":18,"./particle-effect":21,"std":30}],13:[function(require,module,exports){
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
},{"std":30}],14:[function(require,module,exports){
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
    this.opts = opts;
    BrickPreview.superclass.apply(this, arguments);
  }
  prototype.displayShape = function(brick){
    var grid, ref$, x, y;
    superclass.prototype.displayShape.apply(this, arguments);
    grid = this.opts.gridSize;
    ref$ = prettyOffset[brick.type], x = ref$[0], y = ref$[1];
    this.registration.position.x = (-1.5 + x) * grid;
    return this.registration.position.y = (-1.5 + y + 5) * grid;
  };
  prototype.updateWiggle = function(brick, elapsedTime){
    return this.root.rotation.y = 0.2 * sin(elapsedTime / 500);
  };
  return BrickPreview;
}(Brick));
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
},{"./base":13,"./brick":15,"std":30}],15:[function(require,module,exports){
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
    this.registration.position.set(width / -2 + 0.5 * grid, height - 0.5 * grid, 0);
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
  prototype.updatePos = function(arg$){
    var x, y, grid;
    x = arg$[0], y = arg$[1];
    grid = this.opts.gridSize;
    return this.brick.position.set(grid * x, grid * y, 0);
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
},{"../palette":27,"./base":13,"std":30}],16:[function(require,module,exports){
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
},{"./base":13,"std":30}],17:[function(require,module,exports){
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
},{"./base":13,"std":30}],18:[function(require,module,exports){
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
},{"../palette":27,"./base":13,"std":30}],19:[function(require,module,exports){
var ref$, Arena, Title, Table, BrickPreview, Lighting, StartMenu, FailScreen, out$ = typeof exports != 'undefined' && exports || this;
import$(out$, (ref$ = require('./arena'), Arena = ref$.Arena, ref$));
import$(out$, (ref$ = require('./title'), Title = ref$.Title, ref$));
import$(out$, (ref$ = require('./table'), Table = ref$.Table, ref$));
import$(out$, (ref$ = require('./brick-preview'), BrickPreview = ref$.BrickPreview, ref$));
import$(out$, (ref$ = require('./lighting'), Lighting = ref$.Lighting, ref$));
import$(out$, (ref$ = require('./start-menu'), StartMenu = ref$.StartMenu, ref$));
import$(out$, (ref$ = require('./fail-screen'), FailScreen = ref$.FailScreen, ref$));
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./arena":12,"./brick-preview":14,"./fail-screen":16,"./lighting":20,"./start-menu":22,"./table":23,"./title":24}],20:[function(require,module,exports){
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
},{"./base":13,"std":30}],21:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, rand, floor, Base, meshMaterials, ParticleBurst, ParticleEffect, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, rand = ref$.rand, floor = ref$.floor;
Base = require('./base').Base;
meshMaterials = require('../palette').meshMaterials;
out$.ParticleBurst = ParticleBurst = (function(superclass){
  var speed, lifespan, prototype = extend$((import$(ParticleBurst, superclass).displayName = 'ParticleBurst', ParticleBurst), superclass).prototype, constructor = ParticleBurst;
  speed = 2;
  lifespan = 2000;
  function ParticleBurst(opts, gs){
    var arena, width, height, particles, geometry, color, material;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    ParticleBurst.superclass.apply(this, arguments);
    this.size = this.opts.zapParticleSize;
    particles = 800;
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
    geometry.addAttribute('alpha', this.alphaAttr);
    geometry.computeBoundingSphere();
    material = new THREE.PointCloudMaterial({
      size: this.size,
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
      this.velocities[i + 1] = rand(grid, 10 * grid);
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
    this.colors[i + 0] = l;
    this.colors[i + 1] = l * l;
    this.colors[i + 2] = l * l * l * l;
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
      results$.push(this.positions[i + 1] = (y + Math.random() - 0.5) * grid);
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
},{"../palette":27,"./base":13,"std":30}],22:[function(require,module,exports){
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
    geom = new THREE.PlaneGeometry(1, 0.2);
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
},{"./base":13,"./title":24,"std":30}],23:[function(require,module,exports){
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
    this.registration.position.z = width / -2;
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
},{"../palette":27,"./base":13,"std":30}],24:[function(require,module,exports){
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
},{"../palette":27,"./base":13,"std":30}],25:[function(require,module,exports){
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
},{"std":30}],26:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, lerp, rand, floor, map, Ease, THREE, Palette, SceneManager, DebugCameraPositioner, Arena, Table, StartMenu, FailScreen, Lighting, BrickPreview, TrackballControls, ThreeJsRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, lerp = ref$.lerp, rand = ref$.rand, floor = ref$.floor, map = ref$.map;
Ease = require('std').Ease;
THREE = require('three-js-vr-extensions');
Palette = require('./palette').Palette;
SceneManager = require('./scene-manager').SceneManager;
DebugCameraPositioner = require('./debug-camera').DebugCameraPositioner;
ref$ = require('./components'), Arena = ref$.Arena, Table = ref$.Table, StartMenu = ref$.StartMenu, FailScreen = ref$.FailScreen, Lighting = ref$.Lighting, BrickPreview = ref$.BrickPreview;
TrackballControls = require('../../lib/trackball-controls.js').TrackballControls;
out$.ThreeJsRenderer = ThreeJsRenderer = (function(){
  ThreeJsRenderer.displayName = 'ThreeJsRenderer';
  var prototype = ThreeJsRenderer.prototype, constructor = ThreeJsRenderer;
  function ThreeJsRenderer(opts, gs){
    var arena, width, height, name, ref$, part, trackballTarget;
    this.opts = opts;
    arena = gs.arena, width = arena.width, height = arena.height;
    log("Renderer::new");
    this.scene = new SceneManager(this.opts);
    this.state = {
      framesSinceRowsRemoved: 0,
      lastSeenState: 'no-game'
    };
    this.parts = {
      table: new Table(this.opts, gs),
      lighting: new Lighting(this.opts, gs),
      arena: new Arena(this.opts, gs),
      startMenu: new StartMenu(this.opts, gs),
      failScreen: new FailScreen(this.opts, gs),
      nextBrick: new BrickPreview(this.opts, gs)
    };
    for (name in ref$ = this.parts) {
      part = ref$[name];
      this.scene.add(part);
    }
    this.parts.nextBrick.root.position.set(0, 0, -this.opts.cameraDistanceFromEdge);
    trackballTarget = new THREE.Object3D;
    this.scene.add(trackballTarget);
    trackballTarget.position.z = -this.opts.cameraDistanceFromEdge;
    this.trackball = new THREE.TrackballControls(this.scene.camera, trackballTarget);
    this.scene.controls.resetSensor();
    this.scene.root.position.set(0, -this.opts.cameraElevation, -this.opts.cameraDistanceFromEdge * 2);
    this.scene.showHelpers();
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
      gs.slowdown = 1 + Ease.quintIn(p, 10, 0);
      this.parts.arena.zapLines(gs, this.scene.registration.position);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
      break;
    case 'game':
      gs.slowdown = 1;
      this.parts.arena.update(gs, this.scene.registration.position);
      this.parts.nextBrick.displayShape(gs.brick.next);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
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
    this.scene.render();
    this.parts.lighting.root.position.x = 0.5 * sin(gs.elapsedTime / 100);
    return this.parts.lighting.root.position.y = 0.5 * cos(gs.elapsedTime / 100);
  };
  return ThreeJsRenderer;
}());
},{"../../lib/trackball-controls.js":5,"./components":19,"./debug-camera":25,"./palette":27,"./scene-manager":28,"std":30,"three-js-vr-extensions":4}],27:[function(require,module,exports){
var THREE, map, pluck, neutral, red, orange, green, magenta, blue, brown, yellow, cyan, colorOrder, tileColors, specColors, normalMaps, normalAdjust, meshMaterials, i, color, lineMaterials, Palette, out$ = typeof exports != 'undefined' && exports || this;
THREE = require('three-js-vr-extensions');
map = require('std').map;
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
normalMaps = [THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png'), THREE.ImageUtils.loadTexture('../assets/tile.nrm.png')];
normalAdjust = new THREE.Vector2(1, 1);
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
      normalMap: normalMaps[i],
      normalScale: normalAdjust
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
},{"std":30,"three-js-vr-extensions":4}],28:[function(require,module,exports){
var ref$, id, log, THREE, SceneManager, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
THREE = require('three-js-vr-extensions');
out$.SceneManager = SceneManager = (function(){
  SceneManager.displayName = 'SceneManager';
  var prototype = SceneManager.prototype, constructor = SceneManager;
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
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(window.innerWidth - 1, window.innerHeight - 1);
    window.addEventListener('keydown', this.zeroSensor, true);
    window.addEventListener('resize', this.resize, false);
    document.body.addEventListener('dblclick', this.goFullscreen);
    this.scene.add(this.root);
    this.root.add(this.registration);
  }
  prototype.showHelpers = function(){
    var grid, axis, rootAxis;
    grid = new THREE.GridHelper(10, 0.1);
    axis = new THREE.AxisHelper(1);
    rootAxis = new THREE.AxisHelper(0.5);
    axis.position.z = this.registration.position.z;
    rootAxis.position.z = this.root.position.z;
    return this.registration.add(grid, axis);
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
},{"std":30,"three-js-vr-extensions":4}],29:[function(require,module,exports){
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
},{"std":30}],30:[function(require,module,exports){
var id, log, flip, delay, floor, random, rand, randInt, randomFrom, addV2, filter, pi, tau, pow, sin, cos, min, max, lerp, map, join, unlines, wrap, limit, raf, that, Ease, out$ = typeof exports != 'undefined' && exports || this;
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
},{"./easing":29}],31:[function(require,module,exports){
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
},{"std":30}],32:[function(require,module,exports){
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
},{"std":30}],33:[function(require,module,exports){
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
},{"./timer":35,"std":30}],34:[function(require,module,exports){
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
  SIX: 54
};
ACTION_NAME = (ref$ = {}, ref$[KEY.RETURN + ""] = 'confirm', ref$[KEY.ESCAPE + ""] = 'cancel', ref$[KEY.SPACE + ""] = 'hard-drop', ref$[KEY.X + ""] = 'cw', ref$[KEY.Z + ""] = 'ccw', ref$[KEY.UP + ""] = 'up', ref$[KEY.LEFT + ""] = 'left', ref$[KEY.RIGHT + ""] = 'right', ref$[KEY.DOWN + ""] = 'down', ref$[KEY.ONE + ""] = 'debug-1', ref$[KEY.TWO + ""] = 'debug-2', ref$[KEY.THREE + ""] = 'debug-3', ref$[KEY.FOUR + ""] = 'debug-4', ref$[KEY.FIVE + ""] = 'debug-5', ref$);
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
},{"./timer":35,"std":30}],35:[function(require,module,exports){
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
    this.currentTime = 0;
    this.targetTime = time;
    return this.state = TIMER_ACTIVE;
  };
  prototype.resetWithRemainder = function(time){
    time == null && (time = this.targetTime);
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
},{"std":30}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9saWIvbW96dnIvVlJDb250cm9scy5qcyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9saWIvbW96dnIvVlJFZmZlY3QuanMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvbGliL21venZyL2luZGV4LmpzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L2xpYi90cmFja2JhbGwtY29udHJvbHMuanMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvc3JjL2dhbWUvZmFpbC1tZW51LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvZ2FtZS9zdGFydC1tZW51LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2Jhc2UubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9icmljay5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWlsLXNjcmVlbi5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mcmFtZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9ndWlkZS1saW5lcy5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9saWdodGluZy5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9wYXJ0aWNsZS1lZmZlY3QubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvc3RhcnQtbWVudS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90aXRsZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvZGVidWctY2FtZXJhLmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy9yZW5kZXJlci9pbmRleC5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvcGFsZXR0ZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvcmVuZGVyZXIvc2NlbmUtbWFuYWdlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvc3RkL2Vhc2luZy5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvc3RkL2luZGV4LmxzIiwiL1VzZXJzL2xha21lZXIvUHJvamVjdHMvdnJ0L3NyYy91dGlscy9kZWJ1Zy1vdXRwdXQubHMiLCIvVXNlcnMvbGFrbWVlci9Qcm9qZWN0cy92cnQvc3JjL3V0aWxzL2ZyYW1lLWRyaXZlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvdXRpbHMvZ2FtZS1zdGF0ZS5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvdXRpbHMvaW5wdXQtaGFuZGxlci5scyIsIi9Vc2Vycy9sYWttZWVyL1Byb2plY3RzL3ZydC9zcmMvdXRpbHMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgVGltZXIsIEdhbWVTdGF0ZSwgRGVidWdPdXRwdXQsIFRldHJpc0dhbWUsIFRocmVlSnNSZW5kZXJlcjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIGRlbGF5ID0gcmVmJC5kZWxheTtcbkZyYW1lRHJpdmVyID0gcmVxdWlyZSgnLi91dGlscy9mcmFtZS1kcml2ZXInKS5GcmFtZURyaXZlcjtcbklucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vdXRpbHMvaW5wdXQtaGFuZGxlcicpLklucHV0SGFuZGxlcjtcblRpbWVyID0gcmVxdWlyZSgnLi91dGlscy90aW1lcicpLlRpbWVyO1xuR2FtZVN0YXRlID0gcmVxdWlyZSgnLi91dGlscy9nYW1lLXN0YXRlJykuR2FtZVN0YXRlO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL3V0aWxzL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLlRldHJpc0dhbWU7XG5UaHJlZUpzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuVGhyZWVKc1JlbmRlcmVyO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBnYW1lT3B0cywgcmVuZGVyT3B0cywgaW5wdXRIYW5kbGVyLCBnYW1lU3RhdGUsIHRldHJpc0dhbWUsIHJlbmRlcmVyLCBkZWJ1Z091dHB1dCwgdGVzdEVhc2luZywgZnJhbWVEcml2ZXI7XG4gIGdhbWVPcHRzID0ge1xuICAgIHRpbGVXaWR0aDogMTAsXG4gICAgdGlsZUhlaWdodDogMjAsXG4gICAgdGltZUZhY3RvcjogMVxuICB9O1xuICByZW5kZXJPcHRzID0ge1xuICAgIHVuaXRzUGVyTWV0ZXI6IDEsXG4gICAgZ3JpZFNpemU6IDAuMDcsXG4gICAgYmxvY2tTaXplOiAwLjA2OSxcbiAgICBkZXNrU2l6ZTogWzEuNiwgMC44XSxcbiAgICBhcmVuYURpc3RhbmNlRnJvbUVkZ2U6IDAuNSxcbiAgICBwcmV2aWV3RGlzdGFuY2VGcm9tRWRnZTogMC4yLFxuICAgIHByZXZpZXdTY2FsZUZhY3RvcjogMC41LFxuICAgIGNhbWVyYURpc3RhbmNlRnJvbUVkZ2U6IDAuNCxcbiAgICBjYW1lcmFFbGV2YXRpb246IDAuNSxcbiAgICBoYXJkRHJvcEpvbHRBbW91bnQ6IDAuMDMsXG4gICAgemFwUGFydGljbGVTaXplOiAwLjAxXG4gIH07XG4gIGlucHV0SGFuZGxlciA9IG5ldyBJbnB1dEhhbmRsZXI7XG4gIGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoZ2FtZU9wdHMpO1xuICB0ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlKTtcbiAgcmVuZGVyZXIgPSBuZXcgVGhyZWVKc1JlbmRlcmVyKHJlbmRlck9wdHMsIGdhbWVTdGF0ZSk7XG4gIHJlbmRlcmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuICBkZWJ1Z091dHB1dCA9IG5ldyBEZWJ1Z091dHB1dDtcbiAgSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgICBpZiAoZnJhbWVEcml2ZXIuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gICAgfVxuICB9KTtcbiAgdGVzdEVhc2luZyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIEVhc2UsIGkkLCByZWYkLCBsZW4kLCBlbCwgZWFzZU5hbWUsIGVhc2UsIGxyZXN1bHQkLCBjbnYsIGN0eCwgaSwgcCwgcmVzdWx0cyQgPSBbXTtcbiAgICBFYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY2FudmFzJykpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBlbCA9IHJlZiRbaSRdO1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgZm9yIChlYXNlTmFtZSBpbiBFYXNlKSB7XG4gICAgICBlYXNlID0gRWFzZVtlYXNlTmFtZV07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgY252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjbnYud2lkdGggPSAyMDA7XG4gICAgICBjbnYuaGVpZ2h0ID0gMjAwO1xuICAgICAgY252LnN0eWxlLmJhY2tncm91bmQgPSAnd2hpdGUnO1xuICAgICAgY252LnN0eWxlLmJvcmRlckxlZnQgPSBcIjNweCBzb2xpZCBibGFja1wiO1xuICAgICAgY3R4ID0gY252LmdldENvbnRleHQoJzJkJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNudik7XG4gICAgICBjdHguZm9udCA9IFwiMTRweCBtb25vc3BhY2VcIjtcbiAgICAgIGN0eC5maWxsVGV4dChlYXNlTmFtZSwgMiwgMTYsIDIwMCk7XG4gICAgICBmb3IgKGkkID0gMDsgaSQgPD0gMTAwOyArK2kkKSB7XG4gICAgICAgIGkgPSBpJDtcbiAgICAgICAgcCA9IGkgLyAxMDA7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY3R4LmZpbGxSZWN0KDIgKiBpLCAyMDAgLSBlYXNlKHAsIDAsIDIwMCksIDIsIDIpKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIGZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUpe1xuICAgIGdhbWVTdGF0ZS7OlHQgPSDOlHQgLyBnYW1lT3B0cy50aW1lRmFjdG9yIC8gZ2FtZVN0YXRlLnNsb3dkb3duO1xuICAgIGdhbWVTdGF0ZS5lbGFwc2VkVGltZSA9IHRpbWUgLyBnYW1lT3B0cy50aW1lRmFjdG9yO1xuICAgIGdhbWVTdGF0ZS5lbGFwc2VkRnJhbWVzID0gZnJhbWU7XG4gICAgZ2FtZVN0YXRlLmlucHV0U3RhdGUgPSBpbnB1dEhhbmRsZXIuY2hhbmdlc1NpbmNlTGFzdEZyYW1lKCk7XG4gICAgVGltZXIudXBkYXRlQWxsKGdhbWVTdGF0ZS7OlHQpO1xuICAgIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUucnVuRnJhbWUoZ2FtZVN0YXRlLCBnYW1lU3RhdGUuzpR0KTtcbiAgICByZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlLCByZW5kZXJPcHRzKTtcbiAgICBpZiAoZGVidWdPdXRwdXQpIHtcbiAgICAgIHJldHVybiBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlKTtcbiAgICB9XG4gIH0pO1xuICBmcmFtZURyaXZlci5zdGFydCgpO1xuICByZXR1cm4gdGV0cmlzR2FtZS5iZWdpbk5ld0dhbWUoZ2FtZVN0YXRlKTtcbn0pOyIsIi8qKlxuICogQGF1dGhvciBkbWFyY29zIC8gaHR0cHM6Ly9naXRodWIuY29tL2RtYXJjb3NcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqL1xuXG5USFJFRS5WUkNvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIG9uRXJyb3IgKSB7XG5cblx0dmFyIHNjb3BlID0gdGhpcztcblx0dmFyIHZySW5wdXRzID0gW107XG5cblx0ZnVuY3Rpb24gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKSB7XG5cblx0XHQvLyBFeGNsdWRlIENhcmRib2FyZCBwb3NpdGlvbiBzZW5zb3IgaWYgT2N1bHVzIGV4aXN0cy5cblx0XHR2YXIgb2N1bHVzRGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKCBmdW5jdGlvbiAoIGRldmljZSApIHtcblx0XHRcdHJldHVybiBkZXZpY2UuZGV2aWNlTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ29jdWx1cycpICE9PSAtMTtcblx0XHR9ICk7XG5cblx0XHRpZiAoIG9jdWx1c0RldmljZXMubGVuZ3RoID49IDEgKSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlcy5maWx0ZXIoIGZ1bmN0aW9uICggZGV2aWNlICkge1xuXHRcdFx0XHRyZXR1cm4gZGV2aWNlLmRldmljZU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjYXJkYm9hcmQnKSA9PT0gLTE7XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkZXZpY2VzO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdvdFZSRGV2aWNlcyggZGV2aWNlcyApIHtcblx0XHRkZXZpY2VzID0gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKTtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdGlmICggZGV2aWNlc1sgaSBdIGluc3RhbmNlb2YgUG9zaXRpb25TZW5zb3JWUkRldmljZSApIHtcblx0XHRcdFx0dnJJbnB1dHMucHVzaCggZGV2aWNlc1sgaSBdICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vIHRoZSBSaWZ0IFNESyByZXR1cm5zIHRoZSBwb3NpdGlvbiBpbiBtZXRlcnNcblx0Ly8gdGhpcyBzY2FsZSBmYWN0b3IgYWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSBob3cgbWV0ZXJzXG5cdC8vIGFyZSBjb252ZXJ0ZWQgdG8gc2NlbmUgdW5pdHMuXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHZySW5wdXRzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdHZhciB2cklucHV0ID0gdnJJbnB1dHNbIGkgXTtcblx0XHRcdHZhciBzdGF0ZSA9IHZySW5wdXQuZ2V0U3RhdGUoKTtcblxuXHRcdFx0aWYgKCBzdGF0ZS5vcmllbnRhdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnF1YXRlcm5pb24uY29weSggc3RhdGUub3JpZW50YXRpb24gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzdGF0ZS5wb3NpdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnBvc2l0aW9uLmNvcHkoIHN0YXRlLnBvc2l0aW9uICkubXVsdGlwbHlTY2FsYXIoIHNjb3BlLnNjYWxlICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucmVzZXRTZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdnJJbnB1dHMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0dmFyIHZySW5wdXQgPSB2cklucHV0c1sgaSBdO1xuXG5cdFx0XHRpZiAoIHZySW5wdXQucmVzZXRTZW5zb3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dnJJbnB1dC5yZXNldFNlbnNvcigpO1xuXHRcdFx0fSBlbHNlIGlmICggdnJJbnB1dC56ZXJvU2Vuc29yICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHZySW5wdXQuemVyb1NlbnNvcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnplcm9TZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0VEhSRUUud2FybiggJ1RIUkVFLlZSQ29udHJvbHM6IC56ZXJvU2Vuc29yKCkgaXMgbm93IC5yZXNldFNlbnNvcigpLicgKTtcblx0XHR0aGlzLnJlc2V0U2Vuc29yKCk7XG5cdH07XG5cbn07XG5cbiIsIlxuLyoqXG4gKiBAYXV0aG9yIGRtYXJjb3MgLyBodHRwczovL2dpdGh1Yi5jb20vZG1hcmNvc1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICpcbiAqIFdlYlZSIFNwZWM6IGh0dHA6Ly9tb3p2ci5naXRodWIuaW8vd2VidnItc3BlYy93ZWJ2ci5odG1sXG4gKlxuICogRmlyZWZveDogaHR0cDovL21venZyLmNvbS9kb3dubG9hZHMvXG4gKiBDaHJvbWl1bTogaHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2ZvbGRlcnZpZXc/aWQ9MEJ6dWRMdDIyQnFHUmJXOVdUSE10T1dNek5qUSZ1c3A9c2hhcmluZyNsaXN0XG4gKlxuICovXG5cblRIUkVFLlZSRWZmZWN0ID0gZnVuY3Rpb24gKCByZW5kZXJlciwgb25FcnJvciApIHtcblxuXHR2YXIgdnJITUQ7XG5cdHZhciBleWVUcmFuc2xhdGlvbkwsIGV5ZUZPVkw7XG5cdHZhciBleWVUcmFuc2xhdGlvblIsIGV5ZUZPVlI7XG5cblx0ZnVuY3Rpb24gZ290VlJEZXZpY2VzKCBkZXZpY2VzICkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0aWYgKCBkZXZpY2VzWyBpIF0gaW5zdGFuY2VvZiBITURWUkRldmljZSApIHtcblx0XHRcdFx0dnJITUQgPSBkZXZpY2VzWyBpIF07XG5cblx0XHRcdFx0aWYgKCB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dmFyIGV5ZVBhcmFtc0wgPSB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAnbGVmdCcgKTtcblx0XHRcdFx0XHR2YXIgZXllUGFyYW1zUiA9IHZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdyaWdodCcgKTtcblxuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uTCA9IGV5ZVBhcmFtc0wuZXllVHJhbnNsYXRpb247XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gZXllUGFyYW1zUi5leWVUcmFuc2xhdGlvbjtcblx0XHRcdFx0XHRleWVGT1ZMID0gZXllUGFyYW1zTC5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuXHRcdFx0XHRcdGV5ZUZPVlIgPSBleWVQYXJhbXNSLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVE9ETzogVGhpcyBpcyBhbiBvbGRlciBjb2RlIHBhdGggYW5kIG5vdCBzcGVjIGNvbXBsaWFudC5cblx0XHRcdFx0XHQvLyBJdCBzaG91bGQgYmUgcmVtb3ZlZCBhdCBzb21lIHBvaW50IGluIHRoZSBuZWFyIGZ1dHVyZS5cblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvbkwgPSB2ckhNRC5nZXRFeWVUcmFuc2xhdGlvbiggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gdnJITUQuZ2V0RXllVHJhbnNsYXRpb24oICdyaWdodCcgKTtcblx0XHRcdFx0XHRleWVGT1ZMID0gdnJITUQuZ2V0UmVjb21tZW5kZWRFeWVGaWVsZE9mVmlldyggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllRk9WUiA9IHZySE1ELmdldFJlY29tbWVuZGVkRXllRmllbGRPZlZpZXcoICdyaWdodCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhazsgLy8gV2Uga2VlcCB0aGUgZmlyc3Qgd2UgZW5jb3VudGVyXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHRcdH1cblxuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMuc2V0U2l6ZSA9IGZ1bmN0aW9uKCB3aWR0aCwgaGVpZ2h0ICkge1xuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcblx0fTtcblxuXHQvLyBmdWxsc2NyZWVuXG5cblx0dmFyIGlzRnVsbHNjcmVlbiA9IGZhbHNlO1xuXHR2YXIgY2FudmFzID0gcmVuZGVyZXIuZG9tRWxlbWVudDtcblx0dmFyIGZ1bGxzY3JlZW5jaGFuZ2UgPSBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4gPyAnbW96ZnVsbHNjcmVlbmNoYW5nZScgOiAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggZnVsbHNjcmVlbmNoYW5nZSwgZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRpc0Z1bGxzY3JlZW4gPSBkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudDtcblx0fSwgZmFsc2UgKTtcblxuXHR0aGlzLnNldEZ1bGxTY3JlZW4gPSBmdW5jdGlvbiAoIGJvb2xlYW4gKSB7XG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXHRcdGlmICggaXNGdWxsc2NyZWVuID09PSBib29sZWFuICkgcmV0dXJuO1xuXHRcdGlmICggY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuICkge1xuXHRcdFx0Y2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuKCB7IHZyRGlzcGxheTogdnJITUQgfSApO1xuXHRcdH0gZWxzZSBpZiAoIGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiApIHtcblx0XHRcdGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiggeyB2ckRpc3BsYXk6IHZySE1EIH0gKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gcmVuZGVyXG5cdHZhciBjYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cdHZhciBjYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cblx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEgKSB7XG5cdFx0aWYgKCB2ckhNRCApIHtcblx0XHRcdHZhciBzY2VuZUwsIHNjZW5lUjtcblxuXHRcdFx0aWYgKCBzY2VuZSBpbnN0YW5jZW9mIEFycmF5ICkge1xuXHRcdFx0XHRzY2VuZUwgPSBzY2VuZVsgMCBdO1xuXHRcdFx0XHRzY2VuZVIgPSBzY2VuZVsgMSBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2NlbmVMID0gc2NlbmU7XG5cdFx0XHRcdHNjZW5lUiA9IHNjZW5lO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc2l6ZSA9IHJlbmRlcmVyLmdldFNpemUoKTtcblx0XHRcdHNpemUud2lkdGggLz0gMjtcblxuXHRcdFx0cmVuZGVyZXIuZW5hYmxlU2Npc3NvclRlc3QoIHRydWUgKTtcblx0XHRcdHJlbmRlcmVyLmNsZWFyKCk7XG5cblx0XHRcdGlmICggY2FtZXJhLnBhcmVudCA9PT0gdW5kZWZpbmVkICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cblx0XHRcdGNhbWVyYUwucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggZXllRk9WTCwgdHJ1ZSwgY2FtZXJhLm5lYXIsIGNhbWVyYS5mYXIgKTtcblx0XHRcdGNhbWVyYVIucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggZXllRk9WUiwgdHJ1ZSwgY2FtZXJhLm5lYXIsIGNhbWVyYS5mYXIgKTtcblxuXHRcdFx0Y2FtZXJhLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggY2FtZXJhTC5wb3NpdGlvbiwgY2FtZXJhTC5xdWF0ZXJuaW9uLCBjYW1lcmFMLnNjYWxlICk7XG5cdFx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFSLnBvc2l0aW9uLCBjYW1lcmFSLnF1YXRlcm5pb24sIGNhbWVyYVIuc2NhbGUgKTtcblxuXHRcdFx0Y2FtZXJhTC50cmFuc2xhdGVYKCBleWVUcmFuc2xhdGlvbkwueCAqIHRoaXMuc2NhbGUgKTtcblx0XHRcdGNhbWVyYVIudHJhbnNsYXRlWCggZXllVHJhbnNsYXRpb25SLnggKiB0aGlzLnNjYWxlICk7XG5cblx0XHRcdC8vIHJlbmRlciBsZWZ0IGV5ZVxuXHRcdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5zZXRTY2lzc29yKCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZUwsIGNhbWVyYUwgKTtcblxuXHRcdFx0Ly8gcmVuZGVyIHJpZ2h0IGV5ZVxuXHRcdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIHNpemUud2lkdGgsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5zZXRTY2lzc29yKCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZVIsIGNhbWVyYVIgKTtcblxuXHRcdFx0cmVuZGVyZXIuZW5hYmxlU2Npc3NvclRlc3QoIGZhbHNlICk7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdC8vIFJlZ3VsYXIgcmVuZGVyIG1vZGUgaWYgbm90IEhNRFxuXG5cdFx0aWYgKCBzY2VuZSBpbnN0YW5jZW9mIEFycmF5ICkgc2NlbmUgPSBzY2VuZVsgMCBdO1xuXG5cdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XG5cblx0fTtcblxuXHQvL1xuXG5cdGZ1bmN0aW9uIGZvdlRvTkRDU2NhbGVPZmZzZXQoIGZvdiApIHtcblxuXHRcdHZhciBweHNjYWxlID0gMi4wIC8gKGZvdi5sZWZ0VGFuICsgZm92LnJpZ2h0VGFuKTtcblx0XHR2YXIgcHhvZmZzZXQgPSAoZm92LmxlZnRUYW4gLSBmb3YucmlnaHRUYW4pICogcHhzY2FsZSAqIDAuNTtcblx0XHR2YXIgcHlzY2FsZSA9IDIuMCAvIChmb3YudXBUYW4gKyBmb3YuZG93blRhbik7XG5cdFx0dmFyIHB5b2Zmc2V0ID0gKGZvdi51cFRhbiAtIGZvdi5kb3duVGFuKSAqIHB5c2NhbGUgKiAwLjU7XG5cdFx0cmV0dXJuIHsgc2NhbGU6IFsgcHhzY2FsZSwgcHlzY2FsZSBdLCBvZmZzZXQ6IFsgcHhvZmZzZXQsIHB5b2Zmc2V0IF0gfTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gZm92UG9ydFRvUHJvamVjdGlvbiggZm92LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKSB7XG5cblx0XHRyaWdodEhhbmRlZCA9IHJpZ2h0SGFuZGVkID09PSB1bmRlZmluZWQgPyB0cnVlIDogcmlnaHRIYW5kZWQ7XG5cdFx0ek5lYXIgPSB6TmVhciA9PT0gdW5kZWZpbmVkID8gMC4wMSA6IHpOZWFyO1xuXHRcdHpGYXIgPSB6RmFyID09PSB1bmRlZmluZWQgPyAxMDAwMC4wIDogekZhcjtcblxuXHRcdHZhciBoYW5kZWRuZXNzU2NhbGUgPSByaWdodEhhbmRlZCA/IC0xLjAgOiAxLjA7XG5cblx0XHQvLyBzdGFydCB3aXRoIGFuIGlkZW50aXR5IG1hdHJpeFxuXHRcdHZhciBtb2JqID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblx0XHR2YXIgbSA9IG1vYmouZWxlbWVudHM7XG5cblx0XHQvLyBhbmQgd2l0aCBzY2FsZS9vZmZzZXQgaW5mbyBmb3Igbm9ybWFsaXplZCBkZXZpY2UgY29vcmRzXG5cdFx0dmFyIHNjYWxlQW5kT2Zmc2V0ID0gZm92VG9ORENTY2FsZU9mZnNldChmb3YpO1xuXG5cdFx0Ly8gWCByZXN1bHQsIG1hcCBjbGlwIGVkZ2VzIHRvIFstdywrd11cblx0XHRtWzAgKiA0ICsgMF0gPSBzY2FsZUFuZE9mZnNldC5zY2FsZVswXTtcblx0XHRtWzAgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVswICogNCArIDJdID0gc2NhbGVBbmRPZmZzZXQub2Zmc2V0WzBdICogaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMCAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdC8vIFkgcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG5cdFx0Ly8gWSBvZmZzZXQgaXMgbmVnYXRlZCBiZWNhdXNlIHRoaXMgcHJvaiBtYXRyaXggdHJhbnNmb3JtcyBmcm9tIHdvcmxkIGNvb3JkcyB3aXRoIFk9dXAsXG5cdFx0Ly8gYnV0IHRoZSBOREMgc2NhbGluZyBoYXMgWT1kb3duICh0aGFua3MgRDNEPylcblx0XHRtWzEgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVsxICogNCArIDFdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMV07XG5cdFx0bVsxICogNCArIDJdID0gLXNjYWxlQW5kT2Zmc2V0Lm9mZnNldFsxXSAqIGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzEgKiA0ICsgM10gPSAwLjA7XG5cblx0XHQvLyBaIHJlc3VsdCAodXAgdG8gdGhlIGFwcClcblx0XHRtWzIgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVsyICogNCArIDFdID0gMC4wO1xuXHRcdG1bMiAqIDQgKyAyXSA9IHpGYXIgLyAoek5lYXIgLSB6RmFyKSAqIC1oYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVsyICogNCArIDNdID0gKHpGYXIgKiB6TmVhcikgLyAoek5lYXIgLSB6RmFyKTtcblxuXHRcdC8vIFcgcmVzdWx0ICg9IFogaW4pXG5cdFx0bVszICogNCArIDBdID0gMC4wO1xuXHRcdG1bMyAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzMgKiA0ICsgMl0gPSBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVszICogNCArIDNdID0gMC4wO1xuXG5cdFx0bW9iai50cmFuc3Bvc2UoKTtcblxuXHRcdHJldHVybiBtb2JqO1xuXHR9XG5cblx0ZnVuY3Rpb24gZm92VG9Qcm9qZWN0aW9uKCBmb3YsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApIHtcblxuXHRcdHZhciBERUcyUkFEID0gTWF0aC5QSSAvIDE4MC4wO1xuXG5cdFx0dmFyIGZvdlBvcnQgPSB7XG5cdFx0XHR1cFRhbjogTWF0aC50YW4oIGZvdi51cERlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRkb3duVGFuOiBNYXRoLnRhbiggZm92LmRvd25EZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0bGVmdFRhbjogTWF0aC50YW4oIGZvdi5sZWZ0RGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdHJpZ2h0VGFuOiBNYXRoLnRhbiggZm92LnJpZ2h0RGVncmVlcyAqIERFRzJSQUQgKVxuXHRcdH07XG5cblx0XHRyZXR1cm4gZm92UG9ydFRvUHJvamVjdGlvbiggZm92UG9ydCwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICk7XG5cblx0fVxuXG59O1xuIiwiXG4vKlxuICogTW96VlIgRXh0ZW5zaW9ucyB0byB0aHJlZS5qc1xuICpcbiAqIEEgYnJvd3NlcmlmeSB3cmFwcGVyIGZvciB0aGUgVlIgaGVscGVycyBmcm9tIE1velZSJ3MgZ2l0aHViIHJlcG8uXG4gKiBodHRwczovL2dpdGh1Yi5jb20vTW96VlIvdnItd2ViLWV4YW1wbGVzL3RyZWUvbWFzdGVyL3RocmVlanMtdnItYm9pbGVycGxhdGVcbiAqXG4gKiBUaGUgZXh0ZW5zaW9uIGZpbGVzIGFyZSBub3QgbW9kdWxlIGNvbXBhdGlibGUgYW5kIHdvcmsgYnkgYXBwZW5kaW5nIHRvIHRoZVxuICogVEhSRUUgb2JqZWN0LiBEbyB1c2UgdGhlbSwgd2UgbWFrZSB0aGUgVEhSRUUgb2JqZWN0IGdsb2JhbCwgYW5kIHRoZW4gbWFrZVxuICogaXQgdGhlIGV4cG9ydCB2YWx1ZSBvZiB0aGlzIG1vZHVsZS5cbiAqXG4gKi9cblxuY29uc29sZS5ncm91cENvbGxhcHNlZCgnTG9hZGluZyBNb3pWUiBFeHRlbnNpb25zLi4uJyk7XG4vL3JlcXVpcmUoJy4vU3RlcmVvRWZmZWN0LmpzJyk7XG4vL2NvbnNvbGUubG9nKCdTdGVyZW9FZmZlY3QgLSBPSycpO1xuXG5yZXF1aXJlKCcuL1ZSQ29udHJvbHMuanMnKTtcbmNvbnNvbGUubG9nKCdWUkNvbnRyb2xzIC0gT0snKTtcblxucmVxdWlyZSgnLi9WUkVmZmVjdC5qcycpO1xuY29uc29sZS5sb2coJ1ZSRWZmZWN0IC0gT0snKTtcblxuY29uc29sZS5ncm91cEVuZCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFO1xuXG4iLCIvKipcbiAqIEBhdXRob3IgRWJlcmhhcmQgR3JhZXRoZXIgLyBodHRwOi8vZWdyYWV0aGVyLmNvbS9cbiAqIEBhdXRob3IgTWFyayBMdW5kaW4gXHQvIGh0dHA6Ly9tYXJrLWx1bmRpbi5jb21cbiAqIEBhdXRob3IgU2ltb25lIE1hbmluaSAvIGh0dHA6Ly9kYXJvbjEzMzcuZ2l0aHViLmlvXG4gKiBAYXV0aG9yIEx1Y2EgQW50aWdhIFx0LyBodHRwOi8vbGFudGlnYS5naXRodWIuaW9cbiAqL1xuXG5USFJFRS5UcmFja2JhbGxDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCB0YXJnZXQsIGRvbUVsZW1lbnQgKSB7XG5cblx0dmFyIF90aGlzID0gdGhpcztcblx0dmFyIFNUQVRFID0geyBOT05FOiAtMSwgUk9UQVRFOiAwLCBaT09NOiAxLCBQQU46IDIsIFRPVUNIX1JPVEFURTogMywgVE9VQ0hfWk9PTV9QQU46IDQgfTtcblxuXHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblx0dGhpcy5kb21FbGVtZW50ID0gKCBkb21FbGVtZW50ICE9PSB1bmRlZmluZWQgKSA/IGRvbUVsZW1lbnQgOiBkb2N1bWVudDtcblxuXHQvLyBBUElcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG5cdHRoaXMuc2NyZWVuID0geyBsZWZ0OiAwLCB0b3A6IDAsIHdpZHRoOiAwLCBoZWlnaHQ6IDAgfTtcblxuXHR0aGlzLnJvdGF0ZVNwZWVkID0gMS4wO1xuXHR0aGlzLnpvb21TcGVlZCA9IDEuMjtcblx0dGhpcy5wYW5TcGVlZCA9IDAuMztcblxuXHR0aGlzLm5vUm90YXRlID0gZmFsc2U7XG5cdHRoaXMubm9ab29tID0gZmFsc2U7XG5cdHRoaXMubm9QYW4gPSBmYWxzZTtcblxuXHR0aGlzLnN0YXRpY01vdmluZyA9IGZhbHNlO1xuXHR0aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yID0gMC4yO1xuXG5cdHRoaXMubWluRGlzdGFuY2UgPSAwO1xuXHR0aGlzLm1heERpc3RhbmNlID0gSW5maW5pdHk7XG5cblx0dGhpcy5rZXlzID0gWyA2NSAvKkEqLywgODMgLypTKi8sIDY4IC8qRCovIF07XG5cblx0Ly8gaW50ZXJuYWxzXG5cblx0dGhpcy50YXJnZXQgPSB0YXJnZXQgPyB0YXJnZXQucG9zaXRpb24gOiBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBFUFMgPSAwLjAwMDAwMTtcblxuXHR2YXIgbGFzdFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgX3N0YXRlID0gU1RBVEUuTk9ORSxcblx0X3ByZXZTdGF0ZSA9IFNUQVRFLk5PTkUsXG5cblx0X2V5ZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cblx0X21vdmVQcmV2ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X21vdmVDdXJyID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblxuXHRfbGFzdEF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRfbGFzdEFuZ2xlID0gMCxcblxuXHRfem9vbVN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X3pvb21FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXG5cdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gMCxcblx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gMCxcblxuXHRfcGFuU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfcGFuRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHQvLyBmb3IgcmVzZXRcblxuXHR0aGlzLnRhcmdldDAgPSB0aGlzLnRhcmdldC5jbG9uZSgpO1xuXHR0aGlzLnBvc2l0aW9uMCA9IHRoaXMub2JqZWN0LnBvc2l0aW9uLmNsb25lKCk7XG5cdHRoaXMudXAwID0gdGhpcy5vYmplY3QudXAuY2xvbmUoKTtcblxuXHQvLyBldmVudHNcblxuXHR2YXIgY2hhbmdlRXZlbnQgPSB7IHR5cGU6ICdjaGFuZ2UnIH07XG5cdHZhciBzdGFydEV2ZW50ID0geyB0eXBlOiAnc3RhcnQnIH07XG5cdHZhciBlbmRFdmVudCA9IHsgdHlwZTogJ2VuZCcgfTtcblxuXG5cdC8vIG1ldGhvZHNcblxuXHR0aGlzLmhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggdGhpcy5kb21FbGVtZW50ID09PSBkb2N1bWVudCApIHtcblxuXHRcdFx0dGhpcy5zY3JlZW4ubGVmdCA9IDA7XG5cdFx0XHR0aGlzLnNjcmVlbi50b3AgPSAwO1xuXHRcdFx0dGhpcy5zY3JlZW4ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHRcdHRoaXMuc2NyZWVuLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHZhciBib3ggPSB0aGlzLmRvbUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHQvLyBhZGp1c3RtZW50cyBjb21lIGZyb20gc2ltaWxhciBjb2RlIGluIHRoZSBqcXVlcnkgb2Zmc2V0KCkgZnVuY3Rpb25cblx0XHRcdHZhciBkID0gdGhpcy5kb21FbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXHRcdFx0dGhpcy5zY3JlZW4ubGVmdCA9IGJveC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0IC0gZC5jbGllbnRMZWZ0O1xuXHRcdFx0dGhpcy5zY3JlZW4udG9wID0gYm94LnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldCAtIGQuY2xpZW50VG9wO1xuXHRcdFx0dGhpcy5zY3JlZW4ud2lkdGggPSBib3gud2lkdGg7XG5cdFx0XHR0aGlzLnNjcmVlbi5oZWlnaHQgPSBib3guaGVpZ2h0O1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHR5cGVvZiB0aGlzWyBldmVudC50eXBlIF0gPT0gJ2Z1bmN0aW9uJyApIHtcblxuXHRcdFx0dGhpc1sgZXZlbnQudHlwZSBdKCBldmVudCApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dmFyIGdldE1vdXNlT25TY3JlZW4gPSAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggcGFnZVgsIHBhZ2VZICkge1xuXG5cdFx0XHR2ZWN0b3Iuc2V0KFxuXHRcdFx0XHQoIHBhZ2VYIC0gX3RoaXMuc2NyZWVuLmxlZnQgKSAvIF90aGlzLnNjcmVlbi53aWR0aCxcblx0XHRcdFx0KCBwYWdlWSAtIF90aGlzLnNjcmVlbi50b3AgKSAvIF90aGlzLnNjcmVlbi5oZWlnaHRcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiB2ZWN0b3I7XG5cblx0XHR9O1xuXG5cdH0oKSApO1xuXG5cdHZhciBnZXRNb3VzZU9uQ2lyY2xlID0gKCBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBhZ2VYLCBwYWdlWSApIHtcblxuXHRcdFx0dmVjdG9yLnNldChcblx0XHRcdFx0KCAoIHBhZ2VYIC0gX3RoaXMuc2NyZWVuLndpZHRoICogMC41IC0gX3RoaXMuc2NyZWVuLmxlZnQgKSAvICggX3RoaXMuc2NyZWVuLndpZHRoICogMC41ICkgKSxcblx0XHRcdFx0KCAoIF90aGlzLnNjcmVlbi5oZWlnaHQgKyAyICogKCBfdGhpcy5zY3JlZW4udG9wIC0gcGFnZVkgKSApIC8gX3RoaXMuc2NyZWVuLndpZHRoICkgLy8gc2NyZWVuLndpZHRoIGludGVudGlvbmFsXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gdmVjdG9yO1xuXHRcdH07XG5cblx0fSgpICk7XG5cblx0dGhpcy5yb3RhdGVDYW1lcmEgPSAoZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgYXhpcyA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRxdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKSxcblx0XHRcdGV5ZURpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRvYmplY3RVcERpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRtb3ZlRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdGFuZ2xlO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0bW92ZURpcmVjdGlvbi5zZXQoIF9tb3ZlQ3Vyci54IC0gX21vdmVQcmV2LngsIF9tb3ZlQ3Vyci55IC0gX21vdmVQcmV2LnksIDAgKTtcblx0XHRcdGFuZ2xlID0gbW92ZURpcmVjdGlvbi5sZW5ndGgoKTtcblxuXHRcdFx0aWYgKCBhbmdsZSApIHtcblxuXHRcdFx0XHRfZXllLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApLnN1YiggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRcdFx0ZXllRGlyZWN0aW9uLmNvcHkoIF9leWUgKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24uY29weSggX3RoaXMub2JqZWN0LnVwICkubm9ybWFsaXplKCk7XG5cdFx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uLmNyb3NzVmVjdG9ycyggb2JqZWN0VXBEaXJlY3Rpb24sIGV5ZURpcmVjdGlvbiApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdG9iamVjdFVwRGlyZWN0aW9uLnNldExlbmd0aCggX21vdmVDdXJyLnkgLSBfbW92ZVByZXYueSApO1xuXHRcdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbi5zZXRMZW5ndGgoIF9tb3ZlQ3Vyci54IC0gX21vdmVQcmV2LnggKTtcblxuXHRcdFx0XHRtb3ZlRGlyZWN0aW9uLmNvcHkoIG9iamVjdFVwRGlyZWN0aW9uLmFkZCggb2JqZWN0U2lkZXdheXNEaXJlY3Rpb24gKSApO1xuXG5cdFx0XHRcdGF4aXMuY3Jvc3NWZWN0b3JzKCBtb3ZlRGlyZWN0aW9uLCBfZXllICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0YW5nbGUgKj0gX3RoaXMucm90YXRlU3BlZWQ7XG5cdFx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSggYXhpcywgYW5nbGUgKTtcblxuXHRcdFx0XHRfZXllLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXHRcdFx0XHRfdGhpcy5vYmplY3QudXAuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cblx0XHRcdFx0X2xhc3RBeGlzLmNvcHkoIGF4aXMgKTtcblx0XHRcdFx0X2xhc3RBbmdsZSA9IGFuZ2xlO1xuXG5cdFx0XHR9XG5cblx0XHRcdGVsc2UgaWYgKCAhX3RoaXMuc3RhdGljTW92aW5nICYmIF9sYXN0QW5nbGUgKSB7XG5cblx0XHRcdFx0X2xhc3RBbmdsZSAqPSBNYXRoLnNxcnQoIDEuMCAtIF90aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yICk7XG5cdFx0XHRcdF9leWUuY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkuc3ViKCBfdGhpcy50YXJnZXQgKTtcblx0XHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBfbGFzdEF4aXMsIF9sYXN0QW5nbGUgKTtcblx0XHRcdFx0X2V5ZS5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblx0XHRcdFx0X3RoaXMub2JqZWN0LnVwLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF9tb3ZlUHJldi5jb3B5KCBfbW92ZUN1cnIgKTtcblxuXHRcdH07XG5cblx0fSgpKTtcblxuXG5cdHRoaXMuem9vbUNhbWVyYSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBmYWN0b3I7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuVE9VQ0hfWk9PTV9QQU4gKSB7XG5cblx0XHRcdGZhY3RvciA9IF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0IC8gX3RvdWNoWm9vbURpc3RhbmNlRW5kO1xuXHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBfdG91Y2hab29tRGlzdGFuY2VFbmQ7XG5cdFx0XHRfZXllLm11bHRpcGx5U2NhbGFyKCBmYWN0b3IgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGZhY3RvciA9IDEuMCArICggX3pvb21FbmQueSAtIF96b29tU3RhcnQueSApICogX3RoaXMuem9vbVNwZWVkO1xuXG5cdFx0XHRpZiAoIGZhY3RvciAhPT0gMS4wICYmIGZhY3RvciA+IDAuMCApIHtcblxuXHRcdFx0XHRfZXllLm11bHRpcGx5U2NhbGFyKCBmYWN0b3IgKTtcblxuXHRcdFx0XHRpZiAoIF90aGlzLnN0YXRpY01vdmluZyApIHtcblxuXHRcdFx0XHRcdF96b29tU3RhcnQuY29weSggX3pvb21FbmQgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0X3pvb21TdGFydC55ICs9ICggX3pvb21FbmQueSAtIF96b29tU3RhcnQueSApICogdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvcjtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMucGFuQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIG1vdXNlQ2hhbmdlID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0XHRcdG9iamVjdFVwID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdHBhbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRtb3VzZUNoYW5nZS5jb3B5KCBfcGFuRW5kICkuc3ViKCBfcGFuU3RhcnQgKTtcblxuXHRcdFx0aWYgKCBtb3VzZUNoYW5nZS5sZW5ndGhTcSgpICkge1xuXG5cdFx0XHRcdG1vdXNlQ2hhbmdlLm11bHRpcGx5U2NhbGFyKCBfZXllLmxlbmd0aCgpICogX3RoaXMucGFuU3BlZWQgKTtcblxuXHRcdFx0XHRwYW4uY29weSggX2V5ZSApLmNyb3NzKCBfdGhpcy5vYmplY3QudXAgKS5zZXRMZW5ndGgoIG1vdXNlQ2hhbmdlLnggKTtcblx0XHRcdFx0cGFuLmFkZCggb2JqZWN0VXAuY29weSggX3RoaXMub2JqZWN0LnVwICkuc2V0TGVuZ3RoKCBtb3VzZUNoYW5nZS55ICkgKTtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkKCBwYW4gKTtcblx0XHRcdFx0X3RoaXMudGFyZ2V0LmFkZCggcGFuICk7XG5cblx0XHRcdFx0aWYgKCBfdGhpcy5zdGF0aWNNb3ZpbmcgKSB7XG5cblx0XHRcdFx0XHRfcGFuU3RhcnQuY29weSggX3BhbkVuZCApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfcGFuU3RhcnQuYWRkKCBtb3VzZUNoYW5nZS5zdWJWZWN0b3JzKCBfcGFuRW5kLCBfcGFuU3RhcnQgKS5tdWx0aXBseVNjYWxhciggX3RoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgKSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH07XG5cblx0fSgpKTtcblxuXHR0aGlzLmNoZWNrRGlzdGFuY2VzID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCAhX3RoaXMubm9ab29tIHx8ICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0aWYgKCBfZXllLmxlbmd0aFNxKCkgPiBfdGhpcy5tYXhEaXN0YW5jZSAqIF90aGlzLm1heERpc3RhbmNlICkge1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUuc2V0TGVuZ3RoKCBfdGhpcy5tYXhEaXN0YW5jZSApICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBfZXllLmxlbmd0aFNxKCkgPCBfdGhpcy5taW5EaXN0YW5jZSAqIF90aGlzLm1pbkRpc3RhbmNlICkge1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUuc2V0TGVuZ3RoKCBfdGhpcy5taW5EaXN0YW5jZSApICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X2V5ZS5zdWJWZWN0b3JzKCBfdGhpcy5vYmplY3QucG9zaXRpb24sIF90aGlzLnRhcmdldCApO1xuXG5cdFx0aWYgKCAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF90aGlzLnJvdGF0ZUNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfdGhpcy56b29tQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRpZiAoICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3RoaXMucGFuQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllICk7XG5cblx0XHRfdGhpcy5jaGVja0Rpc3RhbmNlcygpO1xuXG5cdFx0X3RoaXMub2JqZWN0Lmxvb2tBdCggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRpZiAoIGxhc3RQb3NpdGlvbi5kaXN0YW5jZVRvU3F1YXJlZCggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkgPiBFUFMgKSB7XG5cblx0XHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRcdGxhc3RQb3NpdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXHRcdF9wcmV2U3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0X3RoaXMudGFyZ2V0LmNvcHkoIF90aGlzLnRhcmdldDAgKTtcblx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uY29weSggX3RoaXMucG9zaXRpb24wICk7XG5cdFx0X3RoaXMub2JqZWN0LnVwLmNvcHkoIF90aGlzLnVwMCApO1xuXG5cdFx0X2V5ZS5zdWJWZWN0b3JzKCBfdGhpcy5vYmplY3QucG9zaXRpb24sIF90aGlzLnRhcmdldCApO1xuXG5cdFx0X3RoaXMub2JqZWN0Lmxvb2tBdCggX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0bGFzdFBvc2l0aW9uLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdH07XG5cblx0Ly8gbGlzdGVuZXJzXG5cblx0ZnVuY3Rpb24ga2V5ZG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biApO1xuXG5cdFx0X3ByZXZTdGF0ZSA9IF9zdGF0ZTtcblxuXHRcdGlmICggX3N0YXRlICE9PSBTVEFURS5OT05FICkge1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5ST1RBVEUgXSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlJPVEFURTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlpPT00gXSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5aT09NO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuUEFOIF0gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5QQU47XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGtleXVwKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRfc3RhdGUgPSBfcHJldlN0YXRlO1xuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biwgZmFsc2UgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2Vkb3duKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLk5PTkUgKSB7XG5cblx0XHRcdF9zdGF0ZSA9IGV2ZW50LmJ1dHRvbjtcblxuXHRcdH1cblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5ST1RBVEUgJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlpPT00gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3pvb21TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X3pvb21FbmQuY29weShfem9vbVN0YXJ0KTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUEFOICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3BhblN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfcGFuRW5kLmNvcHkoX3BhblN0YXJ0KTtcblxuXHRcdH1cblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZW1vdmUsIGZhbHNlICk7XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZXVwLCBmYWxzZSApO1xuXG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZW1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5aT09NICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF96b29tRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlBBTiAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2V1cCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlICk7XG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZXVwICk7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2V3aGVlbCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHZhciBkZWx0YSA9IDA7XG5cblx0XHRpZiAoIGV2ZW50LndoZWVsRGVsdGEgKSB7IC8vIFdlYktpdCAvIE9wZXJhIC8gRXhwbG9yZXIgOVxuXG5cdFx0XHRkZWx0YSA9IGV2ZW50LndoZWVsRGVsdGEgLyA0MDtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmRldGFpbCApIHsgLy8gRmlyZWZveFxuXG5cdFx0XHRkZWx0YSA9IC0gZXZlbnQuZGV0YWlsIC8gMztcblxuXHRcdH1cblxuXHRcdF96b29tU3RhcnQueSArPSBkZWx0YSAqIDAuMDE7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoc3RhcnQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLlRPVUNIX1JPVEFURTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuVE9VQ0hfWk9PTV9QQU47XG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSBfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggX3BhblN0YXJ0ICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaG1vdmUoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hlbmQoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCAgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IDA7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIF9wYW5FbmQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHR9XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBmdW5jdGlvbiAoIGV2ZW50ICkgeyBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyB9LCBmYWxzZSApO1xuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgbW91c2Vkb3duLCBmYWxzZSApO1xuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V3aGVlbCcsIG1vdXNld2hlZWwsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NTW91c2VTY3JvbGwnLCBtb3VzZXdoZWVsLCBmYWxzZSApOyAvLyBmaXJlZm94XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgdG91Y2hzdGFydCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIHRvdWNoZW5kLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIHRvdWNobW92ZSwgZmFsc2UgKTtcblxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duLCBmYWxzZSApO1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywga2V5dXAsIGZhbHNlICk7XG5cblx0dGhpcy5oYW5kbGVSZXNpemUoKTtcblxuXHQvLyBmb3JjZSBhbiB1cGRhdGUgYXQgc3RhcnRcblx0dGhpcy51cGRhdGUoKTtcblxufTtcblxuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVEhSRUUuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZSApO1xuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVEhSRUUuVHJhY2tiYWxsQ29udHJvbHM7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRS5UcmFja2JhbGxDb250cm9scztcblxuIiwidmFyIHNxdWFyZSwgemlnLCB6YWcsIGxlZnQsIHJpZ2h0LCB0ZWUsIHRldHJpcywgYWxsLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5zcXVhcmUgPSBzcXVhcmUgPSBbW1swLCAwLCAwXSwgWzAsIDEsIDFdLCBbMCwgMSwgMV1dXTtcbm91dCQuemlnID0gemlnID0gW1tbMCwgMCwgMF0sIFsyLCAyLCAwXSwgWzAsIDIsIDJdXSwgW1swLCAyLCAwXSwgWzIsIDIsIDBdLCBbMiwgMCwgMF1dXTtcbm91dCQuemFnID0gemFnID0gW1tbMCwgMCwgMF0sIFswLCAzLCAzXSwgWzMsIDMsIDBdXSwgW1szLCAwLCAwXSwgWzMsIDMsIDBdLCBbMCwgMywgMF1dXTtcbm91dCQubGVmdCA9IGxlZnQgPSBbW1swLCAwLCAwXSwgWzQsIDQsIDRdLCBbNCwgMCwgMF1dLCBbWzQsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCAwXV0sIFtbMCwgMCwgNF0sIFs0LCA0LCA0XSwgWzAsIDAsIDBdXSwgW1swLCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgNF1dXTtcbm91dCQucmlnaHQgPSByaWdodCA9IFtbWzAsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCA1XV0sIFtbMCwgNSwgMF0sIFswLCA1LCAwXSwgWzUsIDUsIDBdXSwgW1s1LCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgMF1dLCBbWzAsIDUsIDVdLCBbMCwgNSwgMF0sIFswLCA1LCAwXV1dO1xub3V0JC50ZWUgPSB0ZWUgPSBbW1swLCAwLCAwXSwgWzYsIDYsIDZdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgMF0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCA2XSwgWzAsIDAsIDBdXSwgW1swLCA2LCAwXSwgWzAsIDYsIDZdLCBbMCwgNiwgMF1dXTtcbm91dCQudGV0cmlzID0gdGV0cmlzID0gW1tbMCwgMCwgMCwgMF0sIFswLCAwLCAwLCAwXSwgWzcsIDcsIDcsIDddXSwgW1swLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXV1dO1xub3V0JC5hbGwgPSBhbGwgPSBbXG4gIHtcbiAgICB0eXBlOiAnc3F1YXJlJyxcbiAgICBzaGFwZXM6IHNxdWFyZVxuICB9LCB7XG4gICAgdHlwZTogJ3ppZycsXG4gICAgc2hhcGVzOiB6aWdcbiAgfSwge1xuICAgIHR5cGU6ICd6YWcnLFxuICAgIHNoYXBlczogemFnXG4gIH0sIHtcbiAgICB0eXBlOiAnbGVmdCcsXG4gICAgc2hhcGVzOiBsZWZ0XG4gIH0sIHtcbiAgICB0eXBlOiAncmlnaHQnLFxuICAgIHNoYXBlczogcmlnaHRcbiAgfSwge1xuICAgIHR5cGU6ICd0ZWUnLFxuICAgIHNoYXBlczogdGVlXG4gIH0sIHtcbiAgICB0eXBlOiAndGV0cmlzJyxcbiAgICBzaGFwZXM6IHRldHJpc1xuICB9XG5dOyIsInZhciByZWYkLCBpZCwgbG9nLCB3cmFwLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3Jlc3RhcnQnLFxuICAgIHRleHQ6IFwiUmVzdGFydFwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ2dvLWJhY2snLFxuICAgIHRleHQ6IFwiQmFjayB0byBNYWluXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ2FtZXN0YXRlKXtcbiAgcmV0dXJuIGdhbWVzdGF0ZS5mYWlsTWVudVN0YXRlID0ge1xuICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICBjdXJyZW50U3RhdGU6IG1lbnVEYXRhWzBdLFxuICAgIG1lbnVEYXRhOiBtZW51RGF0YVxuICB9O1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24oZm1zLCBpbmRleCl7XG4gIGZtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIGZtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVtmbXMuY3VycmVudEluZGV4XTtcbn07XG5vdXQkLnNlbGVjdFByZXZJdGVtID0gc2VsZWN0UHJldkl0ZW0gPSBmdW5jdGlvbihmbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBmbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKGZtcywgY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24oZm1zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gZm1zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihmbXMsIGN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrU2hhcGVzLCBjYW5Ecm9wLCBjYW5Nb3ZlLCBjYW5Sb3RhdGUsIGNvbGxpZGVzLCBjb3B5QnJpY2tUb0FyZW5hLCB0b3BJc1JlYWNoZWQsIGlzQ29tcGxldGUsIG5ld0JyaWNrLCBzcGF3bk5ld0JyaWNrLCBkcm9wQXJlbmFSb3csIHJlbW92ZVJvd3MsIGNsZWFyQXJlbmEsIGdldFNoYXBlT2ZSb3RhdGlvbiwgbm9ybWFsaXNlUm90YXRpb24sIHJvdGF0ZUJyaWNrLCBjb21wdXRlU2NvcmUsIHJlc2V0U2NvcmUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcbkJyaWNrU2hhcGVzID0gcmVxdWlyZSgnLi9kYXRhL2JyaWNrLXNoYXBlcycpO1xub3V0JC5jYW5Ecm9wID0gY2FuRHJvcCA9IGZ1bmN0aW9uKGJyaWNrLCBhcmVuYSl7XG4gIHJldHVybiBjYW5Nb3ZlKGJyaWNrLCBbMCwgMV0sIGFyZW5hKTtcbn07XG5vdXQkLmNhbk1vdmUgPSBjYW5Nb3ZlID0gZnVuY3Rpb24oYnJpY2ssIG1vdmUsIGFyZW5hKXtcbiAgdmFyIG5ld1BvcztcbiAgbmV3UG9zID0gYWRkVjIoYnJpY2sucG9zLCBtb3ZlKTtcbiAgcmV0dXJuIGNvbGxpZGVzKG5ld1BvcywgYnJpY2suc2hhcGUsIGFyZW5hKTtcbn07XG5vdXQkLmNhblJvdGF0ZSA9IGNhblJvdGF0ZSA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIsIGFyZW5hKXtcbiAgdmFyIG5ld1NoYXBlO1xuICBuZXdTaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24gKyBkaXIpO1xuICByZXR1cm4gY29sbGlkZXMoYnJpY2sucG9zLCBuZXdTaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY29sbGlkZXMgPSBjb2xsaWRlcyA9IGZ1bmN0aW9uKHBvcywgc2hhcGUsIGFyZyQpe1xuICB2YXIgY2VsbHMsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1O1xuICBjZWxscyA9IGFyZyQuY2VsbHMsIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQ7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSA+IDApIHtcbiAgICAgICAgaWYgKHYgPj0gMCkge1xuICAgICAgICAgIGlmICh2ID49IGhlaWdodCB8fCB1ID49IHdpZHRoIHx8IHUgPCAwIHx8IGNlbGxzW3ZdW3VdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5jb3B5QnJpY2tUb0FyZW5hID0gY29weUJyaWNrVG9BcmVuYSA9IGZ1bmN0aW9uKGFyZyQsIGFyZzEkKXtcbiAgdmFyIHBvcywgc2hhcGUsIGNlbGxzLCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgbHJlc3VsdCQsIGokLCByZWYxJCwgbGVuMSQsIHgsIHUsIHJlc3VsdHMkID0gW107XG4gIHBvcyA9IGFyZyQucG9zLCBzaGFwZSA9IGFyZyQuc2hhcGU7XG4gIGNlbGxzID0gYXJnMSQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSAoZm4kKCkpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHkgPSBpJDtcbiAgICB2ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdICYmIHYgPj0gMCkge1xuICAgICAgICBscmVzdWx0JC5wdXNoKGNlbGxzW3ZdW3VdID0gc2hhcGVbeV1beF0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLnRvcElzUmVhY2hlZCA9IHRvcElzUmVhY2hlZCA9IGZ1bmN0aW9uKGFyZyQpe1xuICB2YXIgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCBjZWxsO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBjZWxsc1swXSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcmVmJFtpJF07XG4gICAgaWYgKGNlbGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xub3V0JC5pc0NvbXBsZXRlID0gaXNDb21wbGV0ZSA9IGZ1bmN0aW9uKHJvdyl7XG4gIHZhciBpJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcm93W2kkXTtcbiAgICBpZiAoIWNlbGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xub3V0JC5uZXdCcmljayA9IG5ld0JyaWNrID0gZnVuY3Rpb24oaXgpe1xuICBpeCA9PSBudWxsICYmIChpeCA9IHJhbmRJbnQoMCwgQnJpY2tTaGFwZXMuYWxsLmxlbmd0aCkpO1xuICByZXR1cm4ge1xuICAgIHJvdGF0aW9uOiAwLFxuICAgIHNoYXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnNoYXBlc1swXSxcbiAgICB0eXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnR5cGUsXG4gICAgcG9zOiBbMCwgMF1cbiAgfTtcbn07XG5vdXQkLnNwYXduTmV3QnJpY2sgPSBzcGF3bk5ld0JyaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICBncy5icmljay5jdXJyZW50ID0gZ3MuYnJpY2submV4dDtcbiAgZ3MuYnJpY2suY3VycmVudC5wb3MgPSBbNCwgLTFdO1xuICByZXR1cm4gZ3MuYnJpY2submV4dCA9IG5ld0JyaWNrKCk7XG59O1xub3V0JC5kcm9wQXJlbmFSb3cgPSBkcm9wQXJlbmFSb3cgPSBmdW5jdGlvbihhcmckLCByb3dJeCl7XG4gIHZhciBjZWxscztcbiAgY2VsbHMgPSBhcmckLmNlbGxzO1xuICBjZWxscy5zcGxpY2Uocm93SXgsIDEpO1xuICByZXR1cm4gY2VsbHMudW5zaGlmdChyZXBlYXRBcnJheSQoWzBdLCBjZWxsc1swXS5sZW5ndGgpKTtcbn07XG5vdXQkLnJlbW92ZVJvd3MgPSByZW1vdmVSb3dzID0gZnVuY3Rpb24ocm93cywgYXJlbmEpe1xuICB2YXIgaSQsIGxlbiQsIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3dJeCA9IHJvd3NbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2goZHJvcEFyZW5hUm93KGFyZW5hLCByb3dJeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmNsZWFyQXJlbmEgPSBjbGVhckFyZW5hID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgaSwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgaSA9IGokO1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKHJvd1tpXSA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5nZXRTaGFwZU9mUm90YXRpb24gPSBnZXRTaGFwZU9mUm90YXRpb24gPSBmdW5jdGlvbihicmljaywgcm90YXRpb24pe1xuICByb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCByb3RhdGlvbik7XG4gIHJldHVybiBCcmlja1NoYXBlc1ticmljay50eXBlXVtyb3RhdGlvbl07XG59O1xub3V0JC5ub3JtYWxpc2VSb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uID0gZnVuY3Rpb24oYXJnJCwgcm90YXRpb24pe1xuICB2YXIgdHlwZTtcbiAgdHlwZSA9IGFyZyQudHlwZTtcbiAgcmV0dXJuIHdyYXAoMCwgQnJpY2tTaGFwZXNbdHlwZV0ubGVuZ3RoIC0gMSwgcm90YXRpb24pO1xufTtcbm91dCQucm90YXRlQnJpY2sgPSByb3RhdGVCcmljayA9IGZ1bmN0aW9uKGJyaWNrLCBkaXIpe1xuICB2YXIgcm90YXRpb24sIHR5cGU7XG4gIHJvdGF0aW9uID0gYnJpY2sucm90YXRpb24sIHR5cGUgPSBicmljay50eXBlO1xuICBicmljay5yb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBicmljay5zaGFwZSA9IGdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgYnJpY2sucm90YXRpb24pO1xufTtcbm91dCQuY29tcHV0ZVNjb3JlID0gY29tcHV0ZVNjb3JlID0gZnVuY3Rpb24oc2NvcmUsIHJvd3MsIGx2bCl7XG4gIGx2bCA9PSBudWxsICYmIChsdmwgPSAwKTtcbiAgc3dpdGNoIChyb3dzLmxlbmd0aCkge1xuICBjYXNlIDE6XG4gICAgc2NvcmUuc2luZ2xlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSA0MCAqIChsdmwgKyAxKTtcbiAgICBicmVhaztcbiAgY2FzZSAyOlxuICAgIHNjb3JlLmRvdWJsZXMgKz0gMTtcbiAgICBzY29yZS5wb2ludHMgKz0gMTAwICogKGx2bCArIDEpO1xuICAgIGJyZWFrO1xuICBjYXNlIDM6XG4gICAgc2NvcmUudHJpcGxlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAzMDAgKiAobHZsICsgMSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgNDpcbiAgICBzY29yZS50ZXRyaXMgKz0gMTtcbiAgICBzY29yZS5wb2ludHMgKz0gMTIwMCAqIChsdmwgKyAxKTtcbiAgfVxuICByZXR1cm4gc2NvcmUubGluZXMgKz0gcm93cy5sZW5ndGg7XG59O1xub3V0JC5yZXNldFNjb3JlID0gcmVzZXRTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcbiAgcmV0dXJuIGltcG9ydCQoc2NvcmUsIHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwXG4gIH0pO1xufTtcbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCByYW5kb21Gcm9tLCBDb3JlLCBTdGFydE1lbnUsIEZhaWxNZW51LCBUZXRyaXNHYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kO1xucmFuZG9tRnJvbSA9IHJlcXVpcmUoJ3N0ZCcpLnJhbmRvbUZyb207XG5Db3JlID0gcmVxdWlyZSgnLi9nYW1lLWNvcmUnKTtcblN0YXJ0TWVudSA9IHJlcXVpcmUoJy4vc3RhcnQtbWVudScpO1xuRmFpbE1lbnUgPSByZXF1aXJlKCcuL2ZhaWwtbWVudScpO1xub3V0JC5UZXRyaXNHYW1lID0gVGV0cmlzR2FtZSA9IChmdW5jdGlvbigpe1xuICBUZXRyaXNHYW1lLmRpc3BsYXlOYW1lID0gJ1RldHJpc0dhbWUnO1xuICB2YXIgcHJvdG90eXBlID0gVGV0cmlzR2FtZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGV0cmlzR2FtZTtcbiAgZnVuY3Rpb24gVGV0cmlzR2FtZShnYW1lU3RhdGUpe1xuICAgIGxvZyhcIlRldHJpc0dhbWU6Om5ld1wiKTtcbiAgICBTdGFydE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlKTtcbiAgICBGYWlsTWVudS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUpO1xuICB9XG4gIHByb3RvdHlwZS5iZWdpbk5ld0dhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUpe1xuICAgIChmdW5jdGlvbigpe1xuICAgICAgQ29yZS5jbGVhckFyZW5hKHRoaXMuYXJlbmEpO1xuICAgICAgdGhpcy5icmljay5uZXh0ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5uZXh0LnBvcyA9IFszLCAtMV07XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKCk7XG4gICAgICB0aGlzLmJyaWNrLmN1cnJlbnQucG9zID0gWzMsIC0xXTtcbiAgICAgIENvcmUucmVzZXRTY29yZSh0aGlzLnNjb3JlKTtcbiAgICAgIHRoaXMubWV0YWdhbWVTdGF0ZSA9ICdnYW1lJztcbiAgICAgIHRoaXMudGltZXJzLmRyb3BUaW1lci5yZXNldCgpO1xuICAgICAgdGhpcy50aW1lcnMua2V5UmVwZWF0VGltZXIucmVzZXQoKTtcbiAgICB9LmNhbGwoZ2FtZVN0YXRlKSk7XG4gICAgcmV0dXJuIGdhbWVTdGF0ZTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkdmFuY2VSZW1vdmFsQW5pbWF0aW9uID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnMsIGFuaW1hdGlvblN0YXRlO1xuICAgIHRpbWVycyA9IGdzLnRpbWVycywgYW5pbWF0aW9uU3RhdGUgPSBncy5hbmltYXRpb25TdGF0ZTtcbiAgICBpZiAodGltZXJzLnJlbW92YWxBbmltYXRpb24uZXhwaXJlZCkge1xuICAgICAgQ29yZS5yZW1vdmVSb3dzKGdzLnJvd3NUb1JlbW92ZSwgZ3MuYXJlbmEpO1xuICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gW107XG4gICAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdnYW1lJztcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5oYW5kbGVLZXlJbnB1dCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYnJpY2ssIGFyZW5hLCBpbnB1dFN0YXRlLCBscmVzdWx0JCwgcmVmJCwga2V5LCBhY3Rpb24sIGFtdCwgcmVzJCwgaSQsIHRvJCwgaSwgcG9zLCB5LCBscmVzdWx0MSQsIGokLCB0bzEkLCB4LCByZXN1bHRzJCA9IFtdO1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIHJlZiQgPSBpbnB1dFN0YXRlLnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Nb3ZlKGJyaWNrLmN1cnJlbnQsIFstMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChicmljay5jdXJyZW50LnBvc1swXSAtPSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Nb3ZlKGJyaWNrLmN1cnJlbnQsIFsxLCAwXSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGJyaWNrLmN1cnJlbnQucG9zWzBdICs9IDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChncy5mb3JjZURvd25Nb2RlID0gdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgY2FzZSAnY3cnOlxuICAgICAgICAgIGlmIChDb3JlLmNhblJvdGF0ZShicmljay5jdXJyZW50LCAxLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goQ29yZS5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjY3cnOlxuICAgICAgICAgIGlmIChDb3JlLmNhblJvdGF0ZShicmljay5jdXJyZW50LCAtMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKENvcmUucm90YXRlQnJpY2soYnJpY2suY3VycmVudCwgLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2hhcmQtZHJvcCc6XG4gICAgICAgICAgZ3MuaGFyZERyb3BEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgd2hpbGUgKENvcmUuY2FuRHJvcChicmljay5jdXJyZW50LCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGdzLmhhcmREcm9wRGlzdGFuY2UgKz0gMTtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdzLmlucHV0U3RhdGUgPSBbXTtcbiAgICAgICAgICBncy50aW1lcnMuaGFyZERyb3BFZmZlY3QucmVzZXQoZ3MuaGFyZERyb3BEaXN0YW5jZSAqIDEwKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gLTEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy0xJzpcbiAgICAgICAgY2FzZSAnZGVidWctMic6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTMnOlxuICAgICAgICBjYXNlICdkZWJ1Zy00JzpcbiAgICAgICAgICBhbXQgPSBwYXJzZUludChrZXkucmVwbGFjZSgvXFxEL2csICcnKSk7XG4gICAgICAgICAgbG9nKFwiREVCVUc6IERlc3Ryb3lpbmcgcm93czpcIiwgYW10KTtcbiAgICAgICAgICByZXMkID0gW107XG4gICAgICAgICAgZm9yIChpJCA9IGdzLmFyZW5hLmhlaWdodCAtIGFtdCwgdG8kID0gZ3MuYXJlbmEuaGVpZ2h0IC0gMTsgaSQgPD0gdG8kOyArK2kkKSB7XG4gICAgICAgICAgICBpID0gaSQ7XG4gICAgICAgICAgICByZXMkLnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IHJlcyQ7XG4gICAgICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgICAgIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KDEwICsgTWF0aC5wb3coMywgZ3Mucm93c1RvUmVtb3ZlLmxlbmd0aCkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctNSc6XG4gICAgICAgICAgcG9zID0gZ3MuYnJpY2suY3VycmVudC5wb3M7XG4gICAgICAgICAgZ3MuYnJpY2suY3VycmVudCA9IENvcmUubmV3QnJpY2soNik7XG4gICAgICAgICAgaW1wb3J0JChncy5icmljay5jdXJyZW50LnBvcywgcG9zKTtcbiAgICAgICAgICBmb3IgKGkkID0gYXJlbmEuaGVpZ2h0IC0gMSwgdG8kID0gYXJlbmEuaGVpZ2h0IC0gNDsgaSQgPj0gdG8kOyAtLWkkKSB7XG4gICAgICAgICAgICB5ID0gaSQ7XG4gICAgICAgICAgICBscmVzdWx0MSQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaiQgPSAwLCB0bzEkID0gYXJlbmEud2lkdGggLSAyOyBqJCA8PSB0bzEkOyArK2okKSB7XG4gICAgICAgICAgICAgIHggPSBqJDtcbiAgICAgICAgICAgICAgbHJlc3VsdDEkLnB1c2goYXJlbmEuY2VsbHNbeV1beF0gPSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2gobHJlc3VsdDEkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MuZm9yY2VEb3duTW9kZSA9IGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmNsZWFyT25lRnJhbWVGbGFncyA9IGZ1bmN0aW9uKGdzKXtcbiAgICByZXR1cm4gZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUgPSBmYWxzZTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkdmFuY2VHYW1lID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0U3RhdGUsIGNvbXBsZXRlUm93cywgcmVzJCwgaSQsIHJlZiQsIGxlbiQsIGl4LCByb3c7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGU7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGlmIChDb3JlLmlzQ29tcGxldGUocm93KSkge1xuICAgICAgICByZXMkLnB1c2goaXgpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb21wbGV0ZVJvd3MgPSByZXMkO1xuICAgIGlmIChjb21wbGV0ZVJvd3MubGVuZ3RoKSB7XG4gICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICBncy5mbGFncy5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICBncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5yZXNldChjb21wbGV0ZVJvd3MubGVuZ3RoICogMTAwKTtcbiAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IGNvbXBsZXRlUm93cztcbiAgICAgIENvcmUuY29tcHV0ZVNjb3JlKGdzLnNjb3JlLCBncy5yb3dzVG9SZW1vdmUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoQ29yZS50b3BJc1JlYWNoZWQoYXJlbmEpKSB7XG4gICAgICB0aGlzLnJldmVhbEZhaWxTY3JlZW4oZ3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZ3MuZm9yY2VEb3duTW9kZSkge1xuICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci50aW1lVG9FeHBpcnkgPSAwO1xuICAgIH1cbiAgICBpZiAoZ3MudGltZXJzLmRyb3BUaW1lci5leHBpcmVkKSB7XG4gICAgICBncy50aW1lcnMuZHJvcFRpbWVyLnJlc2V0V2l0aFJlbWFpbmRlcigpO1xuICAgICAgaWYgKENvcmUuY2FuRHJvcChicmljay5jdXJyZW50LCBhcmVuYSkpIHtcbiAgICAgICAgYnJpY2suY3VycmVudC5wb3NbMV0gKz0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIENvcmUuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIENvcmUuc3Bhd25OZXdCcmljayhncyk7XG4gICAgICAgIGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlS2V5SW5wdXQoZ3MpO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd1N0YXJ0U2NyZWVuID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBpbnB1dFN0YXRlLCBzdGFydE1lbnVTdGF0ZSwgcmVmJCwga2V5LCBhY3Rpb24sIHJlc3VsdHMkID0gW107XG4gICAgaW5wdXRTdGF0ZSA9IGdzLmlucHV0U3RhdGUsIHN0YXJ0TWVudVN0YXRlID0gZ3Muc3RhcnRNZW51U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goU3RhcnRNZW51LnNlbGVjdFByZXZJdGVtKHN0YXJ0TWVudVN0YXRlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goU3RhcnRNZW51LnNlbGVjdE5leHRJdGVtKHN0YXJ0TWVudVN0YXRlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgaWYgKHN0YXJ0TWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3N0YXJ0LWdhbWUnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUucmV2ZWFsU3RhcnRTY3JlZW4gPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHRpbWVycztcbiAgICB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgdGltZXJzLnRpdGxlUmV2ZWFsVGltZXIucmVzZXQoKTtcbiAgICByZXR1cm4gZ3MubWV0YWdhbWVTdGF0ZSA9ICdzdGFydC1tZW51JztcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dGYWlsU2NyZWVuID0gZnVuY3Rpb24oZ3MsIM6UdCl7XG4gICAgdmFyIGlucHV0U3RhdGUsIGZhaWxNZW51U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlLCBmYWlsTWVudVN0YXRlID0gZ3MuZmFpbE1lbnVTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dFN0YXRlLnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChGYWlsTWVudS5zZWxlY3RQcmV2SXRlbShmYWlsTWVudVN0YXRlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goRmFpbE1lbnUuc2VsZWN0TmV4dEl0ZW0oZmFpbE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGxvZyhmYWlsTWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSk7XG4gICAgICAgICAgaWYgKGZhaWxNZW51U3RhdGUuY3VycmVudFN0YXRlLnN0YXRlID09PSAncmVzdGFydCcpIHtcbiAgICAgICAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5iZWdpbk5ld0dhbWUoZ3MpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGZhaWxNZW51U3RhdGUuY3VycmVudFN0YXRlLnN0YXRlID09PSAnZ28tYmFjaycpIHtcbiAgICAgICAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5yZXZlYWxTdGFydFNjcmVlbihncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUucmV2ZWFsRmFpbFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy50aW1lcnMuZmFpbHVyZVJldmVhbFRpbWVyLnJlc2V0KCk7XG4gICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZmFpbHVyZSc7XG4gIH07XG4gIHByb3RvdHlwZS5ydW5GcmFtZSA9IGZ1bmN0aW9uKGdhbWVTdGF0ZSwgzpR0KXtcbiAgICB2YXIgbWV0YWdhbWVTdGF0ZTtcbiAgICBtZXRhZ2FtZVN0YXRlID0gZ2FtZVN0YXRlLm1ldGFnYW1lU3RhdGU7XG4gICAgdGhpcy5jbGVhck9uZUZyYW1lRmxhZ3MoZ2FtZVN0YXRlKTtcbiAgICBzd2l0Y2ggKG1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuc2hvd0ZhaWxTY3JlZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5hZHZhbmNlR2FtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLnJldmVhbFN0YXJ0U2NyZWVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMuc2hvd1N0YXJ0U2NyZWVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgdGhpcy5hZHZhbmNlUmVtb3ZhbEFuaW1hdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1Vua25vd24gbWV0YWdhbWUtc3RhdGU6JywgbWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZXRyaXNHYW1lOiBUZXRyaXNHYW1lXG59O1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgd3JhcCwgbWVudURhdGEsIGxpbWl0ZXIsIHByaW1lR2FtZVN0YXRlLCBjaG9vc2VPcHRpb24sIHNlbGVjdFByZXZJdGVtLCBzZWxlY3ROZXh0SXRlbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgd3JhcCA9IHJlZiQud3JhcDtcbm1lbnVEYXRhID0gW1xuICB7XG4gICAgc3RhdGU6ICdzdGFydC1nYW1lJyxcbiAgICB0ZXh0OiBcIlN0YXJ0IEdhbWVcIlxuICB9LCB7XG4gICAgc3RhdGU6ICdub3RoaW5nJyxcbiAgICB0ZXh0OiBcIkRvbid0IFN0YXJ0IEdhbWVcIlxuICB9XG5dO1xubGltaXRlciA9IHdyYXAoMCwgbWVudURhdGEubGVuZ3RoIC0gMSk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihnYW1lc3RhdGUpe1xuICByZXR1cm4gZ2FtZXN0YXRlLnN0YXJ0TWVudVN0YXRlID0ge1xuICAgIGN1cnJlbnRJbmRleDogMCxcbiAgICBjdXJyZW50U3RhdGU6IG1lbnVEYXRhWzBdLFxuICAgIG1lbnVEYXRhOiBtZW51RGF0YVxuICB9O1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24oc21zLCBpbmRleCl7XG4gIHNtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIHNtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVtzbXMuY3VycmVudEluZGV4XTtcbn07XG5vdXQkLnNlbGVjdFByZXZJdGVtID0gc2VsZWN0UHJldkl0ZW0gPSBmdW5jdGlvbihzbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBzbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKHNtcywgY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHJhbmQsIGZsb29yLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBBcmVuYUNlbGxzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5BcmVuYUNlbGxzID0gQXJlbmFDZWxscyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmFDZWxscywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFDZWxscycsIEFyZW5hQ2VsbHMpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmFDZWxscztcbiAgZnVuY3Rpb24gQXJlbmFDZWxscyhvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIHJlZiQsIHJlcyQsIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIGN1YmU7XG4gICAgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemUsIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBBcmVuYUNlbGxzLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aWR0aCA9IGdyaWRTaXplICogZ3MuYXJlbmEud2lkdGg7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5nZW9tLmJveCA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIGJsb2NrU2l6ZSwgYmxvY2tTaXplKTtcbiAgICB0aGlzLm1hdHMuemFwID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IDB4ZmZmZmZmLFxuICAgICAgZW1pc3NpdmU6IDB4OTk5OTk5XG4gICAgfSk7XG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMub2Zmc2V0KTtcbiAgICByZWYkID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb247XG4gICAgcmVmJC54ID0gd2lkdGggLyAtMiArIDAuNSAqIGdyaWRTaXplO1xuICAgIHJlZiQueSA9IGhlaWdodCAtIDAuNSAqIGdyaWRTaXplO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBwaTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGdzLmFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2godGhpcy5nZW9tLmJveCwgdGhpcy5tYXRzLm5vcm1hbCk7XG4gICAgICAgIGN1YmUucG9zaXRpb24uc2V0KHggKiBncmlkU2l6ZSwgeSAqIGdyaWRTaXplLCAwKTtcbiAgICAgICAgY3ViZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub2Zmc2V0LmFkZChjdWJlKTtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdWJlKTtcbiAgICAgIH1cbiAgICAgIHJlcyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHRoaXMuY2VsbHMgPSByZXMkO1xuICB9XG4gIHByb3RvdHlwZS50b2dnbGVSb3dPZkNlbGxzID0gZnVuY3Rpb24ocm93SXgsIHN0YXRlKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGJveCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5jZWxsc1tyb3dJeF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBib3ggPSByZWYkW2kkXTtcbiAgICAgIGJveC5tYXRlcmlhbCA9IHRoaXMubWF0cy56YXA7XG4gICAgICByZXN1bHRzJC5wdXNoKGJveC52aXNpYmxlID0gc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93WmFwRWZmZWN0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBhcmVuYSwgcm93c1RvUmVtb3ZlLCB0aW1lcnMsIG9uT2ZmLCBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlLCB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgb25PZmYgPSAhIShmbG9vcih0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5jdXJyZW50VGltZSkgJSAyKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93SXggPSByb3dzVG9SZW1vdmVbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnRvZ2dsZVJvd09mQ2VsbHMocm93SXgsIG9uT2ZmKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZUNlbGxzID0gZnVuY3Rpb24oY2VsbHMpe1xuICAgIHZhciBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gY2VsbHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IGNlbGxzW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIHRoaXMuY2VsbHNbeV1beF0udmlzaWJsZSA9ICEhY2VsbDtcbiAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmNlbGxzW3ldW3hdLm1hdGVyaWFsID0gbWVzaE1hdGVyaWFsc1tjZWxsXSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gQXJlbmFDZWxscztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgcmFuZCwgQmFzZSwgRnJhbWUsIEJyaWNrLCBHdWlkZUxpbmVzLCBBcmVuYUNlbGxzLCBQYXJ0aWNsZUVmZmVjdCwgQXJlbmEsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIG1heCA9IHJlZiQubWF4LCByYW5kID0gcmVmJC5yYW5kO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5GcmFtZSA9IHJlcXVpcmUoJy4vZnJhbWUnKS5GcmFtZTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrO1xuR3VpZGVMaW5lcyA9IHJlcXVpcmUoJy4vZ3VpZGUtbGluZXMnKS5HdWlkZUxpbmVzO1xuQXJlbmFDZWxscyA9IHJlcXVpcmUoJy4vYXJlbmEtY2VsbHMnKS5BcmVuYUNlbGxzO1xuUGFydGljbGVFZmZlY3QgPSByZXF1aXJlKCcuL3BhcnRpY2xlLWVmZmVjdCcpLlBhcnRpY2xlRWZmZWN0O1xub3V0JC5BcmVuYSA9IEFyZW5hID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmEnLCBBcmVuYSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYTtcbiAgZnVuY3Rpb24gQXJlbmEob3B0cywgZ3Mpe1xuICAgIHZhciBuYW1lLCByZWYkLCBwYXJ0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQXJlbmEuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGxvZygnUmVuZGVyZXI6OkFyZW5hOjpuZXcnKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMFxuICAgIH07XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIGZyYW1lOiBuZXcgRnJhbWUodGhpcy5vcHRzLCBncyksXG4gICAgICBndWlkZUxpbmVzOiBuZXcgR3VpZGVMaW5lcyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hQ2VsbHM6IG5ldyBBcmVuYUNlbGxzKHRoaXMub3B0cywgZ3MpLFxuICAgICAgdGhpc0JyaWNrOiBuZXcgQnJpY2sodGhpcy5vcHRzLCBncyksXG4gICAgICBwYXJ0aWNsZXM6IG5ldyBQYXJ0aWNsZUVmZmVjdCh0aGlzLm9wdHMsIGdzKVxuICAgIH07XG4gICAgZm9yIChuYW1lIGluIHJlZiQgPSB0aGlzLnBhcnRzKSB7XG4gICAgICBwYXJ0ID0gcmVmJFtuYW1lXTtcbiAgICAgIHBhcnQuYWRkVG8odGhpcy5yZWdpc3RyYXRpb24pO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gLTEgKiAodGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmJsb2NrU2l6ZSAvIDIpO1xuICB9XG4gIHByb3RvdHlwZS5qb2x0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzVG9SZW1vdmUsIHRpbWVycywgcCwgenosIGpvbHQ7XG4gICAgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlLCB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgcCA9IHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmFjdGl2ZVxuICAgICAgPyAxIC0gdGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3NcbiAgICAgIDogdGltZXJzLmhhcmREcm9wRWZmZWN0LnByb2dyZXNzID8gbWF4KDEgLSB0aW1lcnMuaGFyZERyb3BFZmZlY3QucHJvZ3Jlc3MpIDogMDtcbiAgICB6eiA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgcmV0dXJuIGpvbHQgPSAtMSAqIHAgKiAoMSArIHp6KSAqIHRoaXMub3B0cy5oYXJkRHJvcEpvbHRBbW91bnQ7XG4gIH07XG4gIHByb3RvdHlwZS5qaXR0ZXIgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHJvd3NUb1JlbW92ZSwgcCwgenosIGppdHRlcjtcbiAgICByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmU7XG4gICAgcCA9IDEgLSBncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcztcbiAgICB6eiA9IHJvd3NUb1JlbW92ZS5sZW5ndGggKiB0aGlzLm9wdHMuZ3JpZFNpemUgLyA0MDtcbiAgICByZXR1cm4gaml0dGVyID0gW3AgKiByYW5kKC16eiwgenopLCBwICogcmFuZCgtenosIHp6KV07XG4gIH07XG4gIHByb3RvdHlwZS56YXBMaW5lcyA9IGZ1bmN0aW9uKGdzLCBwb3NpdGlvblJlY2VpdmluZ0pvbHQpe1xuICAgIHZhciBhcmVuYSwgcm93c1RvUmVtb3ZlLCB0aW1lcnMsIGpvbHQsIGppdHRlcjtcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmUsIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMuc2hvd1phcEVmZmVjdChncyk7XG4gICAgaWYgKGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lKSB7XG4gICAgICB0aGlzLnBhcnRzLnBhcnRpY2xlcy5yZXNldCgpO1xuICAgICAgdGhpcy5wYXJ0cy5wYXJ0aWNsZXMucHJlcGFyZShyb3dzVG9SZW1vdmUpO1xuICAgICAgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkID0gMDtcbiAgICB9XG4gICAgam9sdCA9IHRoaXMuam9sdChncyk7XG4gICAgaml0dGVyID0gdGhpcy5qaXR0ZXIoZ3MpO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC54ID0gaml0dGVyWzBdO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC55ID0gaml0dGVyWzFdO1xuICAgIHJldHVybiB0aGlzLnBhcnRzLmd1aWRlTGluZXMuZGFuY2UoZ3MuZWxhcHNlZFRpbWUpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUGFydGljbGVzID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnM7XG4gICAgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHJldHVybiB0aGlzLnBhcnRzLnBhcnRpY2xlcy51cGRhdGUodGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3MsIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCwgZ3MuzpR0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzLCBwb3NpdGlvblJlY2VpdmluZ0pvbHQpe1xuICAgIHZhciBhcmVuYSwgYnJpY2s7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgYnJpY2sgPSBncy5icmljaztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMudXBkYXRlQ2VsbHMoYXJlbmEuY2VsbHMpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLmRpc3BsYXlTaGFwZShicmljay5jdXJyZW50KTtcbiAgICB0aGlzLnBhcnRzLnRoaXNCcmljay51cGRhdGVQb3MoYnJpY2suY3VycmVudC5wb3MpO1xuICAgIHRoaXMucGFydHMuZ3VpZGVMaW5lcy5zaG93QmVhbShicmljay5jdXJyZW50KTtcbiAgICBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IHRoaXMuam9sdChncyk7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCArPSAxO1xuICB9O1xuICByZXR1cm4gQXJlbmE7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xub3V0JC5CYXNlID0gQmFzZSA9IChmdW5jdGlvbigpe1xuICBCYXNlLmRpc3BsYXlOYW1lID0gJ0Jhc2UnO1xuICB2YXIgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyT3BhY2l0eSwgaGVscGVyTWFya2VyR2VvLCByZWRIZWxwZXJNYXQsIGJsdWVIZWxwZXJNYXQsIHByb3RvdHlwZSA9IEJhc2UucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJhc2U7XG4gIGhlbHBlck1hcmtlclNpemUgPSAwLjAyO1xuICBoZWxwZXJNYXJrZXJPcGFjaXR5ID0gMC41O1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUpO1xuICByZWRIZWxwZXJNYXQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweGZmMDAwMCxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiBoZWxwZXJNYXJrZXJPcGFjaXR5XG4gIH0pO1xuICBibHVlSGVscGVyTWF0ID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgwMGZmMDAsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogaGVscGVyTWFya2VyT3BhY2l0eVxuICB9KTtcbiAgZnVuY3Rpb24gQmFzZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yb290LmFkZCh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgdGhpcy5nZW9tID0ge307XG4gICAgdGhpcy5tYXRzID0ge1xuICAgICAgbm9ybWFsOiBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5hZGRSZWdpc3RyYXRpb25IZWxwZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzdGFydCwgZW5kLCBkaXIsIGFycm93O1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCByZWRIZWxwZXJNYXQpKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBibHVlSGVscGVyTWF0KSk7XG4gICAgc3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcbiAgICBlbmQgPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbjtcbiAgICBkaXIgPSBuZXcgVEhSRUUuVmVjdG9yMygpLnN1YlZlY3RvcnMoZW5kLCBzdGFydCkubm9ybWFsaXplKCk7XG4gICAgYXJyb3cgPSBuZXcgVEhSRUUuQXJyb3dIZWxwZXIoZGlyLCBzdGFydCwgc3RhcnQuZGlzdGFuY2VUbyhlbmQsIDB4MDAwMGZmKSk7XG4gICAgdGhpcy5yb290LmFkZChhcnJvdyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gY29uc29sZS5kZWJ1ZygnQ0hBTkdFJywgdGhpcywgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbG9nKCdSZWdpc3RyYXRpb24gaGVscGVyIGZvcjonLCB0aGlzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZEJveEhlbHBlciA9IGZ1bmN0aW9uKHRoaW5nKXtcbiAgICB2YXIgYmJveDtcbiAgICBiYm94ID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaW5nLCAweDU1NTVmZik7XG4gICAgYmJveC51cGRhdGUoKTtcbiAgICByZXR1cm4gdGhpcy5yb290LmFkZChiYm94KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVJlZ2lzdHJhdGlvbkhlbHBlciA9IGZ1bmN0aW9uKCl7fTtcbiAgcHJvdG90eXBlLnNob3dCb3VuZHMgPSBmdW5jdGlvbihzY2VuZSl7XG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpcy5yb290LCAweDU1NTU1NSk7XG4gICAgdGhpcy5ib3VuZHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIHNjZW5lLmFkZCh0aGlzLmJvdW5kcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hZGRUbyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIG9iai5hZGQodGhpcy5yb290KTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Bvc2l0aW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJvb3QucG9zaXRpb247XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Zpc2libGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC52aXNpYmxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihzdGF0ZSl7XG4gICAgICB0aGlzLnJvb3QudmlzaWJsZSA9IHN0YXRlO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBCYXNlO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBCYXNlLCBCcmljaywgQnJpY2tQcmV2aWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2s7XG5vdXQkLkJyaWNrUHJldmlldyA9IEJyaWNrUHJldmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByZXR0eU9mZnNldCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmlja1ByZXZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrUHJldmlldycsIEJyaWNrUHJldmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmlja1ByZXZpZXc7XG4gIHByZXR0eU9mZnNldCA9IHtcbiAgICBzcXVhcmU6IFswLCAwXSxcbiAgICB6aWc6IFswLjUsIDBdLFxuICAgIHphZzogWzAuNSwgMF0sXG4gICAgbGVmdDogWzAuNSwgMF0sXG4gICAgcmlnaHQ6IFswLjUsIDBdLFxuICAgIHRlZTogWzAuNSwgMF0sXG4gICAgdGV0cmlzOiBbMCwgMC41XVxuICB9O1xuICBmdW5jdGlvbiBCcmlja1ByZXZpZXcob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQnJpY2tQcmV2aWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBncmlkLCByZWYkLCB4LCB5O1xuICAgIHN1cGVyY2xhc3MucHJvdG90eXBlLmRpc3BsYXlTaGFwZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgcmVmJCA9IHByZXR0eU9mZnNldFticmljay50eXBlXSwgeCA9IHJlZiRbMF0sIHkgPSByZWYkWzFdO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSAoLTEuNSArIHgpICogZ3JpZDtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9ICgtMS41ICsgeSArIDUpICogZ3JpZDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVdpZ2dsZSA9IGZ1bmN0aW9uKGJyaWNrLCBlbGFwc2VkVGltZSl7XG4gICAgcmV0dXJuIHRoaXMucm9vdC5yb3RhdGlvbi55ID0gMC4yICogc2luKGVsYXBzZWRUaW1lIC8gNTAwKTtcbiAgfTtcbiAgcmV0dXJuIEJyaWNrUHJldmlldztcbn0oQnJpY2spKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgQmFzZSwgbWVzaE1hdGVyaWFscywgQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5CcmljayA9IEJyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJldHR5T2Zmc2V0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmljaycsIEJyaWNrKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrO1xuICBwcmV0dHlPZmZzZXQgPSB7XG4gICAgc3F1YXJlOiBbMCwgMF0sXG4gICAgemlnOiBbMC41LCAwXSxcbiAgICB6YWc6IFswLjUsIDBdLFxuICAgIGxlZnQ6IFswLjUsIDBdLFxuICAgIHJpZ2h0OiBbMC41LCAwXSxcbiAgICB0ZWU6IFswLjUsIDBdLFxuICAgIHRldHJpczogWzAsIC0wLjVdXG4gIH07XG4gIGZ1bmN0aW9uIEJyaWNrKG9wdHMsIGdzKXtcbiAgICB2YXIgc2l6ZSwgZ3JpZCwgd2lkdGgsIGhlaWdodCwgcmVzJCwgaSQsIGksIGN1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmljay5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgc2l6ZSA9IHRoaXMub3B0cy5ibG9ja1NpemU7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICB3aWR0aCA9IGdyaWQgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuZ2VvbS5icmlja0JveCA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkLCBoZWlnaHQgLSAwLjUgKiBncmlkLCAwKTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJyaWNrKTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDM7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIGN1YmUgPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb20uYnJpY2tCb3gsIHRoaXMubWF0cy5ub3JtYWwpO1xuICAgICAgdGhpcy5icmljay5hZGQoY3ViZSk7XG4gICAgICBjdWJlLmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgICAgcmVzJC5wdXNoKGN1YmUpO1xuICAgIH1cbiAgICB0aGlzLmNlbGxzID0gcmVzJDtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYXJnJCwgaXgpe1xuICAgIHZhciBzaGFwZSwgZ3JpZCwgbWFyZ2luLCBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCB4JCwgcmVzdWx0cyQgPSBbXTtcbiAgICBzaGFwZSA9IGFyZyQuc2hhcGU7XG4gICAgaXggPT0gbnVsbCAmJiAoaXggPSAwKTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIG1hcmdpbiA9ICh0aGlzLm9wdHMuZ3JpZFNpemUgLSB0aGlzLm9wdHMuYmxvY2tTaXplKSAvIDI7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBzaGFwZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gc2hhcGVbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICB4JCA9IHRoaXMuY2VsbHNbaXhdO1xuICAgICAgICAgIHgkLm1hdGVyaWFsID0gbWVzaE1hdGVyaWFsc1tjZWxsXTtcbiAgICAgICAgICB4JC5wb3NpdGlvbi5zZXQoeCAqIGdyaWQgKyBtYXJnaW4sIHkgKiBncmlkICsgbWFyZ2luLCAwKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGl4ICs9IDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUG9zID0gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHgsIHksIGdyaWQ7XG4gICAgeCA9IGFyZyRbMF0sIHkgPSBhcmckWzFdO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2sucG9zaXRpb24uc2V0KGdyaWQgKiB4LCBncmlkICogeSwgMCk7XG4gIH07XG4gIHJldHVybiBCcmljaztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgQmFzZSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWF4ID0gcmVmJC5tYXg7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuRmFpbFNjcmVlbiA9IEZhaWxTY3JlZW4gPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZhaWxTY3JlZW4sIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZhaWxTY3JlZW4nLCBGYWlsU2NyZWVuKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZhaWxTY3JlZW47XG4gIGZ1bmN0aW9uIEZhaWxTY3JlZW4ob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRmFpbFNjcmVlbi5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgbG9nKFwiRmFpbFNjcmVlbjo6bmV3XCIpO1xuICB9XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7fTtcbiAgcmV0dXJuIEZhaWxTY3JlZW47XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBGcmFtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5GcmFtZSA9IEZyYW1lID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGcmFtZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRnJhbWUnLCBGcmFtZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZTtcbiAgZnVuY3Rpb24gRnJhbWUob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRnJhbWUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHJldHVybiBGcmFtZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZsb29yLCBCYXNlLCBsaW5lTWF0ZXJpYWxzLCByb3dzVG9Db2xzLCBHdWlkZUxpbmVzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbmxpbmVNYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9wYWxldHRlJykubGluZU1hdGVyaWFscztcbnJvd3NUb0NvbHMgPSBmdW5jdGlvbihyb3dzKXtcbiAgdmFyIGNvbHMsIGkkLCB0byQsIHksIGokLCB0bzEkLCB4O1xuICBjb2xzID0gW107XG4gIGZvciAoaSQgPSAwLCB0byQgPSByb3dzWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgZm9yIChqJCA9IDAsIHRvMSQgPSByb3dzLmxlbmd0aDsgaiQgPCB0bzEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICAoY29sc1t5XSB8fCAoY29sc1t5XSA9IFtdKSlbeF0gPSByb3dzW3hdW3ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY29scztcbn07XG5vdXQkLkd1aWRlTGluZXMgPSBHdWlkZUxpbmVzID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChHdWlkZUxpbmVzLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdHdWlkZUxpbmVzJywgR3VpZGVMaW5lcyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHdWlkZUxpbmVzO1xuICBmdW5jdGlvbiBHdWlkZUxpbmVzKG9wdHMsIGdzKXtcbiAgICB2YXIgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIG1lc2gsIGkkLCBpLCBsaW5lLCByZWYkO1xuICAgIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBHdWlkZUxpbmVzLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aWR0aCA9IGdyaWRTaXplICogZ3MuYXJlbmEud2lkdGg7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5saW5lcyA9IFtdO1xuICAgIG1lc2ggPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICBtZXNoLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksIG5ldyBUSFJFRS5WZWN0b3IzKDAsIGhlaWdodCwgMCkpO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSA5OyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBsaW5lID0gbmV3IFRIUkVFLkxpbmUobWVzaCwgbGluZU1hdGVyaWFsc1tpXSk7XG4gICAgICByZWYkID0gbGluZS5wb3NpdGlvbjtcbiAgICAgIHJlZiQueCA9IGkgKiBncmlkU2l6ZTtcbiAgICAgIHJlZiQueSA9IDA7XG4gICAgICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobGluZSk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSB3aWR0aCAvIC0yICsgMC41ICogZ3JpZFNpemU7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dCZWFtID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgbGluZSwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLmxpbmVzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgbGluZSA9IHJlZiRbaSRdO1xuICAgICAgbGluZS5tYXRlcmlhbCA9IGxpbmVNYXRlcmlhbHNbMF07XG4gICAgfVxuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMubGluZXNbYnJpY2sucG9zWzBdICsgeF0ubWF0ZXJpYWwgPSBsaW5lTWF0ZXJpYWxzW2NlbGxdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmRhbmNlID0gZnVuY3Rpb24odGltZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpLCBsaW5lLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLmxpbmVzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgbGluZSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChsaW5lLm1hdGVyaWFsID0gbGluZU1hdGVyaWFsc1soaSArIGZsb29yKHRpbWUgLyAxMDApKSAlIDhdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gR3VpZGVMaW5lcztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIEFyZW5hLCBUaXRsZSwgVGFibGUsIEJyaWNrUHJldmlldywgTGlnaHRpbmcsIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2FyZW5hJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGl0bGUnKSwgVGl0bGUgPSByZWYkLlRpdGxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi90YWJsZScpLCBUYWJsZSA9IHJlZiQuVGFibGUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2JyaWNrLXByZXZpZXcnKSwgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2xpZ2h0aW5nJyksIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vc3RhcnQtbWVudScpLCBTdGFydE1lbnUgPSByZWYkLlN0YXJ0TWVudSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vZmFpbC1zY3JlZW4nKSwgRmFpbFNjcmVlbiA9IHJlZiQuRmFpbFNjcmVlbiwgcmVmJCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIEJhc2UsIExpZ2h0aW5nLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGk7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuTGlnaHRpbmcgPSBMaWdodGluZyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIG1haW5MaWdodERpc3RhbmNlLCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKExpZ2h0aW5nLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdMaWdodGluZycsIExpZ2h0aW5nKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IExpZ2h0aW5nO1xuICBtYWluTGlnaHREaXN0YW5jZSA9IDI7XG4gIGZ1bmN0aW9uIExpZ2h0aW5nKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIExpZ2h0aW5nLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIDEsIG1haW5MaWdodERpc3RhbmNlKTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAwKTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMubGlnaHQpO1xuICAgIHRoaXMuc3BvdGxpZ2h0ID0gbmV3IFRIUkVFLlNwb3RMaWdodCgweGZmZmZmZiwgMSwgNTAsIDEpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnBvc2l0aW9uLnNldCgwLCAzLCAtMSk7XG4gICAgdGhpcy5zcG90bGlnaHQudGFyZ2V0LnBvc2l0aW9uLnNldCgwLCAwLCAtMSk7XG4gICAgdGhpcy5yb290LmFkZCh0aGlzLnNwb3RsaWdodCk7XG4gICAgdGhpcy5hbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDMzMzMzMyk7XG4gICAgdGhpcy5yb290LmFkZCh0aGlzLmFtYmllbnQpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0RhcmtuZXNzID0gMC41O1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0JpYXMgPSAwLjAwMDE7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwV2lkdGggPSAxMDI0O1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd01hcEhlaWdodCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhTmVhciA9IDEwO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0NhbWVyYUZhciA9IDI1MDA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRm92ID0gNTA7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dIZWxwZXJzID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5Qb2ludExpZ2h0SGVscGVyKHRoaXMubGlnaHQsIG1haW5MaWdodERpc3RhbmNlKSk7XG4gICAgcmV0dXJuIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLlNwb3RMaWdodEhlbHBlcih0aGlzLnNwb3RsaWdodCkpO1xuICB9O1xuICByZXR1cm4gTGlnaHRpbmc7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIHJhbmQsIGZsb29yLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBQYXJ0aWNsZUJ1cnN0LCBQYXJ0aWNsZUVmZmVjdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5QYXJ0aWNsZUJ1cnN0ID0gUGFydGljbGVCdXJzdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHNwZWVkLCBsaWZlc3BhbiwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChQYXJ0aWNsZUJ1cnN0LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdQYXJ0aWNsZUJ1cnN0JywgUGFydGljbGVCdXJzdCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQYXJ0aWNsZUJ1cnN0O1xuICBzcGVlZCA9IDI7XG4gIGxpZmVzcGFuID0gMjAwMDtcbiAgZnVuY3Rpb24gUGFydGljbGVCdXJzdChvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBwYXJ0aWNsZXMsIGdlb21ldHJ5LCBjb2xvciwgbWF0ZXJpYWw7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVCdXJzdC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zaXplID0gdGhpcy5vcHRzLnphcFBhcnRpY2xlU2l6ZTtcbiAgICBwYXJ0aWNsZXMgPSA4MDA7XG4gICAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgICBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuICAgIHRoaXMucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLnZlbG9jaXRpZXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMuY29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLmxpZmVzcGFucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLmFscGhhcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLm1heGxpZmVzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMucG9zQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5wb3NpdGlvbnMsIDMpO1xuICAgIHRoaXMuY29sQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5jb2xvcnMsIDMpO1xuICAgIHRoaXMuYWxwaGFBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLmFscGhhcywgMSk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgncG9zaXRpb24nLCB0aGlzLnBvc0F0dHIpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnY29sb3InLCB0aGlzLmNvbEF0dHIpO1xuICAgIGdlb21ldHJ5LmFkZEF0dHJpYnV0ZSgnYWxwaGEnLCB0aGlzLmFscGhhQXR0cik7XG4gICAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZE1hdGVyaWFsKHtcbiAgICAgIHNpemU6IHRoaXMuc2l6ZSxcbiAgICAgIHZlcnRleENvbG9yczogVEhSRUUuVmVydGV4Q29sb3JzXG4gICAgfSk7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuUG9pbnRDbG91ZChnZW9tZXRyeSwgbWF0ZXJpYWwpKTtcbiAgfVxuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBncmlkLCBpJCwgdG8kLCBpLCB4LCB6LCByZXN1bHRzJCA9IFtdO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHggPSA0LjUgLSBNYXRoLnJhbmRvbSgpICogOTtcbiAgICAgIHogPSAwLjUgLSBNYXRoLnJhbmRvbSgpO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDBdID0geCAqIGdyaWQ7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAwO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDJdID0geiAqIGdyaWQ7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDBdID0geCAvIDEwO1xuICAgICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAxXSA9IHJhbmQoZ3JpZCwgMTAgKiBncmlkKTtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB6O1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDBdID0gMTtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAxXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSAxO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPSAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuYWNjZWxlcmF0ZVBhcnRpY2xlID0gZnVuY3Rpb24oaSwgdCwgcCwgYmJ4LCBiYnope1xuICAgIHZhciBhY2MsIHB4LCBweSwgcHosIHZ4LCB2eSwgdnosIHB4MSwgcHkxLCBwejEsIHZ4MSwgdnkxLCB2ejEsIGw7XG4gICAgaWYgKHRoaXMubGlmZXNwYW5zW2kgLyAzXSA8PSAwKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAtMTAwMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdCA9IHQgLyAoMTAwMCAvIHNwZWVkKTtcbiAgICBhY2MgPSAtMC45ODtcbiAgICBweCA9IHRoaXMucG9zaXRpb25zW2kgKyAwXTtcbiAgICBweSA9IHRoaXMucG9zaXRpb25zW2kgKyAxXTtcbiAgICBweiA9IHRoaXMucG9zaXRpb25zW2kgKyAyXTtcbiAgICB2eCA9IHRoaXMudmVsb2NpdGllc1tpICsgMF07XG4gICAgdnkgPSB0aGlzLnZlbG9jaXRpZXNbaSArIDFdO1xuICAgIHZ6ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAyXTtcbiAgICBweDEgPSBweCArIDAuNSAqIDAgKiB0ICogdCArIHZ4ICogdDtcbiAgICBweTEgPSBweSArIDAuNSAqIGFjYyAqIHQgKiB0ICsgdnkgKiB0O1xuICAgIHB6MSA9IHB6ICsgMC41ICogMCAqIHQgKiB0ICsgdnogKiB0O1xuICAgIHZ4MSA9IDAgKiB0ICsgdng7XG4gICAgdnkxID0gYWNjICogdCArIHZ5O1xuICAgIHZ6MSA9IDAgKiB0ICsgdno7XG4gICAgaWYgKHB5MSA8IHRoaXMuc2l6ZSAvIDIgJiYgKC1iYnggPCBweDEgJiYgcHgxIDwgYmJ4KSAmJiAoLWJieiArIDEuOSAqIHRoaXMub3B0cy5ncmlkU2l6ZSA8IHB6MSAmJiBwejEgPCBiYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUpKSB7XG4gICAgICBweTEgPSB0aGlzLnNpemUgLyAyO1xuICAgICAgdngxICo9IDAuNztcbiAgICAgIHZ5MSAqPSAtMC42O1xuICAgICAgdnoxICo9IDAuNztcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDBdID0gcHgxO1xuICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IHB5MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSBwejE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAwXSA9IHZ4MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gdnkxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB2ejE7XG4gICAgbCA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXSAvIHRoaXMubWF4bGlmZXNbaSAvIDNdO1xuICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDFdID0gbCAqIGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDJdID0gbCAqIGwgKiBsICogbDtcbiAgICByZXR1cm4gdGhpcy5hbHBoYXNbaSAvIDNdID0gbDtcbiAgfTtcbiAgcHJvdG90eXBlLnNldEhlaWdodCA9IGZ1bmN0aW9uKHkpe1xuICAgIHZhciBncmlkLCBpJCwgdG8kLCBpLCByZXN1bHRzJCA9IFtdO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0aGlzLmxpZmVzcGFuc1tpIC8gM10gPSBsaWZlc3BhbiAvIDIgKyBNYXRoLnJhbmRvbSgpICogbGlmZXNwYW4gLyAyO1xuICAgICAgdGhpcy5tYXhsaWZlc1tpIC8gM10gPSB0aGlzLmxpZmVzcGFuc1tpIC8gM107XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucG9zaXRpb25zW2kgKyAxXSA9ICh5ICsgTWF0aC5yYW5kb20oKSAtIDAuNSkgKiBncmlkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocCwgzpR0KXtcbiAgICB2YXIgYm91bmNlQm91bmRzWCwgYm91bmNlQm91bmRzWiwgaSQsIHRvJCwgaTtcbiAgICBib3VuY2VCb3VuZHNYID0gdGhpcy5vcHRzLmRlc2tTaXplWzBdIC8gMjtcbiAgICBib3VuY2VCb3VuZHNaID0gdGhpcy5vcHRzLmRlc2tTaXplWzFdIC8gMjtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgdGhpcy5hY2NlbGVyYXRlUGFydGljbGUoaSwgzpR0LCAxLCBib3VuY2VCb3VuZHNYLCBib3VuY2VCb3VuZHNaKTtcbiAgICAgIHRoaXMubGlmZXNwYW5zW2kgLyAzXSAtPSDOlHQ7XG4gICAgfVxuICAgIHRoaXMucG9zQXR0ci5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuY29sQXR0ci5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH07XG4gIHJldHVybiBQYXJ0aWNsZUJ1cnN0O1xufShCYXNlKSk7XG5vdXQkLlBhcnRpY2xlRWZmZWN0ID0gUGFydGljbGVFZmZlY3QgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFBhcnRpY2xlRWZmZWN0LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdQYXJ0aWNsZUVmZmVjdCcsIFBhcnRpY2xlRWZmZWN0KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFBhcnRpY2xlRWZmZWN0O1xuICBmdW5jdGlvbiBQYXJ0aWNsZUVmZmVjdChvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBpJCwgcmVmJCwgbGVuJCwgcm93O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIFBhcnRpY2xlRWZmZWN0LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnogPSB0aGlzLm9wdHMuejtcbiAgICB0aGlzLmggPSBoZWlnaHQ7XG4gICAgdGhpcy5yb3dzID0gW1xuICAgICAgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSlcbiAgICBdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIHJvdy5hZGRUbyh0aGlzLnJvb3QpO1xuICAgIH1cbiAgfVxuICBwcm90b3R5cGUucHJlcGFyZSA9IGZ1bmN0aW9uKHJvd3Mpe1xuICAgIHZhciBpJCwgbGVuJCwgaSwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3dzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICByb3dJeCA9IHJvd3NbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJvd3NbaV0uc2V0SGVpZ2h0KCh0aGlzLmggLSAxKSAtIHJvd0l4KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHN5c3RlbSwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgc3lzdGVtID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHN5c3RlbS5yZXNldCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocCwgZnNyciwgzpR0KXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBzeXN0ZW0sIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBzeXN0ZW0gPSByZWYkW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2goc3lzdGVtLnVwZGF0ZShwLCDOlHQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gUGFydGljbGVFZmZlY3Q7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIGNvcywgQmFzZSwgVGl0bGUsIGNhbnZhc1RleHR1cmUsIFN0YXJ0TWVudSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5UaXRsZSA9IHJlcXVpcmUoJy4vdGl0bGUnKS5UaXRsZTtcbmNhbnZhc1RleHR1cmUgPSBmdW5jdGlvbigpe1xuICB2YXIgdGV4dHVyZVNpemUsIGZpZGVsaXR5RmFjdG9yLCB0ZXh0Q252LCBpbWdDbnYsIHRleHRDdHgsIGltZ0N0eDtcbiAgdGV4dHVyZVNpemUgPSAxMDI0O1xuICBmaWRlbGl0eUZhY3RvciA9IDEwMDtcbiAgdGV4dENudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBpbWdDbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGV4dEN0eCA9IHRleHRDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ3R4ID0gaW1nQ252LmdldENvbnRleHQoJzJkJyk7XG4gIGltZ0Nudi53aWR0aCA9IGltZ0Nudi5oZWlnaHQgPSB0ZXh0dXJlU2l6ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZyQpe1xuICAgIHZhciB3aWR0aCwgaGVpZ2h0LCB0ZXh0LCB0ZXh0U2l6ZSwgcmVmJDtcbiAgICB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0LCB0ZXh0ID0gYXJnJC50ZXh0LCB0ZXh0U2l6ZSA9IChyZWYkID0gYXJnJC50ZXh0U2l6ZSkgIT0gbnVsbCA/IHJlZiQgOiAxMDtcbiAgICB0ZXh0Q252LndpZHRoID0gd2lkdGggKiBmaWRlbGl0eUZhY3RvcjtcbiAgICB0ZXh0Q252LmhlaWdodCA9IGhlaWdodCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDdHgudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgdGV4dEN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICB0ZXh0Q3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgdGV4dEN0eC5mb250ID0gdGV4dFNpemUgKiBmaWRlbGl0eUZhY3RvciArIFwicHggbW9ub3NwYWNlXCI7XG4gICAgdGV4dEN0eC5maWxsVGV4dCh0ZXh0LCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yIC8gMiwgaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3IgLyAyLCB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yKTtcbiAgICBpbWdDdHguY2xlYXJSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmZpbGxSZWN0KDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgaW1nQ3R4LmRyYXdJbWFnZSh0ZXh0Q252LCAwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIHJldHVybiBpbWdDbnYudG9EYXRhVVJMKCk7XG4gIH07XG59KCk7XG5vdXQkLlN0YXJ0TWVudSA9IFN0YXJ0TWVudSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoU3RhcnRNZW51LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdTdGFydE1lbnUnLCBTdGFydE1lbnUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gU3RhcnRNZW51O1xuICBmdW5jdGlvbiBTdGFydE1lbnUob3B0cywgZ3Mpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIG9wdGlvbiwgcXVhZDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIFN0YXJ0TWVudS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5vcHRpb25zID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGdzLnN0YXJ0TWVudVN0YXRlLm1lbnVEYXRhKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIG9wdGlvbiA9IHJlZiRbaSRdO1xuICAgICAgcXVhZCA9IHRoaXMuY3JlYXRlT3B0aW9uUXVhZChvcHRpb24sIGl4KTtcbiAgICAgIHF1YWQucG9zaXRpb24ueSA9IDAuNSAtIGl4ICogMC4yO1xuICAgICAgdGhpcy5vcHRpb25zLnB1c2gocXVhZCk7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQocXVhZCk7XG4gICAgfVxuICAgIHRoaXMudGl0bGUgPSBuZXcgVGl0bGUodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy50aXRsZS5hZGRUbyh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IC0xICogKHRoaXMub3B0cy5jYW1lcmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmFyZW5hRGlzdGFuY2VGcm9tRWRnZSArIHRoaXMub3B0cy5ibG9ja1NpemUgLyAyKTtcbiAgfVxuICBwcm90b3R5cGUuY3JlYXRlT3B0aW9uUXVhZCA9IGZ1bmN0aW9uKG9wdGlvbiwgaXgpe1xuICAgIHZhciBpbWFnZSwgdGV4LCBnZW9tLCBtYXQsIHF1YWQ7XG4gICAgaW1hZ2UgPSBjYW52YXNUZXh0dXJlKHtcbiAgICAgIHRleHQ6IG9wdGlvbi50ZXh0LFxuICAgICAgd2lkdGg6IDYwLFxuICAgICAgaGVpZ2h0OiAxMFxuICAgIH0pO1xuICAgIHRleCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoaW1hZ2UpO1xuICAgIGdlb20gPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxLCAwLjIpO1xuICAgIG1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleCxcbiAgICAgIGFscGhhTWFwOiB0ZXgsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBxdWFkID0gbmV3IFRIUkVFLk1lc2goZ2VvbSwgbWF0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgdGltZXJzLCB0aXRsZVJldmVhbFRpbWVyO1xuICAgIHRpbWVycyA9IGdzLnRpbWVycywgdGl0bGVSZXZlYWxUaW1lciA9IHRpbWVycy50aXRsZVJldmVhbFRpbWVyO1xuICAgIHRoaXMudGl0bGUucmV2ZWFsKHRpdGxlUmV2ZWFsVGltZXIucHJvZ3Jlc3MpO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVNlbGVjdGlvbihncy5zdGFydE1lbnVTdGF0ZSwgZ3MuZWxhcHNlZFRpbWUpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlU2VsZWN0aW9uID0gZnVuY3Rpb24oc3RhdGUsIHRpbWUpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIHF1YWQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMub3B0aW9ucykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBxdWFkID0gcmVmJFtpJF07XG4gICAgICBpZiAoaXggPT09IHN0YXRlLmN1cnJlbnRJbmRleCkge1xuICAgICAgICBxdWFkLnNjYWxlLnggPSAxICsgMC4wNSAqIHNpbih0aW1lIC8gMzAwKTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChxdWFkLnNjYWxlLnkgPSAxICsgMC4wNSAqIC1zaW4odGltZSAvIDMwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTdGFydE1lbnU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBUYWJsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5UYWJsZSA9IFRhYmxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcmVwZWF0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRhYmxlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUYWJsZScsIFRhYmxlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRhYmxlO1xuICByZXBlYXQgPSAyO1xuICBmdW5jdGlvbiBUYWJsZShvcHRzLCBncyl7XG4gICAgdmFyIHJlZiQsIHdpZHRoLCBkZXB0aCwgdGhpY2tuZXNzLCBtYXAsIG5ybSwgdGFibGVNYXQsIHRhYmxlR2VvO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgVGFibGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJlZiQgPSB0aGlzLm9wdHMuZGVza1NpemUsIHdpZHRoID0gcmVmJFswXSwgZGVwdGggPSByZWYkWzFdO1xuICAgIHRoaWNrbmVzcyA9IDAuMDM7XG4gICAgbWFwID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnYXNzZXRzL3dvb2QuZGlmZi5qcGcnKTtcbiAgICBtYXAud3JhcFQgPSBtYXAud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICBtYXAucmVwZWF0LnNldChyZXBlYXQsIHJlcGVhdCk7XG4gICAgbnJtID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnYXNzZXRzL3dvb2QubnJtLmpwZycpO1xuICAgIG5ybS53cmFwVCA9IG5ybS53cmFwUyA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICAgIG5ybS5yZXBlYXQuc2V0KHJlcGVhdCwgcmVwZWF0KTtcbiAgICB0YWJsZU1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtYXA6IG1hcCxcbiAgICAgIG5vcm1hbE1hcDogbnJtLFxuICAgICAgbm9ybWFsU2NhbGU6IG5ldyBUSFJFRS5WZWN0b3IyKDAuMSwgMC4wKVxuICAgIH0pO1xuICAgIHRhYmxlR2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KHdpZHRoLCB0aGlja25lc3MsIGRlcHRoKTtcbiAgICB0aGlzLnRhYmxlID0gbmV3IFRIUkVFLk1lc2godGFibGVHZW8sIHRhYmxlTWF0KTtcbiAgICB0aGlzLnRhYmxlLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnRhYmxlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gdGhpY2tuZXNzIC8gLTI7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IHdpZHRoIC8gLTI7XG4gIH1cbiAgcmV0dXJuIFRhYmxlO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBtaW4sIG1heCwgRWFzZSwgQmFzZSwgbWVzaE1hdGVyaWFscywgVGl0bGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCBtaW4gPSByZWYkLm1pbiwgbWF4ID0gcmVmJC5tYXg7XG5FYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5UaXRsZSA9IFRpdGxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgYmxvY2tUZXh0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRpdGxlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUaXRsZScsIFRpdGxlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpdGxlO1xuICBibG9ja1RleHQgPSB7XG4gICAgdGV0cmlzOiBbWzEsIDEsIDEsIDIsIDIsIDIsIDMsIDMsIDMsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgMCwgMF0sIFswLCAxLCAwLCAyLCAyLCAwLCAwLCAzLCAwLCA0LCA0LCAwLCA1LCA2LCA2LCA2XSwgWzAsIDEsIDAsIDIsIDAsIDAsIDAsIDMsIDAsIDQsIDAsIDQsIDUsIDAsIDAsIDZdLCBbMCwgMSwgMCwgMiwgMiwgMiwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgNiwgNl1dLFxuICAgIHZydDogW1sxLCAwLCAxLCA0LCA0LCA2LCA2LCA2XSwgWzEsIDAsIDEsIDQsIDAsIDQsIDYsIDBdLCBbMSwgMCwgMSwgNCwgNCwgMCwgNiwgMF0sIFsxLCAwLCAxLCA0LCAwLCA0LCA2LCAwXSwgWzAsIDEsIDAsIDQsIDAsIDQsIDYsIDBdXSxcbiAgICBnaG9zdDogW1sxLCAxLCAxLCAyLCAwLCAyLCAzLCAzLCAzLCA0LCA0LCA0LCA1LCA1LCA1XSwgWzEsIDAsIDAsIDIsIDAsIDIsIDMsIDAsIDMsIDQsIDAsIDAsIDAsIDUsIDBdLCBbMSwgMCwgMCwgMiwgMiwgMiwgMywgMCwgMywgNCwgNCwgNCwgMCwgNSwgMF0sIFsxLCAwLCAxLCAyLCAwLCAyLCAzLCAwLCAzLCAwLCAwLCA0LCAwLCA1LCAwXSwgWzEsIDEsIDEsIDIsIDAsIDIsIDMsIDMsIDMsIDQsIDQsIDQsIDAsIDUsIDBdXVxuICB9O1xuICBmdW5jdGlvbiBUaXRsZShvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHRleHQsIG1hcmdpbiwgaGVpZ2h0LCBpJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGwsIGJveCwgYmJveDtcbiAgICBibG9ja1NpemUgPSBvcHRzLmJsb2NrU2l6ZSwgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIFRpdGxlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0ZXh0ID0gYmxvY2tUZXh0LnZydDtcbiAgICBtYXJnaW4gPSAoZ3JpZFNpemUgLSBibG9ja1NpemUpIC8gMjtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy53b3JkID0gbmV3IFRIUkVFLk9iamVjdDNEKTtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueCA9ICh0ZXh0WzBdLmxlbmd0aCAtIDEpICogZ3JpZFNpemUgLyAtMjtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueSA9IGhlaWdodCAvIC0yIC0gKHRleHQubGVuZ3RoIC0gMSkgKiBncmlkU2l6ZSAvIC0yO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi56ID0gZ3JpZFNpemUgLyAyO1xuICAgIHRoaXMuZ2VvbS5ib3ggPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplICogMC45LCBibG9ja1NpemUgKiAwLjksIGJsb2NrU2l6ZSAqIDAuOSk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0ZXh0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSB0ZXh0W2kkXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBib3ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb20uYm94LCBtZXNoTWF0ZXJpYWxzW2NlbGxdKTtcbiAgICAgICAgICBib3gucG9zaXRpb24uc2V0KGdyaWRTaXplICogeCArIG1hcmdpbiwgZ3JpZFNpemUgKiAodGV4dC5sZW5ndGggLyAyIC0geSkgKyBtYXJnaW4sIGdyaWRTaXplIC8gLTIpO1xuICAgICAgICAgIHRoaXMud29yZC5hZGQoYm94KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBiYm94ID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaXMud29yZCwgMHhmZjAwMDApO1xuICAgIGJib3gudXBkYXRlKCk7XG4gIH1cbiAgcHJvdG90eXBlLnJldmVhbCA9IGZ1bmN0aW9uKHByb2dyZXNzKXtcbiAgICB2YXIgcDtcbiAgICBwID0gbWluKDEsIHByb2dyZXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gRWFzZS5xdWludE91dChwLCB0aGlzLmhlaWdodCAqIDIsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gRWFzZS5leHBPdXQocCwgMzAsIDApO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gRWFzZS5leHBPdXQocCwgLXBpIC8gMTAsIDApO1xuICB9O1xuICBwcm90b3R5cGUuZGFuY2UgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gLXBpIC8gMiArIHRpbWUgLyAxMDAwO1xuICAgIHJldHVybiB0aGlzLndvcmQub3BhY2l0eSA9IDAuNSArIDAuNSAqIHNpbiArIHRpbWUgLyAxMDAwO1xuICB9O1xuICByZXR1cm4gVGl0bGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIHBpLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBwaSA9IHJlZiQucGk7XG5vdXQkLkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IERlYnVnQ2FtZXJhUG9zaXRpb25lciA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIuZGlzcGxheU5hbWUgPSAnRGVidWdDYW1lcmFQb3NpdGlvbmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnQ2FtZXJhUG9zaXRpb25lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xuICBmdW5jdGlvbiBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIoY2FtZXJhLCB0YXJnZXQpe1xuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIHRhcmdldDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmVuYWJsZWQgPSB0cnVlO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmICh0aGlzLnN0YXRlLmVuYWJsZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmF1dG9Sb3RhdGUoZ3MuZWxhcHNlZFRpbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocGhhc2UsIHZwaGFzZSl7XG4gICAgdmFyIHRoYXQ7XG4gICAgdnBoYXNlID09IG51bGwgJiYgKHZwaGFzZSA9IDApO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSB0aGlzLnIgKiBzaW4ocGhhc2UpO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnkgKyB0aGlzLnIgKiAtc2luKHZwaGFzZSk7XG4gICAgcmV0dXJuIHRoaXMuY2FtZXJhLmxvb2tBdCgodGhhdCA9IHRoaXMudGFyZ2V0LnBvc2l0aW9uKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogdGhpcy50YXJnZXQpO1xuICB9O1xuICBwcm90b3R5cGUuYXV0b1JvdGF0ZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHJldHVybiB0aGlzLnNldFBvc2l0aW9uKHBpIC8gMTAgKiBzaW4odGltZSAvIDEwMDApKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgbGVycCwgcmFuZCwgZmxvb3IsIG1hcCwgRWFzZSwgVEhSRUUsIFBhbGV0dGUsIFNjZW5lTWFuYWdlciwgRGVidWdDYW1lcmFQb3NpdGlvbmVyLCBBcmVuYSwgVGFibGUsIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgTGlnaHRpbmcsIEJyaWNrUHJldmlldywgVHJhY2tiYWxsQ29udHJvbHMsIFRocmVlSnNSZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIGxlcnAgPSByZWYkLmxlcnAsIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vciwgbWFwID0gcmVmJC5tYXA7XG5FYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5TY2VuZU1hbmFnZXIgPSByZXF1aXJlKCcuL3NjZW5lLW1hbmFnZXInKS5TY2VuZU1hbmFnZXI7XG5EZWJ1Z0NhbWVyYVBvc2l0aW9uZXIgPSByZXF1aXJlKCcuL2RlYnVnLWNhbWVyYScpLkRlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbnJlZiQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKSwgQXJlbmEgPSByZWYkLkFyZW5hLCBUYWJsZSA9IHJlZiQuVGFibGUsIFN0YXJ0TWVudSA9IHJlZiQuU3RhcnRNZW51LCBGYWlsU2NyZWVuID0gcmVmJC5GYWlsU2NyZWVuLCBMaWdodGluZyA9IHJlZiQuTGlnaHRpbmcsIEJyaWNrUHJldmlldyA9IHJlZiQuQnJpY2tQcmV2aWV3O1xuVHJhY2tiYWxsQ29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi9saWIvdHJhY2tiYWxsLWNvbnRyb2xzLmpzJykuVHJhY2tiYWxsQ29udHJvbHM7XG5vdXQkLlRocmVlSnNSZW5kZXJlciA9IFRocmVlSnNSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBUaHJlZUpzUmVuZGVyZXIuZGlzcGxheU5hbWUgPSAnVGhyZWVKc1JlbmRlcmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IFRocmVlSnNSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGhyZWVKc1JlbmRlcmVyO1xuICBmdW5jdGlvbiBUaHJlZUpzUmVuZGVyZXIob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgbmFtZSwgcmVmJCwgcGFydCwgdHJhY2tiYWxsVGFyZ2V0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIGxvZyhcIlJlbmRlcmVyOjpuZXdcIik7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZU1hbmFnZXIodGhpcy5vcHRzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMCxcbiAgICAgIGxhc3RTZWVuU3RhdGU6ICduby1nYW1lJ1xuICAgIH07XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIHRhYmxlOiBuZXcgVGFibGUodGhpcy5vcHRzLCBncyksXG4gICAgICBsaWdodGluZzogbmV3IExpZ2h0aW5nKHRoaXMub3B0cywgZ3MpLFxuICAgICAgYXJlbmE6IG5ldyBBcmVuYSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHN0YXJ0TWVudTogbmV3IFN0YXJ0TWVudSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGZhaWxTY3JlZW46IG5ldyBGYWlsU2NyZWVuKHRoaXMub3B0cywgZ3MpLFxuICAgICAgbmV4dEJyaWNrOiBuZXcgQnJpY2tQcmV2aWV3KHRoaXMub3B0cywgZ3MpXG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmJCA9IHRoaXMucGFydHMpIHtcbiAgICAgIHBhcnQgPSByZWYkW25hbWVdO1xuICAgICAgdGhpcy5zY2VuZS5hZGQocGFydCk7XG4gICAgfVxuICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnJvb3QucG9zaXRpb24uc2V0KDAsIDAsIC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSk7XG4gICAgdHJhY2tiYWxsVGFyZ2V0ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMuc2NlbmUuYWRkKHRyYWNrYmFsbFRhcmdldCk7XG4gICAgdHJhY2tiYWxsVGFyZ2V0LnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2U7XG4gICAgdGhpcy50cmFja2JhbGwgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHModGhpcy5zY2VuZS5jYW1lcmEsIHRyYWNrYmFsbFRhcmdldCk7XG4gICAgdGhpcy5zY2VuZS5jb250cm9scy5yZXNldFNlbnNvcigpO1xuICAgIHRoaXMuc2NlbmUucm9vdC5wb3NpdGlvbi5zZXQoMCwgLXRoaXMub3B0cy5jYW1lcmFFbGV2YXRpb24sIC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSAqIDIpO1xuICAgIHRoaXMuc2NlbmUuc2hvd0hlbHBlcnMoKTtcbiAgfVxuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLnNjZW5lLmRvbUVsZW1lbnQpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzLCBwO1xuICAgIHRoaXMudHJhY2tiYWxsLnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUudXBkYXRlKCk7XG4gICAgaWYgKGdzLm1ldGFnYW1lU3RhdGUgIT09IHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSkge1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICBjYXNlICdnYW1lJzpcbiAgICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIGxvZygnbm8tZ2FtZScpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHJvd3MgPSBncy5yb3dzVG9SZW1vdmUubGVuZ3RoO1xuICAgICAgcCA9IGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgICAgZ3Muc2xvd2Rvd24gPSAxICsgRWFzZS5xdWludEluKHAsIDEwLCAwKTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEuemFwTGluZXMoZ3MsIHRoaXMuc2NlbmUucmVnaXN0cmF0aW9uLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncywgZ3MuZWxhcHNlZFRpbWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICBncy5zbG93ZG93biA9IDE7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnVwZGF0ZShncywgdGhpcy5zY2VuZS5yZWdpc3RyYXRpb24ucG9zaXRpb24pO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheVNoYXBlKGdzLmJyaWNrLm5leHQpO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sudXBkYXRlV2lnZ2xlKGdzLCBncy5lbGFwc2VkVGltZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMucGFydHMuc3RhcnRNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXVzZS1tZW51JzpcbiAgICAgIHRoaXMucGFydHMucGF1c2VNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMucGFydHMuZmFpbFNjcmVlbi51cGRhdGUoZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGxvZyhcIlRocmVlSnNSZW5kZXJlcjo6cmVuZGVyIC0gVW5rbm93biBtZXRhZ2FtZXN0YXRlOlwiLCBncy5tZXRhZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGVQYXJ0aWNsZXMoZ3MpO1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSA9IGdzLm1ldGFnYW1lU3RhdGU7XG4gICAgdGhpcy5zY2VuZS5yZW5kZXIoKTtcbiAgICB0aGlzLnBhcnRzLmxpZ2h0aW5nLnJvb3QucG9zaXRpb24ueCA9IDAuNSAqIHNpbihncy5lbGFwc2VkVGltZSAvIDEwMCk7XG4gICAgcmV0dXJuIHRoaXMucGFydHMubGlnaHRpbmcucm9vdC5wb3NpdGlvbi55ID0gMC41ICogY29zKGdzLmVsYXBzZWRUaW1lIC8gMTAwKTtcbiAgfTtcbiAgcmV0dXJuIFRocmVlSnNSZW5kZXJlcjtcbn0oKSk7IiwidmFyIFRIUkVFLCBtYXAsIHBsdWNrLCBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIGNvbG9yT3JkZXIsIHRpbGVDb2xvcnMsIHNwZWNDb2xvcnMsIG5vcm1hbE1hcHMsIG5vcm1hbEFkanVzdCwgbWVzaE1hdGVyaWFscywgaSwgY29sb3IsIGxpbmVNYXRlcmlhbHMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbm1hcCA9IHJlcXVpcmUoJ3N0ZCcpLm1hcDtcbnBsdWNrID0gY3VycnkkKGZ1bmN0aW9uKHAsIG8pe1xuICByZXR1cm4gb1twXTtcbn0pO1xub3V0JC5uZXV0cmFsID0gbmV1dHJhbCA9IFsweGZmZmZmZiwgMHhjY2NjY2MsIDB4ODg4ODg4LCAweDIxMjEyMV07XG5vdXQkLnJlZCA9IHJlZCA9IFsweEZGNDQ0NCwgMHhGRjc3NzcsIDB4ZGQ0NDQ0LCAweDU1MTExMV07XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsweEZGQkIzMywgMHhGRkNDODgsIDB4Q0M4ODAwLCAweDU1MzMwMF07XG5vdXQkLmdyZWVuID0gZ3JlZW4gPSBbMHg0NGZmNjYsIDB4ODhmZmFhLCAweDIyYmIzMywgMHgxMTU1MTFdO1xub3V0JC5tYWdlbnRhID0gbWFnZW50YSA9IFsweGZmMzNmZiwgMHhmZmFhZmYsIDB4YmIyMmJiLCAweDU1MTE1NV07XG5vdXQkLmJsdWUgPSBibHVlID0gWzB4NjZiYmZmLCAweGFhZGRmZiwgMHg1NTg4ZWUsIDB4MTExMTU1XTtcbm91dCQuYnJvd24gPSBicm93biA9IFsweGZmYmIzMywgMHhmZmNjODgsIDB4YmI5OTAwLCAweDU1NTUxMV07XG5vdXQkLnllbGxvdyA9IHllbGxvdyA9IFsweGVlZWUxMSwgMHhmZmZmYWEsIDB4Y2NiYjAwLCAweDU1NTUxMV07XG5vdXQkLmN5YW4gPSBjeWFuID0gWzB4NDRkZGZmLCAweGFhZTNmZiwgMHgwMGFhY2MsIDB4MDA2Njk5XTtcbmNvbG9yT3JkZXIgPSBbbmV1dHJhbCwgcmVkLCBvcmFuZ2UsIHllbGxvdywgZ3JlZW4sIGN5YW4sIGJsdWUsIG1hZ2VudGFdO1xub3V0JC50aWxlQ29sb3JzID0gdGlsZUNvbG9ycyA9IG1hcChwbHVjaygyKSwgY29sb3JPcmRlcik7XG5vdXQkLnNwZWNDb2xvcnMgPSBzcGVjQ29sb3JzID0gbWFwKHBsdWNrKDApLCBjb2xvck9yZGVyKTtcbm5vcm1hbE1hcHMgPSBbVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnLi4vYXNzZXRzL3RpbGUubnJtLnBuZycpLCBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuLi9hc3NldHMvdGlsZS5ucm0ucG5nJyksIFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy4uL2Fzc2V0cy90aWxlLm5ybS5wbmcnKSwgVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnLi4vYXNzZXRzL3RpbGUubnJtLnBuZycpLCBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuLi9hc3NldHMvdGlsZS5ucm0ucG5nJyksIFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJy4uL2Fzc2V0cy90aWxlLm5ybS5wbmcnKSwgVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZSgnLi4vYXNzZXRzL3RpbGUubnJtLnBuZycpLCBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCcuLi9hc3NldHMvdGlsZS5ucm0ucG5nJyldO1xubm9ybWFsQWRqdXN0ID0gbmV3IFRIUkVFLlZlY3RvcjIoMSwgMSk7XG5vdXQkLm1lc2hNYXRlcmlhbHMgPSBtZXNoTWF0ZXJpYWxzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICBzcGVjdWxhcjogc3BlY0NvbG9yc1tpXSxcbiAgICAgIHNoaW5pbmVzczogMTAwLFxuICAgICAgbm9ybWFsTWFwOiBub3JtYWxNYXBzW2ldLFxuICAgICAgbm9ybWFsU2NhbGU6IG5vcm1hbEFkanVzdFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5saW5lTWF0ZXJpYWxzID0gbGluZU1hdGVyaWFscyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLlBhbGV0dGUgPSBQYWxldHRlID0ge1xuICBuZXV0cmFsOiBuZXV0cmFsLFxuICByZWQ6IHJlZCxcbiAgb3JhbmdlOiBvcmFuZ2UsXG4gIHllbGxvdzogeWVsbG93LFxuICBncmVlbjogZ3JlZW4sXG4gIGN5YW46IGN5YW4sXG4gIGJsdWU6IGJsdWUsXG4gIG1hZ2VudGE6IG1hZ2VudGEsXG4gIHRpbGVDb2xvcnM6IHRpbGVDb2xvcnMsXG4gIG1lc2hNYXRlcmlhbHM6IG1lc2hNYXRlcmlhbHMsXG4gIGxpbmVNYXRlcmlhbHM6IGxpbmVNYXRlcmlhbHNcbn07XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgVEhSRUUsIFNjZW5lTWFuYWdlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xub3V0JC5TY2VuZU1hbmFnZXIgPSBTY2VuZU1hbmFnZXIgPSAoZnVuY3Rpb24oKXtcbiAgU2NlbmVNYW5hZ2VyLmRpc3BsYXlOYW1lID0gJ1NjZW5lTWFuYWdlcic7XG4gIHZhciBwcm90b3R5cGUgPSBTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFNjZW5lTWFuYWdlcjtcbiAgZnVuY3Rpb24gU2NlbmVNYW5hZ2VyKG9wdHMpe1xuICAgIHZhciBhc3BlY3Q7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJlc2l6ZSA9IGJpbmQkKHRoaXMsICdyZXNpemUnLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuemVyb1NlbnNvciA9IGJpbmQkKHRoaXMsICd6ZXJvU2Vuc29yJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLmdvRnVsbHNjcmVlbiA9IGJpbmQkKHRoaXMsICdnb0Z1bGxzY3JlZW4nLCBwcm90b3R5cGUpO1xuICAgIGFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgICBhbnRpYWxpYXM6IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIGFzcGVjdCwgMC4wMDEsIDEwMDApO1xuICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyh0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy5yb290ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMuZWZmZWN0ID0gbmV3IFRIUkVFLlZSRWZmZWN0KHRoaXMucmVuZGVyZXIpO1xuICAgIHRoaXMuZWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGggLSAxLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuemVyb1NlbnNvciwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRoaXMuZ29GdWxsc2NyZWVuKTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnJvb3QpO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5yZWdpc3RyYXRpb24pO1xuICB9XG4gIHByb3RvdHlwZS5zaG93SGVscGVycyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGdyaWQsIGF4aXMsIHJvb3RBeGlzO1xuICAgIGdyaWQgPSBuZXcgVEhSRUUuR3JpZEhlbHBlcigxMCwgMC4xKTtcbiAgICBheGlzID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoMSk7XG4gICAgcm9vdEF4aXMgPSBuZXcgVEhSRUUuQXhpc0hlbHBlcigwLjUpO1xuICAgIGF4aXMucG9zaXRpb24ueiA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLno7XG4gICAgcm9vdEF4aXMucG9zaXRpb24ueiA9IHRoaXMucm9vdC5wb3NpdGlvbi56O1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQoZ3JpZCwgYXhpcyk7XG4gIH07XG4gIHByb3RvdHlwZS5lbmFibGVTaGFkb3dDYXN0aW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcFNvZnQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwRW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFGYXIgPSAxMDAwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRm92ID0gNTA7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFOZWFyID0gMztcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEJpYXMgPSAwLjAwMzk7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBIZWlnaHQgPSAxMDI0O1xuICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcERhcmtuZXNzID0gMC41O1xuICB9O1xuICBwcm90b3R5cGUuZ29GdWxsc2NyZWVuID0gZnVuY3Rpb24oKXtcbiAgICBsb2coJ1N0YXJ0aW5nIGZ1bGxzY3JlZW4uLi4nKTtcbiAgICByZXR1cm4gdGhpcy5lZmZlY3Quc2V0RnVsbFNjcmVlbih0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLnplcm9TZW5zb3IgPSBmdW5jdGlvbihldmVudCl7XG4gICAgdmFyIGtleUNvZGU7XG4gICAga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gODYpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgcmV0dXJuIHRoaXMuZWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5lZmZlY3QucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2RvbUVsZW1lbnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBwcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIG9iaiwgdGhhdCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgb2JqID0gYXJndW1lbnRzW2kkXTtcbiAgICAgIGxvZygnU2NlbmVNYW5hZ2VyOjphZGQgLScsIG9iaik7XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmVnaXN0cmF0aW9uLmFkZCgodGhhdCA9IG9iai5yb290KSAhPSBudWxsID8gdGhhdCA6IG9iaikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTY2VuZU1hbmFnZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHBvdywgcXVhZEluLCBxdWFkT3V0LCBjdWJpY0luLCBjdWJpY091dCwgcXVhcnRJbiwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50T3V0LCBleHBJbiwgZXhwT3V0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucG93ID0gcmVxdWlyZSgnc3RkJykucG93O1xub3V0JC5xdWFkSW4gPSBxdWFkSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHQgKiB0ICsgYjtcbn07XG5vdXQkLnF1YWRPdXQgPSBxdWFkT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogdCAqICh0IC0gMikgKyBiO1xufTtcbm91dCQuY3ViaWNJbiA9IGN1YmljSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDMpICsgYjtcbn07XG5vdXQkLmN1YmljT3V0ID0gY3ViaWNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgMykgKyAxKSArIGI7XG59O1xub3V0JC5xdWFydEluID0gcXVhcnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNCkgKyBiO1xufTtcbm91dCQucXVhcnRPdXQgPSBxdWFydE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIChNYXRoLnBvdyh0IC0gMSwgNCkgLSAxKSArIGI7XG59O1xub3V0JC5xdWludEluID0gcXVpbnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNSkgKyBiO1xufTtcbm91dCQucXVpbnRPdXQgPSBxdWludE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKE1hdGgucG93KHQgLSAxLCA1KSArIDEpICsgYjtcbn07XG5vdXQkLmV4cEluID0gZXhwSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHBvdygyLCAxMCAqICh0IC0gMSkpICsgYjtcbn07XG5vdXQkLmV4cE91dCA9IGV4cE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKCgtcG93KDIsIC0xMCAqIHQpKSArIDEpICsgYjtcbn07IiwidmFyIGlkLCBsb2csIGZsaXAsIGRlbGF5LCBmbG9vciwgcmFuZG9tLCByYW5kLCByYW5kSW50LCByYW5kb21Gcm9tLCBhZGRWMiwgZmlsdGVyLCBwaSwgdGF1LCBwb3csIHNpbiwgY29zLCBtaW4sIG1heCwgbGVycCwgbWFwLCBqb2luLCB1bmxpbmVzLCB3cmFwLCBsaW1pdCwgcmFmLCB0aGF0LCBFYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5pZCA9IGlkID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQ7XG59O1xub3V0JC5sb2cgPSBsb2cgPSBmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gYXJndW1lbnRzWzBdO1xufTtcbm91dCQuZmxpcCA9IGZsaXAgPSBmdW5jdGlvbijOuyl7XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gzrsoYiwgYSk7XG4gIH07XG59O1xub3V0JC5kZWxheSA9IGRlbGF5ID0gZmxpcChzZXRUaW1lb3V0KTtcbm91dCQuZmxvb3IgPSBmbG9vciA9IE1hdGguZmxvb3I7XG5vdXQkLnJhbmRvbSA9IHJhbmRvbSA9IE1hdGgucmFuZG9tO1xub3V0JC5yYW5kID0gcmFuZCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcbiAgcmV0dXJuIG1pbiArIHJhbmRvbSgpICogKG1heCAtIG1pbik7XG59O1xub3V0JC5yYW5kSW50ID0gcmFuZEludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcbiAgcmV0dXJuIG1pbiArIGZsb29yKHJhbmRvbSgpICogKG1heCAtIG1pbikpO1xufTtcbm91dCQucmFuZG9tRnJvbSA9IHJhbmRvbUZyb20gPSBmdW5jdGlvbihsaXN0KXtcbiAgcmV0dXJuIGxpc3RbcmFuZCgwLCBsaXN0Lmxlbmd0aCAtIDEpXTtcbn07XG5vdXQkLmFkZFYyID0gYWRkVjIgPSBmdW5jdGlvbihhLCBiKXtcbiAgcmV0dXJuIFthWzBdICsgYlswXSwgYVsxXSArIGJbMV1dO1xufTtcbm91dCQuZmlsdGVyID0gZmlsdGVyID0gY3VycnkkKGZ1bmN0aW9uKM67LCBsaXN0KXtcbiAgdmFyIGkkLCBsZW4kLCB4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGxpc3QubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB4ID0gbGlzdFtpJF07XG4gICAgaWYgKM67KHgpKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KTtcbm91dCQucGkgPSBwaSA9IE1hdGguUEk7XG5vdXQkLnRhdSA9IHRhdSA9IHBpICogMjtcbm91dCQucG93ID0gcG93ID0gTWF0aC5wb3c7XG5vdXQkLnNpbiA9IHNpbiA9IE1hdGguc2luO1xub3V0JC5jb3MgPSBjb3MgPSBNYXRoLmNvcztcbm91dCQubWluID0gbWluID0gTWF0aC5taW47XG5vdXQkLm1heCA9IG1heCA9IE1hdGgubWF4O1xub3V0JC5sZXJwID0gbGVycCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgcCl7XG4gIHJldHVybiBtaW4gKyBwICogKG1heCAtIG1pbik7XG59KTtcbm91dCQubWFwID0gbWFwID0gY3VycnkkKGZ1bmN0aW9uKM67LCBsKXtcbiAgdmFyIGkkLCBsZW4kLCB4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGwubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB4ID0gbFtpJF07XG4gICAgcmVzdWx0cyQucHVzaCjOuyh4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLmpvaW4gPSBqb2luID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuam9pbihjaGFyKTtcbn0pO1xub3V0JC51bmxpbmVzID0gdW5saW5lcyA9IGpvaW4oXCJcXG5cIik7XG5vdXQkLndyYXAgPSB3cmFwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQubGltaXQgPSBsaW1pdCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9O1xub3V0JC5FYXNlID0gRWFzZSA9IHJlcXVpcmUoJy4vZWFzaW5nJyk7XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgdW5saW5lcywgdGVtcGxhdGUsIERlYnVnT3V0cHV0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB1bmxpbmVzID0gcmVmJC51bmxpbmVzO1xudGVtcGxhdGUgPSB7XG4gIGNlbGw6IGZ1bmN0aW9uKGl0KXtcbiAgICBpZiAoaXQpIHtcbiAgICAgIHJldHVybiBcIuKWkuKWklwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIgIFwiO1xuICAgIH1cbiAgfSxcbiAgc2NvcmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMsIG51bGwsIDIpO1xuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJzY29yZSAtIFwiICsgdGVtcGxhdGUuc2NvcmUuYXBwbHkodGhpcy5zY29yZSkgKyBcIlxcbmxpbmVzIC0gXCIgKyB0aGlzLmxpbmVzICsgXCJcXG5cXG4gbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuZnJhbWUgLSBcIiArIHRoaXMuZWxhcHNlZEZyYW1lcyArIFwiXFxuIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuIGRyb3AgLSBcIiArICh0aGlzLmZvcmNlRG93bk1vZGUgPyAnc29mdCcgOiAnYXV0bycpO1xuICB9LFxuICBtZW51SXRlbXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGl4LCBpdGVtO1xuICAgIHJldHVybiBcIlwiICsgdW5saW5lcygoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLm1lbnVEYXRhKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBpeCA9IGkkO1xuICAgICAgICBpdGVtID0gcmVmJFtpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2godGVtcGxhdGUubWVudUl0ZW0uY2FsbChpdGVtLCBpeCwgdGhpcy5jdXJyZW50SW5kZXgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9LmNhbGwodGhpcykpKTtcbiAgfSxcbiAgc3RhcnRNZW51OiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIlNUQVJUIE1FTlVcXG5cIiArIHRlbXBsYXRlLm1lbnVJdGVtcy5hcHBseSh0aGlzKTtcbiAgfSxcbiAgbWVudUl0ZW06IGZ1bmN0aW9uKGluZGV4LCBjdXJyZW50SW5kZXgpe1xuICAgIHJldHVybiBcIlwiICsgKGluZGV4ID09PSBjdXJyZW50SW5kZXggPyBcIj5cIiA6IFwiIFwiKSArIFwiIFwiICsgdGhpcy50ZXh0O1xuICB9LFxuICBmYWlsdXJlOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIiAgIEdBTUUgT1ZFUlxcblxcbiAgICAgU2NvcmVcXG5cXG4gIFNpbmdsZSAtIFwiICsgdGhpcy5zY29yZS5zaW5nbGVzICsgXCJcXG4gIERvdWJsZSAtIFwiICsgdGhpcy5zY29yZS5kb3VibGVzICsgXCJcXG4gIFRyaXBsZSAtIFwiICsgdGhpcy5zY29yZS50cmlwbGVzICsgXCJcXG4gIFRldHJpcyAtIFwiICsgdGhpcy5zY29yZS50ZXRyaXMgKyBcIlxcblxcblRvdGFsIExpbmVzOiBcIiArIHRoaXMuc2NvcmUubGluZXMgKyBcIlxcblxcblwiICsgdGVtcGxhdGUubWVudUl0ZW1zLmFwcGx5KHRoaXMuZmFpbE1lbnVTdGF0ZSk7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe1xuICAgIHZhciByZWYkO1xuICAgIHRoaXMuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRibyk7XG4gICAgcmVmJCA9IHRoaXMuZGJvLnN0eWxlO1xuICAgIHJlZiQucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHJlZiQudG9wID0gMDtcbiAgICByZWYkLmxlZnQgPSAwO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgc3dpdGNoIChzdGF0ZS5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5mYWlsdXJlLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5zdGFydE1lbnUuYXBwbHkoc3RhdGUuc3RhcnRNZW51U3RhdGUpO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IFwiVW5rbm93biBtZXRhZ2FtZSBzdGF0ZTogXCIgKyBzdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIERlYnVnT3V0cHV0O1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFmLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWY7XG5vdXQkLkZyYW1lRHJpdmVyID0gRnJhbWVEcml2ZXIgPSAoZnVuY3Rpb24oKXtcbiAgRnJhbWVEcml2ZXIuZGlzcGxheU5hbWUgPSAnRnJhbWVEcml2ZXInO1xuICB2YXIgcHJvdG90eXBlID0gRnJhbWVEcml2ZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lRHJpdmVyO1xuICBmdW5jdGlvbiBGcmFtZURyaXZlcihvbkZyYW1lKXtcbiAgICB0aGlzLm9uRnJhbWUgPSBvbkZyYW1lO1xuICAgIHRoaXMuZnJhbWUgPSBiaW5kJCh0aGlzLCAnZnJhbWUnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHplcm86IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiBmYWxzZVxuICAgIH07XG4gIH1cbiAgcHJvdG90eXBlLmZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgbm93LCDOlHQ7XG4gICAgaWYgKHRoaXMuc3RhdGUucnVubmluZykge1xuICAgICAgcmFmKHRoaXMuZnJhbWUpO1xuICAgIH1cbiAgICBub3cgPSBEYXRlLm5vdygpIC0gdGhpcy5zdGF0ZS56ZXJvO1xuICAgIM6UdCA9IG5vdyAtIHRoaXMuc3RhdGUudGltZTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMuc3RhdGUuzpR0ID0gzpR0O1xuICAgIHJldHVybiB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUpO1xuICB9O1xuICBwcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIFRpbWVyLCBHYW1lU3RhdGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhbmQgPSByZWYkLnJhbmQ7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbm91dCQuR2FtZVN0YXRlID0gR2FtZVN0YXRlID0gKGZ1bmN0aW9uKCl7XG4gIEdhbWVTdGF0ZS5kaXNwbGF5TmFtZSA9ICdHYW1lU3RhdGUnO1xuICB2YXIgZGVmYXVsdHMsIHByb3RvdHlwZSA9IEdhbWVTdGF0ZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR2FtZVN0YXRlO1xuICBkZWZhdWx0cyA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZScsXG4gICAgaW5wdXRTdGF0ZTogW10sXG4gICAgZm9yY2VEb3duTW9kZTogZmFsc2UsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG4gICAgZWxhcHNlZEZyYW1lczogMCxcbiAgICByb3dzVG9SZW1vdmU6IFtdLFxuICAgIHNsb3dkb3duOiAxLFxuICAgIGZsYWdzOiB7XG4gICAgICByb3dzUmVtb3ZlZFRoaXNGcmFtZTogZmFsc2VcbiAgICB9LFxuICAgIHNjb3JlOiB7XG4gICAgICBwb2ludHM6IDAsXG4gICAgICBsaW5lczogMCxcbiAgICAgIHNpbmdsZXM6IDAsXG4gICAgICBkb3VibGVzOiAwLFxuICAgICAgdHJpcGxlczogMCxcbiAgICAgIHRldHJpczogMFxuICAgIH0sXG4gICAgYnJpY2s6IHtcbiAgICAgIG5leHQ6IHZvaWQgOCxcbiAgICAgIGN1cnJlbnQ6IHZvaWQgOFxuICAgIH0sXG4gICAgdGltZXJzOiB7XG4gICAgICBkcm9wVGltZXI6IG51bGwsXG4gICAgICBmb3JjZURyb3BXYWl0VGllbXI6IG51bGwsXG4gICAgICBrZXlSZXBlYXRUaW1lcjogbnVsbCxcbiAgICAgIHJlbW92YWxBbmltYXRpb246IG51bGwsXG4gICAgICB0aXRsZVJldmVhbFRpbWVyOiBudWxsLFxuICAgICAgZmFpbHVyZVJldmVhbFRpbWVyOiBudWxsXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICB0aWxlV2lkdGg6IDEwLFxuICAgICAgdGlsZUhlaWdodDogMTgsXG4gICAgICB0aWxlU2l6ZTogMjAsXG4gICAgICBoYXJkRHJvcEpvbHRBbW91bnQ6IDAuMzUsXG4gICAgICBkcm9wU3BlZWQ6IDMwMCxcbiAgICAgIGZvcmNlRHJvcFdhaXRUaW1lOiAxMDAsXG4gICAgICByZW1vdmFsQW5pbWF0aW9uVGltZTogNTAwLFxuICAgICAgaGFyZERyb3BFZmZlY3RUaW1lOiAxMDAsXG4gICAgICBrZXlSZXBlYXRUaW1lOiAxMDAsXG4gICAgICB0aXRsZVJldmVhbFRpbWU6IDQwMDBcbiAgICB9LFxuICAgIGFyZW5hOiB7XG4gICAgICBjZWxsczogW1tdXSxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBHYW1lU3RhdGUob3B0aW9ucyl7XG4gICAgaW1wb3J0JCh0aGlzLCBkZWZhdWx0cyk7XG4gICAgaW1wb3J0JCh0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIHRoaXMudGltZXJzLmRyb3BUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuZHJvcFNwZWVkKTtcbiAgICB0aGlzLnRpbWVycy5mb3JjZURyb3BXYWl0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmZvcmNlRHJvcFdhaXRUaW1lKTtcbiAgICB0aGlzLnRpbWVycy5rZXlSZXBlYXRUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMua2V5UmVwZWF0VGltZSk7XG4gICAgdGhpcy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbiA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMucmVtb3ZhbEFuaW1hdGlvblRpbWUpO1xuICAgIHRoaXMudGltZXJzLmhhcmREcm9wRWZmZWN0ID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5oYXJkRHJvcEVmZmVjdFRpbWUpO1xuICAgIHRoaXMudGltZXJzLnRpdGxlUmV2ZWFsVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLnRpdGxlUmV2ZWFsVGltZSk7XG4gICAgdGhpcy50aW1lcnMuZmFpbHVyZVJldmVhbFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy50aXRsZVJldmVhbFRpbWUpO1xuICAgIHRoaXMuYXJlbmEgPSBjb25zdHJ1Y3Rvci5uZXdBcmVuYSh0aGlzLm9wdGlvbnMudGlsZVdpZHRoLCB0aGlzLm9wdGlvbnMudGlsZUhlaWdodCk7XG4gIH1cbiAgR2FtZVN0YXRlLm5ld0FyZW5hID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCl7XG4gICAgdmFyIHJvdywgY2VsbDtcbiAgICByZXR1cm4ge1xuICAgICAgY2VsbHM6IChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgaSQsIHRvJCwgbHJlc3VsdCQsIGokLCB0bzEkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgICBmb3IgKGkkID0gMCwgdG8kID0gaGVpZ2h0OyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgICAgIHJvdyA9IGkkO1xuICAgICAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICAgICAgZm9yIChqJCA9IDAsIHRvMSQgPSB3aWR0aDsgaiQgPCB0bzEkOyArK2okKSB7XG4gICAgICAgICAgICBjZWxsID0gaiQ7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgICB9KCkpLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9O1xuICB9O1xuICByZXR1cm4gR2FtZVN0YXRlO1xufSgpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZpbHRlciwgVGltZXIsIGtleVJlcGVhdFRpbWUsIEtFWSwgQUNUSU9OX05BTUUsIGV2ZW50U3VtbWFyeSwgbmV3QmxhbmtLZXlzdGF0ZSwgSW5wdXRIYW5kbGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmaWx0ZXIgPSByZWYkLmZpbHRlcjtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xua2V5UmVwZWF0VGltZSA9IDE1MDtcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwLFxuICBaOiA5MCxcbiAgWDogODgsXG4gIE9ORTogNDksXG4gIFRXTzogNTAsXG4gIFRIUkVFOiA1MSxcbiAgRk9VUjogNTIsXG4gIEZJVkU6IDUzLFxuICBTSVg6IDU0XG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnY2FuY2VsJywgcmVmJFtLRVkuU1BBQ0UgKyBcIlwiXSA9ICdoYXJkLWRyb3AnLCByZWYkW0tFWS5YICsgXCJcIl0gPSAnY3cnLCByZWYkW0tFWS5aICsgXCJcIl0gPSAnY2N3JywgcmVmJFtLRVkuVVAgKyBcIlwiXSA9ICd1cCcsIHJlZiRbS0VZLkxFRlQgKyBcIlwiXSA9ICdsZWZ0JywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJFtLRVkuT05FICsgXCJcIl0gPSAnZGVidWctMScsIHJlZiRbS0VZLlRXTyArIFwiXCJdID0gJ2RlYnVnLTInLCByZWYkW0tFWS5USFJFRSArIFwiXCJdID0gJ2RlYnVnLTMnLCByZWYkW0tFWS5GT1VSICsgXCJcIl0gPSAnZGVidWctNCcsIHJlZiRbS0VZLkZJVkUgKyBcIlwiXSA9ICdkZWJ1Zy01JywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihrZXksIHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBhY3Rpb246IHN0YXRlID8gJ2Rvd24nIDogJ3VwJ1xuICB9O1xufTtcbm5ld0JsYW5rS2V5c3RhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHVwOiBmYWxzZSxcbiAgICBkb3duOiBmYWxzZSxcbiAgICBsZWZ0OiBmYWxzZSxcbiAgICByaWdodDogZmFsc2UsXG4gICAgYWN0aW9uQTogZmFsc2UsXG4gICAgYWN0aW9uQjogZmFsc2UsXG4gICAgY29uZmlybTogZmFsc2UsXG4gICAgY2FuY2VsOiBmYWxzZVxuICB9O1xufTtcbm91dCQuSW5wdXRIYW5kbGVyID0gSW5wdXRIYW5kbGVyID0gKGZ1bmN0aW9uKCl7XG4gIElucHV0SGFuZGxlci5kaXNwbGF5TmFtZSA9ICdJbnB1dEhhbmRsZXInO1xuICB2YXIgcHJvdG90eXBlID0gSW5wdXRIYW5kbGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBJbnB1dEhhbmRsZXI7XG4gIGZ1bmN0aW9uIElucHV0SGFuZGxlcigpe1xuICAgIHRoaXMuc3RhdGVTZXR0ZXIgPSBiaW5kJCh0aGlzLCAnc3RhdGVTZXR0ZXInLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIklucHV0SGFuZGxlcjo6bmV3XCIpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnN0YXRlU2V0dGVyKHRydWUpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc3RhdGVTZXR0ZXIoZmFsc2UpKTtcbiAgICB0aGlzLmN1cnJLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgICB0aGlzLmxhc3RLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgfVxuICBwcm90b3R5cGUuc3RhdGVTZXR0ZXIgPSBjdXJyeSQoKGZ1bmN0aW9uKHN0YXRlLCBhcmckKXtcbiAgICB2YXIgd2hpY2gsIGtleTtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKGtleSA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgdGhpcy5jdXJyS2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgaWYgKHN0YXRlID09PSB0cnVlICYmIHRoaXMubGFzdEhlbGRLZXkgIT09IGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0SGVsZEtleSA9IGtleTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLCB0cnVlKTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGtleSwgc3RhdGUsIHdhc0RpZmZlcmVudDtcbiAgICByZXR1cm4gZmlsdGVyKGlkLCAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuY3VycktleXN0YXRlKSB7XG4gICAgICAgIHN0YXRlID0gcmVmJFtrZXldO1xuICAgICAgICB3YXNEaWZmZXJlbnQgPSBzdGF0ZSAhPT0gdGhpcy5sYXN0S2V5c3RhdGVba2V5XTtcbiAgICAgICAgdGhpcy5sYXN0S2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgICBpZiAod2FzRGlmZmVyZW50KSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChldmVudFN1bW1hcnkoa2V5LCBzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUgPSBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQ7XG4gICAgdGhpcy5hY3RpdmUgPSBiZWdpbjtcbiAgICB0aGlzLmV4cGlyZWQgPSAhYmVnaW47XG4gICAgYWxsVGltZXJzLnB1c2godGhpcyk7XG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfQUNUSVZFO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdleHBpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdwcm9ncmVzcycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZSAvIHRoaXMudGFyZ2V0VGltZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndGltZVRvRXhwaXJ5Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFRpbWUgLSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihleHBUaW1lKXtcbiAgICAgIHRoaXMuY3VycmVudFRpbWUgPSB0aGlzLnRhcmdldFRpbWUgLSBleHBUaW1lO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbijOlHQpe1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5jdXJyZW50VGltZSArPSDOlHQ7XG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSA+PSB0aGlzLnRhcmdldFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPSBUSU1FUl9FWFBJUkVEO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnRhcmdldFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfQUNUSVZFO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXRXaXRoUmVtYWluZGVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGhpcy50YXJnZXRUaW1lKTtcbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIHRpbWU7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfRVhQSVJFRDtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuc3BsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZvciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMudGltZVRvRXhwaXJ5ID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJUSU1FUjogXCIgKyB0aGlzLnRhcmdldFRpbWUgKyBcIlxcblNUQVRFOiBcIiArIHRoaXMuc3RhdGUgKyBcIiAoXCIgKyB0aGlzLmFjdGl2ZSArIFwifFwiICsgdGhpcy5leHBpcmVkICsgXCIpXFxuXCIgKyBwcm9nYmFyKHRoaXMuY3VycmVudFRpbWUsIHRoaXMudGFyZ2V0VGltZSk7XG4gIH07XG4gIFRpbWVyLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnVwZGF0ZSjOlHQpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gVGltZXI7XG59KCkpO1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nJChzdHIsIG4pe1xuICBmb3IgKHZhciByID0gJyc7IG4gPiAwOyAobiA+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHIgKz0gc3RyO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
