-- Add initial_position_mode to map_configuration
ALTER TABLE public.map_configuration 
ADD COLUMN IF NOT EXISTS initial_position_mode TEXT DEFAULT 'custom';

-- Update the existing row if it exists
UPDATE public.map_configuration 
SET initial_position_mode = 'custom'
WHERE initial_position_mode IS NULL;
