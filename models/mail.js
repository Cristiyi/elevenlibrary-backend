var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


// send mail with defined transport object
exports.sendEmail = function(to, subject, text) {
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
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Do not reply: This note has been sent from a service machine.</b>' // html body
  };
  console.log(to, subject, text);
  mailOptions.to = to;
  mailOptions.subject = subject;
  mailOptions.text = text;
  var transporter = nodemailer.createTransport(smtpTransport(tranOption));
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    };
    console.log('Message sent: ' + info.response);
  });
};
