const Ext = require('extjs');

const {EmbedInput} = require('nti-web-video');
const PromptStateStore = require('legacy/app/prompt/StateStore');
require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.video.Picker', {
	extend: 'Ext.container.Container',
	alias: 'widget.video-picker-prompt',

	cls: 'video-picker-prompt',

	layout: 'none',
	items: [],


	initComponent () {
		this.callParent(arguments);

		this.Prompt.Header.hide();
		this.Prompt.Footer.hide();

		this.add({
			xtype: 'react',
			component: EmbedInput
		});
	}
}, function () {
	PromptStateStore.register('video-picker', this);
});
