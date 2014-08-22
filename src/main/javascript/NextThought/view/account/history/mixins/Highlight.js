Ext.define('NextThought.view.account.history.mixins.Highlight', {
	extend: 'NextThought.view.account.history.mixins.Note',
	keyVal: 'application/vnd.nextthought.highlight',
	alias: 'widget.history-item-highlight',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history highlight',
			cn: [
				{cls: 'path', html: '{path}'},
				{cls: 'location', html: '{location}'},
				{cls: 'body', cn: [
					{tag: 'span', html: '{textBodyContent}'}
				]}
			]
		}
	])),

	fillInData: function(rec) {
		LocationMeta.getMeta(rec.get('ContainerId'))
			.then(function(meta) {
				if (!meta) {
					return [];
				}

				return ContentUtils.getLineageLabels(meta.NTIID, true);
			})
			.then(function(labels) {
				var location = labels.shift();

				labels.reverse();

				rec.set({
					location: Ext.String.ellipsis(location, 150, false),
					path: labels.join(' / '),
					textBodyContent: rec.get && rec.get('selectedText')
				});
			});
	}

});
