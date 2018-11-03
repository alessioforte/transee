import querystring from 'querystring'
import getToken from './token'
import axios from 'axios'

export async function translate(text, opts) {
    try {
        const tk = await getToken(text)
        const url = 'https://translate.google.com/translate_a/single'
        const data = {
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
            kc: 1,
            q: text,
            tk: tk.value
        }

        const res = await axios({
            method: 'get',
            url: url + '?' + querystring.stringify(data)
        })

        return remapTranslate(res.data)
    } catch (err) {
        console.error(err)
    }
}

export async function complete(text, lang) {
    try {
        const url = 'https://clients1.google.com/complete/search'
        const data = {
            q: text,
            client: 'translate-web',
            ds: 'translate',
            ie: 'UTF-8',
            oe: 'UTF-8',
            hl: lang
        }
        const res = await axios({
            method: 'get',
            url: url + '?' + querystring.stringify(data)
        })

        return remapComplete(res.data)
    } catch (err) {
        console.error(err)
    }
}

export async function translateComplete(words, opts) {
    try {
        const text = words.join('')
        const tk = await getToken(text)
        const url = 'https://translate.google.com/translate_a/t'
        const data = {
            client: 't',
            sl: opts.from,
            tl: opts.to,
            hl: opts.to,
            v: '1.0',
            source: 'is',
            ie: 'UTF-8',
            oe: 'UTF-8',
            tk: tk.value,
            q: [...words]
        }

        const res = await axios({
            method: 'get',
            url: url + '?' + querystring.stringify(data)
        })

        if (global.showResponse) console.log(res.data)

        return res.data

    } catch (err) {
        console.error(err)
    }
}

export async function voice(text, lang, speed) {
    const textlen = text.length
    const tk = await getToken(text)
    const url = 'https://translate.google.com/translate_tts'
    const data = {
        ie: 'UTF-8',
        q: text,
        tl: lang,
        total: 1,
        idx: 0,
        textlen: textlen,
        tk: tk.value,
        client: 't',
        prev: 'input'
    }
    if (speed) data['ttsspeed'] = 0.24

    return url + '?' + querystring.stringify(data)
}

function remapTranslate(data) {
    if (global.showResponse) console.log(data)

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

    if (data[2] === data[8][0][0]) {
        obj.correction.language.iso = data[2];
    } else {
        obj.correction.language.didYouMean = true;
        obj.correction.language.iso = data[8][0][0];
    }

    if (data[7] && data[7][0]) {

        var youMean = data[7][1]
        obj.correction.text.value = youMean

        if (data[7][5] === true) {
            obj.correction.text.autoCorrected = true;
        } else {
            obj.correction.text.didYouMean = true;
        }
    }

    if (data[0]) {
        let length = data[0].length
        let input = []
        let translation = []
        obj.target = data[0][0][1] || null

        for (let i = 0; i < length; i++) {
            if (data[0][i][1] !== null) {
                input.push(data[0][i][1])
                translation.push(data[0][i][0])
            }
        }
        obj.input = input
        obj.text = input.join('')
        obj.translation = translation.join('')
    }

    if (data[0][1]) {
        obj.pronunciation = data[0][1][3]
    }

    if (data[1]) {
        var translations = []

        for (let i = 0; i < data[1].length; i++) {
            let type = data[1][i][0]
            let content = []

            for (let j = 0; j < data[1][i][2].length; j++) {
                var rating = data[1][i][2][j][3]
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
                    article: data[1][i][2][j][4] || null,
                    word: data[1][i][2][j][0],
                    meaning: data[1][i][2][j][1],
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

    if (data[12]) {
        var definitions = []

        for (let i = 0; i < data[12].length; i++) {
            let type = data[12][i][0]
            let content = []

            for (let j = 0; j < data[12][i][1].length; j++) {
                let obj = {
                    phrase: data[12][i][1][j][0],
                    instance: data[12][i][1][j][2]
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

    if (data[11]) {
        var synonyms = []

        for (let i = 0; i < data[11].length; i++) {
            let type = data[11][i][0]
            let content = []

            for (let j = 0; j < data[11][i][1].length; j++) {
                let arr = data[11][i][1][j][0]
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

    if (data[13]) {
        var examples = []
        for (let i = 0; i < data[13][0].length; i++) {
            examples.push(data[13][0][i][0])
        }
        obj.examples = examples
    }

    if (data[14]) {
        obj.seeAlso = data[14][0]
    }

    return obj
}

function remapComplete(data) {
    if (global.showResponse) console.log(data)
    data = JSON.parse(data.slice(19, -1))
    var obj = []

    if (data[1]) {
        for (let i = 0; i < data[1].length; i++) {
            let s = data[1][i][0].replace(/\&#39;/mg, "'")
            obj.push(s)
        }
    }

    return obj
}
