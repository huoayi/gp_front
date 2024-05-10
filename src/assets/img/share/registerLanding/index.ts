const modules = import.meta.glob('./*.webp', { eager: true });

const images: { [name: string]: any } = {};

for (let key in modules) {
  let name = key.replace(/(\.\/|\.webp)/g, '');
  images[name] = (modules[key] as any).default;
}

export { images };
