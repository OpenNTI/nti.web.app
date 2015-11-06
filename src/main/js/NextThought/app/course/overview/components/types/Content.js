Ext.define('NextThought.app.course.overview.components.types.Content', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-types-content',

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
		'NextThought.app.course.overview.components.types.Base',
		'NextThought.proxy.JSONP'
	],


	setCollection: function(collection) {
		this.buildFromContent(collection, this.record, this.enrollment, this.locInfo, this.assignments, this.course);
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

		me.add([{xtype: 'course-overview-header', title: content.title, record: node, course: course, onEdit: this.onEdit}].concat(items));
	}
});
