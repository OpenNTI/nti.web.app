Ext.define('NextThought.view.courseware.assessment.admin.performance.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-performance-header',

	gradeTitle: 'Course',

	renderSelectors: {
		gradeboxEl: '.header > .grade'
	},

	setGradeBook: function(gradebook) {
		this.gradebook = gradebook;
		this.setUpGradebox();
	},

	setUpGradebox: function() {
		if (!this.gradebook) { return; }

		var me = this,
			gradebookentry = me.gradebook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', me.student.getId()),
			value = grade && grade.get('value');

		function fillInValue(key, value) {
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

		if (grade) {
			me.mon(grade, {
				'value-changed': fillInValue,
				single: true
			});
		}

		fillInValue(null, value);

		this.gradeboxEl[gradebookentry ? 'show' : 'hide']();
	},


	changeGrade: function(number, letter) {
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
