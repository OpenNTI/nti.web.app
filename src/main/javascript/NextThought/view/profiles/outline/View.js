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
				{ tag:'tpl', 'if':'isMe', cn: { cls: 'button edit', html:'Edit' }},
				{ tag:'tpl', 'if':'!isMe', cn: [
					{ tag:'tpl', 'if':'isContact', cn: { cls: 'button chat', html:'Chat' }},
					{ tag:'tpl', 'if':'!isContact', cn: { cls: 'button', html:'Add Contact' }}
				]}
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

		this.groupsListMenu = Ext.widget({
			xtype: 'menu',
			ui: 'nt',
			plain: true,
			shadow: false,
			width: 255,
			items: [{xtype:'management-group-list', allowSelect: true}]
		});
		this.on('destroy','destroy',this.groupsListMenu);

		this.groupsList = this.groupsListMenu.down('management-group-list');

		this.on({
			click: {
			   fn:'onControlsClicked',
			   scope:this,
			   element:'controlsEl'
			}
		});
	},


	monitorUser: function (u) {
		var me = this,
			m = {
				destroyable: true,
				scope: this,
				changed: function (r) {
					me.applyRenderData(r);
					if( me.rendered){
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

	//TODO: add a monitor for !isMe users to test if they are a contact or are/are-not available to chat.

	applyRenderData: function(user){
		this.isContact = Ext.getStore('FriendsList').isContact(this.user);
		this.groupsList.setUser(user).isContact = this.isContact;
		if(this.optionsMenu){
			this.un('destroy','destroy',this.optionsMenu);
			Ext.destroy(this.optionsMenu);
		}
		this.optionsMenu = Ext.widget({xtype:'person-options-menu', width:255, ownerCmp: this, user: this.user, isContact: this.isContact });
		this.on('destroy','destroy',this.optionsMenu);
		this.renderData = Ext.apply(this.renderData||{},user.getData());
		Ext.apply(this.renderData,{
			isMe: isMe(user),
			isContact: this.isContact,
			presence: user.getPresence().getName()
		});
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.applyRenderData(this.user);
	},


	afterRender: function(){
		this.callParent(arguments);

		if(isMe(this.user)){
			this.controlsEl.select('.lists,.settings').addCls('disabled');
		}

		var store = new Ext.data.Store({
			fields: [
				{name: 'id', type: 'string'},
				{name: 'label', type: 'string'},
				{name: 'count', type: 'int', defaultValue: 0},
				{name: 'type', type: 'string', defaultValue: 'view'},//or filter
				{name: 'mapping', type: 'string'}
			],
			data: [
				{id:'about', label:'About', mapping:'profile-about' },
				{id:'activity', label:'Recent Activity', mapping:'profile-activity' },
				{id:'blog', label:'Thoughts', mapping:'profile-blog' },
				{id:'discussions', label:'Discussions', type:'filter', mapping:'profile-activity' },
				{id:'chats', label:'Chats', type:'filter', mapping:'profile-activity' },
				{id:'comments', label:'Comments', type:'filter', mapping:'profile-activity' },
				{id:'highlights', label:'Highlights', type:'filter', mapping:'profile-activity' },
				{id:'bookmarks', label:'Bookmarks', type:'filter', mapping:'profile-activity' },
				{id:'like', label:'Likes', type:'filter', mapping:'profile-activity' }
			]
		});

		this.navStore = store;
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
			]}),
			listeners: {
				scope: this,
				select: 'selectionChanged'
			}
		});
	},


	selectionChanged: function(sel,rec){
		var d = (rec && rec.getData()) ||{};

		this.fireEvent('show-profile-view', d.mapping, d.type, d.id);
	},


	updateSelection: function(active){
		var view = active.xtype,
			i = this.navStore.findBy(function(r){
				return r.get('type')==='view' && r.get('mapping') === view;
			});

		this.nav.select(i);

	},


	onControlsClicked: function(e){
		if(e.getTarget('.disabled')){
			return;
		}

		if(e.getTarget('.settings')){
			this.optionsMenu.showBy(this.avatarEl,'tl-bl');
		}
		else if(e.getTarget('.lists')){
			this.groupsListMenu.showBy(this.avatarEl,'tl-bl');
		}
		else if(e.getTarget('.edit')){
			this.fireEvent('edit');
		}

	}

});
