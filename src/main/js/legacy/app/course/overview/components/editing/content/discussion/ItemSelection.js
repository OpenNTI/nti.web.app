const Ext = require('extjs');

const Globals = require('legacy/util/Globals');
const DiscussionRef = require('legacy/model/DiscussionRef');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.discussion.ItemSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-discussion-item-selection',
	multiSelect: false,
	cls: 'discussion-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ cls: 'overview-discussion', cn: [
			{ tag: 'label', cls: 'discussion-item', cn: [
				{tag: 'input', type: 'checkbox'},
				{cls: 'thumbnail', style: {backgroundImage: 'url({thumbnail})'}},
				{cls: 'title', html: '{title}'}
			]
			}
		]}
	)),

	getItemData: function (item) {
		return {
			thumbnail: this.getThumbnailURL(item),
			title: item.get('title')
		};
	},

	getThumbnailURL: function (item) {
		var iconURL = item && item.get('icon');
		if (iconURL) {
			if (Globals.ROOT_URL_PATTERN.test(iconURL)) {
				return Globals.getURL(iconURL);
			}

			iconURL = (this.basePath || '') + iconURL;
			return Globals.getURL(iconURL);
		}

		return DiscussionRef.defaultIcon;
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

	showEmptyState: function () {
		// Display empty state
		this.itemsContainer.add({
			xtype: 'box',
			autoEl: {cls: 'empty', cn: [
				{cls: 'text', html: 'There are no discsussions to pick from.'}
			]}
		});

		if (this.searchCmp) {
			this.searchCmp.hide();
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
	}
});
