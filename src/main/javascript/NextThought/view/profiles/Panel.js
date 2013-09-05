Ext.define('NextThought.view.profiles.Panel', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.profile-panel',

	navigation: {xtype: 'box'},

	body:{xtype: 'box'},


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
