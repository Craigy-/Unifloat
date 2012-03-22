/*
Name:      Dropdown Menu
Use with:  jQuery
Version:   2.2.3 (07.02.2012)
Author:    Grigory Zarubin (Shogo.RU)


Создаёт систему всплывающих элементов:
$.menu(
  '.popup',                         // выборка узлов, для которых активируется меню (обязательный параметр)
  {
    mask          : '_content',     // маска для связи id главного и всплывающего элемента (например, 'popup_0' и 'popup_0_content')
    posTop        :                 // позиционирование меню (подробное описание в методе $.pos)
      { value : 'under',
        auto  : 'above' },
    posLeft       :
      { value : 'left',
        auto  : 'right' },
    move          : [15, 15],       // включает движение всплывающих элементов вслед за мышью ([top, left] - задаёт смещение от курсора, по умолчанию по 15 пикселей вправо-вниз)
    effect        : 'fast',         // скорость анимации (false, 'fast', 'normal', 'slow')
    manipulation  : true,           // делает всплывающие узлы прямыми потомками body, чтобы не зависеть от вёрстки 
    show_prepare  : function(el),   // функция, вызываемая перед началом показа меню
    show_ready    : function(el),   // функция, вызываемая после полного показа меню с учётом времени анимации
    hide_callback : function(el)    // функция, вызываемая после исчезновения меню
                                       (все коллбэки получают параметром элемент, на котором произошло событие hover)
  },
);

Вычисляет координаты указанного узла относительно другого:
$.pos(
  'popup_0',            // id узла (обязательный параметр)
  'popup_0_content',    // id позиционируемого узла (обязательный параметр)
  { value : 'under',    // верхняя координата позиционируемого блока
    auto  : 'above' },
  { value : 'left',     // левая координата позиционируемого блока
    auto  : 'right' },

                        Оба параметра представляют собой хэши следующего вида:
                        {
                          value : %%выражение%%,
                          auto  : %%выражение%%
                        }, где
                           value - выражение, определяющее координату,
                           auto  - выражение, определяющее альтернативную координату (в случае, если элемент не помещается в пределы окна браузера),
                                   (значение false выключает проверку),
                           %%выражение%% -
                                   строка вида 'under + 10 - %%THISHEIGHT%% / 2'
                                               (означает: под источником + 10 пикселей - половина высоты элемента)
                                   в которой первое слово вычисляется автоматически в соответствие со списком:

                                   для posTop:
                                   above  - над источником
                                   top    - верх совпадает с верхом источника
                                   center - верх совпадает с центром источника
                                   bottom - низ совпадает с низом источника
                                   under  - под источником

                                   для posLeft:
                                   before - перед источником
                                   left   - левый край совпадает с левым краем источника
                                   center - левый край совпадает с центром источника
                                   right  - правый край совпадает с правым краем источника
                                   after  - после источника,

                                   а остальная часть представляет собой математическую формулу с любым числом действий,
                                   в которой можно также использовать следующие ключевые слова:
                                   %%SOURCEWIDTH%%    - ширина источника,
                                   %%SOURCEHEIGHT%%   - высота источника,
                                   %%THISWIDTH%%      - ширина позиционируемого элемента,
                                   %%THISHEIGHT%%     - высота позиционируемого элемента,
                                   %%WINDOWWIDTH%%    - ширина окна браузера,
                                   %%WINDOWHEIGHT%%   - высота окна браузера,
                                   %%DOCUMENTWIDTH%%  - ширина всего документа,
                                   %%DOCUMENTHEIGHT%% - высота всего документа.

                                   Учтите, что первое слово может быть только одно, а формула - не обязательна!

  false                 // флаг, определяющий подсчёт координат позиционируемого узла (false - относительно документа, true - относительно родителя)
);

Позиционирует скрытый узел относительно другого и показывает его:
$.showpos(
  'popup_0',            // id узла (обязательный параметр)
  'popup_0_content',    // id позиционируемого узла (обязательный параметр)
  { value : 'under',    // позиционирование узла (подробное описание в методе $.pos)
    auto  : 'above' },
  { value : 'left',
    auto  : 'right' },
  false,                // флаг, определяющий подсчёт координат позиционируемого узла (false - относительно документа, true - относительно родителя)
  'fast',               // скорость анимации (false, 'fast', 'normal', 'slow')
  function() {}         // callback-функция, вызываемая после анимации и/или показа узла
);
*/

