#ifndef SHA_H
#define SHA_H

#include "util.h"

typedef struct {
	word state[8]; // internal state (sha result = final state)
	word blocks_done; // number of blocks already processed
	buffer partial_data; // data waiting to be hashed
} sha;

// Create the sha context (always call sha_end or sha_free to free memory)
sha sha_init();

void sha_free(sha *context);

// Return a clone of the given context
sha sha_clone(sha context);

// Process more data
void sha_update(sha *context, buffer message);

// End the hash and write the result into digest
// digest must be an allocated buffer with exactly 32 bytes
// After this call, the context is freed and can't be reused
void sha_end(sha *context, buffer *digest);

#endif // SHA_H
