Ext.define('NextThought.view.courseware.assessment.admin.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-reader-header',

	requires: ['NextThought.view.courseware.assessment.AssignmentStatus'],

	cls: 'reader-header',


	setUpGradebox: function() {
		if (!this.assignmentHistory) { return; }

		var grade = this.assignmentHistory.get('Grade'),
			values = grade && grade.getValues(),
			number = values && values.value,
			letter = values && values.letter,
			due = this.assignment.getDueDate(),
			submission = this.assignmentHistory.get('Submission'),
			completed = submission && submission.get('CreatedTime'),
			maxTime = this.assignment.isTimed && this.assignment.getMaxTime(),
			duration = this.assignment.isTimed && this.assignment.getDuration(),
			status = NextThought.view.courseware.assessment.AssignmentStatus.getRenderData({
				due: due,
				completed: completed,
				maxTime: maxTime,
				duration: duration
			});

		this.letterEl.setStyle({display: 'none'});

		if (!grade) {
			try {
				this.assignmentHistory.buildGrade();
			} catch (noGrade) {
				console.warn(noGrade.stack || noGrade.message || noGrade);
				this.gradeBoxEl.hide();
			}
		}

		if (status.completed) {
			if (status.overdue) {
				this.completedEl.addCls('late');
				this.completedEl.dom.setAttribute('data-qtip', status.overdue.qtip);
				this.completedEl.update(TimeUtils.getNaturalDuration(completed.getTime() - due.getTime(), 1) + ' late');
			} else {
				this.completedEl.addCls('ontime');
				this.completedEl.dom.setAttribute('data-qtip', status.completed.qtip);
				this.completedEl.update('On Time');
			}

			if (status.maxTime) {
				if (status.overtime) {
					this.timedEl.addCls('late');
					this.timedEl.dom.setAttribute('data-qtip', status.overdue.qtip);
					this.timedEl.update(status.maxTime.html);
				} else {
					this.timedEl.addCls('ontime');
					this.timedEl.update(status.maxTime.html);
				}
			}
		} else {
			this.completedEl.dom.setAttribute('data-qtip', status.due.qtip);
			this.completedEl.update(status.due.html);

			if (status.maxTime) {
				this.timedEl.update(status.maxTime);
			}
		}

		if (number || number === '') {
			this.currentGrade = number;
			this.gradeEl.dom.value = number;
		}

		if (letter) {
			this.currentLetter = letter;
			//this.letterEl.update(letter);
		}
	},


	changeGrade: function(number, letter) {
		var me = this,
			store = this.pageSource,
			assignment = this.assignment,
			historyItem = this.assignmentHistory,
			grade = historyItem.get('Grade');

		if (!grade) {
			console.error('No assignmentHistroy set, cannot change the grade');
			return;
		}

		//if it hasn't changed don't try to save it
		if (grade.valueEquals(number, letter)) { return; }

		grade.saveValue(number, letter)
			.then(function(g) {
				var link = g.getLink('AssignmentHistoryItem');
				//if the grade that comes back from saving has an assignment history item link
				//and we have a store get the history item from the server and update the backing store
				if (link && store) {
					Service.request(link)
						.then(function(item) {
							var newHistoryItem = ParseUtils.parseItems(item)[0];
							//the item field is set with the assignment and does not come back from the server
							//so fill it in with the previous history item's item
							newHistoryItem.set('item', historyItem.get('item'));
							store.syncBackingStore(newHistoryItem);

							assignment.updateGradeBookEntry(newHistoryItem.get('Grade'));
						})
						.fail(function(reason) {
							console.error('Failed to update assignmenthistoryitem from new grade:', reason);
						});
				}
			})
			.fail(function() {
				grade.reject();
				me.setUpGradebox();
			});
	},


	goTo: function(rec) {
		var v = this.parentView;
		Ext.defer(v.fireGoToAssignment || v.showAssignment, 1, v, [v, rec]);
	}
});
