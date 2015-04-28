Ext.define('NextThought.view.account.history.mixins.Note', {
	alias: 'widget.history-item-note',
	keyVal: 'application/vnd.nextthought.note',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history note',
			cn: [
				{cls: 'path', html: '{path}'},
				{cls: 'location', html: '{location}'},
				{cls: 'body', cn: [
					{tag: 'span', html: '{preview}'}
				]}
			]
		}
	])),


	constructor: function(config) {
		Ext.apply(this, config);
		if (!this.panel) {
			return;
		}

		this.panel.registerSubType(this.keyVal, this.tpl);
		this.panel.registerFillData(this.keyVal, this.fillInData);
		this.panel.registerClickHandler(this.keyVal, this.clicked);
	},


	clicked: function(view, rec) {
		var cid = rec.get('ContainerId');
		view.fireEvent('navigation-selected', cid, rec);
	},


	fillInData: function(rec) {
		LocationMeta.getMeta(rec.get('ContainerId'))
			.then(function(meta) {
				return ContentUtils.getLineageLabels((meta && meta.NTIID) || rec.get('ContainerId'), true);
			})
			.fail(function(reason) {
				console.error('Failed to get meta for record: ', reason);
				return ContentUtils.getLineageLabels(rec.get('ContainerId'), true);
			})
			.then(function(lineage) {
				var location = lineage.shift();

				lineage.reverse();

				rec.set({
					location: Ext.String.ellipsis(location, 150, false),
					path: lineage.join(' / ')
				});
			});

		// rec.on("convertedToPlaceholder", function(){
		//	console.log("Item removed");
		//	this.destroy();
		// });
	}
});
