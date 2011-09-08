Ext.define('NextThought.view.windows.VideoWindow', {
	extend: 'Ext.window.Window',
	alias: 'widget.video-window',
    requires: [
			'NextThought.view.widgets.VideoPanel'
			],

    /*
        src:
        [
            // firefox (ogg theora)
            {
                src : 'http://xant.us/files/google_main.ogv',
                type: 'video/ogg'
            },
            // chrome and webkit-nightly (h.264)
            {
                src : 'http://xant.us/files/google_main.mgv',
                type: 'video/mp4'
            }
        ]
     */

    constructor: function(config){
        if(!config || !config.src || !Ext.isArray(config.src)){
            throw 'you must supply a src array';
        }

        config = Ext.applyIf(config, {
            animCollapse   : false,
            constrainHeader: true,
            title  : 'Video Window',
            width  : 740,
            height : 480,
            shim   : false,
            border : false,
            layout : 'fit'
        });

        config.items = [{
            xtype: 'video',
            src: config.src,
            autobuffer: true,
            autoplay : true,
            controls : true
        }];

        this.callParent([config]);
    }

});