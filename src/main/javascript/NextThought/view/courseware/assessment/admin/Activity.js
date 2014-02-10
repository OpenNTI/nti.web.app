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

		me.activityFeedURL = Ext.urlAppend(
				me.activityFeedURL,
				Ext.Object.toQueryString({
					batchSize: 20,
					batchStart: 0
				})
		);

		me.loadPage();
	},


	onLoadMore: function() {
		this.loadPage();
	},


	mask: function() {
		if (!this.rendered) {return;}
		this.callParent(arguments);
	},


	unmask: function() {
		if (!this.rendered || this.isDestroyed) {return;}
		this.callParent(arguments);
	},


	setMoreLinkState: function(state) {
		if (!this.rendered) {
			this.on({afterrender: this.setMoreLinkState.bind(this, state), single: true});
			return;
		}
		this.loadMoreLink[state ? 'removeCls' : 'addCls']('hidden');
	},


	loadPage: function() {
		var me = this;
		me.mask();
		return Service.request(me.activityFeedURL).done(function(json) {
			if (me.isDestroyed) {return;}

			json = Ext.decode(json, true);

			json.Class = 'CourseActivity'; //doesn't have a class?

			var activity = ParseUtils.parseItems([json])[0],
				links = Ext.data.Types.LINKS.convert(json.Links);

			me.activityFeedURL = links.getRelHref('batch-next');
			me.setMoreLinkState(!!me.activityFeedURL);

			me.setLastReadFrom(activity);

			me.store.suspendEvents();
			activity.get('Items').forEach(function(o) {
				var m = me.MIME_TYPE_MAP[o.get('MimeType')];
				if (!m) {
					console.warn('Unhandled event type', o.get('MimeType'));
					return;
				}

				try {
					me[m](o);
				} catch (e) {
					console.error(e.stack || e.message || e);
				}
			});
			me.store.resumeEvents();
			me.refresh();
			me.unmask();
		});
	},


	deriveEvents: Ext.emptyFn,


	addFeedback: function(f) {
		var rec = this.callParent(arguments),
			path = (f.get('href') || '').split('/').slice(0, -2).join('/');

		if (!isMe(rec.get('user'))) {
			return rec;
		}

		Service.request(path)
				.done(function(submission) {
					submission = ParseUtils.parseItems(submission)[0];

					rec.set('user', submission.get('Creator'));
				})
				.fail(function() {
					console.error(
						'Failed associate instructor feedback activity to a students assignment.',
						' Clicking on this feedback item will just take you to the assignment overview of all students, not a particular one');
				});

		return rec;
	},


	addStudentSubmission: function(s) {
		var c = s.get('Creator'),
			str = ' submitted',
			r = this.addEvent(this.getEventConfig('--' + str, s.get('assignmentId'), s.get('CreatedTime')));

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
