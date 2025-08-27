-- Supabase SQL Schema for Polling App

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create polls table
CREATE TABLE public.polls (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create poll options table
CREATE TABLE public.poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  votes INTEGER DEFAULT 0 NOT NULL
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id INTEGER REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id INTEGER REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  -- Ensure a user can only vote once per poll
  UNIQUE(poll_id, user_id)
);

-- Create function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote(option_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.poll_options
  SET votes = votes + 1
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies

-- Users table policies
CREATE POLICY "Users can view all profiles" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Polls table policies
CREATE POLICY "Anyone can view polls" 
  ON public.polls FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create polls" 
  ON public.polls FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can update their own polls" 
  ON public.polls FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own polls" 
  ON public.polls FOR DELETE 
  USING (auth.uid() = created_by);

-- Poll options table policies
CREATE POLICY "Anyone can view poll options" 
  ON public.poll_options FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create poll options" 
  ON public.poll_options FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Votes table policies
CREATE POLICY "Anyone can view votes" 
  ON public.votes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can vote" 
  ON public.votes FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;