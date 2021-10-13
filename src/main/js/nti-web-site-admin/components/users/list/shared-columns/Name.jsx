
import { scoped } from '@nti/lib-locale';
import {
	DisplayName,
	Avatar,
	Placeholder,
	Typography,
	Variant,
} from '@nti/web-core';
import { LinkTo } from '@nti/web-routing';

import { VerticallyCentered } from './Common';

const t = scoped(
	'nti-web-site-admin.components.users.list.shared-columns.Name',
	{
		title: 'Name',
	}
);

const Info = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	flex: 1 1 auto;
	min-height: 60px;
	max-width: calc(100% - 75px);
	overflow: hidden;
`;

NameColumn.Name = t('title');
NameColumn.SortOn = 'alias';

NameColumn.CSSClassName = css`
	width: 350px;
`;
NameColumn.Placeholder = () => (
	<VerticallyCentered>
		<Avatar.Placeholder circular mr="lg" />
		<Info>
			<Placeholder.Text as="div" type="body" text="Placeholder" mb="xs" />
			<Placeholder.Text as="div" type="body" text="test.email@mail.com" />
		</Info>
	</VerticallyCentered>
);

NameColumn.Create = props => Variant(NameColumn, props);

export function NameColumn({ item, getUser = x => x, context }) {
	const user = getUser(item);

	return (
		<VerticallyCentered as={LinkTo.Object} object={user} context={context}>
			<Avatar entity={user} circular mr="lg" />
			<Info>
				<Typography type="body" as="div" color="dark" limitLines={1}>
					<DisplayName entity={user} as="span" />
				</Typography>
				{user.email && (
					<Typography type="body" as="div">
						{user.email}
					</Typography>
				)}
			</Info>
		</VerticallyCentered>
	);
}
