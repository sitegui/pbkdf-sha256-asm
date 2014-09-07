#ifndef HMAC_H
#define HMAC_H

#include "util.h"
#include "sha.h"

typedef struct {
	sha hash_i, hash_o;
} hmac;

// Initilize the HMAC context
// It must be ended with hmac_end or freeded with hmac_free to not leak memory
hmac hmac_init(buffer key);

void hmac_free(hmac *context);

// Return a clone of the given context
hmac hmac_clone(hmac context);

void hmac_update(hmac *context, buffer message);

// End the hmac and write the result into tag
// tag must be an allocated buffer with exactly 32 bytes
// After this call, the context is freed and discarded
void hmac_end(hmac *context, buffer *tag);

// A simple interface for mac-ing a C string
// Return a pointer to a internal storage with the hex-encoded output (64+1 bytes)
char EMSCRIPTEN_KEEPALIVE *hmac_simple(char *key, char *message);

// A simple interface for mac-ing a hex-encoded C string
// Both key and message must be hex-encoded strings
// Return a pointer to a internal storage with the hex-encoded output (64+1 bytes)
char EMSCRIPTEN_KEEPALIVE *hmac_simple_hex(char *key, char *message);

#endif // HMAC_H
