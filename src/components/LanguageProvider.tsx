'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type LanguageCode = 'vi' | 'en' | 'ja';

type Dict = Record<string, string>;

const dictionaries: Record<LanguageCode, Dict> = {
  vi: {
    'nav.home': 'Trang chủ',
    'nav.about': 'Giới thiệu',
    'nav.projects': 'Dự án',
    'nav.skills': 'Kỹ năng',
    'nav.credentials': 'Chứng chỉ',
    'nav.guestbook': 'Sổ lưu bút',
    'nav.contact': 'Liên hệ',
    'footer.role': 'full-stack web developer',
    'footer.tags': 'ai / automation',
    'footer.handle': '@catkod',
    'cta.projects': 'Xem dự án',
    'cta.cv': 'Mở CV',
    'home.role.lead': 'Tôi xây',
    'home.tagline':
      'Tôi xây full-stack web + AI/automation cho sản phẩm thật — từ giao diện tới database, từ prototype tới deploy.',
    'home.capability.lede':
      'Bốn lĩnh vực tôi kết hợp trong từng dự án. Đây là tóm tắt nhanh, không phải shortcut trang.',
    'home.cap.web': 'Web Core',
    'home.cap.web.title': 'Sản phẩm full-stack',
    'home.cap.web.desc':
      'Giao diện, backend, cơ sở dữ liệu, dashboard, quy trình admin và triển khai production.',
    'home.cap.auto': 'Automation',
    'home.cap.auto.title': 'Hệ thống workflow',
    'home.cap.auto.desc':
      'Các thao tác thủ công trở thành luồng tài liệu, đồng bộ dữ liệu, tích hợp và công cụ nội bộ.',
    'home.cap.ai': 'AI Layer',
    'home.cap.ai.title': 'Pipeline có hỗ trợ AI',
    'home.cap.ai.desc':
      'Phân tích, soạn thảo, tìm kiếm, agent và kiểm tra xoay quanh dữ liệu dự án thật.',
    'home.cap.gis': 'GIS Layer',
    'home.cap.gis.title': 'Hệ thống bản đồ',
    'home.cap.gis.desc':
      'Bản đồ, dữ liệu không gian, GeoJSON / PostGIS và dashboard theo vị trí.',
    'about.title': 'Tôi viết code cho sản phẩm có người dùng thật.',
    'about.bio.1':
      'Mình là Vĩnh (CatKod) — một full-stack developer tập trung vào web, AI và automation. Mình thích những dự án mà phần khó nhất là hiểu đúng vấn đề, không phải viết nhiều dòng code hơn.',
    'about.bio.2':
      'Từ 2023 mình bắt đầu đi sâu vào pipeline AI (RAG, agent workflow, scraping → LLM) và tích hợp chúng vào sản phẩm web thật. Mình làm việc với Next.js, Node, Python và các dịch vụ cloud.',
    'about.focus': 'Hiện đang tập trung',
    'about.focus.1': 'AI agents cho tự động hoá nội dung',
    'about.focus.2': 'Dashboard theo thời gian thực',
    'about.focus.3': 'Web GIS cho bài toán logistics',
    'about.interests': 'Sở thích ngoài code',
    'about.interest.1': 'Viết note kỹ thuật trên blog cá nhân',
    'about.interest.2': 'Open-source các tiện ích CLI',
    'about.interest.3': 'Đọc về GIS, bản đồ và không gian',
    'about.interest.4': 'Cà phê sáng và leo núi cuối tuần',
    'projects.title':
      'Sáu dự án gần đây — mỗi cái đều đi từ prototype đến sản phẩm chạy được.',
    'skills.title': 'Tech stack và mức độ sử dụng thực tế trong 12 tháng qua.',
    'credentials.title':
      'Chứng chỉ, giải thướng và học vấn — đặt theo trình tự thời gian.',
    'guestbook.title': 'Ghé lại đây, để lại một lời chào cho mình nhé.',
    'guestbook.form.name': 'Tên của bạn',
    'guestbook.form.message': 'Lời nhắn',
    'guestbook.form.submit': 'Gửi lời chào',
    'guestbook.empty': 'Chưa có lời chào nào. Hãy là người đầu tiên.',
    'contact.title': 'Có dự án muốn hợp tác? Mình sẽ phản hồi trong 24 giờ.',
    'contact.form.name': 'Tên của bạn',
    'contact.form.email': 'Email',
    'contact.form.message': 'Mô tả ngắn về dự án',
    'contact.form.submit': 'Gửi tin nhắn',
    'contact.success': 'Đã nhận tin nhắn. Mình sẽ phản hồi sớm nhất có thể.',
    'common.placeholder': 'Viết gì đó…',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.credentials': 'Credentials',
    'nav.guestbook': 'Guestbook',
    'nav.contact': 'Contact',
    'footer.role': 'full-stack web developer',
    'footer.tags': 'ai / automation',
    'footer.handle': '@catkod',
    'cta.projects': 'View projects',
    'cta.cv': 'Open CV',
    'home.role.lead': 'I build',
    'home.tagline':
      'I build full-stack web products plus AI and automation, from interface to database, from prototype to deployment.',
    'home.capability.lede':
      'Four areas I combine inside projects. This is a quick summary, not page shortcuts.',
    'home.cap.web': 'Web core',
    'home.cap.web.title': 'Full-stack products',
    'home.cap.web.desc':
      'Interfaces, backend logic, databases, dashboards, admin flows, and deployment.',
    'home.cap.auto': 'Automation',
    'home.cap.auto.title': 'Workflow systems',
    'home.cap.auto.desc':
      'Manual routines become document flows, data sync, integrations, and internal tools.',
    'home.cap.ai': 'AI layer',
    'home.cap.ai.title': 'Assisted pipelines',
    'home.cap.ai.desc':
      'Parsing, drafting, search, agents, and checks around real project data.',
    'home.cap.gis': 'GIS layer',
    'home.cap.gis.title': 'Map-based systems',
    'home.cap.gis.desc':
      'Maps, spatial data, GeoJSON / PostGIS flows, and location-based dashboards.',
    'about.title': 'I write code for products with real users.',
    'about.bio.1':
      "I'm Vĩnh (CatKod) — a full-stack developer focused on web, AI, and automation. I enjoy projects where the hardest part is understanding the problem, not writing more lines of code.",
    'about.bio.2':
      'Since 2023 I have been digging into AI pipelines (RAG, agent workflows, scraping → LLM) and integrating them into real web products. I work with Next.js, Node, Python, and cloud services.',
    'about.focus': 'Currently focusing on',
    'about.focus.1': 'AI agents for content automation',
    'about.focus.2': 'Real-time dashboards',
    'about.focus.3': 'Web GIS for logistics',
    'about.interests': 'Outside of code',
    'about.interest.1': 'Technical notes on personal blog',
    'about.interest.2': 'Open-sourcing CLI utilities',
    'about.interest.3': 'Reading about GIS and spatial data',
    'about.interest.4': 'Morning coffee and weekend hikes',
    'projects.title':
      'Six recent projects — each running from prototype to live product.',
    'skills.title':
      'Tech stack and the level I have actually used in the last 12 months.',
    'credentials.title': 'Certificates, awards and education in chronological order.',
    'guestbook.title': 'Drop a hello for the next sign in.',
    'guestbook.form.name': 'Your name',
    'guestbook.form.message': 'Message',
    'guestbook.form.submit': 'Send hello',
    'guestbook.empty': 'No messages yet. Be the first.',
    'contact.title':
      'Got something to build? I reply within 24 hours.',
    'contact.form.name': 'Your name',
    'contact.form.email': 'Email',
    'contact.form.message': 'Short project brief',
    'contact.form.submit': 'Send message',
    'contact.success': 'Got your message. I will reply as soon as I can.',
    'common.placeholder': 'Write something…',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.about': '自己紹介',
    'nav.projects': 'プロジェクト',
    'nav.skills': 'スキル',
    'nav.credentials': '資格',
    'nav.guestbook': 'ゲストブック',
    'nav.contact': '連絡先',
    'footer.role': 'フルスタックWeb開発者',
    'footer.tags': 'AI / オートメーション',
    'footer.handle': '@catkod',
    'cta.projects': 'プロジェクトを見る',
    'cta.cv': '履歴書を開く',
    'home.role.lead': '私は',
    'home.tagline':
      'インターフェースからデータベースまで、プロトタイプからデプロイまで、AIと自動化を含むフルスタックWeb製品を構築します。',
    'home.capability.lede':
      'プロジェクト内で組み合わせる4つの領域。簡単な要約であり、ページショートカットではありません。',
    'home.cap.web': 'Webコア',
    'home.cap.web.title': 'フルスタック製品',
    'home.cap.web.desc':
      'インターフェース、バックエンド、データベース、ダッシュボード、管理フロー、デプロイ。',
    'home.cap.auto': '自動化',
    'home.cap.auto.title': 'ワークフローシステム',
    'home.cap.auto.desc':
      '手作業がドキュメントフロー、データ同期、インテグレーション、内部ツールになります。',
    'home.cap.ai': 'AIレイヤー',
    'home.cap.ai.title': '支援パイプライン',
    'home.cap.ai.desc':
      '実際のプロジェクトデータに基づく解析、ドラフト、検索、エージェント、チェック。',
    'home.cap.gis': 'GISレイヤー',
    'home.cap.gis.title': 'マップベースシステム',
    'home.cap.gis.desc':
      'マップ、空間データ、GeoJSON / PostGISフロー、位置情報ダッシュボード。',
    'about.title': 'リアルなユーザーのある製品にコードを書きます。',
    'about.bio.1':
      'Vĩnh (CatKod)です。Web、AI、オートメーションに焦点を当てたフルスタック開発者です。最も難しいのはコードを書くことではなく問題を理解することだと思うプロジェクトが好きです。',
    'about.bio.2':
      '2023年からAIパイプライン(RAG、エージェントワークフロー、スクレイピング → LLM)を深く掘り下げ、実際のWeb製品に統合しています。Next.js、Node、Python、クラウドサービスを使います。',
    'about.focus': '今フォーカスしていること',
    'about.focus.1': 'コンテンツ自動化のためのAIエージェント',
    'about.focus.2': 'リアルタイムダッシュボード',
    'about.focus.3': '物流向けのWeb GIS',
    'about.interests': 'コードの外で',
    'about.interest.1': '個人ブログでの技術ノート',
    'about.interest.2': 'CLIユーティリティのオープンソース',
    'about.interest.3': 'GISと空間データについて読む',
    'about.interest.4': '朝のコーヒーと週末のハイキング',
    'projects.title': '最近の6つのプロジェクト — それぞれプロトタイプから動く製品まで。',
    'skills.title': '過去12ヶ月で実際に使ったテックスタックとレベル。',
    'credentials.title': '資格、賞、教育を時系列で。',
    'guestbook.title': '次にサインインするときのために、ひとことを残してください。',
    'guestbook.form.name': 'お名前',
    'guestbook.form.message': 'メッセージ',
    'guestbook.form.submit': '送信',
    'guestbook.empty': 'まだメッセージはありません。最初の一人になりませんか。',
    'contact.title': '一緒に作るものはありますか？24時間以内に返信します。',
    'contact.form.name': 'お名前',
    'contact.form.email': 'メール',
    'contact.form.message': 'プロジェクトの簡単な説明',
    'contact.form.submit': 'メッセージを送信',
    'contact.success': 'メッセージを受け取りました。できるだけ早く返信します。',
    'common.placeholder': '何か書いてください…',
  },
};

type Ctx = {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: keyof Dict | string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = 'catkod.lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('vi');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (stored && stored in dictionaries) setLangState(stored);
    } catch {
      /* noop */
    }
  }, []);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang] ?? dictionaries.vi;
      return dict[key] ?? dictionaries.vi[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}