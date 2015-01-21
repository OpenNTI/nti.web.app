Ext.define('NextThought.view.slidedeck.media.Container',{
    extend: 'Ext.container.Container',
    alias: 'widget.media-container',
    requires: [
        'NextThought.view.slidedeck.media.GridView',
        'NextThought.view.slidedeck.media.Toolbar',
        'NextThought.view.slidedeck.media.viewers.TranscriptViewer',
        'NextThought.view.slidedeck.media.viewers.SplitViewer',
        'NextThought.view.slidedeck.media.viewers.VideoViewer'
    ],

    ui: 'media',
    floating: true,
    layout: 'card',


    onAdd: function(item) {
        this.getLayout().setActiveItem(item);
    },

    renderTpl: Ext.DomHelper.markup([
        {cls: 'header'},
        {id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
    ]),


    renderSelectors: {
        headerEl: '.header'
    },


    viewerXtypeMap: {
        'video-focus': "media-split-viewer",
        'transcript-focus': 'media-transcript-viewer',
        'full-video': 'media-video-viewer'
    },

    viewerIdMap: {},

    getStorageManager: function () {
        return TemporaryStorage;
    },


    initComponent: function() {
        this.callParent(arguments);

        if (!Ext.isEmpty(this.startAtMillis)) {
            this.on('media-viewer-ready', Ext.bind(this.startAtSpecificTime, this, [this.startAtMillis]), this);
        }

        if (!Ext.getBody().hasCls('media-viewer-open')) {
            Ext.getBody().mask('Loading...');
            this.animateIn();//will listen to afterRender
        } else {
            this.on('afterrender', Ext.bind(this.fireEvent, this, ['animation-end']), null, {single: true, buffered: 1000});
        }

        keyMap = new Ext.util.KeyMap({
            target: document,
            binding: [{
                key: Ext.EventObject.ESC,
                fn: this.exitViewer,
                scope: this
            }]
        });

        this.on('destroy', function() {keyMap.destroy(false);});
    },


    afterRender: function(){
        this.callParent(arguments);

        var playerType = this.getStorageManager().get('media-viewer-player-type') || 'video-focus';
        this.toolbar = Ext.widget({
            xtype: 'media-toolbar',
            renderTo: this.headerEl,
            currentType: playerType,
            video: this.video,
            floatParent: this,
            noTranscript: !this.transcript
        });

        this.identity = Ext.widget({
            xtype: 'identity',
            renderTo: this.toolbar.getEl(),
            floatParent: this.toolbar
        });

        this.gridView = this.add({
            xtype: 'media-grid-view',
            source: this.video,
            currentBundle: this.currentBundle
        });

        this.buildInitialViewer();

        this.on('destroy', 'destroy', this.toolbar);
        this.on('destroy', 'destroy', this.gridView);
        this.on('destroy', 'destroy', this.identity);
        this.on('exit-viewer', 'exitViewer', this);
        this.on('destroy', 'cleanup', this);

        this.mon(this.gridView, {
            'hide-grid': {fn: 'showGridPicker', scope: this.toolbar},
            'store-set': 'listStoreSet'
        });

        this.mon(this.toolbar, {
            'switch-video-viewer': 'switchVideoViewer',
            'hide-grid-viewer': 'hideGridViewer',
            'show-grid-viewer': 'showGridViewer'
        });

        Ext.EventManager.onWindowResize(this.adjustOnResize, this, {buffer: 250});

        this.adjustOnResize();
    },


    buildInitialViewer: function(){
        var playerType = this.getStorageManager().get('media-viewer-player-type') || 'video-focus',
            viewerType = this.viewerXtypeMap[playerType];

        this.viewer = this.add({
            xtype: this.viewerXtypeMap[playerType],
            transcript: this.transcript,
            record: this.record,
            accountForScrollbars: false,
            scrollToId: this.scrollToId,
            video: this.video,
            viewerContainer: this
        });

        this.viewerIdMap[viewerType] = this.viewer.getId();
        this.mon(this.viewer, 'media-viewer-ready', 'adjustOnResize', this);
    },


    cleanup: function () {
        Ext.getBody().removeCls('media-viewer-open media-viewer-closing');
        Ext.EventManager.removeResizeListener(this.adjustOnResize, this);
    },


    animateIn: function() {
        var me = this;
        if (!this.rendered) {
            this.on('afterrender', 'animateIn', this, {buffer: 300});
            return;
        }

        Ext.getBody().addCls('media-viewer-open');
        this.addCls('ready');
        this.el.setStyle('visibility', 'visible');
        Ext.getBody().unmask();
        //TODO use the animationend event for the browsers that support it
        Ext.defer(this.fireEvent, 1100, this, ['animation-end']);
    },


    adjustOnResize: function(){
        var toolbarHeight = this.toolbar.el && this.toolbar.getHeight() || 0,
            availableHeight, paddingHeight = 30, availableWidth,
            activeItem = this.getLayout().getActiveItem();

        if(activeItem && activeItem.adjustOnResize){
            availableHeight = Ext.Element.getViewportHeight() - toolbarHeight - paddingHeight;
            availableWidth = Ext.Element.getViewportWidth();

            activeItem.adjustOnResize(availableHeight, availableWidth);
        }
    },


    exitViewer: function() {
        console.log('about to exit the video viewer');

        if(!this.viewer.beforeExitViewer()){
            return;
        }

        Ext.getBody().removeCls('media-viewer-open').addCls('media-viewer-closing');
        this.removeCls('ready');
        this.addCls('closing');

        this.fireEvent('exited');

        Ext.defer(this.destroy, 1100, this);
        Ext.defer(this.fireEvent, 1100, this, ['exited', this]);
    },


    listStoreSet: function(store) {
        if (!store) { return; }
        var me = this, index = store.indexOf(this.video);

        function isHeader(video) {
            return video && video.get('sources') && video.get('sources').length === 0;
        }

        function getPrevFromIndex(i) {
            var prev;

            if ((i - 1) >= 0) {
                prev = store.getAt(i - 1);
            }

            if (isHeader(prev)) {
                prev = getPrevFromIndex(i - 1);
            }

            return prev;
        }

        function getNextFromIndex(i) {
            var next;

            if ((i + 1) < store.getCount()) {
                next = store.getAt(i + 1);
            }

            if (isHeader(next)) {
                next = getNextFromIndex(i + 1);
            }

            return next;
        }

        this.prevVideo = getPrevFromIndex(index);
        this.nextVideo = getNextFromIndex(index);

        if (this.viewer && this.viewer.videoplayer) {
            this.viewer.videoplayer.setPrev(this.prevVideo);
            this.viewer.videoplayer.setNext(this.nextVideo);
        }
    },


    switchVideoViewer: function(type){
        if(!type || type === (this.viewer && this.viewer.viewerType)){ return; }

        var me = this,
            viewerXType = this.viewerXtypeMap[type],
            targetViewerId = this.viewerIdMap[viewerXType],
            targetViewer = targetViewerId && Ext.getCmp(targetViewerId);

        console.debug("Should switch video viewer to: " + type);
        console.debug("Current Video viewer is : " + (this.viewer && this.viewer.viewerType));

        if(this.viewer && (this.viewer.beforeDeactivate() === false)){
            console.log("Cannot switch viewer because the current view refuses to deactivate.");
            return false;
        }

        //store the current type so we can retrieve it later
        me.getStorageManager().set('media-viewer-player-type', type);

        if(!targetViewer){
            this.viewer = this.add({
                xtype: viewerXType,
                transcript: this.transcript,
                record: this.record,
                accountForScrollbars: false,
                scrollToId: this.scrollToId,
                video: this.video,
                viewerContainer: this
            });

            this.viewerIdMap[viewerXType] = this.viewer.getId();
        }
        else{
            this.viewer = targetViewer;
            this.getLayout().setActiveItem(this.viewer);
        }

        Ext.defer(this.fireEvent, 1000, this, ['animation-end']);
    },


    hideGridViewer: function() {
        this.el.setStyle('overflowY', 'hidden');
        this.getLayout().setActiveItem(this.viewer);
    },


    showGridViewer: function() {
        this.getLayout().setActiveItem(this.gridView);
        this.el.setStyle('overflowY', 'auto');
        this.gridView.refresh();
        Ext.defer(this.adjustOnResize, 1000, this);
    }

});