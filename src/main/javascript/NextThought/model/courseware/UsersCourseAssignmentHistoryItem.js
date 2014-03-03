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
		{name: 'ntiid', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return i && i.get('ntiid');
		}},

		{name: 'ContainerId', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return i && i.get('containerId');
		}},

		{name: 'name', type: 'Synthetic', persist: false, fn: function() {
			var i = this.get('item');
			return (i && i.get('title')) || 'Missing';
		}},

		{name: 'due', type: 'Synthetic', persist: false, fn: function() {
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
			r = r.raw || {};
			return (r.hasOwnProperty('SubmissionCreatedTime') || r.hasOwnProperty('Submission')) ? 'true' : '';
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
		if (this.raw && this.raw.Class === 'UsersCourseAssignmentHistoryItemSummary') {
			this.isSummary = true;
		}
	},


	getAssignmentId: function() {
		var r = this.raw,
			g = r.Grade,
			s = r.Submission,
			p = r.pendingAssessment,
			i = this.get('item');

		return (i && i.getId()) || (g && g.AssignmentId) || (s && s.assignmentId) || (p && p.assignmentId);
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
								delete record.raw.SubmissionCreatedTime;
								delete record.raw.Submission;
								delete record.raw.FeedbackCount;
								record.set({
									Submission: null,
									Grade: null,
									Feedback: null,
									completed: null,
									submission: null
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
			gradeBook = item._gradeBook && item._gradeBook.get('href'),
			base = gradeBook && gradeBook.split(/[\?#]/)[0],
			grade = item && NextThought.model.courseware.Grade.create({
				href: [
						base || '/???/',
						encodeURIComponent(item.get('category_name')),
						encodeURIComponent(item.get('title')),
						student.get ? student.getId() : student
					  ].join('/')

			});

		if (grade) {
			grade.phantom = false;

			this.set('Grade', grade);
		} else {
			console.error('No Assignment associated!!!');
		}
	}
});
