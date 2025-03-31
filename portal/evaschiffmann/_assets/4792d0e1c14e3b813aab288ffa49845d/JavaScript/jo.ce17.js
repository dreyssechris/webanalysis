$(() => {
  var layout2 = $('.direct_layout_2').length;
  $('#joc17 li').mouseenter(function () {
    $('#joc17 li.active').removeClass('active');
    $(this).addClass('active');
    if (layout2) {
      $(this).parent().addClass('joHover');
    }
  });

  if (layout2) {
    $('#joc17 li').mouseleave(function () {
      $(this).removeClass('active');
      $(this).parent().removeClass('joHover');
    });
  }

  var $sl_sldier = $('.joSlickSlider');
  if ($sl_sldier.length) {
    var imgperslide = 1;
    var variableWidth = false;
    if ($sl_sldier.data('slidenum') && typeof $sl_sldier.data('slidenum') != 'undefined') imgperslide = parseInt($sl_sldier.data('slidenum'));
    if ($sl_sldier.data('variablewidth') && typeof $sl_sldier.data('variablewidth') != 'undefined') variableWidth = true;
    $sl_sldier.slick({
      dots: true,
      arrows: true,
      infinite: true,
      slidesToShow: imgperslide,
      variableWidth: variableWidth,
      autoplay: false,
      autoplaySpeed: 5000,
      nextArrow: '<button type="button" class="slick-next"><span class="carousel-control-next-icon"></span></button>',
      prevArrow: '<button type="button" class="slick-prev"><span class="carousel-control-prev-icon"></span></button>',
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            variableWidth: variableWidth
          }
        }
      ]
    });
  }

  $('.img-player-starter').click(function () {
    var $that = $(this);
    var id = $that.data('id');

    var $videobox = $('#c17-videobox-' + id);

    var $video = $that.find('video');
    if ($video.length || $videobox.length) {
      if ($videobox.length) {
        $videobox.fadeIn();
      } else {
        var $div = $('<div id="c17-videobox-' + id + '" class="c17-videobox"><div class="c17-videobox-content"><div class="c17-videobox-closer"></div><div class="embed-responsive embed-responsive-16by9"></div></div><div class="c17-videobox-overlay"></div></div>');
        $('body').append($div);
        $div.find('.c17-videobox-overlay').click(function () {
          $(this).parent().fadeOut();
          $video.trigger('pause');
        });
        $div.find('.c17-videobox-closer').click(function () {
          $(this).parent().parent().fadeOut();
          $video.trigger('pause');
        });
        $video.appendTo($div.find('.c17-videobox-content .embed-responsive'));
      }
    }
  });
});
