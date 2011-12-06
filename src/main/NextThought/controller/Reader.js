Ext.define('NextThought.controller.Reader', {
    extend: 'Ext.app.Controller',

    requires: [
        'NextThought.cache.IdCache'
    ],

    views: [
        'modes.Container',
        'modes.Reader',
        'content.Reader',
        'widgets.Breadcrumb',
        'widgets.PeopleList',
        'widgets.RelatedItemsList',
        'widgets.MiniStreamList',
        'widgets.Tracker'
    ],

    refs: [
        { ref: 'viewport', selector: 'master-view' },
        { ref: 'reader', selector: 'reader-panel' },
        { ref: 'readerBreadcrumb', selector: 'reader-mode-container breadcrumbbar' },
        { ref: 'readerPeople', selector: 'reader-mode-container people-list' },
        { ref: 'readerRelated', selector: 'reader-mode-container related-items' },
        { ref: 'readerStream', selector: 'reader-mode-container mini-stream' },

        { ref: 'readerMode', selector: 'reader-mode-container' }
    ],

    init: function() {
        this.control({
            'master-view':{
                'navigate': this.navigate,
                'stream-item-clicked': this.navigateToItem,
                'cleared-search': this.clearSearch
            },

            'breadcrumbbar':{
                'navigate': this.navigate
            },

            'breadcrumbbar *[location]' : {
                'click' : this.buttonClicked
            },

            'reader-panel':{
                'navigate': this.navigate,
                'location-changed': this.readerLocationChanged,
                'publish-contributors': this.readerPublishedContributors
            },

            'reader-mode-container related-items':{
                'navigate': this.navigate
            },
            
            'reader-mode-container': {
                'mode-activated': this.restoreState
            },

            'reader-mode-container filter-control':{
                'filter-changed': this.readerFilterChanged
            }
        },{});
    },

    clearSearch: function() {
        this.getReader().clearSearchRanges();
    },
    
    restoreState: function() {
        this.getReaderMode().restoreReader();

        var sc = this.getController('State');

        this.getReader().restore(sc.getState());
    },

    navigateToItem: function(i) {
        var c = i.get('Class'),
            id = IdCache.getComponentId(i);

        //right now, only handle notes and highlights, not sure what to do with users etc...
        if (c != 'Note' && c != 'Highlight') return;

        var containerId = i.get('ContainerId'),
            bookInfo = Library.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');
        this.navigate(book, book.get('root') + href, {oid: id});
    },

    buttonClicked: function(button) {
        if (!button || !button.book || !button.location) return;

        var skip = button.skipHistory,
            ntiid = button.ntiid;

        var book = button.book,
            loc = button.location;

        //TODO - we got the ntiid from the breadcrumbbar and need to pass it off so the reader goes where it ought to.
        this.navigate(book, loc, null, skip);
    },

    navigate: function(book, ref, options, skipHistory){
 //       this.getReaderMode().activate();
        this.getReader().setActive(book, ref, skipHistory,
            options
                ? typeof(options)=='function'
                    ? options
                    : Ext.bind(this.scrollToText, this, [options.text, options.oid])
                : undefined);
    },

    getElementsByTagNames: function(list,obj) {
        if (!obj) var obj = document;
        var tagNames = list.split(',');
        var resultArray = new Array();
        for (var i=0;i<tagNames.length;i++) {
            var tags = obj.getElementsByTagName(tagNames[i]);
            for (var j=0;j<tags.length;j++) {
                resultArray.push(tags[j]);
            }
        }
        var testNode = resultArray[0];
        if (!testNode) return [];
        if (testNode.sourceIndex) {
            resultArray.sort(function (a,b) {
                    return a.sourceIndex - b.sourceIndex;
            });
        }
        else if (testNode.compareDocumentPosition) {
            resultArray.sort(function (a,b) {
                    return 3 - (a.compareDocumentPosition(b) & 6);
        }
        return resultArray;
    },

    scrollToText: function(text, oid) {
        if (oid && !text) {
            this.getReader().scrollToId(oid);
            return;
        }
        else if (!text) return;

        text = text.toLowerCase();

        var me = this,
            textElements = me.getElementsByTagNames('p,div,blockquote,ul,li,ol', me.getReader().getEl().dom),
            ranges = [],
            created = {};


        for (var e in textElements)
        {
            var c = textElements[e],
                i = c.innerText,
                regex = new RegExp(Ext.String.escapeRegex(text), 'i'),
                index, node, texts;

            //if it's not here, move to the next block
            if (!i.match(regex)) continue;

            texts = document.evaluate('.//text()', c,
                            null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

            while(node = texts.iterateNext()){
                var nv = node.nodeValue.toLowerCase();

                index = nv.indexOf(text);
                while(index >= 0) {
                    var r = document.createRange();
                    r.setStart(node, index);
                    r.setEnd(node, index + text.length);


                    if (!created[nv] || !created[nv][index]) {
                        created[nv] = created[nv] || {} ;
                        created[nv][index] = true;
                        ranges.push(r)
                    }
                    index = nv.indexOf(text, index + 1);
                }
           }
        }

        setTimeout(function(){
            me.getReader().showRanges(ranges);
            if (oid)
                me.getReader().scrollToId(oid);
            else
                me.getReader().scrollTo(ranges[0].getClientRects()[0].top - 150);
        }, 500);
    },

    readerLocationChanged: function(id){
        this.getReaderStream().setContainer(id);
        this.getReaderRelated().setLocation(
            this.getReaderBreadcrumb().getLocation());
    },

    readerPublishedContributors: function(c){
        this.getReaderPeople().setContributors(c);
    },

    readerFilterChanged: function(newFilter){
        var o = [
            this.getReader(),
            this.getReaderPeople(),
            this.getReaderRelated(),
            this.getReaderStream()
        ];

        Ext.each(o,function(i){i.applyFilter(newFilter);});
    }
});
