/*
Name:      Dropdown Menu
Use with:  jQuery
Version:   1.0.2 (21.06.2010)
Author:    Grigory Zarubin (Shogo.RU)


���������� ����������� ����:
$.menu(
  '.popup',   // ������� �����, ��� ������� ������������ ���� (������������ ��������)
  {
    mask     : '_content', // ����� ��� ����� id �������� � ������������ �������� (��������, 'popup_0' � 'popup_0_content')
    position : false,      // ���������������� ���� (��������� � ������ $.showpos)
    effect   : 'fast',     // �������� �������� (false, 'fast', 'normal', 'slow')
  },
  show_prepare(el),        // �������, ���������� ����� ������� ������ ����, �������� ���������� �������, �� ������� ��������� ������� hover
  hide_callback()          // �������, ���������� ����� ��������
);

������������� ���� ������������ ������� � ���������� ���:
$.showpos(
  'popup_0',         // id ���� (������������ ��������)
  'popup_0_content', // id ���������������� ���� (������������ ��������)
  'top left',        // ���������������� (������ �������, ����������� ���������), ��������:
                        top - ��� �����,
                        bottom - ��� �����,
                        inherit - �� ����� ������ �� ������,
                        left - ����� �� ����,
                        right - ������ �� ����,
                        �� ��������� - ��������������� ��� �����, ���� �� ������� � ������� ������.
  'fast',            // �������� �������� (false, 'fast', 'normal', 'slow')
  function() {}      // callback-�������, ���������� ����� ��������� �/��� ������ ����
);
*/

;(function($) {
  $.menu = function(elems, options, show_prepare, hide_callback) {
    var opts = $.extend({}, $.menu.defaults, options), popups = [];
    if(!elems) return;

    // ������� ������� ��� ���������� �������� � ������������� �������� ��������
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

  // ������������� ������� ������������ ������� � ���������� ���
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