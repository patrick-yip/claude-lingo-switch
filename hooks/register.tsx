import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { DEFAULT_PROFILE, PROFILES, findProfile, reminder } from './profiles'
import type { Profile } from './profiles'

const PROFILE_KEY = 'profile'
const OPEN_KEY = 'isOpen'

// $.state belongs to one session, and /clear starts a new one; the store outlives both.
// So the store holds the truth, and this counter only tells the bar to redraw.
const revision = atom({ plugin: 'lingo-switch', key: 'revision' } as const, 0)

const activeProfile = async ($: EngineInterface): Promise<Profile> =>
  findProfile(await $.store.get(PROFILE_KEY)) ?? DEFAULT_PROFILE

const isBarOpen = async ($: EngineInterface) => (await $.store.get(OPEN_KEY)) === true

const save = async ($: EngineInterface, key: string, value: unknown) => {
  await $.store.set(key, value)
  await update($, revision, n => n + 1)
}

const choose = async ($: EngineInterface, id: string): Promise<Profile | undefined> => {
  const profile = findProfile(id)
  if (profile) {
    await save($, PROFILE_KEY, profile.id)
  }

  return profile
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'lang',
      description: 'Pick the language Claude chats in (/lang, or /lang <id>)',
    })

    return next(e)
  })

  on('command.run', { command: 'lang' }, async ($, e) => {
    const id = e.args.trim()
    if (!id) {
      await save($, OPEN_KEY, true)

      return { text: 'Language bar is up. Dismiss hides it.' }
    }
    const profile = await choose($, id)

    return profile
      ? { text: `Language → ${profile.label}` }
      : { text: `No profile "${id}". Try: ${PROFILES.map(one => one.id).join(', ')}` }
  })

  on('prompt.submit', async ($, e, next) =>
    next({ ...e, context: [...(e.context ?? []), reminder(await activeProfile($))] }),
  )

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    await read($, revision)
    if (e.props.hasSurvey || !(await isBarOpen($))) {
      return next(e)
    }
    const { id } = await activeProfile($)
    const dismiss = () => save($, OPEN_KEY, false)
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box flexWrap="wrap" columnGap={2}>
        <Text>🌐</Text>
        {PROFILES.map((profile, index) => {
          const digit = index < 9 ? String(index + 1) : undefined

          return profile.id === id ? (
            // Keeps its hotkey, so pressing the active digit is a no-op instead of typing it into the prompt.
            <Button
              key={profile.id}
              label={digit ? `${digit}: ${profile.label}` : profile.label}
              hotkey={digit}
              variant="primary"
              onPress={() => {}}
            />
          ) : (
            <Button
              key={profile.id}
              label={profile.label}
              hotkey={digit}
              plain
              dimColor
              onPress={() => void choose($, profile.id)}
            />
          )
        })}
        <Button key="dismiss" label="Dismiss" hotkey="0" role="dismiss" plain dimColor onPress={dismiss} />
      </Box>
    )
  })
}
