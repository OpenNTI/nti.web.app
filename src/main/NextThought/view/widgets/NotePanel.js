Ext.define('NextThought.view.widgets.NotePanel',{
    extend: 'Ext.container.Container',
    alias: 'widget.note-entry',
    requires: [
        'NextThought.cache.UserRepository',
        'NextThought.cache.IdCache',
        'NextThought.util.AnnotationUtils'
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
                '<span class="body-text selectable">{body}</span> ',
            '</div>',
        '</div>',
        '<div class="x-nti-note-replies"></div>'
        ),

    transcriptSummaryRenderTpl: new Ext.XTemplate(
        '<div class="x-nti-note chat-transcript">',
            '<tpl for="contributors">',
                '<tpl if="src">',
                    '<img avatarFor="{id}" src="{src}" alt="{alt}" title="{title}"/>',
                '</tpl>',
                '<tpl if="!src">',
                    '<img avatarFor="{.}"/>',
                '</tpl>',
            '</tpl>',
            '<div class="transcript-placeholder"><a href="#">View Log</a> (Messages: {MessageCount})</div>',
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
            r = m._record = m._record || a._record;

        m.id = this.getCmpId(r);

        if(/TranscriptSummary/i.test(r.getModelName())){
            m.renderTpl = m.transcriptSummaryRenderTpl;
            m.updateModel = m.updateTranscriptSummaryModel;
        }

        m.callParent(arguments);

        m.updateModel(r);
        m.buildThread(r);
    },

    getCmpId: function(r) {
        return IdCache.getComponentId(r, 'RoomInfo');
    },

    buildThread: function(record){
        var m = this,
            l = (record.children||[]).length;

        Ext.each(
            Ext.Array.sort( record.children || [], SortModelsBy('Last Modified', true)),
            function(rec){
                m.add(m.buildReply(rec));
            }
        );

        if(l != this.items.getCount())
            console.warn('Lengths are wrong!', l, this.items.getCount(), this);
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


    insertTranscript: function(m){
        this.frameBody.hide();

		this.removeAll(true);

        var date = Ext.Date.format(m.get('Last Modified') || new Date(), 'M j, Y'),
            panel = this.add({title: Ext.String.format('Chat Transcript | {0}',date), closable: true}),
            log = panel.add({ xtype: 'chat-log-view' }),
            msgs = m.get('Messages');

        msgs = Ext.Array.sort( msgs || [], SortModelsBy('Last Modified', ASCENDING));

        Ext.each(msgs, function(i){ log.addMessage(i); });

		panel.on('beforeclose', function(){
			this.box.show();
		}, this);

		panel.down('header').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			panel.close();
			this.box.show();
		}, this);

        this.frameBody.show({
            listeners: {
                scope: this,
                afteranimate: function(){
                    this.sizeChanged();
                }
            }
        });
    },


    updateTranscriptSummaryModel: function(m){
        var me = this,
            c  = Ext.Array.clone(m.get('Contributors'));


        Ext.apply(this.renderData,{
            contributors: Ext.Array.clone(c),
            MessageCount: m.get('RoomInfo').get('MessageCount')
        });

        UserRepository.prefetchUser(c, function(users){
            if(!this.rendered)
                this.renderData.contributors = [];

            Ext.each(users, function(u){
                if (!u) { console.warn('unresolved user!'); return; }
                var name = u.get('alias') || u.get('Username'),
                    o = {
                        id: u.getId(),
                        src: u.get('avatarURL'),
                        alt: name,
                        title: name
                    };

                me.renderData.contributors.push(o);
                if(me.rendered){
                    me.box.select('img[avatarFor='+u.getId()+']').set(o);
                }
            });
        }, this);

    },


    updateModel: function(m){
        var me = this,
            s = m.get('Creator'),
            owner = _AppConfig.username == s,
            t = AnnotationUtils.compileBodyContent(m);

        me._record = m;

        me.renderData['time'] = Ext.Date.format(m.get('Last Modified') || new Date(), 'g:i:sa M j, Y');
        me.renderData['name'] = 'resolving...';
        me.renderData['body'] = t;
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
                        console.error('failed to resolve user', s, m);
                        return;
                    }

                    me.fillInUser(u);
                },
                this);
        }
    },


    afterRender: function(){
		var me = this;
        me.callParent(arguments);
        if(me._record.placeHolder){
            me.convertToPlaceHolder();
        }

		if(!this.isTranscriptSummary()){
			this.frameBody.unselectable();
			this.box.unselectable();
			this.name.unselectable();
			this.text.selectable();
		}


        me.el.on({
			scope: this,
			'click': me.click,
			'dblclick': function(e){
				e.preventDefault();
				e.stopPropagation();

				if(me._record.getLink('edit'))
					me.fireEvent('action', 'edit', me);
				return false;
			},
			'mouseup': function(e){
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});
		me.sizeChanged();
    },


    click: function(event, target, eOpts){
        target = Ext.get(target);
        event.preventDefault();
		event.stopPropagation();

        var inBox = target && this.controls && this.controls.contains(target),
            action = inBox && target.getAttribute('className');

        if(action){
            this.fireEvent('action', action, this);
        }
        else if(this.box.isDisplayed() && this.isTranscriptSummary()){
            this.fireEvent('load-transcript', this._record, this, this.box.setDisplayed(false));
        }
		return false;
    },


	isTranscriptSummary: function(){
		return (/TranscriptSummary/i).test(this._record.getModelName());
	},


    fillInUser: function(u) {
        var name = u.get('alias') || u.get('Username'),
            i = u.get('avatarURL'),
            owner = u.get('Username')==_AppConfig.username;

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
        this.add(this.buildReply(record));
        this.sizeChanged();
    },


    buildReply: function(record){
        try {
        var m = this,
            a = m._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a,
            r = Ext.create('widget.note-entry',{
                _record: record,
                _owner: m,
                _annotation: {
                    _parentAnnotation: p,
                    getRecord: function(){return record},
                    remove: function(){ r.removeReply(); }
                }
            });

        record.on('updated', r.replyUpdated, r);

        return r;
        }
        catch(e){
            console.error('buildReply: ',e, e.message, e.stack);
        }
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
                var id = this.getCmpId(rec),
                    reply = this.getComponent(id);

                if (reply)
                    reply.updateFromRecord(rec);
                else
                    this.addReply(rec);

            }, this);
        }
        //console.debug('abandoned', abandonedChildren.length);
        for (var a in abandonedChildren) {
            if (!abandonedChildren.hasOwnProperty(a)) continue;
            var id = this.getCmpId(abandonedChildren[a]),
                panel = Ext.getCmp(id);
            panel.cleanupReply();
        }

        //set the record to the new record.
        this._record = record;
    },


    hasReplies: function(){
        return this.query('note-entry[placeHolder]').length != this.query('note-entry').length;
    },

    cleanupReply: function(removeAll){
        var m = this,
            children = m._record.children,
            parent = m._record._parent;

        if (removeAll) {
            m.items.each(function(i){
                m.remove(i, false);
                i.cleanupReply(true);
            },m);

            m.destroy();
        }
        else if(m.hasReplies()) {
            m.convertToPlaceHolder();
        }
        else m.destroy();

        m.sizeChanged();
    },

    onRemove: function(){
        this.callParent(arguments);
        if(this.placeHolder && !this.hasReplies()){
            this.destroy();
        }

        this.sizeChanged();
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
        m.sizeChanged();
    },


    sizeChanged: function(){
        var a = this._annotation;
		try{
			a = (a._parentAnnotation || a);
			a.fireEvent('resize');
		}
		catch(e){
			console.error(e.stack);
		}
    }
	
	
});
