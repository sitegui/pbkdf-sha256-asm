#include "pbkdf.h"
#include "hmac.h"

/*void pbkdf_sha256(buffer password, buffer salt, word blockIndex, int rounds, digest out) {
	hmac_sha256_context hmac;
	buffer index = buffer_create_from_word(blockIndex+1);
	digest block;
	
	hmac_sha256_init(hmac, password);
	
	// First iteration
	// temp = block = HMAC(key, salt || blockIndex)
	hmac_sha256_update(hmac, salt);
	hmac_sha256_update(hmac, index);
	hmac_sha256_end(hmac, block);
	
	// Iterate:
	// temp = HMAC(key, temp)
	// block ^= temp
	for (int i=1; i<rounds; i++) {
		hmac_sha256_update(hmac, block);
	}
	
	/ *
	var block = hmac.update(salt).finalize(WordArray.create([blockIndex + 1]))
	hmac.reset()

	
	var intermediate = block
	for (i = 1; i < 1000; i++) {
		intermediate = hmac.finalize(intermediate)
		hmac.reset()

		for (j = 0; j < block.words.length; j++) {
			block.words[j] ^= intermediate.words[j]
		}
	}

	return block
}*/
