Ext.define('NextThought.mixins.Annotations', {
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
    _annotations: {},
    _filter: null,
    _searchAnnotations: null,

    initAnnotations: function(){
        this.addEvents('create-note','edit-note');
        this.enableBubble(['create-note','edit-note']);

        this.on('afterrender',
            function(){
                this.el.on('mouseup', this._onContextMenuHandler, this);
            },
            this);
    },

    _loadObjects: function() {
        this.clearAnnotations();
        UserDataLoader.getPageItems(this._containerId, {
            scope:this,
            success: this._objectsLoaded,
            failure: function(){} //TODO: Fill in
        });
    },

    applyFilter: function(newFilter){
        // console.log('applyFilter:', newFilter);
        var _a = this._annotations;

        this._filter = newFilter;
        for(var a in _a) {
            try {
                if(!_a.hasOwnProperty(a) || !_a[a]) continue;
                _a[a].updateFilterState(this._filter);
            }
            catch(e) {
                console.log(_a, a, newFilter);
            }
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


    removeAnnotation: function(oid) {
        var v = this._annotations[oid];
        if (v) {
            v.cleanup();
            delete v;
            this._annotations[oid] = undefined;
            delete this._annotations[oid];
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


    _annotationExists: function(record){
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
                    delete this._annotations[w.tempOID]; //remove the key from the object
                    delete w;//delete the object itself
                }
            },
            this);
        menu.showAt(xy);

    },

    _createHighlightWidget: function(range, record){

        if (this._annotationExists(record)) {
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
            w.tempOID = oid;
            record.on('updated',function(r){
                this._annotations[r.get('OID')] = this._annotations[oid];
                this._annotations[oid] = undefined;
                delete this._annotations[oid];
                delete w.tempOID;
            }, this);
        }

        this._annotations[oid] = w;
        return w;
    },

    _createNoteWidget: function(record){
        try{
            if(record.get('inReplyTo')){
                return false;
            }
            else if (this._annotationExists(record)) {
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

    _purgeRemovedObjects: function(oids) {
        //clear any top level annotations that are not on the server (ie. deleted).
        for(var key in this._annotations) {
            if(!this._annotations.hasOwnProperty(key)) continue;
            if (!Ext.Array.contains(oids, key)) {
                console.log('removing top level annotation ' + key);
                this.removeAnnotation(key);
            }
        }
    },


    _objectsLoaded: function(bins) {
        var contributors = {},
            oids = {},
            oid,
            me = this,
            bin,
            k = 'Last Modified',
            o;

        if (!this._containerId) return;

        //sort bins
        for(b in bins){
            if(bins.hasOwnProperty(b))
            bins[b] = Ext.Array.sort(bins[b]||[],function(a,b){return a.get(k) < b.get(k);});
        }

        Ext.each(bins.Highlight,
            function(r){
                var range = AnnotationUtils.buildRangeFromRecord(r);
                if (range){
                    contributors[r.get('Creator')] = true;
                    me._createHighlightWidget(range, r);
                }
                else{
                    console.log('could not build highlight from record:', r);
                }
            }, this
        );

        notes(buildTree);

        for(oid in oids){
            o = oids[oid];
            if(!oids.hasOwnProperty(oid) || o._parent) continue;

            me._createNoteWidget(o);
        }

        if( me.bufferedDelayedRelayout)
            me.bufferedDelayedRelayout();

        me.fireEvent('publish-contributors',contributors);
        return;//end of _objectsLoaded execution

        /**
         * helper local-scope functions (think of them as macros)
         */

        function notes(cb){ Ext.each(bins.Note,cb,this); }

        function buildTree(r){
            var oid = r.get('OID'),
                parent = r.get('inReplyTo'),
                c = r.get('Creator'),
                p;

            r.children = r.children || [];

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

        function getOID(id){
            var r=null;
            notes(function(o){ if(o.get('OID')==id){r = o;return false;} });
            return r;
        }
    },


    _loadContentAnnotations: function(containerId){
        this._containerId = containerId;
        this._loadObjects();
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
    }


});