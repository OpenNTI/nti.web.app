Ext.define('NextThought.view.content.reader.TouchHandler', {

    alias: 'reader.touchHandler',

    requires: [
        'NextThought.view.content.reader.TouchSender',
        'NextThought.view.content.reader.IFrame',
        'NextThought.view.content.reader.Scroll',
        'NextThought.view.content.reader.TouchHighlight',
        'NextThought.view.content.reader.Annotations'
    ],


    constructor: function(config) {
        // Only support touch on iPad devices
        if (!Ext.is.iPad)
            return;

        Ext.apply(this, config);
        var reader = this.reader;

        reader.on('afterrender', function() {
            reader.getIframe().setClickthrough(true);
            reader.getTouchSender().registerHandler(this);
            this.setupHandlers();
        }, this);
    },

    setupHandlers: function() {
        var reader = this.reader,
            scroll = reader.getScroll(),
            highlight = reader.getTouchHighlight(),
            iFrame = reader.getIframe(),
            annotations = reader.getAnnotations();

    },

    touchStart: function() {
        this.reader.getTouchHighlight().hide();
    },

    // TODO: Setup tap(ele)

    tap: function(ele) {

    },

    // TODO: setup longPress(ele)

    // TODO: setup move(startPos, deltaPos)

    // TODO: setup scroll(ele, deltaY)

    scroll: function(ele, deltaY) {
        var reader = this.reader,
            scroll = reader.getScroll();
        scroll.by(deltaY);
    },

    // TODO: setup select(range)

    // TODO: setup drag(ele, startPos, deltaPos)


    elementIsSelectable: function(ele) {
        if (!ele) return false;
        var tag = ele.tagName,
            tags = ['P', 'A', 'SPAN'];
        return Ext.Array.contains(tags, tag);
    },

    elementIsDraggable: function(ele) {
        if (!ele) return false;
        var obj = Ext.get(ele);
        return obj.hasCls('draggable-area') || obj.up('.draggable-area');
    },

    elementIsScrollable: function(ele) {
        // TODO:
        return true;
    },

    elementAt: function(x, y) {
        return this.reader.getIframe().elementAt(x,y);
    },
    highlight: function(x1,y1,x2,y2) {
        var reader = this.reader,
            highlight = reader.getTouchHighlight(),
            range= this.makeRangeFrom(x1, y1, x2, y2);
        highlight.show(range);
    },

    makeRangeFrom: function(x1, y1, x2, y2) {
        var reader = this.reader,
            iFrame = reader.getIframe();
        return iFrame.makeRangeFrom(x1, y1, x2, y2);
    },

    addAnnotation: function(range, xy) {
        var reader = this.reader,
            annotations = reader.getAnnotations();
        annotations.addAnnotation(range, xy);
    }


});