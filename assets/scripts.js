(function() {
  /**
   * Application object
   * @type {Object}
   */
  var app = {
    // Settings
    timeoutId: null,
    pollInterval: 1000, // 1 sec
    ready: false,
    serverUrl: "http://localhost:3000",

    // Ace editor instance
    editor: null,
    // Cached data
    cache: {
      // "fromrow-torow": "cache content"
    },
    /**
     * Initialize application
     * @return {Void}
     */
    init: function(run) {
      var self = this;
      if ( ! run ) {
        return $(function() {
          app.init(true);
        });
      }
      self.editor = ace.edit("ace-editor");
      self.editor.setTheme("ace/theme/twilight");
      self.editor.session.setMode("ace/mode/tex");
      self.editor.on("input", function(a, b) {
        console.log(a, b);
        var source = b.session.getValue();
        self.preview(source);
      });
      self.ready = true;
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
        }, self.pollInterval);
      }

      /*
      $.post(self.serverUrl, function(data) {
        console.log(data);
      });
      */
    }
  };

  app.init();
})();