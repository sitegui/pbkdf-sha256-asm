# PBKDF-SHA256 in asm.js

My first attempt to compile C to JavaScript :)

This is my own implementation of three related crypto algorithms:

* SHA-256, based on [FIPS 180-4](http://csrc.nist.gov/publications/fips/fips180-4/fips-180-4.pdf)
* HMAC with H=SHA256, based on [FIPS 198-1](http://csrc.nist.gov/publications/fips/fips198-1/FIPS-198-1_final.pdf)
* PBKDFv2 with H=SHA256, based on [NIST SP800-132](http://csrc.nist.gov/publications/nistpubs/800-132/nist-sp800-132.pdf)

**NOTE**: this is a toy project and should not be taken too serious, i.e. don't use this implementation in critical production code. There are much more robust crypto libs out there!

## Benchmark
A small benchmark comparing this implementation to [CryptoJS](https://code.google.com/p/crypto-js/), a crypto lib written directly in JS.

The time that it took to execute 5000 rounds of PBKDF over input `{message: 'password', salt: 'salt'}` was measured and is represented in the graph bellow in rounds per second. That is, what should be the value of the rounds parameter if one want the function to return in 1 second.

![Graph](https://raw.githubusercontent.com/sitegui/pbkdf-sha256-asm/master/asm.png)

Ok, I may be comparing apples to oranges, since CryptoJS is a much broader lib and is not limited to only SHA256. But even though, the result is pretty clear: JS almost as fast as C!

Just for the record, this was my CryptoJS bench code:
```javascript
var pbkdf = CryptoJS.algo.PBKDF2.create({
		keySize: 256 / 32,
		hasher: CryptoJS.algo.SHA256,
		iterations: 5000
	}),
	password = CryptoJS.enc.Utf8.parse('password'),
	salt = CryptoJS.enc.Utf8.parse('salt'),
	then = Date.now(),
	key = pbkdf.compute(password, salt).toString(),
	now = Date.now(),
	dt = now - then
if (key === '8fc2bcffbb4b1ac9b9de03588d390f3d9bf336c2c4422c90c158cc714225f629') {
	console.log('Took ' + dt + ' ms, ' + Math.round(5e6 / dt) + ' rounds/s')
}
```

## Compiling
First you need to install [emscripten](https://github.com/kripken/emscripten/wiki). When done, just run one of the commands bellow in the repository path:

### SHA256
	emcc c/sha.c c/util.c c/memory.c -o js/sha.js
	emcc c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/sha_min.js

### HMAC-SHA256
These already include SHA256
	emcc c/hmac.c c/sha.c c/util.c c/memory.c -o js/hmac.js
	emcc c/hmac.c c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/hmac_min.js

### PBKDF2-SHA256
These already include both HMAC and SHA256
	emcc c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -o js/pbkdf.js
	emcc c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o js/pbkdf_min.js

### Tests
	emcc c/main.c c/test/hmac.c c/test/pbkdf.c c/test/sha.c c/test/util.c c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -o test.html
	emcc c/main.c c/test/hmac.c c/test/pbkdf.c c/test/sha.c c/test/util.c c/pbkdf.c c/hmac.c c/sha.c c/util.c c/memory.c -DNDEBUG -O2 -o test_min.html
And then just open the .html page. It should log some 'OK!' messages in the console and also the benchmark result.
The `NDEBUG` flag turns off memory checks that I've used to make sure all allocated memory was freed correctly.
