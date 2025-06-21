fn main(array1: [Field; 3], array2: pub [Field; 3]) {
    for i in 0..3 {
        assert(array1[i] == array2[i]);
    }
}

#[test]
fn test_main() {
    main([1, 2, 3], [1, 2, 3]);
    
    // This should pass - identical arrays
    main([20, 5, 92], [20, 5, 92]);
}