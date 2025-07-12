import React, { useState } from 'react';
import { Play, Clock, Book, ChevronDown, ChevronUp } from 'lucide-react';
import CheckmarkIcon from './CheckmarkIcon';
import useEsperantoData from '../hooks/useEsperantoData';

interface Section {
  id: number;
  title: string;
  description: string;
  progress: number;
  duration: string;
  isCompleted: boolean;
  isLocked?: boolean;
  theory?: {
    title: string;
    content: string;
    examples: string[];
    keyTerms: string[];
  };
  questionsCount?: number;
}

interface SectionsListProps {
  chapterId: number;
  onSectionSelect: (sectionId: number) => void;
  onBackToChapters: () => void;
}

const SectionsList: React.FC<SectionsListProps> = ({ chapterId, onSectionSelect, onBackToChapters }) => {
  const [expandedTheory, setExpandedTheory] = useState<number | null>(null);
  const { getChapter } = useEsperantoData();

  const chapter = getChapter(chapterId);
  const sections = chapter?.sections || [];
  const chapterTitle = chapter?.title || `Глава ${chapterId}`;

  const toggleTheory = (sectionId: number) => {
    setExpandedTheory(expandedTheory === sectionId ? null : sectionId);
  };


  return (
    <div className="p-6 space-y-4 container-centered w-full">
      <div className="flex items-center space-x-4 mb-6 w-full">
        <button
          onClick={onBackToChapters}
          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">{chapterTitle}</h1>
          <p className="text-emerald-700">Изучите теорию, затем выберите раздел для практики</p>
        </div>
      </div>

      <div className="grid gap-4 w-full">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-gradient-to-r from-emerald-50 to-green-100 border border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Theory Block */}
            {section.theory && (
              <div className="border-b border-emerald-200">
                <button
                  onClick={() => toggleTheory(section.id)}
                  className="w-full p-5 text-left hover:bg-emerald-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Book className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">Теория</h3>
                        <p className="text-sm text-emerald-600">{section.theory.title}</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-200 ${
                      expandedTheory === section.id ? 'rotate-180' : ''
                    }`}>
                      <ChevronDown className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </button>

                {expandedTheory === section.id && (
                  <div className="px-5 pb-5">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-emerald-800 mb-4 leading-relaxed">
                        {section.theory.content}
                      </p>
                      
                      {/* Examples */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-emerald-900 mb-2">Примеры:</h4>
                        <div className="space-y-1">
                          {section.theory.examples.map((example, index) => (
                            <div key={index} className="text-sm text-emerald-700 font-mono bg-white px-3 py-2 rounded border">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Terms */}
                      <div>
                        <h4 className="font-semibold text-emerald-900 mb-2">Ключевые термины:</h4>
                        <div className="flex flex-wrap gap-2">
                          {section.theory.keyTerms.map((term, index) => (
                            <span key={index} className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {section.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">{section.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-emerald-700">
                      <Clock className="w-4 h-4" />
                      <span>{section.duration}</span>
                    </div>
                  </div>
                </div>
                
                {section.isCompleted && (
                  <CheckmarkIcon size={28} animated={true} />
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-emerald-700">Прогресс</span>
                  <span className="text-sm font-semibold text-emerald-600">{section.progress}%</span>
                </div>
                <div className="progress-track progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => onSectionSelect(section.id)}
                className="start-button w-full flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Начать изучение</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-6 mt-8 w-full">
        <div className="flex items-center space-x-2 mb-3">
          <Book className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Рекомендации по изучению</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Сначала изучите теорию каждого раздела, затем переходите к практическим вопросам</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Обращайте внимание на примеры — они помогут понять применение правил</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Запоминайте ключевые термины — они встретятся в вопросах</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Проходите разделы последовательно для лучшего понимания материала</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionsList;

