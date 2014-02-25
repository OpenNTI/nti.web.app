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
			this.assignmentHistory.buildGrade();
		}

		if (submission && (submission.get('parts') || []).length > 0) {
			if (this.assignmentHistory.get('due') < submission.get('CreatedTime')) {
				this.lateEl.update('Late');
			} else {
				this.lateEl.addCls('good');
				this.lateEl.update('On Time');
			}
		} else {
			this.lateEl.update('Not Submitted');
		}

		//TODO: if the submission was late, set the lateEl to X units late.

		if (number) {
			this.currentGrade = number;
			this.gradeEl.dom.value = number;
		}

		if (letter) {
			this.currentLetter = letter;
			//this.letterEl.update(letter);
		}
	},


	changeGrade: function(number, letter) {
		var grade = this.assignmentHistory.get('Grade'),
			value = number + ' ' + letter;

		if (!grade) {
			console.error('No assignmentHistroy set cant change the grade');
			return;
		}

		grade.set('value', value);
		grade.save();
	},


	goTo: function(index) {
		var rec = this.store.getAt(index),
			v = this.parentView;
		Ext.defer(v.fireGoToAssignment, 1, v, [null, rec]);
	}
});
