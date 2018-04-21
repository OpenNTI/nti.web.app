const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const DndOrderingContainer = require('legacy/mixins/dnd/OrderingContainer');
const OverviewGroup = require('legacy/model/courses/overview/Group');

const OverviewgroupListItem = require('../overviewgroup/ListItem');

require('legacy/common/components/BoundCollection');
require('legacy/mixins/FillScreen');
require('../../controls/Add');


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

	initComponent: function () {
		this.callParent(arguments);

		this.setDataTransferHandler(OverviewGroup.mimeType, {
			onDrop: this.onGroupDrop.bind(this),
			isValid: DndOrderingContainer.hasMoveInfo,
			effect: 'move'
		});

		this.contents.onceFilledIn()
			.then(this.setCollection.bind(this, this.contents));
	},

	afterRender: function () {
		this.callParent(arguments);

		this.fillScreen(this.el.dom, 20);
	},

	onceLoaded: function () {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		items = items || [];

		return Promise.resolve(items.map(function (item) {
			if (item && item.onceLoaded) {
				return item.onceLoaded();
			}

			return Promise.resolve();
		}));
	},

	getOrderingItems: function () {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},

	getDropzoneTarget: function () {
		var body = this.getBodyContainer();

		return body && body.el && body.el.dom;
	},

	cacheHeight: function () {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = dom.offsetHeight + 'px';
		}
	},

	uncacheHeight: function () {
		var dom = this.el && this.el.dom;

		if (dom) {
			dom.style.height = 'auto';
		}
	},

	beforeSetCollection: function (collection) {
		this.lessonOverview = collection;
		this.disableOrderingContainer();
		this.cacheHeight();
	},

	afterSetCollection: function () {
		this.uncacheHeight();
		this.enableOrderingContainer();
	},

	buildFooter: function () {
		return {
			xtype: 'container',
			cls: 'course-overview-footer',
			layout: 'none',
			items: [
				{
					xtype: 'overview-editing-controls-add',
					name: 'Add Section',
					parentRecord: this.lessonOverview,
					root: this.lessonOverview,
					onPromptClose: () => this.updateLessonOverview()
				}
			]
		};
	},

	getCmpForRecord: function (record, transition, initialState) {
		if (record instanceof OverviewGroup) {
			return OverviewgroupListItem.create({
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
				navigate: this.navigate,
				updateLessonOverview: () => this.updateLessonOverview()
			});
		}

		console.warn('Unknown type: ', record);
	},

	onGroupDrop: function (group, newIndex, moveInfo) {
		this.suspendUpdates();

		return this.contents.moveToFromContainer(group, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.contents)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(this.resumeUpdates.bind(this));
	},

	addCardToGroup: function (group, card, newIndex, moveInfo) {
		this.suspendUpdates();

		return group.moveToFromContainer(card, newIndex, moveInfo.get('OriginIndex'), moveInfo.get('OriginContainer'), this.contents)
			.then(Promise.minWait(Globals.WAIT_TIMES.SHORT))
			.then(this.resumeUpdates.bind(this));
	},


	updateLessonOverview () {
		if (this.el) {
			this.el.mask('Loading...');
		}

		const unmask = () => {
			if (this.el) {
				this.el.unmask();
			}
		};

		this.record.getContents().then(contents => {
			this.contents.syncWith(contents);

			unmask();
		}).catch(() => unmask());
	}
});
