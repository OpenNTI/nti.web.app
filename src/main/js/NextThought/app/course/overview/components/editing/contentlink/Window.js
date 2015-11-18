Ext.define('NextThought.app.course.overview.components.editing.contentlink.Window', {
	extend: 'Ext.container.Container',
		alias: 'widget.editing-contentlink-window',

	layout: 'none',
	cls: 'editing-window',

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Editor',
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	items: [],


	initComponent: function(){
		this.callParent(arguments);

		// TODO: This will need to change. We need the content link to be a record, right now we have a object (node)
		this.data = this.data || this.precache && this.precache.data || {};		

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this)
		});

		this.headerCmp.setTitle('Edit Content Node');
		this.setupComponents();
	},

	setupComponents: function(){
		this.add({xtype: 'editing-contentlink-preview', data: this.data});
		this.add({xtype: 'editing-contentlink-editor', data: this.data});
	},


	onClose: function(){
		this.doClose();
	},


}, function(){
	NextThought.app.windows.StateStore.register('edit-contentlink', this);
});