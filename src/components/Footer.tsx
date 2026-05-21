export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-accent-pink to-accent-cyan bg-clip-text text-transparent">
                Chiral
              </span>
              <span className="text-xl font-bold text-text-primary">
                Downloads
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              The worlds most trusted source for definitely-not-malware
              entertainment. Probably.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { label: "Discord", path: "M23 9.71a8.5 8.5 0 00-.91-4.13 2.31 2.31 0 00-1.05-1.05C19.47 3.46 12 3.5 12 3.5s-7.47-.04-9.04 1.03A2.31 2.31 0 001.91 5.58 8.5 8.5 0 001 9.71a49.83 49.83 0 00.22 4.73 8.5 8.5 0 00.91 4.13 2.54 2.54 0 001.2 1.13c1.57 1.07 9.67 1.03 9.67 1.03s7.47.04 9.04-1.03a2.54 2.54 0 001.2-1.13 8.5 8.5 0 00.91-4.13 49.83 49.83 0 00.22-4.73zM9.42 15.44l-3.6-5.22 2.48-.02L10.65 13l2.35-2.78 2.48-.02-3.6 5.22-1.29 1.53-1.17-1.49z" },
                { label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                { label: "GitHub", path: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
                  aria-label={social.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Quick Links",
              links: ["Browse", "Top Rated", "New Releases", "Safety Report"],
            },
            {
              title: "Safety",
              links: ["VirusTotal", "SHA Verification", "Privacy Policy", "Terms of Service"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Blog", "Contact Dave"],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-text-primary text-sm font-semibold mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-text-secondary text-sm hover:text-accent-cyan transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-xs">
            &copy; {new Date().getFullYear()} Chiral Downloads. All rights
            reserved. No viruses were harmed in the making of this website.
          </p>
          <p className="text-text-secondary text-xs">
            Made with ❤️ and questionable life choices
          </p>
        </div>
      </div>
    </footer>
  );
}
