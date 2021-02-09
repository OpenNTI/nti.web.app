import React from 'react';
import {decorate} from '@nti/lib-commons';
import {scoped} from '@nti/lib-locale';
import {searchable, contextual} from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.LearnersTable', {
	learners: 'Learners',
	emptyMessage: 'There are no current learners'
});

class LearnersTable extends React.Component {
	static deriveStateKeyFromProps = () => 'LearnersTable';
	static deriveFilterFromProps = () => 'learners';

	render () {
		return <UsersTable filter="learners" title={t('learners')} emptyMessage={t('emptyMessage')}/>;
	}
}


export default decorate(LearnersTable, [
	searchable(),
	contextual(t('learners')),
	Store.connect({}),
]);
