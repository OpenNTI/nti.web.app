Ext.define('NextThought.util.Content',{
	singleton: true,


	spider: function(ids, finish, parse){
		if(!Ext.isArray(ids)){ ids = [ids]; }

		var service = $AppConfig.service,
			me = this,
			lock = ids.length;

		function maybeFinish(){
			lock--; if(lock>0){return;}
			Ext.callback(finish);
		}


		function parseContent(resp,pageInfo){
			try{
				Ext.callback(parse,null,[resp.responseText,pageInfo]);
			} catch(e){
				console.error(Globals.getError(e));
			}
			maybeFinish();
		}

		Ext.each(ids,function(id){
			function failure(){
				console.error(id,arguments);
				maybeFinish();
			}

			service.getPageInfo(id,
					Ext.bind(me.getContentForPageInfo,me,[parseContent,failure],1),
					failure, me);
		});
	},


	getContentForPageInfo: function(pageInfo,callback,failure){
		var proxy = ($AppConfig.server.jsonp) ? JSONP : Ext.Ajax;

		function failed(r) {
			console.log('server-side failure with status code ' + r.status+': Message: '+ r.responseText);
			Ext.callback(failure);
		}

		proxy.request({
			ntiid: pageInfo.getId(),
			jsonpUrl: pageInfo.getLink('jsonp_content'),
			url: pageInfo.getLink('content'),
			expectedContentType: 'text/html',
			scope: this,
			success: Ext.bind(callback,null,[pageInfo],1),
			failure: failed
		});
	},


	parseXML: function(xml) {
		try{
			return new DOMParser().parseFromString(xml,"text/html");
		}
		catch(e){
			console.error('Could not parse content');
		}

		return undefined;
	},

	/** @private */
	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,

	isExternalUri: function(r){
		return this.externalUriRegex.test(r);
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


	/**
	 *
	 * @param html {String|Node}
	 * @param max {int}
	 * @returns {String}
	 */
	getHTMLSnippet:function(html, max){
		var i = /[^\.\?!]+[\.\?!]?/,
			spaces = /(\s{2,})/,
			df = document.createDocumentFragment(),
			d = document.createElement('div'),
			out = document.createElement('div'),
			texts, c = 0,
			r = document.createRange();

		df.appendChild(d);
		if(Ext.isString(html)){
			d.innerHTML = html;
		}
		else if(Ext.isDomNode(html)){
			d.appendChild(html.cloneNode(true));
		}
		else {
			Ext.Error.raise('IllegalArgument');
		}

		r.setStartBefore(d.firstChild);
		texts = AnnotationUtils.getTextNodes(d);

		Ext.each(texts,function(t){
			var o = c + t.length,
				v = t.nodeValue,
				offset;

			Ext.each(spaces.exec(v)||[],function(gap){
				o -= (gap.length-1);//subtract out the extra spaces, reduce them to count as 1 space(hence the -1)
			});


			if( o > max ){ //Time to split!
				offset = max - c;
				v = v.substr(offset);
				v = i.exec(v);
				offset += (v&&v.length>0?v[0].length:0);
				r.setEnd(t,offset);
				return false;
			}

			c = o;
			return true;
		});

		if(!r.collapsed){
			out.appendChild(r.cloneContents());
			return out.innerHTML;
		}

		return null;
	}
},function(){
	window.ContentUtils = this;
});
