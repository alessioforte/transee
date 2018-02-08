const querystring = require('querystring')
const token = require('./token')
const getContent = require('./get-content')

function translate(text, opts) {

  return token.get(text).then(token => {
    var url = 'https://translate.google.com/translate_a/single'
    var data = {
      client: 't',
      sl: opts.from,
      tl: opts.to,
      hl: opts.to,
      dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
      ie: 'UTF-8',
      oe: 'UTF-8',
      otf: 1,
      ssel: 0,
      tsel: 0,
      kc: 7,
      q: text
    }
    data[token.name] = token.value

    return url + '?' + querystring.stringify(data)
  }).then(url => {
    return getContent(url).then(res => {

      var parse = JSON.parse(res)
      if (global.showResponse) console.log(parse)

      var obj = {
        correction: {
          language: {
            didYouMean: false,
            iso: ''
          },
          text: {
            autoCorrected: false,
            value: '',
            didYouMean: false
          }
        }
      }

      if (parse[2] === parse[8][0][0]) {
          obj.correction.language.iso = parse[2];
      } else {
          obj.correction.language.didYouMean = true;
          obj.correction.language.iso = parse[8][0][0];
      }

      if (parse[7] && parse[7][0]) {

          var youMean = parse[7][1]
          obj.correction.text.value = youMean

          if (parse[7][5] === true) {
              obj.correction.text.autoCorrected = true;
          } else {
              obj.correction.text.didYouMean = true;
          }
      }

      if (parse[0]) {
        let length = parse[0].length
        let input = []
        let translation = []
        obj.target = parse[0][0][1] || null

        for (let i = 0; i < length; i++) {
          if (parse[0][i][1] !== null) {
            input.push(parse[0][i][1])
            translation.push(parse[0][i][0])
          }
        }
        obj.input = input
        obj.text = input.join('')
        obj.translation = translation.join('')
      }

      if (parse[0][1]) {
        obj.pronunciation = parse[0][1][3]
      }

      if (parse[1]) {
        var translations = []

        for (let i = 0; i < parse[1].length; i++) {
          let type = parse[1][i][0]
          let content = []

          for (let j = 0; j < parse[1][i][2].length; j++) {
            var rating = parse[1][i][2][j][3]
            var bar, article

            switch (true) {
              case (rating > 0.05):
                bar = 'common'
                break
              case (rating < 0.05 && rating > 0.002):
                bar = 'uncommon'
                break
              case (rating < 0.002):
                bar = 'rare'
                break
              case (rating === undefined):
                bar = 'rare'
            }

            let obj = {
              article: parse[1][i][2][j][4] || null,
              word: parse[1][i][2][j][0],
              meaning: parse[1][i][2][j][1],
              rating,
              bar
            }

            content.push(obj)
          }

          let section = {
            type,
            content
          }

          translations.push(section)
        }

        obj.translations = translations
      }

      if (parse[12]) {
        var definitions = []

        for (let i = 0; i < parse[12].length; i++) {
          let type = parse[12][i][0]
          let content = []

          for (let j = 0; j < parse[12][i][1].length; j++) {
            let obj = {
              phrase: parse[12][i][1][j][0],
              instance: parse[12][i][1][j][2]
            }
            content.push(obj)
          }
          let section = {
            type,
            content
          }
          definitions.push(section)
        }
        obj.definitions = definitions
      }

      if (parse[11]) {
        var synonyms = []

        for (let i = 0; i < parse[11].length; i++) {
          let type = parse[11][i][0]
          let content = []

          for (let j = 0; j < parse[11][i][1].length; j++) {
            let arr = parse[11][i][1][j][0]
            content.push(arr)
          }
          let section = {
            type,
            content
          }
          synonyms.push(section)
        }
        obj.synonyms = synonyms
      }

      if (parse[13]) {
        var examples = []
        for (let i = 0; i < parse[13][0].length; i++) {
          examples.push(parse[13][0][i][0])
        }
        obj.examples = examples
      }

      if (parse[14]) {
        obj.seeAlso = parse[14][0]
      }

      return obj

    }).catch(err => {
      var e = new Error()
      if (err.statusCode !== undefined && err.statusCode !== 200) {
        e.code = 'BAD_REQUEST'
      } else {
        e.code = 'BAD_NETWORK'
      }
      throw e
    })
  })
}

function complete(text, lang) {

  var url = 'https://clients1.google.com/complete/search'
  var data = {
    q: text,
    client: 'translate-web',
    ds: 'translate',
    ie: 'UTF-8',
    oe: 'UTF-8',
    hl: lang
  }
  url = url + '?' + querystring.stringify(data)
  return getContent(url).then(res => {

    var parse = JSON.parse(res.slice(19, -1))
    if (global.showResponse) console.log(parse)

    var obj = []

    if (parse[1]) {
      for (let i = 0; i <  parse[1].length; i++) {
        let s = parse[1][i][0].replace(/\&#39;/mg, "'")
        obj.push(s)
      }
    }

    return obj

  }).catch(err => {
    var e = new Error()
    if (err.statusCode !== undefined && err.statusCode !== 200) {
      e.code = 'BAD_REQUEST'
    } else {
      e.code = 'BAD_NETWORK'
    }
    throw e
  })
}

function translateComplete(words, opts) {
  var text = words.join('')

  return token.get(text).then(token => {
    var url = 'https://translate.google.com/translate_a/t'
    var data = {
      client: 't',
      sl: opts.from,
      tl: opts.to,
      hl: opts.to,
      v: '1.0',
      source: 'is',
      ie: 'UTF-8',
      oe: 'UTF-8',
      tk: token.value,
      q: [...words]
    }

    url = url + '?' + querystring.stringify(data)
    return getContent(url).then(res => {

      var parse = JSON.parse(res)
      if (global.showResponse) console.log(parse)

      return parse

    }).catch(err => {
      var e = new Error()
      if (err.statusCode !== undefined && err.statusCode !== 200) {
        e.code = 'BAD_REQUEST'
      } else {
        e.code = 'BAD_NETWORK'
      }
      throw e
    })
  })
}

function voice(text, lang, speed) {
  return token.get(text).then(token => {
    var textlen = text.length
    var url = 'https://translate.google.com/translate_tts'
    var data = {
      ie: 'UTF-8',
      q: text,
      tl: lang,
      total: 1,
      idx: 0,
      textlen: textlen,
      tk: token.value,
      client: 't',
      prev: 'input'
    }

    if (speed) data['ttsspeed'] = 0.24

    return url + '?' + querystring.stringify(data)
  })
}

module.exports = {
  translate,
  voice,
  complete,
  translateComplete
}
