#include <string.h>
#include "hmac.h"

/*static const word i_pad[8] = {
	0x5c5c5c5cUL, 0x5c5c5c5cUL, 0x5c5c5c5cUL, 0x5c5c5c5cUL,
	0x5c5c5c5cUL, 0x5c5c5c5cUL, 0x5c5c5c5cUL, 0x5c5c5c5cUL
};

static const word o_pad[8] = {
	0x36363636UL, 0x36363636UL, 0x36363636UL, 0x36363636UL,
	0x36363636UL, 0x36363636UL, 0x36363636UL, 0x36363636UL
};

void EMSCRIPTEN_KEEPALIVE hmac_sha256_raw(const byte *key, word k_length, const byte *message, word m_length, word tag[8]) {
	word digest[8];
	
	
	
}

void EMSCRIPTEN_KEEPALIVE hmac_sha256(const char *key, const char *message, char digest[65]) {
	word digest_raw[8];
	hmac_sha256_raw((byte*)key, strlen(key), (byte*)message, strlen(message), digest_raw);
	
	for (int i=0; i<8; i++) {
		encodeHex(digest_raw[i], digest+8*i);
	}
}*/
