Ext.define('NextThought.view.UserDataPanel',{
	extend: 'Ext.Component',
	alias: 'widget.user-data-panel',

	requires: [
		'NextThought.store.PageItem'
	],


	cls: 'user-data-panel',
	autoScroll: true,


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'length==0', cn:[{
			cls:"history nothing",
			cn: ['No Items']
		}]},
		{tag:'tpl', 'for':'.', cn:[


			{tag:'tpl', 'if':'isNote', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history note',
				cn:[
					{cls: 'path', html:'{path}'},
					{cls: 'location', html:'{location}'},
					{cls: 'body', html: '{textContent}'}
				]
			}]},

			{tag:'tpl', 'if':'isFavorite', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history favorite',
				cn:[
//					{cls: 'path', html:'{path}'},
//					{cls: 'location', html:'{location}'}
				]
			}]},


			{tag:'tpl', 'if':'isChat', cn:[
			{
				'data-guid': '{guid}',
				cls: 'history chat',
				cn:[
                    {cls: 'occupants', cn:[
                        {tag: 'span', cls: 'names', html: '{occupants}'},
                        {tag: 'span', cls: 'count', html: '{count}'}
                    ]},
                    {cls: 'time', cn:[
                        '{started} - Lasted ',
                        {tag: 'span', cls: 'duration', html:'{duration}'}
                    ]}
				]
			}]},



			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', cn:[{tag:'span', html:'{label}'}]
			}]}
		]}
	])),



	initComponent: function(){
		var data = NextThought.model,
			m = this.dataMapper = {},
            types = [];

		m[data.Note.prototype.mimeType] = this.getNoteItem;
		m[data.Highlight.prototype.mimeType] = this.getHighlightItem;
		m[data.TranscriptSummary.prototype.mimeType] = this.getChatItem;
        m[data.Transcript.prototype.mimeType] = this.getChatItem;

		this.callParent(arguments);

        //create a regex for our filter
        Ext.each(this.mimeType, function(t){ types.push(RegExp.escape(t)); });
        this.mimeTypeRe = new RegExp('^application\\/vnd\\.nextthought\\.('+types.join('|')+')$');


        this.on('activate', this.onActivate, this);
		this.initializeStore();
	},



	initializeStore: function(){
		if(NextThought.store.PageItem.prototype.proxy.url === 'tbd'){
			Ext.defer(this.initializeStore,100,this);
			return;
		}

        var s = this.self.store;

        if (!s){
            s = this.self.store = NextThought.store.PageItem.create({id:'historyStore', groupField:'GroupingField'});

            s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
                sortOn: 'lastModified',
                sortOrder: 'descending',
                filter: 'OnlyMe'
            });

            s.proxy.limitParam = undefined;
            s.proxy.startParam = undefined;
            delete s.pageSize;

        }

		this.mon(s,{
			scope: this,
			datachanged: this.maybeRedraw
		});
	},


    onActivate: function() {
        if (this.needsRedraw) {
            this.redraw();
            delete this.needsRedraw;
        }
    },


    maybeRedraw: function(){
        if (this.isVisible()){
            this.redraw();
        }
        else {
            this.needsRedraw = true;
        }
    },


    applyMimeTypeFilter: function(){
        var s = this.self.store;
        s.suspendEvents();
        s.clearFilter();
        s.filter({
            property: 'MimeType',
            value: this.mimeTypeRe
        });
        s.resumeEvents();
    },


	afterRender: function(){
		this.callParent(arguments);
        var s = this.self.store;
		try{
            if (!s.initialLoaded){
                s.initialLoaded = true;
			    s.load();
            }

            if(this.redrawOnRender){
                delete this.redrawOnRender;
                this.redraw();
            }
		}
		catch(e){
			console.error(e.message, e.stack || e.stacktrace);
		}

        this.mon(this.el,
            {scope: this,
            click: this.onClick
        });
	},


    onClick: function(evt){
        var historyElement = evt.getTarget('.history'),
            data = NextThought.model,
            rec, cid, targets, mt;

        evt.stopEvent();
        if (!historyElement){return;}

        rec = this.dataGuidMap[historyElement.getAttribute('data-guid')];
        mt = rec.get('MimeType');

        if(mt === data.TranscriptSummary.prototype.mimeType){
            this.getTranscriptsForOccupants(rec);
        }
        else {
            cid = rec.get('ContainerId');
            targets = rec.get('references');
            targets.push(rec.getId());
            this.fireEvent('navigation-selected', cid, targets);
        }
    },


	getTranscriptsForOccupants: function(initialRecord){
		var records = [initialRecord],
			occupants = (initialRecord.get('Contributors')||[]).slice(),
			length = occupants.length;
		//Lets just assume that we have all of 'em in the map for now. (there is no way to query for these objects so
		// paging them in is not really in the cards for now.)

		Ext.Object.each(this.dataGuidMap,function(key,obj){
			var list = (obj.get('Contributors')||[]),
				len = list.length;

			if(obj !== initialRecord && length === len){
				if(Ext.Array.intersect(occupants,list).length === length){
					records.push(obj);
				}
			}
		});

		this.fireEvent('open-chat-transcript', records);
	},


	redraw: function(){
        if(!this.rendered){
            this.redrawOnRender = true;
            return;
        }

        this.applyMimeTypeFilter();

		var container = this,
			items = [],
			store = this.self.store,
			groups = store.getGroups(),
			me = this;

        me.dataGuidMap = this.dataGuidMap || {};

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || 'Today';
			if( label ){ items.push({ label: label }); }

			Ext.each(group.children,function(c){
				var fn = me.dataMapper[c.mimeType];
				if( fn ){ items.push(fn.call(me,c)); }

                me.dataGuidMap[items.last().guid] = c;
			});
		}

		if(groups.length === 0){
			this.feedTpl.overwrite(container.getEl(), []);
			container.updateLayout();
		}

		Ext.each(groups,doGroup,this);

		this.feedTpl.overwrite(container.getEl(),items);
		container.updateLayout();
	},



	getHighlightItem: function(rec){

		rec.getBodyText = function(){
			return rec.get('selectedText');
		};

		return this.getNoteItem(rec);
	},


	getNoteItem: function(rec){
		var me = this,
			guid = guidGenerator(),
			data = {
				isNote: true,
				guid: guid,
				location: '...',
				path: '...',
				textContent: rec.getBodyText()
			};

		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
				location = '',
				dom;

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();

				Ext.apply(data, {
					location: Ext.String.ellipsis(location, 150, false),
					path: lineage.join(' / ')
				});
			}

			try {
				dom = me.el.down('[data-guid='+guid+']');
				if (dom) {
					dom.down('.path').update(data.path);
					dom.down('.location').update(data.location);
				}
			}
			catch(e){
				console.log('strange :P', e.message, e.stack);
			}


		});

		return data;
	},


	getChatItem: function(rec){
        var me = this,
            guid = guidGenerator(),
            ri = rec.get('RoomInfo'),
            started = ri.get('CreatedTime'),
            ended = rec.get('Last Modified'),
            data = {
                isChat: true,
                guid: guid,
                occupants: rec.get('Contributors'),
                started: Ext.Date.format(started, 'g:i A'),
                duration: rec.timeDifference(ended, started).replace(/ ago/i, '')
            };

        UserRepository.getUser(data.occupants, function(users){
            var names = [],
                dom;
            Ext.each(users, function(u){
                if (!isMe(u) && names.length < 4){
                    names.push(u.getName().split(/\s/)[0]);
                }
            });
            if (users.length > 5){data.count = '('+(users.length-1)+')';}
            data.occupants = names.join(', ');


            try {
                dom = me.el.down('[data-guid='+guid+']');
                if (dom) {
                    dom.down('.occupants .names').update(data.occupants);
                    dom.down('.occupants .count').update(data.count || '');
                }
            }
            catch(e){
                console.log('strange :P', e.message, e.stack);
            }
        });


		return data;
	}

});
