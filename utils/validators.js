const { check, body } = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Enter correct email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('User with this email already exists')
                }
            } catch (error) {
                console.log(error);
            }
        }),

    body('password', 'Minimal password must have 6 chars')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({ min: 3 })
        .withMessage('Minimal name must have 3 chars')
        .trim()
]

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Enter correct email')
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value })

                if (!user) {
                    return Promise.reject('This email was not found')
                }
            } catch (error) {
                console.log(error);
            }
        }),
    body('password', 'Minimal password must have 6 chars')
        .isLength({ min: 6, max: 56 })
        .isAlphanumeric()
        .trim()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: req.body.email })

                if (user) {
                    const areSame = await bcrypt.compare(value, user.password)

                    if (!areSame) {
                        return Promise.reject('Enter correct email')
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }),
]

exports.courseValidators = [
    body('title')
        .isLength({ min: 3 })
        .withMessage('Minimal length of title is 3 char')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('Enter correct price'),
    body('img', 'Enter correct image url').isURL()

]