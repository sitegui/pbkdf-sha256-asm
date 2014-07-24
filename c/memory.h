#ifndef MEMORY_H
#define MEMORY_H

#include <stdlib.h>

#ifndef NDEBUG

#define memory_alloc(s) _memory_alloc((s))
#define memory_calloc(n, s) _memory_calloc((n), (s))
#define memory_realloc(p, s) _memory_realloc((p), (s))
#define memory_free(p) _memory_free((p))
#define memory_assert_empty() _memory_assert_empty()

#else

#define memory_alloc(s) malloc((s))
#define memory_calloc(n, s) calloc((n), (s))
#define memory_realloc(p, s) realloc((p), (s))
#define memory_free(p) free((p))
#define memory_assert_empty() ((void)0)

#endif

// These functions behave like the ones from stdlib
// Except that they include memory checks, ie
// freeing a pointer twice or not freeing it will be caught
void *_memory_alloc(size_t size);
void *_memory_calloc(size_t num, size_t size);
void *_memory_realloc(void *ptr, size_t size);
void _memory_free(void *ptr);

// Check whether all allocated memory was freed
void _memory_assert_empty();

#endif // MEMORY_H
