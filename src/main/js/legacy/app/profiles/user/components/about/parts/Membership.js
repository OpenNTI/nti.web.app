var Ext = require('extjs');
var PartsMembership = require('../../membership/parts/Membership');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.about.parts.Membership', {
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
		this.seeAllEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.mon(this.seeAllEl, 'click', this.onSeeAll.bind(this));
	},


	onSeeAll: function() {
		this.gotoSeeAll();
	}
});
