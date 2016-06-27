var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


// send mail with defined transport object
exports.sendEmail = function(to, subject, text, url) {
  // create reusable transporter object using the default SMTP transport
  var tranOption = {
    host: 'localhost',
    port: 25
  };
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"Elevenlibrary" <root@oc8301667465.ibm.com>', // sender address
    to: 'dlzhjj@cn.ibm.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: '', // plaintext body
    html: '<!DOCTYPE html><html><head><title>Your test unsubscribe was successful</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="robots" content="noindex" /><style>  body {    font-family: Arial, Helvetica, sans-serif;  }</style></head><body><h2>'+subject+'</h2><h3>Welcome to ElevenLibrary.</h3><p>'+text+'</p><p>You can click <a href="'+url+'"" target="_blank">here</a> to access.</p><h4>Do not reply: This note has been sent from a service machine.</h4></body></html>' // html body
  };
  console.log(to, subject, text, url);
  mailOptions.to = to;
  mailOptions.subject = subject;
  var transporter = nodemailer.createTransport(smtpTransport(tranOption));
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    };
    console.log('Message sent: ' + info.response);
  });
};
