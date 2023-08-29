

const Express = require("express")
const app = Express()
app.use(Express.urlencoded())

const Mongoose = require("mongoose")

const Bcrypt = require("bcrypt")


const session = require("express-session")

const MongoDBSession = require("connect-mongodb-session")

// Establish that connection between session and mongodb
const connectedData = MongoDBSession(session)

const storeData = new connectedData({
    uri: "mongodb://127.0.0.1:27017",
    databaseName: "studentdatabase",
    collection: "session-data"
})

app.use(session({
    secret: "HJKHJ889^(*^*^",
    resave: true,
    saveUninitialized: false,
    store: storeData
}))


// Node, Express App to MongoDB
// Mongoose module

// We want to connect session with mongoDB
// connect-mongodb-session module




Mongoose.connect("mongodb://127.0.0.1:27017/studentdatabase")

const SignupSchema = new Mongoose.Schema({
    username: String,
    email: String,
    password: String,
})


const Signup = Mongoose.model("Signup", SignupSchema)

app.get("/home", function(request, response)
{
    if(!request.session.status.isLoggedIn)
    {
        return response.redirect("/login")
    }

    return response.render("home.ejs")
})

app.post("/home", function(request, response)
{
    //Logic to go back to the login page

    request.session.status.isLoggedIn = false
    response.redirect("/login")
})

app.get("/login", function(request, response)
{
    response.render("login.ejs")
})

app.post("/login", async function(request, response)
{
    // Logic to collect the login details(email and password)

    const myEmail = request.body.email
    // mark5225@gmail.com
    const myPassword = request.body.password
    // Jimmy

    // Logic to verify if the email that is used to login is really
    // a valid email or not???

    const output = await Signup.findOne({email: myEmail})

    // output = {
    //     _id: new ObjectId("64c5e984db9102e63b6fa8ae"),
    //     username: 'Mark',
    //     email: 'mark5225@gmail.com',
    //     password: '$2b$15$pb.KE9PslR3pmt5OqS1OL.GRuKaDF.JXJBywwYnpN2SG/6Mgv6hiu',
    //     __v: 0
    //   }
    
    if(output == null)
    {
        response.redirect("/login")
    }
    else
    {
        // If the email is present in the database OR valid

        // Mark --> $2b$15$ix9JWS7cur4c2UFFtZ90RuTVvIg0gUUSDL2EJy8rxzGM73NEdIBo6

        // We should also check its corresponding password for that email

        const databasePassword = output.password

        // Somehow we need to write the logic to check
        // the plain text(jimmy) is equal to hashed password($2b$15$ix9JWS7cur4c2UFFtZ90RuTVvIg0gUUSDL2EJy8rxzGM73NEdIBo6)

       const result = await Bcrypt.compare(myPassword, databasePassword)
        // result --> true or false
        if(result == true)
        {
            console.log("Password are Equal!!!")

            //Create details in the session
            request.session.status = { email: output.email, isLoggedIn: true }

            // status : {
            //     email: "raju5252@gmail.com",
            //     isLoggedIn: true
            // }

            // Redirect to the home page
            return response.redirect("/home")
        }
        else
        {
            console.log("Password are not Equal!!!")
            
            return response.redirect("/login")   
        }
    }
})

app.get("/signup", function(request, response)
{
    response.render("signup.ejs")
})

app.post("/signup", async function(request, response)
{
    // Logic to collect the signup details

    const myUsername = request.body.username
    const myEmail = request.body.email
    const myPassword = request.body.password
    const myConfirmPassword = request.body.confirmpassword

    if(myPassword === myConfirmPassword)
    {
       const securedPassword = await Bcrypt.hash(myPassword, 15)

        // salt

        const signupData = new Signup({
            username: myUsername,
            email: myEmail,
            password: securedPassword
        })
    
        signupData.save()
    }
    else
    {
        console.log("Passwords are not Equal!!!")
    }

    response.redirect("/login")

   
})

app.listen(3000)


// username:"John"
// email:"john.john@gmail.com"
// password:"$2b$15$Fot.5bcJNQq1ISyOHT11n.QH/s1bH1P5XJaFAW7j9cIlMIIk6rFw."