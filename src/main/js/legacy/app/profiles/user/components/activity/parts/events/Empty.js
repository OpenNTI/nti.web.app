var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.Empty', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-part-empty',
	
	cls: 'item empty empty-activity-stream',
	
	title: 'You don\'t have any activity yet...',
	subtitle:  'Your discussions, bookmarks, and other activity will be collected here',
	
	filterTitle: 'No Results',
	filterSubtitle: 'Try expanding your filters to view more items.',
	
	renderTpl: Ext.DomHelper.markup([
		{cls: 'container-empty', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'subtitle', html: '{subtitle}'}	
		]}
	]),
	
	
	beforeRender: function () {
		this.callParent(arguments);
		var hasFilters = Boolean(this.hasFilters);
		
		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.hasFilters ? this.filterTitle : this.title,
			subtitle: this.hasFilters ? this.filterSubtitle : this.subtitle
		});
	}
});