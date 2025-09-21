import { appConfigs } from '../config/apps';
import { AppConfig, SubscriptionTier, UserRole } from '../types';

const tierRank: Record<SubscriptionTier, number> = {
  core: 0,
  pro: 1,
  enterprise: 2
};

const appOrder = new Map<string, number>(appConfigs.map((app, index) => [app.id, index]));

type LauncherBadgeType = 'pwa' | 'new' | 'restricted' | 'tier';

export interface LauncherBadge {
  type: LauncherBadgeType;
  label: string;
}

export interface LauncherApp extends AppConfig {
  isAccessible: boolean;
  isFavorite: boolean;
  favoriteRank: number;
  configIndex: number;
  badges: LauncherBadge[];
}

export interface LauncherFilterOptions {
  role: UserRole;
  permissions?: string[];
  favorites?: string[];
  subscriptionTier?: SubscriptionTier;
  includeRestricted?: boolean;
}

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const buildBadges = (app: AppConfig, isAccessible: boolean, includeRestricted: boolean): LauncherBadge[] => {
  const badges: LauncherBadge[] = [];

  if (app.isPWA) {
    badges.push({ type: 'pwa', label: 'PWA' });
  }

  if (app.isNew) {
    badges.push({ type: 'new', label: 'New' });
  }

  if (tierRank[app.access.requiresSubscription] > tierRank.core) {
    badges.push({ type: 'tier', label: toTitleCase(app.access.requiresSubscription) });
  }

  if (app.access.restricted) {
    badges.push({
      type: 'restricted',
      label: app.access.restrictionLabel ?? 'Restricted'
    });
  }

  if (!isAccessible && includeRestricted) {
    const hasRestrictedBadge = badges.some((badge) => badge.type === 'restricted');
    if (!hasRestrictedBadge) {
      badges.push({
        type: 'restricted',
        label: app.access.restrictionLabel ?? 'Restricted'
      });
    }
  }

  return badges;
};

export const getLauncherApps = ({
  role,
  permissions = [],
  favorites = [],
  subscriptionTier = 'core',
  includeRestricted = false
}: LauncherFilterOptions): LauncherApp[] => {
  const hasCustomFavorites = favorites.length > 0;

  return appConfigs
    .filter((app) => app.roles.includes(role))
    .map((app) => {
      const requires = app.access.requiredPermissions ?? [];
      const hasPermissions = requires.every((permission) => permissions.includes(permission));
      const hasTierAccess = tierRank[subscriptionTier] >= tierRank[app.access.requiresSubscription];
      const isAccessible = hasPermissions && hasTierAccess;
      const customFavoriteIndex = favorites.indexOf(app.id);
      const isFavorite = hasCustomFavorites
        ? customFavoriteIndex !== -1
        : app.isFavorite === true;
      const favoriteRank = isFavorite
        ? hasCustomFavorites
          ? customFavoriteIndex
          : 0
        : Number.POSITIVE_INFINITY;
      const configIndex = appOrder.get(app.id) ?? Number.POSITIVE_INFINITY;
      const badges = buildBadges(app, isAccessible, includeRestricted);

      return {
        ...app,
        isAccessible,
        isFavorite,
        favoriteRank,
        configIndex,
        badges
      };
    })
    .filter((app) => (includeRestricted ? true : app.isAccessible))
    .sort((a, b) => {
      if (a.isAccessible !== b.isAccessible) {
        return a.isAccessible ? -1 : 1;
      }

      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }

      if (a.isFavorite && b.isFavorite) {
        return a.favoriteRank - b.favoriteRank;
      }

      if (a.configIndex !== b.configIndex) {
        return a.configIndex - b.configIndex;
      }

      return a.name.localeCompare(b.name);
    });
};

export const splitLauncherApps = (apps: LauncherApp[]) => {
  const favorites = apps.filter((app) => app.isFavorite && app.isAccessible);
  const regular = apps.filter((app) => !app.isFavorite && app.isAccessible);
  const restricted = apps.filter((app) => !app.isAccessible);

  return {
    favorites,
    regular,
    restricted
  };
};
