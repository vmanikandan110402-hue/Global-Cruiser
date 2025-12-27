-- Create storage bucket for yacht images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'yacht-images', 
  'yacht-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
-- Allow public read access to yacht images
CREATE POLICY "Anyone can view yacht images" ON storage.objects
  FOR SELECT USING (bucket_id = 'yacht-images');

-- Allow authenticated users to upload yacht images
CREATE POLICY "Authenticated users can upload yacht images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'yacht-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update yacht images
CREATE POLICY "Authenticated users can update yacht images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'yacht-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete yacht images
CREATE POLICY "Authenticated users can delete yacht images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'yacht-images' AND 
    auth.role() = 'authenticated'
  );
