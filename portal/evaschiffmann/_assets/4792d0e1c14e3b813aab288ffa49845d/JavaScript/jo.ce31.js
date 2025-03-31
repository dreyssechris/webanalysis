$(function () {
	audioplayerAction = function () {
		var $audioParent = $('.c31-el .audio-item');

		if ($audioParent.length) {
			$audioParent.each(function (i, v) {
				var $that = $(this);

				if ($that.hasClass('has-loaded')) return true;

				var $audioBack = $that.find('.audio-btn-back');
				var $audioStart = $that.find('.audio-btn-start');
				var $audioForw = $that.find('.audio-btn-forw');
				var $audioPlayer = $that.find('.audio-player');
				var $progress = $that.find('.progress');
				var $progressbar = $that.find('.progress-bar');
				var $progressText = $that.find('.progress-text');

				var $progressTextStart = $that.find('.progress-text.progress-text-start');
				var $progressTextEnd = $that.find('.progress-text.progress-text-end');

				if ($audioBack.length && $audioStart.length && $audioForw.length && $audioPlayer.length) {
					var player = $audioPlayer[0];

					$audioBack.click(function () {
						var currTime = player.currentTime;

						currTime -= 10;
						if (currTime < 0) {
							currTime = 0;
						}

						player.currentTime = currTime;
					});

					$audioForw.click(function () {
						var currTime = player.currentTime;

						currTime += 10;
						if (currTime > player.duration) {
							currTime = player.duration;
						}

						player.currentTime = currTime;
					});

					$audioStart.click(function () {
						if (player.paused) {
							$audioParent.not($that).each(function () {
								var $tmpStart = $(this).find('.audio-btn-start');
								if ($tmpStart.length && $tmpStart.hasClass('playing')) $tmpStart.trigger('click');
							});
							player.play();
							$audioStart.addClass('playing');
							$that.addClass('playing');
							$that.parent().addClass('plr');
						} else {
							player.pause();
							$audioStart.removeClass('playing');
							$that.removeClass('playing');
							$that.parent().removeClass('plr');
						}
					});

					/*
					 *	calc seconds to video time output hh:mm:ss 
					 *  mostly mm:ss
					 */
					function secondsToTime(seconds) {
						var date = new Date(seconds * 1000);
						var hours = date.getHours() - 1;

						if (hours <= 0) hours = '';
						else hours += ':';

						var min = date.getMinutes();
						var sec = date.getSeconds();

						min = min < 10 ? '0' + min : min;
						sec = sec < 10 ? '0' + sec : sec;

						return hours + '' + min + ':' + sec;
					}

					player.addEventListener('timeupdate', function (e) {
						var percent = (player.currentTime / player.duration) * 100;
						$progressbar.css('width', percent + '%');

						var curDate = secondsToTime(player.currentTime);
						var maxDate = secondsToTime(player.duration);

						if ($progressTextStart.length && $progressTextEnd.length) {
							$progressTextStart.html(curDate);
							$progressTextEnd.html(maxDate);
						} else {
							$progressText.html(curDate + ' / ' + maxDate);
						}
					});

					$progress.click(function (e) {
						var currTime = (e.offsetX / $progress.width()) * player.duration;

						if (currTime < 0) {
							currTime = 0;
						}

						if (currTime > player.duration) {
							currTime = player.duration;
						}

						player.currentTime = currTime;

						if (player.paused) player.play();
					});

					$that.addClass('has-loaded');
				}
			});
		}
	}

	audioplayerAction();
});
