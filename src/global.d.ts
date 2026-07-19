declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
  const content: any;
  export default content;
}

interface ImportMeta {
  readonly env: {
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
    [key: string]: string | undefined;
  };
}
