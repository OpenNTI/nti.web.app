var Ext = require('extjs');
var UxFilterMenuItem = require('./FilterMenuItem');
var UxSearchItem = require('./SearchItem');


module.exports = exports = Ext.define('NextThought.common.ux.FilterMenu', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.filter-menupanel',
    ui: 'nt',
    plain: true,
    showSeparator: false,
    shadow: false,
    frame: false,
    cls: 'no-checkboxes no-footer blue-menu-items filter-search',
    hideMode: 'display',
    autoHide: false,

    defaults: {
		ui: 'nt',
		xtype: 'filter-menu-item',
		group: 'main-filter-group',
		plain: true
	},

    searchPlaceHolderText: 'Search',

    filters: [
		//{ text: 'All Students', filter: '*'},
		//{ text: 'Enrolled Students', filter: 'ForCredit'},
		//{ text: 'Open Students', filter: 'Open'}
	],

    initComponent: function() {
		this.callParent(arguments);
		if (!Ext.isArray(this.filters)) {
			console.warn('Need an array of filter menu item configs... blanking out filters list');
			this.filters = [];
		}

		this.add([].concat(
				{ xtype: 'label', text: 'Display' },
				this.filters,
				{ xtype: 'search-menu-item', placeholder: this.searchPlaceHolderText }
		));

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
		var item = this.down('[filter="' + filter + '"]') || this.down('[filter]');

		if (item) {
			if (!item.setChecked) {
				console.error('Got item with no setChecked:', item);
			} else {
				item.setChecked(true, true);
			}
		}

		this.search.setValue(search || '');
	},

    setSearch: function(search) {
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
		var search = this.search && this.search.getValue(),
			item = this.down('menuitem[checked]') || {text: ''},
			prefix = item.text;

		if (search) {
			prefix = Ext.String.format('Search {1}: {0}', search, prefix);
		}

		return Ext.String.format('{0} ({1})', prefix, count || item.count || 0);
	}
});
