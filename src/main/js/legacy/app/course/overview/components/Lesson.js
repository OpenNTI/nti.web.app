const Ext = require('extjs');
const {Overview} = require('@nti/web-course');

const ContentUtils = require('legacy/util/Content');
const {getString} = require('legacy/util/Localization');

const { ROUTE_BUILDERS } = require('./Constants');
require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');
require('./types/Content');
require('./types/Toc');

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


	getRouteFor (object, context) {
		const builder = ROUTE_BUILDERS[object.MimeType];

		return builder ? builder(this.bundle, this.currentOutlineNode, object, context) : null;
	},


	async renderLesson (record, doNotCache) {
		try {
			this.buildingOverview = true;

			if (this.currentOverview) {
				if (!doNotCache && record.getId() === this.activeRecord.getId()) {
					return;
				} else {
					this.currentOverview.destroy();
				}
			}

			this.activeRecord = record;

			const course = await this.bundle.getInterfaceInstance();

			this.removeAll(true);

			this.currentOverview = this.add({
				xtype: 'react',
				component: Overview.Lesson,
				className: 'course-overview-lesson-content',
				course: course,
				layout: Overview.Lesson.List,
				baseroute: '/',
				getRouteFor: this.getRouteFor.bind(this)
			});


			const outline = await course.getOutline({force: !doNotCache});
			const node = outline.getNode(record.get('ContentNTIID'));

			//If another lesson got rendered while we were loading don't do anything
			if (this.activeRecord.getId() !== record.getId()) { return; }

			this.currentOutlineNode = node;

			this.currentOverview.setProps({
				outlineNode: node
			});

		} catch (e) {
			console.error(e);
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
