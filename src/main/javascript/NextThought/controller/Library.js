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
		//clear the contributors for this page.  in case there are none.
		//ContributorsProvider.clearContributors(Globals.getViewIdFromComponent(cmp));
		var me = this;

		function success(ps){
			ps.onAnnotationsLoadCallback = {callback: callback, cmp: cmp};
			ps.load();

			//if we make it this far, also notify the stream controller
			me.getController('Stream').containerIdChanged(containerId);
		}

		function failure(){
			Ext.callback(callback,null,[cmp]);
		}

		me.getStoreForPageItems(containerId, success, me);
	},


	saveSharingPrefs: function(prefs, callback, saveToRoot){
		//TODO - check to see if it's actually different before save...
		function success(pi){
			pi.saveField('sharingPreference', {sharedWith: prefs}, callback);
		}

		function fail(){
			console.error('failed to get page info');
		}

		var ntiid = LocationProvider.currentNTIID;
		if(saveToRoot){
			ntiid = Library.getLineage(ntiid).last();
		}
		$AppConfig.service.getPageInfo(ntiid, success, fail, this);

	},


	getStoreForPageItems: function(containerId, success, failure, scope){
		console.log('CID=', containerId);
		var me = this,
			ps = this.pageStores[containerId];

		if (!containerId){
			Ext.Error.raise('Cannot get store page items without containerId.', arguments);
		}

		//when the pageinfo comes back, we want to set up the page item store
		function pageInfoSuccess(pi){
			LocationProvider.updatePreferences(pi);

			if (!ps){
				ps = Ext.create(
					'NextThought.store.PageItem',
					{ storeId:'page-store:'+containerId }
				);
				ps.on('load', me.onAnnotationStoreLoadComplete, me, {containerId: containerId});
				ps.proxy.url = pi.getLink(Globals.USER_GENERATED_DATA);
				me.pageStores[containerId] = ps;
			}


			Ext.callback(success, scope, [ps]);
		}

		function pageInfoFail(){
			console.error('Failed to load page info for', containerId);
			Ext.callback(failure, scope, []);
		}

		$AppConfig.service.getPageInfo(containerId, pageInfoSuccess, pageInfoFail, this);
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
