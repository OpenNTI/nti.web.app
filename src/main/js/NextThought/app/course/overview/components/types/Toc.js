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
		'NextThought.app.course.overview.components.parts.Videos',
		'NextThought.app.course.overview.components.types.Base'
	],


	initComponent: function() {
		this.callParent(arguments);

		var base = NextThought.app.course.overview.components.types.Base;

		this.SECTION_CONTAINER_MAP = base.SECTION_CONTAINER_MAP;
		this.SECTION_TYPE_MAP = base.SECTION_TYPE_MAP;
		this.SECTION_TITLE_MAP = base.SECTION_TITLE_MAP;

		this.buildFromToc(this.record, this.locInfo, this.assignments, this.course);
	},


	buildFromToc: function(node, locInfo, assignments, course) {
		debugger;
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
