const Ext = require('@nti/extjs');

require('../../itemselection/Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.questionset.AssignmentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-assignment-selection',

	cls: 'assignment-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'assignment-item {cls}', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'due-date', html: '{status}'}
		]}
	)),


	getItemData: function (item) {
		let now = new Date();
		let dueDate = item.getDueDate();
		let available = item.get('availableBeginning');
		let status = 'No Dates Set';

		if (dueDate) {
			status = `Due ${Ext.Date.format(dueDate, 'l, F j, g:i a T')}`;
		} else if (available) {
			status = `Available ${Ext.Date.format(available, 'l, F j, g:i a T')}`;
		}

		return {
			cls: !dueDate || now < dueDate ? 'ontime' : 'overdue',
			title: item.get('title'),
			status: status
		};
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
