Ext.define('NextThought.view.widgets.chat.LogEntry', {
    extend: 'Ext.container.Container',
    alias: 'widget.chat-log-entry',

    requires: [
        'NextThought.proxy.UserDataLoader',
        'NextThought.view.widgets.chat.ReplyTo'
    ],

    renderTpl: new Ext.XTemplate(
        '<div class="x-chat-log-entry">',
            '<span class="reply">',
                '<span class="reply-whisper"></span>',
                '<span class="reply-public"></span>',
            '</span>',
            '<div class="timestamp">{time}</div>',
            '<img src="{icon}" width=16 height=16"/>',
            '<div>',
                '<span class="name">{name}</span> ',
                '<span class="body-text">{body}</span> ',
            '</div>',
        '</div>',
        '<div class="x-chat-replies"></div>'
        ),

    renderSelectors: {
        box: 'div.x-chat-log-entry',
        name: '.x-chat-log-entry span.name',
        text: 'span.body-text',
        time: 'div.timestamp',
        icon: 'img',
        frameBody: 'div.x-chat-replies'
    },

    initComponent: function(){
        this.callParent(arguments);
        this.update(this.message);
    },

    add: function(){
        var r = this.callParent(arguments),
            reply = this.down('chat-reply-to');

        if(reply && r!==reply){
            var ci = this.items.indexOf(reply);
            this.move(ci, this.items.getCount()-1);
            reply.down('textfield').focus();
        }

        return r;
    },

    update: function(m){
        var me = this,
            s = m.get('Creator');

        me.message = m;

        me.renderData['time'] = Ext.Date.format(m.get('Last Modified'), 'H:i:s');
        me.renderData['name'] = 'resolving...';
        me.renderData['body'] = m.get('Body');

        if(this.rendered){
           me.text.update(me.renderData.body);
           me.time.update(me.renderData.time);
        }

        if(s){
            UserRepository.prefetchUser(s, function(users){
                var u = users[0];
                if (!u) {
                    console.log('ERROR: failed to resolve user', s, m);
                    return;
                }

                me.fillInUser(u);
            });
        }
    },

    afterRender: function(){
        this.callParent(arguments);
        this.initializeDragZone(this);
        this.el.on('click', this.click, this);
    },

    click: function(event, target, eOpts){
        target = Ext.get(target);
        var inBox = target && this.box.contains(target);
        if(inBox && target.hasCls('reply-public')){
            this.fireEvent('reply-public', this);
        }
        else if(inBox && target.hasCls('reply-whisper')){
            this.fireEvent('reply-whisper', this);
        }
    },

    fillInUser: function(u) {
        var name = u.get('alias') || u.get('Username'),
            i = u.get('avatarURL');

        if(this.rendered){
            console.log('rendered');
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
    },

    showReplyToComponent: function() {
        return this.add({
            xtype: 'chat-reply-to',
            replyTo: this.message.getId()
        });
    }
});
