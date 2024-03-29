/*eslint no-undef:1*/
const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const StoreUtils = require('internal/legacy/util/Store');
const NTI = require('internal/legacy/store/NTI');

const Board = require('./Board');
require('./CommentPost');
require('./Base');

module.exports = exports = Ext.define('NextThought.model.forums.Board', {
	extend: 'NextThought.model.forums.Base',
	isBoard: true,

	statics: {
		buildContentsStoreFromData: function (id, data) {
			const existing = Ext.getStore(id);

			if (existing) {
				existing.add(data);
				StoreUtils.fillInUsers(existing);
				return existing;
			}

			const store = NTI.create({
				storeId: id,
				data: data,
				sorters: [
					{
						property: 'CreatedTime',
						direction: 'DESC',
					},
				],
			});

			StoreUtils.fillInUsers(store);

			return store;
		},
		getBoardFromForumList: function (forumList) {
			var board;

			(forumList || []).every(function (item) {
				if (item.board) {
					board = item.board;
				}

				if (item.children) {
					board = Board.getBoardFromForumList(item.children);
				}

				return !board;
			});

			return board;
		},
	},

	fields: [
		{ name: 'ForumCount', type: 'int', persist: false },
		{ name: 'title', type: 'auto', persist: false },
	],

	getTitle: function () {
		return this.get('title');
	},

	hasForumList: function () {
		return true;
	},

	/**
	 * See CourseInstance getForumList for more details the structure this is returning
	 *
	 * @returns {Object} A forum list of the contents of this board
	 */
	getForumList: function () {
		var me = this,
			content = me.getLink('contents');

		return Service.request(content)
			.then(function (json) {
				json = (json && JSON.parse(json)) || {};
				json.Items =
					json.Items && lazy.ParseUtils.parseItems(json.Items);

				var store = Board.buildContentsStoreFromData(
					me.getContentsStoreId(),
					json.Items
				);

				return [
					{
						title: '',
						board: me,
						store: store,
					},
				];
			})
			.catch(function (response) {
				console.error('failed to load board contents: ', response);

				return {};
			});
	},
});
