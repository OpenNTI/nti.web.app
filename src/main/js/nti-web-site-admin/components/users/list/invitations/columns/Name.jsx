import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Avatar, Text } from '@nti/web-core';

import { TableHeader, VerticallyCentered } from './Common';

const isAdminInvite = RegExp.prototype.test.bind(/siteadmininvitation/);

const t = scoped(
	'nti-web-site-admin.components.users.list.invitations.columns.Name',
	{
		title: 'Name',
		administrator: 'Administrator',
		learner: 'Learner',
	}
);

const Info = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	min-height: 60px;
`;

Name.CSSClassName = css`
	width: 400px;
`;
Name.Name = t('title');
Name.SortOn = 'receiver';
Name.HeaderComponent = TableHeader;
export function Name({ item }) {
	const entity = {
		Username: item.receiver,
		initials: item.receiver.charAt(0),
	};

	return (
		<VerticallyCentered>
			<Avatar entity={entity} circular mr="lg" />
			<Info>
				<Text as="div" typography="body" color="dark" limitLines={1}>
					{item.receiver}
				</Text>
				<Text as="div" typography="body" limitLines={1}>
					{isAdminInvite(item.MimeType)
						? t('administrator')
						: t('learner')}
				</Text>
			</Info>
		</VerticallyCentered>
	);
}
