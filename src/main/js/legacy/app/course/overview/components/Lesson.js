const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {Overview} = require('nti-web-course');
const {encodeForURI} = require('nti-lib-ntiids');

const ContentUtils = require('legacy/util/Content');
const {getString} = require('legacy/util/Localization');

require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');
require('./types/Content');
require('./types/Toc');

function getURLPart (obj) {
	return encodeForURI(obj.getId ? obj.getId() : obj.getID ? obj.getID() : obj.NTIID);
}

function getAssignmentRoute (course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/assignments/${encodeForURI(obj.getID())}/`;
}

function getDiscussionRoute (course, lesson, obj) {
	return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/object/${encodeForURI(obj.NTIID)}`;
}

const ROUTE_BUILDERS = {
	'application/vnd.nextthought.ntivideo': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/video/${getURLPart(obj)}/`;
	},
	'application/vnd.nextthought.naquestionset': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(obj.containerId)}/`;
	},
	'application/vnd.nextthought.relatedworkref': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/content/${encodeForURI(obj['target-NTIID'] || obj.NTIID)}/`;
	},
	'application/vnd.nextthought.assessment.discussionassignment': getAssignmentRoute,
	'application/vnd.nextthought.assessment.timedassignment': getAssignmentRoute,
	'application/vnd.nextthought.assessment.assignment': getAssignmentRoute,
	'application/vnd.nextthought.ntitimeline': (course, lesson, obj) => {
		return `/app/course/${getURLPart(course)}/lessons/${encodeForURI(lesson.NTIID)}/object/${encodeForURI(obj.NTIID)}/`;
	},
	'application/vnd.nextthought.forums.topic': getDiscussionRoute,
	'application/vnd.nextthought.forums.communityheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.communitytopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.contentheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.dflheadlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.dfltopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.headlinetopic': getDiscussionRoute,
	'application/vnd.nextthought.forums.forum': getDiscussionRoute,
	'application/vnd.nextthought.forums.communityforum': getDiscussionRoute,
	'application/vnd.nextthought.forums.contentforum': getDiscussionRoute,
	'application/vnd.nextthought.forums.dflforum': getDiscussionRoute
};


module.exports = exports = Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	isLessonView: true,
	layout: 'none',
	cls: 'course-overview',

	afterRender: function () {
		this.callParent(arguments);

		this.maybeMask();
	},

	setActiveBundle: function (bundle) {
		this.bundle = bundle;
	},

	maybeMask: function () {
		if (!this.rendered || !this.buildingOverview) {
			return;
		}

		this.addCls('loading');
		this.el.mask(getString('NextThought.view.courseware.overview.View.loading'), 'loading');
	},

	maybeUnmask: function () {
		delete this.buildingOverview;

		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
		}
	},

	clear: function () {
		this.removeAll(true);
	},

	__updateProgress: function () {
		if (!this.currentNode || !this.currentNode.getProgress) { return; }

		var me = this;

		me.currentNode.getProgress()
			.then(function (progress) {
				me.items.each(function (item) {
					if (item.setProgress) {
						item.setProgress(progress);
					}
				});
			})
			.catch(function (reason) {
				console.error('Failed to load progress:', reason);
			});
	},

	__updateCounts: function () {
		if (!this.currentNode || !this.currentNode.getCommentCounts) { return; }

		var me = this;

		me.currentNode.getCommentCounts()
			.then(function (counts) {
				me.items.each(function (item) {
					if (item.setCommentCounts) {
						item.setCommentCounts(counts);
					}
				});
			})
			.catch(function (reason) {
				console.error('Failed to load comment counts: ', reason);
			});
	},

	getInfo: function (record, course, overviewsrc) {
		return Promise.all([
			course.getAssignments(),
			course.getWrapper && course.getWrapper(),
			ContentUtils.getLocation(record.get('ContentNTIID'), course),
			overviewsrc ? null : course.getVideoIndex()
		]);
	},


	getRouteFor (object) {
		const builder = ROUTE_BUILDERS[object.MimeType];

		return builder ? builder(this.bundle, this.currentOutlineNode, object) : null;
	},


	async renderLesson (record, doNotCache) {
		try {
			this.buildingOutline = true;
			this.maybeMask();

			if (this.currentOverview) {
				if (!doNotCache && record.getId() === this.activeRecord.getId()) {
					return;
				} else {
					this.currentOverview.destroy();
				}
			}

			this.activeRecord = record;

			const service = await getService();
			const course = await service.getObject(this.bundle.rawData);
			const outline = await course.getOutline({force: !doNotCache});
			const node = outline.getNode(record.get('ContentNTIID'));
			const content = await node.getContent({force: !doNotCache});

			this.currentOutlineNode = node;
			this.currentLessonOverview = content;

			this.currentOverview = this.add({
				xtype: 'react',
				component: Overview.Lesson,
				className: 'course-overview-lesson-content',
				overview: content,
				outlineNode: node,
				course: course,
				layout: Overview.Lesson.List,
				baseroute: '/',
				getRouteFor: this.getRouteFor.bind(this)
			});
		} catch (e) {
			console.error(e);
		} finally {
			this.maybeUnmask();
		}

		// var me = this,
		// 	course = me.bundle,
		// 	overviewsrc = (record && record.getLink('overview-content')) || null;

		// if (!record || !course) {
		// 	//show empty state?
		// 	console.warn('Nothing?', record, course);
		// 	return;
		// }

		// me.currentNode = record;
		// me.currentPage = record.getId();
		// me.buildingOverview = true;
		// me.maybeMask();

		// me.__getCurrentProgress = record.getProgress ? record.getProgress.bind(record) : null;
		// me.__getCurrentCounts = record.getCommentCounts ? record.getCommentCounts.bind(record) : null;

		// if (me.currentOverview && me.currentOverview.record.getId() === record.getId() && !doNotCache) {
		// 	if (me.currentOverview.refresh) {
		// 		return me.currentOverview.refresh()
		// 			.then(me.__updateProgress.bind(me))
		// 			.then(me.__updateCounts.bind(me))
		// 			.always(me.maybeUnmask.bind(me));
		// 	}

		// 	me.maybeUnmask();

		// 	return Promise.resolve();
		// }

		// me.removeAll(true);

		// return this.getInfo(record, course, overviewsrc)
		// 	.then(function (results) {
		// 		var assignments = results[0],
		// 			enrollment = results[1],
		// 			//Just use the first one for now
		// 			locInfo = results[2][0],
		// 			videoIndex = results[3];

		// 		//Make sure we haven't changed what record to show before
		// 		//this finished
		// 		if (me.currentPage !== record.getId()) {
		// 			return;
		// 		}

		// 		if (!overviewsrc) {
		// 			me.currentOverview = me.add({
		// 				xtype: 'overview-types-toc',
		// 				record: record,
		// 				locInfo: locInfo,
		// 				assignments: assignments,
		// 				enrollment: enrollment,
		// 				course: course,
		// 				videoIndex: videoIndex,
		// 				navigate: me.navigate.bind(me)
		// 			});

		// 			return;
		// 		}

		// 		me.currentOverview = me.add({
		// 			xtype: 'overview-types-content',
		// 			record: record,
		// 			locInfo: locInfo,
		// 			assignments: assignments,
		// 			enrollment: enrollment,
		// 			course: course,
		// 			navigate: me.navigate.bind(me)
		// 		});


		// 		me.currentOverview.loadCollection(overviewsrc);

		// 		return me.currentOverview.onceLoaded();
		// 	})
		// 	.catch(function (reason) { console.error(reason); })
		// 	.then(me.__updateProgress.bind(me))
		// 	.then(me.__updateCounts.bind(me))
		// 	.then(me.maybeUnmask.bind(me));
	},

	navigate: function (obj) {
		obj.parent = this.currentNode;
		this.navigateToObject(obj);
	}
});
