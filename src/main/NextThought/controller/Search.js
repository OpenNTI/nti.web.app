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


	resolveTopContainer: function(containerId, success, failure){

		var service = _AppConfig.service,
			bookInfo = Library.findLocation(containerId);

		function s(container){
			var cid = container.get('ContainerId');

			bookInfo = Library.findLocation(cid);
			if(bookInfo){
				return Globals.callback(success,null,[bookInfo]);
			}

			return this.resolveTopContainer(cid, success, failure);
		}

		if(bookInfo){
			return Globals.callback(success,null,[bookInfo]);
		}

		service.getObject(containerId, s, failure);
	},


	searchResultClicked: function(hit, searchValue) {
		var me = this,
			oid = hit.get('TargetOID'),
			containerId = hit.get('ContainerId');

		function success(bookInfo) {
			if(!bookInfo){
				alert("bad things");
				return;
			}

			var book = bookInfo.book,
				href = bookInfo.location.getAttribute('href'),
				popover = me.getSearchPopover();

			me.getViewport().fireEvent(
				'navigate',
				book,
				book.get('root') + href,
				{
					text: searchValue,
					oid: oid
				});

			if(popover && popover.isVisible()){
				popover.startClose();
			}
		}

		function failure(){
			alert("Ooops","Me no say");
		}

		me.resolveTopContainer(containerId, success, failure);
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
		if(popover) {
			popover.select(true);
		}
	},

	chooseSelection: function() {
		var popover = this.getSearchPopover();

		if(popover && popover.isVisible()) {
			popover.chooseSelection();
		}
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
