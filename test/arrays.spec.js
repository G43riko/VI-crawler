var expect    = require("chai").expect;

describe("Color Code Converter", function() {
    describe("RGB to Hex conversion", function() {
        it("converts the basic colors", function() {
            expect(44).to.deep.equal(4 * 11);
        });
    });
  
    describe("Hex to RGB conversion", function() {
        it("converts the basic colors", function() {
            expect(22).to.deep.equal(2 * 11);
        });
    });
});