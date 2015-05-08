Ext.define('NextThought.app.course.overview.components.parts.IframeWindow', {
	extend: 'NextThought.common.components.cards.Card',
	alias: 'widget.course-overview-ntigenericiframewindow',

	requires: [
		'NextThought.common.ux.IframeWindow'
	],

	constructor: function(config) {
		var n = config.node || {getAttribute: function(a) { return config[a];} },
			ntiid = n.getAttribute('NTIID');


		config.data = {
			description: Ext.String.ellipsis(n.getAttribute('desc'), 200, true),
			thumbnail: n.getAttribute('icon'),
			ntiid: ntiid,
			title: n.getAttribute('label'),
			href: n.getAttribute('href'),
			windowWidth: n.getAttribute('window-width'),
			windowHeight: n.getAttribute('window-height')
		};

		this.callParent([config]);
	},

	shouldOpenInApp: function() {
		return true;
	},


	navigateToTarget: function() {
		var win,
			dH = this.data.windowHeight,
			dW = this.data.windowWidth,
			height = dH, width = dW,
			aspect = dW / dH,
			maxWidth = Ext.Element.getViewportWidth(),
			maxHeight = Ext.Element.getViewportHeight();

		while (height > maxHeight || width > maxWidth) {
			height -= 10;
			width = aspect * height;
		}

		win = Ext.widget('iframe-window', {
			link: this.data.href,
			noSaveLink: true,
			width: width,
			height: height
		});

		win.show();
	}
});
