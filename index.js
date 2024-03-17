const express = require('express');
const session = require('express-session');
const mongodbsession = require("connect-mongodb-session")(session);
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const donormodel = require('./models/donorschema');
const orgmodel = require('./models/orgschema');

const app = express();

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));

const store = new mongodbsession({
    uri : 'mongodb://localhost:27017/hope',
    session : 'mysessions'
});

app.use(session({
    secret : 'something i kept',
   resave : false,
   saveUninitialized : false,
   store : store
}));

mongoose.connect('mongodb://localhost:27017/hope')
.then(() => {
    console.log("MongoDB connected!");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/home',(req,res)=>{
    res.render('home');
})

app.get('/services', (req, res) => {
    res.render('services');
});

app.get('/blog', (req, res) => {
    res.render('blog');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login',{usernamestatus : false,passwordstatus : false});
});

app.get('/signup', (req, res) => {
    res.render('signup', {
        emailstatusDonor: false, 
        mobilestatusDonor: false,
        usernamestatusDonor: false,
        something: false,
        donoruserstatus: false,
        orgnamestatus: false,
        emailstatus: false,
        mobilestatus: false,
        usernamestatus: false,
        something: false,
        donoruserstatus: false
    });
});

app.post('/donorsignup', async (req, res) => {
    const { name, email, mobile, username, password, role } = req.body;

    try {
        let check_email = await donormodel.findOne({ email });
        let check_mobile = await donormodel.findOne({ mobile });
        let check_username = await donormodel.findOne({ username });

        if (check_email) {
            return res.render('signup', { emailstatusDonor: true, mobilestatusDonor: false, usernamestatusDonor: false, something: false , donoruserstatus : false});
        }
        if (check_mobile) {
            return res.render('signup', { emailstatusDonor: false, mobilestatusDonor: true, usernamestatusDonor: false, something: false ,donoruserstatus : false});
        }
        if (check_username) {
            return res.render('signup', { emailstatusDonor: false, mobilestatusDonor: false, usernamestatusDonor: true, something: false,donoruserstatus : false });
        }

        let hashedpassword = await bcrypt.hash(password, 12);

        const newdonor = new donormodel({ name, email, mobile, username, password: hashedpassword, role });
        await newdonor.save();
        return res.send("Signup successful!");
    } catch (error) {
        console.error(error);
        return res.render('signup', {emailstatusDonor: false, mobilestatusDonor: false, usernamestatusDonor: false, something: true ,donoruserstatus : false});
    }
});




app.post('/orgsignup', async (req, res) => {
    const { orgname, orgemail, orgmobile, username, password, role } = req.body;

    try {
        let check_orgname = await orgmodel.findOne({orgname});
        let check_email = await orgmodel.findOne({ orgemail });
        let check_mobile = await orgmodel.findOne({ orgmobile });
        let check_username = await orgmodel.findOne({ username });

        if (check_orgname) {
            return res.render('signup', { orgnamestatus : true, emailstatus: false, mobilestatus: false, usernamestatus: false, something: false , donoruserstatus : false});
        }
        if (check_email) {
            return res.render('signup', { orgnamestatus : false, emailstatus: true, mobilestatus: false, usernamestatus: false, something: false , donoruserstatus : false});
        }
        if (check_mobile) {
            return res.render('signup', { orgnamestatus : false, emailstatus: false, mobilestatus: true, usernamestatus: false, something: false , donoruserstatus : false});
        }
        if (check_username) {
            return res.render('signup', { orgnamestatus : false, emailstatus: false, mobilestatus: false, usernamestatus: true, something: false , donoruserstatus : false});
        }

        let hashedpassword = await bcrypt.hash(password, 12);

        const neworg = new orgmodel({ orgname, orgemail, orgmobile, username, password: hashedpassword, role });
        await neworg.save();
        return res.send("Signup successful organisation!");
    } catch (error) {
        console.error(error);
        return res.render('signup', { orgnamestatus : false, emailstatus: false, mobilestatus: false, usernamestatus: false, something: true , donoruserstatus : false});
    }
});


app.post('/donorlogin',async(req,res)=>{
    const {username,password} = req.body;

    let check_username = await donormodel.findOne({ username });
        
    if (!check_username) {
        return res.render('login', { usernamestatus: true, passwordstatus: false });
    }

    bcrypt.compare(password, check_username.password, (err, isMatch) => {
        if (err) throw err;

        if (!isMatch) {
            return res.render('login', { usernamestatus: false, passwordstatus: true });
        }

        res.send("Login successful!"); 
    });
})

const isAuth = (req,res,next) =>{
    if(req.session.isAuth)
    {
        next();
    }else{
        res.render('login',{something : true,signupstatus : false,passwordstatus : false});
    }
}

app.get('/dashboard',isAuth,(req,res)=>{
    res.render('dashboard');
});

app.get('/logout',(req,res)=>{
    req.session.destroy((err)=>{
        if(err){console.log("error while destroying session")};
        res.redirect('/');
    });
});

app.listen(3000,()=>{
    console.log("Server connected ! ");
})
