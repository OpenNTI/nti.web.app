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
		'widgets.ReaderBreadcrumb',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.Tracker'
	],

	refs: [
		{ ref: 'viewport', selector: 'master-view' },
		{ ref: 'readerBreadcrumb', selector: 'reader-mode-container reader-breadcrumbbar' },
		{ ref: 'readerPeople', selector: 'reader-mode-container people-list' },
		{ ref: 'readerRelated', selector: 'reader-mode-container related-items' },
		{ ref: 'readerMode', selector: 'reader-mode-container' }
	],

	init: function() {
		this.pageStores = {};

		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'reader-breadcrumbbar *[ntiid]' : {
				'click' : this.buttonClicked
			},

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
		var ps = this.getStoreForPageItems(containerId);

		if( ps ) {
			ps.onAnnotationsLoadCallback = {callback: callback, cmp: cmp};
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
			link = page ? page.getLink(Globals.USER_GENERATED_DATA) : null,
			ps = this.pageStores[containerId];

		if(!link) {
			return null;
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
