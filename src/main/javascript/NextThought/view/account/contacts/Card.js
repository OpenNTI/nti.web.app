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



//		this.startChatAction = new Ext.Action({
//			text: 'Start a Chat',
//			scope: this,
//			handler: this.startChat,
//			itemId: 'start-chat',
//			ui: 'nt-menuitem', plain: true,
//			hidden: !$AppConfig.service.canChat(),
//			disabled: this.user.get('Presence')==='Offline'
//		});
	},


//	changeGrouping: function(menu,item){
//		var group = item.record;
//		if(!group){
//			return;
//		}
//		group[item.checked?'addFriend':'removeFriend'](this.username).save();
//	},


	afterRender: function(){
		var el = this.getEl();

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');
		this.callParent(arguments);
	},


	destroy: function(){
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
		function show(){
			var pop = Ext.widget('contact-popout',{record: record}),
					alignment = 'tr-tl',
					offsets = [-10,-25],
					play = Ext.dom.Element.getViewportHeight() - Ext.fly(nib).getTop();

			if(pop.isDestroyed){return;}

			pop.show().hide();

			if( pop.getHeight() > play ){
				pop.addCls('bottom-aligned');
				alignment = 'br-bl';
				offsets[1] = -offsets[1];
			}

			pop.show();
			pop.alignTo(nib,alignment,offsets);
		}

//		Ext.fly(item).scrollIntoView(
//				item.parentNode,false,{diration: 500});

		Ext.defer(show,500,this);
	}

});
