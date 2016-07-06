var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

if (process.env.ADMIN_EMAIL == 'admin2') {
  exports.admin = 'dlzhjj@cn.ibm.com';
} else {
  exports.admin = 'lzishuo@cn.ibm.com';
}
if (process.env.INSTANCE_TYPE == 'dev') {
  exports.eleUrl = 'http://9.115.24.133/elevenlibrary-dev/#/';
} else {
  exports.eleUrl = 'http://9.115.24.133/elevenlibrary/#/';
}

// send mail with defined transport object
exports.sendEmail = function(to, subject, text, url) {
  if (process.env.ENABLE_EMAIL == 'false') {
    console.log("To:", to,"\nSubject:", subject,"\nText:", text,"\nUrl:", url);
    console.error('Message didn\'t sent: ENABLE_EMAIL=false');
  } else {
    // create reusable transporter object using the default SMTP transport
    var tranOption = {
      host: 'localhost',
      port: 25
    };
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"ElevenLibrary" <root@oc8301667465.ibm.com>', // sender address
      to: 'dlzhjj@cn.ibm.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: '', // plaintext body
      html: '<h3>Welcome to ElevenLibrary.</h3><p>' + text + '</p><p>You can click <a href="' + exports.eleUrl + url + '"" target="_blank">here</a> to access.</p><h4>Do not reply: This note has been sent from a service machine.</h4>' // html body
    };
    console.log("To:", to,"\nSubject:", subject,"\nText:", text,"\nUrl:", url);
    if (to) {
      mailOptions.to = to;
    };
    mailOptions.subject = '[ElevenLibrary]' + subject;
    var transporter = nodemailer.createTransport(smtpTransport(tranOption));
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      };
      console.log('Message sent: ' + info.response);
    });
  };
};
