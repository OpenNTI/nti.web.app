var Ext = require('extjs');
var Globals = require('../../../../../../../util/Globals');
var ComponentsBoundCollection = require('../../../../../../../common/components/BoundCollection');
var DndOrderingContainer = require('../../../../../../../mixins/dnd/OrderingContainer');
var MixinsFillScreen = require('../../../../../../../mixins/FillScreen');
var OverviewGroup = require('../../../../../../../model/courses/overview/Group');
var ControlsAdd = require('../../controls/Add');
var OverviewgroupListItem = require('../overviewgroup/ListItem');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.lessonoverview.Index', {
    extend: 'NextThought.common.components.BoundCollection',
    alias: 'widget.overview-editing-lessonoverview',

    mixins: {
		OrderingContainer: 'NextThought.mixins.dnd.OrderingContainer',
		FillScreen: 'NextThought.mixins.FillScreen'
	},

    emptyText: 'Add a section to get started.',
    transitionStates: true,
    ui: 'course',
    cls: 'course-overview course-overview-editing',

    initComponent: function() {
		this.callParent(arguments);

		this.setDataTransferHandler(NextThought.model.courses.overview.Group.mimeType, {
			onDrop: this.onGroupDrop.bind(this),
			isValid: NextThought.mixins.dnd.OrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.setCollection(this.contents);
	},

    afterRender: function() {
		this.callParent(arguments);

		this.fillScreen(this.el.dom, 20);
	},

    onceLoaded: function() {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		items = items || [];

		return Promise.resolve(items.map(function(item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
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

    cacheHeight: function() {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = dom.offsetHeight + 'px';
		}
	},

    uncacheHeight: function() {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = 'auto';
		}
	},

    beforeSetCollection: function(collection) {
		this.lessonOverview = collection;
		this.disableOrderingContainer();
		this.cacheHeight();
	},

    afterSetCollection: function() {
		this.uncacheHeight();
		this.enableOrderingContainer();
	},

    buildFooter: function() {
		return {
			xtype: 'container',
			cls: 'course-overview-footer',
			layout: 'none',
			items: [
				{
					xtype: 'overview-editing-controls-add',
					name: 'Add Section',
					parentRecord: this.lessonOverview,
					root: this.lessonOverview
				}
			]
		};
	},

    getCmpForRecord: function(record, transition, initialState) {
		if (record instanceof NextThought.model.courses.overview.Group) {
			return NextThought.app.course.overview.components.editing.content.overviewgroup.ListItem.create({
				record: record,
				lessonOverview: this.lessonOverview,
				outlineNode: this.record,
				enrollment: this.enrollment,
				locInfo: this.locInfo,
				assignments: this.assignments,
				bundle: this.bundle,
				course: this.bundle,
				addCardToGroup: this.addCardToGroup.bind(this),
				initialState: initialState,
				transition: transition,
				navigate: this.navigate
			});
		}

		console.warn('Unknown type: ', record);
	},

    onGroupDrop: function(group, newIndex, moveInfo) {
		this.suspendUpdates();

		return this.contents.moveToFromContainer(group, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.contents)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(this.resumeUpdates.bind(this));
	},

    addCardToGroup: function(group, card, newIndex, moveInfo) {
		this.suspendUpdates();

		return group.moveToFromContainer(card, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.contents)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(this.resumeUpdates.bind(this));
	}
});
