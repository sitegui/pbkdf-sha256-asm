#ifndef SHA_H
#define SHA_H

#include "util.h"

typedef struct {
	word state[8]; // internal state (sha result = final state)
	word blocks_done; // number of blocks already processed
	buffer partial_data; // data waiting to be hashed
} sha;

// Create the sha context
sha sha_alloc();

void sha_free(sha *context);

// Process more data
void sha_update(sha *context, buffer message);

// End the hash and write the result into digest
// digest must be an allocated buffer with exactly 32 bytes
// After this call, the context should be freed and discarded
void sha_end(sha *context, buffer *digest);

#endif // SHA_H
