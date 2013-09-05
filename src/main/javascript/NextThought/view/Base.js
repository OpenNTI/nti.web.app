Ext.define('NextThought.view.Base', {
    extend: 'Ext.container.Container',
    alias: 'widget.view-container',
    layout: 'fit',


    initComponent: function () {
        this.enableBubble('before-activate-view', 'activate-view', 'new-background');
        this.callParent(arguments);
        this.addCls('main-view-container make-white');
    },


    setTitle: function (newTitle) {
        this.title = newTitle || this.title;
        if (this.isActive()) {
            document.title = this.title || 'NextThought';
        }
    },


    getFragment: function () {
        return null;
    },


    isActive: function () {
        return this.ownerCt ? (this.ownerCt.getLayout().getActiveItem() === this) : false;
    },


    beforeRestore: function () {
        return true;
    },


    activate: function (silent) {
        if (this.fireEvent('before-activate-view', this.getId())) {
            this.fireEvent('activate-view', this.getId(), Boolean(silent));
            this.setTitle();
            this.updateBackground();
            return true;
        }
        return false;
    },


    relayout: function () {
        this.updateLayout();
    },


    updateBackground: function () {
        this.fireEvent('new-background', this.backgroundUrl);
    }
});
