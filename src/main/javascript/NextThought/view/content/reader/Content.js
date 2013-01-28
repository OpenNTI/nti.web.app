Ext.define('NextThought.view.content.reader.Content',{

	requires: [
		'NextThought.ux.ImageZoomView',
		'NextThought.ux.SlideDeck',
		'NextThought.view.video.OverlayedPanel',
		'NextThought.view.image.OverlayedPanel'
	],


	IMAGE_TEMPLATE: new Ext.XTemplate( Ext.DomHelper.markup([{
		cls: 'wrapper',
		cn:[{
			tag: 'a',
			href:'#zoom',
			'data-qtip':'Enlarge',
			cls: 'zoom disabled',
			html: ' ',
			'data-non-anchorable': true
		}]
	},{
		tag: 'span',
		cls: 'bar',
		'data-non-anchorable': true,
		'data-no-anchors-within': true,
		unselectable: true,
		cn: [{
			tag: 'a',
			href:'#slide',
			'data-qtip':'Open Slides',
			cls: 'bar-cell slide',
			html: ' '
		},{
			cls: 'bar-cell {[values.title || values.caption ? \'\' : \'no-details\']}',
			cn: [{
				tag: 'tpl',
				'if': 'title',
				cn:{
					tag: 'span',
					cls: 'image-title',
					html: '{title}'
				}
			},{
				tag: 'tpl',
				'if': 'caption',
				cn:{
					tag: 'span',
					cls: 'image-caption',
					html: '{caption}'
				}
			},{
				tag: 'a',
				href:'#mark',
				'data-qtip':'Comment on this',
				cls: 'mark',
				html: 'Comment'
			}]
		}]
	}])),

	constructor: function(){
		this.loadedResources = {};
		this.meta = {};
		this.css = {};

		this.addEvents('markupenabled-action');
		return this;
	},


	listenForImageLoads: function(){
		var d = this.getDocumentElement(),
			imgs = d.querySelectorAll('img'),
			me = this;

		Ext.each(imgs,function(i){
			i.onload = function(){
				me.fireEvent('image-loaded');
			};
		});
	},


	insertRelatedLinks: function(position,doc){
		var tpl = this.relatedTemplate, last = null,
			related = LocationProvider.getRelated(),c = 0,
			container = {
				tag: 'div',
				cls:'injected-related-items',
				html:'Related Topics: '
			};

		if(Ext.Object.getKeys(related).length === 0){
			return;
		}

		try {
			container = Ext.DomHelper.insertAfter(position,container);
		}
		catch(e){
			try {
				position = Ext.fly(doc.body).query('#NTIContent .page-contents')[0];
				container = Ext.DomHelper.insertFirst(position,container);
			}
			catch(ffs){
				return;
			}
		}

		container = Ext.DomHelper.append(container,{tag: 'span',cls:'related'});

		if(!tpl){
			tpl = Ext.DomHelper.createTemplate({
				tag:'a', href:'{0}',
				onclick:'NTIRelatedItemHandler(this);return false;',
				cls:'related c{2}', html:'{1}'}).compile();

			this.relatedTemplate = tpl;
		}

		Ext.Object.each(related,function(key,value){
			c++;
			last = tpl.append(container,[key,value.label,c]);
			last.relatedInfo = value;
		});

		if(last){
			container = container.parentNode;

			if(c > 10){
				Ext.DomHelper.append(container,{tag: 'span',cls:'more',html:'Show more'});
			}

			Ext.fly(container).on('click',function(){
				Ext.fly(container).removeAllListeners().addCls('showall');
			});
		} else {
			Ext.fly(container).remove();
		}
	},


	pauseAllVideos: function(){
		var d = this.getDocumentElement(),
			frames = d.querySelectorAll('iframe');

		Ext.each(frames,function(o){
			if(/^(http(s)?:)?\/\/www\.youtube\.com/i.test(o.getAttribute('src'))){
				o.contentWindow.postMessage(JSON.stringify({
				        event: 'command',
				        func: 'pauseVideo',
				        args: [],
				        id: o.getAttribute('id')
				}), "*");
			}
			//else if(vimeo){}
			//else if(html5){}...
		});
		Ext.each(Ext.ComponentQuery.query('overlay-video-roll'),function(c){c.pauseVideo();});
	},


	resolveContainers: function(){
		var d = this.getDocumentElement(),
			els, containers = [];

		//TODO: get all ntiids on the page.
		//els = d.querySelectorAll('[data-ntiid],[ntiid]');

		//for now just get object tags (assessment items)
		els = d.querySelectorAll('[data-ntiid]');

		Ext.each(els,function(el){
			var id = el.getAttribute('data-ntiid') || el.getAttribute('ntiid');
			if(!/tag:/i.test(id) || !/naquestion$/i.test(el.getAttribute('type'))){return;}
			containers.push(id);
		});

		// these should already be in the order of the dom.
		return containers;
	},


	activateVideoRoll: function(){
		var me = this,
			d = me.getDocumentElement(),
			els = d.querySelectorAll('object[type$=videoroll]');

		Ext.each(els,function(el){

			me.registerOverlayedPanel(el.getAttribute('data-ntiid'), Ext.widget('overlay-video-roll',{
				reader: me,
				renderTo: me.componentOverlayEl,
				tabIndexTracker: this.overlayedPanelTabIndexer,
				contentElement: el
			}));
		});
	},


	activateImageRoll: function(){
		var me = this,
			d = me.getDocumentElement(),
			els = d.querySelectorAll('object[type$=image-collection]');

//		els = [d.getElementById('a0000000001')];

		Ext.each(els,function(el){

			me.registerOverlayedPanel(el.getAttribute('data-ntiid')/*||'a0000000001'*/, Ext.widget('overlay-image-roll',{
				reader: me,
				renderTo: me.componentOverlayEl,
				tabIndexTracker: this.overlayedPanelTabIndexer,
				contentElement: el
			}));
		});
	},


	activateAnnotatableItems: function(){
		var d = this.getDocumentElement(),
			els = d.querySelectorAll('[itemprop~=nti-data-markupenabled],[itemprop~=nti-slide-video]'),
			tpl = this.IMAGE_TEMPLATE,
			activators = {
				'nti-data-resizeable': Ext.bind(this.activateZoomBox,this)
			};

		function get(el,attr){ return el? el.getAttribute(attr) : null; }

		function getStyle(el){
			var s = (get(el,'style')||'').replace(/\s+/ig,'').split(';'), r = {};
			Ext.each(s,function(v){v = (v||'').split(':');r[v[0].toLowerCase()] = v[1];});
			return r;
		}

		Ext.each(els,function(el){
			var p = (el.getAttribute('itemprop')||'').split(' '),
				target = Ext.fly(el).down('img,iframe',true),
				title = get(target,'data-title'),
				caption = get(target,'data-caption'),
				width,
				bar = tpl.append(el,{
					title: title,
					caption: caption
				},false);

			if(!title && !caption){
				Ext.fly(el).addCls('no-details');
			}
			Ext.fly(bar).unselectable();

			//move the targeted element into a wrapper
			if(Ext.fly(target).is('iframe') || !Ext.Array.contains(p,'nti-data-resizeable')){
				Ext.fly(el.querySelector('.wrapper a')).remove();
			}
			el.querySelector('.wrapper').appendChild(target);

			width = (parseInt(getStyle(target).width||get(target,'width'),10)||Ext.fly(target).getWidth())
				+ Ext.get(el).getBorderWidth('lr');

			Ext.get(el).setWidth(width);


			Ext.each(p,function(feature){
				(activators[feature]||Ext.emptyFn)(el,bar);
			});
		});
	},


	activateZoomBox: function(containerEl, toolbarEl){
		try{
			Ext.fly(containerEl.querySelector('a.zoom')).removeCls('disabled');
			var img = containerEl.querySelector('img[id]:not([id^=ext])'),
				current = img.getAttribute('data-nti-image-size'),
				base = this.basePath;

			//TODO: precache the most likely-to-be-used image, for now, we're just grabbing them all.
			Ext.each(['full','half','quarter'],function(size){
				if(size === current){return;}
				new Image().src = base+img.getAttribute('data-nti-image-'+size);
			});
		}
		catch(e){
			console.warn('Could not precache larger image',containerEl);
		}
	},


	setContent: function(resp, assessmentItems, finish){
		var me = this,
			c = me.parseHTML(resp),
			subContainers;

		me.updateContent('<div id="NTIContent">'+c+'</div>');
		me.listenForImageLoads();
		me.scrollTo(0, false);



		//apply any styles that may be on the content's body, to the NTIContent div:
		this.applyBodyStyles(
				resp.responseText.match(/<body([^>]*)>/i),
				this.buildPath(resp.request.options.url));

		me.injectAssessments(assessmentItems);

		subContainers = me.resolveContainers();

		me.activateVideoRoll();
		me.activateImageRoll();
		me.activateAnnotatableItems();

		me.loadContentAnnotations(LocationProvider.currentNTIID, subContainers);

		//Give the content time to settle. TODO: find a way to make an event, or prevent this from being called until the content is settled.
		Ext.defer(Ext.callback,500,Ext,[finish,null,[me]]);
	},


	buildPath: function(s){
		var p = s.split('/'); p.splice(-1,1,'');
		return p.join('/');
	},


	parseHTML: function(request){
		function toObj(a,k,v){
			var i=a.length-1, o = {};
			for(i; i>=0; i--){ o[k.exec(a[i])[2]] = Ext.htmlDecode(v.exec(a[i])[1]); }
			return o;
		}

		function metaObj(m){
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]+)"/i);
		}

		function cssObj(m){
			var i = 0, k=/href="([^"]*)"/i, o, c = {};
			for(i; i<m.length; i++){
				o = k.test(m[i]) ? basePath + k.exec(m[i])[1] : m[i];
				c[o] = {};
				if(!rc[o]) {
					rc[o] = c[o] = Globals.loadStyleSheet({
						url:o,
						document: me.getDocumentElement()
					});
				}
			}
			//remove resources not used anymore...
			Ext.Object.each(rc,function(k,v,o){
				if(!c[k]){
					Ext.fly(v).remove();
					delete o[k];
				}
			});
			return c;
		}

		var me = this,
			basePath = this.buildPath(request.request.options.url),
			rc = me.loadedResources,

			c = request.responseText,
			rf= c.toLowerCase(),

			start = rf.indexOf(">", rf.indexOf("<body"))+1,
			end = rf.indexOf("</body"),

			head = c.substring(0,start).replace(/[\t\r\n\s]+/g,' '),
			body = c.substring(start, end);

		me.basePath = basePath;

		this.meta = metaObj( head.match(/<meta[^>]*>/gi) || [] );
