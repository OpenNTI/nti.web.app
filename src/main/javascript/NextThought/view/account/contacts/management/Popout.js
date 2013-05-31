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
				{cls: 'lists', html:'Manage lists ({groupCount})'},
				{cls: 'action', cn:[
					{tag: 'a', cls:'button remove-contact', html:''}
				]}
			]},
			{tag:'tpl', 'if': '!isContact', cn:[
				{cls: 'lists plus', html:'Add to lists'},
				{cls: 'action', cn:[
					{tag: 'a',  cls:'button add-contact', html:'Add Contact'}
				]}
			]}
		]
	}]),

	renderSelectors:{
		name: '.name',
		avatar:'.contact-card img',
		addContactEl: '.add-contact',
		deleteContactEl: '.remove-contact',
		listEl: '.lists'
	},

	setupItems: Ext.emptyFn,

	initComponent: function(){
		this.callParent(arguments);
		this.groupsListMenu = Ext.widget('menu', {
			ui: 'nt',
			plain: true,
			width: 250,
			items: [{xtype:'management-group-list', allowSelect: true, renderTo: Ext.getBody()}]
		});


		this.isContact = Ext.getStore('FriendsList').isContact(this.record);
		this.groupsList = this.groupsListMenu.down('management-group-list');
//		if(this.isContact && this.groupsList){
//			this.groupsList.setUser(this.record);
//		}
	},

	beforeRender: function(){
		this.callParent(arguments);
		var groupCount = this.groupsList.store.getCount() || 0;
		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
		this.renderData = Ext.apply(this.renderData, {
			isContact: this.isContact,
			blank: Ext.BLANK_IMAGE_URL,
			groupCount: groupCount,
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
		if(this.addContactEl){
			this.mon(this.addContactEl, 'click', this.actOnContact, this);
		}
		if(this.deleteContactEl){
			this.mon(this.deleteContactEl, 'click', this.actOnContact, this);
		}
	},

	getPointerStyle: function(x,y){
		var el = this.getTargetEl(),
			t = el.getTop(),
			b = el.getBottom();

		return (t <= y && y <= b) ? '' : 'contact';
	},


	actOnContact: function(e){
		var t = e.getTarget('.add-contact'),
			buttonEvent = 'add-contact',
			me = this, data = this.getSelected(),
			fin = function(){ me.destroy(); };

		if(e.getTarget('.remove-contact')){
			t = e.getTarget('.remove-contact');
			buttonEvent = 'delete-contact';
		}

		if(Ext.isEmpty(t)){ return; }
		this.fireEvent(buttonEvent, this.user, data.groups, fin);
	},


	showUserList: function(){
		console.log("Should display user list: ", arguments);
		if(this.groupsListMenu.isVisible()){
			this.groupsListMenu.hide();
		}
		this.groupsListMenu.showBy(this.avatar,'tl-tr',[0,0]);
	},


	getSelected: function(){
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l? l.getSelected() : []
		};
	},


	onDestroy: function(){
		this.groupsListMenu.destroy();
		this.callParent(arguments);
	}

});
