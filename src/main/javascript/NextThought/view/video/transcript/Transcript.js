Ext.define('NextThought.view.video.transcript.Transcript',{
	extend:'Ext.Component',
	alias:'widget.video-transcript',

	requires:[
		'NextThought.webvtt.Transcript',
		'NextThought.webvtt.Cue'
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'text-contents', html:'{content}'}
	]),

	//	ui: 'content-slidevideo',
	cls: 'content-video-transcript',

	statics: {
		processTranscripts: function(c) {
			function n(n) { // digitize a number
				return n > 9 ? "" + n: "0" + n;
			}

			function addTimestamp(cur) {
				var mins = n( Math.floor(cur.getStartTime() / 60 )),
					secs = n( Math.floor(cur.getStartTime() % 60 )),
					timetext = mins + ":" + secs;

				return "<p class='par timestamp-container'>" + "<a href='' class='timestamp'>" +
					timetext + "</a>" + "</p>";
			}

			function appendCues(comb, cur){
				var type = cur.getText(), span;

				if (Ext.Array.contains(parser.sections, cur.getIdentifier())) {
					comb = comb + addTimestamp(cur);
				}

				// surround each bit of text by a span indicating the time, and fold it into
				// the existing content
				span = "<span data-start='" + cur.getStartTime().toFixed(2) +
					"' data-stop='" + cur.getEndTime().toFixed(2) + "'>";

				return  comb + " " + span + type + "</span>";
			}


			var parser = new NextThought.webvtt.Transcript({
					input: c,
					ignoreLFs: true
				}),
				cueList = parser.parseWebVTT(),
				transcribed = (cueList.reduce(appendCues, "").trim());

			return transcribed;
		}
	},


	constructor: function(config){
		var r = this.callParent(arguments);
		this.content = config.textContent; //&& this.processTranscripts(config.textContent);
		return r;
	},


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			content: this.content
		});
	},

	afterRender: function(){
		this.callParent(arguments);

		Ext.defer(this.updateLayout, 1, this);
	}





});
