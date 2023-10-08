var Fritzbox = require("./Fritzbox");

const options = {
    host: "fritz.box",
    port: 49443,
    ssl: true,
    user: process.env.FRITZ_USER,
    password: process.env.FRITZ_PASSWORD,
    serverPort: 52400,
    serverAddress: process.env.IP
  }

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
    var box = new Fritzbox.Fritzbox(options);
    expect(box).toBeDefined();
    box.close();
  });

  it("should be able to initialize a TR064 device", function(done) {
    var box = new Fritzbox.Fritzbox();
    expect.assertions(2)
    box.initTR064Device()
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        box.close();
        done();
      });
  });

  it("should be able to initialize an IGD device", function(done) {
    var box = new Fritzbox.Fritzbox();
    expect.assertions(2)
    box.initIGDDevice()
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        box.close();
        done();
      });
  });

  it("should be able to subscribe to services", function(done) {
    var box = new Fritzbox.Fritzbox(options);
    expect.assertions(7)
    Promise.all([box.initTR064Device(), box.initIGDDevice()])
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        return Promise.all([
          box.services["urn:dslforum-org:service:LANHostConfigManagement:1"].subscribe(),
          box.services["urn:dslforum-org:service:WLANConfiguration:1"].subscribe(),
          box.services["urn:dslforum-org:service:WLANConfiguration:2"].subscribe(),
          box.services["urn:dslforum-org:service:Hosts:1"].subscribe(),
          box.services["urn:schemas-upnp-org:service:WANIPConnection:1"].subscribe()
        ]);
      }).then(function(result) {
        result.forEach(function(sid) {
          expect(sid).toBeDefined();
        });
      }).finally(function() {
        box.close();
        done();
      }).catch(function(err) {
        console.log(err);
        done();
      });
  });

  it("should be able to get the number of hosts", function(done) {
    var box = new Fritzbox.Fritzbox(options);
    expect.assertions(5)
    Promise.all([box.initTR064Device(), box.initIGDDevice()])
      .then(function() {
        expect(box.services).toBeDefined();
        expect(box.devices).toBeDefined();
        return Promise.all([
          box.services["urn:dslforum-org:service:Hosts:1"].subscribe(),
        ]);
      }).then(function() {
        return box.services["urn:dslforum-org:service:Hosts:1"].actions.GetHostNumberOfEntries();
      }).then(function(result) {
        expect(result).toBeDefined();
        expect(result.NewHostNumberOfEntries).toBeDefined();
        expect(parseInt(result.NewHostNumberOfEntries)).toBeGreaterThan(0);
      }).finally(function() {
        box.close();
        done();
      });
  });
});
