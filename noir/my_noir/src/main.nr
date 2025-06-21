fn main(probeFace: [Field; 128], referenceFace: pub [Field; 128]) {
    for i in 0..128 {
        assert(probeFace[i] == referenceFace[i]);
    }
}

#[test]
fn test_main() {
    let faceA: [Field; 128] = [0; 128];
    let faceB: [Field; 128] = [1; 128];
    main(faceA, faceA);


    // Uncomment to make test fail
    // main(faceA, faceB);
}
