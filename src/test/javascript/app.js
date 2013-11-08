Ext.application({
	name: 'NextThought',
	appFolder: 'javascript/NextThought',

	requires: [
		'NextThought.overrides.*',
		'NextThought.util.*',

		//Require this early so we have it if we need it
		'NextThought.view.MessageBar',
		'NextThought.view.MessageBox',
		'Ext.ux.ajax.SimManager'
	],


	controllers: [
		'Account',
		'UserData',
		'Application',
		'Assessment',
		'Chat',
		'FilterControl',
		'Forums',
		'Google',
		'Groups',
		'Navigation',
		'Profile',
		'Reader',
		'Search',
		'Session',
		'SlideDeck',
		'State',
		'Store',
		'Stream'
	],

	launch: function() {
		function go() {
			$AppConfig.userObject = Ext.create('NextThought.model.User', mockUser, 'test@nextthought.com', mockUser);
			ObjectUtils.defineAttributes($AppConfig, {
				username: {
					getter: function() { try { return this.userObject.getId(); } catch (e) {console.error(e.stack);} },
					setter: function() { throw 'readonly'; }
				}
			});
			$AppConfig.service = Ext.create('NextThought.model.Service', mockService, $AppConfig.username);

			jasmine.getEnv().addReporter(new jasmine.HtmlReporter());
			jasmine.getEnv().execute();
		}

		NextThought.phantomRender = true;

		window.app = this;

		Globals.loadScripts([
			'javascript/specs/example.spec.js',
			'javascript/specs/Library.spec.js',
			'javascript/specs/cache/LocationMeta.spec.js',
			'javascript/specs/cache/UserRepository.spec.js',
			'javascript/specs/util/AnnotationUtils.spec.js',
			'javascript/specs/util/ParseUtils.spec.js',
			'javascript/specs/util/Color.spec.js',
			'javascript/specs/util/Errors.spec.js',
			'javascript/specs/util/anchorables/Anchors.spec.js',
			'javascript/specs/util/anchorables/ChangingDomAnchors.spec.js',
			'javascript/specs/util/anchorables/Utils.spec.js',
			'javascript/specs/util/Search.spec.js',
			'javascript/specs/util/Sharing.spec.js',
			'javascript/specs/util/Time.spec.js',
			'javascript/specs/util/UserDataThreader.spec.js',
			'javascript/specs/util/Content.spec.js',
			'javascript/specs/util/Views.spec.js',
			'javascript/specs/util/Ranges.spec.js',
			'javascript/specs/util/Dom.spec.js',
			'javascript/specs/model/Base.spec.js',
			'javascript/specs/model/Note.spec.js',
			'javascript/specs/model/Hit.spec.js',
			'javascript/specs/model/FriendsList.spec.js',
			'javascript/specs/model/User.spec.js',
			'javascript/specs/model/Service.spec.js',
			'javascript/specs/model/PresenceInfo.spec.js',
			'javascript/specs/model/anchorables/ContentRangeDescription.spec.js',
			'javascript/specs/model/anchorables/DomContentRangeDescription.spec.js',
			'javascript/specs/model/converters/GroupByTime.spec.js',
			'javascript/specs/model/store/Purchasable.spec.js',
			'javascript/specs/model/store/PurchaseAttempt.spec.js',
			'javascript/specs/model/store/StripePricedPurchasable.spec.js',
			'javascript/specs/store/Hit.spec.js',
			'javascript/specs/store/PageItem.spec.js',
			'javascript/specs/store/FriendsList.spec.js',
			'javascript/specs/store/Stream.spec.js',
			'javascript/specs/store/PresenceInfo.spec.js',
			'javascript/specs/view/UserDataPanel.spec.js',
			'javascript/specs/view/whiteboard/NTMatrix.spec.js',
			'javascript/specs/view/whiteboard/ToolOptionsState.spec.js',
			'javascript/specs/view/whiteboard/editor/ToolOption.spec.js',
			'javascript/specs/view/assessment/input/NumericMath.spec.js',
			'javascript/specs/view/assessment/input/SymbolicMath.spec.js',
			'javascript/specs/view/assessment/Question.spec.js',
			'javascript/specs/view/annotations/renderer/Manager.js',
			'javascript/specs/view/profiles/parts/TranscriptSummaryItem.spec.js',
			'javascript/specs/view/profiles/parts/Blog.spec.js',
			'javascript/specs/view/profiles/parts/ForumActivityItem.spec.js',
			'javascript/specs/view/content/reader/Annotations.spec.js',
			'javascript/specs/view/chat/Window.spec.js',
			'javascript/specs/view/chat/log/Entry.spec.js',
			'javascript/specs/view/chat/transcript/Main.spec.js',
			'javascript/specs/view/content/Navigation.spec.js',
			'javascript/specs/view/forums/Comment.spec.js',
			'javascript/specs/view/store/purchase/Form.js',
			'javascript/specs/editor/Editor.spec.js',
			'javascript/specs/controller/Chat.spec.js',
			'javascript/specs/controller/Forums.spec.js',
			'javascript/specs/controller/Groups.spec.js',
			'javascript/specs/controller/Navigation.spec.js',
			'javascript/specs/controller/State.spec.js',
			'javascript/specs/controller/Search.spec.js',
			'javascript/specs/controller/Store.spec.js',
			'javascript/specs/preference/Manager.spec.js'
		],
		go);
	}
});

var uxCheck = setInterval(function() {
	function fail(a, s, b) {
		if (!s || b.status === 404) {
			console.error('You need to move or link the <ext>/examples/ux directory to <ext>/src/ux');
		}
	}

	var r = {
		url: Ext.Loader.getPath('Ext') + '/ux/ajax/SimManager.js',
		callback: fail
	};

	try {
		Ext.Ajax.request(r);
		clearInterval(uxCheck);
	} catch (e) {}
},1000);
