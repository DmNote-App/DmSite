// CSS 모듈 및 일반 CSS 파일에 대한 타입 정의
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
