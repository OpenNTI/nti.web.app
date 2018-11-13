const Ext = require('@nti/extjs');

const WindowsActions = require('legacy/app/windows/Actions');
const WindowsStateStore = require('legacy/app/windows/StateStore');
const Grade = require('legacy/model/courseware/Grade');
const Email = require('legacy/model/Email');

require('legacy/app/contentviewer/navigation/assignment/Admin');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.performance.Header', {
	extend: 'NextThought.app.contentviewer.navigation.assignment.Admin',
	alias: 'widget.course-assessment-admin-performance-header',

	cls: 'performance-header',

	gradeTitle: 'Course',

	renderSelectors: {
		gradebodEl: '.header > .grade'
	},


	initComponent: function () {
		this.callParent(arguments);

		this.WindowActions = WindowsActions.create();
		this.WindowStore = WindowsStateStore.getInstance();
	},


	setGradeBook: function (historyItem) {
		this.historyItem = historyItem.getMostRecentHistoryItem ? historyItem.getMostRecentHistoryItem() : historyItem;
		this.setUpGradeBox();
	},


	setUpGradeBox: function () {
		if (!this.historyItem) {
			this.gradeBoxEl.hide();
			return;
		}

		if (!this.rendered) {
			this.on('afterrender', this.setUpGradebox.bind(this));
			return;
		}

		var me = this,
			grade = me.historyItem.get('Grade');

		function fillInValue () {
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
			'value-change': fillInValue
		});

		fillInValue();

		me.gradeBoxEl.show();
	},


	setupCourseEmail: function (emailLink) {
		var emailEl = this.el.down('.email');
		this.emailLink = emailLink;

		if (emailEl) {
			this.mon(emailEl, 'click', this.showEmailEditor.bind(this));
			emailEl.show();
		}
	},


	showEmailEditor: function (e) {
		var emailRecord = new Email();

		// Set the link to post the email to
		emailRecord.set('url', this.emailLink);
		emailRecord.set('Receiver', this.student);

		// Cache the email record
		this.WindowStore.cacheObject('new-email', emailRecord);
		this.WindowActions.showWindow('new-email', null, e.getTarget());
	},


	changeGrade: function (number, letter) {
		if (!this.historyItem) { return; }

		var me = this,
			grade = me.historyItem.get('Grade'),
			oldValues = grade && grade.getValues();

		if (!letter) {
			letter = oldValues && oldValues.letter;
		}

		if (me.historyItem.shouldSaveGrade(number, letter)) {
			me.historyItem.saveGrade(number, letter)
				.catch(function (reason) {
					console.error('Failed to save final grade:', arguments);
				});
		}
	},


	setPredictedGrade: function (grade) {
		if (!this.rendered) {
			this.on('afterrender', this.setPredictedGrade.bind(this, grade));
			return;
		}

		if (grade) {
			this.predictedEl.update(Grade.getDisplay(grade));
			this.predictedContainerEl.removeCls('hidden');
		} else {
			this.predictedContainerEl.addCls('hidden');
		}
	}
});
