import { FC } from 'react'
import { User, Pencil, Check, X } from 'lucide-react'

interface AccountHeaderProps {
  username: string
  email?: string
  isEditing: boolean
  newUsername: string
  onEdit: () => void
  onChange: (val: string) => void
  onSave: () => void
  onCancel: () => void
}

const AccountHeader: FC<AccountHeaderProps> = ({
  username,
  email,
  isEditing,
  newUsername,
  onEdit,
  onChange,
  onSave,
  onCancel
}) => (
  <div className="flex items-center space-x-4">
    <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
      <User className="w-8 h-8 text-white" />
    </div>
    <div>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input value={newUsername} onChange={e => onChange(e.target.value)} className="border rounded-lg px-2 py-1 text-sm" />
          <button onClick={onSave} className="text-emerald-600"><Check className="w-5 h-5" /></button>
          <button onClick={onCancel} className="text-red-600"><X className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-emerald-900">{username}</h1>
          <button onClick={onEdit} className="text-emerald-600 hover:text-emerald-800"><Pencil className="w-4 h-4" /></button>
        </div>
      )}
      {email && <p className="text-emerald-700">{email}</p>}
    </div>
  </div>
)

export default AccountHeader
