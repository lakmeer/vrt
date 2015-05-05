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
  var p2m, gameOpts, renderOpts, inputHandler, gameState, tetrisGame, renderer, debugOutput, testEasing, frameDriver;
  p2m = (function(it){
    return it * 1.6 / 2048;
  });
  gameOpts = {
    tileWidth: 10,
    tileHeight: 20,
    timeFactor: 1
  };
  renderOpts = {
    unitsPerMeter: 1,
    gridSize: 0.07,
    blockSize: 0.066,
    deskSize: [1.6, 0.8, 0.1],
    cameraDistanceFromEdge: 0.2,
    cameraElevation: 0.5,
    hardDropJoltAmount: 0.03,
    zapParticleSize: 0.008,
    arenaOffsetFromCentre: 0.085,
    arenaDistanceFromEdge: 0.57,
    scoreDistanceFromEdge: p2m(419),
    scoreOffsetFromCentre: p2m(55),
    scoreTubeRadius: p2m(63),
    scoreBaseRadius: p2m(86.5),
    scoreTubeHeight: p2m(200),
    previewDomeRadius: p2m(104),
    previewDomeHeight: 0.20,
    previewDistanceFromEdge: p2m(327),
    previewDistanceFromCenter: p2m(487),
    previewScaleFactor: 0.5
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
  return frameDriver.start();
});
},{"./game":9,"./renderer":29,"./utils/debug-output":35,"./utils/frame-driver":36,"./utils/game-state":37,"./utils/input-handler":38,"./utils/timer":39,"std":34}],2:[function(require,module,exports){
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
},{"std":34}],8:[function(require,module,exports){
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
},{"./data/brick-shapes":6,"std":34}],9:[function(require,module,exports){
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
          gs.timers.removalAnimation.reset(Core.animationTimeForRows(gs.rowsToRemove));
          lresult$.push(Core.computeScore(gs.score, gs.rowsToRemove));
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
},{"./fail-menu":7,"./game-core":8,"./start-menu":10,"std":34}],10:[function(require,module,exports){
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
},{"std":34}],11:[function(require,module,exports){
var ref$, id, log, pi, rand, floor, Base, Materials, ArenaCells, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, rand = ref$.rand, floor = ref$.floor;
Base = require('./base').Base;
Materials = require('../mats');
out$.ArenaCells = ArenaCells = (function(superclass){
  var prototype = extend$((import$(ArenaCells, superclass).displayName = 'ArenaCells', ArenaCells), superclass).prototype, constructor = ArenaCells;
  function ArenaCells(opts, gs){
    var blockSize, gridSize, width, height, boxGeo, ref$, res$, i$, len$, y, row, lresult$, j$, len1$, x, cell, cube;
    blockSize = opts.blockSize, gridSize = opts.gridSize;
    ArenaCells.superclass.apply(this, arguments);
    width = gridSize * gs.arena.width;
    height = gridSize * gs.arena.height;
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
},{"../mats":30,"./base":13,"std":34}],12:[function(require,module,exports){
var ref$, id, log, max, rand, Base, Frame, FallingBrick, GuideLines, ArenaCells, ParticleEffect, Arena, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, max = ref$.max, rand = ref$.rand;
Base = require('./base').Base;
Frame = require('./frame').Frame;
FallingBrick = require('./falling-brick').FallingBrick;
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
    var arena, brick;
    arena = gs.arena, brick = gs.brick;
    this.parts.arenaCells.updateCells(arena.cells);
    this.parts.thisBrick.displayShape(brick.current);
    this.parts.thisBrick.updatePosition(brick.current.pos);
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
},{"./arena-cells":11,"./base":13,"./falling-brick":17,"./frame":18,"./guide-lines":19,"./particle-effect":23,"std":34}],13:[function(require,module,exports){
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
},{"../mats":30,"std":34}],14:[function(require,module,exports){
var ref$, id, log, sin, Base, Brick, BrickPreview, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, sin = ref$.sin;
Base = require('./base').Base;
Brick = require('./brick').Brick;
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
    var s, tubeRadius, tubeHeight;
    this.opts = opts;
    BrickPreview.superclass.apply(this, arguments);
    s = this.opts.previewScaleFactor;
    tubeRadius = this.opts.previewDomeRadius;
    tubeHeight = this.opts.previewDomeHeight;
    this.brick = new Brick(this.opts, gs);
    this.brick.root.scale.set(s, s, s);
    this.brick.root.position.y = this.opts.gridSize * 2;
    this.brick.root.position.x = 0;
    this.dome = new THREE.Mesh(new THREE.CapsuleGeometry(tubeRadius, 16, tubeHeight, 0), glassMat);
    this.dome.position.y = tubeHeight;
    this.base = void 8;
    this.registration.add(this.dome);
    this.registration.add(this.brick.root);
  }
  prototype.displayNothing = function(){
    return this.brick.visible = false;
  };
  prototype.displayShape = function(brick){
    this.brick.visible = true;
    return this.brick.prettyDisplayShape(brick);
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
},{"./base":13,"./brick":15,"std":34}],15:[function(require,module,exports){
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
},{"../mats":30,"./base":13,"std":34}],16:[function(require,module,exports){
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
},{"./base":13,"std":34}],17:[function(require,module,exports){
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
},{"./base":13,"./brick":15,"std":34}],18:[function(require,module,exports){
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
},{"./base":13,"std":34}],19:[function(require,module,exports){
var ref$, id, log, floor, Base, Materials, GuideLines, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
Base = require('./base').Base;
Materials = require('../mats');
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
      line = new THREE.Line(mesh, Materials.lines[i]);
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
      line.material = Materials.lines[0];
    }
    for (i$ = 0, len$ = (ref$ = brick.shape).length; i$ < len$; ++i$) {
      y = i$;
      row = ref$[i$];
      lresult$ = [];
      for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
        x = j$;
        cell = row[j$];
        if (cell) {
          lresult$.push(this.lines[brick.pos[0] + x].material = Materials.lines[cell]);
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
      results$.push(line.material = Materials.lines[(i + floor(time / 100)) % 8]);
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
},{"../mats":30,"./base":13,"std":34}],20:[function(require,module,exports){
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
},{"./arena":12,"./brick-preview":14,"./fail-screen":16,"./lighting":21,"./nixie":22,"./start-menu":24,"./table":25,"./title":26}],21:[function(require,module,exports){
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
},{"./base":13,"std":34}],22:[function(require,module,exports){
var ref$, id, sin, lerp, log, floor, map, split, pi, tau, Base, CapsuleGeometry, Materials, NixieTube, NixieDisplay, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
ref$ = require('std'), id = ref$.id, sin = ref$.sin, lerp = ref$.lerp, log = ref$.log, floor = ref$.floor, map = ref$.map, split = ref$.split, pi = ref$.pi, tau = ref$.tau;
Base = require('./base').Base;
CapsuleGeometry = require('../geometry/capsule').CapsuleGeometry;
Materials = require('../mats');
NixieTube = (function(superclass){
  var prototype = extend$((import$(NixieTube, superclass).displayName = 'NixieTube', NixieTube), superclass).prototype, constructor = NixieTube;
  function NixieTube(opts, gs){
    var tubeRadius, tubeHeight, baseRadius, baseHeight, bgGeo, baseGeo, res$, i$, ref$, len$, ix, i, quad;
    this.opts = opts;
    NixieTube.superclass.apply(this, arguments);
    tubeRadius = this.opts.scoreTubeRadius;
    tubeHeight = this.opts.scoreTubeHeight;
    baseRadius = this.opts.scoreBaseRadius;
    baseHeight = this.opts.scoreTubeHeight / 10;
    bgGeo = new THREE.PlaneGeometry(tubeRadius * 1.5, tubeRadius * 3);
    baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 6, 0);
    baseGeo.applyMatrix(new THREE.Matrix4().makeRotationY(pi / 6));
    this.intensity = 0;
    this.glass = new THREE.Mesh(new THREE.CapsuleGeometry(tubeRadius, 16, tubeHeight, 0), Materials.glass);
    this.base = new THREE.Mesh(baseGeo, Materials.copper);
    this.bg = new THREE.Mesh(bgGeo, Materials.nixieBg);
    this.glass.position.y = tubeHeight;
    this.bg.position.y = tubeHeight / 2;
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
    this.light = new THREE.PointLight('orange', 0.3, 0.3);
    this.light.position.y = this.opts.scoreTubeHeight / 2;
    this.registration.add(this.glass);
    this.registration.add(this.base);
    this.registration.add(this.bg);
    this.registration.add(this.light);
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
    return this.digits.map(function(it){
      return it.visible = it.digit === digit;
    });
  };
  prototype.createDigitQuad = function(digit, ix){
    var geom, quad;
    geom = new THREE.PlaneBufferGeometry(this.opts.scoreTubeRadius * 1.5, this.opts.scoreTubeRadius * 3);
    return quad = new THREE.Mesh(geom, Materials.nixieDigits[digit]);
  };
  return NixieTube;
}(Base));
out$.NixieDisplay = NixieDisplay = (function(superclass){
  var prototype = extend$((import$(NixieDisplay, superclass).displayName = 'NixieDisplay', NixieDisplay), superclass).prototype, constructor = NixieDisplay;
  function NixieDisplay(opts, gs){
    var offset, baseRadius, res$, i$, to$, i, tube;
    this.opts = opts;
    NixieDisplay.superclass.apply(this, arguments);
    offset = this.opts.scoreOffsetFromCentre + this.opts.scoreBaseRadius;
    baseRadius = this.opts.scoreBaseRadius;
    this.count = 5;
    this.state = {
      lastSeenNumber: 0
    };
    res$ = [];
    for (i$ = 0, to$ = this.count; i$ < to$; ++i$) {
      i = i$;
      tube = new NixieTube(this.opts, gs);
      tube.position.x = offset + i * this.opts.scoreBaseRadius * 2;
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
},{"../geometry/capsule":28,"../mats":30,"./base":13,"std":34}],23:[function(require,module,exports){
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
},{"../palette":31,"./base":13,"std":34}],24:[function(require,module,exports){
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
},{"./base":13,"./title":26,"std":34}],25:[function(require,module,exports){
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
},{"../mats":30,"./base":13,"std":34}],26:[function(require,module,exports){
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
    var blockSize, gridSize, text, margin, height, blockGeo, i$, len$, y, row, j$, len1$, x, cell, box, bbox;
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
},{"../mats":30,"./base":13,"std":34}],27:[function(require,module,exports){
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
},{"std":34}],28:[function(require,module,exports){
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
},{"std":34}],29:[function(require,module,exports){
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
      rows = gs.rowsToRemove.length;
      p = gs.timers.removalAnimation.progress;
      gs.slowdown = 1 + Ease.expIn(p, 10, 0);
      this.parts.arena.zapLines(gs, this.jitter.position);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
      this.parts.score.runToNumber(gs.timers.removalAnimation.progress, gs.score.points);
      this.parts.score.pulse(gs.elapsedTime / 1000);
      break;
    case 'game':
      gs.slowdown = 1;
      this.parts.arena.update(gs, this.jitter.position);
      this.parts.nextBrick.displayShape(gs.brick.next);
      this.parts.nextBrick.updateWiggle(gs, gs.elapsedTime);
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
},{"../../lib/trackball-controls.js":5,"./components":20,"./debug-camera":27,"./palette":31,"./scene-manager":32,"std":34,"three-js-vr-extensions":4}],30:[function(require,module,exports){
var ref$, id, log, sin, Palette, assetPath, textures, i, glass, copper, nixieDigits, nixieBg, blocks, color, holoBlocks, zap, tableTop, tableEdge, tableFaces, lines, debugWireframe, helperA, helperB, out$ = typeof exports != 'undefined' && exports || this;
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
  tableTopSpecular: THREE.ImageUtils.loadTexture(assetPath("board.spec.png"))
};
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
},{"./palette":31,"std":34}],31:[function(require,module,exports){
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
},{"std":34,"three-js-vr-extensions":4}],32:[function(require,module,exports){
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
    this.root = new THREE.Object3D;
    this.registration = new THREE.Object3D;
    this.effect = new THREE.VREffect(this.renderer);
    this.effect.setSize(window.innerWidth - 1, window.innerHeight - 1);
    window.addEventListener('keydown', this.zeroSensor, true);
    window.addEventListener('resize', this.resize, false);
    document.body.addEventListener('dblclick', this.goFullscreen);
    this.state = {
      vrMode: navigator.getVRDevices != null
    };
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
},{"./mats":30,"std":34,"three-js-vr-extensions":4}],33:[function(require,module,exports){
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
},{"std":34}],34:[function(require,module,exports){
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
},{"./easing":33}],35:[function(require,module,exports){
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
},{"std":34}],36:[function(require,module,exports){
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
},{"std":34}],37:[function(require,module,exports){
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
},{"./timer":39,"std":34}],38:[function(require,module,exports){
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
},{"./timer":39,"std":34}],39:[function(require,module,exports){
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
},{"std":34}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJDb250cm9scy5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJFZmZlY3QuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi90cmFja2JhbGwtY29udHJvbHMuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZmFpbC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9zdGFydC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2Jhc2UubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9icmljay5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWlsLXNjcmVlbi5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWxsaW5nLWJyaWNrLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2ZyYW1lLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2d1aWRlLWxpbmVzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2xpZ2h0aW5nLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL25peGllLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL3BhcnRpY2xlLWVmZmVjdC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9zdGFydC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL3RhYmxlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL3RpdGxlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9kZWJ1Zy1jYW1lcmEubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2dlb21ldHJ5L2NhcHN1bGUubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9tYXRzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9wYWxldHRlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9zY2VuZS1tYW5hZ2VyLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9zdGQvZWFzaW5nLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9zdGQvaW5kZXgubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3V0aWxzL2RlYnVnLW91dHB1dC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvZnJhbWUtZHJpdmVyLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9nYW1lLXN0YXRlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9pbnB1dC1oYW5kbGVyLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy90aW1lci5scyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBUaW1lciwgR2FtZVN0YXRlLCBEZWJ1Z091dHB1dCwgVGV0cmlzR2FtZSwgVGhyZWVKc1JlbmRlcmVyO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5O1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi91dGlscy9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3V0aWxzL3RpbWVyJykuVGltZXI7XG5HYW1lU3RhdGUgPSByZXF1aXJlKCcuL3V0aWxzL2dhbWUtc3RhdGUnKS5HYW1lU3RhdGU7XG5EZWJ1Z091dHB1dCA9IHJlcXVpcmUoJy4vdXRpbHMvZGVidWctb3V0cHV0JykuRGVidWdPdXRwdXQ7XG5UZXRyaXNHYW1lID0gcmVxdWlyZSgnLi9nYW1lJykuVGV0cmlzR2FtZTtcblRocmVlSnNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXInKS5UaHJlZUpzUmVuZGVyZXI7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcbiAgdmFyIHAybSwgZ2FtZU9wdHMsIHJlbmRlck9wdHMsIGlucHV0SGFuZGxlciwgZ2FtZVN0YXRlLCB0ZXRyaXNHYW1lLCByZW5kZXJlciwgZGVidWdPdXRwdXQsIHRlc3RFYXNpbmcsIGZyYW1lRHJpdmVyO1xuICBwMm0gPSAoZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdCAqIDEuNiAvIDIwNDg7XG4gIH0pO1xuICBnYW1lT3B0cyA9IHtcbiAgICB0aWxlV2lkdGg6IDEwLFxuICAgIHRpbGVIZWlnaHQ6IDIwLFxuICAgIHRpbWVGYWN0b3I6IDFcbiAgfTtcbiAgcmVuZGVyT3B0cyA9IHtcbiAgICB1bml0c1Blck1ldGVyOiAxLFxuICAgIGdyaWRTaXplOiAwLjA3LFxuICAgIGJsb2NrU2l6ZTogMC4wNjYsXG4gICAgZGVza1NpemU6IFsxLjYsIDAuOCwgMC4xXSxcbiAgICBjYW1lcmFEaXN0YW5jZUZyb21FZGdlOiAwLjIsXG4gICAgY2FtZXJhRWxldmF0aW9uOiAwLjUsXG4gICAgaGFyZERyb3BKb2x0QW1vdW50OiAwLjAzLFxuICAgIHphcFBhcnRpY2xlU2l6ZTogMC4wMDgsXG4gICAgYXJlbmFPZmZzZXRGcm9tQ2VudHJlOiAwLjA4NSxcbiAgICBhcmVuYURpc3RhbmNlRnJvbUVkZ2U6IDAuNTcsXG4gICAgc2NvcmVEaXN0YW5jZUZyb21FZGdlOiBwMm0oNDE5KSxcbiAgICBzY29yZU9mZnNldEZyb21DZW50cmU6IHAybSg1NSksXG4gICAgc2NvcmVUdWJlUmFkaXVzOiBwMm0oNjMpLFxuICAgIHNjb3JlQmFzZVJhZGl1czogcDJtKDg2LjUpLFxuICAgIHNjb3JlVHViZUhlaWdodDogcDJtKDIwMCksXG4gICAgcHJldmlld0RvbWVSYWRpdXM6IHAybSgxMDQpLFxuICAgIHByZXZpZXdEb21lSGVpZ2h0OiAwLjIwLFxuICAgIHByZXZpZXdEaXN0YW5jZUZyb21FZGdlOiBwMm0oMzI3KSxcbiAgICBwcmV2aWV3RGlzdGFuY2VGcm9tQ2VudGVyOiBwMm0oNDg3KSxcbiAgICBwcmV2aWV3U2NhbGVGYWN0b3I6IDAuNVxuICB9O1xuICBpbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xuICBnYW1lU3RhdGUgPSBuZXcgR2FtZVN0YXRlKGdhbWVPcHRzKTtcbiAgdGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lKGdhbWVTdGF0ZSk7XG4gIHJlbmRlcmVyID0gbmV3IFRocmVlSnNSZW5kZXJlcihyZW5kZXJPcHRzLCBnYW1lU3RhdGUpO1xuICByZW5kZXJlci5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcbiAgZGVidWdPdXRwdXQgPSBuZXcgRGVidWdPdXRwdXQ7XG4gIElucHV0SGFuZGxlci5vbigxOTIsIGZ1bmN0aW9uKCl7XG4gICAgaWYgKGZyYW1lRHJpdmVyLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJldHVybiBmcmFtZURyaXZlci5zdG9wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xuICAgIH1cbiAgfSk7XG4gIHRlc3RFYXNpbmcgPSBmdW5jdGlvbigpe1xuICAgIHZhciBFYXNlLCBpJCwgcmVmJCwgbGVuJCwgZWwsIGVhc2VOYW1lLCBlYXNlLCBscmVzdWx0JCwgY252LCBjdHgsIGksIHAsIHJlc3VsdHMkID0gW107XG4gICAgRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2NhbnZhcycpKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgZWwgPSByZWYkW2kkXTtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICAgIGZvciAoZWFzZU5hbWUgaW4gRWFzZSkge1xuICAgICAgZWFzZSA9IEVhc2VbZWFzZU5hbWVdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGNudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgY252LndpZHRoID0gMjAwO1xuICAgICAgY252LmhlaWdodCA9IDIwMDtcbiAgICAgIGNudi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3doaXRlJztcbiAgICAgIGNudi5zdHlsZS5ib3JkZXJMZWZ0ID0gXCIzcHggc29saWQgYmxhY2tcIjtcbiAgICAgIGN0eCA9IGNudi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjbnYpO1xuICAgICAgY3R4LmZvbnQgPSBcIjE0cHggbW9ub3NwYWNlXCI7XG4gICAgICBjdHguZmlsbFRleHQoZWFzZU5hbWUsIDIsIDE2LCAyMDApO1xuICAgICAgZm9yIChpJCA9IDA7IGkkIDw9IDEwMDsgKytpJCkge1xuICAgICAgICBpID0gaSQ7XG4gICAgICAgIHAgPSBpIC8gMTAwO1xuICAgICAgICBscmVzdWx0JC5wdXNoKGN0eC5maWxsUmVjdCgyICogaSwgMjAwIC0gZWFzZShwLCAwLCAyMDApLCAyLCAyKSk7XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBmcmFtZURyaXZlciA9IG5ldyBGcmFtZURyaXZlcihmdW5jdGlvbijOlHQsIHRpbWUsIGZyYW1lKXtcbiAgICBnYW1lU3RhdGUuzpR0ID0gzpR0IC8gZ2FtZU9wdHMudGltZUZhY3RvciAvIGdhbWVTdGF0ZS5zbG93ZG93bjtcbiAgICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lIC8gZ2FtZU9wdHMudGltZUZhY3RvcjtcbiAgICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICAgIGdhbWVTdGF0ZS5pbnB1dFN0YXRlID0gaW5wdXRIYW5kbGVyLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSgpO1xuICAgIFRpbWVyLnVwZGF0ZUFsbChnYW1lU3RhdGUuzpR0KTtcbiAgICBnYW1lU3RhdGUgPSB0ZXRyaXNHYW1lLnJ1bkZyYW1lKGdhbWVTdGF0ZSwgZ2FtZVN0YXRlLs6UdCk7XG4gICAgcmVuZGVyZXIucmVuZGVyKGdhbWVTdGF0ZSwgcmVuZGVyT3B0cyk7XG4gICAgaWYgKGRlYnVnT3V0cHV0KSB7XG4gICAgICByZXR1cm4gZGVidWdPdXRwdXQucmVuZGVyKGdhbWVTdGF0ZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG59KTsiLCIvKipcbiAqIEBhdXRob3IgZG1hcmNvcyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9kbWFyY29zXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKi9cblxuVEhSRUUuVlJDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCBvbkVycm9yICkge1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cdHZhciB2cklucHV0cyA9IFtdO1xuXG5cdGZ1bmN0aW9uIGZpbHRlckludmFsaWREZXZpY2VzKCBkZXZpY2VzICkge1xuXG5cdFx0Ly8gRXhjbHVkZSBDYXJkYm9hcmQgcG9zaXRpb24gc2Vuc29yIGlmIE9jdWx1cyBleGlzdHMuXG5cdFx0dmFyIG9jdWx1c0RldmljZXMgPSBkZXZpY2VzLmZpbHRlciggZnVuY3Rpb24gKCBkZXZpY2UgKSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlLmRldmljZU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdvY3VsdXMnKSAhPT0gLTE7XG5cdFx0fSApO1xuXG5cdFx0aWYgKCBvY3VsdXNEZXZpY2VzLmxlbmd0aCA+PSAxICkge1xuXHRcdFx0cmV0dXJuIGRldmljZXMuZmlsdGVyKCBmdW5jdGlvbiAoIGRldmljZSApIHtcblx0XHRcdFx0cmV0dXJuIGRldmljZS5kZXZpY2VOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY2FyZGJvYXJkJykgPT09IC0xO1xuXHRcdFx0fSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlcztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnb3RWUkRldmljZXMoIGRldmljZXMgKSB7XG5cdFx0ZGV2aWNlcyA9IGZpbHRlckludmFsaWREZXZpY2VzKCBkZXZpY2VzICk7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZGV2aWNlcy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHRpZiAoIGRldmljZXNbIGkgXSBpbnN0YW5jZW9mIFBvc2l0aW9uU2Vuc29yVlJEZXZpY2UgKSB7XG5cdFx0XHRcdHZySW5wdXRzLnB1c2goIGRldmljZXNbIGkgXSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggb25FcnJvciApIG9uRXJyb3IoICdITUQgbm90IGF2YWlsYWJsZScgKTtcblx0fVxuXG5cdGlmICggbmF2aWdhdG9yLmdldFZSRGV2aWNlcyApIHtcblx0XHRuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzKCkudGhlbiggZ290VlJEZXZpY2VzICk7XG5cdH1cblxuXHQvLyB0aGUgUmlmdCBTREsgcmV0dXJucyB0aGUgcG9zaXRpb24gaW4gbWV0ZXJzXG5cdC8vIHRoaXMgc2NhbGUgZmFjdG9yIGFsbG93cyB0aGUgdXNlciB0byBkZWZpbmUgaG93IG1ldGVyc1xuXHQvLyBhcmUgY29udmVydGVkIHRvIHNjZW5lIHVuaXRzLlxuXG5cdHRoaXMuc2NhbGUgPSAxO1xuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2cklucHV0cy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHR2YXIgdnJJbnB1dCA9IHZySW5wdXRzWyBpIF07XG5cdFx0XHR2YXIgc3RhdGUgPSB2cklucHV0LmdldFN0YXRlKCk7XG5cblx0XHRcdGlmICggc3RhdGUub3JpZW50YXRpb24gIT09IG51bGwgKSB7XG5cdFx0XHRcdG9iamVjdC5xdWF0ZXJuaW9uLmNvcHkoIHN0YXRlLm9yaWVudGF0aW9uICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggc3RhdGUucG9zaXRpb24gIT09IG51bGwgKSB7XG5cdFx0XHRcdG9iamVjdC5wb3NpdGlvbi5jb3B5KCBzdGF0ZS5wb3NpdGlvbiApLm11bHRpcGx5U2NhbGFyKCBzY29wZS5zY2FsZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnJlc2V0U2Vuc29yID0gZnVuY3Rpb24gKCkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHZySW5wdXRzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdHZhciB2cklucHV0ID0gdnJJbnB1dHNbIGkgXTtcblxuXHRcdFx0aWYgKCB2cklucHV0LnJlc2V0U2Vuc29yICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHZySW5wdXQucmVzZXRTZW5zb3IoKTtcblx0XHRcdH0gZWxzZSBpZiAoIHZySW5wdXQuemVyb1NlbnNvciAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR2cklucHV0Lnplcm9TZW5zb3IoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dGhpcy56ZXJvU2Vuc29yID0gZnVuY3Rpb24gKCkge1xuXHRcdFRIUkVFLndhcm4oICdUSFJFRS5WUkNvbnRyb2xzOiAuemVyb1NlbnNvcigpIGlzIG5vdyAucmVzZXRTZW5zb3IoKS4nICk7XG5cdFx0dGhpcy5yZXNldFNlbnNvcigpO1xuXHR9O1xuXG59O1xuXG4iLCJcbi8qKlxuICogQGF1dGhvciBkbWFyY29zIC8gaHR0cHM6Ly9naXRodWIuY29tL2RtYXJjb3NcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqXG4gKiBXZWJWUiBTcGVjOiBodHRwOi8vbW96dnIuZ2l0aHViLmlvL3dlYnZyLXNwZWMvd2VidnIuaHRtbFxuICpcbiAqIEZpcmVmb3g6IGh0dHA6Ly9tb3p2ci5jb20vZG93bmxvYWRzL1xuICogQ2hyb21pdW06IGh0dHBzOi8vZHJpdmUuZ29vZ2xlLmNvbS9mb2xkZXJ2aWV3P2lkPTBCenVkTHQyMkJxR1JiVzlXVEhNdE9XTXpOalEmdXNwPXNoYXJpbmcjbGlzdFxuICpcbiAqL1xuXG5USFJFRS5WUkVmZmVjdCA9IGZ1bmN0aW9uICggcmVuZGVyZXIsIG9uRXJyb3IgKSB7XG5cblx0dmFyIHZySE1EO1xuXHR2YXIgZXllVHJhbnNsYXRpb25MLCBleWVGT1ZMO1xuXHR2YXIgZXllVHJhbnNsYXRpb25SLCBleWVGT1ZSO1xuXG5cdGZ1bmN0aW9uIGdvdFZSRGV2aWNlcyggZGV2aWNlcyApIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdGlmICggZGV2aWNlc1sgaSBdIGluc3RhbmNlb2YgSE1EVlJEZXZpY2UgKSB7XG5cdFx0XHRcdHZySE1EID0gZGV2aWNlc1sgaSBdO1xuXG5cdFx0XHRcdGlmICggdnJITUQuZ2V0RXllUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHZhciBleWVQYXJhbXNMID0gdnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ2xlZnQnICk7XG5cdFx0XHRcdFx0dmFyIGV5ZVBhcmFtc1IgPSB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAncmlnaHQnICk7XG5cblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvbkwgPSBleWVQYXJhbXNMLmV5ZVRyYW5zbGF0aW9uO1xuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uUiA9IGV5ZVBhcmFtc1IuZXllVHJhbnNsYXRpb247XG5cdFx0XHRcdFx0ZXllRk9WTCA9IGV5ZVBhcmFtc0wucmVjb21tZW5kZWRGaWVsZE9mVmlldztcblx0XHRcdFx0XHRleWVGT1ZSID0gZXllUGFyYW1zUi5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIFRPRE86IFRoaXMgaXMgYW4gb2xkZXIgY29kZSBwYXRoIGFuZCBub3Qgc3BlYyBjb21wbGlhbnQuXG5cdFx0XHRcdFx0Ly8gSXQgc2hvdWxkIGJlIHJlbW92ZWQgYXQgc29tZSBwb2ludCBpbiB0aGUgbmVhciBmdXR1cmUuXG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25MID0gdnJITUQuZ2V0RXllVHJhbnNsYXRpb24oICdsZWZ0JyApO1xuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uUiA9IHZySE1ELmdldEV5ZVRyYW5zbGF0aW9uKCAncmlnaHQnICk7XG5cdFx0XHRcdFx0ZXllRk9WTCA9IHZySE1ELmdldFJlY29tbWVuZGVkRXllRmllbGRPZlZpZXcoICdsZWZ0JyApO1xuXHRcdFx0XHRcdGV5ZUZPVlIgPSB2ckhNRC5nZXRSZWNvbW1lbmRlZEV5ZUZpZWxkT2ZWaWV3KCAncmlnaHQnICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7IC8vIFdlIGtlZXAgdGhlIGZpcnN0IHdlIGVuY291bnRlclxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggdnJITUQgPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdGlmICggb25FcnJvciApIG9uRXJyb3IoICdITUQgbm90IGF2YWlsYWJsZScgKTtcblx0XHR9XG5cblx0fVxuXG5cdGlmICggbmF2aWdhdG9yLmdldFZSRGV2aWNlcyApIHtcblx0XHRuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzKCkudGhlbiggZ290VlJEZXZpY2VzICk7XG5cdH1cblxuXHQvL1xuXG5cdHRoaXMuc2NhbGUgPSAxO1xuXHR0aGlzLnNldFNpemUgPSBmdW5jdGlvbiggd2lkdGgsIGhlaWdodCApIHtcblx0XHRyZW5kZXJlci5zZXRTaXplKCB3aWR0aCwgaGVpZ2h0ICk7XG5cdH07XG5cblx0Ly8gZnVsbHNjcmVlblxuXG5cdHZhciBpc0Z1bGxzY3JlZW4gPSBmYWxzZTtcblx0dmFyIGNhbnZhcyA9IHJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cdHZhciBmdWxsc2NyZWVuY2hhbmdlID0gY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuID8gJ21vemZ1bGxzY3JlZW5jaGFuZ2UnIDogJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnO1xuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIGZ1bGxzY3JlZW5jaGFuZ2UsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0aXNGdWxsc2NyZWVuID0gZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQ7XG5cdH0sIGZhbHNlICk7XG5cblx0dGhpcy5zZXRGdWxsU2NyZWVuID0gZnVuY3Rpb24gKCBib29sZWFuICkge1xuXHRcdGlmICggdnJITUQgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblx0XHRpZiAoIGlzRnVsbHNjcmVlbiA9PT0gYm9vbGVhbiApIHJldHVybjtcblx0XHRpZiAoIGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiApIHtcblx0XHRcdGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiggeyB2ckRpc3BsYXk6IHZySE1EIH0gKTtcblx0XHR9IGVsc2UgaWYgKCBjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4gKSB7XG5cdFx0XHRjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oIHsgdnJEaXNwbGF5OiB2ckhNRCB9ICk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIHJlbmRlclxuXHR2YXIgY2FtZXJhTCA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuXHR2YXIgY2FtZXJhUiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuXG5cdHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhICkge1xuXHRcdGlmICggdnJITUQgKSB7XG5cdFx0XHR2YXIgc2NlbmVMLCBzY2VuZVI7XG5cblx0XHRcdGlmICggc2NlbmUgaW5zdGFuY2VvZiBBcnJheSApIHtcblx0XHRcdFx0c2NlbmVMID0gc2NlbmVbIDAgXTtcblx0XHRcdFx0c2NlbmVSID0gc2NlbmVbIDEgXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNjZW5lTCA9IHNjZW5lO1xuXHRcdFx0XHRzY2VuZVIgPSBzY2VuZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNpemUgPSByZW5kZXJlci5nZXRTaXplKCk7XG5cdFx0XHRzaXplLndpZHRoIC89IDI7XG5cblx0XHRcdHJlbmRlcmVyLmVuYWJsZVNjaXNzb3JUZXN0KCB0cnVlICk7XG5cdFx0XHRyZW5kZXJlci5jbGVhcigpO1xuXG5cdFx0XHRpZiAoIGNhbWVyYS5wYXJlbnQgPT09IHVuZGVmaW5lZCApIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG5cdFx0XHRjYW1lcmFMLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIGV5ZUZPVkwsIHRydWUsIGNhbWVyYS5uZWFyLCBjYW1lcmEuZmFyICk7XG5cdFx0XHRjYW1lcmFSLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIGV5ZUZPVlIsIHRydWUsIGNhbWVyYS5uZWFyLCBjYW1lcmEuZmFyICk7XG5cblx0XHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYUwucG9zaXRpb24sIGNhbWVyYUwucXVhdGVybmlvbiwgY2FtZXJhTC5zY2FsZSApO1xuXHRcdFx0Y2FtZXJhLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggY2FtZXJhUi5wb3NpdGlvbiwgY2FtZXJhUi5xdWF0ZXJuaW9uLCBjYW1lcmFSLnNjYWxlICk7XG5cblx0XHRcdGNhbWVyYUwudHJhbnNsYXRlWCggZXllVHJhbnNsYXRpb25MLnggKiB0aGlzLnNjYWxlICk7XG5cdFx0XHRjYW1lcmFSLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uUi54ICogdGhpcy5zY2FsZSApO1xuXG5cdFx0XHQvLyByZW5kZXIgbGVmdCBleWVcblx0XHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmVMLCBjYW1lcmFMICk7XG5cblx0XHRcdC8vIHJlbmRlciByaWdodCBleWVcblx0XHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIuc2V0U2Npc3Nvciggc2l6ZS53aWR0aCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmVSLCBjYW1lcmFSICk7XG5cblx0XHRcdHJlbmRlcmVyLmVuYWJsZVNjaXNzb3JUZXN0KCBmYWxzZSApO1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHQvLyBSZWd1bGFyIHJlbmRlciBtb2RlIGlmIG5vdCBITURcblxuXHRcdGlmICggc2NlbmUgaW5zdGFuY2VvZiBBcnJheSApIHNjZW5lID0gc2NlbmVbIDAgXTtcblxuXHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xuXG5cdH07XG5cblx0Ly9cblxuXHRmdW5jdGlvbiBmb3ZUb05EQ1NjYWxlT2Zmc2V0KCBmb3YgKSB7XG5cblx0XHR2YXIgcHhzY2FsZSA9IDIuMCAvIChmb3YubGVmdFRhbiArIGZvdi5yaWdodFRhbik7XG5cdFx0dmFyIHB4b2Zmc2V0ID0gKGZvdi5sZWZ0VGFuIC0gZm92LnJpZ2h0VGFuKSAqIHB4c2NhbGUgKiAwLjU7XG5cdFx0dmFyIHB5c2NhbGUgPSAyLjAgLyAoZm92LnVwVGFuICsgZm92LmRvd25UYW4pO1xuXHRcdHZhciBweW9mZnNldCA9IChmb3YudXBUYW4gLSBmb3YuZG93blRhbikgKiBweXNjYWxlICogMC41O1xuXHRcdHJldHVybiB7IHNjYWxlOiBbIHB4c2NhbGUsIHB5c2NhbGUgXSwgb2Zmc2V0OiBbIHB4b2Zmc2V0LCBweW9mZnNldCBdIH07XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdiwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICkge1xuXG5cdFx0cmlnaHRIYW5kZWQgPSByaWdodEhhbmRlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJpZ2h0SGFuZGVkO1xuXHRcdHpOZWFyID0gek5lYXIgPT09IHVuZGVmaW5lZCA/IDAuMDEgOiB6TmVhcjtcblx0XHR6RmFyID0gekZhciA9PT0gdW5kZWZpbmVkID8gMTAwMDAuMCA6IHpGYXI7XG5cblx0XHR2YXIgaGFuZGVkbmVzc1NjYWxlID0gcmlnaHRIYW5kZWQgPyAtMS4wIDogMS4wO1xuXG5cdFx0Ly8gc3RhcnQgd2l0aCBhbiBpZGVudGl0eSBtYXRyaXhcblx0XHR2YXIgbW9iaiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIG0gPSBtb2JqLmVsZW1lbnRzO1xuXG5cdFx0Ly8gYW5kIHdpdGggc2NhbGUvb2Zmc2V0IGluZm8gZm9yIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkc1xuXHRcdHZhciBzY2FsZUFuZE9mZnNldCA9IGZvdlRvTkRDU2NhbGVPZmZzZXQoZm92KTtcblxuXHRcdC8vIFggcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG5cdFx0bVswICogNCArIDBdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMF07XG5cdFx0bVswICogNCArIDFdID0gMC4wO1xuXHRcdG1bMCAqIDQgKyAyXSA9IHNjYWxlQW5kT2Zmc2V0Lm9mZnNldFswXSAqIGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzAgKiA0ICsgM10gPSAwLjA7XG5cblx0XHQvLyBZIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuXHRcdC8vIFkgb2Zmc2V0IGlzIG5lZ2F0ZWQgYmVjYXVzZSB0aGlzIHByb2ogbWF0cml4IHRyYW5zZm9ybXMgZnJvbSB3b3JsZCBjb29yZHMgd2l0aCBZPXVwLFxuXHRcdC8vIGJ1dCB0aGUgTkRDIHNjYWxpbmcgaGFzIFk9ZG93biAodGhhbmtzIEQzRD8pXG5cdFx0bVsxICogNCArIDBdID0gMC4wO1xuXHRcdG1bMSAqIDQgKyAxXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzFdO1xuXHRcdG1bMSAqIDQgKyAyXSA9IC1zY2FsZUFuZE9mZnNldC5vZmZzZXRbMV0gKiBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVsxICogNCArIDNdID0gMC4wO1xuXG5cdFx0Ly8gWiByZXN1bHQgKHVwIHRvIHRoZSBhcHApXG5cdFx0bVsyICogNCArIDBdID0gMC4wO1xuXHRcdG1bMiAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzIgKiA0ICsgMl0gPSB6RmFyIC8gKHpOZWFyIC0gekZhcikgKiAtaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMiAqIDQgKyAzXSA9ICh6RmFyICogek5lYXIpIC8gKHpOZWFyIC0gekZhcik7XG5cblx0XHQvLyBXIHJlc3VsdCAoPSBaIGluKVxuXHRcdG1bMyAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzMgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVszICogNCArIDJdID0gaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMyAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdG1vYmoudHJhbnNwb3NlKCk7XG5cblx0XHRyZXR1cm4gbW9iajtcblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlRvUHJvamVjdGlvbiggZm92LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKSB7XG5cblx0XHR2YXIgREVHMlJBRCA9IE1hdGguUEkgLyAxODAuMDtcblxuXHRcdHZhciBmb3ZQb3J0ID0ge1xuXHRcdFx0dXBUYW46IE1hdGgudGFuKCBmb3YudXBEZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0ZG93blRhbjogTWF0aC50YW4oIGZvdi5kb3duRGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdGxlZnRUYW46IE1hdGgudGFuKCBmb3YubGVmdERlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRyaWdodFRhbjogTWF0aC50YW4oIGZvdi5yaWdodERlZ3JlZXMgKiBERUcyUkFEIClcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdlBvcnQsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApO1xuXG5cdH1cblxufTtcbiIsIlxuLypcbiAqIE1velZSIEV4dGVuc2lvbnMgdG8gdGhyZWUuanNcbiAqXG4gKiBBIGJyb3dzZXJpZnkgd3JhcHBlciBmb3IgdGhlIFZSIGhlbHBlcnMgZnJvbSBNb3pWUidzIGdpdGh1YiByZXBvLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01velZSL3ZyLXdlYi1leGFtcGxlcy90cmVlL21hc3Rlci90aHJlZWpzLXZyLWJvaWxlcnBsYXRlXG4gKlxuICogVGhlIGV4dGVuc2lvbiBmaWxlcyBhcmUgbm90IG1vZHVsZSBjb21wYXRpYmxlIGFuZCB3b3JrIGJ5IGFwcGVuZGluZyB0byB0aGVcbiAqIFRIUkVFIG9iamVjdC4gRG8gdXNlIHRoZW0sIHdlIG1ha2UgdGhlIFRIUkVFIG9iamVjdCBnbG9iYWwsIGFuZCB0aGVuIG1ha2VcbiAqIGl0IHRoZSBleHBvcnQgdmFsdWUgb2YgdGhpcyBtb2R1bGUuXG4gKlxuICovXG5cbmNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ0xvYWRpbmcgTW96VlIgRXh0ZW5zaW9ucy4uLicpO1xuLy9yZXF1aXJlKCcuL1N0ZXJlb0VmZmVjdC5qcycpO1xuLy9jb25zb2xlLmxvZygnU3RlcmVvRWZmZWN0IC0gT0snKTtcblxucmVxdWlyZSgnLi9WUkNvbnRyb2xzLmpzJyk7XG5jb25zb2xlLmxvZygnVlJDb250cm9scyAtIE9LJyk7XG5cbnJlcXVpcmUoJy4vVlJFZmZlY3QuanMnKTtcbmNvbnNvbGUubG9nKCdWUkVmZmVjdCAtIE9LJyk7XG5cbmNvbnNvbGUuZ3JvdXBFbmQoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRTtcblxuIiwiLyoqXG4gKiBAYXV0aG9yIEViZXJoYXJkIEdyYWV0aGVyIC8gaHR0cDovL2VncmFldGhlci5jb20vXG4gKiBAYXV0aG9yIE1hcmsgTHVuZGluIFx0LyBodHRwOi8vbWFyay1sdW5kaW4uY29tXG4gKiBAYXV0aG9yIFNpbW9uZSBNYW5pbmkgLyBodHRwOi8vZGFyb24xMzM3LmdpdGh1Yi5pb1xuICogQGF1dGhvciBMdWNhIEFudGlnYSBcdC8gaHR0cDovL2xhbnRpZ2EuZ2l0aHViLmlvXG4gKi9cblxuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgdGFyZ2V0LCBkb21FbGVtZW50ICkge1xuXG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHZhciBTVEFURSA9IHsgTk9ORTogLTEsIFJPVEFURTogMCwgWk9PTTogMSwgUEFOOiAyLCBUT1VDSF9ST1RBVEU6IDMsIFRPVUNIX1pPT01fUEFOOiA0IH07XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHR0aGlzLnNjcmVlbiA9IHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cblx0dGhpcy5yb3RhdGVTcGVlZCA9IDEuMDtcblx0dGhpcy56b29tU3BlZWQgPSAxLjI7XG5cdHRoaXMucGFuU3BlZWQgPSAwLjM7XG5cblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLm5vUGFuID0gZmFsc2U7XG5cblx0dGhpcy5zdGF0aWNNb3ZpbmcgPSBmYWxzZTtcblx0dGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMjtcblxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdHRoaXMua2V5cyA9IFsgNjUgLypBKi8sIDgzIC8qUyovLCA2OCAvKkQqLyBdO1xuXG5cdC8vIGludGVybmFsc1xuXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0ID8gdGFyZ2V0LnBvc2l0aW9uIDogbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIF9zdGF0ZSA9IFNUQVRFLk5PTkUsXG5cdF9wcmV2U3RhdGUgPSBTVEFURS5OT05FLFxuXG5cdF9leWUgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXG5cdF9tb3ZlUHJldiA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF9tb3ZlQ3VyciA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cblx0X2xhc3RBeGlzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0X2xhc3RBbmdsZSA9IDAsXG5cblx0X3pvb21TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF96b29tRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblxuXHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IDAsXG5cdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IDAsXG5cblx0X3BhblN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X3BhbkVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0Ly8gZm9yIHJlc2V0XG5cblx0dGhpcy50YXJnZXQwID0gdGhpcy50YXJnZXQuY2xvbmUoKTtcblx0dGhpcy5wb3NpdGlvbjAgPSB0aGlzLm9iamVjdC5wb3NpdGlvbi5jbG9uZSgpO1xuXHR0aGlzLnVwMCA9IHRoaXMub2JqZWN0LnVwLmNsb25lKCk7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXHR2YXIgc3RhcnRFdmVudCA9IHsgdHlwZTogJ3N0YXJ0JyB9O1xuXHR2YXIgZW5kRXZlbnQgPSB7IHR5cGU6ICdlbmQnIH07XG5cblxuXHQvLyBtZXRob2RzXG5cblx0dGhpcy5oYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIHRoaXMuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgKSB7XG5cblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSAwO1xuXHRcdFx0dGhpcy5zY3JlZW4udG9wID0gMDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0XHR0aGlzLnNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR2YXIgYm94ID0gdGhpcy5kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0Ly8gYWRqdXN0bWVudHMgY29tZSBmcm9tIHNpbWlsYXIgY29kZSBpbiB0aGUganF1ZXJ5IG9mZnNldCgpIGZ1bmN0aW9uXG5cdFx0XHR2YXIgZCA9IHRoaXMuZG9tRWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSBib3gubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIGQuY2xpZW50TGVmdDtcblx0XHRcdHRoaXMuc2NyZWVuLnRvcCA9IGJveC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBkLmNsaWVudFRvcDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gYm94LndpZHRoO1xuXHRcdFx0dGhpcy5zY3JlZW4uaGVpZ2h0ID0gYm94LmhlaWdodDtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpc1sgZXZlbnQudHlwZSBdID09ICdmdW5jdGlvbicgKSB7XG5cblx0XHRcdHRoaXNbIGV2ZW50LnR5cGUgXSggZXZlbnQgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHZhciBnZXRNb3VzZU9uU2NyZWVuID0gKCBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBhZ2VYLCBwYWdlWSApIHtcblxuXHRcdFx0dmVjdG9yLnNldChcblx0XHRcdFx0KCBwYWdlWCAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyBfdGhpcy5zY3JlZW4ud2lkdGgsXG5cdFx0XHRcdCggcGFnZVkgLSBfdGhpcy5zY3JlZW4udG9wICkgLyBfdGhpcy5zY3JlZW4uaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gdmVjdG9yO1xuXG5cdFx0fTtcblxuXHR9KCkgKTtcblxuXHR2YXIgZ2V0TW91c2VPbkNpcmNsZSA9ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBwYWdlWCwgcGFnZVkgKSB7XG5cblx0XHRcdHZlY3Rvci5zZXQoXG5cdFx0XHRcdCggKCBwYWdlWCAtIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyAoIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSApICksXG5cdFx0XHRcdCggKCBfdGhpcy5zY3JlZW4uaGVpZ2h0ICsgMiAqICggX3RoaXMuc2NyZWVuLnRvcCAtIHBhZ2VZICkgKSAvIF90aGlzLnNjcmVlbi53aWR0aCApIC8vIHNjcmVlbi53aWR0aCBpbnRlbnRpb25hbFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHZlY3Rvcjtcblx0XHR9O1xuXG5cdH0oKSApO1xuXG5cdHRoaXMucm90YXRlQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0cXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCksXG5cdFx0XHRleWVEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRhbmdsZTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdG1vdmVEaXJlY3Rpb24uc2V0KCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54LCBfbW92ZUN1cnIueSAtIF9tb3ZlUHJldi55LCAwICk7XG5cdFx0XHRhbmdsZSA9IG1vdmVEaXJlY3Rpb24ubGVuZ3RoKCk7XG5cblx0XHRcdGlmICggYW5nbGUgKSB7XG5cblx0XHRcdFx0X2V5ZS5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKS5zdWIoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0XHRcdGV5ZURpcmVjdGlvbi5jb3B5KCBfZXllICkubm9ybWFsaXplKCk7XG5cdFx0XHRcdG9iamVjdFVwRGlyZWN0aW9uLmNvcHkoIF90aGlzLm9iamVjdC51cCApLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbi5jcm9zc1ZlY3RvcnMoIG9iamVjdFVwRGlyZWN0aW9uLCBleWVEaXJlY3Rpb24gKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRvYmplY3RVcERpcmVjdGlvbi5zZXRMZW5ndGgoIF9tb3ZlQ3Vyci55IC0gX21vdmVQcmV2LnkgKTtcblx0XHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24uc2V0TGVuZ3RoKCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54ICk7XG5cblx0XHRcdFx0bW92ZURpcmVjdGlvbi5jb3B5KCBvYmplY3RVcERpcmVjdGlvbi5hZGQoIG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uICkgKTtcblxuXHRcdFx0XHRheGlzLmNyb3NzVmVjdG9ycyggbW92ZURpcmVjdGlvbiwgX2V5ZSApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdGFuZ2xlICo9IF90aGlzLnJvdGF0ZVNwZWVkO1xuXHRcdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICk7XG5cblx0XHRcdFx0X2V5ZS5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblx0XHRcdFx0X3RoaXMub2JqZWN0LnVwLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXG5cdFx0XHRcdF9sYXN0QXhpcy5jb3B5KCBheGlzICk7XG5cdFx0XHRcdF9sYXN0QW5nbGUgPSBhbmdsZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRlbHNlIGlmICggIV90aGlzLnN0YXRpY01vdmluZyAmJiBfbGFzdEFuZ2xlICkge1xuXG5cdFx0XHRcdF9sYXN0QW5nbGUgKj0gTWF0aC5zcXJ0KCAxLjAgLSBfdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciApO1xuXHRcdFx0XHRfZXllLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApLnN1YiggX3RoaXMudGFyZ2V0ICk7XG5cdFx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSggX2xhc3RBeGlzLCBfbGFzdEFuZ2xlICk7XG5cdFx0XHRcdF9leWUuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cdFx0XHRcdF90aGlzLm9iamVjdC51cC5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfbW92ZVByZXYuY29weSggX21vdmVDdXJyICk7XG5cblx0XHR9O1xuXG5cdH0oKSk7XG5cblxuXHR0aGlzLnpvb21DYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZmFjdG9yO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlRPVUNIX1pPT01fUEFOICkge1xuXG5cdFx0XHRmYWN0b3IgPSBfdG91Y2hab29tRGlzdGFuY2VTdGFydCAvIF90b3VjaFpvb21EaXN0YW5jZUVuZDtcblx0XHRcdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gX3RvdWNoWm9vbURpc3RhbmNlRW5kO1xuXHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRmYWN0b3IgPSAxLjAgKyAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIF90aGlzLnpvb21TcGVlZDtcblxuXHRcdFx0aWYgKCBmYWN0b3IgIT09IDEuMCAmJiBmYWN0b3IgPiAwLjAgKSB7XG5cblx0XHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHRcdFx0aWYgKCBfdGhpcy5zdGF0aWNNb3ZpbmcgKSB7XG5cblx0XHRcdFx0XHRfem9vbVN0YXJ0LmNvcHkoIF96b29tRW5kICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF96b29tU3RhcnQueSArPSAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIHRoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3I7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnBhbkNhbWVyYSA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBtb3VzZUNoYW5nZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFx0XHRvYmplY3RVcCA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRwYW4gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0bW91c2VDaGFuZ2UuY29weSggX3BhbkVuZCApLnN1YiggX3BhblN0YXJ0ICk7XG5cblx0XHRcdGlmICggbW91c2VDaGFuZ2UubGVuZ3RoU3EoKSApIHtcblxuXHRcdFx0XHRtb3VzZUNoYW5nZS5tdWx0aXBseVNjYWxhciggX2V5ZS5sZW5ndGgoKSAqIF90aGlzLnBhblNwZWVkICk7XG5cblx0XHRcdFx0cGFuLmNvcHkoIF9leWUgKS5jcm9zcyggX3RoaXMub2JqZWN0LnVwICkuc2V0TGVuZ3RoKCBtb3VzZUNoYW5nZS54ICk7XG5cdFx0XHRcdHBhbi5hZGQoIG9iamVjdFVwLmNvcHkoIF90aGlzLm9iamVjdC51cCApLnNldExlbmd0aCggbW91c2VDaGFuZ2UueSApICk7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZCggcGFuICk7XG5cdFx0XHRcdF90aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0XHRcdGlmICggX3RoaXMuc3RhdGljTW92aW5nICkge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIF9wYW5FbmQgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmFkZCggbW91c2VDaGFuZ2Uuc3ViVmVjdG9ycyggX3BhbkVuZCwgX3BhblN0YXJ0ICkubXVsdGlwbHlTY2FsYXIoIF90aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yICkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9O1xuXG5cdH0oKSk7XG5cblx0dGhpcy5jaGVja0Rpc3RhbmNlcyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSB8fCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpID4gX3RoaXMubWF4RGlzdGFuY2UgKiBfdGhpcy5tYXhEaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWF4RGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpIDwgX3RoaXMubWluRGlzdGFuY2UgKiBfdGhpcy5taW5EaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWluRGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdGlmICggIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfdGhpcy5yb3RhdGVDYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3RoaXMuem9vbUNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF90aGlzLnBhbkNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZSApO1xuXG5cdFx0X3RoaXMuY2hlY2tEaXN0YW5jZXMoKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0aWYgKCBsYXN0UG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApID4gRVBTICkge1xuXG5cdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfcHJldlN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdF90aGlzLnRhcmdldC5jb3B5KCBfdGhpcy50YXJnZXQwICk7XG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIF90aGlzLnBvc2l0aW9uMCApO1xuXHRcdF90aGlzLm9iamVjdC51cC5jb3B5KCBfdGhpcy51cDAgKTtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdGxhc3RQb3NpdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHR9O1xuXG5cdC8vIGxpc3RlbmVyc1xuXG5cdGZ1bmN0aW9uIGtleWRvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24gKTtcblxuXHRcdF9wcmV2U3RhdGUgPSBfc3RhdGU7XG5cblx0XHRpZiAoIF9zdGF0ZSAhPT0gU1RBVEUuTk9ORSApIHtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuUk9UQVRFIF0gJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5aT09NIF0gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuWk9PTTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlBBTiBdICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuUEFOO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBrZXl1cCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0X3N0YXRlID0gX3ByZXZTdGF0ZTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24sIGZhbHNlICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNlZG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5OT05FICkge1xuXG5cdFx0XHRfc3RhdGUgPSBldmVudC5idXR0b247XG5cblx0XHR9XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5aT09NICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF96b29tU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF96b29tRW5kLmNvcHkoX3pvb21TdGFydCk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlBBTiAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9wYW5TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X3BhbkVuZC5jb3B5KF9wYW5TdGFydCk7XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCwgZmFsc2UgKTtcblxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2Vtb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlJPVEFURSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuWk9PTSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfem9vbUVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5QQU4gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNldXAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlbW92ZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCApO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNld2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKCBldmVudC53aGVlbERlbHRhICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhIC8gNDA7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbCAvIDM7XG5cblx0XHR9XG5cblx0XHRfem9vbVN0YXJ0LnkgKz0gZGVsdGEgKiAwLjAxO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLlRPVUNIX1pPT01fUEFOO1xuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gX3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIF9wYW5TdGFydCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2htb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoICBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBfdG91Y2hab29tRGlzdGFuY2VFbmQgPSAwO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBfcGFuRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1vdXNlZG93biwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBtb3VzZXdoZWVsLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgbW91c2V3aGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biwgZmFsc2UgKTtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIGtleXVwLCBmYWxzZSApO1xuXG5cdHRoaXMuaGFuZGxlUmVzaXplKCk7XG5cblx0Ly8gZm9yY2UgYW4gdXBkYXRlIGF0IHN0YXJ0XG5cdHRoaXMudXBkYXRlKCk7XG5cbn07XG5cblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUUuVHJhY2tiYWxsQ29udHJvbHM7XG5cbiIsInZhciBzcXVhcmUsIHppZywgemFnLCBsZWZ0LCByaWdodCwgdGVlLCB0ZXRyaXMsIGFsbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuc3F1YXJlID0gc3F1YXJlID0gW1tbMCwgMCwgMF0sIFswLCAxLCAxXSwgWzAsIDEsIDFdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXV0sIFtbMCwgMiwgMF0sIFsyLCAyLCAwXSwgWzIsIDAsIDBdXV07XG5vdXQkLnphZyA9IHphZyA9IFtbWzAsIDAsIDBdLCBbMCwgMywgM10sIFszLCAzLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdXV07XG5vdXQkLmxlZnQgPSBsZWZ0ID0gW1tbMCwgMCwgMF0sIFs0LCA0LCA0XSwgWzQsIDAsIDBdXSwgW1s0LCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXV0sIFtbMCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDRdXV07XG5vdXQkLnJpZ2h0ID0gcmlnaHQgPSBbW1swLCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgNV1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXV0sIFtbNSwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDBdXSwgW1swLCA1LCA1XSwgWzAsIDUsIDBdLCBbMCwgNSwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDBdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgNl0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdXV07XG5vdXQkLnRldHJpcyA9IHRldHJpcyA9IFtbWzAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMF0sIFs3LCA3LCA3LCA3XV0sIFtbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF1dXTtcbm91dCQuYWxsID0gYWxsID0gW1xuICB7XG4gICAgdHlwZTogJ3NxdWFyZScsXG4gICAgc2hhcGVzOiBzcXVhcmVcbiAgfSwge1xuICAgIHR5cGU6ICd6aWcnLFxuICAgIHNoYXBlczogemlnXG4gIH0sIHtcbiAgICB0eXBlOiAnemFnJyxcbiAgICBzaGFwZXM6IHphZ1xuICB9LCB7XG4gICAgdHlwZTogJ2xlZnQnLFxuICAgIHNoYXBlczogbGVmdFxuICB9LCB7XG4gICAgdHlwZTogJ3JpZ2h0JyxcbiAgICBzaGFwZXM6IHJpZ2h0XG4gIH0sIHtcbiAgICB0eXBlOiAndGVlJyxcbiAgICBzaGFwZXM6IHRlZVxuICB9LCB7XG4gICAgdHlwZTogJ3RldHJpcycsXG4gICAgc2hhcGVzOiB0ZXRyaXNcbiAgfVxuXTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgd3JhcCwgbWVudURhdGEsIGxpbWl0ZXIsIHByaW1lR2FtZVN0YXRlLCBjaG9vc2VPcHRpb24sIHNlbGVjdFByZXZJdGVtLCBzZWxlY3ROZXh0SXRlbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgd3JhcCA9IHJlZiQud3JhcDtcbm1lbnVEYXRhID0gW1xuICB7XG4gICAgc3RhdGU6ICdyZXN0YXJ0JyxcbiAgICB0ZXh0OiBcIlJlc3RhcnRcIlxuICB9LCB7XG4gICAgc3RhdGU6ICdnby1iYWNrJyxcbiAgICB0ZXh0OiBcIkJhY2sgdG8gTWFpblwiXG4gIH1cbl07XG5saW1pdGVyID0gd3JhcCgwLCBtZW51RGF0YS5sZW5ndGggLSAxKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdhbWVzdGF0ZSl7XG4gIHJldHVybiBnYW1lc3RhdGUuZmFpbE1lbnVTdGF0ZSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGFcbiAgfTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKGZtcywgaW5kZXgpe1xuICBmbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBmbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbZm1zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oZm1zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gZm1zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihmbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKGZtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IGZtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oZm1zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kSW50LCB3cmFwLCByYW5kb21Gcm9tLCBCcmlja1NoYXBlcywgY2FuRHJvcCwgY2FuTW92ZSwgY2FuUm90YXRlLCBjb2xsaWRlcywgY29weUJyaWNrVG9BcmVuYSwgdG9wSXNSZWFjaGVkLCBpc0NvbXBsZXRlLCBuZXdCcmljaywgc3Bhd25OZXdCcmljaywgZHJvcEFyZW5hUm93LCByZW1vdmVSb3dzLCBjbGVhckFyZW5hLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCByb3RhdGVCcmljaywgY29tcHV0ZVNjb3JlLCByZXNldFNjb3JlLCBhbmltYXRpb25UaW1lRm9yUm93cywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIGRpciwgYXJlbmEpe1xuICB2YXIgbmV3U2hhcGU7XG4gIG5ld1NoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBjb2xsaWRlcyhicmljay5wb3MsIG5ld1NoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJnJCl7XG4gIHZhciBjZWxscywgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZEludCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcm90YXRpb246IDAsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdLFxuICAgIHR5cGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0udHlwZSxcbiAgICBwb3M6IFswLCAwXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLmRyb3BBcmVuYVJvdyA9IGRyb3BBcmVuYVJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQucmVtb3ZlUm93cyA9IHJlbW92ZVJvd3MgPSBmdW5jdGlvbihyb3dzLCBhcmVuYSl7XG4gIHZhciBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgcmVzdWx0cyQucHVzaChkcm9wQXJlbmFSb3coYXJlbmEsIHJvd0l4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuY2xlYXJBcmVuYSA9IGNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBpLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBpID0gaiQ7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2gocm93W2ldID0gMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdldFNoYXBlT2ZSb3RhdGlvbiA9IGdldFNoYXBlT2ZSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdW3JvdGF0aW9uXTtcbn07XG5vdXQkLm5vcm1hbGlzZVJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24gPSBmdW5jdGlvbihhcmckLCByb3RhdGlvbil7XG4gIHZhciB0eXBlO1xuICB0eXBlID0gYXJnJC50eXBlO1xuICByZXR1cm4gd3JhcCgwLCBCcmlja1NoYXBlc1t0eXBlXS5sZW5ndGggLSAxLCByb3RhdGlvbik7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIGRpcil7XG4gIHZhciByb3RhdGlvbiwgdHlwZTtcbiAgcm90YXRpb24gPSBicmljay5yb3RhdGlvbiwgdHlwZSA9IGJyaWNrLnR5cGU7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbik7XG59O1xub3V0JC5jb21wdXRlU2NvcmUgPSBjb21wdXRlU2NvcmUgPSBmdW5jdGlvbihzY29yZSwgcm93cywgbHZsKXtcbiAgbHZsID09IG51bGwgJiYgKGx2bCA9IDApO1xuICBzd2l0Y2ggKHJvd3MubGVuZ3RoKSB7XG4gIGNhc2UgMTpcbiAgICBzY29yZS5zaW5nbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDQwICogKGx2bCArIDEpO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgc2NvcmUuZG91YmxlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMDAgKiAobHZsICsgMSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMzpcbiAgICBzY29yZS50cmlwbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDMwMCAqIChsdmwgKyAxKTtcbiAgICBicmVhaztcbiAgY2FzZSA0OlxuICAgIHNjb3JlLnRldHJpcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMjAwICogKGx2bCArIDEpO1xuICB9XG4gIHJldHVybiBzY29yZS5saW5lcyArPSByb3dzLmxlbmd0aDtcbn07XG5vdXQkLnJlc2V0U2NvcmUgPSByZXNldFNjb3JlID0gZnVuY3Rpb24oc2NvcmUpe1xuICByZXR1cm4gaW1wb3J0JChzY29yZSwge1xuICAgIHBvaW50czogMCxcbiAgICBsaW5lczogMCxcbiAgICBzaW5nbGVzOiAwLFxuICAgIGRvdWJsZXM6IDAsXG4gICAgdHJpcGxlczogMCxcbiAgICB0ZXRyaXM6IDBcbiAgfSk7XG59O1xub3V0JC5hbmltYXRpb25UaW1lRm9yUm93cyA9IGFuaW1hdGlvblRpbWVGb3JSb3dzID0gZnVuY3Rpb24ocm93cyl7XG4gIHJldHVybiAxMCArIE1hdGgucG93KDMsIHJvd3MubGVuZ3RoKTtcbn07XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgcmFuZG9tRnJvbSwgQ29yZSwgU3RhcnRNZW51LCBGYWlsTWVudSwgVGV0cmlzR2FtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcbnJhbmRvbUZyb20gPSByZXF1aXJlKCdzdGQnKS5yYW5kb21Gcm9tO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKTtcbkZhaWxNZW51ID0gcmVxdWlyZSgnLi9mYWlsLW1lbnUnKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlKXtcbiAgICBsb2coXCJUZXRyaXNHYW1lOjpuZXdcIik7XG4gICAgU3RhcnRNZW51LnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSk7XG4gICAgRmFpbE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlKTtcbiAgfVxuICBwcm90b3R5cGUuYmVnaW5OZXdHYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICAoZnVuY3Rpb24oKXtcbiAgICAgIENvcmUuY2xlYXJBcmVuYSh0aGlzLmFyZW5hKTtcbiAgICAgIHRoaXMuYnJpY2submV4dCA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuYnJpY2submV4dC5wb3MgPSBbMywgLTFdO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50LnBvcyA9IFszLCAtMV07XG4gICAgICBDb3JlLnJlc2V0U2NvcmUodGhpcy5zY29yZSk7XG4gICAgICB0aGlzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIucmVzZXQoKTtcbiAgICAgIHRoaXMudGltZXJzLmtleVJlcGVhdFRpbWVyLnJlc2V0KCk7XG4gICAgfS5jYWxsKGdhbWVTdGF0ZSkpO1xuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlUmVtb3ZhbEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgdGltZXJzLCBhbmltYXRpb25TdGF0ZTtcbiAgICB0aW1lcnMgPSBncy50aW1lcnMsIGFuaW1hdGlvblN0YXRlID0gZ3MuYW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmV4cGlyZWQpIHtcbiAgICAgIENvcmUucmVtb3ZlUm93cyhncy5yb3dzVG9SZW1vdmUsIGdzLmFyZW5hKTtcbiAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IFtdO1xuICAgICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuaGFuZGxlS2V5SW5wdXQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgbHJlc3VsdCQsIHJlZiQsIGtleSwgYWN0aW9uLCBhbXQsIHJlcyQsIGkkLCB0byQsIGksIHBvcywgeSwgbHJlc3VsdDEkLCBqJCwgdG8xJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBicmljayA9IGdzLmJyaWNrLCBhcmVuYSA9IGdzLmFyZW5hLCBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gLT0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChicmljay5jdXJyZW50LnBvc1swXSArPSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MuZm9yY2VEb3duTW9kZSA9IHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgIGNhc2UgJ2N3JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKENvcmUucm90YXRlQnJpY2soYnJpY2suY3VycmVudCwgMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2N3JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgLTEsIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChDb3JlLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdoYXJkLWRyb3AnOlxuICAgICAgICAgIGdzLmhhcmREcm9wRGlzdGFuY2UgPSAwO1xuICAgICAgICAgIHdoaWxlIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgICAgICBncy5oYXJkRHJvcERpc3RhbmNlICs9IDE7XG4gICAgICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBncy5pbnB1dFN0YXRlID0gW107XG4gICAgICAgICAgZ3MudGltZXJzLmhhcmREcm9wRWZmZWN0LnJlc2V0KDEgKyBncy5oYXJkRHJvcERpc3RhbmNlICogMTApO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MudGltZXJzLmRyb3BUaW1lci50aW1lVG9FeHBpcnkgPSAtMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTEnOlxuICAgICAgICBjYXNlICdkZWJ1Zy0yJzpcbiAgICAgICAgY2FzZSAnZGVidWctMyc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTQnOlxuICAgICAgICAgIGFtdCA9IHBhcnNlSW50KGtleS5yZXBsYWNlKC9cXEQvZywgJycpKTtcbiAgICAgICAgICBsb2coXCJERUJVRzogRGVzdHJveWluZyByb3dzOlwiLCBhbXQpO1xuICAgICAgICAgIHJlcyQgPSBbXTtcbiAgICAgICAgICBmb3IgKGkkID0gZ3MuYXJlbmEuaGVpZ2h0IC0gYW10LCB0byQgPSBncy5hcmVuYS5oZWlnaHQgLSAxOyBpJCA8PSB0byQ7ICsraSQpIHtcbiAgICAgICAgICAgIGkgPSBpJDtcbiAgICAgICAgICAgIHJlcyQucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gcmVzJDtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUgPSB0cnVlO1xuICAgICAgICAgIGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3Mucm93c1RvUmVtb3ZlKSk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChDb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3Mucm93c1RvUmVtb3ZlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTUnOlxuICAgICAgICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgICAgICAgIGdzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKDYpO1xuICAgICAgICAgIGltcG9ydCQoZ3MuYnJpY2suY3VycmVudC5wb3MsIHBvcyk7XG4gICAgICAgICAgZm9yIChpJCA9IGFyZW5hLmhlaWdodCAtIDEsIHRvJCA9IGFyZW5hLmhlaWdodCAtIDQ7IGkkID49IHRvJDsgLS1pJCkge1xuICAgICAgICAgICAgeSA9IGkkO1xuICAgICAgICAgICAgbHJlc3VsdDEkID0gW107XG4gICAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IGFyZW5hLndpZHRoIC0gMjsgaiQgPD0gdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgICB4ID0gaiQ7XG4gICAgICAgICAgICAgIGxyZXN1bHQxJC5wdXNoKGFyZW5hLmNlbGxzW3ldW3hdID0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGxyZXN1bHQxJCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy02JzpcbiAgICAgICAgICBncy5yb3dzVG9SZW1vdmUgPSBbMTAsIDEyLCAxNF07XG4gICAgICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgICAgIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3Mucm93c1RvUmVtb3ZlKSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhck9uZUZyYW1lRmxhZ3MgPSBmdW5jdGlvbihncyl7XG4gICAgcmV0dXJuIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYnJpY2ssIGFyZW5hLCBpbnB1dFN0YXRlLCBjb21wbGV0ZVJvd3MsIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgcm93O1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBpZiAoQ29yZS5pc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgcmVzJC5wdXNoKGl4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29tcGxldGVSb3dzID0gcmVzJDtcbiAgICBpZiAoY29tcGxldGVSb3dzLmxlbmd0aCkge1xuICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUgPSB0cnVlO1xuICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gY29tcGxldGVSb3dzO1xuICAgICAgZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucmVzZXQoMTAgKyBNYXRoLnBvdygzLCBncy5yb3dzVG9SZW1vdmUubGVuZ3RoKSk7XG4gICAgICBDb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3Mucm93c1RvUmVtb3ZlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgdGhpcy5yZXZlYWxGYWlsU2NyZWVuKGdzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGdzLmZvcmNlRG93bk1vZGUpIHtcbiAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gMDtcbiAgICB9XG4gICAgaWYgKGdzLnRpbWVycy5kcm9wVGltZXIuZXhwaXJlZCkge1xuICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci5yZXNldFdpdGhSZW1haW5kZXIoKTtcbiAgICAgIGlmIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb3JlLmNvcHlCcmlja1RvQXJlbmEoYnJpY2suY3VycmVudCwgYXJlbmEpO1xuICAgICAgICBDb3JlLnNwYXduTmV3QnJpY2soZ3MpO1xuICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhhbmRsZUtleUlucHV0KGdzKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dTdGFydFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXRTdGF0ZSwgc3RhcnRNZW51U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlLCBzdGFydE1lbnVTdGF0ZSA9IGdzLnN0YXJ0TWVudVN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3RQcmV2SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGlmIChzdGFydE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdzdGFydC1nYW1lJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChncy5mb3JjZURvd25Nb2RlID0gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJldmVhbFN0YXJ0U2NyZWVuID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnM7XG4gICAgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHRpbWVycy50aXRsZVJldmVhbFRpbWVyLnJlc2V0KCk7XG4gICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnc3RhcnQtbWVudSc7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93RmFpbFNjcmVlbiA9IGZ1bmN0aW9uKGdzLCDOlHQpe1xuICAgIHZhciBpbnB1dFN0YXRlLCBmYWlsTWVudVN0YXRlLCByZWYkLCBrZXksIGFjdGlvbiwgcmVzdWx0cyQgPSBbXTtcbiAgICBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZSwgZmFpbE1lbnVTdGF0ZSA9IGdzLmZhaWxNZW51U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goRmFpbE1lbnUuc2VsZWN0UHJldkl0ZW0oZmFpbE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKEZhaWxNZW51LnNlbGVjdE5leHRJdGVtKGZhaWxNZW51U3RhdGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICBsb2coZmFpbE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUpO1xuICAgICAgICAgIGlmIChmYWlsTWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3Jlc3RhcnQnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmYWlsTWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ2dvLWJhY2snKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmV2ZWFsU3RhcnRTY3JlZW4oZ3MpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJldmVhbEZhaWxTY3JlZW4gPSBmdW5jdGlvbihncyl7XG4gICAgZ3MudGltZXJzLmZhaWx1cmVSZXZlYWxUaW1lci5yZXNldCgpO1xuICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICB9O1xuICBwcm90b3R5cGUucnVuRnJhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgdmFyIG1ldGFnYW1lU3RhdGU7XG4gICAgbWV0YWdhbWVTdGF0ZSA9IGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIHRoaXMuY2xlYXJPbmVGcmFtZUZsYWdzKGdhbWVTdGF0ZSk7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICB0aGlzLnNob3dGYWlsU2NyZWVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHRoaXMuYWR2YW5jZUdhbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgdGhpcy5yZXZlYWxTdGFydFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnNob3dTdGFydFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHRoaXMuYWR2YW5jZVJlbW92YWxBbmltYXRpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmRlYnVnKCdVbmtub3duIG1ldGFnYW1lLXN0YXRlOicsIG1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICByZXR1cm4gVGV0cmlzR2FtZTtcbn0oKSk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGV0cmlzR2FtZTogVGV0cmlzR2FtZVxufTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIG1lbnVEYXRhLCBsaW1pdGVyLCBwcmltZUdhbWVTdGF0ZSwgY2hvb3NlT3B0aW9uLCBzZWxlY3RQcmV2SXRlbSwgc2VsZWN0TmV4dEl0ZW0sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHdyYXAgPSByZWYkLndyYXA7XG5tZW51RGF0YSA9IFtcbiAge1xuICAgIHN0YXRlOiAnc3RhcnQtZ2FtZScsXG4gICAgdGV4dDogXCJTdGFydCBHYW1lXCJcbiAgfSwge1xuICAgIHN0YXRlOiAnbm90aGluZycsXG4gICAgdGV4dDogXCJEb24ndCBTdGFydCBHYW1lXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ2FtZXN0YXRlKXtcbiAgcmV0dXJuIGdhbWVzdGF0ZS5zdGFydE1lbnVTdGF0ZSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGFcbiAgfTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKHNtcywgaW5kZXgpe1xuICBzbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBzbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbc21zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKHNtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IHNtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oc21zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCByYW5kLCBmbG9vciwgQmFzZSwgTWF0ZXJpYWxzLCBBcmVuYUNlbGxzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5BcmVuYUNlbGxzID0gQXJlbmFDZWxscyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmFDZWxscywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFDZWxscycsIEFyZW5hQ2VsbHMpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmFDZWxscztcbiAgZnVuY3Rpb24gQXJlbmFDZWxscyhvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIGJveEdlbywgcmVmJCwgcmVzJCwgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgY3ViZTtcbiAgICBibG9ja1NpemUgPSBvcHRzLmJsb2NrU2l6ZSwgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIEFyZW5hQ2VsbHMuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICBib3hHZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplLCBibG9ja1NpemUsIGJsb2NrU2l6ZSk7XG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMub2Zmc2V0KTtcbiAgICByZWYkID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb247XG4gICAgcmVmJC54ID0gd2lkdGggLyAtMiArIDAuNSAqIGdyaWRTaXplO1xuICAgIHJlZiQueSA9IGhlaWdodCAtIDAuNSAqIGdyaWRTaXplO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBwaTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGdzLmFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2goYm94R2VvLCBNYXRlcmlhbHMubm9ybWFsKTtcbiAgICAgICAgY3ViZS5wb3NpdGlvbi5zZXQoeCAqIGdyaWRTaXplLCB5ICogZ3JpZFNpemUsIDApO1xuICAgICAgICBjdWJlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vZmZzZXQuYWRkKGN1YmUpO1xuICAgICAgICBscmVzdWx0JC5wdXNoKGN1YmUpO1xuICAgICAgfVxuICAgICAgcmVzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgdGhpcy5jZWxscyA9IHJlcyQ7XG4gIH1cbiAgcHJvdG90eXBlLnRvZ2dsZVJvd09mQ2VsbHMgPSBmdW5jdGlvbihyb3dJeCwgc3RhdGUpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgYm94LCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLmNlbGxzW3Jvd0l4XSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGJveCA9IHJlZiRbaSRdO1xuICAgICAgYm94Lm1hdGVyaWFsID0gTWF0ZXJpYWxzLnphcDtcbiAgICAgIHJlc3VsdHMkLnB1c2goYm94LnZpc2libGUgPSBzdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3daYXBFZmZlY3QgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGFyZW5hLCByb3dzVG9SZW1vdmUsIHRpbWVycywgb25PZmYsIGkkLCBsZW4kLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmUsIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICBvbk9mZiA9IHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzIDwgMC40ICYmICEhKGZsb29yKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmN1cnJlbnRUaW1lICogMTApICUgMik7XG4gICAgb25PZmYgPSAhKGZsb29yKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmN1cnJlbnRUaW1lKSAlIDIpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gcm93c1RvUmVtb3ZlLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICByb3dJeCA9IHJvd3NUb1JlbW92ZVtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMudG9nZ2xlUm93T2ZDZWxscyhyb3dJeCwgb25PZmYpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlQ2VsbHMgPSBmdW5jdGlvbihjZWxscyl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjZWxscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gY2VsbHNbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgdGhpcy5jZWxsc1t5XVt4XS52aXNpYmxlID0gISFjZWxsO1xuICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuY2VsbHNbeV1beF0ubWF0ZXJpYWwgPSBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBBcmVuYUNlbGxzO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgbWF4LCByYW5kLCBCYXNlLCBGcmFtZSwgRmFsbGluZ0JyaWNrLCBHdWlkZUxpbmVzLCBBcmVuYUNlbGxzLCBQYXJ0aWNsZUVmZmVjdCwgQXJlbmEsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIG1heCA9IHJlZiQubWF4LCByYW5kID0gcmVmJC5yYW5kO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5GcmFtZSA9IHJlcXVpcmUoJy4vZnJhbWUnKS5GcmFtZTtcbkZhbGxpbmdCcmljayA9IHJlcXVpcmUoJy4vZmFsbGluZy1icmljaycpLkZhbGxpbmdCcmljaztcbkd1aWRlTGluZXMgPSByZXF1aXJlKCcuL2d1aWRlLWxpbmVzJykuR3VpZGVMaW5lcztcbkFyZW5hQ2VsbHMgPSByZXF1aXJlKCcuL2FyZW5hLWNlbGxzJykuQXJlbmFDZWxscztcblBhcnRpY2xlRWZmZWN0ID0gcmVxdWlyZSgnLi9wYXJ0aWNsZS1lZmZlY3QnKS5QYXJ0aWNsZUVmZmVjdDtcbm91dCQuQXJlbmEgPSBBcmVuYSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmEsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hJywgQXJlbmEpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmE7XG4gIGZ1bmN0aW9uIEFyZW5hKG9wdHMsIGdzKXtcbiAgICB2YXIgbmFtZSwgcmVmJCwgcGFydDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEFyZW5hLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBsb2coJ1JlbmRlcmVyOjpBcmVuYTo6bmV3Jyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZyYW1lc1NpbmNlUm93c1JlbW92ZWQ6IDBcbiAgICB9O1xuICAgIHRoaXMucGFydHMgPSB7XG4gICAgICBmcmFtZTogbmV3IEZyYW1lKHRoaXMub3B0cywgZ3MpLFxuICAgICAgZ3VpZGVMaW5lczogbmV3IEd1aWRlTGluZXModGhpcy5vcHRzLCBncyksXG4gICAgICBhcmVuYUNlbGxzOiBuZXcgQXJlbmFDZWxscyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHRoaXNCcmljazogbmV3IEZhbGxpbmdCcmljayh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHBhcnRpY2xlczogbmV3IFBhcnRpY2xlRWZmZWN0KHRoaXMub3B0cywgZ3MpXG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmJCA9IHRoaXMucGFydHMpIHtcbiAgICAgIHBhcnQgPSByZWYkW25hbWVdO1xuICAgICAgcGFydC5hZGRUbyh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSB0aGlzLm9wdHMuYXJlbmFPZmZzZXRGcm9tQ2VudHJlO1xuICB9XG4gIHByb3RvdHlwZS5qb2x0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzVG9SZW1vdmUsIHRpbWVycywgcCwgenosIGpvbHQ7XG4gICAgcm93c1RvUmVtb3ZlID0gZ3Mucm93c1RvUmVtb3ZlLCB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgcCA9IG1heCgwLCAxIC0gdGltZXJzLmhhcmREcm9wRWZmZWN0LnByb2dyZXNzKTtcbiAgICB6eiA9IHJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgcmV0dXJuIGpvbHQgPSAtMSAqIHAgKiAoMSArIHp6KSAqIHRoaXMub3B0cy5oYXJkRHJvcEpvbHRBbW91bnQ7XG4gIH07XG4gIHByb3RvdHlwZS5qaXR0ZXIgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHJvd3NUb1JlbW92ZSwgcCwgenosIGppdHRlcjtcbiAgICByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmU7XG4gICAgcCA9IDEgLSBncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcztcbiAgICB6eiA9IHJvd3NUb1JlbW92ZS5sZW5ndGggKiB0aGlzLm9wdHMuZ3JpZFNpemUgLyA0MDtcbiAgICByZXR1cm4gaml0dGVyID0gW3AgKiByYW5kKC16eiwgenopLCBwICogcmFuZCgtenosIHp6KV07XG4gIH07XG4gIHByb3RvdHlwZS56YXBMaW5lcyA9IGZ1bmN0aW9uKGdzLCBwb3NpdGlvblJlY2VpdmluZ0pvbHQpe1xuICAgIHZhciBhcmVuYSwgcm93c1RvUmVtb3ZlLCB0aW1lcnMsIGpvbHQsIGppdHRlcjtcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmUsIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMuc2hvd1phcEVmZmVjdChncyk7XG4gICAgaWYgKGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lKSB7XG4gICAgICB0aGlzLnBhcnRzLnBhcnRpY2xlcy5yZXNldCgpO1xuICAgICAgdGhpcy5wYXJ0cy5wYXJ0aWNsZXMucHJlcGFyZShyb3dzVG9SZW1vdmUpO1xuICAgICAgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkID0gMDtcbiAgICB9XG4gICAgam9sdCA9IHRoaXMuam9sdChncyk7XG4gICAgaml0dGVyID0gdGhpcy5qaXR0ZXIoZ3MpO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC54ID0gaml0dGVyWzBdO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC55ID0gaml0dGVyWzFdICsgam9sdCAvIDEwO1xuICAgIHJldHVybiB0aGlzLnBhcnRzLmd1aWRlTGluZXMuZGFuY2UoZ3MuZWxhcHNlZFRpbWUpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUGFydGljbGVzID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnM7XG4gICAgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHJldHVybiB0aGlzLnBhcnRzLnBhcnRpY2xlcy51cGRhdGUodGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3MsIHRoaXMuc3RhdGUuZnJhbWVzU2luY2VSb3dzUmVtb3ZlZCwgZ3MuzpR0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzLCBwb3NpdGlvblJlY2VpdmluZ0pvbHQpe1xuICAgIHZhciBhcmVuYSwgYnJpY2s7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgYnJpY2sgPSBncy5icmljaztcbiAgICB0aGlzLnBhcnRzLmFyZW5hQ2VsbHMudXBkYXRlQ2VsbHMoYXJlbmEuY2VsbHMpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLmRpc3BsYXlTaGFwZShicmljay5jdXJyZW50KTtcbiAgICB0aGlzLnBhcnRzLnRoaXNCcmljay51cGRhdGVQb3NpdGlvbihicmljay5jdXJyZW50LnBvcyk7XG4gICAgdGhpcy5wYXJ0cy5ndWlkZUxpbmVzLnNob3dCZWFtKGJyaWNrLmN1cnJlbnQpO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC55ID0gdGhpcy5qb2x0KGdzKTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkICs9IDE7XG4gIH07XG4gIHJldHVybiBBcmVuYTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIE1hdGVyaWFscywgQmFzZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuQmFzZSA9IEJhc2UgPSAoZnVuY3Rpb24oKXtcbiAgQmFzZS5kaXNwbGF5TmFtZSA9ICdCYXNlJztcbiAgdmFyIGhlbHBlck1hcmtlckdlbywgcHJvdG90eXBlID0gQmFzZS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQmFzZTtcbiAgaGVscGVyTWFya2VyR2VvID0gbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSgwLjAyLCAwLjAyLCAwLjAyKTtcbiAgZnVuY3Rpb24gQmFzZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yb290LmFkZCh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gIH1cbiAgcHJvdG90eXBlLmFkZFJlZ2lzdHJhdGlvbkhlbHBlciA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHN0YXJ0LCBlbmQsIGRpc3RhbmNlLCBkaXIsIGFycm93O1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLk1lc2goaGVscGVyTWFya2VyR2VvLCBNYXRlcmlhbHMuaGVscGVyQSkpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJCKSk7XG4gICAgc3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKTtcbiAgICBlbmQgPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbjtcbiAgICBkaXN0YW5jZSA9IHN0YXJ0LmRpc3RhbmNlVG8oZW5kKTtcbiAgICBpZiAoZGlzdGFuY2UgPiAwKSB7XG4gICAgICBkaXIgPSBuZXcgVEhSRUUuVmVjdG9yMygpLnN1YlZlY3RvcnMoZW5kLCBzdGFydCkubm9ybWFsaXplKCk7XG4gICAgICBhcnJvdyA9IG5ldyBUSFJFRS5BcnJvd0hlbHBlcihkaXIsIHN0YXJ0LCBkaXN0YW5jZSwgMHgwMDAwZmYpO1xuICAgICAgdGhpcy5yb290LmFkZChhcnJvdyk7XG4gICAgfVxuICAgIHJldHVybiBsb2coJ1JlZ2lzdHJhdGlvbiBoZWxwZXIgYXQnLCB0aGlzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZEJveEhlbHBlciA9IGZ1bmN0aW9uKHRoaW5nKXtcbiAgICB2YXIgYmJveDtcbiAgICBiYm94ID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaW5nLCAweDU1NTVmZik7XG4gICAgYmJveC51cGRhdGUoKTtcbiAgICByZXR1cm4gdGhpcy5yb290LmFkZChiYm94KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVJlZ2lzdHJhdGlvbkhlbHBlciA9IGZ1bmN0aW9uKCl7fTtcbiAgcHJvdG90eXBlLnNob3dCb3VuZHMgPSBmdW5jdGlvbihzY2VuZSl7XG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpcy5yb290LCAweDU1NTU1NSk7XG4gICAgdGhpcy5ib3VuZHMudXBkYXRlKCk7XG4gICAgcmV0dXJuIHNjZW5lLmFkZCh0aGlzLmJvdW5kcyk7XG4gIH07XG4gIHByb3RvdHlwZS5hZGRUbyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIG9iai5hZGQodGhpcy5yb290KTtcbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Bvc2l0aW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJvb3QucG9zaXRpb247XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ3Zpc2libGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC52aXNpYmxlO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihzdGF0ZSl7XG4gICAgICB0aGlzLnJvb3QudmlzaWJsZSA9IHN0YXRlO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbiAgfSk7XG4gIHJldHVybiBCYXNlO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBCYXNlLCBCcmljaywgQnJpY2tQcmV2aWV3LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2s7XG5vdXQkLkJyaWNrUHJldmlldyA9IEJyaWNrUHJldmlldyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIGdsYXNzTWF0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrUHJldmlldywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2tQcmV2aWV3JywgQnJpY2tQcmV2aWV3KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrUHJldmlldztcbiAgZ2xhc3NNYXQgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweDIyMjIyMixcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gICAgc2hpbmluZXNzOiAxMDAsXG4gICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgZGVwdGhXcml0ZTogZmFsc2VcbiAgfSk7XG4gIGZ1bmN0aW9uIEJyaWNrUHJldmlldyhvcHRzLCBncyl7XG4gICAgdmFyIHMsIHR1YmVSYWRpdXMsIHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmlja1ByZXZpZXcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHMgPSB0aGlzLm9wdHMucHJldmlld1NjYWxlRmFjdG9yO1xuICAgIHR1YmVSYWRpdXMgPSB0aGlzLm9wdHMucHJldmlld0RvbWVSYWRpdXM7XG4gICAgdHViZUhlaWdodCA9IHRoaXMub3B0cy5wcmV2aWV3RG9tZUhlaWdodDtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMuYnJpY2sucm9vdC5zY2FsZS5zZXQocywgcywgcyk7XG4gICAgdGhpcy5icmljay5yb290LnBvc2l0aW9uLnkgPSB0aGlzLm9wdHMuZ3JpZFNpemUgKiAyO1xuICAgIHRoaXMuYnJpY2sucm9vdC5wb3NpdGlvbi54ID0gMDtcbiAgICB0aGlzLmRvbWUgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5KHR1YmVSYWRpdXMsIDE2LCB0dWJlSGVpZ2h0LCAwKSwgZ2xhc3NNYXQpO1xuICAgIHRoaXMuZG9tZS5wb3NpdGlvbi55ID0gdHViZUhlaWdodDtcbiAgICB0aGlzLmJhc2UgPSB2b2lkIDg7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuZG9tZSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2sucm9vdCk7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlOb3RoaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5icmljay52aXNpYmxlID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgdGhpcy5icmljay52aXNpYmxlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5icmljay5wcmV0dHlEaXNwbGF5U2hhcGUoYnJpY2spO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlV2lnZ2xlID0gZnVuY3Rpb24oYnJpY2ssIGVsYXBzZWRUaW1lKXtcbiAgICByZXR1cm4gdGhpcy5yb290LnJvdGF0aW9uLnkgPSAwLjIgKiBzaW4oZWxhcHNlZFRpbWUgLyA1MDApO1xuICB9O1xuICByZXR1cm4gQnJpY2tQcmV2aWV3O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZGl2LCBwaSwgQmFzZSwgTWF0ZXJpYWxzLCBCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZGl2ID0gcmVmJC5kaXYsIHBpID0gcmVmJC5waTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5CcmljayA9IEJyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJldHR5T2Zmc2V0LCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEJyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmljaycsIEJyaWNrKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEJyaWNrO1xuICBwcmV0dHlPZmZzZXQgPSB7XG4gICAgc3F1YXJlOiBbLTIsIC0yXSxcbiAgICB6aWc6IFstMS41LCAtMl0sXG4gICAgemFnOiBbLTEuNSwgLTJdLFxuICAgIGxlZnQ6IFstMS41LCAtMl0sXG4gICAgcmlnaHQ6IFstMS41LCAtMl0sXG4gICAgdGVlOiBbLTEuNSwgLTJdLFxuICAgIHRldHJpczogWy0yLCAtMi41XVxuICB9O1xuICBmdW5jdGlvbiBCcmljayhvcHRzLCBncyl7XG4gICAgdmFyIHNpemUsIGdyaWQsIGJsb2NrR2VvLCByZXMkLCBpJCwgaSwgY3ViZTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEJyaWNrLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBzaXplID0gdGhpcy5vcHRzLmJsb2NrU2l6ZTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5mcmFtZSA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSg0ICogZ3JpZCwgNCAqIGdyaWQsIGdyaWQpLCBNYXRlcmlhbHMuZGVidWdXaXJlZnJhbWUpO1xuICAgIGJsb2NrR2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KHNpemUsIHNpemUsIHNpemUpO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gMzsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGJsb2NrR2VvLCBNYXRlcmlhbHMubm9ybWFsKTtcbiAgICAgIHRoaXMuYnJpY2suYWRkKGN1YmUpO1xuICAgICAgcmVzJC5wdXNoKGN1YmUpO1xuICAgIH1cbiAgICB0aGlzLmNlbGxzID0gcmVzJDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi5zZXQoMCAqIGdyaWQsIC0wLjUgKiBncmlkLCAwKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2spO1xuICB9XG4gIHByb3RvdHlwZS5wcmV0dHlEaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVNoYXBlKGJyaWNrLCB0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGFyZyQsIHByZXR0eSl7XG4gICAgdmFyIHNoYXBlLCB0eXBlLCBpeCwgZ3JpZCwgbWFyZ2luLCBvZmZzZXQsIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHgkLCByZXN1bHRzJCA9IFtdO1xuICAgIHNoYXBlID0gYXJnJC5zaGFwZSwgdHlwZSA9IGFyZyQudHlwZTtcbiAgICBwcmV0dHkgPT0gbnVsbCAmJiAocHJldHR5ID0gZmFsc2UpO1xuICAgIGl4ID0gMDtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIG1hcmdpbiA9ICh0aGlzLm9wdHMuZ3JpZFNpemUgLSB0aGlzLm9wdHMuYmxvY2tTaXplKSAvIDI7XG4gICAgb2Zmc2V0ID0gcHJldHR5XG4gICAgICA/IHByZXR0eU9mZnNldFt0eXBlXVxuICAgICAgOiBbLTIsIC0yXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHNoYXBlLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSBzaGFwZVtpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIHgkID0gdGhpcy5jZWxsc1tpeCsrXTtcbiAgICAgICAgICB4JC5wb3NpdGlvbi54ID0gKG9mZnNldFswXSArIDAuNSArIHgpICogZ3JpZCArIG1hcmdpbjtcbiAgICAgICAgICB4JC5wb3NpdGlvbi55ID0gKG9mZnNldFsxXSArIDAuNSArIHkpICogZ3JpZCArIG1hcmdpbjtcbiAgICAgICAgICB4JC5tYXRlcmlhbCA9IE1hdGVyaWFscy5ibG9ja3NbY2VsbF07XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh4JCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBCcmljaztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1heCwgQmFzZSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWF4ID0gcmVmJC5tYXg7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuRmFpbFNjcmVlbiA9IEZhaWxTY3JlZW4gPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZhaWxTY3JlZW4sIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZhaWxTY3JlZW4nLCBGYWlsU2NyZWVuKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZhaWxTY3JlZW47XG4gIGZ1bmN0aW9uIEZhaWxTY3JlZW4ob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRmFpbFNjcmVlbi5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgbG9nKFwiRmFpbFNjcmVlbjo6bmV3XCIpO1xuICB9XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7fTtcbiAgcmV0dXJuIEZhaWxTY3JlZW47XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIEJhc2UsIEJyaWNrLCBGYWxsaW5nQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKS5Ccmljaztcbm91dCQuRmFsbGluZ0JyaWNrID0gRmFsbGluZ0JyaWNrID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGYWxsaW5nQnJpY2ssIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZhbGxpbmdCcmljaycsIEZhbGxpbmdCcmljayksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGYWxsaW5nQnJpY2s7XG4gIGZ1bmN0aW9uIEZhbGxpbmdCcmljayhvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGYWxsaW5nQnJpY2suc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZ3JpZCA9IG9wdHMuZ3JpZFNpemU7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmdyaWQgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmljayh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljay5yb290KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gLTMgKiB0aGlzLmdyaWQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IC0xLjUgKiB0aGlzLmdyaWQ7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICByZXR1cm4gdGhpcy5icmljay5kaXNwbGF5U2hhcGUoYnJpY2spO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUG9zaXRpb24gPSBmdW5jdGlvbihwb3Mpe1xuICAgIHZhciB4LCB5O1xuICAgIHggPSBwb3NbMF0sIHkgPSBwb3NbMV07XG4gICAgcmV0dXJuIHRoaXMucm9vdC5wb3NpdGlvbi5zZXQodGhpcy5ncmlkICogeCwgdGhpcy5oZWlnaHQgLSB0aGlzLmdyaWQgKiB5LCAwKTtcbiAgfTtcbiAgcmV0dXJuIEZhbGxpbmdCcmljaztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIEZyYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkZyYW1lID0gRnJhbWUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZyYW1lLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGcmFtZScsIEZyYW1lKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZyYW1lO1xuICBmdW5jdGlvbiBGcmFtZShvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGcmFtZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgcmV0dXJuIEZyYW1lO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIEJhc2UsIE1hdGVyaWFscywgR3VpZGVMaW5lcywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkd1aWRlTGluZXMgPSBHdWlkZUxpbmVzID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChHdWlkZUxpbmVzLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdHdWlkZUxpbmVzJywgR3VpZGVMaW5lcyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBHdWlkZUxpbmVzO1xuICBmdW5jdGlvbiBHdWlkZUxpbmVzKG9wdHMsIGdzKXtcbiAgICB2YXIgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIG1lc2gsIGkkLCBpLCBsaW5lLCByZWYkO1xuICAgIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBHdWlkZUxpbmVzLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aWR0aCA9IGdyaWRTaXplICogZ3MuYXJlbmEud2lkdGg7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5saW5lcyA9IFtdO1xuICAgIG1lc2ggPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgICBtZXNoLnZlcnRpY2VzLnB1c2gobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCksIG5ldyBUSFJFRS5WZWN0b3IzKDAsIGhlaWdodCwgMCkpO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSA5OyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBsaW5lID0gbmV3IFRIUkVFLkxpbmUobWVzaCwgTWF0ZXJpYWxzLmxpbmVzW2ldKTtcbiAgICAgIHJlZiQgPSBsaW5lLnBvc2l0aW9uO1xuICAgICAgcmVmJC54ID0gaSAqIGdyaWRTaXplO1xuICAgICAgcmVmJC55ID0gMDtcbiAgICAgIHRoaXMubGluZXMucHVzaChsaW5lKTtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChsaW5lKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkU2l6ZTtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0JlYW0gPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBsaW5lLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubGluZXMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBsaW5lID0gcmVmJFtpJF07XG4gICAgICBsaW5lLm1hdGVyaWFsID0gTWF0ZXJpYWxzLmxpbmVzWzBdO1xuICAgIH1cbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYnJpY2suc2hhcGUpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaCh0aGlzLmxpbmVzW2JyaWNrLnBvc1swXSArIHhdLm1hdGVyaWFsID0gTWF0ZXJpYWxzLmxpbmVzW2NlbGxdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmRhbmNlID0gZnVuY3Rpb24odGltZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpLCBsaW5lLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLmxpbmVzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgbGluZSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChsaW5lLm1hdGVyaWFsID0gTWF0ZXJpYWxzLmxpbmVzWyhpICsgZmxvb3IodGltZSAvIDEwMCkpICUgOF0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBHdWlkZUxpbmVzO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgQXJlbmEsIFRpdGxlLCBUYWJsZSwgQnJpY2tQcmV2aWV3LCBMaWdodGluZywgTml4aWVEaXNwbGF5LCBTdGFydE1lbnUsIEZhaWxTY3JlZW4sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9hcmVuYScpLCBBcmVuYSA9IHJlZiQuQXJlbmEsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3RpdGxlJyksIFRpdGxlID0gcmVmJC5UaXRsZSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGFibGUnKSwgVGFibGUgPSByZWYkLlRhYmxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9icmljay1wcmV2aWV3JyksIEJyaWNrUHJldmlldyA9IHJlZiQuQnJpY2tQcmV2aWV3LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9saWdodGluZycpLCBMaWdodGluZyA9IHJlZiQuTGlnaHRpbmcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL25peGllJyksIE5peGllRGlzcGxheSA9IHJlZiQuTml4aWVEaXNwbGF5LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9zdGFydC1tZW51JyksIFN0YXJ0TWVudSA9IHJlZiQuU3RhcnRNZW51LCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi9mYWlsLXNjcmVlbicpLCBGYWlsU2NyZWVuID0gcmVmJC5GYWlsU2NyZWVuLCByZWYkKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIEJhc2UsIExpZ2h0aW5nLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5MaWdodGluZyA9IExpZ2h0aW5nID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgbWFpbkxpZ2h0RGlzdGFuY2UsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTGlnaHRpbmcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xpZ2h0aW5nJywgTGlnaHRpbmcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTGlnaHRpbmc7XG4gIG1haW5MaWdodERpc3RhbmNlID0gMjtcbiAgZnVuY3Rpb24gTGlnaHRpbmcob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTGlnaHRpbmcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgbWFpbkxpZ2h0RGlzdGFuY2UpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDApO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB0aGlzLnNwb3RsaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoMHhmZmZmZmYsIDEsIDUwLCAxKTtcbiAgICB0aGlzLnNwb3RsaWdodC5wb3NpdGlvbi5zZXQoMCwgMywgLTEpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnRhcmdldC5wb3NpdGlvbi5zZXQoMCwgMCwgLTEpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnNwb3RsaWdodCk7XG4gICAgdGhpcy5hbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDY2NjY2Nik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYW1iaWVudCk7XG4gICAgdGhpcy5zcG90bGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93RGFya25lc3MgPSAwLjU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93QmlhcyA9IDAuMDAwMTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFOZWFyID0gMTA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRmFyID0gMjUwMDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFGb3YgPSA1MDtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuUG9pbnRMaWdodEhlbHBlcih0aGlzLmxpZ2h0LCBtYWluTGlnaHREaXN0YW5jZSkpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLlNwb3RMaWdodEhlbHBlcih0aGlzLnNwb3RsaWdodCkpO1xuICB9O1xuICBwcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSAxLjAgKiBzaW4odGltZSAvIDUwMCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSAwLjUgKiBjb3ModGltZSAvIDUwMCk7XG4gIH07XG4gIHJldHVybiBMaWdodGluZztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxlcnAsIGxvZywgZmxvb3IsIG1hcCwgc3BsaXQsIHBpLCB0YXUsIEJhc2UsIENhcHN1bGVHZW9tZXRyeSwgTWF0ZXJpYWxzLCBOaXhpZVR1YmUsIE5peGllRGlzcGxheSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcywgc2xpY2UkID0gW10uc2xpY2U7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgc2luID0gcmVmJC5zaW4sIGxlcnAgPSByZWYkLmxlcnAsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwLCBzcGxpdCA9IHJlZiQuc3BsaXQsIHBpID0gcmVmJC5waSwgdGF1ID0gcmVmJC50YXU7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkNhcHN1bGVHZW9tZXRyeSA9IHJlcXVpcmUoJy4uL2dlb21ldHJ5L2NhcHN1bGUnKS5DYXBzdWxlR2VvbWV0cnk7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5OaXhpZVR1YmUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5peGllVHViZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTml4aWVUdWJlJywgTml4aWVUdWJlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5peGllVHViZTtcbiAgZnVuY3Rpb24gTml4aWVUdWJlKG9wdHMsIGdzKXtcbiAgICB2YXIgdHViZVJhZGl1cywgdHViZUhlaWdodCwgYmFzZVJhZGl1cywgYmFzZUhlaWdodCwgYmdHZW8sIGJhc2VHZW8sIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgaSwgcXVhZDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllVHViZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdHViZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZVR1YmVSYWRpdXM7XG4gICAgdHViZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQ7XG4gICAgYmFzZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgYmFzZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAxMDtcbiAgICBiZ0dlbyA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KHR1YmVSYWRpdXMgKiAxLjUsIHR1YmVSYWRpdXMgKiAzKTtcbiAgICBiYXNlR2VvID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoYmFzZVJhZGl1cywgYmFzZVJhZGl1cywgYmFzZUhlaWdodCwgNiwgMCk7XG4gICAgYmFzZUdlby5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VSb3RhdGlvblkocGkgLyA2KSk7XG4gICAgdGhpcy5pbnRlbnNpdHkgPSAwO1xuICAgIHRoaXMuZ2xhc3MgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQ2Fwc3VsZUdlb21ldHJ5KHR1YmVSYWRpdXMsIDE2LCB0dWJlSGVpZ2h0LCAwKSwgTWF0ZXJpYWxzLmdsYXNzKTtcbiAgICB0aGlzLmJhc2UgPSBuZXcgVEhSRUUuTWVzaChiYXNlR2VvLCBNYXRlcmlhbHMuY29wcGVyKTtcbiAgICB0aGlzLmJnID0gbmV3IFRIUkVFLk1lc2goYmdHZW8sIE1hdGVyaWFscy5uaXhpZUJnKTtcbiAgICB0aGlzLmdsYXNzLnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0O1xuICAgIHRoaXMuYmcucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQgLyAyO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIGkgPSByZWYkW2kkXTtcbiAgICAgIHF1YWQgPSB0aGlzLmNyZWF0ZURpZ2l0UXVhZChpLCBpeCk7XG4gICAgICBxdWFkLnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0IC8gMjtcbiAgICAgIHF1YWQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgcXVhZC5kaWdpdCA9IGk7XG4gICAgICBxdWFkLnJlbmRlck9yZGVyID0gMDtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICAgIHJlcyQucHVzaChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy5kaWdpdHMgPSByZXMkO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgnb3JhbmdlJywgMC4zLCAwLjMpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmdsYXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iYXNlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iZyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGlnaHQpO1xuICB9XG4gIHByb3RvdHlwZS5wdWxzZSA9IGZ1bmN0aW9uKHQpe1xuICAgIGlmICh0aGlzLmludGVuc2l0eSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gdGhpcy5pbnRlbnNpdHkgKyAwLjEgKiBzaW4odCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuc2hvd0RpZ2l0ID0gZnVuY3Rpb24oZGlnaXQpe1xuICAgIHRoaXMuaW50ZW5zaXR5ID0gZGlnaXQgIT0gbnVsbCA/IDAuNSA6IDA7XG4gICAgcmV0dXJuIHRoaXMuZGlnaXRzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudmlzaWJsZSA9IGl0LmRpZ2l0ID09PSBkaWdpdDtcbiAgICB9KTtcbiAgfTtcbiAgcHJvdG90eXBlLmNyZWF0ZURpZ2l0UXVhZCA9IGZ1bmN0aW9uKGRpZ2l0LCBpeCl7XG4gICAgdmFyIGdlb20sIHF1YWQ7XG4gICAgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KHRoaXMub3B0cy5zY29yZVR1YmVSYWRpdXMgKiAxLjUsIHRoaXMub3B0cy5zY29yZVR1YmVSYWRpdXMgKiAzKTtcbiAgICByZXR1cm4gcXVhZCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIE1hdGVyaWFscy5uaXhpZURpZ2l0c1tkaWdpdF0pO1xuICB9O1xuICByZXR1cm4gTml4aWVUdWJlO1xufShCYXNlKSk7XG5vdXQkLk5peGllRGlzcGxheSA9IE5peGllRGlzcGxheSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTml4aWVEaXNwbGF5LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOaXhpZURpc3BsYXknLCBOaXhpZURpc3BsYXkpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTml4aWVEaXNwbGF5O1xuICBmdW5jdGlvbiBOaXhpZURpc3BsYXkob3B0cywgZ3Mpe1xuICAgIHZhciBvZmZzZXQsIGJhc2VSYWRpdXMsIHJlcyQsIGkkLCB0byQsIGksIHR1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBOaXhpZURpc3BsYXkuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIG9mZnNldCA9IHRoaXMub3B0cy5zY29yZU9mZnNldEZyb21DZW50cmUgKyB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIGJhc2VSYWRpdXMgPSB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIHRoaXMuY291bnQgPSA1O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYXN0U2Vlbk51bWJlcjogMFxuICAgIH07XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLmNvdW50OyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgdHViZSA9IG5ldyBOaXhpZVR1YmUodGhpcy5vcHRzLCBncyk7XG4gICAgICB0dWJlLnBvc2l0aW9uLnggPSBvZmZzZXQgKyBpICogdGhpcy5vcHRzLnNjb3JlQmFzZVJhZGl1cyAqIDI7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodHViZS5yb290KTtcbiAgICAgIHJlcyQucHVzaCh0dWJlKTtcbiAgICB9XG4gICAgdGhpcy50dWJlcyA9IHJlcyQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IC10aGlzLm9wdHMuc2NvcmVEaXN0YW5jZUZyb21FZGdlO1xuICB9XG4gIHByb3RvdHlwZS5wdWxzZSA9IGZ1bmN0aW9uKHQpe1xuICAgIHJldHVybiB0aGlzLnR1YmVzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQucHVsc2UodCk7XG4gICAgfSk7XG4gIH07XG4gIHByb3RvdHlwZS5ydW5Ub051bWJlciA9IGZ1bmN0aW9uKHAsIG51bSl7XG4gICAgdmFyIG5leHROdW1iZXI7XG4gICAgbmV4dE51bWJlciA9IGZsb29yKGxlcnAodGhpcy5zdGF0ZS5sYXN0U2Vlbk51bWJlciwgbnVtLCBwKSk7XG4gICAgcmV0dXJuIHRoaXMuc2hvd051bWJlcihuZXh0TnVtYmVyKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNldE51bWJlciA9IGZ1bmN0aW9uKG51bSl7XG4gICAgdGhpcy5zdGF0ZS5sYXN0U2Vlbk51bWJlciA9IG51bTtcbiAgICByZXR1cm4gdGhpcy5zaG93TnVtYmVyKG51bSk7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93TnVtYmVyID0gZnVuY3Rpb24obnVtKXtcbiAgICB2YXIgZGlnaXRzLCBpJCwgaSwgdHViZSwgZGlnaXQsIHJlc3VsdHMkID0gW107XG4gICAgbnVtID09IG51bGwgJiYgKG51bSA9IDApO1xuICAgIGRpZ2l0cyA9IG1hcChwYXJ0aWFsaXplJC5hcHBseSh0aGlzLCBbcGFyc2VJbnQsIFt2b2lkIDgsIDEwXSwgWzBdXSkpKFxuICAgIHNwbGl0KCcnKShcbiAgICBmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudG9TdHJpbmcoKTtcbiAgICB9KFxuICAgIG51bSkpKTtcbiAgICBmb3IgKGkkID0gdGhpcy5jb3VudCAtIDE7IGkkID49IDA7IC0taSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHR1YmUgPSB0aGlzLnR1YmVzW2ldO1xuICAgICAgZGlnaXQgPSBkaWdpdHMucG9wKCk7XG4gICAgICByZXN1bHRzJC5wdXNoKHR1YmUuc2hvd0RpZ2l0KGRpZ2l0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIE5peGllRGlzcGxheTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBwYXJ0aWFsaXplJChmLCBhcmdzLCB3aGVyZSl7XG4gIHZhciBjb250ZXh0ID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHBhcmFtcyA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cyksIGksXG4gICAgICAgIGxlbiA9IHBhcmFtcy5sZW5ndGgsIHdsZW4gPSB3aGVyZS5sZW5ndGgsXG4gICAgICAgIHRhID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXSwgdHcgPSB3aGVyZSA/IHdoZXJlLmNvbmNhdCgpIDogW107XG4gICAgZm9yKGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgdGFbdHdbMF1dID0gcGFyYW1zW2ldOyB0dy5zaGlmdCgpOyB9XG4gICAgcmV0dXJuIGxlbiA8IHdsZW4gJiYgbGVuID9cbiAgICAgIHBhcnRpYWxpemUkLmFwcGx5KGNvbnRleHQsIFtmLCB0YSwgdHddKSA6IGYuYXBwbHkoY29udGV4dCwgdGEpO1xuICB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIHJhbmQsIGZsb29yLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBQYXJ0aWNsZUJ1cnN0LCBQYXJ0aWNsZUVmZmVjdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5QYXJ0aWNsZUJ1cnN0ID0gUGFydGljbGVCdXJzdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHNwZWVkLCBsaWZlc3BhbiwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChQYXJ0aWNsZUJ1cnN0LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdQYXJ0aWNsZUJ1cnN0JywgUGFydGljbGVCdXJzdCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQYXJ0aWNsZUJ1cnN0O1xuICBzcGVlZCA9IDI7XG4gIGxpZmVzcGFuID0gMTUwMDtcbiAgZnVuY3Rpb24gUGFydGljbGVCdXJzdChvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBwYXJ0aWNsZXMsIGdlb21ldHJ5LCBjb2xvciwgbWF0ZXJpYWw7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVCdXJzdC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zaXplID0gdGhpcy5vcHRzLnphcFBhcnRpY2xlU2l6ZTtcbiAgICBwYXJ0aWNsZXMgPSAxNTAwO1xuICAgIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gICAgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcbiAgICB0aGlzLnBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy52ZWxvY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy5saWZlc3BhbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5hbHBoYXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5tYXhsaWZlcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLnBvc0F0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMucG9zaXRpb25zLCAzKTtcbiAgICB0aGlzLmNvbEF0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMuY29sb3JzLCAzKTtcbiAgICB0aGlzLmFscGhhQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5hbHBoYXMsIDEpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgdGhpcy5wb3NBdHRyKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgdGhpcy5jb2xBdHRyKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ29wYWNpdHknLCB0aGlzLmFscGhhQXR0cik7XG4gICAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZE1hdGVyaWFsKHtcbiAgICAgIHNpemU6IHRoaXMuc2l6ZSxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICB2ZXJ0ZXhDb2xvcnM6IFRIUkVFLlZlcnRleENvbG9yc1xuICAgIH0pO1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLlBvaW50Q2xvdWQoZ2VvbWV0cnksIG1hdGVyaWFsKSk7XG4gIH1cbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZ3JpZCwgaSQsIHRvJCwgaSwgeCwgeiwgcmVzdWx0cyQgPSBbXTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB4ID0gNC41IC0gTWF0aC5yYW5kb20oKSAqIDk7XG4gICAgICB6ID0gMC41IC0gTWF0aC5yYW5kb20oKTtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAwXSA9IHggKiBncmlkO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gMDtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAyXSA9IHogKiBncmlkO1xuICAgICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAwXSA9IHggLyAxMDtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMV0gPSByYW5kKC0yICogZ3JpZCwgMTAgKiBncmlkKTtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB6O1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDBdID0gMTtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAxXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSAxO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPSAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuYWNjZWxlcmF0ZVBhcnRpY2xlID0gZnVuY3Rpb24oaSwgdCwgcCwgYmJ4LCBiYnope1xuICAgIHZhciBhY2MsIHB4LCBweSwgcHosIHZ4LCB2eSwgdnosIHB4MSwgcHkxLCBwejEsIHZ4MSwgdnkxLCB2ejEsIGw7XG4gICAgaWYgKHRoaXMubGlmZXNwYW5zW2kgLyAzXSA8PSAwKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAtMTAwMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdCA9IHQgLyAoMTAwMCAvIHNwZWVkKTtcbiAgICBhY2MgPSAtMC45ODtcbiAgICBweCA9IHRoaXMucG9zaXRpb25zW2kgKyAwXTtcbiAgICBweSA9IHRoaXMucG9zaXRpb25zW2kgKyAxXTtcbiAgICBweiA9IHRoaXMucG9zaXRpb25zW2kgKyAyXTtcbiAgICB2eCA9IHRoaXMudmVsb2NpdGllc1tpICsgMF07XG4gICAgdnkgPSB0aGlzLnZlbG9jaXRpZXNbaSArIDFdO1xuICAgIHZ6ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAyXTtcbiAgICBweDEgPSBweCArIDAuNSAqIDAgKiB0ICogdCArIHZ4ICogdDtcbiAgICBweTEgPSBweSArIDAuNSAqIGFjYyAqIHQgKiB0ICsgdnkgKiB0O1xuICAgIHB6MSA9IHB6ICsgMC41ICogMCAqIHQgKiB0ICsgdnogKiB0O1xuICAgIHZ4MSA9IDAgKiB0ICsgdng7XG4gICAgdnkxID0gYWNjICogdCArIHZ5O1xuICAgIHZ6MSA9IDAgKiB0ICsgdno7XG4gICAgaWYgKHB5MSA8IHRoaXMuc2l6ZSAvIDIgJiYgKC1iYnggPCBweDEgJiYgcHgxIDwgYmJ4KSAmJiAoLWJieiArIDEuOSAqIHRoaXMub3B0cy5ncmlkU2l6ZSA8IHB6MSAmJiBwejEgPCBiYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUpKSB7XG4gICAgICBweTEgPSB0aGlzLnNpemUgLyAyO1xuICAgICAgdngxICo9IDAuNztcbiAgICAgIHZ5MSAqPSAtMC42O1xuICAgICAgdnoxICo9IDAuNztcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDBdID0gcHgxO1xuICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IHB5MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSBwejE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAwXSA9IHZ4MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gdnkxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB2ejE7XG4gICAgbCA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXSAvIHRoaXMubWF4bGlmZXNbaSAvIDNdO1xuICAgIGwgPSBsICogbCAqIGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDBdID0gbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMV0gPSBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAyXSA9IGw7XG4gICAgcmV0dXJuIHRoaXMuYWxwaGFzW2kgLyAzXSA9IGw7XG4gIH07XG4gIHByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbih5KXtcbiAgICB2YXIgZ3JpZCwgaSQsIHRvJCwgaSwgcmVzdWx0cyQgPSBbXTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgdGhpcy5saWZlc3BhbnNbaSAvIDNdID0gbGlmZXNwYW4gLyAyICsgTWF0aC5yYW5kb20oKSAqIGxpZmVzcGFuIC8gMjtcbiAgICAgIHRoaXMubWF4bGlmZXNbaSAvIDNdID0gdGhpcy5saWZlc3BhbnNbaSAvIDNdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAoeSArIE1hdGgucmFuZG9tKCkpICogZ3JpZCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHAsIM6UdCl7XG4gICAgdmFyIGJvdW5jZUJvdW5kc1gsIGJvdW5jZUJvdW5kc1osIGkkLCB0byQsIGk7XG4gICAgYm91bmNlQm91bmRzWCA9IHRoaXMub3B0cy5kZXNrU2l6ZVswXSAvIDI7XG4gICAgYm91bmNlQm91bmRzWiA9IHRoaXMub3B0cy5kZXNrU2l6ZVsxXSAvIDI7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHRoaXMuYWNjZWxlcmF0ZVBhcnRpY2xlKGksIM6UdCwgMSwgYm91bmNlQm91bmRzWCwgYm91bmNlQm91bmRzWik7XG4gICAgICB0aGlzLmxpZmVzcGFuc1tpIC8gM10gLT0gzpR0O1xuICAgIH1cbiAgICB0aGlzLnBvc0F0dHIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmNvbEF0dHIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9O1xuICByZXR1cm4gUGFydGljbGVCdXJzdDtcbn0oQmFzZSkpO1xub3V0JC5QYXJ0aWNsZUVmZmVjdCA9IFBhcnRpY2xlRWZmZWN0ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChQYXJ0aWNsZUVmZmVjdCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnUGFydGljbGVFZmZlY3QnLCBQYXJ0aWNsZUVmZmVjdCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQYXJ0aWNsZUVmZmVjdDtcbiAgZnVuY3Rpb24gUGFydGljbGVFZmZlY3Qob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHJvdztcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodDtcbiAgICBQYXJ0aWNsZUVmZmVjdC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy56ID0gdGhpcy5vcHRzLno7XG4gICAgdGhpcy5oID0gaGVpZ2h0O1xuICAgIHRoaXMucm93cyA9IFtcbiAgICAgIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pXG4gICAgXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICByb3cuYWRkVG8odGhpcy5yb290KTtcbiAgICB9XG4gIH1cbiAgcHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbihyb3dzKXtcbiAgICB2YXIgaSQsIGxlbiQsIGksIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgcm93SXggPSByb3dzW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5yb3dzW2ldLnNldEhlaWdodCgodGhpcy5oIC0gMSkgLSByb3dJeCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBzeXN0ZW0sIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHN5c3RlbSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChzeXN0ZW0ucmVzZXQoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHAsIGZzcnIsIM6UdCl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgc3lzdGVtLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgc3lzdGVtID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHN5c3RlbS51cGRhdGUocCwgzpR0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFBhcnRpY2xlRWZmZWN0O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBjb3MsIEJhc2UsIFRpdGxlLCBjYW52YXNUZXh0dXJlLCBTdGFydE1lbnUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuVGl0bGUgPSByZXF1aXJlKCcuL3RpdGxlJykuVGl0bGU7XG5jYW52YXNUZXh0dXJlID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRleHR1cmVTaXplLCBmaWRlbGl0eUZhY3RvciwgdGV4dENudiwgaW1nQ252LCB0ZXh0Q3R4LCBpbWdDdHg7XG4gIHRleHR1cmVTaXplID0gMTAyNDtcbiAgZmlkZWxpdHlGYWN0b3IgPSAxMDA7XG4gIHRleHRDbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgaW1nQ252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRleHRDdHggPSB0ZXh0Q252LmdldENvbnRleHQoJzJkJyk7XG4gIGltZ0N0eCA9IGltZ0Nudi5nZXRDb250ZXh0KCcyZCcpO1xuICBpbWdDbnYud2lkdGggPSBpbWdDbnYuaGVpZ2h0ID0gdGV4dHVyZVNpemU7XG4gIHJldHVybiBmdW5jdGlvbihhcmckKXtcbiAgICB2YXIgd2lkdGgsIGhlaWdodCwgdGV4dCwgdGV4dFNpemUsIHJlZiQ7XG4gICAgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodCwgdGV4dCA9IGFyZyQudGV4dCwgdGV4dFNpemUgPSAocmVmJCA9IGFyZyQudGV4dFNpemUpICE9IG51bGwgPyByZWYkIDogMTA7XG4gICAgdGV4dENudi53aWR0aCA9IHdpZHRoICogZmlkZWxpdHlGYWN0b3I7XG4gICAgdGV4dENudi5oZWlnaHQgPSBoZWlnaHQgKiBmaWRlbGl0eUZhY3RvcjtcbiAgICB0ZXh0Q3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHRleHRDdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgdGV4dEN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIHRleHRDdHguZm9udCA9IHRleHRTaXplICogZmlkZWxpdHlGYWN0b3IgKyBcInB4IG1vbm9zcGFjZVwiO1xuICAgIHRleHRDdHguZmlsbFRleHQodGV4dCwgd2lkdGggKiBmaWRlbGl0eUZhY3RvciAvIDIsIGhlaWdodCAqIGZpZGVsaXR5RmFjdG9yIC8gMiwgd2lkdGggKiBmaWRlbGl0eUZhY3Rvcik7XG4gICAgaW1nQ3R4LmNsZWFyUmVjdCgwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIGltZ0N0eC5maWxsUmVjdCgwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIGltZ0N0eC5kcmF3SW1hZ2UodGV4dENudiwgMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICByZXR1cm4gaW1nQ252LnRvRGF0YVVSTCgpO1xuICB9O1xufSgpO1xub3V0JC5TdGFydE1lbnUgPSBTdGFydE1lbnUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFN0YXJ0TWVudSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnU3RhcnRNZW51JywgU3RhcnRNZW51KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFN0YXJ0TWVudTtcbiAgZnVuY3Rpb24gU3RhcnRNZW51KG9wdHMsIGdzKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBvcHRpb24sIHF1YWQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBTdGFydE1lbnUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBncy5zdGFydE1lbnVTdGF0ZS5tZW51RGF0YSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBvcHRpb24gPSByZWYkW2kkXTtcbiAgICAgIHF1YWQgPSB0aGlzLmNyZWF0ZU9wdGlvblF1YWQob3B0aW9uLCBpeCk7XG4gICAgICBxdWFkLnBvc2l0aW9uLnkgPSAwLjUgLSBpeCAqIDAuMjtcbiAgICAgIHRoaXMub3B0aW9ucy5wdXNoKHF1YWQpO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHF1YWQpO1xuICAgIH1cbiAgICB0aGlzLnRpdGxlID0gbmV3IFRpdGxlKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMudGl0bGUuYWRkVG8odGhpcy5yZWdpc3RyYXRpb24pO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSAtMSAqICh0aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSArIHRoaXMub3B0cy5hcmVuYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYmxvY2tTaXplIC8gMik7XG4gIH1cbiAgcHJvdG90eXBlLmNyZWF0ZU9wdGlvblF1YWQgPSBmdW5jdGlvbihvcHRpb24sIGl4KXtcbiAgICB2YXIgaW1hZ2UsIHRleCwgZ2VvbSwgbWF0LCBxdWFkO1xuICAgIGltYWdlID0gY2FudmFzVGV4dHVyZSh7XG4gICAgICB0ZXh0OiBvcHRpb24udGV4dCxcbiAgICAgIHdpZHRoOiA2MCxcbiAgICAgIGhlaWdodDogMTBcbiAgICB9KTtcbiAgICB0ZXggPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGltYWdlKTtcbiAgICBnZW9tID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoMSwgMC4yKTtcbiAgICBtYXQgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWFwOiB0ZXgsXG4gICAgICBhbHBoYU1hcDogdGV4LFxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gcXVhZCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIG1hdCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHRpbWVycywgdGl0bGVSZXZlYWxUaW1lcjtcbiAgICB0aW1lcnMgPSBncy50aW1lcnMsIHRpdGxlUmV2ZWFsVGltZXIgPSB0aW1lcnMudGl0bGVSZXZlYWxUaW1lcjtcbiAgICB0aGlzLnRpdGxlLnJldmVhbCh0aXRsZVJldmVhbFRpbWVyLnByb2dyZXNzKTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVTZWxlY3Rpb24oZ3Muc3RhcnRNZW51U3RhdGUsIGdzLmVsYXBzZWRUaW1lKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKHN0YXRlLCB0aW1lKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBxdWFkLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLm9wdGlvbnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgcXVhZCA9IHJlZiRbaSRdO1xuICAgICAgaWYgKGl4ID09PSBzdGF0ZS5jdXJyZW50SW5kZXgpIHtcbiAgICAgICAgcXVhZC5zY2FsZS54ID0gMSArIDAuMDUgKiBzaW4odGltZSAvIDMwMCk7XG4gICAgICAgIHJlc3VsdHMkLnB1c2gocXVhZC5zY2FsZS55ID0gMSArIDAuMDUgKiAtc2luKHRpbWUgLyAzMDApKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gU3RhcnRNZW51O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmFzZSwgTWF0ZXJpYWxzLCBUYWJsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5UYWJsZSA9IFRhYmxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUYWJsZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVGFibGUnLCBUYWJsZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUYWJsZTtcbiAgZnVuY3Rpb24gVGFibGUob3B0cywgZ3Mpe1xuICAgIHZhciByZWYkLCB3aWR0aCwgZGVwdGgsIHRoaWNrbmVzcztcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIFRhYmxlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZWYkID0gdGhpcy5vcHRzLmRlc2tTaXplLCB3aWR0aCA9IHJlZiRbMF0sIGRlcHRoID0gcmVmJFsxXSwgdGhpY2tuZXNzID0gcmVmJFsyXTtcbiAgICB0aGlzLnRhYmxlID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KHdpZHRoLCB0aGlja25lc3MsIGRlcHRoKSwgTWF0ZXJpYWxzLnRhYmxlRmFjZXMpO1xuICAgIHRoaXMudGFibGUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMudGFibGUpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSB0aGlja25lc3MgLyAtMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gZGVwdGggLyAtMjtcbiAgfVxuICByZXR1cm4gVGFibGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIG1pbiwgbWF4LCBFYXNlLCBCYXNlLCBNYXRlcmlhbHMsIGJsb2NrVGV4dCwgVGl0bGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCBtaW4gPSByZWYkLm1pbiwgbWF4ID0gcmVmJC5tYXg7XG5FYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xuYmxvY2tUZXh0ID0ge1xuICB0ZXRyaXM6IFtbMSwgMSwgMSwgMiwgMiwgMiwgMywgMywgMywgNCwgNCwgMCwgNSwgNiwgNiwgNl0sIFswLCAxLCAwLCAyLCAwLCAwLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCAwLCAwXSwgWzAsIDEsIDAsIDIsIDIsIDAsIDAsIDMsIDAsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgMCwgMCwgNl0sIFswLCAxLCAwLCAyLCAyLCAyLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCA2LCA2XV0sXG4gIHZydDogW1sxLCAwLCAxLCA0LCA0LCA2LCA2LCA2XSwgWzEsIDAsIDEsIDQsIDAsIDQsIDYsIDBdLCBbMSwgMCwgMSwgNCwgNCwgMCwgNiwgMF0sIFsxLCAwLCAxLCA0LCAwLCA0LCA2LCAwXSwgWzAsIDEsIDAsIDQsIDAsIDQsIDYsIDBdXSxcbiAgZ2hvc3Q6IFtbMSwgMSwgMSwgMiwgMCwgMiwgMywgMywgMywgNCwgNCwgNCwgNSwgNSwgNV0sIFsxLCAwLCAwLCAyLCAwLCAyLCAzLCAwLCAzLCA0LCAwLCAwLCAwLCA1LCAwXSwgWzEsIDAsIDAsIDIsIDIsIDIsIDMsIDAsIDMsIDQsIDQsIDQsIDAsIDUsIDBdLCBbMSwgMCwgMSwgMiwgMCwgMiwgMywgMCwgMywgMCwgMCwgNCwgMCwgNSwgMF0sIFsxLCAxLCAxLCAyLCAwLCAyLCAzLCAzLCAzLCA0LCA0LCA0LCAwLCA1LCAwXV1cbn07XG5vdXQkLlRpdGxlID0gVGl0bGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRpdGxlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUaXRsZScsIFRpdGxlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpdGxlO1xuICBmdW5jdGlvbiBUaXRsZShvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHRleHQsIG1hcmdpbiwgaGVpZ2h0LCBibG9ja0dlbywgaSQsIGxlbiQsIHksIHJvdywgaiQsIGxlbjEkLCB4LCBjZWxsLCBib3gsIGJib3g7XG4gICAgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemUsIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBUaXRsZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGV4dCA9IGJsb2NrVGV4dC52cnQ7XG4gICAgbWFyZ2luID0gKGdyaWRTaXplIC0gYmxvY2tTaXplKSAvIDI7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMud29yZCA9IG5ldyBUSFJFRS5PYmplY3QzRCk7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnggPSAodGV4dFswXS5sZW5ndGggLSAxKSAqIGdyaWRTaXplIC8gLTI7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnkgPSBoZWlnaHQgLyAtMiAtICh0ZXh0Lmxlbmd0aCAtIDEpICogZ3JpZFNpemUgLyAtMjtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueiA9IGdyaWRTaXplIC8gMjtcbiAgICBibG9ja0dlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIGJsb2NrU2l6ZSwgYmxvY2tTaXplKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRleHQubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHRleHRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIGJveCA9IG5ldyBUSFJFRS5NZXNoKGJsb2NrR2VvLCBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdKTtcbiAgICAgICAgICBib3gucG9zaXRpb24uc2V0KGdyaWRTaXplICogeCArIG1hcmdpbiwgZ3JpZFNpemUgKiAodGV4dC5sZW5ndGggLyAyIC0geSkgKyBtYXJnaW4sIGdyaWRTaXplIC8gLTIpO1xuICAgICAgICAgIHRoaXMud29yZC5hZGQoYm94KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBiYm94ID0gbmV3IFRIUkVFLkJvdW5kaW5nQm94SGVscGVyKHRoaXMud29yZCwgMHhmZjAwMDApO1xuICAgIGJib3gudXBkYXRlKCk7XG4gIH1cbiAgcHJvdG90eXBlLnJldmVhbCA9IGZ1bmN0aW9uKHByb2dyZXNzKXtcbiAgICB2YXIgcDtcbiAgICBwID0gbWluKDEsIHByb2dyZXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gRWFzZS5xdWludE91dChwLCB0aGlzLmhlaWdodCAqIDIsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gRWFzZS5leHBPdXQocCwgMzAsIDApO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gRWFzZS5leHBPdXQocCwgLXBpIC8gMTAsIDApO1xuICB9O1xuICBwcm90b3R5cGUuZGFuY2UgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gLXBpIC8gMiArIHRpbWUgLyAxMDAwO1xuICAgIHJldHVybiB0aGlzLndvcmQub3BhY2l0eSA9IDAuNSArIDAuNSAqIHNpbiArIHRpbWUgLyAxMDAwO1xuICB9O1xuICByZXR1cm4gVGl0bGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIHBpLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBwaSA9IHJlZiQucGk7XG5vdXQkLkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IERlYnVnQ2FtZXJhUG9zaXRpb25lciA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIuZGlzcGxheU5hbWUgPSAnRGVidWdDYW1lcmFQb3NpdGlvbmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnQ2FtZXJhUG9zaXRpb25lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xuICBmdW5jdGlvbiBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIoY2FtZXJhLCB0YXJnZXQpe1xuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIHRhcmdldDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmVuYWJsZWQgPSB0cnVlO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmICh0aGlzLnN0YXRlLmVuYWJsZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmF1dG9Sb3RhdGUoZ3MuZWxhcHNlZFRpbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocGhhc2UsIHZwaGFzZSl7XG4gICAgdmFyIHRoYXQ7XG4gICAgdnBoYXNlID09IG51bGwgJiYgKHZwaGFzZSA9IDApO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSB0aGlzLnIgKiBzaW4ocGhhc2UpO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnkgKyB0aGlzLnIgKiAtc2luKHZwaGFzZSk7XG4gICAgcmV0dXJuIHRoaXMuY2FtZXJhLmxvb2tBdCgodGhhdCA9IHRoaXMudGFyZ2V0LnBvc2l0aW9uKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogdGhpcy50YXJnZXQpO1xuICB9O1xuICBwcm90b3R5cGUuYXV0b1JvdGF0ZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHJldHVybiB0aGlzLnNldFBvc2l0aW9uKHBpIC8gMTAgKiBzaW4odGltZSAvIDEwMDApKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbn0oKSk7IiwidmFyIHBpO1xucGkgPSByZXF1aXJlKCdzdGQnKS5waTtcblRIUkVFLkNhcHN1bGVHZW9tZXRyeSA9IGZ1bmN0aW9uKHJhZGl1cywgcmFkaWFsU2VnbWVudHMsIGhlaWdodCwgbGVuZ3Rod2lzZVNlZ21lbnRzKXtcbiAgdmFyIGhhbGZTcGhlcmUsIHR1YmU7XG4gIGhhbGZTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCByYWRpYWxTZWdtZW50cywgcmFkaWFsU2VnbWVudHMsIDAsIHBpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAwLCAwKSk7XG4gIGhhbGZTcGhlcmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25YKC1waSAvIDIpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSgxLCAwLjUsIDEpKTtcbiAgdHViZSA9IG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KHJhZGl1cywgcmFkaXVzLCBoZWlnaHQsIHJhZGlhbFNlZ21lbnRzICogMiwgbGVuZ3Rod2lzZVNlZ21lbnRzLCB0cnVlKTtcbiAgdHViZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAtaGVpZ2h0IC8gMiwgMCkpO1xuICBoYWxmU3BoZXJlLm1lcmdlKHR1YmUpO1xuICByZXR1cm4gaGFsZlNwaGVyZTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgbGVycCwgcmFuZCwgZmxvb3IsIG1hcCwgRWFzZSwgVEhSRUUsIFBhbGV0dGUsIFNjZW5lTWFuYWdlciwgRGVidWdDYW1lcmFQb3NpdGlvbmVyLCBBcmVuYSwgVGFibGUsIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgTGlnaHRpbmcsIEJyaWNrUHJldmlldywgTml4aWVEaXNwbGF5LCBUcmFja2JhbGxDb250cm9scywgVGhyZWVKc1JlbmRlcmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgbGVycCA9IHJlZiQubGVycCwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcDtcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcblNjZW5lTWFuYWdlciA9IHJlcXVpcmUoJy4vc2NlbmUtbWFuYWdlcicpLlNjZW5lTWFuYWdlcjtcbkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IHJlcXVpcmUoJy4vZGVidWctY2FtZXJhJykuRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xucmVmJCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpLCBBcmVuYSA9IHJlZiQuQXJlbmEsIFRhYmxlID0gcmVmJC5UYWJsZSwgU3RhcnRNZW51ID0gcmVmJC5TdGFydE1lbnUsIEZhaWxTY3JlZW4gPSByZWYkLkZhaWxTY3JlZW4sIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIE5peGllRGlzcGxheSA9IHJlZiQuTml4aWVEaXNwbGF5O1xuVHJhY2tiYWxsQ29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi9saWIvdHJhY2tiYWxsLWNvbnRyb2xzLmpzJykuVHJhY2tiYWxsQ29udHJvbHM7XG5vdXQkLlRocmVlSnNSZW5kZXJlciA9IFRocmVlSnNSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBUaHJlZUpzUmVuZGVyZXIuZGlzcGxheU5hbWUgPSAnVGhyZWVKc1JlbmRlcmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IFRocmVlSnNSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGhyZWVKc1JlbmRlcmVyO1xuICBmdW5jdGlvbiBUaHJlZUpzUmVuZGVyZXIob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgbmFtZSwgcmVmJCwgcGFydDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodDtcbiAgICBsb2coXCJSZW5kZXJlcjo6bmV3XCIpO1xuICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmVNYW5hZ2VyKHRoaXMub3B0cyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZyYW1lc1NpbmNlUm93c1JlbW92ZWQ6IDAsXG4gICAgICBsYXN0U2VlblN0YXRlOiAnbm8tZ2FtZSdcbiAgICB9O1xuICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMuaml0dGVyID0gbmV3IFRIUkVFLk9iamVjdDNEKTtcbiAgICB0aGlzLnBhcnRzID0ge1xuICAgICAgdGFibGU6IG5ldyBUYWJsZSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGxpZ2h0aW5nOiBuZXcgTGlnaHRpbmcodGhpcy5vcHRzLCBncyksXG4gICAgICBhcmVuYTogbmV3IEFyZW5hKHRoaXMub3B0cywgZ3MpLFxuICAgICAgc3RhcnRNZW51OiBuZXcgU3RhcnRNZW51KHRoaXMub3B0cywgZ3MpLFxuICAgICAgZmFpbFNjcmVlbjogbmV3IEZhaWxTY3JlZW4odGhpcy5vcHRzLCBncyksXG4gICAgICBuZXh0QnJpY2s6IG5ldyBCcmlja1ByZXZpZXcodGhpcy5vcHRzLCBncyksXG4gICAgICBzY29yZTogbmV3IE5peGllRGlzcGxheSh0aGlzLm9wdHMsIGdzKVxuICAgIH07XG4gICAgZm9yIChuYW1lIGluIHJlZiQgPSB0aGlzLnBhcnRzKSB7XG4gICAgICBwYXJ0ID0gcmVmJFtuYW1lXTtcbiAgICAgIHBhcnQuYWRkVG8odGhpcy5qaXR0ZXIpO1xuICAgIH1cbiAgICB0aGlzLnBhcnRzLm5leHRCcmljay5yb290LnBvc2l0aW9uLnNldCgtdGhpcy5vcHRzLnByZXZpZXdEaXN0YW5jZUZyb21DZW50ZXIsIDAsIC10aGlzLm9wdHMucHJldmlld0Rpc3RhbmNlRnJvbUVkZ2UpO1xuICAgIHRoaXMucGFydHMuYXJlbmEucm9vdC5wb3NpdGlvbi5zZXQoMCwgMCwgLXRoaXMub3B0cy5hcmVuYURpc3RhbmNlRnJvbUVkZ2UpO1xuICAgIHRoaXMuYWRkVHJhY2tiYWxsKCk7XG4gICAgdGhpcy5zY2VuZS5jb250cm9scy5yZXNldFNlbnNvcigpO1xuICAgIHRoaXMuc2NlbmUucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnNldCgwLCAtdGhpcy5vcHRzLmNhbWVyYUVsZXZhdGlvbiwgLXRoaXMub3B0cy5jYW1lcmFEaXN0YW5jZUZyb21FZGdlICogNCk7XG4gICAgdGhpcy5zY2VuZS5zaG93SGVscGVycygpO1xuICB9XG4gIHByb3RvdHlwZS5hZGRUcmFja2JhbGwgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0cmFja2JhbGxUYXJnZXQ7XG4gICAgdHJhY2tiYWxsVGFyZ2V0ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRyYWNrYmFsbFRhcmdldC5wb3NpdGlvbi56ID0gLXRoaXMub3B0cy5jYW1lcmFEaXN0YW5jZUZyb21FZGdlO1xuICAgIHRoaXMuc2NlbmUuYWRkKHRyYWNrYmFsbFRhcmdldCk7XG4gICAgdGhpcy50cmFja2JhbGwgPSBuZXcgVEhSRUUuVHJhY2tiYWxsQ29udHJvbHModGhpcy5zY2VuZS5jYW1lcmEsIHRyYWNrYmFsbFRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMudHJhY2tiYWxsLnBhblNwZWVkID0gMTtcbiAgfTtcbiAgcHJvdG90eXBlLmFwcGVuZFRvID0gZnVuY3Rpb24oaG9zdCl7XG4gICAgcmV0dXJuIGhvc3QuYXBwZW5kQ2hpbGQodGhpcy5zY2VuZS5kb21FbGVtZW50KTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcm93cywgcDtcbiAgICB0aGlzLnRyYWNrYmFsbC51cGRhdGUoKTtcbiAgICB0aGlzLnNjZW5lLnVwZGF0ZSgpO1xuICAgIGlmIChncy5tZXRhZ2FtZVN0YXRlICE9PSB0aGlzLnN0YXRlLmxhc3RTZWVuU3RhdGUpIHtcbiAgICAgIHRoaXMucGFydHMuc3RhcnRNZW51LnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgc3dpdGNoIChncy5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgICAvLyBmYWxsdGhyb3VnaFxuICAgICAgY2FzZSAnZ2FtZSc6XG4gICAgICAgIHRoaXMucGFydHMuYXJlbmEudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICAgIHRoaXMucGFydHMuc3RhcnRNZW51LnZpc2libGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgc3dpdGNoIChncy5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICBsb2coJ25vLWdhbWUnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICByb3dzID0gZ3Mucm93c1RvUmVtb3ZlLmxlbmd0aDtcbiAgICAgIHAgPSBncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcztcbiAgICAgIGdzLnNsb3dkb3duID0gMSArIEVhc2UuZXhwSW4ocCwgMTAsIDApO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS56YXBMaW5lcyhncywgdGhpcy5qaXR0ZXIucG9zaXRpb24pO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sudXBkYXRlV2lnZ2xlKGdzLCBncy5lbGFwc2VkVGltZSk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnJ1blRvTnVtYmVyKGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzLCBncy5zY29yZS5wb2ludHMpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5wdWxzZShncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICBncy5zbG93ZG93biA9IDE7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnVwZGF0ZShncywgdGhpcy5qaXR0ZXIucG9zaXRpb24pO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheVNoYXBlKGdzLmJyaWNrLm5leHQpO1xuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sudXBkYXRlV2lnZ2xlKGdzLCBncy5lbGFwc2VkVGltZSk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnNldE51bWJlcihncy5zY29yZS5wb2ludHMpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5wdWxzZShncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5Tm90aGluZygpO1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdXNlLW1lbnUnOlxuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheU5vdGhpbmcoKTtcbiAgICAgIHRoaXMucGFydHMucGF1c2VNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlOb3RoaW5nKCk7XG4gICAgICB0aGlzLnBhcnRzLmZhaWxTY3JlZW4udXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2coXCJUaHJlZUpzUmVuZGVyZXI6OnJlbmRlciAtIFVua25vd24gbWV0YWdhbWVzdGF0ZTpcIiwgZ3MubWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMucGFydHMuYXJlbmEudXBkYXRlUGFydGljbGVzKGdzKTtcbiAgICB0aGlzLnN0YXRlLmxhc3RTZWVuU3RhdGUgPSBncy5tZXRhZ2FtZVN0YXRlO1xuICAgIHJldHVybiB0aGlzLnNjZW5lLnJlbmRlcigpO1xuICB9O1xuICByZXR1cm4gVGhyZWVKc1JlbmRlcmVyO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBQYWxldHRlLCBhc3NldFBhdGgsIHRleHR1cmVzLCBpLCBnbGFzcywgY29wcGVyLCBuaXhpZURpZ2l0cywgbml4aWVCZywgYmxvY2tzLCBjb2xvciwgaG9sb0Jsb2NrcywgemFwLCB0YWJsZVRvcCwgdGFibGVFZGdlLCB0YWJsZUZhY2VzLCBsaW5lcywgZGVidWdXaXJlZnJhbWUsIGhlbHBlckEsIGhlbHBlckIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5hc3NldFBhdGggPSAoZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gXCJhc3NldHMvXCIgKyBpdDtcbn0pO1xudGV4dHVyZXMgPSB7XG4gIG5peGllRGlnaXRzQ29sb3I6IChmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMDsgaSQgPD0gOTsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgcmVzdWx0cyQucHVzaChUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImRpZ2l0LVwiICsgaSArIFwiLmNvbC5wbmdcIikpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9KCkpLFxuICBuaXhpZUJnQ29sb3I6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiZGlnaXQtYmcuY29sLnBuZ1wiKSksXG4gIGJsb2NrVGlsZU5vcm1hbDogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJ0aWxlLm5ybS5wbmdcIikpLFxuICB0YWJsZVRvcENvbG9yOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImJvYXJkLmNvbC5wbmdcIikpLFxuICB0YWJsZUVkZ2VDb2xvcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC1mLmNvbC5wbmdcIikpLFxuICB0YWJsZVRvcFNwZWN1bGFyOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImJvYXJkLnNwZWMucG5nXCIpKVxufTtcbm91dCQuZ2xhc3MgPSBnbGFzcyA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDIyMjIyMixcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiAxMDAsXG4gIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICBkZXB0aFdyaXRlOiBmYWxzZVxufSk7XG5vdXQkLmNvcHBlciA9IGNvcHBlciA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDk2NTExMSxcbiAgc3BlY3VsYXI6IDB4Y2I2ZDUxLFxuICBzaGluaW5lc3M6IDMwXG59KTtcbm91dCQubml4aWVEaWdpdHMgPSBuaXhpZURpZ2l0cyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwOyBpJCA8PSA5OyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZXMubml4aWVEaWdpdHNDb2xvcltpXSxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgY29sb3I6IDB4ZmYzMzAwLFxuICAgICAgZW1pc3NpdmU6IDB4ZmZiYjAwXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLm5peGllQmcgPSBuaXhpZUJnID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgbWFwOiB0ZXh0dXJlcy5uaXhpZUJnQ29sb3IsXG4gIGNvbG9yOiAweDAwMDAwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiA4MFxufSk7XG5vdXQkLmJsb2NrcyA9IGJsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICBzcGVjdWxhcjogUGFsZXR0ZS5zcGVjQ29sb3JzW2ldLFxuICAgICAgc2hpbmluZXNzOiAxMDAsXG4gICAgICBub3JtYWxNYXA6IHRleHR1cmVzLmJsb2NrVGlsZU5vcm1hbFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5ob2xvQmxvY2tzID0gaG9sb0Jsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGVtaXNzaXZlOiAweGZmZmZmZixcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIHNwZWN1bGFyOiBQYWxldHRlLnNwZWNDb2xvcnNbaV0sXG4gICAgICBzaGluaW5lc3M6IDEwMCxcbiAgICAgIG5vcm1hbE1hcDogdGV4dHVyZXMuYmxvY2tUaWxlTm9ybWFsXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLnphcCA9IHphcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweGZmZmZmZixcbiAgZW1pc3NpdmU6IDB4ZmZmZmZmXG59KTtcbm91dCQudGFibGVUb3AgPSB0YWJsZVRvcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIG1hcDogdGV4dHVyZXMudGFibGVUb3BDb2xvcixcbiAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICBzcGVjdWxhck1hcDogdGV4dHVyZXMudGFibGVUb3BTcGVjdWxhcixcbiAgc2hpbmluZXNzOiAxMDBcbn0pO1xub3V0JC50YWJsZUVkZ2UgPSB0YWJsZUVkZ2UgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBtYXA6IHRleHR1cmVzLnRhYmxlRWRnZUNvbG9yXG59KTtcbm91dCQudGFibGVGYWNlcyA9IHRhYmxlRmFjZXMgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChbdGFibGVFZGdlLCB0YWJsZUVkZ2UsIHRhYmxlVG9wLCB0YWJsZUVkZ2UsIHRhYmxlRWRnZSwgdGFibGVFZGdlXSk7XG5vdXQkLmxpbmVzID0gbGluZXMgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gUGFsZXR0ZS50aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLmRlYnVnV2lyZWZyYW1lID0gZGVidWdXaXJlZnJhbWUgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICBjb2xvcjogJ3doaXRlJyxcbiAgd2lyZWZyYW1lOiB0cnVlXG59KTtcbm91dCQuaGVscGVyQSA9IGhlbHBlckEgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICBjb2xvcjogMHhmZjAwMDAsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBvcGFjaXR5OiAwLjVcbn0pO1xub3V0JC5oZWxwZXJCID0gaGVscGVyQiA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDAwZmYwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIG9wYWNpdHk6IDAuNVxufSk7IiwidmFyIFRIUkVFLCByZWYkLCBsb2csIG1hcCwgcGx1Y2ssIG5ldXRyYWwsIHJlZCwgb3JhbmdlLCBncmVlbiwgbWFnZW50YSwgYmx1ZSwgYnJvd24sIHllbGxvdywgY3lhbiwgY29sb3JPcmRlciwgdGlsZUNvbG9ycywgc3BlY0NvbG9ycywgUGFsZXR0ZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBsb2cgPSByZWYkLmxvZywgbWFwID0gcmVmJC5tYXAsIHBsdWNrID0gcmVmJC5wbHVjaztcbm91dCQubmV1dHJhbCA9IG5ldXRyYWwgPSBbMHhmZmZmZmYsIDB4Y2NjY2NjLCAweDg4ODg4OCwgMHgyMTIxMjFdO1xub3V0JC5yZWQgPSByZWQgPSBbMHhGRjQ0NDQsIDB4RkY3Nzc3LCAweGRkNDQ0NCwgMHg1NTExMTFdO1xub3V0JC5vcmFuZ2UgPSBvcmFuZ2UgPSBbMHhGRkJCMzMsIDB4RkZDQzg4LCAweENDODgwMCwgMHg1NTMzMDBdO1xub3V0JC5ncmVlbiA9IGdyZWVuID0gWzB4NDRmZjY2LCAweDg4ZmZhYSwgMHgyMmJiMzMsIDB4MTE1NTExXTtcbm91dCQubWFnZW50YSA9IG1hZ2VudGEgPSBbMHhmZjMzZmYsIDB4ZmZhYWZmLCAweGJiMjJiYiwgMHg1NTExNTVdO1xub3V0JC5ibHVlID0gYmx1ZSA9IFsweDY2YmJmZiwgMHhhYWRkZmYsIDB4NTU4OGVlLCAweDExMTE1NV07XG5vdXQkLmJyb3duID0gYnJvd24gPSBbMHhmZmJiMzMsIDB4ZmZjYzg4LCAweGJiOTkwMCwgMHg1NTU1MTFdO1xub3V0JC55ZWxsb3cgPSB5ZWxsb3cgPSBbMHhlZWVlMTEsIDB4ZmZmZmFhLCAweGNjYmIwMCwgMHg1NTU1MTFdO1xub3V0JC5jeWFuID0gY3lhbiA9IFsweDQ0ZGRmZiwgMHhhYWUzZmYsIDB4MDBhYWNjLCAweDAwNjY5OV07XG5jb2xvck9yZGVyID0gW25ldXRyYWwsIHJlZCwgb3JhbmdlLCB5ZWxsb3csIGdyZWVuLCBjeWFuLCBibHVlLCBtYWdlbnRhXTtcbm91dCQudGlsZUNvbG9ycyA9IHRpbGVDb2xvcnMgPSBtYXAocGx1Y2soMiksIGNvbG9yT3JkZXIpO1xub3V0JC5zcGVjQ29sb3JzID0gc3BlY0NvbG9ycyA9IG1hcChwbHVjaygwKSwgY29sb3JPcmRlcik7XG5vdXQkLlBhbGV0dGUgPSBQYWxldHRlID0ge1xuICBuZXV0cmFsOiBuZXV0cmFsLFxuICByZWQ6IHJlZCxcbiAgb3JhbmdlOiBvcmFuZ2UsXG4gIHllbGxvdzogeWVsbG93LFxuICBncmVlbjogZ3JlZW4sXG4gIGN5YW46IGN5YW4sXG4gIGJsdWU6IGJsdWUsXG4gIG1hZ2VudGE6IG1hZ2VudGEsXG4gIHRpbGVDb2xvcnM6IHRpbGVDb2xvcnMsXG4gIHNwZWNDb2xvcnM6IHNwZWNDb2xvcnNcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIFRIUkVFLCBNYXRlcmlhbHMsIFNjZW5lTWFuYWdlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi9tYXRzJyk7XG5vdXQkLlNjZW5lTWFuYWdlciA9IFNjZW5lTWFuYWdlciA9IChmdW5jdGlvbigpe1xuICBTY2VuZU1hbmFnZXIuZGlzcGxheU5hbWUgPSAnU2NlbmVNYW5hZ2VyJztcbiAgdmFyIGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlck9wYWNpdHksIGhlbHBlck1hcmtlckdlbywgcHJvdG90eXBlID0gU2NlbmVNYW5hZ2VyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTY2VuZU1hbmFnZXI7XG4gIGhlbHBlck1hcmtlclNpemUgPSAwLjAyO1xuICBoZWxwZXJNYXJrZXJPcGFjaXR5ID0gMC4zO1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUsIGhlbHBlck1hcmtlclNpemUpO1xuICBmdW5jdGlvbiBTY2VuZU1hbmFnZXIob3B0cyl7XG4gICAgdmFyIGFzcGVjdDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMucmVzaXplID0gYmluZCQodGhpcywgJ3Jlc2l6ZScsIHByb3RvdHlwZSk7XG4gICAgdGhpcy56ZXJvU2Vuc29yID0gYmluZCQodGhpcywgJ3plcm9TZW5zb3InLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuZ29GdWxsc2NyZWVuID0gYmluZCQodGhpcywgJ2dvRnVsbHNjcmVlbicsIHByb3RvdHlwZSk7XG4gICAgYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICAgIGFudGlhbGlhczogdHJ1ZVxuICAgIH0pO1xuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3NSwgYXNwZWN0LCAwLjAwMSwgMTAwMCk7XG4gICAgdGhpcy5jb250cm9scyA9IG5ldyBUSFJFRS5WUkNvbnRyb2xzKHRoaXMuY2FtZXJhKTtcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5lZmZlY3QgPSBuZXcgVEhSRUUuVlJFZmZlY3QodGhpcy5yZW5kZXJlcik7XG4gICAgdGhpcy5lZmZlY3Quc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCAtIDEsIHdpbmRvdy5pbm5lckhlaWdodCAtIDEpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy56ZXJvU2Vuc29yLCB0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemUsIGZhbHNlKTtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgdGhpcy5nb0Z1bGxzY3JlZW4pO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB2ck1vZGU6IG5hdmlnYXRvci5nZXRWUkRldmljZXMgIT0gbnVsbFxuICAgIH07XG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5yb290KTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckEpKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dIZWxwZXJzID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZ3JpZCwgYXhpcywgcm9vdEF4aXM7XG4gICAgZ3JpZCA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwLCAwLjEpO1xuICAgIGF4aXMgPSBuZXcgVEhSRUUuQXhpc0hlbHBlcigxKTtcbiAgICByb290QXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDAuNSk7XG4gICAgYXhpcy5wb3NpdGlvbi56ID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uejtcbiAgICByZXR1cm4gcm9vdEF4aXMucG9zaXRpb24ueiA9IHRoaXMucm9vdC5wb3NpdGlvbi56O1xuICB9O1xuICBwcm90b3R5cGUuZW5hYmxlU2hhZG93Q2FzdGluZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBTb2Z0ID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEVuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRmFyID0gMTAwMDtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd0NhbWVyYUZvdiA9IDUwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhTmVhciA9IDM7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBCaWFzID0gMC4wMDM5O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwV2lkdGggPSAxMDI0O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBEYXJrbmVzcyA9IDAuNTtcbiAgfTtcbiAgcHJvdG90eXBlLmdvRnVsbHNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKCdTdGFydGluZyBmdWxsc2NyZWVuLi4uJyk7XG4gICAgcmV0dXJuIHRoaXMuZWZmZWN0LnNldEZ1bGxTY3JlZW4odHJ1ZSk7XG4gIH07XG4gIHByb3RvdHlwZS56ZXJvU2Vuc29yID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgIHZhciBrZXlDb2RlO1xuICAgIGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKGtleUNvZGUgPT09IDg2KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9scy5yZXNldFNlbnNvcigpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIHJldHVybiB0aGlzLmVmZmVjdC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5jb250cm9scy51cGRhdGUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuZWZmZWN0LnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdkb21FbGVtZW50Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBvYmosIHRoYXQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBhcmd1bWVudHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIG9iaiA9IGFyZ3VtZW50c1tpJF07XG4gICAgICBsb2coJ1NjZW5lTWFuYWdlcjo6YWRkIC0nLCBvYmopO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJlZ2lzdHJhdGlvbi5hZGQoKHRoYXQgPSBvYmoucm9vdCkgIT0gbnVsbCA/IHRoYXQgOiBvYmopKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gU2NlbmVNYW5hZ2VyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBwb3csIHF1YWRJbiwgcXVhZE91dCwgY3ViaWNJbiwgY3ViaWNPdXQsIHF1YXJ0SW4sIHF1YXJ0T3V0LCBxdWludEluLCBxdWludE91dCwgZXhwSW4sIGV4cE91dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnBvdyA9IHJlcXVpcmUoJ3N0ZCcpLnBvdztcbm91dCQucXVhZEluID0gcXVhZEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiB0ICogdCArIGI7XG59O1xub3V0JC5xdWFkT3V0ID0gcXVhZE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIHQgKiAodCAtIDIpICsgYjtcbn07XG5vdXQkLmN1YmljSW4gPSBjdWJpY0luID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBNYXRoLnBvdyh0LCAzKSArIGI7XG59O1xub3V0JC5jdWJpY091dCA9IGN1YmljT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiAoTWF0aC5wb3codCAtIDEsIDMpICsgMSkgKyBiO1xufTtcbm91dCQucXVhcnRJbiA9IHF1YXJ0SW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDQpICsgYjtcbn07XG5vdXQkLnF1YXJ0T3V0ID0gcXVhcnRPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gLWMgKiAoTWF0aC5wb3codCAtIDEsIDQpIC0gMSkgKyBiO1xufTtcbm91dCQucXVpbnRJbiA9IHF1aW50SW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDUpICsgYjtcbn07XG5vdXQkLnF1aW50T3V0ID0gcXVpbnRPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgNSkgKyAxKSArIGI7XG59O1xub3V0JC5leHBJbiA9IGV4cEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBwb3coMiwgMTAgKiAodCAtIDEpKSArIGI7XG59O1xub3V0JC5leHBPdXQgPSBleHBPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqICgoLXBvdygyLCAtMTAgKiB0KSkgKyAxKSArIGI7XG59OyIsInZhciBpZCwgbG9nLCBmbGlwLCBkZWxheSwgZmxvb3IsIHJhbmRvbSwgcmFuZCwgcmFuZEludCwgcmFuZG9tRnJvbSwgYWRkVjIsIGZpbHRlciwgcGx1Y2ssIHBpLCB0YXUsIHBvdywgc2luLCBjb3MsIG1pbiwgbWF4LCBsZXJwLCBtYXAsIHNwbGl0LCBqb2luLCB1bmxpbmVzLCBkaXYsIHdyYXAsIGxpbWl0LCByYWYsIHRoYXQsIEVhc2UsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gTWF0aC5yYW5kb207XG5vdXQkLnJhbmQgPSByYW5kID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgcmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbn07XG5vdXQkLnJhbmRJbnQgPSByYW5kSW50ID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtyYW5kKDAsIGxpc3QubGVuZ3RoIC0gMSldO1xufTtcbm91dCQuYWRkVjIgPSBhZGRWMiA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gW2FbMF0gKyBiWzBdLCBhWzFdICsgYlsxXV07XG59O1xub3V0JC5maWx0ZXIgPSBmaWx0ZXIgPSBjdXJyeSQoZnVuY3Rpb24ozrssIGxpc3Qpe1xuICB2YXIgaSQsIGxlbiQsIHgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbGlzdC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsaXN0W2kkXTtcbiAgICBpZiAozrsoeCkpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC5wbHVjayA9IHBsdWNrID0gY3VycnkkKGZ1bmN0aW9uKHAsIG8pe1xuICByZXR1cm4gb1twXTtcbn0pO1xub3V0JC5waSA9IHBpID0gTWF0aC5QSTtcbm91dCQudGF1ID0gdGF1ID0gcGkgKiAyO1xub3V0JC5wb3cgPSBwb3cgPSBNYXRoLnBvdztcbm91dCQuc2luID0gc2luID0gTWF0aC5zaW47XG5vdXQkLmNvcyA9IGNvcyA9IE1hdGguY29zO1xub3V0JC5taW4gPSBtaW4gPSBNYXRoLm1pbjtcbm91dCQubWF4ID0gbWF4ID0gTWF0aC5tYXg7XG5vdXQkLmxlcnAgPSBsZXJwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBwKXtcbiAgcmV0dXJuIG1pbiArIHAgKiAobWF4IC0gbWluKTtcbn0pO1xub3V0JC5tYXAgPSBtYXAgPSBjdXJyeSQoZnVuY3Rpb24ozrssIGwpe1xuICB2YXIgaSQsIGxlbiQsIHgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsW2kkXTtcbiAgICByZXN1bHRzJC5wdXNoKM67KHgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KTtcbm91dCQuc3BsaXQgPSBzcGxpdCA9IGN1cnJ5JChmdW5jdGlvbihjaGFyLCBzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KGNoYXIpO1xufSk7XG5vdXQkLmpvaW4gPSBqb2luID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuam9pbihjaGFyKTtcbn0pO1xub3V0JC51bmxpbmVzID0gdW5saW5lcyA9IGpvaW4oXCJcXG5cIik7XG5vdXQkLmRpdiA9IGRpdiA9IGN1cnJ5JChmdW5jdGlvbihhLCBiKXtcbiAgcmV0dXJuIGZsb29yKGEgLyBiKTtcbn0pO1xub3V0JC53cmFwID0gd3JhcCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLmxpbWl0ID0gbGltaXQgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIG4pe1xuICBpZiAobiA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH0gZWxzZSBpZiAobiA8IG1pbikge1xuICAgIHJldHVybiBtaW47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cbn0pO1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTtcbm91dCQuRWFzZSA9IEVhc2UgPSByZXF1aXJlKCcuL2Vhc2luZycpO1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHVubGluZXMsIHRlbXBsYXRlLCBEZWJ1Z091dHB1dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgdW5saW5lcyA9IHJlZiQudW5saW5lcztcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIHNjb3JlOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCAyKTtcbiAgfSxcbiAgYnJpY2s6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc2hhcGUubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC5tYXAodGVtcGxhdGUuY2VsbCkuam9pbignICcpO1xuICAgIH0pLmpvaW4oXCJcXG4gICAgICAgIFwiKTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIGtleVN1bW1hcnksIHJlc3VsdHMkID0gW107XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRoaXMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAga2V5U3VtbWFyeSA9IHRoaXNbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKGtleVN1bW1hcnkua2V5ICsgJy0nICsga2V5U3VtbWFyeS5hY3Rpb24gKyBcInxcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIihubyBjaGFuZ2UpXCI7XG4gICAgfVxuICB9LFxuICBub3JtYWw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwic2NvcmUgLSBcIiArIHRlbXBsYXRlLnNjb3JlLmFwcGx5KHRoaXMuc2NvcmUpICsgXCJcXG5saW5lcyAtIFwiICsgdGhpcy5saW5lcyArIFwiXFxuXFxuIG1ldGEgLSBcIiArIHRoaXMubWV0YWdhbWVTdGF0ZSArIFwiXFxuIHRpbWUgLSBcIiArIHRoaXMuZWxhcHNlZFRpbWUgKyBcIlxcbmZyYW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRGcmFtZXMgKyBcIlxcbiBrZXlzIC0gXCIgKyB0ZW1wbGF0ZS5rZXlzLmFwcGx5KHRoaXMuaW5wdXRTdGF0ZSkgKyBcIlxcbiBkcm9wIC0gXCIgKyAodGhpcy5mb3JjZURvd25Nb2RlID8gJ3NvZnQnIDogJ2F1dG8nKTtcbiAgfSxcbiAgbWVudUl0ZW1zOiBmdW5jdGlvbigpe1xuICAgIHZhciBpeCwgaXRlbTtcbiAgICByZXR1cm4gXCJcIiArIHVubGluZXMoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5tZW51RGF0YSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgaXggPSBpJDtcbiAgICAgICAgaXRlbSA9IHJlZiRbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHRlbXBsYXRlLm1lbnVJdGVtLmNhbGwoaXRlbSwgaXgsIHRoaXMuY3VycmVudEluZGV4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH0sXG4gIHN0YXJ0TWVudTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJTVEFSVCBNRU5VXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcyk7XG4gIH0sXG4gIG1lbnVJdGVtOiBmdW5jdGlvbihpbmRleCwgY3VycmVudEluZGV4KXtcbiAgICByZXR1cm4gXCJcIiArIChpbmRleCA9PT0gY3VycmVudEluZGV4ID8gXCI+XCIgOiBcIiBcIikgKyBcIiBcIiArIHRoaXMudGV4dDtcbiAgfSxcbiAgZmFpbHVyZTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgICBHQU1FIE9WRVJcXG5cXG4gICAgIFNjb3JlXFxuXFxuICBTaW5nbGUgLSBcIiArIHRoaXMuc2NvcmUuc2luZ2xlcyArIFwiXFxuICBEb3VibGUgLSBcIiArIHRoaXMuc2NvcmUuZG91YmxlcyArIFwiXFxuICBUcmlwbGUgLSBcIiArIHRoaXMuc2NvcmUudHJpcGxlcyArIFwiXFxuICBUZXRyaXMgLSBcIiArIHRoaXMuc2NvcmUudGV0cmlzICsgXCJcXG5cXG5Ub3RhbCBMaW5lczogXCIgKyB0aGlzLnNjb3JlLmxpbmVzICsgXCJcXG5cXG5cIiArIHRlbXBsYXRlLm1lbnVJdGVtcy5hcHBseSh0aGlzLmZhaWxNZW51U3RhdGUpO1xuICB9XG59O1xub3V0JC5EZWJ1Z091dHB1dCA9IERlYnVnT3V0cHV0ID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnT3V0cHV0LmRpc3BsYXlOYW1lID0gJ0RlYnVnT3V0cHV0JztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnT3V0cHV0LnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z091dHB1dDtcbiAgZnVuY3Rpb24gRGVidWdPdXRwdXQoKXtcbiAgICB2YXIgcmVmJDtcbiAgICB0aGlzLmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kYm8pO1xuICAgIHJlZiQgPSB0aGlzLmRiby5zdHlsZTtcbiAgICByZWYkLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICByZWYkLnRvcCA9IDA7XG4gICAgcmVmJC5sZWZ0ID0gMDtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgIHN3aXRjaCAoc3RhdGUubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUuZmFpbHVyZS5hcHBseShzdGF0ZSk7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUuc3RhcnRNZW51LmFwcGx5KHN0YXRlLnN0YXJ0TWVudVN0YXRlKTtcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSBcIlVua25vd24gbWV0YWdhbWUgc3RhdGU6IFwiICsgc3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgRnJhbWVEcml2ZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHJhZiA9IHJlZiQucmFmO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG5vdywgzpR0O1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJhZih0aGlzLmZyYW1lKTtcbiAgICB9XG4gICAgbm93ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuemVybztcbiAgICDOlHQgPSBub3cgLSB0aGlzLnN0YXRlLnRpbWU7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gbm93O1xuICAgIHRoaXMuc3RhdGUuZnJhbWUgPSB0aGlzLnN0YXRlLmZyYW1lICsgMTtcbiAgICB0aGlzLnN0YXRlLs6UdCA9IM6UdDtcbiAgICByZXR1cm4gdGhpcy5vbkZyYW1lKM6UdCwgdGhpcy5zdGF0ZS50aW1lLCB0aGlzLnN0YXRlLmZyYW1lKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdGFydCAtIHN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCBUaW1lciwgR2FtZVN0YXRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5vdXQkLkdhbWVTdGF0ZSA9IEdhbWVTdGF0ZSA9IChmdW5jdGlvbigpe1xuICBHYW1lU3RhdGUuZGlzcGxheU5hbWUgPSAnR2FtZVN0YXRlJztcbiAgdmFyIGRlZmF1bHRzLCBwcm90b3R5cGUgPSBHYW1lU3RhdGUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEdhbWVTdGF0ZTtcbiAgZGVmYXVsdHMgPSB7XG4gICAgbWV0YWdhbWVTdGF0ZTogJ25vLWdhbWUnLFxuICAgIGlucHV0U3RhdGU6IFtdLFxuICAgIGZvcmNlRG93bk1vZGU6IGZhbHNlLFxuICAgIGVsYXBzZWRUaW1lOiAwLFxuICAgIGVsYXBzZWRGcmFtZXM6IDAsXG4gICAgcm93c1RvUmVtb3ZlOiBbXSxcbiAgICBzbG93ZG93bjogMSxcbiAgICBmbGFnczoge1xuICAgICAgcm93c1JlbW92ZWRUaGlzRnJhbWU6IGZhbHNlXG4gICAgfSxcbiAgICBzY29yZToge1xuICAgICAgcG9pbnRzOiAwLFxuICAgICAgbGluZXM6IDAsXG4gICAgICBzaW5nbGVzOiAwLFxuICAgICAgZG91YmxlczogMCxcbiAgICAgIHRyaXBsZXM6IDAsXG4gICAgICB0ZXRyaXM6IDBcbiAgICB9LFxuICAgIGJyaWNrOiB7XG4gICAgICBuZXh0OiB2b2lkIDgsXG4gICAgICBjdXJyZW50OiB2b2lkIDhcbiAgICB9LFxuICAgIHRpbWVyczoge1xuICAgICAgZHJvcFRpbWVyOiBudWxsLFxuICAgICAgZm9yY2VEcm9wV2FpdFRpZW1yOiBudWxsLFxuICAgICAga2V5UmVwZWF0VGltZXI6IG51bGwsXG4gICAgICByZW1vdmFsQW5pbWF0aW9uOiBudWxsLFxuICAgICAgdGl0bGVSZXZlYWxUaW1lcjogbnVsbCxcbiAgICAgIGZhaWx1cmVSZXZlYWxUaW1lcjogbnVsbFxuICAgIH0sXG4gICAgb3B0aW9uczoge1xuICAgICAgdGlsZVdpZHRoOiAxMCxcbiAgICAgIHRpbGVIZWlnaHQ6IDE4LFxuICAgICAgdGlsZVNpemU6IDIwLFxuICAgICAgaGFyZERyb3BKb2x0QW1vdW50OiAwLjM1LFxuICAgICAgZHJvcFNwZWVkOiAzMDAsXG4gICAgICBmb3JjZURyb3BXYWl0VGltZTogMTAwLFxuICAgICAgcmVtb3ZhbEFuaW1hdGlvblRpbWU6IDUwMCxcbiAgICAgIGhhcmREcm9wRWZmZWN0VGltZTogMTAwLFxuICAgICAga2V5UmVwZWF0VGltZTogMTAwLFxuICAgICAgdGl0bGVSZXZlYWxUaW1lOiA0MDAwXG4gICAgfSxcbiAgICBhcmVuYToge1xuICAgICAgY2VsbHM6IFtbXV0sXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gR2FtZVN0YXRlKG9wdGlvbnMpe1xuICAgIGltcG9ydCQodGhpcywgZGVmYXVsdHMpO1xuICAgIGltcG9ydCQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmRyb3BTcGVlZCk7XG4gICAgdGhpcy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5mb3JjZURyb3BXYWl0VGltZSk7XG4gICAgdGhpcy50aW1lcnMua2V5UmVwZWF0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmtleVJlcGVhdFRpbWUpO1xuICAgIHRoaXMudGltZXJzLnJlbW92YWxBbmltYXRpb24gPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLnJlbW92YWxBbmltYXRpb25UaW1lKTtcbiAgICB0aGlzLnRpbWVycy5oYXJkRHJvcEVmZmVjdCA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuaGFyZERyb3BFZmZlY3RUaW1lKTtcbiAgICB0aGlzLnRpbWVycy50aXRsZVJldmVhbFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy50aXRsZVJldmVhbFRpbWUpO1xuICAgIHRoaXMudGltZXJzLmZhaWx1cmVSZXZlYWxUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMudGl0bGVSZXZlYWxUaW1lKTtcbiAgICB0aGlzLmFyZW5hID0gY29uc3RydWN0b3IubmV3QXJlbmEodGhpcy5vcHRpb25zLnRpbGVXaWR0aCwgdGhpcy5vcHRpb25zLnRpbGVIZWlnaHQpO1xuICAgIHRoaXMudGltZXJzLmhhcmREcm9wRWZmZWN0LmV4cGlyZSgpO1xuICB9XG4gIEdhbWVTdGF0ZS5uZXdBcmVuYSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpe1xuICAgIHZhciByb3csIGNlbGw7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNlbGxzOiAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGkkLCB0byQsIGxyZXN1bHQkLCBqJCwgdG8xJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgICAgZm9yIChpJCA9IDAsIHRvJCA9IGhlaWdodDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgICAgICByb3cgPSBpJDtcbiAgICAgICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgICAgIGZvciAoaiQgPSAwLCB0bzEkID0gd2lkdGg7IGokIDwgdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgY2VsbCA9IGokO1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgICAgfSgpKSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIEdhbWVTdGF0ZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmaWx0ZXIsIFRpbWVyLCBrZXlSZXBlYXRUaW1lLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIG5ld0JsYW5rS2V5c3RhdGUsIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmlsdGVyID0gcmVmJC5maWx0ZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbmtleVJlcGVhdFRpbWUgPSAxNTA7XG5LRVkgPSB7XG4gIFJFVFVSTjogMTMsXG4gIEVTQ0FQRTogMjcsXG4gIFNQQUNFOiAzMixcbiAgTEVGVDogMzcsXG4gIFVQOiAzOCxcbiAgUklHSFQ6IDM5LFxuICBET1dOOiA0MCxcbiAgWjogOTAsXG4gIFg6IDg4LFxuICBPTkU6IDQ5LFxuICBUV086IDUwLFxuICBUSFJFRTogNTEsXG4gIEZPVVI6IDUyLFxuICBGSVZFOiA1MyxcbiAgU0lYOiA1NCxcbiAgU0VWRU46IDU1LFxuICBFSUdIVDogNTYsXG4gIE5JTkU6IDU3LFxuICBaRVJPOiA0OFxufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2NhbmNlbCcsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnaGFyZC1kcm9wJywgcmVmJFtLRVkuWCArIFwiXCJdID0gJ2N3JywgcmVmJFtLRVkuWiArIFwiXCJdID0gJ2NjdycsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlJJR0hUICsgXCJcIl0gPSAncmlnaHQnLCByZWYkW0tFWS5ET1dOICsgXCJcIl0gPSAnZG93bicsIHJlZiRbS0VZLk9ORSArIFwiXCJdID0gJ2RlYnVnLTEnLCByZWYkW0tFWS5UV08gKyBcIlwiXSA9ICdkZWJ1Zy0yJywgcmVmJFtLRVkuVEhSRUUgKyBcIlwiXSA9ICdkZWJ1Zy0zJywgcmVmJFtLRVkuRk9VUiArIFwiXCJdID0gJ2RlYnVnLTQnLCByZWYkW0tFWS5GSVZFICsgXCJcIl0gPSAnZGVidWctNScsIHJlZiRbS0VZLlNJWCArIFwiXCJdID0gJ2RlYnVnLTYnLCByZWYkW0tFWS5TRVZFTiArIFwiXCJdID0gJ2RlYnVnLTcnLCByZWYkW0tFWS5FSUdIVCArIFwiXCJdID0gJ2RlYnVnLTgnLCByZWYkW0tFWS5OSU5FICsgXCJcIl0gPSAnZGVidWctOScsIHJlZiRbS0VZLlpFUk8gKyBcIlwiXSA9ICdkZWJ1Zy0wJywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihrZXksIHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBhY3Rpb246IHN0YXRlID8gJ2Rvd24nIDogJ3VwJ1xuICB9O1xufTtcbm5ld0JsYW5rS2V5c3RhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHVwOiBmYWxzZSxcbiAgICBkb3duOiBmYWxzZSxcbiAgICBsZWZ0OiBmYWxzZSxcbiAgICByaWdodDogZmFsc2UsXG4gICAgYWN0aW9uQTogZmFsc2UsXG4gICAgYWN0aW9uQjogZmFsc2UsXG4gICAgY29uZmlybTogZmFsc2UsXG4gICAgY2FuY2VsOiBmYWxzZVxuICB9O1xufTtcbm91dCQuSW5wdXRIYW5kbGVyID0gSW5wdXRIYW5kbGVyID0gKGZ1bmN0aW9uKCl7XG4gIElucHV0SGFuZGxlci5kaXNwbGF5TmFtZSA9ICdJbnB1dEhhbmRsZXInO1xuICB2YXIgcHJvdG90eXBlID0gSW5wdXRIYW5kbGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBJbnB1dEhhbmRsZXI7XG4gIGZ1bmN0aW9uIElucHV0SGFuZGxlcigpe1xuICAgIHRoaXMuc3RhdGVTZXR0ZXIgPSBiaW5kJCh0aGlzLCAnc3RhdGVTZXR0ZXInLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIklucHV0SGFuZGxlcjo6bmV3XCIpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnN0YXRlU2V0dGVyKHRydWUpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc3RhdGVTZXR0ZXIoZmFsc2UpKTtcbiAgICB0aGlzLmN1cnJLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgICB0aGlzLmxhc3RLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgfVxuICBwcm90b3R5cGUuc3RhdGVTZXR0ZXIgPSBjdXJyeSQoKGZ1bmN0aW9uKHN0YXRlLCBhcmckKXtcbiAgICB2YXIgd2hpY2gsIGtleTtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKGtleSA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgdGhpcy5jdXJyS2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgaWYgKHN0YXRlID09PSB0cnVlICYmIHRoaXMubGFzdEhlbGRLZXkgIT09IGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0SGVsZEtleSA9IGtleTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLCB0cnVlKTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGtleSwgc3RhdGUsIHdhc0RpZmZlcmVudDtcbiAgICByZXR1cm4gZmlsdGVyKGlkLCAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuY3VycktleXN0YXRlKSB7XG4gICAgICAgIHN0YXRlID0gcmVmJFtrZXldO1xuICAgICAgICB3YXNEaWZmZXJlbnQgPSBzdGF0ZSAhPT0gdGhpcy5sYXN0S2V5c3RhdGVba2V5XTtcbiAgICAgICAgdGhpcy5sYXN0S2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgICBpZiAod2FzRGlmZmVyZW50KSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChldmVudFN1bW1hcnkoa2V5LCBzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIGlmICh0aGlzLnRhcmdldFRpbWUgPT09IDApIHtcbiAgICAgIHRocm93IFwiVGltZXI6OnJlc2V0IC0gdGFyZ2V0IHRpbWUgbXVzdCBiZSBub24temVyb1wiO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnN0YXRlID0gYmVnaW4gPyBUSU1FUl9BQ1RJVkUgOiBUSU1FUl9FWFBJUkVEO1xuICAgIHRoaXMuYWN0aXZlID0gYmVnaW47XG4gICAgdGhpcy5leHBpcmVkID0gIWJlZ2luO1xuICAgIGFsbFRpbWVycy5wdXNoKHRoaXMpO1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdhY3RpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFRJTUVSX0FDVElWRTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAnZXhwaXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfRVhQSVJFRDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncHJvZ3Jlc3MnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWUgLyB0aGlzLnRhcmdldFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLmV4cGlyZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd0aW1lVG9FeHBpcnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGV4cFRpbWUpe1xuICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZSAtIGV4cFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IM6UdDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMudGFyZ2V0VGltZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIGlmICh0aW1lID09PSAwKSB7XG4gICAgICB0aHJvdyBcIlRpbWVyOjpyZXNldCAtIHRhcmdldCB0aW1lIG11c3QgYmUgbm9uLXplcm9cIjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0V2l0aFJlbWFpbmRlciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRoaXMudGFyZ2V0VGltZSk7XG4gICAgaWYgKHRpbWUgPT09IDApIHtcbiAgICAgIHRocm93IFwiVGltZXI6OnJlc2V0IC0gdGFyZ2V0IHRpbWUgbXVzdCBiZSBub24temVyb1wiO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIHRpbWU7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfRVhQSVJFRDtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuc3BsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZvciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMudGltZVRvRXhwaXJ5ID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJUSU1FUjogXCIgKyB0aGlzLnRhcmdldFRpbWUgKyBcIlxcblNUQVRFOiBcIiArIHRoaXMuc3RhdGUgKyBcIiAoXCIgKyB0aGlzLmFjdGl2ZSArIFwifFwiICsgdGhpcy5leHBpcmVkICsgXCIpXFxuXCIgKyBwcm9nYmFyKHRoaXMuY3VycmVudFRpbWUsIHRoaXMudGFyZ2V0VGltZSk7XG4gIH07XG4gIFRpbWVyLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnVwZGF0ZSjOlHQpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gVGltZXI7XG59KCkpO1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nJChzdHIsIG4pe1xuICBmb3IgKHZhciByID0gJyc7IG4gPiAwOyAobiA+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHIgKz0gc3RyO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSJdfQ==
