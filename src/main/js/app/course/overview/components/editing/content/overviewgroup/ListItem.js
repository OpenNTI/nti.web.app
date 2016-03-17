export default Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem', {
	extend: 'NextThought.common.components.BoundCollection',
	alias: 'widget.overview-editing-overviewgroup-listitem',

	mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer',
		OrderingItem: 'NextThought.mixins.dnd.OrderingItem',
		Transition: 'NextThought.mixins.Transition'
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

	transitionStates: true,

	cls: 'overview-section overview-section-editing',
	bodyCls: 'overview-group-body',

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

		if (this.transition) {
			this.applyTransition(this.transition);
		}
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


	cacheHeight: function() {
		var el = this.el && this.el.dom,
			height = el && el.offsetHeight;

		if (height) {
			el.style.height = height + 'px';
		}
	},


	uncacheHeight: function() {
		var el = this.el && this.el.dom;

		if (el) {
			el.style.height = 'auto';
		}
	},


	beforeSetCollection: function(collection) {
		this.disableOrderingContainer();

		this.activeGroup = collection;

		if (this.rendered) {
			this.setActiveGroup(this.activeGroup);
			this.cacheHeight();
		}
	},


	afterSetCollection: function() {
		this.enableOrderingContainer();
		this.uncacheHeight();
	},


	buildHeader: function(collection) {

		return {
			xtype: 'container',
			cls: 'overview-group-header drag-handle',
			layout: 'none',
			items: [
				{xtype: 'overview-editing-overviewgroup-preview', group: collection},
				{
					xtype: 'overview-editing-controls-edit',
					color: 'white',
					record: collection,
					parentRecord: this.lessonOverview,
					root: this.lessonOverview,
					bundle: this.bundle
				}
			]
		};
	},


	buildFooter: function() {
		return {
			xtype: 'container',
			cls: 'overview-group-footer',
			layout: 'none',
			items: [
				{
					xtype: 'overview-editing-controls-add',
					name: 'Add Content',
					parentRecord: this.record,
					root: this.lessonOverview,
					bundle: this.bundle,
					onPromptOpen: this.suspendUpdates.bind(this),
					onPromptClose: this.resumeUpdates.bind(this)
				}
			]
		};
	},


	getCmpForRecord: function(record, transition, initialState) {
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
			course: this.course,
			transition: transition,
			initialState: initialState,
			navigate: this.navigate
		});

	},


	onCardDrop: function(card, newIndex, moveInfo) {
		this.movedCard = card;

		return this.addCardToGroup(this.record, card, newIndex, moveInfo);
	}
});
