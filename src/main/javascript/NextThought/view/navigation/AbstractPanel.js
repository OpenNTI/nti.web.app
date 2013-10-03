Ext.define('NextThought.view.navigation.AbstractPanel', {
	extend: 'Ext.container.Container',
	//alias: Extend, do not use this directly!

	layout: 'border',
	defaults: {
		xtype: 'container',
		border: false,
		plain: true
	},
	items: [
		{ region: 'west', width: 255, margin: '0 5 5 0' },
		{ region: 'center' }
	],


	onClassExtended: function(cls, data) {
		function apply(i,x,key) {
			if (!Ext.isDefined(data[key]) && !Ext.isDefined(cls.superclass[key])) {
				Ext.log.warn('No ' + key + ' component declared/configured');
			} else if (Ext.isString(data[key])) {
				i[x].xtype = data[key];
			} else if (Ext.isObject(data[key])) {
				Ext.applyIf(i[x], data[key]);
			} else {
				Ext.Error.raise('Cannot handle ' + key + ' as configured');
			}
		}

		delete data.items;
		delete data.layout;

		var i = data.items = Ext.clone(cls.superclass.items);

		apply(i, 0, 'navigation');
		apply(i, 1, 'body');

		Ext.callback(data.onClassExtended, this, arguments);
	},

	applyConfigs: function(name,config) {
		if (!this.hasOwnProperty('items')) {
			this.items = Ext.clone(this.items);
		}
		var map = {body: 1, navigation: 0},
			i = this.items[map[name]];

		if (!i) {
			return;
		}

		Ext.apply(i, config);
	},

	constructor: function() {
		this.callParent(arguments);
		this.navigation = this.items.first();
		this.body = this.items.last();
	}
});
