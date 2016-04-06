(function() {
  function LatexParser(source) {
    if ( ! (this instanceof LatexParser) ) {
      return new LatexParser();
    }
    /**
     * Source string
     * @type {String}
     */
    this.source = source;
    this.footer = null;
  }


  /**
   * Header; all content before the "\begin{document}" tag.
   * @type {String}
   */
  LatexParser.prototype.getHeader = function(returnRowNumbers) {
    
  }


    /**
     * Footer; "\end{document}"
     * @type {String}
     */
  LatexParser.prototype.getFooter = function() {

  }




  var app = {
    // Settings
    timeoutId: null,
    pollInterval: 1000, // 1 sec
    ready: false,
    serverUrl: "http://localhost:3002",

    // Ace editor instance
    editor: null,
    // Cached data
    cache: {
      header: null,
      body: {}, // "fromrow-torow": "cache content"
      footer: null,
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
      $.post(self.serverUrl, {
        source: source
      }).done(function(data) {
        console.log(data);
      }).fail(function(data) {
        console.log(data);
      });
      */
    },


    parse: function() {
      
    },

  };

  app.init();
})();