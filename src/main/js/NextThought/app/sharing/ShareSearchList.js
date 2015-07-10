Ext.define('NextThought.app.sharing.ShareSearchList', {
	extend: 'Ext.view.BoundList',
	alias: ['widget.share-search'],
	cls: 'share-search',
	allowBlank: true,
	displayField: 'displayName',
	valueField: 'Username',
	floating: true,
	singleSelect: true,
	loadingHeight: 40,

	plain: true,
	ui: 'nt',
	baseCls: 'x-menu',
	itemCls: 'x-menu-item contact-card',
	itemSelector: 'x-menu-item',
	emptyText: '<div class="x-menu-item no-results">No results found.</div>',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.',
		cn: [{
			cls: 'x-menu-item contact-card {[this.getType(values)]}',
			cn: [
				'{[this.getAvatar(values)]}',
				{cls: 'avatar icon {[this.getType(values)]}', style: '{[this.getIcon(values)]}'},
				{cls: 'card-body {[this.getType(values)]}', cn: [
					{cls: 'name', html: '{displayName}'},
					{cls: 'status', html: '{[this.getDisplayTypeValue(values)]}'}
				]}
			]}
		]
	}), {
		getAvatar: function(model){
			var a = NTIFormat.avatar(model);
			return a;
		},
		isUser: function(model) {
			var t = this.getType(model);
			return t === 'person';
		},
		getIcon: function(model) {
			var t = this.getType(model);
			return '';
		},

		getType: function(modelData) {
			return NextThought.model.UserSearch.getType(modelData);
		},

		getDisplayTypeValue: function(model) {
			var t = this.getType(model),
				map = {
					'list': 'List',
					'group': 'Group',
					'public': 'Community',
					'person': 'User'
				};
			return map[t];
		}
	}),

	listeners: {
		select: 'onSelect'
	},

	constructor: function(cfg) {
		var ownerCls = cfg.ownerCls || '';
		this.loadMask = {
			msg: 'Searching...',
			maskCls: 'share-search-mask ' + ownerCls,
			cls: 'share-search-mask ' + ownerCls,
			msgCls: 'share-search-mask ' + ownerCls
		};
		this.callParent([cfg]);
	},

	initComponent: function() {
		this.callParent(arguments);
		this.itemSelector = '.contact-card';
	},


	afterRender: function() {
		this.callParent(arguments);
	},


	onSelect: function() {
		this.hide();
	},

	destroy: function() {
		this.callParent(arguments);
		//console.warn('destroying list view...', arguments);
	}

});
