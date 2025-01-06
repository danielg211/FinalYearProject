const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY); // Load from .env file

const sendPostLessonEmail = async (req, res) => {
  const { golferEmail, lessonDetails, pgaProfessionalName } = req.body;

  try {
    const emailResponse = await resend.emails.send({
      from: 'pga-pro@example.com', // Replace with a verified sender email
      to: golferEmail,
      subject: `Post-Lesson Report from ${pgaProfessionalName}`,
      html: `
        <h1>Post-Lesson Report</h1>
        <p>Hi,</p>
        <p>Here is your post-lesson report:</p>
        <p>${lessonDetails}</p>
        <p>Thank you!</p>
      `,
    });

    console.log('Email sent successfully:', emailResponse);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

module.exports = { sendPostLessonEmail };
