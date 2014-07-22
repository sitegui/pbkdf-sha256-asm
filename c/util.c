#include <stdio.h>
#include "util.h"

// Convert a half byte to a char
#define hb2char(hb) ((hb)<10 ? '0'+(hb) : 'a'+((hb)-10))

void encodeHex(const word data, char out[9]) {
	int j = 0;
	for (int i = 0; i < 4; i++) {
		byte b = (data >> (24 - i * 8)) & 0xff;
		out[j++] = hb2char(b >> 4);
		out[j++] = hb2char(b & 0x0f);
	}
	out[j] = '\0';
}

void printBlock(const word *block, word length) {
	char hex[9];
	for (int i=0; i<length; i++) {
		encodeHex(block[i], hex);
		printf("\t%s\n", hex);
	}
	puts("");
}
