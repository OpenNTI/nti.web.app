Ext.define('NextThought.app.course.overview.components.editing.video.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.editing-video-window',

	layout: 'none',
	cls: 'editing-window',

	requires: [
		'NextThought.app.course.overview.components.editing.video.VideoEditing',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading'
	],

	items: [],

	initComponent: function(){
		this.callParent(arguments);


		// TODO: get the video data

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this)
		});

		this.headerCmp.setTitle('Edit Video');
		this.setupComponents();
	},

	setupComponents: function() {
		this.add({xtype: 'editing-video-editing'});
	},

	onClose: function(){
		this.doClose();
	}

}, function(){
	NextThought.app.windows.StateStore.register('edit-video', this);
});
