import React from "react";

const ContactPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#19c2ff] via-[#bff7c5] to-[#e6f7ff] p-4 md:p-10">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-[8px] rounded-[2.5rem] shadow-2xl border border-[#e0e7ef] p-6 md:p-14 flex flex-col gap-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-6xl font-extrabold text-sparkle-blue text-center tracking-tight mb-2 drop-shadow">Let&apos;s Connect</h1>
          <p className="text-lg md:text-xl text-gray-700 text-center font-medium mb-2">
            Have a question, want to book, or just want to say hi?
            <br className="hidden md:block" />
            We&apos;d love to hear from you!
          </p>
        </div>

        <form className="flex flex-col gap-6 bg-white/90 rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="flex-1 p-4 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue text-base shadow-sm"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="flex-1 p-4 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue text-base shadow-sm"
            />
          </div>
          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-4 rounded-xl bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue text-base shadow-sm"
          />
          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-sparkle-blue via-[#bff7c5] to-[#0ea5ff] text-white font-bold rounded-full shadow-xl hover:scale-105 transition-all text-lg mt-2 tracking-wide"
          >
            Send Message
          </button>
        </form>

        <div className="flex flex-col items-center gap-3 mt-2">
          <span className="text-gray-600 font-semibold text-base">Which areas do you service?</span>
          <a href="tel:876-471-6676" className="text-2xl font-extrabold text-sparkle-blue hover:underline tracking-wide">876-471-6676</a>
          <a href="mailto:sparklesautospa01@gmail.com" className="text-lg text-sparkle-blue hover:underline font-semibold">sparklesautospa01@gmail.com</a>
          <div className="flex gap-4 mt-2">
            <a
              href="https://wa.me/18764716676"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform bg-white rounded-full p-2 shadow-md border border-green-200"
              title="WhatsApp"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path fill="#25D366" d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.62-6.002C.122 5.281 5.403 0 12.057 0c3.17 0 6.154 1.233 8.4 3.48a11.82 11.82 0 013.5 8.4c-.003 6.654-5.284 11.935-11.94 11.935a11.9 11.9 0 01-6.003-1.62L.057 24z"/>
                <path fill="#FFF" d="M17.472 14.382c-.297-.149-1.758-.867-2.029-.967-.273-.101-.471-.149-.67.149-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.297.298-.495.099-.198.05-.371-.025-.52-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.371s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;