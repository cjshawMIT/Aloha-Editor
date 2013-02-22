// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'popover', 'ui/ui', 'css!../../../cnx/math/css/math.css'], function(Aloha, Plugin, jQuery, Popover, UI) {
    var EDITOR_HTML, LANGUAGES, MATHML_ANNOTATION_ENCODINGS, SELECTOR, TOOLTIP_TEMPLATE, addAnnotation, buildEditor, cleanupFormula, getMathFor, insertMath, makeCloseIcon, squirrelMath, triggerMathJax;
    EDITOR_HTML = '<div class="math-editor-dialog">\n    <div class="math-container">\n        <pre><span></span><br></pre>\n        <textarea type="text" class="formula" rows="1"\n                  placeholder="Insert your math notation here"></textarea>\n    </div>\n    <div class="footer">\n      <span>This is:</span>\n      <label class="radio inline">\n          <input type="radio" name="mime-type" value="math/asciimath"> ASCIIMath\n      </label>\n      <label class="radio inline">\n          <input type="radio" name="mime-type" value="math/tex"> LaTeX\n      </label>\n      <label class="radio inline mime-type-mathml">\n          <input type="radio" name="mime-type" value="math/mml"> MathML\n      </label>\n      <button class="btn btn-primary done">Done</button>\n    </div>\n</div>';
    LANGUAGES = {
      'math/asciimath': {
        open: '`',
        close: '`'
      },
      'math/tex': {
        open: '[TEX_START]',
        close: '[TEX_END]'
      },
      'math/mml': {
        raw: true
      }
    };
    MATHML_ANNOTATION_ENCODINGS = {
      'TeX': 'math/tex',
      'ASCIIMath': 'math/asciimath'
    };
    TOOLTIP_TEMPLATE = '<div class="aloha-ephemera tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';
    Aloha.ready(function() {
      if (typeof MathJax !== "undefined" && MathJax !== null) {
        return MathJax.Hub.Configured();
      }
    });
    getMathFor = function(id) {
      var jax, mathStr;
      jax = typeof MathJax !== "undefined" && MathJax !== null ? MathJax.Hub.getJaxFor(id) : void 0;
      if (jax) {
        mathStr = jax.root.toMathML();
        return jQuery(mathStr);
      }
    };
    squirrelMath = function($el) {
      var $mml;
      $mml = getMathFor($el.find('script').attr('id'));
      $el.find('.mathml-wrapper').remove();
      $mml.wrap('<span class="mathml-wrapper aloha-ephemera-wrapper"></span>');
      return $el.append($mml.parent());
    };
    Aloha.bind('aloha-editable-activated', function(evt, ed) {
      var $maths;
      $maths = ed.editable.obj.find('math');
      $maths.wrap('<span class="math-element aloha-ephemera-wrapper"><span class="mathjax-wrapper aloha-ephemera"></span></span>');
      return jQuery.each($maths, function(i, el) {
        var $el, $mathElement;
        $el = jQuery(el);
        $mathElement = $el.parent().parent();
        return triggerMathJax($mathElement);
      });
      /*
          MathJax.Hub.Queue ->
            jQuery.each MathJax.Hub.getAllJax(), (i, jax) ->
              $el = jQuery "##{ jax.inputID }"
              # `$el` is the `span` added by MathJax. We are interested in its parent, the `math-element`
              squirrelMath $el.parent()
      */

    });
    insertMath = function() {
      var $el, $tail, formula, range;
      $el = jQuery('<span class="math-element aloha-ephemera-wrapper"><span class="mathjax-wrapper aloha-ephemera">&#160;</span></span>');
      range = Aloha.Selection.getRangeObject();
      if (range.isCollapsed()) {
        GENTICS.Utils.Dom.insertIntoDOM($el, range, Aloha.activeEditable.obj);
        $el.trigger('show');
        return makeCloseIcon($el);
      } else {
        $tail = jQuery('<span class="aloha-ephemera math-trailer" />');
        formula = range.getText();
        $el.text('`' + formula + '`');
        GENTICS.Utils.Dom.removeRange(range);
        GENTICS.Utils.Dom.insertIntoDOM($el.add($tail), range, Aloha.activeEditable.obj);
        return triggerMathJax($el, function() {
          var r, sel;
          addAnnotation($el, formula, 'math/asciimath');
          makeCloseIcon($el);
          sel = window.getSelection();
          r = sel.getRangeAt(0);
          r.selectNodeContents($tail.parent().get(0));
          r.setEndAfter($tail.get(0));
          r.setStartAfter($tail.get(0));
          sel.removeAllRanges();
          sel.addRange(r);
          r = new GENTICS.Utils.RangeObject();
          r.update();
          return Aloha.Selection.rangeObject = r;
        });
      }
    };
    UI.adopt('insertMath', null, {
      click: function() {
        return insertMath();
      }
    });
    triggerMathJax = function($mathElement, cb) {
      var callback;
      if (typeof MathJax !== "undefined" && MathJax !== null) {
        callback = function() {
          squirrelMath($mathElement);
          return typeof cb === "function" ? cb() : void 0;
        };
        return MathJax.Hub.Queue(["Typeset", MathJax.Hub, $mathElement.find('.mathjax-wrapper')[0], callback]);
      } else {
        return console.log('MathJax was not loaded properly');
      }
    };
    cleanupFormula = function($editor, $span, destroy) {
      if (destroy == null) {
        destroy = false;
      }
      if (destroy || jQuery.trim($editor.find('.formula').val()).length === 0) {
        $span.find('.math-element-destroy').tooltip('destroy');
        return $span.remove();
      }
    };
    buildEditor = function($span) {
      var $annotation, $editor, $formula, $tmp, formula, keyDelay, keyTimeout, lang, mimeType, radios,
        _this = this;
      $editor = jQuery(EDITOR_HTML);
      $editor.find('.done').on('click', function() {
        if (!$span.next().is('.aloha-ephemera-wrapper')) {
          $('<span class="aloha-ephemera-wrapper">&#160;</span>').insertAfter($span);
        }
        return $span.trigger('hide');
      });
      $editor.find('.remove').on('click', function() {
        $span.trigger('hide');
        return cleanupFormula($editor, $span, true);
      });
      $formula = $editor.find('.formula');
      mimeType = $span.find('script[type]').attr('type') || 'math/asciimath';
      mimeType = mimeType.split(';')[0];
      formula = $span.find('script[type]').html();
      if (mimeType === 'math/mml') {
        $tmp = jQuery('<div></div>').html($span.find('script[type]').text());
        $annotation = $tmp.find('annotation');
        lang = $annotation.attr('encoding');
        if (MATHML_ANNOTATION_ENCODINGS[lang]) {
          mimeType = MATHML_ANNOTATION_ENCODINGS[lang];
          formula = $annotation.text();
        }
      }
      $editor.find("input[name=mime-type][value='" + mimeType + "']").attr('checked', true);
      $formula.val(formula);
      $editor.find('.math-container pre span').text(formula);
      if (mimeType !== 'math/mml') {
        $editor.find("label.mime-type-mathml").remove();
      }
      keyTimeout = null;
      keyDelay = function() {
        var $mathPoint, formulaWrapped;
        formula = jQuery(this).val();
        mimeType = $editor.find('input[name=mime-type]:checked').val();
        $mathPoint = $span.children('.mathjax-wrapper');
        if (!$mathPoint[0]) {
          $mathPoint = jQuery('<span class="mathjax-wrapper aloha-ephemera"></span>');
          $span.prepend($mathPoint);
        }
        if (LANGUAGES[mimeType].raw) {
          $mathPoint.innerHTML = formula;
        } else {
          formulaWrapped = LANGUAGES[mimeType].open + formula + LANGUAGES[mimeType].close;
          $mathPoint.text(formulaWrapped);
        }
        triggerMathJax($span, function() {
          var $mathml;
          $mathml = $span.find('math');
          if ($mathml[0]) {
            addAnnotation($span, formula, mimeType);
            return makeCloseIcon($span);
          }
        });
        $span.data('math-formula', formula);
        return $formula.trigger('focus');
      };
      $formula.on('input', function() {
        clearTimeout(keyTimeout);
        setTimeout(keyDelay.bind(this), 500);
        return $editor.find('.math-container pre span').text($editor.find('.formula').val());
      });
      radios = $editor.find('input[name=mime-type]');
      radios.on('click', function() {
        radios.attr('checked', false);
        jQuery(this).attr('checked', true);
        clearTimeout(keyTimeout);
        return setTimeout(keyDelay.bind($formula), 500);
      });
      $span.off('shown-popover').on('shown-popover', function() {
        var $el, tt;
        $span.css('background-color', '#E5EEF5');
        $el = jQuery(this);
        tt = $el.data('tooltip');
        if (tt) {
          tt.hide().disable();
        }
        return setTimeout(function() {
          var $popover;
          $popover = $el.data('popover');
          if ($popover) {
            return $popover.$tip.find('.formula').trigger('focus');
          }
        }, 10);
      });
      $span.off('hidden-popover').on('hidden-popover', function() {
        var tt;
        $span.css('background-color', '');
        tt = jQuery(this).data('tooltip');
        if (tt) {
          tt.enable();
        }
        return cleanupFormula($editor, jQuery(this));
      });
      return $editor;
    };
    makeCloseIcon = function($el) {
      var $closer;
      $closer = $el.find('.math-element-destroy');
      if (!($closer[0] != null)) {
        $closer = jQuery('<a class="math-element-destroy aloha-ephemera" title="Delete\u00A0math">&nbsp;</a>');
        if (jQuery.ui && jQuery.ui.tooltip) {
          $closer.tooltip();
        } else {
          $closer.tooltip({
            placement: 'bottom',
            template: TOOLTIP_TEMPLATE
          });
        }
        return $el.append($closer);
      }
    };
    addAnnotation = function($span, formula, mimeType) {
      var $annotation, $mml, $semantics;
      $mml = $span.find('math');
      if ($mml[0]) {
        $annotation = $mml.find('annotation');
        if (!($annotation[0] != null)) {
          if ($mml.children().length > 1) {
            $mml.wrapInner('<mrow></mrow>');
          }
          $semantics = $mml.find('semantics');
          if (!$semantics[0]) {
            $mml.wrapInner('<semantics></semantics>');
            $semantics = $mml.find('semantics');
          }
          $annotation = jQuery('<annotation></annotation>').appendTo($semantics);
        }
        $annotation.attr('encoding', mimeType);
        return $annotation.text(formula);
      }
    };
    Aloha.bind('aloha-editable-created', function(e, editable) {
      return editable.obj.bind('keydown', 'ctrl+m', function(evt) {
        insertMath();
        return evt.preventDefault();
      });
    });
    Aloha.bind('aloha-editable-activated', function(event, data) {
      var editable;
      editable = data.editable;
      jQuery(editable.obj).on('click.matheditor', '.math-element, .math-element *', function(evt) {
        var $el, range;
        $el = jQuery(this);
        if (!$el.is('.math-element')) {
          $el = $el.parents('.math-element');
        }
        $el.contentEditable(false);
        range = new GENTICS.Utils.RangeObject();
        range.startContainer = range.endContainer = $el[0];
        range.startOffset = range.endOffset = 0;
        Aloha.Selection.rangeObject = range;
        Aloha.trigger('aloha-selection-changed', range);
        return evt.stopPropagation();
      });
      editable.obj.find('.math-element').each(function() {
        var $span;
        makeCloseIcon(jQuery(this));
        $span = $(this);
        if (!$span.next().is('.aloha-ephemera-wrapper')) {
          return $('<span class="aloha-ephemera-wrapper">&#160;</span>').insertAfter($span);
        }
      });
      editable.obj.on('click.matheditor', '.math-element-destroy', function(e) {
        var $el;
        jQuery(e.target).tooltip('destroy');
        $el = jQuery(e.target).closest('.math-element');
        $el.trigger('hide').tooltip('destroy').remove();
        return e.preventDefault();
      });
      if (jQuery.ui && jQuery.ui.tooltip) {
        return editable.obj.tooltip({
          items: ".math-element",
          content: function() {
            return 'Click anywhere in math to edit it';
          },
          template: TOOLTIP_TEMPLATE
        });
      } else {
        return editable.obj.tooltip({
          selector: '.math-element',
          placement: 'top',
          title: 'Click anywhere in math to edit it',
          trigger: 'hover',
          template: TOOLTIP_TEMPLATE
        });
      }
    });
    SELECTOR = '.math-element';
    return Popover.register({
      selector: SELECTOR,
      populator: buildEditor,
      placement: 'top',
      markerclass: 'math-popover'
    });
  });

}).call(this);
