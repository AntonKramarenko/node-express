const { Router } = require('express')
const Course = require('../models/courses')
const auth = require('../middlewre/auth')
const router = Router()


function mapCartItems(cart) {
    return cart.items.map(c => ({
        ...c.courseId._doc,
        id: c.courseId.id,
        count: c.count
    }))
}

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count
    }, 0)
}

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id)

    await req.user.addToCart(course)

    res.redirect('/card')
})

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id)

    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)

    const card = {
        courses, price: computePrice(courses)
    }

    res.status(200).json(card)
})

router.get('/', auth, async (req, res) => {
    const user = await req.user.populate('cart.items.courseId')
    const courses = mapCartItems(user.cart)

    res.render('card', {
        isCard: true,
        title: "Basket",
        courses: courses,
        price: computePrice(courses)
    })
})

module.exports = router