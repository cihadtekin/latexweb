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
  LatexParser.prototype.getHeader = function() {
    
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
    pollingInterval: 300, // ms
    pollingDuration: 2000,
    ready: false,
    serverUrl: "http://localhost:3002",

    // Ace editor instance
    editor: null,
    // Result container
    result: null,
    // Cached data
    cache: {
      header: null,
      body: {}, // "fromrow-torow": "cached content"
      footer: null,
    },

    // Private props
    startedTime: false,

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
        self.startedTime = 
        self.preview(source);
      });
      self.ready = true;
      self.result = $('#preview');
      self.preview(
        self.editor.session.getValue(), true
      );
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
        }, self.pollingInterval);
      }

      $.post(self.serverUrl, {
        source: source
      }).done(function(data) {
        if (data.success) {
          self.result.html(
            $('<img />').attr('src', 'data:image/gif;base64,' +
              data.result)
          );
        }
      }).fail(function(data) {
        console.log(data);
      });
    },


    parse: function() {
      
    }

  };

  app.init();







  /**
   * SETTINGS
   */
  $(function() {

    $('#settings input').keyup(function() {
      app[$(this).attr('name')] = $(this).val() * 1;
    });

  });
  
})();