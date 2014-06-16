Ext.define('NextThought.view.courseware.assessment.admin.reader.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-reader-header',

	cls: 'reader-header',


	setUpGradebox: function() {
		if (!this.assignmentHistory) { return; }

		var grade = this.assignmentHistory.get('Grade'),
			value = grade && grade.get('value'),
			grades = value && value.split(' '),
			number = grades && grades[0],
			letter = (grades && grades[1]) || '-',
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
			grade = this.assignmentHistory.get('Grade'),
			value = number + ' ' + letter;

		if (!grade) {
			console.error('No assignmentHistroy set, cannot change the grade');
			return;
		}

		//if it hasn't changed don't try to save it
		if (value === grade.get('value')) { return; }

		grade.set('value', value);
		grade.save({
			failure: function() {
				grade.reject();
				me.setUpGradebox();
			}
		});
	},


	goTo: function(rec) {
		var v = this.parentView;
		Ext.defer(v.fireGoToAssignment || v.showAssignment, 1, v, [v, rec]);
	}
});
