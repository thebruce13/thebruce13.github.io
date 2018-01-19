(function ($) {
    $(document).foundation();

    $(document).ready(function () {
        $('#rooms').slick({
            dots: false,
            infinite: true,
            speed: 300,
            slidesToShow: 4,
            slidesToScroll: 4,
            nextArrow: '<button class="slick-next-arrow" aria-label="Next rooms"><svg class="icon"><use xlink:href="#angle-right"></use></svg></button>',
            prevArrow: '<button class="slick-previous-arrow" aria-label="Previous rooms"><svg class="icon"><use xlink:href="#angle-left"></use></svg></button>',
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });
    });
    /*
     $(document).ready(function() {
     $("#arriveDt").datepicker();
     $("#departDt").datepicker();
     });

     function submitform() {
     if (!$("#arriveDt").val() || !$("#departDt").val()) {
     window.alert("Please enter a Start and End Date!");
     return false;
     }
     $('#resblock').submit();
     return false;
     }
     */
    // arriveDt
    // departDt
    /**
     * Initialize Pikaday datepickers.
     * @type {*}
     */
    /*
    var checkinEl = document.getElementById("arriveDt"),
        checkoutEl = document.getElementById("departDt"),
        checkinPika = pikadayResponsive(checkinEl, {
            format: 'M/DD/YYYY',
            pikadayOptions: {
                minDate: new Date
            }
        }),
        checkoutPika = pikadayResponsive(checkoutEl, {
            format: 'M/DD/YYYY',
            pikadayOptions: {
                minDate: new Date
            }
        });
*/
// Check checkoutdate
  /*
    $(checkinEl).on('change-date', function (e, date) {
        // If check out date is before check in date
        if (date.date.isAfter(checkoutPika.date)) {
            checkoutPika.setDate(date.date.add(1, 'day'));
        }

        // Set the min date for the checkout input.
        checkoutPika.pikaday.setMinDate(checkinPika.date.toDate());
    });

    $('.booking-accordion-title').click(function(){
        var title = $(this);
        var bar = $('.booking-bar');
        bar.slideToggle('fast', function () {
            bar.toggleClass('open');
            if (bar.hasClass('open')) {
                title.text('Close');
            } else {
                title.text('Book Now');
            }
        });
    });

*/
    $('.hero-slick').slick({
        nextArrow: '<button class="slick-next-arrow" aria-label="Next rooms"><svg class="icon"><use xlink:href="#angle-right"></use></svg></button>',
        prevArrow: '<button class="slick-previous-arrow" aria-label="Previous rooms"><svg class="icon"><use xlink:href="#angle-left"></use></svg></button>',
    });
})(jQuery);
