import React from 'react';
import Link from 'next/link';
import { BookOpen, Calculator, BrainCircuit, ArrowRight } from 'lucide-react';
import { aptitudeData } from '@/constants/aptitude';

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-8 h-8 text-blue-500" />,
  Calculator: <Calculator className="w-8 h-8 text-green-500" />,
  BrainCircuit: <BrainCircuit className="w-8 h-8 text-purple-500" />,
};

const AptitudePage = () => {
  const categories = Object.values(aptitudeData);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-10 px-6">
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold text-light-900">
          Aptitude <span className="text-gradient">Preparation</span>
        </h1>
        <p className="text-lg text-light-500 max-w-2xl mx-auto">
          Sharpen your cognitive skills with our specialized practice tests. Choose a category below to start your mock assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {categories.map((category, index) => (
          <Link
            href={`/aptitude/${category.id}`}
            key={category.id}
            className={`group bg-dark-100/60 backdrop-blur-md border border-light-800/10 p-8 rounded-2xl flex flex-col gap-5 hover:border-primary-500/50 hover:shadow-[0_0_30px_-5px_oklch(0.6_0.118_184.704/_0.3)] transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 fill-mode-forwards`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-inner`}>
              {iconMap[category.icon]}
            </div>
            
            <div className="space-y-2 flex-grow">
              <h2 className="text-2xl font-bold text-light-900 group-hover:text-primary-100 transition-colors">
                {category.title}
              </h2>
              <p className="text-light-400 text-sm leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="flex items-center text-primary-500 font-semibold text-sm mt-4 group-hover:gap-3 transition-all duration-300 gap-2">
              Start Practice <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
{/* Premium bottom banner */}
      <div className="mt-12 bg-dark-100/40 border border-dark-300 rounded-2xl p-8 relative overflow-hidden animate-in fade-in duration-1000 delay-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <h3 className="text-xl font-bold text-light-900 mb-2">Track Your Progress</h3>
                <p className="text-light-400 text-sm max-w-md">Complete daily tests to improve your speed and accuracy. Consistent practice is the key to mastering quantitative and reasoning assessments.</p>
            </div>
            <div className="px-6 py-3 bg-primary-500/10 rounded-xl border border-primary-500/20 text-primary-400 font-semibold">
                {categories.reduce((acc, cat) => acc + cat.questions.length, 0)} Total Questions
            </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudePage;
