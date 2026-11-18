// src/components/ConsentText.jsx
// The privacy and consent text, laid out for reading. Used on sign-up, the first-time
// screen and the "Privacy and consent" link, so everyone reads exactly the same words.
import { CONSENT_SECTIONS, CONSENT_CONTACT_EMAIL } from '../constants/consent.js';

const ConsentText = () => (
  <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
    {CONSENT_SECTIONS.map((s) => (
      <section key={s.title}>
        <h3 className="font-semibold text-[#0B1739] mb-1">{s.title}</h3>
        {s.body?.map((p) => (
          <p key={p} className="mb-2">{p}</p>
        ))}
        {s.bullets && (
          <ul className="list-disc pl-5 space-y-1">
            {s.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </section>
    ))}
    <section>
      <h3 className="font-semibold text-[#0B1739] mb-1">Questions or requests</h3>
      <p>
        {CONSENT_CONTACT_EMAIL ? (
          <>
            Write to{' '}
            <a className="text-[#1A56DB] underline" href={`mailto:${CONSENT_CONTACT_EMAIL}`}>
              {CONSENT_CONTACT_EMAIL}
            </a>
            , or ask your doctor.
          </>
        ) : (
          'Ask your doctor, who can reach the HyperLink team for you.'
        )}
      </p>
    </section>
  </div>
);

export default ConsentText;
