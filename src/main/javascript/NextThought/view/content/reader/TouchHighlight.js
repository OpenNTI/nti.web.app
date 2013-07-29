Ext.define('NextThought.view.content.reader.TouchHighlight',{

    alias: 'reader.touchHighlight',

    requires: [
        'NextThought.view.content.reader.Annotations'
    ],

    /**
     * Handles highlighting selected text
     * @param config
     */
    constructor: function(config){
        // Only support touch on iPad devices
        if (!Ext.is.iPad){
            return;
        }

        Ext.apply(this, config);

        this.reader.on('afterrender',function(){
            var canvas = document.createElement('canvas');
            this.highlightCanvas = Ext.get(canvas)
                .addCls('phantomHighlight')
                .setStyle('position', 'absolute')
                .setStyle('pointer-events', 'none');
            this.hide();
            this.highlightCanvas.appendTo(this.reader.el);
        },this);

        this.reader.on('save-phantom', function() {
            this.hide();
        }, this);

        this.reader.on('create-note', function() {
            this.hide();
        }, this);
    },

    show: function(range) {

        var canvas = this.highlightCanvas,
            scrollY = this.reader.getScroll().top(),
            bounds = range.getBoundingClientRect(),
            top = Math.ceil(bounds.top)-scrollY,
            left = Math.ceil(bounds.left),
            width = Math.ceil(bounds.width),
            height = Math.ceil(bounds.height);

        //console.log('l:'+bounds.left+' t:'+bounds.top+' r:'+bounds.right+' b:'+bounds.bottom+' w:'+bounds.width+' h:'+bounds.height);

        canvas.setStyle('left', left+'px');
        canvas.setStyle('top', top+'px');
        canvas.setStyle('width', width+'px');
        canvas.setStyle('height', height+'px');

        canvas.dom.setAttribute('width', width);
        canvas.dom.setAttribute('height', height);

        AnnotationUtils.drawCanvas(canvas.dom, null, range, 'rgba(212,212,212,0.6)', [0,0]);
        canvas.show();
    },

    hide: function() {
        this.highlightCanvas.hide();
    }

});