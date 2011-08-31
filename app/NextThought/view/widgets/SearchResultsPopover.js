Ext.define('NextThought.view.widgets.SearchResultsPopover', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.search-results-popover',

    autoScroll: true,
    floating: true,
    closable: true,
    border: true,
    width: 400,
    height: 250,
    items: [{margin: 3}],
    renderTo: Ext.getBody(),
    defaults: {border: false,
              defaults: {border: false}},
    _searchVal: null,

    initComponent: function() {
        this.addEvents('goto');

        this.callParent(arguments);
        this.updateContents = Ext.bind(this.updateContents, this);
    },

    performSearch: function(searchValue) {
        this.items.get(0).removeAll();
        this._searchVal = searchValue;
        UserDataLoader.search(null, searchValue, this.updateContents);
    },

    render: function() {
       this.callParent(arguments);

       var me = this,
           u = _AppConfig.server.userObject,
           lastLogin = u.get('lastLoginTime'),
           height = Ext.ComponentQuery.query('master-view')[0].getHeight();

        this.el.mask("Searching");
    },


    updateContents: function(hits) {
        var k, h,
            p = this.items.get(0);

     	if(!hits) {
            this.el.unmask();
            return;
        }

		for(k in hits){
            if(!hits.hasOwnProperty(k))continue;
            h = hits[k];

			var s = h.get('Snippet'),
                t = h.get('Title'),
                ty = h.get('Type');

            var content = Ext.create('Ext.panel.Panel',
                {html: '<b>' + t + '</b>' +
                       ' - ' + s,
                 border: false,
                 margin: 10});

            p.add(content);

            //wait till it's added to access el
            content.getEl().on('click', this.searchResultClicked, this, {hit: h, searchValue: this._searchVal});
		}

        this.el.unmask();
    },

    searchResultClicked: function(event, dom, opts) {
        this.fireEvent('goto', opts.hit, opts.searchValue);
        this.close();

    },

    alignTo: function() {
        this.callParent(arguments);

         var me = this,
             height = Ext.ComponentQuery.query('master-view')[0].getHeight();

        me.setHeight(height - me.getPosition(true)[1] - 10);

    }



});