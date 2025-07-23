import ChaptersList from '../components/ChaptersList';
import SectionsList from '../components/SectionsList';
import QuestionInterface from '../components/QuestionInterface';
import SectionComplete from '../components/SectionComplete';
import ChapterComplete from '../components/ChapterComplete';
import { useLearningNavigation } from '../hooks/useLearningNavigation';

const LearningPage = () => {
  const {
    currentView,
    selectedChapter,
    selectedSection,
    sectionResults,
    profile,
    handleChapterSelect,
    handleSectionSelect,
    handleQuestionComplete,
    handleNextChapter,
    handleBackToChapters,
    handleBackToSections,
    handleRetrySection,
    handleNextStep
  } = useLearningNavigation();

  switch (currentView) {
    case 'chapters':
      return (
        <ChaptersList
          onChapterSelect={handleChapterSelect}
          currentUser={profile?.username}
        />
      );
    case 'sections':
      return (
        <SectionsList
          chapterId={selectedChapter!}
          onSectionSelect={handleSectionSelect}
          onBackToChapters={handleBackToChapters}
        />
      );
    case 'questions':
      return (
        <QuestionInterface
          chapterId={selectedChapter!}
          sectionId={selectedSection!}
          onComplete={handleQuestionComplete}
          onBackToSections={handleBackToSections}
        />
      );
    case 'section-complete':
      return (
        <SectionComplete
          results={sectionResults!}
          chapterId={selectedChapter!}
          sectionId={selectedSection!}
          onRetry={handleRetrySection}
          onNext={handleNextStep}
        />
      );
    case 'chapter-complete':
      return (
        <ChapterComplete
          chapterId={selectedChapter!}
          onNextChapter={handleNextChapter}
          onBackToChapters={handleBackToChapters}
        />
      );
    default:
      return <p className="text-center text-gray-400">Контент загружается...</p>;
  }
};

export default LearningPage;
