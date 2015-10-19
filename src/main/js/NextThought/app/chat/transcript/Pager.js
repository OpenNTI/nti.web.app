Ext.define('NextThought.app.chat.transcript.Pager', {

	requires: [
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.StateStore',
		'NextThought.model.TranscriptSummary',
		'NextThought.model.Transcript',
		'NextThought.app.chat.components.log.PagerEntry'
	],


	mixins: {
     	observable: 'Ext.util.Observable'
    },

	PAGE_SIZE: 3,

	constructor: function (cfg) {
		this.initConfig(cfg || {});
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();

		this.mixins.observable.constructor.apply(this);
	},


	buildTranscriptStore: function(occupants) {
		var user = Ext.Array.remove(occupants.slice(), $AppConfig.username)[0],
			url = Service.getContainerUrl(Globals.CONTENT_ROOT, Globals.RECURSIVE_USER_GENERATED_DATA),
			s = NextThought.store.PageItem.make(url, Globals.CONTENT_ROOT, true);

		if (!user) { return; }

		s.pageSize = this.PAGE_SIZE;
		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'CreatedTime',
			sortOrder: 'descending',
			batchSize: this.PAGE_SIZE,
			batchStart: 0,
			transcriptUser: user || '',
			accept: [
				NextThought.model.TranscriptSummary.prototype.mimeType,
				NextThought.model.Transcript.prototype.mimeType
			].join(',')
		});

		this.transcriptStore = s;
		s.on('load', this.pageLoaded.bind(this));
		s.load();
	},


	bindWindow: function(win) {
		this.chatWindow = win;
		this.pages = [];
	},


	pageLoaded: function(store, records) {
		var win = this.chatWindow;

		win.maskWindow();
		this.loadTranscripts(records)
			.then(this.insertBulkMessages.bind(this))
			.then(this.maybeAddMoreEntry.bind(this, records))
			.then(win.unmaskWindow.bind(win))
			.fail(win.unmaskWindow.bind(win));
	},


	loadTranscripts: function(records) {
		var toAdd = [], p, me = this;
		Ext.each(records || [], function(record) {
			p = me.getMessages(record);
			toAdd.push(p);
		});

		return new Promise(function(fulfill, reject) {
			Promise.all(toAdd)
			.then(function(results) {
				var allMessages = [];
				Ext.each(results, function(msgs) {
					allMessages = allMessages.concat(msgs);
				});

				fulfill(allMessages);
			});
		});
	},


	getMessages: function(transcript) {
		var me = this;

		return me.ChatActions.loadTranscript(transcript.get('RoomInfo'))
				.then(function(t) {
					var messages = t && t.get('Messages') || [];
					return Promise.resolve(messages);
				});
	},


	sortMessages: function(messages) {
		function timeSort(a, b) {
			var aRaw = a.raw || {CreatedTime: 0},
					bRaw = b.raw || {CreatedTime: 0};

			return aRaw.CreatedTime - bRaw.CreatedTime;
		}

		messages = Ext.Array.sort(messages, timeSort);
		return messages;
	},


	addBulkMessages: function(records) {
		this.clearPaging();

		records = this.sortMessages(records);
		if (this.chatWindow) {
			this.chatWindow.addBulkMessages(records);
		}
		return Promise.resolve();
	},


	insertBulkMessages: function(records) {
		this.clearPaging();

		records = this.sortMessages(records);
		if (this.chatWindow) {
			this.chatWindow.insertBulkMessages(0, records);
		}
		return Promise.resolve();
	},


	clearPaging: function() {
		var logView = this.chatWindow && this.chatWindow.logView;
		if (this.pagingCmp && logView) {
			logView.remove(this.pagingCmp);
			delete this.pagingCmp;
		}
	},


	maybeAddMoreEntry: function(lastLoadRecords) {
		var pageCount = Math.ceil(this.transcriptStore.getTotalCount() / this.PAGE_SIZE),
			hasMore = pageCount > 0 ? this.transcriptStore.currentPage < pageCount : false,
			logView = this.chatWindow && this.chatWindow.logView, me = this;

		if (logView && hasMore) {
			this.pagingCmp = logView.insert(0, {
				xtype: 'chat-pager-entry'
			});

			this.pagingCmp.onceRendered
				.then(function(){
					me.mon(me.pagingCmp.messageEl, 'click', me.loadNext.bind(me));		
				});
		}

		return Promise.resolve();
	},


	loadNext: function() {
		var currentPage = this.transcriptStore.currentPage,
			nextPage = currentPage + 1,
			param = {
				batchStart: (nextPage - 1) * this.PAGE_SIZE
			},
			s = this.transcriptStore;

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, param);
		s.loadPage(nextPage);
	}
});
