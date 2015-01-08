describe('assignment status tests', function() {
	var maxTime = 1000 * 60 * 20, //20 minutes
		dueDate = new Date(),
		Status = NextThought.view.courseware.assessment.AssignmentStatus;

	describe('maxtime tests', function() {
		it('no maxTime', function() {
			var data = {};

			expect(Status.__getMaxTimeStatus(data)).toBeFalsy();
		});

		it('has maxTime, no duration', function() {
			var data = {
					maxTime: maxTime
				},
				s = Status.__getMaxTimeStatus(data);

			expect(s.html).toBe('20 minute time limit');
			expect(s.cls).toBeFalsy();
		});

		it('duration < maxTime', function() {
			var data = {
					maxTime: maxTime,
					duration: 1000 * 60 * 5 //5 minutes
				},
				s = Status.__getMaxTimeStatus(data);

			expect(s.html).toBe('5 minutes');
			expect(s.cls).toBe('ontime');
		});

		it('duration > maxTime', function() {
			var data = {
					maxTime: maxTime,
					duration: 1000 * 60 * 25 //25 minutes
				},
				s = Status.__getMaxTimeStatus(data);

			expect(s.html).toBe('25 minutes');
			expect(s.cls).toBe('overtime');
		});
	});


	describe('overtime tests', function() {
		it('maxTime > duration', function() {
			var data = {
				maxTime: maxTime,
				duration: 1000 * 60 * 5 //5 minutes
			};

			expect(Status.__getOverTimeStatus(data)).toBeFalsy();
		});

		it('maxTime < duration', function() {
			var data = {
					maxTime: maxTime,
					duration: 1000 * 60 * 25 //25 minutes
				},
				s = Status.__getOverTimeStatus(data);

			expect(s.html).toBe('overtime');
			expect(s.qtip).toBe('5 minutes overtime');
		});
	});

	describe('due tests', function() {
		it('due today', function() {
			var data = {
					due: dueDate
				},
				s = Status.__getDueStatus(data);

			expect(s.html).toBe('Due Today!');
			expect(s.cls).toBe('today');
		});

		it('due in the future', function() {
			var due = new Date(dueDate), data, s;

			due.setYear(due.getFullYear() + 1);

			data = {
				due: due
			};

			s = Status.__getDueStatus(data);

			expect(s.html).toBeTruthy();//no need to test Ext's date formatter
			expect(s.html).not.toBe('Due Today!');
			expect(s.cls).toBeFalsy();
		});

		it('due in the past', function() {
			var due = new Date(dueDate), data, s;

			due.setYear(due.getFullYear() - 1);

			data = {
				due: due
			};

			s = Status.__getDueStatus(data);

			expect(s.html).toBeTruthy();
			expect(s.cls).toBe('late');
		});
	});

	describe('overdue tests', function() {
		it('completedDate < dueDate', function() {
			var completed = new Date(dueDate), data, s;

			completed.setYear(completed.getFullYear() - 1);

			data = {
				due: dueDate,
				completed: completed
			};

			s = Status.__getOverDueStatus(data);

			expect(s).toBeFalsy();
		});

		it('completedDate === dueDate', function() {
			var completed = new Date(dueDate),
				s = Status.__getOverDueStatus({
					due: dueDate,
					completed: completed
				});

			expect(s).toBeFalsy();
		});

		it('completedDate > dueDate', function() {
			var completed = new Date(dueDate), data, s;

			completed.setYear(completed.getFullYear() + 1);

			data = {
				due: dueDate,
				completed: completed
			};

			s = Status.__getOverDueStatus(data);

			expect(s.html).toBe('overdue');
		});
	});

	describe('tpl tests', function() {
		var testBody;

		beforeEach(function() {
			testBody = document.createElement('div');
			document.body.appendChild(testBody);
		});

		afterEach(function() {
			document.body.removeChild(testBody);
		});

		function addData(data) {
			var html = Status.getStatusHTML(data);

			testBody.innerHTML = html;
		}

		function getStatus() {
			return testBody.querySelector('.assignment-status');
		}

		function getDue() {
			return testBody.querySelector('.status-item.due');
		}

		function getMaxTime() {
			return testBody.querySelector('.status-item.maxTime');
		}

		function getCompleted() {
			return testBody.querySelector('.status-item.completed');
		}

		function getOverTime() {
			return testBody.querySelector('.status-item.completed .overtime');
		}

		function getOverDue() {
			return testBody.querySelector('.status-item.completed .overdue');
		}

		function expectEls(e) {
			expect(getStatus()).toBeTruthy();
			expect(getDue())[e.due ? 'toBeTruthy' : 'toBeFalsy']();
			expect(getCompleted())[e.completed ? 'toBeTruthy' : 'toBeFalsy']();
			expect(getMaxTime())[e.maxTime ? 'toBeTruthy' : 'toBeFalsy']();
			expect(getOverTime())[e.overTime ? 'toBeTruthy' : 'toBeFalsy']();
			expect(getOverDue())[e.overDue ? 'toBeTruthy' : 'toBeFalsy']();
		}

		it('Not timed, not completed, not overtime, not overdue', function() {
			addData({
				due: dueDate
			});

			expectEls({
				due: true
			});
		});

		it('Timed, not completed, not overtime, not overdue', function() {
			addData({
				due: dueDate,
				maxTime: maxTime
			});

			expectEls({
				due: true,
				maxTime: true
			});
		});

		it('not timed, completed, not overtime, not overdue', function() {
			var completed = new Date(dueDate);

			completed.setYear(completed.getFullYear() - 1);

			addData({
				due: dueDate,
				completed: completed
			});

			expectEls({
				completed: true
			});
		});

		it('timed, completed, not overtime, not overdue', function() {
			var completed = new Date(dueDate);

			completed.setYear(completed.getFullYear() - 1);

			addData({
				due: dueDate,
				completed: completed,
				maxTime: maxTime,
				duration: 1000 * 60 * 5 //5 minutes
			});

			expectEls({
				completed: true,
				maxTime: true
			});
		});

		it('timed, completed, overtime, not overdue', function() {
			var completed = new Date(dueDate);

			completed.setYear(completed.getFullYear() - 1);

			addData({
				due: dueDate,
				completed: completed,
				maxTime: maxTime,
				duration: 1000 * 60 * 25 //25 minutes
			});

			expectEls({
				completed: true,
				maxTime: true,
				overTime: true
			});
		});

		it('timed, completed, not overtime, not overdue', function() {
			var completed = new Date(dueDate);

			completed.setYear(completed.getFullYear() + 1);

			addData({
				due: dueDate,
				completed: completed,
				maxTime: maxTime,
				duration: 1000 * 60 * 5 //5 minutes
			});

			expectEls({
				completed: true,
				maxTime: true,
				overDue: true
			});
		});

		it('timed, completed, overtime, overdue', function() {
			var completed = new Date(dueDate);

			completed.setYear(completed.getFullYear() + 1);

			addData({
				due: dueDate,
				completed: completed,
				maxTime: maxTime,
				duration: 1000 * 60 * 25 //25 minutes
			});

			expectEls({
				completed: true,
				maxTime: true,
				overDue: true,
				overTime: true
			});
		});
	});

    describe('time string tests', function(){
        it('expects hours to be rounded up', function(){
            var t = {
                days: "1.116121212",
                hours: "2.6333",
                minutes: "15.556667788",
                seconds: "23.243432345"
            }, s;

            s = Status.getTimeString(t, true);
            expect(s).toEqual("1 Day 3 Hours");
        });

        it('expects minutes to be rounded up', function(){
            var t = {
                days: "0",
                hours: "2.0333",
                minutes: "15.556667788",
                seconds: "23.243432345"
            }, s;

            s = Status.getTimeString(t, true);
            expect(s).toEqual("2 Hours 16 Minutes");
        });

        it('expects to only see minutes', function(){
            var t = {
                days: "0",
                hours: "0",
                minutes: "15.556667788",
                seconds: "23.643432345"
            }, s;

            s = Status.getTimeString(t, true);
            expect(s).toEqual("16 Minutes");
        });

        it('expects to only see seconds', function(){
            var t = {
                days: "0",
                hours: "0",
                minutes: "0.556667788",
                seconds: "23.643432345"
            }, s;

            s = Status.getTimeString(t, true);
            expect(s).toEqual("24 Seconds");
        });

        it('checks if time is null', function(){
            var s = Status.getTimeString(null, false);

            expect(s).toBeFalsy();
        });

        it('days and hours not provided.', function(){
            var t = {
                minutes: "3.912",
                seconds: "12.8"
            }, s;

            s = Status.getTimeString(t, false);

            expect(s).toEqual("3 Minutes");
        });


    });
});








