var Ext = require('extjs');
var UserRepository = require('../../../../../cache/UserRepository');
var ParseUtils = require('../../../../../util/Parsing');
var StudentActivity = require('../student/Activity');
var CoursewareCourseActivity = require('../../../../../model/courseware/CourseActivity');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.admin.Activity', {
    extend: 'NextThought.app.course.assessment.components.student.Activity',
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

		me.nextPageURL = me.activityFeedURL;

		return me.loadPage();
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
		return Service.request(me.nextPageURL).done(function(json) {
			if (me.isDestroyed) {return;}

			json = Ext.decode(json, true);

			json.Class = 'CourseActivity'; //doesn't have a class?

			var activity = ParseUtils.parseItems([json])[0],
				links = Ext.data.Types.LINKS.convert(json.Links);

			me.nextPageURL = links.getRelHref('batch-next');
			me.setMoreLinkState(!!me.nextPageURL);

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
			me.setLastReadFrom(activity);
		});
	},

    deriveEvents: Ext.emptyFn,

    addFeedback: function(f) {
		var rec = this.callParent(arguments),
			path = (f.get('href') || '').split('/').slice(0, -2).join('/');//EWWW... url nastyness

		if (rec && isMe(rec.get('user'))) {
			Service.request(path).done(function(submission) {
				submission = ParseUtils.parseItems(submission)[0];
				var user = submission.get('Creator');
				rec.set('user', user);

				return UserRepository.getUser(submission.get('Creator'));

			}).then(function(u) {

				rec.set('suffix', ' for ' + u);

			}).fail(function(r) {
				console.error(
					'Failed associate instructor feedback activity to a students assignment.',
					' Clicking on this feedback item will just take you to the assignment overview of all students, not a particular one, because:\n',
						r, '\n', f.get('href'));
			});
		}

		return rec;
	},

    addStudentSubmission: function(s) {
		var c = s.get('Creator'),
			str = ' submitted',
			r = this.addEvent(this.getEventConfig('--' + str, s.get('assignmentId'), s.get('CreatedTime')));
		if (r) {
			UserRepository.getUser(c).done(function(u) {
				r.set({
					label: u + str,
					user: u
				});
			});
		}
	},

    goToAssignment: function(s, record) {
		var user = record.get('user'),
			userId,
			me = this,
			assignment = record.get('item'),
			assignmentId = assignment.getId();

		UserRepository.getUser(user)
			.then(function(userObj){
				userId = userObj.getURLPart();

				assignmentId = ParseUtils.encodeForURI(assignmentId);

				if (isMe(user)) {
					//don't know what to do here. We need a reply-to?
					// or a submission object to get the target user.
					user = null;
				}

				me.pushRoute(assignment.get('title'), assignmentId + '/students/' + userId, {
					assignment: assignment,
					user: user
				});
			})
			.fail(function(reason){
				console.log("Couldn't get user because " + reason);
			});
	}
});
