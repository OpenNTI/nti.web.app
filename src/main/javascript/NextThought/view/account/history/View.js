//Styles defined in _history-view.scss
//TODO: Delete this once we permanently enable the new 'activity'/history view.
Ext.define('NextThought.view.account.history.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.history-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.UserDataPanel',
		'NextThought.view.account.history.Panel',
		'NextThought.view.account.history.FavoritePanel'
	],

	title: 'History',
	tabConfig: {tooltip: 'History'},
	iconCls: 'history',
	ui: 'history',
	cls: 'history-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},


	constructor: function() {
		this.items = [
			{xtype: 'box', cls: 'view-title', autoEl: {}},
			{
				xtype: 'container',
				layout: 'fit',
				flex: 1,
				id: 'history-view-panel',

				items: [
					{
						xtype: 'secondary-tabpanel',
						stateId: 'history-side-view',
						defaults: {xtype: 'user-data-panel'},
						items: [
							{ title: 'Notes', mimeType: ['note', 'highlight'], xtype: 'user-history-panel' },
							{ title: 'Bookmarks', mimeType: ['favorite'], xtype: 'user-history-favorite-panel' }
						]
					}
				]
			}
		];

		this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);

		var chatTab = this.down('[title=Chats]');
		if (!Service.canChat() && !Ext.isEmpty(chatTab)) {
			chatTab.destroy();
		}
	},


	getActiveView: function() {
		return this.down('[title=Notes]').isVisible() ? this.down('[title=Notes]') : this.down('[title=Bookmarks]');
	},


	applyFilters: function(filter) {
		if (Ext.isEmpty(filter)) {
			return;
		}

		var v = this.getActiveView(),
			s = v && v.getStore(),
			selectedMimeTypes = [];

		s.removeAll();
		s.clearFilter();
		if (filter) {
			Ext.each(filter.value, function(item) {
				var mt = item.value;
				if (mt) {
					selectedMimeTypes.push(mt);
				}
			});
			s.filter([
				{filterFn: function(item) {
					return filter.test(item);
				}}
			]);
		}
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'relevance',
			sortOrder: 'descending',
			accept: selectedMimeTypes.join(',')
		});

		s.load();
	}

});
