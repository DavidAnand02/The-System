import React, { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Shield, Loader2, AlertTriangle, ExternalLink, User, Upload } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

interface AuthProps {
  onSuccess: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Auth: React.FC<AuthProps> = React.memo(({ onSuccess, onImport }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        trackEvent('Auth', 'Login', 'Email');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        trackEvent('Auth', 'Signup', 'Email');
        alert('Check your email for the confirmation link!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email, password, isLogin, onSuccess]);

  const handleGoogleAuth = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Use skipBrowserRedirect: true to get the URL for a popup
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });
      
      if (error) throw error;

      if (data?.url) {
        trackEvent('Auth', 'Login', 'Google');
        // Open in a popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const authWindow = window.open(
          data.url,
          'google_auth',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
        );

        // Fallback: Poll for session in case postMessage fails
        const pollTimer = setInterval(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            clearInterval(pollTimer);
            onSuccess();
          }
          if (authWindow?.closed) {
            clearInterval(pollTimer);
            setLoading(false);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-system-error/10 backdrop-blur-xl border border-system-error/30 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-system-error/20 rounded-full flex items-center justify-center mb-6 mx-auto border border-system-error/30">
            <AlertTriangle className="w-8 h-8 text-system-error" />
          </div>
          <h2 className="text-xl font-orbitron font-bold text-system-error mb-4 uppercase tracking-wider">
            Configuration Required
          </h2>
          <p className="text-system-text-muted text-sm mb-6 leading-relaxed">
            The System requires a Supabase connection to synchronize your player data. 
            Please provide your project credentials in the <span className="text-system-accent font-bold">Settings</span> menu.
          </p>
          
          <div className="space-y-3 text-left bg-system-bg-base/40 rounded-lg p-4 border border-system-border/10 mb-6">
            <div className="flex items-center gap-2 text-xs text-system-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-system-error" />
              <span>VITE_SUPABASE_URL</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-system-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-system-error" />
              <span>VITE_SUPABASE_ANON_KEY</span>
            </div>
            <div className="mt-4 pt-4 border-t border-system-border/10">
              <p className="text-[10px] text-system-text-muted uppercase mb-1">OAuth Redirect URI:</p>
              <code className="text-[10px] text-system-accent break-all bg-system-bg-base/40 p-1 rounded block">{window.location.origin}</code>
            </div>
          </div>

          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-system-accent hover:underline uppercase tracking-widest font-orbitron"
          >
            Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-md mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-system-bg-panel backdrop-blur-xl border border-system-accent/30 rounded-2xl p-8 system-border-glow"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-system-accent/10 rounded-full flex items-center justify-center mb-4 border border-system-accent/20">
            <Shield className="w-8 h-8 text-system-accent" />
          </div>
          <h2 className="text-2xl font-orbitron font-bold text-system-accent system-glow">
            {isLogin ? 'SYSTEM ACCESS' : 'PLAYER REGISTRATION'}
          </h2>
          <p className="text-system-text-muted text-sm mt-2 text-center">
            {isLogin 
              ? 'Enter your credentials to synchronize with the cloud.' 
              : 'Register your neural signature to the global database.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-orbitron text-system-accent/70 mb-1 ml-1 uppercase tracking-wider">Neural ID (Email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-lg px-4 py-3 text-system-text focus:outline-none focus:border-system-accent/50 transition-colors"
              placeholder="player@system.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-orbitron text-system-accent/70 mb-1 ml-1 uppercase tracking-wider">Access Key (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-system-bg-panel-solid/95 border border-system-accent/10 rounded-lg px-4 py-3 text-system-text focus:outline-none focus:border-system-accent/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-system-error/10 border border-system-error/20 rounded-lg text-system-error text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-system-accent hover:opacity-90 disabled:bg-system-bg-panel disabled:cursor-not-allowed text-system-bg-base font-orbitron py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                {isLogin ? 'SIGN IN' : 'SIGN UP'}
              </>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-system-border/30"></div>
            <span className="flex-shrink mx-4 text-[10px] font-orbitron text-system-text-muted uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-system-border/30"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-system-text hover:bg-system-text/90 disabled:bg-system-bg-panel disabled:cursor-not-allowed text-system-bg-base font-orbitron py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            SIGN IN WITH GOOGLE
          </button>

        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-system-text-muted hover:text-system-accent transition-colors uppercase tracking-tighter"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default Auth;
