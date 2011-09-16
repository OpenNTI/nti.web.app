Ext.define('NextThought.view.widgets.MiniStreamEntry', {
    extend: 'Ext.Component',
    alias: 'widget.miniStreamEntry',

    renderTpl: new Ext.XTemplate(
          '<div class="x-mini-stream-entry {cls}">',
              '<img src="{avatarURL}" width=16 height=16"/>',
              '<div>',
                    '<span class="name">{name}</span> ',
                    '<span class="text">{text:ellipsis(50)}</span>',
              '</div>',
          '</div>'
          ),

   renderSelectors: {
        box: 'div.x-mini-stream-entry',
        name: '.x-mini-stream-entry span.name',
        text: '.x-mini-stream-entry span.text',
        icon: 'img'
    },
    initComponent: function(){
        this.callParent(arguments);

        var c = this.change.get('Creator'),
            u = UserDataLoader.resolveUser(c);

        this.renderData['cls'] = this.cls || '';
        this.renderData['avatarURL'] = u.get('avatarURL');
        this.renderData['name'] = u.get('alias')||u.get('realname');
        this.renderData['text'] = [this.change.get('ChangeType'),' a ',this.change.get('Item').raw.Class].join('');
    },

    afterRender: function() {
        var me=this;
        me.callParent(arguments);
        me.box.on('click', function(){
            VIEWPORT.fireEvent('stream-item-clicked', me.change.get('Item'));
        });

        //lets put some popovers on this to show the contents?  Maybe this should be inline so as to see it at a
        //glance w/o having to navigate to it?
        var e = this.getEl(),
            t = this.change.get('Item').get('text');
        if (t) {
            Ext.create('Ext.tip.ToolTip', {
                target: e,
                html: t
            });
        }
    }
});