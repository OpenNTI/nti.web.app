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
    _task: null,
    _annotations: {},
    _filter: null,
    _searchAnnotations: null,

    initAnnotations: function(){
        this.addEvents('create-note','edit-note');
        this.enableBubble(['create-note','edit-note']);

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
                console.log('record', record, ' is a reply, not updating.')
                return false;
            }
            else if (this.annotationExists(record)) {
                this._annotations[record.get('OID')].getRecord().fireEvent('updated',record);
                return true;
            }

            console.log('this is a new note!', record);
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
            a = [],
            me = this;

        if (!this._containerId) return;

        Ext.each(bins.Highlight,
            function(r){
                if (!this._containerId) return false;
                a.push(r.get('OID'));
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

        //oids now has everything, let's clear out annotations that have been removed.
        //this.purgeAnnotations(oids);

        for(var oid in oids){
            if (!this._containerId) return;
            var o = oids[oid];
            if(!oids.hasOwnProperty(oid) || o._parent) continue;

            me.createNoteWidget(o);
        }

        this._purgeRemovedObjects(a);
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

            a.push(oid);
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

    },


    _loadContentAnnotations: function(containerId){
        this._containerId = containerId;
        // Ext.TaskManager.stop(this._task);
        if (this._task.containerId && this._task.containerId != containerId){
            Ext.TaskManager.stop(this._task);
        }

        Ext.TaskManager.start(this._task);
        this._task.containerId = containerId;
    }


});