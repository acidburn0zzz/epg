const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

module.exports = {
  request: {
    timeout: 15000
  },
  site: 'dsmart.com.tr',
  url({ date, channel }) {
    return `https://www.dsmart.com.tr/api/v1/public/epg/schedules?page=${
      channel.site_id
    }&limit=1&day=${date.format('YYYY-MM-DD')}`
  },
  logo({ content }) {
    const data = JSON.parse(content)
    if (!data || !data.data.channels.length) return null
    const logoId = data.data.channels[0].logo

    return logoId ? `https://www.dsmart.com.tr/epg/images/0x50/${logoId}` : null
  },
  parser: function ({ content, channel, date }) {
    let offset = -1
    let programs = []
    const items = parseItems(content)
    items.forEach(item => {
      let start = parseStart(item, date)
      if (offset === -1 && start.hour() > 18) start = start.subtract(1, 'd')
      let stop = parseStop(item, date)
      if (offset === -1 && stop.hour() > 18) stop = stop.subtract(1, 'd')
      if (start.hour() < 18 || stop.hour() < 18) offset = 0

      programs.push({
        title: item.program_name,
        category: item.genre,
        description: item.description,
        start: start.toJSON(),
        stop: stop.toJSON()
      })
    })

    return programs
  }
}

function parseStart(item, date) {
  return dayjs.utc(item.start_date).set('date', date.get('date'))
}

function parseStop(item, date) {
  return dayjs.utc(item.end_date).set('date', date.get('date'))
}

function parseItems(content) {
  const data = JSON.parse(content)
  if (!data || !data.data.channels.length) return []

  return data.data.channels[0].schedule
}