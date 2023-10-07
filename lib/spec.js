var Fritzbox = require("./Fritzbox");

describe("Fritzbox Test Suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("should be able to create a Fritzbox instance with defaults", function() {
    var box = new Fritzbox.Fritzbox();
    expect(box).toBeDefined();
    box.close();
  });

  it("should be able to create a Fritzbox instance with options", function() {
    var box = new Fritzbox.Fritzbox({
      host: "fritz.box",
      port: 49443,
      ssl: true,
      user: "user",
      password: "password",
      serverPort: 52400,
      serverAddress: "192.168.80.37"
    });
    expect(box).toBeDefined();
    box.close();
  });

  it("should be able to initialize a TR064 device", function(done) {
    var box = new Fritzbox.Fritzbox();
    box.initTR064Device()
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        box.close();
        done();
      })
      .catch(function(err) {
        expect(err).toBeUndefined();
        done();
      });
  });

  it("should be able to initialize an IGD device", function(done) {
    var box = new Fritzbox.Fritzbox();
    box.initIGDDevice()
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        box.close();
        done();
      })
      .catch(function(err) {
        expect(err).toBeUndefined();
        done();
      });
  });
});
