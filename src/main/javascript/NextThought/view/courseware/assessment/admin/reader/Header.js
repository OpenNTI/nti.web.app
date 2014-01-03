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
			letter = (grades && grades[1]) || '-';

		if (!this.assignmentHistory.get('Submission')) {
			this.gradeEl.addCls('disabled');
			this.letterEl.addCls('disabled');
			this.lateEl.update('No Submission');
			return;
		}

		if (number) {
			this.currentGrade = number;
			this.gradeEl.dom.value = number;
		}

		if (letter) {
			this.currentLetter = letter;
			this.letterEl.update(letter);
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
		Ext.defer(v.goToAssignment, 1, v, [null, rec]);
	}
});
