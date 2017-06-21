const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const ModelBase = require('legacy/model/Base');

module.exports = exports = Ext.define('NextThought.app.annotations.Index', {
	extend: 'Ext.view.View',
	alias: 'widget.annotation-view',

	store: 'FlatPage',
	ui: 'annotation-view',
	cls: 'annotation-view scrollable',

	overItemCls: 'over',
	itemSelector: '.row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'row', cn: [
			{cls: 'name', html: '{Creator}'},
			{cls: 'snippet', html: '{preview}'},
			{cls: 'footer', cn: [
				{tag: 'span', html: '{ReplyCount:plural("Comment")}'},
				{tag: 'span', html: '{CreatedTime:timeDifference}'}
			]}
		] }

	]})),

	constructor: function () {
		this.callParent(arguments);

		this.deleteNote = this.deleteNote.bind(this);
	},

	afterRender: function () {
		this.callParent(arguments);

		this.on('beforedeactivate', 'beforeDeactivate');
		this.on('select', 'navigateToNote');

		ModelBase.addListener('deleted', this.deleteNote);
	},

	onDestroy: function () {
		ModelBase.removeListener('deleted', this.deleteNote);

		this.callParent(arguments);
	},

	handleEvent: function (e) {
		if (e.getTarget('a[href]')) {
			e.preventDefault();
		}
		return this.callParent(arguments);
	},

	deleteNote: function (id) {
		const rec = this.store.findRecord('ID', id);

		if (rec) {
			this.store.remove(rec);
		}
	},

	beforeDeactivate: function () {
		// FIXME: they should be a better way to check if the editor is open on the note window.
		var editorEl = Ext.getBody().down('.note-window .editor-active');

		if (editorEl && editorEl.isVisible()) {
			var msg = getString('NextThought.view.content.reader.NoteOverlay.editing');
			Ext.defer(function () {
				alert({msg: msg});
			}, 1);
			return false;
		}

		return true;
	},


	navigateToNote: function (sel, rec) {
		var el = this.getNodeByRecord(rec);

		if (this.showNote) {
			this.showNote(rec, el, {
				afterClose: this.onNoteClose.bind(this)
			});
		} else {
			console.error('No Handler to show note');
		}
	},


	onNoteClose: function () {
		if (this.el) {
			this.getSelectionModel().deselectAll();
		}
	}
});
