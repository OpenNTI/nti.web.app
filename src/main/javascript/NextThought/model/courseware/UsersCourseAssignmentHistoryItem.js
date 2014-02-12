Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItem', {
	alternateClassName: 'NextThought.model.courseware.UsersCourseAssignmentHistoryItemSummary',
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Feedback', type: 'singleItem', persist: false},
		{name: 'Grade', type: 'singleItem', persist: false},
		{name: 'Submission', type: 'singleItem', persist: false},
		{name: 'pendingAssessment', type: 'singleItem', persist: false},

		//set by the Assignment model when loading history. This will be unset for all other uses.
		{name: 'item', type: 'auto', persist: false},

		//<editor-fold desc="Synthetic fields derived from server data and the assocated assignment.">
		{name: 'ntiid', type: 'Synthetic', persist: false, fn: function(r) {
			var i = this.get('item');
			return i && i.get('ntiid');
		}},

		{name: 'ContainerId', type: 'Synthetic', persist: false, fn: function(r) {
			var i = this.get('item');
			return i && i.get('containerId');
		}},

		{name: 'name', type: 'Synthetic', persist: false, fn: function(r) {
			var i = this.get('item');
			return i && i.get('title');
		}},

		{name: 'due', type: 'Synthetic', persist: false, fn: function(r) {
			var i = this.get('item');
			return i && i.getDueDate();
		}},


		{name: 'feedback', type: 'Synthetic', persist: false, fn: function(r) {
			var f = r.get('Feedback');
			f = (f && f.get('Items')) || [];
			return f.length || r.raw.FeedbackCount;
		}, convert: function() {
			this.sortType = Ext.data.SortTypes.asInt;
			return this.type.convert.apply(this, arguments);
		}},

		{name: 'correct', type: 'int', persist: false, affectedBy: 'pendingAssessment', convert: function(v, r) {
			var a = r.get('pendingAssessment');
			return (a && a.getCorrectCount()) || 0;
		}},


		{name: 'completed', type: 'date', dateFormat: 'timestamp', persist: false, mapping: 'SubmissionCreatedTime', affectedBy: 'Submission',
			convert: function(v, r) {
			if (!v) {
				var s = r.get('Submission');
				return (s && this.type.convert.call(this, s.raw.CreatedTime));
			}
			return this.type.convert.call(this, v);
		}},


		{name: 'submission', type: 'string', persist: false, affectedBy: 'Submission', convert: function(v, r) {
			return (r.raw.hasOwnProperty('SubmissionCreatedTime') || r.raw.hasOwnProperty('Submission')) ? 'true' : '';
		} },


		{name: 'grade', type: 'Synthetic', persist: false, fn: function(r) {
			var s = r.get('Grade');
			s = s && (s.get('value') || '').split(' ')[0];
			return s || '';
		}}
		//</editor-fold>
	],


	constructor: function() {
		this.callParent(arguments);
		if (this.raw.Class === 'UsersCourseAssignmentHistoryItemSummary') {
			this.isSummary = true;
		}
	},


	beginReset: function() {
		var record = this;
		Ext.MessageBox.alert({
			title: 'Are you sure?',
			msg: 'This will reset this assignment for this student. It is not recoverable.' +
				 '\nFeedback and work will be deleted.',
			icon: 'warning-red',
			buttonText: true,
			buttons: {
				cancel: 'Cancel',
				yes: 'caution:Yes'
			},
			fn: function(button) {
				if (button === 'yes') {
					Service.request({
						url: record.getLink('UsersCourseAssignmentHistoryItem') || record.get('href'),
						method: 'DELETE'})
							.fail(function() {
								alert('Sorry, I could not do that.');
								console.error(arguments);
							})
							.done(function() {
								delete record.isSummary;
								record.set({
									completed: null,
									SubmissionCreatedTime: null,
									Submission: null,
									submission: null,
									Grade: null,
									Feedback: null
								});
							});

				}
			}
		});
	},


	buildGrade: function() {
		//if we already have a grade don't set a new one
		if (this.get('Grade')) { return; }

		var item = this.get('item'),
			student = this.get('Creator'),
			grade = NextThought.model.courseware.Grade.create({
				href: [
						item._gradeBook.get('href'),
						encodeURIComponent(item.get('category_name')),
						encodeURIComponent(item.get('title')),
						student.get ? student.getId() : student
					  ].join('/')

			});

		grade.phantom = false;

		this.set('Grade', grade);
	}
});
