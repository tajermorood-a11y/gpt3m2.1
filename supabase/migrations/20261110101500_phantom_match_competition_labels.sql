-- Include the competition display name in match list payloads.
create or replace function phantom_private.list_matches(p_token uuid, p_competition uuid default null)
returns json language plpgsql security definer set search_path = '' as $$
declare v_user uuid;
begin
  v_user := public._uid(p_token);
  return coalesce((
    select pg_catalog.json_agg(pg_catalog.to_jsonb(x) order by x.kickoff_at)
    from (
      select m.id, m.competition_id, c.name as competition_name, m.home_team, m.away_team,
        m.home_logo_url, m.away_logo_url, m.kickoff_at, m.status, m.home_score, m.away_score,
        m.odds_home, m.odds_draw, m.odds_away,
        p.pick as my_pick, p.stake as my_stake, p.status as my_status, p.payout as my_payout
      from public.matches m
      left join public.competitions c on c.id = m.competition_id
      left join public.predictions p on p.match_id = m.id and p.user_id = v_user
      where (p_competition is null or m.competition_id = p_competition)
        and m.status in ('open', 'closed', 'settled')
    ) x
  ), '[]'::json);
end;
$$;
