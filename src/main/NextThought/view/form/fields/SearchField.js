Ext.define('NextThought.view.form.fields.SearchField', {
    extend: 'Ext.form.field.Trigger',

    alias: 'widget.searchfield',

    trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

    trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',

    hasSearch : false,

    initComponent: function(){
        this.addEvents('search', 'cleared-search', 'select-down', 'select-up', 'choose-selection');
        this.callParent(arguments);
        this.on('specialkey', function(f, e){
            //trigger search if enter is pressed, or if down is pressed and there isn't already a search
            //console.debug('key=', e, ' hasSearch=', this.hasSearch);
            if(e.getKey() == e.ESC){
                this.onTrigger1Click();
            }
            else if(!this.hasSearch && (e.getKey() == e.ENTER || e.getKey() == e.DOWN)){
                this.onTrigger2Click();
            }
            else if (e.getKey() == e.DOWN) {
                this.onSelectDown();
            }
            else if (e.getKey() == e.UP) {
                this.onSelectUp();
            }
            else if (e.getKey() == e.ENTER || e.getKey() == e.RIGHT) {
                //someone pressed enter when the search is visable, means navigate to selection
                this.onChooseSelection();
            }
        }, this);
        this.on('change', function(f,n,o){
            this.hasSearch = false;
            this.fireEvent('cleared-search', this);
        }, this);
    },

    afterRender: function(){
        this.callParent(arguments);
        this.triggerEl.item(0).setDisplayed('none');
    },

    onSelectDown: function() {
        this.fireEvent('select-down',this);
    },

    onSelectUp: function() {
        this.fireEvent('select-up', this);
    },

    onChooseSelection: function() {
        this.fireEvent('choose-selection', this);
    },

    onTrigger1Click : function(){
        var me = this;

        if (me.hasSearch) {
            me.setValue('');
            me.hasSearch = false;
            me.triggerEl.item(0).setDisplayed('none');
            me.doComponentLayout();
            me.fireEvent('cleared-search', this);
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
        me.fireEvent('search', me);
    }
});
