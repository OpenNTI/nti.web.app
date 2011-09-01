Ext.define('NextThought.view.form.SearchField', {
    extend: 'Ext.form.field.Trigger',

    alias: 'widget.searchfield',

    trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

    trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',

    hasSearch : false,

    initComponent: function(){
        this.addEvents('search', 'cleared-search');
        this.callParent(arguments);
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },

    afterRender: function(){
        this.callParent();
        this.triggerEl.item(0).setDisplayed('none');
    },

    onTrigger1Click : function(){
        var me = this;

        if (me.hasSearch) {
            me.setValue('');
            me.hasSearch = false;
            me.triggerEl.item(0).setDisplayed('none');
            me.doComponentLayout();
            me.fireEvent('cleared-search');
        }
    },

    onTrigger2Click : function(){
        var me = this,
            value = me.getValue();

        if (value.length < 1) {
            me.onTrigger1Click();
            return;
        }
        me.hasSearch = true;
        me.triggerEl.item(0).setDisplayed('block');
        me.doComponentLayout();
        me.fireEvent('search', me, value);
    }
});