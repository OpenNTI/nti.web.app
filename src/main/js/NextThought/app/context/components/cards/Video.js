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

		var src = this.video && this.video.get('sources')[0].poster;
		this.renderData = Ext.applyIf(this.renderData || {}, {
			poster: src,
			title: this.video.get('title')
		});
	},

	setContent: function() {}
});