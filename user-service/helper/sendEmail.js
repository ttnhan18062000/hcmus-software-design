const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'botmailertest@gmail.com',
        pass: 'Botmailer123',
    },
});

const sendMail = (recieveAddress, recieverName, subject, message, otp) => {
    let mailOptions = {
        from: 'botmailertest@gmail.com',
        to: recieveAddress,
        subject: subject,
        html:
            '<p>Dear ' +
            recieverName +
            ',</p>' +
            '<p>' +
            message +
            '.</p>' +
            '<p>Here is your OTP code: </p>' +
            '<b>' +
            otp +
            '</b>' +
            '<p>If you did not make this request, please ignore this email.</p>',
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info);
        }
    });
};

module.exports = sendMail;
