import type {
  RestrictedMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  StateMetadata,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import {
  isValidHexAddress,
  toChecksumHexAddress,
} from '@metamask/controller-utils';
import {
  type KeyringControllerStateChangeEvent,
  type KeyringControllerGetStateAction,
  type KeyringControllerLockEvent,
  type KeyringControllerUnlockEvent,
  KeyringTypes,
  type KeyringControllerState,
} from '@metamask/keyring-controller';
import type { AuthenticationController } from '@metamask/profile-sync-controller';
import { assert } from '@metamask/utils';
import log from 'loglevel';

import { TRIGGER_TYPES } from './constants/notification-schema';
import {
  processAndFilterNotifications,
  safeProcessNotification,
} from './processors/process-notifications';
import * as FeatureNotifications from './services/feature-announcements';
import * as OnChainNotifications from './services/onchain-notifications';
import type {
  INotification,
  MarkAsReadNotificationsParam,
} from './types/notification/notification';
import type { OnChainRawNotification } from './types/on-chain-notification/on-chain-notification';
import type {
  NotificationServicesPushControllerEnablePushNotificationsAction,
  NotificationServicesPushControllerDisablePushNotificationsAction,
  NotificationServicesPushControllerSubscribeToNotificationsAction,
  NotificationServicesPushControllerStateChangeEvent,
  NotificationServicesPushControllerOnNewNotificationEvent,
} from '../NotificationServicesPushController';

// Unique name for the controller
const controllerName = 'NotificationServicesController';

/**
 * State shape for NotificationServicesController
 */
export type NotificationServicesControllerState = {
  /**
   * We store and manage accounts that have been seen/visted through the
   * account subscription. This allows us to track and add notifications for new accounts and not previous accounts added.
   */
  subscriptionAccountsSeen: string[];

  /**
   * Flag that indicates if the metamask notifications feature has been seen
   */
  isMetamaskNotificationsFeatureSeen: boolean;

  /**
   * Flag that indicates if the metamask notifications are enabled
   */
  isNotificationServicesEnabled: boolean;

  /**
   * Flag that indicates if the feature announcements are enabled
   */
  isFeatureAnnouncementsEnabled: boolean;

  /**
   * List of metamask notifications
   */
  metamaskNotificationsList: INotification[];

  /**
   * List of read metamask notifications
   */
  metamaskNotificationsReadList: string[];
  /**
   * Flag that indicates that the creating notifications is in progress
   */
  isUpdatingMetamaskNotifications: boolean;
  /**
   * Flag that indicates that the fetching notifications is in progress
   * This is used to show a loading spinner in the UI
   * when fetching notifications
   */
  isFetchingMetamaskNotifications: boolean;
  /**
   * Flag that indicates that the updating notifications for a specific address is in progress
   */
  isUpdatingMetamaskNotificationsAccount: string[];
  /**
   * Flag that indicates that the checking accounts presence is in progress
   */
  isCheckingAccountsPresence: boolean;
};

const metadata: StateMetadata<NotificationServicesControllerState> = {
  subscriptionAccountsSeen: {
    persist: true,
    anonymous: true,
  },

  isMetamaskNotificationsFeatureSeen: {
    persist: true,
    anonymous: false,
  },
  isNotificationServicesEnabled: {
    persist: true,
    anonymous: false,
  },
  isFeatureAnnouncementsEnabled: {
    persist: true,
    anonymous: false,
  },
  metamaskNotificationsList: {
    persist: true,
    anonymous: true,
  },
  metamaskNotificationsReadList: {
    persist: true,
    anonymous: true,
  },
  isUpdatingMetamaskNotifications: {
    persist: false,
    anonymous: false,
  },
  isFetchingMetamaskNotifications: {
    persist: false,
    anonymous: false,
  },
  isUpdatingMetamaskNotificationsAccount: {
    persist: false,
    anonymous: false,
  },
  isCheckingAccountsPresence: {
    persist: false,
    anonymous: false,
  },
};
export const defaultState: NotificationServicesControllerState = {
  subscriptionAccountsSeen: [],
  isMetamaskNotificationsFeatureSeen: false,
  isNotificationServicesEnabled: false,
  isFeatureAnnouncementsEnabled: false,
  metamaskNotificationsList: [],
  metamaskNotificationsReadList: [],
  isUpdatingMetamaskNotifications: false,
  isFetchingMetamaskNotifications: false,
  isUpdatingMetamaskNotificationsAccount: [],
  isCheckingAccountsPresence: false,
};

const locallyPersistedNotificationTypes = new Set<TRIGGER_TYPES>([
  TRIGGER_TYPES.SNAP,
]);

export type NotificationServicesControllerGetStateAction =
  ControllerGetStateAction<
    typeof controllerName,
    NotificationServicesControllerState
  >;

export type NotificationServicesControllerUpdateMetamaskNotificationsList = {
  type: `${typeof controllerName}:updateMetamaskNotificationsList`;
  handler: NotificationServicesController['updateMetamaskNotificationsList'];
};

export type NotificationServicesControllerDisableNotificationServices = {
  type: `${typeof controllerName}:disableNotificationServices`;
  handler: NotificationServicesController['disableNotificationServices'];
};

export type NotificationServicesControllerGetNotificationsByType = {
  type: `${typeof controllerName}:getNotificationsByType`;
  handler: NotificationServicesController['getNotificationsByType'];
};

export type NotificationServicesControllerDeleteNotificationsById = {
  type: `${typeof controllerName}:deleteNotificationsById`;
  handler: NotificationServicesController['deleteNotificationsById'];
};

// Messenger Actions
export type Actions =
  | NotificationServicesControllerGetStateAction
  | NotificationServicesControllerUpdateMetamaskNotificationsList
  | NotificationServicesControllerDisableNotificationServices
  | NotificationServicesControllerGetNotificationsByType
  | NotificationServicesControllerDeleteNotificationsById;

// Allowed Actions
export type AllowedActions =
  // Keyring Controller Requests
  | KeyringControllerGetStateAction
  // Auth Controller Requests
  | AuthenticationController.AuthenticationControllerGetBearerToken
  | AuthenticationController.AuthenticationControllerIsSignedIn
  | AuthenticationController.AuthenticationControllerPerformSignIn
  // Push Notifications Controller Requests
  | NotificationServicesPushControllerEnablePushNotificationsAction
  | NotificationServicesPushControllerDisablePushNotificationsAction
  | NotificationServicesPushControllerSubscribeToNotificationsAction;

// Events
export type NotificationServicesControllerStateChangeEvent =
  ControllerStateChangeEvent<
    typeof controllerName,
    NotificationServicesControllerState
  >;

export type NotificationListUpdatedEvent = {
  type: `${typeof controllerName}:notificationsListUpdated`;
  payload: [INotification[]];
};

export type MarkNotificationsAsReadEvent = {
  type: `${typeof controllerName}:markNotificationsAsRead`;
  payload: [INotification[]];
};

// Events
export type Events =
  | NotificationServicesControllerStateChangeEvent
  | NotificationListUpdatedEvent
  | MarkNotificationsAsReadEvent;

// Allowed Events
export type AllowedEvents =
  // Keyring Events
  | KeyringControllerStateChangeEvent
  | KeyringControllerLockEvent
  | KeyringControllerUnlockEvent
  // Push Notification Events
  | NotificationServicesPushControllerOnNewNotificationEvent
  | NotificationServicesPushControllerStateChangeEvent;

// Type for the messenger of NotificationServicesController
export type NotificationServicesControllerMessenger = RestrictedMessenger<
  typeof controllerName,
  Actions | AllowedActions,
  Events | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

type FeatureAnnouncementEnv = {
  spaceId: string;
  accessToken: string;
  platform: 'extension' | 'mobile';
};

/**
 * Controller that enables wallet notifications and feature announcements
 */
export default class NotificationServicesController extends BaseController<
  typeof controllerName,
  NotificationServicesControllerState,
  NotificationServicesControllerMessenger
> {
  readonly #keyringController = {
    isUnlocked: false,

    setupLockedStateSubscriptions: (onUnlock: () => Promise<void>) => {
      const { isUnlocked } = this.messagingSystem.call(
        'KeyringController:getState',
      );
      this.#keyringController.isUnlocked = isUnlocked;

      this.messagingSystem.subscribe('KeyringController:unlock', () => {
        this.#keyringController.isUnlocked = true;
        // messaging system cannot await promises
        // we don't need to wait for a result on this.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        onUnlock();
      });

      this.messagingSystem.subscribe('KeyringController:lock', () => {
        this.#keyringController.isUnlocked = false;
      });
    },
  };

  readonly #auth = {
    getBearerToken: async () => {
      return await this.messagingSystem.call(
        'AuthenticationController:getBearerToken',
      );
    },
    isSignedIn: () => {
      return this.messagingSystem.call('AuthenticationController:isSignedIn');
    },
    signIn: async () => {
      return await this.messagingSystem.call(
        'AuthenticationController:performSignIn',
      );
    },
  };

  readonly #pushNotifications = {
    // Flag to check is notifications have been setup when the browser/extension is initialized.
    // We want to re-initialize push notifications when the browser/extension is refreshed
    // To ensure we subscribe to the most up-to-date notifications
    isSetup: false,

    subscribeToPushNotifications: async () => {
      await this.messagingSystem.call(
        'NotificationServicesPushController:subscribeToPushNotifications',
      );
    },
    enablePushNotifications: async (addresses: string[]) => {
      try {
        await this.messagingSystem.call(
          'NotificationServicesPushController:enablePushNotifications',
          addresses,
        );
      } catch (e) {
        log.error('Silently failed to enable push notifications', e);
      }
    },
    disablePushNotifications: async () => {
      try {
        await this.messagingSystem.call(
          'NotificationServicesPushController:disablePushNotifications',
        );
      } catch (e) {
        log.error('Silently failed to disable push notifications', e);
      }
    },
    subscribe: () => {
      this.messagingSystem.subscribe(
        'NotificationServicesPushController:onNewNotifications',
        (notification) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.updateMetamaskNotificationsList(notification);
        },
      );
    },
    initializePushNotifications: async () => {
      if (!this.state.isNotificationServicesEnabled) {
        return;
      }
      if (this.#pushNotifications.isSetup) {
        return;
      }

      // If wallet is unlocked, we can create a fresh push subscription
      // Otherwise we can subscribe to original subscription
      try {
        if (!this.#keyringController.isUnlocked) {
          throw new Error('Keyring is locked');
        }
        await this.enablePushNotifications();
        this.#pushNotifications.isSetup = true;
      } catch {
        await this.#pushNotifications
          .subscribeToPushNotifications()
          .catch(() => {
            // do nothing
          });
      }
    },
  };

  readonly #accounts = {
    // Flag to ensure we only setup once
    isNotificationAccountsSetup: false,

    getNotificationAccounts: () => {
      const { keyrings } = this.messagingSystem.call(
        'KeyringController:getState',
      );
      const firstHDKeyring = keyrings.find(
        (k) => k.type === KeyringTypes.hd.toString(),
      );
      const keyringAccounts = firstHDKeyring?.accounts ?? null;
      return keyringAccounts;
    },

    /**
     * Used to get list of addresses from keyring (wallet addresses)
     *
     * @returns addresses removed, added, and latest list of addresses
     */
    listAccounts: () => {
      // Get previous and current account sets
      const nonChecksumAccounts = this.#accounts.getNotificationAccounts();
      if (!nonChecksumAccounts) {
        return {
          accountsAdded: [],
          accountsRemoved: [],
          accounts: [],
        };
      }

      const accounts = nonChecksumAccounts
        .map((a) => toChecksumHexAddress(a))
        .filter((a) => isValidHexAddress(a));
      const currentAccountsSet = new Set(accounts);
      const prevAccountsSet = new Set(this.state.subscriptionAccountsSeen);

      // Invalid value you cannot have zero accounts
      // Only occurs when the Accounts controller is initializing.
      if (accounts.length === 0) {
        return {
          accountsAdded: [],
          accountsRemoved: [],
          accounts: [],
        };
      }

      // Calculate added and removed addresses
      const accountsAdded = accounts.filter((a) => !prevAccountsSet.has(a));
      const accountsRemoved = [...prevAccountsSet.values()].filter(
        (a) => !currentAccountsSet.has(a),
      );

      // Update accounts seen
      this.update((state) => {
        state.subscriptionAccountsSeen = [...currentAccountsSet];
      });

      return {
        accountsAdded,
        accountsRemoved,
        accounts,
      };
    },

    /**
     * Initializes the cache/previous list. This is handy so we have an accurate in-mem state of the previous list of accounts.
     */
    initialize: (): void => {
      if (
        this.#keyringController.isUnlocked &&
        !this.#accounts.isNotificationAccountsSetup
      ) {
        this.#accounts.listAccounts();
        this.#accounts.isNotificationAccountsSetup = true;
      }
    },

    /**
     * Subscription to any state change in the keyring controller (aka wallet accounts).
     * We can call the `listAccounts` defined above to find out about any accounts added, removed
     * And call effects to subscribe/unsubscribe to notifications.
     */
    subscribe: () => {
      this.messagingSystem.subscribe(
        'KeyringController:stateChange',
        async (totalAccounts, prevTotalAccounts) => {
          const hasTotalAccountsChanged = totalAccounts !== prevTotalAccounts;
          if (
            !this.state.isNotificationServicesEnabled ||
            !hasTotalAccountsChanged
          ) {
            return;
          }

          const { accountsAdded, accountsRemoved } =
            this.#accounts.listAccounts();

          const promises: Promise<unknown>[] = [];
          if (accountsAdded.length > 0) {
            promises.push(this.enableAccounts(accountsAdded));
          }
          if (accountsRemoved.length > 0) {
            promises.push(this.disableAccounts(accountsRemoved));
          }
          await Promise.allSettled(promises);
        },
        (state: KeyringControllerState) => {
          return (
            state?.keyrings?.flatMap?.((keyring) => keyring.accounts)?.length ??
            0
          );
        },
      );
    },
  };

  readonly #featureAnnouncementEnv: FeatureAnnouncementEnv;

  /**
   * Creates a NotificationServicesController instance.
   *
   * @param args - The arguments to this function.
   * @param args.messenger - Messenger used to communicate with BaseV2 controller.
   * @param args.state - Initial state to set on this controller.
   * @param args.env - environment variables for a given controller.
   * @param args.env.featureAnnouncements - env variables for feature announcements.
   * @param args.env.isPushIntegrated - toggle push notifications on/off if client has integrated them.
   */
  constructor({
    messenger,
    state,
    env,
  }: {
    messenger: NotificationServicesControllerMessenger;
    state?: Partial<NotificationServicesControllerState>;
    env: {
      featureAnnouncements: FeatureAnnouncementEnv;
      isPushIntegrated?: boolean;
    };
  }) {
    super({
      messenger,
      metadata,
      name: controllerName,
      state: { ...defaultState, ...state },
    });

    this.#featureAnnouncementEnv = env.featureAnnouncements;
    this.#registerMessageHandlers();
    this.#clearLoadingStates();
  }

  init() {
    this.#keyringController.setupLockedStateSubscriptions(async () => {
      this.#accounts.initialize();
      await this.#pushNotifications.initializePushNotifications();
    });

    this.#accounts.initialize();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.#pushNotifications.initializePushNotifications();
    this.#accounts.subscribe();
    this.#pushNotifications.subscribe();
  }

  #registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateMetamaskNotificationsList`,
      this.updateMetamaskNotificationsList.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:disableNotificationServices`,
      this.disableNotificationServices.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getNotificationsByType`,
      this.getNotificationsByType.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:deleteNotificationsById`,
      this.deleteNotificationsById.bind(this),
    );
  }

  #clearLoadingStates(): void {
    this.update((state) => {
      state.isUpdatingMetamaskNotifications = false;
      state.isCheckingAccountsPresence = false;
      state.isFetchingMetamaskNotifications = false;
      state.isUpdatingMetamaskNotificationsAccount = [];
    });
  }

  #assertAuthEnabled() {
    if (!this.#auth.isSignedIn()) {
      this.update((state) => {
        state.isNotificationServicesEnabled = false;
      });
      throw new Error('User is not signed in.');
    }
  }

  async #enableAuth() {
    const isSignedIn = this.#auth.isSignedIn();
    if (!isSignedIn) {
      await this.#auth.signIn();
    }
  }

  async #getBearerToken() {
    this.#assertAuthEnabled();

    const bearerToken = await this.#auth.getBearerToken();

    if (!bearerToken) {
      throw new Error('Missing BearerToken');
    }

    return { bearerToken };
  }

  /**
   * Sets the state of notification creation process.
   *
   * This method updates the `isUpdatingMetamaskNotifications` state, which can be used to indicate
   * whether the notification creation process is currently active or not. This is useful
   * for UI elements that need to reflect the state of ongoing operations, such as loading
   * indicators or disabled buttons during processing.
   *
   * @param isUpdatingMetamaskNotifications - A boolean value representing the new state of the notification creation process.
   */
  #setIsUpdatingMetamaskNotifications(
    isUpdatingMetamaskNotifications: boolean,
  ) {
    this.update((state) => {
      state.isUpdatingMetamaskNotifications = isUpdatingMetamaskNotifications;
    });
  }

  /**
   * Updates the state to indicate whether fetching of MetaMask notifications is in progress.
   *
   * This method is used to set the `isFetchingMetamaskNotifications` state, which can be utilized
   * to show or hide loading indicators in the UI when notifications are being fetched.
   *
   * @param isFetchingMetamaskNotifications - A boolean value representing the fetching state.
   */
  #setIsFetchingMetamaskNotifications(
    isFetchingMetamaskNotifications: boolean,
  ) {
    this.update((state) => {
      state.isFetchingMetamaskNotifications = isFetchingMetamaskNotifications;
    });
  }

  /**
   * Updates the state to indicate that the checking of accounts presence is in progress.
   *
   * This method modifies the `isCheckingAccountsPresence` state, which can be used to manage UI elements
   * that depend on the status of account presence checks, such as displaying loading indicators or disabling
   * buttons while the check is ongoing.
   *
   * @param isCheckingAccountsPresence - A boolean value indicating whether the account presence check is currently active.
   */
  #setIsCheckingAccountsPresence(isCheckingAccountsPresence: boolean) {
    this.update((state) => {
      state.isCheckingAccountsPresence = isCheckingAccountsPresence;
    });
  }

  /**
   * Updates the state to indicate that account updates are in progress.
   * Removes duplicate accounts before updating the state.
   *
   * @param accounts - The accounts being updated.
   */
  #updateUpdatingAccountsState(accounts: string[]) {
    this.update((state) => {
      const uniqueAccounts = new Set([
        ...state.isUpdatingMetamaskNotificationsAccount,
        ...accounts,
      ]);
      state.isUpdatingMetamaskNotificationsAccount = Array.from(uniqueAccounts);
    });
  }

  /**
   * Clears the state indicating that account updates are complete.
   *
   * @param accounts - The accounts that have finished updating.
   */
  #clearUpdatingAccountsState(accounts: string[]) {
    this.update((state) => {
      state.isUpdatingMetamaskNotificationsAccount =
        state.isUpdatingMetamaskNotificationsAccount.filter(
          (existingAccount) => !accounts.includes(existingAccount),
        );
    });
  }

  /**
   * Public method to expose enabling push notifications
   */
  public async enablePushNotifications() {
    try {
      const { bearerToken } = await this.#getBearerToken();
      const { accounts } = this.#accounts.listAccounts();
      const addressesWithNotifications =
        await OnChainNotifications.getOnChainNotificationsConfigCached(
          bearerToken,
          accounts,
        );
      const addresses = addressesWithNotifications
        .filter((a) => Boolean(a.enabled))
        .map((a) => a.address);
      if (addresses.length > 0) {
        await this.#pushNotifications.enablePushNotifications(addresses);
      }
    } catch (e) {
      log.error('Failed to enable push notifications', e);
    }
  }

  /**
   * Public method to expose disabling push notifications
   */
  public async disablePushNotifications() {
    await this.#pushNotifications.disablePushNotifications();
  }

  public async checkAccountsPresence(
    accounts: string[],
  ): Promise<Record<string, boolean>> {
    try {
      this.#setIsCheckingAccountsPresence(true);

      // Retrieve user storage
      const { bearerToken } = await this.#getBearerToken();
      const addressesWithNotifications =
        await OnChainNotifications.getOnChainNotificationsConfigCached(
          bearerToken,
          accounts,
        );

      const result: Record<string, boolean> = {};
      addressesWithNotifications.forEach((a) => {
        result[a.address] = a.enabled;
      });
      return result;
    } catch (error) {
      log.error('Failed to check accounts presence', error);
      throw error;
    } finally {
      this.#setIsCheckingAccountsPresence(false);
    }
  }

  /**
   * Sets the enabled state of feature announcements.
   *
   * **Action** - used in the notification settings to enable/disable feature announcements.
   *
   * @param featureAnnouncementsEnabled - A boolean value indicating the desired enabled state of the feature announcements.
   * @async
   * @throws {Error} If fails to update
   */
  public async setFeatureAnnouncementsEnabled(
    featureAnnouncementsEnabled: boolean,
  ) {
    try {
      this.update((s) => {
        s.isFeatureAnnouncementsEnabled = featureAnnouncementsEnabled;
      });
    } catch (e) {
      log.error('Unable to toggle feature announcements', e);
      throw new Error('Unable to toggle feature announcements');
    }
  }

  /**
   * This creates/re-creates on-chain triggers defined in User Storage.
   *
   * **Action** - Used during Sign In / Enabling of notifications.
   *
   * @param opts - optional options to mutate this functionality
   * @param opts.resetNotifications - this will not use the users stored preferences, and instead re-create notification triggers
   * It will help in case uses get into a corrupted state or wants to wipe their notifications.
   * @returns The updated or newly created user storage.
   * @throws {Error} Throws an error if unauthenticated or from other operations.
   */
  public async createOnChainTriggers(opts?: {
    resetNotifications?: boolean;
  }): Promise<void> {
    try {
      this.#setIsUpdatingMetamaskNotifications(true);

      const { bearerToken } = await this.#getBearerToken();

      const { accounts } = this.#accounts.listAccounts();

      // 1. See if has enabled notifications before
      const addressesWithNotifications =
        await OnChainNotifications.getOnChainNotificationsConfigCached(
          bearerToken,
          accounts,
        );

      // Notifications API can return array with addresses set to false
      // So assert that at least one address is enabled
      let accountsWithNotifications = addressesWithNotifications
        .filter((a) => Boolean(a.enabled))
        .map((a) => a.address);

      // 2. Enable Notifications (if no accounts subscribed or we are resetting)
      if (accountsWithNotifications.length === 0 || opts?.resetNotifications) {
        await OnChainNotifications.updateOnChainNotifications(
          bearerToken,
          accounts.map((address) => ({ address, enabled: true })),
        );
        accountsWithNotifications = accounts;
      }

      // 3. Lazily enable push notifications (FCM may take some time, so keeps UI unblocked)
      this.#pushNotifications
        .enablePushNotifications(accountsWithNotifications)
        .catch(() => {
          // Do Nothing
        });

      // Update the state of the controller
      this.update((state) => {
        state.isNotificationServicesEnabled = true;
        state.isFeatureAnnouncementsEnabled = true;
        state.isMetamaskNotificationsFeatureSeen = true;
      });
    } catch (err) {
      log.error('Failed to create On Chain triggers', err);
      throw new Error('Failed to create On Chain triggers');
    } finally {
      this.#setIsUpdatingMetamaskNotifications(false);
    }
  }

  /**
   * Enables all MetaMask notifications for the user.
   * This is identical flow when initializing notifications for the first time.
   *
   * @throws {Error} If there is an error during the process of enabling notifications.
   */
  public async enableMetamaskNotifications() {
    try {
      this.#setIsUpdatingMetamaskNotifications(true);
      await this.#enableAuth();
      await this.createOnChainTriggers();
    } catch (e) {
      log.error('Unable to enable notifications', e);
      throw new Error('Unable to enable notifications');
    } finally {
      this.#setIsUpdatingMetamaskNotifications(false);
    }
  }

  /**
   * Disables all MetaMask notifications for the user.
   * This method ensures that the user is authenticated, retrieves all linked accounts,
   * and disables on-chain triggers for each account. It also sets the global notification
   * settings for MetaMask, feature announcements to false.
   *
   * @throws {Error} If the user is not authenticated or if there is an error during the process.
   */
  public async disableNotificationServices() {
    this.#setIsUpdatingMetamaskNotifications(true);

    // Attempt Disable Push Notifications
    try {
      await this.#pushNotifications.disablePushNotifications();
    } catch {
      // Do nothing
    }

    // Update State: remove non-permitted notifications & disable flags
    const snapNotifications = this.state.metamaskNotificationsList.filter(
      (notification) => notification.type === TRIGGER_TYPES.SNAP,
    );
    this.update((state) => {
      state.isNotificationServicesEnabled = false;
      state.isFeatureAnnouncementsEnabled = false;
      // reassigning the notifications list with just snaps
      // since the disable shouldn't affect snaps notifications
      state.metamaskNotificationsList = snapNotifications;
    });

    // Finish Updating State
    this.#setIsUpdatingMetamaskNotifications(false);
  }

  /**
   * Deletes on-chain triggers associated with a specific account/s.
   * This method performs several key operations:
   * 1. Validates Auth
   * 2. Deletes accounts
   * (note) We do not need to look through push notifications as we've deleted triggers
   *
   * **Action** - When a user disables notifications for a given account in settings.
   *
   * @param accounts - The account for which on-chain triggers are to be deleted.
   * @returns A promise that resolves to void or an object containing a success message.
   * @throws {Error} Throws an error if unauthenticated or from other operations.
   */
  public async disableAccounts(accounts: string[]): Promise<void> {
    try {
      this.#updateUpdatingAccountsState(accounts);
      // Get and Validate BearerToken and User Storage Key
      const { bearerToken } = await this.#getBearerToken();

      // Delete these UUIDs (Mutates User Storage)
      await OnChainNotifications.updateOnChainNotifications(
        bearerToken,
        accounts.map((address) => ({ address, enabled: false })),
      );
    } catch (err) {
      log.error('Failed to delete OnChain triggers', err);
      throw new Error('Failed to delete OnChain triggers');
    } finally {
      this.#clearUpdatingAccountsState(accounts);
    }
  }

  /**
   * Updates/Creates on-chain triggers for a specific account.
   *
   * This method performs several key operations:
   * 1. Validates Auth & Storage
   * 2. Finds and creates any missing triggers associated with the account
   * 3. Enables any related push notifications
   * 4. Updates Storage to reflect new state.
   *
   * **Action** - When a user enables notifications for an account
   *
   * @param accounts - List of accounts you want to update.
   * @returns A promise that resolves to the updated user storage.
   * @throws {Error} Throws an error if unauthenticated or from other operations.
   */
  public async enableAccounts(accounts: string[]): Promise<void> {
    try {
      this.#updateUpdatingAccountsState(accounts);

      const { bearerToken } = await this.#getBearerToken();
      await OnChainNotifications.updateOnChainNotifications(
        bearerToken,
        accounts.map((address) => ({ address, enabled: true })),
      );
    } catch (err) {
      log.error('Failed to update OnChain triggers', err);
      throw new Error('Failed to update OnChain triggers');
    } finally {
      this.#clearUpdatingAccountsState(accounts);
    }
  }

  /**
   * Fetches the list of metamask notifications.
   * This includes OnChain notifications; Feature Announcements; and Snap Notifications.
   *
   * **Action** - When a user views the notification list page/dropdown
   *
   * @param previewToken - the preview token to use if needed
   * @returns A promise that resolves to the list of notifications.
   * @throws {Error} Throws an error if unauthenticated or from other operations.
   */
  public async fetchAndUpdateMetamaskNotifications(
    previewToken?: string,
  ): Promise<INotification[]> {
    try {
      this.#setIsFetchingMetamaskNotifications(true);

      // This is used by Feature Announcement & On Chain
      // Not used by Snaps
      const isGlobalNotifsEnabled = this.state.isNotificationServicesEnabled;

      // Raw Feature Notifications
      const rawAnnouncements =
        isGlobalNotifsEnabled && this.state.isFeatureAnnouncementsEnabled
          ? await FeatureNotifications.getFeatureAnnouncementNotifications(
              this.#featureAnnouncementEnv,
              previewToken,
            ).catch(() => [])
          : [];

      // Raw On Chain Notifications
      const rawOnChainNotifications: OnChainRawNotification[] = [];
      if (isGlobalNotifsEnabled) {
        try {
          const { bearerToken } = await this.#getBearerToken();
          const { accounts } = this.#accounts.listAccounts();
          const addressesWithNotifications = (
            await OnChainNotifications.getOnChainNotificationsConfigCached(
              bearerToken,
              accounts,
            )
          )
            .filter((a) => Boolean(a.enabled))
            .map((a) => a.address);
          const notifications =
            await OnChainNotifications.getOnChainNotifications(
              bearerToken,
              addressesWithNotifications,
            ).catch(() => []);
          rawOnChainNotifications.push(...notifications);
        } catch {
          // Do nothing
        }
      }

      // Snap Notifications (original)
      // We do not want to remove them
      const snapNotifications = this.state.metamaskNotificationsList.filter(
        (notification) => notification.type === TRIGGER_TYPES.SNAP,
      );

      const readIds = this.state.metamaskNotificationsReadList;

      // Combine Notifications
      const metamaskNotifications: INotification[] = [
        ...processAndFilterNotifications(rawAnnouncements, readIds),
        ...processAndFilterNotifications(rawOnChainNotifications, readIds),
        ...snapNotifications,
      ];

      // Sort Notifications
      metamaskNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Update State
      this.update((state) => {
        state.metamaskNotificationsList = metamaskNotifications;
      });

      this.messagingSystem.publish(
        `${controllerName}:notificationsListUpdated`,
        this.state.metamaskNotificationsList,
      );

      this.#setIsFetchingMetamaskNotifications(false);
      return metamaskNotifications;
    } catch (err) {
      this.#setIsFetchingMetamaskNotifications(false);
      log.error('Failed to fetch notifications', err);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Gets the specified type of notifications from state.
   *
   * @param type - The trigger type.
   * @returns An array of notifications of the passed in type.
   * @throws Throws an error if an invalid trigger type is passed.
   */
  public getNotificationsByType(type: TRIGGER_TYPES) {
    assert(
      Object.values(TRIGGER_TYPES).includes(type),
      'Invalid trigger type.',
    );
    return this.state.metamaskNotificationsList.filter(
      (notification) => notification.type === type,
    );
  }

  /**
   * Used to delete a notification by id.
   *
   * Note: This function should only be used for notifications that are stored
   * in this controller directly, currently only snaps notifications.
   *
   * @param id - The id of the notification to delete.
   */
  public async deleteNotificationById(id: string) {
    const fetchedNotification = this.state.metamaskNotificationsList.find(
      (notification) => notification.id === id,
    );

    assert(
      fetchedNotification,
      'The notification to be deleted does not exist.',
    );

    assert(
      locallyPersistedNotificationTypes.has(fetchedNotification.type),
      `The notification type of "${
        // notifications are guaranteed to have type properties which equate to strings
        fetchedNotification.type as string
      }" is not locally persisted, only the following types can use this function: ${[
        ...locallyPersistedNotificationTypes,
      ].join(', ')}.`,
    );

    const newList = this.state.metamaskNotificationsList.filter(
      (notification) => notification.id !== id,
    );

    this.update((state) => {
      state.metamaskNotificationsList = newList;
    });
  }

  /**
   * Used to batch delete notifications by id.
   *
   * Note: This function should only be used for notifications that are stored
   * in this controller directly, currently only snaps notifications.
   *
   * @param ids - The ids of the notifications to delete.
   */
  public async deleteNotificationsById(ids: string[]) {
    for (const id of ids) {
      await this.deleteNotificationById(id);
    }

    this.messagingSystem.publish(
      `${controllerName}:notificationsListUpdated`,
      this.state.metamaskNotificationsList,
    );
  }

  /**
   * Marks specified metamask notifications as read.
   *
   * @param notifications - An array of notifications to be marked as read. Each notification should include its type and read status.
   * @returns A promise that resolves when the operation is complete.
   */
  public async markMetamaskNotificationsAsRead(
    notifications: MarkAsReadNotificationsParam,
  ): Promise<void> {
    let onchainNotificationIds: string[] = [];
    let featureAnnouncementNotificationIds: string[] = [];
    let snapNotificationIds: string[] = [];

    try {
      const [
        onChainNotifications,
        featureAnnouncementNotifications,
        snapNotifications,
      ] = notifications.reduce<
        [
          MarkAsReadNotificationsParam,
          MarkAsReadNotificationsParam,
          MarkAsReadNotificationsParam,
        ]
      >(
        (allNotifications, notification) => {
          if (!notification.isRead) {
            switch (notification.type) {
              case TRIGGER_TYPES.FEATURES_ANNOUNCEMENT:
                allNotifications[1].push(notification);
                break;
              case TRIGGER_TYPES.SNAP:
                allNotifications[2].push(notification);
                break;
              default:
                allNotifications[0].push(notification);
            }
          }
          return allNotifications;
        },
        [[], [], []],
      );

      // Mark On-Chain Notifications as Read
      if (onChainNotifications.length > 0) {
        const bearerToken = await this.#auth.getBearerToken();

        if (bearerToken) {
          onchainNotificationIds = onChainNotifications.map(
            (notification) => notification.id,
          );
          await OnChainNotifications.markNotificationsAsRead(
            bearerToken,
            onchainNotificationIds,
          ).catch(() => {
            onchainNotificationIds = [];
            log.warn('Unable to mark onchain notifications as read');
          });
        }
      }

      // Mark Off-Chain notifications as Read
      if (featureAnnouncementNotifications.length > 0) {
        featureAnnouncementNotificationIds =
          featureAnnouncementNotifications.map(
            (notification) => notification.id,
          );
      }

      if (snapNotifications.length > 0) {
        snapNotificationIds = snapNotifications.map(
          (notification) => notification.id,
        );
      }
    } catch (err) {
      log.warn('Something failed when marking notifications as read', err);
    }

    // Update the state (state is also used on counter & badge)
    this.update((state) => {
      const currentReadList = state.metamaskNotificationsReadList;
      const newReadIds = [
        ...featureAnnouncementNotificationIds,
        ...snapNotificationIds,
      ];
      state.metamaskNotificationsReadList = [
        ...new Set([...currentReadList, ...newReadIds]),
      ];

      state.metamaskNotificationsList = state.metamaskNotificationsList.map(
        (notification: INotification) => {
          if (
            newReadIds.includes(notification.id) ||
            onchainNotificationIds.includes(notification.id)
          ) {
            if (notification.type === TRIGGER_TYPES.SNAP) {
              return {
                ...notification,
                isRead: true,
                readDate: new Date().toISOString(),
              };
            }
            return { ...notification, isRead: true };
          }
          return notification;
        },
      );
    });

    this.messagingSystem.publish(
      `${controllerName}:markNotificationsAsRead`,
      this.state.metamaskNotificationsList,
    );
  }

  /**
   * Updates the list of MetaMask notifications by adding a new notification at the beginning of the list.
   * This method ensures that the most recent notification is displayed first in the UI.
   *
   * @param notification - The new notification object to be added to the list.
   * @returns A promise that resolves when the notification list has been successfully updated.
   */
  public async updateMetamaskNotificationsList(
    notification: INotification,
  ): Promise<void> {
    if (
      this.state.metamaskNotificationsList.some((n) => n.id === notification.id)
    ) {
      return;
    }

    const processedNotification = safeProcessNotification(notification);

    if (processedNotification) {
      this.update((state) => {
        const existingNotificationIds = new Set(
          state.metamaskNotificationsList.map((n) => n.id),
        );
        // Add the new notification only if its ID is not already present in the list
        if (!existingNotificationIds.has(processedNotification.id)) {
          state.metamaskNotificationsList = [
            processedNotification,
            ...state.metamaskNotificationsList,
          ];
        }
      });

      this.messagingSystem.publish(
        `${controllerName}:notificationsListUpdated`,
        this.state.metamaskNotificationsList,
      );
    }
  }
}
