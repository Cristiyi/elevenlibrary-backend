var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using the default SMTP transport
var tranOption = {
  host: 'localhost',
  port: 25
};

var transporter = nodemailer.createTransport(smtpTransport(option));

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Elevenlibrary Admin" <root@oc8301667465.ibm.com>', // sender address
    to: 'dlzhjj@cn.ibm.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
