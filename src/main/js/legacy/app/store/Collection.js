const Ext = require('extjs');

const AnnotationUtils = require('legacy/util/Annotations');

require('legacy/common/components/Collection');


module.exports = exports = Ext.define('NextThought.app.store.Collection', {
	extend: 'NextThought.common.components.Collection',
	alias: 'widget.purchasable-collection',

	overItemCls: 'over',
	ui: 'library-collection',
	cls: 'purchasables',
	rowSpan: 3,

	ellipsis: Ext.DomHelper.createTemplate({cls: 'ellipsis', cn: [{},{},{}]}).compile(),

	tpl: Ext.DomHelper.markup([
		{ cls: 'stratum collection-name', cn: [
			'{name}', {cls: 'count', html: '{count}'}
		]},
		{ cls: 'grid', cn: { tag: 'tpl', 'for': 'items', cn: ['{entry}']} }
	]),

	entryTpl: Ext.DomHelper.markup({
		cls: '{inGrid} purchasable item {Class:lowercase} {featured:boolStr("featured")} {Activated:boolStr("activated")} row-{rows} col-{cols}',
		'data-qtip': '{Title:htmlEncode}', cn: [
			{ cls: 'cover', cn: [
				{tag: 'img', src: '{Icon}'}
			]},
			{ cls: 'meta', cn: [
				{ cls: 'title', html: '{Title}' },
				{ cls: 'author', html: '{Provider}' },
				{tag: 'tpl', 'if': 'Amount', cn: { cls: 'price', html: '{Amount:ntiCurrency(values.Currency)}'}},
				{ cls: 'description', html: '{Description}'},
				{tag: 'tpl', 'if': 'HasHistory', cn: [
					{ cls: 'history', html: 'Purchase History'}
				]}
			]}
		]
	}),

	afterRender: function () {
		this.callParent(arguments);
		var container = this.up('library-view-container'),
			page = this.up('library-view-page');

		if (container) {
			this.mon(container, 'activate', 'refresh', this);
		} else {
			console.warn('no container?');
		}

		if (page) {
			this.mon(page, 'activate', 'refresh', this);
		} else {
			console.warn('no page?');
		}
	},

	collectData: function (records, index) {
		const rows = this.rowSpan;
		const data = this.callParent(arguments);
		//Unspoken gotcha: index is the index of the updated record, since we set the first to be featrued by
		// default, 0 is false, so it still gets set as featured.  If we ever change this logic, this check
		// will no longer be sufficiant.
		// const updating = !!index;

		Ext.each(data.items, function (i, x) {
			var cols = 2;

			i.inGrid = 'grid-item';

			// if (rows > 1 && !updating && (x === 0 || i.Featured)) {
			//	i.featured = true;
			//	cols = 4;
			// }

			i.rows = rows;
			i.cols = cols;
		});
		return data;
	},

	onBeforeItemClick: function (record, item, idx, event) {
		var t = event && event.getTarget && event.getTarget();

		if (t && Ext.fly(t).hasCls('history')) {
			this.fireEvent('history-click', record);
			return false;
		}

		return true;
	},


	onItemUpdate: function (node) {
		var desc = Ext.fly(node).down('.description', true),
			prev = Ext.fly(node).down('.history', true),
			pos, e, texts, bottom,
			marker = 'This will need to be optimized, bute force is slow. Moving ellipsis took:';

		if (!desc || !Ext.fly(desc).isVisible(true)) {
			return;
		}

		pos = Ext.fly(desc).getPositioning(true);
		pos.right = pos.left;
		pos.position = 'absolute';
		pos.bottom = (parseInt(pos.right, 10) + ((prev && Ext.fly(prev).getHeight()) || 0)) + 'px';

		Ext.fly(desc).setPositioning(pos);

		//if (desc.scrollHeight <= desc.offsetHeight) {
		//	console.log('no need');
		//	return;
		//}



		bottom = desc.getBoundingClientRect().bottom - parseInt(pos.right, 10);//margin


		/*
		TODO: Make this MUCH more efficient.
		Using a 0px span to binary search the insertion point would be WAY more effcient. As it is now, with Prmia's
		description, it takes 599 moves to settle on the correct spot. ICK.
		 */

		//Get all text nodes and split on spaces
		texts = AnnotationUtils.getTextNodes(desc);
		Ext.each(texts, function (v) {
			var i;
			do {
				i = v.nodeValue.indexOf(' ');
				if (i >= 0) {
					v = v.splitText(i);
					//split the space
					v = v.splitText(1);
				}
			} while (v && i >= 0);
		});

		//then append the ellipsis node
		e = this.ellipsis.append(desc);

		//then move it up the sibling links until it peeks into view.
		console.time(marker);
		//This assumes that the description is of the form (<heading><textnode>){1,n}
		// If that changes then this block will not work.
		while (e.previousSibling && e.getBoundingClientRect().top > bottom) {
			desc.insertBefore(e, e.previousSibling);
			desc.removeChild(e.nextSibling);
		}
		console.timeEnd(marker);

		//Reset the bottom position to auto.
		pos.bottom = 'auto';//now let the bottom auto flow
		Ext.fly(desc).setPositioning(pos);
	},


	detectOverflow: function () {
		console.log('Detecting overflow...');
		Ext.each(this.getNodes(), function (v) {this.onItemUpdate(v);},this);
	},


	refresh: function () {
		this.callParent(arguments);
		this.detectOverflow();
	},

	onUpdate: function (store, rec) {
		this.callParent(arguments);
		var n = this.getNode(rec);
		if (n) {
			this.onItemUpdate(n);
		}
	}
});
