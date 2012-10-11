google.load('jquery', '1');
google.setOnLoadCallback(function() {

  // Prepare Demo Page
  var navis = $('.navi a');
  navis.on('click', function(e) {
    e.preventDefault();
    var self = this;
    $($.browser.webkit ? document.body : 'html').animate({
      scrollTop: $('#' + $(this).attr('href').replace(/^(.*#)/, '')).offset().top
    }, 'fast', function() {
      navis.removeClass('active');
      $(self).addClass('active');
    });
  });

  // Examples
});