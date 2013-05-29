Ext.define("NextThought.view.menus.Presence",{
	extend: "Ext.menu.Menu",
	alias: 'widget.presence-menu',
    requires: [

    ],
    ui: 'nt',
    plain: true,
    showSeparator: false,
    shadow: false,
    frame: false,
    border: false,
    hideMode: 'display',
    minWidth: 200,

    defaults: {
        ui: 'nt-menuitem',
        xtype: 'menuitem',
        plain: true
    },

    initComponent: function(){
		this.callParent(arguments);

		var items = [];

		items.push({
			action: 'unavailable',
			field: 'type',
			text: 'Unavailable'
		});

		items.push({
			action: 'chat',
			field: 'show',
			text: 'Available'
		});

		items.push({
			actions: 'away',
			field: 'show',
			text: 'Away'
		});

		items.push({
			actions: 'dnd',
			field: 'show',
			text: 'Do not disturb'
		});

		this.add(items);
	}
});