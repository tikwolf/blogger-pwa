import { defineConfig } from '@/types/config';

export default defineConfig({
  manifest: {
    id: '/',
    name: 'TikWolf',
    short_name: 'TikWolf',
    description: 'منصة TikWolf للتغذية الرياضية، المكملات، الوصفات الصحية، وبرامج التدريب',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#0f0f10',
    theme_color: '#0f0f10',
    display: 'standalone',
    orientation: 'natural',
    scope: '/',
    start_url: '/?utm_source=homescreen',
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'الوصفات',
        short_name: 'وصفات',
        description: 'وصفات صحية عالية البروتين',
        url: '/search/label/وصفات?utm_source=homescreen',
      },
      {
        name: 'برامج تدريب',
        short_name: 'تدريب',
        description: 'برامج تدريبية متكاملة',
        url: '/search/label/برامج تدريب?utm_source=homescreen',
      },
      {
        name: 'دليل التمارين',
        short_name: 'التمارين',
        description: 'مكتبة التمارين الشاملة وطريقة الأداء الصحيح',
        url: '/search/label/دليل التمارين?utm_source=homescreen',
      },
      {
        name: 'دليل الحاسبات',
        short_name: 'الحاسبات',
        description: 'BMI، السعرات، الماكروز، البروتين وأكثر',
        url: '/p/tools-calculators.html?utm_source=homescreen',
      },
    ],
  },

  pwa: {
    logs: true,
  },

  oneSignal: {
    enabled: false,
    appId: '********-****-****-****-************',
    allowLocalhostAsSecureOrigin: true,
  },

  origin: 'https://tikwolf.com',
});
