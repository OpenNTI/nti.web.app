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
		var toAppend = [], range;

		if(!rangesToRender){
			return;
		}
		Ext.each(rangesToRender, function(sel){
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

	getAppRanges: function(){
		var re;
		if(!this.appRanges){
			re = this.getRegex();
			if(!re){
				return null;
			}
			this.appRanges = this.findTextRanges(document, document, re);
		}
		return this.appRanges;
	},

	firstHitLocation: function(){
		var theRanges = this.getRanges(), assessmentAdjustment = 0, 
			firstRange, nodeTop, scrollOffset, pos = -1;

		//FIXME get this assessment hack out of here, the reader should ask whatever
		//is managing the assessments to highlight as well...
		//If we found no range, try again not in iframe in case of assessments,
		//this is a bit of a hack to get it working for MC
		if(!theRanges || theRanges.length === 0){
			theRanges = this.getAppRanges();
			assessmentAdjustment = 150;
		}

		//We may get ranges in our list that don't have any client rects.  A good example
		//is a node that is currently display none so make sure we account for that.  The
		//related topics list is one example of where we have seen this occur
		Ext.each(theRanges, function(possibleRange){
			if(possibleRange.getClientRects().length > 0){
				firstRange = possibleRange;
				return false; //Break
			}
			return true; //keep going
		});

		if(firstRange){
			nodeTop = firstRange.getClientRects()[0].top;
			//Assessment items aren't in the iframe so they don't take into account scroll
			scrollOffset = this.ownerCmp.body.getScroll().top;
			scrollOffset = ( assessmentAdjustment > 0 ? scrollOffset : 0);

			pos = nodeTop - assessmentAdjustment + scrollOffset;
		}
		return pos;
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
