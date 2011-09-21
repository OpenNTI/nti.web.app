Ext.define('NextThought.view.widgets.main.Identity', {
    extend: 'Ext.Component',
    alias: 'widget.identity-panel',

    username: true,
    border: true,
    cls: 'x-username',

    renderTpl: new Ext.XTemplate(
        '<span>{name:ellipsis(10)}</span>',
        '<img src="{avatarURL}" width=24 height=24 valign=middle>'),

    renderSelectors: {
        name: 'span',
        icon: 'img'
    },

    initComponent: function(){
        this.addEvents('mouseover');
        this.callParent(arguments);
    },

    afterRender: function(){
        this.callParent(arguments);
        this.update(_AppConfig.userObject);
        this.el.on('mouseover', this._mouseover, this);
    },

    update: function(user){
        this.icon.set({src: user.get('avatarURL')});
        this.name.update(Ext.String.ellipsis(user.get('realname'),25));
        this.doComponentLayout();
    },

    _mouseover: function(){
        this.fireEvent('mouseover');
    }
});