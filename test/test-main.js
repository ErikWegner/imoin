var main = require("./main");

exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  done();
};

exports["test url to host"] = function(assert) {
  var cuthost = main.cuthost;
  
  assert.equal("https://www.example.com", cuthost("https://www.example.com/icinga/cgi-bin"), "cuthost 1");
  assert.equal("https://www.example.com", cuthost("https://www.example.com/icinga/cgi-bin/"), "cuthost 2");
  assert.equal("https://www.example.com", cuthost("https://www.example.com/"), "cuthost 3");
  assert.equal("https://www.example.com", cuthost("https://www.example.com"), "cuthost 4");
  assert.equal("https://www.example.com:80", cuthost("https://www.example.com:80/"), "cuthost 5");
}

require("sdk/test").run(exports);
