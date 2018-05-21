const Ext = require('@nti/extjs');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.LTIExternalToolAssetSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-ltiexternaltoolasset-selection',

	cls: 'ltiexternaltoolasset-item-selection item-selection assignment-item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'ltiexternaltoolasset-item assignment-item {cls}', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'description', html: '{description}'}
		]}
	)),


	getItemData: function (item) {
		return {
			title: item.title,
			description: item.description,
		};
	},

	itemMatchesSearch: function (item, searchTerm) {
		var consumerKey = item.consumer_key,
			matches = false;

		searchTerm = searchTerm.toLowerCase();

		if (consumerKey && consumerKey.toLowerCase().indexOf(searchTerm) >= 0) {
			matches = true;
		}

		return matches;
	},


	onSelectItem: function (el) {
		if (el) {
			el.classList.add('selected');
		}
	},


	onUnselectItem: function (el) {
		if (el) {
			el.classList.remove('selected');
		}
	}
});