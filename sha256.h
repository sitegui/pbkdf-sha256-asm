#ifndef SHA256_H
#define SHA256_H

// For simplicity, we assume a char has 8 bits and long int has 32

typedef unsigned long int word; // 4 bytes
typedef unsigned char byte;

void sha256(const byte *message, word length, char *digest);

#endif // SHA256_H
