Ext.define('NextThought.view.form.ShareWithField', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sharewith',
    mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    requires: [
        'NextThought.proxy.UserDataLoader',
        'NextThought.view.form.UserSearchInputField',
        'NextThought.view.form.util.Token'
    ],

    layout: 'anchor',
    defaults: {anchor: '100%'},
    items: [
        {//contain the tokens
            cls: 'share-with-selected-tokens',
            layout: 'auto',
            border: false,
            margin: '0 0 5px 0'
        },{
            xtype: 'usersearchinput',
            emptyText: 'Share with...',
            allowBlank: true,
            multiSelect: false,
            enableKeyEvents: true
        }
    ],

    initComponent: function(){
        this.callParent(arguments);
        this._selections = [];
        this.initField();

        var b = this.down('usersearchinput');
        b.on('select', this._select, this);
        b.on('focus', this._focus, this);
        b.on('blur', this._blur, this);
    },

    focus: function(){
        this.callParent(arguments);
        this.down('usersearchinput').focus();
    },


    initValue: function(){
        var m = this;
        Ext.each(m.value, function(o){
            var u = UserDataLoader.resolveUser(o);
            if(u)m.addSelection(u);
            else{
                m.addSelection(Ext.create('model.unresolved-user',{Username: o}));
            }
        });
    },

    isValid: function() {
        return this._selections.length>0;
    },

    getValue: function(){
        var m = this, r = [];
        Ext.each(m._selections, function(u){
            r.push(u.get('Username'));
        });
        return r;
    },

    _blur: function(ctrl) {
    },

    _focus: function(ctrl) {
        //TODO: Add Group selections somewhere in this field
    },

    _select: function(ctrl, selected) {
    	ctrl.collapse();
        ctrl.setValue('');
        this.addSelection(selected[0]);
    },

    __contains: function(model){
        var id = model.getId(), found = false;
        Ext.each(
            this._selections,
            function(o){
                return !(found=(o.getId()==id));
            },
            this
        );
        return found;
    },

    __remove: function(token, model){
        token.destroy();

        var id = model.getId(),
            s = [];

        Ext.each(this._selections, function(o){
            if(o.getId()==id) return;

            s.push(o);
        });

        this._selections = s;
        this.doComponentLayout();
    },

    _addToken: function(model){
        var c = this.items.get(0),
            text = model.get('realname') || model.get('Username');

        c.add({ xtype: 'token', model: model, text: text, listeners: {scope: this, click: this.__remove}});
    },

    addSelection: function(user){
        var m = this;
        if(m.__contains(user)) return;

        m._selections.push(user);
        m._addToken(user);
    }
});