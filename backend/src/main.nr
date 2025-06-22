// fn main(array1: [Field; 3], array2: pub [Field; 3]) {
//     for i in 0..3 {
//         assert(array1[i] == array2[i]);
//     }
// }

fn main(x: Field, y: pub Field) {
    // This is a simple assertion to check if the two fields are equal
    assert(x == y);
}

#[test]
// fn test_main() {
//     main([1, 2, 3], [1, 2, 3]);
//     
//     // This should pass - identical arrays
//     main([20, 5, 92], [20, 5, 92]);
// }
fn test_main() {
    main(1, 1);
    
    // This should pass - identical fields
    main(20, 20);
}
