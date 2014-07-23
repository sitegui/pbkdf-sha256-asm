#include "hmac.h"

hmac hmac_init(buffer key) {
	hmac mac;
	buffer real_key; // always 64 bytes
	
	// Prepare the key
	if (key.length <= 64) {
		// Pad with zeroes
		real_key = buffer_clone(key);
		if (key.length < 64) {
			buffer_realloc(&real_key, 64);
		}
	} else {
		// Feed to the hash
		real_key = buffer_calloc(32);
		sha hash = sha_init();
		sha_update(&hash, key);
		sha_end(&hash, &real_key);
		buffer_realloc(&real_key, 64);
	}
	
	// Create the SHA context for the inner hash
	for (int i=0; i<16; i++) {
		real_key.words[i] ^= 0x36363636UL; // ipad
	}
	mac.hash_i = sha_init();
	sha_update(&mac.hash_i, real_key);
	
	// Create the SHA context for the outer hash
	for (int i=0; i<16; i++) {
		real_key.words[i] ^= 0x6a6a6a6aUL; // opad^ipad
	}
	mac.hash_o = sha_init();
	sha_update(&mac.hash_o, real_key);
	
	buffer_free(&real_key);
	return mac;
}

void hmac_free(hmac *context) {
	sha_free(&context->hash_i);
	sha_free(&context->hash_o);
}

hmac hmac_clone(hmac context) {
	hmac mac;
	
	mac.hash_i = sha_clone(context.hash_i);
	mac.hash_o = sha_clone(context.hash_o);
	
	return mac;
}

void hmac_update(hmac *context, buffer message) {
	// Simply update the inner hash
	sha_update(&context->hash_i, message);
}

void hmac_end(hmac *context, buffer *tag) {
	// End the inner hash
	sha_end(&context->hash_i, tag);
	
	// End the outer hash
	sha_update(&context->hash_o, *tag);
	sha_end(&context->hash_o, tag);
}
