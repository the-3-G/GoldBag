import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendContactEmail } from "../services/authService";
import { Mail, MessageSquare, Send, User, ChevronLeft } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", title: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await sendContactEmail(formData.name, formData.email, formData.title, formData.message);
      setStatus("success");
      setFormData({ name: "", email: "", title: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-white to-[#edf2f7] text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <Link to="/" className="inline-flex items-center text-cyan-600 hover:text-cyan-500 mb-6 transition-colors">
          <ChevronLeft size={20} className="mr-1" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 mb-4 border border-cyan-100">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Contact Us</h2>
          <p className="text-slate-500 mt-2">We'd love to hear from you. Send us a message!</p>
        </div>

        {status === "success" ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p>Thank you for reaching out. We will get back to you as soon as possible.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 px-6 py-2 bg-emerald-100 hover:bg-emerald-200 transition-colors rounded-lg font-semibold text-emerald-800"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-400 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Subject / Title</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Message</label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-400 resize-none text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {status === "loading" ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} /> Send Message
                </>
              )}
            </button>
          </form>
        )}
        <p className="text-center text-slate-500 text-sm mt-6">
          Or email us directly at{" "}
          <a href="mailto:Alphagoldprotrading@gmail.com" className="text-cyan-600 hover:underline">
            Alphagoldprotrading@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
