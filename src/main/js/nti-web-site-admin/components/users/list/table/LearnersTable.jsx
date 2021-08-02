import React from 'react';

import { decorate } from '@nti/lib-commons';
import { scoped } from '@nti/lib-locale';
import { searchable, contextual } from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.LearnersTable', {
	learners: 'Users',
	emptyMessage: 'There are no current users',
});

class LearnersTable extends React.Component {
	static deriveStateKeyFromProps = () => 'LearnersTable';
	static deriveFilterFromProps = () => 'learners';

	render() {
		return (
			<UsersTable
				className={this.props.className}
				filter="learners"
				title={t('learners')}
				emptyMessage={t('emptyMessage')}
			/>
		);
	}
}

export default decorate(LearnersTable, [
	searchable(),
	contextual(t('learners')),
	Store.connect({}),
]);
