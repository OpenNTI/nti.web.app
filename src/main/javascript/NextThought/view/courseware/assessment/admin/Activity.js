Ext.define('NextThought.view.courseware.assessment.admin.Activity', {
	extend: 'NextThought.view.courseware.assessment.Activity',
	alias: 'widget.course-assessment-admin-activity',
	view: 'admin',


	MIME_TYPE_MAP: {
		'application/vnd.nextthought.assessment.userscourseassignmenthistoryitemfeedback': 'addFeedback',
		'application/vnd.nextthought.assessment.assignmentsubmission': 'addStudentSubmission'
	},


	setAssignmentsData: function() {
		var me = this;
		me.callParent(arguments);
		Service.request(me.activityFeedURL).done(function(json) {
			json = ParseUtils.parseItems(Ext.decode(json, true));

			json.forEach(function(o) {
				var m = me.MIME_TYPE_MAP[o.get('MimeType')];
				if (!m) {
					console.warn('Unhandled event type', o.get('MimeType'));
					return;
				}

				me[m](o);
			});
		});
	},


	addFeedback: function(f) {
		console.debug('Feedback', f.raw);
		this.callParent(arguments);
	},


	addStudentSubmission: function(s) {
		var c = s.get('Creator'),
			str = ' submitted',
			r = this.addEvent(this.getEventConfig(c + str, s.get('assignmentId'), s.get('CreatedTime')));

		UserRepository.getUser(c).done(function(u) {
			r.set({
				label: u + str,
				user: u
			});
		});
	},


	goToAssignment: function(s, record) {
		var user = record.get('user');

		if (isMe(record)) {
			user = null; //don't know what to do here. We need a reply-to? or a submission object to get the target user.
		}

		this.fireEvent('goto-assignment', record.get('item'), user);
	}
});
