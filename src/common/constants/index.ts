import pkg from '../../../package.json'

//export const RTTWEB_HOMEPAGE = pkg.homepage

export const RTTWEB_HOST =
  process.env.NODE_ENV === 'production' && !process.env.E2E_BUILD
    ? 'https://app.kangi3d.com'
    : 'http://localhost:3000'

export const RTTWEB_HELP_SHAPES_URL = new URL('/documents/rttweb/shapes', RTTWEB_HOST).toString()
