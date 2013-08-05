// Generated by CoffeeScript 1.5.0
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!example/css/example-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TYPE_CONTAINER, exampleishClasses, types;
    TYPE_CONTAINER = jQuery('<span class="type-container dropdown aloha-ephemera">\n    <a class="type" href="#" data-toggle="dropdown"></a>\n    <ul class="dropdown-menu">\n    </ul>\n</span>');
    exampleishClasses = {};
    types = [];
    return Plugin.create('example', {
      defaults: [
        {
          label: 'Example',
          cls: 'example',
          hasTitle: true
        }, {
          label: 'Case in point',
          cls: 'example',
          hasTitle: true,
          type: 'case-in-point'
        }, {
          label: 'Case study',
          cls: 'example',
          hasTitle: true,
          type: 'case-study'
        }, {
          label: 'Demonstration',
          cls: 'example',
          hasTitle: true,
          type: 'demonstration'
        }, {
          label: 'Illustration',
          cls: 'example',
          hasTitle: true,
          type: 'illustration'
        }
      ],
      getLabel: function($element) {
        var type, _i, _len;
        for (_i = 0, _len = types.length; _i < _len; _i++) {
          type = types[_i];
          if ($element.is(type.selector)) {
            return type.label;
          }
        }
      },
      activate: function($element) {
        var _this = this;
        return jQuery.each(types, function(i, type) {
          var $body, $title, typeContainer;
          if ($element.is(type.selector)) {
            $title = $element.children('.title');
            $title.attr('hover-placeholder', 'Add a title (optional)');
            $title.aloha();
            $body = $element.contents().not($title);
            typeContainer = TYPE_CONTAINER.clone();
            if (types.length > 1) {
              jQuery.each(types, function(i, dropType) {
                var $option;
                $option = jQuery('<li><a href="#"></a></li>');
                $option.appendTo(typeContainer.find('.dropdown-menu'));
                $option = $option.children('a');
                $option.text(dropType.label);
                typeContainer.find('.type').on('click', function() {
                  return jQuery.each(types, function(i, dropType) {
                    if ($element.attr('data-type') === dropType.type) {
                      return typeContainer.find('.dropdown-menu li').each(function(i, li) {
                        jQuery(li).removeClass('checked');
                        if (jQuery(li).children('a').text() === dropType.label) {
                          return jQuery(li).addClass('checked');
                        }
                      });
                    }
                  });
                });
                return $option.on('click', function(e) {
                  var $newTitle, key;
                  e.preventDefault();
                  if (dropType.hasTitle) {
                    if (!$element.children('.title')[0]) {
                      $newTitle = jQuery("<" + (dropType.titleTagName || 'span') + " class='title'></" + (dropType.titleTagName || 'span'));
                      $element.append($newTitle);
                      $newTitle.aloha();
                    }
                  } else {
                    $element.children('.title').remove();
                  }
                  if (dropType.type) {
                    $element.attr('data-type', dropType.type);
                  } else {
                    $element.removeAttr('data-type');
                  }
                  typeContainer.find('.type').text(dropType.label);
                  for (key in exampleishClasses) {
                    $element.removeClass(key);
                  }
                  return $element.addClass(dropType.cls);
                });
              });
            } else {
              typeContainer.find('.dropdown-menu').remove();
              typeContainer.find('.type').removeAttr('data-toggle');
            }
            typeContainer.find('.type').text(type.label);
            typeContainer.prependTo($element);
            return $('<div>').addClass('body').attr('placeholder', "Type the text of your " + (type.label.toLowerCase()) + " here.").append($body).appendTo($element).aloha();
          }
        });
      },
      deactivate: function($element) {
        var $body, hasTextChildren, isEmpty,
          _this = this;
        $body = $element.children('.body');
        hasTextChildren = $body.children().length !== $body.contents().length;
        isEmpty = $body.text().trim() === '';
        if (isEmpty) {
          $body = jQuery('<p class="para"></p>');
        } else {
          $body = $body.contents();
          if (hasTextChildren) {
            $body = $body.wrap('<p></p>').parent();
          }
        }
        $element.children('.body').remove();
        jQuery.each(types, function(i, type) {
          var $title, $titleElement;
          if ($element.is(type.selector) && type.hasTitle) {
            $titleElement = $element.children('.title');
            $title = jQuery("<" + (type.titleTagName || 'span') + " class=\"title\"></" + type.titleTagName + ">");
            if ($titleElement.length) {
              $title.append($titleElement.contents());
              $titleElement.remove();
            }
            return $title.prependTo($element);
          }
        });
        return $element.append($body);
      },
      selector: '.example',
      init: function() {
        var _this = this;
        types = this.settings;
        jQuery.each(types, function(i, type) {
          var className, hasTitle, label, newTemplate, tagName, titleTagName, typeName;
          className = type.cls || (function() {
            throw 'BUG Invalid configuration of example plugin. cls required!';
          })();
          typeName = type.type;
          hasTitle = !!type.hasTitle;
          label = type.label || (function() {
            throw 'BUG Invalid configuration of example plugin. label required!';
          })();
          tagName = type.tagName || 'div';
          titleTagName = type.titleTagName || 'div';
          if (typeName) {
            type.selector = "." + className + "[data-type='" + typeName + "']";
          } else {
            type.selector = "." + className + ":not([data-type])";
          }
          exampleishClasses[className] = true;
          newTemplate = jQuery("<" + tagName + "></" + tagName);
          newTemplate.addClass(className);
          if (typeName) {
            newTemplate.attr('data-type', typeName);
          }
          if (hasTitle) {
            newTemplate.append("<" + titleTagName + " class='title'></" + titleTagName);
          }
          UI.adopt("insert-" + className + typeName, Button, {
            click: function() {
              return semanticBlock.insertAtCursor(newTemplate.clone());
            }
          });
          if ('example' === className && !typeName) {
            return UI.adopt("insertExample", Button, {
              click: function() {
                return semanticBlock.insertAtCursor(newTemplate.clone());
              }
            });
          }
        });
        return semanticBlock.register(this);
      }
    });
  });

}).call(this);
