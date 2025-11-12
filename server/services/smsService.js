const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);


const formatSriLankanNumber = (phone) => {
  let formatted = phone.replace(/[\s-()]/g, '');
  
  if (formatted.startsWith('0')) {
    return `+94${formatted.substring(1)}`;
  }
  
  if (formatted.startsWith('94')) {
    return `+${formatted}`;
  }
  
  if (formatted.startsWith('+94')) {
    return formatted;
  }
  
  if (formatted.length === 9) {
    return `+94${formatted}`;
  }

  console.warn(`[SMS Service] Unknown phone format: ${phone}`);
  return null;
};


const sendSms = async (to, body) => {
  const formattedTo = formatSriLankanNumber(to);

  if (!formattedTo) {
    console.warn(`[SMS Service] Invalid phone number: ${to}. Skipping SMS.`);
    return;
  }

  try {
    const message = await client.messages.create({
      body: body,
      from: twilioPhone, // Your Twilio number
      to: formattedTo    // The formatted recipient number
    });
    console.log(`[SMS Service] Message sent successfully to ${formattedTo} (SID: ${message.sid})`);
  } catch (error) {
    console.error(`[SMS Service] Failed to send SMS to ${formattedTo}:`, error.message);
  }
};

module.exports = { sendSms };