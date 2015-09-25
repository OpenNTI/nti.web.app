export default Ext.define('NextThought.common.components.ResourceNotFound', {
	extend: 'Ext.Component',
	alias: 'widget.notfound',

	ui: 'resource-not-found',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'resource-not-found', cn: [
			{ cls: 'body', cn: [
				{ cls: 'heading', html: '{{{NextThought.view.ResourceNotFound.heading}}}'},
				{ cls: 'subtext', html: '{{{NextThought.view.ResourceNotFound.subtext}}}'},
				{ cls: 'actions', cn: [
					{tag: 'tpl', 'if': '!hideLibrary', cn: {cls: 'library', tag: 'a', html: '{{{NextThought.view.ResourceNotFound.action-library}}}'}},
					{cls: 'back', tag: 'a', html: '{{{NextThought.view.ResourceNotFound.action-back}}}'}
				]}
			]}
		]}
	]),

	renderSelectors: {
		backEl: 'a.back',
		libraryEl: 'a.library'
	},

	layout: 'auto',


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {hideLibrary: this.hideLibrary});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.backEl, 'click', this.goBack, this);
		if (this.libraryEl) {
			this.mon(this.libraryEl, 'click', this.goLibrary, this);
		}
	},


	goBack: function() {
		history.back();
	},


	goLibrary: function() {
		if (this.gotoLibrary) {
			this.gotoLibrary.call();
		}
	}
});

