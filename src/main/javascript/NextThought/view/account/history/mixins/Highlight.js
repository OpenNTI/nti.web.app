Ext.define('NextThought.view.account.history.mixins.Highlight',{
	extend: 'NextThought.view.account.history.mixins.Note',
	keyVal: 'application/vnd.nextthought.highlight',
	alias: 'widget.history-item-highlight',

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history highlight',
			cn:[
				{cls: 'path', html:'{path}'},
				{cls: 'location', html:'{location}'},
				{cls: 'body', cn:[
					{tag: 'span', html: '{textBodyContent}'}
				]}
			]
		}
	])),

	fillInData: function(rec){
		LocationMeta.getMeta(rec.get('ContainerId'),function(meta){
			var lineage = [],
				location = '';

			if(!meta){
				console.warn('No meta for '+rec.get('ContainerId'));
			}
			else {
				lineage = LocationProvider.getLineage(meta.NTIID,true);
				location = lineage.shift();
				lineage.reverse();
			}

			rec.set({'location': Ext.String.ellipsis(location, 150, false)});
			rec.set({'path': lineage.join(' / ')});
			rec.set({'textBodyContent': rec.get && rec.get('selectedText')});
		});
	}

});