var _ = require('underscore');
var s = require('./Service');
var http = require('http');
const { parseStringPromise } = require('xml2js');
const request = require('request');

var TR064_DESC_URL = "/tr64desc.xml";
var IGD_DESC_URL = "/igddesc.xml";
var PMR_DESC_URL = "/pmr/PersonalMessageReceiver.xml";

var DEFAULTS = {
  host: "fritz.box",
  port: 49000,
  ssl: false
};

function Fritzbox(options){
  this.options = options ? options : {};
  _.defaults(this.options, DEFAULTS);
  this.options.protocol = this.options.ssl ? "https://" : "http://";
  if(this.options.user && this.options.password) {
    this.options.auth = {
      user: this.options.user,
      pass: this.options.password,
      sendImmediately: false
    };
  }

  if(this.options.serverPort) {
    this._startSubscriptionResponseServer();
  }

  this.services = {};
  this.devices = {};
}

Fritzbox.prototype.initTR064Device = function(){
	return this._parseDesc(TR064_DESC_URL);
};

Fritzbox.prototype.initIGDDevice = function(){
	return this._parseDesc(IGD_DESC_URL);
};

Fritzbox.prototype.initPMRDevice = function(){
  return  this._parseDesc(PMR_DESC_URL);
};

Fritzbox.prototype.close = function(){
  if(this.server) {
    this.server.close();
  }
};

Fritzbox.prototype._getServices = function(device) {
  var that = this;

  var serviceList = device.serviceList;
  delete device.serviceList;
  var deviceList = device.deviceList;
  delete device.deviceList;

  //Getting the service
  if(serviceList && Array.isArray(serviceList.service)) {
    serviceList.service.forEach(function(service) {
      that.services[service.serviceType] = new s.Service(service, device, that.options);
    });
  } else if (serviceList && serviceList.service) {
    that.services[serviceList.service.serviceType] = new s.Service(serviceList.service, device, that.options);
  }

  //Recursion
  if (deviceList && Array.isArray(deviceList.device)) {
      deviceList.device.forEach(function (dev) {
          that._getServices(dev);
          that.devices[dev.deviceType] = dev;
      });
  } else if (deviceList && deviceList.device) {
      that._getServices(deviceList.device);
      that.devices[deviceList.device.deviceType] = deviceList.device;
  }
};

Fritzbox.prototype._handleRequest = function(req, res) {
  res.end();
};

Fritzbox.prototype._startSubscriptionResponseServer = function() {
  var that = this;
  that.server = http.createServer();
  that.server.listen(that.options.serverPort, function() {
    that.server.on('request', that._handleRequest);
  });

};

Fritzbox.prototype.listServices = function(){
  var that = this;
  return Object.keys(that.services).map(function (key) { return that.services[key].meta; });
};

Fritzbox.prototype._parseDesc = function(url){
  var that = this;
  var uri = that.options.protocol + that.options.host + ":" + that.options.port + url;

  return new Promise(function(resolve, reject) {
    request({
      uri: uri,
      rejectUnauthorized: false
    }, function(error, response, body) {
      if(error) {
        reject(error);
      } else if(response.statusCode != 200) {
        reject(response.statusMessage);
      } else {
        resolve(body);
      }
    });
  }).then(function(body) {
      return parseStringPromise(body, {explicitArray: false});
  }).then(function(result) {
    that.devices[result.root.device.deviceType] = result.root.device;
    that._getServices(that.devices[result.root.device.deviceType]);
    var promises = [];
    for (var key in that.services) {
      if (!that.services.hasOwnProperty(key)) continue;

      var service = that.services[key];
      promises.push(service.initialize());
    }
    return Promise.all(promises);
  });
};
exports.Fritzbox = Fritzbox;