;(function($) {
  $.menu = function(elems, options) {
    if(!elems) return;
    var opts = $.extend(true, {}, $.menu.defaults, options), popups = [];

    // Принудительно скрывает все элементы, которые ещё анимируются
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
      if(opts.manipulation) $('body').append($(targel));
      popups.push(targel);

      if(opts.move) {
        var mouseCoords = function(event) { // возвращает координаты относительно мышиного курсора с заданным смещением
          var x = event.pageX + (opts.move[1] || 15), y = event.pageY + (opts.move[0] || 15),
              tw = $(targel).outerWidth(), th = $(targel).outerHeight();
          return {
            'top'  : (y + th) > ($(window).height() + $(document).scrollTop()) ? y - th : y,
            'left' : (x + tw) > ($(window).width() + $(document).scrollLeft()) ? x - tw : x
          };
        };
      }

      $(this).hover(
        function(e) {
          if($(targel).data('animating')) return;
          $hide();
          opts.show_prepare($(this));
          if(opts.effect) $(targel).data('animating', 'true');
          var afterAnim = function() {
            if(opts.move) $(targel).css(mouseCoords(e));
            if(opts.effect) $(targel).removeData('animating');
            opts.show_ready($('#'+bid));
          };

          if(opts.move) {
            $(targel).css(mouseCoords(e)).show(opts.effect, afterAnim);
            if(!opts.effect) afterAnim();
          } else {
            $.showpos(this, $(targel), opts.posTop, opts.posLeft, !opts.manipulation, opts.effect, afterAnim);
          }
        },
        function(e) {
          var check = ($(e.relatedTarget).attr('id') && '#'+$(e.relatedTarget).attr('id')==targel) || $(e.relatedTarget).parents(targel).length!=0;
          if(check) return;
          $(targel).hide();
          $hide();
          opts.hide_callback($(this));
        }
      );

      if(opts.move) {
        $(this).mousemove(function(e) {
          if(!$(targel).data('animating')) $(targel).css(mouseCoords(e));
        });
      }

      $(targel).mouseleave(function(e) {
        if($(e.relatedTarget).parents('#'+bid).length!=0) return;
        $(this).hide();
        opts.hide_callback($('#'+bid));
      });
    });
  };

  $.pos = function(src, targ, posTop, posLeft, relative) {
    if(!src || !targ) return false;
    var src    = typeof src=='string' ? $('#'+src) : $(src),
        targ   = typeof targ=='string' ? $('#'+targ) : $(targ),
        coords = relative ? src.position() : src.offset(), tw = targ.outerWidth(), th = targ.outerHeight(), sw = src.outerWidth(), sh = src.outerHeight();

    var countValue = function(str, sideTop) { // парсим и считаем значение выражения в пикселях
      var aliasTop = {
        'above'  : coords.top - th,
        'top'    : coords.top,
        'center' : coords.top + sh / 2,
        'bottom' : coords.top + sh - th,
        'under'  : coords.top + sh
      }, aliasLeft = {
        'before' : coords.left - tw,
        'left'   : coords.left,
        'center' : coords.left + sw / 2,
        'right'  : coords.left + sw - tw,
        'after'  : coords.left + sw
      }, templates = {
        '%%SOURCEWIDTH%%'    : sw,
        '%%SOURCEHEIGHT%%'   : sh,
        '%%THISWIDTH%%'      : tw,
        '%%THISHEIGHT%%'     : th,
        '%%WINDOWWIDTH%%'    : $(window).width(),
        '%%WINDOWHEIGHT%%'   : $(window).height(),
        '%%DOCUMENTWIDTH%%'  : $(document).width(),
        '%%DOCUMENTHEIGHT%%' : $(document).height()
      }, keys = [];

      for(var i in sideTop ? aliasTop : aliasLeft) keys.push(i);
      var re = new RegExp('^.*(' + keys.join('|') + ')(.*)$', 'i');
      var parsed = re.exec(str);

      return eval('(' + (sideTop ? aliasTop : aliasLeft)[parsed[1]] + parsed[2].replace(/(%%[A-Z]+%%)/g, function($0) { return templates[$0]; }) + ')');
    };

    var tt = countValue(posTop.value, true), tl = countValue(posLeft.value);
    return {
      'top'  : posTop.auto ? ((tt + th) > ($(window).height() + $(document).scrollTop()) ? countValue(posTop.auto, true) : tt) : tt,
      'left' : posLeft.auto ? ((tl + tw) > ($(window).width() + $(document).scrollLeft()) ? countValue(posLeft.auto) : tl) : tl
    };
  };

  $.showpos = function(src, targ, posTop, posLeft, relative, effect, callback) {
    var coords = $.pos(src, targ, posTop, posLeft, relative);
    if(!coords) return false;

    (typeof targ=='string' ? $('#'+targ) : $(targ)).css(coords).show(effect, callback);
    if(!effect && callback) callback();

    return true;
  };

  $.menu.defaults = {
    mask          : '_content',
    posTop        : {
      value : 'under',
      auto  : 'above'
    },
    posLeft       : {
      value : 'left',
      auto  : 'right'
    },
    move          : false,
    effect        : 'fast',
    manipulation  : true,
    show_prepare  : $.noop,
    show_ready    : $.noop,
    hide_callback : $.noop
  };
})(jQuery);