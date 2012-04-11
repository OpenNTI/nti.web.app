Ext.define('NextThought.view.windows.SearchResultsPopover', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.search-results-popover',
	requires: [
		'NextThought.proxy.Search'
	],

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
	items: [
		{hidden: true, title: 'Content'},
		{hidden: true, title: 'User Generated'},
		{hidden: true, html: '<b>No search results</b>', border: false, margin: 10}
	],

	initComponent: function(config) {
		var me = this,
			s = $AppConfig.service;

		//values that change should not be defined on the prototype/class, but the instance.
		Ext.apply(me,{
			itemSelected: null,
			searchVal: null,
			filledBoxes: {},
			width: me.minWidth,
			height: 50
		});

		me.addEvents('goto');
		me.callParent(arguments);

		var loc = Library.findLocation(LocationProvider.currentNTIID),
			searchRoot = (loc && loc.title) ? loc.title.get('root') : null,
			url = searchRoot ? $AppConfig.server.host + searchRoot + 'Search/' : null;

		console.log('searching url' + url, loc);
		//NOTE: null url for content search means just search user generated data.

		me.stores = [
			me.getStoreFor(
				url,
				Ext.bind(me.updateContents, me, [0], true)),

			me.getStoreFor(
				s.getUserDataSearchURL(),
				Ext.bind(me.updateContents, me, [1], true))
		];

	},


	afterRender: function(){
		this.callParent(arguments);
		this.el.on('mouseover', this.stopClose, this);
		this.el.on('mouseout', this.startClose, this);
	},


	hide: function(){
		this.stopClose();
		this.callParent(arguments);
	},


	stopClose: function(){
		clearTimeout(this.closeTimeout);
	},


	startClose: function(){
		var me = this;
		me.stopClose();
		me.closeTimeout = setTimeout(function(){ me.close(); },1000);
	},


	getStoreFor: function(url, onLoad){
		return Ext.create('Ext.data.Store', {
			autoLoad: false,
			remoteFilter: true,
			model: 'NextThought.model.Hit',
			proxy: { url: url, type: 'search', reader: 'nti' },
			listeners: { scope: this, load: onLoad }
		});
	},



	destroy: function(){
		delete this.stores;
		Ext.EventManager.removeResizeListener(this.fixHeight,this);
		this.callParent(arguments);
	},


	reset: function(){
		var i = this.items,
			a = i.get(0),
			b = i.get(1);
		this.filledBoxes = {};

		this.itemSelected = null;

		a.removeAll(true);
		b.removeAll(true);
		i.each(function(o){o.hide();}, this);
	},

	performSearch: function(value) {
		var token = {};
		this.reset();
		this.searchVal = value;
		this.searchToken = token;
		this.updateCount = 2;
		Ext.each(this.stores, function(s){
			s.filters.clear();
			s.filter('search',value);
			s.searchToken = token;
		});
	},

	show: function() {
		this.stopClose();
		this.callParent(arguments);
		this.handleResize();

		if( this.searchBox ){
			this.searchBox.destroy();
			delete this.searchBox;
		}
		this.searchBox = this.add({html:'Searching...'});
	},


	chooseSelection: function() {
		var i = this.itemSelected,
			h = i? i.hit : null;

		if(i) {
			this.searchResultClicked(null, null, {hit: h, searchValue: this.searchVal});
		}
	},


	scroll: function(p) {
		p.el.scrollIntoView(this.el.first(), false);
	},

	select: function(up) {
		var me = this,
			q = 'panel[hit]',
			i = me.itemSelected,
			CLASS = 'search-result-selection';

		function last(cmp) {

			var step = cmp? function(i){ return i.next(q);} : function(i){ return next(i);},
				f = first(), c = cmp || f, n;

			while((n = step(c)) !== f && n !== null) { c = n; }
			return c;
		}

		function first(){
			return me.down(q);
		}

		function next(cmp) {
			if(!cmp) {return first();}
			var x = cmp.nextSibling(q),
				s;
			if (!x) {
				s = cmp.up('panel').nextSibling('panel[title]');
				x = s ? s.down(q) : first();
			}
			return x;
		}

		function prev(cmp) {
			if(!cmp) {return last();}
			var x = cmp.previousSibling(q),
				s;
			if (!x) {
				s = cmp.up('panel').previousSibling('panel[title]');
				x = s ? last(s.down(q)) : last();
			}
			return x;
		}

		//remove current selection
		if (i) {i.removeCls(CLASS);}

		//increment to next
		i = me.itemSelected = (up) ? prev(i) : next(i);

		if(i){
			me.scroll(i.addCls(CLASS));
		}
	},

	updateContents: function(store, hits, success, opts, panelIndex) {

		if(store.searchToken !== this.searchToken){
			console.log('previous search completed after another already started');
			return;
		}

		if(!this){
			console.debug('"this" has been deleted');
			return;
		}

		var p = this.items.get(panelIndex);
		if(hits && hits.length > 0) {
			p.show();
			this.filledBoxes[panelIndex] = true;
			Ext.each( hits,
				function(h){
					var s = h.get('Snippet')	|| '?blank snippet?',
						t = h.get('Title')	  || h.get('Type') || 'User Generated Content',
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
		var fb = this.filledBoxes;
		this.updateCount--;
		if (this.updateCount <= 0){
			this.handleResize();

			if( this.searchBox ){
				this.searchBox.destroy();
				delete this.searchBox;
			}
			if(!fb[0] && !fb[1]){
				this.items.get(2).show();
			}
		}
	},


	handleResize: function(){
		var me = this, e, max;
		try{
			if (me.el && !me.isDestroyed){
				e = me.bindTo;
				max = (Ext.getBody().getHeight() - e.getPosition()[1] - e.getHeight() - 10);
				me.height = undefined;

				me.setWidth(Ext.Number.constrain(e.getWidth(), me.minWidth, me.maxWidth));

				me.doLayout();
				if(me.getHeight()> max) {me.setHeight(max);}

				me.alignTo(e);

				Ext.EventManager.onWindowResize(me.fixHeight,me, {single: true});
			}
		}
		catch(err){
			if(me){
				console.error('Search Popover', err, err.message, err.stack);
			}
		}
	},


	highlightItem: function(event, dom, opts) {
		var p = this.query('panel[hit]'),
			c = opts.cmp,
			CLASS = 'search-result-selection';

		this.el.select('.'+CLASS).removeCls(CLASS);
		this.itemSelected = c;
		this.scroll(c.addCls(CLASS));
	},


	searchResultClicked: function(event, dom, opts) {
		this.fireEvent('goto', opts.hit, this.searchVal);
	}
});
