Ext.define('NextThought.view.account.contacts.Card',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-card',
	requires: [
		'NextThought.view.account.contacts.Activity'
	],
	cls: 'contact-card',
	layout: 'auto',
	componentLayout: 'body',
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
	getTargetEl: function () {
		return this.body;
	},

	defaultType: 'contact-activity',

	initComponent: function(){
		this.callParent(arguments);
		this.user = $AppConfig.userObject;
		this.renderData = Ext.apply(this.renderData||{},{
			avatarURL: this.user.get('avatarURL'),
			name: this.user.getName(),
			status: 'Number Theory'
		});

	}

});
