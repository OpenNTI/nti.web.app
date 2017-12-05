/*eslint no-undef:1*/
const Ext = require('extjs');

const ContentUtils = require('legacy/util/Content');
const PlaylistItem = require('legacy/model/PlaylistItem');
const Slide = require('legacy/model/Slide');
const {getURL} = require('legacy/util/Globals');

require('legacy/app/mediaviewer/content/Overlay');


module.exports = exports = Ext.define('NextThought.common.ux.SlideDeck', {

	openFromDom: function (el, reader) {
		var DQ = Ext.DomQuery, dom,
			ntiid = reader.getLocation().NTIID,
			selector = 'object[type$=nextthought.slide]',
			obj = Ext.fly(el).is(selector) ? el : Ext.fly(el).findParentNode(selector),
			startingSlide = (obj && obj.getAttribute('data-ntiid')) || undefined,
			startingVideo, slidedeckId;

		function getParam (name) {
			var e = DQ.select('param[name="' + name + '"]', obj)[0];
			return e ? e.getAttribute('value') : null;
		}

		//If we don't find a starting slide it may be launched from a video
		//In that case our starting slide is the earliest slide in the video.
		//This hueristic may be changed
		if (!startingSlide) {
			obj = el;
			dom = Ext.fly(el).down('object[type$=ntivideo]');
			if (dom) {
				startingVideo = PlaylistItem.fromDom(dom);
			}
		}

		slidedeckId = getParam('slidedeckid');

		this.__open(ntiid, slidedeckId, startingVideo, startingSlide);
	},

	__open: function (ntiidInContent, slidedeckId, startingVideo, startingSlide) {
		slidedeckId = slidedeckId || 'default';

		var root = ContentUtils.getLineage(ntiidInContent).last(),
			title = Library.getTitle(root),
			toc = Library.getToc(title),
			ids = [],
			videoIndex,
			store = new Ext.data.Store({proxy: 'memory'});


		console.debug('opening slidedesk id: ' + slidedeckId);

		Ext.each(Ext.DomQuery.select('topic[ntiid]', toc), function (o) {
			if ((o.getAttribute('href') || '').indexOf('#') >= 0) {return;}
			ids.push(o.getAttribute('ntiid'));
		});

		Ext.getBody().mask('Loading Slides...', 'navigation');

		function findRecordWithSource (sources) {
			var i, j, currentItem, currentSources,
				items = store.data.items;

			for (i = 0; i < items.length; i++) {
				currentItem = items[i];
				currentSources = currentItem.get('media').get('sources');
				if (currentSources.length === sources.length) {
					for (j = 0; j < sources.length; j++) {
						if (PlaylistItem.compareSources(currentSources[j].source, sources[j].source)) {
							return currentItem;
						}
					}
				}
			}
			return null;
		}

		function finish () {
			var earliestSlide, p;
			store.sort('ordinal', 'ASC');
			store.filter(function (_) {return _.get('slidedeck-id') === slidedeckId; });

			//If now startingSlide but we have a starting video, find the earliest starting slide for that video
			if (!startingSlide && startingVideo) {
				earliestSlide = findRecordWithSource(startingVideo.get('sources'));
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
		}


		function parse (content, pageInfo) {
			var basePath = ContentUtils.getRoot(pageInfo.getId()), dom, slides;

			basePath = getURL(basePath);
			content = ContentUtils.fixReferences(content, basePath);
			dom = ContentUtils.parseXML(content);
			slides = Ext.DomQuery.select('object[type="application/vnd.nextthought.slide"]', dom);

			Ext.each(slides, function (doc, i, a) {
				a[i] = Slide.fromDom(doc, pageInfo.getId(), videoIndex);
			});

			store.add(slides);
		}

		Library.getVideoIndex(title)
			.catch(function () {return null;})
			.then(function (data) {
				videoIndex = data;
				ContentUtils.spider(ids, finish, parse);
			});
	}

}).create();
