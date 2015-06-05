Ext.define('NextThought.app.windows.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.windows-view',

	layout: 'none',

	requires: [
		'NextThought.app.windows.components.Container',
		'NextThought.app.windows.StateStore',
		'NextThought.app.annotations.note.Window'
	],

	cls: 'window-container',

	items: [{
		xtype: 'window-container'
	}],


	initComponent: function() {
		this.callParent(arguments);

		this.WindowStore = NextThought.app.windows.StateStore.getInstance();

		this.viewContainer = this.down('window-container');

		this.mon(this.WindowStore, {
			'show-window': this.showWindow.bind(this)
		});
	},


	addOpenCls: function() {
		var html = document.getElementsByTagName('html')[0];

		html.classList.add('window-open');
	},


	showWindow: function(object, path, el) {
		var cmp = this.WindowStore.getComponentForMimeType(object.mimeType);

		if (!cmp) {
			console.error('No component to show object of ', object.mimeType);
			return;
		}

		this.viewContainer.removeAll();

		this.viewContainer.add(cmp.create({
			record: object,
			doClose: this.doClose.bind(this)
		}));

		this.addOpenCls();
	},


	doClose: function() {}
});
