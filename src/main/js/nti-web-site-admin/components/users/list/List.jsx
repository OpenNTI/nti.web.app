import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from 'nti-lib-locale';
import {EmptyState} from 'nti-web-commons';
import {LinkTo} from 'nti-web-routing';

import SearchablePagedView from '../../common/SearchablePagedView';

import Item from './Item';

const DEFAULT_TEXT = {
	users: 'Users',
	empty: 'No Users',
	emptySearch: 'No Users found. Please refine your search.',
	shortSearch: 'Too many results. Please refine your search.',
	backLabel: 'View All Users',
	error: 'Unable to load Users.'
};
const t = scoped('nti-site-admin.users.list', DEFAULT_TEXT);

export default class ListView extends React.Component {
	static propTypes = {
		selectedItems: PropTypes.object,
		loadNextPage: PropTypes.func,
		searchTerm: PropTypes.string,
		addCmp: PropTypes.func,
		removeCmp: PropTypes.func,
		onSelectionChange: PropTypes.func,
		isSelectable: PropTypes.bool
	}

	state = {}

	onLoadNextPage = () => {
		this.props.loadNextPage();
	}

	render () {
		return (
			<SearchablePagedView
				{...this.props}
				className="site-admin-user-list"
				renderEmptyState={this.renderEmptyState}
				loadNextPage={this.onLoadNextPage}
				renderItem={this.renderItem}
				getString={t}
			/>
		);
	}

	onSelect = (item, value) => {
		const { onSelectionChange } = this.props;

		onSelectionChange && onSelectionChange(item, value);
	}


	renderItem = (item) => {
		const { addCmp, removeCmp, selectedItems, isSelectable } = this.props;

		const selected = Array.from(selectedItems || new Set());
		const isSelected = selected.some(x => x.Username === item.Username);

		const selectHandler = isSelectable && this.onSelect;

		return (
			<LinkTo.Object object={item} context="site-admin.users-list-item">
				<Item item={item} removeCmp={removeCmp} addCmp={addCmp} isSelected={isSelected} onSelect={selectHandler}/>
			</LinkTo.Object>
		);
	}


	renderEmptyState = () => {
		const {searchTerm} = this.props;
		const header = searchTerm ?
			(searchTerm.length < 3 ? t('shortSearch') : t('emptySearch')) :
			t('empty');

		return (
			<EmptyState header={header} />
		);
	}
}
