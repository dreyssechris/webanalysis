$(document).ready(function () {
    var cssTitle = 'color: #f39200; font-size:60px; font-weight: bold; text-stroke: 1px black; -webkit-text-stroke: 1px black;';
    var cssDesc = 'font-size: 18px;';

    setTimeout(console.log.bind(console, '%cStop!', cssTitle), 0);
    setTimeout(console.log.bind(console, '%cThis is a browser feature intended for developers.', cssDesc), 0);


    function setCookie(cname, cvalue) {
        var d = new Date();
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    if (getCookie('cookieOk') == '') $('#cookie-teaser').show();
    cookieOkFn = () => {
        $('#cookie-teaser').fadeOut();
        setCookie('cookieOk', 1);
    }
    var cookieOk = $('#cookieOk');
    cookieOk.off('click', cookieOkFn);
    cookieOk.on('click', cookieOkFn);

    /*
    if (window.sessionStorage.getItem('cookieOk') === null) $('#cookie-teaser').show();
    cookieOkFn = () => {
        $('#cookie-teaser').fadeOut();
        window.sessionStorage.setItem('cookieOk', 1);
    }
    var cookieOk = $('#cookieOk');
    cookieOk.off('click', cookieOkFn);
    cookieOk.on('click', cookieOkFn);
    */

    var mobile = ($('#mobile-hidden').is(':visible')) ? false : true;

    $(window).resize(() => {
        mobile = ($('#mobile-hidden').is(':visible')) ? false : true;
        toogleHoverDir();
    });

    /**
     * Funktion zeigt Detail-Informationen zu den einzelnen Einträgen der linken Info-Box an
     * @all -> das sollte man irgendwie noch umstrukturieren - gehört nicht hierher, da es direkt auf das Laden der Details des alphabetischen Indexes referenziert
     */
    // var alphabetIndexTrigger = $('.joAlphabetIndex li a, .facetteview.alphabetic li a'); //  Link der den Index zündet
    var $ajaxloader = $('#joAjaxloader');

    errorFunc = () => {
        console.log('Detail konnte leider nicht geladen werden.');
        $ajaxloader.hide();
    }

    loadAjaxUrl = function (e) {
        e.preventDefault();
        $ajaxloader.show();
        var $resultContainer = $(this).closest('.joAlphabetIndex, .facetteview.alphabetic').next('.joFacettesContainer');     //  Container in den Das Resultat reingeladen werden soll

        var href = '';
        href = $(this).attr('href');

        if (typeof href != 'undefined' && href != '') {
            $.post(href, (data, suc) => {
                if (suc == 'success') {
                    $ajaxloader.hide();
                    $resultContainer.empty();
                    $data = $(data);
                    $data.hide();
                    $resultContainer.append($data);
                    if ($resultContainer.prev().hasClass('joAlphabetIndex')) {
                        $resultContainer.css('height', $data.height() + 'px');
                        $resultContainer.css('maxHeight', $data.height() + 'px');
                    }
                    $data.fadeIn('slow');
                }
            }).fail(errorFunc);
        } else {
            errorFunc();
        }

        $('.joAlphabetIndex li.active').removeClass('active');
        $(this).parent().addClass('active');
    }

    $('.image_overlay').click(function () {
        $(this).fadeOut();
    });

    $('body').on('click', '.joAlphabetIndex li a, .facetteview.alphabetic li a', loadAjaxUrl);

    $('.joFacettesContainer').on('click', '.joAjaxLoadNext', function (e) {
        e.preventDefault();
        var $that = $(this);
        var container = $that.parent().parent();
        if (container.next().length) {
            var height = container.next().height();
            container.animate({ top: '-=' + container.height() + 'px' }, 'slow');
            $that.closest('.joFacettesContainer').css('height', height + 'px');
            $that.closest('.joFacettesContainer').css('maxHeight', height + 'px');
            if (container.next().find('.joAjaxLoadNext').length == 1) {
                container.next().animate({ top: '-=' + height + 'px' }, 'slow');
            } else {
                container.next().animate({ top: '-=' + container.height() + 'px' }, 'slow');
            }
            $('body,html').animate({
                scrollTop: $('.joAlphabetIndex').offset().top
            }, 500);
        } else {
            $ajaxloader.show();
            var href = $that.attr('href');
            if (href) {
                $.post(href, function (data, suc) {
                    if (suc == 'success') {
                        $ajaxloader.hide();
                        $(data).hide();
                        container.after(data);
                        var height = container.next().height();

                        container.next().css('top', height + 'px');
                        $that.closest('.joFacettesContainer').css('height', height + 'px');
                        $that.closest('.joFacettesContainer').css('maxHeight', height + 'px');
                        $(data).show();

                        container.animate({ top: '-=' + container.height() + 'px' }, 'slow');
                        container.next().animate({ top: '-=' + height + 'px' }, 'slow');

                        $('body,html').animate({
                            scrollTop: $('.joAlphabetIndex').offset().top
                        }, 500);
                    }
                }).fail(errorFunc);
            } else {
                errorFunc();
            }
        }
    });

    $('.joFacettesContainer').on('click', '.joAjaxLoadPrev', function (e) {
        e.preventDefault();
        var $that = $(this);
        var container = $that.parent().parent();
        var height = container.prev().height();
        if (container.find('.joAjaxLoadNext').length == 1) {
            container.animate({ top: '+=' + container.height() + 'px' }, 'slow');
        } else {
            container.animate({ top: '+=' + height + 'px' }, 'slow');
        }

        $that.closest('.joFacettesContainer').css('height', height + 'px');
        $that.closest('.joFacettesContainer').css('maxHeight', height + 'px');
        container.prev().animate({ top: '+=' + height + 'px' }, 'slow');
    });

    $('.hover-effekt > li:not(.no-img)').hoverdir({ hoverElem: '.hover-effekt-text' });
    toogleHoverDir();

    var working = false;
    $('.tile_view_controls #joOption_1').click(function () {
        if (!working) {
            working = true;
            $(this).toggleClass('joActive');
            $(this).next().toggleClass('joActive');
            $('.hover-effekt > li:not(.no-img)').hoverdir('rebuild', { hoverElem: '.hover-effekt-text' });
            $('.hover-effekt').toggleClass('fixed');
            setTimeout(() => {
                working = false;
            }, 300);
        }
    });

    $('.tile_view_controls #joOption_2').click(function () {
        if (!working) {
            working = true;
            $(this).toggleClass('joActive');
            $(this).prev().toggleClass('joActive');
            //$('.hover-effekt > li:not(.no-img)').hoverdir('destroy');
            $('.hover-effekt > li:not(.no-img)').hoverdir('rebuild', { hoverElem: '.hover-effekt-text' });
            $('.hover-effekt').toggleClass('fixed');
            setTimeout(() => {
                working = false;
            }, 300);
        }
    });

    function toogleHoverDir() {
        if (mobile) {
            $('.hover-effekt > li:not(.no-img)').hoverdir('destroy');
        } else {
            $('.hover-effekt > li:not(.no-img)').hoverdir('rebuild', { hoverElem: '.hover-effekt-text' });
        }
    }
    $(".detail.control_button a").click((event) => {
        event.stopPropagation();
    });

    $('.grid-bookmark .link[data-href]').click(function (event) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = $(this).data('href');
    });

    $(".and_or_toggle input.joAndOrCheck").click(function (e) {
        $ajaxloader.show();
        $(this).closest('a')[0].click();
    });

    $(".true_or_false input.check").click(function (e) {
        $ajaxloader.show();
        $(this).prev('a')[0].click();
    });


    $(".img-other-container .img-other-item").click(function (e) {
        e.preventDefault();
        if (!working) {
            working = true;
            var _this = $(this);
            var container = _this.parent().prev('.image-embed-container');
            if (container.length) {
                var img = _this.find('.image-embed-item');
                if (img.length) {
                    var oldimg = container.find('.image-embed-item');
                    if (img !== oldimg) {
                        oldimg.parent().attr('href', img.parent().attr('href'));
                        oldimg.attr('src', img.attr('src')).attr('title', img.attr('title')).attr('alt', img.attr('alt'));
                        var oldtext = container.find('.img-main-text');
                        var text = _this.find('.img-other-item-text');
                        if (text.length) {
                            oldtext.html(text.html());
                            oldtext.show();
                        } else {
                            oldtext.hide();
                        }
                        setTimeout(() => {
                            working = false;
                        }, 200);
                    } else {
                        working = false;
                    }
                } else {
                    working = false;
                }
            } else {
                working = false;
            }
        }
    });

    $('body').on('click', '.joControls .c_button.active.show', function () {
        var that = $(this);
        setTimeout(() => {
            that.removeClass('active show');
            $(that.attr('href')).removeClass('active show');
            if (jQuery().niceScroll) $('.hierachical .items > ul').getNiceScroll().hide();
        }, 100);
    });

    var entityWorking = false;
    function nicescrollUpdate() {
        if (jQuery().niceScroll) {
            var sbar = $('#joMaps-container .joScrollWrap, .joDetail #sidebar .sidebar_wrap');
            if (sbar.length && !mobile && sbar.getNiceScroll()) {
                sbar.getNiceScroll().resize();
            }
        }
    }

    $('body').on('click', '.joEntityfacts', function (e) {
        e.preventDefault();
        if (!entityWorking) {
            entityWorking = true;

            var that = $(this);
            var el = that.siblings('.joEntityFactsContainer');

            if (that.hasClass('minus')) {
                that.removeClass('minus');
                el.slideUp(300);
                setTimeout(() => {
                    entityWorking = false;
                    nicescrollUpdate();
                }, 400);
            } else {
                if (el.is(':empty')) {
                    $ajaxloader.show();
                    $.when($.get(that.attr('href'))).then((data, status, jqXHR) => {
                        el.html(data);
                        $ajaxloader.hide();
                        that.addClass('minus');
                        el.slideDown(600);
                        setTimeout(() => {
                            entityWorking = false;
                            nicescrollUpdate();
                        }, 700);
                    }, (jqXHR, status, errorText) => {
                        console.log(jqXHR);
                        messageWriter(status + '<br>' + errorText + '<br>' + 'Upps, etwas ging schief. Bitte aktualisieren Sie die Seite und versuchen Sie es nochmal.');
                        $ajaxloader.hide();
                        entityWorking = false;
                        nicescrollUpdate();
                    });
                } else {
                    that.addClass('minus');
                    el.slideDown(300);
                    setTimeout(() => {
                        entityWorking = false;
                        nicescrollUpdate();
                    }, 400);
                }
            }
        }
    });

    messageWriter = function (message) {
        var container = $('.typo3-messages');
        if (container.length) {
            container.remove();
        }

        container = '<ul class="typo3-messages"><li class="alert alert-success"><p class="alert-message">' + message + '</p></li></ul>';
        $('body').append(container);
    }

    $('body').on('click', '.joRis', function (e) {
        var that = $(this);
        var el = that.next('.joRisContainer');

        if (that.hasClass('minus')) {
            that.removeClass('minus');
            el.slideUp(300);
        } else {
            that.addClass('minus');
            el.slideDown(300);
        }
    });

    $('body').on('click', '.joRisKopy', function (e) {
        var $that = $(this);
        $that.removeClass('success').removeClass('fail');
        var el = $that.parent().find('.joRisContainer');

        if (el && el.hasClass('with-external')) {
            el = el.children('a');
        }

        if (el) {
            var tmp = document.createElement('textarea');
            tmp.style.position = 'absolute';
            tmp.style.opacity = '0';
            tmp.value = el[0].innerHTML;
            document.body.appendChild(tmp);
            tmp.select();
            var status = document.execCommand('copy');
            document.body.removeChild(tmp);
            if (status) {
                $that.addClass('success');
            } else {
                $that.addClass('fail');
            }
        }
    });

    $('.joFixedPopover').popover({
        content: 'unsafe indication',
        placement: 'right'
    });

    $('*[data-toggle="collapse-next"]').click(function () {
        $(this).next().collapse('toggle');
        $(this).toggleClass('active');
    })

    $('body').on('click', '#popup .carousel-control-next', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).closest('.carousel').carousel('next');
    });

    $('body').on('click', '#popup .carousel-control-prev', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).closest('.carousel').carousel('prev');
    });

    $('body').on('click', '#popup .joIndicator-item', function (e) {
        e.stopPropagation();
        e.preventDefault();

        var $that = $(this);
        var num = $that.data('slide-to');
        $that.closest('.carousel').carousel(num);
        $that.parent().find('.active').removeClass('active');
        $that.addClass('active');
    });


    var $entryMaskProgress = $('.entrymask .progress .progress-bar');

    if ($entryMaskProgress.length) {
        var prgInterval;
        var $entryCarosel = $('#entrymask-carousel');

        var interval = parseInt($entryCarosel.data('interval'));

        var carousel = new bootstrap.Carousel($entryCarosel[0]);

        $entryCarosel.on('slide.bs.carousel', function (e) {
            slideFunc();
        });

        slideFunc();

        function slideFunc() {
            var i = 0;
            var max = interval / 50;

            $entryMaskProgress.css('width', '0%');
            clearInterval(prgInterval);

            carousel.pause();

            prgInterval = setInterval(function () {
                i++;

                var prz = (i * 50 * 100) / interval;

                $entryMaskProgress.css('width', prz + '%');
                $entryMaskProgress.attr('aria-valuenow', prz);

                if (i >= max) {
                    carousel.next();
                }
            }, 50);
        }
    }

    var info_items = [];
    function findInArrayByName(arr, img_name) {
        var returnArr = [];

        if (arr.length) {
            arr.forEach(function (v, i) {
                if (v.name == img_name) {
                    returnArr.push(v);
                }
            });
        }

        return returnArr;
    }

    function findInArrayByNotThisName(arr, img_name) {
        var returnArr = [];

        if (arr.length) {
            arr.forEach(function (v, i) {
                if (v.name !== img_name) {
                    returnArr.push(v);
                }
            });
        }

        return returnArr;
    }

    var $map_image = $('.map-image');
    var layer = [];
    var map_img = [];
    if ($map_image.length) {
        $map_image.each(function (i, v) {
            var $image_item = $(v);

            var $content = $('.map-image-info.new');
            var iiif_url = $image_item.data('iiif');
            var img_url = $image_item.data('img') + '?' + Date.now();
            var license = $image_item.data('lizenztext');

            if (typeof license == 'undefined' || license == '') {
                license = $image_item.data('lizenz');
            }

            map_img[i] = new ol.Map({
                target: $image_item[0],
            });

            $image_item.data('map', map_img[i]);

            if (typeof iiif_url != 'undefined' && iiif_url) {
                fetch(iiif_url).then(function (response) {
                    response.json().then(function (imageInfo) {
                        // build iiif image
                        layer[i] = new ol.layer.Tile();

                        var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
                        if (options === undefined || options.version === undefined) {
                            console.log('Data seems to be no valid IIIF image information.');
                            return;
                        }
                        options.zDirection = -1;


                        if (typeof license != 'undefined' && license) {
                            options.attributions = license;
                        }

                        const iiifTileSource = new ol.source.IIIF(options);
                        layer[i].setSource(iiifTileSource);
                        map_img[i].setView(new ol.View({
                            resolutions: iiifTileSource.getTileGrid().getResolutions(),
                            extent: iiifTileSource.getTileGrid().getExtent(),
                            constrainOnlyCenter: true,
                        })
                        );
                        map_img[i].addLayer(layer[i]);
                        map_img[i].getView().fit(iiifTileSource.getTileGrid().getExtent(), { padding: [30, 30, 30, 30] });

                        // form elements and functions
                        var $detail = $('.joDetail');

                        if ($detail.length && $content.length) {
                            var popup_num = 1;
                            var anno_aktive = false;

                            var $anno_btn = $('.annotationbutton-btn');
                            if ($anno_btn.length) {
                                $anno_btn.click(function () {
                                    $(this).toggleClass('active');
                                    if (anno_aktive) anno_aktive = false;
                                    else anno_aktive = true;
                                });
                            }

                            map_img[i].on('click', function (evt) {
                                if (!anno_aktive) return false;
                                var img_name = '';

                                var $akt_slick = $('.detail-img-slick .slick-img-act .detail-img-slick-img');

                                if ($akt_slick.length && typeof $akt_slick.data('img') != 'undefined') {
                                    img_name = $akt_slick.data('img-name');
                                }

                                var $clone = $content.clone();
                                $clone.removeClass('new');

                                $clone.find('.img_name').val(img_name);

                                var info_id = 'info-popup' + popup_num;

                                var info = new ol.Overlay({
                                    id: info_id,
                                    element: $clone[0],
                                    autoPan: true,
                                    autoPanAnimation: {
                                        duration: 250
                                    }
                                });

                                info_items.push({ 'item': info, 'name': img_name, 'id': info_id });

                                popup_num++;

                                map_img[i].addOverlay(info);

                                info.setPosition(evt.coordinate);

                                $clone.find('.todelete').click(() => {
                                    if ($clone.find('.noteId').val() == '') {
                                        $clone.remove();
                                    } else {
                                        $clone.find('.inpdelete').val('1');
                                        $clone.find('form').submit().promise().done(function () {
                                            $clone.remove();
                                        });
                                    }

                                    if (info_items.length) {
                                        var arr_index = info_items.findIndex((obj) => obj.id === info_id);
                                        if (arr_index !== -1) info_items.splice(arr_index, 1);
                                    }
                                });

                                $clone.parent().addClass('up');

                                $clone.find('.tohide').click(() => {
                                    $clone.removeClass('show');
                                    $clone.parent().removeClass('up');
                                });

                                $clone.find('.img-info-icon').click(() => {
                                    $clone.addClass('show');
                                    $clone.parent().addClass('up');
                                });

                                $clone.find('form').submit(function (e) {
                                    e.preventDefault();
                                    $clone.find('.coords').val(evt.coordinate[0] + ',' + evt.coordinate[1]);
                                    var form = $(this);
                                    var url = form.attr('action');
                                    $.ajax({
                                        type: 'POST',
                                        url: url,
                                        data: form.serialize()
                                    }).done((data) => {
                                        if ('' != data) {
                                            $clone.find('.noteId').val(data);
                                            $clone.removeClass('show');
                                            $clone.parent().removeClass('up');
                                        }
                                    });
                                });
                            });

                            var $old_content = $('.map-image-info.old');
                            if ($old_content.length) {
                                var popup_old_num = 675456;
                                var info_id = 'info-popup' + popup_old_num;

                                $old_content.each(function (i, v) {
                                    var $that = $(this);
                                    $that.removeClass('hid');
                                    var img_name = $that.find('.img_name').val();
                                    var coords = $that.find('.coords').val();
                                    coords = coords.split(',');
                                    var info = new ol.Overlay({
                                        id: info_id,
                                        element: $that[0],
                                        autoPan: true,
                                        autoPanAnimation: {
                                            duration: 250
                                        }
                                    });

                                    info.element.style.display = 'none';

                                    info_items.push({ 'item': info, 'name': img_name, 'id': info_id });

                                    map_img[i].addOverlay(info);

                                    info.setPosition(coords);

                                    popup_old_num++;

                                    $that.find('.todelete').click(() => {
                                        $that.find('.inpdelete').val('1');
                                        $that.find('form').submit().promise().done(() => {
                                            $that.remove();
                                        });

                                        if (info_items.length) {
                                            var arr_index = info_items.findIndex((obj) => obj.id === info_id);
                                            if (arr_index !== -1) info_items.splice(arr_index, 1);
                                        }
                                    });

                                    $that.find('.tohide').click(() => {
                                        $that.removeClass('show');
                                        $that.parent().removeClass('up');
                                    });

                                    $that.find('.img-info-icon').click(() => {
                                        $that.addClass('show');
                                        $that.parent().addClass('up');
                                    });

                                    $that.find('form').submit(function (e) {
                                        e.preventDefault();

                                        var form = $(this);
                                        var url = form.attr('action');

                                        $.ajax({
                                            type: 'POST',
                                            url: url,
                                            data: form.serialize()
                                        }).done((data) => {
                                            // location.reload();
                                            if ($that.length) {
                                                $that.removeClass('show');
                                                $that.parent().removeClass('up');
                                            }
                                        });
                                    });
                                });
                            }

                            var hash = window.location.hash;
                            if (hash === '') {
                                setTimeout(function () {
                                    var $img = $('.detail-img-slick-container .slick-img-act, .more_img_wrap .img-act .detail-img-no-slick');
                                    var img_name = $img.find('img').data('img-name');

                                    if (img_name && typeof img_name != 'undefined') {
                                        var foundItems = findInArrayByName(info_items, img_name);
                                        foundItems.forEach(function (v, i) {
                                            v.item.element.style.display = 'block';
                                        });

                                        var hiddenItems = findInArrayByNotThisName(info_items, img_name);
                                        hiddenItems.forEach(function (v, i) {
                                            v.item.element.style.display = 'none';
                                        });
                                    }
                                }, 300);
                            }

                        }
                    }).catch((e) => {
                        console.log(e);
                        console.log('error2');
                    });
                }).catch((e) => {
                    console.log(e);
                    console.log('error');
                });
            } else if (typeof img_url != 'undefined' && img_url) {
                var img = new Image();
                // img.crossOrigin = 'anonymous';
                img.onload = function () {
                    var extent = [0, 0, this.width, this.height];

                    var projection = new ol.proj.Projection({
                        code: 'xkcd-image',
                        units: 'pixels',
                        extent: extent,
                    });

                    layer[i] = new ol.layer.Image({
                        source: new ol.source.ImageStatic({
                            attributions: license,
                            url: img_url,
                            projection: projection,
                            imageExtent: extent,
                            // crossOrigin: 'anonymous'
                        })
                    });

                    map_img[i].addLayer(layer[i]);
                    map_img[i].getView().fit(extent, { padding: [30, 30, 30, 30] });
                }

                img.src = img_url;
            }
        });
    }

    function imgChanger() {
        var $that = $(this);
        var num = $that.data('slick-index');
        var $parent = $that.closest('.detail-img-slick-container');
        var $img = $that.find('.detail-img-slick-img');
        var license = $img.data('lizenztext');

        var img_name = $img.data('img-name');

        if ($that.hasClass('detail-img-no-slick')) {
            num = $that.data('slick-index');
            $img = $that;
            license = $img.data('lizenztext');
            img_name = $img.data('img-name');
        }

        if (img_name && typeof img_name != 'undefined') {
            var foundItems = findInArrayByName(info_items, img_name);
            foundItems.forEach(function (v, i) {
                v.item.element.style.display = 'block';
            });

            var hiddenItems = findInArrayByNotThisName(info_items, img_name);
            hiddenItems.forEach(function (v, i) {
                v.item.element.style.display = 'none';
            });

            window.location.hash = img_name;
        }

        $('.image-rights').remove();

        var externlink = $img.data('externlink');

        if ($('.detail-3d-link-wrapper').length) $('.detail-3d-link-wrapper').remove();

        if (externlink && typeof externlink != 'undefined') {
            var div = '<div class="detail-3d-link-wrapper"><a class="detail-3d-link" target="_blank" href="' + externlink + '">zum 3D Objekt</a></div>';

            if ($('.map-image').length) {
                $('.map-image').append(div);
            }
        }

        var d_360grad = $img.data('d360grad');

        if ($('.detail-360grad_view-link-wrapper').length) $('.detail-360grad_view-link-wrapper').remove();

        if ($('.cloudimage-360').length) {
            window.CI360.destroy();
            $('.cloudimage-360').remove();
            $('.map-image').show();
        }

        if (d_360grad && typeof d_360grad != 'undefined') {
            var div = '<div class="detail-360grad_view-link-wrapper"><a class="detail-360grad_view-link" href="#" title="360° Darstellung" data-manifest="' + d_360grad + '">360° Darstellung</a></div>';

            if ($('.map-image').length) {
                $('.map-image').append(div);
            }
        }

        if ($img.length) {
            var iiif_info = $img.data('iiif');
            var img_url = $img.attr('src') + '?' + Date.now();

            if (typeof iiif_info != 'undefined' && iiif_info) {
                fetch(iiif_info).then(function (response) {
                    response.json().then(function (imageInfo) {
                        var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
                        if (options === undefined || options.version === undefined) {
                            console.log('Data seems to be no valid IIIF image information.');
                            return;
                        }

                        if (typeof license != 'undefined' && license) {
                            options.attributions = license;
                        }

                        options.zDirection = -1;
                        var iiifTileSource = new ol.source.IIIF(options);
                        layer[0].setSource(iiifTileSource);
                        map_img[0].setView(
                            new ol.View({
                                resolutions: iiifTileSource.getTileGrid().getResolutions(),
                                extent: iiifTileSource.getTileGrid().getExtent(),
                                constrainOnlyCenter: true,
                            })
                        );
                        map_img[0].getView().fit(iiifTileSource.getTileGrid().getExtent(), { padding: [30, 30, 30, 30] });

                        if ($that.hasClass('detail-img-no-slick')) {
                            $that.closest('.more_img_wrap').children().removeClass('img-act');
                            $that.parent().parent().addClass('img-act');
                        } else {
                            $parent.find('.slick-img-act').removeClass('slick-img-act');
                            $that.addClass('slick-img-act');
                        }
                    }).catch(function (e) {
                        console.log(e);
                        console.log('error2');
                    });
                }).catch(function (e) {
                    console.log(e);
                    console.log('error');
                });
            } else if (typeof img_url != 'undefined' && img_url) {
                var img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function () {
                    var extent = [0, 0, this.width, this.height];

                    var projection = new ol.proj.Projection({
                        code: 'xkcd-image',
                        units: 'pixels',
                        extent: extent,
                    });

                    var imgSource = new ol.source.ImageStatic({
                        attributions: license,
                        url: img_url,
                        projection: projection,
                        imageExtent: extent,
                        crossOrigin: 'Anonymous'
                    });

                    layer[0].setSource(imgSource);
                    map_img[0].getView().fit(extent, { padding: [30, 30, 30, 30] });

                    if ($that.hasClass('detail-img-no-slick')) {
                        $that.closest('.more_img_wrap').children().removeClass('img-act');
                        $that.parent().parent().addClass('img-act');
                    } else {
                        $parent.find('.slick-img-act').removeClass('slick-img-act');
                        $that.addClass('slick-img-act');
                    }
                }

                img.src = img_url;
            }
        }

        if ($cur_img_num && $cur_img_num.length) {
            $cur_img_num.html(parseInt(num) + 1);
        }

        if ($that.hasClass('detail-img-no-slick')) {
            $('html').animate({
                scrollTop: $('.map-image').offset().top - 40
            }, 300);
        }
    }

    var $img_no_slick = $('.detail-img-no-slick');
    if ($img_no_slick.length) {
        $('.img-prev-next .img-prev').click(function () {
            var $act = $('.more_img_wrap > .img-act');

            if ($act.length) {
                var $prev = $act.prev();

                if ($prev.length) {

                } else {
                    $prev = $('.more_img_wrap > div:last-child()');
                }

                $prev.find('.detail-img-no-slick').trigger('click');
            }
        });

        $('.img-prev-next .img-next').click(function () {
            var $act = $('.more_img_wrap > .img-act');
            if ($act.length) {
                var $next = $act.next();

                if ($next.length) {

                } else {
                    $next = $('.more_img_wrap > div:first-child()');
                }

                $next.find('.detail-img-no-slick').trigger('click');
            }
        });


        $('.more_img_wrap').on('click', '.detail-img-no-slick', imgChanger);
    }

    var hash = window.location.hash;
    if (hash != '' && hash != '#') {
        hash = hash.substring(1);
        var $hash_img = $('.detail-img-slick-img[data-img-name="' + hash + '"], .detail-img-no-slick[data-img-name="' + hash + '"]');

        if ($hash_img.length) {
            setTimeout(function () {
                if ($hash_img.hasClass('detail-img-no-slick')) {
                    $hash_img.trigger('click');
                } else {
                    $hash_img.parent().parent().trigger('click');
                }
            }, 300);
        }
    }

    var $sl_slider = $('.detail-img-slick');
    if ($sl_slider.length && jQuery().slick) {
        $sl_slider.slick({
            infinite: false,
            lazyLoad: 'ondemand',
            slidesToShow: 6,
            slidesToScroll: 6,
            arrows: true,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                },
            ]
        });

        var $cur_img_num = $('.page_count .current-img-count');
        var $img_count = $('.page_count .img-count');

        if ($cur_img_num.length) {
            $cur_img_num.html(parseInt($('.detail-img-slick-container .slick-img-act:not(.slick-cloned)').data('slick-index')) + 1);
        }

        var hash = window.location.hash;
        if (hash != '' && hash != '#') {
            hash = hash.substring(1);
            var $hash_img = $('.detail-img-slick-img[data-img-name="' + hash + '"]');
            if ($hash_img.length) {
                setTimeout(function () {
                    $hash_img.parent().parent().trigger('click');
                }, 300);
            }
        }

        $('.img-prev-next .img-prev').click(function () {
            var $prev = $('.detail-img-slick-container .slick-img-act:not(.slick-cloned)').prev();
            if ($prev.length) {
                var num = $prev.data('slick-index');
                if ($prev.hasClass('slick-cloned')) {
                    num = parseInt($img_count.html()) - 1;
                    $prev = $('.detail-img-slick-container .slick-slide[data-slick-index="' + num + '"]');
                }

                $prev.trigger('click');

                if ($cur_img_num.length) {
                    $cur_img_num.html(parseInt(num) + 1);
                }
            }
        });

        $('.img-prev-next .img-next').click(function () {
            var $next = $('.detail-img-slick-container .slick-img-act:not(.slick-cloned)').next();
            if ($next.length) {
                var num = $next.data('slick-index');

                if ($next.hasClass('slick-cloned')) {
                    num = 0;
                    $next = $('.detail-img-slick-container .slick-slide[data-slick-index="0"]');
                }

                $next.trigger('click');

                if ($cur_img_num.length) {
                    $cur_img_num.html(parseInt(num) + 1);
                }
            }
        });

        if ($map_image.length) {
            $('.detail-img-slick-container').on('click', '.detail-img-slick .slick-slide', imgChanger);

            $('.detailimage_con').on('click', '.detail-360grad_view-link', function (e) {
                e.preventDefault();

                var $360viewer_btn = $(this);

                var manifest = $360viewer_btn.data('manifest');

                $.get(manifest).done(function (data) {
                    // if (data.structures && data.structures[0].canvases) {
                    if (data.sequences && data.sequences[0].canvases) {
                        var img_arr = [];

                        (data.sequences[0].canvases).forEach(function (v, i) {
                            var img = v['images'][0]['resource']['@id'];
                            img_arr.push(img + '/full/pct:25/0/default.jpg');
                        });

                        var div = "<div id='cloudimage-360-0' class='cloudimage-360 d-none' data-image-list-x='" + JSON.stringify(img_arr) + "' data-num='0'></div>";

                        $('.detailimage_con').prepend($(div)).promise().done(function () {
                            $('.map-image').hide();
                            $('#cloudimage-360-0').addClass('active').removeClass('d-none');
                            window.CI360.add('cloudimage-360-0');
                        });
                    }
                });


                var $360viewer = $('.cloudimage-360.active');
                $360viewer_btn.addClass('initilized active');

                var $360viewer_btn = $('.detail-360grad_view-link');
                if ($360viewer_btn.length) {
                    $360viewer_btn.click(function () {
                        // var manifest = 'https://digicult2.thulb.uni-jena.de/api/iiif/presentation/v2/digicult_derivate_00296251/manifest';
                    });
                }
            });

            $('.detail-gallery-container .detail-img-gallery-img').click(function () {
                var $that = $(this);
                var num = $that.data('num');
                if ($('.detail-img-slick-container').length) {
                    $('.detail-img-slick-container .slick-slide[data-slick-index="' + (num - 1) + '"]').trigger('click');
                } else {
                    var iiif_info = $that.data('iiif');
                    fetch(iiif_info).then(function (response) {
                        response.json().then(function (imageInfo) {
                            var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
                            if (options === undefined || options.version === undefined) {
                                console.log('Data seems to be no valid IIIF image information.');
                                return;
                            }
                            options.zDirection = -1;
                            var iiifTileSource = new ol.source.IIIF(options);
                            layer[0].setSource(iiifTileSource);
                            map_img[0].setView(
                                new ol.View({
                                    resolutions: iiifTileSource.getTileGrid().getResolutions(),
                                    extent: iiifTileSource.getTileGrid().getExtent(),
                                    constrainOnlyCenter: true,
                                })
                            );
                            map_img[0].getView().fit(iiifTileSource.getTileGrid().getExtent(), { padding: [30, 30, 30, 30] });
                        }).catch(function (e) {
                            console.log(e);
                            console.log('error2');
                        });
                    }).catch(function (e) {
                        console.log(e);
                        console.log('error');
                    });
                }
                $('.map-image').toggleClass('hide');
                $('.img-prev-next').toggleClass('hide');
                $('.detail-gallery-container').toggleClass('hide');
            });
        }
    }

    var $gl_item = $('.detail-gallery-btn');
    if ($gl_item.length) {
        $gl_item.click(function () {
            $('.map-image').toggleClass('hide');
            $('.img-prev-next').toggleClass('hide');
            $('.detail-gallery-container').toggleClass('hide');
            $('.img_zoom_in').toggleClass('hide');
            $('.img_zoom_out').toggleClass('hide');
            $('.img_info').toggleClass('hide');
            $('.mirador-btn-wrapper').toggleClass('hide');
        });
    }

    var $gl_wrap = $('.detail-gallery-container');
    if ($gl_wrap.length) {
        gl_wrap_height = $gl_wrap.height();
        $gl_wrap.scroll(function () {
            $.each($gl_wrap.find('img[data-lazy]'), function () {
                if ($(this).data('lazy') && $(this).offset().top < ($(window).scrollTop() + $(window).height() + 100)) {
                    var source = $(this).data('lazy');
                    $(this).attr('src', source);
                    $(this).removeAttr('data-lazy');
                }
            });
        });
    }

    /* Fullscreen open */
    function enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {  /* Safari */
            element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* IE11 */
            element.webkitRequestFullscreen();
        }
    }

    /* Fullscreen close */
    function closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }

    $('.togglefullscreen').click(function (e) {
        $that = $(this);
        $main_content = $('.detailimage_con');
        if ($that.hasClass('in_fullscreen')) {
            closeFullscreen();
        } else {
            enterFullscreen($main_content[0]);
        }
    });

    // ESC close fullscreen
    document.addEventListener('fullscreenchange', changeHandler);
    document.addEventListener('webkitfullscreenchange', changeHandler);
    document.addEventListener('mozfullscreenchange', changeHandler);
    document.addEventListener('MSFullscreenChange', changeHandler);

    function changeHandler() {
        if ($('.joDetail').length) {
            $('.togglefullscreen').toggleClass('in_fullscreen');
            $('.detailimage_con').toggleClass('fullHeight');
            $('.more_img_wrap').toggleClass('in_fullscreen');
            resizeMap();
        }
    }

    // Prevent Formload on history-back
    if (window.history.replaceState) window.history.replaceState(null, null, window.location.href);

    function resizeMap() {
        var $themap = $('#mapdiv');
        if ($themap.length) {
            var map = $themap.data('map');
            setTimeout(() => { map.updateSize(); }, 200);
        }
    }

    $('#sidebarCollapse').on('click', function () {
        $(this).toggleClass('active');
        $('#sidebar').toggleClass('active');

        resizeMap();
    });

    $('.collapse_all_p').click(function () {
        var $meta = $('#sidebar, .master_wrap .rightcol');
        var $collapse = $meta.find('h3[data-toggle="collapse"]');
        if ($collapse.length) {
            $collapse.each(function (i, v) {
                var $that = $(this);
                if ($that.attr('aria-expanded') == 'false') {
                    $that.removeClass('collapsed').attr('aria-expanded', true).data('aria-expanded', true);
                    var $target = $($(this).data('target'));
                    if ($target.length && !$target.hasClass('show')) {
                        $target.slideDown(400, () => {
                            $target.addClass('collapse show').removeAttr('style');
                            nicescrollUpdate();
                        });
                    }
                }
            });
        }
    });

    $('.collapse_all_m').click(function () {
        var $meta = $('#sidebar, .master_wrap .rightcol');
        var $collapse = $meta.find('h3[data-toggle="collapse"]');
        if ($collapse.length) {
            $collapse.each(function (i, v) {
                var $that = $(this);
                if ($that.attr('aria-expanded') == 'true') {
                    $that.addClass('collapsed').attr('aria-expanded', false).data('aria-expanded', false);
                    var $target = $($(this).data('target'));
                    if ($target.length && $target.hasClass('show')) {
                        $target.slideUp(400, () => {
                            $target.removeClass('show').removeAttr('style');
                            nicescrollUpdate();
                        });
                    }
                }
            });
        }
    });

    /* Bild per Klick vergrößern / verkleinern */
    $('.bigimg_wrap .img_item a').click(function (e) {
        e.preventDefault();
        if (mobile) return false;
        var $that = $(this).parent();
        var $gp = $that.parent();
        var children_count = $gp.children().length;
        var is_activ = $that.hasClass('zoomable');
        if (is_activ) {
            if (children_count > 1) $that.removeClass('col-md-10').addClass('col-md');
            $that.removeClass('zoomable');
            $('.img_zoom_in').fadeOut();
            $('.img_zoom_out').fadeOut();

            $that.parent().removeClass('active');
        } else {
            if (children_count > 1) $that.addClass('col-md-10').removeClass('col-md');
            $that.addClass('zoomable');
            $('.img_zoom_in').fadeIn();
            $('.img_zoom_out').fadeIn();

            $that.parent().addClass('active');
        }

        var $img = $that.find('img');
        $img.css('height', '100%').css('width', '100%').css('left', '0').css('top', '0').data('scr_pos', 0);

        if ($img.data('ui-draggable')) {
            if (is_activ) $img.draggable('disable');
            else $img.draggable('enable');
        }
        else if (!is_activ) $img.draggable();

        $that.parent().children().not($that).removeClass('col-md-10 active').addClass('col-md').find('img').css('height', '100%').css('width', '100%').css('left', '0').css('top', '0').data('scr_pos', 0).promise().done(function (e) {
            if ($(this).data('ui-draggable')) $(this).draggable('disable');
        });

    });

    var zoom = 0;
    function zoomImg($container, delta, e) {
        var $img = $container.find('img');
        var deep = $img.data('scr_pos');

        if (typeof deep == 'undefined' || deep < 1 || deep > 11) deep = 1;

        var width = $img.width();
        var height = $img.height();

        if (delta > 1) {
            if (deep < 11) {
                if (deep > 6 && typeof $img.data('img_reloaded') == 'undefined') {
                    $ajaxloader.show();
                    var src = $img.attr('src');
                    src = src.replace('full/500,/0', 'full/3000,/0');
                    $img.load(() => {
                        $ajaxloader.hide();
                    }).error(() => {
                        $ajaxloader.hide();
                    }).attr('src', src);
                    $img.data('img_reloaded', 'finished');
                }
                var calcwidth = width + (width * 0.1);
                var calcheight = height + (height * 0.1);

                $img.width(calcwidth);
                $img.height(calcheight);

                var parentHeight = $img.parent().height();
                var parentWidth = $img.parent().width();

                var top = (parentHeight / 2) - (calcheight / 2);
                var left = (parentWidth / 2) - (calcwidth / 2);

                $img.css('top', top);
                $img.css('left', left);

                $img.data('scr_pos', deep + 1);
            }
        } else {
            if (deep > 1) {
                var calcwidth = width - (width * 0.1);
                var calcheight = height - (height * 0.1);
                $img.width(calcwidth);
                $img.height(calcheight);
                var parentHeight = $img.parent().height();
                var parentWidth = $img.parent().width();
                var top = (parentHeight / 2) - (calcheight / 2);
                var left = (parentWidth / 2) - (calcwidth / 2);

                $img.css('top', top);
                $img.css('left', left);
                $img.data('scr_pos', deep - 1);
            }
        }
    }

    $('.bigimg_wrap').on('wheel', '.img_big .img_item.zoomable', function (e) {
        e.preventDefault();

        var delta = e.originalEvent.deltaY;
        zoomImg($(this), delta, e);
    });

    $('.img_zoom_in').click((e) => {
        zoomImg($('.img_big .img_item.zoomable'), 10, e);
    });

    $('.img_zoom_out').click((e) => {
        zoomImg($('.img_big .img_item.zoomable'), -10, e);
    });

    $('body').on('click', '.t200, .t400', function (e) {
        e.preventDefault();
        var $that = $(this);
        var href = $that.attr('href');

        if (href && href != '') {
            $ajaxloader.show();
            $.get(href).done(function (data) {
                if ($that.hasClass('t400')) {
                    $that.closest('.frame').find('.listview_wrap.results').append($(data).find('.listview_wrap.results').children()).promise().done(function () {
                        $that.closest('.joPaginateWrap').remove();
                        if (typeof initMapFuncIt == 'function') initMapFuncIt();
                        if (typeof fc_drp_init == 'function') fc_drp_init();
                        if (typeof initSlider == 'function') initSlider();
                    });
                } else {
                    $that.closest('.frame').html($(data)).promise().done(function () {
                        if (typeof initMapFuncIt == 'function') initMapFuncIt();
                        if (typeof fc_drp_init == 'function') fc_drp_init();
                        if (typeof initSlider == 'function') initSlider();
                    });
                }
                $ajaxloader.hide();
            });
        }
    });

    $('body').on('click', '.t300', function (e) {
        e.preventDefault();
        var $that = $(this);
        // var href = $that.is('select') ? $that.val() : $that.attr('href');
        var href = $that.attr('href');

        if (href && href != '') {
            $ajaxloader.show();
            $.get(href).done(function (data) {
                $that.closest('.frame').html($(data)).promise().done(function () {

                });
                $ajaxloader.hide();
            });
        }
    });

    $('body').on('click', '.loadrelatedwithajax', function (e) {
        e.preventDefault();
        var $that = $(this);
        var href = $that.attr('href');

        if (href && href != '') {
            $ajaxloader.show();
            $.get(href).done(function (data) {
                $that.parent().parent().find('.results').append($(data));
                $ajaxloader.hide();
                $that.hide();
            });
        }
    });

    if ($('.viewercontrolview_1_wrapper').length) {
        $('.map-image .ol-zoom').hide();
        $('.map-image .ol-attribution').addClass('d-none');

        $('.viewercontrolview_1_wrapper .img_zoom_in').click(function () {
            var $ol_zoom = $('.map-image .ol-zoom-in');
            if ($ol_zoom.length) {
                $ol_zoom.trigger('click');
            }
        });

        $('.viewercontrolview_1_wrapper .img_zoom_out').click(function () {
            var $ol_zoom = $('.map-image .ol-zoom-out');
            if ($ol_zoom.length) {
                $ol_zoom.trigger('click');
            }
        });

        $('.viewercontrolview_1_wrapper .img_info').click(function () {
            if ($('.viewercontrolview_1_wrapper .image-rights').length) {
                $('.viewercontrolview_1_wrapper .image-rights').remove();
                $(this).removeClass('active');
            } else {
                $('.map-image').find('.ol-attribution ul').clone().addClass('image-rights').appendTo('.viewercontrolview_1_wrapper');
                $(this).addClass('active');
            }
        });
    }

    var working = false;
    $('.marks_control_link').click(function (e) {
        e.preventDefault();
        if (!working) {
            working = true;
            $('[data-toggle="joTeiAfterPopover"]').popover('hide');
            $('[data-toggle="joTeiPopoverh"]').popover('hide');
            $('[data-toggle="joTeiKritikPopover"]').popover('hide');
            $('.teiText .active').not('.tab-pane, .nav-link').removeClass('active');
            $('.teiItem.active').removeClass('active');
            var href = $(this).attr('href');
            if (href.length > 0) {
                var teiText = $('.teiText');
                if ($('.teiText').hasClass('hide_marks')) {
                    $(this).find('.ck_box').removeAttr('checked');
                } else {
                    $(this).find('.ck_box').attr('checked', 'checked');
                }
                $('.teiText').toggleClass('hide_marks');
                $(this).toggleClass('active');
                $.post(href, function (data) { });
            }
            setTimeout(function () {
                working = false;
            }, 300);
        }
    });

    fc_drp_init();
    teiEffekts();
    collapseAfterAffekt();
    pi1019SlickInit();
});

