define [ "aloha", "jquery", "css!bubble/css/bubble.css" ], (Aloha, jQuery) ->

  
  #############  The bubble pseudo code follows #############
  # Here's the flow cases to consider:
  # - User moves over a link and then moves it away (no popup)
  # - User hovers over a link causing a bubble and then moves it away (delayed close to handle next case)
  # - User hovers over a link causing a bubble and then moves it over the bubble
  # - User moves over a link and then clicks inside it (bubble disappears when selection changes)
  
  
  canvas = jQuery('body') # Where these bubbles get appended
  MILLISECS = 2000

  # For now only one popup box on the page.
  localBubble = null
  openTimeout = null # Scoped here because it's set in 'mouseenter' and used in 'mouseleave'
  closeTimeout = null

  makeBubble = (el, displayer, placement, force=false) ->
    # placement = {
    #   vertical: 'below/above'    # 'above'  requires rendering the displayer 1st
    #   horizontal: 'start/center' # 'center' requires rendering the displayer 1st
    placement.vertical   = placement.vertical   or 'below'
    placement.horizontal = placement.horizontal or 'start'
    $el = jQuery(el)
    # Either use the existing $bubble (attached to the element) or create a new one
    
    if not $el.data('aloha-bubble-el')
      $el.data('aloha-bubble-el', jQuery('<div class="bubble"></div>'))

    $bubble = $el.data('aloha-bubble-el')
    $bubble.contents().remove()
    $bubble.appendTo(canvas)
    
    displayer($el, $bubble)
  
    # Move the bubble
    offset = $el.offset()
    offset.position = 'absolute'
    switch placement.vertical
      when 'below' then offset.top = offset.top + $el.outerHeight()
      when 'above' then offset.top = offset.top - $bubble.outerHeight()
      else console.error 'Invalid vertical placement'
    switch placement.horizontal
      when 'start' then
      when 'center'
        if $el.outerWidth() > $bubble.outerWidth()
          offset.left = offset.left + ($el.outerWidth() - $bubble.outerWidth()) / 2
      else console.error 'Invalid horizontal placement'
  
    $bubble.css(offset)
    
    $bubble.on 'mouseenter', () ->
    clearTimeout($el.data('aloha-bubble-closeTimer'))
    if not $el.data('aloha-bubble-clicked')
      $bubble.on 'mouseleave', () ->
        jQuery(@).remove()


  class Bubbler
    constructor: (@displayer, $nodes=null, @placement={vertical:'below',horizontal:'start'}) ->
      @applyTo($nodes) if $nodes?
      
    setPlacement: (vertical='below', horizontal='start') ->
      @placement.vertical = vertical
      @placement.horizontal = horizontal
    
    applyTo: ($nodes) ->
      that = @
      
      # Custom event to open the bubble used by setTimeout below
      $nodes.on 'open', (evt, force) ->
        $el = jQuery(@)
        clearTimeout($el.data('aloha-bubble-openTimer'))
        makeBubble(@, that.displayer, that.placement)
        if force
          $el.data('aloha-bubble-clicked', true)
            
      $nodes.on 'close', () ->
        $el = jQuery(@)
        $el.data('aloha-bubble-clicked', false)
        $bubble = $el.data('aloha-bubble-el')
        $bubble.remove() if $bubble

      
      delayTimeout = (self, eventName, ms=MILLISECS) ->
        return setTimeout(() ->
          jQuery(self).trigger(eventName)
        , ms)
        
      $nodes.on 'mouseenter', (evt) ->
        $el = jQuery(@)
        $el.data('aloha-bubble-openTimer', delayTimeout(@, 'open'))
        $el.one 'mouseleave', () ->
          clearTimeout($el.data('aloha-bubble-openTimer'))
          if not $el.data('aloha-bubble-clicked')
            $el.data('aloha-bubble-closeTimer', delayTimeout(@, 'close', MILLISECS / 2))
      
      # TODO: Aloha.bind 'selection-changed??', close bubble if tag changed not always
      Aloha.bind 'aloha-selection-changed', (event, rangeObject) ->
        if that.originalRange
          origEl = that.originalRange.getCommonAncestorContainer()
          if origEl != rangeObject.getCommonAncestorContainer()
            $orig = jQuery(origEl)
            $orig.data('aloha-bubble-el')
            $orig.trigger('close')
        
        that.originalRange = rangeObject
      

  return Bubbler