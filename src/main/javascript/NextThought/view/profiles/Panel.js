Ext.define('NextThought.view.profiles.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.profile-panel',

	navigation: {},
	body:{cls:'make-white'},

	ui:  'profile',
	cls: 'profile-view',

	config: {
	},

	constructor: function (config) {
//		this.applyConfigs('body', {})
//		this.applyConfigs('navigation', {});

		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.fireEvent('loaded');
	}

});
