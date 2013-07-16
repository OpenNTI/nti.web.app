Ext.define('NextThought.view.content.reader.TouchHighlight',{

    alias: 'reader.touchHighlight',

    constructor: function(config){
        // Only support touch on iPad devices
        if (!Ext.is.iPad)
            return;

        Ext.apply(this, config);

        this.reader.on('afterrender',function(){
            this.highlightCanvas = Ext.get(document.createElement('div'))
                .addCls('phantomHighlight')
                .setStyle('position', 'absolute')
                .setStyle('width', '200px')
                .setStyle('height', '200px')
                .setStyle('background-color', 'red')
                .setStyle('z-index', '999999')
                .setStyle('pointer-events', 'none');
        },this);
    },

    /**
     *
     * @param x Screen coordinates
     * @param y Screen coordinates
     */
    show: function(x, y) {
        var readerPos = this.reader.getPosition(),
            canvas = this.highlightCanvas;
        x-=readerPos[0];
        y-=readerPos[1];
        canvas.setStyle('left', x+'px');
        canvas.setStyle('top', y+'px');

        canvas.appendTo(this.reader.el);
    },

    hide: function() {
        this.highlightCanvas.remove();
    }

});