Ext.define('NextThought.view.account.contacts.management.Popout',{
	extend: 'NextThought.view.account.activity.Popout',
	alias: ['widget.contact-popout', 'widget.activity-popout-user'],

	requires: [
		'NextThought.view.account.contacts.management.GroupList'
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
			{tag:'tpl', 'if': 'isContact', cn:[
				{cls: 'action remove-contact', cn:[
					{tag: 'a', cls:'button', html:''}
				]},
				{cls: 'lists', html:'Manage lists ({groupCount})', 'data-value':'{groupCount}'}
			]},
			{tag:'tpl', 'if': '!isContact', cn:[
				{cls: 'action  add-contact', cn:[
					{tag: 'a',  cls:'button', html:'Add Contact'}
				]},
				{cls: 'lists add-list', html:'Add to lists'}
			]}
		]
	}]),

	renderSelectors:{
		name: '.name',
		avatar:'.contact-card img',
		addContactEl: '.add-contact a',
		deleteContactEl: '.remove-contact a',
		listEl: '.lists'
	},

	setupItems: Ext.emptyFn,

	initComponent: function(){
		this.callParent(arguments);
		this.groupsListMenu = Ext.widget('menu', {
			ui: 'nt',
			plain: true,
			width: 250,
			items: [{xtype:'management-group-list', allowSelect: true}]
		});


		this.isContact = Ext.getStore('FriendsList').isContact(this.record);
		this.groupsList = this.groupsListMenu.down('management-group-list');
		if(this.isContact && this.groupsList){
			this.groupsList.setUser(this.record);
		}
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
		if(this.addContactEl){
			this.mon(this.addContactEl, 'click', this.onAddContact, this);
		}
		if(this.deleteContactEl){
			this.mon(this.deleteContactEl, 'click', this.onDeleteContact, this);
		}

		if(this.isContact){
			this.mon(this.groupsList,{
				scope: this,
				'add-contact': this.incrementCount,
				'remove-contact': this.decreaseCount
			});
		}
	},


	getListCount: function(){
		var u = this.record.get('Username'),
			s = this.groupsList.store,
			k = s.queryBy(function(a){ return a.hasFriend(u); }),
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


	onAddContact: function(e){
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


	handleToggleListText: function(showMenu){
		var c = this.listEl.getAttribute('data-value');

		if(showMenu){
			this.listEl.update("Close lists");
		}
		else{
			if(c){
				this.listEl.update('Manage lists ('+c+')');
			}
			else{
				this.listEl.update('Add lists');
			}
		}
	},


	showUserList: function(){
		if(this.showingMenu){
			this.handleToggleListText(false);
			this.groupsListMenu.hide();
			delete this.showingMenu;
			return;
		}
		this.handleToggleListText(true);
		this.showingMenu = true;
		this.groupsListMenu.showBy(this.avatar,'tl-tr',[0,0]);
	},


	getSelected: function(){
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l? l.getSelected() : []
		};
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
		this.callParent(arguments);
	}

});
