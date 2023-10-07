var Fritzbox = require("./Fritzbox");

describe("Fritzbox Test Suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("should be able to create a Fritzbox instance with defaults", function() {
    var box = new Fritzbox.Fritzbox();
    expect(box).toBeDefined();
  });
});
