Ext.define('NextThought.ux.SearchHits', {
	alias: 'widget.search-hits',
	mixins: {observable: 'Ext.util.Observable'},


	constructor: function(config){
		var me = this;
		me.mixins.observable.constructor.call(this);
		Ext.apply(me, {
			selections: (config.hits || []).slice(),
			ownerCmp: config.owner,
			container: config.owner.getInsertionPoint('innerCt').dom
		});

		this.mon(this.ownerCmp, {
			scope:this,
			'navigateComplete':this.cleanup,
			'sync-height' : this.reLayout
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
		var toAppend = [], range;
		Ext.each(this.selections, function(sel){
			var range = sel.getBoundingClientRect();
			//Instead of appending one element at a time build them into a list and
			//append the whole thing.  This is a HUGE improvement for the intial rendering performance
			toAppend.push({
				cls:'searchHit-entry',
			  style: {
				  height: range.height+'px',
				  width: range.width+'px',
				  top: range.top+'px',
				  left: range.left+'px'
			  }
			});

			//Arbitrarily cap at 100 until we can figure out a solution other than
			//a bazillion absolutely positioned divs that make anything but chrome
			//churn.  Maybe showing these things a secion at a time as the page scrolls
			//is best
			return toAppend.length <= 100;
		}, this);
		//TODO should we really use dom helper here? I thought in the past we had performance issues
		//with it
		Ext.DomHelper.append( this.searchHitsOverlay, toAppend, true);
	},

	removeOverlay: function(){
		try{
			Ext.fly(this.searchHitsOverlay).remove();
		}
		catch(e){
			console.error(e);
		}
	},

	reLayout: function(){
		this.removeOverlay();
		this.insertSearchHitsOverlay();
	},

	cleanup: function(){
		this.removeOverlay();
		delete this.selections;
		this.clearListeners();
		this.clearManagedListeners();
	}

});
