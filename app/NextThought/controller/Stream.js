Ext.define('NextThought.controller.Stream', {
    extend: 'Ext.app.Controller',

	views: [
        'modes.Stream',
        'content.Stream'
    ],

    refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        },{
            ref: 'streamPeople',
            selector: 'stream-mode-container people-list'
        },{
            ref: 'stream',
            selector: 'stream-mode-container stream-panel'
        }
    ],

    init: function() {
        this.control({
            'stream-mode-container filter-control':{
                'filter-changed': this.streamFilterChanged
            }
        });
    },

    streamFilterChanged: function(newFilter){
        var o = [
            this.getStream(),
            this.getStreamPeople()
        ];

        Ext.each(o,function(i){i.applyFilter(newFilter);});
    }

});