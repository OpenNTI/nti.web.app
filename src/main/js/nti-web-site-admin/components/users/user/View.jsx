import React from 'react';
import {LinkTo} from 'nti-web-routing';// eslint-disable-line

export default function UserView (props) {
	return (
		<div className="site-admin-user-view">
			<LinkTo.Name name="site-admin.users">
				Back To Users
			</LinkTo.Name>
			{JSON.stringify(props)}
		</div>
	);
}
