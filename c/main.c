#include "test.h"
#include "memory.h"

int main() {	
    test_buffer_hex();
    memory_assert_empty();
    
    test_buffer_push_aligned();
    memory_assert_empty();
    
    test_buffer_push();
    memory_assert_empty();
    
    test_buffer_realloc();
    memory_assert_empty();
    
    test_buffer_slice();
    memory_assert_empty();
    
    test_sha();
    memory_assert_empty();
    
    test_hmac();
    memory_assert_empty();
    
    test_pbkdf();
    memory_assert_empty();
    
    return 0;
}
