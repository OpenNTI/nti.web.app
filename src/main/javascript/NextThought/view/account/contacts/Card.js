Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contact-card',
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

		//convenience interface class. This will abstract the user object and the friendslist record so we can just have
		// a record and a field to remove the contact from the list and save.
		function ContactContainer(group){
			this.record = group;
			this.field = group ? 'friends' : '';
		}
		//store the data for the event of clicking on the nib...
		this.contactContainer = new ContactContainer(this.group);

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

		this.menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			defaults: {ui: 'nt-menuitem', plain: true },
			parentItem: this,
			items: [
				{text: 'Remove Contact'},
				{text:'Start a Chat', hidden: !$AppConfig.service.canChat()}
			]
		});

	},


	afterRender: function(){
		var el = this.getEl();

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');
		this.callParent(arguments);
	},


	clicked: function(e){
		var nib = e.getTarget('img.nib');
		if(nib){
			//this.fireEvent('remove-contact-from', this.contactContainer, this.user);
			this.menu.showBy(nib,'tr-tl',[10,0]);

			return;
		}


		try{
			this.clickBlocker();
			this.fireEvent('click', this, this.user.getId());
		}
		catch(er){
			this.fireEvent('blocked-click', this, this.user.getId());
		}
	}

});
