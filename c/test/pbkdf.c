#include <assert.h>
#include <stdio.h>
#include "../test.h"
#include "../pbkdf.h"

void test_pbkdf() {
	buffer password = buffer_create_from_str("password"),
		salt = buffer_create_from_str("salt"),
		key = buffer_calloc(32);
	
	pbkdf(password, salt, 0, 3, &key);
	buffer_print(key);
	
	buffer_free(&password);
	buffer_free(&salt);
	buffer_free(&key);
	puts("pbkdf: OK!");
}
