Ext.define('NextThought.app.course.overview.components.parts.Group', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-group',

	requires: [
		'NextThought.app.course.overview.components.parts.ContentLink',
		'NextThought.app.course.overview.components.parts.Discussion',
		'NextThought.app.course.overview.components.parts.Header',
		'NextThought.app.course.overview.components.parts.IframeWindow',
		'NextThought.app.course.overview.components.parts.Poll',
		'NextThought.app.course.overview.components.parts.QuestionSet',
		'NextThought.app.course.overview.components.parts.SectionHeader',
		'NextThought.app.course.overview.components.parts.Spacer',
		'NextThought.app.course.overview.components.parts.Survey',
		'NextThought.app.course.overview.components.parts.Timeline',
		'NextThought.app.course.overview.components.parts.Topic',
		'NextThought.app.course.overview.components.parts.Video',
		'NextThought.app.course.overview.components.parts.VideoRoll',
		'NextThought.model.VideoRoll',
		'NextThought.model.Video'
	],

	ui: 'course',
	cls: 'overview-group',


	initComponent: function() {
		this.callParent(arguments);

		this.add([
			{
				xtype: 'course-overview-section-header',
				title: this.record.get('title'),
				color: this.record.get('accentColor'),
				type: 'content-driven'
			},
			{
				xtype: 'container',
				bodyContainer: true,
				layout: 'none',
				cls: 'group-container',
				items: []
			}
		]);

		this.setCollection(this.record);
	},


	onceLoaded: function() {
		var me = this;

		return new Promise(function(fulfill, reject) {
			if (me.collectionSet) {
				fulfill();
			} else {
				me.on({
					single: true,
					'collection-set': fulfill
				});
			}
		});
	},


	setProgress: function(progress) {
		var body = this.getBodyContainer();

		body.items.each(function(item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	},


	setCommentCounts: function(commentCounts) {
		var body = this.getBodyContainer();

		body.items.each(function(item) {
			if (item.setCommentCounts) {
				item.setCommentCounts(commentCounts);
			}
		});
	},


	getBodyContainer: function() {
		return this.down('[bodyContainer]');
	},


	setCollection: function(collection) {
		var me = this,
			items = me.getItems(collection),
			body = me.getBodyContainer(),
			enrollment = me.enrollment,
			assignments = me.assignments,
			locInfo = me.locInfo,
			course = me.course,
			node = me.outlineNode;

		function getType(i) { return 'course-overview-' + (i.MimeType || i.type || '').split('.').last();}
		function getClass(t) { return t && Ext.ClassManager.getByAlias('widget.' + t); }

		if (!items.length) {
			this.hide();
		}


		items = (items || []).reduce(function(items, record) {
			var item = record.raw,
				type = getType(item),
				cls = getClass(type),
				assignment;


			if (!cls) {
				console.debug('No component found for:', item);
				return items;
			}

			//The server should be taking care of this now...
			// if (!ContentUtils.hasVisibilityForContent({
			// 				getAttribute: function(i) { return item[i]; }},
			// 				enrollment.get('Status'))) {
			// 	return items;
			// }

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
				}

				item = Ext.applyIf({
					xtype: type,
					locationInfo: locInfo,
					courseRecord: node,
					assignment: assignment,
					course: course,
					navigate: me.navigate.bind(me),
					record: record
				}, item);

				if (item && item.assignment) {
					items.push(assignments.fetchAssignment(item['target-ntiid']).then(function(assignment) {
						item.assignment = assignment;

						return item;
					}));
				} else if (item) {
					items.push(item);
				}
			}

			return items;
		}, []);

		Promise.all(items)
			.then(function(items) {
				body.add(items);

				me.collectionSet = true;
				me.fireEvent('collection-set');
			});
	},

	navigate: function() {}
});
