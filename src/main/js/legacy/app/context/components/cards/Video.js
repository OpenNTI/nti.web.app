var Ext = require('extjs');
var CardsContent = require('./Content');


module.exports = exports = Ext.define('NextThought.app.context.components.cards.Video', {
	extend: 'NextThought.app.context.components.cards.Content',
	alias: 'widget.context-video-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image image-context', cn: [
			{tag: 'img', cls: 'image', src: '{poster}'},
			{cls: 'title', html: '{title}'},
			{cls: 'text'}
		]}
	]),

	renderSelectors: {
		imageEl: '.image',
		title: '.title',
		text: '.text'
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.renderData = Ext.applyIf(this.renderData || {}, {
			title: this.video.get('title')
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.setPoster();

		this.mon(this.video, 'resolved-poster', this.setPoster.bind(this));
	},

	setContent: function () {},


	setPoster: function () {
		if (!this.imageEl) { return; }

		var poster = this.video.get('poster');

		this.imageEl.dom.setAttribute('src', poster);
	}
});
