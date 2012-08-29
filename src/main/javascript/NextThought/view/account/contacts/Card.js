Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.Component',
	alias: 'widget.contact-card',
	mixins: {
//		shareableTarget: 'NextThought.mixins.ShareableTarget'
	},
	cls: 'contact-card',
	renderTpl: Ext.DomHelper.markup([
		{tag:'tpl', 'if':'!hideNib', cn:[
			{tag:'img', cls:'nib', src:'{blank}', alt:'Remove this contact from {from}'}]},
		{tag:'img', src:'{avatarURL}'},
		{ cls:'card-body', cn:[
			{cls:'name', html:'{name}'},
			{cls:'status', html:'{status}'}
		]}
	]),



	constructor: function(){
//		this.mixins.shareableTarget.constructor.call(this);
		return this.callParent(arguments);
	},

	initComponent: function(){
		this.clickBlocker = Globals.buildBlocker(this);

		//convenience interface class. This will abstract the user object and the friendslist record so we can just have
		// a record and a field to remove the contact from the list and save.
		function ContactContainer(group){
			this.record = group || $AppConfig.userObject;
			this.field = group ? 'friends' : 'following';
		}
		//store the data for the event of clicking on the nib...
		this.contactContainer = new ContactContainer(this.group);


		this.callParent(arguments);
		if(!this.user){
			console.error('No user specified');
			return;
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
		var el = this.getEl(),
			nib = el.down('img.nib'),
			tip;

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');
//		this.mixins.shareableTarget.afterRender.call(this);
		this.callParent(arguments);

		if(nib){
			tip = Ext.widget({ xtype: 'tooltip', target: nib, html: nib.getAttribute('alt') });
			this.on('destroy',function(){ tip.destroy(); });
		}
	},


	clicked: function(e){
		if(e.getTarget('img.nib')){
			this.fireEvent('remove-contact-from', this.contactContainer, this.user);
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
