Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contact-card',
	requires: [
		'Ext.Action'
	],

	cls: 'contact-card x-menu',
	renderTpl: Ext.DomHelper.markup([
		{tag:'tpl', 'if':'!hideNib', cn:[
			{tag:'img', cls:'nib', src:'{blank}', alt:'Menu', title:'Options'}]},
		{tag:'img', src:'{avatarURL}'},
		{ cls:'card-body', cn:[
			{cls:'name', html:'{name}'},
			{cls:'status', html:'{status}'}
		]}
	]),



	constructor: function(){
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.clickBlocker = Globals.buildBlocker(this);

		this.callParent(arguments);

		if(!this.user){
			Ext.Error.raise('No user specified');
		}

		//for querying later:
		this.username = this.user.getId();


		this.renderData = Ext.apply(this.renderData||{},{
			hideNib: Boolean(this.hideNib),
			blank: Ext.BLANK_IMAGE_URL,
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: this.user.get('status'),
			from: this.group ? 'this Group' : 'my contacts'
		});

		this.removeContactAction = new Ext.Action({
		    text: 'Remove from Group',
			scope: this,
		    handler: this.removeFromGroup,
		    itemId: 'remove-from-group',
			ui: 'nt-menuitem', plain: true,
			hidden: !this.group
		});

		this.deleteContactAction = new Ext.Action({
		    text: 'Delete Contact',
			scope: this,
		    handler: this.deleteContact,
		    itemId: 'delete-contact',
			ui: 'nt-menuitem', plain: true
		});

		this.startChatAction = new Ext.Action({
			text: 'Start a Chat',
			scope: this,
			handler: this.startChat,
			itemId: 'start-chat',
			ui: 'nt-menuitem', plain: true,
			hidden: !$AppConfig.service.canChat(),
			disabled: this.user.get('Presence')==='Offline'
		});

		this.menu = Ext.widget('group-menu',{
			hideCommunities:true,
			checklist:true,
			hideMyContacts:true,
			actions: [
				this.removeContactAction,
				this.deleteContactAction,
				this.startChatAction,
				{ xtype: 'labeledseparator', text: 'Select Groups', cls: 'doublespaced' }
			]
		});

	},


	afterRender: function(){
		var el = this.getEl();

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');
		this.callParent(arguments);
	},


	deleteContact: function(){
		this.fireEvent('delete-contact',this.user);
	},


	removeFromGroup: function(){
		this.fireEvent('remove-contact-from', this.group, this.user);
	},


	startChat: function(){
		this.fireEvent('click', this, this.user.getId());
	},


	clicked: function(e){
		var nib = e.getTarget('img.nib');
		try{
			this.clickBlocker();
			if(nib){
				this.menu.showBy(nib,'tr-tl',[10,0]);
			}
			else {
				this.startChat();
			}
		}
		catch(er){
			this.fireEvent('blocked-click', this, this.user.getId());
		}
	}

});
