Ext.define('NextThought.view.courseware.assessment.admin.performance.Header', {
	extend: 'NextThought.view.courseware.assessment.admin.Header',
	alias: 'widget.course-assessment-admin-performance-header',

	gradeTitle: 'Course',

	renderSelectors: {
		gradeboxEl: '.header > .grade'
	},

	setGradeBook: function(historyItem) {
		this.historyItem = historyItem;
		this.setUpGradebox();
	},


	setUpGradebox: function() {
		if (!this.historyItem) {
			this.gradeboxEl.hide();
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', this.setUpGradebox.bind(this));
			return;
		}

		var me = this,
			grade = me.historyItem.get('Grade');

		function fillInValue() {
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

		me.mon(grade, {
			'value-change': fillInValue,
			single: true //Why is this only a single event?
		});

		fillInValue();

		me.gradeboxEl.show();
	},


	changeGrade: function(number, letter) {
		if (!this.historyItem) { return; }

		var me = this,
			grade = me.historyItem.get('Grade'),
			oldValues = grade && grade.getValues();

		if (!letter) {
			letter = oldValues && oldValues.letter;
		}

		if (me.historyItem.shouldSaveGrade(number, letter)) {
			me.historyItem.saveGrade(number, letter)
				.fail(function(reason) {
					console.error('Failed to save final grade:', arguments);
					Error.raiseForReport(reason);
				});
		}
	},


	setPredictedGrade: function(grade) {
		if (!this.rendered) {
			this.on('afterrender', this.setPredictedGrade.bind(this, grade));
			return;
		}

		if (grade) {
			this.predictedEl.update(NextThought.model.courseware.Grade.getDisplay(grade));
			this.predictedContainerEl.removeCls('hidden');
		} else {
			this.predictedContainerEl.addCls('hidden');
		}
	},


	cls: 'performance-header'
});
