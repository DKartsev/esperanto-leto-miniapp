import { type FC } from 'react'
import MagicLinkLogin, { type MagicLinkLoginProps } from './MagicLinkLogin'

export interface LoginByEmailProps extends Omit<MagicLinkLoginProps, 'title' | 'buttonLabel'> {}

const LoginByEmail: FC<LoginByEmailProps> = (props) => (
  <MagicLinkLogin {...props} title="Вход по ссылке" buttonLabel="Войти" />
)

export default LoginByEmail
