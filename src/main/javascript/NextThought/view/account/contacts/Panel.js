Ext.define('NextThought.view.account.contacts.Panel',{
	extend: 'Ext.panel.Panel',
	requires: [
		'Ext.Action',
		'NextThought.view.account.contacts.Card'
	],

	mixins: {
		userContainer: 'NextThought.mixins.UserContainer'
	},

	alias: 'widget.contacts-panel',
	ui: 'contacts-panel',
	cls: 'contacts-panel',

	collapsible: true,
	hideCollapseTool: true,
	collapsedCls: 'collapsed',
	frame: false,
	border: false,
	unstyled: true,
	showCount: true,
	defaultType: 'contact-card',
	tools:[{
		type:'options',
		width: 20,
		height: 20,
		tooltip: 'Options',
		handler: function(event, toolEl, panel){ panel.up('contacts-panel').showMenu(toolEl); }
	}],


	initComponent: function(){
		var g = this.associatedGroup;
		if(!g){
			this.tools = null;
		}
		this.callParent(arguments);
		this.setTitle(this.title);

		this.setupActions(g);

		this.on('nibClicked', this.nibClicked, this);
		this.on('destroy',this.cleanupActions,this);
		this.on('add',this.updateStuff,this, {buffer:100});
		this.on('remove',this.updateStuff,this, {buffer:100});
		this.mixins.userContainer.constructor.apply(this, arguments);
	},


	showMenu: function(toolEl){ this.menu.showBy(toolEl,'tr-tl',[0,0]); },


	afterRender: function(){
		this.callParent(arguments);
		this.getHeader().on('click',this.toggleCollapse,this);
	},


	setTitle: function(title){
		var itemsShown = 0, me = this;

		this.title = title;

		Ext.each(this.items.items, function(x){
			if (!x.hidden){itemsShown++;}
		}, this);

		if(this.showCount){
			this.title = Ext.String.format('{0} ({1})',title,itemsShown);
		}

		if (this.rendered) {
			Ext.defer(function(){me.getHeader().setTitle(me.title);}, 1);
		}
		return this;
	},


	updateTitle: function(){
		this.setTitle(this.initialConfig.title);
	},


	updateStuff: function(){
		this.updateTitle();
		this.updateChatState(this.associatedGroup);
	},


	//The nib is used to show either the group manangement screen or a remove user button for dfls
	shouldHideUserNib: function(){
		//No associated group means we want the nib
		if(!this.associatedGroup){
			return false;
		}

		//For dfls we show the nib if we are the creator
		return this.associatedGroup.isDFL && !isMe(this.associatedGroup.get('Creator'));
	},


	createUserComponent: function(user){
		return {user: user, group: this.associatedGroup, hideNib: this.shouldHideUserNib()};
	},


	getModelObject: function(){
		return this.associatedGroup;
	},


	getUserListFieldName: function(){
		return 'friends';
	},


	nibClicked: function(card, record, nib){
		if(!this.associatedGroup || !this.associatedGroup.isDFL){
			NextThought.view.account.contacts.management.Popout.popup(record, card.el.down('img:not(.nib)'), card.el, [-10,-18]);
		}
		else{
			this.userMenu.user = record;
			this.userMenu.showBy(nib,'tr-tl',[0,0]);
		}
	}

});
