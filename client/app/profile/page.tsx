'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from 'src/components/DashboardLayout';
import { useAuth } from 'src/hooks/useAuth';
import API from 'src/services/api';
import { User } from 'src/types';
import {
  ShieldAlert,
  Loader2,
  CheckCircle,
  AlertCircle,
  KeyRound,
  UserCog
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name || !email) {
      setProfileError('Name and email cannot be empty');
      return;
    }

    try {
      setProfileLoading(true);
      const response = await API.put('/profile', { name, email });
      const updatedUser: User = response.data.data;
      updateUser(updatedUser);
      setProfileSuccess('Profile details updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      await API.put('/profile', { oldPassword, newPassword });
      setPasswordSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 font-sans">Manage Profile</h2>
        <p className="text-slate-500 text-sm">Update your account information or credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
                <p className="text-xs text-slate-400">Modify your basic display configuration</p>
              </div>
            </div>

            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {profileLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile Info'
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Security settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <form onSubmit={handlePasswordUpdate} className="space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>
                <p className="text-xs text-slate-400">Regularly cycle passwords to keep transactions secure</p>
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm placeholder:text-slate-400 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm placeholder:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold">Security Reminder</h4>
          <p className="mt-1 leading-relaxed text-amber-800">
            For secure operations, JWT session keys are stored locally in the browser cookie environment. If you modify your email address or password, you might be prompted to log in again to establish a fresh security token.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
