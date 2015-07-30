Ext.define('NextThought.app.sharing.components.ShareSearchList', {
	extend: 'Ext.view.View',
	alias: ['widget.share-search'],
	cls: 'share-search',
	allowBlank: true,
	displayField: 'displayName',
	valueField: 'Username',
	singleSelect: true,
	loadingHeight: 40,

	plain: true,
	ui: 'nt',
	baseCls: 'x-menu',
	itemCls: 'x-menu-item contact-card',
	itemSelector: '.contact-card',
	emptyText: '<div class="x-menu-item no-results">No results found.</div>',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.', cn: [
			{ tag: 'tpl', 'if': 'isLabel', cn: [
				{cls: 'x-menu-item contact-card label', html: '{realname}'}
			]},
			{ tag: 'tpl', 'if': '!isLabel', cn: [
				{
					cls: 'x-menu-item contact-card{[this.getTypeCls(values)]}{[this.getMarkedCls(values)]}',
					cn: [
						'{[this.getAvatar(values)]}',
						{cls: 'avatar icon {[this.getType(values)]}', style: '{[this.getIcon(values)]}'},
						{cls: 'card-body {[this.getType(values)]}', cn: [
							{cls: 'name', html: '{[this.getDisplayName(values)]}'},
							{cls: 'status', html: '{[this.getDisplayTypeValue(values)]}'}
						]}
					]
				}
			]}
	]}
	), {
		getAvatar: function(model) {
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

		getTypeCls: function(model) {
			return ' ' + this.getType(model);
		},

		getMarkedCls: function(model) {
			return model.isMarked ? ' marked' : '';
		},

		getType: function(modelData) {
			return NextThought.model.UserSearch.getType(modelData);
		},

		getDisplayName: function(modelData) {
			return modelData.friendlyName || modelData.displayName;
		},

		getDisplayTypeValue: function(model) {
			var t = this.getType(model),
				map = {
					'list': 'List',
					'group': 'Group',
					'public': 'Community',
					'person': 'User'
				};

			if (model.friendlyName) {
				return model.displayName;
			}

			return map[t];
		}
	}),


	constructor: function(cfg) {
		var ownerCls = cfg.ownerCls || '';

		this.loadMask = {
			msg: 'Searching...',
			maskCls: 'share-search-mask ' + ownerCls,
			cls: 'share-search-mask ' + ownerCls,
			msgCls: 'share-search-mask ' + ownerCls,
			renderTo: cfg.loadMaskContainer
		};

		this.callParent([cfg]);

		this.on('itemclick', this.onRecordClick.bind(this));
	},


	onRecordClick: function(view, record) {
		if (!record.get('isLabel')) {
			this.selectItem(record);
		}
	},

	destroy: function() {
		this.callParent(arguments);
		//console.warn('destroying list view...', arguments);
	},


	setUpMaskListeners: function(store) {
		Ext.destroy(this.maskListeners);

		if (!this.rendered) {
			this.on('afterrender', this.setUpMaskListeners.bind(this, store));
			return;
		}

		if (!store) {
			return;
		}

		Ext.destroy(this.maskListeners);

		this.maskListeners = this.mon(store, {
			destroyable: true,
			beforeload: this.loadMask.show.bind(this.loadMask),
			load: this.loadMask.hide.bind(this.loadMask)
		});

		if (store.loading) {
			this.loadMask.show();
		} else {
			this.loadMask.hide();
		}
	},


	bindStore: function(store) {
		this.callParent(arguments);

		this.setUpMaskListeners(store);
	}
});
