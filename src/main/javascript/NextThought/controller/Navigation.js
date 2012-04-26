Ext.define('NextThought.controller.Navigation', {
	extend: 'Ext.app.Controller',

	require: [
		'NextThought.providers.Location'
	],

	views: [
		'frame.menus.Flyout',
		'frame.ModeSelect',
		'modes.Container'
	],

	init: function() {
		this.control({
			'nav-flyout': {
				'navigation-selected': function(ntiid){
					LocationProvider.setLocation(ntiid);
				}
			},
			'modeContainer': {
				'activate-mode': this.trackMode
			},
			'mode-select button': {
				toggle: this.switchModes
			}
		},{});
	},


	trackMode: function(mode){
		var query = 'mode-select button[title='+Ext.String.capitalize(mode)+'], mode-select button[modeId='+mode+']',
			menus = Ext.getCmp('navigation-menu-container');
		try {

			Ext.ComponentQuery.query(query)[0].toggle(true);

			menus.getLayout().setActiveItem(menus.down(mode+'-menu'));

		}
		catch(e){
			console.error('Looks like the "'+mode+'" button was not included or was typo\'ed');
		}
	},


	switchModes: function(button, state){
		var id = button.modeId || button.title.toLowerCase();
		if(state){
			try {
				Ext.getCmp(id).activate();
			}
			catch(e){
				console.log('Oops, a mode button was defined, but the related mode was not added: '+id);
			}
		}
	}
});
