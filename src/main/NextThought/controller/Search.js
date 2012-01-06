

Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	models: [
		'Hit',
		'UserSearch'
	],

	stores: [
		'UserSearch'
	],

	views: [
		'Viewport',
		'windows.SearchResultsPopover'
	],

	refs: [
		{
			ref: 'searchPopover',
			selector: 'search-results-popover'
		},
		{
			ref: 'viewport',
			selector: 'master-view'
		}
	],

	init: function() {
		this.control({
			'#searchBox': {
				'blur': this.lostFocus,
				'search': this.search,
				'cleared-search': this.clearSearch,
				'select-down' : this.selectDown,
				'select-up' : this.selectUp,
				'choose-selection': this.chooseSelection
			},
			'search-results-popover': {
				'goto': this.searchResultClicked
			}
		},{});
	},

	lostFocus: function(searchBox){
		var popover = this.getSearchPopover();
		if(popover && popover.isVisible()){
			popover.startClose();

		}
	},

	searchResultClicked: function(hit, searchValue) {
		var oid = hit.get('TargetOID'),
			popover = this.getSearchPopover(),
			target = oid ? (hit.get('Type').toLowerCase() + '-' + oid) : null,
			containerId = hit.get('ContainerId'),
			bookInfo = Library.findLocation(containerId),
			book = bookInfo.book,
			href = bookInfo.location.getAttribute('href');

		this.getViewport().fireEvent('navigate', book, book.get('root') + href, {text: searchValue, oid: oid});
		if(popover && popover.isVisible()){
			popover.startClose();
		}
	},

	selectDown: function(field) {
		var popover = this.getSearchPopover();
		if(popover && popover.isVisible()){
			popover.select(false);
		}
		else{
			this.search(field);
		}
	},

	selectUp: function() {
		var popover = this.getSearchPopover();
		if(popover) popover.select(true);
	},

	chooseSelection: function() {
		var popover = this.getSearchPopover();

		if(popover && popover.isVisible()) popover.chooseSelection();
	},

	clearSearch: function(){
		var popover = this.getSearchPopover();

		if(popover){
			popover.close().reset();
		}

		this.getViewport().fireEvent('cleared-search');
	},

	search: function(field) {
		var popover = this.getSearchPopover() || Ext.create('widget.search-results-popover',{bindTo: field});

		popover.performSearch(field.getValue());
		popover.show();
	}

});
