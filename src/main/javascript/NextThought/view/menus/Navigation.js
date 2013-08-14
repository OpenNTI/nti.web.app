Ext.define('NextThought.view.menus.Navigation', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.navigation-menu',

    ui: 'navigation-menu',

    defaultAlign: 'r-l?',

    layout: 'auto',
    overflowX: 'hidden',
    overflowY: 'scroll',

    ignoreParentClicks: true,
    plain: true,
    showSeparator: false,
    shadow: false,
    frame: false,
    border: false,
    hideMode: 'display',

    initComponent: function () {
        this.callParent(arguments);
        Ext.EventManager.onWindowResize(this.viewportMonitor, this);
        if (Ext.is.iPad) { // Don't need/want the other handlers on iPad
            this.on({
                show: 'viewportMonitor'
            });
        }
        else { // Not iPad
            // set up other handlers for closing:
            this.on({
                select: 'hide',
                mouseleave: 'startHide',
                mouseenter: 'cancelDeferHide',
                show: 'viewportMonitor'
            });
        }
    },

    hide: function () {
        this.cancelDeferHide();
        return this.callParent(arguments);
    },


    startHide: function (menu, event) {
        this.cancelDeferHide();
        if (Ext.is.iPad) {
            // If search nav-item clicked while search menu open, needs to hide search menu *after* show is processed
            // Also want it to close quickly/responsively so that's why not 500
            this.leaveTimer = Ext.defer(this.hide, 100, this);
        }
        else {
            this.leaveTimer = Ext.defer(this.hide, 500, this);
        }
    },

    //menus call this on mouseover to their parent menuitems...so we named it to match.
    cancelDeferHide: function () {
        clearTimeout(this.leaveTimer);
    },


    destroy: function () {
        this.callParent(arguments);
        Ext.EventManager.removeResizeListener(this.viewportMonitor, this);
    },


    viewportMonitor: function () {
        var main = Ext.getCmp("view"),
            el = main && main.el;

        this.setHeight(el && el.getHeight());
        this.setWidth(el && el.getWidth());

        // No timeout on iPad
//        if (Ext.is.iPad) {
//            clearTimeout(this.leaveTimer);
//        }
    },


    showBy: function (cmp) {
        this.callParent([cmp, this.defaultAlign]);
    },

    //override this so as not to mess up scrolling that menus do by default.
    setActiveItem: Ext.emptyFn

});
