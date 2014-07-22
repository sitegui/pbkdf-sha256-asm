#include <stdio.h>
#include "sha256.h"

void checkHash(const byte *message, word length, const char digest[65]) {
	char temp[65];
	sha256(message, length, temp);
	for (int i=0; i<64; i++) {
		if (digest[i] != temp[i]) {
			printf("Fail with length %lu\n", length);
			return;
		}
	}
	puts("OK!");
}

int main() {
    checkHash((byte*)"", 0, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    return 0;
}
