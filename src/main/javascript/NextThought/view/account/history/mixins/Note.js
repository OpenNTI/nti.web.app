Ext.define('NextThought.view.account.history.mixins.Note', {
	alias: 'widget.history-item-note',
	keyVal: "application/vnd.nextthought.note",

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history note',
			cn: [
				{cls: 'path', html: '{path}'},
				{cls: 'location', html: '{location}'},
				{cls: 'body', cn: [
					{tag: 'span', html: '{textBodyContent}'}
				]}
			]
		}
	])),


	constructor: function (config) {
		Ext.apply(this, config);
		if (!this.panel) {
			return;
		}

		this.panel.registerSubType(this.keyVal, this.tpl);
		this.panel.registerFillData(this.keyVal, this.fillInData);
		this.panel.registerClickHandler(this.keyVal, this.clicked);
	},


	clicked: function (view, rec) {
		var cid = rec.get('ContainerId');
		view.fireEvent('navigation-selected', cid, rec);
	},


	fillInData: function (rec) {
		LocationMeta.getMeta(rec.get('ContainerId'), function (meta) {
			var lineage = [],
				location = '';

			lineage = ContentUtils.getLineage((meta && meta.NTIID) || rec.get('ContainerId'), true);
			if (!Ext.isEmpty(lineage)) {
				location = lineage.shift();
				lineage.reverse();
			}

			rec.set({
				'location': Ext.String.ellipsis(location, 150, false),
				'path': lineage.join(' / '),
				'textBodyContent': rec.getBodyText && rec.getBodyText()
			});
		});

		// rec.on("convertedToPlaceholder", function(){
		//	console.log("Item removed");
		//	this.destroy();
		// });
	}
});
