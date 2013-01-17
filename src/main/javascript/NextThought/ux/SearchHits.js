Ext.define('NextThought.ux.SearchHits', {
	alias: 'widget.search-hits',
	mixins: {observable: 'Ext.util.Observable',
			 textRangeFinder: 'NextThought.ux.TextRangeFinder'},
	requires: ['NextThought.util.Search'],

	constructor: function(config){
		var me = this;
		me.mixins.observable.constructor.call(this);
		Ext.apply(me, {
			hit: config.hit,
			phraseSearch: (config.ps || false),
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

	removeOverlay: function(){
		try{
			Ext.fly(this.searchHitsOverlay).remove();
		}
		catch(e){
			console.error(e);
		}
	},

	getRanges: function(){
		function anyRangesCollapsed(ranges){
			var collapsed = false;
			Ext.each(ranges, function(range){
				Ext.each(range.ranges, function(actualRange){
					if(actualRange.collapsed){
						collapsed = true;
						return false;
					}
					return true;
				});
				return !collapsed;
			});
			return collapsed;
		}

		if(this.ranges && !anyRangesCollapsed(this.ranges)){
			return this.ranges;
		}

		delete this.ranges;

		this.ranges = this.ownerCmp.rangesForSearchHits(this.hit);
		return this.ranges;
	},


	showAllHits: function(){
		this.renderRanges(this.getRanges());
	},

	entriesToAppend: function(rangeInfo, toAppend){
		var rangesToRender = rangeInfo.ranges,
			adjustments = rangeInfo.adjustments || {},
			redactionAction, rects;

		if(!rangesToRender){
			return toAppend;
		}
		Ext.each(rangesToRender, function(sel){
            redactionAction = this.getRedactionActionSpan(sel);
            if (redactionAction){
                redactionAction.addCls('searchHitInside');
                sel.getClientRects = function(){
                    var b = redactionAction.getBox();
                    return [{
                        bottom: b.bottom,
                        top: b.y + adjustments.top || 0,
                        left: b.x + adjustments.left || 0,
                        right: b.right,
                        height: b.height,
                        width: b.width
                    }];
                };
                sel.noOverlay = true;
            }

            if(!sel.getClientRects){sel.getClientRects = function(){return [];};}
			rects = RectUtils.merge(sel.getClientRects(), null);

			Ext.each(rects, function(range){

				//Instead of appending one element at a time build them into a list and
				//append the whole thing.  This is a HUGE improvement for the intial rendering performance
				if(!sel.noOverlay){
					toAppend.push({
						cls:'searchHit-entry',
						style: {
							height: range.height+'px',
							width: range.width+'px',
							top: (range.top+adjustments.top || 0)+'px',
							left: (range.left+adjustments.left || 0)+'px'
						}});
				}
			});

			//Arbitrarily cap at 100 until we can figure out a solution other than
			//a bazillion absolutely positioned divs that make anything but chrome
			//churn.  Maybe showing these things a secion at a time as the page scrolls
			//is best
			return toAppend.length <= 100;

		}, this);

		return toAppend;
	},

	renderRanges: function(rangesToRender){
		var toAppend = [], redactionAction, rects;

		Ext.each(rangesToRender, function(rangeInfo){
			this.entriesToAppend(rangeInfo, toAppend);
		}, this);

		Ext.DomHelper.append( this.searchHitsOverlay, toAppend, true);
	},

	reLayout: function(){
		this.removeOverlay();
		this.insertSearchHitsOverlay();
	},

	cleanup: function(){
		this.removeOverlay();
		delete this.hit;
		delete this.regex;
		delete this.ranges;
		delete this.appRanges;
		this.clearListeners();
		this.clearManagedListeners();
	}

});
