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
  timeFactor = 10;
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
out$.updateScore = updateScore = function(arg$, rows, lvl){
  var score, points, lines;
  score = arg$.score;
  lvl == null && (lvl = 0);
  points = computeScore(rows, lvl);
  score.points += points;
  score.lines += lines = rows.length;
  switch (lines) {
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
      this.flare.position.y = this.height - g * beamShape.height - g * dropped;
      this.impactLight.hex = beamShape.color;
      this.impactLight.position.x = x;
      this.impactLight.position.y = this.height - g * beamShape.height;
    }
    return this.flare.material.materials.map(function(it){
      return it.opacity = 1 - p;
    });
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
var ref$, id, log, unlines, Timer, typeDetect, template, DebugOutput, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log, unlines = ref$.unlines;
Timer = require('../utils/timer');
typeDetect = function(thing){
  if (typeof thing !== 'object') {
    return typeof thing;
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
    return " meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n  fps - " + template.fps.apply(this) + "\n keys - " + template.keys.apply(this.inputState) + "\n\n  " + template.dump(this.core, 2);
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
    default:
      return "\n" + unlines((function(){
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
function repeatString$(str, n){
  for (var r = ''; n > 0; (n >>= 1) && (str += str)) if (n & 1) r += str;
  return r;
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL1ZSQ29udHJvbHMuanMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi9tb3p2ci9WUkVmZmVjdC5qcyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvdHJhY2tiYWxsLWNvbnRyb2xzLmpzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvY29uZmlnL2dhbWUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9jb25maWcvc2NlbmUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2FyZW5hLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9icmljay5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZ2FtZS1vdmVyLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvc2NvcmUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL3N0YXJ0LW1lbnUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hcmVuYS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYmFzZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2subHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2ZhaWwtc2NyZWVuLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWxsaW5nLWJyaWNrLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mcmFtZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZ3VpZGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2luZGV4LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9sZWQubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2xpZ2h0aW5nLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9uaXhpZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvcGFydGljbGUtZWZmZWN0LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9zdGFydC1tZW51LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvdGl0bGUubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9kZWJ1Zy1jYW1lcmEubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9nZW9tZXRyeS9jYXBzdWxlLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvaW5kZXgubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9tYXRzLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvcGFsZXR0ZS5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL3NjZW5lLW1hbmFnZXIubHMiLCIvVXNlcnMvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9zdGQvZWFzaW5nLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2luZGV4LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvZGVidWctb3V0cHV0LmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvZnJhbWUtZHJpdmVyLmxzIiwiL1VzZXJzL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvaW5wdXQtaGFuZGxlci5scyIsIi9Vc2Vycy9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3V0aWxzL3RpbWVyLmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqbUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciByZWYkLCBsb2csIGRlbGF5LCBGcmFtZURyaXZlciwgSW5wdXRIYW5kbGVyLCBEZWJ1Z091dHB1dCwgVGV0cmlzR2FtZSwgVGhyZWVKc1JlbmRlcmVyO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBsb2cgPSByZWYkLmxvZywgZGVsYXkgPSByZWYkLmRlbGF5O1xuRnJhbWVEcml2ZXIgPSByZXF1aXJlKCcuL3V0aWxzL2ZyYW1lLWRyaXZlcicpLkZyYW1lRHJpdmVyO1xuSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi91dGlscy9pbnB1dC1oYW5kbGVyJykuSW5wdXRIYW5kbGVyO1xuRGVidWdPdXRwdXQgPSByZXF1aXJlKCcuL3V0aWxzL2RlYnVnLW91dHB1dCcpLkRlYnVnT3V0cHV0O1xuVGV0cmlzR2FtZSA9IHJlcXVpcmUoJy4vZ2FtZScpLlRldHJpc0dhbWU7XG5UaHJlZUpzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyJykuVGhyZWVKc1JlbmRlcmVyO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBnYW1lU3RhdGUsIGdhbWVPcHRpb25zLCByZW5kZXJPcHRpb25zLCBpbnB1dEhhbmRsZXIsIHRldHJpc0dhbWUsIHJlbmRlcmVyLCB0aW1lRmFjdG9yLCBkZWJ1Z091dHB1dCwgZnJhbWVEcml2ZXIsIHRlc3RFYXNpbmc7XG4gIGdhbWVTdGF0ZSA9IHtcbiAgICBtZXRhZ2FtZVN0YXRlOiAnbm8tZ2FtZSdcbiAgfTtcbiAgZ2FtZU9wdGlvbnMgPSByZXF1aXJlKCcuL2NvbmZpZy9nYW1lJyk7XG4gIHJlbmRlck9wdGlvbnMgPSByZXF1aXJlKCcuL2NvbmZpZy9zY2VuZScpO1xuICBpbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyO1xuICB0ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gIHJlbmRlcmVyID0gbmV3IFRocmVlSnNSZW5kZXJlcihyZW5kZXJPcHRpb25zLCBnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgdGltZUZhY3RvciA9IDEwO1xuICBkZWJ1Z091dHB1dCA9IG5ldyBEZWJ1Z091dHB1dDtcbiAgSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgICBpZiAoZnJhbWVEcml2ZXIuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gICAgfVxuICB9KTtcbiAgSW5wdXRIYW5kbGVyLm9uKDI3LCBmdW5jdGlvbigpe1xuICAgIGdhbWVTdGF0ZS5jb3JlLnBhdXNlZCA9ICFnYW1lU3RhdGUuY29yZS5wYXVzZWQ7XG4gICAgcmV0dXJuIGxvZyhnYW1lU3RhdGUuY29yZS5wYXVzZWQgPyBcIkdhbWUgdGltZSBwYXVzZWRcIiA6IFwiR2FtZSB0aW1lIHVucGF1c2VkXCIpO1xuICB9KTtcbiAgZnJhbWVEcml2ZXIgPSBuZXcgRnJhbWVEcml2ZXIoZnVuY3Rpb24ozpR0LCB0aW1lLCBmcmFtZSwgZnBzKXtcbiAgICBnYW1lU3RhdGUgPSB0ZXRyaXNHYW1lLnVwZGF0ZShnYW1lU3RhdGUsIHtcbiAgICAgIGlucHV0OiBpbnB1dEhhbmRsZXIuY2hhbmdlc1NpbmNlTGFzdEZyYW1lKCksXG4gICAgICDOlHQ6IM6UdCAvIHRpbWVGYWN0b3IsXG4gICAgICB0aW1lOiB0aW1lIC8gdGltZUZhY3RvcixcbiAgICAgIGZyYW1lOiBmcmFtZSxcbiAgICAgIGZwczogZnBzXG4gICAgfSk7XG4gICAgcmVuZGVyZXIucmVuZGVyKGdhbWVTdGF0ZSk7XG4gICAgcmV0dXJuIGRlYnVnT3V0cHV0ICE9IG51bGwgPyBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlKSA6IHZvaWQgODtcbiAgfSk7XG4gIHJlbmRlcmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuICBmcmFtZURyaXZlci5zdGFydCgpO1xuICB0ZXRyaXNHYW1lLmJlZ2luTmV3R2FtZShnYW1lU3RhdGUpO1xuICByZXR1cm4gdGVzdEVhc2luZyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIEVhc2UsIGkkLCByZWYkLCBsZW4kLCBlbCwgZWFzZU5hbWUsIGVhc2UsIGxyZXN1bHQkLCBjbnYsIGN0eCwgaSwgcCwgcmVzdWx0cyQgPSBbXTtcbiAgICBFYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY2FudmFzJykpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBlbCA9IHJlZiRbaSRdO1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgZm9yIChlYXNlTmFtZSBpbiBFYXNlKSB7XG4gICAgICBlYXNlID0gRWFzZVtlYXNlTmFtZV07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgY252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjbnYud2lkdGggPSAyMDA7XG4gICAgICBjbnYuaGVpZ2h0ID0gMjAwO1xuICAgICAgY252LnN0eWxlLmJhY2tncm91bmQgPSAnd2hpdGUnO1xuICAgICAgY252LnN0eWxlLmJvcmRlckxlZnQgPSBcIjNweCBzb2xpZCBibGFja1wiO1xuICAgICAgY3R4ID0gY252LmdldENvbnRleHQoJzJkJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNudik7XG4gICAgICBjdHguZm9udCA9IFwiMTRweCBtb25vc3BhY2VcIjtcbiAgICAgIGN0eC5maWxsVGV4dChlYXNlTmFtZSwgMiwgMTYsIDIwMCk7XG4gICAgICBmb3IgKGkkID0gMDsgaSQgPD0gMTAwOyArK2kkKSB7XG4gICAgICAgIGkgPSBpJDtcbiAgICAgICAgcCA9IGkgLyAxMDA7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY3R4LmZpbGxSZWN0KDIgKiBpLCAyMDAgLSBlYXNlKHAsIDAsIDIwMCksIDIsIDIpKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG59KTsiLCIvKipcbiAqIEBhdXRob3IgZG1hcmNvcyAvIGh0dHBzOi8vZ2l0aHViLmNvbS9kbWFyY29zXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tXG4gKi9cblxuVEhSRUUuVlJDb250cm9scyA9IGZ1bmN0aW9uICggb2JqZWN0LCBvbkVycm9yICkge1xuXG5cdHZhciBzY29wZSA9IHRoaXM7XG5cdHZhciB2cklucHV0cyA9IFtdO1xuXG5cdGZ1bmN0aW9uIGZpbHRlckludmFsaWREZXZpY2VzKCBkZXZpY2VzICkge1xuXG5cdFx0Ly8gRXhjbHVkZSBDYXJkYm9hcmQgcG9zaXRpb24gc2Vuc29yIGlmIE9jdWx1cyBleGlzdHMuXG5cdFx0dmFyIG9jdWx1c0RldmljZXMgPSBkZXZpY2VzLmZpbHRlciggZnVuY3Rpb24gKCBkZXZpY2UgKSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlLmRldmljZU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdvY3VsdXMnKSAhPT0gLTE7XG5cdFx0fSApO1xuXG5cdFx0aWYgKCBvY3VsdXNEZXZpY2VzLmxlbmd0aCA+PSAxICkge1xuXHRcdFx0cmV0dXJuIGRldmljZXMuZmlsdGVyKCBmdW5jdGlvbiAoIGRldmljZSApIHtcblx0XHRcdFx0cmV0dXJuIGRldmljZS5kZXZpY2VOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignY2FyZGJvYXJkJykgPT09IC0xO1xuXHRcdFx0fSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlcztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnb3RWUkRldmljZXMoIGRldmljZXMgKSB7XG5cdFx0ZGV2aWNlcyA9IGZpbHRlckludmFsaWREZXZpY2VzKCBkZXZpY2VzICk7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgZGV2aWNlcy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHRpZiAoIGRldmljZXNbIGkgXSBpbnN0YW5jZW9mIFBvc2l0aW9uU2Vuc29yVlJEZXZpY2UgKSB7XG5cdFx0XHRcdHZySW5wdXRzLnB1c2goIGRldmljZXNbIGkgXSApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggb25FcnJvciApIG9uRXJyb3IoICdITUQgbm90IGF2YWlsYWJsZScgKTtcblx0fVxuXG5cdGlmICggbmF2aWdhdG9yLmdldFZSRGV2aWNlcyApIHtcblx0XHRuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzKCkudGhlbiggZ290VlJEZXZpY2VzICk7XG5cdH1cblxuXHQvLyB0aGUgUmlmdCBTREsgcmV0dXJucyB0aGUgcG9zaXRpb24gaW4gbWV0ZXJzXG5cdC8vIHRoaXMgc2NhbGUgZmFjdG9yIGFsbG93cyB0aGUgdXNlciB0byBkZWZpbmUgaG93IG1ldGVyc1xuXHQvLyBhcmUgY29udmVydGVkIHRvIHNjZW5lIHVuaXRzLlxuXG5cdHRoaXMuc2NhbGUgPSAxO1xuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCB2cklucHV0cy5sZW5ndGg7IGkgKysgKSB7XG5cdFx0XHR2YXIgdnJJbnB1dCA9IHZySW5wdXRzWyBpIF07XG5cdFx0XHR2YXIgc3RhdGUgPSB2cklucHV0LmdldFN0YXRlKCk7XG5cblx0XHRcdGlmICggc3RhdGUub3JpZW50YXRpb24gIT09IG51bGwgKSB7XG5cdFx0XHRcdG9iamVjdC5xdWF0ZXJuaW9uLmNvcHkoIHN0YXRlLm9yaWVudGF0aW9uICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggc3RhdGUucG9zaXRpb24gIT09IG51bGwgKSB7XG5cdFx0XHRcdG9iamVjdC5wb3NpdGlvbi5jb3B5KCBzdGF0ZS5wb3NpdGlvbiApLm11bHRpcGx5U2NhbGFyKCBzY29wZS5zY2FsZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnJlc2V0U2Vuc29yID0gZnVuY3Rpb24gKCkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHZySW5wdXRzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdHZhciB2cklucHV0ID0gdnJJbnB1dHNbIGkgXTtcblxuXHRcdFx0aWYgKCB2cklucHV0LnJlc2V0U2Vuc29yICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHZySW5wdXQucmVzZXRTZW5zb3IoKTtcblx0XHRcdH0gZWxzZSBpZiAoIHZySW5wdXQuemVyb1NlbnNvciAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR2cklucHV0Lnplcm9TZW5zb3IoKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dGhpcy56ZXJvU2Vuc29yID0gZnVuY3Rpb24gKCkge1xuXHRcdFRIUkVFLndhcm4oICdUSFJFRS5WUkNvbnRyb2xzOiAuemVyb1NlbnNvcigpIGlzIG5vdyAucmVzZXRTZW5zb3IoKS4nICk7XG5cdFx0dGhpcy5yZXNldFNlbnNvcigpO1xuXHR9O1xuXG59O1xuXG4iLCJcbi8qKlxuICogQGF1dGhvciBkbWFyY29zIC8gaHR0cHM6Ly9naXRodWIuY29tL2RtYXJjb3NcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqXG4gKiBXZWJWUiBTcGVjOiBodHRwOi8vbW96dnIuZ2l0aHViLmlvL3dlYnZyLXNwZWMvd2VidnIuaHRtbFxuICpcbiAqIEZpcmVmb3g6IGh0dHA6Ly9tb3p2ci5jb20vZG93bmxvYWRzL1xuICogQ2hyb21pdW06IGh0dHBzOi8vZHJpdmUuZ29vZ2xlLmNvbS9mb2xkZXJ2aWV3P2lkPTBCenVkTHQyMkJxR1JiVzlXVEhNdE9XTXpOalEmdXNwPXNoYXJpbmcjbGlzdFxuICpcbiAqL1xuXG5USFJFRS5WUkVmZmVjdCA9IGZ1bmN0aW9uICggcmVuZGVyZXIsIG9uRXJyb3IgKSB7XG5cblx0dmFyIHZySE1EO1xuXHR2YXIgZXllVHJhbnNsYXRpb25MLCBleWVGT1ZMO1xuXHR2YXIgZXllVHJhbnNsYXRpb25SLCBleWVGT1ZSO1xuXG5cdGZ1bmN0aW9uIGdvdFZSRGV2aWNlcyggZGV2aWNlcyApIHtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdGlmICggZGV2aWNlc1sgaSBdIGluc3RhbmNlb2YgSE1EVlJEZXZpY2UgKSB7XG5cdFx0XHRcdHZySE1EID0gZGV2aWNlc1sgaSBdO1xuXG5cdFx0XHRcdGlmICggdnJITUQuZ2V0RXllUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHZhciBleWVQYXJhbXNMID0gdnJITUQuZ2V0RXllUGFyYW1ldGVycyggJ2xlZnQnICk7XG5cdFx0XHRcdFx0dmFyIGV5ZVBhcmFtc1IgPSB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAncmlnaHQnICk7XG5cblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvbkwgPSBleWVQYXJhbXNMLmV5ZVRyYW5zbGF0aW9uO1xuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uUiA9IGV5ZVBhcmFtc1IuZXllVHJhbnNsYXRpb247XG5cdFx0XHRcdFx0ZXllRk9WTCA9IGV5ZVBhcmFtc0wucmVjb21tZW5kZWRGaWVsZE9mVmlldztcblx0XHRcdFx0XHRleWVGT1ZSID0gZXllUGFyYW1zUi5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIFRPRE86IFRoaXMgaXMgYW4gb2xkZXIgY29kZSBwYXRoIGFuZCBub3Qgc3BlYyBjb21wbGlhbnQuXG5cdFx0XHRcdFx0Ly8gSXQgc2hvdWxkIGJlIHJlbW92ZWQgYXQgc29tZSBwb2ludCBpbiB0aGUgbmVhciBmdXR1cmUuXG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25MID0gdnJITUQuZ2V0RXllVHJhbnNsYXRpb24oICdsZWZ0JyApO1xuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uUiA9IHZySE1ELmdldEV5ZVRyYW5zbGF0aW9uKCAncmlnaHQnICk7XG5cdFx0XHRcdFx0ZXllRk9WTCA9IHZySE1ELmdldFJlY29tbWVuZGVkRXllRmllbGRPZlZpZXcoICdsZWZ0JyApO1xuXHRcdFx0XHRcdGV5ZUZPVlIgPSB2ckhNRC5nZXRSZWNvbW1lbmRlZEV5ZUZpZWxkT2ZWaWV3KCAncmlnaHQnICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7IC8vIFdlIGtlZXAgdGhlIGZpcnN0IHdlIGVuY291bnRlclxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggdnJITUQgPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdGlmICggb25FcnJvciApIG9uRXJyb3IoICdITUQgbm90IGF2YWlsYWJsZScgKTtcblx0XHR9XG5cblx0fVxuXG5cdGlmICggbmF2aWdhdG9yLmdldFZSRGV2aWNlcyApIHtcblx0XHRuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzKCkudGhlbiggZ290VlJEZXZpY2VzICk7XG5cdH1cblxuXHQvL1xuXG5cdHRoaXMuc2NhbGUgPSAxO1xuXHR0aGlzLnNldFNpemUgPSBmdW5jdGlvbiggd2lkdGgsIGhlaWdodCApIHtcblx0XHRyZW5kZXJlci5zZXRTaXplKCB3aWR0aCwgaGVpZ2h0ICk7XG5cdH07XG5cblx0Ly8gZnVsbHNjcmVlblxuXG5cdHZhciBpc0Z1bGxzY3JlZW4gPSBmYWxzZTtcblx0dmFyIGNhbnZhcyA9IHJlbmRlcmVyLmRvbUVsZW1lbnQ7XG5cdHZhciBmdWxsc2NyZWVuY2hhbmdlID0gY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuID8gJ21vemZ1bGxzY3JlZW5jaGFuZ2UnIDogJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnO1xuXG5cdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIGZ1bGxzY3JlZW5jaGFuZ2UsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0aXNGdWxsc2NyZWVuID0gZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQ7XG5cdH0sIGZhbHNlICk7XG5cblx0dGhpcy5zZXRGdWxsU2NyZWVuID0gZnVuY3Rpb24gKCBib29sZWFuICkge1xuXHRcdGlmICggdnJITUQgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblx0XHRpZiAoIGlzRnVsbHNjcmVlbiA9PT0gYm9vbGVhbiApIHJldHVybjtcblx0XHRpZiAoIGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiApIHtcblx0XHRcdGNhbnZhcy5tb3pSZXF1ZXN0RnVsbFNjcmVlbiggeyB2ckRpc3BsYXk6IHZySE1EIH0gKTtcblx0XHR9IGVsc2UgaWYgKCBjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4gKSB7XG5cdFx0XHRjYW52YXMud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oIHsgdnJEaXNwbGF5OiB2ckhNRCB9ICk7XG5cdFx0fVxuXHR9O1xuXG5cbiAgLy8gUHJveHkgZm9yIHJlbmRlcmVyXG4gIHRoaXMuZ2V0UGl4ZWxSYXRpbyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmVuZGVyZXIuZ2V0UGl4ZWxSYXRpbygpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY29udGV4dCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlbmRlcmVyLmNvbnRleHQ7IH1cbiAgfSk7XG5cblx0Ly8gcmVuZGVyXG5cdHZhciBjYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cdHZhciBjYW1lcmFSID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG5cblx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEgKSB7XG5cdFx0aWYgKCB2ckhNRCApIHtcblx0XHRcdHZhciBzY2VuZUwsIHNjZW5lUjtcblxuXHRcdFx0aWYgKCBzY2VuZSBpbnN0YW5jZW9mIEFycmF5ICkge1xuXHRcdFx0XHRzY2VuZUwgPSBzY2VuZVsgMCBdO1xuXHRcdFx0XHRzY2VuZVIgPSBzY2VuZVsgMSBdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2NlbmVMID0gc2NlbmU7XG5cdFx0XHRcdHNjZW5lUiA9IHNjZW5lO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc2l6ZSA9IHJlbmRlcmVyLmdldFNpemUoKTtcblx0XHRcdHNpemUud2lkdGggLz0gMjtcblxuXHRcdFx0cmVuZGVyZXIuZW5hYmxlU2Npc3NvclRlc3QoIHRydWUgKTtcblx0XHRcdHJlbmRlcmVyLmNsZWFyKCk7XG5cblx0XHRcdGlmICggY2FtZXJhLnBhcmVudCA9PT0gdW5kZWZpbmVkICkgY2FtZXJhLnVwZGF0ZU1hdHJpeFdvcmxkKCk7XG5cblx0XHRcdGNhbWVyYUwucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggZXllRk9WTCwgdHJ1ZSwgY2FtZXJhLm5lYXIsIGNhbWVyYS5mYXIgKTtcblx0XHRcdGNhbWVyYVIucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggZXllRk9WUiwgdHJ1ZSwgY2FtZXJhLm5lYXIsIGNhbWVyYS5mYXIgKTtcblxuXHRcdFx0Y2FtZXJhLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggY2FtZXJhTC5wb3NpdGlvbiwgY2FtZXJhTC5xdWF0ZXJuaW9uLCBjYW1lcmFMLnNjYWxlICk7XG5cdFx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFSLnBvc2l0aW9uLCBjYW1lcmFSLnF1YXRlcm5pb24sIGNhbWVyYVIuc2NhbGUgKTtcblxuXHRcdFx0Y2FtZXJhTC50cmFuc2xhdGVYKCBleWVUcmFuc2xhdGlvbkwueCAqIHRoaXMuc2NhbGUgKTtcblx0XHRcdGNhbWVyYVIudHJhbnNsYXRlWCggZXllVHJhbnNsYXRpb25SLnggKiB0aGlzLnNjYWxlICk7XG5cblx0XHRcdC8vIHJlbmRlciBsZWZ0IGV5ZVxuXHRcdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5zZXRTY2lzc29yKCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZUwsIGNhbWVyYUwgKTtcblxuXHRcdFx0Ly8gcmVuZGVyIHJpZ2h0IGV5ZVxuXHRcdFx0cmVuZGVyZXIuc2V0Vmlld3BvcnQoIHNpemUud2lkdGgsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5zZXRTY2lzc29yKCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuXHRcdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZVIsIGNhbWVyYVIgKTtcblxuXHRcdFx0cmVuZGVyZXIuZW5hYmxlU2Npc3NvclRlc3QoIGZhbHNlICk7XG5cblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdC8vIFJlZ3VsYXIgcmVuZGVyIG1vZGUgaWYgbm90IEhNRFxuXG5cdFx0aWYgKCBzY2VuZSBpbnN0YW5jZW9mIEFycmF5ICkgc2NlbmUgPSBzY2VuZVsgMCBdO1xuXG5cdFx0cmVuZGVyZXIucmVuZGVyKCBzY2VuZSwgY2FtZXJhICk7XG5cblx0fTtcblxuXHRmdW5jdGlvbiBmb3ZUb05EQ1NjYWxlT2Zmc2V0KCBmb3YgKSB7XG5cblx0XHR2YXIgcHhzY2FsZSA9IDIuMCAvIChmb3YubGVmdFRhbiArIGZvdi5yaWdodFRhbik7XG5cdFx0dmFyIHB4b2Zmc2V0ID0gKGZvdi5sZWZ0VGFuIC0gZm92LnJpZ2h0VGFuKSAqIHB4c2NhbGUgKiAwLjU7XG5cdFx0dmFyIHB5c2NhbGUgPSAyLjAgLyAoZm92LnVwVGFuICsgZm92LmRvd25UYW4pO1xuXHRcdHZhciBweW9mZnNldCA9IChmb3YudXBUYW4gLSBmb3YuZG93blRhbikgKiBweXNjYWxlICogMC41O1xuXHRcdHJldHVybiB7IHNjYWxlOiBbIHB4c2NhbGUsIHB5c2NhbGUgXSwgb2Zmc2V0OiBbIHB4b2Zmc2V0LCBweW9mZnNldCBdIH07XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdiwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICkge1xuXG5cdFx0cmlnaHRIYW5kZWQgPSByaWdodEhhbmRlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJpZ2h0SGFuZGVkO1xuXHRcdHpOZWFyID0gek5lYXIgPT09IHVuZGVmaW5lZCA/IDAuMDEgOiB6TmVhcjtcblx0XHR6RmFyID0gekZhciA9PT0gdW5kZWZpbmVkID8gMTAwMDAuMCA6IHpGYXI7XG5cblx0XHR2YXIgaGFuZGVkbmVzc1NjYWxlID0gcmlnaHRIYW5kZWQgPyAtMS4wIDogMS4wO1xuXG5cdFx0Ly8gc3RhcnQgd2l0aCBhbiBpZGVudGl0eSBtYXRyaXhcblx0XHR2YXIgbW9iaiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIG0gPSBtb2JqLmVsZW1lbnRzO1xuXG5cdFx0Ly8gYW5kIHdpdGggc2NhbGUvb2Zmc2V0IGluZm8gZm9yIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkc1xuXHRcdHZhciBzY2FsZUFuZE9mZnNldCA9IGZvdlRvTkRDU2NhbGVPZmZzZXQoZm92KTtcblxuXHRcdC8vIFggcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG5cdFx0bVswICogNCArIDBdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMF07XG5cdFx0bVswICogNCArIDFdID0gMC4wO1xuXHRcdG1bMCAqIDQgKyAyXSA9IHNjYWxlQW5kT2Zmc2V0Lm9mZnNldFswXSAqIGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzAgKiA0ICsgM10gPSAwLjA7XG5cblx0XHQvLyBZIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuXHRcdC8vIFkgb2Zmc2V0IGlzIG5lZ2F0ZWQgYmVjYXVzZSB0aGlzIHByb2ogbWF0cml4IHRyYW5zZm9ybXMgZnJvbSB3b3JsZCBjb29yZHMgd2l0aCBZPXVwLFxuXHRcdC8vIGJ1dCB0aGUgTkRDIHNjYWxpbmcgaGFzIFk9ZG93biAodGhhbmtzIEQzRD8pXG5cdFx0bVsxICogNCArIDBdID0gMC4wO1xuXHRcdG1bMSAqIDQgKyAxXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzFdO1xuXHRcdG1bMSAqIDQgKyAyXSA9IC1zY2FsZUFuZE9mZnNldC5vZmZzZXRbMV0gKiBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVsxICogNCArIDNdID0gMC4wO1xuXG5cdFx0Ly8gWiByZXN1bHQgKHVwIHRvIHRoZSBhcHApXG5cdFx0bVsyICogNCArIDBdID0gMC4wO1xuXHRcdG1bMiAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzIgKiA0ICsgMl0gPSB6RmFyIC8gKHpOZWFyIC0gekZhcikgKiAtaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMiAqIDQgKyAzXSA9ICh6RmFyICogek5lYXIpIC8gKHpOZWFyIC0gekZhcik7XG5cblx0XHQvLyBXIHJlc3VsdCAoPSBaIGluKVxuXHRcdG1bMyAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzMgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVszICogNCArIDJdID0gaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMyAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdG1vYmoudHJhbnNwb3NlKCk7XG5cblx0XHRyZXR1cm4gbW9iajtcblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlRvUHJvamVjdGlvbiggZm92LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKSB7XG5cblx0XHR2YXIgREVHMlJBRCA9IE1hdGguUEkgLyAxODAuMDtcblxuXHRcdHZhciBmb3ZQb3J0ID0ge1xuXHRcdFx0dXBUYW46IE1hdGgudGFuKCBmb3YudXBEZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0ZG93blRhbjogTWF0aC50YW4oIGZvdi5kb3duRGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdGxlZnRUYW46IE1hdGgudGFuKCBmb3YubGVmdERlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRyaWdodFRhbjogTWF0aC50YW4oIGZvdi5yaWdodERlZ3JlZXMgKiBERUcyUkFEIClcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdlBvcnQsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApO1xuXG5cdH1cblxufTtcbiIsIlxuLypcbiAqIE1velZSIEV4dGVuc2lvbnMgdG8gdGhyZWUuanNcbiAqXG4gKiBBIGJyb3dzZXJpZnkgd3JhcHBlciBmb3IgdGhlIFZSIGhlbHBlcnMgZnJvbSBNb3pWUidzIGdpdGh1YiByZXBvLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01velZSL3ZyLXdlYi1leGFtcGxlcy90cmVlL21hc3Rlci90aHJlZWpzLXZyLWJvaWxlcnBsYXRlXG4gKlxuICogVGhlIGV4dGVuc2lvbiBmaWxlcyBhcmUgbm90IG1vZHVsZSBjb21wYXRpYmxlIGFuZCB3b3JrIGJ5IGFwcGVuZGluZyB0byB0aGVcbiAqIFRIUkVFIG9iamVjdC4gRG8gdXNlIHRoZW0sIHdlIG1ha2UgdGhlIFRIUkVFIG9iamVjdCBnbG9iYWwsIGFuZCB0aGVuIG1ha2VcbiAqIGl0IHRoZSBleHBvcnQgdmFsdWUgb2YgdGhpcyBtb2R1bGUuXG4gKlxuICovXG5cbmNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ0xvYWRpbmcgTW96VlIgRXh0ZW5zaW9ucy4uLicpO1xuLy9yZXF1aXJlKCcuL1N0ZXJlb0VmZmVjdC5qcycpO1xuLy9jb25zb2xlLmxvZygnU3RlcmVvRWZmZWN0IC0gT0snKTtcblxucmVxdWlyZSgnLi9WUkNvbnRyb2xzLmpzJyk7XG5jb25zb2xlLmxvZygnVlJDb250cm9scyAtIE9LJyk7XG5cbnJlcXVpcmUoJy4vVlJFZmZlY3QuanMnKTtcbmNvbnNvbGUubG9nKCdWUkVmZmVjdCAtIE9LJyk7XG5cbmNvbnNvbGUuZ3JvdXBFbmQoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRTtcblxuIiwiLyoqXG4gKiBAYXV0aG9yIEViZXJoYXJkIEdyYWV0aGVyIC8gaHR0cDovL2VncmFldGhlci5jb20vXG4gKiBAYXV0aG9yIE1hcmsgTHVuZGluIFx0LyBodHRwOi8vbWFyay1sdW5kaW4uY29tXG4gKiBAYXV0aG9yIFNpbW9uZSBNYW5pbmkgLyBodHRwOi8vZGFyb24xMzM3LmdpdGh1Yi5pb1xuICogQGF1dGhvciBMdWNhIEFudGlnYSBcdC8gaHR0cDovL2xhbnRpZ2EuZ2l0aHViLmlvXG4gKi9cblxuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgdGFyZ2V0LCBkb21FbGVtZW50ICkge1xuXG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHZhciBTVEFURSA9IHsgTk9ORTogLTEsIFJPVEFURTogMCwgWk9PTTogMSwgUEFOOiAyLCBUT1VDSF9ST1RBVEU6IDMsIFRPVUNIX1pPT01fUEFOOiA0IH07XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHR0aGlzLnNjcmVlbiA9IHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cblx0dGhpcy5yb3RhdGVTcGVlZCA9IDEuMDtcblx0dGhpcy56b29tU3BlZWQgPSAxLjI7XG5cdHRoaXMucGFuU3BlZWQgPSAwLjM7XG5cblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLm5vUGFuID0gZmFsc2U7XG5cblx0dGhpcy5zdGF0aWNNb3ZpbmcgPSBmYWxzZTtcblx0dGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMjtcblxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdHRoaXMua2V5cyA9IFsgNjUgLypBKi8sIDgzIC8qUyovLCA2OCAvKkQqLyBdO1xuXG5cdC8vIGludGVybmFsc1xuXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0ID8gdGFyZ2V0LnBvc2l0aW9uIDogbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIF9zdGF0ZSA9IFNUQVRFLk5PTkUsXG5cdF9wcmV2U3RhdGUgPSBTVEFURS5OT05FLFxuXG5cdF9leWUgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXG5cdF9tb3ZlUHJldiA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF9tb3ZlQ3VyciA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cblx0X2xhc3RBeGlzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0X2xhc3RBbmdsZSA9IDAsXG5cblx0X3pvb21TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF96b29tRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblxuXHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IDAsXG5cdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IDAsXG5cblx0X3BhblN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X3BhbkVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0Ly8gZm9yIHJlc2V0XG5cblx0dGhpcy50YXJnZXQwID0gdGhpcy50YXJnZXQuY2xvbmUoKTtcblx0dGhpcy5wb3NpdGlvbjAgPSB0aGlzLm9iamVjdC5wb3NpdGlvbi5jbG9uZSgpO1xuXHR0aGlzLnVwMCA9IHRoaXMub2JqZWN0LnVwLmNsb25lKCk7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXHR2YXIgc3RhcnRFdmVudCA9IHsgdHlwZTogJ3N0YXJ0JyB9O1xuXHR2YXIgZW5kRXZlbnQgPSB7IHR5cGU6ICdlbmQnIH07XG5cblxuXHQvLyBtZXRob2RzXG5cblx0dGhpcy5oYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIHRoaXMuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgKSB7XG5cblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSAwO1xuXHRcdFx0dGhpcy5zY3JlZW4udG9wID0gMDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0XHR0aGlzLnNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR2YXIgYm94ID0gdGhpcy5kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0Ly8gYWRqdXN0bWVudHMgY29tZSBmcm9tIHNpbWlsYXIgY29kZSBpbiB0aGUganF1ZXJ5IG9mZnNldCgpIGZ1bmN0aW9uXG5cdFx0XHR2YXIgZCA9IHRoaXMuZG9tRWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSBib3gubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIGQuY2xpZW50TGVmdDtcblx0XHRcdHRoaXMuc2NyZWVuLnRvcCA9IGJveC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBkLmNsaWVudFRvcDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gYm94LndpZHRoO1xuXHRcdFx0dGhpcy5zY3JlZW4uaGVpZ2h0ID0gYm94LmhlaWdodDtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpc1sgZXZlbnQudHlwZSBdID09ICdmdW5jdGlvbicgKSB7XG5cblx0XHRcdHRoaXNbIGV2ZW50LnR5cGUgXSggZXZlbnQgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHZhciBnZXRNb3VzZU9uU2NyZWVuID0gKCBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBhZ2VYLCBwYWdlWSApIHtcblxuXHRcdFx0dmVjdG9yLnNldChcblx0XHRcdFx0KCBwYWdlWCAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyBfdGhpcy5zY3JlZW4ud2lkdGgsXG5cdFx0XHRcdCggcGFnZVkgLSBfdGhpcy5zY3JlZW4udG9wICkgLyBfdGhpcy5zY3JlZW4uaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gdmVjdG9yO1xuXG5cdFx0fTtcblxuXHR9KCkgKTtcblxuXHR2YXIgZ2V0TW91c2VPbkNpcmNsZSA9ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBwYWdlWCwgcGFnZVkgKSB7XG5cblx0XHRcdHZlY3Rvci5zZXQoXG5cdFx0XHRcdCggKCBwYWdlWCAtIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyAoIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSApICksXG5cdFx0XHRcdCggKCBfdGhpcy5zY3JlZW4uaGVpZ2h0ICsgMiAqICggX3RoaXMuc2NyZWVuLnRvcCAtIHBhZ2VZICkgKSAvIF90aGlzLnNjcmVlbi53aWR0aCApIC8vIHNjcmVlbi53aWR0aCBpbnRlbnRpb25hbFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHZlY3Rvcjtcblx0XHR9O1xuXG5cdH0oKSApO1xuXG5cdHRoaXMucm90YXRlQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0cXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCksXG5cdFx0XHRleWVEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRhbmdsZTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdG1vdmVEaXJlY3Rpb24uc2V0KCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54LCBfbW92ZUN1cnIueSAtIF9tb3ZlUHJldi55LCAwICk7XG5cdFx0XHRhbmdsZSA9IG1vdmVEaXJlY3Rpb24ubGVuZ3RoKCk7XG5cblx0XHRcdGlmICggYW5nbGUgKSB7XG5cblx0XHRcdFx0X2V5ZS5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKS5zdWIoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0XHRcdGV5ZURpcmVjdGlvbi5jb3B5KCBfZXllICkubm9ybWFsaXplKCk7XG5cdFx0XHRcdG9iamVjdFVwRGlyZWN0aW9uLmNvcHkoIF90aGlzLm9iamVjdC51cCApLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbi5jcm9zc1ZlY3RvcnMoIG9iamVjdFVwRGlyZWN0aW9uLCBleWVEaXJlY3Rpb24gKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRvYmplY3RVcERpcmVjdGlvbi5zZXRMZW5ndGgoIF9tb3ZlQ3Vyci55IC0gX21vdmVQcmV2LnkgKTtcblx0XHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24uc2V0TGVuZ3RoKCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54ICk7XG5cblx0XHRcdFx0bW92ZURpcmVjdGlvbi5jb3B5KCBvYmplY3RVcERpcmVjdGlvbi5hZGQoIG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uICkgKTtcblxuXHRcdFx0XHRheGlzLmNyb3NzVmVjdG9ycyggbW92ZURpcmVjdGlvbiwgX2V5ZSApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdGFuZ2xlICo9IF90aGlzLnJvdGF0ZVNwZWVkO1xuXHRcdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICk7XG5cblx0XHRcdFx0X2V5ZS5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblx0XHRcdFx0X3RoaXMub2JqZWN0LnVwLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXG5cdFx0XHRcdF9sYXN0QXhpcy5jb3B5KCBheGlzICk7XG5cdFx0XHRcdF9sYXN0QW5nbGUgPSBhbmdsZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRlbHNlIGlmICggIV90aGlzLnN0YXRpY01vdmluZyAmJiBfbGFzdEFuZ2xlICkge1xuXG5cdFx0XHRcdF9sYXN0QW5nbGUgKj0gTWF0aC5zcXJ0KCAxLjAgLSBfdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciApO1xuXHRcdFx0XHRfZXllLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApLnN1YiggX3RoaXMudGFyZ2V0ICk7XG5cdFx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSggX2xhc3RBeGlzLCBfbGFzdEFuZ2xlICk7XG5cdFx0XHRcdF9leWUuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cdFx0XHRcdF90aGlzLm9iamVjdC51cC5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfbW92ZVByZXYuY29weSggX21vdmVDdXJyICk7XG5cblx0XHR9O1xuXG5cdH0oKSk7XG5cblxuXHR0aGlzLnpvb21DYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZmFjdG9yO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlRPVUNIX1pPT01fUEFOICkge1xuXG5cdFx0XHRmYWN0b3IgPSBfdG91Y2hab29tRGlzdGFuY2VTdGFydCAvIF90b3VjaFpvb21EaXN0YW5jZUVuZDtcblx0XHRcdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gX3RvdWNoWm9vbURpc3RhbmNlRW5kO1xuXHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRmYWN0b3IgPSAxLjAgKyAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIF90aGlzLnpvb21TcGVlZDtcblxuXHRcdFx0aWYgKCBmYWN0b3IgIT09IDEuMCAmJiBmYWN0b3IgPiAwLjAgKSB7XG5cblx0XHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHRcdFx0aWYgKCBfdGhpcy5zdGF0aWNNb3ZpbmcgKSB7XG5cblx0XHRcdFx0XHRfem9vbVN0YXJ0LmNvcHkoIF96b29tRW5kICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF96b29tU3RhcnQueSArPSAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIHRoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3I7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnBhbkNhbWVyYSA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBtb3VzZUNoYW5nZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFx0XHRvYmplY3RVcCA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRwYW4gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0bW91c2VDaGFuZ2UuY29weSggX3BhbkVuZCApLnN1YiggX3BhblN0YXJ0ICk7XG5cblx0XHRcdGlmICggbW91c2VDaGFuZ2UubGVuZ3RoU3EoKSApIHtcblxuXHRcdFx0XHRtb3VzZUNoYW5nZS5tdWx0aXBseVNjYWxhciggX2V5ZS5sZW5ndGgoKSAqIF90aGlzLnBhblNwZWVkICk7XG5cblx0XHRcdFx0cGFuLmNvcHkoIF9leWUgKS5jcm9zcyggX3RoaXMub2JqZWN0LnVwICkuc2V0TGVuZ3RoKCBtb3VzZUNoYW5nZS54ICk7XG5cdFx0XHRcdHBhbi5hZGQoIG9iamVjdFVwLmNvcHkoIF90aGlzLm9iamVjdC51cCApLnNldExlbmd0aCggbW91c2VDaGFuZ2UueSApICk7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZCggcGFuICk7XG5cdFx0XHRcdF90aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0XHRcdGlmICggX3RoaXMuc3RhdGljTW92aW5nICkge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIF9wYW5FbmQgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmFkZCggbW91c2VDaGFuZ2Uuc3ViVmVjdG9ycyggX3BhbkVuZCwgX3BhblN0YXJ0ICkubXVsdGlwbHlTY2FsYXIoIF90aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yICkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9O1xuXG5cdH0oKSk7XG5cblx0dGhpcy5jaGVja0Rpc3RhbmNlcyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSB8fCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpID4gX3RoaXMubWF4RGlzdGFuY2UgKiBfdGhpcy5tYXhEaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWF4RGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpIDwgX3RoaXMubWluRGlzdGFuY2UgKiBfdGhpcy5taW5EaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWluRGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdGlmICggIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfdGhpcy5yb3RhdGVDYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3RoaXMuem9vbUNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF90aGlzLnBhbkNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZSApO1xuXG5cdFx0X3RoaXMuY2hlY2tEaXN0YW5jZXMoKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0aWYgKCBsYXN0UG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApID4gRVBTICkge1xuXG5cdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfcHJldlN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdF90aGlzLnRhcmdldC5jb3B5KCBfdGhpcy50YXJnZXQwICk7XG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIF90aGlzLnBvc2l0aW9uMCApO1xuXHRcdF90aGlzLm9iamVjdC51cC5jb3B5KCBfdGhpcy51cDAgKTtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdGxhc3RQb3NpdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHR9O1xuXG5cdC8vIGxpc3RlbmVyc1xuXG5cdGZ1bmN0aW9uIGtleWRvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24gKTtcblxuXHRcdF9wcmV2U3RhdGUgPSBfc3RhdGU7XG5cblx0XHRpZiAoIF9zdGF0ZSAhPT0gU1RBVEUuTk9ORSApIHtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuUk9UQVRFIF0gJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5aT09NIF0gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuWk9PTTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlBBTiBdICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuUEFOO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBrZXl1cCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0X3N0YXRlID0gX3ByZXZTdGF0ZTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24sIGZhbHNlICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNlZG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5OT05FICkge1xuXG5cdFx0XHRfc3RhdGUgPSBldmVudC5idXR0b247XG5cblx0XHR9XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5aT09NICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF96b29tU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF96b29tRW5kLmNvcHkoX3pvb21TdGFydCk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlBBTiAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9wYW5TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X3BhbkVuZC5jb3B5KF9wYW5TdGFydCk7XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCwgZmFsc2UgKTtcblxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2Vtb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlJPVEFURSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuWk9PTSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfem9vbUVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5QQU4gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNldXAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlbW92ZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCApO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNld2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKCBldmVudC53aGVlbERlbHRhICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhIC8gNDA7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbCAvIDM7XG5cblx0XHR9XG5cblx0XHRfem9vbVN0YXJ0LnkgKz0gZGVsdGEgKiAwLjAxO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLlRPVUNIX1pPT01fUEFOO1xuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gX3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIF9wYW5TdGFydCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2htb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoICBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBfdG91Y2hab29tRGlzdGFuY2VFbmQgPSAwO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBfcGFuRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1vdXNlZG93biwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBtb3VzZXdoZWVsLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgbW91c2V3aGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biwgZmFsc2UgKTtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIGtleXVwLCBmYWxzZSApO1xuXG5cdHRoaXMuaGFuZGxlUmVzaXplKCk7XG5cblx0Ly8gZm9yY2UgYW4gdXBkYXRlIGF0IHN0YXJ0XG5cdHRoaXMudXBkYXRlKCk7XG5cbn07XG5cblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUUuVHJhY2tiYWxsQ29udHJvbHM7XG5cbiIsInZhciBhcmVuYVdpZHRoLCBhcmVuYUhlaWdodCwgdGltZUZhY3Rvciwgc3RhcnRpbmdEcm9wU3BlZWQsIHNwZWVkTXVsdGlwbHlQZXJMZXZlbCwga2V5UmVwZWF0VGltZSwgc29mdERyb3BXYWl0VGltZSwgYW5pbWF0aW9uLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xub3V0JC5hcmVuYVdpZHRoID0gYXJlbmFXaWR0aCA9IDEwO1xub3V0JC5hcmVuYUhlaWdodCA9IGFyZW5hSGVpZ2h0ID0gMTg7XG5vdXQkLnRpbWVGYWN0b3IgPSB0aW1lRmFjdG9yID0gMTtcbm91dCQuc3RhcnRpbmdEcm9wU3BlZWQgPSBzdGFydGluZ0Ryb3BTcGVlZCA9IDMwMDtcbm91dCQuc3BlZWRNdWx0aXBseVBlckxldmVsID0gc3BlZWRNdWx0aXBseVBlckxldmVsID0gMC45NTtcbm91dCQua2V5UmVwZWF0VGltZSA9IGtleVJlcGVhdFRpbWUgPSAxMDA7XG5vdXQkLnNvZnREcm9wV2FpdFRpbWUgPSBzb2Z0RHJvcFdhaXRUaW1lID0gMTAwO1xub3V0JC5hbmltYXRpb24gPSBhbmltYXRpb24gPSB7XG4gIHphcEFuaW1hdGlvblRpbWU6IDUwMCxcbiAgam9sdEFuaW1hdGlvblRpbWU6IDUwMCxcbiAgaGFyZERyb3BFZmZlY3RUaW1lOiAxMDAsXG4gIHByZXZpZXdSZXZlYWxUaW1lOiAzMDAsXG4gIHRpdGxlUmV2ZWFsVGltZTogNDAwMCxcbiAgZ2FtZU92ZXJSZXZlYWxUaW1lOiA0MDAwXG59OyIsInZhciBwMm07XG5wMm0gPSAoZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgKiAxLjYgLyA0MDk2O1xufSk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgdW5pdHNQZXJNZXRlcjogMSxcbiAgaGFyZERyb3BKb2x0QW1vdW50OiAwLjAzLFxuICB6YXBQYXJ0aWNsZVNpemU6IDAuMDA4LFxuICBncmlkU2l6ZTogMC4wNyxcbiAgYmxvY2tTaXplOiAwLjA2NixcbiAgZGVza1NpemU6IFsxLjYsIDAuOCwgMC4xXSxcbiAgY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTogMC4yLFxuICBjYW1lcmFFbGV2YXRpb246IDAuNSxcbiAgYXJlbmFPZmZzZXRGcm9tQ2VudHJlOiAwLjA4NSxcbiAgYXJlbmFEaXN0YW5jZUZyb21FZGdlOiAwLjU3LFxuICBzY29yZURpc3RhbmNlRnJvbUVkZ2U6IHAybSg3ODApLFxuICBzY29yZURpc3RhbmNlRnJvbUNlbnRyZTogcDJtKDQzNiksXG4gIHNjb3JlSW50ZXJUdWJlTWFyZ2luOiBwMm0oNSksXG4gIHNjb3JlVHViZVJhZGl1czogcDJtKDIwMCAvIDIpLFxuICBzY29yZVR1YmVIZWlnaHQ6IHAybSgyNzApLFxuICBzY29yZUJhc2VSYWRpdXM6IHAybSgyNzUgLyAyKSxcbiAgc2NvcmVJbmRpY2F0b3JPZmZzZXQ6IHAybSgyNDMpLFxuICBwcmV2aWV3RG9tZVJhZGl1czogcDJtKDIwOCksXG4gIHByZXZpZXdEb21lSGVpZ2h0OiAwLjIwLFxuICBwcmV2aWV3RGlzdGFuY2VGcm9tRWRnZTogcDJtKDY1NiksXG4gIHByZXZpZXdEaXN0YW5jZUZyb21DZW50ZXI6IHAybSgxMDAyKSxcbiAgcHJldmlld1NjYWxlRmFjdG9yOiAwLjVcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kSW50LCB3cmFwLCByYW5kb21Gcm9tLCBCcmljaywgVGltZXIsIHByaW1lR2FtZVN0YXRlLCBuZXdBcmVuYSwgY29weUJyaWNrVG9BcmVuYSwgZHJvcFJvdywgcmVtb3ZlUm93cywgY2xlYXJBcmVuYSwgdG9wSXNSZWFjaGVkLCByb3dJc0NvbXBsZXRlLCBjb2xsaWRlcywgY2FuTW92ZSwgY2FuRHJvcCwgY2FuUm90YXRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBhZGRWMiA9IHJlZiQuYWRkVjIsIHJhbmRJbnQgPSByZWYkLnJhbmRJbnQsIHdyYXAgPSByZWYkLndyYXAsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKTtcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdzLCBvcHRpb25zKXtcbiAgcmV0dXJuIGdzLmFyZW5hID0ge1xuICAgIGNlbGxzOiBuZXdBcmVuYShvcHRpb25zLmFyZW5hV2lkdGgsIG9wdGlvbnMuYXJlbmFIZWlnaHQpLFxuICAgIHdpZHRoOiBvcHRpb25zLmFyZW5hV2lkdGgsXG4gICAgaGVpZ2h0OiBvcHRpb25zLmFyZW5hSGVpZ2h0LFxuICAgIHphcEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiWmFwIEFuaW1hdGlvblwiLCBvcHRpb25zLnphcEFuaW1hdGlvblRpbWUpLFxuICAgIGpvbHRBbmltYXRpb246IFRpbWVyLmNyZWF0ZShcIkpvbHQgQW5pbWF0aW9uXCIsIG9wdGlvbnMuam9sdEFuaW1hdGlvblRpbWUpXG4gIH07XG59O1xub3V0JC5uZXdBcmVuYSA9IG5ld0FyZW5hID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCl7XG4gIHZhciBpJCwgcm93LCBscmVzdWx0JCwgaiQsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwOyBpJCA8IGhlaWdodDsgKytpJCkge1xuICAgIHJvdyA9IGkkO1xuICAgIGxyZXN1bHQkID0gW107XG4gICAgZm9yIChqJCA9IDA7IGokIDwgd2lkdGg7ICsraiQpIHtcbiAgICAgIGNlbGwgPSBqJDtcbiAgICAgIGxyZXN1bHQkLnB1c2goMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQuZHJvcFJvdyA9IGRyb3BSb3cgPSBmdW5jdGlvbihhcmckLCByb3dJeCl7XG4gIHZhciBjZWxscztcbiAgY2VsbHMgPSBhcmckLmNlbGxzO1xuICBjZWxscy5zcGxpY2Uocm93SXgsIDEpO1xuICByZXR1cm4gY2VsbHMudW5zaGlmdChyZXBlYXRBcnJheSQoWzBdLCBjZWxsc1swXS5sZW5ndGgpKTtcbn07XG5vdXQkLnJlbW92ZVJvd3MgPSByZW1vdmVSb3dzID0gZnVuY3Rpb24oYXJlbmEsIHJvd3Mpe1xuICB2YXIgaSQsIGxlbiQsIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3dJeCA9IHJvd3NbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2goZHJvcFJvdyhhcmVuYSwgcm93SXgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59O1xub3V0JC5jbGVhckFyZW5hID0gY2xlYXJBcmVuYSA9IGZ1bmN0aW9uKGFyZW5hKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIGksIGNlbGwsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICByb3cgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIGkgPSBqJDtcbiAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgbHJlc3VsdCQucHVzaChyb3dbaV0gPSAwKTtcbiAgICB9XG4gICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJlbmEpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxsc1swXSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcmVmJFtpJF07XG4gICAgaWYgKGNlbGwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xub3V0JC5yb3dJc0NvbXBsZXRlID0gcm93SXNDb21wbGV0ZSA9IGZ1bmN0aW9uKHJvdyl7XG4gIHZhciBpJCwgbGVuJCwgY2VsbDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3cubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjZWxsID0gcm93W2kkXTtcbiAgICBpZiAoIWNlbGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNhbk1vdmUgPSBjYW5Nb3ZlID0gZnVuY3Rpb24oYnJpY2ssIG1vdmUsIGFyZW5hKXtcbiAgdmFyIG5ld1BvcztcbiAgbmV3UG9zID0gYWRkVjIoYnJpY2sucG9zLCBtb3ZlKTtcbiAgcmV0dXJuIGNvbGxpZGVzKG5ld1BvcywgYnJpY2suc2hhcGUsIGFyZW5hKTtcbn07XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uLCBhcmVuYSl7XG4gIHZhciBuZXdTaGFwZTtcbiAgbmV3U2hhcGUgPSBCcmljay5nZXRTaGFwZU9mUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIGNvbGxpZGVzKGJyaWNrLnBvcywgbmV3U2hhcGUsIGFyZW5hKTtcbn07XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kSW50LCB3cmFwLCBCcmlja1NoYXBlcywgcHJpbWVHYW1lU3RhdGUsIG5ld0JyaWNrLCBzcGF3bk5ld0JyaWNrLCByZXNldFN0YXRlLCByb3RhdGVCcmljaywgZ2V0U2hhcGVPZlJvdGF0aW9uLCBub3JtYWxpc2VSb3RhdGlvbiwgZHJhd0NlbGwsIGRyYXdCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZEludCA9IHJlZiQucmFuZEludCwgd3JhcCA9IHJlZiQud3JhcDtcbkJyaWNrU2hhcGVzID0gcmVxdWlyZSgnLi9kYXRhL2JyaWNrLXNoYXBlcycpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ3MsIG9wdGlvbnMpe1xuICByZXR1cm4gZ3MuYnJpY2sgPSB7XG4gICAgbmV4dDogbnVsbCxcbiAgICBjdXJyZW50OiBudWxsXG4gIH07XG59O1xub3V0JC5uZXdCcmljayA9IG5ld0JyaWNrID0gZnVuY3Rpb24oaXgpe1xuICBpeCA9PSBudWxsICYmIChpeCA9IHJhbmRJbnQoMCwgQnJpY2tTaGFwZXMuYWxsLmxlbmd0aCkpO1xuICByZXR1cm4ge1xuICAgIHBvczogWzMsIC0xXSxcbiAgICBjb2xvcjogaXgsXG4gICAgcm90YXRpb246IDAsXG4gICAgdHlwZTogQnJpY2tTaGFwZXMuYWxsW2l4XS50eXBlLFxuICAgIHNoYXBlOiBCcmlja1NoYXBlcy5hbGxbaXhdLnNoYXBlc1swXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLnJlc2V0U3RhdGUgPSByZXNldFN0YXRlID0gZnVuY3Rpb24oYnJpY2spe1xuICBicmljay5uZXh0ID0gbmV3QnJpY2soKTtcbiAgcmV0dXJuIGJyaWNrLmN1cnJlbnQgPSBuZXdCcmljaygpO1xufTtcbm91dCQucm90YXRlQnJpY2sgPSByb3RhdGVCcmljayA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gQnJpY2tTaGFwZXNbYnJpY2sudHlwZV1bYnJpY2sucm90YXRpb25dO1xufTtcbm91dCQuZ2V0U2hhcGVPZlJvdGF0aW9uID0gZ2V0U2hhcGVPZlJvdGF0aW9uID0gZnVuY3Rpb24oYnJpY2ssIHJvdGF0aW9uKXtcbiAgcm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbihicmljaywgcm90YXRpb24pO1xuICByZXR1cm4gQnJpY2tTaGFwZXNbYnJpY2sudHlwZV1bcm90YXRpb25dO1xufTtcbm91dCQubm9ybWFsaXNlUm90YXRpb24gPSBub3JtYWxpc2VSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJldHVybiB3cmFwKDAsIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdLmxlbmd0aCAtIDEsIGJyaWNrLnJvdGF0aW9uICsgcm90YXRpb24pO1xufTtcbmRyYXdDZWxsID0gZnVuY3Rpb24oaXQpe1xuICBpZiAoaXQpIHtcbiAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCIgIFwiO1xuICB9XG59O1xub3V0JC5kcmF3QnJpY2sgPSBkcmF3QnJpY2sgPSBmdW5jdGlvbihzaGFwZSl7XG4gIHJldHVybiBzaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdC5tYXAoZHJhd0NlbGwpLmpvaW4oJycpO1xuICB9KS5qb2luKFwiXFxuXCIpO1xufTsiLCJ2YXIgc3F1YXJlLCB6aWcsIHphZywgbGVmdCwgcmlnaHQsIHRlZSwgdGV0cmlzLCBhbGwsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLnNxdWFyZSA9IHNxdWFyZSA9IFtbWzAsIDAsIDBdLCBbMCwgMSwgMV0sIFswLCAxLCAxXV1dO1xub3V0JC56aWcgPSB6aWcgPSBbW1swLCAwLCAwXSwgWzIsIDIsIDBdLCBbMCwgMiwgMl1dLCBbWzAsIDIsIDBdLCBbMiwgMiwgMF0sIFsyLCAwLCAwXV1dO1xub3V0JC56YWcgPSB6YWcgPSBbW1swLCAwLCAwXSwgWzAsIDMsIDNdLCBbMywgMywgMF1dLCBbWzMsIDAsIDBdLCBbMywgMywgMF0sIFswLCAzLCAwXV1dO1xub3V0JC5sZWZ0ID0gbGVmdCA9IFtbWzAsIDAsIDBdLCBbNCwgNCwgNF0sIFs0LCAwLCAwXV0sIFtbNCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDBdXSwgW1swLCAwLCA0XSwgWzQsIDQsIDRdLCBbMCwgMCwgMF1dLCBbWzAsIDQsIDBdLCBbMCwgNCwgMF0sIFswLCA0LCA0XV1dO1xub3V0JC5yaWdodCA9IHJpZ2h0ID0gW1tbMCwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDVdXSwgW1swLCA1LCAwXSwgWzAsIDUsIDBdLCBbNSwgNSwgMF1dLCBbWzUsIDAsIDBdLCBbNSwgNSwgNV0sIFswLCAwLCAwXV0sIFtbMCwgNSwgNV0sIFswLCA1LCAwXSwgWzAsIDUsIDBdXV07XG5vdXQkLnRlZSA9IHRlZSA9IFtbWzAsIDAsIDBdLCBbNiwgNiwgNl0sIFswLCA2LCAwXV0sIFtbMCwgNiwgMF0sIFs2LCA2LCAwXSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDZdLCBbMCwgMCwgMF1dLCBbWzAsIDYsIDBdLCBbMCwgNiwgNl0sIFswLCA2LCAwXV1dO1xub3V0JC50ZXRyaXMgPSB0ZXRyaXMgPSBbW1swLCAwLCAwLCAwXSwgWzAsIDAsIDAsIDBdLCBbNywgNywgNywgN11dLCBbWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdXV07XG5vdXQkLmFsbCA9IGFsbCA9IFtcbiAge1xuICAgIHR5cGU6ICdzcXVhcmUnLFxuICAgIHNoYXBlczogc3F1YXJlXG4gIH0sIHtcbiAgICB0eXBlOiAnemlnJyxcbiAgICBzaGFwZXM6IHppZ1xuICB9LCB7XG4gICAgdHlwZTogJ3phZycsXG4gICAgc2hhcGVzOiB6YWdcbiAgfSwge1xuICAgIHR5cGU6ICdsZWZ0JyxcbiAgICBzaGFwZXM6IGxlZnRcbiAgfSwge1xuICAgIHR5cGU6ICdyaWdodCcsXG4gICAgc2hhcGVzOiByaWdodFxuICB9LCB7XG4gICAgdHlwZTogJ3RlZScsXG4gICAgc2hhcGVzOiB0ZWVcbiAgfSwge1xuICAgIHR5cGU6ICd0ZXRyaXMnLFxuICAgIHNoYXBlczogdGV0cmlzXG4gIH1cbl07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kSW50LCB3cmFwLCByYW5kb21Gcm9tLCBUaW1lciwgcHJpbWVHYW1lU3RhdGUsIGFuaW1hdGlvblRpbWVGb3JSb3dzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBhZGRWMiA9IHJlZiQuYWRkVjIsIHJhbmRJbnQgPSByZWYkLnJhbmRJbnQsIHdyYXAgPSByZWYkLndyYXAsIHJhbmRvbUZyb20gPSByZWYkLnJhbmRvbUZyb207XG5UaW1lciA9IHJlcXVpcmUoJy4uL3V0aWxzL3RpbWVyJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5jb3JlID0ge1xuICAgIHBhdXNlZDogZmFsc2UsXG4gICAgc2xvd2Rvd246IDEsXG4gICAgc29mdERyb3BNb2RlOiBmYWxzZSxcbiAgICByb3dzVG9SZW1vdmU6IFtdLFxuICAgIHJvd3NSZW1vdmVkVGhpc0ZyYW1lOiBmYWxzZSxcbiAgICBkcm9wVGltZXI6IFRpbWVyLmNyZWF0ZShcIkRyb3AgdGltZXJcIiwgb3B0aW9ucy5zdGFydGluZ0Ryb3BTcGVlZCwgdHJ1ZSksXG4gICAga2V5UmVwZWF0VGltZXI6IFRpbWVyLmNyZWF0ZShcIktleSByZXBlYXRcIiwgb3B0aW9ucy5rZXlSZXBlYXRUaW1lKSxcbiAgICBzb2Z0RHJvcFdhaXRUaW1lcjogVGltZXIuY3JlYXRlKFwiU29mdC1kcm9wIHdhaXQgdGltZVwiLCBvcHRpb25zLnNvZnREcm9wV2FpdFRpbWUpLFxuICAgIGhhcmREcm9wQW5pbWF0aW9uOiBUaW1lci5jcmVhdGUoXCJIYXJkLWRyb3AgYW5pbWF0aW9uXCIsIG9wdGlvbnMuYW5pbWF0aW9uLmhhcmREcm9wRWZmZWN0VGltZSksXG4gICAgcHJldmlld1JldmVhbEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiTmV4dCBicmljayBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24ucHJldmlld1JldmVhbFRpbWUpXG4gIH07XG59O1xub3V0JC5hbmltYXRpb25UaW1lRm9yUm93cyA9IGFuaW1hdGlvblRpbWVGb3JSb3dzID0gZnVuY3Rpb24ocm93cyl7XG4gIHJldHVybiAxMCArIE1hdGgucG93KDMsIHJvd3MubGVuZ3RoKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIFRpbWVyLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3Jlc3RhcnQnLFxuICAgIHRleHQ6IFwiUmVzdGFydFwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ2dvLWJhY2snLFxuICAgIHRleHQ6IFwiQmFjayB0byBNYWluXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ3MsIG9wdGlvbnMpe1xuICByZXR1cm4gZ3MuZ2FtZU92ZXIgPSB7XG4gICAgY3VycmVudEluZGV4OiAwLFxuICAgIGN1cnJlbnRTdGF0ZTogbWVudURhdGFbMF0sXG4gICAgbWVudURhdGE6IG1lbnVEYXRhLFxuICAgIHJldmVhbEFuaW1hdGlvbjogVGltZXIuY3JlYXRlKFwiR2FtZSBvdmVyIHJldmVhbCBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24uZ2FtZU92ZXJSZXZlYWxUaW1lKVxuICB9O1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24obXMsIGluZGV4KXtcbiAgbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVttcy5jdXJyZW50SW5kZXhdO1xufTtcbm91dCQuc2VsZWN0UHJldkl0ZW0gPSBzZWxlY3RQcmV2SXRlbSA9IGZ1bmN0aW9uKG1zKXtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihtcywgbXMuY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24obXMpe1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKG1zLCBtcy5jdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhbmQsIHJhbmRvbUZyb20sIENvcmUsIEFyZW5hLCBCcmljaywgU2NvcmUsIFN0YXJ0TWVudSwgR2FtZU92ZXIsIFRpbWVyLCBUZXRyaXNHYW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5BcmVuYSA9IHJlcXVpcmUoJy4vYXJlbmEnKTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpO1xuU2NvcmUgPSByZXF1aXJlKCcuL3Njb3JlJyk7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKTtcbkdhbWVPdmVyID0gcmVxdWlyZSgnLi9nYW1lLW92ZXInKTtcblRpbWVyID0gcmVxdWlyZSgnLi4vdXRpbHMvdGltZXInKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyl7XG4gICAgQ29yZS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBBcmVuYS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBCcmljay5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBTY29yZS5wcmltZUdhbWVTdGF0ZShnYW1lU3RhdGUsIGdhbWVPcHRpb25zKTtcbiAgICBTdGFydE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gICAgR2FtZU92ZXIucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlLCBnYW1lT3B0aW9ucyk7XG4gIH1cbiAgcHJvdG90eXBlLmJlZ2luTmV3R2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIEFyZW5hLmNsZWFyQXJlbmEoZ3MuYXJlbmEpO1xuICAgIFNjb3JlLnJlc2V0U2NvcmUoZ3Muc2NvcmUpO1xuICAgIEJyaWNrLnJlc2V0U3RhdGUoZ3MuYnJpY2spO1xuICAgIHJldHVybiBncztcbiAgfTtcbiAgcHJvdG90eXBlLnJldmVhbFN0YXJ0TWVudSA9IGZ1bmN0aW9uKGdzKXtcbiAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3N0YXJ0LW1lbnUnO1xuICAgIHJldHVybiBTdGFydE1lbnUuYmVnaW5SZXZlYWwoZ3MpO1xuICB9O1xuICBwcm90b3R5cGUucmV2ZWFsR2FtZU92ZXIgPSBmdW5jdGlvbihncyl7XG4gICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdmYWlsdXJlJztcbiAgICByZXR1cm4gVGltZXIucmVzZXQoZ3MuZ2FtZU92ZXIucmV2ZWFsQW5pbWF0aW9uKTtcbiAgfTtcbiAgcHJvdG90eXBlLmhhbmRsZUtleUlucHV0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0LCBscmVzdWx0JCwgcmVmJCwga2V5LCBhY3Rpb24sIGFtdCwgaSwgcG9zLCBpJCwgdG8kLCB5LCBscmVzdWx0MSQsIGokLCB0bzEkLCB4LCByZXN1bHRzJCA9IFtdO1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0ID0gZ3MuaW5wdXQ7XG4gICAgd2hpbGUgKGlucHV0Lmxlbmd0aCkge1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIHJlZiQgPSBpbnB1dC5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKEFyZW5hLmNhbk1vdmUoYnJpY2suY3VycmVudCwgWy0xLCAwXSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGJyaWNrLmN1cnJlbnQucG9zWzBdIC09IDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgIGlmIChBcmVuYS5jYW5Nb3ZlKGJyaWNrLmN1cnJlbnQsIFsxLCAwXSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGJyaWNrLmN1cnJlbnQucG9zWzBdICs9IDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChncy5jb3JlLnNvZnREcm9wTW9kZSA9IHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgIGNhc2UgJ2N3JzpcbiAgICAgICAgICBpZiAoQXJlbmEuY2FuUm90YXRlKGJyaWNrLmN1cnJlbnQsIDEsIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChCcmljay5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAxKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjY3cnOlxuICAgICAgICAgIGlmIChBcmVuYS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgLTEsIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChCcmljay5yb3RhdGVCcmljayhicmljay5jdXJyZW50LCAtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaGFyZC1kcm9wJzpcbiAgICAgICAgICBncy5jb3JlLmhhcmREcm9wRGlzdGFuY2UgPSAwO1xuICAgICAgICAgIHdoaWxlIChBcmVuYS5jYW5Ecm9wKGJyaWNrLmN1cnJlbnQsIGFyZW5hKSkge1xuICAgICAgICAgICAgZ3MuY29yZS5oYXJkRHJvcERpc3RhbmNlICs9IDE7XG4gICAgICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBncy5pbnB1dCA9IFtdO1xuICAgICAgICAgIFRpbWVyLnJlc2V0KGdzLmNvcmUuaGFyZERyb3BBbmltYXRpb24sIGdzLmNvcmUuaGFyZERyb3BEaXN0YW5jZSAqIDEwICsgMSk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChUaW1lci5zZXRUaW1lVG9FeHBpcnkoZ3MuY29yZS5kcm9wVGltZXIsIC0xKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTEnOlxuICAgICAgICBjYXNlICdkZWJ1Zy0yJzpcbiAgICAgICAgY2FzZSAnZGVidWctMyc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTQnOlxuICAgICAgICAgIGFtdCA9IHBhcnNlSW50KGtleS5yZXBsYWNlKC9cXEQvZywgJycpKTtcbiAgICAgICAgICBsb2coXCJERUJVRzogRGVzdHJveWluZyByb3dzOlwiLCBhbXQpO1xuICAgICAgICAgIGdzLmNvcmUucm93c1RvUmVtb3ZlID0gKGZuJCgpKTtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgICAgVGltZXIucmVzZXQoZ3MuYXJlbmEuemFwQW5pbWF0aW9uLCBDb3JlLmFuaW1hdGlvblRpbWVGb3JSb3dzKGdzLmNvcmUucm93c1RvUmVtb3ZlKSk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChTY29yZS51cGRhdGVTY29yZShncywgZ3MuY29yZS5yb3dzVG9SZW1vdmUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGVidWctNSc6XG4gICAgICAgICAgcG9zID0gZ3MuYnJpY2suY3VycmVudC5wb3M7XG4gICAgICAgICAgZ3MuYnJpY2suY3VycmVudCA9IEJyaWNrLm5ld0JyaWNrKDYpO1xuICAgICAgICAgIGltcG9ydCQoZ3MuYnJpY2suY3VycmVudC5wb3MsIHBvcyk7XG4gICAgICAgICAgZm9yIChpJCA9IGFyZW5hLmhlaWdodCAtIDEsIHRvJCA9IGFyZW5hLmhlaWdodCAtIDQ7IGkkID49IHRvJDsgLS1pJCkge1xuICAgICAgICAgICAgeSA9IGkkO1xuICAgICAgICAgICAgbHJlc3VsdDEkID0gW107XG4gICAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IGFyZW5hLndpZHRoIC0gMjsgaiQgPD0gdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgICB4ID0gaiQ7XG4gICAgICAgICAgICAgIGxyZXN1bHQxJC5wdXNoKGFyZW5hLmNlbGxzW3ldW3hdID0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGxyZXN1bHQxJCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy02JzpcbiAgICAgICAgICBncy5jb3JlLnJvd3NUb1JlbW92ZSA9IFsxMCwgMTIsIDE0XTtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChUaW1lci5yZXNldChncy5hcmVuYS56YXBBbmltYXRpb24sIENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3MuY29yZS5yb3dzVG9SZW1vdmUpKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAndXAnKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MuY29yZS5zb2Z0RHJvcE1vZGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgZnVuY3Rpb24gZm4kKCl7XG4gICAgICB2YXIgaSQsIHRvJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoaSQgPSBncy5hcmVuYS5oZWlnaHQgLSBhbXQsIHRvJCA9IGdzLmFyZW5hLmhlaWdodCAtIDE7IGkkIDw9IHRvJDsgKytpJCkge1xuICAgICAgICBpID0gaSQ7XG4gICAgICAgIHJlc3VsdHMkLnB1c2goaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuY2xlYXJPbmVGcmFtZUZsYWdzID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHJldHVybiBncy5jb3JlLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS56YXBUaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmIChncy5hcmVuYS56YXBBbmltYXRpb24uZXhwaXJlZCkge1xuICAgICAgQXJlbmEucmVtb3ZlUm93cyhncy5hcmVuYSwgZ3MuY29yZS5yb3dzVG9SZW1vdmUpO1xuICAgICAgZ3MuY29yZS5yb3dzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2dhbWUnO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLmdhbWVUaWNrID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBicmljaywgYXJlbmEsIGlucHV0LCBjb21wbGV0ZVJvd3MsIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgcm93O1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0ID0gZ3MuaW5wdXQ7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBhcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGlmIChBcmVuYS5yb3dJc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgcmVzJC5wdXNoKGl4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29tcGxldGVSb3dzID0gcmVzJDtcbiAgICBpZiAoY29tcGxldGVSb3dzLmxlbmd0aCkge1xuICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSA9IHRydWU7XG4gICAgICBncy5jb3JlLnJvd3NUb1JlbW92ZSA9IGNvbXBsZXRlUm93cztcbiAgICAgIFRpbWVyLnJlc2V0KGdzLmFyZW5hLnphcEFuaW1hdGlvbiwgQ29yZS5hbmltYXRpb25UaW1lRm9yUm93cyhncy5jb3JlLnJvd3NUb1JlbW92ZSkpO1xuICAgICAgU2NvcmUudXBkYXRlU2NvcmUoZ3MsIGdzLmNvcmUucm93c1RvUmVtb3ZlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKEFyZW5hLnRvcElzUmVhY2hlZChhcmVuYSkpIHtcbiAgICAgIHRoaXMucmV2ZWFsR2FtZU92ZXIoZ3MpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZ3MuY29yZS5zb2Z0RHJvcE1vZGUpIHtcbiAgICAgIFRpbWVyLnNldFRpbWVUb0V4cGlyeShncy5jb3JlLmRyb3BUaW1lciwgMCk7XG4gICAgfVxuICAgIGlmIChncy5jb3JlLmRyb3BUaW1lci5leHBpcmVkKSB7XG4gICAgICBUaW1lci5yZXNldFdpdGhSZW1haW5kZXIoZ3MuY29yZS5kcm9wVGltZXIpO1xuICAgICAgaWYgKEFyZW5hLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBBcmVuYS5jb3B5QnJpY2tUb0FyZW5hKGJyaWNrLmN1cnJlbnQsIGFyZW5hKTtcbiAgICAgICAgQnJpY2suc3Bhd25OZXdCcmljayhncyk7XG4gICAgICAgIFRpbWVyLnJlc2V0KGdzLmNvcmUucHJldmlld1JldmVhbEFuaW1hdGlvbik7XG4gICAgICAgIGdzLmNvcmUuc29mdERyb3BNb2RlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhhbmRsZUtleUlucHV0KGdzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmdhbWVPdmVyVGljayA9IGZ1bmN0aW9uKGdzLCDOlHQpe1xuICAgIHZhciBpbnB1dCwgZ2FtZU92ZXIsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0ID0gZ3MuaW5wdXQsIGdhbWVPdmVyID0gZ3MuZ2FtZU92ZXI7XG4gICAgd2hpbGUgKGlucHV0Lmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0LnNoaWZ0KCksIGtleSA9IHJlZiQua2V5LCBhY3Rpb24gPSByZWYkLmFjdGlvbjtcbiAgICAgIGlmIChhY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChHYW1lT3Zlci5zZWxlY3RQcmV2SXRlbShnYW1lT3ZlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKEdhbWVPdmVyLnNlbGVjdE5leHRJdGVtKGdhbWVPdmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgaWYgKGdhbWVPdmVyLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3Jlc3RhcnQnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChnYW1lT3Zlci5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdnby1iYWNrJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJldmVhbFN0YXJ0TWVudShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuc3RhcnRNZW51VGljayA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXQsIHN0YXJ0TWVudSwgcmVmJCwga2V5LCBhY3Rpb24sIHJlc3VsdHMkID0gW107XG4gICAgaW5wdXQgPSBncy5pbnB1dCwgc3RhcnRNZW51ID0gZ3Muc3RhcnRNZW51O1xuICAgIHdoaWxlIChpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHJlZiQgPSBpbnB1dC5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goU3RhcnRNZW51LnNlbGVjdFByZXZJdGVtKHN0YXJ0TWVudSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICBpZiAoc3RhcnRNZW51LmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3N0YXJ0LWdhbWUnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzLCBhcmckKXtcbiAgICB2YXIgzpR0LCB0aW1lLCBmcmFtZSwgZnBzLCBpbnB1dDtcbiAgICDOlHQgPSBhcmckLs6UdCwgdGltZSA9IGFyZyQudGltZSwgZnJhbWUgPSBhcmckLmZyYW1lLCBmcHMgPSBhcmckLmZwcywgaW5wdXQgPSBhcmckLmlucHV0O1xuICAgIGdzLmZwcyA9IGZwcztcbiAgICBncy7OlHQgPSDOlHQ7XG4gICAgZ3MuZWxhcHNlZFRpbWUgPSB0aW1lO1xuICAgIGdzLmVsYXBzZWRGcmFtZXMgPSBmcmFtZTtcbiAgICBncy5pbnB1dCA9IGlucHV0O1xuICAgIGlmICghZ3MuY29yZS5wYXVzZWQpIHtcbiAgICAgIFRpbWVyLnVwZGF0ZUFsbEluKGdzLCDOlHQpO1xuICAgIH1cbiAgICB0aGlzLmNsZWFyT25lRnJhbWVGbGFncyhncyk7XG4gICAgc3dpdGNoIChncy5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnbm8tZ2FtZSc6XG4gICAgICB0aGlzLnJldmVhbFN0YXJ0TWVudS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICB0aGlzLmdhbWVUaWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMuZ2FtZU92ZXJUaWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHRoaXMuc3RhcnRNZW51VGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHRoaXMuemFwVGljay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1Vua25vd24gbWV0YWdhbWUtc3RhdGU6JywgZ3MubWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBncztcbiAgfTtcbiAgcmV0dXJuIFRldHJpc0dhbWU7XG59KCkpO1xuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgYWRkVjIsIHJhbmRJbnQsIHdyYXAsIHJhbmRvbUZyb20sIEJyaWNrU2hhcGVzLCBwcmltZUdhbWVTdGF0ZSwgY29tcHV0ZVNjb3JlLCB1cGRhdGVTY29yZSwgcmVzZXRTY29yZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLnByaW1lR2FtZVN0YXRlID0gcHJpbWVHYW1lU3RhdGUgPSBmdW5jdGlvbihncywgb3B0aW9ucyl7XG4gIHJldHVybiBncy5zY29yZSA9IHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwXG4gIH07XG59O1xub3V0JC5jb21wdXRlU2NvcmUgPSBjb21wdXRlU2NvcmUgPSBmdW5jdGlvbihyb3dzLCBsdmwpe1xuICBsdmwgPT0gbnVsbCAmJiAobHZsID0gMCk7XG4gIHN3aXRjaCAocm93cy5sZW5ndGgpIHtcbiAgY2FzZSAxOlxuICAgIHJldHVybiA0MCAqIChsdmwgKyAxKTtcbiAgY2FzZSAyOlxuICAgIHJldHVybiAxMDAgKiAobHZsICsgMSk7XG4gIGNhc2UgMzpcbiAgICByZXR1cm4gMzAwICogKGx2bCArIDEpO1xuICBjYXNlIDQ6XG4gICAgcmV0dXJuIDEyMDAgKiAobHZsICsgMSk7XG4gIH1cbn07XG5vdXQkLnVwZGF0ZVNjb3JlID0gdXBkYXRlU2NvcmUgPSBmdW5jdGlvbihhcmckLCByb3dzLCBsdmwpe1xuICB2YXIgc2NvcmUsIHBvaW50cywgbGluZXM7XG4gIHNjb3JlID0gYXJnJC5zY29yZTtcbiAgbHZsID09IG51bGwgJiYgKGx2bCA9IDApO1xuICBwb2ludHMgPSBjb21wdXRlU2NvcmUocm93cywgbHZsKTtcbiAgc2NvcmUucG9pbnRzICs9IHBvaW50cztcbiAgc2NvcmUubGluZXMgKz0gbGluZXMgPSByb3dzLmxlbmd0aDtcbiAgc3dpdGNoIChsaW5lcykge1xuICBjYXNlIDE6XG4gICAgcmV0dXJuIHNjb3JlLnNpbmdsZXMgKz0gMTtcbiAgY2FzZSAyOlxuICAgIHJldHVybiBzY29yZS5kb3VibGVzICs9IDE7XG4gIGNhc2UgMzpcbiAgICByZXR1cm4gc2NvcmUudHJpcGxlcyArPSAxO1xuICBjYXNlIDQ6XG4gICAgcmV0dXJuIHNjb3JlLnRldHJpcyArPSAxO1xuICB9XG59O1xub3V0JC5yZXNldFNjb3JlID0gcmVzZXRTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcbiAgcmV0dXJuIGltcG9ydCQoc2NvcmUsIHtcbiAgICBwb2ludHM6IDAsXG4gICAgbGluZXM6IDAsXG4gICAgc2luZ2xlczogMCxcbiAgICBkb3VibGVzOiAwLFxuICAgIHRyaXBsZXM6IDAsXG4gICAgdGV0cmlzOiAwXG4gIH0pO1xufTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIFRpbWVyLCBtZW51RGF0YSwgbGltaXRlciwgcHJpbWVHYW1lU3RhdGUsIHVwZGF0ZSwgYmVnaW5SZXZlYWwsIGNob29zZU9wdGlvbiwgc2VsZWN0UHJldkl0ZW0sIHNlbGVjdE5leHRJdGVtLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB3cmFwID0gcmVmJC53cmFwO1xuVGltZXIgPSByZXF1aXJlKCcuLi91dGlscy90aW1lcicpO1xubWVudURhdGEgPSBbXG4gIHtcbiAgICBzdGF0ZTogJ3N0YXJ0LWdhbWUnLFxuICAgIHRleHQ6IFwiU3RhcnQgR2FtZVwiXG4gIH0sIHtcbiAgICBzdGF0ZTogJ25vdGhpbmcnLFxuICAgIHRleHQ6IFwiRG9uJ3QgU3RhcnQgR2FtZVwiXG4gIH1cbl07XG5saW1pdGVyID0gd3JhcCgwLCBtZW51RGF0YS5sZW5ndGggLSAxKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdzLCBvcHRpb25zKXtcbiAgcmV0dXJuIGdzLnN0YXJ0TWVudSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGEsXG4gICAgdGl0bGVSZXZlYWxBbmltYXRpb246IFRpbWVyLmNyZWF0ZShcIlRpdGxlIHJldmVhbCBhbmltYXRpb25cIiwgb3B0aW9ucy5hbmltYXRpb24udGl0bGVSZXZlYWxUaW1lKVxuICB9O1xufTtcbm91dCQudXBkYXRlID0gdXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICByZXR1cm4gaGFuZGxlSW5wdXQoZ3MsIGdzLmlucHV0KTtcbn07XG5vdXQkLmJlZ2luUmV2ZWFsID0gYmVnaW5SZXZlYWwgPSBmdW5jdGlvbihncyl7XG4gIHJldHVybiBUaW1lci5yZXNldChncy5zdGFydE1lbnUudGl0bGVSZXZlYWxBbmltYXRpb24pO1xufTtcbm91dCQuY2hvb3NlT3B0aW9uID0gY2hvb3NlT3B0aW9uID0gZnVuY3Rpb24oc21zLCBpbmRleCl7XG4gIHNtcy5jdXJyZW50SW5kZXggPSBsaW1pdGVyKGluZGV4KTtcbiAgcmV0dXJuIHNtcy5jdXJyZW50U3RhdGUgPSBtZW51RGF0YVtzbXMuY3VycmVudEluZGV4XTtcbn07XG5vdXQkLnNlbGVjdFByZXZJdGVtID0gc2VsZWN0UHJldkl0ZW0gPSBmdW5jdGlvbihzbXMpe1xuICB2YXIgY3VycmVudEluZGV4O1xuICBjdXJyZW50SW5kZXggPSBzbXMuY3VycmVudEluZGV4O1xuICByZXR1cm4gY2hvb3NlT3B0aW9uKHNtcywgY3VycmVudEluZGV4IC0gMSk7XG59O1xub3V0JC5zZWxlY3ROZXh0SXRlbSA9IHNlbGVjdE5leHRJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCArIDEpO1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHJhbmQsIGZsb29yLCBCYXNlLCBNYXRlcmlhbHMsIEFyZW5hQ2VsbHMsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkFyZW5hQ2VsbHMgPSBBcmVuYUNlbGxzID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYUNlbGxzLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdBcmVuYUNlbGxzJywgQXJlbmFDZWxscyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYUNlbGxzO1xuICBmdW5jdGlvbiBBcmVuYUNlbGxzKG9wdHMsIGdzKXtcbiAgICB2YXIgYmxvY2tTaXplLCBncmlkU2l6ZSwgd2lkdGgsIGhlaWdodCwgbWFyZ2luLCBib3hHZW8sIHJlZiQsIHJlcyQsIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIGN1YmU7XG4gICAgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemUsIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZTtcbiAgICBBcmVuYUNlbGxzLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB3aWR0aCA9IGdyaWRTaXplICogZ3MuYXJlbmEud2lkdGg7XG4gICAgaGVpZ2h0ID0gZ3JpZFNpemUgKiBncy5hcmVuYS5oZWlnaHQ7XG4gICAgbWFyZ2luID0gKGdyaWRTaXplIC0gYmxvY2tTaXplKSAvIDI7XG4gICAgYm94R2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJsb2NrU2l6ZSwgYmxvY2tTaXplLCBibG9ja1NpemUpO1xuICAgIHRoaXMub2Zmc2V0ID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLm9mZnNldCk7XG4gICAgcmVmJCA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uO1xuICAgIHJlZiQueCA9IHdpZHRoIC8gLTIgKyAwLjUgKiBncmlkU2l6ZTtcbiAgICByZWYkLnkgPSBoZWlnaHQgLSAwLjUgKiBncmlkU2l6ZTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gcGk7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBncy5hcmVuYS5jZWxscykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgY3ViZSA9IG5ldyBUSFJFRS5NZXNoKGJveEdlbywgTWF0ZXJpYWxzLm5vcm1hbCk7XG4gICAgICAgIGN1YmUucG9zaXRpb24uc2V0KHggKiBncmlkU2l6ZSwgeSAqIGdyaWRTaXplLCAwKTtcbiAgICAgICAgY3ViZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMub2Zmc2V0LmFkZChjdWJlKTtcbiAgICAgICAgbHJlc3VsdCQucHVzaChjdWJlKTtcbiAgICAgIH1cbiAgICAgIHJlcyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHRoaXMuY2VsbHMgPSByZXMkO1xuICB9XG4gIHByb3RvdHlwZS50b2dnbGVSb3dPZkNlbGxzID0gZnVuY3Rpb24ocm93SXgsIHN0YXRlKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGJveCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5jZWxsc1tyb3dJeF0pLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBib3ggPSByZWYkW2kkXTtcbiAgICAgIGJveC5tYXRlcmlhbCA9IE1hdGVyaWFscy56YXA7XG4gICAgICByZXN1bHRzJC5wdXNoKGJveC52aXNpYmxlID0gc3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93WmFwRWZmZWN0ID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBhcmVuYSwgY29yZSwgb25PZmYsIGkkLCByZWYkLCBsZW4kLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCBjb3JlID0gZ3MuY29yZTtcbiAgICBvbk9mZiA9IGFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcyA8IDAuNCAmJiAhIShmbG9vcihhcmVuYS56YXBBbmltYXRpb24uY3VycmVudFRpbWUgKiAxMCkgJSAyKTtcbiAgICBvbk9mZiA9ICEoZmxvb3IoYXJlbmEuemFwQW5pbWF0aW9uLmN1cnJlbnRUaW1lKSAlIDIpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBjb3JlLnJvd3NUb1JlbW92ZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvd0l4ID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMudG9nZ2xlUm93T2ZDZWxscyhyb3dJeCwgb25PZmYpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlQ2VsbHMgPSBmdW5jdGlvbihjZWxscyl7XG4gICAgdmFyIGkkLCBsZW4kLCB5LCByb3csIGxyZXN1bHQkLCBqJCwgbGVuMSQsIHgsIGNlbGwsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBjZWxscy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gY2VsbHNbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgdGhpcy5jZWxsc1t5XVt4XS52aXNpYmxlID0gISFjZWxsO1xuICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMuY2VsbHNbeV1beF0ubWF0ZXJpYWwgPSBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBBcmVuYUNlbGxzO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgbWF4LCByYW5kLCBCYXNlLCBGcmFtZSwgRmFsbGluZ0JyaWNrLCBHdWlkZSwgQXJlbmFDZWxscywgUGFydGljbGVFZmZlY3QsIEFyZW5hLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBtYXggPSByZWYkLm1heCwgcmFuZCA9IHJlZiQucmFuZDtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuRnJhbWUgPSByZXF1aXJlKCcuL2ZyYW1lJykuRnJhbWU7XG5GYWxsaW5nQnJpY2sgPSByZXF1aXJlKCcuL2ZhbGxpbmctYnJpY2snKS5GYWxsaW5nQnJpY2s7XG5HdWlkZSA9IHJlcXVpcmUoJy4vZ3VpZGUnKS5HdWlkZTtcbkFyZW5hQ2VsbHMgPSByZXF1aXJlKCcuL2FyZW5hLWNlbGxzJykuQXJlbmFDZWxscztcblBhcnRpY2xlRWZmZWN0ID0gcmVxdWlyZSgnLi9wYXJ0aWNsZS1lZmZlY3QnKS5QYXJ0aWNsZUVmZmVjdDtcbm91dCQuQXJlbmEgPSBBcmVuYSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmEsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0FyZW5hJywgQXJlbmEpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmE7XG4gIGZ1bmN0aW9uIEFyZW5hKG9wdHMsIGdzKXtcbiAgICB2YXIgbmFtZSwgcmVmJCwgcGFydDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEFyZW5hLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBsb2coJ1JlbmRlcmVyOjpBcmVuYTo6bmV3Jyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGZyYW1lc1NpbmNlUm93c1JlbW92ZWQ6IDBcbiAgICB9O1xuICAgIHRoaXMucGFydHMgPSB7XG4gICAgICBmcmFtZTogbmV3IEZyYW1lKHRoaXMub3B0cywgZ3MpLFxuICAgICAgZ3VpZGU6IG5ldyBHdWlkZSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hQ2VsbHM6IG5ldyBBcmVuYUNlbGxzKHRoaXMub3B0cywgZ3MpLFxuICAgICAgdGhpc0JyaWNrOiBuZXcgRmFsbGluZ0JyaWNrKHRoaXMub3B0cywgZ3MpLFxuICAgICAgcGFydGljbGVzOiBuZXcgUGFydGljbGVFZmZlY3QodGhpcy5vcHRzLCBncylcbiAgICB9O1xuICAgIGZvciAobmFtZSBpbiByZWYkID0gdGhpcy5wYXJ0cykge1xuICAgICAgcGFydCA9IHJlZiRbbmFtZV07XG4gICAgICBwYXJ0LmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IHRoaXMub3B0cy5hcmVuYU9mZnNldEZyb21DZW50cmU7XG4gIH1cbiAgcHJvdG90eXBlLmpvbHQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHAsIHp6LCBqb2x0O1xuICAgIHAgPSBtYXgoMCwgMSAtIGdzLmFyZW5hLmpvbHRBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIHp6ID0gZ3MuY29yZS5yb3dzVG9SZW1vdmUubGVuZ3RoO1xuICAgIHJldHVybiBqb2x0ID0gLTEgKiBwICogKDEgKyB6eikgKiB0aGlzLm9wdHMuaGFyZERyb3BKb2x0QW1vdW50O1xuICB9O1xuICBwcm90b3R5cGUuaml0dGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBwLCB6eiwgaml0dGVyO1xuICAgIHAgPSAxIC0gZ3MuYXJlbmEuemFwQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgIHp6ID0gZ3MuY29yZS5yb3dzVG9SZW1vdmUubGVuZ3RoICogdGhpcy5vcHRzLmdyaWRTaXplIC8gNDA7XG4gICAgcmV0dXJuIGppdHRlciA9IFtwICogcmFuZCgtenosIHp6KSwgcCAqIHJhbmQoLXp6LCB6eildO1xuICB9O1xuICBwcm90b3R5cGUuemFwTGluZXMgPSBmdW5jdGlvbihncywgcG9zaXRpb25SZWNlaXZpbmdKb2x0KXtcbiAgICB2YXIgam9sdCwgaml0dGVyO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy5zaG93WmFwRWZmZWN0KGdzKTtcbiAgICBpZiAoZ3MuY29yZS5yb3dzUmVtb3ZlZFRoaXNGcmFtZSkge1xuICAgICAgdGhpcy5wYXJ0cy5wYXJ0aWNsZXMucmVzZXQoKTtcbiAgICAgIHRoaXMucGFydHMucGFydGljbGVzLnByZXBhcmUoZ3MuY29yZS5yb3dzVG9SZW1vdmUpO1xuICAgICAgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkID0gMDtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5ndWlkZS5zaG93RmxhcmUoZ3MuYXJlbmEuam9sdEFuaW1hdGlvbi5wcm9ncmVzcyk7XG4gICAgam9sdCA9IHRoaXMuam9sdChncyk7XG4gICAgaml0dGVyID0gdGhpcy5qaXR0ZXIoZ3MpO1xuICAgIHBvc2l0aW9uUmVjZWl2aW5nSm9sdC54ID0gaml0dGVyWzBdO1xuICAgIHJldHVybiBwb3NpdGlvblJlY2VpdmluZ0pvbHQueSA9IGppdHRlclsxXSArIGpvbHQgLyAxMDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVBhcnRpY2xlcyA9IGZ1bmN0aW9uKGdzKXtcbiAgICByZXR1cm4gdGhpcy5wYXJ0cy5wYXJ0aWNsZXMudXBkYXRlKGdzLmFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcywgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkLCBncy7OlHQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3MsIHBvc2l0aW9uUmVjZWl2aW5nSm9sdCl7XG4gICAgdmFyIGFyZW5hLCBicmljaztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCBicmljayA9IGdzLmJyaWNrO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy51cGRhdGVDZWxscyhhcmVuYS5jZWxscyk7XG4gICAgdGhpcy5wYXJ0cy50aGlzQnJpY2suZGlzcGxheVNoYXBlKGJyaWNrLmN1cnJlbnQpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLnVwZGF0ZVBvc2l0aW9uKGJyaWNrLmN1cnJlbnQucG9zKTtcbiAgICB0aGlzLnBhcnRzLmd1aWRlLnNob3dCZWFtKGJyaWNrLmN1cnJlbnQpO1xuICAgIHRoaXMucGFydHMuZ3VpZGUuc2hvd0ZsYXJlKGdzLmNvcmUuaGFyZERyb3BBbmltYXRpb24ucHJvZ3Jlc3MsIGdzLmNvcmUuaGFyZERyb3BEaXN0YW5jZSk7XG4gICAgcG9zaXRpb25SZWNlaXZpbmdKb2x0LnkgPSB0aGlzLmpvbHQoZ3MpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmZyYW1lc1NpbmNlUm93c1JlbW92ZWQgKz0gMTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgTWF0ZXJpYWxzLCBCYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5CYXNlID0gQmFzZSA9IChmdW5jdGlvbigpe1xuICBCYXNlLmRpc3BsYXlOYW1lID0gJ0Jhc2UnO1xuICB2YXIgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBCYXNlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCYXNlO1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDAuMDIsIDAuMDIsIDAuMDIpO1xuICBmdW5jdGlvbiBCYXNlKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMucm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc3RhcnQsIGVuZCwgZGlzdGFuY2UsIGRpciwgYXJyb3c7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJBKSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgICBzdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xuICAgIGVuZCA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uO1xuICAgIGRpc3RhbmNlID0gc3RhcnQuZGlzdGFuY2VUbyhlbmQpO1xuICAgIGlmIChkaXN0YW5jZSA+IDApIHtcbiAgICAgIGRpciA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuc3ViVmVjdG9ycyhlbmQsIHN0YXJ0KS5ub3JtYWxpemUoKTtcbiAgICAgIGFycm93ID0gbmV3IFRIUkVFLkFycm93SGVscGVyKGRpciwgc3RhcnQsIGRpc3RhbmNlLCAweDAwMDBmZik7XG4gICAgICB0aGlzLnJvb3QuYWRkKGFycm93KTtcbiAgICB9XG4gICAgcmV0dXJuIGxvZygnUmVnaXN0cmF0aW9uIGhlbHBlciBhdCcsIHRoaXMpO1xuICB9O1xuICBwcm90b3R5cGUuYWRkQm94SGVscGVyID0gZnVuY3Rpb24odGhpbmcpe1xuICAgIHZhciBiYm94O1xuICAgIGJib3ggPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpbmcsIDB4NTU1NWZmKTtcbiAgICBiYm94LnVwZGF0ZSgpO1xuICAgIHJldHVybiB0aGlzLnJvb3QuYWRkKGJib3gpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXt9O1xuICBwcm90b3R5cGUuc2hvd0JvdW5kcyA9IGZ1bmN0aW9uKHNjZW5lKXtcbiAgICB0aGlzLmJvdW5kcyA9IG5ldyBUSFJFRS5Cb3VuZGluZ0JveEhlbHBlcih0aGlzLnJvb3QsIDB4NTU1NTU1KTtcbiAgICB0aGlzLmJvdW5kcy51cGRhdGUoKTtcbiAgICByZXR1cm4gc2NlbmUuYWRkKHRoaXMuYm91bmRzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZFRvID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gb2JqLmFkZCh0aGlzLnJvb3QpO1xuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncG9zaXRpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC5wb3NpdGlvbjtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndmlzaWJsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5yb290LnZpc2libGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICAgIHRoaXMucm9vdC52aXNpYmxlID0gc3RhdGU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIEJhc2U7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIG1pbiwgQmFzZSwgQnJpY2ssIEVhc2UsIEJyaWNrUHJldmlldywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW4sIG1pbiA9IHJlZiQubWluO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKS5CcmljaztcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xub3V0JC5Ccmlja1ByZXZpZXcgPSBCcmlja1ByZXZpZXcgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBnbGFzc01hdCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmlja1ByZXZpZXcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrUHJldmlldycsIEJyaWNrUHJldmlldyksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmlja1ByZXZpZXc7XG4gIGdsYXNzTWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgyMjIyMjIsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICAgIHNoaW5pbmVzczogMTAwLFxuICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlXG4gIH0pO1xuICBmdW5jdGlvbiBCcmlja1ByZXZpZXcob3B0cywgZ3Mpe1xuICAgIHZhciB0dWJlUmFkaXVzLCB0dWJlSGVpZ2h0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQnJpY2tQcmV2aWV3LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnMgPSB0aGlzLm9wdHMucHJldmlld1NjYWxlRmFjdG9yO1xuICAgIHRoaXMuY29sb3IgPSAweGZmZmZmZjtcbiAgICB0dWJlUmFkaXVzID0gdGhpcy5vcHRzLnByZXZpZXdEb21lUmFkaXVzO1xuICAgIHR1YmVIZWlnaHQgPSB0aGlzLm9wdHMucHJldmlld0RvbWVIZWlnaHQ7XG4gICAgdGhpcy5icmljayA9IG5ldyBCcmljayh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLmJyaWNrLnJvb3Quc2NhbGUuc2V0KHRoaXMucywgdGhpcy5zLCB0aGlzLnMpO1xuICAgIHRoaXMuYnJpY2sucm9vdC5wb3NpdGlvbi55ID0gdGhpcy5vcHRzLmdyaWRTaXplICogMjtcbiAgICB0aGlzLmJyaWNrLnJvb3QucG9zaXRpb24ueCA9IDA7XG4gICAgdGhpcy5kb21lID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSh0dWJlUmFkaXVzLCAxNiwgdHViZUhlaWdodCwgMCksIGdsYXNzTWF0KTtcbiAgICB0aGlzLmRvbWUucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5iYXNlID0gdm9pZCA4O1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgnb3JhbmdlJywgMSwgMC41KTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0IC8gMjtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5kb21lKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5saWdodCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2sucm9vdCk7XG4gIH1cbiAgcHJvdG90eXBlLmRpc3BsYXlOb3RoaW5nID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJyaWNrLnZpc2libGUgPSBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5saWdodC5pbnRlbnNpdHkgPSAwO1xuICB9O1xuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHRoaXMuYnJpY2sudmlzaWJsZSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2sucHJldHR5RGlzcGxheVNoYXBlKGJyaWNrKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVdpZ2dsZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgZWxhcHNlZFRpbWUsIHQsIHA7XG4gICAgZWxhcHNlZFRpbWUgPSBncy5lbGFwc2VkVGltZTtcbiAgICB0aGlzLnJvb3Qucm90YXRpb24ueSA9IDAuMiAqIHNpbihlbGFwc2VkVGltZSAvIDUwMCk7XG4gICAgdCA9IG1pbigxLCBncy5jb3JlLnByZXZpZXdSZXZlYWxBbmltYXRpb24ucHJvZ3Jlc3MpO1xuICAgIHAgPSBFYXNlLmN1YmljSW4odCwgMCwgdGhpcy5zKTtcbiAgICB0aGlzLmJyaWNrLnJvb3Quc2NhbGUuc2V0KHAsIHAsIHApO1xuICAgIGlmICh0ID09PSAwKSB7XG4gICAgICB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDM7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5jb2xvci5zZXRIZXgoMHhmZmZmZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IHQ7XG4gICAgICByZXR1cm4gdGhpcy5saWdodC5jb2xvci5zZXRIZXgoMHhmZmJiMjIpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIEJyaWNrUHJldmlldztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGRpdiwgcGksIEJhc2UsIE1hdGVyaWFscywgQnJpY2ssIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGRpdiA9IHJlZiQuZGl2LCBwaSA9IHJlZiQucGk7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuQnJpY2sgPSBCcmljayA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByZXR0eU9mZnNldCwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChCcmljaywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQnJpY2snLCBCcmljayksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCcmljaztcbiAgcHJldHR5T2Zmc2V0ID0ge1xuICAgIHNxdWFyZTogWy0yLCAtMl0sXG4gICAgemlnOiBbLTEuNSwgLTJdLFxuICAgIHphZzogWy0xLjUsIC0yXSxcbiAgICBsZWZ0OiBbLTEuNSwgLTJdLFxuICAgIHJpZ2h0OiBbLTEuNSwgLTJdLFxuICAgIHRlZTogWy0xLjUsIC0yXSxcbiAgICB0ZXRyaXM6IFstMiwgLTIuNV1cbiAgfTtcbiAgZnVuY3Rpb24gQnJpY2sob3B0cywgZ3Mpe1xuICAgIHZhciBzaXplLCBncmlkLCBibG9ja0dlbywgcmVzJCwgaSQsIGksIGN1YmU7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBCcmljay5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgc2l6ZSA9IHRoaXMub3B0cy5ibG9ja1NpemU7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICB0aGlzLmJyaWNrID0gbmV3IFRIUkVFLk9iamVjdDNEO1xuICAgIHRoaXMuZnJhbWUgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNCAqIGdyaWQsIDQgKiBncmlkLCBncmlkKSwgTWF0ZXJpYWxzLmRlYnVnV2lyZWZyYW1lKTtcbiAgICBibG9ja0dlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShzaXplLCBzaXplLCBzaXplKTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDM7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChibG9ja0dlbywgTWF0ZXJpYWxzLm5vcm1hbCk7XG4gICAgICB0aGlzLmJyaWNrLmFkZChjdWJlKTtcbiAgICAgIHJlcyQucHVzaChjdWJlKTtcbiAgICB9XG4gICAgdGhpcy5jZWxscyA9IHJlcyQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KDAgKiBncmlkLCAtMC41ICogZ3JpZCwgMCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IHBpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJyaWNrKTtcbiAgfVxuICBwcm90b3R5cGUucHJldHR5RGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHJldHVybiB0aGlzLmRpc3BsYXlTaGFwZShicmljaywgdHJ1ZSk7XG4gIH07XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihhcmckLCBwcmV0dHkpe1xuICAgIHZhciBzaGFwZSwgdHlwZSwgaXgsIGdyaWQsIG1hcmdpbiwgb2Zmc2V0LCBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCB4JCwgcmVzdWx0cyQgPSBbXTtcbiAgICBzaGFwZSA9IGFyZyQuc2hhcGUsIHR5cGUgPSBhcmckLnR5cGU7XG4gICAgcHJldHR5ID09IG51bGwgJiYgKHByZXR0eSA9IGZhbHNlKTtcbiAgICBpeCA9IDA7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBtYXJnaW4gPSAodGhpcy5vcHRzLmdyaWRTaXplIC0gdGhpcy5vcHRzLmJsb2NrU2l6ZSkgLyAyO1xuICAgIG9mZnNldCA9IHByZXR0eVxuICAgICAgPyBwcmV0dHlPZmZzZXRbdHlwZV1cbiAgICAgIDogWy0yLCAtMl07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBzaGFwZS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gc2hhcGVbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICB4JCA9IHRoaXMuY2VsbHNbaXgrK107XG4gICAgICAgICAgeCQucG9zaXRpb24ueCA9IChvZmZzZXRbMF0gKyAwLjUgKyB4KSAqIGdyaWQgKyBtYXJnaW47XG4gICAgICAgICAgeCQucG9zaXRpb24ueSA9IChvZmZzZXRbMV0gKyAwLjUgKyB5KSAqIGdyaWQgKyBtYXJnaW47XG4gICAgICAgICAgeCQubWF0ZXJpYWwgPSBNYXRlcmlhbHMuYmxvY2tzW2NlbGxdO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2goeCQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gQnJpY2s7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBtYXgsIEJhc2UsIEZhaWxTY3JlZW4sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIG1heCA9IHJlZiQubWF4O1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5vdXQkLkZhaWxTY3JlZW4gPSBGYWlsU2NyZWVuID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGYWlsU2NyZWVuLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGYWlsU2NyZWVuJywgRmFpbFNjcmVlbiksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGYWlsU2NyZWVuO1xuICBmdW5jdGlvbiBGYWlsU2NyZWVuKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEZhaWxTY3JlZW4uc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGxvZyhcIkZhaWxTY3JlZW46Om5ld1wiKTtcbiAgfVxuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe307XG4gIHJldHVybiBGYWlsU2NyZWVuO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBCYXNlLCBCcmljaywgRmFsbGluZ0JyaWNrLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQnJpY2sgPSByZXF1aXJlKCcuL2JyaWNrJykuQnJpY2s7XG5vdXQkLkZhbGxpbmdCcmljayA9IEZhbGxpbmdCcmljayA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoRmFsbGluZ0JyaWNrLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdGYWxsaW5nQnJpY2snLCBGYWxsaW5nQnJpY2spLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRmFsbGluZ0JyaWNrO1xuICBmdW5jdGlvbiBGYWxsaW5nQnJpY2sob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRmFsbGluZ0JyaWNrLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLmdyaWQgPSBvcHRzLmdyaWRTaXplO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5ncmlkICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2sodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYnJpY2sucm9vdCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IC0zICogdGhpcy5ncmlkO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSAtMS41ICogdGhpcy5ncmlkO1xuICB9XG4gIHByb3RvdHlwZS5kaXNwbGF5U2hhcGUgPSBmdW5jdGlvbihicmljayl7XG4gICAgcmV0dXJuIHRoaXMuYnJpY2suZGlzcGxheVNoYXBlKGJyaWNrKTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZVBvc2l0aW9uID0gZnVuY3Rpb24ocG9zKXtcbiAgICB2YXIgeCwgeTtcbiAgICB4ID0gcG9zWzBdLCB5ID0gcG9zWzFdO1xuICAgIHJldHVybiB0aGlzLnJvb3QucG9zaXRpb24uc2V0KHRoaXMuZ3JpZCAqIHgsIHRoaXMuaGVpZ2h0IC0gdGhpcy5ncmlkICogeSwgMCk7XG4gIH07XG4gIHJldHVybiBGYWxsaW5nQnJpY2s7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBGcmFtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5GcmFtZSA9IEZyYW1lID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChGcmFtZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRnJhbWUnLCBGcmFtZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZTtcbiAgZnVuY3Rpb24gRnJhbWUob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgRnJhbWUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG4gIHJldHVybiBGcmFtZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxvZywgZmxvb3IsIEJhc2UsIE1hdGVyaWFscywgUGFsZXR0ZSwgR3VpZGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgc2luID0gcmVmJC5zaW4sIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcblBhbGV0dGUgPSByZXF1aXJlKCcuLi9wYWxldHRlJyk7XG5vdXQkLkd1aWRlID0gR3VpZGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcmV0dHlPZmZzZXQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoR3VpZGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0d1aWRlJywgR3VpZGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gR3VpZGU7XG4gIHByZXR0eU9mZnNldCA9IHtcbiAgICBzcXVhcmU6IFszXSxcbiAgICB6aWc6IFsyLCAyXSxcbiAgICB6YWc6IFsyLCAyXSxcbiAgICBsZWZ0OiBbMiwgMSwgMiwgM10sXG4gICAgcmlnaHQ6IFsyLCAzLCAyLCAxXSxcbiAgICB0ZWU6IFsyLCAyLCAyLCAyXSxcbiAgICB0ZXRyaXM6IFszLCA0XVxuICB9O1xuICBmdW5jdGlvbiBHdWlkZShvcHRzLCBncyl7XG4gICAgdmFyIGdyaWRTaXplLCBibG9ja1NpemUsIHdpZHRoLCBnZW8sIGJlYW1NYXQsIGZsYXJlTWF0O1xuICAgIGdyaWRTaXplID0gb3B0cy5ncmlkU2l6ZSwgYmxvY2tTaXplID0gb3B0cy5ibG9ja1NpemU7XG4gICAgR3VpZGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuZ3MgPSBncztcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdGhpc1NoYXBlOiBudWxsLFxuICAgICAgbGFzdFNoYXBlOiBudWxsXG4gICAgfTtcbiAgICBnZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplLCB0aGlzLmhlaWdodCwgZ3JpZFNpemUgKiAwLjkpO1xuICAgIGdlby5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCB0aGlzLmhlaWdodCAvIDIsIDApKTtcbiAgICBiZWFtTWF0ID0gTWF0ZXJpYWxzLmZsYXJlRmFjZXM7XG4gICAgZmxhcmVNYXQgPSBNYXRlcmlhbHMuZmxhcmVGYWNlcy5jbG9uZSgpO1xuICAgIHRoaXMuYmVhbSA9IG5ldyBUSFJFRS5NZXNoKGdlbywgYmVhbU1hdCk7XG4gICAgdGhpcy5mbGFyZSA9IG5ldyBUSFJFRS5NZXNoKGdlbywgZmxhcmVNYXQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJlYW0pO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmZsYXJlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gd2lkdGggLyAtMiAtIGdyaWRTaXplIC8gMjtcbiAgICB0aGlzLmd1aWRlTGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgZ3JpZFNpemUgKiA0KTtcbiAgICB0aGlzLmd1aWRlTGlnaHQucG9zaXRpb24ueSA9IDAuMTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5ndWlkZUxpZ2h0KTtcbiAgICB0aGlzLmltcGFjdExpZ2h0ID0gbmV3IFRIUkVFLlBvaW50TGlnaHQoMHgwMGZmMDAsIDEwLCBncmlkU2l6ZSAqIDYpO1xuICAgIHRoaXMuaW1wYWN0TGlnaHQucG9zaXRpb24ueiA9IDAuMTtcbiAgICB0aGlzLmltcGFjdExpZ2h0LnBvc2l0aW9uLnkgPSAwLjI7XG4gIH1cbiAgcHJvdG90eXBlLnBvc2l0aW9uQmVhbSA9IGZ1bmN0aW9uKGJlYW0sIGJlYW1TaGFwZSl7XG4gICAgdmFyIHcsIGcsIHg7XG4gICAgdyA9IDEgKyBiZWFtU2hhcGUubWF4IC0gYmVhbVNoYXBlLm1pbjtcbiAgICBnID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIHggPSBnICogKGJlYW1TaGFwZS5wb3MgKyB3IC8gMiArIGJlYW1TaGFwZS5taW4gKyAwLjUpO1xuICAgIGJlYW0uc2NhbGUuc2V0KHcsIDEsIDEpO1xuICAgIHJldHVybiBiZWFtLnBvc2l0aW9uLnggPSB4O1xuICB9O1xuICBwcm90b3R5cGUuc2hvd0JlYW0gPSBmdW5jdGlvbihicmljayl7XG4gICAgdmFyIGJlYW1TaGFwZSwgaSQsIHJlZiQsIGxlbiQsIHksIHJvdywgaiQsIGxlbjEkLCB4LCBjZWxsO1xuICAgIGJlYW1TaGFwZSA9IHtcbiAgICAgIG1pbjogNCxcbiAgICAgIG1heDogMCxcbiAgICAgIHBvczogYnJpY2sucG9zWzBdLFxuICAgICAgY29sb3I6ICdtYWdlbnRhJyxcbiAgICAgIGhlaWdodDogYnJpY2sucG9zWzFdICsgcHJldHR5T2Zmc2V0W2JyaWNrLnR5cGVdW2JyaWNrLnJvdGF0aW9uXVxuICAgIH07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGJyaWNrLnNoYXBlKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgYmVhbVNoYXBlLmNvbG9yID0gUGFsZXR0ZS5zcGVjQ29sb3JzW2NlbGxdO1xuICAgICAgICAgIGlmIChiZWFtU2hhcGUubWluID4geCkge1xuICAgICAgICAgICAgYmVhbVNoYXBlLm1pbiA9IHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChiZWFtU2hhcGUubWF4IDwgeCkge1xuICAgICAgICAgICAgYmVhbVNoYXBlLm1heCA9IHg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHggPSB0aGlzLnBvc2l0aW9uQmVhbSh0aGlzLmJlYW0sIGJlYW1TaGFwZSk7XG4gICAgdGhpcy5ndWlkZUxpZ2h0LnBvc2l0aW9uLnggPSB4O1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnRoaXNTaGFwZSA9IGJlYW1TaGFwZTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dGbGFyZSA9IGZ1bmN0aW9uKHAsIGRyb3BwZWQpe1xuICAgIHZhciBnLCBiZWFtU2hhcGUsIHg7XG4gICAgaWYgKHAgPT09IDApIHtcbiAgICAgIGcgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgICB0aGlzLnN0YXRlLmxhc3RTaGFwZSA9IGJlYW1TaGFwZSA9IHRoaXMuc3RhdGUudGhpc1NoYXBlO1xuICAgICAgdGhpcy5mbGFyZS5tYXRlcmlhbC5tYXRlcmlhbHMubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgICAgdmFyIHJlZiQ7XG4gICAgICAgIHJldHVybiAocmVmJCA9IGl0LmVtaXNzaXZlKSAhPSBudWxsID8gcmVmJC5zZXRIZXgoYmVhbVNoYXBlLmNvbG9yKSA6IHZvaWQgODtcbiAgICAgIH0pO1xuICAgICAgeCA9IHRoaXMucG9zaXRpb25CZWFtKHRoaXMuZmxhcmUsIGJlYW1TaGFwZSk7XG4gICAgICB0aGlzLmZsYXJlLnNjYWxlLnkgPSBnICogKDEgKyBkcm9wcGVkKSAvIHRoaXMuaGVpZ2h0O1xuICAgICAgdGhpcy5mbGFyZS5wb3NpdGlvbi55ID0gdGhpcy5oZWlnaHQgLSBnICogYmVhbVNoYXBlLmhlaWdodCAtIGcgKiBkcm9wcGVkO1xuICAgICAgdGhpcy5pbXBhY3RMaWdodC5oZXggPSBiZWFtU2hhcGUuY29sb3I7XG4gICAgICB0aGlzLmltcGFjdExpZ2h0LnBvc2l0aW9uLnggPSB4O1xuICAgICAgdGhpcy5pbXBhY3RMaWdodC5wb3NpdGlvbi55ID0gdGhpcy5oZWlnaHQgLSBnICogYmVhbVNoYXBlLmhlaWdodDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmxhcmUubWF0ZXJpYWwubWF0ZXJpYWxzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQub3BhY2l0eSA9IDEgLSBwO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gR3VpZGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBBcmVuYSwgVGl0bGUsIFRhYmxlLCBCcmlja1ByZXZpZXcsIExpZ2h0aW5nLCBOaXhpZURpc3BsYXksIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2FyZW5hJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGl0bGUnKSwgVGl0bGUgPSByZWYkLlRpdGxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi90YWJsZScpLCBUYWJsZSA9IHJlZiQuVGFibGUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2JyaWNrLXByZXZpZXcnKSwgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2xpZ2h0aW5nJyksIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vbml4aWUnKSwgTml4aWVEaXNwbGF5ID0gcmVmJC5OaXhpZURpc3BsYXksIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKSwgU3RhcnRNZW51ID0gcmVmJC5TdGFydE1lbnUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2ZhaWwtc2NyZWVuJyksIEZhaWxTY3JlZW4gPSByZWYkLkZhaWxTY3JlZW4sIHJlZiQpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxlcnAsIGxvZywgZmxvb3IsIG1hcCwgc3BsaXQsIHBpLCB0YXUsIEJhc2UsIE1hdGVyaWFscywgTEVELCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIHNpbiA9IHJlZiQuc2luLCBsZXJwID0gcmVmJC5sZXJwLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcCwgc3BsaXQgPSByZWYkLnNwbGl0LCBwaSA9IHJlZiQucGksIHRhdSA9IHJlZiQudGF1O1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkxFRCA9IExFRCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIGhhbGZTcGhlcmUsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTEVELCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdMRUQnLCBMRUQpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTEVEO1xuICBoYWxmU3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuMDEsIDgsIDgpO1xuICBmdW5jdGlvbiBMRUQob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTEVELnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm1hdHMgPSB7XG4gICAgICBvZmY6IE1hdGVyaWFscy5nbGFzcyxcbiAgICAgIG9uOiBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBjb2xvcjogMHhmYmIwM2IsXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICBlbWlzc2l2ZTogMHhmYmIwYmIsXG4gICAgICAgIHNwZWN1bGFyOiAnd2hpdGUnLFxuICAgICAgICBzaGluaW5lc3M6IDEwMFxuICAgICAgfSlcbiAgICB9O1xuICAgIHRoaXMuYnVsYiA9IG5ldyBUSFJFRS5NZXNoKGhhbGZTcGhlcmUsIHRoaXMubWF0cy5vZmYpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZiYjAzYiwgMCwgMC4xKTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnkgPSAwLjAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJ1bGIpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgfVxuICBwcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihjb2xvcil7XG4gICAgdGhpcy5idWxiLm1hdGVyaWFsLmNvbG9yID0gY29sb3I7XG4gICAgcmV0dXJuIHRoaXMubGlnaHQuY29sb3IgPSBjb2xvcjtcbiAgfTtcbiAgcHJvdG90eXBlLm9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJ1bGIubWF0ZXJpYWwgPSB0aGlzLm1hdHMub247XG4gICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMC4zO1xuICB9O1xuICBwcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJ1bGIubWF0ZXJpYWwgPSB0aGlzLm1hdHMub2ZmO1xuICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDA7XG4gIH07XG4gIHJldHVybiBMRUQ7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIEJhc2UsIExpZ2h0aW5nLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5MaWdodGluZyA9IExpZ2h0aW5nID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgbWFpbkxpZ2h0RGlzdGFuY2UsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTGlnaHRpbmcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xpZ2h0aW5nJywgTGlnaHRpbmcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTGlnaHRpbmc7XG4gIG1haW5MaWdodERpc3RhbmNlID0gMjtcbiAgZnVuY3Rpb24gTGlnaHRpbmcob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTGlnaHRpbmcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgbWFpbkxpZ2h0RGlzdGFuY2UpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDApO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB0aGlzLnNwb3RsaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoMHhmZmZmZmYsIDEsIDUwLCAxKTtcbiAgICB0aGlzLnNwb3RsaWdodC5wb3NpdGlvbi5zZXQoMCwgMywgLTEpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnRhcmdldC5wb3NpdGlvbi5zZXQoMCwgMCwgLTEpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnNwb3RsaWdodCk7XG4gICAgdGhpcy5hbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDY2NjY2Nik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYW1iaWVudCk7XG4gICAgdGhpcy5zcG90bGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93RGFya25lc3MgPSAwLjU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93QmlhcyA9IDAuMDAwMTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFOZWFyID0gMTA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRmFyID0gMjUwMDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFGb3YgPSA1MDtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuUG9pbnRMaWdodEhlbHBlcih0aGlzLmxpZ2h0LCBtYWluTGlnaHREaXN0YW5jZSkpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLlNwb3RMaWdodEhlbHBlcih0aGlzLnNwb3RsaWdodCkpO1xuICB9O1xuICBwcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSAxLjAgKiBzaW4odGltZSAvIDUwMCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSAwLjUgKiBjb3ModGltZSAvIDUwMCk7XG4gIH07XG4gIHJldHVybiBMaWdodGluZztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxlcnAsIGxvZywgZmxvb3IsIG1hcCwgc3BsaXQsIHBpLCB0YXUsIE1hdGVyaWFscywgQmFzZSwgQ2Fwc3VsZUdlb21ldHJ5LCBMRUQsIE5peGllVHViZSwgTml4aWVEaXNwbGF5LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzLCBzbGljZSQgPSBbXS5zbGljZTtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBzaW4gPSByZWYkLnNpbiwgbGVycCA9IHJlZiQubGVycCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vciwgbWFwID0gcmVmJC5tYXAsIHNwbGl0ID0gcmVmJC5zcGxpdCwgcGkgPSByZWYkLnBpLCB0YXUgPSByZWYkLnRhdTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQ2Fwc3VsZUdlb21ldHJ5ID0gcmVxdWlyZSgnLi4vZ2VvbWV0cnkvY2Fwc3VsZScpLkNhcHN1bGVHZW9tZXRyeTtcbkxFRCA9IHJlcXVpcmUoJy4vbGVkJykuTEVEO1xuTml4aWVUdWJlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChOaXhpZVR1YmUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ05peGllVHViZScsIE5peGllVHViZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBOaXhpZVR1YmU7XG4gIGZ1bmN0aW9uIE5peGllVHViZShvcHRzLCBncyl7XG4gICAgdmFyIHR1YmVSYWRpdXMsIHR1YmVIZWlnaHQsIGJhc2VSYWRpdXMsIGJhc2VIZWlnaHQsIGxhbXBPZmZzZXQsIG1lc2hXaWR0aCwgbWVzaEhlaWdodCwgYmdHZW8sIGJhc2VHZW8sIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgaSwgcXVhZDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllVHViZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdHViZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZVR1YmVSYWRpdXM7XG4gICAgdHViZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQ7XG4gICAgYmFzZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgYmFzZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAxMDtcbiAgICBsYW1wT2Zmc2V0ID0gdGhpcy5vcHRzLnNjb3JlSW5kaWNhdG9yT2Zmc2V0O1xuICAgIG1lc2hXaWR0aCA9IHR1YmVSYWRpdXMgKiAxLjM7XG4gICAgbWVzaEhlaWdodCA9IHR1YmVSYWRpdXMgKiAyLjU7XG4gICAgdGhpcy5tZXNoV2lkdGggPSBtZXNoV2lkdGg7XG4gICAgdGhpcy5tZXNoSGVpZ2h0ID0gbWVzaEhlaWdodDtcbiAgICBiZ0dlbyA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KG1lc2hXaWR0aCwgbWVzaEhlaWdodCk7XG4gICAgYmFzZUdlbyA9IG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGJhc2VSYWRpdXMsIGJhc2VSYWRpdXMsIGJhc2VIZWlnaHQsIDYsIDApO1xuICAgIGJhc2VHZW8uYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25ZKHBpIC8gNikpO1xuICAgIHRoaXMuaW50ZW5zaXR5ID0gMDtcbiAgICB0aGlzLmdsYXNzID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSh0dWJlUmFkaXVzLCAxNiwgdHViZUhlaWdodCwgMCksIE1hdGVyaWFscy5nbGFzcyk7XG4gICAgdGhpcy5iYXNlID0gbmV3IFRIUkVFLk1lc2goYmFzZUdlbywgTWF0ZXJpYWxzLmNvcHBlcik7XG4gICAgdGhpcy5iZyA9IG5ldyBUSFJFRS5NZXNoKGJnR2VvLCBNYXRlcmlhbHMubml4aWVCZyk7XG4gICAgdGhpcy5sZWQgPSBuZXcgTEVEKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMubGVkLnBvc2l0aW9uLnogPSBsYW1wT2Zmc2V0O1xuICAgIHRoaXMuZ2xhc3MucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5iZy5wb3NpdGlvbi55ID0gbWVzaEhlaWdodCAvIDIgKyBiYXNlSGVpZ2h0IC8gMjtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBpID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVEaWdpdFF1YWQoaSwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gbWVzaEhlaWdodCAvIDIgKyBiYXNlSGVpZ2h0IC8gMjtcbiAgICAgIHF1YWQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgcXVhZC5kaWdpdCA9IGk7XG4gICAgICBxdWFkLnJlbmRlck9yZGVyID0gMDtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICAgIHJlcyQucHVzaChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy5kaWdpdHMgPSByZXMkO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgnb3JhbmdlJywgMC4zLCAwLjMpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmdsYXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iYXNlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iZyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGlnaHQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxlZC5yb290KTtcbiAgfVxuICBwcm90b3R5cGUucHVsc2UgPSBmdW5jdGlvbih0KXtcbiAgICBpZiAodGhpcy5pbnRlbnNpdHkgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IHRoaXMuaW50ZW5zaXR5ICsgMC4xICogc2luKHQpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNob3dEaWdpdCA9IGZ1bmN0aW9uKGRpZ2l0KXtcbiAgICB0aGlzLmludGVuc2l0eSA9IGRpZ2l0ICE9IG51bGwgPyAwLjUgOiAwO1xuICAgIHRoaXMuZGlnaXRzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudmlzaWJsZSA9IGl0LmRpZ2l0ID09PSBkaWdpdDtcbiAgICB9KTtcbiAgICBpZiAoZGlnaXQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMubGVkLm9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmxlZC5vZmYoKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5jcmVhdGVEaWdpdFF1YWQgPSBmdW5jdGlvbihkaWdpdCwgaXgpe1xuICAgIHZhciBnZW9tLCBxdWFkO1xuICAgIGdlb20gPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSh0aGlzLm1lc2hXaWR0aCwgdGhpcy5tZXNoSGVpZ2h0KTtcbiAgICByZXR1cm4gcXVhZCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIE1hdGVyaWFscy5uaXhpZURpZ2l0c1tkaWdpdF0pO1xuICB9O1xuICByZXR1cm4gTml4aWVUdWJlO1xufShCYXNlKSk7XG5vdXQkLk5peGllRGlzcGxheSA9IE5peGllRGlzcGxheSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTml4aWVEaXNwbGF5LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOaXhpZURpc3BsYXknLCBOaXhpZURpc3BsYXkpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTml4aWVEaXNwbGF5O1xuICBmdW5jdGlvbiBOaXhpZURpc3BsYXkob3B0cywgZ3Mpe1xuICAgIHZhciBvZmZzZXQsIG1hcmdpbiwgYmFzZVJhZGl1cywgcmVzJCwgaSQsIHRvJCwgaSwgdHViZTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllRGlzcGxheS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgb2Zmc2V0ID0gdGhpcy5vcHRzLnNjb3JlRGlzdGFuY2VGcm9tQ2VudHJlICsgdGhpcy5vcHRzLnNjb3JlQmFzZVJhZGl1cztcbiAgICBtYXJnaW4gPSB0aGlzLm9wdHMuc2NvcmVJbnRlclR1YmVNYXJnaW47XG4gICAgYmFzZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgdGhpcy5jb3VudCA9IDU7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxhc3RTZWVuTnVtYmVyOiAwXG4gICAgfTtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMuY291bnQ7IGkkIDwgdG8kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0dWJlID0gbmV3IE5peGllVHViZSh0aGlzLm9wdHMsIGdzKTtcbiAgICAgIHR1YmUucG9zaXRpb24ueCA9IG1hcmdpbiAqIGkgKyBvZmZzZXQgKyBpICogdGhpcy5vcHRzLnNjb3JlQmFzZVJhZGl1cyAqIDI7XG4gICAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodHViZS5yb290KTtcbiAgICAgIHJlcyQucHVzaCh0dWJlKTtcbiAgICB9XG4gICAgdGhpcy50dWJlcyA9IHJlcyQ7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IC10aGlzLm9wdHMuc2NvcmVEaXN0YW5jZUZyb21FZGdlO1xuICB9XG4gIHByb3RvdHlwZS5wdWxzZSA9IGZ1bmN0aW9uKHQpe1xuICAgIHJldHVybiB0aGlzLnR1YmVzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQucHVsc2UodCk7XG4gICAgfSk7XG4gIH07XG4gIHByb3RvdHlwZS5ydW5Ub051bWJlciA9IGZ1bmN0aW9uKHAsIG51bSl7XG4gICAgdmFyIG5leHROdW1iZXI7XG4gICAgbmV4dE51bWJlciA9IGZsb29yKGxlcnAodGhpcy5zdGF0ZS5sYXN0U2Vlbk51bWJlciwgbnVtLCBwKSk7XG4gICAgcmV0dXJuIHRoaXMuc2hvd051bWJlcihuZXh0TnVtYmVyKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNldE51bWJlciA9IGZ1bmN0aW9uKG51bSl7XG4gICAgdGhpcy5zdGF0ZS5sYXN0U2Vlbk51bWJlciA9IG51bTtcbiAgICByZXR1cm4gdGhpcy5zaG93TnVtYmVyKG51bSk7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93TnVtYmVyID0gZnVuY3Rpb24obnVtKXtcbiAgICB2YXIgZGlnaXRzLCBpJCwgaSwgdHViZSwgZGlnaXQsIHJlc3VsdHMkID0gW107XG4gICAgbnVtID09IG51bGwgJiYgKG51bSA9IDApO1xuICAgIGRpZ2l0cyA9IG1hcChwYXJ0aWFsaXplJC5hcHBseSh0aGlzLCBbcGFyc2VJbnQsIFt2b2lkIDgsIDEwXSwgWzBdXSkpKFxuICAgIHNwbGl0KCcnKShcbiAgICBmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudG9TdHJpbmcoKTtcbiAgICB9KFxuICAgIG51bSkpKTtcbiAgICBmb3IgKGkkID0gdGhpcy5jb3VudCAtIDE7IGkkID49IDA7IC0taSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHR1YmUgPSB0aGlzLnR1YmVzW2ldO1xuICAgICAgZGlnaXQgPSBkaWdpdHMucG9wKCk7XG4gICAgICByZXN1bHRzJC5wdXNoKHR1YmUuc2hvd0RpZ2l0KGRpZ2l0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIE5peGllRGlzcGxheTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBwYXJ0aWFsaXplJChmLCBhcmdzLCB3aGVyZSl7XG4gIHZhciBjb250ZXh0ID0gdGhpcztcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHBhcmFtcyA9IHNsaWNlJC5jYWxsKGFyZ3VtZW50cyksIGksXG4gICAgICAgIGxlbiA9IHBhcmFtcy5sZW5ndGgsIHdsZW4gPSB3aGVyZS5sZW5ndGgsXG4gICAgICAgIHRhID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXSwgdHcgPSB3aGVyZSA/IHdoZXJlLmNvbmNhdCgpIDogW107XG4gICAgZm9yKGkgPSAwOyBpIDwgbGVuOyArK2kpIHsgdGFbdHdbMF1dID0gcGFyYW1zW2ldOyB0dy5zaGlmdCgpOyB9XG4gICAgcmV0dXJuIGxlbiA8IHdsZW4gJiYgbGVuID9cbiAgICAgIHBhcnRpYWxpemUkLmFwcGx5KGNvbnRleHQsIFtmLCB0YSwgdHddKSA6IGYuYXBwbHkoY29udGV4dCwgdGEpO1xuICB9O1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIHJhbmQsIGZsb29yLCBCYXNlLCBtZXNoTWF0ZXJpYWxzLCBQYXJ0aWNsZUJ1cnN0LCBQYXJ0aWNsZUVmZmVjdCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xubWVzaE1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL3BhbGV0dGUnKS5tZXNoTWF0ZXJpYWxzO1xub3V0JC5QYXJ0aWNsZUJ1cnN0ID0gUGFydGljbGVCdXJzdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHNwZWVkLCBsaWZlc3BhbiwgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChQYXJ0aWNsZUJ1cnN0LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdQYXJ0aWNsZUJ1cnN0JywgUGFydGljbGVCdXJzdCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQYXJ0aWNsZUJ1cnN0O1xuICBzcGVlZCA9IDI7XG4gIGxpZmVzcGFuID0gMTUwMDtcbiAgZnVuY3Rpb24gUGFydGljbGVCdXJzdChvcHRzLCBncyl7XG4gICAgdmFyIGFyZW5hLCB3aWR0aCwgaGVpZ2h0LCBwYXJ0aWNsZXMsIGdlb21ldHJ5LCBjb2xvciwgbWF0ZXJpYWw7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVCdXJzdC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5zaXplID0gdGhpcy5vcHRzLnphcFBhcnRpY2xlU2l6ZTtcbiAgICBwYXJ0aWNsZXMgPSAxNTAwO1xuICAgIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gICAgY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcbiAgICB0aGlzLnBvc2l0aW9ucyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy52ZWxvY2l0aWVzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMgKiAzKTtcbiAgICB0aGlzLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy5saWZlc3BhbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5hbHBoYXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5tYXhsaWZlcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzKTtcbiAgICB0aGlzLnBvc0F0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMucG9zaXRpb25zLCAzKTtcbiAgICB0aGlzLmNvbEF0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMuY29sb3JzLCAzKTtcbiAgICB0aGlzLmFscGhhQXR0ciA9IG5ldyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUodGhpcy5hbHBoYXMsIDEpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgdGhpcy5wb3NBdHRyKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ2NvbG9yJywgdGhpcy5jb2xBdHRyKTtcbiAgICBnZW9tZXRyeS5hZGRBdHRyaWJ1dGUoJ29wYWNpdHknLCB0aGlzLmFscGhhQXR0cik7XG4gICAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gICAgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRDbG91ZE1hdGVyaWFsKHtcbiAgICAgIHNpemU6IHRoaXMuc2l6ZSxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICB2ZXJ0ZXhDb2xvcnM6IFRIUkVFLlZlcnRleENvbG9yc1xuICAgIH0pO1xuICAgIHRoaXMucm9vdC5hZGQobmV3IFRIUkVFLlBvaW50Q2xvdWQoZ2VvbWV0cnksIG1hdGVyaWFsKSk7XG4gIH1cbiAgcHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZ3JpZCwgaSQsIHRvJCwgaSwgeCwgeiwgcmVzdWx0cyQgPSBbXTtcbiAgICBncmlkID0gdGhpcy5vcHRzLmdyaWRTaXplO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB4ID0gNC41IC0gTWF0aC5yYW5kb20oKSAqIDk7XG4gICAgICB6ID0gMC41IC0gTWF0aC5yYW5kb20oKTtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAwXSA9IHggKiBncmlkO1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gMDtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAyXSA9IHogKiBncmlkO1xuICAgICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAwXSA9IHggLyAxMDtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMV0gPSByYW5kKC0yICogZ3JpZCwgMTAgKiBncmlkKTtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB6O1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDBdID0gMTtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAxXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSAxO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPSAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuYWNjZWxlcmF0ZVBhcnRpY2xlID0gZnVuY3Rpb24oaSwgdCwgcCwgYmJ4LCBiYnope1xuICAgIHZhciBhY2MsIHB4LCBweSwgcHosIHZ4LCB2eSwgdnosIHB4MSwgcHkxLCBwejEsIHZ4MSwgdnkxLCB2ejEsIGw7XG4gICAgaWYgKHRoaXMubGlmZXNwYW5zW2kgLyAzXSA8PSAwKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAtMTAwMDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdCA9IHQgLyAoMTAwMCAvIHNwZWVkKTtcbiAgICBhY2MgPSAtMC45ODtcbiAgICBweCA9IHRoaXMucG9zaXRpb25zW2kgKyAwXTtcbiAgICBweSA9IHRoaXMucG9zaXRpb25zW2kgKyAxXTtcbiAgICBweiA9IHRoaXMucG9zaXRpb25zW2kgKyAyXTtcbiAgICB2eCA9IHRoaXMudmVsb2NpdGllc1tpICsgMF07XG4gICAgdnkgPSB0aGlzLnZlbG9jaXRpZXNbaSArIDFdO1xuICAgIHZ6ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAyXTtcbiAgICBweDEgPSBweCArIDAuNSAqIDAgKiB0ICogdCArIHZ4ICogdDtcbiAgICBweTEgPSBweSArIDAuNSAqIGFjYyAqIHQgKiB0ICsgdnkgKiB0O1xuICAgIHB6MSA9IHB6ICsgMC41ICogMCAqIHQgKiB0ICsgdnogKiB0O1xuICAgIHZ4MSA9IDAgKiB0ICsgdng7XG4gICAgdnkxID0gYWNjICogdCArIHZ5O1xuICAgIHZ6MSA9IDAgKiB0ICsgdno7XG4gICAgaWYgKHB5MSA8IHRoaXMuc2l6ZSAvIDIgJiYgKC1iYnggPCBweDEgJiYgcHgxIDwgYmJ4KSAmJiAoLWJieiArIDEuOSAqIHRoaXMub3B0cy5ncmlkU2l6ZSA8IHB6MSAmJiBwejEgPCBiYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUpKSB7XG4gICAgICBweTEgPSB0aGlzLnNpemUgLyAyO1xuICAgICAgdngxICo9IDAuNztcbiAgICAgIHZ5MSAqPSAtMC42O1xuICAgICAgdnoxICo9IDAuNztcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDBdID0gcHgxO1xuICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IHB5MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSBwejE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAwXSA9IHZ4MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gdnkxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMl0gPSB2ejE7XG4gICAgbCA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXSAvIHRoaXMubWF4bGlmZXNbaSAvIDNdO1xuICAgIGwgPSBsICogbCAqIGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDBdID0gbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMV0gPSBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAyXSA9IGw7XG4gICAgcmV0dXJuIHRoaXMuYWxwaGFzW2kgLyAzXSA9IGw7XG4gIH07XG4gIHByb3RvdHlwZS5zZXRIZWlnaHQgPSBmdW5jdGlvbih5KXtcbiAgICB2YXIgZ3JpZCwgaSQsIHRvJCwgaSwgcmVzdWx0cyQgPSBbXTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgdGhpcy5saWZlc3BhbnNbaSAvIDNdID0gbGlmZXNwYW4gLyAyICsgTWF0aC5yYW5kb20oKSAqIGxpZmVzcGFuIC8gMjtcbiAgICAgIHRoaXMubWF4bGlmZXNbaSAvIDNdID0gdGhpcy5saWZlc3BhbnNbaSAvIDNdO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSAoeSArIE1hdGgucmFuZG9tKCkpICogZ3JpZCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHAsIM6UdCl7XG4gICAgdmFyIGJvdW5jZUJvdW5kc1gsIGJvdW5jZUJvdW5kc1osIGkkLCB0byQsIGk7XG4gICAgYm91bmNlQm91bmRzWCA9IHRoaXMub3B0cy5kZXNrU2l6ZVswXSAvIDI7XG4gICAgYm91bmNlQm91bmRzWiA9IHRoaXMub3B0cy5kZXNrU2l6ZVsxXSAvIDI7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHRoaXMuYWNjZWxlcmF0ZVBhcnRpY2xlKGksIM6UdCwgMSwgYm91bmNlQm91bmRzWCwgYm91bmNlQm91bmRzWik7XG4gICAgICB0aGlzLmxpZmVzcGFuc1tpIC8gM10gLT0gzpR0O1xuICAgIH1cbiAgICB0aGlzLnBvc0F0dHIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmNvbEF0dHIubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9O1xuICByZXR1cm4gUGFydGljbGVCdXJzdDtcbn0oQmFzZSkpO1xub3V0JC5QYXJ0aWNsZUVmZmVjdCA9IFBhcnRpY2xlRWZmZWN0ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChQYXJ0aWNsZUVmZmVjdCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnUGFydGljbGVFZmZlY3QnLCBQYXJ0aWNsZUVmZmVjdCksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBQYXJ0aWNsZUVmZmVjdDtcbiAgZnVuY3Rpb24gUGFydGljbGVFZmZlY3Qob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHJvdztcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodDtcbiAgICBQYXJ0aWNsZUVmZmVjdC5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy56ID0gdGhpcy5vcHRzLno7XG4gICAgdGhpcy5oID0gaGVpZ2h0O1xuICAgIHRoaXMucm93cyA9IFtcbiAgICAgIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pXG4gICAgXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICByb3cuYWRkVG8odGhpcy5yb290KTtcbiAgICB9XG4gIH1cbiAgcHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbihyb3dzKXtcbiAgICB2YXIgaSQsIGxlbiQsIGksIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgcm93SXggPSByb3dzW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5yb3dzW2ldLnNldEhlaWdodCgodGhpcy5oIC0gMSkgLSByb3dJeCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBzeXN0ZW0sIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHN5c3RlbSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChzeXN0ZW0ucmVzZXQoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHAsIGZzcnIsIM6UdCl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgc3lzdGVtLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgc3lzdGVtID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHN5c3RlbS51cGRhdGUocCwgzpR0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFBhcnRpY2xlRWZmZWN0O1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBjb3MsIEJhc2UsIFRpdGxlLCBjYW52YXNUZXh0dXJlLCBTdGFydE1lbnUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuVGl0bGUgPSByZXF1aXJlKCcuL3RpdGxlJykuVGl0bGU7XG5jYW52YXNUZXh0dXJlID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRleHR1cmVTaXplLCBmaWRlbGl0eUZhY3RvciwgdGV4dENudiwgaW1nQ252LCB0ZXh0Q3R4LCBpbWdDdHg7XG4gIHRleHR1cmVTaXplID0gMTAyNDtcbiAgZmlkZWxpdHlGYWN0b3IgPSAxMDA7XG4gIHRleHRDbnYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgaW1nQ252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRleHRDdHggPSB0ZXh0Q252LmdldENvbnRleHQoJzJkJyk7XG4gIGltZ0N0eCA9IGltZ0Nudi5nZXRDb250ZXh0KCcyZCcpO1xuICBpbWdDbnYud2lkdGggPSBpbWdDbnYuaGVpZ2h0ID0gdGV4dHVyZVNpemU7XG4gIHJldHVybiBmdW5jdGlvbihhcmckKXtcbiAgICB2YXIgd2lkdGgsIGhlaWdodCwgdGV4dCwgdGV4dFNpemUsIHJlZiQ7XG4gICAgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodCwgdGV4dCA9IGFyZyQudGV4dCwgdGV4dFNpemUgPSAocmVmJCA9IGFyZyQudGV4dFNpemUpICE9IG51bGwgPyByZWYkIDogMTA7XG4gICAgdGV4dENudi53aWR0aCA9IHdpZHRoICogZmlkZWxpdHlGYWN0b3I7XG4gICAgdGV4dENudi5oZWlnaHQgPSBoZWlnaHQgKiBmaWRlbGl0eUZhY3RvcjtcbiAgICB0ZXh0Q3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIHRleHRDdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgdGV4dEN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIHRleHRDdHguZm9udCA9IHRleHRTaXplICogZmlkZWxpdHlGYWN0b3IgKyBcInB4IG1vbm9zcGFjZVwiO1xuICAgIHRleHRDdHguZmlsbFRleHQodGV4dCwgd2lkdGggKiBmaWRlbGl0eUZhY3RvciAvIDIsIGhlaWdodCAqIGZpZGVsaXR5RmFjdG9yIC8gMiwgd2lkdGggKiBmaWRlbGl0eUZhY3Rvcik7XG4gICAgaW1nQ3R4LmNsZWFyUmVjdCgwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIGltZ0N0eC5maWxsUmVjdCgwLCAwLCB0ZXh0dXJlU2l6ZSwgdGV4dHVyZVNpemUpO1xuICAgIGltZ0N0eC5kcmF3SW1hZ2UodGV4dENudiwgMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICByZXR1cm4gaW1nQ252LnRvRGF0YVVSTCgpO1xuICB9O1xufSgpO1xub3V0JC5TdGFydE1lbnUgPSBTdGFydE1lbnUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFN0YXJ0TWVudSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnU3RhcnRNZW51JywgU3RhcnRNZW51KSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFN0YXJ0TWVudTtcbiAgZnVuY3Rpb24gU3RhcnRNZW51KG9wdHMsIGdzKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGl4LCBvcHRpb24sIHF1YWQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBTdGFydE1lbnUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMub3B0aW9ucyA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBncy5zdGFydE1lbnUubWVudURhdGEpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgb3B0aW9uID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVPcHRpb25RdWFkKG9wdGlvbiwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gMC41IC0gaXggKiAwLjI7XG4gICAgICB0aGlzLm9wdGlvbnMucHVzaChxdWFkKTtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy50aXRsZSA9IG5ldyBUaXRsZSh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLnRpdGxlLmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gLTEgKiAodGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmJsb2NrU2l6ZSAvIDIpO1xuICB9XG4gIHByb3RvdHlwZS5jcmVhdGVPcHRpb25RdWFkID0gZnVuY3Rpb24ob3B0aW9uLCBpeCl7XG4gICAgdmFyIGltYWdlLCB0ZXgsIGdlb20sIG1hdCwgcXVhZDtcbiAgICBpbWFnZSA9IGNhbnZhc1RleHR1cmUoe1xuICAgICAgdGV4dDogb3B0aW9uLnRleHQsXG4gICAgICB3aWR0aDogNjAsXG4gICAgICBoZWlnaHQ6IDEwXG4gICAgfSk7XG4gICAgdGV4ID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShpbWFnZSk7XG4gICAgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDEsIDAuMik7XG4gICAgbWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4LFxuICAgICAgYWxwaGFNYXA6IHRleCxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIHF1YWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tLCBtYXQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciBzdGFydE1lbnU7XG4gICAgc3RhcnRNZW51ID0gZ3Muc3RhcnRNZW51O1xuICAgIHRoaXMudGl0bGUucmV2ZWFsKHN0YXJ0TWVudS50aXRsZVJldmVhbEFuaW1hdGlvbi5wcm9ncmVzcyk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlU2VsZWN0aW9uKGdzLnN0YXJ0TWVudSwgZ3MuZWxhcHNlZFRpbWUpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlU2VsZWN0aW9uID0gZnVuY3Rpb24oc3RhdGUsIHRpbWUpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIHF1YWQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMub3B0aW9ucykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBxdWFkID0gcmVmJFtpJF07XG4gICAgICBpZiAoaXggPT09IHN0YXRlLmN1cnJlbnRJbmRleCkge1xuICAgICAgICBxdWFkLnNjYWxlLnggPSAxICsgMC4wNSAqIHNpbih0aW1lIC8gMzAwKTtcbiAgICAgICAgcmVzdWx0cyQucHVzaChxdWFkLnNjYWxlLnkgPSAxICsgMC4wNSAqIC1zaW4odGltZSAvIDMwMCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTdGFydE1lbnU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBCYXNlLCBNYXRlcmlhbHMsIFRhYmxlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLlRhYmxlID0gVGFibGUgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKFRhYmxlLCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdUYWJsZScsIFRhYmxlKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRhYmxlO1xuICBmdW5jdGlvbiBUYWJsZShvcHRzLCBncyl7XG4gICAgdmFyIHJlZiQsIHdpZHRoLCBkZXB0aCwgdGhpY2tuZXNzO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgVGFibGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJlZiQgPSB0aGlzLm9wdHMuZGVza1NpemUsIHdpZHRoID0gcmVmJFswXSwgZGVwdGggPSByZWYkWzFdLCB0aGlja25lc3MgPSByZWYkWzJdO1xuICAgIHRoaXMudGFibGUgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkod2lkdGgsIHRoaWNrbmVzcywgZGVwdGgpLCBNYXRlcmlhbHMudGFibGVGYWNlcyk7XG4gICAgdGhpcy50YWJsZS5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy50YWJsZSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IHRoaWNrbmVzcyAvIC0yO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSBkZXB0aCAvIC0yO1xuICB9XG4gIHJldHVybiBUYWJsZTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgbWluLCBtYXgsIEVhc2UsIEJhc2UsIE1hdGVyaWFscywgYmxvY2tUZXh0LCBUaXRsZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIG1pbiA9IHJlZiQubWluLCBtYXggPSByZWYkLm1heDtcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5ibG9ja1RleHQgPSB7XG4gIHRldHJpczogW1sxLCAxLCAxLCAyLCAyLCAyLCAzLCAzLCAzLCA0LCA0LCAwLCA1LCA2LCA2LCA2XSwgWzAsIDEsIDAsIDIsIDAsIDAsIDAsIDMsIDAsIDQsIDAsIDQsIDUsIDYsIDAsIDBdLCBbMCwgMSwgMCwgMiwgMiwgMCwgMCwgMywgMCwgNCwgNCwgMCwgNSwgNiwgNiwgNl0sIFswLCAxLCAwLCAyLCAwLCAwLCAwLCAzLCAwLCA0LCAwLCA0LCA1LCAwLCAwLCA2XSwgWzAsIDEsIDAsIDIsIDIsIDIsIDAsIDMsIDAsIDQsIDAsIDQsIDUsIDYsIDYsIDZdXSxcbiAgdnJ0OiBbWzEsIDAsIDEsIDQsIDQsIDYsIDYsIDZdLCBbMSwgMCwgMSwgNCwgMCwgNCwgNiwgMF0sIFsxLCAwLCAxLCA0LCA0LCAwLCA2LCAwXSwgWzEsIDAsIDEsIDQsIDAsIDQsIDYsIDBdLCBbMCwgMSwgMCwgNCwgMCwgNCwgNiwgMF1dLFxuICBnaG9zdDogW1sxLCAxLCAxLCAyLCAwLCAyLCAzLCAzLCAzLCA0LCA0LCA0LCA1LCA1LCA1XSwgWzEsIDAsIDAsIDIsIDAsIDIsIDMsIDAsIDMsIDQsIDAsIDAsIDAsIDUsIDBdLCBbMSwgMCwgMCwgMiwgMiwgMiwgMywgMCwgMywgNCwgNCwgNCwgMCwgNSwgMF0sIFsxLCAwLCAxLCAyLCAwLCAyLCAzLCAwLCAzLCAwLCAwLCA0LCAwLCA1LCAwXSwgWzEsIDEsIDEsIDIsIDAsIDIsIDMsIDMsIDMsIDQsIDQsIDQsIDAsIDUsIDBdXVxufTtcbm91dCQuVGl0bGUgPSBUaXRsZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoVGl0bGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1RpdGxlJywgVGl0bGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGl0bGU7XG4gIGZ1bmN0aW9uIFRpdGxlKG9wdHMsIGdzKXtcbiAgICB2YXIgYmxvY2tTaXplLCBncmlkU2l6ZSwgdGV4dCwgbWFyZ2luLCBoZWlnaHQsIGJsb2NrR2VvLCBpJCwgbGVuJCwgeSwgcm93LCBqJCwgbGVuMSQsIHgsIGNlbGwsIGJveDtcbiAgICBibG9ja1NpemUgPSBvcHRzLmJsb2NrU2l6ZSwgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIFRpdGxlLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0ZXh0ID0gYmxvY2tUZXh0LnZydDtcbiAgICBtYXJnaW4gPSAoZ3JpZFNpemUgLSBibG9ja1NpemUpIC8gMjtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy53b3JkID0gbmV3IFRIUkVFLk9iamVjdDNEKTtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueCA9ICh0ZXh0WzBdLmxlbmd0aCAtIDEpICogZ3JpZFNpemUgLyAtMjtcbiAgICB0aGlzLndvcmQucG9zaXRpb24ueSA9IGhlaWdodCAvIC0yIC0gKHRleHQubGVuZ3RoIC0gMSkgKiBncmlkU2l6ZSAvIC0yO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi56ID0gZ3JpZFNpemUgLyAyO1xuICAgIGJsb2NrR2VvID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KGJsb2NrU2l6ZSwgYmxvY2tTaXplLCBibG9ja1NpemUpO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGV4dC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgeSA9IGkkO1xuICAgICAgcm93ID0gdGV4dFtpJF07XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgYm94ID0gbmV3IFRIUkVFLk1lc2goYmxvY2tHZW8sIE1hdGVyaWFscy5ibG9ja3NbY2VsbF0pO1xuICAgICAgICAgIGJveC5wb3NpdGlvbi5zZXQoZ3JpZFNpemUgKiB4ICsgbWFyZ2luLCBncmlkU2l6ZSAqICh0ZXh0Lmxlbmd0aCAtIHkpICsgbWFyZ2luLCBncmlkU2l6ZSAvIC0yKTtcbiAgICAgICAgICB0aGlzLndvcmQuYWRkKGJveCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcHJvdG90eXBlLnJldmVhbCA9IGZ1bmN0aW9uKHByb2dyZXNzKXtcbiAgICB2YXIgcDtcbiAgICBwID0gbWluKDEsIHByb2dyZXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gRWFzZS5xdWludE91dChwLCB0aGlzLmhlaWdodCAqIDIsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gRWFzZS5leHBPdXQocCwgMzAsIDApO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi54ID0gRWFzZS5leHBPdXQocCwgLXBpIC8gMTAsIDApO1xuICB9O1xuICBwcm90b3R5cGUuZGFuY2UgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5yb3RhdGlvbi55ID0gLXBpIC8gMiArIHRpbWUgLyAxMDAwO1xuICAgIHJldHVybiB0aGlzLndvcmQub3BhY2l0eSA9IDAuNSArIDAuNSAqIHNpbiArIHRpbWUgLyAxMDAwO1xuICB9O1xuICByZXR1cm4gVGl0bGU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIHBpLCBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luLCBwaSA9IHJlZiQucGk7XG5vdXQkLkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IERlYnVnQ2FtZXJhUG9zaXRpb25lciA9IChmdW5jdGlvbigpe1xuICBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIuZGlzcGxheU5hbWUgPSAnRGVidWdDYW1lcmFQb3NpdGlvbmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnQ2FtZXJhUG9zaXRpb25lci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xuICBmdW5jdGlvbiBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIoY2FtZXJhLCB0YXJnZXQpe1xuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIHRhcmdldDogbmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMClcbiAgICB9O1xuICB9XG4gIHByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmVuYWJsZWQgPSB0cnVlO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIGlmICh0aGlzLnN0YXRlLmVuYWJsZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmF1dG9Sb3RhdGUoZ3MuZWxhcHNlZFRpbWUpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24ocGhhc2UsIHZwaGFzZSl7XG4gICAgdmFyIHRoYXQ7XG4gICAgdnBoYXNlID09IG51bGwgJiYgKHZwaGFzZSA9IDApO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnggPSB0aGlzLnIgKiBzaW4ocGhhc2UpO1xuICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnkgPSB0aGlzLnkgKyB0aGlzLnIgKiAtc2luKHZwaGFzZSk7XG4gICAgcmV0dXJuIHRoaXMuY2FtZXJhLmxvb2tBdCgodGhhdCA9IHRoaXMudGFyZ2V0LnBvc2l0aW9uKSAhPSBudWxsXG4gICAgICA/IHRoYXRcbiAgICAgIDogdGhpcy50YXJnZXQpO1xuICB9O1xuICBwcm90b3R5cGUuYXV0b1JvdGF0ZSA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHJldHVybiB0aGlzLnNldFBvc2l0aW9uKHBpIC8gMTAgKiBzaW4odGltZSAvIDEwMDApKTtcbiAgfTtcbiAgcmV0dXJuIERlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbn0oKSk7IiwidmFyIHBpO1xucGkgPSByZXF1aXJlKCdzdGQnKS5waTtcblRIUkVFLkNhcHN1bGVHZW9tZXRyeSA9IGZ1bmN0aW9uKHJhZGl1cywgcmFkaWFsU2VnbWVudHMsIGhlaWdodCwgbGVuZ3Rod2lzZVNlZ21lbnRzKXtcbiAgdmFyIGhhbGZTcGhlcmUsIHR1YmU7XG4gIGhhbGZTcGhlcmUgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkocmFkaXVzLCByYWRpYWxTZWdtZW50cywgcmFkaWFsU2VnbWVudHMsIDAsIHBpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAwLCAwKSk7XG4gIGhhbGZTcGhlcmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25YKC1waSAvIDIpKTtcbiAgaGFsZlNwaGVyZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSgxLCAwLjUsIDEpKTtcbiAgdHViZSA9IG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KHJhZGl1cywgcmFkaXVzLCBoZWlnaHQsIHJhZGlhbFNlZ21lbnRzICogMiwgbGVuZ3Rod2lzZVNlZ21lbnRzLCB0cnVlKTtcbiAgdHViZS5hcHBseU1hdHJpeChuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VUcmFuc2xhdGlvbigwLCAtaGVpZ2h0IC8gMiwgMCkpO1xuICBoYWxmU3BoZXJlLm1lcmdlKHR1YmUpO1xuICByZXR1cm4gaGFsZlNwaGVyZTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCBzaW4sIGNvcywgbGVycCwgcmFuZCwgZmxvb3IsIG1hcCwgRWFzZSwgVEhSRUUsIFBhbGV0dGUsIFNjZW5lTWFuYWdlciwgRGVidWdDYW1lcmFQb3NpdGlvbmVyLCBBcmVuYSwgVGFibGUsIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgTGlnaHRpbmcsIEJyaWNrUHJldmlldywgTml4aWVEaXNwbGF5LCBUcmFja2JhbGxDb250cm9scywgVGhyZWVKc1JlbmRlcmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgbGVycCA9IHJlZiQubGVycCwgcmFuZCA9IHJlZiQucmFuZCwgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcDtcbkVhc2UgPSByZXF1aXJlKCdzdGQnKS5FYXNlO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5QYWxldHRlID0gcmVxdWlyZSgnLi9wYWxldHRlJykuUGFsZXR0ZTtcblNjZW5lTWFuYWdlciA9IHJlcXVpcmUoJy4vc2NlbmUtbWFuYWdlcicpLlNjZW5lTWFuYWdlcjtcbkRlYnVnQ2FtZXJhUG9zaXRpb25lciA9IHJlcXVpcmUoJy4vZGVidWctY2FtZXJhJykuRGVidWdDYW1lcmFQb3NpdGlvbmVyO1xucmVmJCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cycpLCBBcmVuYSA9IHJlZiQuQXJlbmEsIFRhYmxlID0gcmVmJC5UYWJsZSwgU3RhcnRNZW51ID0gcmVmJC5TdGFydE1lbnUsIEZhaWxTY3JlZW4gPSByZWYkLkZhaWxTY3JlZW4sIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIE5peGllRGlzcGxheSA9IHJlZiQuTml4aWVEaXNwbGF5O1xuVHJhY2tiYWxsQ29udHJvbHMgPSByZXF1aXJlKCcuLi8uLi9saWIvdHJhY2tiYWxsLWNvbnRyb2xzLmpzJykuVHJhY2tiYWxsQ29udHJvbHM7XG5vdXQkLlRocmVlSnNSZW5kZXJlciA9IFRocmVlSnNSZW5kZXJlciA9IChmdW5jdGlvbigpe1xuICBUaHJlZUpzUmVuZGVyZXIuZGlzcGxheU5hbWUgPSAnVGhyZWVKc1JlbmRlcmVyJztcbiAgdmFyIHByb3RvdHlwZSA9IFRocmVlSnNSZW5kZXJlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGhyZWVKc1JlbmRlcmVyO1xuICBmdW5jdGlvbiBUaHJlZUpzUmVuZGVyZXIob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgbmFtZSwgcmVmJCwgcGFydDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHdpZHRoID0gYXJlbmEud2lkdGgsIGhlaWdodCA9IGFyZW5hLmhlaWdodDtcbiAgICBsb2coXCJSZW5kZXJlcjo6bmV3XCIpO1xuICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmVNYW5hZ2VyKHRoaXMub3B0cyk7XG4gICAgdGhpcy5vcHRzLnNjZW5lID0gdGhpcy5zY2VuZTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMCxcbiAgICAgIGxhc3RTZWVuU3RhdGU6ICduby1nYW1lJ1xuICAgIH07XG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5qaXR0ZXIgPSBuZXcgVEhSRUUuT2JqZWN0M0QpO1xuICAgIHRoaXMucGFydHMgPSB7XG4gICAgICB0YWJsZTogbmV3IFRhYmxlKHRoaXMub3B0cywgZ3MpLFxuICAgICAgbGlnaHRpbmc6IG5ldyBMaWdodGluZyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hOiBuZXcgQXJlbmEodGhpcy5vcHRzLCBncyksXG4gICAgICBzdGFydE1lbnU6IG5ldyBTdGFydE1lbnUodGhpcy5vcHRzLCBncyksXG4gICAgICBmYWlsU2NyZWVuOiBuZXcgRmFpbFNjcmVlbih0aGlzLm9wdHMsIGdzKSxcbiAgICAgIG5leHRCcmljazogbmV3IEJyaWNrUHJldmlldyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHNjb3JlOiBuZXcgTml4aWVEaXNwbGF5KHRoaXMub3B0cywgZ3MpXG4gICAgfTtcbiAgICBmb3IgKG5hbWUgaW4gcmVmJCA9IHRoaXMucGFydHMpIHtcbiAgICAgIHBhcnQgPSByZWYkW25hbWVdO1xuICAgICAgcGFydC5hZGRUbyh0aGlzLmppdHRlcik7XG4gICAgfVxuICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnJvb3QucG9zaXRpb24uc2V0KC10aGlzLm9wdHMucHJldmlld0Rpc3RhbmNlRnJvbUNlbnRlciwgMCwgLXRoaXMub3B0cy5wcmV2aWV3RGlzdGFuY2VGcm9tRWRnZSk7XG4gICAgdGhpcy5wYXJ0cy5hcmVuYS5yb290LnBvc2l0aW9uLnNldCgwLCAwLCAtdGhpcy5vcHRzLmFyZW5hRGlzdGFuY2VGcm9tRWRnZSk7XG4gICAgdGhpcy5hZGRUcmFja2JhbGwoKTtcbiAgICB0aGlzLnNjZW5lLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgdGhpcy5zY2VuZS5yZWdpc3RyYXRpb24ucG9zaXRpb24uc2V0KDAsIC10aGlzLm9wdHMuY2FtZXJhRWxldmF0aW9uLCAtdGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UgKiA0KTtcbiAgICB0aGlzLnNjZW5lLnNob3dIZWxwZXJzKCk7XG4gIH1cbiAgcHJvdG90eXBlLmFkZFRyYWNrYmFsbCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRyYWNrYmFsbFRhcmdldDtcbiAgICB0cmFja2JhbGxUYXJnZXQgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdHJhY2tiYWxsVGFyZ2V0LnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2U7XG4gICAgdGhpcy5zY2VuZS5hZGQodHJhY2tiYWxsVGFyZ2V0KTtcbiAgICB0aGlzLnRyYWNrYmFsbCA9IG5ldyBUSFJFRS5UcmFja2JhbGxDb250cm9scyh0aGlzLnNjZW5lLmNhbWVyYSwgdHJhY2tiYWxsVGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcy50cmFja2JhbGwucGFuU3BlZWQgPSAxO1xuICB9O1xuICBwcm90b3R5cGUuYXBwZW5kVG8gPSBmdW5jdGlvbihob3N0KXtcbiAgICByZXR1cm4gaG9zdC5hcHBlbmRDaGlsZCh0aGlzLnNjZW5lLmRvbUVsZW1lbnQpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciByb3dzLCBwO1xuICAgIHRoaXMudHJhY2tiYWxsLnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUudXBkYXRlKCk7XG4gICAgaWYgKGdzLm1ldGFnYW1lU3RhdGUgIT09IHRoaXMuc3RhdGUubGFzdFNlZW5TdGF0ZSkge1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gZmFsc2U7XG4gICAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICAgIGNhc2UgJ3JlbW92ZS1saW5lcyc6XG4gICAgICAgIC8vIGZhbGx0aHJvdWdoXG4gICAgICBjYXNlICdnYW1lJzpcbiAgICAgICAgdGhpcy5wYXJ0cy5hcmVuYS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBzd2l0Y2ggKGdzLm1ldGFnYW1lU3RhdGUpIHtcbiAgICBjYXNlICduby1nYW1lJzpcbiAgICAgIGxvZygnbm8tZ2FtZScpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHJvd3MgPSBncy5jb3JlLnJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgICBwID0gZ3MuYXJlbmEuemFwQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgICAgZ3Muc2xvd2Rvd24gPSAxICsgRWFzZS5leHBJbihwLCAyLCAwKTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEuemFwTGluZXMoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncyk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnJ1blRvTnVtYmVyKGdzLmFyZW5hLnphcEFuaW1hdGlvbi5wcm9ncmVzcywgZ3Muc2NvcmUucG9pbnRzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucHVsc2UoZ3MuZWxhcHNlZFRpbWUgLyAxMDAwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgZ3Muc2xvd2Rvd24gPSAxO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGUoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlTaGFwZShncy5icmljay5uZXh0KTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncyk7XG4gICAgICB0aGlzLnBhcnRzLnNjb3JlLnNldE51bWJlcihncy5zY29yZS5wb2ludHMpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5wdWxzZShncy5lbGFwc2VkVGltZSAvIDEwMDApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5Tm90aGluZygpO1xuICAgICAgdGhpcy5wYXJ0cy5zdGFydE1lbnUudXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdXNlLW1lbnUnOlxuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheU5vdGhpbmcoKTtcbiAgICAgIHRoaXMucGFydHMucGF1c2VNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlOb3RoaW5nKCk7XG4gICAgICB0aGlzLnBhcnRzLmZhaWxTY3JlZW4udXBkYXRlKGdzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBsb2coXCJUaHJlZUpzUmVuZGVyZXI6OnJlbmRlciAtIFVua25vd24gbWV0YWdhbWVzdGF0ZTpcIiwgZ3MubWV0YWdhbWVTdGF0ZSk7XG4gICAgfVxuICAgIHRoaXMucGFydHMuYXJlbmEudXBkYXRlUGFydGljbGVzKGdzKTtcbiAgICB0aGlzLnN0YXRlLmxhc3RTZWVuU3RhdGUgPSBncy5tZXRhZ2FtZVN0YXRlO1xuICAgIHJldHVybiB0aGlzLnNjZW5lLnJlbmRlcigpO1xuICB9O1xuICByZXR1cm4gVGhyZWVKc1JlbmRlcmVyO1xufSgpKTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBQYWxldHRlLCBhc3NldFBhdGgsIHRleHR1cmVzLCBpLCBlbXB0eSwgbm9ybWFsLCBkZWJ1Z1dpcmVmcmFtZSwgaGVscGVyQSwgaGVscGVyQiwgZ2xhc3MsIGNvcHBlciwgbml4aWVEaWdpdHMsIG5peGllQmcsIGJsb2NrcywgY29sb3IsIGhvbG9CbG9ja3MsIHphcCwgdGFibGVUb3AsIHRhYmxlRWRnZSwgdGFibGVGYWNlcywgbGluZXMsIGZsYXJlLCBmbGFyZUZhY2VzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuYXNzZXRQYXRoID0gKGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIFwiYXNzZXRzL1wiICsgaXQ7XG59KTtcbnRleHR1cmVzID0ge1xuICBuaXhpZURpZ2l0c0NvbG9yOiAoZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJlc3VsdHMkLnB1c2goVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJkaWdpdC1cIiArIGkgKyBcIi5jb2wucG5nXCIpKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfSgpKSxcbiAgbml4aWVCZ0NvbG9yOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImRpZ2l0LWJnLmNvbC5wbmdcIikpLFxuICBibG9ja1RpbGVOb3JtYWw6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwidGlsZS5ucm0ucG5nXCIpKSxcbiAgdGFibGVUb3BDb2xvcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5jb2wucG5nXCIpKSxcbiAgdGFibGVFZGdlQ29sb3I6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiYm9hcmQtZi5jb2wucG5nXCIpKSxcbiAgdGFibGVUb3BTcGVjdWxhcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5zcGVjLnBuZ1wiKSksXG4gIGZsYXJlQWxwaGE6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiZmxhcmUuYWxwaGEucG5nXCIpKVxufTtcbm91dCQuZW1wdHkgPSBlbXB0eSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIHZpc2libGU6IGZhbHNlLFxuICBjb2xvcjogMHgwLFxuICBlbWlzc2l2ZTogMHgwLFxuICBvcGFjaXR5OiAwXG59KTtcbm91dCQubm9ybWFsID0gbm9ybWFsID0gbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbDtcbm91dCQuZGVidWdXaXJlZnJhbWUgPSBkZWJ1Z1dpcmVmcmFtZSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIGNvbG9yOiAnd2hpdGUnLFxuICB3aXJlZnJhbWU6IHRydWVcbn0pO1xub3V0JC5oZWxwZXJBID0gaGVscGVyQSA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gIGNvbG9yOiAweGZmMDAwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIG9wYWNpdHk6IDAuNVxufSk7XG5vdXQkLmhlbHBlckIgPSBoZWxwZXJCID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6IDB4MDBmZjAwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgb3BhY2l0eTogMC41XG59KTtcbm91dCQuZ2xhc3MgPSBnbGFzcyA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDIyMjIyMixcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiAxMDAsXG4gIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICBkZXB0aFdyaXRlOiBmYWxzZVxufSk7XG5vdXQkLmNvcHBlciA9IGNvcHBlciA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweDk2NTExMSxcbiAgc3BlY3VsYXI6IDB4Y2I2ZDUxLFxuICBzaGluaW5lc3M6IDMwXG59KTtcbm91dCQubml4aWVEaWdpdHMgPSBuaXhpZURpZ2l0cyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwOyBpJCA8PSA5OyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4dHVyZXMubml4aWVEaWdpdHNDb2xvcltpXSxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgY29sb3I6IDB4ZmYzMzAwLFxuICAgICAgZW1pc3NpdmU6IDB4ZmZiYjAwXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLm5peGllQmcgPSBuaXhpZUJnID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgbWFwOiB0ZXh0dXJlcy5uaXhpZUJnQ29sb3IsXG4gIGNvbG9yOiAweDAwMDAwMCxcbiAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc2hpbmluZXNzOiA4MFxufSk7XG5vdXQkLmJsb2NrcyA9IGJsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICBzcGVjdWxhcjogUGFsZXR0ZS5zcGVjQ29sb3JzW2ldLFxuICAgICAgc2hpbmluZXNzOiAxMDAsXG4gICAgICBub3JtYWxNYXA6IHRleHR1cmVzLmJsb2NrVGlsZU5vcm1hbFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5ob2xvQmxvY2tzID0gaG9sb0Jsb2NrcyA9IChmdW5jdGlvbigpe1xuICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBQYWxldHRlLnRpbGVDb2xvcnMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgbWV0YWw6IHRydWUsXG4gICAgICBjb2xvcjogY29sb3IsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGVtaXNzaXZlOiAweGZmZmZmZixcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICAgIHNwZWN1bGFyOiBQYWxldHRlLnNwZWNDb2xvcnNbaV0sXG4gICAgICBzaGluaW5lc3M6IDEwMCxcbiAgICAgIG5vcm1hbE1hcDogdGV4dHVyZXMuYmxvY2tUaWxlTm9ybWFsXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLnphcCA9IHphcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIGNvbG9yOiAweGZmZmZmZixcbiAgZW1pc3NpdmU6IDB4ZmZmZmZmXG59KTtcbm91dCQudGFibGVUb3AgPSB0YWJsZVRvcCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIG1hcDogdGV4dHVyZXMudGFibGVUb3BDb2xvcixcbiAgc3BlY3VsYXI6IDB4ZmZmZmZmLFxuICBzcGVjdWxhck1hcDogdGV4dHVyZXMudGFibGVUb3BTcGVjdWxhcixcbiAgc2hpbmluZXNzOiAxMDBcbn0pO1xub3V0JC50YWJsZUVkZ2UgPSB0YWJsZUVkZ2UgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBtYXA6IHRleHR1cmVzLnRhYmxlRWRnZUNvbG9yXG59KTtcbm91dCQudGFibGVGYWNlcyA9IHRhYmxlRmFjZXMgPSBuZXcgVEhSRUUuTWVzaEZhY2VNYXRlcmlhbChbdGFibGVFZGdlLCB0YWJsZUVkZ2UsIHRhYmxlVG9wLCB0YWJsZUVkZ2UsIHRhYmxlRWRnZSwgdGFibGVFZGdlXSk7XG5vdXQkLmxpbmVzID0gbGluZXMgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gUGFsZXR0ZS50aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNvbG9yID0gcmVmJFtpJF07XG4gICAgcmVzdWx0cyQucHVzaChuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6IGNvbG9yXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0oKSk7XG5vdXQkLmZsYXJlID0gZmxhcmUgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBjb2xvcjogMHgwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgZW1pc3NpdmU6ICd3aGl0ZScsXG4gIG9wYWNpdHk6IDAuMixcbiAgZGVwdGhXcml0ZTogZmFsc2UsXG4gIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICBhbHBoYU1hcDogdGV4dHVyZXMuZmxhcmVBbHBoYVxufSk7XG5vdXQkLmZsYXJlRmFjZXMgPSBmbGFyZUZhY2VzID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoW2ZsYXJlLCBmbGFyZSwgZW1wdHksIGVtcHR5LCBmbGFyZSwgZmxhcmVdKTsiLCJ2YXIgVEhSRUUsIHJlZiQsIGxvZywgbWFwLCBwbHVjaywgbmV1dHJhbCwgcmVkLCBvcmFuZ2UsIGdyZWVuLCBtYWdlbnRhLCBibHVlLCBicm93biwgeWVsbG93LCBjeWFuLCBjb2xvck9yZGVyLCB0aWxlQ29sb3JzLCBzcGVjQ29sb3JzLCBQYWxldHRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBtYXAgPSByZWYkLm1hcCwgcGx1Y2sgPSByZWYkLnBsdWNrO1xub3V0JC5uZXV0cmFsID0gbmV1dHJhbCA9IFsweGZmZmZmZiwgMHhjY2NjY2MsIDB4ODg4ODg4LCAweDIxMjEyMV07XG5vdXQkLnJlZCA9IHJlZCA9IFsweEZGNDQ0NCwgMHhGRjc3NzcsIDB4ZGQ0NDQ0LCAweDU1MTExMV07XG5vdXQkLm9yYW5nZSA9IG9yYW5nZSA9IFsweEZGQkIzMywgMHhGRkNDODgsIDB4Q0M4ODAwLCAweDU1MzMwMF07XG5vdXQkLmdyZWVuID0gZ3JlZW4gPSBbMHg0NGZmNjYsIDB4ODhmZmFhLCAweDIyYmIzMywgMHgxMTU1MTFdO1xub3V0JC5tYWdlbnRhID0gbWFnZW50YSA9IFsweGZmMzNmZiwgMHhmZmFhZmYsIDB4YmIyMmJiLCAweDU1MTE1NV07XG5vdXQkLmJsdWUgPSBibHVlID0gWzB4NjZiYmZmLCAweGFhZGRmZiwgMHg1NTg4ZWUsIDB4MTExMTU1XTtcbm91dCQuYnJvd24gPSBicm93biA9IFsweGZmYmIzMywgMHhmZmNjODgsIDB4YmI5OTAwLCAweDU1NTUxMV07XG5vdXQkLnllbGxvdyA9IHllbGxvdyA9IFsweGVlZWUxMSwgMHhmZmZmYWEsIDB4Y2NiYjAwLCAweDU1NTUxMV07XG5vdXQkLmN5YW4gPSBjeWFuID0gWzB4NDRkZGZmLCAweGFhZTNmZiwgMHgwMGFhY2MsIDB4MDA2Njk5XTtcbmNvbG9yT3JkZXIgPSBbbmV1dHJhbCwgcmVkLCBvcmFuZ2UsIHllbGxvdywgZ3JlZW4sIGN5YW4sIGJsdWUsIG1hZ2VudGFdO1xub3V0JC50aWxlQ29sb3JzID0gdGlsZUNvbG9ycyA9IG1hcChwbHVjaygyKSwgY29sb3JPcmRlcik7XG5vdXQkLnNwZWNDb2xvcnMgPSBzcGVjQ29sb3JzID0gbWFwKHBsdWNrKDApLCBjb2xvck9yZGVyKTtcbm91dCQuUGFsZXR0ZSA9IFBhbGV0dGUgPSB7XG4gIG5ldXRyYWw6IG5ldXRyYWwsXG4gIHJlZDogcmVkLFxuICBvcmFuZ2U6IG9yYW5nZSxcbiAgeWVsbG93OiB5ZWxsb3csXG4gIGdyZWVuOiBncmVlbixcbiAgY3lhbjogY3lhbixcbiAgYmx1ZTogYmx1ZSxcbiAgbWFnZW50YTogbWFnZW50YSxcbiAgdGlsZUNvbG9yczogdGlsZUNvbG9ycyxcbiAgc3BlY0NvbG9yczogc3BlY0NvbG9yc1xufTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgVEhSRUUsIE1hdGVyaWFscywgU2NlbmVNYW5hZ2VyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuVEhSRUUgPSByZXF1aXJlKCd0aHJlZS1qcy12ci1leHRlbnNpb25zJyk7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuL21hdHMnKTtcbm91dCQuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyID0gKGZ1bmN0aW9uKCl7XG4gIFNjZW5lTWFuYWdlci5kaXNwbGF5TmFtZSA9ICdTY2VuZU1hbmFnZXInO1xuICB2YXIgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyT3BhY2l0eSwgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFNjZW5lTWFuYWdlcjtcbiAgaGVscGVyTWFya2VyU2l6ZSA9IDAuMDI7XG4gIGhlbHBlck1hcmtlck9wYWNpdHkgPSAwLjM7XG4gIGhlbHBlck1hcmtlckdlbyA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSk7XG4gIGZ1bmN0aW9uIFNjZW5lTWFuYWdlcihvcHRzKXtcbiAgICB2YXIgYXNwZWN0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgdGhpcy5yZXNpemUgPSBiaW5kJCh0aGlzLCAncmVzaXplJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLnplcm9TZW5zb3IgPSBiaW5kJCh0aGlzLCAnemVyb1NlbnNvcicsIHByb3RvdHlwZSk7XG4gICAgdGhpcy5nb0Z1bGxzY3JlZW4gPSBiaW5kJCh0aGlzLCAnZ29GdWxsc2NyZWVuJywgcHJvdG90eXBlKTtcbiAgICBhc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgICAgYW50aWFsaWFzOiB0cnVlXG4gICAgfSk7XG4gICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgIHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDc1LCBhc3BlY3QsIDAuMDAxLCAxMDAwKTtcbiAgICB0aGlzLmNvbnRyb2xzID0gbmV3IFRIUkVFLlZSQ29udHJvbHModGhpcy5jYW1lcmEpO1xuICAgIHRoaXMudnJFZmZlY3QgPSBuZXcgVEhSRUUuVlJFZmZlY3QodGhpcy5yZW5kZXJlcik7XG4gICAgdGhpcy52ckVmZmVjdC5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoIC0gMSwgd2luZG93LmlubmVySGVpZ2h0IC0gMSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnplcm9TZW5zb3IsIHRydWUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCB0aGlzLmdvRnVsbHNjcmVlbik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZyTW9kZTogbmF2aWdhdG9yLmdldFZSRGV2aWNlcyAhPSBudWxsXG4gICAgfTtcbiAgICB0aGlzLnJvb3QgPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24gPSBuZXcgVEhSRUUuT2JqZWN0M0Q7XG4gICAgdGhpcy5zY2VuZS5hZGQodGhpcy5yb290KTtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckEpKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dIZWxwZXJzID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZ3JpZCwgYXhpcywgcm9vdEF4aXM7XG4gICAgZ3JpZCA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwLCAwLjEpO1xuICAgIGF4aXMgPSBuZXcgVEhSRUUuQXhpc0hlbHBlcigxKTtcbiAgICByb290QXhpcyA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKDAuNSk7XG4gICAgYXhpcy5wb3NpdGlvbi56ID0gdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24uejtcbiAgICByZXR1cm4gcm9vdEF4aXMucG9zaXRpb24ueiA9IHRoaXMucm9vdC5wb3NpdGlvbi56O1xuICB9O1xuICBwcm90b3R5cGUuZW5hYmxlU2hhZG93Q2FzdGluZyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBTb2Z0ID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEVuYWJsZWQgPSB0cnVlO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhRmFyID0gMTAwMDtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd0NhbWVyYUZvdiA9IDUwO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93Q2FtZXJhTmVhciA9IDM7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBCaWFzID0gMC4wMDM5O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwV2lkdGggPSAxMDI0O1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBEYXJrbmVzcyA9IDAuNTtcbiAgfTtcbiAgcHJvdG90eXBlLmdvRnVsbHNjcmVlbiA9IGZ1bmN0aW9uKCl7XG4gICAgbG9nKCdTdGFydGluZyBmdWxsc2NyZWVuLi4uJyk7XG4gICAgcmV0dXJuIHRoaXMudnJFZmZlY3Quc2V0RnVsbFNjcmVlbih0cnVlKTtcbiAgfTtcbiAgcHJvdG90eXBlLnplcm9TZW5zb3IgPSBmdW5jdGlvbihldmVudCl7XG4gICAgdmFyIGtleUNvZGU7XG4gICAga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoa2V5Q29kZSA9PT0gODYpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnJlc2V0U2Vuc29yKCk7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmNhbWVyYS5hc3BlY3QgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gICAgcmV0dXJuIHRoaXMudnJFZmZlY3Quc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuY29udHJvbHMudXBkYXRlKCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLnZyRWZmZWN0LnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdkb21FbGVtZW50Jywge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGkkLCBsZW4kLCBvYmosIHRoYXQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSBhcmd1bWVudHMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIG9iaiA9IGFyZ3VtZW50c1tpJF07XG4gICAgICBsb2coJ1NjZW5lTWFuYWdlcjo6YWRkIC0nLCBvYmopO1xuICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLnJlZ2lzdHJhdGlvbi5hZGQoKHRoYXQgPSBvYmoucm9vdCkgIT0gbnVsbCA/IHRoYXQgOiBvYmopKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICByZXR1cm4gU2NlbmVNYW5hZ2VyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufSIsInZhciBwb3csIHF1YWRJbiwgcXVhZE91dCwgY3ViaWNJbiwgY3ViaWNPdXQsIHF1YXJ0SW4sIHF1YXJ0T3V0LCBxdWludEluLCBxdWludE91dCwgZXhwSW4sIGV4cE91dCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnBvdyA9IHJlcXVpcmUoJ3N0ZCcpLnBvdztcbm91dCQucXVhZEluID0gcXVhZEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiB0ICogdCArIGI7XG59O1xub3V0JC5xdWFkT3V0ID0gcXVhZE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIHQgKiAodCAtIDIpICsgYjtcbn07XG5vdXQkLmN1YmljSW4gPSBjdWJpY0luID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBNYXRoLnBvdyh0LCAzKSArIGI7XG59O1xub3V0JC5jdWJpY091dCA9IGN1YmljT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiAoTWF0aC5wb3codCAtIDEsIDMpICsgMSkgKyBiO1xufTtcbm91dCQucXVhcnRJbiA9IHF1YXJ0SW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDQpICsgYjtcbn07XG5vdXQkLnF1YXJ0T3V0ID0gcXVhcnRPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gLWMgKiAoTWF0aC5wb3codCAtIDEsIDQpIC0gMSkgKyBiO1xufTtcbm91dCQucXVpbnRJbiA9IHF1aW50SW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDUpICsgYjtcbn07XG5vdXQkLnF1aW50T3V0ID0gcXVpbnRPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgNSkgKyAxKSArIGI7XG59O1xub3V0JC5leHBJbiA9IGV4cEluID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIGMgKiBwb3coMiwgMTAgKiAodCAtIDEpKSArIGI7XG59O1xub3V0JC5leHBPdXQgPSBleHBPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqICgoLXBvdygyLCAtMTAgKiB0KSkgKyAxKSArIGI7XG59OyIsInZhciBpZCwgbG9nLCBmbGlwLCBkZWxheSwgZmxvb3IsIHJhbmRvbSwgcmFuZCwgcmFuZEludCwgcmFuZG9tRnJvbSwgYWRkVjIsIGZpbHRlciwgcGx1Y2ssIHBpLCB0YXUsIHBvdywgc2luLCBjb3MsIG1pbiwgbWF4LCBsZXJwLCBtYXAsIHNwbGl0LCBqb2luLCB1bmxpbmVzLCBkaXYsIHdyYXAsIGxpbWl0LCByYWYsIHRoYXQsIEVhc2UsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5vdXQkLmlkID0gaWQgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdDtcbn07XG5vdXQkLmxvZyA9IGxvZyA9IGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIHJldHVybiBhcmd1bWVudHNbMF07XG59O1xub3V0JC5mbGlwID0gZmxpcCA9IGZ1bmN0aW9uKM67KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHJldHVybiDOuyhiLCBhKTtcbiAgfTtcbn07XG5vdXQkLmRlbGF5ID0gZGVsYXkgPSBmbGlwKHNldFRpbWVvdXQpO1xub3V0JC5mbG9vciA9IGZsb29yID0gTWF0aC5mbG9vcjtcbm91dCQucmFuZG9tID0gcmFuZG9tID0gTWF0aC5yYW5kb207XG5vdXQkLnJhbmQgPSByYW5kID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgcmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbn07XG5vdXQkLnJhbmRJbnQgPSByYW5kSW50ID0gZnVuY3Rpb24obWluLCBtYXgpe1xuICByZXR1cm4gbWluICsgZmxvb3IocmFuZG9tKCkgKiAobWF4IC0gbWluKSk7XG59O1xub3V0JC5yYW5kb21Gcm9tID0gcmFuZG9tRnJvbSA9IGZ1bmN0aW9uKGxpc3Qpe1xuICByZXR1cm4gbGlzdFtyYW5kKDAsIGxpc3QubGVuZ3RoIC0gMSldO1xufTtcbm91dCQuYWRkVjIgPSBhZGRWMiA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gW2FbMF0gKyBiWzBdLCBhWzFdICsgYlsxXV07XG59O1xub3V0JC5maWx0ZXIgPSBmaWx0ZXIgPSBjdXJyeSQoZnVuY3Rpb24ozrssIGxpc3Qpe1xuICB2YXIgaSQsIGxlbiQsIHgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbGlzdC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsaXN0W2kkXTtcbiAgICBpZiAozrsoeCkpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC5wbHVjayA9IHBsdWNrID0gY3VycnkkKGZ1bmN0aW9uKHAsIG8pe1xuICByZXR1cm4gb1twXTtcbn0pO1xub3V0JC5waSA9IHBpID0gTWF0aC5QSTtcbm91dCQudGF1ID0gdGF1ID0gcGkgKiAyO1xub3V0JC5wb3cgPSBwb3cgPSBNYXRoLnBvdztcbm91dCQuc2luID0gc2luID0gTWF0aC5zaW47XG5vdXQkLmNvcyA9IGNvcyA9IE1hdGguY29zO1xub3V0JC5taW4gPSBtaW4gPSBNYXRoLm1pbjtcbm91dCQubWF4ID0gbWF4ID0gTWF0aC5tYXg7XG5vdXQkLmxlcnAgPSBsZXJwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBwKXtcbiAgcmV0dXJuIG1pbiArIHAgKiAobWF4IC0gbWluKTtcbn0pO1xub3V0JC5tYXAgPSBtYXAgPSBjdXJyeSQoZnVuY3Rpb24ozrssIGwpe1xuICB2YXIgaSQsIGxlbiQsIHgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gbC5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHggPSBsW2kkXTtcbiAgICByZXN1bHRzJC5wdXNoKM67KHgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KTtcbm91dCQuc3BsaXQgPSBzcGxpdCA9IGN1cnJ5JChmdW5jdGlvbihjaGFyLCBzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KGNoYXIpO1xufSk7XG5vdXQkLmpvaW4gPSBqb2luID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuam9pbihjaGFyKTtcbn0pO1xub3V0JC51bmxpbmVzID0gdW5saW5lcyA9IGpvaW4oXCJcXG5cIik7XG5vdXQkLmRpdiA9IGRpdiA9IGN1cnJ5JChmdW5jdGlvbihhLCBiKXtcbiAgcmV0dXJuIGZsb29yKGEgLyBiKTtcbn0pO1xub3V0JC53cmFwID0gd3JhcCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLmxpbWl0ID0gbGltaXQgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIG4pe1xuICBpZiAobiA+IG1heCkge1xuICAgIHJldHVybiBtYXg7XG4gIH0gZWxzZSBpZiAobiA8IG1pbikge1xuICAgIHJldHVybiBtaW47XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG47XG4gIH1cbn0pO1xub3V0JC5yYWYgPSByYWYgPSAodGhhdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgPyB0aGF0XG4gIDogKHRoYXQgPSB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lKSAhPSBudWxsXG4gICAgPyB0aGF0XG4gICAgOiAodGhhdCA9IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICAgID8gdGhhdFxuICAgICAgOiBmdW5jdGlvbijOuyl7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KM67LCAxMDAwIC8gNjApO1xuICAgICAgfTtcbm91dCQuRWFzZSA9IEVhc2UgPSByZXF1aXJlKCcuL2Vhc2luZycpO1xuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHVubGluZXMsIFRpbWVyLCB0eXBlRGV0ZWN0LCB0ZW1wbGF0ZSwgRGVidWdPdXRwdXQsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHVubGluZXMgPSByZWYkLnVubGluZXM7XG5UaW1lciA9IHJlcXVpcmUoJy4uL3V0aWxzL3RpbWVyJyk7XG50eXBlRGV0ZWN0ID0gZnVuY3Rpb24odGhpbmcpe1xuICBpZiAodHlwZW9mIHRoaW5nICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmc7XG4gIH0gZWxzZSBpZiAodGhpbmcucHJvZ3Jlc3MgIT0gbnVsbCkge1xuICAgIHJldHVybiAndGltZXInO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfVxufTtcbnRlbXBsYXRlID0ge1xuICBjZWxsOiBmdW5jdGlvbihpdCl7XG4gICAgaWYgKGl0KSB7XG4gICAgICByZXR1cm4gXCLilpLilpJcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiICBcIjtcbiAgICB9XG4gIH0sXG4gIHNjb3JlOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLCBudWxsLCAyKTtcbiAgfSxcbiAgYnJpY2s6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuc2hhcGUubWFwKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdC5tYXAodGVtcGxhdGUuY2VsbCkuam9pbignICcpO1xuICAgIH0pLmpvaW4oXCJcXG4gICAgICAgIFwiKTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIGtleVN1bW1hcnksIHJlc3VsdHMkID0gW107XG4gICAgaWYgKHRoaXMubGVuZ3RoKSB7XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHRoaXMubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAga2V5U3VtbWFyeSA9IHRoaXNbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKGtleVN1bW1hcnkua2V5ICsgJy0nICsga2V5U3VtbWFyeS5hY3Rpb24gKyBcInxcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIihubyBjaGFuZ2UpXCI7XG4gICAgfVxuICB9LFxuICBmcHM6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGZwc0NvbG9yO1xuICAgIGZwc0NvbG9yID0gdGhpcy5mcHMgPj0gNTVcbiAgICAgID8gJyMwZjAnXG4gICAgICA6IHRoaXMuZnBzID49IDMwID8gJyNmZjAnIDogJyNmMDAnO1xuICAgIHJldHVybiBcIjxzcGFuIHN0eWxlPVxcXCJjb2xvcjpcIiArIGZwc0NvbG9yICsgXCJcXFwiPlwiICsgdGhpcy5mcHMgKyBcIjwvc3Bhbj5cIjtcbiAgfSxcbiAgbm9ybWFsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBcIiBtZXRhIC0gXCIgKyB0aGlzLm1ldGFnYW1lU3RhdGUgKyBcIlxcbiB0aW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRUaW1lICsgXCJcXG5mcmFtZSAtIFwiICsgdGhpcy5lbGFwc2VkRnJhbWVzICsgXCJcXG4gIGZwcyAtIFwiICsgdGVtcGxhdGUuZnBzLmFwcGx5KHRoaXMpICsgXCJcXG4ga2V5cyAtIFwiICsgdGVtcGxhdGUua2V5cy5hcHBseSh0aGlzLmlucHV0U3RhdGUpICsgXCJcXG5cXG4gIFwiICsgdGVtcGxhdGUuZHVtcCh0aGlzLmNvcmUsIDIpO1xuICB9LFxuICB0aW1lcjogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBUaW1lci50b1N0cmluZyhpdCk7XG4gIH0sXG4gIGR1bXA6IGZ1bmN0aW9uKG9iaiwgZGVwdGgpe1xuICAgIHZhciBzcGFjZSwgaywgdjtcbiAgICBkZXB0aCA9PSBudWxsICYmIChkZXB0aCA9IDApO1xuICAgIHNwYWNlID0gKGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiByZXBlYXRTdHJpbmckKFwiIFwiLCBkZXB0aCkgKyBpdDtcbiAgICB9KTtcbiAgICBzd2l0Y2ggKHR5cGVEZXRlY3Qob2JqKSkge1xuICAgIGNhc2UgJ3RpbWVyJzpcbiAgICAgIHJldHVybiBzcGFjZSh0ZW1wbGF0ZS50aW1lcihvYmopKTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHNwYWNlKG9iaik7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBzcGFjZShvYmopO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gXCJcXG5cIiArIHVubGluZXMoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgICBmb3IgKGsgaW4gcmVmJCA9IG9iaikge1xuICAgICAgICAgIHYgPSByZWYkW2tdO1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goayArIFwiOlwiICsgdGVtcGxhdGUuZHVtcCh2LCBkZXB0aCArIDIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgICB9KCkpKTtcbiAgICB9XG4gIH0sXG4gIG1lbnVJdGVtczogZnVuY3Rpb24oKXtcbiAgICB2YXIgaXgsIGl0ZW07XG4gICAgcmV0dXJuIFwiXCIgKyB1bmxpbmVzKChmdW5jdGlvbigpe1xuICAgICAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubWVudURhdGEpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICAgIGl4ID0gaSQ7XG4gICAgICAgIGl0ZW0gPSByZWYkW2kkXTtcbiAgICAgICAgcmVzdWx0cyQucHVzaCh0ZW1wbGF0ZS5tZW51SXRlbS5jYWxsKGl0ZW0sIGl4LCB0aGlzLmN1cnJlbnRJbmRleCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0uY2FsbCh0aGlzKSkpO1xuICB9LFxuICBzdGFydE1lbnU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiU1RBUlQgTUVOVVxcblwiICsgdGVtcGxhdGUubWVudUl0ZW1zLmFwcGx5KHRoaXMpO1xuICB9LFxuICBtZW51SXRlbTogZnVuY3Rpb24oaW5kZXgsIGN1cnJlbnRJbmRleCl7XG4gICAgcmV0dXJuIFwiXCIgKyAoaW5kZXggPT09IGN1cnJlbnRJbmRleCA/IFwiPlwiIDogXCIgXCIpICsgXCIgXCIgKyB0aGlzLnRleHQ7XG4gIH0sXG4gIGZhaWx1cmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIFwiICAgR0FNRSBPVkVSXFxuXFxuICAgICBTY29yZVxcblxcbiAgU2luZ2xlIC0gXCIgKyB0aGlzLnNjb3JlLnNpbmdsZXMgKyBcIlxcbiAgRG91YmxlIC0gXCIgKyB0aGlzLnNjb3JlLmRvdWJsZXMgKyBcIlxcbiAgVHJpcGxlIC0gXCIgKyB0aGlzLnNjb3JlLnRyaXBsZXMgKyBcIlxcbiAgVGV0cmlzIC0gXCIgKyB0aGlzLnNjb3JlLnRldHJpcyArIFwiXFxuXFxuVG90YWwgTGluZXM6IFwiICsgdGhpcy5zY29yZS5saW5lcyArIFwiXFxuXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcy5nYW1lT3Zlcik7XG4gIH1cbn07XG5vdXQkLkRlYnVnT3V0cHV0ID0gRGVidWdPdXRwdXQgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdPdXRwdXQuZGlzcGxheU5hbWUgPSAnRGVidWdPdXRwdXQnO1xuICB2YXIgcHJvdG90eXBlID0gRGVidWdPdXRwdXQucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnT3V0cHV0O1xuICBmdW5jdGlvbiBEZWJ1Z091dHB1dCgpe1xuICAgIHZhciByZWYkO1xuICAgIHRoaXMuZGJvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRibyk7XG4gICAgcmVmJCA9IHRoaXMuZGJvLnN0eWxlO1xuICAgIHJlZiQucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIHJlZiQudG9wID0gMDtcbiAgICByZWYkLmxlZnQgPSAwO1xuICB9XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihzdGF0ZSl7XG4gICAgc3dpdGNoIChzdGF0ZS5tZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZ2FtZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUubm9ybWFsLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdmYWlsdXJlJzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5mYWlsdXJlLmFwcGx5KHN0YXRlKTtcbiAgICBjYXNlICdzdGFydC1tZW51JzpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSB0ZW1wbGF0ZS5zdGFydE1lbnUuYXBwbHkoc3RhdGUuc3RhcnRNZW51KTtcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSBcIlVua25vd24gbWV0YWdhbWUgc3RhdGU6IFwiICsgc3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7XG5mdW5jdGlvbiByZXBlYXRTdHJpbmckKHN0ciwgbil7XG4gIGZvciAodmFyIHIgPSAnJzsgbiA+IDA7IChuID4+PSAxKSAmJiAoc3RyICs9IHN0cikpIGlmIChuICYgMSkgciArPSBzdHI7XG4gIHJldHVybiByO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYWYsIGZsb29yLCBGcmFtZURyaXZlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFmID0gcmVmJC5yYWYsIGZsb29yID0gcmVmJC5mbG9vcjtcbm91dCQuRnJhbWVEcml2ZXIgPSBGcmFtZURyaXZlciA9IChmdW5jdGlvbigpe1xuICBGcmFtZURyaXZlci5kaXNwbGF5TmFtZSA9ICdGcmFtZURyaXZlcic7XG4gIHZhciBmcHNIaXN0b3J5V2luZG93LCBwcm90b3R5cGUgPSBGcmFtZURyaXZlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWVEcml2ZXI7XG4gIGZwc0hpc3RvcnlXaW5kb3cgPSAyMDtcbiAgZnVuY3Rpb24gRnJhbWVEcml2ZXIob25GcmFtZSl7XG4gICAgdGhpcy5vbkZyYW1lID0gb25GcmFtZTtcbiAgICB0aGlzLmZyYW1lID0gYmluZCQodGhpcywgJ2ZyYW1lJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJGcmFtZURyaXZlcjo6bmV3XCIpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB6ZXJvOiAwLFxuICAgICAgdGltZTogMCxcbiAgICAgIGZyYW1lOiAwLFxuICAgICAgcnVubmluZzogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuZnBzID0gMDtcbiAgICB0aGlzLmZwc0hpc3RvcnkgPSByZXBlYXRBcnJheSQoWzBdLCBmcHNIaXN0b3J5V2luZG93KTtcbiAgfVxuICBwcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBub3csIM6UdDtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nKSB7XG4gICAgICByYWYodGhpcy5mcmFtZSk7XG4gICAgfVxuICAgIG5vdyA9IERhdGUubm93KCkgLSB0aGlzLnN0YXRlLnplcm87XG4gICAgzpR0ID0gbm93IC0gdGhpcy5zdGF0ZS50aW1lO1xuICAgIHRoaXMucHVzaEhpc3RvcnkozpR0KTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSBub3c7XG4gICAgdGhpcy5zdGF0ZS5mcmFtZSA9IHRoaXMuc3RhdGUuZnJhbWUgKyAxO1xuICAgIHRoaXMuc3RhdGUuzpR0ID0gzpR0O1xuICAgIHJldHVybiB0aGlzLm9uRnJhbWUozpR0LCB0aGlzLnN0YXRlLnRpbWUsIHRoaXMuc3RhdGUuZnJhbWUsIHRoaXMuZnBzKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSB0cnVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdGFydCAtIHN0YXJ0aW5nXCIpO1xuICAgIHRoaXMuc3RhdGUuemVybyA9IERhdGUubm93KCk7XG4gICAgdGhpcy5zdGF0ZS50aW1lID0gMDtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmZyYW1lKCk7XG4gIH07XG4gIHByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5ydW5uaW5nID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsb2coXCJGcmFtZURyaXZlcjo6U3RvcCAtIHN0b3BwaW5nXCIpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgfTtcbiAgcHJvdG90eXBlLnB1c2hIaXN0b3J5ID0gZnVuY3Rpb24ozpR0KXtcbiAgICB0aGlzLmZwc0hpc3RvcnkucHVzaCjOlHQpO1xuICAgIHRoaXMuZnBzSGlzdG9yeS5zaGlmdCgpO1xuICAgIHJldHVybiB0aGlzLmZwcyA9IGZsb29yKDEwMDAgKiBmcHNIaXN0b3J5V2luZG93IC8gdGhpcy5mcHNIaXN0b3J5LnJlZHVjZShjdXJyeSQoZnVuY3Rpb24oeCQsIHkkKXtcbiAgICAgIHJldHVybiB4JCArIHkkO1xuICAgIH0pLCAwKSk7XG4gIH07XG4gIHJldHVybiBGcmFtZURyaXZlcjtcbn0oKSk7XG5mdW5jdGlvbiBiaW5kJChvYmosIGtleSwgdGFyZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiAodGFyZ2V0IHx8IG9iailba2V5XS5hcHBseShvYmosIGFyZ3VtZW50cykgfTtcbn1cbmZ1bmN0aW9uIHJlcGVhdEFycmF5JChhcnIsIG4pe1xuICBmb3IgKHZhciByID0gW107IG4gPiAwOyAobiA+Pj0gMSkgJiYgKGFyciA9IGFyci5jb25jYXQoYXJyKSkpXG4gICAgaWYgKG4gJiAxKSByLnB1c2guYXBwbHkociwgYXJyKTtcbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmlsdGVyLCBUaW1lciwga2V5UmVwZWF0VGltZSwgS0VZLCBBQ1RJT05fTkFNRSwgZXZlbnRTdW1tYXJ5LCBuZXdCbGFua0tleXN0YXRlLCBJbnB1dEhhbmRsZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIGZpbHRlciA9IHJlZiQuZmlsdGVyO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5rZXlSZXBlYXRUaW1lID0gMTUwO1xuS0VZID0ge1xuICBSRVRVUk46IDEzLFxuICBFU0NBUEU6IDI3LFxuICBTUEFDRTogMzIsXG4gIExFRlQ6IDM3LFxuICBVUDogMzgsXG4gIFJJR0hUOiAzOSxcbiAgRE9XTjogNDAsXG4gIFo6IDkwLFxuICBYOiA4OCxcbiAgT05FOiA0OSxcbiAgVFdPOiA1MCxcbiAgVEhSRUU6IDUxLFxuICBGT1VSOiA1MixcbiAgRklWRTogNTMsXG4gIFNJWDogNTQsXG4gIFNFVkVOOiA1NSxcbiAgRUlHSFQ6IDU2LFxuICBOSU5FOiA1NyxcbiAgWkVSTzogNDhcbn07XG5BQ1RJT05fTkFNRSA9IChyZWYkID0ge30sIHJlZiRbS0VZLlJFVFVSTiArIFwiXCJdID0gJ2NvbmZpcm0nLCByZWYkW0tFWS5FU0NBUEUgKyBcIlwiXSA9ICdjYW5jZWwnLCByZWYkW0tFWS5TUEFDRSArIFwiXCJdID0gJ2hhcmQtZHJvcCcsIHJlZiRbS0VZLlggKyBcIlwiXSA9ICdjdycsIHJlZiRbS0VZLlogKyBcIlwiXSA9ICdjY3cnLCByZWYkW0tFWS5VUCArIFwiXCJdID0gJ3VwJywgcmVmJFtLRVkuTEVGVCArIFwiXCJdID0gJ2xlZnQnLCByZWYkW0tFWS5SSUdIVCArIFwiXCJdID0gJ3JpZ2h0JywgcmVmJFtLRVkuRE9XTiArIFwiXCJdID0gJ2Rvd24nLCByZWYkW0tFWS5PTkUgKyBcIlwiXSA9ICdkZWJ1Zy0xJywgcmVmJFtLRVkuVFdPICsgXCJcIl0gPSAnZGVidWctMicsIHJlZiRbS0VZLlRIUkVFICsgXCJcIl0gPSAnZGVidWctMycsIHJlZiRbS0VZLkZPVVIgKyBcIlwiXSA9ICdkZWJ1Zy00JywgcmVmJFtLRVkuRklWRSArIFwiXCJdID0gJ2RlYnVnLTUnLCByZWYkW0tFWS5TSVggKyBcIlwiXSA9ICdkZWJ1Zy02JywgcmVmJFtLRVkuU0VWRU4gKyBcIlwiXSA9ICdkZWJ1Zy03JywgcmVmJFtLRVkuRUlHSFQgKyBcIlwiXSA9ICdkZWJ1Zy04JywgcmVmJFtLRVkuTklORSArIFwiXCJdID0gJ2RlYnVnLTknLCByZWYkW0tFWS5aRVJPICsgXCJcIl0gPSAnZGVidWctMCcsIHJlZiQpO1xuZXZlbnRTdW1tYXJ5ID0gZnVuY3Rpb24oa2V5LCBzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgYWN0aW9uOiBzdGF0ZSA/ICdkb3duJyA6ICd1cCdcbiAgfTtcbn07XG5uZXdCbGFua0tleXN0YXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICB1cDogZmFsc2UsXG4gICAgZG93bjogZmFsc2UsXG4gICAgbGVmdDogZmFsc2UsXG4gICAgcmlnaHQ6IGZhbHNlLFxuICAgIGFjdGlvbkE6IGZhbHNlLFxuICAgIGFjdGlvbkI6IGZhbHNlLFxuICAgIGNvbmZpcm06IGZhbHNlLFxuICAgIGNhbmNlbDogZmFsc2VcbiAgfTtcbn07XG5vdXQkLklucHV0SGFuZGxlciA9IElucHV0SGFuZGxlciA9IChmdW5jdGlvbigpe1xuICBJbnB1dEhhbmRsZXIuZGlzcGxheU5hbWUgPSAnSW5wdXRIYW5kbGVyJztcbiAgdmFyIHByb3RvdHlwZSA9IElucHV0SGFuZGxlci5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gSW5wdXRIYW5kbGVyO1xuICBmdW5jdGlvbiBJbnB1dEhhbmRsZXIoKXtcbiAgICB0aGlzLnN0YXRlU2V0dGVyID0gYmluZCQodGhpcywgJ3N0YXRlU2V0dGVyJywgcHJvdG90eXBlKTtcbiAgICBsb2coXCJJbnB1dEhhbmRsZXI6Om5ld1wiKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5zdGF0ZVNldHRlcih0cnVlKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN0YXRlU2V0dGVyKGZhbHNlKSk7XG4gICAgdGhpcy5jdXJyS2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gICAgdGhpcy5sYXN0S2V5c3RhdGUgPSBuZXdCbGFua0tleXN0YXRlKCk7XG4gIH1cbiAgcHJvdG90eXBlLnN0YXRlU2V0dGVyID0gY3VycnkkKChmdW5jdGlvbihzdGF0ZSwgYXJnJCl7XG4gICAgdmFyIHdoaWNoLCBrZXk7XG4gICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgIGlmIChrZXkgPSBBQ1RJT05fTkFNRVt3aGljaF0pIHtcbiAgICAgIHRoaXMuY3VycktleXN0YXRlW2tleV0gPSBzdGF0ZTtcbiAgICAgIGlmIChzdGF0ZSA9PT0gdHJ1ZSAmJiB0aGlzLmxhc3RIZWxkS2V5ICE9PSBrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdEhlbGRLZXkgPSBrZXk7XG4gICAgICB9XG4gICAgfVxuICB9KSwgdHJ1ZSk7XG4gIHByb3RvdHlwZS5jaGFuZ2VzU2luY2VMYXN0RnJhbWUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBrZXksIHN0YXRlLCB3YXNEaWZmZXJlbnQ7XG4gICAgcmV0dXJuIGZpbHRlcihpZCwgKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcmVmJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIHJlZiQgPSB0aGlzLmN1cnJLZXlzdGF0ZSkge1xuICAgICAgICBzdGF0ZSA9IHJlZiRba2V5XTtcbiAgICAgICAgd2FzRGlmZmVyZW50ID0gc3RhdGUgIT09IHRoaXMubGFzdEtleXN0YXRlW2tleV07XG4gICAgICAgIHRoaXMubGFzdEtleXN0YXRlW2tleV0gPSBzdGF0ZTtcbiAgICAgICAgaWYgKHdhc0RpZmZlcmVudCkge1xuICAgICAgICAgIHJlc3VsdHMkLnB1c2goZXZlbnRTdW1tYXJ5KGtleSwgc3RhdGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgIH0uY2FsbCh0aGlzKSkpO1xuICB9O1xuICBJbnB1dEhhbmRsZXIuZGVidWdNb2RlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgcmV0dXJuIGxvZyhcIklucHV0SGFuZGxlcjo6ZGVidWdNb2RlIC1cIiwgd2hpY2gsIEFDVElPTl9OQU1FW3doaWNoXSB8fCAnW3VuYm91bmRdJyk7XG4gICAgfSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5vbiA9IGZ1bmN0aW9uKGNvZGUsIM67KXtcbiAgICByZXR1cm4gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGFyZyQpe1xuICAgICAgdmFyIHdoaWNoO1xuICAgICAgd2hpY2ggPSBhcmckLndoaWNoO1xuICAgICAgaWYgKHdoaWNoID09PSBjb2RlKSB7XG4gICAgICAgIHJldHVybiDOuygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gSW5wdXRIYW5kbGVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufVxuZnVuY3Rpb24gY3VycnkkKGYsIGJvdW5kKXtcbiAgdmFyIGNvbnRleHQsXG4gIF9jdXJyeSA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZi5sZW5ndGggPiAxID8gZnVuY3Rpb24oKXtcbiAgICAgIHZhciBwYXJhbXMgPSBhcmdzID8gYXJncy5jb25jYXQoKSA6IFtdO1xuICAgICAgY29udGV4dCA9IGJvdW5kID8gY29udGV4dCB8fCB0aGlzIDogdGhpcztcbiAgICAgIHJldHVybiBwYXJhbXMucHVzaC5hcHBseShwYXJhbXMsIGFyZ3VtZW50cykgPFxuICAgICAgICAgIGYubGVuZ3RoICYmIGFyZ3VtZW50cy5sZW5ndGggP1xuICAgICAgICBfY3VycnkuY2FsbChjb250ZXh0LCBwYXJhbXMpIDogZi5hcHBseShjb250ZXh0LCBwYXJhbXMpO1xuICAgIH0gOiBmO1xuICB9O1xuICByZXR1cm4gX2N1cnJ5KCk7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIGZsb29yLCBhc2NpaVByb2dyZXNzQmFyLCBUSU1FUl9BQ1RJVkUsIFRJTUVSX0VYUElSRUQsIGNyZWF0ZSwgdXBkYXRlLCByZXNldCwgc3RvcCwgcnVuRm9yLCBwcm9ncmVzc09mLCB0aW1lVG9FeHBpcnksIHNldFRpbWVUb0V4cGlyeSwgcmVzZXRXaXRoUmVtYWluZGVyLCB0b1N0cmluZywgdXBkYXRlQWxsSW4sIHNldFN0YXRlLCBzZXRUaW1lLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwiK1wiLCB2YWx1ZUNoYXJzKSArIHJlcGVhdFN0cmluZyQoXCItXCIsIGVtcHR5Q2hhcnMpO1xufSk7XG5yZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbm91dCQuY3JlYXRlID0gY3JlYXRlID0gZnVuY3Rpb24obmFtZSwgdGFyZ2V0VGltZSwgYmVnaW4pe1xuICBuYW1lID09IG51bGwgJiYgKG5hbWUgPSBcIlVubmFtZWQgVGltZXJcIik7XG4gIHRhcmdldFRpbWUgPT0gbnVsbCAmJiAodGFyZ2V0VGltZSA9IDEwMDApO1xuICBiZWdpbiA9PSBudWxsICYmIChiZWdpbiA9IGZhbHNlKTtcbiAgbG9nKFwiTmV3IFRpbWVyOlwiLCBuYW1lLCB0YXJnZXRUaW1lKTtcbiAgcmV0dXJuIHtcbiAgICBjdXJyZW50VGltZTogMCxcbiAgICB0YXJnZXRUaW1lOiB0YXJnZXRUaW1lLFxuICAgIHByb2dyZXNzOiAwLFxuICAgIHN0YXRlOiBiZWdpbiA/IFRJTUVSX0FDVElWRSA6IFRJTUVSX0VYUElSRUQsXG4gICAgYWN0aXZlOiBiZWdpbixcbiAgICBleHBpcmVkOiAhYmVnaW4sXG4gICAgdGltZVRvRXhwaXJ5OiB0YXJnZXRUaW1lLFxuICAgIG5hbWU6IG5hbWVcbiAgfTtcbn07XG5vdXQkLnVwZGF0ZSA9IHVwZGF0ZSA9IGZ1bmN0aW9uKHRpbWVyLCDOlHQpe1xuICBpZiAodGltZXIuYWN0aXZlKSB7XG4gICAgcmV0dXJuIHNldFRpbWUodGltZXIsIHRpbWVyLmN1cnJlbnRUaW1lICsgzpR0KTtcbiAgfVxufTtcbm91dCQucmVzZXQgPSByZXNldCA9IGZ1bmN0aW9uKHRpbWVyLCB0aW1lKXtcbiAgdGltZSA9PSBudWxsICYmICh0aW1lID0gdGltZXIudGFyZ2V0VGltZSk7XG4gIGxvZyhcIlRpbWVyOjpyZXNldCAtXCIsIHRpbWVyLm5hbWUsIHRpbWUpO1xuICB0aW1lci50YXJnZXRUaW1lID0gdGltZTtcbiAgc2V0VGltZSh0aW1lciwgMCk7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfQUNUSVZFKTtcbn07XG5vdXQkLnN0b3AgPSBzdG9wID0gZnVuY3Rpb24odGltZXIpe1xuICBzZXRUaW1lKHRpbWVyLCAwKTtcbiAgcmV0dXJuIHNldFN0YXRlKHRpbWVyLCBUSU1FUl9FWFBJUkVEKTtcbn07XG5vdXQkLnJ1bkZvciA9IHJ1bkZvciA9IGZ1bmN0aW9uKHRpbWVyLCB0aW1lKXtcbiAgdGltZXIudGltZVRvRXhwaXJ5ID0gdGltZTtcbiAgcmV0dXJuIHNldFN0YXRlKHRpbWVyLCBUSU1FUl9BQ1RJVkUpO1xufTtcbm91dCQucHJvZ3Jlc3NPZiA9IHByb2dyZXNzT2YgPSBmdW5jdGlvbih0aW1lcil7XG4gIHJldHVybiB0aW1lci5jdXJyZW50VGltZSAvIHRpbWVyLnRhcmdldFRpbWU7XG59O1xub3V0JC50aW1lVG9FeHBpcnkgPSB0aW1lVG9FeHBpcnkgPSBmdW5jdGlvbih0aW1lcil7XG4gIHJldHVybiB0aW1lci50YXJnZXRUaW1lIC0gdGltZXIuY3VycmVudFRpbWU7XG59O1xub3V0JC5zZXRUaW1lVG9FeHBpcnkgPSBzZXRUaW1lVG9FeHBpcnkgPSBmdW5jdGlvbih0aW1lciwgZXhwaXJ5VGltZSl7XG4gIHJldHVybiBzZXRUaW1lKHRpbWVyLCB0aW1lci50YXJnZXRUaW1lIC0gZXhwaXJ5VGltZSk7XG59O1xub3V0JC5yZXNldFdpdGhSZW1haW5kZXIgPSByZXNldFdpdGhSZW1haW5kZXIgPSBmdW5jdGlvbih0aW1lciwgcmVtYWluZGVyKXtcbiAgcmVtYWluZGVyID09IG51bGwgJiYgKHJlbWFpbmRlciA9IHRpbWVyLmN1cnJlbnRUaW1lIC0gdGltZXIudGFyZ2V0VGltZSk7XG4gIHNldFRpbWUodGltZXIsIHJlbWFpbmRlcik7XG4gIHJldHVybiBzZXRTdGF0ZSh0aW1lciwgVElNRVJfQUNUSVZFKTtcbn07XG5vdXQkLnRvU3RyaW5nID0gdG9TdHJpbmcgPSBmdW5jdGlvbigpe1xuICB2YXIgcHJvZ2JhcjtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoNik7XG4gIHJldHVybiBmdW5jdGlvbih0aW1lcil7XG4gICAgcmV0dXJuIFwiXCIgKyBwcm9nYmFyKHRpbWVyLmN1cnJlbnRUaW1lLCB0aW1lci50YXJnZXRUaW1lKSArIFwiIFwiICsgKHRpbWVyLm5hbWUgKyBcIiBcIiArIHRpbWVyLnRhcmdldFRpbWUpICsgXCIgKFwiICsgdGltZXIuYWN0aXZlICsgXCJ8XCIgKyB0aW1lci5leHBpcmVkICsgXCIpXCI7XG4gIH07XG59KCk7XG5vdXQkLnVwZGF0ZUFsbEluID0gdXBkYXRlQWxsSW4gPSBmdW5jdGlvbih0aGluZywgzpR0KXtcbiAgdmFyIGssIHYsIHJlc3VsdHMkID0gW107XG4gIGlmICh0aGluZy50YXJnZXRUaW1lICE9IG51bGwpIHtcbiAgICByZXR1cm4gdXBkYXRlKHRoaW5nLCDOlHQpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB0aGluZyA9PT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKGsgaW4gdGhpbmcpIHtcbiAgICAgIHYgPSB0aGluZ1trXTtcbiAgICAgIGlmICh2KSB7XG4gICAgICAgIHJlc3VsdHMkLnB1c2godXBkYXRlQWxsSW4odiwgzpR0KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbnNldFN0YXRlID0gZnVuY3Rpb24odGltZXIsIHN0YXRlKXtcbiAgdGltZXIuc3RhdGUgPSBzdGF0ZTtcbiAgdGltZXIuZXhwaXJlZCA9IHN0YXRlID09PSBUSU1FUl9FWFBJUkVEO1xuICByZXR1cm4gdGltZXIuYWN0aXZlID0gc3RhdGUgIT09IFRJTUVSX0VYUElSRUQ7XG59O1xuc2V0VGltZSA9IGZ1bmN0aW9uKHRpbWVyLCB0aW1lKXtcbiAgdGltZXIuY3VycmVudFRpbWUgPSB0aW1lO1xuICB0aW1lci5wcm9ncmVzcyA9IHRpbWVyLmN1cnJlbnRUaW1lIC8gdGltZXIudGFyZ2V0VGltZTtcbiAgaWYgKHRpbWVyLmN1cnJlbnRUaW1lID49IHRpbWVyLnRhcmdldFRpbWUpIHtcbiAgICB0aW1lci5wcm9ncmVzcyA9IDE7XG4gICAgcmV0dXJuIHNldFN0YXRlKHRpbWVyLCBUSU1FUl9FWFBJUkVEKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHJlcGVhdFN0cmluZyQoc3RyLCBuKXtcbiAgZm9yICh2YXIgciA9ICcnOyBuID4gMDsgKG4gPj49IDEpICYmIChzdHIgKz0gc3RyKSkgaWYgKG4gJiAxKSByICs9IHN0cjtcbiAgcmV0dXJuIHI7XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iXX0=
