const Ext = require('extjs');

const Video = require('legacy/model/Video');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.video.ItemSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-video-item-selection',

	multiSelect: true,

	cls: 'video-item-selection item-selection',


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({tag: 'div', cls: 'video-item-container', cn: [
		{tag: 'label', cls: 'video-item', cn: [
			{tag: 'input', type: 'checkbox'},
			{cls: 'thumbnail', style: {backgroundImage: 'url({thumbnail})'}},
			{cls: 'title', html: '{title}'},
			{cls: 'providers', cn: [
				{tag: 'tpl', 'for': 'providers', cn: [
					{tag: 'span', cls: 'provider', html: '{label}'}
				]}
			]}
		]},
		{tag: 'span', cls: 'edit-link nt-button edit', 'data-ntiid': '{ntiid}', html: 'Edit'}
	]})),

	// editItem: function (ntiid) {...defined elsewhere},
	// getExcludedVideos: function (videos) {...defined elsewhere},

	getItemData: function (item) {
		if (!(item instanceof Video)) {
			item = Video.create({
				label: item.title,
				title: item.title,
				sources: item.sources || [],
				NTIID: item.ntiid
			}, item.ntiid, item);
		}

		return item.resolveThumbnail()
			.then(function (thumbnail) {
				var sources = item.get('sources');

				return {
					thumbnail: thumbnail,
					title: item.get('title'),
					providers: sources.map(function (source) { return {label: source.service}; }),
					ntiid: item.get('ntiid')
				};
			})
			.catch(() => {
				const sources = item.get('sources');

				item.resolveThumbnail();

				return {
					title: item.get('title'),
					providers: sources.map(source => ({label: source.service})),
					ntiid: item.get('ntiid')
				};
			});
	},


	showEmptyState: function () {
		// Display empty state
		this.itemsContainer.add({
			xtype: 'box',
			autoEl: {cls: 'empty', cn: [
				{cls: 'text', html: 'There are no videos to pick from.'}
			]}
		});

		if (this.searchCmp) {
			this.searchCmp.hide();
		}
	},


	itemMatchesSearch: function (item, searchTerm) {
		var title = item.get('title'),
			ntiid = item.getId(),
			sources = item.get('sources'),
			matches = false;

		searchTerm = searchTerm.toLowerCase();

		if (title && title.toLowerCase().indexOf(searchTerm) >= 0) {
			matches = true;
		} else if (ntiid && ntiid.toLowerCase() === searchTerm) {
			matches = true;
		} else if (sources && sources.length) {
			matches = sources.reduce(function (acc, source) {
				var provider = source.service;

				return provider.toLowerCase() === searchTerm;
			}, false);
		}

		return matches;
	},


	onSelectItem: function (el) {
		var input = el && el.querySelector('input[type=checkbox]');

		if (input) {
			input.checked = true;
		}

		if (el) {
			el.classList.add('selected');
		}
	},


	onUnselectItem: function (el) {
		var input = el && el.querySelector('input[type=checkbox]');

		if (input) {
			input.checked = false;
		}

		if (el) {
			el.classList.remove('selected');
		}
	}
});
