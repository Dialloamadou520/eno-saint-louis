-- =============================================================================
-- ENO Saint-Louis — Plateforme de gestion des interventions informatiques
--                   et de contrôle des accès
-- Schéma initial. À exécuter dans le SQL Editor de Supabase
-- (ou via `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------------

-- Rôle applicatif (droits dans la plateforme)
do $$ begin
  create type user_role as enum ('admin', 'technicien', 'surveillant', 'agent');
exception when duplicate_object then null; end $$;

-- Fonction de l'agent au sein de l'ENO
do $$ begin
  create type fonction_agent as enum (
    'Surveillant', 'Administration', 'Technicien', 'Enseignant', 'Securite', 'Autre'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type equipement_categorie as enum (
    'ordinateur', 'imprimante', 'reseau', 'serveur', 'videoprojecteur',
    'onduleur', 'peripherique', 'autre'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type equipement_etat as enum (
    'fonctionnel', 'en_panne', 'en_maintenance', 'reforme'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type intervention_priorite as enum ('basse', 'normale', 'haute', 'urgente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type intervention_statut as enum (
    'ouverte', 'en_cours', 'en_attente', 'resolue', 'cloturee', 'annulee'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type motif_visite as enum (
    'assistance_informatique', 'retrait_document', 'depot_dossier',
    'rendez_vous', 'formation', 'soutenance', 'reclamation', 'autre'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type type_visiteur as enum ('etudiant', 'visiteur');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('info', 'succes', 'alerte', 'erreur');
exception when duplicate_object then null; end $$;

-- Tables ----------------------------------------------------------------------

-- Profils (1-1 avec auth.users)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nom        text not null default '',
  prenom     text not null default '',
  email      text,
  telephone  text,
  fonction   fonction_agent not null default 'Autre',
  role       user_role not null default 'agent',
  actif      boolean not null default true,
  created_at timestamptz not null default now()
);

-- Parc d'équipements informatiques
create table if not exists public.equipements (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  nom              text not null,
  categorie        equipement_categorie not null default 'autre',
  marque           text,
  modele           text,
  numero_serie     text,
  localisation     text,
  etat             equipement_etat not null default 'fonctionnel',
  date_acquisition date,
  observations     text,
  created_at       timestamptz not null default now()
);

create index if not exists equipements_etat_idx on public.equipements (etat);
create index if not exists equipements_categorie_idx on public.equipements (categorie);

-- Interventions informatiques
create table if not exists public.interventions (
  id                uuid primary key default gen_random_uuid(),
  numero            text not null unique,
  titre             text not null,
  description       text,
  equipement_id     uuid references public.equipements (id) on delete set null,
  demandeur_nom     text not null,
  demandeur_service text,
  technicien_id     uuid references public.profiles (id) on delete set null,
  priorite          intervention_priorite not null default 'normale',
  statut            intervention_statut not null default 'ouverte',
  type_panne        text,
  solution          text,
  date_ouverture    timestamptz not null default now(),
  date_cloture      timestamptz,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists interventions_statut_idx on public.interventions (statut);
create index if not exists interventions_date_ouverture_idx
  on public.interventions (date_ouverture desc);

-- Journal de suivi d'une intervention
create table if not exists public.intervention_suivis (
  id              uuid primary key default gen_random_uuid(),
  intervention_id uuid not null references public.interventions (id) on delete cascade,
  auteur_id       uuid references public.profiles (id) on delete set null,
  auteur_nom      text,
  commentaire     text not null,
  ancien_statut   intervention_statut,
  nouveau_statut  intervention_statut,
  created_at      timestamptz not null default now()
);

create index if not exists intervention_suivis_intervention_idx
  on public.intervention_suivis (intervention_id, created_at);

-- Accès du personnel (entrées / sorties)
create table if not exists public.acces_personnel (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references public.profiles (id) on delete set null,
  nom          text not null,
  prenom       text not null,
  fonction     fonction_agent not null default 'Autre',
  date_acces   date not null default current_date,
  heure_entree timestamptz not null default now(),
  heure_sortie timestamptz,
  signature    text,
  observations text,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists acces_personnel_date_idx on public.acces_personnel (date_acces desc);
create index if not exists acces_personnel_sortie_idx on public.acces_personnel (heure_sortie);

-- Accès des étudiants et visiteurs
create table if not exists public.acces_visiteurs (
  id                  uuid primary key default gen_random_uuid(),
  type_visiteur       type_visiteur not null default 'etudiant',
  matricule           text,
  nom                 text not null,
  telephone           text,
  filiere             text,
  niveau              text,
  motif               motif_visite not null default 'autre',
  motif_autre         text,
  service_rencontre   text,
  personne_rencontree text,
  piece_identite      text,
  date_acces          date not null default current_date,
  heure_entree        timestamptz not null default now(),
  heure_sortie        timestamptz,
  observations        text,
  created_by          uuid references public.profiles (id) on delete set null,
  created_at          timestamptz not null default now()
);

create index if not exists acces_visiteurs_date_idx on public.acces_visiteurs (date_acces desc);
create index if not exists acces_visiteurs_matricule_idx on public.acces_visiteurs (matricule);
create index if not exists acces_visiteurs_sortie_idx on public.acces_visiteurs (heure_sortie);

-- Notifications (user_id null = diffusion à tous)
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  titre      text not null,
  message    text,
  type       notification_type not null default 'info',
  lien       text,
  lu         boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- Fonctions & triggers ---------------------------------------------------------

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nom, prenom, email, telephone, fonction, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.raw_user_meta_data ->> 'prenom', ''),
    new.email,
    new.raw_user_meta_data ->> 'telephone',
    coalesce((new.raw_user_meta_data ->> 'fonction')::fonction_agent, 'Autre'),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'agent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Numérotation automatique des interventions : INT-2026-0001
create or replace function public.next_intervention_numero()
returns text
language plpgsql
as $$
declare
  annee text := to_char(now(), 'YYYY');
  compteur int;
begin
  select count(*) + 1 into compteur
  from public.interventions
  where numero like 'INT-' || annee || '-%';
  return 'INT-' || annee || '-' || lpad(compteur::text, 4, '0');
end;
$$;

create or replace function public.set_intervention_numero()
returns trigger
language plpgsql
as $$
begin
  if new.numero is null or new.numero = '' then
    new.numero := public.next_intervention_numero();
  end if;
  return new;
end;
$$;

drop trigger if exists interventions_set_numero on public.interventions;
create trigger interventions_set_numero
  before insert on public.interventions
  for each row execute function public.set_intervention_numero();

-- Horodatage automatique de la clôture
create or replace function public.set_intervention_cloture()
returns trigger
language plpgsql
as $$
begin
  if new.statut in ('resolue', 'cloturee') and old.statut not in ('resolue', 'cloturee') then
    new.date_cloture := coalesce(new.date_cloture, now());
  elsif new.statut not in ('resolue', 'cloturee') then
    new.date_cloture := null;
  end if;
  return new;
end;
$$;

drop trigger if exists interventions_set_cloture on public.interventions;
create trigger interventions_set_cloture
  before update on public.interventions
  for each row execute function public.set_intervention_cloture();

-- Helpers de rôle (security definer pour éviter la récursion RLS)
create or replace function public.current_role_app()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_app() = 'admin', false);
$$;

-- Peut enregistrer un accès : admin, surveillant ou technicien
create or replace function public.can_manage_acces()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_role_app() in ('admin', 'surveillant', 'technicien'), false
  );
$$;

-- RLS --------------------------------------------------------------------------

alter table public.profiles           enable row level security;
alter table public.equipements        enable row level security;
alter table public.interventions      enable row level security;
alter table public.intervention_suivis enable row level security;
alter table public.acces_personnel    enable row level security;
alter table public.acces_visiteurs    enable row level security;
alter table public.notifications      enable row level security;

-- Profils
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Équipements : lecture pour tous les connectés, écriture admin/technicien
drop policy if exists equipements_select on public.equipements;
create policy equipements_select on public.equipements
  for select to authenticated using (true);

drop policy if exists equipements_write on public.equipements;
create policy equipements_write on public.equipements
  for all to authenticated
  using (public.current_role_app() in ('admin', 'technicien'))
  with check (public.current_role_app() in ('admin', 'technicien'));

-- Interventions
drop policy if exists interventions_select on public.interventions;
create policy interventions_select on public.interventions
  for select to authenticated using (true);

drop policy if exists interventions_insert on public.interventions;
create policy interventions_insert on public.interventions
  for insert to authenticated with check (auth.uid() is not null);

drop policy if exists interventions_update on public.interventions;
create policy interventions_update on public.interventions
  for update to authenticated
  using (public.current_role_app() in ('admin', 'technicien'))
  with check (public.current_role_app() in ('admin', 'technicien'));

drop policy if exists interventions_delete on public.interventions;
create policy interventions_delete on public.interventions
  for delete to authenticated using (public.is_admin());

-- Suivis
drop policy if exists suivis_select on public.intervention_suivis;
create policy suivis_select on public.intervention_suivis
  for select to authenticated using (true);

drop policy if exists suivis_insert on public.intervention_suivis;
create policy suivis_insert on public.intervention_suivis
  for insert to authenticated with check (auth.uid() is not null);

-- Accès personnel
drop policy if exists acces_personnel_select on public.acces_personnel;
create policy acces_personnel_select on public.acces_personnel
  for select to authenticated using (true);

drop policy if exists acces_personnel_write on public.acces_personnel;
create policy acces_personnel_write on public.acces_personnel
  for all to authenticated
  using (public.can_manage_acces()) with check (public.can_manage_acces());

-- Accès visiteurs
drop policy if exists acces_visiteurs_select on public.acces_visiteurs;
create policy acces_visiteurs_select on public.acces_visiteurs
  for select to authenticated using (true);

drop policy if exists acces_visiteurs_write on public.acces_visiteurs;
create policy acces_visiteurs_write on public.acces_visiteurs
  for all to authenticated
  using (public.can_manage_acces()) with check (public.can_manage_acces());

-- Notifications : chacun voit les siennes + les diffusions
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated using (user_id is null or user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert to authenticated with check (auth.uid() is not null);
