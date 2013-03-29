Ext.define('NextThought.mixins.SearchHitHighlighting', {

	showSearchHit: function(hit, scrollToFragment) {
		this.clearSearchHit();
		this.searchAnnotations = Ext.widget('search-hits', {hit: hit, ps: hit.get('PhraseSearch'), owner: this});
		if(scrollToFragment){
			this.scrollToHit(scrollToFragment, hit.get('PhraseSearch'));
		}
	},


	getInsertionPoint: function(){
		return this.el;
	},


	//	@returns an object with top and left properties used to adjust the
	//  coordinate space of the ranges bounding client rects.
	//  It decides based on the type of container( main content or overlays).
	getRangePositionAdjustments: function(key){
		return {top: -1*this.el.getTop(), left: -1*this.el.getLeft()};
	},


	clearSearchHit: function() {
		if (!this.searchAnnotations) {
			return;
		}

		this.searchAnnotations.cleanup();
		delete this.searchAnnotations;
	},

	//Returns an array of objects with two propertes.  ranges is a list
	//of dom ranges that should be used to position the highlights.
	//key is a string that used to help distinguish the type of content when we calculate the adjustments( top and left ) needed.
	rangesForSearchHits: function(hit){
		var phrase = hit.get('PhraseSearch'),
			fragments = hit.get('Fragments'),
			regex, ranges,
			searchIn = this.el.dom,
			index = this.buildSearchIndex(),
			doc = searchIn.ownerDocument,
			result = [],
			key = this.getSearchHitConfig ? this.getSearchHitConfig().key : null;


		console.log('Getting ranges for search hits');

		regex = SearchUtils.contentRegexForSearchHit(hit, phrase);
		ranges = TextRangeFinderUtils.findTextRanges(searchIn, doc, regex, undefined, index);
		result.push({ranges: ranges.slice(),
			key: key || 'blog'});
		return result;
	},

	buildSearchIndex: function(){
		//We index only things in body, title, and tags
		function interesting(child){
			var f = Ext.fly(child);

			return f.parent('.body', true) || f.parent('.title', true) || f.parent('.tags');
		}

		return TextRangeFinderUtils.indexText(this.el.dom, interesting);
	},

	scrollToHit: function(fragment, phrase){
		var fragRegex = SearchUtils.contentRegexForFragment(fragment, phrase, true),
			searchIn = this.el.dom,
			doc = searchIn.ownerDocument,
			index = this.buildSearchIndex(),
			ranges = TextRangeFinderUtils.findTextRanges(searchIn, doc, fragRegex.re, fragRegex.matchingGroups, index),
			range, pos = -2, nodeTop, scrollOffset, p;


		if(Ext.isEmpty(ranges)){
			console.warn('Could not find location of fragment', fragment);
			return;
		}

		if(ranges.length > 1){
			console.warn('Found multiple hits for fragment.  Using first', fragment, ranges);
		}
		range = ranges[0];

		if(range && range.getClientRects().length > 0){
			nodeTop = range.getClientRects()[0].top;
			scrollOffset = this.body.getScroll().top;
			pos = nodeTop + scrollOffset;
		}

		console.log('Need to scroll to calculated pos', pos);
		if(pos > 0){
			var mainViewId = this.getSearchHitConfig ? this.getSearchHitConfig().mainViewId : 'profile';
			p = Ext.get(mainViewId);
			pos -= p.getHeight()/2;
			if(p){
				//console.log('Scroll To pos: ', pos, 'current scroll: ', scrollOffset, ' view: ', p);
				p.scrollTo('top', pos, true);
			}
		}
	}
});