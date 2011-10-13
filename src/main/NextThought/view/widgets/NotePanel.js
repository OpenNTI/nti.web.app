Ext.define('NextThought.view.widgets.NotePanel',{
    extend: 'Ext.container.Container',
    alias: 'widget.note-entry',
    requires: [
        'NextThought.cache.UserRepository'
    ],

    renderTpl: new Ext.XTemplate(
        '<div class="x-nti-note {owner}">',
            '<span class="controls">',
                '<span class="reply"></span>',
                '<span class="chat"></span>',
                '<span class="edit"></span>',
                '<span class="share"></span>',
                '<span class="delete"></span>',
            '</span>',
            '<div class="timestamp">{time}</div>',
            '<img src="{icon}"/>',
            '<div>',
                '<span class="name">{name}</span> ',
                '<span class="body-text">{body}</span> ',
            '</div>',
        '</div>',
        '<div class="x-nti-note-replies"></div>'
        ),

    transcriptSummaryRenderTpl: new Ext.XTemplate(
        '<div class="x-nti-note chat-transcript">',
            '<div class="transcript-placeholder">',
                '<a href="#">View Log</a>',
            '</div>',
            '<tpl for="contributors">',
                '<tpl if="src">',
                    '<img avatarFor="{id}" src="{src}" alt="{alt}" title="{title}"/>',
                '</tpl>',
                '<tpl if="!src">',
                    '<img avatarFor="{.}"/>',
                '</tpl>',
            '</tpl>',
        '</div>',
        '<div class="x-nti-note-replies chat-transcript"></div>'
        ),

    renderSelectors: {
        frameBody:  '.x-nti-note-replies',
        box:        '.x-nti-note',

        //For notes
        name:       '.x-nti-note .name',
        text:       '.body-text',
        time:       '.timestamp',
        icon:       'img',
        controls:   '.x-nti-note .controls'

        //For transcript summaries
    },

    initComponent: function(){
        var m = this,
            a = m._annotation,
            r = m._record = m._record || a._record,
            c = r.get('Creator') || _AppConfig.server.username;

        m.id = 'cmp-'+r.get('OID');

        if(/TranscriptSummary/i.test(r.getModelName())){
            m.renderTpl = m.transcriptSummaryRenderTpl;
            m.updateModel = m.updateTranscriptSummaryModel;
        }

        m.callParent(arguments);

        m.updateModel(r);
        m.buildThread(r);
    },

    buildThread: function(record){
        var m = this;
        Ext.each(
            Ext.Array.sort(
                record.children || [],
                SortModelsBy('Last Modified', true)),
            function(rec){
                m.add(m.buildReply(rec));
            }
        );
    },

    convertToPlaceHolder: function(){
        this.placeHolder = true;
        this.text.update(arguments[0]||'Place holder for deleted note');
        this.time.remove();
        this.name.remove();
        this.icon.remove();
        this.controls.remove();
        this.box.addCls('placeholder');
    },


    updateTranscriptSummaryModel: function(m){
        var me = this,
            c  = Ext.Array.clone(m.get('Contributors'));


        Ext.apply(this.renderData,{
            contributors: Ext.Array.clone(c)
        });

        UserRepository.prefetchUser(c, function(users){
            if(!this.rendered)
                this.renderData.contributors = [];

            Ext.each(users, function(u){
                if (!u) { console.log('WARNING: unresolved user!'); return; }
                var name = u.get('alias') || u.get('Username'),
                    o = {
                        id: u.getId(),
                        src: u.get('avatarURL'),
                        alt: name,
                        title: name
                    };

                me.renderData.contributors.push(o);
                if(this.rendered){
                    me.box.select('img[avatarFor='+u.getId()+']').set(o);
                }
            });
        }, this);

    },


    insertTranscript: function(m){

        this._record = m;
        var panel = this.add({title: 'Chat Transcript | {date}'}),
            log = panel.add({ xtype: 'chat-log-view' }),
            a = this._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a;

        Ext.each(m.get('Messages'),function(i){
            log.addMessage(i);
        });

        p.onResize();
    },


    updateModel: function(m){
        var me = this,
            s = m.get('Creator'),
            owner = _AppConfig.server.username == s;

        me._record = m;

        me.renderData['time'] = Ext.Date.format(m.get('Last Modified') || new Date(), 'g:i:sa M j, Y');
        me.renderData['name'] = 'resolving...';
        me.renderData['body'] = m.get('text');
        me.renderData['owner'] = owner ? 'owner' : '';

        if(this.rendered){
           me.text.update(me.renderData.body);
           me.time.update(me.renderData.time);
        }

        if(s){
            UserRepository.prefetchUser(s,
                function(users){
                    var u = users[0];
                    if (!u) {
                        console.log('ERROR: failed to resolve user', s, m);
                        return;
                    }

                    me.fillInUser(u);
                },
                this);
        }
    },


    afterRender: function(){
        this.callParent(arguments);
        if(this._record.placeHolder){
            this.convertToPlaceHolder();
        }
        this.el.on('click', this.click, this);
    },

    click: function(event, target, eOpts){
        target = Ext.get(target);
        event.preventDefault();

        var inBox = target && this.controls && this.controls.contains(target),
            action = inBox && target.getAttribute('className');

        if(action){
            this.fireEvent('action', action, this);
        }
        else if(/TranscriptSummary/i.test(this._record.getModelName())){
            this.fireEvent('load-transcript', this._record, this, this.box.switchOff({remove: true, useDisplay: true}));
        }
    },


    fillInUser: function(u) {
        var name = u.get('alias') || u.get('Username'),
            i = u.get('avatarURL'),
            owner = u.get('Username')==_AppConfig.server.username;

        if(this.rendered){
            this.icon.set({src: i});
            this.name.update(name);
            this.box.removeCls('owner');
            if(owner)this.box.addCls('owner');
        }
        else {
            this.renderData['name'] = name;
            this.renderData['icon'] = i;
            this.renderData['owner'] = owner ? 'owner' : '';
        }
    },


    addReply: function(record){
        var m = this,
            a = m._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a;

        m.add(m.buildReply(record));
        p.onResize();
    },


    buildReply: function(record){
        var m = this,
            a = m._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a,
            r = {
                xtype: 'note-entry',
                _record: record,
                _owner: m,
                _annotation: {
                    _parentAnnotation: p,
                    getRecord: function(){return record},
                    getCmp: function(){return r;},
                    remove: function(){ r.removeReply(); }
                }
            };

        record.on('updated', r.replyUpdated, r);

        return r;
    },

    _claimChild: function(children, child) {
        var cOid = child.get('OID');
        for(var i in children) {
            if (!children.hasOwnProperty(i)) continue;
            var o = children[i].get('OID');

            if (o == cOid) {
                Ext.Array.erase(children, i, 1);
            }
        }
    },

    updateFromRecord: function(record) {
        var abandonedChildren = Ext.Array.clone(this._record.children || []);

        this.updateModel(record);


        if (record.children && record.children.length > 0) {
            Ext.each(record.children, function(rec){
                this._claimChild(abandonedChildren, rec);
                var oid = rec.get('OID'),
                    reply = Ext.getCmp('cmp-'+oid);

                if (reply)
                    reply.updateFromRecord(rec);
                else
                    this.addReply(rec);

            }, this);
        }
        //console.log('abandoned', abandonedChildren.length);
        for (var a in abandonedChildren) {
            var oid = abandonedChildren[a].get('OID'),
                panel = Ext.getCmp('cmp-'+oid);
            panel.cleanupReply();
        }

        //set the record to the new record.
        this._record = record;
    },


    hasReplies: function(){
        return this.query('note-entry[placeHolder]').length != this.query('note-entry').length;
    },

    cleanupReply: function(){
        var m = this,
            children = m._record.children,
            parent = m._record._parent,
            a = m._annotation,
            p = a._parentAnnotation ? a._parentAnnotation : a;


        if(m.hasReplies()) {
            m.convertToPlaceHolder();
        }
        else m.destroy();

        p.onResize();
    },

    onRemove: function(){
        this.callParent(arguments);
        if(this.placeHolder && !this.hasReplies()){
            this.destroy();
        }
    },

    removeReply: function(){
        this.cleanupReply();
        this._record.destroy();
    },


    replyUpdated: function(record){
        var m = this,
            children = m._record.children,
            parent = m._record._parent;

        record.on('updated',m.replyUpdated, m);
        record.children = children;
        record._parent = parent;

        m._record = record;
        m.updateModel(record);
        m._annotation._parentAnnotation.onResize();
    }

	
	
});
