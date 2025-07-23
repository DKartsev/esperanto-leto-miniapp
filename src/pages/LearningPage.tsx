import ChaptersAndSections from '../components/ChaptersAndSections';
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
    earnedAchievements,
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
    case 'sections':
      return (
        <ChaptersAndSections
          onSectionSelect={(chId, secId) => {
            handleChapterSelect(chId);
            handleSectionSelect(secId);
          }}
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
          newAchievements={earnedAchievements}
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
