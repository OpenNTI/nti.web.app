var Ext = require('extjs');
var UxWelcomeGuide = require('./WelcomeGuide');


module.exports = exports = Ext.define('NextThought.common.ux.UpdatedTos', {
	extend: 'NextThought.common.ux.WelcomeGuide',
	alias: 'widget.updated-tos',

	cls: 'tos-window',
	width: 695,
	layout: 'none',
	modal: true,
	resizable: false,
	onEsc: Ext.emptyFn, //Don't allow escaping to close, you must check the box and click accept
	items: [
		{
			xtype: 'box',
			autoEl: {cn: [
				{tag: 'h3', html: 'We recently updated our Terms of Service and Privacy Policy.'},
				{tag: 'span', cls: 'you-should', html: 'Please take a moment to read them carefully.'}
			]},
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
				style: 'overflow-x: hidden; overflow-y:auto; height: 520px;'
			}
		},
		{
			xtype: 'container',
			cls: 'nti-window-footer',
			height: 55,
			layout: 'none',
			defaults: {
				cls: 'footer-region',
				xtype: 'container',
				flex: 1,
				layout: 'none'
			},
			items: [
				{
					defaults: { xtype: 'button', ui: 'blue', scale: 'large'},
					items: [
						{
							xtype: 'checkbox',
							name: 'check_accept_tos',
							cls: 'yes-checkbox',
							flex: 1,
							boxLabel: 'Yes, I agree to the Terms of Service and Privacy Policy.',
							handler: function(b, e) {
								var btn = Ext.getCmp('tos-agree');
								btn.setDisabled(!btn.disabled);
								// would prefer to check the button's state, relying on initial state = disabled
							}
						},
						{
							text: 'I Agree',
							cls: '.x-btn-blue-large dismiss',
							flex: 0,
							action: 'cancel',
							id: 'tos-agree',
							disabled: true,
							handler: function(b, e) {
								e.stopEvent();
								b.up('window').close();
							}
						}
					]
				}
			]
		}
	]
});
