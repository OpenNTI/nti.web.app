var Ext = require('extjs');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.ContentPackageSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-content-package-item-selection',
	multiSelect: false,
	cls: 'content-package-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'content-package-item {[!values.isNativeAuthored || values.isPublished ? "published" : "unpublished"]}', cn: [
			{cls: 'icon', style: {backgroundImage: 'url({icon})'}},
			{cls: 'wrap', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'description', html: '{description}'}
			]}
		]}
	)),

	getItemData: function (item) {
		return {
			title: item.get('title'),
			icon: item.get('icon'),
			description: item.get('description'),
			isNativeAuthored: item.isRenderableContentPackage,
			isPublished: item.get('isPublished')
		};
	},

	showEmptyState: function () {
		// Display empty state
		this.itemsContainer.add({
			xtype: 'box',
			autoEl: {cls: 'empty', cn: [
				{cls: 'text', html: 'There are no readings to pick from.'}
			]}
		});

		if (this.searchCmp) {
			this.searchCmp.hide();
		}
	},

	itemMatchesSearch: function (item, searchTerm) {
		var title = item.get('title'),
			ntiid = item.getId(),
			matches = false;

		searchTerm = searchTerm.toLowerCase();

		if (title && title.toLowerCase().indexOf(searchTerm) >= 0) {
			matches = true;
		} else if (ntiid && ntiid.toLowerCase() === searchTerm) {
			matches = true;
		}

		return matches;
	},


	onSelectItem: function (el) {
		el.classList.add('selected');
	},


	onUnselectItem: function (el) {
		el.classList.remove('selected');
	},


	getSelectionItemId (item) {
		return item.get('NTIID') || item.get('OID');
	}
});
