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


	loadContext: function(fin) {
		if (!this.rendered) {
			this.on('afterrender', Ext.bind(this.loadContext, this, [fin]), this, {single: true});
			return;
		}

		var me = this,
			r = me.record,
			cid = r.get('ContainerId');

		if (r.focusRecord) {
			this.on('add', function(container, newChild, idx) {
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

		LocationMeta.getMeta(cid)
				.then(this.fillInMeta.bind(this), this.fillInMetaFromObject.bind(this, cid))
				.fail(this.maybeRestricted.bind(this, cid));
	},


	maybeRestricted: function(ntiid) {
		var el = this.context.up('.context'), p;

		p = CourseWareUtils.courseForNtiid(ntiid) || ContentUtils.purchasableForContentNTIID(ntiid);
		if (p && !p.isActive()) {
			this.handlePurchasable(p, el);
		}
	},


	fillInMeta: function(meta) {
		var me = this, C = ContentUtils;
		return new Promise(function(fulfill, reject) {
			C.spider(meta.NTIID,
					function spiderComplete() {
						if (me.locationEl) {
							me.locationEl.update(meta.getPathLabel());
						}
						fulfill();
					},
					function parse(content) {
						me.setContext(C.parseXML(C.fixReferences(content, meta.absoluteContentRoot)));
					},
					reject);
		});
	},


	fillInMetaFromObject: function(ntiid) {
		var me = this;
		return new Promise(function(fulfill, reject) {
			var rj = setTimeout(reject.bind(me, 'Timeout'), 30000);

			ContentUtils.findContentObject(ntiid, function(obj, meta) {
				var context;
				clearTimeout(rj);
				if (!me.isDestroyed) {
					//TOOD need a generic framework for various objects here
					if (obj && /ntivideo/.test(obj.mimeType || obj.MimeType)) {
						me.handleVideo(obj, meta);
					}
					else {
						meta = ContentUtils.getLocation(ntiid);
						if (meta) {
							//handle a card
							context = (meta.location && meta.location.getAttribute('desc')) || 'No description or excerpt for this content.';
							me.locationEl.update(meta.getPathLabel());
							me.context.update(context);
						} else {
							return reject();
						}
					}
				}
				fulfill();
			});
		});
	},


	handleVideo: function(obj, meta) {
		var me = this, src, sources, contextEl;
		console.log('Need to set context being video', obj);
		if (meta) {
			try {
				me.locationEl.update(meta.getPathLabel());
				if (me.context) {
					contextEl = me.context.up('.context');
					if (contextEl) {
						contextEl.addCls('video-context');
					}
					me.context.setHTML('');
				}

				sources = obj.sources;

				if (!Ext.isEmpty(sources)) {
					src = sources.first().thumbnail;
				}

				Ext.DomHelper.append(me.context, [
					{html: obj.title},
					{
						tag: 'img',
						cls: 'video-thumbnail',
						src: src
					}]);
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}
	},


	handlePurchasable: function(purchasable, el) {
		var me = this,
			tpl = me.needsActionTplMap[purchasable.get('MimeType')];

		me.requiresPurchase = true;
		me.purchasable = purchasable;
		el = el.up('.content-callout').removeCls('content-callout').addCls('purchase');

		if (tpl) {
			me[tpl].overwrite(el, purchasable.getData(), true);
		}
		me.clearManagedListeners();
		me.mon(el, 'click', me.navigateToItem, me);

		Ext.DomHelper.append(me.getEl(), {
			cls: 'purchasable-mask',
			style: {top: (me.itemEl.getY() - me.el.getY()) + 'px'}
		});
	},


	setContext: function(doc) {
		var r = this.record, newContext;
		try {
			if (this.context) {
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


	navigateToItem: function() {
		//Show purchase window if we're purchase-able
		if (this.requiresPurchase) {
			this.purchasable.fireAcquisitionEvent(this);
			return;
		}

		this.fireEvent('navigation-selected', this.record.get('ContainerId'), this.record);
	},


	getCommentCount: function(record) {
		return record.getReplyCount();
	},

	setRenderedTitle: function(record) {},


	setRecordTitle: function() {
		function callback(snip, value) {
			if (snip && snip !== value) {
				me.subjectEl.set({'data-qtip': value});
			}

			me.subjectEl.update(snip || 'Subject');
			if (!snip) {
				me.subjectEl.addCls('no-subject');
				me.name.addCls('no-subject');
			}
			else {
				me.subjectEl.removeCls('no-subject');
				me.name.removeCls('no-subject');
			}
		}

		var me = this;
		me.record.resolveNoteTitle(callback, 30);
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.loadContext();
		this.record.compileBodyContent(this.setBody, this, null, this.self.WhiteboardSize);
	},

	afterRender: function() {
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

	showReplies: function() {
		this.navigateToItem();
	}
});
