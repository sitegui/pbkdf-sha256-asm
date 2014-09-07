#include <assert.h>
#include "pbkdf.h"
#include "hmac.h"

static void _simple(buffer password, buffer salt, word block_index, int rounds, char *result);

void pbkdf(buffer password, buffer salt, word block_index, int rounds, buffer *key) {
	assert(key->length == 32);

	hmac base_mac = hmac_init(password), mac;
	buffer temp = buffer_calloc(32);

	// First iteration
	// U1 = HMAC(P, S || (i+1))
	mac = hmac_clone(base_mac);
	hmac_update(&mac, salt);
	buffer index = buffer_calloc(4); // 1 word
	index.words[0] = block_index+1;
	hmac_update(&mac, index);
	buffer_free(&index);
	hmac_end(&mac, key);
	buffer_copy(&temp, *key);

	// Next iterations
	// U_(n+1) = U_n ^ HMAC(P, U_n)
	for (int i=1; i<rounds; i++) {
		mac = hmac_clone(base_mac);
		hmac_update(&mac, temp);
		hmac_end(&mac, &temp);
		buffer_xor(key, temp);
	}

	buffer_free(&temp);
	hmac_free(&base_mac);
}

char EMSCRIPTEN_KEEPALIVE *pbkdf_simple(char *password, char *salt, word block_index, int rounds) {
	static char result[65];
	buffer password_buffer = buffer_create_from_str(password),
		salt_buffer = buffer_create_from_str(salt);

	_simple(password_buffer, salt_buffer, block_index, rounds, result);
	buffer_free(&password_buffer);
	buffer_free(&salt_buffer);

	return result;
}

char EMSCRIPTEN_KEEPALIVE *pbkdf_simple_hex(char *password, char *salt, word block_index, int rounds) {
	static char result[65];
	buffer password_buffer = buffer_create_from_hex(password),
		salt_buffer = buffer_create_from_hex(salt);

	_simple(password_buffer, salt_buffer, block_index, rounds, result);
	buffer_free(&password_buffer);
	buffer_free(&salt_buffer);

	return result;
}

// result = ENCODE_HEX(PBKDF(password, salt, index, rounds))
static void _simple(buffer password, buffer salt, word block_index, int rounds, char *result) {
	buffer result_buffer = buffer_calloc(32);
	pbkdf(password, salt, block_index, rounds, &result_buffer);
	buffer_encode(result_buffer, result);
	buffer_free(&result_buffer);
}
