import { appConfigs } from '../config/apps';
import { AppConfig, AppPermission, AppTier, UserRole } from '../types';

const tierRank: Record<AppTier, number> = {
  core: 0,
  plus: 1,
  premium: 2
};

const permissionLabels: Record<AppPermission, string> = {
  'orders:manage': 'Orders',
  'kitchen:manage': 'Kitchen',
  'catalog:manage': 'Product catalog',
  'inventory:manage': 'Inventory',
  'customers:manage': 'Customers',
  'promotions:manage': 'Promotions',
  'reports:view': 'Reports',
  'calendar:manage': 'Calendar',
  'accounting:view': 'Accounting',
  'settings:manage': 'Settings'
};

const capitalizeWords = (value: string) =>
  value
    .split(' ')
    .map(word => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const formatPermissionList = (permissions: AppPermission[]): string =>
  permissions
    .map(permission => permissionLabels[permission] ?? permission)
    .map(label => capitalizeWords(label))
    .join(', ');

const formatFlagName = (flag: string): string => {
  const normalized = flag.includes(':') ? flag.split(':')[1] : flag;
  return capitalizeWords(normalized.replace(/[-_]/g, ' '));
};

const isNewFlag = (flag: string): boolean =>
  flag.startsWith('beta:') || flag.startsWith('preview:');

export type LauncherBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface LauncherBadge {
  label: string;
  tone: LauncherBadgeTone;
}

export interface LauncherApp extends AppConfig {
  isAccessible: boolean;
  isFavorite: boolean;
  badge?: LauncherBadge;
  restrictionReasons: string[];
}

export interface LauncherSummary {
  total: number;
  accessible: number;
  favorites: number;
  restricted: number;
}

export interface LauncherState {
  all: LauncherApp[];
  accessible: LauncherApp[];
  restricted: LauncherApp[];
  favorites: LauncherApp[];
  summary: LauncherSummary;
}

export interface LauncherContext {
  role: UserRole;
  tier: AppTier;
  permissions?: AppPermission[];
  favorites?: string[];
  featureFlags?: string[];
}

export const emptyLauncherState: LauncherState = {
  all: [],
  accessible: [],
  restricted: [],
  favorites: [],
  summary: {
    total: 0,
    accessible: 0,
    favorites: 0,
    restricted: 0
  }
};

export const buildLauncherState = (context: LauncherContext): LauncherState => {
  const favoritesSet = new Set(context.favorites ?? []);
  const permissionsSet = new Set(context.permissions ?? []);
  const featureFlagSet = new Set(context.featureFlags ?? []);

  const all: LauncherApp[] = appConfigs.map((appConfig: AppConfig) => {
    const restrictionReasons: string[] = [];

    if (!appConfig.roles.includes(context.role)) {
      restrictionReasons.push('Unavailable for your role');
    }

    if (tierRank[context.tier] < tierRank[appConfig.tier]) {
      restrictionReasons.push(`Requires ${capitalizeWords(appConfig.tier)} plan`);
    }

    if (appConfig.permissions?.length) {
      const missingPermissions = appConfig.permissions.filter(
        permission => !permissionsSet.has(permission)
      );

      if (missingPermissions.length) {
        restrictionReasons.push(
          `Missing permissions: ${formatPermissionList(missingPermissions)}`
        );
      }
    }

    if (appConfig.featureFlags?.length) {
      const missingFlags = appConfig.featureFlags.filter(flag => !featureFlagSet.has(flag));

      if (missingFlags.length) {
        restrictionReasons.push(
          `Feature flag required: ${missingFlags.map(formatFlagName).join(', ')}`
        );
      }
    }

    const isAccessible = restrictionReasons.length === 0;
    const isFavorite = favoritesSet.has(appConfig.id);

    let badge: LauncherBadge | undefined;

    if (!isAccessible) {
      badge = { label: 'Restricted', tone: 'warning' };
    } else if (appConfig.featureFlags?.some(isNewFlag)) {
      badge = { label: 'New', tone: 'info' };
    }

    return {
      ...appConfig,
      isAccessible,
      isFavorite,
      badge,
      restrictionReasons
    };
  });

  const accessible = all.filter(app => app.isAccessible);
  const restricted = all.filter(app => !app.isAccessible);
  const favorites = accessible.filter(app => app.isFavorite);

  return {
    all,
    accessible,
    restricted,
    favorites,
    summary: {
      total: all.length,
      accessible: accessible.length,
      favorites: favorites.length,
      restricted: restricted.length
    }
  };
};
