Ext.define('NextThought.ux.SearchHits', {
	alias: 'widget.search-hits',
	mixins: {observable: 'Ext.util.Observable'},


	constructor: function(config){
		var me = this;
		me.mixins.observable.constructor.call(this);
		Ext.apply(me, {
			selections: config.hits || [],
			ownerCmp: config.owner,
			container: config.owner.getInsertionPoint('innerCt').dom
		});

		this.mon(this.ownerCmp, {
			scope:this,
			'navigateComplete':this.cleanup
		});

		this.insertSearchHitsOverlay();
		return me;
	},

	insertSearchHitsOverlay: function(){
		var container = Ext.DomHelper.append(this.ownerCmp.getInsertionPoint('innerCt'), { cls:'searchHit-overlay' }, true);
		this.on('destroy' , function(){ container.remove(); });
		this.searchHitsOverlay = container;
		this.showAllHits();
	},

	showAllHits: function(){
		Ext.each(this.selections, function(sel){

			var s = sel.getClientRects(),
				i = s.length-1;

			for(; i>=0; i--){
				this.showSearchHit(s[i]);
			}
		}, this);
	},

	showSearchHit: function(range){
		var c = {
			cls:'searchHit-entry',
			style: {
				height: range.height+'px',
				width: range.width+'px',
				top: range.top+'px',
				left: range.left+'px'
			}

		};

		Ext.DomHelper.append( this.searchHitsOverlay, c, true);

	},

	cleanup: function(){
		try{
			Ext.fly(this.searchHitsOverlay).remove();
		}
		catch(e){
			console.error(e);
		}
		delete this.selections;
		this.clearListeners();
	}

});
