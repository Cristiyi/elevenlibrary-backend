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
    html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Your test unsubscribe was successful</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="robots" content="noindex" /><style>    body { background: #F2F2F2; padding-top: 65px; text-align: center; font-family: Arial, Helvetica, sans-serif; text-align: center; }    a, a:hover { color: #185787; }    p { margin: 0; padding: 0 0 18px 0; font-size: 12px; color: #666; line-height: 18px; }    .clear { clear: both; }    .container { width: 580px; background: #FFF; position: relative; margin: 0 auto; padding: 0; }    .container img { float: left; }    .footer { color: #797c80; font-size: 12px; border-left: 1px solid #DDD; border-right: 1px solid #DDD; padding-top: 3px; padding-left: 39px; padding-right: 13px; padding-bottom: 1px; text-align: left; }    .iframe { border: 1px solid #ccc; position: relative; margin: 0 auto; width: 800px; height: 500px; }    .title { padding-top: 34px; padding-left: 39px; padding-right: 39px; text-align: left; border-left: 1px solid #DDD; border-right: 1px solid #DDD; }    .title h2 { font-size: 30px; color: #262626; font-weight: normal; margin: 0 0 13px 0; padding: 0; letter-spacing: 0; }    .title h3 { font-size: 17px; font-weight: normal; margin-bottom: 19px; }    .title h6 { margin-top: 0; }</style></head><body><div class="container"><img src="http://img.createsend1.com/img/misc/confirmations/top.gif" width="580" height="8" /><div class="clear"></div><div class="title"><h2>'+subject+'</h2><h3>Welcome to ElevenLibrary.</h3><p>'+text+'</p><p>You can click<a href="'+url+'"" target="_blank">here</a> to access.</p><h6>Do not reply: This note has been sent from a service machine.</h6></div><div class="footer">&nbsp;</div><img src="http://img.createsend1.com/img/misc/confirmations/bottom.gif" width="580" height="8" /><div class="clear"></div></div></body></html>' // html body
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
