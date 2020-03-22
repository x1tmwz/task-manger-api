const sgMail = require('@sendgrid/mail');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'x1tmwz@gmail.com',
        subject:'thank for joing in!',
        text:`welcome to the app ${name} let me know how you get along with the app`
    })
}
const sendByeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'x1tmwz@gmail.com',
        subject:'thank you for useing our serveries ',
        text:` ${name} if you can please let me know why you canclle your account `
    })
}
module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}