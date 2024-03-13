const nodemailer=require('nodemailer');

const sendEmail=async(option)=>{
   
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'jake.mayert@ethereal.email',
            pass: 'Wd9kktWb3fZ2K19T1F'
        }
    });

    const mailoption={
        from:'jake.mayert@ethereal.email',
        to:option.email,
        subject:option.subject,
        text:option.message
    }

    await transporter.sendMail(mailoption);
        
}

module.exports=sendEmail;