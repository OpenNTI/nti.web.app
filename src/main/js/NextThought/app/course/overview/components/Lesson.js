export default Ext.define('NextThought.app.course.overview.components.Lesson', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-overview-lesson',
	ui: 'course',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

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
		if (!this.__getCurrentProgress) { return; }

		var me = this;

		return me.__getCurrentProgress()
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
		me.currentNode = record;

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
				me.currentContent = content;
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
		var me = this;

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
					course: course,
					navigate: me.navigate.bind(me)
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

		me.add([{xtype: 'course-overview-header', title: content.title, record: node, course: course}].concat(items));
	},


	buildFromToc: function(node, locInfo, assignments, course) {
		var me = this,
			SECTION_CONTAINER_MAP = me.SECTION_CONTAINER_MAP,
			SECTION_TYPE_MAP = me.SECTION_TYPE_MAP,
			SECTION_TITLE_MAP = me.SECTION_TITLE_MAP,
			sections = {},
			items = [];

		Ext.each(node.getChildren(), function(i) {
			var c, t, p;

			if (i.getAttribute('suppressed') === 'true') {
				return;
			}

			if (/^object$/i.test(i.tagName) && i.getAttribute('mimeType') === 'application/vnd.nextthought.relatedworkref') {
				return;
			}

			i = me.getComponentForNode(i, locInfo, node, assignments, course);
			t = i && (i.sectionOverride || SECTION_TYPE_MAP[i.xtype] || 'Unknown');

			if (t) {
				if (i.xtype !== 'course-overview-topic') {
					c = sections[t];
					if (!c) {
						c = sections[t] = {
							xtype: SECTION_CONTAINER_MAP[t] || 'course-overview-section',
							type: t,
							title: SECTION_TITLE_MAP[t] || 'Section ' + t,
							items: []
						};
						items.push(c);
					}

					if (t === 'video') {
						if (c.items.length === 0) {
							c.items.push({xtype: 'course-overview-video', items: [], course: course});
						}
						c = c.items[0];
					}

					c.items.push(i);
				}
				else {
					items.push(i);
				}

			}
		});

		this.add([{xtype: 'course-overview-header', record: node}].concat(items));
	},


	getComponentForNode: function(node, info, rec, assignments, course) {
		var type = node && node.nodeName,
			section = (node && node.getAttribute('section')) || null,
			assignment, cls;

		if (/^content:related$/i.test(type) || /^object$/i.test(type)) {
			type = node.getAttribute('type') || node.getAttribute('mimeType');
			type = type && type.replace(/^application\/vnd\.nextthought\./, '');
		}

		type = type && ('course-overview-' + type.toLowerCase());
		cls = Ext.ClassManager.getByAlias('widget.' + type);

		if (cls) {
			if (cls && cls.isAssessmentWidget) {
				assignment = assignments.isAssignment(node.getAttribute('target-ntiid'));
				type = assignment ? 'course-overview-assignment' : type;
				assignment = assignments.getItem(node.getAttribute('target-ntiid'));
			}

			return {
				xtype: type,
				node: node,
				locationInfo: info,
				courseRecord: rec,
				sectionOverride: section,
				assignment: assignment,
				course: course,
				navigate: this.navigate.bind(this)
			};
		}

		if (this.self.debug) {
			console.warn('Unknown overview type:', type, node);
		}
		return null;
	},


	navigate: function(obj) {
		obj.parent = this.currentNode;
		this.navigateToObject(obj);
	}
});