//		this.nav = navObj( head.match( /<link[^<>]+rel="(?!stylesheet)([^"]*)"[^<>]*>/ig) || []);
		this.css = cssObj( head.match(/<link[^<>]*?href="([^"]*css)"[^<>]*>/ig) || []);

		return this.fixReferences(body,basePath);
	},


	applyBodyStyles: function(bodyTag, basePath){
		var styleMatches = bodyTag[1] ? bodyTag[1].match(/style="([^"]+)"/i) : null,
			bodyStyles = styleMatches ? styleMatches[1]: null,
			body = Ext.get(this.getDocumentElement().getElementById('NTIContent')),
			bodyStylesObj = {};

		//Create an object with our styles split out
		if (bodyStyles) {
			Ext.each(bodyStyles.split(';'), function(s){
				var keyVal = s.split(':'),
					key = keyVal[0].trim(),
					val = keyVal[1].trim(),
					url;

				//make any url adjustments:
				if (key === 'background-image') {
					val = val.replace(/['|"]/g , '').replace('"', '');
					url = val.match(/url\(([^\)]*)/i)[1];
					val = 'url(' + basePath + url + ')';
				}

				bodyStylesObj[key] = val;
			});
		}
		body.setStyle(bodyStylesObj);
	},


	fixReferences: function(string, basePath){

		function fixReferences(original,attr,url) {
			var firstChar = url.charAt(0),
				absolute = firstChar ==='/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute?getURL():basePath,
				params;

			if(/src/i.test(attr) && /youtube/i.test(url)){
				params = [
					'html5=1',
					'enablejsapi=1',
					'autohide=1',
					'modestbranding=1',
					'rel=0',
					'showinfo=0',
					'wmode=opaque',
					'origin='+encodeURIComponent(location.protocol+'//'+location.host)];

				return Ext.String.format('src="{0}?{1}"',
						url.replace(/http:/i,'https:').replace(/\?.*/i,''),
						params.join('&') );
			}

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
					original : attr+'="'+host+url+'"';
		}

		var me = this;

		return string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	},


	/** @private */
	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,


	onClick: function(e, el){
		e.stopEvent();
		var m = this,
			r = el.href,
			hash = r.split('#'),
			newLocation = hash[0],
			target = hash[1],
			whref = window.location.href.split('#')[0];

		if (el.getAttribute('onclick') || !r || whref+'#' === r) {
			return false;
		}

		//pop out links that point to external resources
		if(!ParseUtils.parseNtiid(newLocation) && m.externalUriRegex.test(r) && r.indexOf(whref) < 0 ){
			//popup a leaving platform notice here...
			try {
				window.open(r, '_blank');
			}
			catch(er){
				window.location.href = r;
			}
			return false;
		}


		if(Ext.fly(el).is('.disabled')){
			return false;
		}

		if(/^slide/i.test(target)){
			this.pauseAllVideos();
			SlideDeck.open(el, LocationProvider.currentNTIID);
			return false;
		}

		if(/^zoom$/i.test(target)){
			Ext.defer(function(){
				m.getIframe().win.blur();
				window.focus();
			},100);
			ImageZoomView.zoomImage(el, this.getAnnotationOffsets());
			return false;
		}

		if(/^mark$/i.test(target)){
			m.fireEvent('markupenabled-action',el,target);
			return false;
		}

		if (newLocation.toLowerCase() === whref.toLowerCase() && target) {
			this.scrollToTarget(target);
		}
		else {
			LocationProvider.setLocation(newLocation, function(me){
				if(target) {
					me.scrollToTarget(target);
				}
			});
		}
		return undefined;
	}

});
