// Generated by CoffeeScript 1.6.2
(function() {
  define(['aloha', 'block/blockmanager', 'aloha/plugin', 'aloha/pluginmanager', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'css!semanticblock/css/semanticblock-plugin.css'], function(Aloha, BlockManager, Plugin, pluginManager, jQuery, Ephemera, UI, Button) {
    var activate, activateHandlers, bindEvents, blockControls, blockDragHelper, blockTemplate, cleanIds, deactivate, deactivateHandlers, insertElement, pluginEvents;

    if (pluginManager.plugins.semanticblock) {
      return pluginManager.plugins.semanticblock;
    }
    blockTemplate = jQuery('<div class="semantic-container"></div>');
    blockControls = jQuery('<div class="semantic-controls"><button class="semantic-delete"><i class="icon-remove"></i></button></div>');
    blockDragHelper = jQuery('<div class="semantic-drag-helper"><div class="title"></div><div class="body">Drag me to the desired location in the document</div></div>');
    activateHandlers = {};
    deactivateHandlers = {};
    pluginEvents = [
      {
        name: 'mouseenter',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').addClass('drag-active');
        }
      }, {
        name: 'mouseleave',
        selector: '.aloha-block-draghandle',
        callback: function() {
          if (!jQuery(this).parents('.semantic-container').data('dragging')) {
            return jQuery(this).parents('.semantic-container').removeClass('drag-active');
          }
        }
      }, {
        name: 'mousedown',
        selector: '.aloha-block-draghandle',
        callback: function(e) {
          e.preventDefault();
          return jQuery(this).parents('.semantic-container').data('dragging', true);
        }
      }, {
        name: 'mouseup',
        selector: '.aloha-block-draghandle',
        callback: function() {
          return jQuery(this).parents('.semantic-container').data('dragging', false);
        }
      }, {
        name: 'click',
        selector: '.semantic-container .semantic-delete',
        callback: function(e) {
          e.preventDefault();
          return jQuery(this).parents('.semantic-container').first().slideUp('slow', function() {
            return jQuery(this).remove();
          });
        }
      }, {
        name: 'mouseover',
        selector: '.semantic-container',
        callback: function() {
          jQuery(this).parents('.semantic-container').removeClass('focused');
          if (!jQuery(this).find('.focused').length) {
            return jQuery(this).addClass('focused');
          }
        }
      }, {
        name: 'mouseout',
        selector: '.semantic-container',
        callback: function() {
          return jQuery(this).removeClass('focused');
        }
      }, {
        name: 'blur',
        selector: '[placeholder]',
        callback: function() {
          var $el;

          $el = jQuery(this);
          if (!$el.text().trim()) {
            $el.empty();
          }
          return $el.toggleClass('aloha-empty', $el.is(':empty'));
        }
      }
    ];
    insertElement = function(element) {};
    activate = function(element) {
      var selector, _results;

      if (!(element.parent('.semantic-container').length || element.is('.semantic-container'))) {
        element.addClass('aloha-oer-block');
        element.wrap(blockTemplate).parent().append(blockControls.clone()).alohaBlock();
        _results = [];
        for (selector in activateHandlers) {
          if (element.is(selector)) {
            activateHandlers[selector](element);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };
    deactivate = function(element) {
      var selector;

      if (element.parent('.semantic-container').length || element.is('.semantic-container')) {
        element.removeClass('aloha-oer-block ui-draggable');
        element.removeAttr('style');
        for (selector in deactivateHandlers) {
          if (element.is(selector)) {
            deactivateHandlers[selector](element);
            break;
          }
        }
        element.siblings('.semantic-controls').remove();
        return element.unwrap();
      }
    };
    bindEvents = function(element) {
      var event, i, _results;

      if (element.data('oerBlocksInitialized')) {
        return;
      }
      element.data('oerBlocksInitialized', true);
      event = void 0;
      i = void 0;
      i = 0;
      _results = [];
      while (i < pluginEvents.length) {
        event = pluginEvents[i];
        element.on(event.name, event.selector, event.callback);
        _results.push(i++);
      }
      return _results;
    };
    cleanIds = function(content) {
      var element, elements, i, id, ids, _i, _ref, _results;

      elements = content.find('[id]');
      ids = {};
      _results = [];
      for (i = _i = 0, _ref = elements.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        element = jQuery(elements[i]);
        id = element.attr('id');
        if (ids[id]) {
          _results.push(element.attr('id', ''));
        } else {
          _results.push(ids[id] = element);
        }
      }
      return _results;
    };
    Aloha.ready(function() {
      return bindEvents(jQuery(document));
    });
    return Plugin.create('semanticblock', {
      makeClean: function(content) {
        var selector;

        for (selector in deactivateHandlers) {
          content.find(".aloha-oer-block" + selector).each(function() {
            return deactivate(jQuery(this));
          });
        }
        return cleanIds(content);
      },
      init: function() {
        var _this = this;

        Aloha.bind('aloha-editable-activated', function(e, params) {
          var $root;

          $root = jQuery(params.editable.obj);
          return $root.find('[placeholder]:empty').addClass('aloha-empty');
        });
        return Aloha.bind('aloha-editable-created', function(e, params) {
          var $root, classes, selector;

          $root = params.obj;
          classes = [];
          for (selector in activateHandlers) {
            classes.push(selector);
          }
          $root.find(classes.join()).each(function(i, el) {
            var $el;

            $el = jQuery(el);
            if (!$el.parents('.semantic-drag-source')[0]) {
              $el.addClass('aloha-oer-block');
            }
            return activate($el);
          });
          if ($root.is('.aloha-block-blocklevel-sortable') && !$root.parents('.aloha-editable').length) {
            jQuery('.semantic-drag-source').children().each(function() {
              var element;

              element = jQuery(this);
              return element.draggable({
                connectToSortable: $root,
                revert: 'invalid',
                helper: function() {
                  var helper;

                  helper = jQuery(blockDragHelper).clone();
                  helper.find('.title').text('im a helper');
                  return helper;
                },
                start: function(e, ui) {
                  $root.addClass('aloha-block-dropzone');
                  return jQuery(ui.helper).addClass('dragging');
                },
                refreshPositions: true
              });
            });
            return $root.sortable('option', 'stop', function(e, ui) {
              var $el;

              $el = jQuery(ui.item);
              if ($el.is(classes.join())) {
                return activate($el);
              }
            });
          }
        });
      },
      insertAtCursor: function(template) {
        var $element, range;

        $element = jQuery(template);
        range = Aloha.Selection.getRangeObject();
        $element.addClass('semantic-temp');
        GENTICS.Utils.Dom.insertIntoDOM($element, range, Aloha.activeEditable.obj);
        $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return activate($element);
      },
      appendElement: function($element, target) {
        $element.addClass('semantic-temp');
        target.append($element);
        $element = Aloha.jQuery('.semantic-temp').removeClass('semantic-temp');
        return activate($element);
      },
      activateHandler: function(selector, handler) {
        return activateHandlers[selector] = handler;
      },
      deactivateHandler: function(selector, handler) {
        return deactivateHandlers[selector] = handler;
      },
      registerEvent: function(name, selector, callback) {
        return pluginEvents.push({
          name: name,
          selector: selector,
          callback: callback
        });
      }
    });
  });

}).call(this);
