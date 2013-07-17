Ext.define('NextThought.model.transcript.TranscriptItem', {
	extend: 'Ext.data.Model',

	fields: [
		{name:'url', type:'string'},
		{name:'jsonUrl', type:'string'},
		{name:'mimeType', type:'string'},
		{name:'basePath', type:'string'},
		{name:'associatedVideoId', type:'string'},
		{name:'contentElement', type:'auto'}
	],

	statics:{

		fromDom: function(el, reader){
			var t  = Ext.fly(el).down('object[type*=mediatranscript]'),
				url, type, jsonUrl, assocVideoId, o;

			if(!t){
				return null;
			}

			url =  Ext.fly(t).down('param[name=src]').getAttribute('value');
			type = Ext.fly(t).down('param[name=type]').getAttribute('value');
			jsonUrl = Ext.fly(t).down('param[name=srcjsonp]').getAttribute('value');
			assocVideoId = Ext.fly(el).is('object[type$=ntivideo]') && Ext.fly(el).getAttribute('data-ntiid');

			return this.create({
				url:url,
				type:type,
				jsonUrl:jsonUrl,
				basePath: reader && reader.basePath,
				contentElement: t,
				associatedVideoId: assocVideoId
			});
		}
	}
});