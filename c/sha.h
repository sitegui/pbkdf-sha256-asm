#ifndef SHA_H
#define SHA_H

#include "util.h"

typedef struct {
	word state[8]; // internal state
	word blocks; // number of blocks already processed
	buffer data; // data waiting to be hashed
} sha;

sha sha_init();

void sha_update(sha *context, buffer message);

buffer sha_end(sha *context);

#endif // SHA_H
