import React from "react";
import Image from "next/image";

export const metadata = {
  title: "About Us | SmartInterview",
  description: "Learn more about SmartInterview and our mission to help you ace your interviews through AI.",
};

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-6 py-12 md:py-20 lg:max-w-5xl">
      <div className="flex flex-col items-center text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-light-100 mt-8">
          Revolutionizing <span className="text-primary-100">Interview Prep</span>
        </h1>
        <p className="text-light-400 max-w-2xl text-lg mt-4">
          SmartInterview is an AI-powered platform designed to provide realistic, comprehensive mock interviews to help you build confidence, refine your answers, and land your dream job perfectly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 bg-dark-200/50 p-8 rounded-2xl border border-light-800/10 backdrop-blur-sm">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          <p className="text-light-300 leading-relaxed">
            We believe that opportunities should not be missed simply because of interview anxiety or lack of accessible practice. Our mission is to democratize high-quality interview preparation by leveraging cutting-edge Artificial Intelligence.
          </p>
          <p className="text-light-300 leading-relaxed">
            Whether you are a fresh graduate entering the tech industry, or an experienced professional looking to pivot, SmartInterview acts as your personal, unbiased, and tireless 24/7 interview coach.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-primary-400/20 to-primary-100/50 rounded-2xl flex items-center justify-center p-8 border border-primary-500/20">
            {/* Visual representation card */}
            <div className="w-full h-full bg-dark-100/90 rounded-xl shadow-2xl flex flex-col items-center justify-center space-y-4 border border-light-800/5 backdrop-blur-md">
              <Image src="/logo.png" width={80} height={80} alt="SmartInterview" className="opacity-90" />
              <div className="h-2 w-24 bg-light-800/20 rounded-full"></div>
              <div className="h-2 w-32 bg-primary-100/30 rounded-full"></div>
              <div className="h-2 w-16 bg-light-800/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 mb-16">
        <h2 className="text-3xl font-bold text-center text-white">Why Choose Us?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-dark-200/40 border border-light-800/10 rounded-xl space-y-4 hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 bg-primary-500/20 text-primary-100 rounded-lg flex items-center justify-center font-bold text-xl">1</div>
            <h3 className="text-xl font-bold text-light-100">Hyper-Realistic Scenarios</h3>
            <p className="text-light-400 text-sm">
              Our AI is fine-tuned to emulate actual technical and behavioral interviewers, adjusting dynamically to your responses.
            </p>
          </div>
          
          <div className="p-6 bg-dark-200/40 border border-light-800/10 rounded-xl space-y-4 hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 bg-primary-500/20 text-primary-100 rounded-lg flex items-center justify-center font-bold text-xl">2</div>
            <h3 className="text-xl font-bold text-light-100">Instant Actionable Feedback</h3>
            <p className="text-light-400 text-sm">
              Receive comprehensive reports immediately after each session, detailing your strengths and exact areas for improvement.
            </p>
          </div>
          
          <div className="p-6 bg-dark-200/40 border border-light-800/10 rounded-xl space-y-4 hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 bg-primary-500/20 text-primary-100 rounded-lg flex items-center justify-center font-bold text-xl">3</div>
            <h3 className="text-xl font-bold text-light-100">Safe Environment</h3>
            <p className="text-light-400 text-sm">
              Make your mistakes with our AI, not your future employer. Practice as many times as you need without judgment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
