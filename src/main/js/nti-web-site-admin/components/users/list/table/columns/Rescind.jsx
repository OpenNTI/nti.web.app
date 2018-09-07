import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Prompt} from '@nti/web-commons';
import {Connectors} from '@nti/lib-store';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.Rescind', {
	rescind: 'Cancel'
});

export default
@Connectors.Any.connect({
	getSelectedCount: 'getSelectedCount',
	rescind: 'rescind'
})
class Rescind extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		getSelectedCount: PropTypes.func,
		rescind: PropTypes.func
	}

	static cssClassName = 'rescind-col';

	render () {
		const {item, getSelectedCount, rescind} = this.props;

		const cls = cx('cell');

		if(getSelectedCount() > 0) {
			return <div className={cls}/>;
		}

		return (
			<div className={cls} onClick={() => {
				Prompt.areYouSure(`Do you want to rescind pending invitations for ${item.receiver}?`, 'Rescind Invitations', { iconClass: 'alert', confirmButtonClass: 'alert', confirmButtonLabel: 'Yes', cancelButtonLabel: 'No' }).then(() => {
					rescind([item]);
				});
			}}>{t('rescind')}</div>
		);
	}
}
