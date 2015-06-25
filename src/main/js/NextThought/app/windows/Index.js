Ext.define('NextThought.app.windows.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.windows-view',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	requires: [
		'NextThought.app.windows.components.Container',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.Actions',
		'NextThought.app.annotations.note.Window'
	],

	cls: 'window-container',

	items: [{
		xtype: 'window-container'
	}],


	initComponent: function() {
		this.callParent(arguments);

		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();

		this.WindowStore.addAllowNavigationHandler(this.allowNavigation.bind(this));

		this.viewContainer = this.down('window-container');

		this.mon(this.WindowStore, {
			'show-window': this.showWindow.bind(this),
			'close-window': this.closeWindow.bind(this),
			'allow-navigation': this.allowNavigation.bind(this)
		});
	},


	allowNavigation: function() {
		var allow = true;

		this.viewContainer.items.each(function(item) {
			if (item && item.allowNavigation) {
				allow = item.allowNavigation();
			}

			return allow;
		});

		return allow;
	},


	showWindow: function(object, state, el, monitors, precache) {
		var type = this.WindowStore.getComponentForMimeType(object.mimeType || object),
			cmp;

		if (!type) {
			console.error('No component to show object of ', object.mimeType);
			return;
		}

		this.viewContainer.removeAll();

		cmp = type.create({
			record: object.isModel && object,
			precache: precache || {},
			state: state,
			doClose: this.doClose.bind(this, monitors && monitors.afterClose)
		});

		cmp.addCls('object-window');

		this.viewContainer.add(cmp);

		this.WindowStore.addOpenCls();
	},


	closeWindow: function() {
		this.viewContainer.removeAll();
		this.WindowStore.removeOpenCls();
	},


	doClose: function(afterClose) {
		this.WindowActions.closeWindow();

		if (afterClose) {
			afterClose.call();
		}
	}
});
