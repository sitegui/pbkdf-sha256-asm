#ifndef UTIL_H
#define UTIL_H

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE __attribute__((used))
#endif

// For simplicity, we assume a char has 8 bits and long int has 32

typedef unsigned long int word; // 4 bytes
typedef unsigned char byte;

void encodeHex(const word data, char out[9]);

void printBlock(const word *block, word length);

#endif // UTIL_H

