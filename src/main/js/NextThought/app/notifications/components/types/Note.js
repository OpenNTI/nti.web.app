Ext.define('NextThought.app.notifications.components.types.Note', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-note',

	statics: {
		keyVal: 'application/vnd.nextthought.note'
	},

	showCreator: true,
	wording1: 'shared a note',
	wording2: 'commented on a note',
	wording3: 'shared a note: {title}',


	fillInWording: function() {
		var item = this.item,
			wording;

		if (item.get('inReplyTo') || (item.get('references') || []).length > 0) {
			wording = this.wording2;
		} else if (item.get('title')) {
			wording = this.wording3.replace('{title}', this.titleTpl.apply({name: item.get('title')}));
		} else {
			wording = this.wording1;
		}

		this.wordingEl.dom.innerHTML = wording;
	}
});

// Ext.define('NextThought.app.notifications.components.types.Note', {
// 	extend: 'NextThought.app.notifications.components.types.Base',
// 	alias: 'widget.notification-item-note',
// 	keyVal: 'application/vnd.nextthought.note',

// 	showCreator: true,
// 	wording1: getString('NextThought.view.account.notifications.types.Note.wording', '{creator} shared a note.'),
// 	wording2: getString('NextThought.view.account.notifications.types.NoteReply.wording', '{creator} commented on a note.'),
// 	wording3: getString('NextThought.view.account.notifications.types.Note.titlewording', '{creator} shared a note: {title}.'),
// 	previewField: 'preview',

// 	/*
// 		If the note is a reply it will return this preview of the comment
// 		If the note is not a reply and it has a title it will return ''
// 		If the note is not a reply and it doesn't have a title it will return the preview.
// 	 */
// 	getBody: function(values) {
// 		var isComment = values.inReplyTo || (values.references || []).length > 0;

// 		if (this.panel.isActivityWindow) {
// 			return this.getBodyTpl(values.textBodyContent);
// 		}

// 		return '';
// 	},


// 	/*
// 		If the note is a reply it will return '{creator} commented on a note.'
// 		If the note is not a reply and it has a title it will return '{creator} shared a note: {title}.'
// 		If the note is not a reply and it doesn't have a title it will return '{creator} shared a note.'
// 	 */
// 	getWording: function(values) {
// 		var w = this.wording1,
// 			creator = this.getDisplayNameTpl(values);

// 		if (values.inReplyTo || (values.references || []).length > 0) {
// 			w = this.wording2;
// 		} else if (values.title) {
// 			w = this.wording3;
// 		}

// 		return getFormattedString(w, {
// 			creator: creator,
// 			title: values.title
// 		});
// 	},

// 	fillInData: function(rec) {
// 		this.callParent(arguments);

// 		if (!rec.get('textBodyContent')) {
// 				rec.set({
// 					textBodyContent: rec.getBodyText && rec.getBodyText()
// 				});
// 		}

// 		// rec.on("convertedToPlaceholder", function(){
// 		//	console.log("Item removed");
// 		//	this.destroy();
// 		// });
// 	}
// });
