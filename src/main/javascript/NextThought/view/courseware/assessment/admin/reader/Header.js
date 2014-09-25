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
			submission = this.assignmentHistory.get('Submission');

		this.letterEl.setStyle({display: 'none'});

		if (!grade) {
			try {
				this.assignmentHistory.buildGrade();
			} catch (noGrade) {
				console.warn(noGrade.stack || noGrade.message || noGrade);
				this.gradeBoxEl.hide();
			}
		}

		if (submission && (submission.get('parts') || []).length > 0) {
			if (this.assignmentHistory.get('due') < submission.get('CreatedTime')) {
				this.lateEl.update(getString('NextThought.view.courseware.assessment.admin.reader.Header.late'));
			} else {
				this.lateEl.addCls('good');
				this.lateEl.update(getString('NextThought.view.courseware.assessment.admin.reader.Header.ontime'));
			}
		} else if ((this.assignment.get('parts') || []).length > 0) {
			this.lateEl.update(getString('NextThought.view.courseware.assessment.admin.reader.Header.notsubmitted'));
		}

		//TODO: if the submission was late, set the lateEl to X units late.

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
