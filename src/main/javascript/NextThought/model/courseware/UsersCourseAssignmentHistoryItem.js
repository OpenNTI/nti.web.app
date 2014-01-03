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
	]
});
