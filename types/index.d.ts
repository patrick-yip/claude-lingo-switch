export type Revision = number

declare module 'claude-code' {
  interface PluginState {
    'lingo-switch': { revision: Revision }
  }
}
