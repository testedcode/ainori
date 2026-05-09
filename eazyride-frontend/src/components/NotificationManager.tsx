"use client";
import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const VAPID_PUBLIC_KEY = 'BH03JOrkRvMsAsTc4Zq2mZeqIIZHyXZMt_bgpJVALjdVhygUKBA4G_zF1EvoJRFc-42ERcMSg8gtAU53EJueJjY';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}

export default function NotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsSubscribed(user.push_subscription || !!subscription);
      } else {
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await api.post('/auth/push-subscription', { subscription: JSON.stringify(subscription) });
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.push_subscription = JSON.stringify(subscription);
        localStorage.setItem('user', JSON.stringify(user));
      }
      setIsSubscribed(true);
      toast.success('Notifications enabled!', { icon: '🔔' });
    } catch (err) {
      console.error('Subscription failed:', err);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/push-test', {}) as any;
      toast.success(res.message || 'Test signal sent!', { icon: '🚀' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Test signal failed');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/auth/push-subscription', { subscription: null });
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.push_subscription = null;
          localStorage.setItem('user', JSON.stringify(user));
        }
        setIsSubscribed(false);
        toast('Notifications disabled', { icon: '🔕' });
      }
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) return null;
  if (loading) return <div className="panel animate-pulse" style={{ height: '100px' }} />;

  return (
    <div className="panel mb-24" style={{ padding: '24px', border: isSubscribed ? '1px solid var(--green)' : '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className={`icon-bubble ${isSubscribed ? 'green' : 'blue'}`}>
            {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <h4 style={{ margin: 0 }}>Ride Notifications</h4>
            <p className="small muted">Stay updated on booking requests and chat messages.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {isSubscribed && (
            <button onClick={handleTestNotification} className="light-btn small">Test Signal</button>
          )}
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            className={`${isSubscribed ? 'light-btn' : 'primary-btn'} small`}
          >
            {isSubscribed ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}
