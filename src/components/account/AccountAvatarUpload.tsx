import { FC } from 'react'

interface Props {
  onUpload: (file: File) => void
}

const AccountAvatarUpload: FC<Props> = ({ onUpload }) => (
  <div className="mt-2">
    <input type="file" accept="image/*" onChange={e => e.target.files && onUpload(e.target.files[0])} />
  </div>
)

export default AccountAvatarUpload
