#ifndef HMAC_H
#define HMAC_H

#include "util.h"
#include "sha.h"

typedef struct {
	sha sha_ct0, sha_ct1;
} hmac;

hmac hmac_init(buffer key);

void hmac_update(hmac *context, buffer message);

buffer hmac_end(hmac *context);

#endif // HMAC_H
