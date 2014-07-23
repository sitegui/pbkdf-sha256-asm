#include "test.h"

int main() {
    test_buffer_hex();
    test_buffer_push_aligned();
    test_buffer_push();
    test_buffer_realloc();
    test_buffer_slice();
    test_sha();
    test_hmac();
    test_pbkdf();
    return 0;
}
