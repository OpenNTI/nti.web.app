Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	cls: 'course-overview',

	requires: [
		'NextThought.app.course.overview.components.parts.*',
		'NextThought.proxy.JSONP'
	],

	SECTION_TITLE_MAP: {
		'video': getString('NextThought.view.courseware.overview.View.video'),
		'discussions': getString('NextThought.view.courseware.overview.View.discussion'),
		'additional': getString('NextThought.view.courseware.overview.View.additional'),
		'required': getString('NextThought.view.courseware.overview.View.required'),
		'assessments': getString('NextThought.view.courseware.overview.View.assessment'),
		'session-overview': getString('NextThought.view.courseware.overview.View.session'),
		'assignments': getString('NextThought.view.courseware.overview.View.assignments')
	},


	SECTION_TYPE_MAP: {
		'course-overview-ntivideo': 'video',
		'course-overview-content': 'additional',
		'course-overview-discussion': 'discussions',
		'course-overview-externallink': 'additional',
		'course-overview-naquestionset': 'assessments',
		'course-overview-assignment': 'assignments'
	},


	SECTION_CONTAINER_MAP: {
		'video': 'course-overview-section',
		'discussions': 'course-overview-section',
		'additional': 'course-overview-section',
		'required': 'course-overview-section',
		'assessments': 'course-overview-section',
		'session-overview': 'course-overview-section',
		'assigments': 'course-overview-section'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.maybeMask();
	},


	clear: function() {
		this.removeAll(true);
	},


	__updateProgress: function() {

	},


	renderLesson: function(record) {
		var me = this,
			course = me.bundle,
			overviewSrc = (record && record.getLink('overview-content')) || null;

		if (!record || record.getId() === me.currentPage || !course || !course.getAssignments) {
			//show empty state?
			console.warn('Nothing?', record, course);
		}

		me.buildingOverview = true;
		me.maybeMask();

		me.clear();

		me.currentPage = record.getId();

		me.__getCurrentProgress = record.getProgress ? record.getProgress.bind(record) : null;

		//TODO: figure out how the anlaytic context should work with the new navigation
		// if (AnalyticsUtil.getContextRoot() === 'overview') {
		// 	AnalyticsUtil.addContext(me.currentPage);
		// }
		
		return Promise.all([
			(overviewSrc && ContentProxy.get(overviewSrc)) || Promise.resolve(null),
			course.getAssignments(),
			course.getWrapper && course.getWrapper(),
			ContentUtils.getLocation(record.getId(), course)
		]).then(function(results) {
			var content = results[0],
				assignments = results[1],
				enrollment = results[2],
				//Just use the first one for now
				locInfo = results[3][0];

			if (me.currentPage !== record.getId()) {
				return;
			}

			me.removeAll(true);

			if (!content) {
				me.buildFromToc(record, locInfo, assignments, course);
			} else {
				content = Globals.parseJSON(content);
				me.buildFromContent(content, record, enrollment, locInfo, assignments, course);
			}

			me.__updateProgress();
		})
		.fail(function(reason) { console.error(reason); })
		.done(me.maybeUnmask.bind(me));

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


	buildFromContent: function(content, node, enrollment, locInfo, assignments, course) {
		function getItems(c) { return c.Items || c.items || {};}
		function getType(i) { return 'course-overview-' + (i.MimeType || i.type || '').split('.').last();}
		function getClass(t) { return t && Ext.ClassManager.getByAlias('widget.' + t); }

		function process(items, item) {
			var type = getType(item),
				cls = getClass(type),
				assignment, prev;

			if (!cls) {
				console.debug('No component found for:', item);
				return items;
			}

			if (!ContentUtils.hasVisibilityForContent({
							getAttribute: function(i) { return item[i]; }},
							enrollment.get('Status'))) {
				return items;
			}

			if (cls.isSection) {
				items.push({
					xtype: type,
					title: item.title,
					type: 'content-driven',
					color: item.accentColor,
					items: getItems(item).reduce(process, [])
				});
			} else {
				Ext.applyIf(item, {
					//too many references to these to make changes to accept all spellings.
					'target-ntiid': item['Target-NTIID'],
					ntiid: item.NTIID
				});

				if (cls.isAssessmentWidget) {
					assignment = assignments.isAssignment(item['target-ntiid']);
					type = assignment ? 'course-overview-assignment' : type;
					assignment = assignments.getItem(item['target-ntiid']);
				}

				prev = items.last();
				item = Ext.applyIf({
					xtype: type,
					locationInfo: locInfo,
					courseRecord: node,
					assignment: assignment,
					course: course
				}, item);

				if (cls.buildConfig) {
					item = cls.buildConfig(item, prev);
				}

				if (item) {
					items.push(item);
				}
			}

			return items;
		}

		var items = getItems(content).reduce(process, []);

		this.add([{xtype: 'course-overview-header', title: content.title, record: node}].concat(items));
	}
});
