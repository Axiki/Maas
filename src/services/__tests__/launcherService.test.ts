import { describe, expect, it } from 'vitest';
import { getLauncherApps } from '../launcherService';

describe('launcherService', () => {
  it('returns only core apps for cashier role', () => {
    const apps = getLauncherApps({ role: 'cashier', subscriptionTier: 'core' });

    expect(apps.map((app) => app.id)).toEqual(['portal', 'pos', 'customers']);
  });

  it('requires permissions for waiter to see reservation tools', () => {
    const withoutPermission = getLauncherApps({ role: 'waiter', subscriptionTier: 'pro' });
    expect(withoutPermission.map((app) => app.id)).toEqual(['portal', 'pos', 'customers']);

    const withPermission = getLauncherApps({
      role: 'waiter',
      subscriptionTier: 'pro',
      permissions: ['reservations:manage']
    });

    expect(withPermission.map((app) => app.id)).toEqual(['portal', 'pos', 'customers', 'calendar']);
  });

  it('grants managers pro tier applications when they have the right permissions', () => {
    const apps = getLauncherApps({
      role: 'manager',
      subscriptionTier: 'pro',
      permissions: [
        'catalog:manage',
        'inventory:manage',
        'kitchen:view',
        'promotions:manage',
        'reports:view',
        'reservations:manage'
      ]
    });

    expect(apps.map((app) => app.id)).toEqual([
      'portal',
      'pos',
      'kds',
      'products',
      'inventory',
      'customers',
      'promotions',
      'reports',
      'calendar'
    ]);
  });

  it('prioritises favourites and unlocks enterprise apps for owners', () => {
    const apps = getLauncherApps({
      role: 'owner',
      subscriptionTier: 'enterprise',
      permissions: [
        'catalog:manage',
        'inventory:manage',
        'kitchen:view',
        'promotions:manage',
        'reports:view',
        'reservations:manage',
        'finance:read',
        'settings:write'
      ],
      favorites: ['reports', 'accounting']
    });

    expect(apps.map((app) => app.id)).toEqual([
      'reports',
      'accounting',
      'portal',
      'pos',
      'kds',
      'products',
      'inventory',
      'customers',
      'promotions',
      'calendar',
      'backoffice'
    ]);
  });
});
