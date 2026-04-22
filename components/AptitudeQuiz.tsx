"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, ChevronLeft } from 'lucide-react';
import { AptitudeCategory, Question } from '@/constants/aptitude';
import { cn } from '@/lib/utils';

interface AptitudeQuizProps {
  category: AptitudeCategory;
}

const AptitudeQuiz = ({ category }: AptitudeQuizProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const questions = category.questions;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6 fade-in animate-in duration-700">
        <div className="bg-dark-100/60 backdrop-blur-md rounded-2xl p-8 border border-light-800/10 shadow-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-500/10 border border-primary-500/30 mb-4">
            <span className="text-4xl font-bold text-primary-400">{score}/{questions.length}</span>
          </div>
          <h2 className="text-3xl font-bold text-light-900">Quiz Completed!</h2>
          <p className="text-light-400">
            You scored {score} out of {questions.length} in {category.title}. 
            {score === questions.length ? " Perfect score! Great job!" : " Review your answers below to improve."}
          </p>
          <div className="flex gap-4 justify-center mt-8">
             <Button onClick={() => router.push('/aptitude')} className="btn-secondary">
               Back to Categories
             </Button>
             <Button onClick={() => {
               setIsFinished(false);
               setCurrentQuestionIndex(0);
               setSelectedAnswers({});
             }} className="btn-primary">
               <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
             </Button>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <h3 className="text-2xl font-bold text-light-900 px-2">Detailed Review</h3>
          {questions.map((q, idx) => {
            const userAnswer = selectedAnswers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            const isUnanswered = userAnswer === undefined;

            return (
              <div key={q.id} className="bg-dark-100/40 rounded-xl p-6 border border-dark-300 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {isUnanswered ? (
                      <span className="w-6 h-6 rounded-full bg-dark-300 flex items-center justify-center text-xs text-light-500">?</span>
                    ) : isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-light-900">
                      <span className="text-light-500 mr-2">{idx + 1}.</span>{q.question}
                    </h4>
                  </div>
                </div>

                <div className="pl-9 space-y-2">
                  {q.options.map((opt, optIdx) => {
                    let optionClass = "bg-dark-200/50 text-light-500";
                    if (optIdx === q.correctAnswer) {
                       optionClass = "bg-green-500/10 text-green-400 border border-green-500/20";
                    } else if (optIdx === userAnswer && !isCorrect) {
                       optionClass = "bg-red-500/10 text-red-400 border border-red-500/20";
                    }

                    return (
                      <div key={optIdx} className={cn("p-3 rounded-lg text-sm transition-colors", optionClass)}>
                        <span className="mr-3 font-medium opacity-70">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                  <div className="mt-4 p-4 bg-primary-500/5 rounded-lg border border-primary-500/10 text-sm">
                    <span className="font-semibold text-primary-400 block mb-1">Explanation:</span>
                    <span className="text-light-400 leading-relaxed">{q.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz active state
  return (
    <div className="max-w-3xl mx-auto py-10 px-6 h-full flex flex-col">
      {/* Header and Progress */}
      <div className="mb-8 space-y-4">
        <Button variant="ghost" onClick={() => router.push('/aptitude')} className="p-0 hover:bg-transparent text-light-500 hover:text-light-900 mb-2">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-light-900">{category.title}</h1>
            <p className="text-light-500 text-sm mt-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-sm font-medium text-primary-400">
             {Math.round(progressPercentage)}% Completed
          </div>
        </div>
        <div className="w-full bg-dark-300 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-dark-100/60 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-light-800/10 shadow-lg flex-grow flex flex-col slide-in-from-right-8 animate-in fade-in duration-500" key={currentQuestion.id}>
        <h2 className="text-xl md:text-2xl font-medium text-light-900 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-4 flex-grow">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200 group flex items-center group relative overflow-hidden",
                  isSelected 
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-dark-300 bg-dark-200/30 hover:border-light-800/20 hover:bg-dark-200/50"
                )}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-primary-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mr-4 transition-colors z-10",
                  isSelected ? "bg-primary-500 text-white font-bold" : "bg-dark-300 text-light-400 font-medium group-hover:bg-dark-400 group-hover:text-light-300"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={cn("z-10 text-base md:text-lg", isSelected ? "text-primary-100 font-medium" : "text-light-400")}>
                   {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-10 pt-6 border-t border-dark-300 flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={cn("px-6", currentQuestionIndex === 0 ? "opacity-0 pointer-events-none" : "btn-secondary")}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="btn-primary px-8"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            {currentQuestionIndex < questions.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AptitudeQuiz;
