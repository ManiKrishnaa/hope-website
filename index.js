const express = require('express');
const session = require('express-session');
const mongodbsession = require("connect-mongodb-session")(session);
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const donormodel = require('./models/donorschema');
const orgmodel = require('./models/orgschema');
const inventorymodel = require('./models/inventoryschema');

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
    res.render('home', { isLoggedin: req.session.isLoggedIn });
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
    res.render('donorsignup', { isLoggedin: req.session.isLoggedIn, usernamestatus: false, mobilestatus: false, emailstatus: false, something: false });
});

app.post('/donorsignup', async (req, res) => {
    const { donorname, donormobile, donoremail, username, password, role } = req.body;
    try {
        let check_username =  await donormodel.findOne({ username });
        let check_email =  await donormodel.findOne({ donoremail });
        let check_mobile = await donormodel.findOne({ donormobile });

        if (check_mobile) {
            return res.render("donorsignup", {isLoggedin: req.session.isLoggedIn, usernamestatus: false, mobilestatus: true, emailstatus: false, something: false });
        }
        if (check_email) {
            return res.render("donorsignup", { isLoggedin: req.session.isLoggedIn,emailstatus: true, mobilestatus: false, usernamestatus: false, something: false });
        }
        if (check_username) {
            return res.render("donorsignup", {isLoggedin: req.session.isLoggedIn, mobilestatus: false, emailstatus: false, usernamestatus: true, something: false });
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const newdonor = new donormodel({ name: donorname, mobile: donormobile, email: donoremail, username: username, password: hashed_password, role: role });
        await newdonor.save();
        res.render('donorlogin',{isLoggedin: req.session.isLoggedIn,signupstatus : true,something : false,usernamestatus : false,creditinalsstatus : false});
    } catch (error) {
        console.error(error);
        return res.render("donorsignup",{isLoggedin: req.session.isLoggedIn,something : true,emailstatus : false,usernamestatus : false,mobilestatus: false});
    }
});

app.get('/orgsignup', (req, res) => {
    res.render('orgsignup', { isLoggedin: req.session.isLoggedIn, something: false, emailstatus: false, mobilestatus: false, usernamestatus: false });
});

app.post('/orgsignup', async (req, res) => {
    const { orgname, orgstrength, orgmobile, orgemail, orgmale, orgfemale, orgchildren, address, username, password, role } = req.body;
    try {
        let check_username = await orgmodel.findOne({ username });
        let check_email = await orgmodel.findOne({ orgemail });
        let check_mobile = await orgmodel.findOne({ orgmobile });

        if (check_mobile) {
            return res.render("orgsignup", {isLoggedin: req.session.isLoggedIn, usernamestatus: false, mobilestatus: true, emailstatus: false, something: false });
        }
        if (check_email) {
            return res.render("orgsignup", { isLoggedin: req.session.isLoggedIn,emailstatus: true, mobilestatus: false, usernamestatus: false, something: false });
        }
        if (check_username) {
            return res.render("orgsignup", { isLoggedin: req.session.isLoggedIn,mobilestatus: false, emailstatus: false, usernamestatus: true, something: false });
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const neworg = new orgmodel({ name: orgname, strength: orgstrength, mobile: orgmobile, email: orgemail, males: orgmale, females: orgfemale, childrens: orgchildren, address: address, username: username, password: hashed_password, role: role });
        await neworg.save();
        res.render("orglogin",{isLoggedin: req.session.isLoggedIn,signupstatus : true,something : false,usernamestatus : false,creditinalsstatus : false})
    } catch (error) {
        console.error(error);
        return res.render("orgsignup", { isLoggedin: req.session.isLoggedIn,something: true, emailstatus: false, mobilestatus: false, usernamestatus: false });
    }
});

app.get('/donorlogin', (req, res) => {
    res.render('donorlogin', { isLoggedin: req.session.isLoggedIn, signupstatus: false, something: false, usernamestatus: false, creditinalsstatus: false });
});

app.post('/donorlogin', async (req, res) => {
    const {username,password} = req.body;
    try{
        let check_username = await donormodel.findOne({username});
        if(!check_username)
        {
            res.render("donorlogin",{isLoggedin: req.session.isLoggedIn,usernamestatus : true,something : false,signupstatus : false,creditinalsstatus : false});   
        }
        let ismatch = bcrypt.compare(password,check_username.password);
        if(!ismatch) 
        {
            res.render("donorlogin",{isLoggedin: req.session.isLoggedIn,creditinalsstatus : true,something : false,usernamestatus : false,signupstatus : false});
        }
        req.session.isLoggedIn = true; 
        req.session.username = check_username.username;
        res.redirect('/'); 
    }catch(error){
        return res.render("donorlogin",{isLoggedin: req.session.isLoggedIn,something : true,signupstatus : false,usernamestatus : false,creditinalsstatus : false});
    }
});

app.get('/orglogin', (req, res) => {
    res.render('orglogin', { isLoggedin: req.session.isLoggedIn, signupstatus: false, something: false, usernamestatus: false, creditinalsstatus: false });
});

app.post('/orglogin', async (req, res) => {
    const {username,password} = req.body;
    try{
        let check_username = await orgmodel.findOne({username});
        if(!check_username)
        {
            res.render("orglogin",{isLoggedin: req.session.isLoggedIn,usernamestatus : true,something : false,signupstatus : false,creditinalsstatus : false});   
        }
        let ismatch = bcrypt.compare(password,check_username.password);
        if(!ismatch)
        {
            res.render("orglogin",{isLoggedin: req.session.isLoggedIn,creditinalsstatus : true,something : false,usernamestatus : false,signupstatus : false});
        }
        req.session.isLoggedIn = true;
        req.session.username = check_username.username;
        res.redirect('/');
    }catch(error){
        return res.render("orglogin",{isLoggedin: req.session.isLoggedIn,something : true,signupstatus : false,usernamestatus : false,creditinalsstatus : false});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/myaccount', async (req, res) => {
    try {
        const username = req.session.username;
        let userdata = null;
        let role = null;

        if (username) {
            const donorData = await donormodel.findOne({ username });

            if (donorData) {
                userdata = donorData;
                role = donorData.role;
            } else {
                const orgData = await orgmodel.findOne({ username });

                if (orgData) {
                    userdata = orgData;
                    role = orgData.role;
                }
            }
        }
        res.render('myaccount', { isLoggedin: req.session.isLoggedIn, userdata: userdata, role: role });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});



app.post('/updatedonorinfo',async(req,res)=>{
    const {username,name,mobile,email} = req.body;
    let donor = await donormodel.findOne({ username });

    if (donor) {
        donor.name = name;
        donor.mobile = mobile;
        donor.email = email;

        await donor.save();
    }
    const userdata = await donormodel.findOne({username});
    let role = userdata.role;
    res.render("myaccount",{isLoggedin : req.session.isLoggedIn,role : role});
});

app.post('/updateorginfo',async(req,res)=>{
    const {username,name,mobile,email,strength,males,females,childrens,address} = req.body;
    let org = await orgmodel.findOne({ username });

    if (org) {
        org.name = name;
        org.mobile = mobile;
        org.email = email;
        org.strength = strength;
        org.males = males;
        org.females = females;
        org.childrens = childrens;
        org.address = address;

        await org.save();
    }
    const userdata = await orgmodel.findOne({username});
    let role = userdata.role;
    res.render("myaccount",{isLoggedin : req.session.isLoggedIn,role : role,userdata : userdata});
});

app.get('/dashboard',async(req,res)=>{
    const inventorydata = await orgmodel.find();
    res.render("orgdashboard",{isLoggedin : req.session.isLoggedIn,inventorydata : inventorydata,erroradding : false});
})

app.post('/additem',async(req,res)=>{
    try {
        const { itemname, itemlevel } = req.body;
        const newItem = new inventorymodel({
            itemname: itemname,
            itemlevel: itemlevel
        });
        const savedItem = await newItem.save();
        const inventorydata = await inventorymodel.find();
        res.render('orgdashboard',{isLoggedin : req.session.isLoggedIn,inventorydata : inventorydata,erroradding : false});
    } catch (error) {
        console.error('Error adding new inventory item:', error);
        res.render('orgdashboard',{isLoggedin : req.session.isLoggedIn,inventorydata : inventorydata,erroradding : true});
    }
});

app.post('/updateitem',async(req,res)=>{
    
})

app.listen(3000, () => {
    console.log("Server connected!");
});
