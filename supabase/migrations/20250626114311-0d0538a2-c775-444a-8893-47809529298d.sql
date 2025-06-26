
-- Add missing RLS policy for system_logs INSERT operations
CREATE POLICY "Users can create their own logs" 
  ON public.system_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add unique constraint to device_settings to prevent conflicts
ALTER TABLE public.device_settings 
ADD CONSTRAINT unique_user_device 
UNIQUE (user_id, device_name);
