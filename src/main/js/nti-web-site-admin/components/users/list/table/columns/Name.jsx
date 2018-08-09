import React from 'react';
import PropTypes from 'prop-types';
import {scoped} from '@nti/lib-locale';
import {DisplayName, Avatar} from  '@nti/web-commons';
import {LinkTo} from '@nti/web-routing';
import cx from 'classnames';

const t = scoped('nti-web-site-admin.components.users.list.table.columns.Name', {
	headerTitle: 'Type'
});

export default class Name extends React.Component {
	static propTypes = {
		item: PropTypes.object.isRequired,
		store: PropTypes.object.isRequired,
		nonViewable: PropTypes.bool
	}

	static cssClassName = 'name-col';

	static Name = 'Name'

	static SortKey = 'alias'

	render () {
		const {item, store} = this.props;
		return (
			<LinkTo.Path to={`./user/${item.getID()}`} activeClassName="active" exact>
				<div className={cx('cell', {'row-selected': store.isSelected(item)})}>
					<Avatar entity={item}/>
					<div className="user-info">
						<DisplayName entity={item}/>
						<div className="email">{item.email}</div>
					</div>
				</div>
			</LinkTo.Path>
		);
	}
}
