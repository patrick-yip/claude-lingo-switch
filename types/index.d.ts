export type ProfileId = string

declare module 'claude-code' {
  interface PluginState {
    'lingo-switch': { profile: ProfileId; isOpen: boolean }
  }
}
