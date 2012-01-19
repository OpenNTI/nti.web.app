Ext.define('NextThought.view.content.Home', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.home-content-panel',
	requires: [
		'NextThought.view.widgets.LibraryView',
		'NextThought.view.widgets.main.ProfileHeader'
	],
	
	cls: 'x-home-panel',

	initComponent: function(){
		this.callParent(arguments);

		var g = 'home-library-view-style';

		this.add({xtype: 'profile-header'});

		this.add({
			cls: 'library-section',
			items: [
				{html: '<div>Library:</div>', border: false, cls: 'label', items:[
					{xtype: 'button', iconCls: 'view_style_grid', enableToggle: true, toggleGroup: g},
					{xtype: 'button', iconCls: 'view_style_icon', enableToggle: true, toggleGroup: g, pressed: true}
				]},
				{xtype: 'library-view'}
			]
		});


		this.add({
			cls: 'mystuff-section',
			items: [
				{html: 'My Stuff:', border: false, cls: 'label'},
				{border: false}
			]
		});
	}
});
