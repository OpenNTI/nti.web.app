import React from 'react';
import PropTypes from 'prop-types';

export default class SiteAdminUserBookView extends React.Component {
	static propTypes = {
		userBookRecord: PropTypes.object
	}

	render () {
		return (
			<div className="site-admin-user-enrollment-overview">
				Overview
			</div>
		);

	}

}
