/*
Name:      Dropdown Menu
Use with:  jQuery
Version:   1.0.1 (25.09.2009)
Author:    Grigory Zarubin (Shogo.RU)


Активирует всплывающее меню:
$.menu(
  '.popup',   // выборка узлов, для которых активируется меню (обязательный параметр)
  {
    mask     : '_content', // маска для связи id главного и всплывающего элемента (например, 'popup_0' и 'popup_0_content')
    position : false,      // позиционирование меню (подробней в методе $.menu.showpos)
    effect   : 'fast',     // скорость анимации (false, 'fast', 'normal', 'slow')
  }
);

Позиционирует узел относительно другого и показывает его:
$.menu.showpos(
  'popup_0',         // id узла (обязательный параметр)
  'popup_0_content', // id позиционируемого узла (обязательный параметр)
  'top left',        // позиционирование (строка свойств, разделенных пробелами), доступны:
                        top - над узлом,
                        bottom - под узлом,
                        left - слева от узла,
                        right - справа от узла,
                        по умолчанию - позиционируется под узлом, если всё влезает в пределы экрана.
  'fast',            // скорость анимации (false, 'fast', 'normal', 'slow')
  function() {}      // callback-функция, вызываемая после анимациии и/или показа узла
);
*/

;(function($) {
  $.menu = function(elems, options) {
    var opts = $.extend({}, $.menu.defaults, options), popups = [];
    if(!elems) return;

    // Функция убивает все работающие анимации и принудительно скрывает элементы
    var $hide = function() {
      for(var i=0; i<popups.length; i++) {
        var el = $(popups[i]);
        if(el.data('animated')) {
          $(el).stop(true, true);
          $(el).hide();
        }
      }      
    };

    $(elems).each(function() {
      var bid = $(this).attr('id');
      if(!bid) return true;

      var targel = '#' + bid + opts.mask;
      popups.push(targel);
      $(this).hover(
        function() {
          $hide();
          if(opts.effect) $(targel).data('animated', 'true');
          $.menu.showpos(this, $(targel), opts.position, opts.effect, function() {
            if(opts.effect) $(targel).removeData('animated');
          });
        },
        function(e) {
          $hide();
          if($(e.relatedTarget).parents(targel).length!=0) return;
          $(targel).hide();
        }
      );

      $(targel).mouseleave(
        function(e) {
          if($(e.relatedTarget).parents('#'+bid).length!=0) return;
          $(this).hide();
        }
      );
    });
  };

  // Позиционирует элемент относительно другого и показывает его
  $.menu.showpos = function(src, targ, position, effect, callback) {
    if(!src || !targ) return false;
    var src    = typeof src=='string' ? $('#'+src) : $(src),
        targ   = typeof targ=='string' ? $('#'+targ) : $(targ),
        coords = src.offset(), tw = targ.width(), th = targ.height(), sw = src.width(), sh = src.height();

    if(position && typeof position=='string') {
      targ.css({
        'top'  : coords.top,
        'left' : coords.left
      });
      var pAr = position.split(' ');
      for(var i=0; i<pAr.length; i++) {
        switch(pAr[i]) {
          case 'top':
            targ.css('top', coords.top - th);
          break;
          case 'bottom':
            targ.css('top', coords.top + sh);
          break;
          case 'left':
            targ.css('left', coords.left - tw);
          break;
          case 'right':
            targ.css('left', coords.left + sw);
          break;
        }
      }
    } else targ.css({
      'top'  : (coords.top + sh + th) > $(document).height() ? coords.top - th : coords.top + sh,
      'left' : (coords.left + tw) > $(window).width() ? coords.left - ($(window).width() - (coords.left + tw)) : coords.left
    });

    targ.show(effect, callback);
    return true;
  };

  $.menu.defaults = {
    mask     : '_content',
    position : false,
    effect   : 'fast'
  };
})(jQuery);
