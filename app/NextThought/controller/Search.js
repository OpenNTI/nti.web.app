

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

    searchResultClicked: function(hit, searchValue) {
        var containerId = hit.get('ContainerId'),
            bookInfo = NextThought.librarySource.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');

        this.getViewport().fireEvent('navigate', book, book.root + href, {text: searchValue});
    },

    selectDown: function() {
        var popover = this.getSearchPopover();
        if(popover){
            popover.select(false);
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
        var searchVal = field.getSubmitValue();

        var popover = this.getSearchPopover() || Ext.create('widget.search-results-popover');

        popover.alignTo(field);
        popover.performSearch(searchVal);
        popover.show();
    }

});