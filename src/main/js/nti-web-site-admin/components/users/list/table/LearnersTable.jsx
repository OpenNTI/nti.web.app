import React from 'react';
import {scoped} from '@nti/lib-locale';
import {searchable, contextual} from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.LearnersTable', {
	learners: 'Learners',
	emptyMessage: 'There are no current learners'
});

export default
@searchable()
@contextual(t('learners'))
@Store.connect({})
class LearnersTable extends React.Component {
	static deriveStateKeyFromProps = () => 'LearnersTable';

	render () {
		return <UsersTable filter="learners" title={t('learners')} emptyMessage={t('emptyMessage')}/>;
	}
}
