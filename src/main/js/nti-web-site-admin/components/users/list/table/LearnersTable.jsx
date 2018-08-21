import React from 'react';
import {scoped} from '@nti/lib-locale';

import UsersTable from './UsersTable';

const t = scoped('nti-web-site-admin.users.list.table.LearnersTable', {
	learners: 'Learners',
	emptyMessage: 'There are no current learners'
});

export default class LearnersTable extends React.Component {
	render () {
		return <UsersTable filter="learners" title={t('learners')} emptyMessage={t('emptyMessage')}/>;
	}
}
