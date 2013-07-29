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
			C = ContentUtils;

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
				s = Ext.getStore('Purchasable'),
				p = s && s.purchasableForContentNTIID(ntiid);

			if (resp.status === 403 && p) {
				me.requiresPurchase = true;
				me.purchasable = p;
				el = el.up('.content-callout').removeCls('content-callout').addCls('purchase');
				me.needsPurchaseTpl.overwrite(el, p.getData(), true);
				me.clearManagedListeners();
				me.mon(el,'click', me.navigateToItem, me);

				Ext.DomHelper.append(me.getEl(), {
					cls: 'purchasable-mask',
					style: {top: (me.itemEl.getY() - me.el.getY()) + 'px'}
				});
				return;
			}
			el.remove();
		}

		LocationMeta.getMeta(cid, function (meta) {
			metaInfo = meta;

			function upLoc() {
				if(!me.locationEl){ return; }

				if (metaInfo) {
					me.locationEl.update(metaInfo.getPathLabel());
					return;
				}
				me.locationEl.remove();
			}

			C.spider(cid, Ext.Function.createSequence(upLoc, fin, me), parse, error);
		}, me);
	},


	setContext: function (doc) {
		var r = this.record, newContext;
		try {
			if(this.context){
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
	}
});
