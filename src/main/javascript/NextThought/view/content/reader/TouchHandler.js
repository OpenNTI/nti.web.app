Ext.define('NextThought.view.content.reader.TouchHandler', {

    alias: 'reader.touchHandler',

    requires: [
        'NextThought.modules.TouchSender',
        'NextThought.view.content.reader.IFrame',
        'NextThought.view.content.reader.Scroll',
        'NextThought.view.content.reader.TouchHighlight',
        'NextThought.view.content.reader.Annotations'
    ],


    constructor: function(config) {
        // Only support touch on iPad devices
        if (!Ext.is.iPad){
            return;
        }

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

        reader.on('touchStart', function(pageX, pageY) {
            highlight.hide();
        });
        reader.on('touchMove', function(startX, startY, endX, endY) {
            // move specific logic
        });
        reader.on('touchEnd', function(pageX, pageY) {
           // end specific logic
        });
        reader.on('touchLongPress', function(ele, pageX, pageY) {
            // Long press specific logic
        });
        reader.on('touchTap', function(ele) {
            // Tap specific logic
        });

        reader.on('touchDrag', function(ele, pageX, pageY) {
            // Drag specific logic
        });
        reader.on('touchDrop', function(ele, pageX, pageY) {
           // Drop specific logic
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

        // @note Only have one of the following listeners
        // per sender use the callback

        reader.on('touchElementAt', function(x,y, callback) {
            callback(iFrame.elementAt(x,y));
        });

        reader.on('touchElementIsDraggable', function(ele, callback) {
            if (!ele) {callback(false);}
            var obj = Ext.get(ele);
            callback(obj.hasCls('draggable-area') || obj.up('.draggable-area'));
        });

        reader.on('touchElementIsSelectable', function(ele, callback) {
            if (!ele) {callback(false);}
            var tag = ele.tagName,
                tags = ['P', 'A', 'SPAN'];
            callback(Ext.Array.contains(tags, tag));
        });

        reader.on('touchElementIsScrollable', function(ele, callback) {
            callback(true);
        });

        reader.on('touchMakeRangeFrom', function(x1, y1, x2, y2, callback) {
            callback(makeRangeFrom(x1,y1,x2,y2));
        });

        function makeRangeFrom(x1, y1, x2, y2) {
            return iFrame.makeRangeFrom(x1, y1, x2, y2);
        }
    }

});