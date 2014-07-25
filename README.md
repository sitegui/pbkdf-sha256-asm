# PBKDF-SHA256 in asm.js

My first attempt to compile C to JavaScript :)

This is a work in progress, the C implementation is done and tested.

## Benchmark
![Graph](https://raw.githubusercontent.com/sitegui/pbkdf-sha256-asm/master/asm.png)

## Compiling
First you need to install [emscripten](https://github.com/kripken/emscripten/wiki). When done, just run one of the commands bellow in the repository path:

### SHA256
	emcc c/sha.c c/util.c c/memory.c -o js/sha.js
	emcc c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/sha_min.js

### HMAC-SHA256
	emcc c/hmac.c c/sha.c c/util.c c/memory.c -o js/hmac.js
	emcc c/hmac.c c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/hmac_min.js

### PBKDF2-SHA256
	emcc c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -o js/pbkdf.js
	emcc c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/pbkdf_min.js
