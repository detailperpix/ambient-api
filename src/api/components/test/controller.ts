import type { Health } from 'api/health';

import { success, failure } from '@/api/util';

export async function health(request: Health.Request, response: Health.Response): Promise<void> {
    const { response: r } = request.body;

    success(response, { response: r ?? 'ok' });
}
