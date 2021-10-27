////CONSTANTS
"use strict";
var _defaultAspect = 16 / 9
var _maxLightCount = 64 //NOTE: THIS VALUE MUST MATCH THE SIZE OF THE LIGHT ARRAYS IN THE SHADERS
var _fisqrt = {y: new Float32Array( 1 ), i: new Int32Array( _fisqrt.y.buffer )}

////DO-NOT-TOUCH VARIABLES (updated constantly in the engine)
var _time = 0;
var _id = 0


////USER INPUT
var _keyBuffer = [];
var _mouseBuffer = []


////ENGINE ELEMENTS
var _objects = [];
var _buffers = [];
var _cameras = [];
var _lights = [];


////COLLISION VARIABLES
var _maskMap = []


////DEFAULT RENDERING ELEMENTS
var _gl;
var _canvas;
var _bData;
var _mainCamera;
var _program;


////DEFAULT GAME OBJECTS
var _coords;


////DEBUG CONSOLE VARS
var _consoleBuffer = []
var _consoleBufferLock = false
var _removedMessages = 0, _maxConsoleBuffer = 1000


////USER-DEFINED REQUIRED FUNCTIONS
var _userTickFunction, _userInitFunction, _userPostTickFunction, _userKeyFunction, _userMouseFunction