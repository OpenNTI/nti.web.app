

Ext.define('NextThought.controller.Search', {
    extend: 'Ext.app.Controller',

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
        });
    },

    lostFocus: function(searchBox){
        var popover = this.getSearchPopover();
        if(popover) popover.close();
    },

    searchResultClicked: function(hit, searchValue, oid) {
        var containerId = hit.get('ContainerId'),
            bookInfo = NextThought.librarySource.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');
        this.getViewport().fireEvent('navigate', book, book.get('root') + href, {text: searchValue, oid: oid});
    },

    selectDown: function(field) {
        var popover = this.getSearchPopover();
        if(popover){
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

        if(popover) popover.chooseSelection();
    },

    clearSearch: function(){
        var popover = this.getSearchPopover();

        if(popover){
            popover.destroy();
        }

         this.getViewport().fireEvent('cleared-search');
    },

    search: function(field) {
        var popover = this.getSearchPopover() || Ext.create('widget.search-results-popover');

        popover.alignTo(field);
        //TODO: move this logic to this class
        popover.performSearch(field.getValue());
        popover.show();
    }

});