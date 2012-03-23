/*!
 * Unifloat
 * Universal plugin for simply creating floating elements such as Dropdown menus, Tooltips etc.
 *
 * @requires jQuery v1.4 or newer
 *
 * @author Grigory Zarubin (http://craigy.ru)
 * @link https://github.com/Craigy-/Unifloat
 * @version 2.2.7
 * @date 23.03.2012
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

/*
Создаёт систему всплывающих элементов:
$.unifloat(
  '.popup',                         // выборка узлов, для которых активируется плагин (обязательный параметр)
  {
    mask          : '_content',     // маска для получения id конкретного всплывающего элемента, по сути является постфиксом id главных элементов
                                       (например, '#popup_0_content' получен конкатенацией id главного элемента '#popup_0' и маски '_content');
                                       также допускается жёсткое указание id вместо маски - тогда только один этот элемент будет всплывать для всех узлов
    posTop        :                 // позиционирование элементов (подробное описание в методе $.pos)
      { value : 'under',
        auto  : 'above' },
    posLeft       :
      { value : 'left',
        auto  : 'right' },
    move          : [15, 15],       // включает движение всплывающих элементов вслед за мышью ([top, left] - задаёт смещение от курсора, по умолчанию по 15 пикселей вправо и вниз)
    effect        : 'fast',         // скорость анимации (false, 'fast', 'normal', 'slow' либо нужное число миллисекунд)
    manipulation  : true,           // делает всплывающие узлы прямыми потомками <body>, чтобы не зависеть от вёрстки 
    show_prepare  : function(el),   // функция, вызываемая перед началом показа всплывающего элемента
    show_ready    : function(el),   // функция, вызываемая после полного показа элемента с учётом времени анимации
    hide_callback : function(el)    // функция, вызываемая после исчезновения элемента
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
                           value - строковое выражение, определяющее координату,
                           auto  - строковое выражение, определяющее альтернативную координату (в случае, если элемент не помещается в пределы окна браузера),
                                   (значение false выключает проверку),
                           %%выражение%% -
                                   строка вида 'under + 10 - %%THISHEIGHT%% / 2'
                                               (означает: под источником + 10 пикселей - половина высоты элемента)
                                   в которой ключевое слово 'under' вычисляется автоматически в соответствие со списком:

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

                                   Поддерживаются все возможные варианты выражений (включая жёсткую установку координаты, формулы без ключевых слов,
                                   а также использование в одном выражении сразу нескольких ключевых слов).

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
  'fast',               // скорость анимации (false, 'fast', 'normal', 'slow' либо нужное число миллисекунд)
  function() {}         // коллбэк-функция, вызываемая после анимации и/или показа узла
);
*/

(function($) {
  $.unifloat = function(elems, options) {
    if(!elems) return;
    var opts = $.extend(true, {}, $.unifloat.defaults, options), popups = [];

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
      var bid = $(this).attr('id'), targel;
      if(!bid && !$(opts.mask).length) return true;
      if($(opts.mask).length) {
        targel = opts.mask;
      } else {
        targel = '#' + bid + opts.mask;
      }

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

      var self = this;
      $(this).hover(
        function(e) {
          if($(targel).data('animating')) return;
          $hide();
          opts.show_prepare($(this));
          if(opts.effect) $(targel).data('animating', 'true');
          var afterAnim = function() {
            if(opts.move) $(targel).css(mouseCoords(e));
            if(opts.effect) $(targel).removeData('animating');
            opts.show_ready($(self));
          };

          if(opts.move) {
            $(targel).css(mouseCoords(e)).show(opts.effect, afterAnim);
            if(!opts.effect) afterAnim();
          } else {
            $.showpos(this, $(targel), opts.posTop, opts.posLeft, !opts.manipulation, opts.effect, afterAnim);
          }
        },
        function(e) {
          if(($(e.relatedTarget).attr('id') && '#'+$(e.relatedTarget).attr('id')==targel) || $(e.relatedTarget).parents(targel).length!=0) return;
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
        var check = false;
        $(e.relatedTarget).parents().each(function() {
          if(this===self) check = true;
        });
        if(e.relatedTarget===self || check) return;
        $(this).hide();
        opts.hide_callback($(self));
      });
    });
  };

  $.pos = function(src, targ, posTop, posLeft, relative) {
    if(!src || !targ) return false;
    var src    = typeof src=='string' ? $('#'+src) : $(src),
        targ   = typeof targ=='string' ? $('#'+targ) : $(targ),
        coords = relative ? src.position() : src.offset(), tw = targ.width(), th = targ.height(), sw = src.width(), sh = src.height();

    var countValue = function(str, sideTop) { // парсим и считаем значение выражения в пикселях
      var aliasTop = {
        'above'  : coords.top - th,
        'top'    : coords.top,
        'center' : coords.top + sh / 2,
        'bottom' : coords.top + sh - th,
        'under'  : coords.top + sh
      },
      aliasLeft = {
        'before' : coords.left - tw,
        'left'   : coords.left,
        'center' : coords.left + sw / 2,
        'right'  : coords.left + sw - tw,
        'after'  : coords.left + sw
      },
      templates = {
        '%%SOURCEWIDTH%%'    : sw,
        '%%SOURCEHEIGHT%%'   : sh,
        '%%THISWIDTH%%'      : tw,
        '%%THISHEIGHT%%'     : th,
        '%%WINDOWWIDTH%%'    : $(window).width(),
        '%%WINDOWHEIGHT%%'   : $(window).height(),
        '%%DOCUMENTWIDTH%%'  : $(document).width(),
        '%%DOCUMENTHEIGHT%%' : $(document).height()
      },
      keys = [];

      for(var i in sideTop ? aliasTop : aliasLeft) keys.push(i);
      var parsed_aliases = new RegExp('(' + keys.join('|') + ')', 'g');
      var ns = str.replace(/(%%[A-Z]+%%)/g, function($0) {
        return templates[$0];
      }).replace(parsed_aliases, function($0) {
        return (sideTop ? aliasTop : aliasLeft)[$0];
      });

      return eval('(' + ns + ')');
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

  $.unifloat.defaults = {
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