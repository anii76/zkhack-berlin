use dep::quantized::quantized::Quantized;

fn main(probeFace: [Quantized; 128], referenceFace: pub [Quantized; 128]) {
    let mut sum: Quantized = Quantized::new(0);

    for i in 0..128 {
        let diff = probeFace[i] - referenceFace[i];
        sum += diff ;//* diff; // Squared difference
    }

    // Match threshold depends on your quantization and distance scale
    assert(sum < Quantized::new(1_500_000_000)); // adjust this threshold empirically
}

//#[test]
//fn test_main() {
//    let faceA: [Field; 128] = [0; 128];
//    let _faceB: [Field; 128] = [1; 128];
//    main(faceA, faceA);


    // Uncomment to make test fail
    // main(faceA, faceB);
//}
