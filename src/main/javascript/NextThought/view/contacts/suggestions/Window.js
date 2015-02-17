Ext.define('NextThought.view.contacts.suggestions.Window', {
    extend: 'NextThought.view.window.Window',
    alias: 'widget.suggest-contacts-window',
    requires: [
        'NextThought.view.contacts.suggestions.Main'
    ],

    cls: 'suggest-window',
    ui: 'nt-window',
    minimizable: false,
    constrain: true,
    modal: true,
    closable: true,
    resizable: false,
    dialog: true,
    closeAction: 'destroy',

    width: 720,

    childEls: ['body'],
    getTargetEl: function() {
        return this.body;
    },

    componentLayout: 'natural',
    layout: 'auto',


    getDockedItems: function() {
        return [];
    },

    renderTpl: Ext.DomHelper.markup([
        {cls: 'header', cn: [
            {cls: 'title', html: '{{{NextThought.view.contacts.suggestions.window.title}}}'}
        ]},
        {id: '{id}-body', cls: 'container-body scrollable', html: '{%this.renderContainer(out,values)%}'},
        {cls: 'footer', cn: [
            {tag: 'a', cls: 'button confirm', role: 'button', html: 'Add Contacts'},
            {tag: 'a', cls: 'button cancel', role: 'button', html: 'Cancel'}
        ]}
    ]),


    renderSelectors:{
        cancelEl: ".footer .cancel",
        confirmEl: ".footer .confirm"
    },


    items:[],


    initComponent: function(){
        this.callParent(arguments);
        this.add({xtype: 'suggest-contacts-view', ownerCt: this, suggestedContactStore: this.store});
    },


    afterRender: function(){
        this.callParent(arguments);

        this.mon(this.cancelEl, 'click', 'close', this);
        this.mon(this.confirmEl, 'click', 'addContactsAndClose', this);
    },


    addContactsAndClose: function(e){
        var view = this.down('suggest-contacts-view'), me = this;

        function finish(){
            me.close();
        }

        if(view.addAllContacts){
            view.addAllContacts(finish);
        }
    },


    updateContactsCount: function(count){
        if(count > 0){
            this.confirmEl.setHTML("Add "+ count + " Contacts");
        }
        else{
            // FIXME: should we disable the button instead?
            this.confirmEl.setHTML("Done");
        }
    }
});