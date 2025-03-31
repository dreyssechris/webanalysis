$(() => {
    var mobile = $('#mobile-hidden').is(':hidden');

    var $collapsItems = $('.grid-layout-101 .collapse, .grid-layout-100 .collapse');
    $collapsItems.on('show.bs.collapse', function () {
        var $that = $(this);

        var $parent = $that.parent().parent().parent().parent().parent('.grid-collapse');

        var notId = '#' + $that.attr('id');

        if ($parent.length) {
            notId += ', #' + $parent.attr('id');
        }

        // $collapsItems.not(this).collapse('hide');
        $collapsItems.not(notId).collapse('hide');

        setTimeout(() => {
            $that.find('.joc17.direct_layout_4 .slider-text-block').each(function () {
                var height = $(this).height();

                if (height < 150) {
                    $(this).addClass('set');
                } else if (height > 150) {
                    $(this).addClass('tk');

                    $(this).click(function () {
                        $(this).toggleClass('active');
                    });
                }
            });
        }, 700);
    });

    // var lightbox = $('.gallery a').simpleLightbox({ /* options */ });

    var $zoom_lightbox = $('.frame-type-jocontent_c17.frame-layout-7 .lightbox-link, .frame-type-jocontent_c12.frame-layout-4 a[data-lightbox="lightbox"]');
    if ($zoom_lightbox.length) {
        $zoom_lightbox.removeAttr('data-lightbox').addClass('simple-lightbox');

        var gallery = new SimpleLightbox('.frame-type-jocontent_c12.frame-layout-4 .simple-lightbox', { maxZoom: 5 });
        gallery.on('shown.simplelightbox', function () {
            $('.sl-wrapper.simple-lightbox').append('<div class="sl-zoom-wrap"><button class="sl-zoom sl-zoom-out">-</button><button class="sl-zoom sl-zoom-in">+</button></div>');
        });

        var gallery2 = new SimpleLightbox('.frame-type-jocontent_c17.frame-layout-7 .simple-lightbox', { maxZoom: 5 });
        gallery2.on('shown.simplelightbox', function () {
            $('.sl-wrapper.simple-lightbox').append('<div class="sl-zoom-wrap"><button class="sl-zoom sl-zoom-out">-</button><button class="sl-zoom sl-zoom-in">+</button></div>');
        });
    }

    $('body').on('click', '.simple-lightbox .sl-zoom-out', function () {
        var $element = $('.simple-lightbox .sl-image');

        var width = Math.ceil(window.innerWidth / 2);
        var height = Math.ceil($element.offset().top) + Math.ceil(window.innerHeight / 2);

        var evt = new MouseEvent('mousewheel', { clientX: width, clientY: height });
        evt.delta = -120;

        $('.simple-lightbox .sl-image')[0].dispatchEvent(evt);
    });

    $('body').on('click', '.simple-lightbox .sl-zoom-in', function () {
        var $element = $('.simple-lightbox .sl-image');

        var width = Math.ceil(window.innerWidth / 2);
        var height = Math.ceil($element.offset().top) + Math.ceil(window.innerHeight / 2);

        var evt = new MouseEvent('mousewheel', { clientX: width, clientY: height });
        evt.delta = 120;

        $element[0].dispatchEvent(evt);
    });


    var $lightbox_link = $('.frame-type-jocontent_c17:not(.frame-layout-7) .joc17 .c17Carousel .lightbox-link');
    if ($lightbox_link.length) {
        $lightbox_link.filter(function () {
            var $that = $(this);
            var $parent = $that.parent();

            $that.removeAttr('data-lightbox');

            var $item = $parent.find('.carousel-caption table');
            if ($item.length) {
                $item.wrap('<div class="caption-info-text d-none" />');

                return true;
            } else {
                var $fullgallery = $that.closest('.carousel-inner');

                if (!$fullgallery.hasClass('galley-loaded')) {
                    $fullgallery.addClass('galley-loaded');
                    $fullgallery = $fullgallery.find('.lightbox-link');

                    $fullgallery.addClass('simple-lightbox');

                    // var gallery = new SimpleLightbox('.frame-type-jocontent_c17.frame-layout-7 .simple-lightbox', {maxZoom: 5});
                    var gallery = $fullgallery.simpleLightbox({ maxZoom: 5 });
                    gallery.on('shown.simplelightbox', function () {
                        $('.sl-wrapper.simple-lightbox').append('<div class="sl-zoom-wrap"><button class="sl-zoom sl-zoom-out">-</button><button class="sl-zoom sl-zoom-in">+</button></div>');
                    });
                }

                return false;
            }
        }).on('click', function (e) {
            e.preventDefault();

            var $that = $(this);
            var $parent = $that.parent();
            var $gp = $that.closest('.c17Carousel');

            var $gpp = $that.closest('.frame').parent();

            // frühere overlay schließen und entfernen
            var $overlay = $('.c-lightbox');
            if ($overlay.length && $overlay.data('target') == $gp.attr('id')) {
                $overlay.fadeOut(function () {
                    $(this).remove();
                    $gp.removeClass('active-show');
                });

                $('.c-lightbox-overlay').fadeOut(function () {
                    $(this).remove();
                });

                $gp.removeClass('active-show');

                return false;
            } else if ($overlay.length) {
                $overlay.remove();
                $('.c-lightbox-overlay').remove();
            }

            $gp.addClass('active-show');

            // overlay
            var $c_overlay = $('<div class="c-lightbox-overlay"></div>');
            $('body').append($c_overlay);
            // $div.css('top', window.pageYOffset + 'px');
            // $div.css('height', window.innerHeight + 'px');

            var $div = $('<div class="c-lightbox"></div>');

            $div.data('target', $gp.attr('id'));

            // overlay position
            $div.css('top', ($that.offset().top - 15) + 'px');
            $div.css('height', ($that.parent().height() + 30) + 'px');

            // overlay closer
            var $closer = $('<button class="c-lightbox-closer" title="Schließen"></button>');
            $closer.click(function () {
                $(this).parent().fadeOut(function () {
                    $(this).remove();
                    $gp.removeClass('active-show');
                });
                $('.c-lightbox-overlay').fadeOut(function () {
                    $(this).remove();
                });
            });
            $div.append($closer);

            // overlay prev next
            if ($gp.find('.carousel-indicators li').length > 1) {
                var target = $gp.find('.c17Carousel');

                var $origprev = $gp.find('.carousel-control-prev');
                var $orignext = $gp.find('.carousel-control-next');

                var $indicator = $gp.find('.carousel-indicators li');

                var $prev = $('<button class="c-lightbox-prev" title></button>');
                var $next = $('<button class="c-lightbox-next"></button>');

                $prev.click(function () {
                    $origprev.trigger('click');

                    recalcBox();
                });

                $next.click(function () {
                    $orignext.trigger('click');

                    recalcBox();
                });

                $div.append($prev).append($next);

                $indicator.click(function () {
                    setTimeout(() => {
                        recalcBox();
                    }, 100);
                });

                function recalcBox() {
                    setTimeout(() => {
                        var $active = $gp.find('.carousel-item.active');
                        var $active_link = $active.find('.lightbox-link');

                        $div.css('top', ($active_link.offset().top - 15) + 'px');
                        $div.css('height', ($active_link.parent().height() + 30) + 'px');

                        $div.find('.caption-info-text').remove();

                        var $item = $active.find('.caption-info-text');
                        if ($item.length) {
                            var $itemclone = $item.clone();

                            if ($gpp.length && $gpp.hasClass('colnr-1')) {
                                $itemclone.css('margin-left', 'auto');
                            }

                            $div.append($itemclone.removeClass('d-none'));
                        }
                    }, 600);
                }
            }

            // overlay text
            var $item = $parent.find('.caption-info-text');
            if ($item.length) {
                var $itemclone = $item.clone();

                if ($gpp.length && $gpp.hasClass('colnr-1')) {
                    $itemclone.css('margin-left', 'auto');
                }

                $div.append($itemclone.removeClass('d-none'));
            }

            $('body').append($div);
        });

        $('.grid-layout-100 .grid-header, .grid-layout-101 .grid-header').click(function () {
            var $overlay = $('.c-lightbox');
            if ($overlay.length) {
                $overlay.remove();
                $('.c-lightbox-overlay').remove();
                $('.c17Carousel.active-show').removeClass('active-show');
            }
        });

        $(window).resize(function () {
            var $overlay = $('.c-lightbox');
            if ($overlay.length) {
                $overlay.remove();
                $('.c-lightbox-overlay').remove();
                $('.c17Carousel.active-show').removeClass('active-show');
            }
        });
    }

    var $footnote = $('.teiText [place="foot"]');
    if ($footnote.length) {
        var footnoteBlock = '<div class="tei-category footnote-label">Fußnoten (' + $footnote.length + ')</div><div class="tei-category-items">';

        $footnote.each(function (i, v) {
            var text = $(v).text();
            var num = i + 1;

            id = $(v).attr('xml:id');

            $(v).replaceWith('<span class="footnote-link" data-target="' + id + '" data-text="' + num + '"></span>');

            footnoteBlock += '<div data-id="' + id + '" class="teiItem">[' + num + '] ' + text + '</div>';
        });

        footnoteBlock += '</div>';

        $('.detailtext.right-side').append($(footnoteBlock));
    }


    var $slider = $('.frame-layout-7 .c17Carousel');
    if ($slider.length) {
        var $items = $slider.find('.item-block');
        //$items.removeClass('h-100');
        var height = 0;
        $items.each(function () {
            var $desc = $(this).find('.link_and_description');
            if ($desc.length) {
                var desc_height = $desc.height() + 18;

                $desc.prev().css('height', 'calc(100% - ' + desc_height + 'px');
            }

            var tmp = $(this).height();

            if (tmp > height) height = tmp;
        });

        $slider[0].style.setProperty('height', height + 'px', 'important');
    }

    var $tei_anchor = $('.joDetail .tei_anchor');
    if ($tei_anchor.length) {
        /*
        $tei_anchor.click(function() {
            $(this).find('.joTeiAfterPopover').trigger('click');
        });
        */
    }


    var $mapDing = $('#joMaps-container');
    if ($mapDing.length) {
        setTimeout(() => {
            var $attrB = $mapDing.find('.ol-attribution');
            $attrB.find('ul').html('<li>Historische Karte: Stadtarchiv Gotha, 4.1.1.-112, O. Hülsemann: Plan der Herzoglichen Residenzstadt Gotha, herausgegeben vom Stadtbauamt, 1912-1913.</li>');
            $attrB.show();

            $('#map-list .map-item-header').click(function () {
                var map = $('#ol4-mapdiv').data('map');
                var $that = $(this);
                if ($that.parent().hasClass('active')) {
                    var id = $that.data('id');

                    if (typeof id != 'undefined') {
                        $.each(clusters, function (i, clu) {
                            var tmpChild;
                            var ready = false;
                            $.each(clu.getSource().getFeatures(), function (i, val) {
                                $.each(val.get('features'), function (j, jval) {
                                    if (id == jval.getId()) {
                                        tmpChild = jval;
                                        return false;
                                    }
                                });

                                if (tmpChild) {
                                    map.getView().fit(tmpChild.getGeometry().getExtent(), { duration: 1000, maxZoom: 14, padding: [35, 35, 35, 35] });
                                }
                            });

                            if (ready) {
                                return false;
                            }
                        });
                    }
                }
            });
        }, 400);
    }
});
