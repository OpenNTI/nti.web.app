Ext.define('NextThought.model.transcript.TranscriptItem', {
	extend: 'Ext.data.Model',

	fields: [
		{name: 'url', type: 'string'},
		{name: 'jsonpUrl', type: 'string'},
		{name: 'contentType', type: 'string'},
		{name: 'content', type: 'auto'},
		{name: 'basePath', type: 'string'},
		{name: 'associatedVideoId', type: 'string'},
		{name: 'contentElement', type: 'auto'},
		{name: 'desired-time-start', type: 'number', persist: false},
		{name: 'desired-time-end', type: 'number', persist: false}
	],

	statics: {

		fromDom: function (el, basePath) {
			var t = Ext.fly(el).down('object[type*=mediatranscript]'),
					url, type, jsonpUrl, assocVideoId, o;

			if (!t) {
				return null;
			}

			url = Ext.fly(t).down('param[name=src]').getAttribute('value');
			type = Ext.fly(t).down('param[name=type]').getAttribute('value');
			jsonpUrl = Ext.fly(t).down('param[name=srcjsonp]').getAttribute('value');
			assocVideoId = Ext.fly(el).is('object[type$=ntivideo]') && Ext.fly(el).getAttribute('data-ntiid');

			return this.create({
								   url:               url,
								   contentType:       type,
								   jsonpUrl:          jsonpUrl,
								   basePath:          basePath,
								   contentElement:    t,
								   associatedVideoId: assocVideoId
							   });
		},


		fromVideo: function (v, basePath) {
			var o = v.get('transcripts');

			//For now, since we only assume there is one transcript per video, we can do this:
			o = o && o[0];

			return this.create({
								   url:               o.src,
								   jsonpUrl:          o.srcjsonp,
								   contentType:       o.type,
								   basePath:          basePath,
								   associatedVideoId: v.get('NTIID')
							   });
		}
	}
});