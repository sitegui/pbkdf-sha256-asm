#ifndef HMAC_H
#define HMAC_H

#include "util.h"
#include "sha.h"

typedef struct {
	sha hash_i, hash_o;
} hmac;

hmac hmac_init(buffer key);

void hmac_update(hmac *context, buffer message);

// End the hmac and write the result into tag
// tag must be an allocated buffer with exactly 32 bytes
// After this call, the context is freed and discarded
void hmac_end(hmac *context, buffer *tag);

#endif // HMAC_H
