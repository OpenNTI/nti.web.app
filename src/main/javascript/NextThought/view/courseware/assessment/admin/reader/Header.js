Ext.define('NextThought.view.courseware.assessment.admin.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-reader-header',

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
			duration = this.assignment.isTimed && this.assignmentHistory.getDuration(),
			status = NextThought.view.courseware.assessment.AssignmentStatus.getRenderData({
				due: due,
				completed: completed,
				maxTime: maxTime,
				duration: duration
			});

		this.letterEl.setStyle({display: 'none'});

		if (!grade) {
			console.warn('No grade not even a placeholder');
			this.gradeBoxEl.hide();
		}

		if (NextThought.view.courseware.assessment.AssignmentStatus.hasActions(this.assignmentHistory)) {
			this.actionsEl.removeCls('disabled');
		} else {
			this.actionsEl.addCls('disabled');
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
					this.timedEl.dom.setAttribute('data-qtip', status.overtime.qtip);
					this.timedEl.update(status.maxTime.html);
				} else {
					this.timedEl.addCls('ontime');
					this.timedEl.update(status.maxTime.html);
				}
			}
		} else {
			this.completedEl.removeCls(['late', 'ontime']);
			this.completedEl.dom.setAttribute('data-qtip', status.due.qtip);
			this.completedEl.update(status.due.html);

			if (status.maxTime) {
				this.timedEl.removeCls(['late', 'ontime']);
				this.timedEl.update(status.maxTime.html);
			} else {
				this.timedEl.update('');
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


	showActionsMenu: function(e) {
		if (e.getTarget('.disabled') || !this.assignmentHistory) { return; }

		var me = this,
			menu = NextThought.view.courseware.assessment.AssignmentStatus.getActionsMenu(me.assignmentHistory),
			assignment = me.assignment,
			assignmentCollection = this.pageSource && this.pageSource.assignmentsCollection;

		menu.showBy(me.actionsEl, 'tr-br');
	},


	changeGrade: function(number, letter) {
		var me = this,
			historyItem = this.assignmentHistory;

		if (!historyItem) {
			console.error('No assignmentHistroy set, cannot change the grade');
			return;
		}

		historyItem.saveGrade(number, letter)
			.then(me.fireEvent.bind(me, 'grade-saved'))
			.fail(function(reason) {
				alert('There was an error saving the grade. Please try again later.');
				console.error('Failed to save Grade:', reason);
				Error.raiseForReport(reason);
			})
			.always(function() {
				me.setUpGradebox();
			});
	},


	goTo: function(rec) {
		var v = this.parentView;
		Ext.defer(v.fireGoToAssignment || v.showAssignment, 1, v, [v, rec]);
	}
});
