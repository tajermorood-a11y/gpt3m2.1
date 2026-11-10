-- PHANTOM: initial database schema
-- Run once in the SQL Editor of the newly created PHANTOM Supabase project.
-- Public tables have RLS enabled with no direct-access policies. All app access is through RPC.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.prediction_users (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  username text not null unique check (char_length(username) between 3 and 24),
  password_hash text not null,
  display_name text not null check (char_length(display_name) between 2 and 32),
  role text not null default 'user' check (role in ('user','deputy','technical_manager')),
  balance numeric(12,2) not null default 0 check (balance >= 0),
  is_verified boolean not null default false,
  star_color text check (star_color in ('red','green','yellow')),
  created_at timestamptz not null default pg_catalog.now(),
  constraint star_requires_verified check (star_color is null or is_verified)
);

create table public.app_sessions (
  token uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references public.prediction_users(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null default (pg_catalog.now() + interval '30 days')
);

create table public.competitions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.matches (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  competition_id uuid references public.competitions(id) on delete set null,
  home_team text not null check (char_length(home_team) between 1 and 80),
  away_team text not null check (char_length(away_team) between 1 and 80),
  kickoff_at timestamptz not null,
  status text not null default 'open' check (status in ('open','closed','settled','cancelled')),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  odds_home numeric(4,2) check (odds_home between 1.00 and 2.00),
  odds_draw numeric(4,2) check (odds_draw between 1.00 and 2.00),
  odds_away numeric(4,2) check (odds_away between 1.00 and 2.00),
  odds_set_by uuid references public.prediction_users(id),
  created_at timestamptz not null default pg_catalog.now()
);

create table public.predictions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references public.prediction_users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  pick text not null check (pick in ('home','draw','away')),
  stake numeric(12,2) not null check (stake > 0),
  odds_at_prediction numeric(4,2) not null check (odds_at_prediction between 1.00 and 2.00),
  status text not null default 'pending' check (status in ('pending','won','lost','refunded')),
  payout numeric(12,2) not null default 0 check (payout >= 0),
  created_at timestamptz not null default pg_catalog.now(),
  unique (user_id, match_id)
);

create table public.topup_codes (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  code text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  is_used boolean not null default false,
  used_by uuid references public.prediction_users(id),
  used_at timestamptz,
  created_by uuid references public.prediction_users(id),
  created_at timestamptz not null default pg_catalog.now()
);

