Ext.define('NextThought.controller.Search', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location',
		'NextThought.util.ViewUtils'
	],

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
		var me = this,
			service = $AppConfig.service,
			containerId = hit.get('ContainerId'),
			popover = me.getSearchPopover();

		function success(o) {

			function sc(a){
				//these have to be resolved after navigation
				var cid = hit.get('ContainerId'),
					id = IdCache.hasIdentifier(hit.getId())
							? IdCache.getComponentId(hit.getId(),null,'default')
							: IdCache.hasIdentifier(cid)
								? IdCache.getComponentId(cid,null,'default')
								: null;
				//there's no id, meaning it's probably not user generated
				if (!id) {
					setTimeout(function(){ a.scrollToText(searchValue); },500);
				}
				else {
					setTimeout(function(){ a.scrollToId(id); },500);
				}

			}

			var r = Ext.getCmp('reader');


			Ext.getBody().unmask();
			if(!o){
				alert("bad things");
				return;
			}

			r.activate();

			if(LocationProvider.currentNTIID !== o.NTIID){
				LocationProvider.setLocation(o.NTIID, sc);
			}
			else {
				sc(r.down('reader-panel'));
			}
		}

		function failure(){
			Ext.getBody().unmask();
			service.getObject(hit.getId(),
				function success(o){ ViewUtils.displayModel(o); },
				function fail(){
					console.error(
							'error resolving container ', Ext.encode(hit.data),
							'Error resolving object: ', arguments);
				},
				this);
		}

		Ext.getBody().mask("Loading...");
		service.resolveTopContainer(containerId, success, failure);
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
