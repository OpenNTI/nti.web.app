Ext.define('NextThought.view.widgets.chat.LogEntryModerated', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.chat-log-entry-moderated',
    mixins: {
//        checkbox: 'Ext.form.field.Checkbox'
        contains: 'Ext.container.Container'
    },
    requires: [
        'NextThought.proxy.UserDataLoader'
    ],

    preventMark:true,
    anchor: '100%',

    labelableRenderTpl: [
        '<tpl if="!hideLabel && !(!fieldLabel && hideEmptyLabel)">',
            '<label<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"<tpl if="labelStyle"> style="{labelStyle}"</tpl>>',
                '<tpl if="fieldLabel">{fieldLabel}{labelSeparator}</tpl>',
            '</label>',
        '</tpl>',
        '<div class="x-chat-log-entry moderated {baseBodyCls} {fieldBodyCls}"<tpl if="inputId"> id="{baseBodyCls}-{inputId}"</tpl> role="presentation">',
            '<span class="reply">',
                '<span class="reply-public"></span>',
            '</span>',
            '<div class="timestamp">{time}</div>',
            '{subTplMarkup}',
            '<img src="{icon}" width=16 height=16"/>',
            '<div>',
                '<span class="name">{name}</span> ',
                '<span>{body}</span> ',
            '</div>',
        '</div>',
        '<div class="x-chat-replies"></div>',
        '<div class="{errorMsgCls}" style="display:none"></div>',
        '<div class="{clearCls}" role="presentation"><!-- --></div>',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    renderSelectors: {
        box: 'div.x-chat-log-entry',
        name: '.x-chat-log-entry span.name',
        icon: 'img',
        frameBody: 'div.x-chat-replies'
    },

    initComponent: function(){
        this.callParent(arguments);

        var m = this.message,
            me = this,
            s = m.get('Creator');

        this.renderData['time'] = Ext.Date.format(m.get('Last Modified'), 'H:i:s');
        this.renderData['name'] = 'resolving...';
        this.renderData['body'] = m.get('Body');

        NextThought.cache.UserRepository.prefetchUser(s, function(users){
            var u = users[0];
            if (!u) {
                console.log('ERROR: failed to resolve user', s, m);
                return;
            }

            me.update(u);
        });


    },

    afterRender: function() {
        this.callParent(arguments);
        this.initializeDragZone(this);

        this.on('change', function(cmp, state){
            this.box.removeCls('selected');
            if(state) this.box.addCls('selected');
        });

        this.el.on('click', this.click, this);
    },

    click: function(event, target, eOpts){
        target = Ext.get(target);
        if(target && target.hasCls('reply-public')){
            this.fireEvent('reply-public', this);
        }
        else if(!/input/i.test(target.tagName))
            this.setValue(!this.getValue());
    },

    update: function(u) {
        var name = u.get('alias') || u.get('Username'),
            i = u.get('avatarURL');

        if(this.rendered){
            this.icon.set({src: i});
            this.name.update(name);
        }
        else {
            this.renderData['name'] = name;
            this.renderData['icon'] = i;
        }
    },


    initializeDragZone: function(v) {
        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {

            getDragData: function(e) {
                var sourceEl = v.box.dom, d;
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return v.dragData = {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        data: v.message.data
                    };
                }
            },

            getRepairXY: function() {
                return this.dragData.repairXY;
            }
        });
    }

});