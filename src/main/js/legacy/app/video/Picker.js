const Ext = require('extjs');

const PromptStateStore = require('legacy/app/prompt/StateStore');

module.exports = exports = Ext.define('NextThought.app.video.Picker', {
	extend: 'Ext.container.Container',
	alias: 'widget.video-picker-prompt',

	cls: 'video-picker-prompt',

	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		this.add({
			xtype: 'box',
			autoEl: {html: 'Video Picker'}
		});
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
