(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ref$, log, delay, FrameDriver, InputHandler, DebugOutput, TetrisGame, ThreeJsRenderer;
ref$ = require('std'), log = ref$.log, delay = ref$.delay;
FrameDriver = require('./utils/frame-driver').FrameDriver;
InputHandler = require('./utils/input-handler').InputHandler;
DebugOutput = require('./utils/debug-output').DebugOutput;
TetrisGame = require('./game').TetrisGame;
ThreeJsRenderer = require('./renderer').ThreeJsRenderer;
document.addEventListener('DOMContentLoaded', function(){
  var gameState, gameOptions, renderOptions, inputHandler, tetrisGame, renderer, timeFactor, debugOutput, frameDriver;
  gameState = {
    metagameState: 'no-game'
  };
  gameOptions = require('./config/game');
  renderOptions = require('./config/scene');
  inputHandler = new InputHandler;
  tetrisGame = new TetrisGame(gameState, gameOptions);
  renderer = new ThreeJsRenderer(renderOptions, gameState);
  timeFactor = 1;
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
  return frameDriver.start();
});
},{"./config/game":6,"./config/scene":7,"./game":13,"./renderer":37,"./utils/debug-output":43,"./utils/frame-driver":44,"./utils/input-handler":45,"std":42}],2:[function(require,module,exports){
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
var arenaWidth, arenaHeight, timeFactor, startingLevel, startingDropSpeed, keyRepeatTime, softDropWaitTime, animation, out$ = typeof exports != 'undefined' && exports || this;
out$.arenaWidth = arenaWidth = 10;
out$.arenaHeight = arenaHeight = 18;
out$.timeFactor = timeFactor = 1;
out$.startingLevel = startingLevel = 0;
out$.startingDropSpeed = startingDropSpeed = 500;
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
var gameOptions, p2m;
gameOptions = require('./game');
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
  cameraDistanceFromEdge: 0.5,
  cameraElevation: 0.0,
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
  previewScaleFactor: 0.5,
  gameOptions: gameOptions
};
},{"./game":6}],8:[function(require,module,exports){
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
},{"../utils/timer":46,"./brick":9,"std":42}],9:[function(require,module,exports){
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
},{"./data/brick-shapes":10,"std":42}],10:[function(require,module,exports){
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
var ref$, id, log, addV2, randInt, wrap, randomFrom, Ease, Timer, primeGameState, animationTimeForRows, resetDropTimer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom, Ease = ref$.Ease;
Timer = require('../utils/timer');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.core = {
    paused: false,
    slowdown: 1,
    softDropMode: false,
    rowsToRemove: [],
    rowsRemovedThisFrame: false,
    startingDropSpeed: options.startingDropSpeed,
    dropTimer: Timer.create("Drop timer", options.startingDropSpeed, true),
    keyRepeatTimer: Timer.create("Key repeat", options.keyRepeatTime),
    softDropWaitTimer: Timer.create("Soft-drop wait time", options.softDropWaitTime),
    hardDropAnimation: Timer.create("Hard-drop animation", options.animation.hardDropEffectTime, true),
    previewRevealAnimation: Timer.create("Next brick animation", options.animation.previewRevealTime)
  };
};
out$.animationTimeForRows = animationTimeForRows = function(rows){
  return 10 + Math.pow(3, rows.length);
};
out$.resetDropTimer = resetDropTimer = function(core){
  return Timer.reset(core.dropTimer, core.startingDropSpeed);
};
},{"../utils/timer":46,"std":42}],12:[function(require,module,exports){
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
},{"../utils/timer":46,"std":42}],13:[function(require,module,exports){
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
    Core.resetDropTimer(gs.core);
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
          lresult$.push(Score.updateScore(gs, gs.core.rowsToRemove));
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
          break;
        case 'debug-7':
          gs.score.level += 1;
          lresult$.push(Timer.reset(gs.core.dropTimer, Score.getDropTimeout(gs.score)));
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
      Score.updateScore(gs, gs.core.rowsToRemove);
      Timer.reset(gs.core.dropTimer, Score.getDropTimeout(gs.score));
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
        gs.core.softDropMode = false;
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
},{"../utils/timer":46,"./arena":8,"./brick":9,"./game-core":11,"./game-over":12,"./score":14,"./start-menu":15,"std":42}],14:[function(require,module,exports){
var ref$, id, log, min, div, addV2, randInt, wrap, randomFrom, BrickShapes, primeGameState, computeScore, getDropTimeout, updateScore, resetScore, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, min = ref$.min, div = ref$.div, addV2 = ref$.addV2, randInt = ref$.randInt, wrap = ref$.wrap, randomFrom = ref$.randomFrom;
BrickShapes = require('./data/brick-shapes');
out$.primeGameState = primeGameState = function(gs, options){
  return gs.score = {
    points: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetris: 0,
    level: options.startingLevel,
    startingLevel: options.startingLevel
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
out$.getDropTimeout = getDropTimeout = function(arg$){
  var level;
  level = arg$.level;
  return (10 - min(9, level)) * 50;
};
out$.updateScore = updateScore = function(arg$, rows, lvl){
  var score, points, lines;
  score = arg$.score;
  lvl == null && (lvl = 0);
  points = computeScore(rows, score.level);
  score.points += points;
  score.lines += lines = rows.length;
  switch (lines) {
  case 1:
    score.singles += 1;
    break;
  case 2:
    score.doubles += 1;
    break;
  case 3:
    score.triples += 1;
    break;
  case 4:
    score.tetris += 1;
  }
  if (div(score.lines, score.level + 1) >= 10) {
    return score.level += 1;
  }
};
out$.resetScore = resetScore = function(score){
  return import$(score, {
    points: 0,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    tetris: 0,
    level: score.startingLevel
  });
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./data/brick-shapes":10,"std":42}],15:[function(require,module,exports){
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
},{"../utils/timer":46,"std":42}],16:[function(require,module,exports){
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
},{"../mats":38,"./base":18,"std":42}],17:[function(require,module,exports){
var ref$, id, log, max, rand, Ease, Base, Frame, FallingBrick, Guide, ArenaCells, ParticleEffect, Arena, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, max = ref$.max, rand = ref$.rand, Ease = ref$.Ease;
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
    p = max(0, 1 - gs.core.hardDropAnimation.progress);
    p = Ease.elasticIn(p, 0, 1);
    zz = gs.core.rowsToRemove.length;
    return jolt = -p * (1 + zz) * this.opts.hardDropJoltAmount;
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
    this.parts.guide.showFlare(gs.core.hardDropAnimation.progress, gs.core.hardDropDistance);
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
},{"./arena-cells":16,"./base":18,"./falling-brick":22,"./frame":23,"./guide":24,"./particle-effect":29,"std":42}],18:[function(require,module,exports){
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
},{"../mats":38,"std":42}],19:[function(require,module,exports){
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
},{"./base":18,"./brick":20,"std":42}],20:[function(require,module,exports){
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
},{"../mats":38,"./base":18,"std":42}],21:[function(require,module,exports){
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
},{"./base":18,"std":42}],22:[function(require,module,exports){
var ref$, id, log, floor, Base, Brick, FallingBrick, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, floor = ref$.floor;
Base = require('./base').Base;
Brick = require('./brick').Brick;
out$.FallingBrick = FallingBrick = (function(superclass){
  var prototype = extend$((import$(FallingBrick, superclass).displayName = 'FallingBrick', FallingBrick), superclass).prototype, constructor = FallingBrick;
  function FallingBrick(opts, gs){
    var spaceAdjustment, xOffset, yOffset;
    this.opts = opts;
    FallingBrick.superclass.apply(this, arguments);
    this.grid = opts.gridSize;
    this.height = this.grid * gs.arena.height;
    this.brick = new Brick(this.opts, gs);
    log(opts);
    spaceAdjustment = (this.grid - this.opts.blockSize) / 2;
    xOffset = floor(this.opts.gameOptions.arenaWidth / -2 + 2);
    yOffset = -1.5;
    this.registration.add(this.brick.root);
    this.registration.position.x = xOffset * this.grid - spaceAdjustment;
    this.registration.position.y = yOffset * this.grid + spaceAdjustment;
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
},{"./base":18,"./brick":20,"std":42}],23:[function(require,module,exports){
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
},{"./base":18,"std":42}],24:[function(require,module,exports){
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
    var g, beamShape, x;
    if (p === 0) {
      g = this.opts.gridSize;
      this.state.lastShape = beamShape = this.state.thisShape;
      this.flare.material.materials.map(function(it){
        var ref$;
        return (ref$ = it.emissive) != null ? ref$.setHex(beamShape.color) : void 8;
      });
      x = this.positionBeam(this.flare, beamShape);
      this.flare.scale.y = g * (1 + dropped) / this.height;
      this.flare.position.y = this.height - g * beamShape.height;
      this.impactLight.hex = beamShape.color;
      this.impactLight.position.x = x;
      this.impactLight.position.y = this.height - g * beamShape.height;
    }
    this.flare.material.materials.map(function(it){
      return it.opacity = 1 - p;
    });
    return this.impactLight.distance = this.opts.gridSize * 3 + this.opts.gridSize * 3 * sin(this.gs.elapsedTime / 1000);
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
},{"../mats":38,"../palette":39,"./base":18,"std":42}],25:[function(require,module,exports){
var ref$, Arena, Title, Table, BrickPreview, Lighting, NixieDisplay, Topside, Underside, out$ = typeof exports != 'undefined' && exports || this;
import$(out$, (ref$ = require('./arena'), Arena = ref$.Arena, ref$));
import$(out$, (ref$ = require('./title'), Title = ref$.Title, ref$));
import$(out$, (ref$ = require('./table'), Table = ref$.Table, ref$));
import$(out$, (ref$ = require('./brick-preview'), BrickPreview = ref$.BrickPreview, ref$));
import$(out$, (ref$ = require('./lighting'), Lighting = ref$.Lighting, ref$));
import$(out$, (ref$ = require('./nixie'), NixieDisplay = ref$.NixieDisplay, ref$));
import$(out$, (ref$ = require('./topside'), Topside = ref$.Topside, ref$));
import$(out$, (ref$ = require('./underside'), Underside = ref$.Underside, ref$));
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
},{"./arena":17,"./brick-preview":19,"./lighting":27,"./nixie":28,"./table":31,"./title":32,"./topside":33,"./underside":34}],26:[function(require,module,exports){
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
},{"../mats":38,"./base":18,"std":42}],27:[function(require,module,exports){
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
},{"./base":18,"std":42}],28:[function(require,module,exports){
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
},{"../geometry/capsule":36,"../mats":38,"./base":18,"./led":26,"std":42}],29:[function(require,module,exports){
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
},{"../palette":39,"./base":18,"std":42}],30:[function(require,module,exports){
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
},{"./base":18,"./title":32,"std":42}],31:[function(require,module,exports){
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
},{"../mats":38,"./base":18,"std":42}],32:[function(require,module,exports){
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
},{"../mats":38,"./base":18,"std":42}],33:[function(require,module,exports){
var ref$, id, log, Base, StartMenu, FailScreen, Topside, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Base = require('./base').Base;
StartMenu = require('./start-menu').StartMenu;
FailScreen = require('./fail-screen').FailScreen;
out$.Topside = Topside = (function(superclass){
  var prototype = extend$((import$(Topside, superclass).displayName = 'Topside', Topside), superclass).prototype, constructor = Topside;
  function Topside(opts, gs){
    this.opts = opts;
    log("Topside::new");
    Topside.superclass.apply(this, arguments);
    this.startMenu = new StartMenu(this.opts, gs);
    this.failScreen = new FailScreen(this.opts, gs);
    this.startMenu.addTo(this.root);
    this.failScreen.addTo(this.root);
  }
  return Topside;
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
},{"./base":18,"./fail-screen":21,"./start-menu":30,"std":42}],34:[function(require,module,exports){
var ref$, id, log, Base, Underside, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
Base = require('./base').Base;
out$.Underside = Underside = (function(superclass){
  var prototype = extend$((import$(Underside, superclass).displayName = 'Underside', Underside), superclass).prototype, constructor = Underside;
  function Underside(opts, gs){
    this.opts = opts;
    log("Underside::new");
  }
  return Underside;
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
},{"./base":18,"std":42}],35:[function(require,module,exports){
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
},{"std":42}],36:[function(require,module,exports){
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
},{"std":42}],37:[function(require,module,exports){
var ref$, id, log, pi, sin, cos, lerp, rand, floor, map, Ease, THREE, Palette, SceneManager, DebugCameraPositioner, Arena, Table, StartMenu, FailScreen, Lighting, BrickPreview, NixieDisplay, Topside, TrackballControls, ThreeJsRenderer, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, pi = ref$.pi, sin = ref$.sin, cos = ref$.cos, lerp = ref$.lerp, rand = ref$.rand, floor = ref$.floor, map = ref$.map;
Ease = require('std').Ease;
THREE = require('three-js-vr-extensions');
Palette = require('./palette').Palette;
SceneManager = require('./scene-manager').SceneManager;
DebugCameraPositioner = require('./debug-camera').DebugCameraPositioner;
ref$ = require('./components'), Arena = ref$.Arena, Table = ref$.Table, StartMenu = ref$.StartMenu, FailScreen = ref$.FailScreen, Lighting = ref$.Lighting, BrickPreview = ref$.BrickPreview, NixieDisplay = ref$.NixieDisplay;
Topside = require('./components').Topside;
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
      nextBrick: new BrickPreview(this.opts, gs),
      score: new NixieDisplay(this.opts, gs),
      topside: new Topside(this.opts, gs),
      startMenu: new StartMenu(this.opts, gs),
      failScreen: new FailScreen(this.opts, gs)
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
  prototype.setMenuFacing = function(){};
  prototype.setGameFacing = function(){};
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
},{"../../lib/trackball-controls.js":5,"./components":25,"./debug-camera":35,"./palette":39,"./scene-manager":40,"std":42,"three-js-vr-extensions":4}],38:[function(require,module,exports){
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
},{"./palette":39,"std":42}],39:[function(require,module,exports){
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
},{"std":42,"three-js-vr-extensions":4}],40:[function(require,module,exports){
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
},{"./mats":38,"std":42,"three-js-vr-extensions":4}],41:[function(require,module,exports){
var ref$, log, pow, tau, linear, quadIn, quadOut, cubicIn, cubicOut, quartIn, quartOut, quintIn, quintOut, expIn, expOut, circIn, circOut, elastic, slack, elasticIn, elasticOut, drawTestGraphs, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), log = ref$.log, pow = ref$.pow, tau = ref$.tau;
out$.linear = linear = function(t, b, e, c){
  c == null && (c = e - b);
  return c * t + b;
};
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
out$.circIn = circIn = function(t, b, e, c){
  c == null && (c = e - b);
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
};
out$.circOut = circOut = function(t, b, e, c){
  c == null && (c = e - b);
  return c * Math.sqrt(1 - t * t) + b;
};
elastic = function(t, b, c, p, λ){
  var s;
  if (t === 0) {
    return b;
  }
  if (t === 1) {
    return b + c;
  }
  s = c < Math.abs(c)
    ? p / 4
    : p / tau * Math.asin(1);
  return λ(s, p);
};
slack = 0.6;
out$.elasticIn = elasticIn = function(t, b, e, c){
  c == null && (c = e - b);
  return elastic(t, b, e, slack, function(s, p){
    return -(c * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * tau / p)) + b;
  });
};
out$.elasticOut = elasticOut = function(t, b, e, c){
  c == null && (c = e - b);
  return elastic(t, b, e, slack, function(s, p){
    return c * Math.pow(2, -10 * t) * Math.sin((t - s) * tau / p) + c + b;
  });
};
/*
easeInBack: function (x, t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*(t/=d)*t*((s+1)*t - s) + b;
},
easeOutBack: function (x, t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
},
easeInBounce: function (x, t, b, c, d) {
  return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
},
easeOutBounce: function (x, t, b, c, d) {
  if ((t/=d) < (1/2.75)) {
    return c*(7.5625*t*t) + b;
  } else if (t < (2/2.75)) {
    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
  } else if (t < (2.5/2.75)) {
    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
  } else {
    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
  }
},
*/
drawTestGraphs = function(){
  var top, btm, range, i$, ref$, len$, el, easeName, ease, lresult$, cnv, ctx, i, p, results$ = [];
  top = 170;
  btm = 30;
  range = top - btm;
  for (i$ = 0, len$ = (ref$ = document.querySelectorAll('canvas')).length; i$ < len$; ++i$) {
    el = ref$[i$];
    el.style.display = 'none';
  }
  for (easeName in ref$ = module.exports) {
    ease = ref$[easeName];
    lresult$ = [];
    cnv = document.createElement('canvas');
    cnv.width = 200;
    cnv.height = 200;
    cnv.style.background = 'lightblue';
    cnv.style.borderLeft = "3px solid black";
    ctx = cnv.getContext('2d');
    document.body.appendChild(cnv);
    ctx.strokeStyle = 'white';
    ctx.moveTo(0, top + 0.5);
    ctx.lineTo(200, top + 0.5);
    ctx.moveTo(0, btm + 0.5);
    ctx.lineTo(200, btm + 0.5);
    ctx.stroke();
    ctx.font = "14px monospace";
    ctx.fillText(easeName, 2, 16, 200);
    ctx.fillStyle = 'blue';
    for (i$ = 0; i$ <= 100; ++i$) {
      i = i$;
      p = i / 100;
      lresult$.push(ctx.fillRect(2 * i, top - ease(p, 0, range), 2, 2));
    }
    results$.push(lresult$);
  }
  return results$;
};
},{"std":42}],42:[function(require,module,exports){
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
},{"./easing":41}],43:[function(require,module,exports){
var ref$, id, log, unlines, Timer, typeDetect, template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, unlines = ref$.unlines;
Timer = require('../utils/timer');
typeDetect = function(thing){
  if (typeof thing !== 'object') {
    return typeof thing;
  } else if (thing.cells != null) {
    return 'arena';
  } else if (thing.pos != null) {
    return 'brick';
  } else if (thing.progress != null) {
    return 'timer';
  } else {
    return 'object';
  }
};
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
  fps: function(){
    var fpsColor;
    fpsColor = this.fps >= 55
      ? '#0f0'
      : this.fps >= 30 ? '#ff0' : '#f00';
    return "<span style=\"color:" + fpsColor + "\">" + this.fps + "</span>";
  },
  normal: function(){
    return " meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n  fps - " + template.fps.apply(this) + "\n keys - " + template.keys.apply(this.inputState) + "\n\n  " + template.dump(this, 2);
  },
  timer: function(it){
    return Timer.toString(it);
  },
  dump: function(obj, depth){
    var space, k, v;
    depth == null && (depth = 0);
    space = (function(it){
      return repeatString$(" ", depth) + it;
    });
    switch (typeDetect(obj)) {
    case 'timer':
      return space(template.timer(obj));
    case 'string':
      return space(obj);
    case 'number':
      return space(obj);
    case 'arena':
      break;
    case 'brick':
      break;
    default:
      return unlines((function(){
        var ref$, results$ = [];
        for (k in ref$ = obj) {
          v = ref$[k];
          results$.push(k + ":" + template.dump(v, depth + 2));
        }
        return results$;
      }()));
    }
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
    return "START MENU\n" + template.menuItems.apply(this) + "\n\n" + template.dump(this, 2);
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
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
},{"../utils/timer":46,"std":42}],44:[function(require,module,exports){
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
    this.state.zero = Date.now();
    this.state.time = 0;
    this.state.running = true;
    return this.frame();
  };
  prototype.stop = function(){
    if (this.state.running === false) {
      return;
    }
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
},{"std":42}],45:[function(require,module,exports){
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
},{"./timer":46,"std":42}],46:[function(require,module,exports){
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
},{"std":42}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL1ZSQ29udHJvbHMuanMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi9tb3p2ci9WUkVmZmVjdC5qcyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvdHJhY2tiYWxsLWNvbnRyb2xzLmpzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvY29uZmlnL2dhbWUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9jb25maWcvc2NlbmUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2FyZW5hLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9icmljay5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZ2FtZS1vdmVyLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvc2NvcmUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL3N0YXJ0LW1lbnUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hcmVuYS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYmFzZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2subHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2ZhaWwtc2NyZWVuLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWxsaW5nLWJyaWNrLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mcmFtZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZ3VpZGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2luZGV4LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9sZWQubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2xpZ2h0aW5nLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9uaXhpZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvcGFydGljbGUtZWZmZWN0LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9zdGFydC1tZW51LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvdGl0bGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL3RvcHNpZGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL3VuZGVyc2lkZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2RlYnVnLWNhbWVyYS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2dlb21ldHJ5L2NhcHN1bGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9pbmRleC5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL21hdHMubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9wYWxldHRlLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvc2NlbmUtbWFuYWdlci5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3N0ZC9lYXNpbmcubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9zdGQvaW5kZXgubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9kZWJ1Zy1vdXRwdXQubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9mcmFtZS1kcml2ZXIubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9pbnB1dC1oYW5kbGVyLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvdGltZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam1CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcmVmJCwgbG9nLCBkZWxheSwgRnJhbWVEcml2ZXIsIElucHV0SGFuZGxlciwgRGVidWdPdXRwdXQsIFRldHJpc0dhbWUsIFRocmVlSnNSZW5kZXJlcjtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIGRlbGF5ID0gcmVmJC5kZWxheTtcbkZyYW1lRHJpdmVyID0gcmVxdWlyZSgnLi91dGlscy9mcmFtZS1kcml2ZXInKS5GcmFtZURyaXZlcjtcbklucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vdXRpbHMvaW5wdXQtaGFuZGxlcicpLklucHV0SGFuZGxlcjtcbkRlYnVnT3V0cHV0ID0gcmVxdWlyZSgnLi91dGlscy9kZWJ1Zy1vdXRwdXQnKS5EZWJ1Z091dHB1dDtcblRldHJpc0dhbWUgPSByZXF1aXJlKCcuL2dhbWUnKS5UZXRyaXNHYW1lO1xuVGhyZWVKc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpLlRocmVlSnNSZW5kZXJlcjtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuICB2YXIgZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucywgcmVuZGVyT3B0aW9ucywgaW5wdXRIYW5kbGVyLCB0ZXRyaXNHYW1lLCByZW5kZXJlciwgdGltZUZhY3RvciwgZGVidWdPdXRwdXQsIGZyYW1lRHJpdmVyO1xuICBnYW1lU3RhdGUgPSB7XG4gICAgbWV0YWdhbWVTdGF0ZTogJ25vLWdhbWUnXG4gIH07XG4gIGdhbWVPcHRpb25zID0gcmVxdWlyZSgnLi9jb25maWcvZ2FtZScpO1xuICByZW5kZXJPcHRpb25zID0gcmVxdWlyZSgnLi9jb25maWcvc2NlbmUnKTtcbiAgaW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcjtcbiAgdGV0cmlzR2FtZSA9IG5ldyBUZXRyaXNHYW1lKGdhbWVTdGF0ZSwgZ2FtZU9wdGlvbnMpO1xuICByZW5kZXJlciA9IG5ldyBUaHJlZUpzUmVuZGVyZXIocmVuZGVyT3B0aW9ucywgZ2FtZVN0YXRlKTtcbiAgdGltZUZhY3RvciA9IDE7XG4gIGRlYnVnT3V0cHV0ID0gbmV3IERlYnVnT3V0cHV0O1xuICBJbnB1dEhhbmRsZXIub24oMTkyLCBmdW5jdGlvbigpe1xuICAgIGlmIChmcmFtZURyaXZlci5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RvcCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnJhbWVEcml2ZXIuc3RhcnQoKTtcbiAgICB9XG4gIH0pO1xuICBJbnB1dEhhbmRsZXIub24oMjcsIGZ1bmN0aW9uKCl7XG4gICAgZ2FtZVN0YXRlLmNvcmUucGF1c2VkID0gIWdhbWVTdGF0ZS5jb3JlLnBhdXNlZDtcbiAgICByZXR1cm4gbG9nKGdhbWVTdGF0ZS5jb3JlLnBhdXNlZCA/IFwiR2FtZSB0aW1lIHBhdXNlZFwiIDogXCJHYW1lIHRpbWUgdW5wYXVzZWRcIik7XG4gIH0pO1xuICBmcmFtZURyaXZlciA9IG5ldyBGcmFtZURyaXZlcihmdW5jdGlvbijOlHQsIHRpbWUsIGZyYW1lLCBmcHMpe1xuICAgIGdhbWVTdGF0ZSA9IHRldHJpc0dhbWUudXBkYXRlKGdhbWVTdGF0ZSwge1xuICAgICAgaW5wdXQ6IGlucHV0SGFuZGxlci5jaGFuZ2VzU2luY2VMYXN0RnJhbWUoKSxcbiAgICAgIM6UdDogzpR0IC8gdGltZUZhY3RvcixcbiAgICAgIHRpbWU6IHRpbWUgLyB0aW1lRmFjdG9yLFxuICAgICAgZnJhbWU6IGZyYW1lLFxuICAgICAgZnBzOiBmcHNcbiAgICB9KTtcbiAgICByZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlKTtcbiAgICByZXR1cm4gZGVidWdPdXRwdXQgIT0gbnVsbCA/IGRlYnVnT3V0cHV0LnJlbmRlcihnYW1lU3RhdGUpIDogdm9pZCA4O1xuICB9KTtcbiAgcmVuZGVyZXIuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG4gIHJldHVybiBmcmFtZURyaXZlci5zdGFydCgpO1xufSk7IiwiLyoqXG4gKiBAYXV0aG9yIGRtYXJjb3MgLyBodHRwczovL2dpdGh1Yi5jb20vZG1hcmNvc1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICovXG5cblRIUkVFLlZSQ29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgb25FcnJvciApIHtcblxuXHR2YXIgc2NvcGUgPSB0aGlzO1xuXHR2YXIgdnJJbnB1dHMgPSBbXTtcblxuXHRmdW5jdGlvbiBmaWx0ZXJJbnZhbGlkRGV2aWNlcyggZGV2aWNlcyApIHtcblxuXHRcdC8vIEV4Y2x1ZGUgQ2FyZGJvYXJkIHBvc2l0aW9uIHNlbnNvciBpZiBPY3VsdXMgZXhpc3RzLlxuXHRcdHZhciBvY3VsdXNEZXZpY2VzID0gZGV2aWNlcy5maWx0ZXIoIGZ1bmN0aW9uICggZGV2aWNlICkge1xuXHRcdFx0cmV0dXJuIGRldmljZS5kZXZpY2VOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignb2N1bHVzJykgIT09IC0xO1xuXHRcdH0gKTtcblxuXHRcdGlmICggb2N1bHVzRGV2aWNlcy5sZW5ndGggPj0gMSApIHtcblx0XHRcdHJldHVybiBkZXZpY2VzLmZpbHRlciggZnVuY3Rpb24gKCBkZXZpY2UgKSB7XG5cdFx0XHRcdHJldHVybiBkZXZpY2UuZGV2aWNlTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2NhcmRib2FyZCcpID09PSAtMTtcblx0XHRcdH0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGRldmljZXM7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ290VlJEZXZpY2VzKCBkZXZpY2VzICkge1xuXHRcdGRldmljZXMgPSBmaWx0ZXJJbnZhbGlkRGV2aWNlcyggZGV2aWNlcyApO1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0aWYgKCBkZXZpY2VzWyBpIF0gaW5zdGFuY2VvZiBQb3NpdGlvblNlbnNvclZSRGV2aWNlICkge1xuXHRcdFx0XHR2cklucHV0cy5wdXNoKCBkZXZpY2VzWyBpIF0gKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCAnSE1EIG5vdCBhdmFpbGFibGUnICk7XG5cdH1cblxuXHRpZiAoIG5hdmlnYXRvci5nZXRWUkRldmljZXMgKSB7XG5cdFx0bmF2aWdhdG9yLmdldFZSRGV2aWNlcygpLnRoZW4oIGdvdFZSRGV2aWNlcyApO1xuXHR9XG5cblx0Ly8gdGhlIFJpZnQgU0RLIHJldHVybnMgdGhlIHBvc2l0aW9uIGluIG1ldGVyc1xuXHQvLyB0aGlzIHNjYWxlIGZhY3RvciBhbGxvd3MgdGhlIHVzZXIgdG8gZGVmaW5lIGhvdyBtZXRlcnNcblx0Ly8gYXJlIGNvbnZlcnRlZCB0byBzY2VuZSB1bml0cy5cblxuXHR0aGlzLnNjYWxlID0gMTtcblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdnJJbnB1dHMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0dmFyIHZySW5wdXQgPSB2cklucHV0c1sgaSBdO1xuXHRcdFx0dmFyIHN0YXRlID0gdnJJbnB1dC5nZXRTdGF0ZSgpO1xuXG5cdFx0XHRpZiAoIHN0YXRlLm9yaWVudGF0aW9uICE9PSBudWxsICkge1xuXHRcdFx0XHRvYmplY3QucXVhdGVybmlvbi5jb3B5KCBzdGF0ZS5vcmllbnRhdGlvbiApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHN0YXRlLnBvc2l0aW9uICE9PSBudWxsICkge1xuXHRcdFx0XHRvYmplY3QucG9zaXRpb24uY29weSggc3RhdGUucG9zaXRpb24gKS5tdWx0aXBseVNjYWxhciggc2NvcGUuc2NhbGUgKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dGhpcy5yZXNldFNlbnNvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2cklucHV0cy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHR2YXIgdnJJbnB1dCA9IHZySW5wdXRzWyBpIF07XG5cblx0XHRcdGlmICggdnJJbnB1dC5yZXNldFNlbnNvciAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR2cklucHV0LnJlc2V0U2Vuc29yKCk7XG5cdFx0XHR9IGVsc2UgaWYgKCB2cklucHV0Lnplcm9TZW5zb3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dnJJbnB1dC56ZXJvU2Vuc29yKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuemVyb1NlbnNvciA9IGZ1bmN0aW9uICgpIHtcblx0XHRUSFJFRS53YXJuKCAnVEhSRUUuVlJDb250cm9sczogLnplcm9TZW5zb3IoKSBpcyBub3cgLnJlc2V0U2Vuc29yKCkuJyApO1xuXHRcdHRoaXMucmVzZXRTZW5zb3IoKTtcblx0fTtcblxufTtcblxuIiwiXG4vKipcbiAqIEBhdXRob3IgZG1hcmNvcyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9kbWFyY29zXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKlxuICogV2ViVlIgU3BlYzogaHR0cDovL21venZyLmdpdGh1Yi5pby93ZWJ2ci1zcGVjL3dlYnZyLmh0bWxcbiAqXG4gKiBGaXJlZm94OiBodHRwOi8vbW96dnIuY29tL2Rvd25sb2Fkcy9cbiAqIENocm9taXVtOiBodHRwczovL2RyaXZlLmdvb2dsZS5jb20vZm9sZGVydmlldz9pZD0wQnp1ZEx0MjJCcUdSYlc5V1RITXRPV016TmpRJnVzcD1zaGFyaW5nI2xpc3RcbiAqXG4gKi9cblxuVEhSRUUuVlJFZmZlY3QgPSBmdW5jdGlvbiAoIHJlbmRlcmVyLCBvbkVycm9yICkge1xuXG5cdHZhciB2ckhNRDtcblx0dmFyIGV5ZVRyYW5zbGF0aW9uTCwgZXllRk9WTDtcblx0dmFyIGV5ZVRyYW5zbGF0aW9uUiwgZXllRk9WUjtcblxuXHRmdW5jdGlvbiBnb3RWUkRldmljZXMoIGRldmljZXMgKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZGV2aWNlcy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHRpZiAoIGRldmljZXNbIGkgXSBpbnN0YW5jZW9mIEhNRFZSRGV2aWNlICkge1xuXHRcdFx0XHR2ckhNRCA9IGRldmljZXNbIGkgXTtcblxuXHRcdFx0XHRpZiAoIHZySE1ELmdldEV5ZVBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHR2YXIgZXllUGFyYW1zTCA9IHZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdsZWZ0JyApO1xuXHRcdFx0XHRcdHZhciBleWVQYXJhbXNSID0gdnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ3JpZ2h0JyApO1xuXG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25MID0gZXllUGFyYW1zTC5leWVUcmFuc2xhdGlvbjtcblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvblIgPSBleWVQYXJhbXNSLmV5ZVRyYW5zbGF0aW9uO1xuXHRcdFx0XHRcdGV5ZUZPVkwgPSBleWVQYXJhbXNMLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG5cdFx0XHRcdFx0ZXllRk9WUiA9IGV5ZVBhcmFtc1IucmVjb21tZW5kZWRGaWVsZE9mVmlldztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBUaGlzIGlzIGFuIG9sZGVyIGNvZGUgcGF0aCBhbmQgbm90IHNwZWMgY29tcGxpYW50LlxuXHRcdFx0XHRcdC8vIEl0IHNob3VsZCBiZSByZW1vdmVkIGF0IHNvbWUgcG9pbnQgaW4gdGhlIG5lYXIgZnV0dXJlLlxuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uTCA9IHZySE1ELmdldEV5ZVRyYW5zbGF0aW9uKCAnbGVmdCcgKTtcblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvblIgPSB2ckhNRC5nZXRFeWVUcmFuc2xhdGlvbiggJ3JpZ2h0JyApO1xuXHRcdFx0XHRcdGV5ZUZPVkwgPSB2ckhNRC5nZXRSZWNvbW1lbmRlZEV5ZUZpZWxkT2ZWaWV3KCAnbGVmdCcgKTtcblx0XHRcdFx0XHRleWVGT1ZSID0gdnJITUQuZ2V0UmVjb21tZW5kZWRFeWVGaWVsZE9mVmlldyggJ3JpZ2h0JyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrOyAvLyBXZSBrZWVwIHRoZSBmaXJzdCB3ZSBlbmNvdW50ZXJcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHZySE1EID09PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRpZiAoIG9uRXJyb3IgKSBvbkVycm9yKCAnSE1EIG5vdCBhdmFpbGFibGUnICk7XG5cdFx0fVxuXG5cdH1cblxuXHRpZiAoIG5hdmlnYXRvci5nZXRWUkRldmljZXMgKSB7XG5cdFx0bmF2aWdhdG9yLmdldFZSRGV2aWNlcygpLnRoZW4oIGdvdFZSRGV2aWNlcyApO1xuXHR9XG5cblx0Ly9cblxuXHR0aGlzLnNjYWxlID0gMTtcblx0dGhpcy5zZXRTaXplID0gZnVuY3Rpb24oIHdpZHRoLCBoZWlnaHQgKSB7XG5cdFx0cmVuZGVyZXIuc2V0U2l6ZSggd2lkdGgsIGhlaWdodCApO1xuXHR9O1xuXG5cdC8vIGZ1bGxzY3JlZW5cblxuXHR2YXIgaXNGdWxsc2NyZWVuID0gZmFsc2U7XG5cdHZhciBjYW52YXMgPSByZW5kZXJlci5kb21FbGVtZW50O1xuXHR2YXIgZnVsbHNjcmVlbmNoYW5nZSA9IGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiA/ICdtb3pmdWxsc2NyZWVuY2hhbmdlJyA6ICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJztcblxuXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBmdWxsc2NyZWVuY2hhbmdlLCBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGlzRnVsbHNjcmVlbiA9IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50O1xuXHR9LCBmYWxzZSApO1xuXG5cdHRoaXMuc2V0RnVsbFNjcmVlbiA9IGZ1bmN0aW9uICggYm9vbGVhbiApIHtcblx0XHRpZiAoIHZySE1EID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cdFx0aWYgKCBpc0Z1bGxzY3JlZW4gPT09IGJvb2xlYW4gKSByZXR1cm47XG5cdFx0aWYgKCBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4oIHsgdnJEaXNwbGF5OiB2ckhNRCB9ICk7XG5cdFx0fSBlbHNlIGlmICggY2FudmFzLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuICkge1xuXHRcdFx0Y2FudmFzLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKCB7IHZyRGlzcGxheTogdnJITUQgfSApO1xuXHRcdH1cblx0fTtcblxuXG4gIC8vIFByb3h5IGZvciByZW5kZXJlclxuICB0aGlzLmdldFBpeGVsUmF0aW8gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbnRleHQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiByZW5kZXJlci5jb250ZXh0OyB9XG4gIH0pO1xuXG5cdC8vIHJlbmRlclxuXHR2YXIgY2FtZXJhTCA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuXHR2YXIgY2FtZXJhUiA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuXG5cdHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBzY2VuZSwgY2FtZXJhICkge1xuXHRcdGlmICggdnJITUQgKSB7XG5cdFx0XHR2YXIgc2NlbmVMLCBzY2VuZVI7XG5cblx0XHRcdGlmICggc2NlbmUgaW5zdGFuY2VvZiBBcnJheSApIHtcblx0XHRcdFx0c2NlbmVMID0gc2NlbmVbIDAgXTtcblx0XHRcdFx0c2NlbmVSID0gc2NlbmVbIDEgXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNjZW5lTCA9IHNjZW5lO1xuXHRcdFx0XHRzY2VuZVIgPSBzY2VuZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHNpemUgPSByZW5kZXJlci5nZXRTaXplKCk7XG5cdFx0XHRzaXplLndpZHRoIC89IDI7XG5cblx0XHRcdHJlbmRlcmVyLmVuYWJsZVNjaXNzb3JUZXN0KCB0cnVlICk7XG5cdFx0XHRyZW5kZXJlci5jbGVhcigpO1xuXG5cdFx0XHRpZiAoIGNhbWVyYS5wYXJlbnQgPT09IHVuZGVmaW5lZCApIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG5cdFx0XHRjYW1lcmFMLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIGV5ZUZPVkwsIHRydWUsIGNhbWVyYS5uZWFyLCBjYW1lcmEuZmFyICk7XG5cdFx0XHRjYW1lcmFSLnByb2plY3Rpb25NYXRyaXggPSBmb3ZUb1Byb2plY3Rpb24oIGV5ZUZPVlIsIHRydWUsIGNhbWVyYS5uZWFyLCBjYW1lcmEuZmFyICk7XG5cblx0XHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYUwucG9zaXRpb24sIGNhbWVyYUwucXVhdGVybmlvbiwgY2FtZXJhTC5zY2FsZSApO1xuXHRcdFx0Y2FtZXJhLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggY2FtZXJhUi5wb3NpdGlvbiwgY2FtZXJhUi5xdWF0ZXJuaW9uLCBjYW1lcmFSLnNjYWxlICk7XG5cblx0XHRcdGNhbWVyYUwudHJhbnNsYXRlWCggZXllVHJhbnNsYXRpb25MLnggKiB0aGlzLnNjYWxlICk7XG5cdFx0XHRjYW1lcmFSLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uUi54ICogdGhpcy5zY2FsZSApO1xuXG5cdFx0XHQvLyByZW5kZXIgbGVmdCBleWVcblx0XHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmVMLCBjYW1lcmFMICk7XG5cblx0XHRcdC8vIHJlbmRlciByaWdodCBleWVcblx0XHRcdHJlbmRlcmVyLnNldFZpZXdwb3J0KCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIuc2V0U2Npc3Nvciggc2l6ZS53aWR0aCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmVSLCBjYW1lcmFSICk7XG5cblx0XHRcdHJlbmRlcmVyLmVuYWJsZVNjaXNzb3JUZXN0KCBmYWxzZSApO1xuXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHQvLyBSZWd1bGFyIHJlbmRlciBtb2RlIGlmIG5vdCBITURcblxuXHRcdGlmICggc2NlbmUgaW5zdGFuY2VvZiBBcnJheSApIHNjZW5lID0gc2NlbmVbIDAgXTtcblxuXHRcdHJlbmRlcmVyLnJlbmRlciggc2NlbmUsIGNhbWVyYSApO1xuXG5cdH07XG5cblx0ZnVuY3Rpb24gZm92VG9ORENTY2FsZU9mZnNldCggZm92ICkge1xuXG5cdFx0dmFyIHB4c2NhbGUgPSAyLjAgLyAoZm92LmxlZnRUYW4gKyBmb3YucmlnaHRUYW4pO1xuXHRcdHZhciBweG9mZnNldCA9IChmb3YubGVmdFRhbiAtIGZvdi5yaWdodFRhbikgKiBweHNjYWxlICogMC41O1xuXHRcdHZhciBweXNjYWxlID0gMi4wIC8gKGZvdi51cFRhbiArIGZvdi5kb3duVGFuKTtcblx0XHR2YXIgcHlvZmZzZXQgPSAoZm92LnVwVGFuIC0gZm92LmRvd25UYW4pICogcHlzY2FsZSAqIDAuNTtcblx0XHRyZXR1cm4geyBzY2FsZTogWyBweHNjYWxlLCBweXNjYWxlIF0sIG9mZnNldDogWyBweG9mZnNldCwgcHlvZmZzZXQgXSB9O1xuXG5cdH1cblxuXHRmdW5jdGlvbiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3YsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApIHtcblxuXHRcdHJpZ2h0SGFuZGVkID0gcmlnaHRIYW5kZWQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiByaWdodEhhbmRlZDtcblx0XHR6TmVhciA9IHpOZWFyID09PSB1bmRlZmluZWQgPyAwLjAxIDogek5lYXI7XG5cdFx0ekZhciA9IHpGYXIgPT09IHVuZGVmaW5lZCA/IDEwMDAwLjAgOiB6RmFyO1xuXG5cdFx0dmFyIGhhbmRlZG5lc3NTY2FsZSA9IHJpZ2h0SGFuZGVkID8gLTEuMCA6IDEuMDtcblxuXHRcdC8vIHN0YXJ0IHdpdGggYW4gaWRlbnRpdHkgbWF0cml4XG5cdFx0dmFyIG1vYmogPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXHRcdHZhciBtID0gbW9iai5lbGVtZW50cztcblxuXHRcdC8vIGFuZCB3aXRoIHNjYWxlL29mZnNldCBpbmZvIGZvciBub3JtYWxpemVkIGRldmljZSBjb29yZHNcblx0XHR2YXIgc2NhbGVBbmRPZmZzZXQgPSBmb3ZUb05EQ1NjYWxlT2Zmc2V0KGZvdik7XG5cblx0XHQvLyBYIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuXHRcdG1bMCAqIDQgKyAwXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzBdO1xuXHRcdG1bMCAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzAgKiA0ICsgMl0gPSBzY2FsZUFuZE9mZnNldC5vZmZzZXRbMF0gKiBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVswICogNCArIDNdID0gMC4wO1xuXG5cdFx0Ly8gWSByZXN1bHQsIG1hcCBjbGlwIGVkZ2VzIHRvIFstdywrd11cblx0XHQvLyBZIG9mZnNldCBpcyBuZWdhdGVkIGJlY2F1c2UgdGhpcyBwcm9qIG1hdHJpeCB0cmFuc2Zvcm1zIGZyb20gd29ybGQgY29vcmRzIHdpdGggWT11cCxcblx0XHQvLyBidXQgdGhlIE5EQyBzY2FsaW5nIGhhcyBZPWRvd24gKHRoYW5rcyBEM0Q/KVxuXHRcdG1bMSAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzEgKiA0ICsgMV0gPSBzY2FsZUFuZE9mZnNldC5zY2FsZVsxXTtcblx0XHRtWzEgKiA0ICsgMl0gPSAtc2NhbGVBbmRPZmZzZXQub2Zmc2V0WzFdICogaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMSAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdC8vIFogcmVzdWx0ICh1cCB0byB0aGUgYXBwKVxuXHRcdG1bMiAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzIgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVsyICogNCArIDJdID0gekZhciAvICh6TmVhciAtIHpGYXIpICogLWhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzIgKiA0ICsgM10gPSAoekZhciAqIHpOZWFyKSAvICh6TmVhciAtIHpGYXIpO1xuXG5cdFx0Ly8gVyByZXN1bHQgKD0gWiBpbilcblx0XHRtWzMgKiA0ICsgMF0gPSAwLjA7XG5cdFx0bVszICogNCArIDFdID0gMC4wO1xuXHRcdG1bMyAqIDQgKyAyXSA9IGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzMgKiA0ICsgM10gPSAwLjA7XG5cblx0XHRtb2JqLnRyYW5zcG9zZSgpO1xuXG5cdFx0cmV0dXJuIG1vYmo7XG5cdH1cblxuXHRmdW5jdGlvbiBmb3ZUb1Byb2plY3Rpb24oIGZvdiwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICkge1xuXG5cdFx0dmFyIERFRzJSQUQgPSBNYXRoLlBJIC8gMTgwLjA7XG5cblx0XHR2YXIgZm92UG9ydCA9IHtcblx0XHRcdHVwVGFuOiBNYXRoLnRhbiggZm92LnVwRGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdGRvd25UYW46IE1hdGgudGFuKCBmb3YuZG93bkRlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRsZWZ0VGFuOiBNYXRoLnRhbiggZm92LmxlZnREZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0cmlnaHRUYW46IE1hdGgudGFuKCBmb3YucmlnaHREZWdyZWVzICogREVHMlJBRCApXG5cdFx0fTtcblxuXHRcdHJldHVybiBmb3ZQb3J0VG9Qcm9qZWN0aW9uKCBmb3ZQb3J0LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKTtcblxuXHR9XG5cbn07XG4iLCJcbi8qXG4gKiBNb3pWUiBFeHRlbnNpb25zIHRvIHRocmVlLmpzXG4gKlxuICogQSBicm93c2VyaWZ5IHdyYXBwZXIgZm9yIHRoZSBWUiBoZWxwZXJzIGZyb20gTW96VlIncyBnaXRodWIgcmVwby5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Nb3pWUi92ci13ZWItZXhhbXBsZXMvdHJlZS9tYXN0ZXIvdGhyZWVqcy12ci1ib2lsZXJwbGF0ZVxuICpcbiAqIFRoZSBleHRlbnNpb24gZmlsZXMgYXJlIG5vdCBtb2R1bGUgY29tcGF0aWJsZSBhbmQgd29yayBieSBhcHBlbmRpbmcgdG8gdGhlXG4gKiBUSFJFRSBvYmplY3QuIERvIHVzZSB0aGVtLCB3ZSBtYWtlIHRoZSBUSFJFRSBvYmplY3QgZ2xvYmFsLCBhbmQgdGhlbiBtYWtlXG4gKiBpdCB0aGUgZXhwb3J0IHZhbHVlIG9mIHRoaXMgbW9kdWxlLlxuICpcbiAqL1xuXG5jb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdMb2FkaW5nIE1velZSIEV4dGVuc2lvbnMuLi4nKTtcbi8vcmVxdWlyZSgnLi9TdGVyZW9FZmZlY3QuanMnKTtcbi8vY29uc29sZS5sb2coJ1N0ZXJlb0VmZmVjdCAtIE9LJyk7XG5cbnJlcXVpcmUoJy4vVlJDb250cm9scy5qcycpO1xuY29uc29sZS5sb2coJ1ZSQ29udHJvbHMgLSBPSycpO1xuXG5yZXF1aXJlKCcuL1ZSRWZmZWN0LmpzJyk7XG5jb25zb2xlLmxvZygnVlJFZmZlY3QgLSBPSycpO1xuXG5jb25zb2xlLmdyb3VwRW5kKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUU7XG5cbiIsIi8qKlxuICogQGF1dGhvciBFYmVyaGFyZCBHcmFldGhlciAvIGh0dHA6Ly9lZ3JhZXRoZXIuY29tL1xuICogQGF1dGhvciBNYXJrIEx1bmRpbiBcdC8gaHR0cDovL21hcmstbHVuZGluLmNvbVxuICogQGF1dGhvciBTaW1vbmUgTWFuaW5pIC8gaHR0cDovL2Rhcm9uMTMzNy5naXRodWIuaW9cbiAqIEBhdXRob3IgTHVjYSBBbnRpZ2EgXHQvIGh0dHA6Ly9sYW50aWdhLmdpdGh1Yi5pb1xuICovXG5cblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIHRhcmdldCwgZG9tRWxlbWVudCApIHtcblxuXHR2YXIgX3RoaXMgPSB0aGlzO1xuXHR2YXIgU1RBVEUgPSB7IE5PTkU6IC0xLCBST1RBVEU6IDAsIFpPT006IDEsIFBBTjogMiwgVE9VQ0hfUk9UQVRFOiAzLCBUT1VDSF9aT09NX1BBTjogNCB9O1xuXG5cdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXHR0aGlzLmRvbUVsZW1lbnQgPSAoIGRvbUVsZW1lbnQgIT09IHVuZGVmaW5lZCApID8gZG9tRWxlbWVudCA6IGRvY3VtZW50O1xuXG5cdC8vIEFQSVxuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0dGhpcy5zY3JlZW4gPSB7IGxlZnQ6IDAsIHRvcDogMCwgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuXG5cdHRoaXMucm90YXRlU3BlZWQgPSAxLjA7XG5cdHRoaXMuem9vbVNwZWVkID0gMS4yO1xuXHR0aGlzLnBhblNwZWVkID0gMC4zO1xuXG5cdHRoaXMubm9Sb3RhdGUgPSBmYWxzZTtcblx0dGhpcy5ub1pvb20gPSBmYWxzZTtcblx0dGhpcy5ub1BhbiA9IGZhbHNlO1xuXG5cdHRoaXMuc3RhdGljTW92aW5nID0gZmFsc2U7XG5cdHRoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgPSAwLjI7XG5cblx0dGhpcy5taW5EaXN0YW5jZSA9IDA7XG5cdHRoaXMubWF4RGlzdGFuY2UgPSBJbmZpbml0eTtcblxuXHR0aGlzLmtleXMgPSBbIDY1IC8qQSovLCA4MyAvKlMqLywgNjggLypEKi8gXTtcblxuXHQvLyBpbnRlcm5hbHNcblxuXHR0aGlzLnRhcmdldCA9IHRhcmdldCA/IHRhcmdldC5wb3NpdGlvbiA6IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdHZhciBsYXN0UG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdHZhciBfc3RhdGUgPSBTVEFURS5OT05FLFxuXHRfcHJldlN0YXRlID0gU1RBVEUuTk9ORSxcblxuXHRfZXllID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblxuXHRfbW92ZVByZXYgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfbW92ZUN1cnIgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXG5cdF9sYXN0QXhpcyA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdF9sYXN0QW5nbGUgPSAwLFxuXG5cdF96b29tU3RhcnQgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRfem9vbUVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cblx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSAwLFxuXHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSAwLFxuXG5cdF9wYW5TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF9wYW5FbmQgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdC8vIGZvciByZXNldFxuXG5cdHRoaXMudGFyZ2V0MCA9IHRoaXMudGFyZ2V0LmNsb25lKCk7XG5cdHRoaXMucG9zaXRpb24wID0gdGhpcy5vYmplY3QucG9zaXRpb24uY2xvbmUoKTtcblx0dGhpcy51cDAgPSB0aGlzLm9iamVjdC51cC5jbG9uZSgpO1xuXG5cdC8vIGV2ZW50c1xuXG5cdHZhciBjaGFuZ2VFdmVudCA9IHsgdHlwZTogJ2NoYW5nZScgfTtcblx0dmFyIHN0YXJ0RXZlbnQgPSB7IHR5cGU6ICdzdGFydCcgfTtcblx0dmFyIGVuZEV2ZW50ID0geyB0eXBlOiAnZW5kJyB9O1xuXG5cblx0Ly8gbWV0aG9kc1xuXG5cdHRoaXMuaGFuZGxlUmVzaXplID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0aWYgKCB0aGlzLmRvbUVsZW1lbnQgPT09IGRvY3VtZW50ICkge1xuXG5cdFx0XHR0aGlzLnNjcmVlbi5sZWZ0ID0gMDtcblx0XHRcdHRoaXMuc2NyZWVuLnRvcCA9IDA7XG5cdFx0XHR0aGlzLnNjcmVlbi53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdFx0dGhpcy5zY3JlZW4uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dmFyIGJveCA9IHRoaXMuZG9tRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdC8vIGFkanVzdG1lbnRzIGNvbWUgZnJvbSBzaW1pbGFyIGNvZGUgaW4gdGhlIGpxdWVyeSBvZmZzZXQoKSBmdW5jdGlvblxuXHRcdFx0dmFyIGQgPSB0aGlzLmRvbUVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cdFx0XHR0aGlzLnNjcmVlbi5sZWZ0ID0gYm94LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSBkLmNsaWVudExlZnQ7XG5cdFx0XHR0aGlzLnNjcmVlbi50b3AgPSBib3gudG9wICsgd2luZG93LnBhZ2VZT2Zmc2V0IC0gZC5jbGllbnRUb3A7XG5cdFx0XHR0aGlzLnNjcmVlbi53aWR0aCA9IGJveC53aWR0aDtcblx0XHRcdHRoaXMuc2NyZWVuLmhlaWdodCA9IGJveC5oZWlnaHQ7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24gKCBldmVudCApIHtcblxuXHRcdGlmICggdHlwZW9mIHRoaXNbIGV2ZW50LnR5cGUgXSA9PSAnZnVuY3Rpb24nICkge1xuXG5cdFx0XHR0aGlzWyBldmVudC50eXBlIF0oIGV2ZW50ICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR2YXIgZ2V0TW91c2VPblNjcmVlbiA9ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBwYWdlWCwgcGFnZVkgKSB7XG5cblx0XHRcdHZlY3Rvci5zZXQoXG5cdFx0XHRcdCggcGFnZVggLSBfdGhpcy5zY3JlZW4ubGVmdCApIC8gX3RoaXMuc2NyZWVuLndpZHRoLFxuXHRcdFx0XHQoIHBhZ2VZIC0gX3RoaXMuc2NyZWVuLnRvcCApIC8gX3RoaXMuc2NyZWVuLmhlaWdodFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHZlY3RvcjtcblxuXHRcdH07XG5cblx0fSgpICk7XG5cblx0dmFyIGdldE1vdXNlT25DaXJjbGUgPSAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2ZWN0b3IgPSBuZXcgVEhSRUUuVmVjdG9yMigpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggcGFnZVgsIHBhZ2VZICkge1xuXG5cdFx0XHR2ZWN0b3Iuc2V0KFxuXHRcdFx0XHQoICggcGFnZVggLSBfdGhpcy5zY3JlZW4ud2lkdGggKiAwLjUgLSBfdGhpcy5zY3JlZW4ubGVmdCApIC8gKCBfdGhpcy5zY3JlZW4ud2lkdGggKiAwLjUgKSApLFxuXHRcdFx0XHQoICggX3RoaXMuc2NyZWVuLmhlaWdodCArIDIgKiAoIF90aGlzLnNjcmVlbi50b3AgLSBwYWdlWSApICkgLyBfdGhpcy5zY3JlZW4ud2lkdGggKSAvLyBzY3JlZW4ud2lkdGggaW50ZW50aW9uYWxcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiB2ZWN0b3I7XG5cdFx0fTtcblxuXHR9KCkgKTtcblxuXHR0aGlzLnJvdGF0ZUNhbWVyYSA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBheGlzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdHF1YXRlcm5pb24gPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLFxuXHRcdFx0ZXllRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG9iamVjdFVwRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0XHRcdG1vdmVEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0YW5nbGU7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRtb3ZlRGlyZWN0aW9uLnNldCggX21vdmVDdXJyLnggLSBfbW92ZVByZXYueCwgX21vdmVDdXJyLnkgLSBfbW92ZVByZXYueSwgMCApO1xuXHRcdFx0YW5nbGUgPSBtb3ZlRGlyZWN0aW9uLmxlbmd0aCgpO1xuXG5cdFx0XHRpZiAoIGFuZ2xlICkge1xuXG5cdFx0XHRcdF9leWUuY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICkuc3ViKCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdFx0XHRleWVEaXJlY3Rpb24uY29weSggX2V5ZSApLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmplY3RVcERpcmVjdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QudXAgKS5ub3JtYWxpemUoKTtcblx0XHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24uY3Jvc3NWZWN0b3JzKCBvYmplY3RVcERpcmVjdGlvbiwgZXllRGlyZWN0aW9uICkubm9ybWFsaXplKCk7XG5cblx0XHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24uc2V0TGVuZ3RoKCBfbW92ZUN1cnIueSAtIF9tb3ZlUHJldi55ICk7XG5cdFx0XHRcdG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uLnNldExlbmd0aCggX21vdmVDdXJyLnggLSBfbW92ZVByZXYueCApO1xuXG5cdFx0XHRcdG1vdmVEaXJlY3Rpb24uY29weSggb2JqZWN0VXBEaXJlY3Rpb24uYWRkKCBvYmplY3RTaWRld2F5c0RpcmVjdGlvbiApICk7XG5cblx0XHRcdFx0YXhpcy5jcm9zc1ZlY3RvcnMoIG1vdmVEaXJlY3Rpb24sIF9leWUgKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRhbmdsZSAqPSBfdGhpcy5yb3RhdGVTcGVlZDtcblx0XHRcdFx0cXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKCBheGlzLCBhbmdsZSApO1xuXG5cdFx0XHRcdF9leWUuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cdFx0XHRcdF90aGlzLm9iamVjdC51cC5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblxuXHRcdFx0XHRfbGFzdEF4aXMuY29weSggYXhpcyApO1xuXHRcdFx0XHRfbGFzdEFuZ2xlID0gYW5nbGU7XG5cblx0XHRcdH1cblxuXHRcdFx0ZWxzZSBpZiAoICFfdGhpcy5zdGF0aWNNb3ZpbmcgJiYgX2xhc3RBbmdsZSApIHtcblxuXHRcdFx0XHRfbGFzdEFuZ2xlICo9IE1hdGguc3FydCggMS4wIC0gX3RoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3IgKTtcblx0XHRcdFx0X2V5ZS5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKS5zdWIoIF90aGlzLnRhcmdldCApO1xuXHRcdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIF9sYXN0QXhpcywgX2xhc3RBbmdsZSApO1xuXHRcdFx0XHRfZXllLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXHRcdFx0XHRfdGhpcy5vYmplY3QudXAuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cblx0XHRcdH1cblxuXHRcdFx0X21vdmVQcmV2LmNvcHkoIF9tb3ZlQ3VyciApO1xuXG5cdFx0fTtcblxuXHR9KCkpO1xuXG5cblx0dGhpcy56b29tQ2FtZXJhID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGZhY3RvcjtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5UT1VDSF9aT09NX1BBTiApIHtcblxuXHRcdFx0ZmFjdG9yID0gX3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgLyBfdG91Y2hab29tRGlzdGFuY2VFbmQ7XG5cdFx0XHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IF90b3VjaFpvb21EaXN0YW5jZUVuZDtcblx0XHRcdF9leWUubXVsdGlwbHlTY2FsYXIoIGZhY3RvciApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0ZmFjdG9yID0gMS4wICsgKCBfem9vbUVuZC55IC0gX3pvb21TdGFydC55ICkgKiBfdGhpcy56b29tU3BlZWQ7XG5cblx0XHRcdGlmICggZmFjdG9yICE9PSAxLjAgJiYgZmFjdG9yID4gMC4wICkge1xuXG5cdFx0XHRcdF9leWUubXVsdGlwbHlTY2FsYXIoIGZhY3RvciApO1xuXG5cdFx0XHRcdGlmICggX3RoaXMuc3RhdGljTW92aW5nICkge1xuXG5cdFx0XHRcdFx0X3pvb21TdGFydC5jb3B5KCBfem9vbUVuZCApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfem9vbVN0YXJ0LnkgKz0gKCBfem9vbUVuZC55IC0gX3pvb21TdGFydC55ICkgKiB0aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5wYW5DYW1lcmEgPSAoZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgbW91c2VDaGFuZ2UgPSBuZXcgVEhSRUUuVmVjdG9yMigpLFxuXHRcdFx0b2JqZWN0VXAgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0cGFuID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdG1vdXNlQ2hhbmdlLmNvcHkoIF9wYW5FbmQgKS5zdWIoIF9wYW5TdGFydCApO1xuXG5cdFx0XHRpZiAoIG1vdXNlQ2hhbmdlLmxlbmd0aFNxKCkgKSB7XG5cblx0XHRcdFx0bW91c2VDaGFuZ2UubXVsdGlwbHlTY2FsYXIoIF9leWUubGVuZ3RoKCkgKiBfdGhpcy5wYW5TcGVlZCApO1xuXG5cdFx0XHRcdHBhbi5jb3B5KCBfZXllICkuY3Jvc3MoIF90aGlzLm9iamVjdC51cCApLnNldExlbmd0aCggbW91c2VDaGFuZ2UueCApO1xuXHRcdFx0XHRwYW4uYWRkKCBvYmplY3RVcC5jb3B5KCBfdGhpcy5vYmplY3QudXAgKS5zZXRMZW5ndGgoIG1vdXNlQ2hhbmdlLnkgKSApO1xuXG5cdFx0XHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGQoIHBhbiApO1xuXHRcdFx0XHRfdGhpcy50YXJnZXQuYWRkKCBwYW4gKTtcblxuXHRcdFx0XHRpZiAoIF90aGlzLnN0YXRpY01vdmluZyApIHtcblxuXHRcdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBfcGFuRW5kICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF9wYW5TdGFydC5hZGQoIG1vdXNlQ2hhbmdlLnN1YlZlY3RvcnMoIF9wYW5FbmQsIF9wYW5TdGFydCApLm11bHRpcGx5U2NhbGFyKCBfdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciApICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fTtcblxuXHR9KCkpO1xuXG5cdHRoaXMuY2hlY2tEaXN0YW5jZXMgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoICFfdGhpcy5ub1pvb20gfHwgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRpZiAoIF9leWUubGVuZ3RoU3EoKSA+IF90aGlzLm1heERpc3RhbmNlICogX3RoaXMubWF4RGlzdGFuY2UgKSB7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZS5zZXRMZW5ndGgoIF90aGlzLm1heERpc3RhbmNlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIF9leWUubGVuZ3RoU3EoKSA8IF90aGlzLm1pbkRpc3RhbmNlICogX3RoaXMubWluRGlzdGFuY2UgKSB7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZS5zZXRMZW5ndGgoIF90aGlzLm1pbkRpc3RhbmNlICkgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRfZXllLnN1YlZlY3RvcnMoIF90aGlzLm9iamVjdC5wb3NpdGlvbiwgX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRpZiAoICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X3RoaXMucm90YXRlQ2FtZXJhKCk7XG5cblx0XHR9XG5cblx0XHRpZiAoICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF90aGlzLnpvb21DYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdGlmICggIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfdGhpcy5wYW5DYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5hZGRWZWN0b3JzKCBfdGhpcy50YXJnZXQsIF9leWUgKTtcblxuXHRcdF90aGlzLmNoZWNrRGlzdGFuY2VzKCk7XG5cblx0XHRfdGhpcy5vYmplY3QubG9va0F0KCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdGlmICggbGFzdFBvc2l0aW9uLmRpc3RhbmNlVG9TcXVhcmVkKCBfdGhpcy5vYmplY3QucG9zaXRpb24gKSA+IEVQUyApIHtcblxuXHRcdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdFx0bGFzdFBvc2l0aW9uLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApO1xuXG5cdFx0fVxuXG5cdH07XG5cblx0dGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cdFx0X3ByZXZTdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHRfdGhpcy50YXJnZXQuY29weSggX3RoaXMudGFyZ2V0MCApO1xuXHRcdF90aGlzLm9iamVjdC5wb3NpdGlvbi5jb3B5KCBfdGhpcy5wb3NpdGlvbjAgKTtcblx0XHRfdGhpcy5vYmplY3QudXAuY29weSggX3RoaXMudXAwICk7XG5cblx0XHRfZXllLnN1YlZlY3RvcnMoIF90aGlzLm9iamVjdC5wb3NpdGlvbiwgX3RoaXMudGFyZ2V0ICk7XG5cblx0XHRfdGhpcy5vYmplY3QubG9va0F0KCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGNoYW5nZUV2ZW50ICk7XG5cblx0XHRsYXN0UG9zaXRpb24uY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0fTtcblxuXHQvLyBsaXN0ZW5lcnNcblxuXHRmdW5jdGlvbiBrZXlkb3duKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duICk7XG5cblx0XHRfcHJldlN0YXRlID0gX3N0YXRlO1xuXG5cdFx0aWYgKCBfc3RhdGUgIT09IFNUQVRFLk5PTkUgKSB7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlJPVEFURSBdICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuUk9UQVRFO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuWk9PTSBdICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlpPT007XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5QQU4gXSAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9zdGF0ZSA9IFNUQVRFLlBBTjtcblxuXHRcdH1cblxuXHR9XG5cblx0ZnVuY3Rpb24ga2V5dXAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdF9zdGF0ZSA9IF9wcmV2U3RhdGU7XG5cblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBrZXlkb3duLCBmYWxzZSApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZWRvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuTk9ORSApIHtcblxuXHRcdFx0X3N0YXRlID0gZXZlbnQuYnV0dG9uO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlJPVEFURSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuWk9PTSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfem9vbVN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfem9vbUVuZC5jb3B5KF96b29tU3RhcnQpO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5QQU4gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfcGFuU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF9wYW5FbmQuY29weShfcGFuU3RhcnQpO1xuXG5cdFx0fVxuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlbW92ZSwgZmFsc2UgKTtcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNldXAsIGZhbHNlICk7XG5cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNlbW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5ST1RBVEUgJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlpPT00gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3pvb21FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUEFOICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZXVwKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZW1vdmUgKTtcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNldXAgKTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiBtb3VzZXdoZWVsKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0dmFyIGRlbHRhID0gMDtcblxuXHRcdGlmICggZXZlbnQud2hlZWxEZWx0YSApIHsgLy8gV2ViS2l0IC8gT3BlcmEgLyBFeHBsb3JlciA5XG5cblx0XHRcdGRlbHRhID0gZXZlbnQud2hlZWxEZWx0YSAvIDQwO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQuZGV0YWlsICkgeyAvLyBGaXJlZm94XG5cblx0XHRcdGRlbHRhID0gLSBldmVudC5kZXRhaWwgLyAzO1xuXG5cdFx0fVxuXG5cdFx0X3pvb21TdGFydC55ICs9IGRlbHRhICogMC4wMTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2hzdGFydCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuVE9VQ0hfUk9UQVRFO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5UT1VDSF9aT09NX1BBTjtcblx0XHRcdFx0dmFyIGR4ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYO1xuXHRcdFx0XHR2YXIgZHkgPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVk7XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBfcGFuU3RhcnQgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggc3RhcnRFdmVudCApO1xuXG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNobW92ZSggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHN3aXRjaCAoIGV2ZW50LnRvdWNoZXMubGVuZ3RoICkge1xuXG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCAgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYLCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKSApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gTWF0aC5zcXJ0KCBkeCAqIGR4ICsgZHkgKiBkeSApO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaGVuZCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoICBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gX3RvdWNoWm9vbURpc3RhbmNlRW5kID0gMDtcblxuXHRcdFx0XHR2YXIgeCA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VYICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VYICkgLyAyO1xuXHRcdFx0XHR2YXIgeSA9ICggZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICsgZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZICkgLyAyO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRfcGFuU3RhcnQuY29weSggX3BhbkVuZCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdH1cblxuXHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggZW5kRXZlbnQgKTtcblxuXHR9XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIGZ1bmN0aW9uICggZXZlbnQgKSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0sIGZhbHNlICk7XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtb3VzZWRvd24sIGZhbHNlICk7XG5cblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXdoZWVsJywgbW91c2V3aGVlbCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Nb3VzZVNjcm9sbCcsIG1vdXNld2hlZWwsIGZhbHNlICk7IC8vIGZpcmVmb3hcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCB0b3VjaHN0YXJ0LCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgdG91Y2hlbmQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgdG91Y2htb3ZlLCBmYWxzZSApO1xuXG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24sIGZhbHNlICk7XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBrZXl1cCwgZmFsc2UgKTtcblxuXHR0aGlzLmhhbmRsZVJlc2l6ZSgpO1xuXG5cdC8vIGZvcmNlIGFuIHVwZGF0ZSBhdCBzdGFydFxuXHR0aGlzLnVwZGF0ZSgpO1xuXG59O1xuXG5USFJFRS5UcmFja2JhbGxDb250cm9scy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBUSFJFRS5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlICk7XG5USFJFRS5UcmFja2JhbGxDb250cm9scy5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUSFJFRS5UcmFja2JhbGxDb250cm9scztcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzO1xuXG4iLCJ2YXIgYXJlbmFXaWR0aCwgYXJlbmFIZWlnaHQsIHRpbWVGYWN0b3IsIHN0YXJ0aW5nTGV2ZWwsIHN0YXJ0aW5nRHJvcFNwZWVkLCBrZXlSZXBlYXRUaW1lLCBzb2Z0RHJvcFdhaXRUaW1lLCBhbmltYXRpb24sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmFyZW5hV2lkdGggPSBhcmVuYVdpZHRoID0gMTA7XG5vdXQkLmFyZW5hSGVpZ2h0ID0gYXJlbmFIZWlnaHQgPSAxODtcbm91dCQudGltZUZhY3RvciA9IHRpbWVGYWN0b3IgPSAxO1xub3V0JC5zdGFydGluZ0xldmVsID0gc3RhcnRpbmdMZXZlbCA9IDA7XG5vdXQkLnN0YXJ0aW5nRHJvcFNwZWVkID0gc3RhcnRpbmdEcm9wU3BlZWQgPSA1MDA7XG5vdXQkLmtleVJlcGVhdFRpbWUgPSBrZXlSZXBlYXRUaW1lID0gMTAwO1xub3V0JC5zb2Z0RHJvcFdhaXRUaW1lID0gc29mdERyb3BXYWl0VGltZSA9IDEwMDtcbm91dCQuYW5pbWF0aW9uID0gYW5pbWF0aW9uID0ge1xuICB6YXBBbmltYXRpb25UaW1lOiA1MDAsXG4gIGpvbHRBbmltYXRpb25UaW1lOiA1MDAsXG4gIGhhcmREcm9wRWZmZWN0VGltZTogMTAwLFxuICBwcmV2aWV3UmV2ZWFsVGltZTogMzAwLFxuICB0aXRsZVJldmVhbFRpbWU6IDQwMDAsXG4gIGdhbWVPdmVyUmV2ZWFsVGltZTogNDAwMFxufTsiLCJ2YXIgZ2FtZU9wdGlvbnMsIHAybTtcbmdhbWVPcHRpb25zID0gcmVxdWlyZSgnLi9nYW1lJyk7XG5wMm0gPSAoZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgKiAxLjYgLyA0MDk2O1xufSk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdW5pdHNQZXJNZXRlcjogMSxcbiAgaGFyZERyb3BKb2x0QW1vdW50OiAwLjAzLFxuICB6YXBQYXJ0aWNsZVNpemU6IDAuMDA4LFxuICBncmlkU2l6ZTogMC4wNyxcbiAgYmxvY2tTaXplOiAwLjA2NixcbiAgZGVza1NpemU6IFsxLjYsIDAuOCwgMC4xXSxcbiAgY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTogMC41LFxuICBjYW1lcmFFbGV2YXRpb246IDAuMCxcbiAgYXJlbmFPZmZzZXRGcm9tQ2VudHJlOiAwLjA4NSxcbiAgYXJlbmFEaXN0YW5jZUZyb21FZGdlOiAwLjU3LFxuICBzY29yZURpc3RhbmNlRnJvbUVkZ2U6IHAybSg3ODApLFxuICBzY29yZURpc3RhbmNlRnJvbUNlbnRyZTogcDJtKDQzNiksXG4gIHNjb3JlSW50ZXJUdWJlTWFyZ2luOiBwMm0oNSksXG4gIHNjb3JlVHViZVJhZGl1czogcDJtKDIwMCAvIDIpLFxuICBzY29yZVR1YmVIZWlnaHQ6IHAybSgyNzApLFxuICBzY29yZUJhc2VSYWRpdXM6IHAybSgyNzUgLyAyKSxcbiAgc2NvcmVJbmRpY2F0b3JPZmZzZXQ6IHAybSgyNDMpLFxuICBwcmV2aWV3RG9tZVJhZGl1czogcDJtKDIwOCksXG4gIHByZXZpZXdEb21lSGVpZ2h0OiAwLjIwLFxuICBwcmV2aWV3RGlzdGFuY2VGcm9tRWRnZTogcDJtKDY1NiksXG4gIHByZXZpZXdEaXN0YW5jZUZyb21DZW50ZXI6IHAybSgxMDAyKSxcbiAgcHJldmlld1NjYWxlRmFjdG9yOiAwLjUsXG4gIGdhbWVPcHRpb25zOiBnYW1lT3B0aW9uc1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrLCBUaW1lciwgcHJpbWVHYW1lU3RhdGUsIG5ld0FyZW5hLCBjb3B5QnJpY2tUb0FyZW5hLCBkcm9wUm93LCByZW1vdmVSb3dzLCBjbGVhckFyZW5hLCB0b3BJc1JlYWNoZWQsIHJvd0lzQ29tcGxldGUsIGNvbGxpZGVzLCBjYW5Nb3ZlLCBjYW5Ecm9wLCBjYW5Sb3RhdGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGFkZFYyID0gcmVmJC5hZGRWMiwgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcCwgcmFuZG9tRnJvbSA9IHJlZiQucmFuZG9tRnJvbTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ3MsIG9wdGlvbnMpe1xuICByZXR1cm4gZ3MuYXJlbmEgPSB7XG4gICAgY2VsbHM6IG5ld0FyZW5hKG9wdGlvbnMuYXJlbmFXaWR0aCwgb3B0aW9ucy5hcmVuYUhlaWdodCksXG4gICAgd2lkdGg6IG9wdGlvbnMuYXJlbmFXaWR0aCxcbiAgICBoZWlnaHQ6IG9wdGlvbnMuYXJlbmFIZWlnaHQsXG4gICAgemFwQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJaYXAgQW5pbWF0aW9uXCIsIG9wdGlvbnMuemFwQW5pbWF0aW9uVGltZSksXG4gICAgam9sdEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiSm9sdCBBbmltYXRpb25cIiwgb3B0aW9ucy5qb2x0QW5pbWF0aW9uVGltZSlcbiAgfTtcbn07XG5vdXQkLm5ld0FyZW5hID0gbmV3QXJlbmEgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KXtcbiAgdmFyIGkkLCByb3csIGxyZXN1bHQkLCBqJCwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDA7IGkkIDwgaGVpZ2h0OyArK2kkKSB7XG4gICAgcm93ID0gaSQ7XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMDsgaiQgPCB3aWR0aDsgKytqJCkge1xuICAgICAgY2VsbCA9IGokO1xuICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuY29weUJyaWNrVG9BcmVuYSA9IGNvcHlCcmlja1RvQXJlbmEgPSBmdW5jdGlvbihhcmckLCBhcmcxJCl7XG4gIHZhciBwb3MsIHNoYXBlLCBjZWxscywgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGxyZXN1bHQkLCBqJCwgcmVmMSQsIGxlbjEkLCB4LCB1LCByZXN1bHRzJCA9IFtdO1xuICBwb3MgPSBhcmckLnBvcywgc2hhcGUgPSBhcmckLnNoYXBlO1xuICBjZWxscyA9IGFyZzEkLmNlbGxzO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gKHJlZjEkID0gKGZuMSQoKSkpLmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgeCA9IGokO1xuICAgICAgdSA9IHJlZjEkW2okXTtcbiAgICAgIGlmIChzaGFwZVt5XVt4XSAmJiB2ID49IDApIHtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjZWxsc1t2XVt1XSA9IHNoYXBlW3ldW3hdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xuICBmdW5jdGlvbiBmbiQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzFdLCB0byQgPSBwb3NbMV0gKyBzaGFwZS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG4gIGZ1bmN0aW9uIGZuMSQoKXtcbiAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gcG9zWzBdLCB0byQgPSBwb3NbMF0gKyBzaGFwZVswXS5sZW5ndGg7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKGkkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9XG59O1xub3V0JC5kcm9wUm93ID0gZHJvcFJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQucmVtb3ZlUm93cyA9IHJlbW92ZVJvd3MgPSBmdW5jdGlvbihhcmVuYSwgcm93cyl7XG4gIHZhciBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgcmVzdWx0cyQucHVzaChkcm9wUm93KGFyZW5hLCByb3dJeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmNsZWFyQXJlbmEgPSBjbGVhckFyZW5hID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgaSwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgaSA9IGokO1xuICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICBscmVzdWx0JC5wdXNoKHJvd1tpXSA9IDApO1xuICAgIH1cbiAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC50b3BJc1JlYWNoZWQgPSB0b3BJc1JlYWNoZWQgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLnJvd0lzQ29tcGxldGUgPSByb3dJc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLmNvbGxpZGVzID0gY29sbGlkZXMgPSBmdW5jdGlvbihwb3MsIHNoYXBlLCBhcmckKXtcbiAgdmFyIGNlbGxzLCB3aWR0aCwgaGVpZ2h0LCBpJCwgcmVmJCwgbGVuJCwgeSwgdiwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdTtcbiAgY2VsbHMgPSBhcmckLmNlbGxzLCB3aWR0aCA9IGFyZyQud2lkdGgsIGhlaWdodCA9IGFyZyQuaGVpZ2h0O1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gKGZuJCgpKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB5ID0gaSQ7XG4gICAgdiA9IHJlZiRbaSRdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gPiAwKSB7XG4gICAgICAgIGlmICh2ID49IDApIHtcbiAgICAgICAgICBpZiAodiA+PSBoZWlnaHQgfHwgdSA+PSB3aWR0aCB8fCB1IDwgMCB8fCBjZWxsc1t2XVt1XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuRHJvcCA9IGNhbkRyb3AgPSBmdW5jdGlvbihicmljaywgYXJlbmEpe1xuICByZXR1cm4gY2FuTW92ZShicmljaywgWzAsIDFdLCBhcmVuYSk7XG59O1xub3V0JC5jYW5Sb3RhdGUgPSBjYW5Sb3RhdGUgPSBmdW5jdGlvbihicmljaywgcm90YXRpb24sIGFyZW5hKXtcbiAgdmFyIG5ld1NoYXBlO1xuICBuZXdTaGFwZSA9IEJyaWNrLmdldFNoYXBlT2ZSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gY29sbGlkZXMoYnJpY2sucG9zLCBuZXdTaGFwZSwgYXJlbmEpO1xufTtcbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmRJbnQsIHdyYXAsIEJyaWNrU2hhcGVzLCBwcmltZUdhbWVTdGF0ZSwgbmV3QnJpY2ssIHNwYXduTmV3QnJpY2ssIHJlc2V0U3RhdGUsIHJvdGF0ZUJyaWNrLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCBkcmF3Q2VsbCwgZHJhd0JyaWNrLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5icmljayA9IHtcbiAgICBuZXh0OiBudWxsLFxuICAgIGN1cnJlbnQ6IG51bGxcbiAgfTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZEludCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcG9zOiBbMywgLTFdLFxuICAgIGNvbG9yOiBpeCxcbiAgICByb3RhdGlvbjogMCxcbiAgICB0eXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnR5cGUsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdXG4gIH07XG59O1xub3V0JC5zcGF3bk5ld0JyaWNrID0gc3Bhd25OZXdCcmljayA9IGZ1bmN0aW9uKGdzKXtcbiAgZ3MuYnJpY2suY3VycmVudCA9IGdzLmJyaWNrLm5leHQ7XG4gIGdzLmJyaWNrLmN1cnJlbnQucG9zID0gWzQsIC0xXTtcbiAgcmV0dXJuIGdzLmJyaWNrLm5leHQgPSBuZXdCcmljaygpO1xufTtcbm91dCQucmVzZXRTdGF0ZSA9IHJlc2V0U3RhdGUgPSBmdW5jdGlvbihicmljayl7XG4gIGJyaWNrLm5leHQgPSBuZXdCcmljaygpO1xuICByZXR1cm4gYnJpY2suY3VycmVudCA9IG5ld0JyaWNrKCk7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgYnJpY2sucm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gYnJpY2suc2hhcGUgPSBCcmlja1NoYXBlc1ticmljay50eXBlXVticmljay5yb3RhdGlvbl07XG59O1xub3V0JC5nZXRTaGFwZU9mUm90YXRpb24gPSBnZXRTaGFwZU9mUm90YXRpb24gPSBmdW5jdGlvbihicmljaywgcm90YXRpb24pe1xuICByb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uKGJyaWNrLCByb3RhdGlvbik7XG4gIHJldHVybiBCcmlja1NoYXBlc1ticmljay50eXBlXVtyb3RhdGlvbl07XG59O1xub3V0JC5ub3JtYWxpc2VSb3RhdGlvbiA9IG5vcm1hbGlzZVJvdGF0aW9uID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgcmV0dXJuIHdyYXAoMCwgQnJpY2tTaGFwZXNbYnJpY2sudHlwZV0ubGVuZ3RoIC0gMSwgYnJpY2sucm90YXRpb24gKyByb3RhdGlvbik7XG59O1xuZHJhd0NlbGwgPSBmdW5jdGlvbihpdCl7XG4gIGlmIChpdCkge1xuICAgIHJldHVybiBcIuKWkuKWklwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcIiAgXCI7XG4gIH1cbn07XG5vdXQkLmRyYXdCcmljayA9IGRyYXdCcmljayA9IGZ1bmN0aW9uKHNoYXBlKXtcbiAgcmV0dXJuIHNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0Lm1hcChkcmF3Q2VsbCkuam9pbignJyk7XG4gIH0pLmpvaW4oXCJcXG5cIik7XG59OyIsInZhciBzcXVhcmUsIHppZywgemFnLCBsZWZ0LCByaWdodCwgdGVlLCB0ZXRyaXMsIGFsbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuc3F1YXJlID0gc3F1YXJlID0gW1tbMCwgMCwgMF0sIFswLCAxLCAxXSwgWzAsIDEsIDFdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXV0sIFtbMCwgMiwgMF0sIFsyLCAyLCAwXSwgWzIsIDAsIDBdXV07XG5vdXQkLnphZyA9IHphZyA9IFtbWzAsIDAsIDBdLCBbMCwgMywgM10sIFszLCAzLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdXV07XG5vdXQkLmxlZnQgPSBsZWZ0ID0gW1tbMCwgMCwgMF0sIFs0LCA0LCA0XSwgWzQsIDAsIDBdXSwgW1s0LCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXV0sIFtbMCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDRdXV07XG5vdXQkLnJpZ2h0ID0gcmlnaHQgPSBbW1swLCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgNV1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXV0sIFtbNSwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDBdXSwgW1swLCA1LCA1XSwgWzAsIDUsIDBdLCBbMCwgNSwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDBdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgNl0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdXV07XG5vdXQkLnRldHJpcyA9IHRldHJpcyA9IFtbWzAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMF0sIFs3LCA3LCA3LCA3XV0sIFtbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF1dXTtcbm91dCQuYWxsID0gYWxsID0gW1xuICB7XG4gICAgdHlwZTogJ3NxdWFyZScsXG4gICAgc2hhcGVzOiBzcXVhcmVcbiAgfSwge1xuICAgIHR5cGU6ICd6aWcnLFxuICAgIHNoYXBlczogemlnXG4gIH0sIHtcbiAgICB0eXBlOiAnemFnJyxcbiAgICBzaGFwZXM6IHphZ1xuICB9LCB7XG4gICAgdHlwZTogJ2xlZnQnLFxuICAgIHNoYXBlczogbGVmdFxuICB9LCB7XG4gICAgdHlwZTogJ3JpZ2h0JyxcbiAgICBzaGFwZXM6IHJpZ2h0XG4gIH0sIHtcbiAgICB0eXBlOiAndGVlJyxcbiAgICBzaGFwZXM6IHRlZVxuICB9LCB7XG4gICAgdHlwZTogJ3RldHJpcycsXG4gICAgc2hhcGVzOiB0ZXRyaXNcbiAgfVxuXTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEVhc2UsIFRpbWVyLCBwcmltZUdhbWVTdGF0ZSwgYW5pbWF0aW9uVGltZUZvclJvd3MsIHJlc2V0RHJvcFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBhZGRWMiA9IHJlZiQuYWRkVjIsIHJhbmRJbnQgPSByZWYkLnJhbmRJbnQsIHdyYXAgPSByZWYkLndyYXAsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb20sIEVhc2UgPSByZWYkLkVhc2U7XG5UaW1lciA9IHJlcXVpcmUoJy4uL3V0aWxzL3RpbWVyJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5jb3JlID0ge1xuICAgIHBhdXNlZDogZmFsc2UsXG4gICAgc2xvd2Rvd246IDEsXG4gICAgc29mdERyb3BNb2RlOiBmYWxzZSxcbiAgICByb3dzVG9SZW1vdmU6IFtdLFxuICAgIHJvd3NSZW1vdmVkVGhpc0ZyYW1lOiBmYWxzZSxcbiAgICBzdGFydGluZ0Ryb3BTcGVlZDogb3B0aW9ucy5zdGFydGluZ0Ryb3BTcGVlZCxcbiAgICBkcm9wVGltZXI6IFRpbWVyLmNyZWF0ZShcIkRyb3AgdGltZXJcIiwgb3B0aW9ucy5zdGFydGluZ0Ryb3BTcGVlZCwgdHJ1ZSksXG4gICAga2V5UmVwZWF0VGltZXI6IFRpbWVyLmNyZWF0ZShcIktleSByZXBlYXRcIiwgb3B0aW9ucy5rZXlSZXBlYXRUaW1lKSxcbiAgICBzb2Z0RHJvcFdhaXRUaW1lcjogVGltZXIuY3JlYXRlKFwiU29mdC1kcm9wIHdhaXQgdGltZVwiLCBvcHRpb25zLnNvZnREcm9wV2FpdFRpbWUpLFxuICAgIGhhcmREcm9wQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJIYXJkLWRyb3AgYW5pbWF0aW9uXCIsIG9wdGlvbnMuYW5pbWF0aW9uLmhhcmREcm9wRWZmZWN0VGltZSwgdHJ1ZSksXG4gICAgcHJldmlld1JldmVhbEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiTmV4dCBicmljayBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24ucHJldmlld1JldmVhbFRpbWUpXG4gIH07XG59O1xub3V0JC5hbmltYXRpb25UaW1lRm9yUm93cyA9IGFuaW1hdGlvblRpbWVGb3JSb3dzID0gZnVuY3Rpb24ocm93cyl7XG4gIHJldHVybiAxMCArIE1hdGgucG93KDMsIHJvd3MubGVuZ3RoKTtcbn07XG5vdXQkLnJlc2V0RHJvcFRpbWVyID0gcmVzZXREcm9wVGltZXIgPSBmdW5jdGlvbihjb3JlKXtcbiAgcmV0dXJuIFRpbWVyLnJlc2V0KGNvcmUuZHJvcFRpbWVyLCBjb3JlLnN0YXJ0aW5nRHJvcFNwZWVkKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIFRpbWVyLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3Jlc3RhcnQnLFxuICAgIHRleHQ6IFwiUmVzdGFydFwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ2dvLWJhY2snLFxuICAgIHRleHQ6IFwiQmFjayB0byBNYWluXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ3MsIG9wdGlvbnMpe1xuICByZXR1cm4gZ3MuZ2FtZU92ZXIgPSB7XG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGN1cnJlbnRTdGF0ZTogbWVudURhdGFbMF0sXG4gICAgbWVudURhdGE6IG1lbnVEYXRhLFxuICAgIHJldmVhbEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiR2FtZSBvdmVyIHJldmVhbCBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24uZ2FtZU92ZXJSZXZlYWxUaW1lKVxuICB9O1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24obXMsIGluZGV4KXtcbiAgbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVttcy5jdXJyZW50SW5kZXhdO1xufTtcbm91dCQuc2VsZWN0UHJldkl0ZW0gPSBzZWxlY3RQcmV2SXRlbSA9IGZ1bmN0aW9uKG1zKXtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihtcywgbXMuY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24obXMpe1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKG1zLCBtcy5jdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIENvcmUsIEFyZW5hLCBCcmljaywgU2NvcmUsIFN0YXJ0TWVudSwgR2FtZU92ZXIsIFRpbWVyLCBUZXRyaXNHYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5BcmVuYSA9IHJlcXVpcmUoJy4vYXJlbmEnKTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpO1xuU2NvcmUgPSByZXF1aXJlKCcuL3Njb3JlJyk7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKTtcbkdhbWVPdmVyID0gcmVxdWlyZSgnLi9nYW1lLW92ZXInKTtcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyl7XG4gICAgQ29yZS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBBcmVuYS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBCcmljay5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBTY29yZS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBTdGFydE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gICAgR2FtZU92ZXIucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gIH1cbiAgcHJvdG90eXBlLmJlZ2luTmV3R2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIEFyZW5hLmNsZWFyQXJlbmEoZ3MuYXJlbmEpO1xuICAgIFNjb3JlLnJlc2V0U2NvcmUoZ3Muc2NvcmUpO1xuICAgIEJyaWNrLnJlc2V0U3RhdGUoZ3MuYnJpY2spO1xuICAgIENvcmUucmVzZXREcm9wVGltZXIoZ3MuY29yZSk7XG4gICAgcmV0dXJuIGdzO1xuICB9O1xuICBwcm90b3R5cGUucmV2ZWFsU3RhcnRNZW51ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAnc3RhcnQtbWVudSc7XG4gICAgcmV0dXJuIFN0YXJ0TWVudS5iZWdpblJldmVhbChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5yZXZlYWxHYW1lT3ZlciA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICAgIHJldHVybiBUaW1lci5yZXNldChncy5nYW1lT3Zlci5yZXZlYWxBbmltYXRpb24pO1xuICB9O1xuICBwcm90b3R5cGUuaGFuZGxlS2V5SW5wdXQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXQsIGxyZXN1bHQkLCByZWYkLCBrZXksIGFjdGlvbiwgYW10LCBpLCBwb3MsIGkkLCB0byQsIHksIGxyZXN1bHQxJCwgaiQsIHRvMSQsIHgsIHJlc3VsdHMkID0gW107XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXQgPSBncy5pbnB1dDtcbiAgICB3aGlsZSAoaW5wdXQubGVuZ3RoKSB7XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgcmVmJCA9IGlucHV0LnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdsZWZ0JzpcbiAgICAgICAgICBpZiAoQXJlbmEuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gLT0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKEFyZW5hLmNhbk1vdmUoYnJpY2suY3VycmVudCwgWzEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gKz0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLmNvcmUuc29mdERyb3BNb2RlID0gdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgY2FzZSAnY3cnOlxuICAgICAgICAgIGlmIChBcmVuYS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKEJyaWNrLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIDEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Njdyc6XG4gICAgICAgICAgaWYgKEFyZW5hLmNhblJvdGF0ZShicmljay5jdXJyZW50LCAtMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKEJyaWNrLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdoYXJkLWRyb3AnOlxuICAgICAgICAgIGdzLmNvcmUuaGFyZERyb3BEaXN0YW5jZSA9IDA7XG4gICAgICAgICAgd2hpbGUgKEFyZW5hLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgICAgICBncy5jb3JlLmhhcmREcm9wRGlzdGFuY2UgKz0gMTtcbiAgICAgICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGdzLmlucHV0ID0gW107XG4gICAgICAgICAgVGltZXIucmVzZXQoZ3MuY29yZS5oYXJkRHJvcEFuaW1hdGlvbiwgZ3MuY29yZS5oYXJkRHJvcERpc3RhbmNlICogMTAgKyAxKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFRpbWVyLnNldFRpbWVUb0V4cGlyeShncy5jb3JlLmRyb3BUaW1lciwgLTEpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctMSc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTInOlxuICAgICAgICBjYXNlICdkZWJ1Zy0zJzpcbiAgICAgICAgY2FzZSAnZGVidWctNCc6XG4gICAgICAgICAgYW10ID0gcGFyc2VJbnQoa2V5LnJlcGxhY2UoL1xcRC9nLCAnJykpO1xuICAgICAgICAgIGxvZyhcIkRFQlVHOiBEZXN0cm95aW5nIHJvd3M6XCIsIGFtdCk7XG4gICAgICAgICAgZ3MuY29yZS5yb3dzVG9SZW1vdmUgPSAoZm4kKCkpO1xuICAgICAgICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAncmVtb3ZlLWxpbmVzJztcbiAgICAgICAgICBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBUaW1lci5yZXNldChncy5hcmVuYS56YXBBbmltYXRpb24sIENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3MuY29yZS5yb3dzVG9SZW1vdmUpKTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFNjb3JlLnVwZGF0ZVNjb3JlKGdzLCBncy5jb3JlLnJvd3NUb1JlbW92ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy01JzpcbiAgICAgICAgICBwb3MgPSBncy5icmljay5jdXJyZW50LnBvcztcbiAgICAgICAgICBncy5icmljay5jdXJyZW50ID0gQnJpY2submV3QnJpY2soNik7XG4gICAgICAgICAgaW1wb3J0JChncy5icmljay5jdXJyZW50LnBvcywgcG9zKTtcbiAgICAgICAgICBmb3IgKGkkID0gYXJlbmEuaGVpZ2h0IC0gMSwgdG8kID0gYXJlbmEuaGVpZ2h0IC0gNDsgaSQgPj0gdG8kOyAtLWkkKSB7XG4gICAgICAgICAgICB5ID0gaSQ7XG4gICAgICAgICAgICBscmVzdWx0MSQgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaiQgPSAwLCB0bzEkID0gYXJlbmEud2lkdGggLSAyOyBqJCA8PSB0bzEkOyArK2okKSB7XG4gICAgICAgICAgICAgIHggPSBqJDtcbiAgICAgICAgICAgICAgbHJlc3VsdDEkLnB1c2goYXJlbmEuY2VsbHNbeV1beF0gPSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2gobHJlc3VsdDEkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTYnOlxuICAgICAgICAgIGdzLmNvcmUucm93c1RvUmVtb3ZlID0gWzEwLCAxMiwgMTRdO1xuICAgICAgICAgIGdzLm1ldGFnYW1lU3RhdGUgPSAncmVtb3ZlLWxpbmVzJztcbiAgICAgICAgICBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFRpbWVyLnJlc2V0KGdzLmFyZW5hLnphcEFuaW1hdGlvbiwgQ29yZS5hbmltYXRpb25UaW1lRm9yUm93cyhncy5jb3JlLnJvd3NUb1JlbW92ZSkpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctNyc6XG4gICAgICAgICAgZ3Muc2NvcmUubGV2ZWwgKz0gMTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKFRpbWVyLnJlc2V0KGdzLmNvcmUuZHJvcFRpbWVyLCBTY29yZS5nZXREcm9wVGltZW91dChncy5zY29yZSkpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChncy5jb3JlLnNvZnREcm9wTW9kZSA9IGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgICBmdW5jdGlvbiBmbiQoKXtcbiAgICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IGdzLmFyZW5hLmhlaWdodCAtIGFtdCwgdG8kID0gZ3MuYXJlbmEuaGVpZ2h0IC0gMTsgaSQgPD0gdG8kOyArK2kkKSB7XG4gICAgICAgIGkgPSBpJDtcbiAgICAgICAgcmVzdWx0cyQucHVzaChpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhck9uZUZyYW1lRmxhZ3MgPSBmdW5jdGlvbihncyl7XG4gICAgcmV0dXJuIGdzLmNvcmUucm93c1JlbW92ZWRUaGlzRnJhbWUgPSBmYWxzZTtcbiAgfTtcbiAgcHJvdG90eXBlLnphcFRpY2sgPSBmdW5jdGlvbihncyl7XG4gICAgaWYgKGdzLmFyZW5hLnphcEFuaW1hdGlvbi5leHBpcmVkKSB7XG4gICAgICBBcmVuYS5yZW1vdmVSb3dzKGdzLmFyZW5hLCBncy5jb3JlLnJvd3NUb1JlbW92ZSk7XG4gICAgICBncy5jb3JlLnJvd3NUb1JlbW92ZSA9IFtdO1xuICAgICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuZ2FtZVRpY2sgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXQsIGNvbXBsZXRlUm93cywgcmVzJCwgaSQsIHJlZiQsIGxlbiQsIGl4LCByb3c7XG4gICAgYnJpY2sgPSBncy5icmljaywgYXJlbmEgPSBncy5hcmVuYSwgaW5wdXQgPSBncy5pbnB1dDtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGFyZW5hLmNlbGxzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgaWYgKEFyZW5hLnJvd0lzQ29tcGxldGUocm93KSkge1xuICAgICAgICByZXMkLnB1c2goaXgpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb21wbGV0ZVJvd3MgPSByZXMkO1xuICAgIGlmIChjb21wbGV0ZVJvd3MubGVuZ3RoKSB7XG4gICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgIGdzLmNvcmUucm93c1RvUmVtb3ZlID0gY29tcGxldGVSb3dzO1xuICAgICAgVGltZXIucmVzZXQoZ3MuYXJlbmEuemFwQW5pbWF0aW9uLCBDb3JlLmFuaW1hdGlvblRpbWVGb3JSb3dzKGdzLmNvcmUucm93c1RvUmVtb3ZlKSk7XG4gICAgICBTY29yZS51cGRhdGVTY29yZShncywgZ3MuY29yZS5yb3dzVG9SZW1vdmUpO1xuICAgICAgVGltZXIucmVzZXQoZ3MuY29yZS5kcm9wVGltZXIsIFNjb3JlLmdldERyb3BUaW1lb3V0KGdzLnNjb3JlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChBcmVuYS50b3BJc1JlYWNoZWQoYXJlbmEpKSB7XG4gICAgICB0aGlzLnJldmVhbEdhbWVPdmVyKGdzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGdzLmNvcmUuc29mdERyb3BNb2RlKSB7XG4gICAgICBUaW1lci5zZXRUaW1lVG9FeHBpcnkoZ3MuY29yZS5kcm9wVGltZXIsIDApO1xuICAgIH1cbiAgICBpZiAoZ3MuY29yZS5kcm9wVGltZXIuZXhwaXJlZCkge1xuICAgICAgVGltZXIucmVzZXRXaXRoUmVtYWluZGVyKGdzLmNvcmUuZHJvcFRpbWVyKTtcbiAgICAgIGlmIChBcmVuYS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgQXJlbmEuY29weUJyaWNrVG9BcmVuYShicmljay5jdXJyZW50LCBhcmVuYSk7XG4gICAgICAgIEJyaWNrLnNwYXduTmV3QnJpY2soZ3MpO1xuICAgICAgICBUaW1lci5yZXNldChncy5jb3JlLnByZXZpZXdSZXZlYWxBbmltYXRpb24pO1xuICAgICAgICBncy5jb3JlLnNvZnREcm9wTW9kZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYW5kbGVLZXlJbnB1dChncyk7XG4gIH07XG4gIHByb3RvdHlwZS5nYW1lT3ZlclRpY2sgPSBmdW5jdGlvbihncywgzpR0KXtcbiAgICB2YXIgaW5wdXQsIGdhbWVPdmVyLCByZWYkLCBrZXksIGFjdGlvbiwgcmVzdWx0cyQgPSBbXTtcbiAgICBpbnB1dCA9IGdzLmlucHV0LCBnYW1lT3ZlciA9IGdzLmdhbWVPdmVyO1xuICAgIHdoaWxlIChpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dC5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goR2FtZU92ZXIuc2VsZWN0UHJldkl0ZW0oZ2FtZU92ZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChHYW1lT3Zlci5zZWxlY3ROZXh0SXRlbShnYW1lT3ZlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGlmIChnYW1lT3Zlci5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdyZXN0YXJ0Jykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZU92ZXIuY3VycmVudFN0YXRlLnN0YXRlID09PSAnZ28tYmFjaycpIHtcbiAgICAgICAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5yZXZlYWxTdGFydE1lbnUoZ3MpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0TWVudVRpY2sgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGlucHV0LCBzdGFydE1lbnUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0ID0gZ3MuaW5wdXQsIHN0YXJ0TWVudSA9IGdzLnN0YXJ0TWVudTtcbiAgICB3aGlsZSAoaW5wdXQubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXQuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3RQcmV2SXRlbShzdGFydE1lbnUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChTdGFydE1lbnUuc2VsZWN0TmV4dEl0ZW0oc3RhcnRNZW51KSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgaWYgKHN0YXJ0TWVudS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdzdGFydC1nYW1lJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihncywgYXJnJCl7XG4gICAgdmFyIM6UdCwgdGltZSwgZnJhbWUsIGZwcywgaW5wdXQ7XG4gICAgzpR0ID0gYXJnJC7OlHQsIHRpbWUgPSBhcmckLnRpbWUsIGZyYW1lID0gYXJnJC5mcmFtZSwgZnBzID0gYXJnJC5mcHMsIGlucHV0ID0gYXJnJC5pbnB1dDtcbiAgICBncy5mcHMgPSBmcHM7XG4gICAgZ3MuzpR0ID0gzpR0O1xuICAgIGdzLmVsYXBzZWRUaW1lID0gdGltZTtcbiAgICBncy5lbGFwc2VkRnJhbWVzID0gZnJhbWU7XG4gICAgZ3MuaW5wdXQgPSBpbnB1dDtcbiAgICBpZiAoIWdzLmNvcmUucGF1c2VkKSB7XG4gICAgICBUaW1lci51cGRhdGVBbGxJbihncywgzpR0KTtcbiAgICB9XG4gICAgdGhpcy5jbGVhck9uZUZyYW1lRmxhZ3MoZ3MpO1xuICAgIHN3aXRjaCAoZ3MubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgdGhpcy5yZXZlYWxTdGFydE1lbnUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgdGhpcy5nYW1lVGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICB0aGlzLmdhbWVPdmVyVGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnN0YXJ0TWVudVRpY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICB0aGlzLnphcFRpY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmRlYnVnKCdVbmtub3duIG1ldGFnYW1lLXN0YXRlOicsIGdzLm1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ3M7XG4gIH07XG4gIHJldHVybiBUZXRyaXNHYW1lO1xufSgpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIG1pbiwgZGl2LCBhZGRWMiwgcmFuZEludCwgd3JhcCwgcmFuZG9tRnJvbSwgQnJpY2tTaGFwZXMsIHByaW1lR2FtZVN0YXRlLCBjb21wdXRlU2NvcmUsIGdldERyb3BUaW1lb3V0LCB1cGRhdGVTY29yZSwgcmVzZXRTY29yZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWluID0gcmVmJC5taW4sIGRpdiA9IHJlZiQuZGl2LCBhZGRWMiA9IHJlZiQuYWRkVjIsIHJhbmRJbnQgPSByZWYkLnJhbmRJbnQsIHdyYXAgPSByZWYkLndyYXAsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5Ccmlja1NoYXBlcyA9IHJlcXVpcmUoJy4vZGF0YS9icmljay1zaGFwZXMnKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdzLCBvcHRpb25zKXtcbiAgcmV0dXJuIGdzLnNjb3JlID0ge1xuICAgIHBvaW50czogMCxcbiAgICBsaW5lczogMCxcbiAgICBzaW5nbGVzOiAwLFxuICAgIGRvdWJsZXM6IDAsXG4gICAgdHJpcGxlczogMCxcbiAgICB0ZXRyaXM6IDAsXG4gICAgbGV2ZWw6IG9wdGlvbnMuc3RhcnRpbmdMZXZlbCxcbiAgICBzdGFydGluZ0xldmVsOiBvcHRpb25zLnN0YXJ0aW5nTGV2ZWxcbiAgfTtcbn07XG5vdXQkLmNvbXB1dGVTY29yZSA9IGNvbXB1dGVTY29yZSA9IGZ1bmN0aW9uKHJvd3MsIGx2bCl7XG4gIGx2bCA9PSBudWxsICYmIChsdmwgPSAwKTtcbiAgc3dpdGNoIChyb3dzLmxlbmd0aCkge1xuICBjYXNlIDE6XG4gICAgcmV0dXJuIDQwICogKGx2bCArIDEpO1xuICBjYXNlIDI6XG4gICAgcmV0dXJuIDEwMCAqIChsdmwgKyAxKTtcbiAgY2FzZSAzOlxuICAgIHJldHVybiAzMDAgKiAobHZsICsgMSk7XG4gIGNhc2UgNDpcbiAgICByZXR1cm4gMTIwMCAqIChsdmwgKyAxKTtcbiAgfVxufTtcbm91dCQuZ2V0RHJvcFRpbWVvdXQgPSBnZXREcm9wVGltZW91dCA9IGZ1bmN0aW9uKGFyZyQpe1xuICB2YXIgbGV2ZWw7XG4gIGxldmVsID0gYXJnJC5sZXZlbDtcbiAgcmV0dXJuICgxMCAtIG1pbig5LCBsZXZlbCkpICogNTA7XG59O1xub3V0JC51cGRhdGVTY29yZSA9IHVwZGF0ZVNjb3JlID0gZnVuY3Rpb24oYXJnJCwgcm93cywgbHZsKXtcbiAgdmFyIHNjb3JlLCBwb2ludHMsIGxpbmVzO1xuICBzY29yZSA9IGFyZyQuc2NvcmU7XG4gIGx2bCA9PSBudWxsICYmIChsdmwgPSAwKTtcbiAgcG9pbnRzID0gY29tcHV0ZVNjb3JlKHJvd3MsIHNjb3JlLmxldmVsKTtcbiAgc2NvcmUucG9pbnRzICs9IHBvaW50cztcbiAgc2NvcmUubGluZXMgKz0gbGluZXMgPSByb3dzLmxlbmd0aDtcbiAgc3dpdGNoIChsaW5lcykge1xuICBjYXNlIDE6XG4gICAgc2NvcmUuc2luZ2xlcyArPSAxO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgc2NvcmUuZG91YmxlcyArPSAxO1xuICAgIGJyZWFrO1xuICBjYXNlIDM6XG4gICAgc2NvcmUudHJpcGxlcyArPSAxO1xuICAgIGJyZWFrO1xuICBjYXNlIDQ6XG4gICAgc2NvcmUudGV0cmlzICs9IDE7XG4gIH1cbiAgaWYgKGRpdihzY29yZS5saW5lcywgc2NvcmUubGV2ZWwgKyAxKSA+PSAxMCkge1xuICAgIHJldHVybiBzY29yZS5sZXZlbCArPSAxO1xuICB9XG59O1xub3V0JC5yZXNldFNjb3JlID0gcmVzZXRTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcbiAgcmV0dXJuIGltcG9ydCQoc2NvcmUsIHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwLFxuICAgIGxldmVsOiBzY29yZS5zdGFydGluZ0xldmVsXG4gIH0pO1xufTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIFRpbWVyLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIHVwZGF0ZSwgYmVnaW5SZXZlYWwsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3N0YXJ0LWdhbWUnLFxuICAgIHRleHQ6IFwiU3RhcnQgR2FtZVwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ25vdGhpbmcnLFxuICAgIHRleHQ6IFwiRG9uJ3QgU3RhcnQgR2FtZVwiXG4gIH1cbl07XG5saW1pdGVyID0gd3JhcCgwLCBtZW51RGF0YS5sZW5ndGggLSAxKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdzLCBvcHRpb25zKXtcbiAgcmV0dXJuIGdzLnN0YXJ0TWVudSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGEsXG4gICAgdGl0bGVSZXZlYWxBbmltYXRpb246IFRpbWVyLmNyZWF0ZShcIlRpdGxlIHJldmVhbCBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24udGl0bGVSZXZlYWxUaW1lKVxuICB9O1xufTtcbm91dCQudXBkYXRlID0gdXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICByZXR1cm4gaGFuZGxlSW5wdXQoZ3MsIGdzLmlucHV0KTtcbn07XG5vdXQkLmJlZ2luUmV2ZWFsID0gYmVnaW5SZXZlYWwgPSBmdW5jdGlvbihncyl7XG4gIHJldHVybiBUaW1lci5yZXNldChncy5zdGFydE1lbnUudGl0bGVSZXZlYWxBbmltYXRpb24pO1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24oc21zLCBpbmRleCl7XG4gIHNtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIHNtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVtzbXMuY3VycmVudEluZGV4XTtcbn07XG5vdXQkLnNlbGVjdFByZXZJdGVtID0gc2VsZWN0UHJldkl0ZW0gPSBmdW5jdGlvbihzbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBzbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKHNtcywgY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHJhbmQsIGZsb29yLCBCYXNlLCBNYXRlcmlhbHMsIEFyZW5hQ2VsbHMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkFyZW5hQ2VsbHMgPSBBcmVuYUNlbGxzID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYUNlbGxzLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdBcmVuYUNlbGxzJywgQXJlbmFDZWxscyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYUNlbGxzO1xuICBmdW5jdGlvbiBBcmVuYUNlbGxzKG9wdHMsIGdzKXtcbiAgICB2YXIgYmxvY2tTaXplLCBncmlkU2l6ZSwgd2lkdGgsIGhlaWdodCwgbWFyZ2luLCBib3hHZW8sIHJlZiQsIHJlcyQsIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIGN1YmU7XG4gICAgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemUsIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBBcmVuYUNlbGxzLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aWR0aCA9IGdyaWRTaXplICogZ3MuYXJlbmEud2lkdGg7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgbWFyZ2luID0gKGdyaWRTaXplIC0gYmxvY2tTaXplKSAvIDI7XG4gICAgYm94R2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJsb2NrU2l6ZSwgYmxvY2tTaXplLCBibG9ja1NpemUpO1xuICAgIHRoaXMub2Zmc2V0ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLm9mZnNldCk7XG4gICAgcmVmJCA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uO1xuICAgIHJlZiQueCA9IHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkU2l6ZTtcbiAgICByZWYkLnkgPSBoZWlnaHQgLSAwLjUgKiBncmlkU2l6ZTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBncy5hcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGJveEdlbywgTWF0ZXJpYWxzLm5vcm1hbCk7XG4gICAgICAgIGN1YmUucG9zaXRpb24uc2V0KHggKiBncmlkU2l6ZSwgeSAqIGdyaWRTaXplLCAwKTtcbiAgICAgICAgY3ViZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub2Zmc2V0LmFkZChjdWJlKTtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdWJlKTtcbiAgICAgIH1cbiAgICAgIHJlcyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHRoaXMuY2VsbHMgPSByZXMkO1xuICB9XG4gIHByb3RvdHlwZS50b2dnbGVSb3dPZkNlbGxzID0gZnVuY3Rpb24ocm93SXgsIHN0YXRlKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGJveCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5jZWxsc1tyb3dJeF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBib3ggPSByZWYkW2kkXTtcbiAgICAgIGJveC5tYXRlcmlhbCA9IE1hdGVyaWFscy56YXA7XG4gICAgICByZXN1bHRzJC5wdXNoKGJveC52aXNpYmxlID0gc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93WmFwRWZmZWN0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBhcmVuYSwgY29yZSwgb25PZmYsIGkkLCByZWYkLCBsZW4kLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCBjb3JlID0gZ3MuY29yZTtcbiAgICBvbk9mZiA9IGFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcyA8IDAuNCAmJiAhIShmbG9vcihhcmVuYS56YXBBbmltYXRpb24uY3VycmVudFRpbWUgKiAxMCkgJSAyKTtcbiAgICBvbk9mZiA9ICEoZmxvb3IoYXJlbmEuemFwQW5pbWF0aW9uLmN1cnJlbnRUaW1lKSAlIDIpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBjb3JlLnJvd3NUb1JlbW92ZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvd0l4ID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMudG9nZ2xlUm93T2ZDZWxscyhyb3dJeCwgb25PZmYpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlQ2VsbHMgPSBmdW5jdGlvbihjZWxscyl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjZWxscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gY2VsbHNbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgdGhpcy5jZWxsc1t5XVt4XS52aXNpYmxlID0gISFjZWxsO1xuICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuY2VsbHNbeV1beF0ubWF0ZXJpYWwgPSBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBBcmVuYUNlbGxzO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgbWF4LCByYW5kLCBFYXNlLCBCYXNlLCBGcmFtZSwgRmFsbGluZ0JyaWNrLCBHdWlkZSwgQXJlbmFDZWxscywgUGFydGljbGVFZmZlY3QsIEFyZW5hLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBtYXggPSByZWYkLm1heCwgcmFuZCA9IHJlZiQucmFuZCwgRWFzZSA9IHJlZiQuRWFzZTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuRnJhbWUgPSByZXF1aXJlKCcuL2ZyYW1lJykuRnJhbWU7XG5GYWxsaW5nQnJpY2sgPSByZXF1aXJlKCcuL2ZhbGxpbmctYnJpY2snKS5GYWxsaW5nQnJpY2s7XG5HdWlkZSA9IHJlcXVpcmUoJy4vZ3VpZGUnKS5HdWlkZTtcbkFyZW5hQ2VsbHMgPSByZXF1aXJlKCcuL2FyZW5hLWNlbGxzJykuQXJlbmFDZWxscztcblBhcnRpY2xlRWZmZWN0ID0gcmVxdWlyZSgnLi9wYXJ0aWNsZS1lZmZlY3QnKS5QYXJ0aWNsZUVmZmVjdDtcbm91dCQuQXJlbmEgPSBBcmVuYSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmEsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hJywgQXJlbmEpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmE7XG4gIGZ1bmN0aW9uIEFyZW5hKG9wdHMsIGdzKXtcbiAgICB2YXIgbmFtZSwgcmVmJCwgcGFydDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEFyZW5hLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBsb2coJ1JlbmRlcmVyOjpBcmVuYTo6bmV3Jyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZyYW1lc1NpbmNlUm93c1JlbW92ZWQ6IDBcbiAgICB9O1xuICAgIHRoaXMucGFydHMgPSB7XG4gICAgICBmcmFtZTogbmV3IEZyYW1lKHRoaXMub3B0cywgZ3MpLFxuICAgICAgZ3VpZGU6IG5ldyBHdWlkZSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hQ2VsbHM6IG5ldyBBcmVuYUNlbGxzKHRoaXMub3B0cywgZ3MpLFxuICAgICAgdGhpc0JyaWNrOiBuZXcgRmFsbGluZ0JyaWNrKHRoaXMub3B0cywgZ3MpLFxuICAgICAgcGFydGljbGVzOiBuZXcgUGFydGljbGVFZmZlY3QodGhpcy5vcHRzLCBncylcbiAgICB9O1xuICAgIGZvciAobmFtZSBpbiByZWYkID0gdGhpcy5wYXJ0cykge1xuICAgICAgcGFydCA9IHJlZiRbbmFtZV07XG4gICAgICBwYXJ0LmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IHRoaXMub3B0cy5hcmVuYU9mZnNldEZyb21DZW50cmU7XG4gIH1cbiAgcHJvdG90eXBlLmpvbHQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHAsIHp6LCBqb2x0O1xuICAgIHAgPSBtYXgoMCwgMSAtIGdzLmNvcmUuaGFyZERyb3BBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIHAgPSBFYXNlLmVsYXN0aWNJbihwLCAwLCAxKTtcbiAgICB6eiA9IGdzLmNvcmUucm93c1RvUmVtb3ZlLmxlbmd0aDtcbiAgICByZXR1cm4gam9sdCA9IC1wICogKDEgKyB6eikgKiB0aGlzLm9wdHMuaGFyZERyb3BKb2x0QW1vdW50O1xuICB9O1xuICBwcm90b3R5cGUuaml0dGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBwLCB6eiwgaml0dGVyO1xuICAgIHAgPSAxIC0gZ3MuYXJlbmEuemFwQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgIHp6ID0gZ3MuY29yZS5yb3dzVG9SZW1vdmUubGVuZ3RoICogdGhpcy5vcHRzLmdyaWRTaXplIC8gNDA7XG4gICAgcmV0dXJuIGppdHRlciA9IFtwICogcmFuZCgtenosIHp6KSwgcCAqIHJhbmQoLXp6LCB6eildO1xuICB9O1xuICBwcm90b3R5cGUuemFwTGluZXMgPSBmdW5jdGlvbihncywgcG9zaXRpb25SZWNlaXZpbmdKb2x0KXtcbiAgICB2YXIgam9sdCwgaml0dGVyO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy5zaG93WmFwRWZmZWN0KGdzKTtcbiAgICBpZiAoZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSkge1xuICAgICAgdGhpcy5wYXJ0cy5wYXJ0aWNsZXMucmVzZXQoKTtcbiAgICAgIHRoaXMucGFydHMucGFydGljbGVzLnByZXBhcmUoZ3MuY29yZS5yb3dzVG9SZW1vdmUpO1xuICAgICAgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkID0gMDtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5ndWlkZS5zaG93RmxhcmUoZ3MuYXJlbmEuam9sdEFuaW1hdGlvbi5wcm9ncmVzcyk7XG4gICAgam9sdCA9IHRoaXMuam9sdChncyk7XG4gICAgaml0dGVyID0gdGhpcy5qaXR0ZXIoZ3MpO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC54ID0gaml0dGVyWzBdO1xuICAgIHJldHVybiBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IGppdHRlclsxXSArIGpvbHQgLyAxMDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGdzKXtcbiAgICByZXR1cm4gdGhpcy5wYXJ0cy5wYXJ0aWNsZXMudXBkYXRlKGdzLmFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcywgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkLCBncy7OlHQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3MsIHBvc2l0aW9uUmVjZWl2aW5nSm9sdCl7XG4gICAgdmFyIGFyZW5hLCBicmljaztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCBicmljayA9IGdzLmJyaWNrO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy51cGRhdGVDZWxscyhhcmVuYS5jZWxscyk7XG4gICAgdGhpcy5wYXJ0cy50aGlzQnJpY2suZGlzcGxheVNoYXBlKGJyaWNrLmN1cnJlbnQpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLnVwZGF0ZVBvc2l0aW9uKGJyaWNrLmN1cnJlbnQucG9zKTtcbiAgICB0aGlzLnBhcnRzLmd1aWRlLnNob3dCZWFtKGJyaWNrLmN1cnJlbnQpO1xuICAgIHRoaXMucGFydHMuZ3VpZGUuc2hvd0ZsYXJlKGdzLmNvcmUuaGFyZERyb3BBbmltYXRpb24ucHJvZ3Jlc3MsIGdzLmNvcmUuaGFyZERyb3BEaXN0YW5jZSk7XG4gICAgcG9zaXRpb25SZWNlaXZpbmdKb2x0LnkgPSB0aGlzLmpvbHQoZ3MpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmZyYW1lc1NpbmNlUm93c1JlbW92ZWQgKz0gMTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgTWF0ZXJpYWxzLCBCYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5CYXNlID0gQmFzZSA9IChmdW5jdGlvbigpe1xuICBCYXNlLmRpc3BsYXlOYW1lID0gJ0Jhc2UnO1xuICB2YXIgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBCYXNlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCYXNlO1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDAuMDIsIDAuMDIsIDAuMDIpO1xuICBmdW5jdGlvbiBCYXNlKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMucm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc3RhcnQsIGVuZCwgZGlzdGFuY2UsIGRpciwgYXJyb3c7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJBKSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgICBzdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xuICAgIGVuZCA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uO1xuICAgIGRpc3RhbmNlID0gc3RhcnQuZGlzdGFuY2VUbyhlbmQpO1xuICAgIGlmIChkaXN0YW5jZSA+IDApIHtcbiAgICAgIGRpciA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuc3ViVmVjdG9ycyhlbmQsIHN0YXJ0KS5ub3JtYWxpemUoKTtcbiAgICAgIGFycm93ID0gbmV3IFRIUkVFLkFycm93SGVscGVyKGRpciwgc3RhcnQsIGRpc3RhbmNlLCAweDAwMDBmZik7XG4gICAgICB0aGlzLnJvb3QuYWRkKGFycm93KTtcbiAgICB9XG4gICAgcmV0dXJuIGxvZygnUmVnaXN0cmF0aW9uIGhlbHBlciBhdCcsIHRoaXMpO1xuICB9O1xuICBwcm90b3R5cGUuYWRkQm94SGVscGVyID0gZnVuY3Rpb24odGhpbmcpe1xuICAgIHZhciBiYm94O1xuICAgIGJib3ggPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpbmcsIDB4NTU1NWZmKTtcbiAgICBiYm94LnVwZGF0ZSgpO1xuICAgIHJldHVybiB0aGlzLnJvb3QuYWRkKGJib3gpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXt9O1xuICBwcm90b3R5cGUuc2hvd0JvdW5kcyA9IGZ1bmN0aW9uKHNjZW5lKXtcbiAgICB0aGlzLmJvdW5kcyA9IG5ldyBUSFJFRS5Cb3VuZGluZ0JveEhlbHBlcih0aGlzLnJvb3QsIDB4NTU1NTU1KTtcbiAgICB0aGlzLmJvdW5kcy51cGRhdGUoKTtcbiAgICByZXR1cm4gc2NlbmUuYWRkKHRoaXMuYm91bmRzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZFRvID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gb2JqLmFkZCh0aGlzLnJvb3QpO1xuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncG9zaXRpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC5wb3NpdGlvbjtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndmlzaWJsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5yb290LnZpc2libGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICAgIHRoaXMucm9vdC52aXNpYmxlID0gc3RhdGU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIEJhc2U7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIG1pbiwgQmFzZSwgQnJpY2ssIEVhc2UsIEJyaWNrUHJldmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIG1pbiA9IHJlZiQubWluO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKS5CcmljaztcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xub3V0JC5Ccmlja1ByZXZpZXcgPSBCcmlja1ByZXZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBnbGFzc01hdCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmlja1ByZXZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrUHJldmlldycsIEJyaWNrUHJldmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmlja1ByZXZpZXc7XG4gIGdsYXNzTWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgyMjIyMjIsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICAgIHNoaW5pbmVzczogMTAwLFxuICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlXG4gIH0pO1xuICBmdW5jdGlvbiBCcmlja1ByZXZpZXcob3B0cywgZ3Mpe1xuICAgIHZhciB0dWJlUmFkaXVzLCB0dWJlSGVpZ2h0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQnJpY2tQcmV2aWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnMgPSB0aGlzLm9wdHMucHJldmlld1NjYWxlRmFjdG9yO1xuICAgIHRoaXMuY29sb3IgPSAweGZmZmZmZjtcbiAgICB0dWJlUmFkaXVzID0gdGhpcy5vcHRzLnByZXZpZXdEb21lUmFkaXVzO1xuICAgIHR1YmVIZWlnaHQgPSB0aGlzLm9wdHMucHJldmlld0RvbWVIZWlnaHQ7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmljayh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLmJyaWNrLnJvb3Quc2NhbGUuc2V0KHRoaXMucywgdGhpcy5zLCB0aGlzLnMpO1xuICAgIHRoaXMuYnJpY2sucm9vdC5wb3NpdGlvbi55ID0gdGhpcy5vcHRzLmdyaWRTaXplICogMjtcbiAgICB0aGlzLmJyaWNrLnJvb3QucG9zaXRpb24ueCA9IDA7XG4gICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSh0dWJlUmFkaXVzLCAxNiwgdHViZUhlaWdodCwgMCksIGdsYXNzTWF0KTtcbiAgICB0aGlzLmRvbWUucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5iYXNlID0gdm9pZCA4O1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgnb3JhbmdlJywgMSwgMC41KTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0IC8gMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5kb21lKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5saWdodCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2sucm9vdCk7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlOb3RoaW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJyaWNrLnZpc2libGUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSAwO1xuICB9O1xuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHRoaXMuYnJpY2sudmlzaWJsZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2sucHJldHR5RGlzcGxheVNoYXBlKGJyaWNrKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVdpZ2dsZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgZWxhcHNlZFRpbWUsIHQsIHA7XG4gICAgZWxhcHNlZFRpbWUgPSBncy5lbGFwc2VkVGltZTtcbiAgICB0aGlzLnJvb3Qucm90YXRpb24ueSA9IDAuMiAqIHNpbihlbGFwc2VkVGltZSAvIDUwMCk7XG4gICAgdCA9IG1pbigxLCBncy5jb3JlLnByZXZpZXdSZXZlYWxBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIHAgPSBFYXNlLmN1YmljSW4odCwgMCwgdGhpcy5zKTtcbiAgICB0aGlzLmJyaWNrLnJvb3Quc2NhbGUuc2V0KHAsIHAsIHApO1xuICAgIGlmICh0ID09PSAwKSB7XG4gICAgICB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDM7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5jb2xvci5zZXRIZXgoMHhmZmZmZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IHQ7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5jb2xvci5zZXRIZXgoMHhmZmJiMjIpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIEJyaWNrUHJldmlldztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGRpdiwgcGksIEJhc2UsIE1hdGVyaWFscywgQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGRpdiA9IHJlZiQuZGl2LCBwaSA9IHJlZiQucGk7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuQnJpY2sgPSBCcmljayA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByZXR0eU9mZnNldCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmljaywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2snLCBCcmljayksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmljaztcbiAgcHJldHR5T2Zmc2V0ID0ge1xuICAgIHNxdWFyZTogWy0yLCAtMl0sXG4gICAgemlnOiBbLTEuNSwgLTJdLFxuICAgIHphZzogWy0xLjUsIC0yXSxcbiAgICBsZWZ0OiBbLTEuNSwgLTJdLFxuICAgIHJpZ2h0OiBbLTEuNSwgLTJdLFxuICAgIHRlZTogWy0xLjUsIC0yXSxcbiAgICB0ZXRyaXM6IFstMiwgLTIuNV1cbiAgfTtcbiAgZnVuY3Rpb24gQnJpY2sob3B0cywgZ3Mpe1xuICAgIHZhciBzaXplLCBncmlkLCBibG9ja0dlbywgcmVzJCwgaSQsIGksIGN1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmljay5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgc2l6ZSA9IHRoaXMub3B0cy5ibG9ja1NpemU7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMuZnJhbWUgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNCAqIGdyaWQsIDQgKiBncmlkLCBncmlkKSwgTWF0ZXJpYWxzLmRlYnVnV2lyZWZyYW1lKTtcbiAgICBibG9ja0dlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplKTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDM7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChibG9ja0dlbywgTWF0ZXJpYWxzLm5vcm1hbCk7XG4gICAgICB0aGlzLmJyaWNrLmFkZChjdWJlKTtcbiAgICAgIHJlcyQucHVzaChjdWJlKTtcbiAgICB9XG4gICAgdGhpcy5jZWxscyA9IHJlcyQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KDAgKiBncmlkLCAtMC41ICogZ3JpZCwgMCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IHBpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJyaWNrKTtcbiAgfVxuICBwcm90b3R5cGUucHJldHR5RGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHJldHVybiB0aGlzLmRpc3BsYXlTaGFwZShicmljaywgdHJ1ZSk7XG4gIH07XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihhcmckLCBwcmV0dHkpe1xuICAgIHZhciBzaGFwZSwgdHlwZSwgaXgsIGdyaWQsIG1hcmdpbiwgb2Zmc2V0LCBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCB4JCwgcmVzdWx0cyQgPSBbXTtcbiAgICBzaGFwZSA9IGFyZyQuc2hhcGUsIHR5cGUgPSBhcmckLnR5cGU7XG4gICAgcHJldHR5ID09IG51bGwgJiYgKHByZXR0eSA9IGZhbHNlKTtcbiAgICBpeCA9IDA7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBtYXJnaW4gPSAodGhpcy5vcHRzLmdyaWRTaXplIC0gdGhpcy5vcHRzLmJsb2NrU2l6ZSkgLyAyO1xuICAgIG9mZnNldCA9IHByZXR0eVxuICAgICAgPyBwcmV0dHlPZmZzZXRbdHlwZV1cbiAgICAgIDogWy0yLCAtMl07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBzaGFwZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gc2hhcGVbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICB4JCA9IHRoaXMuY2VsbHNbaXgrK107XG4gICAgICAgICAgeCQucG9zaXRpb24ueCA9IChvZmZzZXRbMF0gKyAwLjUgKyB4KSAqIGdyaWQgKyBtYXJnaW47XG4gICAgICAgICAgeCQucG9zaXRpb24ueSA9IChvZmZzZXRbMV0gKyAwLjUgKyB5KSAqIGdyaWQgKyBtYXJnaW47XG4gICAgICAgICAgeCQubWF0ZXJpYWwgPSBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2goeCQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gQnJpY2s7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBtYXgsIEJhc2UsIEZhaWxTY3JlZW4sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIG1heCA9IHJlZiQubWF4O1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkZhaWxTY3JlZW4gPSBGYWlsU2NyZWVuID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGYWlsU2NyZWVuLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGYWlsU2NyZWVuJywgRmFpbFNjcmVlbiksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGYWlsU2NyZWVuO1xuICBmdW5jdGlvbiBGYWlsU2NyZWVuKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEZhaWxTY3JlZW4uc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGxvZyhcIkZhaWxTY3JlZW46Om5ld1wiKTtcbiAgfVxuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe307XG4gIHJldHVybiBGYWlsU2NyZWVuO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIEJhc2UsIEJyaWNrLCBGYWxsaW5nQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2s7XG5vdXQkLkZhbGxpbmdCcmljayA9IEZhbGxpbmdCcmljayA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoRmFsbGluZ0JyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGYWxsaW5nQnJpY2snLCBGYWxsaW5nQnJpY2spLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRmFsbGluZ0JyaWNrO1xuICBmdW5jdGlvbiBGYWxsaW5nQnJpY2sob3B0cywgZ3Mpe1xuICAgIHZhciBzcGFjZUFkanVzdG1lbnQsIHhPZmZzZXQsIHlPZmZzZXQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGYWxsaW5nQnJpY2suc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZ3JpZCA9IG9wdHMuZ3JpZFNpemU7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmdyaWQgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmljayh0aGlzLm9wdHMsIGdzKTtcbiAgICBsb2cob3B0cyk7XG4gICAgc3BhY2VBZGp1c3RtZW50ID0gKHRoaXMuZ3JpZCAtIHRoaXMub3B0cy5ibG9ja1NpemUpIC8gMjtcbiAgICB4T2Zmc2V0ID0gZmxvb3IodGhpcy5vcHRzLmdhbWVPcHRpb25zLmFyZW5hV2lkdGggLyAtMiArIDIpO1xuICAgIHlPZmZzZXQgPSAtMS41O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJyaWNrLnJvb3QpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSB4T2Zmc2V0ICogdGhpcy5ncmlkIC0gc3BhY2VBZGp1c3RtZW50O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSB5T2Zmc2V0ICogdGhpcy5ncmlkICsgc3BhY2VBZGp1c3RtZW50O1xuICB9XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2suZGlzcGxheVNoYXBlKGJyaWNrKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24ocG9zKXtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gcG9zWzBdLCB5ID0gcG9zWzFdO1xuICAgIHJldHVybiB0aGlzLnJvb3QucG9zaXRpb24uc2V0KHRoaXMuZ3JpZCAqIHgsIHRoaXMuaGVpZ2h0IC0gdGhpcy5ncmlkICogeSwgMCk7XG4gIH07XG4gIHJldHVybiBGYWxsaW5nQnJpY2s7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBGcmFtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5GcmFtZSA9IEZyYW1lID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGcmFtZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRnJhbWUnLCBGcmFtZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZTtcbiAgZnVuY3Rpb24gRnJhbWUob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRnJhbWUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHJldHVybiBGcmFtZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxvZywgZmxvb3IsIEJhc2UsIE1hdGVyaWFscywgUGFsZXR0ZSwgR3VpZGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgc2luID0gcmVmJC5zaW4sIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcblBhbGV0dGUgPSByZXF1aXJlKCcuLi9wYWxldHRlJyk7XG5vdXQkLkd1aWRlID0gR3VpZGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcmV0dHlPZmZzZXQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoR3VpZGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0d1aWRlJywgR3VpZGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR3VpZGU7XG4gIHByZXR0eU9mZnNldCA9IHtcbiAgICBzcXVhcmU6IFszXSxcbiAgICB6aWc6IFsyLCAyXSxcbiAgICB6YWc6IFsyLCAyXSxcbiAgICBsZWZ0OiBbMiwgMSwgMiwgM10sXG4gICAgcmlnaHQ6IFsyLCAzLCAyLCAxXSxcbiAgICB0ZWU6IFsyLCAyLCAyLCAyXSxcbiAgICB0ZXRyaXM6IFszLCA0XVxuICB9O1xuICBmdW5jdGlvbiBHdWlkZShvcHRzLCBncyl7XG4gICAgdmFyIGdyaWRTaXplLCBibG9ja1NpemUsIHdpZHRoLCBnZW8sIGJlYW1NYXQsIGZsYXJlTWF0O1xuICAgIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZSwgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemU7XG4gICAgR3VpZGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuZ3MgPSBncztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGhpc1NoYXBlOiBudWxsLFxuICAgICAgbGFzdFNoYXBlOiBudWxsXG4gICAgfTtcbiAgICBnZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplLCB0aGlzLmhlaWdodCwgZ3JpZFNpemUgKiAwLjkpO1xuICAgIGdlby5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCB0aGlzLmhlaWdodCAvIDIsIDApKTtcbiAgICBiZWFtTWF0ID0gTWF0ZXJpYWxzLmZsYXJlRmFjZXM7XG4gICAgZmxhcmVNYXQgPSBNYXRlcmlhbHMuZmxhcmVGYWNlcy5jbG9uZSgpO1xuICAgIHRoaXMuYmVhbSA9IG5ldyBUSFJFRS5NZXNoKGdlbywgYmVhbU1hdCk7XG4gICAgdGhpcy5mbGFyZSA9IG5ldyBUSFJFRS5NZXNoKGdlbywgZmxhcmVNYXQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJlYW0pO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmZsYXJlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gd2lkdGggLyAtMiAtIGdyaWRTaXplIC8gMjtcbiAgICB0aGlzLmd1aWRlTGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgZ3JpZFNpemUgKiA0KTtcbiAgICB0aGlzLmd1aWRlTGlnaHQucG9zaXRpb24ueSA9IDAuMTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5ndWlkZUxpZ2h0KTtcbiAgICB0aGlzLmltcGFjdExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHgwMGZmMDAsIDEwLCBncmlkU2l6ZSAqIDYpO1xuICAgIHRoaXMuaW1wYWN0TGlnaHQucG9zaXRpb24ueiA9IDAuMTtcbiAgICB0aGlzLmltcGFjdExpZ2h0LnBvc2l0aW9uLnkgPSAwLjI7XG4gIH1cbiAgcHJvdG90eXBlLnBvc2l0aW9uQmVhbSA9IGZ1bmN0aW9uKGJlYW0sIGJlYW1TaGFwZSl7XG4gICAgdmFyIHcsIGcsIHg7XG4gICAgdyA9IDEgKyBiZWFtU2hhcGUubWF4IC0gYmVhbVNoYXBlLm1pbjtcbiAgICBnID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIHggPSBnICogKGJlYW1TaGFwZS5wb3MgKyB3IC8gMiArIGJlYW1TaGFwZS5taW4gKyAwLjUpO1xuICAgIGJlYW0uc2NhbGUuc2V0KHcsIDEsIDEpO1xuICAgIHJldHVybiBiZWFtLnBvc2l0aW9uLnggPSB4O1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0JlYW0gPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGJlYW1TaGFwZSwgaSQsIHJlZiQsIGxlbiQsIHksIHJvdywgaiQsIGxlbjEkLCB4LCBjZWxsO1xuICAgIGJlYW1TaGFwZSA9IHtcbiAgICAgIG1pbjogNCxcbiAgICAgIG1heDogMCxcbiAgICAgIHBvczogYnJpY2sucG9zWzBdLFxuICAgICAgY29sb3I6ICdtYWdlbnRhJyxcbiAgICAgIGhlaWdodDogYnJpY2sucG9zWzFdICsgcHJldHR5T2Zmc2V0W2JyaWNrLnR5cGVdW2JyaWNrLnJvdGF0aW9uXVxuICAgIH07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGJyaWNrLnNoYXBlKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgYmVhbVNoYXBlLmNvbG9yID0gUGFsZXR0ZS5zcGVjQ29sb3JzW2NlbGxdO1xuICAgICAgICAgIGlmIChiZWFtU2hhcGUubWluID4geCkge1xuICAgICAgICAgICAgYmVhbVNoYXBlLm1pbiA9IHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiZWFtU2hhcGUubWF4IDwgeCkge1xuICAgICAgICAgICAgYmVhbVNoYXBlLm1heCA9IHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHggPSB0aGlzLnBvc2l0aW9uQmVhbSh0aGlzLmJlYW0sIGJlYW1TaGFwZSk7XG4gICAgdGhpcy5ndWlkZUxpZ2h0LnBvc2l0aW9uLnggPSB4O1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnRoaXNTaGFwZSA9IGJlYW1TaGFwZTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dGbGFyZSA9IGZ1bmN0aW9uKHAsIGRyb3BwZWQpe1xuICAgIHZhciBnLCBiZWFtU2hhcGUsIHg7XG4gICAgaWYgKHAgPT09IDApIHtcbiAgICAgIGcgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgICB0aGlzLnN0YXRlLmxhc3RTaGFwZSA9IGJlYW1TaGFwZSA9IHRoaXMuc3RhdGUudGhpc1NoYXBlO1xuICAgICAgdGhpcy5mbGFyZS5tYXRlcmlhbC5tYXRlcmlhbHMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgICAgdmFyIHJlZiQ7XG4gICAgICAgIHJldHVybiAocmVmJCA9IGl0LmVtaXNzaXZlKSAhPSBudWxsID8gcmVmJC5zZXRIZXgoYmVhbVNoYXBlLmNvbG9yKSA6IHZvaWQgODtcbiAgICAgIH0pO1xuICAgICAgeCA9IHRoaXMucG9zaXRpb25CZWFtKHRoaXMuZmxhcmUsIGJlYW1TaGFwZSk7XG4gICAgICB0aGlzLmZsYXJlLnNjYWxlLnkgPSBnICogKDEgKyBkcm9wcGVkKSAvIHRoaXMuaGVpZ2h0O1xuICAgICAgdGhpcy5mbGFyZS5wb3NpdGlvbi55ID0gdGhpcy5oZWlnaHQgLSBnICogYmVhbVNoYXBlLmhlaWdodDtcbiAgICAgIHRoaXMuaW1wYWN0TGlnaHQuaGV4ID0gYmVhbVNoYXBlLmNvbG9yO1xuICAgICAgdGhpcy5pbXBhY3RMaWdodC5wb3NpdGlvbi54ID0geDtcbiAgICAgIHRoaXMuaW1wYWN0TGlnaHQucG9zaXRpb24ueSA9IHRoaXMuaGVpZ2h0IC0gZyAqIGJlYW1TaGFwZS5oZWlnaHQ7XG4gICAgfVxuICAgIHRoaXMuZmxhcmUubWF0ZXJpYWwubWF0ZXJpYWxzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQub3BhY2l0eSA9IDEgLSBwO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLmltcGFjdExpZ2h0LmRpc3RhbmNlID0gdGhpcy5vcHRzLmdyaWRTaXplICogMyArIHRoaXMub3B0cy5ncmlkU2l6ZSAqIDMgKiBzaW4odGhpcy5ncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICB9O1xuICByZXR1cm4gR3VpZGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBBcmVuYSwgVGl0bGUsIFRhYmxlLCBCcmlja1ByZXZpZXcsIExpZ2h0aW5nLCBOaXhpZURpc3BsYXksIFRvcHNpZGUsIFVuZGVyc2lkZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2FyZW5hJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGl0bGUnKSwgVGl0bGUgPSByZWYkLlRpdGxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi90YWJsZScpLCBUYWJsZSA9IHJlZiQuVGFibGUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2JyaWNrLXByZXZpZXcnKSwgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2xpZ2h0aW5nJyksIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vbml4aWUnKSwgTml4aWVEaXNwbGF5ID0gcmVmJC5OaXhpZURpc3BsYXksIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3RvcHNpZGUnKSwgVG9wc2lkZSA9IHJlZiQuVG9wc2lkZSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdW5kZXJzaWRlJyksIFVuZGVyc2lkZSA9IHJlZiQuVW5kZXJzaWRlLCByZWYkKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgc2luLCBsZXJwLCBsb2csIGZsb29yLCBtYXAsIHNwbGl0LCBwaSwgdGF1LCBCYXNlLCBNYXRlcmlhbHMsIExFRCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBzaW4gPSByZWYkLnNpbiwgbGVycCA9IHJlZiQubGVycCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vciwgbWFwID0gcmVmJC5tYXAsIHNwbGl0ID0gcmVmJC5zcGxpdCwgcGkgPSByZWYkLnBpLCB0YXUgPSByZWYkLnRhdTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5MRUQgPSBMRUQgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBoYWxmU3BoZXJlLCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKExFRCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTEVEJywgTEVEKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IExFRDtcbiAgaGFsZlNwaGVyZSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjAxLCA4LCA4KTtcbiAgZnVuY3Rpb24gTEVEKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIExFRC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5tYXRzID0ge1xuICAgICAgb2ZmOiBNYXRlcmlhbHMuZ2xhc3MsXG4gICAgICBvbjogbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgY29sb3I6IDB4ZmJiMDNiLFxuICAgICAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICAgICAgZW1pc3NpdmU6IDB4ZmJiMGJiLFxuICAgICAgICBzcGVjdWxhcjogJ3doaXRlJyxcbiAgICAgICAgc2hpbmluZXNzOiAxMDBcbiAgICAgIH0pXG4gICAgfTtcbiAgICB0aGlzLmJ1bGIgPSBuZXcgVEhSRUUuTWVzaChoYWxmU3BoZXJlLCB0aGlzLm1hdHMub2ZmKTtcbiAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmYmIwM2IsIDAsIDAuMSk7XG4gICAgdGhpcy5saWdodC5wb3NpdGlvbi55ID0gMC4wMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5idWxiKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5saWdodCk7XG4gIH1cbiAgcHJvdG90eXBlLnNldENvbG9yID0gZnVuY3Rpb24oY29sb3Ipe1xuICAgIHRoaXMuYnVsYi5tYXRlcmlhbC5jb2xvciA9IGNvbG9yO1xuICAgIHJldHVybiB0aGlzLmxpZ2h0LmNvbG9yID0gY29sb3I7XG4gIH07XG4gIHByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5idWxiLm1hdGVyaWFsID0gdGhpcy5tYXRzLm9uO1xuICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDAuMztcbiAgfTtcbiAgcHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5idWxiLm1hdGVyaWFsID0gdGhpcy5tYXRzLm9mZjtcbiAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSAwO1xuICB9O1xuICByZXR1cm4gTEVEO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBCYXNlLCBMaWdodGluZywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3M7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuTGlnaHRpbmcgPSBMaWdodGluZyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIG1haW5MaWdodERpc3RhbmNlLCBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKExpZ2h0aW5nLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdMaWdodGluZycsIExpZ2h0aW5nKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IExpZ2h0aW5nO1xuICBtYWluTGlnaHREaXN0YW5jZSA9IDI7XG4gIGZ1bmN0aW9uIExpZ2h0aW5nKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIExpZ2h0aW5nLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHhmZmZmZmYsIDEsIG1haW5MaWdodERpc3RhbmNlKTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldCgwLCAxLCAwKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5saWdodCk7XG4gICAgdGhpcy5zcG90bGlnaHQgPSBuZXcgVEhSRUUuU3BvdExpZ2h0KDB4ZmZmZmZmLCAxLCA1MCwgMSk7XG4gICAgdGhpcy5zcG90bGlnaHQucG9zaXRpb24uc2V0KDAsIDMsIC0xKTtcbiAgICB0aGlzLnNwb3RsaWdodC50YXJnZXQucG9zaXRpb24uc2V0KDAsIDAsIC0xKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5zcG90bGlnaHQpO1xuICAgIHRoaXMuYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHg2NjY2NjYpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmFtYmllbnQpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LmNhc3RTaGFkb3cgPSB0cnVlO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0RhcmtuZXNzID0gMC41O1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0JpYXMgPSAwLjAwMDE7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwV2lkdGggPSAxMDI0O1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd01hcEhlaWdodCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhTmVhciA9IDEwO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnNoYWRvd0NhbWVyYUZhciA9IDI1MDA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRm92ID0gNTA7XG4gIH1cbiAgcHJvdG90eXBlLnNob3dIZWxwZXJzID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLlBvaW50TGlnaHRIZWxwZXIodGhpcy5saWdodCwgbWFpbkxpZ2h0RGlzdGFuY2UpKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5TcG90TGlnaHRIZWxwZXIodGhpcy5zcG90bGlnaHQpKTtcbiAgfTtcbiAgcHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gMS4wICogc2luKHRpbWUgLyA1MDApO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gMC41ICogY29zKHRpbWUgLyA1MDApO1xuICB9O1xuICByZXR1cm4gTGlnaHRpbmc7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgc2luLCBsZXJwLCBsb2csIGZsb29yLCBtYXAsIHNwbGl0LCBwaSwgdGF1LCBNYXRlcmlhbHMsIEJhc2UsIENhcHN1bGVHZW9tZXRyeSwgTEVELCBOaXhpZVR1YmUsIE5peGllRGlzcGxheSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcywgc2xpY2UkID0gW10uc2xpY2U7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgc2luID0gcmVmJC5zaW4sIGxlcnAgPSByZWYkLmxlcnAsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3IsIG1hcCA9IHJlZiQubWFwLCBzcGxpdCA9IHJlZiQuc3BsaXQsIHBpID0gcmVmJC5waSwgdGF1ID0gcmVmJC50YXU7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkNhcHN1bGVHZW9tZXRyeSA9IHJlcXVpcmUoJy4uL2dlb21ldHJ5L2NhcHN1bGUnKS5DYXBzdWxlR2VvbWV0cnk7XG5MRUQgPSByZXF1aXJlKCcuL2xlZCcpLkxFRDtcbk5peGllVHViZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTml4aWVUdWJlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOaXhpZVR1YmUnLCBOaXhpZVR1YmUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTml4aWVUdWJlO1xuICBmdW5jdGlvbiBOaXhpZVR1YmUob3B0cywgZ3Mpe1xuICAgIHZhciB0dWJlUmFkaXVzLCB0dWJlSGVpZ2h0LCBiYXNlUmFkaXVzLCBiYXNlSGVpZ2h0LCBsYW1wT2Zmc2V0LCBtZXNoV2lkdGgsIG1lc2hIZWlnaHQsIGJnR2VvLCBiYXNlR2VvLCByZXMkLCBpJCwgcmVmJCwgbGVuJCwgaXgsIGksIHF1YWQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBOaXhpZVR1YmUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHR1YmVSYWRpdXMgPSB0aGlzLm9wdHMuc2NvcmVUdWJlUmFkaXVzO1xuICAgIHR1YmVIZWlnaHQgPSB0aGlzLm9wdHMuc2NvcmVUdWJlSGVpZ2h0O1xuICAgIGJhc2VSYWRpdXMgPSB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIGJhc2VIZWlnaHQgPSB0aGlzLm9wdHMuc2NvcmVUdWJlSGVpZ2h0IC8gMTA7XG4gICAgbGFtcE9mZnNldCA9IHRoaXMub3B0cy5zY29yZUluZGljYXRvck9mZnNldDtcbiAgICBtZXNoV2lkdGggPSB0dWJlUmFkaXVzICogMS4zO1xuICAgIG1lc2hIZWlnaHQgPSB0dWJlUmFkaXVzICogMi41O1xuICAgIHRoaXMubWVzaFdpZHRoID0gbWVzaFdpZHRoO1xuICAgIHRoaXMubWVzaEhlaWdodCA9IG1lc2hIZWlnaHQ7XG4gICAgYmdHZW8gPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeShtZXNoV2lkdGgsIG1lc2hIZWlnaHQpO1xuICAgIGJhc2VHZW8gPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShiYXNlUmFkaXVzLCBiYXNlUmFkaXVzLCBiYXNlSGVpZ2h0LCA2LCAwKTtcbiAgICBiYXNlR2VvLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVJvdGF0aW9uWShwaSAvIDYpKTtcbiAgICB0aGlzLmludGVuc2l0eSA9IDA7XG4gICAgdGhpcy5nbGFzcyA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5DYXBzdWxlR2VvbWV0cnkodHViZVJhZGl1cywgMTYsIHR1YmVIZWlnaHQsIDApLCBNYXRlcmlhbHMuZ2xhc3MpO1xuICAgIHRoaXMuYmFzZSA9IG5ldyBUSFJFRS5NZXNoKGJhc2VHZW8sIE1hdGVyaWFscy5jb3BwZXIpO1xuICAgIHRoaXMuYmcgPSBuZXcgVEhSRUUuTWVzaChiZ0dlbywgTWF0ZXJpYWxzLm5peGllQmcpO1xuICAgIHRoaXMubGVkID0gbmV3IExFRCh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLmxlZC5wb3NpdGlvbi56ID0gbGFtcE9mZnNldDtcbiAgICB0aGlzLmdsYXNzLnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0O1xuICAgIHRoaXMuYmcucG9zaXRpb24ueSA9IG1lc2hIZWlnaHQgLyAyICsgYmFzZUhlaWdodCAvIDI7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgaSA9IHJlZiRbaSRdO1xuICAgICAgcXVhZCA9IHRoaXMuY3JlYXRlRGlnaXRRdWFkKGksIGl4KTtcbiAgICAgIHF1YWQucG9zaXRpb24ueSA9IG1lc2hIZWlnaHQgLyAyICsgYmFzZUhlaWdodCAvIDI7XG4gICAgICBxdWFkLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHF1YWQuZGlnaXQgPSBpO1xuICAgICAgcXVhZC5yZW5kZXJPcmRlciA9IDA7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQocXVhZCk7XG4gICAgICByZXMkLnB1c2gocXVhZCk7XG4gICAgfVxuICAgIHRoaXMuZGlnaXRzID0gcmVzJDtcbiAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoJ29yYW5nZScsIDAuMywgMC4zKTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnkgPSB0aGlzLm9wdHMuc2NvcmVUdWJlSGVpZ2h0IC8gMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5nbGFzcyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYmFzZSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYmcpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5sZWQucm9vdCk7XG4gIH1cbiAgcHJvdG90eXBlLnB1bHNlID0gZnVuY3Rpb24odCl7XG4gICAgaWYgKHRoaXMuaW50ZW5zaXR5ID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSB0aGlzLmludGVuc2l0eSArIDAuMSAqIHNpbih0KTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zaG93RGlnaXQgPSBmdW5jdGlvbihkaWdpdCl7XG4gICAgdGhpcy5pbnRlbnNpdHkgPSBkaWdpdCAhPSBudWxsID8gMC41IDogMDtcbiAgICB0aGlzLmRpZ2l0cy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnZpc2libGUgPSBpdC5kaWdpdCA9PT0gZGlnaXQ7XG4gICAgfSk7XG4gICAgaWYgKGRpZ2l0ICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmxlZC5vbigpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5sZWQub2ZmKCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuY3JlYXRlRGlnaXRRdWFkID0gZnVuY3Rpb24oZGlnaXQsIGl4KXtcbiAgICB2YXIgZ2VvbSwgcXVhZDtcbiAgICBnZW9tID0gbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkodGhpcy5tZXNoV2lkdGgsIHRoaXMubWVzaEhlaWdodCk7XG4gICAgcmV0dXJuIHF1YWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tLCBNYXRlcmlhbHMubml4aWVEaWdpdHNbZGlnaXRdKTtcbiAgfTtcbiAgcmV0dXJuIE5peGllVHViZTtcbn0oQmFzZSkpO1xub3V0JC5OaXhpZURpc3BsYXkgPSBOaXhpZURpc3BsYXkgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKE5peGllRGlzcGxheSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnTml4aWVEaXNwbGF5JywgTml4aWVEaXNwbGF5KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IE5peGllRGlzcGxheTtcbiAgZnVuY3Rpb24gTml4aWVEaXNwbGF5KG9wdHMsIGdzKXtcbiAgICB2YXIgb2Zmc2V0LCBtYXJnaW4sIGJhc2VSYWRpdXMsIHJlcyQsIGkkLCB0byQsIGksIHR1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBOaXhpZURpc3BsYXkuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIG9mZnNldCA9IHRoaXMub3B0cy5zY29yZURpc3RhbmNlRnJvbUNlbnRyZSArIHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgbWFyZ2luID0gdGhpcy5vcHRzLnNjb3JlSW50ZXJUdWJlTWFyZ2luO1xuICAgIGJhc2VSYWRpdXMgPSB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIHRoaXMuY291bnQgPSA1O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYXN0U2Vlbk51bWJlcjogMFxuICAgIH07XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLmNvdW50OyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgdHViZSA9IG5ldyBOaXhpZVR1YmUodGhpcy5vcHRzLCBncyk7XG4gICAgICB0dWJlLnBvc2l0aW9uLnggPSBtYXJnaW4gKiBpICsgb2Zmc2V0ICsgaSAqIHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXMgKiAyO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHR1YmUucm9vdCk7XG4gICAgICByZXMkLnB1c2godHViZSk7XG4gICAgfVxuICAgIHRoaXMudHViZXMgPSByZXMkO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLnNjb3JlRGlzdGFuY2VGcm9tRWRnZTtcbiAgfVxuICBwcm90b3R5cGUucHVsc2UgPSBmdW5jdGlvbih0KXtcbiAgICByZXR1cm4gdGhpcy50dWJlcy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnB1bHNlKHQpO1xuICAgIH0pO1xuICB9O1xuICBwcm90b3R5cGUucnVuVG9OdW1iZXIgPSBmdW5jdGlvbihwLCBudW0pe1xuICAgIHZhciBuZXh0TnVtYmVyO1xuICAgIG5leHROdW1iZXIgPSBmbG9vcihsZXJwKHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIsIG51bSwgcCkpO1xuICAgIHJldHVybiB0aGlzLnNob3dOdW1iZXIobmV4dE51bWJlcik7XG4gIH07XG4gIHByb3RvdHlwZS5zZXROdW1iZXIgPSBmdW5jdGlvbihudW0pe1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIgPSBudW07XG4gICAgcmV0dXJuIHRoaXMuc2hvd051bWJlcihudW0pO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd051bWJlciA9IGZ1bmN0aW9uKG51bSl7XG4gICAgdmFyIGRpZ2l0cywgaSQsIGksIHR1YmUsIGRpZ2l0LCByZXN1bHRzJCA9IFtdO1xuICAgIG51bSA9PSBudWxsICYmIChudW0gPSAwKTtcbiAgICBkaWdpdHMgPSBtYXAocGFydGlhbGl6ZSQuYXBwbHkodGhpcywgW3BhcnNlSW50LCBbdm9pZCA4LCAxMF0sIFswXV0pKShcbiAgICBzcGxpdCgnJykoXG4gICAgZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnRvU3RyaW5nKCk7XG4gICAgfShcbiAgICBudW0pKSk7XG4gICAgZm9yIChpJCA9IHRoaXMuY291bnQgLSAxOyBpJCA+PSAwOyAtLWkkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0dWJlID0gdGhpcy50dWJlc1tpXTtcbiAgICAgIGRpZ2l0ID0gZGlnaXRzLnBvcCgpO1xuICAgICAgcmVzdWx0cyQucHVzaCh0dWJlLnNob3dEaWdpdChkaWdpdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBOaXhpZURpc3BsYXk7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gcGFydGlhbGl6ZSQoZiwgYXJncywgd2hlcmUpe1xuICB2YXIgY29udGV4dCA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBwYXJhbXMgPSBzbGljZSQuY2FsbChhcmd1bWVudHMpLCBpLFxuICAgICAgICBsZW4gPSBwYXJhbXMubGVuZ3RoLCB3bGVuID0gd2hlcmUubGVuZ3RoLFxuICAgICAgICB0YSA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW10sIHR3ID0gd2hlcmUgPyB3aGVyZS5jb25jYXQoKSA6IFtdO1xuICAgIGZvcihpID0gMDsgaSA8IGxlbjsgKytpKSB7IHRhW3R3WzBdXSA9IHBhcmFtc1tpXTsgdHcuc2hpZnQoKTsgfVxuICAgIHJldHVybiBsZW4gPCB3bGVuICYmIGxlbiA/XG4gICAgICBwYXJ0aWFsaXplJC5hcHBseShjb250ZXh0LCBbZiwgdGEsIHR3XSkgOiBmLmFwcGx5KGNvbnRleHQsIHRhKTtcbiAgfTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCByYW5kLCBmbG9vciwgQmFzZSwgbWVzaE1hdGVyaWFscywgUGFydGljbGVCdXJzdCwgUGFydGljbGVFZmZlY3QsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm1lc2hNYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9wYWxldHRlJykubWVzaE1hdGVyaWFscztcbm91dCQuUGFydGljbGVCdXJzdCA9IFBhcnRpY2xlQnVyc3QgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBzcGVlZCwgbGlmZXNwYW4sIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVCdXJzdCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnUGFydGljbGVCdXJzdCcsIFBhcnRpY2xlQnVyc3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVCdXJzdDtcbiAgc3BlZWQgPSAyO1xuICBsaWZlc3BhbiA9IDE1MDA7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlQnVyc3Qob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgcGFydGljbGVzLCBnZW9tZXRyeSwgY29sb3IsIG1hdGVyaWFsO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIFBhcnRpY2xlQnVyc3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuc2l6ZSA9IHRoaXMub3B0cy56YXBQYXJ0aWNsZVNpemU7XG4gICAgcGFydGljbGVzID0gMTUwMDtcbiAgICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMudmVsb2NpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMubGlmZXNwYW5zID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMuYWxwaGFzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMubWF4bGlmZXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5wb3NBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLnBvc2l0aW9ucywgMyk7XG4gICAgdGhpcy5jb2xBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLmNvbG9ycywgMyk7XG4gICAgdGhpcy5hbHBoYUF0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMuYWxwaGFzLCAxKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIHRoaXMucG9zQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjb2xvcicsIHRoaXMuY29sQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdvcGFjaXR5JywgdGhpcy5hbHBoYUF0dHIpO1xuICAgIGdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICAgIG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50Q2xvdWRNYXRlcmlhbCh7XG4gICAgICBzaXplOiB0aGlzLnNpemUsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgdmVydGV4Q29sb3JzOiBUSFJFRS5WZXJ0ZXhDb2xvcnNcbiAgICB9KTtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5Qb2ludENsb3VkKGdlb21ldHJ5LCBtYXRlcmlhbCkpO1xuICB9XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHgsIHosIHJlc3VsdHMkID0gW107XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgeCA9IDQuNSAtIE1hdGgucmFuZG9tKCkgKiA5O1xuICAgICAgeiA9IDAuNSAtIE1hdGgucmFuZG9tKCk7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMF0gPSB4ICogZ3JpZDtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IDA7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSB6ICogZ3JpZDtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB4IC8gMTA7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gcmFuZCgtMiAqIGdyaWQsIDEwICogZ3JpZCk7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gejtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMV0gPSAxO1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDJdID0gMTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5saWZlc3BhbnNbaSAvIDNdID0gMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmFjY2VsZXJhdGVQYXJ0aWNsZSA9IGZ1bmN0aW9uKGksIHQsIHAsIGJieCwgYmJ6KXtcbiAgICB2YXIgYWNjLCBweCwgcHksIHB6LCB2eCwgdnksIHZ6LCBweDEsIHB5MSwgcHoxLCB2eDEsIHZ5MSwgdnoxLCBsO1xuICAgIGlmICh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPD0gMCkge1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gLTEwMDA7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHQgPSB0IC8gKDEwMDAgLyBzcGVlZCk7XG4gICAgYWNjID0gLTAuOTg7XG4gICAgcHggPSB0aGlzLnBvc2l0aW9uc1tpICsgMF07XG4gICAgcHkgPSB0aGlzLnBvc2l0aW9uc1tpICsgMV07XG4gICAgcHogPSB0aGlzLnBvc2l0aW9uc1tpICsgMl07XG4gICAgdnggPSB0aGlzLnZlbG9jaXRpZXNbaSArIDBdO1xuICAgIHZ5ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAxXTtcbiAgICB2eiA9IHRoaXMudmVsb2NpdGllc1tpICsgMl07XG4gICAgcHgxID0gcHggKyAwLjUgKiAwICogdCAqIHQgKyB2eCAqIHQ7XG4gICAgcHkxID0gcHkgKyAwLjUgKiBhY2MgKiB0ICogdCArIHZ5ICogdDtcbiAgICBwejEgPSBweiArIDAuNSAqIDAgKiB0ICogdCArIHZ6ICogdDtcbiAgICB2eDEgPSAwICogdCArIHZ4O1xuICAgIHZ5MSA9IGFjYyAqIHQgKyB2eTtcbiAgICB2ejEgPSAwICogdCArIHZ6O1xuICAgIGlmIChweTEgPCB0aGlzLnNpemUgLyAyICYmICgtYmJ4IDwgcHgxICYmIHB4MSA8IGJieCkgJiYgKC1iYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUgPCBwejEgJiYgcHoxIDwgYmJ6ICsgMS45ICogdGhpcy5vcHRzLmdyaWRTaXplKSkge1xuICAgICAgcHkxID0gdGhpcy5zaXplIC8gMjtcbiAgICAgIHZ4MSAqPSAwLjc7XG4gICAgICB2eTEgKj0gLTAuNjtcbiAgICAgIHZ6MSAqPSAwLjc7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb25zW2kgKyAwXSA9IHB4MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSBweTE7XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDJdID0gcHoxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB2eDE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAxXSA9IHZ5MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gdnoxO1xuICAgIGwgPSB0aGlzLmxpZmVzcGFuc1tpIC8gM10gLyB0aGlzLm1heGxpZmVzW2kgLyAzXTtcbiAgICBsID0gbCAqIGwgKiBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDFdID0gbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSBsO1xuICAgIHJldHVybiB0aGlzLmFscGhhc1tpIC8gM10gPSBsO1xuICB9O1xuICBwcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oeSl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHRoaXMubGlmZXNwYW5zW2kgLyAzXSA9IGxpZmVzcGFuIC8gMiArIE1hdGgucmFuZG9tKCkgKiBsaWZlc3BhbiAvIDI7XG4gICAgICB0aGlzLm1heGxpZmVzW2kgLyAzXSA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5wb3NpdGlvbnNbaSArIDFdID0gKHkgKyBNYXRoLnJhbmRvbSgpKSAqIGdyaWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCDOlHQpe1xuICAgIHZhciBib3VuY2VCb3VuZHNYLCBib3VuY2VCb3VuZHNaLCBpJCwgdG8kLCBpO1xuICAgIGJvdW5jZUJvdW5kc1ggPSB0aGlzLm9wdHMuZGVza1NpemVbMF0gLyAyO1xuICAgIGJvdW5jZUJvdW5kc1ogPSB0aGlzLm9wdHMuZGVza1NpemVbMV0gLyAyO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0aGlzLmFjY2VsZXJhdGVQYXJ0aWNsZShpLCDOlHQsIDEsIGJvdW5jZUJvdW5kc1gsIGJvdW5jZUJvdW5kc1opO1xuICAgICAgdGhpcy5saWZlc3BhbnNbaSAvIDNdIC09IM6UdDtcbiAgICB9XG4gICAgdGhpcy5wb3NBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jb2xBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfTtcbiAgcmV0dXJuIFBhcnRpY2xlQnVyc3Q7XG59KEJhc2UpKTtcbm91dCQuUGFydGljbGVFZmZlY3QgPSBQYXJ0aWNsZUVmZmVjdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVFZmZlY3QsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1BhcnRpY2xlRWZmZWN0JywgUGFydGljbGVFZmZlY3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVFZmZlY3Q7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlRWZmZWN0KG9wdHMsIGdzKXtcbiAgICB2YXIgYXJlbmEsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCByb3c7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVFZmZlY3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMueiA9IHRoaXMub3B0cy56O1xuICAgIHRoaXMuaCA9IGhlaWdodDtcbiAgICB0aGlzLnJvd3MgPSBbXG4gICAgICAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KVxuICAgIF07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgcm93LmFkZFRvKHRoaXMucm9vdCk7XG4gICAgfVxuICB9XG4gIHByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24ocm93cyl7XG4gICAgdmFyIGkkLCBsZW4kLCBpLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucm93c1tpXS5zZXRIZWlnaHQoKHRoaXMuaCAtIDEpIC0gcm93SXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgc3lzdGVtLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBzeXN0ZW0gPSByZWYkW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2goc3lzdGVtLnJlc2V0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCBmc3JyLCDOlHQpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIHN5c3RlbSwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHN5c3RlbSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChzeXN0ZW0udXBkYXRlKHAsIM6UdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBQYXJ0aWNsZUVmZmVjdDtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgY29zLCBCYXNlLCBUaXRsZSwgY2FudmFzVGV4dHVyZSwgU3RhcnRNZW51LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3M7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcblRpdGxlID0gcmVxdWlyZSgnLi90aXRsZScpLlRpdGxlO1xuY2FudmFzVGV4dHVyZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0ZXh0dXJlU2l6ZSwgZmlkZWxpdHlGYWN0b3IsIHRleHRDbnYsIGltZ0NudiwgdGV4dEN0eCwgaW1nQ3R4O1xuICB0ZXh0dXJlU2l6ZSA9IDEwMjQ7XG4gIGZpZGVsaXR5RmFjdG9yID0gMTAwO1xuICB0ZXh0Q252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGltZ0NudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB0ZXh0Q3R4ID0gdGV4dENudi5nZXRDb250ZXh0KCcyZCcpO1xuICBpbWdDdHggPSBpbWdDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ252LndpZHRoID0gaW1nQ252LmhlaWdodCA9IHRleHR1cmVTaXplO1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdpZHRoLCBoZWlnaHQsIHRleHQsIHRleHRTaXplLCByZWYkO1xuICAgIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQsIHRleHQgPSBhcmckLnRleHQsIHRleHRTaXplID0gKHJlZiQgPSBhcmckLnRleHRTaXplKSAhPSBudWxsID8gcmVmJCA6IDEwO1xuICAgIHRleHRDbnYud2lkdGggPSB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDbnYuaGVpZ2h0ID0gaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3I7XG4gICAgdGV4dEN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICB0ZXh0Q3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgIHRleHRDdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICB0ZXh0Q3R4LmZvbnQgPSB0ZXh0U2l6ZSAqIGZpZGVsaXR5RmFjdG9yICsgXCJweCBtb25vc3BhY2VcIjtcbiAgICB0ZXh0Q3R4LmZpbGxUZXh0KHRleHQsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IgLyAyLCBoZWlnaHQgKiBmaWRlbGl0eUZhY3RvciAvIDIsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IpO1xuICAgIGltZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZmlsbFJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZHJhd0ltYWdlKHRleHRDbnYsIDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgcmV0dXJuIGltZ0Nudi50b0RhdGFVUkwoKTtcbiAgfTtcbn0oKTtcbm91dCQuU3RhcnRNZW51ID0gU3RhcnRNZW51ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChTdGFydE1lbnUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1N0YXJ0TWVudScsIFN0YXJ0TWVudSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTdGFydE1lbnU7XG4gIGZ1bmN0aW9uIFN0YXJ0TWVudShvcHRzLCBncyl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgb3B0aW9uLCBxdWFkO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgU3RhcnRNZW51LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZ3Muc3RhcnRNZW51Lm1lbnVEYXRhKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIG9wdGlvbiA9IHJlZiRbaSRdO1xuICAgICAgcXVhZCA9IHRoaXMuY3JlYXRlT3B0aW9uUXVhZChvcHRpb24sIGl4KTtcbiAgICAgIHF1YWQucG9zaXRpb24ueSA9IDAuNSAtIGl4ICogMC4yO1xuICAgICAgdGhpcy5vcHRpb25zLnB1c2gocXVhZCk7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQocXVhZCk7XG4gICAgfVxuICAgIHRoaXMudGl0bGUgPSBuZXcgVGl0bGUodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy50aXRsZS5hZGRUbyh0aGlzLnJlZ2lzdHJhdGlvbik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IC0xICogKHRoaXMub3B0cy5jYW1lcmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmFyZW5hRGlzdGFuY2VGcm9tRWRnZSArIHRoaXMub3B0cy5ibG9ja1NpemUgLyAyKTtcbiAgfVxuICBwcm90b3R5cGUuY3JlYXRlT3B0aW9uUXVhZCA9IGZ1bmN0aW9uKG9wdGlvbiwgaXgpe1xuICAgIHZhciBpbWFnZSwgdGV4LCBnZW9tLCBtYXQsIHF1YWQ7XG4gICAgaW1hZ2UgPSBjYW52YXNUZXh0dXJlKHtcbiAgICAgIHRleHQ6IG9wdGlvbi50ZXh0LFxuICAgICAgd2lkdGg6IDYwLFxuICAgICAgaGVpZ2h0OiAxMFxuICAgIH0pO1xuICAgIHRleCA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoaW1hZ2UpO1xuICAgIGdlb20gPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSgxLCAwLjIpO1xuICAgIG1hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleCxcbiAgICAgIGFscGhhTWFwOiB0ZXgsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBxdWFkID0gbmV3IFRIUkVFLk1lc2goZ2VvbSwgbWF0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgc3RhcnRNZW51O1xuICAgIHN0YXJ0TWVudSA9IGdzLnN0YXJ0TWVudTtcbiAgICB0aGlzLnRpdGxlLnJldmVhbChzdGFydE1lbnUudGl0bGVSZXZlYWxBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVNlbGVjdGlvbihncy5zdGFydE1lbnUsIGdzLmVsYXBzZWRUaW1lKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVNlbGVjdGlvbiA9IGZ1bmN0aW9uKHN0YXRlLCB0aW1lKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBxdWFkLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLm9wdGlvbnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgcXVhZCA9IHJlZiRbaSRdO1xuICAgICAgaWYgKGl4ID09PSBzdGF0ZS5jdXJyZW50SW5kZXgpIHtcbiAgICAgICAgcXVhZC5zY2FsZS54ID0gMSArIDAuMDUgKiBzaW4odGltZSAvIDMwMCk7XG4gICAgICAgIHJlc3VsdHMkLnB1c2gocXVhZC5zY2FsZS55ID0gMSArIDAuMDUgKiAtc2luKHRpbWUgLyAzMDApKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gU3RhcnRNZW51O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmFzZSwgTWF0ZXJpYWxzLCBUYWJsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5UYWJsZSA9IFRhYmxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUYWJsZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVGFibGUnLCBUYWJsZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUYWJsZTtcbiAgZnVuY3Rpb24gVGFibGUob3B0cywgZ3Mpe1xuICAgIHZhciByZWYkLCB3aWR0aCwgZGVwdGgsIHRoaWNrbmVzcztcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIFRhYmxlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZWYkID0gdGhpcy5vcHRzLmRlc2tTaXplLCB3aWR0aCA9IHJlZiRbMF0sIGRlcHRoID0gcmVmJFsxXSwgdGhpY2tuZXNzID0gcmVmJFsyXTtcbiAgICB0aGlzLnRhYmxlID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KHdpZHRoLCB0aGlja25lc3MsIGRlcHRoKSwgTWF0ZXJpYWxzLnRhYmxlRmFjZXMpO1xuICAgIHRoaXMudGFibGUucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMudGFibGUpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSB0aGlja25lc3MgLyAtMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gZGVwdGggLyAtMjtcbiAgfVxuICByZXR1cm4gVGFibGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIG1pbiwgbWF4LCBFYXNlLCBCYXNlLCBNYXRlcmlhbHMsIGJsb2NrVGV4dCwgVGl0bGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCBtaW4gPSByZWYkLm1pbiwgbWF4ID0gcmVmJC5tYXg7XG5FYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xuYmxvY2tUZXh0ID0ge1xuICB0ZXRyaXM6IFtbMSwgMSwgMSwgMiwgMiwgMiwgMywgMywgMywgNCwgNCwgMCwgNSwgNiwgNiwgNl0sIFswLCAxLCAwLCAyLCAwLCAwLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCAwLCAwXSwgWzAsIDEsIDAsIDIsIDIsIDAsIDAsIDMsIDAsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgMCwgMCwgNl0sIFswLCAxLCAwLCAyLCAyLCAyLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCA2LCA2LCA2XV0sXG4gIHZydDogW1sxLCAwLCAxLCA0LCA0LCA2LCA2LCA2XSwgWzEsIDAsIDEsIDQsIDAsIDQsIDYsIDBdLCBbMSwgMCwgMSwgNCwgNCwgMCwgNiwgMF0sIFsxLCAwLCAxLCA0LCAwLCA0LCA2LCAwXSwgWzAsIDEsIDAsIDQsIDAsIDQsIDYsIDBdXSxcbiAgZ2hvc3Q6IFtbMSwgMSwgMSwgMiwgMCwgMiwgMywgMywgMywgNCwgNCwgNCwgNSwgNSwgNV0sIFsxLCAwLCAwLCAyLCAwLCAyLCAzLCAwLCAzLCA0LCAwLCAwLCAwLCA1LCAwXSwgWzEsIDAsIDAsIDIsIDIsIDIsIDMsIDAsIDMsIDQsIDQsIDQsIDAsIDUsIDBdLCBbMSwgMCwgMSwgMiwgMCwgMiwgMywgMCwgMywgMCwgMCwgNCwgMCwgNSwgMF0sIFsxLCAxLCAxLCAyLCAwLCAyLCAzLCAzLCAzLCA0LCA0LCA0LCAwLCA1LCAwXV1cbn07XG5vdXQkLlRpdGxlID0gVGl0bGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRpdGxlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUaXRsZScsIFRpdGxlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpdGxlO1xuICBmdW5jdGlvbiBUaXRsZShvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHRleHQsIG1hcmdpbiwgaGVpZ2h0LCBibG9ja0dlbywgaSQsIGxlbiQsIHksIHJvdywgaiQsIGxlbjEkLCB4LCBjZWxsLCBib3g7XG4gICAgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemUsIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBUaXRsZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGV4dCA9IGJsb2NrVGV4dC52cnQ7XG4gICAgbWFyZ2luID0gKGdyaWRTaXplIC0gYmxvY2tTaXplKSAvIDI7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMud29yZCA9IG5ldyBUSFJFRS5PYmplY3QzRCk7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnggPSAodGV4dFswXS5sZW5ndGggLSAxKSAqIGdyaWRTaXplIC8gLTI7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnkgPSBoZWlnaHQgLyAtMiAtICh0ZXh0Lmxlbmd0aCAtIDEpICogZ3JpZFNpemUgLyAtMjtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueiA9IGdyaWRTaXplIC8gMjtcbiAgICBibG9ja0dlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIGJsb2NrU2l6ZSwgYmxvY2tTaXplKTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRleHQubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHRleHRbaSRdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICBpZiAoY2VsbCkge1xuICAgICAgICAgIGJveCA9IG5ldyBUSFJFRS5NZXNoKGJsb2NrR2VvLCBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdKTtcbiAgICAgICAgICBib3gucG9zaXRpb24uc2V0KGdyaWRTaXplICogeCArIG1hcmdpbiwgZ3JpZFNpemUgKiAodGV4dC5sZW5ndGggLSB5KSArIG1hcmdpbiwgZ3JpZFNpemUgLyAtMik7XG4gICAgICAgICAgdGhpcy53b3JkLmFkZChib3gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHByb3RvdHlwZS5yZXZlYWwgPSBmdW5jdGlvbihwcm9ncmVzcyl7XG4gICAgdmFyIHA7XG4gICAgcCA9IG1pbigxLCBwcm9ncmVzcyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IEVhc2UucXVpbnRPdXQocCwgdGhpcy5oZWlnaHQgKiAyLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueSA9IEVhc2UuZXhwT3V0KHAsIDMwLCAwKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IEVhc2UuZXhwT3V0KHAsIC1waSAvIDEwLCAwKTtcbiAgfTtcbiAgcHJvdG90eXBlLmRhbmNlID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueSA9IC1waSAvIDIgKyB0aW1lIC8gMTAwMDtcbiAgICByZXR1cm4gdGhpcy53b3JkLm9wYWNpdHkgPSAwLjUgKyAwLjUgKiBzaW4gKyB0aW1lIC8gMTAwMDtcbiAgfTtcbiAgcmV0dXJuIFRpdGxlO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmFzZSwgU3RhcnRNZW51LCBGYWlsU2NyZWVuLCBUb3BzaWRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKS5TdGFydE1lbnU7XG5GYWlsU2NyZWVuID0gcmVxdWlyZSgnLi9mYWlsLXNjcmVlbicpLkZhaWxTY3JlZW47XG5vdXQkLlRvcHNpZGUgPSBUb3BzaWRlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUb3BzaWRlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUb3BzaWRlJywgVG9wc2lkZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUb3BzaWRlO1xuICBmdW5jdGlvbiBUb3BzaWRlKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGxvZyhcIlRvcHNpZGU6Om5ld1wiKTtcbiAgICBUb3BzaWRlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnN0YXJ0TWVudSA9IG5ldyBTdGFydE1lbnUodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5mYWlsU2NyZWVuID0gbmV3IEZhaWxTY3JlZW4odGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5zdGFydE1lbnUuYWRkVG8odGhpcy5yb290KTtcbiAgICB0aGlzLmZhaWxTY3JlZW4uYWRkVG8odGhpcy5yb290KTtcbiAgfVxuICByZXR1cm4gVG9wc2lkZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIFVuZGVyc2lkZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5VbmRlcnNpZGUgPSBVbmRlcnNpZGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFVuZGVyc2lkZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVW5kZXJzaWRlJywgVW5kZXJzaWRlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFVuZGVyc2lkZTtcbiAgZnVuY3Rpb24gVW5kZXJzaWRlKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGxvZyhcIlVuZGVyc2lkZTo6bmV3XCIpO1xuICB9XG4gIHJldHVybiBVbmRlcnNpZGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIHBpLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBwaSA9IHJlZiQucGk7XG5vdXQkLkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IERlYnVnQ2FtZXJhUG9zaXRpb25lciA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIuZGlzcGxheU5hbWUgPSAnRGVidWdDYW1lcmFQb3NpdGlvbmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnQ2FtZXJhUG9zaXRpb25lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xuICBmdW5jdGlvbiBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIoY2FtZXJhLCB0YXJnZXQpe1xuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIHRhcmdldDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmVuYWJsZWQgPSB0cnVlO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmICh0aGlzLnN0YXRlLmVuYWJsZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmF1dG9Sb3RhdGUoZ3MuZWxhcHNlZFRpbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocGhhc2UsIHZwaGFzZSl7XG4gICAgdmFyIHRoYXQ7XG4gICAgdnBoYXNlID09IG51bGwgJiYgKHZwaGFzZSA9IDApO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSB0aGlzLnIgKiBzaW4ocGhhc2UpO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnkgKyB0aGlzLnIgKiAtc2luKHZwaGFzZSk7XG4gICAgcmV0dXJuIHRoaXMuY2FtZXJhLmxvb2tBdCgodGhhdCA9IHRoaXMudGFyZ2V0LnBvc2l0aW9uKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogdGhpcy50YXJnZXQpO1xuICB9O1xuICBwcm90b3R5cGUuYXV0b1JvdGF0ZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHJldHVybiB0aGlzLnNldFBvc2l0aW9uKHBpIC8gMTAgKiBzaW4odGltZSAvIDEwMDApKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbn0oKSk7IiwidmFyIHBpO1xucGkgPSByZXF1aXJlKCdzdGQnKS5waTtcblRIUkVFLkNhcHN1bGVHZW9tZXRyeSA9IGZ1bmN0aW9uKHJhZGl1cywgcmFkaWFsU2VnbWVudHMsIGhlaWdodCwgbGVuZ3Rod2lzZVNlZ21lbnRzKXtcbiAgdmFyIGhhbGZTcGhlcmUsIHR1YmU7XG4gIGhhbGZTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCByYWRpYWxTZWdtZW50cywgcmFkaWFsU2VnbWVudHMsIDAsIHBpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAwLCAwKSk7XG4gIGhhbGZTcGhlcmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25YKC1waSAvIDIpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSgxLCAwLjUsIDEpKTtcbiAgdHViZSA9IG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KHJhZGl1cywgcmFkaXVzLCBoZWlnaHQsIHJhZGlhbFNlZ21lbnRzICogMiwgbGVuZ3Rod2lzZVNlZ21lbnRzLCB0cnVlKTtcbiAgdHViZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAtaGVpZ2h0IC8gMiwgMCkpO1xuICBoYWxmU3BoZXJlLm1lcmdlKHR1YmUpO1xuICByZXR1cm4gaGFsZlNwaGVyZTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgbGVycCwgcmFuZCwgZmxvb3IsIG1hcCwgRWFzZSwgVEhSRUUsIFBhbGV0dGUsIFNjZW5lTWFuYWdlciwgRGVidWdDYW1lcmFQb3NpdGlvbmVyLCBBcmVuYSwgVGFibGUsIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgTGlnaHRpbmcsIEJyaWNrUHJldmlldywgTml4aWVEaXNwbGF5LCBUb3BzaWRlLCBUcmFja2JhbGxDb250cm9scywgVGhyZWVKc1JlbmRlcmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgbGVycCA9IHJlZiQubGVycCwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcDtcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcblNjZW5lTWFuYWdlciA9IHJlcXVpcmUoJy4vc2NlbmUtbWFuYWdlcicpLlNjZW5lTWFuYWdlcjtcbkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IHJlcXVpcmUoJy4vZGVidWctY2FtZXJhJykuRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xucmVmJCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpLCBBcmVuYSA9IHJlZiQuQXJlbmEsIFRhYmxlID0gcmVmJC5UYWJsZSwgU3RhcnRNZW51ID0gcmVmJC5TdGFydE1lbnUsIEZhaWxTY3JlZW4gPSByZWYkLkZhaWxTY3JlZW4sIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIE5peGllRGlzcGxheSA9IHJlZiQuTml4aWVEaXNwbGF5O1xuVG9wc2lkZSA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpLlRvcHNpZGU7XG5UcmFja2JhbGxDb250cm9scyA9IHJlcXVpcmUoJy4uLy4uL2xpYi90cmFja2JhbGwtY29udHJvbHMuanMnKS5UcmFja2JhbGxDb250cm9scztcbm91dCQuVGhyZWVKc1JlbmRlcmVyID0gVGhyZWVKc1JlbmRlcmVyID0gKGZ1bmN0aW9uKCl7XG4gIFRocmVlSnNSZW5kZXJlci5kaXNwbGF5TmFtZSA9ICdUaHJlZUpzUmVuZGVyZXInO1xuICB2YXIgcHJvdG90eXBlID0gVGhyZWVKc1JlbmRlcmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaHJlZUpzUmVuZGVyZXI7XG4gIGZ1bmN0aW9uIFRocmVlSnNSZW5kZXJlcihvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBuYW1lLCByZWYkLCBwYXJ0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIGxvZyhcIlJlbmRlcmVyOjpuZXdcIik7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBTY2VuZU1hbmFnZXIodGhpcy5vcHRzKTtcbiAgICB0aGlzLm9wdHMuc2NlbmUgPSB0aGlzLnNjZW5lO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmcmFtZXNTaW5jZVJvd3NSZW1vdmVkOiAwLFxuICAgICAgbGFzdFNlZW5TdGF0ZTogJ25vLWdhbWUnXG4gICAgfTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmppdHRlciA9IG5ldyBUSFJFRS5PYmplY3QzRCk7XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIHRhYmxlOiBuZXcgVGFibGUodGhpcy5vcHRzLCBncyksXG4gICAgICBsaWdodGluZzogbmV3IExpZ2h0aW5nKHRoaXMub3B0cywgZ3MpLFxuICAgICAgYXJlbmE6IG5ldyBBcmVuYSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIG5leHRCcmljazogbmV3IEJyaWNrUHJldmlldyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHNjb3JlOiBuZXcgTml4aWVEaXNwbGF5KHRoaXMub3B0cywgZ3MpLFxuICAgICAgdG9wc2lkZTogbmV3IFRvcHNpZGUodGhpcy5vcHRzLCBncyksXG4gICAgICBzdGFydE1lbnU6IG5ldyBTdGFydE1lbnUodGhpcy5vcHRzLCBncyksXG4gICAgICBmYWlsU2NyZWVuOiBuZXcgRmFpbFNjcmVlbih0aGlzLm9wdHMsIGdzKVxuICAgIH07XG4gICAgZm9yIChuYW1lIGluIHJlZiQgPSB0aGlzLnBhcnRzKSB7XG4gICAgICBwYXJ0ID0gcmVmJFtuYW1lXTtcbiAgICAgIHBhcnQuYWRkVG8odGhpcy5qaXR0ZXIpO1xuICAgIH1cbiAgICB0aGlzLnBhcnRzLm5leHRCcmljay5yb290LnBvc2l0aW9uLnNldCgtdGhpcy5vcHRzLnByZXZpZXdEaXN0YW5jZUZyb21DZW50ZXIsIDAsIC10aGlzLm9wdHMucHJldmlld0Rpc3RhbmNlRnJvbUVkZ2UpO1xuICAgIHRoaXMucGFydHMuYXJlbmEucm9vdC5wb3NpdGlvbi5zZXQoMCwgMCwgLXRoaXMub3B0cy5hcmVuYURpc3RhbmNlRnJvbUVkZ2UpO1xuICAgIHRoaXMuYWRkVHJhY2tiYWxsKCk7XG4gICAgdGhpcy5zY2VuZS5jb250cm9scy5yZXNldFNlbnNvcigpO1xuICAgIHRoaXMuc2NlbmUucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnNldCgwLCAtdGhpcy5vcHRzLmNhbWVyYUVsZXZhdGlvbiwgLXRoaXMub3B0cy5jYW1lcmFEaXN0YW5jZUZyb21FZGdlICogNCk7XG4gICAgdGhpcy5zY2VuZS5zaG93SGVscGVycygpO1xuICB9XG4gIHByb3RvdHlwZS5zZXRNZW51RmFjaW5nID0gZnVuY3Rpb24oKXt9O1xuICBwcm90b3R5cGUuc2V0R2FtZUZhY2luZyA9IGZ1bmN0aW9uKCl7fTtcbiAgcHJvdG90eXBlLmFkZFRyYWNrYmFsbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRyYWNrYmFsbFRhcmdldDtcbiAgICB0cmFja2JhbGxUYXJnZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdHJhY2tiYWxsVGFyZ2V0LnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2U7XG4gICAgdGhpcy5zY2VuZS5hZGQodHJhY2tiYWxsVGFyZ2V0KTtcbiAgICB0aGlzLnRyYWNrYmFsbCA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyh0aGlzLnNjZW5lLmNhbWVyYSwgdHJhY2tiYWxsVGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy50cmFja2JhbGwucGFuU3BlZWQgPSAxO1xuICB9O1xuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLnNjZW5lLmRvbUVsZW1lbnQpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzLCBwO1xuICAgIHRoaXMudHJhY2tiYWxsLnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUudXBkYXRlKCk7XG4gICAgaWYgKGdzLm1ldGFnYW1lU3RhdGUgIT09IHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSkge1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICBjYXNlICdnYW1lJzpcbiAgICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIGxvZygnbm8tZ2FtZScpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHJvd3MgPSBncy5jb3JlLnJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgICBwID0gZ3MuYXJlbmEuemFwQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgICAgZ3Muc2xvd2Rvd24gPSAxICsgRWFzZS5leHBJbihwLCAyLCAwKTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEuemFwTGluZXMoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncyk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnJ1blRvTnVtYmVyKGdzLmFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcywgZ3Muc2NvcmUucG9pbnRzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucHVsc2UoZ3MuZWxhcHNlZFRpbWUgLyAxMDAwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgZ3Muc2xvd2Rvd24gPSAxO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGUoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlTaGFwZShncy5icmljay5uZXh0KTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncyk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnNldE51bWJlcihncy5zY29yZS5wb2ludHMpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5wdWxzZShncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5Tm90aGluZygpO1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdXNlLW1lbnUnOlxuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheU5vdGhpbmcoKTtcbiAgICAgIHRoaXMucGFydHMucGF1c2VNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlOb3RoaW5nKCk7XG4gICAgICB0aGlzLnBhcnRzLmZhaWxTY3JlZW4udXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2coXCJUaHJlZUpzUmVuZGVyZXI6OnJlbmRlciAtIFVua25vd24gbWV0YWdhbWVzdGF0ZTpcIiwgZ3MubWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMucGFydHMuYXJlbmEudXBkYXRlUGFydGljbGVzKGdzKTtcbiAgICB0aGlzLnN0YXRlLmxhc3RTZWVuU3RhdGUgPSBncy5tZXRhZ2FtZVN0YXRlO1xuICAgIHJldHVybiB0aGlzLnNjZW5lLnJlbmRlcigpO1xuICB9O1xuICByZXR1cm4gVGhyZWVKc1JlbmRlcmVyO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBQYWxldHRlLCBhc3NldFBhdGgsIHRleHR1cmVzLCBpLCBlbXB0eSwgbm9ybWFsLCBkZWJ1Z1dpcmVmcmFtZSwgaGVscGVyQSwgaGVscGVyQiwgZ2xhc3MsIGNvcHBlciwgbml4aWVEaWdpdHMsIG5peGllQmcsIGJsb2NrcywgY29sb3IsIGhvbG9CbG9ja3MsIHphcCwgdGFibGVUb3AsIHRhYmxlRWRnZSwgdGFibGVGYWNlcywgbGluZXMsIGZsYXJlLCBmbGFyZUZhY2VzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuYXNzZXRQYXRoID0gKGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIFwiYXNzZXRzL1wiICsgaXQ7XG59KTtcbnRleHR1cmVzID0ge1xuICBuaXhpZURpZ2l0c0NvbG9yOiAoZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJlc3VsdHMkLnB1c2goVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJkaWdpdC1cIiArIGkgKyBcIi5jb2wucG5nXCIpKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfSgpKSxcbiAgbml4aWVCZ0NvbG9yOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImRpZ2l0LWJnLmNvbC5wbmdcIikpLFxuICBibG9ja1RpbGVOb3JtYWw6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwidGlsZS5ucm0ucG5nXCIpKSxcbiAgdGFibGVUb3BDb2xvcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5jb2wucG5nXCIpKSxcbiAgdGFibGVFZGdlQ29sb3I6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiYm9hcmQtZi5jb2wucG5nXCIpKSxcbiAgdGFibGVUb3BTcGVjdWxhcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5zcGVjLnBuZ1wiKSksXG4gIGZsYXJlQWxwaGE6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiZmxhcmUuYWxwaGEucG5nXCIpKVxufTtcbm91dCQuZW1wdHkgPSBlbXB0eSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIHZpc2libGU6IGZhbHNlLFxuICBjb2xvcjogMHgwLFxuICBlbWlzc2l2ZTogMHgwLFxuICBvcGFjaXR5OiAwXG59KTtcbm91dCQubm9ybWFsID0gbm9ybWFsID0gbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbDtcbm91dCQuZGVidWdXaXJlZnJhbWUgPSBkZWJ1Z1dpcmVmcmFtZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIGNvbG9yOiAnd2hpdGUnLFxuICB3aXJlZnJhbWU6IHRydWVcbn0pO1xub3V0JC5oZWxwZXJBID0gaGVscGVyQSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIGNvbG9yOiAweGZmMDAwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIG9wYWNpdHk6IDAuNVxufSk7XG5vdXQkLmhlbHBlckIgPSBoZWxwZXJCID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6IDB4MDBmZjAwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgb3BhY2l0eTogMC41XG59KTtcbm91dCQuZ2xhc3MgPSBnbGFzcyA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDIyMjIyMixcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiAxMDAsXG4gIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICBkZXB0aFdyaXRlOiBmYWxzZVxufSk7XG5vdXQkLmNvcHBlciA9IGNvcHBlciA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDk2NTExMSxcbiAgc3BlY3VsYXI6IDB4Y2I2ZDUxLFxuICBzaGluaW5lc3M6IDMwXG59KTtcbm91dCQubml4aWVEaWdpdHMgPSBuaXhpZURpZ2l0cyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwOyBpJCA8PSA5OyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZXMubml4aWVEaWdpdHNDb2xvcltpXSxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgY29sb3I6IDB4ZmYzMzAwLFxuICAgICAgZW1pc3NpdmU6IDB4ZmZiYjAwXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLm5peGllQmcgPSBuaXhpZUJnID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgbWFwOiB0ZXh0dXJlcy5uaXhpZUJnQ29sb3IsXG4gIGNvbG9yOiAweDAwMDAwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiA4MFxufSk7XG5vdXQkLmJsb2NrcyA9IGJsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICBzcGVjdWxhcjogUGFsZXR0ZS5zcGVjQ29sb3JzW2ldLFxuICAgICAgc2hpbmluZXNzOiAxMDAsXG4gICAgICBub3JtYWxNYXA6IHRleHR1cmVzLmJsb2NrVGlsZU5vcm1hbFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5ob2xvQmxvY2tzID0gaG9sb0Jsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGVtaXNzaXZlOiAweGZmZmZmZixcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIHNwZWN1bGFyOiBQYWxldHRlLnNwZWNDb2xvcnNbaV0sXG4gICAgICBzaGluaW5lc3M6IDEwMCxcbiAgICAgIG5vcm1hbE1hcDogdGV4dHVyZXMuYmxvY2tUaWxlTm9ybWFsXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLnphcCA9IHphcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweGZmZmZmZixcbiAgZW1pc3NpdmU6IDB4ZmZmZmZmXG59KTtcbm91dCQudGFibGVUb3AgPSB0YWJsZVRvcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIG1hcDogdGV4dHVyZXMudGFibGVUb3BDb2xvcixcbiAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICBzcGVjdWxhck1hcDogdGV4dHVyZXMudGFibGVUb3BTcGVjdWxhcixcbiAgc2hpbmluZXNzOiAxMDBcbn0pO1xub3V0JC50YWJsZUVkZ2UgPSB0YWJsZUVkZ2UgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBtYXA6IHRleHR1cmVzLnRhYmxlRWRnZUNvbG9yXG59KTtcbm91dCQudGFibGVGYWNlcyA9IHRhYmxlRmFjZXMgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChbdGFibGVFZGdlLCB0YWJsZUVkZ2UsIHRhYmxlVG9wLCB0YWJsZUVkZ2UsIHRhYmxlRWRnZSwgdGFibGVFZGdlXSk7XG5vdXQkLmxpbmVzID0gbGluZXMgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gUGFsZXR0ZS50aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLmZsYXJlID0gZmxhcmUgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBjb2xvcjogMHgwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgZW1pc3NpdmU6ICd3aGl0ZScsXG4gIG9wYWNpdHk6IDAuMixcbiAgZGVwdGhXcml0ZTogZmFsc2UsXG4gIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICBhbHBoYU1hcDogdGV4dHVyZXMuZmxhcmVBbHBoYVxufSk7XG5vdXQkLmZsYXJlRmFjZXMgPSBmbGFyZUZhY2VzID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoW2ZsYXJlLCBmbGFyZSwgZW1wdHksIGVtcHR5LCBmbGFyZSwgZmxhcmVdKTsiLCJ2YXIgVEhSRUUsIHJlZiQsIGxvZywgbWFwLCBwbHVjaywgbmV1dHJhbCwgcmVkLCBvcmFuZ2UsIGdyZWVuLCBtYWdlbnRhLCBibHVlLCBicm93biwgeWVsbG93LCBjeWFuLCBjb2xvck9yZGVyLCB0aWxlQ29sb3JzLCBzcGVjQ29sb3JzLCBQYWxldHRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBtYXAgPSByZWYkLm1hcCwgcGx1Y2sgPSByZWYkLnBsdWNrO1xub3V0JC5uZXV0cmFsID0gbmV1dHJhbCA9IFsweGZmZmZmZiwgMHhjY2NjY2MsIDB4ODg4ODg4LCAweDIxMjEyMV07XG5vdXQkLnJlZCA9IHJlZCA9IFsweEZGNDQ0NCwgMHhGRjc3NzcsIDB4ZGQ0NDQ0LCAweDU1MTExMV07XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsweEZGQkIzMywgMHhGRkNDODgsIDB4Q0M4ODAwLCAweDU1MzMwMF07XG5vdXQkLmdyZWVuID0gZ3JlZW4gPSBbMHg0NGZmNjYsIDB4ODhmZmFhLCAweDIyYmIzMywgMHgxMTU1MTFdO1xub3V0JC5tYWdlbnRhID0gbWFnZW50YSA9IFsweGZmMzNmZiwgMHhmZmFhZmYsIDB4YmIyMmJiLCAweDU1MTE1NV07XG5vdXQkLmJsdWUgPSBibHVlID0gWzB4NjZiYmZmLCAweGFhZGRmZiwgMHg1NTg4ZWUsIDB4MTExMTU1XTtcbm91dCQuYnJvd24gPSBicm93biA9IFsweGZmYmIzMywgMHhmZmNjODgsIDB4YmI5OTAwLCAweDU1NTUxMV07XG5vdXQkLnllbGxvdyA9IHllbGxvdyA9IFsweGVlZWUxMSwgMHhmZmZmYWEsIDB4Y2NiYjAwLCAweDU1NTUxMV07XG5vdXQkLmN5YW4gPSBjeWFuID0gWzB4NDRkZGZmLCAweGFhZTNmZiwgMHgwMGFhY2MsIDB4MDA2Njk5XTtcbmNvbG9yT3JkZXIgPSBbbmV1dHJhbCwgcmVkLCBvcmFuZ2UsIHllbGxvdywgZ3JlZW4sIGN5YW4sIGJsdWUsIG1hZ2VudGFdO1xub3V0JC50aWxlQ29sb3JzID0gdGlsZUNvbG9ycyA9IG1hcChwbHVjaygyKSwgY29sb3JPcmRlcik7XG5vdXQkLnNwZWNDb2xvcnMgPSBzcGVjQ29sb3JzID0gbWFwKHBsdWNrKDApLCBjb2xvck9yZGVyKTtcbm91dCQuUGFsZXR0ZSA9IFBhbGV0dGUgPSB7XG4gIG5ldXRyYWw6IG5ldXRyYWwsXG4gIHJlZDogcmVkLFxuICBvcmFuZ2U6IG9yYW5nZSxcbiAgeWVsbG93OiB5ZWxsb3csXG4gIGdyZWVuOiBncmVlbixcbiAgY3lhbjogY3lhbixcbiAgYmx1ZTogYmx1ZSxcbiAgbWFnZW50YTogbWFnZW50YSxcbiAgdGlsZUNvbG9yczogdGlsZUNvbG9ycyxcbiAgc3BlY0NvbG9yczogc3BlY0NvbG9yc1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgVEhSRUUsIE1hdGVyaWFscywgU2NlbmVNYW5hZ2VyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdHMnKTtcbm91dCQuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyID0gKGZ1bmN0aW9uKCl7XG4gIFNjZW5lTWFuYWdlci5kaXNwbGF5TmFtZSA9ICdTY2VuZU1hbmFnZXInO1xuICB2YXIgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyT3BhY2l0eSwgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFNjZW5lTWFuYWdlcjtcbiAgaGVscGVyTWFya2VyU2l6ZSA9IDAuMDI7XG4gIGhlbHBlck1hcmtlck9wYWNpdHkgPSAwLjM7XG4gIGhlbHBlck1hcmtlckdlbyA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSk7XG4gIGZ1bmN0aW9uIFNjZW5lTWFuYWdlcihvcHRzKXtcbiAgICB2YXIgYXNwZWN0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5yZXNpemUgPSBiaW5kJCh0aGlzLCAncmVzaXplJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLnplcm9TZW5zb3IgPSBiaW5kJCh0aGlzLCAnemVyb1NlbnNvcicsIHByb3RvdHlwZSk7XG4gICAgdGhpcy5nb0Z1bGxzY3JlZW4gPSBiaW5kJCh0aGlzLCAnZ29GdWxsc2NyZWVuJywgcHJvdG90eXBlKTtcbiAgICBhc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgICAgYW50aWFsaWFzOiB0cnVlXG4gICAgfSk7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCBhc3BlY3QsIDAuMDAxLCAxMDAwKTtcbiAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLlZSQ29udHJvbHModGhpcy5jYW1lcmEpO1xuICAgIHRoaXMudnJFZmZlY3QgPSBuZXcgVEhSRUUuVlJFZmZlY3QodGhpcy5yZW5kZXJlcik7XG4gICAgdGhpcy52ckVmZmVjdC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoIC0gMSwgd2luZG93LmlubmVySGVpZ2h0IC0gMSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnplcm9TZW5zb3IsIHRydWUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCB0aGlzLmdvRnVsbHNjcmVlbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZyTW9kZTogbmF2aWdhdG9yLmdldFZSRGV2aWNlcyAhPSBudWxsXG4gICAgfTtcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5yb290KTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckEpKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dIZWxwZXJzID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZ3JpZCwgYXhpcywgcm9vdEF4aXM7XG4gICAgZ3JpZCA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwLCAwLjEpO1xuICAgIGF4aXMgPSBuZXcgVEhSRUUuQXhpc0hlbHBlcigxKTtcbiAgICByb290QXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDAuNSk7XG4gICAgYXhpcy5wb3NpdGlvbi56ID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uejtcbiAgICByZXR1cm4gcm9vdEF4aXMucG9zaXRpb24ueiA9IHRoaXMucm9vdC5wb3NpdGlvbi56O1xuICB9O1xuICBwcm90b3R5cGUuZW5hYmxlU2hhZG93Q2FzdGluZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBTb2Z0ID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEVuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRmFyID0gMTAwMDtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd0NhbWVyYUZvdiA9IDUwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhTmVhciA9IDM7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBCaWFzID0gMC4wMDM5O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwV2lkdGggPSAxMDI0O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBEYXJrbmVzcyA9IDAuNTtcbiAgfTtcbiAgcHJvdG90eXBlLmdvRnVsbHNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKCdTdGFydGluZyBmdWxsc2NyZWVuLi4uJyk7XG4gICAgcmV0dXJuIHRoaXMudnJFZmZlY3Quc2V0RnVsbFNjcmVlbih0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLnplcm9TZW5zb3IgPSBmdW5jdGlvbihldmVudCl7XG4gICAgdmFyIGtleUNvZGU7XG4gICAga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gODYpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgcmV0dXJuIHRoaXMudnJFZmZlY3Quc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnZyRWZmZWN0LnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdkb21FbGVtZW50Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBvYmosIHRoYXQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBhcmd1bWVudHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIG9iaiA9IGFyZ3VtZW50c1tpJF07XG4gICAgICBsb2coJ1NjZW5lTWFuYWdlcjo6YWRkIC0nLCBvYmopO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJlZ2lzdHJhdGlvbi5hZGQoKHRoYXQgPSBvYmoucm9vdCkgIT0gbnVsbCA/IHRoYXQgOiBvYmopKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gU2NlbmVNYW5hZ2VyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciByZWYkLCBsb2csIHBvdywgdGF1LCBsaW5lYXIsIHF1YWRJbiwgcXVhZE91dCwgY3ViaWNJbiwgY3ViaWNPdXQsIHF1YXJ0SW4sIHF1YXJ0T3V0LCBxdWludEluLCBxdWludE91dCwgZXhwSW4sIGV4cE91dCwgY2lyY0luLCBjaXJjT3V0LCBlbGFzdGljLCBzbGFjaywgZWxhc3RpY0luLCBlbGFzdGljT3V0LCBkcmF3VGVzdEdyYXBocywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIHBvdyA9IHJlZiQucG93LCB0YXUgPSByZWYkLnRhdTtcbm91dCQubGluZWFyID0gbGluZWFyID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiB0ICsgYjtcbn07XG5vdXQkLnF1YWRJbiA9IHF1YWRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogdCAqIHQgKyBiO1xufTtcbm91dCQucXVhZE91dCA9IHF1YWRPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gLWMgKiB0ICogKHQgLSAyKSArIGI7XG59O1xub3V0JC5jdWJpY0luID0gY3ViaWNJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgMykgKyBiO1xufTtcbm91dCQuY3ViaWNPdXQgPSBjdWJpY091dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKE1hdGgucG93KHQgLSAxLCAzKSArIDEpICsgYjtcbn07XG5vdXQkLnF1YXJ0SW4gPSBxdWFydEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBNYXRoLnBvdyh0LCA0KSArIGI7XG59O1xub3V0JC5xdWFydE91dCA9IHF1YXJ0T3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogKE1hdGgucG93KHQgLSAxLCA0KSAtIDEpICsgYjtcbn07XG5vdXQkLnF1aW50SW4gPSBxdWludEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBNYXRoLnBvdyh0LCA1KSArIGI7XG59O1xub3V0JC5xdWludE91dCA9IHF1aW50T3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiAoTWF0aC5wb3codCAtIDEsIDUpICsgMSkgKyBiO1xufTtcbm91dCQuZXhwSW4gPSBleHBJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogcG93KDIsIDEwICogKHQgLSAxKSkgKyBiO1xufTtcbm91dCQuZXhwT3V0ID0gZXhwT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiAoKC1wb3coMiwgLTEwICogdCkpICsgMSkgKyBiO1xufTtcbm91dCQuY2lyY0luID0gY2lyY0luID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSkgKyBiO1xufTtcbm91dCQuY2lyY091dCA9IGNpcmNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGguc3FydCgxIC0gdCAqIHQpICsgYjtcbn07XG5lbGFzdGljID0gZnVuY3Rpb24odCwgYiwgYywgcCwgzrspe1xuICB2YXIgcztcbiAgaWYgKHQgPT09IDApIHtcbiAgICByZXR1cm4gYjtcbiAgfVxuICBpZiAodCA9PT0gMSkge1xuICAgIHJldHVybiBiICsgYztcbiAgfVxuICBzID0gYyA8IE1hdGguYWJzKGMpXG4gICAgPyBwIC8gNFxuICAgIDogcCAvIHRhdSAqIE1hdGguYXNpbigxKTtcbiAgcmV0dXJuIM67KHMsIHApO1xufTtcbnNsYWNrID0gMC42O1xub3V0JC5lbGFzdGljSW4gPSBlbGFzdGljSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gZWxhc3RpYyh0LCBiLCBlLCBzbGFjaywgZnVuY3Rpb24ocywgcCl7XG4gICAgcmV0dXJuIC0oYyAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgLSBzKSAqIHRhdSAvIHApKSArIGI7XG4gIH0pO1xufTtcbm91dCQuZWxhc3RpY091dCA9IGVsYXN0aWNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gZWxhc3RpYyh0LCBiLCBlLCBzbGFjaywgZnVuY3Rpb24ocywgcCl7XG4gICAgcmV0dXJuIGMgKiBNYXRoLnBvdygyLCAtMTAgKiB0KSAqIE1hdGguc2luKCh0IC0gcykgKiB0YXUgLyBwKSArIGMgKyBiO1xuICB9KTtcbn07XG4vKlxuZWFzZUluQmFjazogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQsIHMpIHtcbiAgaWYgKHMgPT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcbiAgcmV0dXJuIGMqKHQvPWQpKnQqKChzKzEpKnQgLSBzKSArIGI7XG59LFxuZWFzZU91dEJhY2s6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkLCBzKSB7XG4gIGlmIChzID09IHVuZGVmaW5lZCkgcyA9IDEuNzAxNTg7XG4gIHJldHVybiBjKigodD10L2QtMSkqdCooKHMrMSkqdCArIHMpICsgMSkgKyBiO1xufSxcbmVhc2VJbkJvdW5jZTogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgcmV0dXJuIGMgLSBqUXVlcnkuZWFzaW5nLmVhc2VPdXRCb3VuY2UgKHgsIGQtdCwgMCwgYywgZCkgKyBiO1xufSxcbmVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gIGlmICgodC89ZCkgPCAoMS8yLjc1KSkge1xuICAgIHJldHVybiBjKig3LjU2MjUqdCp0KSArIGI7XG4gIH0gZWxzZSBpZiAodCA8ICgyLzIuNzUpKSB7XG4gICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDEuNS8yLjc1KSkqdCArIC43NSkgKyBiO1xuICB9IGVsc2UgaWYgKHQgPCAoMi41LzIuNzUpKSB7XG4gICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDIuMjUvMi43NSkpKnQgKyAuOTM3NSkgKyBiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjKig3LjU2MjUqKHQtPSgyLjYyNS8yLjc1KSkqdCArIC45ODQzNzUpICsgYjtcbiAgfVxufSxcbiovXG5kcmF3VGVzdEdyYXBocyA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0b3AsIGJ0bSwgcmFuZ2UsIGkkLCByZWYkLCBsZW4kLCBlbCwgZWFzZU5hbWUsIGVhc2UsIGxyZXN1bHQkLCBjbnYsIGN0eCwgaSwgcCwgcmVzdWx0cyQgPSBbXTtcbiAgdG9wID0gMTcwO1xuICBidG0gPSAzMDtcbiAgcmFuZ2UgPSB0b3AgLSBidG07XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjYW52YXMnKSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBlbCA9IHJlZiRbaSRdO1xuICAgIGVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH1cbiAgZm9yIChlYXNlTmFtZSBpbiByZWYkID0gbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBlYXNlID0gcmVmJFtlYXNlTmFtZV07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBjbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjbnYud2lkdGggPSAyMDA7XG4gICAgY252LmhlaWdodCA9IDIwMDtcbiAgICBjbnYuc3R5bGUuYmFja2dyb3VuZCA9ICdsaWdodGJsdWUnO1xuICAgIGNudi5zdHlsZS5ib3JkZXJMZWZ0ID0gXCIzcHggc29saWQgYmxhY2tcIjtcbiAgICBjdHggPSBjbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNudik7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHgubW92ZVRvKDAsIHRvcCArIDAuNSk7XG4gICAgY3R4LmxpbmVUbygyMDAsIHRvcCArIDAuNSk7XG4gICAgY3R4Lm1vdmVUbygwLCBidG0gKyAwLjUpO1xuICAgIGN0eC5saW5lVG8oMjAwLCBidG0gKyAwLjUpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZm9udCA9IFwiMTRweCBtb25vc3BhY2VcIjtcbiAgICBjdHguZmlsbFRleHQoZWFzZU5hbWUsIDIsIDE2LCAyMDApO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDEwMDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgcCA9IGkgLyAxMDA7XG4gICAgICBscmVzdWx0JC5wdXNoKGN0eC5maWxsUmVjdCgyICogaSwgdG9wIC0gZWFzZShwLCAwLCByYW5nZSksIDIsIDIpKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTsiLCJ2YXIgaWQsIGxvZywgZmxpcCwgZGVsYXksIGZsb29yLCByYW5kb20sIHJhbmQsIHJhbmRJbnQsIHJhbmRvbUZyb20sIGFkZFYyLCBmaWx0ZXIsIHBsdWNrLCBwaSwgdGF1LCBwb3csIHNpbiwgY29zLCBtaW4sIG1heCwgbGVycCwgbWFwLCBzcGxpdCwgam9pbiwgdW5saW5lcywgZGl2LCB3cmFwLCBsaW1pdCwgcmFmLCB0aGF0LCBFYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5pZCA9IGlkID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQ7XG59O1xub3V0JC5sb2cgPSBsb2cgPSBmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICByZXR1cm4gYXJndW1lbnRzWzBdO1xufTtcbm91dCQuZmxpcCA9IGZsaXAgPSBmdW5jdGlvbijOuyl7XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICByZXR1cm4gzrsoYiwgYSk7XG4gIH07XG59O1xub3V0JC5kZWxheSA9IGRlbGF5ID0gZmxpcChzZXRUaW1lb3V0KTtcbm91dCQuZmxvb3IgPSBmbG9vciA9IE1hdGguZmxvb3I7XG5vdXQkLnJhbmRvbSA9IHJhbmRvbSA9IE1hdGgucmFuZG9tO1xub3V0JC5yYW5kID0gcmFuZCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcbiAgcmV0dXJuIG1pbiArIHJhbmRvbSgpICogKG1heCAtIG1pbik7XG59O1xub3V0JC5yYW5kSW50ID0gcmFuZEludCA9IGZ1bmN0aW9uKG1pbiwgbWF4KXtcbiAgcmV0dXJuIG1pbiArIGZsb29yKHJhbmRvbSgpICogKG1heCAtIG1pbikpO1xufTtcbm91dCQucmFuZG9tRnJvbSA9IHJhbmRvbUZyb20gPSBmdW5jdGlvbihsaXN0KXtcbiAgcmV0dXJuIGxpc3RbcmFuZCgwLCBsaXN0Lmxlbmd0aCAtIDEpXTtcbn07XG5vdXQkLmFkZFYyID0gYWRkVjIgPSBmdW5jdGlvbihhLCBiKXtcbiAgcmV0dXJuIFthWzBdICsgYlswXSwgYVsxXSArIGJbMV1dO1xufTtcbm91dCQuZmlsdGVyID0gZmlsdGVyID0gY3VycnkkKGZ1bmN0aW9uKM67LCBsaXN0KXtcbiAgdmFyIGkkLCBsZW4kLCB4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGxpc3QubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB4ID0gbGlzdFtpJF07XG4gICAgaWYgKM67KHgpKSB7XG4gICAgICByZXN1bHRzJC5wdXNoKHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KTtcbm91dCQucGx1Y2sgPSBwbHVjayA9IGN1cnJ5JChmdW5jdGlvbihwLCBvKXtcbiAgcmV0dXJuIG9bcF07XG59KTtcbm91dCQucGkgPSBwaSA9IE1hdGguUEk7XG5vdXQkLnRhdSA9IHRhdSA9IHBpICogMjtcbm91dCQucG93ID0gcG93ID0gTWF0aC5wb3c7XG5vdXQkLnNpbiA9IHNpbiA9IE1hdGguc2luO1xub3V0JC5jb3MgPSBjb3MgPSBNYXRoLmNvcztcbm91dCQubWluID0gbWluID0gTWF0aC5taW47XG5vdXQkLm1heCA9IG1heCA9IE1hdGgubWF4O1xub3V0JC5sZXJwID0gbGVycCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgcCl7XG4gIHJldHVybiBtaW4gKyBwICogKG1heCAtIG1pbik7XG59KTtcbm91dCQubWFwID0gbWFwID0gY3VycnkkKGZ1bmN0aW9uKM67LCBsKXtcbiAgdmFyIGkkLCBsZW4kLCB4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IGwubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICB4ID0gbFtpJF07XG4gICAgcmVzdWx0cyQucHVzaCjOuyh4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLnNwbGl0ID0gc3BsaXQgPSBjdXJyeSQoZnVuY3Rpb24oY2hhciwgc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdChjaGFyKTtcbn0pO1xub3V0JC5qb2luID0gam9pbiA9IGN1cnJ5JChmdW5jdGlvbihjaGFyLCBzdHIpe1xuICByZXR1cm4gc3RyLmpvaW4oY2hhcik7XG59KTtcbm91dCQudW5saW5lcyA9IHVubGluZXMgPSBqb2luKFwiXFxuXCIpO1xub3V0JC5kaXYgPSBkaXYgPSBjdXJyeSQoZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBmbG9vcihhIC8gYik7XG59KTtcbm91dCQud3JhcCA9IHdyYXAgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIG4pe1xuICBpZiAobiA+IG1heCkge1xuICAgIHJldHVybiBtaW47XG4gIH0gZWxzZSBpZiAobiA8IG1pbikge1xuICAgIHJldHVybiBtYXg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cbn0pO1xub3V0JC5saW1pdCA9IGxpbWl0ID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQucmFmID0gcmFmID0gKHRoYXQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gID8gdGhhdFxuICA6ICh0aGF0ID0gd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgID8gdGhhdFxuICAgIDogKHRoYXQgPSB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogZnVuY3Rpb24ozrspe1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dCjOuywgMTAwMCAvIDYwKTtcbiAgICAgIH07XG5vdXQkLkVhc2UgPSBFYXNlID0gcmVxdWlyZSgnLi9lYXNpbmcnKTtcbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCB1bmxpbmVzLCBUaW1lciwgdHlwZURldGVjdCwgdGVtcGxhdGUsIERlYnVnT3V0cHV0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB1bmxpbmVzID0gcmVmJC51bmxpbmVzO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xudHlwZURldGVjdCA9IGZ1bmN0aW9uKHRoaW5nKXtcbiAgaWYgKHR5cGVvZiB0aGluZyAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nO1xuICB9IGVsc2UgaWYgKHRoaW5nLmNlbGxzICE9IG51bGwpIHtcbiAgICByZXR1cm4gJ2FyZW5hJztcbiAgfSBlbHNlIGlmICh0aGluZy5wb3MgIT0gbnVsbCkge1xuICAgIHJldHVybiAnYnJpY2snO1xuICB9IGVsc2UgaWYgKHRoaW5nLnByb2dyZXNzICE9IG51bGwpIHtcbiAgICByZXR1cm4gJ3RpbWVyJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ29iamVjdCc7XG4gIH1cbn07XG50ZW1wbGF0ZSA9IHtcbiAgY2VsbDogZnVuY3Rpb24oaXQpe1xuICAgIGlmIChpdCkge1xuICAgICAgcmV0dXJuIFwi4paS4paSXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIiAgXCI7XG4gICAgfVxuICB9LFxuICBzY29yZTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcywgbnVsbCwgMik7XG4gIH0sXG4gIGJyaWNrOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnNoYXBlLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQubWFwKHRlbXBsYXRlLmNlbGwpLmpvaW4oJyAnKTtcbiAgICB9KS5qb2luKFwiXFxuICAgICAgICBcIik7XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBrZXlTdW1tYXJ5LCByZXN1bHRzJCA9IFtdO1xuICAgIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0aGlzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGtleVN1bW1hcnkgPSB0aGlzW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChrZXlTdW1tYXJ5LmtleSArICctJyArIGtleVN1bW1hcnkuYWN0aW9uICsgXCJ8XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIobm8gY2hhbmdlKVwiO1xuICAgIH1cbiAgfSxcbiAgZnBzOiBmdW5jdGlvbigpe1xuICAgIHZhciBmcHNDb2xvcjtcbiAgICBmcHNDb2xvciA9IHRoaXMuZnBzID49IDU1XG4gICAgICA/ICcjMGYwJ1xuICAgICAgOiB0aGlzLmZwcyA+PSAzMCA/ICcjZmYwJyA6ICcjZjAwJztcbiAgICByZXR1cm4gXCI8c3BhbiBzdHlsZT1cXFwiY29sb3I6XCIgKyBmcHNDb2xvciArIFwiXFxcIj5cIiArIHRoaXMuZnBzICsgXCI8L3NwYW4+XCI7XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgbWV0YSAtIFwiICsgdGhpcy5tZXRhZ2FtZVN0YXRlICsgXCJcXG4gdGltZSAtIFwiICsgdGhpcy5lbGFwc2VkVGltZSArIFwiXFxuZnJhbWUgLSBcIiArIHRoaXMuZWxhcHNlZEZyYW1lcyArIFwiXFxuICBmcHMgLSBcIiArIHRlbXBsYXRlLmZwcy5hcHBseSh0aGlzKSArIFwiXFxuIGtleXMgLSBcIiArIHRlbXBsYXRlLmtleXMuYXBwbHkodGhpcy5pbnB1dFN0YXRlKSArIFwiXFxuXFxuICBcIiArIHRlbXBsYXRlLmR1bXAodGhpcywgMik7XG4gIH0sXG4gIHRpbWVyOiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIFRpbWVyLnRvU3RyaW5nKGl0KTtcbiAgfSxcbiAgZHVtcDogZnVuY3Rpb24ob2JqLCBkZXB0aCl7XG4gICAgdmFyIHNwYWNlLCBrLCB2O1xuICAgIGRlcHRoID09IG51bGwgJiYgKGRlcHRoID0gMCk7XG4gICAgc3BhY2UgPSAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIHJlcGVhdFN0cmluZyQoXCIgXCIsIGRlcHRoKSArIGl0O1xuICAgIH0pO1xuICAgIHN3aXRjaCAodHlwZURldGVjdChvYmopKSB7XG4gICAgY2FzZSAndGltZXInOlxuICAgICAgcmV0dXJuIHNwYWNlKHRlbXBsYXRlLnRpbWVyKG9iaikpO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gc3BhY2Uob2JqKTtcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIHNwYWNlKG9iaik7XG4gICAgY2FzZSAnYXJlbmEnOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYnJpY2snOlxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmxpbmVzKChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcmVmJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgICAgZm9yIChrIGluIHJlZiQgPSBvYmopIHtcbiAgICAgICAgICB2ID0gcmVmJFtrXTtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGsgKyBcIjpcIiArIHRlbXBsYXRlLmR1bXAodiwgZGVwdGggKyAyKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgICAgfSgpKSk7XG4gICAgfVxuICB9LFxuICBtZW51SXRlbXM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGl4LCBpdGVtO1xuICAgIHJldHVybiBcIlwiICsgdW5saW5lcygoZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLm1lbnVEYXRhKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBpeCA9IGkkO1xuICAgICAgICBpdGVtID0gcmVmJFtpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2godGVtcGxhdGUubWVudUl0ZW0uY2FsbChpdGVtLCBpeCwgdGhpcy5jdXJyZW50SW5kZXgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9LmNhbGwodGhpcykpKTtcbiAgfSxcbiAgc3RhcnRNZW51OiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIlNUQVJUIE1FTlVcXG5cIiArIHRlbXBsYXRlLm1lbnVJdGVtcy5hcHBseSh0aGlzKSArIFwiXFxuXFxuXCIgKyB0ZW1wbGF0ZS5kdW1wKHRoaXMsIDIpO1xuICB9LFxuICBtZW51SXRlbTogZnVuY3Rpb24oaW5kZXgsIGN1cnJlbnRJbmRleCl7XG4gICAgcmV0dXJuIFwiXCIgKyAoaW5kZXggPT09IGN1cnJlbnRJbmRleCA/IFwiPlwiIDogXCIgXCIpICsgXCIgXCIgKyB0aGlzLnRleHQ7XG4gIH0sXG4gIGZhaWx1cmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiICAgR0FNRSBPVkVSXFxuXFxuICAgICBTY29yZVxcblxcbiAgU2luZ2xlIC0gXCIgKyB0aGlzLnNjb3JlLnNpbmdsZXMgKyBcIlxcbiAgRG91YmxlIC0gXCIgKyB0aGlzLnNjb3JlLmRvdWJsZXMgKyBcIlxcbiAgVHJpcGxlIC0gXCIgKyB0aGlzLnNjb3JlLnRyaXBsZXMgKyBcIlxcbiAgVGV0cmlzIC0gXCIgKyB0aGlzLnNjb3JlLnRldHJpcyArIFwiXFxuXFxuVG90YWwgTGluZXM6IFwiICsgdGhpcy5zY29yZS5saW5lcyArIFwiXFxuXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcy5nYW1lT3Zlcik7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe1xuICAgIHZhciByZWYkO1xuICAgIHRoaXMuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRibyk7XG4gICAgcmVmJCA9IHRoaXMuZGJvLnN0eWxlO1xuICAgIHJlZiQucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHJlZiQudG9wID0gMDtcbiAgICByZWYkLmxlZnQgPSAwO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgc3dpdGNoIChzdGF0ZS5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5mYWlsdXJlLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5zdGFydE1lbnUuYXBwbHkoc3RhdGUuc3RhcnRNZW51KTtcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSBcIlVua25vd24gbWV0YWdhbWUgc3RhdGU6IFwiICsgc3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYWYsIGZsb29yLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWYsIGZsb29yID0gcmVmJC5mbG9vcjtcbm91dCQuRnJhbWVEcml2ZXIgPSBGcmFtZURyaXZlciA9IChmdW5jdGlvbigpe1xuICBGcmFtZURyaXZlci5kaXNwbGF5TmFtZSA9ICdGcmFtZURyaXZlcic7XG4gIHZhciBmcHNIaXN0b3J5V2luZG93LCBwcm90b3R5cGUgPSBGcmFtZURyaXZlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWVEcml2ZXI7XG4gIGZwc0hpc3RvcnlXaW5kb3cgPSAyMDtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuZnBzID0gMDtcbiAgICB0aGlzLmZwc0hpc3RvcnkgPSByZXBlYXRBcnJheSQoWzBdLCBmcHNIaXN0b3J5V2luZG93KTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMucHVzaEhpc3RvcnkozpR0KTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMuc3RhdGUuzpR0ID0gzpR0O1xuICAgIHJldHVybiB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUsIHRoaXMuZnBzKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5ydW5uaW5nID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS5wdXNoSGlzdG9yeSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgdGhpcy5mcHNIaXN0b3J5LnB1c2gozpR0KTtcbiAgICB0aGlzLmZwc0hpc3Rvcnkuc2hpZnQoKTtcbiAgICByZXR1cm4gdGhpcy5mcHMgPSBmbG9vcigxMDAwICogZnBzSGlzdG9yeVdpbmRvdyAvIHRoaXMuZnBzSGlzdG9yeS5yZWR1Y2UoY3VycnkkKGZ1bmN0aW9uKHgkLCB5JCl7XG4gICAgICByZXR1cm4geCQgKyB5JDtcbiAgICB9KSwgMCkpO1xuICB9O1xuICByZXR1cm4gRnJhbWVEcml2ZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZpbHRlciwgVGltZXIsIGtleVJlcGVhdFRpbWUsIEtFWSwgQUNUSU9OX05BTUUsIGV2ZW50U3VtbWFyeSwgbmV3QmxhbmtLZXlzdGF0ZSwgSW5wdXRIYW5kbGVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmaWx0ZXIgPSByZWYkLmZpbHRlcjtcblRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpLlRpbWVyO1xua2V5UmVwZWF0VGltZSA9IDE1MDtcbktFWSA9IHtcbiAgUkVUVVJOOiAxMyxcbiAgRVNDQVBFOiAyNyxcbiAgU1BBQ0U6IDMyLFxuICBMRUZUOiAzNyxcbiAgVVA6IDM4LFxuICBSSUdIVDogMzksXG4gIERPV046IDQwLFxuICBaOiA5MCxcbiAgWDogODgsXG4gIE9ORTogNDksXG4gIFRXTzogNTAsXG4gIFRIUkVFOiA1MSxcbiAgRk9VUjogNTIsXG4gIEZJVkU6IDUzLFxuICBTSVg6IDU0LFxuICBTRVZFTjogNTUsXG4gIEVJR0hUOiA1NixcbiAgTklORTogNTcsXG4gIFpFUk86IDQ4XG59O1xuQUNUSU9OX05BTUUgPSAocmVmJCA9IHt9LCByZWYkW0tFWS5SRVRVUk4gKyBcIlwiXSA9ICdjb25maXJtJywgcmVmJFtLRVkuRVNDQVBFICsgXCJcIl0gPSAnY2FuY2VsJywgcmVmJFtLRVkuU1BBQ0UgKyBcIlwiXSA9ICdoYXJkLWRyb3AnLCByZWYkW0tFWS5YICsgXCJcIl0gPSAnY3cnLCByZWYkW0tFWS5aICsgXCJcIl0gPSAnY2N3JywgcmVmJFtLRVkuVVAgKyBcIlwiXSA9ICd1cCcsIHJlZiRbS0VZLkxFRlQgKyBcIlwiXSA9ICdsZWZ0JywgcmVmJFtLRVkuUklHSFQgKyBcIlwiXSA9ICdyaWdodCcsIHJlZiRbS0VZLkRPV04gKyBcIlwiXSA9ICdkb3duJywgcmVmJFtLRVkuT05FICsgXCJcIl0gPSAnZGVidWctMScsIHJlZiRbS0VZLlRXTyArIFwiXCJdID0gJ2RlYnVnLTInLCByZWYkW0tFWS5USFJFRSArIFwiXCJdID0gJ2RlYnVnLTMnLCByZWYkW0tFWS5GT1VSICsgXCJcIl0gPSAnZGVidWctNCcsIHJlZiRbS0VZLkZJVkUgKyBcIlwiXSA9ICdkZWJ1Zy01JywgcmVmJFtLRVkuU0lYICsgXCJcIl0gPSAnZGVidWctNicsIHJlZiRbS0VZLlNFVkVOICsgXCJcIl0gPSAnZGVidWctNycsIHJlZiRbS0VZLkVJR0hUICsgXCJcIl0gPSAnZGVidWctOCcsIHJlZiRbS0VZLk5JTkUgKyBcIlwiXSA9ICdkZWJ1Zy05JywgcmVmJFtLRVkuWkVSTyArIFwiXCJdID0gJ2RlYnVnLTAnLCByZWYkKTtcbmV2ZW50U3VtbWFyeSA9IGZ1bmN0aW9uKGtleSwgc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIGFjdGlvbjogc3RhdGUgPyAnZG93bicgOiAndXAnXG4gIH07XG59O1xubmV3QmxhbmtLZXlzdGF0ZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgdXA6IGZhbHNlLFxuICAgIGRvd246IGZhbHNlLFxuICAgIGxlZnQ6IGZhbHNlLFxuICAgIHJpZ2h0OiBmYWxzZSxcbiAgICBhY3Rpb25BOiBmYWxzZSxcbiAgICBhY3Rpb25COiBmYWxzZSxcbiAgICBjb25maXJtOiBmYWxzZSxcbiAgICBjYW5jZWw6IGZhbHNlXG4gIH07XG59O1xub3V0JC5JbnB1dEhhbmRsZXIgPSBJbnB1dEhhbmRsZXIgPSAoZnVuY3Rpb24oKXtcbiAgSW5wdXRIYW5kbGVyLmRpc3BsYXlOYW1lID0gJ0lucHV0SGFuZGxlcic7XG4gIHZhciBwcm90b3R5cGUgPSBJbnB1dEhhbmRsZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IElucHV0SGFuZGxlcjtcbiAgZnVuY3Rpb24gSW5wdXRIYW5kbGVyKCl7XG4gICAgdGhpcy5zdGF0ZVNldHRlciA9IGJpbmQkKHRoaXMsICdzdGF0ZVNldHRlcicsIHByb3RvdHlwZSk7XG4gICAgbG9nKFwiSW5wdXRIYW5kbGVyOjpuZXdcIik7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuc3RhdGVTZXR0ZXIodHJ1ZSkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5zdGF0ZVNldHRlcihmYWxzZSkpO1xuICAgIHRoaXMuY3VycktleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICAgIHRoaXMubGFzdEtleXN0YXRlID0gbmV3QmxhbmtLZXlzdGF0ZSgpO1xuICB9XG4gIHByb3RvdHlwZS5zdGF0ZVNldHRlciA9IGN1cnJ5JCgoZnVuY3Rpb24oc3RhdGUsIGFyZyQpe1xuICAgIHZhciB3aGljaCwga2V5O1xuICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICBpZiAoa2V5ID0gQUNUSU9OX05BTUVbd2hpY2hdKSB7XG4gICAgICB0aGlzLmN1cnJLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICBpZiAoc3RhdGUgPT09IHRydWUgJiYgdGhpcy5sYXN0SGVsZEtleSAhPT0ga2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RIZWxkS2V5ID0ga2V5O1xuICAgICAgfVxuICAgIH1cbiAgfSksIHRydWUpO1xuICBwcm90b3R5cGUuY2hhbmdlc1NpbmNlTGFzdEZyYW1lID0gZnVuY3Rpb24oKXtcbiAgICB2YXIga2V5LCBzdGF0ZSwgd2FzRGlmZmVyZW50O1xuICAgIHJldHVybiBmaWx0ZXIoaWQsIChmdW5jdGlvbigpe1xuICAgICAgdmFyIHJlZiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGtleSBpbiByZWYkID0gdGhpcy5jdXJyS2V5c3RhdGUpIHtcbiAgICAgICAgc3RhdGUgPSByZWYkW2tleV07XG4gICAgICAgIHdhc0RpZmZlcmVudCA9IHN0YXRlICE9PSB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldO1xuICAgICAgICB0aGlzLmxhc3RLZXlzdGF0ZVtrZXldID0gc3RhdGU7XG4gICAgICAgIGlmICh3YXNEaWZmZXJlbnQpIHtcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKGV2ZW50U3VtbWFyeShrZXksIHN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9LmNhbGwodGhpcykpKTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLmRlYnVnTW9kZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIHJldHVybiBsb2coXCJJbnB1dEhhbmRsZXI6OmRlYnVnTW9kZSAtXCIsIHdoaWNoLCBBQ1RJT05fTkFNRVt3aGljaF0gfHwgJ1t1bmJvdW5kXScpO1xuICAgIH0pO1xuICB9O1xuICBJbnB1dEhhbmRsZXIub24gPSBmdW5jdGlvbihjb2RlLCDOuyl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihhcmckKXtcbiAgICAgIHZhciB3aGljaDtcbiAgICAgIHdoaWNoID0gYXJnJC53aGljaDtcbiAgICAgIGlmICh3aGljaCA9PT0gY29kZSkge1xuICAgICAgICByZXR1cm4gzrsoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgcmV0dXJuIElucHV0SGFuZGxlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmbG9vciwgYXNjaWlQcm9ncmVzc0JhciwgVElNRVJfQUNUSVZFLCBUSU1FUl9FWFBJUkVELCBjcmVhdGUsIHVwZGF0ZSwgcmVzZXQsIHN0b3AsIHJ1bkZvciwgcHJvZ3Jlc3NPZiwgdGltZVRvRXhwaXJ5LCBzZXRUaW1lVG9FeHBpcnksIHJlc2V0V2l0aFJlbWFpbmRlciwgdG9TdHJpbmcsIHVwZGF0ZUFsbEluLCBzZXRTdGF0ZSwgc2V0VGltZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yO1xuYXNjaWlQcm9ncmVzc0JhciA9IGN1cnJ5JChmdW5jdGlvbihsZW4sIHZhbCwgbWF4KXtcbiAgdmFyIHZhbHVlQ2hhcnMsIGVtcHR5Q2hhcnM7XG4gIHZhbCA9IHZhbCA+IG1heCA/IG1heCA6IHZhbDtcbiAgdmFsdWVDaGFycyA9IGZsb29yKGxlbiAqIHZhbCAvIG1heCk7XG4gIGVtcHR5Q2hhcnMgPSBsZW4gLSB2YWx1ZUNoYXJzO1xuICByZXR1cm4gcmVwZWF0U3RyaW5nJChcIitcIiwgdmFsdWVDaGFycykgKyByZXBlYXRTdHJpbmckKFwiLVwiLCBlbXB0eUNoYXJzKTtcbn0pO1xucmVmJCA9IFswLCAxXSwgVElNRVJfQUNUSVZFID0gcmVmJFswXSwgVElNRVJfRVhQSVJFRCA9IHJlZiRbMV07XG5vdXQkLmNyZWF0ZSA9IGNyZWF0ZSA9IGZ1bmN0aW9uKG5hbWUsIHRhcmdldFRpbWUsIGJlZ2luKXtcbiAgbmFtZSA9PSBudWxsICYmIChuYW1lID0gXCJVbm5hbWVkIFRpbWVyXCIpO1xuICB0YXJnZXRUaW1lID09IG51bGwgJiYgKHRhcmdldFRpbWUgPSAxMDAwKTtcbiAgYmVnaW4gPT0gbnVsbCAmJiAoYmVnaW4gPSBmYWxzZSk7XG4gIGxvZyhcIk5ldyBUaW1lcjpcIiwgbmFtZSwgdGFyZ2V0VGltZSk7XG4gIHJldHVybiB7XG4gICAgY3VycmVudFRpbWU6IDAsXG4gICAgdGFyZ2V0VGltZTogdGFyZ2V0VGltZSxcbiAgICBwcm9ncmVzczogMCxcbiAgICBzdGF0ZTogYmVnaW4gPyBUSU1FUl9BQ1RJVkUgOiBUSU1FUl9FWFBJUkVELFxuICAgIGFjdGl2ZTogYmVnaW4sXG4gICAgZXhwaXJlZDogIWJlZ2luLFxuICAgIHRpbWVUb0V4cGlyeTogdGFyZ2V0VGltZSxcbiAgICBuYW1lOiBuYW1lXG4gIH07XG59O1xub3V0JC51cGRhdGUgPSB1cGRhdGUgPSBmdW5jdGlvbih0aW1lciwgzpR0KXtcbiAgaWYgKHRpbWVyLmFjdGl2ZSkge1xuICAgIHJldHVybiBzZXRUaW1lKHRpbWVyLCB0aW1lci5jdXJyZW50VGltZSArIM6UdCk7XG4gIH1cbn07XG5vdXQkLnJlc2V0ID0gcmVzZXQgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRpbWVyLnRhcmdldFRpbWUpO1xuICBsb2coXCJUaW1lcjo6cmVzZXQgLVwiLCB0aW1lci5uYW1lLCB0aW1lKTtcbiAgdGltZXIudGFyZ2V0VGltZSA9IHRpbWU7XG4gIHNldFRpbWUodGltZXIsIDApO1xuICByZXR1cm4gc2V0U3RhdGUodGltZXIsIFRJTUVSX0FDVElWRSk7XG59O1xub3V0JC5zdG9wID0gc3RvcCA9IGZ1bmN0aW9uKHRpbWVyKXtcbiAgc2V0VGltZSh0aW1lciwgMCk7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfRVhQSVJFRCk7XG59O1xub3V0JC5ydW5Gb3IgPSBydW5Gb3IgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWVyLnRpbWVUb0V4cGlyeSA9IHRpbWU7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfQUNUSVZFKTtcbn07XG5vdXQkLnByb2dyZXNzT2YgPSBwcm9ncmVzc09mID0gZnVuY3Rpb24odGltZXIpe1xuICByZXR1cm4gdGltZXIuY3VycmVudFRpbWUgLyB0aW1lci50YXJnZXRUaW1lO1xufTtcbm91dCQudGltZVRvRXhwaXJ5ID0gdGltZVRvRXhwaXJ5ID0gZnVuY3Rpb24odGltZXIpe1xuICByZXR1cm4gdGltZXIudGFyZ2V0VGltZSAtIHRpbWVyLmN1cnJlbnRUaW1lO1xufTtcbm91dCQuc2V0VGltZVRvRXhwaXJ5ID0gc2V0VGltZVRvRXhwaXJ5ID0gZnVuY3Rpb24odGltZXIsIGV4cGlyeVRpbWUpe1xuICByZXR1cm4gc2V0VGltZSh0aW1lciwgdGltZXIudGFyZ2V0VGltZSAtIGV4cGlyeVRpbWUpO1xufTtcbm91dCQucmVzZXRXaXRoUmVtYWluZGVyID0gcmVzZXRXaXRoUmVtYWluZGVyID0gZnVuY3Rpb24odGltZXIsIHJlbWFpbmRlcil7XG4gIHJlbWFpbmRlciA9PSBudWxsICYmIChyZW1haW5kZXIgPSB0aW1lci5jdXJyZW50VGltZSAtIHRpbWVyLnRhcmdldFRpbWUpO1xuICBzZXRUaW1lKHRpbWVyLCByZW1haW5kZXIpO1xuICByZXR1cm4gc2V0U3RhdGUodGltZXIsIFRJTUVSX0FDVElWRSk7XG59O1xub3V0JC50b1N0cmluZyA9IHRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgdmFyIHByb2diYXI7XG4gIHByb2diYXIgPSBhc2NpaVByb2dyZXNzQmFyKDYpO1xuICByZXR1cm4gZnVuY3Rpb24odGltZXIpe1xuICAgIHJldHVybiBcIlwiICsgcHJvZ2Jhcih0aW1lci5jdXJyZW50VGltZSwgdGltZXIudGFyZ2V0VGltZSkgKyBcIiBcIiArICh0aW1lci5uYW1lICsgXCIgXCIgKyB0aW1lci50YXJnZXRUaW1lKSArIFwiIChcIiArIHRpbWVyLmFjdGl2ZSArIFwifFwiICsgdGltZXIuZXhwaXJlZCArIFwiKVwiO1xuICB9O1xufSgpO1xub3V0JC51cGRhdGVBbGxJbiA9IHVwZGF0ZUFsbEluID0gZnVuY3Rpb24odGhpbmcsIM6UdCl7XG4gIHZhciBrLCB2LCByZXN1bHRzJCA9IFtdO1xuICBpZiAodGhpbmcudGFyZ2V0VGltZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHVwZGF0ZSh0aGluZywgzpR0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdGhpbmcgPT09ICdvYmplY3QnKSB7XG4gICAgZm9yIChrIGluIHRoaW5nKSB7XG4gICAgICB2ID0gdGhpbmdba107XG4gICAgICBpZiAodikge1xuICAgICAgICByZXN1bHRzJC5wdXNoKHVwZGF0ZUFsbEluKHYsIM6UdCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5zZXRTdGF0ZSA9IGZ1bmN0aW9uKHRpbWVyLCBzdGF0ZSl7XG4gIHRpbWVyLnN0YXRlID0gc3RhdGU7XG4gIHRpbWVyLmV4cGlyZWQgPSBzdGF0ZSA9PT0gVElNRVJfRVhQSVJFRDtcbiAgcmV0dXJuIHRpbWVyLmFjdGl2ZSA9IHN0YXRlICE9PSBUSU1FUl9FWFBJUkVEO1xufTtcbnNldFRpbWUgPSBmdW5jdGlvbih0aW1lciwgdGltZSl7XG4gIHRpbWVyLmN1cnJlbnRUaW1lID0gdGltZTtcbiAgdGltZXIucHJvZ3Jlc3MgPSB0aW1lci5jdXJyZW50VGltZSAvIHRpbWVyLnRhcmdldFRpbWU7XG4gIGlmICh0aW1lci5jdXJyZW50VGltZSA+PSB0aW1lci50YXJnZXRUaW1lKSB7XG4gICAgdGltZXIucHJvZ3Jlc3MgPSAxO1xuICAgIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfRVhQSVJFRCk7XG4gIH1cbn07XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59Il19
