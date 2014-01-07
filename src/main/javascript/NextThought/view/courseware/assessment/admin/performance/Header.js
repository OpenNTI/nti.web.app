Ext.define('NextThought.view.courseware.assessment.admin.performance.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-performance-header',

	gradeTitle: 'Course',

	setGradeBook: function(gradebook) {
		this.gradebook = gradebook;
		this.setUpGradebox();
	},

	setUpGradebox: function() {
		if (!this.gradebook) { return; }

		var gradebookentry = this.gradebook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', this.student.getId()),
			value = grade && grade.get('value'),
			grades = value && value.split(' '),
			number = grades && grades[0],
			letter = (grades && grades[1]) || '-';

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
		if (!this.gradebook) { return; }

		var gradebookentry = this.gradebook.getItem('Final Grade', 'no_submit'),
			grade = gradebookentry && gradebookentry.getFieldItem('Items', this.student.getId()),
			value = number + ' ' + letter,
			url = this.gradebook.get('href');


		if(!grade){
			console.log('No final grade entry cant set it.');
		

			url += '/no_submit/Final Grade/' + this.student.getId();

			Ext.Ajax.request({
				url: url,
				method: 'PUT',
				jsonData: { value: value },
				success: function(r){
					var json = Ext.decode(r.responseText,true),
						rec = json && ParseUtils.parseItems(json)[0];

					if(rec){
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

		grade.set('value', value);
		grade.save();

		// url += '/no_submit/Final Grade/' + this.student.getId();

		// Ext.Ajax.request({
		// 	url: url,
		// 	method: 'PUT',
		// 	jsonData: { value: value },
		// 	failure: function() {
		// 		//probably should do something here
		// 		console.error('Failed to save final grade:', arguments);
		// 	}
		// });
	},


	cls: 'performance-header'
});
