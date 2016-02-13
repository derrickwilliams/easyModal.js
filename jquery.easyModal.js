/**
* easyModal.js v1.3.2
* A minimal jQuery modal that works with your CSS.
* Author: Flavius Matis - http://flaviusmatis.github.com/
* URL: https://github.com/flaviusmatis/easyModal.js
*
* Copyright 2012, Flavius Matis
* Released under the MIT license.
* http://flaviusmatis.github.com/license.html
*/

/*jslint browser: true*/
/*global jQuery*/

// setting up debounce
(function (factory) {
  var FUNC_NAME = 'smartModalResize';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], (function fn($) {
      factory($, FUNC_NAME)
    }));
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'), FUNC_NAME);
  } else {
    // Browser globals
    factory(jQuery, FUNC_NAME);
  }
}(function($, sr){
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartModalResize
  $.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
}));

// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    function positionModal(options, $overlay, $modal) {
      var overlayZ = options.updateZIndexOnOpen ? options.zIndex() : parseInt($overlay.css('z-index'), 10),
          modalZ = overlayZ + 100;

      var windowWidth = $(window).width()

      var modalStyle = {
        'display' : 'block',
        'z-index': modalZ
      };

      $.extend(modalStyle, getPositionStyle(windowWidth));

      $overlay.css({'z-index': overlayZ, 'display': 'block'});

      $modal.css(modalStyle);

      if (options.onOpen && typeof options.onOpen === 'function') {
          // onOpen callback receives as argument the modal window
          options.onOpen($modal[0]);
      }
    }

    function getPositionStyle(windowWidth) {
      if (windowWidth <= 768)  {
        return {
          width: '100%',
          height: '100%',
          'min-height': '450px',
          top: 0, 
          left: 0, 
          bottom: 0, 
          right: 0,
        };
      }
      else {
        return {
          width: '600px',
          height: '630px',
          top: '25px',
          left: (windowWidth - 600) / 2
        };
      }
    }

    "use strict";
    var methods = {
        init: function (options) {

            var defaults = {
                top: 'auto',
                left: 'auto',
                autoOpen: false,
                overlayOpacity: 0.5,
                overlayColor: '#000',
                overlayClose: true,
                overlayParent: 'body',
                closeOnEscape: true,
                closeButtonClass: '.close',
                transitionIn: '',
                transitionOut: '',
                onOpen: false,
                onClose: false,
                zIndex: function () {
                    return (function (value) {
                        return value === -Infinity ? 0 : value + 1;
                    }(Math.max.apply(Math, $.makeArray($('*').map(function () {
                        return $(this).css('z-index');
                    }).filter(function () {
                        return $.isNumeric(this);
                    }).map(function () {
                        return parseInt(this, 10);
                    })))));
                },
                updateZIndexOnOpen: true,
                hasVariableWidth: false
            };

            options = $.extend(defaults, options);

            return this.each(function () {

                var o = options,
                    $overlay = $('<div class="lean-overlay"></div>'),
                    $modal = $(this);

                $overlay.css({
                    'display': 'none',
                    'position': 'fixed',
                    // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                    // because the value would be replaced when opening the modal.
                    'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex()),
                    'top': 0,
                    'left': 0,
                    'height': '100%',
                    'width': '100%',
                    'background': o.overlayColor,
                    'opacity': o.overlayOpacity,
                    'overflow-x': 'hidden'
                }).appendTo(o.overlayParent);

                $modal.css({
                    'display': 'none',
                    'position' : 'absolute',
                    overflow: 'auto',
                    // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                    // because the value would be replaced when opening the modal.
                    'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex() + 1)
                });

                $modal.bind('openModal', function () {
                  positionModal(o, $overlay, $modal);
                });

                $modal.bind('closeModal', function () {
                    if(o.transitionIn !== '' && o.transitionOut !== ''){
                        $modal.removeClass(o.transitionIn).addClass(o.transitionOut);
                        $modal.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                            $modal.css('display', 'none');
                            $overlay.css('display', 'none');
                        });
                    }
                    else {
                        $modal.css('display', 'none');
                        $overlay.css('display', 'none');
                    }
                    if (o.onClose && typeof o.onClose === 'function') {
                        // onClose callback receives as argument the modal window
                        o.onClose($modal[0]);
                    }
                });

                // Close on overlay click
                $overlay.click(function () {
                    if (o.overlayClose) {
                        $modal.trigger('closeModal');
                    }
                });

                $(document).keydown(function (e) {
                    // ESCAPE key pressed
                    if (o.closeOnEscape && e.keyCode === 27) {
                        $modal.trigger('closeModal');
                    }
                });

                $(window).smartModalResize(function(){
                  positionModal(o, $overlay, $modal);
                });

                // Close when button pressed
                $modal.on('click', o.closeButtonClass, function (e) {
                    $modal.trigger('closeModal');
                    e.preventDefault();
                });

                // Automatically open modal if option set
                if (o.autoOpen) {
                    $modal.trigger('openModal');
                }

            });

        }
    };

    $.fn.easyModal = function (method) {

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }

        $.error('Method ' + method + ' does not exist on jQuery.easyModal');

    };

}));