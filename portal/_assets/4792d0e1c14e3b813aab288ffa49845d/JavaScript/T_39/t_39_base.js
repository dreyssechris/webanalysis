$(() => {
	var mobile = $('#mobile-hidden').is(':hidden');

	var ajaxloader = $('#joAjaxloader');

	/* 
	 * a simple cookie processing function
	 *
	 * sets cookieOk sessionStorage
	 */
	function cookieInit() {
		if (window.sessionStorage.getItem('cookieOk') === null) $('#cookie-teaser').show();

		cookieOkFn = () => {
			$('#cookie-teaser').fadeOut();
			window.sessionStorage.setItem('cookieOk', 1);
		}
		var cookieOk = $('#cookieOk');
		cookieOk.off('click',cookieOkFn);
		cookieOk.on('click',cookieOkFn);
	}

	/* 
	 * Back to Top Link
	 * Scrolling to Top of the Page
	 * on bottom the Arrow moves above the footer
	 */
	function backToTopInit() {
		var _btnTop = $('.back-to-top');
		$(window).scroll(function() {
			var footerHeight = $('footer').outerHeight();
			var scrolltop = $(this).scrollTop();
			if (scrolltop > 100) {
				if (!_btnTop.hasClass('active')) _btnTop.addClass('active');
			} else {
				if (_btnTop.hasClass('active')) _btnTop.removeClass('active');
			}

			var curent_scrl = scrolltop + $(window).height();
			var heightNoFooter = $(document).height() - footerHeight;
			if (curent_scrl > heightNoFooter) {
	       		_btnTop.css('bottom', (curent_scrl - heightNoFooter) + 'px');
				_btnTop.removeClass('noFooter');
		   	} else {
		   		_btnTop.css('bottom', '20');
				_btnTop.addClass('noFooter');
		   	}
		});

		_btnTop.click(() => {
			$('body,html').animate({
				scrollTop: 0
			}, 500);
			return false;
		});
	}

	/*
	 * init Bootstrap Tooltip
	 * 
	 */
	function tooltipInit() {
		var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
		var tooltipList = tooltipTriggerList.map(tooltipTriggerEl => {
	  		return new bootstrap.Tooltip(tooltipTriggerEl)
		});
	}

	/*
	 * init map extra funktions
	 * like nicescroll for maplist scrolling
	 *
	 */
	function mapListInit() {
		var sbar = $('#joMaps-container .joScrollWrap');
	    if (sbar.length && !mobile && jQuery().niceScroll) {
	        sbar.niceScroll({cursorcolor:"rgba(52,102,103,0.5)", zindex:'2000'});
	    }
	}


	function hierachicalInit() {
		function joSliderHierarchie(containerSelector, mobile, spalten) {
	        var container = $(containerSelector);
	        var pane;
	        var items;
	        var width;
	        var itemWidth;
	        var spalten = spalten;
	        var left = 0;
	        var prev = container.prev('.joSliderShow-prev');
	    	var next = container.next('.joSliderShow-next');
	        var mobile = mobile;
	        var id;
	        var _this = this;

	        _this.refreshContainer = function() {
	            container = $(container.selector);
	        }

	        _this.updateItemWidth = function() {
	            itemWidth = pane.find('.items').first().outerWidth();
	        }

	        _this.paneWidthReset = function() {
	        	if (!mobile) {
		            var length = pane.find('.joSliderShowItems:visible').length;
		            pane.css('width', itemWidth * length + 'px');
	            }
	        }

	        _this.fullreset = function() {
	            width = container.width();
	            _this.updateItemWidth();
	            _this.paneWidthReset();
	            _this.setDisplay('');
	        }

	        _this.getId = function() {
	            return id;
	        }

	        _this.getSpalten = function() {
	            return spalten;
	        }

	        _this.setSpalten = function(num) {
	            spalten = num;
	        }

	        _this.getMobile = function() {
	            return spalten;
	        }

	        _this.setMobile = function(bool) {
	            mobile = bool;
	        }

	        _this.getItemWidth = function() {
	            return itemWidth;
	        }

	        _this.setDisplay = function(trigger) {
	        	if (!mobile) {
		            if(left < 0) {
		                prev.show();
		            } else {
		                prev.hide();
		            }
		            var panewidth = pane.width() + left;
		            if(panewidth <= width) {
		                next.hide();
		            } else {
		                next.show();
		            }
		            if(trigger == 'next') {
		            	_this.triggerNext();
		            } else if(trigger == 'prev') {
		            	num = spalten - ((pane.width() + left) / itemWidth);
		            	if(num > 0) {
		            		_this.triggerPrev();
		            	} else {
		            		setTimeout(function(){
		            			_this.nicescrollReset();
		            		}, 50);
		            	}
		            }
		        }
	        }

	        _this.nicescrollReset = function() {
	        	if(jQuery().niceScroll) {
		        	container.find('.items > ul').getNiceScroll().hide();
		        }
	        	var num = Math.abs(Math.floor(left / itemWidth));
	            var elements = container.find('.items:visible > ul').slice(num, num + spalten);
	            if(jQuery().niceScroll) {
		            elements.getNiceScroll().resize();
		            elements.getNiceScroll().show();
		        }
	        }

	        _this.move = function() {
	        	if (!mobile) {
		        	setTimeout(function(){
			        	if(jQuery().niceScroll) {
				        	container.find('.items > ul').getNiceScroll().hide();
				        }
			            pane.css('transform', 'translate3d(' + left + 'px, 0px, 0px)');
			            setTimeout(function(){
			                _this.nicescrollReset();
			            }, 1000);
			        	_this.setDisplay('');
		        	}, 50);
		        }
	        }

	        //prev.off();
	        prev.click(function() {
	        	if (!mobile) {
		        	num = spalten - ((pane.width() + left) / itemWidth);
		        	if(num <= 0) {
		        		num = 1;
		        	}
		            left += itemWidth * num;
		            if(left > 0) {
		            	left = 0;
		            }
		            _this.move();
		        }
	        });

	        next.click(function() {
	        	if (!mobile) {
		            left -= itemWidth;
		            _this.move();
		        }
	        });

	        _this.triggerPrev = function() {
	            if(prev.is(':visible')) {
	                prev.trigger('click');
	            }
	        }

	        _this.triggerNext = function() {
	            if(next.is(':visible')) {
	                next.trigger('click');
	            }
	        }

	        _this.init = function() {
	        	id = container.closest('.hierachical').attr('id');
	            pane = container.find('.joSliderShowPane');
	            width = container.outerWidth();
	            _this.fullreset();

	            if(pane.is(':visible') && !mobile) {
	            	num = (pane.width() / itemWidth) - spalten;
	            	if(num > 0) {
	            		left -= itemWidth * num;
	            		_this.move();
	            	}
	            }
	        }

	        _this.init();
	    }

	    var joSlider = [];
	    $('.joSliderShow-container').each(function() {
	    	var sliderId = $(this).closest('.hierachical').attr('id');
	    	joSlider[sliderId] = new joSliderHierarchie(this, mobile, 4);
	    });

	    $('body').on('click', '.hierachical .joOpener-container .joOpener', function(e) {
	        e.preventDefault();
	        var that = $(this);
	        ajaxloader.show();

	        var id = that.data('id');
	        var el = $('#'+id);
	        var sliderNum = that.closest('.hierachical').attr('id');
	        if(el.length) {
	        	var item = that.closest('.items');
	        	if(el.is(':visible')) {
	           		closeOtherItems(item);
	        		el.hide();

	       			el.removeClass('isLast');
	       			el.parent().find('.joSliderShowItems:visible:last').addClass('isLast');

	        		that.removeClass('active');
	        		that.closest('li').removeClass('joCheckOpen');
	        		joSlider[sliderNum].paneWidthReset();
		            joSlider[sliderNum].setDisplay('prev');
		            if(jQuery().niceScroll) {
			            el.find('ul').getNiceScroll().hide();
			        }
	        	} else {
	        		closeOtherItems(item);

	       			el.parent().find('.joSliderShowItems.isLast').removeClass('isLast');
	       			el.addClass('isLast');

	        		el.show();
	        		that.removeClass('active');
	        		that.addClass('active');
	        		that.closest('li').addClass('joCheckOpen');
		            joSlider[sliderNum].paneWidthReset();
		            joSlider[sliderNum].setDisplay('next');
		            if(jQuery().niceScroll) {
			            el.find('ul').getNiceScroll().show();
			            el.find('ul').getNiceScroll().resize();
			        }
	        	}
	        	ajaxloader.hide();
	        } else {
	        	var url = that.data('href') ? that.data('href') : that.attr('href');
		        $.when($.get(url)).then(function(data, status, jqXHR) {

		            var item = that.closest('.items');

		            closeOtherItems(item);

		            item.after(data);

		            var newItem = item.next('.joSubHierarchy');
		            newItem.attr('id', id);
			        if(!mobile && jQuery().niceScroll) {
			        	newItem.find('ul').niceScroll({cursorcolor:"rgba(255,255,255,0.5)",autohidemode:false,enableobserver:false});
			        }

	            	newItem.parent().find('.joSliderShowItems.isLast').removeClass('isLast');
	            	newItem.addClass('isLast');

	                joSlider[sliderNum].paneWidthReset();
	                joSlider[sliderNum].setDisplay('next');

		            ajaxloader.hide();
		            that.addClass('active');

		            that.closest('li').addClass('joCheckOpen');
		        }, function(jqXHR, status, errorText) {
		            console.log(jqXHR);
		            messageWriter(status + '<br>' + errorText + '<br>' + 'Upps, etwas ging schief. Bitte aktualisieren Sie die Seite und versuchen Sie es nochmal.');
		            ajaxloader.hide();
		        });
	        }
	    });

	    closeOtherItems = function(item) {
	    	var that = $(item);
	    	var level = parseInt(that.data('level'));
			if(level) {
				var otherItems = that.parent().find('.joSubHierarchy').filter(function() { return parseInt($(this).data('level')) > level && $(this).is(':visible'); });
	        	otherItems.hide().find('.joOpener.active').removeClass('active');
	        	otherItems.find('.joCheckOpen').removeClass('joCheckOpen');
	        	if(jQuery().niceScroll) {
		        	otherItems.find('ul').getNiceScroll().hide();
		        }
	        }
	        that.find('.joOpener.active').removeClass('active');
	    	that.find('.joCheckOpen').removeClass('joCheckOpen');
	    }

	    if(!mobile && jQuery().niceScroll) {
			$('.hierachical .items > ul').niceScroll({cursorcolor:"rgba(255,255,255,0.5)",autohidemode:false,enableobserver:false});
	    }

	    // activate and deactivate nicescroll
		$('.joControls a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	        var id = $(this).attr('href');
	        var items = $(id).find('.items > ul');
	        if(jQuery().niceScroll) {
		        $('.hierachical .items > ul').getNiceScroll().hide();
		        items.getNiceScroll().show();
		        items.getNiceScroll().resize();
		    }

	        if(joSlider[id.substring(1)]) {
				joSlider[id.substring(1)].fullreset();
	        }
		});

	    $(window).resize(function() {
	        $.each(joSlider, function(i, val) {
	    		val.setMobile(mobile);
	    	});

	        if(jQuery().niceScroll) {
		        if(mobile) {
		        	$('.hierachical .items > ul').getNiceScroll().remove();
		        } else {
		        	$('.hierachical .items > ul').niceScroll({cursorcolor:"rgba(255,255,255,0.5)",autohidemode:false,enableobserver:false});
		        }
		    }
	    });

	    // activate and deactivate nicescroll
		$('.joControls a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	        var id = $(this).attr('href');
	        var items = $(id).find('.items > ul');
	        if(jQuery().niceScroll) {
		        $('.hierachical .items > ul').getNiceScroll().hide();
		        items.getNiceScroll().show();
		        items.getNiceScroll().resize();
		    }

	        if(joSlider[id.substring(1)]) {
				joSlider[id.substring(1)].fullreset();
	        }
		});
	}
	
	// cookieInit();
	backToTopInit();
	tooltipInit();
	mapListInit();
	hierachicalInit();
});
