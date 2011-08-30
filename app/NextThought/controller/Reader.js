Ext.define('NextThought.controller.Reader', {
    extend: 'Ext.app.Controller',

    views: [
        'modes.Container',
        'modes.Reader',
        'navigation.Breadcrumb',
        'content.Reader',
        'widgets.PeopleList',
        'widgets.RelatedItemsList',
        'widgets.MiniStreamList',
        'widgets.Tracker'
    ],

    refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        },{
            ref: 'reader',
            selector: 'reader-panel'
        },{
            ref: 'readerBreadcrumb',
            selector: 'reader-mode-container breadcrumbbar'
        },{
            ref: 'readerPeople',
            selector: 'reader-mode-container people-list'
        },{
            ref: 'readerRelated',
            selector: 'reader-mode-container related-items'
        },{
            ref: 'readerStream',
            selector: 'reader-mode-container mini-stream'
        }
    ],

    init: function() {
        this.control({
            'master-view':{
                'navigate': this.navigate
            },

            'breadcrumbbar':{
                'navigate': this.navigate
            },

            'reader-panel':{
                'navigate': this.navigate,
                'location-changed': this.readerLocationChanged,
                'publish-contributors': this.readerPublishedContributors
            },

            'reader-mode-container related-items':{
                'navigate': this.navigate
            },

            'reader-mode-container filter-control':{
                'filter-changed': this.readerFilterChanged
            }
        });
    },


    navigate: function(book, ref){
        this.getReader().setActive(book, ref);
    },


    readerLocationChanged: function(id){
        this.getReaderStream().setContainer(id);
        this.getReaderRelated().setLocation(
            this.getReaderBreadcrumb().getLocation());
    },


    readerPublishedContributors: function(c){
        var t = this.getReaderPeople(),
            b = Ext.Function.createBuffered(t.setContributors,100,t,[c]);

        for(k in c){
            if(c.hasOwnProperty(k))
                UserDataLoader.resolveUser(k,b);
        }

        b();
    },


    readerFilterChanged: function(newFilter){
        var o = [
            this.getReader(),
            this.getReaderPeople(),
            this.getReaderRelated(),
            this.getReaderStream()
        ];

        Ext.each(o,function(i){i.applyFilter(newFilter);});
    }
});