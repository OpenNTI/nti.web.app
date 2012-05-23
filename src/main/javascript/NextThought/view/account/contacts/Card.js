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
		this.callParent(arguments);
		if(!this.user){
			console.error('No user specified');
			return;
		}

		//for querying later:
		this.username = this.user.get('Username');

		this.renderData = Ext.apply(this.renderData||{},{
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: 'Current Status'
		});

	},


	afterRender: function(){
		this.getEl().on('click', this.clicked, this);
		this.mixins.shareableTarget.afterRender.call(this);
		this.callParent(arguments);
	},


	clicked: function(e){
		this.fireEvent('click', this, this.user.getId());
	}

});
