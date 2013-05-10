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
		this.enableBubble('nibClicked', 'presence-changed');

		//for querying later:
		this.username = this.user.getId();

		this.renderData = Ext.apply(this.renderData||{},{
			hideNib: Boolean(this.hideNib),
			blank: Ext.BLANK_IMAGE_URL,
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: '',//eventaully this will get the status off the presence model
			from: this.group ? 'this Group' : 'my contacts'
		});

		this.user.addObserverForField(this, 'Presence', this.presenceChanged, this);
	},

	afterRender: function(){
		var el = this.getEl(),
			online = this.isOnline();

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');

        if(!online){this.addCls('offline');}
		this.callParent(arguments);

		if(online){
			el.dom.setAttribute('data-qtip', 'Start a chat');
		}
	},

	isOnline: function(val){
		return (val || this.user.get('Presence').toString()) === 'Online';
	},

	updatePresenceState: function(value){
		if(this.isOnline(value.toString())){
			this.removeCls('offline');
		}
		else{
			this.addCls('offline');
		}
	},

	presenceChanged: function(key, value){
		this.updatePresenceState(value);
		this.fireEvent('presence-changed', this);
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
	},

	getUserObject: function(){
		return this.user;
	}
});
