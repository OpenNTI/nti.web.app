Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.contact-popout', 'widget.activity-popout-user'],

	requires: [
		'NextThought.view.account.contacts.management.GroupList',
		'NextThought.view.account.contacts.management.Options'
	],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	floating: true,

	width: 350,
	cls: 'contact-popout',

	renderTpl: Ext.DomHelper.markup([{
		cls: 'header',
		cn: [{
				cls:'card-wrap',
				cn:[{
					cls:'contact-card',
					cn: [
						{tag: 'img', src: '{avatarURL}'},
						{
							cls: 'text-wrap',
							cn: [
								{cls: 'name', html: '{name}'},
								{cls: 'affiliation', html: '{affiliation-dontshowthis}'}
							]
						}
					]
				}]
			}
		]},
		{
			id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
		},
		{
		cls: 'footer',
		cn: [
			{cls:'controls', cn:[
				{tag:'tpl', 'if': 'isContact', cn:[
					{cls:'right chat', cn:[
						{tag: 'a', cls:'button', html:'Chat'}
					]}
				]},
				{tag:'tpl', 'if': '!isContact', cn:[
					{cls:'right add-contact', cn:[
						{tag: 'a',  cls:'button', html:'Add Contact'}
					]}
				]},
				{cls:'left', cn:[
					{cls: 'control lists', 'data-qtip':'Distribution lists'},
					{cls: 'control options', 'data-qtip':'Options'}
				]}

			]}
		]
	}]),

	renderSelectors:{
		name: '.name',
		avatar:'.contact-card img',
		actionEl: '.right',
		actionButtonEl: '.right a',
		listEl: '.lists',
		optionsEl: '.options'
	},

	setupItems: Ext.emptyFn,

	initComponent: function(){
		this.callParent(arguments);
		var me = this;
		this.groupsListMenu = Ext.widget('menu', {
			ui: 'nt',
			plain: true,
			width: 350,
			items: [{xtype:'management-group-list', allowSelect: true}]
		});

		this.optionsMenu = Ext.widget('person-options-menu', { ownerCmp: me, user: me.user });

		this.isContact = Ext.getStore('FriendsList').isContact(this.record);
		this.groupsList = this.groupsListMenu.down('management-group-list');
		this.groupsList.setUser(this.record);
		this.groupsList.isContact = this.isContact;
	},

	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
		this.renderData = Ext.apply(this.renderData, {
			isContact: this.isContact,
			blank: Ext.BLANK_IMAGE_URL,
			groupCount: this.getListCount(),
			avatarURL: this.record.get('avatarURL'),
			name: this.record.getName(),
			affiliation: this.record.get('affiliation')
		});
	},

	afterRender: function(){
		this.callParent(arguments);
		this.enableProfileClicks(this.avatar,this.name);
		this.user = this.record;    //EnableProfileClicks mixin expects us to have a this.user object.

		this.mon(this.listEl, 'click', this.showUserList, this);
		this.mon(this.groupsList, 'hide-menu', this.showUserList, this);
		this.mon(this.actionButtonEl, 'click', this.actOnContactOrChat, this);
		this.mon(this.optionsEl, 'click', this.showOptionMenu, this);

		this.mon(this.groupsList,{
			scope: this,
			'add-contact': this.incrementCount,
			'remove-contact': this.decreaseCount,
			'added-contact': this.makeItContact
		});

		this.mon(this.optionsMenu, {
			scope:this,
			'remove-contact-selected': this.onDeleteContact
		});
	},


	getListCount: function(){
		var u = this.record.get('Username'),
			s = this.groupsList.store,
			k = s.queryBy(function(a){ return a.hasFriend(u) && !a.isDFL; }),
			c = k.getCount();

		// NOTE: remove my contact list because it's a hidden group that will always be there.
		if(c > 0){ c--; }
		return c;
	},


	getPointerStyle: function(x,y){
		var el = this.getTargetEl(),
			t = el.getTop(),
			b = el.getBottom();

		return (t <= y && y <= b) ? '' : 'contact';
	},


	actOnContactOrChat: function(e){
		e.stopEvent();
		if(e.getTarget('.add-contact')){
			this.onAddContact();
		}else{
			this.fireEvent('chat', this.record);
		}
	},


	onAddContact: function(){
		var me = this, data = this.getSelected(),
			fin = function(){ me.destroy(); };

		this.fireEvent('add-contact', this.user, data.groups, fin);
	},

	onDeleteContact: function(){
		var me = this, data = this.getSelected(),
			fin = function(){ me.destroy(); };

		Ext.Msg.show({
			msg: 'The following action will remove this contact.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-contact', me.user, data.groups, fin);
				}
			}
		});
	},


	showUserList: function(){
		if(this.showingMenu){
			this.groupsListMenu.hide();
			delete this.showingMenu;
			return;
		}
		this.showingMenu = true;
		this.groupsListMenu.showBy(this.avatar,'tl-bl',[0,0]);
	},


	showOptionMenu: function(){
		if(this.optionsMenu){
			this.optionsMenu.showBy(this.avatar, 'tl-bl', [0,0]);
		}
	},


	getSelected: function(){
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l? l.getSelected() : []
		};
	},


	makeItContact: function(){
		this.actionEl.removeCls('add-contact').addCls('chat');
		this.actionButtonEl.update('Chat');
		this.isContact = true;
	},


	updateCount: function(count){
		this.listEl.set({'data-value': count});
	},


	incrementCount: function(){
		var count = this.getListCount();
		count++;
		this.updateCount(count);
	},

	decreaseCount: function(){
		var count = this.getListCount();
		count--;
		this.updateCount(count);
	},


	onDestroy: function(){
		this.groupsListMenu.destroy();
		this.optionsMenu.destroy();
		this.callParent(arguments);
	}

});
