Ext.define('NextThought.view.profiles.outline.View',{
	extend: 'Ext.Component',
	alias: 'widget.profile-outline',

	ui: 'profile',
	cls: 'outline',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style:{ backgroundImage: 'url({avatarURL})' }, cn: [
			{ cls:'name {presence}', html:'{displayName}' }
		]},
		{
			cls: 'controls',
			cn: [
				{ cls: 'lists' },
				{ cls: 'settings' },
				{ cls: 'button' }
			]
		},
		{
			cls: 'nav'
		}
	]),

	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.name',
		controlsEl: '.controls'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.monitorUser(this.user);
	},


	monitorUser: function (u) {
		var me = this,
			m = {
				destroyable: true,
				scope: this,
				changed: function (r) {
					if(!me.rendered){
						me.applyRenderData(r);
					} else {
						me.avatarEl.setStyle({ backgroundImage: 'url('+r.get('avatarURL')+')' });
						me.nameEl.update(r.getName());
					}
					me.monitorUser((r !== u) ? r : null);
				}
		};

		if (u) {
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(u, m);
			me.user = u;
		}

		if (me.nameEl && me.user) {
			me.nameEl.set({cls:'name '+me.user.getPresence().getName()});
		}
	},


	applyRenderData: function(user){
		this.renderData = Ext.apply(this.renderData||{},user.getData());
		this.renderData.presence = user.getPresence().getName();
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.applyRenderData(this.user);
	},


	afterRender: function(){
		this.callParent(arguments);

		var store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'label', type: 'string'},
				{name: 'count', type: 'int', defaultValue: 0},
				{name: 'type', type: 'string', defaultValue: 'view'}//or filter
			],
			data: [
				{id:'about', label:'About' },
				{id:'activity', label:'Recent Activity' },
				{id:'blog', label:'Thoughts' },
				{id:'discussions', label:'Discussions', type:'filter' },
				{id:'chats', label:'Chats', type:'filter' },
				{id:'comments', label:'Comments', type:'filter' },
				{id:'highlights', label:'Highlights', type:'filter' },
				{id:'bookmarks', label:'Bookmarks', type:'filter' },
				{id:'like', label:'Likes', type:'filter' }
			]
		});

		this.nav = Ext.widget({
			xtype: 'dataview',
			ui: 'nav',
			preserveScrollOnRefresh: true,
			overItemCls: 'over',
			itemSelector: '.outline-row',
			store: store,
			cls: 'nav-outline make-white',
			renderTo: this.el.down('.nav'),
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
				{
					cls: 'outline-row',
					cn:  [
						{ tag:'tpl', 'if':'count', cn:{ cls: 'count', html:'{count}' } },
						{ cls: 'label', html: '{label}' }
					]
				}
			]})
		});
	}

});
