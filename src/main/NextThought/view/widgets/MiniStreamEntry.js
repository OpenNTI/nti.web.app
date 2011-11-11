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
            u = NextThought.cache.UserRepository.getUser(c);

        this.renderData['cls'] = this.cls || '';
        this.renderData['avatarURL'] = u.get('avatarURL');
        this.renderData['name'] = u.get('alias')||u.get('realname');
        this.renderData['text'] = this.change.get('Item')
			? [this.change.get('ChangeType'),' a ',this.change.get('Item').raw.Class].join('')
			: 'deleted something';
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
            txt = this.change.get('Item').get('text'),
            bdy = this.change.get('Item').get('body');
            t = this.getToolTipText(txt, bdy);
        if (t) {
            Ext.create('Ext.tip.ToolTip', {
                target: e,
                html: t
            });
        }
    },

    getToolTipText: function(txt, body)
    {
        if (txt) return txt;

        var o, text = [];

        for (var i in body) {
            if(!body.hasOwnProperty(i)) continue;
            o = body[i];
            if(typeof(o) == 'string'){
                text.push(o.replace(/<.*?>/g, ''));
            }
        }
        return text.join('');
    }
});
