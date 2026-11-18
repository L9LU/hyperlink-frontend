// src/constants/consent.js
// The privacy and consent text patients agree to.
//
// If you change the wording in a way patients should see again, change CONSENT_VERSION here
// AND CONSENT_VERSION in routes/auth.py on the backend. Everyone is then asked once more.
// Have your hospital's ethics committee or a lawyer read this before real patients use it.

export const CONSENT_VERSION = '2026-11-v1';

// Where patients can write to ask for a copy of their data or for it to be deleted.
// Fill this in with an email you check. Until you do, the text tells them to ask their doctor.
export const CONSENT_CONTACT_EMAIL = 'hyperlinkapp.help@gmail.com';

export const CONSENT_SECTIONS = [
  {
    title: 'What HyperLink is',
    body: [
      'HyperLink lets you record your blood pressure at home and share it with your doctor, so your doctor can notice problems between clinic visits.',
      'You must be 18 or older, or have a parent or guardian agree for you.',
    ],
  },
  {
    title: 'What we keep about you',
    bullets: [
      'Your name, email address and phone number',
      'Your age, height, weight and the health background you enter (family history, exercise, smoking, past blood pressure, medication)',
      'Your blood pressure readings and when you took them',
      'The language you choose, and a risk estimate worked out from your details',
      'Which doctor you have accepted, and when you agreed to these terms',
    ],
  },
  {
    title: 'Who can see it',
    bullets: [
      'Only a doctor you accept in the app can see your readings and profile. You can disconnect from them at any time and they lose access straight away.',
      'Our service providers handle it for us. Google stores your data, Render runs the app, and Twilio sends text and WhatsApp messages, so it sees your phone number and the message.',
      'The HyperLink team can open stored data when needed to run and fix the service.',
      'We do not sell your information and we do not show advertisements.',
    ],
  },
  {
    title: 'Reminders and alerts',
    body: [
      'We may send you reminders to log your blood pressure by text or WhatsApp.',
      'If a reading looks dangerous, your doctor may get a text or WhatsApp message about it.',
    ],
  },
  {
    title: 'This is not an emergency service',
    body: [
      'Nobody watches HyperLink all day and night, and an alert may reach your doctor late or not at all.',
      'If you feel very unwell, for example with a severe headache, chest pain, trouble speaking or seeing, or weakness on one side, call 112 or go to the nearest hospital. Do not wait for the app.',
    ],
  },
  {
    title: 'It does not replace your doctor',
    body: [
      'HyperLink does not diagnose anything. The risk estimate is only a guide and has not been clinically validated. Your doctor makes every decision about your care. Do not change your medicine because of the app.',
    ],
  },
  {
    title: 'Keeping it safe',
    body: [
      'Your password is stored in scrambled form, so even we cannot read it. No system is perfectly secure, so keep your password private and sign out on phones you share.',
      'We aim to handle your information in line with the Nigeria Data Protection Act 2023.',
    ],
  },
  {
    title: 'Your choices',
    bullets: [
      'You can change your language, and disconnect from your doctor, at any time in the app.',
      'You can ask for a copy of your information, or for your account and readings to be deleted.',
      'Stopping or withdrawing does not affect the care you get from your hospital.',
    ],
  },
  {
    title: 'If you join a hospital pilot',
    body: [
      'If HyperLink is being tested at your hospital, results may be reported to the hospital and in studies only as combined numbers, never with your name.',
    ],
  },
];
