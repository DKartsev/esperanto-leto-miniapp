export function getChapterTitle(id: number): string {
  switch (id) {
    case 1:
      return 'Основы эсперанто';
    case 2:
      return 'Основные глаголы и действия';
    case 3:
      return 'Грамматика';
    case 4:
      return 'Словарный запас';
    case 5:
      return 'Произношение';
    case 6:
      return 'Диалоги';
    case 7:
      return 'Культура';
    case 8:
      return 'Литература';
    case 9:
      return 'История языка';
    case 10:
      return 'Практические упражнения';
    case 11:
      return 'Итоговый тест';
    default:
      return `Глава ${id}`;
  }
}
