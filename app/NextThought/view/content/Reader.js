
Ext.define('NextThought.view.content.Reader', {
    extend:'NextThought.view.content.Panel',
    alias: 'widget.reader-panel',
    requires: [
        'NextThought.proxy.UserDataLoader',
        'NextThought.util.QuizUtils'
    ],
    mixins:{
        annotations: 'NextThought.mixins.Annotations'
    },
    cls: 'x-reader-pane',

    items: [{cls:'x-panel-reset', margin: '0 0 0 50px'}],

    _tracker: null,

    initComponent: function(){
        this.addEvents('publish-contributors','location-changed');
        this.callParent(arguments);
        this.initAnnotations();
    },

    scrollToId: function(id) {
        var n = Ext.getCmp(id);
        this.scrollToNode(n.getEl());
    },

    scrollToTarget: function(target){
        var e = this.el.query('*[name='+target+']');
        if(!e || !e.length)
            console.log('no target found: ',target);
        else
            this.scrollToNode(e[0]);
    },


    scrollToNode: function(n) {
        while(n && n.nodeType == 3) {
            n = n.parentNode;
        }

        var e = this.el.first(),
            h = e.getTop()+ 10,
            t = e.dom.scrollTop;

        this.scrollTo(t+Ext.get(n).getTop()-h);
        //Ext.get(n).scrollIntoView(this.el.first());
    },


    scrollTo: function(top, animate) {
        this.el.first().scrollTo('top', top, animate!==false);
    },


    render: function(){
        this.callParent(arguments);

        var d=this.el.dom;

        if(Ext.isIE){
            d.unselectable = false;
            d.firstChild.unselectable = false;
        }

        if(!this._tracker)
            this._tracker = Ext.create(
                'NextThought.view.widgets.Tracker', this, d, d.firstChild);
    },


    setActive: function(book, path, skipHistory, callback) {


        var b = this._resolveBase(this._getPathPart(path)),
            f = this._getFilename(path),
            pc = path.split('#'),
            target = pc.length>1? pc[1] : null,
            vp= Ext.getCmp('viewport').getEl();

        if(this.active == pc[0]){
            if( callback ){
                callback();
            }

            if(target)
                this.scrollToTarget(target);

            return;
        }

        this.clearAnnotations();
        this.relayout();

        this.active = pc[0];

        if(!skipHistory)
            this._appendHistory(book, path);

        vp.mask('Loading...');

        Ext.getCmp('breadcrumb').setActive(book, f);

        Ext.Ajax.request({
            url: b+f,
            scope: this,
            disableCaching: true,
            scopeVars:{
                book: book,
                basePath: b,
                target: target,
                callback: callback
            },
            success: this._setReaderContent,
            callback: function(req,success,res){
                vp.unmask();
                if(!success) {
                    Logging.logAndAlertError('There was an error getting content', b+f, res);
                    Ext.getCmp('home').activate();
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
        this.el.select('.x-reader-pane a[href]').on(
            'click', this._onClick, this,
            {book: s.book, scope:this, stopEvent:true});

        containerId = this.el.select('meta[name=NTIID]').first().getAttribute('content');

        this._loadContentAnnotations(containerId);
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
            b = basePath,
            rf= c.toLowerCase(),
            start = rf.indexOf(">", rf.indexOf("<body"))+1,
            end = rf.indexOf("</body"),
            head = c.substring(0,start),
            body = c.substring(start, end),
            css = /\<link.*href="(.*\.css)".*\>/gi,
            meta = /\<meta.*\>/gi,
            containerId;

        css = head.match(css);
        meta = head.match(meta);

        css = css?css.join(''):'';
        meta = meta?meta.join(''):'';

        meta = meta.replace(/<meta[^<]+?viewport.+?\/>/ig,'');

        c = this.__fixReferences(meta.concat(css).concat(body),basePath);

        return c;
    },



    __fixReferences: function(string, basePath){

        return string.replace(/(src|href|poster)=\"(.*?)\"/igm, fixReferences);

        function fixReferences(original,tag,url) {
            var firstChar = url.charAt(0),
                absolute = firstChar =='/',
                anchor = firstChar == '#',
                host = absolute?_AppConfig.server.host:basePath;

            return anchor || /^data\:/i.test(url)//inline
                ? original
                : tag+'="'+host+url+'"';
        }
    },



    _onClick: function(e, el, o){
        e.preventDefault();
        var m = this,
            r = el.href,
            p = r.substring(_AppConfig.server.host.length),
            hash = p.split('#');

        if(hash.length>1){

            if(hash[1].length==0){
                console.log('empty hash',el);
                return;
            }
        }

        m.setActive(o.book, p);
    },



    _appendHistory: function(book, path) {
        history.pushState(
            {
                book: book,
                path: path
            },
            "title",""
        );
    },


    _restore: function(state) {
        this.setActive(state.book, state.path, true);
    }

});

