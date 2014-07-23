#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "../test.h"
#include "../pbkdf.h"

static void check_pbkdf(byte *password, int pass_length, byte *salt, int salt_length, int rounds, char *goal) {
	buffer password_buffer = buffer_create(password, pass_length),
		salt_buffer = buffer_create(salt, salt_length),
		goal_buffer = buffer_create_from_hex(goal),
		key = buffer_calloc(32),
		final_key = buffer_calloc(0);
	
	for (int i=0; i<goal_buffer.length; i+=32) {
		pbkdf(password_buffer, salt_buffer, i>>5, rounds, &key);
		if (goal_buffer.length-i < 32) {
			buffer_realloc(&key, goal_buffer.length-i);
		}
		buffer_push(&final_key, key);
	}
	assert(buffer_is_equal(final_key, goal_buffer));
	
	buffer_free(&password_buffer);
	buffer_free(&salt_buffer);
	buffer_free(&goal_buffer);
	buffer_free(&key);
	buffer_free(&final_key);
}

static void check_pbkdf_str(char *password, char *salt, int rounds, char *goal) {
	check_pbkdf((byte*)password, strlen(password), (byte*)salt, strlen(salt), rounds, goal);
}

void test_pbkdf() {
	check_pbkdf_str("password", "salt", 1, "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b");
	check_pbkdf_str("password", "salt", 2, "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43");
	check_pbkdf_str("password", "salt", 4096, "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a");
	check_pbkdf_str("password", "salt", 16777216, "cf81c66fe8cfc04d1f31ecb65dab4089f7f179e89b3b0bcb17ad10e3ac6eba46");
	check_pbkdf_str("passwordPASSWORDpassword", "saltSALTsaltSALTsaltSALTsaltSALTsalt", 4096, "348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9");
	check_pbkdf((byte*)"pass\0word", 9, (byte*)"sa\0lt", 5, 4096, "89b69d0516f829893c696226650a8687");
	puts("pbkdf: OK!");
}
