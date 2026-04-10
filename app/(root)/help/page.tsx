"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Mail, MessageCircle, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the AI Mock Interview work?",
    answer: "Our agent uses advanced conversational AI to stream audio and text in real-time. It analyzes your role, generates technical and behavioral questions contextual to the job description, and engages in a realistic back-and-forth dialogue.",
  },
  {
    question: "Are my interview sessions saved?",
    answer: "Yes! Once an interview concludes, you can navigate to the 'Reports' tab to review your transcripts, feedback, and performance metrics so you can continuously improve.",
  },
  {
    question: "How do I change my account email?",
    answer: "Currently, email addresses are tied closely to your authentication flow and cannot be modified natively. If you lose access, please contact our support team to migrate your data to a new account.",
  },
  {
    question: "Do I need a camera for the mock interviews?",
    answer: "A camera is highly recommended for behavioral feedback, but strictly speaking, our AI primarily processes your audio responses. A working microphone is completely mandatory.",
  },
  {
    question: "The AI agent stopped responding. What do I do?",
    answer: "Ensure your internet connection is stable. Sometimes browsers block microphone permissions midway. Try refreshing the page and ensuring you've granted active microphone permissions in your browser settings.",
  }
];

const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 lg:max-w-4xl">
      <div className="flex flex-col items-center text-center space-y-4 mb-16">
        <div className="p-4 bg-primary-500/20 rounded-full mb-2 border border-primary-500/20">
          <HelpCircle className="w-12 h-12 text-primary-100" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-light-100">
          How can we <span className="text-primary-100">help you?</span>
        </h1>
        <p className="text-light-400 max-w-xl text-lg mt-4">
          Browse through our most frequently asked questions or contact our support team directly. We're here to ensure your interview prep goes flawlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-dark-200/50 p-8 rounded-2xl border border-light-800/10 flex flex-col items-center text-center space-y-4 transition hover:bg-dark-200/70">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
            <Mail size={24} />
          </div>
          <h3 className="text-xl font-bold text-light-100">Email Support</h3>
          <p className="text-light-400 text-sm pb-2">Get personalized help from our team.</p>
          <a href="mailto:support@smartinterview.com" className="text-primary-100 font-medium hover:underline">
            support@smartinterview.com
          </a>
        </div>
        
        <div className="bg-dark-200/50 p-8 rounded-2xl border border-light-800/10 flex flex-col items-center text-center space-y-4 transition hover:bg-dark-200/70">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-light-100">Live Chat</h3>
          <p className="text-light-400 text-sm pb-2">Access instantaneous automated guidance.</p>
          <button className="text-primary-100 font-medium hover:underline pointer-events-none opacity-50">
            Currently Offline
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-light-100">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`border border-light-800/10 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "bg-dark-200 border-primary-500/30" : "bg-dark-200/40 hover:bg-dark-200/60"}`}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className="font-semibold text-light-100 pr-8">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="text-primary-100 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-light-400 flex-shrink-0" />
                  )}
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-light-300 leading-relaxed border-t border-light-800/10 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-16 p-8 bg-gradient-to-r from-primary-600/20 to-transparent border border-primary-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-light-400">Our customer success team will get back to you within 24 hours.</p>
        </div>
        <button className="btn w-full sm:w-auto px-8 whitespace-nowrap" onClick={() => window.location.href = "mailto:support@smartinterview.com"}>
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default HelpPage;
