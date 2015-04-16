Ext.define('NextThought.view.forums.forumcreation.Main', {
	extend: 'Ext.container.Container',
	alias: 'widget.forumcreation-main-view',


	cls: 'forumcreation-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items: [
			{
				xtype: 'simpletext',
				name: 'title',
				cls: 'input-box',
				inputType: 'text',
				placeholder: getString('NextThought.view.forums.forumcreation.Main.titleplaceholder')
			},
			{
				xtype: 'box',
				autoEl: {tag: 'textarea', name: 'description', placeholder: getString('NextThought.view.forums.forumcreation.Main.descriptionplaceholder')},
				name: 'description',
				cls: 'input-box textarea',
				emptyText: getString('NextThought.view.forums.forumcreation.Main.descriptionplaceholder')
			}
		]},
		{xtype: 'box', hidden: true, name: 'error', autoEl: {cls: 'error-box', tag: 'div',
			cn: [
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit', layout: {type: 'hbox', pack: 'end'}, items: [
			{xtype: 'checkbox', cls: 'sharing-checkbox', name: 'sharing', boxLabel: getString('forum_sharing_label')},
			{
				xtype: 'button',
				ui: 'secondary',
				scale: 'large',
				name: 'cancel',
				text: getString('NextThought.view.forums.forumcreation.Main.cancel'),
				handler: function(b) {
					b.up('window').close();
				}
			},
			{xtype: 'button', cls: 'submitBtn', ui: 'primary', scale: 'large', name: 'submit', text: getString('NextThought.view.forums.forumcreation.Main.save')}
		]}
	],


	afterRender: function() {
		this.callParent(arguments);

		var board = this.getBoard(),
				record = this.getRecord(),
				sharing = this.down('[name=sharing]'),
				me = this;

		//if the board is under a course set up the sharing if not get rid of the option
		board.findCourse()
			.done(function(course) {
				if (course) {
					sharing.setValue(false);
				} else {
					sharing.destroy();
				}
			});

		//If we are editing inintialize here
		if (record) {
			this.down('[name=title]').update(record.get('title'));
			this.down('[name=description]').el.update(record.get('description'));

			if (!sharing.isDestroyed) {
				//if there is no ACL the record is open to the entire DFL
				if (Ext.isEmpty(record.get('ACL'))) {
					sharing.setValue(true);
				}
				//we are editing so we can't toggle the share
				sharing.disable();
			}
		}

		this.mon(this.el, 'click', 'handleClick', this);

    //		if (Ext.is.iPad) {
    //			me.mon(this.down('[name=title]').el.down('input'), {
    //				'blur': function (e) {
    //					me.onFocusChange(e);
    //				}
    //			}, me);
    //			me.mon(this.down('[name=description]').el, {
    //				'blur': function (e) {
    //					me.onFocusChange(e);
    //				}
    //			}, me);
    //		}
	},


	/**
	 * Scrolls to the top of the page if a text input field is not focused
	 */
  //	onFocusChange: function (e) {
  //		var titleInput = this.down('[name=title]').el.down('input');
  //		var descriptionField = this.down('[name=description]').el;
  //		if (e.relatedTarget !== titleInput.dom
  //				&& e.relatedTarget !== descriptionField.dom) {
  //			window.scrollTo(0, 0);
  //		}
  //	},


	handleClick: function(e) {
		var values, target = e.getTarget('.submitBtn');

		if (target) {
			values = this.getValues();

			if (this.validateTitle(values.title) && this.validateDescription(values.description)) {
				this.fireEvent('save-forum', this, this.getRecord(), values.title, values.description, values.open);
			}
		}
	},

	validateTitle: function(title) {
		var baseMsg = 'Could not save your forum.';
		if (title.length > 140) {
			this.setError({
							  field: 'title',
							  message: getString('NextThought.view.forums.forumcreation.Main.toolong')
						  });

			return false;
		}

		if (title.length === 0) {
			this.setError({
							  field: 'title',
							  message: getString('NextThought.view.forums.forumcreation.Main.titleempty')
						  });

			return false;
		}

		if (title.trim().length === 0) {
			this.setError({
							  field: 'title',
							  message: getString('NextThought.view.forums.forumcreation.Main.titlewhitespace')
						  });

			return false;
		}

		return true;
	},

	validateDescription: function(description) {
		var baseMsg = 'Could not save your forum.';
		if (description.length === 0) {
			this.setError({
							  field: 'description',
							  message: getString('NextThought.view.forums.forumcreation.Main.descriptionempty')
						  });

			return false;
		}

		if (description.trim().length === 0) {
			this.setError({
							  field: 'description',
							  message: getString('NextThought.view.forums.forumcreation.Main.descriptionwhitespace')
						  });

			return false;
		}

		return true;
	},

	//go up to the window to get the board we are in
	getBoard: function() {
		return this.up('forumcreation-window').ownerCmp.record;
	},

	//go up to the window to get the record we are editing
	getRecord: function() {
		return this.up('forumcreation-window').record;
	},


	getValues: function() {
		//Pull data out of the forum and return it here
		return {
			title: this.down('[name=title]').getValue(),
			description: this.down('[name=description]').el.getValue(),
			open: this.down('[name=sharing]') && this.down('[name=sharing]').getValue()
		};
	},

	setError: function(error) {
		var box = this.down('[name=error]'),
				field = this.down('[name=' + error.field + ']'),
				allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f) {
			f.removeCls('error');
		});

		//make main error field show up
		box.el.down('.error-field').update('Error');
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		if (field) {
			field.addCls('error');
		}

		this.up('window').updateLayout();
	},

	onSaveSuccess: function() {
		var win = this.up('forumcreation-window');

		if (win) {

			if (win.ownerCmp && win.ownerCmp.onSaveSuccess) {
				win.ownerCmp.onSaveSuccess();
			}

			win.close();
		}
	},

	onSaveFailure: function(proxy, response, operation) {
		var msg = {
			message: getString('NextThought.view.forums.forumcreation.Main.unknown'),
			field: ''
		}, error;

		if (response && response.responseText) {
			error = Ext.decode(response.responseText, true) || {};

			if (error.code === 'TooLong') {
				msg.message = getString('NextThought.view.forums.forumcreation.Main.toolong');
				msg.field = 'title';
			} else if (error.code === 'ImpossibleToMakeSpecificPartSafe') {
				msg.message = getString('NextThought.view.forums.forumcreation.Main.special');
				msg.field = 'title';
			}

		}

		this.setError(msg);
		this.el.unmask();
		console.debug(arguments);
	}
});
