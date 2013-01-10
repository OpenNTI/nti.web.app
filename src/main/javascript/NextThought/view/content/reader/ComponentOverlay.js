Ext.define('NextThought.view.content.reader.ComponentOverlay', {

	requires: [
		'NextThought.util.Dom',
		'NextThought.util.TabIndexTracker'
	],

	constructor: function(){
		this.on({
			scope: this,
			'content-updated': this.clearOverlayedPanels,
			'image-loaded': this.adjustOverlayedPanels,
			'afterRender': this.insertComponentOverlay
		});

		this.overlayedPanelTabIndexer = new NextThought.util.TabIndexTracker();
		this.activeOverlayedPanels = {};
	},


	insertComponentOverlay: function(){
		var container = Ext.DomHelper.append(this.getInsertionPoint('innerCt'), { cls:'component-overlay' }, true);
		this.on('destroy' , function(){ container.remove(); });
		this.componentOverlayEl = container;
	},


	/**
	 *
	 * @param key String|Object
	 * @param [panel] Object
	 */
	registerOverlayedPanel: function(key,panel){

		if(!panel && Ext.isObject(key)){
			panel = key;
			key = guidGenerator();
		}

		if(!Ext.isString(key) || !(Ext.isObject(panel) && panel.isComponent) ){
			Ext.Error.raise('Bad values');
		}

		this.registerOverlayedPanel[key] = panel;
	},

	adjustOverlayedPanels: function(){
		NextThought.view.content.overlay.Panel.syncPositioning();
	},


	clearOverlayedPanels: function(){
		var active = this.activeOverlayedPanels;
		this.activeOverlayedPanels = {};

		this.overlayedPanelTabIndexer.reset(10);

		Ext.Object.each(active,function(k, v){
			v.destroy();
			delete active[k];
		});

		Ext.each(
			Ext.ComponentQuery.query('overlayed-panel'),
			function(o){
				o.destroy();
			});
	},


	getRelatedElement: function(ntiid, objectEls) {
		var i;
		for (i = 0; i < objectEls.length; i++) {
			if (!(objectEls[i].getAttribute)) { continue; }
			if (objectEls[i].getAttribute('data-ntiid') === ntiid) {
				return objectEls[i];
			}
		}
		return undefined;
	},


	getContentElement: function(tagName, attribute, value){
		try {
		var doc = this.getDocumentElement(),
			tags = doc.getElementsByTagName(tagName),
			i = tags.length - 1,
			vRe = new RegExp( '^'+RegExp.escape( value )+'$', 'ig');

		for(i; i >= 0; i--) {
			if(vRe.test(tags[i].getAttribute(attribute))){
				return tags[i];
			}
		}
		}
		catch(er){
			console.error(er.message);
		}
		return null;
	}

});
