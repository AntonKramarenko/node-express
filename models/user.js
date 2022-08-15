const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    cart: {
        items: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                }
            }
        ]
    }
})


userSchema.methods.addToCart = function (course) {
    const items = [...this.cart.items]
    const ind = items.findIndex(c => {
        return c.courseId.toString() === course._id.toString()
    })


    if (ind >= 0) {
        items[ind].count = items[ind].count + 1
    } else {
        items.push({
            courseId: course._id,
            count: 1
        })
    }


    // const newCart = { items: items }
    // this.cart = newCart
    // or
    this.cart = { items }
    return this.save()
}

userSchema.methods.removeFromCart = function (id) {
    let items = [...this.cart.items]
    const ind = items.findIndex(c => c.courseId.toString() === id.toString())

    if (items[ind].count === 1) {
        items = items.filter(c => c.courseId.toString() !== id.toString())
    } else {
        items[ind].count--
    }

    this.cart = { items }
    return this.save()
}


userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()
}

module.exports = model('User', userSchema)