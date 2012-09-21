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
	},


	afterRender: function(){
		var el = this.getEl();

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');

        if(this.user.get('Presence') !== 'Online'){this.addCls('offline');}

		this.callParent(arguments);
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
				this.showPopout(this.user,nib);
			}
			else {
				this.startChat();
			}
		}
		catch(er){
			this.fireEvent('blocked-click', this, this.user.getId());
		}
	},


	showPopout: function(record, nib){
		NextThought.view.account.contacts.management.Popout.popup(record,this.el.down('img:not(.nib)'),this.el,[-10,-18]);
	}

});
