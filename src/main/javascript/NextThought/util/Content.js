Ext.define('NextThought.util.Content',{
	singleton: true,


	spider: function(ids, finish, parse, transform){
		if(!Ext.isArray(ids)){ ids = [ids]; }

		var service = $AppConfig.service,
			me = this,
			lock = ids.length;

		function maybeFinish(){
			lock--; if(lock>0){return;}
			Ext.callback(finish);
		}


		function parseContent(resp,pageInfo){
			var result = resp.responseText, dom;
			if(Ext.isFunction(transform)){
				try{
					result = transform(result, pageInfo);
				}
				catch(e){
					console.error('Error invoking transform', Globals.getError(e));
				}
			}

			dom = me.parseXML(result);

			try{
				Ext.callback(parse,null,[dom,pageInfo]);
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
			return new DOMParser().parseFromString(xml,"text/xml");
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


},function(){
	window.ContentUtils = this;
});
