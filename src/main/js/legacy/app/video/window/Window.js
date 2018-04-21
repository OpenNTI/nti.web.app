const Ext = require('@nti/extjs');

require('legacy/common/window/Window');
require('../Video');


module.exports = exports = Ext.define('NextThought.app.video.window.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.video-window-window',
	cls: 'video-window',
	layout: 'none',
	modal: true,
	header: true,
	dialog: true,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'video-window-container', cn: [
			{cls: 'close'},
			{
				id: '{id}-body', cls: 'button-body', html: '{%this.renderContainer(out,values)%}'
			}
		]}
	]),

	renderSelectors: {
		closeEl: '.close'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.add({
			xtype: 'content-video',
			url: this.url,
			doNotDeactivateOtherPlayers: true
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.closeEl, 'click', this.onCloseClicked.bind(this));
	},

	onCloseClicked: function () {
		this.close();
		this.destroy();
	}
});
