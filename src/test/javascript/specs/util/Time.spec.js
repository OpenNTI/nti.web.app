describe('Time Util Tests', function() {
	describe('Relative Time Tests', function() {

		it('timeDifference 1s', function() {
			var now = Ext.Date.now(),
				then = now - 1000;
			expect(TimeUtils.timeDifference(now, then)).toEqual('1 second ago');
		});

		it('timeDifference 1m', function() {
			var now = Ext.Date.now(),
				then = now - 1000 * 60;

			expect(TimeUtils.timeDifference(now, then)).toEqual('1 minute ago');
		});

		it('timeDifference 1h', function() {
			var now = Ext.Date.now(),
				then = now - 1000 * 60 * 60;

			expect(TimeUtils.timeDifference(now, then)).toEqual('1 hour ago');
		});
		it('timeDifference 1d', function() {
			var now = Ext.Date.now(),
				then = now - 1000 * 60 * 60 * 24;

			expect(TimeUtils.timeDifference(now, then)).toEqual('1 day ago');
		});
		it('timeDifference 2s', function() {
			var now = Ext.Date.now(),
				then = now - 2000;

			expect(TimeUtils.timeDifference(now, then)).toEqual('2 seconds ago');
		});

		it('timeDifference 2m', function() {
			var now = Ext.Date.now(),
				then = now - 2000 * 60;

			expect(TimeUtils.timeDifference(now, then)).toEqual('2 minutes ago');
		});

		it('timeDifference 2h', function() {
			var now = Ext.Date.now(),
				then = now - 2000 * 60 * 60;

			expect(TimeUtils.timeDifference(now, then)).toEqual('2 hours ago');
		});
		it('timeDifference 2d', function() {
			var now = Ext.Date.now(),
				then = now - 2000 * 60 * 60 * 24;

			expect(TimeUtils.timeDifference(now, then)).toEqual('2 days ago');
		});
	});

	describe('sameDay test', function() {
		it('isSameDay', function() {
			var i, today,
				now = new Date();

			function randomTime() {
				var date = new Date(now),
					hour = getRandomInt(0, 23),
					min = getRandomInt(0, 59),
					sec = getRandomInt(0, 59);

				date.setHours(hour, min, sec);

				return date;
			}

			for (i = 0; i < 10; i++) {
				today = randomTime();

				console.log(now, today);

				expect(TimeUtils.isSameDay(now, today)).toBeTruthy();
			}
		});
	});

	describe('getNaturalDuration tests', function() {
		function getTime(weeks, days, hours, minutes, seconds) {
			var s = 1000,
				m = 60 * s,
				h = 60 * m,
				d = 24 * h,
				w = 7 * d;

			return (weeks * w) + (days * d) + (hours * h) + (minutes * m) + (seconds * s);
		}

		describe('Week tests', function() {
			it('5 units, with plurals', function() {
				var time = getTime(2, 2, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 5);

				expect(t).toEqual('2 weeks, 2 days, 2 hours, 2 minutes, and 2 seconds');
			});

			it('5 units, no days, no minutes, no plurals', function() {
				var time = getTime(2, 0, 2, 0, 2),
					t = TimeUtils.getNaturalDuration(time, 5, true);

				expect(t).toEqual('2 week, 2 hour, and 2 second');
			});

			it('4 units, without plurals, no days', function() {
				var time = getTime(2, 0, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 4, true);

				expect(t).toEqual('2 week, 2 hour, and 2 minute');
			});

			it('3 units, no days, no hours, with plurals', function() {
				var time = getTime(2, 0, 0, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 3);

				expect(t).toEqual('2 weeks');
			});


			it('2 units, with plurals', function() {
				var time = getTime(2, 2, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 2);

				expect(t).toEqual('2 weeks and 2 days');
			});

			it('1 unit, with plurals', function() {
				var time = getTime(2, 0, 0, 0, 0),
					t = TimeUtils.getNaturalDuration(time, 1);

				expect(t).toEqual('2 weeks');
			});
		});

		describe('Day tests', function() {
			it('5 units, with plurals', function() {
				var time = getTime(0, 2, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 5);

				expect(t).toEqual('2 days, 2 hours, 2 minutes, and 2 seconds');
			});

			it('2 units, without plurals', function() {
				var time = getTime(0, 2, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 2, true);

				expect(t).toEqual('2 day and 2 hour');
			});
		});

		describe('Hour tests', function() {
			it('5 units, with plurals', function() {
				var time = getTime(0, 0, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 5);

				expect(t).toEqual('2 hours, 2 minutes, and 2 seconds');
			});

			it('2 units, with plurals', function() {
				var time = getTime(0, 0, 2, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 2);

				expect(t).toEqual('2 hours and 2 minutes');
			});
		});

		describe('Minute tests', function() {
			it('5 units, with plurals', function() {
				var time = getTime(0, 0, 0, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 5);

				expect(t).toEqual('2 minutes and 2 seconds');
			});

			it('2 units, with out plurals', function() {
				var time = getTime(0, 0, 0, 2, 2),
					t = TimeUtils.getNaturalDuration(time, 2, true);

				expect(t).toEqual('2 minute and 2 second');
			});
		});

		describe('Second tests', function() {
			it('5 units, with plurals', function() {
				var time = getTime(0, 0, 0, 0, 2),
					t = TimeUtils.getNaturalDuration(time, 5);

				expect(t).toEqual('2 seconds');
			});

			it('1 unit, with out plurals', function() {
				var time = getTime(0, 0, 0, 0, 2),
					t = TimeUtils.getNaturalDuration(time, 1, true);

				expect(t).toEqual('2 second');
			});
		});
	});
});
