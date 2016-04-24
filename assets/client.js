/**
 * Latexweb frontend script
 * https://github.com/cihadtekin/latexweb
 * 
 * Copyright 2016 Cihad Tekin <cihadtekin@gmail.com>
 * Licensed under MIT
 */
(function() {
  // Expose as:
  var namespace = 'latexweb';

  // Main object
  var app = window[namespace] = {
    // Settings
    timeoutId: null,
    pollingInterval: 300, // ms
    pollingDuration: 2000,
    ready: false,
    serverUrl: params.previewUrl,

    // Ace editor instance
    editor: null,
    // Preview container
    result: null,

    input: null,

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

      // Preview section
      self.result = $('#preview');

      // Preview source input for download
      self.input = $('#source-input');

      // Editor setup
      self.editor = ace.edit("ace-editor");
      self.editor.setTheme("ace/theme/twilight");
      self.editor.session.setMode("ace/mode/tex");

      // On input event for ace editor
      self.editor.on("input", function(a, b) {
        var source = b.session.getValue();
        localStorage.setItem(namespace + '-document', source);
        self.preview(source);
        self.input.val(source);
      });
      
      self.ready = true;

      // Initial settings from localStore
      if (localStorage.getItem(namespace + '-settings')) {
        var settings = localStorage.getItem(namespace + '-settings');
        for (var key in settings) {
          self[key] = settings[key];
        }
      }

      // Initial data from localStore
      if (localStorage.getItem(namespace + '-document')) {
        self.editor.session.setValue(localStorage.getItem(namespace + '-document'))
      }

      // Initial compiling
      self.preview(self.editor.session.getValue(), true);
      self.input.val(self.editor.session.getValue());
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
          self.result.html('');
          for (var i = 0; i < data.result.length; i++) {
            self.result.append(
              $('<img />').attr('src', 'data:image/gif;base64,' + data.result[i] )
            );
          }
        }
      }).fail(function(data) {
        console.log(data);
      });
    }
  };

  app.init();

  /**
   * SETTINGS
   */
  $(function() {

    if (localStorage.getItem(namespace + '-settings')) {
      var settings = localStorage.getItem(namespace + '-settings') || '{}';
      try {settings = JSON.parse(settings)}
      catch(e){}
      $('#settings input').each(function() {
        if (settings[ $(this).attr('name') ]) {
          $(this).val(settings[ $(this).attr('name') ]);
        }
      });
    }

    $('#settings input').keyup(function() {
      var name = $(this).attr('name');
      var settings = localStorage.getItem(namespace + '-settings') || '{}';
      try {settings = JSON.parse(settings)}
      catch(e){}

      app[name] = settings[name] = $(this).val() * 1;
      localStorage.setItem(namespace + '-settings', JSON.stringify(settings));
    });

    $('#clear-cache').click(function() {
      if (confirm("Are you sure?")) {
        localStorage.clear();
        window.location.reload();
      }
    });

  });
  
})();