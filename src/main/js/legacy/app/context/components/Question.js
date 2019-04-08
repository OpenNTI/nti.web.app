const Ext = require('@nti/extjs');

const {isCourseContentModalOpen} = require('nti-web-app-lesson-items');
const ContentUtils = require('legacy/util/Content');

const ContextStateStore = require('../StateStore');


module.exports = exports = Ext.define('NextThought.app.context.components.Question', {
	extend: 'Ext.Component',
	alias: 'widget.question-context',
	cls: 'context-content question-context',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'snippet cls'},
		{cls: 'see-more hidden', html: 'Read More'}
	]),

	renderSelectors: {
		snippetEl: '.snippet',
		seeMoreEl: '.see-more'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.ContextStore = ContextStateStore.getInstance();
	},

	afterRender: function () {
		this.callParent(arguments);

		this.__setContent();

		if (this.doNavigate && !this.isInContent() && !isCourseContentModalOpen() && this.seeMoreEl) {
			this.seeMoreEl.removeCls('hidden');

			this.mon(this.seeMoreEl, 'click', this.doNavigate.bind(this, this.question));
		}
	},

	isInContent: function () {
		var context = this.ContextStore.getContext(),
			currentContext = context && context.last(),
			contextRecord = currentContext && currentContext.obj;

		return contextRecord && contextRecord.getId() === this.question.get('containerId');
	},

	__setContent: function () {
		let me = this,
			content = me.question && me.question.get('content'),
			root = me.question && me.question.get('ContentRoot');

		content = (root && ContentUtils.fixReferences(content, root)) || content;

		if (content && this.rendered) {
			this.snippetEl.dom.innerHTML = content;
		}
	}
});
