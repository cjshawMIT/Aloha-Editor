// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!equation/css/equation-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TEMPLATE;
    TEMPLATE = '<div class="equation"></div>';
    return Plugin.create('equation', {
      init: function() {
        semanticBlock.activateHandler('.equation', function($element) {
          return $element.aloha();
        });
        semanticBlock.deactivateHandler('.equation', function($element) {
          return $element.aloha();
        });
        UI.adopt("insert-equation", Button, {
          click: function(e) {
            e.preventDefault();
            return semanticBlock.insertAtCursor(jQuery(TEMPLATE));
          }
        });
        return UI.adopt("insertNote", Button, {
          click: function(e) {
            e.preventDefault();
            return semanticBlock.insertAtCursor(jQuery(TEMPLATE));
          }
        });
      }
    });
  });

}).call(this);
