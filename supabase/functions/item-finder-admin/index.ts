const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

type UsageEvent = {
  event_type?: string;
  user_id?: string;
  nickname?: string;
  group_id?: string;
  app_version?: string;
  page?: string;
  created_at?: string;
};

type UserGroup = {
  user_id?: string;
  nickname?: string;
  group_id?: string;
  joined_at?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fetchTable<T>(supabaseUrl: string, serviceKey: string, path: string): Promise<T[]> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Supabase REST error: ${res.status}`);
  }
  return await res.json();
}

function buildOverview(events: UsageEvent[], groups: unknown[], userGroups: UserGroup[]) {
  const userMap = new Map<string, {
    user_id: string;
    nickname: string;
    group_id: string;
    last_seen_at: string;
    login_count: number;
    last_page: string;
    app_version: string;
  }>();

  for (const user of userGroups) {
    const userId = user.user_id || 'unknown';
    userMap.set(userId, {
      user_id: userId,
      nickname: user.nickname || '회원',
      group_id: user.group_id || '',
      last_seen_at: '',
      login_count: 0,
      last_page: user.joined_at ? '가입 기록만 있음' : '접속 기록 없음',
      app_version: '',
    });
  }

  for (const event of events) {
    const userId = event.user_id || 'unknown';
    const existing = userMap.get(userId);
    const createdAt = event.created_at || '';
    if (!existing) {
      userMap.set(userId, {
        user_id: userId,
        nickname: event.nickname || '회원',
        group_id: event.group_id || '',
        last_seen_at: createdAt,
        login_count: event.event_type === 'login' ? 1 : 0,
        last_page: event.page || '',
        app_version: event.app_version || '',
      });
      continue;
    }

    if (event.event_type === 'login') existing.login_count += 1;
    if (createdAt && (!existing.last_seen_at || new Date(createdAt) > new Date(existing.last_seen_at))) {
      existing.last_seen_at = createdAt;
      existing.nickname = event.nickname || existing.nickname;
      existing.group_id = event.group_id || existing.group_id;
      existing.last_page = event.page || existing.last_page;
      existing.app_version = event.app_version || existing.app_version;
    }
  }

  const recentUsers = Array.from(userMap.values())
    .sort((a, b) => {
      const bTime = b.last_seen_at ? new Date(b.last_seen_at).getTime() : 0;
      const aTime = a.last_seen_at ? new Date(a.last_seen_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 100);

  return {
    totalUsers: userMap.size,
    totalEvents: events.length,
    totalGroups: groups.length,
    recentUsers,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const adminToken = Deno.env.get('ITEM_FINDER_ADMIN_TOKEN');

  if (!supabaseUrl || !serviceKey || !adminToken) {
    return jsonResponse({ error: 'Admin function is not configured.' }, 500);
  }

  if (req.headers.get('x-admin-token') !== adminToken) {
    return jsonResponse({ error: 'Unauthorized.' }, 401);
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'overview';

  try {
    const events = await fetchTable<UsageEvent>(
      supabaseUrl,
      serviceKey,
      'usage_events?select=*&order=created_at.desc&limit=2000',
    );
    const groups = await fetchTable(
      supabaseUrl,
      serviceKey,
      'groups?select=group_id,items,rooms,backups,theme,updated_at',
    );
    const userGroups = await fetchTable<UserGroup>(
      supabaseUrl,
      serviceKey,
      'user_groups?select=*',
    );

    if (mode === 'backup') {
      return jsonResponse({
        app: 'item_finder',
        exportedAt: new Date().toISOString(),
        groups,
        user_groups: userGroups,
        usage_events: events,
      });
    }

    return jsonResponse(buildOverview(events, groups, userGroups));
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error.' }, 500);
  }
});
