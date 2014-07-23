#include <assert.h>
#include "sha.h"

#define S(n, x) ((x)<<(32-(n)) | (x)>>(n))

void sha_process_block(sha *context, word *block);

static const word H0[8] = {
	0x6a09e667UL,
	0xbb67ae85UL,
	0x3c6ef372UL,
	0xa54ff53aUL,
	0x510e527fUL,
	0x9b05688cUL,
	0x1f83d9abUL,
	0x5be0cd19UL
};

static const word K[64] = {
	0x428a2f98UL, 0x71374491UL, 0xb5c0fbcfUL, 0xe9b5dba5UL,
	0x3956c25bUL, 0x59f111f1UL, 0x923f82a4UL, 0xab1c5ed5UL,
	0xd807aa98UL, 0x12835b01UL, 0x243185beUL, 0x550c7dc3UL,
	0x72be5d74UL, 0x80deb1feUL, 0x9bdc06a7UL, 0xc19bf174UL,
	0xe49b69c1UL, 0xefbe4786UL, 0x0fc19dc6UL, 0x240ca1ccUL,
	0x2de92c6fUL, 0x4a7484aaUL, 0x5cb0a9dcUL, 0x76f988daUL,
	0x983e5152UL, 0xa831c66dUL, 0xb00327c8UL, 0xbf597fc7UL,
	0xc6e00bf3UL, 0xd5a79147UL, 0x06ca6351UL, 0x14292967UL,
	0x27b70a85UL, 0x2e1b2138UL, 0x4d2c6dfcUL, 0x53380d13UL,
	0x650a7354UL, 0x766a0abbUL, 0x81c2c92eUL, 0x92722c85UL,
	0xa2bfe8a1UL, 0xa81a664bUL, 0xc24b8b70UL, 0xc76c51a3UL,
	0xd192e819UL, 0xd6990624UL, 0xf40e3585UL, 0x106aa070UL,
	0x19a4c116UL, 0x1e376c08UL, 0x2748774cUL, 0x34b0bcb5UL,
	0x391c0cb3UL, 0x4ed8aa4aUL, 0x5b9cca4fUL, 0x682e6ff3UL,
	0x748f82eeUL, 0x78a5636fUL, 0x84c87814UL, 0x8cc70208UL,
	0x90befffaUL, 0xa4506cebUL, 0xbef9a3f7UL, 0xc67178f2UL
};

sha sha_init() {
	sha context;
	for (int i=0; i<8; i++) {
		context.state[i] = H0[i];
	}
	context.blocks_done = 0;
	context.partial_data = buffer_calloc(0);
	
	return context;
}

void sha_update(sha *context, buffer message) {
	buffer_push(&context->partial_data, message);
	word length = context->partial_data.length;
	
	int offset = 0;
	for (offset=0; offset+64<=length; offset+=64) {
		sha_process_block(context, context->partial_data.words+offset);
	}
	
	buffer_slice(&context->partial_data, offset);
}

void sha_end(sha *context, buffer *digest) {
	// Prepare the pad
	word pad_length = (context->partial_data.length>55 ? 128 : 64)-context->partial_data.length;
	buffer pad = buffer_calloc(pad_length);
	pad.words[0] = 0x80000000UL;
	word total_length = 8*(64*context->blocks_done + context->partial_data.length);
	
	buffer_push(&context->partial_data, pad);
	buffer_free(&pad);
	context->partial_data.words[context->partial_data.w_length-1] = total_length;
	
	// Process final blocks (either 1 or 2)
	sha_process_block(context, context->partial_data.words);
	if (context->partial_data.length == 128) {
		sha_process_block(context, context->partial_data.words+16);
	}
	
	// Write the final value
	assert(digest->length == 32);
	for (int i=0; i<8; i++) {
		digest->words[i] = context->state[i];
	}
	
	// Free the context
	buffer_free(&context->partial_data);
}

// Process a 512-bit message block (16 words)
void sha_process_block(sha *context, word *block) {
	word *H = context->state;
	word a = H[0], b = H[1],
		c = H[2], d = H[3],
		e = H[4], f = H[5],
		g = H[6], h = H[7];
	
	word W[64];
	
	for (int i=0; i<64; i++) {
		word Ch = (e & f)^((~e) & g);
		word Maj = (a & b)^(a & c)^(b & c);
		word sigma0 = S(2, a)^S(13, a)^S(22, a);
		word sigma1 = S(6, e)^S(11, e)^S(25, e);
		
		if (i < 16) {
			W[i] = block[i];
		} else {
			word x0 = W[i-15], x1 = W[i-2];
			word gamma0 = S(7, x0)^S(18, x0)^(x0>>3);
			word gamma1 = S(17, x1)^S(19, x1)^(x1>>10);
			W[i] = gamma1+W[i-7]+gamma0+W[i-16];
		}
		
		word T1 = h+sigma1+Ch+K[i]+W[i];
		word T2 = sigma0+Maj;
		
		h = g;
		g = f;
		f = e;
		e = d+T1;
		d = c;
		c = b;
		b = a;
		a = T1+T2;
	}
	
	H[0] += a; H[1] += b;
	H[2] += c; H[3] += d;
	H[4] += e; H[5] += f;
	H[6] += g; H[7] += h;
	
	context->blocks_done++;
}
