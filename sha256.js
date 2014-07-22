// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['thisProgram'] = process['argv'][1];
  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var stack = 0;
  var JSfuncs = {
    'stackSave' : function() {
      stack = Runtime.stackSave();
    },
    'stackRestore' : function() {
      Runtime.stackRestore(stack);
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        ret = Runtime.stackAlloc(str.length + 1); // +1 for the trailing '\0'
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. A convenient way to call C functions (in C files, or
  // defined with extern "C").
  //
  // Note: ccall/cwrap use the C stack for temporary values. If you pass a string
  //       then it is only alive until the call is complete. If the code being
  //       called saves the pointer to be used later, it may point to invalid
  //       data. If you need a string to live forever, you can create it (and
  //       must later delete it manually!) using malloc and writeStringToMemory,
  //       for example.
  //
  // Note: LLVM optimizations can inline and remove functions, after which you will not be
  //       able to call them. Closure can also do so. To avoid that, add your function to
  //       the exports using something like
  //
  //         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
  //
  // @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
  // @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
  //                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
  // @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
  //                   except that 'array' is not possible (there is no way for us to know the length of the array)
  // @param args       An array of the arguments to the function, as native JS values (as in returnType)
  //                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
  // @return           The return value, as a native JS value (as in returnType)
  ccall = function ccallFunc(ident, returnType, argTypes, args) {
    assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
    var func = getCFunc(ident);
    var cArgs = [];
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) JSfuncs['stackRestore']();
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }
  // Returns a native JS wrapper for a C function. This is similar to ccall, but
  // returns a function you can call repeatedly in a normal way. For example:
  //
  //   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
  //   alert(my_function(5, 22));
  //   alert(my_function(99, 12));
  //
  cwrap = function cwrap(ident, returnType, argTypes) {
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    funcstr += "assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');\n";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["cwrap"] = cwrap;
Module["ccall"] = ccall;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
  runtimeInitialized = false;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(35515);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([103,230,9,106,133,174,103,187,114,243,110,60,58,245,79,165,127,82,14,81,140,104,5,155,171,217,131,31,25,205,224,91,70,97,105,108,32,119,105,116,104,32,108,101,110,103,116,104,32,37,100,10,0,0,0,0,0,0,0,0,0,0,0,0,101,51,98,48,99,52,52,50,57,56,102,99,49,99,49,52,57,97,102,98,102,52,99,56,57,57,54,102,98,57,50,52,50,55,97,101,52,49,101,52,54,52,57,98,57,51,52,99,97,52,57,53,57,57,49,98,55,56,53,50,98,56,53,53,0,0,0,0,0,0,0,0,48,0,0,0,0,0,0,0,53,102,101,99,101,98,54,54,102,102,99,56,54,102,51,56,100,57,53,50,55,56,54,99,54,100,54,57,54,99,55,57,99,50,100,98,99,50,51,57,100,100,52,101,57,49,98,52,54,55,50,57,100,55,51,97,50,55,102,98,53,55,101,57,0,0,0,0,0,0,0,0,54,50,0,0,0,0,0,0,56,49,98,56,97,48,51,102,57,55,101,56,55,56,55,99,53,51,102,101,49,97,56,54,98,100,97,48,52,50,98,54,102,48,100,101,57,98,48,101,99,57,99,48,57,51,53,55,101,49,48,55,99,57,57,98,97,52,100,54,57,52,56,97,0,0,0,0,0,0,0,0,102,99,101,0,0,0,0,0,102,54,48,97,57,97,51,102,99,102,97,100,55,99,49,99,100,53,53,100,97,97,48,57,53,100,52,102,54,98,48,102,51,97,102,56,49,101,57,54,54,56,99,51,55,97,99,97,50,97,99,53,55,56,102,102,102,49,50,51,49,100,57,52,0,0,0,0,0,0,0,0,99,49,56,99,0,0,0,0,55,56,100,57,48,100,98,102,50,102,49,100,100,48,52,56,99,57,102,53,51,50,56,55,53,97,99,54,101,100,56,102,99,57,50,49,97,48,55,49,57,99,57,99,48,55,55,102,98,48,49,49,100,97,56,98,52,54,52,99,56,49,52,101,0,0,0,0,0,0,0,0,53,51,99,51,100,0,0,0,55,51,100,97,98,101,102,57,53,99,51,102,53,55,48,53,52,57,102,97,54,53,50,102,56,102,99,49,52,102,48,99,102,99,57,49,102,48,52,102,102,52,51,50,101,55,54,52,55,99,100,57,51,98,98,54,54,54,51,50,97,102,101,57,0,0,0,0,0,0,0,0,98,101,102,49,52,101,0,0,97,48,50,55,101,52,99,53,102,98,53,53,52,98,97,52,99,55,56,51,55,57,53,97,55,52,53,49,50,48,49,48,98,101,51,97,53,100,100,52,54,53,97,102,99,98,50,100,101,52,51,50,52,57,100,97,53,102,101,56,102,97,48,99,0,0,0,0,0,0,0,0,99,48,54,54,53,51,48,0,101,99,98,57,52,57,101,101,98,102,101,54,57,55,99,51,54,50,53,57,51,52,102,56,55,54,49,50,49,54,53,54,101,100,101,49,102,101,53,99,55,98,99,53,97,55,99,97,50,51,98,56,102,99,100,97,100,48,48,101,99,51,55,57,0,0,0,0,0,0,0,0,101,54,49,101,99,56,56,55,0,0,0,0,0,0,0,0,97,57,53,50,102,100,54,54,48,101,100,57,50,55,101,51,52,57,52,98,99,55,98,49,54,101,49,100,51,98,52,99,50,99,102,101,52,56,99,102,98,98,54,57,99,50,101,57,98,97,57,51,53,56,97,50,101,48,55,49,97,100,57,54,0,0,0,0,0,0,0,0,49,54,51,53,50,100,51,53,102,0,0,0,0,0,0,0,56,97,49,98,53,101,51,48,52,55,101,99,100,52,55,50,102,57,55,97,101,50,48,51,100,53,51,53,56,57,52,50,52,100,49,56,55,52,57,53,54,56,50,50,99,52,53,98,54,57,56,55,98,53,54,99,51,53,52,48,97,56,48,101,0,0,0,0,0,0,0,0,54,49,52,48,101,51,98,101,57,53,0,0,0,0,0,0,102,52,54,51,48,100,102,52,97,56,52,97,49,56,97,49,49,55,51,48,56,50,52,57,54,98,53,102,55,97,49,52,101,56,52,48,53,101,52,52,54,56,100,57,52,98,51,48,51,50,99,56,51,49,52,98,101,48,51,49,57,97,53,97,0,0,0,0,0,0,0,0,52,101,57,49,53,56,56,48,100,49,56,0,0,0,0,0,50,54,51,53,48,54,97,100,56,57,50,99,54,54,101,51,51,55,99,54,98,52,53,100,54,53,100,97,102,100,56,100,99,50,100,50,57,53,98,52,50,101,99,97,52,53,99,55,101,97,99,51,101,56,55,49,99,51,101,54,54,53,54,55,0,0,0,0,0,0,0,0,100,54,56,98,55,97,98,102,51,97,100,100,0,0,0,0,50,100,57,98,52,98,97,53,52,51,101,100,57,51,101,99,97,97,49,52,57,51,55,51,56,57,57,51,102,100,57,99,102,101,50,101,100,54,102,100,49,50,52,50,53,48,53,56,56,100,55,57,48,56,49,102,57,98,51,53,55,97,101,53,0,0,0,0,0,0,0,0,53,49,51,57,49,102,52,49,56,57,48,100,48,0,0,0,51,50,57,55,102,48,55,99,97,55,51,97,98,49,54,100,100,56,51,100,55,101,99,51,101,55,99,101,52,56,50,54,101,51,57,98,101,56,53,48,98,100,97,101,97,99,56,48,98,55,53,53,53,53,53,102,56,50,55,50,101,50,97,101,0,0,0,0,0,0,0,0,55,101,48,98,49,56,99,53,101,48,57,52,57,54,0,0,98,101,55,55,99,49,49,54,97,100,57,53,101,57,100,101,98,97,97,53,56,52,101,55,98,102,98,99,102,53,98,53,100,48,50,54,97,49,100,99,55,101,50,100,49,100,102,97,102,102,50,101,55,98,54,56,51,51,49,100,49,99,99,51,0,0,0,0,0,0,0,0,97,51,101,54,101,55,57,100,102,97,54,54,52,51,55,0,55,54,57,49,51,57,48,57,99,51,53,48,54,50,55,52,97,101,57,99,101,54,101,56,49,102,50,54,48,51,53,53,57,51,101,101,98,49,51,98,52,102,102,97,51,99,49,56,48,48,53,51,55,54,99,48,57,99,50,57,53,54,54,99,0,0,0,0,0,0,0,0,99,56,54,102,50,98,48,97,98,53,51,56,50,101,97,53,0,0,0,0,0,0,0,0,51,54,50,52,98,97,97,54,56,101,54,53,52,48,100,53,52,48,102,48,49,51,55,52,98,52,102,55,98,57,49,97,52,100,54,100,101,97,48,56,100,101,49,57,57,55,101,53,56,57,97,53,48,100,101,102,99,48,50,51,49,100,100,54,0,0,0,0,0,0,0,0,48,98,98,51,49,56,55,52,54,48,57,102,100,54,57,100,55,0,0,0,0,0,0,0,52,53,101,51,100,57,50,97,48,57,51,101,97,52,97,98,48,98,53,99,102,101,51,102,53,49,57,97,100,52,54,54,55,51,99,56,99,101,49,52,55,50,54,48,56,57,57,50,50,57,50,48,54,101,97,57,50,53,55,57,56,54,51,102,0,0,0,0,0,0,0,0,48,98,54,54,55,50,51,101,48,102,102,48,100,98,57,55,55,101,0,0,0,0,0,0,102,50,48,48,48,55,54,51,54,98,49,51,52,53,52,102,53,54,55,52,48,55,102,51,49,99,56,101,97,52,54,54,53,100,101,52,51,97,99,50,56,97,99,53,48,57,52,57,101,48,102,97,101,49,53,101,49,97,52,48,54,53,50,101,0,0,0,0,0,0,0,0,54,98,54,56,97,48,98,53,48,49,101,51,52,51,99,51,97,53,49,0,0,0,0,0,50,98,51,51,49,52,51,51,101,102,99,101,97,54,56,50,55,54,52,50,54,51,50,56,52,53,56,49,102,48,56,98,97,98,52,100,100,100,50,51,53,101,98,54,57,52,98,50,51,55,98,55,99,49,54,55,56,97,99,102,50,101,53,97,0,0,0,0,0,0,0,0,100,100,102,53,98,53,101,53,101,48,99,98,55,54,100,51,100,97,100,101,0,0,0,0,56,48,54,101,97,99,49,99,56,101,50,55,57,101,102,98,54,48,50,99,55,98,56,56,52,51,49,50,50,54,52,54,101,52,55,102,53,52,50,55,98,50,48,99,100,55,48,57,98,101,51,53,101,48,57,98,50,52,98,56,54,55,51,102,0,0,0,0,0,0,0,0,48,57,55,101,51,51,97,99,57,54,101,99,57,101,57,52,52,54,53,53,56,0,0,0,48,53,49,99,97,102,97,55,54,101,101,54,49,102,98,102,51,57,51,52,102,98,56,97,102,53,49,55,56,50,52,97,57,100,99,98,57,48,50,53,55,48,101,51,100,97,98,98,56,97,51,102,53,50,99,57,54,99,97,52,51,100,49,52,0,0,0,0,0,0,0,0,57,57,48,57,49,99,99,53,101,99,98,54,49,54,48,52,54,100,53,57,101,100,0,0,54,99,99,49,52,51,57,97,55,51,48,51,56,54,102,97,55,57,51,57,101,101,100,102,101,102,49,52,102,57,55,102,57,100,98,101,57,100,100,102,50,51,52,50,102,53,54,50,54,100,55,98,49,99,48,100,48,102,101,54,48,55,55,48,0,0,0,0,0,0,0,0,51,48,99,51,48,56,102,101,57,101,56,49,57,99,48,99,102,98,52,56,54,97,48,0,97,99,100,100,102,51,52,57,101,101,102,57,51,54,100,52,48,55,102,48,55,97,52,102,52,48,98,51,100,102,53,100,99,51,56,56,101,56,101,49,100,48,100,102,52,57,48,52,51,57,99,53,98,57,54,101,102,48,49,51,100,49,54,52,0,0,0,0,0,0,0,0,49,48,98,101,50,51,53,48,99,99,101,49,53,53,56,100,101,55,101,51,99,98,52,57,0,0,0,0,0,0,0,0,54,102,98,57,54,57,55,53,97,49,100,97,49,101,56,99,98,101,98,99,98,53,50,53,49,55,98,49,102,50,100,97,51,99,54,50,97,48,102,102,54,99,101,49,53,98,99,99,49,99,53,56,49,52,48,53,57,51,102,54,101,54,97,99,0,0,0,0,0,0,0,0,54,52,56,53,52,57,54,97,52,49,56,101,51,48,51,99,51,54,99,48,54,101,54,51,56,0,0,0,0,0,0,0,100,54,98,50,51,50,97,51,51,50,53,53,98,55,55,55,99,50,99,100,100,99,100,52,51,99,52,50,56,51,50,102,52,100,54,55,97,50,49,52,50,97,49,54,100,51,101,100,102,57,102,51,51,55,49,50,55,102,53,101,101,55,57,102,0,0,0,0,0,0,0,0,56,48,55,98,53,48,55,55,101,54,51,52,102,97,56,102,53,57,49,98,49,56,55,100,55,51,0,0,0,0,0,0,56,101,57,48,102,50,49,101,100,52,57,54,51,101,98,48,57,101,54,51,51,100,52,55,56,53,50,97,50,52,51,98,53,102,52,97,97,99,100,100,49,100,102,50,56,55,48,48,101,56,57,48,99,55,102,102,49,49,49,102,99,102,52,50,0,0,0,0,0,0,0,0,55,53,49,57,56,98,101,98,102,97,102,98,49,49,50,51,97,52,57,57,51,56,102,102,52,98,99,0,0,0,0,0,56,49,57,102,53,99,100,54,51,53,52,57,98,56,98,54,97,50,97,53,53,97,97,51,55,97,51,101,53,49,102,102,51,102,51,54,101,101,50,50,48,48,49,52,54,49,99,57,54,101,102,48,98,99,98,54,49,49,102,49,48,100,53,102,0,0,0,0,0,0,0,0,97,98,57,52,52,102,99,48,102,101,55,102,48,97,55,51,101,97,98,50,51,57,49,56,50,97,48,101,0,0,0,0,49,100,57,55,50,54,102,98,49,51,97,99,55,98,52,49,52,56,97,57,100,97,102,48,50,101,52,57,50,97,55,54,99,48,53,53,98,97,48,97,52,101,98,51,55,102,48,99,52,50,55,57,53,99,101,52,57,52,100,54,54,100,51,56,0,0,0,0,0,0,0,0,100,50,98,48,50,51,53,100,54,99,102,98,53,98,55,102,49,97,101,97,97,102,49,51,102,48,98,48,100,0,0,0,99,53,48,48,97,101,101,99,55,100,54,49,50,54,54,53,52,98,98,52,54,98,97,57,101,53,48,97,54,97,52,102,102,57,57,97,56,54,54,48,51,48,97,48,100,48,99,51,50,53,54,48,57,102,51,54,53,98,56,98,51,51,100,53,0,0,0,0,0,0,0,0,99,54,98,54,102,57,97,52,56,50,52,57,101,98,52,55,48,55,101,102,51,55,53,53,97,99,53,57,101,98,0,0,50,51,54,102,57,56,56,102,101,57,97,51,101,99,53,100,52,54,49,50,50,98,55,97,54,50,53,52,57,97,99,49,99,54,54,49,97,48,52,101,52,99,57,102,97,48,57,48,100,50,49,52,98,98,101,98,100,55,51,50,97,97,101,55,0,0,0,0,0,0,0,0,101,99,50,48,52,98,54,53,50,56,53,51,53,50,48,98,102,49,53,57,49,56,97,51,52,102,54,97,55,97,51,0,48,55,102,56,102,56,99,49,51,99,56,56,99,100,101,102,57,56,101,98,99,57,99,50,51,56,54,99,101,52,54,52,54,55,55,48,49,49,49,48,56,97,98,49,55,100,51,56,101,50,57,97,97,51,57,102,48,57,57,52,48,50,56,99,0,0,0,0,0,0,0,0,57,48,98,100,100,55,56,99,48,101,53,98,100,56,48,56,100,53,99,51,102,99,54,52,57,53,49,99,48,99,101,54,0,0,0,0,0,0,0,0,48,56,99,57,51,102,56,102,100,99,56,99,99,52,49,55,51,57,99,53,56,55,57,50,48,55,50,50,56,101,54,57,99,97,51,97,52,99,51,49,100,98,48,100,52,48,100,54,48,48,48,50,57,98,53,100,48,49,49,56,54,53,97,53,0,0,0,0,0,0,0,0,49,49,53,56,97,56,49,102,97,57,50,101,99,101,98,102,53,48,97,101,54,52,101,101,52,97,57,100,52,100,102,98,99,0,0,0,0,0,0,0,49,101,98,102,50,101,49,54,97,50,48,100,51,100,102,98,52,56,48,52,100,99,97,50,97,100,99,51,55,51,55,100,97,53,100,57,99,48,51,53,102,49,49,53,100,102,53,57,98,101,97,54,55,100,57,50,99,57,48,51,101,102,99,101,0,0,0,0,0,0,0,0,100,101,102,101,53,52,56,97,97,56,48,48,57,97,57,54,99,52,98,98,55,56,56,48,50,101,101,99,97,48,102,98,97,100,0,0,0,0,0,0,49,48,54,98,48,101,48,55,55,100,49,50,97,48,53,49,99,101,56,49,99,100,98,49,56,100,97,99,102,99,51,52,97,98,98,102,98,56,48,49,97,48,56,56,100,97,100,51,98,102,55,57,102,50,49,53,50,97,54,51,54,53,102,49,0,0,0,0,0,0,0,0,49,55,101,51,98,97,55,50,50,54,102,52,102,101,55,48,48,98,101,51,52,101,56,55,102,102,99,101,53,56,55,48,97,48,56,0,0,0,0,0,56,98,49,52,101,98,52,97,56,50,48,101,102,49,52,102,55,102,50,49,50,51,54,50,49,97,98,97,50,100,56,53,97,54,52,56,54,51,49,52,55,97,50,56,97,50,102,51,98,97,53,50,55,97,57,98,54,98,97,49,53,101,101,51,0,0,0,0,0,0,0,0,51,48,99,51,52,56,51,57,100,97,52,51,55,50,102,56,50,54,48,48,57,53,101,97,51,56,99,52,56,50,99,100,51,102,53,100,0,0,0,0,48,57,98,99,50,53,99,56,98,101,97,56,48,99,100,50,49,57,101,51,100,55,57,100,52,98,49,55,53,97,49,53,52,50,49,51,56,99,102,48,100,97,49,49,99,50,50,98,54,101,51,56,56,101,101,50,52,51,54,53,48,102,52,48,0,0,0,0,0,0,0,0,51,98,53,97,52,102,57,50,100,50,53,57,56,55,51,99,57,102,53,101,101,102,57,102,52,53,55,51,57,99,54,100,57,50,56,52,55,0,0,0,56,54,100,56,100,49,99,98,52,57,54,56,50,49,52,53,48,54,49,49,97,53,52,98,49,56,55,56,52,53,57,50,52,100,51,50,50,100,51,97,52,51,52,100,52,55,54,98,57,54,54,49,55,54,97,52,53,50,100,102,101,52,52,101,0,0,0,0,0,0,0,0,48,53,102,48,48,53,48,50,100,49,98,52,48,50,52,101,50,99,49,49,51,99,49,98,99,51,100,49,49,98,57,97,51,48,48,51,55,97,0,0,48,52,54,49,101,51,97,53,99,52,101,53,49,98,55,100,53,99,101,48,49,50,49,101,100,50,99,55,101,97,49,48,48,99,97,57,51,102,99,49,51,97,50,51,48,48,100,54,100,98,102,101,50,56,56,51,49,56,100,52,53,100,101,52,0,0,0,0,0,0,0,0,56,99,100,48,53,99,53,56,48,49,98,56,50,49,50,55,100,98,52,98,55,99,51,101,50,98,51,100,48,53,50,51,56,50,100,100,49,56,52,0,100,54,101,102,52,50,57,101,102,57,98,97,99,55,54,51,100,99,102,57,102,48,51,54,57,97,52,52,101,102,48,102,99,101,52,52,48,57,50,101,99,52,98,100,97,98,53,50,55,48,102,48,53,56,49,102,57,48,52,53,102,57,48,102,0,0,0,0,0,0,0,0,51,53,49,55,102,53,48,55,56,57,48,55,55,97,54,98,56,101,57,55,56,52,54,53,98,56,57,53,97,48,101,56,100,52,54,100,100,54,52,100,0,0,0,0,0,0,0,0,50,49,54,49,55,99,54,51,99,55,49,54,53,98,52,54,48,53,102,48,98,98,99,53,101,101,50,55,57,53,49,49,50,54,51,50,53,48,101,102,57,100,53,51,51,97,98,48,101,52,53,102,50,99,101,101,51,51,56,50,102,50,98,100,0,0,0,0,0,0,0,0,102,101,48,99,54,100,48,52,51,56,99,100,51,99,100,100,54,55,98,50,53,57,55,101,48,50,55,98,50,49,100,56,49,57,101,99,99,56,54,98,56,0,0,0,0,0,0,0,56,53,99,101,101,55,53,48,99,100,50,57,97,100,97,50,56,101,101,54,102,51,53,51,52,99,99,97,48,51,98,99,49,56,54,55,51,55,50,101,52,49,98,97,57,99,49,49,56,98,54,54,52,100,99,56,50,97,56,57,102,56,51,102,0,0,0,0,0,0,0,0,57,98,99,102,54,98,56,56,52,56,56,54,49,54,97,56,54,49,48,54,98,97,56,49,52,51,98,53,102,56,100,53,101,53,50,99,97,102,56,100,54,100,0,0,0,0,0,0,55,50,99,100,52,48,99,57,98,102,48,100,57,55,56,57,51,101,54,99,56,101,56,49,52,51,55,102,53,102,97,52,49,102,57,53,97,98,53,53,98,49,101,52,53,102,101,56,49,97,53,50,100,101,99,55,102,53,99,52,100,57,50,98,0,0,0,0,0,0,0,0,98,51,54,50,102,98,98,50,97,48,57,101,51,50,56,97,102,98,53,100,100,50,56,97,100,49,99,53,101,52,52,48,98,53,100,48,52,48,53,52,55,99,48,0,0,0,0,0,99,57,56,97,101,102,54,56,97,57,55,99,99,48,54,56,55,54,97,55,54,49,57,99,50,48,57,56,52,57,57,52,53,48,100,54,102,55,102,51,51,55,49,51,54,51,102,99,52,97,51,49,51,48,54,51,99,100,102,97,48,57,102,49,0,0,0,0,0,0,0,0,51,98,52,54,99,54,51,54,102,102,55,51,51,56,97,52,49,99,101,102,53,99,50,99,50,50,100,55,50,54,51,50,57,55,100,48,102,54,52,51,49,49,100,99,0,0,0,0,99,57,54,100,101,97,54,98,99,56,50,48,50,50,99,101,53,55,54,57,54,49,51,101,98,101,100,99,97,52,56,49,102,98,99,100,100,54,99,55,51,53,48,102,49,101,52,101,56,100,101,57,51,100,57,51,97,97,55,101,100,97,98,50,0,0,0,0,0,0,0,0,100,56,56,52,99,50,55,55,54,101,48,56,98,48,99,54,102,54,98,102,53,48,97,102,101,53,53,50,49,54,56,48,97,51,100,48,52,57,97,49,48,52,49,49,54,0,0,0,100,51,100,100,100,100,56,52,54,52,57,97,51,55,48,48,48,50,101,98,48,56,50,55,49,48,99,49,55,100,48,48,51,101,102,102,53,49,99,50,102,97,52,101,54,102,57,50,49,55,50,48,51,57,54,55,57,102,97,57,52,48,49,53,0,0,0,0,0,0,0,0,55,100,98,100,102,53,54,51,52,52,49,50,52,51,100,56,97,51,100,52,98,50,102,53,100,52,57,97,52,54,101,102,50,57,55,52,97,102,55,48,55,57,55,54,54,101,0,0,49,100,56,56,100,97,98,52,102,56,52,49,54,55,53,52,101,50,53,53,101,99,97,52,102,102,53,51,102,50,56,98,49,49,102,98,52,100,51,49,49,51,52,100,57,54,48,57,97,55,54,50,57,51,53,49,99,49,49,53,102,54,97,54,0,0,0,0,0,0,0,0,48,52,99,49,50,49,54,48,48,56,52,50,52,100,51,99,99,98,49,102,54,98,101,48,100,52,98,99,55,49,48,51,51,100,51,99,99,100,48,53,55,55,100,53,100,52,97,0,54,102,54,56,98,55,49,101,50,55,97,99,97,51,52,48,99,51,102,50,56,99,100,53,51,51,51,102,48,97,97,97,57,101,48,100,49,52,101,102,98,52,55,56,52,57,98,52,99,51,53,100,55,51,57,55,97,54,53,48,51,98,51,51,0,0,0,0,0,0,0,0,98,54,49,97,51,50,98,55,101,56,101,98,51,100,56,48,54,100,98,49,55,49,53,54,56,53,53,52,56,51,54,50,56,50,49,55,53,48,52,50,53,98,55,98,53,49,97,48,0,0,0,0,0,0,0,0,56,56,99,99,49,48,54,99,98,100,56,101,57,97,99,54,51,98,52,100,53,56,51,49,56,48,99,102,51,55,50,53,102,56,99,97,48,57,101,97,102,53,56,102,98,52,102,100,102,51,49,53,48,50,100,98,99,49,56,100,102,55,99,48,0,0,0,0,0,0,0,0,97,48,99,53,98,51,54,102,102,101,98,55,55,48,97,48,55,53,53,100,50,53,101,99,53,99,55,51,97,54,101,98,53,52,56,98,52,98,54,54,52,97,102,102,54,101,102,54,98,0,0,0,0,0,0,0,102,98,48,98,101,100,100,99,54,53,97,49,51,101,52,54,48,100,102,97,54,97,102,101,52,56,53,100,99,99,102,53,100,48,101,97,56,52,52,101,48,102,56,98,52,101,98,97,57,97,57,56,99,101,98,99,101,53,53,51,50,57,54,97,0,0,0,0,0,0,0,0,49,101,98,100,51,56,51,56,98,100,99,56,48,55,57,55,51,101,97,101,49,53,97,97,101,57,55,98,101,54,48,51,101,57,51,102,97,99,55,100,51,102,97,53,99,102,51,53,100,49,0,0,0,0,0,0,50,101,50,55,48,52,56,99,101,101,51,98,57,102,99,102,102,48,51,51,54,52,50,54,53,48,52,98,54,102,53,100,102,48,51,55,56,100,55,49,49,56,56,101,53,98,56,56,54,49,51,48,50,54,56,101,48,100,102,56,51,98,99,57,0,0,0,0,0,0,0,0,49,55,98,51,56,101,55,98,49,97,49,53,97,54,51,49,102,57,57,49,48,98,101,101,48,52,57,102,48,100,102,101,50,54,51,54,54,98,50,99,49,100,51,99,99,52,55,50,54,101,99,0,0,0,0,0,98,100,52,51,98,97,52,56,102,49,101,55,54,101,102,53,49,49,53,100,54,52,56,101,97,55,102,99,52,97,48,99,57,51,51,50,49,53,100,48,98,57,55,52,100,51,102,49,49,49,48,100,52,102,98,98,99,49,101,102,53,51,52,53,0,0,0,0,0,0,0,0,98,101,97,101,100,97,101,100,56,52,102,55,54,49,49,52,100,99,52,52,97,99,101,51,99,98,98,51,48,102,99,53,54,50,51,55,50,57,54,50,97,100,102,57,54,55,101,51,97,48,100,53,0,0,0,0,48,97,57,100,100,48,48,52,48,53,52,53,54,102,51,55,97,101,48,55,99,55,57,49,102,57,99,48,55,97,51,99,98,48,55,49,102,54,57,102,97,48,52,50,48,49,102,49,54,53,57,98,51,50,53,97,102,55,48,102,48,48,49,50,0,0,0,0,0,0,0,0,102,101,51,51,50,48,49,50,102,55,56,53,56,53,48,53,99,97,56,51,48,99,102,55,50,53,100,57,54,56,101,56,100,50,56,51,98,57,98,99,55,50,98,55,55,57,52,99,54,100,102,57,97,0,0,0,49,101,100,53,56,57,100,56,100,101,55,97,56,55,53,56,50,48,54,101,99,100,49,55,101,53,55,53,98,50,56,99,50,56,48,55,99,54,53,49,98,54,100,56,51,51,54,48,102,49,51,57,56,98,97,57,56,56,48,101,100,52,97,49,0,0,0,0,0,0,0,0,101,49,102,101,48,99,101,51,100,53,99,57,98,57,56,54,56,98,97,102,100,56,57,53,52,98,57,100,56,49,98,99,52,57,53,56,56,55,56,48,54,98,57,57,98,50,101,102,100,52,49,56,52,100,0,0,49,56,100,57,55,97,101,48,57,55,51,57,49,57,53,48,101,48,102,51,99,55,99,50,50,55,48,54,101,55,98,52,48,54,57,57,51,51,98,52,56,99,49,48,53,55,56,56,48,97,101,102,100,52,99,98,101,100,101,97,48,55,51,48,0,0,0,0,0,0,0,0,101,50,56,50,55,49,48,52,101,54,98,100,57,51,100,56,102,100,49,51,53,53,48,52,48,99,54,99,48,97,51,51,100,50,51,55,48,51,50,101,51,56,50,56,54,54,101,99,51,100,99,98,51,53,97,0,55,56,101,101,101,57,99,102,55,51,55,100,54,101,49,57,50,49,101,102,54,48,57,99,54,102,52,99,98,97,56,56,54,101,101,57,49,102,53,99,50,50,100,100,53,56,56,50,101,57,99,98,53,53,100,52,50,49,48,97,55,49,48,53,0,0,0,0,0,0,0,0,97,98,100,100,54,56,102,99,97,48,99,100,50,52,54,51,53,53,99,100,102,49,100,55,56,100,98,49,97,56,50,98,48,98,56,98,48,55,56,57,98,54,99,100,54,100,98,56,98,97,56,49,54,97,55,50,0,0,0,0,0,0,0,0,102,51,49,49,100,55,54,51,52,102,57,55,52,54,100,57,98,102,97,55,53,53,52,48,51,52,52,51,56,54,48,54,101,99,101,55,56,99,55,55,51,102,99,55,49,56,100,53,57,57,54,49,48,99,48,52,51,97,50,97,51,57,50,51,0,0,0,0,0,0,0,0,57,53,50,56,100,48,97,54,55,57,55,48,98,100,98,48,49,52,54,100,52,57,49,53,53,98,55,102,100,53,101,56,51,51,52,53,97,50,55,53,49,48,53,55,98,48,98,48,54,102,102,54,48,55,48,100,55,0,0,0,0,0,0,0,54,56,101,54,102,51,49,55,54,52,97,97,99,102,48,54,98,50,55,100,97,50,55,99,48,55,100,101,54,53,56,48,55,55,53,51,99,52,54,55,99,98,100,56,56,97,100,99,52,102,56,52,50,48,50,101,97,50,48,53,50,98,99,49,0,0,0,0,0,0,0,0,51,48,48,50,53,98,57,102,100,53,49,101,102,100,53,97,53,56,56,51,49,53,53,52,57,101,54,49,54,56,100,100,51,57,57,100,100,99,52,57,99,98,99,49,97,100,51,101,98,57,54,57,54,100,49,49,53,97,0,0,0,0,0,0,48,48,55,101,54,99,97,52,48,100,57,101,51,48,102,49,100,56,54,101,51,51,55,102,49,55,52,53,49,98,52,51,55,51,50,49,101,101,100,50,102,98,49,51,101,98,48,97,100,102,48,48,56,48,53,99,52,48,51,51,102,98,97,98,0,0,0,0,0,0,0,0,50,51,50,49,100,101,56,100,48,98,57,100,48,101,102,102,54,55,49,51,52,51,50,48,99,54,102,50,49,53,54,55,100,101,101,98,100,50,102,51,97,50,101,54,101,99,55,55,50,57,50,100,50,51,50,49,52,97,49,0,0,0,0,0,53,56,50,101,52,50,57,101,57,57,55,48,52,52,97,100,53,48,57,101,51,99,99,48,100,99,98,50,57,53,51,50,51,102,102,55,99,57,53,52,51,56,49,52,51,52,100,102,55,54,51,51,51,53,98,48,57,102,55,97,53,51,55,56,0,0,0,0,0,0,0,0,102,51,55,57,57,56,98,57,98,52,51,101,100,50,102,102,101,52,52,55,102,100,49,52,50,100,54,98,53,52,54,99,57,53,99,102,56,53,53,98,53,50,49,53,98,55,99,52,53,49,55,52,55,52,100,48,50,102,49,56,0,0,0,0,98,99,51,57,48,98,51,97,98,97,97,48,55,54,48,49,101,55,53,49,49,98,99,97,98,54,51,99,102,52,101,51,100,54,57,57,102,98,100,51,54,98,48,52,49,55,100,99,55,57,101,97,51,102,54,100,99,57,50,99,48,48,51,99,0,0,0,0,0,0,0,0,100,98,99,54,56,55,56,54,57,52,98,55,50,56,102,57,56,48,98,57,57,48,54,98,54,102,102,54,101,97,53,52,50,56,102,49,50,57,56,53,49,53,52,48,101,54,97,48,53,50,53,56,54,102,50,102,57,48,57,56,52,0,0,0,52,54,101,98,55,100,99,102,97,102,56,102,54,97,55,100,50,101,48,52,99,98,56,51,100,55,50,98,49,52,57,53,54,54,56,55,49,57,97,53,50,50,49,55,101,102,57,99,48,50,100,57,56,98,99,53,51,57,52,99,52,49,101,97,0,0,0,0,0,0,0,0,54,55,54,52,99,57,51,49,57,99,100,57,100,51,99,51,54,52,49,55,100,48,100,99,52,101,101,50,52,53,57,97,55,48,100,101,48,97,54,51,98,52,52,54,55,102,101,98,50,97,51,56,101,57,49,54,100,102,98,48,55,52,0,0,101,54,56,99,97,97,102,57,50,99,55,55,51,50,56,100,99,53,52,49,97,102,97,50,56,50,52,55,99,54,97,53,56,56,51,49,49,102,53,57,51,51,55,98,100,53,49,51,97,52,102,98,101,98,99,97,56,55,101,102,51,57,52,52,0,0,0,0,0,0,0,0,57,52,54,54,98,57,51,53,50,53,101,51,56,56,99,51,50,101,55,55,48,101,55,48,56,53,99,51,57,97,48,102,100,97,101,100,48,53,49,49,98,56,101,50,51,51,56,56,57,57,54,49,98,52,98,55,49,54,51,99,51,54,53,0,102,50,56,102,55,52,99,50,54,54,98,49,49,56,52,56,53,54,53,53,52,49,51,56,98,57,102,57,101,98,97,53,54,54,50,53,55,55,55,97,48,53,51,49,98,49,50,49,49,48,97,48,53,57,54,99,52,97,48,99,98,101,52,100,0,0,0,0,0,0,0,0,53,99,57,52,99,50,99,50,102,51,100,100,50,56,50,48,56,97,97,48,54,97,49,49,57,97,50,48,57,101,55,51,52,97,100,54,49,101,99,49,51,97,99,55,101,101,50,102,55,98,48,51,98,55,97,54,99,98,97,48,56,97,48,53,0,0,0,0,0,0,0,0,97,51,48,97,51,99,53,57,49,100,97,55,52,57,55,97,100,51,51,102,102,54,49,56,51,53,50,56,50,55,56,49,56,98,102,102,56,100,53,50,50,54,97,55,54,51,56,100,51,51,56,50,50,49,56,98,101,50,56,54,55,101,49,99,0,0,0,0,0,0,0,0,48,55,102,50,100,51,54,55,49,54,97,99,51,55,52,52,49,48,49,54,55,101,98,57,98,52,99,98,99,51,99,56,98,48,101,101,100,48,56,48,98,50,51,53,101,99,49,101,102,102,51,51,99,52,102,97,97,51,97,50,99,98,99,51,55,0,0,0,0,0,0,0,48,54,53,102,101,98,57,56,100,51,56,54,54,49,97,57,49,52,101,100,49,102,99,97,51,55,101,52,50,52,51,53,54,49,53,50,55,54,101,51,54,49,56,54,48,57,102,98,101,49,102,102,56,101,49,56,50,49,101,102,55,53,98,53,0,0,0,0,0,0,0,0,102,57,52,52,101,52,101,51,97,54,49,56,51,56,49,98,50,48,100,100,102,97,49,57,49,48,99,57,56,54,101,52,100,50,101,48,100,49,57,101,98,100,51,51,55,54,49,48,97,98,54,97,100,52,52,54,53,56,51,102,57,49,99,56,55,49,0,0,0,0,0,0,98,54,56,49,50,57,100,52,99,55,49,53,57,101,48,55,50,49,98,55,57,100,50,101,55,100,101,53,50,102,54,102,56,102,57,53,53,101,50,55,99,100,51,100,49,55,54,51,49,100,49,49,49,99,54,102,52,55,49,48,51,55,56,97,0,0,0,0,0,0,0,0,101,100,98,49,98,52,49,56,98,102,101,57,97,99,50,52,98,98,50,48,97,53,49,51,49,53,98,98,48,56,98,97,99,98,100,56,97,102,55,101,50,53,101,55,97,50,56,48,54,100,100,97,57,57,101,100,97,102,55,101,53,52,51,48,49,102,55,0,0,0,0,0,98,49,53,49,51,56,99,56,101,56,100,102,53,56,48,48,49,98,50,102,101,101,98,55,99,51,57,100,51,55,49,97,53,101,97,52,56,102,51,98,52,51,101,57,57,99,99,55,50,99,56,98,102,53,50,56,97,100,57,50,99,98,51,50,0,0,0,0,0,0,0,0,56,53,102,98,55,100,102,54,51,98,56,55,97,51,99,53,101,101,51,100,98,99,101,53,99,49,57,51,54,53,55,54,99,56,98,53,99,50,100,97,55,49,101,57,56,100,100,100,55,55,57,56,102,101,98,50,100,99,56,56,52,53,102,55,98,56,52,55,0,0,0,0,55,49,56,52,97,56,49,53,101,50,53,101,55,56,99,102,98,100,101,51,101,56,54,49,50,54,49,98,55,48,97,54,55,51,99,49,101,98,48,53,97,98,100,100,51,102,101,56,99,56,56,102,101,48,98,54,51,99,52,48,48,49,50,102,0,0,0,0,0,0,0,0,101,57,101,101,52,101,100,53,100,50,49,54,99,97,57,98,50,53,48,99,100,101,48,56,48,52,52,101,102,53,55,102,51,97,100,48,51,57,51,51,51,101,50,55,99,100,97,56,55,53,51,99,48,55,102,49,97,53,55,49,101,53,100,100,54,51,98,57,56,0,0,0,51,101,98,51,55,98,53,50,99,54,52,56,100,50,48,50,54,99,48,56,49,56,97,99,98,56,55,54,101,97,53,49,52,57,100,97,53,57,97,52,97,54,50,53,99,49,51,52,48,99,98,97,50,56,56,98,102,48,52,54,50,48,55,56,0,0,0,0,0,0,0,0,56,52,48,102,101,100,49,56,56,97,100,56,53,97,55,51,100,54,102,50,53,97,97,50,57,102,102,53,56,102,97,97,102,50,57,52,102,52,54,97,98,50,102,101,56,48,50,51,55,52,56,98,50,50,48,54,101,102,52,55,98,55,99,101,56,51,99,52,101,48,0,0,55,101,55,56,99,98,98,51,99,49,102,56,99,53,100,49,101,51,54,48,98,50,99,100,51,54,100,100,100,56,99,50,57,52,54,100,57,97,99,98,100,99,102,55,53,50,100,56,102,50,53,57,52,98,97,98,98,53,54,50,48,98,97,50,0,0,0,0,0,0,0,0,56,49,102,102,56,53,49,98,56,101,52,99,98,54,101,53,50,101,54,48,52,54,50,48,49,54,51,102,50,54,97,53,57,54,55,56,48,101,55,99,52,97,55,100,51,56,54,50,49,49,99,100,56,57,100,57,57,99,98,99,51,48,51,48,99,49,100,55,50,48,56,0,53,52,102,102,100,53,99,57,57,49,97,102,97,57,55,48,53,102,53,99,57,98,52,101,57,56,55,51,55,55,55,97,53,52,97,100,48,102,48,56,50,100,53,57,102,55,52,54,48,52,101,99,99,55,54,102,49,97,97,48,99,55,54,55,0,0,0,0,0,0,0,0,50,49,49,52,52,98,100,99,100,102,97,54,56,51,53,101,53,48,102,99,57,102,53,51,97,57,57,99,97,57,49,56,99,48,97,98,56,49,100,56,53,53,99,49,100,53,98,55,98,56,100,51,101,56,54,56,101,51,54,101,55,102,51,52,56,97,54,53,97,52,99,56,0,0,0,0,0,0,0,0,51,100,51,52,55,97,52,52,98,52,55,55,55,55,51,57,50,97,55,56,55,102,56,97,102,101,100,97,57,97,50,97,99,57,49,50,48,50,98,55,100,57,102,100,99,100,97,50,53,50,100,56,52,50,55,99,56,99,97,52,99,53,51,57,0,0,0,0,0,0,0,0,57,54,100,51,48,51,102,97,48,56,97,49,55,48,56,50,54,49,49,54,99,50,55,101,53,99,99,98,97,98,101,53,49,102,101,100,102,57,101,53,97,56,97,100,57,49,50,50,53,101,50,57,48,48,101,52,55,100,48,101,55,98,101,97,53,49,52,51,53,49,101,102,100,0,0,0,0,0,0,0,102,102,49,101,55,100,54,49,48,54,102,53,57,100,101,102,101,50,102,57,100,53,51,49,57,97,97,57,48,102,50,50,97,51,99,51,97,51,100,52,99,57,101,50,51,101,56,99,100,97,98,54,49,102,54,99,102,48,101,53,102,55,54,53,0,0,0,0,0,0,0,0,55,55,50,48,100,54,98,49,52,52,98,57,100,53,50,55,98,99,101,50,56,101,55,97,54,101,98,101,49,53,99,54,99,57,98,54,100,101,100,52,56,54,100,97,48,54,102,102,52,102,50,53,99,102,100,102,50,51,55,53,51,57,51,99,55,102,102,99,52,98,50,102,49,53,0,0,0,0,0,0,99,52,56,97,50,102,101,101,97,99,50,50,54,102,55,57,56,101,101,52,97,56,53,55,48,100,97,98,97,100,54,53,49,48,49,56,98,51,98,49,102,55,54,48,55,101,56,52,100,98,56,50,54,48,53,50,102,57,98,57,51,54,48,97,0,0,0,0,0,0,0,0,49,56,97,54,51,52,54,97,53,100,97,54,49,52,101,51,49,100,56,56,54,52,50,98,97,56,54,101,98,48,48,101,54,50,57,98,52,97,99,56,57,53,52,49,102,57,98,52,53,100,49,102,55,49,50,97,55,49,101,100,99,51,102,48,97,101,52,53,49,56,99,57,101,102,54,0,0,0,0,0,55,99,53,48,54,102,100,54,54,97,50,54,54,54,99,48,100,52,97,49,56,101,51,102,101,49,50,98,99,55,57,99,98,97,56,98,97,55,55,54,49,101,99,55,57,100,101,51,101,98,56,100,99,53,98,57,102,48,51,50,49,51,100,52,0,0,0,0,0,0,0,0,99,56,50,51,53,101,57,50,56,48,100,53,98,54,49,48,56,55,49,51,48,99,56,54,51,50,100,50,99,56,56,48,98,55,48,49,99,48,56,97,97,57,102,101,98,51,56,55,49,98,51,101,52,102,53,51,98,97,102,57,101,57,55,97,102,52,101,50,101,102,53,54,100,56,54,49,0,0,0,0,98,49,99,49,97,56,56,55,98,51,51,102,51,49,56,98,97,57,55,57,52,54,48,53,56,53,52,53,97,57,56,52,100,48,54,102,55,48,102,97,97,54,97,49,53,98,56,57,54,101,52,100,98,52,48,99,102,50,100,56,56,99,50,99,0,0,0,0,0,0,0,0,50,48,53,49,99,54,52,53,53,101,54,98,54,48,102,99,51,50,100,56,56,99,55,48,52,56,57,98,99,98,99,55,101,57,100,55,50,57,51,101,97,102,100,54,52,97,98,101,49,98,49,55,100,102,102,49,55,97,98,97,98,57,54,102,51,48,52,56,55,52,99,55,56,57,99,97,49,0,0,0,57,53,51,56,97,48,53,54,101,56,97,98,54,102,98,48,54,51,50,100,101,53,100,52,100,50,102,98,50,53,50,57,53,48,57,99,48,57,98,57,102,53,97,101,56,50,48,55,56,57,99,49,55,52,100,101,98,56,97,56,54,52,54,51,0,0,0,0,0,0,0,0,101,54,55,52,48,100,55,57,53,100,100,98,51,53,51,57,52,53,50,55,48,50,52,99,99,56,48,54,52,55,102,48,55,101,51,51,101,99,51,101,48,100,101,48,55,53,48,53,53,97,48,57,53,48,51,100,54,97,56,99,98,98,97,98,56,102,54,100,57,102,56,54,57,57,55,97,53,56,0,0,49,52,100,49,100,55,56,54,97,54,98,51,55,50,53,55,98,100,52,49,102,100,100,55,98,98,54,99,55,53,54,56,50,52,56,48,99,50,54,56,49,50,54,50,53,49,56,98,52,100,56,56,100,101,52,100,56,97,49,49,56,101,49,57,0,0,0,0,0,0,0,0,54,50,48,55,97,55,55,57,49,102,54,54,52,54,55,98,100,100,55,49,49,100,102,55,48,54,48,100,97,57,50,98,51,97,101,55,99,50,57,56,50,51,98,54,97,53,49,101,53,100,54,49,48,49,100,99,98,51,101,100,54,55,99,55,51,98,50,99,49,99,97,98,55,57,53,50,55,55,50,0,98,51,100,56,52,97,57,53,98,102,49,49,98,56,53,53,99,48,97,99,56,55,97,48,98,101,55,99,102,53,53,52,98,101,50,54,49,101,53,48,51,102,57,53,53,53,53,54,99,55,53,57,98,97,53,99,56,55,102,97,101,54,100,97,0,0,0,0,0,0,0,0,100,100,48,51,101,100,50,98,53,48,100,51,49,53,56,57,98,55,51,97,52,51,51,52,101,49,52,101,56,56,53,102,55,100,53,50,52,97,55,52,99,101,53,55,55,99,55,51,56,52,55,102,50,55,102,53,102,50,98,56,56,55,101,99,100,102,102,98,56,49,101,56,54,48,50,56,102,57,56,100,0,0,0,0,0,0,0,0,97,51,57,49,101,53,54,48,57,55,49,57,99,49,51,98,98,54,54,99,53,101,101,101,51,48,54,98,55,99,51,97,99,97,99,102,56,102,55,55,57,52,51,57,51,51,99,50,48,97,56,100,54,54,53,54,97,100,102,97,51,56,53,97,0,0,0,0,0,0,0,0,49,55,99,99,55,54,52,102,97,101,97,97,52,54,99,97,56,50,101,49,97,55,99,97,98,50,56,99,53,54,48,99,51,50,54,48,48,102,52,56,97,50,99,55,98,49,55,102,101,48,52,100,51,54,50,48,57,54,57,56,50,52,49,49,49,97,100,57,49,102,52,57,99,48,101,98,48,49,51,51,98,0,0,0,0,0,0,0,101,51,100,51,98,50,48,48,48,100,101,55,48,49,99,55,98,48,51,101,97,98,101,51,57,99,50,57,56,53,57,97,101,49,55,54,49,49,56,48,54,101,100,99,53,50,99,51,100,50,52,50,54,57,97,100,99,52,54,56,53,97,52,52,0,0,0,0,0,0,0,0,100,100,102,52,57,51,55,97,102,50,99,52,57,53,53,101,52,57,57,102,53,54,53,99,99,57,99,100,52,51,56,55,50,100,56,100,54,99,56,102,98,99,97,53,99,99,57,51,57,101,98,102,54,101,48,100,57,54,97,51,100,102,54,102,101,97,53,49,54,54,49,53,54,102,97,98,54,53,54,48,51,50,0,0,0,0,0,0,48,51,56,56,52,54,51,53,98,99,50,101,55,54,101,99,102,54,51,51,101,101,55,56,97,99,54,101,53,52,55,49,52,100,48,48,54,56,102,48,100,97,102,56,55,53,54,52,101,101,53,102,48,52,49,55,102,50,101,51,100,52,97,49,0,0,0,0,0,0,0,0,100,99,52,48,48,54,55,55,48,48,101,51,55,50,50,56,100,52,51,100,101,97,98,49,55,100,101,49,48,97,100,100,99,53,99,53,100,55,56,55,54,56,57,52,49,52,55,100,99,49,56,54,99,51,101,102,48,53,53,51,55,54,102,100,97,48,50,50,51,101,101,49,99,97,49,97,49,97,51,51,102,48,98,0,0,0,0,0,99,49,97,56,97,54,51,101,57,101,53,48,49,101,54,56,48,48,98,53,97,100,50,51,56,52,53,55,57,98,50,53,98,55,51,99,48,55,51,50,57,51,49,54,48,56,55,54,98,54,99,102,99,50,48,99,51,100,101,52,102,50,54,102,0,0,0,0,0,0,0,0,50,97,51,101,53,98,97,100,99,53,56,48,53,102,52,57,55,50,56,50,56,54,48,55,48,55,51,98,98,55,52,48,97,54,52,57,100,53,101,48,57,49,51,50,49,99,102,50,55,50,97,100,49,53,53,56,55,100,97,53,98,57,51,51,57,57,100,51,50,97,101,50,97,49,49,98,55,50,57,49,100,51,50,98,0,0,0,0,101,52,98,97,101,101,97,48,101,57,49,52,100,50,56,54,51,50,101,56,54,55,54,99,99,100,100,97,52,49,98,56,50,102,52,56,99,52,100,56,97,98,101,54,97,98,54,49,48,49,102,51,53,98,101,101,54,54,49,53,49,48,50,97,0,0,0,0,0,0,0,0,99,50,100,49,49,56,49,55,52,100,48,50,56,48,48,100,57,56,100,98,53,52,55,54,53,51,50,101,48,57,56,102,57,49,101,57,102,49,100,54,97,56,55,57,99,53,97,52,51,98,50,52,101,51,97,97,98,98,56,49,102,100,50,102,56,53,99,100,53,57,57,98,97,98,49,49,99,57,54,54,52,51,53,100,50,0,0,0,50,57,53,99,100,53,98,99,55,57,100,52,102,51,53,51,50,102,99,100,100,51,51,54,97,101,97,48,102,99,48,100,56,97,51,98,57,52,102,49,101,50,99,56,49,55,48,100,101,50,53,53,55,50,55,97,98,55,52,102,98,54,98,49,0,0,0,0,0,0,0,0,100,56,55,54,99,48,50,49,97,51,56,97,102,50,53,50,101,54,57,50,97,52,57,99,56,99,102,52,56,99,56,55,54,52,52,56,97,57,54,52,98,101,51,50,99,97,56,48,98,53,57,48,56,50,48,99,53,101,99,99,51,51,99,55,57,51,56,56,48,98,49,52,97,48,101,49,56,98,57,101,52,48,98,101,54,57,0,0,51,102,50,97,101,52,101,57,49,57,101,57,48,49,51,100,100,54,101,49,101,101,101,53,98,53,55,98,48,99,53,48,52,99,54,57,49,49,57,101,102,57,50,98,49,50,101,100,102,49,51,50,57,50,55,57,101,54,98,53,52,100,50,52,0,0,0,0,0,0,0,0,100,53,51,99,51,57,49,98,48,97,52,57,99,53,53,54,48,54,48,99,56,97,57,97,49,48,52,101,57,98,99,50,57,52,54,53,53,53,102,49,102,102,57,56,52,50,50,99,102,50,48,53,100,49,102,55,101,50,57,57,50,57,56,56,99,97,55,54,98,56,48,97,56,48,98,100,51,51,98,53,98,49,53,98,55,101,57,0,50,51,100,52,97,52,48,99,51,101,101,50,48,52,101,55,102,98,99,53,99,54,48,57,97,49,49,53,55,101,55,50,99,48,102,52,102,51,53,48,53,48,53,100,97,101,97,100,102,54,53,52,52,102,49,48,100,53,49,100,102,99,53,101,0,0,0,0,0,0,0,0,49,50,53,98,55,55,55,55,52,49,99,48,55,53,49,97,98,100,99,98,51,54,51,48,100,50,57,97,54,102,55,101,48,55,48,56,48,53,99,102,54,57,53,55,48,55,50,98,97,55,57,99,97,55,98,99,52,57,100,53,51,49,50,102,98,97,100,53,51,49,55,99,98,57,98,56,100,56,49,55,52,48,48,52,57,51,49,99,0,0,0,0,0,0,0,0,98,53,56,100,56,49,57,54,57,48,51,97,51,57,101,102,48,48,55,55,56,48,99,100,99,55,54,48,97,102,100,99,97,49,99,49,49,51,102,100,57,100,102,53,48,50,56,49,98,100,102,55,100,98,99,101,57,99,49,57,50,97,53,54,0,0,0,0,0,0,0,0,99,51,97,52,55,51,101,98,53,52,97,57,54,102,100,57,51,49,49,52,52,53,51,53,49,51,97,51,99,52,98,48,101,54,102,57,57,51,48,100,56,50,98,53,54,57,101,99,54,53,51,50,101,50,52,52,51,55,100,51,56,98,100,52,57,101,97,56,99,51,51,50,99,100,100,97,52,101,101,100,99,53,53,51,50,97,57,99,52,0,0,0,0,0,0,0,100,57,53,52,52,98,51,55,56,55,50,101,97,53,100,48,97,49,49,101,102,55,51,102,50,101,99,57,51,99,97,52,51,51,102,50,102,51,99,54,98,50,54,54,57,54,98,101,52,100,52,101,99,100,49,56,57,50,55,57,49,98,97,52,0,0,0,0,0,0,0,0,51,51,54,54,55,49,97,97,49,102,100,98,52,102,57,51,101,57,50,51,55,101,55,51,52,53,101,51,56,52,54,54,56,99,53,51,102,99,57,101,56,100,101,51,98,52,100,56,57,97,54,52,49,98,56,56,100,100,48,98,54,101,50,99,98,53,101,100,102,101,49,101,48,98,97,102,55,49,98,54,55,102,54,55,55,52,102,100,51,51,0,0,0,0,0,0,55,97,100,48,50,56,101,54,98,51,57,49,57,50,101,49,49,99,57,57,98,56,54,57,50,97,57,57,55,100,48,101,50,98,48,51,54,98,54,54,56,100,51,52,97,97,56,101,101,50,48,102,101,102,49,49,51,102,50,48,99,56,54,51,0,0,0,0,0,0,0,0,52,98,53,101,52,54,50,50,48,102,56,99,100,53,98,55,51,57,97,99,99,54,56,102,53,102,49,56,97,100,97,100,54,102,100,57,48,50,99,49,102,101,55,101,54,48,51,52,99,57,50,50,56,97,55,102,101,48,52,48,101,50,48,55,98,48,52,57,49,100,98,54,50,51,57,52,54,55,53,98,99,52,101,57,54,101,100,52,51,99,50,0,0,0,0,0,50,99,48,101,99,51,49,55,53,98,54,100,97,101,98,56,57,51,49,99,100,100,99,98,50,57,102,51,52,99,48,57,102,51,98,55,52,48,53,48,56,48,101,53,97,51,102,52,49,48,56,57,101,57,101,97,50,97,102,52,56,99,102,97,0,0,0,0,0,0,0,0,52,54,57,100,49,52,56,53,50,55,101,49,102,51,50,52,97,55,52,51,51,101,52,48,51,97,50,53,100,48,98,99,49,55,52,50,53,56,54,52,52,48,98,102,56,99,55,51,57,97,54,98,54,100,98,57,97,57,102,51,51,54,53,102,97,98,97,100,97,50,97,49,101,48,99,100,48,102,57,50,56,54,54,57,101,50,101,101,98,97,51,48,0,0,0,0,49,54,97,56,56,50,51,53,49,54,98,50,48,52,52,55,49,53,48,48,53,53,52,57,97,55,102,57,51,57,56,48,53,100,54,53,101,50,50,51,52,101,98,48,51,55,55,52,101,98,56,57,56,98,100,55,50,51,51,57,50,53,53,56,0,0,0,0,0,0,0,0,50,51,53,48,48,51,49,50,97,50,54,56,101,57,57,97,55,97,54,97,50,51,49,54,102,98,97,48,101,56,98,102,102,102,56,101,51,55,53,98,54,98,51,48,56,57,49,51,101,50,51,99,52,49,53,97,53,99,100,51,100,98,53,48,98,56,55,52,52,49,52,55,55,56,57,97,49,102,49,100,98,53,54,55,53,52,57,100,55,57,50,57,50,0,0,0,52,53,56,56,98,57,57,50,57,54,50,57,50,51,97,49,52,100,102,97,98,57,51,101,101,54,56,48,52,102,102,51,50,98,52,101,49,99,53,57,51,55,98,99,101,57,97,51,49,99,51,99,53,50,57,102,54,50,99,55,56,98,97,53,0,0,0,0,0,0,0,0,101,54,53,53,52,99,57,101,54,102,99,99,99,56,102,55,102,101,56,51,48,51,101,100,53,55,102,53,101,55,101,54,101,101,97,100,99,50,97,50,50,100,50,97,49,97,97,51,55,101,52,53,57,97,51,48,49,55,101,56,49,55,100,51,57,53,50,99,51,100,48,99,57,102,56,98,50,53,49,101,51,53,54,49,101,48,97,100,55,97,50,97,49,100,0,0,56,57,98,55,50,49,101,51,99,97,50,99,52,51,49,51,100,100,48,53,57,54,100,48,50,100,97,97,53,50,52,48,53,52,53,97,48,102,49,51,50,99,50,102,49,53,100,99,49,53,50,101,101,99,101,50,102,51,57,49,97,102,49,57,0,0,0,0,0,0,0,0,100,52,55,51,101,48,55,53,97,98,48,97,56,54,101,97,54,50,48,52,51,51,54,99,98,98,54,54,53,50,53,57,52,48,49,102,101,51,100,97,51,55,51,98,98,50,51,55,50,97,54,54,98,51,57,49,57,99,51,50,99,56,51,97,97,51,49,98,52,54,53,49,51,51,98,99,48,100,54,48,102,97,48,97,57,101,48,56,48,54,102,100,99,52,51,0,97,100,101,100,48,49,57,55,49,49,100,49,57,56,49,50,54,57,51,57,51,49,102,97,100,52,102,55,97,100,54,53,52,56,48,49,50,53,57,100,56,54,99,102,102,100,99,57,51,97,52,57,56,100,54,100,98,97,99,48,53,99,98,99,0,0,0,0,0,0,0,0,54,102,97,48,49,99,49,102,52,57,53,98,56,102,101,99,98,101,56,56,97,99,99,56,99,100,55,98,98,51,98,49,48,51,100,56,99,54,56,101,99,97,100,56,53,99,54,52,97,51,98,99,53,98,54,50,51,55,56,51,55,55,48,54,52,54,48,99,52,52,56,48,48,97,100,50,54,48,54,101,56,100,55,99,55,50,52,50,56,97,49,51,48,102,52,57,0,0,0,0,0,0,0,0,102,51,57,99,98,99,55,48,55,55,97,50,101,56,102,99,56,53,99,97,98,99,99,56,56,51,52,55,55,57,49,102,49,57,57,57,55,99,50,52,102,49,97,57,53,49,48,51,102,50,102,102,49,99,48,54,54,54,53,57,98,56,99,50,0,0,0,0,0,0,0,0,56,57,50,100,49,55,55,56,101,57,56,49,102,98,53,100,50,48,55,49,102,50,102,49,99,54,48,56,55,55,101,57,57,102,48,55,101,100,49,100,101,99,51,97,98,101,102,48,51,101,52,99,53,97,52,50,57,57,55,100,52,101,50,56,56,52,56,100,55,100,53,49,52,50,99,97,57,98,97,97,49,56,54,97,97,97,98,53,56,52,101,99,51,99,53,100,57,0,0,0,0,0,0,0,55,54,55,52,52,102,101,56,55,57,54,50,100,49,50,99,54,100,51,48,102,50,53,55,56,57,51,57,51,101,100,56,54,55,97,54,56,99,102,55,57,55,98,56,97,51,49,55,101,57,101,53,57,48,97,100,51,55,101,54,51,54,56,99,0,0,0,0,0,0,0,0,50,50,101,99,54,53,51,54,50,49,53,98,99,54,102,51,99,102,97,50,97,102,51,48,97,50,52,51,54,51,51,101,100,49,48,57,53,53,100,55,50,101,51,100,49,52,102,102,56,51,56,57,101,98,52,99,97,97,50,101,102,53,56,99,100,56,50,99,101,102,99,98,98,97,98,102,99,100,97,54,54,57,48,99,101,54,54,102,101,50,56,48,53,97,53,50,98,102,0,0,0,0,0,0,56,56,51,101,102,51,55,102,53,52,51,56,99,55,49,49,54,50,57,56,102,48,54,97,100,102,56,55,99,48,57,55,50,53,53,54,98,101,97,100,56,56,102,50,53,56,56,51,52,54,56,54,53,54,54,53,101,49,48,98,97,57,57,102,0,0,0,0,0,0,0,0,100,99,57,97,51,50,101,50,50,99,101,52,53,53,52,102,52,99,55,48,101,50,51,49,101,56,97,101,51,101,49,97,54,102,53,51,53,101,98,99,56,57,51,97,100,51,52,102,52,52,56,97,51,98,56,52,56,102,48,97,54,56,57,53,98,98,100,100,51,55,49,99,52,99,102,100,57,52,49,102,51,56,97,52,57,57,98,55,97,53,99,100,98,101,54,50,50,97,48,0,0,0,0,0,57,51,100,52,57,57,56,57,102,102,49,56,99,55,100,100,51,57,99,54,54,101,48,99,56,97,55,56,52,98,56,52,51,101,97,101,53,53,49,53,97,51,98,49,100,101,100,53,57,49,97,97,52,56,48,55,101,101,49,97,99,98,52,53,0,0,0,0,0,0,0,0,56,56,54,102,52,48,51,48,50,101,54,98,99,57,97,50,99,51,53,56,50,98,51,102,52,101,97,53,98,55,52,54,98,97,49,101,49,57,50,53,53,55,99,48,57,50,98,99,52,56,97,54,50,55,48,49,51,52,98,49,100,98,102,100,97,50,100,57,53,98,101,51,54,49,51,97,98,54,101,99,50,50,48,53,98,49,100,101,53,53,48,51,48,100,100,98,48,57,101,53,0,0,0,0,100,53,52,99,97,55,48,54,50,51,56,53,56,101,101,100,55,98,51,50,100,99,56,57,54,53,50,49,48,100,49,50,57,54,55,97,49,97,102,97,57,98,53,101,99,97,97,102,49,98,49,50,97,100,55,51,49,101,57,49,53,49,101,52,0,0,0,0,0,0,0,0,101,53,57,51,57,101,56,98,55,99,51,51,50,98,53,97,53,53,55,54,97,102,52,53,99,57,53,51,52,53,98,99,55,53,57,57,48,97,99,50,55,50,100,48,102,56,49,53,100,98,100,54,57,101,102,56,54,99,56,48,50,98,49,52,53,51,50,51,53,53,57,49,50,100,54,53,52,57,50,98,102,54,101,102,97,55,101,98,56,57,52,101,56,100,100,99,57,102,49,98,55,0,0,0,57,55,52,49,101,53,54,98,52,102,55,57,99,53,51,97,97,50,49,53,99,50,51,100,54,97,50,57,51,102,101,97,101,49,102,52,101,97,53,55,49,57,49,102,102,99,49,50,56,56,98,48,55,55,98,53,100,102,100,99,53,55,49,100,0,0,0,0,0,0,0,0,56,49,102,55,48,57,101,55,53,48,50,102,101,55,55,55,100,52,102,53,56,100,56,99,98,57,48,57,102,55,102,99,57,49,49,48,50,51,101,55,55,50,48,50,51,100,51,48,55,51,98,100,97,52,48,54,102,97,49,52,49,99,49,98,54,50,51,98,57,52,55,53,53,55,56,53,57,101,48,50,51,53,50,50,56,54,97,101,51,100,101,97,98,101,49,57,97,48,56,52,54,99,0,0,57,52,99,102,101,55,99,101,97,97,102,102,50,49,56,48,55,55,100,55,97,53,52,50,101,56,54,102,53,56,48,57,49,56,49,102,49,99,100,56,54,51,51,99,51,50,99,56,54,48,50,100,53,97,48,49,98,102,57,97,51,49,54,98,0,0,0,0,0,0,0,0,57,56,56,55,53,100,50,50,98,102,49,52,55,100,53,101,55,49,49,97,97,97,56,55,97,49,50,97,55,53,101,50,53,52,101,52,52,99,100,57,48,99,97,100,101,100,98,54,102,50,101,54,99,97,49,52,50,48,97,57,100,101,49,101,48,57,54,55,98,50,99,52,50,98,101,102,99,54,54,49,99,49,52,54,97,48,98,49,52,53,99,51,101,101,54,100,56,53,49,99,98,100,56,0,99,53,53,101,98,51,102,57,57,99,48,100,53,102,102,54,57,101,49,98,54,57,49,54,50,54,50,98,52,57,53,99,48,54,97,100,48,49,57,102,52,57,48,52,51,49,52,101,50,57,57,52,55,57,100,99,102,100,52,48,50,54,52,101,0,0,0,0,0,0,0,0,55,52,100,51,56,99,98,97,48,48,52,54,99,98,97,101,52,50,98,49,54,55,52,49,57,100,53,101,55,97,102,55,54,51,55,55,53,97,97,49,99,52,55,54,51,53,57,51,54,55,101,56,56,53,51,101,57,55,102,50,98,102,51,98,97,56,54,49,55,100,57,100,98,56,50,49,50,57,54,101,97,48,52,55,99,57,54,48,49,101,100,97,55,97,98,99,57,56,48,53,48,49,55,57,0,0,0,0,0,0,0,0,102,97,99,100,50,55,101,97,98,56,101,55,98,101,54,99,99,100,100,57,51,54,50,97,102,48,57,97,100,48,99,101,99,54,53,101,54,97,99,101,56,101,49,98,53,53,50,102,100,52,101,53,97,53,100,56,55,48,101,101,97,102,99,99,0,0,0,0,0,0,0,0,57,48,56,100,98,53,102,99,98,53,48,53,102,102,55,52,52,99,56,101,53,48,53,98,97,49,101,48,53,97,53,97,97,52,54,57,50,53,50,97,97,102,52,52,101,101,102,57,51,54,54,52,48,102,100,55,53,101,55,100,48,98,53,53,55,54,97,49,102,49,99,55,52,48,98,53,101,102,53,55,55,56,101,99,99,49,53,49,99,52,57,53,100,48,53,48,57,98,49,100,50,99,57,98,55,0,0,0,0,0,0,0,101,56,54,98,98,98,53,51,55,49,97,55,52,101,50,98,102,56,56,54,99,98,100,100,100,48,53,50,51,57,53,57,99,56,54,55,51,48,50,101,100,53,55,98,102,98,50,101,53,52,55,97,52,50,49,100,100,51,51,52,98,100,56,97,0,0,0,0,0,0,0,0,100,98,50,99,57,98,55,52,57,50,102,102,49,51,51,51,51,57,55,55,98,56,51,53,51,52,97,102,52,101,55,97,57,53,99,100,52,101,57,53,49,50,51,50,97,50,99,52,52,53,98,101,56,52,98,53,55,51,98,54,48,98,100,57,48,100,98,98,102,100,48,53,100,97,99,54,56,49,48,49,99,49,53,52,51,55,100,51,48,57,97,48,101,57,99,52,100,51,57,50,98,56,50,50,101,101,0,0,0,0,0,0,50,98,49,57,48,101,53,55,101,56,97,101,50,49,48,55,55,48,100,51,102,102,99,101,99,49,98,100,101,51,98,54,102,97,99,98,51,57,55,51,49,54,48,102,99,56,55,100,54,99,99,53,55,54,98,56,49,56,53,57,102,99,51,102,0,0,0,0,0,0,0,0,56,97,49,56,97,51,54,52,54,54,55,54,98,57,54,98,57,57,101,51,52,55,54,53,55,48,54,55,100,100,52,102,52,56,57,98,55,97,100,57,49,97,57,48,48,55,57,99,102,102,54,53,55,53,55,49,57,48,57,57,101,51,97,97,54,53,53,102,57,57,51,101,51,54,48,52,48,99,102,98,51,53,56,100,53,52,52,97,97,102,97,57,48,51,56,48,54,57,57,102,57,51,101,56,49,102,102,0,0,0,0,0,101,52,101,97,53,55,49,100,99,100,52,51,98,50,56,99,98,55,54,54,100,56,48,97,56,97,55,55,52,51,51,101,49,54,98,97,48,100,57,51,51,53,97,100,97,48,54,100,57,102,53,54,98,49,100,52,53,100,102,55,55,48,48,100,0,0,0,0,0,0,0,0,99,55,57,53,100,49,52,50,52,51,101,48,100,101,54,54,54,54,98,49,98,98,100,49,97,57,99,98,97,54,54,48,49,98,54,48,48,51,49,51,51,102,99,54,102,52,56,98,98,55,52,56,57,52,101,49,99,54,101,55,53,55,54,52,98,52,53,52,99,52,98,50,101,48,56,50,99,48,101,101,100,48,51,52,102,56,55,53,57,98,99,55,53,98,55,57,53,100,48,101,54,101,57,97,99,51,54,101,0,0,0,0,53,55,57,51,49,52,97,99,56,51,50,97,100,53,48,54,97,51,55,53,98,50,53,53,101,55,57,55,51,98,100,54,50,100,101,49,54,57,52,98,97,51,102,98,50,52,48,101,52,52,48,101,48,101,53,55,100,100,52,52,99,98,54,51,0,0,0,0,0,0,0,0,48,100,98,101,48,100,57,49,51,50,50,51,102,56,48,50,55,100,99,54,99,99,98,52,57,98,51,102,98,56,102,50,102,57,49,100,52,99,99,51,53,97,97,52,102,51,98,51,100,101,102,54,97,48,49,98,99,56,98,57,54,52,99,50,102,51,99,54,49,51,101,52,97,54,54,98,52,52,101,56,55,97,55,56,57,51,100,99,98,54,55,54,98,102,52,55,56,48,100,56,51,55,50,97,97,57,55,55,49,0,0,0,51,97,97,53,99,55,52,57,49,99,99,48,99,50,54,102,100,57,57,55,48,97,48,56,51,55,53,53,97,54,97,56,98,52,49,98,100,99,57,102,50,99,49,102,48,97,50,98,52,102,97,48,57,99,98,54,56,100,102,102,55,51,57,52,0,0,0,0,0,0,0,0,56,48,51,100,101,50,55,99,52,99,48,52,48,51,57,56,48,52,52,54,97,53,55,97,57,53,54,49,52,100,100,56,51,50,102,48,56,52,98,57,100,54,57,53,54,49,51,53,49,57,53,54,49,50,99,55,57,55,99,52,49,57,55,55,100,53,48,102,52,52,54,55,48,102,98,49,56,55,55,49,57,51,48,99,98,57,98,98,97,50,97,55,99,52,54,100,53,97,55,101,56,51,100,54,55,102,98,99,52,51,0,0,53,57,54,55,56,56,102,48,99,57,49,97,99,55,100,99,54,57,55,101,49,101,100,100,97,56,57,51,97,52,54,57,55,102,49,52,99,54,49,53,54,49,101,50,49,50,99,48,51,50,55,55,50,99,56,99,56,52,50,51,98,56,54,57,0,0,0,0,0,0,0,0,97,100,57,56,102,102,51,100,98,56,48,57,99,54,48,97,101,100,51,97,99,56,99,99,55,98,55,56,100,97,102,51,57,100,102,101,50,99,55,54,54,97,57,50,48,100,54,50,99,49,56,54,99,57,56,54,53,52,52,55,48,99,50,99,100,48,102,100,53,54,56,52,54,51,100,50,101,49,56,102,54,51,97,100,49,53,57,98,51,99,55,102,50,55,56,52,55,54,102,100,54,100,100,54,97,49,52,51,50,50,54,0,55,101,56,57,52,54,98,101,56,51,56,97,97,102,56,56,54,100,48,48,98,101,57,54,53,101,100,52,57,49,100,51,57,101,56,51,56,51,48,57,57,53,56,54,54,97,57,48,54,54,97,52,50,50,98,101,102,50,56,53,51,49,99,102,0,0,0,0,0,0,0,0,99,100,97,53,102,56,102,100,53,101,52,101,56,54,49,53,57,50,50,99,50,99,48,98,101,102,55,55,53,97,49,52,54,100,57,53,98,49,53,52,98,54,98,97,57,101,100,50,51,57,51,53,100,102,55,48,57,99,57,97,51,53,53,50,51,56,57,56,52,100,57,100,57,54,49,52,97,98,100,56,97,97,101,52,98,54,54,51,101,56,50,54,57,49,101,97,50,53,55,57,57,102,52,48,52,51,56,102,97,98,52,52,0,0,0,0,0,0,0,0,97,53,54,48,52,98,57,98,52,99,55,100,54,100,53,100,100,100,53,57,56,54,54,99,48,57,100,50,50,98,100,100,51,55,98,53,99,97,101,55,100,99,101,57,54,55,97,98,98,101,100,100,56,48,52,100,53,99,53,102,51,56,48,56,0,0,0,0,0,0,0,0,98,99,48,102,49,56,50,54,52,52,102,55,54,56,57,99,49,48,49,48,51,102,98,48,97,48,101,52,53,50,54,48,101,99,101,55,98,102,57,55,49,48,53,52,57,101,52,100,98,98,99,100,50,102,101,101,101,56,50,52,51,100,97,52,57,57,101,56,55,57,49,97,54,57,52,49,53,102,101,52,52,52,54,97,51,102,49,53,48,99,52,99,54,49,51,51,48,50,57,98,56,53,52,50,97,97,99,56,56,48,101,55,49,0,0,0,0,0,0,0,48,51,51,99,97,51,56,54,97,102,57,97,52,50,98,53,55,52,51,55,54,98,51,51,97,49,49,52,99,49,99,53,98,53,98,51,101,97,100,100,56,97,56,98,53,99,52,51,52,53,52,97,55,100,48,49,99,53,52,102,48,101,51,56,0,0,0,0,0,0,0,0,97,99,50,100,99,50,102,53,97,53,50,97,102,102,52,101,55,98,98,53,102,54,51,99,50,98,54,97,97,98,56,55,102,101,48,50,52,97,50,98,50,57,52,97,54,48,97,48,102,49,98,99,57,53,53,55,49,97,57,51,57,55,102,52,97,53,102,49,51,48,52,49,57,97,53,53,48,48,52,101,54,49,98,50,53,100,48,55,102,97,51,101,102,52,54,99,56,52,55,53,57,54,57,102,48,98,57,54,51,50,97,100,56,102,0,0,0,0,0,0,101,102,51,98,53,52,102,100,48,97,48,98,54,51,49,54,49,51,56,99,49,53,55,51,51,100,55,57,49,56,54,48,97,98,50,57,97,49,99,102,97,51,48,53,56,55,100,102,52,48,98,52,97,52,102,48,50,54,56,52,98,48,48,100,0,0,0,0,0,0,0,0,48,100,52,102,50,52,52,54,99,102,54,54,97,98,99,101,55,51,101,57,52,52,57,51,51,52,98,102,50,98,48,56,99,55,50,51,99,55,98,100,54,100,57,51,57,53,53,55,50,52,52,98,55,98,100,102,101,55,54,98,102,99,56,50,99,101,99,49,100,50,55,101,57,54,53,51,52,54,52,50,97,101,102,56,49,55,56,49,98,56,97,53,52,55,50,48,99,50,97,102,99,53,54,100,57,49,98,98,49,98,97,98,54,102,55,0,0,0,0,0,48,101,101,50,51,100,97,98,55,51,48,55,49,57,56,53,97,48,48,100,101,56,52,52,55,101,102,48,50,49,48,56,98,99,49,101,97,50,50,48,101,97,100,99,98,49,102,50,49,98,97,56,52,55,101,49,51,48,51,100,100,50,102,52,0,0,0,0,0,0,0,0,56,49,57,57,100,55,50,98,48,54,52,48,52,51,102,101,98,99,54,50,50,55,97,57,53,50,98,98,49,49,48,56,101,53,55,100,52,52,97,48,50,48,50,55,53,56,49,48,50,99,51,52,49,97,57,54,100,97,98,55,98,57,52,98,52,97,52,50,53,55,55,52,52,97,55,53,98,57,101,97,48,102,48,50,98,53,99,100,51,56,100,51,54,49,101,97,102,53,98,101,99,101,50,52,48,50,53,48,52,99,48,102,53,51,49,56,0,0,0,0,54,53,48,54,57,48,100,50,52,53,54,50,53,57,101,98,100,97,100,100,101,53,52,56,98,102,51,99,54,98,55,49,56,50,99,48,100,52,50,50,53,53,53,100,54,98,55,50,97,102,52,48,98,97,51,54,54,53,97,51,101,57,102,57,0,0,0,0,0,0,0,0,52,97,55,51,54,56,98,99,52,54,97,101,49,99,97,97,100,102,56,97,100,49,51,56,98,99,52,98,49,53,100,97,52,98,97,51,102,48,100,56,55,53,98,50,102,57,49,51,57,98,99,98,54,50,102,98,55,99,98,48,49,98,54,98,97,53,53,53,57,99,97,48,57,53,54,99,49,56,57,56,100,49,49,52,48,57,53,53,53,97,50,51,55,55,100,52,100,101,49,98,97,48,48,50,102,50,52,101,52,52,52,56,49,99,99,49,50,0,0,0,55,53,48,101,53,53,52,101,97,49,49,97,52,52,56,55,52,102,53,98,57,48,102,50,101,100,102,53,51,57,52,52,49,56,50,49,50,97,52,101,101,56,48,99,49,97,53,53,102,56,48,97,55,56,102,54,98,48,102,48,97,100,56,56,0,0,0,0,0,0,0,0,57,51,97,102,102,57,54,99,55,101,49,52,100,100,50,57,53,49,55,55,55,98,101,101,100,100,50,52,50,54,101,51,57,57,53,101,50,101,102,50,102,100,54,51,56,57,53,97,51,100,51,51,97,48,97,101,97,57,54,101,53,55,53,101,50,102,51,50,57,97,99,98,48,54,50,100,51,101,98,102,48,55,56,100,55,100,50,102,48,48,98,50,48,51,55,102,48,49,53,57,99,57,56,49,56,100,102,51,97,99,51,54,51,97,54,48,54,102,0,0,50,97,99,54,52,101,97,52,55,52,50,98,48,102,52,51,102,98,99,52,98,101,48,51,52,97,50,100,51,55,102,56,52,98,55,49,100,48,57,51,98,52,99,97,99,97,99,57,55,55,51,52,50,49,99,52,102,97,52,48,102,49,54,50,0,0,0,0,0,0,0,0,55,102,55,54,100,98,48,99,54,54,51,53,57,98,98,101,48,56,49,49,48,57,101,57,48,51,56,100,49,50,100,48,101,51,52,56,51,48,99,51,57,50,57,55,101,52,100,100,100,57,98,98,51,101,98,48,51,53,56,56,56,50,57,48,57,52,49,52,99,50,50,99,99,102,50,97,54,54,57,97,53,100,53,100,49,102,100,55,52,100,57,56,49,51,100,49,56,50,53,101,51,102,56,50,52,51,50,49,51,100,49,51,99,53,48,52,50,52,48,0,98,53,99,51,99,98,102,100,102,53,56,48,99,102,102,53,100,56,101,52,52,52,50,55,100,48,51,56,48,56,99,97,101,50,99,98,97,53,98,100,98,55,97,97,99,98,100,52,57,100,53,101,49,50,48,48,99,52,52,99,102,97,101,97,0,0,0,0,0,0,0,0,53,99,48,49,102,101,102,101,53,98,98,51,53,99,99,102,53,102,57,97,98,51,54,57,50,52,101,56,102,54,54,101,99,48,48,97,57,56,57,100,54,49,50,99,100,102,98,56,99,99,48,100,54,50,56,52,53,97,56,57,50,101,50,51,51,55,97,99,55,56,54,49,50,51,50,99,100,56,56,49,55,53,55,57,56,100,102,48,98,54,49,48,101,98,49,52,49,97,52,57,98,50,49,49,53,99,102,57,97,99,98,52,48,54,99,97,53,50,50,56,0,0,0,0,0,0,0,0,97,50,52,55,52,51,50,52,51,52,101,101,50,52,98,53,101,48,54,57,102,52,50,52,53,49,57,51,54,98,55,101,48,57,57,56,48,48,57,51,97,49,57,98,55,51,53,56,98,102,52,100,55,55,57,50,99,50,53,97,57,48,55,99,0,0,0,0,0,0,0,0,102,57,55,51,100,57,52,98,55,97,101,48,56,97,100,101,100,53,97,54,53,54,50,48,100,100,56,55,48,101,56,51,98,102,52,51,51,101,54,53,56,49,54,97,55,53,50,100,48,55,48,56,57,51,50,53,48,48,56,51,98,102,102,49,53,49,53,49,101,98,55,48,48,101,57,49,51,97,99,99,101,51,97,100,49,51,98,102,54,57,97,97,99,54,52,48,97,97,51,97,56,50,55,97,48,102,52,98,51,48,53,48,49,55,53,49,98,98,98,57,98,0,0,0,0,0,0,0,100,54,51,97,54,55,98,100,100,99,100,102,51,97,52,50,52,99,101,100,53,102,52,99,50,100,53,52,100,52,100,97,51,99,50,101,97,53,48,99,50,57,97,51,99,51,98,100,102,98,99,99,55,52,100,52,99,51,52,99,101,55,55,49,0,0,0,0,0,0,0,0,99,102,99,57,53,48,101,101,53,54,51,100,99,51,48,99,55,56,101,54,53,56,51,52,48,98,57,54,50,100,100,57,54,48,97,97,100,100,49,99,49,100,51,49,55,49,102,54,51,100,54,55,97,52,49,49,100,57,98,99,52,55,55,52,50,55,51,51,57,54,57,98,51,52,51,102,102,50,99,51,99,56,100,54,57,51,55,54,102,52,56,56,101,49,49,57,100,98,101,49,57,54,52,98,48,100,50,54,98,102,98,49,50,53,102,98,56,48,55,99,97,54,0,0,0,0,0,0,98,101,98,54,99,56,97,49,98,55,98,51,97,101,102,53,54,50,100,50,55,49,50,49,97,52,51,52,57,57,98,97,53,52,51,52,100,56,56,99,97,48,48,100,56,102,54,54,97,99,99,51,49,50,102,56,57,57,57,48,54,56,100,57,0,0,0,0,0,0,0,0,50,51,56,97,49,99,97,98,50,100,99,48,98,54,102,49,50,100,52,49,97,100,98,57,99,50,48,51,49,50,98,49,52,100,57,52,54,48,48,49,54,48,55,52,56,52,55,53,99,56,100,100,97,50,55,55,49,57,98,55,56,48,102,98,53,55,53,55,57,48,49,100,48,98,100,101,98,98,99,97,55,52,52,97,100,56,100,51,101,48,49,52,49,50,99,48,50,101,50,99,48,57,57,97,102,51,100,49,99,57,102,98,56,54,100,54,99,57,54,50,97,50,98,0,0,0,0,0,49,98,101,102,51,99,53,50,56,55,99,50,53,56,51,49,49,53,51,55,100,56,97,53,57,98,51,48,99,100,101,97,98,49,54,53,99,53,50,48,54,102,100,52,102,54,56,54,57,54,97,99,49,50,97,53,53,56,97,50,51,48,53,57,0,0,0,0,0,0,0,0,50,56,53,56,54,98,99,53,57,51,55,48,102,101,102,101,101,101,51,57,50,53,51,55,102,48,55,98,100,98,48,53,57,49,54,100,102,54,97,100,101,102,50,98,98,52,51,50,54,97,53,97,49,57,100,101,57,48,55,49,98,52,101,55,102,52,97,55,101,55,97,102,52,50,102,98,57,50,49,52,49,54,101,98,99,97,55,56,50,55,49,53,56,48,56,54,52,54,56,55,54,48,49,57,52,97,48,51,101,102,54,57,48,102,48,56,48,54,50,55,53,55,102,102,0,0,0,0,98,53,49,101,49,102,56,54,55,56,50,48,55,53,99,98,51,57,50,52,97,100,97,98,100,52,49,54,100,57,52,52,100,51,100,98,100,102,55,51,55,55,52,102,49,102,54,102,52,48,54,48,56,102,100,100,56,56,56,57,57,99,100,53,0,0,0,0,0,0,0,0,50,50,57,100,50,53,48,97,52,53,97,55,51,98,97,55,97,48,57,57,100,48,51,53,99,99,52,99,97,48,99,98,102,100,99,53,55,101,48,50,99,100,101,50,56,98,101,51,57,100,57,49,97,51,98,101,49,55,97,54,97,100,50,56,100,48,48,97,54,55,101,102,48,49,100,57,100,101,55,97,57,53,55,49,53,101,101,100,101,57,49,99,56,53,55,102,50,98,100,56,48,56,52,98,51,52,56,50,52,57,57,101,52,49,102,57,57,57,52,52,101,102,48,101,54,0,0,0,54,101,98,101,48,50,51,57,102,50,57,56,102,49,101,50,98,98,55,102,102,57,101,98,51,56,101,57,50,98,49,48,49,56,53,54,53,52,100,54,97,101,54,57,48,55,54,52,101,102,100,98,101,53,52,52,48,97,52,100,99,98,97,56,0,0,0,0,0,0,0,0,53,49,97,55,51,100,99,100,48,100,56,50,98,100,53,101,56,100,101,55,51,99,49,54,98,102,54,54,98,99,57,56,52,50,49,54,51,57,100,54,52,56,55,50,97,101,55,50,101,51,98,97,55,50,49,102,100,52,48,53,98,56,101,101,56,48,49,98,49,52,48,98,99,54,57,57,50,49,56,54,100,49,53,56,98,97,98,98,54,54,57,53,99,51,102,100,51,48,55,48,50,97,97,48,50,98,101,99,49,53,49,50,101,97,57,57,50,57,99,52,50,51,99,55,57,48,0,0,50,99,56,55,54,99,101,99,51,55,98,101,98,52,102,98,51,101,54,57,97,98,49,98,98,97,55,102,56,55,52,55,49,99,100,102,55,49,102,57,53,54,55,101,101,57,52,51,57,98,48,97,53,51,48,51,102,55,97,100,99,48,55,99,0,0,0,0,0,0,0,0,52,99,54,54,50,98,99,53,48,48,50,48,53,102,53,97,54,99,99,98,57,55,100,52,97,56,55,102,100,56,50,56,52,98,52,98,51,51,48,54,51,54,54,100,55,102,55,99,100,49,101,53,52,51,52,99,57,50,56,97,55,99,51,56,48,55,100,48,57,99,50,48,54,49,55,53,50,51,50,55,98,101,101,101,55,50,51,101,56,54,53,51,98,101,53,54,97,50,55,54,50,54,99,56,102,48,100,52,101,99,98,50,102,52,57,57,101,101,55,97,57,52,101,97,100,53,57,0,97,54,102,100,49,100,97,100,98,51,51,52,100,56,97,52,57,50,98,54,49,55,52,53,57,55,56,52,55,98,52,55,51,97,55,51,99,49,53,101,102,48,50,48,57,98,102,56,55,97,99,99,98,98,100,50,102,102,97,98,50,50,50,55,0,0,0,0,0,0,0,0,53,50,100,48,57,50,97,52,55,57,53,99,53,99,49,55,53,97,52,56,97,97,97,56,53,54,100,56,49,51,56,48,97,55,100,48,48,102,50,50,48,57,49,101,55,49,99,101,49,55,57,52,97,54,97,52,97,54,50,56,56,101,50,52,53,57,53,99,48,97,99,52,56,50,49,99,57,52,98,55,50,56,49,49,54,56,51,49,53,102,51,54,100,53,50,97,53,97,50,54,97,54,55,99,48,49,99,98,100,101,49,49,98,48,99,98,55,53,49,55,51,98,98,48,48,102,55,97,0,0,0,0,0,0,0,0,98,55,56,100,52,51,102,99,54,102,55,49,101,99,57,102,102,102,97,50,57,101,99,54,53,50,98,56,49,99,48,101,48,49,52,98,99,102,57,99,56,54,50,57,49,54,100,50,51,55,98,55,49,57,98,49,48,102,53,97,52,52,56,55,0,0,0,0,0,0,0,0,98,100,53,51,51,48,97,100,48,99,55,57,99,50,57,53,54,53,98,98,102,49,55,54,54,52,100,51,54,98,49,99,49,98,49,97,49,55,51,48,48,57,51,51,98,102,55,51,56,101,49,52,99,102,55,57,57,57,99,57,98,98,48,56,49,54,54,57,101,49,57,102,55,98,97,99,49,55,54,100,50,51,99,57,97,98,50,97,99,54,100,49,51,57,99,49,57,57,101,50,50,98,99,100,50,102,98,56,51,52,52,101,99,99,49,101,48,54,54,101,54,54,57,98,56,102,49,53,102,0,0,0,0,0,0,0,53,98,101,56,53,100,50,97,48,49,55,48,51,56,50,55,52,98,57,57,48,99,57,98,48,53,102,49,52,48,98,56,54,57,54,51,100,49,50,101,50,53,99,98,56,98,49,50,56,51,57,50,99,48,55,100,51,49,97,98,51,56,97,98,0,0,0,0,0,0,0,0,57,55,54,99,100,99,48,51,50,49,52,99,53,54,101,102,98,48,51,100,97,101,97,53,99,102,53,48,99,50,49,97,52,48,98,53,99,52,102,97,100,101,56,99,51,53,56,50,53,50,97,99,101,101,101,99,100,57,53,57,48,98,50,97,102,102,56,102,101,50,102,100,48,56,99,48,54,49,50,51,56,100,54,99,102,102,57,98,52,54,99,52,54,50,55,98,48,100,52,48,98,48,97,49,54,48,49,56,56,52,101,51,52,52,101,102,100,52,52,57,56,100,57,56,52,97,56,99,48,100,0,0,0,0,0,0,48,52,98,98,51,54,54,97,49,50,57,48,51,99,53,100,98,52,53,48,57,101,57,100,101,53,100,98,101,102,49,99,50,54,55,52,57,57,53,97,48,97,54,56,98,102,101,99,50,53,50,101,53,97,97,48,48,57,53,48,51,57,52,100,0,0,0,0,0,0,0,0,57,102,99,97,99,57,97,48,51,48,53,55,100,102,99,56,57,101,102,49,55,56,50,100,97,49,100,102,51,57,56,52,51,54,99,101,99,56,100,54,53,98,101,50,101,56,48,50,102,54,101,51,97,51,52,98,100,56,101,102,98,98,99,53,49,52,97,56,101,102,54,98,54,98,101,56,48,99,102,99,101,99,55,52,52,55,49,97,99,52,99,102,100,53,49,52,56,49,98,97,56,48,99,52,99,52,99,57,98,48,99,51,56,52,97,99,51,56,56,57,57,100,57,53,56,57,55,51,100,101,57,0,0,0,0,0,99,100,48,52,99,97,53,102,57,48,99,54,98,99,48,97,51,54,56,57,101,101,50,101,49,50,97,56,98,49,98,55,98,101,53,54,98,102,98,99,49,101,56,97,102,99,98,99,53,97,52,48,100,97,98,100,100,49,100,100,48,49,54,57,0,0,0,0,0,0,0,0,53,101,51,99,55,54,50,53,50,51,48,97,54,98,49,100,101,97,101,50,55,52,57,101,54,56,51,49,101,52,53,48,53,98,55,54,49,98,97,55,57,55,55,54,57,102,51,48,53,100,50,101,100,56,53,102,56,57,48,57,102,56,54,54,55,54,98,57,98,49,52,48,57,51,57,55,56,102,48,97,51,53,50,100,100,98,100,102,51,48,99,57,48,54,54,52,100,57,54,51,54,98,48,49,52,56,54,98,97,102,50,52,51,101,51,50,50,52,53,51,50,53,54,52,99,48,53,50,56,101,50,50,0,0,0,0,56,97,52,101,99,101,57,55,102,101,55,57,54,49,102,55,52,101,102,53,99,56,102,53,57,51,49,53,52,98,100,55,48,48,48,53,100,53,99,56,100,101,48,101,52,97,55,55,56,99,53,49,101,97,50,98,53,97,50,49,51,56,55,53,0,0,0,0,0,0,0,0,55,51,48,102,54,52,51,57,54,54,97,57,99,53,56,51,54,57,56,48,99,56,101,99,56,99,97,50,54,55,100,51,97,52,102,48,102,97,52,52,51,97,57,101,51,55,56,57,55,49,98,101,54,50,50,52,54,55,98,55,99,102,50,56,52,97,101,51,98,97,52,102,53,54,52,102,57,57,48,49,57,48,48,53,57,48,56,102,56,54,53,55,57,53,54,100,101,51,98,57,52,53,55,101,56,99,56,57,97,100,97,52,102,101,97,55,54,55,99,102,51,57,51,99,101,55,49,97,98,49,48,101,57,0,0,0,52,51,55,49,55,57,50,100,55,52,57,100,56,99,48,54,57,101,98,101,50,56,100,53,100,99,53,49,51,99,100,49,97,52,53,54,57,55,50,101,48,53,53,53,100,48,50,52,55,49,56,56,49,56,99,55,48,99,54,100,50,51,55,99,0,0,0,0,0,0,0,0,102,52,48,56,101,100,100,56,54,57,52,97,48,57,49,101,100,53,53,99,48,49,56,52,102,102,98,57,100,100,52,100,48,50,55,52,102,52,50,57,100,56,55,50,57,52,49,100,99,52,48,98,57,53,97,101,101,55,101,48,49,52,55,53,50,55,52,52,57,51,99,53,48,49,98,51,56,99,102,99,102,49,55,101,49,55,50,57,54,52,97,53,54,98,51,56,100,56,100,54,52,49,98,55,57,98,99,56,54,97,99,53,99,102,52,53,54,99,102,55,51,48,51,52,101,53,100,56,97,102,50,48,52,51,0,0,57,51,48,98,55,54,101,48,101,97,53,53,50,55,97,102,102,53,97,52,101,53,52,49,52,102,50,49,97,99,52,53,99,50,53,102,52,53,57,48,100,57,51,100,50,48,53,102,56,101,102,100,52,101,48,49,57,49,50,54,49,97,55,99,0,0,0,0,0,0,0,0,101,98,98,56,56,56,48,101,57,55,98,51,97,97,55,101,97,101,54,102,51,99,50,53,54,57,54,56,49,53,49,55,56,98,56,98,52,97,100,101,102,99,51,102,102,53,101,98,48,49,99,97,55,53,54,50,51,49,102,56,51,48,48,102,98,49,102,57,97,54,101,56,102,48,97,100,98,100,51,97,99,97,53,49,52,53,52,53,56,53,57,48,57,98,52,56,98,97,97,52,48,55,56,53,98,97,99,102,48,97,56,102,56,57,50,97,54,54,100,102,100,99,49,53,52,53,98,52,54,51,48,53,98,54,49,0,52,101,102,98,101,57,100,102,51,51,56,51,56,98,49,99,55,101,55,51,99,52,56,54,51,97,53,51,50,54,54,100,97,57,97,97,52,49,55,51,102,97,98,49,50,51,50,101,48,56,52,52,51,55,48,55,102,50,102,101,51,98,51,102,0,0,0,0,0,0,0,0,97,100,56,48,100,99,51,97,52,101,50,100,55,56,55,56,52,52,48,48,53,98,101,100,50,55,55,97,49,52,55,55,97,102,52,50,52,97,101,99,52,53,51,54,52,54,50,55,54,102,100,102,101,52,100,57,49,54,56,54,101,52,102,98,100,55,53,97,100,55,54,57,49,99,54,48,101,97,56,102,53,100,56,57,56,101,101,54,53,56,49,57,56,49,99,50,49,57,52,49,52,57,97,57,97,51,50,98,98,48,52,49,50,48,55,100,49,102,50,97,50,51,102,51,102,57,52,56,100,54,52,101,55,56,56,51,0,0,0,0,0,0,0,0,100,97,101,53,98,53,54,100,49,102,55,48,102,97,52,101,52,99,98,101,53,97,52,100,98,53,51,53,57,100,101,49,97,52,98,53,52,52,54,52,99,53,56,56,99,102,98,56,48,56,50,56,56,53,50,56,97,57,49,49,50,57,54,57,0,0,0,0,0,0,0,0,97,57,97,101,100,98,102,49,52,97,50,49,97,99,53,48,51,52,56,55,101,99,100,50,97,48,51,49,100,48,48,97,53,99,55,102,101,48,54,53,53,98,102,102,98,99,50,102,101,51,51,56,55,51,99,53,52,49,100,98,102,51,54,51,99,56,102,50,53,99,54,101,57,56,53,51,99,48,50,54,101,52,98,98,50,97,55,54,56,101,54,55,53,56,98,98,98,53,53,53,97,99,100,101,54,54,57,54,54,98,53,101,52,53,50,48,101,48,57,52,49,100,97,52,54,102,57,101,56,98,100,99,97,97,57,50,49,0,0,0,0,0,0,0,102,54,56,50,56,50,49,101,100,98,53,53,52,56,100,48,48,51,102,49,52,49,48,98,99,56,48,50,101,97,101,52,56,97,52,97,51,57,54,54,57,102,52,55,53,50,57,57,50,51,54,54,57,51,101,102,52,55,55,97,97,55,55,56,0,0,0,0,0,0,0,0,98,98,51,100,101,97,54,53,50,48,51,53,57,57,98,100,101,51,48,52,101,51,51,53,51,49,56,98,53,49,102,48,98,100,50,100,51,101,50,49,52,48,50,57,99,51,52,53,102,101,98,56,53,56,98,99,97,101,98,54,99,50,99,102,102,54,51,97,100,56,99,48,51,100,48,49,97,55,57,56,48,49,50,52,52,101,97,48,56,98,54,100,99,53,97,101,98,50,102,50,57,49,52,57,51,99,49,52,98,102,98,53,100,56,102,99,54,99,102,102,100,100,48,55,53,100,99,57,54,101,57,56,97,102,99,101,100,54,0,0,0,0,0,0,102,99,52,55,49,53,49,54,53,53,54,49,97,100,98,98,99,49,99,98,48,102,48,98,56,51,55,56,48,57,51,55,54,53,102,55,55,55,97,50,99,55,52,98,101,99,54,98,98,57,102,98,56,100,48,101,55,56,99,53,53,52,52,97,0,0,0,0,0,0,0,0,97,48,53,52,98,57,101,98,49,101,56,54,98,49,53,98,99,54,56,54,100,57,98,102,97,98,49,51,51,56,52,52,53,49,101,98,101,53,53,55,98,97,53,100,100,97,99,101,48,101,50,48,57,99,50,55,48,50,102,50,98,53,101,102,98,99,101,55,98,57,55,53,48,56,50,97,101,99,102,57,98,53,97,56,101,56,55,51,56,101,52,49,98,102,55,57,56,51,55,54,49,55,101,54,55,57,53,101,57,101,100,97,100,54,52,51,52,53,49,98,49,102,56,101,99,49,50,52,52,97,52,51,48,57,97,48,52,100,100,0,0,0,0,0,98,100,52,51,51,51,49,50,51,55,57,50,98,57,50,48,57,48,53,56,55,99,50,49,101,57,49,53,48,100,54,54,49,57,97,49,52,51,57,99,99,101,55,52,100,54,49,51,53,48,54,55,100,56,99,100,48,98,52,99,53,101,57,56,0,0,0,0,0,0,0,0,57,102,49,98,51,52,52,50,99,56,49,102,100,57,52,53,55,50,57,100,56,100,52,54,53,54,52,54,51,48,55,98,97,98,101,54,56,50,100,52,97,55,48,50,102,54,98,56,50,51,99,48,100,55,52,48,97,98,101,48,57,98,99,101,51,100,97,97,102,99,56,98,54,101,56,49,97,56,56,99,102,52,53,52,100,97,52,97,51,48,97,99,53,98,50,51,100,49,51,48,51,97,53,48,53,98,50,53,100,102,102,97,54,99,101,52,56,51,51,97,55,52,99,57,53,98,48,49,48,48,55,97,97,48,57,57,48,99,98,49,0,0,0,0,50,57,98,100,54,56,101,51,49,53,48,56,102,54,48,52,100,99,50,55,55,98,51,51,100,98,100,52,48,52,50,53,54,100,56,51,56,101,52,53,52,100,53,51,55,48,101,102,98,51,101,53,51,102,100,102,98,54,51,99,53,99,99,53,0,0,0,0,0,0,0,0,52,97,51,102,98,100,57,49,101,54,56,55,54,56,53,53,53,48,53,97,101,97,54,102,98,97,98,52,53,99,52,99,98,57,97,51,50,57,57,56,57,57,57,57,55,50,57,53,98,100,53,57,49,55,97,56,102,98,54,98,101,98,48,53,101,102,52,98,49,102,53,98,99,51,102,49,56,54,101,49,48,54,97,57,102,52,56,101,56,99,57,57,56,52,53,52,57,98,48,101,98,100,100,53,98,101,97,99,49,55,57,56,53,56,51,97,57,49,50,49,52,55,54,53,51,52,98,51,51,57,98,50,54,101,100,53,97,52,98,98,48,0,0,0,57,100,99,50,53,99,49,102,99,49,52,51,57,100,54,53,102,48,57,50,102,48,53,57,51,55,53,97,102,51,102,52,98,100,54,52,56,97,100,52,100,99,97,101,48,102,53,55,55,48,97,55,98,52,101,102,53,55,98,52,51,52,53,100,0,0,0,0,0,0,0,0,54,50,55,56,50,51,97,53,101,57,102,55,98,53,48,48,51,102,99,52,48,102,101,102,49,51,54,57,100,99,97,52,51,48,97,53,100,99,49,100,98,102,100,48,48,101,99,55,56,49,102,52,99,52,52,99,102,99,53,97,55,99,50,54,48,97,55,49,54,98,98,53,101,55,100,50,99,101,99,52,53,97,51,52,52,55,97,98,54,57,53,101,52,102,101,50,52,57,48,56,100,48,57,100,56,50,102,51,54,102,101,102,101,99,56,56,50,99,100,55,99,52,99,48,57,50,102,101,49,54,51,99,52,54,49,56,50,97,57,101,52,53,0,0,100,102,101,52,48,100,56,51,54,102,57,48,98,99,51,56,98,99,55,57,100,54,102,48,48,54,48,57,54,53,99,101,101,54,53,50,50,102,101,55,99,98,54,49,55,102,97,98,99,100,49,98,102,48,50,53,57,57,50,55,56,55,55,56,0,0,0,0,0,0,0,0,49,100,53,102,52,102,102,101,48,51,48,56,57,100,49,50,56,99,50,97,54,49,50,98,102,48,48,53,53,99,53,101,50,56,50,51,53,97,55,50,97,50,97,50,102,99,99,54,53,101,50,56,49,100,99,57,97,54,49,97,51,102,100,98,51,57,52,54,54,56,101,97,101,49,55,49,55,98,97,57,55,50,53,97,100,100,52,98,54,55,57,52,56,99,100,51,54,102,99,100,101,101,97,51,102,100,56,101,54,102,49,101,48,48,101,51,100,55,52,52,100,97,52,98,57,99,51,97,48,54,55,55,49,52,51,56,57,49,100,57,53,52,49,0,57,54,50,101,101,99,49,97,99,53,48,101,57,100,55,99,100,99,53,49,51,101,56,53,50,48,56,49,100,57,100,48,53,53,53,101,97,55,50,98,97,102,98,52,56,98,52,100,53,98,49,98,57,48,57,56,50,51,54,55,55,55,101,98,0,0,0,0,0,0,0,0,53,54,100,97,49,49,49,101,55,57,99,55,102,53,50,97,98,102,48,99,51,54,56,102,57,51,51,51,97,48,53,100,99,51,101,56,54,102,48,54,53,50,102,98,102,50,100,52,56,52,102,99,53,99,99,55,48,99,54,48,53,55,49,99,57,50,54,51,56,99,52,51,50,97,53,52,102,101,102,102,98,52,51,52,53,102,98,100,54,56,48,54,57,56,100,52,53,57,51,48,98,99,50,50,50,99,98,101,99,52,99,99,49,53,48,98,56,52,53,57,54,100,54,97,101,52,48,54,57,53,48,49,99,56,97,52,57,57,52,53,57,53,101,53,0,0,0,0,0,0,0,0,51,52,50,52,54,49,99,49,57,55,101,54,52,100,55,100,48,49,53,48,50,56,49,97,56,48,97,54,56,55,49,49,102,101,57,48,50,99,54,97,54,56,99,57,97,99,53,98,98,51,101,55,51,55,98,50,48,51,101,50,99,101,101,49,0,0,0,0,0,0,0,0,99,48,50,49,50,99,48,101,102,54,53,51,51,100,48,56,98,57,97,48,101,53,54,56,98,102,101,57,53,56,48,56,56,100,48,56,53,48,50,48,100,99,55,48,55,57,101,53,99,54,99,48,100,55,53,49,54,51,98,101,56,98,56,51,50,57,54,48,55,50,54,57,98,53,98,54,48,98,56,56,50,54,102,55,99,55,53,102,51,101,57,101,55,50,100,97,97,50,53,102,57,54,51,52,49,98,49,55,101,50,57,98,99,52,56,99,101,50,55,102,53,49,50,97,100,51,56,100,99,97,98,50,100,49,54,55,48,99,54,55,55,55,50,49,52,0,0,0,0,0,0,0,102,55,53,100,50,99,99,55,99,56,99,50,56,97,53,54,51,54,50,49,99,54,56,57,57,56,101,51,99,50,49,50,102,98,100,102,53,99,97,53,54,48,52,48,51,100,56,49,53,48,101,49,55,48,57,53,100,98,100,53,97,50,102,51,0,0,0,0,0,0,0,0,52,50,48,55,52,99,49,99,99,48,98,50,101,52,56,99,101,49,48,52,51,51,49,48,50,98,100,53,48,97,54,99,50,52,52,55,53,48,101,49,51,102,50,52,53,53,57,53,101,102,52,102,49,49,99,99,49,57,48,49,102,54,55,48,102,57,51,100,100,48,57,54,99,97,56,54,51,50,54,53,97,56,52,50,100,99,57,49,56,50,98,51,51,99,53,54,53,51,56,50,55,55,50,53,101,53,54,56,101,56,101,53,49,98,49,100,55,49,98,100,56,51,49,57,98,100,101,97,56,51,50,55,52,97,57,53,55,57,53,53,56,56,100,102,97,56,0,0,0,0,0,0,101,101,102,101,54,101,101,53,54,56,51,48,57,99,56,102,49,100,55,49,99,99,100,102,101,102,55,57,50,49,53,98,50,51,50,51,98,98,52,54,55,97,50,100,55,99,56,97,56,99,99,48,100,48,54,55,54,102,51,99,101,54,50,53,0,0,0,0,0,0,0,0,100,55,52,101,51,99,98,101,56,101,97,48,101,50,53,100,100,100,101,54,57,48,51,97,97,97,50,100,98,53,53,101,48,52,102,56,52,48,102,49,53,99,55,102,55,98,53,54,99,57,101,97,55,56,50,56,57,56,54,54,56,53,50,54,97,48,50,49,101,101,48,49,55,99,102,56,53,55,102,97,51,97,52,55,57,56,101,49,49,55,98,56,100,99,52,56,101,56,97,49,57,49,100,53,52,53,53,102,54,48,53,50,97,48,101,56,49,50,55,52,56,49,56,54,100,48,54,55,98,52,53,50,97,102,99,49,102,48,57,97,50,102,55,48,56,48,55,0,0,0,0,0,51,99,57,53,100,48,49,52,50,99,102,52,101,57,48,56,48,56,52,49,101,98,53,101,57,100,97,100,56,50,52,48,57,99,56,52,53,48,49,53,101,54,101,49,97,99,101,50,101,101,49,52,98,50,54,48,100,53,49,53,53,53,101,102,0,0,0,0,0,0,0,0,99,99,97,102,53,49,52,102,102,97,102,50,49,98,101,50,55,101,100,48,100,100,52,50,57,52,54,101,51,56,98,101,99,98,56,101,52,55,55,51,56,102,55,97,53,101,99,48,57,98,98,48,100,99,97,53,50,54,98,55,48,56,102,48,50,52,48,51,99,101,102,56,55,50,99,57,54,48,100,53,52,98,102,51,50,50,53,101,50,51,98,52,54,55,99,98,99,51,50,97,98,51,54,101,102,97,48,53,54,101,53,99,55,48,56,99,99,51,56,50,56,55,51,49,54,56,53,97,100,99,54,102,53,101,54,52,52,100,48,100,97,97,51,101,49,53,102,102,0,0,0,0,101,49,50,55,57,55,99,57,100,49,100,53,55,48,99,50,101,57,49,48,102,55,100,102,53,101,54,54,102,56,51,102,50,101,99,100,56,100,99,52,54,56,54,54,100,52,100,49,49,54,56,99,100,49,101,54,102,56,55,55,49,97,56,50,0,0,0,0,0,0,0,0,51,101,53,57,50,51,102,52,49,54,55,100,51,57,56,56,51,55,98,53,50,98,53,50,56,51,100,56,52,50,49,57,52,97,51,102,53,49,51,54,101,55,54,98,56,55,56,52,100,100,54,55,52,98,99,56,48,102,49,50,99,56,101,53,56,98,55,98,97,57,50,54,99,97,48,98,50,97,101,101,49,51,97,100,56,101,57,99,53,49,97,97,99,102,48,97,55,54,48,98,49,55,55,54,97,50,55,99,49,54,53,57,99,51,101,48,56,97,98,56,97,48,57,98,98,55,55,97,50,57,100,102,49,49,97,51,51,102,101,51,48,57,50,97,51,56,97,99,97,0,0,0,51,57,99,100,102,49,55,50,54,50,49,51,57,57,97,52,48,56,97,97,99,54,54,99,48,48,49,49,49,101,101,52,56,97,97,51,101,99,49,53,50,97,55,97,100,100,52,48,54,53,102,49,51,51,52,97,48,98,101,53,97,49,51,102,0,0,0,0,0,0,0,0,102,52,54,98,57,48,98,56,53,48,53,100,51,48,48,99,52,55,57,52,52,100,55,55,99,56,97,101,55,99,101,100,97,54,100,100,101,57,97,55,98,54,101,102,56,48,101,52,48,50,53,101,53,99,54,48,48,100,97,102,55,57,54,53,53,57,54,97,49,56,57,55,97,99,52,53,98,54,54,49,98,97,54,52,56,52,50,54,52,99,51,52,100,57,57,54,54,101,98,52,53,54,53,53,51,48,53,56,53,48,57,48,49,99,102,101,101,51,100,49,53,54,50,52,57,100,56,56,48,56,101,50,98,56,98,98,99,50,51,55,55,52,56,54,97,98,102,99,97,52,0,0,102,51,100,100,52,101,99,102,57,54,101,51,51,102,101,102,53,97,97,49,51,48,48,50,97,99,102,51,99,57,49,99,50,54,53,56,50,53,101,100,101,55,52,101,48,51,97,101,57,102,101,48,50,99,99,97,101,100,53,49,48,99,48,56,0,0,0,0,0,0,0,0,97,54,99,52,54,102,100,56,102,53,100,98,101,48,57,51,56,52,56,98,97,52,101,56,53,50,53,97,97,53,48,57,49,98,56,100,49,102,98,102,52,99,97,49,50,54,50,56,97,102,55,52,102,48,51,48,101,49,57,54,53,51,98,100,49,55,52,98,50,55,99,50,101,52,49,100,49,52,55,54,51,101,52,100,57,100,98,98,102,98,57,99,49,56,50,100,50,99,98,53,50,100,54,48,49,99,101,98,50,99,98,101,56,57,102,48,48,101,49,98,52,51,56,51,49,53,57,52,50,50,57,100,54,99,52,57,100,98,56,57,97,51,48,98,54,57,51,98,57,100,50,0,101,56,97,50,55,53,101,55,99,56,57,50,99,57,51,50,52,55,54,102,48,100,102,99,98,53,97,50,101,56,100,49,102,98,57,102,48,51,102,102,97,51,54,52,54,102,56,98,52,48,102,57,98,48,100,55,56,56,57,49,55,97,57,49,0,0,0,0,0,0,0,0,57,100,57,48,101,48,97,101,98,100,99,49,55,49,49,99,50,49,50,48,98,50,98,56,55,55,54,55,51,54,49,57,49,52,48,51,50,56,48,51,99,55,98,55,51,51,54,100,98,50,51,55,57,50,97,101,53,56,50,102,48,52,50,51,98,98,102,97,56,52,102,101,56,99,51,99,53,98,102,54,53,97,97,99,101,54,98,50,49,100,101,57,101,57,57,51,100,48,98,48,57,100,55,54,57,100,48,51,98,56,52,101,50,101,48,48,54,52,98,49,98,55,50,54,100,57,48,57,54,51,102,54,51,53,97,54,49,56,51,51,53,99,52,102,97,48,99,53,50,55,50,54,0,0,0,0,0,0,0,0,51,57,100,102,49,54,99,56,98,51,99,54,98,102,101,50,98,51,56,55,48,50,53,53,52,102,52,49,52,55,101,54,98,52,51,102,51,55,57,54,99,48,98,51,57,54,102,99,52,55,100,50,102,100,49,102,99,57,102,52,101,50,102,52,0,0,0,0,0,0,0,0,98,57,49,54,49,98,97,56,55,49,97,48,100,50,51,99,98,49,57,97,99,97,52,102,97,54,99,53,97,50,97,48,48,49,100,99,100,56,100,56,51,102,48,102,101,55,49,50,98,53,100,52,52,100,53,57,52,48,48,53,54,102,97,101,102,49,102,99,57,56,99,102,54,98,102,55,49,56,48,49,97,52,48,102,98,99,51,49,97,100,50,49,50,100,57,50,55,52,49,100,99,57,97,49,49,49,101,102,97,48,97,54,52,57,99,50,55,55,97,48,97,49,49,49,52,99,49,52,101,56,101,55,97,54,97,97,49,55,57,55,101,55,52,56,100,50,52,49,101,48,55,97,99,0,0,0,0,0,0,0,57,53,48,57,48,56,57,98,54,97,48,101,56,51,53,52,52,99,54,97,99,97,54,100,97,50,54,55,98,55,55,49,53,97,99,52,102,49,101,57,101,57,55,98,50,52,57,50,49,102,100,101,55,48,98,48,101,50,57,55,54,49,100,57,0,0,0,0,0,0,0,0,49,49,102,98,48,48,53,49,52,99,52,53,100,100,53,100,48,51,52,97,55,56,55,51,102,54,51,57,55,102,57,48,49,57,51,48,54,54,53,57,100,98,98,49,50,99,56,51,48,51,98,54,100,102,100,50,99,50,49,51,49,53,57,53,57,52,101,49,102,97,50,99,57,98,100,51,48,56,102,98,49,51,102,54,51,101,50,100,54,51,48,54,54,52,98,100,51,54,101,102,52,100,54,50,101,55,49,54,48,57,99,102,51,100,100,54,99,97,49,98,101,101,56,55,56,57,50,57,49,56,52,53,97,102,99,48,101,102,97,99,57,49,53,52,56,49,102,52,50,53,57,54,51,49,0,0,0,0,0,0,57,51,55,53,101,100,51,48,54,57,100,48,99,99,99,101,52,52,49,51,52,50,50,50,99,99,52,100,53,48,101,55,99,57,48,98,102,48,55,101,53,98,57,53,49,55,100,102,102,101,102,102,51,52,101,52,50,55,56,54,51,49,97,50,0,0,0,0,0,0,0,0,54,101,55,97,98,53,99,101,97,53,54,48,98,102,49,99,52,101,101,48,98,99,56,56,52,51,54,100,100,97,98,100,100,98,53,102,99,101,52,49,55,101,98,97,49,102,51,56,98,55,50,53,98,56,56,50,54,57,102,54,57,49,56,102,102,55,101,99,98,100,51,98,57,53,55,48,50,48,54,57,99,97,101,97,97,55,54,52,49,99,102,102,55,100,50,97,48,97,99,48,100,100,97,57,53,52,50,99,102,57,55,102,99,56,56,99,101,57,51,53,51,99,54,98,99,101,53,48,55,48,57,49,100,57,52,102,56,56,100,99,102,99,53,52,97,49,52,57,98,101,52,53,100,50,51,0,0,0,0,0,51,56,49,52,48,50,48,99,54,50,49,51,53,101,97,51,55,97,100,102,53,53,49,56,51,48,97,51,97,51,55,99,55,57,48,48,48,97,49,56,102,98,52,97,53,99,99,54,97,56,48,55,52,99,98,100,54,53,56,52,48,100,50,97,0,0,0,0,0,0,0,0,98,102,100,98,100,56,54,51,53,57,56,53,102,50,49,100,57,100,55,97,98,51,49,97,97,48,101,53,53,53,53,100,48,56,100,48,51,52,55,100,54,54,99,99,48,97,55,56,56,101,100,48,52,50,57,100,54,101,56,100,57,57,52,57,97,98,54,52,97,102,52,57,97,57,51,101,98,49,99,50,97,57,53,100,100,99,50,49,54,53,101,98,50,101,52,101,98,101,56,53,49,50,97,55,51,97,51,57,51,102,97,98,53,48,57,53,56,98,100,57,57,99,54,102,48,97,48,55,98,54,48,51,102,51,98,57,57,51,53,55,98,51,53,102,48,52,51,50,102,55,99,101,49,101,48,51,0,0,0,0,49,52,49,97,99,99,52,102,50,99,100,50,49,97,101,55,98,99,53,55,99,102,55,101,101,98,97,98,54,53,49,99,48,102,101,100,51,53,101,55,57,49,56,102,50,54,99,53,57,98,99,100,56,52,53,99,51,54,50,51,101,100,51,97,0,0,0,0,0,0,0,0,57,51,57,57,51,51,97,51,101,55,48,99,51,50,101,49,52,53,55,55,51,53,57,51,49,100,97,57,100,57,100,49,51,56,102,51,54,97,99,98,53,49,48,55,54,50,56,56,100,97,53,97,102,56,49,56,52,48,99,101,55,99,101,100,49,51,101,52,101,54,53,53,99,54,48,98,97,48,101,57,52,54,49,50,56,49,52,50,57,99,99,49,99,101,56,100,56,50,99,98,52,48,54,57,52,100,55,49,51,99,53,98,53,53,57,50,101,56,100,55,98,51,57,57,57,102,55,52,99,99,49,53,50,53,55,49,55,57,97,48,48,57,53,99,55,48,100,100,99,50,48,99,49,54,53,102,102,0,0,0,54,57,54,102,55,53,97,52,52,51,102,57,102,52,98,97,102,53,55,51,98,49,100,48,51,102,50,55,102,49,54,57,57,100,48,48,51,97,54,57,53,98,102,52,101,102,97,55,101,99,54,97,53,101,97,55,97,52,52,57,51,100,51,97,0,0,0,0,0,0,0,0,98,57,57,56,57,56,52,51,100,53,53,52,50,102,55,51,97,52,57,100,49,102,57,100,102,48,49,49,100,55,56,101,99,100,102,54,101,99,49,49,102,52,97,50,55,53,52,102,100,50,100,51,55,50,99,98,98,98,100,97,98,53,52,99,56,53,51,55,55,55,100,97,54,50,98,53,98,48,48,98,56,53,56,100,57,52,99,54,48,101,101,97,99,49,50,54,98,101,50,55,57,53,56,56,57,50,97,48,55,56,49,53,56,53,53,52,98,52,48,53,50,55,97,97,49,102,55,49,101,57,48,55,102,54,50,56,49,48,52,102,99,100,49,98,51,98,101,52,54,100,100,52,101,98,52,49,102,99,0,0,57,50,53,101,100,57,48,54,101,54,98,100,52,49,52,54,57,101,97,48,50,56,56,97,102,99,56,56,100,98,97,97,56,50,100,50,57,56,57,53,97,56,97,52,49,100,50,50,99,56,51,99,100,50,49,53,50,100,97,101,52,51,99,55,0,0,0,0,0,0,0,0,55,55,48,101,48,55,56,50,57,49,100,102,102,53,50,101,97,54,53,57,97,51,54,100,48,51,98,56,53,52,49,48,53,97,99,102,56,56,48,98,54,98,48,54,48,53,100,56,57,57,51,55,49,53,55,52,55,49,51,57,50,56,54,102,97,48,98,101,55,99,99,56,101,56,48,100,101,101,51,99,98,98,52,57,48,51,101,50,53,97,100,48,48,102,55,57,100,101,102,49,50,53,56,53,50,98,97,97,49,50,53,57,52,55,98,49,54,51,97,101,55,52,56,51,102,55,100,50,97,56,99,102,49,53,53,55,53,51,100,97,57,101,57,51,98,97,51,98,53,54,51,50,53,57,102,53,57,100,57,0,51,56,51,56,100,102,97,49,49,50,101,97,49,52,52,48,51,49,50,48,57,100,100,51,57,51,56,97,97,52,54,48,50,53,55,53,102,99,50,52,101,55,49,49,100,55,49,48,100,100,102,53,100,55,97,48,54,49,54,49,97,56,52,98,0,0,0,0,0,0,0,0,102,50,98,48,102,54,49,51,57,48,54,54,99,51,50,53,102,50,98,99,102,99,99,50,102,53,51,102,97,49,57,56,101,55,98,48,100,51,48,99,48,55,56,56,54,53,53,102,48,102,54,51,101,102,99,54,56,100,54,100,54,51,48,102,102,53,56,51,100,102,53,49,99,98,102,48,52,57,55,53,99,50,49,56,57,54,57,52,50,50,57,53,54,55,54,102,55,51,51,100,98,101,57,57,48,55,49,101,51,50,97,51,97,55,54,48,98,98,97,53,102,48,53,53,53,53,100,55,99,56,54,48,57,101,97,49,97,100,51,54,57,48,97,100,99,57,51,48,50,52,97,56,54,97,53,54,56,50,55,48,0,0,0,0,0,0,0,0,48,98,56,57,48,101,102,97,49,54,57,57,49,99,102,102,48,55,97,99,99,57,97,52,55,54,52,48,48,102,102,98,49,98,99,97,54,99,49,55,55,102,99,55,99,52,100,102,98,54,97,99,100,55,56,98,57,100,49,50,55,55,57,57,0,0,0,0,0,0,0,0,98,51,54,99,57,99,56,101,98,51,98,102,102,97,101,52,97,54,101,97,56,50,99,50,57,55,50,53,52,99,54,97,48,49,99,48,53,102,48,56,54,54,51,57,101,101,97,48,100,101,54,98,53,53,52,50,100,50,53,56,101,56,55,51,48,49,51,49,52,57,101,52,101,101,98,97,55,50,53,100,98,54,102,53,52,102,55,56,102,50,102,48,54,100,48,52,52,97,48,56,57,99,49,52,57,101,54,101,100,53,97,57,54,50,101,53,97,49,52,48,48,100,102,50,101,56,55,50,53,97,49,54,54,102,51,52,102,48,50,102,100,57,50,101,57,98,53,55,99,101,54,48,99,49,57,98,53,51,49,54,53,0,0,0,0,0,0,0,57,100,50,100,49,98,55,97,57,101,48,52,54,51,55,100,50,53,101,100,54,54,56,99,98,56,51,53,98,48,48,50,50,54,49,57,100,53,55,54,48,49,54,57,97,101,55,100,56,100,51,51,52,53,99,100,55,56,97,99,101,49,51,53,0,0,0,0,0,0,0,0,100,100,101,51,57,101,48,56,97,102,97,50,101,100,49,49,48,57,102,99,57,55,100,52,48,100,56,51,52,48,53,53,98,101,100,56,55,50,55,55,48,50,56,55,56,101,54,53,57,98,101,50,97,57,56,51,49,50,53,52,50,102,57,101,101,57,56,49,50,48,57,99,55,99,49,100,49,100,52,53,53,48,53,57,55,100,51,56,102,102,53,55,99,53,56,56,54,50,100,50,57,50,50,51,56,55,55,48,57,49,51,48,51,52,50,48,50,57,97,97,50,54,52,101,49,97,98,52,56,98,48,56,52,98,57,102,102,97,100,98,54,54,54,101,52,55,102,102,55,50,99,57,99,53,99,52,102,57,55,51,49,48,0,0,0,0,0,0,52,98,97,49,100,57,48,51,54,97,53,56,48,51,57,48,102,53,49,49,49,51,52,52,54,101,57,49,100,49,97,98,50,100,99,101,100,97,50,48,52,51,48,54,52,56,50,102,51,52,49,98,52,100,56,56,53,98,50,53,53,101,98,50,0,0,0,0,0,0,0,0,52,50,102,102,51,48,56,56,49,101,56,102,51,49,50,100,56,101,101,56,55,55,57,53,102,56,53,52,98,54,57,55,48,50,53,101,50,50,50,52,102,48,100,100,51,99,98,101,51,101,49,52,54,100,52,51,48,54,51,49,97,49,98,55,52,102,100,54,100,53,54,97,99,98,100,101,52,49,99,100,52,102,53,98,100,99,52,53,101,57,52,101,55,97,99,97,98,101,53,49,100,52,56,52,50,55,101,53,50,54,97,100,54,54,48,56,100,50,99,51,52,56,48,48,51,99,102,51,48,99,49,57,48,100,100,50,97,48,99,99,102,98,102,99,51,48,56,48,53,98,53,98,54,99,51,52,48,52,98,52,53,102,52,0,0,0,0,0,50,102,56,50,56,100,52,48,102,54,54,50,98,97,55,56,102,97,99,101,99,55,56,102,49,57,56,48,50,51,48,53,53,48,102,102,53,48,50,53,51,97,50,52,56,100,48,49,98,48,100,100,102,53,102,98,54,97,53,101,50,48,99,51,0,0,0,0,0,0,0,0,99,99,56,50,49,100,99,56,97,56,56,101,100,57,56,56,102,50,52,54,48,99,98,53,55,101,51,56,100,54,97,51,53,56,100,52,48,53,48,101,57,99,53,48,52,50,51,102,52,100,97,57,101,52,55,101,48,99,52,50,56,99,57,98,53,97,99,101,48,48,99,53,56,54,100,51,55,97,50,52,97,53,53,49,101,54,51,52,55,100,100,50,51,56,57,101,99,51,99,55,51,54,97,48,56,53,48,99,100,55,101,48,100,49,101,100,53,55,100,98,48,57,52,56,97,48,56,55,56,51,48,53,49,54,51,54,56,100,101,97,49,57,98,49,101,52,98,52,52,53,54,57,57,57,101,52,54,53,53,56,55,57,100,52,0,0,0,0,56,56,56,53,97,100,98,48,48,56,56,56,54,99,54,101,49,49,52,98,52,98,100,101,52,50,100,98,100,48,48,53,54,48,53,97,99,51,102,50,57,54,51,50,56,52,48,48,101,48,50,48,57,101,56,97,50,99,49,102,99,48,101,48,0,0,0,0,0,0,0,0,102,53,48,98,57,57,56,100,56,48,99,100,98,51,100,56,98,50,100,99,52,51,99,56,54,57,100,98,50,97,102,99,57,55,97,100,49,102,101,53,48,54,54,100,98,97,102,53,55,99,49,100,100,49,98,101,98,101,100,51,53,52,57,51,49,51,48,50,100,98,48,51,56,102,54,100,51,49,100,51,54,101,51,50,100,51,53,52,99,101,102,54,56,53,97,99,54,53,48,97,52,100,49,98,56,48,51,54,56,57,98,101,102,51,54,52,52,53,98,56,52,97,50,101,57,98,101,99,97,56,52,99,98,53,98,101,102,54,101,57,102,48,54,98,51,102,56,102,102,54,54,55,97,48,54,52,99,101,49,49,53,49,102,49,55,0,0,0,100,99,100,101,57,48,54,52,98,53,52,54,50,51,52,53,97,101,102,53,97,52,97,49,56,98,57,98,99,48,52,55,48,54,100,49,100,100,99,52,99,50,97,54,49,53,100,49,100,97,49,99,98,101,55,99,49,55,102,55,97,52,53,52,0,0,0,0,0,0,0,0,53,99,50,56,50,52,52,51,55,48,101,56,56,52,101,97,99,101,49,52,49,49,51,99,55,52,97,97,56,53,99,101,100,49,52,50,51,51,52,52,54,100,101,54,99,99,100,55,102,50,51,54,49,56,101,49,48,55,48,100,97,52,98,102,102,101,97,56,99,99,97,55,99,98,49,55,53,100,56,101,102,56,50,49,55,100,48,51,57,54,101,99,57,51,55,54,49,99,52,50,55,54,101,99,57,56,51,56,97,53,53,49,48,97,51,97,56,97,97,102,102,55,100,100,57,52,102,48,48,49,99,100,54,48,50,48,50,56,51,49,49,102,53,53,100,99,101,55,57,55,98,97,99,99,100,55,55,101,102,50,48,101,99,49,55,48,0,0,101,56,101,51,55,100,56,100,51,99,51,51,49,52,98,57,49,54,54,49,55,51,50,48,56,98,49,48,49,101,102,98,52,49,102,56,102,54,98,57,49,99,51,100,102,57,57,51,53,55,49,49,56,52,97,49,51,57,52,101,55,49,100,98,0,0,0,0,0,0,0,0,102,53,102,98,98,53,53,98,54,53,53,55,49,55,54,97,50,49,56,53,52,97,97,97,57,53,101,52,102,53,55,57,55,50,100,102,100,52,53,100,50,97,49,100,102,97,51,48,97,102,100,50,55,99,48,50,51,52,57,97,97,97,56,102,55,51,101,48,54,97,102,98,97,52,53,99,50,56,48,48,100,56,49,100,48,55,99,101,97,49,97,101,97,54,52,54,53,51,97,55,48,55,101,99,100,51,102,50,52,99,102,102,99,49,98,100,50,99,52,57,57,49,102,53,52,102,48,56,101,49,97,55,101,56,50,52,54,57,49,56,97,101,102,102,49,52,55,56,57,50,53,55,48,53,56,102,98,99,101,99,98,51,50,97,54,99,55,0,55,51,51,52,52,100,100,49,102,99,51,52,97,50,50,57,48,97,49,97,101,55,100,99,57,100,55,56,53,57,53,102,57,49,55,49,101,97,55,100,98,53,52,57,54,56,56,99,97,99,99,50,98,55,50,53,49,50,57,99,57,101,51,101,0,0,0,0,0,0,0,0,49,55,100,100,56,57,101,97,99,97,98,49,49,50,101,98,56,56,48,49,100,102,48,49,97,97,52,53,54,100,100,54,102,99,53,101,53,55,49,100,56,102,49,55,100,99,52,52,57,49,54,50,99,100,100,55,49,102,56,48,53,99,52,100,100,98,57,55,101,101,50,99,100,53,97,98,97,99,53,57,56,55,51,55,100,51,97,57,57,53,51,101,48,55,50,51,50,52,100,57,56,52,49,56,102,51,98,48,102,55,48,55,53,50,51,48,55,54,97,55,99,57,51,56,53,55,99,100,52,52,99,98,51,50,97,52,98,102,49,55,48,101,101,102,100,48,54,48,99,55,49,50,53,97,56,53,51,51,56,53,102,54,51,102,54,57,57,98,0,0,0,0,0,0,0,0,52,55,99,50,48,50,54,50,52,51,50,57,56,101,48,51,50,100,57,52,97,51,54,102,100,57,48,56,98,98,51,55,100,102,52,101,56,56,101,52,97,100,50,99,51,53,97,57,52,98,51,48,101,54,102,50,48,57,56,53,49,53,56,54,0,0,0,0,0,0,0,0,53,55,51,54,101,51,52,48,102,55,57,51,50,51,49,51,50,100,99,101,48,102,49,50,55,53,98,100,57,54,54,101,51,102,102,50,56,97,97,53,51,99,57,101,97,100,57,102,98,100,98,100,57,102,57,52,100,100,52,100,57,55,52,54,51,48,52,100,54,48,52,54,99,56,101,55,55,49,100,51,50,100,53,97,55,50,97,101,101,101,52,53,55,55,53,98,52,57,49,54,97,53,99,99,50,48,48,49,48,57,97,49,53,53,50,98,56,49,99,55,50,101,51,102,48,100,102,99,49,49,54,49,49,54,100,53,56,100,52,51,54,52,56,50,56,48,50,101,53,49,52,53,48,51,98,49,55,102,52,49,54,48,102,51,48,49,102,57,101,0,0,0,0,0,0,0,50,50,50,51,98,97,52,56,56,98,53,55,48,48,54,48,100,98,100,52,100,99,56,101,102,99,97,99,49,102,100,49,51,54,52,51,55,51,100,49,101,50,97,57,52,54,54,52,101,102,49,51,98,50,50,50,99,54,50,99,99,99,49,55,0,0,0,0,0,0,0,0,54,98,57,97,100,57,56,97,101,100,102,50,50,97,97,52,50,100,49,100,54,53,102,48,97,53,102,54,100,97,50,101,49,102,56,99,55,98,98,99,100,102,55,50,101,97,53,54,57,52,97,50,51,50,102,52,52,48,98,53,50,57,57,50,101,52,53,51,49,51,100,48,97,54,98,101,48,100,56,51,97,99,56,99,97,48,99,101,99,98,100,53,51,55,102,51,100,101,101,101,57,51,56,97,100,55,52,52,53,52,54,97,48,100,57,101,102,51,49,98,56,52,48,54,99,48,54,97,50,100,97,56,102,54,56,48,51,48,48,100,56,98,50,101,97,101,98,55,99,100,102,97,48,56,51,51,53,48,50,49,51,53,55,56,57,57,48,51,54,51,0,0,0,0,0,0,54,56,101,51,53,53,102,99,55,102,52,98,56,101,54,98,101,52,55,57,55,100,50,101,100,51,48,52,102,49,55,52,57,54,100,100,48,53,98,48,49,57,55,97,54,52,55,50,55,100,102,53,53,56,54,55,98,55,97,55,97,53,52,51,0,0,0,0,0,0,0,0,100,57,50,55,51,51,98,51,56,48,102,100,101,56,49,100,48,53,54,48,48,56,56,102,57,55,49,50,51,99,55,99,55,50,57,102,101,54,102,50,57,55,55,101,99,100,57,102,54,49,97,49,100,55,50,49,53,102,55,48,54,102,55,100,51,97,99,101,98,51,49,101,99,48,102,50,51,98,51,52,51,55,52,99,97,50,49,51,54,101,50,100,97,55,99,57,50,56,98,49,57,53,102,102,56,99,97,57,102,102,56,48,57,49,101,97,102,99,53,49,50,56,98,48,52,48,48,54,99,99,100,102,53,52,49,55,102,97,54,102,56,54,97,99,48,56,99,50,99,49,99,101,53,56,53,51,54,51,55,56,55,98,51,97,52,52,57,50,101,99,98,0,0,0,0,0,51,50,54,101,49,53,55,50,57,101,50,55,53,99,50,100,97,50,48,101,102,55,97,48,101,97,49,99,56,53,57,100,102,54,100,102,97,57,51,97,53,56,57,100,52,50,57,97,102,52,50,55,53,102,52,99,57,99,100,97,52,57,101,52,0,0,0,0,0,0,0,0,51,100,50,54,99,51,52,56,55,101,99,102,99,55,98,99,52,48,57,48,101,102,48,57,54,54,97,48,101,54,52,51,100,98,101,48,56,57,54,56,54,51,97,100,56,48,101,53,100,53,53,57,98,55,48,52,57,100,53,53,98,57,53,54,57,98,101,54,49,50,99,101,50,102,55,54,100,51,102,56,55,54,57,55,52,97,97,101,48,54,101,56,102,99,101,55,48,49,100,48,56,54,97,101,56,55,101,55,49,51,101,50,102,49,57,49,51,100,53,97,50,54,54,55,50,53,97,98,57,57,53,54,98,52,55,51,98,56,52,51,55,50,101,56,53,97,99,56,98,49,56,51,55,99,56,101,100,98,57,50,100,97,51,98,97,51,51,99,53,53,56,97,0,0,0,0,54,54,55,49,100,49,52,49,53,52,100,55,56,49,57,54,97,48,101,55,50,100,50,50,56,56,56,57,54,102,50,54,102,56,49,53,52,100,49,102,54,101,100,54,50,50,101,57,97,99,49,49,51,99,53,51,102,52,53,53,100,57,102,50,0,0,0,0,0,0,0,0,50,52,51,97,99,49,52,97,55,56,51,50,52,50,55,52,50,53,51,100,54,53,56,53,49,53,99,100,54,53,97,52,49,55,48,55,100,102,53,52,50,51,99,48,52,98,52,101,102,57,97,50,97,55,54,48,101,53,56,100,49,101,100,101,53,48,101,54,101,54,57,57,97,52,53,48,50,53,57,99,48,52,99,57,54,55,102,101,56,97,101,102,51,100,55,49,97,100,53,102,100,49,49,48,57,57,98,97,48,55,56,57,101,51,48,100,98,57,99,53,53,50,97,100,102,52,57,49,57,49,100,102,51,56,57,102,97,52,101,101,54,102,101,54,98,99,52,100,49,102,52,51,57,54,102,99,56,50,50,54,50,56,50,53,48,54,51,57,101,102,99,57,99,0,0,0,57,57,48,53,98,55,56,97,50,56,48,57,57,55,102,50,101,99,48,51,101,52,51,48,53,50,98,101,50,48,54,54,99,54,52,54,50,53,57,51,102,101,51,54,52,56,102,101,48,102,50,99,48,50,100,57,49,99,102,100,102,100,57,98,0,0,0,0,0,0,0,0,54,100,52,50,101,48,97,102,102,56,101,101,99,98,102,48,98,98,99,101,50,49,52,57,97,98,57,98,53,48,57,98,54,97,102,53,51,49,101,48,97,100,51,98,53,57,54,49,48,98,54,101,54,97,48,55,100,49,54,57,54,97,50,52,55,98,100,100,53,98,53,57,48,57,53,100,48,57,49,55,54,48,97,51,50,55,101,57,55,48,56,49,51,102,102,102,49,99,48,51,52,48,57,52,101,97,53,48,54,50,100,48,48,50,53,57,101,98,51,52,100,52,57,53,57,54,53,52,50,57,55,98,55,101,97,54,100,55,57,98,101,56,51,98,97,56,52,51,56,55,100,53,53,49,53,50,99,102,98,57,97,99,56,55,50,97,100,56,102,101,57,97,100,52,0,0,55,48,49,101,48,101,97,102,97,99,102,101,53,56,99,52,53,48,48,98,100,55,55,55,97,53,97,102,54,49,101,98,51,57,49,100,54,99,51,51,49,99,49,54,51,98,49,102,54,54,48,54,48,102,50,57,57,98,55,99,53,102,50,49,0,0,0,0,0,0,0,0,99,54,49,52,99,48,51,99,56,97,50,99,102,102,54,50,56,97,51,99,102,102,97,57,50,101,52,49,52,54,55,48,99,56,48,98,49,100,98,99,101,55,49,99,98,54,57,50,55,56,57,56,51,48,52,49,97,51,101,55,97,101,56,51,49,52,100,56,49,49,99,51,97,100,52,54,52,57,57,99,53,52,100,99,52,50,52,51,49,99,99,99,50,100,56,98,100,57,54,97,100,97,97,51,50,101,100,56,102,48,54,100,48,97,48,49,100,57,100,57,53,97,100,98,57,51,101,48,97,50,100,57,99,99,57,53,101,52,100,98,53,56,97,102,57,52,50,51,51,50,99,51,52,50,99,102,100,57,101,101,48,52,51,55,98,99,99,57,51,100,49,51,57,51,54,0,101,56,55,52,50,98,53,53,57,99,102,97,56,51,54,97,57,50,101,48,54,50,54,54,53,53,100,101,100,101,50,52,102,56,48,48,97,102,49,49,102,101,102,53,48,99,100,52,57,102,99,50,48,97,102,57,49,99,101,99,48,49,97,101,0,0,0,0,0,0,0,0,55,99,48,55,49,98,99,100,49,49,102,54,98,49,48,54,50,55,53,98,97,52,50,56,56,102,99,49,102,48,50,101,52,57,97,100,100,102,48,54,100,102,49,53,101,53,100,99,53,52,50,99,48,52,57,55,99,51,52,98,51,97,51,102,55,54,97,101,100,51,50,55,102,98,98,56,97,54,56,102,53,53,54,49,56,57,49,52,56,54,54,50,101,100,98,50,97,56,57,56,97,52,51,51,97,49,97,102,52,48,102,101,53,55,54,98,98,101,54,100,55,55,55,49,51,51,97,101,97,48,54,57,100,99,56,99,56,51,49,55,50,54,57,53,50,54,52,102,48,98,55,49,50,55,100,99,49,102,102,98,99,52,48,48,99,56,48,100,53,51,99,102,54,57,56,56,0,0,0,0,0,0,0,0,99,54,55,56,102,53,97,56,56,101,51,52,56,55,56,99,57,50,50,54,100,51,97,54,97,56,57,102,99,49,53,56,48,48,97,101,98,54,53,97,51,55,100,54,53,98,55,49,56,51,98,51,57,100,50,49,97,50,53,49,56,98,49,49,0,0,0,0,0,0,0,0,53,97,49,100,53,53,54,53,97,52,102,55,51,57,55,54,56,57,98,99,97,51,48,54,55,48,55,100,50,54,97,52,50,98,100,98,98,99,54,100,56,49,97,50,50,49,52,51,57,51,97,101,101,101,101,54,52,55,51,54,53,100,54,49,49,102,102,48,102,56,57,55,99,51,55,98,101,101,98,98,99,99,101,53,52,50,52,56,102,101,102,53,55,50,98,56,51,100,99,100,56,49,102,101,98,52,49,53,57,49,101,57,55,98,53,48,56,51,52,53,100,102,51,102,98,50,54,50,48,48,99,55,99,99,57,49,50,55,56,52,55,102,57,97,57,53,99,48,54,48,97,53,53,48,54,50,49,57,97,49,50,100,51,50,51,101,100,48,102,52,98,48,101,53,48,57,52,0,0,0,0,0,0,0,50,53,49,57,54,48,97,55,97,55,99,56,53,50,54,50,56,97,50,50,55,99,97,53,99,100,48,100,98,50,102,99,102,49,99,54,98,51,97,51,57,98,55,102,55,52,54,101,97,101,57,100,50,55,97,52,49,101,97,55,48,49,48,53,0,0,0,0,0,0,0,0,97,98,102,56,49,49,54,102,51,52,55,51,48,55,56,54,56,98,56,100,54,55,50,50,50,52,98,98,49,50,48,100,51,102,101,50,101,54,48,102,101,97,54,55,100,49,57,99,50,57,100,97,52,56,49,51,49,98,52,55,99,56,53,53,49,51,97,54,97,56,48,49,51,50,98,49,56,48,99,57,100,50,52,48,48,56,53,97,48,54,56,54,99,97,99,55,54,56,100,100,48,101,52,49,99,48,51,48,48,102,51,100,54,54,99,49,52,49,50,48,48,52,98,54,55,101,100,52,51,99,49,54,57,55,98,48,56,101,97,53,97,55,101,102,51,98,52,54,97,97,99,102,55,101,99,53,55,97,98,54,50,57,99,97,57,97,55,97,55,97,49,57,98,53,55,99,54,51,0,0,0,0,0,0,100,53,52,101,101,48,57,101,50,55,51,56,101,102,97,101,101,53,51,48,54,55,56,53,97,49,52,99,98,98,54,53,54,57,99,53,97,56,52,102,54,50,54,48,98,97,50,100,51,102,100,100,53,52,48,53,54,50,48,100,57,97,48,55,0,0,0,0,0,0,0,0,100,98,97,49,56,50,56,53,52,100,98,100,101,97,48,100,98,54,57,55,51,102,100,49,49,54,51,51,50,102,49,98,51,98,102,48,98,51,101,98,100,54,102,49,56,52,55,53,102,51,97,55,49,49,49,101,54,100,100,50,101,53,56,48,57,57,57,99,48,55,100,56,54,56,52,100,48,48,53,48,49,49,53,51,99,49,50,98,49,52,101,98,55,100,54,50,52,97,51,100,55,100,97,97,51,54,48,100,53,101,98,56,101,50,50,102,49,102,101,99,52,53,54,99,56,99,102,99,97,53,52,54,54,54,51,54,101,98,54,53,50,99,51,49,57,98,54,97,53,55,53,52,50,55,98,97,102,100,97,101,101,98,100,101,51,50,53,99,51,54,99,51,52,48,56,49,101,52,48,0,0,0,0,0,98,50,49,52,99,55,52,51,57,56,53,50,97,99,54,48,49,55,99,98,53,99,48,99,101,97,56,101,56,99,100,101,53,56,53,55,97,97,97,49,48,56,52,54,50,101,50,97,99,99,55,56,54,49,98,100,51,52,56,51,101,98,48,102,0,0,0,0,0,0,0,0,97,52,50,55,98,102,48,98,51,57,48,51,102,52,101,99,49,101,49,51,48,49,99,102,52,48,57,56,102,101,53,52,100,102,56,48,49,52,101,101,98,55,50,52,57,102,53,48,99,101,56,52,56,99,50,98,101,53,48,52,57,48,100,98,101,99,101,54,51,100,97,49,52,52,97,53,54,102,48,100,56,102,98,54,54,50,52,99,50,102,99,50,51,54,56,49,57,101,102,48,102,56,56,56,100,52,51,49,52,56,101,57,55,50,51,99,98,98,100,57,100,57,52,102,55,51,50,99,102,52,53,50,97,49,98,57,101,57,99,102,99,53,102,48,52,53,99,53,53,54,101,98,98,99,99,54,55,54,102,99,98,54,102,102,56,48,52,56,98,52,49,102,57,50,100,101,52,102,56,48,0,0,0,0,101,52,98,49,98,101,57,53,57,100,97,49,51,99,56,98,101,102,57,57,50,53,49,99,50,50,56,51,55,57,51,97,48,102,51,53,57,55,97,97,99,53,49,101,54,100,53,57,101,100,51,97,50,48,56,51,52,54,50,54,50,101,48,48,0,0,0,0,0,0,0,0,97,48,97,97,102,57,53,97,50,50,56,53,48,51,50,99,57,48,57,54,99,100,54,98,97,48,49,99,52,49,48,99,49,56,56,99,57,50,50,99,98,101,55,55,97,56,49,57,101,53,102,57,101,57,53,57,53,53,98,56,97,102,53,52,49,50,57,51,102,54,49,48,50,52,48,57,98,98,52,54,55,51,49,57,99,49,99,98,54,56,48,99,99,51,56,55,56,48,50,56,51,49,52,57,97,57,50,49,52,51,101,101,54,52,52,57,54,56,49,100,54,56,100,51,54,101,100,97,101,100,55,56,54,48,98,55,51,49,51,102,57,51,49,52,56,53,102,99,49,56,98,57,101,57,53,98,49,50,54,100,100,98,99,99,100,51,48,53,98,51,48,50,55,99,52,49,50,55,52,50,102,0,0,0,52,98,100,100,57,48,99,57,53,49,54,54,97,55,98,56,49,55,50,52,54,50,97,50,52,57,54,55,52,48,48,54,101,101,53,48,101,48,49,48,51,101,56,98,55,54,48,53,56,98,100,52,51,53,100,50,98,57,52,100,56,55,97,101,0,0,0,0,0,0,0,0,57,51,102,54,48,48,101,55,57,99,56,97,50,51,55,102,98,49,97,100,49,49,51,48,48,102,102,97,53,48,102,53,49,102,102,97,48,101,102,51,56,50,97,51,99,99,100,100,102,50,50,101,56,49,57,98,98,52,49,102,99,56,99,57,102,57,53,51,101,57,56,99,100,102,57,98,55,50,53,101,50,54,57,55,57,52,102,49,102,56,97,99,99,49,49,52,51,98,51,98,102,49,97,99,52,52,97,54,97,51,50,55,52,54,101,102,101,51,102,54,101,55,51,100,55,97,57,57,54,51,54,102,53,98,98,102,97,48,54,53,49,101,51,49,53,51,49,100,48,49,49,99,99,98,51,48,97,52,54,99,99,56,49,102,48,50,49,50,102,53,100,50,52,100,102,48,49,56,48,100,51,56,0,0,101,56,54,98,52,48,57,97,98,101,101,56,54,98,54,49,100,57,55,57,99,98,48,102,100,101,56,49,50,52,49,98,97,102,48,48,57,98,98,51,56,53,98,57,98,102,101,53,52,57,56,55,55,97,55,54,49,97,49,52,99,54,102,101,0,0,0,0,0,0,0,0,98,98,100,51,55,99,100,51,56,52,53,49,57,49,101,50,57,100,48,53,97,53,101,97,52,53,48,55,102,57,57,54,97,51,57,100,55,98,52,52,101,55,52,48,102,57,55,50,55,99,54,52,48,51,55,97,97,102,98,55,56,51,48,100,51,97,54,54,51,50,102,55,57,55,56,57,57,99,101,55,102,53,54,48,51,53,52,54,56,53,97,48,101,51,48,99,49,54,51,99,50,52,55,48,98,97,55,99,48,48,97,101,99,99,98,98,97,99,50,49,52,49,48,49,48,97,52,51,53,101,101,100,102,49,53,102,102,57,53,102,99,53,98,53,54,55,52,101,52,54,97,55,97,57,54,57,102,99,102,57,97,48,98,48,52,49,48,100,54,101,48,56,97,50,49,49,48,50,97,51,50,49,54,0,101,57,97,49,99,49,52,48,97,51,57,55,52,49,98,57,52,56,98,54,100,98,54,48,102,98,52,54,49,56,56,100,97,53,97,57,48,57,99,51,102,97,52,48,55,100,50,48,100,52,101,102,48,98,55,57,102,100,50,48,99,49,99,97,0,0,0,0,0,0,0,0,48,99,48,56,49,97,98,57,98,99,54,56,50,98,57,53,102,100,51,98,55,51,98,100,49,97,48,97,101,97,99,102,55,100,99,98,98,49,56,55,98,97,52,53,54,49,51,52,101,101,57,55,99,102,57,48,49,57,54,101,102,54,101,102,49,55,49,57,53,99,100,98,52,53,102,54,49,98,100,53,97,51,55,55,101,55,98,99,52,56,57,52,99,102,53,51,55,49,99,100,101,99,98,51,48,102,53,52,98,49,98,97,97,49,97,57,99,102,53,102,102,56,49,98,100,102,57,56,53,57,49,53,100,99,99,48,50,99,52,49,101,49,97,53,48,50,53,56,99,53,102,57,98,99,100,55,55,97,97,99,99,97,99,50,98,48,101,54,56,97,102,97,100,102,99,100,48,101,100,50,57,53,98,100,0,0,0,0,0,0,0,0,100,51,53,55,54,57,50,51,54,101,51,98,52,97,55,57,99,55,101,101,102,99,57,48,54,50,48,55,100,100,51,99,55,100,53,54,55,102,56,99,52,48,98,57,101,52,97,54,54,56,52,97,97,99,97,101,102,52,48,98,102,99,56,56,0,0,0,0,0,0,0,0,101,57,101,48,98,56,101,53,56,52,99,52,100,97,52,57,54,53,56,99,50,101,50,56,51,54,102,97,99,102,51,50,101,97,56,56,102,97,56,99,98,101,97,56,53,101,48,53,56,50,51,56,100,99,56,52,102,99,54,100,57,97,50,55,52,100,57,53,51,55,55,102,55,49,52,97,56,48,53,50,48,56,102,98,54,100,102,48,52,102,54,101,54,50,56,51,97,48,56,102,100,101,53,100,54,57,53,102,98,100,48,98,48,57,57,101,50,102,101,53,49,101,57,48,54,48,49,100,50,57,98,48,48,102,55,52,51,48,97,49,102,57,57,57,102,54,56,48,102,57,99,52,97,54,53,49,101,57,54,48,98,101,57,101,98,50,48,102,55,99,102,52,57,50,52,48,53,99,101,98,98,53,102,97,98,0,0,0,0,0,0,0,48,100,99,57,101,99,53,100,52,56,98,101,56,52,53,99,51,99,101,101,97,54,97,102,98,50,54,55,101,55,54,50,49,57,102,98,49,54,50,52,54,55,56,54,99,52,97,51,49,57,53,55,48,98,49,98,55,101,99,50,98,102,98,56,0,0,0,0,0,0,0,0,53,98,48,55,50,101,57,100,102,57,50,98,53,57,100,102,101,97,52,50,97,49,53,51,57,55,53,97,100,55,102,57,101,55,57,97,97,97,97,100,52,101,52,97,101,100,57,100,52,53,55,54,50,98,49,49,52,56,99,57,50,97,98,54,49,52,55,54,98,56,98,54,54,97,52,56,102,97,49,49,54,53,51,55,99,50,100,102,100,102,102,56,57,51,53,54,56,49,53,52,55,101,98,57,98,51,53,57,49,52,53,102,49,56,51,51,48,50,57,99,100,49,50,99,53,100,52,54,101,52,49,98,97,48,51,53,48,102,56,49,102,98,102,56,57,97,52,52,102,54,49,57,98,55,49,49,48,98,97,51,55,97,98,49,51,102,51,97,50,51,97,48,52,55,100,98,98,52,57,99,54,53,48,101,56,98,0,0,0,0,0,0,55,100,52,56,56,100,101,51,50,102,98,55,99,50,98,52,57,53,98,101,55,56,50,55,51,50,55,51,52,101,49,99,57,100,57,97,98,54,97,102,99,102,98,98,51,56,50,49,49,101,57,54,100,54,100,56,99,97,57,97,99,101,100,50,0,0,0,0,0,0,0,0,54,52,101,50,49,99,100,57,53,57,51,57,53,99,97,56,57,50,100,56,100,56,53,49,102,57,98,97,54,53,55,101,50,57,57,57,55,97,100,52,57,101,51,98,97,53,57,100,55,51,50,49,50,99,102,50,99,97,100,102,53,53,51,51,99,54,53,50,48,55,101,50,98,57,48,98,99,101,53,48,53,100,52,50,53,50,98,98,56,57,57,54,54,50,101,53,98,101,53,53,54,51,53,52,50,100,100,50,48,97,99,54,50,99,53,102,57,99,50,52,98,50,102,48,99,57,54,100,98,54,101,55,101,52,55,56,50,51,102,97,57,98,97,48,101,97,56,49,48,50,57,52,48,52,52,99,57,52,102,49,100,102,97,52,50,55,52,49,55,53,49,57,56,56,54,50,52,53,51,97,50,98,102,99,102,49,56,0,0,0,0,0,53,53,55,99,97,56,98,54,51,48,50,99,101,56,48,57,99,48,52,48,48,53,49,48,50,51,50,50,98,99,51,51,98,52,54,52,50,48,57,56,48,50,49,99,101,55,49,48,49,57,53,54,50,49,49,49,54,57,99,52,101,54,100,55,0,0,0,0,0,0,0,0,50,53,52,99,97,99,55,56,54,100,48,102,50,55,49,51,99,50,101,49,53,50,102,51,99,56,50,50,52,50,48,50,101,98,51,56,53,55,98,102,52,57,56,51,51,97,50,53,99,54,55,49,100,48,56,99,57,50,53,52,98,54,98,57,101,101,52,50,100,99,52,53,54,51,99,98,52,57,52,97,51,98,52,53,51,51,100,97,57,49,50,102,51,54,52,99,50,56,49,99,98,102,98,57,53,54,101,98,52,100,54,57,101,101,51,97,101,55,99,101,52,55,102,98,49,54,51,54,102,54,57,48,97,101,51,100,48,50,52,98,51,99,54,101,56,48,48,50,53,49,102,102,54,100,49,98,54,56,100,56,99,50,48,57,48,55,56,55,52,51,100,56,100,97,98,50,48,100,48,48,97,53,98,54,56,98,53,55,0,0,0,0,97,101,100,52,55,57,99,57,56,49,97,57,101,98,101,52,55,101,51,54,54,100,49,50,50,50,52,100,53,50,50,51,55,99,52,53,99,49,101,98,56,57,100,49,57,48,97,101,52,101,102,50,97,49,99,55,102,98,97,99,54,56,100,98,0,0,0,0,0,0,0,0,55,49,56,50,50,51,51,100,49,54,51,102,49,55,101,97,53,53,102,101,50,51,102,100,55,101,52,100,101,49,99,50,99,97,101,54,99,99,55,50,55,56,97,55,49,53,97,50,102,98,102,49,100,98,52,57,51,53,49,102,54,102,100,49,101,100,49,52,56,51,50,57,48,48,56,55,50,48,48,55,101,56,100,100,49,56,97,52,55,54,48,101,102,50,51,102,51,99,55,102,102,56,53,98,57,54,52,48,50,99,48,100,57,99,97,53,57,52,100,101,56,52,56,50,51,101,52,57,53,100,53,56,101,102,49,57,53,49,98,57,99,100,100,102,52,56,99,50,101,99,102,53,48,55,51,97,98,99,57,50,48,53,55,50,101,54,57,52,99,52,102,101,53,102,51,101,54,101,100,53,56,49,56,48,100,52,102,99,48,0,0,0,54,48,57,100,100,101,57,54,50,100,49,49,99,50,53,57,51,99,100,57,51,100,53,48,102,52,100,51,99,53,100,100,55,50,98,49,51,98,50,51,49,49,53,51,56,51,48,102,56,99,52,48,57,52,99,102,50,52,100,48,56,52,57,55,0,0,0,0,0,0,0,0,54,100,101,49,98,97,56,50,99,49,52,50,102,53,57,51,98,52,55,100,99,98,99,102,55,52,100,102,99,51,51,101,99,52,99,56,102,101,98,49,49,52,53,56,49,49,99,55,51,56,52,56,54,52,52,55,97,53,50,54,48,50,56,53,50,101,57,50,53,53,100,52,57,97,99,57,55,102,51,100,101,57,50,97,57,51,53,101,98,54,48,48,53,49,52,98,100,102,55,55,55,51,99,56,99,56,97,53,100,50,54,54,99,98,49,53,101,55,55,52,56,48,50,48,100,99,56,101,53,99,54,55,97,57,53,99,48,101,51,101,51,49,100,50,48,99,100,54,49,98,98,54,97,99,97,53,100,55,50,50,49,98,50,101,101,55,101,53,50,52,100,97,97,57,98,48,100,52,56,49,50,101,97,53,102,99,57,56,57,51,0,0,48,102,51,98,100,51,51,55,101,100,50,52,57,101,97,54,57,56,53,98,98,101,50,54,54,102,52,55,100,50,101,102,100,56,56,100,55,53,102,101,50,51,98,53,52,56,55,98,48,101,52,55,57,102,97,102,99,101,51,56,57,54,54,49,0,0,0,0,0,0,0,0,50,57,100,57,57,54,50,52,56,50,99,98,54,54,50,100,97,98,57,52,49,54,99,102,97,57,53,49,57,99,102,98,52,53,97,54,51,54,56,49,100,57,50,99,49,99,57,100,99,97,48,54,55,101,101,52,100,102,57,100,102,48,54,56,50,50,54,57,51,52,56,102,57,100,102,99,56,49,101,55,50,101,101,100,98,99,53,97,99,52,99,52,99,99,102,99,57,100,54,51,55,50,51,57,97,51,98,54,50,57,57,50,101,98,55,48,52,100,51,102,57,53,56,49,50,50,57,55,57,57,57,102,48,50,98,57,48,51,97,100,53,101,55,97,102,53,100,57,57,53,53,99,51,54,53,100,52,99,55,48,50,99,52,54,97,54,49,57,102,101,57,53,55,54,51,49,50,56,98,102,99,97,101,51,101,98,53,54,52,51,101,0,99,48,53,100,56,57,99,53,51,100,48,98,99,55,52,49,97,52,99,51,100,97,101,57,56,97,55,52,55,51,51,50,101,57,48,100,98,55,102,49,54,56,57,51,52,49,55,48,100,51,98,51,100,55,50,101,97,54,52,102,99,50,100,57,0,0,0,0,0,0,0,0,99,101,53,99,49,97,55,97,53,57,57,51,98,56,50,100,51,57,102,53,98,99,51,55,57,102,97,102,48,99,53,56,98,57,102,49,51,102,99,55,98,54,100,55,99,55,50,49,102,49,101,99,51,52,97,102,52,48,51,100,51,48,97,98,52,99,52,57,48,52,50,50,100,50,102,102,48,50,49,53,51,102,56,56,97,100,48,51,100,54,56,54,99,50,55,101,48,100,48,51,57,56,50,98,57,50,51,49,51,53,98,56,51,54,52,51,99,49,102,97,55,102,53,53,100,54,52,54,50,52,56,101,49,52,54,48,53,54,100,97,99,99,57,102,53,55,102,57,51,99,57,97,48,101,102,49,53,56,99,97,98,98,98,100,53,56,102,51,48,51,57,102,99,57,53,52,55,99,99,53,99,57,55,48,52,50,57,98,55,55,50,98,0,0,0,0,0,0,0,0,56,48,54,100,48,48,49,54,48,54,55,100,102,102,50,100,100,53,100,49,100,54,48,99,49,101,51,102,102,100,54,53,98,50,55,56,51,51,102,56,102,100,99,48,52,99,101,99,100,54,99,48,51,55,48,102,97,102,50,97,56,53,48,48,0,0,0,0,0,0,0,0,57,48,101,102,99,56,50,54,55,57,102,101,99,49,51,49,53,50,100,55,101,48,50,48,99,102,51,51,57,51,56,56,55,97,99,99,53,54,53,50,50,55,51,49,50,99,98,100,98,49,97,50,99,99,51,49,98,100,50,102,101,57,99,100,52,52,102,101,55,97,100,51,50,98,54,56,98,50,55,56,48,100,53,51,51,48,102,98,51,98,99,99,51,98,48,55,49,51,54,56,54,49,54,52,99,100,101,52,101,101,99,49,50,49,54,51,51,97,99,54,52,101,49,100,50,52,55,102,55,51,55,57,54,98,56,48,98,98,99,52,98,53,55,101,50,56,51,53,50,51,102,51,48,101,102,49,48,97,102,54,55,49,48,48,101,52,49,57,102,99,50,51,53,55,97,52,52,50,48,52,52,55,99,52,97,51,97,49,100,53,100,54,50,0,0,0,0,0,0,0,53,99,57,53,55,98,53,102,57,57,100,53,51,51,98,53,55,101,53,97,49,57,52,53,55,53,98,102,100,99,56,48,99,57,57,54,101,55,54,52,57,52,97,50,100,52,101,97,54,49,49,57,56,98,56,55,54,102,56,55,56,99,53,50,0,0,0,0,0,0,0,0,52,100,57,101,98,51,97,97,48,97,53,102,101,100,101,100,52,100,97,51,98,56,50,98,55,53,53,57,53,97,97,51,97,101,100,56,49,54,101,48,97,51,53,48,99,53,51,99,52,56,52,55,100,102,102,51,49,97,98,57,51,53,99,56,48,100,55,99,97,102,97,97,50,52,100,100,53,57,57,53,97,48,54,48,99,52,101,56,101,50,52,51,51,100,99,97,51,52,53,101,98,99,100,51,48,53,51,98,50,48,55,98,55,57,48,53,97,97,55,49,99,49,51,100,97,56,57,97,102,99,52,55,48,51,97,98,102,97,97,49,57,51,51,49,57,48,57,56,50,98,102,54,50,55,51,52,56,97,98,56,48,97,101,100,48,56,57,49,101,51,56,50,97,49,52,51,50,52,99,56,49,99,56,99,53,101,50,55,50,53,102,51,53,51,0,0,0,0,0,0,49,54,97,51,49,56,100,50,56,54,49,56,51,100,51,57,102,99,49,56,101,49,97,97,51,50,51,55,101,49,49,57,102,55,99,102,54,98,51,49,101,54,53,49,56,100,99,51,98,53,55,99,52,53,48,49,55,57,100,55,55,49,97,51,0,0,0,0,0,0,0,0,99,102,98,51,53,97,57,100,99,55,99,54,48,54,52,102,49,97,54,57,53,99,52,49,100,57,50,53,97,100,56,54,51,97,101,98,102,55,55,100,98,102,97,49,53,49,57,101,56,54,102,51,100,100,50,97,52,98,55,55,52,53,55,48,54,102,102,55,50,53,54,49,52,48,48,55,49,52,52,100,51,98,101,49,55,50,101,54,99,53,51,98,55,53,53,57,100,51,57,102,52,51,57,48,56,53,52,55,50,48,57,53,53,48,52,51,102,57,98,51,56,53,50,101,49,98,49,49,57,48,49,48,48,99,54,50,102,54,53,49,51,50,55,97,52,101,56,52,101,102,48,48,48,55,100,57,97,57,98,101,54,49,48,56,56,49,97,99,97,56,97,98,48,102,54,50,102,97,55,54,57,55,54,102,53,50,49,101,55,98,53,99,57,52,98,0,0,0,0,0,97,52,98,52,97,51,101,50,99,57,101,50,98,101,50,50,52,57,99,102,100,54,101,54,52,54,50,99,99,100,57,100,50,99,102,53,49,99,50,51,97,57,57,97,53,51,100,102,52,55,53,50,97,98,57,98,51,48,57,97,51,100,55,52,0,0,0,0,0,0,0,0,50,54,100,55,100,55,57,51,57,52,101,57,98,100,102,101,56,51,51,55,50,48,102,48,56,102,99,56,97,56,100,54,102,50,51,98,56,56,101,100,99,54,54,50,100,48,101,49,52,98,55,51,97,97,52,53,99,48,53,48,100,54,55,97,98,102,52,97,54,57,51,56,56,54,49,99,98,100,48,101,97,100,99,57,51,55,97,57,54,49,48,102,55,51,97,54,56,102,100,101,48,54,98,55,50,57,101,102,51,98,56,98,97,101,57,100,98,50,99,52,48,98,55,57,49,54,102,57,97,50,102,97,100,53,49,98,97,101,50,101,98,49,100,53,53,100,55,56,53,57,49,101,52,99,53,50,57,99,100,55,50,49,101,52,52,49,49,51,102,48,52,56,57,98,55,57,102,100,50,57,53,102,50,53,101,99,50,56,57,51,98,53,102,52,102,98,0,0,0,0,57,56,99,49,98,100,54,97,56,48,55,50,57,54,102,49,49,55,55,52,55,54,100,55,97,53,98,49,54,51,51,98,50,57,55,53,48,54,49,56,54,51,100,49,57,100,53,56,102,98,99,53,57,51,50,57,100,102,50,101,100,102,100,101,0,0,0,0,0,0,0,0,101,99,54,55,97,50,97,48,51,57,98,54,49,52,57,51,55,97,52,57,54,55,53,57,57,48,57,57,101,98,56,53,54,56,51,55,51,100,56,55,102,101,56,56,52,51,53,51,52,48,50,99,102,54,97,52,49,52,51,100,98,57,53,100,52,100,56,53,57,50,51,56,56,102,50,48,53,50,101,49,97,102,52,54,51,54,53,50,52,53,101,101,99,97,53,50,55,99,52,54,49,50,101,49,54,51,54,100,98,97,56,97,48,100,102,56,56,51,53,97,100,100,100,97,101,55,57,53,55,97,99,102,100,57,54,56,98,54,54,99,48,54,52,50,48,97,98,52,49,51,56,101,97,54,100,57,101,57,53,102,52,55,50,102,49,48,49,54,50,52,55,51,97,50,49,52,51,102,53,52,99,56,50,97,52,53,49,55,55,51,56,51,56,97,102,48,57,0,0,0,99,99,57,56,56,53,54,50,48,57,53,54,102,99,57,52,56,57,101,97,100,99,98,100,101,49,100,57,99,57,102,57,57,57,57,54,102,48,97,97,50,100,100,98,56,57,52,97,57,99,57,100,49,99,97,57,57,101,56,53,49,51,54,49,0,0,0,0,0,0,0,0,56,102,97,54,53,49,97,55,54,99,98,51,99,97,97,57,55,50,98,56,48,97,101,54,51,51,55,52,57,50,97,97,99,48,57,48,52,48,50,51,57,98,49,57,102,57,56,55,57,49,101,48,54,98,52,98,49,56,53,54,55,54,99,97,50,56,100,97,57,48,49,101,49,50,52,49,57,49,48,54,54,56,99,99,98,52,49,48,51,100,97,102,97,56,48,99,49,56,102,98,51,50,57,51,56,98,52,57,97,99,98,55,54,51,52,49,49,55,48,100,99,57,55,102,49,48,52,56,49,98,99,51,56,57,101,48,102,98,55,48,53,100,49,97,55,52,101,57,48,49,54,100,54,102,97,52,48,51,98,99,53,57,55,99,55,52,57,100,56,52,53,51,100,99,99,49,97,100,51,54,55,97,57,55,97,56,55,51,49,50,57,56,48,53,56,54,98,54,0,0,50,98,57,102,100,99,51,48,56,51,54,98,49,57,53,53,100,51,50,50,55,55,100,54,98,98,102,52,52,51,55,55,102,55,52,55,102,53,102,102,102,56,51,53,98,50,52,53,98,48,54,97,54,101,98,57,100,55,57,51,98,55,54,102,0,0,0,0,0,0,0,0,49,97,49,99,57,52,53,57,100,54,100,52,49,99,52,56,50,100,100,52,48,101,101,101,100,54,52,57,53,48,99,54,102,57,56,55,57,97,98,56,50,49,50,101,50,52,51,97,48,98,50,98,101,52,49,100,56,54,98,49,51,100,99,102,98,50,56,55,55,102,54,56,54,97,52,52,50,55,56,100,101,102,51,54,51,56,54,57,48,54,55,53,54,48,57,49,52,100,101,51,98,54,52,57,98,57,54,56,50,53,99,49,51,55,101,57,48,49,57,48,54,57,53,101,56,52,99,55,50,57,48,97,55,57,97,102,56,55,51,100,48,54,56,99,99,54,100,99,99,49,101,49,99,57,97,57,51,97,54,49,101,50,101,48,48,98,102,55,48,55,56,52,51,101,55,54,100,48,97,100,97,50,48,51,50,49,50,97,101,55,97,97,55,49,48,102,56,49,52,0,55,57,52,51,102,101,99,100,99,97,57,52,52,57,51,102,48,97,99,54,99,102,99,97,57,102,56,48,57,101,49,102,101,48,57,49,50,53,53,50,99,49,99,97,97,50,100,49,98,52,49,99,54,98,98,56,48,99,98,50,54,102,56,56,0,0,0,0,0,0,0,0,152,47,138,66,145,68,55,113,207,251,192,181,165,219,181,233,91,194,86,57,241,17,241,89,164,130,63,146,213,94,28,171,152,170,7,216,1,91,131,18,190,133,49,36,195,125,12,85,116,93,190,114,254,177,222,128,167,6,220,155,116,241,155,193,193,105,155,228,134,71,190,239,198,157,193,15,204,161,12,36,111,44,233,45,170,132,116,74,220,169,176,92,218,136,249,118,82,81,62,152,109,198,49,168,200,39,3,176,199,127,89,191,243,11,224,198,71,145,167,213,81,99,202,6,103,41,41,20,133,10,183,39,56,33,27,46,252,109,44,77,19,13,56,83,84,115,10,101,187,10,106,118,46,201,194,129,133,44,114,146,161,232,191,162,75,102,26,168,112,139,75,194,163,81,108,199,25,232,146,209,36,6,153,214,133,53,14,244,112,160,106,16,22,193,164,25,8,108,55,30,76,119,72,39,181,188,176,52,179,12,28,57,74,170,216,78,79,202,156,91,243,111,46,104,238,130,143,116,111,99,165,120,20,120,200,132,8,2,199,140,250,255,190,144,235,108,80,164,247,163,249,190,242,120,113,198], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (node.contents && node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
  
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
  
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return Math.floor(Math.random()*256); };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx) return Module.ctx; // no need to recreate singleton GL context
  
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // possible GL_DEBUG entry point: ctx = wrapDebugGL(ctx);
  
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        }
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
          Module.ctx = ctx;
          if (useWebGL) GLctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = -event.wheelDelta;
            break;
          case 'wheel': 
            delta = event.deltaY;
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return Math.max(-1, Math.min(1, delta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  
  
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

   
  Module["_memset"] = _memset;


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _free() {
  }
  Module["_free"] = _free;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


  var Math_min = Math.min;
  function asmPrintInt(x, y) {
    Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  function asmPrintFloat(x, y) {
    Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
  }
  // EMSCRIPTEN_START_ASM
  var asm = (function(global, env, buffer) {
    'almost asm';
    var HEAP8 = new global.Int8Array(buffer);
    var HEAP16 = new global.Int16Array(buffer);
    var HEAP32 = new global.Int32Array(buffer);
    var HEAPU8 = new global.Uint8Array(buffer);
    var HEAPU16 = new global.Uint16Array(buffer);
    var HEAPU32 = new global.Uint32Array(buffer);
    var HEAPF32 = new global.Float32Array(buffer);
    var HEAPF64 = new global.Float64Array(buffer);
  
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

    var __THREW__ = 0;
    var threwValue = 0;
    var setjmpId = 0;
    var undef = 0;
    var nan = +env.NaN, inf = +env.Infinity;
    var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  
    var tempRet0 = 0;
    var tempRet1 = 0;
    var tempRet2 = 0;
    var tempRet3 = 0;
    var tempRet4 = 0;
    var tempRet5 = 0;
    var tempRet6 = 0;
    var tempRet7 = 0;
    var tempRet8 = 0;
    var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var _free=env._free;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _printf=env._printf;
  var _send=env._send;
  var _pwrite=env._pwrite;
  var __reallyNegative=env.__reallyNegative;
  var _fwrite=env._fwrite;
  var _malloc=env._malloc;
  var _mkport=env._mkport;
  var _fprintf=env._fprintf;
  var ___setErrNo=env.___setErrNo;
  var __formatString=env.__formatString;
  var _fileno=env._fileno;
  var _fflush=env._fflush;
  var _write=env._write;
  var tempFloat = 0.0;

  // EMSCRIPTEN_START_FUNCS
  function stackAlloc(size) {
    size = size|0;
    var ret = 0;
    ret = STACKTOP;
    STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 7)&-8;
    return ret|0;
  }
  function stackSave() {
    return STACKTOP|0;
  }
  function stackRestore(top) {
    top = top|0;
    STACKTOP = top;
  }
  function setThrew(threw, value) {
    threw = threw|0;
    value = value|0;
    if ((__THREW__|0) == 0) {
      __THREW__ = threw;
      threwValue = value;
    }
  }
  function copyTempFloat(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  }
  function copyTempDouble(ptr) {
    ptr = ptr|0;
    HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
    HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
    HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
    HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
    HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
    HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
    HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
    HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
  }
  function setTempRet0(value) {
    value = value|0;
    tempRet0 = value;
  }
  function getTempRet0() {
    return tempRet0|0;
  }
  
function _sha256($message,$length,$digest) {
 $message = $message|0;
 $length = $length|0;
 $digest = $digest|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $9 = 0, $H = 0, $block = 0, $block1 = 0, $i = 0, $i2 = 0, $i3 = 0, $i4 = 0, $originalLength = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 208|0;
 $H = sp + 152|0;
 $block = sp + 80|0;
 $block1 = sp + 8|0;
 $0 = $message;
 $1 = $length;
 $2 = $digest;
 ;HEAP32[$H+0>>2]=HEAP32[8+0>>2]|0;HEAP32[$H+4>>2]=HEAP32[8+4>>2]|0;HEAP32[$H+8>>2]=HEAP32[8+8>>2]|0;HEAP32[$H+12>>2]=HEAP32[8+12>>2]|0;HEAP32[$H+16>>2]=HEAP32[8+16>>2]|0;HEAP32[$H+20>>2]=HEAP32[8+20>>2]|0;HEAP32[$H+24>>2]=HEAP32[8+24>>2]|0;HEAP32[$H+28>>2]=HEAP32[8+28>>2]|0;
 $3 = $1;
 $originalLength = $3;
 while(1) {
  $4 = $1;
  $5 = ($4>>>0)>=(64);
  if (!($5)) {
   break;
  }
  dest=$block+0|0; stop=dest+64|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
  $i = 0;
  while(1) {
   $6 = $i;
   $7 = ($6|0)<(64);
   if (!($7)) {
    break;
   }
   $8 = $i;
   $9 = $0;
   $10 = (($9) + ($8)|0);
   $11 = HEAP8[$10>>0]|0;
   $12 = $11&255;
   $13 = $i;
   $14 = $13 & 3;
   $15 = $14<<3;
   $16 = (24 - ($15))|0;
   $17 = $12 << $16;
   $18 = $i;
   $19 = $18 >> 2;
   $20 = (($block) + ($19<<2)|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = $21 | $17;
   HEAP32[$20>>2] = $22;
   $23 = $i;
   $24 = (($23) + 1)|0;
   $i = $24;
  }
  _update($H,$block);
  $25 = $0;
  $26 = (($25) + 64|0);
  $0 = $26;
  $27 = $1;
  $28 = (($27) - 64)|0;
  $1 = $28;
 }
 dest=$block1+0|0; stop=dest+64|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 $i2 = 0;
 while(1) {
  $29 = $i2;
  $30 = $1;
  $31 = ($29>>>0)<($30>>>0);
  if (!($31)) {
   break;
  }
  $32 = $i2;
  $33 = $0;
  $34 = (($33) + ($32)|0);
  $35 = HEAP8[$34>>0]|0;
  $36 = $35&255;
  $37 = $i2;
  $38 = $37 & 3;
  $39 = $38<<3;
  $40 = (24 - ($39))|0;
  $41 = $36 << $40;
  $42 = $i2;
  $43 = $42 >> 2;
  $44 = (($block1) + ($43<<2)|0);
  $45 = HEAP32[$44>>2]|0;
  $46 = $45 | $41;
  HEAP32[$44>>2] = $46;
  $47 = $i2;
  $48 = (($47) + 1)|0;
  $i2 = $48;
 }
 $49 = $1;
 $50 = $49 & 3;
 $51 = $50<<3;
 $52 = (31 - ($51))|0;
 $53 = 1 << $52;
 $54 = $1;
 $55 = $54 >>> 2;
 $56 = (($block1) + ($55<<2)|0);
 $57 = HEAP32[$56>>2]|0;
 $58 = $57 | $53;
 HEAP32[$56>>2] = $58;
 $59 = $1;
 $60 = ($59>>>0)>(55);
 if ($60) {
  _update($H,$block1);
  $i3 = 0;
  while(1) {
   $61 = $i3;
   $62 = ($61|0)<(16);
   if (!($62)) {
    break;
   }
   $63 = $i3;
   $64 = (($block1) + ($63<<2)|0);
   HEAP32[$64>>2] = 0;
   $65 = $i3;
   $66 = (($65) + 1)|0;
   $i3 = $66;
  }
 }
 $67 = $originalLength;
 $68 = $67 << 3;
 $69 = (($block1) + 60|0);
 $70 = HEAP32[$69>>2]|0;
 $71 = $70 | $68;
 HEAP32[$69>>2] = $71;
 _update($H,$block1);
 $i4 = 0;
 while(1) {
  $72 = $i4;
  $73 = ($72|0)<(8);
  if (!($73)) {
   break;
  }
  $74 = $i4;
  $75 = (($H) + ($74<<2)|0);
  $76 = HEAP32[$75>>2]|0;
  $77 = $2;
  $78 = $i4;
  $79 = $78<<3;
  $80 = (($77) + ($79)|0);
  _encodeHex($76,$80);
  $81 = $i4;
  $82 = (($81) + 1)|0;
  $i4 = $82;
 }
 STACKTOP = sp;return;
}
function _update($H,$M) {
 $H = $H|0;
 $M = $M|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0;
 var $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
 var $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $Ch = 0, $Maj = 0, $T1 = 0, $T2 = 0, $W = 0, $a = 0, $b = 0, $c = 0, $d = 0, $e = 0, $f = 0, $g = 0;
 var $gamma0 = 0, $gamma1 = 0, $h = 0, $i = 0, $sigma0 = 0, $sigma1 = 0, $x0 = 0, $x1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 352|0;
 $W = sp + 48|0;
 $0 = $H;
 $1 = $M;
 $2 = $0;
 $3 = HEAP32[$2>>2]|0;
 $a = $3;
 $4 = $0;
 $5 = (($4) + 4|0);
 $6 = HEAP32[$5>>2]|0;
 $b = $6;
 $7 = $0;
 $8 = (($7) + 8|0);
 $9 = HEAP32[$8>>2]|0;
 $c = $9;
 $10 = $0;
 $11 = (($10) + 12|0);
 $12 = HEAP32[$11>>2]|0;
 $d = $12;
 $13 = $0;
 $14 = (($13) + 16|0);
 $15 = HEAP32[$14>>2]|0;
 $e = $15;
 $16 = $0;
 $17 = (($16) + 20|0);
 $18 = HEAP32[$17>>2]|0;
 $f = $18;
 $19 = $0;
 $20 = (($19) + 24|0);
 $21 = HEAP32[$20>>2]|0;
 $g = $21;
 $22 = $0;
 $23 = (($22) + 28|0);
 $24 = HEAP32[$23>>2]|0;
 $h = $24;
 $i = 0;
 while(1) {
  $25 = $i;
  $26 = ($25|0)<(64);
  if (!($26)) {
   break;
  }
  $27 = $e;
  $28 = $f;
  $29 = $27 & $28;
  $30 = $e;
  $31 = $30 ^ -1;
  $32 = $g;
  $33 = $31 & $32;
  $34 = $29 ^ $33;
  $Ch = $34;
  $35 = $a;
  $36 = $b;
  $37 = $35 & $36;
  $38 = $a;
  $39 = $c;
  $40 = $38 & $39;
  $41 = $37 ^ $40;
  $42 = $b;
  $43 = $c;
  $44 = $42 & $43;
  $45 = $41 ^ $44;
  $Maj = $45;
  $46 = $a;
  $47 = $46 << 30;
  $48 = $a;
  $49 = $48 >>> 2;
  $50 = $47 | $49;
  $51 = $a;
  $52 = $51 << 19;
  $53 = $a;
  $54 = $53 >>> 13;
  $55 = $52 | $54;
  $56 = $50 ^ $55;
  $57 = $a;
  $58 = $57 << 10;
  $59 = $a;
  $60 = $59 >>> 22;
  $61 = $58 | $60;
  $62 = $56 ^ $61;
  $sigma0 = $62;
  $63 = $e;
  $64 = $63 << 26;
  $65 = $e;
  $66 = $65 >>> 6;
  $67 = $64 | $66;
  $68 = $e;
  $69 = $68 << 21;
  $70 = $e;
  $71 = $70 >>> 11;
  $72 = $69 | $71;
  $73 = $67 ^ $72;
  $74 = $e;
  $75 = $74 << 7;
  $76 = $e;
  $77 = $76 >>> 25;
  $78 = $75 | $77;
  $79 = $73 ^ $78;
  $sigma1 = $79;
  $80 = $i;
  $81 = ($80|0)<(16);
  if ($81) {
   $82 = $i;
   $83 = $1;
   $84 = (($83) + ($82<<2)|0);
   $85 = HEAP32[$84>>2]|0;
   $86 = $i;
   $87 = (($W) + ($86<<2)|0);
   HEAP32[$87>>2] = $85;
  } else {
   $88 = $i;
   $89 = (($88) - 15)|0;
   $90 = (($W) + ($89<<2)|0);
   $91 = HEAP32[$90>>2]|0;
   $x0 = $91;
   $92 = $i;
   $93 = (($92) - 2)|0;
   $94 = (($W) + ($93<<2)|0);
   $95 = HEAP32[$94>>2]|0;
   $x1 = $95;
   $96 = $x0;
   $97 = $96 << 25;
   $98 = $x0;
   $99 = $98 >>> 7;
   $100 = $97 | $99;
   $101 = $x0;
   $102 = $101 << 14;
   $103 = $x0;
   $104 = $103 >>> 18;
   $105 = $102 | $104;
   $106 = $100 ^ $105;
   $107 = $x0;
   $108 = $107 >>> 3;
   $109 = $106 ^ $108;
   $gamma0 = $109;
   $110 = $x1;
   $111 = $110 << 15;
   $112 = $x1;
   $113 = $112 >>> 17;
   $114 = $111 | $113;
   $115 = $x1;
   $116 = $115 << 13;
   $117 = $x1;
   $118 = $117 >>> 19;
   $119 = $116 | $118;
   $120 = $114 ^ $119;
   $121 = $x1;
   $122 = $121 >>> 10;
   $123 = $120 ^ $122;
   $gamma1 = $123;
   $124 = $gamma1;
   $125 = $i;
   $126 = (($125) - 7)|0;
   $127 = (($W) + ($126<<2)|0);
   $128 = HEAP32[$127>>2]|0;
   $129 = (($124) + ($128))|0;
   $130 = $gamma0;
   $131 = (($129) + ($130))|0;
   $132 = $i;
   $133 = (($132) - 16)|0;
   $134 = (($W) + ($133<<2)|0);
   $135 = HEAP32[$134>>2]|0;
   $136 = (($131) + ($135))|0;
   $137 = $i;
   $138 = (($W) + ($137<<2)|0);
   HEAP32[$138>>2] = $136;
  }
  $139 = $h;
  $140 = $sigma1;
  $141 = (($139) + ($140))|0;
  $142 = $Ch;
  $143 = (($141) + ($142))|0;
  $144 = $i;
  $145 = (35264 + ($144<<2)|0);
  $146 = HEAP32[$145>>2]|0;
  $147 = (($143) + ($146))|0;
  $148 = $i;
  $149 = (($W) + ($148<<2)|0);
  $150 = HEAP32[$149>>2]|0;
  $151 = (($147) + ($150))|0;
  $T1 = $151;
  $152 = $sigma0;
  $153 = $Maj;
  $154 = (($152) + ($153))|0;
  $T2 = $154;
  $155 = $g;
  $h = $155;
  $156 = $f;
  $g = $156;
  $157 = $e;
  $f = $157;
  $158 = $d;
  $159 = $T1;
  $160 = (($158) + ($159))|0;
  $e = $160;
  $161 = $c;
  $d = $161;
  $162 = $b;
  $c = $162;
  $163 = $a;
  $b = $163;
  $164 = $T1;
  $165 = $T2;
  $166 = (($164) + ($165))|0;
  $a = $166;
  $167 = $i;
  $168 = (($167) + 1)|0;
  $i = $168;
 }
 $169 = $a;
 $170 = $0;
 $171 = HEAP32[$170>>2]|0;
 $172 = (($171) + ($169))|0;
 HEAP32[$170>>2] = $172;
 $173 = $b;
 $174 = $0;
 $175 = (($174) + 4|0);
 $176 = HEAP32[$175>>2]|0;
 $177 = (($176) + ($173))|0;
 HEAP32[$175>>2] = $177;
 $178 = $c;
 $179 = $0;
 $180 = (($179) + 8|0);
 $181 = HEAP32[$180>>2]|0;
 $182 = (($181) + ($178))|0;
 HEAP32[$180>>2] = $182;
 $183 = $d;
 $184 = $0;
 $185 = (($184) + 12|0);
 $186 = HEAP32[$185>>2]|0;
 $187 = (($186) + ($183))|0;
 HEAP32[$185>>2] = $187;
 $188 = $e;
 $189 = $0;
 $190 = (($189) + 16|0);
 $191 = HEAP32[$190>>2]|0;
 $192 = (($191) + ($188))|0;
 HEAP32[$190>>2] = $192;
 $193 = $f;
 $194 = $0;
 $195 = (($194) + 20|0);
 $196 = HEAP32[$195>>2]|0;
 $197 = (($196) + ($193))|0;
 HEAP32[$195>>2] = $197;
 $198 = $g;
 $199 = $0;
 $200 = (($199) + 24|0);
 $201 = HEAP32[$200>>2]|0;
 $202 = (($201) + ($198))|0;
 HEAP32[$200>>2] = $202;
 $203 = $h;
 $204 = $0;
 $205 = (($204) + 28|0);
 $206 = HEAP32[$205>>2]|0;
 $207 = (($206) + ($203))|0;
 HEAP32[$205>>2] = $207;
 STACKTOP = sp;return;
}
function _encodeHex($data,$out) {
 $data = $data|0;
 $out = $out|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b = 0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $data;
 $1 = $out;
 $j = 0;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = ($2|0)<(4);
  if (!($3)) {
   break;
  }
  $4 = $0;
  $5 = $i;
  $6 = $5<<3;
  $7 = (24 - ($6))|0;
  $8 = $4 >>> $7;
  $9 = $8 & 255;
  $10 = $9&255;
  $b = $10;
  $11 = $b;
  $12 = $11&255;
  $13 = $12 >> 4;
  $14 = ($13|0)<(10);
  if ($14) {
   $15 = $b;
   $16 = $15&255;
   $17 = $16 >> 4;
   $18 = (48 + ($17))|0;
   $25 = $18;
  } else {
   $19 = $b;
   $20 = $19&255;
   $21 = $20 >> 4;
   $22 = (($21) - 10)|0;
   $23 = (97 + ($22))|0;
   $25 = $23;
  }
  $24 = $25&255;
  $26 = $j;
  $27 = (($26) + 1)|0;
  $j = $27;
  $28 = $1;
  $29 = (($28) + ($26)|0);
  HEAP8[$29>>0] = $24;
  $30 = $b;
  $31 = $30&255;
  $32 = $31 & 15;
  $33 = ($32|0)<(10);
  if ($33) {
   $34 = $b;
   $35 = $34&255;
   $36 = $35 & 15;
   $37 = (48 + ($36))|0;
   $44 = $37;
  } else {
   $38 = $b;
   $39 = $38&255;
   $40 = $39 & 15;
   $41 = (($40) - 10)|0;
   $42 = (97 + ($41))|0;
   $44 = $42;
  }
  $43 = $44&255;
  $45 = $j;
  $46 = (($45) + 1)|0;
  $j = $46;
  $47 = $1;
  $48 = (($47) + ($45)|0);
  HEAP8[$48>>0] = $43;
  $49 = $i;
  $50 = (($49) + 1)|0;
  $i = $50;
 }
 $51 = $j;
 $52 = $1;
 $53 = (($52) + ($51)|0);
 HEAP8[$53>>0] = 0;
 STACKTOP = sp;return;
}
function _checkHash($message,$length,$digest) {
 $message = $message|0;
 $length = $length|0;
 $digest = $digest|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, $temp = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $vararg_buffer = sp;
 $temp = sp + 20|0;
 $0 = $message;
 $1 = $length;
 $2 = $digest;
 $3 = $0;
 $4 = $1;
 _sha256($3,$4,$temp);
 $i = 0;
 while(1) {
  $5 = $i;
  $6 = ($5|0)<(64);
  if (!($6)) {
   label = 7;
   break;
  }
  $7 = $i;
  $8 = $2;
  $9 = (($8) + ($7)|0);
  $10 = HEAP8[$9>>0]|0;
  $11 = $10 << 24 >> 24;
  $12 = $i;
  $13 = (($temp) + ($12)|0);
  $14 = HEAP8[$13>>0]|0;
  $15 = $14 << 24 >> 24;
  $16 = ($11|0)!=($15|0);
  if ($16) {
   break;
  }
  $18 = $i;
  $19 = (($18) + 1)|0;
  $i = $19;
 }
 if ((label|0) == 7) {
  STACKTOP = sp;return;
 }
 $17 = $1;
 HEAP32[$vararg_buffer>>2] = $17;
 (_printf((40|0),($vararg_buffer|0))|0);
 STACKTOP = sp;return;
}
function _main() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = 0;
 _checkHash(64,0,72);
 _checkHash(144,1,152);
 _checkHash(224,2,232);
 _checkHash(304,3,312);
 _checkHash(384,4,392);
 _checkHash(464,5,472);
 _checkHash(544,6,552);
 _checkHash(624,7,632);
 _checkHash(704,8,720);
 _checkHash(792,9,808);
 _checkHash(880,10,896);
 _checkHash(968,11,984);
 _checkHash(1056,12,1072);
 _checkHash(1144,13,1160);
 _checkHash(1232,14,1248);
 _checkHash(1320,15,1336);
 _checkHash(1408,16,1432);
 _checkHash(1504,17,1528);
 _checkHash(1600,18,1624);
 _checkHash(1696,19,1720);
 _checkHash(1792,20,1816);
 _checkHash(1888,21,1912);
 _checkHash(1984,22,2008);
 _checkHash(2080,23,2104);
 _checkHash(2176,24,2208);
 _checkHash(2280,25,2312);
 _checkHash(2384,26,2416);
 _checkHash(2488,27,2520);
 _checkHash(2592,28,2624);
 _checkHash(2696,29,2728);
 _checkHash(2800,30,2832);
 _checkHash(2904,31,2936);
 _checkHash(3008,32,3048);
 _checkHash(3120,33,3160);
 _checkHash(3232,34,3272);
 _checkHash(3344,35,3384);
 _checkHash(3456,36,3496);
 _checkHash(3568,37,3608);
 _checkHash(3680,38,3720);
 _checkHash(3792,39,3832);
 _checkHash(3904,40,3952);
 _checkHash(4024,41,4072);
 _checkHash(4144,42,4192);
 _checkHash(4264,43,4312);
 _checkHash(4384,44,4432);
 _checkHash(4504,45,4552);
 _checkHash(4624,46,4672);
 _checkHash(4744,47,4792);
 _checkHash(4864,48,4920);
 _checkHash(4992,49,5048);
 _checkHash(5120,50,5176);
 _checkHash(5248,51,5304);
 _checkHash(5376,52,5432);
 _checkHash(5504,53,5560);
 _checkHash(5632,54,5688);
 _checkHash(5760,55,5816);
 _checkHash(5888,56,5952);
 _checkHash(6024,57,6088);
 _checkHash(6160,58,6224);
 _checkHash(6296,59,6360);
 _checkHash(6432,60,6496);
 _checkHash(6568,61,6632);
 _checkHash(6704,62,6768);
 _checkHash(6840,63,6904);
 _checkHash(6976,64,7048);
 _checkHash(7120,65,7192);
 _checkHash(7264,66,7336);
 _checkHash(7408,67,7480);
 _checkHash(7552,68,7624);
 _checkHash(7696,69,7768);
 _checkHash(7840,70,7912);
 _checkHash(7984,71,8056);
 _checkHash(8128,72,8208);
 _checkHash(8280,73,8360);
 _checkHash(8432,74,8512);
 _checkHash(8584,75,8664);
 _checkHash(8736,76,8816);
 _checkHash(8888,77,8968);
 _checkHash(9040,78,9120);
 _checkHash(9192,79,9272);
 _checkHash(9344,80,9432);
 _checkHash(9504,81,9592);
 _checkHash(9664,82,9752);
 _checkHash(9824,83,9912);
 _checkHash(9984,84,10072);
 _checkHash(10144,85,10232);
 _checkHash(10304,86,10392);
 _checkHash(10464,87,10552);
 _checkHash(10624,88,10720);
 _checkHash(10792,89,10888);
 _checkHash(10960,90,11056);
 _checkHash(11128,91,11224);
 _checkHash(11296,92,11392);
 _checkHash(11464,93,11560);
 _checkHash(11632,94,11728);
 _checkHash(11800,95,11896);
 _checkHash(11968,96,12072);
 _checkHash(12144,97,12248);
 _checkHash(12320,98,12424);
 _checkHash(12496,99,12600);
 _checkHash(12672,100,12776);
 _checkHash(12848,101,12952);
 _checkHash(13024,102,13128);
 _checkHash(13200,103,13304);
 _checkHash(13376,104,13488);
 _checkHash(13560,105,13672);
 _checkHash(13744,106,13856);
 _checkHash(13928,107,14040);
 _checkHash(14112,108,14224);
 _checkHash(14296,109,14408);
 _checkHash(14480,110,14592);
 _checkHash(14664,111,14776);
 _checkHash(14848,112,14968);
 _checkHash(15040,113,15160);
 _checkHash(15232,114,15352);
 _checkHash(15424,115,15544);
 _checkHash(15616,116,15736);
 _checkHash(15808,117,15928);
 _checkHash(16000,118,16120);
 _checkHash(16192,119,16312);
 _checkHash(16384,120,16512);
 _checkHash(16584,121,16712);
 _checkHash(16784,122,16912);
 _checkHash(16984,123,17112);
 _checkHash(17184,124,17312);
 _checkHash(17384,125,17512);
 _checkHash(17584,126,17712);
 _checkHash(17784,127,17912);
 _checkHash(17984,128,18120);
 _checkHash(18192,129,18328);
 _checkHash(18400,130,18536);
 _checkHash(18608,131,18744);
 _checkHash(18816,132,18952);
 _checkHash(19024,133,19160);
 _checkHash(19232,134,19368);
 _checkHash(19440,135,19576);
 _checkHash(19648,136,19792);
 _checkHash(19864,137,20008);
 _checkHash(20080,138,20224);
 _checkHash(20296,139,20440);
 _checkHash(20512,140,20656);
 _checkHash(20728,141,20872);
 _checkHash(20944,142,21088);
 _checkHash(21160,143,21304);
 _checkHash(21376,144,21528);
 _checkHash(21600,145,21752);
 _checkHash(21824,146,21976);
 _checkHash(22048,147,22200);
 _checkHash(22272,148,22424);
 _checkHash(22496,149,22648);
 _checkHash(22720,150,22872);
 _checkHash(22944,151,23096);
 _checkHash(23168,152,23328);
 _checkHash(23400,153,23560);
 _checkHash(23632,154,23792);
 _checkHash(23864,155,24024);
 _checkHash(24096,156,24256);
 _checkHash(24328,157,24488);
 _checkHash(24560,158,24720);
 _checkHash(24792,159,24952);
 _checkHash(25024,160,25192);
 _checkHash(25264,161,25432);
 _checkHash(25504,162,25672);
 _checkHash(25744,163,25912);
 _checkHash(25984,164,26152);
 _checkHash(26224,165,26392);
 _checkHash(26464,166,26632);
 _checkHash(26704,167,26872);
 _checkHash(26944,168,27120);
 _checkHash(27192,169,27368);
 _checkHash(27440,170,27616);
 _checkHash(27688,171,27864);
 _checkHash(27936,172,28112);
 _checkHash(28184,173,28360);
 _checkHash(28432,174,28608);
 _checkHash(28680,175,28856);
 _checkHash(28928,176,29112);
 _checkHash(29184,177,29368);
 _checkHash(29440,178,29624);
 _checkHash(29696,179,29880);
 _checkHash(29952,180,30136);
 _checkHash(30208,181,30392);
 _checkHash(30464,182,30648);
 _checkHash(30720,183,30904);
 _checkHash(30976,184,31168);
 _checkHash(31240,185,31432);
 _checkHash(31504,186,31696);
 _checkHash(31768,187,31960);
 _checkHash(32032,188,32224);
 _checkHash(32296,189,32488);
 _checkHash(32560,190,32752);
 _checkHash(32824,191,33016);
 _checkHash(33088,192,33288);
 _checkHash(33360,193,33560);
 _checkHash(33632,194,33832);
 _checkHash(33904,195,34104);
 _checkHash(34176,196,34376);
 _checkHash(34448,197,34648);
 _checkHash(34720,198,34920);
 _checkHash(34992,199,35192);
 STACKTOP = sp;return 0;
}
function runPostSets() {
 
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _memcpy(dest, src, num) {

    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}

// EMSCRIPTEN_END_FUNCS

    

  // EMSCRIPTEN_END_FUNCS
  

    return { _sha256: _sha256, _strlen: _strlen, _memcpy: _memcpy, _main: _main, _memset: _memset, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0 };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_free": _free, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_printf": _printf, "_send": _send, "_pwrite": _pwrite, "__reallyNegative": __reallyNegative, "_fwrite": _fwrite, "_malloc": _malloc, "_mkport": _mkport, "_fprintf": _fprintf, "___setErrNo": ___setErrNo, "__formatString": __formatString, "_fileno": _fileno, "_fflush": _fflush, "_write": _write, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
  var _sha256 = Module["_sha256"] = asm["_sha256"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
  
  Runtime.stackAlloc = asm['stackAlloc'];
  Runtime.stackSave = asm['stackSave'];
  Runtime.stackRestore = asm['stackRestore'];
  Runtime.setTempRet0 = asm['setTempRet0'];
  Runtime.getTempRet0 = asm['getTempRet0'];
  

// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      for (var i = 0; i < data.length; i++) {
        assert(HEAPU8[STATIC_BASE + i] === 0, "area for memory initializer should not have been touched before it's loaded");
      }
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram'] || '/bin/this.program'), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



//# sourceMappingURL=sha256.js.map