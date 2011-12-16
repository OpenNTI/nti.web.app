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
        this.addEvents('publish-contributors','location-changed');
        this.callParent(arguments);

        this.add({cls:'x-panel-reset', margin: this.belongsTo ? 0 : '0 0 0 50px', enableSelect: true});
        this.initAnnotations();
    },

	getDocumentEl: function(){
		return this.items.get(0).getEl().down('.x-panel-body');
	},


    scrollToId: function(id) {
        var n = Ext.getCmp(id);
        this.scrollToNode(n.getEl());
    },

    scrollToTarget: function(target){
        var e = this.el.query('*[name='+target+']');
        if(!e || !e.length)
            console.warn('scrollToTarget: no target found: ',target);
        else
            this.scrollToNode(e[0]);
    },


    scrollToNode: function(n) {
        while(n && n.nodeType == 3) {//3 = ??
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

        if(me.active == pc[0]){
            if( callback ){
                callback();
            }

            if(target)
                me.scrollToTarget(target);

            return;
        }

        me.clearAnnotations();
        me.relayout();
        me.active = pc[0];
        if(!skipHistory)
            me._appendHistory(book, path);
        else if(skipHistory != 'no-record')
            me.fireEvent('unrecorded-history', book, path, ntiid);

        vp.mask('Loading...');
        if (bc) bc.setActive(book, f);

        me._request = Ext.Ajax.request({
            url: b+f,
            scope: this,
            disableCaching: true,
            scopeVars:{
                book: book,
                basePath: b,
                target: target,
                callback: callback
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
        var s = req.scopeVars,
            c = this._cleanHTML(data.responseText, s.basePath),
            target = s.target,
            callback = s.callback,
            containerId;

        this.items.get(0).update('<div id="NTIContent">'+c+'</div>');
        this._containerId = null;

        this.scrollTo(0, false);

        this.el.select('#NTIContent .navigation').remove();
        this.el.select('#NTIContent .breadcrumbs').remove();
        this.el.select('#NTIContent a[href]').on(
            'click', this._onClick, this,
            {book: s.book, scope:this, stopEvent:true});

        containerId = this.getContainerId();

        this.loadContentAnnotations(containerId);

        this.fireEvent('location-changed', containerId);

        if( callback ){
            this.on('relayedout', callback, this, {single: true});
        }

        if(target){
            this.on('relayedout',
                function(){
                    this.scrollToTarget(target);
                },
                this, {single: true});
        }

        this.bufferedDelayedRelayout();
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
            r = el.href,
            p = r.substring(_AppConfig.server.host.length),
            hash = p.split('#');

		if(m.externalUriRegex.test(r)){
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
            this.setActive(b, state.reader.page, 'no-record');
        }
        else{
            console.error(state.reader, 'The restored state object points to a resource that is no longer available');
        }
    }

});

