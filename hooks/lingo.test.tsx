import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const BAND_PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 4,
  bodyColumns: 100,
  scroll: { offset: 0, bodyRows: 1 },
  view: {},
}

const lang = ($: Engine, args: string) =>
  $.command.run({
    command: 'lang',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 120 },
  })

/** The note the active profile attaches to a prompt. */
const note = async ($: Engine) => {
  const entered = await $.prompt.submit({ text: 'hi', wait: false, origin: { kind: 'composer' } })

  return entered.context?.at(-1) ?? ''
}

const engineBeneath = (on: On) => {
  mock.store(on)
  on('prompt.submit', ($, e) => ({ text: e.text, context: e.context }))
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)

    return <Box />
  })
}

test('every prompt carries the default profile', async ($, on) => {
  engineBeneath(on)

  expect(await note($)).toContain('"English" profile')
})

test('/lang <id> switches the profile the next prompt carries', async ($, on) => {
  engineBeneath(on)

  expect((await lang($, 'pirate')).text).toBe('Language → Pirate')
  expect(await note($)).toContain('"Pirate" profile')
  expect((await lang($, 'klingon')).text).toContain('No profile "klingon"')
})

test('the note scopes itself to reply language', async ($, on) => {
  engineBeneath(on)

  const text = await note($)
  expect(text).toContain('For reply language only')
  expect(text).not.toContain('overrides any')
})

test('the band switches on one press, stays up, and dismisses', async ($, on) => {
  engineBeneath(on)
  await lang($, '')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'lingo-switch', surface, component: 'AbovePrompt', props: BAND_PROPS })
    await ui.press({ key: 'wenyan' })
    expect(await note($)).toContain('Classical Chinese')
    expect(await ui.find({ key: 'pirate' })).toBeDefined()
    await ui.unmount()
  }

  const ui = await $.ui.mount({ plugin: 'lingo-switch', surface: 'terminal', component: 'AbovePrompt', props: BAND_PROPS })
  await ui.press({ key: 'dismiss' })
  expect(await ui.find({ key: 'pirate' })).toBeUndefined()
  await ui.unmount()
})
