

Ext.define('NextThought.controller.Search', {
    extend: 'Ext.app.Controller',

	views: [
        'Viewport',
        'widgets.SearchResultsPopover'
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
                specialkey: this.search
            },
            'search-results-popover': {
                 'goto': this.searchResultClicked
            }
        });
    },

    searchResultClicked: function(hit) {
        var containerId = hit.get('ContainerId'),
            bookInfo = NextThought.librarySource.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');

        this.navigate(book, book.root + href);
    },

    navigate: function(book, ref) {
        this.getViewport().fireEvent('navigate', book, ref);
    },

    search: function(field, e) {
        if (e.getKey() != e.ENTER) return;

        var searchVal = field.getSubmitValue();

        var popover = this.getSearchPopover() || Ext.create('widget.search-results-popover');

        popover.alignTo(field);
        popover.performSearch(searchVal);
        popover.show();
    }

});