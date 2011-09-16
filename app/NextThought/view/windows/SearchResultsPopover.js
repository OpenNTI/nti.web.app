Ext.define('NextThought.view.windows.SearchResultsPopover', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.search-results-popover',

    autoScroll: true,
    floating: true,
    closable: false,
    border: true,
    minWidth: 400,
    padding: 3,
    renderTo: Ext.getBody(),
    defaults: {
        border: false,
        defaults: {border: false}
    },

    initComponent: function(config) {
        var me = this,
            field = me.bindTo;

        //values that change should not be defined on the prototype/class, but the instance.
        Ext.apply(me,{
            itemSelected: -1,
            _searchVal: null,
            _filledBoxes: {},
            width: Ext.Number.constrain(field.getWidth(), me.minWidth, me.maxWidth),
            height: 50
        });

        me.addEvents('goto');
        me.callParent(arguments);

        me.updateWithContentHits = Ext.bind(me.updateContents, me, [0], true);
        me.updateWithUserGenHits = Ext.bind(me.updateContents, me, [1], true);
    },

    reset: function(){
        this.removeAll();
        this.add(
            {hidden: true, title: 'Content'},
            {hidden: true, title: 'User Generated'},
            {hidden: true, html: '<b>No search results</b>', border: false, margin: 10}
        );
    },

    performSearch: function(searchValue) {
        this.reset();
        this._searchVal = searchValue;
        this._updateCount = 2;
        UserDataLoader.searchContent(null, searchValue, this.updateWithContentHits);
        UserDataLoader.searchUserData(null, searchValue, this.updateWithUserGenHits);
    },

    render: function() {
        this.callParent(arguments);

        var me = this,
            el = me.el,
            lastLogin = _AppConfig.server.userObject.get('lastLoginTime');
        me.alignTo(me.bindTo);

        el.mask("Searching");
    },

    chooseSelection: function() {
        var p = this.query('panel[hit]'),
            i = p[this.itemSelected],
            h = i? i.hit : null;

        if(i)
            this.searchResultClicked(null, null, {hit: h, searchValue: this._searchVal});
    },


    scroll: function(p) {
        p.el.scrollIntoView(this.el.first(), false);
    },

    select: function(up) {
        var p = this.query('panel[hit]'),
            i = p[this.itemSelected],
            CLASS = 'search-result-selection';

        //remove current selection
        if (i) i.removeCls(CLASS);

        //increment to next
        this.itemSelected += (up) ? -1 : 1;
        i = p[this.itemSelected];

        //if next is off the edge, wrap
        if (!i) {
            this.itemSelected = (up) ? p.length-1 : 0;
            i = p[this.itemSelected];
        }

        if(i){
            this.scroll(i.addCls(CLASS));
        }
    },

    updateContents: function(hits, panelIndex) {
        if(!this){
            console.log('"this" has been deleted');
            return;
        }

        var p = this.items.get(panelIndex);
        if(hits && hits.length > 0) {
            p.show();
            this._filledBoxes[panelIndex] = true;
            Ext.each( hits,
                function(h){
                    var s = h.get('Snippet')    || 'blank snippet',
                        t = h.get('Title')      || 'User Generated Content',
                        content,
                        el;

                    content = p.add({html: '<b>'+t+'</b>'+' - '+s, border: false, padding: 10, hit: h});

                    el = content.getEl();
                    el.on('click', this.searchResultClicked, this, {hit: h});
                    el.on('mouseover', this.highlightItem, this, {cmp: content});
                },
                this
            );
        }

        this.afterUpdate();
    },

    afterUpdate: function() {
        var fb = this._filledBoxes;
        this._updateCount--;
        if (this._updateCount <= 0){
            this.fixHeight();

            this.el.unmask();
            if(!fb[0] && !fb[1])
                this.items.get(2).show();


        }
    },


    fixHeight: function(){
        try{
            var me = this,
                e = me.bindTo,
                max = (VIEWPORT.getHeight() - e.getPosition()[1] - e.getHeight() - 10);
            me.height = undefined;
            me.doLayout();
            if(me.getHeight()> max)
                me.setHeight(max);

            //console.log(max, me.getHeight());
            VIEWPORT.on('resize',me.fixHeight,me, {single: true});
        }
        catch(err){
            if(me){
                console.log('error', err, err.message, err.stack);
            }
        }
    },


    highlightItem: function(event, dom, opts) {
        var p = this.query('panel[hit]'),
            c = opts.cmp,
            CLASS = 'search-result-selection';

        this.el.select('.'+CLASS).removeCls(CLASS);

        this.itemSelected = Ext.Array.indexOf(p,c);

        this.scroll(c.addCls(CLASS));
    },


    searchResultClicked: function(event, dom, opts) {
        var h = opts.hit,
            oid = h.get('TargetOID'),
            target = oid ? (h.get('Type').toLowerCase() + '-' + oid) : null;

        this.fireEvent('goto', h, this._searchVal, target);
        this.close();

    },

    doComponentLayout: function(w,h,s,c){
        this.callParent(arguments);

    }



});