const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type GroupPayload = {
  group_id: string;
  items?: unknown[];
  rooms?: unknown;
  backups?: unknown[];
  theme?: string;
  updated_at?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function supabaseFetch(supabaseUrl: string, serviceKey: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data && (data.message || data.code) ? `${data.code || ''} ${data.message || ''}`.trim() : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

function normalizeGroupPayload(payload: GroupPayload): GroupPayload {
  return {
    group_id: payload.group_id,
    items: Array.isArray(payload.items) ? payload.items : [],
    rooms: payload.rooms || { list: [], zones: {} },
    backups: Array.isArray(payload.backups) ? payload.backups : [],
    theme: payload.theme || 'light',
    updated_at: payload.updated_at || new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Sync function is not configured.' }, 500);
  }

  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'getGroup') {
      const groupId = String(body.group_id || '');
      if (!groupId) return jsonResponse({ error: 'group_id is required.' }, 400);
      const groups = await supabaseFetch(
        supabaseUrl,
        serviceKey,
        `groups?group_id=eq.${encodeURIComponent(groupId)}&select=*`,
      );
      return jsonResponse({ group: Array.isArray(groups) && groups.length > 0 ? groups[0] : null });
    }

    if (action === 'saveGroup') {
      const payload = normalizeGroupPayload(body.payload || {});
      if (!payload.group_id) return jsonResponse({ error: 'payload.group_id is required.' }, 400);
      await supabaseFetch(supabaseUrl, serviceKey, 'groups?on_conflict=group_id', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return jsonResponse({ ok: true });
    }

    if (action === 'getUserGroups') {
      const userId = String(body.user_id || '');
      if (!userId) return jsonResponse({ error: 'user_id is required.' }, 400);
      const rows = await supabaseFetch(
        supabaseUrl,
        serviceKey,
        `user_groups?user_id=eq.${encodeURIComponent(userId)}&select=group_id,nickname,joined_at`,
      );
      return jsonResponse({ rows: Array.isArray(rows) ? rows : [] });
    }

    if (action === 'upsertUserGroup') {
      const userId = String(body.user_id || '');
      const groupId = String(body.group_id || '');
      const nickname = String(body.nickname || '회원');
      if (!userId || !groupId) return jsonResponse({ error: 'user_id and group_id are required.' }, 400);
      await supabaseFetch(supabaseUrl, serviceKey, `user_groups?user_id=eq.${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      await supabaseFetch(supabaseUrl, serviceKey, 'user_groups', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          group_id: groupId,
          nickname,
          joined_at: new Date().toISOString(),
        }),
      });
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: 'Unknown action.' }, 400);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error.' }, 500);
  }
});
