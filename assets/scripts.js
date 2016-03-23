/**
 * Global application object
 * @type {Object}
 */
var app = {
  timeoutId: null,
  pollInterval: 1000, // 1 sec
  ready: false
};


/**
 * Onready
 */
$(function() {
  /**
   * Initialize application
   * @return {Void}
   */
  app.init = function() {
    var self = this;

    self.editor = ace.edit("ace-editor");
    self.editor.setTheme("ace/theme/twilight");
    self.editor.session.setMode("ace/mode/tex");
    self.editor.on("input", function(a, b) {
      var source = b.session.getValue();
      self.preview(source);
    });

    self.ready = true;
  }
  /**
   * Send to server and get preview
   * @param  {String}  source Source code
   * @param  {Boolean} force  Dont poll
   * @return {Void}
   */
  app.preview = function(source, force) {
    var self = this;

    if (self.timeoutId) {
      clearTimeout(self.timeoutId);
    }
    if ( ! force ) {
      return self.timeoutId = setTimeout(function() {
        self.preview(source, true);
      }, self.pollInterval);
    }

    $.post(self.serverUrl, function(data) {
      
    });
  }

  // Initialize
  app.init();
});