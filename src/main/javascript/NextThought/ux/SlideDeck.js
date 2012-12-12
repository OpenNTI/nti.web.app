Ext.define('NextThought.ux.SlideDeck',{
	singleton: true,

	requires: [
		'NextThought.model.Slide',
		'NextThought.view.slidedeck.Overlay'
	],

	open: function(el, startingNTIID){
		var root = LocationProvider.getLineage(startingNTIID).last(),
			toc = Library.getToc(Library.getTitle(root)),
			ids = [],
			obj = Ext.fly(el).up('object[data-ntiid]') || {getAttribute:Ext.emptyFn},
			startingSlide = obj.getAttribute('data-ntiid') || undefined;

		Ext.each(Ext.DomQuery.select('topic[ntiid]',toc),function(o){
			ids.push(o.getAttribute('ntiid'));
		});

		Ext.getBody().mask('Loading Slides...','navigation');

		function finish(store){
			Ext.getBody().unmask();
			Ext.widget('slidedeck-overlay',{store: store, startOn: startingSlide}).show();
		}

		this.spider(ids, finish);
	},


	parseXML: function(xml) {
		try{
			return new DOMParser().parseFromString(xml,"text/xml");
		}
		catch(e){
			console.error('Could not parse content');
		}

		return undefined;
	},


	spider: function(ids, callback){
		var service = $AppConfig.service,
			scope = this,
			lock = ids.length,
			data = new Ext.data.Store({proxy:'memory'});

		function maybeFinish(){
			lock--;
			if(lock>0){return;}
			data.sort('ordinal', 'ASC');
			Ext.callback(callback,scope,[data]);
		}

		function parseContent(resp,pageInfo){
			var dom = this.parseXML(resp.responseText),
				slides = Ext.DomQuery.select('object[type="application/vnd.nextthought.slide"]',dom);

			Ext.each(slides,function(dom,i,a){
				a[i] = NextThought.model.Slide.fromDom(dom,pageInfo.getId());
			});

			data.add(slides);

			maybeFinish();
		}

		function parsePageInfo(pageInfo){
			var proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

			function failed(r) {
				console.log('server-side failure with status code ' + r.status+': Message: '+ r.responseText);
				maybeFinish();
			}

			proxy.request({
				ntiid: pageInfo.getId(),
				jsonpUrl: pageInfo.getLink('jsonp_content'),
				url: pageInfo.getLink('content'),
				expectedContentType: 'text/html',
				scope: scope,
				success: Ext.bind(parseContent,scope,[pageInfo],1),
				failure: failed
			});
		}


		Ext.each(ids,function(id){
			function failure(){
				console.error(id,arguments);
				maybeFinish();
			}

			service.getPageInfo(id, parsePageInfo, failure, scope);
		});
	}

},function(){
	window.SlideDeck = this;
});
