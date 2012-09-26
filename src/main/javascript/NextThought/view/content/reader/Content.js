Ext.define('NextThought.view.content.reader.Content',{

	constructor: function(){
		this.loadedResources = {};
		this.meta = {};
		this.css = {};
		return this;
	},


	insertRelatedLinks: function(position,doc){
		var tpl = this.relatedTemplate, last = null,
			related = LocationProvider.getRelated(),c = 0,
			container = {
				tag: 'div',
				cls:'injected-related-items',
				html:'Related Topics: '
			};

		if(Object.keys(related).length === 0){
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


	resolveContainers: function(){
		var d = this.getDocumentElement(),
			els, containers = [];
		//TODO: get all ntiids on the page.
		//els = d.querySelectorAll('[data-ntiid],[ntiid]');

		//for now just get object tags (assessment items)
		els = d.querySelectorAll('[data-ntiid]');

		Ext.each(els,function(el){
			var id = el.getAttribute('data-ntiid') || el.getAttribute('ntiid');
			if(!/tag:/i.test(id)){return;}
			containers.push(id);
		});

		// these should already be in the order of the dom.
		return containers;
	},


	setContent: function(resp, assessmentItems, finish, hasCallback){
		var me = this,
			c = me.parseHTML(resp),
			containerId,
			subContainers;

		console.log('setting content...');

		function onFinishLoading() {
			console.log('setting content...finished');
			me.relayout();
			me.el.repaint();
			me.fireEvent('loaded', containerId);
//			if(hasCallback){
				Ext.callback(finish,null,[me]);
//			}
		}

		me.updateContent('<div id="NTIContent">'+c+'</div>');
		me.scrollTo(0, false);

		me.injectAssessments(assessmentItems);

		//apply any styles that may be on the content's body, to the NTIContent div:
		this.applyBodyStyles(
				resp.responseText.match(/<body([^>]*)>/i),
				this.buildPath(resp.request.options.url));

//		if(!hasCallback){
//			Ext.callback(finish,null,[me]);
//		}

		console.log('setting content... set, loading annotations');

		subContainers = me.resolveContainers();

		me.loadContentAnnotations(LocationProvider.currentNTIID, subContainers, onFinishLoading);
	},


	buildPath: function(s){
		console.log('Path given:',s);
		var p = s.split('/'); p.splice(-1,1,'');
		return p.join('/');
	},


	parseHTML: function(request){
		function toObj(a,k,v){
			var i=a.length-1, o = {};
			for(i; i>=0; i--){ o[k.exec(a[i])[2]] = v.exec(a[i])[1]; }
			return o;
		}

		function metaObj(m){
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]+)"/i);
		}

		function cssObj(m){
			var i = m.length-1, k=/href="([^"]*)"/i, o, c = {};
			for(i; i>=0; i--){
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
				host = absolute?getURL():basePath;

console.log('Path parts: ', host, url);

			if(/src/i.test(attr) && /youtube/i.test(url)){
				return Ext.String.format('src="{0}&wmode={1}"',url.replace(/http:/i,'https:'), 'opaque');
			}

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
					original : attr+'="'+host+url+'"';
		}

		var me = this;

		return string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	},


	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,


	onClick: function(e, el){
		e.stopPropagation();
		e.preventDefault();
		var m = this,
			r = el.href,
			hash = r.split('#'),
			newLocation = hash[0],
			target = hash[1],
			whref = window.location.href.split('#')[0];

		if (el.getAttribute('onclick') || !r || whref+'#' === r) {
			return;
		}

		//pop out links that point to external resources
		if(!ParseUtils.parseNtiid(r) && m.externalUriRegex.test(r) && r.indexOf(whref) < 0 ){
			//popup a leaving platform notice here...
			window.open(r, guidGenerator());
			return;
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
	}

});
