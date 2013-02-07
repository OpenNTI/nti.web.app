Ext.define('NextThought.ux.SlideDeck',{
	singleton: true,

	requires: [
		'NextThought.util.Content',
		'NextThought.model.Slide',
		'NextThought.view.slidedeck.Overlay'
	],

	open: function(el, startingNTIID){
		var DQ = Ext.DomQuery,
			root = LocationProvider.getLineage(startingNTIID).last(),
			toc = Library.getToc(Library.getTitle(root)),
			ids = [],
			obj = Ext.fly(el).findParentNode('object[data-ntiid]'),
			startingSlide = (!obj ? null : obj.getAttribute('data-ntiid')) || undefined,
			startingVideo,
			slidedeckId,
			store = new Ext.data.Store({proxy:'memory'});

		function getParam(name){
			var el = DQ.select('param[name="'+name+'"]',obj)[0];
			return el ? el.getAttribute('value') : null;
		}

		//If we don't find a starting slide it may be launched from a video
		//In that case our starting slide is the earliest slide in the video.
		//This hueristic may be changed
		if(!startingSlide){
			obj = Ext.fly(el).findParentNode('object[type$=slidevideo]');
			startingVideo = getParam('ntiid');
		}

		slidedeckId = getParam('slidedeckid') || 'default';

		console.debug('opening slidedesk id: '+slidedeckId);

		Ext.each(Ext.DomQuery.select('topic[ntiid]',toc),function(o){
			ids.push(o.getAttribute('ntiid'));
		});

		Ext.getBody().mask('Loading Slides...','navigation');

		function finish(){
			var earliestSlide;
			store.sort('ordinal', 'ASC');
			store.filter('slidedeck-id',slidedeckId);

			//If now startingSlide but we have a starting video, find the earliest starting slide for that video
			if(!startingSlide && startingVideo){
				earliestSlide = store.findRecord('video-id',startingVideo,0,false,true,true);
				//The store is sorted by slide, so the first find is the earliest
				if( earliestSlide ){
					startingSlide = earliestSlide.getId();
				}
			}

			Ext.getBody().unmask();
			Ext.widget('slidedeck-overlay',{store: store, startOn: startingSlide}).show();
		}


		function parse(dom,pageInfo){
			var slides = Ext.DomQuery.select('object[type="application/vnd.nextthought.slide"]',dom);

			Ext.each(slides,function(dom,i,a){
				a[i] = NextThought.model.Slide.fromDom(dom,pageInfo.getId());
			});

			store.add(slides);
		}

		ContentUtils.spider(ids, finish, parse);
	}


},function(){
	window.SlideDeck = this;
});
