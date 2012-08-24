Ext.define('NextThought.controller.Library', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.IdCache',
		'NextThought.providers.Location'
	],

	models: [
		'PageInfo'
	],

	stores: [
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

		this.control({
			'reader-panel':{
				'annotations-load': this.onAnnotationsLoad
			}
		},{});
	},


	onAnnotationsLoad: function(cmp, containerId, callback) {
		var me = this,
			ps = me.getStoreForPageItems(containerId);

		ps.onAnnotationsLoadCallback = {callback: callback, cmp: cmp};

		ps.load();

		//if we make it this far, also notify the stream controller
		me.getController('Stream').containerIdChanged(containerId);
	},


	saveSharingPrefs: function(prefs, callback){
		//TODO - check to see if it's actually different before save...
		var pi = LocationProvider.currentPageInfo;
		if (pi){
			pi.saveField('sharingPreference', {sharedWith: prefs}, function(){
				//always happens if success only:
				LocationProvider.updatePreferences(pi);
				Ext.callback(callback, null, []);
			});
		}
	},


	getStoreForPageItems: function(containerId){
		var me = this,
			ps = this.pageStores[containerId];

		if (!containerId){
			Ext.Error.raise('Cannot get store page items without containerId.', arguments);
		}

		if (!ps){
			ps = Ext.create(
				'NextThought.store.PageItem',
				{ storeId:LocationProvider.getStoreId(containerId) }
			);
			ps.on('load', me.onAnnotationStoreLoadComplete, me, {containerId: containerId});
			ps.proxy.url = LocationProvider.currentPageInfo.getLink(Globals.USER_GENERATED_DATA);
			me.pageStores[containerId] = ps;
		}
		return ps;
	},


	onAnnotationStoreLoadComplete: function(store, opts){
		if (!store.onAnnotationsLoadCallback) {return;}
		var reader = store.onAnnotationsLoadCallback.cmp,
			containerId = LocationProvider.currentNTIID;

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
