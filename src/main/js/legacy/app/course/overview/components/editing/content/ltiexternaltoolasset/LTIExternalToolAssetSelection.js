const Ext = require('@nti/extjs');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.LTIExternalToolAssetSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-ltiexternaltoolasset-selection',

	cls: 'ltiexternaltoolasset-item-selection item-selection assignment-item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'ltiexternaltoolasset-item assignment-item {cls}', cn: [
			{tag: 'tpl', 'if': 'icon', cn: [
				{cls: 'icon', tag: 'img', src: '{icon}'},
			]},
			{tag: 'tpl', 'if': '!icon', cn: [
				{cls: 'icon-fallback icon-hyperlink', tag: 'i'},
			]},
			{cls: 'meta', cn: [
				{cls: 'title', html: '{title}'},
				{cls: 'description', html: '{description}'}
			]}
		]}
	)),

	getItemData: function (item) {
		return {
			title: item.title,
			description: item.description,
			icon: item['icon_url']
		};
	},

	checkForMatch: function (string, value) {
		return string && string.toLowerCase().indexOf(value) >= 0;
	},

	itemMatchesSearch: function (item, searchTerm) {
		return this.checkForMatch(item.ID, searchTerm.toLowerCase()) || this.checkForMatch(item.description, searchTerm.toLowerCase());
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
