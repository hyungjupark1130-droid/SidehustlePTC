import Link from 'next/link';

export function ContactSection() {
  return (
    <section
      id="contact"
      className="px-6 md:px-12 py-32 border-t border-black bg-black text-white"
      aria-labelledby="contact-heading"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2
            id="contact-heading"
            className="font-display font-black leading-none mb-8"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
          >
            Contact
          </h2>
          <address className="font-body font-light text-base not-italic leading-relaxed">
            Side Hustle<br />
            123 Artist Way<br />
            London, E1 6AN<br />
            United Kingdom
          </address>
        </div>
        
        <div className="flex flex-col gap-8 md:mt-auto">
          <div>
            <h3 className="font-body font-light text-xs tracking-widest uppercase mb-2 opacity-50">
              General Enquiries
            </h3>
            <a
              href="mailto:info@sidehustle.art"
              className="font-body font-light text-lg hover:underline underline-offset-4"
            >
              info@sidehustle.art
            </a>
          </div>
          <div>
            <h3 className="font-body font-light text-xs tracking-widest uppercase mb-2 opacity-50">
              Social
            </h3>
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href="https://www.instagram.com/sidehustle_practice/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-light text-lg hover:underline underline-offset-4"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-32 flex flex-col sm:flex-row justify-between items-baseline gap-4 font-body font-light text-xs tracking-widest uppercase opacity-50">
        <p>&copy; {new Date().getFullYear()} Side Hustle. All rights reserved.</p>
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
      </div>
    </section>
  );
}
