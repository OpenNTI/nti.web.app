Ext.define('NextThought.app.profiles.user.components.about.parts.Membership', {
	extend: 'NextThought.app.profiles.user.components.membership.parts.Membership',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}'},
		{cls: 'entries'},
		{cls: 'see-all', html: 'See All'}
	]),


	renderSelectors: {
		entriesEl: '.entries',
		seeAllEl: '.see-all'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.seeAllEl, 'click', this.onSeeAll.bind(this));
	},


	onSeeAll: function() {
		this.gotoSeeAll();
	}
});
