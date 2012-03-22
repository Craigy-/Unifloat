/*
Name:      Dropdown Menu
Use with:  jQuery
Version:   1.0.2 (21.06.2010)
Author:    Grigory Zarubin (Shogo.RU)


јктивирует всплывающее меню:
$.menu(
  '.popup',   // выборка узлов, дл€ которых активируетс€ меню (об€зательный параметр)
  {
    mask     : '_content', // маска дл€ св€зи id главного и всплывающего элемента (например, 'popup_0' и 'popup_0_content')
    position : false,      // позиционирование меню (подробней в методе $.showpos)
    effect   : 'fast',     // скорость анимации (false, 'fast', 'normal', 'slow')
  },
  show_prepare(el),        // функци€, вызываема€ перед началом показа меню, получает параметром элемент, на котором произошло событие hover
  hide_callback()          // функци€, вызываема€ после анимации
);

ѕозиционирует узел относительно другого и показывает его:
$.showpos(
  'popup_0',         // id узла (об€зательный параметр)
  'popup_0_content', // id позиционируемого узла (об€зательный параметр)
  'top left',        // позиционирование (строка свойств, разделенных пробелами), доступны:
                        top - над узлом,
                        bottom - под узлом,
                        inherit - на одном уровне по высоте,
                        left - слева от узла,
                        right - справа от узла,
                        по умолчанию - позиционируетс€ под узлом, если всЄ влезает в пределы экрана.
  'fast',            // скорость анимации (false, 'fast', 'normal', 'slow')
  function() {}      // callback-функци€, вызываема€ после анимациии и/или показа узла
);
*/

;(function($) {
  $.menu = function(elems, options, show_prepare, hide_callback) {
    var opts = $.extend({}, $.menu.defaults, options), popups = [];
    if(!elems) return;

    // ‘ункци€ убивает все работающие анимации и принудительно скрывает элементы
    var $hide = function() {
      for(var i=0,l=popups.length; i<l; i++) {
        var el = $(popups[i]);
        if(el.data('animating')) {
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
          if(show_prepare) show_prepare($(this));
          if(opts.effect) $(targel).data('animating', 'true');
          $.showpos(this, $(targel), opts.position, opts.effect, function() {
            if(opts.effect) $(targel).removeData('animating');
          });
        },
        function(e) {
          $hide();
          if($(e.relatedTarget).parents(targel).length!=0) return;
          $(targel).hide();
          if(hide_callback) hide_callback();
        }
      );

      $(targel).mouseleave(
        function(e) {
          if($(e.relatedTarget).parents('#'+bid).length!=0) return;
          $(this).hide();
          if(hide_callback) hide_callback();
        }
      );
    });
  };

  // ѕозиционирует элемент относительно другого и показывает его
  $.showpos = function(src, targ, position, effect, callback) {
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
      for(var i=0,l=pAr.length; i<l; i++) {
        switch(pAr[i]) {
          case 'top':
            targ.css('top', coords.top - th);
          break;
          case 'bottom':
            targ.css('top', coords.top + sh);
          break;
          case 'inherit':
            targ.css('top', coords.top);
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