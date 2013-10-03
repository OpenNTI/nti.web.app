Ext.define('NextThought.view.menus.search.TranscriptResult', {
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-videotranscript',
	cls: 'search-result search-result-transcript',

	fillInData: function() {
		var me = this,
			hit = me.hit;

		ContentUtils.findContentObject(hit.get('NTIID'), function(obj, meta) {
			if (obj && meta && /ntivideo/.test(obj.mimeType || obj.MimeType)) {
				me.videoObject = obj;
				me.fillInContentMeta(meta, true);
				me.renderData.section = obj.title;
				if (me.rendered) {
					me.renderTpl.overwrite(me.el, me.renderData);
				}
			}
		});
	},

	doClicked: function(fragIdx) {
		console.log('Transcript search result clicked', this.hit.get('StartMilliSecs'), this.videoObject);
		this.fireEvent('click-transcript-result', this, fragIdx);
	}
});
