const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const { exphbs, engine } = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const Handlebars = require('handlebars')
const homeRoutes = require('./routes/home')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const User = require('./models/user')



const app = express()

// const hbs = exphbs.create({
//     defaultLayout: 'main',
//     extname: 'hbs',
// })

app.engine('hbs', engine({
    defaultLayout: 'main',
    extname: 'hbs',
    'handlebars': allowInsecurePrototypeAccess(Handlebars)
}))
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('62ecc9abd9e70481057be101')
        req.user = user
        next()
    } catch (error) {
        console.log(error);
    }
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)



const PORT = process.env.PORT || 3000

async function start() {
    try {
        const url = `mongodb+srv://anton:0lZx5drBFQOsiH12@cluster0.ckqqkba.mongodb.net/shop`
        await mongoose.connect(url, { useNewUrlParser: true })

        const candidate = await User.findOne()
        if (!candidate) {
            const user = new User({
                email: 'anton@gmail.com',
                name: 'Anton',
                cart: { items: [] }
            })

            await user.save()
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} `);
        })

    } catch (error) {
        console.log(error);
    }
}

start()