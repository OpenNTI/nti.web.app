Ext.define('NextThought.controller.Library', {
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
		'Views',
		'views.Library',
		'content.Reader'
	],

	refs: [
		{ ref: 'readerMode', selector: 'library-view-container' }
	],

	init: function() {
		this.pageStores = {};

		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'reader-panel':{
				'annotations-load': this.onAnnotationsLoad
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

	onAnnotationsLoad: function(cmp, containerId, callback) {
		//clear the contributors for this page.  in case there are none.
		ContributorsProvider.clearContributors(Globals.getViewIdFromComponent(cmp));
		var ps = this.getStoreForPageItems(containerId);

		if( ps ) {
			ps.onAnnotationsLoadCallback = {callback: callback, cmp: cmp};
			ps.load();
		}
		else {
			Ext.callback(callback,null,[cmp]);
		}
		//When the reader changes, we need to tell the stream controller so he knows to
		//update his data
		this.getController('Stream').containerIdChanged(containerId);
	},


	getStoreForPageItems: function(containerId){
		var store = this.getPageStore(),
			page = store.getById(containerId),
			link = page ? page.getLink(Globals.USER_GENERATED_DATA) : null,
			ps = this.pageStores[containerId];

		if(!link) {
	
			//CUTZ Hack around an issue with the page store by falling back to the hardcoded UGD link.  
			//If an object is created on a page that has no objects on it, when you navigate away and then come back
			//to the page, your data doesn't show up.  It's not clear to me if the callback from the object creation
			//should be putting the new object in the page store, or if we just need to be fetching the pages data.
			//Regardless, the browser neither displays the created object, nor does it make an attempt to 
			//fetch the pages data.  I think this is related to what Troy and I talked about two days ago w.r.t. the pages
			//collection cache.
			link = $AppConfig.server.host + '/dataserver2/users/' + escape($AppConfig.username) + '/' + escape('Pages(' + containerId + ')') + '/UserGeneratedData';

			console.log('Falling back to hardcoded pages url because page store is busted ', link);
			//return null;
		}

		if(!ps){
			ps = Ext.create(
				'NextThought.store.PageItem',
				{ storeId:'page-store:'+containerId }
			);

			ps.on('load', this.onAnnotationStoreLoadComplete, this, {containerId: containerId});

			this.pageStores[containerId] = ps;
		}
		ps.proxy.url = link;
		return ps;
	},


	onAnnotationStoreLoadComplete: function(store, opts){
		if (!store.onAnnotationsLoadCallback) {return;}
		var reader = store.onAnnotationsLoadCallback.cmp,
			containerId = reader.getContainerId();

		if(store.storeId === ('page-store:'+containerId)){
			reader.objectsLoaded(store.getBins(), store.onAnnotationsLoadCallback.callback);
		}
	},



	onRemoveAnnotation: function(oid, containerId){
		$AppConfig.service.getObject(oid,
			function(o){
				if (o && o.isModifiable()){
					o.destroy();
				}
				else {
					console.error('cannot destroy', o);
				}
			},
			function(){
				console.error('Unable to destroy ', r);
			}
		);

		Ext.each(Ext.ComponentQuery.query('reader-panel'),
			function(p){
				p.removeAnnotation(oid);
			});
	},


	buttonClicked: function(button) {
		var target;
		if(button) {
			target = typeof button.ntiid === 'string' ? button.ntiid : null;
			LocationProvider.setLocation( target );
		}
	}
});
