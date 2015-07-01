Ext.define('NextThought.app.context.components.cards.Video', {
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

	beforeRender: function(){
		this.callParent(arguments);

		var srcs = this.video && this.video.get('sources'),
			src = srcs && srcs[0],
			poster = src && src.poster;

		this.renderData = Ext.applyIf(this.renderData || {}, {
			poster: poster,
			title: this.video.get('title')
		});
	},

	setContent: function() {}
});