/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
    extend: 'Ext.app.Controller',

    requires: [
        'NextThought.cache.AbstractStorage'
    ],

    models: [
        'PageInfo',
        'course.navigation.Node'
    ],


    stores: [
        'course.Navigation'
    ],


    views: [
        'cards.Card',
        'content.Navigation',
        'content.Pager',
        'content.PageWidgets',
        'content.Reader',
        'content.Toolbar'
    ],


    refs: [
        {ref: 'mainNav', selector: 'main-navigation'},
        {ref: 'contentView', selector: 'content-view-container'},
        {ref: 'contentNavigation', selector: 'content-view-container content-toolbar content-navigation'},
        {ref: 'contentPager', selector: 'content-view-container content-toolbar content-pager'},
        {ref: 'contentPageWidgets', selector: 'content-view-container content-page-widgets'},
        {ref: 'contentReader', selector: 'content-view-container reader-content'}
    ],


    init: function () {
        this.listen({
            controller: {
                '*': {
                    'set-location': 'setLocation',
                    'set-last-location-or-root': 'setLastLocation',
                    'bookmark-loaded': 'onBookmark'
                }
            },
            store: {
                '*': {
                    'bookmark-loaded': 'onBookmark'
                }
            },
            component: {
                '*': {
                    'set-location': 'setLocation',
                    'set-last-location-or-root': 'setLastLocation',
                    'suspend-annotation-manager': 'suspendManager',
                    'resume-annotation-manager': 'resumeManager'
                },
                'content-view-container reader-content': {
                    'beforeNavigate': 'beforeSetLocation',
                    'navigateCanceled': 'resetNavigationMenuBar',
                    'set-content': 'updateControls',
                    'page-previous': 'goPagePrevious',
                    'page-next': 'goPageNext'
                },
                'content-card': {
                    'show-target': 'showCardTarget'
                },

                'note-window': {
                    'before-new-note-viewer': 'maybeSwitchContentSubTabs'
                }
            }
        });
    },


    resumeManager: function () {
        var reader = this.getContentReader();
        reader.getAnnotations().getManager().resume();
    },


    suspendManager: function () {
        var reader = this.getContentReader();
        reader.getAnnotations().getManager().suspend();
    },


    beforeSetLocation: function () {
        var canNav = true,
        //todo: lets not use query!
            n = Ext.ComponentQuery.query('note-window') || [];

        try {
            Ext.each(n, function (note) {
                note.closeOrDie();
            });
        }
        catch (e) {
            canNav = false;
        }

        return canNav;
    },


    resetNavigationMenuBar: function (ntiidCancled, isCurrent, fromHistory) {
        if (!isCurrent && !fromHistory) {
            console.debug('reset?', arguments);
            this.getMainNav().updateCurrent(true);
        }
    },


    setLocation: function () {
        var r = this.getContentReader();

        if (this.fireEvent('show-view', 'content', true) === false) {
            return;
        }

        if (!r.ntiidOnFrameReady) {
            r.setLocation.apply(r, arguments);
        }
        else {
            r.ntiidOnFrameReady = Array.prototype.slice.call(arguments);
        }
    },


    setLastLocation: function (ntiid, callback, silent) {
        var lastNtiid = PersistentStorage.getProperty('last-location-map', ntiid, ntiid);
        if (!ParseUtils.isNTIID(lastNtiid)) {
            lastNtiid = ntiid;
        }


        function call(a, errorDetails) {
            var error = (errorDetails || {}).error;
            if (error && error.status !== undefined && Ext.Ajax.isHTTPErrorCode(error.status)) {
                PersistentStorage.removeProperty('last-location-map', ntiid);
            }

            if (Ext.isFunction(callback)) {
                Ext.callback(callback, null, [ntiid, a, error]);
            }
        }

        this.setLocation(lastNtiid, call, silent === true);
    },


    goPagePrevious: function () {
        this.getContentPager().goPrev();
    },


    goPageNext: function () {
        this.getContentPager().goNext();
    },


    showCardTarget: function (card, data, silent, callback) {
        var reader = card.up('reader-content') || ReaderPanel.get(),//for now, lets just get the default reader.
            ntiid = data.ntiid,
            postfix = data.notTarget ? '' : '-target',
            DH = Ext.DomHelper,
            s = encodeURIComponent('Pages(' + ntiid + ')'),
            u = encodeURIComponent($AppConfig.username),
        //Hack...
            pi = this.getPageInfoModel().create({
                ID: ntiid,
                NTIID: ntiid,
                content: DH.markup([
                    {tag: 'head', cn: [
                        {tag: 'title', html: data.title},
                        {tag: 'meta', name: 'icon', content: data.thumbnail}
                    ]},
                    {tag: 'body', cn: {
                        cls: 'page-contents no-padding',
                        cn: Ext.applyIf({
                            tag: 'object',
                            cls: 'nticard' + postfix,
                            type: 'application/vnd.nextthought.nticard' + postfix,
                            'data-ntiid': ntiid,
                            html: DH.markup([
                                {tag: 'img', src: data.thumbnail},
                                {tag: 'span', cls: 'description', html: data.description}
                            ])
                        }, data.asDomSpec())
                    }}
                ]),
                Links: [
                    {
                        Class: 'Link',
                        href: '/dataserver2/users/' + u + '/' + s + '/UserGeneratedData',
                        rel: 'UserGeneratedData'
                    }
                ]
            });

        pi.contentOrig = reader.getLocation().NTIID;
        pi.hideControls = true;

        reader.setLocation(pi, callback, !!silent);
    },


    onBookmark: function (rec) {
        try {
            this.getContentPageWidgets().onBookmark(rec);
        }
        catch (e) {
            console.error(e.stack || e.message);
        }
    },


    updateControls: function (reader, doc, assesments, pageInfo) {
        var fn = (pageInfo && pageInfo.hideControls) ? 'hideControls' : 'showControls',
            pg = this.getContentPager(),
        //todo: stop using query
            lm = Ext.ComponentQuery.query('library-collection'),
            pw = this.getContentPageWidgets(),
            origin = pageInfo && pageInfo.contentOrig,
            t = pageInfo && pageInfo.get('NTIID');

        pg[fn]();
        pw[fn]();

        pw.clearBookmark();
        pg.updateState(t);
        Ext.each(lm, function (m) {
            m.updateSelection(t, true, true);
        });

        //If there is no origin, we treat this as normal. (Read the location from the location provder) The origin is
        // to direct the navbar to use the origins' id instead of the current one (because we know th current one will
        // not resolve from our library... its a card)
        this.getContentNavigation().updateLocation(origin || t);
    },


    maybeSwitchContentSubTabs: function (viwer, ownerCmp) {
        var view = this.getContentView(),
            subView;
        if (ownerCmp !== this.getContentReader()) {
            //this event doen't concern us.
            return true;
        }

        if (this.fireEvent('show-view', 'content', true) === false) {
            return false;
        }

        subView = view.down('course-book');
        view.setActiveTab(subView);
    }

});
