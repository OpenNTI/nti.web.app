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
			var dom = me.parseXML(resp.responseText);

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
	}

},function(){
	window.ContentUtils = this;
});
