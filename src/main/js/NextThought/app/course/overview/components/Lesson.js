Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	requires: [
		'NextThought.app.course.overview.components.types.Content',
		'NextThought.app.course.overview.components.types.Toc'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	isLessonView: true,

	layout: 'none',
	cls: 'course-overview',

	afterRender: function() {
		this.callParent(arguments);

		this.maybeMask();
	},


	setActiveBundle: function(bundle) {
		this.bundle = bundle;
	},


	maybeMask: function() {
		if (!this.rendered || !this.buildingOverview) {
			return;
		}

		this.addCls('loading');
		this.el.mask(getString('NextThought.view.courseware.overview.View.loading'), 'loading');
	},


	maybeUnmask: function() {
		delete this.buildingOverview;

		if (this.rendered) {
			this.removeCls('loading');
			this.el.unmask();
		}
	},


	clear: function() {
		this.removeAll(true);
	},


	__updateProgress: function() {
		if (!this.currentNode || !this.currentNode.getProgress) { return; }

		var me = this;

		return me.currentNode.getProgress()
					.then(function(progress) {
						me.items.each(function(item) {
							if (item.setProgress) {
								item.setProgress(progress);
							}
						});
					})
					.fail(function(reason) {
						console.error('Failed to load progress:', reason);
					});
	},


	getInfo: function(record, course, overviewsrc) {
		return Promise.all([
				course.getAssignments(),
				course.getWrapper && course.getWrapper(),
				ContentUtils.getLocation(record.get('ContentNTIID'), course),
				overviewsrc ? null : course.getVideoIndex()
			]);
	},


	renderLesson: function(record, doNotCache) {
		var me = this,
			course = me.bundle,
			overviewsrc = (record && record.getLink('overview-content')) || null;

		if (!record || !course) {
			//show empty state?
			console.warn('Nothing?', record, course);
			return;
		}

		me.currentNode = record;
		me.currentPage = record.getId();
		me.buildingOverview = true;
		me.maybeMask();

		me.__getCurrentProgress = record.getProgress ? record.getProgress.bind(record) : null;

		if (me.currentOverview && me.currentOverview.record.getId() === record.getId() && !doNotCache) {
			if (me.currentOverview.refresh) {
				 return me.currentOverview.refresh()
				 			.then(me.__updateProgress.bind(me))
							.always(me.maybeUnmask.bind(me));
			}

			me.maybeUnmask();

			return Promise.resolve();
		}

		me.removeAll(true);

		return this.getInfo(record, course, overviewsrc)
			.then(function(results) {
				var assignments = results[0],
					enrollment = results[1],
					//Just use the first one for now
					locInfo = results[2][0],
					videoIndex = results[3];

				//Make sure we haven't changed what record to show before
				//this finished
				if (me.currentPage !== record.getId()) {
					return;
				}

				if (!overviewsrc) {
					me.currentOverview = me.add({
						xtype: 'overview-types-toc',
						record: record,
						locInfo: locInfo,
						assignments: assignments,
						enrollment: enrollment,
						course: course,
						videoIndex: videoIndex,
						navigate: me.navigate.bind(me)
					});

					return;
				}

				me.currentOverview = me.add({
					xtype: 'overview-types-content',
					record: record,
					locInfo: locInfo,
					assignments: assignments,
					enrollment: enrollment,
					course: course,
					navigate: me.navigate.bind(me)
				});


				me.currentOverview.loadCollection(overviewsrc);

				return me.currentOverview.onceLoaded();
			})
			.fail(function(reason) { console.error(reason); })
			.then(me.__updateProgress.bind(me))
			.then(me.maybeUnmask.bind(me));
	},


	navigate: function(obj) {
		obj.parent = this.currentNode;
		this.navigateToObject(obj);
	}
});
