Ext.define('NextThought.view.windows.SearchResultsPopover', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.search-results-popover',

    autoScroll: true,
    floating: true,
    closable: false,
    border: true,
    width: 400,
    height: 250,
    padding: 3,
    renderTo: Ext.getBody(),
    defaults: {
        border: false,
        defaults: {border: false}
    },

    initComponent: function() {
        //values that change should not be defined on the prototype/class, but the instance.
        Ext.apply(this,{
            itemSelected: -1,
            noResults: false,
            _searchVal: null,
            _hits: []
        });

        this.addEvents('goto');

        this.callParent(arguments);
        this.updateContents = Ext.bind(this.updateContents, this);
    },

    performSearch: function(searchValue) {
        this.removeAll();
        this._searchVal = searchValue;
        UserDataLoader.searchContent(null, searchValue, this.updateContents);
        UserDataLoader.searchUserData(null, searchValue, this.updateContents);
    },

    render: function() {
       this.callParent(arguments);

       var me = this,
           lastLogin = _AppConfig.server.userObject.get('lastLoginTime'),
           height = VIEWPORT.getHeight();

        this.el.mask("Searching");
    },

    chooseSelection: function() {
         if (this.noResults) return;

         var p = this,
             i = p.items.get(this.itemSelected),
             h = this._hits[this.itemSelected];

        this.searchResultClicked(null, null, {hit: h, searchValue: this._searchVal});
    },


    scroll: function(p) {
        p.el.scrollIntoView(this.el.first(), false);
    },

    select: function(up) {
        if (this.noResults) return;

        var p = this,
            i = p.items.get(this.itemSelected),
            CLASS = 'search-result-selection';

        //remove current selection
        if (i) i.removeCls(CLASS);

        //increment to next
        this.itemSelected += (up) ? -1 : 1;
        i = p.items.get(this.itemSelected);

        //if next is off the edge, wrap
        if (!i) {
            this.itemSelected = (up) ? p.items.length-1 : 0;
            i = p.items.get(this.itemSelected);
        }

        i.addCls(CLASS);
        this.scroll(i);
    },

    updateContents: function(hits) {
        var k, h,
            p = this;

        //save hits
        this._hits = Ext.Array.merge(this._hits, hits);

        //reset no results flag
        this.noResults = false;

     	if(!hits || hits.length == 0) {
             p.add({html: '<b>No search results</b>', border: false, margin: 10});
             this.el.unmask();
             this.noResults = true;
             return;
         }

        for(k in hits){
            if(!hits.hasOwnProperty(k))continue;
            h = hits[k];

			var s = h.get('Snippet'),
                t = h.get('Title') || 'User Generated Content',
                ty = h.get('Type'),
                oid = h.get('TargetOID'),
                target = ty.toLowerCase() + '-' + oid,
                opts = {hit: h, searchValue: this._searchVal, oid: oid ? target : null},
                content,
                el;

            content = p.add({html: '<b>'+t+'</b>'+' - '+s, border: false, padding: 10});

            el = content.getEl();
            el.on('click', this.searchResultClicked, this, opts);
            el.on('mouseover', this.highlightItem, this, {cmp: content});
		}

        this.el.unmask();
    },

    highlightItem: function(event, dom, opts) {
        if (this.noResults) return;

        var p = this.items,
            CLASS = 'search-result-selection';

        //remove all highlighting from other classes, add highlighting to the selected, reset index
        Ext.each(p.items, function(c, i){
            if (c == opts.cmp) {
                c.addCls(CLASS);
                this.itemSelected = i;
                this.scroll(c);
            }
            else c.removeCls(CLASS);
        }, this);



    },
    searchResultClicked: function(event, dom, opts) {
        this.fireEvent('goto', opts.hit, opts.searchValue, opts.oid);
        this.close();

    },

    alignTo: function() {
        this.callParent(arguments);

         var me = this,
             height = VIEWPORT.getHeight();

        me.setHeight(height - me.getPosition(true)[1] - 10);

    }



});