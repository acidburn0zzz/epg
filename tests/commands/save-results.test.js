const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

beforeEach(() => {
  fs.rmdirSync('tests/__data__/output', { recursive: true })
  fs.mkdirSync('tests/__data__/output')
  fs.mkdirSync('tests/__data__/output/database', { recursive: true })

  fs.copyFileSync(
    'tests/__data__/input/database/queue.db',
    'tests/__data__/output/database/queue.db'
  )

  const stdout = execSync(
    'DB_DIR=tests/__data__/output/database LOGS_DIR=tests/__data__/input/logs node scripts/commands/save-results.js',
    { encoding: 'utf8' }
  )
})

it('can save programs to database', () => {
  let output = content('tests/__data__/output/database/programs.db')
  let expected = content('tests/__data__/expected/database/programs.db')

  output = output.map(i => {
    i._id = null
    return i
  })
  expected = expected.map(i => {
    i._id = null
    return i
  })

  expect(output).toEqual(expected)
})

it('can update queue', () => {
  const output = content('tests/__data__/output/database/queue.db')

  expect(output[1]).toMatchObject({
    _id: '0Wefq0oMR3feCcuY',
    programCount: 23
  })
})

it('can save errors', () => {
  const output = content('tests/__data__/input/logs/errors.log')

  expect(output[0]).toMatchObject({
    _id: '00AluKCrCnfgrl8W',
    site: 'directv.com',
    xmltv_id: 'BravoEast.us',
    error: 'Invalid header value char'
  })
})

function content(filepath) {
  const data = fs.readFileSync(path.resolve(filepath), {
    encoding: 'utf8'
  })

  return data
    .split('\n')
    .filter(l => l)
    .map(l => {
      return JSON.parse(l)
    })
}
