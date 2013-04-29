Ext.define('NextThought.ux.UpdatedTos', {
	extend: 'NextThought.ux.WelcomeGuide',
	alias: 'widget.updated-tos',

	cls:'tos-window',
	width: 695,
	height: 640,
	layout: 'vbox',
	modal: true,
	resizable: false,
	items: [
		{ 
			xtype: 'box',
			cn:[{tag:'h3',html:'We recently updated our Terms of Service and Privacy Policy.'},
				{tag:'span', cls:'you-should', html:'Please take a moment to read them carefully.'}],
			cls: 'tos-header',
			flex: 0
		},
		{
			xtype: 'component',
			cls: 'help-iframe',
			flex: 1,
			autoEl: {
				tag: 'iframe',
				src: '{url}',
				frameBorder: 0,
				marginWidth: 0,
				marginHeight: 0,
				seamless: true,
				transparent: true,
				allowTransparency: true,
				style: 'overflow-x: hidden; overflow-y:auto'
			}
		}],
	dockedItems:{
		xtype: 'container',
		dock:'bottom',
		ui: 'footer',
		height:55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults:{
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items:[{
			layout: {type:'hbox', pack:'end'},
			defaults: { xtype:'button', ui:'blue', scale:'large'},
			items:[
				{
					xtype: 'checkbox', 
					name: 'check_accept_tos', 
					cls: 'yes-checkbox', 
					flex: 1, 
					boxLabel: 'Yes, I agree to the Terms of Service and Privacy Policy',
					handler: function(b,e) {
						var btn = Ext.getCmp('tos-agree');
						btn.setDisabled(!btn.disabled);
						// would prefer to check the button's state, relying on initial state = disabled
					}
				},
				{
					text: 'I Agree', 
					cls:'.x-btn-blue-large dismiss', 
					flex: 0, 
					action: 'cancel', 
					id: 'tos-agree',
					disabled: true,
					handler: function(b, e){ e.stopEvent(); b.up('window').close();}
				}
			]
		}]
	}
});