function teiEffekts() {
    $('body').popover({ selector: '[data-toggle=joTeiPopover]', trigger: 'click', html: true }).on('show.bs.popover', function (e) {
        $('[data-toggle=joTeiPopover]').not(e.target).popover('hide');
        //$('.popover').remove();
    });

    $('[data-toggle="joTeiAfterPopover"], [data-toggle="joTeiKritikPopover"]').popover({ html: true }).on('show.bs.popover', function (e) {
        $('[data-toggle="joTeiAfterPopover"]').not(e.target).popover('hide');
        $('[data-toggle="joTeiPopoverh"]').not(e.target).popover('hide');
        $('[data-toggle="joTeiKritikPopover"]').not(e.target).popover('hide');
    });

    $('body').popover({ selector: '[data-toggle=joTeihoverPopover]:not(".active")', trigger: 'click', html: true }).on('show.bs.popover', function (e) {
        $('[data-toggle=joTeihoverPopover]').not(e.target).popover('hide');
        $('.popover').remove();
    });

    $('.teiItem').click(function () {
        var id = $(this).data('id');
        if (id && id != '') {
            if (id.indexOf('regID') >= 0) {
                var el = $('anchor[data-ana="' + id + '"]');
                if (!$(this).hasClass('active')) {
                    $('body,html').animate({
                        scrollTop: el.first().offset().top - ($(window).height() / 2)
                    }, 800);
                }
                el.first().find('.joTeiAfterPopover').trigger('click');
            } else {
                var el = $('.joTeiAfterPopover[data-ana="' + id + '"]');
                if (!$(this).hasClass('active')) {
                    $('body,html').animate({
                        scrollTop: el.first().offset().top - ($(window).height() / 2)
                    }, 800);
                }
                el.first().trigger('click');
            }
        }
    });

    function joTeiAfterPopoverEffekt2() {
        var that = $(this).parent();
        var id = $(this).data('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('.joTeiAfterPopover[data-ana="' + id + '"]');
            if (that.hasClass('active')) {
                anchors.parent().removeClass('active');
                el.removeClass('active');
                that.removeClass('active');
            } else {
                $('.tei_anchor.active').removeClass('active');
                $('.teiItem.active').removeClass('active');
                anchors.parent().addClass('active');
                el.addClass('active');
            }
        } else {
            var el = $('.teiText span.active');
            if (that.hasClass('active')) {
                el.removeClass('active');
                that.removeClass('active');
            } else {
                el.removeClass('active');
                that.addClass('active');
            }
        }
    }
    $('.teiText .tei_anchor > span.joTeiAfterPopover, .teiText span[data-class="tei_anchor"] > span.joTeiAfterPopover').click(joTeiAfterPopoverEffekt2);

    function joTeiAfterPopoverEffektHover2() {
        var that = $(this).parent();
        var id = $(this).data('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('.joTeiAfterPopover[data-ana="' + id + '"]');
            if (that.hasClass('hover')) {
                anchors.parent().removeClass('hover');
                el.removeClass('hover');
                that.removeClass('hover');
            } else {
                $('.tei_anchor.hover').removeClass('hover');
                $('.teiItem.hover').removeClass('hover');
                anchors.parent().addClass('hover');
                el.addClass('hover');
            }
        } else {
            var el = $('.teiText span.hover');
            if (that.hasClass('hover')) {
                el.removeClass('hover');
                that.removeClass('hover');
            } else {
                el.removeClass('hover');
                that.addClass('hover');
            }
        }
    }
    $('.teiText .tei_anchor > span.joTeiAfterPopover, .teiText span[data-class="tei_anchor"] > span.joTeiAfterPopover').hover(joTeiAfterPopoverEffektHover2, joTeiAfterPopoverEffektHover2);

    function joTeiAfterPopoverEffekt() {
        var that = $(this).parent();
        var id = that.data('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('anchor[data-ana="' + id + '"]');
            if (that.hasClass('active')) {
                anchors.removeClass('active');
                el.removeClass('active');
                that.removeClass('active');
            } else {
                $('anchor.active').removeClass('active');
                $('.teiItem.active').removeClass('active');
                anchors.addClass('active');
                el.addClass('active');
            }
        } else {
            if ($(this).parent().hasClass('tei_anchor')) {
                $(this).parent().toggleClass('active');
            }
        }
    }
    $('.teiText anchor .joTeiAfterPopover').click(joTeiAfterPopoverEffekt);

    function joTeiAfterPopoverEffektHover() {
        var that = $(this).parent();
        var id = that.data('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('anchor[data-ana="' + id + '"], anchor[ana="' + id + '"]');
            if (that.hasClass('hover')) {
                anchors.removeClass('hover');
                el.removeClass('hover');
                that.removeClass('hover');
            } else {
                $('anchor.hover').removeClass('hover');
                $('.teiItem.hover').removeClass('hover');
                anchors.addClass('hover');
                el.addClass('hover');
            }
        } else {
            if ($(this).parent().hasClass('tei_anchor')) {
                $(this).parent().toggleClass('hover');
            }
        }
    }
    $('.teiText anchor .joTeiAfterPopover').hover(joTeiAfterPopoverEffektHover, joTeiAfterPopoverEffektHover);


    function joTeiKritikPopoverEffekt() {
        var that = $(this).prev('anchor');
        var id = that.attr('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('anchor[data-ana="' + id + '"], anchor[ana="' + id + '"]');
            if (that.hasClass('active')) {
                anchors.removeClass('active');
                el.removeClass('active');
                that.removeClass('active');
            } else {
                $('anchor.active').removeClass('active');
                $('.teiItem.active').removeClass('active');
                anchors.addClass('active');
                el.addClass('active');
            }
        } else {
            if ($(this).parent().hasClass('tei_anchor')) {
                $(this).parent().toggleClass('active');
            }
        }
    }
    $('[data-toggle="joTeiKritikPopover"]').click(joTeiKritikPopoverEffekt);

    function joTeiKritikPopoverEffektHover() {
        var that = $(this).prev('anchor');
        var id = that.attr('ana');
        if (id && id != '') {
            var el = $('.teiItem[data-id="' + id + '"]');
            var anchors = $('anchor[data-ana="' + id + '"], anchor[ana="' + id + '"]');
            if (that.hasClass('hover')) {
                anchors.removeClass('hover');
                el.removeClass('hover');
                that.removeClass('hover');
            } else {
                $('anchor.hover').removeClass('hover');
                $('.teiItem.hover').removeClass('hover');
                anchors.addClass('hover');
                el.addClass('hover');
            }
        } else {
            if ($(this).parent().hasClass('tei_anchor')) {
                $(this).parent().toggleClass('hover');
            }
        }
    }
    $('[data-toggle="joTeiKritikPopover"]').hover(joTeiKritikPopoverEffektHover, joTeiKritikPopoverEffektHover);
}

