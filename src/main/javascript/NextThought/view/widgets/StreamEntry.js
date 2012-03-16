Ext.define('NextThought.view.widgets.StreamEntry', {
	extend: 'Ext.Component',
	alias: 'widget.streamEntry',

	requires: [
		'NextThought.util.AnnotationUtils'
	],

	renderTpl: new Ext.XTemplate(
			  '<div class="x-stream-entry {cls}">',
				  '<img src="{avatarURL}" width=48 height=48"/>',
				  '<div>',
						'<span class="name">{name}</span> ',
						'<div class="stream-text">{text}</div>',
				  '</div>',
			  '</div>'
			  ),

   renderSelectors: {
		box: 'div.x-stream-entry',
		name: '.x-stream-entry span.name',
		text: '.x-stream-entry span.text',
		icon: 'img'
	},


	change: null,

	initComponent: function(){
		var c = this.change.get('Creator'),
			u = NextThought.cache.UserRepository.getUser(c),
			data = this.getInfoPanel(u.get('realname'));

		data.avatarURL = u.get('avatarURL');
		this.renderData = data;
		this.callParent(arguments);
	},

	getInfoPanel: function(creator) {
		var ct = this.change.get('ChangeType'),
			i = this.change.get('Item'),
			it = (i) ? i.raw.Class : null,
			info;

		if (!i) {
			return {};
		}

		if (ct === 'Circled' && it === 'User') { info = this.getCircledInfo(i); }
		else if (ct === 'Shared' && it === 'Note') { info = this.getSharedNoteInfo(i); }
		else if (ct === 'Created' && it === 'Note') { info = this.getCreatedNoteInfo(i); }
		else if (ct === 'Modified' && it === 'Note') { info = this.getModifiedNoteInfo(i); }
		else if (ct === 'Shared' && it === 'Highlight') { info = this.getSharedHighlightInfo(i); }
		else if (ct === 'Modified' && it === 'Highlight') { info = this.getModifiedHighlightInfo(i); }
		else {
			//if we made it here, we don't know what to do with...
			console.warn('Not sure what to do with this in the stream!', this.change);
		}

		return {
			name: creator,
			text: info
		};

	},

	getCircledInfo: function(i) {
		return 'added you to a group.';
	},

	getCreatedNoteInfo: function(i) {
		var noteText = AnnotationUtils.compileBodyContent(i);

		return 'created a new note: "<i>' + noteText + '</i>"';
	},

	getSharedNoteInfo: function(i) {
		var noteText = AnnotationUtils.compileBodyContent(i);

		return 'shared a note: "<i>' + noteText + '</i>"';
	},

	getModifiedNoteInfo: function(i) {
		var noteText = AnnotationUtils.compileBodyContent(i);

		return 'modified a note: "<i>' + noteText + '</i>"';
	},

	getSharedHighlightInfo: function(i) {
		var hlText = this.cleanText(i.get('text'));

		return 'shared a highlight: "<i>' + hlText + '</i>"';
	},

	getModifiedHighlightInfo: function(i) {
		var hlText = this.cleanText(i.get('text'));

		return 'modified a highlight: "<i>' + hlText + '</i>"';
	},

	cleanText: function(t) {
		return Ext.String.ellipsis(Ext.String.trim(t.replace(/<.*?>/g, '')), 256, true);
	}
});
