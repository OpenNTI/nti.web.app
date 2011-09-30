Ext.define('NextThought.view.widgets.chat.LogEntry', {
    extend: 'Ext.container.Container',
    alias: 'widget.chat-log-entry',

    requires: [
        'NextThought.proxy.UserDataLoader'
    ],

    renderTpl: new Ext.XTemplate(
        '<div class="x-chat-log-entry">',
            '<span class="reply">',
                '<span class="reply-public"></span>',
            '</span>',
            '<div class="timestamp">{time}</div>',
            '<img src="{icon}" width=16 height=16"/>',
            '<div>',
                '<span class="name">{name}</span> ',
                '<span>{body}</span> ',
            '</div>',
        '</div>'
        ),

    renderSelectors: {
        box: 'div.x-chat-log-entry',
        name: '.x-chat-log-entry span.name',
        icon: 'img'
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

        this.add({html: 'init test 2'});

    },

    onRender: function() {
      console.log('before parent');
      this.callParent(arguments);
      console.log('after parent');

      var self = this;
      setTimeout(function(){self.add({html: 'test'})}, 5000);
    },

    afterRender: function(){
        this.callParent(arguments);
        this.initializeDragZone(this);
        this.el.on('click', this.click, this);
    },

    click: function(event, target, eOpts){
        target = Ext.get(target);
        if(target && target.hasCls('reply-public')){
            this.fireEvent('reply-public', this);
        }
    },

    update: function(u) {
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
        
    }
});
