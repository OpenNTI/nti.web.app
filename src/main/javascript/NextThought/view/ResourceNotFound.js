Ext.define('NextThought.view.ResourceNotFound', {
	extend: 'Ext.Component',
	alias: 'widget.notfound',

	ui: 'resource-not-found',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'resource-not-found', cn: [
			{ cls: 'body', cn: [
				{ cls: 'heading', html: 'Sorry, this page doesn\'t exist...'},
				{ cls: 'subtext', html: 'Your link may contain errors or the page may no longer exist.'},
				{ cls: 'actions', cn: [
					{tag: 'tpl', 'if': '!hideLibrary', cn: {cls: 'library', tag: 'a', html: 'Library'}},
					{cls: 'back', tag: 'a', html: 'Previous Page'}
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
		this.fireEvent('go-to-library');
	}
});

