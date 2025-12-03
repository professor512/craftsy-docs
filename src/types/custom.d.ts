// src/types/custom.d.ts
declare module "lowlight" {
  const lowlight: any;
  export { lowlight };
  export default lowlight;
}

// If you still get path-specific imports, add these too:
declare module "lowlight/lib/core" {
  const lowlight: any;
  export { lowlight };
  export default lowlight;
}

declare module "highlight.js/lib/languages/javascript" {
  const javascript: any;
  export default javascript;
}
declare module "highlight.js/lib/languages/xml" {
  const xml: any;
  export default xml;
}
