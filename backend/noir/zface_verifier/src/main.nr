use dep::quantized::quantized::Quantized;

fn main(probeFace: [Quantized; 128], referenceFace: pub [Quantized; 128], threshold: pub Field) {
    let mut sum_squared_diff: Quantized = Quantized::new(0);
    
    for i in 0..128 {
        // Calculate difference
        let diff = probeFace[i] - referenceFace[i];
        
        // Square the difference
        let squared_diff = diff * diff;
        
        // Add to sum
        sum_squared_diff += squared_diff;
    }
    
    // Assert that the sum of squared differences is below the threshold
    let quantized_threshold = Quantized::new(threshold);
    assert(sum_squared_diff < quantized_threshold, "Faces do not match within the threshold");
}

#[test]
fn test_main() {
    let mut faceA: [Quantized; 128] = [Quantized::new(0); 128];
    let mut faceB: [Quantized; 128] = [Quantized::new(0); 128];
    
    // Initialize faceB with different values
    for i in 0..128 {
        faceB[i] = Quantized::new(1);
    }
    
    // Test with identical faces (should pass with any reasonable threshold)
    main(faceA, faceA, 100);
    
    // Test with different faces (uncomment to make test fail)
    // main(faceA, faceB, 100);
}