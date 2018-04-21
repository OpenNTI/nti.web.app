const Ext = require('@nti/extjs');

const {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.Empty', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-part-empty',

	cls: 'item empty empty-activity-stream',

	titleIsMe: 'You don\'t have any activity yet...',
	titleNotMe: 'This user doesn\'t have any activity yet...',
	subtitle:  'Discussions and other activity will be collected here',

	filterTitle: 'No Results',
	filterSubtitle: 'Try expanding your filters to view more items.',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'container-empty', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'subtitle', html: '{subtitle}'}
		]}
	]),


	renderSelectors: {
		titleEl: '.container-empty .title'
	},


	beforeRender: function () {
		this.callParent(arguments);

		var hasFilters = Boolean(this.hasFilters);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: hasFilters ? this.filterTitle : this.getTitle(),
			subtitle: hasFilters ? this.filterSubtitle : this.subtitle
		});
	},


	getTitle () {
		return isMe(this.user) ? this.titleIsMe : this.titleNotMe;
	},


	setUser (user) {
		this.user = user;

		this.titleEl.update(this.getTitle());
	}
});