create table public.wallet_transactions (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references public.prediction_users(id) on delete cascade,
  type text not null check (type in ('topup','stake','payout','refund')),
  amount numeric(12,2) not null check (amount > 0),
  balance_after numeric(12,2) not null check (balance_after >= 0),
  method text check (method in ('zain_cash','asia_pay','mastercard')),
  match_id uuid references public.matches(id) on delete set null,
  code_id uuid references public.topup_codes(id) on delete set null,
  note text,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.rivalries (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  challenger_id uuid not null references public.prediction_users(id) on delete cascade,
  opponent_id uuid not null references public.prediction_users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','declined','finished')),
  created_at timestamptz not null default pg_catalog.now(),
  check (challenger_id <> opponent_id)
);

create index predictions_user_idx on public.predictions(user_id);
create index predictions_match_idx on public.predictions(match_id);
create index wallet_user_created_idx on public.wallet_transactions(user_id, created_at desc);
create index matches_status_kickoff_idx on public.matches(status, kickoff_at);
create index sessions_user_expiry_idx on public.app_sessions(user_id, expires_at);
create index rivalries_participants_idx on public.rivalries(challenger_id, opponent_id, status);

alter table public.prediction_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.competitions enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.topup_codes enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.rivalries enable row level security;

-- Internal helpers. Empty search_path plus fully-qualified names prevents object shadowing.
create or replace function public._uid(p_token uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  select s.user_id into v_user from public.app_sessions s
  where s.token = p_token and s.expires_at > pg_catalog.now();
  if v_user is null then raise exception 'SESSION_INVALID'; end if;
  return v_user;
end;
$$;

create or replace function public._require_admin(p_token uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_role text;
begin
  v_user := public._uid(p_token);
  select u.role into v_role from public.prediction_users u where u.id = v_user;
  if v_role not in ('deputy','technical_manager') then raise exception 'FORBIDDEN'; end if;
  return v_user;
end;
$$;

create or replace function public._require_manager(p_token uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_role text;
begin
  v_user := public._uid(p_token);
  select u.role into v_role from public.prediction_users u where u.id = v_user;
  if v_role <> 'technical_manager' then raise exception 'FORBIDDEN'; end if;
  return v_user;
end;
$$;

create or replace function public._me(p_id uuid)
returns json language sql security definer set search_path = '' as $$
  select pg_catalog.json_build_object('id',u.id,'username',u.username,'display_name',u.display_name,
    'role',u.role,'balance',u.balance,'is_verified',u.is_verified,'star_color',u.star_color)
  from public.prediction_users u where u.id = p_id;
$$;

create or replace function public.register(p_username text, p_password text, p_display_name text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_token uuid; v_username text;
begin
  v_username := pg_catalog.lower(pg_catalog.btrim(p_username));
  if v_username is null or char_length(v_username) not between 3 and 24 then raise exception 'BAD_INPUT'; end if;
  if p_display_name is null or char_length(pg_catalog.btrim(p_display_name)) not between 2 and 32 then raise exception 'BAD_INPUT'; end if;
  if p_password is null or char_length(p_password) < 6 then raise exception 'PASSWORD_TOO_SHORT'; end if;
  insert into public.prediction_users(username,password_hash,display_name)
  values (v_username, extensions.crypt(p_password, extensions.gen_salt('bf', 12)), pg_catalog.btrim(p_display_name))
  returning id into v_id;
  insert into public.app_sessions(user_id) values (v_id) returning token into v_token;
  return pg_catalog.json_build_object('token',v_token,'user',public._me(v_id));
exception when unique_violation then raise exception 'USERNAME_TAKEN';
end;
$$;

create or replace function public.login(p_username text, p_password text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_token uuid; v_username text;
begin
  v_username := pg_catalog.lower(pg_catalog.btrim(p_username));
  if v_username is null or p_password is null then raise exception 'BAD_CREDENTIALS'; end if;
  select u.id into v_id from public.prediction_users u
  where u.username=v_username and u.password_hash=extensions.crypt(p_password,u.password_hash);
  if v_id is null then raise exception 'BAD_CREDENTIALS'; end if;
  insert into public.app_sessions(user_id) values (v_id) returning token into v_token;
  return pg_catalog.json_build_object('token',v_token,'user',public._me(v_id));
end;
$$;

create or replace function public.get_me(p_token uuid)
returns json language plpgsql security definer set search_path = '' as $$
begin return public._me(public._uid(p_token)); end;
$$;

create or replace function public.logout(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.app_sessions where token=p_token;
$$;

create or replace function public.list_matches(p_token uuid, p_competition uuid default null)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user := public._uid(p_token);
  return coalesce((select pg_catalog.json_agg(pg_catalog.to_jsonb(x) order by x.kickoff_at) from (
    select m.id,m.competition_id,m.home_team,m.away_team,m.kickoff_at,m.status,m.home_score,m.away_score,
      m.odds_home,m.odds_draw,m.odds_away,p.pick as my_pick,p.stake as my_stake,p.status as my_status,p.payout as my_payout
    from public.matches m left join public.predictions p on p.match_id=m.id and p.user_id=v_user
    where (p_competition is null or m.competition_id=p_competition) and m.status in ('open','closed','settled')
  ) x), '[]'::json);
end;
$$;

create or replace function public.list_competitions(p_token uuid)
returns json language plpgsql security definer set search_path = '' as $$
begin
  perform public._uid(p_token);
  return coalesce((select pg_catalog.json_agg(pg_catalog.json_build_object('id',c.id,'name',c.name) order by c.name)
    from public.competitions c where c.is_active), '[]'::json);
end;
$$;

create or replace function public.create_competition(p_token uuid,p_name text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public._require_admin(p_token);
  if p_name is null or char_length(pg_catalog.btrim(p_name)) not between 2 and 80 then raise exception 'BAD_INPUT'; end if;
  insert into public.competitions(name) values(pg_catalog.btrim(p_name)) returning id into v_id;
  return pg_catalog.json_build_object('id',v_id,'name',pg_catalog.btrim(p_name));
end;
$$;

create or replace function public.create_match(p_token uuid,p_competition uuid,p_home text,p_away text,p_kickoff timestamptz)
returns json language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform public._require_admin(p_token);
  if pg_catalog.btrim(coalesce(p_home,''))='' or pg_catalog.btrim(coalesce(p_away,''))='' or p_home=p_away or p_kickoff is null then raise exception 'BAD_INPUT'; end if;
  if p_competition is not null and not exists(select 1 from public.competitions c where c.id=p_competition and c.is_active) then raise exception 'BAD_INPUT'; end if;
  insert into public.matches(competition_id,home_team,away_team,kickoff_at)
  values(p_competition,pg_catalog.btrim(p_home),pg_catalog.btrim(p_away),p_kickoff) returning id into v_id;
  return pg_catalog.json_build_object('id',v_id);
end;
$$;

create or replace function public.set_odds(p_token uuid,p_match uuid,p_home numeric,p_draw numeric,p_away numeric)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user:=public._require_admin(p_token);
  if p_home is null or p_draw is null or p_away is null or p_home not between 1 and 2 or p_draw not between 1 and 2 or p_away not between 1 and 2 then raise exception 'ODDS_OUT_OF_RANGE'; end if;
  update public.matches set odds_home=p_home,odds_draw=p_draw,odds_away=p_away,odds_set_by=v_user
  where id=p_match and status='open' and kickoff_at>pg_catalog.now();
  if not found then raise exception 'MATCH_NOT_OPEN'; end if;
end;
$$;

create or replace function public.place_prediction(p_token uuid,p_match uuid,p_pick text,p_stake numeric)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_match public.matches%rowtype; v_account public.prediction_users%rowtype; v_odds numeric; v_new_balance numeric;
begin
  v_user:=public._uid(p_token);
  if p_stake is null or p_stake<=0 or p_stake>1000000000 or p_pick not in ('home','draw','away') then raise exception 'BAD_STAKE'; end if;
  select * into v_match from public.matches where id=p_match for update;
  if v_match.id is null or v_match.status<>'open' or v_match.kickoff_at<=pg_catalog.now() then raise exception 'MATCH_CLOSED'; end if;
  v_odds:=case p_pick when 'home' then v_match.odds_home when 'draw' then v_match.odds_draw when 'away' then v_match.odds_away end;
  if v_odds is null then raise exception 'ODDS_NOT_SET'; end if;
  select * into v_account from public.prediction_users where id=v_user for update;
  if v_account.balance<p_stake then raise exception 'INSUFFICIENT_BALANCE'; end if;
  insert into public.predictions(user_id,match_id,pick,stake,odds_at_prediction) values(v_user,p_match,p_pick,p_stake,v_odds);
  update public.prediction_users set balance=balance-p_stake where id=v_user returning balance into v_new_balance;
  insert into public.wallet_transactions(user_id,type,amount,balance_after,match_id)
  values(v_user,'stake',p_stake,v_new_balance,p_match);
  return public._me(v_user);
end;
$$;

create or replace function public.settle_match(p_token uuid,p_match uuid,p_home_score integer,p_away_score integer)
returns void language plpgsql security definer set search_path = '' as $$
declare v_result text; v_prediction record; v_payout numeric; v_balance numeric;
begin
  perform public._require_admin(p_token);
  if p_home_score is null or p_away_score is null or p_home_score<0 or p_away_score<0 then raise exception 'BAD_INPUT'; end if;
  perform 1 from public.matches where id=p_match and status in ('open','closed') for update;
  if not found then raise exception 'MATCH_NOT_SETTLEABLE'; end if;
  v_result:=case when p_home_score>p_away_score then 'home' when p_home_score<p_away_score then 'away' else 'draw' end;
  update public.matches set status='settled',home_score=p_home_score,away_score=p_away_score where id=p_match;
  for v_prediction in select * from public.predictions where match_id=p_match and status='pending' for update loop
    if v_prediction.pick=v_result then
      v_payout:=round(v_prediction.stake*v_prediction.odds_at_prediction,2);
      update public.prediction_users set balance=balance+v_payout where id=v_prediction.user_id returning balance into v_balance;
      update public.predictions set status='won',payout=v_payout where id=v_prediction.id;
      insert into public.wallet_transactions(user_id,type,amount,balance_after,match_id)
      values(v_prediction.user_id,'payout',v_payout,v_balance,p_match);
    else update public.predictions set status='lost',payout=0 where id=v_prediction.id;
    end if;
  end loop;
end;
$$;

create or replace function public.create_codes(p_token uuid,p_amount numeric,p_count integer)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_i integer; v_code text; v_codes text[]:=array[]::text[];
begin
  v_user:=public._require_admin(p_token);
  if p_amount is null or p_amount<=0 or p_count is null or p_count<1 or p_count>100 then raise exception 'BAD_INPUT'; end if;
  for v_i in 1..p_count loop
    v_code:=pg_catalog.upper(pg_catalog.substr(pg_catalog.encode(extensions.gen_random_bytes(8),'hex'),1,12));
    insert into public.topup_codes(code,amount,created_by) values(v_code,p_amount,v_user);
    v_codes:=pg_catalog.array_append(v_codes,v_code);
  end loop;
  return pg_catalog.to_json(v_codes);
end;
$$;

create or replace function public.redeem_code(p_token uuid,p_code text,p_method text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_code public.topup_codes%rowtype; v_balance numeric;
begin
  v_user:=public._uid(p_token);
  if p_method is null or p_method not in ('zain_cash','asia_pay','mastercard') then raise exception 'BAD_METHOD'; end if;
  select * into v_code from public.topup_codes where code=pg_catalog.upper(pg_catalog.btrim(p_code)) for update;
  if v_code.id is null then raise exception 'CODE_INVALID'; end if;
  if v_code.is_used then raise exception 'CODE_USED'; end if;
  update public.topup_codes set is_used=true,used_by=v_user,used_at=pg_catalog.now() where id=v_code.id;
  update public.prediction_users set balance=balance+v_code.amount,is_verified=true where id=v_user returning balance into v_balance;
  insert into public.wallet_transactions(user_id,type,amount,balance_after,method,code_id)
  values(v_user,'topup',v_code.amount,v_balance,p_method,v_code.id);
  return public._me(v_user);
end;
$$;

create or replace function public.set_star(p_token uuid,p_color text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user:=public._uid(p_token);
  if p_color is null or p_color not in ('red','green','yellow') then raise exception 'BAD_COLOR'; end if;
  update public.prediction_users set star_color=p_color where id=v_user and is_verified;
  if not found then raise exception 'NOT_VERIFIED'; end if;
  return public._me(v_user);
end;
$$;

create or replace function public.wallet_history(p_token uuid)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user:=public._uid(p_token);
  return coalesce((select pg_catalog.json_agg(pg_catalog.to_jsonb(x) order by x.created_at desc) from (
    select t.id,t.type,t.amount,t.balance_after,t.method,t.created_at,m.home_team,m.away_team
    from public.wallet_transactions t left join public.matches m on m.id=t.match_id
    where t.user_id=v_user order by t.created_at desc limit 100
  ) x),'[]'::json);
end;
$$;

create or replace function public.leaderboard(p_token uuid)
returns json language plpgsql security definer set search_path = '' as $$
begin
  perform public._uid(p_token);
  return coalesce((select pg_catalog.json_agg(pg_catalog.to_jsonb(x)) from (
    select u.id,u.display_name,u.star_color,
      count(p.id) filter(where p.status='won') as wins,
      count(p.id) filter(where p.status in ('won','lost')) as total,
      coalesce(sum(p.payout-p.stake) filter(where p.status in ('won','lost')),0) as net_profit
    from public.prediction_users u left join public.predictions p on p.user_id=u.id
    group by u.id order by wins desc,net_profit desc limit 100
  ) x),'[]'::json);
end;
$$;

create or replace function public.create_rivalry(p_token uuid,p_opponent_username text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_opponent uuid; v_id uuid;
begin
  v_user:=public._uid(p_token);
  select id into v_opponent from public.prediction_users where username=pg_catalog.lower(pg_catalog.btrim(p_opponent_username));
  if v_opponent is null then raise exception 'OPPONENT_NOT_FOUND'; end if;
  if v_opponent=v_user then raise exception 'SAME_USER'; end if;
  if exists(select 1 from public.rivalries r where r.status in ('pending','active') and ((r.challenger_id=v_user and r.opponent_id=v_opponent) or (r.challenger_id=v_opponent and r.opponent_id=v_user))) then raise exception 'RIVALRY_EXISTS'; end if;
  insert into public.rivalries(challenger_id,opponent_id) values(v_user,v_opponent) returning id into v_id;
  return pg_catalog.json_build_object('id',v_id,'status','pending');
end;
$$;

create or replace function public.respond_rivalry(p_token uuid,p_rivalry_id uuid,p_accept boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user:=public._uid(p_token);
  update public.rivalries set status=case when p_accept then 'active' else 'declined' end
  where id=p_rivalry_id and opponent_id=v_user and status='pending';
  if not found then raise exception 'RIVALRY_NOT_PENDING'; end if;
end;
$$;

create or replace function public.list_rivalries(p_token uuid)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user:=public._uid(p_token);
  return coalesce((select pg_catalog.json_agg(pg_catalog.to_jsonb(x) order by x.created_at desc) from (
    select r.id,r.status,r.created_at,(r.opponent_id=v_user) as is_opponent,
      case when r.challenger_id=v_user then u2.display_name else u1.display_name end as opponent_name,
      case when r.challenger_id=v_user then u1.display_name else u2.display_name end as challenger_name,
      (select count(*) from public.predictions p where p.user_id=v_user and p.status='won') as my_wins,
      (select count(*) from public.predictions p where p.user_id=case when r.challenger_id=v_user then r.opponent_id else r.challenger_id end and p.status='won') as opponent_wins
    from public.rivalries r join public.prediction_users u1 on u1.id=r.challenger_id join public.prediction_users u2 on u2.id=r.opponent_id
    where r.challenger_id=v_user or r.opponent_id=v_user
  ) x),'[]'::json);
end;
$$;

create or replace function public.set_role(p_token uuid,p_user_id uuid,p_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public._require_manager(p_token);
  if p_role is null or p_role<>'deputy' then raise exception 'ROLE_INVALID'; end if;
  update public.prediction_users set role='deputy' where id=p_user_id and role='user';
  if not found then raise exception 'USER_NOT_FOUND_OR_ROLE_LOCKED'; end if;
end;
$$;

-- Remove default PUBLIC execution from every RPC, then expose only intended entry points to anon.
revoke all on function public._uid(uuid) from public,anon,authenticated;
revoke all on function public._require_admin(uuid) from public,anon,authenticated;
revoke all on function public._require_manager(uuid) from public,anon,authenticated;
revoke all on function public._me(uuid) from public,anon,authenticated;

do $$
declare r record;
begin
  for r in select p.oid::regprocedure as signature from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'register','login','get_me','logout','list_matches','list_competitions','create_competition','create_match',
      'set_odds','place_prediction','settle_match','create_codes','redeem_code','set_star','wallet_history',
      'leaderboard','create_rivalry','respond_rivalry','list_rivalries','set_role')
  loop execute pg_catalog.format('revoke all on function %s from public, authenticated',r.signature); end loop;
end;
$$;

grant execute on function public.register(text,text,text),public.login(text,text),public.get_me(uuid),public.logout(uuid),
  public.list_matches(uuid,uuid),public.list_competitions(uuid),public.create_competition(uuid,text),
  public.create_match(uuid,uuid,text,text,timestamptz),public.set_odds(uuid,uuid,numeric,numeric,numeric),
  public.place_prediction(uuid,uuid,text,numeric),public.settle_match(uuid,uuid,integer,integer),
  public.create_codes(uuid,numeric,integer),public.redeem_code(uuid,text,text),public.set_star(uuid,text),
  public.wallet_history(uuid),public.leaderboard(uuid),public.create_rivalry(uuid,text),
  public.respond_rivalry(uuid,uuid,boolean),public.list_rivalries(uuid),public.set_role(uuid,uuid,text)
to anon;

revoke all on all tables in schema public from anon, authenticated;

-- Bootstrap the first technical manager only after registering the chosen account.
-- Replace the username and run this one statement manually from the SQL Editor:
-- update public.prediction_users set role='technical_manager' where username='your_username';


-- PHANTOM hardening: keep SECURITY DEFINER implementation functions outside the exposed API schema.
create schema if not exists phantom_private;

alter function public.register(text,text,text) set schema phantom_private;
alter function public.login(text,text) set schema phantom_private;
alter function public.get_me(uuid) set schema phantom_private;
alter function public.logout(uuid) set schema phantom_private;
alter function public.list_matches(uuid,uuid) set schema phantom_private;
alter function public.list_competitions(uuid) set schema phantom_private;
alter function public.create_competition(uuid,text) set schema phantom_private;
alter function public.create_match(uuid,uuid,text,text,timestamptz) set schema phantom_private;
alter function public.set_odds(uuid,uuid,numeric,numeric,numeric) set schema phantom_private;
alter function public.place_prediction(uuid,uuid,text,numeric) set schema phantom_private;
alter function public.settle_match(uuid,uuid,integer,integer) set schema phantom_private;
alter function public.create_codes(uuid,numeric,integer) set schema phantom_private;
alter function public.redeem_code(uuid,text,text) set schema phantom_private;
alter function public.set_star(uuid,text) set schema phantom_private;
alter function public.wallet_history(uuid) set schema phantom_private;
alter function public.leaderboard(uuid) set schema phantom_private;
alter function public.create_rivalry(uuid,text) set schema phantom_private;
alter function public.respond_rivalry(uuid,uuid,boolean) set schema phantom_private;
alter function public.list_rivalries(uuid) set schema phantom_private;
alter function public.set_role(uuid,uuid,text) set schema phantom_private;

create or replace function public.register(p_username text,p_password text,p_display_name text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.register(p_username,p_password,p_display_name); $$;
create or replace function public.login(p_username text,p_password text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.login(p_username,p_password); $$;
create or replace function public.get_me(p_token uuid)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.get_me(p_token); $$;
create or replace function public.logout(p_token uuid)
returns void language sql security invoker set search_path = '' as $$ select phantom_private.logout(p_token); $$;
create or replace function public.list_matches(p_token uuid,p_competition uuid default null)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.list_matches(p_token,p_competition); $$;
create or replace function public.list_competitions(p_token uuid)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.list_competitions(p_token); $$;
create or replace function public.create_competition(p_token uuid,p_name text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.create_competition(p_token,p_name); $$;
create or replace function public.create_match(p_token uuid,p_competition uuid,p_home text,p_away text,p_kickoff timestamptz)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.create_match(p_token,p_competition,p_home,p_away,p_kickoff); $$;
create or replace function public.set_odds(p_token uuid,p_match uuid,p_home numeric,p_draw numeric,p_away numeric)
returns void language sql security invoker set search_path = '' as $$ select phantom_private.set_odds(p_token,p_match,p_home,p_draw,p_away); $$;
create or replace function public.place_prediction(p_token uuid,p_match uuid,p_pick text,p_stake numeric)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.place_prediction(p_token,p_match,p_pick,p_stake); $$;
create or replace function public.settle_match(p_token uuid,p_match uuid,p_home_score integer,p_away_score integer)
returns void language sql security invoker set search_path = '' as $$ select phantom_private.settle_match(p_token,p_match,p_home_score,p_away_score); $$;
create or replace function public.create_codes(p_token uuid,p_amount numeric,p_count integer)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.create_codes(p_token,p_amount,p_count); $$;
create or replace function public.redeem_code(p_token uuid,p_code text,p_method text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.redeem_code(p_token,p_code,p_method); $$;
create or replace function public.set_star(p_token uuid,p_color text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.set_star(p_token,p_color); $$;
create or replace function public.wallet_history(p_token uuid)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.wallet_history(p_token); $$;
create or replace function public.leaderboard(p_token uuid)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.leaderboard(p_token); $$;
create or replace function public.create_rivalry(p_token uuid,p_opponent_username text)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.create_rivalry(p_token,p_opponent_username); $$;
create or replace function public.respond_rivalry(p_token uuid,p_rivalry_id uuid,p_accept boolean)
returns void language sql security invoker set search_path = '' as $$ select phantom_private.respond_rivalry(p_token,p_rivalry_id,p_accept); $$;
create or replace function public.list_rivalries(p_token uuid)
returns json language sql security invoker set search_path = '' as $$ select phantom_private.list_rivalries(p_token); $$;
create or replace function public.set_role(p_token uuid,p_user_id uuid,p_role text)
returns void language sql security invoker set search_path = '' as $$ select phantom_private.set_role(p_token,p_user_id,p_role); $$;

revoke all on schema phantom_private from public, authenticated;
grant usage on schema phantom_private to anon;
revoke all on all functions in schema phantom_private from public, authenticated;
grant execute on all functions in schema phantom_private to anon;
grant execute on function public.register(text,text,text),public.login(text,text),public.get_me(uuid),public.logout(uuid),
  public.list_matches(uuid,uuid),public.list_competitions(uuid),public.create_competition(uuid,text),
  public.create_match(uuid,uuid,text,text,timestamptz),public.set_odds(uuid,uuid,numeric,numeric,numeric),
  public.place_prediction(uuid,uuid,text,numeric),public.settle_match(uuid,uuid,integer,integer),
  public.create_codes(uuid,numeric,integer),public.redeem_code(uuid,text,text),public.set_star(uuid,text),
  public.wallet_history(uuid),public.leaderboard(uuid),public.create_rivalry(uuid,text),
  public.respond_rivalry(uuid,uuid,boolean),public.list_rivalries(uuid),public.set_role(uuid,uuid,text)
to anon;

create index if not exists matches_competition_id_idx on public.matches(competition_id);
create index if not exists matches_odds_set_by_idx on public.matches(odds_set_by);
create index if not exists rivalries_opponent_id_idx on public.rivalries(opponent_id);
create index if not exists topup_codes_created_by_idx on public.topup_codes(created_by);
create index if not exists topup_codes_used_by_idx on public.topup_codes(used_by);
create index if not exists wallet_transactions_code_id_idx on public.wallet_transactions(code_id);
create index if not exists wallet_transactions_match_id_idx on public.wallet_transactions(match_id);