function fc_drp_init() {
    var $mirador_btn = $('.mirador-btn');
    if ($mirador_btn.length) {
        $mirador_btn.click(function () {
            var manifest = $mirador_btn.data('manifest');
            var manifest_arr = manifest.split(',');

            if (typeof manifest != 'undefined' && manifest != '') {
                var manifests = [];
                var windows = [];
                manifest_arr.forEach(function (v, i) {
                    manifests[v] = { 'provider': '' };

                    windows.push({
                        'loadedManifest': v,
                        'canvasIndex': i + 2,
                        'thumbnailNavigationPosition': 'far-bottom'
                    });
                });

                var div = $('<div id="mirador-viewer"></div>');
                $('body').append(div);
                $('.joFixed').remove();
                $('.back-to-top').removeClass('active');
                $('html').css('font-size', '16px');

                var mirador = Mirador.viewer({
                    'id': 'mirador-viewer',
                    'manifests': manifests,
                    'windows': windows
                });
            }
        });

        $('body').on('click', '.mirador-window-close', function () {
            setTimeout(function () {
                if (!$('.mirador-window-close').length) {
                    $('#mirador-viewer').remove();
                }
            }, 100);
        });
    }

    var $d_slider = $("#slider-vertical");
    if ($d_slider.length) {
        function contrastImage(imgData, contrast) {  //input range [-100..100]
            var d = imgData.data;
            contrast = (contrast / 100) + 1;  //convert to decimal & shift range: [0..2]
            var intercept = 128 * (1 - contrast);
            for (var i = 0; i < d.length; i += 4) {   //r,g,b,a
                d[i] = d[i] * contrast + intercept;
                d[i + 1] = d[i + 1] * contrast + intercept;
                d[i + 2] = d[i + 2] * contrast + intercept;
            }
            return imgData;
        }

        var handle = $("#custom-handle");
        var width = 1000;
        var height = 1000;
        var ctx = null;
        var origBits = null;
        var copiedBits = null;
        var timeout = setTimeout(function () { }, 800);
        $('#slider-vertical').slider({
            orientation: "vertical",
            range: 'min',
            min: -100,
            max: 100,
            value: 0,
            create: function () {
                handle.text($(this).slider("value"));
            },
            slide: function (event, ui) {
                if (ctx == null) {
                    var $canvas = $('.map-image canvas');
                    width = $canvas.width();
                    height = $canvas.height();
                    ctx = $canvas[0].getContext("2d");
                    origBits = ctx.getImageData(0, 0, width, height);
                    copiedBits = ctx.getImageData(0, 0, width, height);
                }

                handle.text(ui.value);

                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    origBits = copiedBits;
                    origBits = contrastImage(origBits, ui.value);
                    ctx.putImageData(origBits, 0, 0);
                }, 200);
            }
        });
    }
}

function collapseAfterAffekt() {
    $('.grid-collapse').on('shown.bs.collapse', function () {
        var $that = $(this);
        timeout = setTimeout(function () {
            $that.find('.slick-slider.slick-initialized').slick('refresh');
        }, 200);
    });
}

function pi1019SlickInit() {
    var $sl_sldier = $('.pi1019SlickSlider');
    if ($sl_sldier.length) {
        var imgperslide = 1;
        if ($sl_sldier.data('slidenum') && typeof $sl_sldier.data('slidenum') != 'undefined') imgperslide = parseInt($sl_sldier.data('slidenum'));
        $sl_sldier.slick({
            dots: true,
            arrows: true,
            infinite: true,
            slidesToShow: imgperslide,
            variableWidth: false,
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
                        variableWidth: false
                    }
                }
            ]
        });
    }
}
