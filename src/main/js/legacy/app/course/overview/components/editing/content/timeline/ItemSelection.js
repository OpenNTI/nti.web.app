var Ext = require('extjs');
var DiscussionItemSelection = require('../discussion/ItemSelection');
var ModelTimelineRef = require('../../../../../../../model/TimelineRef');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.timeline.ItemSelection', {
	extend: 'NextThought.app.course.overview.components.editing.content.discussion.ItemSelection',
	alias: 'widget.overview-editing-timeline-item-selection',
	multiSelect: false,
	cls: 'timeline-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{ cls: 'overview-timeline', cn: [
			{ tag: 'label', cls: 'timeline-item', cn: [
					{tag: 'input', type: 'checkbox'},
					{cls: 'thumbnail', style: {backgroundImage: 'url({thumbnail})'}},
				{cls: 'meta', cn: [
						{cls: 'title', html: '{title}'},
						{cls: 'description', html: '{description}'}
				]}
			]
			}
		]}
	)),

	getItemData: function (item) {
		return {
			thumbnail: this.getThumbnailURL(item),
			title: item.get('label'),
			description: item.get('description')
		};
	},

	showEmptyState: function () {
		// Display empty state
		this.itemsContainer.add({
			xtype: 'box',
			autoEl: {cls: 'empty', cn: [
				{cls: 'text', html: 'There are no timelines to pick from.'}
			]}
		});

		if (this.searchCmp) {
			this.searchCmp.hide();
		}
	}
});
