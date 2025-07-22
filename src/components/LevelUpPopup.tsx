import { FC } from 'react'

interface LevelUpPopupProps {
  level: string
  onClose: () => void
}

const LevelUpPopup: FC<LevelUpPopupProps> = ({ level, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white p-6 rounded-xl text-center space-y-3">
      <div className="text-2xl">🎉 Новый уровень: {level}!</div>
      <p>Вы разблокировали новую главу</p>
      <button onClick={onClose} className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg">Ок</button>
    </div>
  </div>
)

export default LevelUpPopup
