#ifndef PBKDF_H
#define PBKDF_H

#include "util.h"

// Generate the i-th output block from the PBKDF (i=0 => first block)
// The result will be writen in key, that must be an allocated 32-byte buffer
void pbkdf(buffer password, buffer salt, word block_index, int rounds, buffer *key);

// A simple interface for pbkdf
// Return a pointer to a internal storage with the hex-encoded output (64+1 bytes)
char EMSCRIPTEN_KEEPALIVE *pbkdf_simple(char *password, char *salt, word block_index, int rounds);

#endif // PBKDF_H
