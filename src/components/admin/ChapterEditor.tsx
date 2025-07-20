import { useState, type FC } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  BookOpen
} from 'lucide-react';
import { Chapter, Section } from '../../data/esperantoData';

interface EditingItem {
  type: 'chapter' | 'section';
  data: Chapter | Section | null;
  chapterId?: number;
}

interface ChapterEditorProps {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
  currentUser: string;
  currentEmail: string;
}

const ChapterEditor: FC<ChapterEditorProps> = ({ chapters, onChange, currentUser, currentEmail }) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddChapter = () => {
    setEditingItem({ type: 'chapter', data: null });
    setShowAddModal(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingItem({ type: 'chapter', data: chapter });
    setShowAddModal(true);
  };

  const handleDeleteChapter = (chapterId: number) => {
    if (confirm('Вы уверены, что хотите удалить эту главу? Это действие нельзя отменить.')) {
      const updated = chapters.filter(ch => ch.id !== chapterId);
      onChange(updated);
      console.log(`Chapter ${chapterId} deleted by admin ${currentUser || currentEmail}`);
    }
  };

  const handleSaveChapter = (chapterData: Partial<Chapter>) => {
    if (editingItem?.data) {
      const updated = chapters.map(ch =>
        ch.id === (editingItem!.data as Chapter).id ? { ...ch, ...chapterData } : ch
      );
      onChange(updated);
    } else {
      const newChapter = {
        id: Math.max(...chapters.map(ch => ch.id)) + 1,
        ...chapterData,
        sections: []
      } as Chapter;
      onChange([...chapters, newChapter]);
    }
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleAddSection = (chapterId: number) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      setSelectedChapter(chapter);
      setEditingItem({ type: 'section', data: null, chapterId });
      setShowAddModal(true);
    }
  };

  const handleEditSection = (section: Section, chapterId: number) => {
    setEditingItem({ type: 'section', data: section, chapterId });
    setShowAddModal(true);
  };

  const handleSaveSection = (sectionData: Partial<Section>) => {
    const chapterId = editingItem?.chapterId;
    if (!chapterId) return;

    const updated = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        if (editingItem?.data) {
          return {
            ...chapter,
            sections: chapter.sections.map(section =>
              section.id === (editingItem!.data as Section).id ? { ...section, ...sectionData } : section
            )
          };
        } else {
          const newSection = {
            id: Math.max(...chapter.sections.map(s => s.id), 0) + 1,
            ...sectionData,
            theoryBlocks: [],
            questions: []
          } as Section;
          return {
            ...chapter,
            sections: [...chapter.sections, newSection]
          };
        }
      }
      return chapter;
    });
    onChange(updated);

    setShowAddModal(false);
    setEditingItem(null);
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Главы курса</h3>
            <button
              onClick={handleAddChapter}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск глав..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedChapter?.id === chapter.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedChapter(chapter)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                    <p className="text-sm text-gray-600">{chapter.sections.length} разделов</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChapter(chapter);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedChapter ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h2>
                <p className="text-gray-600">{selectedChapter.description}</p>
              </div>
              <button
                onClick={() => handleAddSection(selectedChapter.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить раздел</span>
              </button>
            </div>

            <div className="space-y-4">
              {selectedChapter.sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-gray-600">{section.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSection(section, selectedChapter.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Удалить этот раздел?')) {
                            const updated = chapters.map(ch =>
                              ch.id === selectedChapter.id
                                ? { ...ch, sections: ch.sections.filter(s => s.id !== section.id) }
                                : ch
                            );
                            onChange(updated);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Теория</div>
                      <div className="text-gray-600">{section.theoryBlocks?.length || 0} блоков</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Вопросы</div>
                      <div className="text-gray-600">{section.questions?.length || 0} вопросов</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900">Время</div>
                      <div className="text-gray-600">{section.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Выберите главу для редактирования</p>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem?.data ? 'Редактировать' : 'Добавить'} {editingItem?.type === 'chapter' ? 'главу' : 'раздел'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());

              if (editingItem?.type === 'chapter') {
                handleSaveChapter(data);
              } else {
                handleSaveSection(data);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={(editingItem?.data as any)?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <textarea
                    name="description"
                    defaultValue={(editingItem?.data as any)?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {editingItem?.type === 'chapter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Сложность</label>
                      <select
                        name="difficulty"
                        defaultValue={(editingItem?.data as any)?.difficulty || 'Легкий'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Легкий">Легкий</option>
                        <option value="Средний">Средний</option>
                        <option value="Сложный">Сложный</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Примерное время изучения</label>
                      <input
                        type="text"
                        name="estimatedTime"
                        defaultValue={(editingItem?.data as any)?.estimatedTime || ''}
                        placeholder="например: 2-3 часа"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </>
                )}

                {editingItem?.type === 'section' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность</label>
                    <input
                      type="text"
                      name="duration"
                      defaultValue={(editingItem?.data as any)?.duration || ''}
                      placeholder="например: 30 мин"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterEditor;
