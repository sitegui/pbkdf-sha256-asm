#ifndef SHA256_H
#define SHA256_H

#include "util.h"

void sha256(const byte *message, word length, char *digest);

#endif // SHA256_H
