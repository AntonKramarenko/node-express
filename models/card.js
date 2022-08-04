const path = require('path')
const fs = require('fs')

const p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'card.json'
)


class Card {

    static async add(course) {
        const card = await Card.fetch()

        const ind = card.courses.findIndex(c => c.id === course.id)
        const candidate = card.courses[ind]

        if (candidate) {
            candidate.count++
            card.courses[ind] = candidate
        } else {
            course.count = 1
            card.courses.push(course)
        }
        card.price += +course.price

        return new Promise((res, rej) => {
            fs.writeFile(p, JSON.stringify(card), err => {
                if (err) {
                    rej(err)
                } else {
                    res()
                }
            })
        })
    }

    static async remove(id) {
        const card = await Card.fetch()

        const ind = card.courses.findIndex(c => c.id === id)
        const course = card.courses[ind]

        if (course.count === 1) {
            card.courses = card.courses.filter(c => c.id !== id)
        } else {
            card.courses[ind].count--
        }

        card.price -= course.price

        return new Promise((res, rej) => {
            fs.writeFile(p, JSON.stringify(card), err => {
                if (err) {
                    rej(err)
                } else {
                    res(card)
                }
            })
        })
    }

    static async fetch() {
        return new Promise((res, rej) => {
            fs.readFile(p, 'utf-8', (err, content) => {
                if (err) {
                    rej(err)
                } else {
                    res(JSON.parse(content))
                }
            })
        })
    }
}

module.exports = Card