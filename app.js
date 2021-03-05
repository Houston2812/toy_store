const express = require('express')
const path = require('path')
const session = require('express-session')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const { EDESTADDRREQ } = require('constants')
const { allowedNodeEnvironmentFlags } = require('process')
const { timeStamp } = require('console')

var app = express()
var port = 3000
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(session({
    secret: "NARUTOOOO",
    resave: false, 
    saveUninitialized: false
}))

app.use(fileUpload({
    useTempFile: true,
    tempFileDir: path.join(__dirname, 'tmp')
}));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'toys'
})

function Cart(cart){
    this.items = cart.items || {}
    this.totalItems = cart.totalItems || 0
    this.totalPrice = cart.totalPrice || 0
    // this.title = cart.title || ""

    this.add = function(item, id){
        var cartItem = this.items[id]
        if (!cartItem){
            cartItem = this.items[id] = {item: item, quantity: 0, price: 0, title: "", id: "0"}
        }
        cartItem.quantity++
        cartItem.price = cartItem.item.price * cartItem.quantity
        cartItem.title = cartItem.item.name
        cartItem.id = cartItem.item.id
        this.totalItems++
        this.totalPrice += cartItem.item.price
    }

    this.remove = function(id){
        var cartItem = this.items[id]
        cartItem.quantity--;
        cartItem.price = cartItem.item.price * cartItem.quantity
        cartItem.title = cartItem.item.name
        cartItem.id = cartItem.item.id

        this.totalItems --
        this.totalPrice -= cartItem.item.price
        if (cartItem.quantity == 0)
            delete this.items[id]
    }

    this.getItems = function(){
        var arr = []
        for (var id in this.items) {
            arr.push(this.items[id])
        }
        return arr
    }
    
    this.removeAll = function(){
        for (let prop in this.items){
            delete this.items[prop]
        }
        this.totalItems = 0
        this.totalPrice = 0
    }

    this.buy = function(){
        console.log('Items')
        for (let prop in this.items){
            console.log(prop)
            let sql = `update items set amount = amount - ${this.items[prop].quantity} where name = "${this.items[prop].item.name}";`
            conn.query(sql, (err, result) => {
                if (err) throw err;
            })
        }
        this.removeAll()
    }
  
}


app.get('/error', (req, res) => {
    res.render('error', {is_logged: false})
})
app.get('/success', (req, res) => {
    if (req.session.username) 
        res.render('success', {is_logged: req.session.loggedIn, username: req.session.username})
    else 
        res.redirect('/error')
})

app.get(['/', '/home'], (req, res) => {
    image = 'home_wallpaper.jpg'
    let sql = 'select items.id, items.name, items.pic_name, items.price, items.description from items where items.amount != 0 order by rand() limit 3;'

    conn.query(sql, function(err, result) {
        if (err) throw err;
        // console.log(req.session.cart)
        res.render('home', {image: image, username: req.session.username, is_logged: req.session.loggedIn, items:result})
    })
})

app.get('/catalogue', (req, res) => {
    let sql = 'select items.id, items.name, items.pic_name, items.price, items.description from items where items.amount != 0;'

    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.render('magazine', {items:result, username: req.session.username, is_logged : req.session.loggedIn})
    })
  
})

app.get('/add/:id', (req, res)=>{
    if (req.session.username){
        var iid = req.params.id
        var cart = new Cart(req.session.cart ? req.session.cart : {})
        let backUrl = req.header('Referer') || '/';
        // var item = items.filter(function(i) {
        //     return i.id == iid;
        // })
        var sql = `select * from items where id = "${req.params.id}";`
        conn.query(sql, function(err, result) {
            if (err) throw err;
            cart.add(result[0], iid)
            req.session.cart = cart
            res.redirect(backUrl)
        })
    }
    else {
        res.redirect('/error')
    }
})

app.get('/remove/:id', (req, res) => {
    if (req.session.username){
        var iid = req.params.id
        var cart = new Cart(req.session.cart ? req.session.cart : {})
        let backUrl = req.header('Referer') || '/basket';
    
        cart.remove(iid)
        req.session.cart = cart
        res.redirect(backUrl)
    } else {
        res.redirect('/error')
    }
})

