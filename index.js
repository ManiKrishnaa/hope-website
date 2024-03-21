const express = require('express');
const session = require('express-session');
const mongodbsession = require("connect-mongodb-session")(session);
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const donormodel = require('./models/donorschema');
const orgmodel = require('./models/orgschema');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));

const store = new mongodbsession({
    uri: 'mongodb://localhost:27017/hope',
    session: 'mysessions'
});

app.use(session({
    secret: 'something i kept',
    resave: false,
    saveUninitialized: false,
    store: store
}));

mongoose.connect('mongodb://localhost:27017/hope')
    .then(() => {
        console.log("MongoDB connected!");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.get('/', (req, res) => {
    res.render('home', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/home', (req, res) => {
    res.render('home', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/services', (req, res) => {
    res.render('services', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/contact', (req, res) => {
    res.render('contact', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/donorsignup', (req, res) => {
    res.render('donorsignup', { isLoggedIn: req.session.isLoggedIn, usernamestatus: false, mobilestatus: false, emailstatus: false, something: false });
});

app.post('/donorsignup', async (req, res) => {
    const { donorname, donormobile, donoremail, username, password, role } = req.body;
    try {
        let check_username =  await donormodel.findOne({ username });
        let check_email =  await donormodel.findOne({ donoremail });
        let check_mobile = await donormodel.findOne({ donormobile });

        if (check_mobile) {
            return res.render("donorsignup", { usernamestatus: false, mobilestatus: true, emailstatus: false, something: false });
        }
        if (check_email) {
            return res.render("donorsignup", { emailstatus: true, mobilestatus: false, usernamestatus: false, something: false });
        }
        if (check_username) {
            return res.render("donorsignup", { mobilestatus: false, emailstatus: false, usernamestatus: true, something: false });
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const newdonor = new donormodel({ name: donorname, mobile: donormobile, email: donoremail, username: username, password: hashed_password, role: role });
        await newdonor.save();
        res.render('donorlogin',{signupstatus : true,something : false,usernamestatus : false,creditinalsstatus : false});
    } catch (error) {
        console.error(error);
        return res.render("donorsignup",{something : true,emailstatus : false,usernamestatus : false,mobilestatus: false});
    }
});

app.get('/orgsignup', (req, res) => {
    res.render('orgsignup', { isLoggedIn: req.session.isLoggedIn, something: false, emailstatus: false, mobilestatus: false, usernamestatus: false });
});

app.post('/orgsignup', async (req, res) => {
    const { orgname, orgstrength, orgmobile, orgemail, orgmale, orgfemale, orgchildren, address, username, password, role } = req.body;
    try {
        let check_username = await orgmodel.findOne({ username });
        let check_email = await orgmodel.findOne({ orgemail });
        let check_mobile = await orgmodel.findOne({ orgmobile });

        if (check_mobile) {
            return res.render("orgsignup", { usernamestatus: false, mobilestatus: true, emailstatus: false, something: false });
        }
        if (check_email) {
            return res.render("orgsignup", { emailstatus: true, mobilestatus: false, usernamestatus: false, something: false });
        }
        if (check_username) {
            return res.render("orgsignup", { mobilestatus: false, emailstatus: false, usernamestatus: true, something: false });
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const neworg = new orgmodel({ name: orgname, strength: orgstrength, mobile: orgmobile, email: orgemail, males: orgmale, females: orgfemale, childrens: orgchildren, address: address, username: username, password: hashed_password, role: role });
        await neworg.save();
        res.render("orglogin",{signupstatus : true,something : false,usernamestatus : false,creditinalsstatus : false})
    } catch (error) {
        console.error(error);
        return res.render("orgsignup", { something: true, emailstatus: false, mobilestatus: false, usernamestatus: false });
    }
});

app.get('/donorlogin', (req, res) => {
    res.render('donorlogin', { isLoggedIn: req.session.isLoggedIn, signupstatus: false, something: false, usernamestatus: false, creditinalsstatus: false });
});

app.post('/donorlogin', async (req, res) => {
    const {username,password} = req.body;
    try{
        let check_username = await donormodel.findOne({username});
        if(!check_username)
        {
            res.render("donorlogin",{usernamestatus : true,something : false,signupstatus : false,creditinalsstatus : false});   
        }
        let ismatch = bcrypt.compare(password,check_username.password);
        if(!ismatch) 
        {
            res.render("donorlogin",{creditinalsstatus : true,something : false,usernamestatus : false,signupstatus : false});
        }
        res.send("login succesfull !");
    }catch(error){
        return res.render("donorlogin",{something : true,signupstatus : false,usernamestatus : false,creditinalsstatus : false});
    }
});

app.get('/orglogin', (req, res) => {
    res.render('orglogin', { isLoggedIn: req.session.isLoggedIn, signupstatus: false, something: false, usernamestatus: false, creditinalsstatus: false });
});

app.post('/orglogin', async (req, res) => {
    const {username,password} = req.body;
    try{
        let check_username = await orgmodel.findOne({username});
        if(!check_username)
        {
            res.render("orglogin",{usernamestatus : true,something : false,signupstatus : false,creditinalsstatus : false});   
        }
        let ismatch = bcrypt.compare(password,check_username.password);
        if(!ismatch)
        {
            res.render("orglogin",{creditinalsstatus : true,something : false,usernamestatus : false,signupstatus : false});
        }
        res.send("login succesfull !");
    }catch(error){
        return res.render("orglogin",{something : true,signupstatus : false,usernamestatus : false,creditinalsstatus : false});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("Server connected!");
});
