
-- Drop existing policies if they exist and recreate them with proper security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own device settings" ON public.device_settings;
DROP POLICY IF EXISTS "Users can insert their own device settings" ON public.device_settings;
DROP POLICY IF EXISTS "Users can update their own device settings" ON public.device_settings;
DROP POLICY IF EXISTS "Users can delete their own device settings" ON public.device_settings;
DROP POLICY IF EXISTS "Users can manage their own device settings" ON public.device_settings;

DROP POLICY IF EXISTS "Users can view their own logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON public.system_logs;
DROP POLICY IF EXISTS "Users can create their own logs" ON public.system_logs;

-- Create comprehensive RLS policies for all tables

-- Profiles table policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Device settings table policies
CREATE POLICY "Users can view their own device settings" 
  ON public.device_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device settings" 
  ON public.device_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device settings" 
  ON public.device_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device settings" 
  ON public.device_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- System logs table policies
CREATE POLICY "Users can view their own logs" 
  ON public.system_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs" 
  ON public.system_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);
