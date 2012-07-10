// Prepare demo page
google.load('jquery', '1');
google.setOnLoadCallback(function() {
  $('.navi a').on('click', function(e) {
    e.preventDefault();
    $('html').animate({
      scrollTop: $('#' + $(this).attr('rel')).offset().top
    }, 'fast');
  });
});