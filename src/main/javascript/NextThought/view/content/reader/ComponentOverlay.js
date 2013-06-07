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
			'afterRender': this.insertComponentOverlay,
			'afterLayout': function(){
				NextThought.view.content.overlay.Panel.syncPositioning();
			}
		});

		this.overlayedPanelTabIndexer = new NextThought.util.TabIndexTracker();
		this.activeOverlayedPanels = {};
	},


	insertComponentOverlay: function(){
		var container = Ext.DomHelper.append(this.getInsertionPoint('innerCt'), { cls:'component-overlay' }, true);
		this.on('destroy' , function(){ container.remove(); });
		this.componentOverlayEl = container;
	},


	overlayedPanelAtY: function(y){
		var panel,
			offsets = this.getAnnotationOffsets();

		y += offsets.top;

		//This may need to be optimized
		Ext.each(Ext.Object.getValues(this.activeOverlayedPanels), function(p){
			var minY = p.el.getTop(),
				maxY = minY + p.el.getHeight();
			if(y >= minY && y <= maxY){
				panel = p;
				return false;
			}
			return true;
		});

		return panel;
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

		if(!Ext.isString(key)){
			Ext.Error.raise('Bad key');
		}
		if(!(Ext.isObject(panel) && panel.isComponent)){
			console.warn('Bad panel');
			return;
		}
		panel.floatParent = this;
		this.activeOverlayedPanels[key] = panel;
	},

	adjustOverlayedPanels: function(){
		NextThought.view.content.overlay.Panel.syncPositioning();
	},


	clearOverlayedPanels: function(){
		var active = this.activeOverlayedPanels;
		this.activeOverlayedPanels = {};

		this.overlayedPanelTabIndexer.reset(10);

		Ext.Object.each(active,function(k, v){
			delete v.floatParent;
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
