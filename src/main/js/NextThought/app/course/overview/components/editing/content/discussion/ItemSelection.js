Ext.define('NextThought.app.course.overview.components.editing.content.discussion.ItemSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-discussion-item-selection',

	multiSelect: false,

	cls: 'video-item-selection item-selection',


	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'label', cls: 'video-item', cn: [
			{tag: 'input', type: 'checkbox'},
			{cls: 'thumbnail', style: {backgroundImage: 'url({thumbnail})'}},
			{cls: 'title', html: '{title}'}
		]
	})),


	getItemData: function(item) {
		return {
			thumbnail: this.getThumbnail(item),
			title: item.get('title')
		};
	},


	getThumbnail: function(item){
		var url = (this.basePath || '') + item.get('icon');
		return getURL(url);
	},


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
	},

	itemMatchesSearch: function(item, searchTerm) {
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
	}
});
