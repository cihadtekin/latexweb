/**
 * Global application object
 * @type {Object}
 */
var app = {
  serverUrl: "http://localhost:3002/",
  timeoutId: null,
  pollingDuration: 1000,
  /**
   * Initialize application
   * @return {Void}
   */
  init: function() {
    var self = this;
    self.editor = ace.edit("ace-editor");
    self.editor.focus();
    self.editor.setTheme("ace/theme/twilight");
    self.editor.session.setMode("ace/mode/tex");
    self.editor.on("input", function(a, b) {
      var source = b.session.getValue();
      self.preview(source);
    });
  },
  /**
   * Send to server and get preview
   * @param  {String}  source Source code
   * @param  {Boolean} force  Dont poll
   * @return {Void}
   */
  preview: function(source, force) {
    var self = this;
    if (self.timeoutId) {
      clearTimeout(self.timeoutId);
    }
    if ( ! force ) {
      return self.timeoutId = setTimeout(function() {
        self.preview(source, true);
      }, self.pollingDuration);
    }
    $.post(self.serverUrl, function(data) {
    });
  },

  bind: function() {
    app.init();
  }
};


$(app.bind);