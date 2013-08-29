/*jslint */
/*globals SlideDeck */
Ext.define('NextThought.view.slidedeck.slidevideo.SlideVideo', {
	extend: 'Ext.Component',
	alias:  'widget.content-slidevideo',

	requires: [
		'NextThought.webvtt.Transcript',
		'NextThought.webvtt.Cue'
	],

	ui:  'content-slidevideo',
	cls: 'content-slidevideo',

	renderTpl: Ext.DomHelper.markup([
										{ cls: 'thumbnail', style: { backgroundImage: 'url({thumbnail})'} },
										{ cls: 'meta', cn: [
											{ cls: 'title', html: '{title}' },
											{ cls: 'byline', html: 'By {creator}' },
											{ cls: 'description', html: '{description}' },
											{ cls: 'presentation-button', html: 'View Presentation' }
										]}
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
		SlideDeck.open(this.contentElement, this.reader);
	}
});
