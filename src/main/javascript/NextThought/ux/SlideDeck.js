/*JSLint */
/*globals ContentUtils, Library, NextThought */
Ext.define('NextThought.ux.SlideDeck', {
	singleton: true,

	requires: [
		'NextThought.util.Content',
		'NextThought.model.PlaylistItem',
		'NextThought.model.Slide',
		'NextThought.view.slidedeck.Overlay'
	],


	open: function (el, reader) {
		var DQ = Ext.DomQuery,
				root = ContentUtils.getLineage(reader.getLocation().NTIID).last(),
				toc = Library.getToc(Library.getTitle(root)),
				ids = [],
				dom,
				selector = 'object[type$=nextthought.slide]',
				obj = Ext.fly(el).is(selector) ? el : Ext.fly(el).findParentNode(selector),
				startingSlide = (obj && obj.getAttribute('data-ntiid')) || undefined,
				startingVideo,
				slidedeckId,
				store = new Ext.data.Store({proxy: 'memory'});

		function getParam(name) {
			var el = DQ.select('param[name="' + name + '"]', obj)[0];
			return el ? el.getAttribute('value') : null;
		}

		//If we don't find a starting slide it may be launched from a video
		//In that case our starting slide is the earliest slide in the video.
		//This hueristic may be changed
		if (!startingSlide) {
			obj = el;
			dom = Ext.fly(el).down('object[type$=ntivideo]');
			if (dom) {
				startingVideo = NextThought.model.PlaylistItem.fromDom(dom);
			}
		}

		slidedeckId = getParam('slidedeckid') || 'default';

		console.debug('opening slidedesk id: ' + slidedeckId);

		Ext.each(Ext.DomQuery.select('topic[ntiid]', toc), function (o) {
			if ((o.getAttribute('href') || '').indexOf('#') >= 0) {
				return;
			}
			ids.push(o.getAttribute('ntiid'));
		});

		Ext.getBody().mask('Loading Slides...', 'navigation');

		function findRecordWithSource(store, sources) {
			var i, j, currentItem, currentSources,
					items = store.data.items;

			for (i = 0; i < items.length; i++) {
				currentItem = items[i];
				currentSources = currentItem.get('media').get('sources');
				if (currentSources.length === sources.length) {
					for (j = 0; j < sources.length; j++) {
						if (NextThought.model.PlaylistItem.compareSources(currentSources[j].source, sources[j].source)) {
							return currentItem;
						}
					}
				}
			}
			return null;
		}

		function finish() {
			var earliestSlide, p;
			store.sort('ordinal', 'ASC');
			store.filter('slidedeck-id', slidedeckId);

			//If now startingSlide but we have a starting video, find the earliest starting slide for that video
			if (!startingSlide && startingVideo) {
				earliestSlide = findRecordWithSource(store, startingVideo.get('sources'));
				//The store is sorted by slide, so the first find is the earliest
				if (earliestSlide) {
					startingSlide = earliestSlide.getId();
				}
			}

			Ext.getBody().unmask();
			p = Ext.widget('slidedeck-overlay', {store: store, startOn: startingSlide});
			p.fireEvent('suspend-annotation-manager', this);
			p.show();
			p.on('destroy', function () {
				p.fireEvent('resume-annotation-manager', this);
			});
			p.mon(reader, 'navigateComplete', 'destroy', p);
		}


		function parse(content, pageInfo) {
			var basePath = ContentUtils.getRoot(pageInfo.getId()), dom, slides;

			basePath = getURL(basePath);
			content = ContentUtils.fixReferences(content, basePath);
			dom = ContentUtils.parseXML(content);
			slides = Ext.DomQuery.select('object[type="application/vnd.nextthought.slide"]', dom);

			Ext.each(slides, function (dom, i, a) {
				a[i] = NextThought.model.Slide.fromDom(dom, pageInfo.getId());
			});

			store.add(slides);
		}

		ContentUtils.spider(ids, finish, parse);
	}


}, function () {
	window.SlideDeck = this;
});
