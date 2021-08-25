import { Button, ButtonGroup, Icon } from '@rocket.chat/fuselage';
import React, { useMemo, useCallback, useState } from 'react';
import { useDebouncedValue, useMediaQuery } from '@rocket.chat/fuselage-hooks';

import Page from '../../../components/Page';
import VerticalBar from '../../../components/VerticalBar';
import { useRoute, useCurrentRoute } from '../../../contexts/RouterContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { AddUser } from './AddUser';
import EditUserWithData from './EditUserWithData';
import { InviteUsers } from './InviteUsers';
import { UserInfoWithData } from './UserInfo';
import UsersTable from './UsersTable';
import { useEndpointData } from '../../../hooks/useEndpointData';

function UsersPage() {
	const t = useTranslation();

	const usersRoute = useRoute('admin-users');

	const handleVerticalBarCloseButtonClick = () => {
		usersRoute.push({});
	};

	const handleNewButtonClick = () => {
		usersRoute.push({ context: 'new' });
	};

	const handleInviteButtonClick = () => {
		usersRoute.push({ context: 'invite' });
	};
	const sortDir = (sortDir) => (sortDir === 'asc' ? 1 : -1);

	const useQuery = ({ text, itemsPerPage, current }, sortFields) =>
		useMemo(
			() => ({
				fields: JSON.stringify({
					name: 1,
					username: 1,
					emails: 1,
					roles: 1,
					status: 1,
					avatarETag: 1,
					active: 1,
				}),
				query: JSON.stringify({
					$or: [
						{ 'emails.address': { $regex: text || '', $options: 'i' } },
						{ username: { $regex: text || '', $options: 'i' } },
						{ name: { $regex: text || '', $options: 'i' } },
					],
				}),
				sort: JSON.stringify(
					sortFields.reduce((agg, [column, direction]) => {
						agg[column] = sortDir(direction);
						return agg;
					}, {}),
				),
				...(itemsPerPage && { count: itemsPerPage }),
				...(current && { offset: current }),
			}),
			[text, itemsPerPage, current, sortFields],
		);

	const [params, setParams] = useState({ text: '', current: 0, itemsPerPage: 25 });
	const [sort, setSort] = useState([
		['name', 'asc'],
		['usernames', 'asc'],
	]);

	const debouncedParams = useDebouncedValue(params, 500);
	const debouncedSort = useDebouncedValue(sort, 500);
	const query = useQuery(debouncedParams, debouncedSort);
	const { value: data = {}, reload } = useEndpointData('users.list', query);
	const [, { context, id }] = useCurrentRoute();
	console.log(`usersPage : ${typeof reload}`);
	return (
		<Page flexDirection='row'>
			<Page>
				<Page.Header title={t('Users')}>
					<ButtonGroup>
						<Button onClick={handleNewButtonClick}>
							<Icon name='plus' /> {t('New')}
						</Button>
						<Button onClick={handleInviteButtonClick}>
							<Icon name='send' /> {t('Invite')}
						</Button>
					</ButtonGroup>
				</Page.Header>
				<Page.Content>
					<UsersTable users={data.users} total={data.total}/>
				</Page.Content>
			</Page>
			{context && (
				<VerticalBar>
					<VerticalBar.Header>
						{context === 'info' && t('User_Info')}
						{context === 'edit' && t('Edit_User')}
						{context === 'new' && t('Add_User')}
						{context === 'invite' && t('Invite_Users')}
						<VerticalBar.Close onClick={handleVerticalBarCloseButtonClick} />
					</VerticalBar.Header>

					{context === 'info' && <UserInfoWithData uid={id} tablereload={reload}/>}
					{context === 'edit' && <EditUserWithData uid={id} />}
					{context === 'new' && <AddUser />}
					{context === 'invite' && <InviteUsers />}
				</VerticalBar>
			)}
			
		</Page>
	);
}

export default UsersPage;
