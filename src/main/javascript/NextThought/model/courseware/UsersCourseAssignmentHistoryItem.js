Ext.define('NextThought.model.courseware.UsersCourseAssignmentHistoryItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{name: 'Feedback', type: 'singleItem', persist: false},
		{name: 'Grade', type: 'singleItem', persist: false},
		{name: 'Submission', type: 'singleItem', persist: false},
		{name: 'pendingAssessment', type: 'singleItem'},

		{name: 'feedback', type: 'Synthetic', fn: function(r) {
			var f = r.get('Feedback');
			f = (f && f.get('Items')) || [];
			return f.length;
		}},

		{name: 'submission', type: 'Synthetic', fn: function(r) {
			var s = r.get('Submission');
			return s && s.get('Last Modified');
		}},

		{name: 'grade', type: 'Synthetic', fn: function(r) {
			var s = r.get('Grade');
			return (s && s.get('value')) || '';
		}}
	],


	beginReset: function() {
		var record = this;
		Ext.MessageBox.alert({
			title: 'Are you sure?',
			msg: 'This will reset this assignment for this student. It is not recoverable.' +
				 '\nFeedback and work will be deleted.',
			icon: Ext.Msg.WARNING,
			buttons: Ext.Msg.YES | Ext.Msg.CANCEL,
			fn: function(button) {
				if (button === 'yes') {
					Service.request({url: record.get('href'), method: 'DELETE'})
							.fail(function() {
								alert('Sorry, i could not do that.');
								console.error(arguments);
							})
							.done(function() {
								record.set({
									href: '',
									Submission: null
								});
							});

				}
			}
		});
	}
});
