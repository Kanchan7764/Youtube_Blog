const {Schema , model} = require("mongoose");

const {createHmac , randomBytes} = require("crypto");
const { type } = require("os");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique :true,
    },
    salt:{
        type:String,
        require:true,
    },
    password:{
        type:String,
        require:true,
    },
    profileImage:{
        type:String,
        default:"/image/default_image.jpg"
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    }

},{timestamps:true},);

userSchema.pre ("save", function(next){
    const user = this;
   // console.log(user);
    if( !user.isModified("password")){
        return  next();
    } 

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');
    
    user.salt = salt;
    user.password = hashedPassword;

    next();
});

userSchema.static("matchPasswordAndGenerateToken" , async function(email , password){

    const user = await this.findOne({email});
    if(!user ) throw new Error("User not found!");
    
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt).update(password).digest('hex');
    
    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");
    const token = createTokenForUser(user);
    return token;
});



const User = model("user",userSchema);

module.exports = User;

