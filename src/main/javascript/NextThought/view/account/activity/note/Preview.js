Ext.define('NextThought.view.account.activity.note.Preview', {
	extend: 'NextThought.view.account.activity.Preview',
	alias: 'widget.activity-preview-note',

	requires: [
		'NextThought.mixins.note-feature.GetLatestReply',
		'NextThought.view.account.activity.note.Reply'
	],

	mixins: {
		getLatestReply: 'NextThought.mixins.note-feature.GetLatestReply',
		purchasable: 'NextThought.mixins.store-feature.Purchasable'
	},

	renderSelectors: {
		locationEl: '.location',
		context: '.context .text'
	},

	defaultType: 'activity-preview-note-reply',

	toolbarTpl: Ext.DomHelper.markup({ cls: 'content-callout', cn: [
		{ cls: 'location'},
		{ cls: 'context', cn: [
			{cls: 'text'}
		] }
	]}),


	loadContext: function (fin) {
		if(!this.rendered){
			this.on('afterrender', Ext.bind(this.loadContext, this, [fin]), this, {single:true});
			return;
		}

		var me = this,
			r = me.record,
			cid = r.get('ContainerId'),
			metaInfo,
			C = ContentUtils,
			metaHandled = true;

		if (r.focusRecord) {
			this.on('add', function (container, newChild, idx) {
				if (newChild.record.getId() !== r.focusRecord.getId()) {
					console.log('Add focus record');
				}
			}, this, {single: true});
		}

		if (!r.placeholder) {
			this.getItemReplies();
		}
		else if (r.placeholder && !Ext.isEmpty(r.children)) {
			this.add({record: r.children.first(), autoFillInReplies: false});
		}

		function parse(content) {
			var dom = C.parseXML(C.fixReferences(content, metaInfo.absoluteContentRoot));
			me.setContext(dom);
		}

		function error(req, resp) {
			req = resp.request;
			var el = me.context.up('.context'),
				ntiid = req && req.ntiid,
				p = ContentUtils.purchasableForContentNTIID(ntiid);

			if (resp.status === 403 && p) {
				me.handlePurchasable(p, el);
				Ext.callback(fin);
				return;
			}

			metaHandled = false;

			ContentUtils.findContentObject(cid, function(obj, meta){
				//TOOD need a generic framework for various objects here
				if(obj && /ntivideo/.test(obj.mimeType || obj.MimeType)){
					var src, sources, contextEl;
					console.log('Need to set context being video', obj);
					if(meta){
						me.locationEl.update(meta.getPathLabel());
						if(me.context){
							contextEl = me.context.up('.context');
							if(contextEl){
								contextEl.addCls('video-context');
							}
							me.context.setHTML('');
						}

						sources = obj.sources;

						if(!Ext.isEmpty(sources)){
							src = sources.first().thumbnail;
						}

						Ext.DomHelper.append(me.context, [
							{html: obj.title},
							{
								tag: 'img',
								cls: 'video-thumbnail',
								src: src
							}]);
					}
				}
				else{
					if(resp.status === 404 && p){
						me.handlePurchasable(p, el);
						Ext.callback(fin);
						return;
					}
					el.remove();
				}
				Ext.callback(fin);
			});
		}

		LocationMeta.getMeta(cid, function (meta) {
			metaInfo = meta;

			function upLoc() {
				if(!me.locationEl){ return; }

				if (metaInfo) {
					me.locationEl.update(metaInfo.getPathLabel());
					return;
				}
				if(metaHandled){
					me.locationEl.remove();
					Ext.callback(fin);
				}
			}

			C.spider(cid, upLoc, parse, error);
		}, me);
	},


	handlePurchasable: function(purchasable, el){
		var me = this,
			tpl = me.needsActionTplMap[purchasable.get('MimeType')];

		me.requiresPurchase = true;
		me.purchasable = purchasable;
		el = el.up('.content-callout').removeCls('content-callout').addCls('purchase');

		if(tpl){
			me[tpl].overwrite(el, purchasable.getData(), true);
		}
		me.clearManagedListeners();
		me.mon(el,'click', me.navigateToItem, me);

		Ext.DomHelper.append(me.getEl(), {
			cls: 'purchasable-mask',
			style: {top: (me.itemEl.getY() - me.el.getY()) + 'px'}
		});
	},


	setContext: function (doc) {
		var r = this.record, newContext;
		try {
			if( this.context ){
				this.context.setHTML('');
			}
			newContext = RangeUtils.getContextAroundRange(
				r.get('applicableRange'), doc, doc, r.get('ContainerId'));

			if (newContext) {
				this.context.appendChild(newContext);
			}
		}
		catch (e2) {
			console.error(Globals.getError(e2));
		}

	},


	navigateToItem: function () {
		//Show purchase window if we're purchase-able
		if (this.requiresPurchase) {
			this.fireEvent('show-purchasable', this, this.purchasable);
			return;
		}

		this.fireEvent('navigation-selected', this.record.get('ContainerId'), this.record);
	},


	getCommentCount: function (record) {
		return record.getReplyCount();
	},

	setRenderedTitle: function(record){},


	setRecordTitle: function(){
		function callback(snip, value){
			if(snip && snip !== value){
				me.subjectEl.set({'data-qtip':value});
			}

			me.subjectEl.update(snip || 'Subject');
			if(!snip){
				me.subjectEl.addCls('no-subject');
				me.name.addCls('no-subject');
			}
			else{
				me.subjectEl.removeCls('no-subject');
				me.name.removeCls('no-subject');
			}
		}

		var me  = this;
		me.record.resolveNoteTitle(callback, 30);
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.loadContext();
		this.record.compileBodyContent(this.setBody, this, null, this.self.WhiteboardSize);
	},

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.locationEl, 'click', this.navigateToItem, this);
		this.mon(this.context, 'click', this.navigateToItem, this);

		if (this.record.placeholder) {
			this.respondEl.remove();
			this.name.update('Deleted');
			this.timeEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.timeEl.hide();
		}

		this.setRecordTitle();
	},

	showReplies: function(){
		this.navigateToItem();
	}
});
