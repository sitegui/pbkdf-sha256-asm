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

  Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }
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
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
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
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
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
    argTypes = argTypes || [];
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
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
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
  var final = func;
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
    final = parse();
  } catch(e) {
    final += '?';
  }
  if (final.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return final;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module['stackTrace'] = stackTrace;

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
var runtimeExited = false;

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
  runtimeExited = true;
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

STATICTOP = STATIC_BASE + Runtime.alignMemory(30963);
  /* global initializers */ __ATINIT__.push();
  

/* memory initializer */ allocate([88,38,0,0,136,38,0,0,144,38,0,0,184,38,0,0,32,39,0,0,72,39,0,0,112,39,0,0,216,39,0,0,48,40,0,0,72,40,0,0,80,40,0,0,112,40,0,0,152,40,0,0,160,40,0,0,192,40,0,0,8,41,0,0,80,41,0,0,184,41,0,0,208,41,0,0,240,41,0,0,80,42,0,0,120,42,0,0,224,42,0,0,16,43,0,0,64,43,0,0,160,43,0,0,232,43,0,0,32,44,0,0,96,44,0,0,128,44,0,0,136,44,0,0,160,44,0,0,200,44,0,0,24,45,0,0,112,45,0,0,200,45,0,0,216,45,0,0,48,46,0,0,64,46,0,0,120,46,0,0,216,46,0,0,24,47,0,0,80,47,0,0,128,47,0,0,216,47,0,0,40,48,0,0,88,48,0,0,136,48,0,0,224,48,0,0,0,49,0,0,96,49,0,0,152,49,0,0,208,49,0,0,24,50,0,0,96,50,0,0,120,50,0,0,216,50,0,0,224,50,0,0,8,51,0,0,104,51,0,0,200,51,0,0,224,51,0,0,248,51,0,0,16,52,0,0,80,52,0,0,168,52,0,0,8,53,0,0,0,0,0,0,160,23,0,0,216,23,0,0,232,23,0,0,240,23,0,0,24,24,0,0,80,24,0,0,96,24,0,0,192,24,0,0,248,24,0,0,24,25,0,0,120,25,0,0,152,25,0,0,224,25,0,0,32,26,0,0,104,26,0,0,144,26,0,0,184,26,0,0,248,26,0,0,88,27,0,0,112,27,0,0,120,27,0,0,200,27,0,0,40,28,0,0,104,28,0,0,168,28,0,0,248,28,0,0,16,29,0,0,64,29,0,0,112,29,0,0,208,29,0,0,48,30,0,0,128,30,0,0,144,30,0,0,176,30,0,0,0,31,0,0,32,31,0,0,64,31,0,0,152,31,0,0,208,31,0,0,48,32,0,0,120,32,0,0,152,32,0,0,160,32,0,0,176,32,0,0,8,33,0,0,56,33,0,0,136,33,0,0,232,33,0,0,48,34,0,0,104,34,0,0,136,34,0,0,160,34,0,0,240,34,0,0,32,35,0,0,88,35,0,0,136,35,0,0,224,35,0,0,0,36,0,0,80,36,0,0,152,36,0,0,200,36,0,0,248,36,0,0,72,37,0,0,160,37,0,0,200,37,0,0,0,38,0,0,32,38,0,0,0,0,0,0,200,4,0,0,16,5,0,0,88,5,0,0,160,5,0,0,232,5,0,0,48,6,0,0,120,6,0,0,192,6,0,0,8,7,0,0,80,7,0,0,152,7,0,0,224,7,0,0,40,8,0,0,112,8,0,0,184,8,0,0,0,9,0,0,72,9,0,0,144,9,0,0,216,9,0,0,32,10,0,0,104,10,0,0,176,10,0,0,248,10,0,0,64,11,0,0,136,11,0,0,208,11,0,0,24,12,0,0,96,12,0,0,168,12,0,0,240,12,0,0,56,13,0,0,128,13,0,0,200,13,0,0,16,14,0,0,88,14,0,0,160,14,0,0,232,14,0,0,48,15,0,0,120,15,0,0,192,15,0,0,8,16,0,0,80,16,0,0,152,16,0,0,224,16,0,0,40,17,0,0,112,17,0,0,184,17,0,0,0,18,0,0,72,18,0,0,144,18,0,0,216,18,0,0,32,19,0,0,104,19,0,0,176,19,0,0,248,19,0,0,64,20,0,0,136,20,0,0,208,20,0,0,24,21,0,0,96,21,0,0,168,21,0,0,240,21,0,0,56,22,0,0,128,22,0,0,200,22,0,0,16,23,0,0,88,23,0,0,0,0,0,0,75,101,121,0,0,0,0,0,77,101,115,115,97,103,101,0,53,48,55,50,56,53,53,52,56,49,51,55,98,53,52,50,52,101,98,53,53,55,50,99,52,54,52,57,54,54,51,49,98,55,97,100,101,56,101,56,56,97,99,51,50,51,99,53,50,57,102,97,49,52,50,100,101,102,50,54,102,102,97,49,0,0,0,0,0,0,0,0,115,116,114,99,109,112,40,104,109,97,99,95,115,105,109,112,108,101,40,34,75,101,121,34,44,32,34,77,101,115,115,97,103,101,34,41,44,32,34,53,48,55,50,56,53,53,52,56,49,51,55,98,53,52,50,52,101,98,53,53,55,50,99,52,54,52,57,54,54,51,49,98,55,97,100,101,56,101,56,56,97,99,51,50,51,99,53,50,57,102,97,49,52,50,100,101,102,50,54,102,102,97,49,34,41,32,61,61,32,48,0,0,99,47,116,101,115,116,47,104,109,97,99,46,99,0,0,0,116,101,115,116,95,104,109,97,99,0,0,0,0,0,0,0,52,98,54,53,55,57,0,0,52,68,54,53,55,51,55,51,54,49,54,55,54,53,0,0,115,116,114,99,109,112,40,104,109,97,99,95,115,105,109,112,108,101,95,104,101,120,40,34,52,98,54,53,55,57,34,44,32,34,52,68,54,53,55,51,55,51,54,49,54,55,54,53,34,41,44,32,34,53,48,55,50,56,53,53,52,56,49,51,55,98,53,52,50,52,101,98,53,53,55,50,99,52,54,52,57,54,54,51,49,98,55,97,100,101,56,101,56,56,97,99,51,50,51,99,53,50,57,102,97,49,52,50,100,101,102,50,54,102,102,97,49,34,41,32,61,61,32,48,0,0,0,0,104,109,97,99,58,32,79,75,33,0,0,0,0,0,0,0,97,99,102,49,49,97,52,51,50,55,53,53,102,101,54,101,49,49,102,51,53,48,102,52,50,49,50,52,48,101,48,101,54,102,57,54,99,99,51,54,51,98,101,56,51,56,53,56,50,100,99,101,49,101,55,49,57,48,54,50,99,51,56,98,0,0,0,0,0,0,0,0,56,53,52,52,53,53,48,51,54,50,102,48,101,100,97,48,51,57,52,56,51,54,49,56,97,49,56,98,52,51,99,48,56,98,54,57,56,55,49,50,55,98,48,50,99,101,51,56,97,57,98,55,55,48,50,97,51,97,54,97,52,54,99,48,0,0,0,0,0,0,0,0,97,52,54,50,49,55,48,48,102,97,98,57,100,100,56,54,54,53,98,55,56,52,101,57,98,49,54,55,97,100,52,56,49,100,57,55,49,56,52,97,50,50,55,54,51,48,101,53,54,55,101,50,98,48,49,51,98,51,97,49,53,55,98,99,0,0,0,0,0,0,0,0,101,97,102,54,57,99,102,50,50,57,97,53,97,51,55,100,48,48,50,53,98,54,56,99,100,53,55,98,101,49,54,100,52,57,54,100,102,52,52,53,102,57,97,100,52,54,100,57,56,101,98,97,52,101,49,52,102,99,54,97,98,55,52,98,0,0,0,0,0,0,0,0,102,100,56,100,98,51,101,102,53,101,52,99,55,50,101,101,102,48,100,98,51,57,101,55,51,49,56,51,98,48,56,55,97,52,48,99,57,57,51,51,52,97,100,49,101,97,97,55,53,100,98,51,49,48,54,100,51,48,98,50,99,55,49,57,0,0,0,0,0,0,0,0,52,56,50,50,98,56,102,50,55,97,55,101,48,100,53,100,55,49,97,53,49,54,56,55,102,51,57,57,55,52,97,57,97,55,99,57,55,98,51,49,48,52,98,100,52,102,99,99,99,55,51,52,99,100,50,100,53,55,55,99,54,54,102,48,0,0,0,0,0,0,0,0,50,56,97,48,55,97,54,101,53,97,50,102,100,55,53,51,99,100,51,49,48,99,51,100,51,49,56,51,51,97,54,56,97,50,50,48,99,55,52,56,49,102,57,101,55,50,57,99,54,98,49,51,99,100,53,54,53,57,56,54,53,101,50,102,0,0,0,0,0,0,0,0,101,97,102,50,53,53,48,49,100,50,102,52,48,101,48,100,98,48,49,52,56,97,101,57,54,98,102,97,102,56,56,49,49,49,56,54,98,99,97,54,48,49,56,56,57,56,48,51,54,54,56,98,51,102,48,98,56,55,99,97,54,57,50,50,0,0,0,0,0,0,0,0,52,57,48,97,49,102,52,100,51,99,54,49,55,55,57,97,101,97,100,56,55,102,57,55,56,54,48,55,55,50,51,50,102,55,99,102,101,99,54,48,53,57,102,51,98,51,48,52,48,52,56,52,49,102,53,54,56,102,51,56,57,100,97,97,0,0,0,0,0,0,0,0,102,51,50,97,48,55,52,54,101,100,101,56,52,102,56,55,54,56,49,48,48,100,52,101,99,97,48,50,55,52,99,50,54,57,102,55,53,53,51,55,101,50,51,51,56,56,48,102,55,102,52,54,55,101,50,101,102,98,49,56,53,55,98,49,0,0,0,0,0,0,0,0,57,51,52,57,97,53,97,54,102,98,101,101,97,57,99,49,57,56,48,52,55,101,97,97,55,99,53,101,51,50,54,101,48,53,55,53,52,54,102,50,54,102,52,49,101,50,98,54,53,53,49,55,54,56,99,100,55,100,50,97,49,57,101,53,0,0,0,0,0,0,0,0,100,54,102,56,55,98,50,55,102,56,54,100,50,51,56,57,57,56,100,57,54,49,102,100,100,57,49,52,49,53,98,54,48,56,52,48,52,97,48,54,56,102,98,98,101,101,51,55,50,100,102,50,99,99,57,100,55,53,48,98,51,48,48,56,0,0,0,0,0,0,0,0,57,98,56,102,101,57,98,100,50,51,99,54,102,51,99,97,101,97,102,48,56,101,55,50,98,102,102,56,100,53,98,56,57,100,101,101,52,100,98,51,51,48,57,98,48,51,56,98,97,57,54,49,101,51,56,102,52,99,51,51,98,55,55,97,0,0,0,0,0,0,0,0,48,51,100,50,97,54,53,55,57,97,102,53,100,101,48,101,99,53,53,53,53,49,56,57,49,97,48,100,51,102,98,56,98,101,53,53,99,51,53,48,55,101,97,52,53,100,98,49,100,101,56,98,56,51,54,52,97,101,102,57,56,102,57,49,0,0,0,0,0,0,0,0,50,51,102,102,100,57,102,102,48,53,101,49,53,102,53,52,102,98,51,102,49,48,48,52,99,99,56,49,98,102,98,100,98,98,98,51,98,51,56,57,52,48,56,51,51,53,50,48,101,51,100,101,49,56,53,97,48,56,100,52,100,54,97,55,0,0,0,0,0,0,0,0,101,53,102,99,52,49,52,54,48,55,52,57,51,101,99,50,102,55,99,101,97,99,56,98,97,52,49,57,57,48,50,56,51,101,55,54,99,99,55,55,50,48,52,100,98,57,98,49,49,99,98,56,99,49,54,57,54,49,51,51,100,48,50,99,0,0,0,0,0,0,0,0,99,52,99,98,54,55,99,102,49,52,49,48,52,98,50,50,55,49,54,48,48,53,99,57,99,99,49,53,53,49,50,49,54,51,98,55,55,48,50,99,101,54,51,101,98,101,55,101,97,53,97,49,99,102,51,48,50,55,97,100,56,50,48,51,0,0,0,0,0,0,0,0,55,97,98,49,48,53,99,99,54,101,48,100,97,48,97,97,56,53,49,102,52,54,98,100,102,55,57,99,48,52,49,98,100,100,54,99,55,99,54,53,49,52,56,55,99,100,97,49,54,56,52,52,51,99,57,100,98,99,52,102,57,100,100,102,0,0,0,0,0,0,0,0,97,101,53,54,53,53,99,100,102,53,52,53,100,50,55,101,51,100,51,99,101,53,101,98,99,48,49,48,100,101,52,102,52,98,51,55,55,49,50,55,48,52,102,97,52,50,52,101,49,101,99,49,57,56,102,97,49,52,52,100,97,53,51,57,0,0,0,0,0,0,0,0,57,57,51,57,97,51,101,100,98,56,101,56,99,102,100,56,100,102,57,102,54,54,101,98,54,99,53,100,100,100,49,48,50,52,52,100,52,55,99,98,56,97,52,55,100,56,57,101,52,51,48,49,53,97,48,50,57,97,54,101,100,57,102,51,0,0,0,0,0,0,0,0,54,101,53,50,49,49,53,57,98,56,98,102,55,98,54,51,53,100,56,57,98,102,56,48,99,97,97,102,55,49,55,97,56,48,56,98,55,99,99,97,49,99,49,52,55,54,99,55,99,51,99,102,97,53,98,48,49,51,101,101,101,100,100,102,0,0,0,0,0,0,0,0,102,55,49,56,57,101,54,102,55,53,50,55,101,53,99,55,48,55,101,97,101,100,57,48,98,48,102,53,101,52,102,56,55,100,51,56,97,56,102,98,102,51,55,97,55,56,102,55,100,98,56,100,52,99,100,57,97,49,50,99,57,98,99,48,0,0,0,0,0,0,0,0,102,49,102,48,57,52,57,53,57,101,99,57,55,50,51,53,56,101,99,98,48,56,48,48,101,54,52,52,98,98,100,100,53,100,49,50,48,55,49,57,49,101,101,99,101,99,98,57,53,55,48,101,49,99,101,54,49,50,53,56,54,48,50,52,0,0,0,0,0,0,0,0,52,54,100,100,101,99,53,102,100,101,49,100,53,51,101,52,49,97,55,98,49,54,50,48,101,101,99,52,98,50,98,51,49,99,98,50,50,97,55,54,50,101,51,56,100,49,99,53,49,55,51,50,52,53,50,53,99,101,51,57,100,52,53,57,0,0,0,0,0,0,0,0,98,51,102,48,97,100,53,99,51,53,56,99,98,53,56,52,48,50,48,101,97,100,99,53,102,99,55,53,102,49,49,56,52,100,56,97,102,51,53,53,100,51,51,53,55,102,52,101,51,97,97,101,101,97,48,102,57,53,55,100,101,53,49,55,0,0,0,0,0,0,0,0,49,56,56,100,101,57,57,50,98,57,53,57,54,55,54,98,49,51,52,49,97,52,52,53,50,97,100,101,51,57,56,101,51,50,51,49,50,97,102,48,53,51,48,52,54,52,49,49,51,97,48,56,57,57,100,99,100,101,56,54,57,99,50,98,0,0,0,0,0,0,0,0,102,52,55,50,54,56,98,97,97,99,100,49,100,98,102,49,100,51,99,102,51,101,97,53,48,48,49,49,57,55,51,51,55,54,50,54,51,97,52,50,53,101,55,48,55,48,101,99,97,52,51,98,49,49,100,53,56,100,52,51,98,51,48,56,0,0,0,0,0,0,0,0,100,97,98,99,51,102,101,102,102,57,48,54,54,99,48,56,49,97,54,57,56,101,50,49,55,102,100,101,99,55,98,56,48,98,56,49,102,57,55,101,52,101,100,102,97,51,55,97,100,101,55,49,51,101,101,97,102,49,52,51,48,51,98,97,0,0,0,0,0,0,0,0,50,49,49,50,102,99,55,102,50,57,98,55,101,57,51,56,101,54,98,53,56,52,97,57,97,98,52,57,56,97,100,57,98,54,50,56,99,57,51,50,100,53,48,99,56,56,50,53,55,52,48,49,97,52,99,57,50,51,52,54,98,52,57,53,0,0,0,0,0,0,0,0,99,98,98,99,54,55,100,100,98,48,56,56,49,55,56,97,48,54,97,56,100,57,49,55,52,98,48,99,51,48,49,48,57,97,49,56,50,97,102,50,55,51,56,56,55,48,98,101,48,49,57,57,100,49,55,54,52,48,50,98,99,51,53,50,0,0,0,0,0,0,0,0,52,49,99,56,50,51,100,50,100,98,55,102,102,98,55,54,55,101,54,54,99,56,55,55,99,48,57,49,99,100,57,54,98,51,98,51,100,102,49,100,53,102,48,54,102,54,99,55,102,101,52,50,50,98,56,100,49,48,50,100,48,50,54,50,0,0,0,0,0,0,0,0,51,49,99,102,100,56,48,102,56,50,99,55,48,57,100,100,97,97,100,57,100,49,98,51,50,101,54,50,55,97,97,98,50,54,57,49,98,100,50,97,55,55,50,54,56,99,54,49,101,53,49,100,99,57,52,48,50,97,101,50,55,48,97,55,0,0,0,0,0,0,0,0,54,100,101,50,49,48,50,97,99,52,48,52,57,56,97,54,97,48,54,98,98,55,48,50,53,101,102,54,51,100,52,57,98,98,48,97,49,50,97,102,101,102,57,52,54,53,100,52,98,49,49,49,54,53,50,99,101,52,53,48,101,98,48,101,0,0,0,0,0,0,0,0,54,50,50,97,48,99,50,98,56,97,99,98,57,54,102,52,55,50,101,98,100,48,54,102,55,101,97,56,50,55,98,98,54,55,55,49,99,99,97,102,57,102,55,101,48,100,52,102,100,51,48,52,51,53,50,55,98,97,101,55,99,48,51,48,0,0,0,0,0,0,0,0,102,97,55,55,55,100,98,101,99,99,101,48,56,102,56,100,54,51,52,97,51,50,54,101,101,54,97,102,102,101,100,51,52,49,49,49,56,51,53,97,54,53,101,56,98,48,100,56,49,51,97,54,48,52,100,102,53,50,97,102,56,56,101,100,0,0,0,0,0,0,0,0,48,56,55,51,99,100,97,102,55,97,97,97,51,57,54,102,56,101,55,49,98,50,102,48,48,100,102,49,51,51,101,98,97,102,50,55,48,100,49,48,98,53,98,54,48,52,100,102,53,49,55,53,55,98,101,56,50,99,50,52,97,98,102,99,0,0,0,0,0,0,0,0,54,50,56,50,53,102,98,57,98,54,53,56,97,51,48,102,57,99,98,56,56,98,56,52,101,101,55,102,55,56,52,99,99,49,97,102,54,97,50,56,55,50,101,53,101,102,52,51,101,99,50,55,50,57,57,56,53,98,102,56,101,48,102,97,0,0,0,0,0,0,0,0,52,101,55,50,55,56,97,50,100,57,51,102,54,101,55,56,56,101,102,102,53,98,50,55,56,102,53,102,97,100,57,97,55,53,52,99,97,49,100,99,52,99,102,102,53,56,50,97,49,56,99,99,54,99,101,52,101,48,98,50,55,100,55,54,0,0,0,0,0,0,0,0,50,49,49,97,99,102,55,54,51,97,54,99,101,97,101,56,50,98,54,55,52,51,51,101,50,56,57,100,98,55,101,102,49,53,100,57,97,101,97,56,97,98,101,51,49,99,50,97,52,99,101,49,102,53,53,102,49,53,50,48,97,48,53,100,0,0,0,0,0,0,0,0,49,102,98,102,57,49,101,99,57,101,56,53,101,53,56,102,54,54,52,54,97,53,48,51,98,54,56,98,50,54,53,51,53,56,57,101,55,51,101,49,99,51,54,50,54,57,102,98,54,57,57,101,49,54,101,50,56,99,101,55,48,97,99,54,0,0,0,0,0,0,0,0,101,48,101,101,48,101,54,99,101,57,98,52,52,100,98,97,53,53,100,54,102,101,100,99,50,53,102,100,53,50,55,48,98,52,98,100,56,97,54,50,49,102,102,98,54,50,49,57,54,52,53,100,100,56,99,99,53,53,52,54,49,49,50,99,0,0,0,0,0,0,0,0,48,98,97,57,101,98,50,54,55,100,57,101,56,100,54,51,53,57,102,98,97,51,99,52,99,56,50,98,97,50,102,57,53,101,101,50,99,48,55,102,53,102,50,100,49,102,57,56,56,54,53,97,102,48,51,52,97,48,53,56,49,102,100,55,0,0,0,0,0,0,0,0,56,55,99,102,101,48,48,55,101,55,100,98,98,55,57,101,51,97,57,102,101,101,52,50,50,50,99,99,54,51,56,52,54,54,56,51,54,55,101,102,51,102,54,99,50,50,99,57,55,98,49,56,55,102,51,102,55,54,54,54,98,98,51,56,0,0,0,0,0,0,0,0,101,52,49,101,100,56,48,48,48,51,54,101,49,100,57,49,56,53,55,50,100,55,100,49,54,100,53,57,101,56,102,51,52,51,97,48,55,48,97,57,53,98,99,51,57,57,101,50,50,53,53,51,48,50,57,102,49,56,50,99,55,101,97,102,0,0,0,0,0,0,0,0,49,50,53,51,97,48,100,52,102,49,99,100,100,97,50,98,52,49,100,100,98,55,56,52,102,97,97,97,102,98,98,49,102,54,54,53,51,57,51,98,55,98,98,53,52,102,55,101,97,100,53,48,49,56,54,57,49,55,52,49,55,57,55,57,0,0,0,0,0,0,0,0,49,51,54,50,100,51,49,55,51,101,99,50,49,55,54,50,54,101,48,48,98,51,97,53,97,100,50,56,49,57,50,56,53,99,52,99,50,53,99,97,55,97,51,51,54,97,53,48,51,57,97,55,99,51,50,54,52,98,56,99,49,100,49,101,0,0,0,0,0,0,0,0,98,55,53,54,50,56,49,48,101,49,51,99,100,100,53,57,101,54,102,49,100,101,101,50,100,53,49,51,50,52,53,57,53,52,52,52,97,98,97,48,102,56,55,48,98,55,98,102,48,55,52,49,102,50,100,101,56,99,100,49,48,100,102,56,0,0,0,0,0,0,0,0,53,51,57,51,56,50,57,101,100,101,55,53,100,54,51,53,101,53,56,100,49,57,48,98,101,100,50,50,54,54,56,100,48,100,101,49,98,102,51,100,49,101,50,52,48,49,97,48,101,97,100,57,48,50,48,53,98,55,100,97,57,56,49,97,0,0,0,0,0,0,0,0,97,99,53,54,55,56,49,52,51,51,99,57,100,50,99,97,49,53,51,98,54,100,52,51,102,101,102,100,48,49,56,48,100,98,52,55,53,51,102,100,100,54,49,51,56,102,102,100,101,50,51,102,56,57,48,52,54,53,55,102,98,101,52,52,0,0,0,0,0,0,0,0,49,50,55,55,102,102,48,102,55,49,53,102,97,57,48,54,50,100,54,50,102,53,102,57,50,53,51,98,51,56,101,51,55,50,55,51,52,55,99,49,56,102,97,99,48,50,97,101,53,56,98,49,54,57,54,50,57,53,99,98,98,49,100,51,0,0,0,0,0,0,0,0,99,98,52,52,101,97,97,100,56,97,97,100,53,55,52,52,57,57,98,100,52,54,52,53,102,51,100,101,98,50,57,53,55,100,97,101,102,52,48,50,54,57,56,99,56,55,50,52,48,102,100,49,49,51,57,97,56,99,57,54,50,98,56,100,0,0,0,0,0,0,0,0,49,51,57,49,54,54,55,99,99,49,54,55,97,55,48,54,102,101,52,99,48,57,51,48,50,48,57,99,102,53,100,50,55,48,50,100,55,98,100,51,98,54,56,54,49,99,49,53,101,99,97,98,100,51,98,52,51,49,101,101,57,51,49,49,0,0,0,0,0,0,0,0,49,52,99,101,102,48,98,53,101,101,51,51,102,53,55,48,48,98,54,49,52,53,52,97,57,50,54,101,52,57,97,49,57,101,52,98,51,56,100,52,100,99,54,48,50,97,52,102,101,53,49,99,57,54,51,98,100,99,98,57,102,97,57,54,0,0,0,0,0,0,0,0,48,57,48,57,50,50,98,49,48,51,51,54,53,56,49,52,97,52,54,51,99,48,49,57,102,99,99,48,49,56,57,51,99,100,55,98,55,57,51,53,55,101,51,102,100,99,101,48,51,100,102,56,54,97,102,100,102,56,53,53,56,102,49,53,0,0,0,0,0,0,0,0,100,48,49,52,54,98,52,55,49,99,48,55,98,97,97,102,48,51,101,48,48,54,55,50,102,99,48,52,49,50,51,55,97,50,57,49,49,57,54,101,101,48,50,100,56,52,55,101,52,97,97,52,101,101,57,55,52,55,53,51,53,56,50,52,0,0,0,0,0,0,0,0,50,55,99,54,53,56,98,55,51,50,53,56,97,49,54,55,49,55,100,57,48,101,102,56,55,102,52,55,52,55,101,51,55,53,52,48,100,97,53,56,54,99,99,55,50,54,56,51,50,97,51,99,54,56,52,97,51,55,101,57,51,48,52,52,0,0,0,0,0,0,0,0,50,52,53,99,56,53,56,97,51,52,100,102,56,49,57,102,54,97,48,49,50,53,56,54,100,54,57,50,98,51,101,49,52,56,97,100,51,97,99,53,54,97,49,57,52,57,99,100,100,101,102,100,54,54,102,57,98,51,55,48,102,57,98,50,0,0,0,0,0,0,0,0,101,48,98,99,54,57,56,102,50,56,100,50,53,56,100,49,57,51,53,57,55,98,100,102,50,49,56,50,55,53,51,57,99,48,98,56,55,101,100,48,99,57,55,101,53,101,102,52,49,54,97,49,100,102,56,99,56,55,53,52,98,49,101,54,0,0,0,0,0,0,0,0,53,99,51,52,53,51,101,100,56,54,102,101,50,57,52,56,101,54,99,48,99,97,101,56,50,97,57,54,99,98,57,51,99,99,97,50,100,49,53,99,52,97,97,101,56,54,97,99,51,100,100,53,97,54,97,100,56,98,100,101,102,101,98,99,0,0,0,0,0,0,0,0,48,49,52,102,98,97,50,50,100,55,99,52,49,97,97,51,98,54,97,101,54,101,48,52,102,49,51,100,99,100,101,99,99,101,50,101,48,50,102,54,97,48,99,50,101,101,102,54,98,49,50,100,99,102,57,55,56,99,54,51,102,98,50,99,0,0,0,0,0,0,0,0,51,101,54,54,97,102,51,52,50,57,54,97,56,57,98,48,97,97,101,48,52,53,55,49,52,54,97,102,48,50,55,52,53,48,55,49,48,51,50,101,53,48,56,101,97,49,99,52,49,57,49,53,52,49,99,52,98,48,50,57,102,49,56,102,0,0,0,0,0,0,0,0,98,98,48,98,50,54,49,54,55,53,53,56,50,99,54,56,54,53,102,54,56,55,50,53,56,55,57,100,50,56,49,53,102,53,49,54,57,53,53,99,102,48,98,98,102,98,57,97,50,55,52,50,51,100,55,56,52,50,51,49,57,56,50,53,0,0,0,0,0,0,0,0,52,50,99,99,53,51,56,55,49,49,48,55,49,100,98,51,56,51,102,101,55,53,101,53,102,99,49,50,57,97,101,53,97,51,48,54,48,100,101,97,57,101,97,102,52,102,100,49,99,57,52,50,50,50,56,100,97,97,97,55,51,98,99,50,0,0,0,0,0,0,0,0,52,51,49,51,51,102,97,54,57,48,57,50,97,100,99,97,48,52,56,97,97,101,54,53,49,98,56,52,97,49,102,55,51,99,53,52,99,48,54,48,54,53,51,56,101,54,56,49,98,54,97,97,51,100,52,49,50,54,54,52,48,102,55,49,0,0,0,0,0,0,0,0,55,102,57,57,97,53,101,52,56,101,50,100,48,102,101,54,50,102,98,102,56,99,51,49,55,54,97,53,102,51,50,48,101,100,49,52,98,99,53,50,101,100,97,100,97,54,99,51,55,55,100,57,52,51,100,102,55,102,101,97,56,57,52,56,0,0,0,0,0,0,0,0,52,50,101,48,48,48,53,57,55,50,49,100,48,48,52,53,54,99,56,53,50,54,99,56,97,48,50,53,102,99,48,57,50,50,50,97,102,101,48,99,56,52,53,101,97,56,50,48,54,100,101,100,102,56,100,55,101,52,57,99,54,54,50,54,0,0,0,0,0,0,0,0,97,99,99,98,56,53,49,102,97,56,98,102,97,57,56,54,100,51,53,99,55,98,57,50,97,57,97,56,55,51,102,102,102,56,52,53,54,53,101,101,49,98,99,49,50,99,97,52,102,97,54,98,53,102,50,57,56,100,101,97,50,54,99,100,0,0,0,0,0,0,0,0,111,64,109,91,51,59,43,112,54,54,106,99,109,45,50,53,113,113,64,48,50,115,98,38,114,115,54,49,64,53,117,103,57,110,41,93,43,43,113,120,108,46,40,41,121,50,104,33,100,108,95,100,100,53,0,0,113,59,37,111,112,48,51,44,105,117,54,38,110,93,102,0,93,52,105,121,55,0,0,0,64,59,120,35,56,49,116,113,91,110,54,109,52,100,40,33,103,95,113,53,45,104,97,114,115,112,120,37,91,93,50,48,95,55,107,98,0,0,0,0,114,42,108,116,121,116,46,101,51,55,37,59,38,110,107,109,103,45,99,97,51,49,119,56,61,106,110,122,95,33,109,113,122,114,97,105,98,93,97,42,59,108,40,106,57,95,98,93,111,104,106,0,0,0,0,0,95,118,107,122,49,52,103,121,103,108,48,43,0,0,0,0,117,91,93,100,99,113,36,115,101,56,59,44,35,111,113,49,103,97,56,38,103,93,44,102,51,110,99,36,45,106,33,106,113,111,113,37,51,115,120,48,48,38,99,120,36,117,46,46,53,118,59,57,37,105,53,33,116,43,121,35,55,95,46,48,108,114,111,95,111,48,93,115,104,103,48,104,33,119,53,121,121,55,106,51,35,120,104,59,111,33,115,98,0,0,0,0,49,107,95,52,112,119,107,103,42,107,106,40,122,41,108,119,101,113,50,118,110,122,102,48,36,116,108,115,112,40,114,116,118,36,105,56,61,59,108,59,42,49,110,95,59,117,119,115,115,102,116,0,0,0,0,0,120,52,115,33,91,117,97,118,44,45,37,91,104,109,116,55,48,56,116,48,35,113,57,50,99,0,0,0,0,0,0,0,42,106,56,116,113,52,111,50,91,59,64,93,38,59,51,103,38,104,113,122,37,49,119,95,110,44,113,118,106,117,101,120,116,35,111,118,37,97,36,110,112,44,59,121,115,44,111,91,104,120,101,48,119,116,100,117,35,99,56,121,56,120,55,54,55,59,103,122,48,112,38,118,33,57,40,41,49,109,57,111,108,61,95,120,42,50,108,122,100,38,51,33,43,100,0,0,64,120,98,33,114,41,107,110,52,112,115,110,99,111,52,42,116,113,56,49,52,91,101,56,93,121,108,38,49,0,0,0,57,41,56,41,43,98,91,54,64,55,45,57,59,52,46,38,100,56,44,43,37,97,93,44,61,51,54,113,113,107,43,122,40,53,122,49,44,113,57,35,64,38,101,117,95,38,121,36,49,91,93,110,37,103,98,114,61,40,50,121,33,59,105,53,0,0,0,0,0,0,0,0,53,44,61,56,105,101,122,104,107,35,112,105,40,113,119,49,50,118,95,64,100,42,110,40,111,120,102,108,119,122,95,114,121,64,98,50,97,106,105,99,111,113,36,118,107,103,57,105,42,37,50,116,59,113,56,43,0,0,0,0,0,0,0,0,55,102,35,97,97,108,97,38,117,93,59,33,42,53,91,100,109,64,56,93,50,53,110,107,112,64,103,49,108,48,43,121,46,111,105,64,105,105,110,120,59,111,37,110,50,40,110,43,35,121,102,45,41,110,101,50,53,44,97,115,95,52,35,112,37,98,52,101,59,120,104,0,97,50,117,118,56,44,41,108,43,100,95,108,100,48,107,111,119,107,48,105,119,57,112,57,121,64,112,117,50,59,53,52,40,61,117,0,0,0,0,0,113,48,119,107,111,112,57,104,93,33,48,118,33,112,43,64,115,37,118,36,38,49,98,48,36,42,61,120,35,41,50,50,37,115,111,33,0,0,0,0,110,50,102,109,91,106,107,105,100,105,49,114,35,46,36,109,121,121,61,91,38,42,112,97,111,44,102,40,114,112,44,33,91,95,114,122,37,110,116,104,95,122,113,41,45,91,59,57,42,122,99,41,110,55,111,37,55,50,49,59,0,0,0,0,59,53,61,99,105,35,105,100,121,49,49,42,113,104,45,117,119,108,61,59,122,51,95,99,49,102,52,38,43,36,104,108,36,97,114,51,52,59,91,97,98,119,111,42,43,33,49,53,48,108,45,91,97,120,61,49,106,37,37,51,46,44,64,59,114,41,111,114,112,35,117,103,36,102,121,108,46,55,120,99,38,36,122,99,122,108,55,59,52,107,98,108,109,0,0,0,99,91,109,112,97,46,120,120,115,55,46,119,45,59,101,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,59,117,114,53,55,33,119,99,61,36,91,117,104,104,109,122,61,113,93,107,121,121,50,51,121,100,122,61,41,53,56,44,41,116,33,45,52,95,33,120,106,53,115,109,114,121,99,115,55,98,97,97,103,51,45,120,97,103,41,98,42,95,33,103,99,105,41,43,49,107,97,97,101,117,108,37,0,0,0,0,33,40,97,42,103,35,59,54,95,45,110,38,49,118,110,102,42,44,121,116,59,95,110,101,119,113,108,56,98,98,110,33,111,44,61,40,42,97,120,53,114,100,100,99,54,99,40,104,46,104,49,43,44,98,59,64,95,116,93,50,33,41,50,48,104,98,44,120,111,59,43,37,97,44,54,118,107,118,51,113,110,56,112,111,108,55,91,113,64,107,100,41,118,104,55,0,121,99,95,40,61,111,55,104,61,110,113,110,102,103,37,54,106,115,38,44,99,95,105,91,102,102,54,114,52,99,40,52,117,44,105,56,100,95,98,106,44,109,112,105,51,40,99,119,40,44,33,37,119,106,35,55,98,0,0,0,0,0,0,0,112,44,97,44,48,115,40,110,52,40,111,57,99,36,40,110,112,95,112,49,112,104,107,91,95,120,45,59,115,114,100,56,64,120,61,45,61,95,98,95,112,101,97,37,107,102,101,45,108,50,114,117,56,37,41,53,0,0,0,0,0,0,0,0,40,107,112,56,45,61,109,35,113,101,61,122,42,41,106,99,98,91,99,119,36,33,115,57,61,54,45,117,111,64,116,111,45,36,121,119,91,50,57,64,40,103,97,104,64,122,107,61,101,44,43,95,46,44,46,64,114,113,117,51,37,122,41,55,48,116,42,40,56,40,114,111,0,0,0,0,0,0,0,0,119,122,33,115,105,38,106,108,113,53,95,116,95,56,50,33,43,111,118,40,98,104,119,0,103,36,51,55,112,53,122,35,121,122,111,122,35,54,38,103,120,95,116,40,116,55,121,38,121,55,110,64,93,59,53,95,112,100,41,119,95,43,49,45,56,111,115,122,41,36,93,0,98,110,33,102,103,44,121,104,51,40,116,122,97,110,109,93,100,37,50,109,46,118,56,99,59,117,120,55,52,50,93,36,108,107,100,98,38,41,41,61,108,0,0,0,0,0,0,0,40,97,45,122,113,59,110,43,44,42,57,101,42,56,44,112,112,115,99,56,97,61,33,120,122,33,113,117,122,57,100,107,53,38,104,48,121,120,37,101,105,103,44,61,117,103,55,117,44,106,40,119,100,50,111,64,46,50,122,103,38,64,51,121,59,110,53,42,119,38,51,48,54,102,106,54,103,103,38,120,101,46,42,115,45,99,49,109,0,0,0,0,0,0,0,0,49,55,110,115,122,122,104,61,100,42,37,120,45,48,113,115,101,38,41,115,40,115,44,42,107,51,56,45,43,37,119,93,113,53,37,121,112,61,64,45,122,35,120,95,91,91,95,44,93,37,44,107,42,36,106,37,114,118,121,43,33,98,110,40,100,111,103,51,46,52,97,37,50,117,37,108,107,64,109,97,121,99,45,52,33,48,110,97,55,99,56,91,53,106,0,0,95,46,37,116,118,45,40,118,106,114,54,111,100,108,102,37,35,110,99,45,108,49,43,59,107,117,37,107,57,112,120,110,42,33,91,104,102,45,35,37,57,56,41,120,59,103,41,93,52,110,64,102,54,44,37,112,98,105,38,122,117,100,95,57,43,119,113,113,120,106,101,104,37,116,114,107,121,98,0,0,59,53,102,59,57,103,91,119,46,52,121,54,0,0,0,0,38,33,97,116,115,114,40,40,45,55,111,51,49,103,64,44,117,122,56,106,108,35,49,102,0,0,0,0,0,0,0,0,97,95,116,122,106,99,56,118,55,107,45,55,54,105,103,37,121,100,98,106,101,104,33,110,51,109,64,122,44,55,42,56,116,105,99,121,100,37,107,38,113,40,53,112,50,104,112,95,49,105,48,104,100,114,61,114,35,117,107,113,44,50,118,52,93,45,53,44,91,33,101,57,116,103,99,115,0,0,0,0,93,106,108,52,101,46,91,120,100,106,48,113,110,108,54,56,104,59,59,108,41,101,121,97,101,91,41,42,56,101,0,0,51,120,113,49,48,108,45,54,45,49,42,100,91,38,61,55,111,107,57,43,46,37,106,111,93,45,119,53,56,0,0,0,37,49,111,100,41,44,53,99,52,109,43,117,55,36,114,54,50,50,99,118,43,106,40,33,119,106,41,91,91,112,97,99,110,46,105,59,100,45,104,51,100,46,40,42,115,98,115,115,52,52,117,122,95,100,102,111,50,55,116,103,107,50,55,99,109,40,53,118,118,33,95,99,107,115,48,55,38,112,104,113,45,46,49,0,0,0,0,0,54,35,106,98,112,109,36,102,55,41,48,48,107,36,49,107,121,118,50,46,122,103,101,35,116,61,93,36,40,104,111,59,40,101,59,114,116,91,110,35,110,102,111,105,116,55,119,52,42,106,0,0,0,0,0,0,91,114,110,95,119,117,113,44,107,37,95,50,119,115,44,106,100,101,56,51,37,51,55,35,53,110,110,37,64,101,103,108,109,50,101,38,103,120,91,40,51,43,113,41,40,52,49,35,107,114,46,115,111,53,104,101,91,107,101,59,113,44,45,53,52,98,53,43,105,91,122,100,56,43,37,98,46,122,119,41,42,117,42,116,97,48,44,106,49,102,54,97,0,0,0,0,95,122,93,49,37,40,119,59,112,42,40,49,44,100,53,108,119,99,102,98,54,122,113,54,43,35,102,95,118,43,45,97,95,41,109,98,97,118,38,44,55,61,116,64,113,105,44,110,51,107,95,93,101,121,99,107,45,59,48,45,43,55,117,99,38,103,0,0,0,0,0,0,57,44,102,59,61,53,111,117,98,40,38,48,35,42,114,111,57,106,105,118,97,117,50,122,98,48,64,103,53,0,0,0,118,114,113,0,0,0,0,0,110,112,42,93,116,118,61,111,41,36,51,93,120,121,52,0,103,36,61,41,98,107,108,56,54,105,104,111,61,111,105,44,64,57,111,64,104,51,33,116,111,48,101,91,116,105,56,97,35,49,61,93,48,51,114,115,103,50,46,103,99,61,120,93,43,91,91,99,49,95,57,51,33,93,120,107,40,116,35,37,110,91,36,35,113,100,91,121,102,120,115,50,91,110,52,113,41,117,91,122,122,43,0,0,113,98,115,48,36,61,93,98,55,114,112,104,118,46,45,116,111,119,115,102,41,101,37,120,93,109,115,115,103,109,100,91,45,104,100,118,108,100,111,61,113,0,0,0,0,0,0,0,50,52,115,118,109,102,44,43,104,57,95,115,41,41,100,117,98,107,51,114,97,48,104,51,112,61,118,100,48,99,48,91,42,101,53,43,41,44,56,109,104,116,108,116,117,51,57,64,91,54,117,103,52,33,118,104,98,57,46,107,102,33,43,119,110,107,56,119,40,100,36,54,44,54,0,0,0,0,0,0,51,106,51,51,40,91,95,41,59,106,100,115,49,93,104,50,51,107,114,56,42,109,107,121,91,91,51,42,116,105,104,43,54,55,112,41,36,50,102,115,35,107,91,118,59,121,43,45,55,45,38,99,109,112,113,37,110,121,49,102,122,114,49,113,59,48,117,45,43,52,120,114,116,121,55,99,122,104,121,41,111,57,103,116,98,55,50,106,118,0,0,0,0,0,0,0,41,104,46,109,117,113,40,51,59,119,61,103,50,56,33,104,120,61,108,109,98,44,102,114,112,91,37,107,105,118,118,91,109,61,43,103,100,38,40,116,111,50,57,50,93,45,93,112,55,49,36,37,107,99,55,115,35,49,111,116,105,111,42,120,0,0,0,0,0,0,0,0,56,99,102,111,41,40,38,104,108,120,115,59,98,55,95,105,40,57,110,51,36,53,43,103,57,122,52,91,117,108,115,116,36,113,101,113,56,109,108,113,45,113,104,106,33,106,111,104,0,0,0,0,0,0,0,0,42,37,116,49,114,48,35,91,95,99,42,104,38,36,33,59,52,91,33,104,121,91,54,101,97,113,50,97,44,0,0,0,103,59,110,118,121,42,41,38,38,110,99,42,43,33,35,120,121,102,55,41,93,115,0,0,101,112,111,109,104,33,119,115,101,35,59,122,53,52,118,110,112,122,57,103,97,119,120,44,98,42,119,119,52,98,113,33,36,107,119,119,56,103,109,101,45,43,37,95,107,36,61,97,103,97,105,33,93,48,103,59,54,64,105,100,110,43,52,38,43,114,115,41,114,50,111,116,50,113,36,0,0,0,0,0,111,117,97,117,52,54,100,55,116,101,38,121,38,51,121,116,115,48,95,61,38,100,52,118,55,37,108,97,113,37,119,121,59,113,44,99,52,37,42,99,112,113,102,122,91,120,42,0,102,46,93,120,51,111,106,33,43,51,120,54,36,55,64,50,56,43,117,41,40,120,114,46,48,33,48,53,59,44,51,44,56,117,42,33,40,54,49,98,97,95,49,113,41,56,107,122,104,64,35,106,0,0,0,0,105,110,57,107,50,104,55,106,115,43,42,52,40,33,115,49,37,40,99,107,121,57,101,115,119,106,45,56,40,52,93,56,97,56,98,55,119,108,119,120,53,41,0,0,0,0,0,0,107,51,95,112,111,59,102,91,52,100,115,43,108,54,108,122,54,46,99,99,42,116,99,52,91,44,40,118,117,116,93,48,54,51,49,35,121,108,46,49,115,61,53,93,36,51,114,51,42,105,37,43,112,45,121,49,64,36,61,104,110,42,122,111,56,49,107,110,64,99,56,109,42,105,55,40,53,50,40,113,35,52,97,0,0,0,0,0,95,118,37,115,95,104,55,107,112,93,53,101,102,109,50,38,53,44,41,119,104,98,48,38,44,0,0,0,0,0,0,0,43,57,100,122,41,107,51,59,64,113,122,118,111,121,41,99,49,93,106,95,51,110,36,36,53,108,53,44,55,95,118,101,107,105,43,52,95,113,59,111,99,38,45,37,50,117,50,33,119,110,114,107,101,112,91,48,33,101,38,97,107,104,52,93,49,112,49,46,56,45,106,109,91,113,64,53,45,45,122,0,37,115,42,119,103,42,36,109,91,101,114,118,53,114,107,50,118,101,46,44,57,105,122,91,100,36,100,103,36,37,111,50,59,36,49,64,37,106,101,56,106,48,120,120,59,109,53,113,35,38,51,100,117,40,107,117,42,35,54,51,107,55,45,111,38,112,106,53,0,0,0,0,106,50,107,105,42,114,110,41,59,43,115,54,46,115,36,101,98,56,33,64,122,37,122,44,43,40,57,52,102,103,108,46,114,37,95,50,52,59,98,115,64,0,0,0,0,0,0,0,55,103,105,35,59,100,57,106,112,51,52,38,40,45,118,55,108,122,46,110,46,95,53,115,102,59,35,42,45,54,44,54,102,118,117,42,35,117,109,101,119,109,37,37,56,40,0,0,95,119,51,51,56,102,42,101,106,120,54,50,122,93,116,120,103,101,33,116,114,57,64,46,113,117,53,61,109,100,44,100,57,55,64,54,48,42,56,48,56,105,104,37,36,110,56,61,98,107,45,48,115,51,102,105,109,112,56,111,51,115,112,44,119,51,119,91,91,51,35,91,50,51,48,117,45,0,0,0,42,112,55,121,106,41,97,54,100,43,57,45,56,99,101,59,98,109,53,114,46,115,57,36,59,57,41,61,57,50,49,103,59,49,55,43,42,51,44,45,59,113,40,37,45,93,121,102,106,108,91,103,35,50,59,56,45,100,108,53,104,33,106,102,40,53,121,56,38,55,111,113,101,54,115,112,37,42,107,113,108,118,0,0,0,0,0,0,99,120,45,45,122,41,111,50,48,98,91,57,95,33,99,122,95,41,104,42,48,114,43,102,115,102,118,41,120,113,117,49,117,116,110,0,0,0,0,0,40,99,109,44,53,121,104,98,54,108,61,38,38,100,106,48,116,54,115,93,61,61,116,107,100,93,35,100,43,95,101,33,42,108,107,121,49,59,106,43,38,106,64,93,93,120,106,105,35,57,43,61,103,33,0,0,43,99,107,57,103,46,110,49,55,33,91,64,115,57,95,36,59,48,117,43,104,45,110,101,35,36,104,43,95,0,0,0,38,91,54,114,51,42,54,108,57,101,54,59,59,37,57,56,49,95,33,110,102,48,100,117,99,57,40,35,112,42,114,110,112,120,64,40,36,40,115,112,110,41,103,42,110,35,97,36,91,108,106,121,104,105,59,0,106,54,33,112,117,50,93,59,95,102,111,122,98,112,42,110,97,106,56,91,104,109,44,100,61,43,36,52,108,52,54,50,54,114,120,110,51,117,33,55,38,102,35,57,56,40,0,0,44,42,114,51,0,0,0,0,101,110,93,100,98,110,42,106,56,49,107,48,56,119,37,99,111,103,99,40,44,120,120,113,122,35,93,55,49,59,54,98,107,118,53,36,0,0,0,0,57,61,112,110,98,59,116,54,102,53,33,121,116,98,61,54,115,55,53,36,101,109,43,103,101,44,103,91,53,57,95,119,35,97,43,97,111,104,46,36,35,113,48,48,53,53,50,102,110,95,100,43,61,107,49,33,117,108,35,120,106,111,64,116,122,52,36,40,121,46,49,40,64,36,45,102,91,64,122,109,54,116,33,109,99,101,52,61,40,49,41,122,33,112,102,111,102,121,117,0,0,0,0,0,121,59,36,109,101,109,114,101,57,102,57,54,38,121,61,50,33,64,119,43,121,115,42,116,114,54,35,114,104,105,41,97,115,100,118,111,98,35,0,0,115,33,95,51,57,101,100,56,38,49,44,45,46,48,104,117,116,106,91,55,117,56,56,119,55,122,54,42,104,114,118,50,54,38,99,121,45,109,0,0,48,57,113,53,117,95,100,49,111,54,103,37,49,45,54,59,122,45,114,108,100,119,54,57,44,37,117,41,37,108,56,111,55,122,110,48,52,104,104,116,38,56,122,38,101,115,98,98,100,56,103,57,49,115,110,110,95,45,111,95,110,33,43,52,113,112,53,36,44,107,110,113,97,98,119,107,50,100,56,95,109,44,109,52,103,37,104,44,120,118,100,121,112,121,43,44,55,54,53,0,0,0,0,0,107,112,117,40,59,122,104,112,103,104,51,122,122,107,97,64,91,120,120,56,46,57,120,116,36,118,120,100,40,35,119,43,98,52,105,37,53,46,114,121,93,104,52,122,48,49,112,46,64,36,61,56,109,48,102,95,95,46,120,64,37,104,108,117,103,38,93,120,57,53,118,116,116,117,35,37,48,43,103,46,49,53,98,64,104,45,57,0,108,113,121,59,49,93,93,115,117,98,56,46,56,108,111,117,95,40,99,36,36,0,0,0,33,114,113,41,104,42,120,0,104,41,103,56,106,121,110,117,103,61,43,110,44,51,95,59,40,61,106,37,44,115,118,98,106,37,35,57,91,33,45,0,91,122,50,115,37,93,52,113,44,98,117,101,51,122,51,52,51,41,109,41,43,40,55,50,121,112,122,52,112,40,40,51,49,110,46,57,0,0,0,0,118,52,0,0,0,0,0,0,108,116,115,43,102,113,42,100,44,118,46,111,46,95,113,99,52,116,117,114,104,117,52,101,40,0,0,0,0,0,0,0,45,103,107,40,61,118,107,64,45,103,35,49,50,46,64,103,100,119,114,91,112,114,41,122,102,122,41,117,99,101,104,112,56,56,120,45,108,36,117,56,121,50,52,38,105,113,101,105,53,107,98,100,48,103,110,35,36,111,54,37,111,108,109,53,0,0,0,0,0,0,0,0,113,111,54,52,45,48,33,51,106,98,115,36,48,101,61,103,35,61,108,45,100,108,64,116,115,114,119,45,57,36,107,93,51,48,109,61,121,46,44,97,98,100,114,109,56,108,56,42,115,55,108,101,43,122,115,116,117,112,101,33,38,100,114,114,121,53,95,0,0,0,0,0,106,113,53,93,115,108,113,98,36,37,110,104,102,35,102,38,33,37,118,49,38,113,98,59,97,119,110,115,36,121,40,95,97,107,46,99,110,98,110,54,102,112,109,98,57,101,59,103,53,59,61,61,121,97,95,99,109,91,38,107,51,49,109,105,118,99,122,55,54,42,46,108,97,33,91,119,64,54,35,98,61,111,114,114,117,35,42,51,35,114,59,40,114,110,42,50,97,45,40,0,0,0,0,0,57,116,106,52,33,35,41,52,101,54,101,108,116,33,109,122,122,101,40,0,0,0,0,0,110,51,121,97,44,118,35,45,119,43,61,91,55,33,61,93,41,59,48,104,64,49,111,100,115,105,104,109,61,40,105,0,56,46,95,61,40,35,101,120,43,40,109,106,102,50,44,93,97,33,108,93,45,110,93,53,101,49,97,113,93,98,100,118,35,112,61,101,119,105,115,116,44,51,117,49,109,42,57,55,100,107,119,37,35,105,45,118,110,107,55,118,61,110,112,102,103,48,108,120,52,59,106,95,45,49,98,38,35,40,105,48,44,102,110,104,45,41,42,108,0,0,0,0,0,0,0,0,100,37,116,93,119,108,41,114,120,107,49,101,108,52,107,111,95,114,59,103,44,117,59,50,118,52,61,46,52,50,98,104,109,0,0,0,0,0,0,0,95,56,118,57,33,98,93,97,117,45,42,52,114,57,118,104,48,116,59,114,45,109,59,55,59,64,122,119,45,33,107,51,91,114,107,98,117,103,38,64,119,106,45,93,53,41,104,97,119,119,53,101,95,56,103,111,40,98,103,109,120,113,122,48,91,36,56,101,35,41,35,122,44,33,54,61,102,49,50,112,57,91,35,61,53,115,116,53,50,50,45,117,109,112,37,61,48,0,0,0,0,0,0,0,33,91,120,42,112,116,105,59,40,49,107,112,61,52,111,35,112,105,44,38,113,35,45,55,46,114,115,36,42,59,102,55,102,99,36,122,59,51,54,91,0,0,0,0,0,0,0,0,51,37,55,106,37,109,99,35,111,100,107,43,41,43,40,101,101,53,110,112,111,99,53,56,93,111,57,59,93,61,108,57,35,121,103,104,49,95,106,107,37,111,101,33,36,104,104,0,101,55,52,101,36,54,110,118,41,53,48,53,105,91,122,35,105,116,46,38,50,33,54,42,38,95,98,114,110,44,36,101,110,35,121,53,56,121,97,50,117,53,46,97,105,42,56,102,115,61,115,38,46,97,59,48,35,112,52,103,37,35,120,57,49,42,120,33,44,95,91,119,46,57,115,57,122,122,56,100,118,33,105,106,101,40,50,95,101,61,107,93,0,0,0,0,64,50,45,44,110,103,48,108,111,53,98,48,52,121,61,43,91,116,46,55,95,64,100,49,100,121,93,115,114,109,112,118,38,40,100,36,114,91,55,109,45,101,48,106,57,41,95,106,43,56,56,120,48,61,110,54,64,107,108,64,56,99,106,52,0,0,0,0,0,0,0,0,111,46,53,109,57,115,119,121,56,44,54,100,64,111,117,105,121,111,59,100,37,112,115,113,55,99,33,99,36,121,53,105,117,104,110,103,116,48,107,51,122,111,110,43,109,122,95,104,0,0,0,0,0,0,0,0,104,42,100,106,36,107,55,117,33,37,93,52,114,64,104,114,109,37,105,95,41,97,64,98,105,122,112,42,118,48,106,122,93,35,119,54,111,120,49,120,99,97,108,120,117,54,50,35,57,105,57,117,100,42,98,54,100,114,0,0,0,0,0,0,35,111,111,35,120,102,103,112,113,101,42,109,100,52,118,51,55,108,55,55,106,33,102,119,51,115,99,41,115,0,0,0,120,118,98,107,0,0,0,0,49,115,102,109,122,40,48,99,37,45,98,120,97,54,44,56,109,101,0,0,0,0,0,0,59,108,51,37,108,121,122,91,41,33,119,118,93,112,100,36,51,95,111,54,100,99,48,113,121,56,56,109,116,54,109,36,0,0,0,0,0,0,0,0,106,37,64,111,119,102,101,112,45,40,59,112,40,44,37,51,122,116,48,53,105,106,49,105,52,121,64,49,114,115,53,61,46,51,95,41,100,43,48,51,107,95,113,110,111,42,105,106,105,43,111,109,38,38,101,118,33,118,50,95,113,38,100,110,105,42,107,33,93,121,98,99,0,0,0,0,0,0,0,0,55,36,50,110,121,118,108,98,33,53,51,61,114,113,98,55,115,106,102,45,122,95,100,40,105,113,91,33,108,64,41,51,35,56,93,111,50,42,107,110,117,46,105,54,115,111,105,100,101,48,115,119,91,44,50,56,44,55,119,110,35,99,55,95,104,100,51,49,91,57,116,50,112,107,37,46,100,49,44,42,110,98,111,33,51,57,0,0,91,59,52,102,53,42,54,113,54,105,115,37,107,64,38,112,56,41,41,57,105,53,95,54,48,54,108,119,64,110,103,48,98,102,111,118,103,61,113,61,42,53,113,111,64,57,64,53,117,53,122,50,119,50,40,93,37,114,110,115,44,116,33,64,115,100,57,51,55,114,116,41,112,54,91,37,57,59,45,55,0,0,0,0,0,0,0,0,104,117,116,103,110,48,50,108,0,0,0,0,0,0,0,0,36,113,97,113,99,52,118,38,114,106,95,119,49,40,40,43,98,104,118,59,122,45,64,100,104,50,53,115,112,115,111,48,50,33,122,35,37,107,104,52,52,61,50,111,41,114,112,103,112,44,116,118,111,117,109,101,97,107,98,43,38,107,35,97,59,50,117,116,95,37,91,106,44,117,117,98,57,105,45,103,48,115,100,56,105,0,0,0,101,55,52,50,105,53,59,108,59,51,114,103,64,45,0,0,93,37,106,57,99,33,115,120,64,113,55,49,117,52,59,37,99,55,48,101,50,101,105,104,51,106,38,99,57,40,107,45,35,46,95,121,55,120,111,54,38,49,53,117,52,108,54,52,0,0,0,0,0,0,0,0,99,91,121,102,37,54,111,110,105,119,37,103,93,109,102,103,54,107,56,103,95,95,42,91,105,93,105,105,117,116,49,115,42,114,50,35,109,122,103,51,50,42,109,113,107,95,50,107,44,101,54,122,117,41,98,120,121,105,105,106,50,97,98,48,55,98,115,117,93,35,100,113,101,50,120,56,59,113,106,61,48,52,64,122,33,93,35,117,56,43,0,0,0,0,0,0,111,101,100,44,99,36,118,61,44,117,95,52,121,38,104,93,104,108,64,108,104,56,120,110,51,43,98,38,57,55,53,93,98,101,56,111,52,117,122,59,57,103,122,51,33,116,46,109,112,49,108,112,119,119,42,119,44,116,105,33,117,37,0,0,52,112,44,54,33,55,57,120,122,53,101,38,43,113,33,43,120,116,53,49,49,54,108,104,42,44,108,120,111,113,114,46,59,104,95,33,122,48,108,52,122,98,104,109,48,41,91,116,0,0,0,0,0,0,0,0,110,59,117,97,50,38,118,99,45,35,101,33,45,108,91,106,119,109,109,122,56,107,111,64,56,51,55,41,33,49,111,55,100,107,57,101,100,103,103,118,0,0,0,0,0,0,0,0,111,48,51,56,111,102,54,95,54,46,46,99,91,115,48,41,113,49,115,119,113,91,56,99,36,106,33,112,61,53,111,109,107,101,40,54,115,120,50,99,105,40,112,111,102,97,115,57,103,44,95,118,52,49,61,121,50,105,106,93,101,100,52,35,55,61,57,103,112,93,106,56,55,49,52,40,35,97,110,100,107,122,115,108,36,53,45,0,95,120,49,37,106,114,55,59,38,118,113,101,118,102,45,103,107,37,106,103,53,106,99,36,45,120,51,54,97,110,104,111,42,110,121,111,102,38,46,57,51,99,59,122,36,98,117,43,35,57,106,45,52,105,122,111,50,122,104,33,107,41,105,116,95,109,108,95,91,61,114,51,0,0,0,0,0,0,0,0,55,122,115,49,105,118,107,112,52,33,116,104,104,40,45,109,48,52,50,42,121,36,95,59,53,99,93,44,121,101,102,103,117,41,44,113,114,42,36,120,55,45,117,33,0,0,0,0,119,104,42,44,46,54,48,35,113,98,44,112,40,46,91,110,35,33,109,101,114,112,119,41,106,56,50,64,105,53,112,98,91,103,51,93,95,46,99,121,0,0,0,0,0,0,0,0,61,108,95,53,99,93,97,61,54,109,108,121,115,110,44,120,114,113,95,53,101,52,116,99,111,102,120,59,41,53,119,106,53,99,117,99,122,42,115,48,110,33,38,99,110,104,61,95,121,55,38,50,119,53,100,110,54,51,42,116,59,107,36,118,54,118,93,105,95,98,33,38,116,49,110,97,46,93,118,44,112,119,33,101,118,49,0,0,109,117,59,105,99,102,54,121,121,104,100,98,54,48,95,105,122,38,54,120,37,48,54,103,101,106,50,61,54,121,0,0,121,119,95,37,42,122,122,44,43,42,36,40,41,98,42,37,119,105,91,115,55,118,91,37,49,106,120,108,99,105,33,48,53,121,102,43,106,44,93,111,55,120,105,98,37,43,114,45,110,44,49,114,114,108,114,93,116,108,117,51,35,48,98,120,40,104,122,59,98,53,41,54,118,107,120,45,108,120,113,101,42,93,103,122,44,44,121,110,41,116,43,44,102,113,0,0,55,93,33,121,95,55,37,101,57,55,95,107,56,107,57,101,48,115,119,64,95,45,56,95,105,104,103,111,120,42,98,59,33,114,91,55,51,97,121,45,110,36,44,45,120,59,118,51,112,118,36,43,40,51,116,0,61,49,107,46,108,56,36,36,115,102,99,98,52,61,104,52,40,44,50,113,113,36,46,35,51,98,122,61,61,106,44,98,98,117,36,97,59,101,38,33,117,57,101,99,108,42,61,113,100,114,59,33,35,106,0,0,57,98,105,106,114,44,119,119,114,53,112,57,59,120,115,98,114,59,50,54,109,40,44,57,49,110,56,41,109,91,117,43,117,107,44,50,35,102,38,116,109,45,102,106,95,112,118,102,61,53,46,115,41,103,37,106,107,110,106,111,40,110,95,95,108,0,0,0,0,0,0,0,61,111,61,33,41,42,61,40,33,110,61,95,107,43,108,106,59,33,102,35,41,56,109,114,38,49,107,102,121,41,49,49,122,44,37,112,119,118,37,43,57,37,45,53,101,95,46,93,45,37,45,93,33,56,49,99,51,49,115,102,119,108,35,101,55,59,107,119,99,0,0,0,55,55,95,106,44,103,49,56,49,61,61,35,104,108,50,52,55,116,93,41,0,0,0,0,51,91,33,107,51,116,33,37,100,105,114,36,111,106,56,36,98,109,110,37,41,46,98,102,46,64,101,102,54,102,118,38,120,110,37,61,114,33,121,108,116,52,109,112,42,36,99,64,118,54,52,100,99,64,45,53,37,110,46,111,91,36,112,112,98,64,48,102,56,95,57,109,114,99,41,51,102,122,36,56,117,91,57,122,43,42,54,48,61,122,52,122,0,0,0,0,97,122,102,102,91,55,106,0,50,99,95,111,106,44,33,46,57,48,59,37,61,54,49,112,93,107,107,49,93,95,37,53,117,97,55,111,109,57,118,93,61,0,0,0,0,0,0,0,106,121,100,43,120,106,98,38,59,44,115,106,35,99,109,121,102,51,111,119,101,110,117,107,42,115,120,51,56,46,50,98,107,53,118,97,93,38,115,44,109,61,116,111,98,95,107,50,104,108,113,112,97,118,108,42,93,118,112,53,99,105,108,105,41,61,91,101,51,37,54,35,118,91,103,54,118,113,57,41,109,56,48,121,48,103,46,55,101,112,0,0,0,0,0,0,45,57,35,122,43,109,61,111,43,106,122,44,110,122,49,100,42,97,97,110,49,57,36,53,42,64,44,46,45,98,33,54,112,114,44,107,35,61,93,46,51,35,37,101,45,40,52,95,42,115,52,97,44,35,42,101,110,95,118,105,116,54,109,56,93,114,110,42,122,120,41,93,46,49,110,64,40,49,104,41,44,98,45,121,51,48,48,38,111,117,114,121,104,113,0,0,57,108,49,97,117,106,119,109,55,50,122,40,48,35,51,48,0,0,0,0,0,0,0,0,121,98,55,95,102,102,40,41,122,59,97,119,49,101,43,91,41,0,0,0,0,0,0,0,119,42,55,91,33,49,91,36,56,101,99,50,114,102,117,42,102,121,109,35,118,116,0,0,40,119,97,45,51,91,106,40,42,38,54,42,91,38,109,119,111,52,95,46,101,119,45,38,93,36,106,50,113,59,105,40,33,51,56,97,53,120,48,42,51,118,112,53,40,55,64,54,121,113,119,115,122,41,107,112,59,112,0,0,0,0,0,0,115,37,113,111,104,64,115,48,46,59,51,52,37,50,45,46,52,52,105,55,114,59,98,42,108,114,122,57,108,119,115,50,114,57,44,56,53,112,100,52,119,54,51,42,117,119,99,113,91,104,118,43,111,107,110,42,106,45,38,119,99,50,46,35,111,105,61,41,116,99,115,93,41,51,52,52,117,61,91,104,93,43,38,110,0,0,0,0,114,52,50,49,116,113,33,53,120,98,108,116,98,48,33,108,115,121,100,56,55,100,53,122,122,100,41,51,56,55,42,109,64,54,40,91,120,44,115,113,98,93,55,100,99,107,36,104,93,52,44,102,105,35,118,112,109,103,49,37,100,93,111,45,95,41,56,49,106,115,45,46,56,37,54,112,57,109,59,121,41,41,117,36,44,105,107,36,109,0,0,0,0,0,0,0,52,121,102,50,112,91,99,59,106,91,91,107,38,43,57,50,53,113,37,49,110,114,56,113,101,101,118,115,95,33,98,56,111,119,117,120,101,121,119,48,113,61,40,40,122,64,104,112,50,52,116,117,102,121,104,110,54,36,106,93,40,117,51,0,98,117,102,102,101,114,95,105,115,95,101,113,117,97,108,40,116,97,103,44,32,103,111,97,108,95,98,117,102,102,101,114,41,0,0,0,0,0,0,0,99,104,101,99,107,95,116,97,103,0,0,0,0,0,0,0,112,97,115,115,119,111,114,100,0,0,0,0,0,0,0,0,115,97,108,116,0,0,0,0,49,50,48,102,98,54,99,102,102,99,102,56,98,51,50,99,52,51,101,55,50,50,53,50,53,54,99,52,102,56,51,55,97,56,54,53,52,56,99,57,50,99,99,99,51,53,52,56,48,56,48,53,57,56,55,99,98,55,48,98,101,49,55,98,0,0,0,0,0,0,0,0,97,101,52,100,48,99,57,53,97,102,54,98,52,54,100,51,50,100,48,97,100,102,102,57,50,56,102,48,54,100,100,48,50,97,51,48,51,102,56,101,102,51,99,50,53,49,100,102,100,54,101,50,100,56,53,97,57,53,52,55,52,99,52,51,0,0,0,0,0,0,0,0,99,53,101,52,55,56,100,53,57,50,56,56,99,56,52,49,97,97,53,51,48,100,98,54,56,52,53,99,52,99,56,100,57,54,50,56,57,51,97,48,48,49,99,101,52,101,49,49,97,52,57,54,51,56,55,51,97,97,57,56,49,51,52,97,0,0,0,0,0,0,0,0,56,102,99,50,98,99,102,102,98,98,52,98,49,97,99,57,98,57,100,101,48,51,53,56,56,100,51,57,48,102,51,100,57,98,102,51,51,54,99,50,99,52,52,50,50,99,57,48,99,49,53,56,99,99,55,49,52,50,50,53,102,54,50,57,0,0,0,0,0,0,0,0,84,111,111,107,32,37,100,32,109,115,44,32,37,100,32,114,111,117,110,100,115,47,109,115,10,0,0,0,0,0,0,0,112,97,115,115,119,111,114,100,80,65,83,83,87,79,82,68,112,97,115,115,119,111,114,100,0,0,0,0,0,0,0,0,115,97,108,116,83,65,76,84,115,97,108,116,83,65,76,84,115,97,108,116,83,65,76,84,115,97,108,116,83,65,76,84,115,97,108,116,0,0,0,0,51,52,56,99,56,57,100,98,99,98,100,51,50,98,50,102,51,50,100,56,49,52,98,56,49,49,54,101,56,52,99,102,50,98,49,55,51,52,55,101,98,99,49,56,48,48,49,56,49,99,52,101,50,97,49,102,98,56,100,100,53,51,101,49,99,54,51,53,53,49,56,99,55,100,97,99,52,55,101,57,0,0,0,0,0,0,0,0,112,97,115,115,0,119,111,114,100,0,0,0,0,0,0,0,115,97,0,108,116,0,0,0,56,57,98,54,57,100,48,53,49,54,102,56,50,57,56,57,51,99,54,57,54,50,50,54,54,53,48,97,56,54,56,55,0,0,0,0,0,0,0,0,80,97,115,115,119,111,114,100,0,0,0,0,0,0,0,0,83,97,108,116,0,0,0,0,102,100,49,100,99,49,98,57,53,54,57,50,52,57,99,97,97,53,51,100,51,52,56,57,53,50,54,98,99,52,101,97,102,102,48,101,98,56,100,52,56,56,49,51,56,97,49,53,54,49,102,53,48,98,57,102,97,99,97,53,99,101,102,100,0,0,0,0,0,0,0,0,115,116,114,99,109,112,40,112,98,107,100,102,95,115,105,109,112,108,101,40,34,80,97,115,115,119,111,114,100,34,44,32,34,83,97,108,116,34,44,32,48,44,32,49,48,48,48,41,44,32,34,102,100,49,100,99,49,98,57,53,54,57,50,52,57,99,97,97,53,51,100,51,52,56,57,53,50,54,98,99,52,101,97,102,102,48,101,98,56,100,52,56,56,49,51,56,97,49,53,54,49,102,53,48,98,57,102,97,99,97,53,99,101,102,100,34,41,32,61,61,32,48,0,0,0,0,0,0,99,47,116,101,115,116,47,112,98,107,100,102,46,99,0,0,116,101,115,116,95,112,98,107,100,102,0,0,0,0,0,0,53,48,54,49,55,51,55,51,55,55,54,102,55,50,54,52,0,0,0,0,0,0,0,0,53,51,54,49,54,99,55,52,0,0,0,0,0,0,0,0,115,116,114,99,109,112,40,112,98,107,100,102,95,115,105,109,112,108,101,95,104,101,120,40,34,53,48,54,49,55,51,55,51,55,55,54,102,55,50,54,52,34,44,32,34,53,51,54,49,54,99,55,52,34,44,32,48,44,32,49,48,48,48,41,44,32,34,102,100,49,100,99,49,98,57,53,54,57,50,52,57,99,97,97,53,51,100,51,52,56,57,53,50,54,98,99,52,101,97,102,102,48,101,98,56,100,52,56,56,49,51,56,97,49,53,54,49,102,53,48,98,57,102,97,99,97,53,99,101,102,100,34,41,32,61,61,32,48,0,0,0,0,0,0,112,98,107,100,102,58,32,79,75,33,0,0,0,0,0,0,98,117,102,102,101,114,95,105,115,95,101,113,117,97,108,40,102,105,110,97,108,95,107,101,121,44,32,103,111,97,108,95,98,117,102,102,101,114,41,0,99,104,101,99,107,95,112,98,107,100,102,0,0,0,0,0,96,90,0,0,104,90,0,0,112,90,0,0,120,90,0,0,128,90,0,0,136,90,0,0,144,90,0,0,152,90,0,0,160,90,0,0,176,90,0,0,192,90,0,0,208,90,0,0,224,90,0,0,240,90,0,0,0,91,0,0,16,91,0,0,32,91,0,0,56,91,0,0,80,91,0,0,104,91,0,0,128,91,0,0,152,91,0,0,176,91,0,0,200,91,0,0,224,91,0,0,0,92,0,0,32,92,0,0,64,92,0,0,96,92,0,0,128,92,0,0,160,92,0,0,192,92,0,0,224,92,0,0,8,93,0,0,48,93,0,0,88,93,0,0,128,93,0,0,168,93,0,0,208,93,0,0,248,93,0,0,32,94,0,0,80,94,0,0,128,94,0,0,176,94,0,0,224,94,0,0,16,95,0,0,64,95,0,0,112,95,0,0,160,95,0,0,216,95,0,0,16,96,0,0,72,96,0,0,128,96,0,0,184,96,0,0,240,96,0,0,40,97,0,0,96,97,0,0,160,97,0,0,224,97,0,0,32,98,0,0,96,98,0,0,160,98,0,0,224,98,0,0,32,99,0,0,96,99,0,0,168,99,0,0,240,99,0,0,56,100,0,0,128,100,0,0,200,100,0,0,16,101,0,0,88,101,0,0,160,101,0,0,240,101,0,0,64,102,0,0,144,102,0,0,224,102,0,0,48,103,0,0,128,103,0,0,208,103,0,0,32,104,0,0,120,104,0,0,208,104,0,0,40,105,0,0,128,105,0,0,216,105,0,0,48,106,0,0,136,106,0,0,224,106,0,0,64,107,0,0,160,107,0,0,0,108,0,0,96,108,0,0,192,108,0,0,32,109,0,0,128,109,0,0,224,109,0,0,72,110,0,0,176,110,0,0,24,111,0,0,64,62,0,0,136,62,0,0,208,62,0,0,24,63,0,0,96,63,0,0,168,63,0,0,240,63,0,0,56,64,0,0,128,64,0,0,200,64,0,0,16,65,0,0,88,65,0,0,160,65,0,0,232,65,0,0,48,66,0,0,120,66,0,0,192,66,0,0,8,67,0,0,80,67,0,0,152,67,0,0,224,67,0,0,40,68,0,0,112,68,0,0,184,68,0,0,0,69,0,0,72,69,0,0,144,69,0,0,216,69,0,0,32,70,0,0,104,70,0,0,176,70,0,0,248,70,0,0,64,71,0,0,136,71,0,0,208,71,0,0,24,72,0,0,96,72,0,0,168,72,0,0,240,72,0,0,56,73,0,0,128,73,0,0,200,73,0,0,16,74,0,0,88,74,0,0,160,74,0,0,232,74,0,0,48,75,0,0,120,75,0,0,192,75,0,0,8,76,0,0,80,76,0,0,152,76,0,0,224,76,0,0,40,77,0,0,112,77,0,0,184,77,0,0,0,78,0,0,72,78,0,0,144,78,0,0,216,78,0,0,32,79,0,0,104,79,0,0,176,79,0,0,248,79,0,0,64,80,0,0,136,80,0,0,208,80,0,0,24,81,0,0,96,81,0,0,168,81,0,0,240,81,0,0,56,82,0,0,128,82,0,0,200,82,0,0,16,83,0,0,88,83,0,0,160,83,0,0,232,83,0,0,48,84,0,0,120,84,0,0,192,84,0,0,8,85,0,0,80,85,0,0,152,85,0,0,224,85,0,0,40,86,0,0,112,86,0,0,184,86,0,0,0,87,0,0,72,87,0,0,144,87,0,0,216,87,0,0,32,88,0,0,104,88,0,0,176,88,0,0,248,88,0,0,64,89,0,0,136,89,0,0,208,89,0,0,24,90,0,0,72,101,108,108,111,0,0,0,49,56,53,102,56,100,98,51,50,50,55,49,102,101,50,53,102,53,54,49,97,54,102,99,57,51,56,98,50,101,50,54,52,51,48,54,101,99,51,48,52,101,100,97,53,49,56,48,48,55,100,49,55,54,52,56,50,54,51,56,49,57,54,57,0,0,0,0,0,0,0,0,115,116,114,99,109,112,40,115,104,97,95,115,105,109,112,108,101,40,34,72,101,108,108,111,34,41,44,32,34,49,56,53,102,56,100,98,51,50,50,55,49,102,101,50,53,102,53,54,49,97,54,102,99,57,51,56,98,50,101,50,54,52,51,48,54,101,99,51,48,52,101,100,97,53,49,56,48,48,55,100,49,55,54,52,56,50,54,51,56,49,57,54,57,34,41,32,61,61,32,48,0,0,0,0,99,47,116,101,115,116,47,115,104,97,46,99,0,0,0,0,116,101,115,116,95,115,104,97,0,0,0,0,0,0,0,0,52,56,54,53,54,67,54,99,54,102,0,0,0,0,0,0,115,116,114,99,109,112,40,115,104,97,95,115,105,109,112,108,101,95,104,101,120,40,34,52,56,54,53,54,67,54,99,54,102,34,41,44,32,34,49,56,53,102,56,100,98,51,50,50,55,49,102,101,50,53,102,53,54,49,97,54,102,99,57,51,56,98,50,101,50,54,52,51,48,54,101,99,51,48,52,101,100,97,53,49,56,48,48,55,100,49,55,54,52,56,50,54,51,56,49,57,54,57,34,41,32,61,61,32,48,0,0,0,115,104,97,58,32,79,75,33,0,0,0,0,0,0,0,0,101,51,98,48,99,52,52,50,57,56,102,99,49,99,49,52,57,97,102,98,102,52,99,56,57,57,54,102,98,57,50,52,50,55,97,101,52,49,101,52,54,52,57,98,57,51,52,99,97,52,57,53,57,57,49,98,55,56,53,50,98,56,53,53,0,0,0,0,0,0,0,0,49,56,97,99,51,101,55,51,52,51,102,48,49,54,56,57,48,99,53,49,48,101,57,51,102,57,51,53,50,54,49,49,54,57,100,57,101,51,102,53,54,53,52,51,54,52,50,57,56,51,48,102,97,102,48,57,51,52,102,52,102,56,101,52,0,0,0,0,0,0,0,0,57,54,56,53,99,56,49,98,55,54,97,99,99,99,53,48,54,57,52,57,48,57,97,101,100,55,56,102,97,54,52,97,52,99,102,97,49,52,97,57,50,99,50,102,51,52,55,55,56,53,101,102,48,54,98,55,56,52,48,56,49,53,97,55,0,0,0,0,0,0,0,0,51,51,50,99,49,52,49,97,55,54,56,102,52,102,53,100,99,53,101,98,97,51,56,55,98,54,54,53,98,100,53,57,100,51,54,54,97,55,97,57,54,102,52,101,101,97,99,53,55,53,98,52,101,50,52,50,99,102,102,54,49,49,102,49,0,0,0,0,0,0,0,0,97,98,57,52,50,100,102,51,55,50,53,101,50,56,56,101,98,53,48,52,56,52,51,54,56,50,57,51,49,49,56,97,57,99,98,52,100,57,52,50,54,102,102,100,101,56,50,55,100,54,52,102,98,48,49,57,48,52,53,99,100,48,97,56,0,0,0,0,0,0,0,0,51,100,56,100,97,52,101,97,49,98,50,102,49,48,57,49,100,55,48,57,99,52,98,48,54,49,49,55,100,53,99,53,51,52,55,98,102,101,98,97,54,53,99,52,52,52,57,99,48,56,57,102,52,98,97,98,99,48,53,50,100,101,97,102,0,0,0,0,0,0,0,0,57,55,101,53,56,100,52,101,56,51,53,56,50,52,57,52,50,55,100,52,51,48,98,49,102,52,54,49,53,50,53,102,49,57,55,102,102,51,57,48,101,98,52,55,57,56,101,98,55,54,97,97,102,102,97,99,48,54,55,97,50,50,52,101,0,0,0,0,0,0,0,0,52,48,52,51,98,100,102,51,97,98,54,49,50,97,98,51,99,102,53,50,102,52,48,50,101,99,48,101,98,49,99,52,51,101,99,50,49,57,56,52,54,101,55,51,51,50,55,51,54,54,97,99,50,48,97,48,49,57,49,56,48,48,57,52,0,0,0,0,0,0,0,0,100,49,97,51,56,54,55,48,99,102,49,54,54,53,54,49,57,50,101,102,55,52,48,52,102,51,54,54,55,57,53,97,97,99,53,49,98,55,53,99,56,49,99,50,49,53,102,97,57,50,101,101,98,102,50,56,55,101,54,99,51,101,98,98,0,0,0,0,0,0,0,0,102,55,99,98,49,51,56,98,50,55,53,101,57,48,97,100,99,55,102,99,48,49,99,57,55,101,100,48,49,102,99,53,48,48,53,56,100,53,99,101,54,52,54,51,51,52,98,53,56,101,57,49,99,57,99,53,50,52,101,101,102,56,101,98,0,0,0,0,0,0,0,0,98,52,57,100,52,97,53,99,49,51,50,98,49,97,55,97,52,101,102,56,49,99,51,49,101,51,52,48,101,50,101,98,54,98,56,97,49,48,54,51,102,54,102,100,53,101,49,53,98,53,53,101,48,53,97,99,97,51,49,48,49,51,53,99,0,0,0,0,0,0,0,0,98,49,54,54,57,100,99,98,101,56,53,99,97,55,102,53,100,101,55,97,50,55,100,52,98,97,55,50,49,100,49,54,98,51,55,55,101,101,50,53,57,101,52,52,102,100,55,49,56,54,101,102,97,54,49,57,100,48,48,48,54,98,99,56,0,0,0,0,0,0,0,0,98,49,102,98,49,49,54,48,48,100,98,56,102,98,48,51,99,48,97,57,97,51,56,52,97,52,54,54,52,48,102,53,52,56,57,57,101,100,98,100,53,49,57,48,100,57,97,51,54,55,50,54,100,98,51,48,100,101,98,50,56,52,53,56,0,0,0,0,0,0,0,0,48,55,57,100,57,55,50,49,49,100,52,49,57,52,51,49,50,51,99,50,52,101,48,53,99,48,100,56,50,48,48,50,52,51,48,100,101,49,50,99,101,101,52,100,101,53,52,51,53,54,98,101,55,100,56,102,101,48,101,48,98,50,102,99,0,0,0,0,0,0,0,0,51,50,51,51,52,99,100,101,100,99,56,53,97,49,52,52,49,51,51,55,51,49,100,97,49,54,102,48,57,56,54,56,54,97,57,52,51,98,98,51,49,52,52,57,52,101,98,50,49,51,54,50,57,48,53,51,99,48,49,54,55,56,55,99,0,0,0,0,0,0,0,0,101,98,102,98,98,98,49,55,51,102,51,102,54,51,50,51,55,50,52,99,49,52,51,100,100,50,48,55,51,97,53,101,97,55,51,100,101,102,54,48,54,53,51,48,101,56,50,53,99,57,57,97,101,102,54,55,100,51,97,99,52,55,55,52,0,0,0,0,0,0,0,0,102,97,55,52,101,102,99,57,100,49,100,57,98,97,49,53,54,55,52,102,53,100,99,48,57,99,50,57,98,102,53,50,52,48,100,51,99,49,49,99,54,50,101,49,99,54,101,100,100,55,97,51,57,57,97,48,51,53,56,49,102,53,57,51,0,0,0,0,0,0,0,0,97,57,57,50,53,49,100,99,57,57,53,99,52,57,98,101,102,99,50,99,56,99,51,102,101,99,100,56,99,102,54,52,99,49,53,98,98,53,49,56,101,52,55,48,52,53,51,53,100,48,55,57,50,51,48,49,98,55,54,102,51,102,52,99,0,0,0,0,0,0,0,0,101,98,55,99,54,52,54,50,100,54,48,51,56,52,53,50,50,101,100,100,53,51,97,52,49,48,54,101,99,102,56,101,56,55,51,56,101,56,54,48,49,55,48,101,50,49,102,52,51,52,97,100,100,50,98,50,51,97,97,101,97,49,99,49,0,0,0,0,0,0,0,0,50,54,100,48,48,53,57,99,50,57,102,99,50,50,49,51,57,48,98,51,100,56,100,53,54,100,98,56,56,53,55,53,55,57,102,55,54,99,51,100,48,48,97,99,50,98,98,51,50,100,97,101,49,50,57,50,97,102,54,50,52,99,102,55,0,0,0,0,0,0,0,0,49,99,54,56,52,56,50,100,97,56,54,56,98,53,53,53,49,56,54,48,102,102,101,57,101,53,48,55,98,50,54,54,53,50,101,57,51,102,49,101,52,55,54,102,97,50,51,97,51,55,98,55,53,102,51,51,50,99,51,54,100,54,57,55,0,0,0,0,0,0,0,0,98,55,53,98,57,57,50,49,52,102,55,100,51,100,98,97,51,99,97,48,50,51,53,56,53,101,57,97,102,48,52,48,52,97,97,55,48,50,100,99,97,56,55,56,51,50,48,102,102,48,53,98,53,98,52,55,52,101,99,98,101,57,53,52,0,0,0,0,0,0,0,0,56,102,50,52,56,98,51,57,49,50,55,53,98,54,55,99,53,98,52,57,49,97,53,98,102,55,97,57,57,99,50,98,54,57,50,98,100,53,48,49,57,51,97,101,55,54,98,50,48,48,99,100,48,52,56,48,53,102,50,102,100,101,54,51,0,0,0,0,0,0,0,0,101,97,53,56,52,56,53,101,49,50,54,48,52,51,52,51,55,102,102,57,56,102,50,102,55,97,50,49,53,100,54,97,57,102,50,49,57,101,55,102,50,51,98,54,56,52,100,99,50,49,50,50,49,99,51,102,57,52,53,50,49,52,100,101,0,0,0,0,0,0,0,0,102,101,99,52,51,56,49,54,101,54,102,51,97,102,100,98,97,49,52,101,48,101,55,56,53,56,101,98,49,55,102,51,53,48,53,97,101,56,48,50,97,102,54,99,51,101,102,49,100,101,101,97,97,98,49,98,50,100,50,102,97,54,52,54,0,0,0,0,0,0,0,0,97,100,101,57,50,52,97,55,99,102,98,99,54,98,98,49,101,99,53,100,100,98,51,57,97,100,53,98,56,54,52,49,55,99,98,52,52,49,54,102,53,54,51,56,53,102,102,56,48,55,51,53,97,57,101,56,98,54,57,51,102,56,49,57,0,0,0,0,0,0,0,0,49,55,51,54,51,56,48,57,53,50,57,100,53,55,50,49,101,53,48,100,53,50,101,50,53,97,49,102,97,56,99,52,56,101,99,102,98,56,53,50,51,50,54,51,101,53,98,100,54,50,102,57,49,54,57,51,53,56,49,100,48,97,50,99,0,0,0,0,0,0,0,0,52,49,97,56,102,102,55,100,52,50,98,101,100,99,55,102,54,98,53,50,48,97,57,53,102,100,51,98,49,102,53,53,97,48,53,98,53,53,56,97,52,49,48,49,53,54,51,53,98,98,49,99,56,48,52,52,98,57,57,99,97,97,102,102,0,0,0,0,0,0,0,0,100,57,52,97,51,55,100,54,48,100,56,101,101,98,57,100,99,51,54,98,55,55,99,55,53,51,57,54,99,55,50,55,53,99,49,97,98,55,49,55,52,49,56,53,99,97,57,100,53,49,97,97,50,52,56,55,53,56,102,56,53,53,98,97,0,0,0,0,0,0,0,0,48,102,49,49,53,48,56,101,51,54,51,53,57,101,97,99,49,51,48,98,98,102,100,101,54,51,97,52,98,54,101,98,99,51,52,55,53,50,97,98,49,101,100,55,56,97,57,102,49,54,48,101,52,53,102,51,57,99,54,55,98,48,48,49,0,0,0,0,0,0,0,0,100,98,51,51,100,49,52,53,99,51,99,55,51,48,97,48,99,53,102,50,56,100,100,50,48,98,56,100,49,50,53,97,101,49,54,101,49,101,49,50,55,98,98,56,97,99,56,48,55,99,49,50,55,102,53,55,100,99,48,48,52,48,99,100,0,0,0,0,0,0,0,0,99,99,56,51,55,55,56,98,100,52,51,51,54,98,54,50,101,57,99,99,97,50,56,50,48,102,55,53,97,97,52,53,55,53,49,57,55,48,102,52,100,49,50,53,102,53,49,97,52,56,55,100,57,50,50,52,53,97,102,57,55,52,102,102,0,0,0,0,0,0,0,0,98,50,56,48,53,54,49,102,55,56,54,97,51,50,57,101,55,53,54,48,54,101,49,100,99,53,97,49,101,49,97,99,57,51,99,49,52,98,49,99,100,98,102,55,98,50,56,99,54,55,51,57,53,50,50,97,53,55,97,57,56,99,98,48,0,0,0,0,0,0,0,0,52,49,98,57,102,53,100,51,56,52,57,54,101,101,51,51,100,100,99,57,57,97,99,50,52,48,101,97,53,49,53,48,55,55,52,97,48,51,101,101,52,48,48,56,48,100,49,48,51,97,50,55,48,97,99,52,56,52,53,50,57,51,97,55,0,0,0,0,0,0,0,0,48,56,52,101,51,100,53,49,98,50,50,51,54,52,101,55,50,51,101,101,49,48,51,48,97,50,54,53,55,53,54,102,99,49,53,55,101,57,100,100,48,55,50,53,97,98,53,102,99,54,55,52,51,51,52,102,57,55,102,98,48,50,100,57,0,0,0,0,0,0,0,0,54,98,97,48,99,52,98,55,49,51,49,98,48,52,55,100,98,97,57,100,99,51,51,50,53,54,49,55,53,56,97,55,98,52,56,49,53,52,57,56,100,56,99,97,54,48,48,50,54,56,100,54,99,56,98,102,53,98,99,97,56,57,97,102,0,0,0,0,0,0,0,0,55,49,102,49,50,98,48,49,97,50,97,57,101,57,54,98,52,52,57,49,98,97,97,98,101,48,55,99,53,101,54,50,54,51,56,51,101,99,50,55,57,98,52,56,54,100,49,97,56,50,99,51,49,50,98,97,57,48,99,54,102,57,54,49,0,0,0,0,0,0,0,0,48,49,53,57,99,52,50,102,52,102,97,52,97,48,99,98,52,50,101,49,54,98,54,101,50,57,51,97,102,54,99,50,100,52,49,54,49,49,49,97,53,100,101,98,51,52,101,54,100,99,98,53,100,52,97,55,98,102,56,50,51,52,57,52,0,0,0,0,0,0,0,0,50,56,101,97,54,97,48,97,49,48,102,102,51,51,100,52,100,57,53,97,57,57,100,100,53,100,49,52,57,97,54,48,98,101,50,98,99,53,98,98,55,55,49,97,50,56,101,100,55,48,50,97,100,51,100,53,48,48,54,48,55,97,48,56,0,0,0,0,0,0,0,0,102,51,55,48,55,55,57,52,98,99,50,55,57,102,54,52,49,55,99,101,97,56,48,48,49,51,57,53,57,48,101,51,97,101,52,102,55,57,101,49,99,54,57,52,102,54,52,98,98,99,51,98,49,52,54,55,49,101,50,99,55,49,55,57,0,0,0,0,0,0,0,0,50,52,98,48,49,54,50,99,100,98,100,50,98,99,98,101,51,100,49,53,55,48,97,57,56,50,56,50,49,101,99,102,99,56,102,98,55,99,56,99,57,48,52,49,49,101,55,101,56,51,102,49,56,100,97,50,50,102,54,57,100,98,57,100,0,0,0,0,0,0,0,0,99,51,102,51,51,97,50,51,50,97,99,99,54,101,52,101,98,99,56,100,101,97,53,99,98,97,48,50,49,50,48,55,97,51,97,51,51,57,57,51,53,48,52,53,57,99,50,102,52,98,102,102,53,50,56,56,56,56,55,97,52,101,52,52,0,0,0,0,0,0,0,0,98,50,50,48,53,53,52,101,51,97,101,51,99,52,51,102,102,100,52,98,56,51,54,51,48,52,49,99,57,97,100,53,57,98,56,55,97,57,53,56,54,97,97,56,51,101,97,50,101,57,101,51,99,97,55,52,56,49,102,55,49,100,101,54,0,0,0,0,0,0,0,0,99,101,100,100,53,99,98,57,54,53,56,50,98,52,56,102,53,57,97,98,52,57,53,51,52,50,53,102,101,52,53,54,53,51,54,97,100,55,55,100,57,48,100,49,50,56,56,51,56,100,50,99,53,100,50,51,101,50,53,98,97,53,102,102,0,0,0,0,0,0,0,0,52,54,53,52,57,97,49,101,54,100,55,49,51,48,100,51,51,101,99,97,99,98,50,48,49,100,102,99,98,51,97,102,50,97,49,100,51,55,55,101,49,50,52,97,102,50,50,100,55,48,100,50,101,55,100,102,102,98,48,49,55,49,48,97,0,0,0,0,0,0,0,0,100,55,54,51,102,100,102,55,97,102,98,53,99,49,57,54,52,99,56,100,98,97,56,53,99,52,97,51,99,99,48,49,53,49,48,51,54,101,100,97,102,100,55,53,51,57,99,102,54,50,52,52,50,53,57,99,53,97,101,98,101,48,101,53,0,0,0,0,0,0,0,0,50,56,56,98,57,56,97,100,98,55,53,51,102,49,51,100,54,54,56,53,98,51,51,53,48,53,54,98,56,51,102,100,101,49,100,99,54,57,48,52,100,99,102,99,100,54,102,56,99,53,50,97,56,57,53,49,52,49,50,55,98,57,102,50,0,0,0,0,0,0,0,0,102,54,102,98,54,99,52,48,99,52,57,99,97,102,97,99,55,52,102,55,101,51,55,49,49,52,49,48,49,51,102,48,52,101,102,102,49,97,54,50,53,48,102,54,56,98,50,100,97,49,53,101,100,49,53,57,53,99,54,100,102,53,50,52,0,0,0,0,0,0,0,0,55,54,100,51,101,51,49,49,97,48,48,52,102,53,51,51,101,56,98,53,48,52,50,53,54,48,98,48,57,56,97,98,99,56,55,99,97,102,55,97,101,48,54,98,97,53,48,99,50,55,48,99,97,57,100,100,56,57,56,54,101,54,48,50,0,0,0,0,0,0,0,0,98,98,98,100,100,100,52,57,97,56,97,100,49,99,52,48,97,99,52,50,100,57,100,53,54,55,56,53,53,57,57,99,99,101,56,102,101,55,50,102,48,50,97,49,56,101,100,56,53,51,54,56,55,55,50,99,51,49,53,52,99,97,98,53,0,0,0,0,0,0,0,0,48,48,99,48,53,100,102,49,50,100,53,99,48,53,50,50,99,57,55,102,51,102,50,53,48,52,98,52,50,99,98,102,48,50,54,57,50,102,54,53,97,49,98,55,101,102,51,99,51,50,53,53,50,54,101,50,50,53,101,54,100,56,57,53,0,0,0,0,0,0,0,0,49,50,100,53,53,54,102,57,102,55,98,57,99,102,54,99,98,53,55,54,100,55,50,51,97,97,100,50,54,102,50,102,53,98,50,99,48,98,99,101,50,48,51,100,100,98,55,102,50,50,55,50,99,97,51,102,53,99,55,55,56,56,57,50,0,0,0,0,0,0,0,0,53,53,53,102,102,53,97,101,54,48,50,50,49,49,54,49,52,100,48,53,56,100,97,100,49,99,50,57,100,100,52,100,56,100,98,54,48,100,50,100,97,52,99,56,51,97,54,48,100,57,49,102,97,51,97,57,50,52,49,48,48,100,55,100,0,0,0,0,0,0,0,0,53,97,52,49,98,56,52,53,54,49,98,100,53,102,51,49,51,102,98,54,57,98,99,51,99,51,99,53,54,53,53,53,52,100,54,97,100,97,98,100,99,51,48,56,97,56,102,51,56,54,97,53,55,50,49,52,57,50,102,48,52,53,97,48,0,0,0,0,0,0,0,0,101,57,51,97,52,51,54,99,55,56,52,102,99,48,50,52,49,101,56,50,55,53,50,99,51,54,56,50,49,99,51,102,53,100,51,49,55,55,48,49,100,100,101,100,54,57,53,55,53,99,98,49,98,99,49,97,97,97,51,56,98,54,53,50,0,0,0,0,0,0,0,0,50,54,97,101,51,100,52,50,51,100,100,55,51,49,57,55,53,98,97,50,97,57,100,98,97,99,99,55,100,101,97,49,55,52,48,101,51,101,98,50,57,54,102,49,50,102,53,98,97,99,48,54,55,100,97,53,102,49,51,53,54,50,97,55,0,0,0,0,0,0,0,0,48,100,100,48,52,102,98,54,101,48,49,53,55,98,55,102,53,102,56,57,52,51,51,98,99,101,102,51,48,51,99,52,98,49,48,51,53,51,102,49,56,99,99,52,49,54,98,57,101,54,100,53,51,50,102,100,57,57,97,55,99,55,50,102,0,0,0,0,0,0,0,0,50,97,98,102,48,101,52,102,99,48,102,51,53,51,50,99,54,50,51,98,52,49,49,48,51,57,55,56,51,49,102,51,100,54,98,49,101,51,57,54,51,56,97,56,100,49,53,49,56,97,53,53,56,101,50,57,99,50,51,99,48,52,97,53,0,0,0,0,0,0,0,0,49,56,48,97,56,99,100,53,52,51,98,56,50,55,49,98,53,51,55,99,102,101,54,49,48,99,48,53,54,54,101,50,48,99,100,56,55,50,57,102,57,55,57,101,97,52,55,97,99,52,99,54,54,50,48,48,101,97,98,56,97,48,101,99,0,0,0,0,0,0,0,0,54,50,99,54,98,99,100,51,50,102,56,100,102,51,54,101,57,52,102,55,55,48,49,100,100,99,100,50,49,55,97,97,53,48,51,56,102,52,57,102,98,53,48,50,50,51,100,52,52,52,51,97,102,100,52,55,101,50,49,56,54,100,99,54,0,0,0,0,0,0,0,0,100,54,57,49,50,52,55,98,57,51,50,56,48,101,99,51,53,55,57,49,48,49,56,55,53,54,50,51,57,51,51,98,53,102,99,98,55,56,101,98,101,54,49,57,57,48,53,99,48,102,57,98,57,50,99,48,102,98,101,52,101,49,54,57,0,0,0,0,0,0,0,0,49,50,99,99,53,48,49,56,100,100,101,54,50,48,50,55,101,99,101,101,56,48,54,49,49,54,98,97,99,101,53,50,49,50,100,54,101,100,49,48,50,51,97,101,49,99,57,50,49,53,51,97,97,48,102,97,97,51,97,56,50,102,49,99,0,0,0,0,0,0,0,0,55,48,49,99,102,50,49,56,97,56,49,54,54,57,48,99,99,54,100,97,102,100,100,50,55,102,57,49,51,55,48,101,97,102,97,52,99,56,100,49,100,51,48,52,49,53,100,55,100,56,100,48,57,100,102,49,99,54,55,48,56,51,102,52,0,0,0,0,0,0,0,0,57,98,53,50,48,48,102,57,52,54,97,100,99,51,56,100,99,98,100,54,48,97,57,102,54,98,53,102,102,54,54,53,101,102,50,52,98,97,51,50,52,100,54,51,48,53,57,48,101,53,55,101,98,51,97,101,53,101,52,98,97,52,49,97,0,0,0,0,0,0,0,0,102,53,101,53,50,57,51,100,102,52,97,102,50,55,100,54,48,49,56,97,51,57,100,54,102,54,100,99,99,52,51,100,102,54,97,98,48,98,50,57,57,102,53,102,49,53,98,49,50,99,102,98,55,55,99,48,101,100,53,98,49,55,52,98,0,0,0,0,0,0,0,0,102,54,54,48,99,55,97,52,57,55,52,98,57,57,51,56,52,99,100,55,50,48,102,50,52,102,57,55,49,101,52,48,55,100,51,55,48,49,55,55,97,54,98,54,49,50,101,102,100,100,56,97,100,100,97,54,50,100,53,48,50,99,54,55,0,0,0,0,0,0,0,0,54,48,52,50,98,57,56,51,50,52,100,50,50,49,101,100,49,102,54,48,54,52,56,98,55,51,48,49,99,55,101,55,53,51,50,52,52,102,57,53,49,100,56,99,55,49,50,97,101,101,53,49,100,99,55,54,98,97,57,57,51,50,48,48,0,0,0,0,0,0,0,0,52,51,49,57,48,48,101,52,53,99,98,99,102,102,100,51,97,49,49,98,57,50,53,99,54,98,48,51,97,102,97,98,48,100,51,56,50,50,57,51,52,102,51,102,52,99,100,98,97,50,56,56,99,101,53,55,101,54,99,56,51,99,100,52,0,0,0,0,0,0,0,0,101,49,101,99,49,53,55,48,49,97,98,55,49,52,102,49,48,51,52,57,99,48,49,48,97,53,54,49,53,101,53,50,48,50,98,49,54,98,51,100,97,48,51,98,53,57,50,56,56,56,53,54,100,48,99,102,98,99,100,100,98,98,55,53,0,0,0,0,0,0,0,0,54,49,52,52,48,98,55,97,48,97,53,54,57,53,97,50,53,97,54,57,53,50,98,98,50,98,48,100,57,101,98,102,101,52,101,57,49,98,50,57,49,49,54,99,51,51,49,54,52,48,53,50,49,55,100,50,53,51,51,56,48,102,102,54,0,0,0,0,0,0,0,0,57,54,97,102,53,97,55,51,53,97,101,56,52,99,97,101,100,97,98,54,50,48,53,97,49,101,100,100,101,100,101,50,51,53,100,57,54,51,100,97,53,101,55,99,53,55,100,97,100,52,54,52,50,98,52,56,54,101,54,55,54,57,50,54,0,0,0,0,0,0,0,0,102,49,51,54,101,54,56,50,54,99,54,99,56,100,57,55,101,51,53,101,50,48,102,100,99,53,100,102,102,50,98,99,97,101,52,98,48,98,54,54,98,97,53,98,102,57,49,101,102,54,51,52,97,98,99,56,55,50,57,100,100,102,50,50,0,0,0,0,0,0,0,0,52,52,100,57,49,48,53,48,50,98,97,102,49,51,101,100,97,102,48,101,54,97,101,55,54,48,98,97,99,48,57,55,53,52,102,49,57,57,98,53,51,101,48,48,48,52,99,51,55,48,50,53,51,97,57,56,102,55,52,99,49,54,51,51,0,0,0,0,0,0,0,0,100,98,48,48,98,51,51,54,98,50,48,48,53,57,97,56,52,57,99,54,97,52,55,52,97,56,97,97,53,99,56,101,49,97,54,52,48,54,100,100,48,55,51,100,101,100,100,97,102,100,52,55,98,98,55,97,50,48,101,51,53,98,57,52,0,0,0,0,0,0,0,0,50,53,57,50,97,52,98,49,53,55,49,100,49,49,51,48,49,49,100,102,54,55,56,51,49,52,100,50,56,52,48,56,48,97,99,97,102,54,57,57,97,102,56,56,53,50,52,55,52,50,49,53,56,50,52,55,100,48,101,50,98,49,57,99,0,0,0,0,0,0,0,0,54,53,51,49,57,56,100,56,100,49,101,100,55,99,100,55,97,48,100,98,53,102,48,50,101,98,50,102,55,51,57,51,97,53,99,98,54,54,51,97,50,55,51,50,48,54,55,56,51,55,56,57,48,50,57,101,50,52,97,56,97,99,56,99,0,0,0,0,0,0,0,0,102,50,50,53,48,52,50,53,57,56,50,56,52,49,51,50,55,97,49,101,52,98,49,53,57,51,55,48,52,54,102,57,98,48,97,55,57,52,98,56,102,52,97,54,54,98,53,100,99,99,56,56,53,99,102,99,102,101,99,101,55,55,99,49,0,0,0,0,0,0,0,0,101,99,49,50,50,53,56,56,100,101,99,56,49,48,53,54,98,102,57,102,57,51,56,49,55,51,56,97,52,49,55,97,53,51,100,101,53,101,50,51,97,55,57,48,48,56,51,97,97,97,57,57,53,102,101,100,50,51,100,97,50,52,50,51,0,0,0,0,0,0,0,0,98,56,57,102,53,102,55,57,98,56,101,98,55,57,100,50,101,102,53,98,99,51,51,102,53,56,52,99,98,53,49,55,55,49,102,56,97,52,55,49,53,53,56,53,53,97,54,57,101,97,101,56,48,97,57,51,97,52,54,55,51,49,54,102,0,0,0,0,0,0,0,0,52,50,52,100,56,53,101,52,100,101,50,48,99,101,102,101,101,48,49,57,53,51,50,98,57,98,51,54,100,52,49,100,52,55,48,99,97,99,51,51,99,100,54,52,97,102,102,55,100,99,102,48,49,56,57,50,51,57,98,54,57,99,99,99,0,0,0,0,0,0,0,0,51,49,99,56,55,102,54,50,55,100,100,51,51,52,57,101,52,97,54,53,102,101,98,97,98,52,97,100,56,52,99,56,102,57,48,51,97,49,54,52,49,97,97,50,55,56,52,101,55,55,52,97,99,55,56,53,97,101,102,52,50,48,99,99,0,0,0,0,0,0,0,0,54,55,101,57,55,52,101,101,48,51,98,51,97,102,55,54,55,56,97,102,53,52,97,102,48,55,49,48,102,49,54,54,55,56,98,97,52,50,56,102,55,53,51,56,49,98,53,57,100,49,99,100,57,57,98,53,101,56,98,49,53,50,52,54,0,0,0,0,0,0,0,0,98,100,48,57,53,53,102,102,57,48,52,52,100,100,48,97,52,56,48,101,98,100,49,57,56,53,102,100,100,52,57,54,50,50,102,57,102,97,102,99,51,55,98,48,99,51,98,102,53,56,50,51,49,52,48,50,53,51,99,48,101,102,55,100,0,0,0,0,0,0,0,0,49,55,52,97,49,98,101,52,48,97,101,54,57,56,53,55,56,51,98,55,51,98,52,57,99,54,99,97,99,102,51,53,51,52,53,100,52,102,52,50,52,48,56,57,54,49,53,98,48,56,56,100,100,54,57,52,52,55,48,52,51,55,55,54,0,0,0,0,0,0,0,0,52,50,56,56,52,49,101,98,49,49,57,49,50,55,98,56,54,51,55,101,97,52,56,97,52,54,57,102,99,99,49,101,56,48,50,51,55,50,102,51,99,53,101,51,97,98,99,98,97,100,52,100,54,98,51,50,57,54,51,57,56,99,57,48,0,0,0,0,0,0,0,0,50,101,55,50,102,52,56,57,53,56,54,56,48,97,56,50,101,100,56,48,51,52,51,97,99,53,101,57,98,53,53,48,48,97,55,51,99,98,97,56,54,49,54,57,57,50,51,102,55,48,51,57,97,49,48,51,55,99,55,52,100,102,48,50,0,0,0,0,0,0,0,0,54,54,55,52,98,57,54,101,54,101,99,54,52,49,55,97,99,102,51,51,51,101,51,49,99,99,97,57,102,54,54,100,98,52,98,98,50,48,99,49,53,98,97,57,50,98,57,101,54,49,48,49,51,57,98,57,52,98,52,57,53,54,49,99,0,0,0,0,0,0,0,0,50,99,100,100,97,49,55,101,99,97,52,53,52,98,50,49,102,101,102,52,53,53,57,48,57,55,49,54,98,50,53,49,97,54,54,97,98,50,48,56,56,98,52,53,55,98,55,48,101,56,51,99,50,52,97,48,99,56,51,51,54,48,53,101,0,0,0,0,0,0,0,0,57,102,55,53,98,98,97,56,97,99,50,100,49,99,48,98,52,56,99,57,100,97,98,50,99,99,98,48,97,51,56,52,55,54,49,52,101,48,100,57,102,99,50,56,48,50,97,54,57,102,55,101,54,98,49,57,53,56,97,48,101,99,54,53,0,0,0,0,0,0,0,0,51,52,53,48,53,102,53,49,97,101,51,51,50,52,54,48,102,57,56,53,101,56,97,97,99,48,48,52,99,56,54,101,100,56,102,55,57,54,97,51,56,56,100,97,99,57,99,50,52,53,102,55,99,101,101,100,51,98,57,99,56,99,48,51,0,0,0,0,0,0,0,0,52,99,53,56,101,54,102,48,55,48,99,99,49,98,51,57,51,99,101,98,50,101,49,57,48,49,52,52,98,48,57,97,102,57,49,51,54,55,54,50,102,54,50,50,50,56,100,102,57,57,54,49,52,57,101,101,55,56,49,56,48,97,54,97,0,0,0,0,0,0,0,0,100,54,55,51,56,48,55,51,56,50,98,55,50,49,55,99,49,52,57,97,57,57,53,50,53,97,51,53,49,101,99,51,97,55,100,52,51,98,51,97,98,49,102,51,51,97,98,57,50,48,51,53,97,50,50,54,101,102,55,57,52,55,48,55,0,0,0,0,0,0,0,0,54,102,51,52,51,48,100,50,53,101,97,55,54,50,48,53,53,102,52,57,53,57,101,51,98,102,52,98,48,102,101,50,49,50,51,49,101,50,48,55,98,49,102,57,97,51,97,100,52,50,52,54,56,49,52,102,52,99,50,48,48,97,51,57,0,0,0,0,0,0,0,0,50,54,56,102,49,98,50,56,55,53,97,97,48,53,57,57,101,55,102,102,49,49,98,54,102,102,98,48,99,56,49,52,97,53,55,100,49,97,56,54,57,56,57,52,97,52,99,100,97,52,102,51,53,102,51,54,48,51,101,100,52,99,50,51,0,0,0,0,0,0,0,0,53,101,56,52,48,57,97,97,51,48,48,97,99,97,98,56,51,100,50,49,51,57,49,57,49,55,48,52,50,54,55,52,55,101,99,56,101,54,55,49,99,55,55,99,97,52,49,56,49,52,56,50,49,101,97,48,55,57,53,102,102,97,56,100,0,0,0,0,0,0,0,0,101,49,97,101,55,100,51,51,56,98,97,56,55,100,53,101,52,100,54,98,98,54,48,52,52,49,101,49,57,55,55,97,99,98,101,100,56,54,49,50,54,102,55,48,53,102,98,55,99,97,99,53,102,97,49,98,97,54,52,53,51,97,101,56,0,0,0,0,0,0,0,0,99,98,51,57,49,51,52,101,53,98,97,101,97,49,53,57,52,97,56,99,54,55,56,98,97,51,97,55,102,97,102,102,48,55,57,97,51,57,54,49,49,101,52,99,55,55,99,48,99,57,102,56,49,101,52,54,54,49,53,49,55,99,54,48,0,0,0,0,0,0,0,0,102,101,56,54,101,56,56,51,99,101,50,97,55,101,97,56,57,102,57,50,98,50,54,98,99,97,97,99,98,51,55,99,100,50,48,50,102,56,99,101,51,101,50,53,52,52,98,52,51,55,57,53,97,102,52,56,54,102,98,49,57,51,99,101,0,0,0,0,0,0,0,0,54,50,101,97,50,49,97,99,55,51,99,55,52,57,56,100,100,50,56,101,55,99,52,97,52,57,102,55,100,55,57,54,101,97,55,102,54,54,50,56,55,101,98,55,50,48,52,55,48,50,97,48,101,102,98,97,55,102,51,56,54,57,56,49,0,0,0,0,0,0,0,0,57,101,52,50,99,101,98,49,101,102,100,54,54,51,53,102,98,49,50,55,98,48,56,51,99,97,101,57,55,97,51,102,51,57,97,98,56,102,52,57,51,49,99,48,48,49,57,98,97,101,100,102,97,54,54,98,102,49,51,101,101,54,56,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,118,122,0,0,0,0,0,0,50,99,122,0,0,0,0,0,38,53,113,40,0,0,0,0,105,120,102,108,98,0,0,0,114,36,41,44,107,43,0,0,101,114,117,36,115,56,114,0,44,56,55,59,101,36,61,107,0,0,0,0,0,0,0,0,53,98,36,121,112,42,114,102,107,0,0,0,0,0,0,0,36,35,33,50,105,33,43,121,51,59,0,0,0,0,0,0,43,120,48,122,48,53,118,36,100,43,101,0,0,0,0,0,103,49,52,93,99,118,33,115,117,106,56,116,0,0,0,0,115,93,107,57,95,45,118,103,113,64,98,113,104,0,0,0,35,114,121,38,95,102,98,35,113,52,118,40,100,46,0,0,107,56,105,112,113,112,99,37,109,50,56,54,43,44,54,0,35,109,42,104,122,104,112,43,114,37,36,98,108,102,93,57,0,0,0,0,0,0,0,0,95,61,120,114,38,46,49,97,36,37,41,103,54,119,117,53,46,0,0,0,0,0,0,0,55,114,122,59,93,36,56,104,114,91,105,117,43,116,95,37,42,107,0,0,0,0,0,0,45,49,36,52,100,100,113,111,57,97,117,57,107,51,102,91,48,51,103,0,0,0,0,0,120,54,116,45,38,41,118,51,103,55,113,98,33,91,99,98,95,61,46,50,0,0,0,0,100,42,45,122,38,102,114,53,103,91,102,110,59,48,55,50,93,45,61,56,97,0,0,0,52,36,48,119,49,121,53,45,101,38,53,53,99,51,113,98,41,120,43,98,93,110,0,0,111,55,51,122,43,115,120,33,91,104,52,36,43,36,45,45,112,40,118,108,38,49,106,0,33,122,95,111,111,116,104,54,110,35,115,59,110,33,50,102,118,38,52,52,59,100,35,56,0,0,0,0,0,0,0,0,46,107,52,107,99,61,122,122,61,100,64,40,50,116,50,59,36,61,114,53,109,37,110,44,36,0,0,0,0,0,0,0,41,51,99,121,115,101,64,100,111,105,51,55,98,98,102,50,33,111,119,91,95,44,99,91,117,100,0,0,0,0,0,0,46,49,122,61,98,37,51,113,100,53,106,64,111,109,53,35,105,52,35,106,100,61,114,98,105,48,33,0,0,0,0,0,101,107,43,49,112,106,93,95,113,102,122,44,122,109,118,111,64,103,55,52,104,113,119,114,101,35,120,42,0,0,0,0,122,37,115,64,110,115,104,121,61,50,117,116,100,56,104,95,50,53,49,112,102,45,42,52,105,102,120,48,97,0,0,0,121,109,36,54,100,36,33,59,122,116,91,97,50,49,100,33,108,50,112,42,122,40,122,103,98,59,105,105,40,101,0,0,36,38,41,107,108,118,103,99,35,36,117,111,105,109,42,43,55,59,57,113,116,93,113,43,42,59,46,59,105,55,107,0,103,95,64,52,45,48,101,51,45,55,105,109,56,117,43,107,42,117,117,114,46,106,107,48,106,114,100,57,108,111,91,35,0,0,0,0,0,0,0,0,101,102,55,107,48,95,53,43,118,42,102,64,55,55,122,113,110,115,46,114,49,118,52,37,51,93,101,114,95,44,61,117,64,0,0,0,0,0,0,0,121,43,106,121,115,38,104,43,36,52,42,101,122,57,33,42,52,36,122,102,122,53,43,110,112,38,113,103,52,44,98,107,42,46,0,0,0,0,0,0,41,59,105,120,42,51,103,110,45,53,49,43,91,53,97,103,121,108,119,117,46,61,55,95,95,122,46,54,98,61,119,50,109,105,49,0,0,0,0,0,49,119,56,49,61,107,97,118,103,53,99,55,114,106,111,100,59,106,37,102,42,37,46,37,33,93,55,52,36,52,49,42,104,64,99,101,0,0,0,0,119,44,113,36,121,46,42,118,104,108,37,97,54,122,42,53,121,105,42,45,110,37,52,121,93,37,99,44,33,100,52,54,113,122,98,48,42,0,0,0,120,113,64,97,49,115,50,118,117,54,121,102,42,114,97,117,50,40,35,103,110,45,114,49,121,52,59,100,35,106,93,112,107,120,59,120,51,112,0,0,108,118,116,97,107,54,121,117,37,48,98,52,111,41,99,38,42,99,98,54,35,108,98,59,99,106,33,104,35,37,119,49,40,91,53,91,104,111,56,0,51,56,111,53,115,98,59,110,33,61,103,101,95,52,48,57,97,35,48,57,109,57,42,97,93,107,95,42,113,37,119,111,113,113,59,108,104,57,33,114,0,0,0,0,0,0,0,0,120,44,40,120,42,33,118,114,99,119,99,52,109,42,36,64,51,61,54,36,105,119,95,103,102,37,50,93,41,116,110,50,64,114,111,38,122,91,108,59,56,0,0,0,0,0,0,0,93,109,113,48,108,106,115,117,102,117,49,97,45,35,118,51,50,95,59,64,40,57,59,110,53,50,93,38,54,46,38,98,114,108,114,99,104,119,35,122,40,117,0,0,0,0,0,0,61,119,33,119,113,49,118,97,116,49,113,54,95,61,106,42,95,57,38,45,91,56,40,57,38,44,36,110,42,101,114,106,110,57,57,95,121,37,42,54,107,59,113,0,0,0,0,0,105,51,104,52,54,112,107,95,64,57,121,41,118,37,61,103,117,55,121,38,49,111,122,105,99,50,113,114,110,49,33,107,102,121,119,56,45,49,53,55,109,100,107,107,0,0,0,0,100,36,106,106,122,37,61,103,108,38,49,108,118,91,46,113,102,116,56,112,36,49,108,44,54,98,50,104,104,53,119,40,53,38,109,44,38,119,93,61,113,91,110,107,52,0,0,0,45,103,95,33,98,118,122,49,100,41,41,49,116,99,64,50,101,122,93,102,108,114,103,101,35,122,59,118,117,97,55,35,119,119,104,48,118,64,117,113,33,33,33,99,53,101,0,0,116,54,55,95,57,44,119,115,33,42,42,113,50,114,105,46,48,107,33,116,51,112,46,117,106,111,108,106,105,59,101,101,106,42,45,40,57,46,115,33,120,97,37,41,120,55,35,0,53,36,52,100,107,116,43,59,103,55,43,41,43,57,41,61,118,50,113,117,56,121,117,33,38,108,120,37,110,56,115,105,104,64,102,35,93,107,37,55,102,43,118,64,59,44,97,112,0,0,0,0,0,0,0,0,36,121,57,35,49,95,103,37,112,106,103,44,53,54,61,100,117,50,93,45,119,93,116,112,41,120,108,103,119,120,122,50,112,45,95,118,41,99,53,108,101,43,91,61,99,118,49,36,106,0,0,0,0,0,0,0,106,101,91,101,43,55,105,50,59,111,91,112,116,117,107,111,114,117,45,120,56,115,107,114,55,104,45,110,116,57,122,122,98,114,119,91,110,52,43,105,121,61,57,114,120,109,35,44,44,98,0,0,0,0,0,0,40,120,104,98,41,35,93,122,104,48,44,53,46,98,102,105,33,106,37,107,38,93,108,48,64,103,106,45,55,55,105,64,110,101,110,59,103,40,101,41,38,44,119,95,45,33,101,112,113,113,35,0,0,0,0,0,93,41,38,109,33,100,41,46,93,108,93,44,42,51,44,53,114,118,97,114,106,95,117,54,107,108,102,93,53,109,111,102,41,57,40,102,40,95,95,53,42,50,56,38,107,93,115,112,50,114,107,102,0,0,0,0,122,64,46,117,111,64,120,105,108,44,116,109,93,59,95,48,36,43,106,106,46,64,64,43,114,61,99,95,116,48,109,38,121,106,108,44,49,106,106,113,122,115,36,91,105,44,101,59,108,121,38,61,93,0,0,0,53,98,117,53,35,113,56,49,45,100,122,98,113,117,56,46,40,61,114,44,102,51,114,41,61,44,104,115,111,114,95,35,53,99,109,91,51,38,42,111,108,46,42,35,55,49,110,106,64,41,35,37,42,120,0,0,121,51,103,59,102,43,51,95,122,91,49,99,38,117,115,103,38,98,121,103,100,100,41,106,41,43,95,119,109,51,115,48,116,44,116,100,118,49,120,99,101,100,36,57,114,37,109,99,115,121,50,101,53,108,98,0,40,106,33,99,109,93,112,41,101,107,121,35,40,55,40,113,36,95,91,99,35,56,98,108,106,57,54,33,111,91,112,97,101,108,112,103,93,106,122,53,49,54,53,110,95,111,117,45,37,103,48,36,107,118,49,48,0,0,0,0,0,0,0,0,53,102,37,99,53,54,120,104,113,55,59,104,56,53,119,111,109,64,107,118,40,119,42,95,118,120,93,55,103,110,109,98,101,109,101,42,48,55,42,43,98,36,99,115,93,113,118,91,95,56,49,33,40,44,97,55,101,0,0,0,0,0,0,0,101,117,57,110,105,38,48,44,54,33,40,122,101,104,113,98,48,33,101,61,40,41,113,110,46,49,33,55,119,48,108,114,114,110,41,110,50,119,98,109,114,55,61,110,57,105,38,93,105,98,55,104,118,114,45,38,44,100,0,0,0,0,0,0,44,97,49,100,119,118,101,52,101,102,46,61,108,52,50,120,122,61,55,56,51,104,53,105,101,50,100,112,35,55,44,44,36,111,36,104,110,64,120,57,119,110,59,52,56,106,53,121,64,40,98,37,108,40,54,107,100,40,35,0,0,0,0,0,111,57,107,98,57,44,119,57,122,117,35,51,51,91,57,55,113,91,122,97,109,54,103,54,120,37,118,105,53,108,101,112,98,51,111,91,108,99,103,41,114,104,53,95,41,35,91,46,52,117,48,120,116,111,117,56,112,109,52,56,0,0,0,0,91,114,56,117,103,50,43,38,115,61,105,106,50,119,38,93,107,93,35,42,122,53,118,107,49,97,41,113,105,103,116,103,108,45,115,97,57,114,40,112,42,45,98,53,56,64,59,42,108,100,109,97,40,107,102,114,52,91,112,46,112,0,0,0,106,119,61,117,45,107,56,40,59,36,54,116,33,119,93,109,50,120,54,117,35,35,98,111,115,104,116,50,107,54,109,109,59,57,103,97,49,102,43,57,35,120,38,109,42,37,45,56,119,61,52,40,40,50,107,119,55,52,41,54,116,37,0,0,97,41,46,50,102,121,41,48,119,112,59,43,115,56,109,111,100,100,48,51,115,112,61,57,98,46,54,38,49,109,97,55,98,48,98,40,106,49,55,50,59,50,41,54,100,112,44,57,114,102,91,91,93,61,48,115,95,61,93,120,110,105,93,0,112,57,106,40,118,54,56,108,35,114,52,42,118,101,33,33,108,99,118,110,99,50,52,56,33,91,119,91,105,40,104,57,55,59,95,93,46,99,91,43,64,106,50,40,56,107,98,115,45,51,108,52,110,95,35,107,103,54,98,43,100,106,54,52,0,0,0,0,0,0,0,0,118,35,51,104,106,42,61,97,36,61,97,109,55,107,97,122,115,98,111,112,40,114,35,91,113,91,116,46,46,55,43,45,108,64,119,105,122,91,91,102,61,120,48,112,45,113,108,104,122,102,59,113,53,106,121,40,113,118,50,33,64,38,33,36,51,0,0,0,0,0,0,0,38,104,51,103,55,93,102,61,43,116,99,35,64,105,44,33,59,52,64,110,97,119,103,46,33,105,120,93,38,43,103,46,115,35,115,122,104,121,57,100,110,48,105,110,46,101,122,100,98,97,111,93,121,61,35,33,97,50,121,116,111,53,46,35,40,119,0,0,0,0,0,0,114,117,37,64,112,53,57,107,56,52,93,51,36,49,102,122,122,93,55,33,106,43,52,33,64,115,107,111,118,56,38,56,61,104,107,36,121,101,91,105,97,106,105,40,100,108,117,98,107,44,100,49,120,35,110,59,120,114,115,122,113,44,105,107,105,56,49,0,0,0,0,0,64,99,48,107,45,110,57,56,95,36,112,121,61,108,112,50,41,122,57,108,109,107,117,54,54,53,44,97,55,38,57,106,57,119,43,95,107,41,91,33,59,61,41,102,100,120,40,54,95,120,33,56,118,38,121,49,49,93,101,53,46,43,44,98,37,36,113,49,0,0,0,0,53,116,95,56,104,55,44,102,61,37,100,104,35,37,93,105,40,98,45,46,41,54,99,113,57,40,109,122,108,116,101,38,50,57,113,53,40,115,48,57,117,117,36,64,61,117,102,101,48,97,107,53,109,114,53,56,51,108,57,43,115,110,116,37,51,114,105,116,42,0,0,0,104,120,102,55,54,55,115,112,98,54,118,35,64,113,35,103,57,116,38,43,43,116,46,110,55,101,122,121,121,107,49,45,115,38,41,91,115,37,104,112,104,117,113,64,42,56,106,49,35,106,105,105,105,35,122,57,101,114,64,118,93,102,50,56,44,64,59,91,106,56,0,0,122,53,46,111,98,105,115,105,55,56,43,41,57,104,45,45,105,55,110,57,57,119,41,49,50,55,101,57,35,116,51,97,38,46,91,37,97,56,100,107,99,109,45,95,52,111,122,101,93,108,54,113,112,45,52,113,55,33,116,109,97,103,101,51,104,42,112,91,45,59,48,0,108,44,44,46,55,107,42,113,105,42,100,109,100,46,109,37,99,99,38,95,33,118,41,102,104,48,53,36,57,57,115,40,45,33,111,46,53,99,117,33,101,36,121,112,33,110,97,105,118,117,52,59,46,33,118,117,107,50,114,103,37,48,44,33,112,59,64,113,42,50,101,108,0,0,0,0,0,0,0,0,64,98,61,100,93,122,44,100,112,105,56,118,40,95,120,44,49,46,112,97,54,101,37,42,107,54,42,99,103,116,52,120,91,42,59,48,99,55,44,121,115,56,104,95,46,57,36,37,54,49,40,40,108,102,54,104,113,35,101,64,115,120,110,108,51,112,118,48,55,112,61,44,91,0,0,0,0,0,0,0,50,42,36,119,97,109,100,53,37,52,110,95,64,119,43,64,55,120,44,49,93,118,112,91,104,55,91,37,35,36,43,57,117,48,95,97,105,99,117,43,41,64,91,33,108,33,55,35,33,117,41,105,45,61,118,112,46,35,54,48,49,38,122,108,109,93,117,103,44,33,57,99,101,120,0,0,0,0,0,0,101,110,59,42,35,57,115,45,40,53,113,110,95,122,117,57,48,105,99,33,35,109,118,101,115,110,106,101,106,51,109,50,41,33,52,37,43,118,115,103,49,50,38,103,102,102,114,117,110,49,119,117,42,35,117,59,120,42,55,105,114,46,46,110,40,91,108,44,97,57,100,91,113,113,108,0,0,0,0,0,36,50,114,122,119,35,61,103,35,42,40,108,113,110,56,98,119,40,38,56,98,33,54,91,101,97,117,54,91,120,48,49,51,51,122,35,119,59,113,112,109,120,107,113,113,38,104,50,33,104,49,52,38,95,110,42,43,45,114,37,61,37,111,100,43,48,54,44,119,48,45,45,121,40,110,109,0,0,0,0,106,37,111,112,93,118,91,93,36,118,95,120,44,46,95,116,46,64,53,106,64,36,61,117,57,120,114,40,64,53,53,36,99,119,99,59,111,35,36,101,109,55,55,119,61,54,45,97,107,99,117,46,95,45,106,52,112,108,52,50,120,107,107,33,109,53,103,112,104,36,55,36,100,40,35,37,36,0,0,0,97,99,97,61,53,45,35,121,48,57,111,38,101,42,48,37,49,43,102,59,36,101,114,50,110,48,122,102,37,104,108,56,37,119,93,114,37,113,95,99,52,101,112,57,57,51,100,55,97,51,52,57,107,103,105,97,108,104,106,61,44,118,56,33,119,33,115,116,108,105,117,97,52,61,41,108,115,97,0,0,38,103,46,107,59,57,54,97,108,116,45,93,54,61,108,108,52,99,57,33,45,53,93,59,51,110,61,104,46,61,40,61,64,41,97,51,49,49,37,108,115,46,61,98,41,112,57,105,38,105,115,122,97,121,105,121,55,111,107,102,49,100,95,113,51,99,102,119,106,52,109,99,120,117,57,38,57,106,108,0,51,99,99,99,110,50,111,36,35,38,108,122,120,43,111,41,38,64,43,109,121,56,45,49,118,49,49,112,100,106,95,117,57,110,44,41,97,121,116,91,54,108,103,42,33,45,36,109,48,105,91,113,40,116,102,49,105,35,120,97,105,114,120,91,114,44,40,113,98,107,45,118,110,55,117,50,119,115,112,104,0,0,0,0,0,0,0,0,52,111,64,50,64,91,61,106,46,113,100,112,49,46,116,109,55,50,107,115,48,107,59,37,91,61,111,99,53,102,41,42,43,52,50,55,100,43,41,42,113,35,53,42,117,110,53,42,93,42,55,45,118,122,57,117,93,118,99,52,42,120,95,101,59,57,107,118,55,57,53,37,111,33,121,54,55,108,57,57,91,0,0,0,0,0,0,0,118,98,108,109,110,36,113,52,51,104,44,59,35,37,48,99,97,98,104,50,93,97,113,99,49,59,59,102,54,33,97,99,115,93,121,105,40,101,104,50,97,118,111,105,36,93,111,107,101,44,37,35,100,119,101,37,104,105,61,109,61,122,43,64,93,119,54,105,57,49,117,105,106,111,35,116,64,103,44,64,108,108,0,0,0,0,0,0,113,102,35,121,44,56,114,51,122,114,56,43,40,40,55,105,54,102,40,40,112,48,49,42,64,95,37,100,98,64,40,105,109,50,53,103,51,95,52,51,100,48,44,42,121,53,104,111,43,57,109,50,46,103,50,101,121,117,114,105,122,113,43,120,104,42,33,114,115,118,118,57,107,112,45,40,61,52,59,49,35,101,116,0,0,0,0,0,64,37,111,61,57,120,48,108,115,37,113,55,108,106,106,36,36,64,52,100,121,109,59,59,112,48,117,93,119,118,117,112,38,46,51,106,61,103,112,54,106,109,56,114,107,97,37,120,48,106,45,49,115,102,51,51,43,95,101,49,103,36,64,118,44,99,100,36,97,106,64,99,38,99,45,61,64,35,106,108,102,107,118,49,0,0,0,0,108,48,53,56,115,104,104,50,95,56,46,37,44,108,45,117,38,35,52,120,98,50,99,59,118,64,40,54,40,33,40,107,54,57,103,115,104,53,33,59,114,93,122,114,93,103,61,111,33,41,118,48,93,64,57,99,108,122,33,103,108,59,37,122,102,91,112,115,121,93,46,109,97,55,121,117,109,103,121,99,107,49,106,122,44,0,0,0,44,113,45,35,93,41,105,104,104,35,98,51,117,91,36,109,93,101,45,40,36,44,122,101,116,118,100,111,54,118,117,109,103,56,122,116,100,48,52,117,118,120,44,49,110,54,38,56,40,59,53,119,61,119,49,40,51,111,116,38,51,95,120,51,115,95,117,112,64,108,108,59,35,49,104,42,50,114,51,106,53,54,43,121,35,103,0,0,53,102,101,118,110,45,45,102,52,118,121,43,99,112,109,43,104,46,116,101,38,45,51,53,46,98,107,121,91,120,51,99,37,119,57,56,117,95,122,35,36,50,116,57,118,43,37,118,104,91,64,54,122,41,107,59,46,120,122,43,116,116,111,99,118,36,53,45,116,51,107,35,110,43,115,41,105,49,99,91,99,99,46,64,116,57,112,0,113,61,97,45,107,64,91,100,36,121,105,121,64,44,53,52,115,110,116,55,104,51,104,118,122,117,33,108,118,108,37,46,101,115,113,52,48,121,59,56,38,107,108,52,110,118,103,37,40,120,101,37,41,43,52,104,40,117,103,116,104,122,95,46,99,35,111,121,102,110,59,98,59,46,93,98,105,51,44,120,114,115,103,107,33,117,56,110,0,0,0,0,0,0,0,0,64,53,43,103,98,44,64,57,52,33,52,55,43,38,104,120,101,35,107,116,110,56,44,113,36,43,56,106,51,61,52,38,98,119,111,100,56,106,104,91,116,117,41,115,121,107,114,91,97,111,33,105,35,50,107,106,111,41,56,121,49,54,95,117,50,100,103,97,64,36,61,51,95,102,119,107,56,113,54,106,107,55,56,35,49,106,102,121,43,0,0,0,0,0,0,0,45,49,112,64,122,52,118,41,104,33,121,105,102,106,50,45,101,42,48,42,100,44,43,119,120,117,111,38,114,55,114,59,61,107,119,42,113,57,64,35,102,112,99,42,118,110,110,99,46,61,105,113,102,33,109,110,113,54,64,48,41,38,122,112,59,56,110,35,103,102,114,97,91,110,107,121,113,105,59,40,106,105,111,48,36,55,122,100,54,42,0,0,0,0,0,0,43,48,43,36,93,41,55,38,104,91,106,109,107,49,51,43,101,97,99,53,93,49,45,93,37,53,104,102,102,57,33,106,120,43,121,103,103,119,40,100,55,95,104,45,37,64,40,117,120,35,108,38,120,52,119,97,112,115,57,100,102,99,41,103,46,118,103,53,46,57,53,35,46,95,122,102,45,42,99,37,48,44,93,57,91,107,119,57,41,57,103,0,0,0,0,0,108,99,111,51,36,53,59,52,51,97,119,48,102,33,36,61,61,91,51,102,57,49,49,51,107,105,103,57,100,55,40,112,46,37,43,44,114,46,56,50,44,44,35,99,98,101,50,113,95,64,41,54,35,111,99,117,120,114,95,41,99,54,49,107,42,33,48,101,100,104,36,33,115,55,50,43,113,118,116,33,110,37,64,122,110,45,97,91,48,46,40,102,0,0,0,0,118,113,54,95,38,111,44,50,104,109,107,119,102,114,56,61,45,53,105,48,101,54,41,49,110,43,109,111,57,49,114,122,33,118,122,112,120,117,54,122,42,51,41,43,109,120,115,108,55,102,118,33,49,112,38,107,106,43,109,104,33,35,45,106,61,116,53,56,104,52,118,95,115,56,103,50,111,52,55,120,112,119,103,64,49,97,106,99,101,103,44,103,43,0,0,0,52,103,91,56,49,36,52,56,110,40,44,120,120,107,106,36,122,113,91,37,51,121,120,101,97,99,42,61,93,40,64,44,38,109,114,49,43,54,35,49,106,111,52,113,100,104,50,49,40,105,40,98,35,113,36,113,54,93,115,61,42,53,104,57,36,37,53,41,107,38,102,40,107,43,112,49,114,91,106,118,112,56,42,100,116,41,105,108,37,117,111,49,64,37,0,0,55,91,44,41,54,99,54,35,61,114,101,46,44,35,114,93,111,119,49,119,36,93,101,33,35,116,97,120,109,43,64,56,35,45,42,117,106,48,56,107,119,120,36,122,55,52,45,64,35,33,56,103,48,41,93,52,101,35,121,107,117,50,57,108,53,45,36,118,91,111,38,36,117,59,104,115,54,41,100,100,105,45,64,112,98,110,114,106,41,33,49,61,121,44,98,0,118,57,53,40,42,122,114,41,59,55,46,52,106,38,107,37,55,46,108,52,120,102,115,110,111,106,108,52,118,103,95,51,110,55,115,100,104,121,42,56,52,38,111,110,56,97,35,119,48,43,56,106,55,44,122,101,57,108,115,98,121,116,101,40,121,56,113,49,57,108,61,64,41,59,44,114,114,64,35,97,52,46,41,104,55,56,50,54,45,43,38,111,45,99,53,37,0,0,0,0,0,0,0,0,41,35,116,64,121,119,111,101,49,59,119,115,49,50,105,104,121,59,111,51,110,57,33,114,55,52,50,42,35,103,59,51,42,51,114,46,104,95,114,105,91,103,98,97,108,44,98,103,101,50,117,113,111,43,104,49,46,93,115,120,45,45,55,117,91,59,118,113,102,99,101,107,111,59,44,46,61,110,44,37,108,116,45,54,49,97,106,114,57,119,113,33,38,117,41,36,95,0,0,0,0,0,0,0,112,54,104,44,53,53,53,33,46,102,91,33,41,121,118,104,57,108,105,43,56,93,99,36,113,113,97,109,37,57,97,51,54,52,116,115,118,113,121,117,45,112,45,48,108,122,59,50,37,109,93,118,56,33,116,108,48,122,119,121,117,46,93,41,122,122,100,117,109,111,108,100,38,104,113,116,109,48,112,116,36,35,109,52,108,107,105,95,114,93,64,45,97,104,99,49,48,106,0,0,0,0,0,0,53,54,98,54,43,50,106,46,41,51,120,33,59,93,113,38,108,99,120,57,103,110,46,103,48,41,64,97,53,36,110,44,46,38,36,43,98,36,44,98,56,38,57,41,116,57,93,103,40,110,37,119,44,35,91,52,112,46,61,46,45,48,116,118,48,57,56,109,121,35,119,121,45,57,91,114,120,103,45,101,103,108,120,44,100,121,103,38,120,57,122,119,42,102,42,121,46,108,113,0,0,0,0,0,98,117,102,102,101,114,95,105,115,95,101,113,117,97,108,40,100,105,103,101,115,116,44,32,103,111,97,108,95,98,117,102,102,101,114,41,0,0,0,0,99,104,101,99,107,95,104,97,115,104,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,0,0,0,0,0,0,0,0,115,116,114,99,109,112,40,101,110,99,111,100,101,100,44,32,104,101,120,41,32,61,61,32,48,0,0,0,0,0,0,0,99,47,116,101,115,116,47,117,116,105,108,46,99,0,0,0,116,101,115,116,95,98,117,102,102,101,114,95,104,101,120,0,98,117,102,102,101,114,95,104,101,120,58,32,79,75,33,0,97,98,99,100,0,0,0,0,97,115,100,113,112,105,119,101,0,0,0,0,0,0,0,0,97,98,99,100,97,115,100,113,112,105,119,101,0,0,0,0,98,117,102,102,101,114,95,105,115,95,101,113,117,97,108,40,97,44,32,99,41,0,0,0,116,101,115,116,95,98,117,102,102,101,114,95,112,117,115,104,95,97,108,105,103,110,101,100,0,0,0,0,0,0,0,0,98,117,102,102,101,114,95,112,117,115,104,95,97,108,105,103,110,101,100,58,32,79,75,33,0,0,0,0,0,0,0,0,97,98,99,0,0,0,0,0,115,100,113,112,119,101,0,0,97,98,99,115,100,113,112,119,101,0,0,0,0,0,0,0,116,101,115,116,95,98,117,102,102,101,114,95,112,117,115,104,0,0,0,0,0,0,0,0,98,117,102,102,101,114,95,112,117,115,104,58,32,79,75,33,0,0,0,0,0,0,0,0,48,48,0,0,0,0,0,0,115,116,114,99,109,112,40,104,101,120,44,32,34,48,48,34,41,32,61,61,32,48,0,0,116,101,115,116,95,98,117,102,102,101,114,95,114,101,97,108,108,111,99,0,0,0,0,0,48,48,48,48,48,48,48,48,48,48,0,0,0,0,0,0,115,116,114,99,109,112,40,104,101,120,44,32,34,48,48,48,48,48,48,48,48,48,48,34,41,32,61,61,32,48,0,0,98,117,102,102,101,114,95,114,101,97,108,108,111,99,58,32,79,75,33,0,0,0,0,0,101,105,117,106,101,97,97,110,97,100,110,97,111,106,100,113,122,0,0,0,0,0,0,0,101,97,97,110,97,100,110,97,111,106,100,113,122,0,0,0,98,117,102,102,101,114,95,105,115,95,101,113,117,97,108,40,98,44,32,98,50,41,0,0,116,101,115,116,95,98,117,102,102,101,114,95,115,108,105,99,101,0,0,0,0,0,0,0,98,117,102,102,101,114,95,115,108,105,99,101,58,32,79,75,33,0,0,0,0,0,0,0,107,101,121,45,62,108,101,110,103,116,104,32,61,61,32,51,50,0,0,0,0,0,0,0,99,47,112,98,107,100,102,46,99,0,0,0,0,0,0,0,112,98,107,100,102,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,103,230,9,106,133,174,103,187,114,243,110,60,58,245,79,165,127,82,14,81,140,104,5,155,171,217,131,31,25,205,224,91,100,105,103,101,115,116,45,62,108,101,110,103,116,104,32,61,61,32,51,50,0,0,0,0,99,47,115,104,97,46,99,0,115,104,97,95,101,110,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,47,138,66,145,68,55,113,207,251,192,181,165,219,181,233,91,194,86,57,241,17,241,89,164,130,63,146,213,94,28,171,152,170,7,216,1,91,131,18,190,133,49,36,195,125,12,85,116,93,190,114,254,177,222,128,167,6,220,155,116,241,155,193,193,105,155,228,134,71,190,239,198,157,193,15,204,161,12,36,111,44,233,45,170,132,116,74,220,169,176,92,218,136,249,118,82,81,62,152,109,198,49,168,200,39,3,176,199,127,89,191,243,11,224,198,71,145,167,213,81,99,202,6,103,41,41,20,133,10,183,39,56,33,27,46,252,109,44,77,19,13,56,83,84,115,10,101,187,10,106,118,46,201,194,129,133,44,114,146,161,232,191,162,75,102,26,168,112,139,75,194,163,81,108,199,25,232,146,209,36,6,153,214,133,53,14,244,112,160,106,16,22,193,164,25,8,108,55,30,76,119,72,39,181,188,176,52,179,12,28,57,74,170,216,78,79,202,156,91,243,111,46,104,238,130,143,116,111,99,165,120,20,120,200,132,8,2,199,140,250,255,190,144,235,108,80,164,247,163,249,190,242,120,113,198,108,101,110,103,116,104,37,50,32,61,61,32,48,0,0,0,99,47,117,116,105,108,46,99,0,0,0,0,0,0,0,0,98,117,102,102,101,114,95,99,114,101,97,116,101,95,102,114,111,109,95,104,101,120,0,0,104,104,32,62,61,32,48,32,38,38,32,104,104,32,60,32,49,54,0,0,0,0,0,0,108,104,32,62,61,32,48,32,38,38,32,108,104,32,60,32,49,54,0,0,0,0,0,0,100,101,115,116,45,62,108,101,110,103,116,104,32,61,61,32,111,114,105,103,105,110,46,108,101,110,103,116,104,0,0,0,98,117,102,102,101,114,95,99,111,112,121,0,0,0,0,0,98,117,102,102,101,114,95,120,111,114,0,0,0,0,0,0,108,101,110,103,116,104,32,60,61,32,98,45,62,108,101,110,103,116,104,0,0,0,0,0,98,117,102,102,101,114,95,115,108,105,99,101,0,0,0,0,108,101,110,103,116,104,37,52,32,61,61,32,48,0,0,0,112,116,114,32,33,61,32,78,85,76,76,0,0,0,0,0,99,47,109,101,109,111,114,121,46,99,0,0,0,0,0,0,95,109,101,109,111,114,121,95,97,108,108,111,99,0,0,0,95,109,101,109,111,114,121,95,99,97,108,108,111,99,0,0,110,101,119,95,112,116,114,32,33,61,32,78,85,76,76,0,95,109,101,109,111,114,121,95,114,101,97,108,108,111,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,111,105,110,116,101,114,115,91,105,93,32,61,61,32,78,85,76,76,0,0,0,0,0,95,109,101,109,111,114,121,95,97,115,115,101,114,116,95,101,109,112,116,121,0,0,0,0,48,0,0,0,0,0,0,0,99,104,97,110,103,101,95,112,116,114,0,0,0,0,0,0,97,115,115,101,114,116,95,112,116,114,95,101,120,105,115,116,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,91,109,101,109,111,114,121,93,32,105,110,99,114,101,97,115,105,110,103,32,99,97,112,97,99,105,116,121,32,116,111,32,37,100,32,112,111,105,110,116,101,114,115,44,32,37,100,32,117,115,101,100,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




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


  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_memset"] = _memset;

  function _abort() {
      Module['abort']();
    }

  
  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var PATH={splitPath:function (filename) {
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
            return ''; // an invalid portion invalidates the whole thing
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
      }};
  
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
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
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
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
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
  
        if (!path) return { path: '', node: null };
  
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
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
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
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
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
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
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
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
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
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
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
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
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
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
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
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        // If Module['websocket'] has already been defined (e.g. for configuring
        // the subprotocol/url) use that, if not initialise it to a new object.
        Module['websocket'] = (Module['websocket'] && 
                               ('object' === typeof Module['websocket'])) ? Module['websocket'] : {};
  
        // Add the Event registration mechanism to the exported websocket configuration
        // object so we can register network callbacks from native JavaScript too.
        // For more documentation see system/include/emscripten/emscripten.h
        Module['websocket']._callbacks = {};
        Module['websocket']['on'] = function(event, callback) {
  	    if ('function' === typeof callback) {
  		  this._callbacks[event] = callback;
          }
  	    return this;
        };
  
        Module['websocket'].emit = function(event, param) {
  	    if ('function' === typeof this._callbacks[event]) {
  		  this._callbacks[event].call(this, param);
          }
        };
  
        // If debug is enabled register simple default logging callbacks for each Event.
  
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
          error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
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
  
              // The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
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
  
            Module['websocket'].emit('open', sock.stream.fd);
  
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
            Module['websocket'].emit('message', sock.stream.fd);
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('close', function() {
              Module['websocket'].emit('close', sock.stream.fd);
            });
            peer.socket.on('error', function(error) {
              // Although the ws library may pass errors that may be more descriptive than
              // ECONNREFUSED they are not necessarily the expected error code e.g. 
              // ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
              // is still probably the most useful thing to do.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onclose = function() {
              Module['websocket'].emit('close', sock.stream.fd);
            };
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
            peer.socket.onerror = function(error) {
              // The WebSocket spec only allows a 'simple event' to be thrown on error,
              // so we only really know as much as ECONNREFUSED.
              sock.error = ERRNO_CODES.ECONNREFUSED; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
              Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
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
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
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
          Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
              Module['websocket'].emit('connection', newsock.stream.fd);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
              Module['websocket'].emit('connection', sock.stream.fd);
            }
          });
          sock.server.on('closed', function() {
            Module['websocket'].emit('close', sock.stream.fd);
            sock.server = null;
          });
          sock.server.on('error', function(error) {
            // Although the ws library may pass errors that may be more descriptive than
            // ECONNREFUSED they are not necessarily the expected error code e.g. 
            // ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
            // is still probably the most useful thing to do. This error shouldn't
            // occur in a well written app as errors should get trapped in the compiled
            // app's own getaddrinfo call.
            sock.error = ERRNO_CODES.EHOSTUNREACH; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
            Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
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


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      Runtime.stackRestore(ret);
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return Math.floor((Date.now() - _clock.start) * (1000000/1000));
    }

   
  Module["_memmove"] = _memmove;

  function ___errno_location() {
      return ___errno_state;
    }

  function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());
      return self.LLVM_SAVEDSTACKS.length-1;
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
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
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          ctx = GL.getContext(contextHandle).GLctx;
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
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

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
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
  var _send=env._send;
  var ___setErrNo=env.___setErrNo;
  var _llvm_stackrestore=env._llvm_stackrestore;
  var ___assert_fail=env.___assert_fail;
  var _fflush=env._fflush;
  var _pwrite=env._pwrite;
  var __reallyNegative=env.__reallyNegative;
  var _sbrk=env._sbrk;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _fileno=env._fileno;
  var _sysconf=env._sysconf;
  var _clock=env._clock;
  var _llvm_stacksave=env._llvm_stacksave;
  var _puts=env._puts;
  var _printf=env._printf;
  var _write=env._write;
  var ___errno_location=env.___errno_location;
  var _fputc=env._fputc;
  var _mkport=env._mkport;
  var _abort=env._abort;
  var _fwrite=env._fwrite;
  var _time=env._time;
  var _fprintf=env._fprintf;
  var __formatString=env.__formatString;
  var _fputs=env._fputs;
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
  
function _main() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = 0;
 _test_buffer_hex();
 __memory_assert_empty();
 _test_buffer_push_aligned();
 __memory_assert_empty();
 _test_buffer_push();
 __memory_assert_empty();
 _test_buffer_realloc();
 __memory_assert_empty();
 _test_buffer_slice();
 __memory_assert_empty();
 _test_sha();
 __memory_assert_empty();
 _test_hmac();
 __memory_assert_empty();
 _test_pbkdf();
 __memory_assert_empty();
 STACKTOP = sp;return 0;
}
function _test_hmac() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, $n = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $n = 67;
 $i = 0;
 while(1) {
  $0 = $i;
  $1 = $n;
  $2 = ($0|0)<($1|0);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = (8 + ($3<<2)|0);
  $5 = HEAP32[$4>>2]|0;
  $6 = $i;
  $7 = (280 + ($6<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = $i;
  $10 = (552 + ($9<<2)|0);
  $11 = HEAP32[$10>>2]|0;
  _check_tag($5,$8,$11);
  $12 = $i;
  $13 = (($12) + 1)|0;
  $i = $13;
 }
 $14 = (_hmac_simple(824,832)|0);
 $15 = (_strcmp($14,840)|0);
 $16 = ($15|0)==(0);
 if (!($16)) {
  ___assert_fail((912|0),(1024|0),241,(1040|0));
  // unreachable;
 }
 $17 = (_hmac_simple_hex(1056,1064)|0);
 $18 = (_strcmp($17,840)|0);
 $19 = ($18|0)==(0);
 if ($19) {
  (_puts((1208|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((1080|0),(1024|0),242,(1040|0));
  // unreachable;
 }
}
function _check_tag($key,$message,$goal) {
 $key = $key|0;
 $message = $message|0;
 $goal = $goal|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $goal_buffer = 0, $goal_buffer$byval_copy = 0, $key_buffer = 0, $key_buffer$byval_copy = 0, $mac = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, $tag = 0, $tag$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 208|0;
 $goal_buffer$byval_copy = sp + 192|0;
 $tag$byval_copy = sp + 180|0;
 $message_buffer$byval_copy = sp + 168|0;
 $key_buffer$byval_copy = sp + 156|0;
 $key_buffer = sp + 36|0;
 $message_buffer = sp + 24|0;
 $goal_buffer = sp + 12|0;
 $tag = sp;
 $mac = sp + 48|0;
 $0 = $key;
 $1 = $message;
 $2 = $goal;
 $3 = $0;
 _buffer_create_from_str($key_buffer,$3);
 $4 = $1;
 _buffer_create_from_str($message_buffer,$4);
 $5 = $2;
 _buffer_create_from_hex($goal_buffer,$5);
 _buffer_calloc($tag,32);
 ;HEAP32[$key_buffer$byval_copy+0>>2]=HEAP32[$key_buffer+0>>2]|0;HEAP32[$key_buffer$byval_copy+4>>2]=HEAP32[$key_buffer+4>>2]|0;HEAP32[$key_buffer$byval_copy+8>>2]=HEAP32[$key_buffer+8>>2]|0;
 _hmac_init($mac,$key_buffer$byval_copy);
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 _hmac_update($mac,$message_buffer$byval_copy);
 _hmac_end($mac,$tag);
 ;HEAP32[$tag$byval_copy+0>>2]=HEAP32[$tag+0>>2]|0;HEAP32[$tag$byval_copy+4>>2]=HEAP32[$tag+4>>2]|0;HEAP32[$tag$byval_copy+8>>2]=HEAP32[$tag+8>>2]|0;
 ;HEAP32[$goal_buffer$byval_copy+0>>2]=HEAP32[$goal_buffer+0>>2]|0;HEAP32[$goal_buffer$byval_copy+4>>2]=HEAP32[$goal_buffer+4>>2]|0;HEAP32[$goal_buffer$byval_copy+8>>2]=HEAP32[$goal_buffer+8>>2]|0;
 $6 = (_buffer_is_equal($tag$byval_copy,$goal_buffer$byval_copy)|0);
 $7 = ($6|0)!=(0);
 if ($7) {
  _buffer_free($key_buffer);
  _buffer_free($message_buffer);
  _buffer_free($goal_buffer);
  _buffer_free($tag);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((13640|0),(1024|0),17,(13680|0));
  // unreachable;
 }
}
function _test_pbkdf() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $dt = 0, $i = 0, $ms = 0, $rpms = 0, $start = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer = sp;
 _check_pbkdf_str(13696,13712,1,13720);
 _check_pbkdf_str(13696,13712,2,13792);
 _check_pbkdf_str(13696,13712,4096,13864);
 $i = 0;
 while(1) {
  $0 = $i;
  $1 = ($0|0)<(7);
  if (!($1)) {
   break;
  }
  $2 = (_clock()|0);
  $start = $2;
  _check_pbkdf_str(13696,13712,5000,13936);
  $3 = (_clock()|0);
  $4 = $start;
  $5 = (($3) - ($4))|0;
  $dt = $5;
  $6 = $dt;
  $7 = ($6*1000)|0;
  $8 = (($7|0) / 1000000)&-1;
  $ms = $8;
  $9 = $ms;
  $10 = (5000000 / ($9|0))&-1;
  $rpms = $10;
  $11 = $ms;
  $12 = $rpms;
  HEAP32[$vararg_buffer>>2] = $11;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = $12;
  (_printf((14008|0),($vararg_buffer|0))|0);
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 _check_pbkdf_str(14040,14072,4096,14112);
 _check_pbkdf(14200,9,14216,5,4096,14224);
 $15 = (_pbkdf_simple(14264,14280,0,1000)|0);
 $16 = (_strcmp($15,14288)|0);
 $17 = ($16|0)==(0);
 if (!($17)) {
  ___assert_fail((14360|0),(14488|0),52,(14504|0));
  // unreachable;
 }
 $18 = (_pbkdf_simple_hex(14520,14544,0,1000)|0);
 $19 = (_strcmp($18,14288)|0);
 $20 = ($19|0)==(0);
 if ($20) {
  (_puts((14704|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((14560|0),(14488|0),53,(14504|0));
  // unreachable;
 }
}
function _check_pbkdf_str($password,$salt,$rounds,$goal) {
 $password = $password|0;
 $salt = $salt|0;
 $rounds = $rounds|0;
 $goal = $goal|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $password;
 $1 = $salt;
 $2 = $rounds;
 $3 = $goal;
 $4 = $0;
 $5 = $0;
 $6 = (_strlen(($5|0))|0);
 $7 = $1;
 $8 = $1;
 $9 = (_strlen(($8|0))|0);
 $10 = $2;
 $11 = $3;
 _check_pbkdf($4,$6,$7,$9,$10,$11);
 STACKTOP = sp;return;
}
function _check_pbkdf($password,$pass_length,$salt,$salt_length,$rounds,$goal) {
 $password = $password|0;
 $pass_length = $pass_length|0;
 $salt = $salt|0;
 $salt_length = $salt_length|0;
 $rounds = $rounds|0;
 $goal = $goal|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $final_key = 0, $final_key$byval_copy = 0, $goal_buffer = 0, $goal_buffer$byval_copy = 0, $i = 0, $key = 0, $key$byval_copy = 0, $password_buffer = 0, $password_buffer$byval_copy = 0;
 var $salt_buffer = 0, $salt_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $goal_buffer$byval_copy = sp + 136|0;
 $final_key$byval_copy = sp + 124|0;
 $key$byval_copy = sp + 112|0;
 $salt_buffer$byval_copy = sp + 100|0;
 $password_buffer$byval_copy = sp + 88|0;
 $password_buffer = sp + 48|0;
 $salt_buffer = sp + 36|0;
 $goal_buffer = sp + 24|0;
 $key = sp + 12|0;
 $final_key = sp;
 $0 = $password;
 $1 = $pass_length;
 $2 = $salt;
 $3 = $salt_length;
 $4 = $rounds;
 $5 = $goal;
 $6 = $0;
 $7 = $1;
 _buffer_create($password_buffer,$6,$7);
 $8 = $2;
 $9 = $3;
 _buffer_create($salt_buffer,$8,$9);
 $10 = $5;
 _buffer_create_from_hex($goal_buffer,$10);
 _buffer_calloc($key,32);
 _buffer_calloc($final_key,0);
 $i = 0;
 while(1) {
  $11 = $i;
  $12 = (($goal_buffer) + 4|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($11>>>0)<($13>>>0);
  if (!($14)) {
   break;
  }
  $15 = $i;
  $16 = $15 >> 5;
  $17 = $4;
  ;HEAP32[$password_buffer$byval_copy+0>>2]=HEAP32[$password_buffer+0>>2]|0;HEAP32[$password_buffer$byval_copy+4>>2]=HEAP32[$password_buffer+4>>2]|0;HEAP32[$password_buffer$byval_copy+8>>2]=HEAP32[$password_buffer+8>>2]|0;
  ;HEAP32[$salt_buffer$byval_copy+0>>2]=HEAP32[$salt_buffer+0>>2]|0;HEAP32[$salt_buffer$byval_copy+4>>2]=HEAP32[$salt_buffer+4>>2]|0;HEAP32[$salt_buffer$byval_copy+8>>2]=HEAP32[$salt_buffer+8>>2]|0;
  _pbkdf($password_buffer$byval_copy,$salt_buffer$byval_copy,$16,$17,$key);
  $18 = (($goal_buffer) + 4|0);
  $19 = HEAP32[$18>>2]|0;
  $20 = $i;
  $21 = (($19) - ($20))|0;
  $22 = ($21>>>0)<(32);
  if ($22) {
   $23 = (($goal_buffer) + 4|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = $i;
   $26 = (($24) - ($25))|0;
   _buffer_realloc($key,$26);
  }
  ;HEAP32[$key$byval_copy+0>>2]=HEAP32[$key+0>>2]|0;HEAP32[$key$byval_copy+4>>2]=HEAP32[$key+4>>2]|0;HEAP32[$key$byval_copy+8>>2]=HEAP32[$key+8>>2]|0;
  _buffer_push($final_key,$key$byval_copy);
  $27 = $i;
  $28 = (($27) + 32)|0;
  $i = $28;
 }
 ;HEAP32[$final_key$byval_copy+0>>2]=HEAP32[$final_key+0>>2]|0;HEAP32[$final_key$byval_copy+4>>2]=HEAP32[$final_key+4>>2]|0;HEAP32[$final_key$byval_copy+8>>2]=HEAP32[$final_key+8>>2]|0;
 ;HEAP32[$goal_buffer$byval_copy+0>>2]=HEAP32[$goal_buffer+0>>2]|0;HEAP32[$goal_buffer$byval_copy+4>>2]=HEAP32[$goal_buffer+4>>2]|0;HEAP32[$goal_buffer$byval_copy+8>>2]=HEAP32[$goal_buffer+8>>2]|0;
 $29 = (_buffer_is_equal($final_key$byval_copy,$goal_buffer$byval_copy)|0);
 $30 = ($29|0)!=(0);
 if ($30) {
  _buffer_free($password_buffer);
  _buffer_free($salt_buffer);
  _buffer_free($goal_buffer);
  _buffer_free($key);
  _buffer_free($final_key);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((14720|0),(14488|0),22,(14760|0));
  // unreachable;
 }
}
function _test_sha() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $n = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $n = 100;
 $i = 0;
 while(1) {
  $0 = $i;
  $1 = $n;
  $2 = ($0|0)<($1|0);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = (14776 + ($3<<2)|0);
  $5 = HEAP32[$4>>2]|0;
  $6 = $i;
  $7 = (15176 + ($6<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  _check_hash($5,$8);
  $9 = $i;
  $10 = (($9) + 1)|0;
  $i = $10;
 }
 $11 = (_sha_simple(15576)|0);
 $12 = (_strcmp($11,15584)|0);
 $13 = ($12|0)==(0);
 if (!($13)) {
  ___assert_fail((15656|0),(15760|0),235,(15776|0));
  // unreachable;
 }
 $14 = (_sha_simple_hex(15792)|0);
 $15 = (_strcmp($14,15584)|0);
 $16 = ($15|0)==(0);
 if ($16) {
  (_puts((15920|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((15808|0),(15760|0),236,(15776|0));
  // unreachable;
 }
}
function _check_hash($message,$goal) {
 $message = $message|0;
 $goal = $goal|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $digest = 0, $digest$byval_copy = 0, $goal_buffer = 0, $goal_buffer$byval_copy = 0, $hash = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0;
 $goal_buffer$byval_copy = sp + 120|0;
 $digest$byval_copy = sp + 108|0;
 $message_buffer$byval_copy = sp + 96|0;
 $message_buffer = sp + 24|0;
 $goal_buffer = sp + 12|0;
 $digest = sp;
 $hash = sp + 40|0;
 $0 = $message;
 $1 = $goal;
 $2 = $0;
 _buffer_create_from_str($message_buffer,$2);
 $3 = $1;
 _buffer_create_from_hex($goal_buffer,$3);
 _buffer_calloc($digest,32);
 _sha_init($hash);
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 _sha_update($hash,$message_buffer$byval_copy);
 _sha_end($hash,$digest);
 ;HEAP32[$digest$byval_copy+0>>2]=HEAP32[$digest+0>>2]|0;HEAP32[$digest$byval_copy+4>>2]=HEAP32[$digest+4>>2]|0;HEAP32[$digest$byval_copy+8>>2]=HEAP32[$digest+8>>2]|0;
 ;HEAP32[$goal_buffer$byval_copy+0>>2]=HEAP32[$goal_buffer+0>>2]|0;HEAP32[$goal_buffer$byval_copy+4>>2]=HEAP32[$goal_buffer+4>>2]|0;HEAP32[$goal_buffer$byval_copy+8>>2]=HEAP32[$goal_buffer+8>>2]|0;
 $4 = (_buffer_is_equal($digest$byval_copy,$goal_buffer$byval_copy)|0);
 $5 = ($4|0)!=(0);
 if ($5) {
  _buffer_free($message_buffer);
  _buffer_free($goal_buffer);
  _buffer_free($digest);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((28544|0),(15760|0),16,(28584|0));
  // unreachable;
 }
}
function _test_buffer_hex() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b = 0, $b$byval_copy = 0, $hex = 0, $i = 0;
 var dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $b$byval_copy = sp + 20|0;
 $hex = sp + 32|0;
 $b = sp + 8|0;
 dest=$hex+0|0; src=28600+0|0; stop=dest+33|0; do { HEAP8[dest>>0]=HEAP8[src>>0]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));
 $i = 32;
 while(1) {
  $1 = $i;
  $2 = ($1|0)>=(0);
  if (!($2)) {
   label = 7;
   break;
  }
  $3 = $i;
  $4 = (($hex) + ($3)|0);
  HEAP8[$4>>0] = 0;
  _buffer_create_from_hex($b,$hex);
  $5 = (($b) + 4|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = $6<<1;
  $8 = (($7) + 1)|0;
  $9 = (_llvm_stacksave()|0);
  $0 = $9;
  $10 = STACKTOP; STACKTOP = STACKTOP + ((((1*$8)|0)+15)&-16)|0;
  ;HEAP32[$b$byval_copy+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy+8>>2]=HEAP32[$b+8>>2]|0;
  _buffer_encode($b$byval_copy,$10);
  $11 = (_strcmp($10,$hex)|0);
  $12 = ($11|0)==(0);
  if (!($12)) {
   label = 4;
   break;
  }
  _buffer_free($b);
  $13 = $0;
  _llvm_stackrestore(($13|0));
  $14 = $i;
  $15 = (($14) - 2)|0;
  $i = $15;
 }
 if ((label|0) == 4) {
  ___assert_fail((28640|0),(28672|0),14,(28688|0));
  // unreachable;
 }
 else if ((label|0) == 7) {
  (_puts((28704|0))|0);
  STACKTOP = sp;return;
 }
}
function _test_buffer_push_aligned() {
 var $0 = 0, $1 = 0, $a = 0, $a$byval_copy = 0, $b = 0, $b$byval_copy = 0, $c = 0, $c$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $c$byval_copy = sp + 60|0;
 $a$byval_copy = sp;
 $b$byval_copy = sp + 12|0;
 $a = sp + 24|0;
 $b = sp + 36|0;
 $c = sp + 48|0;
 _buffer_create_from_str($a,28720);
 _buffer_create_from_str($b,28728);
 _buffer_create_from_str($c,28744);
 ;HEAP32[$b$byval_copy+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy+8>>2]=HEAP32[$b+8>>2]|0;
 _buffer_push($a,$b$byval_copy);
 ;HEAP32[$a$byval_copy+0>>2]=HEAP32[$a+0>>2]|0;HEAP32[$a$byval_copy+4>>2]=HEAP32[$a+4>>2]|0;HEAP32[$a$byval_copy+8>>2]=HEAP32[$a+8>>2]|0;
 ;HEAP32[$c$byval_copy+0>>2]=HEAP32[$c+0>>2]|0;HEAP32[$c$byval_copy+4>>2]=HEAP32[$c+4>>2]|0;HEAP32[$c$byval_copy+8>>2]=HEAP32[$c+8>>2]|0;
 $0 = (_buffer_is_equal($a$byval_copy,$c$byval_copy)|0);
 $1 = ($0|0)!=(0);
 if ($1) {
  _buffer_free($a);
  _buffer_free($b);
  _buffer_free($c);
  (_puts((28816|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((28760|0),(28672|0),26,(28784|0));
  // unreachable;
 }
}
function _test_buffer_push() {
 var $0 = 0, $1 = 0, $a = 0, $a$byval_copy = 0, $b = 0, $b$byval_copy = 0, $c = 0, $c$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $c$byval_copy = sp + 60|0;
 $a$byval_copy = sp;
 $b$byval_copy = sp + 12|0;
 $a = sp + 24|0;
 $b = sp + 36|0;
 $c = sp + 48|0;
 _buffer_create_from_str($a,28848);
 _buffer_create_from_str($b,28856);
 _buffer_create_from_str($c,28864);
 ;HEAP32[$b$byval_copy+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy+8>>2]=HEAP32[$b+8>>2]|0;
 _buffer_push($a,$b$byval_copy);
 ;HEAP32[$a$byval_copy+0>>2]=HEAP32[$a+0>>2]|0;HEAP32[$a$byval_copy+4>>2]=HEAP32[$a+4>>2]|0;HEAP32[$a$byval_copy+8>>2]=HEAP32[$a+8>>2]|0;
 ;HEAP32[$c$byval_copy+0>>2]=HEAP32[$c+0>>2]|0;HEAP32[$c$byval_copy+4>>2]=HEAP32[$c+4>>2]|0;HEAP32[$c$byval_copy+8>>2]=HEAP32[$c+8>>2]|0;
 $0 = (_buffer_is_equal($a$byval_copy,$c$byval_copy)|0);
 $1 = ($0|0)!=(0);
 if ($1) {
  _buffer_free($a);
  _buffer_free($b);
  _buffer_free($c);
  (_puts((28904|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((28760|0),(28672|0),40,(28880|0));
  // unreachable;
 }
}
function _test_buffer_realloc() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $b = 0, $b$byval_copy = 0, $b$byval_copy1 = 0, $hex = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $b$byval_copy1 = sp + 24|0;
 $b$byval_copy = sp;
 $hex = sp + 36|0;
 $b = sp + 12|0;
 _buffer_calloc($b,3);
 _buffer_realloc($b,1);
 ;HEAP32[$b$byval_copy+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy+8>>2]=HEAP32[$b+8>>2]|0;
 _buffer_encode($b$byval_copy,$hex);
 $0 = (_strcmp($hex,28928)|0);
 $1 = ($0|0)==(0);
 if (!($1)) {
  ___assert_fail((28936|0),(28672|0),54,(28960|0));
  // unreachable;
 }
 _buffer_realloc($b,5);
 ;HEAP32[$b$byval_copy1+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy1+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy1+8>>2]=HEAP32[$b+8>>2]|0;
 _buffer_encode($b$byval_copy1,$hex);
 $2 = (_strcmp($hex,28984)|0);
 $3 = ($2|0)==(0);
 if ($3) {
  _buffer_free($b);
  (_puts((29032|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((29000|0),(28672|0),58,(28960|0));
  // unreachable;
 }
}
function _test_buffer_slice() {
 var $0 = 0, $1 = 0, $b = 0, $b$byval_copy = 0, $b2 = 0, $b2$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $b2$byval_copy = sp + 36|0;
 $b$byval_copy = sp;
 $b = sp + 12|0;
 $b2 = sp + 24|0;
 _buffer_create($b,29056,17);
 _buffer_create($b2,29080,13);
 _buffer_slice($b,4);
 ;HEAP32[$b$byval_copy+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$b$byval_copy+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$b$byval_copy+8>>2]=HEAP32[$b+8>>2]|0;
 ;HEAP32[$b2$byval_copy+0>>2]=HEAP32[$b2+0>>2]|0;HEAP32[$b2$byval_copy+4>>2]=HEAP32[$b2+4>>2]|0;HEAP32[$b2$byval_copy+8>>2]=HEAP32[$b2+8>>2]|0;
 $0 = (_buffer_is_equal($b$byval_copy,$b2$byval_copy)|0);
 $1 = ($0|0)!=(0);
 if ($1) {
  _buffer_free($b);
  _buffer_free($b2);
  (_puts((29144|0))|0);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((29096|0),(28672|0),69,(29120|0));
  // unreachable;
 }
}
function _pbkdf($password,$salt,$block_index,$rounds,$key) {
 $password = $password|0;
 $salt = $salt|0;
 $block_index = $block_index|0;
 $rounds = $rounds|0;
 $key = $key|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $base_mac = 0, $base_mac$byval_copy = 0, $base_mac$byval_copy1 = 0, $i = 0, $index = 0, $index$byval_copy = 0, $mac = 0, $password$byval_copy = 0, $salt$byval_copy = 0, $temp = 0, $temp$byval_copy = 0, $temp$byval_copy2 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 704|0;
 $temp$byval_copy2 = sp + 692|0;
 $temp$byval_copy = sp + 680|0;
 $base_mac$byval_copy1 = sp + 584|0;
 $$byval_copy = sp + 568|0;
 $index$byval_copy = sp + 556|0;
 $salt$byval_copy = sp + 544|0;
 $base_mac$byval_copy = sp + 448|0;
 $password$byval_copy = sp + 432|0;
 $base_mac = sp + 224|0;
 $mac = sp + 128|0;
 $temp = sp + 112|0;
 $3 = sp + 16|0;
 $index = sp + 4|0;
 $4 = sp + 328|0;
 $0 = $block_index;
 $1 = $rounds;
 $2 = $key;
 $5 = $2;
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)==(32);
 if (!($8)) {
  ___assert_fail((29168|0),(29192|0),8,(29208|0));
  // unreachable;
 }
 ;HEAP32[$password$byval_copy+0>>2]=HEAP32[$password+0>>2]|0;HEAP32[$password$byval_copy+4>>2]=HEAP32[$password+4>>2]|0;HEAP32[$password$byval_copy+8>>2]=HEAP32[$password+8>>2]|0;
 _hmac_init($base_mac,$password$byval_copy);
 _buffer_calloc($temp,32);
 dest=$base_mac$byval_copy+0|0; src=$base_mac+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _hmac_clone($3,$base_mac$byval_copy);
 dest=$mac+0|0; src=$3+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 ;HEAP32[$salt$byval_copy+0>>2]=HEAP32[$salt+0>>2]|0;HEAP32[$salt$byval_copy+4>>2]=HEAP32[$salt+4>>2]|0;HEAP32[$salt$byval_copy+8>>2]=HEAP32[$salt+8>>2]|0;
 _hmac_update($mac,$salt$byval_copy);
 _buffer_calloc($index,4);
 $9 = $0;
 $10 = (($9) + 1)|0;
 $11 = HEAP32[$index>>2]|0;
 HEAP32[$11>>2] = $10;
 ;HEAP32[$index$byval_copy+0>>2]=HEAP32[$index+0>>2]|0;HEAP32[$index$byval_copy+4>>2]=HEAP32[$index+4>>2]|0;HEAP32[$index$byval_copy+8>>2]=HEAP32[$index+8>>2]|0;
 _hmac_update($mac,$index$byval_copy);
 _buffer_free($index);
 $12 = $2;
 _hmac_end($mac,$12);
 $13 = $2;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$13+0>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$13+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$13+8>>2]|0;
 _buffer_copy($temp,$$byval_copy);
 $i = 1;
 while(1) {
  $14 = $i;
  $15 = $1;
  $16 = ($14|0)<($15|0);
  if (!($16)) {
   break;
  }
  dest=$base_mac$byval_copy1+0|0; src=$base_mac+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
  _hmac_clone($4,$base_mac$byval_copy1);
  dest=$mac+0|0; src=$4+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
  ;HEAP32[$temp$byval_copy+0>>2]=HEAP32[$temp+0>>2]|0;HEAP32[$temp$byval_copy+4>>2]=HEAP32[$temp+4>>2]|0;HEAP32[$temp$byval_copy+8>>2]=HEAP32[$temp+8>>2]|0;
  _hmac_update($mac,$temp$byval_copy);
  _hmac_end($mac,$temp);
  $17 = $2;
  ;HEAP32[$temp$byval_copy2+0>>2]=HEAP32[$temp+0>>2]|0;HEAP32[$temp$byval_copy2+4>>2]=HEAP32[$temp+4>>2]|0;HEAP32[$temp$byval_copy2+8>>2]=HEAP32[$temp+8>>2]|0;
  _buffer_xor($17,$temp$byval_copy2);
  $18 = $i;
  $19 = (($18) + 1)|0;
  $i = $19;
 }
 _buffer_free($temp);
 _hmac_free($base_mac);
 STACKTOP = sp;return;
}
function _pbkdf_simple($password,$salt,$block_index,$rounds) {
 $password = $password|0;
 $salt = $salt|0;
 $block_index = $block_index|0;
 $rounds = $rounds|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $password_buffer = 0, $password_buffer$byval_copy = 0, $salt_buffer = 0, $salt_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $salt_buffer$byval_copy = sp + 52|0;
 $password_buffer$byval_copy = sp;
 $password_buffer = sp + 28|0;
 $salt_buffer = sp + 40|0;
 $0 = $password;
 $1 = $salt;
 $2 = $block_index;
 $3 = $rounds;
 $4 = $0;
 _buffer_create_from_str($password_buffer,$4);
 $5 = $1;
 _buffer_create_from_str($salt_buffer,$5);
 $6 = $2;
 $7 = $3;
 ;HEAP32[$password_buffer$byval_copy+0>>2]=HEAP32[$password_buffer+0>>2]|0;HEAP32[$password_buffer$byval_copy+4>>2]=HEAP32[$password_buffer+4>>2]|0;HEAP32[$password_buffer$byval_copy+8>>2]=HEAP32[$password_buffer+8>>2]|0;
 ;HEAP32[$salt_buffer$byval_copy+0>>2]=HEAP32[$salt_buffer+0>>2]|0;HEAP32[$salt_buffer$byval_copy+4>>2]=HEAP32[$salt_buffer+4>>2]|0;HEAP32[$salt_buffer$byval_copy+8>>2]=HEAP32[$salt_buffer+8>>2]|0;
 __simple($password_buffer$byval_copy,$salt_buffer$byval_copy,$6,$7,29216);
 _buffer_free($password_buffer);
 _buffer_free($salt_buffer);
 STACKTOP = sp;return (29216|0);
}
function __simple($password,$salt,$block_index,$rounds,$result) {
 $password = $password|0;
 $salt = $salt|0;
 $block_index = $block_index|0;
 $rounds = $rounds|0;
 $result = $result|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $password$byval_copy = 0, $result_buffer = 0, $result_buffer$byval_copy = 0, $salt$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $result_buffer$byval_copy = sp + 48|0;
 $salt$byval_copy = sp;
 $password$byval_copy = sp + 12|0;
 $result_buffer = sp + 36|0;
 $0 = $block_index;
 $1 = $rounds;
 $2 = $result;
 _buffer_calloc($result_buffer,32);
 $3 = $0;
 $4 = $1;
 ;HEAP32[$password$byval_copy+0>>2]=HEAP32[$password+0>>2]|0;HEAP32[$password$byval_copy+4>>2]=HEAP32[$password+4>>2]|0;HEAP32[$password$byval_copy+8>>2]=HEAP32[$password+8>>2]|0;
 ;HEAP32[$salt$byval_copy+0>>2]=HEAP32[$salt+0>>2]|0;HEAP32[$salt$byval_copy+4>>2]=HEAP32[$salt+4>>2]|0;HEAP32[$salt$byval_copy+8>>2]=HEAP32[$salt+8>>2]|0;
 _pbkdf($password$byval_copy,$salt$byval_copy,$3,$4,$result_buffer);
 $5 = $2;
 ;HEAP32[$result_buffer$byval_copy+0>>2]=HEAP32[$result_buffer+0>>2]|0;HEAP32[$result_buffer$byval_copy+4>>2]=HEAP32[$result_buffer+4>>2]|0;HEAP32[$result_buffer$byval_copy+8>>2]=HEAP32[$result_buffer+8>>2]|0;
 _buffer_encode($result_buffer$byval_copy,$5);
 _buffer_free($result_buffer);
 STACKTOP = sp;return;
}
function _pbkdf_simple_hex($password,$salt,$block_index,$rounds) {
 $password = $password|0;
 $salt = $salt|0;
 $block_index = $block_index|0;
 $rounds = $rounds|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $password_buffer = 0, $password_buffer$byval_copy = 0, $salt_buffer = 0, $salt_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $salt_buffer$byval_copy = sp + 52|0;
 $password_buffer$byval_copy = sp;
 $password_buffer = sp + 28|0;
 $salt_buffer = sp + 40|0;
 $0 = $password;
 $1 = $salt;
 $2 = $block_index;
 $3 = $rounds;
 $4 = $0;
 _buffer_create_from_hex($password_buffer,$4);
 $5 = $1;
 _buffer_create_from_hex($salt_buffer,$5);
 $6 = $2;
 $7 = $3;
 ;HEAP32[$password_buffer$byval_copy+0>>2]=HEAP32[$password_buffer+0>>2]|0;HEAP32[$password_buffer$byval_copy+4>>2]=HEAP32[$password_buffer+4>>2]|0;HEAP32[$password_buffer$byval_copy+8>>2]=HEAP32[$password_buffer+8>>2]|0;
 ;HEAP32[$salt_buffer$byval_copy+0>>2]=HEAP32[$salt_buffer+0>>2]|0;HEAP32[$salt_buffer$byval_copy+4>>2]=HEAP32[$salt_buffer+4>>2]|0;HEAP32[$salt_buffer$byval_copy+8>>2]=HEAP32[$salt_buffer+8>>2]|0;
 __simple($password_buffer$byval_copy,$salt_buffer$byval_copy,$6,$7,29288);
 _buffer_free($password_buffer);
 _buffer_free($salt_buffer);
 STACKTOP = sp;return (29288|0);
}
function _hmac_init($agg$result,$key) {
 $agg$result = $agg$result|0;
 $key = $key|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $hash = 0, $i = 0, $i1 = 0, $key$byval_copy = 0, $key$byval_copy1 = 0, $mac = 0, $real_key = 0, $real_key$byval_copy = 0, $real_key$byval_copy2 = 0, dest = 0;
 var label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 352|0;
 $real_key$byval_copy2 = sp + 332|0;
 $real_key$byval_copy = sp + 320|0;
 $key$byval_copy1 = sp + 308|0;
 $key$byval_copy = sp + 296|0;
 $mac = sp + 200|0;
 $real_key = sp + 188|0;
 $0 = sp + 176|0;
 $1 = sp + 112|0;
 $hash = sp + 64|0;
 $2 = sp + 8|0;
 $3 = sp + 128|0;
 $4 = (($key) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5>>>0)<=(64);
 if ($6) {
  ;HEAP32[$key$byval_copy+0>>2]=HEAP32[$key+0>>2]|0;HEAP32[$key$byval_copy+4>>2]=HEAP32[$key+4>>2]|0;HEAP32[$key$byval_copy+8>>2]=HEAP32[$key+8>>2]|0;
  _buffer_clone($0,$key$byval_copy);
  ;HEAP32[$real_key+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$real_key+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$real_key+8>>2]=HEAP32[$0+8>>2]|0;
  $7 = (($key) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($8>>>0)<(64);
  if ($9) {
   _buffer_realloc($real_key,64);
  }
 } else {
  _buffer_calloc($1,32);
  ;HEAP32[$real_key+0>>2]=HEAP32[$1+0>>2]|0;HEAP32[$real_key+4>>2]=HEAP32[$1+4>>2]|0;HEAP32[$real_key+8>>2]=HEAP32[$1+8>>2]|0;
  _sha_init($hash);
  ;HEAP32[$key$byval_copy1+0>>2]=HEAP32[$key+0>>2]|0;HEAP32[$key$byval_copy1+4>>2]=HEAP32[$key+4>>2]|0;HEAP32[$key$byval_copy1+8>>2]=HEAP32[$key+8>>2]|0;
  _sha_update($hash,$key$byval_copy1);
  _sha_end($hash,$real_key);
  _buffer_realloc($real_key,64);
 }
 $i = 0;
 while(1) {
  $10 = $i;
  $11 = ($10|0)<(16);
  if (!($11)) {
   break;
  }
  $12 = $i;
  $13 = HEAP32[$real_key>>2]|0;
  $14 = (($13) + ($12<<2)|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = $15 ^ 909522486;
  HEAP32[$14>>2] = $16;
  $17 = $i;
  $18 = (($17) + 1)|0;
  $i = $18;
 }
 _sha_init($2);
 dest=$mac+0|0; src=$2+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 ;HEAP32[$real_key$byval_copy+0>>2]=HEAP32[$real_key+0>>2]|0;HEAP32[$real_key$byval_copy+4>>2]=HEAP32[$real_key+4>>2]|0;HEAP32[$real_key$byval_copy+8>>2]=HEAP32[$real_key+8>>2]|0;
 _sha_update($mac,$real_key$byval_copy);
 $i1 = 0;
 while(1) {
  $19 = $i1;
  $20 = ($19|0)<(16);
  if (!($20)) {
   break;
  }
  $21 = $i1;
  $22 = HEAP32[$real_key>>2]|0;
  $23 = (($22) + ($21<<2)|0);
  $24 = HEAP32[$23>>2]|0;
  $25 = $24 ^ 1785358954;
  HEAP32[$23>>2] = $25;
  $26 = $i1;
  $27 = (($26) + 1)|0;
  $i1 = $27;
 }
 $28 = (($mac) + 48|0);
 _sha_init($3);
 dest=$28+0|0; src=$3+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $29 = (($mac) + 48|0);
 ;HEAP32[$real_key$byval_copy2+0>>2]=HEAP32[$real_key+0>>2]|0;HEAP32[$real_key$byval_copy2+4>>2]=HEAP32[$real_key+4>>2]|0;HEAP32[$real_key$byval_copy2+8>>2]=HEAP32[$real_key+8>>2]|0;
 _sha_update($29,$real_key$byval_copy2);
 _buffer_free($real_key);
 dest=$agg$result+0|0; src=$mac+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _hmac_free($context) {
 $context = $context|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $context;
 $1 = $0;
 _sha_free($1);
 $2 = $0;
 $3 = (($2) + 48|0);
 _sha_free($3);
 STACKTOP = sp;return;
}
function _hmac_clone($agg$result,$context) {
 $agg$result = $agg$result|0;
 $context = $context|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $mac = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 288|0;
 $$byval_copy1 = sp + 240|0;
 $$byval_copy = sp;
 $mac = sp + 48|0;
 $0 = sp + 144|0;
 $1 = sp + 192|0;
 dest=$$byval_copy+0|0; src=$context+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _sha_clone($0,$$byval_copy);
 dest=$mac+0|0; src=$0+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $2 = (($mac) + 48|0);
 $3 = (($context) + 48|0);
 dest=$$byval_copy1+0|0; src=$3+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _sha_clone($1,$$byval_copy1);
 dest=$2+0|0; src=$1+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$agg$result+0|0; src=$mac+0|0; stop=dest+96|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _hmac_update($context,$message) {
 $context = $context|0;
 $message = $message|0;
 var $0 = 0, $1 = 0, $message$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $message$byval_copy = sp + 4|0;
 $0 = $context;
 $1 = $0;
 ;HEAP32[$message$byval_copy+0>>2]=HEAP32[$message+0>>2]|0;HEAP32[$message$byval_copy+4>>2]=HEAP32[$message+4>>2]|0;HEAP32[$message$byval_copy+8>>2]=HEAP32[$message+8>>2]|0;
 _sha_update($1,$message$byval_copy);
 STACKTOP = sp;return;
}
function _hmac_end($context,$tag) {
 $context = $context|0;
 $tag = $tag|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp + 8|0;
 $0 = $context;
 $1 = $tag;
 $2 = $0;
 $3 = $1;
 _sha_end($2,$3);
 $4 = $0;
 $5 = (($4) + 48|0);
 $6 = $1;
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$6+0>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$6+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$6+8>>2]|0;
 _sha_update($5,$$byval_copy);
 $7 = $0;
 $8 = (($7) + 48|0);
 $9 = $1;
 _sha_end($8,$9);
 STACKTOP = sp;return;
}
function _hmac_simple($key,$message) {
 $key = $key|0;
 $message = $message|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $key_buffer = 0, $key_buffer$byval_copy = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $message_buffer$byval_copy = sp + 44|0;
 $key_buffer$byval_copy = sp;
 $key_buffer = sp + 20|0;
 $message_buffer = sp + 32|0;
 $0 = $key;
 $1 = $message;
 $2 = $0;
 _buffer_create_from_str($key_buffer,$2);
 $3 = $1;
 _buffer_create_from_str($message_buffer,$3);
 ;HEAP32[$key_buffer$byval_copy+0>>2]=HEAP32[$key_buffer+0>>2]|0;HEAP32[$key_buffer$byval_copy+4>>2]=HEAP32[$key_buffer+4>>2]|0;HEAP32[$key_buffer$byval_copy+8>>2]=HEAP32[$key_buffer+8>>2]|0;
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 __simple499($key_buffer$byval_copy,$message_buffer$byval_copy,29360);
 _buffer_free($key_buffer);
 _buffer_free($message_buffer);
 STACKTOP = sp;return (29360|0);
}
function __simple499($key,$message,$result) {
 $key = $key|0;
 $message = $message|0;
 $result = $result|0;
 var $0 = 0, $1 = 0, $context = 0, $key$byval_copy = 0, $message$byval_copy = 0, $result_buffer = 0, $result_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $result_buffer$byval_copy = sp + 136|0;
 $message$byval_copy = sp;
 $key$byval_copy = sp + 12|0;
 $result_buffer = sp + 28|0;
 $context = sp + 40|0;
 $0 = $result;
 _buffer_calloc($result_buffer,32);
 ;HEAP32[$key$byval_copy+0>>2]=HEAP32[$key+0>>2]|0;HEAP32[$key$byval_copy+4>>2]=HEAP32[$key+4>>2]|0;HEAP32[$key$byval_copy+8>>2]=HEAP32[$key+8>>2]|0;
 _hmac_init($context,$key$byval_copy);
 ;HEAP32[$message$byval_copy+0>>2]=HEAP32[$message+0>>2]|0;HEAP32[$message$byval_copy+4>>2]=HEAP32[$message+4>>2]|0;HEAP32[$message$byval_copy+8>>2]=HEAP32[$message+8>>2]|0;
 _hmac_update($context,$message$byval_copy);
 _hmac_end($context,$result_buffer);
 $1 = $0;
 ;HEAP32[$result_buffer$byval_copy+0>>2]=HEAP32[$result_buffer+0>>2]|0;HEAP32[$result_buffer$byval_copy+4>>2]=HEAP32[$result_buffer+4>>2]|0;HEAP32[$result_buffer$byval_copy+8>>2]=HEAP32[$result_buffer+8>>2]|0;
 _buffer_encode($result_buffer$byval_copy,$1);
 _buffer_free($result_buffer);
 STACKTOP = sp;return;
}
function _hmac_simple_hex($key,$message) {
 $key = $key|0;
 $message = $message|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $key_buffer = 0, $key_buffer$byval_copy = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $message_buffer$byval_copy = sp + 44|0;
 $key_buffer$byval_copy = sp;
 $key_buffer = sp + 20|0;
 $message_buffer = sp + 32|0;
 $0 = $key;
 $1 = $message;
 $2 = $0;
 _buffer_create_from_hex($key_buffer,$2);
 $3 = $1;
 _buffer_create_from_hex($message_buffer,$3);
 ;HEAP32[$key_buffer$byval_copy+0>>2]=HEAP32[$key_buffer+0>>2]|0;HEAP32[$key_buffer$byval_copy+4>>2]=HEAP32[$key_buffer+4>>2]|0;HEAP32[$key_buffer$byval_copy+8>>2]=HEAP32[$key_buffer+8>>2]|0;
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 __simple499($key_buffer$byval_copy,$message_buffer$byval_copy,29432);
 _buffer_free($key_buffer);
 _buffer_free($message_buffer);
 STACKTOP = sp;return (29432|0);
}
function _sha_init($agg$result) {
 $agg$result = $agg$result|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $context = 0, $i = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $context = sp + 16|0;
 $0 = sp + 4|0;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = ($1|0)<(8);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = (29504 + ($3<<2)|0);
  $5 = HEAP32[$4>>2]|0;
  $6 = $i;
  $7 = (($context) + ($6<<2)|0);
  HEAP32[$7>>2] = $5;
  $8 = $i;
  $9 = (($8) + 1)|0;
  $i = $9;
 }
 $10 = (($context) + 32|0);
 HEAP32[$10>>2] = 0;
 $11 = (($context) + 36|0);
 _buffer_calloc($0,0);
 ;HEAP32[$11+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$11+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$11+8>>2]=HEAP32[$0+8>>2]|0;
 dest=$agg$result+0|0; src=$context+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _sha_free($context) {
 $context = $context|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $context;
 $1 = $0;
 $2 = (($1) + 36|0);
 _buffer_free($2);
 STACKTOP = sp;return;
}
function _sha_clone($agg$result,$context) {
 $agg$result = $agg$result|0;
 $context = $context|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $hash = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $$byval_copy = sp + 60|0;
 $hash = sp;
 $0 = sp + 48|0;
 dest=$hash+0|0; src=$context+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $1 = (($hash) + 36|0);
 $2 = (($context) + 36|0);
 ;HEAP32[$$byval_copy+0>>2]=HEAP32[$2+0>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$2+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$2+8>>2]|0;
 _buffer_clone($0,$$byval_copy);
 ;HEAP32[$1+0>>2]=HEAP32[$0+0>>2]|0;HEAP32[$1+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$1+8>>2]=HEAP32[$0+8>>2]|0;
 dest=$agg$result+0|0; src=$hash+0|0; stop=dest+48|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _sha_update($context,$message) {
 $context = $context|0;
 $message = $message|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $length = 0, $message$byval_copy = 0, $offset = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $message$byval_copy = sp + 12|0;
 $0 = $context;
 $1 = $0;
 $2 = (($1) + 36|0);
 ;HEAP32[$message$byval_copy+0>>2]=HEAP32[$message+0>>2]|0;HEAP32[$message$byval_copy+4>>2]=HEAP32[$message+4>>2]|0;HEAP32[$message$byval_copy+8>>2]=HEAP32[$message+8>>2]|0;
 _buffer_push($2,$message$byval_copy);
 $3 = $0;
 $4 = (($3) + 36|0);
 $5 = (($4) + 4|0);
 $6 = HEAP32[$5>>2]|0;
 $length = $6;
 $offset = 0;
 $offset = 0;
 while(1) {
  $7 = $offset;
  $8 = (($7) + 64)|0;
  $9 = $length;
  $10 = ($8>>>0)<=($9>>>0);
  if (!($10)) {
   break;
  }
  $11 = $0;
  $12 = $0;
  $13 = (($12) + 36|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $offset;
  $16 = (($14) + ($15<<2)|0);
  __process_block($11,$16);
  $17 = $offset;
  $18 = (($17) + 64)|0;
  $offset = $18;
 }
 $19 = $offset;
 $20 = ($19|0)!=(0);
 if (!($20)) {
  STACKTOP = sp;return;
 }
 $21 = $0;
 $22 = (($21) + 36|0);
 $23 = $offset;
 _buffer_slice($22,$23);
 STACKTOP = sp;return;
}
function __process_block($context,$block) {
 $context = $context|0;
 $block = $block|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $Ch = 0, $H = 0, $Maj = 0, $T1 = 0, $T2 = 0, $W = 0, $a = 0;
 var $b = 0, $c = 0, $d = 0, $e = 0, $f = 0, $g = 0, $gamma0 = 0, $gamma1 = 0, $h = 0, $i = 0, $sigma0 = 0, $sigma1 = 0, $x0 = 0, $x1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 352|0;
 $W = sp + 48|0;
 $0 = $context;
 $1 = $block;
 $2 = $0;
 $H = $2;
 $3 = $H;
 $4 = HEAP32[$3>>2]|0;
 $a = $4;
 $5 = $H;
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $b = $7;
 $8 = $H;
 $9 = (($8) + 8|0);
 $10 = HEAP32[$9>>2]|0;
 $c = $10;
 $11 = $H;
 $12 = (($11) + 12|0);
 $13 = HEAP32[$12>>2]|0;
 $d = $13;
 $14 = $H;
 $15 = (($14) + 16|0);
 $16 = HEAP32[$15>>2]|0;
 $e = $16;
 $17 = $H;
 $18 = (($17) + 20|0);
 $19 = HEAP32[$18>>2]|0;
 $f = $19;
 $20 = $H;
 $21 = (($20) + 24|0);
 $22 = HEAP32[$21>>2]|0;
 $g = $22;
 $23 = $H;
 $24 = (($23) + 28|0);
 $25 = HEAP32[$24>>2]|0;
 $h = $25;
 $i = 0;
 while(1) {
  $26 = $i;
  $27 = ($26|0)<(64);
  if (!($27)) {
   break;
  }
  $28 = $e;
  $29 = $f;
  $30 = $28 & $29;
  $31 = $e;
  $32 = $31 ^ -1;
  $33 = $g;
  $34 = $32 & $33;
  $35 = $30 ^ $34;
  $Ch = $35;
  $36 = $a;
  $37 = $b;
  $38 = $36 & $37;
  $39 = $a;
  $40 = $c;
  $41 = $39 & $40;
  $42 = $38 ^ $41;
  $43 = $b;
  $44 = $c;
  $45 = $43 & $44;
  $46 = $42 ^ $45;
  $Maj = $46;
  $47 = $a;
  $48 = $47 << 30;
  $49 = $a;
  $50 = $49 >>> 2;
  $51 = $48 | $50;
  $52 = $a;
  $53 = $52 << 19;
  $54 = $a;
  $55 = $54 >>> 13;
  $56 = $53 | $55;
  $57 = $51 ^ $56;
  $58 = $a;
  $59 = $58 << 10;
  $60 = $a;
  $61 = $60 >>> 22;
  $62 = $59 | $61;
  $63 = $57 ^ $62;
  $sigma0 = $63;
  $64 = $e;
  $65 = $64 << 26;
  $66 = $e;
  $67 = $66 >>> 6;
  $68 = $65 | $67;
  $69 = $e;
  $70 = $69 << 21;
  $71 = $e;
  $72 = $71 >>> 11;
  $73 = $70 | $72;
  $74 = $68 ^ $73;
  $75 = $e;
  $76 = $75 << 7;
  $77 = $e;
  $78 = $77 >>> 25;
  $79 = $76 | $78;
  $80 = $74 ^ $79;
  $sigma1 = $80;
  $81 = $i;
  $82 = ($81|0)<(16);
  if ($82) {
   $83 = $i;
   $84 = $1;
   $85 = (($84) + ($83<<2)|0);
   $86 = HEAP32[$85>>2]|0;
   $87 = $i;
   $88 = (($W) + ($87<<2)|0);
   HEAP32[$88>>2] = $86;
  } else {
   $89 = $i;
   $90 = (($89) - 15)|0;
   $91 = (($W) + ($90<<2)|0);
   $92 = HEAP32[$91>>2]|0;
   $x0 = $92;
   $93 = $i;
   $94 = (($93) - 2)|0;
   $95 = (($W) + ($94<<2)|0);
   $96 = HEAP32[$95>>2]|0;
   $x1 = $96;
   $97 = $x0;
   $98 = $97 << 25;
   $99 = $x0;
   $100 = $99 >>> 7;
   $101 = $98 | $100;
   $102 = $x0;
   $103 = $102 << 14;
   $104 = $x0;
   $105 = $104 >>> 18;
   $106 = $103 | $105;
   $107 = $101 ^ $106;
   $108 = $x0;
   $109 = $108 >>> 3;
   $110 = $107 ^ $109;
   $gamma0 = $110;
   $111 = $x1;
   $112 = $111 << 15;
   $113 = $x1;
   $114 = $113 >>> 17;
   $115 = $112 | $114;
   $116 = $x1;
   $117 = $116 << 13;
   $118 = $x1;
   $119 = $118 >>> 19;
   $120 = $117 | $119;
   $121 = $115 ^ $120;
   $122 = $x1;
   $123 = $122 >>> 10;
   $124 = $121 ^ $123;
   $gamma1 = $124;
   $125 = $gamma1;
   $126 = $i;
   $127 = (($126) - 7)|0;
   $128 = (($W) + ($127<<2)|0);
   $129 = HEAP32[$128>>2]|0;
   $130 = (($125) + ($129))|0;
   $131 = $gamma0;
   $132 = (($130) + ($131))|0;
   $133 = $i;
   $134 = (($133) - 16)|0;
   $135 = (($W) + ($134<<2)|0);
   $136 = HEAP32[$135>>2]|0;
   $137 = (($132) + ($136))|0;
   $138 = $i;
   $139 = (($W) + ($138<<2)|0);
   HEAP32[$139>>2] = $137;
  }
  $140 = $h;
  $141 = $sigma1;
  $142 = (($140) + ($141))|0;
  $143 = $Ch;
  $144 = (($142) + ($143))|0;
  $145 = $i;
  $146 = (29720 + ($145<<2)|0);
  $147 = HEAP32[$146>>2]|0;
  $148 = (($144) + ($147))|0;
  $149 = $i;
  $150 = (($W) + ($149<<2)|0);
  $151 = HEAP32[$150>>2]|0;
  $152 = (($148) + ($151))|0;
  $T1 = $152;
  $153 = $sigma0;
  $154 = $Maj;
  $155 = (($153) + ($154))|0;
  $T2 = $155;
  $156 = $g;
  $h = $156;
  $157 = $f;
  $g = $157;
  $158 = $e;
  $f = $158;
  $159 = $d;
  $160 = $T1;
  $161 = (($159) + ($160))|0;
  $e = $161;
  $162 = $c;
  $d = $162;
  $163 = $b;
  $c = $163;
  $164 = $a;
  $b = $164;
  $165 = $T1;
  $166 = $T2;
  $167 = (($165) + ($166))|0;
  $a = $167;
  $168 = $i;
  $169 = (($168) + 1)|0;
  $i = $169;
 }
 $170 = $a;
 $171 = $H;
 $172 = HEAP32[$171>>2]|0;
 $173 = (($172) + ($170))|0;
 HEAP32[$171>>2] = $173;
 $174 = $b;
 $175 = $H;
 $176 = (($175) + 4|0);
 $177 = HEAP32[$176>>2]|0;
 $178 = (($177) + ($174))|0;
 HEAP32[$176>>2] = $178;
 $179 = $c;
 $180 = $H;
 $181 = (($180) + 8|0);
 $182 = HEAP32[$181>>2]|0;
 $183 = (($182) + ($179))|0;
 HEAP32[$181>>2] = $183;
 $184 = $d;
 $185 = $H;
 $186 = (($185) + 12|0);
 $187 = HEAP32[$186>>2]|0;
 $188 = (($187) + ($184))|0;
 HEAP32[$186>>2] = $188;
 $189 = $e;
 $190 = $H;
 $191 = (($190) + 16|0);
 $192 = HEAP32[$191>>2]|0;
 $193 = (($192) + ($189))|0;
 HEAP32[$191>>2] = $193;
 $194 = $f;
 $195 = $H;
 $196 = (($195) + 20|0);
 $197 = HEAP32[$196>>2]|0;
 $198 = (($197) + ($194))|0;
 HEAP32[$196>>2] = $198;
 $199 = $g;
 $200 = $H;
 $201 = (($200) + 24|0);
 $202 = HEAP32[$201>>2]|0;
 $203 = (($202) + ($199))|0;
 HEAP32[$201>>2] = $203;
 $204 = $h;
 $205 = $H;
 $206 = (($205) + 28|0);
 $207 = HEAP32[$206>>2]|0;
 $208 = (($207) + ($204))|0;
 HEAP32[$206>>2] = $208;
 $209 = $0;
 $210 = (($209) + 32|0);
 $211 = HEAP32[$210>>2]|0;
 $212 = (($211) + 1)|0;
 HEAP32[$210>>2] = $212;
 STACKTOP = sp;return;
}
function _sha_end($context,$digest) {
 $context = $context|0;
 $digest = $digest|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $pad = 0, $pad$byval_copy = 0, $pad_length = 0, $total_length = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $pad$byval_copy = sp + 32|0;
 $pad = sp + 12|0;
 $0 = $context;
 $1 = $digest;
 $2 = $0;
 $3 = (($2) + 36|0);
 $4 = (($3) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5>>>0)>(55);
 $7 = $6 ? 128 : 64;
 $8 = $0;
 $9 = (($8) + 36|0);
 $10 = (($9) + 4|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = (($7) - ($11))|0;
 $pad_length = $12;
 $13 = $pad_length;
 _buffer_calloc($pad,$13);
 $14 = HEAP32[$pad>>2]|0;
 HEAP32[$14>>2] = -2147483648;
 $15 = $0;
 $16 = (($15) + 32|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $17<<6;
 $19 = $0;
 $20 = (($19) + 36|0);
 $21 = (($20) + 4|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = (($18) + ($22))|0;
 $24 = $23<<3;
 $total_length = $24;
 $25 = $0;
 $26 = (($25) + 36|0);
 ;HEAP32[$pad$byval_copy+0>>2]=HEAP32[$pad+0>>2]|0;HEAP32[$pad$byval_copy+4>>2]=HEAP32[$pad+4>>2]|0;HEAP32[$pad$byval_copy+8>>2]=HEAP32[$pad+8>>2]|0;
 _buffer_push($26,$pad$byval_copy);
 _buffer_free($pad);
 $27 = $total_length;
 $28 = $0;
 $29 = (($28) + 36|0);
 $30 = (($29) + 8|0);
 $31 = HEAP32[$30>>2]|0;
 $32 = (($31) - 1)|0;
 $33 = $0;
 $34 = (($33) + 36|0);
 $35 = HEAP32[$34>>2]|0;
 $36 = (($35) + ($32<<2)|0);
 HEAP32[$36>>2] = $27;
 $37 = $0;
 $38 = $0;
 $39 = (($38) + 36|0);
 $40 = HEAP32[$39>>2]|0;
 __process_block($37,$40);
 $41 = $0;
 $42 = (($41) + 36|0);
 $43 = (($42) + 4|0);
 $44 = HEAP32[$43>>2]|0;
 $45 = ($44|0)==(128);
 if ($45) {
  $46 = $0;
  $47 = $0;
  $48 = (($47) + 36|0);
  $49 = HEAP32[$48>>2]|0;
  $50 = (($49) + 64|0);
  __process_block($46,$50);
 }
 $51 = $1;
 $52 = (($51) + 4|0);
 $53 = HEAP32[$52>>2]|0;
 $54 = ($53|0)==(32);
 if (!($54)) {
  ___assert_fail((29536|0),(29560|0),94,(29568|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $55 = $i;
  $56 = ($55|0)<(8);
  if (!($56)) {
   break;
  }
  $57 = $i;
  $58 = $0;
  $59 = (($58) + ($57<<2)|0);
  $60 = HEAP32[$59>>2]|0;
  $61 = $i;
  $62 = $1;
  $63 = HEAP32[$62>>2]|0;
  $64 = (($63) + ($61<<2)|0);
  HEAP32[$64>>2] = $60;
  $65 = $i;
  $66 = (($65) + 1)|0;
  $i = $66;
 }
 $67 = $0;
 $68 = (($67) + 36|0);
 _buffer_free($68);
 STACKTOP = sp;return;
}
function _sha_simple($message) {
 $message = $message|0;
 var $0 = 0, $1 = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $message_buffer$byval_copy = sp + 16|0;
 $message_buffer = sp + 4|0;
 $0 = $message;
 $1 = $0;
 _buffer_create_from_str($message_buffer,$1);
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 __simple517($message_buffer$byval_copy,29576);
 _buffer_free($message_buffer);
 STACKTOP = sp;return (29576|0);
}
function __simple517($message,$result) {
 $message = $message|0;
 $result = $result|0;
 var $0 = 0, $1 = 0, $context = 0, $message$byval_copy = 0, $result_buffer = 0, $result_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $result_buffer$byval_copy = sp + 80|0;
 $message$byval_copy = sp;
 $result_buffer = sp + 16|0;
 $context = sp + 32|0;
 $0 = $result;
 _buffer_calloc($result_buffer,32);
 _sha_init($context);
 ;HEAP32[$message$byval_copy+0>>2]=HEAP32[$message+0>>2]|0;HEAP32[$message$byval_copy+4>>2]=HEAP32[$message+4>>2]|0;HEAP32[$message$byval_copy+8>>2]=HEAP32[$message+8>>2]|0;
 _sha_update($context,$message$byval_copy);
 _sha_end($context,$result_buffer);
 $1 = $0;
 ;HEAP32[$result_buffer$byval_copy+0>>2]=HEAP32[$result_buffer+0>>2]|0;HEAP32[$result_buffer$byval_copy+4>>2]=HEAP32[$result_buffer+4>>2]|0;HEAP32[$result_buffer$byval_copy+8>>2]=HEAP32[$result_buffer+8>>2]|0;
 _buffer_encode($result_buffer$byval_copy,$1);
 _buffer_free($result_buffer);
 STACKTOP = sp;return;
}
function _sha_simple_hex($message) {
 $message = $message|0;
 var $0 = 0, $1 = 0, $message_buffer = 0, $message_buffer$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $message_buffer$byval_copy = sp + 16|0;
 $message_buffer = sp + 4|0;
 $0 = $message;
 $1 = $0;
 _buffer_create_from_hex($message_buffer,$1);
 ;HEAP32[$message_buffer$byval_copy+0>>2]=HEAP32[$message_buffer+0>>2]|0;HEAP32[$message_buffer$byval_copy+4>>2]=HEAP32[$message_buffer+4>>2]|0;HEAP32[$message_buffer$byval_copy+8>>2]=HEAP32[$message_buffer+8>>2]|0;
 __simple517($message_buffer$byval_copy,29648);
 _buffer_free($message_buffer);
 STACKTOP = sp;return (29648|0);
}
function _buffer_calloc($agg$result,$length) {
 $agg$result = $agg$result|0;
 $length = $length|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $b = sp;
 $0 = $length;
 $1 = $0;
 $2 = (($b) + 4|0);
 HEAP32[$2>>2] = $1;
 $3 = $0;
 $4 = (($3>>>0) % 4)&-1;
 $5 = ($4|0)!=(0);
 if ($5) {
  $6 = $0;
  $7 = $6 >>> 2;
  $8 = (($7) + 1)|0;
  $12 = $8;
 } else {
  $9 = $0;
  $10 = $9 >>> 2;
  $12 = $10;
 }
 $11 = (($b) + 8|0);
 HEAP32[$11>>2] = $12;
 $13 = $0;
 $14 = ($13|0)!=(0);
 if ($14) {
  $15 = (($b) + 8|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = (__memory_calloc($16,4)|0);
  $18 = $17;
 } else {
  $18 = 0;
 }
 HEAP32[$b>>2] = $18;
 ;HEAP32[$agg$result+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$agg$result+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$agg$result+8>>2]=HEAP32[$b+8>>2]|0;
 STACKTOP = sp;return;
}
function _buffer_realloc($b,$length) {
 $b = $b|0;
 $length = $length|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $i = 0, $i1 = 0, $mask = 0, $prev_w_length = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $b;
 $1 = $length;
 $2 = $0;
 $3 = (($2) + 8|0);
 $4 = HEAP32[$3>>2]|0;
 $prev_w_length = $4;
 $5 = $1;
 $6 = $0;
 $7 = (($6) + 4|0);
 HEAP32[$7>>2] = $5;
 $8 = $1;
 $9 = (($8>>>0) % 4)&-1;
 $10 = ($9|0)!=(0);
 if ($10) {
  $11 = $1;
  $12 = $11 >>> 2;
  $13 = (($12) + 1)|0;
  $18 = $13;
 } else {
  $14 = $1;
  $15 = $14 >>> 2;
  $18 = $15;
 }
 $16 = $0;
 $17 = (($16) + 8|0);
 HEAP32[$17>>2] = $18;
 $19 = $0;
 $20 = HEAP32[$19>>2]|0;
 $21 = $0;
 $22 = (($21) + 8|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = $23<<2;
 $25 = (__memory_realloc($20,$24)|0);
 $26 = $0;
 HEAP32[$26>>2] = $25;
 $27 = $prev_w_length;
 $i = $27;
 while(1) {
  $28 = $i;
  $29 = $0;
  $30 = (($29) + 8|0);
  $31 = HEAP32[$30>>2]|0;
  $32 = ($28|0)<($31|0);
  if (!($32)) {
   break;
  }
  $33 = $i;
  $34 = $0;
  $35 = HEAP32[$34>>2]|0;
  $36 = (($35) + ($33<<2)|0);
  HEAP32[$36>>2] = 0;
  $37 = $i;
  $38 = (($37) + 1)|0;
  $i = $38;
 }
 $39 = $1;
 $i1 = $39;
 while(1) {
  $40 = $i1;
  $41 = $0;
  $42 = (($41) + 8|0);
  $43 = HEAP32[$42>>2]|0;
  $44 = $43<<2;
  $45 = ($40>>>0)<($44>>>0);
  if (!($45)) {
   break;
  }
  $46 = $i1;
  $47 = (($46>>>0) % 4)&-1;
  $48 = $47<<3;
  $49 = (24 - ($48))|0;
  $50 = 255 << $49;
  $mask = $50;
  $51 = $mask;
  $52 = $51 ^ -1;
  $53 = $i1;
  $54 = $53 >>> 2;
  $55 = $0;
  $56 = HEAP32[$55>>2]|0;
  $57 = (($56) + ($54<<2)|0);
  $58 = HEAP32[$57>>2]|0;
  $59 = $58 & $52;
  HEAP32[$57>>2] = $59;
  $60 = $i1;
  $61 = (($60) + 1)|0;
  $i1 = $61;
 }
 STACKTOP = sp;return;
}
function _buffer_free($b) {
 $b = $b|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $b;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 __memory_free($2);
 $3 = $0;
 $4 = (($3) + 4|0);
 HEAP32[$4>>2] = 0;
 $5 = $0;
 $6 = (($5) + 8|0);
 HEAP32[$6>>2] = 0;
 $7 = $0;
 HEAP32[$7>>2] = 0;
 STACKTOP = sp;return;
}
function _buffer_create($agg$result,$data,$length) {
 $agg$result = $agg$result|0;
 $data = $data|0;
 $length = $length|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $b = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $b = sp + 4|0;
 $0 = $data;
 $1 = $length;
 $2 = $1;
 _buffer_calloc($b,$2);
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $1;
  $5 = ($3>>>0)<($4>>>0);
  if (!($5)) {
   break;
  }
  $6 = $i;
  $7 = $0;
  $8 = (($7) + ($6)|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = $9&255;
  $11 = $i;
  $12 = (($11|0) % 4)&-1;
  $13 = $12<<3;
  $14 = (24 - ($13))|0;
  $15 = $10 << $14;
  $16 = $i;
  $17 = $16 >> 2;
  $18 = HEAP32[$b>>2]|0;
  $19 = (($18) + ($17<<2)|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = $20 | $15;
  HEAP32[$19>>2] = $21;
  $22 = $i;
  $23 = (($22) + 1)|0;
  $i = $23;
 }
 ;HEAP32[$agg$result+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$agg$result+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$agg$result+8>>2]=HEAP32[$b+8>>2]|0;
 STACKTOP = sp;return;
}
function _buffer_create_from_str($agg$result,$str) {
 $agg$result = $agg$result|0;
 $str = $str|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $str;
 $1 = $0;
 $2 = $0;
 $3 = (_strlen(($2|0))|0);
 _buffer_create($agg$result,$1,$3);
 STACKTOP = sp;return;
}
function _buffer_create_from_hex($agg$result,$str) {
 $agg$result = $agg$result|0;
 $str = $str|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $14 = 0, $15 = 0, $16 = 0;
 var $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0;
 var $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0;
 var $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0;
 var $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
 var $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $B = 0, $b = 0, $hh = 0, $i = 0, $length = 0, $lh = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $b = sp + 4|0;
 $0 = $str;
 $1 = $0;
 $2 = (_strlen(($1|0))|0);
 $length = $2;
 $3 = $length;
 $4 = (($3|0) % 2)&-1;
 $5 = ($4|0)==(0);
 if (!($5)) {
  ___assert_fail((29976|0),(29992|0),61,(30008|0));
  // unreachable;
 }
 $6 = $length;
 $7 = $6 >> 1;
 $length = $7;
 $8 = $length;
 _buffer_calloc($b,$8);
 $i = 0;
 while(1) {
  $9 = $i;
  $10 = $length;
  $11 = ($9|0)<($10|0);
  if (!($11)) {
   label = 25;
   break;
  }
  $12 = $i;
  $13 = $12<<1;
  $14 = $0;
  $15 = (($14) + ($13)|0);
  $16 = HEAP8[$15>>0]|0;
  $17 = $16 << 24 >> 24;
  $18 = ($17|0)<(65);
  if ($18) {
   $19 = $i;
   $20 = $19<<1;
   $21 = $0;
   $22 = (($21) + ($20)|0);
   $23 = HEAP8[$22>>0]|0;
   $24 = $23 << 24 >> 24;
   $25 = (($24) - 48)|0;
   $50 = $25;
  } else {
   $26 = $i;
   $27 = $26<<1;
   $28 = $0;
   $29 = (($28) + ($27)|0);
   $30 = HEAP8[$29>>0]|0;
   $31 = $30 << 24 >> 24;
   $32 = ($31|0)<(97);
   if ($32) {
    $33 = $i;
    $34 = $33<<1;
    $35 = $0;
    $36 = (($35) + ($34)|0);
    $37 = HEAP8[$36>>0]|0;
    $38 = $37 << 24 >> 24;
    $39 = (($38) - 65)|0;
    $40 = (($39) + 10)|0;
    $129 = $40;
   } else {
    $41 = $i;
    $42 = $41<<1;
    $43 = $0;
    $44 = (($43) + ($42)|0);
    $45 = HEAP8[$44>>0]|0;
    $46 = $45 << 24 >> 24;
    $47 = (($46) - 97)|0;
    $48 = (($47) + 10)|0;
    $129 = $48;
   }
   $50 = $129;
  }
  $49 = $50&255;
  $hh = $49;
  $51 = $i;
  $52 = $51<<1;
  $53 = (($52) + 1)|0;
  $54 = $0;
  $55 = (($54) + ($53)|0);
  $56 = HEAP8[$55>>0]|0;
  $57 = $56 << 24 >> 24;
  $58 = ($57|0)<(65);
  if ($58) {
   $59 = $i;
   $60 = $59<<1;
   $61 = (($60) + 1)|0;
   $62 = $0;
   $63 = (($62) + ($61)|0);
   $64 = HEAP8[$63>>0]|0;
   $65 = $64 << 24 >> 24;
   $66 = (($65) - 48)|0;
   $94 = $66;
  } else {
   $67 = $i;
   $68 = $67<<1;
   $69 = (($68) + 1)|0;
   $70 = $0;
   $71 = (($70) + ($69)|0);
   $72 = HEAP8[$71>>0]|0;
   $73 = $72 << 24 >> 24;
   $74 = ($73|0)<(97);
   if ($74) {
    $75 = $i;
    $76 = $75<<1;
    $77 = (($76) + 1)|0;
    $78 = $0;
    $79 = (($78) + ($77)|0);
    $80 = HEAP8[$79>>0]|0;
    $81 = $80 << 24 >> 24;
    $82 = (($81) - 65)|0;
    $83 = (($82) + 10)|0;
    $130 = $83;
   } else {
    $84 = $i;
    $85 = $84<<1;
    $86 = (($85) + 1)|0;
    $87 = $0;
    $88 = (($87) + ($86)|0);
    $89 = HEAP8[$88>>0]|0;
    $90 = $89 << 24 >> 24;
    $91 = (($90) - 97)|0;
    $92 = (($91) + 10)|0;
    $130 = $92;
   }
   $94 = $130;
  }
  $93 = $94&255;
  $lh = $93;
  $95 = $hh;
  $96 = $95&255;
  $97 = ($96|0)>=(0);
  if (!($97)) {
   label = 19;
   break;
  }
  $98 = $hh;
  $99 = $98&255;
  $100 = ($99|0)<(16);
  if (!($100)) {
   label = 19;
   break;
  }
  $101 = $lh;
  $102 = $101&255;
  $103 = ($102|0)>=(0);
  if (!($103)) {
   label = 22;
   break;
  }
  $104 = $lh;
  $105 = $104&255;
  $106 = ($105|0)<(16);
  if (!($106)) {
   label = 22;
   break;
  }
  $107 = $hh;
  $108 = $107&255;
  $109 = $108 << 4;
  $110 = $lh;
  $111 = $110&255;
  $112 = (($109) + ($111))|0;
  $113 = $112&255;
  $B = $113;
  $114 = $B;
  $115 = $114&255;
  $116 = $i;
  $117 = (($116|0) % 4)&-1;
  $118 = $117<<3;
  $119 = (24 - ($118))|0;
  $120 = $115 << $119;
  $121 = $i;
  $122 = $121 >> 2;
  $123 = HEAP32[$b>>2]|0;
  $124 = (($123) + ($122<<2)|0);
  $125 = HEAP32[$124>>2]|0;
  $126 = $125 | $120;
  HEAP32[$124>>2] = $126;
  $127 = $i;
  $128 = (($127) + 1)|0;
  $i = $128;
 }
 if ((label|0) == 19) {
  ___assert_fail((30032|0),(29992|0),68,(30008|0));
  // unreachable;
 }
 else if ((label|0) == 22) {
  ___assert_fail((30056|0),(29992|0),69,(30008|0));
  // unreachable;
 }
 else if ((label|0) == 25) {
  ;HEAP32[$agg$result+0>>2]=HEAP32[$b+0>>2]|0;HEAP32[$agg$result+4>>2]=HEAP32[$b+4>>2]|0;HEAP32[$agg$result+8>>2]=HEAP32[$b+8>>2]|0;
  STACKTOP = sp;return;
 }
}
function _buffer_clone($agg$result,$b) {
 $agg$result = $agg$result|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $r = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $r = sp + 4|0;
 $0 = (($b) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = (($r) + 4|0);
 HEAP32[$2>>2] = $1;
 $3 = (($b) + 8|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($r) + 8|0);
 HEAP32[$5>>2] = $4;
 $6 = (($r) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)!=(0);
 if ($8) {
  $9 = (($r) + 8|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = $10<<2;
  $12 = (__memory_alloc($11)|0);
  $13 = $12;
 } else {
  $13 = 0;
 }
 HEAP32[$r>>2] = $13;
 $i = 0;
 while(1) {
  $14 = $i;
  $15 = (($r) + 8|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = ($14|0)<($16|0);
  if (!($17)) {
   break;
  }
  $18 = $i;
  $19 = HEAP32[$b>>2]|0;
  $20 = (($19) + ($18<<2)|0);
  $21 = HEAP32[$20>>2]|0;
  $22 = $i;
  $23 = HEAP32[$r>>2]|0;
  $24 = (($23) + ($22<<2)|0);
  HEAP32[$24>>2] = $21;
  $25 = $i;
  $26 = (($25) + 1)|0;
  $i = $26;
 }
 ;HEAP32[$agg$result+0>>2]=HEAP32[$r+0>>2]|0;HEAP32[$agg$result+4>>2]=HEAP32[$r+4>>2]|0;HEAP32[$agg$result+8>>2]=HEAP32[$r+8>>2]|0;
 STACKTOP = sp;return;
}
function _buffer_copy($dest,$origin) {
 $dest = $dest|0;
 $origin = $origin|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $dest;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($origin) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)==($5|0);
 if (!($6)) {
  ___assert_fail((30080|0),(29992|0),90,(30112|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = (($origin) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($7|0)<($9|0);
  if (!($10)) {
   break;
  }
  $11 = $i;
  $12 = HEAP32[$origin>>2]|0;
  $13 = (($12) + ($11<<2)|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $i;
  $16 = $0;
  $17 = HEAP32[$16>>2]|0;
  $18 = (($17) + ($15<<2)|0);
  HEAP32[$18>>2] = $14;
  $19 = $i;
  $20 = (($19) + 1)|0;
  $i = $20;
 }
 STACKTOP = sp;return;
}
function _buffer_xor($dest,$origin) {
 $dest = $dest|0;
 $origin = $origin|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $dest;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($origin) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($3|0)==($5|0);
 if (!($6)) {
  ___assert_fail((30080|0),(29992|0),97,(30128|0));
  // unreachable;
 }
 $i = 0;
 while(1) {
  $7 = $i;
  $8 = (($origin) + 8|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = ($7|0)<($9|0);
  if (!($10)) {
   break;
  }
  $11 = $i;
  $12 = HEAP32[$origin>>2]|0;
  $13 = (($12) + ($11<<2)|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $i;
  $16 = $0;
  $17 = HEAP32[$16>>2]|0;
  $18 = (($17) + ($15<<2)|0);
  $19 = HEAP32[$18>>2]|0;
  $20 = $19 ^ $14;
  HEAP32[$18>>2] = $20;
  $21 = $i;
  $22 = (($21) + 1)|0;
  $i = $22;
 }
 STACKTOP = sp;return;
}
function _buffer_push($b,$data) {
 $b = $b|0;
 $data = $data|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $B = 0, $i = 0, $j = 0, $prev_length = 0, $prev_w_length = 0, $w = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $b;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $prev_length = $3;
 $4 = $0;
 $5 = (($4) + 8|0);
 $6 = HEAP32[$5>>2]|0;
 $prev_w_length = $6;
 $7 = $0;
 $8 = $0;
 $9 = (($8) + 4|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = (($data) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = (($10) + ($12))|0;
 _buffer_realloc($7,$13);
 $14 = $prev_length;
 $15 = (($14>>>0) % 4)&-1;
 $16 = ($15|0)==(0);
 if ($16) {
  $17 = $0;
  $18 = HEAP32[$17>>2]|0;
  $19 = $prev_w_length;
  $20 = (($18) + ($19<<2)|0);
  $21 = HEAP32[$data>>2]|0;
  $22 = (($data) + 8|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = $23<<2;
  _memcpy(($20|0),($21|0),($24|0))|0;
  STACKTOP = sp;return;
 }
 $i = 0;
 $25 = $prev_length;
 $j = $25;
 while(1) {
  $26 = $i;
  $27 = (($data) + 4|0);
  $28 = HEAP32[$27>>2]|0;
  $29 = ($26>>>0)<($28>>>0);
  if (!($29)) {
   break;
  }
  $30 = $i;
  $31 = $30 >> 2;
  $32 = HEAP32[$data>>2]|0;
  $33 = (($32) + ($31<<2)|0);
  $34 = HEAP32[$33>>2]|0;
  $w = $34;
  $35 = $w;
  $36 = $i;
  $37 = (($36|0) % 4)&-1;
  $38 = $37<<3;
  $39 = (24 - ($38))|0;
  $40 = $35 >>> $39;
  $41 = $40 & 255;
  $42 = $41&255;
  $B = $42;
  $43 = $B;
  $44 = $43&255;
  $45 = $j;
  $46 = (($45|0) % 4)&-1;
  $47 = $46<<3;
  $48 = (24 - ($47))|0;
  $49 = $44 << $48;
  $50 = $j;
  $51 = $50 >> 2;
  $52 = $0;
  $53 = HEAP32[$52>>2]|0;
  $54 = (($53) + ($51<<2)|0);
  $55 = HEAP32[$54>>2]|0;
  $56 = $55 | $49;
  HEAP32[$54>>2] = $56;
  $57 = $i;
  $58 = (($57) + 1)|0;
  $i = $58;
  $59 = $j;
  $60 = (($59) + 1)|0;
  $j = $60;
 }
 STACKTOP = sp;return;
}
function _buffer_slice($b,$length) {
 $b = $b|0;
 $length = $length|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $b;
 $1 = $length;
 $2 = $1;
 $3 = $0;
 $4 = (($3) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($2>>>0)<=($5>>>0);
 if (!($6)) {
  ___assert_fail((30144|0),(29992|0),124,(30168|0));
  // unreachable;
 }
 $7 = $1;
 $8 = (($7>>>0) % 4)&-1;
 $9 = ($8|0)==(0);
 if (!($9)) {
  ___assert_fail((30184|0),(29992|0),125,(30168|0));
  // unreachable;
 }
 $10 = $1;
 $11 = $0;
 $12 = (($11) + 4|0);
 $13 = HEAP32[$12>>2]|0;
 $14 = ($10|0)==($13|0);
 if ($14) {
  $15 = $0;
  _buffer_free($15);
  STACKTOP = sp;return;
 } else {
  $16 = $0;
  $17 = HEAP32[$16>>2]|0;
  $18 = $0;
  $19 = HEAP32[$18>>2]|0;
  $20 = $1;
  $21 = $20 >>> 2;
  $22 = (($19) + ($21<<2)|0);
  $23 = $0;
  $24 = (($23) + 8|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = $25<<2;
  $27 = $1;
  $28 = (($26) - ($27))|0;
  _memmove(($17|0),($22|0),($28|0))|0;
  $29 = $1;
  $30 = $0;
  $31 = (($30) + 4|0);
  $32 = HEAP32[$31>>2]|0;
  $33 = (($32) - ($29))|0;
  HEAP32[$31>>2] = $33;
  $34 = $1;
  $35 = $34 >>> 2;
  $36 = $0;
  $37 = (($36) + 8|0);
  $38 = HEAP32[$37>>2]|0;
  $39 = (($38) - ($35))|0;
  HEAP32[$37>>2] = $39;
  STACKTOP = sp;return;
 }
}
function _buffer_encode($b,$hex) {
 $b = $b|0;
 $hex = $hex|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $B = 0, $i = 0, $w = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hex;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = (($b) + 4|0);
  $3 = HEAP32[$2>>2]|0;
  $4 = ($1>>>0)<($3>>>0);
  if (!($4)) {
   break;
  }
  $5 = $i;
  $6 = $5 >> 2;
  $7 = HEAP32[$b>>2]|0;
  $8 = (($7) + ($6<<2)|0);
  $9 = HEAP32[$8>>2]|0;
  $w = $9;
  $10 = $w;
  $11 = $i;
  $12 = (($11|0) % 4)&-1;
  $13 = $12<<3;
  $14 = (24 - ($13))|0;
  $15 = $10 >>> $14;
  $16 = $15 & 255;
  $17 = $16&255;
  $B = $17;
  $18 = $B;
  $19 = $18&255;
  $20 = $19 >> 4;
  $21 = ($20|0)<(10);
  if ($21) {
   $22 = $B;
   $23 = $22&255;
   $24 = $23 >> 4;
   $25 = (48 + ($24))|0;
   $32 = $25;
  } else {
   $26 = $B;
   $27 = $26&255;
   $28 = $27 >> 4;
   $29 = (($28) - 10)|0;
   $30 = (97 + ($29))|0;
   $32 = $30;
  }
  $31 = $32&255;
  $33 = $i;
  $34 = $33<<1;
  $35 = $0;
  $36 = (($35) + ($34)|0);
  HEAP8[$36>>0] = $31;
  $37 = $B;
  $38 = $37&255;
  $39 = $38 & 15;
  $40 = ($39|0)<(10);
  if ($40) {
   $41 = $B;
   $42 = $41&255;
   $43 = $42 & 15;
   $44 = (48 + ($43))|0;
   $51 = $44;
  } else {
   $45 = $B;
   $46 = $45&255;
   $47 = $46 & 15;
   $48 = (($47) - 10)|0;
   $49 = (97 + ($48))|0;
   $51 = $49;
  }
  $50 = $51&255;
  $52 = $i;
  $53 = $52<<1;
  $54 = (($53) + 1)|0;
  $55 = $0;
  $56 = (($55) + ($54)|0);
  HEAP8[$56>>0] = $50;
  $57 = $i;
  $58 = (($57) + 1)|0;
  $i = $58;
 }
 $59 = $i;
 $60 = $59<<1;
 $61 = $0;
 $62 = (($61) + ($60)|0);
 HEAP8[$62>>0] = 0;
 STACKTOP = sp;return;
}
function _buffer_is_equal($a,$b) {
 $a = $a|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = (($a) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = (($b) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($2|0)!=($4|0);
 if ($5) {
  $0 = 0;
  $21 = $0;
  STACKTOP = sp;return ($21|0);
 }
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = (($a) + 8|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   label = 9;
   break;
  }
  $10 = $i;
  $11 = HEAP32[$a>>2]|0;
  $12 = (($11) + ($10<<2)|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = $i;
  $15 = HEAP32[$b>>2]|0;
  $16 = (($15) + ($14<<2)|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = ($13|0)!=($17|0);
  if ($18) {
   label = 6;
   break;
  }
  $19 = $i;
  $20 = (($19) + 1)|0;
  $i = $20;
 }
 if ((label|0) == 6) {
  $0 = 0;
  $21 = $0;
  STACKTOP = sp;return ($21|0);
 }
 else if ((label|0) == 9) {
  $0 = 1;
  $21 = $0;
  STACKTOP = sp;return ($21|0);
 }
 return 0|0;
}
function __memory_alloc($size) {
 $size = $size|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $ptr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $size;
 $1 = $0;
 $2 = (_malloc($1)|0);
 $ptr = $2;
 $3 = $ptr;
 $4 = ($3|0)!=(0|0);
 if ($4) {
  $5 = $ptr;
  _add_ptr($5);
  $6 = $ptr;
  STACKTOP = sp;return ($6|0);
 } else {
  ___assert_fail((30200|0),(30216|0),65,(30232|0));
  // unreachable;
 }
 return 0|0;
}
function _add_ptr($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $i1 = 0, $used = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $vararg_buffer = sp;
 $0 = $ptr;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = HEAP32[30296>>2]|0;
  $3 = ($1|0)<($2|0);
  if (!($3)) {
   break;
  }
  $4 = $i;
  $5 = HEAP32[30304>>2]|0;
  $6 = (($5) + ($4<<2)|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(0|0);
  if ($8) {
   label = 4;
   break;
  }
  $13 = $i;
  $14 = (($13) + 1)|0;
  $i = $14;
 }
 if ((label|0) == 4) {
  $9 = $0;
  $10 = $i;
  $11 = HEAP32[30304>>2]|0;
  $12 = (($11) + ($10<<2)|0);
  HEAP32[$12>>2] = $9;
  STACKTOP = sp;return;
 }
 $15 = HEAP32[30408>>2]|0;
 $16 = HEAP32[30296>>2]|0;
 $17 = ($15|0)==($16|0);
 if ($17) {
  $18 = HEAP32[30408>>2]|0;
  $19 = ($18|0)!=(0);
  if ($19) {
   $20 = HEAP32[30408>>2]|0;
   $21 = $20<<1;
   $22 = $21;
  } else {
   $22 = 1;
  }
  HEAP32[30408>>2] = $22;
  $used = 0;
  $i1 = 0;
  while(1) {
   $23 = $i1;
   $24 = HEAP32[30296>>2]|0;
   $25 = ($23|0)<($24|0);
   if (!($25)) {
    break;
   }
   $26 = $i1;
   $27 = HEAP32[30304>>2]|0;
   $28 = (($27) + ($26<<2)|0);
   $29 = HEAP32[$28>>2]|0;
   $30 = ($29|0)!=(0|0);
   if ($30) {
    $31 = $used;
    $32 = (($31) + 1)|0;
    $used = $32;
   }
   $33 = $i1;
   $34 = (($33) + 1)|0;
   $i1 = $34;
  }
  $35 = HEAP32[30408>>2]|0;
  $36 = $used;
  HEAP32[$vararg_buffer>>2] = $35;
  $vararg_ptr1 = (($vararg_buffer) + 4|0);
  HEAP32[$vararg_ptr1>>2] = $36;
  (_printf((30416|0),($vararg_buffer|0))|0);
  $37 = HEAP32[30304>>2]|0;
  $38 = HEAP32[30408>>2]|0;
  $39 = $38<<2;
  $40 = (_realloc($37,$39)|0);
  HEAP32[30304>>2] = $40;
 }
 $41 = $0;
 $42 = HEAP32[30296>>2]|0;
 $43 = (($42) + 1)|0;
 HEAP32[30296>>2] = $43;
 $44 = HEAP32[30304>>2]|0;
 $45 = (($44) + ($42<<2)|0);
 HEAP32[$45>>2] = $41;
 STACKTOP = sp;return;
}
function __memory_calloc($num,$size) {
 $num = $num|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $ptr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $num;
 $1 = $size;
 $2 = $0;
 $3 = $1;
 $4 = (_calloc($2,$3)|0);
 $ptr = $4;
 $5 = $ptr;
 $6 = ($5|0)!=(0|0);
 if ($6) {
  $7 = $ptr;
  _add_ptr($7);
  $8 = $ptr;
  STACKTOP = sp;return ($8|0);
 } else {
  ___assert_fail((30200|0),(30216|0),72,(30248|0));
  // unreachable;
 }
 return 0|0;
}
function __memory_realloc($ptr,$size) {
 $ptr = $ptr|0;
 $size = $size|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $new_ptr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $ptr;
 $2 = $size;
 $3 = $1;
 $4 = ($3|0)==(0|0);
 if ($4) {
  $5 = $2;
  $6 = (__memory_alloc($5)|0);
  $0 = $6;
  $19 = $0;
  STACKTOP = sp;return ($19|0);
 }
 $7 = $1;
 _assert_ptr_exists($7);
 $8 = $1;
 $9 = $2;
 $10 = (_realloc($8,$9)|0);
 $new_ptr = $10;
 $11 = $new_ptr;
 $12 = ($11|0)!=(0|0);
 if (!($12)) {
  ___assert_fail((30264|0),(30216|0),84,(30280|0));
  // unreachable;
 }
 $13 = $new_ptr;
 $14 = $1;
 $15 = ($13|0)!=($14|0);
 if ($15) {
  $16 = $1;
  $17 = $new_ptr;
  _change_ptr($16,$17);
 }
 $18 = $new_ptr;
 $0 = $18;
 $19 = $0;
 STACKTOP = sp;return ($19|0);
}
function _assert_ptr_exists($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ptr;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = HEAP32[30296>>2]|0;
  $3 = ($1|0)<($2|0);
  if (!($3)) {
   label = 7;
   break;
  }
  $4 = $i;
  $5 = HEAP32[30304>>2]|0;
  $6 = (($5) + ($4<<2)|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = $0;
  $9 = ($7|0)==($8|0);
  if ($9) {
   label = 4;
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 if ((label|0) == 4) {
  STACKTOP = sp;return;
 }
 else if ((label|0) == 7) {
  ___assert_fail((30360|0),(30216|0),60,(30384|0));
  // unreachable;
 }
}
function _change_ptr($ptr,$new_ptr) {
 $ptr = $ptr|0;
 $new_ptr = $new_ptr|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ptr;
 $1 = $new_ptr;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = HEAP32[30296>>2]|0;
  $4 = ($2|0)<($3|0);
  if (!($4)) {
   label = 7;
   break;
  }
  $5 = $i;
  $6 = HEAP32[30304>>2]|0;
  $7 = (($6) + ($5<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = $0;
  $10 = ($8|0)==($9|0);
  if ($10) {
   label = 4;
   break;
  }
  $15 = $i;
  $16 = (($15) + 1)|0;
  $i = $16;
 }
 if ((label|0) == 4) {
  $11 = $1;
  $12 = $i;
  $13 = HEAP32[30304>>2]|0;
  $14 = (($13) + ($12<<2)|0);
  HEAP32[$14>>2] = $11;
  STACKTOP = sp;return;
 }
 else if ((label|0) == 7) {
  ___assert_fail((30360|0),(30216|0),44,(30368|0));
  // unreachable;
 }
}
function __memory_free($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ptr;
 $1 = $0;
 _remove_ptr($1);
 $2 = $0;
 _free($2);
 STACKTOP = sp;return;
}
function _remove_ptr($ptr) {
 $ptr = $ptr|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $ptr;
 $1 = $0;
 _change_ptr($1,0);
 STACKTOP = sp;return;
}
function __memory_assert_empty() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $i = 0;
 while(1) {
  $0 = $i;
  $1 = HEAP32[30296>>2]|0;
  $2 = ($0|0)<($1|0);
  if (!($2)) {
   label = 7;
   break;
  }
  $3 = $i;
  $4 = HEAP32[30304>>2]|0;
  $5 = (($4) + ($3<<2)|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = ($6|0)==(0|0);
  if (!($7)) {
   label = 4;
   break;
  }
  $8 = $i;
  $9 = (($8) + 1)|0;
  $i = $9;
 }
 if ((label|0) == 4) {
  ___assert_fail((30312|0),(30216|0),98,(30336|0));
  // unreachable;
 }
 else if ((label|0) == 7) {
  STACKTOP = sp;return;
 }
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[30472>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((30472 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((30472 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[30472>>2] = $22;
     } else {
      $23 = HEAP32[((30472 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((30472 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((30472 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((30472 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[30472>>2] = $74;
      } else {
       $75 = HEAP32[((30472 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((30472 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((30472 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((30472 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[30472>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[30472>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((30472 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((30472 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((30472 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((30472 + 8|0))>>2] = $81;
     HEAP32[((30472 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((30472 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((30472 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((30472 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((30472 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((30472 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((30472 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((30472 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((30472 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((30472 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((30472 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((30472 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((30472 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((30472 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[30472>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[30472>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((30472 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((30472 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((30472 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((30472 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((30472 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((30472 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((30472 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((30472 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((30472 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((30472 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((30472 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((30472 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((30472 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((30472 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((30472 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((30472 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((30472 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((30472 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[30472>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          do {
           if ($431) {
            $432 = $428 | $429;
            HEAP32[30472>>2] = $432;
            $$sum14$pre$i = (($426) + 2)|0;
            $$pre$i25 = ((30472 + ($$sum14$pre$i<<2)|0) + 40|0);
            $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
           } else {
            $$sum17$i = (($426) + 2)|0;
            $433 = ((30472 + ($$sum17$i<<2)|0) + 40|0);
            $434 = HEAP32[$433>>2]|0;
            $435 = HEAP32[((30472 + 16|0))>>2]|0;
            $436 = ($434>>>0)<($435>>>0);
            if (!($436)) {
             $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((30472 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((30472 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((30472 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L224: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L224;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((30472 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((30472 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((30472 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((30472 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((30472 + 20|0))>>2] = $516;
   HEAP32[((30472 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((30472 + 8|0))>>2] = 0;
   HEAP32[((30472 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((30472 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((30472 + 12|0))>>2] = $530;
  $531 = HEAP32[((30472 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((30472 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[30944>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((30944 + 8|0))>>2] = $540;
    HEAP32[((30944 + 4|0))>>2] = $540;
    HEAP32[((30944 + 12|0))>>2] = -1;
    HEAP32[((30944 + 16|0))>>2] = -1;
    HEAP32[((30944 + 20|0))>>2] = 0;
    HEAP32[((30472 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[30944>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((30944 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((30472 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((30472 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((30472 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((30472 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((30472 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((30472 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((30944 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((30472 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((30472 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((30944 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((30472 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((30472 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((30472 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((30472 + 432|0))>>2] = $633;
  $634 = HEAP32[((30472 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((30472 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((30472 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((30472 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((30472 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((30472 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((30472 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((30472 + 460|0))>>2] = 0;
    $641 = HEAP32[30944>>2]|0;
    HEAP32[((30472 + 36|0))>>2] = $641;
    HEAP32[((30472 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((30472 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((30472 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((30472 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((30472 + 24|0))>>2] = $654;
    HEAP32[((30472 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((30944 + 16|0))>>2]|0;
    HEAP32[((30472 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((30472 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((30472 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((30472 + 24|0))>>2] = $684;
       HEAP32[((30472 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((30944 + 16|0))>>2]|0;
       HEAP32[((30472 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((30472 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((30472 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((30472 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((30472 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L348: do {
       if ($730) {
        $731 = HEAP32[((30472 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((30472 + 12|0))>>2] = $732;
        HEAP32[((30472 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((30472 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((30472 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((30472 + 8|0))>>2] = $738;
         HEAP32[((30472 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         L356: do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((30472 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           do {
            if (!($755)) {
             $756 = HEAP32[((30472 + 16|0))>>2]|0;
             $757 = ($750>>>0)<($756>>>0);
             if ($757) {
              _abort();
              // unreachable;
             }
             $758 = (($750) + 12|0);
             $759 = HEAP32[$758>>2]|0;
             $760 = ($759|0)==($721|0);
             if ($760) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[30472>>2]|0;
            $765 = $764 & $763;
            HEAP32[30472>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           do {
            if ($766) {
             $$pre57$i$i = (($752) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $767 = HEAP32[((30472 + 16|0))>>2]|0;
             $768 = ($752>>>0)<($767>>>0);
             if ($768) {
              _abort();
              // unreachable;
             }
             $769 = (($752) + 8|0);
             $770 = HEAP32[$769>>2]|0;
             $771 = ($770|0)==($721|0);
             if ($771) {
              $$pre$phi58$i$iZ2D = $769;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((30472 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((30472 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if ($802) {
            break;
           }
           $$sum30$i$i = (($tsize$246$i) + 28)|0;
           $$sum113$i = (($$sum30$i$i) + ($720))|0;
           $803 = (($tbase$247$i) + ($$sum113$i)|0);
           $804 = HEAP32[$803>>2]|0;
           $805 = ((30472 + ($804<<2)|0) + 304|0);
           $806 = HEAP32[$805>>2]|0;
           $807 = ($721|0)==($806|0);
           do {
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $808 = 1 << $804;
             $809 = $808 ^ -1;
             $810 = HEAP32[((30472 + 4|0))>>2]|0;
             $811 = $810 & $809;
             HEAP32[((30472 + 4|0))>>2] = $811;
             break L356;
            } else {
             $812 = HEAP32[((30472 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break L356;
             }
            }
           } while(0);
           $819 = HEAP32[((30472 + 16|0))>>2]|0;
           $820 = ($R$1$i$i>>>0)<($819>>>0);
           if ($820) {
            _abort();
            // unreachable;
           }
           $821 = (($R$1$i$i) + 24|0);
           HEAP32[$821>>2] = $774;
           $$sum3132$i$i = $720 | 16;
           $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
           $822 = (($tbase$247$i) + ($$sum114$i)|0);
           $823 = HEAP32[$822>>2]|0;
           $824 = ($823|0)==(0|0);
           do {
            if (!($824)) {
             $825 = HEAP32[((30472 + 16|0))>>2]|0;
             $826 = ($823>>>0)<($825>>>0);
             if ($826) {
              _abort();
              // unreachable;
             } else {
              $827 = (($R$1$i$i) + 16|0);
              HEAP32[$827>>2] = $823;
              $828 = (($823) + 24|0);
              HEAP32[$828>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
           $829 = (($tbase$247$i) + ($$sum115$i)|0);
           $830 = HEAP32[$829>>2]|0;
           $831 = ($830|0)==(0|0);
           if ($831) {
            break;
           }
           $832 = HEAP32[((30472 + 16|0))>>2]|0;
           $833 = ($830>>>0)<($832>>>0);
           if ($833) {
            _abort();
            // unreachable;
           } else {
            $834 = (($R$1$i$i) + 20|0);
            HEAP32[$834>>2] = $830;
            $835 = (($830) + 24|0);
            HEAP32[$835>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((30472 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[30472>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         do {
          if ($851) {
           $852 = $848 | $849;
           HEAP32[30472>>2] = $852;
           $$sum26$pre$i$i = (($846) + 2)|0;
           $$pre$i25$i = ((30472 + ($$sum26$pre$i$i<<2)|0) + 40|0);
           $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
          } else {
           $$sum29$i$i = (($846) + 2)|0;
           $853 = ((30472 + ($$sum29$i$i<<2)|0) + 40|0);
           $854 = HEAP32[$853>>2]|0;
           $855 = HEAP32[((30472 + 16|0))>>2]|0;
           $856 = ($854>>>0)<($855>>>0);
           if (!($856)) {
            $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        do {
         if ($861) {
          $I7$0$i$i = 0;
         } else {
          $862 = ($qsize$0$i$i>>>0)>(16777215);
          if ($862) {
           $I7$0$i$i = 31;
           break;
          }
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        } while(0);
        $885 = ((30472 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((30472 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((30472 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L445: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L445;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((30472 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L348;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((30472 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((30472 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((30472 + 24|0))>>2] = $958;
    HEAP32[((30472 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((30944 + 16|0))>>2]|0;
    HEAP32[((30472 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((30472 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((30472 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((30472 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((30472 + 448|0))+12>>2]|0;
    HEAP32[((30472 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((30472 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((30472 + 460|0))>>2] = 0;
    HEAP32[((30472 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((30472 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[30472>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      do {
       if ($990) {
        $991 = $987 | $988;
        HEAP32[30472>>2] = $991;
        $$sum10$pre$i$i = (($985) + 2)|0;
        $$pre$i$i = ((30472 + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
       } else {
        $$sum11$i$i = (($985) + 2)|0;
        $992 = ((30472 + ($$sum11$i$i<<2)|0) + 40|0);
        $993 = HEAP32[$992>>2]|0;
        $994 = HEAP32[((30472 + 16|0))>>2]|0;
        $995 = ($993>>>0)<($994>>>0);
        if (!($995)) {
         $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((30472 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((30472 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((30472 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L499: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L499;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((30472 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((30472 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((30472 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((30472 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((30472 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((30472 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((30472 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((30472 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((30472 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((30472 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[30472>>2]|0;
     $36 = $35 & $34;
     HEAP32[30472>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((30472 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((30472 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((30472 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((30472 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((30472 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((30472 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((30472 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((30472 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((30472 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((30472 + 12|0))>>2] = $122;
   HEAP32[((30472 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((30472 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((30472 + 20|0))>>2] = 0;
   HEAP32[((30472 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((30472 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((30472 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((30472 + 8|0))>>2] = $130;
   HEAP32[((30472 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((30472 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((30472 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[30472>>2]|0;
     $154 = $153 & $152;
     HEAP32[30472>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((30472 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((30472 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((30472 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((30472 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((30472 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((30472 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((30472 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((30472 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((30472 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((30472 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((30472 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((30472 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((30472 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[30472>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[30472>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((30472 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((30472 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((30472 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((30472 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((30472 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((30472 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L204: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L204;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((30472 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((30472 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((30472 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((30472 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((30472 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((30472 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _calloc($n_elements,$elem_size) {
 $n_elements = $n_elements|0;
 $elem_size = $elem_size|0;
 var $$ = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $req$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($n_elements|0)==(0);
 if ($0) {
  $req$0 = 0;
 } else {
  $1 = Math_imul($elem_size, $n_elements)|0;
  $2 = $elem_size | $n_elements;
  $3 = ($2>>>0)>(65535);
  if ($3) {
   $4 = (($1>>>0) / ($n_elements>>>0))&-1;
   $5 = ($4|0)==($elem_size|0);
   $$ = $5 ? $1 : -1;
   $req$0 = $$;
  } else {
   $req$0 = $1;
  }
 }
 $6 = (_malloc($req$0)|0);
 $7 = ($6|0)==(0|0);
 if ($7) {
  STACKTOP = sp;return ($6|0);
 }
 $8 = (($6) + -4|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = $9 & 3;
 $11 = ($10|0)==(0);
 if ($11) {
  STACKTOP = sp;return ($6|0);
 }
 _memset(($6|0),0,($req$0|0))|0;
 STACKTOP = sp;return ($6|0);
}
function _realloc($oldmem,$bytes) {
 $oldmem = $oldmem|0;
 $bytes = $bytes|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $mem$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($oldmem|0)==(0|0);
 do {
  if ($0) {
   $1 = (_malloc($bytes)|0);
   $mem$0 = $1;
  } else {
   $2 = ($bytes>>>0)>(4294967231);
   if ($2) {
    $3 = (___errno_location()|0);
    HEAP32[$3>>2] = 12;
    $mem$0 = 0;
    break;
   }
   $4 = ($bytes>>>0)<(11);
   if ($4) {
    $8 = 16;
   } else {
    $5 = (($bytes) + 11)|0;
    $6 = $5 & -8;
    $8 = $6;
   }
   $7 = (($oldmem) + -8|0);
   $9 = (_try_realloc_chunk($7,$8)|0);
   $10 = ($9|0)==(0|0);
   if (!($10)) {
    $11 = (($9) + 8|0);
    $mem$0 = $11;
    break;
   }
   $12 = (_malloc($bytes)|0);
   $13 = ($12|0)==(0|0);
   if ($13) {
    $mem$0 = 0;
   } else {
    $14 = (($oldmem) + -4|0);
    $15 = HEAP32[$14>>2]|0;
    $16 = $15 & -8;
    $17 = $15 & 3;
    $18 = ($17|0)==(0);
    $19 = $18 ? 8 : 4;
    $20 = (($16) - ($19))|0;
    $21 = ($20>>>0)<($bytes>>>0);
    $22 = $21 ? $20 : $bytes;
    _memcpy(($12|0),($oldmem|0),($22|0))|0;
    _free($oldmem);
    $mem$0 = $12;
   }
  }
 } while(0);
 STACKTOP = sp;return ($mem$0|0);
}
function _try_realloc_chunk($p,$nb) {
 $p = $p|0;
 $nb = $nb|0;
 var $$pre = 0, $$pre$phiZ2D = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum2728 = 0, $$sum3 = 0, $$sum4 = 0, $$sum5 = 0, $$sum78 = 0;
 var $$sum910 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0;
 var $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0;
 var $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0;
 var $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0;
 var $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0;
 var $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
 var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0;
 var $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $R$0 = 0, $R$1 = 0, $RP$0 = 0;
 var $cond = 0, $newp$0 = 0, $or$cond = 0, $storemerge = 0, $storemerge21 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($p) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = $1 & -8;
 $3 = (($p) + ($2)|0);
 $4 = HEAP32[((30472 + 16|0))>>2]|0;
 $5 = ($p>>>0)<($4>>>0);
 if ($5) {
  _abort();
  // unreachable;
 }
 $6 = $1 & 3;
 $7 = ($6|0)!=(1);
 $8 = ($p>>>0)<($3>>>0);
 $or$cond = $7 & $8;
 if (!($or$cond)) {
  _abort();
  // unreachable;
 }
 $$sum2728 = $2 | 4;
 $9 = (($p) + ($$sum2728)|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = $10 & 1;
 $12 = ($11|0)==(0);
 if ($12) {
  _abort();
  // unreachable;
 }
 $13 = ($6|0)==(0);
 if ($13) {
  $14 = ($nb>>>0)<(256);
  if ($14) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $15 = (($nb) + 4)|0;
  $16 = ($2>>>0)<($15>>>0);
  if (!($16)) {
   $17 = (($2) - ($nb))|0;
   $18 = HEAP32[((30944 + 8|0))>>2]|0;
   $19 = $18 << 1;
   $20 = ($17>>>0)>($19>>>0);
   if (!($20)) {
    $newp$0 = $p;
    STACKTOP = sp;return ($newp$0|0);
   }
  }
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $21 = ($2>>>0)<($nb>>>0);
 if (!($21)) {
  $22 = (($2) - ($nb))|0;
  $23 = ($22>>>0)>(15);
  if (!($23)) {
   $newp$0 = $p;
   STACKTOP = sp;return ($newp$0|0);
  }
  $24 = (($p) + ($nb)|0);
  $25 = $1 & 1;
  $26 = $25 | $nb;
  $27 = $26 | 2;
  HEAP32[$0>>2] = $27;
  $$sum23 = (($nb) + 4)|0;
  $28 = (($p) + ($$sum23)|0);
  $29 = $22 | 3;
  HEAP32[$28>>2] = $29;
  $30 = HEAP32[$9>>2]|0;
  $31 = $30 | 1;
  HEAP32[$9>>2] = $31;
  _dispose_chunk($24,$22);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $32 = HEAP32[((30472 + 24|0))>>2]|0;
 $33 = ($3|0)==($32|0);
 if ($33) {
  $34 = HEAP32[((30472 + 12|0))>>2]|0;
  $35 = (($34) + ($2))|0;
  $36 = ($35>>>0)>($nb>>>0);
  if (!($36)) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $37 = (($35) - ($nb))|0;
  $38 = (($p) + ($nb)|0);
  $39 = $1 & 1;
  $40 = $39 | $nb;
  $41 = $40 | 2;
  HEAP32[$0>>2] = $41;
  $$sum22 = (($nb) + 4)|0;
  $42 = (($p) + ($$sum22)|0);
  $43 = $37 | 1;
  HEAP32[$42>>2] = $43;
  HEAP32[((30472 + 24|0))>>2] = $38;
  HEAP32[((30472 + 12|0))>>2] = $37;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $44 = HEAP32[((30472 + 20|0))>>2]|0;
 $45 = ($3|0)==($44|0);
 if ($45) {
  $46 = HEAP32[((30472 + 8|0))>>2]|0;
  $47 = (($46) + ($2))|0;
  $48 = ($47>>>0)<($nb>>>0);
  if ($48) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $49 = (($47) - ($nb))|0;
  $50 = ($49>>>0)>(15);
  if ($50) {
   $51 = (($p) + ($nb)|0);
   $52 = (($p) + ($47)|0);
   $53 = $1 & 1;
   $54 = $53 | $nb;
   $55 = $54 | 2;
   HEAP32[$0>>2] = $55;
   $$sum19 = (($nb) + 4)|0;
   $56 = (($p) + ($$sum19)|0);
   $57 = $49 | 1;
   HEAP32[$56>>2] = $57;
   HEAP32[$52>>2] = $49;
   $$sum20 = (($47) + 4)|0;
   $58 = (($p) + ($$sum20)|0);
   $59 = HEAP32[$58>>2]|0;
   $60 = $59 & -2;
   HEAP32[$58>>2] = $60;
   $storemerge = $51;$storemerge21 = $49;
  } else {
   $61 = $1 & 1;
   $62 = $61 | $47;
   $63 = $62 | 2;
   HEAP32[$0>>2] = $63;
   $$sum17 = (($47) + 4)|0;
   $64 = (($p) + ($$sum17)|0);
   $65 = HEAP32[$64>>2]|0;
   $66 = $65 | 1;
   HEAP32[$64>>2] = $66;
   $storemerge = 0;$storemerge21 = 0;
  }
  HEAP32[((30472 + 8|0))>>2] = $storemerge21;
  HEAP32[((30472 + 20|0))>>2] = $storemerge;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $67 = $10 & 2;
 $68 = ($67|0)==(0);
 if (!($68)) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $69 = $10 & -8;
 $70 = (($69) + ($2))|0;
 $71 = ($70>>>0)<($nb>>>0);
 if ($71) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $72 = (($70) - ($nb))|0;
 $73 = $10 >>> 3;
 $74 = ($10>>>0)<(256);
 do {
  if ($74) {
   $$sum15 = (($2) + 8)|0;
   $75 = (($p) + ($$sum15)|0);
   $76 = HEAP32[$75>>2]|0;
   $$sum16 = (($2) + 12)|0;
   $77 = (($p) + ($$sum16)|0);
   $78 = HEAP32[$77>>2]|0;
   $79 = $73 << 1;
   $80 = ((30472 + ($79<<2)|0) + 40|0);
   $81 = ($76|0)==($80|0);
   if (!($81)) {
    $82 = ($76>>>0)<($4>>>0);
    if ($82) {
     _abort();
     // unreachable;
    }
    $83 = (($76) + 12|0);
    $84 = HEAP32[$83>>2]|0;
    $85 = ($84|0)==($3|0);
    if (!($85)) {
     _abort();
     // unreachable;
    }
   }
   $86 = ($78|0)==($76|0);
   if ($86) {
    $87 = 1 << $73;
    $88 = $87 ^ -1;
    $89 = HEAP32[30472>>2]|0;
    $90 = $89 & $88;
    HEAP32[30472>>2] = $90;
    break;
   }
   $91 = ($78|0)==($80|0);
   if ($91) {
    $$pre = (($78) + 8|0);
    $$pre$phiZ2D = $$pre;
   } else {
    $92 = ($78>>>0)<($4>>>0);
    if ($92) {
     _abort();
     // unreachable;
    }
    $93 = (($78) + 8|0);
    $94 = HEAP32[$93>>2]|0;
    $95 = ($94|0)==($3|0);
    if ($95) {
     $$pre$phiZ2D = $93;
    } else {
     _abort();
     // unreachable;
    }
   }
   $96 = (($76) + 12|0);
   HEAP32[$96>>2] = $78;
   HEAP32[$$pre$phiZ2D>>2] = $76;
  } else {
   $$sum = (($2) + 24)|0;
   $97 = (($p) + ($$sum)|0);
   $98 = HEAP32[$97>>2]|0;
   $$sum2 = (($2) + 12)|0;
   $99 = (($p) + ($$sum2)|0);
   $100 = HEAP32[$99>>2]|0;
   $101 = ($100|0)==($3|0);
   do {
    if ($101) {
     $$sum4 = (($2) + 20)|0;
     $111 = (($p) + ($$sum4)|0);
     $112 = HEAP32[$111>>2]|0;
     $113 = ($112|0)==(0|0);
     if ($113) {
      $$sum3 = (($2) + 16)|0;
      $114 = (($p) + ($$sum3)|0);
      $115 = HEAP32[$114>>2]|0;
      $116 = ($115|0)==(0|0);
      if ($116) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $115;$RP$0 = $114;
      }
     } else {
      $R$0 = $112;$RP$0 = $111;
     }
     while(1) {
      $117 = (($R$0) + 20|0);
      $118 = HEAP32[$117>>2]|0;
      $119 = ($118|0)==(0|0);
      if (!($119)) {
       $R$0 = $118;$RP$0 = $117;
       continue;
      }
      $120 = (($R$0) + 16|0);
      $121 = HEAP32[$120>>2]|0;
      $122 = ($121|0)==(0|0);
      if ($122) {
       break;
      } else {
       $R$0 = $121;$RP$0 = $120;
      }
     }
     $123 = ($RP$0>>>0)<($4>>>0);
     if ($123) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum14 = (($2) + 8)|0;
     $102 = (($p) + ($$sum14)|0);
     $103 = HEAP32[$102>>2]|0;
     $104 = ($103>>>0)<($4>>>0);
     if ($104) {
      _abort();
      // unreachable;
     }
     $105 = (($103) + 12|0);
     $106 = HEAP32[$105>>2]|0;
     $107 = ($106|0)==($3|0);
     if (!($107)) {
      _abort();
      // unreachable;
     }
     $108 = (($100) + 8|0);
     $109 = HEAP32[$108>>2]|0;
     $110 = ($109|0)==($3|0);
     if ($110) {
      HEAP32[$105>>2] = $100;
      HEAP32[$108>>2] = $103;
      $R$1 = $100;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $124 = ($98|0)==(0|0);
   if (!($124)) {
    $$sum11 = (($2) + 28)|0;
    $125 = (($p) + ($$sum11)|0);
    $126 = HEAP32[$125>>2]|0;
    $127 = ((30472 + ($126<<2)|0) + 304|0);
    $128 = HEAP32[$127>>2]|0;
    $129 = ($3|0)==($128|0);
    if ($129) {
     HEAP32[$127>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $130 = 1 << $126;
      $131 = $130 ^ -1;
      $132 = HEAP32[((30472 + 4|0))>>2]|0;
      $133 = $132 & $131;
      HEAP32[((30472 + 4|0))>>2] = $133;
      break;
     }
    } else {
     $134 = HEAP32[((30472 + 16|0))>>2]|0;
     $135 = ($98>>>0)<($134>>>0);
     if ($135) {
      _abort();
      // unreachable;
     }
     $136 = (($98) + 16|0);
     $137 = HEAP32[$136>>2]|0;
     $138 = ($137|0)==($3|0);
     if ($138) {
      HEAP32[$136>>2] = $R$1;
     } else {
      $139 = (($98) + 20|0);
      HEAP32[$139>>2] = $R$1;
     }
     $140 = ($R$1|0)==(0|0);
     if ($140) {
      break;
     }
    }
    $141 = HEAP32[((30472 + 16|0))>>2]|0;
    $142 = ($R$1>>>0)<($141>>>0);
    if ($142) {
     _abort();
     // unreachable;
    }
    $143 = (($R$1) + 24|0);
    HEAP32[$143>>2] = $98;
    $$sum12 = (($2) + 16)|0;
    $144 = (($p) + ($$sum12)|0);
    $145 = HEAP32[$144>>2]|0;
    $146 = ($145|0)==(0|0);
    do {
     if (!($146)) {
      $147 = HEAP32[((30472 + 16|0))>>2]|0;
      $148 = ($145>>>0)<($147>>>0);
      if ($148) {
       _abort();
       // unreachable;
      } else {
       $149 = (($R$1) + 16|0);
       HEAP32[$149>>2] = $145;
       $150 = (($145) + 24|0);
       HEAP32[$150>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum13 = (($2) + 20)|0;
    $151 = (($p) + ($$sum13)|0);
    $152 = HEAP32[$151>>2]|0;
    $153 = ($152|0)==(0|0);
    if (!($153)) {
     $154 = HEAP32[((30472 + 16|0))>>2]|0;
     $155 = ($152>>>0)<($154>>>0);
     if ($155) {
      _abort();
      // unreachable;
     } else {
      $156 = (($R$1) + 20|0);
      HEAP32[$156>>2] = $152;
      $157 = (($152) + 24|0);
      HEAP32[$157>>2] = $R$1;
      break;
     }
    }
   }
  }
 } while(0);
 $158 = ($72>>>0)<(16);
 if ($158) {
  $159 = HEAP32[$0>>2]|0;
  $160 = $159 & 1;
  $161 = $70 | $160;
  $162 = $161 | 2;
  HEAP32[$0>>2] = $162;
  $$sum910 = $70 | 4;
  $163 = (($p) + ($$sum910)|0);
  $164 = HEAP32[$163>>2]|0;
  $165 = $164 | 1;
  HEAP32[$163>>2] = $165;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 } else {
  $166 = (($p) + ($nb)|0);
  $167 = HEAP32[$0>>2]|0;
  $168 = $167 & 1;
  $169 = $168 | $nb;
  $170 = $169 | 2;
  HEAP32[$0>>2] = $170;
  $$sum5 = (($nb) + 4)|0;
  $171 = (($p) + ($$sum5)|0);
  $172 = $72 | 3;
  HEAP32[$171>>2] = $172;
  $$sum78 = $70 | 4;
  $173 = (($p) + ($$sum78)|0);
  $174 = HEAP32[$173>>2]|0;
  $175 = $174 | 1;
  HEAP32[$173>>2] = $175;
  _dispose_chunk($166,$72);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 return 0|0;
}
function _dispose_chunk($p,$psize) {
 $p = $p|0;
 $psize = $psize|0;
 var $$0 = 0, $$02 = 0, $$1 = 0, $$pre = 0, $$pre$phi63Z2D = 0, $$pre$phi65Z2D = 0, $$pre$phiZ2D = 0, $$pre62 = 0, $$pre64 = 0, $$sum = 0, $$sum1 = 0, $$sum12$pre = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0;
 var $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0, $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum4 = 0, $$sum5 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0;
 var $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0;
 var $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0;
 var $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0;
 var $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0;
 var $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0;
 var $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0;
 var $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0;
 var $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0;
 var $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0;
 var $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0;
 var $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0;
 var $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I19$0 = 0, $I19$0$c = 0, $K20$049 = 0, $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$048 = 0, $cond = 0, $cond46 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = (($p) + ($psize)|0);
 $1 = (($p) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 & 1;
 $4 = ($3|0)==(0);
 do {
  if ($4) {
   $5 = HEAP32[$p>>2]|0;
   $6 = $2 & 3;
   $7 = ($6|0)==(0);
   if ($7) {
    STACKTOP = sp;return;
   }
   $8 = (0 - ($5))|0;
   $9 = (($p) + ($8)|0);
   $10 = (($5) + ($psize))|0;
   $11 = HEAP32[((30472 + 16|0))>>2]|0;
   $12 = ($9>>>0)<($11>>>0);
   if ($12) {
    _abort();
    // unreachable;
   }
   $13 = HEAP32[((30472 + 20|0))>>2]|0;
   $14 = ($9|0)==($13|0);
   if ($14) {
    $$sum = (($psize) + 4)|0;
    $100 = (($p) + ($$sum)|0);
    $101 = HEAP32[$100>>2]|0;
    $102 = $101 & 3;
    $103 = ($102|0)==(3);
    if (!($103)) {
     $$0 = $9;$$02 = $10;
     break;
    }
    HEAP32[((30472 + 8|0))>>2] = $10;
    $104 = HEAP32[$100>>2]|0;
    $105 = $104 & -2;
    HEAP32[$100>>2] = $105;
    $106 = $10 | 1;
    $$sum20 = (4 - ($5))|0;
    $107 = (($p) + ($$sum20)|0);
    HEAP32[$107>>2] = $106;
    HEAP32[$0>>2] = $10;
    STACKTOP = sp;return;
   }
   $15 = $5 >>> 3;
   $16 = ($5>>>0)<(256);
   if ($16) {
    $$sum30 = (8 - ($5))|0;
    $17 = (($p) + ($$sum30)|0);
    $18 = HEAP32[$17>>2]|0;
    $$sum31 = (12 - ($5))|0;
    $19 = (($p) + ($$sum31)|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = $15 << 1;
    $22 = ((30472 + ($21<<2)|0) + 40|0);
    $23 = ($18|0)==($22|0);
    if (!($23)) {
     $24 = ($18>>>0)<($11>>>0);
     if ($24) {
      _abort();
      // unreachable;
     }
     $25 = (($18) + 12|0);
     $26 = HEAP32[$25>>2]|0;
     $27 = ($26|0)==($9|0);
     if (!($27)) {
      _abort();
      // unreachable;
     }
    }
    $28 = ($20|0)==($18|0);
    if ($28) {
     $29 = 1 << $15;
     $30 = $29 ^ -1;
     $31 = HEAP32[30472>>2]|0;
     $32 = $31 & $30;
     HEAP32[30472>>2] = $32;
     $$0 = $9;$$02 = $10;
     break;
    }
    $33 = ($20|0)==($22|0);
    if ($33) {
     $$pre64 = (($20) + 8|0);
     $$pre$phi65Z2D = $$pre64;
    } else {
     $34 = ($20>>>0)<($11>>>0);
     if ($34) {
      _abort();
      // unreachable;
     }
     $35 = (($20) + 8|0);
     $36 = HEAP32[$35>>2]|0;
     $37 = ($36|0)==($9|0);
     if ($37) {
      $$pre$phi65Z2D = $35;
     } else {
      _abort();
      // unreachable;
     }
    }
    $38 = (($18) + 12|0);
    HEAP32[$38>>2] = $20;
    HEAP32[$$pre$phi65Z2D>>2] = $18;
    $$0 = $9;$$02 = $10;
    break;
   }
   $$sum22 = (24 - ($5))|0;
   $39 = (($p) + ($$sum22)|0);
   $40 = HEAP32[$39>>2]|0;
   $$sum23 = (12 - ($5))|0;
   $41 = (($p) + ($$sum23)|0);
   $42 = HEAP32[$41>>2]|0;
   $43 = ($42|0)==($9|0);
   do {
    if ($43) {
     $$sum24 = (16 - ($5))|0;
     $$sum25 = (($$sum24) + 4)|0;
     $53 = (($p) + ($$sum25)|0);
     $54 = HEAP32[$53>>2]|0;
     $55 = ($54|0)==(0|0);
     if ($55) {
      $56 = (($p) + ($$sum24)|0);
      $57 = HEAP32[$56>>2]|0;
      $58 = ($57|0)==(0|0);
      if ($58) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $57;$RP$0 = $56;
      }
     } else {
      $R$0 = $54;$RP$0 = $53;
     }
     while(1) {
      $59 = (($R$0) + 20|0);
      $60 = HEAP32[$59>>2]|0;
      $61 = ($60|0)==(0|0);
      if (!($61)) {
       $R$0 = $60;$RP$0 = $59;
       continue;
      }
      $62 = (($R$0) + 16|0);
      $63 = HEAP32[$62>>2]|0;
      $64 = ($63|0)==(0|0);
      if ($64) {
       break;
      } else {
       $R$0 = $63;$RP$0 = $62;
      }
     }
     $65 = ($RP$0>>>0)<($11>>>0);
     if ($65) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum29 = (8 - ($5))|0;
     $44 = (($p) + ($$sum29)|0);
     $45 = HEAP32[$44>>2]|0;
     $46 = ($45>>>0)<($11>>>0);
     if ($46) {
      _abort();
      // unreachable;
     }
     $47 = (($45) + 12|0);
     $48 = HEAP32[$47>>2]|0;
     $49 = ($48|0)==($9|0);
     if (!($49)) {
      _abort();
      // unreachable;
     }
     $50 = (($42) + 8|0);
     $51 = HEAP32[$50>>2]|0;
     $52 = ($51|0)==($9|0);
     if ($52) {
      HEAP32[$47>>2] = $42;
      HEAP32[$50>>2] = $45;
      $R$1 = $42;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $66 = ($40|0)==(0|0);
   if ($66) {
    $$0 = $9;$$02 = $10;
   } else {
    $$sum26 = (28 - ($5))|0;
    $67 = (($p) + ($$sum26)|0);
    $68 = HEAP32[$67>>2]|0;
    $69 = ((30472 + ($68<<2)|0) + 304|0);
    $70 = HEAP32[$69>>2]|0;
    $71 = ($9|0)==($70|0);
    if ($71) {
     HEAP32[$69>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $72 = 1 << $68;
      $73 = $72 ^ -1;
      $74 = HEAP32[((30472 + 4|0))>>2]|0;
      $75 = $74 & $73;
      HEAP32[((30472 + 4|0))>>2] = $75;
      $$0 = $9;$$02 = $10;
      break;
     }
    } else {
     $76 = HEAP32[((30472 + 16|0))>>2]|0;
     $77 = ($40>>>0)<($76>>>0);
     if ($77) {
      _abort();
      // unreachable;
     }
     $78 = (($40) + 16|0);
     $79 = HEAP32[$78>>2]|0;
     $80 = ($79|0)==($9|0);
     if ($80) {
      HEAP32[$78>>2] = $R$1;
     } else {
      $81 = (($40) + 20|0);
      HEAP32[$81>>2] = $R$1;
     }
     $82 = ($R$1|0)==(0|0);
     if ($82) {
      $$0 = $9;$$02 = $10;
      break;
     }
    }
    $83 = HEAP32[((30472 + 16|0))>>2]|0;
    $84 = ($R$1>>>0)<($83>>>0);
    if ($84) {
     _abort();
     // unreachable;
    }
    $85 = (($R$1) + 24|0);
    HEAP32[$85>>2] = $40;
    $$sum27 = (16 - ($5))|0;
    $86 = (($p) + ($$sum27)|0);
    $87 = HEAP32[$86>>2]|0;
    $88 = ($87|0)==(0|0);
    do {
     if (!($88)) {
      $89 = HEAP32[((30472 + 16|0))>>2]|0;
      $90 = ($87>>>0)<($89>>>0);
      if ($90) {
       _abort();
       // unreachable;
      } else {
       $91 = (($R$1) + 16|0);
       HEAP32[$91>>2] = $87;
       $92 = (($87) + 24|0);
       HEAP32[$92>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum28 = (($$sum27) + 4)|0;
    $93 = (($p) + ($$sum28)|0);
    $94 = HEAP32[$93>>2]|0;
    $95 = ($94|0)==(0|0);
    if ($95) {
     $$0 = $9;$$02 = $10;
    } else {
     $96 = HEAP32[((30472 + 16|0))>>2]|0;
     $97 = ($94>>>0)<($96>>>0);
     if ($97) {
      _abort();
      // unreachable;
     } else {
      $98 = (($R$1) + 20|0);
      HEAP32[$98>>2] = $94;
      $99 = (($94) + 24|0);
      HEAP32[$99>>2] = $R$1;
      $$0 = $9;$$02 = $10;
      break;
     }
    }
   }
  } else {
   $$0 = $p;$$02 = $psize;
  }
 } while(0);
 $108 = HEAP32[((30472 + 16|0))>>2]|0;
 $109 = ($0>>>0)<($108>>>0);
 if ($109) {
  _abort();
  // unreachable;
 }
 $$sum1 = (($psize) + 4)|0;
 $110 = (($p) + ($$sum1)|0);
 $111 = HEAP32[$110>>2]|0;
 $112 = $111 & 2;
 $113 = ($112|0)==(0);
 if ($113) {
  $114 = HEAP32[((30472 + 24|0))>>2]|0;
  $115 = ($0|0)==($114|0);
  if ($115) {
   $116 = HEAP32[((30472 + 12|0))>>2]|0;
   $117 = (($116) + ($$02))|0;
   HEAP32[((30472 + 12|0))>>2] = $117;
   HEAP32[((30472 + 24|0))>>2] = $$0;
   $118 = $117 | 1;
   $119 = (($$0) + 4|0);
   HEAP32[$119>>2] = $118;
   $120 = HEAP32[((30472 + 20|0))>>2]|0;
   $121 = ($$0|0)==($120|0);
   if (!($121)) {
    STACKTOP = sp;return;
   }
   HEAP32[((30472 + 20|0))>>2] = 0;
   HEAP32[((30472 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $122 = HEAP32[((30472 + 20|0))>>2]|0;
  $123 = ($0|0)==($122|0);
  if ($123) {
   $124 = HEAP32[((30472 + 8|0))>>2]|0;
   $125 = (($124) + ($$02))|0;
   HEAP32[((30472 + 8|0))>>2] = $125;
   HEAP32[((30472 + 20|0))>>2] = $$0;
   $126 = $125 | 1;
   $127 = (($$0) + 4|0);
   HEAP32[$127>>2] = $126;
   $128 = (($$0) + ($125)|0);
   HEAP32[$128>>2] = $125;
   STACKTOP = sp;return;
  }
  $129 = $111 & -8;
  $130 = (($129) + ($$02))|0;
  $131 = $111 >>> 3;
  $132 = ($111>>>0)<(256);
  do {
   if ($132) {
    $$sum18 = (($psize) + 8)|0;
    $133 = (($p) + ($$sum18)|0);
    $134 = HEAP32[$133>>2]|0;
    $$sum19 = (($psize) + 12)|0;
    $135 = (($p) + ($$sum19)|0);
    $136 = HEAP32[$135>>2]|0;
    $137 = $131 << 1;
    $138 = ((30472 + ($137<<2)|0) + 40|0);
    $139 = ($134|0)==($138|0);
    if (!($139)) {
     $140 = ($134>>>0)<($108>>>0);
     if ($140) {
      _abort();
      // unreachable;
     }
     $141 = (($134) + 12|0);
     $142 = HEAP32[$141>>2]|0;
     $143 = ($142|0)==($0|0);
     if (!($143)) {
      _abort();
      // unreachable;
     }
    }
    $144 = ($136|0)==($134|0);
    if ($144) {
     $145 = 1 << $131;
     $146 = $145 ^ -1;
     $147 = HEAP32[30472>>2]|0;
     $148 = $147 & $146;
     HEAP32[30472>>2] = $148;
     break;
    }
    $149 = ($136|0)==($138|0);
    if ($149) {
     $$pre62 = (($136) + 8|0);
     $$pre$phi63Z2D = $$pre62;
    } else {
     $150 = ($136>>>0)<($108>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($136) + 8|0);
     $152 = HEAP32[$151>>2]|0;
     $153 = ($152|0)==($0|0);
     if ($153) {
      $$pre$phi63Z2D = $151;
     } else {
      _abort();
      // unreachable;
     }
    }
    $154 = (($134) + 12|0);
    HEAP32[$154>>2] = $136;
    HEAP32[$$pre$phi63Z2D>>2] = $134;
   } else {
    $$sum2 = (($psize) + 24)|0;
    $155 = (($p) + ($$sum2)|0);
    $156 = HEAP32[$155>>2]|0;
    $$sum3 = (($psize) + 12)|0;
    $157 = (($p) + ($$sum3)|0);
    $158 = HEAP32[$157>>2]|0;
    $159 = ($158|0)==($0|0);
    do {
     if ($159) {
      $$sum5 = (($psize) + 20)|0;
      $169 = (($p) + ($$sum5)|0);
      $170 = HEAP32[$169>>2]|0;
      $171 = ($170|0)==(0|0);
      if ($171) {
       $$sum4 = (($psize) + 16)|0;
       $172 = (($p) + ($$sum4)|0);
       $173 = HEAP32[$172>>2]|0;
       $174 = ($173|0)==(0|0);
       if ($174) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $173;$RP9$0 = $172;
       }
      } else {
       $R7$0 = $170;$RP9$0 = $169;
      }
      while(1) {
       $175 = (($R7$0) + 20|0);
       $176 = HEAP32[$175>>2]|0;
       $177 = ($176|0)==(0|0);
       if (!($177)) {
        $R7$0 = $176;$RP9$0 = $175;
        continue;
       }
       $178 = (($R7$0) + 16|0);
       $179 = HEAP32[$178>>2]|0;
       $180 = ($179|0)==(0|0);
       if ($180) {
        break;
       } else {
        $R7$0 = $179;$RP9$0 = $178;
       }
      }
      $181 = ($RP9$0>>>0)<($108>>>0);
      if ($181) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $$sum17 = (($psize) + 8)|0;
      $160 = (($p) + ($$sum17)|0);
      $161 = HEAP32[$160>>2]|0;
      $162 = ($161>>>0)<($108>>>0);
      if ($162) {
       _abort();
       // unreachable;
      }
      $163 = (($161) + 12|0);
      $164 = HEAP32[$163>>2]|0;
      $165 = ($164|0)==($0|0);
      if (!($165)) {
       _abort();
       // unreachable;
      }
      $166 = (($158) + 8|0);
      $167 = HEAP32[$166>>2]|0;
      $168 = ($167|0)==($0|0);
      if ($168) {
       HEAP32[$163>>2] = $158;
       HEAP32[$166>>2] = $161;
       $R7$1 = $158;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $182 = ($156|0)==(0|0);
    if (!($182)) {
     $$sum14 = (($psize) + 28)|0;
     $183 = (($p) + ($$sum14)|0);
     $184 = HEAP32[$183>>2]|0;
     $185 = ((30472 + ($184<<2)|0) + 304|0);
     $186 = HEAP32[$185>>2]|0;
     $187 = ($0|0)==($186|0);
     if ($187) {
      HEAP32[$185>>2] = $R7$1;
      $cond46 = ($R7$1|0)==(0|0);
      if ($cond46) {
       $188 = 1 << $184;
       $189 = $188 ^ -1;
       $190 = HEAP32[((30472 + 4|0))>>2]|0;
       $191 = $190 & $189;
       HEAP32[((30472 + 4|0))>>2] = $191;
       break;
      }
     } else {
      $192 = HEAP32[((30472 + 16|0))>>2]|0;
      $193 = ($156>>>0)<($192>>>0);
      if ($193) {
       _abort();
       // unreachable;
      }
      $194 = (($156) + 16|0);
      $195 = HEAP32[$194>>2]|0;
      $196 = ($195|0)==($0|0);
      if ($196) {
       HEAP32[$194>>2] = $R7$1;
      } else {
       $197 = (($156) + 20|0);
       HEAP32[$197>>2] = $R7$1;
      }
      $198 = ($R7$1|0)==(0|0);
      if ($198) {
       break;
      }
     }
     $199 = HEAP32[((30472 + 16|0))>>2]|0;
     $200 = ($R7$1>>>0)<($199>>>0);
     if ($200) {
      _abort();
      // unreachable;
     }
     $201 = (($R7$1) + 24|0);
     HEAP32[$201>>2] = $156;
     $$sum15 = (($psize) + 16)|0;
     $202 = (($p) + ($$sum15)|0);
     $203 = HEAP32[$202>>2]|0;
     $204 = ($203|0)==(0|0);
     do {
      if (!($204)) {
       $205 = HEAP32[((30472 + 16|0))>>2]|0;
       $206 = ($203>>>0)<($205>>>0);
       if ($206) {
        _abort();
        // unreachable;
       } else {
        $207 = (($R7$1) + 16|0);
        HEAP32[$207>>2] = $203;
        $208 = (($203) + 24|0);
        HEAP32[$208>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum16 = (($psize) + 20)|0;
     $209 = (($p) + ($$sum16)|0);
     $210 = HEAP32[$209>>2]|0;
     $211 = ($210|0)==(0|0);
     if (!($211)) {
      $212 = HEAP32[((30472 + 16|0))>>2]|0;
      $213 = ($210>>>0)<($212>>>0);
      if ($213) {
       _abort();
       // unreachable;
      } else {
       $214 = (($R7$1) + 20|0);
       HEAP32[$214>>2] = $210;
       $215 = (($210) + 24|0);
       HEAP32[$215>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $216 = $130 | 1;
  $217 = (($$0) + 4|0);
  HEAP32[$217>>2] = $216;
  $218 = (($$0) + ($130)|0);
  HEAP32[$218>>2] = $130;
  $219 = HEAP32[((30472 + 20|0))>>2]|0;
  $220 = ($$0|0)==($219|0);
  if ($220) {
   HEAP32[((30472 + 8|0))>>2] = $130;
   STACKTOP = sp;return;
  } else {
   $$1 = $130;
  }
 } else {
  $221 = $111 & -2;
  HEAP32[$110>>2] = $221;
  $222 = $$02 | 1;
  $223 = (($$0) + 4|0);
  HEAP32[$223>>2] = $222;
  $224 = (($$0) + ($$02)|0);
  HEAP32[$224>>2] = $$02;
  $$1 = $$02;
 }
 $225 = $$1 >>> 3;
 $226 = ($$1>>>0)<(256);
 if ($226) {
  $227 = $225 << 1;
  $228 = ((30472 + ($227<<2)|0) + 40|0);
  $229 = HEAP32[30472>>2]|0;
  $230 = 1 << $225;
  $231 = $229 & $230;
  $232 = ($231|0)==(0);
  if ($232) {
   $233 = $229 | $230;
   HEAP32[30472>>2] = $233;
   $$sum12$pre = (($227) + 2)|0;
   $$pre = ((30472 + ($$sum12$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $228;
  } else {
   $$sum13 = (($227) + 2)|0;
   $234 = ((30472 + ($$sum13<<2)|0) + 40|0);
   $235 = HEAP32[$234>>2]|0;
   $236 = HEAP32[((30472 + 16|0))>>2]|0;
   $237 = ($235>>>0)<($236>>>0);
   if ($237) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $234;$F16$0 = $235;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $$0;
  $238 = (($F16$0) + 12|0);
  HEAP32[$238>>2] = $$0;
  $239 = (($$0) + 8|0);
  HEAP32[$239>>2] = $F16$0;
  $240 = (($$0) + 12|0);
  HEAP32[$240>>2] = $228;
  STACKTOP = sp;return;
 }
 $241 = $$1 >>> 8;
 $242 = ($241|0)==(0);
 if ($242) {
  $I19$0 = 0;
 } else {
  $243 = ($$1>>>0)>(16777215);
  if ($243) {
   $I19$0 = 31;
  } else {
   $244 = (($241) + 1048320)|0;
   $245 = $244 >>> 16;
   $246 = $245 & 8;
   $247 = $241 << $246;
   $248 = (($247) + 520192)|0;
   $249 = $248 >>> 16;
   $250 = $249 & 4;
   $251 = $250 | $246;
   $252 = $247 << $250;
   $253 = (($252) + 245760)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 2;
   $256 = $251 | $255;
   $257 = (14 - ($256))|0;
   $258 = $252 << $255;
   $259 = $258 >>> 15;
   $260 = (($257) + ($259))|0;
   $261 = $260 << 1;
   $262 = (($260) + 7)|0;
   $263 = $$1 >>> $262;
   $264 = $263 & 1;
   $265 = $264 | $261;
   $I19$0 = $265;
  }
 }
 $266 = ((30472 + ($I19$0<<2)|0) + 304|0);
 $267 = (($$0) + 28|0);
 $I19$0$c = $I19$0;
 HEAP32[$267>>2] = $I19$0$c;
 $268 = (($$0) + 20|0);
 HEAP32[$268>>2] = 0;
 $269 = (($$0) + 16|0);
 HEAP32[$269>>2] = 0;
 $270 = HEAP32[((30472 + 4|0))>>2]|0;
 $271 = 1 << $I19$0;
 $272 = $270 & $271;
 $273 = ($272|0)==(0);
 if ($273) {
  $274 = $270 | $271;
  HEAP32[((30472 + 4|0))>>2] = $274;
  HEAP32[$266>>2] = $$0;
  $275 = (($$0) + 24|0);
  HEAP32[$275>>2] = $266;
  $276 = (($$0) + 12|0);
  HEAP32[$276>>2] = $$0;
  $277 = (($$0) + 8|0);
  HEAP32[$277>>2] = $$0;
  STACKTOP = sp;return;
 }
 $278 = HEAP32[$266>>2]|0;
 $279 = ($I19$0|0)==(31);
 if ($279) {
  $287 = 0;
 } else {
  $280 = $I19$0 >>> 1;
  $281 = (25 - ($280))|0;
  $287 = $281;
 }
 $282 = (($278) + 4|0);
 $283 = HEAP32[$282>>2]|0;
 $284 = $283 & -8;
 $285 = ($284|0)==($$1|0);
 L194: do {
  if ($285) {
   $T$0$lcssa = $278;
  } else {
   $286 = $$1 << $287;
   $K20$049 = $286;$T$048 = $278;
   while(1) {
    $294 = $K20$049 >>> 31;
    $295 = ((($T$048) + ($294<<2)|0) + 16|0);
    $290 = HEAP32[$295>>2]|0;
    $296 = ($290|0)==(0|0);
    if ($296) {
     break;
    }
    $288 = $K20$049 << 1;
    $289 = (($290) + 4|0);
    $291 = HEAP32[$289>>2]|0;
    $292 = $291 & -8;
    $293 = ($292|0)==($$1|0);
    if ($293) {
     $T$0$lcssa = $290;
     break L194;
    } else {
     $K20$049 = $288;$T$048 = $290;
    }
   }
   $297 = HEAP32[((30472 + 16|0))>>2]|0;
   $298 = ($295>>>0)<($297>>>0);
   if ($298) {
    _abort();
    // unreachable;
   }
   HEAP32[$295>>2] = $$0;
   $299 = (($$0) + 24|0);
   HEAP32[$299>>2] = $T$048;
   $300 = (($$0) + 12|0);
   HEAP32[$300>>2] = $$0;
   $301 = (($$0) + 8|0);
   HEAP32[$301>>2] = $$0;
   STACKTOP = sp;return;
  }
 } while(0);
 $302 = (($T$0$lcssa) + 8|0);
 $303 = HEAP32[$302>>2]|0;
 $304 = HEAP32[((30472 + 16|0))>>2]|0;
 $305 = ($T$0$lcssa>>>0)<($304>>>0);
 if ($305) {
  _abort();
  // unreachable;
 }
 $306 = ($303>>>0)<($304>>>0);
 if ($306) {
  _abort();
  // unreachable;
 }
 $307 = (($303) + 12|0);
 HEAP32[$307>>2] = $$0;
 HEAP32[$302>>2] = $$0;
 $308 = (($$0) + 8|0);
 HEAP32[$308>>2] = $303;
 $309 = (($$0) + 12|0);
 HEAP32[$309>>2] = $T$0$lcssa;
 $310 = (($$0) + 24|0);
 HEAP32[$310>>2] = 0;
 STACKTOP = sp;return;
}
function _strcmp($l,$r) {
 $l = $l|0;
 $r = $r|0;
 var $$014 = 0, $$05 = 0, $$lcssa = 0, $$lcssa2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond3 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$l>>0]|0;
 $1 = HEAP8[$r>>0]|0;
 $2 = ($0<<24>>24)!=($1<<24>>24);
 $3 = ($0<<24>>24)==(0);
 $or$cond3 = $2 | $3;
 if ($or$cond3) {
  $$lcssa = $0;$$lcssa2 = $1;
 } else {
  $$014 = $l;$$05 = $r;
  while(1) {
   $4 = (($$014) + 1|0);
   $5 = (($$05) + 1|0);
   $6 = HEAP8[$4>>0]|0;
   $7 = HEAP8[$5>>0]|0;
   $8 = ($6<<24>>24)!=($7<<24>>24);
   $9 = ($6<<24>>24)==(0);
   $or$cond = $8 | $9;
   if ($or$cond) {
    $$lcssa = $6;$$lcssa2 = $7;
    break;
   } else {
    $$014 = $4;$$05 = $5;
   }
  }
 }
 $10 = $$lcssa&255;
 $11 = $$lcssa2&255;
 $12 = (($10) - ($11))|0;
 STACKTOP = sp;return ($12|0);
}
function runPostSets() {
 
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
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[((curr)>>0)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
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
function _memmove(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
      // Unlikely case: Copy backwards in a safe manner
      ret = dest;
      src = (src + num)|0;
      dest = (dest + num)|0;
      while ((num|0) > 0) {
        dest = (dest - 1)|0;
        src = (src - 1)|0;
        num = (num - 1)|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      }
      dest = ret;
    } else {
      _memcpy(dest, src, num) | 0;
    }
    return dest | 0;
}

// EMSCRIPTEN_END_FUNCS

    

  // EMSCRIPTEN_END_FUNCS
  

    return { _strlen: _strlen, _free: _free, _hmac_simple_hex: _hmac_simple_hex, _sha_simple: _sha_simple, _memmove: _memmove, _pbkdf_simple: _pbkdf_simple, _realloc: _realloc, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _hmac_simple: _hmac_simple, _pbkdf_simple_hex: _pbkdf_simple_hex, _sha_simple_hex: _sha_simple_hex, _calloc: _calloc, _main: _main, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0 };
  })
  // EMSCRIPTEN_END_ASM
  ({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_send": _send, "___setErrNo": ___setErrNo, "_llvm_stackrestore": _llvm_stackrestore, "___assert_fail": ___assert_fail, "_fflush": _fflush, "_pwrite": _pwrite, "__reallyNegative": __reallyNegative, "_sbrk": _sbrk, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_sysconf": _sysconf, "_clock": _clock, "_llvm_stacksave": _llvm_stacksave, "_puts": _puts, "_printf": _printf, "_write": _write, "___errno_location": ___errno_location, "_fputc": _fputc, "_mkport": _mkport, "_abort": _abort, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "__formatString": __formatString, "_fputs": _fputs, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
  var real__strlen = asm["_strlen"]; asm["_strlen"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__strlen.apply(null, arguments);
};

var real__hmac_simple_hex = asm["_hmac_simple_hex"]; asm["_hmac_simple_hex"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__hmac_simple_hex.apply(null, arguments);
};

var real__sha_simple = asm["_sha_simple"]; asm["_sha_simple"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__sha_simple.apply(null, arguments);
};

var real__memmove = asm["_memmove"]; asm["_memmove"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__memmove.apply(null, arguments);
};

var real__pbkdf_simple = asm["_pbkdf_simple"]; asm["_pbkdf_simple"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__pbkdf_simple.apply(null, arguments);
};

var real__realloc = asm["_realloc"]; asm["_realloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__realloc.apply(null, arguments);
};

var real__hmac_simple = asm["_hmac_simple"]; asm["_hmac_simple"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__hmac_simple.apply(null, arguments);
};

var real__pbkdf_simple_hex = asm["_pbkdf_simple_hex"]; asm["_pbkdf_simple_hex"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__pbkdf_simple_hex.apply(null, arguments);
};

var real__sha_simple_hex = asm["_sha_simple_hex"]; asm["_sha_simple_hex"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__sha_simple_hex.apply(null, arguments);
};

var real__calloc = asm["_calloc"]; asm["_calloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__calloc.apply(null, arguments);
};

var real__main = asm["_main"]; asm["_main"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__main.apply(null, arguments);
};

var real_runPostSets = asm["runPostSets"]; asm["runPostSets"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_runPostSets.apply(null, arguments);
};
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _hmac_simple_hex = Module["_hmac_simple_hex"] = asm["_hmac_simple_hex"];
var _sha_simple = Module["_sha_simple"] = asm["_sha_simple"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _pbkdf_simple = Module["_pbkdf_simple"] = asm["_pbkdf_simple"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _hmac_simple = Module["_hmac_simple"] = asm["_hmac_simple"];
var _pbkdf_simple_hex = Module["_pbkdf_simple_hex"] = asm["_pbkdf_simple_hex"];
var _sha_simple_hex = Module["_sha_simple_hex"] = asm["_sha_simple_hex"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var _main = Module["_main"] = asm["_main"];
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
  if (Module['memoryInitializerPrefixURL']) {
    memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
  }
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
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
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
    exit(ret);
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

    if (ABORT) return; 

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
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so not exiting');
    return;
  }

  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
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



//# sourceMappingURL=test.html.map