#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "util.h"
#include "test/sha.h"

void test_buffer_hex() {
	char hex[] = "0123456789abcdef0123456789abcdef";
    for (int i=32; i>=0; i-=2) {
		hex[i] = '\0';
		buffer b = buffer_create_from_hex(hex);
		char encoded[2*b.length+1];
		buffer_encode(b, encoded);
		assert(strcmp(encoded, hex) == 0);
		buffer_free(&b);
	}
	puts("buffer_hex: OK!");
}

void test_buffer_push_aligned() {
	buffer a = buffer_create_from_str("abcd"),
		b = buffer_create_from_str("asdqpiwe"),
		c = buffer_create_from_str("abcdasdqpiwe");
		
	buffer_push(&a, b);
	assert(buffer_is_equal(a, c));
	
	buffer_free(&a);
	buffer_free(&b);
	buffer_free(&c);
	puts("buffer_push_aligned: OK!");
}

void test_buffer_push() {
	buffer a = buffer_create_from_str("abc"),
		b = buffer_create_from_str("sdqpwe"),
		c = buffer_create_from_str("abcsdqpwe");
		
	buffer_push(&a, b);
	assert(buffer_is_equal(a, c));
	
	buffer_free(&a);
	buffer_free(&b);
	buffer_free(&c);
	puts("buffer_push: OK!");
}

void test_buffer_realloc() {
	char hex[11];
	buffer b = buffer_calloc(3);
	
	buffer_realloc(&b, 1);
	buffer_encode(b, hex);
	assert(strcmp(hex, "00") == 0);
	
	buffer_realloc(&b, 5);
	buffer_encode(b, hex);
	assert(strcmp(hex, "0000000000") == 0);
	
	buffer_free(&b);
	puts("buffer_push: OK!");
}

void test_buffer_slice() {
	buffer b = buffer_create((byte*)"eiujeaanadnaojdqz", 17),
		b2 = buffer_create((byte*)"eaanadnaojdqz", 13);
	
	buffer_slice(&b, 4);
	assert(buffer_is_equal(b, b2));
	
	buffer_free(&b);
	buffer_free(&b2);
	puts("buffer_slice: OK!");
}

int main() {
    test_buffer_hex();
    test_buffer_push_aligned();
    test_buffer_push();
    test_buffer_realloc();
    test_buffer_slice();
    test_sha();
    return 0;
}
