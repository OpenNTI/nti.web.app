import React from 'react';

import { scoped } from '@nti/lib-locale';
import { Avatar, Typography, Placeholder } from '@nti/web-core';

import { VerticallyCentered } from './Common';

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
	flex: 1 1 auto;
	min-height: 60px;
`;

Name.CSSClassName = css`
	width: 350px;
`;
Name.Name = t('title');
Name.SortOn = 'receiver';
Name.Placeholder = () => (
	<VerticallyCentered>
		<Avatar.Placeholder circular mr="lg" />
		<Info>
			<Placeholder.Text
				as="div"
				typography="body"
				text="thelongplaceholderlong@email.com"
				mb="xs"
			/>
			<Placeholder.Text as="div" typography="body" text="Administrator" />
		</Info>
	</VerticallyCentered>
);
export function Name({ item }) {
	const entity = {
		Username: item.receiver,
		initials: item.receiver.charAt(0),
	};

	return (
		<VerticallyCentered>
			<Avatar entity={entity} circular mr="lg" />
			<Info>
				<Typography
					as="div"
					type="body"
					color="dark"
					limitLines={1}
					data-test-id="receiver"
				>
					{item.receiver}
				</Typography>
				<Typography
					as="div"
					type="body"
					limitLines={1}
					data-test-id="type"
				>
					{isAdminInvite(item.MimeType)
						? t('administrator')
						: t('learner')}
				</Typography>
			</Info>
		</VerticallyCentered>
	);
}
