Ext.define('NextThought.view.forums.Comments',{
	extend: 'Ext.view.View',
	alias: 'widget.forum-comment-thread',

	requires: [
		'NextThought.store.forums.Comments',
		'NextThought.util.UserDataThreader'
	],

	ui: 'forum-comment-thread',
	itemSelector: '.topic-comment-container',
	preserveScrollOnRefresh: true,

	disableSelection: true,

	updateFromMeMap: {},
	wbData: {},

	tpl: Ext.DomHelper.markup([
		{ cls: 'new-root'},
		{ tag: 'tpl', 'for': '.', cn: [
			{ cls: 'topic-comment-container {[values.threadShowing? "expanded" : "collapsed"]}', 'data-depth': '{depth}', cn: [
				{ tag: 'tpl', 'if': 'Deleted', cn: {
					cls: 'topic-comment placeholder {[values.threadShowing? "expanded" : "collapsed"]}',
					'data-depth': '{depth}',
					cn: [
						{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
							{ cls: 'body', html: 'This item has been deleted.'}
						]}
					]
				}},
				{ tag: 'tpl', 'if': '!Deleted', cn: {
					cls: 'topic-comment {[values.threadShowing? "expanded" : "collapsed"]} {[values.depth === 0? "toggle" : ""]}',
					'data-depth': '{depth}',
					cn: [
						{ cls: 'controls', cn: [
							{cls: 'favorite-spacer'},
							{cls: 'like {[values.liked? "on" : "off"]}'}
						]},
						{ cls: 'commentAvatar', style: { backgroundImage: 'url({Creator:avatarURL()});'}},
						{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
							{ cls: 'meta', cn: [
								{ tag: 'span', html: '{Creator:displayName()}', cls: 'name link'},
								{ tag: 'tpl', 'if': 'depth &gt; 4', cn: [
									{ tag: 'span', html: 'Replied to {repliedTo}'}
								]},
								{ tag: 'tpl', 'if': 'depth &lt; 5', cn: [
									{ tag: 'span', cls: 'datetime nodot', html: '{CreatedTime:ago}'}
								]}
							]},
							{ cls: 'body', html: '{bodyContent}'},
							{ cls: 'foot', cn: [
								{ tag: 'tpl', 'if': 'depth === 0', cn: [
									{ tag: 'span', cls: 'comments link toggle', html: '{ReferencedByCount:plural("Comment")}'}   
								]},								
								{ tag: 'span', cls: 'reply thread-reply link', html: 'Reply'},
								{ tag: 'tpl', 'if': 'isModifiable', cn: [
									{ tag: 'span', cls: 'edit link', html: 'Edit'},
									{ tag: 'span', cls: 'delete link', html: 'Delete'}
								]},
								{ tag: 'tpl', 'if': '!isModifiable', cn: [
									{ tag: 'span', cls: 'flag link {[values.flagged? "on" : "off"]}', html: '{[values.flagged? "Reported" : "Report"]}'}
								]}
							]},

							{ cls: 'editor-box' }
						]}
					]
				}},
				{ cls: 'load-box'}
			]}
		]}
	]),


	listeners: {
		itemclick: {
			element: 'el',
			fn: 'onItemClick'
		}
	},


	initComponent: function(){
		this.callParent(arguments);

		if(!this.topic){
			console.error('Cant create a comments view without a topic...');
			return;
		}

		this.buildStore();
	},


	afterRender: function(){
		var me = this;

		this.callParent(arguments);

		me.editor = Ext.widget('nti-editor', {ownerCt: me, renderTo: me.el, record: null, saveCallback: function(editor, postCmp, record){
			if(me.isNewRecord){
				me.store.insertSingleRecord(record);
			}
		}});
		me.editor.addCls('threaded-forum-editor');	
		me.el.selectable();
	},	


	buildStore: function(){
		var s = NextThought.store.forums.Comments.create({
			storeId: this.topic.get('Class') + '-' + this.topic.get('NTIID'),
			url: this.topic.getLink('contents')
		});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {},{
			sortOn: 'CreatedTime',
			sortOrder: 'ascending',
			filter: 'TopLevel'
		});

		this.mon(s,{
			scope: this,
			load: 'onStoreAdd',
			add: 'onStoreAdd',
			update: 'onStoreUpdate'
		});

		this.bindStore(s);

		this.store.load();
	},


	onStoreAdd: function(store, records){
		records.forEach(this.fillInData, this);
		this.clearLoadBox();
		this.fireEvent('realign-editor');
	},

	
	onStoreUpdate: function(store, record){
		this.fillInData(record);
		this.clearLoadBox();
		this.fireEvent('realign-editor');
	},


	fillInData: function(record){
		var me = this;

		if( typeof record.get('Creator') === 'string'){
			UserRepository.getUser(record.get('Creator'))
				.then(function(user){
					record.set({
						'Creator': user
					});
				})
				.fail(function(reason){
					console.error(reason);
				});
		}

		record.compileBodyContent(function(body){
			var index = record.index || me.store.indexOf(record);

			me.store.suspendEvents();

			record.set({
				'bodyContent': body
			});

			me.store.resumeEvents();
			me.refreshNode(index);
		}, this, function(id, data){
			me.wbData[id] = data;
		}, 226);
	},


	clearLoadBox: function(){
		if (!this.currentLoadBox) { return; }
		this.currentLoadBox.unmask();
		this.currentLoadBox.setHeight(0);
	},	


	maskLoadBox: function(el){
		this.currentLoadBox = el.down('.load-box');
		this.currentLoadBox.setHeight(40);
		this.currentLoadBox.mask('Loading...');
	},


	whiteboardContainerClick: function(record, container, e, el){
		var me = this,
			guid = container && container.up('.body-divider').getAttribute('id');

		if (container && me.wbData[guid]) {
			container = e.getTarget('.reply:not(.thread-reply)', null, true);
			if (container) {
				me.replyTo(record, el)
					.done(function(){
						me.editor.addWhiteboard(Ext.clone(me.wbData[guid]), guid + '-reply');
					});
			} else {
				Ext.widget('wb-window', { width: 802, value: me.wbData[guid], readonly: true}).show();
			}
		}
	},


	loadThread: function(record, el){
		if(!record.threadLoaded){
			this.maskLoadBox(el);
		}

		this.store.showCommentThread(record);
	},


	onItemClick: function(record, item, index, e){
		var record, load, me = this, width, 
			t = e.getTarget('.whiteboard-container', null, true),
			el = Ext.get(item),
			box;
			
		if (t) {
			this.whiteboardContainerClick(record, t, e, el);
			return;
		}

		if(e.getTarget('.body') && record.get('threadShowing')){
			e.preventDefault();
			return;
		}

		width = el.down('.wrap').getWidth();

		if (e.getTarget('.reply') && !this.editor.isActive()) {
			this.replyTo(record, el, width);
			return;
		}

		if (e.getTarget('.edit') && !this.editor.isActive()) {
			delete this.isNewRecord;
			t = el.down('.body');
			t.hide();
			this.openEditor(record, t, width, function(){
				t.show();
			});
			return;
		}

		if (e.getTarget('.delete')) {
			this.deleteRecord(record);
			return;
		}

		if (e.getTarget('.flag') && !record.isFlagged()) {
			me.flagging = true;
			TemplatesForNotes.areYouSure('Reporting this object cannot be undone.', function(btn) {
				delete me.flagging;
				if (btn === 'ok') { record.flag(me); }
			});
			return;
		}

		if (e.getTarget('.name')) {
			UserRepository.getUser(record.get('Creator'))
				.done(function(u){
					if(!isMe(u)){
						me.fireEvent('show-profile', u);
					}
				})
				.fail(function(reason){
					console.error(reason);
				});
			return;
		}

		if(e.getTarget('.like')) {
			record.like();
			return;
		}


		if(e.getTarget('.toggle') && record.get('depth') === 0){
			if(record.get('threadShowing')){
				me.store.hideCommentThread(record);
			} else {
				me.loadThread(record, el);
			}

			me.fireEvent('realign-editor');
		}

	},


	replyTo: function(record, el, width){
		var me = this,
			p = new Promise();

		me.isNewRecord = true;
		newRecord = record.makeReply();

		if(!record.threadLoaded && record.get('ReferencedByCount')){
			me.store.on('add', function(){
				var el = me.getNode(record);
				
				el = Ext.get(el);

				me.openEditor(newRecord, el.down('.editor-box'), width);	
				p.fulfill();
			}, me, {single: true});
			me.loadThread(record, el);
		} else {
			me.openEditor(newRecord, el.down('.editor-box'), width);
			p.fulfill();			
		}

		return p;
	},


	deleteRecord: function(record){
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'This will permanently remove this comment.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: this,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str) {
				if (str === 'ok') {
					var href = record.get('href'),
						depth = record.get('depth');

					if (!href) {
						console.error('The record doesnt have an href!?!?!');
						return;
					}

					Service.request({
						url: href,
						method: 'DELETE'
					}).done(function(){
						record.convertToPlaceholder();
						record.set({
							'depth': depth,
							'threadShowing': true,
							'Deleted': true
						});

					}).fail(function(reason){
						console.error(reason);
					});

				}
			}
		});
	},


	openEditor: function(record, el, width, cancelCallback) {
		var me = this, refreshMon,
			oldHeight = el.getHeight();

		width = width || el.getWidth();

		function size(){
			el.setHeight(me.editor.getHeight());
		}

		me.editor.record = record;
		me.editor.editBody((record && record.get('body')) || []);
		me.editor.activate();
		me.editor.focus();

		me.editor.alignTo(el, 'tl-tl');

		size();
		me.editor.setWidth(width);

		Ext.destroy(this.boxMonitor);

		refreshMon = me.mon(me,{
			destroyable: true,
			'realign-editor': function(){
				var parentId = record.get('inReplyTo'),
					parent = parentId && me.store.getById(parentId),
					el = me.getNodeByRecord(parent);

				el =  el && Ext.fly(el).down('.editor-box');

				if (!el) {
					console.error('Failed to find new node to align editor to, so closing it');
					me.editor.deactive();
					return;
				}

				el.setHeight(me.editor.getHeight());
				me.editor.setWidth(width || el.getWidth());
				me.editor.alignTo(el, 'tl-tl');
			}
		});

		me.boxMonitor = me.mon(this.editor,{
			destroyable: true,
			'grew': size,
			'shrank': size,
			'deactivated-editor': function(){
				var parentId = record.get('inReplyTo'),
					parent = parentId && me.store.getById(parentId),
					el = me.getNodeByRecord(parent);

				el = el && Ext.fly(el).down('.editor-box');

				Ext.destroy(refreshMon);
				Ext.callback(cancelCallback);
				
				if (!el) {
					console.error('Cant find the node to set the old height back on...');
					return;
				}

				el.setHeight(oldHeight);
			}
		});
	},


	addRootReply: function(){
		this.isNewRecord = true;
		this.openEditor(null, this.el.down('.new-root'));
	},


	getRefItems: function() {
		var items = [];
		if (this.editor) {
			items.push(this.editor);
		}
		return items;
	}
});
