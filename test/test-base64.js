var base64 = require("./base64");
 
exports["test atob"] = function(assert) {
      assert.ok(base64.atob("aGVsbG8=") == "hello", "atob works");
}
 
exports["test btoa"] = function(assert) {
  assert.ok(base64.btoa("hello") == "aGVsbG8=", "btoa works");
}
 
exports["test empty string"] = function(assert) {
  assert.throws(function() {
                  base64.atob();
                },
                "empty string check works");
}

require("sdk/test").run(exports);
