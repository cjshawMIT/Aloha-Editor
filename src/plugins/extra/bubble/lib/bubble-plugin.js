(function() {

  define(["aloha", "jquery", "css!bubble/css/bubble.css"], function(Aloha, jQuery) {
    var Bubbler, MILLISECS, canvas, closeTimeout, localBubble, makeBubble, openTimeout;
    canvas = jQuery('body');
    MILLISECS = 2000;
    localBubble = null;
    openTimeout = null;
    closeTimeout = null;
    makeBubble = function(el, displayer, placement, force) {
      var $bubble, $el, offset;
      if (force == null) force = false;
      placement.vertical = placement.vertical || 'below';
      placement.horizontal = placement.horizontal || 'start';
      $el = jQuery(el);
      if (!$el.data('aloha-bubble-el')) {
        $el.data('aloha-bubble-el', jQuery('<div class="bubble"></div>'));
      }
      $bubble = $el.data('aloha-bubble-el');
      $bubble.contents().remove();
      $bubble.appendTo(canvas);
      displayer($el, $bubble);
      offset = $el.offset();
      offset.position = 'absolute';
      switch (placement.vertical) {
        case 'below':
          offset.top = offset.top + $el.outerHeight();
          break;
        case 'above':
          offset.top = offset.top - $bubble.outerHeight();
          break;
        default:
          console.error('Invalid vertical placement');
      }
      switch (placement.horizontal) {
        case 'start':
          break;
        case 'center':
          if ($el.outerWidth() > $bubble.outerWidth()) {
            offset.left = offset.left + ($el.outerWidth() - $bubble.outerWidth()) / 2;
          }
          break;
        default:
          console.error('Invalid horizontal placement');
      }
      $bubble.css(offset);
      $bubble.on('mouseenter', function() {});
      clearTimeout($el.data('aloha-bubble-closeTimer'));
      if (!$el.data('aloha-bubble-clicked')) {
        return $bubble.on('mouseleave', function() {
          return jQuery(this).remove();
        });
      }
    };
    Bubbler = (function() {

      function Bubbler(displayer, $nodes, placement) {
        this.displayer = displayer;
        if ($nodes == null) $nodes = null;
        this.placement = placement != null ? placement : {
          vertical: 'below',
          horizontal: 'start'
        };
        if ($nodes != null) this.applyTo($nodes);
      }

      Bubbler.prototype.setPlacement = function(vertical, horizontal) {
        if (vertical == null) vertical = 'below';
        if (horizontal == null) horizontal = 'start';
        this.placement.vertical = vertical;
        return this.placement.horizontal = horizontal;
      };

      Bubbler.prototype.applyTo = function($nodes) {
        var delayTimeout, that;
        that = this;
        $nodes.on('open', function(evt, force) {
          var $el;
          $el = jQuery(this);
          clearTimeout($el.data('aloha-bubble-openTimer'));
          makeBubble(this, that.displayer, that.placement);
          if (force) return $el.data('aloha-bubble-clicked', true);
        });
        $nodes.on('close', function() {
          var $bubble, $el;
          $el = jQuery(this);
          $el.data('aloha-bubble-clicked', false);
          $bubble = $el.data('aloha-bubble-el');
          if ($bubble) return $bubble.remove();
        });
        delayTimeout = function(self, eventName, ms) {
          if (ms == null) ms = MILLISECS;
          return setTimeout(function() {
            return jQuery(self).trigger(eventName);
          }, ms);
        };
        $nodes.on('mouseenter', function(evt) {
          var $el;
          $el = jQuery(this);
          $el.data('aloha-bubble-openTimer', delayTimeout(this, 'open'));
          return $el.one('mouseleave', function() {
            clearTimeout($el.data('aloha-bubble-openTimer'));
            if (!$el.data('aloha-bubble-clicked')) {
              return $el.data('aloha-bubble-closeTimer', delayTimeout(this, 'close', MILLISECS / 2));
            }
          });
        });
        return Aloha.bind('aloha-selection-changed', function(event, rangeObject) {
          var $orig, origEl;
          if (that.originalRange) {
            origEl = that.originalRange.getCommonAncestorContainer();
            if (origEl !== rangeObject.getCommonAncestorContainer()) {
              $orig = jQuery(origEl);
              $orig.data('aloha-bubble-el');
              $orig.trigger('close');
            }
          }
          return that.originalRange = rangeObject;
        });
      };

      return Bubbler;

    })();
    return Bubbler;
  });

}).call(this);
