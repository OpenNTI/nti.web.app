const Ext = require('@nti/extjs');

const SlideDeck = require('legacy/common/ux/SlideDeck');

require('legacy/webvtt/Transcript');
require('legacy/webvtt/Cue');

module.exports = exports = Ext.define(
	'NextThought.app.mediaviewer.content.SlideVideo',
	{
		extend: 'Ext.Component',
		alias: 'widget.content-slidevideo',
		ui: 'content-launcher',
		cls: 'content-launcher',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'thumbnail',
				style: { backgroundImage: 'url({thumbnail})' },
			},
			{
				cls: 'meta',
				cn: [
					{ cls: 'title', html: '{title}' },
					{ cls: 'byline', html: 'By {creator}' },
					{ cls: 'description', html: '{description}' },
					{ cls: 'launcher-button', html: 'View Presentation' },
				],
			},
		]),

		beforeRender: function () {
			this.callParent(arguments);
			this.renderData = Ext.apply(this.renderData || {}, this.data);
			this.target = this.data.href;
		},

		afterRender: function () {
			this.callParent(arguments);
			this.mon(this.el, 'click', 'onSlideVideoClicked', this);
		},

		onSlideVideoClicked: function (e) {
			SlideDeck.openFromDom(this.contentElement, this.reader);
		},
	}
);
