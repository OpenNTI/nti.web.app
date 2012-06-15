Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-card',
	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.Activity'
	],
	mixins: {
		shareableTarget: 'NextThought.mixins.ShareableTarget'
	},
	cls: 'contact-card',
	layout: 'auto',
	componentLayout: 'templated-container',
	renderTpl: [
		'<tpl if="!hideNib">',
			'<img class="nib" src="{blank}" alt="Remove this contact from {from}">',
		'</tpl>',
		'<img src="{avatarURL}">',
		'<div class="card-body">',
			'<div class="name">{name}</div>',
			'<div class="status">{status}</div>',
			'<div id="{id}-body" class="activities">',
				'{%this.renderContainer(out,values)%}',
			'</div>',
		'</div>'
	],


	childEls: ['body'],


	constructor: function(){
		this.mixins.shareableTarget.constructor.call(this);
		return this.callParent(arguments);
	},

	getTargetEl: function () {
		return this.body;
	},

	defaultType: 'contact-activity',

	initComponent: function(){

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
			status: 'Current Status',
			from: this.group ? 'this Group' : 'my contacts'
		});

	},


	afterRender: function(){
		var el = this.getEl();
		var nib = el.down('img.nib');
		var tip;

		el.on('click', this.clicked, this);
		el.addClsOnOver('card-over');
		this.mixins.shareableTarget.afterRender.call(this);
		this.callParent(arguments);

		if(nib){
			tip = Ext.widget({ xtype: 'tooltip', target: nib, html: nib.getAttribute('alt') });
			this.on('destroy',function(){ tip.destroy(); });
		}
	},


	clicked: function(e){
		if(e.getTarget('img.nib')){
			this.fireEvent('remove-contact-from', this.contactContainer, this.user);
		}
		else {
			this.fireEvent('click', this, this.user.getId());
		}
	}

});
