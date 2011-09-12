
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
    cls: 'x-reader-pane',

    items: [{cls:'x-panel-reset', margin: '0 0 0 50px'}],
    _annotations: {},
    _tracker: null,
    _filter: null,
    _searchAnnotations: null,
    _task: null,


    initComponent: function(){
        this.addEvents('create-note','edit-note','publish-contributors','location-changed');
        this.enableBubble(['create-note','edit-note']);
        this.callParent(arguments);

        this._task = {
            run: function() {
                UserDataLoader.getPageItems(this._containerId, {
                    scope:this,
                    success: this._objectsLoaded,
                    failure: function(){
                        //TODO: Fill in
                    }
                });
            },
            scope: this,
            interval: 30000//30 sec
        };
    },


    applyFilter: function(newFilter){
        // console.log('applyFilter:', newFilter);
        this._filter = newFilter;
        for(var a in this._annotations) {
            if(!this._annotations.hasOwnProperty(a)) continue;
            this._annotations[a].updateFilterState(this._filter);
        }
    },

    showRanges: function(ranges) {
        this._searchAnnotations = Ext.create('annotations.SelectionHighlight', ranges, this.items.get(0).el.dom.firstChild, this);
    },

    clearSearchRanges: function() {
        if (!this._searchAnnotations) return;

        this._searchAnnotations.cleanup();
        this._searchAnnotations = null;
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

    removeAnnotation: function(oid) {
        var v = this._annotations[oid];
        if (v) {
            v.cleanup();
            delete v;
            this._annotations[oid] = undefined;
        }
    },

    clearAnnotations: function(){
        for(var oid in this._annotations){
            if(!this._annotations.hasOwnProperty(oid)) continue;

            var v = this._annotations[oid];
            if (!v) continue;
            v.cleanup();
            delete v;
        }

        this._annotations = {};
        this.clearSearchRanges();
    },


    annotationExists: function(record){
        var oid = record.get('OID');
        if(!oid){
            return false;
        }

        return !!this._annotations[oid];
    },


    addHighlight: function(range, xy){
        if(!range) {
            return;
        }

        var highlight = AnnotationUtils.selectionToHighlight(range),
            menu,
            w;

        if(!highlight) return;

        w = this._createHighlightWidget(range, highlight);

        highlight.set('ContainerId', this._containerId);

        menu = w.getMenu();
        menu.on('hide', function(){
            if(!w.isSaving){
                w.cleanup();
                delete w;
            }
        });
        menu.showAt(xy);

    },

    _createHighlightWidget: function(range, record){

        if (this.annotationExists(record)) {
            this._annotations[record.get('OID')].getRecord().fireEvent('updated',record);
            return;
        }

        var oid = record.get('OID'),
            w = Ext.create(
                'NextThought.view.widgets.annotations.Highlight',
                range, record,
                this.items.get(0).el.dom.firstChild,
                this);

        if (!oid) {
            oid = 'Highlight-' + new Date().getTime();
            record.on('updated',function(r){
                this._annotations[r.get('OID')] = this._annotations[oid];
                this._annotations[oid] = undefined;
            }, this);
        }

        this._annotations[oid] = w;
        return w;
    },

    createNoteWidget: function(record){
        try{
            if(record.get('inReplyTo')){
                return false;
            }
            else if (this.annotationExists(record)) {
                this._annotations[record.get('OID')].getRecord().fireEvent('updated',record);
                return true;
            }

            this._annotations[record.get('OID')] =
                Ext.create(
                    'NextThought.view.widgets.annotations.Note',
                    record,
                    this.items.get(0).el.dom.firstChild,
                    this);
            return true;
        }
        catch(e){
            console.log('Error notes:',e, e.toString(), e.stack);
        }
        return false;
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


    _objectsLoaded: function(bins) {
        var contributors = {},
            oids = {},
            me = this;

        if (!this._containerId) return;

        Ext.each(bins.Highlight,
            function(r){
                if (!this._containerId) return false;
                var range = AnnotationUtils.buildRangeFromRecord(r);
                if (!range){
                    console.log('removing bad highlight');
                    //r.destroy();
                    return;
                }
                contributors[r.get('Creator')] = true;
                me._createHighlightWidget(range, r);
            }, this
        );

        bins.Note = Ext.Array.sort(bins.Note || [], function(a,b){
            var k = 'Last Modified';
            return a.get(k) < b.get(k);
        });

        notes(buildTree);

        for(var oid in oids){
            if (!this._containerId) return;
            var o = oids[oid];
            if(!oids.hasOwnProperty(oid) || o._parent) continue;

            me.createNoteWidget(o);
        }


        me.bufferedDelayedRelayout();
        me.fireEvent('publish-contributors',contributors);

        //helper local functions (think of them as macros)

        function notes(cb){ Ext.each(bins.Note,cb,this); }
        function getOID(id){
            var r=null;
            notes(function(o){ if(o.get('OID')==id){r = o;return false;} });
            return r;
        }

        function buildTree(r){
            var oid = r.get('OID'),
                parent = r.get('inReplyTo'),
                c = r.get('Creator'),
                p;

            if(!oids[oid])
                oids[oid] = r;

            if(parent){
                p = oids[parent];
                if(!p) p = (oids[parent] = getOID(parent));
                if(!p){
                    p = (oids[parent] = AnnotationUtils.replyToPlaceHolder(r));
                    buildTree(p);
                }

                p.children = p.children || [];
                p.children.push(r);

                r._parent = parent;
            }

            if(c && Ext.String.trim(c) != '')
                contributors[c] = true;
        }
    },


    _loadContentAnnotations: function(containerId){
        this._containerId = containerId;
        // Ext.TaskManager.stop(this._task);
        if (this._task.containerId && this._task.containerId != containerId){
            Ext.TaskManager.stop(this._task);
        }

        Ext.TaskManager.start(this._task);
        this._task.containerId = containerId;
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

