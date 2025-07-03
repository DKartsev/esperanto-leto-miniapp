import React, { useState } from 'react';
import { Download, FileText, Database, Search, BarChart3 } from 'lucide-react';
import { 
  extractCourseData, 
  exportToJSON, 
  exportQuestionsToCSV, 
  generateCourseReport,
  validateCourseData,
  createSearchIndex
} from '../utils/dataExtractor';
import esperantoData from '../data/esperantoData';

const DataExporter: React.FC = () => {
  const [exportType, setExportType] = useState<'json' | 'csv' | 'report' | 'search'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportType) {
        case 'json':
          content = exportToJSON(extractCourseData(esperantoData));
          filename = 'esperanto-course-data.json';
          mimeType = 'application/json';
          break;
          
        case 'csv':
          content = exportQuestionsToCSV(esperantoData);
          filename = 'esperanto-questions.csv';
          mimeType = 'text/csv';
          break;
          
        case 'report':
          content = generateCourseReport(esperantoData);
          filename = 'esperanto-course-report.md';
          mimeType = 'text/markdown';
          break;
          
        case 'search':
          content = exportToJSON(createSearchIndex(esperantoData));
          filename = 'esperanto-search-index.json';
          mimeType = 'application/json';
          break;
      }

      // Создаем и скачиваем файл
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const validation = validateCourseData(esperantoData);
  const courseData = extractCourseData(esperantoData);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-emerald-900">Экспорт данных курса</h2>
          <p className="text-emerald-700 text-sm">Извлечение и экспорт структурированных данных</p>
        </div>
      </div>

      {/* Статистика курса */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{courseData.chapters.length}</div>
          <div className="text-sm text-emerald-700">Глав</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{courseData.totalQuestions}</div>
          <div className="text-sm text-green-700">Вопросов</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{courseData.totalTheoryBlocks}</div>
          <div className="text-sm text-blue-700">Теор. блоков</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{courseData.estimatedTotalTime}</div>
          <div className="text-sm text-purple-700">Время</div>
        </div>
      </div>

      {/* Распределение по сложности */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">Распределение вопросов по сложности</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">{courseData.difficultyDistribution.easy}</div>
            <div className="text-sm text-green-700">Легкие</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-600">{courseData.difficultyDistribution.medium}</div>
            <div className="text-sm text-yellow-700">Средние</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{courseData.difficultyDistribution.hard}</div>
            <div className="text-sm text-red-700">Сложные</div>
          </div>
        </div>
      </div>

      {/* Валидация данных */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">Валидация данных</h3>
        <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${validation.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-semibold ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
              {validation.isValid ? 'Данные валидны' : 'Обнаружены ошибки'}
            </span>
          </div>
          
          {validation.errors.length > 0 && (
            <div className="mb-2">
              <div className="text-sm font-medium text-red-800 mb-1">Ошибки:</div>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.slice(0, 3).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {validation.errors.length > 3 && (
                  <li>• ... и еще {validation.errors.length - 3} ошибок</li>
                )}
              </ul>
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div>
              <div className="text-sm font-medium text-yellow-800 mb-1">Предупреждения: {validation.warnings.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Выбор типа экспорта */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">Тип экспорта</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setExportType('json')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              exportType === 'json' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-900">JSON данные</div>
                <div className="text-sm text-emerald-700">Полная структура курса</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportType('csv')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              exportType === 'csv' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-900">CSV вопросы</div>
                <div className="text-sm text-emerald-700">Таблица всех вопросов</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportType('report')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              exportType === 'report' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-900">Отчет курса</div>
                <div className="text-sm text-emerald-700">Markdown отчет</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setExportType('search')}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              exportType === 'search' 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-900">Индекс поиска</div>
                <div className="text-sm text-emerald-700">JSON для поиска</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Кнопка экспорта */}
      <button
        onClick={handleExport}
        disabled={isExporting || !validation.isValid}
        className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
          isExporting || !validation.isValid
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transform hover:scale-105'
        }`}
      >
        <Download className="w-5 h-5" />
        <span>
          {isExporting ? 'Экспортируется...' : `Экспортировать ${exportType.toUpperCase()}`}
        </span>
      </button>

      {!validation.isValid && (
        <p className="text-sm text-red-600 mt-2 text-center">
          Исправьте ошибки валидации перед экспортом
        </p>
      )}
    </div>
  );
};

export default DataExporter;