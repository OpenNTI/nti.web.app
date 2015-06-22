Ext.define('NextThought.app.context.components.cards.RelatedWork', {
	extend: 'Ext.Component',
	alias: 'widget.context-relatedwork-card',

	requires: [
		'NextThought.app.context.StateStore'
	],

	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image related-context', cn: [
			{cls: 'thumbnail'},
			{cls: 'meta', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'author', html: 'by {author}'}
			]}
		]}
	]),

	renderSelectors: {
		iconEl: '.thumbnail'
	},
	
	
	initComponent: function() {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();

		this.renderData = Ext.applyIf(this.renderData || {}, {
			title: this.content && this.content.get('label'),
			author: this.content && this.content.get('Creator')
		});
	},

	afterRender: function() {
		this.callParent(arguments);
		this.setContent();
	},

	/**
	 * Override this if you want to set content after the component's been rendered.
	 */
	setContent: function() {
		var href = this.content && this.content.get('icon'),
			root = this.course && this.course.getContentRoots && this.course.getContentRoots()[0],
			url;

		if (Globals.ROOT_URL_PATTERN.test(href)) {
			url = getURL(href);
		} else if (!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)) {
			url = getURL(root + href);
		}

		if(this.iconEl && url) {
			this.iconEl.setStyle({'backgroundImage': 'url(' + url + ')'});	
		}
	}
});