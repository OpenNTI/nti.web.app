Ext.define('NextThought.view.profiles.parts.events.NoteReply', {
	extend: 'NextThought.view.annotations.note.Panel',
	alias: 'widget.profile-activity-note-reply-item',
	defaultType: 'profile-activity-item-reply',

	ui: 'activity',
	cls: 'reply-event',

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'reply profile-activity-reply-item',
			cn: [
				{ cls: 'avatar' },
				{ cls: 'meta', cn: [
					{ cls: 'controls', cn: [
						{ cls: 'favorite-spacer' },
						{ cls: 'like' }
					]},
					{ tag: 'span', cls: 'name' },
					' said'
				]},
				{ cls: 'body' },
				{ cls: 'respond',
					cn: [
						{
							cls: 'reply-options',
							cn: [
								{ cls: 'time' },
								{ cls: 'link reply', html: 'Reply' },
								{ cls: 'link edit', html: 'Edit' },
								{ cls: 'link flag', html: 'Report' },
								{ cls: 'link delete', html: 'Delete' }
							]
						}
					]
				}
			]
		},
		{
			id: '{id}-body',
			cls: 'note-replies',
			cn: ['{%this.renderContainer(out,values)%}']
		}
	]),


	renderSelectors: {
		noteBody: '.reply',
		avatar: '.avatar',
		editEl: '.reply-options .edit',
		flagEl: '.reply-options .flag',
		deleteEl: '.reply-options .delete'
	},


	fillInReplies: Ext.emptyFn,
	loadReplies: Ext.emptyFn,


	afterRender: function() {
		var D = Ext.dom.Element.DISPLAY;
		this.flagEl.setVisibilityMode(D);
		this.editEl.setVisibilityMode(D);
		this.deleteEl.setVisibilityMode(D);

		this.callParent(arguments);
		this.mon(this.deleteEl, 'click', this.onDelete, this);
		this.mon(this.editEl, 'click', this.onEdit, this);
		this.on({ el: {click: 'goToObject', scope: this}});
	},


	setRecord: function() {
		this.callParent(arguments);

		if (!this.rendered) {
			return;
		}

		if (isMe(this.record.get('Creator'))) {
			this.flagEl.hide();
		}
		else {
			this.editEl.hide();
			this.deleteEl.hide();
			this.flagEl.addCls('last');
		}
	},


	goToObject: function() {
		var rec = this.record,
			cid;

		//Show purchase window if we're purchase-able
		if (this.requiresPurchase) {
			this.fireEvent('show-purchasable', this, this.purchasable);
			return;
		}

		//If we are a placholder find a reply to navigate to
		if (!rec || rec.placeholder) {
			Ext.each(this.down('[record]'), function(cmp) {
				if (cmp.record && !cmp.record.placholder) {
					rec = cmp.record;
					return false; //break
				}
				return true;
			});
		}

		cid = rec ? rec.get('ContainerId') : null;

		if (rec && cid) {
			this.fireEvent('navigation-selected', cid, rec, null);
		}
	}
});
