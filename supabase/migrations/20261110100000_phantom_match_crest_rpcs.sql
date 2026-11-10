-- PHANTOM v3.0 M2.1: secure match-crest create/update RPCs.
-- Existing home_logo_url and away_logo_url columns are retained; no match rows are changed.

create or replace function phantom_private.create_match_with_logos(
  p_token uuid, p_competition uuid, p_home text, p_away text,
  p_kickoff timestamptz, p_home_logo_url text default null, p_away_logo_url text default null
) returns json language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_logo_pattern text := '^https://assets[.]football-logos[.]cc/logos/[a-z0-9-]+/1500x1500/[a-z0-9-]+[.][a-f0-9]+[.]png$';
begin
  perform public._require_admin(p_token);
  if pg_catalog.btrim(coalesce(p_home,''))='' or pg_catalog.btrim(coalesce(p_away,''))='' or p_home=p_away or p_kickoff is null then raise exception 'BAD_INPUT'; end if;
  if p_competition is not null and not exists(select 1 from public.competitions c where c.id=p_competition and c.is_active) then raise exception 'BAD_INPUT'; end if;
  if (p_home_logo_url is not null and p_home_logo_url !~ v_logo_pattern) or (p_away_logo_url is not null and p_away_logo_url !~ v_logo_pattern) then raise exception 'INVALID_LOGO_URL'; end if;
  insert into public.matches(competition_id,home_team,away_team,kickoff_at,home_logo_url,away_logo_url)
  values(p_competition,pg_catalog.btrim(p_home),pg_catalog.btrim(p_away),p_kickoff,p_home_logo_url,p_away_logo_url) returning id into v_id;
  return pg_catalog.json_build_object('id',v_id);
end; $$;

create or replace function public.create_match_with_logos(
  p_token uuid, p_competition uuid, p_home text, p_away text,
  p_kickoff timestamptz, p_home_logo_url text default null, p_away_logo_url text default null
) returns json language sql set search_path = '' as $$
  select phantom_private.create_match_with_logos(p_token,p_competition,p_home,p_away,p_kickoff,p_home_logo_url,p_away_logo_url);
$$;

create or replace function phantom_private.set_match_logos(
  p_token uuid, p_match uuid, p_home_logo_url text, p_away_logo_url text
) returns json language plpgsql security definer set search_path = '' as $$
declare v_logo_pattern text := '^https://assets[.]football-logos[.]cc/logos/[a-z0-9-]+/1500x1500/[a-z0-9-]+[.][a-f0-9]+[.]png$';
begin
  perform public._require_admin(p_token);
  if p_match is null then raise exception 'BAD_INPUT'; end if;
  if (p_home_logo_url is not null and p_home_logo_url !~ v_logo_pattern) or (p_away_logo_url is not null and p_away_logo_url !~ v_logo_pattern) then raise exception 'INVALID_LOGO_URL'; end if;
  update public.matches set home_logo_url=p_home_logo_url, away_logo_url=p_away_logo_url where id=p_match;
  if not found then raise exception 'MATCH_NOT_FOUND'; end if;
  return pg_catalog.json_build_object('id',p_match);
end; $$;

create or replace function public.set_match_logos(p_token uuid,p_match uuid,p_home_logo_url text,p_away_logo_url text)
returns json language sql set search_path = '' as $$
  select phantom_private.set_match_logos(p_token,p_match,p_home_logo_url,p_away_logo_url);
$$;

revoke all on function public.create_match_with_logos(uuid,uuid,text,text,timestamptz,text,text) from public;
revoke all on function public.set_match_logos(uuid,uuid,text,text) from public;
grant execute on function public.create_match_with_logos(uuid,uuid,text,text,timestamptz,text,text) to anon,authenticated;
grant execute on function public.set_match_logos(uuid,uuid,text,text) to anon,authenticated;
revoke all on function phantom_private.create_match_with_logos(uuid,uuid,text,text,timestamptz,text,text) from public;
revoke all on function phantom_private.set_match_logos(uuid,uuid,text,text) from public;
grant execute on function phantom_private.create_match_with_logos(uuid,uuid,text,text,timestamptz,text,text) to anon,authenticated;
grant execute on function phantom_private.set_match_logos(uuid,uuid,text,text) to anon,authenticated;
