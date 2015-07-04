Ext.define('NextThought.app.profiles.user.components.membership.parts.Membership', {
	extend: 'Ext.Component',

	title: '',

	entryTpl: '',

	emptyTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'empty-text', html: '{text}'
	})),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'entries'}
	]),


	renderSelectors: {
		entriesEl: '.entries'
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.title
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.entriesEl, 'click', this.onEntryClick.bind(this));
	},


	addEntry: function(data) {
		this.entryTpl.append(this.entriesEl, data);
	},


	removeAll: function() {
		this.entriesEl.dom.innerHTML = '';
	},


	showEmptyText: function(text) {
		this.emptyTpl.append(this.entriesEl, {text: text});
	},


	onEntryClick: function() {}
});
