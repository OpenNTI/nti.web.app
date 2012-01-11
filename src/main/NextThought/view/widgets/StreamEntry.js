Ext.define('NextThought.view.widgets.StreamEntry', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.streamEntry',

	requires: [
		'NextThought.util.AnnotationUtils'
	],

	cls: 'x-stream-entry',
	defaults: {border: false},
	layout: {type: 'hbox', align: 'top'},
	border: false,
	width: '100%',
	change: null,

	initComponent: function(){
		this.callParent(arguments);

		var c = this.change.get('Creator'),
			u = NextThought.cache.UserRepository.getUser(c),
			i = this.change.get('Item'),
			text = this.getInfoPanel(u.get('realname'));
		//Add avatar:
		this.add(this.getAvatarImage(u));

		//Add content
		if (text) this.add(text);
	},

	getInfoPanel: function(creator) {
		var ct = this.change.get('ChangeType'),
			i = this.change.get('Item'),
			it = (i) ? i.raw.Class : null,
			name = '<div class="stream-username">'+creator+'</div>',
			info;

		if (!i) return null;

		if (ct == 'Circled' && it == 'User') info = this.getCircledInfo(i);
		else if (ct == 'Shared' && it == 'Note') info = this.getSharedNoteInfo(i);
		else if (ct == 'Created' && it == 'Note') info = this.getCreatedNoteInfo(i);
		else if (ct == 'Modified' && it == 'Note') info = this.getModifiedNoteInfo(i);
		else if (ct == 'Shared' && it == 'Highlight') info = this.getSharedHighlightInfo(i);
		else if (ct == 'Modified' && it == 'Highlight') info = this.getModifiedHighlightInfo(i);
		else {
			//if we made it here, we don't know what to do with...
			console.warn('Not sure what to do with this in the stream!', this.change);
		}

		return {
			flex: 1,
			html: name + '<div class="stream-text">'+info+'</div>'
		};

	},

	getCircledInfo: function(i) {
		var circledUser = i.get('realname');

		return 'added <i>' + circledUser + '</i> to a group.';
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

	getAvatarImage: function(u) {
		var url = u.get('avatarURL');
		return {xtype: 'box', autoEl: {width: 48, height: 48, src: url, tag: 'img'}};
	},

	cleanText: function(t) {
		return Ext.String.ellipsis(Ext.String.trim(t.replace(/<.*?>/g, '')), 256, true);
	}
});
