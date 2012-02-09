Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.reader-panel',
	requires: [
		'NextThought.util.QuizUtils',
		'NextThought.view.widgets.Tracker'
	],
	mixins:{
		annotations: 'NextThought.mixins.Annotations'
	},
	cls: 'x-reader-pane',

	//props for when it's in a classroom
	tabConfig:{title: 'Content',tooltip: 'Live Content'},

	_tracker: null,

	//used to bust caches between sessions
	instantiation_time: Ext.Date.now(),

	initComponent: function(){
		this.addEvents('publish-contributors','location-changed','finished-navigation','finished-restore');
		this.enableBubble('publish-contributors','location-changed','finished-navigation','finished-restore');
		this.callParent(arguments);

		this.add({cls:'x-panel-reset', margin: this.belongsTo ? 0 : '0 0 0 50px', enableSelect: true});
		this.initAnnotations();
	},

	getDocumentEl: function(){
		return this.items.get(0).getEl().down('.x-panel-body');
	},


	scrollToId: function(id) {
		var n = Ext.getCmp(id),
			m;
		if(n) {
			this.scrollToNode(n.getEl());
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
		while(n && n.nodeType === 3) {//3 = ??
			n = n.parentNode;
		}

		var e = this.el.first(),
			h = e.getTop()+ 10,
			t = e.dom.scrollTop;

		this.scrollTo(t+Ext.get(n).getTop()-h);
	},


	scrollTo: function(top, animate) {
		this.el.first().scrollTo('top', top, animate!==false);
	},

	getContainerId: function() {
		return this.el.select('meta[name=NTIID]').first().getAttribute('content');
	},

	render: function(){
		this.callParent(arguments);

		if(this._tracker){
			this._tracker.destroy();
			delete this._tracker;
			console.log('clearing old tracker...');
		}

		var d = this.el.dom;
		this._tracker = Ext.widget('tracker', this, d, d.firstChild);

		if(this.deferredRestore){
			this.restore(this.deferredRestore);
			delete this.deferredRestore;
		}
	},


	setActive: function(book, path, skipHistory, callback, ntiid) {
		var me = this,
			b = me._resolveBase(me._getPathPart(path)),
			f = me._getFilename(path),
			pc = path.split('#'),
			target = pc.length>1? pc[1] : null,
			vp= VIEWPORT.getEl(),
			bc = me.ownerCt.getDockedComponent(0) || Ext.getCmp('breadcrumb');

		if(me.active === pc[0]){
			if( callback ){
				callback();
			}

			if(target) {
				me.scrollToTarget(target);
			}

			return;
		}

		me.clearAnnotations();
		me.relayout();
		me.active = pc[0];
		if(!skipHistory){
			me._appendHistory(book, path);
		}
		else if(skipHistory !== 'do-restore') {
			me.fireEvent('unrecorded-history', book, path, ntiid);
		}

		vp.mask('Loading...');
		if (bc) {
			bc.setActive(book, f);
		}

		me._request = Ext.Ajax.request({
			url: b+f,
			scope: this,
			disableCaching: true,
			scopeVars:{
				book: book,
				basePath: b,
				target: target,
				callback: callback,
				fireFinishRestore: skipHistory === 'do-restore'
			},
			success: me._setReaderContent,
			callback: function(req,success,res){
				delete me._request;
				vp.unmask();
				if(!success) {
					console.error('There was an error getting content', b+f, res);
				}
			}
		});
	},




	_setReaderContent: function(data, req){
		var me = this,
			s = req.scopeVars,
			c = me._cleanHTML(data.responseText, s.basePath),
			target = s.target,
			callback = s.callback,
			containerId;

		function onFinishLoading() {
			me.fireEvent('location-changed', containerId);

			if( callback ){
				me.on('relayedout', callback, me, {single: true});
			}

			if(target){
				me.on('relayedout',
					function(){
						me.scrollToTarget(target);
					},
					me, {single: true});
			}

			me.bufferedDelayedRelayout();
			me.fireEvent('finished-navigation');
			if(s.fireFinishRestore) {
				me.fireEvent('finished-restore');
			}
		}

		me.items.get(0).update('<div id="NTIContent">'+c+'</div>');
		me._containerId = null;

		me.scrollTo(0, false);

		me.el.select('#NTIContent .navigation').remove();
		me.el.select('#NTIContent .breadcrumbs').remove();
		me.el.select('#NTIContent a[href]').on(
			'click', me._onClick, me, {
				book: s.book, scope: me, stopEvent: true
			});

		containerId = me.getContainerId();

		me.loadContentAnnotations(containerId, onFinishLoading);
	},



	_cleanHTML: function(html, basePath){
		var c = html,
			rf= c.toLowerCase(),
			start = rf.indexOf(">", rf.indexOf("<body"))+1,
			end = rf.indexOf("</body"),
			head = c.substring(0,start),
			body = c.substring(start, end),
			css, meta;

		css = head.match(/<link.*href="(.*\.css)".*>/gi);
		meta = head.match(/<meta.*>/gi);
		//cache bust css
		css = css ? css.join('') : '';
		css = css.replace(/\.css/gi, '.css?dc='+this.instantiation_time);
		meta = meta?meta.join(''):'';

		meta = meta.replace(/<meta[^<]+?viewport.+?\/>/ig,'');

		c = this.__fixReferences(meta.concat(css).concat(body),basePath);

		return c;
	},



	__fixReferences: function(string, basePath){

		function fixReferences(original,tag,url) {
			var firstChar = url.charAt(0),
				absolute = firstChar ==='/',
				anchor = firstChar === '#',
				external = me.externalUriRegex.test(url),
				host = absolute?_AppConfig.server.host:basePath;

			//inline
			return (anchor || external || /^data:/i.test(url)) ?
					original : tag+'="'+host+url+'"';
		}

		var me = this;

		return string.replace(/(src|href|poster)="(.*?)"/igm, fixReferences);
	},


	externalUriRegex : /^([a-z][a-z0-9\+\-\.]*):/i,


	_onClick: function(e, el, o){
		e.stopPropagation();
		e.preventDefault();
		var m = this,
			h = _AppConfig.server.host,
			l = window.location.href.split("#")[0],
			r = el.href,
			p = r.substring(h.length),
			b = r.split('#')[0] === l,
			hash = p.split('#');

		//pop out links that point to external resources
		if(m.externalUriRegex.test(r) && r.indexOf(h) !== 0 && !b){
			//popup a leaving platform notice here...
			window.open(r, guidGenerator());
			return;
		}

		if(hash.length>1){

			if(hash[1].length===0){
				console.debug('empty hash',el);
				return;
			}
		}

		m.setActive(o.book, p);
	},



	_appendHistory: function(book, path) {
		var state = { reader:{ index: book.get('index'), page: path } };
		try{
			history.pushState(state,"TODO: resolve title");
		}
		catch(e){
			console.error('Error recording history:', e, e.message, e.stack, 'state:', state);
		}
	},


	restore: function(state) {
		if(!state || !state.reader) {
			console.warn("WARNING: Ignoring restored state data, missing state for reader");
			return;
		}

		if(!this.rendered){
			this.deferredRestore = state;
			return;
		}

		var b = Library.getTitle(state.reader.index);
		if(b){
			this.setActive(b, state.reader.page, 'do-restore');
		}
		else{
			console.error(state.reader, 'The restored state object points to a resource that is no longer available');
		}
	}

});

