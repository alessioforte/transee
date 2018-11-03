import React from 'react'
import { langsFrom, langsTo } from '../google-translate/langs'

export default ({ lang1, lang2, lang3, active, setLang, side }) => {

    var langs = side ? langsFrom : langsTo

    function handleClick(i) {
        setLang(i)
    }

    function renderLangs() {
        var items = []
        for (let i in langs) {
            if (i == active) {
                items.push(
                    <div
                        className='item'
                        style={{
                            backgroundColor: 'rgba(26, 26, 26, 0.8)',
                            color: '#fff'
                        }}
                        key={i}
                        >{langs[i]}
                    </div>
                )
            continue
            }
            if (i === lang1 || i === lang2 || i === lang3) {
                items.push(
                    <div
                        className='item'
                        style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)' }}
                        key={i}
                        onClick={() => handleClick(i)}
                    >{langs[i]}
                    </div>
                )
            continue
            }
            items.push(
                <div
                    className='item'
                    key={i}
                    onClick={() => handleClick(i)}
                >{langs[i]}
                </div>
            )
        }
        return items
    }

    return (
        <div>{renderLangs()}</div>
    )
}