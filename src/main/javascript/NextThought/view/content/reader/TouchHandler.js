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
            this.setupHandlers();
        }, this);
    },

    setupHandlers: function() {
        var reader = this.reader,
            scroll = reader.getScroll(),
            highlight = reader.getTouchHighlight(),
            iFrame = reader.getIframe(),
            annotations = reader.getAnnotations();
        reader.on('touchStart', function() {
            highlight.hide();
        });

        reader.on('touchTap', function(ele) {
            // Tap specific logic
            // TODO: add fire event
        });

        reader.on('touchLongPress', function(ele) {
            // Long press specific logic
            // TODO: add fire event
        });

        reader.on('touchMove', function(startPos, deltaPos) {
            // move specific logic
            // TODO: add fire event
        });

        // TODO: setup drag(ele, startPos, deltaPos)

        // @note Only have one of the following listeners per sender

        reader.on('touchElementAt', function(x,y, callback) {
            // move specific logic
            // TODO: add fire event
            callback(iFrame.elementAt(x,y));
        });

        reader.on('touchElementIsDraggable', function(ele, callback) {
            if (!ele) callback(false);
            var obj = Ext.get(ele);
            callback(obj.hasCls('draggable-area') || obj.up('.draggable-area'));
        });

        reader.on('touchElementIsSelectable', function(ele, callback) {
            if (!ele) callback(false);
            var tag = ele.tagName,
                tags = ['P', 'A', 'SPAN'];
            callback(Ext.Array.contains(tags, tag));
        });

        reader.on('touchElementIsScrollable', function(ele, callback) {
            // TODO: add fire event
            callback(true);
        });

        reader.on('touchScroll', function(ele, deltaY) {
            scroll.by(deltaY);
        });

        reader.on('touchHighlight', function(x1, y1, x2, y2) {
            var range = makeRangeFrom(x1, y1, x2, y2);
            highlight.show(range);
        });

        reader.on('touchAddAnnotation', function(range, xy) {
            annotations.addAnnotation(range, xy);
        });

        reader.on('touchMakeRangeFrom', function(x1, y1, x2, y2, callback) {
            callback(makeRangeFrom(x1,y1,x2,y2));
        });

        function makeRangeFrom(x1, y1, x2, y2) {
            return iFrame.makeRangeFrom(x1, y1, x2, y2);
        }
    }

});