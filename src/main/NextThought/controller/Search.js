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


	resolveTopContainer: function resolve(containerId, success, failure, oid){

		var service = $AppConfig.service,
			bookInfo = Library.findLocation(containerId);

		oid = oid || null;

		function step(container){
			oid = container.getId();
			return resolve(
					container.get('ContainerId'),
					success,
					failure,
					oid);
		}

		if(bookInfo){
			return Globals.callback(success,null,[bookInfo,oid]);
		}

		service.getObject(containerId, step, failure);
	},


	searchResultClicked: function(hit, searchValue) {
		var me = this,
			oid = hit.get('TargetOID'),
			containerId = hit.get('ContainerId');

		function success(bookInfo,newOid) {
			Ext.getBody().unmask();
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
					oid: newOid || oid
				});

			if(popover && popover.isVisible()){
				popover.startClose();
			}
		}

		function failure(){
			Ext.getBody().unmask();
			alert("Ooops","Me no say");
		}

		Ext.getBody().mask("Loading...");
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
			popover.reset();
			popover.close();
		}

		this.getViewport().fireEvent('cleared-search');
	},

	search: function(field) {
		var popover = this.getSearchPopover() || Ext.create('widget.search-results-popover',{bindTo: field});

		popover.performSearch(field.getValue());
		popover.show();
	}

});
