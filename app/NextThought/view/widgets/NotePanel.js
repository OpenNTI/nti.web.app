Ext.define('NextThought.view.widgets.NotePanel',{
	extend : 'Ext.panel.Panel',
	alias: 'widget.notepanel',
	requires: ['NextThought.proxy.UserDataLoader'],
	
	cls : 'x-note-panel-cmp',
	layout : 'fit',

	initComponent: function(){
        var m = this,
            a = m._annotation,
            r = m._record = m._record || a._record,
            thread = [],
            c = r.get('Creator') || _AppConfig.server.username;

        m.id = 'note-'+r.get('OID'),
        m.callParent(arguments);

        if(!r.placeHolder){
            UserDataLoader.resolveUser(c,function(u){ m.addUserControls(u); });
        }

        r.children = Ext.Array.sort(r.children || [], function(a,b){
            var k = 'Last Modified';
            return a.get(k) < b.get(k);
        });

        Ext.each(r.children, function(rec){
            thread.push(m.buildReply(rec));
        });

        m.gutter = Ext.create('Ext.panel.Panel',{
            xtype: 'panel',
            dock: 'bottom',
            border: false,
            items: thread
        });

		m.addDocked(m.gutter);
	},
	
	
	addUserControls: function(u){
		var t = [],
			m = this,
            r = m._record;


        if(u){
            t.push({
                    xtype: 'image',
                    src: u.get('avatarURL'),
                    height: 16, width: 16
                },
                u.get('realname'));
        }

        t.push('->',{ text : 'Reply', eventName: 'reply-to-note' });

		if(u && u.get('Username')==_AppConfig.server.username){
			t.push(
				{ text : 'Edit', eventName: 'edit-note' },
				{ text : 'Share', eventName: 'share-with' },
				{ text : 'Delete', eventName: 'delete' }
				);
		}

		m.addDocked({xtype: 'toolbar', dock: 'top', items: t});
	},

    addReply: function(record){
        var m = this,
            a = m._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a,
            reply = m.buildReply(record);

        m.gutter.add(reply);
        p.onResize();
    },


    buildReply: function(record){
        var m = this,
            a = m._annotation,
            p = a._parentAnnotation? a._parentAnnotation : a,
            r = Ext.create('widget.notepanel',{
                html: record.get('text'),
                _record: record,
                _owner: m,
                _annotation: {
                    _parentAnnotation: p,
                    getRecord: function(){return record},
                    getCmp: function(){return r;},
                    remove: function(){ r.removeReply(); }
                }
            });

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
        var abandonedChildren = Ext.Array.clone(this._record.children) || [];

        this.update(record.get('text'));


        if (record.children && record.children.length > 0) {
            Ext.each(record.children, function(rec){
                this._claimChild(abandonedChildren, rec);
                var oid = rec.get('OID'),
                    reply = Ext.getCmp('note-'+oid);

                if (reply)
                    reply.updateFromRecord(rec);
                else
                    this.addReply(rec);

            }, this);
        }
        //console.log('abandoned', abandonedChildren.length);
        for (var a in abandonedChildren) {
            var oid = abandonedChildren[a].get('OID'),
                panel = Ext.getCmp('note-'+oid);
            panel.cleanupReply();
        }

        //set the record to the new record.
        this._record = record;
    },


    hasReplies: function(){
        return !!this.gutter.items.length;
    },

    cleanupReply: function(){
        var m = this,
            children = m._record.children,
            parent = m._record._parent,
            a = m._annotation,
            p = a._parentAnnotation ? a._parentAnnotation : a;


        if(m.hasReplies()) {
            m.removeDocked(m.getDockedItems('toolbar')[0]);
            m.update('Place holder for deleted note');
        }
        else m.destroy();
        p.onResize();
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
        m.update(record.get('text'));
        m._annotation._parentAnnotation.onResize();
    }

	
	
});
