const Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.invite.EmailTokens', {
	extend: 'Ext.Component',
	alias: 'widget.email-tokens',

	cls: 'unstyled-tokens',
	renderSelectors: {
		wrapEl: '.token-wrap',
		emailCountEl: '.email-count'
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'token-wrap'},
		{tag: 'span', cls: 'email-count', html: ''}
	]),

	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'token', cn: [
		{tag: 'span', cls: 'value', html: '{text}'}
	]}),

	afterRender () {
		this.callParent(arguments);

		this.addTags(this.tags);
	},

	addTags (tags) {
		this.wrapEl.dom.innerHTML = '';
		this.emailCountEl.setHTML('');
		if(!Array.isArray(tags) || tags.length === 0) {
			return;
		}
		let numberTags = tags.length;

		for(let tag of tags) {
			let insertedTag = this.insertTag(tag),
				boundingRect = insertedTag.dom.getBoundingClientRect();
			if ((Math.ceil(boundingRect.left) >= Math.floor(this.emailCountEl.dom.getBoundingClientRect().left) - 20) || boundingRect.width === 0) { break; }
			numberTags = numberTags - 1;
		}

		if(numberTags !== 0) {
			this.emailCountEl.setHTML(`+${numberTags}`);
		}
	},

	insertTag (tag) {
		return this.tokenTpl.append(this.getInsertionPoint(), Ext.apply({text: tag}), true);
	},

	getInsertionPoint () {
		return this.wrapEl;
	}
});
