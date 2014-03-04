Ext.define('NextThought.view.courseware.assessment.assignments.admin.FilterMenu', {
	extend: 'Ext.menu.Menu',
	alias: [
		'widget.course-assessment-admin-assignments-item-filter',
		'widget.test-filter'
	],

	requires: [
		'NextThought.view.courseware.assessment.assignments.admin.FilterMenuItem',
		'NextThought.view.menus.SearchItem'
	],

	ui: 'nt',
	plain: true,
	showSeparator: false,
	shadow: false,
	frame: false,
	cls: 'no-checkboxes no-footer blue-menu-items student-filter-search',
	hideMode: 'display',
	autoHide: false,


	defaults: {
		ui: 'nt',
		xtype: 'student-admin-filter-menu-item',
		group: 'student-filter',
		plain: true
	},


	items: [
		{ xtype: 'label', text: 'Display' },
		{ text: 'Enrolled Students', filter: 'ForCredit'},
		{ text: 'Open Students', filter: 'Open'},
		{
			xtype: 'search-menu-item',
			placeholder: 'Search Students'
		}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.search = this.down('search-menu-item');
		this.search.enableBubble('commit', 'changed');

		this.on({
			buffer: 10,
			commit: 'onSearch',
			changed: 'onSearch',
			checkchange: 'onFilter'
		});

		this.on({commit: 'hide'});
	},


	setState: function(filter, search) {
		var item = this.down('[filter="' + filter + '"]') || this.down('menuitem');

		if (item) {
			item.setChecked(true, true);
		}

		this.search.setValue(search || '');
	},


	onSearch: function(searchTerm) {
		console.log('Search:', searchTerm);
		this.fireEvent('search', searchTerm);
	},


	onFilter: function(item, state) {
		if (!state) {
			return;
		}
		console.log('Refilter:', item.filter);
		this.fireEvent('filter', item.filter);
	},


	getFilterLabel: function(count) {
		var search = this.search.getValue(),
			item = this.down('menuitem[checked]') || {text: '???'},
			prefix = item.text;

		if (search) {
			prefix = Ext.String.format('Search {1}: {0}', search, prefix);
		}

		return Ext.String.format('{0} ({1})', prefix, count);
	}
});
