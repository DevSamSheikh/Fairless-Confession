-- Tracking, reports, saved societies

-- Tracking logs: register + login (keep full history)
CREATE TABLE public.tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('register', 'login')),
  ip_address VARCHAR(45),
  mac_address VARCHAR(100),
  mobile_sim_number VARCHAR(50),
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tracking_logs_user_id ON public.tracking_logs(user_id);
CREATE INDEX idx_tracking_logs_created_at ON public.tracking_logs(created_at);

-- Post activity: trace every confession post (unique id, username, date&time, category, society_id, heading, content, likes, views, comments)
CREATE TABLE public.post_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_identity_id VARCHAR(50) NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  category VARCHAR(50) NOT NULL,
  society_id UUID REFERENCES public.societies(id),
  heading VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  ip_address VARCHAR(45),
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_post_activity_log_user_id ON public.post_activity_log(user_id);
CREATE INDEX idx_post_activity_log_post_id ON public.post_activity_log(post_id);

-- Saved/bookmarked societies
CREATE TABLE public.saved_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, society_id)
);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason VARCHAR(100),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reports_post_id ON public.reports(post_id);

-- RLS
ALTER TABLE public.tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages tracking_logs" ON public.tracking_logs FOR ALL USING (true);
CREATE POLICY "Service role manages post_activity_log" ON public.post_activity_log FOR ALL USING (true);
CREATE POLICY "Users can manage own saved_societies" ON public.saved_societies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
