import { useState, type FC } from 'react';
import { Play, Clock, Book, ChevronDown } from 'lucide-react';
import CheckmarkIcon from './CheckmarkIcon';

interface Section {
  id: number;
  title: string;
  progress: number;
  duration: string;
  isCompleted: boolean;
  theory?: {
    title: string;
    content: string;
    examples: string[];
    keyTerms: string[];
  };
}

interface SectionsListProps {
  chapterId: number;
  onSectionSelect: (sectionId: number) => void;
  onBackToChapters: () => void;
}

const SectionsList: FC<SectionsListProps> = ({ chapterId, onSectionSelect, onBackToChapters }) => {
  const [expandedTheory, setExpandedTheory] = useState<number | null>(null);

  // Define sections for different chapters
  const getSectionsForChapter = (chapterId: number): Section[] => {
    switch (chapterId) {
      case 1: // Основы эсперанто
        return [
          { 
            id: 1, 
            title: "Базовая лексика", 
            progress: 0, 
            duration: "20 мин", 
            isCompleted: false,
            theory: {
              title: "Основы словарного запаса эсперанто",
              content: "Словарь эсперанто построен на интернациональных корнях, знакомых носителям европейских языков. Каждое слово имеет постоянное значение и произношение. Изучение базовой лексики начинается с самых употребительных слов повседневного общения: приветствий, благодарностей, названий предметов быта.",
              examples: [
                "saluton (привет) — универсальное приветствие",
                "dankon (спасибо) — выражение благодарности", 
                "domo (дом) — место жительства",
                "amiko (друг) — близкий человек"
              ],
              keyTerms: ["базовая лексика", "интернациональные корни", "повседневное общение", "постоянное значение"]
            }
          },
          { 
            id: 2, 
            title: "Произношение и алфавит", 
            progress: 0, 
            duration: "25 мин", 
            isCompleted: false,
            theory: {
              title: "Фонетическая система эсперанто",
              content: "Алфавит эсперанто состоит из 28 букв: 23 латинские буквы плюс 5 букв с диакритическими знаками. Каждая буква имеет только одно произношение во всех позициях. Ударение всегда падает на предпоследний слог без исключений. Это делает чтение и произношение предсказуемыми.",
              examples: [
                "ĉ = ч (ĉokolado — шоколад)",
                "ĝ = дж (ĝardeno — сад)", 
                "SA-lu-ton (привет) — ударение на SA",
                "es-pe-RAN-to — ударение на RAN"
              ],
              keyTerms: ["28 букв", "диакритические знаки", "одно произношение", "предпоследний слог", "без исключений"]
            }
          },
          { 
            id: 3, 
            title: "Артикли и существительные", 
            progress: 0, 
            duration: "30 мин", 
            isCompleted: false,
            theory: {
              title: "Система артиклей и существительных",
              content: "В эсперанто есть только один артикль — определенный артикль 'la', который не изменяется. Все существительные оканчиваются на -o в единственном числе. Множественное число образуется добавлением -j. Неопределенного артикля нет — его отсутствие указывает на неопределенность.",
              examples: [
                "la domo (дом) — конкретный дом",
                "domo (дом) — любой дом",
                "libro → libroj (книга → книги)",
                "hundo → hundoj (собака → собаки)"
              ],
              keyTerms: ["артикль la", "окончание -o", "множественное число -j", "определенность", "неопределенность"]
            }
          },
          { 
            id: 4, 
            title: "Местоимения", 
            progress: 0, 
            duration: "25 мин", 
            isCompleted: false,
            theory: {
              title: "Система местоимений",
              content: "Личные местоимения в эсперанто просты и логичны: mi (я), vi (ты/вы), li (он), ŝi (она), ĝi (оно), ni (мы), ili (они). Притяжательные местоимения образуются добавлением окончания -a. Они согласуются с определяемым словом в числе.",
              examples: [
                "Mi estas studento. (Я студент.)",
                "mia libro (моя книга) → miaj libroj (мои книги)",
                "via domo (твой дом), lia kato (его кошка)",
                "ŝia amiko (её друг), nia lernejo (наша школа)"
              ],
              keyTerms: ["личные местоимения", "притяжательные", "окончание -a", "согласование", "число"]
            }
          },
          { 
            id: 5, 
            title: "Простые фразы", 
            progress: 0, 
            duration: "35 мин", 
            isCompleted: false,
            theory: {
              title: "Базовые фразы общения",
              content: "Простые фразы эсперанто позволяют начать общение с первых дней изучения. Они включают приветствия, благодарности, извинения и базовые вопросы. Структура предложений: подлежащее + сказуемое + дополнение. Порядок слов гибкий, но эта схема наиболее естественна.",
              examples: [
                "Saluton! Kiel vi fartas? (Привет! Как дела?)",
                "Dankon pro via helpo. (Спасибо за помощь.)",
                "Mi ne komprenas. (Я не понимаю.)",
                "Ĝis revido! (До свидания!)"
              ],
              keyTerms: ["базовые фразы", "структура предложения", "вежливое общение", "гибкий порядок слов"]
            }
          }
        ];
      case 2: // Основные глаголы и действия
        return [
          { 
            id: 1, 
            title: "Глагол 'esti' (быть)", 
            progress: 0, 
            duration: "20 мин", 
            isCompleted: false,
            theory: {
              title: "Глагол-связка 'esti'",
              content: "Глагол 'esti' (быть) — самый важный глагол в эсперанто. Он связывает подлежащее с именной частью сказуемого. Формы: estas (настоящее), estis (прошедшее), estos (будущее). Используется для описания состояния, профессии, местонахождения.",
              examples: [
                "Mi estas studento. (Я студент.)",
                "La vetero estis bela. (Погода была красивая.)",
                "Vi estos feliĉa. (Вы будете счастливы.)"
              ],
              keyTerms: ["esti", "связка", "состояние", "времена"]
            }
          },
          { 
            id: 2, 
            title: "Глаголы движения", 
            progress: 0, 
            duration: "25 мин", 
            isCompleted: false,
            theory: {
              title: "Выражение движения",
              content: "Основные глаголы движения: iri (идти), veni (приходить), kuri (бежать), flugi (лететь). Направление показывается предлогами: al (к), de (от), tra (через). Винительный падеж указывает направление движения.",
              examples: [
                "Mi iras al la butiko. (Я иду в магазин.)",
                "Li venas de la lernejo. (Он идет из школы.)",
                "Ni kuras tra la parko. (Мы бежим через парк.)"
              ],
              keyTerms: ["движение", "направление", "предлоги", "iri", "veni"]
            }
          },
          { 
            id: 3, 
            title: "Глаголы действия", 
            progress: 0, 
            duration: "30 мин", 
            isCompleted: false,
            theory: {
              title: "Выражение действий",
              content: "Основные глаголы действия: fari (делать), doni (давать), preni (брать), meti (класть), teni (держать). Эти глаголы часто требуют прямого дополнения в винительном падеже (-n).",
              examples: [
                "Mi faras la laboron. (Я делаю работу.)",
                "Ŝi donas al mi libron. (Она дает мне книгу.)",
                "Li prenas la tason. (Он берет чашку.)"
              ],
              keyTerms: ["действие", "fari", "doni", "прямое дополнение"]
            }
          },
          { 
            id: 4, 
            title: "Времена глаголов", 
            progress: 0, 
            duration: "35 мин", 
            isCompleted: false,
            theory: {
              title: "Система времен",
              content: "В эсперанто три основных времени: настоящее (-as), прошедшее (-is), будущее (-os). Есть также условное наклонение (-us) и повелительное (-u). Все лица имеют одинаковые окончания.",
              examples: [
                "Mi lernas (учу), mi lernis (учил), mi lernos (буду учить)",
                "Se mi havus tempon, mi lernos. (Если бы у меня было время, я бы учился.)",
                "Lernu esperanton! (Учите эсперанто!)"
              ],
              keyTerms: ["времена", "наклонения", "окончания", "спряжение"]
            }
          },
          { 
            id: 5, 
            title: "Модальные глаголы", 
            progress: 0, 
            duration: "25 мин", 
            isCompleted: false,
            theory: {
              title: "Выражение возможности и необходимости",
              content: "Модальные глаголы выражают отношение к действию: povi (мочь), devi (должен), voli (хотеть), ŝati (нравиться). Они управляют инфинитивом другого глагола.",
              examples: [
                "Mi povas paroli esperante. (Я могу говорить на эсперанто.)",
                "Vi devas lerni. (Вы должны учиться.)",
                "Ŝi volas veni. (Она хочет прийти.)"
              ],
              keyTerms: ["модальность", "povi", "devi", "voli", "инфинитив"]
            }
          },
          { 
            id: 6, 
            title: "Практика спряжения", 
            progress: 0, 
            duration: "40 мин", 
            isCompleted: false,
            theory: {
              title: "Закрепление глагольных форм",
              content: "Практика спряжения включает все изученные глаголы и времена. Важно автоматизировать использование правильных окончаний. Упражнения включают трансформации, подстановки, перевод.",
              examples: [
                "lerni → mi lernas, vi lernis, li lernos",
                "Трансформация: 'Я читаю' → 'Я читал' → 'Я буду читать'",
                "Диалог с разными временами"
              ],
              keyTerms: ["спряжение", "автоматизация", "трансформация", "практика"]
            }
          }
        ];
      default:
        return [
          { 
            id: 1, 
            title: "Раздел 1", 
            progress: 0, 
            duration: "20 мин", 
            isCompleted: false,
            theory: {
              title: "Теоретические основы",
              content: "Этот раздел содержит основные теоретические сведения по теме. Изучите материал внимательно, так как он понадобится для выполнения практических заданий.",
              examples: ["Пример 1", "Пример 2"],
              keyTerms: ["термин 1", "термин 2"]
            }
          },
          { 
            id: 2, 
            title: "Раздел 2", 
            progress: 0, 
            duration: "25 мин", 
            isCompleted: false,
            theory: {
              title: "Дополнительный материал",
              content: "Дополнительные сведения и углубленное изучение темы. Практические примеры и упражнения для закрепления материала.",
              examples: ["Пример 3", "Пример 4"],
              keyTerms: ["термин 3", "термин 4"]
            }
          },
          { 
            id: 3, 
            title: "Раздел 3", 
            progress: 0, 
            duration: "30 мин", 
            isCompleted: false,
            theory: {
              title: "Практическое применение",
              content: "Применение изученного материала на практике. Решение задач и выполнение упражнений различной сложности.",
              examples: ["Пример 5", "Пример 6"],
              keyTerms: ["термин 5", "термин 6"]
            }
          },
          { 
            id: 4, 
            title: "Раздел 4", 
            progress: 0, 
            duration: "35 мин", 
            isCompleted: false,
            theory: {
              title: "Заключительный материал",
              content: "Обобщение изученного материала и подготовка к контрольным вопросам. Повторение ключевых концепций.",
              examples: ["Пример 7", "Пример 8"],
              keyTerms: ["термин 7", "термин 8"]
            }
          }
        ];
    }
  };

  const sections = getSectionsForChapter(chapterId);

  const getChapterTitle = (chapterId: number): string => {
    switch (chapterId) {
      case 1: return "Основы эсперанто";
      case 2: return "Основные глаголы и действия";
      case 3: return "Грамматика";
      case 4: return "Словарный запас";
      case 5: return "Произношение";
      case 6: return "Диалоги";
      case 7: return "Культура";
      case 8: return "Литература";
      case 9: return "История языка";
      case 10: return "Практические упражнения";
      case 11: return "Итоговый тест";
      default: return `Глава ${chapterId}`;
    }
  };

  const toggleTheory = (sectionId: number) => {
    setExpandedTheory(expandedTheory === sectionId ? null : sectionId);
  };

  const chapterTitle = getChapterTitle(chapterId);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4 mb-6">
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

      <div className="grid gap-4">
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
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => onSectionSelect(section.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Play className="w-5 h-5" />
                <span>Начать изучение</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-6 mt-8">
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
