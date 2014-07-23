#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "util.h"

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

int main() {
    test_buffer_hex();
    test_buffer_push_aligned();
    test_buffer_push();
    return 0;
}
