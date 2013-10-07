Ext.define('NextThought.view.content.notepad.Item', {
	extend: 'Ext.Component',
	alias: 'widget.notepad-item',

	requires: [
		'NextThought.view.content.notepad.Editor'
	],

	ui: 'notepad-item',
	cls: 'note notepad-item',

	renderTpl: Ext.DomHelper.markup([
		'{body}'
	]),


	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble(['detect-overflow', 'editor-closed', 'editor-open']);
		this.on({
			added: 'disableFloating',
			el: {
				contextmenu: 'contextMenu',
				mouseover: 'eat',
				mousemove: 'eat',
				click: {fn: 'edit', buffer: 100}
			}
		});

		this.notepadCmp = this.floatParent;
	},


	destroy: function() {
		return this.callParent(arguments);
	},


	eat: function(e) {
		e.stopEvent();
		return false;
	},


	updateAnnotationMonitors: function(annotation) {
		Ext.destroy(this.annotationMonitors);
		this.annotation = annotation;
		this.annotationMonitors = this.mon(annotation, {
			destroyable: true,
			//monitors go here...
			'cleanup': 'destroy'//remove this widget if the annotation is cleaned.
		});
	},


	updateRecordMonitors: function(record) {
		Ext.destroy(this.recordMonitors);
		this.record = record;
		this.recordMonitors = this.mon(record, {
			destroyable: true,
			//monitors go here...
			'destroy': 'destroy'//remove this widget if the record is deleted.
		});
	},


	disableFloating: function(me, ct) {
		this.setLocalY(null);
		this.getEl().addCls('grouped').removeCls('collide');
		delete this.floatParent;
		this.ownerLayout = ct.getLayout();
		this.el.appendTo(ct.getLayout().getContentTarget());
	},


	updateWith: function(data) {
		var me = this, el = me.getEl(),
			p = el.hasCls('grouped') ? null : (data.placement || 0);

		if (p !== this.getLocalY()) {
			this.setLocalY(p);
		}

		if (this.record !== data.record) {
			this.updateRecordMonitors(data.record);
		}

		if (this.annotation !== data.annotation) {
			this.updateAnnotationMonitors(data.annotation);
		}

		//Start with the stupid thing... (always draw)
		data.record.compileBodyContent(function(html, cb) {
			me.renderTpl.overwrite(el, {body: html});
			if (Ext.isFunction(cb)) {
				Ext.each(cb(el, me), function(c) { me.on('destroy', 'destroy', c); });
			}
			me.checkOverflow();
		});
	},


	refresh: function() {
		this.updateWith({
			placement: this.getLocalY(),
			record: this.record,
			annotation: this.annotation
		});
	},


	contextMenu: function(e) {
		console.log('context menu?');
	},


	checkOverflow: function() {
		this.fireEvent('detect-overflow');
	},


	openEditor: function() {
		if (this.notepadCmp && this.notepadCmp.savingNewNote) {
			return;
		}

		if (!this.editor) {
			this.update('');
			this.fireEvent('editor-open');
			this.addCls('edit');
			if (this.ownerCt) {
				this.ownerCt.addCls('edit');
			}
			this.editor = Ext.widget({
				xtype: 'notepad-editor',
				ownerCmp: this,
				renderTo: this.getEl(),
				value: this.record.get('body'),
				listeners: {
					scope: this,
					blur: 'commitEdit',
					cancel: 'cancelEdit',
					keydown: {fn: 'checkOverflow', buffer: 200}
				}
			});
		}
		Ext.defer(this.editor.focus, 1, this.editor);
	},


	edit: function(e) {
		clearTimeout(this.openingEditor);
		this.openingEditor = Ext.defer(this.openEditor, 10, this);
		return this.eat(e);
	},


	cleanupEditor: function() {
		this.removeCls('edit');
		if (this.ownerCt) {
			this.ownerCt.removeCls('edit');
		}
		Ext.destroy(this.editor);
		delete this.editor;
		this.refresh();
		this.fireEvent('editor-closed');
	},


	cancelEdit: function() {
		this.cleanupEditor();
	},


	commitEdit: function() {
		var me = this, r = me.record,
			dom = Ext.getDom(me.getEl()),
			nextDom = Ext.getDom(me.getEl()).nextSibling,
			pDom = Ext.getDom(me.getEl().parent()),
			b = this.editor.getValue(),
			oldBody = r.get('body');

		if (b.join() === oldBody.join()) {
			this.cleanupEditor();
			return;
		}

		r.set('body', b);

		this.cleanupEditor();

		if (Ext.isEmpty(b)) {
			pDom.removeChild(dom);
			r.destroy({
				callback: function(recs, o, success) {
					if (!success) {// put the node back
						if (nextDom && nextDom.parentNode === pDom) {
							pDom.appendChild(dom);
						} else {
							pDom.insertBefore(dom, nextDom);
						}

						me.refresh();
					}
				}
			});
			return;
		}

		r.save({
			failure: function() {
				console.error('coudn\'t save note');
				r.set('body', oldBody);
				if (me.isDestroyed) {
					return;
				}
				me.refresh();
			}
		});
	}
});
