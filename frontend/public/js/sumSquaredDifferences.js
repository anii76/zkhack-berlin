"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sumSquaredDifferences = sumSquaredDifferences;
function sumSquaredDifferences(face1, face2) {
    const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495616");
    const halfP = p / BigInt(2);
    return face1.reduce((sum, value, index) => {
        let diff = value - face2[index];
        // Handle field arithmetic - if diff is greater than half of p, it's actually negative
        if (diff > halfP) {
            diff = diff - p; // Convert back to negative
        }
        else if (diff < -halfP) {
            diff = diff + p; // Convert back to positive
        }
        return sum + diff * diff;
    }, BigInt(0));
}
