import { addMigration } from '../../lib/migrations';
import { upsertPermissions } from '../../../app/authorization/server/functions/upsertPermissions';

addMigration({
	version: 302,
	async up() {
		await upsertPermissions();
	},
});
