const { Router } = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { check, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const router = Router()
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const { registerValidators, loginValidators } = require('../utils/validators')
const User = require('../models/user')

const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        api_key: keys.SENDGRID_API_KEY
    }
}))

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.post('/login', loginValidators, async (req, res) => {
    try {
        const { email, password } = req.body
        const errors = validationResult(req)
        const candidate = await User.findOne({ email: email })

        if (errors.isEmpty()) {
            req.session.user = candidate
            req.session.isAuthenticated = true
            req.session.save(err => { if (err) throw err })

            res.redirect('/')
        } else {
            req.flash('loginError', errors.array()[0].msg)
            res.redirect('/auth/login#login')
        }

    } catch (error) {
        console.log(error);
    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot password?',
        error: req.flash('error')
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something wrong,try again later')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 3600000 // one hour expiration
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'This user does not exist')
                res.redirect('/auth/reset')
            }
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }
        })

        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'New password',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({ email, name, password: hashPassword, cart: { items: [] } })
            await user.save()
            await transporter.sendMail(regEmail(email))
            res.redirect('/auth/login#login')
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', '??oken has expired')
            res.redirect('/auth/login')
        }

    } catch (error) {
        console.log(error);
    }
})


module.exports = router