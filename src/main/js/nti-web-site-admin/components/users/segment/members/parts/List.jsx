import { scoped } from '@nti/lib-locale';
import { Typography, Button, Box, Avatar, DisplayName } from '@nti/web-core';
import { Route, LinkTo } from '@nti/web-routing';

import { MembersPreviewStore } from '../Store';
import { MembersModal } from '../Modal';

const t = scoped(
	'nti-web-site-admin.components.users.segment.members.parts.List',
	{
		empty: 'No people are currently in this segment.',
		seeAll: 'See All',
	}
);

const List = styled('ul')`
	list-style: none;
	padding: 0;
	margin: 0;
`;

const ItemAvatar = styled(Avatar)`
	margin-right: 0.5rem;
`;
const ItemDisplayName = styled(DisplayName)``;

const Item = styled(Box).attrs({ p: 'sm' })`
	display: flex;
	flex-direction: row;
	align-items: center;

	${ItemAvatar} {
		flex: 0 0 auto;
	}

	${ItemDisplayName} {
		flex: 1 1 auto;
	}
`;

const Controls = styled(Box).attrs({ p: 'sm' })`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
`;

const renderModal = () => <MembersModal />;

export function MembersList() {
	const { Items } = MembersPreviewStore.useProperties();

	if (Items?.length === 0) {
		return (
			<Box p="sm" pv="md">
				<Typography as="div" type="subhead-one" color="light" center>
					{t('empty')}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<List>
				{(Items ?? []).map((item, index) => (
					<li key={index}>
						<Item>
							<ItemAvatar entity={item} circular />
							<ItemDisplayName entity={item} />
						</Item>
					</li>
				))}
			</List>
			<Controls>
				<LinkTo.Path to="#users">
					<Button transparent rounded>
						{t('seeAll')}
					</Button>
				</LinkTo.Path>
			</Controls>
			<Route.Hash matches="#users" render={renderModal} />
		</>
	);
}
