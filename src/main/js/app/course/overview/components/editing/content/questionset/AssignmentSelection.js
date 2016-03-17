export default Ext.define('NextThought.app.course.overview.components.editing.content.questionset.AssignmentSelection', {
	extend: 'NextThought.app.course.overview.components.editing.itemselection.Index',
	alias: 'widget.overview-editing-assignment-selection',

	cls: 'assignment-item-selection item-selection',

	itemTpl: new Ext.XTemplate(Ext.DomHelper.markup(
		{cls: 'assignment-item {cls}', cn: [
			{cls: 'title', html: '{title}'},
			{cls: 'due-date', html: 'Due {dueDate}'}
		]}
	)),


	getItemData: function(item) {
		var now = new Date(),
			dueDate = item.getDueDate();

		return {
			cls: now < dueDate ? 'ontime' : 'overdue',
			title: item.get('title'),
			dueDate: Ext.Date.format(dueDate, 'l, F j, g:i a T')
		};
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
	},


	onSelectItem: function(el) {
		if (el) {
			el.classList.add('selected');
		}
	},


	onUnselectItem: function(el) {
		if (el) {
			el.classList.remove('selected');
		}
	}
});
