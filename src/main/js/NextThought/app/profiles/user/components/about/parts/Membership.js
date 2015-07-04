Ext.define('NextThought.app.profiles.user.components.about.parts.Membership', {
	extend: 'Ext.Component',

	title: '',

	entryTpl: '',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'entries'},
		{cls: 'see-all', html: 'See All'}
	]),


	renderSelectors: {
		entriesEl: '.entries',
		seeAllEl: '.see-all'
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
		this.mon(this.seeAllEl, 'click', this.onSeeAll.bind(this));
	},


	addEntry: function(data) {
		this.entryTpl.append(this.entriesEl, data);
	},


	removeAll: function() {
		this.entriesEl.dom.innerHTML = '';
	},


	onEntryClick: function() {},
	onSeeAll: function() {}
});
