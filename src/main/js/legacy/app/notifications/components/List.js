const Ext = require('@nti/extjs');

const PathActions = require('legacy/app/navigation/path/Actions');

const NotificationsStateStore = require('../StateStore');

require('./Group');


module.exports = exports = Ext.define('NextThought.app.notifications.components.List', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-panel',
	cls: 'notification-list',
	layout: 'none',
	SHOW_GROUP_LABEL: true,
	PREPEND_INDEX: 0,
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.groups = {};

		this.NotificationsStore = NotificationsStateStore.getInstance();
		this.PathActions = PathActions.create();

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},

	onActivate: function () {
		this.storeListeners = this.mon(this.NotificationsStore, {
			destroyable: true,
			'record-added': this.addRecord.bind(this, true),
			'record-deleted': this.deleteRecord.bind(this)
		});

		this.NotificationsStore.addActiveView();

		this.NotificationsStore.getStore()
			.then(this.loadBatch.bind(this));
	},

	onDeactivate: function () {
		var container = this.getGroupContainer(),
			group = container && container.down('notification-group');

		Ext.destroy(this.storeListeners);

		this.NotificationsStore.removeActiveView();

		while (group) {
			group.destroy();
			group = container && container.down('notification-group');
		}

		this.groups = {};
	},

	getGroupContainer: function () {
		return this;
	},

	addRecord: function (prepend, record) {
		var groupValue = record.get('NotificationGroupingField');

		if(!groupValue) {
			return;
		}

		var groupName = groupValue.getTime(),
			group = this.groups[groupName];

		//fill this in here so hopefully it will be cached when the
		//user tries to navigate
		this.PathActions.getPathToObject(record)
			.then(data => {
				record[Symbol.for('path')] = data;
			});

		if (!group) {
			group = this.addGroup(groupName, groupValue, prepend);
		}

		if (group) {
			group.addItem(record, prepend);
		} else {
			console.error('No group for: ', group, record);
		}
	},

	deleteRecord: function (record) {
		var groupValue = record.get('NotificationGroupingField'),
			groupName = groupValue.getTime(),
			group = this.groups[groupName];

		if (group) {
			group.deleteRecord(record);
		} else {
			console.warn('No group to delete record from: ', record);
		}
	},

	loadBatch: function (batch) {
		this.currentBatch = batch;

		this.addMask();

		batch.getItems()
			.then(this.fillInItems.bind(this))
			.always(this.removeMask.bind(this));
	},

	fillInItems: function (items) {
		if (items.length < this.currentBatch.batchSize) {
			this.isLastBatch = true;
		}

		items.forEach(this.addRecord.bind(this, false));

		this.maybeShowMoreItems();
	},

	maybeShowMoreItems: function () {},

	addGroup: function (groupName, group, prepend) {
		var cmp,
			container = this.getGroupContainer(),
			config = {
				xtype: 'notification-group',
				group: group,
				showLabel: this.SHOW_GROUP_LABEL,
				navigateToItem: this.navigateToItem.bind(this),
				hideNotifications: this.hideNotifications
			};

		if (prepend) {
			cmp = container.insert(this.PREPEND_INDEX, config);
		} else {
			cmp = container.add(config);
		}

		this.groups[groupName] = cmp;

		return this.groups[groupName];
	},

	addMask: function () {
		var container = this.getGroupContainer();

		if (!this.loadingCmp) {
			this.loadingCmp = container.add({
				xtype: 'box',
				autoEl: {cls: 'item loading', cn: [
					{cls: 'container-loading-mask', cn: [
						{cls: 'load-text', html: 'Loading...'}
					]}
				]}
			});
		}
	},

	removeMask: function () {
		var container = this.getGroupContainer();

		if (this.loadingCmp) {
			container.remove(this.loadingCmp);
			delete this.loadingCmp;
		}
	},

	navigateToItem: function () {}
});
