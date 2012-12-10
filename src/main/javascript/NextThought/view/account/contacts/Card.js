Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contact-card',
	requires: [
		'Ext.Action'
	],

	cls: 'contact-card x-menu',
	renderTpl: Ext.DomHelper.markup([
		{tag:'tpl', 'if':'!hideNib', cn:[
			{tag:'img', cls:'nib', src:'{blank}', alt:'Menu', 'data-qtip':'Options'}]},
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
		this.addEvents('nibClicked');
		this.enableBubble('nibClicked');

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
	},


	afterRender: function(){
		var el = this.getEl(),
			online = this.user.get('Presence') === 'Online';

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');

        if(!online){this.addCls('offline');}
		this.callParent(arguments);

		if(online){
			el.dom.setAttribute('data-qtip', 'Start a chat');
		}
	},


	destroy: function(){
		this.callParent(arguments);
	},


	startChat: function(){
		this.fireEvent('click', this, this.user.getId());
	},


	clicked: function(e){
		var nib = e.getTarget('img.nib');
		try{
			this.clickBlocker();
			if(nib){
				this.fireEvent('nibClicked', this, this.user, nib);
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
