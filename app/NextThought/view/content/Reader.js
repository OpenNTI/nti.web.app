
Ext.define('NextThought.view.content.Reader', {
    extend:'NextThought.view.content.Panel',
    alias: 'widget.reader-panel',
    requires: [
        'NextThought.model.Highlight',
        'NextThought.model.Note',
        'NextThought.proxy.UserDataLoader',
        'NextThought.util.AnnotationUtils',
        'NextThought.util.QuizUtils',
        'NextThought.view.widgets.annotations.SelectionHighlight',
        'NextThought.view.widgets.annotations.Highlight',
        'NextThought.view.widgets.annotations.Note'
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

    scrollTo: function(top) {
        this.el.first().scrollTo('top', top, true);
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

        this.el.on('mouseup', this._onContextMenuHandler, this);
    },


    _onContextMenuHandler: function(e) {
        e.preventDefault();
        var range = this.getSelection();
        if( range && !range.collapsed ) {
            this.addHighlight(range, e.getXY());
        }
    },





    getSelection: function() {
        if (window.getSelection) {  // all browsers, except IE before version 9
            var selection = window.getSelection();
            if (selection.rangeCount > 0) {
                return selection.getRangeAt(0);
            }
        }
        else {
            if (document.selection) {   // Internet Explorer 8 and below
                var range = document.selection.createRange();
                return range.getBookmark();
            }
        }

        return null;
    },



    _appendHistory: function(book, path) {
        history.pushState(
            {
                book: book,
                path: path
            },
            "title","#"
        );
    },


    _restore: function(state) {
        this.setActive(state.book, state.path, true);
    },

    /**
     * Set the active page
     * @param {URL} path The page
     * @param {boolean} skipHistory Do not put this into the history
     */
    setActive: function(book, path, skipHistory, callback) {
        this.clearAnnotations();
        this.activate();

        var b = this._resolveBase(this._getPathPart(path)),
            h = _AppConfig.server.host,
            f = this._getFilename(path),
            p = this.items.get(0),
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

        this.active = pc[0];

        if(!skipHistory)
            this._appendHistory(book, path);


        vp.mask('Loading...');

        Ext.getCmp('breadcrumb').setActive(book, f);
        this.el.dom.firstChild.scrollTop = 0;
        this._containerId = null;

        Ext.Ajax.request({
            url: b+f,
            scope: this,
            disableCaching: true,
            success: function(data){
                var c = data.responseText,
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

                c = meta.concat(css).concat(body)

                    .replace(	/src=\"(.*?)\"/mig,
                    function fixReferences(s,g) {
                        return (g.indexOf("data:image")==0)?s:'src="'+b+g+'"';
                    })
                    .replace(	/href=\"(.*?)\"/mig,
                    function fixReferences(s,g) {
                        return g.indexOf("#")==0 ? s : 'href="'+(g.indexOf('/') == 0?h:b)+g+'"';
                    })
                    .replace(	/poster=\"(.*?)\"/mig,
                    function fixReferences(s,g) {
                        return 'poster="'+(g.indexOf('/') == 0?h:b)+g+'"';
                    });

                p.update('<div id="NTIContent">'+c+'</div>');
                this.el.select('#NTIContent .navigation').remove();
                this.el.select('#NTIContent .breadcrumbs').remove();
                this.el.select('.x-reader-pane a[href]').on('click',this._onClick,this,{book: book, scope:this,stopEvent:true});

                containerId = this.el.select('meta[name=NTIID]').first().getAttribute('content');


                this._loadContentAnnotations(containerId);
                this.fireEvent('location-changed', containerId);
                vp.unmask();

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
            error: function(){
                vp.unmask();
                Logging.logAndAlertError('There was an error getting content', arguments);
            }
        });
    },



    _onClick: function(e, el, o){
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
    }
});

