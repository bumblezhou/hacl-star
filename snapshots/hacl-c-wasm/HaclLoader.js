var HaclLoader = function(HaclLoader) {
  HaclLoader = HaclLoader || {};

var Module=typeof HaclLoader!=="undefined"?HaclLoader:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=(function(status,toThrow){throw toThrow});Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;if(Module["ENVIRONMENT"]){if(Module["ENVIRONMENT"]==="WEB"){ENVIRONMENT_IS_WEB=true}else if(Module["ENVIRONMENT"]==="WORKER"){ENVIRONMENT_IS_WORKER=true}else if(Module["ENVIRONMENT"]==="NODE"){ENVIRONMENT_IS_NODE=true}else if(Module["ENVIRONMENT"]==="SHELL"){ENVIRONMENT_IS_SHELL=true}else{throw new Error("Module['ENVIRONMENT'] value is not valid. must be one of: WEB|WORKER|NODE|SHELL.")}}else{ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER}if(ENVIRONMENT_IS_NODE){var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename);return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));process["on"]("unhandledRejection",(function(reason,p){process["exit"](1)}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){return read(f)}}Module["readBinary"]=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status,toThrow){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)};if(typeof arguments!="undefined"){Module["arguments"]=arguments}Module["setWindowTitle"]=(function(title){document.title=title})}Module["print"]=typeof console!=="undefined"?console.log:typeof print!=="undefined"?print:null;Module["printErr"]=typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn||Module["print"];Module.print=Module["print"];Module.printErr=Module["printErr"];for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function staticAlloc(size){assert(!staticSealed);var ret=STATICTOP;STATICTOP=STATICTOP+size+15&-16;return ret}function alignMemory(size,factor){if(!factor)factor=STACK_ALIGN;var ret=size=Math.ceil(size/factor)*factor;return ret}var functionPointers=new Array(0);var GLOBAL_BASE=1024;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;var WASM_PAGE_SIZE=65536;var ASMJS_PAGE_SIZE=16777216;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{if(typeof WebAssembly==="object"&&typeof WebAssembly.Memory==="function"){Module["wasmMemory"]=new WebAssembly.Memory({"initial":TOTAL_MEMORY/WASM_PAGE_SIZE,"maximum":TOTAL_MEMORY/WASM_PAGE_SIZE});buffer=Module["wasmMemory"].buffer}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}HEAP32[0]=1668509029;HEAP16[1]=25459;if(HEAPU8[2]!==115||HEAPU8[3]!==99)throw"Runtime error: expected the system to be little-endian!";function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_max=Math.max;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}function integrateWasmJS(){var wasmTextFile="HaclLoader.wast";var wasmBinaryFile="HaclLoader.wasm";var asmjsCodeFile="HaclLoader.temp.asm.js";if(typeof Module["locateFile"]==="function"){if(!isDataURI(wasmTextFile)){wasmTextFile=Module["locateFile"](wasmTextFile)}if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=Module["locateFile"](wasmBinaryFile)}if(!isDataURI(asmjsCodeFile)){asmjsCodeFile=Module["locateFile"](asmjsCodeFile)}}var wasmPageSize=64*1024;var info={"global":null,"env":null,"asm2wasm":{"f64-rem":(function(x,y){return x%y}),"debugger":(function(){debugger})},"parent":Module};var exports=null;function mergeMemory(newBuffer){var oldBuffer=Module["buffer"];if(newBuffer.byteLength<oldBuffer.byteLength){Module["printErr"]("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here")}var oldView=new Int8Array(oldBuffer);var newView=new Int8Array(newBuffer);newView.set(oldView);updateGlobalBuffer(newBuffer);updateGlobalBufferViews()}function fixImports(imports){return imports}function getBinary(){try{if(Module["wasmBinary"]){return new Uint8Array(Module["wasmBinary"])}if(Module["readBinary"]){return Module["readBinary"](wasmBinaryFile)}else{throw"on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)"}}catch(err){abort(err)}}function getBinaryPromise(){if(!Module["wasmBinary"]&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then((function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()})).catch((function(){return getBinary()}))}return new Promise((function(resolve,reject){resolve(getBinary())}))}function doNativeWasm(global,env,providedBuffer){if(typeof WebAssembly!=="object"){Module["printErr"]("no native wasm support detected");return false}if(!(Module["wasmMemory"]instanceof WebAssembly.Memory)){Module["printErr"]("no native wasm Memory in use");return false}env["memory"]=Module["wasmMemory"];info["global"]={"NaN":NaN,"Infinity":Infinity};info["global.Math"]=Math;info["env"]=env;function receiveInstance(instance,module){exports=instance.exports;if(exports.memory)mergeMemory(exports.memory);Module["asm"]=exports;Module["usingWasm"]=true;removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){Module["printErr"]("Module.instantiateWasm callback failed with error: "+e);return false}}function receiveInstantiatedSource(output){receiveInstance(output["instance"],output["module"])}function instantiateArrayBuffer(receiver){getBinaryPromise().then((function(binary){return WebAssembly.instantiate(binary,info)})).then(receiver).catch((function(reason){Module["printErr"]("failed to asynchronously prepare wasm: "+reason);abort(reason)}))}if(!Module["wasmBinary"]&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch==="function"){WebAssembly.instantiateStreaming(fetch(wasmBinaryFile,{credentials:"same-origin"}),info).then(receiveInstantiatedSource).catch((function(reason){Module["printErr"]("wasm streaming compile failed: "+reason);Module["printErr"]("falling back to ArrayBuffer instantiation");instantiateArrayBuffer(receiveInstantiatedSource)}))}else{instantiateArrayBuffer(receiveInstantiatedSource)}return{}}Module["asmPreload"]=Module["asm"];var asmjsReallocBuffer=Module["reallocBuffer"];var wasmReallocBuffer=(function(size){var PAGE_MULTIPLE=Module["usingWasm"]?WASM_PAGE_SIZE:ASMJS_PAGE_SIZE;size=alignUp(size,PAGE_MULTIPLE);var old=Module["buffer"];var oldSize=old.byteLength;if(Module["usingWasm"]){try{var result=Module["wasmMemory"].grow((size-oldSize)/wasmPageSize);if(result!==(-1|0)){return Module["buffer"]=Module["wasmMemory"].buffer}else{return null}}catch(e){return null}}});Module["reallocBuffer"]=(function(size){if(finalMethod==="asmjs"){return asmjsReallocBuffer(size)}else{return wasmReallocBuffer(size)}});var finalMethod="";Module["asm"]=(function(global,env,providedBuffer){env=fixImports(env);if(!env["table"]){var TABLE_SIZE=Module["wasmTableSize"];if(TABLE_SIZE===undefined)TABLE_SIZE=1024;var MAX_TABLE_SIZE=Module["wasmMaxTableSize"];if(typeof WebAssembly==="object"&&typeof WebAssembly.Table==="function"){if(MAX_TABLE_SIZE!==undefined){env["table"]=new WebAssembly.Table({"initial":TABLE_SIZE,"maximum":MAX_TABLE_SIZE,"element":"anyfunc"})}else{env["table"]=new WebAssembly.Table({"initial":TABLE_SIZE,element:"anyfunc"})}}else{env["table"]=new Array(TABLE_SIZE)}Module["wasmTable"]=env["table"]}if(!env["memoryBase"]){env["memoryBase"]=Module["STATIC_BASE"]}if(!env["tableBase"]){env["tableBase"]=0}var exports;exports=doNativeWasm(global,env,providedBuffer);if(!exports)abort("no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods");return exports})}integrateWasmJS();STATIC_BASE=GLOBAL_BASE;STATICTOP=STATIC_BASE+1536;__ATINIT__.push();var STATIC_BUMP=1536;Module["STATIC_BASE"]=STATIC_BASE;Module["STATIC_BUMP"]=STATIC_BUMP;STATICTOP+=16;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}DYNAMICTOP_PTR=staticAlloc(4);STACK_BASE=STACKTOP=alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;Module["wasmTableSize"]=0;Module["wasmMaxTableSize"]=0;Module.asmGlobalArg={};Module.asmLibraryArg={"enlargeMemory":enlargeMemory,"getTotalMemory":getTotalMemory,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"___setErrNo":___setErrNo,"_emscripten_memcpy_big":_emscripten_memcpy_big,"DYNAMICTOP_PTR":DYNAMICTOP_PTR,"STACKTOP":STACKTOP};var asm=Module["asm"](Module.asmGlobalArg,Module.asmLibraryArg,buffer);Module["asm"]=asm;var _AEAD_Poly1305_64_mk_state=Module["_AEAD_Poly1305_64_mk_state"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_mk_state"].apply(null,arguments)});var _AEAD_Poly1305_64_mul_div_16=Module["_AEAD_Poly1305_64_mul_div_16"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_mul_div_16"].apply(null,arguments)});var _AEAD_Poly1305_64_pad_last=Module["_AEAD_Poly1305_64_pad_last"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_pad_last"].apply(null,arguments)});var _AEAD_Poly1305_64_poly1305_blocks_continue=Module["_AEAD_Poly1305_64_poly1305_blocks_continue"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_poly1305_blocks_continue"].apply(null,arguments)});var _AEAD_Poly1305_64_poly1305_blocks_finish=Module["_AEAD_Poly1305_64_poly1305_blocks_finish"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_poly1305_blocks_finish"].apply(null,arguments)});var _AEAD_Poly1305_64_poly1305_blocks_finish_=Module["_AEAD_Poly1305_64_poly1305_blocks_finish_"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_poly1305_blocks_finish_"].apply(null,arguments)});var _AEAD_Poly1305_64_poly1305_blocks_init=Module["_AEAD_Poly1305_64_poly1305_blocks_init"]=(function(){return Module["asm"]["_AEAD_Poly1305_64_poly1305_blocks_init"].apply(null,arguments)});var _Hacl_Chacha20Poly1305_aead_decrypt=Module["_Hacl_Chacha20Poly1305_aead_decrypt"]=(function(){return Module["asm"]["_Hacl_Chacha20Poly1305_aead_decrypt"].apply(null,arguments)});var _Hacl_Chacha20Poly1305_aead_encrypt=Module["_Hacl_Chacha20Poly1305_aead_encrypt"]=(function(){return Module["asm"]["_Hacl_Chacha20Poly1305_aead_encrypt"].apply(null,arguments)});var _Hacl_Chacha20Poly1305_aead_encrypt_=Module["_Hacl_Chacha20Poly1305_aead_encrypt_"]=(function(){return Module["asm"]["_Hacl_Chacha20Poly1305_aead_encrypt_"].apply(null,arguments)});var _Hacl_Chacha20Poly1305_encode_length=Module["_Hacl_Chacha20Poly1305_encode_length"]=(function(){return Module["asm"]["_Hacl_Chacha20Poly1305_encode_length"].apply(null,arguments)});var _Hacl_Chacha20_Vec128_chacha20=Module["_Hacl_Chacha20_Vec128_chacha20"]=(function(){return Module["asm"]["_Hacl_Chacha20_Vec128_chacha20"].apply(null,arguments)});var _Hacl_Chacha20_chacha20=Module["_Hacl_Chacha20_chacha20"]=(function(){return Module["asm"]["_Hacl_Chacha20_chacha20"].apply(null,arguments)});var _Hacl_Chacha20_chacha20_key_block=Module["_Hacl_Chacha20_chacha20_key_block"]=(function(){return Module["asm"]["_Hacl_Chacha20_chacha20_key_block"].apply(null,arguments)});var _Hacl_Curve25519_crypto_scalarmult=Module["_Hacl_Curve25519_crypto_scalarmult"]=(function(){return Module["asm"]["_Hacl_Curve25519_crypto_scalarmult"].apply(null,arguments)});var _Hacl_Ed25519_secret_to_public=Module["_Hacl_Ed25519_secret_to_public"]=(function(){return Module["asm"]["_Hacl_Ed25519_secret_to_public"].apply(null,arguments)});var _Hacl_Ed25519_sign=Module["_Hacl_Ed25519_sign"]=(function(){return Module["asm"]["_Hacl_Ed25519_sign"].apply(null,arguments)});var _Hacl_Ed25519_verify=Module["_Hacl_Ed25519_verify"]=(function(){return Module["asm"]["_Hacl_Ed25519_verify"].apply(null,arguments)});var _Hacl_HMAC_SHA2_256_hmac=Module["_Hacl_HMAC_SHA2_256_hmac"]=(function(){return Module["asm"]["_Hacl_HMAC_SHA2_256_hmac"].apply(null,arguments)});var _Hacl_HMAC_SHA2_256_hmac_core=Module["_Hacl_HMAC_SHA2_256_hmac_core"]=(function(){return Module["asm"]["_Hacl_HMAC_SHA2_256_hmac_core"].apply(null,arguments)});var _Hacl_Policies_cmp_bytes=Module["_Hacl_Policies_cmp_bytes"]=(function(){return Module["asm"]["_Hacl_Policies_cmp_bytes"].apply(null,arguments)});var _Hacl_Policies_cmp_bytes_=Module["_Hacl_Policies_cmp_bytes_"]=(function(){return Module["asm"]["_Hacl_Policies_cmp_bytes_"].apply(null,arguments)});var _Hacl_Policies_declassify_u128=Module["_Hacl_Policies_declassify_u128"]=(function(){return Module["asm"]["_Hacl_Policies_declassify_u128"].apply(null,arguments)});var _Hacl_Policies_declassify_u32=Module["_Hacl_Policies_declassify_u32"]=(function(){return Module["asm"]["_Hacl_Policies_declassify_u32"].apply(null,arguments)});var _Hacl_Policies_declassify_u64=Module["_Hacl_Policies_declassify_u64"]=(function(){return Module["asm"]["_Hacl_Policies_declassify_u64"].apply(null,arguments)});var _Hacl_Policies_declassify_u8=Module["_Hacl_Policies_declassify_u8"]=(function(){return Module["asm"]["_Hacl_Policies_declassify_u8"].apply(null,arguments)});var _Hacl_Poly1305_32_crypto_onetimeauth=Module["_Hacl_Poly1305_32_crypto_onetimeauth"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_crypto_onetimeauth"].apply(null,arguments)});var _Hacl_Poly1305_32_finish=Module["_Hacl_Poly1305_32_finish"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_finish"].apply(null,arguments)});var _Hacl_Poly1305_32_init=Module["_Hacl_Poly1305_32_init"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_init"].apply(null,arguments)});var _Hacl_Poly1305_32_mk_state=Module["_Hacl_Poly1305_32_mk_state"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_mk_state"].apply(null,arguments)});var _Hacl_Poly1305_32_update=Module["_Hacl_Poly1305_32_update"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_update"].apply(null,arguments)});var _Hacl_Poly1305_32_update_block=Module["_Hacl_Poly1305_32_update_block"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_update_block"].apply(null,arguments)});var _Hacl_Poly1305_32_update_last=Module["_Hacl_Poly1305_32_update_last"]=(function(){return Module["asm"]["_Hacl_Poly1305_32_update_last"].apply(null,arguments)});var _Hacl_Poly1305_64_crypto_onetimeauth=Module["_Hacl_Poly1305_64_crypto_onetimeauth"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_crypto_onetimeauth"].apply(null,arguments)});var _Hacl_Poly1305_64_finish=Module["_Hacl_Poly1305_64_finish"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_finish"].apply(null,arguments)});var _Hacl_Poly1305_64_init=Module["_Hacl_Poly1305_64_init"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_init"].apply(null,arguments)});var _Hacl_Poly1305_64_mk_state=Module["_Hacl_Poly1305_64_mk_state"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_mk_state"].apply(null,arguments)});var _Hacl_Poly1305_64_update=Module["_Hacl_Poly1305_64_update"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_update"].apply(null,arguments)});var _Hacl_Poly1305_64_update_block=Module["_Hacl_Poly1305_64_update_block"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_update_block"].apply(null,arguments)});var _Hacl_Poly1305_64_update_last=Module["_Hacl_Poly1305_64_update_last"]=(function(){return Module["asm"]["_Hacl_Poly1305_64_update_last"].apply(null,arguments)});var _Hacl_SHA2_256_finish=Module["_Hacl_SHA2_256_finish"]=(function(){return Module["asm"]["_Hacl_SHA2_256_finish"].apply(null,arguments)});var _Hacl_SHA2_256_hash=Module["_Hacl_SHA2_256_hash"]=(function(){return Module["asm"]["_Hacl_SHA2_256_hash"].apply(null,arguments)});var _Hacl_SHA2_256_init=Module["_Hacl_SHA2_256_init"]=(function(){return Module["asm"]["_Hacl_SHA2_256_init"].apply(null,arguments)});var _Hacl_SHA2_256_update=Module["_Hacl_SHA2_256_update"]=(function(){return Module["asm"]["_Hacl_SHA2_256_update"].apply(null,arguments)});var _Hacl_SHA2_256_update_last=Module["_Hacl_SHA2_256_update_last"]=(function(){return Module["asm"]["_Hacl_SHA2_256_update_last"].apply(null,arguments)});var _Hacl_SHA2_256_update_multi=Module["_Hacl_SHA2_256_update_multi"]=(function(){return Module["asm"]["_Hacl_SHA2_256_update_multi"].apply(null,arguments)});var _Hacl_SHA2_384_finish=Module["_Hacl_SHA2_384_finish"]=(function(){return Module["asm"]["_Hacl_SHA2_384_finish"].apply(null,arguments)});var _Hacl_SHA2_384_hash=Module["_Hacl_SHA2_384_hash"]=(function(){return Module["asm"]["_Hacl_SHA2_384_hash"].apply(null,arguments)});var _Hacl_SHA2_384_init=Module["_Hacl_SHA2_384_init"]=(function(){return Module["asm"]["_Hacl_SHA2_384_init"].apply(null,arguments)});var _Hacl_SHA2_384_update=Module["_Hacl_SHA2_384_update"]=(function(){return Module["asm"]["_Hacl_SHA2_384_update"].apply(null,arguments)});var _Hacl_SHA2_384_update_last=Module["_Hacl_SHA2_384_update_last"]=(function(){return Module["asm"]["_Hacl_SHA2_384_update_last"].apply(null,arguments)});var _Hacl_SHA2_384_update_multi=Module["_Hacl_SHA2_384_update_multi"]=(function(){return Module["asm"]["_Hacl_SHA2_384_update_multi"].apply(null,arguments)});var _Hacl_SHA2_512_finish=Module["_Hacl_SHA2_512_finish"]=(function(){return Module["asm"]["_Hacl_SHA2_512_finish"].apply(null,arguments)});var _Hacl_SHA2_512_hash=Module["_Hacl_SHA2_512_hash"]=(function(){return Module["asm"]["_Hacl_SHA2_512_hash"].apply(null,arguments)});var _Hacl_SHA2_512_init=Module["_Hacl_SHA2_512_init"]=(function(){return Module["asm"]["_Hacl_SHA2_512_init"].apply(null,arguments)});var _Hacl_SHA2_512_update=Module["_Hacl_SHA2_512_update"]=(function(){return Module["asm"]["_Hacl_SHA2_512_update"].apply(null,arguments)});var _Hacl_SHA2_512_update_last=Module["_Hacl_SHA2_512_update_last"]=(function(){return Module["asm"]["_Hacl_SHA2_512_update_last"].apply(null,arguments)});var _Hacl_SHA2_512_update_multi=Module["_Hacl_SHA2_512_update_multi"]=(function(){return Module["asm"]["_Hacl_SHA2_512_update_multi"].apply(null,arguments)});var _Hacl_Salsa20_hsalsa20=Module["_Hacl_Salsa20_hsalsa20"]=(function(){return Module["asm"]["_Hacl_Salsa20_hsalsa20"].apply(null,arguments)});var _Hacl_Salsa20_salsa20=Module["_Hacl_Salsa20_salsa20"]=(function(){return Module["asm"]["_Hacl_Salsa20_salsa20"].apply(null,arguments)});var _NaCl_crypto_box_beforenm=Module["_NaCl_crypto_box_beforenm"]=(function(){return Module["asm"]["_NaCl_crypto_box_beforenm"].apply(null,arguments)});var _NaCl_crypto_box_detached_afternm=Module["_NaCl_crypto_box_detached_afternm"]=(function(){return Module["asm"]["_NaCl_crypto_box_detached_afternm"].apply(null,arguments)});var _NaCl_crypto_box_easy=Module["_NaCl_crypto_box_easy"]=(function(){return Module["asm"]["_NaCl_crypto_box_easy"].apply(null,arguments)});var _NaCl_crypto_box_easy_afternm=Module["_NaCl_crypto_box_easy_afternm"]=(function(){return Module["asm"]["_NaCl_crypto_box_easy_afternm"].apply(null,arguments)});var _NaCl_crypto_box_open_detached=Module["_NaCl_crypto_box_open_detached"]=(function(){return Module["asm"]["_NaCl_crypto_box_open_detached"].apply(null,arguments)});var _NaCl_crypto_box_open_detached_afternm=Module["_NaCl_crypto_box_open_detached_afternm"]=(function(){return Module["asm"]["_NaCl_crypto_box_open_detached_afternm"].apply(null,arguments)});var _NaCl_crypto_box_open_easy=Module["_NaCl_crypto_box_open_easy"]=(function(){return Module["asm"]["_NaCl_crypto_box_open_easy"].apply(null,arguments)});var _NaCl_crypto_box_open_easy_afternm=Module["_NaCl_crypto_box_open_easy_afternm"]=(function(){return Module["asm"]["_NaCl_crypto_box_open_easy_afternm"].apply(null,arguments)});var _NaCl_crypto_secretbox_detached=Module["_NaCl_crypto_secretbox_detached"]=(function(){return Module["asm"]["_NaCl_crypto_secretbox_detached"].apply(null,arguments)});var _NaCl_crypto_secretbox_easy=Module["_NaCl_crypto_secretbox_easy"]=(function(){return Module["asm"]["_NaCl_crypto_secretbox_easy"].apply(null,arguments)});var _NaCl_crypto_secretbox_open_detached=Module["_NaCl_crypto_secretbox_open_detached"]=(function(){return Module["asm"]["_NaCl_crypto_secretbox_open_detached"].apply(null,arguments)});var _NaCl_crypto_secretbox_open_easy=Module["_NaCl_crypto_secretbox_open_easy"]=(function(){return Module["asm"]["_NaCl_crypto_secretbox_open_easy"].apply(null,arguments)});var ___errno_location=Module["___errno_location"]=(function(){return Module["asm"]["___errno_location"].apply(null,arguments)});var _free=Module["_free"]=(function(){return Module["asm"]["_free"].apply(null,arguments)});var _malloc=Module["_malloc"]=(function(){return Module["asm"]["_malloc"].apply(null,arguments)});Module["asm"]=asm;Module["then"]=(function(func){if(Module["calledRun"]){func(Module)}else{var old=Module["onRuntimeInitialized"];Module["onRuntimeInitialized"]=(function(){if(old)old();func(Module)})}return Module});function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["exit"](status)}Module["quit"](status,new ExitStatus(status))}Module["exit"]=exit;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run()





  return HaclLoader;
};
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = HaclLoader;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return HaclLoader; });
else if (typeof exports === 'object')
  exports["HaclLoader"] = HaclLoader;
