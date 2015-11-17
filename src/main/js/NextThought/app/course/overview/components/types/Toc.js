Ext.define('NextThought.app.course.overview.components.types.Toc', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-types-toc',

	requires: [
		'NextThought.app.course.overview.components.parts.ContentLink',
		'NextThought.app.course.overview.components.parts.Discussion',
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.IframeWindow',
		'NextThought.app.course.overview.components.parts.Poll',
		'NextThought.app.course.overview.components.parts.QuestionSet',
		'NextThought.app.course.overview.components.parts.Section',
		'NextThought.app.course.overview.components.parts.Spacer',
		'NextThought.app.course.overview.components.parts.Survey',
		'NextThought.app.course.overview.components.parts.Timeline',
		'NextThought.app.course.overview.components.parts.Topic',
		'NextThought.app.course.overview.components.parts.Videos'
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


	initComponent: function() {
		this.callParent(arguments);

		this.buildFromToc(this.record, this.locInfo, this.assignments, this.course);
	},


	setProgress: function(progress) {
		this.items.each(function(item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
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
	}
});
