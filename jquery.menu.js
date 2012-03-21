/*
Name:      Dropdown Menu
Use with:  jQuery
Version:   1.0.1 (25.09.2009)
Author:    Grigory Zarubin (Shogo.RU)


���������� ����������� ����:
$.menu(
  '.popup',   // ������� �����, ��� ������� ������������ ���� (������������ ��������)
  {
    mask     : '_content', // ����� ��� ����� id �������� � ������������ �������� (��������, 'popup_0' � 'popup_0_content')
    position : false,      // ���������������� ���� (��������� � ������ $.menu.showpos)
    effect   : 'fast',     // �������� �������� (false, 'fast', 'normal', 'slow')
  }
);

������������� ���� ������������ ������� � ���������� ���:
$.menu.showpos(
  'popup_0',         // id ���� (������������ ��������)
  'popup_0_content', // id ���������������� ���� (������������ ��������)
  'top left',        // ���������������� (������ �������, ����������� ���������), ��������:
                        top - ��� �����,
                        bottom - ��� �����,
                        left - ����� �� ����,
                        right - ������ �� ����,
                        �� ��������� - ��������������� ��� �����, ���� �� ������� � ������� ������.
  'fast',            // �������� �������� (false, 'fast', 'normal', 'slow')
  function() {}      // callback-�������, ���������� ����� ��������� �/��� ������ ����
);
*/

;(function($) {
  $.menu = function(elems, options) {
    var opts = $.extend({}, $.menu.defaults, options), popups = [];
    if(!elems) return;

    // ������� ������� ��� ���������� �������� � ������������� �������� ��������
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

  // ������������� ������� ������������ ������� � ���������� ���
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
