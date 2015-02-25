Ext.define('NextThought.view.courseware.assessment.admin.performance.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-performance-header',

	gradeTitle: 'Course',

	renderSelectors: {
		gradeboxEl: '.header > .grade'
	},

	setGradeBook: function(assignments) {
		this.assignments = assignments;
		this.setUpGradebox();
	},


	setUpGradebox: function() {
		if (!this.assignments) { return; }

		var me = this,
			finalGrade = me.assignments.getFinalGradeAssignment();

		function fillInValue(grade) {
			var values = grade && grade.getValues(),
				number = values && values.value,
				letter = values && values.letter;

			if (number) {
				me.currentGrade = number;
				me.gradeEl.dom.value = number;
			}

			if (letter) {
				me.currentLetter = letter;
				me.letterEl.update(letter);
			}
		}

		me.gradePromise = finalGrade ? me.assignments.getGradeFor(finalGrade, me.student.getId()) : Promise.reject();


		me.gradePromise.then(function(grade) {
			me.mon(grade, {
				'value-change': fillInValue.bind(me, grade),
				single: true //Why is this only a single event?
			});

			fillInValue(grade);
		});

		//Do we need to do this based off of the gradebook entry?
		//Not just the fact that a final grade assignment exists.
		me.gradeboxEl[finalGrade ? 'show' : 'hide']();
	},


	changeGrade: function(number, letter) {
		if (!this.assignments || !this.gradePromise) { return; }

		// var me = this;

		// me.gradePromse
		// 	.then(function(grade) {
		// 		grade.saveValue(number, letter)
		// 			.then
		// 	});

		var me = this,
			finalGrade = this.assignments.getFinalGradeAssignment(),
			gradePromise = this.assignments.getGradeFor(finalGrade, this.student.getId());
		if (!this.gradebook) { return; }

		var gradebookentry = this.gradebook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', this.student.getId()),
			value = number + ' ' + letter,
			url = this.gradebook.get('href').split(/[\?#]/)[0];


		if (!grade) {
			console.log('No final grade entry cant set it.');


			url += '/no_submit/Final Grade/' + this.student.getId();

			Ext.Ajax.request({
				url: url,
				method: 'PUT',
				jsonData: { value: value },
				success: function(r) {
					var json = Ext.decode(r.responseText, true),
						rec = json && ParseUtils.parseItems(json)[0];

					if (rec) {
						gradebookentry.addItem(rec);
					}
				},
				failure: function() {
					//probably should do something here
					console.error('Failed to save final grade:', arguments);
				}
			});
			return;
		}

		grade.saveValue(number, letter)
			.fail(function() {
				grade.reject();
			});

		// url += '/no_submit/Final Grade/' + this.student.getId();

		// Ext.Ajax.request({
		// url: url,
		//	method: 'PUT',
		//	jsonData: { value: value },
		//	failure: function() {
		//		//probably should do something here
		//		console.error('Failed to save final grade:', arguments);
		//	}
		//	});
	},


	cls: 'performance-header'
});
