-- Create users table (extends auth.users with role information)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('merchant', 'client')),
  full_name text,
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;

-- RLS policies for users table
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Create forms table
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.forms enable row level security;

-- RLS policies for forms table
create policy "Merchants can view their own forms"
  on public.forms for select
  using (auth.uid() = merchant_id);

create policy "Merchants can create forms"
  on public.forms for insert
  with check (auth.uid() = merchant_id);

create policy "Merchants can update their own forms"
  on public.forms for update
  using (auth.uid() = merchant_id);

create policy "Merchants can delete their own forms"
  on public.forms for delete
  using (auth.uid() = merchant_id);

create policy "Anyone can view published forms"
  on public.forms for select
  using (is_published = true);

-- Create form_fields table
create table if not exists public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  field_type text not null check (field_type in ('text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date')),
  label text not null,
  placeholder text,
  required boolean default false,
  options jsonb, -- for select, radio, checkbox fields
  order_index integer not null,
  created_at timestamp with time zone default now()
);

alter table public.form_fields enable row level security;

-- RLS policies for form_fields table
create policy "Merchants can manage fields of their forms"
  on public.form_fields for all
  using (
    exists (
      select 1 from public.forms
      where forms.id = form_fields.form_id
      and forms.merchant_id = auth.uid()
    )
  );

create policy "Anyone can view fields of published forms"
  on public.form_fields for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = form_fields.form_id
      and forms.is_published = true
    )
  );

-- Create submissions table
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  client_id uuid references public.users(id) on delete set null,
  submitted_at timestamp with time zone default now()
);

alter table public.submissions enable row level security;

-- RLS policies for submissions table
create policy "Merchants can view submissions to their forms"
  on public.submissions for select
  using (
    exists (
      select 1 from public.forms
      where forms.id = submissions.form_id
      and forms.merchant_id = auth.uid()
    )
  );

create policy "Clients can view their own submissions"
  on public.submissions for select
  using (auth.uid() = client_id);

create policy "Anyone can create submissions"
  on public.submissions for insert
  with check (true);

-- Create submission_answers table
create table if not exists public.submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  field_id uuid not null references public.form_fields(id) on delete cascade,
  value text not null,
  created_at timestamp with time zone default now()
);

alter table public.submission_answers enable row level security;

-- RLS policies for submission_answers table
create policy "Merchants can view answers to their forms"
  on public.submission_answers for select
  using (
    exists (
      select 1 from public.submissions
      join public.forms on forms.id = submissions.form_id
      where submissions.id = submission_answers.submission_id
      and forms.merchant_id = auth.uid()
    )
  );

create policy "Clients can view their own answers"
  on public.submission_answers for select
  using (
    exists (
      select 1 from public.submissions
      where submissions.id = submission_answers.submission_id
      and submissions.client_id = auth.uid()
    )
  );

create policy "Anyone can create answers"
  on public.submission_answers for insert
  with check (true);

-- Create indexes for better performance
create index if not exists idx_forms_merchant_id on public.forms(merchant_id);
create index if not exists idx_form_fields_form_id on public.form_fields(form_id);
create index if not exists idx_submissions_form_id on public.submissions(form_id);
create index if not exists idx_submissions_client_id on public.submissions(client_id);
create index if not exists idx_submission_answers_submission_id on public.submission_answers(submission_id);
