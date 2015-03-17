/*
SUBJECT:    A nice little carousel, like when we we were kids v1.2
RELEASED:   06.12.2013
UPDATED:    10.12.2013
AUTHOR:     feddyups at Webatect Networks, on behalf of Tricky3 Web Mangling
EMAIL:      feddyups@gmail.com, rick@tricky3.co.uk
WEBSITE:    http://www.freelancer.com/u/feddyups.html
SUPPORT:    http://tricky3.co.uk/
*/
(function ($) {
  $.fn.carousel = function ($settings) {
    return this.each(function () {
      // Variables
      var settings = $.extend({
        layout: 'home',
        timerDuration: 5000,
        useSwipeGestures: true,
        useTimer: true
      },
      $settings
    );
    var self = this;
    var slides = [];
    var timer = 0;
    var current_slide = 0;
    var is_animating = false;
    var loading_bar_percent = 0;
    var loading_bar_timer = 0;
    // Constructor, pagination included anyway, as the load is insignificant. After all, we ARE on a giant's shoulders, aren't we?
    function constructor() {
      // get slides
      $(self).find('div.slides > div').each(function (index) {
        if (index !== 0) {
          $(this).hide();
        }
        slides.push(this);
      });
      $(self).find('.pagination a:eq(0)').addClass('active');
      $(self).find('.mobile-pagination a:eq(0)').addClass('active');
      // set tiling background-images on homepage, or set background color
      if (settings.layout == 'home') {
        for (var i = 0; i < slides.length; i++) {
          var image_src = $(slides[i]).find('img').prop('src');
          //var small_screen_src = $(slides[i]).find('a').data('smallscreen');
          var repeating_value = $(slides[i]).find('a').data('repeat');
          var smallscreen_deploy = $(slides[i]).find('a').attr('smallscreen');
          //getting the value as a string
          var repeating_bgcolor = $(slides[i]).find('a').attr("data-bgcolor");
          if ((repeating_bgcolor !== undefined) && (!repeating_value) && (repeating_bgcolor !== undefined)) {
            $(slides[i]).css({
              'background-color': repeating_bgcolor + ''
            });
          }
          if ((image_src !== undefined) && (repeating_value)) {
            $(slides[i]).css({
              'background-image': 'url(' + image_src + ')',
              'background-position': 'center',
              'background-repeat': 'repeat-x'
            });
            $(slides[i]).addClass("removebgformobiles");
          }
        }
        $(self).append('<div class="loading-bar"></div>');
      }
      // events
      $(self).find('.menu .next a').bind('click', next);
      $(self).find('.menu .prev a').bind('click', prev);
      $(self).find('.pagination a').bind('click', jump);
      $(self).find('.mobile-pagination a').bind('click', jump);
      // show
      $(self).show();
      // resize
      $(window).resize(function () {
        resize();
      });
      if ("onorientationchange" in window) {
        if (!window.addEventListener) {
          window.attachEvent("orientationchange", function () {
            resize();
          });
        } else {
          window.addEventListener("orientationchange", function () {
            resize();
          }, false);
        }
      }
      resize();
      // swipe gestures
      if (settings.useSwipeGestures) {
        $(self).find('div.slides').bind('swipeleft', next);
        $(self).find('div.slides').bind('swiperight', prev);
      }
      // timer
      changeSlideComplete(0);
    }
    // Change Slide
    function changeSlide($key) {
      if (!is_animating && current_slide !== $key) {
        clearTimeout(timer);
        is_animating = true;
        if (settings.layout == 'home') {
          var image_src = $(slides[$key]).find('img').data('src');
          /*if(image_src === undefined){
            image_src = $(slides[$key]).find('img').attr('src');
          }*/
          var repeating_value = $(slides[$key]).find('a').data('repeat');
          var smallscreen_deploy = $(slides[$key]).find('a').data('smallscreen');
          var repeating_bgcolor = $(slides[$key]).find('a').attr("data-bgcolor");
          if (image_src !== undefined && image_src !== false) {
            var image = new Image();
            preloaderStart();
            image.onload = function () {
              $(slides[$key]).find('img').prop('src', image_src).data('src', false);
              if ((repeating_bgcolor !== undefined) && (!repeating_value)) {
                //console.log('For further indexing');  
                $(slides[$key]).css({
                  'background-color': repeating_bgcolor + ''
                });
              }
              //Repeating Value Overrides the bgcolor set at all times
              if (repeating_value) {
                $(slides[$key]).css({
                  'background-image': 'url(' + image_src + ')',
                  'background-position': 'center',
                  'background-repeat': 'repeat-x'
                });
                $(slides[$key]).addClass("removebgformobiles");
              }
              animateInSlide($key);
              preloaderDone();
            }
            image.src = image_src;
            return;
          }
        }
        animateInSlide($key);
      }
    }

    function animateInSlide($key) {
      $(self).find('.pagination a.active').each(function () {
        $(this).removeClass('active');
      });
      $(self).find('.pagination a:eq(' + $key + ')').each(function () {
        $(this).addClass('active');
      });
      $(self).find('.mobile-pagination a.active').each(function () {
        $(this).removeClass('active');
      });
      $(self).find('.mobile-pagination a:eq(' + $key + ')').each(function () {
        $(this).addClass('active');
      });
      for (var i = 0; i < slides.length; i++) {
        if (i === $key) {
          $(slides[i]).fadeIn({
            complete: function () {
              changeSlideComplete($key);
            },
            duration: 800,
            easing: 'swing'
          });
        } else {
          $(slides[i]).fadeOut({
            duration: 800,
            easing: 'swing'
          });
        }
      }
    }

    function changeSlideComplete($key) {
      current_slide = $key;
      is_animating = false;
      if (settings.useTimer) {
        timer = setTimeout(function () {
          next();
        }, settings.timerDuration);
      }
    }
    // Click Events
    function jump() {
      var index = $(self).find('.pagination a').index(this);
      index = (index < 0) ? $(self).find('.mobile-pagination a').index(this) : index;
      if (index > -1) {
        changeSlide(index);
      }
      return false;
    }

    function next() {
      var index = current_slide + 1;
      index = (index >= slides.length) ? 0 : index;
      changeSlide(index);
      return false;
    }

    function prev() {
      var index = current_slide - 1;
      index = (index < 0) ? slides.length - 1 : index;
      changeSlide(index);
      return false;
    }
    // Resize
    function resize() {
      var win_width = $(window).width();
      var win_height = $(window).height();
      var img_width, img_height, img_ratio, img_unit;

      var theImgWidth       = $('#home_feature').data("normalwidth");
      var theImgHeight      = $('#home_feature').data("normalheight");
      var theMobileImgWidth = $('#home_feature').data("mobilewidth");
      var theMobileImgHeight = $('#home_feature').data("mobileheight");
      var theMobileImgWidthX2 = theMobileImgWidth/2;
      var theMobileImgHeightX2 = theMobileImgHeight/2;
      var inverseAspect = theImgHeight/theImgWidth;
      //console.log('inverseAspect '+inverseAspect);
      //console.log('theImgWidth '+theImgWidth);
      //console.log('theMobileImgWidthX2 '+theMobileImgWidthX2);
      //console.log('theImgWidth '+theImgWidth);
      //console.log('theMobileImgWidth '+theMobileImgWidth);
      //console.log('theMobileImgWidthX2 '+theMobileImgWidthX2);


      switch (settings.layout) {
        case 'home':
        //img_width = theImgWidth;
        //img_height = theImgHeight;
        //X2 images, mobile view
        if (win_width <= theMobileImgWidthX2) {
          img_width = theMobileImgWidthX2;
          img_height = theMobileImgHeightX2;
          img_width *= 1;
          img_height *= 1;
          var mobileHide = 'block';
          var desktopHide = 'none';
          //console.log('X2 for mobile: Img Width '+theMobileImgWidthX2+' Image Height: '+theMobileImgHeightX2);
          //Mobile View
        } else if ((win_width <= theMobileImgWidth) && (win_width > theMobileImgWidthX2)) {
          img_width = theMobileImgWidth;
          img_height = theMobileImgHeight;
          img_width *= 1;
          img_height *= 1;
          var mobileHide = 'block';
          var desktopHide = 'none';
          //console.log('mobile: Img Width '+theMobileImgWidth+' Image Height: '+theMobileImgHeight);
          //Between Mobile and Full Desktop View
        } else if ((win_width < theImgWidth) && (win_width > theMobileImgWidth)) {
          img_width = win_width;
          img_height = ((inverseAspect) * (win_width));
          img_width *= 1;
          img_height *= 1;
          var mobileHide = 'none';
          var desktopHide = 'block';
          //console.log('desktop small: Img Width '+img_width+' Image Height: '+img_height);
          //Higher than the image view
        }else if (win_width >= theImgWidth) {
          img_width = theImgWidth;
          img_height = theImgHeight;
          img_width *= 1;
          img_height *= 1;
          var mobileHide = 'none';
          var desktopHide = 'block';
          //console.log('desktop normal: Img Width '+img_width+' Image Height: '+img_height);
        }
         
        $(self).find('div.loading-bar').css({
          top: 0 // img_height - 3
        });
        $(self).find('div.slides').css({
          height: img_height
        });
        $(self).find('div.slides > div').css({
          width: '100%',
          height: img_height
        });
        $(self).find('div.slides > div > div').css({
          width: img_width,
          height: img_height,
          marginLeft: img_width * -0.5
        });


        $(self).find('div.slides > div > div > a img:nth-child(3)').css("display", mobileHide);
        $(self).find('div.slides > div > div > a img:nth-child(2)').css("display", desktopHide);
         
        break;
      }
    }

    // Progress Bar
    function preloaderStart() {
      loading_bar_percent = 0;
      $(self).find('div.loading-bar').css({
        width: '0%'
      }).show();
      preloaderNext();
    }

    function preloaderNext() {
      clearTimeout(loading_bar_timer);
      loading_bar_percent += 8;
      if (loading_bar_percent < 100) {
        $(self).find('div.loading-bar').css({
          width: loading_bar_percent + '%'
        });
        loading_bar_timer = setTimeout(function () {
          preloaderNext();
        }, 500);
      }
    }

    function preloaderDone() {
      clearTimeout(loading_bar_timer);
      loading_bar_percent = 100;
      $(self).find('div.loading-bar').css({
        width: loading_bar_percent + '%'
      }).delay(500).fadeOut();
    }
    // Init
    constructor();
  });
};
})(jQuery);