app.get('/removeall', (req, res) => {
    if (req.session.username){
        var cart = new Cart(req.session.cart)
        cart.removeAll()
        req.session.cart = cart
        res.redirect('/basket')
    }else{
        res.redirect('/error')
    }
  
})
app.get('/basket', (req, res) => {
    if (req.session.username){
        let does_exist = false;
        if (!req.session.cart) {
            return res.render('basket', {
                products: null,
                exist: does_exist,
                is_logged: req.session.loggedIn,
                username: req.session.username
            })
        }
        var cart = new Cart(req.session.cart);
        var products = cart.getItems()
        if (products && products.length != 0)
            does_exist = true
        res.render('basket', {products: products, exist: does_exist, total_price: cart.totalPrice, is_logged: req.session.loggedIn, username: req.session.username})
    } else {
        res.redirect('/error')
    }
    
})

app.get('/buy', (req, res) => {
    if (req.session.username){
        console.log('')
        var cart = new Cart(req.session.cart)
        
        cart.buy()
        req.session.cart = cart
        res.redirect('/')
    } else {
        res.redirect('/error')
    }
})

app.get('/login', (req, res)=>{
    res.render('login', {username: req.session.username, is_logged: req.session.loggedIn})
})

app.post('/login', (req, res)=>{
    console.log("Logged in")
    let username_ = req.body.username
    let password_ = req.body.password
    if (username_ && password_){
        let sql = `select * from admins where username = "${username_}" `
        conn.query(sql, function(err, result) {
            if (err) throw err
            console.log(result)
            if (result.length > 0){
                let compare = bcrypt.compareSync(password_, result[0].password)
                if (compare) {
                    req.session.loggedIn = true
                    req.session.username = result[0].username
                    res.redirect('/home')
                }
                else {
                    res.send('<h1>Error! Incorrect credentials</h1>')
                }
            } else {
                res.send('<h1>Error! Incorrect credentials</h1>')
            }
            res.end()
        })
    } else {
        res.send('Plase enter username and password!')
        res.end()
    }
})

app.get('/logout', (req, res)=>{
    if (req.session.username){
        req.session.destroy()
        res.redirect('/home')
    } else {
        res.redirect('/error')
    }
})

app.get('/settings', (req, res)=>{
    if (req.session.username){
        let sql = `select * from admins where username = "${req.session.username}"`
        conn.query(sql, function(err, result) {
            if (err) throw err;
            console.log(result)
            res.render('settings', {information: result, is_logged: req.session.loggedIn, username: req.session.username})
        })
    } else {
        res.redirect('/error')
    }
})

app.get('/add_new', (req, res) => {
    if (req.session.username){
        res.render('add_item', {is_logged: req.session.loggedIn, username: req.session.username})
    }else {
        res.redirect('/error')
    }
})

app.post('/add_new', (req, res) => {
    if (req.session.username){
        let targetFile = req.files.file_input;
        let extName = path.extname(targetFile.name)
        let baseName = targetFile.name
        let uploadDir = path.join(__dirname, 'public', targetFile.name)
        let item_name = req.body.product_name
        let item_description = req.body.description
        let amount = req.body.amount
        let price = req.body.price

        console.log(`Item name: ${item_name}; Item description: ${item_description}; Item amount: ${amount}; Price: ${price};`)
        console.log(`File name: ${targetFile}; Extension name: ${extName}; Base name: ${baseName}; Upload directory: ${uploadDir}`)
        
        let imgExtList = ['.png', '.jpg', '.jpeg', '.gif']
            if (!imgExtList.includes(extName)){
                fs.unlinkSync(targetFile.tempFilePath)
                return res.send('Invalid image format');
        }

        targetFile.mv(uploadDir, (err) => {
            if (err)
                return res.send(err)
            let sql = `INSERT INTO items(name, pic_name, description, amount, price) VALUES ("${item_name}", "${baseName}", "${item_description}", ${amount}, ${price});`
            conn.query(sql, (err, result) => {
                if (err) throw err;
                res.redirect('/success')
            })
            // res.send(` <h4>File uploaded successfully! </h4>`)
        })

    }else{
        res.redirect('/error')
    }
})
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
})

