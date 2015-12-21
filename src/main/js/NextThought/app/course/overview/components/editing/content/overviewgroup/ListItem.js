Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-overviewgroup-listitem',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer',
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem'
	},

	requires: [
		'NextThought.model.app.MoveInfo',
		'NextThought.app.course.overview.components.editing.controls.Add',
		'NextThought.app.course.overview.components.editing.controls.Edit',
		'NextThought.app.course.overview.components.editing.content.overviewgroup.Preview',
		'NextThought.app.course.overview.components.editing.content.contentlink.ListItem',
		'NextThought.app.course.overview.components.editing.content.discussion.ListItem',
		'NextThought.app.course.overview.components.editing.content.poll.ListItem',
		'NextThought.app.course.overview.components.editing.content.questionset.ListItem',
		'NextThought.app.course.overview.components.editing.content.survey.ListItem',
		'NextThought.app.course.overview.components.editing.content.timeline.ListItem',
		'NextThought.app.course.overview.components.editing.content.video.ListItem',
		'NextThought.app.course.overview.components.editing.content.videoroll.ListItem',
		'NextThought.app.windows.Actions'
	],


	cls: 'overview-section overview-section-editing',

	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		var onDrop = this.onCardDrop.bind(this),
			setDataTransferHandler = this.setDataTransferHandler.bind(this),
			base = NextThought.app.course.overview.components.editing.content,
			items = [
				base.contentlink.ListItem,
				base.discussion.ListItem,
				base.poll.ListItem,
				base.questionset.ListItem,
				base.survey.ListItem,
				base.timeline.ListItem,
				base.video.ListItem,
				base.videoroll.ListItem
			];

		this.MIME_TO_CMP = items.reduce(function(acc, item) {
			var supported = item.getSupported();

			if (!Array.isArray(supported)) { supported = [supported]; }

			supported.forEach(function(key) {
				acc[key] = item;
			});

			return acc;
		}, {});

		this.setDataTransfer(NextThought.model.app.MoveInfo.create({
			OriginContainer: this.record.parent.getId(),
			OriginIndex: this.record.listIndex
		}));

		this.setDataTransfer(this.record);

		(Object.keys(this.MIME_TO_CMP) || []).forEach(function(key) {
			setDataTransferHandler(key, {
				onDrop: onDrop,
				isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
				effect: 'move'
			});
		});

		this.setCollection(this.record);
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.activeGroup) {
			this.setActiveGroup(this.activeGroup);
		}
	},


	setActiveGroup: function(group) {
		var color = group && group.get('accentColor');

		if (color) {
			this.el.setStyle({backgroundColor: '#' + color});
		} else {
			this.el.setStyle({backgroundColor: ''});
		}
	},


	getBodyContainer: function() {
		return this.down('[isBodyContainer]');
	},


	getOrderingItems: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},


	getDropzoneTarget: function() {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},


	getDragHandle: function() {
		return this.el && this.el.dom && this.el.dom.querySelector('.overview-group-header');
	},


	setCollection: function(collection) {
		debugger;
		this.disableOrderingContainer();
		this.removeAll(true);

		this.activeGroup = collection;

		if (this.rendered) {
			this.setActiveGroup(this.activeGroup);
		}

		this.add([
			{
				xtype: 'container',
				cls: 'overview-group-header drag-handle',
				layout: 'none',
				items: [
					{xtype: 'overview-editing-overviewgroup-preview', group: collection},
					{xtype: 'overview-editing-controls-edit', color: 'white', record: collection, parentRecord: this.lessonOverview, rootRecord: this.lessonOverview}
				]
			},
			{xtype: 'container', cls: 'overview-group-body', layout: 'none', isBodyContainer: true, items: []},
			{
				xtype: 'container',
				cls: 'overview-group-footer',
				layout: 'none',
				items: [
					{
						xtype: 'overview-editing-controls-add',
						name: 'Add Content',
						parentRecord: this.record,
						root: this.lessonOverview
					}
				]
			}
		]);


		this.callParent(arguments);
		this.enableOrderingContainer();
	},


	getCmpForRecord: function(record) {
		var mimeType = record.mimeType,
			cmp = this.MIME_TO_CMP[mimeType],
			assignment;

		if (!cmp) {
			console.warn('Unknown type: ', record);
			return;
		}

		if (cmp.isAssessmentWidget) {
			assignment = this.assignments.getItem(record.get('Target-NTIID'));
		}

		return cmp.create({
			record: record,
			parentRecord: this.record,
			lessonOverview: this.lessonOverview,
			locationInfo: this.locInfo,
			outlineNode: this.outlineNode,
			assignment: assignment,
			course: this.course
		});

	},


	onCardDrop: function(card, newIndex, moveInfo) {
		this.movedCard = card;

		return this.addCardToGroup(this.record, card, newIndex, moveInfo);
	}
});
