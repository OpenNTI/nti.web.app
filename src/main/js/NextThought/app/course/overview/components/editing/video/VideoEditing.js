Ext.define('NextThought.app.course.overview.components.editing.video.VideoEditing', {
	extend: 'Ext.container.Container',
	alias: 'widget.editing-video-editing',

	layout: 'none',
	cls: 'editing-window',

	requires: [
		'NextThought.app.course.overview.components.editing.video.Editor',
		'NextThought.app.course.overview.components.editing.video.Preview'
	],

	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.data = this.data || this.precahce && this.precahce.data || {};

		this.setupComponents();
	},

	setupComponents: function() {
		this.add([
			{xtype: 'editing-video-preview', data: this.data},
			{xtype: 'editing-video-editor', data: this.data}
		]);
	}
});
