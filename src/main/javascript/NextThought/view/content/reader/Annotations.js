Ext.define('NextThought.view.content.reader.Annotations', {
    alias: 'reader.annotations',
    requires: [
        'NextThought.model.Highlight',
        'NextThought.model.Note',
        'NextThought.model.Redaction',
        'NextThought.model.TranscriptSummary',
        'NextThought.model.QuizResult',
        'NextThought.util.Annotations',
        'NextThought.ux.SearchHits',
        'NextThought.view.annotations.renderer.Manager',
        'NextThought.view.annotations.Redaction',
        'NextThought.view.annotations.Highlight',
        'NextThought.view.annotations.Note',
        'NextThought.view.annotations.Transcript',
        'NextThought.view.annotations.QuizResults',
        'NextThought.view.assessment.Scoreboard',
        'NextThought.cache.IdCache',
        'NextThought.util.Search',
        'NextThought.util.TextRangeFinder'
    ],
    mixins: {
        observable: 'Ext.util.Observable'
    },


    getBubbleTarget: function () {
        return this.reader;
    },


    constructor: function (config) {
        Ext.apply(this, config);
        var me = this,
            reader = me.reader;

        me.mixins.observable.constructor.apply(me);

        reader.on('destroy', 'destroy',
            reader.relayEvents(me, [
                'filter-by-line',
                'removed-from-line',
                'annotations-load',
                'filter-annotations',
                'define',
                'save-phantom',
                'create-note',
                'share-with',
                'resize'
            ]));

        Ext.apply(me, {
            annotations: {},
            filter: null,
            searchAnnotations: null,
            annotationManager: new NextThought.view.annotations.renderer.Manager(reader)
        });

        this.reader.fireEvent('listens-to-page-stores', this, {
            scope: this,
            add: 'storeEventsAdd',
            'paged-in': 'storeEventsAdd',
            remove: 'storeEventsRemove',
            bulkremove: 'storeEventsBulkRemove'
        });

        me.mon(reader, {
            scope: this,
            //added: function(){ FilterManager.registerFilterListener(me, me.applyFilter,me); },
            afterRender: 'insertAnnotationGutter',
            'load-annotations': 'loadAnnotations',
            'clear-annotations': 'clearAnnotations'
        });

        me.mon(me.annotationManager.events, 'finish', function (c) {
            me.fireEvent('rendered', c);
        }, me, {buffer: 500});
    },


    getDocumentElement: function () {
        return this.reader.getDocumentElement();
    },


    onGutterClicked: function (e) {
        var t = e.getTarget('[data-line]', null, true),
            toggle = t && t.hasCls('active'),
            line = !toggle && t && parseInt(t.getAttribute('data-line'), 10);

        this.fireEvent('filter-by-line', line);
        this.gutterEl.select('[data-line]').removeCls('active');
        if (t && !toggle) {
            t.addCls('active');
        }
    },


    storeEventsAdd: function (store, records) {
        console.debug('New records in store, adding to page...', store.cacheMapId || store.containerId, records);
        Ext.each(records, function (r) {
            var cls = r.get('Class');
            if (!this.createAnnotationWidget(cls, r)) {
                console.warn('Apparently this record didn\'t get added', r);
            }
            else {
                console.debug('Added ' + cls, r.getId(), 'w/ body:', r.get('body'));
            }
        }, this);
    },


    storeEventsBulkRemove: function (store, records) {
        Ext.each(records, function (record) {
            this.remove(record.getId());
        }, this);
    },


    storeEventsRemove: function (store, record) {
        this.remove(record.getId());
    },


    insertAnnotationGutter: function () {
        var me = this,
            container = Ext.DomHelper.insertAfter(
                me.reader.getInsertionPoint().first(),
                { cls: 'annotation-gutter', cn: {cls: 'column controls'} },
                true);

        me.gutterEl = container;
        me.reader.on('destroy', 'remove', container);
        me.reader.on('sync-height', 'setHeight', container);
        me.mon(container, 'click', 'onGutterClicked', me);
        me.annotationManager.registerGutter(container, me.reader);
    },


    getManager: function () {
        return this.annotationManager;
    },


    convertRectToScreen: function (r) {
        var iframe = this.reader.getIframe().get(),
            result;

        result = {
            top: r.top + iframe.getY(),
            left: r.left + iframe.getX(),
            right: r.right + iframe.getX(),
            bottom: r.bottom + iframe.getY(),
            height: r.height,
            width: r.width
        };
        return result;
    },


    loadAnnotations: function (containerId, subContainers) {
        this.clearAnnotations();
        this.fireEvent('annotations-load', this.reader, containerId, subContainers);
    },


    objectsLoaded: function (items, bins/*, containerId*/) {
        var me = this;

        me.setAssessedQuestions((bins || {}).AssessedQuestionSet);
        me.buildAnnotations(items);
    },


    applyFilter: function (newFilter) {
        this.filter = newFilter;
        this.clearAnnotations();
        this.fireEvent('filter-annotations', this.reader);
    },


    showSearchHit: function (hit) {
        this.clearSearchHit();
        if (hit.isContent()) {
            this.searchAnnotations = Ext.widget('search-hits', {hit: hit, ps: hit.get('PhraseSearch'), owner: this.reader});
        }
    },


    //generalize this
    //Returns an array of objects with two propertes.  ranges is a list
    //of dom ranges that should be used to position the highlights.
    //key is a string that used to help distinguish the type of content when we calculate the adjustments( top and left ) needed.
    rangesForSearchHits: function (hit) {
        var phrase = hit.get('PhraseSearch'),
        //fragments = hit.get('Fragments'),
            regex, ranges,
            o = this.reader.getComponentOverlay(),
            contentDoc = this.getDocumentElement(), indexedOverlayData, result = [];


        console.log('Getting ranges for search hits');

        //We get ranges from two places, the iframe content
        //and the overlays
        regex = SearchUtils.contentRegexForSearchHit(hit, phrase);
        ranges = TextRangeFinderUtils.findTextRanges(contentDoc, contentDoc, regex);
        result.push({
            ranges: ranges.slice(),
            key: 'content'
        });

        //Now look in assessment overlays
        indexedOverlayData = TextRangeFinderUtils.indexText(o.componentOverlayEl.dom, function (node) {
            return Ext.fly(node).parent('.indexed-content');
        });

        ranges = TextRangeFinderUtils.findTextRanges(o.componentOverlayEl.dom,
            o.componentOverlayEl.dom.ownerDocument,
            regex, undefined, indexedOverlayData);
        result.push({
            ranges: ranges.slice(),
            key: 'assessment'
        });

        return result;
    },


    //	@returns an object with top and left properties used to adjust the
    //  coordinate space of the ranges bounding client rects.
    //  It decides based on the type of container( main content or overlays).
    getRangePositionAdjustments: function (key) {
        var annotationOffsets, overlayXAdjustment, overlayYAdjustment;
        if (key === 'content') {
            return {top: 0, left: 0};
        }

        //For other overlays( i.e assessments )
        annotationOffsets = this.reader.getAnnotationOffsets();
        overlayYAdjustment = -annotationOffsets.top;
        overlayXAdjustment = -annotationOffsets.left;
        return {top: overlayYAdjustment, left: overlayXAdjustment };
    },


    clearSearchHit: function () {
        if (!this.searchAnnotations) {
            return;
        }

        this.searchAnnotations.cleanup();
        this.searchAnnotations = null;
    },


    remove: function (oid) {
        var v = this.annotations[oid];
        if (v) {
            this.annotations[oid] = undefined;
            delete this.annotations[oid];
            v.cleanup();
            this.fireEvent('removed-from-line');
        }
    },


    clearAnnotations: function () {
        var v, oid, leftovers;
        for (oid in this.annotations) {
            if (this.annotations.hasOwnProperty(oid)) {
                v = this.annotations[oid];
                if (!v) {
                    continue;
                }
                v.cleanup(true);
            }
        }

        this.annotations = {};
        this.clearSearchHit();

        //Catchall for existing annotations that did not get removed properly or are left
        //hanging like placeholder notes.
        leftovers = Ext.query('[id*=note-container]');
        if (leftovers && leftovers.length > 0) {
            Ext.each(leftovers, function (l) {
                Ext.fly(l).destroy();
            });
        }

    },


    exists: function (record) {
        var oid = record.getId();
        if (!oid) {
            return false;
        }

        return !!this.annotations[oid];
    },


    getDefinitionMenuItem: function (range) {
        try {

            range = range || this.getSelection();
            if (!range) {
                console.error('No range!');
                return null;
            }
            var me = this,
                boundingBox = me.convertRectToScreen(range.getBoundingClientRect()),
                text = range.toString().trim(),
                result = null;

            //Rangy likes to grab trailing punctuation so strip
            //it here
            text = text.replace(/^[^\w]+|[^\w]+$/g, '');

            if (/^\w+$|^\w+[^\w]+\w+$/i.test(text)) {//it is one or two words
                result = {
                    text: 'Define...',
                    handler: function () {
                        me.fireEvent('define', text, boundingBox, me.reader);
                        me.clearSelection();
                    }
                };
            }

            return result;

        }
        catch (e) {
            console.error(e.message, e.stack);
            return null;
        }
    },


    addAnnotation: function (range, xy) {
        if (!range) {
            console.warn('bad range');
            return;
        }

        var me = this,
            rect2 = RectUtils.getFirstNonBoundingRect(range),
            record = AnnotationUtils.selectionToHighlight(range, null, me.getDocumentElement()),
            menu,
            define,
            offset,
            redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i,
            innerDocOffset;

        if (!record) {
            return;
        }

        //Default container, this should be replaced with the local container.
        record.set('ContainerId', this.reader.getLocation().NTIID);

        //set a flag to prevent NoteOverlay from resolving the line
        this.reader.creatingAnnotation = true;

        menu = Ext.widget('menu', {
            ui: 'nt',
            plain: true,
            showSeparator: false,
            shadow: false,
            frame: false,
            border: false,
            hideMode: 'display',
            closeAction: 'destroy',
            minWidth: 150,
            defaults: {ui: 'nt-annotaion', plain: true }
        });

        define = me.getDefinitionMenuItem(range);
        if (define) {
            menu.add(define);
        }

        menu.add({
            text: 'Save Highlight',
            handler: function () {
                me.fireEvent('save-phantom', record, false);
                me.clearSelection();
            }
        });

        menu.add({
            text: 'Add Note',
            handler: function () {
                me.clearSelection();
                me.fireEvent('create-note', range, rect2, 'plain');
            }
        });


        function redaction(block) {
            return function () {
                me.clearSelection();
                var r = NextThought.model.Redaction.createFromHighlight(record, block);
                try {
                    me.fireEvent('save-phantom', r, true);
                }
                catch (e) {
                    alert('Could not save redaction');
                }
            };
        }


        //TODO - official way of redaction feature enablement:
        //if($AppConfig.service.canRedact()){
        //hack to allow redactions only in legal texts for now...
        if (redactionRegex.test(this.reader.getLocation().NTIID)) {
            //inject other menu items:
            menu.add({
                text: 'Redact Inline',
                handler: redaction(false)
            });

            menu.add({
                text: 'Redact Block',
                handler: redaction(true)
            });
        }

        //on close make sure it get's destroyed.
        menu.on('hide', function () {
            menu.close();
            delete this.reader.creatingAnnotation;
        }, this);


        offset = me.reader.getEl().getXY();
        innerDocOffset = document.getElementsByTagName('iframe')[0].offsetLeft;
        if(!Ext.is.iPad){
            xy[0] += offset[0] + innerDocOffset;
            xy[1] += offset[1];
        }


        if (this.reader.getLocation().NTIID.indexOf('mathcounts') < 0) {
            menu.showAt(xy);
        } else {
            console.debug('hack alert; annotation context menu dilberately hidden in mathcounts content');
        }
        me.selectRange(range);
    },


    /**
     *
     * @param type
     * @param record - annotation record (highlight, note, redaction, etc)
     * @param [browserRange] - optional, if we already have a range from the browser, that can be used instead of resolving it
     *                         from the record
     * @param [onCreated] - Function
     * @return {*}
     */
    createAnnotationWidget: function (type, record, browserRange, onCreated) {
        var oid = record.getId(),
            style = record.get('style'),
            w;

        if (record.get('inReplyTo') || record.parent) {
            return false;
        }

        if (this.exists(record)) {
            console.log('Updating existing annotation?');
            this.annotations[record.getId()].getRecord().fireEvent('updated', record);
            return true;
        }

        try {
            w = Ext.widget(type.toLowerCase(), {browserRange: browserRange, record: record, reader: this.reader});

            if (!oid) {
                oid = type.toUpperCase() + '-TEMP-OID-' + guidGenerator();
                if (this.annotations[oid]) {
                    this.annotations[oid].cleanup();
                    delete this.annotations[oid];
                }
                record.on('updated', function (r) {
                    this.annotations[r.get('NTIID')] = this.annotations[oid];

                    delete this.annotations[oid];
                }, this);

                w.tempId = oid;
            }

            this.annotations[oid] = w;
            Ext.callback(onCreated, w, [w]);
        }
        catch (e) {
            console.error(Globals.getError(e));
        }

        if (w && type === 'redaction') {
            this.fireEvent('resize');
        }
        return Boolean(w);
    },


    setAssessedQuestions: function (sets) {
        if (!sets || sets.length === 0) {
            //do nothing if we have no prior sets
            return;
        }

        var scoreboard = Ext.ComponentQuery.query('assessment-scoreboard')[0];

        if (!scoreboard) {
            console.error('Got prior assessments back but there is no scoreboard to associate with', sets);
            return;
        }

        scoreboard.setPriorResults(sets);
    },


    buildAnnotations: function (list) {
        var me = this;
        Ext.each(list || [], function (r) {
            if (!r) {
                return;
            }
            try {
                me.createAnnotationWidget(r.getModelName(), r);
            }
            catch (e) {
                console.error('Could not build ' + r.getModelName() + ' from record:', r, 'because: ', e, e.stack);
            }

        }, this);
    },


    onContextMenuHandler: function (e) {
        try {
            var origSelection = window.rangy.getSelection(this.getDocumentElement()).toString(),
                range = this.getSelection();

            if (range && !range.collapsed) {
                e.stopPropagation();
                e.preventDefault();
                if (origSelection.length > 0) {
                    this.addAnnotation(range, e.getXY());
                }
            }
        }
        catch (er) {
            console.error('onContextMenuHandler: ' + er.message);
        }
    },


    getSelection: function () {
        var doc = this.getDocumentElement(),
            range, selection, txt;

        Anchors.snapSelectionToWord(doc);

        selection = doc.parentWindow.getSelection();
        txt = selection.toString();

        if (selection.rangeCount > 0 && !(/^\s*$/).test(txt)) {
            range = selection.getRangeAt(0);

            return range;
        }
        console.warn('skipping getSelection() no viable selection', selection);

        return null;
    },


    selectRange: function (range) {
        var s = this.getDocumentElement().parentWindow.getSelection();
        s.removeAllRanges();
        s.addRange(range);
    },


    clearSelection: function () {
        var doc = this.getDocumentElement(),
            win = doc.parentWindow;
        try {
            win.getSelection().removeAllRanges();
        }
        catch (e) {
            console.warn(e.stack || e.toString());
        }
    }
});
