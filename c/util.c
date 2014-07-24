#include <stdio.h>
#include <string.h>
#include <assert.h>
#include "util.h"
#include "memory.h"

// Convert a half byte to a char
#define hb2char(hb) ((hb)<10 ? '0'+(hb) : 'a'+((hb)-10))
#define char2hb(c) ((c)<'a' ? (c)-'0' : (c)-'a'+10)

buffer buffer_calloc(word length) {
	buffer b;
	b.length = length;
	b.w_length = length%4 ? (length>>2)+1 : length>>2;
	b.words = length ? memory_calloc(b.w_length, sizeof(word)) : NULL;
	return b;
}

void buffer_realloc(buffer *b, word length) {
	int prev_w_length = b->w_length;
	b->length = length;
	b->w_length = length%4 ? (length>>2)+1 : length>>2;
	b->words = memory_realloc(b->words, b->w_length*sizeof(word));
	
	// Zero new memory
	for (int i=prev_w_length; i<b->w_length; i++) {
		b->words[i] = 0UL;
	}
	
	// Zero previous memory
	for (word i=length; i<4*b->w_length; i++) {
		word mask = 0xff << (24 - 8*(i%4));
		b->words[i>>2] &= ~mask;
	}
}

void buffer_free(buffer *b) {
	memory_free(b->words);
	b->length = 0;
	b->w_length = 0;
	b->words = NULL;
}

buffer buffer_create(byte *data, word length) {
	buffer b = buffer_calloc(length);
	
	for (int i=0; i<length; i++) {
		b.words[i>>2] |= data[i] << (24 - 8*(i%4));
	}
	
	return b;
}

buffer buffer_create_from_str(char *str) {
	return buffer_create((byte*)str, (word)strlen(str));
}

buffer buffer_create_from_hex(char *str) {
	byte B, hh, lh;
	int length = strlen(str);
	assert(length%2 == 0);
	length >>= 1;
	buffer b = buffer_calloc(length);
	
	for (int i=0; i<length; i++) {
		hh = char2hb(str[2*i]);
		lh = char2hb(str[2*i+1]);
		assert(hh >= 0 && hh < 16);
		assert(lh >= 0 && lh < 16);
		B = (hh << 4) + lh;
		b.words[i>>2] |= B << (24 - 8*(i%4));
	}
	
	return b;
}

buffer buffer_clone(buffer b) {
	buffer r;
	r.length = b.length;
	r.w_length = b.w_length;
	r.words = r.length ? memory_alloc(r.w_length*sizeof(word)) : NULL;
	for (int i=0; i<r.w_length; i++) {
		r.words[i] = b.words[i];
	}
	
	return r;
}

void buffer_copy(buffer *dest, buffer origin) {
	assert(dest->length == origin.length);
	for (int i=0; i<origin.w_length; i++) {
		dest->words[i] = origin.words[i];
	}
}

void buffer_xor(buffer *dest, buffer origin) {
	assert(dest->length == origin.length);
	for (int i=0; i<origin.w_length; i++) {
		dest->words[i] ^= origin.words[i];
	}
}

void buffer_push(buffer *b, buffer data) {
	word prev_length = b->length;
	int prev_w_length = b->w_length;
	
	buffer_realloc(b, b->length+data.length);
	
	// Copy new data
	if (prev_length % 4 == 0) {
		// Aligned: copy word by word
		memcpy(b->words+prev_w_length, data.words, 4*data.w_length);
	} else {
		// Slow case: copy byte by byte
		for (int i=0, j=prev_length; i<data.length; i++, j++) {
			word w = data.words[i>>2];
			byte B = (w >> (24 - 8*(i%4))) & 0xff;
			b->words[j>>2] |= B << (24 - 8*(j%4));
		}
	}
}

void buffer_slice(buffer *b, word length) {
	assert(length <= b->length);
	assert(length%4 == 0);
	
	if (length == b->length) {
		buffer_free(b);
		return;
	}
	
	memmove(b->words, b->words+(length>>2), 4*b->w_length-length);
	b->length -= length;
	b->w_length -= length>>2;
}

void buffer_encode(buffer b, char *hex) {
	int i;
	for (i=0; i<b.length; i++) {
		word w = b.words[i>>2];
		byte B = (w >> (24 - 8*(i%4))) & 0xff;
		hex[2*i] = hb2char(B >> 4);
		hex[2*i+1] = hb2char(B & 0x0f);
	}
	hex[2*i] = '\0';
}

void buffer_print(buffer b) {
	printf("Buffer with %d bytes (%d words):\n", b.length, b.w_length);
	int i;
	for (i=0; i<b.length; i++) {
		if (i%4 == 0) {
			putchar(' ');
		}
		
		word w = b.words[i>>2];
		byte B = (w >> (24 - 8*(i&0x3))) & 0xff;
		putchar(hb2char(B >> 4));
		putchar(hb2char(B & 0x0f));
	}
	putchar('\n');
	putchar('\n');
}

int buffer_is_equal(buffer a, buffer b) {
	if (a.length != b.length) {
		return 0;
	}
	for (int i=0; i<a.w_length; i++) {
		if (a.words[i] != b.words[i]) {
			return 0;
		}
	}
	return 1;
}
