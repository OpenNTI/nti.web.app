Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.providers.Location',
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.Tracker'
	],
	mixins:{
		annotations: 'NextThought.mixins.Annotations'
	},
	cls: 'x-reader-pane',

	//props for when it's in a classroom
	tabConfig:{title: 'Content',tooltip: 'Live Content'},

	tracker: null,

	initComponent: function() {
		this.loadedResources = {};
		this.addEvents('loaded','finished-restore');
		this.enableBubble('loaded','finished-restore');
		this.callParent(arguments);

		this.add({cls:'x-panel-reset', margin: this.belongsTo ? 0 : '0 0 0 50px', enableSelect: true});
		this.initAnnotations();

		this.meta = {};
		this.css = {};
		this.nav = {};

		LocationProvider.on('navigate',this.loadPage,this);
	},


	getDocumentEl: function(){
		return this.items.get(0).getEl().down('.x-panel-body');
	},


	scrollToId: function(id) {
		var n = Ext.getCmp(id), m;

		if(n) {
			this.scrollToNode(n.getEl().dom);
			if (n.getMenu) {
				m = n.getMenu();
				if (m && m.items.getCount() === 1) {
					//a single menu item, might as well click it for them
					m.items.first().handler.call(window);
				}
			}
		}
		else {
			console.error('Could not find Component with id: ',id);
		}
	},


	scrollToTarget: function(target){
		var e = this.el.query('*[name='+target+']');
		if(!e || !e.length) {
			console.warn('scrollToTarget: no target found: ',target);
		}
		else {
			this.scrollToNode(e[0]);
		}
	},


	scrollToNode: function(n) {
		while(n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}
		var c = Ext.get('readerPanel-body');
		var o = (Ext.get(n).getOffsetsTo(c)[1]);
		this.scrollTo( c.dom.scrollTop + o - 10);
	},


	scrollTo: function(top, animate) {
		Ext.fly('readerPanel-body').scrollTo('top', top, animate!==false);
	},


	getContainerId: function() {
		return this.meta.NTIID;
	},


	render: function(){
		this.callParent(arguments);

		if(this.tracker){
			this.tracker.destroy();
			delete this.tracker;
			console.log('clearing old tracker...');
		}

		var d = this.el.dom;
		this.tracker = Ext.widget('tracker', this, d, d.firstChild);
	},


	loadPage: function(ntiid, callback) {
		var me = this,
			service = $AppConfig.service;

		if(ntiid === me.getContainerId()){
			Globals.callback(callback,null,[me]);
			return false;
		}

		me.clearAnnotations();

		function success(resp){
			this.setReaderContent(resp, callback);
		}

		function failure(){
			console.error(arguments);
		}

		me.request = service.getObjectRaw(ntiid, success, failure, me);

		return true;
	},


	setReaderContent: function(resp, callback){
		var me = this,
			c = me.parseHTML(resp),
			containerId;

		function onFinishLoading() {
			me.relayout();
			Globals.callback(callback,null,[me]);
			me.fireEvent('loaded', containerId);
		}

		me.items.get(0).update('<div id="NTIContent">'+c+'</div>');
		me.containerId = null;

		me.scrollTo(0, false);

		me.el.select('#NTIContent .navigation').remove();
		me.el.select('#NTIContent .breadcrumbs').remove();
		me.el.select('#NTIContent a[href]').on(
			'click', me.onClick, me, { scope: me, stopEvent: true });

		containerId = me.getContainerId();

		me.loadContentAnnotations(containerId, onFinishLoading);
	},


	parseHTML: function(request){
		function path(s){
			var p = s.split('/'); p.splice(-1,1,'');
			return p.join('/');
		}

		function toObj(a,k,v){
			var i=a.length-1, o = {};
			for(; i>=0; i--){ o[k.exec(a[i])[2]] = v.exec(a[i])[1]; }
			return o;
		}

		function metaObj(m){
			return toObj(m, /(name|http\-equiv)="([^"]+)"/i, /content="([^"]+)"/i);
		}

		function navObj(m){
			return toObj(m, /rel="([^"]+)"/i, /href="([^"]+)"/i);
		}

		function cssObj(m){
			var i = m.length-1, k=/href="([^"]*)"/i, o, c = {};
			for(; i>=0; i--){
				o = basePath + k.exec(m[i])[1];
				c[o] = {};
				if(!rc[o]) {
					rc[o] = c[o] = Globals.loadStyleSheet(o);
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

		var basePath = path(request.responseLocation),
			rc = this.loadedResources,

			c = request.responseText,
			rf= c.toLowerCase(),

			start = rf.indexOf(">", rf.indexOf("<body"))+1,
			end = rf.indexOf("</body"),

			head = c.substring(0,start).replace(/[\t\r\n\s]+/g,' '),
			body = c.substring(start, end);

		this.meta = metaObj( head.match(/<meta[^>]*>/gi) || [] );
		this.nav = navObj( head.match( /<link[^<>]+rel="(?!stylesheet)([^"]*)"[^<>]*>/ig) || []);
		this.css = cssObj( head.match(/<link[^<>]*?href="([^"]*css)"[^<>]*>/ig) || []);

		return this.fixReferences(body,basePath);
	},



	fixReferences: function(string, basePath){

		function fixReferences(original,tag,url) {
			var firstChar = url.charAt(0),
				absolute = firstChar ==='/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute?$AppConfig.server.host:basePath;

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
					original : tag+'="'+host+url+'"';
		}

		var me = this;

		return string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	},


	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,

//TODO: rewrite this to use NTIID
	onClick: function(e, el, o){
		e.stopPropagation();
		e.preventDefault();
		var m = this,
			r = el.href,
			hash = r.split('#'),
			newLocation = hash[0],
			target = hash[1];



		//pop out links that point to external resources
		if(!/tag:nextthought\.com/i.test(r) && m.externalUriRegex.test(r)){
			//popup a leaving platform notice here...
			window.open(r, guidGenerator());
			return;
		}

		LocationProvider.setLocation(newLocation, function(me){
			if(target) {
				me.scrollToTarget(target);
			}
		});
	}

});

