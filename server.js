import express from "express";
import bcrypt from "bcrypt";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, setDoc, getDoc, updateDoc} from "firebase/firestore"
const firebaseConfig = {
    apiKey: "AIzaSyC2YamZwcWbTQsqNn19cGNfzPz5tiVr-ic",
    authDomain: "tea-db-6f9cb.firebaseapp.com",
    projectId: "tea-db-6f9cb",
    storageBucket: "tea-db-6f9cb.appspot.com",
    messagingSenderId: "565418350025",
    appId: "1:565418350025:web:282ce21d60024ac8738418"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();
// init server
const app = express();

//middlewares
app.use(express.static("public"));
app.use(express.json()) // enables form sharing 

//aws
import aws from "aws-sdk";
import dotenv from 'dotenv';
dotenv.config()

//aws setup
const region = "ap-south-1";
const bucketName = "ecom-website-424"
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

aws.config.update({
    region,
    accessKeyId,
    secretAccessKey
})
// init s3
const s3 = new aws.S3();

// generate image url
async function generateURL(){
    let date = new Date();
    
    const imageName = `${date.getTime()}.jpeg`

    const params = {
        Bucket: bucketName,
        Key: imageName,
        Expires: 300, //300 ms
        ContentType: "image/jpeg" 
    }
    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return uploadURL;
}
app.get('/s3url', (req, res) => {
    generateURL().then(url => res.json(url));
})

// routes
// home route
app.get('/', (req, res) => {
    res.sendFile("index.html", {root : "public"})
})

// signup

app.get('/signup', (req, res) => {
    res.sendFile("signup.html", { root: "public" })
})

app.post('/signup', (req, res) => {
    const { name, email,  password, number, tac  } = req.body;

    //form validation
    if (name.length < 1) {
        res.json({'alert': 'name must be 1 letter long'});
    } else if (!email.length) {
        res.json({'alert': 'enter your email'});
    } else if (password.length < 6) {
        res.json({'alert': 'password must be atleast 6 letters long'});
    } else if (!tac) {
        res.json({'alert': 'you must agree to all terms and conditions'});
    }else{
        // store the data in db
        const users = collection(db, "users");
        
        getDoc(doc(users, email)).then(user =>{
            if(user.exists()){
                return res.json({ 'alert': 'email already exists' })
            }else{
                // encrypt the password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) =>{
                        req.body.password = hash;
                        req.body.seller = false;

                        // set the doc
                        setDoc(doc(users, email), req.body).then(data => {
                            res.json({
                                name: req.body.name,
                                email: req.body.email,
                                seller: req.body.seller,

                            })
                        })
                    })
                })
            }
        })
    }
})

app.get('/login', (req, res) =>{
    res.sendFile("login.html", { root: "public" })
})

app.post('/login', (req, res) =>{
    let { email, password} = req.body;

    if (!email.length || !password.length) {
       res.json({ 'alert' : 'fill all the inputs'})
    }

    const users = collection(db, "users");

    getDoc(doc(users, email))
    .then(user => {
        if(!user.exists()){
            return res.json({'alert': 'email id not found'});
        } else{
            bcrypt.compare(password, user.data().password, (err, result) => {
                if(result){
                    let data = user.data();
                    return res.json({ 
                        name: data.name,
                        email: data.email,
                        seller: data.seller
                    })
                } else{
                    return res.json({'alert': 'the password you entered is incorrect'})
                }
            })
        }
    })
})

//seller route
app.get('/seller', (req, res) => {
    res.sendFile("seller.html", { root: "public" })
})

app.post('/seller', (req, res) => {
    let { name, address, about, number, email } =req.body;

    if (!name.length || !address.length || !about.length || number.length < 10 || !Number(number)) {
       return res.json({'alert' : 'some information(s) is/are incorrect'});
    } else{
        // update the seller status
        const sellers = collection(db, "sellers");
        setDoc(doc(sellers, email), req.body)
        .then(data => {
           const users = collection(db, "users");
           updateDoc(doc(users, email), {
               seller: true
           })
           .then(data => {
               res.json({ 'seller' : true })
           })
        })
    }
})

//dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile('dashboard.html', { root: "public"});
})

//add product
app.get('/add-product', (req, res) => {
    res.sendFile('add-product.html', { root: "public" });
})

app.get('/product', (req, res) => {
    res.sendFile('product.html', { root: "public" });
})


// 404 route
app.get('/404', (req, res) => {
    res.sendFile("404.html", { root: "public" })
})


app.use((req, res) => {
    res.redirect('/404')
}) 

app.listen(3000, () => {
    console.log('listsening on port 3000');
})

