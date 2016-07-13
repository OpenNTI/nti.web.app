var Ext = require('extjs');
var ContextStateStore = require('../../StateStore');


module.exports = exports = Ext.define('NextThought.app.context.components.cards.RelatedWork', {
	extend: 'Ext.Component',
	alias: 'widget.context-relatedwork-card',
	cls: 'context-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'context-image related-context content-card', cn: [
			{cls: 'thumbnail'},
			{cls: 'meta', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'byline hidden', html: 'by {author}'},
				{cls: 'description', html: '{description}'}
			]}
		]},
		{cls: 'see-more hidden', html: 'Read More'}
	]),

	renderSelectors: {
		iconEl: '.thumbnail',
		seeMoreEl: '.see-more',
		bylineEl: '.byline'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.ContextStore = NextThought.app.context.StateStore.getInstance();

		this.renderData = Ext.applyIf(this.renderData || {}, {
			title: this.content && this.content.get('label'),
			author: this.content && this.content.get('byline'),
			description: this.content && this.content.get('description')
		});
	},

	isInContext: function () {
		var context = this.ContextStore.getContext(),
			root = context && context.last(),
			id = root && root.obj && root.obj.getId();

		return this.record && id === this.record.get('ContainerId');
	},

	afterRender: function () {
		this.callParent(arguments);
		this.setContent();

		if (this.doNavigate && !this.isInContext()) {
			this.seeMoreEl.removeCls('hidden');
			this.mon(this.seeMoreEl, 'click', this.doNavigate.bind(this, this.record));
		}

		if (this.content && this.content.get('byline')) {
			this.bylineEl.removeCls('hidden');
		}
	},

	/**
	 * Override this if you want to set content after the component's been rendered.
	 */
	setContent: function () {
		var root = this.course && this.course.getContentRoots && this.course.getContentRoots()[0],
			icon = this.content.getIcon(root),
			url = (icon && typeof icon !== 'string') ? icon.url : icon;

		if (this.iconEl && url) {
			this.iconEl.setStyle({'backgroundImage': 'url(' + url + ')'});
		}
	}
});
