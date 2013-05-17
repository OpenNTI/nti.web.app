Ext.define('NextThought.view.sharing.ShareSearchList', {
	extend:'Ext.view.BoundList',
	alias:['widget.share-search'],
	cls:'share-search',
	allowBlank: true,
	displayField: 'displayName',
	valueField: 'Username',
	maxHeight: 120,
	floating:true,

	constrainTo: Ext.getBody(),
	loadingHeight: 40,

	plain: true,
	ui:'nt',
	baseCls: 'x-menu',
	itemCls: 'x-menu-item contact-card',
	itemSelector:'x-menu-item',
	emptyText: '<div class="x-menu-item no-results">No results found.</div>',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag:'tpl', 'for':'.',
		cn:[{
			cls: 'x-menu-item contact-card',
			cn: [
				{cls:'avatar {[this.getType(values)]}', style:'background-image: url({[this.getIcon(values)]})'},
				{cls:'card-body {[this.getType(values)]}', cn:[
					{cls:'name', html:'{displayName}'},
					{cls:'status', html:'{[this.getDisplayTypeValue(values)]}'}
				]}
			]}
		]
	}), {
		getIcon: function(model){
			var t = this.getType(model);
			return t==='person'? model.avatarURL : 'inherit';
		},

		getType: function(modelData){
			return NextThought.model.UserSearch.getType(modelData);
		},

		getDisplayTypeValue: function(model){
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
		select:'onSelect'
	},

	constructor: function(cfg){
		var ownerCls = cfg.ownerCls || '';
		this.loadMask = {
			msg: 'Searching...',
			maskCls: 'share-search-mask '+ownerCls,
			cls: 'share-search-mask '+ownerCls,
			msgCls: 'share-search-mask '+ownerCls
		};
		return this.callParent([cfg]);
	},

	initComponent: function(){
		this.callParent(arguments);
		this.itemSelector = '.contact-card';
	},


	afterRender: function(){
		this.callParent(arguments);
	},


	onSelect: function(){
		this.hide();
	},

	destroy: function(){
		this.callParent(arguments);
		console.warn('destorying list view...', arguments);
	}

});