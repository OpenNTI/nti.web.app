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

	getRegex: function(){
		if(!this.regex && this.hit){
			this.regex = SearchUtils.contentRegexForSearchHit(this.hit, this.phraseSearch);
		}
		return this.regex;
	},

	getRanges: function(){
		var re, doc = this.ownerCmp.getDocumentElement();

		function anyRangesCollapsed(ranges){
			var collapsed = false;
			Ext.each(ranges, function(range){
				if(range.collapsed){
					collapsed = true;
					return false;
				}
				return true;
			});
			return collapsed;
		}

		if(this.ranges && !anyRangesCollapsed(this.ranges)){
			return this.ranges;
		}

		delete this.ranges;
		re = this.getRegex();
		if(!re){
			return null;
		}
		this.ranges = this.findTextRanges(doc, doc, re);
		return this.ranges;
	},


	showAllHits: function(){
		this.renderRanges(this.getRanges());
	},


	renderRanges: function(rangesToRender){
		var toAppend = [], redactionAction, rects;

		if(!rangesToRender){
			return;
		}
		Ext.each(rangesToRender, function(sel){
            redactionAction = this.getRedactionActionSpan(sel);
            if (!sel.commonAncestorContainer && redactionAction){
                redactionAction.addCls('searchHitInside');
                sel.getClientRects = function(){
                    var b = redactionAction.getBox();
                    return [{
                        bottom:b.bottom,
                        top:b.y,
                        left:b.x,
                        right:b.right,
                        height:b.height,
                        width:b.width
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
                      top: range.top+'px',
                      left: range.left+'px'
                   }});
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
