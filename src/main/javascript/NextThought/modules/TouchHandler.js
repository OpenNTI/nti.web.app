Ext.define('NextThought.modules.TouchHandler', {

    alias: 'modules.touchHandler',

    requires: [
        'NextThought.modules.TouchSender'
    ],

    constructor: function(config) {
        // Only support touch on iPad devices
        if (!Ext.is.iPad){
            return;
        }

        Ext.apply(this, config);

        this.container.on('afterrender', function() {
            this.setupHandlers();
        }, this);
    },

    setupHandlers: function() {
        var container = this.container,
            initialY = false;

        container.on('touchStart', function(pageX, pageY) {
            // touch start specific logic
        });
        container.on('touchMove', function(startX, startY, endX, endY) {
            // move specific logic
        });
        container.on('touchEnd', function(pageX, pageY) {
            // end specific logic
        });
        container.on('touchTap', this.clickElement);
        container.on('touchLongPress', function(ele, pageX, pageY) {
            // Long press specific logic
        });
        container.on('touchDrag', function(ele, pageX, pageY) {
            // Drag specific logic
        });
        container.on('touchDrop', function(ele, pageX, pageY) {
            // Drop specific logic
        });
        container.on('touchScroll', function(ele, deltaY) {
            initialY = this.scroll(ele, deltaY, initialY);
        }, this);
        container.on('touchHighlight', function(x1, y1, x2, y2) {
            // Highlight specific logic
        });
        container.on('touchAddAnnotation', function(range, xy) {
            // annotation specific logic
        });


        // @note Only have one of the following listeners
        // per sender use the callback

        container.on('touchElementAt', this.elementAt);
        container.on('touchElementIsScrollable', this.elementIsAlwaysScrollable);
        container.on('touchElementIsDraggable', this.draggableAreasAreDraggable);
        container.on('touchElementIsSelectable', function(ele, callback) {
            // Selectable specific logic
        });
        container.on('touchMakeRangeFrom', function(x1, y1, x2, y2, callback) {
            // range specific logic
        });
    },

    /**
     *
     * @param ele
     * @param deltaY
     * @param initialY
     * @returns initialY Used in case the initialY changes (especially on the
     *          first run when it starts as false)
     */
    scroll: function(ele, deltaY, initialY) {
        var panel = this.getPanel(),
            currentY = panel.getY(),
            newY = currentY - deltaY,
            containerHeight = panel.getHeight(),
            parentHeight = panel.parent().getHeight(),
            minY;

        if (containerHeight <= parentHeight) {
            panel.setY(initialY, false);
            return initialY;
        }

        if (initialY === false){
            initialY = currentY;
        }

        minY  = initialY-(containerHeight-parentHeight);

        // Clamp scroll
        if(newY < minY){
            newY = minY;
        }
        else if (newY > initialY){
            newY = initialY;
        }
        panel.setY(newY, false);
        return initialY;
    },

    getPanel: function() {
        return this.container.getEl()
                             .parent()
                             .parent();
    },

    elementAt: function(x, y, callback) {
        var element = Ext.getDoc().dom.elementFromPoint(x, y);
        callback(element);
    },

    elementIsAlwaysScrollable: function(ele, callback) {
        callback(true);
    },

    clickElement: function(ele) {
        function shouldSelectAllOnTap() {
            return ele && ele.tagName === 'INPUT';
        }

        // Send click/select event to the tapped element
        // Some input elements need a workaround to select
        // the entire thing.
        if (shouldSelectAllOnTap()){
            ele.setSelectionRange(0,1000);
        }
        else{
            ele.click();
        }
    },

    draggableAreasAreDraggable: function(ele, callback) {
        if (!ele) {callback(false);}
        var obj = Ext.get(ele);
        callback(obj.hasCls('draggable-area') || obj.up('.draggable-area'));
    }
});