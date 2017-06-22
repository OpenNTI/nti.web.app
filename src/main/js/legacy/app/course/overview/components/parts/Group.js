const Ext = require('extjs');

require('legacy/common/components/BoundCollection');
require('legacy/model/VideoRoll');
require('legacy/model/Video');
require('legacy/util/Content');

require('./ContentLink');
require('./Discussion');
require('./Header');
require('./IframeWindow');
require('./Poll');
require('./QuestionSet');
require('./SectionHeader');
require('./Spacer');
require('./Survey');
require('./Timeline');
require('./Topic');
require('./Video');
require('./VideoRoll');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.Group', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-group',
	ui: 'course',
	cls: 'overview-group',

	initComponent: function () {
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

	onceLoaded: function () {
		var me = this;

		return new Promise(function (fulfill, reject) {
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

	setProgress: function (progress) {
		var body = this.getBodyContainer();

		body.items.each(function (item) {
			if (item.setProgress) {
				item.setProgress(progress);
			}
		});
	},

	setCommentCounts: function (commentCounts) {
		var body = this.getBodyContainer();

		body.items.each(function (item) {
			if (item.setCommentCounts) {
				item.setCommentCounts(commentCounts);
			}
		});
	},

	getBodyContainer: function () {
		return this.down('[bodyContainer]');
	},

	setCollection: function (collection) {
		var me = this,
			items = me.getItems(collection),
			body = me.getBodyContainer(),
			assignments = me.assignments,
			locInfo = me.locInfo,
			course = me.course,
			node = me.outlineNode;

		function getType (i) { return 'course-overview-' + (i.MimeType || i.type || '').split('.').last();}
		function getClass (t) { return t && Ext.ClassManager.getByAlias('widget.' + t); }

		if (!items.length) {
			this.hide();
		}


		items = (items || []).reduce(function (accItems, record) {
			var item = record.raw,
				type = getType(item),
				cls = getClass(type),
				assignment;


			if (!cls) {
				console.debug('No component found for:', item);
				return accItems;
			}

			//The server should be taking care of this now...
			// if (!ContentUtils.hasVisibilityForContent({
			//				getAttribute: function(i) { return item[i]; }},
			//				enrollment.get('Status'))) {
			//	return accItems;
			// }

			if (cls.isSection) {
				accItems.push({
					xtype: type,
					title: item.title,
					type: 'content-driven',
					color: item.accentColor,
					items: me.getItems(item).reduce(process, [])
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
					accItems.push(assignments.fetchAssignment(item['target-ntiid'])
						.then(function (newAssignment) {
							item.assignment = newAssignment;

							return item;
						})
						.catch(function (reason) {
							console.error('Unable to update assignment: ', reason);

							item.assignment = assignments.getItem(item['target-ntiid']);

							return item;
						})
					);
				} else if (item) {
					accItems.push(item);
				}
			}

			return accItems;
		}, []);

		Promise.all(items)
			.then(function (newItem) {
				body.add(newItem);

				me.collectionSet = true;
				me.fireEvent('collection-set');
			});
	},

	navigate: function () {}
});
