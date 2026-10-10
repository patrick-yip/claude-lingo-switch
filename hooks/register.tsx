import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { DEFAULT_PROFILE, PROFILES, findProfile, reminder } from './profiles'
import type { Profile } from './profiles'

const STORE_KEY = 'profile'

const current = atom({ plugin: 'lingo-switch', key: 'profile' } as const, DEFAULT_PROFILE.id)
const isOpen = atom({ plugin: 'lingo-switch', key: 'isOpen' } as const, false)

const choose = async ($: EngineInterface, id: string): Promise<Profile | undefined> => {
  const profile = findProfile(id)
  if (!profile) {
    return undefined
  }
  await update($, current, () => profile.id)
  await $.store.set(STORE_KEY, profile.id)

  return profile
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'lang',
      description: 'Pick the language Claude chats in (/lang, or /lang <id>)',
    })
    const saved = findProfile(await $.store.get(STORE_KEY)) ?? DEFAULT_PROFILE
    await update($, current, () => saved.id)

    return next(e)
  })

  on('command.run', { command: 'lang' }, async ($, e) => {
    const id = e.args.trim()
    if (!id) {
      await update($, isOpen, () => true)

      return { text: 'Language bar is up. Dismiss hides it.' }
    }
    const profile = await choose($, id)

    return profile
      ? { text: `Language → ${profile.label}` }
      : { text: `No profile "${id}". Try: ${PROFILES.map(one => one.id).join(', ')}` }
  })

  on('prompt.submit', async ($, e, next) => {
    const profile = findProfile(await read($, current)) ?? DEFAULT_PROFILE

    return next({ ...e, context: [...(e.context ?? []), reminder(profile)] })
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isOpen))) {
      return next(e)
    }
    const id = await read($, current)
    const dismiss = () => update($, isOpen, () => false)
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box flexWrap="wrap" columnGap={2}>
        <Text>🌐</Text>
        {PROFILES.map((profile, index) => {
          const digit = index < 9 ? String(index + 1) : undefined

          return profile.id === id ? (
            <Button key={profile.id} label={digit ? `${digit}: ${profile.label}` : profile.label} variant="primary" onPress={() => {}} />
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
