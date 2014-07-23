#ifndef PBKDF_H
#define PBKDF_H

#include "util.h"

// Generate the i-th output block from the PBKDF (i=0 => first block)
// The result will be writen in key, that must be an allocated 32-byte buffer
void pbkdf(buffer password, buffer salt, word block_index, int rounds, buffer *key);

#endif // PBKDF_H
