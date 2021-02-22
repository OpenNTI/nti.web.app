const Ext = require('@nti/extjs');

const { getString } = require('legacy/util/Localization');
const { isMe } = require('legacy/util/Globals');

const TemplatesForNotes = Ext.define(
	'NextThought.app.annotations.note.Templates',
	{
		//Merge these functions into note.Panel

		attachMoreReplyOptionsHandler: function (cmp, optionsEl, user, record) {
			if (!optionsEl) {
				return;
			}
			var scroller = optionsEl.up('{overflow=auto}');

			if (scroller) {
				cmp.mon(scroller, {
					optionsEl: optionsEl,
					scope: cmp,
					scroll: this.replyOptionsScroll,
				});
			}

			cmp.mon(optionsEl, {
				scope: cmp,
				click: this.replyOptionsClicked,
				mouseout: this.replyOptionsMouseOut,
				mouseover: this.replyOptionsMouseIn,
				mouseup: function (e) {
					e.stopEvent();
					return false;
				},
				options: {
					user: user,
					record: record,
				},
			});
		},

		replyOptionsScroll: function (e, el, opts) {
			var menu = opts.optionsEl;
			menu.removeCls('active');
		},

		replyOptionsClicked: function (e, t, opts) {
			e.stopEvent();

			var more = e.getTarget('.more', undefined, true),
				container = e.getTarget('.note-container', 0, true),
				theme = container && container.hasCls('dark') ? 'dark' : '',
				editItem,
				flagItem,
				deleteItem,
				menu,
				items = [],
				mine,
				options = opts.options,
				menuTimer,
				shared,
				hideDelete = false,
				canEdit;

			if (!more || !more.dom) {
				return false;
			}

			function moreMenuClick(item, e2) {
				e2.stopEvent();
				var menuCls = 'on' + item.itemId;
				if (this[menuCls]) {
					this[menuCls]();
				} else {
					console.warn(
						'unimplemented method',
						item.itemId,
						'on component',
						this.$className
					);
				}
			}

			function flagItemClick(item, e2) {
				e2.stopEvent();
				var menuCls = 'onFlag',
					me = this;

				TemplatesForNotes.reportInappropriate(function (btn) {
					if (btn !== 'ok') {
						return;
					}
					if (me[menuCls]) {
						me[menuCls]();
					}
				});
			}

			editItem = new Ext.Action({
				text: 'Edit',
				cls: 'reply-option edit',
				itemId: 'Edit',
				scope: this,
				ui: 'nt-menuitem',
				plain: true,
				handler: moreMenuClick,
			});

			flagItem = new Ext.Action({
				text: getString(
					'NextThought.view.annotations.note.Templates.flag-option'
				),
				cls: 'reply-option flag',
				itemId: 'Flag',
				scope: this,
				ui: 'nt-menuitem',
				plain: true,
				handler: flagItemClick,
			});

			deleteItem = new Ext.Action({
				text: getString(
					'NextThought.view.annotations.note.Templates.delete-option'
				),
				cls: 'reply-option delete',
				itemId: 'Delete',
				scope: this,
				ui: 'nt-menuitem',
				plain: true,
				handler: moreMenuClick,
			});

			if (options.user) {
				mine = isMe(options.user);
			} else {
				console.log(
					'Error: user is null. The note/reply  owner is undefined, opts:',
					options
				);
			}

			/* For a user who doesn't have the sharing capability, they can only edit their note, if it's private. Otherwise, they can't.
			 * We run into this cases, for COPPA account that were downgraded and updgraded again.
			 * For the general case, it should work as usual, since the user will have the sharing capability.
			 */
			shared = !Ext.isEmpty(this.record.get('sharedWith'));
			canEdit =
				(mine && Service.canShare()) ||
				(mine && !Service.canShare() && !shared);
			if (canEdit) {
				items.push(editItem);
			}

			if (options.record) {
				//			involved = (options.record.get('sharedWith') || []).slice();
				//			shared = involved.length > 0;

				/* NOTE: We are hiding the 'start chat' feature from a note window,
			 because right now, the note window is displayed in a modal view and
			 we would want the chat window to be on top of note window. Since we can't have more than one modal view,
			 the chat window gets hidden behind the window. As per Aaron, we will revisit this when needed.
			 */

				//			if(options.user){involved.push(options.user);}
				//			if( Service.canChat()
				//				&& shared
				//				&& hasUser(involved, $AppConfig.username) ){
				//				items.push(chatItem);
				//			}

				if (
					!options.record.isModifiable() ||
					(this.canDelete && !this.canDelete())
				) {
					hideDelete = true;
				}

				if (options.record.isFlagged && options.record.isFlagged()) {
					flagItem.setText('Reported');
				}
			}
			items.push(flagItem);
			if (mine && !hideDelete) {
				items.push(deleteItem);
			}

			menu = Ext.widget('menu', {
				cls: 'reply-options-menu ' + theme,
				closeAction: 'destroy',
				parentItem: this,
				items: items,
			});

			//for iPad, if there are mouseover events, touching on the menu item
			//will perform a mouseenter, mouseleave, and not click.
			if (!Ext.is.iOS) {
				menu.on('mouseover', function () {
					console.log('mouseover');
					if (
						opts.scope.el &&
						opts.scope.el.down('.single') &&
						!opts.scope.el.down('.menu-open')
					) {
						opts.scope.el.down('.single').addCls('menu-open');
					}
				});

				menu.on('mouseleave', function () {
					console.log('mouseleave');
					menuTimer = setTimeout(function () {
						menu.close();
						if (opts.scope.el && opts.scope.el.down('.single')) {
							opts.scope.el
								.down('.single')
								.removeCls('menu-open');
						}
					}, 100);
				});
				menu.on('mouseenter', function () {
					console.log('mouseenter');
					clearTimeout(menuTimer);
				});
			}

			menu.showBy(more, 'tl-bl?', [2, -7]);

			menuTimer = setTimeout(function () {
				menu.close();
			}, 2000);
			return false;
		},

		replyOptionsMouseOut: function (e) {
			var more = e.getTarget('.more', undefined, true);
			if (more) {
				this.moreReplyOptionsMouseOutTimer = setTimeout(function () {
					more.removeCls('active');
				}, 500);
			}
		},

		replyOptionsMouseIn: function () {
			clearTimeout(this.moreReplyOptionsMouseOutTimer);
		},

		reportInappropriate: function (callback) {
			Ext.Msg.show({
				msg: 'This action cannot be undone.', //Y No Externalize?? :P
				//We need to bitwise OR these two, so stop the lint.
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				icon: 'warning-red',
				buttonText: {
					ok: getString(
						'NextThought.view.annotations.note.Templates.flag-option'
					),
				},
				ui: 'caution',
				title: getString(
					'NextThought.view.annotations.note.Templates.waringing-title'
				),
				fn: callback,
			});
		},
	}
).create();

module.exports = exports = TemplatesForNotes;
