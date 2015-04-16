Ext.define('NextThought.view.menus.search.TranscriptResult', {
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-videotranscript',
	cls: 'search-result search-result-transcript',


	doClicked: function(fragIdx) {
		console.log('Transcript search result clicked', this.hit.get('StartMilliSecs'), this.videoObject);
		this.fireEvent('click-transcript-result', this, fragIdx);
	},

	getNTIID: function() {
		return this.hit.get('NTIID');
	}
});
