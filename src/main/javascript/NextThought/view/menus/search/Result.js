Ext.define('NextThought.view.menus.search.Result', {
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',

	SYSTEM_CREATOR: 'system',

	requires: ['NextThought.util.Search'],

	mixins: {
		purchasable: 'NextThought.mixins.store-feature.Purchasable'
	},

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{title}', cn: [
			{tag: 'tpl', 'if': 'chapter', cn: [' / ', {cls: 'chapter', html: '{chapter}'}]},
			{tag: 'tpl', 'if': 'section', cn: [{cls: 'section', html: '{section}'}]}
		]},
		{
			cls: 'wrap',
			cn: [
				{tag: 'tpl', 'if': 'name', cn: [{cls: 'name hello', html: '{name}'}]},
				{cls: 'fragments', cn: [
					{tag: 'tpl', 'for': 'fragments', cn: [
						{cls: 'fragment', ordinal: '{#}', html: '{.}'}
					]}
				]}
			]
		}
	]),

	renderSelectors: {
		'name': '.name'
	},

	initComponent: function() {
		var hit = this.hit,
			name = this.hit.get('Creator');

		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			title: '&nbsp;',
      chapter: '',
      section: '&nbsp;',
			name: name,
			fragments: Ext.pluck(hit.get('Fragments'), 'text')
		});

		this.fillInData();
	},

	fillInData: function() {
		var me = this,
			hit = me.hit, p,
			containerId = hit.get('ContainerId'),
			name = hit.get('Creator');

		if (isMe(name)) {
			me.renderData.name = 'me';
		} else if (name === this.SYSTEM_CREATOR) {
			me.renderData.name = '';
		} else if (name) {
			UserRepository.getUser(name, function(user) {
				me.renderData.name = user.getName();
				if (me.rendered) {
					me.name.update(user.getName());
				}
			});
		}

		LocationMeta.getMeta(containerId)
				.then(function(meta) {
					if (meta) {
						me.fillInContentMeta(meta);

						if (me.rendered) {
							me.renderTpl.overwrite(me.el, me.renderData);
						}
					}
				})
				.fail(function() {
					ContentUtils.findContentObject(containerId, function(obj, meta) {
						if (obj && meta && /ntivideo/.test(obj.mimeType || obj.MimeType)) {
							me.videoObject = obj;
							me.fillInContentMeta(meta, true);
							me.renderData.section = obj.title;
							if (me.rendered) {
								me.renderTpl.overwrite(me.el, me.renderData);
							}
						} else if (!obj || !meta) {
							p = CourseWareUtils.courseForNtiid(containerId) || ContentUtils.purchasableForContentNTIID(containerId);
							if (p) {
								me.handlePurchasable(p);
							}
						}
					});
				});
	},


	handlePurchasable: function(purchasable) {
		if (!this.rendered) {
			this.on({
				afterrender: this.handlePurchasable.bind(this, purchasable),
				single: true
			});
			return;
		}

		var me = this,
			title = me.el.down('.title'),
			tpl = me.needsActionTplMap[purchasable.get('MimeType')];

		me.requiresPurchase = true;
		me.purchasable = purchasable;
		me.addCls('purchase');
		if (tpl) {
			me[tpl].overwrite(title, purchasable.getData(), true);
		}

		Ext.DomHelper.append(me.el.down('.wrap').setStyle({position: 'relative'}), {
			cls: 'purchasable-mask',
			style: {top: (title.getY() - me.el.getY()) + 'px'}
		});
	},


	fillInContentMeta: function(meta, dontScrewWithLineage) {
		var lin = ContentUtils.getLineage(meta.NTIID),
			chap = [];

			lin.pop(); //remove root, we will already have it after resolving "id"
		if (!dontScrewWithLineage) {
			lin.shift();//remove the first item as its identical as id.
		}

		Ext.each(lin, function(c) {
			var i = ContentUtils.getLocation(c);
			if (!i) {
				console.warn(c + ' could not be resolved');
				return;
			}
			chap.push(i.label);//the lineage is ordered leaf->root...this list needs to be in reverse order.
		});

		this.renderData = Ext.apply(this.renderData || {}, {
			title: meta ? meta.title.get('title') : 'Untitled',
			chapter: chap.reverse().join(' / '),
			section: meta ? meta.label : 'Unlabeled'
		});
	},

	//This code assumes matches within fragments don't overlap, which I was told can be guarenteed
	wrapFragmentHits: function() {
		var fragments = this.hit.get('Fragments'),
			wrappedFragmentText = [],
			me = this;

		Ext.each(fragments, function(fragment, index) {
			var wrappedText = fragment.text;
			if (!fragment.matches || fragment.matches.length === 0 || !fragment.text) {
				console.warn('No matches or text for fragment. Dropping', fragment);
			}
			else {
				//Sort the matches backwards so we can do string replaces without invalidating
				fragment.matches.sort(function(a, b) {return b[0] - a[0];});
				Ext.each(fragment.matches, function(match, idx) {
					//Attempt to detect bad data from the server
					var next = idx + 1 < fragment.matches.length ? fragment.matches[idx + 1] : [0, 0],
						newString = '';
					if (next[1] > match[1]) {
						console.warn('Found a match that is a subset of a previous match.  Server breaking its promise?', fragment.matches);
						return true; //continue
					}

					newString += wrappedText.slice(0, match[0]);
					newString += Ext.DomHelper.markup({tag: 'span', html: wrappedText.slice(match[0], match[1])});
					newString += wrappedText.slice(match[1]);
					wrappedText = newString;
				});
			}
			wrappedFragmentText.push(wrappedText);
		});

		this.renderData.fragments = wrappedFragmentText || this.renderData.fragments;

	},

	beforeRender: function() {
		this.wrapFragmentHits();
		return this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);
		this.getEl().on({
			scope: this,
			animationend: this.animationEnd,
			webkitAnimationEnd: this.animationEnd,
			click: this.clicked
		});
	},


	animationEnd: function() {
		this.getEl().removeCls('pulse');
	},

	clicked: function(e) {
		var target = Ext.fly(e.target),
			selector = '.fragment',
			fragNode = target.is(selector) ? e.target : target.parent(selector, true),
			fragIdx, toFlash;


		if (this.requiresPurchase) {
			this.purchasable.fireAcquisitionEvent(this);
			return;
		}


		if (fragNode) {
			fragIdx = Ext.fly(fragNode).getAttribute('ordinal');
			fragIdx = fragIdx ? parseInt(fragIdx, 10) : undefined;
			//Make it 0 indexed
			if (fragIdx !== undefined) {
				fragIdx--;
			}
			toFlash = fragNode;
		}
		else {
			toFlash = this.getEl();
		}

		Ext.fly(toFlash).addCls('pulse');
		Ext.defer(function() {
			Ext.fly(toFlash).removeCls('pulse');
		}, 1000);

		this.doClicked(fragIdx);
	},

	doClicked: function(fragIdx) {
		this.fireEvent('click', this, fragIdx);
	}
});
