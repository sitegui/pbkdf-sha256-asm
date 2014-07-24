#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include "memory.h"

static void **pointers = NULL; // store allocated pointers
static int pointers_length = 0; // number of used positions in pointers
static int pointers_capacity = 0; // allocated space for pointers

// Push a pointer to the array
static void add_ptr(void *ptr) {
	// Try to save on an empty slot
	for (int i=0; i<pointers_length; i++) {
		if (pointers[i] == NULL) {
			pointers[i] = ptr;
			return;
		}
	}
	
	if (pointers_capacity == pointers_length) {
		// Need more space
		pointers_capacity = pointers_capacity ? 2*pointers_capacity : 1;
		int used = 0;
		for (int i=0; i<pointers_length; i++) {
			if (pointers[i]) {
				used++;
			}
		}
		printf("[memory] increasing capacity to %d pointers, %d used\n", pointers_capacity, used);
		pointers = realloc(pointers, pointers_capacity*sizeof(void*));
	}
	pointers[pointers_length++] = ptr;
}

// Remove a given pointer and add another
// Kill the program if not found
static void change_ptr(void *ptr, void *new_ptr) {
	for (int i=0; i<pointers_length; i++) {
		if (pointers[i] == ptr) {
			pointers[i] = new_ptr;
			return;
		}
	}
	assert(0);
}

// Remove a given pointer from the array
// Kill the program if not found
static void remove_ptr(void *ptr) {
	change_ptr(ptr, NULL);
}

// Assert a pointer is in the array
static void assert_ptr_exists(void *ptr) {
	for (int i=0; i<pointers_length; i++) {
		if (pointers[i] == ptr) {
			return;
		}
	}
	assert(0);
}

void *_memory_alloc(size_t size) {
	void *ptr = malloc(size);
	assert(ptr != NULL);
	add_ptr(ptr);
	return ptr;
}

void *_memory_calloc(size_t num, size_t size) {
	void *ptr = calloc(num, size);
	assert(ptr != NULL);
	add_ptr(ptr);
	return ptr;
}

void *_memory_realloc(void *ptr, size_t size) {
	if (ptr == NULL) {
		return memory_alloc(size);
	}
	
	assert_ptr_exists(ptr);
	void *new_ptr = realloc(ptr, size);
	assert(new_ptr != NULL);
	if (new_ptr != ptr) {
		change_ptr(ptr, new_ptr);
	}
	return new_ptr;
}

void _memory_free(void *ptr) {
	remove_ptr(ptr);
	free(ptr);
}

void _memory_assert_empty() {
	for (int i=0; i<pointers_length; i++) {
		assert(pointers[i] == NULL);
	}
}
