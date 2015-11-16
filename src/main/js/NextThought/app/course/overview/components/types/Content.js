Ext.define('NextThought.app.course.overview.components.types.Content', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-types-content',

	requires: [
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.Group',
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.overview.Group'
	],


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setCollection: function(collection) {
		this.removeAll(true);

		this.add([
			{xtype: 'course-overview-header', record: this.record, title: collection.title},
			{xtype: 'container', layout: 'none', bodyContainer: true, items: []}
		]);

		this.callParent(arguments);
		// this.buildFromContent(collection, this.record, this.enrollment, this.locInfo, this.assignments, this.course);
	},


	getCmpForRecord: function(record) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.parts.Group.create({
				record: record,
				outlineNode: this.record,
				enrollment: this.enrollment,
				locInfo: this.locInfo,
				assignments: this.assignments,
				course: this.course,
				navigate: this.navigate
			});
		}

		console.warn('Unknown type: ', record);
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
