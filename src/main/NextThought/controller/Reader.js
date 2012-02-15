Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.IdCache',
		'NextThought.providers.Location'
	],

	models: [
		'Page'
	],

	stores: [
		'Page',
		'PageItem'
	],

	views: [
		'modes.Container',
		'modes.Reader',
		'content.Reader',
		'widgets.Breadcrumb',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.Tracker'
	],

	refs: [
		{ ref: 'viewport', selector: 'master-view' },
		{ ref: 'reader', selector: 'reader-panel' },
		{ ref: 'readerBreadcrumb', selector: 'reader-mode-container breadcrumbbar' },
		{ ref: 'readerPeople', selector: 'reader-mode-container people-list' },
		{ ref: 'readerRelated', selector: 'reader-mode-container related-items' },
		{ ref: 'readerMode', selector: 'reader-mode-container' }
	],

	init: function() {
		this.pageStores = {};

		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'breadcrumbbar *[ntiid]' : {
				'click' : this.buttonClicked
			},

			'reader-panel':{
				'annotations-load': this.onAnnotationsLoad
			},

			'reader-mode-container': {
				'mode-activated': this.restoreState
			},

			'reader-mode-container filter-control':{
				'filter-changed': this.readerFilterChanged
			}
		},{});
	},

	onSessionReady: function(){
		var app = this.application,
			store = this.getPageStore(),
			token = {};

		app.registerInitializeTask(token);
		store.on('load', function(s){ app.finishInitializeTask(token); }, this, {single: true});
		store.load();
	},

	onAnnotationsLoad: function(containerId, callback) {
		var ps = this.getStoreForPageItems(containerId);

		if( ps ) {
			ps.onAnnotationsLoadCallback = callback;
			ps.load();
		}
		else {
			Globals.callback(callback);
		}

		//When the reader changes, we need to tell the stream controller so he knows to
		//update his data
		this.getController('Stream').containerIdChanged(containerId);
	},


	getStoreForPageItems: function(containerId){
		var store = this.getPageStore(),
			page = store.getById(containerId),
			link = page ? page.getLink(USER_GENERATED_DATA) : null,
			ps = this.pageStores[containerId];

		if(!link) {
			return null;
		}

		if(!ps){
			ps = Ext.create(
				'NextThought.store.PageItem',
				{ storeId:'page-store:'+containerId }
			);

			ps.on('load', this.onAnnotationStoreLoadComplete, this);

			this.pageStores[containerId] = ps;
		}
		ps.proxy.url = link;
		return ps;
	},


	onAnnotationStoreLoadComplete: function(store){
		var reader = this.getReader(),
			containerId = reader.getContainerId();

		if(store.storeId === ('page-store:'+containerId)){
			reader.objectsLoaded(store.getBins(), store.onAnnotationsLoadCallback);
		}
	},


	onRemoveAnnotation: function(oid, containerId){
		function clean(){
			var o = ps.getById(oid);
			if(o) {
				o.destroy({});
			}
			me.getReader().removeAnnotation(oid);
		}

		var me=this,
			ps = this.getStoreForPageItems(containerId);
		if(!ps) {
			return;
		}

		if(ps.isLoading() || ps.getCount()===0){
			ps.on('load', clean, this, {single: true});
			ps.load();
		}
		else {
			clean();
		}
	},


	clearSearch: function() {
		this.getReader().clearSearchRanges();
	},

	restoreState: function() {
		this.getReaderMode().restoreReader();

		var sc = this.getController('State');
		if(NextThought.isInitialised) {
			this.getReader().restore(sc.getState());
		}
	},

	navigateToItem: function(i) {
		var c = i.get('Class'),
				containerId;

		//right now, only handle notes and highlights, not sure what to do with users etc...
		if (c !== 'Note' && c !== 'Highlight') {
			return;
		}

		containerId = i.get('ContainerId');
		LocationProvider.setLocation(containerId, function(scrollableHighlightableAPI){
			var id = IdCache.getComponentId(i);
			//scoll to
		});
	},

	buttonClicked: function(button) {
		if(button) {
			LocationProvider.setLocation(button.ntiid);
		}
	},


	getElementsByTagNames: function(list,obj) {
		if (!obj) {
			obj = document;
		}

		var tagNames = list.split(','),
			resultArray = [],
			i=0, tags, j, testNode;

		for (;i<tagNames.length;i++) {
			tags = obj.getElementsByTagName(tagNames[i]);
			for (j=0;j<tags.length;j++) {
				resultArray.push(tags[j]);
			}
		}

		testNode = resultArray[0];
		if (!testNode) {
			return [];
		}
		if (testNode.sourceIndex) {
			resultArray.sort(function (a,b) {
				return a.sourceIndex - b.sourceIndex;
			});
		}
		else if (testNode.compareDocumentPosition) {
			resultArray.sort(function (a,b) {
				return 3 - (a.compareDocumentPosition(b) & 6);
			});
		}
		return resultArray;
	},

	scrollToText: function(text, oid) {
		if (oid && !text) {
			this.getReader().scrollToId(IdCache.getComponentId(oid));
			return;
		}
		else if (!text) {
			return;
		}

		text = text.toLowerCase();

		var me = this,
			textElements = me.getElementsByTagNames('p,div,blockquote,ul,li,ol', me.getReader().getEl().dom),
			ranges = [],
			created = {},
			textLength = text.length;

		Ext.Object.each(textElements, function(e, c){
			var i = c.innerText,
				index, node, texts, nv, r,
				regex = new RegExp(Ext.String.escapeRegex(text), 'i');

			//if it's not here, move to the next block
			if (!i.match(regex)) {
				return;
			}

			texts = document.evaluate('.//text()', c,
					null, XPathResult.ORDERED_NODE_ITERATOR_TYPE,
					null);

			while(!!(node = texts.iterateNext())){
				nv = node.nodeValue.toLowerCase();

				index = nv.indexOf(text);
				while(index >= 0) {
					r = document.createRange();
					r.setStart(node, index);
					r.setEnd(node, index + textLength);


					if (!created[nv] || !created[nv][index]) {
						created[nv] = created[nv] || {} ;
						created[nv][index] = true;
						ranges.push(r);
					}
					index = nv.indexOf(text, index + 1);
				}
			}
		});

		me.getReader().showRanges(ranges);
		if (oid) {
			me.getReader().scrollToId(IdCache.getComponentId(oid));
		}
		else {
			me.getReader().scrollTo(ranges[0].getClientRects()[0].top - 150);
		}
	},


	readerFilterChanged: function(newFilter){
		var o = [
			this.getReader(),
			this.getReaderPeople(),
			this.getReaderRelated()
			//	this.getReaderStream()
		];

		Ext.each(o,function(i){i.applyFilter(newFilter);});
	}
});
