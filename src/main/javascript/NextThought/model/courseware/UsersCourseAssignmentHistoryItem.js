Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItem', {
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
			return f.length;
		}},

		{name: 'correct', type: 'Synthetic', persist: false, fn: function(r) {
			var a = r.get('pendingAssessment');
			return (a && a.getCorrectCount()) || 0;
		}},

		{name: 'completed', type: 'Synthetic', persist: false, fn: function(r) {
			var s = r.get('Submission');
			return s && s.get('CreatedTime');
		}},

		{name: 'submission', type: 'Synthetic', persist: false, fn: function(r) {
			var s = r.get('Submission');
			return s && s.get('Last Modified');
		}},

		{name: 'grade', type: 'Synthetic', persist: false, fn: function(r) {
			var s = r.get('Grade');
			s = s && (s.get('value') || '').split(' ')[0];
			return s || '';
		}}
		//</editor-fold>
	],


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
					Service.request({url: record.get('href'), method: 'DELETE'})
							.fail(function() {
								alert('Sorry, I could not do that.');
								console.error(arguments);
							})
							.done(function() {
								record.set({
									href: '',
									Submission: null,
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
