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
    return it * 1.6 / 4096;
  });
  gameOpts = {
    tileWidth: 10,
    tileHeight: 20,
    paused: false,
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
    scoreDistanceFromEdge: p2m(780),
    scoreOffsetFromCentre: p2m(436),
    scoreInterTubeMargin: p2m(5),
    scoreTubeRadius: p2m(200 / 2),
    scoreBaseRadius: p2m(275 / 2),
    scoreTubeHeight: p2m(270),
    scoreIndicatorOffset: p2m(243),
    previewDomeRadius: p2m(208),
    previewDomeHeight: 0.20,
    previewDistanceFromEdge: p2m(656),
    previewDistanceFromCenter: p2m(1002),
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
  InputHandler.on(27, function(){
    return gameOpts.paused = !gameOpts.paused;
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
  frameDriver = new FrameDriver(function(Δt, time, frame, fps){
    gameState.fps = fps;
    gameState.Δt = Δt / gameOpts.timeFactor / gameState.slowdown;
    gameState.elapsedTime = time / gameOpts.timeFactor;
    gameState.elapsedFrames = frame;
    gameState.inputState = inputHandler.changesSinceLastFrame();
    Timer.updateAll(gameState.Δt);
    if (!gameOpts.paused) {
      gameState = tetrisGame.runFrame(gameState, gameState.Δt);
    }
    renderer.render(gameState, renderOpts);
    if (debugOutput) {
      return debugOutput.render(gameState);
    }
  });
  frameDriver.start();
  return tetrisGame.beginNewGame(gameState);
});
},{"./game":9,"./renderer":30,"./utils/debug-output":36,"./utils/frame-driver":37,"./utils/game-state":38,"./utils/input-handler":39,"./utils/timer":40,"std":35}],2:[function(require,module,exports){
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

  this.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {
    this.scene            = scene;
    this.camera           = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor       = clearColor;
    this.clearAlpha       = ( clearAlpha !== undefined ) ? clearAlpha : 1;
    this.oldClearColor    = new THREE.Color();
    this.oldClearAlpha    = 1;
    this.enabled          = true;
    this.clear            = true;
    this.needsSwap        = false;

    var cameraL = new THREE.PerspectiveCamera();
    var cameraR = new THREE.PerspectiveCamera();

    this.render = function ( providedRenderer, writeBuffer, readBuffer, scene ) {

      this.scene.overrideMaterial = this.overrideMaterial;

      if ( this.clearColor ) {
        this.oldClearColor.copy( renderer.getClearColor() );
        this.oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor( this.clearColor, this.clearAlpha );
      }

      if ( !vrHMD ) {
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
      } else {

        /* Break for VREffect code */
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
      }

      /* Resume RenderPass code */

      if ( this.clearColor ) {
        renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
      }

      this.scene.overrideMaterial = null;
    };
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
},{"std":35}],8:[function(require,module,exports){
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
},{"./data/brick-shapes":6,"std":35}],9:[function(require,module,exports){
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
},{"./fail-menu":7,"./game-core":8,"./start-menu":10,"std":35}],10:[function(require,module,exports){
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
},{"std":35}],11:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],12:[function(require,module,exports){
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
},{"./arena-cells":11,"./base":13,"./falling-brick":17,"./frame":18,"./guide-lines":19,"./particle-effect":24,"std":35}],13:[function(require,module,exports){
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
},{"../mats":31,"std":35}],14:[function(require,module,exports){
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
},{"./base":13,"./brick":15,"std":35}],15:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],16:[function(require,module,exports){
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
},{"./base":13,"std":35}],17:[function(require,module,exports){
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
},{"./base":13,"./brick":15,"std":35}],18:[function(require,module,exports){
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
},{"./base":13,"std":35}],19:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],20:[function(require,module,exports){
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
},{"./arena":12,"./brick-preview":14,"./fail-screen":16,"./lighting":22,"./nixie":23,"./start-menu":25,"./table":26,"./title":27}],21:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],22:[function(require,module,exports){
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
},{"./base":13,"std":35}],23:[function(require,module,exports){
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
    offset = this.opts.scoreOffsetFromCentre + this.opts.scoreBaseRadius;
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
},{"../geometry/capsule":29,"../mats":31,"./base":13,"./led":21,"std":35}],24:[function(require,module,exports){
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
},{"../palette":32,"./base":13,"std":35}],25:[function(require,module,exports){
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
},{"./base":13,"./title":27,"std":35}],26:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],27:[function(require,module,exports){
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
},{"../mats":31,"./base":13,"std":35}],28:[function(require,module,exports){
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
},{"std":35}],29:[function(require,module,exports){
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
},{"std":35}],30:[function(require,module,exports){
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
},{"../../lib/trackball-controls.js":5,"./components":20,"./debug-camera":28,"./palette":32,"./scene-manager":33,"std":35,"three-js-vr-extensions":4}],31:[function(require,module,exports){
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
},{"./palette":32,"std":35}],32:[function(require,module,exports){
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
},{"std":35,"three-js-vr-extensions":4}],33:[function(require,module,exports){
var ref$, id, log, THREE, Materials, SceneManager, out$ = typeof exports != 'undefined' && exports || this;
ref$ = require('std'), id = ref$.id, log = ref$.log;
THREE = require('three-js-vr-extensions');
Materials = require('./mats');
THREE.WebGLRenderer.prototype.renderStereo = function(scene, camera, renderTarget, forceClear, stereoTransforms, stereoViewports){
  var i$, len$, i, m, me, v, vx, vy, vw, vh;
  if (!camera instanceof THREE.Camera) {
    THREE.error('THREE.WebGLRenderer.renderStereo - camera is not instance of THREE.Camera');
    return;
  }
  updateEverything.call(this, scene, camera, renderTarget, forceClear);
  for (i$ = 0, len$ = stereoTransforms.length; i$ < len$; ++i$) {
    i = i$;
    m = stereoTransforms[i$];
    me = m.elements;
    camera.matrixWorld.multiply(m);
    v = stereoViewports[i];
    vx = v.min.x;
    vy = v.min.y;
    vw = v.max.x - vx;
    vh = c.max.y - vy;
    this.setViewport(vx, vy, vw, vh);
    this.setScissor(vx, vy, vw, vh);
    renderEverything.call(this, scene, camera);
    me[12] *= -1;
    me[13] *= -1;
    me[14] *= -1;
    camera.matrixWorld.multiply(m);
  }
  return this.enableScissorTest(false);
};
out$.SceneManager = SceneManager = (function(){
  SceneManager.displayName = 'SceneManager';
  var helperMarkerSize, helperMarkerOpacity, helperMarkerGeo, prototype = SceneManager.prototype, constructor = SceneManager;
  helperMarkerSize = 0.02;
  helperMarkerOpacity = 0.3;
  helperMarkerGeo = new THREE.CubeGeometry(helperMarkerSize, helperMarkerSize, helperMarkerSize);
  function SceneManager(opts){
    var aspect, fxStuff, rgb;
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
    fxStuff = require('../../temp');
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.StereoRenderPass(this.scene, this.camera));
    rgb = new THREE.ShaderPass(THREE.RGBShiftShader);
    rgb.uniforms.amount.value = 0.004;
    rgb.renderToScreen = true;
    this.composer.addPass(rgb);
    this.dont = window.location.hash === '#dont';
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
    if (this.dont) {
      return this.vrEffect.render(this.scene, this.camera);
    } else {
      return this.composer.render(this.scene, this.camera);
    }
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
},{"../../temp":50,"./mats":31,"std":35,"three-js-vr-extensions":4}],34:[function(require,module,exports){
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
},{"std":35}],35:[function(require,module,exports){
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
},{"./easing":34}],36:[function(require,module,exports){
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
    var fpsColor;
    fpsColor = this.fps >= 55
      ? '#0f0'
      : this.fps >= 30 ? '#ff0' : '#f00';
    return "score - " + template.score.apply(this.score) + "\nlines - " + this.lines + "\n\n meta - " + this.metagameState + "\n time - " + this.elapsedTime + "\nframe - " + this.elapsedFrames + "\n  fps - <span style=\"color:" + fpsColor + "\">" + this.fps + "</span>\n keys - " + template.keys.apply(this.inputState) + "\n drop - " + (this.forceDownMode ? 'soft' : 'auto');
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
},{"std":35}],37:[function(require,module,exports){
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
},{"std":35}],38:[function(require,module,exports){
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
},{"./timer":40,"std":35}],39:[function(require,module,exports){
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
},{"./timer":40,"std":35}],40:[function(require,module,exports){
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
},{"std":35}],41:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function ( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// copy material

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.copyUniforms[ "opacity" ].value = strength;

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	if ( THREE.ConvolutionShader === undefined )
		console.error( "THREE.BloomPass relies on THREE.ConvolutionShader" );

	var convolutionShader = THREE.ConvolutionShader;

  console.log('Found!;' , convolutionShader);

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ConvolutionShader.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:  convolutionShader.vertexShader,
		fragmentShader: convolutionShader.fragmentShader,
		defines: {
			"KERNEL_SIZE_FLOAT": kernelSize.toFixed( 1 ),
			"KERNEL_SIZE_INT": kernelSize.toFixed( 0 )
		}

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		this.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].value = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( this.scene, this.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].value = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( this.scene, this.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		this.quad.material = this.materialCopy;

		this.copyUniforms[ "tDiffuse" ].value = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );

},{}],42:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { type: "t", value: null },
		"uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { type: "fv1", value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join("\n"),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++ i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

		return values;

	}

};

},{}],43:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};

},{}],44:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
		"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { type: "f", value: 1.57 },
		"scale":    { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join("\n")

};

},{}],45:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {
		var pixelRatio = renderer.getPixelRatio();
		var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
		var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;
	this.passes = [];

	if ( THREE.CopyShader === undefined ) { console.error( "THREE.EffectComposer relies on THREE.CopyShader" ); }

	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

	swapBuffers: function() {
		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	},

	addPass: function ( pass ) {
		this.passes.push( pass );
	},

	insertPass: function ( pass, index ) {
		this.passes.splice( index, 0, pass );
	},

	render: function ( delta ) {
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;
		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {
			pass = this.passes[ i ];
			if ( !pass.enabled ) continue;
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {
				if ( maskActive ) {
					var context = this.renderer.context;
					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
					context.stencilFunc( context.EQUAL, 1, 0xffffffff );
				}

				this.swapBuffers();
			}

			if ( pass instanceof THREE.MaskPass ) {
				maskActive = true;
			} else if ( pass instanceof THREE.ClearMaskPass ) {
				maskActive = false;
			}
		}
	},

	reset: function ( renderTarget ) {
		if ( renderTarget === undefined ) {
			renderTarget = this.renderTarget1.clone();
			var pixelRatio = this.renderer.getPixelRatio();
			renderTarget.width  = Math.floor( this.renderer.context.canvas.width  / pixelRatio );
			renderTarget.height = Math.floor( this.renderer.context.canvas.height / pixelRatio );
		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	},

	setSize: function ( width, height ) {
		var renderTarget = this.renderTarget1.clone();
		renderTarget.width = width;
		renderTarget.height = height;
		this.reset( renderTarget );
	}

};

},{}],46:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

},{}],47:[function(require,module,exports){
/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join("\n")

};

},{}],48:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

    console.log('RenderPass::render -', renderer, writeBuffer, readBuffer, delta);

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};

THREE.StereoRenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.cameraL = camera;
	this.cameraR = camera.clone;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.StereoRenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.cameraL, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};

},{}],49:[function(require,module,exports){
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

        	defines: shader.defines || {},
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};

},{}],50:[function(require,module,exports){

require('./RGBShiftShader.js');
require('./ConvolutionShader.js');
require('./CopyShader.js');
require('./DotScreenShader.js');

require('./BloomPass.js');
require('./MaskPass.js');
require('./RenderPass.js');
require('./ShaderPass.js');

require('./EffectComposer.js');


},{"./BloomPass.js":41,"./ConvolutionShader.js":42,"./CopyShader.js":43,"./DotScreenShader.js":44,"./EffectComposer.js":45,"./MaskPass.js":46,"./RGBShiftShader.js":47,"./RenderPass.js":48,"./ShaderPass.js":49}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL3NyYy9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJDb250cm9scy5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9saWIvbW96dnIvVlJFZmZlY3QuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvbGliL21venZyL2luZGV4LmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L2xpYi90cmFja2JhbGwtY29udHJvbHMuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZGF0YS9icmljay1zaGFwZXMubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL2dhbWUvZmFpbC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9nYW1lL2dhbWUtY29yZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvZ2FtZS9zdGFydC1tZW51LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLWNlbGxzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2FyZW5hLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2Jhc2UubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYnJpY2stcHJldmlldy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9icmljay5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWlsLXNjcmVlbi5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9mYWxsaW5nLWJyaWNrLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2ZyYW1lLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2d1aWRlLWxpbmVzLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2xlZC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9saWdodGluZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9uaXhpZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9wYXJ0aWNsZS1lZmZlY3QubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvc3RhcnQtbWVudS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90YWJsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy90aXRsZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvZGVidWctY2FtZXJhLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9nZW9tZXRyeS9jYXBzdWxlLmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy9yZW5kZXJlci9pbmRleC5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvbWF0cy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvcGFsZXR0ZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvcmVuZGVyZXIvc2NlbmUtbWFuYWdlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2Vhc2luZy5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvc3RkL2luZGV4LmxzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3NyYy91dGlscy9kZWJ1Zy1vdXRwdXQubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvc3JjL3V0aWxzL2ZyYW1lLWRyaXZlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvZ2FtZS1zdGF0ZS5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvaW5wdXQtaGFuZGxlci5scyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC9zcmMvdXRpbHMvdGltZXIubHMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvdGVtcC9CbG9vbVBhc3MuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvdGVtcC9Db252b2x1dGlvblNoYWRlci5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC90ZW1wL0NvcHlTaGFkZXIuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvdGVtcC9Eb3RTY3JlZW5TaGFkZXIuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvdGVtcC9FZmZlY3RDb21wb3Nlci5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC90ZW1wL01hc2tQYXNzLmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3RlbXAvUkdCU2hpZnRTaGFkZXIuanMiLCIvaG9tZS9naG9zdHN0cmVldC9Ob3QgV29yay92cnQvdGVtcC9SZW5kZXJQYXNzLmpzIiwiL2hvbWUvZ2hvc3RzdHJlZXQvTm90IFdvcmsvdnJ0L3RlbXAvU2hhZGVyUGFzcy5qcyIsIi9ob21lL2dob3N0c3RyZWV0L05vdCBXb3JrL3ZydC90ZW1wL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ptQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJlZiQsIGxvZywgZGVsYXksIEZyYW1lRHJpdmVyLCBJbnB1dEhhbmRsZXIsIFRpbWVyLCBHYW1lU3RhdGUsIERlYnVnT3V0cHV0LCBUZXRyaXNHYW1lLCBUaHJlZUpzUmVuZGVyZXI7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGxvZyA9IHJlZiQubG9nLCBkZWxheSA9IHJlZiQuZGVsYXk7XG5GcmFtZURyaXZlciA9IHJlcXVpcmUoJy4vdXRpbHMvZnJhbWUtZHJpdmVyJykuRnJhbWVEcml2ZXI7XG5JbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL3V0aWxzL2lucHV0LWhhbmRsZXInKS5JbnB1dEhhbmRsZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdXRpbHMvdGltZXInKS5UaW1lcjtcbkdhbWVTdGF0ZSA9IHJlcXVpcmUoJy4vdXRpbHMvZ2FtZS1zdGF0ZScpLkdhbWVTdGF0ZTtcbkRlYnVnT3V0cHV0ID0gcmVxdWlyZSgnLi91dGlscy9kZWJ1Zy1vdXRwdXQnKS5EZWJ1Z091dHB1dDtcblRldHJpc0dhbWUgPSByZXF1aXJlKCcuL2dhbWUnKS5UZXRyaXNHYW1lO1xuVGhyZWVKc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlcicpLlRocmVlSnNSZW5kZXJlcjtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuICB2YXIgcDJtLCBnYW1lT3B0cywgcmVuZGVyT3B0cywgaW5wdXRIYW5kbGVyLCBnYW1lU3RhdGUsIHRldHJpc0dhbWUsIHJlbmRlcmVyLCBkZWJ1Z091dHB1dCwgdGVzdEVhc2luZywgZnJhbWVEcml2ZXI7XG4gIHAybSA9IChmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0ICogMS42IC8gNDA5NjtcbiAgfSk7XG4gIGdhbWVPcHRzID0ge1xuICAgIHRpbGVXaWR0aDogMTAsXG4gICAgdGlsZUhlaWdodDogMjAsXG4gICAgcGF1c2VkOiBmYWxzZSxcbiAgICB0aW1lRmFjdG9yOiAxXG4gIH07XG4gIHJlbmRlck9wdHMgPSB7XG4gICAgdW5pdHNQZXJNZXRlcjogMSxcbiAgICBncmlkU2l6ZTogMC4wNyxcbiAgICBibG9ja1NpemU6IDAuMDY2LFxuICAgIGRlc2tTaXplOiBbMS42LCAwLjgsIDAuMV0sXG4gICAgY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTogMC4yLFxuICAgIGNhbWVyYUVsZXZhdGlvbjogMC41LFxuICAgIGhhcmREcm9wSm9sdEFtb3VudDogMC4wMyxcbiAgICB6YXBQYXJ0aWNsZVNpemU6IDAuMDA4LFxuICAgIGFyZW5hT2Zmc2V0RnJvbUNlbnRyZTogMC4wODUsXG4gICAgYXJlbmFEaXN0YW5jZUZyb21FZGdlOiAwLjU3LFxuICAgIHNjb3JlRGlzdGFuY2VGcm9tRWRnZTogcDJtKDc4MCksXG4gICAgc2NvcmVPZmZzZXRGcm9tQ2VudHJlOiBwMm0oNDM2KSxcbiAgICBzY29yZUludGVyVHViZU1hcmdpbjogcDJtKDUpLFxuICAgIHNjb3JlVHViZVJhZGl1czogcDJtKDIwMCAvIDIpLFxuICAgIHNjb3JlQmFzZVJhZGl1czogcDJtKDI3NSAvIDIpLFxuICAgIHNjb3JlVHViZUhlaWdodDogcDJtKDI3MCksXG4gICAgc2NvcmVJbmRpY2F0b3JPZmZzZXQ6IHAybSgyNDMpLFxuICAgIHByZXZpZXdEb21lUmFkaXVzOiBwMm0oMjA4KSxcbiAgICBwcmV2aWV3RG9tZUhlaWdodDogMC4yMCxcbiAgICBwcmV2aWV3RGlzdGFuY2VGcm9tRWRnZTogcDJtKDY1NiksXG4gICAgcHJldmlld0Rpc3RhbmNlRnJvbUNlbnRlcjogcDJtKDEwMDIpLFxuICAgIHByZXZpZXdTY2FsZUZhY3RvcjogMC41XG4gIH07XG4gIGlucHV0SGFuZGxlciA9IG5ldyBJbnB1dEhhbmRsZXI7XG4gIGdhbWVTdGF0ZSA9IG5ldyBHYW1lU3RhdGUoZ2FtZU9wdHMpO1xuICB0ZXRyaXNHYW1lID0gbmV3IFRldHJpc0dhbWUoZ2FtZVN0YXRlKTtcbiAgcmVuZGVyZXIgPSBuZXcgVGhyZWVKc1JlbmRlcmVyKHJlbmRlck9wdHMsIGdhbWVTdGF0ZSk7XG4gIHJlbmRlcmVyLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuICBkZWJ1Z091dHB1dCA9IG5ldyBEZWJ1Z091dHB1dDtcbiAgSW5wdXRIYW5kbGVyLm9uKDE5MiwgZnVuY3Rpb24oKXtcbiAgICBpZiAoZnJhbWVEcml2ZXIuc3RhdGUucnVubmluZykge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0b3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZyYW1lRHJpdmVyLnN0YXJ0KCk7XG4gICAgfVxuICB9KTtcbiAgSW5wdXRIYW5kbGVyLm9uKDI3LCBmdW5jdGlvbigpe1xuICAgIHJldHVybiBnYW1lT3B0cy5wYXVzZWQgPSAhZ2FtZU9wdHMucGF1c2VkO1xuICB9KTtcbiAgdGVzdEVhc2luZyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIEVhc2UsIGkkLCByZWYkLCBsZW4kLCBlbCwgZWFzZU5hbWUsIGVhc2UsIGxyZXN1bHQkLCBjbnYsIGN0eCwgaSwgcCwgcmVzdWx0cyQgPSBbXTtcbiAgICBFYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnY2FudmFzJykpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBlbCA9IHJlZiRbaSRdO1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgZm9yIChlYXNlTmFtZSBpbiBFYXNlKSB7XG4gICAgICBlYXNlID0gRWFzZVtlYXNlTmFtZV07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgY252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjbnYud2lkdGggPSAyMDA7XG4gICAgICBjbnYuaGVpZ2h0ID0gMjAwO1xuICAgICAgY252LnN0eWxlLmJhY2tncm91bmQgPSAnd2hpdGUnO1xuICAgICAgY252LnN0eWxlLmJvcmRlckxlZnQgPSBcIjNweCBzb2xpZCBibGFja1wiO1xuICAgICAgY3R4ID0gY252LmdldENvbnRleHQoJzJkJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNudik7XG4gICAgICBjdHguZm9udCA9IFwiMTRweCBtb25vc3BhY2VcIjtcbiAgICAgIGN0eC5maWxsVGV4dChlYXNlTmFtZSwgMiwgMTYsIDIwMCk7XG4gICAgICBmb3IgKGkkID0gMDsgaSQgPD0gMTAwOyArK2kkKSB7XG4gICAgICAgIGkgPSBpJDtcbiAgICAgICAgcCA9IGkgLyAxMDA7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY3R4LmZpbGxSZWN0KDIgKiBpLCAyMDAgLSBlYXNlKHAsIDAsIDIwMCksIDIsIDIpKTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIGZyYW1lRHJpdmVyID0gbmV3IEZyYW1lRHJpdmVyKGZ1bmN0aW9uKM6UdCwgdGltZSwgZnJhbWUsIGZwcyl7XG4gICAgZ2FtZVN0YXRlLmZwcyA9IGZwcztcbiAgICBnYW1lU3RhdGUuzpR0ID0gzpR0IC8gZ2FtZU9wdHMudGltZUZhY3RvciAvIGdhbWVTdGF0ZS5zbG93ZG93bjtcbiAgICBnYW1lU3RhdGUuZWxhcHNlZFRpbWUgPSB0aW1lIC8gZ2FtZU9wdHMudGltZUZhY3RvcjtcbiAgICBnYW1lU3RhdGUuZWxhcHNlZEZyYW1lcyA9IGZyYW1lO1xuICAgIGdhbWVTdGF0ZS5pbnB1dFN0YXRlID0gaW5wdXRIYW5kbGVyLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSgpO1xuICAgIFRpbWVyLnVwZGF0ZUFsbChnYW1lU3RhdGUuzpR0KTtcbiAgICBpZiAoIWdhbWVPcHRzLnBhdXNlZCkge1xuICAgICAgZ2FtZVN0YXRlID0gdGV0cmlzR2FtZS5ydW5GcmFtZShnYW1lU3RhdGUsIGdhbWVTdGF0ZS7OlHQpO1xuICAgIH1cbiAgICByZW5kZXJlci5yZW5kZXIoZ2FtZVN0YXRlLCByZW5kZXJPcHRzKTtcbiAgICBpZiAoZGVidWdPdXRwdXQpIHtcbiAgICAgIHJldHVybiBkZWJ1Z091dHB1dC5yZW5kZXIoZ2FtZVN0YXRlKTtcbiAgICB9XG4gIH0pO1xuICBmcmFtZURyaXZlci5zdGFydCgpO1xuICByZXR1cm4gdGV0cmlzR2FtZS5iZWdpbk5ld0dhbWUoZ2FtZVN0YXRlKTtcbn0pOyIsIi8qKlxuICogQGF1dGhvciBkbWFyY29zIC8gaHR0cHM6Ly9naXRodWIuY29tL2RtYXJjb3NcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb21cbiAqL1xuXG5USFJFRS5WUkNvbnRyb2xzID0gZnVuY3Rpb24gKCBvYmplY3QsIG9uRXJyb3IgKSB7XG5cblx0dmFyIHNjb3BlID0gdGhpcztcblx0dmFyIHZySW5wdXRzID0gW107XG5cblx0ZnVuY3Rpb24gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKSB7XG5cblx0XHQvLyBFeGNsdWRlIENhcmRib2FyZCBwb3NpdGlvbiBzZW5zb3IgaWYgT2N1bHVzIGV4aXN0cy5cblx0XHR2YXIgb2N1bHVzRGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKCBmdW5jdGlvbiAoIGRldmljZSApIHtcblx0XHRcdHJldHVybiBkZXZpY2UuZGV2aWNlTmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ29jdWx1cycpICE9PSAtMTtcblx0XHR9ICk7XG5cblx0XHRpZiAoIG9jdWx1c0RldmljZXMubGVuZ3RoID49IDEgKSB7XG5cdFx0XHRyZXR1cm4gZGV2aWNlcy5maWx0ZXIoIGZ1bmN0aW9uICggZGV2aWNlICkge1xuXHRcdFx0XHRyZXR1cm4gZGV2aWNlLmRldmljZU5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdjYXJkYm9hcmQnKSA9PT0gLTE7XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkZXZpY2VzO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdvdFZSRGV2aWNlcyggZGV2aWNlcyApIHtcblx0XHRkZXZpY2VzID0gZmlsdGVySW52YWxpZERldmljZXMoIGRldmljZXMgKTtcblx0XHRmb3IgKCB2YXIgaSA9IDA7IGkgPCBkZXZpY2VzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdGlmICggZGV2aWNlc1sgaSBdIGluc3RhbmNlb2YgUG9zaXRpb25TZW5zb3JWUkRldmljZSApIHtcblx0XHRcdFx0dnJJbnB1dHMucHVzaCggZGV2aWNlc1sgaSBdICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vIHRoZSBSaWZ0IFNESyByZXR1cm5zIHRoZSBwb3NpdGlvbiBpbiBtZXRlcnNcblx0Ly8gdGhpcyBzY2FsZSBmYWN0b3IgYWxsb3dzIHRoZSB1c2VyIHRvIGRlZmluZSBob3cgbWV0ZXJzXG5cdC8vIGFyZSBjb252ZXJ0ZWQgdG8gc2NlbmUgdW5pdHMuXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IHZySW5wdXRzLmxlbmd0aDsgaSArKyApIHtcblx0XHRcdHZhciB2cklucHV0ID0gdnJJbnB1dHNbIGkgXTtcblx0XHRcdHZhciBzdGF0ZSA9IHZySW5wdXQuZ2V0U3RhdGUoKTtcblxuXHRcdFx0aWYgKCBzdGF0ZS5vcmllbnRhdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnF1YXRlcm5pb24uY29weSggc3RhdGUub3JpZW50YXRpb24gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBzdGF0ZS5wb3NpdGlvbiAhPT0gbnVsbCApIHtcblx0XHRcdFx0b2JqZWN0LnBvc2l0aW9uLmNvcHkoIHN0YXRlLnBvc2l0aW9uICkubXVsdGlwbHlTY2FsYXIoIHNjb3BlLnNjYWxlICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMucmVzZXRTZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICggdmFyIGkgPSAwOyBpIDwgdnJJbnB1dHMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0dmFyIHZySW5wdXQgPSB2cklucHV0c1sgaSBdO1xuXG5cdFx0XHRpZiAoIHZySW5wdXQucmVzZXRTZW5zb3IgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dnJJbnB1dC5yZXNldFNlbnNvcigpO1xuXHRcdFx0fSBlbHNlIGlmICggdnJJbnB1dC56ZXJvU2Vuc29yICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHZySW5wdXQuemVyb1NlbnNvcigpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR0aGlzLnplcm9TZW5zb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0VEhSRUUud2FybiggJ1RIUkVFLlZSQ29udHJvbHM6IC56ZXJvU2Vuc29yKCkgaXMgbm93IC5yZXNldFNlbnNvcigpLicgKTtcblx0XHR0aGlzLnJlc2V0U2Vuc29yKCk7XG5cdH07XG5cbn07XG5cbiIsIlxuLyoqXG4gKiBAYXV0aG9yIGRtYXJjb3MgLyBodHRwczovL2dpdGh1Yi5jb20vZG1hcmNvc1xuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbVxuICpcbiAqIFdlYlZSIFNwZWM6IGh0dHA6Ly9tb3p2ci5naXRodWIuaW8vd2VidnItc3BlYy93ZWJ2ci5odG1sXG4gKlxuICogRmlyZWZveDogaHR0cDovL21venZyLmNvbS9kb3dubG9hZHMvXG4gKiBDaHJvbWl1bTogaHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2ZvbGRlcnZpZXc/aWQ9MEJ6dWRMdDIyQnFHUmJXOVdUSE10T1dNek5qUSZ1c3A9c2hhcmluZyNsaXN0XG4gKlxuICovXG5cblRIUkVFLlZSRWZmZWN0ID0gZnVuY3Rpb24gKCByZW5kZXJlciwgb25FcnJvciApIHtcblxuXHR2YXIgdnJITUQ7XG5cdHZhciBleWVUcmFuc2xhdGlvbkwsIGV5ZUZPVkw7XG5cdHZhciBleWVUcmFuc2xhdGlvblIsIGV5ZUZPVlI7XG5cblx0ZnVuY3Rpb24gZ290VlJEZXZpY2VzKCBkZXZpY2VzICkge1xuXHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGRldmljZXMubGVuZ3RoOyBpICsrICkge1xuXHRcdFx0aWYgKCBkZXZpY2VzWyBpIF0gaW5zdGFuY2VvZiBITURWUkRldmljZSApIHtcblx0XHRcdFx0dnJITUQgPSBkZXZpY2VzWyBpIF07XG5cblx0XHRcdFx0aWYgKCB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0dmFyIGV5ZVBhcmFtc0wgPSB2ckhNRC5nZXRFeWVQYXJhbWV0ZXJzKCAnbGVmdCcgKTtcblx0XHRcdFx0XHR2YXIgZXllUGFyYW1zUiA9IHZySE1ELmdldEV5ZVBhcmFtZXRlcnMoICdyaWdodCcgKTtcblxuXHRcdFx0XHRcdGV5ZVRyYW5zbGF0aW9uTCA9IGV5ZVBhcmFtc0wuZXllVHJhbnNsYXRpb247XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gZXllUGFyYW1zUi5leWVUcmFuc2xhdGlvbjtcblx0XHRcdFx0XHRleWVGT1ZMID0gZXllUGFyYW1zTC5yZWNvbW1lbmRlZEZpZWxkT2ZWaWV3O1xuXHRcdFx0XHRcdGV5ZUZPVlIgPSBleWVQYXJhbXNSLnJlY29tbWVuZGVkRmllbGRPZlZpZXc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gVE9ETzogVGhpcyBpcyBhbiBvbGRlciBjb2RlIHBhdGggYW5kIG5vdCBzcGVjIGNvbXBsaWFudC5cblx0XHRcdFx0XHQvLyBJdCBzaG91bGQgYmUgcmVtb3ZlZCBhdCBzb21lIHBvaW50IGluIHRoZSBuZWFyIGZ1dHVyZS5cblx0XHRcdFx0XHRleWVUcmFuc2xhdGlvbkwgPSB2ckhNRC5nZXRFeWVUcmFuc2xhdGlvbiggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllVHJhbnNsYXRpb25SID0gdnJITUQuZ2V0RXllVHJhbnNsYXRpb24oICdyaWdodCcgKTtcblx0XHRcdFx0XHRleWVGT1ZMID0gdnJITUQuZ2V0UmVjb21tZW5kZWRFeWVGaWVsZE9mVmlldyggJ2xlZnQnICk7XG5cdFx0XHRcdFx0ZXllRk9WUiA9IHZySE1ELmdldFJlY29tbWVuZGVkRXllRmllbGRPZlZpZXcoICdyaWdodCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhazsgLy8gV2Uga2VlcCB0aGUgZmlyc3Qgd2UgZW5jb3VudGVyXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkge1xuXHRcdFx0aWYgKCBvbkVycm9yICkgb25FcnJvciggJ0hNRCBub3QgYXZhaWxhYmxlJyApO1xuXHRcdH1cblxuXHR9XG5cblx0aWYgKCBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICkge1xuXHRcdG5hdmlnYXRvci5nZXRWUkRldmljZXMoKS50aGVuKCBnb3RWUkRldmljZXMgKTtcblx0fVxuXG5cdC8vXG5cblx0dGhpcy5zY2FsZSA9IDE7XG5cdHRoaXMuc2V0U2l6ZSA9IGZ1bmN0aW9uKCB3aWR0aCwgaGVpZ2h0ICkge1xuXHRcdHJlbmRlcmVyLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcblx0fTtcblxuXHQvLyBmdWxsc2NyZWVuXG5cblx0dmFyIGlzRnVsbHNjcmVlbiA9IGZhbHNlO1xuXHR2YXIgY2FudmFzID0gcmVuZGVyZXIuZG9tRWxlbWVudDtcblx0dmFyIGZ1bGxzY3JlZW5jaGFuZ2UgPSBjYW52YXMubW96UmVxdWVzdEZ1bGxTY3JlZW4gPyAnbW96ZnVsbHNjcmVlbmNoYW5nZScgOiAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XG5cblx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggZnVsbHNjcmVlbmNoYW5nZSwgZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRpc0Z1bGxzY3JlZW4gPSBkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudDtcblx0fSwgZmFsc2UgKTtcblxuXHR0aGlzLnNldEZ1bGxTY3JlZW4gPSBmdW5jdGlvbiAoIGJvb2xlYW4gKSB7XG5cdFx0aWYgKCB2ckhNRCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXHRcdGlmICggaXNGdWxsc2NyZWVuID09PSBib29sZWFuICkgcmV0dXJuO1xuXHRcdGlmICggY2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuICkge1xuXHRcdFx0Y2FudmFzLm1velJlcXVlc3RGdWxsU2NyZWVuKCB7IHZyRGlzcGxheTogdnJITUQgfSApO1xuXHRcdH0gZWxzZSBpZiAoIGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiApIHtcblx0XHRcdGNhbnZhcy53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiggeyB2ckRpc3BsYXk6IHZySE1EIH0gKTtcblx0XHR9XG5cdH07XG5cblxuICAvLyBQcm94eSBmb3IgcmVuZGVyZXJcbiAgdGhpcy5nZXRQaXhlbFJhdGlvID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZW5kZXJlci5nZXRQaXhlbFJhdGlvKCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjb250ZXh0Jywge1xuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVuZGVyZXIuY29udGV4dDsgfVxuICB9KTtcblxuXHQvLyByZW5kZXJcblx0dmFyIGNhbWVyYUwgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblx0dmFyIGNhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblxuXHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSApIHtcblx0XHRpZiAoIHZySE1EICkge1xuXHRcdFx0dmFyIHNjZW5lTCwgc2NlbmVSO1xuXG5cdFx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cdFx0XHRcdHNjZW5lTCA9IHNjZW5lWyAwIF07XG5cdFx0XHRcdHNjZW5lUiA9IHNjZW5lWyAxIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzY2VuZUwgPSBzY2VuZTtcblx0XHRcdFx0c2NlbmVSID0gc2NlbmU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzaXplID0gcmVuZGVyZXIuZ2V0U2l6ZSgpO1xuXHRcdFx0c2l6ZS53aWR0aCAvPSAyO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggdHJ1ZSApO1xuXHRcdFx0cmVuZGVyZXIuY2xlYXIoKTtcblxuXHRcdFx0aWYgKCBjYW1lcmEucGFyZW50ID09PSB1bmRlZmluZWQgKSBjYW1lcmEudXBkYXRlTWF0cml4V29ybGQoKTtcblxuXHRcdFx0Y2FtZXJhTC5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZMLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXHRcdFx0Y2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZSLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXG5cdFx0XHRjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFMLnBvc2l0aW9uLCBjYW1lcmFMLnF1YXRlcm5pb24sIGNhbWVyYUwuc2NhbGUgKTtcblx0XHRcdGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYVIucG9zaXRpb24sIGNhbWVyYVIucXVhdGVybmlvbiwgY2FtZXJhUi5zY2FsZSApO1xuXG5cdFx0XHRjYW1lcmFMLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uTC54ICogdGhpcy5zY2FsZSApO1xuXHRcdFx0Y2FtZXJhUi50cmFuc2xhdGVYKCBleWVUcmFuc2xhdGlvblIueCAqIHRoaXMuc2NhbGUgKTtcblxuXHRcdFx0Ly8gcmVuZGVyIGxlZnQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lTCwgY2FtZXJhTCApO1xuXG5cdFx0XHQvLyByZW5kZXIgcmlnaHQgZXllXG5cdFx0XHRyZW5kZXJlci5zZXRWaWV3cG9ydCggc2l6ZS53aWR0aCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcblx0XHRcdHJlbmRlcmVyLnNldFNjaXNzb3IoIHNpemUud2lkdGgsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lUiwgY2FtZXJhUiApO1xuXG5cdFx0XHRyZW5kZXJlci5lbmFibGVTY2lzc29yVGVzdCggZmFsc2UgKTtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0Ly8gUmVndWxhciByZW5kZXIgbW9kZSBpZiBub3QgSE1EXG5cblx0XHRpZiAoIHNjZW5lIGluc3RhbmNlb2YgQXJyYXkgKSBzY2VuZSA9IHNjZW5lWyAwIF07XG5cblx0XHRyZW5kZXJlci5yZW5kZXIoIHNjZW5lLCBjYW1lcmEgKTtcblxuXHR9O1xuXG4gIHRoaXMuUmVuZGVyUGFzcyA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSwgb3ZlcnJpZGVNYXRlcmlhbCwgY2xlYXJDb2xvciwgY2xlYXJBbHBoYSApIHtcbiAgICB0aGlzLnNjZW5lICAgICAgICAgICAgPSBzY2VuZTtcbiAgICB0aGlzLmNhbWVyYSAgICAgICAgICAgPSBjYW1lcmE7XG4gICAgdGhpcy5vdmVycmlkZU1hdGVyaWFsID0gb3ZlcnJpZGVNYXRlcmlhbDtcbiAgICB0aGlzLmNsZWFyQ29sb3IgICAgICAgPSBjbGVhckNvbG9yO1xuICAgIHRoaXMuY2xlYXJBbHBoYSAgICAgICA9ICggY2xlYXJBbHBoYSAhPT0gdW5kZWZpbmVkICkgPyBjbGVhckFscGhhIDogMTtcbiAgICB0aGlzLm9sZENsZWFyQ29sb3IgICAgPSBuZXcgVEhSRUUuQ29sb3IoKTtcbiAgICB0aGlzLm9sZENsZWFyQWxwaGEgICAgPSAxO1xuICAgIHRoaXMuZW5hYmxlZCAgICAgICAgICA9IHRydWU7XG4gICAgdGhpcy5jbGVhciAgICAgICAgICAgID0gdHJ1ZTtcbiAgICB0aGlzLm5lZWRzU3dhcCAgICAgICAgPSBmYWxzZTtcblxuICAgIHZhciBjYW1lcmFMID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCk7XG4gICAgdmFyIGNhbWVyYVIgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoKTtcblxuICAgIHRoaXMucmVuZGVyID0gZnVuY3Rpb24gKCBwcm92aWRlZFJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgc2NlbmUgKSB7XG5cbiAgICAgIHRoaXMuc2NlbmUub3ZlcnJpZGVNYXRlcmlhbCA9IHRoaXMub3ZlcnJpZGVNYXRlcmlhbDtcblxuICAgICAgaWYgKCB0aGlzLmNsZWFyQ29sb3IgKSB7XG4gICAgICAgIHRoaXMub2xkQ2xlYXJDb2xvci5jb3B5KCByZW5kZXJlci5nZXRDbGVhckNvbG9yKCkgKTtcbiAgICAgICAgdGhpcy5vbGRDbGVhckFscGhhID0gcmVuZGVyZXIuZ2V0Q2xlYXJBbHBoYSgpO1xuICAgICAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLmNsZWFyQ29sb3IsIHRoaXMuY2xlYXJBbHBoYSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoICF2ckhNRCApIHtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSwgcmVhZEJ1ZmZlciwgdGhpcy5jbGVhciApO1xuICAgICAgfSBlbHNlIHtcblxuICAgICAgICAvKiBCcmVhayBmb3IgVlJFZmZlY3QgY29kZSAqL1xuICAgICAgICB2YXIgc2NlbmVMLCBzY2VuZVI7XG5cbiAgICAgICAgaWYgKCBzY2VuZSBpbnN0YW5jZW9mIEFycmF5ICkge1xuICAgICAgICAgIHNjZW5lTCA9IHNjZW5lWyAwIF07XG4gICAgICAgICAgc2NlbmVSID0gc2NlbmVbIDEgXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY2VuZUwgPSBzY2VuZTtcbiAgICAgICAgICBzY2VuZVIgPSBzY2VuZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzaXplID0gcmVuZGVyZXIuZ2V0U2l6ZSgpO1xuICAgICAgICBzaXplLndpZHRoIC89IDI7XG5cbiAgICAgICAgcmVuZGVyZXIuZW5hYmxlU2Npc3NvclRlc3QoIHRydWUgKTtcbiAgICAgICAgcmVuZGVyZXIuY2xlYXIoKTtcblxuICAgICAgICBpZiAoIGNhbWVyYS5wYXJlbnQgPT09IHVuZGVmaW5lZCApIGNhbWVyYS51cGRhdGVNYXRyaXhXb3JsZCgpO1xuXG4gICAgICAgIGNhbWVyYUwucHJvamVjdGlvbk1hdHJpeCA9IGZvdlRvUHJvamVjdGlvbiggZXllRk9WTCwgdHJ1ZSwgY2FtZXJhLm5lYXIsIGNhbWVyYS5mYXIgKTtcbiAgICAgICAgY2FtZXJhUi5wcm9qZWN0aW9uTWF0cml4ID0gZm92VG9Qcm9qZWN0aW9uKCBleWVGT1ZSLCB0cnVlLCBjYW1lcmEubmVhciwgY2FtZXJhLmZhciApO1xuXG4gICAgICAgIGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYUwucG9zaXRpb24sIGNhbWVyYUwucXVhdGVybmlvbiwgY2FtZXJhTC5zY2FsZSApO1xuICAgICAgICBjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFSLnBvc2l0aW9uLCBjYW1lcmFSLnF1YXRlcm5pb24sIGNhbWVyYVIuc2NhbGUgKTtcblxuICAgICAgICBjYW1lcmFMLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uTC54ICogdGhpcy5zY2FsZSApO1xuICAgICAgICBjYW1lcmFSLnRyYW5zbGF0ZVgoIGV5ZVRyYW5zbGF0aW9uUi54ICogdGhpcy5zY2FsZSApO1xuXG4gICAgICAgIC8vIHJlbmRlciBsZWZ0IGV5ZVxuICAgICAgICByZW5kZXJlci5zZXRWaWV3cG9ydCggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcbiAgICAgICAgcmVuZGVyZXIuc2V0U2Npc3NvciggMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKCBzY2VuZUwsIGNhbWVyYUwgKTtcblxuICAgICAgICAvLyByZW5kZXIgcmlnaHQgZXllXG4gICAgICAgIHJlbmRlcmVyLnNldFZpZXdwb3J0KCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuICAgICAgICByZW5kZXJlci5zZXRTY2lzc29yKCBzaXplLndpZHRoLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuICAgICAgICByZW5kZXJlci5yZW5kZXIoIHNjZW5lUiwgY2FtZXJhUiApO1xuXG4gICAgICAgIHJlbmRlcmVyLmVuYWJsZVNjaXNzb3JUZXN0KCBmYWxzZSApO1xuICAgICAgfVxuXG4gICAgICAvKiBSZXN1bWUgUmVuZGVyUGFzcyBjb2RlICovXG5cbiAgICAgIGlmICggdGhpcy5jbGVhckNvbG9yICkge1xuICAgICAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLm9sZENsZWFyQ29sb3IsIHRoaXMub2xkQ2xlYXJBbHBoYSApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNjZW5lLm92ZXJyaWRlTWF0ZXJpYWwgPSBudWxsO1xuICAgIH07XG4gIH07XG5cblx0Ly9cblxuXHRmdW5jdGlvbiBmb3ZUb05EQ1NjYWxlT2Zmc2V0KCBmb3YgKSB7XG5cblx0XHR2YXIgcHhzY2FsZSA9IDIuMCAvIChmb3YubGVmdFRhbiArIGZvdi5yaWdodFRhbik7XG5cdFx0dmFyIHB4b2Zmc2V0ID0gKGZvdi5sZWZ0VGFuIC0gZm92LnJpZ2h0VGFuKSAqIHB4c2NhbGUgKiAwLjU7XG5cdFx0dmFyIHB5c2NhbGUgPSAyLjAgLyAoZm92LnVwVGFuICsgZm92LmRvd25UYW4pO1xuXHRcdHZhciBweW9mZnNldCA9IChmb3YudXBUYW4gLSBmb3YuZG93blRhbikgKiBweXNjYWxlICogMC41O1xuXHRcdHJldHVybiB7IHNjYWxlOiBbIHB4c2NhbGUsIHB5c2NhbGUgXSwgb2Zmc2V0OiBbIHB4b2Zmc2V0LCBweW9mZnNldCBdIH07XG5cblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdiwgcmlnaHRIYW5kZWQsIHpOZWFyLCB6RmFyICkge1xuXG5cdFx0cmlnaHRIYW5kZWQgPSByaWdodEhhbmRlZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHJpZ2h0SGFuZGVkO1xuXHRcdHpOZWFyID0gek5lYXIgPT09IHVuZGVmaW5lZCA/IDAuMDEgOiB6TmVhcjtcblx0XHR6RmFyID0gekZhciA9PT0gdW5kZWZpbmVkID8gMTAwMDAuMCA6IHpGYXI7XG5cblx0XHR2YXIgaGFuZGVkbmVzc1NjYWxlID0gcmlnaHRIYW5kZWQgPyAtMS4wIDogMS4wO1xuXG5cdFx0Ly8gc3RhcnQgd2l0aCBhbiBpZGVudGl0eSBtYXRyaXhcblx0XHR2YXIgbW9iaiA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0dmFyIG0gPSBtb2JqLmVsZW1lbnRzO1xuXG5cdFx0Ly8gYW5kIHdpdGggc2NhbGUvb2Zmc2V0IGluZm8gZm9yIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3Jkc1xuXHRcdHZhciBzY2FsZUFuZE9mZnNldCA9IGZvdlRvTkRDU2NhbGVPZmZzZXQoZm92KTtcblxuXHRcdC8vIFggcmVzdWx0LCBtYXAgY2xpcCBlZGdlcyB0byBbLXcsK3ddXG5cdFx0bVswICogNCArIDBdID0gc2NhbGVBbmRPZmZzZXQuc2NhbGVbMF07XG5cdFx0bVswICogNCArIDFdID0gMC4wO1xuXHRcdG1bMCAqIDQgKyAyXSA9IHNjYWxlQW5kT2Zmc2V0Lm9mZnNldFswXSAqIGhhbmRlZG5lc3NTY2FsZTtcblx0XHRtWzAgKiA0ICsgM10gPSAwLjA7XG5cblx0XHQvLyBZIHJlc3VsdCwgbWFwIGNsaXAgZWRnZXMgdG8gWy13LCt3XVxuXHRcdC8vIFkgb2Zmc2V0IGlzIG5lZ2F0ZWQgYmVjYXVzZSB0aGlzIHByb2ogbWF0cml4IHRyYW5zZm9ybXMgZnJvbSB3b3JsZCBjb29yZHMgd2l0aCBZPXVwLFxuXHRcdC8vIGJ1dCB0aGUgTkRDIHNjYWxpbmcgaGFzIFk9ZG93biAodGhhbmtzIEQzRD8pXG5cdFx0bVsxICogNCArIDBdID0gMC4wO1xuXHRcdG1bMSAqIDQgKyAxXSA9IHNjYWxlQW5kT2Zmc2V0LnNjYWxlWzFdO1xuXHRcdG1bMSAqIDQgKyAyXSA9IC1zY2FsZUFuZE9mZnNldC5vZmZzZXRbMV0gKiBoYW5kZWRuZXNzU2NhbGU7XG5cdFx0bVsxICogNCArIDNdID0gMC4wO1xuXG5cdFx0Ly8gWiByZXN1bHQgKHVwIHRvIHRoZSBhcHApXG5cdFx0bVsyICogNCArIDBdID0gMC4wO1xuXHRcdG1bMiAqIDQgKyAxXSA9IDAuMDtcblx0XHRtWzIgKiA0ICsgMl0gPSB6RmFyIC8gKHpOZWFyIC0gekZhcikgKiAtaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMiAqIDQgKyAzXSA9ICh6RmFyICogek5lYXIpIC8gKHpOZWFyIC0gekZhcik7XG5cblx0XHQvLyBXIHJlc3VsdCAoPSBaIGluKVxuXHRcdG1bMyAqIDQgKyAwXSA9IDAuMDtcblx0XHRtWzMgKiA0ICsgMV0gPSAwLjA7XG5cdFx0bVszICogNCArIDJdID0gaGFuZGVkbmVzc1NjYWxlO1xuXHRcdG1bMyAqIDQgKyAzXSA9IDAuMDtcblxuXHRcdG1vYmoudHJhbnNwb3NlKCk7XG5cblx0XHRyZXR1cm4gbW9iajtcblx0fVxuXG5cdGZ1bmN0aW9uIGZvdlRvUHJvamVjdGlvbiggZm92LCByaWdodEhhbmRlZCwgek5lYXIsIHpGYXIgKSB7XG5cblx0XHR2YXIgREVHMlJBRCA9IE1hdGguUEkgLyAxODAuMDtcblxuXHRcdHZhciBmb3ZQb3J0ID0ge1xuXHRcdFx0dXBUYW46IE1hdGgudGFuKCBmb3YudXBEZWdyZWVzICogREVHMlJBRCApLFxuXHRcdFx0ZG93blRhbjogTWF0aC50YW4oIGZvdi5kb3duRGVncmVlcyAqIERFRzJSQUQgKSxcblx0XHRcdGxlZnRUYW46IE1hdGgudGFuKCBmb3YubGVmdERlZ3JlZXMgKiBERUcyUkFEICksXG5cdFx0XHRyaWdodFRhbjogTWF0aC50YW4oIGZvdi5yaWdodERlZ3JlZXMgKiBERUcyUkFEIClcblx0XHR9O1xuXG5cdFx0cmV0dXJuIGZvdlBvcnRUb1Byb2plY3Rpb24oIGZvdlBvcnQsIHJpZ2h0SGFuZGVkLCB6TmVhciwgekZhciApO1xuXG5cdH1cblxufTtcbiIsIlxuLypcbiAqIE1velZSIEV4dGVuc2lvbnMgdG8gdGhyZWUuanNcbiAqXG4gKiBBIGJyb3dzZXJpZnkgd3JhcHBlciBmb3IgdGhlIFZSIGhlbHBlcnMgZnJvbSBNb3pWUidzIGdpdGh1YiByZXBvLlxuICogaHR0cHM6Ly9naXRodWIuY29tL01velZSL3ZyLXdlYi1leGFtcGxlcy90cmVlL21hc3Rlci90aHJlZWpzLXZyLWJvaWxlcnBsYXRlXG4gKlxuICogVGhlIGV4dGVuc2lvbiBmaWxlcyBhcmUgbm90IG1vZHVsZSBjb21wYXRpYmxlIGFuZCB3b3JrIGJ5IGFwcGVuZGluZyB0byB0aGVcbiAqIFRIUkVFIG9iamVjdC4gRG8gdXNlIHRoZW0sIHdlIG1ha2UgdGhlIFRIUkVFIG9iamVjdCBnbG9iYWwsIGFuZCB0aGVuIG1ha2VcbiAqIGl0IHRoZSBleHBvcnQgdmFsdWUgb2YgdGhpcyBtb2R1bGUuXG4gKlxuICovXG5cbmNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ0xvYWRpbmcgTW96VlIgRXh0ZW5zaW9ucy4uLicpO1xuLy9yZXF1aXJlKCcuL1N0ZXJlb0VmZmVjdC5qcycpO1xuLy9jb25zb2xlLmxvZygnU3RlcmVvRWZmZWN0IC0gT0snKTtcblxucmVxdWlyZSgnLi9WUkNvbnRyb2xzLmpzJyk7XG5jb25zb2xlLmxvZygnVlJDb250cm9scyAtIE9LJyk7XG5cbnJlcXVpcmUoJy4vVlJFZmZlY3QuanMnKTtcbmNvbnNvbGUubG9nKCdWUkVmZmVjdCAtIE9LJyk7XG5cbmNvbnNvbGUuZ3JvdXBFbmQoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRTtcblxuIiwiLyoqXG4gKiBAYXV0aG9yIEViZXJoYXJkIEdyYWV0aGVyIC8gaHR0cDovL2VncmFldGhlci5jb20vXG4gKiBAYXV0aG9yIE1hcmsgTHVuZGluIFx0LyBodHRwOi8vbWFyay1sdW5kaW4uY29tXG4gKiBAYXV0aG9yIFNpbW9uZSBNYW5pbmkgLyBodHRwOi8vZGFyb24xMzM3LmdpdGh1Yi5pb1xuICogQGF1dGhvciBMdWNhIEFudGlnYSBcdC8gaHR0cDovL2xhbnRpZ2EuZ2l0aHViLmlvXG4gKi9cblxuVEhSRUUuVHJhY2tiYWxsQ29udHJvbHMgPSBmdW5jdGlvbiAoIG9iamVjdCwgdGFyZ2V0LCBkb21FbGVtZW50ICkge1xuXG5cdHZhciBfdGhpcyA9IHRoaXM7XG5cdHZhciBTVEFURSA9IHsgTk9ORTogLTEsIFJPVEFURTogMCwgWk9PTTogMSwgUEFOOiAyLCBUT1VDSF9ST1RBVEU6IDMsIFRPVUNIX1pPT01fUEFOOiA0IH07XG5cblx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cdHRoaXMuZG9tRWxlbWVudCA9ICggZG9tRWxlbWVudCAhPT0gdW5kZWZpbmVkICkgPyBkb21FbGVtZW50IDogZG9jdW1lbnQ7XG5cblx0Ly8gQVBJXG5cblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuXHR0aGlzLnNjcmVlbiA9IHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG5cblx0dGhpcy5yb3RhdGVTcGVlZCA9IDEuMDtcblx0dGhpcy56b29tU3BlZWQgPSAxLjI7XG5cdHRoaXMucGFuU3BlZWQgPSAwLjM7XG5cblx0dGhpcy5ub1JvdGF0ZSA9IGZhbHNlO1xuXHR0aGlzLm5vWm9vbSA9IGZhbHNlO1xuXHR0aGlzLm5vUGFuID0gZmFsc2U7XG5cblx0dGhpcy5zdGF0aWNNb3ZpbmcgPSBmYWxzZTtcblx0dGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciA9IDAuMjtcblxuXHR0aGlzLm1pbkRpc3RhbmNlID0gMDtcblx0dGhpcy5tYXhEaXN0YW5jZSA9IEluZmluaXR5O1xuXG5cdHRoaXMua2V5cyA9IFsgNjUgLypBKi8sIDgzIC8qUyovLCA2OCAvKkQqLyBdO1xuXG5cdC8vIGludGVybmFsc1xuXG5cdHRoaXMudGFyZ2V0ID0gdGFyZ2V0ID8gdGFyZ2V0LnBvc2l0aW9uIDogbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHR2YXIgRVBTID0gMC4wMDAwMDE7XG5cblx0dmFyIGxhc3RQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0dmFyIF9zdGF0ZSA9IFNUQVRFLk5PTkUsXG5cdF9wcmV2U3RhdGUgPSBTVEFURS5OT05FLFxuXG5cdF9leWUgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXG5cdF9tb3ZlUHJldiA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF9tb3ZlQ3VyciA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cblx0X2xhc3RBeGlzID0gbmV3IFRIUkVFLlZlY3RvcjMoKSxcblx0X2xhc3RBbmdsZSA9IDAsXG5cblx0X3pvb21TdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdF96b29tRW5kID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblxuXHRfdG91Y2hab29tRGlzdGFuY2VTdGFydCA9IDAsXG5cdF90b3VjaFpvb21EaXN0YW5jZUVuZCA9IDAsXG5cblx0X3BhblN0YXJ0ID0gbmV3IFRIUkVFLlZlY3RvcjIoKSxcblx0X3BhbkVuZCA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0Ly8gZm9yIHJlc2V0XG5cblx0dGhpcy50YXJnZXQwID0gdGhpcy50YXJnZXQuY2xvbmUoKTtcblx0dGhpcy5wb3NpdGlvbjAgPSB0aGlzLm9iamVjdC5wb3NpdGlvbi5jbG9uZSgpO1xuXHR0aGlzLnVwMCA9IHRoaXMub2JqZWN0LnVwLmNsb25lKCk7XG5cblx0Ly8gZXZlbnRzXG5cblx0dmFyIGNoYW5nZUV2ZW50ID0geyB0eXBlOiAnY2hhbmdlJyB9O1xuXHR2YXIgc3RhcnRFdmVudCA9IHsgdHlwZTogJ3N0YXJ0JyB9O1xuXHR2YXIgZW5kRXZlbnQgPSB7IHR5cGU6ICdlbmQnIH07XG5cblxuXHQvLyBtZXRob2RzXG5cblx0dGhpcy5oYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoIHRoaXMuZG9tRWxlbWVudCA9PT0gZG9jdW1lbnQgKSB7XG5cblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSAwO1xuXHRcdFx0dGhpcy5zY3JlZW4udG9wID0gMDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0XHR0aGlzLnNjcmVlbi5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR2YXIgYm94ID0gdGhpcy5kb21FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0Ly8gYWRqdXN0bWVudHMgY29tZSBmcm9tIHNpbWlsYXIgY29kZSBpbiB0aGUganF1ZXJ5IG9mZnNldCgpIGZ1bmN0aW9uXG5cdFx0XHR2YXIgZCA9IHRoaXMuZG9tRWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblx0XHRcdHRoaXMuc2NyZWVuLmxlZnQgPSBib3gubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIGQuY2xpZW50TGVmdDtcblx0XHRcdHRoaXMuc2NyZWVuLnRvcCA9IGJveC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBkLmNsaWVudFRvcDtcblx0XHRcdHRoaXMuc2NyZWVuLndpZHRoID0gYm94LndpZHRoO1xuXHRcdFx0dGhpcy5zY3JlZW4uaGVpZ2h0ID0gYm94LmhlaWdodDtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCB0eXBlb2YgdGhpc1sgZXZlbnQudHlwZSBdID09ICdmdW5jdGlvbicgKSB7XG5cblx0XHRcdHRoaXNbIGV2ZW50LnR5cGUgXSggZXZlbnQgKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHZhciBnZXRNb3VzZU9uU2NyZWVuID0gKCBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdmVjdG9yID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBhZ2VYLCBwYWdlWSApIHtcblxuXHRcdFx0dmVjdG9yLnNldChcblx0XHRcdFx0KCBwYWdlWCAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyBfdGhpcy5zY3JlZW4ud2lkdGgsXG5cdFx0XHRcdCggcGFnZVkgLSBfdGhpcy5zY3JlZW4udG9wICkgLyBfdGhpcy5zY3JlZW4uaGVpZ2h0XG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm4gdmVjdG9yO1xuXG5cdFx0fTtcblxuXHR9KCkgKTtcblxuXHR2YXIgZ2V0TW91c2VPbkNpcmNsZSA9ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBwYWdlWCwgcGFnZVkgKSB7XG5cblx0XHRcdHZlY3Rvci5zZXQoXG5cdFx0XHRcdCggKCBwYWdlWCAtIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSAtIF90aGlzLnNjcmVlbi5sZWZ0ICkgLyAoIF90aGlzLnNjcmVlbi53aWR0aCAqIDAuNSApICksXG5cdFx0XHRcdCggKCBfdGhpcy5zY3JlZW4uaGVpZ2h0ICsgMiAqICggX3RoaXMuc2NyZWVuLnRvcCAtIHBhZ2VZICkgKSAvIF90aGlzLnNjcmVlbi53aWR0aCApIC8vIHNjcmVlbi53aWR0aCBpbnRlbnRpb25hbFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIHZlY3Rvcjtcblx0XHR9O1xuXG5cdH0oKSApO1xuXG5cdHRoaXMucm90YXRlQ2FtZXJhID0gKGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGF4aXMgPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0cXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCksXG5cdFx0XHRleWVEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0VXBEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpLFxuXHRcdFx0bW92ZURpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRhbmdsZTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdG1vdmVEaXJlY3Rpb24uc2V0KCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54LCBfbW92ZUN1cnIueSAtIF9tb3ZlUHJldi55LCAwICk7XG5cdFx0XHRhbmdsZSA9IG1vdmVEaXJlY3Rpb24ubGVuZ3RoKCk7XG5cblx0XHRcdGlmICggYW5nbGUgKSB7XG5cblx0XHRcdFx0X2V5ZS5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKS5zdWIoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0XHRcdGV5ZURpcmVjdGlvbi5jb3B5KCBfZXllICkubm9ybWFsaXplKCk7XG5cdFx0XHRcdG9iamVjdFVwRGlyZWN0aW9uLmNvcHkoIF90aGlzLm9iamVjdC51cCApLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRvYmplY3RTaWRld2F5c0RpcmVjdGlvbi5jcm9zc1ZlY3RvcnMoIG9iamVjdFVwRGlyZWN0aW9uLCBleWVEaXJlY3Rpb24gKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0XHRvYmplY3RVcERpcmVjdGlvbi5zZXRMZW5ndGgoIF9tb3ZlQ3Vyci55IC0gX21vdmVQcmV2LnkgKTtcblx0XHRcdFx0b2JqZWN0U2lkZXdheXNEaXJlY3Rpb24uc2V0TGVuZ3RoKCBfbW92ZUN1cnIueCAtIF9tb3ZlUHJldi54ICk7XG5cblx0XHRcdFx0bW92ZURpcmVjdGlvbi5jb3B5KCBvYmplY3RVcERpcmVjdGlvbi5hZGQoIG9iamVjdFNpZGV3YXlzRGlyZWN0aW9uICkgKTtcblxuXHRcdFx0XHRheGlzLmNyb3NzVmVjdG9ycyggbW92ZURpcmVjdGlvbiwgX2V5ZSApLm5vcm1hbGl6ZSgpO1xuXG5cdFx0XHRcdGFuZ2xlICo9IF90aGlzLnJvdGF0ZVNwZWVkO1xuXHRcdFx0XHRxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICk7XG5cblx0XHRcdFx0X2V5ZS5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblx0XHRcdFx0X3RoaXMub2JqZWN0LnVwLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApO1xuXG5cdFx0XHRcdF9sYXN0QXhpcy5jb3B5KCBheGlzICk7XG5cdFx0XHRcdF9sYXN0QW5nbGUgPSBhbmdsZTtcblxuXHRcdFx0fVxuXG5cdFx0XHRlbHNlIGlmICggIV90aGlzLnN0YXRpY01vdmluZyAmJiBfbGFzdEFuZ2xlICkge1xuXG5cdFx0XHRcdF9sYXN0QW5nbGUgKj0gTWF0aC5zcXJ0KCAxLjAgLSBfdGhpcy5keW5hbWljRGFtcGluZ0ZhY3RvciApO1xuXHRcdFx0XHRfZXllLmNvcHkoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApLnN1YiggX3RoaXMudGFyZ2V0ICk7XG5cdFx0XHRcdHF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZSggX2xhc3RBeGlzLCBfbGFzdEFuZ2xlICk7XG5cdFx0XHRcdF9leWUuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uICk7XG5cdFx0XHRcdF90aGlzLm9iamVjdC51cC5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24gKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfbW92ZVByZXYuY29weSggX21vdmVDdXJyICk7XG5cblx0XHR9O1xuXG5cdH0oKSk7XG5cblxuXHR0aGlzLnpvb21DYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZmFjdG9yO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlRPVUNIX1pPT01fUEFOICkge1xuXG5cdFx0XHRmYWN0b3IgPSBfdG91Y2hab29tRGlzdGFuY2VTdGFydCAvIF90b3VjaFpvb21EaXN0YW5jZUVuZDtcblx0XHRcdF90b3VjaFpvb21EaXN0YW5jZVN0YXJ0ID0gX3RvdWNoWm9vbURpc3RhbmNlRW5kO1xuXHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRmYWN0b3IgPSAxLjAgKyAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIF90aGlzLnpvb21TcGVlZDtcblxuXHRcdFx0aWYgKCBmYWN0b3IgIT09IDEuMCAmJiBmYWN0b3IgPiAwLjAgKSB7XG5cblx0XHRcdFx0X2V5ZS5tdWx0aXBseVNjYWxhciggZmFjdG9yICk7XG5cblx0XHRcdFx0aWYgKCBfdGhpcy5zdGF0aWNNb3ZpbmcgKSB7XG5cblx0XHRcdFx0XHRfem9vbVN0YXJ0LmNvcHkoIF96b29tRW5kICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdF96b29tU3RhcnQueSArPSAoIF96b29tRW5kLnkgLSBfem9vbVN0YXJ0LnkgKSAqIHRoaXMuZHluYW1pY0RhbXBpbmdGYWN0b3I7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnBhbkNhbWVyYSA9IChmdW5jdGlvbigpIHtcblxuXHRcdHZhciBtb3VzZUNoYW5nZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCksXG5cdFx0XHRvYmplY3RVcCA9IG5ldyBUSFJFRS5WZWN0b3IzKCksXG5cdFx0XHRwYW4gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0bW91c2VDaGFuZ2UuY29weSggX3BhbkVuZCApLnN1YiggX3BhblN0YXJ0ICk7XG5cblx0XHRcdGlmICggbW91c2VDaGFuZ2UubGVuZ3RoU3EoKSApIHtcblxuXHRcdFx0XHRtb3VzZUNoYW5nZS5tdWx0aXBseVNjYWxhciggX2V5ZS5sZW5ndGgoKSAqIF90aGlzLnBhblNwZWVkICk7XG5cblx0XHRcdFx0cGFuLmNvcHkoIF9leWUgKS5jcm9zcyggX3RoaXMub2JqZWN0LnVwICkuc2V0TGVuZ3RoKCBtb3VzZUNoYW5nZS54ICk7XG5cdFx0XHRcdHBhbi5hZGQoIG9iamVjdFVwLmNvcHkoIF90aGlzLm9iamVjdC51cCApLnNldExlbmd0aCggbW91c2VDaGFuZ2UueSApICk7XG5cblx0XHRcdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZCggcGFuICk7XG5cdFx0XHRcdF90aGlzLnRhcmdldC5hZGQoIHBhbiApO1xuXG5cdFx0XHRcdGlmICggX3RoaXMuc3RhdGljTW92aW5nICkge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIF9wYW5FbmQgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0X3BhblN0YXJ0LmFkZCggbW91c2VDaGFuZ2Uuc3ViVmVjdG9ycyggX3BhbkVuZCwgX3BhblN0YXJ0ICkubXVsdGlwbHlTY2FsYXIoIF90aGlzLmR5bmFtaWNEYW1waW5nRmFjdG9yICkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9O1xuXG5cdH0oKSk7XG5cblx0dGhpcy5jaGVja0Rpc3RhbmNlcyA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSB8fCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpID4gX3RoaXMubWF4RGlzdGFuY2UgKiBfdGhpcy5tYXhEaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWF4RGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGlmICggX2V5ZS5sZW5ndGhTcSgpIDwgX3RoaXMubWluRGlzdGFuY2UgKiBfdGhpcy5taW5EaXN0YW5jZSApIHtcblxuXHRcdFx0XHRfdGhpcy5vYmplY3QucG9zaXRpb24uYWRkVmVjdG9ycyggX3RoaXMudGFyZ2V0LCBfZXllLnNldExlbmd0aCggX3RoaXMubWluRGlzdGFuY2UgKSApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdGlmICggIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfdGhpcy5yb3RhdGVDYW1lcmEoKTtcblxuXHRcdH1cblxuXHRcdGlmICggIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3RoaXMuem9vbUNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF90aGlzLnBhbkNhbWVyYSgpO1xuXG5cdFx0fVxuXG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmFkZFZlY3RvcnMoIF90aGlzLnRhcmdldCwgX2V5ZSApO1xuXG5cdFx0X3RoaXMuY2hlY2tEaXN0YW5jZXMoKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0aWYgKCBsYXN0UG9zaXRpb24uZGlzdGFuY2VUb1NxdWFyZWQoIF90aGlzLm9iamVjdC5wb3NpdGlvbiApID4gRVBTICkge1xuXG5cdFx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBjaGFuZ2VFdmVudCApO1xuXG5cdFx0XHRsYXN0UG9zaXRpb24uY29weSggX3RoaXMub2JqZWN0LnBvc2l0aW9uICk7XG5cblx0XHR9XG5cblx0fTtcblxuXHR0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfcHJldlN0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdF90aGlzLnRhcmdldC5jb3B5KCBfdGhpcy50YXJnZXQwICk7XG5cdFx0X3RoaXMub2JqZWN0LnBvc2l0aW9uLmNvcHkoIF90aGlzLnBvc2l0aW9uMCApO1xuXHRcdF90aGlzLm9iamVjdC51cC5jb3B5KCBfdGhpcy51cDAgKTtcblxuXHRcdF9leWUuc3ViVmVjdG9ycyggX3RoaXMub2JqZWN0LnBvc2l0aW9uLCBfdGhpcy50YXJnZXQgKTtcblxuXHRcdF90aGlzLm9iamVjdC5sb29rQXQoIF90aGlzLnRhcmdldCApO1xuXG5cdFx0X3RoaXMuZGlzcGF0Y2hFdmVudCggY2hhbmdlRXZlbnQgKTtcblxuXHRcdGxhc3RQb3NpdGlvbi5jb3B5KCBfdGhpcy5vYmplY3QucG9zaXRpb24gKTtcblxuXHR9O1xuXG5cdC8vIGxpc3RlbmVyc1xuXG5cdGZ1bmN0aW9uIGtleWRvd24oIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24gKTtcblxuXHRcdF9wcmV2U3RhdGUgPSBfc3RhdGU7XG5cblx0XHRpZiAoIF9zdGF0ZSAhPT0gU1RBVEUuTk9ORSApIHtcblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fSBlbHNlIGlmICggZXZlbnQua2V5Q29kZSA9PT0gX3RoaXMua2V5c1sgU1RBVEUuUk9UQVRFIF0gJiYgIV90aGlzLm5vUm90YXRlICkge1xuXG5cdFx0XHRfc3RhdGUgPSBTVEFURS5ST1RBVEU7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSBfdGhpcy5rZXlzWyBTVEFURS5aT09NIF0gJiYgIV90aGlzLm5vWm9vbSApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuWk9PTTtcblxuXHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IF90aGlzLmtleXNbIFNUQVRFLlBBTiBdICYmICFfdGhpcy5ub1BhbiApIHtcblxuXHRcdFx0X3N0YXRlID0gU1RBVEUuUEFOO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRmdW5jdGlvbiBrZXl1cCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0X3N0YXRlID0gX3ByZXZTdGF0ZTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGtleWRvd24sIGZhbHNlICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNlZG93biggZXZlbnQgKSB7XG5cblx0XHRpZiAoIF90aGlzLmVuYWJsZWQgPT09IGZhbHNlICkgcmV0dXJuO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdGlmICggX3N0YXRlID09PSBTVEFURS5OT05FICkge1xuXG5cdFx0XHRfc3RhdGUgPSBldmVudC5idXR0b247XG5cblx0XHR9XG5cblx0XHRpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuUk9UQVRFICYmICFfdGhpcy5ub1JvdGF0ZSApIHtcblxuXHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5aT09NICYmICFfdGhpcy5ub1pvb20gKSB7XG5cblx0XHRcdF96b29tU3RhcnQuY29weSggZ2V0TW91c2VPblNjcmVlbiggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblx0XHRcdF96b29tRW5kLmNvcHkoX3pvb21TdGFydCk7XG5cblx0XHR9IGVsc2UgaWYgKCBfc3RhdGUgPT09IFNUQVRFLlBBTiAmJiAhX3RoaXMubm9QYW4gKSB7XG5cblx0XHRcdF9wYW5TdGFydC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXHRcdFx0X3BhbkVuZC5jb3B5KF9wYW5TdGFydCk7XG5cblx0XHR9XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlLCBmYWxzZSApO1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCwgZmFsc2UgKTtcblxuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblxuXHR9XG5cblx0ZnVuY3Rpb24gbW91c2Vtb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0aWYgKCBfc3RhdGUgPT09IFNUQVRFLlJPVEFURSAmJiAhX3RoaXMubm9Sb3RhdGUgKSB7XG5cblx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggZXZlbnQucGFnZVgsIGV2ZW50LnBhZ2VZICkgKTtcblxuXHRcdH0gZWxzZSBpZiAoIF9zdGF0ZSA9PT0gU1RBVEUuWk9PTSAmJiAhX3RoaXMubm9ab29tICkge1xuXG5cdFx0XHRfem9vbUVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCBldmVudC5wYWdlWCwgZXZlbnQucGFnZVkgKSApO1xuXG5cdFx0fSBlbHNlIGlmICggX3N0YXRlID09PSBTVEFURS5QQU4gJiYgIV90aGlzLm5vUGFuICkge1xuXG5cdFx0XHRfcGFuRW5kLmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSApICk7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNldXAoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRfc3RhdGUgPSBTVEFURS5OT05FO1xuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlbW92ZSApO1xuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2V1cCApO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIGVuZEV2ZW50ICk7XG5cblx0fVxuXG5cdGZ1bmN0aW9uIG1vdXNld2hlZWwoIGV2ZW50ICkge1xuXG5cdFx0aWYgKCBfdGhpcy5lbmFibGVkID09PSBmYWxzZSApIHJldHVybjtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHR2YXIgZGVsdGEgPSAwO1xuXG5cdFx0aWYgKCBldmVudC53aGVlbERlbHRhICkgeyAvLyBXZWJLaXQgLyBPcGVyYSAvIEV4cGxvcmVyIDlcblxuXHRcdFx0ZGVsdGEgPSBldmVudC53aGVlbERlbHRhIC8gNDA7XG5cblx0XHR9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwgKSB7IC8vIEZpcmVmb3hcblxuXHRcdFx0ZGVsdGEgPSAtIGV2ZW50LmRldGFpbCAvIDM7XG5cblx0XHR9XG5cblx0XHRfem9vbVN0YXJ0LnkgKz0gZGVsdGEgKiAwLjAxO1xuXHRcdF90aGlzLmRpc3BhdGNoRXZlbnQoIHN0YXJ0RXZlbnQgKTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHRmdW5jdGlvbiB0b3VjaHN0YXJ0KCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfc3RhdGUgPSBTVEFURS5UT1VDSF9ST1RBVEU7XG5cdFx0XHRcdF9tb3ZlQ3Vyci5jb3B5KCBnZXRNb3VzZU9uQ2lyY2xlKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdF9tb3ZlUHJldi5jb3B5KF9tb3ZlQ3Vycik7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLlRPVUNIX1pPT01fUEFOO1xuXHRcdFx0XHR2YXIgZHggPSBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggLSBldmVudC50b3VjaGVzWyAxIF0ucGFnZVg7XG5cdFx0XHRcdHZhciBkeSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWTtcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlRW5kID0gX3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhblN0YXJ0LmNvcHkoIGdldE1vdXNlT25TY3JlZW4oIHgsIHkgKSApO1xuXHRcdFx0XHRfcGFuRW5kLmNvcHkoIF9wYW5TdGFydCApO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblxuXHRcdH1cblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBzdGFydEV2ZW50ICk7XG5cblxuXHR9XG5cblx0ZnVuY3Rpb24gdG91Y2htb3ZlKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG5cdFx0c3dpdGNoICggZXZlbnQudG91Y2hlcy5sZW5ndGggKSB7XG5cblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0X21vdmVQcmV2LmNvcHkoX21vdmVDdXJyKTtcblx0XHRcdFx0X21vdmVDdXJyLmNvcHkoIGdldE1vdXNlT25DaXJjbGUoICBldmVudC50b3VjaGVzWyAwIF0ucGFnZVgsIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSApICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHZhciBkeCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCAtIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWDtcblx0XHRcdFx0dmFyIGR5ID0gZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZIC0gZXZlbnQudG91Y2hlc1sgMSBdLnBhZ2VZO1xuXHRcdFx0XHRfdG91Y2hab29tRGlzdGFuY2VFbmQgPSBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG5cblx0XHRcdFx0dmFyIHggPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWCApIC8gMjtcblx0XHRcdFx0dmFyIHkgPSAoIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWSArIGV2ZW50LnRvdWNoZXNbIDEgXS5wYWdlWSApIC8gMjtcblx0XHRcdFx0X3BhbkVuZC5jb3B5KCBnZXRNb3VzZU9uU2NyZWVuKCB4LCB5ICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdF9zdGF0ZSA9IFNUQVRFLk5PTkU7XG5cblx0XHR9XG5cblx0fVxuXG5cdGZ1bmN0aW9uIHRvdWNoZW5kKCBldmVudCApIHtcblxuXHRcdGlmICggX3RoaXMuZW5hYmxlZCA9PT0gZmFsc2UgKSByZXR1cm47XG5cblx0XHRzd2l0Y2ggKCBldmVudC50b3VjaGVzLmxlbmd0aCApIHtcblxuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRfbW92ZVByZXYuY29weShfbW92ZUN1cnIpO1xuXHRcdFx0XHRfbW92ZUN1cnIuY29weSggZ2V0TW91c2VPbkNpcmNsZSggIGV2ZW50LnRvdWNoZXNbIDAgXS5wYWdlWCwgZXZlbnQudG91Y2hlc1sgMCBdLnBhZ2VZICkgKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0X3RvdWNoWm9vbURpc3RhbmNlU3RhcnQgPSBfdG91Y2hab29tRGlzdGFuY2VFbmQgPSAwO1xuXG5cdFx0XHRcdHZhciB4ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVggKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVggKSAvIDI7XG5cdFx0XHRcdHZhciB5ID0gKCBldmVudC50b3VjaGVzWyAwIF0ucGFnZVkgKyBldmVudC50b3VjaGVzWyAxIF0ucGFnZVkgKSAvIDI7XG5cdFx0XHRcdF9wYW5FbmQuY29weSggZ2V0TW91c2VPblNjcmVlbiggeCwgeSApICk7XG5cdFx0XHRcdF9wYW5TdGFydC5jb3B5KCBfcGFuRW5kICk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0fVxuXG5cdFx0X3N0YXRlID0gU1RBVEUuTk9ORTtcblx0XHRfdGhpcy5kaXNwYXRjaEV2ZW50KCBlbmRFdmVudCApO1xuXG5cdH1cblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKCBldmVudCApIHsgZXZlbnQucHJldmVudERlZmF1bHQoKTsgfSwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1vdXNlZG93biwgZmFsc2UgKTtcblxuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNld2hlZWwnLCBtb3VzZXdoZWVsLCBmYWxzZSApO1xuXHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTU1vdXNlU2Nyb2xsJywgbW91c2V3aGVlbCwgZmFsc2UgKTsgLy8gZmlyZWZveFxuXG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHRvdWNoc3RhcnQsIGZhbHNlICk7XG5cdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCB0b3VjaGVuZCwgZmFsc2UgKTtcblx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCB0b3VjaG1vdmUsIGZhbHNlICk7XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywga2V5ZG93biwgZmFsc2UgKTtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIGtleXVwLCBmYWxzZSApO1xuXG5cdHRoaXMuaGFuZGxlUmVzaXplKCk7XG5cblx0Ly8gZm9yY2UgYW4gdXBkYXRlIGF0IHN0YXJ0XG5cdHRoaXMudXBkYXRlKCk7XG5cbn07XG5cblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFRIUkVFLkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUgKTtcblRIUkVFLlRyYWNrYmFsbENvbnRyb2xzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gVEhSRUUuVHJhY2tiYWxsQ29udHJvbHM7XG5cbiIsInZhciBzcXVhcmUsIHppZywgemFnLCBsZWZ0LCByaWdodCwgdGVlLCB0ZXRyaXMsIGFsbCwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuc3F1YXJlID0gc3F1YXJlID0gW1tbMCwgMCwgMF0sIFswLCAxLCAxXSwgWzAsIDEsIDFdXV07XG5vdXQkLnppZyA9IHppZyA9IFtbWzAsIDAsIDBdLCBbMiwgMiwgMF0sIFswLCAyLCAyXV0sIFtbMCwgMiwgMF0sIFsyLCAyLCAwXSwgWzIsIDAsIDBdXV07XG5vdXQkLnphZyA9IHphZyA9IFtbWzAsIDAsIDBdLCBbMCwgMywgM10sIFszLCAzLCAwXV0sIFtbMywgMCwgMF0sIFszLCAzLCAwXSwgWzAsIDMsIDBdXV07XG5vdXQkLmxlZnQgPSBsZWZ0ID0gW1tbMCwgMCwgMF0sIFs0LCA0LCA0XSwgWzQsIDAsIDBdXSwgW1s0LCA0LCAwXSwgWzAsIDQsIDBdLCBbMCwgNCwgMF1dLCBbWzAsIDAsIDRdLCBbNCwgNCwgNF0sIFswLCAwLCAwXV0sIFtbMCwgNCwgMF0sIFswLCA0LCAwXSwgWzAsIDQsIDRdXV07XG5vdXQkLnJpZ2h0ID0gcmlnaHQgPSBbW1swLCAwLCAwXSwgWzUsIDUsIDVdLCBbMCwgMCwgNV1dLCBbWzAsIDUsIDBdLCBbMCwgNSwgMF0sIFs1LCA1LCAwXV0sIFtbNSwgMCwgMF0sIFs1LCA1LCA1XSwgWzAsIDAsIDBdXSwgW1swLCA1LCA1XSwgWzAsIDUsIDBdLCBbMCwgNSwgMF1dXTtcbm91dCQudGVlID0gdGVlID0gW1tbMCwgMCwgMF0sIFs2LCA2LCA2XSwgWzAsIDYsIDBdXSwgW1swLCA2LCAwXSwgWzYsIDYsIDBdLCBbMCwgNiwgMF1dLCBbWzAsIDYsIDBdLCBbNiwgNiwgNl0sIFswLCAwLCAwXV0sIFtbMCwgNiwgMF0sIFswLCA2LCA2XSwgWzAsIDYsIDBdXV07XG5vdXQkLnRldHJpcyA9IHRldHJpcyA9IFtbWzAsIDAsIDAsIDBdLCBbMCwgMCwgMCwgMF0sIFs3LCA3LCA3LCA3XV0sIFtbMCwgNywgMCwgMF0sIFswLCA3LCAwLCAwXSwgWzAsIDcsIDAsIDBdLCBbMCwgNywgMCwgMF1dXTtcbm91dCQuYWxsID0gYWxsID0gW1xuICB7XG4gICAgdHlwZTogJ3NxdWFyZScsXG4gICAgc2hhcGVzOiBzcXVhcmVcbiAgfSwge1xuICAgIHR5cGU6ICd6aWcnLFxuICAgIHNoYXBlczogemlnXG4gIH0sIHtcbiAgICB0eXBlOiAnemFnJyxcbiAgICBzaGFwZXM6IHphZ1xuICB9LCB7XG4gICAgdHlwZTogJ2xlZnQnLFxuICAgIHNoYXBlczogbGVmdFxuICB9LCB7XG4gICAgdHlwZTogJ3JpZ2h0JyxcbiAgICBzaGFwZXM6IHJpZ2h0XG4gIH0sIHtcbiAgICB0eXBlOiAndGVlJyxcbiAgICBzaGFwZXM6IHRlZVxuICB9LCB7XG4gICAgdHlwZTogJ3RldHJpcycsXG4gICAgc2hhcGVzOiB0ZXRyaXNcbiAgfVxuXTsiLCJ2YXIgcmVmJCwgaWQsIGxvZywgd3JhcCwgbWVudURhdGEsIGxpbWl0ZXIsIHByaW1lR2FtZVN0YXRlLCBjaG9vc2VPcHRpb24sIHNlbGVjdFByZXZJdGVtLCBzZWxlY3ROZXh0SXRlbSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgd3JhcCA9IHJlZiQud3JhcDtcbm1lbnVEYXRhID0gW1xuICB7XG4gICAgc3RhdGU6ICdyZXN0YXJ0JyxcbiAgICB0ZXh0OiBcIlJlc3RhcnRcIlxuICB9LCB7XG4gICAgc3RhdGU6ICdnby1iYWNrJyxcbiAgICB0ZXh0OiBcIkJhY2sgdG8gTWFpblwiXG4gIH1cbl07XG5saW1pdGVyID0gd3JhcCgwLCBtZW51RGF0YS5sZW5ndGggLSAxKTtcbm91dCQucHJpbWVHYW1lU3RhdGUgPSBwcmltZUdhbWVTdGF0ZSA9IGZ1bmN0aW9uKGdhbWVzdGF0ZSl7XG4gIHJldHVybiBnYW1lc3RhdGUuZmFpbE1lbnVTdGF0ZSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGFcbiAgfTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKGZtcywgaW5kZXgpe1xuICBmbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBmbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbZm1zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oZm1zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gZm1zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihmbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKGZtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IGZtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oZm1zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIGFkZFYyLCByYW5kSW50LCB3cmFwLCByYW5kb21Gcm9tLCBCcmlja1NoYXBlcywgY2FuRHJvcCwgY2FuTW92ZSwgY2FuUm90YXRlLCBjb2xsaWRlcywgY29weUJyaWNrVG9BcmVuYSwgdG9wSXNSZWFjaGVkLCBpc0NvbXBsZXRlLCBuZXdCcmljaywgc3Bhd25OZXdCcmljaywgZHJvcEFyZW5hUm93LCByZW1vdmVSb3dzLCBjbGVhckFyZW5hLCBnZXRTaGFwZU9mUm90YXRpb24sIG5vcm1hbGlzZVJvdGF0aW9uLCByb3RhdGVCcmljaywgY29tcHV0ZVNjb3JlLCByZXNldFNjb3JlLCBhbmltYXRpb25UaW1lRm9yUm93cywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgYWRkVjIgPSByZWYkLmFkZFYyLCByYW5kSW50ID0gcmVmJC5yYW5kSW50LCB3cmFwID0gcmVmJC53cmFwLCByYW5kb21Gcm9tID0gcmVmJC5yYW5kb21Gcm9tO1xuQnJpY2tTaGFwZXMgPSByZXF1aXJlKCcuL2RhdGEvYnJpY2stc2hhcGVzJyk7XG5vdXQkLmNhbkRyb3AgPSBjYW5Ecm9wID0gZnVuY3Rpb24oYnJpY2ssIGFyZW5hKXtcbiAgcmV0dXJuIGNhbk1vdmUoYnJpY2ssIFswLCAxXSwgYXJlbmEpO1xufTtcbm91dCQuY2FuTW92ZSA9IGNhbk1vdmUgPSBmdW5jdGlvbihicmljaywgbW92ZSwgYXJlbmEpe1xuICB2YXIgbmV3UG9zO1xuICBuZXdQb3MgPSBhZGRWMihicmljay5wb3MsIG1vdmUpO1xuICByZXR1cm4gY29sbGlkZXMobmV3UG9zLCBicmljay5zaGFwZSwgYXJlbmEpO1xufTtcbm91dCQuY2FuUm90YXRlID0gY2FuUm90YXRlID0gZnVuY3Rpb24oYnJpY2ssIGRpciwgYXJlbmEpe1xuICB2YXIgbmV3U2hhcGU7XG4gIG5ld1NoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbiArIGRpcik7XG4gIHJldHVybiBjb2xsaWRlcyhicmljay5wb3MsIG5ld1NoYXBlLCBhcmVuYSk7XG59O1xub3V0JC5jb2xsaWRlcyA9IGNvbGxpZGVzID0gZnVuY3Rpb24ocG9zLCBzaGFwZSwgYXJnJCl7XG4gIHZhciBjZWxscywgd2lkdGgsIGhlaWdodCwgaSQsIHJlZiQsIGxlbiQsIHksIHYsIGokLCByZWYxJCwgbGVuMSQsIHgsIHU7XG4gIGNlbGxzID0gYXJnJC5jZWxscywgd2lkdGggPSBhcmckLndpZHRoLCBoZWlnaHQgPSBhcmckLmhlaWdodDtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSAocmVmMSQgPSAoZm4xJCgpKSkubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICB4ID0gaiQ7XG4gICAgICB1ID0gcmVmMSRbaiRdO1xuICAgICAgaWYgKHNoYXBlW3ldW3hdID4gMCkge1xuICAgICAgICBpZiAodiA+PSAwKSB7XG4gICAgICAgICAgaWYgKHYgPj0gaGVpZ2h0IHx8IHUgPj0gd2lkdGggfHwgdSA8IDAgfHwgY2VsbHNbdl1bdV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG4gIGZ1bmN0aW9uIGZuJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMV0sIHRvJCA9IHBvc1sxXSArIHNoYXBlLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbiAgZnVuY3Rpb24gZm4xJCgpe1xuICAgIHZhciBpJCwgdG8kLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSBwb3NbMF0sIHRvJCA9IHBvc1swXSArIHNoYXBlWzBdLmxlbmd0aDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgIHJlc3VsdHMkLnB1c2goaSQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH1cbn07XG5vdXQkLmNvcHlCcmlja1RvQXJlbmEgPSBjb3B5QnJpY2tUb0FyZW5hID0gZnVuY3Rpb24oYXJnJCwgYXJnMSQpe1xuICB2YXIgcG9zLCBzaGFwZSwgY2VsbHMsIGkkLCByZWYkLCBsZW4kLCB5LCB2LCBscmVzdWx0JCwgaiQsIHJlZjEkLCBsZW4xJCwgeCwgdSwgcmVzdWx0cyQgPSBbXTtcbiAgcG9zID0gYXJnJC5wb3MsIHNoYXBlID0gYXJnJC5zaGFwZTtcbiAgY2VsbHMgPSBhcmcxJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IChmbiQoKSkpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeSA9IGkkO1xuICAgIHYgPSByZWYkW2kkXTtcbiAgICBscmVzdWx0JCA9IFtdO1xuICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IChyZWYxJCA9IChmbjEkKCkpKS5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgIHggPSBqJDtcbiAgICAgIHUgPSByZWYxJFtqJF07XG4gICAgICBpZiAoc2hhcGVbeV1beF0gJiYgdiA+PSAwKSB7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY2VsbHNbdl1bdV0gPSBzaGFwZVt5XVt4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbiAgZnVuY3Rpb24gZm4kKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1sxXSwgdG8kID0gcG9zWzFdICsgc2hhcGUubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxuICBmdW5jdGlvbiBmbjEkKCl7XG4gICAgdmFyIGkkLCB0byQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IHBvc1swXSwgdG8kID0gcG9zWzBdICsgc2hhcGVbMF0ubGVuZ3RoOyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgcmVzdWx0cyQucHVzaChpJCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfVxufTtcbm91dCQudG9wSXNSZWFjaGVkID0gdG9wSXNSZWFjaGVkID0gZnVuY3Rpb24oYXJnJCl7XG4gIHZhciBjZWxscywgaSQsIHJlZiQsIGxlbiQsIGNlbGw7XG4gIGNlbGxzID0gYXJnJC5jZWxscztcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IGNlbGxzWzBdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByZWYkW2kkXTtcbiAgICBpZiAoY2VsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5vdXQkLmlzQ29tcGxldGUgPSBpc0NvbXBsZXRlID0gZnVuY3Rpb24ocm93KXtcbiAgdmFyIGkkLCBsZW4kLCBjZWxsO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvdy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGNlbGwgPSByb3dbaSRdO1xuICAgIGlmICghY2VsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5vdXQkLm5ld0JyaWNrID0gbmV3QnJpY2sgPSBmdW5jdGlvbihpeCl7XG4gIGl4ID09IG51bGwgJiYgKGl4ID0gcmFuZEludCgwLCBCcmlja1NoYXBlcy5hbGwubGVuZ3RoKSk7XG4gIHJldHVybiB7XG4gICAgcm90YXRpb246IDAsXG4gICAgc2hhcGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0uc2hhcGVzWzBdLFxuICAgIHR5cGU6IEJyaWNrU2hhcGVzLmFsbFtpeF0udHlwZSxcbiAgICBwb3M6IFswLCAwXVxuICB9O1xufTtcbm91dCQuc3Bhd25OZXdCcmljayA9IHNwYXduTmV3QnJpY2sgPSBmdW5jdGlvbihncyl7XG4gIGdzLmJyaWNrLmN1cnJlbnQgPSBncy5icmljay5uZXh0O1xuICBncy5icmljay5jdXJyZW50LnBvcyA9IFs0LCAtMV07XG4gIHJldHVybiBncy5icmljay5uZXh0ID0gbmV3QnJpY2soKTtcbn07XG5vdXQkLmRyb3BBcmVuYVJvdyA9IGRyb3BBcmVuYVJvdyA9IGZ1bmN0aW9uKGFyZyQsIHJvd0l4KXtcbiAgdmFyIGNlbGxzO1xuICBjZWxscyA9IGFyZyQuY2VsbHM7XG4gIGNlbGxzLnNwbGljZShyb3dJeCwgMSk7XG4gIHJldHVybiBjZWxscy51bnNoaWZ0KHJlcGVhdEFycmF5JChbMF0sIGNlbGxzWzBdLmxlbmd0aCkpO1xufTtcbm91dCQucmVtb3ZlUm93cyA9IHJlbW92ZVJvd3MgPSBmdW5jdGlvbihyb3dzLCBhcmVuYSl7XG4gIHZhciBpJCwgbGVuJCwgcm93SXgsIHJlc3VsdHMkID0gW107XG4gIGZvciAoaSQgPSAwLCBsZW4kID0gcm93cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgcmVzdWx0cyQucHVzaChkcm9wQXJlbmFSb3coYXJlbmEsIHJvd0l4KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufTtcbm91dCQuY2xlYXJBcmVuYSA9IGNsZWFyQXJlbmEgPSBmdW5jdGlvbihhcmVuYSl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCBpLCBjZWxsLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgcm93ID0gcmVmJFtpJF07XG4gICAgbHJlc3VsdCQgPSBbXTtcbiAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICBpID0gaiQ7XG4gICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgIGxyZXN1bHQkLnB1c2gocm93W2ldID0gMCk7XG4gICAgfVxuICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn07XG5vdXQkLmdldFNoYXBlT2ZSb3RhdGlvbiA9IGdldFNoYXBlT2ZSb3RhdGlvbiA9IGZ1bmN0aW9uKGJyaWNrLCByb3RhdGlvbil7XG4gIHJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIHJvdGF0aW9uKTtcbiAgcmV0dXJuIEJyaWNrU2hhcGVzW2JyaWNrLnR5cGVdW3JvdGF0aW9uXTtcbn07XG5vdXQkLm5vcm1hbGlzZVJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24gPSBmdW5jdGlvbihhcmckLCByb3RhdGlvbil7XG4gIHZhciB0eXBlO1xuICB0eXBlID0gYXJnJC50eXBlO1xuICByZXR1cm4gd3JhcCgwLCBCcmlja1NoYXBlc1t0eXBlXS5sZW5ndGggLSAxLCByb3RhdGlvbik7XG59O1xub3V0JC5yb3RhdGVCcmljayA9IHJvdGF0ZUJyaWNrID0gZnVuY3Rpb24oYnJpY2ssIGRpcil7XG4gIHZhciByb3RhdGlvbiwgdHlwZTtcbiAgcm90YXRpb24gPSBicmljay5yb3RhdGlvbiwgdHlwZSA9IGJyaWNrLnR5cGU7XG4gIGJyaWNrLnJvdGF0aW9uID0gbm9ybWFsaXNlUm90YXRpb24oYnJpY2ssIGJyaWNrLnJvdGF0aW9uICsgZGlyKTtcbiAgcmV0dXJuIGJyaWNrLnNoYXBlID0gZ2V0U2hhcGVPZlJvdGF0aW9uKGJyaWNrLCBicmljay5yb3RhdGlvbik7XG59O1xub3V0JC5jb21wdXRlU2NvcmUgPSBjb21wdXRlU2NvcmUgPSBmdW5jdGlvbihzY29yZSwgcm93cywgbHZsKXtcbiAgbHZsID09IG51bGwgJiYgKGx2bCA9IDApO1xuICBzd2l0Y2ggKHJvd3MubGVuZ3RoKSB7XG4gIGNhc2UgMTpcbiAgICBzY29yZS5zaW5nbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDQwICogKGx2bCArIDEpO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgc2NvcmUuZG91YmxlcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMDAgKiAobHZsICsgMSk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMzpcbiAgICBzY29yZS50cmlwbGVzICs9IDE7XG4gICAgc2NvcmUucG9pbnRzICs9IDMwMCAqIChsdmwgKyAxKTtcbiAgICBicmVhaztcbiAgY2FzZSA0OlxuICAgIHNjb3JlLnRldHJpcyArPSAxO1xuICAgIHNjb3JlLnBvaW50cyArPSAxMjAwICogKGx2bCArIDEpO1xuICB9XG4gIHJldHVybiBzY29yZS5saW5lcyArPSByb3dzLmxlbmd0aDtcbn07XG5vdXQkLnJlc2V0U2NvcmUgPSByZXNldFNjb3JlID0gZnVuY3Rpb24oc2NvcmUpe1xuICByZXR1cm4gaW1wb3J0JChzY29yZSwge1xuICAgIHBvaW50czogMCxcbiAgICBsaW5lczogMCxcbiAgICBzaW5nbGVzOiAwLFxuICAgIGRvdWJsZXM6IDAsXG4gICAgdHJpcGxlczogMCxcbiAgICB0ZXRyaXM6IDBcbiAgfSk7XG59O1xub3V0JC5hbmltYXRpb25UaW1lRm9yUm93cyA9IGFuaW1hdGlvblRpbWVGb3JSb3dzID0gZnVuY3Rpb24ocm93cyl7XG4gIHJldHVybiAxMCArIE1hdGgucG93KDMsIHJvd3MubGVuZ3RoKTtcbn07XG5mdW5jdGlvbiByZXBlYXRBcnJheSQoYXJyLCBuKXtcbiAgZm9yICh2YXIgciA9IFtdOyBuID4gMDsgKG4gPj49IDEpICYmIChhcnIgPSBhcnIuY29uY2F0KGFycikpKVxuICAgIGlmIChuICYgMSkgci5wdXNoLmFwcGx5KHIsIGFycik7XG4gIHJldHVybiByO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcmFuZCwgcmFuZG9tRnJvbSwgQ29yZSwgU3RhcnRNZW51LCBGYWlsTWVudSwgVGV0cmlzR2FtZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcmFuZCA9IHJlZiQucmFuZDtcbnJhbmRvbUZyb20gPSByZXF1aXJlKCdzdGQnKS5yYW5kb21Gcm9tO1xuQ29yZSA9IHJlcXVpcmUoJy4vZ2FtZS1jb3JlJyk7XG5TdGFydE1lbnUgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKTtcbkZhaWxNZW51ID0gcmVxdWlyZSgnLi9mYWlsLW1lbnUnKTtcbm91dCQuVGV0cmlzR2FtZSA9IFRldHJpc0dhbWUgPSAoZnVuY3Rpb24oKXtcbiAgVGV0cmlzR2FtZS5kaXNwbGF5TmFtZSA9ICdUZXRyaXNHYW1lJztcbiAgdmFyIHByb3RvdHlwZSA9IFRldHJpc0dhbWUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRldHJpc0dhbWU7XG4gIGZ1bmN0aW9uIFRldHJpc0dhbWUoZ2FtZVN0YXRlKXtcbiAgICBsb2coXCJUZXRyaXNHYW1lOjpuZXdcIik7XG4gICAgU3RhcnRNZW51LnByaW1lR2FtZVN0YXRlKGdhbWVTdGF0ZSk7XG4gICAgRmFpbE1lbnUucHJpbWVHYW1lU3RhdGUoZ2FtZVN0YXRlKTtcbiAgfVxuICBwcm90b3R5cGUuYmVnaW5OZXdHYW1lID0gZnVuY3Rpb24oZ2FtZVN0YXRlKXtcbiAgICAoZnVuY3Rpb24oKXtcbiAgICAgIENvcmUuY2xlYXJBcmVuYSh0aGlzLmFyZW5hKTtcbiAgICAgIHRoaXMuYnJpY2submV4dCA9IENvcmUubmV3QnJpY2soKTtcbiAgICAgIHRoaXMuYnJpY2submV4dC5wb3MgPSBbMywgLTFdO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50ID0gQ29yZS5uZXdCcmljaygpO1xuICAgICAgdGhpcy5icmljay5jdXJyZW50LnBvcyA9IFszLCAtMV07XG4gICAgICBDb3JlLnJlc2V0U2NvcmUodGhpcy5zY29yZSk7XG4gICAgICB0aGlzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIucmVzZXQoKTtcbiAgICAgIHRoaXMudGltZXJzLmtleVJlcGVhdFRpbWVyLnJlc2V0KCk7XG4gICAgfS5jYWxsKGdhbWVTdGF0ZSkpO1xuICAgIHJldHVybiBnYW1lU3RhdGU7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlUmVtb3ZhbEFuaW1hdGlvbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgdGltZXJzLCBhbmltYXRpb25TdGF0ZTtcbiAgICB0aW1lcnMgPSBncy50aW1lcnMsIGFuaW1hdGlvblN0YXRlID0gZ3MuYW5pbWF0aW9uU3RhdGU7XG4gICAgaWYgKHRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLmV4cGlyZWQpIHtcbiAgICAgIENvcmUucmVtb3ZlUm93cyhncy5yb3dzVG9SZW1vdmUsIGdzLmFyZW5hKTtcbiAgICAgIGdzLnJvd3NUb1JlbW92ZSA9IFtdO1xuICAgICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnZ2FtZSc7XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUuaGFuZGxlS2V5SW5wdXQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIGJyaWNrLCBhcmVuYSwgaW5wdXRTdGF0ZSwgbHJlc3VsdCQsIHJlZiQsIGtleSwgYWN0aW9uLCBhbXQsIHJlcyQsIGkkLCB0byQsIGksIHBvcywgeSwgbHJlc3VsdDEkLCBqJCwgdG8xJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBicmljayA9IGdzLmJyaWNrLCBhcmVuYSA9IGdzLmFyZW5hLCBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZTtcbiAgICB3aGlsZSAoaW5wdXRTdGF0ZS5sZW5ndGgpIHtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbLTEsIDBdLCBhcmVuYSkpIHtcbiAgICAgICAgICAgIGxyZXN1bHQkLnB1c2goYnJpY2suY3VycmVudC5wb3NbMF0gLT0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyaWdodCc6XG4gICAgICAgICAgaWYgKENvcmUuY2FuTW92ZShicmljay5jdXJyZW50LCBbMSwgMF0sIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChicmljay5jdXJyZW50LnBvc1swXSArPSAxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MuZm9yY2VEb3duTW9kZSA9IHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgIGNhc2UgJ2N3JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgMSwgYXJlbmEpKSB7XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKENvcmUucm90YXRlQnJpY2soYnJpY2suY3VycmVudCwgMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2N3JzpcbiAgICAgICAgICBpZiAoQ29yZS5jYW5Sb3RhdGUoYnJpY2suY3VycmVudCwgLTEsIGFyZW5hKSkge1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaChDb3JlLnJvdGF0ZUJyaWNrKGJyaWNrLmN1cnJlbnQsIC0xKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdoYXJkLWRyb3AnOlxuICAgICAgICAgIGdzLmhhcmREcm9wRGlzdGFuY2UgPSAwO1xuICAgICAgICAgIHdoaWxlIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgICAgICBncy5oYXJkRHJvcERpc3RhbmNlICs9IDE7XG4gICAgICAgICAgICBicmljay5jdXJyZW50LnBvc1sxXSArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBncy5pbnB1dFN0YXRlID0gW107XG4gICAgICAgICAgZ3MudGltZXJzLmhhcmREcm9wRWZmZWN0LnJlc2V0KDEgKyBncy5oYXJkRHJvcERpc3RhbmNlICogMTApO1xuICAgICAgICAgIGxyZXN1bHQkLnB1c2goZ3MudGltZXJzLmRyb3BUaW1lci50aW1lVG9FeHBpcnkgPSAtMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTEnOlxuICAgICAgICBjYXNlICdkZWJ1Zy0yJzpcbiAgICAgICAgY2FzZSAnZGVidWctMyc6XG4gICAgICAgIGNhc2UgJ2RlYnVnLTQnOlxuICAgICAgICAgIGFtdCA9IHBhcnNlSW50KGtleS5yZXBsYWNlKC9cXEQvZywgJycpKTtcbiAgICAgICAgICBsb2coXCJERUJVRzogRGVzdHJveWluZyByb3dzOlwiLCBhbXQpO1xuICAgICAgICAgIHJlcyQgPSBbXTtcbiAgICAgICAgICBmb3IgKGkkID0gZ3MuYXJlbmEuaGVpZ2h0IC0gYW10LCB0byQgPSBncy5hcmVuYS5oZWlnaHQgLSAxOyBpJCA8PSB0byQ7ICsraSQpIHtcbiAgICAgICAgICAgIGkgPSBpJDtcbiAgICAgICAgICAgIHJlcyQucHVzaChpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gcmVzJDtcbiAgICAgICAgICBncy5tZXRhZ2FtZVN0YXRlID0gJ3JlbW92ZS1saW5lcyc7XG4gICAgICAgICAgZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUgPSB0cnVlO1xuICAgICAgICAgIGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3Mucm93c1RvUmVtb3ZlKSk7XG4gICAgICAgICAgbHJlc3VsdCQucHVzaChDb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3Mucm93c1RvUmVtb3ZlKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlYnVnLTUnOlxuICAgICAgICAgIHBvcyA9IGdzLmJyaWNrLmN1cnJlbnQucG9zO1xuICAgICAgICAgIGdzLmJyaWNrLmN1cnJlbnQgPSBDb3JlLm5ld0JyaWNrKDYpO1xuICAgICAgICAgIGltcG9ydCQoZ3MuYnJpY2suY3VycmVudC5wb3MsIHBvcyk7XG4gICAgICAgICAgZm9yIChpJCA9IGFyZW5hLmhlaWdodCAtIDEsIHRvJCA9IGFyZW5hLmhlaWdodCAtIDQ7IGkkID49IHRvJDsgLS1pJCkge1xuICAgICAgICAgICAgeSA9IGkkO1xuICAgICAgICAgICAgbHJlc3VsdDEkID0gW107XG4gICAgICAgICAgICBmb3IgKGokID0gMCwgdG8xJCA9IGFyZW5hLndpZHRoIC0gMjsgaiQgPD0gdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgICB4ID0gaiQ7XG4gICAgICAgICAgICAgIGxyZXN1bHQxJC5wdXNoKGFyZW5hLmNlbGxzW3ldW3hdID0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBscmVzdWx0JC5wdXNoKGxyZXN1bHQxJCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZWJ1Zy02JzpcbiAgICAgICAgICBncy5yb3dzVG9SZW1vdmUgPSBbMTAsIDEyLCAxNF07XG4gICAgICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgICAgIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnJlc2V0KENvcmUuYW5pbWF0aW9uVGltZUZvclJvd3MoZ3Mucm93c1RvUmVtb3ZlKSkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKGdzLmZvcmNlRG93bk1vZGUgPSBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdHMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS5jbGVhck9uZUZyYW1lRmxhZ3MgPSBmdW5jdGlvbihncyl7XG4gICAgcmV0dXJuIGdzLmZsYWdzLnJvd3NSZW1vdmVkVGhpc0ZyYW1lID0gZmFsc2U7XG4gIH07XG4gIHByb3RvdHlwZS5hZHZhbmNlR2FtZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYnJpY2ssIGFyZW5hLCBpbnB1dFN0YXRlLCBjb21wbGV0ZVJvd3MsIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgcm93O1xuICAgIGJyaWNrID0gZ3MuYnJpY2ssIGFyZW5hID0gZ3MuYXJlbmEsIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgcm93ID0gcmVmJFtpJF07XG4gICAgICBpZiAoQ29yZS5pc0NvbXBsZXRlKHJvdykpIHtcbiAgICAgICAgcmVzJC5wdXNoKGl4KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29tcGxldGVSb3dzID0gcmVzJDtcbiAgICBpZiAoY29tcGxldGVSb3dzLmxlbmd0aCkge1xuICAgICAgZ3MubWV0YWdhbWVTdGF0ZSA9ICdyZW1vdmUtbGluZXMnO1xuICAgICAgZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUgPSB0cnVlO1xuICAgICAgZ3Mucm93c1RvUmVtb3ZlID0gY29tcGxldGVSb3dzO1xuICAgICAgZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucmVzZXQoMTAgKyBNYXRoLnBvdygzLCBncy5yb3dzVG9SZW1vdmUubGVuZ3RoKSk7XG4gICAgICBDb3JlLmNvbXB1dGVTY29yZShncy5zY29yZSwgZ3Mucm93c1RvUmVtb3ZlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKENvcmUudG9wSXNSZWFjaGVkKGFyZW5hKSkge1xuICAgICAgdGhpcy5yZXZlYWxGYWlsU2NyZWVuKGdzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGdzLmZvcmNlRG93bk1vZGUpIHtcbiAgICAgIGdzLnRpbWVycy5kcm9wVGltZXIudGltZVRvRXhwaXJ5ID0gMDtcbiAgICB9XG4gICAgaWYgKGdzLnRpbWVycy5kcm9wVGltZXIuZXhwaXJlZCkge1xuICAgICAgZ3MudGltZXJzLmRyb3BUaW1lci5yZXNldFdpdGhSZW1haW5kZXIoKTtcbiAgICAgIGlmIChDb3JlLmNhbkRyb3AoYnJpY2suY3VycmVudCwgYXJlbmEpKSB7XG4gICAgICAgIGJyaWNrLmN1cnJlbnQucG9zWzFdICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb3JlLmNvcHlCcmlja1RvQXJlbmEoYnJpY2suY3VycmVudCwgYXJlbmEpO1xuICAgICAgICBDb3JlLnNwYXduTmV3QnJpY2soZ3MpO1xuICAgICAgICBncy5mb3JjZURvd25Nb2RlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhhbmRsZUtleUlucHV0KGdzKTtcbiAgfTtcbiAgcHJvdG90eXBlLnNob3dTdGFydFNjcmVlbiA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgaW5wdXRTdGF0ZSwgc3RhcnRNZW51U3RhdGUsIHJlZiQsIGtleSwgYWN0aW9uLCByZXN1bHRzJCA9IFtdO1xuICAgIGlucHV0U3RhdGUgPSBncy5pbnB1dFN0YXRlLCBzdGFydE1lbnVTdGF0ZSA9IGdzLnN0YXJ0TWVudVN0YXRlO1xuICAgIHdoaWxlIChpbnB1dFN0YXRlLmxlbmd0aCkge1xuICAgICAgcmVmJCA9IGlucHV0U3RhdGUuc2hpZnQoKSwga2V5ID0gcmVmJC5rZXksIGFjdGlvbiA9IHJlZiQuYWN0aW9uO1xuICAgICAgaWYgKGFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3RQcmV2SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKFN0YXJ0TWVudS5zZWxlY3ROZXh0SXRlbShzdGFydE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhY3Rpb24tYSc6XG4gICAgICAgIGNhc2UgJ2NvbmZpcm0nOlxuICAgICAgICAgIGlmIChzdGFydE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUgPT09ICdzdGFydC1nYW1lJykge1xuICAgICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICd1cCcpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChncy5mb3JjZURvd25Nb2RlID0gZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJldmVhbFN0YXJ0U2NyZWVuID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnM7XG4gICAgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHRpbWVycy50aXRsZVJldmVhbFRpbWVyLnJlc2V0KCk7XG4gICAgcmV0dXJuIGdzLm1ldGFnYW1lU3RhdGUgPSAnc3RhcnQtbWVudSc7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93RmFpbFNjcmVlbiA9IGZ1bmN0aW9uKGdzLCDOlHQpe1xuICAgIHZhciBpbnB1dFN0YXRlLCBmYWlsTWVudVN0YXRlLCByZWYkLCBrZXksIGFjdGlvbiwgcmVzdWx0cyQgPSBbXTtcbiAgICBpbnB1dFN0YXRlID0gZ3MuaW5wdXRTdGF0ZSwgZmFpbE1lbnVTdGF0ZSA9IGdzLmZhaWxNZW51U3RhdGU7XG4gICAgd2hpbGUgKGlucHV0U3RhdGUubGVuZ3RoKSB7XG4gICAgICByZWYkID0gaW5wdXRTdGF0ZS5zaGlmdCgpLCBrZXkgPSByZWYkLmtleSwgYWN0aW9uID0gcmVmJC5hY3Rpb247XG4gICAgICBpZiAoYWN0aW9uID09PSAnZG93bicpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgIHJlc3VsdHMkLnB1c2goRmFpbE1lbnUuc2VsZWN0UHJldkl0ZW0oZmFpbE1lbnVTdGF0ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkb3duJzpcbiAgICAgICAgICByZXN1bHRzJC5wdXNoKEZhaWxNZW51LnNlbGVjdE5leHRJdGVtKGZhaWxNZW51U3RhdGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWN0aW9uLWEnOlxuICAgICAgICBjYXNlICdjb25maXJtJzpcbiAgICAgICAgICBsb2coZmFpbE1lbnVTdGF0ZS5jdXJyZW50U3RhdGUuc3RhdGUpO1xuICAgICAgICAgIGlmIChmYWlsTWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ3Jlc3RhcnQnKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMuYmVnaW5OZXdHYW1lKGdzKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmYWlsTWVudVN0YXRlLmN1cnJlbnRTdGF0ZS5zdGF0ZSA9PT0gJ2dvLWJhY2snKSB7XG4gICAgICAgICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmV2ZWFsU3RhcnRTY3JlZW4oZ3MpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FjdGlvbi1hJzpcbiAgICAgICAgY2FzZSAnY29uZmlybSc6XG4gICAgICAgICAgcmVzdWx0cyQucHVzaCh0aGlzLmJlZ2luTmV3R2FtZShncykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLnJldmVhbEZhaWxTY3JlZW4gPSBmdW5jdGlvbihncyl7XG4gICAgZ3MudGltZXJzLmZhaWx1cmVSZXZlYWxUaW1lci5yZXNldCgpO1xuICAgIHJldHVybiBncy5tZXRhZ2FtZVN0YXRlID0gJ2ZhaWx1cmUnO1xuICB9O1xuICBwcm90b3R5cGUucnVuRnJhbWUgPSBmdW5jdGlvbihnYW1lU3RhdGUsIM6UdCl7XG4gICAgdmFyIG1ldGFnYW1lU3RhdGU7XG4gICAgbWV0YWdhbWVTdGF0ZSA9IGdhbWVTdGF0ZS5tZXRhZ2FtZVN0YXRlO1xuICAgIHRoaXMuY2xlYXJPbmVGcmFtZUZsYWdzKGdhbWVTdGF0ZSk7XG4gICAgc3dpdGNoIChtZXRhZ2FtZVN0YXRlKSB7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICB0aGlzLnNob3dGYWlsU2NyZWVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdnYW1lJzpcbiAgICAgIHRoaXMuYWR2YW5jZUdhbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgdGhpcy5yZXZlYWxTdGFydFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICB0aGlzLnNob3dTdGFydFNjcmVlbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgIHRoaXMuYWR2YW5jZVJlbW92YWxBbmltYXRpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBjb25zb2xlLmRlYnVnKCdVbmtub3duIG1ldGFnYW1lLXN0YXRlOicsIG1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gZ2FtZVN0YXRlO1xuICB9O1xuICByZXR1cm4gVGV0cmlzR2FtZTtcbn0oKSk7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGV0cmlzR2FtZTogVGV0cmlzR2FtZVxufTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHdyYXAsIG1lbnVEYXRhLCBsaW1pdGVyLCBwcmltZUdhbWVTdGF0ZSwgY2hvb3NlT3B0aW9uLCBzZWxlY3RQcmV2SXRlbSwgc2VsZWN0TmV4dEl0ZW0sIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHdyYXAgPSByZWYkLndyYXA7XG5tZW51RGF0YSA9IFtcbiAge1xuICAgIHN0YXRlOiAnc3RhcnQtZ2FtZScsXG4gICAgdGV4dDogXCJTdGFydCBHYW1lXCJcbiAgfSwge1xuICAgIHN0YXRlOiAnbm90aGluZycsXG4gICAgdGV4dDogXCJEb24ndCBTdGFydCBHYW1lXCJcbiAgfVxuXTtcbmxpbWl0ZXIgPSB3cmFwKDAsIG1lbnVEYXRhLmxlbmd0aCAtIDEpO1xub3V0JC5wcmltZUdhbWVTdGF0ZSA9IHByaW1lR2FtZVN0YXRlID0gZnVuY3Rpb24oZ2FtZXN0YXRlKXtcbiAgcmV0dXJuIGdhbWVzdGF0ZS5zdGFydE1lbnVTdGF0ZSA9IHtcbiAgICBjdXJyZW50SW5kZXg6IDAsXG4gICAgY3VycmVudFN0YXRlOiBtZW51RGF0YVswXSxcbiAgICBtZW51RGF0YTogbWVudURhdGFcbiAgfTtcbn07XG5vdXQkLmNob29zZU9wdGlvbiA9IGNob29zZU9wdGlvbiA9IGZ1bmN0aW9uKHNtcywgaW5kZXgpe1xuICBzbXMuY3VycmVudEluZGV4ID0gbGltaXRlcihpbmRleCk7XG4gIHJldHVybiBzbXMuY3VycmVudFN0YXRlID0gbWVudURhdGFbc21zLmN1cnJlbnRJbmRleF07XG59O1xub3V0JC5zZWxlY3RQcmV2SXRlbSA9IHNlbGVjdFByZXZJdGVtID0gZnVuY3Rpb24oc21zKXtcbiAgdmFyIGN1cnJlbnRJbmRleDtcbiAgY3VycmVudEluZGV4ID0gc21zLmN1cnJlbnRJbmRleDtcbiAgcmV0dXJuIGNob29zZU9wdGlvbihzbXMsIGN1cnJlbnRJbmRleCAtIDEpO1xufTtcbm91dCQuc2VsZWN0TmV4dEl0ZW0gPSBzZWxlY3ROZXh0SXRlbSA9IGZ1bmN0aW9uKHNtcyl7XG4gIHZhciBjdXJyZW50SW5kZXg7XG4gIGN1cnJlbnRJbmRleCA9IHNtcy5jdXJyZW50SW5kZXg7XG4gIHJldHVybiBjaG9vc2VPcHRpb24oc21zLCBjdXJyZW50SW5kZXggKyAxKTtcbn07IiwidmFyIHJlZiQsIGlkLCBsb2csIHBpLCByYW5kLCBmbG9vciwgQmFzZSwgTWF0ZXJpYWxzLCBBcmVuYUNlbGxzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vcjtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5BcmVuYUNlbGxzID0gQXJlbmFDZWxscyA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQXJlbmFDZWxscywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmFDZWxscycsIEFyZW5hQ2VsbHMpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQXJlbmFDZWxscztcbiAgZnVuY3Rpb24gQXJlbmFDZWxscyhvcHRzLCBncyl7XG4gICAgdmFyIGJsb2NrU2l6ZSwgZ3JpZFNpemUsIHdpZHRoLCBoZWlnaHQsIG1hcmdpbiwgYm94R2VvLCByZWYkLCByZXMkLCBpJCwgbGVuJCwgeSwgcm93LCBscmVzdWx0JCwgaiQsIGxlbjEkLCB4LCBjZWxsLCBjdWJlO1xuICAgIGJsb2NrU2l6ZSA9IG9wdHMuYmxvY2tTaXplLCBncmlkU2l6ZSA9IG9wdHMuZ3JpZFNpemU7XG4gICAgQXJlbmFDZWxscy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgd2lkdGggPSBncmlkU2l6ZSAqIGdzLmFyZW5hLndpZHRoO1xuICAgIGhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIG1hcmdpbiA9IChncmlkU2l6ZSAtIGJsb2NrU2l6ZSkgLyAyO1xuICAgIGJveEdlbyA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShibG9ja1NpemUsIGJsb2NrU2l6ZSwgYmxvY2tTaXplKTtcbiAgICB0aGlzLm9mZnNldCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5vZmZzZXQpO1xuICAgIHJlZiQgPSB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbjtcbiAgICByZWYkLnggPSB3aWR0aCAvIC0yICsgMC41ICogZ3JpZFNpemU7XG4gICAgcmVmJC55ID0gaGVpZ2h0IC0gMC41ICogZ3JpZFNpemU7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IHBpO1xuICAgIHJlcyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZ3MuYXJlbmEuY2VsbHMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSByZWYkW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGN1YmUgPSBuZXcgVEhSRUUuTWVzaChib3hHZW8sIE1hdGVyaWFscy5ub3JtYWwpO1xuICAgICAgICBjdWJlLnBvc2l0aW9uLnNldCh4ICogZ3JpZFNpemUsIHkgKiBncmlkU2l6ZSwgMCk7XG4gICAgICAgIGN1YmUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9mZnNldC5hZGQoY3ViZSk7XG4gICAgICAgIGxyZXN1bHQkLnB1c2goY3ViZSk7XG4gICAgICB9XG4gICAgICByZXMkLnB1c2gobHJlc3VsdCQpO1xuICAgIH1cbiAgICB0aGlzLmNlbGxzID0gcmVzJDtcbiAgfVxuICBwcm90b3R5cGUudG9nZ2xlUm93T2ZDZWxscyA9IGZ1bmN0aW9uKHJvd0l4LCBzdGF0ZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBib3gsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMuY2VsbHNbcm93SXhdKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgYm94ID0gcmVmJFtpJF07XG4gICAgICBib3gubWF0ZXJpYWwgPSBNYXRlcmlhbHMuemFwO1xuICAgICAgcmVzdWx0cyQucHVzaChib3gudmlzaWJsZSA9IHN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd1phcEVmZmVjdCA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgYXJlbmEsIHJvd3NUb1JlbW92ZSwgdGltZXJzLCBvbk9mZiwgaSQsIGxlbiQsIHJvd0l4LCByZXN1bHRzJCA9IFtdO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHJvd3NUb1JlbW92ZSA9IGdzLnJvd3NUb1JlbW92ZSwgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIG9uT2ZmID0gdGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3MgPCAwLjQgJiYgISEoZmxvb3IodGltZXJzLnJlbW92YWxBbmltYXRpb24uY3VycmVudFRpbWUgKiAxMCkgJSAyKTtcbiAgICBvbk9mZiA9ICEoZmxvb3IodGltZXJzLnJlbW92YWxBbmltYXRpb24uY3VycmVudFRpbWUpICUgMik7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSByb3dzVG9SZW1vdmUubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvd0l4ID0gcm93c1RvUmVtb3ZlW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy50b2dnbGVSb3dPZkNlbGxzKHJvd0l4LCBvbk9mZikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVDZWxscyA9IGZ1bmN0aW9uKGNlbGxzKXtcbiAgICB2YXIgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGNlbGxzLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSBjZWxsc1tpJF07XG4gICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgZm9yIChqJCA9IDAsIGxlbjEkID0gcm93Lmxlbmd0aDsgaiQgPCBsZW4xJDsgKytqJCkge1xuICAgICAgICB4ID0gaiQ7XG4gICAgICAgIGNlbGwgPSByb3dbaiRdO1xuICAgICAgICB0aGlzLmNlbGxzW3ldW3hdLnZpc2libGUgPSAhIWNlbGw7XG4gICAgICAgIGxyZXN1bHQkLnB1c2godGhpcy5jZWxsc1t5XVt4XS5tYXRlcmlhbCA9IE1hdGVyaWFscy5ibG9ja3NbY2VsbF0pO1xuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hQ2VsbHM7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBtYXgsIHJhbmQsIEJhc2UsIEZyYW1lLCBGYWxsaW5nQnJpY2ssIEd1aWRlTGluZXMsIEFyZW5hQ2VsbHMsIFBhcnRpY2xlRWZmZWN0LCBBcmVuYSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgbWF4ID0gcmVmJC5tYXgsIHJhbmQgPSByZWYkLnJhbmQ7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkZyYW1lID0gcmVxdWlyZSgnLi9mcmFtZScpLkZyYW1lO1xuRmFsbGluZ0JyaWNrID0gcmVxdWlyZSgnLi9mYWxsaW5nLWJyaWNrJykuRmFsbGluZ0JyaWNrO1xuR3VpZGVMaW5lcyA9IHJlcXVpcmUoJy4vZ3VpZGUtbGluZXMnKS5HdWlkZUxpbmVzO1xuQXJlbmFDZWxscyA9IHJlcXVpcmUoJy4vYXJlbmEtY2VsbHMnKS5BcmVuYUNlbGxzO1xuUGFydGljbGVFZmZlY3QgPSByZXF1aXJlKCcuL3BhcnRpY2xlLWVmZmVjdCcpLlBhcnRpY2xlRWZmZWN0O1xub3V0JC5BcmVuYSA9IEFyZW5hID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChBcmVuYSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnQXJlbmEnLCBBcmVuYSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBBcmVuYTtcbiAgZnVuY3Rpb24gQXJlbmEob3B0cywgZ3Mpe1xuICAgIHZhciBuYW1lLCByZWYkLCBwYXJ0O1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQXJlbmEuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGxvZygnUmVuZGVyZXI6OkFyZW5hOjpuZXcnKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZnJhbWVzU2luY2VSb3dzUmVtb3ZlZDogMFxuICAgIH07XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIGZyYW1lOiBuZXcgRnJhbWUodGhpcy5vcHRzLCBncyksXG4gICAgICBndWlkZUxpbmVzOiBuZXcgR3VpZGVMaW5lcyh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGFyZW5hQ2VsbHM6IG5ldyBBcmVuYUNlbGxzKHRoaXMub3B0cywgZ3MpLFxuICAgICAgdGhpc0JyaWNrOiBuZXcgRmFsbGluZ0JyaWNrKHRoaXMub3B0cywgZ3MpLFxuICAgICAgcGFydGljbGVzOiBuZXcgUGFydGljbGVFZmZlY3QodGhpcy5vcHRzLCBncylcbiAgICB9O1xuICAgIGZvciAobmFtZSBpbiByZWYkID0gdGhpcy5wYXJ0cykge1xuICAgICAgcGFydCA9IHJlZiRbbmFtZV07XG4gICAgICBwYXJ0LmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueCA9IHRoaXMub3B0cy5hcmVuYU9mZnNldEZyb21DZW50cmU7XG4gIH1cbiAgcHJvdG90eXBlLmpvbHQgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHJvd3NUb1JlbW92ZSwgdGltZXJzLCBwLCB6eiwgam9sdDtcbiAgICByb3dzVG9SZW1vdmUgPSBncy5yb3dzVG9SZW1vdmUsIHRpbWVycyA9IGdzLnRpbWVycztcbiAgICBwID0gbWF4KDAsIDEgLSB0aW1lcnMuaGFyZERyb3BFZmZlY3QucHJvZ3Jlc3MpO1xuICAgIHp6ID0gcm93c1RvUmVtb3ZlLmxlbmd0aDtcbiAgICByZXR1cm4gam9sdCA9IC0xICogcCAqICgxICsgenopICogdGhpcy5vcHRzLmhhcmREcm9wSm9sdEFtb3VudDtcbiAgfTtcbiAgcHJvdG90eXBlLmppdHRlciA9IGZ1bmN0aW9uKGdzKXtcbiAgICB2YXIgcm93c1RvUmVtb3ZlLCBwLCB6eiwgaml0dGVyO1xuICAgIHJvd3NUb1JlbW92ZSA9IGdzLnJvd3NUb1JlbW92ZTtcbiAgICBwID0gMSAtIGdzLnRpbWVycy5yZW1vdmFsQW5pbWF0aW9uLnByb2dyZXNzO1xuICAgIHp6ID0gcm93c1RvUmVtb3ZlLmxlbmd0aCAqIHRoaXMub3B0cy5ncmlkU2l6ZSAvIDQwO1xuICAgIHJldHVybiBqaXR0ZXIgPSBbcCAqIHJhbmQoLXp6LCB6eiksIHAgKiByYW5kKC16eiwgenopXTtcbiAgfTtcbiAgcHJvdG90eXBlLnphcExpbmVzID0gZnVuY3Rpb24oZ3MsIHBvc2l0aW9uUmVjZWl2aW5nSm9sdCl7XG4gICAgdmFyIGFyZW5hLCByb3dzVG9SZW1vdmUsIHRpbWVycywgam9sdCwgaml0dGVyO1xuICAgIGFyZW5hID0gZ3MuYXJlbmEsIHJvd3NUb1JlbW92ZSA9IGdzLnJvd3NUb1JlbW92ZSwgdGltZXJzID0gZ3MudGltZXJzO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy5zaG93WmFwRWZmZWN0KGdzKTtcbiAgICBpZiAoZ3MuZmxhZ3Mucm93c1JlbW92ZWRUaGlzRnJhbWUpIHtcbiAgICAgIHRoaXMucGFydHMucGFydGljbGVzLnJlc2V0KCk7XG4gICAgICB0aGlzLnBhcnRzLnBhcnRpY2xlcy5wcmVwYXJlKHJvd3NUb1JlbW92ZSk7XG4gICAgICB0aGlzLnN0YXRlLmZyYW1lc1NpbmNlUm93c1JlbW92ZWQgPSAwO1xuICAgIH1cbiAgICBqb2x0ID0gdGhpcy5qb2x0KGdzKTtcbiAgICBqaXR0ZXIgPSB0aGlzLmppdHRlcihncyk7XG4gICAgcG9zaXRpb25SZWNlaXZpbmdKb2x0LnggPSBqaXR0ZXJbMF07XG4gICAgcG9zaXRpb25SZWNlaXZpbmdKb2x0LnkgPSBqaXR0ZXJbMV0gKyBqb2x0IC8gMTA7XG4gICAgcmV0dXJuIHRoaXMucGFydHMuZ3VpZGVMaW5lcy5kYW5jZShncy5lbGFwc2VkVGltZSk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVQYXJ0aWNsZXMgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHRpbWVycztcbiAgICB0aW1lcnMgPSBncy50aW1lcnM7XG4gICAgcmV0dXJuIHRoaXMucGFydHMucGFydGljbGVzLnVwZGF0ZSh0aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcywgdGhpcy5zdGF0ZS5mcmFtZXNTaW5jZVJvd3NSZW1vdmVkLCBncy7OlHQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3MsIHBvc2l0aW9uUmVjZWl2aW5nSm9sdCl7XG4gICAgdmFyIGFyZW5hLCBicmljaztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCBicmljayA9IGdzLmJyaWNrO1xuICAgIHRoaXMucGFydHMuYXJlbmFDZWxscy51cGRhdGVDZWxscyhhcmVuYS5jZWxscyk7XG4gICAgdGhpcy5wYXJ0cy50aGlzQnJpY2suZGlzcGxheVNoYXBlKGJyaWNrLmN1cnJlbnQpO1xuICAgIHRoaXMucGFydHMudGhpc0JyaWNrLnVwZGF0ZVBvc2l0aW9uKGJyaWNrLmN1cnJlbnQucG9zKTtcbiAgICB0aGlzLnBhcnRzLmd1aWRlTGluZXMuc2hvd0JlYW0oYnJpY2suY3VycmVudCk7XG4gICAgcG9zaXRpb25SZWNlaXZpbmdKb2x0LnkgPSB0aGlzLmpvbHQoZ3MpO1xuICAgIHJldHVybiB0aGlzLnN0YXRlLmZyYW1lc1NpbmNlUm93c1JlbW92ZWQgKz0gMTtcbiAgfTtcbiAgcmV0dXJuIEFyZW5hO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgTWF0ZXJpYWxzLCBCYXNlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nO1xuTWF0ZXJpYWxzID0gcmVxdWlyZSgnLi4vbWF0cycpO1xub3V0JC5CYXNlID0gQmFzZSA9IChmdW5jdGlvbigpe1xuICBCYXNlLmRpc3BsYXlOYW1lID0gJ0Jhc2UnO1xuICB2YXIgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBCYXNlLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBCYXNlO1xuICBoZWxwZXJNYXJrZXJHZW8gPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KDAuMDIsIDAuMDIsIDAuMDIpO1xuICBmdW5jdGlvbiBCYXNlKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIHRoaXMucm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJvb3QuYWRkKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc3RhcnQsIGVuZCwgZGlzdGFuY2UsIGRpciwgYXJyb3c7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJBKSk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKG5ldyBUSFJFRS5NZXNoKGhlbHBlck1hcmtlckdlbywgTWF0ZXJpYWxzLmhlbHBlckIpKTtcbiAgICBzdGFydCA9IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApO1xuICAgIGVuZCA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uO1xuICAgIGRpc3RhbmNlID0gc3RhcnQuZGlzdGFuY2VUbyhlbmQpO1xuICAgIGlmIChkaXN0YW5jZSA+IDApIHtcbiAgICAgIGRpciA9IG5ldyBUSFJFRS5WZWN0b3IzKCkuc3ViVmVjdG9ycyhlbmQsIHN0YXJ0KS5ub3JtYWxpemUoKTtcbiAgICAgIGFycm93ID0gbmV3IFRIUkVFLkFycm93SGVscGVyKGRpciwgc3RhcnQsIGRpc3RhbmNlLCAweDAwMDBmZik7XG4gICAgICB0aGlzLnJvb3QuYWRkKGFycm93KTtcbiAgICB9XG4gICAgcmV0dXJuIGxvZygnUmVnaXN0cmF0aW9uIGhlbHBlciBhdCcsIHRoaXMpO1xuICB9O1xuICBwcm90b3R5cGUuYWRkQm94SGVscGVyID0gZnVuY3Rpb24odGhpbmcpe1xuICAgIHZhciBiYm94O1xuICAgIGJib3ggPSBuZXcgVEhSRUUuQm91bmRpbmdCb3hIZWxwZXIodGhpbmcsIDB4NTU1NWZmKTtcbiAgICBiYm94LnVwZGF0ZSgpO1xuICAgIHJldHVybiB0aGlzLnJvb3QuYWRkKGJib3gpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlUmVnaXN0cmF0aW9uSGVscGVyID0gZnVuY3Rpb24oKXt9O1xuICBwcm90b3R5cGUuc2hvd0JvdW5kcyA9IGZ1bmN0aW9uKHNjZW5lKXtcbiAgICB0aGlzLmJvdW5kcyA9IG5ldyBUSFJFRS5Cb3VuZGluZ0JveEhlbHBlcih0aGlzLnJvb3QsIDB4NTU1NTU1KTtcbiAgICB0aGlzLmJvdW5kcy51cGRhdGUoKTtcbiAgICByZXR1cm4gc2NlbmUuYWRkKHRoaXMuYm91bmRzKTtcbiAgfTtcbiAgcHJvdG90eXBlLmFkZFRvID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gb2JqLmFkZCh0aGlzLnJvb3QpO1xuICB9O1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncG9zaXRpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucm9vdC5wb3NpdGlvbjtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAndmlzaWJsZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5yb290LnZpc2libGU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHN0YXRlKXtcbiAgICAgIHRoaXMucm9vdC52aXNpYmxlID0gc3RhdGU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIEJhc2U7XG59KCkpOyIsInZhciByZWYkLCBpZCwgbG9nLCBzaW4sIEJhc2UsIEJyaWNrLCBCcmlja1ByZXZpZXcsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHNpbiA9IHJlZiQuc2luO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5CcmljayA9IHJlcXVpcmUoJy4vYnJpY2snKS5Ccmljaztcbm91dCQuQnJpY2tQcmV2aWV3ID0gQnJpY2tQcmV2aWV3ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgZ2xhc3NNYXQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQnJpY2tQcmV2aWV3LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdCcmlja1ByZXZpZXcnLCBCcmlja1ByZXZpZXcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQnJpY2tQcmV2aWV3O1xuICBnbGFzc01hdCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgY29sb3I6IDB4MjIyMjIyLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgICBzaGluaW5lc3M6IDEwMCxcbiAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgICBkZXB0aFdyaXRlOiBmYWxzZVxuICB9KTtcbiAgZnVuY3Rpb24gQnJpY2tQcmV2aWV3KG9wdHMsIGdzKXtcbiAgICB2YXIgcywgdHViZVJhZGl1cywgdHViZUhlaWdodDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEJyaWNrUHJldmlldy5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcyA9IHRoaXMub3B0cy5wcmV2aWV3U2NhbGVGYWN0b3I7XG4gICAgdHViZVJhZGl1cyA9IHRoaXMub3B0cy5wcmV2aWV3RG9tZVJhZGl1cztcbiAgICB0dWJlSGVpZ2h0ID0gdGhpcy5vcHRzLnByZXZpZXdEb21lSGVpZ2h0O1xuICAgIHRoaXMuYnJpY2sgPSBuZXcgQnJpY2sodGhpcy5vcHRzLCBncyk7XG4gICAgdGhpcy5icmljay5yb290LnNjYWxlLnNldChzLCBzLCBzKTtcbiAgICB0aGlzLmJyaWNrLnJvb3QucG9zaXRpb24ueSA9IHRoaXMub3B0cy5ncmlkU2l6ZSAqIDI7XG4gICAgdGhpcy5icmljay5yb290LnBvc2l0aW9uLnggPSAwO1xuICAgIHRoaXMuZG9tZSA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5DYXBzdWxlR2VvbWV0cnkodHViZVJhZGl1cywgMTYsIHR1YmVIZWlnaHQsIDApLCBnbGFzc01hdCk7XG4gICAgdGhpcy5kb21lLnBvc2l0aW9uLnkgPSB0dWJlSGVpZ2h0O1xuICAgIHRoaXMuYmFzZSA9IHZvaWQgODtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5kb21lKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljay5yb290KTtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheU5vdGhpbmcgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmJyaWNrLnZpc2libGUgPSBmYWxzZTtcbiAgfTtcbiAgcHJvdG90eXBlLmRpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICB0aGlzLmJyaWNrLnZpc2libGUgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLmJyaWNrLnByZXR0eURpc3BsYXlTaGFwZShicmljayk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVXaWdnbGUgPSBmdW5jdGlvbihicmljaywgZWxhcHNlZFRpbWUpe1xuICAgIHJldHVybiB0aGlzLnJvb3Qucm90YXRpb24ueSA9IDAuMiAqIHNpbihlbGFwc2VkVGltZSAvIDUwMCk7XG4gIH07XG4gIHJldHVybiBCcmlja1ByZXZpZXc7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBkaXYsIHBpLCBCYXNlLCBNYXRlcmlhbHMsIEJyaWNrLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBkaXYgPSByZWYkLmRpdiwgcGkgPSByZWYkLnBpO1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkJyaWNrID0gQnJpY2sgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcmV0dHlPZmZzZXQsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoQnJpY2ssIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0JyaWNrJywgQnJpY2spLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gQnJpY2s7XG4gIHByZXR0eU9mZnNldCA9IHtcbiAgICBzcXVhcmU6IFstMiwgLTJdLFxuICAgIHppZzogWy0xLjUsIC0yXSxcbiAgICB6YWc6IFstMS41LCAtMl0sXG4gICAgbGVmdDogWy0xLjUsIC0yXSxcbiAgICByaWdodDogWy0xLjUsIC0yXSxcbiAgICB0ZWU6IFstMS41LCAtMl0sXG4gICAgdGV0cmlzOiBbLTIsIC0yLjVdXG4gIH07XG4gIGZ1bmN0aW9uIEJyaWNrKG9wdHMsIGdzKXtcbiAgICB2YXIgc2l6ZSwgZ3JpZCwgYmxvY2tHZW8sIHJlcyQsIGkkLCBpLCBjdWJlO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgQnJpY2suc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHNpemUgPSB0aGlzLm9wdHMuYmxvY2tTaXplO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgdGhpcy5icmljayA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLmZyYW1lID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KDQgKiBncmlkLCA0ICogZ3JpZCwgZ3JpZCksIE1hdGVyaWFscy5kZWJ1Z1dpcmVmcmFtZSk7XG4gICAgYmxvY2tHZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoc2l6ZSwgc2l6ZSwgc2l6ZSk7XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwOyBpJCA8PSAzOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBjdWJlID0gbmV3IFRIUkVFLk1lc2goYmxvY2tHZW8sIE1hdGVyaWFscy5ub3JtYWwpO1xuICAgICAgdGhpcy5icmljay5hZGQoY3ViZSk7XG4gICAgICByZXMkLnB1c2goY3ViZSk7XG4gICAgfVxuICAgIHRoaXMuY2VsbHMgPSByZXMkO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnNldCgwICogZ3JpZCwgLTAuNSAqIGdyaWQsIDApO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnJvdGF0aW9uLnggPSBwaTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5icmljayk7XG4gIH1cbiAgcHJvdG90eXBlLnByZXR0eURpc3BsYXlTaGFwZSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5U2hhcGUoYnJpY2ssIHRydWUpO1xuICB9O1xuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYXJnJCwgcHJldHR5KXtcbiAgICB2YXIgc2hhcGUsIHR5cGUsIGl4LCBncmlkLCBtYXJnaW4sIG9mZnNldCwgaSQsIGxlbiQsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgeCQsIHJlc3VsdHMkID0gW107XG4gICAgc2hhcGUgPSBhcmckLnNoYXBlLCB0eXBlID0gYXJnJC50eXBlO1xuICAgIHByZXR0eSA9PSBudWxsICYmIChwcmV0dHkgPSBmYWxzZSk7XG4gICAgaXggPSAwO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgbWFyZ2luID0gKHRoaXMub3B0cy5ncmlkU2l6ZSAtIHRoaXMub3B0cy5ibG9ja1NpemUpIC8gMjtcbiAgICBvZmZzZXQgPSBwcmV0dHlcbiAgICAgID8gcHJldHR5T2Zmc2V0W3R5cGVdXG4gICAgICA6IFstMiwgLTJdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gc2hhcGUubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHNoYXBlW2kkXTtcbiAgICAgIGxyZXN1bHQkID0gW107XG4gICAgICBmb3IgKGokID0gMCwgbGVuMSQgPSByb3cubGVuZ3RoOyBqJCA8IGxlbjEkOyArK2okKSB7XG4gICAgICAgIHggPSBqJDtcbiAgICAgICAgY2VsbCA9IHJvd1tqJF07XG4gICAgICAgIGlmIChjZWxsKSB7XG4gICAgICAgICAgeCQgPSB0aGlzLmNlbGxzW2l4KytdO1xuICAgICAgICAgIHgkLnBvc2l0aW9uLnggPSAob2Zmc2V0WzBdICsgMC41ICsgeCkgKiBncmlkICsgbWFyZ2luO1xuICAgICAgICAgIHgkLnBvc2l0aW9uLnkgPSAob2Zmc2V0WzFdICsgMC41ICsgeSkgKiBncmlkICsgbWFyZ2luO1xuICAgICAgICAgIHgkLm1hdGVyaWFsID0gTWF0ZXJpYWxzLmJsb2Nrc1tjZWxsXTtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKHgkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIEJyaWNrO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgbWF4LCBCYXNlLCBGYWlsU2NyZWVuLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBtYXggPSByZWYkLm1heDtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5GYWlsU2NyZWVuID0gRmFpbFNjcmVlbiA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoRmFpbFNjcmVlbiwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRmFpbFNjcmVlbicsIEZhaWxTY3JlZW4pLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRmFpbFNjcmVlbjtcbiAgZnVuY3Rpb24gRmFpbFNjcmVlbihvcHRzLCBncyl7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBGYWlsU2NyZWVuLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBsb2coXCJGYWlsU2NyZWVuOjpuZXdcIik7XG4gIH1cbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXt9O1xuICByZXR1cm4gRmFpbFNjcmVlbjtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgQmFzZSwgQnJpY2ssIEZhbGxpbmdCcmljaywgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgc2luID0gcmVmJC5zaW47XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbkJyaWNrID0gcmVxdWlyZSgnLi9icmljaycpLkJyaWNrO1xub3V0JC5GYWxsaW5nQnJpY2sgPSBGYWxsaW5nQnJpY2sgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEZhbGxpbmdCcmljaywgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnRmFsbGluZ0JyaWNrJywgRmFsbGluZ0JyaWNrKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEZhbGxpbmdCcmljaztcbiAgZnVuY3Rpb24gRmFsbGluZ0JyaWNrKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEZhbGxpbmdCcmljay5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5ncmlkID0gb3B0cy5ncmlkU2l6ZTtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuZ3JpZCAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmJyaWNrID0gbmV3IEJyaWNrKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJyaWNrLnJvb3QpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSAtMyAqIHRoaXMuZ3JpZDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gLTEuNSAqIHRoaXMuZ3JpZDtcbiAgfVxuICBwcm90b3R5cGUuZGlzcGxheVNoYXBlID0gZnVuY3Rpb24oYnJpY2spe1xuICAgIHJldHVybiB0aGlzLmJyaWNrLmRpc3BsYXlTaGFwZShicmljayk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKHBvcyl7XG4gICAgdmFyIHgsIHk7XG4gICAgeCA9IHBvc1swXSwgeSA9IHBvc1sxXTtcbiAgICByZXR1cm4gdGhpcy5yb290LnBvc2l0aW9uLnNldCh0aGlzLmdyaWQgKiB4LCB0aGlzLmhlaWdodCAtIHRoaXMuZ3JpZCAqIHksIDApO1xuICB9O1xuICByZXR1cm4gRmFsbGluZ0JyaWNrO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgQmFzZSwgRnJhbWUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm91dCQuRnJhbWUgPSBGcmFtZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoRnJhbWUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0ZyYW1lJywgRnJhbWUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gRnJhbWU7XG4gIGZ1bmN0aW9uIEZyYW1lKG9wdHMsIGdzKXtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIEZyYW1lLnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICByZXR1cm4gRnJhbWU7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmbG9vciwgQmFzZSwgTWF0ZXJpYWxzLCBHdWlkZUxpbmVzLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuR3VpZGVMaW5lcyA9IEd1aWRlTGluZXMgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBwcm90b3R5cGUgPSBleHRlbmQkKChpbXBvcnQkKEd1aWRlTGluZXMsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0d1aWRlTGluZXMnLCBHdWlkZUxpbmVzKSwgc3VwZXJjbGFzcykucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEd1aWRlTGluZXM7XG4gIGZ1bmN0aW9uIEd1aWRlTGluZXMob3B0cywgZ3Mpe1xuICAgIHZhciBncmlkU2l6ZSwgd2lkdGgsIGhlaWdodCwgbWVzaCwgaSQsIGksIGxpbmUsIHJlZiQ7XG4gICAgZ3JpZFNpemUgPSBvcHRzLmdyaWRTaXplO1xuICAgIEd1aWRlTGluZXMuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHdpZHRoID0gZ3JpZFNpemUgKiBncy5hcmVuYS53aWR0aDtcbiAgICBoZWlnaHQgPSBncmlkU2l6ZSAqIGdzLmFyZW5hLmhlaWdodDtcbiAgICB0aGlzLmxpbmVzID0gW107XG4gICAgbWVzaCA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgIG1lc2gudmVydGljZXMucHVzaChuZXcgVEhSRUUuVmVjdG9yMygwLCAwLCAwKSwgbmV3IFRIUkVFLlZlY3RvcjMoMCwgaGVpZ2h0LCAwKSk7XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIGxpbmUgPSBuZXcgVEhSRUUuTGluZShtZXNoLCBNYXRlcmlhbHMubGluZXNbaV0pO1xuICAgICAgcmVmJCA9IGxpbmUucG9zaXRpb247XG4gICAgICByZWYkLnggPSBpICogZ3JpZFNpemU7XG4gICAgICByZWYkLnkgPSAwO1xuICAgICAgdGhpcy5saW5lcy5wdXNoKGxpbmUpO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKGxpbmUpO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi54ID0gd2lkdGggLyAtMiArIDAuNSAqIGdyaWRTaXplO1xuICB9XG4gIHByb3RvdHlwZS5zaG93QmVhbSA9IGZ1bmN0aW9uKGJyaWNrKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGxpbmUsIHksIHJvdywgbHJlc3VsdCQsIGokLCBsZW4xJCwgeCwgY2VsbCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5saW5lcykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGxpbmUgPSByZWYkW2kkXTtcbiAgICAgIGxpbmUubWF0ZXJpYWwgPSBNYXRlcmlhbHMubGluZXNbMF07XG4gICAgfVxuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSBicmljay5zaGFwZSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHkgPSBpJDtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgbHJlc3VsdCQgPSBbXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBscmVzdWx0JC5wdXNoKHRoaXMubGluZXNbYnJpY2sucG9zWzBdICsgeF0ubWF0ZXJpYWwgPSBNYXRlcmlhbHMubGluZXNbY2VsbF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXN1bHRzJC5wdXNoKGxyZXN1bHQkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUuZGFuY2UgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIGksIGxpbmUsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMubGluZXMpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICBsaW5lID0gcmVmJFtpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKGxpbmUubWF0ZXJpYWwgPSBNYXRlcmlhbHMubGluZXNbKGkgKyBmbG9vcih0aW1lIC8gMTAwKSkgJSA4XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIEd1aWRlTGluZXM7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBBcmVuYSwgVGl0bGUsIFRhYmxlLCBCcmlja1ByZXZpZXcsIExpZ2h0aW5nLCBOaXhpZURpc3BsYXksIFN0YXJ0TWVudSwgRmFpbFNjcmVlbiwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2FyZW5hJyksIEFyZW5hID0gcmVmJC5BcmVuYSwgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vdGl0bGUnKSwgVGl0bGUgPSByZWYkLlRpdGxlLCByZWYkKSk7XG5pbXBvcnQkKG91dCQsIChyZWYkID0gcmVxdWlyZSgnLi90YWJsZScpLCBUYWJsZSA9IHJlZiQuVGFibGUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2JyaWNrLXByZXZpZXcnKSwgQnJpY2tQcmV2aWV3ID0gcmVmJC5Ccmlja1ByZXZpZXcsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2xpZ2h0aW5nJyksIExpZ2h0aW5nID0gcmVmJC5MaWdodGluZywgcmVmJCkpO1xuaW1wb3J0JChvdXQkLCAocmVmJCA9IHJlcXVpcmUoJy4vbml4aWUnKSwgTml4aWVEaXNwbGF5ID0gcmVmJC5OaXhpZURpc3BsYXksIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL3N0YXJ0LW1lbnUnKSwgU3RhcnRNZW51ID0gcmVmJC5TdGFydE1lbnUsIHJlZiQpKTtcbmltcG9ydCQob3V0JCwgKHJlZiQgPSByZXF1aXJlKCcuL2ZhaWwtc2NyZWVuJyksIEZhaWxTY3JlZW4gPSByZWYkLkZhaWxTY3JlZW4sIHJlZiQpKTtcbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxlcnAsIGxvZywgZmxvb3IsIG1hcCwgc3BsaXQsIHBpLCB0YXUsIEJhc2UsIE1hdGVyaWFscywgTEVELCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIHNpbiA9IHJlZiQuc2luLCBsZXJwID0gcmVmJC5sZXJwLCBsb2cgPSByZWYkLmxvZywgZmxvb3IgPSByZWYkLmZsb29yLCBtYXAgPSByZWYkLm1hcCwgc3BsaXQgPSByZWYkLnNwbGl0LCBwaSA9IHJlZiQucGksIHRhdSA9IHJlZiQudGF1O1xuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpLkJhc2U7XG5NYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9tYXRzJyk7XG5vdXQkLkxFRCA9IExFRCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIGhhbGZTcGhlcmUsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTEVELCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdMRUQnLCBMRUQpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTEVEO1xuICBoYWxmU3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuMDEsIDgsIDgpO1xuICBmdW5jdGlvbiBMRUQob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTEVELnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm1hdHMgPSB7XG4gICAgICBvZmY6IE1hdGVyaWFscy5nbGFzcyxcbiAgICAgIG9uOiBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICAgICAgICBjb2xvcjogMHhmYmIwM2IsXG4gICAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgICBlbWlzc2l2ZTogMHhmYmIwYmIsXG4gICAgICAgIHNwZWN1bGFyOiAnd2hpdGUnLFxuICAgICAgICBzaGluaW5lc3M6IDEwMFxuICAgICAgfSlcbiAgICB9O1xuICAgIHRoaXMuYnVsYiA9IG5ldyBUSFJFRS5NZXNoKGhhbGZTcGhlcmUsIHRoaXMubWF0cy5vZmYpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZiYjAzYiwgMCwgMC4xKTtcbiAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnkgPSAwLjAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmJ1bGIpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgfVxuICBwcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbihjb2xvcil7XG4gICAgdGhpcy5idWxiLm1hdGVyaWFsLmNvbG9yID0gY29sb3I7XG4gICAgcmV0dXJuIHRoaXMubGlnaHQuY29sb3IgPSBjb2xvcjtcbiAgfTtcbiAgcHJvdG90eXBlLm9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJ1bGIubWF0ZXJpYWwgPSB0aGlzLm1hdHMub247XG4gICAgcmV0dXJuIHRoaXMubGlnaHQuaW50ZW5zaXR5ID0gMC4zO1xuICB9O1xuICBwcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmJ1bGIubWF0ZXJpYWwgPSB0aGlzLm1hdHMub2ZmO1xuICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDA7XG4gIH07XG4gIHJldHVybiBMRUQ7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIEJhc2UsIExpZ2h0aW5nLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcztcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xub3V0JC5MaWdodGluZyA9IExpZ2h0aW5nID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgbWFpbkxpZ2h0RGlzdGFuY2UsIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTGlnaHRpbmcsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ0xpZ2h0aW5nJywgTGlnaHRpbmcpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTGlnaHRpbmc7XG4gIG1haW5MaWdodERpc3RhbmNlID0gMjtcbiAgZnVuY3Rpb24gTGlnaHRpbmcob3B0cywgZ3Mpe1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgTGlnaHRpbmcuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZiwgMSwgbWFpbkxpZ2h0RGlzdGFuY2UpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KDAsIDEsIDApO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxpZ2h0KTtcbiAgICB0aGlzLnNwb3RsaWdodCA9IG5ldyBUSFJFRS5TcG90TGlnaHQoMHhmZmZmZmYsIDEsIDUwLCAxKTtcbiAgICB0aGlzLnNwb3RsaWdodC5wb3NpdGlvbi5zZXQoMCwgMywgLTEpO1xuICAgIHRoaXMuc3BvdGxpZ2h0LnRhcmdldC5wb3NpdGlvbi5zZXQoMCwgMCwgLTEpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnNwb3RsaWdodCk7XG4gICAgdGhpcy5hbWJpZW50ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweDY2NjY2Nik7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMuYW1iaWVudCk7XG4gICAgdGhpcy5zcG90bGlnaHQuY2FzdFNoYWRvdyA9IHRydWU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93RGFya25lc3MgPSAwLjU7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93QmlhcyA9IDAuMDAwMTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dNYXBXaWR0aCA9IDEwMjQ7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93TWFwSGVpZ2h0ID0gMTAyNDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFOZWFyID0gMTA7XG4gICAgdGhpcy5zcG90bGlnaHQuc2hhZG93Q2FtZXJhRmFyID0gMjUwMDtcbiAgICB0aGlzLnNwb3RsaWdodC5zaGFkb3dDYW1lcmFGb3YgPSA1MDtcbiAgfVxuICBwcm90b3R5cGUuc2hvd0hlbHBlcnMgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuUG9pbnRMaWdodEhlbHBlcih0aGlzLmxpZ2h0LCBtYWluTGlnaHREaXN0YW5jZSkpO1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQobmV3IFRIUkVFLlNwb3RMaWdodEhlbHBlcih0aGlzLnNwb3RsaWdodCkpO1xuICB9O1xuICBwcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnggPSAxLjAgKiBzaW4odGltZSAvIDUwMCk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnkgPSAwLjUgKiBjb3ModGltZSAvIDUwMCk7XG4gIH07XG4gIHJldHVybiBMaWdodGluZztcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBzaW4sIGxlcnAsIGxvZywgZmxvb3IsIG1hcCwgc3BsaXQsIHBpLCB0YXUsIE1hdGVyaWFscywgQmFzZSwgQ2Fwc3VsZUdlb21ldHJ5LCBMRUQsIE5peGllVHViZSwgTml4aWVEaXNwbGF5LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzLCBzbGljZSQgPSBbXS5zbGljZTtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBzaW4gPSByZWYkLnNpbiwgbGVycCA9IHJlZiQubGVycCwgbG9nID0gcmVmJC5sb2csIGZsb29yID0gcmVmJC5mbG9vciwgbWFwID0gcmVmJC5tYXAsIHNwbGl0ID0gcmVmJC5zcGxpdCwgcGkgPSByZWYkLnBpLCB0YXUgPSByZWYkLnRhdTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKS5CYXNlO1xuQ2Fwc3VsZUdlb21ldHJ5ID0gcmVxdWlyZSgnLi4vZ2VvbWV0cnkvY2Fwc3VsZScpLkNhcHN1bGVHZW9tZXRyeTtcbkxFRCA9IHJlcXVpcmUoJy4vbGVkJykuTEVEO1xuTml4aWVUdWJlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChOaXhpZVR1YmUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ05peGllVHViZScsIE5peGllVHViZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBOaXhpZVR1YmU7XG4gIGZ1bmN0aW9uIE5peGllVHViZShvcHRzLCBncyl7XG4gICAgdmFyIHR1YmVSYWRpdXMsIHR1YmVIZWlnaHQsIGJhc2VSYWRpdXMsIGJhc2VIZWlnaHQsIGxhbXBPZmZzZXQsIG1lc2hXaWR0aCwgbWVzaEhlaWdodCwgYmdHZW8sIGJhc2VHZW8sIHJlcyQsIGkkLCByZWYkLCBsZW4kLCBpeCwgaSwgcXVhZDtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllVHViZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdHViZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZVR1YmVSYWRpdXM7XG4gICAgdHViZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQ7XG4gICAgYmFzZVJhZGl1cyA9IHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgYmFzZUhlaWdodCA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAxMDtcbiAgICBsYW1wT2Zmc2V0ID0gdGhpcy5vcHRzLnNjb3JlSW5kaWNhdG9yT2Zmc2V0O1xuICAgIG1lc2hXaWR0aCA9IHR1YmVSYWRpdXMgKiAxLjM7XG4gICAgbWVzaEhlaWdodCA9IHR1YmVSYWRpdXMgKiAyLjU7XG4gICAgdGhpcy5tZXNoV2lkdGggPSBtZXNoV2lkdGg7XG4gICAgdGhpcy5tZXNoSGVpZ2h0ID0gbWVzaEhlaWdodDtcbiAgICBiZ0dlbyA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KG1lc2hXaWR0aCwgbWVzaEhlaWdodCk7XG4gICAgYmFzZUdlbyA9IG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KGJhc2VSYWRpdXMsIGJhc2VSYWRpdXMsIGJhc2VIZWlnaHQsIDYsIDApO1xuICAgIGJhc2VHZW8uYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlUm90YXRpb25ZKHBpIC8gNikpO1xuICAgIHRoaXMuaW50ZW5zaXR5ID0gMDtcbiAgICB0aGlzLmdsYXNzID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNhcHN1bGVHZW9tZXRyeSh0dWJlUmFkaXVzLCAxNiwgdHViZUhlaWdodCwgMCksIE1hdGVyaWFscy5nbGFzcyk7XG4gICAgdGhpcy5iYXNlID0gbmV3IFRIUkVFLk1lc2goYmFzZUdlbywgTWF0ZXJpYWxzLmNvcHBlcik7XG4gICAgdGhpcy5iZyA9IG5ldyBUSFJFRS5NZXNoKGJnR2VvLCBNYXRlcmlhbHMubml4aWVCZyk7XG4gICAgdGhpcy5sZWQgPSBuZXcgTEVEKHRoaXMub3B0cywgZ3MpO1xuICAgIHRoaXMubGVkLnBvc2l0aW9uLnogPSBsYW1wT2Zmc2V0O1xuICAgIHRoaXMuZ2xhc3MucG9zaXRpb24ueSA9IHR1YmVIZWlnaHQ7XG4gICAgdGhpcy5iZy5wb3NpdGlvbi55ID0gbWVzaEhlaWdodCAvIDIgKyBiYXNlSGVpZ2h0IC8gMjtcbiAgICByZXMkID0gW107XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGl4ID0gaSQ7XG4gICAgICBpID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVEaWdpdFF1YWQoaSwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gbWVzaEhlaWdodCAvIDIgKyBiYXNlSGVpZ2h0IC8gMjtcbiAgICAgIHF1YWQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgcXVhZC5kaWdpdCA9IGk7XG4gICAgICBxdWFkLnJlbmRlck9yZGVyID0gMDtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICAgIHJlcyQucHVzaChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy5kaWdpdHMgPSByZXMkO1xuICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgnb3JhbmdlJywgMC4zLCAwLjMpO1xuICAgIHRoaXMubGlnaHQucG9zaXRpb24ueSA9IHRoaXMub3B0cy5zY29yZVR1YmVIZWlnaHQgLyAyO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmdsYXNzKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iYXNlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5hZGQodGhpcy5iZyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHRoaXMubGlnaHQpO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLmxlZC5yb290KTtcbiAgfVxuICBwcm90b3R5cGUucHVsc2UgPSBmdW5jdGlvbih0KXtcbiAgICBpZiAodGhpcy5pbnRlbnNpdHkgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0LmludGVuc2l0eSA9IHRoaXMuaW50ZW5zaXR5ICsgMC4xICogc2luKHQpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnNob3dEaWdpdCA9IGZ1bmN0aW9uKGRpZ2l0KXtcbiAgICB0aGlzLmludGVuc2l0eSA9IGRpZ2l0ICE9IG51bGwgPyAwLjUgOiAwO1xuICAgIHRoaXMuZGlnaXRzLm1hcChmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXQudmlzaWJsZSA9IGl0LmRpZ2l0ID09PSBkaWdpdDtcbiAgICB9KTtcbiAgICBpZiAoZGlnaXQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMubGVkLm9uKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmxlZC5vZmYoKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5jcmVhdGVEaWdpdFF1YWQgPSBmdW5jdGlvbihkaWdpdCwgaXgpe1xuICAgIHZhciBnZW9tLCBxdWFkO1xuICAgIGdlb20gPSBuZXcgVEhSRUUuUGxhbmVCdWZmZXJHZW9tZXRyeSh0aGlzLm1lc2hXaWR0aCwgdGhpcy5tZXNoSGVpZ2h0KTtcbiAgICByZXR1cm4gcXVhZCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIE1hdGVyaWFscy5uaXhpZURpZ2l0c1tkaWdpdF0pO1xuICB9O1xuICByZXR1cm4gTml4aWVUdWJlO1xufShCYXNlKSk7XG5vdXQkLk5peGllRGlzcGxheSA9IE5peGllRGlzcGxheSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoTml4aWVEaXNwbGF5LCBzdXBlcmNsYXNzKS5kaXNwbGF5TmFtZSA9ICdOaXhpZURpc3BsYXknLCBOaXhpZURpc3BsYXkpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gTml4aWVEaXNwbGF5O1xuICBmdW5jdGlvbiBOaXhpZURpc3BsYXkob3B0cywgZ3Mpe1xuICAgIHZhciBvZmZzZXQsIG1hcmdpbiwgYmFzZVJhZGl1cywgcmVzJCwgaSQsIHRvJCwgaSwgdHViZTtcbiAgICB0aGlzLm9wdHMgPSBvcHRzO1xuICAgIE5peGllRGlzcGxheS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgb2Zmc2V0ID0gdGhpcy5vcHRzLnNjb3JlT2Zmc2V0RnJvbUNlbnRyZSArIHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXM7XG4gICAgbWFyZ2luID0gdGhpcy5vcHRzLnNjb3JlSW50ZXJUdWJlTWFyZ2luO1xuICAgIGJhc2VSYWRpdXMgPSB0aGlzLm9wdHMuc2NvcmVCYXNlUmFkaXVzO1xuICAgIHRoaXMuY291bnQgPSA1O1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsYXN0U2Vlbk51bWJlcjogMFxuICAgIH07XG4gICAgcmVzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLmNvdW50OyBpJCA8IHRvJDsgKytpJCkge1xuICAgICAgaSA9IGkkO1xuICAgICAgdHViZSA9IG5ldyBOaXhpZVR1YmUodGhpcy5vcHRzLCBncyk7XG4gICAgICB0dWJlLnBvc2l0aW9uLnggPSBtYXJnaW4gKiBpICsgb2Zmc2V0ICsgaSAqIHRoaXMub3B0cy5zY29yZUJhc2VSYWRpdXMgKiAyO1xuICAgICAgdGhpcy5yZWdpc3RyYXRpb24uYWRkKHR1YmUucm9vdCk7XG4gICAgICByZXMkLnB1c2godHViZSk7XG4gICAgfVxuICAgIHRoaXMudHViZXMgPSByZXMkO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLnogPSAtdGhpcy5vcHRzLnNjb3JlRGlzdGFuY2VGcm9tRWRnZTtcbiAgfVxuICBwcm90b3R5cGUucHVsc2UgPSBmdW5jdGlvbih0KXtcbiAgICByZXR1cm4gdGhpcy50dWJlcy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnB1bHNlKHQpO1xuICAgIH0pO1xuICB9O1xuICBwcm90b3R5cGUucnVuVG9OdW1iZXIgPSBmdW5jdGlvbihwLCBudW0pe1xuICAgIHZhciBuZXh0TnVtYmVyO1xuICAgIG5leHROdW1iZXIgPSBmbG9vcihsZXJwKHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIsIG51bSwgcCkpO1xuICAgIHJldHVybiB0aGlzLnNob3dOdW1iZXIobmV4dE51bWJlcik7XG4gIH07XG4gIHByb3RvdHlwZS5zZXROdW1iZXIgPSBmdW5jdGlvbihudW0pe1xuICAgIHRoaXMuc3RhdGUubGFzdFNlZW5OdW1iZXIgPSBudW07XG4gICAgcmV0dXJuIHRoaXMuc2hvd051bWJlcihudW0pO1xuICB9O1xuICBwcm90b3R5cGUuc2hvd051bWJlciA9IGZ1bmN0aW9uKG51bSl7XG4gICAgdmFyIGRpZ2l0cywgaSQsIGksIHR1YmUsIGRpZ2l0LCByZXN1bHRzJCA9IFtdO1xuICAgIG51bSA9PSBudWxsICYmIChudW0gPSAwKTtcbiAgICBkaWdpdHMgPSBtYXAocGFydGlhbGl6ZSQuYXBwbHkodGhpcywgW3BhcnNlSW50LCBbdm9pZCA4LCAxMF0sIFswXV0pKShcbiAgICBzcGxpdCgnJykoXG4gICAgZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnRvU3RyaW5nKCk7XG4gICAgfShcbiAgICBudW0pKSk7XG4gICAgZm9yIChpJCA9IHRoaXMuY291bnQgLSAxOyBpJCA+PSAwOyAtLWkkKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0dWJlID0gdGhpcy50dWJlc1tpXTtcbiAgICAgIGRpZ2l0ID0gZGlnaXRzLnBvcCgpO1xuICAgICAgcmVzdWx0cyQucHVzaCh0dWJlLnNob3dEaWdpdChkaWdpdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBOaXhpZURpc3BsYXk7XG59KEJhc2UpKTtcbmZ1bmN0aW9uIGV4dGVuZCQoc3ViLCBzdXApe1xuICBmdW5jdGlvbiBmdW4oKXt9IGZ1bi5wcm90b3R5cGUgPSAoc3ViLnN1cGVyY2xhc3MgPSBzdXApLnByb3RvdHlwZTtcbiAgKHN1Yi5wcm90b3R5cGUgPSBuZXcgZnVuKS5jb25zdHJ1Y3RvciA9IHN1YjtcbiAgaWYgKHR5cGVvZiBzdXAuZXh0ZW5kZWQgPT0gJ2Z1bmN0aW9uJykgc3VwLmV4dGVuZGVkKHN1Yik7XG4gIHJldHVybiBzdWI7XG59XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gcGFydGlhbGl6ZSQoZiwgYXJncywgd2hlcmUpe1xuICB2YXIgY29udGV4dCA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBwYXJhbXMgPSBzbGljZSQuY2FsbChhcmd1bWVudHMpLCBpLFxuICAgICAgICBsZW4gPSBwYXJhbXMubGVuZ3RoLCB3bGVuID0gd2hlcmUubGVuZ3RoLFxuICAgICAgICB0YSA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW10sIHR3ID0gd2hlcmUgPyB3aGVyZS5jb25jYXQoKSA6IFtdO1xuICAgIGZvcihpID0gMDsgaSA8IGxlbjsgKytpKSB7IHRhW3R3WzBdXSA9IHBhcmFtc1tpXTsgdHcuc2hpZnQoKTsgfVxuICAgIHJldHVybiBsZW4gPCB3bGVuICYmIGxlbiA/XG4gICAgICBwYXJ0aWFsaXplJC5hcHBseShjb250ZXh0LCBbZiwgdGEsIHR3XSkgOiBmLmFwcGx5KGNvbnRleHQsIHRhKTtcbiAgfTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCByYW5kLCBmbG9vciwgQmFzZSwgbWVzaE1hdGVyaWFscywgUGFydGljbGVCdXJzdCwgUGFydGljbGVFZmZlY3QsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2csIHBpID0gcmVmJC5waSwgc2luID0gcmVmJC5zaW4sIGNvcyA9IHJlZiQuY29zLCByYW5kID0gcmVmJC5yYW5kLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbm1lc2hNYXRlcmlhbHMgPSByZXF1aXJlKCcuLi9wYWxldHRlJykubWVzaE1hdGVyaWFscztcbm91dCQuUGFydGljbGVCdXJzdCA9IFBhcnRpY2xlQnVyc3QgPSAoZnVuY3Rpb24oc3VwZXJjbGFzcyl7XG4gIHZhciBzcGVlZCwgbGlmZXNwYW4sIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVCdXJzdCwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnUGFydGljbGVCdXJzdCcsIFBhcnRpY2xlQnVyc3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVCdXJzdDtcbiAgc3BlZWQgPSAyO1xuICBsaWZlc3BhbiA9IDE1MDA7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlQnVyc3Qob3B0cywgZ3Mpe1xuICAgIHZhciBhcmVuYSwgd2lkdGgsIGhlaWdodCwgcGFydGljbGVzLCBnZW9tZXRyeSwgY29sb3IsIG1hdGVyaWFsO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgYXJlbmEgPSBncy5hcmVuYSwgd2lkdGggPSBhcmVuYS53aWR0aCwgaGVpZ2h0ID0gYXJlbmEuaGVpZ2h0O1xuICAgIFBhcnRpY2xlQnVyc3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuc2l6ZSA9IHRoaXMub3B0cy56YXBQYXJ0aWNsZVNpemU7XG4gICAgcGFydGljbGVzID0gMTUwMDtcbiAgICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgIGNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKCk7XG4gICAgdGhpcy5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMudmVsb2NpdGllcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGljbGVzICogMyk7XG4gICAgdGhpcy5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyAqIDMpO1xuICAgIHRoaXMubGlmZXNwYW5zID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMuYWxwaGFzID0gbmV3IEZsb2F0MzJBcnJheShwYXJ0aWNsZXMpO1xuICAgIHRoaXMubWF4bGlmZXMgPSBuZXcgRmxvYXQzMkFycmF5KHBhcnRpY2xlcyk7XG4gICAgdGhpcy5wb3NBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLnBvc2l0aW9ucywgMyk7XG4gICAgdGhpcy5jb2xBdHRyID0gbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSh0aGlzLmNvbG9ycywgMyk7XG4gICAgdGhpcy5hbHBoYUF0dHIgPSBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKHRoaXMuYWxwaGFzLCAxKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdwb3NpdGlvbicsIHRoaXMucG9zQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdjb2xvcicsIHRoaXMuY29sQXR0cik7XG4gICAgZ2VvbWV0cnkuYWRkQXR0cmlidXRlKCdvcGFjaXR5JywgdGhpcy5hbHBoYUF0dHIpO1xuICAgIGdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICAgIG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50Q2xvdWRNYXRlcmlhbCh7XG4gICAgICBzaXplOiB0aGlzLnNpemUsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGJsZW5kaW5nOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxuICAgICAgdmVydGV4Q29sb3JzOiBUSFJFRS5WZXJ0ZXhDb2xvcnNcbiAgICB9KTtcbiAgICB0aGlzLnJvb3QuYWRkKG5ldyBUSFJFRS5Qb2ludENsb3VkKGdlb21ldHJ5LCBtYXRlcmlhbCkpO1xuICB9XG4gIHByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHgsIHosIHJlc3VsdHMkID0gW107XG4gICAgZ3JpZCA9IHRoaXMub3B0cy5ncmlkU2l6ZTtcbiAgICBmb3IgKGkkID0gMCwgdG8kID0gdGhpcy5wb3NpdGlvbnMubGVuZ3RoOyBpJCA8IHRvJDsgaSQgKz0gMykge1xuICAgICAgaSA9IGkkO1xuICAgICAgeCA9IDQuNSAtIE1hdGgucmFuZG9tKCkgKiA5O1xuICAgICAgeiA9IDAuNSAtIE1hdGgucmFuZG9tKCk7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMF0gPSB4ICogZ3JpZDtcbiAgICAgIHRoaXMucG9zaXRpb25zW2kgKyAxXSA9IDA7XG4gICAgICB0aGlzLnBvc2l0aW9uc1tpICsgMl0gPSB6ICogZ3JpZDtcbiAgICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB4IC8gMTA7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDFdID0gcmFuZCgtMiAqIGdyaWQsIDEwICogZ3JpZCk7XG4gICAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gejtcbiAgICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IDE7XG4gICAgICB0aGlzLmNvbG9yc1tpICsgMV0gPSAxO1xuICAgICAgdGhpcy5jb2xvcnNbaSArIDJdID0gMTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5saWZlc3BhbnNbaSAvIDNdID0gMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcHJvdG90eXBlLmFjY2VsZXJhdGVQYXJ0aWNsZSA9IGZ1bmN0aW9uKGksIHQsIHAsIGJieCwgYmJ6KXtcbiAgICB2YXIgYWNjLCBweCwgcHksIHB6LCB2eCwgdnksIHZ6LCBweDEsIHB5MSwgcHoxLCB2eDEsIHZ5MSwgdnoxLCBsO1xuICAgIGlmICh0aGlzLmxpZmVzcGFuc1tpIC8gM10gPD0gMCkge1xuICAgICAgdGhpcy5wb3NpdGlvbnNbaSArIDFdID0gLTEwMDA7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHQgPSB0IC8gKDEwMDAgLyBzcGVlZCk7XG4gICAgYWNjID0gLTAuOTg7XG4gICAgcHggPSB0aGlzLnBvc2l0aW9uc1tpICsgMF07XG4gICAgcHkgPSB0aGlzLnBvc2l0aW9uc1tpICsgMV07XG4gICAgcHogPSB0aGlzLnBvc2l0aW9uc1tpICsgMl07XG4gICAgdnggPSB0aGlzLnZlbG9jaXRpZXNbaSArIDBdO1xuICAgIHZ5ID0gdGhpcy52ZWxvY2l0aWVzW2kgKyAxXTtcbiAgICB2eiA9IHRoaXMudmVsb2NpdGllc1tpICsgMl07XG4gICAgcHgxID0gcHggKyAwLjUgKiAwICogdCAqIHQgKyB2eCAqIHQ7XG4gICAgcHkxID0gcHkgKyAwLjUgKiBhY2MgKiB0ICogdCArIHZ5ICogdDtcbiAgICBwejEgPSBweiArIDAuNSAqIDAgKiB0ICogdCArIHZ6ICogdDtcbiAgICB2eDEgPSAwICogdCArIHZ4O1xuICAgIHZ5MSA9IGFjYyAqIHQgKyB2eTtcbiAgICB2ejEgPSAwICogdCArIHZ6O1xuICAgIGlmIChweTEgPCB0aGlzLnNpemUgLyAyICYmICgtYmJ4IDwgcHgxICYmIHB4MSA8IGJieCkgJiYgKC1iYnogKyAxLjkgKiB0aGlzLm9wdHMuZ3JpZFNpemUgPCBwejEgJiYgcHoxIDwgYmJ6ICsgMS45ICogdGhpcy5vcHRzLmdyaWRTaXplKSkge1xuICAgICAgcHkxID0gdGhpcy5zaXplIC8gMjtcbiAgICAgIHZ4MSAqPSAwLjc7XG4gICAgICB2eTEgKj0gLTAuNjtcbiAgICAgIHZ6MSAqPSAwLjc7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb25zW2kgKyAwXSA9IHB4MTtcbiAgICB0aGlzLnBvc2l0aW9uc1tpICsgMV0gPSBweTE7XG4gICAgdGhpcy5wb3NpdGlvbnNbaSArIDJdID0gcHoxO1xuICAgIHRoaXMudmVsb2NpdGllc1tpICsgMF0gPSB2eDE7XG4gICAgdGhpcy52ZWxvY2l0aWVzW2kgKyAxXSA9IHZ5MTtcbiAgICB0aGlzLnZlbG9jaXRpZXNbaSArIDJdID0gdnoxO1xuICAgIGwgPSB0aGlzLmxpZmVzcGFuc1tpIC8gM10gLyB0aGlzLm1heGxpZmVzW2kgLyAzXTtcbiAgICBsID0gbCAqIGwgKiBsO1xuICAgIHRoaXMuY29sb3JzW2kgKyAwXSA9IGw7XG4gICAgdGhpcy5jb2xvcnNbaSArIDFdID0gbDtcbiAgICB0aGlzLmNvbG9yc1tpICsgMl0gPSBsO1xuICAgIHJldHVybiB0aGlzLmFscGhhc1tpIC8gM10gPSBsO1xuICB9O1xuICBwcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oeSl7XG4gICAgdmFyIGdyaWQsIGkkLCB0byQsIGksIHJlc3VsdHMkID0gW107XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIGdyaWQgPSB0aGlzLm9wdHMuZ3JpZFNpemU7XG4gICAgZm9yIChpJCA9IDAsIHRvJCA9IHRoaXMucG9zaXRpb25zLmxlbmd0aDsgaSQgPCB0byQ7IGkkICs9IDMpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHRoaXMubGlmZXNwYW5zW2kgLyAzXSA9IGxpZmVzcGFuIC8gMiArIE1hdGgucmFuZG9tKCkgKiBsaWZlc3BhbiAvIDI7XG4gICAgICB0aGlzLm1heGxpZmVzW2kgLyAzXSA9IHRoaXMubGlmZXNwYW5zW2kgLyAzXTtcbiAgICAgIHJlc3VsdHMkLnB1c2godGhpcy5wb3NpdGlvbnNbaSArIDFdID0gKHkgKyBNYXRoLnJhbmRvbSgpKSAqIGdyaWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCDOlHQpe1xuICAgIHZhciBib3VuY2VCb3VuZHNYLCBib3VuY2VCb3VuZHNaLCBpJCwgdG8kLCBpO1xuICAgIGJvdW5jZUJvdW5kc1ggPSB0aGlzLm9wdHMuZGVza1NpemVbMF0gLyAyO1xuICAgIGJvdW5jZUJvdW5kc1ogPSB0aGlzLm9wdHMuZGVza1NpemVbMV0gLyAyO1xuICAgIGZvciAoaSQgPSAwLCB0byQgPSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7IGkkIDwgdG8kOyBpJCArPSAzKSB7XG4gICAgICBpID0gaSQ7XG4gICAgICB0aGlzLmFjY2VsZXJhdGVQYXJ0aWNsZShpLCDOlHQsIDEsIGJvdW5jZUJvdW5kc1gsIGJvdW5jZUJvdW5kc1opO1xuICAgICAgdGhpcy5saWZlc3BhbnNbaSAvIDNdIC09IM6UdDtcbiAgICB9XG4gICAgdGhpcy5wb3NBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5jb2xBdHRyLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfTtcbiAgcmV0dXJuIFBhcnRpY2xlQnVyc3Q7XG59KEJhc2UpKTtcbm91dCQuUGFydGljbGVFZmZlY3QgPSBQYXJ0aWNsZUVmZmVjdCA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoUGFydGljbGVFZmZlY3QsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1BhcnRpY2xlRWZmZWN0JywgUGFydGljbGVFZmZlY3QpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gUGFydGljbGVFZmZlY3Q7XG4gIGZ1bmN0aW9uIFBhcnRpY2xlRWZmZWN0KG9wdHMsIGdzKXtcbiAgICB2YXIgYXJlbmEsIHdpZHRoLCBoZWlnaHQsIGkkLCByZWYkLCBsZW4kLCByb3c7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgUGFydGljbGVFZmZlY3Quc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMueiA9IHRoaXMub3B0cy56O1xuICAgIHRoaXMuaCA9IGhlaWdodDtcbiAgICB0aGlzLnJvd3MgPSBbXG4gICAgICAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KSwgKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpLCB0O1xuICAgICAgICByZXR1cm4gKHQgPSB0eXBlb2YgcmVzdWx0KSAgPT0gXCJvYmplY3RcIiB8fCB0ID09IFwiZnVuY3Rpb25cIiA/IHJlc3VsdCB8fCBjaGlsZCA6IGNoaWxkO1xuICB9KShQYXJ0aWNsZUJ1cnN0LCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSksIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKSwgdDtcbiAgICAgICAgcmV0dXJuICh0ID0gdHlwZW9mIHJlc3VsdCkgID09IFwib2JqZWN0XCIgfHwgdCA9PSBcImZ1bmN0aW9uXCIgPyByZXN1bHQgfHwgY2hpbGQgOiBjaGlsZDtcbiAgfSkoUGFydGljbGVCdXJzdCwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pLCAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyksIHQ7XG4gICAgICAgIHJldHVybiAodCA9IHR5cGVvZiByZXN1bHQpICA9PSBcIm9iamVjdFwiIHx8IHQgPT0gXCJmdW5jdGlvblwiID8gcmVzdWx0IHx8IGNoaWxkIDogY2hpbGQ7XG4gIH0pKFBhcnRpY2xlQnVyc3QsIGFyZ3VtZW50cywgZnVuY3Rpb24oKXt9KVxuICAgIF07XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IHRoaXMucm93cykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIHJvdyA9IHJlZiRbaSRdO1xuICAgICAgcm93LmFkZFRvKHRoaXMucm9vdCk7XG4gICAgfVxuICB9XG4gIHByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24ocm93cyl7XG4gICAgdmFyIGkkLCBsZW4kLCBpLCByb3dJeCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IHJvd3MubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJvd0l4ID0gcm93c1tpJF07XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucm93c1tpXS5zZXRIZWlnaHQoKHRoaXMuaCAtIDEpIC0gcm93SXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHMkO1xuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgc3lzdGVtLCByZXN1bHRzJCA9IFtdO1xuICAgIGZvciAoaSQgPSAwLCBsZW4kID0gKHJlZiQgPSB0aGlzLnJvd3MpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBzeXN0ZW0gPSByZWYkW2kkXTtcbiAgICAgIHJlc3VsdHMkLnB1c2goc3lzdGVtLnJlc2V0KCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihwLCBmc3JyLCDOlHQpe1xuICAgIHZhciBpJCwgcmVmJCwgbGVuJCwgaXgsIHN5c3RlbSwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5yb3dzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHN5c3RlbSA9IHJlZiRbaSRdO1xuICAgICAgcmVzdWx0cyQucHVzaChzeXN0ZW0udXBkYXRlKHAsIM6UdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBQYXJ0aWNsZUVmZmVjdDtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgY29zLCBCYXNlLCBUaXRsZSwgY2FudmFzVGV4dHVyZSwgU3RhcnRNZW51LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3M7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcblRpdGxlID0gcmVxdWlyZSgnLi90aXRsZScpLlRpdGxlO1xuY2FudmFzVGV4dHVyZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0ZXh0dXJlU2l6ZSwgZmlkZWxpdHlGYWN0b3IsIHRleHRDbnYsIGltZ0NudiwgdGV4dEN0eCwgaW1nQ3R4O1xuICB0ZXh0dXJlU2l6ZSA9IDEwMjQ7XG4gIGZpZGVsaXR5RmFjdG9yID0gMTAwO1xuICB0ZXh0Q252ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGltZ0NudiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB0ZXh0Q3R4ID0gdGV4dENudi5nZXRDb250ZXh0KCcyZCcpO1xuICBpbWdDdHggPSBpbWdDbnYuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaW1nQ252LndpZHRoID0gaW1nQ252LmhlaWdodCA9IHRleHR1cmVTaXplO1xuICByZXR1cm4gZnVuY3Rpb24oYXJnJCl7XG4gICAgdmFyIHdpZHRoLCBoZWlnaHQsIHRleHQsIHRleHRTaXplLCByZWYkO1xuICAgIHdpZHRoID0gYXJnJC53aWR0aCwgaGVpZ2h0ID0gYXJnJC5oZWlnaHQsIHRleHQgPSBhcmckLnRleHQsIHRleHRTaXplID0gKHJlZiQgPSBhcmckLnRleHRTaXplKSAhPSBudWxsID8gcmVmJCA6IDEwO1xuICAgIHRleHRDbnYud2lkdGggPSB3aWR0aCAqIGZpZGVsaXR5RmFjdG9yO1xuICAgIHRleHRDbnYuaGVpZ2h0ID0gaGVpZ2h0ICogZmlkZWxpdHlGYWN0b3I7XG4gICAgdGV4dEN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICB0ZXh0Q3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgIHRleHRDdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICB0ZXh0Q3R4LmZvbnQgPSB0ZXh0U2l6ZSAqIGZpZGVsaXR5RmFjdG9yICsgXCJweCBtb25vc3BhY2VcIjtcbiAgICB0ZXh0Q3R4LmZpbGxUZXh0KHRleHQsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IgLyAyLCBoZWlnaHQgKiBmaWRlbGl0eUZhY3RvciAvIDIsIHdpZHRoICogZmlkZWxpdHlGYWN0b3IpO1xuICAgIGltZ0N0eC5jbGVhclJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZmlsbFJlY3QoMCwgMCwgdGV4dHVyZVNpemUsIHRleHR1cmVTaXplKTtcbiAgICBpbWdDdHguZHJhd0ltYWdlKHRleHRDbnYsIDAsIDAsIHRleHR1cmVTaXplLCB0ZXh0dXJlU2l6ZSk7XG4gICAgcmV0dXJuIGltZ0Nudi50b0RhdGFVUkwoKTtcbiAgfTtcbn0oKTtcbm91dCQuU3RhcnRNZW51ID0gU3RhcnRNZW51ID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChTdGFydE1lbnUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1N0YXJ0TWVudScsIFN0YXJ0TWVudSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBTdGFydE1lbnU7XG4gIGZ1bmN0aW9uIFN0YXJ0TWVudShvcHRzLCBncyl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgb3B0aW9uLCBxdWFkO1xuICAgIHRoaXMub3B0cyA9IG9wdHM7XG4gICAgU3RhcnRNZW51LnN1cGVyY2xhc3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gZ3Muc3RhcnRNZW51U3RhdGUubWVudURhdGEpLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICBpeCA9IGkkO1xuICAgICAgb3B0aW9uID0gcmVmJFtpJF07XG4gICAgICBxdWFkID0gdGhpcy5jcmVhdGVPcHRpb25RdWFkKG9wdGlvbiwgaXgpO1xuICAgICAgcXVhZC5wb3NpdGlvbi55ID0gMC41IC0gaXggKiAwLjI7XG4gICAgICB0aGlzLm9wdGlvbnMucHVzaChxdWFkKTtcbiAgICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZChxdWFkKTtcbiAgICB9XG4gICAgdGhpcy50aXRsZSA9IG5ldyBUaXRsZSh0aGlzLm9wdHMsIGdzKTtcbiAgICB0aGlzLnRpdGxlLmFkZFRvKHRoaXMucmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi56ID0gLTEgKiAodGhpcy5vcHRzLmNhbWVyYURpc3RhbmNlRnJvbUVkZ2UgKyB0aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlICsgdGhpcy5vcHRzLmJsb2NrU2l6ZSAvIDIpO1xuICB9XG4gIHByb3RvdHlwZS5jcmVhdGVPcHRpb25RdWFkID0gZnVuY3Rpb24ob3B0aW9uLCBpeCl7XG4gICAgdmFyIGltYWdlLCB0ZXgsIGdlb20sIG1hdCwgcXVhZDtcbiAgICBpbWFnZSA9IGNhbnZhc1RleHR1cmUoe1xuICAgICAgdGV4dDogb3B0aW9uLnRleHQsXG4gICAgICB3aWR0aDogNjAsXG4gICAgICBoZWlnaHQ6IDEwXG4gICAgfSk7XG4gICAgdGV4ID0gVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShpbWFnZSk7XG4gICAgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KDEsIDAuMik7XG4gICAgbWF0ID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1hcDogdGV4LFxuICAgICAgYWxwaGFNYXA6IHRleCxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIHF1YWQgPSBuZXcgVEhSRUUuTWVzaChnZW9tLCBtYXQpO1xuICB9O1xuICBwcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oZ3Mpe1xuICAgIHZhciB0aW1lcnMsIHRpdGxlUmV2ZWFsVGltZXI7XG4gICAgdGltZXJzID0gZ3MudGltZXJzLCB0aXRsZVJldmVhbFRpbWVyID0gdGltZXJzLnRpdGxlUmV2ZWFsVGltZXI7XG4gICAgdGhpcy50aXRsZS5yZXZlYWwodGl0bGVSZXZlYWxUaW1lci5wcm9ncmVzcyk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlU2VsZWN0aW9uKGdzLnN0YXJ0TWVudVN0YXRlLCBncy5lbGFwc2VkVGltZSk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGVTZWxlY3Rpb24gPSBmdW5jdGlvbihzdGF0ZSwgdGltZSl7XG4gICAgdmFyIGkkLCByZWYkLCBsZW4kLCBpeCwgcXVhZCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5vcHRpb25zKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgaXggPSBpJDtcbiAgICAgIHF1YWQgPSByZWYkW2kkXTtcbiAgICAgIGlmIChpeCA9PT0gc3RhdGUuY3VycmVudEluZGV4KSB7XG4gICAgICAgIHF1YWQuc2NhbGUueCA9IDEgKyAwLjA1ICogc2luKHRpbWUgLyAzMDApO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHF1YWQuc2NhbGUueSA9IDEgKyAwLjA1ICogLXNpbih0aW1lIC8gMzAwKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfTtcbiAgcmV0dXJuIFN0YXJ0TWVudTtcbn0oQmFzZSkpO1xuZnVuY3Rpb24gZXh0ZW5kJChzdWIsIHN1cCl7XG4gIGZ1bmN0aW9uIGZ1bigpe30gZnVuLnByb3RvdHlwZSA9IChzdWIuc3VwZXJjbGFzcyA9IHN1cCkucHJvdG90eXBlO1xuICAoc3ViLnByb3RvdHlwZSA9IG5ldyBmdW4pLmNvbnN0cnVjdG9yID0gc3ViO1xuICBpZiAodHlwZW9mIHN1cC5leHRlbmRlZCA9PSAnZnVuY3Rpb24nKSBzdXAuZXh0ZW5kZWQoc3ViKTtcbiAgcmV0dXJuIHN1Yjtcbn1cbmZ1bmN0aW9uIGltcG9ydCQob2JqLCBzcmMpe1xuICB2YXIgb3duID0ge30uaGFzT3duUHJvcGVydHk7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIGlmIChvd24uY2FsbChzcmMsIGtleSkpIG9ialtrZXldID0gc3JjW2tleV07XG4gIHJldHVybiBvYmo7XG59IiwidmFyIHJlZiQsIGlkLCBsb2csIEJhc2UsIE1hdGVyaWFscywgVGFibGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbm91dCQuVGFibGUgPSBUYWJsZSA9IChmdW5jdGlvbihzdXBlcmNsYXNzKXtcbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZCQoKGltcG9ydCQoVGFibGUsIHN1cGVyY2xhc3MpLmRpc3BsYXlOYW1lID0gJ1RhYmxlJywgVGFibGUpLCBzdXBlcmNsYXNzKS5wcm90b3R5cGUsIGNvbnN0cnVjdG9yID0gVGFibGU7XG4gIGZ1bmN0aW9uIFRhYmxlKG9wdHMsIGdzKXtcbiAgICB2YXIgcmVmJCwgd2lkdGgsIGRlcHRoLCB0aGlja25lc3M7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBUYWJsZS5zdXBlcmNsYXNzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmVmJCA9IHRoaXMub3B0cy5kZXNrU2l6ZSwgd2lkdGggPSByZWYkWzBdLCBkZXB0aCA9IHJlZiRbMV0sIHRoaWNrbmVzcyA9IHJlZiRbMl07XG4gICAgdGhpcy50YWJsZSA9IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSh3aWR0aCwgdGhpY2tuZXNzLCBkZXB0aCksIE1hdGVyaWFscy50YWJsZUZhY2VzKTtcbiAgICB0aGlzLnRhYmxlLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLnRhYmxlKTtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi55ID0gdGhpY2tuZXNzIC8gLTI7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueiA9IGRlcHRoIC8gLTI7XG4gIH1cbiAgcmV0dXJuIFRhYmxlO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgcGksIHNpbiwgY29zLCBtaW4sIG1heCwgRWFzZSwgQmFzZSwgTWF0ZXJpYWxzLCBibG9ja1RleHQsIFRpdGxlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBwaSA9IHJlZiQucGksIHNpbiA9IHJlZiQuc2luLCBjb3MgPSByZWYkLmNvcywgbWluID0gcmVmJC5taW4sIG1heCA9IHJlZiQubWF4O1xuRWFzZSA9IHJlcXVpcmUoJ3N0ZCcpLkVhc2U7XG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJykuQmFzZTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4uL21hdHMnKTtcbmJsb2NrVGV4dCA9IHtcbiAgdGV0cmlzOiBbWzEsIDEsIDEsIDIsIDIsIDIsIDMsIDMsIDMsIDQsIDQsIDAsIDUsIDYsIDYsIDZdLCBbMCwgMSwgMCwgMiwgMCwgMCwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgMCwgMF0sIFswLCAxLCAwLCAyLCAyLCAwLCAwLCAzLCAwLCA0LCA0LCAwLCA1LCA2LCA2LCA2XSwgWzAsIDEsIDAsIDIsIDAsIDAsIDAsIDMsIDAsIDQsIDAsIDQsIDUsIDAsIDAsIDZdLCBbMCwgMSwgMCwgMiwgMiwgMiwgMCwgMywgMCwgNCwgMCwgNCwgNSwgNiwgNiwgNl1dLFxuICB2cnQ6IFtbMSwgMCwgMSwgNCwgNCwgNiwgNiwgNl0sIFsxLCAwLCAxLCA0LCAwLCA0LCA2LCAwXSwgWzEsIDAsIDEsIDQsIDQsIDAsIDYsIDBdLCBbMSwgMCwgMSwgNCwgMCwgNCwgNiwgMF0sIFswLCAxLCAwLCA0LCAwLCA0LCA2LCAwXV0sXG4gIGdob3N0OiBbWzEsIDEsIDEsIDIsIDAsIDIsIDMsIDMsIDMsIDQsIDQsIDQsIDUsIDUsIDVdLCBbMSwgMCwgMCwgMiwgMCwgMiwgMywgMCwgMywgNCwgMCwgMCwgMCwgNSwgMF0sIFsxLCAwLCAwLCAyLCAyLCAyLCAzLCAwLCAzLCA0LCA0LCA0LCAwLCA1LCAwXSwgWzEsIDAsIDEsIDIsIDAsIDIsIDMsIDAsIDMsIDAsIDAsIDQsIDAsIDUsIDBdLCBbMSwgMSwgMSwgMiwgMCwgMiwgMywgMywgMywgNCwgNCwgNCwgMCwgNSwgMF1dXG59O1xub3V0JC5UaXRsZSA9IFRpdGxlID0gKGZ1bmN0aW9uKHN1cGVyY2xhc3Mpe1xuICB2YXIgcHJvdG90eXBlID0gZXh0ZW5kJCgoaW1wb3J0JChUaXRsZSwgc3VwZXJjbGFzcykuZGlzcGxheU5hbWUgPSAnVGl0bGUnLCBUaXRsZSksIHN1cGVyY2xhc3MpLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBUaXRsZTtcbiAgZnVuY3Rpb24gVGl0bGUob3B0cywgZ3Mpe1xuICAgIHZhciBibG9ja1NpemUsIGdyaWRTaXplLCB0ZXh0LCBtYXJnaW4sIGhlaWdodCwgYmxvY2tHZW8sIGkkLCBsZW4kLCB5LCByb3csIGokLCBsZW4xJCwgeCwgY2VsbCwgYm94LCBiYm94O1xuICAgIGJsb2NrU2l6ZSA9IG9wdHMuYmxvY2tTaXplLCBncmlkU2l6ZSA9IG9wdHMuZ3JpZFNpemU7XG4gICAgVGl0bGUuc3VwZXJjbGFzcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRleHQgPSBibG9ja1RleHQudnJ0O1xuICAgIG1hcmdpbiA9IChncmlkU2l6ZSAtIGJsb2NrU2l6ZSkgLyAyO1xuICAgIGhlaWdodCA9IGdyaWRTaXplICogZ3MuYXJlbmEuaGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVnaXN0cmF0aW9uLmFkZCh0aGlzLndvcmQgPSBuZXcgVEhSRUUuT2JqZWN0M0QpO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi54ID0gKHRleHRbMF0ubGVuZ3RoIC0gMSkgKiBncmlkU2l6ZSAvIC0yO1xuICAgIHRoaXMud29yZC5wb3NpdGlvbi55ID0gaGVpZ2h0IC8gLTIgLSAodGV4dC5sZW5ndGggLSAxKSAqIGdyaWRTaXplIC8gLTI7XG4gICAgdGhpcy53b3JkLnBvc2l0aW9uLnogPSBncmlkU2l6ZSAvIDI7XG4gICAgYmxvY2tHZW8gPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoYmxvY2tTaXplLCBibG9ja1NpemUsIGJsb2NrU2l6ZSk7XG4gICAgZm9yIChpJCA9IDAsIGxlbiQgPSB0ZXh0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgICB5ID0gaSQ7XG4gICAgICByb3cgPSB0ZXh0W2kkXTtcbiAgICAgIGZvciAoaiQgPSAwLCBsZW4xJCA9IHJvdy5sZW5ndGg7IGokIDwgbGVuMSQ7ICsraiQpIHtcbiAgICAgICAgeCA9IGokO1xuICAgICAgICBjZWxsID0gcm93W2okXTtcbiAgICAgICAgaWYgKGNlbGwpIHtcbiAgICAgICAgICBib3ggPSBuZXcgVEhSRUUuTWVzaChibG9ja0dlbywgTWF0ZXJpYWxzLmJsb2Nrc1tjZWxsXSk7XG4gICAgICAgICAgYm94LnBvc2l0aW9uLnNldChncmlkU2l6ZSAqIHggKyBtYXJnaW4sIGdyaWRTaXplICogKHRleHQubGVuZ3RoIC8gMiAtIHkpICsgbWFyZ2luLCBncmlkU2l6ZSAvIC0yKTtcbiAgICAgICAgICB0aGlzLndvcmQuYWRkKGJveCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgYmJveCA9IG5ldyBUSFJFRS5Cb3VuZGluZ0JveEhlbHBlcih0aGlzLndvcmQsIDB4ZmYwMDAwKTtcbiAgICBiYm94LnVwZGF0ZSgpO1xuICB9XG4gIHByb3RvdHlwZS5yZXZlYWwgPSBmdW5jdGlvbihwcm9ncmVzcyl7XG4gICAgdmFyIHA7XG4gICAgcCA9IG1pbigxLCBwcm9ncmVzcyk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucG9zaXRpb24ueSA9IEVhc2UucXVpbnRPdXQocCwgdGhpcy5oZWlnaHQgKiAyLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueSA9IEVhc2UuZXhwT3V0KHAsIDMwLCAwKTtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueCA9IEVhc2UuZXhwT3V0KHAsIC1waSAvIDEwLCAwKTtcbiAgfTtcbiAgcHJvdG90eXBlLmRhbmNlID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5yZWdpc3RyYXRpb24ucm90YXRpb24ueSA9IC1waSAvIDIgKyB0aW1lIC8gMTAwMDtcbiAgICByZXR1cm4gdGhpcy53b3JkLm9wYWNpdHkgPSAwLjUgKyAwLjUgKiBzaW4gKyB0aW1lIC8gMTAwMDtcbiAgfTtcbiAgcmV0dXJuIFRpdGxlO1xufShCYXNlKSk7XG5mdW5jdGlvbiBleHRlbmQkKHN1Yiwgc3VwKXtcbiAgZnVuY3Rpb24gZnVuKCl7fSBmdW4ucHJvdG90eXBlID0gKHN1Yi5zdXBlcmNsYXNzID0gc3VwKS5wcm90b3R5cGU7XG4gIChzdWIucHJvdG90eXBlID0gbmV3IGZ1bikuY29uc3RydWN0b3IgPSBzdWI7XG4gIGlmICh0eXBlb2Ygc3VwLmV4dGVuZGVkID09ICdmdW5jdGlvbicpIHN1cC5leHRlbmRlZChzdWIpO1xuICByZXR1cm4gc3ViO1xufVxuZnVuY3Rpb24gaW1wb3J0JChvYmosIHNyYyl7XG4gIHZhciBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbiAgZm9yICh2YXIga2V5IGluIHNyYykgaWYgKG93bi5jYWxsKHNyYywga2V5KSkgb2JqW2tleV0gPSBzcmNba2V5XTtcbiAgcmV0dXJuIG9iajtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgc2luLCBwaSwgRGVidWdDYW1lcmFQb3NpdGlvbmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbiwgcGkgPSByZWYkLnBpO1xub3V0JC5EZWJ1Z0NhbWVyYVBvc2l0aW9uZXIgPSBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIgPSAoZnVuY3Rpb24oKXtcbiAgRGVidWdDYW1lcmFQb3NpdGlvbmVyLmRpc3BsYXlOYW1lID0gJ0RlYnVnQ2FtZXJhUG9zaXRpb25lcic7XG4gIHZhciBwcm90b3R5cGUgPSBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IERlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbiAgZnVuY3Rpb24gRGVidWdDYW1lcmFQb3NpdGlvbmVyKGNhbWVyYSwgdGFyZ2V0KXtcbiAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICB0YXJnZXQ6IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApXG4gICAgfTtcbiAgfVxuICBwcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbmFibGVkID0gdHJ1ZTtcbiAgfTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGdzKXtcbiAgICBpZiAodGhpcy5zdGF0ZS5lbmFibGVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdXRvUm90YXRlKGdzLmVsYXBzZWRUaW1lKTtcbiAgICB9XG4gIH07XG4gIHByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHBoYXNlLCB2cGhhc2Upe1xuICAgIHZhciB0aGF0O1xuICAgIHZwaGFzZSA9PSBudWxsICYmICh2cGhhc2UgPSAwKTtcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi54ID0gdGhpcy5yICogc2luKHBoYXNlKTtcbiAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gdGhpcy55ICsgdGhpcy5yICogLXNpbih2cGhhc2UpO1xuICAgIHJldHVybiB0aGlzLmNhbWVyYS5sb29rQXQoKHRoYXQgPSB0aGlzLnRhcmdldC5wb3NpdGlvbikgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IHRoaXMudGFyZ2V0KTtcbiAgfTtcbiAgcHJvdG90eXBlLmF1dG9Sb3RhdGUgPSBmdW5jdGlvbih0aW1lKXtcbiAgICByZXR1cm4gdGhpcy5zZXRQb3NpdGlvbihwaSAvIDEwICogc2luKHRpbWUgLyAxMDAwKSk7XG4gIH07XG4gIHJldHVybiBEZWJ1Z0NhbWVyYVBvc2l0aW9uZXI7XG59KCkpOyIsInZhciBwaTtcbnBpID0gcmVxdWlyZSgnc3RkJykucGk7XG5USFJFRS5DYXBzdWxlR2VvbWV0cnkgPSBmdW5jdGlvbihyYWRpdXMsIHJhZGlhbFNlZ21lbnRzLCBoZWlnaHQsIGxlbmd0aHdpc2VTZWdtZW50cyl7XG4gIHZhciBoYWxmU3BoZXJlLCB0dWJlO1xuICBoYWxmU3BoZXJlID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KHJhZGl1cywgcmFkaWFsU2VnbWVudHMsIHJhZGlhbFNlZ21lbnRzLCAwLCBwaSk7XG4gIGhhbGZTcGhlcmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlVHJhbnNsYXRpb24oMCwgMCwgMCkpO1xuICBoYWxmU3BoZXJlLmFwcGx5TWF0cml4KG5ldyBUSFJFRS5NYXRyaXg0KCkubWFrZVJvdGF0aW9uWCgtcGkgLyAyKSk7XG4gIGhhbGZTcGhlcmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlU2NhbGUoMSwgMC41LCAxKSk7XG4gIHR1YmUgPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeShyYWRpdXMsIHJhZGl1cywgaGVpZ2h0LCByYWRpYWxTZWdtZW50cyAqIDIsIGxlbmd0aHdpc2VTZWdtZW50cywgdHJ1ZSk7XG4gIHR1YmUuYXBwbHlNYXRyaXgobmV3IFRIUkVFLk1hdHJpeDQoKS5tYWtlVHJhbnNsYXRpb24oMCwgLWhlaWdodCAvIDIsIDApKTtcbiAgaGFsZlNwaGVyZS5tZXJnZSh0dWJlKTtcbiAgcmV0dXJuIGhhbGZTcGhlcmU7XG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBwaSwgc2luLCBjb3MsIGxlcnAsIHJhbmQsIGZsb29yLCBtYXAsIEVhc2UsIFRIUkVFLCBQYWxldHRlLCBTY2VuZU1hbmFnZXIsIERlYnVnQ2FtZXJhUG9zaXRpb25lciwgQXJlbmEsIFRhYmxlLCBTdGFydE1lbnUsIEZhaWxTY3JlZW4sIExpZ2h0aW5nLCBCcmlja1ByZXZpZXcsIE5peGllRGlzcGxheSwgVHJhY2tiYWxsQ29udHJvbHMsIFRocmVlSnNSZW5kZXJlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgcGkgPSByZWYkLnBpLCBzaW4gPSByZWYkLnNpbiwgY29zID0gcmVmJC5jb3MsIGxlcnAgPSByZWYkLmxlcnAsIHJhbmQgPSByZWYkLnJhbmQsIGZsb29yID0gcmVmJC5mbG9vciwgbWFwID0gcmVmJC5tYXA7XG5FYXNlID0gcmVxdWlyZSgnc3RkJykuRWFzZTtcblRIUkVFID0gcmVxdWlyZSgndGhyZWUtanMtdnItZXh0ZW5zaW9ucycpO1xuUGFsZXR0ZSA9IHJlcXVpcmUoJy4vcGFsZXR0ZScpLlBhbGV0dGU7XG5TY2VuZU1hbmFnZXIgPSByZXF1aXJlKCcuL3NjZW5lLW1hbmFnZXInKS5TY2VuZU1hbmFnZXI7XG5EZWJ1Z0NhbWVyYVBvc2l0aW9uZXIgPSByZXF1aXJlKCcuL2RlYnVnLWNhbWVyYScpLkRlYnVnQ2FtZXJhUG9zaXRpb25lcjtcbnJlZiQgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMnKSwgQXJlbmEgPSByZWYkLkFyZW5hLCBUYWJsZSA9IHJlZiQuVGFibGUsIFN0YXJ0TWVudSA9IHJlZiQuU3RhcnRNZW51LCBGYWlsU2NyZWVuID0gcmVmJC5GYWlsU2NyZWVuLCBMaWdodGluZyA9IHJlZiQuTGlnaHRpbmcsIEJyaWNrUHJldmlldyA9IHJlZiQuQnJpY2tQcmV2aWV3LCBOaXhpZURpc3BsYXkgPSByZWYkLk5peGllRGlzcGxheTtcblRyYWNrYmFsbENvbnRyb2xzID0gcmVxdWlyZSgnLi4vLi4vbGliL3RyYWNrYmFsbC1jb250cm9scy5qcycpLlRyYWNrYmFsbENvbnRyb2xzO1xub3V0JC5UaHJlZUpzUmVuZGVyZXIgPSBUaHJlZUpzUmVuZGVyZXIgPSAoZnVuY3Rpb24oKXtcbiAgVGhyZWVKc1JlbmRlcmVyLmRpc3BsYXlOYW1lID0gJ1RocmVlSnNSZW5kZXJlcic7XG4gIHZhciBwcm90b3R5cGUgPSBUaHJlZUpzUmVuZGVyZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRocmVlSnNSZW5kZXJlcjtcbiAgZnVuY3Rpb24gVGhyZWVKc1JlbmRlcmVyKG9wdHMsIGdzKXtcbiAgICB2YXIgYXJlbmEsIHdpZHRoLCBoZWlnaHQsIG5hbWUsIHJlZiQsIHBhcnQ7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICBhcmVuYSA9IGdzLmFyZW5hLCB3aWR0aCA9IGFyZW5hLndpZHRoLCBoZWlnaHQgPSBhcmVuYS5oZWlnaHQ7XG4gICAgbG9nKFwiUmVuZGVyZXI6Om5ld1wiKTtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFNjZW5lTWFuYWdlcih0aGlzLm9wdHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmcmFtZXNTaW5jZVJvd3NSZW1vdmVkOiAwLFxuICAgICAgbGFzdFNlZW5TdGF0ZTogJ25vLWdhbWUnXG4gICAgfTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmppdHRlciA9IG5ldyBUSFJFRS5PYmplY3QzRCk7XG4gICAgdGhpcy5wYXJ0cyA9IHtcbiAgICAgIHRhYmxlOiBuZXcgVGFibGUodGhpcy5vcHRzLCBncyksXG4gICAgICBsaWdodGluZzogbmV3IExpZ2h0aW5nKHRoaXMub3B0cywgZ3MpLFxuICAgICAgYXJlbmE6IG5ldyBBcmVuYSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIHN0YXJ0TWVudTogbmV3IFN0YXJ0TWVudSh0aGlzLm9wdHMsIGdzKSxcbiAgICAgIGZhaWxTY3JlZW46IG5ldyBGYWlsU2NyZWVuKHRoaXMub3B0cywgZ3MpLFxuICAgICAgbmV4dEJyaWNrOiBuZXcgQnJpY2tQcmV2aWV3KHRoaXMub3B0cywgZ3MpLFxuICAgICAgc2NvcmU6IG5ldyBOaXhpZURpc3BsYXkodGhpcy5vcHRzLCBncylcbiAgICB9O1xuICAgIGZvciAobmFtZSBpbiByZWYkID0gdGhpcy5wYXJ0cykge1xuICAgICAgcGFydCA9IHJlZiRbbmFtZV07XG4gICAgICBwYXJ0LmFkZFRvKHRoaXMuaml0dGVyKTtcbiAgICB9XG4gICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2sucm9vdC5wb3NpdGlvbi5zZXQoLXRoaXMub3B0cy5wcmV2aWV3RGlzdGFuY2VGcm9tQ2VudGVyLCAwLCAtdGhpcy5vcHRzLnByZXZpZXdEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0aGlzLnBhcnRzLmFyZW5hLnJvb3QucG9zaXRpb24uc2V0KDAsIDAsIC10aGlzLm9wdHMuYXJlbmFEaXN0YW5jZUZyb21FZGdlKTtcbiAgICB0aGlzLmFkZFRyYWNrYmFsbCgpO1xuICAgIHRoaXMuc2NlbmUuY29udHJvbHMucmVzZXRTZW5zb3IoKTtcbiAgICB0aGlzLnNjZW5lLnJlZ2lzdHJhdGlvbi5wb3NpdGlvbi5zZXQoMCwgLXRoaXMub3B0cy5jYW1lcmFFbGV2YXRpb24sIC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZSAqIDQpO1xuICAgIHRoaXMuc2NlbmUuc2hvd0hlbHBlcnMoKTtcbiAgfVxuICBwcm90b3R5cGUuYWRkVHJhY2tiYWxsID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgdHJhY2tiYWxsVGFyZ2V0O1xuICAgIHRyYWNrYmFsbFRhcmdldCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0cmFja2JhbGxUYXJnZXQucG9zaXRpb24ueiA9IC10aGlzLm9wdHMuY2FtZXJhRGlzdGFuY2VGcm9tRWRnZTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0cmFja2JhbGxUYXJnZXQpO1xuICAgIHRoaXMudHJhY2tiYWxsID0gbmV3IFRIUkVFLlRyYWNrYmFsbENvbnRyb2xzKHRoaXMuc2NlbmUuY2FtZXJhLCB0cmFja2JhbGxUYXJnZXQpO1xuICAgIHJldHVybiB0aGlzLnRyYWNrYmFsbC5wYW5TcGVlZCA9IDE7XG4gIH07XG4gIHByb3RvdHlwZS5hcHBlbmRUbyA9IGZ1bmN0aW9uKGhvc3Qpe1xuICAgIHJldHVybiBob3N0LmFwcGVuZENoaWxkKHRoaXMuc2NlbmUuZG9tRWxlbWVudCk7XG4gIH07XG4gIHByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihncyl7XG4gICAgdmFyIHJvd3MsIHA7XG4gICAgdGhpcy50cmFja2JhbGwudXBkYXRlKCk7XG4gICAgdGhpcy5zY2VuZS51cGRhdGUoKTtcbiAgICBpZiAoZ3MubWV0YWdhbWVTdGF0ZSAhPT0gdGhpcy5zdGF0ZS5sYXN0U2VlblN0YXRlKSB7XG4gICAgICB0aGlzLnBhcnRzLnN0YXJ0TWVudS52aXNpYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnBhcnRzLmFyZW5hLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHN3aXRjaCAoZ3MubWV0YWdhbWVTdGF0ZSkge1xuICAgICAgY2FzZSAncmVtb3ZlLWxpbmVzJzpcbiAgICAgICAgLy8gZmFsbHRocm91Z2hcbiAgICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgICB0aGlzLnBhcnRzLmFyZW5hLnZpc2libGUgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgICB0aGlzLnBhcnRzLnN0YXJ0TWVudS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoZ3MubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ25vLWdhbWUnOlxuICAgICAgbG9nKCduby1nYW1lJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcm93cyA9IGdzLnJvd3NUb1JlbW92ZS5sZW5ndGg7XG4gICAgICBwID0gZ3MudGltZXJzLnJlbW92YWxBbmltYXRpb24ucHJvZ3Jlc3M7XG4gICAgICBncy5zbG93ZG93biA9IDEgKyBFYXNlLmV4cEluKHAsIDEwLCAwKTtcbiAgICAgIHRoaXMucGFydHMuYXJlbmEuemFwTGluZXMoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncywgZ3MuZWxhcHNlZFRpbWUpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5ydW5Ub051bWJlcihncy50aW1lcnMucmVtb3ZhbEFuaW1hdGlvbi5wcm9ncmVzcywgZ3Muc2NvcmUucG9pbnRzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucHVsc2UoZ3MuZWxhcHNlZFRpbWUgLyAxMDAwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgZ3Muc2xvd2Rvd24gPSAxO1xuICAgICAgdGhpcy5wYXJ0cy5hcmVuYS51cGRhdGUoZ3MsIHRoaXMuaml0dGVyLnBvc2l0aW9uKTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlTaGFwZShncy5icmljay5uZXh0KTtcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLnVwZGF0ZVdpZ2dsZShncywgZ3MuZWxhcHNlZFRpbWUpO1xuICAgICAgdGhpcy5wYXJ0cy5zY29yZS5zZXROdW1iZXIoZ3Muc2NvcmUucG9pbnRzKTtcbiAgICAgIHRoaXMucGFydHMuc2NvcmUucHVsc2UoZ3MuZWxhcHNlZFRpbWUgLyAxMDAwKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0YXJ0LW1lbnUnOlxuICAgICAgdGhpcy5wYXJ0cy5uZXh0QnJpY2suZGlzcGxheU5vdGhpbmcoKTtcbiAgICAgIHRoaXMucGFydHMuc3RhcnRNZW51LnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXVzZS1tZW51JzpcbiAgICAgIHRoaXMucGFydHMubmV4dEJyaWNrLmRpc3BsYXlOb3RoaW5nKCk7XG4gICAgICB0aGlzLnBhcnRzLnBhdXNlTWVudS51cGRhdGUoZ3MpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICB0aGlzLnBhcnRzLm5leHRCcmljay5kaXNwbGF5Tm90aGluZygpO1xuICAgICAgdGhpcy5wYXJ0cy5mYWlsU2NyZWVuLnVwZGF0ZShncyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbG9nKFwiVGhyZWVKc1JlbmRlcmVyOjpyZW5kZXIgLSBVbmtub3duIG1ldGFnYW1lc3RhdGU6XCIsIGdzLm1ldGFnYW1lU3RhdGUpO1xuICAgIH1cbiAgICB0aGlzLnBhcnRzLmFyZW5hLnVwZGF0ZVBhcnRpY2xlcyhncyk7XG4gICAgdGhpcy5zdGF0ZS5sYXN0U2VlblN0YXRlID0gZ3MubWV0YWdhbWVTdGF0ZTtcbiAgICByZXR1cm4gdGhpcy5zY2VuZS5yZW5kZXIoKTtcbiAgfTtcbiAgcmV0dXJuIFRocmVlSnNSZW5kZXJlcjtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHNpbiwgUGFsZXR0ZSwgYXNzZXRQYXRoLCB0ZXh0dXJlcywgaSwgZ2xhc3MsIGNvcHBlciwgbml4aWVEaWdpdHMsIG5peGllQmcsIGJsb2NrcywgY29sb3IsIGhvbG9CbG9ja3MsIHphcCwgdGFibGVUb3AsIHRhYmxlRWRnZSwgdGFibGVGYWNlcywgbGluZXMsIGRlYnVnV2lyZWZyYW1lLCBoZWxwZXJBLCBoZWxwZXJCLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBzaW4gPSByZWYkLnNpbjtcblBhbGV0dGUgPSByZXF1aXJlKCcuL3BhbGV0dGUnKS5QYWxldHRlO1xuYXNzZXRQYXRoID0gKGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIFwiYXNzZXRzL1wiICsgaXQ7XG59KTtcbnRleHR1cmVzID0ge1xuICBuaXhpZURpZ2l0c0NvbG9yOiAoZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIHJlc3VsdHMkID0gW107XG4gICAgZm9yIChpJCA9IDA7IGkkIDw9IDk7ICsraSQpIHtcbiAgICAgIGkgPSBpJDtcbiAgICAgIHJlc3VsdHMkLnB1c2goVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJkaWdpdC1cIiArIGkgKyBcIi5jb2wucG5nXCIpKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzJDtcbiAgfSgpKSxcbiAgbml4aWVCZ0NvbG9yOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKGFzc2V0UGF0aChcImRpZ2l0LWJnLmNvbC5wbmdcIikpLFxuICBibG9ja1RpbGVOb3JtYWw6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwidGlsZS5ucm0ucG5nXCIpKSxcbiAgdGFibGVUb3BDb2xvcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5jb2wucG5nXCIpKSxcbiAgdGFibGVFZGdlQ29sb3I6IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoYXNzZXRQYXRoKFwiYm9hcmQtZi5jb2wucG5nXCIpKSxcbiAgdGFibGVUb3BTcGVjdWxhcjogVEhSRUUuSW1hZ2VVdGlscy5sb2FkVGV4dHVyZShhc3NldFBhdGgoXCJib2FyZC5zcGVjLnBuZ1wiKSlcbn07XG5vdXQkLmdsYXNzID0gZ2xhc3MgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBjb2xvcjogMHgyMjIyMjIsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gIHNoaW5pbmVzczogMTAwLFxuICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgZGVwdGhXcml0ZTogZmFsc2Vcbn0pO1xub3V0JC5jb3BwZXIgPSBjb3BwZXIgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBjb2xvcjogMHg5NjUxMTEsXG4gIHNwZWN1bGFyOiAweGNiNmQ1MSxcbiAgc2hpbmluZXNzOiAzMFxufSk7XG5vdXQkLm5peGllRGlnaXRzID0gbml4aWVEaWdpdHMgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMDsgaSQgPD0gOTsgKytpJCkge1xuICAgIGkgPSBpJDtcbiAgICByZXN1bHRzJC5wdXNoKG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gICAgICBtYXA6IHRleHR1cmVzLm5peGllRGlnaXRzQ29sb3JbaV0sXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGNvbG9yOiAweGZmMzMwMCxcbiAgICAgIGVtaXNzaXZlOiAweGZmYmIwMFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5uaXhpZUJnID0gbml4aWVCZyA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7XG4gIG1hcDogdGV4dHVyZXMubml4aWVCZ0NvbG9yLFxuICBjb2xvcjogMHgwMDAwMDAsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBzcGVjdWxhcjogMHhmZmZmZmYsXG4gIHNoaW5pbmVzczogODBcbn0pO1xub3V0JC5ibG9ja3MgPSBibG9ja3MgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gUGFsZXR0ZS50aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGkgPSBpJDtcbiAgICBjb2xvciA9IHJlZiRbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1ldGFsOiB0cnVlLFxuICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgc3BlY3VsYXI6IFBhbGV0dGUuc3BlY0NvbG9yc1tpXSxcbiAgICAgIHNoaW5pbmVzczogMTAwLFxuICAgICAgbm9ybWFsTWFwOiB0ZXh0dXJlcy5ibG9ja1RpbGVOb3JtYWxcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSgpKTtcbm91dCQuaG9sb0Jsb2NrcyA9IGhvbG9CbG9ja3MgPSAoZnVuY3Rpb24oKXtcbiAgdmFyIGkkLCByZWYkLCBsZW4kLCByZXN1bHRzJCA9IFtdO1xuICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gUGFsZXR0ZS50aWxlQ29sb3JzKS5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgIGkgPSBpJDtcbiAgICBjb2xvciA9IHJlZiRbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgIG1ldGFsOiB0cnVlLFxuICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICBlbWlzc2l2ZTogMHhmZmZmZmYsXG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgICBzcGVjdWxhcjogUGFsZXR0ZS5zcGVjQ29sb3JzW2ldLFxuICAgICAgc2hpbmluZXNzOiAxMDAsXG4gICAgICBub3JtYWxNYXA6IHRleHR1cmVzLmJsb2NrVGlsZU5vcm1hbFxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC56YXAgPSB6YXAgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBjb2xvcjogMHhmZmZmZmYsXG4gIGVtaXNzaXZlOiAweGZmZmZmZlxufSk7XG5vdXQkLnRhYmxlVG9wID0gdGFibGVUb3AgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoe1xuICBtYXA6IHRleHR1cmVzLnRhYmxlVG9wQ29sb3IsXG4gIHNwZWN1bGFyOiAweGZmZmZmZixcbiAgc3BlY3VsYXJNYXA6IHRleHR1cmVzLnRhYmxlVG9wU3BlY3VsYXIsXG4gIHNoaW5pbmVzczogMTAwXG59KTtcbm91dCQudGFibGVFZGdlID0gdGFibGVFZGdlID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgbWFwOiB0ZXh0dXJlcy50YWJsZUVkZ2VDb2xvclxufSk7XG5vdXQkLnRhYmxlRmFjZXMgPSB0YWJsZUZhY2VzID0gbmV3IFRIUkVFLk1lc2hGYWNlTWF0ZXJpYWwoW3RhYmxlRWRnZSwgdGFibGVFZGdlLCB0YWJsZVRvcCwgdGFibGVFZGdlLCB0YWJsZUVkZ2UsIHRhYmxlRWRnZV0pO1xub3V0JC5saW5lcyA9IGxpbmVzID0gKGZ1bmN0aW9uKCl7XG4gIHZhciBpJCwgcmVmJCwgbGVuJCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSAocmVmJCA9IFBhbGV0dGUudGlsZUNvbG9ycykubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICBjb2xvciA9IHJlZiRbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gobmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiBjb2xvclxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0cyQ7XG59KCkpO1xub3V0JC5kZWJ1Z1dpcmVmcmFtZSA9IGRlYnVnV2lyZWZyYW1lID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6ICd3aGl0ZScsXG4gIHdpcmVmcmFtZTogdHJ1ZVxufSk7XG5vdXQkLmhlbHBlckEgPSBoZWxwZXJBID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgY29sb3I6IDB4ZmYwMDAwLFxuICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgb3BhY2l0eTogMC41XG59KTtcbm91dCQuaGVscGVyQiA9IGhlbHBlckIgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICBjb2xvcjogMHgwMGZmMDAsXG4gIHRyYW5zcGFyZW50OiB0cnVlLFxuICBvcGFjaXR5OiAwLjVcbn0pOyIsInZhciBUSFJFRSwgcmVmJCwgbG9nLCBtYXAsIHBsdWNrLCBuZXV0cmFsLCByZWQsIG9yYW5nZSwgZ3JlZW4sIG1hZ2VudGEsIGJsdWUsIGJyb3duLCB5ZWxsb3csIGN5YW4sIGNvbG9yT3JkZXIsIHRpbGVDb2xvcnMsIHNwZWNDb2xvcnMsIFBhbGV0dGUsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgbG9nID0gcmVmJC5sb2csIG1hcCA9IHJlZiQubWFwLCBwbHVjayA9IHJlZiQucGx1Y2s7XG5vdXQkLm5ldXRyYWwgPSBuZXV0cmFsID0gWzB4ZmZmZmZmLCAweGNjY2NjYywgMHg4ODg4ODgsIDB4MjEyMTIxXTtcbm91dCQucmVkID0gcmVkID0gWzB4RkY0NDQ0LCAweEZGNzc3NywgMHhkZDQ0NDQsIDB4NTUxMTExXTtcbm91dCQub3JhbmdlID0gb3JhbmdlID0gWzB4RkZCQjMzLCAweEZGQ0M4OCwgMHhDQzg4MDAsIDB4NTUzMzAwXTtcbm91dCQuZ3JlZW4gPSBncmVlbiA9IFsweDQ0ZmY2NiwgMHg4OGZmYWEsIDB4MjJiYjMzLCAweDExNTUxMV07XG5vdXQkLm1hZ2VudGEgPSBtYWdlbnRhID0gWzB4ZmYzM2ZmLCAweGZmYWFmZiwgMHhiYjIyYmIsIDB4NTUxMTU1XTtcbm91dCQuYmx1ZSA9IGJsdWUgPSBbMHg2NmJiZmYsIDB4YWFkZGZmLCAweDU1ODhlZSwgMHgxMTExNTVdO1xub3V0JC5icm93biA9IGJyb3duID0gWzB4ZmZiYjMzLCAweGZmY2M4OCwgMHhiYjk5MDAsIDB4NTU1NTExXTtcbm91dCQueWVsbG93ID0geWVsbG93ID0gWzB4ZWVlZTExLCAweGZmZmZhYSwgMHhjY2JiMDAsIDB4NTU1NTExXTtcbm91dCQuY3lhbiA9IGN5YW4gPSBbMHg0NGRkZmYsIDB4YWFlM2ZmLCAweDAwYWFjYywgMHgwMDY2OTldO1xuY29sb3JPcmRlciA9IFtuZXV0cmFsLCByZWQsIG9yYW5nZSwgeWVsbG93LCBncmVlbiwgY3lhbiwgYmx1ZSwgbWFnZW50YV07XG5vdXQkLnRpbGVDb2xvcnMgPSB0aWxlQ29sb3JzID0gbWFwKHBsdWNrKDIpLCBjb2xvck9yZGVyKTtcbm91dCQuc3BlY0NvbG9ycyA9IHNwZWNDb2xvcnMgPSBtYXAocGx1Y2soMCksIGNvbG9yT3JkZXIpO1xub3V0JC5QYWxldHRlID0gUGFsZXR0ZSA9IHtcbiAgbmV1dHJhbDogbmV1dHJhbCxcbiAgcmVkOiByZWQsXG4gIG9yYW5nZTogb3JhbmdlLFxuICB5ZWxsb3c6IHllbGxvdyxcbiAgZ3JlZW46IGdyZWVuLFxuICBjeWFuOiBjeWFuLFxuICBibHVlOiBibHVlLFxuICBtYWdlbnRhOiBtYWdlbnRhLFxuICB0aWxlQ29sb3JzOiB0aWxlQ29sb3JzLFxuICBzcGVjQ29sb3JzOiBzcGVjQ29sb3JzXG59OyIsInZhciByZWYkLCBpZCwgbG9nLCBUSFJFRSwgTWF0ZXJpYWxzLCBTY2VuZU1hbmFnZXIsIG91dCQgPSB0eXBlb2YgZXhwb3J0cyAhPSAndW5kZWZpbmVkJyAmJiBleHBvcnRzIHx8IHRoaXM7XG5yZWYkID0gcmVxdWlyZSgnc3RkJyksIGlkID0gcmVmJC5pZCwgbG9nID0gcmVmJC5sb2c7XG5USFJFRSA9IHJlcXVpcmUoJ3RocmVlLWpzLXZyLWV4dGVuc2lvbnMnKTtcbk1hdGVyaWFscyA9IHJlcXVpcmUoJy4vbWF0cycpO1xuVEhSRUUuV2ViR0xSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyU3RlcmVvID0gZnVuY3Rpb24oc2NlbmUsIGNhbWVyYSwgcmVuZGVyVGFyZ2V0LCBmb3JjZUNsZWFyLCBzdGVyZW9UcmFuc2Zvcm1zLCBzdGVyZW9WaWV3cG9ydHMpe1xuICB2YXIgaSQsIGxlbiQsIGksIG0sIG1lLCB2LCB2eCwgdnksIHZ3LCB2aDtcbiAgaWYgKCFjYW1lcmEgaW5zdGFuY2VvZiBUSFJFRS5DYW1lcmEpIHtcbiAgICBUSFJFRS5lcnJvcignVEhSRUUuV2ViR0xSZW5kZXJlci5yZW5kZXJTdGVyZW8gLSBjYW1lcmEgaXMgbm90IGluc3RhbmNlIG9mIFRIUkVFLkNhbWVyYScpO1xuICAgIHJldHVybjtcbiAgfVxuICB1cGRhdGVFdmVyeXRoaW5nLmNhbGwodGhpcywgc2NlbmUsIGNhbWVyYSwgcmVuZGVyVGFyZ2V0LCBmb3JjZUNsZWFyKTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBzdGVyZW9UcmFuc2Zvcm1zLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgaSA9IGkkO1xuICAgIG0gPSBzdGVyZW9UcmFuc2Zvcm1zW2kkXTtcbiAgICBtZSA9IG0uZWxlbWVudHM7XG4gICAgY2FtZXJhLm1hdHJpeFdvcmxkLm11bHRpcGx5KG0pO1xuICAgIHYgPSBzdGVyZW9WaWV3cG9ydHNbaV07XG4gICAgdnggPSB2Lm1pbi54O1xuICAgIHZ5ID0gdi5taW4ueTtcbiAgICB2dyA9IHYubWF4LnggLSB2eDtcbiAgICB2aCA9IGMubWF4LnkgLSB2eTtcbiAgICB0aGlzLnNldFZpZXdwb3J0KHZ4LCB2eSwgdncsIHZoKTtcbiAgICB0aGlzLnNldFNjaXNzb3IodngsIHZ5LCB2dywgdmgpO1xuICAgIHJlbmRlckV2ZXJ5dGhpbmcuY2FsbCh0aGlzLCBzY2VuZSwgY2FtZXJhKTtcbiAgICBtZVsxMl0gKj0gLTE7XG4gICAgbWVbMTNdICo9IC0xO1xuICAgIG1lWzE0XSAqPSAtMTtcbiAgICBjYW1lcmEubWF0cml4V29ybGQubXVsdGlwbHkobSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMuZW5hYmxlU2Npc3NvclRlc3QoZmFsc2UpO1xufTtcbm91dCQuU2NlbmVNYW5hZ2VyID0gU2NlbmVNYW5hZ2VyID0gKGZ1bmN0aW9uKCl7XG4gIFNjZW5lTWFuYWdlci5kaXNwbGF5TmFtZSA9ICdTY2VuZU1hbmFnZXInO1xuICB2YXIgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyT3BhY2l0eSwgaGVscGVyTWFya2VyR2VvLCBwcm90b3R5cGUgPSBTY2VuZU1hbmFnZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFNjZW5lTWFuYWdlcjtcbiAgaGVscGVyTWFya2VyU2l6ZSA9IDAuMDI7XG4gIGhlbHBlck1hcmtlck9wYWNpdHkgPSAwLjM7XG4gIGhlbHBlck1hcmtlckdlbyA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSwgaGVscGVyTWFya2VyU2l6ZSk7XG4gIGZ1bmN0aW9uIFNjZW5lTWFuYWdlcihvcHRzKXtcbiAgICB2YXIgYXNwZWN0LCBmeFN0dWZmLCByZ2I7XG4gICAgdGhpcy5vcHRzID0gb3B0cztcbiAgICB0aGlzLnJlc2l6ZSA9IGJpbmQkKHRoaXMsICdyZXNpemUnLCBwcm90b3R5cGUpO1xuICAgIHRoaXMuemVyb1NlbnNvciA9IGJpbmQkKHRoaXMsICd6ZXJvU2Vuc29yJywgcHJvdG90eXBlKTtcbiAgICB0aGlzLmdvRnVsbHNjcmVlbiA9IGJpbmQkKHRoaXMsICdnb0Z1bGxzY3JlZW4nLCBwcm90b3R5cGUpO1xuICAgIGFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcih7XG4gICAgICBhbnRpYWxpYXM6IHRydWVcbiAgICB9KTtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIGFzcGVjdCwgMC4wMDEsIDEwMDApO1xuICAgIHRoaXMuY29udHJvbHMgPSBuZXcgVEhSRUUuVlJDb250cm9scyh0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy52ckVmZmVjdCA9IG5ldyBUSFJFRS5WUkVmZmVjdCh0aGlzLnJlbmRlcmVyKTtcbiAgICB0aGlzLnZyRWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGggLSAxLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuemVyb1NlbnNvciwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMucmVzaXplLCBmYWxzZSk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIHRoaXMuZ29GdWxsc2NyZWVuKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdnJNb2RlOiBuYXZpZ2F0b3IuZ2V0VlJEZXZpY2VzICE9IG51bGxcbiAgICB9O1xuICAgIHRoaXMucm9vdCA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnJlZ2lzdHJhdGlvbiA9IG5ldyBUSFJFRS5PYmplY3QzRDtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLnJvb3QpO1xuICAgIHRoaXMucm9vdC5hZGQodGhpcy5yZWdpc3RyYXRpb24pO1xuICAgIGZ4U3R1ZmYgPSByZXF1aXJlKCcuLi8uLi90ZW1wJyk7XG4gICAgdGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3Nlcih0aGlzLnJlbmRlcmVyKTtcbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MobmV3IFRIUkVFLlN0ZXJlb1JlbmRlclBhc3ModGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpKTtcbiAgICByZ2IgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyhUSFJFRS5SR0JTaGlmdFNoYWRlcik7XG4gICAgcmdiLnVuaWZvcm1zLmFtb3VudC52YWx1ZSA9IDAuMDA0O1xuICAgIHJnYi5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG4gICAgdGhpcy5jb21wb3Nlci5hZGRQYXNzKHJnYik7XG4gICAgdGhpcy5kb250ID0gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09ICcjZG9udCc7XG4gIH1cbiAgcHJvdG90eXBlLmFkZFJlZ2lzdHJhdGlvbkhlbHBlciA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yb290LmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJBKSk7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cmF0aW9uLmFkZChuZXcgVEhSRUUuTWVzaChoZWxwZXJNYXJrZXJHZW8sIE1hdGVyaWFscy5oZWxwZXJCKSk7XG4gIH07XG4gIHByb3RvdHlwZS5zaG93SGVscGVycyA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGdyaWQsIGF4aXMsIHJvb3RBeGlzO1xuICAgIGdyaWQgPSBuZXcgVEhSRUUuR3JpZEhlbHBlcigxMCwgMC4xKTtcbiAgICBheGlzID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoMSk7XG4gICAgcm9vdEF4aXMgPSBuZXcgVEhSRUUuQXhpc0hlbHBlcigwLjUpO1xuICAgIGF4aXMucG9zaXRpb24ueiA9IHRoaXMucmVnaXN0cmF0aW9uLnBvc2l0aW9uLno7XG4gICAgcmV0dXJuIHJvb3RBeGlzLnBvc2l0aW9uLnogPSB0aGlzLnJvb3QucG9zaXRpb24uejtcbiAgfTtcbiAgcHJvdG90eXBlLmVuYWJsZVNoYWRvd0Nhc3RpbmcgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwU29mdCA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dNYXBFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd0NhbWVyYUZhciA9IDEwMDA7XG4gICAgdGhpcy5yZW5kZXJlci5zaGFkb3dDYW1lcmFGb3YgPSA1MDtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd0NhbWVyYU5lYXIgPSAzO1xuICAgIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwQmlhcyA9IDAuMDAzOTtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcFdpZHRoID0gMTAyNDtcbiAgICB0aGlzLnJlbmRlcmVyLnNoYWRvd01hcEhlaWdodCA9IDEwMjQ7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuc2hhZG93TWFwRGFya25lc3MgPSAwLjU7XG4gIH07XG4gIHByb3RvdHlwZS5nb0Z1bGxzY3JlZW4gPSBmdW5jdGlvbigpe1xuICAgIGxvZygnU3RhcnRpbmcgZnVsbHNjcmVlbi4uLicpO1xuICAgIHJldHVybiB0aGlzLnZyRWZmZWN0LnNldEZ1bGxTY3JlZW4odHJ1ZSk7XG4gIH07XG4gIHByb3RvdHlwZS56ZXJvU2Vuc29yID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgIHZhciBrZXlDb2RlO1xuICAgIGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKGtleUNvZGUgPT09IDg2KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250cm9scy5yZXNldFNlbnNvcigpO1xuICAgIH1cbiAgfTtcbiAgcHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIHJldHVybiB0aGlzLnZyRWZmZWN0LnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gIH07XG4gIHByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzLmNvbnRyb2xzLnVwZGF0ZSgpO1xuICB9O1xuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKXtcbiAgICBpZiAodGhpcy5kb250KSB7XG4gICAgICByZXR1cm4gdGhpcy52ckVmZmVjdC5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb3Nlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIH1cbiAgfTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvdHlwZSwgJ2RvbUVsZW1lbnQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBwcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaSQsIGxlbiQsIG9iaiwgdGhhdCwgcmVzdWx0cyQgPSBbXTtcbiAgICBmb3IgKGkkID0gMCwgbGVuJCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgb2JqID0gYXJndW1lbnRzW2kkXTtcbiAgICAgIGxvZygnU2NlbmVNYW5hZ2VyOjphZGQgLScsIG9iaik7XG4gICAgICByZXN1bHRzJC5wdXNoKHRoaXMucmVnaXN0cmF0aW9uLmFkZCgodGhhdCA9IG9iai5yb290KSAhPSBudWxsID8gdGhhdCA6IG9iaikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cyQ7XG4gIH07XG4gIHJldHVybiBTY2VuZU1hbmFnZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59IiwidmFyIHBvdywgcXVhZEluLCBxdWFkT3V0LCBjdWJpY0luLCBjdWJpY091dCwgcXVhcnRJbiwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50T3V0LCBleHBJbiwgZXhwT3V0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucG93ID0gcmVxdWlyZSgnc3RkJykucG93O1xub3V0JC5xdWFkSW4gPSBxdWFkSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHQgKiB0ICsgYjtcbn07XG5vdXQkLnF1YWRPdXQgPSBxdWFkT3V0ID0gZnVuY3Rpb24odCwgYiwgZSwgYyl7XG4gIGMgPT0gbnVsbCAmJiAoYyA9IGUgLSBiKTtcbiAgcmV0dXJuIC1jICogdCAqICh0IC0gMikgKyBiO1xufTtcbm91dCQuY3ViaWNJbiA9IGN1YmljSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIE1hdGgucG93KHQsIDMpICsgYjtcbn07XG5vdXQkLmN1YmljT3V0ID0gY3ViaWNPdXQgPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIChNYXRoLnBvdyh0IC0gMSwgMykgKyAxKSArIGI7XG59O1xub3V0JC5xdWFydEluID0gcXVhcnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNCkgKyBiO1xufTtcbm91dCQucXVhcnRPdXQgPSBxdWFydE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiAtYyAqIChNYXRoLnBvdyh0IC0gMSwgNCkgLSAxKSArIGI7XG59O1xub3V0JC5xdWludEluID0gcXVpbnRJbiA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogTWF0aC5wb3codCwgNSkgKyBiO1xufTtcbm91dCQucXVpbnRPdXQgPSBxdWludE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKE1hdGgucG93KHQgLSAxLCA1KSArIDEpICsgYjtcbn07XG5vdXQkLmV4cEluID0gZXhwSW4gPSBmdW5jdGlvbih0LCBiLCBlLCBjKXtcbiAgYyA9PSBudWxsICYmIChjID0gZSAtIGIpO1xuICByZXR1cm4gYyAqIHBvdygyLCAxMCAqICh0IC0gMSkpICsgYjtcbn07XG5vdXQkLmV4cE91dCA9IGV4cE91dCA9IGZ1bmN0aW9uKHQsIGIsIGUsIGMpe1xuICBjID09IG51bGwgJiYgKGMgPSBlIC0gYik7XG4gIHJldHVybiBjICogKCgtcG93KDIsIC0xMCAqIHQpKSArIDEpICsgYjtcbn07IiwidmFyIGlkLCBsb2csIGZsaXAsIGRlbGF5LCBmbG9vciwgcmFuZG9tLCByYW5kLCByYW5kSW50LCByYW5kb21Gcm9tLCBhZGRWMiwgZmlsdGVyLCBwbHVjaywgcGksIHRhdSwgcG93LCBzaW4sIGNvcywgbWluLCBtYXgsIGxlcnAsIG1hcCwgc3BsaXQsIGpvaW4sIHVubGluZXMsIGRpdiwgd3JhcCwgbGltaXQsIHJhZiwgdGhhdCwgRWFzZSwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbm91dCQuaWQgPSBpZCA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0O1xufTtcbm91dCQubG9nID0gbG9nID0gZnVuY3Rpb24oKXtcbiAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcbiAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbn07XG5vdXQkLmZsaXAgPSBmbGlwID0gZnVuY3Rpb24ozrspe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIM67KGIsIGEpO1xuICB9O1xufTtcbm91dCQuZGVsYXkgPSBkZWxheSA9IGZsaXAoc2V0VGltZW91dCk7XG5vdXQkLmZsb29yID0gZmxvb3IgPSBNYXRoLmZsb29yO1xub3V0JC5yYW5kb20gPSByYW5kb20gPSBNYXRoLnJhbmRvbTtcbm91dCQucmFuZCA9IHJhbmQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyByYW5kb20oKSAqIChtYXggLSBtaW4pO1xufTtcbm91dCQucmFuZEludCA9IHJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCl7XG4gIHJldHVybiBtaW4gKyBmbG9vcihyYW5kb20oKSAqIChtYXggLSBtaW4pKTtcbn07XG5vdXQkLnJhbmRvbUZyb20gPSByYW5kb21Gcm9tID0gZnVuY3Rpb24obGlzdCl7XG4gIHJldHVybiBsaXN0W3JhbmQoMCwgbGlzdC5sZW5ndGggLSAxKV07XG59O1xub3V0JC5hZGRWMiA9IGFkZFYyID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBbYVswXSArIGJbMF0sIGFbMV0gKyBiWzFdXTtcbn07XG5vdXQkLmZpbHRlciA9IGZpbHRlciA9IGN1cnJ5JChmdW5jdGlvbijOuywgbGlzdCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsaXN0Lmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxpc3RbaSRdO1xuICAgIGlmICjOuyh4KSkge1xuICAgICAgcmVzdWx0cyQucHVzaCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHMkO1xufSk7XG5vdXQkLnBsdWNrID0gcGx1Y2sgPSBjdXJyeSQoZnVuY3Rpb24ocCwgbyl7XG4gIHJldHVybiBvW3BdO1xufSk7XG5vdXQkLnBpID0gcGkgPSBNYXRoLlBJO1xub3V0JC50YXUgPSB0YXUgPSBwaSAqIDI7XG5vdXQkLnBvdyA9IHBvdyA9IE1hdGgucG93O1xub3V0JC5zaW4gPSBzaW4gPSBNYXRoLnNpbjtcbm91dCQuY29zID0gY29zID0gTWF0aC5jb3M7XG5vdXQkLm1pbiA9IG1pbiA9IE1hdGgubWluO1xub3V0JC5tYXggPSBtYXggPSBNYXRoLm1heDtcbm91dCQubGVycCA9IGxlcnAgPSBjdXJyeSQoZnVuY3Rpb24obWluLCBtYXgsIHApe1xuICByZXR1cm4gbWluICsgcCAqIChtYXggLSBtaW4pO1xufSk7XG5vdXQkLm1hcCA9IG1hcCA9IGN1cnJ5JChmdW5jdGlvbijOuywgbCl7XG4gIHZhciBpJCwgbGVuJCwgeCwgcmVzdWx0cyQgPSBbXTtcbiAgZm9yIChpJCA9IDAsIGxlbiQgPSBsLmxlbmd0aDsgaSQgPCBsZW4kOyArK2kkKSB7XG4gICAgeCA9IGxbaSRdO1xuICAgIHJlc3VsdHMkLnB1c2gozrsoeCkpO1xuICB9XG4gIHJldHVybiByZXN1bHRzJDtcbn0pO1xub3V0JC5zcGxpdCA9IHNwbGl0ID0gY3VycnkkKGZ1bmN0aW9uKGNoYXIsIHN0cil7XG4gIHJldHVybiBzdHIuc3BsaXQoY2hhcik7XG59KTtcbm91dCQuam9pbiA9IGpvaW4gPSBjdXJyeSQoZnVuY3Rpb24oY2hhciwgc3RyKXtcbiAgcmV0dXJuIHN0ci5qb2luKGNoYXIpO1xufSk7XG5vdXQkLnVubGluZXMgPSB1bmxpbmVzID0gam9pbihcIlxcblwiKTtcbm91dCQuZGl2ID0gZGl2ID0gY3VycnkkKGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gZmxvb3IoYSAvIGIpO1xufSk7XG5vdXQkLndyYXAgPSB3cmFwID0gY3VycnkkKGZ1bmN0aW9uKG1pbiwgbWF4LCBuKXtcbiAgaWYgKG4gPiBtYXgpIHtcbiAgICByZXR1cm4gbWluO1xuICB9IGVsc2UgaWYgKG4gPCBtaW4pIHtcbiAgICByZXR1cm4gbWF4O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuO1xuICB9XG59KTtcbm91dCQubGltaXQgPSBsaW1pdCA9IGN1cnJ5JChmdW5jdGlvbihtaW4sIG1heCwgbil7XG4gIGlmIChuID4gbWF4KSB7XG4gICAgcmV0dXJuIG1heDtcbiAgfSBlbHNlIGlmIChuIDwgbWluKSB7XG4gICAgcmV0dXJuIG1pbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbjtcbiAgfVxufSk7XG5vdXQkLnJhZiA9IHJhZiA9ICh0aGF0ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICA/IHRoYXRcbiAgOiAodGhhdCA9IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpICE9IG51bGxcbiAgICA/IHRoYXRcbiAgICA6ICh0aGF0ID0gd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSkgIT0gbnVsbFxuICAgICAgPyB0aGF0XG4gICAgICA6IGZ1bmN0aW9uKM67KXtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQozrssIDEwMDAgLyA2MCk7XG4gICAgICB9O1xub3V0JC5FYXNlID0gRWFzZSA9IHJlcXVpcmUoJy4vZWFzaW5nJyk7XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgdW5saW5lcywgdGVtcGxhdGUsIERlYnVnT3V0cHV0LCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCB1bmxpbmVzID0gcmVmJC51bmxpbmVzO1xudGVtcGxhdGUgPSB7XG4gIGNlbGw6IGZ1bmN0aW9uKGl0KXtcbiAgICBpZiAoaXQpIHtcbiAgICAgIHJldHVybiBcIuKWkuKWklwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIgIFwiO1xuICAgIH1cbiAgfSxcbiAgc2NvcmU6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMsIG51bGwsIDIpO1xuICB9LFxuICBicmljazogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zaGFwZS5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0Lm1hcCh0ZW1wbGF0ZS5jZWxsKS5qb2luKCcgJyk7XG4gICAgfSkuam9pbihcIlxcbiAgICAgICAgXCIpO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpe1xuICAgIHZhciBpJCwgbGVuJCwga2V5U3VtbWFyeSwgcmVzdWx0cyQgPSBbXTtcbiAgICBpZiAodGhpcy5sZW5ndGgpIHtcbiAgICAgIGZvciAoaSQgPSAwLCBsZW4kID0gdGhpcy5sZW5ndGg7IGkkIDwgbGVuJDsgKytpJCkge1xuICAgICAgICBrZXlTdW1tYXJ5ID0gdGhpc1tpJF07XG4gICAgICAgIHJlc3VsdHMkLnB1c2goa2V5U3VtbWFyeS5rZXkgKyAnLScgKyBrZXlTdW1tYXJ5LmFjdGlvbiArIFwifFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzJDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiKG5vIGNoYW5nZSlcIjtcbiAgICB9XG4gIH0sXG4gIG5vcm1hbDogZnVuY3Rpb24oKXtcbiAgICB2YXIgZnBzQ29sb3I7XG4gICAgZnBzQ29sb3IgPSB0aGlzLmZwcyA+PSA1NVxuICAgICAgPyAnIzBmMCdcbiAgICAgIDogdGhpcy5mcHMgPj0gMzAgPyAnI2ZmMCcgOiAnI2YwMCc7XG4gICAgcmV0dXJuIFwic2NvcmUgLSBcIiArIHRlbXBsYXRlLnNjb3JlLmFwcGx5KHRoaXMuc2NvcmUpICsgXCJcXG5saW5lcyAtIFwiICsgdGhpcy5saW5lcyArIFwiXFxuXFxuIG1ldGEgLSBcIiArIHRoaXMubWV0YWdhbWVTdGF0ZSArIFwiXFxuIHRpbWUgLSBcIiArIHRoaXMuZWxhcHNlZFRpbWUgKyBcIlxcbmZyYW1lIC0gXCIgKyB0aGlzLmVsYXBzZWRGcmFtZXMgKyBcIlxcbiAgZnBzIC0gPHNwYW4gc3R5bGU9XFxcImNvbG9yOlwiICsgZnBzQ29sb3IgKyBcIlxcXCI+XCIgKyB0aGlzLmZwcyArIFwiPC9zcGFuPlxcbiBrZXlzIC0gXCIgKyB0ZW1wbGF0ZS5rZXlzLmFwcGx5KHRoaXMuaW5wdXRTdGF0ZSkgKyBcIlxcbiBkcm9wIC0gXCIgKyAodGhpcy5mb3JjZURvd25Nb2RlID8gJ3NvZnQnIDogJ2F1dG8nKTtcbiAgfSxcbiAgbWVudUl0ZW1zOiBmdW5jdGlvbigpe1xuICAgIHZhciBpeCwgaXRlbTtcbiAgICByZXR1cm4gXCJcIiArIHVubGluZXMoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgaSQsIHJlZiQsIGxlbiQsIHJlc3VsdHMkID0gW107XG4gICAgICBmb3IgKGkkID0gMCwgbGVuJCA9IChyZWYkID0gdGhpcy5tZW51RGF0YSkubGVuZ3RoOyBpJCA8IGxlbiQ7ICsraSQpIHtcbiAgICAgICAgaXggPSBpJDtcbiAgICAgICAgaXRlbSA9IHJlZiRbaSRdO1xuICAgICAgICByZXN1bHRzJC5wdXNoKHRlbXBsYXRlLm1lbnVJdGVtLmNhbGwoaXRlbSwgaXgsIHRoaXMuY3VycmVudEluZGV4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH0sXG4gIHN0YXJ0TWVudTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJTVEFSVCBNRU5VXFxuXCIgKyB0ZW1wbGF0ZS5tZW51SXRlbXMuYXBwbHkodGhpcyk7XG4gIH0sXG4gIG1lbnVJdGVtOiBmdW5jdGlvbihpbmRleCwgY3VycmVudEluZGV4KXtcbiAgICByZXR1cm4gXCJcIiArIChpbmRleCA9PT0gY3VycmVudEluZGV4ID8gXCI+XCIgOiBcIiBcIikgKyBcIiBcIiArIHRoaXMudGV4dDtcbiAgfSxcbiAgZmFpbHVyZTogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCIgICBHQU1FIE9WRVJcXG5cXG4gICAgIFNjb3JlXFxuXFxuICBTaW5nbGUgLSBcIiArIHRoaXMuc2NvcmUuc2luZ2xlcyArIFwiXFxuICBEb3VibGUgLSBcIiArIHRoaXMuc2NvcmUuZG91YmxlcyArIFwiXFxuICBUcmlwbGUgLSBcIiArIHRoaXMuc2NvcmUudHJpcGxlcyArIFwiXFxuICBUZXRyaXMgLSBcIiArIHRoaXMuc2NvcmUudGV0cmlzICsgXCJcXG5cXG5Ub3RhbCBMaW5lczogXCIgKyB0aGlzLnNjb3JlLmxpbmVzICsgXCJcXG5cXG5cIiArIHRlbXBsYXRlLm1lbnVJdGVtcy5hcHBseSh0aGlzLmZhaWxNZW51U3RhdGUpO1xuICB9XG59O1xub3V0JC5EZWJ1Z091dHB1dCA9IERlYnVnT3V0cHV0ID0gKGZ1bmN0aW9uKCl7XG4gIERlYnVnT3V0cHV0LmRpc3BsYXlOYW1lID0gJ0RlYnVnT3V0cHV0JztcbiAgdmFyIHByb3RvdHlwZSA9IERlYnVnT3V0cHV0LnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBEZWJ1Z091dHB1dDtcbiAgZnVuY3Rpb24gRGVidWdPdXRwdXQoKXtcbiAgICB2YXIgcmVmJDtcbiAgICB0aGlzLmRibyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kYm8pO1xuICAgIHJlZiQgPSB0aGlzLmRiby5zdHlsZTtcbiAgICByZWYkLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICByZWYkLnRvcCA9IDA7XG4gICAgcmVmJC5sZWZ0ID0gMDtcbiAgfVxuICBwcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oc3RhdGUpe1xuICAgIHN3aXRjaCAoc3RhdGUubWV0YWdhbWVTdGF0ZSkge1xuICAgIGNhc2UgJ2dhbWUnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgY2FzZSAnZmFpbHVyZSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUuZmFpbHVyZS5hcHBseShzdGF0ZSk7XG4gICAgY2FzZSAnc3RhcnQtbWVudSc6XG4gICAgICByZXR1cm4gdGhpcy5kYm8uaW5uZXJIVE1MID0gdGVtcGxhdGUuc3RhcnRNZW51LmFwcGx5KHN0YXRlLnN0YXJ0TWVudVN0YXRlKTtcbiAgICBjYXNlICdyZW1vdmUtbGluZXMnOlxuICAgICAgcmV0dXJuIHRoaXMuZGJvLmlubmVySFRNTCA9IHRlbXBsYXRlLm5vcm1hbC5hcHBseShzdGF0ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB0aGlzLmRiby5pbm5lckhUTUwgPSBcIlVua25vd24gbWV0YWdhbWUgc3RhdGU6IFwiICsgc3RhdGUubWV0YWdhbWVTdGF0ZTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBEZWJ1Z091dHB1dDtcbn0oKSk7IiwidmFyIHJlZiQsIGlkLCBsb2csIHJhZiwgZmxvb3IsIEZyYW1lRHJpdmVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYWYgPSByZWYkLnJhZiwgZmxvb3IgPSByZWYkLmZsb29yO1xub3V0JC5GcmFtZURyaXZlciA9IEZyYW1lRHJpdmVyID0gKGZ1bmN0aW9uKCl7XG4gIEZyYW1lRHJpdmVyLmRpc3BsYXlOYW1lID0gJ0ZyYW1lRHJpdmVyJztcbiAgdmFyIGZwc0hpc3RvcnlXaW5kb3csIHByb3RvdHlwZSA9IEZyYW1lRHJpdmVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBGcmFtZURyaXZlcjtcbiAgZnBzSGlzdG9yeVdpbmRvdyA9IDIwO1xuICBmdW5jdGlvbiBGcmFtZURyaXZlcihvbkZyYW1lKXtcbiAgICB0aGlzLm9uRnJhbWUgPSBvbkZyYW1lO1xuICAgIHRoaXMuZnJhbWUgPSBiaW5kJCh0aGlzLCAnZnJhbWUnLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpuZXdcIik7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHplcm86IDAsXG4gICAgICB0aW1lOiAwLFxuICAgICAgZnJhbWU6IDAsXG4gICAgICBydW5uaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5mcHMgPSAwO1xuICAgIHRoaXMuZnBzSGlzdG9yeSA9IHJlcGVhdEFycmF5JChbMF0sIGZwc0hpc3RvcnlXaW5kb3cpO1xuICB9XG4gIHByb3RvdHlwZS5mcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIG5vdywgzpR0O1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcpIHtcbiAgICAgIHJhZih0aGlzLmZyYW1lKTtcbiAgICB9XG4gICAgbm93ID0gRGF0ZS5ub3coKSAtIHRoaXMuc3RhdGUuemVybztcbiAgICDOlHQgPSBub3cgLSB0aGlzLnN0YXRlLnRpbWU7XG4gICAgdGhpcy5wdXNoSGlzdG9yeSjOlHQpO1xuICAgIHRoaXMuc3RhdGUudGltZSA9IG5vdztcbiAgICB0aGlzLnN0YXRlLmZyYW1lID0gdGhpcy5zdGF0ZS5mcmFtZSArIDE7XG4gICAgdGhpcy5zdGF0ZS7OlHQgPSDOlHQ7XG4gICAgcmV0dXJuIHRoaXMub25GcmFtZSjOlHQsIHRoaXMuc3RhdGUudGltZSwgdGhpcy5zdGF0ZS5mcmFtZSwgdGhpcy5mcHMpO1xuICB9O1xuICBwcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IHRydWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nKFwiRnJhbWVEcml2ZXI6OlN0YXJ0IC0gc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zdGF0ZS56ZXJvID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnN0YXRlLnRpbWUgPSAwO1xuICAgIHRoaXMuc3RhdGUucnVubmluZyA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUoKTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLnN0YXRlLnJ1bm5pbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvZyhcIkZyYW1lRHJpdmVyOjpTdG9wIC0gc3RvcHBpbmdcIik7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucnVubmluZyA9IGZhbHNlO1xuICB9O1xuICBwcm90b3R5cGUucHVzaEhpc3RvcnkgPSBmdW5jdGlvbijOlHQpe1xuICAgIHRoaXMuZnBzSGlzdG9yeS5wdXNoKM6UdCk7XG4gICAgdGhpcy5mcHNIaXN0b3J5LnNoaWZ0KCk7XG4gICAgcmV0dXJuIHRoaXMuZnBzID0gZmxvb3IoMTAwMCAqIGZwc0hpc3RvcnlXaW5kb3cgLyB0aGlzLmZwc0hpc3RvcnkucmVkdWNlKGN1cnJ5JChmdW5jdGlvbih4JCwgeSQpe1xuICAgICAgcmV0dXJuIHgkICsgeSQ7XG4gICAgfSksIDApKTtcbiAgfTtcbiAgcmV0dXJuIEZyYW1lRHJpdmVyO1xufSgpKTtcbmZ1bmN0aW9uIGJpbmQkKG9iaiwga2V5LCB0YXJnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuICh0YXJnZXQgfHwgb2JqKVtrZXldLmFwcGx5KG9iaiwgYXJndW1lbnRzKSB9O1xufVxuZnVuY3Rpb24gcmVwZWF0QXJyYXkkKGFyciwgbil7XG4gIGZvciAodmFyIHIgPSBbXTsgbiA+IDA7IChuID4+PSAxKSAmJiAoYXJyID0gYXJyLmNvbmNhdChhcnIpKSlcbiAgICBpZiAobiAmIDEpIHIucHVzaC5hcHBseShyLCBhcnIpO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCByYW5kLCBUaW1lciwgR2FtZVN0YXRlLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCByYW5kID0gcmVmJC5yYW5kO1xuVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJykuVGltZXI7XG5vdXQkLkdhbWVTdGF0ZSA9IEdhbWVTdGF0ZSA9IChmdW5jdGlvbigpe1xuICBHYW1lU3RhdGUuZGlzcGxheU5hbWUgPSAnR2FtZVN0YXRlJztcbiAgdmFyIGRlZmF1bHRzLCBwcm90b3R5cGUgPSBHYW1lU3RhdGUucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IEdhbWVTdGF0ZTtcbiAgZGVmYXVsdHMgPSB7XG4gICAgbWV0YWdhbWVTdGF0ZTogJ25vLWdhbWUnLFxuICAgIGlucHV0U3RhdGU6IFtdLFxuICAgIGZvcmNlRG93bk1vZGU6IGZhbHNlLFxuICAgIGVsYXBzZWRUaW1lOiAwLFxuICAgIGVsYXBzZWRGcmFtZXM6IDAsXG4gICAgcm93c1RvUmVtb3ZlOiBbXSxcbiAgICBzbG93ZG93bjogMSxcbiAgICBmbGFnczoge1xuICAgICAgcm93c1JlbW92ZWRUaGlzRnJhbWU6IGZhbHNlXG4gICAgfSxcbiAgICBzY29yZToge1xuICAgICAgcG9pbnRzOiAwLFxuICAgICAgbGluZXM6IDAsXG4gICAgICBzaW5nbGVzOiAwLFxuICAgICAgZG91YmxlczogMCxcbiAgICAgIHRyaXBsZXM6IDAsXG4gICAgICB0ZXRyaXM6IDBcbiAgICB9LFxuICAgIGJyaWNrOiB7XG4gICAgICBuZXh0OiB2b2lkIDgsXG4gICAgICBjdXJyZW50OiB2b2lkIDhcbiAgICB9LFxuICAgIHRpbWVyczoge1xuICAgICAgZHJvcFRpbWVyOiBudWxsLFxuICAgICAgZm9yY2VEcm9wV2FpdFRpZW1yOiBudWxsLFxuICAgICAga2V5UmVwZWF0VGltZXI6IG51bGwsXG4gICAgICByZW1vdmFsQW5pbWF0aW9uOiBudWxsLFxuICAgICAgdGl0bGVSZXZlYWxUaW1lcjogbnVsbCxcbiAgICAgIGZhaWx1cmVSZXZlYWxUaW1lcjogbnVsbFxuICAgIH0sXG4gICAgb3B0aW9uczoge1xuICAgICAgdGlsZVdpZHRoOiAxMCxcbiAgICAgIHRpbGVIZWlnaHQ6IDE4LFxuICAgICAgdGlsZVNpemU6IDIwLFxuICAgICAgaGFyZERyb3BKb2x0QW1vdW50OiAwLjM1LFxuICAgICAgZHJvcFNwZWVkOiAzMDAsXG4gICAgICBmb3JjZURyb3BXYWl0VGltZTogMTAwLFxuICAgICAgcmVtb3ZhbEFuaW1hdGlvblRpbWU6IDUwMCxcbiAgICAgIGhhcmREcm9wRWZmZWN0VGltZTogMTAwLFxuICAgICAga2V5UmVwZWF0VGltZTogMTAwLFxuICAgICAgdGl0bGVSZXZlYWxUaW1lOiA0MDAwXG4gICAgfSxcbiAgICBhcmVuYToge1xuICAgICAgY2VsbHM6IFtbXV0sXG4gICAgICB3aWR0aDogMCxcbiAgICAgIGhlaWdodDogMFxuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gR2FtZVN0YXRlKG9wdGlvbnMpe1xuICAgIGltcG9ydCQodGhpcywgZGVmYXVsdHMpO1xuICAgIGltcG9ydCQodGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICB0aGlzLnRpbWVycy5kcm9wVGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmRyb3BTcGVlZCk7XG4gICAgdGhpcy50aW1lcnMuZm9yY2VEcm9wV2FpdFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy5mb3JjZURyb3BXYWl0VGltZSk7XG4gICAgdGhpcy50aW1lcnMua2V5UmVwZWF0VGltZXIgPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLmtleVJlcGVhdFRpbWUpO1xuICAgIHRoaXMudGltZXJzLnJlbW92YWxBbmltYXRpb24gPSBuZXcgVGltZXIodGhpcy5vcHRpb25zLnJlbW92YWxBbmltYXRpb25UaW1lKTtcbiAgICB0aGlzLnRpbWVycy5oYXJkRHJvcEVmZmVjdCA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMuaGFyZERyb3BFZmZlY3RUaW1lKTtcbiAgICB0aGlzLnRpbWVycy50aXRsZVJldmVhbFRpbWVyID0gbmV3IFRpbWVyKHRoaXMub3B0aW9ucy50aXRsZVJldmVhbFRpbWUpO1xuICAgIHRoaXMudGltZXJzLmZhaWx1cmVSZXZlYWxUaW1lciA9IG5ldyBUaW1lcih0aGlzLm9wdGlvbnMudGl0bGVSZXZlYWxUaW1lKTtcbiAgICB0aGlzLmFyZW5hID0gY29uc3RydWN0b3IubmV3QXJlbmEodGhpcy5vcHRpb25zLnRpbGVXaWR0aCwgdGhpcy5vcHRpb25zLnRpbGVIZWlnaHQpO1xuICAgIHRoaXMudGltZXJzLmhhcmREcm9wRWZmZWN0LmV4cGlyZSgpO1xuICB9XG4gIEdhbWVTdGF0ZS5uZXdBcmVuYSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpe1xuICAgIHZhciByb3csIGNlbGw7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNlbGxzOiAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGkkLCB0byQsIGxyZXN1bHQkLCBqJCwgdG8xJCwgcmVzdWx0cyQgPSBbXTtcbiAgICAgICAgZm9yIChpJCA9IDAsIHRvJCA9IGhlaWdodDsgaSQgPCB0byQ7ICsraSQpIHtcbiAgICAgICAgICByb3cgPSBpJDtcbiAgICAgICAgICBscmVzdWx0JCA9IFtdO1xuICAgICAgICAgIGZvciAoaiQgPSAwLCB0bzEkID0gd2lkdGg7IGokIDwgdG8xJDsgKytqJCkge1xuICAgICAgICAgICAgY2VsbCA9IGokO1xuICAgICAgICAgICAgbHJlc3VsdCQucHVzaCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChscmVzdWx0JCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHMkO1xuICAgICAgfSgpKSxcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIEdhbWVTdGF0ZTtcbn0oKSk7XG5mdW5jdGlvbiBpbXBvcnQkKG9iaiwgc3JjKXtcbiAgdmFyIG93biA9IHt9Lmhhc093blByb3BlcnR5O1xuICBmb3IgKHZhciBrZXkgaW4gc3JjKSBpZiAob3duLmNhbGwoc3JjLCBrZXkpKSBvYmpba2V5XSA9IHNyY1trZXldO1xuICByZXR1cm4gb2JqO1xufSIsInZhciByZWYkLCBpZCwgbG9nLCBmaWx0ZXIsIFRpbWVyLCBrZXlSZXBlYXRUaW1lLCBLRVksIEFDVElPTl9OQU1FLCBldmVudFN1bW1hcnksIG5ld0JsYW5rS2V5c3RhdGUsIElucHV0SGFuZGxlciwgb3V0JCA9IHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmIGV4cG9ydHMgfHwgdGhpcztcbnJlZiQgPSByZXF1aXJlKCdzdGQnKSwgaWQgPSByZWYkLmlkLCBsb2cgPSByZWYkLmxvZywgZmlsdGVyID0gcmVmJC5maWx0ZXI7XG5UaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKS5UaW1lcjtcbmtleVJlcGVhdFRpbWUgPSAxNTA7XG5LRVkgPSB7XG4gIFJFVFVSTjogMTMsXG4gIEVTQ0FQRTogMjcsXG4gIFNQQUNFOiAzMixcbiAgTEVGVDogMzcsXG4gIFVQOiAzOCxcbiAgUklHSFQ6IDM5LFxuICBET1dOOiA0MCxcbiAgWjogOTAsXG4gIFg6IDg4LFxuICBPTkU6IDQ5LFxuICBUV086IDUwLFxuICBUSFJFRTogNTEsXG4gIEZPVVI6IDUyLFxuICBGSVZFOiA1MyxcbiAgU0lYOiA1NCxcbiAgU0VWRU46IDU1LFxuICBFSUdIVDogNTYsXG4gIE5JTkU6IDU3LFxuICBaRVJPOiA0OFxufTtcbkFDVElPTl9OQU1FID0gKHJlZiQgPSB7fSwgcmVmJFtLRVkuUkVUVVJOICsgXCJcIl0gPSAnY29uZmlybScsIHJlZiRbS0VZLkVTQ0FQRSArIFwiXCJdID0gJ2NhbmNlbCcsIHJlZiRbS0VZLlNQQUNFICsgXCJcIl0gPSAnaGFyZC1kcm9wJywgcmVmJFtLRVkuWCArIFwiXCJdID0gJ2N3JywgcmVmJFtLRVkuWiArIFwiXCJdID0gJ2NjdycsIHJlZiRbS0VZLlVQICsgXCJcIl0gPSAndXAnLCByZWYkW0tFWS5MRUZUICsgXCJcIl0gPSAnbGVmdCcsIHJlZiRbS0VZLlJJR0hUICsgXCJcIl0gPSAncmlnaHQnLCByZWYkW0tFWS5ET1dOICsgXCJcIl0gPSAnZG93bicsIHJlZiRbS0VZLk9ORSArIFwiXCJdID0gJ2RlYnVnLTEnLCByZWYkW0tFWS5UV08gKyBcIlwiXSA9ICdkZWJ1Zy0yJywgcmVmJFtLRVkuVEhSRUUgKyBcIlwiXSA9ICdkZWJ1Zy0zJywgcmVmJFtLRVkuRk9VUiArIFwiXCJdID0gJ2RlYnVnLTQnLCByZWYkW0tFWS5GSVZFICsgXCJcIl0gPSAnZGVidWctNScsIHJlZiRbS0VZLlNJWCArIFwiXCJdID0gJ2RlYnVnLTYnLCByZWYkW0tFWS5TRVZFTiArIFwiXCJdID0gJ2RlYnVnLTcnLCByZWYkW0tFWS5FSUdIVCArIFwiXCJdID0gJ2RlYnVnLTgnLCByZWYkW0tFWS5OSU5FICsgXCJcIl0gPSAnZGVidWctOScsIHJlZiRbS0VZLlpFUk8gKyBcIlwiXSA9ICdkZWJ1Zy0wJywgcmVmJCk7XG5ldmVudFN1bW1hcnkgPSBmdW5jdGlvbihrZXksIHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGtleSxcbiAgICBhY3Rpb246IHN0YXRlID8gJ2Rvd24nIDogJ3VwJ1xuICB9O1xufTtcbm5ld0JsYW5rS2V5c3RhdGUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHVwOiBmYWxzZSxcbiAgICBkb3duOiBmYWxzZSxcbiAgICBsZWZ0OiBmYWxzZSxcbiAgICByaWdodDogZmFsc2UsXG4gICAgYWN0aW9uQTogZmFsc2UsXG4gICAgYWN0aW9uQjogZmFsc2UsXG4gICAgY29uZmlybTogZmFsc2UsXG4gICAgY2FuY2VsOiBmYWxzZVxuICB9O1xufTtcbm91dCQuSW5wdXRIYW5kbGVyID0gSW5wdXRIYW5kbGVyID0gKGZ1bmN0aW9uKCl7XG4gIElucHV0SGFuZGxlci5kaXNwbGF5TmFtZSA9ICdJbnB1dEhhbmRsZXInO1xuICB2YXIgcHJvdG90eXBlID0gSW5wdXRIYW5kbGVyLnByb3RvdHlwZSwgY29uc3RydWN0b3IgPSBJbnB1dEhhbmRsZXI7XG4gIGZ1bmN0aW9uIElucHV0SGFuZGxlcigpe1xuICAgIHRoaXMuc3RhdGVTZXR0ZXIgPSBiaW5kJCh0aGlzLCAnc3RhdGVTZXR0ZXInLCBwcm90b3R5cGUpO1xuICAgIGxvZyhcIklucHV0SGFuZGxlcjo6bmV3XCIpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLnN0YXRlU2V0dGVyKHRydWUpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc3RhdGVTZXR0ZXIoZmFsc2UpKTtcbiAgICB0aGlzLmN1cnJLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgICB0aGlzLmxhc3RLZXlzdGF0ZSA9IG5ld0JsYW5rS2V5c3RhdGUoKTtcbiAgfVxuICBwcm90b3R5cGUuc3RhdGVTZXR0ZXIgPSBjdXJyeSQoKGZ1bmN0aW9uKHN0YXRlLCBhcmckKXtcbiAgICB2YXIgd2hpY2gsIGtleTtcbiAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgaWYgKGtleSA9IEFDVElPTl9OQU1FW3doaWNoXSkge1xuICAgICAgdGhpcy5jdXJyS2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgaWYgKHN0YXRlID09PSB0cnVlICYmIHRoaXMubGFzdEhlbGRLZXkgIT09IGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0SGVsZEtleSA9IGtleTtcbiAgICAgIH1cbiAgICB9XG4gIH0pLCB0cnVlKTtcbiAgcHJvdG90eXBlLmNoYW5nZXNTaW5jZUxhc3RGcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGtleSwgc3RhdGUsIHdhc0RpZmZlcmVudDtcbiAgICByZXR1cm4gZmlsdGVyKGlkLCAoZnVuY3Rpb24oKXtcbiAgICAgIHZhciByZWYkLCByZXN1bHRzJCA9IFtdO1xuICAgICAgZm9yIChrZXkgaW4gcmVmJCA9IHRoaXMuY3VycktleXN0YXRlKSB7XG4gICAgICAgIHN0YXRlID0gcmVmJFtrZXldO1xuICAgICAgICB3YXNEaWZmZXJlbnQgPSBzdGF0ZSAhPT0gdGhpcy5sYXN0S2V5c3RhdGVba2V5XTtcbiAgICAgICAgdGhpcy5sYXN0S2V5c3RhdGVba2V5XSA9IHN0YXRlO1xuICAgICAgICBpZiAod2FzRGlmZmVyZW50KSB7XG4gICAgICAgICAgcmVzdWx0cyQucHVzaChldmVudFN1bW1hcnkoa2V5LCBzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cyQ7XG4gICAgfS5jYWxsKHRoaXMpKSk7XG4gIH07XG4gIElucHV0SGFuZGxlci5kZWJ1Z01vZGUgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICByZXR1cm4gbG9nKFwiSW5wdXRIYW5kbGVyOjpkZWJ1Z01vZGUgLVwiLCB3aGljaCwgQUNUSU9OX05BTUVbd2hpY2hdIHx8ICdbdW5ib3VuZF0nKTtcbiAgICB9KTtcbiAgfTtcbiAgSW5wdXRIYW5kbGVyLm9uID0gZnVuY3Rpb24oY29kZSwgzrspe1xuICAgIHJldHVybiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oYXJnJCl7XG4gICAgICB2YXIgd2hpY2g7XG4gICAgICB3aGljaCA9IGFyZyQud2hpY2g7XG4gICAgICBpZiAod2hpY2ggPT09IGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIM67KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBJbnB1dEhhbmRsZXI7XG59KCkpO1xuZnVuY3Rpb24gYmluZCQob2JqLCBrZXksIHRhcmdldCl7XG4gIHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gKHRhcmdldCB8fCBvYmopW2tleV0uYXBwbHkob2JqLCBhcmd1bWVudHMpIH07XG59XG5mdW5jdGlvbiBjdXJyeSQoZiwgYm91bmQpe1xuICB2YXIgY29udGV4dCxcbiAgX2N1cnJ5ID0gZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBmLmxlbmd0aCA+IDEgPyBmdW5jdGlvbigpe1xuICAgICAgdmFyIHBhcmFtcyA9IGFyZ3MgPyBhcmdzLmNvbmNhdCgpIDogW107XG4gICAgICBjb250ZXh0ID0gYm91bmQgPyBjb250ZXh0IHx8IHRoaXMgOiB0aGlzO1xuICAgICAgcmV0dXJuIHBhcmFtcy5wdXNoLmFwcGx5KHBhcmFtcywgYXJndW1lbnRzKSA8XG4gICAgICAgICAgZi5sZW5ndGggJiYgYXJndW1lbnRzLmxlbmd0aCA/XG4gICAgICAgIF9jdXJyeS5jYWxsKGNvbnRleHQsIHBhcmFtcykgOiBmLmFwcGx5KGNvbnRleHQsIHBhcmFtcyk7XG4gICAgfSA6IGY7XG4gIH07XG4gIHJldHVybiBfY3VycnkoKTtcbn0iLCJ2YXIgcmVmJCwgaWQsIGxvZywgZmxvb3IsIGFzY2lpUHJvZ3Jlc3NCYXIsIFRpbWVyLCBvdXQkID0gdHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgZXhwb3J0cyB8fCB0aGlzO1xucmVmJCA9IHJlcXVpcmUoJ3N0ZCcpLCBpZCA9IHJlZiQuaWQsIGxvZyA9IHJlZiQubG9nLCBmbG9vciA9IHJlZiQuZmxvb3I7XG5hc2NpaVByb2dyZXNzQmFyID0gY3VycnkkKGZ1bmN0aW9uKGxlbiwgdmFsLCBtYXgpe1xuICB2YXIgdmFsdWVDaGFycywgZW1wdHlDaGFycztcbiAgdmFsID0gdmFsID4gbWF4ID8gbWF4IDogdmFsO1xuICB2YWx1ZUNoYXJzID0gZmxvb3IobGVuICogdmFsIC8gbWF4KTtcbiAgZW1wdHlDaGFycyA9IGxlbiAtIHZhbHVlQ2hhcnM7XG4gIHJldHVybiByZXBlYXRTdHJpbmckKFwi4paSXCIsIHZhbHVlQ2hhcnMpICsgcmVwZWF0U3RyaW5nJChcIi1cIiwgZW1wdHlDaGFycyk7XG59KTtcbm91dCQuVGltZXIgPSBUaW1lciA9IChmdW5jdGlvbigpe1xuICBUaW1lci5kaXNwbGF5TmFtZSA9ICdUaW1lcic7XG4gIHZhciBhbGxUaW1lcnMsIHByb2diYXIsIHJlZiQsIFRJTUVSX0FDVElWRSwgVElNRVJfRVhQSVJFRCwgcHJvdG90eXBlID0gVGltZXIucHJvdG90eXBlLCBjb25zdHJ1Y3RvciA9IFRpbWVyO1xuICBhbGxUaW1lcnMgPSBbXTtcbiAgcHJvZ2JhciA9IGFzY2lpUHJvZ3Jlc3NCYXIoMjEpO1xuICByZWYkID0gWzAsIDFdLCBUSU1FUl9BQ1RJVkUgPSByZWYkWzBdLCBUSU1FUl9FWFBJUkVEID0gcmVmJFsxXTtcbiAgZnVuY3Rpb24gVGltZXIodGFyZ2V0VGltZSwgYmVnaW4pe1xuICAgIHRoaXMudGFyZ2V0VGltZSA9IHRhcmdldFRpbWUgIT0gbnVsbCA/IHRhcmdldFRpbWUgOiAxMDAwO1xuICAgIGJlZ2luID09IG51bGwgJiYgKGJlZ2luID0gZmFsc2UpO1xuICAgIGlmICh0aGlzLnRhcmdldFRpbWUgPT09IDApIHtcbiAgICAgIHRocm93IFwiVGltZXI6OnJlc2V0IC0gdGFyZ2V0IHRpbWUgbXVzdCBiZSBub24temVyb1wiO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gMDtcbiAgICB0aGlzLnN0YXRlID0gYmVnaW4gPyBUSU1FUl9BQ1RJVkUgOiBUSU1FUl9FWFBJUkVEO1xuICAgIHRoaXMuYWN0aXZlID0gYmVnaW47XG4gICAgdGhpcy5leHBpcmVkID0gIWJlZ2luO1xuICAgIGFsbFRpbWVycy5wdXNoKHRoaXMpO1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICdhY3RpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUgPT09IFRJTUVSX0FDVElWRTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAnZXhwaXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9PT0gVElNRVJfRVhQSVJFRDtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCAncHJvZ3Jlc3MnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWUgLyB0aGlzLnRhcmdldFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLmV4cGlyZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gIH07XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsICd0aW1lVG9FeHBpcnknLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0VGltZSAtIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGV4cFRpbWUpe1xuICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHRoaXMudGFyZ2V0VGltZSAtIGV4cFRpbWU7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZVxuICB9KTtcbiAgcHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUaW1lICs9IM6UdDtcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lID49IHRoaXMudGFyZ2V0VGltZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0VYUElSRUQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBwcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbih0aW1lKXtcbiAgICB0aW1lID09IG51bGwgJiYgKHRpbWUgPSB0aGlzLnRhcmdldFRpbWUpO1xuICAgIGlmICh0aW1lID09PSAwKSB7XG4gICAgICB0aHJvdyBcIlRpbWVyOjpyZXNldCAtIHRhcmdldCB0aW1lIG11c3QgYmUgbm9uLXplcm9cIjtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50VGltZSA9IDA7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnJlc2V0V2l0aFJlbWFpbmRlciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRpbWUgPT0gbnVsbCAmJiAodGltZSA9IHRoaXMudGFyZ2V0VGltZSk7XG4gICAgaWYgKHRpbWUgPT09IDApIHtcbiAgICAgIHRocm93IFwiVGltZXI6OnJlc2V0IC0gdGFyZ2V0IHRpbWUgbXVzdCBiZSBub24temVyb1wiO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRUaW1lID0gdGhpcy5jdXJyZW50VGltZSAtIHRpbWU7XG4gICAgdGhpcy50YXJnZXRUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuY3VycmVudFRpbWUgPSAwO1xuICAgIHJldHVybiB0aGlzLnN0YXRlID0gVElNRVJfRVhQSVJFRDtcbiAgfTtcbiAgcHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbGxUaW1lcnMuc3BsaWNlKGFsbFRpbWVycy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgfTtcbiAgcHJvdG90eXBlLnJ1bkZvciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMudGltZVRvRXhwaXJ5ID0gdGltZTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZSA9IFRJTUVSX0FDVElWRTtcbiAgfTtcbiAgcHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gXCJUSU1FUjogXCIgKyB0aGlzLnRhcmdldFRpbWUgKyBcIlxcblNUQVRFOiBcIiArIHRoaXMuc3RhdGUgKyBcIiAoXCIgKyB0aGlzLmFjdGl2ZSArIFwifFwiICsgdGhpcy5leHBpcmVkICsgXCIpXFxuXCIgKyBwcm9nYmFyKHRoaXMuY3VycmVudFRpbWUsIHRoaXMudGFyZ2V0VGltZSk7XG4gIH07XG4gIFRpbWVyLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uKM6UdCl7XG4gICAgcmV0dXJuIGFsbFRpbWVycy5tYXAoZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0LnVwZGF0ZSjOlHQpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gVGltZXI7XG59KCkpO1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nJChzdHIsIG4pe1xuICBmb3IgKHZhciByID0gJyc7IG4gPiAwOyAobiA+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKSBpZiAobiAmIDEpIHIgKz0gc3RyO1xuICByZXR1cm4gcjtcbn1cbmZ1bmN0aW9uIGN1cnJ5JChmLCBib3VuZCl7XG4gIHZhciBjb250ZXh0LFxuICBfY3VycnkgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGYubGVuZ3RoID4gMSA/IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgcGFyYW1zID0gYXJncyA/IGFyZ3MuY29uY2F0KCkgOiBbXTtcbiAgICAgIGNvbnRleHQgPSBib3VuZCA/IGNvbnRleHQgfHwgdGhpcyA6IHRoaXM7XG4gICAgICByZXR1cm4gcGFyYW1zLnB1c2guYXBwbHkocGFyYW1zLCBhcmd1bWVudHMpIDxcbiAgICAgICAgICBmLmxlbmd0aCAmJiBhcmd1bWVudHMubGVuZ3RoID9cbiAgICAgICAgX2N1cnJ5LmNhbGwoY29udGV4dCwgcGFyYW1zKSA6IGYuYXBwbHkoY29udGV4dCwgcGFyYW1zKTtcbiAgICB9IDogZjtcbiAgfTtcbiAgcmV0dXJuIF9jdXJyeSgpO1xufSIsIi8qKlxuICogQGF1dGhvciBhbHRlcmVkcSAvIGh0dHA6Ly9hbHRlcmVkcXVhbGlhLmNvbS9cbiAqL1xuXG5USFJFRS5CbG9vbVBhc3MgPSBmdW5jdGlvbiAoIHN0cmVuZ3RoLCBrZXJuZWxTaXplLCBzaWdtYSwgcmVzb2x1dGlvbiApIHtcblxuXHRzdHJlbmd0aCA9ICggc3RyZW5ndGggIT09IHVuZGVmaW5lZCApID8gc3RyZW5ndGggOiAxO1xuXHRrZXJuZWxTaXplID0gKCBrZXJuZWxTaXplICE9PSB1bmRlZmluZWQgKSA/IGtlcm5lbFNpemUgOiAyNTtcblx0c2lnbWEgPSAoIHNpZ21hICE9PSB1bmRlZmluZWQgKSA/IHNpZ21hIDogNC4wO1xuXHRyZXNvbHV0aW9uID0gKCByZXNvbHV0aW9uICE9PSB1bmRlZmluZWQgKSA/IHJlc29sdXRpb24gOiAyNTY7XG5cblx0Ly8gcmVuZGVyIHRhcmdldHNcblxuXHR2YXIgcGFycyA9IHsgbWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIsIG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyLCBmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdCB9O1xuXG5cdHRoaXMucmVuZGVyVGFyZ2V0WCA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlclRhcmdldCggcmVzb2x1dGlvbiwgcmVzb2x1dGlvbiwgcGFycyApO1xuXHR0aGlzLnJlbmRlclRhcmdldFkgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoIHJlc29sdXRpb24sIHJlc29sdXRpb24sIHBhcnMgKTtcblxuXHQvLyBjb3B5IG1hdGVyaWFsXG5cblx0aWYgKCBUSFJFRS5Db3B5U2hhZGVyID09PSB1bmRlZmluZWQgKVxuXHRcdGNvbnNvbGUuZXJyb3IoIFwiVEhSRUUuQmxvb21QYXNzIHJlbGllcyBvbiBUSFJFRS5Db3B5U2hhZGVyXCIgKTtcblxuXHR2YXIgY29weVNoYWRlciA9IFRIUkVFLkNvcHlTaGFkZXI7XG5cblx0dGhpcy5jb3B5VW5pZm9ybXMgPSBUSFJFRS5Vbmlmb3Jtc1V0aWxzLmNsb25lKCBjb3B5U2hhZGVyLnVuaWZvcm1zICk7XG5cblx0dGhpcy5jb3B5VW5pZm9ybXNbIFwib3BhY2l0eVwiIF0udmFsdWUgPSBzdHJlbmd0aDtcblxuXHR0aGlzLm1hdGVyaWFsQ29weSA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXG5cdFx0dW5pZm9ybXM6IHRoaXMuY29weVVuaWZvcm1zLFxuXHRcdHZlcnRleFNoYWRlcjogY29weVNoYWRlci52ZXJ0ZXhTaGFkZXIsXG5cdFx0ZnJhZ21lbnRTaGFkZXI6IGNvcHlTaGFkZXIuZnJhZ21lbnRTaGFkZXIsXG5cdFx0YmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG5cdFx0dHJhbnNwYXJlbnQ6IHRydWVcblxuXHR9ICk7XG5cblx0Ly8gY29udm9sdXRpb24gbWF0ZXJpYWxcblxuXHRpZiAoIFRIUkVFLkNvbnZvbHV0aW9uU2hhZGVyID09PSB1bmRlZmluZWQgKVxuXHRcdGNvbnNvbGUuZXJyb3IoIFwiVEhSRUUuQmxvb21QYXNzIHJlbGllcyBvbiBUSFJFRS5Db252b2x1dGlvblNoYWRlclwiICk7XG5cblx0dmFyIGNvbnZvbHV0aW9uU2hhZGVyID0gVEhSRUUuQ29udm9sdXRpb25TaGFkZXI7XG5cbiAgY29uc29sZS5sb2coJ0ZvdW5kITsnICwgY29udm9sdXRpb25TaGFkZXIpO1xuXG5cdHRoaXMuY29udm9sdXRpb25Vbmlmb3JtcyA9IFRIUkVFLlVuaWZvcm1zVXRpbHMuY2xvbmUoIGNvbnZvbHV0aW9uU2hhZGVyLnVuaWZvcm1zICk7XG5cblx0dGhpcy5jb252b2x1dGlvblVuaWZvcm1zWyBcInVJbWFnZUluY3JlbWVudFwiIF0udmFsdWUgPSBUSFJFRS5CbG9vbVBhc3MuYmx1clg7XG5cdHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtc1sgXCJjS2VybmVsXCIgXS52YWx1ZSA9IFRIUkVFLkNvbnZvbHV0aW9uU2hhZGVyLmJ1aWxkS2VybmVsKCBzaWdtYSApO1xuXG5cdHRoaXMubWF0ZXJpYWxDb252b2x1dGlvbiA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCgge1xuXG5cdFx0dW5pZm9ybXM6IHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtcyxcblx0XHR2ZXJ0ZXhTaGFkZXI6ICBjb252b2x1dGlvblNoYWRlci52ZXJ0ZXhTaGFkZXIsXG5cdFx0ZnJhZ21lbnRTaGFkZXI6IGNvbnZvbHV0aW9uU2hhZGVyLmZyYWdtZW50U2hhZGVyLFxuXHRcdGRlZmluZXM6IHtcblx0XHRcdFwiS0VSTkVMX1NJWkVfRkxPQVRcIjoga2VybmVsU2l6ZS50b0ZpeGVkKCAxICksXG5cdFx0XHRcIktFUk5FTF9TSVpFX0lOVFwiOiBrZXJuZWxTaXplLnRvRml4ZWQoIDAgKVxuXHRcdH1cblxuXHR9ICk7XG5cblx0dGhpcy5lbmFibGVkID0gdHJ1ZTtcblx0dGhpcy5uZWVkc1N3YXAgPSBmYWxzZTtcblx0dGhpcy5jbGVhciA9IGZhbHNlO1xuXG5cblx0dGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKCAtMSwgMSwgMSwgLTEsIDAsIDEgKTtcblx0dGhpcy5zY2VuZSAgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuXHR0aGlzLnF1YWQgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLlBsYW5lQnVmZmVyR2VvbWV0cnkoIDIsIDIgKSwgbnVsbCApO1xuXHR0aGlzLnNjZW5lLmFkZCggdGhpcy5xdWFkICk7XG5cbn07XG5cblRIUkVFLkJsb29tUGFzcy5wcm90b3R5cGUgPSB7XG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoIHJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgZGVsdGEsIG1hc2tBY3RpdmUgKSB7XG5cblx0XHRpZiAoIG1hc2tBY3RpdmUgKSByZW5kZXJlci5jb250ZXh0LmRpc2FibGUoIHJlbmRlcmVyLmNvbnRleHQuU1RFTkNJTF9URVNUICk7XG5cblx0XHQvLyBSZW5kZXIgcXVhZCB3aXRoIGJsdXJlZCBzY2VuZSBpbnRvIHRleHR1cmUgKGNvbnZvbHV0aW9uIHBhc3MgMSlcblxuXHRcdHRoaXMucXVhZC5tYXRlcmlhbCA9IHRoaXMubWF0ZXJpYWxDb252b2x1dGlvbjtcblxuXHRcdHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtc1sgXCJ0RGlmZnVzZVwiIF0udmFsdWUgPSByZWFkQnVmZmVyO1xuXHRcdHRoaXMuY29udm9sdXRpb25Vbmlmb3Jtc1sgXCJ1SW1hZ2VJbmNyZW1lbnRcIiBdLnZhbHVlID0gVEhSRUUuQmxvb21QYXNzLmJsdXJYO1xuXG5cdFx0cmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSwgdGhpcy5yZW5kZXJUYXJnZXRYLCB0cnVlICk7XG5cblxuXHRcdC8vIFJlbmRlciBxdWFkIHdpdGggYmx1cmVkIHNjZW5lIGludG8gdGV4dHVyZSAoY29udm9sdXRpb24gcGFzcyAyKVxuXG5cdFx0dGhpcy5jb252b2x1dGlvblVuaWZvcm1zWyBcInREaWZmdXNlXCIgXS52YWx1ZSA9IHRoaXMucmVuZGVyVGFyZ2V0WDtcblx0XHR0aGlzLmNvbnZvbHV0aW9uVW5pZm9ybXNbIFwidUltYWdlSW5jcmVtZW50XCIgXS52YWx1ZSA9IFRIUkVFLkJsb29tUGFzcy5ibHVyWTtcblxuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHRoaXMucmVuZGVyVGFyZ2V0WSwgdHJ1ZSApO1xuXG5cdFx0Ly8gUmVuZGVyIG9yaWdpbmFsIHNjZW5lIHdpdGggc3VwZXJpbXBvc2VkIGJsdXIgdG8gdGV4dHVyZVxuXG5cdFx0dGhpcy5xdWFkLm1hdGVyaWFsID0gdGhpcy5tYXRlcmlhbENvcHk7XG5cblx0XHR0aGlzLmNvcHlVbmlmb3Jtc1sgXCJ0RGlmZnVzZVwiIF0udmFsdWUgPSB0aGlzLnJlbmRlclRhcmdldFk7XG5cblx0XHRpZiAoIG1hc2tBY3RpdmUgKSByZW5kZXJlci5jb250ZXh0LmVuYWJsZSggcmVuZGVyZXIuY29udGV4dC5TVEVOQ0lMX1RFU1QgKTtcblxuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHJlYWRCdWZmZXIsIHRoaXMuY2xlYXIgKTtcblxuXHR9XG5cbn07XG5cblRIUkVFLkJsb29tUGFzcy5ibHVyWCA9IG5ldyBUSFJFRS5WZWN0b3IyKCAwLjAwMTk1MzEyNSwgMC4wICk7XG5USFJFRS5CbG9vbVBhc3MuYmx1clkgPSBuZXcgVEhSRUUuVmVjdG9yMiggMC4wLCAwLjAwMTk1MzEyNSApO1xuIiwiLyoqXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICpcbiAqIENvbnZvbHV0aW9uIHNoYWRlclxuICogcG9ydGVkIGZyb20gbzNkIHNhbXBsZSB0byBXZWJHTCAvIEdMU0xcbiAqIGh0dHA6Ly9vM2QuZ29vZ2xlY29kZS5jb20vc3ZuL3RydW5rL3NhbXBsZXMvY29udm9sdXRpb24uaHRtbFxuICovXG5cblRIUkVFLkNvbnZvbHV0aW9uU2hhZGVyID0ge1xuXG5cdGRlZmluZXM6IHtcblxuXHRcdFwiS0VSTkVMX1NJWkVfRkxPQVRcIjogXCIyNS4wXCIsXG5cdFx0XCJLRVJORUxfU0laRV9JTlRcIjogXCIyNVwiLFxuXG5cdH0sXG5cblx0dW5pZm9ybXM6IHtcblxuXHRcdFwidERpZmZ1c2VcIjogICAgICAgIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiBudWxsIH0sXG5cdFx0XCJ1SW1hZ2VJbmNyZW1lbnRcIjogeyB0eXBlOiBcInYyXCIsIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMiggMC4wMDE5NTMxMjUsIDAuMCApIH0sXG5cdFx0XCJjS2VybmVsXCI6ICAgICAgICAgeyB0eXBlOiBcImZ2MVwiLCB2YWx1ZTogW10gfVxuXG5cdH0sXG5cblx0dmVydGV4U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gdmVjMiB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cblx0XHRcInZhcnlpbmcgdmVjMiB2VXY7XCIsXG5cblx0XHRcInZvaWQgbWFpbigpIHtcIixcblxuXHRcdFx0XCJ2VXYgPSB1diAtICggKCBLRVJORUxfU0laRV9GTE9BVCAtIDEuMCApIC8gMi4wICkgKiB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gZmxvYXQgY0tlcm5lbFsgS0VSTkVMX1NJWkVfSU5UIF07XCIsXG5cblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1wiLFxuXHRcdFwidW5pZm9ybSB2ZWMyIHVJbWFnZUluY3JlbWVudDtcIixcblxuXHRcdFwidmFyeWluZyB2ZWMyIHZVdjtcIixcblxuXHRcdFwidm9pZCBtYWluKCkge1wiLFxuXG5cdFx0XHRcInZlYzIgaW1hZ2VDb29yZCA9IHZVdjtcIixcblx0XHRcdFwidmVjNCBzdW0gPSB2ZWM0KCAwLjAsIDAuMCwgMC4wLCAwLjAgKTtcIixcblxuXHRcdFx0XCJmb3IoIGludCBpID0gMDsgaSA8IEtFUk5FTF9TSVpFX0lOVDsgaSArKyApIHtcIixcblxuXHRcdFx0XHRcInN1bSArPSB0ZXh0dXJlMkQoIHREaWZmdXNlLCBpbWFnZUNvb3JkICkgKiBjS2VybmVsWyBpIF07XCIsXG5cdFx0XHRcdFwiaW1hZ2VDb29yZCArPSB1SW1hZ2VJbmNyZW1lbnQ7XCIsXG5cblx0XHRcdFwifVwiLFxuXG5cdFx0XHRcImdsX0ZyYWdDb2xvciA9IHN1bTtcIixcblxuXHRcdFwifVwiXG5cblxuXHRdLmpvaW4oXCJcXG5cIiksXG5cblx0YnVpbGRLZXJuZWw6IGZ1bmN0aW9uICggc2lnbWEgKSB7XG5cblx0XHQvLyBXZSBsb3Agb2ZmIHRoZSBzcXJ0KDIgKiBwaSkgKiBzaWdtYSB0ZXJtLCBzaW5jZSB3ZSdyZSBnb2luZyB0byBub3JtYWxpemUgYW55d2F5LlxuXG5cdFx0ZnVuY3Rpb24gZ2F1c3MoIHgsIHNpZ21hICkge1xuXG5cdFx0XHRyZXR1cm4gTWF0aC5leHAoIC0gKCB4ICogeCApIC8gKCAyLjAgKiBzaWdtYSAqIHNpZ21hICkgKTtcblxuXHRcdH1cblxuXHRcdHZhciBpLCB2YWx1ZXMsIHN1bSwgaGFsZldpZHRoLCBrTWF4S2VybmVsU2l6ZSA9IDI1LCBrZXJuZWxTaXplID0gMiAqIE1hdGguY2VpbCggc2lnbWEgKiAzLjAgKSArIDE7XG5cblx0XHRpZiAoIGtlcm5lbFNpemUgPiBrTWF4S2VybmVsU2l6ZSApIGtlcm5lbFNpemUgPSBrTWF4S2VybmVsU2l6ZTtcblx0XHRoYWxmV2lkdGggPSAoIGtlcm5lbFNpemUgLSAxICkgKiAwLjU7XG5cblx0XHR2YWx1ZXMgPSBuZXcgQXJyYXkoIGtlcm5lbFNpemUgKTtcblx0XHRzdW0gPSAwLjA7XG5cdFx0Zm9yICggaSA9IDA7IGkgPCBrZXJuZWxTaXplOyArKyBpICkge1xuXG5cdFx0XHR2YWx1ZXNbIGkgXSA9IGdhdXNzKCBpIC0gaGFsZldpZHRoLCBzaWdtYSApO1xuXHRcdFx0c3VtICs9IHZhbHVlc1sgaSBdO1xuXG5cdFx0fVxuXG5cdFx0Ly8gbm9ybWFsaXplIHRoZSBrZXJuZWxcblxuXHRcdGZvciAoIGkgPSAwOyBpIDwga2VybmVsU2l6ZTsgKysgaSApIHZhbHVlc1sgaSBdIC89IHN1bTtcblxuXHRcdHJldHVybiB2YWx1ZXM7XG5cblx0fVxuXG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICpcbiAqIEZ1bGwtc2NyZWVuIHRleHR1cmVkIHF1YWQgc2hhZGVyXG4gKi9cblxuVEhSRUUuQ29weVNoYWRlciA9IHtcblxuXHR1bmlmb3Jtczoge1xuXG5cdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFwib3BhY2l0eVwiOiAgeyB0eXBlOiBcImZcIiwgdmFsdWU6IDEuMCB9XG5cblx0fSxcblxuXHR2ZXJ0ZXhTaGFkZXI6IFtcblxuXHRcdFwidmFyeWluZyB2ZWMyIHZVdjtcIixcblxuXHRcdFwidm9pZCBtYWluKCkge1wiLFxuXG5cdFx0XHRcInZVdiA9IHV2O1wiLFxuXHRcdFx0XCJnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KCBwb3NpdGlvbiwgMS4wICk7XCIsXG5cblx0XHRcIn1cIlxuXG5cdF0uam9pbihcIlxcblwiKSxcblxuXHRmcmFnbWVudFNoYWRlcjogW1xuXG5cdFx0XCJ1bmlmb3JtIGZsb2F0IG9wYWNpdHk7XCIsXG5cblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1wiLFxuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidmVjNCB0ZXhlbCA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1wiLFxuXHRcdFx0XCJnbF9GcmFnQ29sb3IgPSBvcGFjaXR5ICogdGV4ZWw7XCIsXG5cblx0XHRcIn1cIlxuXG5cdF0uam9pbihcIlxcblwiKVxuXG59O1xuIiwiLyoqXG4gKiBAYXV0aG9yIGFsdGVyZWRxIC8gaHR0cDovL2FsdGVyZWRxdWFsaWEuY29tL1xuICpcbiAqIERvdCBzY3JlZW4gc2hhZGVyXG4gKiBiYXNlZCBvbiBnbGZ4LmpzIHNlcGlhIHNoYWRlclxuICogaHR0cHM6Ly9naXRodWIuY29tL2V2YW53L2dsZnguanNcbiAqL1xuXG5USFJFRS5Eb3RTY3JlZW5TaGFkZXIgPSB7XG5cblx0dW5pZm9ybXM6IHtcblxuXHRcdFwidERpZmZ1c2VcIjogeyB0eXBlOiBcInRcIiwgdmFsdWU6IG51bGwgfSxcblx0XHRcInRTaXplXCI6ICAgIHsgdHlwZTogXCJ2MlwiLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIDI1NiwgMjU2ICkgfSxcblx0XHRcImNlbnRlclwiOiAgIHsgdHlwZTogXCJ2MlwiLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoIDAuNSwgMC41ICkgfSxcblx0XHRcImFuZ2xlXCI6ICAgIHsgdHlwZTogXCJmXCIsIHZhbHVlOiAxLjU3IH0sXG5cdFx0XCJzY2FsZVwiOiAgICB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogMS4wIH1cblxuXHR9LFxuXG5cdHZlcnRleFNoYWRlcjogW1xuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidlV2ID0gdXY7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gdmVjMiBjZW50ZXI7XCIsXG5cdFx0XCJ1bmlmb3JtIGZsb2F0IGFuZ2xlO1wiLFxuXHRcdFwidW5pZm9ybSBmbG9hdCBzY2FsZTtcIixcblx0XHRcInVuaWZvcm0gdmVjMiB0U2l6ZTtcIixcblxuXHRcdFwidW5pZm9ybSBzYW1wbGVyMkQgdERpZmZ1c2U7XCIsXG5cblx0XHRcInZhcnlpbmcgdmVjMiB2VXY7XCIsXG5cblx0XHRcImZsb2F0IHBhdHRlcm4oKSB7XCIsXG5cblx0XHRcdFwiZmxvYXQgcyA9IHNpbiggYW5nbGUgKSwgYyA9IGNvcyggYW5nbGUgKTtcIixcblxuXHRcdFx0XCJ2ZWMyIHRleCA9IHZVdiAqIHRTaXplIC0gY2VudGVyO1wiLFxuXHRcdFx0XCJ2ZWMyIHBvaW50ID0gdmVjMiggYyAqIHRleC54IC0gcyAqIHRleC55LCBzICogdGV4LnggKyBjICogdGV4LnkgKSAqIHNjYWxlO1wiLFxuXG5cdFx0XHRcInJldHVybiAoIHNpbiggcG9pbnQueCApICogc2luKCBwb2ludC55ICkgKSAqIDQuMDtcIixcblxuXHRcdFwifVwiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidmVjNCBjb2xvciA9IHRleHR1cmUyRCggdERpZmZ1c2UsIHZVdiApO1wiLFxuXG5cdFx0XHRcImZsb2F0IGF2ZXJhZ2UgPSAoIGNvbG9yLnIgKyBjb2xvci5nICsgY29sb3IuYiApIC8gMy4wO1wiLFxuXG5cdFx0XHRcImdsX0ZyYWdDb2xvciA9IHZlYzQoIHZlYzMoIGF2ZXJhZ2UgKiAxMC4wIC0gNS4wICsgcGF0dGVybigpICksIGNvbG9yLmEgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpXG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuRWZmZWN0Q29tcG9zZXIgPSBmdW5jdGlvbiAoIHJlbmRlcmVyLCByZW5kZXJUYXJnZXQgKSB7XG5cblx0dGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuXG5cdGlmICggcmVuZGVyVGFyZ2V0ID09PSB1bmRlZmluZWQgKSB7XG5cdFx0dmFyIHBpeGVsUmF0aW8gPSByZW5kZXJlci5nZXRQaXhlbFJhdGlvKCk7XG5cdFx0dmFyIHdpZHRoICA9IE1hdGguZmxvb3IoIHJlbmRlcmVyLmNvbnRleHQuY2FudmFzLndpZHRoICAvIHBpeGVsUmF0aW8gKSB8fCAxO1xuXHRcdHZhciBoZWlnaHQgPSBNYXRoLmZsb29yKCByZW5kZXJlci5jb250ZXh0LmNhbnZhcy5oZWlnaHQgLyBwaXhlbFJhdGlvICkgfHwgMTtcblx0XHR2YXIgcGFyYW1ldGVycyA9IHsgbWluRmlsdGVyOiBUSFJFRS5MaW5lYXJGaWx0ZXIsIG1hZ0ZpbHRlcjogVEhSRUUuTGluZWFyRmlsdGVyLCBmb3JtYXQ6IFRIUkVFLlJHQkZvcm1hdCwgc3RlbmNpbEJ1ZmZlcjogZmFsc2UgfTtcblx0XHRyZW5kZXJUYXJnZXQgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJUYXJnZXQoIHdpZHRoLCBoZWlnaHQsIHBhcmFtZXRlcnMgKTtcblx0fVxuXG5cdHRoaXMucmVuZGVyVGFyZ2V0MSA9IHJlbmRlclRhcmdldDtcblx0dGhpcy5yZW5kZXJUYXJnZXQyID0gcmVuZGVyVGFyZ2V0LmNsb25lKCk7XG5cdHRoaXMud3JpdGVCdWZmZXIgPSB0aGlzLnJlbmRlclRhcmdldDE7XG5cdHRoaXMucmVhZEJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0Mjtcblx0dGhpcy5wYXNzZXMgPSBbXTtcblxuXHRpZiAoIFRIUkVFLkNvcHlTaGFkZXIgPT09IHVuZGVmaW5lZCApIHsgY29uc29sZS5lcnJvciggXCJUSFJFRS5FZmZlY3RDb21wb3NlciByZWxpZXMgb24gVEhSRUUuQ29weVNoYWRlclwiICk7IH1cblxuXHR0aGlzLmNvcHlQYXNzID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoIFRIUkVFLkNvcHlTaGFkZXIgKTtcblxufTtcblxuVEhSRUUuRWZmZWN0Q29tcG9zZXIucHJvdG90eXBlID0ge1xuXG5cdHN3YXBCdWZmZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdG1wID0gdGhpcy5yZWFkQnVmZmVyO1xuXHRcdHRoaXMucmVhZEJ1ZmZlciA9IHRoaXMud3JpdGVCdWZmZXI7XG5cdFx0dGhpcy53cml0ZUJ1ZmZlciA9IHRtcDtcblx0fSxcblxuXHRhZGRQYXNzOiBmdW5jdGlvbiAoIHBhc3MgKSB7XG5cdFx0dGhpcy5wYXNzZXMucHVzaCggcGFzcyApO1xuXHR9LFxuXG5cdGluc2VydFBhc3M6IGZ1bmN0aW9uICggcGFzcywgaW5kZXggKSB7XG5cdFx0dGhpcy5wYXNzZXMuc3BsaWNlKCBpbmRleCwgMCwgcGFzcyApO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCBkZWx0YSApIHtcblx0XHR0aGlzLndyaXRlQnVmZmVyID0gdGhpcy5yZW5kZXJUYXJnZXQxO1xuXHRcdHRoaXMucmVhZEJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0MjtcblxuXHRcdHZhciBtYXNrQWN0aXZlID0gZmFsc2U7XG5cdFx0dmFyIHBhc3MsIGksIGlsID0gdGhpcy5wYXNzZXMubGVuZ3RoO1xuXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBpbDsgaSArKyApIHtcblx0XHRcdHBhc3MgPSB0aGlzLnBhc3Nlc1sgaSBdO1xuXHRcdFx0aWYgKCAhcGFzcy5lbmFibGVkICkgY29udGludWU7XG5cdFx0XHRwYXNzLnJlbmRlciggdGhpcy5yZW5kZXJlciwgdGhpcy53cml0ZUJ1ZmZlciwgdGhpcy5yZWFkQnVmZmVyLCBkZWx0YSwgbWFza0FjdGl2ZSApO1xuXG5cdFx0XHRpZiAoIHBhc3MubmVlZHNTd2FwICkge1xuXHRcdFx0XHRpZiAoIG1hc2tBY3RpdmUgKSB7XG5cdFx0XHRcdFx0dmFyIGNvbnRleHQgPSB0aGlzLnJlbmRlcmVyLmNvbnRleHQ7XG5cdFx0XHRcdFx0Y29udGV4dC5zdGVuY2lsRnVuYyggY29udGV4dC5OT1RFUVVBTCwgMSwgMHhmZmZmZmZmZiApO1xuXHRcdFx0XHRcdHRoaXMuY29weVBhc3MucmVuZGVyKCB0aGlzLnJlbmRlcmVyLCB0aGlzLndyaXRlQnVmZmVyLCB0aGlzLnJlYWRCdWZmZXIsIGRlbHRhICk7XG5cdFx0XHRcdFx0Y29udGV4dC5zdGVuY2lsRnVuYyggY29udGV4dC5FUVVBTCwgMSwgMHhmZmZmZmZmZiApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5zd2FwQnVmZmVycygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHBhc3MgaW5zdGFuY2VvZiBUSFJFRS5NYXNrUGFzcyApIHtcblx0XHRcdFx0bWFza0FjdGl2ZSA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKCBwYXNzIGluc3RhbmNlb2YgVEhSRUUuQ2xlYXJNYXNrUGFzcyApIHtcblx0XHRcdFx0bWFza0FjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRyZXNldDogZnVuY3Rpb24gKCByZW5kZXJUYXJnZXQgKSB7XG5cdFx0aWYgKCByZW5kZXJUYXJnZXQgPT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHJlbmRlclRhcmdldCA9IHRoaXMucmVuZGVyVGFyZ2V0MS5jbG9uZSgpO1xuXHRcdFx0dmFyIHBpeGVsUmF0aW8gPSB0aGlzLnJlbmRlcmVyLmdldFBpeGVsUmF0aW8oKTtcblx0XHRcdHJlbmRlclRhcmdldC53aWR0aCAgPSBNYXRoLmZsb29yKCB0aGlzLnJlbmRlcmVyLmNvbnRleHQuY2FudmFzLndpZHRoICAvIHBpeGVsUmF0aW8gKTtcblx0XHRcdHJlbmRlclRhcmdldC5oZWlnaHQgPSBNYXRoLmZsb29yKCB0aGlzLnJlbmRlcmVyLmNvbnRleHQuY2FudmFzLmhlaWdodCAvIHBpeGVsUmF0aW8gKTtcblx0XHR9XG5cblx0XHR0aGlzLnJlbmRlclRhcmdldDEgPSByZW5kZXJUYXJnZXQ7XG5cdFx0dGhpcy5yZW5kZXJUYXJnZXQyID0gcmVuZGVyVGFyZ2V0LmNsb25lKCk7XG5cdFx0dGhpcy53cml0ZUJ1ZmZlciA9IHRoaXMucmVuZGVyVGFyZ2V0MTtcblx0XHR0aGlzLnJlYWRCdWZmZXIgPSB0aGlzLnJlbmRlclRhcmdldDI7XG5cdH0sXG5cblx0c2V0U2l6ZTogZnVuY3Rpb24gKCB3aWR0aCwgaGVpZ2h0ICkge1xuXHRcdHZhciByZW5kZXJUYXJnZXQgPSB0aGlzLnJlbmRlclRhcmdldDEuY2xvbmUoKTtcblx0XHRyZW5kZXJUYXJnZXQud2lkdGggPSB3aWR0aDtcblx0XHRyZW5kZXJUYXJnZXQuaGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdHRoaXMucmVzZXQoIHJlbmRlclRhcmdldCApO1xuXHR9XG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuTWFza1Bhc3MgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEgKSB7XG5cblx0dGhpcy5zY2VuZSA9IHNjZW5lO1xuXHR0aGlzLmNhbWVyYSA9IGNhbWVyYTtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXHR0aGlzLmNsZWFyID0gdHJ1ZTtcblx0dGhpcy5uZWVkc1N3YXAgPSBmYWxzZTtcblxuXHR0aGlzLmludmVyc2UgPSBmYWxzZTtcblxufTtcblxuVEhSRUUuTWFza1Bhc3MucHJvdG90eXBlID0ge1xuXG5cdHJlbmRlcjogZnVuY3Rpb24gKCByZW5kZXJlciwgd3JpdGVCdWZmZXIsIHJlYWRCdWZmZXIsIGRlbHRhICkge1xuXG5cdFx0dmFyIGNvbnRleHQgPSByZW5kZXJlci5jb250ZXh0O1xuXG5cdFx0Ly8gZG9uJ3QgdXBkYXRlIGNvbG9yIG9yIGRlcHRoXG5cblx0XHRjb250ZXh0LmNvbG9yTWFzayggZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgKTtcblx0XHRjb250ZXh0LmRlcHRoTWFzayggZmFsc2UgKTtcblxuXHRcdC8vIHNldCB1cCBzdGVuY2lsXG5cblx0XHR2YXIgd3JpdGVWYWx1ZSwgY2xlYXJWYWx1ZTtcblxuXHRcdGlmICggdGhpcy5pbnZlcnNlICkge1xuXG5cdFx0XHR3cml0ZVZhbHVlID0gMDtcblx0XHRcdGNsZWFyVmFsdWUgPSAxO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0d3JpdGVWYWx1ZSA9IDE7XG5cdFx0XHRjbGVhclZhbHVlID0gMDtcblxuXHRcdH1cblxuXHRcdGNvbnRleHQuZW5hYmxlKCBjb250ZXh0LlNURU5DSUxfVEVTVCApO1xuXHRcdGNvbnRleHQuc3RlbmNpbE9wKCBjb250ZXh0LlJFUExBQ0UsIGNvbnRleHQuUkVQTEFDRSwgY29udGV4dC5SRVBMQUNFICk7XG5cdFx0Y29udGV4dC5zdGVuY2lsRnVuYyggY29udGV4dC5BTFdBWVMsIHdyaXRlVmFsdWUsIDB4ZmZmZmZmZmYgKTtcblx0XHRjb250ZXh0LmNsZWFyU3RlbmNpbCggY2xlYXJWYWx1ZSApO1xuXG5cdFx0Ly8gZHJhdyBpbnRvIHRoZSBzdGVuY2lsIGJ1ZmZlclxuXG5cdFx0cmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSwgcmVhZEJ1ZmZlciwgdGhpcy5jbGVhciApO1xuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHdyaXRlQnVmZmVyLCB0aGlzLmNsZWFyICk7XG5cblx0XHQvLyByZS1lbmFibGUgdXBkYXRlIG9mIGNvbG9yIGFuZCBkZXB0aFxuXG5cdFx0Y29udGV4dC5jb2xvck1hc2soIHRydWUsIHRydWUsIHRydWUsIHRydWUgKTtcblx0XHRjb250ZXh0LmRlcHRoTWFzayggdHJ1ZSApO1xuXG5cdFx0Ly8gb25seSByZW5kZXIgd2hlcmUgc3RlbmNpbCBpcyBzZXQgdG8gMVxuXG5cdFx0Y29udGV4dC5zdGVuY2lsRnVuYyggY29udGV4dC5FUVVBTCwgMSwgMHhmZmZmZmZmZiApOyAgLy8gZHJhdyBpZiA9PSAxXG5cdFx0Y29udGV4dC5zdGVuY2lsT3AoIGNvbnRleHQuS0VFUCwgY29udGV4dC5LRUVQLCBjb250ZXh0LktFRVAgKTtcblxuXHR9XG5cbn07XG5cblxuVEhSRUUuQ2xlYXJNYXNrUGFzcyA9IGZ1bmN0aW9uICgpIHtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG59O1xuXG5USFJFRS5DbGVhck1hc2tQYXNzLnByb3RvdHlwZSA9IHtcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICggcmVuZGVyZXIsIHdyaXRlQnVmZmVyLCByZWFkQnVmZmVyLCBkZWx0YSApIHtcblxuXHRcdHZhciBjb250ZXh0ID0gcmVuZGVyZXIuY29udGV4dDtcblxuXHRcdGNvbnRleHQuZGlzYWJsZSggY29udGV4dC5TVEVOQ0lMX1RFU1QgKTtcblxuXHR9XG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgZmVsaXh0dXJuZXIgLyBodHRwOi8vYWlydGlnaHQuY2MvXG4gKlxuICogUkdCIFNoaWZ0IFNoYWRlclxuICogU2hpZnRzIHJlZCBhbmQgYmx1ZSBjaGFubmVscyBmcm9tIGNlbnRlciBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25zXG4gKiBQb3J0ZWQgZnJvbSBodHRwOi8va3Jpc3MuY3gvdG9tLzIwMDkvMDUvcmdiLXNoaWZ0L1xuICogYnkgVG9tIEJ1dHRlcndvcnRoIC8gaHR0cDovL2tyaXNzLmN4L3RvbS9cbiAqXG4gKiBhbW91bnQ6IHNoaWZ0IGRpc3RhbmNlICgxIGlzIHdpZHRoIG9mIGlucHV0KVxuICogYW5nbGU6IHNoaWZ0IGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuXG5USFJFRS5SR0JTaGlmdFNoYWRlciA9IHtcblxuXHR1bmlmb3Jtczoge1xuXG5cdFx0XCJ0RGlmZnVzZVwiOiB7IHR5cGU6IFwidFwiLCB2YWx1ZTogbnVsbCB9LFxuXHRcdFwiYW1vdW50XCI6ICAgeyB0eXBlOiBcImZcIiwgdmFsdWU6IDAuMDA1IH0sXG5cdFx0XCJhbmdsZVwiOiAgICB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogMC4wIH1cblxuXHR9LFxuXG5cdHZlcnRleFNoYWRlcjogW1xuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidlV2ID0gdXY7XCIsXG5cdFx0XHRcImdsX1Bvc2l0aW9uID0gcHJvamVjdGlvbk1hdHJpeCAqIG1vZGVsVmlld01hdHJpeCAqIHZlYzQoIHBvc2l0aW9uLCAxLjAgKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpLFxuXG5cdGZyYWdtZW50U2hhZGVyOiBbXG5cblx0XHRcInVuaWZvcm0gc2FtcGxlcjJEIHREaWZmdXNlO1wiLFxuXHRcdFwidW5pZm9ybSBmbG9hdCBhbW91bnQ7XCIsXG5cdFx0XCJ1bmlmb3JtIGZsb2F0IGFuZ2xlO1wiLFxuXG5cdFx0XCJ2YXJ5aW5nIHZlYzIgdlV2O1wiLFxuXG5cdFx0XCJ2b2lkIG1haW4oKSB7XCIsXG5cblx0XHRcdFwidmVjMiBvZmZzZXQgPSBhbW91bnQgKiB2ZWMyKCBjb3MoYW5nbGUpLCBzaW4oYW5nbGUpKTtcIixcblx0XHRcdFwidmVjNCBjciA9IHRleHR1cmUyRCh0RGlmZnVzZSwgdlV2ICsgb2Zmc2V0KTtcIixcblx0XHRcdFwidmVjNCBjZ2EgPSB0ZXh0dXJlMkQodERpZmZ1c2UsIHZVdik7XCIsXG5cdFx0XHRcInZlYzQgY2IgPSB0ZXh0dXJlMkQodERpZmZ1c2UsIHZVdiAtIG9mZnNldCk7XCIsXG5cdFx0XHRcImdsX0ZyYWdDb2xvciA9IHZlYzQoY3IuciwgY2dhLmcsIGNiLmIsIGNnYS5hKTtcIixcblxuXHRcdFwifVwiXG5cblx0XS5qb2luKFwiXFxuXCIpXG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuUmVuZGVyUGFzcyA9IGZ1bmN0aW9uICggc2NlbmUsIGNhbWVyYSwgb3ZlcnJpZGVNYXRlcmlhbCwgY2xlYXJDb2xvciwgY2xlYXJBbHBoYSApIHtcblxuXHR0aGlzLnNjZW5lID0gc2NlbmU7XG5cdHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuXG5cdHRoaXMub3ZlcnJpZGVNYXRlcmlhbCA9IG92ZXJyaWRlTWF0ZXJpYWw7XG5cblx0dGhpcy5jbGVhckNvbG9yID0gY2xlYXJDb2xvcjtcblx0dGhpcy5jbGVhckFscGhhID0gKCBjbGVhckFscGhhICE9PSB1bmRlZmluZWQgKSA/IGNsZWFyQWxwaGEgOiAxO1xuXG5cdHRoaXMub2xkQ2xlYXJDb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuXHR0aGlzLm9sZENsZWFyQWxwaGEgPSAxO1xuXG5cdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cdHRoaXMuY2xlYXIgPSB0cnVlO1xuXHR0aGlzLm5lZWRzU3dhcCA9IGZhbHNlO1xuXG59O1xuXG5USFJFRS5SZW5kZXJQYXNzLnByb3RvdHlwZSA9IHtcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICggcmVuZGVyZXIsIHdyaXRlQnVmZmVyLCByZWFkQnVmZmVyLCBkZWx0YSApIHtcblxuICAgIGNvbnNvbGUubG9nKCdSZW5kZXJQYXNzOjpyZW5kZXIgLScsIHJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgZGVsdGEpO1xuXG5cdFx0dGhpcy5zY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gdGhpcy5vdmVycmlkZU1hdGVyaWFsO1xuXG5cdFx0aWYgKCB0aGlzLmNsZWFyQ29sb3IgKSB7XG5cblx0XHRcdHRoaXMub2xkQ2xlYXJDb2xvci5jb3B5KCByZW5kZXJlci5nZXRDbGVhckNvbG9yKCkgKTtcblx0XHRcdHRoaXMub2xkQ2xlYXJBbHBoYSA9IHJlbmRlcmVyLmdldENsZWFyQWxwaGEoKTtcblxuXHRcdFx0cmVuZGVyZXIuc2V0Q2xlYXJDb2xvciggdGhpcy5jbGVhckNvbG9yLCB0aGlzLmNsZWFyQWxwaGEgKTtcblxuXHRcdH1cblxuXHRcdHJlbmRlcmVyLnJlbmRlciggdGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEsIHJlYWRCdWZmZXIsIHRoaXMuY2xlYXIgKTtcblxuXHRcdGlmICggdGhpcy5jbGVhckNvbG9yICkge1xuXG5cdFx0XHRyZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLm9sZENsZWFyQ29sb3IsIHRoaXMub2xkQ2xlYXJBbHBoYSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5zY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gbnVsbDtcblxuXHR9XG5cbn07XG5cblRIUkVFLlN0ZXJlb1JlbmRlclBhc3MgPSBmdW5jdGlvbiAoIHNjZW5lLCBjYW1lcmEsIG92ZXJyaWRlTWF0ZXJpYWwsIGNsZWFyQ29sb3IsIGNsZWFyQWxwaGEgKSB7XG5cblx0dGhpcy5zY2VuZSA9IHNjZW5lO1xuXHR0aGlzLmNhbWVyYUwgPSBjYW1lcmE7XG5cdHRoaXMuY2FtZXJhUiA9IGNhbWVyYS5jbG9uZTtcblxuXHR0aGlzLm92ZXJyaWRlTWF0ZXJpYWwgPSBvdmVycmlkZU1hdGVyaWFsO1xuXG5cdHRoaXMuY2xlYXJDb2xvciA9IGNsZWFyQ29sb3I7XG5cdHRoaXMuY2xlYXJBbHBoYSA9ICggY2xlYXJBbHBoYSAhPT0gdW5kZWZpbmVkICkgPyBjbGVhckFscGhhIDogMTtcblxuXHR0aGlzLm9sZENsZWFyQ29sb3IgPSBuZXcgVEhSRUUuQ29sb3IoKTtcblx0dGhpcy5vbGRDbGVhckFscGhhID0gMTtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXHR0aGlzLmNsZWFyID0gdHJ1ZTtcblx0dGhpcy5uZWVkc1N3YXAgPSBmYWxzZTtcblxufTtcblxuVEhSRUUuU3RlcmVvUmVuZGVyUGFzcy5wcm90b3R5cGUgPSB7XG5cblx0cmVuZGVyOiBmdW5jdGlvbiAoIHJlbmRlcmVyLCB3cml0ZUJ1ZmZlciwgcmVhZEJ1ZmZlciwgZGVsdGEgKSB7XG5cblx0XHR0aGlzLnNjZW5lLm92ZXJyaWRlTWF0ZXJpYWwgPSB0aGlzLm92ZXJyaWRlTWF0ZXJpYWw7XG5cblx0XHRpZiAoIHRoaXMuY2xlYXJDb2xvciApIHtcblxuXHRcdFx0dGhpcy5vbGRDbGVhckNvbG9yLmNvcHkoIHJlbmRlcmVyLmdldENsZWFyQ29sb3IoKSApO1xuXHRcdFx0dGhpcy5vbGRDbGVhckFscGhhID0gcmVuZGVyZXIuZ2V0Q2xlYXJBbHBoYSgpO1xuXG5cdFx0XHRyZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLmNsZWFyQ29sb3IsIHRoaXMuY2xlYXJBbHBoYSApO1xuXG5cdFx0fVxuXG5cdFx0cmVuZGVyZXIucmVuZGVyKCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYUwsIHJlYWRCdWZmZXIsIHRoaXMuY2xlYXIgKTtcblxuXHRcdGlmICggdGhpcy5jbGVhckNvbG9yICkge1xuXG5cdFx0XHRyZW5kZXJlci5zZXRDbGVhckNvbG9yKCB0aGlzLm9sZENsZWFyQ29sb3IsIHRoaXMub2xkQ2xlYXJBbHBoYSApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5zY2VuZS5vdmVycmlkZU1hdGVyaWFsID0gbnVsbDtcblxuXHR9XG5cbn07XG4iLCIvKipcbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKi9cblxuVEhSRUUuU2hhZGVyUGFzcyA9IGZ1bmN0aW9uICggc2hhZGVyLCB0ZXh0dXJlSUQgKSB7XG5cblx0dGhpcy50ZXh0dXJlSUQgPSAoIHRleHR1cmVJRCAhPT0gdW5kZWZpbmVkICkgPyB0ZXh0dXJlSUQgOiBcInREaWZmdXNlXCI7XG5cblx0dGhpcy51bmlmb3JtcyA9IFRIUkVFLlVuaWZvcm1zVXRpbHMuY2xvbmUoIHNoYWRlci51bmlmb3JtcyApO1xuXG5cdHRoaXMubWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIHtcblxuICAgICAgICBcdGRlZmluZXM6IHNoYWRlci5kZWZpbmVzIHx8IHt9LFxuXHRcdHVuaWZvcm1zOiB0aGlzLnVuaWZvcm1zLFxuXHRcdHZlcnRleFNoYWRlcjogc2hhZGVyLnZlcnRleFNoYWRlcixcblx0XHRmcmFnbWVudFNoYWRlcjogc2hhZGVyLmZyYWdtZW50U2hhZGVyXG5cblx0fSApO1xuXG5cdHRoaXMucmVuZGVyVG9TY3JlZW4gPSBmYWxzZTtcblxuXHR0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXHR0aGlzLm5lZWRzU3dhcCA9IHRydWU7XG5cdHRoaXMuY2xlYXIgPSBmYWxzZTtcblxuXG5cdHRoaXMuY2FtZXJhID0gbmV3IFRIUkVFLk9ydGhvZ3JhcGhpY0NhbWVyYSggLTEsIDEsIDEsIC0xLCAwLCAxICk7XG5cdHRoaXMuc2NlbmUgID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cblx0dGhpcy5xdWFkID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5QbGFuZUJ1ZmZlckdlb21ldHJ5KCAyLCAyICksIG51bGwgKTtcblx0dGhpcy5zY2VuZS5hZGQoIHRoaXMucXVhZCApO1xuXG59O1xuXG5USFJFRS5TaGFkZXJQYXNzLnByb3RvdHlwZSA9IHtcblxuXHRyZW5kZXI6IGZ1bmN0aW9uICggcmVuZGVyZXIsIHdyaXRlQnVmZmVyLCByZWFkQnVmZmVyLCBkZWx0YSApIHtcblxuXHRcdGlmICggdGhpcy51bmlmb3Jtc1sgdGhpcy50ZXh0dXJlSUQgXSApIHtcblxuXHRcdFx0dGhpcy51bmlmb3Jtc1sgdGhpcy50ZXh0dXJlSUQgXS52YWx1ZSA9IHJlYWRCdWZmZXI7XG5cblx0XHR9XG5cblx0XHR0aGlzLnF1YWQubWF0ZXJpYWwgPSB0aGlzLm1hdGVyaWFsO1xuXG5cdFx0aWYgKCB0aGlzLnJlbmRlclRvU2NyZWVuICkge1xuXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRyZW5kZXJlci5yZW5kZXIoIHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhLCB3cml0ZUJ1ZmZlciwgdGhpcy5jbGVhciApO1xuXG5cdFx0fVxuXG5cdH1cblxufTtcbiIsIlxucmVxdWlyZSgnLi9SR0JTaGlmdFNoYWRlci5qcycpO1xucmVxdWlyZSgnLi9Db252b2x1dGlvblNoYWRlci5qcycpO1xucmVxdWlyZSgnLi9Db3B5U2hhZGVyLmpzJyk7XG5yZXF1aXJlKCcuL0RvdFNjcmVlblNoYWRlci5qcycpO1xuXG5yZXF1aXJlKCcuL0Jsb29tUGFzcy5qcycpO1xucmVxdWlyZSgnLi9NYXNrUGFzcy5qcycpO1xucmVxdWlyZSgnLi9SZW5kZXJQYXNzLmpzJyk7XG5yZXF1aXJlKCcuL1NoYWRlclBhc3MuanMnKTtcblxucmVxdWlyZSgnLi9FZmZlY3RDb21wb3Nlci5qcycpO1xuXG4iXX0=
