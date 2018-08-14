import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {Prompt} from '@nti/web-commons';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.LastSeen', {
	rescind: 'Rescind'
});

export default class LastSeen extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired
	}

	static cssClassName = 'rescind-col';

	render () {
		const {item, store} = this.props;

		const cls = cx('cell', {'row-selected': store.isSelected(item)});

		if(store.getSelectedCount() > 0) {
			return <div className={cls}/>;
		}

		return (
			<div className={cls} onClick={() => {
				Prompt.areYouSure(`Do you want to rescind pending invitations for ${item.receiver}?`, 'Rescind Invitations', { iconClass: 'alert', confirmButtonClass: 'alert', confirmButtonLabel: 'Yes', cancelButtonLabel: 'No' }).then(() => {
					store.rescind([item]);
				});
			}}>{t('rescind')}</div>
		);
	}
}
