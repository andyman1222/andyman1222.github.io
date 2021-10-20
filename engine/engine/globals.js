////CONSTANTS
"use strict";
var defaultAspect = 16 / 9
var maxLightCount = 64 //NOTE: THIS VALUE MUST MATCH THE SIZE OF THE LIGHT ARRAYS IN THE SHADERS


////DO-NOT-TOUCH VARIABLES (updated constantly in the engine)
var time = 0;
var id = 0
var keys = []


////ENGINE ELEMENTS
var objects = [];
var buffers = [];
var cameras = [];
var lights = [];


////COLLISION VARIABLES
var maskMap = []


////DEFAULT RENDERING ELEMENTS
var gl;
var canvas;
var bData;
var mainCamera;


////DEFAULT GAME OBJECTS
var coords;


////DEBUG CONSOLE VARS
var consoleBuffer = []
var consoleBufferLock = false
var removedMessages = 0, maxConsoleBuffer = 1000



////USER-DEFINED REQUIRED FUNCTIONS
var userTickFunction, userInitFunction