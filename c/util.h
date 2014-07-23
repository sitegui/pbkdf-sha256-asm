#ifndef UTIL_H
#define UTIL_H

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE __attribute__((used))
#endif

// For simplicity, we assume a char has 8 bits, long int has 32 and is big-endian

typedef unsigned long int word; // 4 bytes
typedef unsigned char byte;

typedef struct {
	word *words;
	word length; // length in bytes
	int w_length; // length in words
} buffer;

// Alloc a new zeroed buffer with a given size in bytes
buffer buffer_calloc(word length);

// Alter the size of the buffer (new memory will be zeroed)
void buffer_realloc(buffer *b, word length);

// Free an allocated buffer
void buffer_free(buffer *b);

// Alloc and init a buffer
buffer buffer_create(byte *data, word length);
buffer buffer_create_from_str(char *str);
buffer buffer_create_from_hex(char *str);

// Push more data to the end of a given buffer
void buffer_push(buffer *b, buffer data);

// Remove some words from the start of the buffer
// length is the cut size in bytes and MUST be a multiple of 4
void buffer_slice(buffer *b, word length);

// Write the buffer content into the given target
// The target must have enough space (2*b.length+1)
void buffer_encode(buffer b, char *hex);

void buffer_print(buffer b);

int buffer_is_equal(buffer a, buffer b);

#endif // UTIL_H

