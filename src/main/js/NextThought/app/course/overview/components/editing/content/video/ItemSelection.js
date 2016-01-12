Ext.define('NextThought.app.course.overview.components.editing.content.video.ItemSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-video-item-selection',

	multiSelect: true,

	cls: 'video-item-selection item-selection',


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'label', cls: 'video-item', cn: [
			{tag: 'input', type: 'checkbox'},
			{cls: 'thumbnail', style: {backgroundImage: 'url({thumbnail})'}},
			{cls: 'title', html: '{title}'},
			{cls: 'providers', cn: [
				{tag: 'tpl', 'for': 'providers', cn: [
					{tag: 'span', cls: 'provider', html: '{label}'}
				]}
			]}
		]
	})),


	getItemData: function(item) {
		return item.resolveThumbnail()
			.then(function(thumbnail) {
				var sources = item.get('sources');

				return {
					thumbnail: thumbnail,
					title: item.get('title'),
					providers: sources.map(function(source) { return {label: source.service}; })
				};
			});
	},


	itemMatchesSearch: function(item, searchTerm) {},


	onSelectItem: function(el) {
		var	input = el && el.querySelector('input[type=checkbox]');

		if (input) {
			input.checked = true;
		}

		if (el) {
			el.classList.add('selected');
		}
	},


	onUnselectItem: function(el) {
		var input = el && el.querySelector('input[type=checkbox]');

		if (input) {
			input.checked = false;
		}

		if (el) {
			el.classList.remove('selected');
		}
	}
});
