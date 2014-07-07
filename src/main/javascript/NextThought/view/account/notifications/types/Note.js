Ext.define('NextThought.view.account.notifications.types.Note', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-note',
	keyVal: 'application/vnd.nextthought.note',

	showCreator: true,
	wording1: getString('NextThought.view.account.notifications.types.Note.wording', '{creator} shared a note.'),
	wording2: getString('NextThought.view.account.notifications.types.NoteReply.wording', '{creator} commented on a note.'),
	wording3: getString('NextThought.view.account.notifications.types.Note.titlewording', '{creator} shared a note: {title}.'),
	previewField: 'preview',

	/*
		If the note is a reply it will return this preview of the comment
		If the note is not a reply and it has a title it will return ''
		If the note is not a reply and it doesn't have a title it will return the preview.
	 */
	getBody: function(values) {
		var isComment = values.inReplyTo || (values.references || []).length > 0;

		if (this.panel.isActivityWindow) {
			return this.getBodyTpl(values.textBodyContent);
		}

		return '';
	},


	/*
		If the note is a reply it will return '{creator} commented on a note.'
		If the note is not a reply and it has a title it will return '{creator} shared a note: {title}.'
		If the note is not a reply and it doesn't have a title it will return '{creator} shared a note.'
	 */
	getWording: function(values) {
		var w = this.wording1,
			creator = this.getDisplayNameTpl(values);

		if (values.inReplyTo || (values.references || []).length > 0) {
			w = this.wording2;
		} else if (values.title) {
			w = this.wording3;
		}

		return getFormattedString(w, {
			creator: creator,
			title: values.title
		});
	},

	fillInData: function(rec) {
		this.callParent(arguments);

		if (!Ext.isEmpty(rec.get('location')) || !Ext.isEmpty(rec.get('path'))) {
			return;
		}

		LocationMeta.getMeta(rec.get('ContainerId'), function(meta) {
			var lineage = [],
				location = '';

			lineage = ContentUtils.getLineage((meta && meta.NTIID) || rec.get('ContainerId'), true);
			if (!Ext.isEmpty(lineage)) {
				location = lineage.shift();
				lineage.reverse();
			}

			rec.set({
				'location': Ext.String.ellipsis(location, 150, false),
				'path': lineage.join(' / '),
				'textBodyContent': rec.getBodyText && rec.getBodyText()
			});
		});

		// rec.on("convertedToPlaceholder", function(){
		//	console.log("Item removed");
		//	this.destroy();
		// });
	}
});
